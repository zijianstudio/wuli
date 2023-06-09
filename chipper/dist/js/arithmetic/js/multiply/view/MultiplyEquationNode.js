// Copyright 2014-2021, University of Colorado Boulder

/**
 * Equation node for 'multiply' screen in 'Arithmetic' simulation.
 *
 * @author Andrey Zelenkov (MLearner)
 */

import arithmetic from '../../arithmetic.js';
import GameState from '../../common/model/GameState.js';
import EquationNode from '../../common/view/EquationNode.js';
class MultiplyEquationNode extends EquationNode {
  /**
   * @param {Property} stateProperty - State of game property.
   * @param {Property} multiplicandProperty - Property necessary for creating multiplicand input.
   * @param {Property} multiplierProperty - Property necessary for creating multiplier input.
   * @param {Property} inputProperty - Input property, which is the product, and is input by the user.
   *
   */
  constructor(stateProperty, multiplicandProperty, multiplierProperty, inputProperty) {
    super(multiplicandProperty, multiplierProperty, inputProperty);

    // The product is always the interactive part for this equation, so set up the appearance now.
    this.productInput.setInteractiveAppearance(true);

    // Update contents and focus at the state changes.
    stateProperty.link((newState, oldState) => {
      // Set the state of the product portion of the equation.
      if (newState === GameState.AWAITING_USER_INPUT && oldState !== GameState.DISPLAYING_INCORRECT_ANSWER_FEEDBACK) {
        this.productInput.clear();
      }

      // The input should only have focus (i.e. blinking cursor) when awaiting input from the user.
      this.productInput.setFocus(newState === GameState.AWAITING_USER_INPUT);

      // If the user got it wrong, the equation should depict a not equals sign.
      this.setShowEqual(newState !== GameState.DISPLAYING_INCORRECT_ANSWER_FEEDBACK);
    });
  }
}
arithmetic.register('MultiplyEquationNode', MultiplyEquationNode);
export default MultiplyEquationNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhcml0aG1ldGljIiwiR2FtZVN0YXRlIiwiRXF1YXRpb25Ob2RlIiwiTXVsdGlwbHlFcXVhdGlvbk5vZGUiLCJjb25zdHJ1Y3RvciIsInN0YXRlUHJvcGVydHkiLCJtdWx0aXBsaWNhbmRQcm9wZXJ0eSIsIm11bHRpcGxpZXJQcm9wZXJ0eSIsImlucHV0UHJvcGVydHkiLCJwcm9kdWN0SW5wdXQiLCJzZXRJbnRlcmFjdGl2ZUFwcGVhcmFuY2UiLCJsaW5rIiwibmV3U3RhdGUiLCJvbGRTdGF0ZSIsIkFXQUlUSU5HX1VTRVJfSU5QVVQiLCJESVNQTEFZSU5HX0lOQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0siLCJjbGVhciIsInNldEZvY3VzIiwic2V0U2hvd0VxdWFsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNdWx0aXBseUVxdWF0aW9uTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBFcXVhdGlvbiBub2RlIGZvciAnbXVsdGlwbHknIHNjcmVlbiBpbiAnQXJpdGhtZXRpYycgc2ltdWxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBBbmRyZXkgWmVsZW5rb3YgKE1MZWFybmVyKVxyXG4gKi9cclxuXHJcbmltcG9ydCBhcml0aG1ldGljIGZyb20gJy4uLy4uL2FyaXRobWV0aWMuanMnO1xyXG5pbXBvcnQgR2FtZVN0YXRlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9HYW1lU3RhdGUuanMnO1xyXG5pbXBvcnQgRXF1YXRpb25Ob2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0VxdWF0aW9uTm9kZS5qcyc7XHJcblxyXG5jbGFzcyBNdWx0aXBseUVxdWF0aW9uTm9kZSBleHRlbmRzIEVxdWF0aW9uTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHl9IHN0YXRlUHJvcGVydHkgLSBTdGF0ZSBvZiBnYW1lIHByb3BlcnR5LlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHl9IG11bHRpcGxpY2FuZFByb3BlcnR5IC0gUHJvcGVydHkgbmVjZXNzYXJ5IGZvciBjcmVhdGluZyBtdWx0aXBsaWNhbmQgaW5wdXQuXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eX0gbXVsdGlwbGllclByb3BlcnR5IC0gUHJvcGVydHkgbmVjZXNzYXJ5IGZvciBjcmVhdGluZyBtdWx0aXBsaWVyIGlucHV0LlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHl9IGlucHV0UHJvcGVydHkgLSBJbnB1dCBwcm9wZXJ0eSwgd2hpY2ggaXMgdGhlIHByb2R1Y3QsIGFuZCBpcyBpbnB1dCBieSB0aGUgdXNlci5cclxuICAgKlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBzdGF0ZVByb3BlcnR5LCBtdWx0aXBsaWNhbmRQcm9wZXJ0eSwgbXVsdGlwbGllclByb3BlcnR5LCBpbnB1dFByb3BlcnR5ICkge1xyXG4gICAgc3VwZXIoIG11bHRpcGxpY2FuZFByb3BlcnR5LCBtdWx0aXBsaWVyUHJvcGVydHksIGlucHV0UHJvcGVydHkgKTtcclxuXHJcbiAgICAvLyBUaGUgcHJvZHVjdCBpcyBhbHdheXMgdGhlIGludGVyYWN0aXZlIHBhcnQgZm9yIHRoaXMgZXF1YXRpb24sIHNvIHNldCB1cCB0aGUgYXBwZWFyYW5jZSBub3cuXHJcbiAgICB0aGlzLnByb2R1Y3RJbnB1dC5zZXRJbnRlcmFjdGl2ZUFwcGVhcmFuY2UoIHRydWUgKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgY29udGVudHMgYW5kIGZvY3VzIGF0IHRoZSBzdGF0ZSBjaGFuZ2VzLlxyXG4gICAgc3RhdGVQcm9wZXJ0eS5saW5rKCAoIG5ld1N0YXRlLCBvbGRTdGF0ZSApID0+IHtcclxuXHJcbiAgICAgIC8vIFNldCB0aGUgc3RhdGUgb2YgdGhlIHByb2R1Y3QgcG9ydGlvbiBvZiB0aGUgZXF1YXRpb24uXHJcbiAgICAgIGlmICggbmV3U3RhdGUgPT09IEdhbWVTdGF0ZS5BV0FJVElOR19VU0VSX0lOUFVUICYmIG9sZFN0YXRlICE9PSBHYW1lU3RhdGUuRElTUExBWUlOR19JTkNPUlJFQ1RfQU5TV0VSX0ZFRURCQUNLICkge1xyXG4gICAgICAgIHRoaXMucHJvZHVjdElucHV0LmNsZWFyKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFRoZSBpbnB1dCBzaG91bGQgb25seSBoYXZlIGZvY3VzIChpLmUuIGJsaW5raW5nIGN1cnNvcikgd2hlbiBhd2FpdGluZyBpbnB1dCBmcm9tIHRoZSB1c2VyLlxyXG4gICAgICB0aGlzLnByb2R1Y3RJbnB1dC5zZXRGb2N1cyggbmV3U3RhdGUgPT09IEdhbWVTdGF0ZS5BV0FJVElOR19VU0VSX0lOUFVUICk7XHJcblxyXG4gICAgICAvLyBJZiB0aGUgdXNlciBnb3QgaXQgd3JvbmcsIHRoZSBlcXVhdGlvbiBzaG91bGQgZGVwaWN0IGEgbm90IGVxdWFscyBzaWduLlxyXG4gICAgICB0aGlzLnNldFNob3dFcXVhbCggbmV3U3RhdGUgIT09IEdhbWVTdGF0ZS5ESVNQTEFZSU5HX0lOQ09SUkVDVF9BTlNXRVJfRkVFREJBQ0sgKTtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmFyaXRobWV0aWMucmVnaXN0ZXIoICdNdWx0aXBseUVxdWF0aW9uTm9kZScsIE11bHRpcGx5RXF1YXRpb25Ob2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNdWx0aXBseUVxdWF0aW9uTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLHFCQUFxQjtBQUM1QyxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLFlBQVksTUFBTSxtQ0FBbUM7QUFFNUQsTUFBTUMsb0JBQW9CLFNBQVNELFlBQVksQ0FBQztFQUU5QztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxXQUFXQSxDQUFFQyxhQUFhLEVBQUVDLG9CQUFvQixFQUFFQyxrQkFBa0IsRUFBRUMsYUFBYSxFQUFHO0lBQ3BGLEtBQUssQ0FBRUYsb0JBQW9CLEVBQUVDLGtCQUFrQixFQUFFQyxhQUFjLENBQUM7O0lBRWhFO0lBQ0EsSUFBSSxDQUFDQyxZQUFZLENBQUNDLHdCQUF3QixDQUFFLElBQUssQ0FBQzs7SUFFbEQ7SUFDQUwsYUFBYSxDQUFDTSxJQUFJLENBQUUsQ0FBRUMsUUFBUSxFQUFFQyxRQUFRLEtBQU07TUFFNUM7TUFDQSxJQUFLRCxRQUFRLEtBQUtYLFNBQVMsQ0FBQ2EsbUJBQW1CLElBQUlELFFBQVEsS0FBS1osU0FBUyxDQUFDYyxvQ0FBb0MsRUFBRztRQUMvRyxJQUFJLENBQUNOLFlBQVksQ0FBQ08sS0FBSyxDQUFDLENBQUM7TUFDM0I7O01BRUE7TUFDQSxJQUFJLENBQUNQLFlBQVksQ0FBQ1EsUUFBUSxDQUFFTCxRQUFRLEtBQUtYLFNBQVMsQ0FBQ2EsbUJBQW9CLENBQUM7O01BRXhFO01BQ0EsSUFBSSxDQUFDSSxZQUFZLENBQUVOLFFBQVEsS0FBS1gsU0FBUyxDQUFDYyxvQ0FBcUMsQ0FBQztJQUNsRixDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUFmLFVBQVUsQ0FBQ21CLFFBQVEsQ0FBRSxzQkFBc0IsRUFBRWhCLG9CQUFxQixDQUFDO0FBRW5FLGVBQWVBLG9CQUFvQiJ9