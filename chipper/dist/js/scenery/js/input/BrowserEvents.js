// Copyright 2017-2023, University of Colorado Boulder

/**
 * Handles attaching/detaching and forwarding browser input events to displays.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import arrayRemove from '../../../phet-core/js/arrayRemove.js';
import platform from '../../../phet-core/js/platform.js';
import { BatchedDOMEventType, Display, EventContext, Features, FocusManager, globalKeyStateTracker, PDOMUtils, scenery } from '../imports.js';

// Sometimes we need to add a listener that does absolutely nothing
const noop = () => {};

// Ensure we only attach global window listeners (display independent) once
let isGloballyAttached = false;
const BrowserEvents = {
  // Prevents focus related event callbacks from being dispatched - scenery internal operations might change
  // focus temporarily, we don't want event listeners to be called in this case because they are transient and not
  // caused by user interaction.
  blockFocusCallbacks: false,
  /**
   * Adds a Display to the list of displays that will be notified of input events.
   * @public
   *
   * @param {Display} display
   * @param {boolean} attachToWindow - Whether events should be attached to the window. If false, they will be
   *                                   attached to the Display's domElement.
   * @param {boolean|null} passiveEvents - The value of the `passive` option for adding/removing DOM event listeners
   */
  addDisplay(display, attachToWindow, passiveEvents) {
    assert && assert(display instanceof Display);
    assert && assert(typeof attachToWindow === 'boolean');
    assert && assert(!_.includes(this.attachedDisplays, display), 'A display cannot be concurrently attached to events more than one time');

    // Always first please
    if (!isGloballyAttached) {
      isGloballyAttached = true;

      // never unattach because we don't know if there are other Displays listening to this.
      globalKeyStateTracker.attachToWindow();
      FocusManager.attachToWindow();
    }
    this.attachedDisplays.push(display);
    if (attachToWindow) {
      // lazily connect listeners
      if (this.attachedDisplays.length === 1) {
        this.connectWindowListeners(passiveEvents);
      }
    } else {
      this.addOrRemoveListeners(display.domElement, true, passiveEvents);
    }

    // Only add the wheel listeners directly on the elements, so it won't trigger outside
    display.domElement.addEventListener('wheel', this.onwheel, BrowserEvents.getEventOptions(passiveEvents, true));
  },
  /**
   * Removes a Display to the list of displays that will be notified of input events.
   * @public
   *
   * @param {Display} display
   * @param {boolean} attachToWindow - The value provided to addDisplay
   * @param {boolean|null} passiveEvents - The value of the `passive` option for adding/removing DOM event listeners
   */
  removeDisplay(display, attachToWindow, passiveEvents) {
    assert && assert(display instanceof Display);
    assert && assert(typeof attachToWindow === 'boolean');
    assert && assert(_.includes(this.attachedDisplays, display), 'This display was not already attached to listen for window events');
    arrayRemove(this.attachedDisplays, display);

    // lazily disconnect listeners
    if (attachToWindow) {
      if (this.attachedDisplays.length === 0) {
        this.disconnectWindowListeners(passiveEvents);
      }
    } else {
      this.addOrRemoveListeners(display.domElement, false, passiveEvents);
    }
    display.domElement.removeEventListener('wheel', this.onwheel, BrowserEvents.getEventOptions(passiveEvents, true));
  },
  /**
   * Returns the value to provide as the 3rd parameter to addEventListener/removeEventListener.
   * @private
   *
   * @param {boolean|null} passiveEvents
   * @param {boolean} isMain - If false, it is used on the "document" for workarounds.
   * @returns {Object|boolean}
   */
  getEventOptions(passiveEvents, isMain) {
    const passDirectPassiveFlag = Features.passive && passiveEvents !== null;
    if (!passDirectPassiveFlag) {
      return false;
    } else {
      const eventOptions = {
        passive: passiveEvents
      };
      if (isMain) {
        eventOptions.capture = false;
      }
      assert && assert(!eventOptions.capture, 'Do not use capture without consulting globalKeyStateTracker, ' + 'which expects have listeners called FIRST in keyboard-related cases.');
      return eventOptions;
    }
  },
  /**
   * {number} - Will be checked/mutated when listeners are added/removed.
   * @private
   */
  listenersAttachedToWindow: 0,
  /**
   * {number} - Will be checked/mutated when listeners are added/removed.
   * @private
   */
  listenersAttachedToElement: 0,
  /**
   * {Array.<Display>} - All Displays that should have input events forwarded.
   * @private
   */
  attachedDisplays: [],
  /**
   * {boolean} - Whether pointer events in the format specified by the W3C specification are allowed.
   * @private
   *
   * NOTE: Pointer events are currently disabled for Firefox due to https://github.com/phetsims/scenery/issues/837.
   */
  canUsePointerEvents: !!(window.navigator && window.navigator.pointerEnabled || window.PointerEvent) && !platform.firefox,
  /**
   * {boolean} - Whether pointer events in the format specified by the MS specification are allowed.
   * @private
   */
  canUseMSPointerEvents: window.navigator && window.navigator.msPointerEnabled,
  /**
   * {Array.<string>} - All W3C pointer event types that we care about.
   * @private
   */
  pointerListenerTypes: ['pointerdown', 'pointerup', 'pointermove', 'pointerover', 'pointerout', 'pointercancel', 'gotpointercapture', 'lostpointercapture'],
  /**
   * {Array.<string>} - All MS pointer event types that we care about.
   * @private
   */
  msPointerListenerTypes: ['MSPointerDown', 'MSPointerUp', 'MSPointerMove', 'MSPointerOver', 'MSPointerOut', 'MSPointerCancel'],
  /**
   * {Array.<string>} - All touch event types that we care about
   * @private
   */
  touchListenerTypes: ['touchstart', 'touchend', 'touchmove', 'touchcancel'],
  /**
   * {Array.<string>} - All mouse event types that we care about
   * @private
   */
  mouseListenerTypes: ['mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout'],
  /**
   * {Array.<string>} - All wheel event types that we care about
   * @private
   */
  wheelListenerTypes: ['wheel'],
  /**
   * {Array.<string>} - Alternative input types
   * @private
   */
  altListenerTypes: PDOMUtils.DOM_EVENTS,
  /**
   * Returns all event types that will be listened to on this specific platform.
   * @private
   *
   * @returns {Array.<string>}
   */
  getNonWheelUsedTypes() {
    let eventTypes;
    if (this.canUsePointerEvents) {
      // accepts pointer events corresponding to the spec at http://www.w3.org/TR/pointerevents/
      sceneryLog && sceneryLog.Input && sceneryLog.Input('Detected pointer events support, using that instead of mouse/touch events');
      eventTypes = this.pointerListenerTypes;
    } else if (this.canUseMSPointerEvents) {
      sceneryLog && sceneryLog.Input && sceneryLog.Input('Detected MS pointer events support, using that instead of mouse/touch events');
      eventTypes = this.msPointerListenerTypes;
    } else {
      sceneryLog && sceneryLog.Input && sceneryLog.Input('No pointer events support detected, using mouse/touch events');
      eventTypes = this.touchListenerTypes.concat(this.mouseListenerTypes);
    }
    eventTypes = eventTypes.concat(this.altListenerTypes);

    // eventTypes = eventTypes.concat( this.wheelListenerTypes );

    return eventTypes;
  },
  /**
   * Connects event listeners directly to the window.
   * @private
   *
   * @param {boolean|null} passiveEvents - The value of the `passive` option for adding/removing DOM event listeners
   */
  connectWindowListeners(passiveEvents) {
    this.addOrRemoveListeners(window, true, passiveEvents);
  },
  /**
   * Disconnects event listeners from the window.
   * @private
   *
   * @param {boolean|null} passiveEvents - The value of the `passive` option for adding/removing DOM event listeners
   */
  disconnectWindowListeners(passiveEvents) {
    this.addOrRemoveListeners(window, false, passiveEvents);
  },
  /**
   * Either adds or removes event listeners to an object, depending on the flag.
   * @private
   *
   * @param {*} element - The element (window or DOM element) to add listeners to.
   * @param {boolean} addOrRemove - If true, listeners will be added. If false, listeners will be removed.
   * @param {boolean|null} passiveEvents - The value of the `passive` option for adding/removing DOM event listeners
   *                                       NOTE: if it is passed in as null, the default value for the browser will be
   *                                       used.
   */
  addOrRemoveListeners(element, addOrRemove, passiveEvents) {
    assert && assert(typeof addOrRemove === 'boolean');
    assert && assert(typeof passiveEvents === 'boolean' || passiveEvents === null);
    const forWindow = element === window;
    assert && assert(!forWindow || this.listenersAttachedToWindow > 0 === !addOrRemove, 'Do not add listeners to the window when already attached, or remove listeners when none are attached');
    const delta = addOrRemove ? 1 : -1;
    if (forWindow) {
      this.listenersAttachedToWindow += delta;
    } else {
      this.listenersAttachedToElement += delta;
    }
    assert && assert(this.listenersAttachedToWindow === 0 || this.listenersAttachedToElement === 0, 'Listeners should not be added both with addDisplayToWindow and addDisplayToElement. Use only one.');
    const method = addOrRemove ? 'addEventListener' : 'removeEventListener';

    // {Array.<string>}
    const eventTypes = this.getNonWheelUsedTypes();
    for (let i = 0; i < eventTypes.length; i++) {
      const type = eventTypes[i];

      // If we add input listeners to the window itself, iOS Safari 7 won't send touch events to displays in an
      // iframe unless we also add dummy listeners to the document.
      if (forWindow) {
        // Workaround for older browsers needed,
        // see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Improving_scrolling_performance_with_passive_listeners
        document[method](type, noop, BrowserEvents.getEventOptions(passiveEvents, false));
      }
      const callback = this[`on${type}`];
      assert && assert(!!callback);

      // Workaround for older browsers needed,
      // see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Improving_scrolling_performance_with_passive_listeners
      element[method](type, callback, BrowserEvents.getEventOptions(passiveEvents, true));
    }
  },
  /**
   * Sets an event from the window to be batched on all of the displays.
   * @private
   *
   * @param {EventContext} eventContext
   * @param {BatchedDOMEventType} batchType - TODO: turn to full enumeration?
   * @param {string} inputCallbackName - e.g. 'mouseDown', will trigger Input.mouseDown
   * @param {boolean} triggerImmediate - Whether this will be force-executed now, causing all batched events to fire.
   *                                     Useful for events (like mouseup) that responding synchronously is
   *                                     necessary for certain security-sensitive actions (like triggering
   *                                     full-screen).
   */
  batchWindowEvent(eventContext, batchType, inputCallbackName, triggerImmediate) {
    // NOTE: For now, we don't check whether the event is actually within the display's boundingClientRect. Most
    // displays will want to receive events outside of their bounds (especially for checking drags and mouse-ups
    // outside of their bounds).
    for (let i = 0; i < this.attachedDisplays.length; i++) {
      const display = this.attachedDisplays[i];
      const input = display._input;
      if (!BrowserEvents.blockFocusCallbacks || inputCallbackName !== 'focusIn' && inputCallbackName !== 'focusOut') {
        input.batchEvent(eventContext, batchType, input[inputCallbackName], triggerImmediate);
      }
    }
  },
  /**
   * Listener for window's pointerdown event.
   * @private
   *
   * @param {Event} domEvent
   */
  onpointerdown: function onpointerdown(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('pointerdown');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // Get the active element BEFORE any actions are taken
    const eventContext = new EventContext(domEvent);
    if (domEvent.pointerType === 'mouse') {
      Display.userGestureEmitter.emit();
    }

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(eventContext, BatchedDOMEventType.POINTER_TYPE, 'pointerDown', false);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's pointerup event.
   * @private
   *
   * @param {Event} domEvent
   */
  onpointerup: function onpointerup(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('pointerup');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // Get the active element BEFORE any actions are taken
    const eventContext = new EventContext(domEvent);
    Display.userGestureEmitter.emit();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(eventContext, BatchedDOMEventType.POINTER_TYPE, 'pointerUp', true);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's pointermove event.
   * @private
   *
   * @param {Event} domEvent
   */
  onpointermove: function onpointermove(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('pointermove');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.POINTER_TYPE, 'pointerMove', false);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's pointerover event.
   * @private
   *
   * @param {Event} domEvent
   */
  onpointerover: function onpointerover(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('pointerover');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.POINTER_TYPE, 'pointerOver', false);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's pointerout event.
   * @private
   *
   * @param {Event} domEvent
   */
  onpointerout: function onpointerout(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('pointerout');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.POINTER_TYPE, 'pointerOut', false);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's pointercancel event.
   * @private
   *
   * @param {Event} domEvent
   */
  onpointercancel: function onpointercancel(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('pointercancel');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.POINTER_TYPE, 'pointerCancel', false);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's gotpointercapture event.
   * @private
   *
   * @param {Event} domEvent
   */
  ongotpointercapture: function ongotpointercapture(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('gotpointercapture');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.POINTER_TYPE, 'gotPointerCapture', false);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's lostpointercapture event.
   * @private
   *
   * @param {Event} domEvent
   */
  onlostpointercapture: function onlostpointercapture(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('lostpointercapture');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.POINTER_TYPE, 'lostPointerCapture', false);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's MSPointerDown event.
   * @private
   *
   * @param {Event} domEvent
   */
  onMSPointerDown: function onMSPointerDown(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('MSPointerDown');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.MS_POINTER_TYPE, 'pointerDown', false);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's MSPointerUp event.
   * @private
   *
   * @param {Event} domEvent
   */
  onMSPointerUp: function onMSPointerUp(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('MSPointerUp');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.MS_POINTER_TYPE, 'pointerUp', true);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's MSPointerMove event.
   * @private
   *
   * @param {Event} domEvent
   */
  onMSPointerMove: function onMSPointerMove(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('MSPointerMove');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.MS_POINTER_TYPE, 'pointerMove', false);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's MSPointerOver event.
   * @private
   *
   * @param {Event} domEvent
   */
  onMSPointerOver: function onMSPointerOver(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('MSPointerOver');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.MS_POINTER_TYPE, 'pointerOver', false);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's MSPointerOut event.
   * @private
   *
   * @param {Event} domEvent
   */
  onMSPointerOut: function onMSPointerOut(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('MSPointerOut');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.MS_POINTER_TYPE, 'pointerOut', false);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's MSPointerCancel event.
   * @private
   *
   * @param {Event} domEvent
   */
  onMSPointerCancel: function onMSPointerCancel(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('MSPointerCancel');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.MS_POINTER_TYPE, 'pointerCancel', false);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's touchstart event.
   * @private
   *
   * @param {Event} domEvent
   */
  ontouchstart: function ontouchstart(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('touchstart');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.TOUCH_TYPE, 'touchStart', false);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's touchend event.
   * @private
   *
   * @param {Event} domEvent
   */
  ontouchend: function ontouchend(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('touchend');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // Get the active element BEFORE any actions are taken
    const eventContext = new EventContext(domEvent);
    Display.userGestureEmitter.emit();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(eventContext, BatchedDOMEventType.TOUCH_TYPE, 'touchEnd', true);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's touchmove event.
   * @private
   *
   * @param {Event} domEvent
   */
  ontouchmove: function ontouchmove(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('touchmove');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.TOUCH_TYPE, 'touchMove', false);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's touchcancel event.
   * @private
   *
   * @param {Event} domEvent
   */
  ontouchcancel: function ontouchcancel(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('touchcancel');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.TOUCH_TYPE, 'touchCancel', false);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's mousedown event.
   * @private
   *
   * @param {Event} domEvent
   */
  onmousedown: function onmousedown(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('mousedown');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // Get the active element BEFORE any actions are taken
    const eventContext = new EventContext(domEvent);
    Display.userGestureEmitter.emit();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(eventContext, BatchedDOMEventType.MOUSE_TYPE, 'mouseDown', false);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's mouseup event.
   * @private
   *
   * @param {Event} domEvent
   */
  onmouseup: function onmouseup(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('mouseup');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // Get the active element BEFORE any actions are taken
    const eventContext = new EventContext(domEvent);
    Display.userGestureEmitter.emit();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(eventContext, BatchedDOMEventType.MOUSE_TYPE, 'mouseUp', true);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's mousemove event.
   * @private
   *
   * @param {Event} domEvent
   */
  onmousemove: function onmousemove(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('mousemove');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.MOUSE_TYPE, 'mouseMove', false);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's mouseover event.
   * @private
   *
   * @param {Event} domEvent
   */
  onmouseover: function onmouseover(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('mouseover');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.MOUSE_TYPE, 'mouseOver', false);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's mouseout event.
   * @private
   *
   * @param {Event} domEvent
   */
  onmouseout: function onmouseout(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('mouseout');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.MOUSE_TYPE, 'mouseOut', false);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  /**
   * Listener for window's wheel event.
   * @private
   *
   * @param {Event} domEvent
   */
  onwheel: function onwheel(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('wheel');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.WHEEL_TYPE, 'wheel', false);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  onfocusin: function onfocusin(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('focusin');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.

    // if ( domEvent.target.id === 'display1-primary-30-44-2795-2802-2797-2806-3012-3011-2992' ) {
    //   debugger;
    // }

    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.ALT_TYPE, 'focusIn', true);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  onfocusout: function onfocusout(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('focusout');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.ALT_TYPE, 'focusOut', true);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  oninput: function oninput(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('input');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.

    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.ALT_TYPE, 'input', true);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  onchange: function onchange(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('change');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.ALT_TYPE, 'change', true);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  onclick: function onclick(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('click');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.ALT_TYPE, 'click', true);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  onkeydown: function onkeydown(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('keydown');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.ALT_TYPE, 'keyDown', true);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  },
  onkeyup: function onkeyup(domEvent) {
    sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('keyup');
    sceneryLog && sceneryLog.OnInput && sceneryLog.push();

    // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
    BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.ALT_TYPE, 'keyUp', true);
    sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
  }
};
scenery.register('BrowserEvents', BrowserEvents);
export default BrowserEvents;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhcnJheVJlbW92ZSIsInBsYXRmb3JtIiwiQmF0Y2hlZERPTUV2ZW50VHlwZSIsIkRpc3BsYXkiLCJFdmVudENvbnRleHQiLCJGZWF0dXJlcyIsIkZvY3VzTWFuYWdlciIsImdsb2JhbEtleVN0YXRlVHJhY2tlciIsIlBET01VdGlscyIsInNjZW5lcnkiLCJub29wIiwiaXNHbG9iYWxseUF0dGFjaGVkIiwiQnJvd3NlckV2ZW50cyIsImJsb2NrRm9jdXNDYWxsYmFja3MiLCJhZGREaXNwbGF5IiwiZGlzcGxheSIsImF0dGFjaFRvV2luZG93IiwicGFzc2l2ZUV2ZW50cyIsImFzc2VydCIsIl8iLCJpbmNsdWRlcyIsImF0dGFjaGVkRGlzcGxheXMiLCJwdXNoIiwibGVuZ3RoIiwiY29ubmVjdFdpbmRvd0xpc3RlbmVycyIsImFkZE9yUmVtb3ZlTGlzdGVuZXJzIiwiZG9tRWxlbWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJvbndoZWVsIiwiZ2V0RXZlbnRPcHRpb25zIiwicmVtb3ZlRGlzcGxheSIsImRpc2Nvbm5lY3RXaW5kb3dMaXN0ZW5lcnMiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiaXNNYWluIiwicGFzc0RpcmVjdFBhc3NpdmVGbGFnIiwicGFzc2l2ZSIsImV2ZW50T3B0aW9ucyIsImNhcHR1cmUiLCJsaXN0ZW5lcnNBdHRhY2hlZFRvV2luZG93IiwibGlzdGVuZXJzQXR0YWNoZWRUb0VsZW1lbnQiLCJjYW5Vc2VQb2ludGVyRXZlbnRzIiwid2luZG93IiwibmF2aWdhdG9yIiwicG9pbnRlckVuYWJsZWQiLCJQb2ludGVyRXZlbnQiLCJmaXJlZm94IiwiY2FuVXNlTVNQb2ludGVyRXZlbnRzIiwibXNQb2ludGVyRW5hYmxlZCIsInBvaW50ZXJMaXN0ZW5lclR5cGVzIiwibXNQb2ludGVyTGlzdGVuZXJUeXBlcyIsInRvdWNoTGlzdGVuZXJUeXBlcyIsIm1vdXNlTGlzdGVuZXJUeXBlcyIsIndoZWVsTGlzdGVuZXJUeXBlcyIsImFsdExpc3RlbmVyVHlwZXMiLCJET01fRVZFTlRTIiwiZ2V0Tm9uV2hlZWxVc2VkVHlwZXMiLCJldmVudFR5cGVzIiwic2NlbmVyeUxvZyIsIklucHV0IiwiY29uY2F0IiwiZWxlbWVudCIsImFkZE9yUmVtb3ZlIiwiZm9yV2luZG93IiwiZGVsdGEiLCJtZXRob2QiLCJpIiwidHlwZSIsImRvY3VtZW50IiwiY2FsbGJhY2siLCJiYXRjaFdpbmRvd0V2ZW50IiwiZXZlbnRDb250ZXh0IiwiYmF0Y2hUeXBlIiwiaW5wdXRDYWxsYmFja05hbWUiLCJ0cmlnZ2VySW1tZWRpYXRlIiwiaW5wdXQiLCJfaW5wdXQiLCJiYXRjaEV2ZW50Iiwib25wb2ludGVyZG93biIsImRvbUV2ZW50IiwiT25JbnB1dCIsInBvaW50ZXJUeXBlIiwidXNlckdlc3R1cmVFbWl0dGVyIiwiZW1pdCIsIlBPSU5URVJfVFlQRSIsInBvcCIsIm9ucG9pbnRlcnVwIiwib25wb2ludGVybW92ZSIsIm9ucG9pbnRlcm92ZXIiLCJvbnBvaW50ZXJvdXQiLCJvbnBvaW50ZXJjYW5jZWwiLCJvbmdvdHBvaW50ZXJjYXB0dXJlIiwib25sb3N0cG9pbnRlcmNhcHR1cmUiLCJvbk1TUG9pbnRlckRvd24iLCJNU19QT0lOVEVSX1RZUEUiLCJvbk1TUG9pbnRlclVwIiwib25NU1BvaW50ZXJNb3ZlIiwib25NU1BvaW50ZXJPdmVyIiwib25NU1BvaW50ZXJPdXQiLCJvbk1TUG9pbnRlckNhbmNlbCIsIm9udG91Y2hzdGFydCIsIlRPVUNIX1RZUEUiLCJvbnRvdWNoZW5kIiwib250b3VjaG1vdmUiLCJvbnRvdWNoY2FuY2VsIiwib25tb3VzZWRvd24iLCJNT1VTRV9UWVBFIiwib25tb3VzZXVwIiwib25tb3VzZW1vdmUiLCJvbm1vdXNlb3ZlciIsIm9ubW91c2VvdXQiLCJXSEVFTF9UWVBFIiwib25mb2N1c2luIiwiQUxUX1RZUEUiLCJvbmZvY3Vzb3V0Iiwib25pbnB1dCIsIm9uY2hhbmdlIiwib25jbGljayIsIm9ua2V5ZG93biIsIm9ua2V5dXAiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJyb3dzZXJFdmVudHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSGFuZGxlcyBhdHRhY2hpbmcvZGV0YWNoaW5nIGFuZCBmb3J3YXJkaW5nIGJyb3dzZXIgaW5wdXQgZXZlbnRzIHRvIGRpc3BsYXlzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IGFycmF5UmVtb3ZlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hcnJheVJlbW92ZS5qcyc7XHJcbmltcG9ydCBwbGF0Zm9ybSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvcGxhdGZvcm0uanMnO1xyXG5pbXBvcnQgeyBCYXRjaGVkRE9NRXZlbnRUeXBlLCBEaXNwbGF5LCBFdmVudENvbnRleHQsIEZlYXR1cmVzLCBGb2N1c01hbmFnZXIsIGdsb2JhbEtleVN0YXRlVHJhY2tlciwgUERPTVV0aWxzLCBzY2VuZXJ5IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcblxyXG4vLyBTb21ldGltZXMgd2UgbmVlZCB0byBhZGQgYSBsaXN0ZW5lciB0aGF0IGRvZXMgYWJzb2x1dGVseSBub3RoaW5nXHJcbmNvbnN0IG5vb3AgPSAoKSA9PiB7fTtcclxuXHJcbi8vIEVuc3VyZSB3ZSBvbmx5IGF0dGFjaCBnbG9iYWwgd2luZG93IGxpc3RlbmVycyAoZGlzcGxheSBpbmRlcGVuZGVudCkgb25jZVxyXG5sZXQgaXNHbG9iYWxseUF0dGFjaGVkID0gZmFsc2U7XHJcblxyXG5jb25zdCBCcm93c2VyRXZlbnRzID0ge1xyXG5cclxuICAvLyBQcmV2ZW50cyBmb2N1cyByZWxhdGVkIGV2ZW50IGNhbGxiYWNrcyBmcm9tIGJlaW5nIGRpc3BhdGNoZWQgLSBzY2VuZXJ5IGludGVybmFsIG9wZXJhdGlvbnMgbWlnaHQgY2hhbmdlXHJcbiAgLy8gZm9jdXMgdGVtcG9yYXJpbHksIHdlIGRvbid0IHdhbnQgZXZlbnQgbGlzdGVuZXJzIHRvIGJlIGNhbGxlZCBpbiB0aGlzIGNhc2UgYmVjYXVzZSB0aGV5IGFyZSB0cmFuc2llbnQgYW5kIG5vdFxyXG4gIC8vIGNhdXNlZCBieSB1c2VyIGludGVyYWN0aW9uLlxyXG4gIGJsb2NrRm9jdXNDYWxsYmFja3M6IGZhbHNlLFxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGEgRGlzcGxheSB0byB0aGUgbGlzdCBvZiBkaXNwbGF5cyB0aGF0IHdpbGwgYmUgbm90aWZpZWQgb2YgaW5wdXQgZXZlbnRzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RGlzcGxheX0gZGlzcGxheVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYXR0YWNoVG9XaW5kb3cgLSBXaGV0aGVyIGV2ZW50cyBzaG91bGQgYmUgYXR0YWNoZWQgdG8gdGhlIHdpbmRvdy4gSWYgZmFsc2UsIHRoZXkgd2lsbCBiZVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRhY2hlZCB0byB0aGUgRGlzcGxheSdzIGRvbUVsZW1lbnQuXHJcbiAgICogQHBhcmFtIHtib29sZWFufG51bGx9IHBhc3NpdmVFdmVudHMgLSBUaGUgdmFsdWUgb2YgdGhlIGBwYXNzaXZlYCBvcHRpb24gZm9yIGFkZGluZy9yZW1vdmluZyBET00gZXZlbnQgbGlzdGVuZXJzXHJcbiAgICovXHJcbiAgYWRkRGlzcGxheSggZGlzcGxheSwgYXR0YWNoVG9XaW5kb3csIHBhc3NpdmVFdmVudHMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkaXNwbGF5IGluc3RhbmNlb2YgRGlzcGxheSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGF0dGFjaFRvV2luZG93ID09PSAnYm9vbGVhbicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFfLmluY2x1ZGVzKCB0aGlzLmF0dGFjaGVkRGlzcGxheXMsIGRpc3BsYXkgKSxcclxuICAgICAgJ0EgZGlzcGxheSBjYW5ub3QgYmUgY29uY3VycmVudGx5IGF0dGFjaGVkIHRvIGV2ZW50cyBtb3JlIHRoYW4gb25lIHRpbWUnICk7XHJcblxyXG4gICAgLy8gQWx3YXlzIGZpcnN0IHBsZWFzZVxyXG4gICAgaWYgKCAhaXNHbG9iYWxseUF0dGFjaGVkICkge1xyXG4gICAgICBpc0dsb2JhbGx5QXR0YWNoZWQgPSB0cnVlO1xyXG5cclxuICAgICAgLy8gbmV2ZXIgdW5hdHRhY2ggYmVjYXVzZSB3ZSBkb24ndCBrbm93IGlmIHRoZXJlIGFyZSBvdGhlciBEaXNwbGF5cyBsaXN0ZW5pbmcgdG8gdGhpcy5cclxuICAgICAgZ2xvYmFsS2V5U3RhdGVUcmFja2VyLmF0dGFjaFRvV2luZG93KCk7XHJcbiAgICAgIEZvY3VzTWFuYWdlci5hdHRhY2hUb1dpbmRvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYXR0YWNoZWREaXNwbGF5cy5wdXNoKCBkaXNwbGF5ICk7XHJcblxyXG4gICAgaWYgKCBhdHRhY2hUb1dpbmRvdyApIHtcclxuICAgICAgLy8gbGF6aWx5IGNvbm5lY3QgbGlzdGVuZXJzXHJcbiAgICAgIGlmICggdGhpcy5hdHRhY2hlZERpc3BsYXlzLmxlbmd0aCA9PT0gMSApIHtcclxuICAgICAgICB0aGlzLmNvbm5lY3RXaW5kb3dMaXN0ZW5lcnMoIHBhc3NpdmVFdmVudHMgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuYWRkT3JSZW1vdmVMaXN0ZW5lcnMoIGRpc3BsYXkuZG9tRWxlbWVudCwgdHJ1ZSwgcGFzc2l2ZUV2ZW50cyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE9ubHkgYWRkIHRoZSB3aGVlbCBsaXN0ZW5lcnMgZGlyZWN0bHkgb24gdGhlIGVsZW1lbnRzLCBzbyBpdCB3b24ndCB0cmlnZ2VyIG91dHNpZGVcclxuICAgIGRpc3BsYXkuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnd2hlZWwnLCB0aGlzLm9ud2hlZWwsIEJyb3dzZXJFdmVudHMuZ2V0RXZlbnRPcHRpb25zKCBwYXNzaXZlRXZlbnRzLCB0cnVlICkgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGEgRGlzcGxheSB0byB0aGUgbGlzdCBvZiBkaXNwbGF5cyB0aGF0IHdpbGwgYmUgbm90aWZpZWQgb2YgaW5wdXQgZXZlbnRzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RGlzcGxheX0gZGlzcGxheVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYXR0YWNoVG9XaW5kb3cgLSBUaGUgdmFsdWUgcHJvdmlkZWQgdG8gYWRkRGlzcGxheVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbnxudWxsfSBwYXNzaXZlRXZlbnRzIC0gVGhlIHZhbHVlIG9mIHRoZSBgcGFzc2l2ZWAgb3B0aW9uIGZvciBhZGRpbmcvcmVtb3ZpbmcgRE9NIGV2ZW50IGxpc3RlbmVyc1xyXG4gICAqL1xyXG4gIHJlbW92ZURpc3BsYXkoIGRpc3BsYXksIGF0dGFjaFRvV2luZG93LCBwYXNzaXZlRXZlbnRzICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZGlzcGxheSBpbnN0YW5jZW9mIERpc3BsYXkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBhdHRhY2hUb1dpbmRvdyA9PT0gJ2Jvb2xlYW4nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCB0aGlzLmF0dGFjaGVkRGlzcGxheXMsIGRpc3BsYXkgKSxcclxuICAgICAgJ1RoaXMgZGlzcGxheSB3YXMgbm90IGFscmVhZHkgYXR0YWNoZWQgdG8gbGlzdGVuIGZvciB3aW5kb3cgZXZlbnRzJyApO1xyXG5cclxuICAgIGFycmF5UmVtb3ZlKCB0aGlzLmF0dGFjaGVkRGlzcGxheXMsIGRpc3BsYXkgKTtcclxuXHJcbiAgICAvLyBsYXppbHkgZGlzY29ubmVjdCBsaXN0ZW5lcnNcclxuICAgIGlmICggYXR0YWNoVG9XaW5kb3cgKSB7XHJcbiAgICAgIGlmICggdGhpcy5hdHRhY2hlZERpc3BsYXlzLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgICB0aGlzLmRpc2Nvbm5lY3RXaW5kb3dMaXN0ZW5lcnMoIHBhc3NpdmVFdmVudHMgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuYWRkT3JSZW1vdmVMaXN0ZW5lcnMoIGRpc3BsYXkuZG9tRWxlbWVudCwgZmFsc2UsIHBhc3NpdmVFdmVudHMgKTtcclxuICAgIH1cclxuXHJcbiAgICBkaXNwbGF5LmRvbUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3doZWVsJywgdGhpcy5vbndoZWVsLCBCcm93c2VyRXZlbnRzLmdldEV2ZW50T3B0aW9ucyggcGFzc2l2ZUV2ZW50cywgdHJ1ZSApICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgdmFsdWUgdG8gcHJvdmlkZSBhcyB0aGUgM3JkIHBhcmFtZXRlciB0byBhZGRFdmVudExpc3RlbmVyL3JlbW92ZUV2ZW50TGlzdGVuZXIuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbnxudWxsfSBwYXNzaXZlRXZlbnRzXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBpc01haW4gLSBJZiBmYWxzZSwgaXQgaXMgdXNlZCBvbiB0aGUgXCJkb2N1bWVudFwiIGZvciB3b3JrYXJvdW5kcy5cclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fGJvb2xlYW59XHJcbiAgICovXHJcbiAgZ2V0RXZlbnRPcHRpb25zKCBwYXNzaXZlRXZlbnRzLCBpc01haW4gKSB7XHJcbiAgICBjb25zdCBwYXNzRGlyZWN0UGFzc2l2ZUZsYWcgPSBGZWF0dXJlcy5wYXNzaXZlICYmIHBhc3NpdmVFdmVudHMgIT09IG51bGw7XHJcbiAgICBpZiAoICFwYXNzRGlyZWN0UGFzc2l2ZUZsYWcgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBjb25zdCBldmVudE9wdGlvbnMgPSB7IHBhc3NpdmU6IHBhc3NpdmVFdmVudHMgfTtcclxuICAgICAgaWYgKCBpc01haW4gKSB7XHJcbiAgICAgICAgZXZlbnRPcHRpb25zLmNhcHR1cmUgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIWV2ZW50T3B0aW9ucy5jYXB0dXJlLCAnRG8gbm90IHVzZSBjYXB0dXJlIHdpdGhvdXQgY29uc3VsdGluZyBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIsICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd3aGljaCBleHBlY3RzIGhhdmUgbGlzdGVuZXJzIGNhbGxlZCBGSVJTVCBpbiBrZXlib2FyZC1yZWxhdGVkIGNhc2VzLicgKTtcclxuICAgICAgcmV0dXJuIGV2ZW50T3B0aW9ucztcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiB7bnVtYmVyfSAtIFdpbGwgYmUgY2hlY2tlZC9tdXRhdGVkIHdoZW4gbGlzdGVuZXJzIGFyZSBhZGRlZC9yZW1vdmVkLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgbGlzdGVuZXJzQXR0YWNoZWRUb1dpbmRvdzogMCxcclxuXHJcbiAgLyoqXHJcbiAgICoge251bWJlcn0gLSBXaWxsIGJlIGNoZWNrZWQvbXV0YXRlZCB3aGVuIGxpc3RlbmVycyBhcmUgYWRkZWQvcmVtb3ZlZC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGxpc3RlbmVyc0F0dGFjaGVkVG9FbGVtZW50OiAwLFxyXG5cclxuICAvKipcclxuICAgKiB7QXJyYXkuPERpc3BsYXk+fSAtIEFsbCBEaXNwbGF5cyB0aGF0IHNob3VsZCBoYXZlIGlucHV0IGV2ZW50cyBmb3J3YXJkZWQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBhdHRhY2hlZERpc3BsYXlzOiBbXSxcclxuXHJcbiAgLyoqXHJcbiAgICoge2Jvb2xlYW59IC0gV2hldGhlciBwb2ludGVyIGV2ZW50cyBpbiB0aGUgZm9ybWF0IHNwZWNpZmllZCBieSB0aGUgVzNDIHNwZWNpZmljYXRpb24gYXJlIGFsbG93ZWQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIE5PVEU6IFBvaW50ZXIgZXZlbnRzIGFyZSBjdXJyZW50bHkgZGlzYWJsZWQgZm9yIEZpcmVmb3ggZHVlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84MzcuXHJcbiAgICovXHJcbiAgY2FuVXNlUG9pbnRlckV2ZW50czogISEoICggd2luZG93Lm5hdmlnYXRvciAmJiB3aW5kb3cubmF2aWdhdG9yLnBvaW50ZXJFbmFibGVkICkgfHwgd2luZG93LlBvaW50ZXJFdmVudCApICYmICFwbGF0Zm9ybS5maXJlZm94LFxyXG5cclxuICAvKipcclxuICAgKiB7Ym9vbGVhbn0gLSBXaGV0aGVyIHBvaW50ZXIgZXZlbnRzIGluIHRoZSBmb3JtYXQgc3BlY2lmaWVkIGJ5IHRoZSBNUyBzcGVjaWZpY2F0aW9uIGFyZSBhbGxvd2VkLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgY2FuVXNlTVNQb2ludGVyRXZlbnRzOiB3aW5kb3cubmF2aWdhdG9yICYmIHdpbmRvdy5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCxcclxuXHJcbiAgLyoqXHJcbiAgICoge0FycmF5LjxzdHJpbmc+fSAtIEFsbCBXM0MgcG9pbnRlciBldmVudCB0eXBlcyB0aGF0IHdlIGNhcmUgYWJvdXQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBwb2ludGVyTGlzdGVuZXJUeXBlczogW1xyXG4gICAgJ3BvaW50ZXJkb3duJyxcclxuICAgICdwb2ludGVydXAnLFxyXG4gICAgJ3BvaW50ZXJtb3ZlJyxcclxuICAgICdwb2ludGVyb3ZlcicsXHJcbiAgICAncG9pbnRlcm91dCcsXHJcbiAgICAncG9pbnRlcmNhbmNlbCcsXHJcbiAgICAnZ290cG9pbnRlcmNhcHR1cmUnLFxyXG4gICAgJ2xvc3Rwb2ludGVyY2FwdHVyZSdcclxuICBdLFxyXG5cclxuICAvKipcclxuICAgKiB7QXJyYXkuPHN0cmluZz59IC0gQWxsIE1TIHBvaW50ZXIgZXZlbnQgdHlwZXMgdGhhdCB3ZSBjYXJlIGFib3V0LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgbXNQb2ludGVyTGlzdGVuZXJUeXBlczogW1xyXG4gICAgJ01TUG9pbnRlckRvd24nLFxyXG4gICAgJ01TUG9pbnRlclVwJyxcclxuICAgICdNU1BvaW50ZXJNb3ZlJyxcclxuICAgICdNU1BvaW50ZXJPdmVyJyxcclxuICAgICdNU1BvaW50ZXJPdXQnLFxyXG4gICAgJ01TUG9pbnRlckNhbmNlbCdcclxuICBdLFxyXG5cclxuICAvKipcclxuICAgKiB7QXJyYXkuPHN0cmluZz59IC0gQWxsIHRvdWNoIGV2ZW50IHR5cGVzIHRoYXQgd2UgY2FyZSBhYm91dFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdG91Y2hMaXN0ZW5lclR5cGVzOiBbXHJcbiAgICAndG91Y2hzdGFydCcsXHJcbiAgICAndG91Y2hlbmQnLFxyXG4gICAgJ3RvdWNobW92ZScsXHJcbiAgICAndG91Y2hjYW5jZWwnXHJcbiAgXSxcclxuXHJcbiAgLyoqXHJcbiAgICoge0FycmF5LjxzdHJpbmc+fSAtIEFsbCBtb3VzZSBldmVudCB0eXBlcyB0aGF0IHdlIGNhcmUgYWJvdXRcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIG1vdXNlTGlzdGVuZXJUeXBlczogW1xyXG4gICAgJ21vdXNlZG93bicsXHJcbiAgICAnbW91c2V1cCcsXHJcbiAgICAnbW91c2Vtb3ZlJyxcclxuICAgICdtb3VzZW92ZXInLFxyXG4gICAgJ21vdXNlb3V0J1xyXG4gIF0sXHJcblxyXG4gIC8qKlxyXG4gICAqIHtBcnJheS48c3RyaW5nPn0gLSBBbGwgd2hlZWwgZXZlbnQgdHlwZXMgdGhhdCB3ZSBjYXJlIGFib3V0XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB3aGVlbExpc3RlbmVyVHlwZXM6IFtcclxuICAgICd3aGVlbCdcclxuICBdLFxyXG5cclxuICAvKipcclxuICAgKiB7QXJyYXkuPHN0cmluZz59IC0gQWx0ZXJuYXRpdmUgaW5wdXQgdHlwZXNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGFsdExpc3RlbmVyVHlwZXM6IFBET01VdGlscy5ET01fRVZFTlRTLFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFsbCBldmVudCB0eXBlcyB0aGF0IHdpbGwgYmUgbGlzdGVuZWQgdG8gb24gdGhpcyBzcGVjaWZpYyBwbGF0Zm9ybS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge0FycmF5LjxzdHJpbmc+fVxyXG4gICAqL1xyXG4gIGdldE5vbldoZWVsVXNlZFR5cGVzKCkge1xyXG4gICAgbGV0IGV2ZW50VHlwZXM7XHJcblxyXG4gICAgaWYgKCB0aGlzLmNhblVzZVBvaW50ZXJFdmVudHMgKSB7XHJcbiAgICAgIC8vIGFjY2VwdHMgcG9pbnRlciBldmVudHMgY29ycmVzcG9uZGluZyB0byB0aGUgc3BlYyBhdCBodHRwOi8vd3d3LnczLm9yZy9UUi9wb2ludGVyZXZlbnRzL1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggJ0RldGVjdGVkIHBvaW50ZXIgZXZlbnRzIHN1cHBvcnQsIHVzaW5nIHRoYXQgaW5zdGVhZCBvZiBtb3VzZS90b3VjaCBldmVudHMnICk7XHJcblxyXG4gICAgICBldmVudFR5cGVzID0gdGhpcy5wb2ludGVyTGlzdGVuZXJUeXBlcztcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLmNhblVzZU1TUG9pbnRlckV2ZW50cyApIHtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoICdEZXRlY3RlZCBNUyBwb2ludGVyIGV2ZW50cyBzdXBwb3J0LCB1c2luZyB0aGF0IGluc3RlYWQgb2YgbW91c2UvdG91Y2ggZXZlbnRzJyApO1xyXG5cclxuICAgICAgZXZlbnRUeXBlcyA9IHRoaXMubXNQb2ludGVyTGlzdGVuZXJUeXBlcztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggJ05vIHBvaW50ZXIgZXZlbnRzIHN1cHBvcnQgZGV0ZWN0ZWQsIHVzaW5nIG1vdXNlL3RvdWNoIGV2ZW50cycgKTtcclxuXHJcbiAgICAgIGV2ZW50VHlwZXMgPSB0aGlzLnRvdWNoTGlzdGVuZXJUeXBlcy5jb25jYXQoIHRoaXMubW91c2VMaXN0ZW5lclR5cGVzICk7XHJcbiAgICB9XHJcblxyXG4gICAgZXZlbnRUeXBlcyA9IGV2ZW50VHlwZXMuY29uY2F0KCB0aGlzLmFsdExpc3RlbmVyVHlwZXMgKTtcclxuXHJcbiAgICAvLyBldmVudFR5cGVzID0gZXZlbnRUeXBlcy5jb25jYXQoIHRoaXMud2hlZWxMaXN0ZW5lclR5cGVzICk7XHJcblxyXG4gICAgcmV0dXJuIGV2ZW50VHlwZXM7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ29ubmVjdHMgZXZlbnQgbGlzdGVuZXJzIGRpcmVjdGx5IHRvIHRoZSB3aW5kb3cuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbnxudWxsfSBwYXNzaXZlRXZlbnRzIC0gVGhlIHZhbHVlIG9mIHRoZSBgcGFzc2l2ZWAgb3B0aW9uIGZvciBhZGRpbmcvcmVtb3ZpbmcgRE9NIGV2ZW50IGxpc3RlbmVyc1xyXG4gICAqL1xyXG4gIGNvbm5lY3RXaW5kb3dMaXN0ZW5lcnMoIHBhc3NpdmVFdmVudHMgKSB7XHJcbiAgICB0aGlzLmFkZE9yUmVtb3ZlTGlzdGVuZXJzKCB3aW5kb3csIHRydWUsIHBhc3NpdmVFdmVudHMgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBEaXNjb25uZWN0cyBldmVudCBsaXN0ZW5lcnMgZnJvbSB0aGUgd2luZG93LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW58bnVsbH0gcGFzc2l2ZUV2ZW50cyAtIFRoZSB2YWx1ZSBvZiB0aGUgYHBhc3NpdmVgIG9wdGlvbiBmb3IgYWRkaW5nL3JlbW92aW5nIERPTSBldmVudCBsaXN0ZW5lcnNcclxuICAgKi9cclxuICBkaXNjb25uZWN0V2luZG93TGlzdGVuZXJzKCBwYXNzaXZlRXZlbnRzICkge1xyXG4gICAgdGhpcy5hZGRPclJlbW92ZUxpc3RlbmVycyggd2luZG93LCBmYWxzZSwgcGFzc2l2ZUV2ZW50cyApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEVpdGhlciBhZGRzIG9yIHJlbW92ZXMgZXZlbnQgbGlzdGVuZXJzIHRvIGFuIG9iamVjdCwgZGVwZW5kaW5nIG9uIHRoZSBmbGFnLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0geyp9IGVsZW1lbnQgLSBUaGUgZWxlbWVudCAod2luZG93IG9yIERPTSBlbGVtZW50KSB0byBhZGQgbGlzdGVuZXJzIHRvLlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYWRkT3JSZW1vdmUgLSBJZiB0cnVlLCBsaXN0ZW5lcnMgd2lsbCBiZSBhZGRlZC4gSWYgZmFsc2UsIGxpc3RlbmVycyB3aWxsIGJlIHJlbW92ZWQuXHJcbiAgICogQHBhcmFtIHtib29sZWFufG51bGx9IHBhc3NpdmVFdmVudHMgLSBUaGUgdmFsdWUgb2YgdGhlIGBwYXNzaXZlYCBvcHRpb24gZm9yIGFkZGluZy9yZW1vdmluZyBET00gZXZlbnQgbGlzdGVuZXJzXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOT1RFOiBpZiBpdCBpcyBwYXNzZWQgaW4gYXMgbnVsbCwgdGhlIGRlZmF1bHQgdmFsdWUgZm9yIHRoZSBicm93c2VyIHdpbGwgYmVcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZWQuXHJcbiAgICovXHJcbiAgYWRkT3JSZW1vdmVMaXN0ZW5lcnMoIGVsZW1lbnQsIGFkZE9yUmVtb3ZlLCBwYXNzaXZlRXZlbnRzICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGFkZE9yUmVtb3ZlID09PSAnYm9vbGVhbicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBwYXNzaXZlRXZlbnRzID09PSAnYm9vbGVhbicgfHwgcGFzc2l2ZUV2ZW50cyA9PT0gbnVsbCApO1xyXG5cclxuICAgIGNvbnN0IGZvcldpbmRvdyA9IGVsZW1lbnQgPT09IHdpbmRvdztcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFmb3JXaW5kb3cgfHwgKCB0aGlzLmxpc3RlbmVyc0F0dGFjaGVkVG9XaW5kb3cgPiAwICkgPT09ICFhZGRPclJlbW92ZSxcclxuICAgICAgJ0RvIG5vdCBhZGQgbGlzdGVuZXJzIHRvIHRoZSB3aW5kb3cgd2hlbiBhbHJlYWR5IGF0dGFjaGVkLCBvciByZW1vdmUgbGlzdGVuZXJzIHdoZW4gbm9uZSBhcmUgYXR0YWNoZWQnICk7XHJcblxyXG4gICAgY29uc3QgZGVsdGEgPSBhZGRPclJlbW92ZSA/IDEgOiAtMTtcclxuICAgIGlmICggZm9yV2luZG93ICkge1xyXG4gICAgICB0aGlzLmxpc3RlbmVyc0F0dGFjaGVkVG9XaW5kb3cgKz0gZGVsdGE7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5saXN0ZW5lcnNBdHRhY2hlZFRvRWxlbWVudCArPSBkZWx0YTtcclxuICAgIH1cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubGlzdGVuZXJzQXR0YWNoZWRUb1dpbmRvdyA9PT0gMCB8fCB0aGlzLmxpc3RlbmVyc0F0dGFjaGVkVG9FbGVtZW50ID09PSAwLFxyXG4gICAgICAnTGlzdGVuZXJzIHNob3VsZCBub3QgYmUgYWRkZWQgYm90aCB3aXRoIGFkZERpc3BsYXlUb1dpbmRvdyBhbmQgYWRkRGlzcGxheVRvRWxlbWVudC4gVXNlIG9ubHkgb25lLicgKTtcclxuXHJcbiAgICBjb25zdCBtZXRob2QgPSBhZGRPclJlbW92ZSA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcclxuXHJcbiAgICAvLyB7QXJyYXkuPHN0cmluZz59XHJcbiAgICBjb25zdCBldmVudFR5cGVzID0gdGhpcy5nZXROb25XaGVlbFVzZWRUeXBlcygpO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGV2ZW50VHlwZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHR5cGUgPSBldmVudFR5cGVzWyBpIF07XHJcblxyXG4gICAgICAvLyBJZiB3ZSBhZGQgaW5wdXQgbGlzdGVuZXJzIHRvIHRoZSB3aW5kb3cgaXRzZWxmLCBpT1MgU2FmYXJpIDcgd29uJ3Qgc2VuZCB0b3VjaCBldmVudHMgdG8gZGlzcGxheXMgaW4gYW5cclxuICAgICAgLy8gaWZyYW1lIHVubGVzcyB3ZSBhbHNvIGFkZCBkdW1teSBsaXN0ZW5lcnMgdG8gdGhlIGRvY3VtZW50LlxyXG4gICAgICBpZiAoIGZvcldpbmRvdyApIHtcclxuICAgICAgICAvLyBXb3JrYXJvdW5kIGZvciBvbGRlciBicm93c2VycyBuZWVkZWQsXHJcbiAgICAgICAgLy8gc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FdmVudFRhcmdldC9hZGRFdmVudExpc3RlbmVyI0ltcHJvdmluZ19zY3JvbGxpbmdfcGVyZm9ybWFuY2Vfd2l0aF9wYXNzaXZlX2xpc3RlbmVyc1xyXG4gICAgICAgIGRvY3VtZW50WyBtZXRob2QgXSggdHlwZSwgbm9vcCwgQnJvd3NlckV2ZW50cy5nZXRFdmVudE9wdGlvbnMoIHBhc3NpdmVFdmVudHMsIGZhbHNlICkgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgY2FsbGJhY2sgPSB0aGlzWyBgb24ke3R5cGV9YCBdO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhIWNhbGxiYWNrICk7XHJcblxyXG4gICAgICAvLyBXb3JrYXJvdW5kIGZvciBvbGRlciBicm93c2VycyBuZWVkZWQsXHJcbiAgICAgIC8vIHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRXZlbnRUYXJnZXQvYWRkRXZlbnRMaXN0ZW5lciNJbXByb3Zpbmdfc2Nyb2xsaW5nX3BlcmZvcm1hbmNlX3dpdGhfcGFzc2l2ZV9saXN0ZW5lcnNcclxuICAgICAgZWxlbWVudFsgbWV0aG9kIF0oIHR5cGUsIGNhbGxiYWNrLCBCcm93c2VyRXZlbnRzLmdldEV2ZW50T3B0aW9ucyggcGFzc2l2ZUV2ZW50cywgdHJ1ZSApICk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyBhbiBldmVudCBmcm9tIHRoZSB3aW5kb3cgdG8gYmUgYmF0Y2hlZCBvbiBhbGwgb2YgdGhlIGRpc3BsYXlzLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0V2ZW50Q29udGV4dH0gZXZlbnRDb250ZXh0XHJcbiAgICogQHBhcmFtIHtCYXRjaGVkRE9NRXZlbnRUeXBlfSBiYXRjaFR5cGUgLSBUT0RPOiB0dXJuIHRvIGZ1bGwgZW51bWVyYXRpb24/XHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGlucHV0Q2FsbGJhY2tOYW1lIC0gZS5nLiAnbW91c2VEb3duJywgd2lsbCB0cmlnZ2VyIElucHV0Lm1vdXNlRG93blxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdHJpZ2dlckltbWVkaWF0ZSAtIFdoZXRoZXIgdGhpcyB3aWxsIGJlIGZvcmNlLWV4ZWN1dGVkIG5vdywgY2F1c2luZyBhbGwgYmF0Y2hlZCBldmVudHMgdG8gZmlyZS5cclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVc2VmdWwgZm9yIGV2ZW50cyAobGlrZSBtb3VzZXVwKSB0aGF0IHJlc3BvbmRpbmcgc3luY2hyb25vdXNseSBpc1xyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5lY2Vzc2FyeSBmb3IgY2VydGFpbiBzZWN1cml0eS1zZW5zaXRpdmUgYWN0aW9ucyAobGlrZSB0cmlnZ2VyaW5nXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVsbC1zY3JlZW4pLlxyXG4gICAqL1xyXG4gIGJhdGNoV2luZG93RXZlbnQoIGV2ZW50Q29udGV4dCwgYmF0Y2hUeXBlLCBpbnB1dENhbGxiYWNrTmFtZSwgdHJpZ2dlckltbWVkaWF0ZSApIHtcclxuICAgIC8vIE5PVEU6IEZvciBub3csIHdlIGRvbid0IGNoZWNrIHdoZXRoZXIgdGhlIGV2ZW50IGlzIGFjdHVhbGx5IHdpdGhpbiB0aGUgZGlzcGxheSdzIGJvdW5kaW5nQ2xpZW50UmVjdC4gTW9zdFxyXG4gICAgLy8gZGlzcGxheXMgd2lsbCB3YW50IHRvIHJlY2VpdmUgZXZlbnRzIG91dHNpZGUgb2YgdGhlaXIgYm91bmRzIChlc3BlY2lhbGx5IGZvciBjaGVja2luZyBkcmFncyBhbmQgbW91c2UtdXBzXHJcbiAgICAvLyBvdXRzaWRlIG9mIHRoZWlyIGJvdW5kcykuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmF0dGFjaGVkRGlzcGxheXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGRpc3BsYXkgPSB0aGlzLmF0dGFjaGVkRGlzcGxheXNbIGkgXTtcclxuICAgICAgY29uc3QgaW5wdXQgPSBkaXNwbGF5Ll9pbnB1dDtcclxuXHJcbiAgICAgIGlmICggIUJyb3dzZXJFdmVudHMuYmxvY2tGb2N1c0NhbGxiYWNrcyB8fCAoIGlucHV0Q2FsbGJhY2tOYW1lICE9PSAnZm9jdXNJbicgJiYgaW5wdXRDYWxsYmFja05hbWUgIT09ICdmb2N1c091dCcgKSApIHtcclxuICAgICAgICBpbnB1dC5iYXRjaEV2ZW50KCBldmVudENvbnRleHQsIGJhdGNoVHlwZSwgaW5wdXRbIGlucHV0Q2FsbGJhY2tOYW1lIF0sIHRyaWdnZXJJbW1lZGlhdGUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIExpc3RlbmVyIGZvciB3aW5kb3cncyBwb2ludGVyZG93biBldmVudC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcclxuICAgKi9cclxuICBvbnBvaW50ZXJkb3duOiBmdW5jdGlvbiBvbnBvaW50ZXJkb3duKCBkb21FdmVudCApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ3BvaW50ZXJkb3duJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gR2V0IHRoZSBhY3RpdmUgZWxlbWVudCBCRUZPUkUgYW55IGFjdGlvbnMgYXJlIHRha2VuXHJcbiAgICBjb25zdCBldmVudENvbnRleHQgPSBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApO1xyXG5cclxuICAgIGlmICggZG9tRXZlbnQucG9pbnRlclR5cGUgPT09ICdtb3VzZScgKSB7XHJcbiAgICAgIERpc3BsYXkudXNlckdlc3R1cmVFbWl0dGVyLmVtaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXHJcbiAgICBCcm93c2VyRXZlbnRzLmJhdGNoV2luZG93RXZlbnQoIGV2ZW50Q29udGV4dCwgQmF0Y2hlZERPTUV2ZW50VHlwZS5QT0lOVEVSX1RZUEUsICdwb2ludGVyRG93bicsIGZhbHNlICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBMaXN0ZW5lciBmb3Igd2luZG93J3MgcG9pbnRlcnVwIGV2ZW50LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxyXG4gICAqL1xyXG4gIG9ucG9pbnRlcnVwOiBmdW5jdGlvbiBvbnBvaW50ZXJ1cCggZG9tRXZlbnQgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQoICdwb2ludGVydXAnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBHZXQgdGhlIGFjdGl2ZSBlbGVtZW50IEJFRk9SRSBhbnkgYWN0aW9ucyBhcmUgdGFrZW5cclxuICAgIGNvbnN0IGV2ZW50Q29udGV4dCA9IG5ldyBFdmVudENvbnRleHQoIGRvbUV2ZW50ICk7XHJcblxyXG4gICAgRGlzcGxheS51c2VyR2VzdHVyZUVtaXR0ZXIuZW1pdCgpO1xyXG5cclxuICAgIC8vIE5PVEU6IFdpbGwgYmUgY2FsbGVkIHdpdGhvdXQgYSBwcm9wZXIgJ3RoaXMnIHJlZmVyZW5jZS4gRG8gTk9UIHJlbHkgb24gaXQgaGVyZS5cclxuICAgIEJyb3dzZXJFdmVudHMuYmF0Y2hXaW5kb3dFdmVudCggZXZlbnRDb250ZXh0LCBCYXRjaGVkRE9NRXZlbnRUeXBlLlBPSU5URVJfVFlQRSwgJ3BvaW50ZXJVcCcsIHRydWUgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIExpc3RlbmVyIGZvciB3aW5kb3cncyBwb2ludGVybW92ZSBldmVudC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcclxuICAgKi9cclxuICBvbnBvaW50ZXJtb3ZlOiBmdW5jdGlvbiBvbnBvaW50ZXJtb3ZlKCBkb21FdmVudCApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ3BvaW50ZXJtb3ZlJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxyXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLlBPSU5URVJfVFlQRSwgJ3BvaW50ZXJNb3ZlJywgZmFsc2UgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIExpc3RlbmVyIGZvciB3aW5kb3cncyBwb2ludGVyb3ZlciBldmVudC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcclxuICAgKi9cclxuICBvbnBvaW50ZXJvdmVyOiBmdW5jdGlvbiBvbnBvaW50ZXJvdmVyKCBkb21FdmVudCApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ3BvaW50ZXJvdmVyJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxyXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLlBPSU5URVJfVFlQRSwgJ3BvaW50ZXJPdmVyJywgZmFsc2UgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIExpc3RlbmVyIGZvciB3aW5kb3cncyBwb2ludGVyb3V0IGV2ZW50LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxyXG4gICAqL1xyXG4gIG9ucG9pbnRlcm91dDogZnVuY3Rpb24gb25wb2ludGVyb3V0KCBkb21FdmVudCApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ3BvaW50ZXJvdXQnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXHJcbiAgICBCcm93c2VyRXZlbnRzLmJhdGNoV2luZG93RXZlbnQoIG5ldyBFdmVudENvbnRleHQoIGRvbUV2ZW50ICksIEJhdGNoZWRET01FdmVudFR5cGUuUE9JTlRFUl9UWVBFLCAncG9pbnRlck91dCcsIGZhbHNlICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBMaXN0ZW5lciBmb3Igd2luZG93J3MgcG9pbnRlcmNhbmNlbCBldmVudC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcclxuICAgKi9cclxuICBvbnBvaW50ZXJjYW5jZWw6IGZ1bmN0aW9uIG9ucG9pbnRlcmNhbmNlbCggZG9tRXZlbnQgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQoICdwb2ludGVyY2FuY2VsJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxyXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLlBPSU5URVJfVFlQRSwgJ3BvaW50ZXJDYW5jZWwnLCBmYWxzZSApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogTGlzdGVuZXIgZm9yIHdpbmRvdydzIGdvdHBvaW50ZXJjYXB0dXJlIGV2ZW50LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxyXG4gICAqL1xyXG4gIG9uZ290cG9pbnRlcmNhcHR1cmU6IGZ1bmN0aW9uIG9uZ290cG9pbnRlcmNhcHR1cmUoIGRvbUV2ZW50ICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5PbklucHV0KCAnZ290cG9pbnRlcmNhcHR1cmUnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXHJcbiAgICBCcm93c2VyRXZlbnRzLmJhdGNoV2luZG93RXZlbnQoIG5ldyBFdmVudENvbnRleHQoIGRvbUV2ZW50ICksIEJhdGNoZWRET01FdmVudFR5cGUuUE9JTlRFUl9UWVBFLCAnZ290UG9pbnRlckNhcHR1cmUnLCBmYWxzZSApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogTGlzdGVuZXIgZm9yIHdpbmRvdydzIGxvc3Rwb2ludGVyY2FwdHVyZSBldmVudC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcclxuICAgKi9cclxuICBvbmxvc3Rwb2ludGVyY2FwdHVyZTogZnVuY3Rpb24gb25sb3N0cG9pbnRlcmNhcHR1cmUoIGRvbUV2ZW50ICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5PbklucHV0KCAnbG9zdHBvaW50ZXJjYXB0dXJlJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxyXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLlBPSU5URVJfVFlQRSwgJ2xvc3RQb2ludGVyQ2FwdHVyZScsIGZhbHNlICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBMaXN0ZW5lciBmb3Igd2luZG93J3MgTVNQb2ludGVyRG93biBldmVudC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcclxuICAgKi9cclxuICBvbk1TUG9pbnRlckRvd246IGZ1bmN0aW9uIG9uTVNQb2ludGVyRG93biggZG9tRXZlbnQgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQoICdNU1BvaW50ZXJEb3duJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxyXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLk1TX1BPSU5URVJfVFlQRSwgJ3BvaW50ZXJEb3duJywgZmFsc2UgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIExpc3RlbmVyIGZvciB3aW5kb3cncyBNU1BvaW50ZXJVcCBldmVudC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcclxuICAgKi9cclxuICBvbk1TUG9pbnRlclVwOiBmdW5jdGlvbiBvbk1TUG9pbnRlclVwKCBkb21FdmVudCApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ01TUG9pbnRlclVwJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxyXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLk1TX1BPSU5URVJfVFlQRSwgJ3BvaW50ZXJVcCcsIHRydWUgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIExpc3RlbmVyIGZvciB3aW5kb3cncyBNU1BvaW50ZXJNb3ZlIGV2ZW50LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxyXG4gICAqL1xyXG4gIG9uTVNQb2ludGVyTW92ZTogZnVuY3Rpb24gb25NU1BvaW50ZXJNb3ZlKCBkb21FdmVudCApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ01TUG9pbnRlck1vdmUnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXHJcbiAgICBCcm93c2VyRXZlbnRzLmJhdGNoV2luZG93RXZlbnQoIG5ldyBFdmVudENvbnRleHQoIGRvbUV2ZW50ICksIEJhdGNoZWRET01FdmVudFR5cGUuTVNfUE9JTlRFUl9UWVBFLCAncG9pbnRlck1vdmUnLCBmYWxzZSApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogTGlzdGVuZXIgZm9yIHdpbmRvdydzIE1TUG9pbnRlck92ZXIgZXZlbnQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RXZlbnR9IGRvbUV2ZW50XHJcbiAgICovXHJcbiAgb25NU1BvaW50ZXJPdmVyOiBmdW5jdGlvbiBvbk1TUG9pbnRlck92ZXIoIGRvbUV2ZW50ICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5PbklucHV0KCAnTVNQb2ludGVyT3ZlcicgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIC8vIE5PVEU6IFdpbGwgYmUgY2FsbGVkIHdpdGhvdXQgYSBwcm9wZXIgJ3RoaXMnIHJlZmVyZW5jZS4gRG8gTk9UIHJlbHkgb24gaXQgaGVyZS5cclxuICAgIEJyb3dzZXJFdmVudHMuYmF0Y2hXaW5kb3dFdmVudCggbmV3IEV2ZW50Q29udGV4dCggZG9tRXZlbnQgKSwgQmF0Y2hlZERPTUV2ZW50VHlwZS5NU19QT0lOVEVSX1RZUEUsICdwb2ludGVyT3ZlcicsIGZhbHNlICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBMaXN0ZW5lciBmb3Igd2luZG93J3MgTVNQb2ludGVyT3V0IGV2ZW50LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxyXG4gICAqL1xyXG4gIG9uTVNQb2ludGVyT3V0OiBmdW5jdGlvbiBvbk1TUG9pbnRlck91dCggZG9tRXZlbnQgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQoICdNU1BvaW50ZXJPdXQnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXHJcbiAgICBCcm93c2VyRXZlbnRzLmJhdGNoV2luZG93RXZlbnQoIG5ldyBFdmVudENvbnRleHQoIGRvbUV2ZW50ICksIEJhdGNoZWRET01FdmVudFR5cGUuTVNfUE9JTlRFUl9UWVBFLCAncG9pbnRlck91dCcsIGZhbHNlICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBMaXN0ZW5lciBmb3Igd2luZG93J3MgTVNQb2ludGVyQ2FuY2VsIGV2ZW50LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxyXG4gICAqL1xyXG4gIG9uTVNQb2ludGVyQ2FuY2VsOiBmdW5jdGlvbiBvbk1TUG9pbnRlckNhbmNlbCggZG9tRXZlbnQgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQoICdNU1BvaW50ZXJDYW5jZWwnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXHJcbiAgICBCcm93c2VyRXZlbnRzLmJhdGNoV2luZG93RXZlbnQoIG5ldyBFdmVudENvbnRleHQoIGRvbUV2ZW50ICksIEJhdGNoZWRET01FdmVudFR5cGUuTVNfUE9JTlRFUl9UWVBFLCAncG9pbnRlckNhbmNlbCcsIGZhbHNlICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBMaXN0ZW5lciBmb3Igd2luZG93J3MgdG91Y2hzdGFydCBldmVudC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcclxuICAgKi9cclxuICBvbnRvdWNoc3RhcnQ6IGZ1bmN0aW9uIG9udG91Y2hzdGFydCggZG9tRXZlbnQgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQoICd0b3VjaHN0YXJ0JyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxyXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLlRPVUNIX1RZUEUsICd0b3VjaFN0YXJ0JywgZmFsc2UgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIExpc3RlbmVyIGZvciB3aW5kb3cncyB0b3VjaGVuZCBldmVudC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcclxuICAgKi9cclxuICBvbnRvdWNoZW5kOiBmdW5jdGlvbiBvbnRvdWNoZW5kKCBkb21FdmVudCApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ3RvdWNoZW5kJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gR2V0IHRoZSBhY3RpdmUgZWxlbWVudCBCRUZPUkUgYW55IGFjdGlvbnMgYXJlIHRha2VuXHJcbiAgICBjb25zdCBldmVudENvbnRleHQgPSBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApO1xyXG5cclxuICAgIERpc3BsYXkudXNlckdlc3R1cmVFbWl0dGVyLmVtaXQoKTtcclxuXHJcbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXHJcbiAgICBCcm93c2VyRXZlbnRzLmJhdGNoV2luZG93RXZlbnQoIGV2ZW50Q29udGV4dCwgQmF0Y2hlZERPTUV2ZW50VHlwZS5UT1VDSF9UWVBFLCAndG91Y2hFbmQnLCB0cnVlICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBMaXN0ZW5lciBmb3Igd2luZG93J3MgdG91Y2htb3ZlIGV2ZW50LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxyXG4gICAqL1xyXG4gIG9udG91Y2htb3ZlOiBmdW5jdGlvbiBvbnRvdWNobW92ZSggZG9tRXZlbnQgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQoICd0b3VjaG1vdmUnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXHJcbiAgICBCcm93c2VyRXZlbnRzLmJhdGNoV2luZG93RXZlbnQoIG5ldyBFdmVudENvbnRleHQoIGRvbUV2ZW50ICksIEJhdGNoZWRET01FdmVudFR5cGUuVE9VQ0hfVFlQRSwgJ3RvdWNoTW92ZScsIGZhbHNlICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBMaXN0ZW5lciBmb3Igd2luZG93J3MgdG91Y2hjYW5jZWwgZXZlbnQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RXZlbnR9IGRvbUV2ZW50XHJcbiAgICovXHJcbiAgb250b3VjaGNhbmNlbDogZnVuY3Rpb24gb250b3VjaGNhbmNlbCggZG9tRXZlbnQgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQoICd0b3VjaGNhbmNlbCcgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIC8vIE5PVEU6IFdpbGwgYmUgY2FsbGVkIHdpdGhvdXQgYSBwcm9wZXIgJ3RoaXMnIHJlZmVyZW5jZS4gRG8gTk9UIHJlbHkgb24gaXQgaGVyZS5cclxuICAgIEJyb3dzZXJFdmVudHMuYmF0Y2hXaW5kb3dFdmVudCggbmV3IEV2ZW50Q29udGV4dCggZG9tRXZlbnQgKSwgQmF0Y2hlZERPTUV2ZW50VHlwZS5UT1VDSF9UWVBFLCAndG91Y2hDYW5jZWwnLCBmYWxzZSApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogTGlzdGVuZXIgZm9yIHdpbmRvdydzIG1vdXNlZG93biBldmVudC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcclxuICAgKi9cclxuICBvbm1vdXNlZG93bjogZnVuY3Rpb24gb25tb3VzZWRvd24oIGRvbUV2ZW50ICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5PbklucHV0KCAnbW91c2Vkb3duJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gR2V0IHRoZSBhY3RpdmUgZWxlbWVudCBCRUZPUkUgYW55IGFjdGlvbnMgYXJlIHRha2VuXHJcbiAgICBjb25zdCBldmVudENvbnRleHQgPSBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApO1xyXG5cclxuICAgIERpc3BsYXkudXNlckdlc3R1cmVFbWl0dGVyLmVtaXQoKTtcclxuXHJcbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXHJcbiAgICBCcm93c2VyRXZlbnRzLmJhdGNoV2luZG93RXZlbnQoIGV2ZW50Q29udGV4dCwgQmF0Y2hlZERPTUV2ZW50VHlwZS5NT1VTRV9UWVBFLCAnbW91c2VEb3duJywgZmFsc2UgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIExpc3RlbmVyIGZvciB3aW5kb3cncyBtb3VzZXVwIGV2ZW50LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxyXG4gICAqL1xyXG4gIG9ubW91c2V1cDogZnVuY3Rpb24gb25tb3VzZXVwKCBkb21FdmVudCApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ21vdXNldXAnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBHZXQgdGhlIGFjdGl2ZSBlbGVtZW50IEJFRk9SRSBhbnkgYWN0aW9ucyBhcmUgdGFrZW5cclxuICAgIGNvbnN0IGV2ZW50Q29udGV4dCA9IG5ldyBFdmVudENvbnRleHQoIGRvbUV2ZW50ICk7XHJcblxyXG4gICAgRGlzcGxheS51c2VyR2VzdHVyZUVtaXR0ZXIuZW1pdCgpO1xyXG5cclxuICAgIC8vIE5PVEU6IFdpbGwgYmUgY2FsbGVkIHdpdGhvdXQgYSBwcm9wZXIgJ3RoaXMnIHJlZmVyZW5jZS4gRG8gTk9UIHJlbHkgb24gaXQgaGVyZS5cclxuICAgIEJyb3dzZXJFdmVudHMuYmF0Y2hXaW5kb3dFdmVudCggZXZlbnRDb250ZXh0LCBCYXRjaGVkRE9NRXZlbnRUeXBlLk1PVVNFX1RZUEUsICdtb3VzZVVwJywgdHJ1ZSApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogTGlzdGVuZXIgZm9yIHdpbmRvdydzIG1vdXNlbW92ZSBldmVudC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcclxuICAgKi9cclxuICBvbm1vdXNlbW92ZTogZnVuY3Rpb24gb25tb3VzZW1vdmUoIGRvbUV2ZW50ICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5PbklucHV0KCAnbW91c2Vtb3ZlJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxyXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLk1PVVNFX1RZUEUsICdtb3VzZU1vdmUnLCBmYWxzZSApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogTGlzdGVuZXIgZm9yIHdpbmRvdydzIG1vdXNlb3ZlciBldmVudC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcclxuICAgKi9cclxuICBvbm1vdXNlb3ZlcjogZnVuY3Rpb24gb25tb3VzZW92ZXIoIGRvbUV2ZW50ICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5PbklucHV0KCAnbW91c2VvdmVyJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxyXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLk1PVVNFX1RZUEUsICdtb3VzZU92ZXInLCBmYWxzZSApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogTGlzdGVuZXIgZm9yIHdpbmRvdydzIG1vdXNlb3V0IGV2ZW50LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxyXG4gICAqL1xyXG4gIG9ubW91c2VvdXQ6IGZ1bmN0aW9uIG9ubW91c2VvdXQoIGRvbUV2ZW50ICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5PbklucHV0KCAnbW91c2VvdXQnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXHJcbiAgICBCcm93c2VyRXZlbnRzLmJhdGNoV2luZG93RXZlbnQoIG5ldyBFdmVudENvbnRleHQoIGRvbUV2ZW50ICksIEJhdGNoZWRET01FdmVudFR5cGUuTU9VU0VfVFlQRSwgJ21vdXNlT3V0JywgZmFsc2UgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIExpc3RlbmVyIGZvciB3aW5kb3cncyB3aGVlbCBldmVudC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcclxuICAgKi9cclxuICBvbndoZWVsOiBmdW5jdGlvbiBvbndoZWVsKCBkb21FdmVudCApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ3doZWVsJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxyXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLldIRUVMX1RZUEUsICd3aGVlbCcsIGZhbHNlICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9LFxyXG5cclxuICBvbmZvY3VzaW46IGZ1bmN0aW9uIG9uZm9jdXNpbiggZG9tRXZlbnQgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQoICdmb2N1c2luJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxyXG5cclxuICAgIC8vIGlmICggZG9tRXZlbnQudGFyZ2V0LmlkID09PSAnZGlzcGxheTEtcHJpbWFyeS0zMC00NC0yNzk1LTI4MDItMjc5Ny0yODA2LTMwMTItMzAxMS0yOTkyJyApIHtcclxuICAgIC8vICAgZGVidWdnZXI7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLkFMVF9UWVBFLCAnZm9jdXNJbicsIHRydWUgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH0sXHJcblxyXG4gIG9uZm9jdXNvdXQ6IGZ1bmN0aW9uIG9uZm9jdXNvdXQoIGRvbUV2ZW50ICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5PbklucHV0KCAnZm9jdXNvdXQnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXHJcbiAgICBCcm93c2VyRXZlbnRzLmJhdGNoV2luZG93RXZlbnQoIG5ldyBFdmVudENvbnRleHQoIGRvbUV2ZW50ICksIEJhdGNoZWRET01FdmVudFR5cGUuQUxUX1RZUEUsICdmb2N1c091dCcsIHRydWUgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH0sXHJcblxyXG4gIG9uaW5wdXQ6IGZ1bmN0aW9uIG9uaW5wdXQoIGRvbUV2ZW50ICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5PbklucHV0KCAnaW5wdXQnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXHJcblxyXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLkFMVF9UWVBFLCAnaW5wdXQnLCB0cnVlICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9LFxyXG5cclxuICBvbmNoYW5nZTogZnVuY3Rpb24gb25jaGFuZ2UoIGRvbUV2ZW50ICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5PbklucHV0KCAnY2hhbmdlJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxyXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLkFMVF9UWVBFLCAnY2hhbmdlJywgdHJ1ZSApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfSxcclxuXHJcbiAgb25jbGljazogZnVuY3Rpb24gb25jbGljayggZG9tRXZlbnQgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQoICdjbGljaycgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIC8vIE5PVEU6IFdpbGwgYmUgY2FsbGVkIHdpdGhvdXQgYSBwcm9wZXIgJ3RoaXMnIHJlZmVyZW5jZS4gRG8gTk9UIHJlbHkgb24gaXQgaGVyZS5cclxuICAgIEJyb3dzZXJFdmVudHMuYmF0Y2hXaW5kb3dFdmVudCggbmV3IEV2ZW50Q29udGV4dCggZG9tRXZlbnQgKSwgQmF0Y2hlZERPTUV2ZW50VHlwZS5BTFRfVFlQRSwgJ2NsaWNrJywgdHJ1ZSApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfSxcclxuXHJcbiAgb25rZXlkb3duOiBmdW5jdGlvbiBvbmtleWRvd24oIGRvbUV2ZW50ICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5PbklucHV0KCAna2V5ZG93bicgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIC8vIE5PVEU6IFdpbGwgYmUgY2FsbGVkIHdpdGhvdXQgYSBwcm9wZXIgJ3RoaXMnIHJlZmVyZW5jZS4gRG8gTk9UIHJlbHkgb24gaXQgaGVyZS5cclxuICAgIEJyb3dzZXJFdmVudHMuYmF0Y2hXaW5kb3dFdmVudCggbmV3IEV2ZW50Q29udGV4dCggZG9tRXZlbnQgKSwgQmF0Y2hlZERPTUV2ZW50VHlwZS5BTFRfVFlQRSwgJ2tleURvd24nLCB0cnVlICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9LFxyXG5cclxuICBvbmtleXVwOiBmdW5jdGlvbiBvbmtleXVwKCBkb21FdmVudCApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ2tleXVwJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxyXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLkFMVF9UWVBFLCAna2V5VXAnLCB0cnVlICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcbn07XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnQnJvd3NlckV2ZW50cycsIEJyb3dzZXJFdmVudHMgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJyb3dzZXJFdmVudHM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFdBQVcsTUFBTSxzQ0FBc0M7QUFDOUQsT0FBT0MsUUFBUSxNQUFNLG1DQUFtQztBQUN4RCxTQUFTQyxtQkFBbUIsRUFBRUMsT0FBTyxFQUFFQyxZQUFZLEVBQUVDLFFBQVEsRUFBRUMsWUFBWSxFQUFFQyxxQkFBcUIsRUFBRUMsU0FBUyxFQUFFQyxPQUFPLFFBQVEsZUFBZTs7QUFFN0k7QUFDQSxNQUFNQyxJQUFJLEdBQUdBLENBQUEsS0FBTSxDQUFDLENBQUM7O0FBRXJCO0FBQ0EsSUFBSUMsa0JBQWtCLEdBQUcsS0FBSztBQUU5QixNQUFNQyxhQUFhLEdBQUc7RUFFcEI7RUFDQTtFQUNBO0VBQ0FDLG1CQUFtQixFQUFFLEtBQUs7RUFFMUI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLFVBQVVBLENBQUVDLE9BQU8sRUFBRUMsY0FBYyxFQUFFQyxhQUFh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