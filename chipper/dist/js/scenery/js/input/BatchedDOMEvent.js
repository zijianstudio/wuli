// Copyright 2022-2023, University of Colorado Boulder

/**
 * Pooled structure to record batched events efficiently. How it calls the callback is based on the type
 * (pointer/mspointer/touch/mouse). There is one BatchedDOMEvent for each DOM Event (not for each touch).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import Pool from '../../../phet-core/js/Pool.js';
import { Input, scenery } from '../imports.js';
export class BatchedDOMEventType extends EnumerationValue {
  static POINTER_TYPE = new BatchedDOMEventType();
  static MS_POINTER_TYPE = new BatchedDOMEventType();
  static TOUCH_TYPE = new BatchedDOMEventType();
  static MOUSE_TYPE = new BatchedDOMEventType();
  static WHEEL_TYPE = new BatchedDOMEventType();
  static ALT_TYPE = new BatchedDOMEventType();
  static enumeration = new Enumeration(BatchedDOMEventType, {
    phetioDocumentation: 'The type of batched event'
  });
}
export default class BatchedDOMEvent {
  constructor(eventContext, type, callback) {
    this.initialize(eventContext, type, callback);
  }
  initialize(eventContext, type, callback) {
    // called multiple times due to pooling, this should be re-entrant
    assert && assert(eventContext.domEvent, 'for some reason, there is no DOM event?');
    this.eventContext = eventContext;
    this.type = type;
    this.callback = callback;
    return this;
  }
  run(input) {
    sceneryLog && sceneryLog.InputEvent && sceneryLog.InputEvent('Running batched event');
    sceneryLog && sceneryLog.InputEvent && sceneryLog.push();
    const callback = this.callback;

    // process whether anything under the pointers changed before running additional input events
    input.validatePointers();

    //OHTWO TODO: switch?
    if (this.type === BatchedDOMEventType.POINTER_TYPE) {
      const context = this.eventContext;
      const pointerEvent = context.domEvent;
      callback.call(input, pointerEvent.pointerId, pointerEvent.pointerType, input.pointFromEvent(pointerEvent), context);
    } else if (this.type === BatchedDOMEventType.MS_POINTER_TYPE) {
      const context = this.eventContext;
      const pointerEvent = context.domEvent;
      callback.call(input, pointerEvent.pointerId, Input.msPointerType(pointerEvent), input.pointFromEvent(pointerEvent), context);
    } else if (this.type === BatchedDOMEventType.TOUCH_TYPE) {
      const context = this.eventContext;
      const touchEvent = context.domEvent;
      for (let i = 0; i < touchEvent.changedTouches.length; i++) {
        // according to spec (http://www.w3.org/TR/touch-events/), this is not an Array, but a TouchList
        const touch = touchEvent.changedTouches.item(i);
        callback.call(input, touch.identifier, input.pointFromEvent(touch), context);
      }
    } else if (this.type === BatchedDOMEventType.MOUSE_TYPE) {
      const context = this.eventContext;
      const point = input.pointFromEvent(context.domEvent);
      if (callback === input.mouseDown) {
        callback.call(input, null, point, context);
      } else {
        callback.call(input, point, context);
      }
    } else if (this.type === BatchedDOMEventType.WHEEL_TYPE || this.type === BatchedDOMEventType.ALT_TYPE) {
      callback.call(input, this.eventContext);
    } else {
      throw new Error(`bad type value: ${this.type}`);
    }
    sceneryLog && sceneryLog.InputEvent && sceneryLog.pop();
  }

  /**
   * Releases references
   */
  dispose() {
    // clear our references
    this.eventContext = null;
    this.callback = null;
    this.freeToPool();
  }
  freeToPool() {
    BatchedDOMEvent.pool.freeToPool(this);
  }
  static pool = new Pool(BatchedDOMEvent);
}
scenery.register('BatchedDOMEvent', BatchedDOMEvent);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJQb29sIiwiSW5wdXQiLCJzY2VuZXJ5IiwiQmF0Y2hlZERPTUV2ZW50VHlwZSIsIlBPSU5URVJfVFlQRSIsIk1TX1BPSU5URVJfVFlQRSIsIlRPVUNIX1RZUEUiLCJNT1VTRV9UWVBFIiwiV0hFRUxfVFlQRSIsIkFMVF9UWVBFIiwiZW51bWVyYXRpb24iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiQmF0Y2hlZERPTUV2ZW50IiwiY29uc3RydWN0b3IiLCJldmVudENvbnRleHQiLCJ0eXBlIiwiY2FsbGJhY2siLCJpbml0aWFsaXplIiwiYXNzZXJ0IiwiZG9tRXZlbnQiLCJydW4iLCJpbnB1dCIsInNjZW5lcnlMb2ciLCJJbnB1dEV2ZW50IiwicHVzaCIsInZhbGlkYXRlUG9pbnRlcnMiLCJjb250ZXh0IiwicG9pbnRlckV2ZW50IiwiY2FsbCIsInBvaW50ZXJJZCIsInBvaW50ZXJUeXBlIiwicG9pbnRGcm9tRXZlbnQiLCJtc1BvaW50ZXJUeXBlIiwidG91Y2hFdmVudCIsImkiLCJjaGFuZ2VkVG91Y2hlcyIsImxlbmd0aCIsInRvdWNoIiwiaXRlbSIsImlkZW50aWZpZXIiLCJwb2ludCIsIm1vdXNlRG93biIsIkVycm9yIiwicG9wIiwiZGlzcG9zZSIsImZyZWVUb1Bvb2wiLCJwb29sIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCYXRjaGVkRE9NRXZlbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUG9vbGVkIHN0cnVjdHVyZSB0byByZWNvcmQgYmF0Y2hlZCBldmVudHMgZWZmaWNpZW50bHkuIEhvdyBpdCBjYWxscyB0aGUgY2FsbGJhY2sgaXMgYmFzZWQgb24gdGhlIHR5cGVcclxuICogKHBvaW50ZXIvbXNwb2ludGVyL3RvdWNoL21vdXNlKS4gVGhlcmUgaXMgb25lIEJhdGNoZWRET01FdmVudCBmb3IgZWFjaCBET00gRXZlbnQgKG5vdCBmb3IgZWFjaCB0b3VjaCkuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uVmFsdWUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uVmFsdWUuanMnO1xyXG5pbXBvcnQgUG9vbCwgeyBUUG9vbGFibGUgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbC5qcyc7XHJcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xyXG5pbXBvcnQgeyBFdmVudENvbnRleHQsIElucHV0LCBzY2VuZXJ5IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcblxyXG5leHBvcnQgdHlwZSBCYXRjaGVkRE9NRXZlbnRDYWxsYmFjayA9ICggLi4uYXJnczogSW50ZW50aW9uYWxBbnlbXSApID0+IHZvaWQ7XHJcblxyXG5leHBvcnQgY2xhc3MgQmF0Y2hlZERPTUV2ZW50VHlwZSBleHRlbmRzIEVudW1lcmF0aW9uVmFsdWUge1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgUE9JTlRFUl9UWVBFID0gbmV3IEJhdGNoZWRET01FdmVudFR5cGUoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE1TX1BPSU5URVJfVFlQRSA9IG5ldyBCYXRjaGVkRE9NRXZlbnRUeXBlKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBUT1VDSF9UWVBFID0gbmV3IEJhdGNoZWRET01FdmVudFR5cGUoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE1PVVNFX1RZUEUgPSBuZXcgQmF0Y2hlZERPTUV2ZW50VHlwZSgpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgV0hFRUxfVFlQRSA9IG5ldyBCYXRjaGVkRE9NRXZlbnRUeXBlKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBBTFRfVFlQRSA9IG5ldyBCYXRjaGVkRE9NRXZlbnRUeXBlKCk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIEJhdGNoZWRET01FdmVudFR5cGUsIHtcclxuICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdUaGUgdHlwZSBvZiBiYXRjaGVkIGV2ZW50J1xyXG4gIH0gKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmF0Y2hlZERPTUV2ZW50IGltcGxlbWVudHMgVFBvb2xhYmxlIHtcclxuXHJcbiAgcHJpdmF0ZSBldmVudENvbnRleHQhOiBFdmVudENvbnRleHQgfCBudWxsO1xyXG4gIHByaXZhdGUgdHlwZSE6IEJhdGNoZWRET01FdmVudFR5cGUgfCBudWxsO1xyXG4gIHByaXZhdGUgY2FsbGJhY2shOiBCYXRjaGVkRE9NRXZlbnRDYWxsYmFjayB8IG51bGw7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZXZlbnRDb250ZXh0OiBFdmVudENvbnRleHQsIHR5cGU6IEJhdGNoZWRET01FdmVudFR5cGUsIGNhbGxiYWNrOiBCYXRjaGVkRE9NRXZlbnRDYWxsYmFjayApIHtcclxuICAgIHRoaXMuaW5pdGlhbGl6ZSggZXZlbnRDb250ZXh0LCB0eXBlLCBjYWxsYmFjayApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGluaXRpYWxpemUoIGV2ZW50Q29udGV4dDogRXZlbnRDb250ZXh0LCB0eXBlOiBCYXRjaGVkRE9NRXZlbnRUeXBlLCBjYWxsYmFjazogQmF0Y2hlZERPTUV2ZW50Q2FsbGJhY2sgKTogdGhpcyB7XHJcbiAgICAvLyBjYWxsZWQgbXVsdGlwbGUgdGltZXMgZHVlIHRvIHBvb2xpbmcsIHRoaXMgc2hvdWxkIGJlIHJlLWVudHJhbnRcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGV2ZW50Q29udGV4dC5kb21FdmVudCwgJ2ZvciBzb21lIHJlYXNvbiwgdGhlcmUgaXMgbm8gRE9NIGV2ZW50PycgKTtcclxuXHJcbiAgICB0aGlzLmV2ZW50Q29udGV4dCA9IGV2ZW50Q29udGV4dDtcclxuICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcnVuKCBpbnB1dDogSW5wdXQgKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCAmJiBzY2VuZXJ5TG9nLklucHV0RXZlbnQoICdSdW5uaW5nIGJhdGNoZWQgZXZlbnQnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBjb25zdCBjYWxsYmFjayA9IHRoaXMuY2FsbGJhY2shO1xyXG5cclxuICAgIC8vIHByb2Nlc3Mgd2hldGhlciBhbnl0aGluZyB1bmRlciB0aGUgcG9pbnRlcnMgY2hhbmdlZCBiZWZvcmUgcnVubmluZyBhZGRpdGlvbmFsIGlucHV0IGV2ZW50c1xyXG4gICAgaW5wdXQudmFsaWRhdGVQb2ludGVycygpO1xyXG5cclxuICAgIC8vT0hUV08gVE9ETzogc3dpdGNoP1xyXG4gICAgaWYgKCB0aGlzLnR5cGUgPT09IEJhdGNoZWRET01FdmVudFR5cGUuUE9JTlRFUl9UWVBFICkge1xyXG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5ldmVudENvbnRleHQgYXMgRXZlbnRDb250ZXh0PFBvaW50ZXJFdmVudD47XHJcbiAgICAgIGNvbnN0IHBvaW50ZXJFdmVudCA9IGNvbnRleHQuZG9tRXZlbnQ7XHJcbiAgICAgIGNhbGxiYWNrLmNhbGwoIGlucHV0LCBwb2ludGVyRXZlbnQucG9pbnRlcklkLCBwb2ludGVyRXZlbnQucG9pbnRlclR5cGUsIGlucHV0LnBvaW50RnJvbUV2ZW50KCBwb2ludGVyRXZlbnQgKSwgY29udGV4dCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMudHlwZSA9PT0gQmF0Y2hlZERPTUV2ZW50VHlwZS5NU19QT0lOVEVSX1RZUEUgKSB7XHJcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLmV2ZW50Q29udGV4dCBhcyBFdmVudENvbnRleHQ8UG9pbnRlckV2ZW50PjtcclxuICAgICAgY29uc3QgcG9pbnRlckV2ZW50ID0gY29udGV4dC5kb21FdmVudDtcclxuICAgICAgY2FsbGJhY2suY2FsbCggaW5wdXQsIHBvaW50ZXJFdmVudC5wb2ludGVySWQsIElucHV0Lm1zUG9pbnRlclR5cGUoIHBvaW50ZXJFdmVudCApLCBpbnB1dC5wb2ludEZyb21FdmVudCggcG9pbnRlckV2ZW50ICksIGNvbnRleHQgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLnR5cGUgPT09IEJhdGNoZWRET01FdmVudFR5cGUuVE9VQ0hfVFlQRSApIHtcclxuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXMuZXZlbnRDb250ZXh0IGFzIEV2ZW50Q29udGV4dDxUb3VjaEV2ZW50PjtcclxuICAgICAgY29uc3QgdG91Y2hFdmVudCA9IGNvbnRleHQuZG9tRXZlbnQ7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRvdWNoRXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgLy8gYWNjb3JkaW5nIHRvIHNwZWMgKGh0dHA6Ly93d3cudzMub3JnL1RSL3RvdWNoLWV2ZW50cy8pLCB0aGlzIGlzIG5vdCBhbiBBcnJheSwgYnV0IGEgVG91Y2hMaXN0XHJcbiAgICAgICAgY29uc3QgdG91Y2ggPSB0b3VjaEV2ZW50LmNoYW5nZWRUb3VjaGVzLml0ZW0oIGkgKSE7XHJcblxyXG4gICAgICAgIGNhbGxiYWNrLmNhbGwoIGlucHV0LCB0b3VjaC5pZGVudGlmaWVyLCBpbnB1dC5wb2ludEZyb21FdmVudCggdG91Y2ggKSwgY29udGV4dCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy50eXBlID09PSBCYXRjaGVkRE9NRXZlbnRUeXBlLk1PVVNFX1RZUEUgKSB7XHJcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLmV2ZW50Q29udGV4dCBhcyBFdmVudENvbnRleHQ8TW91c2VFdmVudD47XHJcbiAgICAgIGNvbnN0IHBvaW50ID0gaW5wdXQucG9pbnRGcm9tRXZlbnQoIGNvbnRleHQuZG9tRXZlbnQgKTtcclxuICAgICAgaWYgKCBjYWxsYmFjayA9PT0gaW5wdXQubW91c2VEb3duICkge1xyXG4gICAgICAgIGNhbGxiYWNrLmNhbGwoIGlucHV0LCBudWxsLCBwb2ludCwgY29udGV4dCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGNhbGxiYWNrLmNhbGwoIGlucHV0LCBwb2ludCwgY29udGV4dCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy50eXBlID09PSBCYXRjaGVkRE9NRXZlbnRUeXBlLldIRUVMX1RZUEUgfHwgdGhpcy50eXBlID09PSBCYXRjaGVkRE9NRXZlbnRUeXBlLkFMVF9UWVBFICkge1xyXG4gICAgICBjYWxsYmFjay5jYWxsKCBpbnB1dCwgdGhpcy5ldmVudENvbnRleHQgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBiYWQgdHlwZSB2YWx1ZTogJHt0aGlzLnR5cGV9YCApO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dEV2ZW50ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzXHJcbiAgICovXHJcbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICAvLyBjbGVhciBvdXIgcmVmZXJlbmNlc1xyXG4gICAgdGhpcy5ldmVudENvbnRleHQgPSBudWxsO1xyXG4gICAgdGhpcy5jYWxsYmFjayA9IG51bGw7XHJcbiAgICB0aGlzLmZyZWVUb1Bvb2woKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBmcmVlVG9Qb29sKCk6IHZvaWQge1xyXG4gICAgQmF0Y2hlZERPTUV2ZW50LnBvb2wuZnJlZVRvUG9vbCggdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBwb29sID0gbmV3IFBvb2woIEJhdGNoZWRET01FdmVudCApO1xyXG59XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnQmF0Y2hlZERPTUV2ZW50JywgQmF0Y2hlZERPTUV2ZW50ICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFdBQVcsTUFBTSxzQ0FBc0M7QUFDOUQsT0FBT0MsZ0JBQWdCLE1BQU0sMkNBQTJDO0FBQ3hFLE9BQU9DLElBQUksTUFBcUIsK0JBQStCO0FBRS9ELFNBQXVCQyxLQUFLLEVBQUVDLE9BQU8sUUFBUSxlQUFlO0FBSTVELE9BQU8sTUFBTUMsbUJBQW1CLFNBQVNKLGdCQUFnQixDQUFDO0VBQ3hELE9BQXVCSyxZQUFZLEdBQUcsSUFBSUQsbUJBQW1CLENBQUMsQ0FBQztFQUMvRCxPQUF1QkUsZUFBZSxHQUFHLElBQUlGLG1CQUFtQixDQUFDLENBQUM7RUFDbEUsT0FBdUJHLFVBQVUsR0FBRyxJQUFJSCxtQkFBbUIsQ0FBQyxDQUFDO0VBQzdELE9BQXVCSSxVQUFVLEdBQUcsSUFBSUosbUJBQW1CLENBQUMsQ0FBQztFQUM3RCxPQUF1QkssVUFBVSxHQUFHLElBQUlMLG1CQUFtQixDQUFDLENBQUM7RUFDN0QsT0FBdUJNLFFBQVEsR0FBRyxJQUFJTixtQkFBbUIsQ0FBQyxDQUFDO0VBRTNELE9BQXVCTyxXQUFXLEdBQUcsSUFBSVosV0FBVyxDQUFFSyxtQkFBbUIsRUFB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