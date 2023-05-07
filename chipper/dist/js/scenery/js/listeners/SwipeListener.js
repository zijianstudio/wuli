// Copyright 2020-2023, University of Colorado Boulder

/**
 * A prototype listener for accessibility purposes. Intended to be added to the display
 * with the following behavior when the user interacts anywhere on the screen, unless
 * the pointer is already attached.
 *
 * - Swipe right, focus next
 * - Swipe left, focus previous
 * - Double tap, activate focusable item (sending click event)
 * - Press and hold, initiate drag of focused item (forwarding press to item)
 *
 * We hope that the above input strategies will allow BVI users to interact with the sim
 * without the use of a screen reader, but in combination with the voicing feature set.
 *
 * PROTOTYPE. DO NOT USE IN PRODUCTION CODE.
 *
 * @author Jesse Greenberg
 */

import stepTimer from '../../../axon/js/stepTimer.js';
import { FocusManager, Intent, PDOMUtils, scenery } from '../imports.js';

// constants
// in seconds, amount of time to initiate a press and hold gesture - note, it must be at least this long
// or else vibrations won't start from a press and hold gesture because the default press and hold
// vibration from safari interferes, see https://github.com/phetsims/gravity-force-lab-basics/issues/260
const PRESS_AND_HOLD_INTERVAL = 0.75;
const DOUBLE_TAP_INTERVAL = 0.6; // in seconds, max time between down events that would indicate a click gesture

class SwipeListener {
  /**
   * @param {Input} input
   */
  constructor(input) {
    // @private - reference to the pointer taken on down, to watch for the user gesture
    this._pointer = null;

    // @private the position (in global coordinate frame) of the point on initial down
    this.downPoint = null;

    // @private - reference to the down event initially so we can pass it to swipeStart
    // if the pointer remains down for long enough
    this.downEvent = null;

    // @public - is the input listener enabled?
    this.enabled = false;

    // @private {Vector2} - point of the last Pointer on down
    this.lastPoint = null;
    this.currentPoint = null;
    this.velocity = null;
    this.swipeDistance = null;
    this.firstUp = false;
    this.timeSinceLastDown = 0;

    // @private - list of all pointers that are currently down for this listener - if there are more than one
    // we will allow responding to zoom gestures, but if there is only one pointer we will prevent pan
    // gestures because we are taking over for swipe gestures instead
    this.downPointers = [];

    // amount of time in seconds that a finger has been down on the screen - when this
    // time becomes larger than the interval we forward a drag listener to the
    // display target
    this.holdingTime = 0;

    // @private - a reference to the focused Node so that we can call swipe functions
    // implemented on the Node when a swipe to drag gesture has been initiated
    this.focusedNode = null;

    // @private - listener that gets attached to the Pointer right as it is added to Input,
    // to prevent any other input handling or dispatching
    this.handleEventListener = {
      down: event => {
        // do not allow any other input handling, this listener assumes control
        event.handle();
        event.abort();

        // start the event handling, down will add Pointer listeners to respond to swipes
        // and other gestures
        this.handleDown(event);
      }
    };
    input.pointerAddedEmitter.addListener(pointer => {
      if (this.enabled) {
        pointer.addInputListener(this.handleEventListener, true);
      }
    });

    // @private - listener added to the pointer with attachment to call swipe functions
    // on a particular node with focus
    this._attachedPointerListener = {
      up: event => {
        this.focusedNode && this.focusedNode.swipeEnd && this.focusedNode.swipeEnd.bind(this.focusedNode)(event, this);

        // remove this listener, call the focusedNode's swipeEnd function
        this.focusedNode = null;
        this._pointer.removeInputListener(this._attachedPointerListener);
        this._pointer = null;
      },
      move: event => {
        // call the focusedNode's swipeDrag function
        this.focusedNode && this.focusedNode.swipeMove && this.focusedNode.swipeMove.bind(this.focusedNode)(event, this);
      },
      interrupt: event => {
        this.focusedNode = null;
        this._pointer.removeInputListener(this._attachedPointerListener);
        this._pointer = null;
      },
      cancel: event => {
        this.focusedNode = null;
        this._pointer.removeInputListener(this._attachedPointerListener);
        this._pointer = null;
      }
    };

    // @private - added to Pointer on down without attaching so that if the event does result
    // in attachment elsewhere, this listener can be interrupted
    this._pointerListener = {
      up: event => {
        // on all releases, clear references and timers
        this.endSwipe();
        this._pointer = null;
        this.swipeDistance = event.pointer.point.minus(this.downPoint);
        const verticalDistance = this.swipeDistance.y;
        const horizontalDistance = this.swipeDistance.x;
        if (Math.abs(horizontalDistance) > 100 && Math.abs(verticalDistance) < 100) {
          // some sort of horizontal swipe
          if (horizontalDistance > 0) {
            // for upcoming interviews, lets limit the focus to be within the simulation,
            // don't allow it to go into the (uninstrumented) navigation bar
            if (FocusManager.pdomFocusedNode && FocusManager.pdomFocusedNode.innerContent === 'Reset All') {
              return;
            }
            PDOMUtils.getNextFocusable(document.body).focus();
          } else {
            PDOMUtils.getPreviousFocusable(document.body).focus();
          }
        } else {
          // potentially a double tap
          if (this.firstUp) {
            if (this.timeSinceLastDown < DOUBLE_TAP_INTERVAL) {
              this.firstUp = false;
              this.timeSinceLastDown = 0;

              // send a click event to the active element
              const pdomRoot = document.getElementsByClassName('a11y-pdom-root')[0];
              if (pdomRoot && pdomRoot.contains(event.activeElement)) {
                event.activeElement.click();
              }
            }
          } else {
            this.firstUp = true;
          }
        }
      },
      move: event => {
        this.lastPoint = this.currentPoint;
        this.currentPoint = event.pointer.point;
      },
      interrupt: () => {
        this.interrupt();
      },
      cancel: () => {
        this.interrupt();
      }
    };
    stepTimer.addListener(this.step.bind(this));
  }

  /**
   * @public (scenery-internal)
   * @param event
   */
  handleDown(event) {
    event.pointer.addIntent(Intent.DRAG);
    this.downPointers.push(event.pointer);

    // allow zoom gestures if there is more than one pointer down
    if (this.downPointers.length > 1) {
      this.downPointers.forEach(downPointer => downPointer.removeIntent(Intent.DRAG));
      event.pointer.removeIntent(Intent.DRAG);
    }
    assert && assert(event.pointer.attachedProperty.get(), 'should be attached to the handle listener');
    event.pointer.removeInputListener(this.handleEventListener);
    if (this._pointer === null && event.pointer.type === 'touch') {
      // don't add new listeners if we weren't able to successfully detach and interrupt
      // the previous listener
      this._pointer = event.pointer;
      event.pointer.addInputListener(this._pointerListener, true);

      // this takes priority, no other listeners should fire
      event.abort();

      // keep a reference to the event on down so we can use it in the swipeStart
      // callback if the pointer remains down for long enough
      this.downEvent = event;
      this.downPoint = event.pointer.point;
      this.currentPoint = this.downPoint.copy();
      this.previousPoint = this.currentPoint.copy();
    }
  }

  /**
   * @public
   * @param event
   */
  up(event) {
    const index = this.downPointers.indexOf(event.pointer);
    if (index > -1) {
      this.downPointers.splice(index, 1);
    }
  }

  /**
   * Step the listener, updating timers used to determine swipe speeds and
   * double tap gestures.
   * @param dt
   * @private
   */
  step(dt) {
    // detecting a double-tap
    if (this.firstUp) {
      this.timeSinceLastDown += dt;

      // too long for gesture, wait till next attempt
      if (this.timeSinceLastDown > DOUBLE_TAP_INTERVAL) {
        this.firstUp = false;
        this.timeSinceLastDown = 0;
      }
    }

    // detecting a press and hold
    if (this._pointer) {
      if (!this._pointer.listeners.includes(this._attachedPointerListener)) {
        if (this.holdingTime > PRESS_AND_HOLD_INTERVAL) {
          // user has pressed down for long enough to forward a drag event to the
          // focused node
          const focusedNode = FocusManager.pdomFocusedNode;
          if (focusedNode) {
            // remove the listener looking for gestures
            this._pointer.removeInputListener(this._pointerListener);
            this.holdingTime = 0;
            this.focusedNode = focusedNode;
            this._pointer.addInputListener(this._attachedPointerListener, true);
            this.focusedNode.swipeStart && this.focusedNode.swipeStart(this.downEvent, this);
            this.downEvent = null;
          }
        } else {
          this.holdingTime += dt;
        }
      }
    }

    // determining swipe velocity
    if (this.lastPoint !== null && this.currentPoint !== null) {
      this.velocity = this.lastPoint.minus(this.currentPoint).dividedScalar(dt);
    }
  }

  /**
   * Ends a swipe gesture, removing listeners and clearing references.
   * @private
   */
  endSwipe() {
    this.holdingTime = 0;

    // remove if we haven't been interrupted already
    if (this._pointer && this._pointer.listeners.includes(this._pointerListener)) {
      this._pointer.removeInputListener(this._pointerListener);
    }
  }

  /**
   * Detach the Pointer listener that is observing movement after a press-and-hold gesture.
   * This allows you to forward the down event to another listener if you don't want to
   * re-implement an interaction with swipeMove. This does not remove the listener from the Pointer,
   * just detaches it so that another listener can be attached.
   * @public
   */
  detachPointerListener() {
    this._pointer.detach(this._attachedPointerListener);
  }

  /**
   * Interrupt this listener.
   * @public
   */
  interrupt() {
    this.endSwipe();
    this._pointer = null;
    this.downEvent = null;
  }
}
scenery.register('SwipeListener', SwipeListener);
export default SwipeListener;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzdGVwVGltZXIiLCJGb2N1c01hbmFnZXIiLCJJbnRlbnQiLCJQRE9NVXRpbHMiLCJzY2VuZXJ5IiwiUFJFU1NfQU5EX0hPTERfSU5URVJWQUwiLCJET1VCTEVfVEFQX0lOVEVSVkFMIiwiU3dpcGVMaXN0ZW5lciIsImNvbnN0cnVjdG9yIiwiaW5wdXQiLCJfcG9pbnRlciIsImRvd25Qb2ludCIsImRvd25FdmVudCIsImVuYWJsZWQiLCJsYXN0UG9pbnQiLCJjdXJyZW50UG9pbnQiLCJ2ZWxvY2l0eSIsInN3aXBlRGlzdGFuY2UiLCJmaXJzdFVwIiwidGltZVNpbmNlTGFzdERvd24iLCJkb3duUG9pbnRlcnMiLCJob2xkaW5nVGltZSIsImZvY3VzZWROb2RlIiwiaGFuZGxlRXZlbnRMaXN0ZW5lciIsImRvd24iLCJldmVudCIsImhhbmRsZSIsImFib3J0IiwiaGFuZGxlRG93biIsInBvaW50ZXJBZGRlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInBvaW50ZXIiLCJhZGRJbnB1dExpc3RlbmVyIiwiX2F0dGFjaGVkUG9pbnRlckxpc3RlbmVyIiwidXAiLCJzd2lwZUVuZCIsImJpbmQiLCJyZW1vdmVJbnB1dExpc3RlbmVyIiwibW92ZSIsInN3aXBlTW92ZSIsImludGVycnVwdCIsImNhbmNlbCIsIl9wb2ludGVyTGlzdGVuZXIiLCJlbmRTd2lwZSIsInBvaW50IiwibWludXMiLCJ2ZXJ0aWNhbERpc3RhbmNlIiwieSIsImhvcml6b250YWxEaXN0YW5jZSIsIngiLCJNYXRoIiwiYWJzIiwicGRvbUZvY3VzZWROb2RlIiwiaW5uZXJDb250ZW50IiwiZ2V0TmV4dEZvY3VzYWJsZSIsImRvY3VtZW50IiwiYm9keSIsImZvY3VzIiwiZ2V0UHJldmlvdXNGb2N1c2FibGUiLCJwZG9tUm9vdCIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJjb250YWlucyIsImFjdGl2ZUVsZW1lbnQiLCJjbGljayIsInN0ZXAiLCJhZGRJbnRlbnQiLCJEUkFHIiwicHVzaCIsImxlbmd0aCIsImZvckVhY2giLCJkb3duUG9pbnRlciIsInJlbW92ZUludGVudCIsImFzc2VydCIsImF0dGFjaGVkUHJvcGVydHkiLCJnZXQiLCJ0eXBlIiwiY29weSIsInByZXZpb3VzUG9pbnQiLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJkdCIsImxpc3RlbmVycyIsImluY2x1ZGVzIiwic3dpcGVTdGFydCIsImRpdmlkZWRTY2FsYXIiLCJkZXRhY2hQb2ludGVyTGlzdGVuZXIiLCJkZXRhY2giLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN3aXBlTGlzdGVuZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBwcm90b3R5cGUgbGlzdGVuZXIgZm9yIGFjY2Vzc2liaWxpdHkgcHVycG9zZXMuIEludGVuZGVkIHRvIGJlIGFkZGVkIHRvIHRoZSBkaXNwbGF5XHJcbiAqIHdpdGggdGhlIGZvbGxvd2luZyBiZWhhdmlvciB3aGVuIHRoZSB1c2VyIGludGVyYWN0cyBhbnl3aGVyZSBvbiB0aGUgc2NyZWVuLCB1bmxlc3NcclxuICogdGhlIHBvaW50ZXIgaXMgYWxyZWFkeSBhdHRhY2hlZC5cclxuICpcclxuICogLSBTd2lwZSByaWdodCwgZm9jdXMgbmV4dFxyXG4gKiAtIFN3aXBlIGxlZnQsIGZvY3VzIHByZXZpb3VzXHJcbiAqIC0gRG91YmxlIHRhcCwgYWN0aXZhdGUgZm9jdXNhYmxlIGl0ZW0gKHNlbmRpbmcgY2xpY2sgZXZlbnQpXHJcbiAqIC0gUHJlc3MgYW5kIGhvbGQsIGluaXRpYXRlIGRyYWcgb2YgZm9jdXNlZCBpdGVtIChmb3J3YXJkaW5nIHByZXNzIHRvIGl0ZW0pXHJcbiAqXHJcbiAqIFdlIGhvcGUgdGhhdCB0aGUgYWJvdmUgaW5wdXQgc3RyYXRlZ2llcyB3aWxsIGFsbG93IEJWSSB1c2VycyB0byBpbnRlcmFjdCB3aXRoIHRoZSBzaW1cclxuICogd2l0aG91dCB0aGUgdXNlIG9mIGEgc2NyZWVuIHJlYWRlciwgYnV0IGluIGNvbWJpbmF0aW9uIHdpdGggdGhlIHZvaWNpbmcgZmVhdHVyZSBzZXQuXHJcbiAqXHJcbiAqIFBST1RPVFlQRS4gRE8gTk9UIFVTRSBJTiBQUk9EVUNUSU9OIENPREUuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XHJcbmltcG9ydCB7IEZvY3VzTWFuYWdlciwgSW50ZW50LCBQRE9NVXRpbHMsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG4vLyBpbiBzZWNvbmRzLCBhbW91bnQgb2YgdGltZSB0byBpbml0aWF0ZSBhIHByZXNzIGFuZCBob2xkIGdlc3R1cmUgLSBub3RlLCBpdCBtdXN0IGJlIGF0IGxlYXN0IHRoaXMgbG9uZ1xyXG4vLyBvciBlbHNlIHZpYnJhdGlvbnMgd29uJ3Qgc3RhcnQgZnJvbSBhIHByZXNzIGFuZCBob2xkIGdlc3R1cmUgYmVjYXVzZSB0aGUgZGVmYXVsdCBwcmVzcyBhbmQgaG9sZFxyXG4vLyB2aWJyYXRpb24gZnJvbSBzYWZhcmkgaW50ZXJmZXJlcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9ncmF2aXR5LWZvcmNlLWxhYi1iYXNpY3MvaXNzdWVzLzI2MFxyXG5jb25zdCBQUkVTU19BTkRfSE9MRF9JTlRFUlZBTCA9IDAuNzU7XHJcbmNvbnN0IERPVUJMRV9UQVBfSU5URVJWQUwgPSAwLjY7IC8vIGluIHNlY29uZHMsIG1heCB0aW1lIGJldHdlZW4gZG93biBldmVudHMgdGhhdCB3b3VsZCBpbmRpY2F0ZSBhIGNsaWNrIGdlc3R1cmVcclxuXHJcbmNsYXNzIFN3aXBlTGlzdGVuZXIge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0lucHV0fSBpbnB1dFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBpbnB1dCApIHtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHJlZmVyZW5jZSB0byB0aGUgcG9pbnRlciB0YWtlbiBvbiBkb3duLCB0byB3YXRjaCBmb3IgdGhlIHVzZXIgZ2VzdHVyZVxyXG4gICAgdGhpcy5fcG9pbnRlciA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgdGhlIHBvc2l0aW9uIChpbiBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZSkgb2YgdGhlIHBvaW50IG9uIGluaXRpYWwgZG93blxyXG4gICAgdGhpcy5kb3duUG9pbnQgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gcmVmZXJlbmNlIHRvIHRoZSBkb3duIGV2ZW50IGluaXRpYWxseSBzbyB3ZSBjYW4gcGFzcyBpdCB0byBzd2lwZVN0YXJ0XHJcbiAgICAvLyBpZiB0aGUgcG9pbnRlciByZW1haW5zIGRvd24gZm9yIGxvbmcgZW5vdWdoXHJcbiAgICB0aGlzLmRvd25FdmVudCA9IG51bGw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIGlzIHRoZSBpbnB1dCBsaXN0ZW5lciBlbmFibGVkP1xyXG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1ZlY3RvcjJ9IC0gcG9pbnQgb2YgdGhlIGxhc3QgUG9pbnRlciBvbiBkb3duXHJcbiAgICB0aGlzLmxhc3RQb2ludCA9IG51bGw7XHJcbiAgICB0aGlzLmN1cnJlbnRQb2ludCA9IG51bGw7XHJcbiAgICB0aGlzLnZlbG9jaXR5ID0gbnVsbDtcclxuICAgIHRoaXMuc3dpcGVEaXN0YW5jZSA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5maXJzdFVwID0gZmFsc2U7XHJcbiAgICB0aGlzLnRpbWVTaW5jZUxhc3REb3duID0gMDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIGxpc3Qgb2YgYWxsIHBvaW50ZXJzIHRoYXQgYXJlIGN1cnJlbnRseSBkb3duIGZvciB0aGlzIGxpc3RlbmVyIC0gaWYgdGhlcmUgYXJlIG1vcmUgdGhhbiBvbmVcclxuICAgIC8vIHdlIHdpbGwgYWxsb3cgcmVzcG9uZGluZyB0byB6b29tIGdlc3R1cmVzLCBidXQgaWYgdGhlcmUgaXMgb25seSBvbmUgcG9pbnRlciB3ZSB3aWxsIHByZXZlbnQgcGFuXHJcbiAgICAvLyBnZXN0dXJlcyBiZWNhdXNlIHdlIGFyZSB0YWtpbmcgb3ZlciBmb3Igc3dpcGUgZ2VzdHVyZXMgaW5zdGVhZFxyXG4gICAgdGhpcy5kb3duUG9pbnRlcnMgPSBbXTtcclxuXHJcbiAgICAvLyBhbW91bnQgb2YgdGltZSBpbiBzZWNvbmRzIHRoYXQgYSBmaW5nZXIgaGFzIGJlZW4gZG93biBvbiB0aGUgc2NyZWVuIC0gd2hlbiB0aGlzXHJcbiAgICAvLyB0aW1lIGJlY29tZXMgbGFyZ2VyIHRoYW4gdGhlIGludGVydmFsIHdlIGZvcndhcmQgYSBkcmFnIGxpc3RlbmVyIHRvIHRoZVxyXG4gICAgLy8gZGlzcGxheSB0YXJnZXRcclxuICAgIHRoaXMuaG9sZGluZ1RpbWUgPSAwO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gYSByZWZlcmVuY2UgdG8gdGhlIGZvY3VzZWQgTm9kZSBzbyB0aGF0IHdlIGNhbiBjYWxsIHN3aXBlIGZ1bmN0aW9uc1xyXG4gICAgLy8gaW1wbGVtZW50ZWQgb24gdGhlIE5vZGUgd2hlbiBhIHN3aXBlIHRvIGRyYWcgZ2VzdHVyZSBoYXMgYmVlbiBpbml0aWF0ZWRcclxuICAgIHRoaXMuZm9jdXNlZE5vZGUgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gbGlzdGVuZXIgdGhhdCBnZXRzIGF0dGFjaGVkIHRvIHRoZSBQb2ludGVyIHJpZ2h0IGFzIGl0IGlzIGFkZGVkIHRvIElucHV0LFxyXG4gICAgLy8gdG8gcHJldmVudCBhbnkgb3RoZXIgaW5wdXQgaGFuZGxpbmcgb3IgZGlzcGF0Y2hpbmdcclxuICAgIHRoaXMuaGFuZGxlRXZlbnRMaXN0ZW5lciA9IHtcclxuICAgICAgZG93bjogZXZlbnQgPT4ge1xyXG5cclxuICAgICAgICAvLyBkbyBub3QgYWxsb3cgYW55IG90aGVyIGlucHV0IGhhbmRsaW5nLCB0aGlzIGxpc3RlbmVyIGFzc3VtZXMgY29udHJvbFxyXG4gICAgICAgIGV2ZW50LmhhbmRsZSgpO1xyXG4gICAgICAgIGV2ZW50LmFib3J0KCk7XHJcblxyXG4gICAgICAgIC8vIHN0YXJ0IHRoZSBldmVudCBoYW5kbGluZywgZG93biB3aWxsIGFkZCBQb2ludGVyIGxpc3RlbmVycyB0byByZXNwb25kIHRvIHN3aXBlc1xyXG4gICAgICAgIC8vIGFuZCBvdGhlciBnZXN0dXJlc1xyXG4gICAgICAgIHRoaXMuaGFuZGxlRG93biggZXZlbnQgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGlucHV0LnBvaW50ZXJBZGRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHBvaW50ZXIgPT4ge1xyXG4gICAgICBpZiAoIHRoaXMuZW5hYmxlZCApIHtcclxuICAgICAgICBwb2ludGVyLmFkZElucHV0TGlzdGVuZXIoIHRoaXMuaGFuZGxlRXZlbnRMaXN0ZW5lciwgdHJ1ZSApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBsaXN0ZW5lciBhZGRlZCB0byB0aGUgcG9pbnRlciB3aXRoIGF0dGFjaG1lbnQgdG8gY2FsbCBzd2lwZSBmdW5jdGlvbnNcclxuICAgIC8vIG9uIGEgcGFydGljdWxhciBub2RlIHdpdGggZm9jdXNcclxuICAgIHRoaXMuX2F0dGFjaGVkUG9pbnRlckxpc3RlbmVyID0ge1xyXG4gICAgICB1cDogZXZlbnQgPT4ge1xyXG4gICAgICAgIHRoaXMuZm9jdXNlZE5vZGUgJiYgdGhpcy5mb2N1c2VkTm9kZS5zd2lwZUVuZCAmJiB0aGlzLmZvY3VzZWROb2RlLnN3aXBlRW5kLmJpbmQoIHRoaXMuZm9jdXNlZE5vZGUgKSggZXZlbnQsIHRoaXMgKTtcclxuXHJcbiAgICAgICAgLy8gcmVtb3ZlIHRoaXMgbGlzdGVuZXIsIGNhbGwgdGhlIGZvY3VzZWROb2RlJ3Mgc3dpcGVFbmQgZnVuY3Rpb25cclxuICAgICAgICB0aGlzLmZvY3VzZWROb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9wb2ludGVyLnJlbW92ZUlucHV0TGlzdGVuZXIoIHRoaXMuX2F0dGFjaGVkUG9pbnRlckxpc3RlbmVyICk7XHJcbiAgICAgICAgdGhpcy5fcG9pbnRlciA9IG51bGw7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBtb3ZlOiBldmVudCA9PiB7XHJcblxyXG4gICAgICAgIC8vIGNhbGwgdGhlIGZvY3VzZWROb2RlJ3Mgc3dpcGVEcmFnIGZ1bmN0aW9uXHJcbiAgICAgICAgdGhpcy5mb2N1c2VkTm9kZSAmJiB0aGlzLmZvY3VzZWROb2RlLnN3aXBlTW92ZSAmJiB0aGlzLmZvY3VzZWROb2RlLnN3aXBlTW92ZS5iaW5kKCB0aGlzLmZvY3VzZWROb2RlICkoIGV2ZW50LCB0aGlzICk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBpbnRlcnJ1cHQ6IGV2ZW50ID0+IHtcclxuICAgICAgICB0aGlzLmZvY3VzZWROb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9wb2ludGVyLnJlbW92ZUlucHV0TGlzdGVuZXIoIHRoaXMuX2F0dGFjaGVkUG9pbnRlckxpc3RlbmVyICk7XHJcbiAgICAgICAgdGhpcy5fcG9pbnRlciA9IG51bGw7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBjYW5jZWw6IGV2ZW50ID0+IHtcclxuICAgICAgICB0aGlzLmZvY3VzZWROb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9wb2ludGVyLnJlbW92ZUlucHV0TGlzdGVuZXIoIHRoaXMuX2F0dGFjaGVkUG9pbnRlckxpc3RlbmVyICk7XHJcbiAgICAgICAgdGhpcy5fcG9pbnRlciA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBhZGRlZCB0byBQb2ludGVyIG9uIGRvd24gd2l0aG91dCBhdHRhY2hpbmcgc28gdGhhdCBpZiB0aGUgZXZlbnQgZG9lcyByZXN1bHRcclxuICAgIC8vIGluIGF0dGFjaG1lbnQgZWxzZXdoZXJlLCB0aGlzIGxpc3RlbmVyIGNhbiBiZSBpbnRlcnJ1cHRlZFxyXG4gICAgdGhpcy5fcG9pbnRlckxpc3RlbmVyID0ge1xyXG4gICAgICB1cDogZXZlbnQgPT4ge1xyXG5cclxuICAgICAgICAvLyBvbiBhbGwgcmVsZWFzZXMsIGNsZWFyIHJlZmVyZW5jZXMgYW5kIHRpbWVyc1xyXG4gICAgICAgIHRoaXMuZW5kU3dpcGUoKTtcclxuICAgICAgICB0aGlzLl9wb2ludGVyID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5zd2lwZURpc3RhbmNlID0gZXZlbnQucG9pbnRlci5wb2ludC5taW51cyggdGhpcy5kb3duUG9pbnQgKTtcclxuXHJcbiAgICAgICAgY29uc3QgdmVydGljYWxEaXN0YW5jZSA9IHRoaXMuc3dpcGVEaXN0YW5jZS55O1xyXG4gICAgICAgIGNvbnN0IGhvcml6b250YWxEaXN0YW5jZSA9IHRoaXMuc3dpcGVEaXN0YW5jZS54O1xyXG4gICAgICAgIGlmICggTWF0aC5hYnMoIGhvcml6b250YWxEaXN0YW5jZSApID4gMTAwICYmIE1hdGguYWJzKCB2ZXJ0aWNhbERpc3RhbmNlICkgPCAxMDAgKSB7XHJcblxyXG4gICAgICAgICAgLy8gc29tZSBzb3J0IG9mIGhvcml6b250YWwgc3dpcGVcclxuICAgICAgICAgIGlmICggaG9yaXpvbnRhbERpc3RhbmNlID4gMCApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGZvciB1cGNvbWluZyBpbnRlcnZpZXdzLCBsZXRzIGxpbWl0IHRoZSBmb2N1cyB0byBiZSB3aXRoaW4gdGhlIHNpbXVsYXRpb24sXHJcbiAgICAgICAgICAgIC8vIGRvbid0IGFsbG93IGl0IHRvIGdvIGludG8gdGhlICh1bmluc3RydW1lbnRlZCkgbmF2aWdhdGlvbiBiYXJcclxuICAgICAgICAgICAgaWYgKCBGb2N1c01hbmFnZXIucGRvbUZvY3VzZWROb2RlICYmIEZvY3VzTWFuYWdlci5wZG9tRm9jdXNlZE5vZGUuaW5uZXJDb250ZW50ID09PSAnUmVzZXQgQWxsJyApIHtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgUERPTVV0aWxzLmdldE5leHRGb2N1c2FibGUoIGRvY3VtZW50LmJvZHkgKS5mb2N1cygpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIFBET01VdGlscy5nZXRQcmV2aW91c0ZvY3VzYWJsZSggZG9jdW1lbnQuYm9keSApLmZvY3VzKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIHBvdGVudGlhbGx5IGEgZG91YmxlIHRhcFxyXG4gICAgICAgICAgaWYgKCB0aGlzLmZpcnN0VXAgKSB7XHJcbiAgICAgICAgICAgIGlmICggdGhpcy50aW1lU2luY2VMYXN0RG93biA8IERPVUJMRV9UQVBfSU5URVJWQUwgKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5maXJzdFVwID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgdGhpcy50aW1lU2luY2VMYXN0RG93biA9IDA7XHJcblxyXG4gICAgICAgICAgICAgIC8vIHNlbmQgYSBjbGljayBldmVudCB0byB0aGUgYWN0aXZlIGVsZW1lbnRcclxuICAgICAgICAgICAgICBjb25zdCBwZG9tUm9vdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoICdhMTF5LXBkb20tcm9vdCcgKVsgMCBdO1xyXG5cclxuICAgICAgICAgICAgICBpZiAoIHBkb21Sb290ICYmIHBkb21Sb290LmNvbnRhaW5zKCBldmVudC5hY3RpdmVFbGVtZW50ICkgKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5hY3RpdmVFbGVtZW50LmNsaWNrKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5maXJzdFVwID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBtb3ZlOiBldmVudCA9PiB7XHJcbiAgICAgICAgdGhpcy5sYXN0UG9pbnQgPSB0aGlzLmN1cnJlbnRQb2ludDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRQb2ludCA9IGV2ZW50LnBvaW50ZXIucG9pbnQ7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBpbnRlcnJ1cHQ6ICgpID0+IHtcclxuICAgICAgICB0aGlzLmludGVycnVwdCgpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgY2FuY2VsOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHQoKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBzdGVwVGltZXIuYWRkTGlzdGVuZXIoIHRoaXMuc3RlcC5iaW5kKCB0aGlzICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICogQHBhcmFtIGV2ZW50XHJcbiAgICovXHJcbiAgaGFuZGxlRG93biggZXZlbnQgKSB7XHJcbiAgICBldmVudC5wb2ludGVyLmFkZEludGVudCggSW50ZW50LkRSQUcgKTtcclxuICAgIHRoaXMuZG93blBvaW50ZXJzLnB1c2goIGV2ZW50LnBvaW50ZXIgKTtcclxuXHJcbiAgICAvLyBhbGxvdyB6b29tIGdlc3R1cmVzIGlmIHRoZXJlIGlzIG1vcmUgdGhhbiBvbmUgcG9pbnRlciBkb3duXHJcbiAgICBpZiAoIHRoaXMuZG93blBvaW50ZXJzLmxlbmd0aCA+IDEgKSB7XHJcbiAgICAgIHRoaXMuZG93blBvaW50ZXJzLmZvckVhY2goIGRvd25Qb2ludGVyID0+IGRvd25Qb2ludGVyLnJlbW92ZUludGVudCggSW50ZW50LkRSQUcgKSApO1xyXG4gICAgICBldmVudC5wb2ludGVyLnJlbW92ZUludGVudCggSW50ZW50LkRSQUcgKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBldmVudC5wb2ludGVyLmF0dGFjaGVkUHJvcGVydHkuZ2V0KCksICdzaG91bGQgYmUgYXR0YWNoZWQgdG8gdGhlIGhhbmRsZSBsaXN0ZW5lcicgKTtcclxuICAgIGV2ZW50LnBvaW50ZXIucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5oYW5kbGVFdmVudExpc3RlbmVyICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9wb2ludGVyID09PSBudWxsICYmIGV2ZW50LnBvaW50ZXIudHlwZSA9PT0gJ3RvdWNoJyApIHtcclxuXHJcbiAgICAgIC8vIGRvbid0IGFkZCBuZXcgbGlzdGVuZXJzIGlmIHdlIHdlcmVuJ3QgYWJsZSB0byBzdWNjZXNzZnVsbHkgZGV0YWNoIGFuZCBpbnRlcnJ1cHRcclxuICAgICAgLy8gdGhlIHByZXZpb3VzIGxpc3RlbmVyXHJcbiAgICAgIHRoaXMuX3BvaW50ZXIgPSBldmVudC5wb2ludGVyO1xyXG4gICAgICBldmVudC5wb2ludGVyLmFkZElucHV0TGlzdGVuZXIoIHRoaXMuX3BvaW50ZXJMaXN0ZW5lciwgdHJ1ZSApO1xyXG5cclxuICAgICAgLy8gdGhpcyB0YWtlcyBwcmlvcml0eSwgbm8gb3RoZXIgbGlzdGVuZXJzIHNob3VsZCBmaXJlXHJcbiAgICAgIGV2ZW50LmFib3J0KCk7XHJcblxyXG4gICAgICAvLyBrZWVwIGEgcmVmZXJlbmNlIHRvIHRoZSBldmVudCBvbiBkb3duIHNvIHdlIGNhbiB1c2UgaXQgaW4gdGhlIHN3aXBlU3RhcnRcclxuICAgICAgLy8gY2FsbGJhY2sgaWYgdGhlIHBvaW50ZXIgcmVtYWlucyBkb3duIGZvciBsb25nIGVub3VnaFxyXG4gICAgICB0aGlzLmRvd25FdmVudCA9IGV2ZW50O1xyXG5cclxuICAgICAgdGhpcy5kb3duUG9pbnQgPSBldmVudC5wb2ludGVyLnBvaW50O1xyXG4gICAgICB0aGlzLmN1cnJlbnRQb2ludCA9IHRoaXMuZG93blBvaW50LmNvcHkoKTtcclxuICAgICAgdGhpcy5wcmV2aW91c1BvaW50ID0gdGhpcy5jdXJyZW50UG9pbnQuY29weSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSBldmVudFxyXG4gICAqL1xyXG4gIHVwKCBldmVudCApIHtcclxuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5kb3duUG9pbnRlcnMuaW5kZXhPZiggZXZlbnQucG9pbnRlciApO1xyXG4gICAgaWYgKCBpbmRleCA+IC0xICkge1xyXG4gICAgICB0aGlzLmRvd25Qb2ludGVycy5zcGxpY2UoIGluZGV4LCAxICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGVwIHRoZSBsaXN0ZW5lciwgdXBkYXRpbmcgdGltZXJzIHVzZWQgdG8gZGV0ZXJtaW5lIHN3aXBlIHNwZWVkcyBhbmRcclxuICAgKiBkb3VibGUgdGFwIGdlc3R1cmVzLlxyXG4gICAqIEBwYXJhbSBkdFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgc3RlcCggZHQgKSB7XHJcblxyXG4gICAgLy8gZGV0ZWN0aW5nIGEgZG91YmxlLXRhcFxyXG4gICAgaWYgKCB0aGlzLmZpcnN0VXAgKSB7XHJcbiAgICAgIHRoaXMudGltZVNpbmNlTGFzdERvd24gKz0gZHQ7XHJcblxyXG4gICAgICAvLyB0b28gbG9uZyBmb3IgZ2VzdHVyZSwgd2FpdCB0aWxsIG5leHQgYXR0ZW1wdFxyXG4gICAgICBpZiAoIHRoaXMudGltZVNpbmNlTGFzdERvd24gPiBET1VCTEVfVEFQX0lOVEVSVkFMICkge1xyXG4gICAgICAgIHRoaXMuZmlyc3RVcCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudGltZVNpbmNlTGFzdERvd24gPSAwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZGV0ZWN0aW5nIGEgcHJlc3MgYW5kIGhvbGRcclxuICAgIGlmICggdGhpcy5fcG9pbnRlciApIHtcclxuICAgICAgaWYgKCAhdGhpcy5fcG9pbnRlci5saXN0ZW5lcnMuaW5jbHVkZXMoIHRoaXMuX2F0dGFjaGVkUG9pbnRlckxpc3RlbmVyICkgKSB7XHJcbiAgICAgICAgaWYgKCB0aGlzLmhvbGRpbmdUaW1lID4gUFJFU1NfQU5EX0hPTERfSU5URVJWQUwgKSB7XHJcblxyXG4gICAgICAgICAgLy8gdXNlciBoYXMgcHJlc3NlZCBkb3duIGZvciBsb25nIGVub3VnaCB0byBmb3J3YXJkIGEgZHJhZyBldmVudCB0byB0aGVcclxuICAgICAgICAgIC8vIGZvY3VzZWQgbm9kZVxyXG4gICAgICAgICAgY29uc3QgZm9jdXNlZE5vZGUgPSBGb2N1c01hbmFnZXIucGRvbUZvY3VzZWROb2RlO1xyXG4gICAgICAgICAgaWYgKCBmb2N1c2VkTm9kZSApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgbGlzdGVuZXIgbG9va2luZyBmb3IgZ2VzdHVyZXNcclxuICAgICAgICAgICAgdGhpcy5fcG9pbnRlci5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9wb2ludGVyTGlzdGVuZXIgKTtcclxuICAgICAgICAgICAgdGhpcy5ob2xkaW5nVGltZSA9IDA7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmZvY3VzZWROb2RlID0gZm9jdXNlZE5vZGU7XHJcbiAgICAgICAgICAgIHRoaXMuX3BvaW50ZXIuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5fYXR0YWNoZWRQb2ludGVyTGlzdGVuZXIsIHRydWUgKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZm9jdXNlZE5vZGUuc3dpcGVTdGFydCAmJiB0aGlzLmZvY3VzZWROb2RlLnN3aXBlU3RhcnQoIHRoaXMuZG93bkV2ZW50LCB0aGlzICk7XHJcbiAgICAgICAgICAgIHRoaXMuZG93bkV2ZW50ID0gbnVsbDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmhvbGRpbmdUaW1lICs9IGR0O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGRldGVybWluaW5nIHN3aXBlIHZlbG9jaXR5XHJcbiAgICBpZiAoIHRoaXMubGFzdFBvaW50ICE9PSBudWxsICYmIHRoaXMuY3VycmVudFBvaW50ICE9PSBudWxsICkge1xyXG4gICAgICB0aGlzLnZlbG9jaXR5ID0gdGhpcy5sYXN0UG9pbnQubWludXMoIHRoaXMuY3VycmVudFBvaW50ICkuZGl2aWRlZFNjYWxhciggZHQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEVuZHMgYSBzd2lwZSBnZXN0dXJlLCByZW1vdmluZyBsaXN0ZW5lcnMgYW5kIGNsZWFyaW5nIHJlZmVyZW5jZXMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBlbmRTd2lwZSgpIHtcclxuICAgIHRoaXMuaG9sZGluZ1RpbWUgPSAwO1xyXG5cclxuICAgIC8vIHJlbW92ZSBpZiB3ZSBoYXZlbid0IGJlZW4gaW50ZXJydXB0ZWQgYWxyZWFkeVxyXG4gICAgaWYgKCB0aGlzLl9wb2ludGVyICYmIHRoaXMuX3BvaW50ZXIubGlzdGVuZXJzLmluY2x1ZGVzKCB0aGlzLl9wb2ludGVyTGlzdGVuZXIgKSApIHtcclxuICAgICAgdGhpcy5fcG9pbnRlci5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9wb2ludGVyTGlzdGVuZXIgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGFjaCB0aGUgUG9pbnRlciBsaXN0ZW5lciB0aGF0IGlzIG9ic2VydmluZyBtb3ZlbWVudCBhZnRlciBhIHByZXNzLWFuZC1ob2xkIGdlc3R1cmUuXHJcbiAgICogVGhpcyBhbGxvd3MgeW91IHRvIGZvcndhcmQgdGhlIGRvd24gZXZlbnQgdG8gYW5vdGhlciBsaXN0ZW5lciBpZiB5b3UgZG9uJ3Qgd2FudCB0b1xyXG4gICAqIHJlLWltcGxlbWVudCBhbiBpbnRlcmFjdGlvbiB3aXRoIHN3aXBlTW92ZS4gVGhpcyBkb2VzIG5vdCByZW1vdmUgdGhlIGxpc3RlbmVyIGZyb20gdGhlIFBvaW50ZXIsXHJcbiAgICoganVzdCBkZXRhY2hlcyBpdCBzbyB0aGF0IGFub3RoZXIgbGlzdGVuZXIgY2FuIGJlIGF0dGFjaGVkLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkZXRhY2hQb2ludGVyTGlzdGVuZXIoKSB7XHJcbiAgICB0aGlzLl9wb2ludGVyLmRldGFjaCggdGhpcy5fYXR0YWNoZWRQb2ludGVyTGlzdGVuZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVycnVwdCB0aGlzIGxpc3RlbmVyLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBpbnRlcnJ1cHQoKSB7XHJcbiAgICB0aGlzLmVuZFN3aXBlKCk7XHJcbiAgICB0aGlzLl9wb2ludGVyID0gbnVsbDtcclxuICAgIHRoaXMuZG93bkV2ZW50ID0gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdTd2lwZUxpc3RlbmVyJywgU3dpcGVMaXN0ZW5lciApO1xyXG5leHBvcnQgZGVmYXVsdCBTd2lwZUxpc3RlbmVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sK0JBQStCO0FBQ3JELFNBQVNDLFlBQVksRUFBRUMsTUFBTSxFQUFFQyxTQUFTLEVBQUVDLE9BQU8sUUFBUSxlQUFlOztBQUV4RTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1DLHVCQUF1QixHQUFHLElBQUk7QUFDcEMsTUFBTUMsbUJBQW1CLEdBQUcsR0FBRyxDQUFDLENBQUM7O0FBRWpDLE1BQU1DLGFBQWEsQ0FBQztFQUVsQjtBQUNGO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsS0FBSyxFQUFHO0lBRW5CO0lBQ0EsSUFBSSxDQUFDQyxRQUFRLEdBQUcsSUFBSTs7SUFFcEI7SUFDQSxJQUFJLENBQUNDLFNBQVMsR0FBRyxJQUFJOztJQUVyQjtJQUNB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