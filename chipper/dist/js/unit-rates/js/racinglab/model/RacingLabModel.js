// Copyright 2017-2023, University of Colorado Boulder

/**
 * Model for the 'Racing Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import blueCar_png from '../../../images/blueCar_png.js';
import redCar_png from '../../../images/redCar_png.js';
import URColors from '../../common/URColors.js';
import unitRates from '../../unitRates.js';
import RaceCar from './RaceCar.js';
export default class RacingLabModel {
  constructor() {
    // @public is the race running?
    this.runningProperty = new BooleanProperty(false);

    // @public the red (top) car
    this.car1 = new RaceCar(redCar_png, {
      color: URColors.car1,
      trackLength: 150
    });

    // @public the blue (bottom) car
    this.car2 = new RaceCar(blueCar_png, {
      color: URColors.car2,
      trackLength: 100,
      visible: false
    });

    // When both cars reach the finish line, stop the race.  unmulitlink not needed.
    Multilink.lazyMultilink([this.car1.distanceProperty, this.car2.distanceProperty], (distance1, distance2) => {
      if (this.car1.isAtFinish() && (!this.car2.visibleProperty.value || this.car2.isAtFinish())) {
        this.runningProperty.value = false;
      }
    });

    // If both cars are at the finish line, changing the state to running restarts the race. unlink not needed.
    this.runningProperty.link(running => {
      if (running && this.car1.isAtFinish() && (!this.car2.visibleProperty.value || this.car2.isAtFinish())) {
        this.car1.resetRace();
        this.car2.resetRace();
      }
    });

    // Reset the race when any of these Properties is changed. unmultilink not needed
    // See https://github.com/phetsims/unit-rates/issues/93
    Multilink.lazyMultilink([
    // changed via the scene radio buttons
    this.car2.visibleProperty,
    // changed via the Rate spinners
    this.car1.rate.numeratorProperty, this.car1.rate.denominatorProperty, this.car2.rate.numeratorProperty, this.car2.rate.denominatorProperty,
    // changed by dragging the finish line flags
    this.car1.track.lengthProperty, this.car2.track.lengthProperty], this.resetRace.bind(this));
  }

  // @public
  reset() {
    this.runningProperty.reset();
    this.car1.reset();
    this.car2.reset();
  }

  // @private resets the race
  resetRace() {
    this.runningProperty.reset();
    this.car1.resetRace();
    this.car2.resetRace();
  }

  /**
   * Updates time-dependent parts of the model.
   * @param {number} dt - time since the previous step, in seconds
   * @public
   */
  step(dt) {
    // Cap dt, see https://github.com/phetsims/unit-rates/issues/193
    dt = Math.min(dt, 0.1);
    if (this.runningProperty.value) {
      this.car1.step(dt);
      this.car2.step(dt);
    }
  }
}
unitRates.register('RacingLabModel', RacingLabModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJibHVlQ2FyX3BuZyIsInJlZENhcl9wbmciLCJVUkNvbG9ycyIsInVuaXRSYXRlcyIsIlJhY2VDYXIiLCJSYWNpbmdMYWJNb2RlbCIsImNvbnN0cnVjdG9yIiwicnVubmluZ1Byb3BlcnR5IiwiY2FyMSIsImNvbG9yIiwidHJhY2tMZW5ndGgiLCJjYXIyIiwidmlzaWJsZSIsImxhenlNdWx0aWxpbmsiLCJkaXN0YW5jZVByb3BlcnR5IiwiZGlzdGFuY2UxIiwiZGlzdGFuY2UyIiwiaXNBdEZpbmlzaCIsInZpc2libGVQcm9wZXJ0eSIsInZhbHVlIiwibGluayIsInJ1bm5pbmciLCJyZXNldFJhY2UiLCJyYXRlIiwibnVtZXJhdG9yUHJvcGVydHkiLCJkZW5vbWluYXRvclByb3BlcnR5IiwidHJhY2siLCJsZW5ndGhQcm9wZXJ0eSIsImJpbmQiLCJyZXNldCIsInN0ZXAiLCJkdCIsIk1hdGgiLCJtaW4iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJhY2luZ0xhYk1vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIGZvciB0aGUgJ1JhY2luZyBMYWInIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBibHVlQ2FyX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvYmx1ZUNhcl9wbmcuanMnO1xyXG5pbXBvcnQgcmVkQ2FyX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvcmVkQ2FyX3BuZy5qcyc7XHJcbmltcG9ydCBVUkNvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vVVJDb2xvcnMuanMnO1xyXG5pbXBvcnQgdW5pdFJhdGVzIGZyb20gJy4uLy4uL3VuaXRSYXRlcy5qcyc7XHJcbmltcG9ydCBSYWNlQ2FyIGZyb20gJy4vUmFjZUNhci5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSYWNpbmdMYWJNb2RlbCB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgIC8vIEBwdWJsaWMgaXMgdGhlIHJhY2UgcnVubmluZz9cclxuICAgIHRoaXMucnVubmluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHRoZSByZWQgKHRvcCkgY2FyXHJcbiAgICB0aGlzLmNhcjEgPSBuZXcgUmFjZUNhciggcmVkQ2FyX3BuZywge1xyXG4gICAgICBjb2xvcjogVVJDb2xvcnMuY2FyMSxcclxuICAgICAgdHJhY2tMZW5ndGg6IDE1MFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgdGhlIGJsdWUgKGJvdHRvbSkgY2FyXHJcbiAgICB0aGlzLmNhcjIgPSBuZXcgUmFjZUNhciggYmx1ZUNhcl9wbmcsIHtcclxuICAgICAgY29sb3I6IFVSQ29sb3JzLmNhcjIsXHJcbiAgICAgIHRyYWNrTGVuZ3RoOiAxMDAsXHJcbiAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gV2hlbiBib3RoIGNhcnMgcmVhY2ggdGhlIGZpbmlzaCBsaW5lLCBzdG9wIHRoZSByYWNlLiAgdW5tdWxpdGxpbmsgbm90IG5lZWRlZC5cclxuICAgIE11bHRpbGluay5sYXp5TXVsdGlsaW5rKFxyXG4gICAgICBbIHRoaXMuY2FyMS5kaXN0YW5jZVByb3BlcnR5LCB0aGlzLmNhcjIuZGlzdGFuY2VQcm9wZXJ0eSBdLFxyXG4gICAgICAoIGRpc3RhbmNlMSwgZGlzdGFuY2UyICkgPT4ge1xyXG4gICAgICAgIGlmICggdGhpcy5jYXIxLmlzQXRGaW5pc2goKSAmJiAoICF0aGlzLmNhcjIudmlzaWJsZVByb3BlcnR5LnZhbHVlIHx8IHRoaXMuY2FyMi5pc0F0RmluaXNoKCkgKSApIHtcclxuICAgICAgICAgIHRoaXMucnVubmluZ1Byb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gSWYgYm90aCBjYXJzIGFyZSBhdCB0aGUgZmluaXNoIGxpbmUsIGNoYW5naW5nIHRoZSBzdGF0ZSB0byBydW5uaW5nIHJlc3RhcnRzIHRoZSByYWNlLiB1bmxpbmsgbm90IG5lZWRlZC5cclxuICAgIHRoaXMucnVubmluZ1Byb3BlcnR5LmxpbmsoIHJ1bm5pbmcgPT4ge1xyXG4gICAgICBpZiAoIHJ1bm5pbmcgJiYgdGhpcy5jYXIxLmlzQXRGaW5pc2goKSAmJiAoICF0aGlzLmNhcjIudmlzaWJsZVByb3BlcnR5LnZhbHVlIHx8IHRoaXMuY2FyMi5pc0F0RmluaXNoKCkgKSApIHtcclxuICAgICAgICB0aGlzLmNhcjEucmVzZXRSYWNlKCk7XHJcbiAgICAgICAgdGhpcy5jYXIyLnJlc2V0UmFjZSgpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUmVzZXQgdGhlIHJhY2Ugd2hlbiBhbnkgb2YgdGhlc2UgUHJvcGVydGllcyBpcyBjaGFuZ2VkLiB1bm11bHRpbGluayBub3QgbmVlZGVkXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3VuaXQtcmF0ZXMvaXNzdWVzLzkzXHJcbiAgICBNdWx0aWxpbmsubGF6eU11bHRpbGluayggW1xyXG5cclxuICAgICAgICAvLyBjaGFuZ2VkIHZpYSB0aGUgc2NlbmUgcmFkaW8gYnV0dG9uc1xyXG4gICAgICAgIHRoaXMuY2FyMi52aXNpYmxlUHJvcGVydHksXHJcblxyXG4gICAgICAgIC8vIGNoYW5nZWQgdmlhIHRoZSBSYXRlIHNwaW5uZXJzXHJcbiAgICAgICAgdGhpcy5jYXIxLnJhdGUubnVtZXJhdG9yUHJvcGVydHksXHJcbiAgICAgICAgdGhpcy5jYXIxLnJhdGUuZGVub21pbmF0b3JQcm9wZXJ0eSxcclxuICAgICAgICB0aGlzLmNhcjIucmF0ZS5udW1lcmF0b3JQcm9wZXJ0eSxcclxuICAgICAgICB0aGlzLmNhcjIucmF0ZS5kZW5vbWluYXRvclByb3BlcnR5LFxyXG5cclxuICAgICAgICAvLyBjaGFuZ2VkIGJ5IGRyYWdnaW5nIHRoZSBmaW5pc2ggbGluZSBmbGFnc1xyXG4gICAgICAgIHRoaXMuY2FyMS50cmFjay5sZW5ndGhQcm9wZXJ0eSxcclxuICAgICAgICB0aGlzLmNhcjIudHJhY2subGVuZ3RoUHJvcGVydHlcclxuICAgICAgXSxcclxuICAgICAgdGhpcy5yZXNldFJhY2UuYmluZCggdGhpcyApICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLnJ1bm5pbmdQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5jYXIxLnJlc2V0KCk7XHJcbiAgICB0aGlzLmNhcjIucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlIHJlc2V0cyB0aGUgcmFjZVxyXG4gIHJlc2V0UmFjZSgpIHtcclxuICAgIHRoaXMucnVubmluZ1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmNhcjEucmVzZXRSYWNlKCk7XHJcbiAgICB0aGlzLmNhcjIucmVzZXRSYWNlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRpbWUtZGVwZW5kZW50IHBhcnRzIG9mIHRoZSBtb2RlbC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSB0aW1lIHNpbmNlIHRoZSBwcmV2aW91cyBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG5cclxuICAgIC8vIENhcCBkdCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy91bml0LXJhdGVzL2lzc3Vlcy8xOTNcclxuICAgIGR0ID0gTWF0aC5taW4oIGR0LCAwLjEgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMucnVubmluZ1Byb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICB0aGlzLmNhcjEuc3RlcCggZHQgKTtcclxuICAgICAgdGhpcy5jYXIyLnN0ZXAoIGR0ICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG51bml0UmF0ZXMucmVnaXN0ZXIoICdSYWNpbmdMYWJNb2RlbCcsIFJhY2luZ0xhYk1vZGVsICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxXQUFXLE1BQU0sZ0NBQWdDO0FBQ3hELE9BQU9DLFVBQVUsTUFBTSwrQkFBK0I7QUFDdEQsT0FBT0MsUUFBUSxNQUFNLDBCQUEwQjtBQUMvQyxPQUFPQyxTQUFTLE1BQU0sb0JBQW9CO0FBQzFDLE9BQU9DLE9BQU8sTUFBTSxjQUFjO0FBRWxDLGVBQWUsTUFBTUMsY0FBYyxDQUFDO0VBRWxDQyxXQUFXQSxDQUFBLEVBQUc7SUFFWjtJQUNBLElBQUksQ0FBQ0MsZUFBZSxHQUFHLElBQUlULGVBQWUsQ0FBRSxLQUFNLENBQUM7O0lBRW5EO0lBQ0EsSUFBSSxDQUFDVSxJQUFJLEdBQUcsSUFBSUosT0FBTyxDQUFFSCxVQUFVLEVBQUU7TUFDbkNRLEtBQUssRUFBRVAsUUFBUSxDQUFDTSxJQUFJO01BQ3BCRSxXQUFXLEVBQUU7SUFDZixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNDLElBQUksR0FBRyxJQUFJUCxPQUFPLENBQUVKLFdBQVcsRUFBRTtNQUNwQ1MsS0FBSyxFQUFFUCxRQUFRLENBQUNTLElBQUk7TUFDcEJELFdBQVcsRUFBRSxHQUFHO01BQ2hCRSxPQUFPLEVBQUU7SUFDWCxDQUFFLENBQUM7O0lBRUg7SUFD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