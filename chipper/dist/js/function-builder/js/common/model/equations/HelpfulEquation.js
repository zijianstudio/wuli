// Copyright 2016-2023, University of Colorado Boulder

/**
 * For lack of a better name, this equation format was referred to as the "helpful" format in design meetings.
 * It is PhET-specific, and does not correspond to a standard mathematical format. The intent is to create a clear
 * association with the functions that are in the builder, and provide a "bridge" to the slope-intercept format.
 * For details, see the format specification in:
 * https://github.com/phetsims/function-builder/blob/master/doc/equation-formats.md
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../../phet-core/js/merge.js';
import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import functionBuilder from '../../../functionBuilder.js';
import FBSymbols from '../../FBSymbols.js';
import Divide from '../functions/Divide.js';
import Plus from '../functions/Plus.js';
import Times from '../functions/Times.js';
import RationalNumber from '../RationalNumber.js';

// constants
const ZERO = RationalNumber.withInteger(0);
export default class HelpfulEquation {
  /**
   * @param {MathFunction[]} mathFunctions - the set of linear functions, in the order that they are applied
   * @param {Object} [options]
   */
  constructor(mathFunctions, options) {
    options = merge({
      xSymbol: FBSymbols.X // {string} string to use for input symbol, appears only in toString
    }, options);
    const stack = []; // {MathFunction[]}

    let previousFunction = null; // {MathFunction|null}

    mathFunctions.forEach(currentFunction => {
      // to improve readability
      const currentOperator = currentFunction.operator;
      const currentOperand = currentFunction.operandProperty.get();
      const previousOperator = previousFunction ? previousFunction.operator : null;
      const previousOperand = previousFunction ? previousFunction.operandProperty.get() : null;
      if (currentOperator === FBSymbols.PLUS || currentOperator === FBSymbols.MINUS) {
        if (currentOperand === 0) {
          // ignore plus or minus zero
        } else if (stack.length !== 0 && (previousOperator === FBSymbols.PLUS || previousOperator === FBSymbols.MINUS)) {
          // collapse adjacent plus and minus
          stack.pop();
          const rationalNumber = currentFunction.applyFunction(previousFunction.applyFunction(ZERO)); // {RandomNumber}
          if (rationalNumber.valueOf() !== 0) {
            stack.push(new Plus({
              operand: rationalNumber.valueOf(),
              operandRange: null // disable range checking
            }));
          }
        } else {
          stack.push(currentFunction);
        }
      } else if (currentOperator === FBSymbols.TIMES) {
        if (previousOperator === FBSymbols.TIMES) {
          // collapse adjacent times
          stack.pop();
          stack.push(new Times({
            operand: previousOperand * currentOperand,
            operandRange: null
          }));
        } else {
          stack.push(currentFunction);
        }
      } else if (currentOperator === FBSymbols.DIVIDE) {
        assert && assert(currentOperand !== 0, 'divide by zero is not supported');
        if (previousOperator === FBSymbols.DIVIDE) {
          // collapse adjacent divide
          stack.pop();
          stack.push(new Divide({
            operand: previousOperand * currentOperand,
            operandRange: null
          }));
        } else {
          stack.push(currentFunction);
        }
      } else {
        throw new Error(`invalid operator: ${currentOperator}`);
      }
      if (stack.length > 0) {
        previousFunction = stack[stack.length - 1];
      } else {
        previousFunction = null;
      }
    });

    // @private
    this.xSymbol = options.xSymbol; // {string}

    // @public
    this.mathFunctions = stack; // {MathFunction[]}
  }

  /**
   * String representation, for debugging. Do not rely on format!
   * Note that the logic flow herein is similar to HelpfulEquationNode's constructor, but constructs a string
   * instead of a Node, and doesn't check logic in case we need to see a malformed equation.
   *
   * @returns {string}
   * @public
   */
  toString() {
    let equation = null; // {string}
    let i = 0; // {number}

    if (this.mathFunctions.length === 0) {
      // x
      equation = this.xSymbol;
    } else {
      // local vars to improve readability
      let currentFunction = null; // {MathFunction}
      let currentOperator = null; // {string}
      let currentOperand = null; // {number}

      equation = this.xSymbol;
      for (i = 0; i < this.mathFunctions.length; i++) {
        currentFunction = this.mathFunctions[i];
        currentOperator = currentFunction.operator;
        currentOperand = currentFunction.operandProperty.get().valueOf();
        if (currentOperator === FBSymbols.PLUS) {
          // eg: 2x + 3
          equation = StringUtils.format('{0} {1} {2}', equation, currentOperand >= 0 ? FBSymbols.PLUS : FBSymbols.MINUS, Math.abs(currentOperand));
        } else if (currentOperator === FBSymbols.MINUS) {
          // eg: 2x - 3
          equation = StringUtils.format('{0} {1} {2}', equation, currentOperand >= 0 ? FBSymbols.MINUS : FBSymbols.PLUS, Math.abs(currentOperand));
        } else if (currentOperator === FBSymbols.TIMES) {
          if (equation === this.xSymbol) {
            // eg: 3x
            equation = StringUtils.format('{0}{1}', currentOperand, equation);
          } else {
            // eg: 2(x + 2)
            equation = StringUtils.format('{0}({1})', currentOperand, equation);
          }
        } else if (currentOperator === FBSymbols.DIVIDE) {
          if (equation !== '0') {
            // eq: [2x + 1]/3
            // square brackets denote a numerator
            equation = StringUtils.format('[{0}]/{1}', equation, currentOperand);
          }
        } else {
          throw new Error(`invalid operator: ${currentOperator}`);
        }
      }
    }
    return equation;
  }
}
functionBuilder.register('HelpfulEquation', HelpfulEquation);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlN0cmluZ1V0aWxzIiwiZnVuY3Rpb25CdWlsZGVyIiwiRkJTeW1ib2xzIiwiRGl2aWRlIiwiUGx1cyIsIlRpbWVzIiwiUmF0aW9uYWxOdW1iZXIiLCJaRVJPIiwid2l0aEludGVnZXIiLCJIZWxwZnVsRXF1YXRpb24iLCJjb25zdHJ1Y3RvciIsIm1hdGhGdW5jdGlvbnMiLCJvcHRpb25zIiwieFN5bWJvbCIsIlgiLCJzdGFjayIsInByZXZpb3VzRnVuY3Rpb24iLCJmb3JFYWNoIiwiY3VycmVudEZ1bmN0aW9uIiwiY3VycmVudE9wZXJhdG9yIiwib3BlcmF0b3IiLCJjdXJyZW50T3BlcmFuZCIsIm9wZXJhbmRQcm9wZXJ0eSIsImdldCIsInByZXZpb3VzT3BlcmF0b3IiLCJwcmV2aW91c09wZXJhbmQiLCJQTFVTIiwiTUlOVVMiLCJsZW5ndGgiLCJwb3AiLCJyYXRpb25hbE51bWJlciIsImFwcGx5RnVuY3Rpb24iLCJ2YWx1ZU9mIiwicHVzaCIsIm9wZXJhbmQiLCJvcGVyYW5kUmFuZ2UiLCJUSU1FUyIsIkRJVklERSIsImFzc2VydCIsIkVycm9yIiwidG9TdHJpbmciLCJlcXVhdGlvbiIsImkiLCJmb3JtYXQiLCJNYXRoIiwiYWJzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJIZWxwZnVsRXF1YXRpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRm9yIGxhY2sgb2YgYSBiZXR0ZXIgbmFtZSwgdGhpcyBlcXVhdGlvbiBmb3JtYXQgd2FzIHJlZmVycmVkIHRvIGFzIHRoZSBcImhlbHBmdWxcIiBmb3JtYXQgaW4gZGVzaWduIG1lZXRpbmdzLlxyXG4gKiBJdCBpcyBQaEVULXNwZWNpZmljLCBhbmQgZG9lcyBub3QgY29ycmVzcG9uZCB0byBhIHN0YW5kYXJkIG1hdGhlbWF0aWNhbCBmb3JtYXQuIFRoZSBpbnRlbnQgaXMgdG8gY3JlYXRlIGEgY2xlYXJcclxuICogYXNzb2NpYXRpb24gd2l0aCB0aGUgZnVuY3Rpb25zIHRoYXQgYXJlIGluIHRoZSBidWlsZGVyLCBhbmQgcHJvdmlkZSBhIFwiYnJpZGdlXCIgdG8gdGhlIHNsb3BlLWludGVyY2VwdCBmb3JtYXQuXHJcbiAqIEZvciBkZXRhaWxzLCBzZWUgdGhlIGZvcm1hdCBzcGVjaWZpY2F0aW9uIGluOlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZnVuY3Rpb24tYnVpbGRlci9ibG9iL21hc3Rlci9kb2MvZXF1YXRpb24tZm9ybWF0cy5tZFxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IGZ1bmN0aW9uQnVpbGRlciBmcm9tICcuLi8uLi8uLi9mdW5jdGlvbkJ1aWxkZXIuanMnO1xyXG5pbXBvcnQgRkJTeW1ib2xzIGZyb20gJy4uLy4uL0ZCU3ltYm9scy5qcyc7XHJcbmltcG9ydCBEaXZpZGUgZnJvbSAnLi4vZnVuY3Rpb25zL0RpdmlkZS5qcyc7XHJcbmltcG9ydCBQbHVzIGZyb20gJy4uL2Z1bmN0aW9ucy9QbHVzLmpzJztcclxuaW1wb3J0IFRpbWVzIGZyb20gJy4uL2Z1bmN0aW9ucy9UaW1lcy5qcyc7XHJcbmltcG9ydCBSYXRpb25hbE51bWJlciBmcm9tICcuLi9SYXRpb25hbE51bWJlci5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgWkVSTyA9IFJhdGlvbmFsTnVtYmVyLndpdGhJbnRlZ2VyKCAwICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIZWxwZnVsRXF1YXRpb24ge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge01hdGhGdW5jdGlvbltdfSBtYXRoRnVuY3Rpb25zIC0gdGhlIHNldCBvZiBsaW5lYXIgZnVuY3Rpb25zLCBpbiB0aGUgb3JkZXIgdGhhdCB0aGV5IGFyZSBhcHBsaWVkXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtYXRoRnVuY3Rpb25zLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICB4U3ltYm9sOiBGQlN5bWJvbHMuWCAvLyB7c3RyaW5nfSBzdHJpbmcgdG8gdXNlIGZvciBpbnB1dCBzeW1ib2wsIGFwcGVhcnMgb25seSBpbiB0b1N0cmluZ1xyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHN0YWNrID0gW107IC8vIHtNYXRoRnVuY3Rpb25bXX1cclxuXHJcbiAgICBsZXQgcHJldmlvdXNGdW5jdGlvbiA9IG51bGw7IC8vIHtNYXRoRnVuY3Rpb258bnVsbH1cclxuXHJcbiAgICBtYXRoRnVuY3Rpb25zLmZvckVhY2goIGN1cnJlbnRGdW5jdGlvbiA9PiB7XHJcblxyXG4gICAgICAvLyB0byBpbXByb3ZlIHJlYWRhYmlsaXR5XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRPcGVyYXRvciA9IGN1cnJlbnRGdW5jdGlvbi5vcGVyYXRvcjtcclxuICAgICAgY29uc3QgY3VycmVudE9wZXJhbmQgPSBjdXJyZW50RnVuY3Rpb24ub3BlcmFuZFByb3BlcnR5LmdldCgpO1xyXG4gICAgICBjb25zdCBwcmV2aW91c09wZXJhdG9yID0gcHJldmlvdXNGdW5jdGlvbiA/IHByZXZpb3VzRnVuY3Rpb24ub3BlcmF0b3IgOiBudWxsO1xyXG4gICAgICBjb25zdCBwcmV2aW91c09wZXJhbmQgPSBwcmV2aW91c0Z1bmN0aW9uID8gcHJldmlvdXNGdW5jdGlvbi5vcGVyYW5kUHJvcGVydHkuZ2V0KCkgOiBudWxsO1xyXG5cclxuICAgICAgaWYgKCBjdXJyZW50T3BlcmF0b3IgPT09IEZCU3ltYm9scy5QTFVTIHx8IGN1cnJlbnRPcGVyYXRvciA9PT0gRkJTeW1ib2xzLk1JTlVTICkge1xyXG5cclxuICAgICAgICBpZiAoIGN1cnJlbnRPcGVyYW5kID09PSAwICkge1xyXG4gICAgICAgICAgLy8gaWdub3JlIHBsdXMgb3IgbWludXMgemVyb1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggKCBzdGFjay5sZW5ndGggIT09IDAgKSAmJiAoIHByZXZpb3VzT3BlcmF0b3IgPT09IEZCU3ltYm9scy5QTFVTIHx8IHByZXZpb3VzT3BlcmF0b3IgPT09IEZCU3ltYm9scy5NSU5VUyApICkge1xyXG5cclxuICAgICAgICAgIC8vIGNvbGxhcHNlIGFkamFjZW50IHBsdXMgYW5kIG1pbnVzXHJcbiAgICAgICAgICBzdGFjay5wb3AoKTtcclxuXHJcbiAgICAgICAgICBjb25zdCByYXRpb25hbE51bWJlciA9IGN1cnJlbnRGdW5jdGlvbi5hcHBseUZ1bmN0aW9uKCBwcmV2aW91c0Z1bmN0aW9uLmFwcGx5RnVuY3Rpb24oIFpFUk8gKSApOyAvLyB7UmFuZG9tTnVtYmVyfVxyXG4gICAgICAgICAgaWYgKCByYXRpb25hbE51bWJlci52YWx1ZU9mKCkgIT09IDAgKSB7XHJcbiAgICAgICAgICAgIHN0YWNrLnB1c2goIG5ldyBQbHVzKCB7XHJcbiAgICAgICAgICAgICAgb3BlcmFuZDogcmF0aW9uYWxOdW1iZXIudmFsdWVPZigpLFxyXG4gICAgICAgICAgICAgIG9wZXJhbmRSYW5nZTogbnVsbCAvLyBkaXNhYmxlIHJhbmdlIGNoZWNraW5nXHJcbiAgICAgICAgICAgIH0gKSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHN0YWNrLnB1c2goIGN1cnJlbnRGdW5jdGlvbiApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggY3VycmVudE9wZXJhdG9yID09PSBGQlN5bWJvbHMuVElNRVMgKSB7XHJcblxyXG4gICAgICAgIGlmICggcHJldmlvdXNPcGVyYXRvciA9PT0gRkJTeW1ib2xzLlRJTUVTICkge1xyXG5cclxuICAgICAgICAgIC8vIGNvbGxhcHNlIGFkamFjZW50IHRpbWVzXHJcbiAgICAgICAgICBzdGFjay5wb3AoKTtcclxuICAgICAgICAgIHN0YWNrLnB1c2goIG5ldyBUaW1lcygge1xyXG4gICAgICAgICAgICBvcGVyYW5kOiBwcmV2aW91c09wZXJhbmQgKiBjdXJyZW50T3BlcmFuZCxcclxuICAgICAgICAgICAgb3BlcmFuZFJhbmdlOiBudWxsXHJcbiAgICAgICAgICB9ICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBzdGFjay5wdXNoKCBjdXJyZW50RnVuY3Rpb24gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGN1cnJlbnRPcGVyYXRvciA9PT0gRkJTeW1ib2xzLkRJVklERSApIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjdXJyZW50T3BlcmFuZCAhPT0gMCwgJ2RpdmlkZSBieSB6ZXJvIGlzIG5vdCBzdXBwb3J0ZWQnICk7XHJcblxyXG4gICAgICAgIGlmICggcHJldmlvdXNPcGVyYXRvciA9PT0gRkJTeW1ib2xzLkRJVklERSApIHtcclxuXHJcbiAgICAgICAgICAvLyBjb2xsYXBzZSBhZGphY2VudCBkaXZpZGVcclxuICAgICAgICAgIHN0YWNrLnBvcCgpO1xyXG4gICAgICAgICAgc3RhY2sucHVzaCggbmV3IERpdmlkZSgge1xyXG4gICAgICAgICAgICBvcGVyYW5kOiBwcmV2aW91c09wZXJhbmQgKiBjdXJyZW50T3BlcmFuZCxcclxuICAgICAgICAgICAgb3BlcmFuZFJhbmdlOiBudWxsXHJcbiAgICAgICAgICB9ICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBzdGFjay5wdXNoKCBjdXJyZW50RnVuY3Rpb24gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgaW52YWxpZCBvcGVyYXRvcjogJHtjdXJyZW50T3BlcmF0b3J9YCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIHN0YWNrLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgICAgcHJldmlvdXNGdW5jdGlvbiA9IHN0YWNrWyBzdGFjay5sZW5ndGggLSAxIF07XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgcHJldmlvdXNGdW5jdGlvbiA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy54U3ltYm9sID0gb3B0aW9ucy54U3ltYm9sOyAvLyB7c3RyaW5nfVxyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMubWF0aEZ1bmN0aW9ucyA9IHN0YWNrOyAvLyB7TWF0aEZ1bmN0aW9uW119XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdHJpbmcgcmVwcmVzZW50YXRpb24sIGZvciBkZWJ1Z2dpbmcuIERvIG5vdCByZWx5IG9uIGZvcm1hdCFcclxuICAgKiBOb3RlIHRoYXQgdGhlIGxvZ2ljIGZsb3cgaGVyZWluIGlzIHNpbWlsYXIgdG8gSGVscGZ1bEVxdWF0aW9uTm9kZSdzIGNvbnN0cnVjdG9yLCBidXQgY29uc3RydWN0cyBhIHN0cmluZ1xyXG4gICAqIGluc3RlYWQgb2YgYSBOb2RlLCBhbmQgZG9lc24ndCBjaGVjayBsb2dpYyBpbiBjYXNlIHdlIG5lZWQgdG8gc2VlIGEgbWFsZm9ybWVkIGVxdWF0aW9uLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdG9TdHJpbmcoKSB7XHJcblxyXG4gICAgbGV0IGVxdWF0aW9uID0gbnVsbDsgLy8ge3N0cmluZ31cclxuICAgIGxldCBpID0gMDsgLy8ge251bWJlcn1cclxuXHJcbiAgICBpZiAoIHRoaXMubWF0aEZ1bmN0aW9ucy5sZW5ndGggPT09IDAgKSB7XHJcblxyXG4gICAgICAvLyB4XHJcbiAgICAgIGVxdWF0aW9uID0gdGhpcy54U3ltYm9sO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBsb2NhbCB2YXJzIHRvIGltcHJvdmUgcmVhZGFiaWxpdHlcclxuICAgICAgbGV0IGN1cnJlbnRGdW5jdGlvbiA9IG51bGw7IC8vIHtNYXRoRnVuY3Rpb259XHJcbiAgICAgIGxldCBjdXJyZW50T3BlcmF0b3IgPSBudWxsOyAvLyB7c3RyaW5nfVxyXG4gICAgICBsZXQgY3VycmVudE9wZXJhbmQgPSBudWxsOyAvLyB7bnVtYmVyfVxyXG5cclxuICAgICAgZXF1YXRpb24gPSB0aGlzLnhTeW1ib2w7XHJcblxyXG4gICAgICBmb3IgKCBpID0gMDsgaSA8IHRoaXMubWF0aEZ1bmN0aW9ucy5sZW5ndGg7IGkrKyApIHtcclxuXHJcbiAgICAgICAgY3VycmVudEZ1bmN0aW9uID0gdGhpcy5tYXRoRnVuY3Rpb25zWyBpIF07XHJcbiAgICAgICAgY3VycmVudE9wZXJhdG9yID0gY3VycmVudEZ1bmN0aW9uLm9wZXJhdG9yO1xyXG4gICAgICAgIGN1cnJlbnRPcGVyYW5kID0gY3VycmVudEZ1bmN0aW9uLm9wZXJhbmRQcm9wZXJ0eS5nZXQoKS52YWx1ZU9mKCk7XHJcblxyXG4gICAgICAgIGlmICggY3VycmVudE9wZXJhdG9yID09PSBGQlN5bWJvbHMuUExVUyApIHtcclxuXHJcbiAgICAgICAgICAvLyBlZzogMnggKyAzXHJcbiAgICAgICAgICBlcXVhdGlvbiA9IFN0cmluZ1V0aWxzLmZvcm1hdCggJ3swfSB7MX0gezJ9JywgZXF1YXRpb24sXHJcbiAgICAgICAgICAgICggY3VycmVudE9wZXJhbmQgPj0gMCA/IEZCU3ltYm9scy5QTFVTIDogRkJTeW1ib2xzLk1JTlVTICksIE1hdGguYWJzKCBjdXJyZW50T3BlcmFuZCApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBjdXJyZW50T3BlcmF0b3IgPT09IEZCU3ltYm9scy5NSU5VUyApIHtcclxuXHJcbiAgICAgICAgICAvLyBlZzogMnggLSAzXHJcbiAgICAgICAgICBlcXVhdGlvbiA9IFN0cmluZ1V0aWxzLmZvcm1hdCggJ3swfSB7MX0gezJ9JywgZXF1YXRpb24sXHJcbiAgICAgICAgICAgICggY3VycmVudE9wZXJhbmQgPj0gMCA/IEZCU3ltYm9scy5NSU5VUyA6IEZCU3ltYm9scy5QTFVTICksIE1hdGguYWJzKCBjdXJyZW50T3BlcmFuZCApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBjdXJyZW50T3BlcmF0b3IgPT09IEZCU3ltYm9scy5USU1FUyApIHtcclxuICAgICAgICAgIGlmICggZXF1YXRpb24gPT09IHRoaXMueFN5bWJvbCApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGVnOiAzeFxyXG4gICAgICAgICAgICBlcXVhdGlvbiA9IFN0cmluZ1V0aWxzLmZvcm1hdCggJ3swfXsxfScsIGN1cnJlbnRPcGVyYW5kLCBlcXVhdGlvbiApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBlZzogMih4ICsgMilcclxuICAgICAgICAgICAgZXF1YXRpb24gPSBTdHJpbmdVdGlscy5mb3JtYXQoICd7MH0oezF9KScsIGN1cnJlbnRPcGVyYW5kLCBlcXVhdGlvbiApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggY3VycmVudE9wZXJhdG9yID09PSBGQlN5bWJvbHMuRElWSURFICkge1xyXG4gICAgICAgICAgaWYgKCBlcXVhdGlvbiAhPT0gJzAnICkge1xyXG5cclxuICAgICAgICAgICAgLy8gZXE6IFsyeCArIDFdLzNcclxuICAgICAgICAgICAgLy8gc3F1YXJlIGJyYWNrZXRzIGRlbm90ZSBhIG51bWVyYXRvclxyXG4gICAgICAgICAgICBlcXVhdGlvbiA9IFN0cmluZ1V0aWxzLmZvcm1hdCggJ1t7MH1dL3sxfScsIGVxdWF0aW9uLCBjdXJyZW50T3BlcmFuZCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggYGludmFsaWQgb3BlcmF0b3I6ICR7Y3VycmVudE9wZXJhdG9yfWAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZXF1YXRpb247XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbkJ1aWxkZXIucmVnaXN0ZXIoICdIZWxwZnVsRXF1YXRpb24nLCBIZWxwZnVsRXF1YXRpb24gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sc0NBQXNDO0FBQ3hELE9BQU9DLFdBQVcsTUFBTSxrREFBa0Q7QUFDMUUsT0FBT0MsZUFBZSxNQUFNLDZCQUE2QjtBQUN6RCxPQUFPQyxTQUFTLE1BQU0sb0JBQW9CO0FBQzFDLE9BQU9DLE1BQU0sTUFBTSx3QkFBd0I7QUFDM0MsT0FBT0MsSUFBSSxNQUFNLHNCQUFzQjtBQUN2QyxPQUFPQyxLQUFLLE1BQU0sdUJBQXVCO0FBQ3pDLE9BQU9DLGNBQWMsTUFBTSxzQkFBc0I7O0FBRWpEO0FBQ0EsTUFBTUMsSUFBSSxHQUFHRCxjQUFjLENBQUNFLFdBQVcsQ0FBRSxDQUFFLENBQUM7QUFFNUMsZUFBZSxNQUFNQyxlQUFlLENBQUM7RUFFbkM7QUFDRjtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsYUFBYSxFQUFFQyxPQUFPLEVBQUc7SUFFcENBLE9BQU8sR0FBR2IsS0FBSyxDQUFFO01BQ2ZjLE9BQU8sRUFBRVgsU0FBUyxDQUFDWSxDQUFDLENBQUM7SUFDdkIsQ0FBQyxFQUFFRixPQUFRLENBQUM7SUFFWixNQUFNRyxLQUFLLEdBQUcsRUFBRSxDQUFD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