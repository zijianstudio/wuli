// Copyright 2015-2020, University of Colorado Boulder

/**
 * Point model in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Saurabh Totey
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingConstants from '../CurveFittingConstants.js';
class Point {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      position: new Vector2(0, 0),
      // {Vector2} initial position
      dragging: false // {boolean} is the user dragging the point?
    }, options);

    // @public {Property.<Vector2>} position of point
    this.positionProperty = new Vector2Property(options.position);

    // @public {Property.<boolean>} Property that reflects whether the user is dragging the point
    this.draggingProperty = new BooleanProperty(options.dragging);

    // @public {Property.<number>} vertical uncertainty of the point.
    this.deltaProperty = new NumberProperty(0.8);

    // @private {Animation|null} the animation of this point; is null if there is no animation
    this.animation = null;

    // @public {Property.<boolean>} a Property that reflects whether the point is in the graph
    // No dispose needed because Point owns all dependencies
    this.isInsideGraphProperty = new DerivedProperty([this.positionProperty], position => CurveFittingConstants.GRAPH_BACKGROUND_MODEL_BOUNDS.containsPoint(position), {
      valueType: 'boolean'
    });

    // if the user dropped the point outside of the graph send it back to the bucket
    this.draggingProperty.link(dragging => {
      if (!dragging && !this.isInsideGraphProperty.value && this.animation === null) {
        this.animate();
      }
      if (dragging && this.animation !== null) {
        this.animation.stop();
      }
    });

    // @public (read-only) create emitter that will signal that the point has returned to the bucket
    this.returnToOriginEmitter = new Emitter();
  }

  /**
   * Animates the point back to its original position (inside the bucket).
   *
   * @public
   */
  animate() {
    // distance to the origin
    const getDistanceToOrigin = () => this.positionProperty.initialValue.distance(this.positionProperty.value);
    const distance = getDistanceToOrigin();
    if (distance > 0) {
      // sets up the animation
      this.animation = new Animation({
        property: this.positionProperty,
        to: this.positionProperty.initialValue,
        duration: distance / CurveFittingConstants.ANIMATION_SPEED,
        easing: Easing.LINEAR
      });

      // once the animation is done, set the animation field to null
      // if the final destination was reached, emit the returnToOriginEmitter
      const onAnimationEnd = () => {
        if (getDistanceToOrigin() === 0) {
          this.returnToOriginEmitter.emit();
        }
        this.animation.endedEmitter.removeListener(onAnimationEnd);
        this.animation = null;
      };
      this.animation.endedEmitter.addListener(onAnimationEnd); // removed when animation ends

      this.animation.start();
    } else {
      // if the point is already at where it belongs, just emit and forgo the animation
      this.returnToOriginEmitter.emit();
    }
  }
}
curveFitting.register('Point', Point);
export default Point;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJWZWN0b3IyIiwiVmVjdG9yMlByb3BlcnR5IiwibWVyZ2UiLCJBbmltYXRpb24iLCJFYXNpbmciLCJjdXJ2ZUZpdHRpbmciLCJDdXJ2ZUZpdHRpbmdDb25zdGFudHMiLCJQb2ludCIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsInBvc2l0aW9uIiwiZHJhZ2dpbmciLCJwb3NpdGlvblByb3BlcnR5IiwiZHJhZ2dpbmdQcm9wZXJ0eSIsImRlbHRhUHJvcGVydHkiLCJhbmltYXRpb24iLCJpc0luc2lkZUdyYXBoUHJvcGVydHkiLCJHUkFQSF9CQUNLR1JPVU5EX01PREVMX0JPVU5EUyIsImNvbnRhaW5zUG9pbnQiLCJ2YWx1ZVR5cGUiLCJsaW5rIiwidmFsdWUiLCJhbmltYXRlIiwic3RvcCIsInJldHVyblRvT3JpZ2luRW1pdHRlciIsImdldERpc3RhbmNlVG9PcmlnaW4iLCJpbml0aWFsVmFsdWUiLCJkaXN0YW5jZSIsInByb3BlcnR5IiwidG8iLCJkdXJhdGlvbiIsIkFOSU1BVElPTl9TUEVFRCIsImVhc2luZyIsIkxJTkVBUiIsIm9uQW5pbWF0aW9uRW5kIiwiZW1pdCIsImVuZGVkRW1pdHRlciIsInJlbW92ZUxpc3RlbmVyIiwiYWRkTGlzdGVuZXIiLCJzdGFydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUG9pbnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUG9pbnQgbW9kZWwgaW4gJ0N1cnZlIEZpdHRpbmcnIHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmV5IFplbGVua292IChNbGVhcm5lcilcclxuICogQGF1dGhvciBTYXVyYWJoIFRvdGV5XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBBbmltYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvQW5pbWF0aW9uLmpzJztcclxuaW1wb3J0IEVhc2luZyBmcm9tICcuLi8uLi8uLi8uLi90d2l4dC9qcy9FYXNpbmcuanMnO1xyXG5pbXBvcnQgY3VydmVGaXR0aW5nIGZyb20gJy4uLy4uL2N1cnZlRml0dGluZy5qcyc7XHJcbmltcG9ydCBDdXJ2ZUZpdHRpbmdDb25zdGFudHMgZnJvbSAnLi4vQ3VydmVGaXR0aW5nQ29uc3RhbnRzLmpzJztcclxuXHJcbmNsYXNzIFBvaW50IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIDAsIDAgKSwgLy8ge1ZlY3RvcjJ9IGluaXRpYWwgcG9zaXRpb25cclxuICAgICAgZHJhZ2dpbmc6IGZhbHNlIC8vIHtib29sZWFufSBpcyB0aGUgdXNlciBkcmFnZ2luZyB0aGUgcG9pbnQ/XHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPFZlY3RvcjI+fSBwb3NpdGlvbiBvZiBwb2ludFxyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggb3B0aW9ucy5wb3NpdGlvbiApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gUHJvcGVydHkgdGhhdCByZWZsZWN0cyB3aGV0aGVyIHRoZSB1c2VyIGlzIGRyYWdnaW5nIHRoZSBwb2ludFxyXG4gICAgdGhpcy5kcmFnZ2luZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggb3B0aW9ucy5kcmFnZ2luZyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSB2ZXJ0aWNhbCB1bmNlcnRhaW50eSBvZiB0aGUgcG9pbnQuXHJcbiAgICB0aGlzLmRlbHRhUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAuOCApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBbmltYXRpb258bnVsbH0gdGhlIGFuaW1hdGlvbiBvZiB0aGlzIHBvaW50OyBpcyBudWxsIGlmIHRoZXJlIGlzIG5vIGFuaW1hdGlvblxyXG4gICAgdGhpcy5hbmltYXRpb24gPSBudWxsO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gYSBQcm9wZXJ0eSB0aGF0IHJlZmxlY3RzIHdoZXRoZXIgdGhlIHBvaW50IGlzIGluIHRoZSBncmFwaFxyXG4gICAgLy8gTm8gZGlzcG9zZSBuZWVkZWQgYmVjYXVzZSBQb2ludCBvd25zIGFsbCBkZXBlbmRlbmNpZXNcclxuICAgIHRoaXMuaXNJbnNpZGVHcmFwaFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyB0aGlzLnBvc2l0aW9uUHJvcGVydHkgXSxcclxuICAgICAgcG9zaXRpb24gPT4gQ3VydmVGaXR0aW5nQ29uc3RhbnRzLkdSQVBIX0JBQ0tHUk9VTkRfTU9ERUxfQk9VTkRTLmNvbnRhaW5zUG9pbnQoIHBvc2l0aW9uICksXHJcbiAgICAgIHsgdmFsdWVUeXBlOiAnYm9vbGVhbicgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBpZiB0aGUgdXNlciBkcm9wcGVkIHRoZSBwb2ludCBvdXRzaWRlIG9mIHRoZSBncmFwaCBzZW5kIGl0IGJhY2sgdG8gdGhlIGJ1Y2tldFxyXG4gICAgdGhpcy5kcmFnZ2luZ1Byb3BlcnR5LmxpbmsoIGRyYWdnaW5nID0+IHtcclxuICAgICAgaWYgKCAhZHJhZ2dpbmcgJiYgIXRoaXMuaXNJbnNpZGVHcmFwaFByb3BlcnR5LnZhbHVlICYmIHRoaXMuYW5pbWF0aW9uID09PSBudWxsICkge1xyXG4gICAgICAgIHRoaXMuYW5pbWF0ZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggZHJhZ2dpbmcgJiYgdGhpcy5hbmltYXRpb24gIT09IG51bGwgKSB7XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb24uc3RvcCgpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSBjcmVhdGUgZW1pdHRlciB0aGF0IHdpbGwgc2lnbmFsIHRoYXQgdGhlIHBvaW50IGhhcyByZXR1cm5lZCB0byB0aGUgYnVja2V0XHJcbiAgICB0aGlzLnJldHVyblRvT3JpZ2luRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBbmltYXRlcyB0aGUgcG9pbnQgYmFjayB0byBpdHMgb3JpZ2luYWwgcG9zaXRpb24gKGluc2lkZSB0aGUgYnVja2V0KS5cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhbmltYXRlKCkge1xyXG5cclxuICAgIC8vIGRpc3RhbmNlIHRvIHRoZSBvcmlnaW5cclxuICAgIGNvbnN0IGdldERpc3RhbmNlVG9PcmlnaW4gPSAoKSA9PiB0aGlzLnBvc2l0aW9uUHJvcGVydHkuaW5pdGlhbFZhbHVlLmRpc3RhbmNlKCB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuICAgIGNvbnN0IGRpc3RhbmNlID0gZ2V0RGlzdGFuY2VUb09yaWdpbigpO1xyXG5cclxuICAgIGlmICggZGlzdGFuY2UgPiAwICkge1xyXG5cclxuICAgICAgLy8gc2V0cyB1cCB0aGUgYW5pbWF0aW9uXHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigge1xyXG4gICAgICAgIHByb3BlcnR5OiB0aGlzLnBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgICAgdG86IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5pbml0aWFsVmFsdWUsXHJcbiAgICAgICAgZHVyYXRpb246IGRpc3RhbmNlIC8gQ3VydmVGaXR0aW5nQ29uc3RhbnRzLkFOSU1BVElPTl9TUEVFRCxcclxuICAgICAgICBlYXNpbmc6IEVhc2luZy5MSU5FQVJcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gb25jZSB0aGUgYW5pbWF0aW9uIGlzIGRvbmUsIHNldCB0aGUgYW5pbWF0aW9uIGZpZWxkIHRvIG51bGxcclxuICAgICAgLy8gaWYgdGhlIGZpbmFsIGRlc3RpbmF0aW9uIHdhcyByZWFjaGVkLCBlbWl0IHRoZSByZXR1cm5Ub09yaWdpbkVtaXR0ZXJcclxuICAgICAgY29uc3Qgb25BbmltYXRpb25FbmQgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCBnZXREaXN0YW5jZVRvT3JpZ2luKCkgPT09IDAgKSB7XHJcbiAgICAgICAgICB0aGlzLnJldHVyblRvT3JpZ2luRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uLmVuZGVkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggb25BbmltYXRpb25FbmQgKTtcclxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IG51bGw7XHJcbiAgICAgIH07XHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uLmVuZGVkRW1pdHRlci5hZGRMaXN0ZW5lciggb25BbmltYXRpb25FbmQgKTsgLy8gcmVtb3ZlZCB3aGVuIGFuaW1hdGlvbiBlbmRzXHJcblxyXG4gICAgICB0aGlzLmFuaW1hdGlvbi5zdGFydCgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBpZiB0aGUgcG9pbnQgaXMgYWxyZWFkeSBhdCB3aGVyZSBpdCBiZWxvbmdzLCBqdXN0IGVtaXQgYW5kIGZvcmdvIHRoZSBhbmltYXRpb25cclxuICAgICAgdGhpcy5yZXR1cm5Ub09yaWdpbkVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn1cclxuXHJcbmN1cnZlRml0dGluZy5yZWdpc3RlciggJ1BvaW50JywgUG9pbnQgKTtcclxuZXhwb3J0IGRlZmF1bHQgUG9pbnQ7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLE9BQU8sTUFBTSxnQ0FBZ0M7QUFDcEQsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGVBQWUsTUFBTSx1Q0FBdUM7QUFDbkUsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxTQUFTLE1BQU0sbUNBQW1DO0FBQ3pELE9BQU9DLE1BQU0sTUFBTSxnQ0FBZ0M7QUFDbkQsT0FBT0MsWUFBWSxNQUFNLHVCQUF1QjtBQUNoRCxPQUFPQyxxQkFBcUIsTUFBTSw2QkFBNkI7QUFFL0QsTUFBTUMsS0FBSyxDQUFDO0VBRVY7QUFDRjtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLE9BQU8sRUFBRztJQUVyQkEsT0FBTyxHQUFHUCxLQUFLLENBQUU7TUFDZlEsUUFBUSxFQUFFLElBQUlWLE9BQU8sQ0FBRSxDQUFDLEVB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