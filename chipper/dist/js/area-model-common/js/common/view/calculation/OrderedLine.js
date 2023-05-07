// Copyright 2018-2021, University of Colorado Boulder

/**
 * Calculation line below the 'multiplied' line, where all of the products from distribution are sorted by exponent.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import areaModelCommon from '../../../areaModelCommon.js';
import CalculationLine from './CalculationLine.js';
class OrderedLine extends CalculationLine {
  /**
   * @param {TermList} orderedTermList
   * @param {Area} area
   * @param {Property.<number|null>} activeIndexProperty
   * @param {boolean} allowExponents - Whether exponents (powers of x) are allowed
   * @param {boolean} isProportional - Whether the area is shown as proportional (instead of generic)
   */
  constructor(orderedTermList, area, activeIndexProperty, allowExponents, isProportional) {
    super(CalculationLine.ORDERED_LINE_INDEX, area.colorProperties, activeIndexProperty, allowExponents, isProportional);
    this.node = this.sumWithNegativeParens(orderedTermList.terms);
  }
}
areaModelCommon.register('OrderedLine', OrderedLine);
export default OrderedLine;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhcmVhTW9kZWxDb21tb24iLCJDYWxjdWxhdGlvbkxpbmUiLCJPcmRlcmVkTGluZSIsImNvbnN0cnVjdG9yIiwib3JkZXJlZFRlcm1MaXN0IiwiYXJlYSIsImFjdGl2ZUluZGV4UHJvcGVydHkiLCJhbGxvd0V4cG9uZW50cyIsImlzUHJvcG9ydGlvbmFsIiwiT1JERVJFRF9MSU5FX0lOREVYIiwiY29sb3JQcm9wZXJ0aWVzIiwibm9kZSIsInN1bVdpdGhOZWdhdGl2ZVBhcmVucyIsInRlcm1zIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJPcmRlcmVkTGluZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGlvbiBsaW5lIGJlbG93IHRoZSAnbXVsdGlwbGllZCcgbGluZSwgd2hlcmUgYWxsIG9mIHRoZSBwcm9kdWN0cyBmcm9tIGRpc3RyaWJ1dGlvbiBhcmUgc29ydGVkIGJ5IGV4cG9uZW50LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IGFyZWFNb2RlbENvbW1vbiBmcm9tICcuLi8uLi8uLi9hcmVhTW9kZWxDb21tb24uanMnO1xyXG5pbXBvcnQgQ2FsY3VsYXRpb25MaW5lIGZyb20gJy4vQ2FsY3VsYXRpb25MaW5lLmpzJztcclxuXHJcbmNsYXNzIE9yZGVyZWRMaW5lIGV4dGVuZHMgQ2FsY3VsYXRpb25MaW5lIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge1Rlcm1MaXN0fSBvcmRlcmVkVGVybUxpc3RcclxuICAgKiBAcGFyYW0ge0FyZWF9IGFyZWFcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxudW1iZXJ8bnVsbD59IGFjdGl2ZUluZGV4UHJvcGVydHlcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFsbG93RXhwb25lbnRzIC0gV2hldGhlciBleHBvbmVudHMgKHBvd2VycyBvZiB4KSBhcmUgYWxsb3dlZFxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNQcm9wb3J0aW9uYWwgLSBXaGV0aGVyIHRoZSBhcmVhIGlzIHNob3duIGFzIHByb3BvcnRpb25hbCAoaW5zdGVhZCBvZiBnZW5lcmljKVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBvcmRlcmVkVGVybUxpc3QsIGFyZWEsIGFjdGl2ZUluZGV4UHJvcGVydHksIGFsbG93RXhwb25lbnRzLCBpc1Byb3BvcnRpb25hbCApIHtcclxuICAgIHN1cGVyKCBDYWxjdWxhdGlvbkxpbmUuT1JERVJFRF9MSU5FX0lOREVYLCBhcmVhLmNvbG9yUHJvcGVydGllcywgYWN0aXZlSW5kZXhQcm9wZXJ0eSwgYWxsb3dFeHBvbmVudHMsIGlzUHJvcG9ydGlvbmFsICk7XHJcblxyXG4gICAgdGhpcy5ub2RlID0gdGhpcy5zdW1XaXRoTmVnYXRpdmVQYXJlbnMoIG9yZGVyZWRUZXJtTGlzdC50ZXJtcyApO1xyXG4gIH1cclxufVxyXG5cclxuYXJlYU1vZGVsQ29tbW9uLnJlZ2lzdGVyKCAnT3JkZXJlZExpbmUnLCBPcmRlcmVkTGluZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgT3JkZXJlZExpbmU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSw2QkFBNkI7QUFDekQsT0FBT0MsZUFBZSxNQUFNLHNCQUFzQjtBQUVsRCxNQUFNQyxXQUFXLFNBQVNELGVBQWUsQ0FBQztFQUN4QztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxXQUFXQSxDQUFFQyxlQUFlLEVBQUVDLElBQUksRUFBRUMsbUJBQW1CLEVBQUVDLGNBQWMsRUFBRUMsY0FBYyxFQUFHO0lBQ3hGLEtBQUssQ0FBRVAsZUFBZSxDQUFDUSxrQkFBa0IsRUFBRUosSUFBSSxDQUFDSyxlQUFlLEVBQUVKLG1CQUFtQixFQUFFQyxjQUFjLEVBQUVDLGNBQWUsQ0FBQztJQUV0SCxJQUFJLENBQUNHLElBQUksR0FBRyxJQUFJLENBQUNDLHFCQUFxQixDQUFFUixlQUFlLENBQUNTLEtBQU0sQ0FBQztFQUNqRTtBQUNGO0FBRUFiLGVBQWUsQ0FBQ2MsUUFBUSxDQUFFLGFBQWEsRUFBRVosV0FBWSxDQUFDO0FBRXRELGVBQWVBLFdBQVcifQ==