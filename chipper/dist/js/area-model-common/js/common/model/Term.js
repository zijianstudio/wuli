// Copyright 2017-2021, University of Colorado Boulder

/**
 * A single mathematical term (the product of a coefficient with a power of x).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Utils from '../../../../dot/js/Utils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonConstants from '../AreaModelCommonConstants.js';
class Term {
  /**
   * @param {number} coefficient
   * @param {number} [power]
   */
  constructor(coefficient, power) {
    // Properly handle 0x. This generally removes a lot of special-cases (e.g. 0x^2 equals 0), and allows things like
    // Polynomial to easily have one term of each power (where if the constant is 0, its power is 0). Also applies to
    // things like sorting by power or how we want things displayed (0, not 0x).
    // See https://github.com/phetsims/area-model-common/issues/6
    if (coefficient === 0) {
      power = 0;
    }

    // The power argument is optional--if not supplied, the power defaults to 0.
    power = power === undefined ? 0 : power;
    assert && assert(typeof coefficient === 'number' && isFinite(coefficient), 'Coefficient only needs to be a finite number');
    assert && assert(typeof power === 'number' && isFinite(power));

    // @public {number}
    this.coefficient = coefficient;

    // @public {number}
    this.power = power;
  }

  /**
   * Term multiplication.
   * @public
   *
   * @param {Term} term
   * @returns {Term}
   */
  times(term) {
    return new Term(this.coefficient * term.coefficient, this.power + term.power);
  }

  /**
   * Equality
   * @public
   *
   * @param {Term} term
   * @returns {boolean}
   */
  equals(term) {
    // Handle floating-point error for common cases. Epsilon guessed at what may be most relevant if this is moved
    // to common code.
    return Utils.equalsEpsilon(this.coefficient, term.coefficient, 1e-7) && this.power === term.power;
  }

  /**
   * Returns a string representation of the term suitable for RichText, but without any signs.
   * @public
   *
   * @returns {string}
   */
  toNoSignRichString() {
    let string = '';
    if (Math.abs(this.coefficient) !== 1 || this.power === 0) {
      string += Utils.toFixedNumber(Math.abs(this.coefficient), 2);
    }
    if (this.power > 0) {
      string += AreaModelCommonConstants.X_VARIABLE_RICH_STRING;
    }
    if (this.power > 1) {
      string += `<sup>${this.power}</sup>`;
    }
    return string;
  }

  /**
   * Returns a string representation of the term suitable for RichText.
   * @public
   *
   * @param {boolean} includeBinaryOperation - If true, assumes we are in a sum and not the first term so includes
   *                                           an initial plus or minus. If false, only a unary minus would be included.
   * @returns {string}
   */
  toRichString(includeBinaryOperation) {
    assert && assert(typeof includeBinaryOperation === 'boolean');
    let string = '';
    if (includeBinaryOperation) {
      if (this.coefficient < 0) {
        string += ` ${MathSymbols.MINUS} `;
      } else {
        string += ` ${MathSymbols.PLUS} `;
      }
    } else {
      if (this.coefficient < 0) {
        string += MathSymbols.UNARY_MINUS;
      }
    }
    string += this.toNoSignRichString();
    return string;
  }

  /**
   * Returns the longest generic term's toRichString (for proper sizing).
   * @public
   *
   * @param {boolean} allowExponents - Whether powers of x can be included
   * @param {number} digitCount - If no powers of x allowed, how many numeric digits can be allowed.
   * @returns {string}
   */
  static getLargestGenericString(allowExponents, digitCount) {
    const digits = _.range(0, digitCount).map(() => AreaModelCommonConstants.MEASURING_CHARACTER).join('');
    if (allowExponents) {
      // The square is an example of an exponent that will increase the height of the displayed string, so we want to
      // include it if exponents are allowed.
      return `${MathSymbols.MINUS + digits}x<sup>2</sup>`;
    } else {
      return MathSymbols.MINUS + digits;
    }
  }

  /**
   * Returns whether the parameter is a Term (or is null)
   * @public
   *
   * @param {*} thing
   * @returns {boolean}
   */
  static isTermOrNull(thing) {
    return thing === null || thing instanceof Term;
  }
}
areaModelCommon.register('Term', Term);
export default Term;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIk1hdGhTeW1ib2xzIiwiYXJlYU1vZGVsQ29tbW9uIiwiQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzIiwiVGVybSIsImNvbnN0cnVjdG9yIiwiY29lZmZpY2llbnQiLCJwb3dlciIsInVuZGVmaW5lZCIsImFzc2VydCIsImlzRmluaXRlIiwidGltZXMiLCJ0ZXJtIiwiZXF1YWxzIiwiZXF1YWxzRXBzaWxvbiIsInRvTm9TaWduUmljaFN0cmluZyIsInN0cmluZyIsIk1hdGgiLCJhYnMiLCJ0b0ZpeGVkTnVtYmVyIiwiWF9WQVJJQUJMRV9SSUNIX1NUUklORyIsInRvUmljaFN0cmluZyIsImluY2x1ZGVCaW5hcnlPcGVyYXRpb24iLCJNSU5VUyIsIlBMVVMiLCJVTkFSWV9NSU5VUyIsImdldExhcmdlc3RHZW5lcmljU3RyaW5nIiwiYWxsb3dFeHBvbmVudHMiLCJkaWdpdENvdW50IiwiZGlnaXRzIiwiXyIsInJhbmdlIiwibWFwIiwiTUVBU1VSSU5HX0NIQVJBQ1RFUiIsImpvaW4iLCJpc1Rlcm1Pck51bGwiLCJ0aGluZyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVGVybS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIHNpbmdsZSBtYXRoZW1hdGljYWwgdGVybSAodGhlIHByb2R1Y3Qgb2YgYSBjb2VmZmljaWVudCB3aXRoIGEgcG93ZXIgb2YgeCkuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IE1hdGhTeW1ib2xzIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYXRoU3ltYm9scy5qcyc7XHJcbmltcG9ydCBhcmVhTW9kZWxDb21tb24gZnJvbSAnLi4vLi4vYXJlYU1vZGVsQ29tbW9uLmpzJztcclxuaW1wb3J0IEFyZWFNb2RlbENvbW1vbkNvbnN0YW50cyBmcm9tICcuLi9BcmVhTW9kZWxDb21tb25Db25zdGFudHMuanMnO1xyXG5cclxuY2xhc3MgVGVybSB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNvZWZmaWNpZW50XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtwb3dlcl1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggY29lZmZpY2llbnQsIHBvd2VyICkge1xyXG4gICAgLy8gUHJvcGVybHkgaGFuZGxlIDB4LiBUaGlzIGdlbmVyYWxseSByZW1vdmVzIGEgbG90IG9mIHNwZWNpYWwtY2FzZXMgKGUuZy4gMHheMiBlcXVhbHMgMCksIGFuZCBhbGxvd3MgdGhpbmdzIGxpa2VcclxuICAgIC8vIFBvbHlub21pYWwgdG8gZWFzaWx5IGhhdmUgb25lIHRlcm0gb2YgZWFjaCBwb3dlciAod2hlcmUgaWYgdGhlIGNvbnN0YW50IGlzIDAsIGl0cyBwb3dlciBpcyAwKS4gQWxzbyBhcHBsaWVzIHRvXHJcbiAgICAvLyB0aGluZ3MgbGlrZSBzb3J0aW5nIGJ5IHBvd2VyIG9yIGhvdyB3ZSB3YW50IHRoaW5ncyBkaXNwbGF5ZWQgKDAsIG5vdCAweCkuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FyZWEtbW9kZWwtY29tbW9uL2lzc3Vlcy82XHJcbiAgICBpZiAoIGNvZWZmaWNpZW50ID09PSAwICkge1xyXG4gICAgICBwb3dlciA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhlIHBvd2VyIGFyZ3VtZW50IGlzIG9wdGlvbmFsLS1pZiBub3Qgc3VwcGxpZWQsIHRoZSBwb3dlciBkZWZhdWx0cyB0byAwLlxyXG4gICAgcG93ZXIgPSAoIHBvd2VyID09PSB1bmRlZmluZWQgPyAwIDogcG93ZXIgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgY29lZmZpY2llbnQgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBjb2VmZmljaWVudCApLFxyXG4gICAgICAnQ29lZmZpY2llbnQgb25seSBuZWVkcyB0byBiZSBhIGZpbml0ZSBudW1iZXInICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHBvd2VyID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggcG93ZXIgKSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn1cclxuICAgIHRoaXMuY29lZmZpY2llbnQgPSBjb2VmZmljaWVudDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9XHJcbiAgICB0aGlzLnBvd2VyID0gcG93ZXI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUZXJtIG11bHRpcGxpY2F0aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VGVybX0gdGVybVxyXG4gICAqIEByZXR1cm5zIHtUZXJtfVxyXG4gICAqL1xyXG4gIHRpbWVzKCB0ZXJtICkge1xyXG4gICAgcmV0dXJuIG5ldyBUZXJtKCB0aGlzLmNvZWZmaWNpZW50ICogdGVybS5jb2VmZmljaWVudCwgdGhpcy5wb3dlciArIHRlcm0ucG93ZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEVxdWFsaXR5XHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUZXJtfSB0ZXJtXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgZXF1YWxzKCB0ZXJtICkge1xyXG4gICAgLy8gSGFuZGxlIGZsb2F0aW5nLXBvaW50IGVycm9yIGZvciBjb21tb24gY2FzZXMuIEVwc2lsb24gZ3Vlc3NlZCBhdCB3aGF0IG1heSBiZSBtb3N0IHJlbGV2YW50IGlmIHRoaXMgaXMgbW92ZWRcclxuICAgIC8vIHRvIGNvbW1vbiBjb2RlLlxyXG4gICAgcmV0dXJuIFV0aWxzLmVxdWFsc0Vwc2lsb24oIHRoaXMuY29lZmZpY2llbnQsIHRlcm0uY29lZmZpY2llbnQsIDFlLTcgKSAmJiB0aGlzLnBvd2VyID09PSB0ZXJtLnBvd2VyO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdGVybSBzdWl0YWJsZSBmb3IgUmljaFRleHQsIGJ1dCB3aXRob3V0IGFueSBzaWducy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIHRvTm9TaWduUmljaFN0cmluZygpIHtcclxuICAgIGxldCBzdHJpbmcgPSAnJztcclxuXHJcbiAgICBpZiAoIE1hdGguYWJzKCB0aGlzLmNvZWZmaWNpZW50ICkgIT09IDEgfHwgdGhpcy5wb3dlciA9PT0gMCApIHtcclxuICAgICAgc3RyaW5nICs9IFV0aWxzLnRvRml4ZWROdW1iZXIoIE1hdGguYWJzKCB0aGlzLmNvZWZmaWNpZW50ICksIDIgKTtcclxuICAgIH1cclxuICAgIGlmICggdGhpcy5wb3dlciA+IDAgKSB7XHJcbiAgICAgIHN0cmluZyArPSBBcmVhTW9kZWxDb21tb25Db25zdGFudHMuWF9WQVJJQUJMRV9SSUNIX1NUUklORztcclxuICAgIH1cclxuICAgIGlmICggdGhpcy5wb3dlciA+IDEgKSB7XHJcbiAgICAgIHN0cmluZyArPSBgPHN1cD4ke3RoaXMucG93ZXJ9PC9zdXA+YDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc3RyaW5nO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdGVybSBzdWl0YWJsZSBmb3IgUmljaFRleHQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBpbmNsdWRlQmluYXJ5T3BlcmF0aW9uIC0gSWYgdHJ1ZSwgYXNzdW1lcyB3ZSBhcmUgaW4gYSBzdW0gYW5kIG5vdCB0aGUgZmlyc3QgdGVybSBzbyBpbmNsdWRlc1xyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuIGluaXRpYWwgcGx1cyBvciBtaW51cy4gSWYgZmFsc2UsIG9ubHkgYSB1bmFyeSBtaW51cyB3b3VsZCBiZSBpbmNsdWRlZC5cclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIHRvUmljaFN0cmluZyggaW5jbHVkZUJpbmFyeU9wZXJhdGlvbiApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBpbmNsdWRlQmluYXJ5T3BlcmF0aW9uID09PSAnYm9vbGVhbicgKTtcclxuXHJcbiAgICBsZXQgc3RyaW5nID0gJyc7XHJcblxyXG4gICAgaWYgKCBpbmNsdWRlQmluYXJ5T3BlcmF0aW9uICkge1xyXG4gICAgICBpZiAoIHRoaXMuY29lZmZpY2llbnQgPCAwICkge1xyXG4gICAgICAgIHN0cmluZyArPSBgICR7TWF0aFN5bWJvbHMuTUlOVVN9IGA7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgc3RyaW5nICs9IGAgJHtNYXRoU3ltYm9scy5QTFVTfSBgO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgaWYgKCB0aGlzLmNvZWZmaWNpZW50IDwgMCApIHtcclxuICAgICAgICBzdHJpbmcgKz0gTWF0aFN5bWJvbHMuVU5BUllfTUlOVVM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdHJpbmcgKz0gdGhpcy50b05vU2lnblJpY2hTdHJpbmcoKTtcclxuXHJcbiAgICByZXR1cm4gc3RyaW5nO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbG9uZ2VzdCBnZW5lcmljIHRlcm0ncyB0b1JpY2hTdHJpbmcgKGZvciBwcm9wZXIgc2l6aW5nKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFsbG93RXhwb25lbnRzIC0gV2hldGhlciBwb3dlcnMgb2YgeCBjYW4gYmUgaW5jbHVkZWRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZGlnaXRDb3VudCAtIElmIG5vIHBvd2VycyBvZiB4IGFsbG93ZWQsIGhvdyBtYW55IG51bWVyaWMgZGlnaXRzIGNhbiBiZSBhbGxvd2VkLlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgc3RhdGljIGdldExhcmdlc3RHZW5lcmljU3RyaW5nKCBhbGxvd0V4cG9uZW50cywgZGlnaXRDb3VudCApIHtcclxuICAgIGNvbnN0IGRpZ2l0cyA9IF8ucmFuZ2UoIDAsIGRpZ2l0Q291bnQgKS5tYXAoICgpID0+IEFyZWFNb2RlbENvbW1vbkNvbnN0YW50cy5NRUFTVVJJTkdfQ0hBUkFDVEVSICkuam9pbiggJycgKTtcclxuXHJcbiAgICBpZiAoIGFsbG93RXhwb25lbnRzICkge1xyXG4gICAgICAvLyBUaGUgc3F1YXJlIGlzIGFuIGV4YW1wbGUgb2YgYW4gZXhwb25lbnQgdGhhdCB3aWxsIGluY3JlYXNlIHRoZSBoZWlnaHQgb2YgdGhlIGRpc3BsYXllZCBzdHJpbmcsIHNvIHdlIHdhbnQgdG9cclxuICAgICAgLy8gaW5jbHVkZSBpdCBpZiBleHBvbmVudHMgYXJlIGFsbG93ZWQuXHJcbiAgICAgIHJldHVybiBgJHtNYXRoU3ltYm9scy5NSU5VUyArIGRpZ2l0c314PHN1cD4yPC9zdXA+YDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gTWF0aFN5bWJvbHMuTUlOVVMgKyBkaWdpdHM7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHBhcmFtZXRlciBpcyBhIFRlcm0gKG9yIGlzIG51bGwpXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHsqfSB0aGluZ1xyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIHN0YXRpYyBpc1Rlcm1Pck51bGwoIHRoaW5nICkge1xyXG4gICAgcmV0dXJuIHRoaW5nID09PSBudWxsIHx8IHRoaW5nIGluc3RhbmNlb2YgVGVybTtcclxuICB9XHJcbn1cclxuXHJcbmFyZWFNb2RlbENvbW1vbi5yZWdpc3RlciggJ1Rlcm0nLCBUZXJtICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUZXJtOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUN0RCxPQUFPQyx3QkFBd0IsTUFBTSxnQ0FBZ0M7QUFFckUsTUFBTUMsSUFBSSxDQUFDO0VBQ1Q7QUFDRjtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsV0FBVyxFQUFFQyxLQUFLLEVBQUc7SUFDaEM7SUFDQTtJQUNBO0lBQ0E7SUFDQSxJQUFLRCxXQUFXLEtBQUssQ0FBQyxFQUFHO01BQ3ZCQyxLQUFLLEdBQUcsQ0FBQztJQUNYOztJQUVBO0lBQ0FBLEtBQUssR0FBS0EsS0FBSyxLQUFLQyxTQUFTLEdBQUcsQ0FBQyxHQUFHRCxLQUFPO0lBRTNDRSxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPSCxXQUFXLEtBQUssUUFBUSxJQUFJSSxRQUFRLENBQUVKLFdBQVksQ0FBQyxFQUMxRSw4Q0FBK0MsQ0FBQztJQUVsREcsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT0YsS0FBSyxLQUFLLFFBQVEsSUFBSUcsUUFBUSxDQUFFSCxLQUFNLENBQUUsQ0FBQzs7SUFFbEU7SUFDQSxJQUFJLENBQUNELFdBQVcsR0FBR0EsV0FBVzs7SUFFOUI7SUFDQSxJQUFJLENBQUNDLEtBQUssR0FBR0EsS0FBSztFQUNwQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSSxLQUFLQSxDQUFFQyxJQUFJLEVBQUc7SUFDWixPQUFPLElBQUlSLElBQUksQ0FBRSxJQUFJLENBQUNFLFdBQVcsR0FBR00s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