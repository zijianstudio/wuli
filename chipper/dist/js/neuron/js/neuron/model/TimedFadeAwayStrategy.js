// Copyright 2014-2020, University of Colorado Boulder

/**
 * A strategy that controls how a visible object fades out.  For this particular strategy, fading is based completely
 * on time, as opposed to position or some other parameter.  Works in conjunction with model elements that have the
 * appropriate API for fading.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import FadeStrategy from './FadeStrategy.js';
class TimedFadeAwayStrategy extends FadeStrategy {
  /**
   * @param {number} fadeTime - time, in seconds of sim time, for this to fade away
   */
  constructor(fadeTime) {
    super();
    this.fadeTime = fadeTime; // @private
    this.fadeCountdownTimer = fadeTime; // @private
  }

  // @public, @override
  updateOpacity(fadableModelElement, dt) {
    fadableModelElement.setOpacity(Math.min(Math.max(this.fadeCountdownTimer / this.fadeTime, 0), fadableModelElement.getOpacity()));
    this.fadeCountdownTimer -= dt;
  }

  // @public, @override
  shouldContinueExisting(fadeableModelElement) {
    return fadeableModelElement.getOpacity() > 0;
  }
}
neuron.register('TimedFadeAwayStrategy', TimedFadeAwayStrategy);
export default TimedFadeAwayStrategy;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJuZXVyb24iLCJGYWRlU3RyYXRlZ3kiLCJUaW1lZEZhZGVBd2F5U3RyYXRlZ3kiLCJjb25zdHJ1Y3RvciIsImZhZGVUaW1lIiwiZmFkZUNvdW50ZG93blRpbWVyIiwidXBkYXRlT3BhY2l0eSIsImZhZGFibGVNb2RlbEVsZW1lbnQiLCJkdCIsInNldE9wYWNpdHkiLCJNYXRoIiwibWluIiwibWF4IiwiZ2V0T3BhY2l0eSIsInNob3VsZENvbnRpbnVlRXhpc3RpbmciLCJmYWRlYWJsZU1vZGVsRWxlbWVudCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVGltZWRGYWRlQXdheVN0cmF0ZWd5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgc3RyYXRlZ3kgdGhhdCBjb250cm9scyBob3cgYSB2aXNpYmxlIG9iamVjdCBmYWRlcyBvdXQuICBGb3IgdGhpcyBwYXJ0aWN1bGFyIHN0cmF0ZWd5LCBmYWRpbmcgaXMgYmFzZWQgY29tcGxldGVseVxyXG4gKiBvbiB0aW1lLCBhcyBvcHBvc2VkIHRvIHBvc2l0aW9uIG9yIHNvbWUgb3RoZXIgcGFyYW1ldGVyLiAgV29ya3MgaW4gY29uanVuY3Rpb24gd2l0aCBtb2RlbCBlbGVtZW50cyB0aGF0IGhhdmUgdGhlXHJcbiAqIGFwcHJvcHJpYXRlIEFQSSBmb3IgZmFkaW5nLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgU2hhcmZ1ZGVlbiBBc2hyYWYgKGZvciBHaGVudCBVbml2ZXJzaXR5KVxyXG4gKi9cclxuXHJcbmltcG9ydCBuZXVyb24gZnJvbSAnLi4vLi4vbmV1cm9uLmpzJztcclxuaW1wb3J0IEZhZGVTdHJhdGVneSBmcm9tICcuL0ZhZGVTdHJhdGVneS5qcyc7XHJcblxyXG5jbGFzcyBUaW1lZEZhZGVBd2F5U3RyYXRlZ3kgZXh0ZW5kcyBGYWRlU3RyYXRlZ3kge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZmFkZVRpbWUgLSB0aW1lLCBpbiBzZWNvbmRzIG9mIHNpbSB0aW1lLCBmb3IgdGhpcyB0byBmYWRlIGF3YXlcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZmFkZVRpbWUgKSB7XHJcbiAgICBzdXBlcigpO1xyXG4gICAgdGhpcy5mYWRlVGltZSA9IGZhZGVUaW1lOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5mYWRlQ291bnRkb3duVGltZXIgPSBmYWRlVGltZTsgIC8vIEBwcml2YXRlXHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljLCBAb3ZlcnJpZGVcclxuICB1cGRhdGVPcGFjaXR5KCBmYWRhYmxlTW9kZWxFbGVtZW50LCBkdCApIHtcclxuICAgIGZhZGFibGVNb2RlbEVsZW1lbnQuc2V0T3BhY2l0eSggTWF0aC5taW4oIE1hdGgubWF4KCB0aGlzLmZhZGVDb3VudGRvd25UaW1lciAvIHRoaXMuZmFkZVRpbWUsIDAgKSwgZmFkYWJsZU1vZGVsRWxlbWVudC5nZXRPcGFjaXR5KCkgKSApO1xyXG4gICAgdGhpcy5mYWRlQ291bnRkb3duVGltZXIgLT0gZHQ7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljLCBAb3ZlcnJpZGVcclxuICBzaG91bGRDb250aW51ZUV4aXN0aW5nKCBmYWRlYWJsZU1vZGVsRWxlbWVudCApIHtcclxuICAgIHJldHVybiBmYWRlYWJsZU1vZGVsRWxlbWVudC5nZXRPcGFjaXR5KCkgPiAwO1xyXG4gIH1cclxufVxyXG5cclxubmV1cm9uLnJlZ2lzdGVyKCAnVGltZWRGYWRlQXdheVN0cmF0ZWd5JywgVGltZWRGYWRlQXdheVN0cmF0ZWd5ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUaW1lZEZhZGVBd2F5U3RyYXRlZ3k7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE1BQU0sTUFBTSxpQkFBaUI7QUFDcEMsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjtBQUU1QyxNQUFNQyxxQkFBcUIsU0FBU0QsWUFBWSxDQUFDO0VBRS9DO0FBQ0Y7QUFDQTtFQUNFRSxXQUFXQSxDQUFFQyxRQUFRLEVBQUc7SUFDdEIsS0FBSyxDQUFDLENBQUM7SUFDUCxJQUFJLENBQUNBLFFBQVEsR0FBR0EsUUFBUSxDQUFDLENBQUM7SUFDMUIsSUFBSSxDQUFDQyxrQkFBa0IsR0FBR0QsUUFBUSxDQUFDLENBQUU7RUFDdkM7O0VBRUE7RUFDQUUsYUFBYUEsQ0FBRUMsbUJBQW1CLEVBQUVDLEVBQUUsRUFBRztJQUN2Q0QsbUJBQW1CLENBQUNFLFVBQVUsQ0FBRUMsSUFBSSxDQUFDQyxHQUFHLENBQUVELElBQUksQ0FBQ0UsR0FBRyxDQUFFLElBQUksQ0FBQ1Asa0JBQWtCLEdBQUcsSUFBSSxDQUFDRCxRQUFRLEVBQUUsQ0FBRSxDQUFDLEVBQUVHLG1CQUFtQixDQUFDTSxVQUFVLENBQUMsQ0FBRSxDQUFFLENBQUM7SUFDdEksSUFBSSxDQUFDUixrQkFBa0IsSUFBSUcsRUFBRTtFQUMvQjs7RUFFQTtFQUNBTSxzQkFBc0JBLENBQUVDLG9CQUFvQixFQUFHO0lBQzdDLE9BQU9BLG9CQUFvQixDQUFDRixVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUM7RUFDOUM7QUFDRjtBQUVBYixNQUFNLENBQUNnQixRQUFRLENBQUUsdUJBQXVCLEVBQUVkLHFCQUFzQixDQUFDO0FBRWpFLGVBQWVBLHFCQUFxQiJ9