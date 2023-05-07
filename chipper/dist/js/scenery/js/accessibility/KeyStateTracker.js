// Copyright 2018-2023, University of Colorado Boulder

/**
 * A type that will manage the state of the keyboard. This will track which keys are being held down and for how long.
 * It also offers convenience methods to determine whether or not specific keys are down like shift or enter using
 * KeyboardUtils' key schema.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Barlow
 */

import PhetioAction from '../../../tandem/js/PhetioAction.js';
import Emitter from '../../../axon/js/Emitter.js';
import stepTimer from '../../../axon/js/stepTimer.js';
import EventType from '../../../tandem/js/EventType.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { EventIO, KeyboardUtils, scenery } from '../imports.js';
import optionize from '../../../phet-core/js/optionize.js';

// Type describing the state of a single key in the KeyState.

// The type for the keyState Object, keys are the KeyboardEvent.code for the pressed key.

class KeyStateTracker {
  // Contains info about which keys are currently pressed for how long. JavaScript doesn't handle multiple key presses,
  // with events so we have to update this object ourselves.
  keyState = {};

  // The KeyboardEvent.code of the last key that was pressed down when updating the key state.
  _lastKeyDown = null;

  // Whether this KeyStateTracker is attached to the document and listening for events.
  attachedToDocument = false;

  // Listeners potentially attached to the document to update the state of this KeyStateTracker, see attachToWindow()
  documentKeyupListener = null;
  documentKeydownListener = null;

  // If the KeyStateTracker is enabled. If disabled, keyState is cleared and listeners noop.
  _enabled = true;

  // Emits events when keyup/keydown updates are received. These will emit after any updates to the
  // keyState so that keyState is correct in time for listeners. Note the valueType is a native KeyboardEvent event.
  keydownEmitter = new Emitter({
    parameters: [{
      valueType: KeyboardEvent
    }]
  });
  keyupEmitter = new Emitter({
    parameters: [{
      valueType: KeyboardEvent
    }]
  });

  // Action which updates the KeyStateTracker, when it is time to do so - the update is wrapped by an Action so that
  // the KeyStateTracker state is captured for PhET-iO.
  // Action which updates the state of the KeyStateTracker on key release. This is wrapped in an Action so that state
  // is captured for PhET-iO.
  constructor(providedOptions) {
    const options = optionize()({
      tandem: Tandem.OPTIONAL
    }, providedOptions);
    this.keydownUpdateAction = new PhetioAction(domEvent => {
      // Not all keys have a code for the browser to use, we need to be graceful and do nothing if there isn't one.
      const key = KeyboardUtils.getEventCode(domEvent);
      if (key) {
        // The dom event might have a modifier key that we weren't able to catch, if that is the case update the keyState.
        // This is likely to happen when pressing browser key commands like "ctrl + tab" to switch tabs.
        this.correctModifierKeys(domEvent);
        if (assert && !KeyboardUtils.isShiftKey(domEvent)) {
          assert(domEvent.shiftKey === this.shiftKeyDown, 'shift key inconsistency between event and keyState.');
        }
        if (assert && !KeyboardUtils.isAltKey(domEvent)) {
          assert(domEvent.altKey === this.altKeyDown, 'alt key inconsistency between event and keyState.');
        }
        if (assert && !KeyboardUtils.isControlKey(domEvent)) {
          assert(domEvent.ctrlKey === this.ctrlKeyDown, 'ctrl key inconsistency between event and keyState.');
        }

        // if the key is already down, don't do anything else (we don't want to create a new keyState object
        // for a key that is already being tracked and down)
        if (!this.isKeyDown(key)) {
          const key = KeyboardUtils.getEventCode(domEvent);
          assert && assert(key, 'Could not find key from domEvent');
          this.keyState[key] = {
            keyDown: true,
            key: key,
            timeDown: 0 // in ms
          };
        }

        this._lastKeyDown = key;

        // keydown update received, notify listeners
        this.keydownEmitter.emit(domEvent);
      }
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('keydownUpdateAction'),
      parameters: [{
        name: 'event',
        phetioType: EventIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Action that executes whenever a keydown occurs from the input listeners this keyStateTracker adds (most likely to the document).'
    });
    this.keyupUpdateAction = new PhetioAction(domEvent => {
      // Not all keys have a code for the browser to use, we need to be graceful and do nothing if there isn't one.
      const key = KeyboardUtils.getEventCode(domEvent);
      if (key) {
        // correct keyState in case browser didn't receive keydown/keyup events for a modifier key
        this.correctModifierKeys(domEvent);

        // Remove this key data from the state - There are many cases where we might receive a keyup before keydown like
        // on first tab into scenery Display or when using specific operating system keys with the browser or PrtScn so
        // an assertion for this is too strict. See https://github.com/phetsims/scenery/issues/918
        if (this.isKeyDown(key)) {
          delete this.keyState[key];
        }

        // keyup event received, notify listeners
        this.keyupEmitter.emit(domEvent);
      }
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('keyupUpdateAction'),
      parameters: [{
        name: 'event',
        phetioType: EventIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Action that executes whenever a keyup occurs from the input listeners this keyStateTracker adds (most likely to the document).'
    });
    const stepListener = this.step.bind(this);
    stepTimer.addListener(stepListener);
    this.disposeKeyStateTracker = () => {
      stepTimer.removeListener(stepListener);
      if (this.attachedToDocument) {
        this.detachFromDocument();
      }
    };
  }

  /**
   * Implements keyboard dragging when listener is attached to the Node, public so listener is attached
   * with addInputListener(). Only updated when enabled.
   *
   * Note that this event is assigned in the constructor, and not to the prototype. As of writing this,
   * `Node.addInputListener` only supports type properties as event listeners, and not the event keys as
   * prototype methods. Please see https://github.com/phetsims/scenery/issues/851 for more information.
   */
  keydownUpdate(domEvent) {
    this.enabled && this.keydownUpdateAction.execute(domEvent);
  }

  /**
   * Modifier keys might be part of the domEvent but the browser may or may not have received a keydown/keyup event
   * with specifically for the modifier key. This will add or remove modifier keys in that case.
   */
  correctModifierKeys(domEvent) {
    const key = KeyboardUtils.getEventCode(domEvent);
    assert && assert(key, 'key not found from domEvent');

    // add modifier keys if they aren't down
    if (domEvent.shiftKey && !KeyboardUtils.isShiftKey(domEvent) && !this.shiftKeyDown) {
      this.keyState[KeyboardUtils.KEY_SHIFT_LEFT] = {
        keyDown: true,
        key: key,
        timeDown: 0 // in ms
      };
    }

    if (domEvent.altKey && !KeyboardUtils.isAltKey(domEvent) && !this.altKeyDown) {
      this.keyState[KeyboardUtils.KEY_ALT_LEFT] = {
        keyDown: true,
        key: key,
        timeDown: 0 // in ms
      };
    }

    if (domEvent.ctrlKey && !KeyboardUtils.isControlKey(domEvent) && !this.ctrlKeyDown) {
      this.keyState[KeyboardUtils.KEY_CONTROL_LEFT] = {
        keyDown: true,
        key: key,
        timeDown: 0 // in ms
      };
    }

    // delete modifier keys if we think they are down
    if (!domEvent.shiftKey && this.shiftKeyDown) {
      delete this.keyState[KeyboardUtils.KEY_SHIFT_LEFT];
      delete this.keyState[KeyboardUtils.KEY_SHIFT_RIGHT];
    }
    if (!domEvent.altKey && this.altKeyDown) {
      delete this.keyState[KeyboardUtils.KEY_ALT_LEFT];
      delete this.keyState[KeyboardUtils.KEY_ALT_RIGHT];
    }
    if (!domEvent.ctrlKey && this.ctrlKeyDown) {
      delete this.keyState[KeyboardUtils.KEY_CONTROL_LEFT];
      delete this.keyState[KeyboardUtils.KEY_CONTROL_RIGHT];
    }
  }

  /**
   * Behavior for keyboard 'up' DOM event. Public so it can be attached with addInputListener(). Only updated when
   * enabled.
   *
   * Note that this event is assigned in the constructor, and not to the prototype. As of writing this,
   * `Node.addInputListener` only supports type properties as event listeners, and not the event keys as
   * prototype methods. Please see https://github.com/phetsims/scenery/issues/851 for more information.
   */
  keyupUpdate(domEvent) {
    this.enabled && this.keyupUpdateAction.execute(domEvent);
  }

  /**
   * Returns true if any of the movement keys are down (arrow keys or WASD keys).
   */
  get movementKeysDown() {
    return this.isAnyKeyInListDown(KeyboardUtils.MOVEMENT_KEYS);
  }

  /**
   * Returns the KeyboardEvent.code from the last key down that updated the keystate.
   */
  getLastKeyDown() {
    return this._lastKeyDown;
  }

  /**
   * Returns true if a key with the KeyboardEvent.code is currently down.
   */
  isKeyDown(key) {
    if (!this.keyState[key]) {
      // key hasn't been pressed once yet
      return false;
    }
    return this.keyState[key].keyDown;
  }

  /**
   * Returns true if any of the keys in the list are currently down. Keys are the KeyboardEvent.code strings.
   */
  isAnyKeyInListDown(keyList) {
    for (let i = 0; i < keyList.length; i++) {
      if (this.isKeyDown(keyList[i])) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns true if ALL of the keys in the list are currently down. Values of the keyList array are the
   * KeyboardEvent.code for the keys you are interested in.
   */
  areKeysDown(keyList) {
    const keysDown = true;
    for (let i = 0; i < keyList.length; i++) {
      if (!this.isKeyDown(keyList[i])) {
        return false;
      }
    }
    return keysDown;
  }

  /**
   * Returns true if ALL keys in the list are down and ONLY the keys in the list are down. Values of keyList array
   * are the KeyboardEvent.code for keys you are interested in OR the KeyboardEvent.key in the special case of
   * modifier keys.
   *
   * (scenery-internal)
   */
  areKeysExclusivelyDown(keyList) {
    const keyStateKeys = Object.keys(this.keyState);

    // quick sanity check for equality first
    if (keyStateKeys.length !== keyList.length) {
      return false;
    }

    // Now make sure that every key in the list is in the keyState
    let onlyKeyListDown = true;
    for (let i = 0; i < keyList.length; i++) {
      const initialKey = keyList[i];
      let keysToCheck = [initialKey];

      // If a modifier key, need to look for the equivalent pair of left/right KeyboardEvent.codes in the list
      // because KeyStateTracker works exclusively with codes.
      if (KeyboardUtils.isModifierKey(initialKey)) {
        keysToCheck = KeyboardUtils.MODIFIER_KEY_TO_CODE_MAP.get(initialKey);
      }
      if (_.intersection(keyStateKeys, keysToCheck).length === 0) {
        onlyKeyListDown = false;
      }
    }
    return onlyKeyListDown;
  }

  /**
   * Returns true if any keys are down according to teh keyState.
   */
  keysAreDown() {
    return Object.keys(this.keyState).length > 0;
  }

  /**
   * Returns true if the "Enter" key is currently down.
   */
  get enterKeyDown() {
    return this.isKeyDown(KeyboardUtils.KEY_ENTER);
  }

  /**
   * Returns true if the shift key is currently down.
   */
  get shiftKeyDown() {
    return this.isAnyKeyInListDown(KeyboardUtils.SHIFT_KEYS);
  }

  /**
   * Returns true if the alt key is currently down.
   */
  get altKeyDown() {
    return this.isAnyKeyInListDown(KeyboardUtils.ALT_KEYS);
  }

  /**
   * Returns true if the control key is currently down.
   */
  get ctrlKeyDown() {
    return this.isAnyKeyInListDown(KeyboardUtils.CONTROL_KEYS);
  }

  /**
   * Returns the amount of time that the provided key has been held down. Error if the key is not currently down.
   * @param key - KeyboardEvent.code for the key you are inspecting.
   */
  timeDownForKey(key) {
    assert && assert(this.isKeyDown(key), 'cannot get timeDown on a key that is not pressed down');
    return this.keyState[key].timeDown;
  }

  /**
   * Clear the entire state of the key tracker, basically restarting the tracker.
   */
  clearState() {
    this.keyState = {};
  }

  /**
   * Step function for the tracker. JavaScript does not natively handle multiple keydown events at once,
   * so we need to track the state of the keyboard in an Object and manage dragging in this function.
   * In order for the drag handler to work.
   *
   * @param dt - time in seconds that has passed since the last update
   */
  step(dt) {
    // no-op unless a key is down
    if (this.keysAreDown()) {
      const ms = dt * 1000;

      // for each key that is still down, increment the tracked time that has been down
      for (const i in this.keyState) {
        if (this.keyState.hasOwnProperty(i)) {
          if (this.keyState[i].keyDown) {
            this.keyState[i].timeDown += ms;
          }
        }
      }
    }
  }

  /**
   * Add this KeyStateTracker to the window so that it updates whenever the document receives key events. This is
   * useful if you want to observe key presses while DOM focus not within the PDOM root.
   */
  attachToWindow() {
    assert && assert(!this.attachedToDocument, 'KeyStateTracker is already attached to document.');
    this.documentKeydownListener = event => {
      this.keydownUpdate(event);
    };
    this.documentKeyupListener = event => {
      this.keyupUpdate(event);
    };
    const addListenersToDocument = () => {
      // attach with useCapture so that the keyStateTracker is updated before the events dispatch within Scenery
      window.addEventListener('keyup', this.documentKeyupListener, {
        capture: true
      });
      window.addEventListener('keydown', this.documentKeydownListener, {
        capture: true
      });
      this.attachedToDocument = true;
    };
    if (!document) {
      // attach listeners on window load to ensure that the document is defined
      const loadListener = () => {
        addListenersToDocument();
        window.removeEventListener('load', loadListener);
      };
      window.addEventListener('load', loadListener);
    } else {
      // document is defined and we won't get another load event so attach right away
      addListenersToDocument();
    }
  }

  /**
   * The KeyState is cleared when the tracker is disabled.
   */
  setEnabled(enabled) {
    if (this._enabled !== enabled) {
      this._enabled = enabled;

      // clear state when disabled
      !enabled && this.clearState();
    }
  }
  set enabled(enabled) {
    this.setEnabled(enabled);
  }
  get enabled() {
    return this.isEnabled();
  }
  isEnabled() {
    return this._enabled;
  }

  /**
   * Detach listeners from the document that would update the state of this KeyStateTracker on key presses.
   */
  detachFromDocument() {
    assert && assert(this.attachedToDocument, 'KeyStateTracker is not attached to window.');
    assert && assert(this.documentKeyupListener, 'keyup listener was not created or attached to window');
    assert && assert(this.documentKeydownListener, 'keydown listener was not created or attached to window.');
    window.removeEventListener('keyup', this.documentKeyupListener);
    window.removeEventListener('keydown', this.documentKeydownListener);
    this.documentKeyupListener = null;
    this.documentKeydownListener = null;
    this.attachedToDocument = false;
  }
  dispose() {
    this.disposeKeyStateTracker();
  }
}
scenery.register('KeyStateTracker', KeyStateTracker);
export default KeyStateTracker;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0aW9BY3Rpb24iLCJFbWl0dGVyIiwic3RlcFRpbWVyIiwiRXZlbnRUeXBlIiwiVGFuZGVtIiwiRXZlbnRJTyIsIktleWJvYXJkVXRpbHMiLCJzY2VuZXJ5Iiwib3B0aW9uaXplIiwiS2V5U3RhdGVUcmFja2VyIiwia2V5U3RhdGUiLCJfbGFzdEtleURvd24iLCJhdHRhY2hlZFRvRG9jdW1lbnQiLCJkb2N1bWVudEtleXVwTGlzdGVuZXIiLCJkb2N1bWVudEtleWRvd25MaXN0ZW5lciIsIl9lbmFibGVkIiwia2V5ZG93bkVtaXR0ZXIiLCJwYXJhbWV0ZXJzIiwidmFsdWVUeXBlIiwiS2V5Ym9hcmRFdmVudCIsImtleXVwRW1pdHRlciIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInRhbmRlbSIsIk9QVElPTkFMIiwia2V5ZG93blVwZGF0ZUFjdGlvbiIsImRvbUV2ZW50Iiwia2V5IiwiZ2V0RXZlbnRDb2RlIiwiY29ycmVjdE1vZGlmaWVyS2V5cyIsImFzc2VydCIsImlzU2hpZnRLZXkiLCJzaGlmdEtleSIsInNoaWZ0S2V5RG93biIsImlzQWx0S2V5IiwiYWx0S2V5IiwiYWx0S2V5RG93biIsImlzQ29udHJvbEtleSIsImN0cmxLZXkiLCJjdHJsS2V5RG93biIsImlzS2V5RG93biIsImtleURvd24iLCJ0aW1lRG93biIsImVtaXQiLCJwaGV0aW9QbGF5YmFjayIsImNyZWF0ZVRhbmRlbSIsIm5hbWUiLCJwaGV0aW9UeXBlIiwicGhldGlvRXZlbnRUeXBlIiwiVVNFUiIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJrZXl1cFVwZGF0ZUFjdGlvbiIsInN0ZXBMaXN0ZW5lciIsInN0ZXAiLCJiaW5kIiwiYWRkTGlzdGVuZXIiLCJkaXNwb3NlS2V5U3RhdGVUcmFja2VyIiwicmVtb3ZlTGlzdGVuZXIiLCJkZXRhY2hGcm9tRG9jdW1lbnQiLCJrZXlkb3duVXBkYXRlIiwiZW5hYmxlZCIsImV4ZWN1dGUiLCJLRVlfU0hJRlRfTEVGVCIsIktFWV9BTFRfTEVGVCIsIktFWV9DT05UUk9MX0xFRlQiLCJLRVlfU0hJRlRfUklHSFQiLCJLRVlfQUxUX1JJR0hUIiwiS0VZX0NPTlRST0xfUklHSFQiLCJrZXl1cFVwZGF0ZSIsIm1vdmVtZW50S2V5c0Rvd24iLCJpc0FueUtleUluTGlzdERvd24iLCJNT1ZFTUVOVF9LRVlTIiwiZ2V0TGFzdEtleURvd24iLCJrZXlMaXN0IiwiaSIsImxlbmd0aCIsImFyZUtleXNEb3duIiwia2V5c0Rvd24iLCJhcmVLZXlzRXhjbHVzaXZlbHlEb3duIiwia2V5U3RhdGVLZXlzIiwiT2JqZWN0Iiwia2V5cyIsIm9ubHlLZXlMaXN0RG93biIsImluaXRpYWxLZXkiLCJrZXlzVG9DaGVjayIsImlzTW9kaWZpZXJLZXkiLCJNT0RJRklFUl9LRVlfVE9fQ09ERV9NQVAiLCJnZXQiLCJfIiwiaW50ZXJzZWN0aW9uIiwia2V5c0FyZURvd24iLCJlbnRlcktleURvd24iLCJLRVlfRU5URVIiLCJTSElGVF9LRVlTIiwiQUxUX0tFWVMiLCJDT05UUk9MX0tFWVMiLCJ0aW1lRG93bkZvcktleSIsImNsZWFyU3RhdGUiLCJkdCIsIm1zIiwiaGFzT3duUHJvcGVydHkiLCJhdHRhY2hUb1dpbmRvdyIsImV2ZW50IiwiYWRkTGlzdGVuZXJzVG9Eb2N1bWVudCIsIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJjYXB0dXJlIiwiZG9jdW1lbnQiLCJsb2FkTGlzdGVuZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwic2V0RW5hYmxlZCIsImlzRW5hYmxlZCIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIktleVN0YXRlVHJhY2tlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIHR5cGUgdGhhdCB3aWxsIG1hbmFnZSB0aGUgc3RhdGUgb2YgdGhlIGtleWJvYXJkLiBUaGlzIHdpbGwgdHJhY2sgd2hpY2gga2V5cyBhcmUgYmVpbmcgaGVsZCBkb3duIGFuZCBmb3IgaG93IGxvbmcuXHJcbiAqIEl0IGFsc28gb2ZmZXJzIGNvbnZlbmllbmNlIG1ldGhvZHMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgb3Igbm90IHNwZWNpZmljIGtleXMgYXJlIGRvd24gbGlrZSBzaGlmdCBvciBlbnRlciB1c2luZ1xyXG4gKiBLZXlib2FyZFV0aWxzJyBrZXkgc2NoZW1hLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgQmFybG93XHJcbiAqL1xyXG5cclxuaW1wb3J0IFBoZXRpb0FjdGlvbiBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvUGhldGlvQWN0aW9uLmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XHJcbmltcG9ydCBFdmVudFR5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL0V2ZW50VHlwZS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCB7IEV2ZW50SU8sIEtleWJvYXJkVXRpbHMsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBoZXRpb09iamVjdCBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcclxuaW1wb3J0IFBpY2tPcHRpb25hbCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja09wdGlvbmFsLmpzJztcclxuaW1wb3J0IFRFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvVEVtaXR0ZXIuanMnO1xyXG5cclxuLy8gVHlwZSBkZXNjcmliaW5nIHRoZSBzdGF0ZSBvZiBhIHNpbmdsZSBrZXkgaW4gdGhlIEtleVN0YXRlLlxyXG50eXBlIEtleVN0YXRlSW5mbyA9IHtcclxuXHJcbiAgLy8gVGhlIGV2ZW50LmNvZGUgc3RyaW5nIGZvciB0aGUga2V5LlxyXG4gIGtleTogc3RyaW5nO1xyXG5cclxuICAvLyBJcyB0aGUga2V5IGN1cnJlbnRseSBkb3duP1xyXG4gIGtleURvd246IGJvb2xlYW47XHJcblxyXG4gIC8vIEhvdyBsb25nIGhhcyB0aGUga2V5IGJlZW4gaGVsZCBkb3duLCBpbiBtaWxsaXNlY29uZHNcclxuICB0aW1lRG93bjogbnVtYmVyO1xyXG59O1xyXG5cclxuLy8gVGhlIHR5cGUgZm9yIHRoZSBrZXlTdGF0ZSBPYmplY3QsIGtleXMgYXJlIHRoZSBLZXlib2FyZEV2ZW50LmNvZGUgZm9yIHRoZSBwcmVzc2VkIGtleS5cclxudHlwZSBLZXlTdGF0ZSA9IFJlY29yZDxzdHJpbmcsIEtleVN0YXRlSW5mbz47XHJcblxyXG5leHBvcnQgdHlwZSBLZXlTdGF0ZVRyYWNrZXJPcHRpb25zID0gUGlja09wdGlvbmFsPFBoZXRpb09iamVjdCwgJ3RhbmRlbSc+O1xyXG5cclxuY2xhc3MgS2V5U3RhdGVUcmFja2VyIHtcclxuXHJcbiAgLy8gQ29udGFpbnMgaW5mbyBhYm91dCB3aGljaCBrZXlzIGFyZSBjdXJyZW50bHkgcHJlc3NlZCBmb3IgaG93IGxvbmcuIEphdmFTY3JpcHQgZG9lc24ndCBoYW5kbGUgbXVsdGlwbGUga2V5IHByZXNzZXMsXHJcbiAgLy8gd2l0aCBldmVudHMgc28gd2UgaGF2ZSB0byB1cGRhdGUgdGhpcyBvYmplY3Qgb3Vyc2VsdmVzLlxyXG4gIHByaXZhdGUga2V5U3RhdGU6IEtleVN0YXRlID0ge307XHJcblxyXG4gIC8vIFRoZSBLZXlib2FyZEV2ZW50LmNvZGUgb2YgdGhlIGxhc3Qga2V5IHRoYXQgd2FzIHByZXNzZWQgZG93biB3aGVuIHVwZGF0aW5nIHRoZSBrZXkgc3RhdGUuXHJcbiAgcHJpdmF0ZSBfbGFzdEtleURvd246IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG5cclxuICAvLyBXaGV0aGVyIHRoaXMgS2V5U3RhdGVUcmFja2VyIGlzIGF0dGFjaGVkIHRvIHRoZSBkb2N1bWVudCBhbmQgbGlzdGVuaW5nIGZvciBldmVudHMuXHJcbiAgcHJpdmF0ZSBhdHRhY2hlZFRvRG9jdW1lbnQgPSBmYWxzZTtcclxuXHJcbiAgLy8gTGlzdGVuZXJzIHBvdGVudGlhbGx5IGF0dGFjaGVkIHRvIHRoZSBkb2N1bWVudCB0byB1cGRhdGUgdGhlIHN0YXRlIG9mIHRoaXMgS2V5U3RhdGVUcmFja2VyLCBzZWUgYXR0YWNoVG9XaW5kb3coKVxyXG4gIHByaXZhdGUgZG9jdW1lbnRLZXl1cExpc3RlbmVyOiBudWxsIHwgKCAoIGV2ZW50OiBLZXlib2FyZEV2ZW50ICkgPT4gdm9pZCApID0gbnVsbDtcclxuICBwcml2YXRlIGRvY3VtZW50S2V5ZG93bkxpc3RlbmVyOiBudWxsIHwgKCAoIGV2ZW50OiBLZXlib2FyZEV2ZW50ICkgPT4gdm9pZCApID0gbnVsbDtcclxuXHJcbiAgLy8gSWYgdGhlIEtleVN0YXRlVHJhY2tlciBpcyBlbmFibGVkLiBJZiBkaXNhYmxlZCwga2V5U3RhdGUgaXMgY2xlYXJlZCBhbmQgbGlzdGVuZXJzIG5vb3AuXHJcbiAgcHJpdmF0ZSBfZW5hYmxlZCA9IHRydWU7XHJcblxyXG4gIC8vIEVtaXRzIGV2ZW50cyB3aGVuIGtleXVwL2tleWRvd24gdXBkYXRlcyBhcmUgcmVjZWl2ZWQuIFRoZXNlIHdpbGwgZW1pdCBhZnRlciBhbnkgdXBkYXRlcyB0byB0aGVcclxuICAvLyBrZXlTdGF0ZSBzbyB0aGF0IGtleVN0YXRlIGlzIGNvcnJlY3QgaW4gdGltZSBmb3IgbGlzdGVuZXJzLiBOb3RlIHRoZSB2YWx1ZVR5cGUgaXMgYSBuYXRpdmUgS2V5Ym9hcmRFdmVudCBldmVudC5cclxuICBwdWJsaWMgcmVhZG9ubHkga2V5ZG93bkVtaXR0ZXI6IFRFbWl0dGVyPFsgS2V5Ym9hcmRFdmVudCBdPiA9IG5ldyBFbWl0dGVyKCB7IHBhcmFtZXRlcnM6IFsgeyB2YWx1ZVR5cGU6IEtleWJvYXJkRXZlbnQgfSBdIH0gKTtcclxuICBwdWJsaWMgcmVhZG9ubHkga2V5dXBFbWl0dGVyOiBURW1pdHRlcjxbIEtleWJvYXJkRXZlbnQgXT4gPSBuZXcgRW1pdHRlciggeyBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiBLZXlib2FyZEV2ZW50IH0gXSB9ICk7XHJcblxyXG4gIC8vIEFjdGlvbiB3aGljaCB1cGRhdGVzIHRoZSBLZXlTdGF0ZVRyYWNrZXIsIHdoZW4gaXQgaXMgdGltZSB0byBkbyBzbyAtIHRoZSB1cGRhdGUgaXMgd3JhcHBlZCBieSBhbiBBY3Rpb24gc28gdGhhdFxyXG4gIC8vIHRoZSBLZXlTdGF0ZVRyYWNrZXIgc3RhdGUgaXMgY2FwdHVyZWQgZm9yIFBoRVQtaU8uXHJcbiAgcHVibGljIHJlYWRvbmx5IGtleWRvd25VcGRhdGVBY3Rpb246IFBoZXRpb0FjdGlvbjxbIEtleWJvYXJkRXZlbnQgXT47XHJcblxyXG4gIC8vIEFjdGlvbiB3aGljaCB1cGRhdGVzIHRoZSBzdGF0ZSBvZiB0aGUgS2V5U3RhdGVUcmFja2VyIG9uIGtleSByZWxlYXNlLiBUaGlzIGlzIHdyYXBwZWQgaW4gYW4gQWN0aW9uIHNvIHRoYXQgc3RhdGVcclxuICAvLyBpcyBjYXB0dXJlZCBmb3IgUGhFVC1pTy5cclxuICBwdWJsaWMgcmVhZG9ubHkga2V5dXBVcGRhdGVBY3Rpb246IFBoZXRpb0FjdGlvbjxbIEtleWJvYXJkRXZlbnQgXT47XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUtleVN0YXRlVHJhY2tlcjogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBLZXlTdGF0ZVRyYWNrZXJPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8S2V5U3RhdGVUcmFja2VyT3B0aW9ucz4oKSgge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRJT05BTFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5rZXlkb3duVXBkYXRlQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggZG9tRXZlbnQgPT4ge1xyXG5cclxuICAgICAgLy8gTm90IGFsbCBrZXlzIGhhdmUgYSBjb2RlIGZvciB0aGUgYnJvd3NlciB0byB1c2UsIHdlIG5lZWQgdG8gYmUgZ3JhY2VmdWwgYW5kIGRvIG5vdGhpbmcgaWYgdGhlcmUgaXNuJ3Qgb25lLlxyXG4gICAgICBjb25zdCBrZXkgPSBLZXlib2FyZFV0aWxzLmdldEV2ZW50Q29kZSggZG9tRXZlbnQgKTtcclxuICAgICAgaWYgKCBrZXkgKSB7XHJcblxyXG4gICAgICAgIC8vIFRoZSBkb20gZXZlbnQgbWlnaHQgaGF2ZSBhIG1vZGlmaWVyIGtleSB0aGF0IHdlIHdlcmVuJ3QgYWJsZSB0byBjYXRjaCwgaWYgdGhhdCBpcyB0aGUgY2FzZSB1cGRhdGUgdGhlIGtleVN0YXRlLlxyXG4gICAgICAgIC8vIFRoaXMgaXMgbGlrZWx5IHRvIGhhcHBlbiB3aGVuIHByZXNzaW5nIGJyb3dzZXIga2V5IGNvbW1hbmRzIGxpa2UgXCJjdHJsICsgdGFiXCIgdG8gc3dpdGNoIHRhYnMuXHJcbiAgICAgICAgdGhpcy5jb3JyZWN0TW9kaWZpZXJLZXlzKCBkb21FdmVudCApO1xyXG5cclxuICAgICAgICBpZiAoIGFzc2VydCAmJiAhS2V5Ym9hcmRVdGlscy5pc1NoaWZ0S2V5KCBkb21FdmVudCApICkge1xyXG4gICAgICAgICAgYXNzZXJ0KCBkb21FdmVudC5zaGlmdEtleSA9PT0gdGhpcy5zaGlmdEtleURvd24sICdzaGlmdCBrZXkgaW5jb25zaXN0ZW5jeSBiZXR3ZWVuIGV2ZW50IGFuZCBrZXlTdGF0ZS4nICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggYXNzZXJ0ICYmICFLZXlib2FyZFV0aWxzLmlzQWx0S2V5KCBkb21FdmVudCApICkge1xyXG4gICAgICAgICAgYXNzZXJ0KCBkb21FdmVudC5hbHRLZXkgPT09IHRoaXMuYWx0S2V5RG93biwgJ2FsdCBrZXkgaW5jb25zaXN0ZW5jeSBiZXR3ZWVuIGV2ZW50IGFuZCBrZXlTdGF0ZS4nICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggYXNzZXJ0ICYmICFLZXlib2FyZFV0aWxzLmlzQ29udHJvbEtleSggZG9tRXZlbnQgKSApIHtcclxuICAgICAgICAgIGFzc2VydCggZG9tRXZlbnQuY3RybEtleSA9PT0gdGhpcy5jdHJsS2V5RG93biwgJ2N0cmwga2V5IGluY29uc2lzdGVuY3kgYmV0d2VlbiBldmVudCBhbmQga2V5U3RhdGUuJyApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gaWYgdGhlIGtleSBpcyBhbHJlYWR5IGRvd24sIGRvbid0IGRvIGFueXRoaW5nIGVsc2UgKHdlIGRvbid0IHdhbnQgdG8gY3JlYXRlIGEgbmV3IGtleVN0YXRlIG9iamVjdFxyXG4gICAgICAgIC8vIGZvciBhIGtleSB0aGF0IGlzIGFscmVhZHkgYmVpbmcgdHJhY2tlZCBhbmQgZG93bilcclxuICAgICAgICBpZiAoICF0aGlzLmlzS2V5RG93bigga2V5ICkgKSB7XHJcbiAgICAgICAgICBjb25zdCBrZXkgPSBLZXlib2FyZFV0aWxzLmdldEV2ZW50Q29kZSggZG9tRXZlbnQgKSE7XHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBrZXksICdDb3VsZCBub3QgZmluZCBrZXkgZnJvbSBkb21FdmVudCcgKTtcclxuICAgICAgICAgIHRoaXMua2V5U3RhdGVbIGtleSBdID0ge1xyXG4gICAgICAgICAgICBrZXlEb3duOiB0cnVlLFxyXG4gICAgICAgICAgICBrZXk6IGtleSxcclxuICAgICAgICAgICAgdGltZURvd246IDAgLy8gaW4gbXNcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9sYXN0S2V5RG93biA9IGtleTtcclxuXHJcbiAgICAgICAgLy8ga2V5ZG93biB1cGRhdGUgcmVjZWl2ZWQsIG5vdGlmeSBsaXN0ZW5lcnNcclxuICAgICAgICB0aGlzLmtleWRvd25FbWl0dGVyLmVtaXQoIGRvbUV2ZW50ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIHBoZXRpb1BsYXliYWNrOiB0cnVlLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2tleWRvd25VcGRhdGVBY3Rpb24nICksXHJcbiAgICAgIHBhcmFtZXRlcnM6IFsgeyBuYW1lOiAnZXZlbnQnLCBwaGV0aW9UeXBlOiBFdmVudElPIH0gXSxcclxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0FjdGlvbiB0aGF0IGV4ZWN1dGVzIHdoZW5ldmVyIGEga2V5ZG93biBvY2N1cnMgZnJvbSB0aGUgaW5wdXQgbGlzdGVuZXJzIHRoaXMga2V5U3RhdGVUcmFja2VyIGFkZHMgKG1vc3QgbGlrZWx5IHRvIHRoZSBkb2N1bWVudCkuJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMua2V5dXBVcGRhdGVBY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCBkb21FdmVudCA9PiB7XHJcblxyXG4gICAgICAvLyBOb3QgYWxsIGtleXMgaGF2ZSBhIGNvZGUgZm9yIHRoZSBicm93c2VyIHRvIHVzZSwgd2UgbmVlZCB0byBiZSBncmFjZWZ1bCBhbmQgZG8gbm90aGluZyBpZiB0aGVyZSBpc24ndCBvbmUuXHJcbiAgICAgIGNvbnN0IGtleSA9IEtleWJvYXJkVXRpbHMuZ2V0RXZlbnRDb2RlKCBkb21FdmVudCApO1xyXG4gICAgICBpZiAoIGtleSApIHtcclxuXHJcbiAgICAgICAgLy8gY29ycmVjdCBrZXlTdGF0ZSBpbiBjYXNlIGJyb3dzZXIgZGlkbid0IHJlY2VpdmUga2V5ZG93bi9rZXl1cCBldmVudHMgZm9yIGEgbW9kaWZpZXIga2V5XHJcbiAgICAgICAgdGhpcy5jb3JyZWN0TW9kaWZpZXJLZXlzKCBkb21FdmVudCApO1xyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdGhpcyBrZXkgZGF0YSBmcm9tIHRoZSBzdGF0ZSAtIFRoZXJlIGFyZSBtYW55IGNhc2VzIHdoZXJlIHdlIG1pZ2h0IHJlY2VpdmUgYSBrZXl1cCBiZWZvcmUga2V5ZG93biBsaWtlXHJcbiAgICAgICAgLy8gb24gZmlyc3QgdGFiIGludG8gc2NlbmVyeSBEaXNwbGF5IG9yIHdoZW4gdXNpbmcgc3BlY2lmaWMgb3BlcmF0aW5nIHN5c3RlbSBrZXlzIHdpdGggdGhlIGJyb3dzZXIgb3IgUHJ0U2NuIHNvXHJcbiAgICAgICAgLy8gYW4gYXNzZXJ0aW9uIGZvciB0aGlzIGlzIHRvbyBzdHJpY3QuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvOTE4XHJcbiAgICAgICAgaWYgKCB0aGlzLmlzS2V5RG93bigga2V5ICkgKSB7XHJcbiAgICAgICAgICBkZWxldGUgdGhpcy5rZXlTdGF0ZVsga2V5IF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBrZXl1cCBldmVudCByZWNlaXZlZCwgbm90aWZ5IGxpc3RlbmVyc1xyXG4gICAgICAgIHRoaXMua2V5dXBFbWl0dGVyLmVtaXQoIGRvbUV2ZW50ICk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAgcGhldGlvUGxheWJhY2s6IHRydWUsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAna2V5dXBVcGRhdGVBY3Rpb24nICksXHJcbiAgICAgIHBhcmFtZXRlcnM6IFsgeyBuYW1lOiAnZXZlbnQnLCBwaGV0aW9UeXBlOiBFdmVudElPIH0gXSxcclxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0FjdGlvbiB0aGF0IGV4ZWN1dGVzIHdoZW5ldmVyIGEga2V5dXAgb2NjdXJzIGZyb20gdGhlIGlucHV0IGxpc3RlbmVycyB0aGlzIGtleVN0YXRlVHJhY2tlciBhZGRzIChtb3N0IGxpa2VseSB0byB0aGUgZG9jdW1lbnQpLidcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBzdGVwTGlzdGVuZXIgPSB0aGlzLnN0ZXAuYmluZCggdGhpcyApO1xyXG4gICAgc3RlcFRpbWVyLmFkZExpc3RlbmVyKCBzdGVwTGlzdGVuZXIgKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VLZXlTdGF0ZVRyYWNrZXIgPSAoKSA9PiB7XHJcbiAgICAgIHN0ZXBUaW1lci5yZW1vdmVMaXN0ZW5lciggc3RlcExpc3RlbmVyICk7XHJcblxyXG4gICAgICBpZiAoIHRoaXMuYXR0YWNoZWRUb0RvY3VtZW50ICkge1xyXG4gICAgICAgIHRoaXMuZGV0YWNoRnJvbURvY3VtZW50KCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbXBsZW1lbnRzIGtleWJvYXJkIGRyYWdnaW5nIHdoZW4gbGlzdGVuZXIgaXMgYXR0YWNoZWQgdG8gdGhlIE5vZGUsIHB1YmxpYyBzbyBsaXN0ZW5lciBpcyBhdHRhY2hlZFxyXG4gICAqIHdpdGggYWRkSW5wdXRMaXN0ZW5lcigpLiBPbmx5IHVwZGF0ZWQgd2hlbiBlbmFibGVkLlxyXG4gICAqXHJcbiAgICogTm90ZSB0aGF0IHRoaXMgZXZlbnQgaXMgYXNzaWduZWQgaW4gdGhlIGNvbnN0cnVjdG9yLCBhbmQgbm90IHRvIHRoZSBwcm90b3R5cGUuIEFzIG9mIHdyaXRpbmcgdGhpcyxcclxuICAgKiBgTm9kZS5hZGRJbnB1dExpc3RlbmVyYCBvbmx5IHN1cHBvcnRzIHR5cGUgcHJvcGVydGllcyBhcyBldmVudCBsaXN0ZW5lcnMsIGFuZCBub3QgdGhlIGV2ZW50IGtleXMgYXNcclxuICAgKiBwcm90b3R5cGUgbWV0aG9kcy4gUGxlYXNlIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODUxIGZvciBtb3JlIGluZm9ybWF0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBrZXlkb3duVXBkYXRlKCBkb21FdmVudDogS2V5Ym9hcmRFdmVudCApOiB2b2lkIHtcclxuICAgIHRoaXMuZW5hYmxlZCAmJiB0aGlzLmtleWRvd25VcGRhdGVBY3Rpb24uZXhlY3V0ZSggZG9tRXZlbnQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vZGlmaWVyIGtleXMgbWlnaHQgYmUgcGFydCBvZiB0aGUgZG9tRXZlbnQgYnV0IHRoZSBicm93c2VyIG1heSBvciBtYXkgbm90IGhhdmUgcmVjZWl2ZWQgYSBrZXlkb3duL2tleXVwIGV2ZW50XHJcbiAgICogd2l0aCBzcGVjaWZpY2FsbHkgZm9yIHRoZSBtb2RpZmllciBrZXkuIFRoaXMgd2lsbCBhZGQgb3IgcmVtb3ZlIG1vZGlmaWVyIGtleXMgaW4gdGhhdCBjYXNlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY29ycmVjdE1vZGlmaWVyS2V5cyggZG9tRXZlbnQ6IEtleWJvYXJkRXZlbnQgKTogdm9pZCB7XHJcbiAgICBjb25zdCBrZXkgPSBLZXlib2FyZFV0aWxzLmdldEV2ZW50Q29kZSggZG9tRXZlbnQgKSE7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBrZXksICdrZXkgbm90IGZvdW5kIGZyb20gZG9tRXZlbnQnICk7XHJcblxyXG4gICAgLy8gYWRkIG1vZGlmaWVyIGtleXMgaWYgdGhleSBhcmVuJ3QgZG93blxyXG4gICAgaWYgKCBkb21FdmVudC5zaGlmdEtleSAmJiAhS2V5Ym9hcmRVdGlscy5pc1NoaWZ0S2V5KCBkb21FdmVudCApICYmICF0aGlzLnNoaWZ0S2V5RG93biApIHtcclxuICAgICAgdGhpcy5rZXlTdGF0ZVsgS2V5Ym9hcmRVdGlscy5LRVlfU0hJRlRfTEVGVCBdID0ge1xyXG4gICAgICAgIGtleURvd246IHRydWUsXHJcbiAgICAgICAga2V5OiBrZXksXHJcbiAgICAgICAgdGltZURvd246IDAgLy8gaW4gbXNcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIGlmICggZG9tRXZlbnQuYWx0S2V5ICYmICFLZXlib2FyZFV0aWxzLmlzQWx0S2V5KCBkb21FdmVudCApICYmICF0aGlzLmFsdEtleURvd24gKSB7XHJcbiAgICAgIHRoaXMua2V5U3RhdGVbIEtleWJvYXJkVXRpbHMuS0VZX0FMVF9MRUZUIF0gPSB7XHJcbiAgICAgICAga2V5RG93bjogdHJ1ZSxcclxuICAgICAgICBrZXk6IGtleSxcclxuICAgICAgICB0aW1lRG93bjogMCAvLyBpbiBtc1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gICAgaWYgKCBkb21FdmVudC5jdHJsS2V5ICYmICFLZXlib2FyZFV0aWxzLmlzQ29udHJvbEtleSggZG9tRXZlbnQgKSAmJiAhdGhpcy5jdHJsS2V5RG93biApIHtcclxuICAgICAgdGhpcy5rZXlTdGF0ZVsgS2V5Ym9hcmRVdGlscy5LRVlfQ09OVFJPTF9MRUZUIF0gPSB7XHJcbiAgICAgICAga2V5RG93bjogdHJ1ZSxcclxuICAgICAgICBrZXk6IGtleSxcclxuICAgICAgICB0aW1lRG93bjogMCAvLyBpbiBtc1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGRlbGV0ZSBtb2RpZmllciBrZXlzIGlmIHdlIHRoaW5rIHRoZXkgYXJlIGRvd25cclxuICAgIGlmICggIWRvbUV2ZW50LnNoaWZ0S2V5ICYmIHRoaXMuc2hpZnRLZXlEb3duICkge1xyXG4gICAgICBkZWxldGUgdGhpcy5rZXlTdGF0ZVsgS2V5Ym9hcmRVdGlscy5LRVlfU0hJRlRfTEVGVCBdO1xyXG4gICAgICBkZWxldGUgdGhpcy5rZXlTdGF0ZVsgS2V5Ym9hcmRVdGlscy5LRVlfU0hJRlRfUklHSFQgXTtcclxuICAgIH1cclxuICAgIGlmICggIWRvbUV2ZW50LmFsdEtleSAmJiB0aGlzLmFsdEtleURvd24gKSB7XHJcbiAgICAgIGRlbGV0ZSB0aGlzLmtleVN0YXRlWyBLZXlib2FyZFV0aWxzLktFWV9BTFRfTEVGVCBdO1xyXG4gICAgICBkZWxldGUgdGhpcy5rZXlTdGF0ZVsgS2V5Ym9hcmRVdGlscy5LRVlfQUxUX1JJR0hUIF07XHJcbiAgICB9XHJcbiAgICBpZiAoICFkb21FdmVudC5jdHJsS2V5ICYmIHRoaXMuY3RybEtleURvd24gKSB7XHJcbiAgICAgIGRlbGV0ZSB0aGlzLmtleVN0YXRlWyBLZXlib2FyZFV0aWxzLktFWV9DT05UUk9MX0xFRlQgXTtcclxuICAgICAgZGVsZXRlIHRoaXMua2V5U3RhdGVbIEtleWJvYXJkVXRpbHMuS0VZX0NPTlRST0xfUklHSFQgXTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEJlaGF2aW9yIGZvciBrZXlib2FyZCAndXAnIERPTSBldmVudC4gUHVibGljIHNvIGl0IGNhbiBiZSBhdHRhY2hlZCB3aXRoIGFkZElucHV0TGlzdGVuZXIoKS4gT25seSB1cGRhdGVkIHdoZW5cclxuICAgKiBlbmFibGVkLlxyXG4gICAqXHJcbiAgICogTm90ZSB0aGF0IHRoaXMgZXZlbnQgaXMgYXNzaWduZWQgaW4gdGhlIGNvbnN0cnVjdG9yLCBhbmQgbm90IHRvIHRoZSBwcm90b3R5cGUuIEFzIG9mIHdyaXRpbmcgdGhpcyxcclxuICAgKiBgTm9kZS5hZGRJbnB1dExpc3RlbmVyYCBvbmx5IHN1cHBvcnRzIHR5cGUgcHJvcGVydGllcyBhcyBldmVudCBsaXN0ZW5lcnMsIGFuZCBub3QgdGhlIGV2ZW50IGtleXMgYXNcclxuICAgKiBwcm90b3R5cGUgbWV0aG9kcy4gUGxlYXNlIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODUxIGZvciBtb3JlIGluZm9ybWF0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBrZXl1cFVwZGF0ZSggZG9tRXZlbnQ6IEtleWJvYXJkRXZlbnQgKTogdm9pZCB7XHJcbiAgICB0aGlzLmVuYWJsZWQgJiYgdGhpcy5rZXl1cFVwZGF0ZUFjdGlvbi5leGVjdXRlKCBkb21FdmVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIGFueSBvZiB0aGUgbW92ZW1lbnQga2V5cyBhcmUgZG93biAoYXJyb3cga2V5cyBvciBXQVNEIGtleXMpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgbW92ZW1lbnRLZXlzRG93bigpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmlzQW55S2V5SW5MaXN0RG93biggS2V5Ym9hcmRVdGlscy5NT1ZFTUVOVF9LRVlTICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBLZXlib2FyZEV2ZW50LmNvZGUgZnJvbSB0aGUgbGFzdCBrZXkgZG93biB0aGF0IHVwZGF0ZWQgdGhlIGtleXN0YXRlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRMYXN0S2V5RG93bigpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9sYXN0S2V5RG93bjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBhIGtleSB3aXRoIHRoZSBLZXlib2FyZEV2ZW50LmNvZGUgaXMgY3VycmVudGx5IGRvd24uXHJcbiAgICovXHJcbiAgcHVibGljIGlzS2V5RG93bigga2V5OiBzdHJpbmcgKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoICF0aGlzLmtleVN0YXRlWyBrZXkgXSApIHtcclxuXHJcbiAgICAgIC8vIGtleSBoYXNuJ3QgYmVlbiBwcmVzc2VkIG9uY2UgeWV0XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5rZXlTdGF0ZVsga2V5IF0ua2V5RG93bjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBhbnkgb2YgdGhlIGtleXMgaW4gdGhlIGxpc3QgYXJlIGN1cnJlbnRseSBkb3duLiBLZXlzIGFyZSB0aGUgS2V5Ym9hcmRFdmVudC5jb2RlIHN0cmluZ3MuXHJcbiAgICovXHJcbiAgcHVibGljIGlzQW55S2V5SW5MaXN0RG93bigga2V5TGlzdDogc3RyaW5nW10gKTogYm9vbGVhbiB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBrZXlMaXN0Lmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIHRoaXMuaXNLZXlEb3duKCBrZXlMaXN0WyBpIF0gKSApIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBBTEwgb2YgdGhlIGtleXMgaW4gdGhlIGxpc3QgYXJlIGN1cnJlbnRseSBkb3duLiBWYWx1ZXMgb2YgdGhlIGtleUxpc3QgYXJyYXkgYXJlIHRoZVxyXG4gICAqIEtleWJvYXJkRXZlbnQuY29kZSBmb3IgdGhlIGtleXMgeW91IGFyZSBpbnRlcmVzdGVkIGluLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhcmVLZXlzRG93bigga2V5TGlzdDogc3RyaW5nW10gKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBrZXlzRG93biA9IHRydWU7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBrZXlMaXN0Lmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoICF0aGlzLmlzS2V5RG93bigga2V5TGlzdFsgaSBdICkgKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGtleXNEb3duO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIEFMTCBrZXlzIGluIHRoZSBsaXN0IGFyZSBkb3duIGFuZCBPTkxZIHRoZSBrZXlzIGluIHRoZSBsaXN0IGFyZSBkb3duLiBWYWx1ZXMgb2Yga2V5TGlzdCBhcnJheVxyXG4gICAqIGFyZSB0aGUgS2V5Ym9hcmRFdmVudC5jb2RlIGZvciBrZXlzIHlvdSBhcmUgaW50ZXJlc3RlZCBpbiBPUiB0aGUgS2V5Ym9hcmRFdmVudC5rZXkgaW4gdGhlIHNwZWNpYWwgY2FzZSBvZlxyXG4gICAqIG1vZGlmaWVyIGtleXMuXHJcbiAgICpcclxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgYXJlS2V5c0V4Y2x1c2l2ZWx5RG93bigga2V5TGlzdDogc3RyaW5nIFtdICk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3Qga2V5U3RhdGVLZXlzID0gT2JqZWN0LmtleXMoIHRoaXMua2V5U3RhdGUgKTtcclxuXHJcbiAgICAvLyBxdWljayBzYW5pdHkgY2hlY2sgZm9yIGVxdWFsaXR5IGZpcnN0XHJcbiAgICBpZiAoIGtleVN0YXRlS2V5cy5sZW5ndGggIT09IGtleUxpc3QubGVuZ3RoICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTm93IG1ha2Ugc3VyZSB0aGF0IGV2ZXJ5IGtleSBpbiB0aGUgbGlzdCBpcyBpbiB0aGUga2V5U3RhdGVcclxuICAgIGxldCBvbmx5S2V5TGlzdERvd24gPSB0cnVlO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwga2V5TGlzdC5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgaW5pdGlhbEtleSA9IGtleUxpc3RbIGkgXTtcclxuICAgICAgbGV0IGtleXNUb0NoZWNrID0gWyBpbml0aWFsS2V5IF07XHJcblxyXG4gICAgICAvLyBJZiBhIG1vZGlmaWVyIGtleSwgbmVlZCB0byBsb29rIGZvciB0aGUgZXF1aXZhbGVudCBwYWlyIG9mIGxlZnQvcmlnaHQgS2V5Ym9hcmRFdmVudC5jb2RlcyBpbiB0aGUgbGlzdFxyXG4gICAgICAvLyBiZWNhdXNlIEtleVN0YXRlVHJhY2tlciB3b3JrcyBleGNsdXNpdmVseSB3aXRoIGNvZGVzLlxyXG4gICAgICBpZiAoIEtleWJvYXJkVXRpbHMuaXNNb2RpZmllcktleSggaW5pdGlhbEtleSApICkge1xyXG4gICAgICAgIGtleXNUb0NoZWNrID0gS2V5Ym9hcmRVdGlscy5NT0RJRklFUl9LRVlfVE9fQ09ERV9NQVAuZ2V0KCBpbml0aWFsS2V5ICkhO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIF8uaW50ZXJzZWN0aW9uKCBrZXlTdGF0ZUtleXMsIGtleXNUb0NoZWNrICkubGVuZ3RoID09PSAwICkge1xyXG4gICAgICAgIG9ubHlLZXlMaXN0RG93biA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG9ubHlLZXlMaXN0RG93bjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBhbnkga2V5cyBhcmUgZG93biBhY2NvcmRpbmcgdG8gdGVoIGtleVN0YXRlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBrZXlzQXJlRG93bigpOiBib29sZWFuIHtcclxuICAgIHJldHVybiBPYmplY3Qua2V5cyggdGhpcy5rZXlTdGF0ZSApLmxlbmd0aCA+IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIFwiRW50ZXJcIiBrZXkgaXMgY3VycmVudGx5IGRvd24uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBlbnRlcktleURvd24oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5pc0tleURvd24oIEtleWJvYXJkVXRpbHMuS0VZX0VOVEVSICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNoaWZ0IGtleSBpcyBjdXJyZW50bHkgZG93bi5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IHNoaWZ0S2V5RG93bigpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmlzQW55S2V5SW5MaXN0RG93biggS2V5Ym9hcmRVdGlscy5TSElGVF9LRVlTICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGFsdCBrZXkgaXMgY3VycmVudGx5IGRvd24uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBhbHRLZXlEb3duKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuaXNBbnlLZXlJbkxpc3REb3duKCBLZXlib2FyZFV0aWxzLkFMVF9LRVlTICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGNvbnRyb2wga2V5IGlzIGN1cnJlbnRseSBkb3duLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgY3RybEtleURvd24oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5pc0FueUtleUluTGlzdERvd24oIEtleWJvYXJkVXRpbHMuQ09OVFJPTF9LRVlTICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBhbW91bnQgb2YgdGltZSB0aGF0IHRoZSBwcm92aWRlZCBrZXkgaGFzIGJlZW4gaGVsZCBkb3duLiBFcnJvciBpZiB0aGUga2V5IGlzIG5vdCBjdXJyZW50bHkgZG93bi5cclxuICAgKiBAcGFyYW0ga2V5IC0gS2V5Ym9hcmRFdmVudC5jb2RlIGZvciB0aGUga2V5IHlvdSBhcmUgaW5zcGVjdGluZy5cclxuICAgKi9cclxuICBwdWJsaWMgdGltZURvd25Gb3JLZXkoIGtleTogc3RyaW5nICk6IG51bWJlciB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzS2V5RG93bigga2V5ICksICdjYW5ub3QgZ2V0IHRpbWVEb3duIG9uIGEga2V5IHRoYXQgaXMgbm90IHByZXNzZWQgZG93bicgKTtcclxuICAgIHJldHVybiB0aGlzLmtleVN0YXRlWyBrZXkgXS50aW1lRG93bjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFyIHRoZSBlbnRpcmUgc3RhdGUgb2YgdGhlIGtleSB0cmFja2VyLCBiYXNpY2FsbHkgcmVzdGFydGluZyB0aGUgdHJhY2tlci5cclxuICAgKi9cclxuICBwdWJsaWMgY2xlYXJTdGF0ZSgpOiB2b2lkIHtcclxuICAgIHRoaXMua2V5U3RhdGUgPSB7fTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXAgZnVuY3Rpb24gZm9yIHRoZSB0cmFja2VyLiBKYXZhU2NyaXB0IGRvZXMgbm90IG5hdGl2ZWx5IGhhbmRsZSBtdWx0aXBsZSBrZXlkb3duIGV2ZW50cyBhdCBvbmNlLFxyXG4gICAqIHNvIHdlIG5lZWQgdG8gdHJhY2sgdGhlIHN0YXRlIG9mIHRoZSBrZXlib2FyZCBpbiBhbiBPYmplY3QgYW5kIG1hbmFnZSBkcmFnZ2luZyBpbiB0aGlzIGZ1bmN0aW9uLlxyXG4gICAqIEluIG9yZGVyIGZvciB0aGUgZHJhZyBoYW5kbGVyIHRvIHdvcmsuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZHQgLSB0aW1lIGluIHNlY29uZHMgdGhhdCBoYXMgcGFzc2VkIHNpbmNlIHRoZSBsYXN0IHVwZGF0ZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBuby1vcCB1bmxlc3MgYSBrZXkgaXMgZG93blxyXG4gICAgaWYgKCB0aGlzLmtleXNBcmVEb3duKCkgKSB7XHJcbiAgICAgIGNvbnN0IG1zID0gZHQgKiAxMDAwO1xyXG5cclxuICAgICAgLy8gZm9yIGVhY2gga2V5IHRoYXQgaXMgc3RpbGwgZG93biwgaW5jcmVtZW50IHRoZSB0cmFja2VkIHRpbWUgdGhhdCBoYXMgYmVlbiBkb3duXHJcbiAgICAgIGZvciAoIGNvbnN0IGkgaW4gdGhpcy5rZXlTdGF0ZSApIHtcclxuICAgICAgICBpZiAoIHRoaXMua2V5U3RhdGUuaGFzT3duUHJvcGVydHkoIGkgKSApIHtcclxuICAgICAgICAgIGlmICggdGhpcy5rZXlTdGF0ZVsgaSBdLmtleURvd24gKSB7XHJcbiAgICAgICAgICAgIHRoaXMua2V5U3RhdGVbIGkgXS50aW1lRG93biArPSBtcztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCB0aGlzIEtleVN0YXRlVHJhY2tlciB0byB0aGUgd2luZG93IHNvIHRoYXQgaXQgdXBkYXRlcyB3aGVuZXZlciB0aGUgZG9jdW1lbnQgcmVjZWl2ZXMga2V5IGV2ZW50cy4gVGhpcyBpc1xyXG4gICAqIHVzZWZ1bCBpZiB5b3Ugd2FudCB0byBvYnNlcnZlIGtleSBwcmVzc2VzIHdoaWxlIERPTSBmb2N1cyBub3Qgd2l0aGluIHRoZSBQRE9NIHJvb3QuXHJcbiAgICovXHJcbiAgcHVibGljIGF0dGFjaFRvV2luZG93KCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuYXR0YWNoZWRUb0RvY3VtZW50LCAnS2V5U3RhdGVUcmFja2VyIGlzIGFscmVhZHkgYXR0YWNoZWQgdG8gZG9jdW1lbnQuJyApO1xyXG5cclxuICAgIHRoaXMuZG9jdW1lbnRLZXlkb3duTGlzdGVuZXIgPSBldmVudCA9PiB7XHJcbiAgICAgIHRoaXMua2V5ZG93blVwZGF0ZSggZXZlbnQgKTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5kb2N1bWVudEtleXVwTGlzdGVuZXIgPSBldmVudCA9PiB7XHJcbiAgICAgIHRoaXMua2V5dXBVcGRhdGUoIGV2ZW50ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGFkZExpc3RlbmVyc1RvRG9jdW1lbnQgPSAoKSA9PiB7XHJcblxyXG4gICAgICAvLyBhdHRhY2ggd2l0aCB1c2VDYXB0dXJlIHNvIHRoYXQgdGhlIGtleVN0YXRlVHJhY2tlciBpcyB1cGRhdGVkIGJlZm9yZSB0aGUgZXZlbnRzIGRpc3BhdGNoIHdpdGhpbiBTY2VuZXJ5XHJcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5dXAnLCB0aGlzLmRvY3VtZW50S2V5dXBMaXN0ZW5lciEsIHsgY2FwdHVyZTogdHJ1ZSB9ICk7XHJcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIHRoaXMuZG9jdW1lbnRLZXlkb3duTGlzdGVuZXIhLCB7IGNhcHR1cmU6IHRydWUgfSApO1xyXG4gICAgICB0aGlzLmF0dGFjaGVkVG9Eb2N1bWVudCA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIGlmICggIWRvY3VtZW50ICkge1xyXG5cclxuICAgICAgLy8gYXR0YWNoIGxpc3RlbmVycyBvbiB3aW5kb3cgbG9hZCB0byBlbnN1cmUgdGhhdCB0aGUgZG9jdW1lbnQgaXMgZGVmaW5lZFxyXG4gICAgICBjb25zdCBsb2FkTGlzdGVuZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgYWRkTGlzdGVuZXJzVG9Eb2N1bWVudCgpO1xyXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbG9hZCcsIGxvYWRMaXN0ZW5lciApO1xyXG4gICAgICB9O1xyXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCBsb2FkTGlzdGVuZXIgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gZG9jdW1lbnQgaXMgZGVmaW5lZCBhbmQgd2Ugd29uJ3QgZ2V0IGFub3RoZXIgbG9hZCBldmVudCBzbyBhdHRhY2ggcmlnaHQgYXdheVxyXG4gICAgICBhZGRMaXN0ZW5lcnNUb0RvY3VtZW50KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgS2V5U3RhdGUgaXMgY2xlYXJlZCB3aGVuIHRoZSB0cmFja2VyIGlzIGRpc2FibGVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRFbmFibGVkKCBlbmFibGVkOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgaWYgKCB0aGlzLl9lbmFibGVkICE9PSBlbmFibGVkICkge1xyXG4gICAgICB0aGlzLl9lbmFibGVkID0gZW5hYmxlZDtcclxuXHJcbiAgICAgIC8vIGNsZWFyIHN0YXRlIHdoZW4gZGlzYWJsZWRcclxuICAgICAgIWVuYWJsZWQgJiYgdGhpcy5jbGVhclN0YXRlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGVuYWJsZWQoIGVuYWJsZWQ6IGJvb2xlYW4gKSB7IHRoaXMuc2V0RW5hYmxlZCggZW5hYmxlZCApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgZW5hYmxlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuaXNFbmFibGVkKCk7IH1cclxuXHJcbiAgcHVibGljIGlzRW5hYmxlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX2VuYWJsZWQ7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0YWNoIGxpc3RlbmVycyBmcm9tIHRoZSBkb2N1bWVudCB0aGF0IHdvdWxkIHVwZGF0ZSB0aGUgc3RhdGUgb2YgdGhpcyBLZXlTdGF0ZVRyYWNrZXIgb24ga2V5IHByZXNzZXMuXHJcbiAgICovXHJcbiAgcHVibGljIGRldGFjaEZyb21Eb2N1bWVudCgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYXR0YWNoZWRUb0RvY3VtZW50LCAnS2V5U3RhdGVUcmFja2VyIGlzIG5vdCBhdHRhY2hlZCB0byB3aW5kb3cuJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5kb2N1bWVudEtleXVwTGlzdGVuZXIsICdrZXl1cCBsaXN0ZW5lciB3YXMgbm90IGNyZWF0ZWQgb3IgYXR0YWNoZWQgdG8gd2luZG93JyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5kb2N1bWVudEtleWRvd25MaXN0ZW5lciwgJ2tleWRvd24gbGlzdGVuZXIgd2FzIG5vdCBjcmVhdGVkIG9yIGF0dGFjaGVkIHRvIHdpbmRvdy4nICk7XHJcblxyXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdrZXl1cCcsIHRoaXMuZG9jdW1lbnRLZXl1cExpc3RlbmVyISApO1xyXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgdGhpcy5kb2N1bWVudEtleWRvd25MaXN0ZW5lciEgKTtcclxuXHJcbiAgICB0aGlzLmRvY3VtZW50S2V5dXBMaXN0ZW5lciA9IG51bGw7XHJcbiAgICB0aGlzLmRvY3VtZW50S2V5ZG93bkxpc3RlbmVyID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmF0dGFjaGVkVG9Eb2N1bWVudCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VLZXlTdGF0ZVRyYWNrZXIoKTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdLZXlTdGF0ZVRyYWNrZXInLCBLZXlTdGF0ZVRyYWNrZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgS2V5U3RhdGVUcmFja2VyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFlBQVksTUFBTSxvQ0FBb0M7QUFDN0QsT0FBT0MsT0FBTyxNQUFNLDZCQUE2QjtBQUNqRCxPQUFPQyxTQUFTLE1BQU0sK0JBQStCO0FBQ3JELE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxTQUFTQyxPQUFPLEVBQUVDLGFBQWEsRUFBRUMsT0FBTyxRQUFRLGVBQWU7QUFDL0QsT0FBT0MsU0FBUyxNQUFNLG9DQUFvQzs7QUFLMUQ7O0FBYUE7O0FBS0EsTUFBTUMsZUFBZSxDQUFDO0VBRXBCO0VBQ0E7RUFDUUMsUUFBUSxHQUFhLENBQUMsQ0FBQzs7RUFFL0I7RUFDUUMsWUFBWSxHQUFrQixJQUFJOztFQUUxQztFQUNRQyxrQkFBa0IsR0FBRyxLQUFLOztFQUVsQztFQUNRQyxxQkFBcUIsR0FBZ0QsSUFBSTtFQUN6RUMsdUJBQXVCLEdBQWdELElBQUk7O0VBRW5GO0VBQ1FDLFFBQVEsR0FBRyxJQUFJOztFQUV2QjtFQUNBO0VBQ2dCQyxjQUFjLEdBQWdDLElBQUlmLE9BQU8sQ0FBRTtJQUFFZ0IsVUFBVSxFQUFFLENBQUU7TUFBRUMsU0FBUyxFQUFFQztJQUFjLENBQUM7RUFBRyxDQUFFLENBQUM7RUFDN0dDLFlBQVksR0FBZ0Ms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