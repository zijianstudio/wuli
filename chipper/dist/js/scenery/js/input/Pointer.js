// Copyright 2013-2023, University of Colorado Boulder

/*
 * A pointer is an abstraction that includes a mouse and touch points (and possibly keys). The mouse is a single
 * pointer, and each finger (for touch) is a pointer.
 *
 * Listeners that can be added to the pointer, and events will be fired on these listeners before any listeners are
 * fired on the Node structure. This is typically very useful for tracking dragging behavior (where the pointer may
 * cross areas where the dragged node is not directly below the pointer any more).
 *
 * A valid listener should be an object. If a listener has a property with a Scenery event name (e.g. 'down' or
 * 'touchmove'), then that property will be assumed to be a method and will be called with the Scenery event (like
 * normal input listeners, see Node.addInputListener).
 *
 * Pointers can have one active "attached" listener, which is the main handler for responding to the events. This helps
 * when the main behavior needs to be interrupted, or to determine if the pointer is already in use. Additionally, this
 * can be used to prevent pointers from dragging or interacting with multiple components at the same time.
 *
 * A listener may have an interrupt() method that will attemp to interrupt its behavior. If it is added as an attached
 * listener, then it must have an interrupt() method.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import IOType from '../../../tandem/js/types/IOType.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import { scenery } from '../imports.js';
export class Intent extends EnumerationValue {
  // listener attached to the pointer will be used for dragging
  static DRAG = new Intent();

  // listener attached to pointer is for dragging with a keyboard
  static KEYBOARD_DRAG = new Intent();
  static enumeration = new Enumeration(Intent, {
    phetioDocumentation: 'entries when signifying Intent of the pointer'
  });
}
export default class Pointer {
  // The location of the pointer in the global coordinate system.

  // Each Pointer subtype should implement a "type" field that can be checked against for scenery input.

  // The trail that the pointer is currently over (if it has yet been registered). If the pointer has not yet registered
  // a trail, it may be null. If the pointer wasn't over any specific trail, then a trail with only the display's
  // rootNode will be set.
  // The subset of Pointer.trail that is Node.inputEnabled. See Trail.getLastInputEnabledIndex() for details. This is
  // kept separately so that it can be detected when inputEnabled changes.
  // @deprecated Whether this pointer is 'down' (pressed).
  // Will be phased out in https://github.com/phetsims/scenery/issues/803 to something that is specific for the actual
  // mouse/pen button (since this doesn't generalize well to the left/right mouse buttons).
  // Whether there is a main listener "attached" to this pointer. This signals that the
  // listener is "doing" something with the pointer, and that it should be interrupted if other actions need to take
  // over the pointer behavior.
  // All attached listeners (will be activated in order).
  // Our main "attached" listener, if there is one (otherwise null)
  // See setCursor() for more information.
  // (scenery-internal) - Recorded and exposed so that it can be provided to events when there
  // is no "immediate" DOM event (e.g. when a node moves UNDER a pointer and triggers a touch-snag).
  // A Pointer can be assigned an intent when a listener is attached to initiate or prevent
  // certain behavior for the life of the listener. Other listeners can observe the Intents on the Pointer and
  // react accordingly
  // Listeners attached to this pointer that clear the this._intent after input in reserveForDrag functions, referenced
  // so they can be removed on disposal
  // Pointer is not a PhetioObject and not instrumented, but this type is used for
  // toStateObject in Input
  static PointerIO = new IOType('PointerIO', {
    valueType: Pointer,
    toStateObject: pointer => {
      return {
        point: pointer.point.toStateObject(),
        type: pointer.type
      };
    },
    stateSchema: {
      point: Vector2.Vector2IO,
      type: StringIO
    }
  });

  /**
   * @param initialPoint
   * @param type - the type of the pointer; can different for each subtype
   */
  constructor(initialPoint, type) {
    assert && assert(initialPoint === null || initialPoint instanceof Vector2);
    assert && assert(Object.getPrototypeOf(this) !== Pointer.prototype, 'Pointer is an abstract class');
    this.point = initialPoint;
    this.type = type;
    this.trail = null;
    this.inputEnabledTrail = null;
    this.isDownProperty = new BooleanProperty(false);
    this.attachedProperty = new BooleanProperty(false);
    this._listeners = [];
    this._attachedListener = null;
    this._cursor = null;
    this.lastEventContext = null;
    this._intents = [];
    this._pointerCaptured = false;
    this._listenerForDragReserve = null;
    this._listenerForKeyboardDragReserve = null;
  }

  /**
   * Sets a cursor that takes precedence over cursor values specified on the pointer's trail.
   *
   * Typically this can be set when a drag starts (and returned to null when the drag ends), so that the cursor won't
   * change while dragging (regardless of what is actually under the pointer). This generally will only apply to the
   * Mouse subtype of Pointer.
   *
   * NOTE: Consider setting this only for attached listeners in the future (or have a cursor field on pointers).
   */
  setCursor(cursor) {
    this._cursor = cursor;
    return this;
  }
  set cursor(value) {
    this.setCursor(value);
  }
  get cursor() {
    return this.getCursor();
  }

  /**
   * Returns the current cursor override (or null if there is one). See setCursor().
   */
  getCursor() {
    return this._cursor;
  }

  /**
   * Returns a defensive copy of all listeners attached to this pointer. (scenery-internal)
   */
  getListeners() {
    return this._listeners.slice();
  }
  get listeners() {
    return this.getListeners();
  }

  /**
   * Adds an input listener to this pointer. If the attach flag is true, then it will be set as the "attached"
   * listener.
   */
  addInputListener(listener, attach) {
    sceneryLog && sceneryLog.Pointer && sceneryLog.Pointer(`addInputListener to ${this.toString()} attach:${attach}`);
    sceneryLog && sceneryLog.Pointer && sceneryLog.push();
    assert && assert(listener, 'A listener must be provided');
    assert && assert(attach === undefined || typeof attach === 'boolean', 'If provided, the attach parameter should be a boolean value');
    assert && assert(!_.includes(this._listeners, listener), 'Attempted to add an input listener that was already added');
    this._listeners.push(listener);
    if (attach) {
      assert && assert(listener.interrupt, 'Interrupt should exist on attached listeners');
      this.attach(listener);
    }
    sceneryLog && sceneryLog.Pointer && sceneryLog.pop();
  }

  /**
   * Removes an input listener from this pointer.
   */
  removeInputListener(listener) {
    sceneryLog && sceneryLog.Pointer && sceneryLog.Pointer(`removeInputListener to ${this.toString()}`);
    sceneryLog && sceneryLog.Pointer && sceneryLog.push();
    assert && assert(listener, 'A listener must be provided');
    const index = _.indexOf(this._listeners, listener);
    assert && assert(index !== -1, 'Could not find the input listener to remove');

    // If this listener is our attached listener, also detach it
    if (this.isAttached() && listener === this._attachedListener) {
      this.detach(listener);
    }
    this._listeners.splice(index, 1);
    sceneryLog && sceneryLog.Pointer && sceneryLog.pop();
  }

  /**
   * Returns the listener attached to this pointer with attach(), or null if there isn't one.
   */
  getAttachedListener() {
    return this._attachedListener;
  }
  get attachedListener() {
    return this.getAttachedListener();
  }

  /**
   * Returns whether this pointer has an attached (primary) listener.
   */
  isAttached() {
    return this.attachedProperty.value;
  }

  /**
   * Some pointers are treated differently because they behave like a touch. This is not exclusive to `Touch and touch
   * events though. See https://github.com/phetsims/scenery/issues/1156
   */
  isTouchLike() {
    return false;
  }

  /**
   * Sets whether this pointer is down/pressed, or up.
   *
   * NOTE: Naming convention is for legacy code, would usually have pointer.down
   * TODO: improve name, .setDown( value ) with .down =
   */
  set isDown(value) {
    this.isDownProperty.value = value;
  }

  /**
   * Returns whether this pointer is down/pressed, or up.
   *
   * NOTE: Naming convention is for legacy code, would usually have pointer.down
   * TODO: improve name, .isDown() with .down
   */
  get isDown() {
    return this.isDownProperty.value;
  }

  /**
   * If there is an attached listener, interrupt it.
   *
   * After this executes, this pointer should not be attached.
   */
  interruptAttached() {
    if (this.isAttached()) {
      this._attachedListener.interrupt(); // Any listener that uses the 'attach' API should have interrupt()
    }
  }

  /**
   * Interrupts all listeners on this pointer.
   */
  interruptAll() {
    const listeners = this._listeners.slice();
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener.interrupt && listener.interrupt();
    }
  }

  /**
   * Marks the pointer as attached to this listener.
   */
  attach(listener) {
    sceneryLog && sceneryLog.Pointer && sceneryLog.Pointer(`Attaching to ${this.toString()}`);
    assert && assert(!this.isAttached(), 'Attempted to attach to an already attached pointer');
    this.attachedProperty.value = true;
    this._attachedListener = listener;
  }

  /**
   * @returns - Whether the point changed
   */
  updatePoint(point, eventName = 'event') {
    const pointChanged = this.hasPointChanged(point);
    point && sceneryLog && sceneryLog.InputEvent && sceneryLog.InputEvent(`pointer ${eventName} at ${point.toString()}`);
    this.point = point;
    return pointChanged;
  }

  /**
   * Sets information in this Pointer for a given pointer down. (scenery-internal)
   *
   @returns - Whether the point changed
   */
  down(event) {
    this.isDown = true;
  }

  /**
   * Sets information in this Pointer for a given pointer up. (scenery-internal)
   *
   * @returns - Whether the point changed
   */
  up(point, event) {
    this.isDown = false;
    return this.updatePoint(point, 'up');
  }

  /**
   * Sets information in this Pointer for a given pointer cancel. (scenery-internal)
   *
   * @returns - Whether the point changed
   */
  cancel(point) {
    this.isDown = false;
    return this.updatePoint(point, 'cancel');
  }

  /**
   * Marks the pointer as detached from a previously attached listener.
   */
  detach(listener) {
    sceneryLog && sceneryLog.Pointer && sceneryLog.Pointer(`Detaching from ${this.toString()}`);
    assert && assert(this.isAttached(), 'Cannot detach a listener if one is not attached');
    assert && assert(this._attachedListener === listener, 'Cannot detach a different listener');
    this.attachedProperty.value = false;
    this._attachedListener = null;
  }

  /**
   * Determines whether the point of the pointer has changed (used in mouse/touch/pen).
   */
  hasPointChanged(point) {
    return this.point !== point && (!point || !this.point || !this.point.equals(point));
  }

  /**
   * Adds an Intent Pointer. By setting Intent, other listeners in the dispatch phase can react accordingly.
   * Note that the Intent can be changed by listeners up the dispatch phase or on the next press. See Intent enum
   * for valid entries.
   */
  addIntent(intent) {
    assert && assert(Intent.enumeration.includes(intent), 'trying to set unsupported intent for Pointer');
    if (!this._intents.includes(intent)) {
      this._intents.push(intent);
    }
    assert && assert(this._intents.length <= Intent.enumeration.values.length, 'to many Intents saved, memory leak likely');
  }

  /**
   * Remove an Intent from the Pointer. See addIntent for more information.
   */
  removeIntent(intent) {
    assert && assert(Intent.enumeration.includes(intent), 'trying to set unsupported intent for Pointer');
    if (this._intents.includes(intent)) {
      const index = this._intents.indexOf(intent);
      this._intents.splice(index, 1);
    }
  }

  /**
   * Returns whether or not this Pointer has been assigned the provided Intent.
   */
  hasIntent(intent) {
    return this._intents.includes(intent);
  }

  /**
   * Set the intent of this Pointer to indicate that it will be used for mouse/touch style dragging, indicating to
   * other listeners in the dispatch phase that behavior may need to change. Adds a listener to the pointer (with
   * self removal) that clears the intent when the pointer receives an "up" event. Should generally be called on
   * the Pointer in response to a down event.
   */
  reserveForDrag() {
    // if the Pointer hasn't already been reserved for drag in Input event dispatch, in which
    // case it already has Intent and listener to remove Intent
    if (!this._intents.includes(Intent.DRAG)) {
      this.addIntent(Intent.DRAG);
      const listener = {
        up: event => {
          this.removeIntent(Intent.DRAG);
          this.removeInputListener(this._listenerForDragReserve);
          this._listenerForDragReserve = null;
        }
      };
      assert && assert(this._listenerForDragReserve === null, 'still a listener to reserve pointer, memory leak likely');
      this._listenerForDragReserve = listener;
      this.addInputListener(this._listenerForDragReserve);
    }
  }

  /**
   * Set the intent of this Pointer to indicate that it will be used for keyboard style dragging, indicating to
   * other listeners in the dispatch that behavior may need to change. Adds a listener to the pointer (with self
   * removal) that clears the intent when the pointer receives a "keyup" or "blur" event. Should generally be called
   * on the Pointer in response to a keydown event.
   */
  reserveForKeyboardDrag() {
    if (!this._intents.includes(Intent.KEYBOARD_DRAG)) {
      this.addIntent(Intent.KEYBOARD_DRAG);
      const listener = {
        keyup: event => clearIntent(),
        // clear on blur as well since focus may be lost before we receive a keyup event
        blur: event => clearIntent()
      };
      const clearIntent = () => {
        this.removeIntent(Intent.KEYBOARD_DRAG);
        this.removeInputListener(this._listenerForKeyboardDragReserve);
        this._listenerForKeyboardDragReserve = null;
      };
      assert && assert(this._listenerForDragReserve === null, 'still a listener on Pointer for reserve, memory leak likely');
      this._listenerForKeyboardDragReserve = listener;
      this.addInputListener(this._listenerForKeyboardDragReserve);
    }
  }

  /**
   * This is called when a capture starts on this pointer. We request it on pointerstart, and if received, we should
   * generally receive events outside the window.
   */
  onGotPointerCapture() {
    this._pointerCaptured = true;
  }

  /**
   * This is called when a capture ends on this pointer. This happens normally when the user releases the pointer above
   * the sim or outside, but also in cases where we have NOT received an up/end.
   *
   * See https://github.com/phetsims/scenery/issues/1186 for more information. We'll want to interrupt the pointer
   * on this case regardless,
   */
  onLostPointerCapture() {
    if (this._pointerCaptured) {
      this.interruptAll();
    }
    this._pointerCaptured = false;
  }

  /**
   * Releases references so it can be garbage collected.
   */
  dispose() {
    sceneryLog && sceneryLog.Pointer && sceneryLog.Pointer(`Disposing ${this.toString()}`);

    // remove listeners that would clear intent on disposal
    if (this._listenerForDragReserve && this._listeners.includes(this._listenerForDragReserve)) {
      this.removeInputListener(this._listenerForDragReserve);
    }
    if (this._listenerForKeyboardDragReserve && this._listeners.includes(this._listenerForKeyboardDragReserve)) {
      this.removeInputListener(this._listenerForKeyboardDragReserve);
    }
    assert && assert(this._attachedListener === null, 'Attached listeners should be cleared before pointer disposal');
    assert && assert(this._listeners.length === 0, 'Should not have listeners when a pointer is disposed');
  }
  toString() {
    return `Pointer#${this.type}_at_${this.point}`;
  }
}
scenery.register('Pointer', Pointer);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJWZWN0b3IyIiwiRW51bWVyYXRpb24iLCJFbnVtZXJhdGlvblZhbHVlIiwiSU9UeXBlIiwiU3RyaW5nSU8iLCJzY2VuZXJ5IiwiSW50ZW50IiwiRFJBRyIsIktFWUJPQVJEX0RSQUciLCJlbnVtZXJhdGlvbiIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJQb2ludGVyIiwiUG9pbnRlcklPIiwidmFsdWVUeXBlIiwidG9TdGF0ZU9iamVjdCIsInBvaW50ZXIiLCJwb2ludCIsInR5cGUiLCJzdGF0ZVNjaGVtYSIsIlZlY3RvcjJJTyIsImNvbnN0cnVjdG9yIiwiaW5pdGlhbFBvaW50IiwiYXNzZXJ0IiwiT2JqZWN0IiwiZ2V0UHJvdG90eXBlT2YiLCJwcm90b3R5cGUiLCJ0cmFpbCIsImlucHV0RW5hYmxlZFRyYWlsIiwiaXNEb3duUHJvcGVydHkiLCJhdHRhY2hlZFByb3BlcnR5IiwiX2xpc3RlbmVycyIsIl9hdHRhY2hlZExpc3RlbmVyIiwiX2N1cnNvciIsImxhc3RFdmVudENvbnRleHQiLCJfaW50ZW50cyIsIl9wb2ludGVyQ2FwdHVyZWQiLCJfbGlzdGVuZXJGb3JEcmFnUmVzZXJ2ZSIsIl9saXN0ZW5lckZvcktleWJvYXJkRHJhZ1Jlc2VydmUiLCJzZXRDdXJzb3IiLCJjdXJzb3IiLCJ2YWx1ZSIsImdldEN1cnNvciIsImdldExpc3RlbmVycyIsInNsaWNlIiwibGlzdGVuZXJzIiwiYWRkSW5wdXRMaXN0ZW5lciIsImxpc3RlbmVyIiwiYXR0YWNoIiwic2NlbmVyeUxvZyIsInRvU3RyaW5nIiwicHVzaCIsInVuZGVmaW5lZCIsIl8iLCJpbmNsdWRlcyIsImludGVycnVwdCIsInBvcCIsInJlbW92ZUlucHV0TGlzdGVuZXIiLCJpbmRleCIsImluZGV4T2YiLCJpc0F0dGFjaGVkIiwiZGV0YWNoIiwic3BsaWNlIiwiZ2V0QXR0YWNoZWRMaXN0ZW5lciIsImF0dGFjaGVkTGlzdGVuZXIiLCJpc1RvdWNoTGlrZSIsImlzRG93biIsImludGVycnVwdEF0dGFjaGVkIiwiaW50ZXJydXB0QWxsIiwiaSIsImxlbmd0aCIsInVwZGF0ZVBvaW50IiwiZXZlbnROYW1lIiwicG9pbnRDaGFuZ2VkIiwiaGFzUG9pbnRDaGFuZ2VkIiwiSW5wdXRFdmVudCIsImRvd24iLCJldmVudCIsInVwIiwiY2FuY2VsIiwiZXF1YWxzIiwiYWRkSW50ZW50IiwiaW50ZW50IiwidmFsdWVzIiwicmVtb3ZlSW50ZW50IiwiaGFzSW50ZW50IiwicmVzZXJ2ZUZvckRyYWciLCJyZXNlcnZlRm9yS2V5Ym9hcmREcmFnIiwia2V5dXAiLCJjbGVhckludGVudCIsImJsdXIiLCJvbkdvdFBvaW50ZXJDYXB0dXJlIiwib25Mb3N0UG9pbnRlckNhcHR1cmUiLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQb2ludGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLypcclxuICogQSBwb2ludGVyIGlzIGFuIGFic3RyYWN0aW9uIHRoYXQgaW5jbHVkZXMgYSBtb3VzZSBhbmQgdG91Y2ggcG9pbnRzIChhbmQgcG9zc2libHkga2V5cykuIFRoZSBtb3VzZSBpcyBhIHNpbmdsZVxyXG4gKiBwb2ludGVyLCBhbmQgZWFjaCBmaW5nZXIgKGZvciB0b3VjaCkgaXMgYSBwb2ludGVyLlxyXG4gKlxyXG4gKiBMaXN0ZW5lcnMgdGhhdCBjYW4gYmUgYWRkZWQgdG8gdGhlIHBvaW50ZXIsIGFuZCBldmVudHMgd2lsbCBiZSBmaXJlZCBvbiB0aGVzZSBsaXN0ZW5lcnMgYmVmb3JlIGFueSBsaXN0ZW5lcnMgYXJlXHJcbiAqIGZpcmVkIG9uIHRoZSBOb2RlIHN0cnVjdHVyZS4gVGhpcyBpcyB0eXBpY2FsbHkgdmVyeSB1c2VmdWwgZm9yIHRyYWNraW5nIGRyYWdnaW5nIGJlaGF2aW9yICh3aGVyZSB0aGUgcG9pbnRlciBtYXlcclxuICogY3Jvc3MgYXJlYXMgd2hlcmUgdGhlIGRyYWdnZWQgbm9kZSBpcyBub3QgZGlyZWN0bHkgYmVsb3cgdGhlIHBvaW50ZXIgYW55IG1vcmUpLlxyXG4gKlxyXG4gKiBBIHZhbGlkIGxpc3RlbmVyIHNob3VsZCBiZSBhbiBvYmplY3QuIElmIGEgbGlzdGVuZXIgaGFzIGEgcHJvcGVydHkgd2l0aCBhIFNjZW5lcnkgZXZlbnQgbmFtZSAoZS5nLiAnZG93bicgb3JcclxuICogJ3RvdWNobW92ZScpLCB0aGVuIHRoYXQgcHJvcGVydHkgd2lsbCBiZSBhc3N1bWVkIHRvIGJlIGEgbWV0aG9kIGFuZCB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZSBTY2VuZXJ5IGV2ZW50IChsaWtlXHJcbiAqIG5vcm1hbCBpbnB1dCBsaXN0ZW5lcnMsIHNlZSBOb2RlLmFkZElucHV0TGlzdGVuZXIpLlxyXG4gKlxyXG4gKiBQb2ludGVycyBjYW4gaGF2ZSBvbmUgYWN0aXZlIFwiYXR0YWNoZWRcIiBsaXN0ZW5lciwgd2hpY2ggaXMgdGhlIG1haW4gaGFuZGxlciBmb3IgcmVzcG9uZGluZyB0byB0aGUgZXZlbnRzLiBUaGlzIGhlbHBzXHJcbiAqIHdoZW4gdGhlIG1haW4gYmVoYXZpb3IgbmVlZHMgdG8gYmUgaW50ZXJydXB0ZWQsIG9yIHRvIGRldGVybWluZSBpZiB0aGUgcG9pbnRlciBpcyBhbHJlYWR5IGluIHVzZS4gQWRkaXRpb25hbGx5LCB0aGlzXHJcbiAqIGNhbiBiZSB1c2VkIHRvIHByZXZlbnQgcG9pbnRlcnMgZnJvbSBkcmFnZ2luZyBvciBpbnRlcmFjdGluZyB3aXRoIG11bHRpcGxlIGNvbXBvbmVudHMgYXQgdGhlIHNhbWUgdGltZS5cclxuICpcclxuICogQSBsaXN0ZW5lciBtYXkgaGF2ZSBhbiBpbnRlcnJ1cHQoKSBtZXRob2QgdGhhdCB3aWxsIGF0dGVtcCB0byBpbnRlcnJ1cHQgaXRzIGJlaGF2aW9yLiBJZiBpdCBpcyBhZGRlZCBhcyBhbiBhdHRhY2hlZFxyXG4gKiBsaXN0ZW5lciwgdGhlbiBpdCBtdXN0IGhhdmUgYW4gaW50ZXJydXB0KCkgbWV0aG9kLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvbiBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb24uanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25WYWx1ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25WYWx1ZS5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvU3RyaW5nSU8uanMnO1xyXG5pbXBvcnQgVEF0dGFjaGFibGVJbnB1dExpc3RlbmVyIGZyb20gJy4vVEF0dGFjaGFibGVJbnB1dExpc3RlbmVyLmpzJztcclxuaW1wb3J0IHsgRXZlbnRDb250ZXh0LCBzY2VuZXJ5LCBTY2VuZXJ5RXZlbnQsIFRJbnB1dExpc3RlbmVyLCBUcmFpbCB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEludGVudCBleHRlbmRzIEVudW1lcmF0aW9uVmFsdWUge1xyXG4gIC8vIGxpc3RlbmVyIGF0dGFjaGVkIHRvIHRoZSBwb2ludGVyIHdpbGwgYmUgdXNlZCBmb3IgZHJhZ2dpbmdcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IERSQUcgPSBuZXcgSW50ZW50KCk7XHJcblxyXG4gIC8vIGxpc3RlbmVyIGF0dGFjaGVkIHRvIHBvaW50ZXIgaXMgZm9yIGRyYWdnaW5nIHdpdGggYSBrZXlib2FyZFxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgS0VZQk9BUkRfRFJBRyA9IG5ldyBJbnRlbnQoKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBlbnVtZXJhdGlvbiA9IG5ldyBFbnVtZXJhdGlvbiggSW50ZW50LCB7XHJcbiAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnZW50cmllcyB3aGVuIHNpZ25pZnlpbmcgSW50ZW50IG9mIHRoZSBwb2ludGVyJ1xyXG4gIH0gKTtcclxufVxyXG5cclxudHlwZSBQb2ludGVyVHlwZSA9ICdwZG9tJyB8ICd0b3VjaCcgfCAnbW91c2UnIHwgJ3Blbic7XHJcblxyXG5leHBvcnQgdHlwZSBBY3RpdmVQb2ludGVyID0ge1xyXG4gIHBvaW50OiBWZWN0b3IyO1xyXG59ICYgUG9pbnRlcjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIFBvaW50ZXIge1xyXG5cclxuICAvLyBUaGUgbG9jYXRpb24gb2YgdGhlIHBvaW50ZXIgaW4gdGhlIGdsb2JhbCBjb29yZGluYXRlIHN5c3RlbS5cclxuICBwdWJsaWMgcG9pbnQ6IFZlY3RvcjI7XHJcblxyXG4gIC8vIEVhY2ggUG9pbnRlciBzdWJ0eXBlIHNob3VsZCBpbXBsZW1lbnQgYSBcInR5cGVcIiBmaWVsZCB0aGF0IGNhbiBiZSBjaGVja2VkIGFnYWluc3QgZm9yIHNjZW5lcnkgaW5wdXQuXHJcbiAgcHVibGljIHJlYWRvbmx5IHR5cGU6IFBvaW50ZXJUeXBlO1xyXG5cclxuICAvLyBUaGUgdHJhaWwgdGhhdCB0aGUgcG9pbnRlciBpcyBjdXJyZW50bHkgb3ZlciAoaWYgaXQgaGFzIHlldCBiZWVuIHJlZ2lzdGVyZWQpLiBJZiB0aGUgcG9pbnRlciBoYXMgbm90IHlldCByZWdpc3RlcmVkXHJcbiAgLy8gYSB0cmFpbCwgaXQgbWF5IGJlIG51bGwuIElmIHRoZSBwb2ludGVyIHdhc24ndCBvdmVyIGFueSBzcGVjaWZpYyB0cmFpbCwgdGhlbiBhIHRyYWlsIHdpdGggb25seSB0aGUgZGlzcGxheSdzXHJcbiAgLy8gcm9vdE5vZGUgd2lsbCBiZSBzZXQuXHJcbiAgcHVibGljIHRyYWlsOiBUcmFpbCB8IG51bGw7XHJcblxyXG4gIC8vIFRoZSBzdWJzZXQgb2YgUG9pbnRlci50cmFpbCB0aGF0IGlzIE5vZGUuaW5wdXRFbmFibGVkLiBTZWUgVHJhaWwuZ2V0TGFzdElucHV0RW5hYmxlZEluZGV4KCkgZm9yIGRldGFpbHMuIFRoaXMgaXNcclxuICAvLyBrZXB0IHNlcGFyYXRlbHkgc28gdGhhdCBpdCBjYW4gYmUgZGV0ZWN0ZWQgd2hlbiBpbnB1dEVuYWJsZWQgY2hhbmdlcy5cclxuICBwdWJsaWMgaW5wdXRFbmFibGVkVHJhaWw6IFRyYWlsIHwgbnVsbDtcclxuXHJcbiAgLy8gQGRlcHJlY2F0ZWQgV2hldGhlciB0aGlzIHBvaW50ZXIgaXMgJ2Rvd24nIChwcmVzc2VkKS5cclxuICAvLyBXaWxsIGJlIHBoYXNlZCBvdXQgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzgwMyB0byBzb21ldGhpbmcgdGhhdCBpcyBzcGVjaWZpYyBmb3IgdGhlIGFjdHVhbFxyXG4gIC8vIG1vdXNlL3BlbiBidXR0b24gKHNpbmNlIHRoaXMgZG9lc24ndCBnZW5lcmFsaXplIHdlbGwgdG8gdGhlIGxlZnQvcmlnaHQgbW91c2UgYnV0dG9ucykuXHJcbiAgcHVibGljIGlzRG93blByb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vIFdoZXRoZXIgdGhlcmUgaXMgYSBtYWluIGxpc3RlbmVyIFwiYXR0YWNoZWRcIiB0byB0aGlzIHBvaW50ZXIuIFRoaXMgc2lnbmFscyB0aGF0IHRoZVxyXG4gIC8vIGxpc3RlbmVyIGlzIFwiZG9pbmdcIiBzb21ldGhpbmcgd2l0aCB0aGUgcG9pbnRlciwgYW5kIHRoYXQgaXQgc2hvdWxkIGJlIGludGVycnVwdGVkIGlmIG90aGVyIGFjdGlvbnMgbmVlZCB0byB0YWtlXHJcbiAgLy8gb3ZlciB0aGUgcG9pbnRlciBiZWhhdmlvci5cclxuICBwdWJsaWMgYXR0YWNoZWRQcm9wZXJ0eTogVFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICAvLyBBbGwgYXR0YWNoZWQgbGlzdGVuZXJzICh3aWxsIGJlIGFjdGl2YXRlZCBpbiBvcmRlcikuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBfbGlzdGVuZXJzOiBUSW5wdXRMaXN0ZW5lcltdO1xyXG5cclxuICAvLyBPdXIgbWFpbiBcImF0dGFjaGVkXCIgbGlzdGVuZXIsIGlmIHRoZXJlIGlzIG9uZSAob3RoZXJ3aXNlIG51bGwpXHJcbiAgcHJpdmF0ZSBfYXR0YWNoZWRMaXN0ZW5lcjogVEF0dGFjaGFibGVJbnB1dExpc3RlbmVyIHwgbnVsbDtcclxuXHJcbiAgLy8gU2VlIHNldEN1cnNvcigpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxyXG4gIHByaXZhdGUgX2N1cnNvcjogc3RyaW5nIHwgbnVsbDtcclxuXHJcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpIC0gUmVjb3JkZWQgYW5kIGV4cG9zZWQgc28gdGhhdCBpdCBjYW4gYmUgcHJvdmlkZWQgdG8gZXZlbnRzIHdoZW4gdGhlcmVcclxuICAvLyBpcyBubyBcImltbWVkaWF0ZVwiIERPTSBldmVudCAoZS5nLiB3aGVuIGEgbm9kZSBtb3ZlcyBVTkRFUiBhIHBvaW50ZXIgYW5kIHRyaWdnZXJzIGEgdG91Y2gtc25hZykuXHJcbiAgcHVibGljIGxhc3RFdmVudENvbnRleHQ6IEV2ZW50Q29udGV4dCB8IG51bGw7XHJcblxyXG4gIC8vIEEgUG9pbnRlciBjYW4gYmUgYXNzaWduZWQgYW4gaW50ZW50IHdoZW4gYSBsaXN0ZW5lciBpcyBhdHRhY2hlZCB0byBpbml0aWF0ZSBvciBwcmV2ZW50XHJcbiAgLy8gY2VydGFpbiBiZWhhdmlvciBmb3IgdGhlIGxpZmUgb2YgdGhlIGxpc3RlbmVyLiBPdGhlciBsaXN0ZW5lcnMgY2FuIG9ic2VydmUgdGhlIEludGVudHMgb24gdGhlIFBvaW50ZXIgYW5kXHJcbiAgLy8gcmVhY3QgYWNjb3JkaW5nbHlcclxuICBwcml2YXRlIF9pbnRlbnRzOiBJbnRlbnRbXTtcclxuXHJcbiAgcHJpdmF0ZSBfcG9pbnRlckNhcHR1cmVkOiBib29sZWFuO1xyXG5cclxuICAvLyBMaXN0ZW5lcnMgYXR0YWNoZWQgdG8gdGhpcyBwb2ludGVyIHRoYXQgY2xlYXIgdGhlIHRoaXMuX2ludGVudCBhZnRlciBpbnB1dCBpbiByZXNlcnZlRm9yRHJhZyBmdW5jdGlvbnMsIHJlZmVyZW5jZWRcclxuICAvLyBzbyB0aGV5IGNhbiBiZSByZW1vdmVkIG9uIGRpc3Bvc2FsXHJcbiAgcHJpdmF0ZSBfbGlzdGVuZXJGb3JEcmFnUmVzZXJ2ZTogVElucHV0TGlzdGVuZXIgfCBudWxsO1xyXG4gIHByaXZhdGUgX2xpc3RlbmVyRm9yS2V5Ym9hcmREcmFnUmVzZXJ2ZTogVElucHV0TGlzdGVuZXIgfCBudWxsO1xyXG5cclxuXHJcbiAgLy8gUG9pbnRlciBpcyBub3QgYSBQaGV0aW9PYmplY3QgYW5kIG5vdCBpbnN0cnVtZW50ZWQsIGJ1dCB0aGlzIHR5cGUgaXMgdXNlZCBmb3JcclxuICAvLyB0b1N0YXRlT2JqZWN0IGluIElucHV0XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBQb2ludGVySU8gPSBuZXcgSU9UeXBlPFBvaW50ZXI+KCAnUG9pbnRlcklPJywge1xyXG4gICAgdmFsdWVUeXBlOiBQb2ludGVyLFxyXG4gICAgdG9TdGF0ZU9iamVjdDogKCBwb2ludGVyOiBQb2ludGVyICkgPT4ge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHBvaW50OiBwb2ludGVyLnBvaW50LnRvU3RhdGVPYmplY3QoKSxcclxuICAgICAgICB0eXBlOiBwb2ludGVyLnR5cGVcclxuICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBzdGF0ZVNjaGVtYToge1xyXG4gICAgICBwb2ludDogVmVjdG9yMi5WZWN0b3IySU8sXHJcbiAgICAgIHR5cGU6IFN0cmluZ0lPXHJcbiAgICB9XHJcbiAgfSApO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gaW5pdGlhbFBvaW50XHJcbiAgICogQHBhcmFtIHR5cGUgLSB0aGUgdHlwZSBvZiB0aGUgcG9pbnRlcjsgY2FuIGRpZmZlcmVudCBmb3IgZWFjaCBzdWJ0eXBlXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKCBpbml0aWFsUG9pbnQ6IFZlY3RvcjIsIHR5cGU6IFBvaW50ZXJUeXBlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5pdGlhbFBvaW50ID09PSBudWxsIHx8IGluaXRpYWxQb2ludCBpbnN0YW5jZW9mIFZlY3RvcjIgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIE9iamVjdC5nZXRQcm90b3R5cGVPZiggdGhpcyApICE9PSBQb2ludGVyLnByb3RvdHlwZSwgJ1BvaW50ZXIgaXMgYW4gYWJzdHJhY3QgY2xhc3MnICk7XHJcblxyXG4gICAgdGhpcy5wb2ludCA9IGluaXRpYWxQb2ludDtcclxuICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICB0aGlzLnRyYWlsID0gbnVsbDtcclxuICAgIHRoaXMuaW5wdXRFbmFibGVkVHJhaWwgPSBudWxsO1xyXG4gICAgdGhpcy5pc0Rvd25Qcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgICB0aGlzLmF0dGFjaGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG4gICAgdGhpcy5fbGlzdGVuZXJzID0gW107XHJcbiAgICB0aGlzLl9hdHRhY2hlZExpc3RlbmVyID0gbnVsbDtcclxuICAgIHRoaXMuX2N1cnNvciA9IG51bGw7XHJcbiAgICB0aGlzLmxhc3RFdmVudENvbnRleHQgPSBudWxsO1xyXG4gICAgdGhpcy5faW50ZW50cyA9IFtdO1xyXG4gICAgdGhpcy5fcG9pbnRlckNhcHR1cmVkID0gZmFsc2U7XHJcbiAgICB0aGlzLl9saXN0ZW5lckZvckRyYWdSZXNlcnZlID0gbnVsbDtcclxuICAgIHRoaXMuX2xpc3RlbmVyRm9yS2V5Ym9hcmREcmFnUmVzZXJ2ZSA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIGEgY3Vyc29yIHRoYXQgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIGN1cnNvciB2YWx1ZXMgc3BlY2lmaWVkIG9uIHRoZSBwb2ludGVyJ3MgdHJhaWwuXHJcbiAgICpcclxuICAgKiBUeXBpY2FsbHkgdGhpcyBjYW4gYmUgc2V0IHdoZW4gYSBkcmFnIHN0YXJ0cyAoYW5kIHJldHVybmVkIHRvIG51bGwgd2hlbiB0aGUgZHJhZyBlbmRzKSwgc28gdGhhdCB0aGUgY3Vyc29yIHdvbid0XHJcbiAgICogY2hhbmdlIHdoaWxlIGRyYWdnaW5nIChyZWdhcmRsZXNzIG9mIHdoYXQgaXMgYWN0dWFsbHkgdW5kZXIgdGhlIHBvaW50ZXIpLiBUaGlzIGdlbmVyYWxseSB3aWxsIG9ubHkgYXBwbHkgdG8gdGhlXHJcbiAgICogTW91c2Ugc3VidHlwZSBvZiBQb2ludGVyLlxyXG4gICAqXHJcbiAgICogTk9URTogQ29uc2lkZXIgc2V0dGluZyB0aGlzIG9ubHkgZm9yIGF0dGFjaGVkIGxpc3RlbmVycyBpbiB0aGUgZnV0dXJlIChvciBoYXZlIGEgY3Vyc29yIGZpZWxkIG9uIHBvaW50ZXJzKS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0Q3Vyc29yKCBjdXJzb3I6IHN0cmluZyB8IG51bGwgKTogdGhpcyB7XHJcbiAgICB0aGlzLl9jdXJzb3IgPSBjdXJzb3I7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGN1cnNvciggdmFsdWU6IHN0cmluZyB8IG51bGwgKSB7IHRoaXMuc2V0Q3Vyc29yKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgY3Vyc29yKCk6IHN0cmluZyB8IG51bGwgeyByZXR1cm4gdGhpcy5nZXRDdXJzb3IoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IGN1cnNvciBvdmVycmlkZSAob3IgbnVsbCBpZiB0aGVyZSBpcyBvbmUpLiBTZWUgc2V0Q3Vyc29yKCkuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEN1cnNvcigpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9jdXJzb3I7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgZGVmZW5zaXZlIGNvcHkgb2YgYWxsIGxpc3RlbmVycyBhdHRhY2hlZCB0byB0aGlzIHBvaW50ZXIuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRMaXN0ZW5lcnMoKTogVElucHV0TGlzdGVuZXJbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5fbGlzdGVuZXJzLnNsaWNlKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGxpc3RlbmVycygpOiBUSW5wdXRMaXN0ZW5lcltdIHsgcmV0dXJuIHRoaXMuZ2V0TGlzdGVuZXJzKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhbiBpbnB1dCBsaXN0ZW5lciB0byB0aGlzIHBvaW50ZXIuIElmIHRoZSBhdHRhY2ggZmxhZyBpcyB0cnVlLCB0aGVuIGl0IHdpbGwgYmUgc2V0IGFzIHRoZSBcImF0dGFjaGVkXCJcclxuICAgKiBsaXN0ZW5lci5cclxuICAgKi9cclxuICBwdWJsaWMgYWRkSW5wdXRMaXN0ZW5lciggbGlzdGVuZXI6IFRJbnB1dExpc3RlbmVyLCBhdHRhY2g/OiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBvaW50ZXIgJiYgc2NlbmVyeUxvZy5Qb2ludGVyKCBgYWRkSW5wdXRMaXN0ZW5lciB0byAke3RoaXMudG9TdHJpbmcoKX0gYXR0YWNoOiR7YXR0YWNofWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5Qb2ludGVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpc3RlbmVyLCAnQSBsaXN0ZW5lciBtdXN0IGJlIHByb3ZpZGVkJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYXR0YWNoID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIGF0dGFjaCA9PT0gJ2Jvb2xlYW4nLFxyXG4gICAgICAnSWYgcHJvdmlkZWQsIHRoZSBhdHRhY2ggcGFyYW1ldGVyIHNob3VsZCBiZSBhIGJvb2xlYW4gdmFsdWUnICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIV8uaW5jbHVkZXMoIHRoaXMuX2xpc3RlbmVycywgbGlzdGVuZXIgKSxcclxuICAgICAgJ0F0dGVtcHRlZCB0byBhZGQgYW4gaW5wdXQgbGlzdGVuZXIgdGhhdCB3YXMgYWxyZWFkeSBhZGRlZCcgKTtcclxuXHJcbiAgICB0aGlzLl9saXN0ZW5lcnMucHVzaCggbGlzdGVuZXIgKTtcclxuXHJcbiAgICBpZiAoIGF0dGFjaCApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbGlzdGVuZXIuaW50ZXJydXB0LCAnSW50ZXJydXB0IHNob3VsZCBleGlzdCBvbiBhdHRhY2hlZCBsaXN0ZW5lcnMnICk7XHJcbiAgICAgIHRoaXMuYXR0YWNoKCBsaXN0ZW5lciBhcyBUQXR0YWNoYWJsZUlucHV0TGlzdGVuZXIgKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUG9pbnRlciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhbiBpbnB1dCBsaXN0ZW5lciBmcm9tIHRoaXMgcG9pbnRlci5cclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlSW5wdXRMaXN0ZW5lciggbGlzdGVuZXI6IFRJbnB1dExpc3RlbmVyICk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBvaW50ZXIgJiYgc2NlbmVyeUxvZy5Qb2ludGVyKCBgcmVtb3ZlSW5wdXRMaXN0ZW5lciB0byAke3RoaXMudG9TdHJpbmcoKX1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUG9pbnRlciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsaXN0ZW5lciwgJ0EgbGlzdGVuZXIgbXVzdCBiZSBwcm92aWRlZCcgKTtcclxuXHJcbiAgICBjb25zdCBpbmRleCA9IF8uaW5kZXhPZiggdGhpcy5fbGlzdGVuZXJzLCBsaXN0ZW5lciApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5kZXggIT09IC0xLCAnQ291bGQgbm90IGZpbmQgdGhlIGlucHV0IGxpc3RlbmVyIHRvIHJlbW92ZScgKTtcclxuXHJcbiAgICAvLyBJZiB0aGlzIGxpc3RlbmVyIGlzIG91ciBhdHRhY2hlZCBsaXN0ZW5lciwgYWxzbyBkZXRhY2ggaXRcclxuICAgIGlmICggdGhpcy5pc0F0dGFjaGVkKCkgJiYgbGlzdGVuZXIgPT09IHRoaXMuX2F0dGFjaGVkTGlzdGVuZXIgKSB7XHJcbiAgICAgIHRoaXMuZGV0YWNoKCBsaXN0ZW5lciBhcyBUQXR0YWNoYWJsZUlucHV0TGlzdGVuZXIgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9saXN0ZW5lcnMuc3BsaWNlKCBpbmRleCwgMSApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5Qb2ludGVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBsaXN0ZW5lciBhdHRhY2hlZCB0byB0aGlzIHBvaW50ZXIgd2l0aCBhdHRhY2goKSwgb3IgbnVsbCBpZiB0aGVyZSBpc24ndCBvbmUuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEF0dGFjaGVkTGlzdGVuZXIoKTogVEF0dGFjaGFibGVJbnB1dExpc3RlbmVyIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fYXR0YWNoZWRMaXN0ZW5lcjtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgYXR0YWNoZWRMaXN0ZW5lcigpOiBUQXR0YWNoYWJsZUlucHV0TGlzdGVuZXIgfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0QXR0YWNoZWRMaXN0ZW5lcigpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciB0aGlzIHBvaW50ZXIgaGFzIGFuIGF0dGFjaGVkIChwcmltYXJ5KSBsaXN0ZW5lci5cclxuICAgKi9cclxuICBwdWJsaWMgaXNBdHRhY2hlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmF0dGFjaGVkUHJvcGVydHkudmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTb21lIHBvaW50ZXJzIGFyZSB0cmVhdGVkIGRpZmZlcmVudGx5IGJlY2F1c2UgdGhleSBiZWhhdmUgbGlrZSBhIHRvdWNoLiBUaGlzIGlzIG5vdCBleGNsdXNpdmUgdG8gYFRvdWNoIGFuZCB0b3VjaFxyXG4gICAqIGV2ZW50cyB0aG91Z2guIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTE1NlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpc1RvdWNoTGlrZSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgd2hldGhlciB0aGlzIHBvaW50ZXIgaXMgZG93bi9wcmVzc2VkLCBvciB1cC5cclxuICAgKlxyXG4gICAqIE5PVEU6IE5hbWluZyBjb252ZW50aW9uIGlzIGZvciBsZWdhY3kgY29kZSwgd291bGQgdXN1YWxseSBoYXZlIHBvaW50ZXIuZG93blxyXG4gICAqIFRPRE86IGltcHJvdmUgbmFtZSwgLnNldERvd24oIHZhbHVlICkgd2l0aCAuZG93biA9XHJcbiAgICovXHJcbiAgcHVibGljIHNldCBpc0Rvd24oIHZhbHVlOiBib29sZWFuICkge1xyXG4gICAgdGhpcy5pc0Rvd25Qcm9wZXJ0eS52YWx1ZSA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgcG9pbnRlciBpcyBkb3duL3ByZXNzZWQsIG9yIHVwLlxyXG4gICAqXHJcbiAgICogTk9URTogTmFtaW5nIGNvbnZlbnRpb24gaXMgZm9yIGxlZ2FjeSBjb2RlLCB3b3VsZCB1c3VhbGx5IGhhdmUgcG9pbnRlci5kb3duXHJcbiAgICogVE9ETzogaW1wcm92ZSBuYW1lLCAuaXNEb3duKCkgd2l0aCAuZG93blxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgaXNEb3duKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuaXNEb3duUHJvcGVydHkudmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJZiB0aGVyZSBpcyBhbiBhdHRhY2hlZCBsaXN0ZW5lciwgaW50ZXJydXB0IGl0LlxyXG4gICAqXHJcbiAgICogQWZ0ZXIgdGhpcyBleGVjdXRlcywgdGhpcyBwb2ludGVyIHNob3VsZCBub3QgYmUgYXR0YWNoZWQuXHJcbiAgICovXHJcbiAgcHVibGljIGludGVycnVwdEF0dGFjaGVkKCk6IHZvaWQge1xyXG4gICAgaWYgKCB0aGlzLmlzQXR0YWNoZWQoKSApIHtcclxuICAgICAgdGhpcy5fYXR0YWNoZWRMaXN0ZW5lciEuaW50ZXJydXB0KCk7IC8vIEFueSBsaXN0ZW5lciB0aGF0IHVzZXMgdGhlICdhdHRhY2gnIEFQSSBzaG91bGQgaGF2ZSBpbnRlcnJ1cHQoKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW50ZXJydXB0cyBhbGwgbGlzdGVuZXJzIG9uIHRoaXMgcG9pbnRlci5cclxuICAgKi9cclxuICBwdWJsaWMgaW50ZXJydXB0QWxsKCk6IHZvaWQge1xyXG4gICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzLnNsaWNlKCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGxpc3RlbmVyID0gbGlzdGVuZXJzWyBpIF07XHJcbiAgICAgIGxpc3RlbmVyLmludGVycnVwdCAmJiBsaXN0ZW5lci5pbnRlcnJ1cHQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hcmtzIHRoZSBwb2ludGVyIGFzIGF0dGFjaGVkIHRvIHRoaXMgbGlzdGVuZXIuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhdHRhY2goIGxpc3RlbmVyOiBUQXR0YWNoYWJsZUlucHV0TGlzdGVuZXIgKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUG9pbnRlciAmJiBzY2VuZXJ5TG9nLlBvaW50ZXIoIGBBdHRhY2hpbmcgdG8gJHt0aGlzLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlzQXR0YWNoZWQoKSwgJ0F0dGVtcHRlZCB0byBhdHRhY2ggdG8gYW4gYWxyZWFkeSBhdHRhY2hlZCBwb2ludGVyJyApO1xyXG5cclxuICAgIHRoaXMuYXR0YWNoZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICB0aGlzLl9hdHRhY2hlZExpc3RlbmVyID0gbGlzdGVuZXI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyAtIFdoZXRoZXIgdGhlIHBvaW50IGNoYW5nZWRcclxuICAgKi9cclxuICBwdWJsaWMgdXBkYXRlUG9pbnQoIHBvaW50OiBWZWN0b3IyLCBldmVudE5hbWUgPSAnZXZlbnQnICk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgcG9pbnRDaGFuZ2VkID0gdGhpcy5oYXNQb2ludENoYW5nZWQoIHBvaW50ICk7XHJcbiAgICBwb2ludCAmJiBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCAmJiBzY2VuZXJ5TG9nLklucHV0RXZlbnQoIGBwb2ludGVyICR7ZXZlbnROYW1lfSBhdCAke3BvaW50LnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIHRoaXMucG9pbnQgPSBwb2ludDtcclxuICAgIHJldHVybiBwb2ludENoYW5nZWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIGluZm9ybWF0aW9uIGluIHRoaXMgUG9pbnRlciBmb3IgYSBnaXZlbiBwb2ludGVyIGRvd24uIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgIEByZXR1cm5zIC0gV2hldGhlciB0aGUgcG9pbnQgY2hhbmdlZFxyXG4gICAqL1xyXG4gIHB1YmxpYyBkb3duKCBldmVudDogRXZlbnQgKTogdm9pZCB7XHJcbiAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIGluZm9ybWF0aW9uIGluIHRoaXMgUG9pbnRlciBmb3IgYSBnaXZlbiBwb2ludGVyIHVwLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIC0gV2hldGhlciB0aGUgcG9pbnQgY2hhbmdlZFxyXG4gICAqL1xyXG4gIHB1YmxpYyB1cCggcG9pbnQ6IFZlY3RvcjIsIGV2ZW50OiBFdmVudCApOiBib29sZWFuIHtcclxuXHJcbiAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgcmV0dXJuIHRoaXMudXBkYXRlUG9pbnQoIHBvaW50LCAndXAnICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIGluZm9ybWF0aW9uIGluIHRoaXMgUG9pbnRlciBmb3IgYSBnaXZlbiBwb2ludGVyIGNhbmNlbC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyAtIFdoZXRoZXIgdGhlIHBvaW50IGNoYW5nZWRcclxuICAgKi9cclxuICBwdWJsaWMgY2FuY2VsKCBwb2ludDogVmVjdG9yMiApOiBib29sZWFuIHtcclxuXHJcbiAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgIHJldHVybiB0aGlzLnVwZGF0ZVBvaW50KCBwb2ludCwgJ2NhbmNlbCcgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hcmtzIHRoZSBwb2ludGVyIGFzIGRldGFjaGVkIGZyb20gYSBwcmV2aW91c2x5IGF0dGFjaGVkIGxpc3RlbmVyLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZGV0YWNoKCBsaXN0ZW5lcjogVEF0dGFjaGFibGVJbnB1dExpc3RlbmVyICk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBvaW50ZXIgJiYgc2NlbmVyeUxvZy5Qb2ludGVyKCBgRGV0YWNoaW5nIGZyb20gJHt0aGlzLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNBdHRhY2hlZCgpLCAnQ2Fubm90IGRldGFjaCBhIGxpc3RlbmVyIGlmIG9uZSBpcyBub3QgYXR0YWNoZWQnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9hdHRhY2hlZExpc3RlbmVyID09PSBsaXN0ZW5lciwgJ0Nhbm5vdCBkZXRhY2ggYSBkaWZmZXJlbnQgbGlzdGVuZXInICk7XHJcblxyXG4gICAgdGhpcy5hdHRhY2hlZFByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICB0aGlzLl9hdHRhY2hlZExpc3RlbmVyID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciB0aGUgcG9pbnQgb2YgdGhlIHBvaW50ZXIgaGFzIGNoYW5nZWQgKHVzZWQgaW4gbW91c2UvdG91Y2gvcGVuKS5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgaGFzUG9pbnRDaGFuZ2VkKCBwb2ludDogVmVjdG9yMiApOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLnBvaW50ICE9PSBwb2ludCAmJiAoICFwb2ludCB8fCAhdGhpcy5wb2ludCB8fCAhdGhpcy5wb2ludC5lcXVhbHMoIHBvaW50ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYW4gSW50ZW50IFBvaW50ZXIuIEJ5IHNldHRpbmcgSW50ZW50LCBvdGhlciBsaXN0ZW5lcnMgaW4gdGhlIGRpc3BhdGNoIHBoYXNlIGNhbiByZWFjdCBhY2NvcmRpbmdseS5cclxuICAgKiBOb3RlIHRoYXQgdGhlIEludGVudCBjYW4gYmUgY2hhbmdlZCBieSBsaXN0ZW5lcnMgdXAgdGhlIGRpc3BhdGNoIHBoYXNlIG9yIG9uIHRoZSBuZXh0IHByZXNzLiBTZWUgSW50ZW50IGVudW1cclxuICAgKiBmb3IgdmFsaWQgZW50cmllcy5cclxuICAgKi9cclxuICBwdWJsaWMgYWRkSW50ZW50KCBpbnRlbnQ6IEludGVudCApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIEludGVudC5lbnVtZXJhdGlvbi5pbmNsdWRlcyggaW50ZW50ICksICd0cnlpbmcgdG8gc2V0IHVuc3VwcG9ydGVkIGludGVudCBmb3IgUG9pbnRlcicgKTtcclxuXHJcbiAgICBpZiAoICF0aGlzLl9pbnRlbnRzLmluY2x1ZGVzKCBpbnRlbnQgKSApIHtcclxuICAgICAgdGhpcy5faW50ZW50cy5wdXNoKCBpbnRlbnQgKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9pbnRlbnRzLmxlbmd0aCA8PSBJbnRlbnQuZW51bWVyYXRpb24udmFsdWVzLmxlbmd0aCwgJ3RvIG1hbnkgSW50ZW50cyBzYXZlZCwgbWVtb3J5IGxlYWsgbGlrZWx5JyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGFuIEludGVudCBmcm9tIHRoZSBQb2ludGVyLiBTZWUgYWRkSW50ZW50IGZvciBtb3JlIGluZm9ybWF0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVJbnRlbnQoIGludGVudDogSW50ZW50ICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggSW50ZW50LmVudW1lcmF0aW9uLmluY2x1ZGVzKCBpbnRlbnQgKSwgJ3RyeWluZyB0byBzZXQgdW5zdXBwb3J0ZWQgaW50ZW50IGZvciBQb2ludGVyJyApO1xyXG5cclxuICAgIGlmICggdGhpcy5faW50ZW50cy5pbmNsdWRlcyggaW50ZW50ICkgKSB7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5faW50ZW50cy5pbmRleE9mKCBpbnRlbnQgKTtcclxuICAgICAgdGhpcy5faW50ZW50cy5zcGxpY2UoIGluZGV4LCAxICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoaXMgUG9pbnRlciBoYXMgYmVlbiBhc3NpZ25lZCB0aGUgcHJvdmlkZWQgSW50ZW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBoYXNJbnRlbnQoIGludGVudDogSW50ZW50ICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2ludGVudHMuaW5jbHVkZXMoIGludGVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBpbnRlbnQgb2YgdGhpcyBQb2ludGVyIHRvIGluZGljYXRlIHRoYXQgaXQgd2lsbCBiZSB1c2VkIGZvciBtb3VzZS90b3VjaCBzdHlsZSBkcmFnZ2luZywgaW5kaWNhdGluZyB0b1xyXG4gICAqIG90aGVyIGxpc3RlbmVycyBpbiB0aGUgZGlzcGF0Y2ggcGhhc2UgdGhhdCBiZWhhdmlvciBtYXkgbmVlZCB0byBjaGFuZ2UuIEFkZHMgYSBsaXN0ZW5lciB0byB0aGUgcG9pbnRlciAod2l0aFxyXG4gICAqIHNlbGYgcmVtb3ZhbCkgdGhhdCBjbGVhcnMgdGhlIGludGVudCB3aGVuIHRoZSBwb2ludGVyIHJlY2VpdmVzIGFuIFwidXBcIiBldmVudC4gU2hvdWxkIGdlbmVyYWxseSBiZSBjYWxsZWQgb25cclxuICAgKiB0aGUgUG9pbnRlciBpbiByZXNwb25zZSB0byBhIGRvd24gZXZlbnQuXHJcbiAgICovXHJcbiAgcHVibGljIHJlc2VydmVGb3JEcmFnKCk6IHZvaWQge1xyXG5cclxuICAgIC8vIGlmIHRoZSBQb2ludGVyIGhhc24ndCBhbHJlYWR5IGJlZW4gcmVzZXJ2ZWQgZm9yIGRyYWcgaW4gSW5wdXQgZXZlbnQgZGlzcGF0Y2gsIGluIHdoaWNoXHJcbiAgICAvLyBjYXNlIGl0IGFscmVhZHkgaGFzIEludGVudCBhbmQgbGlzdGVuZXIgdG8gcmVtb3ZlIEludGVudFxyXG4gICAgaWYgKCAhdGhpcy5faW50ZW50cy5pbmNsdWRlcyggSW50ZW50LkRSQUcgKSApIHtcclxuICAgICAgdGhpcy5hZGRJbnRlbnQoIEludGVudC5EUkFHICk7XHJcblxyXG4gICAgICBjb25zdCBsaXN0ZW5lciA9IHtcclxuICAgICAgICB1cDogKCBldmVudDogU2NlbmVyeUV2ZW50PFRvdWNoRXZlbnQgfCBNb3VzZUV2ZW50IHwgUG9pbnRlckV2ZW50PiApID0+IHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlSW50ZW50KCBJbnRlbnQuRFJBRyApO1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9saXN0ZW5lckZvckRyYWdSZXNlcnZlISApO1xyXG4gICAgICAgICAgdGhpcy5fbGlzdGVuZXJGb3JEcmFnUmVzZXJ2ZSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fbGlzdGVuZXJGb3JEcmFnUmVzZXJ2ZSA9PT0gbnVsbCwgJ3N0aWxsIGEgbGlzdGVuZXIgdG8gcmVzZXJ2ZSBwb2ludGVyLCBtZW1vcnkgbGVhayBsaWtlbHknICk7XHJcbiAgICAgIHRoaXMuX2xpc3RlbmVyRm9yRHJhZ1Jlc2VydmUgPSBsaXN0ZW5lcjtcclxuICAgICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLl9saXN0ZW5lckZvckRyYWdSZXNlcnZlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGludGVudCBvZiB0aGlzIFBvaW50ZXIgdG8gaW5kaWNhdGUgdGhhdCBpdCB3aWxsIGJlIHVzZWQgZm9yIGtleWJvYXJkIHN0eWxlIGRyYWdnaW5nLCBpbmRpY2F0aW5nIHRvXHJcbiAgICogb3RoZXIgbGlzdGVuZXJzIGluIHRoZSBkaXNwYXRjaCB0aGF0IGJlaGF2aW9yIG1heSBuZWVkIHRvIGNoYW5nZS4gQWRkcyBhIGxpc3RlbmVyIHRvIHRoZSBwb2ludGVyICh3aXRoIHNlbGZcclxuICAgKiByZW1vdmFsKSB0aGF0IGNsZWFycyB0aGUgaW50ZW50IHdoZW4gdGhlIHBvaW50ZXIgcmVjZWl2ZXMgYSBcImtleXVwXCIgb3IgXCJibHVyXCIgZXZlbnQuIFNob3VsZCBnZW5lcmFsbHkgYmUgY2FsbGVkXHJcbiAgICogb24gdGhlIFBvaW50ZXIgaW4gcmVzcG9uc2UgdG8gYSBrZXlkb3duIGV2ZW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZXNlcnZlRm9yS2V5Ym9hcmREcmFnKCk6IHZvaWQge1xyXG5cclxuICAgIGlmICggIXRoaXMuX2ludGVudHMuaW5jbHVkZXMoIEludGVudC5LRVlCT0FSRF9EUkFHICkgKSB7XHJcbiAgICAgIHRoaXMuYWRkSW50ZW50KCBJbnRlbnQuS0VZQk9BUkRfRFJBRyApO1xyXG5cclxuICAgICAgY29uc3QgbGlzdGVuZXIgPSB7XHJcbiAgICAgICAga2V5dXA6ICggZXZlbnQ6IFNjZW5lcnlFdmVudDxLZXlib2FyZEV2ZW50PiApID0+IGNsZWFySW50ZW50KCksXHJcblxyXG4gICAgICAgIC8vIGNsZWFyIG9uIGJsdXIgYXMgd2VsbCBzaW5jZSBmb2N1cyBtYXkgYmUgbG9zdCBiZWZvcmUgd2UgcmVjZWl2ZSBhIGtleXVwIGV2ZW50XHJcbiAgICAgICAgYmx1cjogKCBldmVudDogU2NlbmVyeUV2ZW50PEZvY3VzRXZlbnQ+ICkgPT4gY2xlYXJJbnRlbnQoKVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgY29uc3QgY2xlYXJJbnRlbnQgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVJbnRlbnQoIEludGVudC5LRVlCT0FSRF9EUkFHICk7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9saXN0ZW5lckZvcktleWJvYXJkRHJhZ1Jlc2VydmUhICk7XHJcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJGb3JLZXlib2FyZERyYWdSZXNlcnZlID0gbnVsbDtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2xpc3RlbmVyRm9yRHJhZ1Jlc2VydmUgPT09IG51bGwsICdzdGlsbCBhIGxpc3RlbmVyIG9uIFBvaW50ZXIgZm9yIHJlc2VydmUsIG1lbW9yeSBsZWFrIGxpa2VseScgKTtcclxuICAgICAgdGhpcy5fbGlzdGVuZXJGb3JLZXlib2FyZERyYWdSZXNlcnZlID0gbGlzdGVuZXI7XHJcbiAgICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5fbGlzdGVuZXJGb3JLZXlib2FyZERyYWdSZXNlcnZlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGlzIGlzIGNhbGxlZCB3aGVuIGEgY2FwdHVyZSBzdGFydHMgb24gdGhpcyBwb2ludGVyLiBXZSByZXF1ZXN0IGl0IG9uIHBvaW50ZXJzdGFydCwgYW5kIGlmIHJlY2VpdmVkLCB3ZSBzaG91bGRcclxuICAgKiBnZW5lcmFsbHkgcmVjZWl2ZSBldmVudHMgb3V0c2lkZSB0aGUgd2luZG93LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvbkdvdFBvaW50ZXJDYXB0dXJlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5fcG9pbnRlckNhcHR1cmVkID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoaXMgaXMgY2FsbGVkIHdoZW4gYSBjYXB0dXJlIGVuZHMgb24gdGhpcyBwb2ludGVyLiBUaGlzIGhhcHBlbnMgbm9ybWFsbHkgd2hlbiB0aGUgdXNlciByZWxlYXNlcyB0aGUgcG9pbnRlciBhYm92ZVxyXG4gICAqIHRoZSBzaW0gb3Igb3V0c2lkZSwgYnV0IGFsc28gaW4gY2FzZXMgd2hlcmUgd2UgaGF2ZSBOT1QgcmVjZWl2ZWQgYW4gdXAvZW5kLlxyXG4gICAqXHJcbiAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMTg2IGZvciBtb3JlIGluZm9ybWF0aW9uLiBXZSdsbCB3YW50IHRvIGludGVycnVwdCB0aGUgcG9pbnRlclxyXG4gICAqIG9uIHRoaXMgY2FzZSByZWdhcmRsZXNzLFxyXG4gICAqL1xyXG4gIHB1YmxpYyBvbkxvc3RQb2ludGVyQ2FwdHVyZSgpOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy5fcG9pbnRlckNhcHR1cmVkICkge1xyXG4gICAgICB0aGlzLmludGVycnVwdEFsbCgpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fcG9pbnRlckNhcHR1cmVkID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzIHNvIGl0IGNhbiBiZSBnYXJiYWdlIGNvbGxlY3RlZC5cclxuICAgKi9cclxuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5Qb2ludGVyICYmIHNjZW5lcnlMb2cuUG9pbnRlciggYERpc3Bvc2luZyAke3RoaXMudG9TdHJpbmcoKX1gICk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGxpc3RlbmVycyB0aGF0IHdvdWxkIGNsZWFyIGludGVudCBvbiBkaXNwb3NhbFxyXG4gICAgaWYgKCB0aGlzLl9saXN0ZW5lckZvckRyYWdSZXNlcnZlICYmIHRoaXMuX2xpc3RlbmVycy5pbmNsdWRlcyggdGhpcy5fbGlzdGVuZXJGb3JEcmFnUmVzZXJ2ZSApICkge1xyXG4gICAgICB0aGlzLnJlbW92ZUlucHV0TGlzdGVuZXIoIHRoaXMuX2xpc3RlbmVyRm9yRHJhZ1Jlc2VydmUgKTtcclxuICAgIH1cclxuICAgIGlmICggdGhpcy5fbGlzdGVuZXJGb3JLZXlib2FyZERyYWdSZXNlcnZlICYmIHRoaXMuX2xpc3RlbmVycy5pbmNsdWRlcyggdGhpcy5fbGlzdGVuZXJGb3JLZXlib2FyZERyYWdSZXNlcnZlICkgKSB7XHJcbiAgICAgIHRoaXMucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5fbGlzdGVuZXJGb3JLZXlib2FyZERyYWdSZXNlcnZlICk7XHJcbiAgICB9XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fYXR0YWNoZWRMaXN0ZW5lciA9PT0gbnVsbCwgJ0F0dGFjaGVkIGxpc3RlbmVycyBzaG91bGQgYmUgY2xlYXJlZCBiZWZvcmUgcG9pbnRlciBkaXNwb3NhbCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2xpc3RlbmVycy5sZW5ndGggPT09IDAsICdTaG91bGQgbm90IGhhdmUgbGlzdGVuZXJzIHdoZW4gYSBwb2ludGVyIGlzIGRpc3Bvc2VkJyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYFBvaW50ZXIjJHt0aGlzLnR5cGV9X2F0XyR7dGhpcy5wb2ludH1gO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ1BvaW50ZXInLCBQb2ludGVyICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSxxQ0FBcUM7QUFFakUsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxXQUFXLE1BQU0sc0NBQXNDO0FBQzlELE9BQU9DLGdCQUFnQixNQUFNLDJDQUEyQztBQUN4RSxPQUFPQyxNQUFNLE1BQU0sb0NBQW9DO0FBQ3ZELE9BQU9DLFFBQVEsTUFBTSxzQ0FBc0M7QUFFM0QsU0FBdUJDLE9BQU8sUUFBNkMsZUFBZTtBQUUxRixPQUFPLE1BQU1DLE1BQU0sU0FBU0osZ0JBQWdCLENBQUM7RUFDM0M7RUFDQSxPQUF1QkssSUFBSSxHQUFHLElBQUlELE1BQU0sQ0FBQyxDQUFDOztFQUUxQztFQUNBLE9BQXVCRSxhQUFhLEdBQUcsSUFBSUYsTUFBTSxDQUFDLENBQUM7RUFFbkQsT0FBdUJHLFdBQVcsR0FBRyxJQUFJUixXQUFXLENBQUVLLE1BQU0sRUFBRTtJQUM1REksbUJBQW1C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