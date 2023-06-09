// Copyright 2018-2021, University of Colorado Boulder

/**
 * Calculation line below the 'expanded' line, where things are "multiplied out" and distributed.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Orientation from '../../../../../phet-core/js/Orientation.js';
import areaModelCommon from '../../../areaModelCommon.js';
import AreaModelCommonConstants from '../../AreaModelCommonConstants.js';
import CalculationLine from './CalculationLine.js';
class DistributionLine extends CalculationLine {
  /**
   * @param {Array.<Term>} horizontalTerms
   * @param {Array.<Term>} verticalTerms
   * @param {Area} area
   * @param {Property.<number|null>} activeIndexProperty
   * @param {boolean} allowExponents - Whether exponents (powers of x) are allowed
   * @param {boolean} isProportional - Whether the area is shown as proportional (instead of generic)
   */
  constructor(horizontalTerms, verticalTerms, area, activeIndexProperty, allowExponents, isProportional) {
    super(CalculationLine.DISTRIBUTION_LINE_INDEX, area.colorProperties, activeIndexProperty, allowExponents, isProportional);
    this.node = this.sumGroup(_.flatten(verticalTerms.map(verticalTerm => horizontalTerms.map(horizontalTerm => {
      const horizontalText = this.orientedTermText(Orientation.HORIZONTAL, horizontalTerm);
      const verticalText = this.orientedTermText(Orientation.VERTICAL, verticalTerm);

      // Proportional uses X-multiplication, see https://github.com/phetsims/area-model-common/issues/71
      if (isProportional) {
        return this.parentheses(this.multiplyX(verticalText, horizontalText));
      } else if (allowExponents) {
        return this.group([this.parentheses(verticalText), this.parentheses(horizontalText)], AreaModelCommonConstants.CALCULATION_PAREN_PAREN_PADDING);
      }
      // Generic Screen (non-proportional, no exponents) uses dot, see https://github.com/phetsims/area-model-common/issues/72
      else {
        return this.parentheses(this.multiplyX(verticalText, horizontalText));
      }
    }))));
  }
}
areaModelCommon.register('DistributionLine', DistributionLine);
export default DistributionLine;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPcmllbnRhdGlvbiIsImFyZWFNb2RlbENvbW1vbiIsIkFyZWFNb2RlbENvbW1vbkNvbnN0YW50cyIsIkNhbGN1bGF0aW9uTGluZSIsIkRpc3RyaWJ1dGlvbkxpbmUiLCJjb25zdHJ1Y3RvciIsImhvcml6b250YWxUZXJtcyIsInZlcnRpY2FsVGVybXMiLCJhcmVhIiwiYWN0aXZlSW5kZXhQcm9wZXJ0eSIsImFsbG93RXhwb25lbnRzIiwiaXNQcm9wb3J0aW9uYWwiLCJESVNUUklCVVRJT05fTElORV9JTkRFWCIsImNvbG9yUHJvcGVydGllcyIsIm5vZGUiLCJzdW1Hcm91cCIsIl8iLCJmbGF0dGVuIiwibWFwIiwidmVydGljYWxUZXJtIiwiaG9yaXpvbnRhbFRlcm0iLCJob3Jpem9udGFsVGV4dCIsIm9yaWVudGVkVGVybVRleHQiLCJIT1JJWk9OVEFMIiwidmVydGljYWxUZXh0IiwiVkVSVElDQUwiLCJwYXJlbnRoZXNlcyIsIm11bHRpcGx5WCIsImdyb3VwIiwiQ0FMQ1VMQVRJT05fUEFSRU5fUEFSRU5fUEFERElORyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRGlzdHJpYnV0aW9uTGluZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGlvbiBsaW5lIGJlbG93IHRoZSAnZXhwYW5kZWQnIGxpbmUsIHdoZXJlIHRoaW5ncyBhcmUgXCJtdWx0aXBsaWVkIG91dFwiIGFuZCBkaXN0cmlidXRlZC5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBPcmllbnRhdGlvbiBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvT3JpZW50YXRpb24uanMnO1xyXG5pbXBvcnQgYXJlYU1vZGVsQ29tbW9uIGZyb20gJy4uLy4uLy4uL2FyZWFNb2RlbENvbW1vbi5qcyc7XHJcbmltcG9ydCBBcmVhTW9kZWxDb21tb25Db25zdGFudHMgZnJvbSAnLi4vLi4vQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IENhbGN1bGF0aW9uTGluZSBmcm9tICcuL0NhbGN1bGF0aW9uTGluZS5qcyc7XHJcblxyXG5jbGFzcyBEaXN0cmlidXRpb25MaW5lIGV4dGVuZHMgQ2FsY3VsYXRpb25MaW5lIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge0FycmF5LjxUZXJtPn0gaG9yaXpvbnRhbFRlcm1zXHJcbiAgICogQHBhcmFtIHtBcnJheS48VGVybT59IHZlcnRpY2FsVGVybXNcclxuICAgKiBAcGFyYW0ge0FyZWF9IGFyZWFcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxudW1iZXJ8bnVsbD59IGFjdGl2ZUluZGV4UHJvcGVydHlcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFsbG93RXhwb25lbnRzIC0gV2hldGhlciBleHBvbmVudHMgKHBvd2VycyBvZiB4KSBhcmUgYWxsb3dlZFxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNQcm9wb3J0aW9uYWwgLSBXaGV0aGVyIHRoZSBhcmVhIGlzIHNob3duIGFzIHByb3BvcnRpb25hbCAoaW5zdGVhZCBvZiBnZW5lcmljKVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBob3Jpem9udGFsVGVybXMsIHZlcnRpY2FsVGVybXMsIGFyZWEsIGFjdGl2ZUluZGV4UHJvcGVydHksIGFsbG93RXhwb25lbnRzLCBpc1Byb3BvcnRpb25hbCApIHtcclxuXHJcbiAgICBzdXBlciggQ2FsY3VsYXRpb25MaW5lLkRJU1RSSUJVVElPTl9MSU5FX0lOREVYLCBhcmVhLmNvbG9yUHJvcGVydGllcywgYWN0aXZlSW5kZXhQcm9wZXJ0eSwgYWxsb3dFeHBvbmVudHMsIGlzUHJvcG9ydGlvbmFsICk7XHJcblxyXG4gICAgdGhpcy5ub2RlID0gdGhpcy5zdW1Hcm91cCggXy5mbGF0dGVuKCB2ZXJ0aWNhbFRlcm1zLm1hcCggdmVydGljYWxUZXJtID0+IGhvcml6b250YWxUZXJtcy5tYXAoIGhvcml6b250YWxUZXJtID0+IHtcclxuICAgICAgY29uc3QgaG9yaXpvbnRhbFRleHQgPSB0aGlzLm9yaWVudGVkVGVybVRleHQoIE9yaWVudGF0aW9uLkhPUklaT05UQUwsIGhvcml6b250YWxUZXJtICk7XHJcbiAgICAgIGNvbnN0IHZlcnRpY2FsVGV4dCA9IHRoaXMub3JpZW50ZWRUZXJtVGV4dCggT3JpZW50YXRpb24uVkVSVElDQUwsIHZlcnRpY2FsVGVybSApO1xyXG5cclxuICAgICAgLy8gUHJvcG9ydGlvbmFsIHVzZXMgWC1tdWx0aXBsaWNhdGlvbiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9hcmVhLW1vZGVsLWNvbW1vbi9pc3N1ZXMvNzFcclxuICAgICAgaWYgKCBpc1Byb3BvcnRpb25hbCApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnRoZXNlcyggdGhpcy5tdWx0aXBseVgoIHZlcnRpY2FsVGV4dCwgaG9yaXpvbnRhbFRleHQgKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBhbGxvd0V4cG9uZW50cyApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cCggW1xyXG4gICAgICAgICAgdGhpcy5wYXJlbnRoZXNlcyggdmVydGljYWxUZXh0ICksXHJcbiAgICAgICAgICB0aGlzLnBhcmVudGhlc2VzKCBob3Jpem9udGFsVGV4dCApXHJcbiAgICAgICAgXSwgQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzLkNBTENVTEFUSU9OX1BBUkVOX1BBUkVOX1BBRERJTkcgKTtcclxuICAgICAgfVxyXG4gICAgICAvLyBHZW5lcmljIFNjcmVlbiAobm9uLXByb3BvcnRpb25hbCwgbm8gZXhwb25lbnRzKSB1c2VzIGRvdCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9hcmVhLW1vZGVsLWNvbW1vbi9pc3N1ZXMvNzJcclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyZW50aGVzZXMoIHRoaXMubXVsdGlwbHlYKCB2ZXJ0aWNhbFRleHQsIGhvcml6b250YWxUZXh0ICkgKTtcclxuICAgICAgfVxyXG4gICAgfSApICkgKSApO1xyXG4gIH1cclxufVxyXG5cclxuYXJlYU1vZGVsQ29tbW9uLnJlZ2lzdGVyKCAnRGlzdHJpYnV0aW9uTGluZScsIERpc3RyaWJ1dGlvbkxpbmUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IERpc3RyaWJ1dGlvbkxpbmU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLDZCQUE2QjtBQUN6RCxPQUFPQyx3QkFBd0IsTUFBTSxtQ0FBbUM7QUFDeEUsT0FBT0MsZUFBZSxNQUFNLHNCQUFzQjtBQUVsRCxNQUFNQyxnQkFBZ0IsU0FBU0QsZUFBZSxDQUFDO0VBQzdDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsV0FBV0EsQ0FBRUMsZUFBZSxFQUFFQyxhQUFhLEVBQUVDLElBQUksRUFBRUMsbUJBQW1CLEVBQUVDLGNBQWMsRUFBRUMsY0FBYyxFQUFHO0lBRXZHLEtBQUssQ0FBRVIsZUFBZSxDQUFDUyx1QkFBdUIsRUFBRUosSUFBSSxDQUFDSyxlQUFlLEVBQUVKLG1CQUFtQixFQUFFQyxjQUFjLEVBQUVDLGNBQWUsQ0FBQztJQUUzSCxJQUFJLENBQUNHLElBQUksR0FBRyxJQUFJLENBQUNDLFFBQVEsQ0FBRUMsQ0FBQyxDQUFDQyxPQUFPLENBQUVWLGFBQWEsQ0FBQ1csR0FBRyxDQUFFQyxZQUFZLElBQUliLGVBQWUsQ0FBQ1ksR0FBRyxDQUFFRSxjQUFjLElBQUk7TUFDOUcsTUFBTUMsY0FBYyxHQUFHLElBQUksQ0FBQ0MsZ0JBQWdCLENBQUV0QixXQUFXLENBQUN1QixVQUFVLEVBQUVILGNBQWUsQ0FBQztNQUN0RixNQUFNSSxZQUFZLEdBQUcsSUFBSSxDQUFDRixnQkFBZ0IsQ0FBRXRCLFdBQVcsQ0FBQ3lCLFFBQVEsRUFBRU4sWUFBYSxDQUFDOztNQUVoRjtNQUNBLElBQUtSLGNBQWMsRUFBRztRQUNwQixPQUFPLElBQUksQ0FBQ2UsV0FBVyxDQUFFLElBQUksQ0FBQ0MsU0FBUyxDQUFFSCxZQUFZLEVBQUVILGNBQWUsQ0FBRSxDQUFDO01BQzNFLENBQUMsTUFDSSxJQUFLWCxjQUFjLEVBQUc7UUFDekIsT0FBTyxJQUFJLENBQUNrQixLQUFLLENBQUUsQ0FDakIsSUFBSSxDQUFDRixXQUFXLENBQUVGLFlBQWEsQ0FBQyxFQUNoQyxJQUFJLENBQUNFLFdBQVcsQ0FBRUwsY0FBZSxDQUFDLENBQ25DLEVBQUVuQix3QkFBd0IsQ0FBQzJCLCtCQUFnQyxDQUFDO01BQy9EO01BQ0E7TUFBQSxLQUNLO1FBQ0gsT0FBTyxJQUFJLENBQUNILFdBQVcsQ0FBRSxJQUFJLENBQUNDLFNBQVMsQ0FBRUgsWUFBWSxFQUFFSCxjQUFlLENBQUUsQ0FBQztNQUMzRTtJQUNGLENBQUUsQ0FBRSxDQUFFLENBQUUsQ0FBQztFQUNYO0FBQ0Y7QUFFQXBCLGVBQWUsQ0FBQzZCLFFBQVEsQ0FBRSxrQkFBa0IsRUFBRTFCLGdCQUFpQixDQUFDO0FBRWhFLGVBQWVBLGdCQUFnQiJ9