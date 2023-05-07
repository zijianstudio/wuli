// Copyright 2013-2023, University of Colorado Boulder

/**
 * A Scenery event is an abstraction over incoming user DOM events.
 *
 * It provides more information (particularly Scenery-related information), and handles a single pointer at a time
 * (DOM TouchEvents can include information for multiple touches at the same time, so the TouchEvent can be passed to
 * multiple Scenery events). Thus it is not save to assume that the DOM event is unique, as it may be shared.
 *
 * NOTE: While the event is being dispatched, its currentTarget may be changed. It is not fully immutable.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../dot/js/Vector2.js';
import IOType from '../../../tandem/js/types/IOType.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import { Mouse, PDOMPointer, scenery } from '../imports.js';
import EventIO from './EventIO.js';

// "out" here ensures that SceneryListenerFunctions don't specify a wider type arguments for the event, see  https://github.com/phetsims/scenery/issues/1483
export default class SceneryEvent {
  // Whether this SceneryEvent has been 'handled'. If so, it will not bubble further.

  // Whether this SceneryEvent has been 'aborted'. If so, no further listeners with it will fire.

  // Path to the leaf-most node "hit" by the event, ordered list, from root to leaf

  // What event was triggered on the listener, e.g. 'move'

  // The pointer that triggered this event

  // Raw DOM InputEvent (TouchEvent, PointerEvent, MouseEvent,...)

  // Assorted environment information when the event was fired

  // The document.activeElement when the event was fired

  // Whatever node you attached the listener to, or null when firing events on a Pointer

  // Leaf-most node in trail

  // Whether this is the 'primary' mode for the pointer. Always true for touches, and will be true
  // for the mouse if it is the primary (left) mouse button.
  /**
   * @param trail - The trail to the node picked/hit by this input event.
   * @param type - Type of the event, e.g. 'string'
   * @param pointer - The pointer that triggered this event
   * @param context - The original DOM EventContext that caused this SceneryEvent to fire.
   */
  constructor(trail, type, pointer, context) {
    // TODO: add domEvent type assertion -- will browsers support this?

    this.handled = false;
    this.aborted = false;
    this.trail = trail;
    this.type = type;
    this.pointer = pointer;
    this.context = context;
    this.domEvent = context.domEvent;
    this.activeElement = context.activeElement;
    this.currentTarget = null;
    this.target = trail.lastNode();

    // TODO: don't require check on domEvent (seems sometimes this is passed as null as a hack?)
    this.isPrimary = !(pointer instanceof Mouse) || !this.domEvent || this.domEvent.button === 0;

    // Store the last-used non-null DOM event for future use if required.
    pointer.lastEventContext = context;
  }

  /**
   * like DOM SceneryEvent.stopPropagation(), but named differently to indicate it doesn't fire that behavior on the underlying DOM event
   */
  handle() {
    sceneryLog && sceneryLog.InputEvent && sceneryLog.InputEvent('handled event');
    this.handled = true;
  }

  /**
   * like DOM SceneryEvent.stopImmediatePropagation(), but named differently to indicate it doesn't fire that behavior on the underlying DOM event
   */
  abort() {
    sceneryLog && sceneryLog.InputEvent && sceneryLog.InputEvent('aborted event');
    this.aborted = true;
  }

  /**
   * Specifies whether the SceneryEvent came from alternative input. See Input.PDOM_EVENT_TYPES for a list of events
   * pdom-related events supported by scenery. These events are exclusively supported by the ParallelDOM for Interactive
   * description.
   */
  isFromPDOM() {
    return this.pointer instanceof PDOMPointer;
  }

  /**
   * Returns whether a typical PressListener (that isn't already attached) could start a drag with this event.
   *
   * This can typically be used for patterns where no action should be taken if a press can't be started, e.g.:
   *
   *   down: function( event ) {
   *     if ( !event.canStartPress() ) { return; }
   *
   *     // ... Do stuff to create a node with some type of PressListener
   *
   *     dragListener.press( event );
   *   }
   *
   * NOTE: This ignores non-left mouse buttons (as this is the typical behavior). Custom checks should be done if this
   *       is not suitable.
   */
  canStartPress() {
    // If the pointer is already attached (some other press probably), it can't start a press.
    // Additionally, we generally want to ignore non-left mouse buttons.
    return !this.pointer.isAttached() && (!(this.pointer instanceof Mouse) || this.domEvent.button === 0);
  }
  static SceneryEventIO = new IOType('SceneryEventIO', {
    valueType: SceneryEvent,
    documentation: 'An event, with a "point" field',
    toStateObject: event => {
      // Note: If changing the contents of this object, please document it in the public documentation string.
      return {
        type: event.type,
        domEventType: NullableIO(EventIO).toStateObject(event.domEvent),
        point: event.pointer && event.pointer.point ? Vector2.Vector2IO.toStateObject(event.pointer.point) : null
      };
    },
    stateSchema: {
      type: StringIO,
      domEventType: NullableIO(EventIO),
      point: NullableIO(Vector2.Vector2IO)
    }
  });
}
scenery.register('SceneryEvent', SceneryEvent);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiSU9UeXBlIiwiTnVsbGFibGVJTyIsIlN0cmluZ0lPIiwiTW91c2UiLCJQRE9NUG9pbnRlciIsInNjZW5lcnkiLCJFdmVudElPIiwiU2NlbmVyeUV2ZW50IiwiY29uc3RydWN0b3IiLCJ0cmFpbCIsInR5cGUiLCJwb2ludGVyIiwiY29udGV4dCIsImhhbmRsZWQiLCJhYm9ydGVkIiwiZG9tRXZlbnQiLCJhY3RpdmVFbGVtZW50IiwiY3VycmVudFRhcmdldCIsInRhcmdldCIsImxhc3ROb2RlIiwiaXNQcmltYXJ5IiwiYnV0dG9uIiwibGFzdEV2ZW50Q29udGV4dCIsImhhbmRsZSIsInNjZW5lcnlMb2ciLCJJbnB1dEV2ZW50IiwiYWJvcnQiLCJpc0Zyb21QRE9NIiwiY2FuU3RhcnRQcmVzcyIsImlzQXR0YWNoZWQiLCJTY2VuZXJ5RXZlbnRJTyIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJ0b1N0YXRlT2JqZWN0IiwiZXZlbnQiLCJkb21FdmVudFR5cGUiLCJwb2ludCIsIlZlY3RvcjJJTyIsInN0YXRlU2NoZW1hIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTY2VuZXJ5RXZlbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBTY2VuZXJ5IGV2ZW50IGlzIGFuIGFic3RyYWN0aW9uIG92ZXIgaW5jb21pbmcgdXNlciBET00gZXZlbnRzLlxyXG4gKlxyXG4gKiBJdCBwcm92aWRlcyBtb3JlIGluZm9ybWF0aW9uIChwYXJ0aWN1bGFybHkgU2NlbmVyeS1yZWxhdGVkIGluZm9ybWF0aW9uKSwgYW5kIGhhbmRsZXMgYSBzaW5nbGUgcG9pbnRlciBhdCBhIHRpbWVcclxuICogKERPTSBUb3VjaEV2ZW50cyBjYW4gaW5jbHVkZSBpbmZvcm1hdGlvbiBmb3IgbXVsdGlwbGUgdG91Y2hlcyBhdCB0aGUgc2FtZSB0aW1lLCBzbyB0aGUgVG91Y2hFdmVudCBjYW4gYmUgcGFzc2VkIHRvXHJcbiAqIG11bHRpcGxlIFNjZW5lcnkgZXZlbnRzKS4gVGh1cyBpdCBpcyBub3Qgc2F2ZSB0byBhc3N1bWUgdGhhdCB0aGUgRE9NIGV2ZW50IGlzIHVuaXF1ZSwgYXMgaXQgbWF5IGJlIHNoYXJlZC5cclxuICpcclxuICogTk9URTogV2hpbGUgdGhlIGV2ZW50IGlzIGJlaW5nIGRpc3BhdGNoZWQsIGl0cyBjdXJyZW50VGFyZ2V0IG1heSBiZSBjaGFuZ2VkLiBJdCBpcyBub3QgZnVsbHkgaW1tdXRhYmxlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgTnVsbGFibGVJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVsbGFibGVJTy5qcyc7XHJcbmltcG9ydCBTdHJpbmdJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvU3RyaW5nSU8uanMnO1xyXG5pbXBvcnQgeyBFdmVudENvbnRleHQsIE1vdXNlLCBOb2RlLCBQRE9NUG9pbnRlciwgUG9pbnRlciwgc2NlbmVyeSwgVHJhaWwgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEV2ZW50SU8gZnJvbSAnLi9FdmVudElPLmpzJztcclxuXHJcbi8vIFwib3V0XCIgaGVyZSBlbnN1cmVzIHRoYXQgU2NlbmVyeUxpc3RlbmVyRnVuY3Rpb25zIGRvbid0IHNwZWNpZnkgYSB3aWRlciB0eXBlIGFyZ3VtZW50cyBmb3IgdGhlIGV2ZW50LCBzZWUgIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNDgzXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjZW5lcnlFdmVudDxvdXQgRE9NRXZlbnQgZXh0ZW5kcyBFdmVudCA9IEV2ZW50PiB7XHJcblxyXG4gIC8vIFdoZXRoZXIgdGhpcyBTY2VuZXJ5RXZlbnQgaGFzIGJlZW4gJ2hhbmRsZWQnLiBJZiBzbywgaXQgd2lsbCBub3QgYnViYmxlIGZ1cnRoZXIuXHJcbiAgcHVibGljIGhhbmRsZWQ6IGJvb2xlYW47XHJcblxyXG4gIC8vIFdoZXRoZXIgdGhpcyBTY2VuZXJ5RXZlbnQgaGFzIGJlZW4gJ2Fib3J0ZWQnLiBJZiBzbywgbm8gZnVydGhlciBsaXN0ZW5lcnMgd2l0aCBpdCB3aWxsIGZpcmUuXHJcbiAgcHVibGljIGFib3J0ZWQ6IGJvb2xlYW47XHJcblxyXG4gIC8vIFBhdGggdG8gdGhlIGxlYWYtbW9zdCBub2RlIFwiaGl0XCIgYnkgdGhlIGV2ZW50LCBvcmRlcmVkIGxpc3QsIGZyb20gcm9vdCB0byBsZWFmXHJcbiAgcHVibGljIHJlYWRvbmx5IHRyYWlsOiBUcmFpbDtcclxuXHJcbiAgLy8gV2hhdCBldmVudCB3YXMgdHJpZ2dlcmVkIG9uIHRoZSBsaXN0ZW5lciwgZS5nLiAnbW92ZSdcclxuICBwdWJsaWMgcmVhZG9ubHkgdHlwZTogc3RyaW5nO1xyXG5cclxuICAvLyBUaGUgcG9pbnRlciB0aGF0IHRyaWdnZXJlZCB0aGlzIGV2ZW50XHJcbiAgcHVibGljIHJlYWRvbmx5IHBvaW50ZXI6IFBvaW50ZXI7XHJcblxyXG4gIC8vIFJhdyBET00gSW5wdXRFdmVudCAoVG91Y2hFdmVudCwgUG9pbnRlckV2ZW50LCBNb3VzZUV2ZW50LC4uLilcclxuICBwdWJsaWMgcmVhZG9ubHkgZG9tRXZlbnQ6IERPTUV2ZW50IHwgbnVsbDtcclxuXHJcbiAgLy8gQXNzb3J0ZWQgZW52aXJvbm1lbnQgaW5mb3JtYXRpb24gd2hlbiB0aGUgZXZlbnQgd2FzIGZpcmVkXHJcbiAgcHVibGljIHJlYWRvbmx5IGNvbnRleHQ6IEV2ZW50Q29udGV4dDtcclxuXHJcbiAgLy8gVGhlIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgd2hlbiB0aGUgZXZlbnQgd2FzIGZpcmVkXHJcbiAgcHVibGljIHJlYWRvbmx5IGFjdGl2ZUVsZW1lbnQ6IEVsZW1lbnQgfCBudWxsO1xyXG5cclxuICAvLyBXaGF0ZXZlciBub2RlIHlvdSBhdHRhY2hlZCB0aGUgbGlzdGVuZXIgdG8sIG9yIG51bGwgd2hlbiBmaXJpbmcgZXZlbnRzIG9uIGEgUG9pbnRlclxyXG4gIHB1YmxpYyBjdXJyZW50VGFyZ2V0OiBOb2RlIHwgbnVsbDtcclxuXHJcbiAgLy8gTGVhZi1tb3N0IG5vZGUgaW4gdHJhaWxcclxuICBwdWJsaWMgdGFyZ2V0OiBOb2RlO1xyXG5cclxuICAvLyBXaGV0aGVyIHRoaXMgaXMgdGhlICdwcmltYXJ5JyBtb2RlIGZvciB0aGUgcG9pbnRlci4gQWx3YXlzIHRydWUgZm9yIHRvdWNoZXMsIGFuZCB3aWxsIGJlIHRydWVcclxuICAvLyBmb3IgdGhlIG1vdXNlIGlmIGl0IGlzIHRoZSBwcmltYXJ5IChsZWZ0KSBtb3VzZSBidXR0b24uXHJcbiAgcHVibGljIGlzUHJpbWFyeTogYm9vbGVhbjtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHRyYWlsIC0gVGhlIHRyYWlsIHRvIHRoZSBub2RlIHBpY2tlZC9oaXQgYnkgdGhpcyBpbnB1dCBldmVudC5cclxuICAgKiBAcGFyYW0gdHlwZSAtIFR5cGUgb2YgdGhlIGV2ZW50LCBlLmcuICdzdHJpbmcnXHJcbiAgICogQHBhcmFtIHBvaW50ZXIgLSBUaGUgcG9pbnRlciB0aGF0IHRyaWdnZXJlZCB0aGlzIGV2ZW50XHJcbiAgICogQHBhcmFtIGNvbnRleHQgLSBUaGUgb3JpZ2luYWwgRE9NIEV2ZW50Q29udGV4dCB0aGF0IGNhdXNlZCB0aGlzIFNjZW5lcnlFdmVudCB0byBmaXJlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdHJhaWw6IFRyYWlsLCB0eXBlOiBzdHJpbmcsIHBvaW50ZXI6IFBvaW50ZXIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxET01FdmVudD4gKSB7XHJcbiAgICAvLyBUT0RPOiBhZGQgZG9tRXZlbnQgdHlwZSBhc3NlcnRpb24gLS0gd2lsbCBicm93c2VycyBzdXBwb3J0IHRoaXM/XHJcblxyXG4gICAgdGhpcy5oYW5kbGVkID0gZmFsc2U7XHJcbiAgICB0aGlzLmFib3J0ZWQgPSBmYWxzZTtcclxuICAgIHRoaXMudHJhaWwgPSB0cmFpbDtcclxuICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICB0aGlzLnBvaW50ZXIgPSBwb2ludGVyO1xyXG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcclxuICAgIHRoaXMuZG9tRXZlbnQgPSBjb250ZXh0LmRvbUV2ZW50O1xyXG4gICAgdGhpcy5hY3RpdmVFbGVtZW50ID0gY29udGV4dC5hY3RpdmVFbGVtZW50O1xyXG4gICAgdGhpcy5jdXJyZW50VGFyZ2V0ID0gbnVsbDtcclxuICAgIHRoaXMudGFyZ2V0ID0gdHJhaWwubGFzdE5vZGUoKTtcclxuXHJcbiAgICAvLyBUT0RPOiBkb24ndCByZXF1aXJlIGNoZWNrIG9uIGRvbUV2ZW50IChzZWVtcyBzb21ldGltZXMgdGhpcyBpcyBwYXNzZWQgYXMgbnVsbCBhcyBhIGhhY2s/KVxyXG4gICAgdGhpcy5pc1ByaW1hcnkgPSAhKCBwb2ludGVyIGluc3RhbmNlb2YgTW91c2UgKSB8fCAhdGhpcy5kb21FdmVudCB8fCAoIHRoaXMuZG9tRXZlbnQgYXMgdW5rbm93biBhcyBNb3VzZUV2ZW50ICkuYnV0dG9uID09PSAwO1xyXG5cclxuICAgIC8vIFN0b3JlIHRoZSBsYXN0LXVzZWQgbm9uLW51bGwgRE9NIGV2ZW50IGZvciBmdXR1cmUgdXNlIGlmIHJlcXVpcmVkLlxyXG4gICAgcG9pbnRlci5sYXN0RXZlbnRDb250ZXh0ID0gY29udGV4dDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGxpa2UgRE9NIFNjZW5lcnlFdmVudC5zdG9wUHJvcGFnYXRpb24oKSwgYnV0IG5hbWVkIGRpZmZlcmVudGx5IHRvIGluZGljYXRlIGl0IGRvZXNuJ3QgZmlyZSB0aGF0IGJlaGF2aW9yIG9uIHRoZSB1bmRlcmx5aW5nIERPTSBldmVudFxyXG4gICAqL1xyXG4gIHB1YmxpYyBoYW5kbGUoKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCAmJiBzY2VuZXJ5TG9nLklucHV0RXZlbnQoICdoYW5kbGVkIGV2ZW50JyApO1xyXG4gICAgdGhpcy5oYW5kbGVkID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGxpa2UgRE9NIFNjZW5lcnlFdmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKSwgYnV0IG5hbWVkIGRpZmZlcmVudGx5IHRvIGluZGljYXRlIGl0IGRvZXNuJ3QgZmlyZSB0aGF0IGJlaGF2aW9yIG9uIHRoZSB1bmRlcmx5aW5nIERPTSBldmVudFxyXG4gICAqL1xyXG4gIHB1YmxpYyBhYm9ydCgpOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dEV2ZW50ICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCggJ2Fib3J0ZWQgZXZlbnQnICk7XHJcbiAgICB0aGlzLmFib3J0ZWQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3BlY2lmaWVzIHdoZXRoZXIgdGhlIFNjZW5lcnlFdmVudCBjYW1lIGZyb20gYWx0ZXJuYXRpdmUgaW5wdXQuIFNlZSBJbnB1dC5QRE9NX0VWRU5UX1RZUEVTIGZvciBhIGxpc3Qgb2YgZXZlbnRzXHJcbiAgICogcGRvbS1yZWxhdGVkIGV2ZW50cyBzdXBwb3J0ZWQgYnkgc2NlbmVyeS4gVGhlc2UgZXZlbnRzIGFyZSBleGNsdXNpdmVseSBzdXBwb3J0ZWQgYnkgdGhlIFBhcmFsbGVsRE9NIGZvciBJbnRlcmFjdGl2ZVxyXG4gICAqIGRlc2NyaXB0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpc0Zyb21QRE9NKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMucG9pbnRlciBpbnN0YW5jZW9mIFBET01Qb2ludGVyO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIGEgdHlwaWNhbCBQcmVzc0xpc3RlbmVyICh0aGF0IGlzbid0IGFscmVhZHkgYXR0YWNoZWQpIGNvdWxkIHN0YXJ0IGEgZHJhZyB3aXRoIHRoaXMgZXZlbnQuXHJcbiAgICpcclxuICAgKiBUaGlzIGNhbiB0eXBpY2FsbHkgYmUgdXNlZCBmb3IgcGF0dGVybnMgd2hlcmUgbm8gYWN0aW9uIHNob3VsZCBiZSB0YWtlbiBpZiBhIHByZXNzIGNhbid0IGJlIHN0YXJ0ZWQsIGUuZy46XHJcbiAgICpcclxuICAgKiAgIGRvd246IGZ1bmN0aW9uKCBldmVudCApIHtcclxuICAgKiAgICAgaWYgKCAhZXZlbnQuY2FuU3RhcnRQcmVzcygpICkgeyByZXR1cm47IH1cclxuICAgKlxyXG4gICAqICAgICAvLyAuLi4gRG8gc3R1ZmYgdG8gY3JlYXRlIGEgbm9kZSB3aXRoIHNvbWUgdHlwZSBvZiBQcmVzc0xpc3RlbmVyXHJcbiAgICpcclxuICAgKiAgICAgZHJhZ0xpc3RlbmVyLnByZXNzKCBldmVudCApO1xyXG4gICAqICAgfVxyXG4gICAqXHJcbiAgICogTk9URTogVGhpcyBpZ25vcmVzIG5vbi1sZWZ0IG1vdXNlIGJ1dHRvbnMgKGFzIHRoaXMgaXMgdGhlIHR5cGljYWwgYmVoYXZpb3IpLiBDdXN0b20gY2hlY2tzIHNob3VsZCBiZSBkb25lIGlmIHRoaXNcclxuICAgKiAgICAgICBpcyBub3Qgc3VpdGFibGUuXHJcbiAgICovXHJcbiAgcHVibGljIGNhblN0YXJ0UHJlc3MoKTogYm9vbGVhbiB7XHJcbiAgICAvLyBJZiB0aGUgcG9pbnRlciBpcyBhbHJlYWR5IGF0dGFjaGVkIChzb21lIG90aGVyIHByZXNzIHByb2JhYmx5KSwgaXQgY2FuJ3Qgc3RhcnQgYSBwcmVzcy5cclxuICAgIC8vIEFkZGl0aW9uYWxseSwgd2UgZ2VuZXJhbGx5IHdhbnQgdG8gaWdub3JlIG5vbi1sZWZ0IG1vdXNlIGJ1dHRvbnMuXHJcbiAgICByZXR1cm4gIXRoaXMucG9pbnRlci5pc0F0dGFjaGVkKCkgJiYgKCAhKCB0aGlzLnBvaW50ZXIgaW5zdGFuY2VvZiBNb3VzZSApIHx8ICggdGhpcy5kb21FdmVudCBhcyB1bmtub3duIGFzIE1vdXNlRXZlbnQgKS5idXR0b24gPT09IDAgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU2NlbmVyeUV2ZW50SU8gPSBuZXcgSU9UeXBlKCAnU2NlbmVyeUV2ZW50SU8nLCB7XHJcbiAgICB2YWx1ZVR5cGU6IFNjZW5lcnlFdmVudCxcclxuICAgIGRvY3VtZW50YXRpb246ICdBbiBldmVudCwgd2l0aCBhIFwicG9pbnRcIiBmaWVsZCcsXHJcbiAgICB0b1N0YXRlT2JqZWN0OiAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKSA9PiB7XHJcblxyXG4gICAgICAvLyBOb3RlOiBJZiBjaGFuZ2luZyB0aGUgY29udGVudHMgb2YgdGhpcyBvYmplY3QsIHBsZWFzZSBkb2N1bWVudCBpdCBpbiB0aGUgcHVibGljIGRvY3VtZW50YXRpb24gc3RyaW5nLlxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHR5cGU6IGV2ZW50LnR5cGUsXHJcbiAgICAgICAgZG9tRXZlbnRUeXBlOiBOdWxsYWJsZUlPKCBFdmVudElPICkudG9TdGF0ZU9iamVjdCggZXZlbnQuZG9tRXZlbnQgKSxcclxuICAgICAgICBwb2ludDogKCBldmVudC5wb2ludGVyICYmIGV2ZW50LnBvaW50ZXIucG9pbnQgKSA/IFZlY3RvcjIuVmVjdG9yMklPLnRvU3RhdGVPYmplY3QoIGV2ZW50LnBvaW50ZXIucG9pbnQgKSA6IG51bGxcclxuICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBzdGF0ZVNjaGVtYToge1xyXG4gICAgICB0eXBlOiBTdHJpbmdJTyxcclxuICAgICAgZG9tRXZlbnRUeXBlOiBOdWxsYWJsZUlPKCBFdmVudElPICksXHJcbiAgICAgIHBvaW50OiBOdWxsYWJsZUlPKCBWZWN0b3IyLlZlY3RvcjJJTyApXHJcbiAgICB9XHJcbiAgfSApO1xyXG5cclxufVxyXG5cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdTY2VuZXJ5RXZlbnQnLCBTY2VuZXJ5RXZlbnQgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsTUFBTSxNQUFNLG9DQUFvQztBQUN2RCxPQUFPQyxVQUFVLE1BQU0sd0NBQXdDO0FBQy9ELE9BQU9DLFFBQVEsTUFBTSxzQ0FBc0M7QUFDM0QsU0FBdUJDLEtBQUssRUFBUUMsV0FBVyxFQUFXQyxPQUFPLFFBQWUsZUFBZTtBQUMvRixPQUFPQyxPQUFPLE1BQU0sY0FBYzs7QUFFbEM7QUFDQSxlQUFlLE1BQU1DLFlBQVksQ0FBcUM7RUFFcEU7O0VBR0E7O0VBR0E7O0VBR0E7O0VBR0E7O0VBR0E7O0VBR0E7O0VBR0E7O0VBR0E7O0VBR0E7O0VBR0E7RUFDQTtFQUdBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTQyxXQUFXQSxDQUFFQyxLQUFZLEVBQUVDLElBQVksRUFBRUMsT0FBZ0IsRUFBRUMsT0FBK0IsRUFBRztJQUNsRzs7SUFFQSxJQUFJLENBQUNDLE9BQU8sR0FBRyxLQUFLO0lBQ3BCLElBQUksQ0FBQ0MsT0FBTyxHQUFHLEtBQUs7SUFDcEIsSUFBSSxDQUFDTCxLQUFLLEdBQUdBLEtBQUs7SUFDbEIsSUFBSSxDQUFDQyxJQUFJLEdBQUdBLElBQUk7SUFDaEIsSUFBSSxDQUFDQyxPQUFPLEdBQUdBLE9BQU87SUFDdEIsSUFBSSxDQUFDQyxPQUFPLEdBQUdBLE9BQU87SUFDdEIsSUFBSSxDQUFDRyxRQUFRLEdBQUdILE9BQU8sQ0FBQ0csUUFBUTtJQUNoQyxJQUFJLENBQUNDLGFBQWEsR0FBR0osT0FBTyxDQUFDSSxhQUFhO0lBQzFDLElBQUksQ0FBQ0MsYUFBYSxHQUFHLElBQUk7SUFDekIsSUFBSSxDQUFDQyxNQUFN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