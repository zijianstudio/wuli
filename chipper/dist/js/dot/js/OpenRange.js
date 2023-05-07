// Copyright 2018-2022, University of Colorado Boulder

/**
 * A numeric range that handles open and half open intervals. Defaults to an open interval.
 *
 * @author Michael Barlow (PhET Interactive Simulations)
 */

import merge from '../../phet-core/js/merge.js';
import dot from './dot.js';
import Range from './Range.js';
class OpenRange extends Range {
  /**
   * @param {number} min - the minimum value of the range
   * @param {number} max - the maximum value of the range
   * @param {Object} [options]
   */
  constructor(min, max, options) {
    options = merge({
      openMin: true,
      openMax: true
    }, options);
    super(min, max);

    // @public (read-only) - interval open at minimum value (excludes the min in comparisons)
    this.openMin = options.openMin;

    // @public (read-only) - interval open at maximum value (excludes the max in comparisons)
    this.openMax = options.openMax;

    // if the interval is open, ensure that the min is strictly less than the max
    assert && assert(this.openMin || this.openMax, 'use Range type if min and max are inclusive');
    assert && assert(min < max, 'must instantiate OpenRange with min strictly less than max');
  }

  /**
   * OpenRange override for setMin.
   * @public
   * @override
   * @param  {number} min
   */
  setMin(min) {
    assert && assert(min < this._max, 'min must be strictly less than max for OpenRange');
    super.setMin(min);
  }

  /**
   * OpenRange override for setMax.
   * @public
   * @override
   * @param  {number} max
   */
  setMax(max) {
    assert && assert(max > this._min, 'max must be strictly greater than min for OpenRange');
    super.setMax(max);
  }

  /**
   * OpenRange override for setMinMax. Ensures that min is strictly less than max.
   * @override
   * @public
   * @param  {number} min
   * @param  {number} max
   */
  setMinMax(min, max) {
    assert && assert(min < max, 'min must be strictly less than max in OpenRange');
    super.setMinMax(min, max);
  }

  /**
   * Determines if this range contains the value
   * @public
   * @param {number} value
   * @returns {boolean}
   */
  contains(value) {
    return (this.openMin ? value > this.min : value >= this.min) && (this.openMax ? value < this.max : value <= this.max);
  }

  /**
   * Does this range contain the specified range?
   * @public
   * @param {Range} range
   * @returns {boolean}
   */
  containsRange(range) {
    return (this.openMin ? this.min < range.min : this.min <= range.min) && (this.openMax ? this.max > range.max : this.max >= range.max);
  }

  /**
   * Determine if this range overlaps (intersects) with another range
   * @public
   * @param {Range} range
   * @returns {boolean}
   */
  intersects(range) {
    return (this.openMax ? this.max > range.min : this.max >= range.min) && (this.openMin ? range.max > this.min : range.max >= this.min);
  }

  /**
   * Converts the attributes of this range to a string
   * @public
   * @returns {string}
   */
  toString() {
    const leftBracket = this.openMin ? '(' : '[';
    const rightBracket = this.openMax ? ')' : ']';
    return `[Range ${leftBracket}min:${this.min} max:${this.max}${rightBracket}]`;
  }

  /**
   * TODO: how will this function in an open range scenario?
   * Constrains a value to the range.
   * @public
   * @param {number} value
   * @returns {number}
   */
  constrainValue(value) {
    return Math.min(Math.max(value, this.min), this.max);
  }

  /**
   * Determines if this range is equal to other range.
   * @public
   * @param {Range} other
   * @returns {boolean}
   */
  equals(other) {
    return other instanceof Range && this.min === other.min && this.max === other.max && this.openMin === other.openMin && this.openMax === other.openMax;
  }
}
dot.register('OpenRange', OpenRange);
export default OpenRange;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsImRvdCIsIlJhbmdlIiwiT3BlblJhbmdlIiwiY29uc3RydWN0b3IiLCJtaW4iLCJtYXgiLCJvcHRpb25zIiwib3Blbk1pbiIsIm9wZW5NYXgiLCJhc3NlcnQiLCJzZXRNaW4iLCJfbWF4Iiwic2V0TWF4IiwiX21pbiIsInNldE1pbk1heCIsImNvbnRhaW5zIiwidmFsdWUiLCJjb250YWluc1JhbmdlIiwicmFuZ2UiLCJpbnRlcnNlY3RzIiwidG9TdHJpbmciLCJsZWZ0QnJhY2tldCIsInJpZ2h0QnJhY2tldCIsImNvbnN0cmFpblZhbHVlIiwiTWF0aCIsImVxdWFscyIsIm90aGVyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJPcGVuUmFuZ2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBudW1lcmljIHJhbmdlIHRoYXQgaGFuZGxlcyBvcGVuIGFuZCBoYWxmIG9wZW4gaW50ZXJ2YWxzLiBEZWZhdWx0cyB0byBhbiBvcGVuIGludGVydmFsLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgQmFybG93IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4vUmFuZ2UuanMnO1xyXG5cclxuY2xhc3MgT3BlblJhbmdlIGV4dGVuZHMgUmFuZ2Uge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gLSB0aGUgbWluaW11bSB2YWx1ZSBvZiB0aGUgcmFuZ2VcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4IC0gdGhlIG1heGltdW0gdmFsdWUgb2YgdGhlIHJhbmdlXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtaW4sIG1heCwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgb3Blbk1pbjogdHJ1ZSxcclxuICAgICAgb3Blbk1heDogdHJ1ZVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBtaW4sIG1heCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkgLSBpbnRlcnZhbCBvcGVuIGF0IG1pbmltdW0gdmFsdWUgKGV4Y2x1ZGVzIHRoZSBtaW4gaW4gY29tcGFyaXNvbnMpXHJcbiAgICB0aGlzLm9wZW5NaW4gPSBvcHRpb25zLm9wZW5NaW47XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSAtIGludGVydmFsIG9wZW4gYXQgbWF4aW11bSB2YWx1ZSAoZXhjbHVkZXMgdGhlIG1heCBpbiBjb21wYXJpc29ucylcclxuICAgIHRoaXMub3Blbk1heCA9IG9wdGlvbnMub3Blbk1heDtcclxuXHJcbiAgICAvLyBpZiB0aGUgaW50ZXJ2YWwgaXMgb3BlbiwgZW5zdXJlIHRoYXQgdGhlIG1pbiBpcyBzdHJpY3RseSBsZXNzIHRoYW4gdGhlIG1heFxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5vcGVuTWluIHx8IHRoaXMub3Blbk1heCwgJ3VzZSBSYW5nZSB0eXBlIGlmIG1pbiBhbmQgbWF4IGFyZSBpbmNsdXNpdmUnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtaW4gPCBtYXgsICdtdXN0IGluc3RhbnRpYXRlIE9wZW5SYW5nZSB3aXRoIG1pbiBzdHJpY3RseSBsZXNzIHRoYW4gbWF4JyApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIE9wZW5SYW5nZSBvdmVycmlkZSBmb3Igc2V0TWluLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IG1pblxyXG4gICAqL1xyXG4gIHNldE1pbiggbWluICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWluIDwgdGhpcy5fbWF4LCAnbWluIG11c3QgYmUgc3RyaWN0bHkgbGVzcyB0aGFuIG1heCBmb3IgT3BlblJhbmdlJyApO1xyXG4gICAgc3VwZXIuc2V0TWluKCBtaW4gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE9wZW5SYW5nZSBvdmVycmlkZSBmb3Igc2V0TWF4LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IG1heFxyXG4gICAqL1xyXG4gIHNldE1heCggbWF4ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWF4ID4gdGhpcy5fbWluLCAnbWF4IG11c3QgYmUgc3RyaWN0bHkgZ3JlYXRlciB0aGFuIG1pbiBmb3IgT3BlblJhbmdlJyApO1xyXG4gICAgc3VwZXIuc2V0TWF4KCBtYXggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE9wZW5SYW5nZSBvdmVycmlkZSBmb3Igc2V0TWluTWF4LiBFbnN1cmVzIHRoYXQgbWluIGlzIHN0cmljdGx5IGxlc3MgdGhhbiBtYXguXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSAge251bWJlcn0gbWluXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBtYXhcclxuICAgKi9cclxuICBzZXRNaW5NYXgoIG1pbiwgbWF4ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWluIDwgbWF4LCAnbWluIG11c3QgYmUgc3RyaWN0bHkgbGVzcyB0aGFuIG1heCBpbiBPcGVuUmFuZ2UnICk7XHJcbiAgICBzdXBlci5zZXRNaW5NYXgoIG1pbiwgbWF4ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIGlmIHRoaXMgcmFuZ2UgY29udGFpbnMgdGhlIHZhbHVlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGNvbnRhaW5zKCB2YWx1ZSApIHtcclxuICAgIHJldHVybiAoIHRoaXMub3Blbk1pbiA/IHZhbHVlID4gdGhpcy5taW4gOiB2YWx1ZSA+PSB0aGlzLm1pbiApICYmXHJcbiAgICAgICAgICAgKCB0aGlzLm9wZW5NYXggPyB2YWx1ZSA8IHRoaXMubWF4IDogdmFsdWUgPD0gdGhpcy5tYXggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERvZXMgdGhpcyByYW5nZSBjb250YWluIHRoZSBzcGVjaWZpZWQgcmFuZ2U/XHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgY29udGFpbnNSYW5nZSggcmFuZ2UgKSB7XHJcbiAgICByZXR1cm4gKCB0aGlzLm9wZW5NaW4gPyB0aGlzLm1pbiA8IHJhbmdlLm1pbiA6IHRoaXMubWluIDw9IHJhbmdlLm1pbiApICYmXHJcbiAgICAgICAgICAgKCB0aGlzLm9wZW5NYXggPyB0aGlzLm1heCA+IHJhbmdlLm1heCA6IHRoaXMubWF4ID49IHJhbmdlLm1heCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lIGlmIHRoaXMgcmFuZ2Ugb3ZlcmxhcHMgKGludGVyc2VjdHMpIHdpdGggYW5vdGhlciByYW5nZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGludGVyc2VjdHMoIHJhbmdlICkge1xyXG4gICAgcmV0dXJuICggdGhpcy5vcGVuTWF4ID8gdGhpcy5tYXggPiByYW5nZS5taW4gOiB0aGlzLm1heCA+PSByYW5nZS5taW4gKSAmJlxyXG4gICAgICAgICAgICggdGhpcy5vcGVuTWluID8gcmFuZ2UubWF4ID4gdGhpcy5taW4gOiByYW5nZS5tYXggPj0gdGhpcy5taW4gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnRzIHRoZSBhdHRyaWJ1dGVzIG9mIHRoaXMgcmFuZ2UgdG8gYSBzdHJpbmdcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICB0b1N0cmluZygpIHtcclxuICAgIGNvbnN0IGxlZnRCcmFja2V0ID0gdGhpcy5vcGVuTWluID8gJygnIDogJ1snO1xyXG4gICAgY29uc3QgcmlnaHRCcmFja2V0ID0gdGhpcy5vcGVuTWF4ID8gJyknIDogJ10nO1xyXG4gICAgcmV0dXJuIGBbUmFuZ2UgJHtsZWZ0QnJhY2tldH1taW46JHt0aGlzLm1pbn0gbWF4OiR7dGhpcy5tYXh9JHtyaWdodEJyYWNrZXR9XWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUT0RPOiBob3cgd2lsbCB0aGlzIGZ1bmN0aW9uIGluIGFuIG9wZW4gcmFuZ2Ugc2NlbmFyaW8/XHJcbiAgICogQ29uc3RyYWlucyBhIHZhbHVlIHRvIHRoZSByYW5nZS5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBjb25zdHJhaW5WYWx1ZSggdmFsdWUgKSB7XHJcbiAgICByZXR1cm4gTWF0aC5taW4oIE1hdGgubWF4KCB2YWx1ZSwgdGhpcy5taW4gKSwgdGhpcy5tYXggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgaWYgdGhpcyByYW5nZSBpcyBlcXVhbCB0byBvdGhlciByYW5nZS5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtSYW5nZX0gb3RoZXJcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBlcXVhbHMoIG90aGVyICkge1xyXG4gICAgcmV0dXJuIG90aGVyIGluc3RhbmNlb2YgUmFuZ2UgJiZcclxuICAgICAgICAgICB0aGlzLm1pbiA9PT0gb3RoZXIubWluICYmXHJcbiAgICAgICAgICAgdGhpcy5tYXggPT09IG90aGVyLm1heCAmJlxyXG4gICAgICAgICAgIHRoaXMub3Blbk1pbiA9PT0gb3RoZXIub3Blbk1pbiAmJlxyXG4gICAgICAgICAgIHRoaXMub3Blbk1heCA9PT0gb3RoZXIub3Blbk1heDtcclxuICB9XHJcbn1cclxuXHJcbmRvdC5yZWdpc3RlciggJ09wZW5SYW5nZScsIE9wZW5SYW5nZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgT3BlblJhbmdlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLEdBQUcsTUFBTSxVQUFVO0FBQzFCLE9BQU9DLEtBQUssTUFBTSxZQUFZO0FBRTlCLE1BQU1DLFNBQVMsU0FBU0QsS0FBSyxDQUFDO0VBQzVCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsV0FBV0EsQ0FBRUMsR0FBRyxFQUFFQyxHQUFHLEVBQUVDLE9BQU8sRUFBRztJQUUvQkEsT0FBTyxHQUFHUCxLQUFLLENBQUU7TUFDZlEsT0FBTyxFQUFFLElBQUk7TUFDYkMsT0FBTyxFQUFFO0lBQ1gsQ0FBQyxFQUFFRixPQUFRLENBQUM7SUFFWixLQUFLLENBQUVGLEdBQUcsRUFBRUMsR0FBSSxDQUFDOztJQUVqQjtJQUNBLElBQUksQ0FBQ0UsT0FBTyxHQUFHRCxPQUFPLENBQUNDLE9BQU87O0lBRTlCO0lBQ0EsSUFBSSxDQUFDQyxPQUFPLEdBQUdGLE9BQU8sQ0FBQ0UsT0FBTzs7SUFFOUI7SUFDQUMsTUFBTSxJQUFJQSxNQUFNLENBQUUsSUFBSSxDQUFDRixPQUFPLElBQUksSUFBSSxDQUFDQyxPQUFPLEVBQUUsNkNBQThDLENBQUM7SUFDL0ZDLE1BQU0sSUFBSUEsTUFBTSxDQUFFTCxHQUFHLEdBQUdDLEdBQUcsRUFBRSw0REFBNkQsQ0FBQztFQUM3Rjs7RUFHQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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