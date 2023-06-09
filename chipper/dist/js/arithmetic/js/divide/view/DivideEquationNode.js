// Copyright 2014-2022, University of Colorado Boulder

/**
 * Equation node for 'divide' screen in the Arithmetic simulation.
 *
 * @author Andrey Zelenkov (MLearner)
 */

import arithmetic from '../../arithmetic.js';
import GameState from '../../common/model/GameState.js';
import EquationNode from '../../common/view/EquationNode.js';
class DivideEquationNode extends EquationNode {
  /**
   * @param {Property} stateProperty - State of game property.
   * @param {Property} multiplicandProperty - Property necessary for creating multiplicand input.
   * @param {Property} multiplierProperty - Property necessary for creating multiplier input.
   * @param {Property} productProperty - Property necessary for creating product input.
   * @param {Property} inputProperty - Input property.
   * @param {Property} activeInputProperty - Link to active input.
   *
   */
  constructor(stateProperty, multiplicandProperty, multiplierProperty, productProperty, inputProperty, activeInputProperty) {
    super(multiplicandProperty, multiplierProperty, productProperty);

    // If the input value changes, it means that the user entered something, so put it in the appropriate equation node.
    inputProperty.lazyLink(inputString => {
      const inputStringToNumber = inputString ? Number(inputString) : '';
      if (activeInputProperty.get() === 'multiplicand') {
        multiplicandProperty.set(inputStringToNumber);
      } else if (activeInputProperty.get() === 'multiplier') {
        multiplierProperty.set(inputStringToNumber);
      }
    });
    const updateFocus = () => {
      if (stateProperty.value === GameState.AWAITING_USER_INPUT) {
        this.multiplierInput.setFocus(activeInputProperty.value === 'multiplier');
        this.multiplicandInput.setFocus(activeInputProperty.value === 'multiplicand');
      } else {
        // Not awaiting user input, so neither input gets focus.
        this.multiplierInput.setFocus(false);
        this.multiplicandInput.setFocus(false);
      }
    };
    activeInputProperty.link(activeInput => {
      if (activeInput === 'multiplier') {
        this.multiplierInput.clear();
      } else if (activeInput === 'multiplicand') {
        this.multiplicandInput.clear();
      }
      this.multiplicandInput.setInteractiveAppearance(activeInput === 'multiplicand');
      this.multiplierInput.setInteractiveAppearance(activeInput === 'multiplier');
      updateFocus();
    });
    stateProperty.link(state => {
      // Display a not equal sign if the user input and incorrect answer.
      this.setShowEqual(state !== GameState.DISPLAYING_INCORRECT_ANSWER_FEEDBACK);
      updateFocus();
    });
  }
}
arithmetic.register('DivideEquationNode', DivideEquationNode);
export default DivideEquationNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhcml0aG1ldGljIiwiR2FtZVN0YXRlIiwiRXF1YXRpb25Ob2RlIiwiRGl2aWRlRXF1YXRpb25Ob2RlIiwiY29uc3RydWN0b3IiLCJzdGF0ZVByb3BlcnR5IiwibXVsdGlwbGljYW5kUHJvcGVydHkiLCJtdWx0aXBsaWVyUHJvcGVydHkiLCJwcm9kdWN0UHJvcGVydHkiLCJpbnB1dFByb3BlcnR5IiwiYWN0aXZlSW5wdXRQcm9wZXJ0eSIsImxhenlMaW5rIiwiaW5wdXRTdHJpbmciLCJpbnB1dFN0cmluZ1RvTnVtYmVyIiwiTnVtYmVyIiwiZ2V0Iiwic2V0IiwidXBkYXRlRm9jdXMiLCJ2YWx1ZSIsIkFXQUlUSU5HX1VTRVJfSU5QVVQiLCJtdWx0aXBsaWVySW5wdXQiLCJzZXRGb2N1cyIsIm11bHRpcGxpY2FuZElucHV0IiwibGluayIsImFjdGl2ZUlucHV0IiwiY2xlYXIiLCJzZXRJbnRlcmFjdGl2ZUFwcGVhcmFuY2UiLCJzdGF0ZSIsInNldFNob3dFcXVhbCIsIkRJU1BMQVlJTkdfSU5DT1JSRUNUX0FOU1dFUl9GRUVEQkFDSyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRGl2aWRlRXF1YXRpb25Ob2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEVxdWF0aW9uIG5vZGUgZm9yICdkaXZpZGUnIHNjcmVlbiBpbiB0aGUgQXJpdGhtZXRpYyBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEFuZHJleSBaZWxlbmtvdiAoTUxlYXJuZXIpXHJcbiAqL1xyXG5cclxuaW1wb3J0IGFyaXRobWV0aWMgZnJvbSAnLi4vLi4vYXJpdGhtZXRpYy5qcyc7XHJcbmltcG9ydCBHYW1lU3RhdGUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0dhbWVTdGF0ZS5qcyc7XHJcbmltcG9ydCBFcXVhdGlvbk5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvRXF1YXRpb25Ob2RlLmpzJztcclxuXHJcbmNsYXNzIERpdmlkZUVxdWF0aW9uTm9kZSBleHRlbmRzIEVxdWF0aW9uTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHl9IHN0YXRlUHJvcGVydHkgLSBTdGF0ZSBvZiBnYW1lIHByb3BlcnR5LlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHl9IG11bHRpcGxpY2FuZFByb3BlcnR5IC0gUHJvcGVydHkgbmVjZXNzYXJ5IGZvciBjcmVhdGluZyBtdWx0aXBsaWNhbmQgaW5wdXQuXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eX0gbXVsdGlwbGllclByb3BlcnR5IC0gUHJvcGVydHkgbmVjZXNzYXJ5IGZvciBjcmVhdGluZyBtdWx0aXBsaWVyIGlucHV0LlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHl9IHByb2R1Y3RQcm9wZXJ0eSAtIFByb3BlcnR5IG5lY2Vzc2FyeSBmb3IgY3JlYXRpbmcgcHJvZHVjdCBpbnB1dC5cclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5fSBpbnB1dFByb3BlcnR5IC0gSW5wdXQgcHJvcGVydHkuXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eX0gYWN0aXZlSW5wdXRQcm9wZXJ0eSAtIExpbmsgdG8gYWN0aXZlIGlucHV0LlxyXG4gICAqXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHN0YXRlUHJvcGVydHksIG11bHRpcGxpY2FuZFByb3BlcnR5LCBtdWx0aXBsaWVyUHJvcGVydHksIHByb2R1Y3RQcm9wZXJ0eSwgaW5wdXRQcm9wZXJ0eSwgYWN0aXZlSW5wdXRQcm9wZXJ0eSApIHtcclxuICAgIHN1cGVyKCBtdWx0aXBsaWNhbmRQcm9wZXJ0eSwgbXVsdGlwbGllclByb3BlcnR5LCBwcm9kdWN0UHJvcGVydHkgKTtcclxuXHJcbiAgICAvLyBJZiB0aGUgaW5wdXQgdmFsdWUgY2hhbmdlcywgaXQgbWVhbnMgdGhhdCB0aGUgdXNlciBlbnRlcmVkIHNvbWV0aGluZywgc28gcHV0IGl0IGluIHRoZSBhcHByb3ByaWF0ZSBlcXVhdGlvbiBub2RlLlxyXG4gICAgaW5wdXRQcm9wZXJ0eS5sYXp5TGluayggaW5wdXRTdHJpbmcgPT4ge1xyXG4gICAgICBjb25zdCBpbnB1dFN0cmluZ1RvTnVtYmVyID0gaW5wdXRTdHJpbmcgPyBOdW1iZXIoIGlucHV0U3RyaW5nICkgOiAnJztcclxuICAgICAgaWYgKCBhY3RpdmVJbnB1dFByb3BlcnR5LmdldCgpID09PSAnbXVsdGlwbGljYW5kJyApIHtcclxuICAgICAgICBtdWx0aXBsaWNhbmRQcm9wZXJ0eS5zZXQoIGlucHV0U3RyaW5nVG9OdW1iZXIgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggYWN0aXZlSW5wdXRQcm9wZXJ0eS5nZXQoKSA9PT0gJ211bHRpcGxpZXInICkge1xyXG4gICAgICAgIG11bHRpcGxpZXJQcm9wZXJ0eS5zZXQoIGlucHV0U3RyaW5nVG9OdW1iZXIgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHVwZGF0ZUZvY3VzID0gKCkgPT4ge1xyXG4gICAgICBpZiAoIHN0YXRlUHJvcGVydHkudmFsdWUgPT09IEdhbWVTdGF0ZS5BV0FJVElOR19VU0VSX0lOUFVUICkge1xyXG4gICAgICAgIHRoaXMubXVsdGlwbGllcklucHV0LnNldEZvY3VzKCBhY3RpdmVJbnB1dFByb3BlcnR5LnZhbHVlID09PSAnbXVsdGlwbGllcicgKTtcclxuICAgICAgICB0aGlzLm11bHRpcGxpY2FuZElucHV0LnNldEZvY3VzKCBhY3RpdmVJbnB1dFByb3BlcnR5LnZhbHVlID09PSAnbXVsdGlwbGljYW5kJyApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBOb3QgYXdhaXRpbmcgdXNlciBpbnB1dCwgc28gbmVpdGhlciBpbnB1dCBnZXRzIGZvY3VzLlxyXG4gICAgICAgIHRoaXMubXVsdGlwbGllcklucHV0LnNldEZvY3VzKCBmYWxzZSApO1xyXG4gICAgICAgIHRoaXMubXVsdGlwbGljYW5kSW5wdXQuc2V0Rm9jdXMoIGZhbHNlICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgYWN0aXZlSW5wdXRQcm9wZXJ0eS5saW5rKCBhY3RpdmVJbnB1dCA9PiB7XHJcbiAgICAgIGlmICggYWN0aXZlSW5wdXQgPT09ICdtdWx0aXBsaWVyJyApIHtcclxuICAgICAgICB0aGlzLm11bHRpcGxpZXJJbnB1dC5jbGVhcigpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBhY3RpdmVJbnB1dCA9PT0gJ211bHRpcGxpY2FuZCcgKSB7XHJcbiAgICAgICAgdGhpcy5tdWx0aXBsaWNhbmRJbnB1dC5jbGVhcigpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMubXVsdGlwbGljYW5kSW5wdXQuc2V0SW50ZXJhY3RpdmVBcHBlYXJhbmNlKCBhY3RpdmVJbnB1dCA9PT0gJ211bHRpcGxpY2FuZCcgKTtcclxuICAgICAgdGhpcy5tdWx0aXBsaWVySW5wdXQuc2V0SW50ZXJhY3RpdmVBcHBlYXJhbmNlKCBhY3RpdmVJbnB1dCA9PT0gJ211bHRpcGxpZXInICk7XHJcbiAgICAgIHVwZGF0ZUZvY3VzKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3RhdGVQcm9wZXJ0eS5saW5rKCBzdGF0ZSA9PiB7XHJcblxyXG4gICAgICAvLyBEaXNwbGF5IGEgbm90IGVxdWFsIHNpZ24gaWYgdGhlIHVzZXIgaW5wdXQgYW5kIGluY29ycmVjdCBhbnN3ZXIuXHJcbiAgICAgIHRoaXMuc2V0U2hvd0VxdWFsKCBzdGF0ZSAhPT0gR2FtZVN0YXRlLkRJU1BMQVlJTkdfSU5DT1JSRUNUX0FOU1dFUl9GRUVEQkFDSyApO1xyXG5cclxuICAgICAgdXBkYXRlRm9jdXMoKTtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmFyaXRobWV0aWMucmVnaXN0ZXIoICdEaXZpZGVFcXVhdGlvbk5vZGUnLCBEaXZpZGVFcXVhdGlvbk5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IERpdmlkZUVxdWF0aW9u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