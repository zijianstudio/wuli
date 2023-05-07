// Copyright 2016-2023, University of Colorado Boulder

/**
 * Times function.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../../phet-core/js/merge.js';
import functionBuilder from '../../../functionBuilder.js';
import FBSymbols from '../../FBSymbols.js';
import MathFunction from './MathFunction.js';
export default class Times extends MathFunction {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      fill: 'rgb( 237, 165, 222 )',
      pickerColor: 'rgb( 223, 17, 213 )'
    }, options);
    super(FBSymbols.TIMES, (input, operand) => input.times(operand), options);
  }

  /**
   * Is this function invertible for the current value of its operand?
   * Multiplication by zero is not invertible, since division by zero is undefined.
   *
   * @public
   * @override
   */
  getInvertible() {
    return this.operandProperty.get() !== 0;
  }
}
functionBuilder.register('Times', Times);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsImZ1bmN0aW9uQnVpbGRlciIsIkZCU3ltYm9scyIsIk1hdGhGdW5jdGlvbiIsIlRpbWVzIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiZmlsbCIsInBpY2tlckNvbG9yIiwiVElNRVMiLCJpbnB1dCIsIm9wZXJhbmQiLCJ0aW1lcyIsImdldEludmVydGlibGUiLCJvcGVyYW5kUHJvcGVydHkiLCJnZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRpbWVzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRpbWVzIGZ1bmN0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgZnVuY3Rpb25CdWlsZGVyIGZyb20gJy4uLy4uLy4uL2Z1bmN0aW9uQnVpbGRlci5qcyc7XHJcbmltcG9ydCBGQlN5bWJvbHMgZnJvbSAnLi4vLi4vRkJTeW1ib2xzLmpzJztcclxuaW1wb3J0IE1hdGhGdW5jdGlvbiBmcm9tICcuL01hdGhGdW5jdGlvbi5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUaW1lcyBleHRlbmRzIE1hdGhGdW5jdGlvbiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgZmlsbDogJ3JnYiggMjM3LCAxNjUsIDIyMiApJyxcclxuICAgICAgcGlja2VyQ29sb3I6ICdyZ2IoIDIyMywgMTcsIDIxMyApJ1xyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBGQlN5bWJvbHMuVElNRVMsXHJcbiAgICAgICggaW5wdXQsIG9wZXJhbmQgKSA9PiBpbnB1dC50aW1lcyggb3BlcmFuZCApLFxyXG4gICAgICBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJcyB0aGlzIGZ1bmN0aW9uIGludmVydGlibGUgZm9yIHRoZSBjdXJyZW50IHZhbHVlIG9mIGl0cyBvcGVyYW5kP1xyXG4gICAqIE11bHRpcGxpY2F0aW9uIGJ5IHplcm8gaXMgbm90IGludmVydGlibGUsIHNpbmNlIGRpdmlzaW9uIGJ5IHplcm8gaXMgdW5kZWZpbmVkLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGdldEludmVydGlibGUoKSB7XHJcbiAgICByZXR1cm4gKCB0aGlzLm9wZXJhbmRQcm9wZXJ0eS5nZXQoKSAhPT0gMCApO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb25CdWlsZGVyLnJlZ2lzdGVyKCAnVGltZXMnLCBUaW1lcyApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sc0NBQXNDO0FBQ3hELE9BQU9DLGVBQWUsTUFBTSw2QkFBNkI7QUFDekQsT0FBT0MsU0FBUyxNQUFNLG9CQUFvQjtBQUMxQyxPQUFPQyxZQUFZLE1BQU0sbUJBQW1CO0FBRTVDLGVBQWUsTUFBTUMsS0FBSyxTQUFTRCxZQUFZLENBQUM7RUFFOUM7QUFDRjtBQUNBO0VBQ0VFLFdBQVdBLENBQUVDLE9BQU8sRUFBRztJQUVyQkEsT0FBTyxHQUFHTixLQUFLLENBQUU7TUFDZk8sSUFBSSxFQUFFLHNCQUFzQjtNQUM1QkMsV0FBVyxFQUFFO0lBQ2YsQ0FBQyxFQUFFRixPQUFRLENBQUM7SUFFWixLQUFLLENBQUVKLFNBQVMsQ0FBQ08sS0FBSyxFQUNwQixDQUFFQyxLQUFLLEVBQUVDLE9BQU8sS0FBTUQsS0FBSyxDQUFDRSxLQUFLLENBQUVELE9BQVEsQ0FBQyxFQUM1Q0wsT0FBUSxDQUFDO0VBQ2I7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU8sYUFBYUEsQ0FBQSxFQUFHO0lBQ2QsT0FBUyxJQUFJLENBQUNDLGVBQWUsQ0FBQ0MsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO0VBQzNDO0FBQ0Y7QUFFQWQsZUFBZSxDQUFDZSxRQUFRLENBQUUsT0FBTyxFQUFFWixLQUFNLENBQUMifQ==