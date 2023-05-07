// Copyright 2018-2020, University of Colorado Boulder

/**
 * Supertype for different types of groups (containers of pieces in the play area)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Animator from '../../common/model/Animator.js';
import fractionsCommon from '../../fractionsCommon.js';
class Group {
  /**
   * @param {BuildingType} type
   */
  constructor(type) {
    // @public {BuildingType}
    this.type = type;

    // @public
    this.positionProperty = new Vector2Property(Vector2.ZERO);

    // @public {Property.<number>} - Applies only while out in the play area (being animated or dragged)
    this.scaleProperty = new NumberProperty(1);

    // @public {Emitter} - Emitted when containers/pieces change
    this.changedEmitter = new Emitter();

    // @public {Property.<boolean>} - Whether the group is being moved (not by the user)
    this.isAnimatingProperty = new BooleanProperty(false);

    // @public {Property.<Target|null>} - The target, if any, that the user is holding this group over.
    this.hoveringTargetProperty = new Property(null);

    // @public {Animator} - Responsible for animating the main properties of this group.
    this.animator = new Animator({
      positionProperty: this.positionProperty,
      scaleProperty: this.scaleProperty,
      isAnimatingProperty: this.isAnimatingProperty
    });

    // Keep our hover target up-to-date (no need to unlink, as we own the given Property)
    this.hoveringTargetProperty.lazyLink((newTarget, oldTarget) => {
      oldTarget && oldTarget.hoveringGroups.remove(this);
      newTarget && newTarget.hoveringGroups.push(this);
    });

    // @private {boolean}
    this.isDisposed = false;
  }

  /**
   * The current "amount" of the entire group
   * @public
   *
   * @returns {Fraction}
   */
  get totalFraction() {
    throw new Error('abstract method');
  }

  /**
   * The center positions of every "container" in the group.
   * @public
   *
   * @returns {Array.<Vector2>}
   */
  get centerPoints() {
    throw new Error('abstract method');
  }

  /**
   * Whether this group contains any pieces.
   * @public
   *
   * @returns {boolean}
   */
  hasAnyPieces() {
    throw new Error('abstract method');
  }

  /**
   * Steps forward in time.
   * @public
   *
   * @param {number} dt
   */
  step(dt) {
    this.animator.step(dt);
  }

  /**
   * Clears some associated temporary properties (that isn't a full reset), particularly before it is pulled from a
   * stack.
   * @public
   */
  clear() {
    this.scaleProperty.reset();
  }

  /**
   * Releases references.
   * @public
   */
  dispose() {
    assert && assert(!this.isDisposed);
    this.isDisposed = true;
  }
}
fractionsCommon.register('Group', Group);
export default Group;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJBbmltYXRvciIsImZyYWN0aW9uc0NvbW1vbiIsIkdyb3VwIiwiY29uc3RydWN0b3IiLCJ0eXBlIiwicG9zaXRpb25Qcm9wZXJ0eSIsIlpFUk8iLCJzY2FsZVByb3BlcnR5IiwiY2hhbmdlZEVtaXR0ZXIiLCJpc0FuaW1hdGluZ1Byb3BlcnR5IiwiaG92ZXJpbmdUYXJnZXRQcm9wZXJ0eSIsImFuaW1hdG9yIiwibGF6eUxpbmsiLCJuZXdUYXJnZXQiLCJvbGRUYXJnZXQiLCJob3ZlcmluZ0dyb3VwcyIsInJlbW92ZSIsInB1c2giLCJpc0Rpc3Bvc2VkIiwidG90YWxGcmFjdGlvbiIsIkVycm9yIiwiY2VudGVyUG9pbnRzIiwiaGFzQW55UGllY2VzIiwic3RlcCIsImR0IiwiY2xlYXIiLCJyZXNldCIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdyb3VwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFN1cGVydHlwZSBmb3IgZGlmZmVyZW50IHR5cGVzIG9mIGdyb3VwcyAoY29udGFpbmVycyBvZiBwaWVjZXMgaW4gdGhlIHBsYXkgYXJlYSlcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQW5pbWF0b3IgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0FuaW1hdG9yLmpzJztcclxuaW1wb3J0IGZyYWN0aW9uc0NvbW1vbiBmcm9tICcuLi8uLi9mcmFjdGlvbnNDb21tb24uanMnO1xyXG5cclxuY2xhc3MgR3JvdXAge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QnVpbGRpbmdUeXBlfSB0eXBlXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHR5cGUgKSB7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QnVpbGRpbmdUeXBlfVxyXG4gICAgdGhpcy50eXBlID0gdHlwZTtcclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBWZWN0b3IyLlpFUk8gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn0gLSBBcHBsaWVzIG9ubHkgd2hpbGUgb3V0IGluIHRoZSBwbGF5IGFyZWEgKGJlaW5nIGFuaW1hdGVkIG9yIGRyYWdnZWQpXHJcbiAgICB0aGlzLnNjYWxlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDEgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtFbWl0dGVyfSAtIEVtaXR0ZWQgd2hlbiBjb250YWluZXJzL3BpZWNlcyBjaGFuZ2VcclxuICAgIHRoaXMuY2hhbmdlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gLSBXaGV0aGVyIHRoZSBncm91cCBpcyBiZWluZyBtb3ZlZCAobm90IGJ5IHRoZSB1c2VyKVxyXG4gICAgdGhpcy5pc0FuaW1hdGluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48VGFyZ2V0fG51bGw+fSAtIFRoZSB0YXJnZXQsIGlmIGFueSwgdGhhdCB0aGUgdXNlciBpcyBob2xkaW5nIHRoaXMgZ3JvdXAgb3Zlci5cclxuICAgIHRoaXMuaG92ZXJpbmdUYXJnZXRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbnVsbCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FuaW1hdG9yfSAtIFJlc3BvbnNpYmxlIGZvciBhbmltYXRpbmcgdGhlIG1haW4gcHJvcGVydGllcyBvZiB0aGlzIGdyb3VwLlxyXG4gICAgdGhpcy5hbmltYXRvciA9IG5ldyBBbmltYXRvcigge1xyXG4gICAgICBwb3NpdGlvblByb3BlcnR5OiB0aGlzLnBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgIHNjYWxlUHJvcGVydHk6IHRoaXMuc2NhbGVQcm9wZXJ0eSxcclxuICAgICAgaXNBbmltYXRpbmdQcm9wZXJ0eTogdGhpcy5pc0FuaW1hdGluZ1Byb3BlcnR5XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gS2VlcCBvdXIgaG92ZXIgdGFyZ2V0IHVwLXRvLWRhdGUgKG5vIG5lZWQgdG8gdW5saW5rLCBhcyB3ZSBvd24gdGhlIGdpdmVuIFByb3BlcnR5KVxyXG4gICAgdGhpcy5ob3ZlcmluZ1RhcmdldFByb3BlcnR5LmxhenlMaW5rKCAoIG5ld1RhcmdldCwgb2xkVGFyZ2V0ICkgPT4ge1xyXG4gICAgICBvbGRUYXJnZXQgJiYgb2xkVGFyZ2V0LmhvdmVyaW5nR3JvdXBzLnJlbW92ZSggdGhpcyApO1xyXG4gICAgICBuZXdUYXJnZXQgJiYgbmV3VGFyZ2V0LmhvdmVyaW5nR3JvdXBzLnB1c2goIHRoaXMgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn1cclxuICAgIHRoaXMuaXNEaXNwb3NlZCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGN1cnJlbnQgXCJhbW91bnRcIiBvZiB0aGUgZW50aXJlIGdyb3VwXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge0ZyYWN0aW9ufVxyXG4gICAqL1xyXG4gIGdldCB0b3RhbEZyYWN0aW9uKCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnYWJzdHJhY3QgbWV0aG9kJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGNlbnRlciBwb3NpdGlvbnMgb2YgZXZlcnkgXCJjb250YWluZXJcIiBpbiB0aGUgZ3JvdXAuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge0FycmF5LjxWZWN0b3IyPn1cclxuICAgKi9cclxuICBnZXQgY2VudGVyUG9pbnRzKCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnYWJzdHJhY3QgbWV0aG9kJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGlzIGdyb3VwIGNvbnRhaW5zIGFueSBwaWVjZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaGFzQW55UGllY2VzKCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnYWJzdHJhY3QgbWV0aG9kJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcHMgZm9yd2FyZCBpbiB0aW1lLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgdGhpcy5hbmltYXRvci5zdGVwKCBkdCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYXJzIHNvbWUgYXNzb2NpYXRlZCB0ZW1wb3JhcnkgcHJvcGVydGllcyAodGhhdCBpc24ndCBhIGZ1bGwgcmVzZXQpLCBwYXJ0aWN1bGFybHkgYmVmb3JlIGl0IGlzIHB1bGxlZCBmcm9tIGFcclxuICAgKiBzdGFjay5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY2xlYXIoKSB7XHJcbiAgICB0aGlzLnNjYWxlUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pc0Rpc3Bvc2VkICk7XHJcblxyXG4gICAgdGhpcy5pc0Rpc3Bvc2VkID0gdHJ1ZTtcclxuICB9XHJcbn1cclxuXHJcbmZyYWN0aW9uc0NvbW1vbi5yZWdpc3RlciggJ0dyb3VwJywgR3JvdXAgKTtcclxuZXhwb3J0IGRlZmF1bHQgR3JvdXA7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLE9BQU8sTUFBTSxnQ0FBZ0M7QUFDcEQsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsZUFBZSxNQUFNLHVDQUF1QztBQUNuRSxPQUFPQyxRQUFRLE1BQU0sZ0NBQWdDO0FBQ3JELE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFFdEQsTUFBTUMsS0FBSyxDQUFDO0VBQ1Y7QUFDRjtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLElBQUksRUFBRztJQUVsQjtJQUNBLElBQUksQ0FBQ0EsSUFBSSxHQUFHQSxJQUFJOztJQUVoQjtJQUNBLElBQUksQ0FBQ0MsZ0JBQWdCLEdBQUcsSUFBSU4sZUFBZSxDQUFFRCxPQUFPLENBQUNRLElBQUssQ0FBQzs7SUFFM0Q7SUFDQSxJQUFJLENBQUNDLGFBQWEsR0FBRyxJQUFJWCxjQUFjLENBQUUsQ0FBRSxDQUFDOztJQUU1QztJQUNBLElBQUksQ0FBQ1ksY0FBYyxHQUFHLElBQUliLE9BQU8sQ0FBQyxDQUFDOztJQUVuQztJQUNBLElBQUksQ0FBQ2MsbUJBQW1CLEdBQUcsSUFBSWYsZUFBZSxDQUFFLEtBQU0sQ0FBQzs7SUFFdkQ7SUFDQSxJQUFJLENBQUNnQixzQkFBc0IsR0FBRyxJQUFJYixRQUFRLENBQUUsSUFBSyxDQUFDOztJQUVsRDtJQUNBLElBQUksQ0FBQ2MsUUFBUSxHQUFHLElBQUlYLFFBQVEsQ0FBRTtNQUM1QkssZ0JBQWdCLEVBQUUsSUFBSSxDQUFDQSxnQkFBZ0I7TUFDdkNFLGFBQWEsRUFBRSxJQUFJLENBQUNBLGFBQWE7TUFDakNFLG1CQUFtQixFQUFFLElBQUksQ0FBQ0E7SUFDNUIsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDQyxzQkFBc0IsQ0FBQ0UsUUFBUSxDQUFFLENBQUVDLFNBQVMsRUFBRUMsU0FBUyxLQUFNO01BQ2hFQSxTQUFTLElBQUlBLFNBQVMsQ0FBQ0MsY0FBYyxDQUFDQyxNQUFNLENBQUUsSUFBSyxDQUFDO01BQ3BESCxTQUFTLElBQUlBLFNBQVMsQ0FBQ0UsY0FBYyxDQUFDRSxJQUFJLENBQUUsSUFBSyxDQUFDO0lBQ3BELENBQUUsQ0FBQzs7SUFFSDtJQUNBLElBQUksQ0FBQ0MsVUFBVSxHQUFHLEtBQUs7RUFDekI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsSUFBSUMsYUFBYUEsQ0FBQSxFQUFHO0lBQ2xCLE1BQU0sSUFBSUMsS0FBSyxDQUFFLGlCQUFrQixDQUFDO0VBQ3RDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLElBQUlDLFlBQVlBLENBQUEsRUFBRztJQUNqQixNQUFNLElBQUlELEtBQUssQ0FBRSxpQkFBa0IsQ0FBQztFQUN0Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsWUFBWUEsQ0FBQSxFQUFHO0lBQ2IsTUFBTSxJQUFJRixLQUFLLENBQUUsaUJBQWtCLENBQUM7RUFDdEM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VHLElBQUlBLENBQUVDLEVBQUUsRUFBRztJQUNULElBQUksQ0FBQ2IsUUFBUSxDQUFDWSxJQUFJLENBQUVDLEVBQUcsQ0FBQztFQUMxQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLEtBQUtBLENBQUEsRUFBRztJQUNOLElBQUksQ0FBQ2xCLGFBQWEsQ0FBQ21CLEtBQUssQ0FBQyxDQUFDO0VBQzVCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VDLE9BQU9BLENBQUEsRUFBRztJQUNSQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxDQUFDLElBQUksQ0FBQ1YsVUFBVyxDQUFDO0lBRXBDLElBQUksQ0FBQ0EsVUFBVSxHQUFHLElBQUk7RUFDeEI7QUFDRjtBQUVBakIsZUFBZSxDQUFDNEIsUUFBUSxDQUFFLE9BQU8sRUFBRTNCLEtBQU0sQ0FBQztBQUMxQyxlQUFlQSxLQUFLIn0=