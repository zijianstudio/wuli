// Copyright 2022-2023, University of Colorado Boulder

/**
 * A listener for general keyboard input. Specify the keys with a `keys` option in a readable format that looks like
 * this: [ 'shift+t', 'alt+shift+r' ]
 *
 * - Each entry in the array represents a "group" of keys.
 * - '+' separates each key in a single group.
 * - The keys leading up to the last key in the group are considered "modifier" keys. The last key in the group needs
 *   to be pressed while the modifier keys are down.
 * - The order modifier keys are pressed does not matter for firing the callback.
 *
 * In the above example "shift+t" OR "alt+shift+r" will fire the callback when pressed.
 *
 * An example usage would like this:
 *
 * this.addInputListener( new KeyboardListener( {
 *   keys: [ 'a+b', 'a+c', 'shift+arrowLeft', 'alt+g+t', 'ctrl+3', 'alt+ctrl+t' ],
 *   callback: ( event, listener ) => {
 *     const keysPressed = listener.keysPressed;
 *
 *     if ( keysPressed === 'a+b' ) {
 *       console.log( 'you just pressed a+b!' );
 *     }
 *     else if ( keysPressed === 'a+c' ) {
 *       console.log( 'you just pressed a+c!' );
 *     }
 *     else if ( keysPressed === 'alt+g+t' ) {
 *       console.log( 'you just pressed alt+g+t' );
 *     }
 *     else if ( keysPressed === 'ctrl+3' ) {
 *       console.log( 'you just pressed ctrl+3' );
 *     }
 *     else if ( keysPressed === 'shift+arrowLeft' ) {
 *       console.log( 'you just pressed shift+arrowLeft' );
 *     }
 *   }
 * } ) );
 *
 * By default the callback will fire when the last key is pressed down. See additional options for firing on key
 * up or other press and hold behavior.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import CallbackTimer from '../../../axon/js/CallbackTimer.js';
import optionize from '../../../phet-core/js/optionize.js';
import { EnglishStringToCodeMap, FocusManager, globalKeyStateTracker, scenery } from '../imports.js';
import KeyboardUtils from '../accessibility/KeyboardUtils.js';

// NOTE: The typing for ModifierKey and OneKeyStroke is limited TypeScript, there is a limitation to the number of
//       entries in a union type. If that limitation is not acceptable remove this typing. OR maybe TypeScript will
//       someday support regex patterns for a type. See https://github.com/microsoft/TypeScript/issues/41160
// If we run out of union space for template strings, consider the above comment or remove some from the type.
// These combinations are not supported by TypeScript: "TS2590: Expression produces a union type that is too complex to
// represent." See above note and https://github.com/microsoft/TypeScript/issues/41160#issuecomment-1287271132.
// `${AllowedKeys}+${AllowedKeys}+${AllowedKeys}+${AllowedKeys}`;
// type KeyCombinations = `${OneKeyStroke}` | `${OneKeyStroke},${OneKeyStroke}`;
// Possible input types that decide when the callbacks of this listener should fire.
// - 'up': Callbacks fire on release of keys.
// - 'down': Callbacks fire on press of keys.
// - 'both': Callbacks fire on both press and release of keys.
class KeyboardListener {
  // The function called when a KeyGroup is pressed (or just released). Provides the SceneryEvent that fired the input
  // listeners and this the keys that were pressed from the active KeyGroup. The event may be null when using
  // fireOnHold or in cases of cancel or interrupt.

  // The optional function called when this listener is cancelled.

  // When callbacks are fired in response to input. Could be on keys pressed down, up, or both.

  // Does the listener fire the callback continuously when keys are held down?

  // (scenery-internal) All the KeyGroups of this listener from the keys provided in natural language.

  // All the KeyGroups that are currently firing

  // Current keys pressed that are having their listeners fired now.
  keysPressed = null;

  // True when keys are pressed down. If listenerFireTrigger is 'both', you can look at this in your callback to
  // determine if keys are pressed or released.
  // Timing variables for the CallbackTimers.
  // see options documentation
  constructor(providedOptions) {
    const options = optionize()({
      callback: _.noop,
      cancel: _.noop,
      global: false,
      capture: false,
      handle: false,
      abort: false,
      listenerFireTrigger: 'down',
      fireOnHold: false,
      fireOnHoldDelay: 400,
      fireOnHoldInterval: 100,
      allowOtherKeys: false
    }, providedOptions);
    this._callback = options.callback;
    this._cancel = options.cancel;
    this._listenerFireTrigger = options.listenerFireTrigger;
    this._fireOnHold = options.fireOnHold;
    this._fireOnHoldDelay = options.fireOnHoldDelay;
    this._fireOnHoldInterval = options.fireOnHoldInterval;
    this._allowOtherKeys = options.allowOtherKeys;
    this._activeKeyGroups = [];
    this.keysDown = false;
    this._global = options.global;
    this._handle = options.handle;
    this._abort = options.abort;

    // convert the provided keys to data that we can respond to with scenery's Input system
    this._keyGroups = this.convertKeysToKeyGroups(options.keys);
    this.listener = this;
    this.capture = options.capture;
    this._windowFocusListener = this.handleWindowFocusChange.bind(this);
    FocusManager.windowHasFocusProperty.link(this._windowFocusListener);
  }

  /**
   * Mostly required to fire with CallbackTimer since the callback cannot take arguments.
   */
  fireCallback(event, keyGroup) {
    this.keysPressed = keyGroup.naturalKeys;
    this._callback(event, this);
    this.keysPressed = null;
  }

  /**
   * Part of the scenery listener API. Responding to a keydown event, update active KeyGroups and potentially
   * fire callbacks and start CallbackTimers.
   */
  handleKeyDown(event) {
    if (this._listenerFireTrigger === 'down' || this._listenerFireTrigger === 'both') {
      // modifier keys can be pressed in any order but the last key in the group must be pressed last
      this._keyGroups.forEach(keyGroup => {
        if (!this._activeKeyGroups.includes(keyGroup)) {
          if (this.areKeysDownForListener(keyGroup.allKeys) && KeyboardUtils.areKeysEquivalent(keyGroup.key, globalKeyStateTracker.getLastKeyDown())) {
            this._activeKeyGroups.push(keyGroup);
            this.keysDown = true;
            if (keyGroup.timer) {
              keyGroup.timer.start();
            }
            this.fireCallback(event, keyGroup);
          }
        }
      });
    }
    this.manageEvent(event);
  }

  /**
   * If there are any active KeyGroup firing stop and remove if KeyGroup keys are no longer down. Also, potentially
   * fires a KeyGroup if the key that was released has all other modifier keys down.
   */
  handleKeyUp(event) {
    if (this._activeKeyGroups.length > 0) {
      this._activeKeyGroups.forEach((activeKeyGroup, index) => {
        if (!this.areKeysDownForListener(activeKeyGroup.allKeys)) {
          if (activeKeyGroup.timer) {
            activeKeyGroup.timer.stop(false);
          }
          this._activeKeyGroups.splice(index, 1);
        }
      });
    }
    if (this._listenerFireTrigger === 'up' || this._listenerFireTrigger === 'both') {
      const eventCode = KeyboardUtils.getEventCode(event.domEvent);

      // Screen readers may send key events with no code for unknown reasons, we need to be graceful when that
      // happens, see https://github.com/phetsims/scenery/issues/1534.
      if (eventCode) {
        this._keyGroups.forEach(keyGroup => {
          if (this.areKeysDownForListener(keyGroup.modifierKeys) && KeyboardUtils.areKeysEquivalent(keyGroup.key, eventCode)) {
            this.keysDown = false;
            this.fireCallback(event, keyGroup);
          }
        });
      }
    }
    this.manageEvent(event);
  }

  /**
   * Are the provided keys currently pressed in a way that should start or stop firing callbacks? If this listener
   * allows other keys to be pressed, returns true if the keys are down. If not, it returns true if ONLY the
   * provided keys are down.
   */
  areKeysDownForListener(keys) {
    return this._allowOtherKeys ? globalKeyStateTracker.areKeysDown(keys) : globalKeyStateTracker.areKeysExclusivelyDown(keys);
  }

  /**
   * In response to every SceneryEvent, handle and/or abort depending on listener options. This cannot be done in
   * the callbacks because press-and-hold behavior triggers many keydown events. We need to handle/abort each, not
   * just the event that triggered the callback. Also, callbacks can be called without a SceneryEvent from the
   * CallbackTimer.
   */
  manageEvent(event) {
    this._handle && event.handle();
    this._abort && event.abort();
  }

  /**
   * This is part of the scenery Input API (implementing TInputListener). Handle the keydown event when not
   * added to the global key events. Target will be the Node, Display, or Pointer this listener was added to.
   */
  keydown(event) {
    if (!this._global) {
      this.handleKeyDown(event);
    }
  }

  /**
   * This is part of the scenery Input API (implementing TInputListener). Handle the keyup event when not
   * added to the global key events. Target will be the Node, Display, or Pointer this listener was added to.
   */
  keyup(event) {
    if (!this._global) {
      this.handleKeyUp(event);
    }
  }

  /**
   * This is part of the scenery Input API (implementing TInputListener). Handle the global keydown event.
   * Event has no target.
   */
  globalkeydown(event) {
    if (this._global) {
      this.handleKeyDown(event);
    }
  }

  /**
   * This is part of the scenery Input API (implementing TInputListener). Handle the global keyup event.
   * Event has no target.
   */
  globalkeyup(event) {
    if (this._global) {
      this.handleKeyUp(event);
    }
  }

  /**
   * Work to be done on both cancel and interrupt.
   */
  handleCancel() {
    this.clearActiveKeyGroups();
    this._cancel(this);
  }

  /**
   * When the window loses focus, cancel.
   */
  handleWindowFocusChange(windowHasFocus) {
    if (!windowHasFocus) {
      this.handleCancel();
    }
  }

  /**
   * Part of the scenery listener API. On cancel, clear active KeyGroups and stop their behavior.
   */
  cancel() {
    this.handleCancel();
  }

  /**
   * Part of the scenery listener API. Clear active KeyGroups and stop their callbacks.
   */
  interrupt() {
    this.handleCancel();
  }

  /**
   * Dispose of this listener by disposing of any Callback timers. Then clear all KeyGroups.
   */
  dispose() {
    this._keyGroups.forEach(activeKeyGroup => {
      activeKeyGroup.timer && activeKeyGroup.timer.dispose();
    });
    this._keyGroups.length = 0;
    FocusManager.windowHasFocusProperty.unlink(this._windowFocusListener);
  }

  /**
   * Clear the active KeyGroups on this listener. Stopping any active groups if they use a CallbackTimer.
   */
  clearActiveKeyGroups() {
    this._activeKeyGroups.forEach(activeKeyGroup => {
      activeKeyGroup.timer && activeKeyGroup.timer.stop(false);
    });
    this._activeKeyGroups.length = 0;
  }

  /**
   * Converts the provided keys into a collection of KeyGroups to easily track what keys are down. For example,
   * will take a string that defines the keys for this listener like 'a+c|1+2+3+4|shift+leftArrow' and return an array
   * with three KeyGroups, one describing 'a+c', one describing '1+2+3+4' and one describing 'shift+leftArrow'.
   */
  convertKeysToKeyGroups(keys) {
    const keyGroups = keys.map(naturalKeys => {
      // all of the keys in this group in an array
      const groupKeys = naturalKeys.split('+');
      assert && assert(groupKeys.length > 0, 'no keys provided?');
      const naturalKey = groupKeys.slice(-1)[0];
      const key = EnglishStringToCodeMap[naturalKey];
      assert && assert(key, `Key not found, do you need to add it to EnglishStringToCodeMap? ${naturalKey}`);
      let modifierKeys = [];
      if (groupKeys.length > 1) {
        modifierKeys = groupKeys.slice(0, groupKeys.length - 1).map(naturalModifierKey => {
          const modifierKey = EnglishStringToCodeMap[naturalModifierKey];
          assert && assert(modifierKey, `Key not found, do you need to add it to EnglishStringToCodeMap? ${naturalModifierKey}`);
          return modifierKey;
        });
      }

      // Set up the timer for triggering callbacks if this listener supports press and hold behavior
      const timer = this._fireOnHold ? new CallbackTimer({
        callback: () => this.fireCallback(null, keyGroup),
        delay: this._fireOnHoldDelay,
        interval: this._fireOnHoldInterval
      }) : null;
      const keyGroup = {
        key: key,
        modifierKeys: modifierKeys,
        naturalKeys: naturalKeys,
        allKeys: modifierKeys.concat(key),
        timer: timer
      };
      return keyGroup;
    });
    return keyGroups;
  }
}
scenery.register('KeyboardListener', KeyboardListener);
export default KeyboardListener;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDYWxsYmFja1RpbWVyIiwib3B0aW9uaXplIiwiRW5nbGlzaFN0cmluZ1RvQ29kZU1hcCIsIkZvY3VzTWFuYWdlciIsImdsb2JhbEtleVN0YXRlVHJhY2tlciIsInNjZW5lcnkiLCJLZXlib2FyZFV0aWxzIiwiS2V5Ym9hcmRMaXN0ZW5lciIsImtleXNQcmVzc2VkIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiY2FsbGJhY2siLCJfIiwibm9vcCIsImNhbmNlbCIsImdsb2JhbCIsImNhcHR1cmUiLCJoYW5kbGUiLCJhYm9ydCIsImxpc3RlbmVyRmlyZVRyaWdnZXIiLCJmaXJlT25Ib2xkIiwiZmlyZU9uSG9sZERlbGF5IiwiZmlyZU9uSG9sZEludGVydmFsIiwiYWxsb3dPdGhlcktleXMiLCJfY2FsbGJhY2siLCJfY2FuY2VsIiwiX2xpc3RlbmVyRmlyZVRyaWdnZXIiLCJfZmlyZU9uSG9sZCIsIl9maXJlT25Ib2xkRGVsYXkiLCJfZmlyZU9uSG9sZEludGVydmFsIiwiX2FsbG93T3RoZXJLZXlzIiwiX2FjdGl2ZUtleUdyb3VwcyIsImtleXNEb3duIiwiX2dsb2JhbCIsIl9oYW5kbGUiLCJfYWJvcnQiLCJfa2V5R3JvdXBzIiwiY29udmVydEtleXNUb0tleUdyb3VwcyIsImtleXMiLCJsaXN0ZW5lciIsIl93aW5kb3dGb2N1c0xpc3RlbmVyIiwiaGFuZGxlV2luZG93Rm9jdXNDaGFuZ2UiLCJiaW5kIiwid2luZG93SGFzRm9jdXNQcm9wZXJ0eSIsImxpbmsiLCJmaXJlQ2FsbGJhY2siLCJldmVudCIsImtleUdyb3VwIiwibmF0dXJhbEtleXMiLCJoYW5kbGVLZXlEb3duIiwiZm9yRWFjaCIsImluY2x1ZGVzIiwiYXJlS2V5c0Rvd25Gb3JMaXN0ZW5lciIsImFsbEtleXMiLCJhcmVLZXlzRXF1aXZhbGVudCIsImtleSIsImdldExhc3RLZXlEb3duIiwicHVzaCIsInRpbWVyIiwic3RhcnQiLCJtYW5hZ2VFdmVudCIsImhhbmRsZUtleVVwIiwibGVuZ3RoIiwiYWN0aXZlS2V5R3JvdXAiLCJpbmRleCIsInN0b3AiLCJzcGxpY2UiLCJldmVudENvZGUiLCJnZXRFdmVudENvZGUiLCJkb21FdmVudCIsIm1vZGlmaWVyS2V5cyIsImFyZUtleXNEb3duIiwiYXJlS2V5c0V4Y2x1c2l2ZWx5RG93biIsImtleWRvd24iLCJrZXl1cCIsImdsb2JhbGtleWRvd24iLCJnbG9iYWxrZXl1cCIsImhhbmRsZUNhbmNlbCIsImNsZWFyQWN0aXZlS2V5R3JvdXBzIiwid2luZG93SGFzRm9jdXMiLCJpbnRlcnJ1cHQiLCJkaXNwb3NlIiwidW5saW5rIiwia2V5R3JvdXBzIiwibWFwIiwiZ3JvdXBLZXlzIiwic3BsaXQiLCJhc3NlcnQiLCJuYXR1cmFsS2V5Iiwic2xpY2UiLCJuYXR1cmFsTW9kaWZpZXJLZXkiLCJtb2RpZmllcktleSIsImRlbGF5IiwiaW50ZXJ2YWwiLCJjb25jYXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIktleWJvYXJkTGlzdGVuZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBsaXN0ZW5lciBmb3IgZ2VuZXJhbCBrZXlib2FyZCBpbnB1dC4gU3BlY2lmeSB0aGUga2V5cyB3aXRoIGEgYGtleXNgIG9wdGlvbiBpbiBhIHJlYWRhYmxlIGZvcm1hdCB0aGF0IGxvb2tzIGxpa2VcclxuICogdGhpczogWyAnc2hpZnQrdCcsICdhbHQrc2hpZnQrcicgXVxyXG4gKlxyXG4gKiAtIEVhY2ggZW50cnkgaW4gdGhlIGFycmF5IHJlcHJlc2VudHMgYSBcImdyb3VwXCIgb2Yga2V5cy5cclxuICogLSAnKycgc2VwYXJhdGVzIGVhY2gga2V5IGluIGEgc2luZ2xlIGdyb3VwLlxyXG4gKiAtIFRoZSBrZXlzIGxlYWRpbmcgdXAgdG8gdGhlIGxhc3Qga2V5IGluIHRoZSBncm91cCBhcmUgY29uc2lkZXJlZCBcIm1vZGlmaWVyXCIga2V5cy4gVGhlIGxhc3Qga2V5IGluIHRoZSBncm91cCBuZWVkc1xyXG4gKiAgIHRvIGJlIHByZXNzZWQgd2hpbGUgdGhlIG1vZGlmaWVyIGtleXMgYXJlIGRvd24uXHJcbiAqIC0gVGhlIG9yZGVyIG1vZGlmaWVyIGtleXMgYXJlIHByZXNzZWQgZG9lcyBub3QgbWF0dGVyIGZvciBmaXJpbmcgdGhlIGNhbGxiYWNrLlxyXG4gKlxyXG4gKiBJbiB0aGUgYWJvdmUgZXhhbXBsZSBcInNoaWZ0K3RcIiBPUiBcImFsdCtzaGlmdCtyXCIgd2lsbCBmaXJlIHRoZSBjYWxsYmFjayB3aGVuIHByZXNzZWQuXHJcbiAqXHJcbiAqIEFuIGV4YW1wbGUgdXNhZ2Ugd291bGQgbGlrZSB0aGlzOlxyXG4gKlxyXG4gKiB0aGlzLmFkZElucHV0TGlzdGVuZXIoIG5ldyBLZXlib2FyZExpc3RlbmVyKCB7XHJcbiAqICAga2V5czogWyAnYStiJywgJ2ErYycsICdzaGlmdCthcnJvd0xlZnQnLCAnYWx0K2crdCcsICdjdHJsKzMnLCAnYWx0K2N0cmwrdCcgXSxcclxuICogICBjYWxsYmFjazogKCBldmVudCwgbGlzdGVuZXIgKSA9PiB7XHJcbiAqICAgICBjb25zdCBrZXlzUHJlc3NlZCA9IGxpc3RlbmVyLmtleXNQcmVzc2VkO1xyXG4gKlxyXG4gKiAgICAgaWYgKCBrZXlzUHJlc3NlZCA9PT0gJ2ErYicgKSB7XHJcbiAqICAgICAgIGNvbnNvbGUubG9nKCAneW91IGp1c3QgcHJlc3NlZCBhK2IhJyApO1xyXG4gKiAgICAgfVxyXG4gKiAgICAgZWxzZSBpZiAoIGtleXNQcmVzc2VkID09PSAnYStjJyApIHtcclxuICogICAgICAgY29uc29sZS5sb2coICd5b3UganVzdCBwcmVzc2VkIGErYyEnICk7XHJcbiAqICAgICB9XHJcbiAqICAgICBlbHNlIGlmICgga2V5c1ByZXNzZWQgPT09ICdhbHQrZyt0JyApIHtcclxuICogICAgICAgY29uc29sZS5sb2coICd5b3UganVzdCBwcmVzc2VkIGFsdCtnK3QnICk7XHJcbiAqICAgICB9XHJcbiAqICAgICBlbHNlIGlmICgga2V5c1ByZXNzZWQgPT09ICdjdHJsKzMnICkge1xyXG4gKiAgICAgICBjb25zb2xlLmxvZyggJ3lvdSBqdXN0IHByZXNzZWQgY3RybCszJyApO1xyXG4gKiAgICAgfVxyXG4gKiAgICAgZWxzZSBpZiAoIGtleXNQcmVzc2VkID09PSAnc2hpZnQrYXJyb3dMZWZ0JyApIHtcclxuICogICAgICAgY29uc29sZS5sb2coICd5b3UganVzdCBwcmVzc2VkIHNoaWZ0K2Fycm93TGVmdCcgKTtcclxuICogICAgIH1cclxuICogICB9XHJcbiAqIH0gKSApO1xyXG4gKlxyXG4gKiBCeSBkZWZhdWx0IHRoZSBjYWxsYmFjayB3aWxsIGZpcmUgd2hlbiB0aGUgbGFzdCBrZXkgaXMgcHJlc3NlZCBkb3duLiBTZWUgYWRkaXRpb25hbCBvcHRpb25zIGZvciBmaXJpbmcgb24ga2V5XHJcbiAqIHVwIG9yIG90aGVyIHByZXNzIGFuZCBob2xkIGJlaGF2aW9yLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQ2FsbGJhY2tUaW1lciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0NhbGxiYWNrVGltZXIuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgeyBFbmdsaXNoU3RyaW5nVG9Db2RlTWFwLCBGb2N1c01hbmFnZXIsIGdsb2JhbEtleVN0YXRlVHJhY2tlciwgc2NlbmVyeSwgU2NlbmVyeUV2ZW50LCBUSW5wdXRMaXN0ZW5lciB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgS2V5Ym9hcmRVdGlscyBmcm9tICcuLi9hY2Nlc3NpYmlsaXR5L0tleWJvYXJkVXRpbHMuanMnO1xyXG5cclxuLy8gTk9URTogVGhlIHR5cGluZyBmb3IgTW9kaWZpZXJLZXkgYW5kIE9uZUtleVN0cm9rZSBpcyBsaW1pdGVkIFR5cGVTY3JpcHQsIHRoZXJlIGlzIGEgbGltaXRhdGlvbiB0byB0aGUgbnVtYmVyIG9mXHJcbi8vICAgICAgIGVudHJpZXMgaW4gYSB1bmlvbiB0eXBlLiBJZiB0aGF0IGxpbWl0YXRpb24gaXMgbm90IGFjY2VwdGFibGUgcmVtb3ZlIHRoaXMgdHlwaW5nLiBPUiBtYXliZSBUeXBlU2NyaXB0IHdpbGxcclxuLy8gICAgICAgc29tZWRheSBzdXBwb3J0IHJlZ2V4IHBhdHRlcm5zIGZvciBhIHR5cGUuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzQxMTYwXHJcbi8vIElmIHdlIHJ1biBvdXQgb2YgdW5pb24gc3BhY2UgZm9yIHRlbXBsYXRlIHN0cmluZ3MsIGNvbnNpZGVyIHRoZSBhYm92ZSBjb21tZW50IG9yIHJlbW92ZSBzb21lIGZyb20gdGhlIHR5cGUuXHJcbnR5cGUgTW9kaWZpZXJLZXkgPSAncScgfCAndycgfCAnZScgfCAncicgfCAndCcgfCAneScgfCAndScgfCAnaScgfCAnbycgfCAncCcgfCAnYScgfCAncycgfCAnZCcgfFxyXG4gICdmJyB8ICdnJyB8ICdoJyB8ICdqJyB8ICdrJyB8ICdsJyB8ICd6JyB8ICd4JyB8ICdjJyB8XHJcbiAgJ3YnIHwgJ2InIHwgJ24nIHwgJ20nIHwgJ2N0cmwnIHwgJ2FsdCcgfCAnc2hpZnQnIHwgJ3RhYic7XHJcbnR5cGUgQWxsb3dlZEtleXMgPSBrZXlvZiB0eXBlb2YgRW5nbGlzaFN0cmluZ1RvQ29kZU1hcDtcclxuXHJcbmV4cG9ydCB0eXBlIE9uZUtleVN0cm9rZSA9IGAke0FsbG93ZWRLZXlzfWAgfFxyXG4gIGAke01vZGlmaWVyS2V5fSske0FsbG93ZWRLZXlzfWAgfFxyXG4gIGAke01vZGlmaWVyS2V5fSske01vZGlmaWVyS2V5fSske0FsbG93ZWRLZXlzfWA7XHJcbi8vIFRoZXNlIGNvbWJpbmF0aW9ucyBhcmUgbm90IHN1cHBvcnRlZCBieSBUeXBlU2NyaXB0OiBcIlRTMjU5MDogRXhwcmVzc2lvbiBwcm9kdWNlcyBhIHVuaW9uIHR5cGUgdGhhdCBpcyB0b28gY29tcGxleCB0b1xyXG4vLyByZXByZXNlbnQuXCIgU2VlIGFib3ZlIG5vdGUgYW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvNDExNjAjaXNzdWVjb21tZW50LTEyODcyNzExMzIuXHJcbi8vIGAke0FsbG93ZWRLZXlzfSske0FsbG93ZWRLZXlzfSske0FsbG93ZWRLZXlzfSske0FsbG93ZWRLZXlzfWA7XHJcbi8vIHR5cGUgS2V5Q29tYmluYXRpb25zID0gYCR7T25lS2V5U3Ryb2tlfWAgfCBgJHtPbmVLZXlTdHJva2V9LCR7T25lS2V5U3Ryb2tlfWA7XHJcblxyXG4vLyBQb3NzaWJsZSBpbnB1dCB0eXBlcyB0aGF0IGRlY2lkZSB3aGVuIHRoZSBjYWxsYmFja3Mgb2YgdGhpcyBsaXN0ZW5lciBzaG91bGQgZmlyZS5cclxuLy8gLSAndXAnOiBDYWxsYmFja3MgZmlyZSBvbiByZWxlYXNlIG9mIGtleXMuXHJcbi8vIC0gJ2Rvd24nOiBDYWxsYmFja3MgZmlyZSBvbiBwcmVzcyBvZiBrZXlzLlxyXG4vLyAtICdib3RoJzogQ2FsbGJhY2tzIGZpcmUgb24gYm90aCBwcmVzcyBhbmQgcmVsZWFzZSBvZiBrZXlzLlxyXG50eXBlIExpc3RlbmVyRmlyZVRyaWdnZXIgPSAndXAnIHwgJ2Rvd24nIHwgJ2JvdGgnO1xyXG5cclxudHlwZSBLZXlib2FyZExpc3RlbmVyT3B0aW9uczxLZXlzIGV4dGVuZHMgcmVhZG9ubHkgT25lS2V5U3Ryb2tlWyBdPiA9IHtcclxuXHJcbiAgLy8gVGhlIGtleXMgdGhhdCBuZWVkIHRvIGJlIHByZXNzZWQgdG8gZmlyZSB0aGUgY2FsbGJhY2suIEluIGEgZm9ybSBsaWtlIGBbICdzaGlmdCt0JywgJ2FsdCtzaGlmdCtyJyBdYC4gU2VlIHRvcFxyXG4gIC8vIGxldmVsIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24gYW5kIGFuIGV4YW1wbGUgb2YgcHJvdmlkaW5nIGtleXMuXHJcbiAga2V5czogS2V5cztcclxuXHJcbiAgLy8gSWYgdHJ1ZSwgdGhlIGxpc3RlbmVyIHdpbGwgZmlyZSBjYWxsYmFja3MgaWYga2V5cyBvdGhlciB0aGFuIGtleXMgaW4gdGhlIGtleSBncm91cCBoYXBwZW4gdG8gYmUgZG93biBhdCB0aGUgc2FtZVxyXG4gIC8vIHRpbWUuIElmIGZhbHNlLCBjYWxsYmFja3Mgd2lsbCBmaXJlIG9ubHkgd2hlbiB0aGUga2V5cyBvZiBhIGdyb3VwIGFyZSBleGNsdXNpdmVseSBkb3duLiBTZXR0aW5nIHRoaXMgdG8gdHJ1ZSBpc1xyXG4gIC8vIGFsc28gdXNlZnVsIGlmIHlvdSB3YW50IG11bHRpcGxlIGtleSBncm91cHMgZnJvbSB5b3VyIHByb3ZpZGVkIGtleXMgdG8gZmlyZSBjYWxsYmFja3MgYXQgdGhlIHNhbWUgdGltZS5cclxuICBhbGxvd090aGVyS2V5cz86IGJvb2xlYW47XHJcblxyXG4gIC8vIElmIHRydWUsIHRoZSBsaXN0ZW5lciB3aWxsIGZpcmUgZm9yIGtleXMgcmVnYXJkbGVzcyBvZiB3aGVyZSBmb2N1cyBpcyBpbiB0aGUgZG9jdW1lbnQuIFVzZSB0aGlzIHdoZW4geW91IHdhbnRcclxuICAvLyB0byBhZGQgc29tZSBrZXkgcHJlc3MgYmVoYXZpb3IgdGhhdCB3aWxsIGFsd2F5cyBmaXJlIG5vIG1hdHRlciB3aGF0IHRoZSBldmVudCB0YXJnZXQgaXMuIElmIHRoaXMgbGlzdGVuZXJcclxuICAvLyBpcyBhZGRlZCB0byBhIE5vZGUsIGl0IHdpbGwgb25seSBmaXJlIGlmIHRoZSBOb2RlIChhbmQgYWxsIG9mIGl0cyBhbmNlc3RvcnMpIGFyZSB2aXNpYmxlIHdpdGggaW5wdXRFbmFibGVkOiB0cnVlLlxyXG4gIC8vIE1vcmUgc3BlY2lmaWNhbGx5LCB0aGlzIHVzZXMgYGdsb2JhbEtleVVwYCBhbmQgYGdsb2JhbEtleURvd25gLiBTZWUgZGVmaW5pdGlvbnMgaW4gSW5wdXQudHMgZm9yIG1vcmUgaW5mb3JtYXRpb24uXHJcbiAgZ2xvYmFsPzogYm9vbGVhbjtcclxuXHJcbiAgLy8gSWYgdHJ1ZSwgdGhpcyBsaXN0ZW5lciBpcyBmaXJlZCBkdXJpbmcgdGhlICdjYXB0dXJlJyBwaGFzZSwgbWVhbmluZyBCRUZPUkUgb3RoZXIgbGlzdGVuZXJzIGdldCBmaXJlZCBkdXJpbmdcclxuICAvLyB0eXBpY2FsIGV2ZW50IGRpc3BhdGNoLiBPbmx5IHJlbGV2YW50IGZvciBgZ2xvYmFsYCBrZXkgZXZlbnRzLlxyXG4gIGNhcHR1cmU/OiBib29sZWFuO1xyXG5cclxuICAvLyBJZiB0cnVlLCBhbGwgU2NlbmVyeUV2ZW50cyB0aGF0IHRyaWdnZXIgdGhpcyBsaXN0ZW5lciAoa2V5ZG93biBhbmQga2V5dXApIHdpbGwgYmUgYGhhbmRsZWRgIChubyBtb3JlXHJcbiAgLy8gZXZlbnQgYnViYmxpbmcpLiBTZWUgYG1hbmFnZUV2ZW50YCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuICBoYW5kbGU/OiBib29sZWFuO1xyXG5cclxuICAvLyBJZiB0cnVlLCBhbGwgU2NlbmVyeUV2ZW50cyB0aGF0IHRyaWdnZXIgdGhpcyBsaXN0ZW5lciAoa2V5ZG93biBhbmQga2V5dXApIHdpbGwgYmUgYGFib3J0ZWRgIChubyBtb3JlXHJcbiAgLy8gZXZlbnQgYnViYmxpbmcsIG5vIG1vcmUgbGlzdGVuZXJzIGZpcmUpLiBTZWUgYG1hbmFnZUV2ZW50YCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuICBhYm9ydD86IGJvb2xlYW47XHJcblxyXG4gIC8vIENhbGxlZCB3aGVuIHRoZSBsaXN0ZW5lciBkZXRlY3RzIHRoYXQgdGhlIHNldCBvZiBrZXlzIGFyZSBwcmVzc2VkLlxyXG4gIGNhbGxiYWNrPzogKCBldmVudDogU2NlbmVyeUV2ZW50PEtleWJvYXJkRXZlbnQ+IHwgbnVsbCwgbGlzdGVuZXI6IEtleWJvYXJkTGlzdGVuZXI8S2V5cz4gKSA9PiB2b2lkO1xyXG5cclxuICAvLyBDYWxsZWQgd2hlbiB0aGUgbGlzdGVuZXIgaXMgY2FuY2VsbGVkL2ludGVycnVwdGVkLlxyXG4gIGNhbmNlbD86ICggbGlzdGVuZXI6IEtleWJvYXJkTGlzdGVuZXI8S2V5cz4gKSA9PiB2b2lkO1xyXG5cclxuICAvLyBXaGVuIHRydWUsIHRoZSBsaXN0ZW5lciB3aWxsIGZpcmUgY29udGludW91c2x5IHdoaWxlIGtleXMgYXJlIGhlbGQgZG93biwgYXQgdGhlIGZvbGxvd2luZyBpbnRlcnZhbHMuXHJcbiAgZmlyZU9uSG9sZD86IGJvb2xlYW47XHJcblxyXG4gIC8vIElmIGZpcmVPbkhvbGQgdHJ1ZSwgdGhpcyBpcyB0aGUgZGVsYXkgaW4gKGluIG1pbGxpc2Vjb25kcykgYmVmb3JlIHRoZSBjYWxsYmFjayBpcyBmaXJlZCBjb250aW51b3VzbHkuXHJcbiAgZmlyZU9uSG9sZERlbGF5PzogbnVtYmVyO1xyXG5cclxuICAvLyBJZiBmaXJlT25Ib2xkIHRydWUsIHRoaXMgaXMgdGhlIGludGVydmFsIChpbiBtaWxsaXNlY29uZHMpIHRoYXQgdGhlIGNhbGxiYWNrIGZpcmVzIGFmdGVyIHRoZSBmaXJlT25Ib2xkRGVsYXkuXHJcbiAgZmlyZU9uSG9sZEludGVydmFsPzogbnVtYmVyO1xyXG5cclxuICAvLyBQb3NzaWJsZSBpbnB1dCB0eXBlcyB0aGF0IGRlY2lkZSB3aGVuIGNhbGxiYWNrcyBvZiB0aGUgbGlzdGVuZXIgZmlyZSBpbiByZXNwb25zZSB0byBpbnB1dC4gU2VlXHJcbiAgLy8gTGlzdGVuZXJGaXJlVHJpZ2dlciB0eXBlIGRvY3VtZW50YXRpb24uXHJcbiAgbGlzdGVuZXJGaXJlVHJpZ2dlcj86IExpc3RlbmVyRmlyZVRyaWdnZXI7XHJcbn07XHJcblxyXG50eXBlIEtleUdyb3VwPEtleXMgZXh0ZW5kcyByZWFkb25seSBPbmVLZXlTdHJva2VbXT4gPSB7XHJcblxyXG4gIC8vIEFsbCBtdXN0IGJlIHByZXNzZWQgZnVsbHkgYmVmb3JlIHRoZSBrZXkgaXMgcHJlc3NlZCB0byBhY3RpdmF0ZSB0aGUgY29tbWFuZC5cclxuICBtb2RpZmllcktleXM6IHN0cmluZ1tdO1xyXG5cclxuICAvLyB0aGUgZmluYWwga2V5IHRoYXQgaXMgcHJlc3NlZCAoYWZ0ZXIgbW9kaWZpZXIga2V5cykgdG8gdHJpZ2dlciB0aGUgbGlzdGVuZXJcclxuICBrZXk6IHN0cmluZztcclxuXHJcbiAgLy8gYWxsIGtleXMgaW4gdGhpcyBLZXlHcm91cCBhcyBhIEtleWJvYXJkRXZlbnQuY29kZVxyXG4gIGFsbEtleXM6IHN0cmluZ1tdO1xyXG5cclxuICAvLyBBbGwga2V5cyBpbiB0aGlzIEtleUdyb3VwIHVzaW5nIHRoZSByZWFkYWJsZSBmb3JtXHJcbiAgbmF0dXJhbEtleXM6IEtleXNbbnVtYmVyXTtcclxuXHJcbiAgLy8gQSBjYWxsYmFjayB0aW1lciBmb3IgdGhpcyBLZXlHcm91cCB0byBzdXBwb3J0IHByZXNzIGFuZCBob2xkIHRpbWluZyBhbmQgY2FsbGJhY2tzXHJcbiAgdGltZXI6IENhbGxiYWNrVGltZXIgfCBudWxsO1xyXG59O1xyXG5cclxuY2xhc3MgS2V5Ym9hcmRMaXN0ZW5lcjxLZXlzIGV4dGVuZHMgcmVhZG9ubHkgT25lS2V5U3Ryb2tlW10+IGltcGxlbWVudHMgVElucHV0TGlzdGVuZXIge1xyXG5cclxuICAvLyBUaGUgZnVuY3Rpb24gY2FsbGVkIHdoZW4gYSBLZXlHcm91cCBpcyBwcmVzc2VkIChvciBqdXN0IHJlbGVhc2VkKS4gUHJvdmlkZXMgdGhlIFNjZW5lcnlFdmVudCB0aGF0IGZpcmVkIHRoZSBpbnB1dFxyXG4gIC8vIGxpc3RlbmVycyBhbmQgdGhpcyB0aGUga2V5cyB0aGF0IHdlcmUgcHJlc3NlZCBmcm9tIHRoZSBhY3RpdmUgS2V5R3JvdXAuIFRoZSBldmVudCBtYXkgYmUgbnVsbCB3aGVuIHVzaW5nXHJcbiAgLy8gZmlyZU9uSG9sZCBvciBpbiBjYXNlcyBvZiBjYW5jZWwgb3IgaW50ZXJydXB0LlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgX2NhbGxiYWNrOiAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQ8S2V5Ym9hcmRFdmVudD4gfCBudWxsLCBsaXN0ZW5lcjogS2V5Ym9hcmRMaXN0ZW5lcjxLZXlzPiApID0+IHZvaWQ7XHJcblxyXG4gIC8vIFRoZSBvcHRpb25hbCBmdW5jdGlvbiBjYWxsZWQgd2hlbiB0aGlzIGxpc3RlbmVyIGlzIGNhbmNlbGxlZC5cclxuICBwcml2YXRlIHJlYWRvbmx5IF9jYW5jZWw6ICggbGlzdGVuZXI6IEtleWJvYXJkTGlzdGVuZXI8S2V5cz4gKSA9PiB2b2lkO1xyXG5cclxuICAvLyBXaGVuIGNhbGxiYWNrcyBhcmUgZmlyZWQgaW4gcmVzcG9uc2UgdG8gaW5wdXQuIENvdWxkIGJlIG9uIGtleXMgcHJlc3NlZCBkb3duLCB1cCwgb3IgYm90aC5cclxuICBwcml2YXRlIHJlYWRvbmx5IF9saXN0ZW5lckZpcmVUcmlnZ2VyOiBMaXN0ZW5lckZpcmVUcmlnZ2VyO1xyXG5cclxuICAvLyBEb2VzIHRoZSBsaXN0ZW5lciBmaXJlIHRoZSBjYWxsYmFjayBjb250aW51b3VzbHkgd2hlbiBrZXlzIGFyZSBoZWxkIGRvd24/XHJcbiAgcHJpdmF0ZSByZWFkb25seSBfZmlyZU9uSG9sZDogYm9vbGVhbjtcclxuXHJcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpIEFsbCB0aGUgS2V5R3JvdXBzIG9mIHRoaXMgbGlzdGVuZXIgZnJvbSB0aGUga2V5cyBwcm92aWRlZCBpbiBuYXR1cmFsIGxhbmd1YWdlLlxyXG4gIHB1YmxpYyByZWFkb25seSBfa2V5R3JvdXBzOiBLZXlHcm91cDxLZXlzPltdO1xyXG5cclxuICAvLyBBbGwgdGhlIEtleUdyb3VwcyB0aGF0IGFyZSBjdXJyZW50bHkgZmlyaW5nXHJcbiAgcHJpdmF0ZSByZWFkb25seSBfYWN0aXZlS2V5R3JvdXBzOiBLZXlHcm91cDxLZXlzPltdO1xyXG5cclxuICAvLyBDdXJyZW50IGtleXMgcHJlc3NlZCB0aGF0IGFyZSBoYXZpbmcgdGhlaXIgbGlzdGVuZXJzIGZpcmVkIG5vdy5cclxuICBwdWJsaWMga2V5c1ByZXNzZWQ6IEtleXNbbnVtYmVyXSB8IG51bGwgPSBudWxsO1xyXG5cclxuICAvLyBUcnVlIHdoZW4ga2V5cyBhcmUgcHJlc3NlZCBkb3duLiBJZiBsaXN0ZW5lckZpcmVUcmlnZ2VyIGlzICdib3RoJywgeW91IGNhbiBsb29rIGF0IHRoaXMgaW4geW91ciBjYWxsYmFjayB0b1xyXG4gIC8vIGRldGVybWluZSBpZiBrZXlzIGFyZSBwcmVzc2VkIG9yIHJlbGVhc2VkLlxyXG4gIHB1YmxpYyBrZXlzRG93bjogYm9vbGVhbjtcclxuXHJcbiAgLy8gVGltaW5nIHZhcmlhYmxlcyBmb3IgdGhlIENhbGxiYWNrVGltZXJzLlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgX2ZpcmVPbkhvbGREZWxheTogbnVtYmVyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgX2ZpcmVPbkhvbGRJbnRlcnZhbDogbnVtYmVyO1xyXG5cclxuICAvLyBzZWUgb3B0aW9ucyBkb2N1bWVudGF0aW9uXHJcbiAgcHJpdmF0ZSByZWFkb25seSBfZ2xvYmFsOiBib29sZWFuO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgX2hhbmRsZTogYm9vbGVhbjtcclxuICBwcml2YXRlIHJlYWRvbmx5IF9hYm9ydDogYm9vbGVhbjtcclxuICBwcml2YXRlIHJlYWRvbmx5IF9hbGxvd090aGVyS2V5czogYm9vbGVhbjtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBfd2luZG93Rm9jdXNMaXN0ZW5lcjogKCB3aW5kb3dIYXNGb2N1czogYm9vbGVhbiApID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBLZXlib2FyZExpc3RlbmVyT3B0aW9uczxLZXlzPiApIHtcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8S2V5Ym9hcmRMaXN0ZW5lck9wdGlvbnM8S2V5cz4+KCkoIHtcclxuICAgICAgY2FsbGJhY2s6IF8ubm9vcCxcclxuICAgICAgY2FuY2VsOiBfLm5vb3AsXHJcbiAgICAgIGdsb2JhbDogZmFsc2UsXHJcbiAgICAgIGNhcHR1cmU6IGZhbHNlLFxyXG4gICAgICBoYW5kbGU6IGZhbHNlLFxyXG4gICAgICBhYm9ydDogZmFsc2UsXHJcbiAgICAgIGxpc3RlbmVyRmlyZVRyaWdnZXI6ICdkb3duJyxcclxuICAgICAgZmlyZU9uSG9sZDogZmFsc2UsXHJcbiAgICAgIGZpcmVPbkhvbGREZWxheTogNDAwLFxyXG4gICAgICBmaXJlT25Ib2xkSW50ZXJ2YWw6IDEwMCxcclxuICAgICAgYWxsb3dPdGhlcktleXM6IGZhbHNlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLl9jYWxsYmFjayA9IG9wdGlvbnMuY2FsbGJhY2s7XHJcbiAgICB0aGlzLl9jYW5jZWwgPSBvcHRpb25zLmNhbmNlbDtcclxuXHJcbiAgICB0aGlzLl9saXN0ZW5lckZpcmVUcmlnZ2VyID0gb3B0aW9ucy5saXN0ZW5lckZpcmVUcmlnZ2VyO1xyXG4gICAgdGhpcy5fZmlyZU9uSG9sZCA9IG9wdGlvbnMuZmlyZU9uSG9sZDtcclxuICAgIHRoaXMuX2ZpcmVPbkhvbGREZWxheSA9IG9wdGlvbnMuZmlyZU9uSG9sZERlbGF5O1xyXG4gICAgdGhpcy5fZmlyZU9uSG9sZEludGVydmFsID0gb3B0aW9ucy5maXJlT25Ib2xkSW50ZXJ2YWw7XHJcbiAgICB0aGlzLl9hbGxvd090aGVyS2V5cyA9IG9wdGlvbnMuYWxsb3dPdGhlcktleXM7XHJcblxyXG4gICAgdGhpcy5fYWN0aXZlS2V5R3JvdXBzID0gW107XHJcblxyXG4gICAgdGhpcy5rZXlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuX2dsb2JhbCA9IG9wdGlvbnMuZ2xvYmFsO1xyXG4gICAgdGhpcy5faGFuZGxlID0gb3B0aW9ucy5oYW5kbGU7XHJcbiAgICB0aGlzLl9hYm9ydCA9IG9wdGlvbnMuYWJvcnQ7XHJcblxyXG4gICAgLy8gY29udmVydCB0aGUgcHJvdmlkZWQga2V5cyB0byBkYXRhIHRoYXQgd2UgY2FuIHJlc3BvbmQgdG8gd2l0aCBzY2VuZXJ5J3MgSW5wdXQgc3lzdGVtXHJcbiAgICB0aGlzLl9rZXlHcm91cHMgPSB0aGlzLmNvbnZlcnRLZXlzVG9LZXlHcm91cHMoIG9wdGlvbnMua2V5cyApO1xyXG5cclxuICAgICggdGhpcyBhcyB1bmtub3duIGFzIFRJbnB1dExpc3RlbmVyICkubGlzdGVuZXIgPSB0aGlzO1xyXG4gICAgKCB0aGlzIGFzIHVua25vd24gYXMgVElucHV0TGlzdGVuZXIgKS5jYXB0dXJlID0gb3B0aW9ucy5jYXB0dXJlO1xyXG5cclxuICAgIHRoaXMuX3dpbmRvd0ZvY3VzTGlzdGVuZXIgPSB0aGlzLmhhbmRsZVdpbmRvd0ZvY3VzQ2hhbmdlLmJpbmQoIHRoaXMgKTtcclxuICAgIEZvY3VzTWFuYWdlci53aW5kb3dIYXNGb2N1c1Byb3BlcnR5LmxpbmsoIHRoaXMuX3dpbmRvd0ZvY3VzTGlzdGVuZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vc3RseSByZXF1aXJlZCB0byBmaXJlIHdpdGggQ2FsbGJhY2tUaW1lciBzaW5jZSB0aGUgY2FsbGJhY2sgY2Fubm90IHRha2UgYXJndW1lbnRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBmaXJlQ2FsbGJhY2soIGV2ZW50OiBTY2VuZXJ5RXZlbnQ8S2V5Ym9hcmRFdmVudD4gfCBudWxsLCBrZXlHcm91cDogS2V5R3JvdXA8S2V5cz4gKTogdm9pZCB7XHJcbiAgICB0aGlzLmtleXNQcmVzc2VkID0ga2V5R3JvdXAubmF0dXJhbEtleXM7XHJcbiAgICB0aGlzLl9jYWxsYmFjayggZXZlbnQsIHRoaXMgKTtcclxuICAgIHRoaXMua2V5c1ByZXNzZWQgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGFydCBvZiB0aGUgc2NlbmVyeSBsaXN0ZW5lciBBUEkuIFJlc3BvbmRpbmcgdG8gYSBrZXlkb3duIGV2ZW50LCB1cGRhdGUgYWN0aXZlIEtleUdyb3VwcyBhbmQgcG90ZW50aWFsbHlcclxuICAgKiBmaXJlIGNhbGxiYWNrcyBhbmQgc3RhcnQgQ2FsbGJhY2tUaW1lcnMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBoYW5kbGVLZXlEb3duKCBldmVudDogU2NlbmVyeUV2ZW50PEtleWJvYXJkRXZlbnQ+ICk6IHZvaWQge1xyXG4gICAgaWYgKCB0aGlzLl9saXN0ZW5lckZpcmVUcmlnZ2VyID09PSAnZG93bicgfHwgdGhpcy5fbGlzdGVuZXJGaXJlVHJpZ2dlciA9PT0gJ2JvdGgnICkge1xyXG5cclxuICAgICAgLy8gbW9kaWZpZXIga2V5cyBjYW4gYmUgcHJlc3NlZCBpbiBhbnkgb3JkZXIgYnV0IHRoZSBsYXN0IGtleSBpbiB0aGUgZ3JvdXAgbXVzdCBiZSBwcmVzc2VkIGxhc3RcclxuICAgICAgdGhpcy5fa2V5R3JvdXBzLmZvckVhY2goIGtleUdyb3VwID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCAhdGhpcy5fYWN0aXZlS2V5R3JvdXBzLmluY2x1ZGVzKCBrZXlHcm91cCApICkge1xyXG4gICAgICAgICAgaWYgKCB0aGlzLmFyZUtleXNEb3duRm9yTGlzdGVuZXIoIGtleUdyb3VwLmFsbEtleXMgKSAmJlxyXG4gICAgICAgICAgICAgICBLZXlib2FyZFV0aWxzLmFyZUtleXNFcXVpdmFsZW50KCBrZXlHcm91cC5rZXksIGdsb2JhbEtleVN0YXRlVHJhY2tlci5nZXRMYXN0S2V5RG93bigpISApICkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fYWN0aXZlS2V5R3JvdXBzLnB1c2goIGtleUdyb3VwICk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmtleXNEb3duID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIGlmICgga2V5R3JvdXAudGltZXIgKSB7XHJcbiAgICAgICAgICAgICAga2V5R3JvdXAudGltZXIuc3RhcnQoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5maXJlQ2FsbGJhY2soIGV2ZW50LCBrZXlHcm91cCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubWFuYWdlRXZlbnQoIGV2ZW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJZiB0aGVyZSBhcmUgYW55IGFjdGl2ZSBLZXlHcm91cCBmaXJpbmcgc3RvcCBhbmQgcmVtb3ZlIGlmIEtleUdyb3VwIGtleXMgYXJlIG5vIGxvbmdlciBkb3duLiBBbHNvLCBwb3RlbnRpYWxseVxyXG4gICAqIGZpcmVzIGEgS2V5R3JvdXAgaWYgdGhlIGtleSB0aGF0IHdhcyByZWxlYXNlZCBoYXMgYWxsIG90aGVyIG1vZGlmaWVyIGtleXMgZG93bi5cclxuICAgKi9cclxuICBwcml2YXRlIGhhbmRsZUtleVVwKCBldmVudDogU2NlbmVyeUV2ZW50PEtleWJvYXJkRXZlbnQ+ICk6IHZvaWQge1xyXG5cclxuICAgIGlmICggdGhpcy5fYWN0aXZlS2V5R3JvdXBzLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgIHRoaXMuX2FjdGl2ZUtleUdyb3Vwcy5mb3JFYWNoKCAoIGFjdGl2ZUtleUdyb3VwLCBpbmRleCApID0+IHtcclxuICAgICAgICBpZiAoICF0aGlzLmFyZUtleXNEb3duRm9yTGlzdGVuZXIoIGFjdGl2ZUtleUdyb3VwLmFsbEtleXMgKSApIHtcclxuICAgICAgICAgIGlmICggYWN0aXZlS2V5R3JvdXAudGltZXIgKSB7XHJcbiAgICAgICAgICAgIGFjdGl2ZUtleUdyb3VwLnRpbWVyLnN0b3AoIGZhbHNlICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLl9hY3RpdmVLZXlHcm91cHMuc3BsaWNlKCBpbmRleCwgMSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy5fbGlzdGVuZXJGaXJlVHJpZ2dlciA9PT0gJ3VwJyB8fCB0aGlzLl9saXN0ZW5lckZpcmVUcmlnZ2VyID09PSAnYm90aCcgKSB7XHJcbiAgICAgIGNvbnN0IGV2ZW50Q29kZSA9IEtleWJvYXJkVXRpbHMuZ2V0RXZlbnRDb2RlKCBldmVudC5kb21FdmVudCApITtcclxuXHJcbiAgICAgIC8vIFNjcmVlbiByZWFkZXJzIG1heSBzZW5kIGtleSBldmVudHMgd2l0aCBubyBjb2RlIGZvciB1bmtub3duIHJlYXNvbnMsIHdlIG5lZWQgdG8gYmUgZ3JhY2VmdWwgd2hlbiB0aGF0XHJcbiAgICAgIC8vIGhhcHBlbnMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTUzNC5cclxuICAgICAgaWYgKCBldmVudENvZGUgKSB7XHJcbiAgICAgICAgdGhpcy5fa2V5R3JvdXBzLmZvckVhY2goIGtleUdyb3VwID0+IHtcclxuICAgICAgICAgIGlmICggdGhpcy5hcmVLZXlzRG93bkZvckxpc3RlbmVyKCBrZXlHcm91cC5tb2RpZmllcktleXMgKSAmJlxyXG4gICAgICAgICAgICAgICBLZXlib2FyZFV0aWxzLmFyZUtleXNFcXVpdmFsZW50KCBrZXlHcm91cC5rZXksIGV2ZW50Q29kZSApICkge1xyXG4gICAgICAgICAgICB0aGlzLmtleXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuZmlyZUNhbGxiYWNrKCBldmVudCwga2V5R3JvdXAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm1hbmFnZUV2ZW50KCBldmVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXJlIHRoZSBwcm92aWRlZCBrZXlzIGN1cnJlbnRseSBwcmVzc2VkIGluIGEgd2F5IHRoYXQgc2hvdWxkIHN0YXJ0IG9yIHN0b3AgZmlyaW5nIGNhbGxiYWNrcz8gSWYgdGhpcyBsaXN0ZW5lclxyXG4gICAqIGFsbG93cyBvdGhlciBrZXlzIHRvIGJlIHByZXNzZWQsIHJldHVybnMgdHJ1ZSBpZiB0aGUga2V5cyBhcmUgZG93bi4gSWYgbm90LCBpdCByZXR1cm5zIHRydWUgaWYgT05MWSB0aGVcclxuICAgKiBwcm92aWRlZCBrZXlzIGFyZSBkb3duLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYXJlS2V5c0Rvd25Gb3JMaXN0ZW5lcigga2V5czogc3RyaW5nW10gKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fYWxsb3dPdGhlcktleXMgPyBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIuYXJlS2V5c0Rvd24oIGtleXMgKSA6IGdsb2JhbEtleVN0YXRlVHJhY2tlci5hcmVLZXlzRXhjbHVzaXZlbHlEb3duKCBrZXlzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbiByZXNwb25zZSB0byBldmVyeSBTY2VuZXJ5RXZlbnQsIGhhbmRsZSBhbmQvb3IgYWJvcnQgZGVwZW5kaW5nIG9uIGxpc3RlbmVyIG9wdGlvbnMuIFRoaXMgY2Fubm90IGJlIGRvbmUgaW5cclxuICAgKiB0aGUgY2FsbGJhY2tzIGJlY2F1c2UgcHJlc3MtYW5kLWhvbGQgYmVoYXZpb3IgdHJpZ2dlcnMgbWFueSBrZXlkb3duIGV2ZW50cy4gV2UgbmVlZCB0byBoYW5kbGUvYWJvcnQgZWFjaCwgbm90XHJcbiAgICoganVzdCB0aGUgZXZlbnQgdGhhdCB0cmlnZ2VyZWQgdGhlIGNhbGxiYWNrLiBBbHNvLCBjYWxsYmFja3MgY2FuIGJlIGNhbGxlZCB3aXRob3V0IGEgU2NlbmVyeUV2ZW50IGZyb20gdGhlXHJcbiAgICogQ2FsbGJhY2tUaW1lci5cclxuICAgKi9cclxuICBwcml2YXRlIG1hbmFnZUV2ZW50KCBldmVudDogU2NlbmVyeUV2ZW50PEtleWJvYXJkRXZlbnQ+ICk6IHZvaWQge1xyXG4gICAgdGhpcy5faGFuZGxlICYmIGV2ZW50LmhhbmRsZSgpO1xyXG4gICAgdGhpcy5fYWJvcnQgJiYgZXZlbnQuYWJvcnQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoaXMgaXMgcGFydCBvZiB0aGUgc2NlbmVyeSBJbnB1dCBBUEkgKGltcGxlbWVudGluZyBUSW5wdXRMaXN0ZW5lcikuIEhhbmRsZSB0aGUga2V5ZG93biBldmVudCB3aGVuIG5vdFxyXG4gICAqIGFkZGVkIHRvIHRoZSBnbG9iYWwga2V5IGV2ZW50cy4gVGFyZ2V0IHdpbGwgYmUgdGhlIE5vZGUsIERpc3BsYXksIG9yIFBvaW50ZXIgdGhpcyBsaXN0ZW5lciB3YXMgYWRkZWQgdG8uXHJcbiAgICovXHJcbiAgcHVibGljIGtleWRvd24oIGV2ZW50OiBTY2VuZXJ5RXZlbnQ8S2V5Ym9hcmRFdmVudD4gKTogdm9pZCB7XHJcbiAgICBpZiAoICF0aGlzLl9nbG9iYWwgKSB7XHJcbiAgICAgIHRoaXMuaGFuZGxlS2V5RG93biggZXZlbnQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoaXMgaXMgcGFydCBvZiB0aGUgc2NlbmVyeSBJbnB1dCBBUEkgKGltcGxlbWVudGluZyBUSW5wdXRMaXN0ZW5lcikuIEhhbmRsZSB0aGUga2V5dXAgZXZlbnQgd2hlbiBub3RcclxuICAgKiBhZGRlZCB0byB0aGUgZ2xvYmFsIGtleSBldmVudHMuIFRhcmdldCB3aWxsIGJlIHRoZSBOb2RlLCBEaXNwbGF5LCBvciBQb2ludGVyIHRoaXMgbGlzdGVuZXIgd2FzIGFkZGVkIHRvLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBrZXl1cCggZXZlbnQ6IFNjZW5lcnlFdmVudDxLZXlib2FyZEV2ZW50PiApOiB2b2lkIHtcclxuICAgIGlmICggIXRoaXMuX2dsb2JhbCApIHtcclxuICAgICAgdGhpcy5oYW5kbGVLZXlVcCggZXZlbnQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoaXMgaXMgcGFydCBvZiB0aGUgc2NlbmVyeSBJbnB1dCBBUEkgKGltcGxlbWVudGluZyBUSW5wdXRMaXN0ZW5lcikuIEhhbmRsZSB0aGUgZ2xvYmFsIGtleWRvd24gZXZlbnQuXHJcbiAgICogRXZlbnQgaGFzIG5vIHRhcmdldC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2xvYmFsa2V5ZG93biggZXZlbnQ6IFNjZW5lcnlFdmVudDxLZXlib2FyZEV2ZW50PiApOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy5fZ2xvYmFsICkge1xyXG4gICAgICB0aGlzLmhhbmRsZUtleURvd24oIGV2ZW50ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGlzIGlzIHBhcnQgb2YgdGhlIHNjZW5lcnkgSW5wdXQgQVBJIChpbXBsZW1lbnRpbmcgVElucHV0TGlzdGVuZXIpLiBIYW5kbGUgdGhlIGdsb2JhbCBrZXl1cCBldmVudC5cclxuICAgKiBFdmVudCBoYXMgbm8gdGFyZ2V0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnbG9iYWxrZXl1cCggZXZlbnQ6IFNjZW5lcnlFdmVudDxLZXlib2FyZEV2ZW50PiApOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy5fZ2xvYmFsICkge1xyXG4gICAgICB0aGlzLmhhbmRsZUtleVVwKCBldmVudCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV29yayB0byBiZSBkb25lIG9uIGJvdGggY2FuY2VsIGFuZCBpbnRlcnJ1cHQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBoYW5kbGVDYW5jZWwoKTogdm9pZCB7XHJcbiAgICB0aGlzLmNsZWFyQWN0aXZlS2V5R3JvdXBzKCk7XHJcbiAgICB0aGlzLl9jYW5jZWwoIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZW4gdGhlIHdpbmRvdyBsb3NlcyBmb2N1cywgY2FuY2VsLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgaGFuZGxlV2luZG93Rm9jdXNDaGFuZ2UoIHdpbmRvd0hhc0ZvY3VzOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgaWYgKCAhd2luZG93SGFzRm9jdXMgKSB7XHJcbiAgICAgIHRoaXMuaGFuZGxlQ2FuY2VsKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQYXJ0IG9mIHRoZSBzY2VuZXJ5IGxpc3RlbmVyIEFQSS4gT24gY2FuY2VsLCBjbGVhciBhY3RpdmUgS2V5R3JvdXBzIGFuZCBzdG9wIHRoZWlyIGJlaGF2aW9yLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjYW5jZWwoKTogdm9pZCB7XHJcbiAgICB0aGlzLmhhbmRsZUNhbmNlbCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGFydCBvZiB0aGUgc2NlbmVyeSBsaXN0ZW5lciBBUEkuIENsZWFyIGFjdGl2ZSBLZXlHcm91cHMgYW5kIHN0b3AgdGhlaXIgY2FsbGJhY2tzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpbnRlcnJ1cHQoKTogdm9pZCB7XHJcbiAgICB0aGlzLmhhbmRsZUNhbmNlbCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlzcG9zZSBvZiB0aGlzIGxpc3RlbmVyIGJ5IGRpc3Bvc2luZyBvZiBhbnkgQ2FsbGJhY2sgdGltZXJzLiBUaGVuIGNsZWFyIGFsbCBLZXlHcm91cHMuXHJcbiAgICovXHJcbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLl9rZXlHcm91cHMuZm9yRWFjaCggYWN0aXZlS2V5R3JvdXAgPT4ge1xyXG4gICAgICBhY3RpdmVLZXlHcm91cC50aW1lciAmJiBhY3RpdmVLZXlHcm91cC50aW1lci5kaXNwb3NlKCk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLl9rZXlHcm91cHMubGVuZ3RoID0gMDtcclxuXHJcbiAgICBGb2N1c01hbmFnZXIud2luZG93SGFzRm9jdXNQcm9wZXJ0eS51bmxpbmsoIHRoaXMuX3dpbmRvd0ZvY3VzTGlzdGVuZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFyIHRoZSBhY3RpdmUgS2V5R3JvdXBzIG9uIHRoaXMgbGlzdGVuZXIuIFN0b3BwaW5nIGFueSBhY3RpdmUgZ3JvdXBzIGlmIHRoZXkgdXNlIGEgQ2FsbGJhY2tUaW1lci5cclxuICAgKi9cclxuICBwcml2YXRlIGNsZWFyQWN0aXZlS2V5R3JvdXBzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5fYWN0aXZlS2V5R3JvdXBzLmZvckVhY2goIGFjdGl2ZUtleUdyb3VwID0+IHtcclxuICAgICAgYWN0aXZlS2V5R3JvdXAudGltZXIgJiYgYWN0aXZlS2V5R3JvdXAudGltZXIuc3RvcCggZmFsc2UgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLl9hY3RpdmVLZXlHcm91cHMubGVuZ3RoID0gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnRzIHRoZSBwcm92aWRlZCBrZXlzIGludG8gYSBjb2xsZWN0aW9uIG9mIEtleUdyb3VwcyB0byBlYXNpbHkgdHJhY2sgd2hhdCBrZXlzIGFyZSBkb3duLiBGb3IgZXhhbXBsZSxcclxuICAgKiB3aWxsIHRha2UgYSBzdHJpbmcgdGhhdCBkZWZpbmVzIHRoZSBrZXlzIGZvciB0aGlzIGxpc3RlbmVyIGxpa2UgJ2ErY3wxKzIrMys0fHNoaWZ0K2xlZnRBcnJvdycgYW5kIHJldHVybiBhbiBhcnJheVxyXG4gICAqIHdpdGggdGhyZWUgS2V5R3JvdXBzLCBvbmUgZGVzY3JpYmluZyAnYStjJywgb25lIGRlc2NyaWJpbmcgJzErMiszKzQnIGFuZCBvbmUgZGVzY3JpYmluZyAnc2hpZnQrbGVmdEFycm93Jy5cclxuICAgKi9cclxuICBwcml2YXRlIGNvbnZlcnRLZXlzVG9LZXlHcm91cHMoIGtleXM6IEtleXMgKTogS2V5R3JvdXA8S2V5cz5bXSB7XHJcblxyXG4gICAgY29uc3Qga2V5R3JvdXBzID0ga2V5cy5tYXAoIG5hdHVyYWxLZXlzID0+IHtcclxuXHJcbiAgICAgIC8vIGFsbCBvZiB0aGUga2V5cyBpbiB0aGlzIGdyb3VwIGluIGFuIGFycmF5XHJcbiAgICAgIGNvbnN0IGdyb3VwS2V5cyA9IG5hdHVyYWxLZXlzLnNwbGl0KCAnKycgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZ3JvdXBLZXlzLmxlbmd0aCA+IDAsICdubyBrZXlzIHByb3ZpZGVkPycgKTtcclxuXHJcbiAgICAgIGNvbnN0IG5hdHVyYWxLZXkgPSBncm91cEtleXMuc2xpY2UoIC0xIClbIDAgXTtcclxuICAgICAgY29uc3Qga2V5ID0gRW5nbGlzaFN0cmluZ1RvQ29kZU1hcFsgbmF0dXJhbEtleSBdO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBrZXksIGBLZXkgbm90IGZvdW5kLCBkbyB5b3UgbmVlZCB0byBhZGQgaXQgdG8gRW5nbGlzaFN0cmluZ1RvQ29kZU1hcD8gJHtuYXR1cmFsS2V5fWAgKTtcclxuXHJcbiAgICAgIGxldCBtb2RpZmllcktleXM6IHN0cmluZ1tdID0gW107XHJcbiAgICAgIGlmICggZ3JvdXBLZXlzLmxlbmd0aCA+IDEgKSB7XHJcbiAgICAgICAgbW9kaWZpZXJLZXlzID0gZ3JvdXBLZXlzLnNsaWNlKCAwLCBncm91cEtleXMubGVuZ3RoIC0gMSApLm1hcCggbmF0dXJhbE1vZGlmaWVyS2V5ID0+IHtcclxuICAgICAgICAgIGNvbnN0IG1vZGlmaWVyS2V5ID0gRW5nbGlzaFN0cmluZ1RvQ29kZU1hcFsgbmF0dXJhbE1vZGlmaWVyS2V5IF07XHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtb2RpZmllcktleSwgYEtleSBub3QgZm91bmQsIGRvIHlvdSBuZWVkIHRvIGFkZCBpdCB0byBFbmdsaXNoU3RyaW5nVG9Db2RlTWFwPyAke25hdHVyYWxNb2RpZmllcktleX1gICk7XHJcbiAgICAgICAgICByZXR1cm4gbW9kaWZpZXJLZXk7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTZXQgdXAgdGhlIHRpbWVyIGZvciB0cmlnZ2VyaW5nIGNhbGxiYWNrcyBpZiB0aGlzIGxpc3RlbmVyIHN1cHBvcnRzIHByZXNzIGFuZCBob2xkIGJlaGF2aW9yXHJcbiAgICAgIGNvbnN0IHRpbWVyID0gdGhpcy5fZmlyZU9uSG9sZCA/IG5ldyBDYWxsYmFja1RpbWVyKCB7XHJcbiAgICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuZmlyZUNhbGxiYWNrKCBudWxsLCBrZXlHcm91cCApLFxyXG4gICAgICAgIGRlbGF5OiB0aGlzLl9maXJlT25Ib2xkRGVsYXksXHJcbiAgICAgICAgaW50ZXJ2YWw6IHRoaXMuX2ZpcmVPbkhvbGRJbnRlcnZhbFxyXG4gICAgICB9ICkgOiBudWxsO1xyXG5cclxuICAgICAgY29uc3Qga2V5R3JvdXA6IEtleUdyb3VwPEtleXM+ID0ge1xyXG4gICAgICAgIGtleToga2V5LFxyXG4gICAgICAgIG1vZGlmaWVyS2V5czogbW9kaWZpZXJLZXlzLFxyXG4gICAgICAgIG5hdHVyYWxLZXlzOiBuYXR1cmFsS2V5cyxcclxuICAgICAgICBhbGxLZXlzOiBtb2RpZmllcktleXMuY29uY2F0KCBrZXkgKSxcclxuICAgICAgICB0aW1lcjogdGltZXJcclxuICAgICAgfTtcclxuICAgICAgcmV0dXJuIGtleUdyb3VwO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiBrZXlHcm91cHM7XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnS2V5Ym9hcmRMaXN0ZW5lcicsIEtleWJvYXJkTGlzdGVuZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgS2V5Ym9hcmRMaXN0ZW5lcjtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsYUFBYSxNQUFNLG1DQUFtQztBQUM3RCxPQUFPQyxTQUFTLE1BQU0sb0NBQW9DO0FBQzFELFNBQVNDLHNCQUFzQixFQUFFQyxZQUFZLEVBQUVDLHFCQUFxQixFQUFFQyxPQUFPLFFBQXNDLGVBQWU7QUFDbEksT0FBT0MsYUFBYSxNQUFNLG1DQUFtQzs7QUFFN0Q7QUFDQTtBQUNBO0FBQ0E7QUFTQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBc0VBLE1BQU1DLGdCQUFnQixDQUFpRTtFQUVy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