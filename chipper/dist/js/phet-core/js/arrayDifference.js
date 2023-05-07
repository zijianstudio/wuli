// Copyright 2018-2021, University of Colorado Boulder

/**
 * Computes what elements are in both arrays, or only one array.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import phetCore from './phetCore.js';

/**
 * Given two arrays, find the items that are only in one of them (mutates the aOnly/bOnly/inBoth parameters)
 * @public
 *
 * NOTE: Assumes there are no duplicate values in each individual array.
 *
 * For example:
 *   var a = [ 1, 2 ];
 *   var b = [ 5, 2, 0 ];
 *   var aOnly = [];
 *   var bOnly = [];
 *   var inBoth = [];
 *   arrayDifference( a, b, aOnly, bOnly, inBoth );
 *   // aOnly is [ 1 ]
 *   // bOnly is [ 5, 0 ]
 *   // inBoth is [ 2 ]
 *
 * @param {Array.<*>} a - Input array
 * @param {Array.<*>} b - Input array
 * @param {Array.<*>} [aOnly] - Output array (will be filled with all elements that are in `a` but NOT in `b`).
 *                              Ordered based on the order of `a`.
 * @param {Array.<*>} [bOnly] - Output array (will be filled with all elements that are in `b` but NOT in `a`).
 *                              Ordered based on the order of `b`.
 * @param {Array.<*>} [inBoth] - Output array (will be filled with all elements that are in both `a` AND `b`).
 *                               Ordered based on the order of `a`.
 * @returns {Array.<*>} - Returns the value of aOnly (the classic definition of difference)
 */
function arrayDifference(a, b, aOnly, bOnly, inBoth) {
  assert && assert(Array.isArray(a) && _.uniq(a).length === a.length, 'a is not an array of unique items');
  assert && assert(Array.isArray(b) && _.uniq(b).length === b.length, 'b is not an array of unique items');
  aOnly = aOnly || [];
  bOnly = bOnly || [];
  inBoth = inBoth || [];
  assert && assert(Array.isArray(aOnly) && aOnly.length === 0);
  assert && assert(Array.isArray(bOnly) && bOnly.length === 0);
  assert && assert(Array.isArray(inBoth) && inBoth.length === 0);
  Array.prototype.push.apply(aOnly, a);
  Array.prototype.push.apply(bOnly, b);
  outerLoop:
  // eslint-disable-line no-labels
  for (let i = 0; i < aOnly.length; i++) {
    const aItem = aOnly[i];
    for (let j = 0; j < bOnly.length; j++) {
      const bItem = bOnly[j];
      if (aItem === bItem) {
        inBoth.push(aItem);
        aOnly.splice(i, 1);
        bOnly.splice(j, 1);
        j = 0;
        if (i === aOnly.length) {
          break outerLoop; // eslint-disable-line no-labels
        }

        i -= 1;
      }
    }
  }

  // We return the classic meaning of "difference"
  return aOnly;
}
phetCore.register('arrayDifference', arrayDifference);
export default arrayDifference;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwaGV0Q29yZSIsImFycmF5RGlmZmVyZW5jZSIsImEiLCJiIiwiYU9ubHkiLCJiT25seSIsImluQm90aCIsImFzc2VydCIsIkFycmF5IiwiaXNBcnJheSIsIl8iLCJ1bmlxIiwibGVuZ3RoIiwicHJvdG90eXBlIiwicHVzaCIsImFwcGx5Iiwib3V0ZXJMb29wIiwiaSIsImFJdGVtIiwiaiIsImJJdGVtIiwic3BsaWNlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJhcnJheURpZmZlcmVuY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29tcHV0ZXMgd2hhdCBlbGVtZW50cyBhcmUgaW4gYm90aCBhcnJheXMsIG9yIG9ubHkgb25lIGFycmF5LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IHBoZXRDb3JlIGZyb20gJy4vcGhldENvcmUuanMnO1xyXG5cclxuLyoqXHJcbiAqIEdpdmVuIHR3byBhcnJheXMsIGZpbmQgdGhlIGl0ZW1zIHRoYXQgYXJlIG9ubHkgaW4gb25lIG9mIHRoZW0gKG11dGF0ZXMgdGhlIGFPbmx5L2JPbmx5L2luQm90aCBwYXJhbWV0ZXJzKVxyXG4gKiBAcHVibGljXHJcbiAqXHJcbiAqIE5PVEU6IEFzc3VtZXMgdGhlcmUgYXJlIG5vIGR1cGxpY2F0ZSB2YWx1ZXMgaW4gZWFjaCBpbmRpdmlkdWFsIGFycmF5LlxyXG4gKlxyXG4gKiBGb3IgZXhhbXBsZTpcclxuICogICB2YXIgYSA9IFsgMSwgMiBdO1xyXG4gKiAgIHZhciBiID0gWyA1LCAyLCAwIF07XHJcbiAqICAgdmFyIGFPbmx5ID0gW107XHJcbiAqICAgdmFyIGJPbmx5ID0gW107XHJcbiAqICAgdmFyIGluQm90aCA9IFtdO1xyXG4gKiAgIGFycmF5RGlmZmVyZW5jZSggYSwgYiwgYU9ubHksIGJPbmx5LCBpbkJvdGggKTtcclxuICogICAvLyBhT25seSBpcyBbIDEgXVxyXG4gKiAgIC8vIGJPbmx5IGlzIFsgNSwgMCBdXHJcbiAqICAgLy8gaW5Cb3RoIGlzIFsgMiBdXHJcbiAqXHJcbiAqIEBwYXJhbSB7QXJyYXkuPCo+fSBhIC0gSW5wdXQgYXJyYXlcclxuICogQHBhcmFtIHtBcnJheS48Kj59IGIgLSBJbnB1dCBhcnJheVxyXG4gKiBAcGFyYW0ge0FycmF5LjwqPn0gW2FPbmx5XSAtIE91dHB1dCBhcnJheSAod2lsbCBiZSBmaWxsZWQgd2l0aCBhbGwgZWxlbWVudHMgdGhhdCBhcmUgaW4gYGFgIGJ1dCBOT1QgaW4gYGJgKS5cclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPcmRlcmVkIGJhc2VkIG9uIHRoZSBvcmRlciBvZiBgYWAuXHJcbiAqIEBwYXJhbSB7QXJyYXkuPCo+fSBbYk9ubHldIC0gT3V0cHV0IGFycmF5ICh3aWxsIGJlIGZpbGxlZCB3aXRoIGFsbCBlbGVtZW50cyB0aGF0IGFyZSBpbiBgYmAgYnV0IE5PVCBpbiBgYWApLlxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9yZGVyZWQgYmFzZWQgb24gdGhlIG9yZGVyIG9mIGBiYC5cclxuICogQHBhcmFtIHtBcnJheS48Kj59IFtpbkJvdGhdIC0gT3V0cHV0IGFycmF5ICh3aWxsIGJlIGZpbGxlZCB3aXRoIGFsbCBlbGVtZW50cyB0aGF0IGFyZSBpbiBib3RoIGBhYCBBTkQgYGJgKS5cclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT3JkZXJlZCBiYXNlZCBvbiB0aGUgb3JkZXIgb2YgYGFgLlxyXG4gKiBAcmV0dXJucyB7QXJyYXkuPCo+fSAtIFJldHVybnMgdGhlIHZhbHVlIG9mIGFPbmx5ICh0aGUgY2xhc3NpYyBkZWZpbml0aW9uIG9mIGRpZmZlcmVuY2UpXHJcbiAqL1xyXG5mdW5jdGlvbiBhcnJheURpZmZlcmVuY2UoIGEsIGIsIGFPbmx5LCBiT25seSwgaW5Cb3RoICkge1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGEgKSAmJiBfLnVuaXEoIGEgKS5sZW5ndGggPT09IGEubGVuZ3RoLCAnYSBpcyBub3QgYW4gYXJyYXkgb2YgdW5pcXVlIGl0ZW1zJyApO1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGIgKSAmJiBfLnVuaXEoIGIgKS5sZW5ndGggPT09IGIubGVuZ3RoLCAnYiBpcyBub3QgYW4gYXJyYXkgb2YgdW5pcXVlIGl0ZW1zJyApO1xyXG5cclxuICBhT25seSA9IGFPbmx5IHx8IFtdO1xyXG4gIGJPbmx5ID0gYk9ubHkgfHwgW107XHJcbiAgaW5Cb3RoID0gaW5Cb3RoIHx8IFtdO1xyXG5cclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBhT25seSApICYmIGFPbmx5Lmxlbmd0aCA9PT0gMCApO1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGJPbmx5ICkgJiYgYk9ubHkubGVuZ3RoID09PSAwICk7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggaW5Cb3RoICkgJiYgaW5Cb3RoLmxlbmd0aCA9PT0gMCApO1xyXG5cclxuICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSggYU9ubHksIGEgKTtcclxuICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSggYk9ubHksIGIgKTtcclxuXHJcbiAgb3V0ZXJMb29wOiAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWxhYmVsc1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYU9ubHkubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGFJdGVtID0gYU9ubHlbIGkgXTtcclxuXHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IGJPbmx5Lmxlbmd0aDsgaisrICkge1xyXG4gICAgICAgIGNvbnN0IGJJdGVtID0gYk9ubHlbIGogXTtcclxuXHJcbiAgICAgICAgaWYgKCBhSXRlbSA9PT0gYkl0ZW0gKSB7XHJcbiAgICAgICAgICBpbkJvdGgucHVzaCggYUl0ZW0gKTtcclxuICAgICAgICAgIGFPbmx5LnNwbGljZSggaSwgMSApO1xyXG4gICAgICAgICAgYk9ubHkuc3BsaWNlKCBqLCAxICk7XHJcbiAgICAgICAgICBqID0gMDtcclxuICAgICAgICAgIGlmICggaSA9PT0gYU9ubHkubGVuZ3RoICkge1xyXG4gICAgICAgICAgICBicmVhayBvdXRlckxvb3A7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbGFiZWxzXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpIC09IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gIC8vIFdlIHJldHVybiB0aGUgY2xhc3NpYyBtZWFuaW5nIG9mIFwiZGlmZmVyZW5jZVwiXHJcbiAgcmV0dXJuIGFPbmx5O1xyXG59XHJcblxyXG5waGV0Q29yZS5yZWdpc3RlciggJ2FycmF5RGlmZmVyZW5jZScsIGFycmF5RGlmZmVyZW5jZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgYXJyYXlEaWZmZXJlbmNlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sZUFBZTs7QUFFcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0MsZUFBZUEsQ0FBRUMsQ0FBQyxFQUFFQyxDQUFDLEVBQUVDLEtBQUssRUFBRUMsS0FBSyxFQUFFQyxNQUFNLEVBQUc7RUFDckRDLE1BQU0sSUFBSUEsTUFBTSxDQUFFQyxLQUFLLENBQUNDLE9BQU8sQ0FBRVAsQ0FBRSxDQUFDLElBQUlRLENBQUMsQ0FBQ0MsSUFBSSxDQUFFVCxDQUFFLENBQUMsQ0FBQ1UsTUFBTSxLQUFLVixDQUFDLENBQUNVLE1BQU0sRUFBRSxtQ0FBb0MsQ0FBQztFQUM5R0wsTUFBTSxJQUFJQSxNQUFNLENBQUVDLEtBQUssQ0FBQ0MsT0FBTyxDQUFFTixDQUFFLENBQUMsSUFBSU8sQ0FBQyxDQUFDQyxJQUFJLENBQUVSLENBQUUsQ0FBQyxDQUFDUyxNQUFNLEtBQUtULENBQUMsQ0FBQ1MsTUFBTSxFQUFFLG1DQUFvQyxDQUFDO0VBRTlHUixLQUFLLEdBQUdBLEtBQUssSUFBSSxFQUFFO0VBQ25CQyxLQUFLLEdBQUdBLEtBQUssSUFBSSxFQUFFO0VBQ25CQyxNQUFNLEdBQUdBLE1BQU0sSUFBSSxFQUFFO0VBRXJCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUMsS0FBSyxDQUFDQyxPQUFPLENBQUVMLEtBQU0sQ0FBQyxJQUFJQSxLQUFLLENBQUNRLE1BQU0sS0FBSyxDQUFFLENBQUM7RUFDaEVMLE1BQU0sSUFBSUEsTUFBTSxDQUFFQyxLQUFLLENBQUNDLE9BQU8sQ0FBRUosS0FBTSxDQUFDLElBQUlBLEtBQUssQ0FBQ08sTUFBTSxLQUFLLENBQUUsQ0FBQztFQUNoRUwsTUFBTSxJQUFJQSxNQUFNLENBQUVDLEtBQUssQ0FBQ0MsT0FBTyxDQUFFSCxNQUFPLENBQUMsSUFBSUEsTUFBTSxDQUFDTSxNQUFNLEtBQUssQ0FBRSxDQUFDO0VBRWxFSixLQUFLLENBQUNLLFNBQVMsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUVYLEtBQUssRUFBRUYsQ0FBRSxDQUFDO0VBQ3RDTSxLQUFLLENBQUNLLFNBQVMsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUVWLEtBQUssRUFBRUYsQ0FBRSxDQUFDO0VBRXRDYSxTQUFTO0VBQUU7RUFDVCxLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2IsS0FBSyxDQUFDUSxNQUFNLEVBQUVLLENBQUMsRUFBRSxFQUFHO0lBQ3ZDLE1BQU1DLEtBQUssR0FBR2QsS0FBSyxDQUFFYSxDQUFDLENBQUU7SUFFeEIsS0FBTSxJQUFJRSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdkLEtBQUssQ0FBQ08sTUFBTSxFQUFFTyxDQUFDLEVBQUUsRUFBRztNQUN2QyxNQUFNQyxLQUFLLEdBQUdmLEtBQUssQ0FBRWMsQ0FBQyxDQUFFO01BRXhCLElBQUtELEtBQUssS0FBS0UsS0FBSyxFQUFHO1FBQ3JCZCxNQUFNLENBQUNRLElBQUksQ0FBRUksS0FBTSxDQUFDO1FBQ3BCZCxLQUFLLENBQUNpQixNQUFNLENBQUVKLENBQUMsRUFBRSxDQUFFLENBQUM7UUFDcEJaLEtBQUssQ0FBQ2dCLE1BQU0sQ0FBRUYsQ0FBQyxFQUFFLENBQUUsQ0FBQztRQUNwQkEsQ0FBQyxHQUFHLENBQUM7UUFDTCxJQUFLRixDQUFDLEtBQUtiLEtBQUssQ0FBQ1EsTUFBTSxFQUFHO1VBQ3hCLE1BQU1JLFNBQVMsQ0FBQyxDQUFDO1FBQ25COztRQUNBQyxDQUFDLElBQUksQ0FBQztNQUNSO0lBQ0Y7RUFDRjs7RUFFRjtFQUNBLE9BQU9iLEtBQUs7QUFDZDtBQUVBSixRQUFRLENBQUNzQixRQUFRLENBQUUsaUJBQWlCLEVBQUVyQixlQUFnQixDQUFDO0FBRXZELGVBQWVBLGVBQWUifQ==