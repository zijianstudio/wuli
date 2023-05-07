// Copyright 2018-2022, University of Colorado Boulder

/**
 * A rectangle meant as a placeholder in the calculation lines (poolable).
 *
 * This is pooled for performance, as recreating the view structure had unacceptable performance/GC characteristics.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ReadOnlyProperty from '../../../../../axon/js/ReadOnlyProperty.js';
import Poolable from '../../../../../phet-core/js/Poolable.js';
import { Rectangle } from '../../../../../scenery/js/imports.js';
import areaModelCommon from '../../../areaModelCommon.js';
import AreaModelCommonStrings from '../../../AreaModelCommonStrings.js';
const placeholderString = AreaModelCommonStrings.a11y.placeholder;
class PlaceholderBox extends Rectangle {
  /**
   * @param {Property.<Color>} colorProperty
   * @param {boolean} allowExponents - Whether exponents (powers of x) are allowed
   */
  constructor(colorProperty, allowExponents) {
    super(0, 0, 16, 16, {
      lineWidth: 0.7,
      // pdom
      tagName: 'mi',
      pdomNamespace: 'http://www.w3.org/1998/Math/MathML',
      innerContent: placeholderString
    });

    // @public {string}
    this.accessibleText = placeholderString;
    this.initialize(colorProperty, allowExponents);
  }

  /**
   * @public
   *
   * @param {Property.<Color>} colorProperty
   * @param {boolean} allowExponents - Whether exponents (powers of x) are allowed
   */
  initialize(colorProperty, allowExponents) {
    assert && assert(colorProperty instanceof ReadOnlyProperty);
    assert && assert(typeof allowExponents === 'boolean');
    this.stroke = colorProperty;
    this.localBounds = this.selfBounds.dilatedX(allowExponents ? 2 : 0);
  }

  /**
   * Clears the state of this node (releasing references) so it can be freed to the pool (and potentially GC'ed).
   * @public
   */
  clean() {
    this.stroke = null;
    this.freeToPool();
  }
}
areaModelCommon.register('PlaceholderBox', PlaceholderBox);
Poolable.mixInto(PlaceholderBox);
export default PlaceholderBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFkT25seVByb3BlcnR5IiwiUG9vbGFibGUiLCJSZWN0YW5nbGUiLCJhcmVhTW9kZWxDb21tb24iLCJBcmVhTW9kZWxDb21tb25TdHJpbmdzIiwicGxhY2Vob2xkZXJTdHJpbmciLCJhMTF5IiwicGxhY2Vob2xkZXIiLCJQbGFjZWhvbGRlckJveCIsImNvbnN0cnVjdG9yIiwiY29sb3JQcm9wZXJ0eSIsImFsbG93RXhwb25lbnRzIiwibGluZVdpZHRoIiwidGFnTmFtZSIsInBkb21OYW1lc3BhY2UiLCJpbm5lckNvbnRlbnQiLCJhY2Nlc3NpYmxlVGV4dCIsImluaXRpYWxpemUiLCJhc3NlcnQiLCJzdHJva2UiLCJsb2NhbEJvdW5kcyIsInNlbGZCb3VuZHMiLCJkaWxhdGVkWCIsImNsZWFuIiwiZnJlZVRvUG9vbCIsInJlZ2lzdGVyIiwibWl4SW50byJdLCJzb3VyY2VzIjpbIlBsYWNlaG9sZGVyQm94LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgcmVjdGFuZ2xlIG1lYW50IGFzIGEgcGxhY2Vob2xkZXIgaW4gdGhlIGNhbGN1bGF0aW9uIGxpbmVzIChwb29sYWJsZSkuXHJcbiAqXHJcbiAqIFRoaXMgaXMgcG9vbGVkIGZvciBwZXJmb3JtYW5jZSwgYXMgcmVjcmVhdGluZyB0aGUgdmlldyBzdHJ1Y3R1cmUgaGFkIHVuYWNjZXB0YWJsZSBwZXJmb3JtYW5jZS9HQyBjaGFyYWN0ZXJpc3RpY3MuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL1JlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUG9vbGFibGUgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2xhYmxlLmpzJztcclxuaW1wb3J0IHsgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGFyZWFNb2RlbENvbW1vbiBmcm9tICcuLi8uLi8uLi9hcmVhTW9kZWxDb21tb24uanMnO1xyXG5pbXBvcnQgQXJlYU1vZGVsQ29tbW9uU3RyaW5ncyBmcm9tICcuLi8uLi8uLi9BcmVhTW9kZWxDb21tb25TdHJpbmdzLmpzJztcclxuXHJcbmNvbnN0IHBsYWNlaG9sZGVyU3RyaW5nID0gQXJlYU1vZGVsQ29tbW9uU3RyaW5ncy5hMTF5LnBsYWNlaG9sZGVyO1xyXG5cclxuY2xhc3MgUGxhY2Vob2xkZXJCb3ggZXh0ZW5kcyBSZWN0YW5nbGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPENvbG9yPn0gY29sb3JQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYWxsb3dFeHBvbmVudHMgLSBXaGV0aGVyIGV4cG9uZW50cyAocG93ZXJzIG9mIHgpIGFyZSBhbGxvd2VkXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNvbG9yUHJvcGVydHksIGFsbG93RXhwb25lbnRzICkge1xyXG5cclxuICAgIHN1cGVyKCAwLCAwLCAxNiwgMTYsIHtcclxuICAgICAgbGluZVdpZHRoOiAwLjcsXHJcblxyXG4gICAgICAvLyBwZG9tXHJcbiAgICAgIHRhZ05hbWU6ICdtaScsXHJcbiAgICAgIHBkb21OYW1lc3BhY2U6ICdodHRwOi8vd3d3LnczLm9yZy8xOTk4L01hdGgvTWF0aE1MJyxcclxuICAgICAgaW5uZXJDb250ZW50OiBwbGFjZWhvbGRlclN0cmluZ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ31cclxuICAgIHRoaXMuYWNjZXNzaWJsZVRleHQgPSBwbGFjZWhvbGRlclN0cmluZztcclxuXHJcbiAgICB0aGlzLmluaXRpYWxpemUoIGNvbG9yUHJvcGVydHksIGFsbG93RXhwb25lbnRzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxDb2xvcj59IGNvbG9yUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFsbG93RXhwb25lbnRzIC0gV2hldGhlciBleHBvbmVudHMgKHBvd2VycyBvZiB4KSBhcmUgYWxsb3dlZFxyXG4gICAqL1xyXG4gIGluaXRpYWxpemUoIGNvbG9yUHJvcGVydHksIGFsbG93RXhwb25lbnRzICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY29sb3JQcm9wZXJ0eSBpbnN0YW5jZW9mIFJlYWRPbmx5UHJvcGVydHkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBhbGxvd0V4cG9uZW50cyA9PT0gJ2Jvb2xlYW4nICk7XHJcblxyXG4gICAgdGhpcy5zdHJva2UgPSBjb2xvclByb3BlcnR5O1xyXG4gICAgdGhpcy5sb2NhbEJvdW5kcyA9IHRoaXMuc2VsZkJvdW5kcy5kaWxhdGVkWCggYWxsb3dFeHBvbmVudHMgPyAyIDogMCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYXJzIHRoZSBzdGF0ZSBvZiB0aGlzIG5vZGUgKHJlbGVhc2luZyByZWZlcmVuY2VzKSBzbyBpdCBjYW4gYmUgZnJlZWQgdG8gdGhlIHBvb2wgKGFuZCBwb3RlbnRpYWxseSBHQydlZCkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNsZWFuKCkge1xyXG4gICAgdGhpcy5zdHJva2UgPSBudWxsO1xyXG4gICAgdGhpcy5mcmVlVG9Qb29sKCk7XHJcbiAgfVxyXG59XHJcblxyXG5hcmVhTW9kZWxDb21tb24ucmVnaXN0ZXIoICdQbGFjZWhvbGRlckJveCcsIFBsYWNlaG9sZGVyQm94ICk7XHJcblxyXG5Qb29sYWJsZS5taXhJbnRvKCBQbGFjZWhvbGRlckJveCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGxhY2Vob2xkZXJCb3g7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxnQkFBZ0IsTUFBTSw0Q0FBNEM7QUFDekUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxTQUFTLFFBQVEsc0NBQXNDO0FBQ2hFLE9BQU9DLGVBQWUsTUFBTSw2QkFBNkI7QUFDekQsT0FBT0Msc0JBQXNCLE1BQU0sb0NBQW9DO0FBRXZFLE1BQU1DLGlCQUFpQixHQUFHRCxzQkFBc0IsQ0FBQ0UsSUFBSSxDQUFDQyxXQUFXO0FBRWpFLE1BQU1DLGNBQWMsU0FBU04sU0FBUyxDQUFDO0VBQ3JDO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VPLFdBQVdBLENBQUVDLGFBQWEsRUFBRUMsY0FBYyxFQUFHO0lBRTNDLEtBQUssQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7TUFDbkJDLFNBQVMsRUFBRSxHQUFHO01BRWQ7TUFDQUMsT0FBTyxFQUFFLElBQUk7TUFDYkMsYUFBYSxFQUFFLG9DQUFvQztNQUNuREMsWUFBWSxFQUFFVjtJQUNoQixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNXLGNBQWMsR0FBR1gsaUJBQWlCO0lBRXZDLElBQUksQ0FBQ1ksVUFBVSxDQUFFUCxhQUFhLEVBQUVDLGNBQWUsQ0FBQztFQUNsRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU0sVUFBVUEsQ0FBRVAsYUFBYSxFQUFFQyxjQUFjLEVBQUc7SUFDMUNPLE1BQU0sSUFBSUEsTUFBTSxDQUFFUixhQUFhLFlBQVlWLGdCQUFpQixDQUFDO0lBQzdEa0IsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT1AsY0FBYyxLQUFLLFNBQVUsQ0FBQztJQUV2RCxJQUFJLENBQUNRLE1BQU0sR0FBR1QsYUFBYTtJQUMzQixJQUFJLENBQUNVLFdBQVcsR0FBRyxJQUFJLENBQUNDLFVBQVUsQ0FBQ0MsUUFBUSxDQUFFWCxjQUFjLEdBQUcsQ0FBQyxHQUFHLENBQUUsQ0FBQztFQUN2RTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFWSxLQUFLQSxDQUFBLEVBQUc7SUFDTixJQUFJLENBQUNKLE1BQU0sR0FBRyxJQUFJO0lBQ2xCLElBQUksQ0FBQ0ssVUFBVSxDQUFDLENBQUM7RUFDbkI7QUFDRjtBQUVBckIsZUFBZSxDQUFDc0IsUUFBUSxDQUFFLGdCQUFnQixFQUFFakIsY0FBZSxDQUFDO0FBRTVEUCxRQUFRLENBQUN5QixPQUFPLENBQUVsQixjQUFlLENBQUM7QUFFbEMsZUFBZUEsY0FBYyJ9