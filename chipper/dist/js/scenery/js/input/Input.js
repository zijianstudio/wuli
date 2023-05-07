// Copyright 2013-2023, University of Colorado Boulder

/**
 * Main handler for user-input events in Scenery.
 *
 * *** Adding input handling to a display
 *
 * Displays do not have event listeners attached by default. To initialize the event system (that will set up
 * listeners), use one of Display's initialize*Events functions.
 *
 * *** Pointers
 *
 * A 'pointer' is an abstract way of describing a mouse, a single touch point, or a pen/stylus, similar to in the
 * Pointer Events specification (https://dvcs.w3.org/hg/pointerevents/raw-file/tip/pointerEvents.html). Touch and pen
 * pointers are transient, created when the relevant DOM down event occurs and released when corresponding the DOM up
 * or cancel event occurs. However, the mouse pointer is persistent.
 *
 * Input event listeners can be added to {Node}s directly, or to a pointer. When a DOM event is received, it is first
 * broken up into multiple events (if necessary, e.g. multiple touch points), then the dispatch is handled for each
 * individual Scenery event. Events are first fired for any listeners attached to the pointer that caused the event,
 * then fire on the node directly under the pointer, and if applicable, bubble up the graph to the Scene from which the
 * event was triggered. Events are not fired directly on nodes that are not under the pointer at the time of the event.
 * To handle many common patterns (like button presses, where mouse-ups could happen when not over the button), it is
 * necessary to add those move/up listeners to the pointer itself.
 *
 * *** Listeners and Events
 *
 * Event listeners are added with node.addInputListener( listener ), pointer.addInputListener( listener ) and
 * display.addInputListener( listener ).
 * This listener can be an arbitrary object, and the listener will be triggered by calling listener[eventType]( event ),
 * where eventType is one of the event types as described below, and event is a Scenery event with the
 * following properties:
 * - trail {Trail} - Points to the node under the pointer
 * - pointer {Pointer} - The pointer that triggered the event. Additional information about the mouse/touch/pen can be
 *                       obtained from the pointer, for example event.pointer.point.
 * - type {string} - The base type of the event (e.g. for touch down events, it will always just be "down").
 * - domEvent {UIEvent} - The underlying DOM event that triggered this Scenery event. The DOM event may correspond to
 *                        multiple Scenery events, particularly for touch events. This could be a TouchEvent,
 *                        PointerEvent, MouseEvent, MSPointerEvent, etc.
 * - target {Node} - The leaf-most Node in the trail.
 * - currentTarget {Node} - The Node to which the listener being fired is attached, or null if the listener is being
 *                          fired directly from a pointer.
 *
 * Additionally, listeners may support an interrupt() method that detaches it from pointers, or may support being
 * "attached" to a pointer (indicating a primary role in controlling the pointer's behavior). See Pointer for more
 * information about these interactions.
 *
 * *** Event Types
 *
 * Scenery will fire the following base event types:
 *
 * - down: Triggered when a pointer is pressed down. Touch / pen pointers are created for each down event, and are
 *         active until an up/cancel event is sent.
 * - up: Triggered when a pointer is released normally. Touch / pen pointers will not have any more events associated
 *       with them after an up event.
 * - cancel: Triggered when a pointer is canceled abnormally. Touch / pen pointers will not have any more events
 *           associated with them after an up event.
 * - move: Triggered when a pointer moves.
 * - wheel: Triggered when the (mouse) wheel is scrolled. The associated pointer will have wheelDelta information.
 * - enter: Triggered when a pointer moves over a Node or one of its children. Does not bubble up. Mirrors behavior from
 *          the DOM mouseenter (http://www.w3.org/TR/DOM-Level-3-Events/#event-type-mouseenter)
 * - exit:  Triggered when a pointer moves out from over a Node or one of its children. Does not bubble up. Mirrors
 *          behavior from the DOM mouseleave (http://www.w3.org/TR/DOM-Level-3-Events/#event-type-mouseleave).
 * - over: Triggered when a pointer moves over a Node (not including its children). Mirrors behavior from the DOM
 *         mouseover (http://www.w3.org/TR/DOM-Level-3-Events/#event-type-mouseover).
 * - out: Triggered when a pointer moves out from over a Node (not including its children). Mirrors behavior from the
 *        DOM mouseout (http://www.w3.org/TR/DOM-Level-3-Events/#event-type-mouseout).
 *
 * Before firing the base event type (for example, 'move'), Scenery will also fire an event specific to the type of
 * pointer. For mice, it will fire 'mousemove', for touch events it will fire 'touchmove', and for pen events it will
 * fire 'penmove'. Similarly, for any type of event, it will first fire pointerType+eventType, and then eventType.
 *
 * **** PDOM Specific Event Types
 *
 * Some event types can only be triggered from the PDOM. If a SCENERY/Node has accessible content (see
 * ParallelDOM.js for more info), then listeners can be added for events fired from the PDOM. The accessibility events
 * triggered from a Node are dependent on the `tagName` (ergo the HTMLElement primary sibling) specified by the Node.
 *
 * Some terminology for understanding:
 * - PDOM:  parallel DOM, see ParallelDOM.js
 * - Primary Sibling:  The Node's HTMLElement in the PDOM that is interacted with for accessible interactions and to
 *                     display accessible content. The primary sibling has the tag name specified by the `tagName`
 *                     option, see `ParallelDOM.setTagName`. Primary sibling is further defined in PDOMPeer.js
 * - Assistive Technology:  aka AT, devices meant to improve the capabilities of an individual with a disability.
 *
 * The following are the supported accessible events:
 *
 * - focus: Triggered when navigation focus is set to this Node's primary sibling. This can be triggered with some
 *          AT too, like screen readers' virtual cursor, but that is not dependable as it can be toggled with a screen
 *          reader option. Furthermore, this event is not triggered on mobile devices. Does not bubble.
 * - focusin: Same as 'focus' event, but bubbles.
 * - blur:  Triggered when navigation focus leaves this Node's primary sibling. This can be triggered with some
 *          AT too, like screen readers' virtual cursor, but that is not dependable as it can be toggled with a screen
 *          reader option. Furthermore, this event is not triggered on mobile devices.
 * - focusout: Same as 'blur' event, but bubbles.
 * - click:  Triggered when this Node's primary sibling is clicked. Note, though this event seems similar to some base
 *           event types (the event implements `MouseEvent`), it only applies when triggered from the PDOM.
 *           See https://www.w3.org/TR/DOM-Level-3-Events/#click
 * - input:  Triggered when the value of an <input>, <select>, or <textarea> element has been changed.
 *           See https://www.w3.org/TR/DOM-Level-3-Events/#input
 * - change:  Triggered for <input>, <select>, and <textarea> elements when an alteration to the element's value is
 *            committed by the user. Unlike the input event, the change event is not necessarily fired for each
 *            alteration to an element's value. See
 *            https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event and
 *            https://html.spec.whatwg.org/multipage/indices.html#event-change
 * - keydown: Triggered for all keys pressed. When a screen reader is active, this event will be omitted
 *            role="button" is activated.
 *            See https://www.w3.org/TR/DOM-Level-3-Events/#keydown
 * - keyup :  Triggered for all keys when released. When a screen reader is active, this event will be omitted
 *            role="button" is activated.
 *            See https://www.w3.org/TR/DOM-Level-3-Events/#keyup
 * - globalkeydown: Triggered for all keys pressed, regardless of whether the Node has focus. It just needs to be
 *                  visible, inputEnabled, and all of its ancestors visible and inputEnabled.
 * - globalkeyup:   Triggered for all keys released, regardless of whether the Node has focus. It just needs to be
 *                  visible, inputEnabled, and all of its ancestors visible and inputEnabled.
 *
 *
 * *** Event Dispatch
 *
 * Events have two methods that will cause early termination: event.abort() will cause no more listeners to be notified
 * for this event, and event.handle() will allow the current level of listeners to be notified (all pointer listeners,
 * or all listeners attached to the current node), but no more listeners after that level will fire. handle and abort
 * are like stopPropagation, stopImmediatePropagation for DOM events, except they do not trigger those DOM methods on
 * the underlying DOM event.
 *
 * Up/down/cancel events all happen separately, but for move events, a specific sequence of events occurs if the pointer
 * changes the node it is over:
 *
 * 1. The move event is fired (and bubbles).
 * 2. An out event is fired for the old topmost Node (and bubbles).
 * 3. exit events are fired for all Nodes in the Trail hierarchy that are now not under the pointer, from the root-most
 *    to the leaf-most. Does not bubble.
 * 4. enter events are fired for all Nodes in the Trail hierarchy that were not under the pointer (but now are), from
 *    the leaf-most to the root-most. Does not bubble.
 * 5. An over event is fired for the new topmost Node (and bubbles).
 *
 * event.abort() and event.handle() will currently not affect other stages in the 'move' sequence (e.g. event.abort() in
 * the 'move' event will not affect the following 'out' event).
 *
 * For each event type:
 *
 * 1. Listeners on the pointer will be triggered first (in the order they were added)
 * 2. Listeners on the target (top-most) Node will be triggered (in the order they were added to that Node)
 * 3. Then if the event bubbles, each Node in the Trail will be triggered, starting from the Node under the top-most
 *    (that just had listeners triggered) and all the way down to the Scene. Listeners are triggered in the order they
 *    were added for each Node.
 * 4. Listeners on the display will be triggered (in the order they were added)
 *
 * For each listener being notified, it will fire the more specific pointerType+eventType first (e.g. 'mousemove'),
 * then eventType next (e.g. 'move').
 *
 * Currently, preventDefault() is called on the associated DOM event if the top-most node has the 'interactive' property
 * set to a truthy value.
 *
 * *** Relevant Specifications
 *
 * DOM Level 3 events spec: http://www.w3.org/TR/DOM-Level-3-Events/
 * Touch events spec: http://www.w3.org/TR/touch-events/
 * Pointer events spec draft: https://dvcs.w3.org/hg/pointerevents/raw-file/tip/pointerEvents.html
 *                            http://msdn.microsoft.com/en-us/library/ie/hh673557(v=vs.85).aspx
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 */

import PhetioAction from '../../../tandem/js/PhetioAction.js';
import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import Vector2 from '../../../dot/js/Vector2.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import optionize from '../../../phet-core/js/optionize.js';
import platform from '../../../phet-core/js/platform.js';
import EventType from '../../../tandem/js/EventType.js';
import Tandem from '../../../tandem/js/Tandem.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import { BatchedDOMEvent, BatchedDOMEventType, BrowserEvents, Display, EventContext, EventContextIO, Mouse, PDOMInstance, PDOMPointer, PDOMUtils, Pen, Pointer, scenery, SceneryEvent, Touch, Trail } from '../imports.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import IOType from '../../../tandem/js/types/IOType.js';
import ArrayIO from '../../../tandem/js/types/ArrayIO.js';
const ArrayIOPointerIO = ArrayIO(Pointer.PointerIO);

// This is the list of keys that get serialized AND deserialized. NOTE: Do not add or change this without
// consulting the PhET-iO IOType schema for this in EventIO
const domEventPropertiesToSerialize = ['altKey', 'button', 'charCode', 'clientX', 'clientY', 'code', 'ctrlKey', 'deltaMode', 'deltaX', 'deltaY', 'deltaZ', 'key', 'keyCode', 'metaKey', 'pageX', 'pageY', 'pointerId', 'pointerType', 'scale', 'shiftKey', 'target', 'type', 'relatedTarget', 'which'];

// The list of serialized properties needed for deserialization

// Cannot be set after construction, and should be provided in the init config to the constructor(), see Input.deserializeDOMEvent
const domEventPropertiesSetInConstructor = ['deltaMode', 'deltaX', 'deltaY', 'deltaZ', 'altKey', 'button', 'charCode', 'clientX', 'clientY', 'code', 'ctrlKey', 'key', 'keyCode', 'metaKey', 'pageX', 'pageY', 'pointerId', 'pointerType', 'shiftKey', 'type', 'relatedTarget', 'which'];
// A list of keys on events that need to be serialized into HTMLElements
const EVENT_KEY_VALUES_AS_ELEMENTS = ['target', 'relatedTarget'];

// A list of events that should still fire, even when the Node is not pickable
const PDOM_UNPICKABLE_EVENTS = ['focus', 'blur', 'focusin', 'focusout'];
const TARGET_SUBSTITUTE_KEY = 'targetSubstitute';
// A bit more than the maximum amount of time that iOS 14 VoiceOver was observed to delay between
// sending a mouseup event and a click event.
const PDOM_CLICK_DELAY = 80;
export default class Input extends PhetioObject {
  // Pointer for accessibility, only created lazily on first pdom event.

  // Pointer for mouse, only created lazily on first mouse event, so no mouse is allocated on tablets.

  // All active pointers.

  // Whether we are currently firing events. We need to track this to handle re-entrant cases
  // like https://github.com/phetsims/balloons-and-static-electricity/issues/406.
  // In miliseconds, the DOMEvent timeStamp when we receive a logical up event.
  // We can compare this to the timeStamp on a click vent to filter out the click events
  // when some screen readers send both down/up events AND click events to the target
  // element, see https://github.com/phetsims/scenery/issues/1094
  // Emits pointer validation to the input stream for playback
  // This is a high frequency event that is necessary for reproducible playbacks
  // If accessible
  static InputIO = new IOType('InputIO', {
    valueType: Input,
    applyState: _.noop,
    toStateObject: input => {
      return {
        pointers: ArrayIOPointerIO.toStateObject(input.pointers)
      };
    },
    stateSchema: {
      pointers: ArrayIOPointerIO
    }
  });

  /**
   * @param display
   * @param attachToWindow - Whether to add listeners to the window (instead of the Display's domElement).
   * @param batchDOMEvents - If true, most event types will be batched until otherwise triggered.
   * @param assumeFullWindow - We can optimize certain things like computing points if we know the display
   *                                     fills the entire window.
   * @param passiveEvents - See Display's documentation (controls the presence of the passive flag for
   *                                       events, which has some advanced considerations).
   *
   * @param [providedOptions]
   */
  constructor(display, attachToWindow, batchDOMEvents, assumeFullWindow, passiveEvents, providedOptions) {
    const options = optionize()({
      phetioType: Input.InputIO,
      tandem: Tandem.OPTIONAL,
      phetioDocumentation: 'Central point for user input events, such as mouse, touch'
    }, providedOptions);
    super(options);
    this.display = display;
    this.rootNode = display.rootNode;
    this.attachToWindow = attachToWindow;
    this.batchDOMEvents = batchDOMEvents;
    this.assumeFullWindow = assumeFullWindow;
    this.passiveEvents = passiveEvents;
    this.batchedEvents = [];
    this.pdomPointer = null;
    this.mouse = null;
    this.pointers = [];
    this.pointerAddedEmitter = new TinyEmitter();
    this.currentlyFiringEvents = false;
    this.upTimeStamp = 0;

    ////////////////////////////////////////////////////
    // Declare the Actions that send scenery input events to the PhET-iO data stream.  Note they use the default value
    // of phetioReadOnly false, in case a client wants to synthesize events.

    this.validatePointersAction = new PhetioAction(() => {
      let i = this.pointers.length;
      while (i--) {
        const pointer = this.pointers[i];
        if (pointer.point && pointer !== this.pdomPointer) {
          this.branchChangeEvents(pointer, pointer.lastEventContext || EventContext.createSynthetic(), false);
        }
      }
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('validatePointersAction'),
      phetioHighFrequency: true
    });
    this.mouseUpAction = new PhetioAction((point, context) => {
      const mouse = this.ensureMouse(point);
      mouse.id = null;
      this.upEvent(mouse, context, point);
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('mouseUpAction'),
      parameters: [{
        name: 'point',
        phetioType: Vector2.Vector2IO
      }, {
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when a mouse button is released.'
    });
    this.mouseDownAction = new PhetioAction((id, point, context) => {
      const mouse = this.ensureMouse(point);
      mouse.id = id;
      this.downEvent(mouse, context, point);
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('mouseDownAction'),
      parameters: [{
        name: 'id',
        phetioType: NullableIO(NumberIO)
      }, {
        name: 'point',
        phetioType: Vector2.Vector2IO
      }, {
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when a mouse button is pressed.'
    });
    this.mouseMoveAction = new PhetioAction((point, context) => {
      const mouse = this.ensureMouse(point);
      mouse.move(point);
      this.moveEvent(mouse, context);
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('mouseMoveAction'),
      parameters: [{
        name: 'point',
        phetioType: Vector2.Vector2IO
      }, {
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when the mouse is moved.',
      phetioHighFrequency: true
    });
    this.mouseOverAction = new PhetioAction((point, context) => {
      const mouse = this.ensureMouse(point);
      mouse.over(point);
      // TODO: how to handle mouse-over (and log it)... are we changing the pointer.point without a branch change?
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('mouseOverAction'),
      parameters: [{
        name: 'point',
        phetioType: Vector2.Vector2IO
      }, {
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when the mouse is moved while on the sim.'
    });
    this.mouseOutAction = new PhetioAction((point, context) => {
      const mouse = this.ensureMouse(point);
      mouse.out(point);
      // TODO: how to handle mouse-out (and log it)... are we changing the pointer.point without a branch change?
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('mouseOutAction'),
      parameters: [{
        name: 'point',
        phetioType: Vector2.Vector2IO
      }, {
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when the mouse moves out of the display.'
    });
    this.wheelScrollAction = new PhetioAction(context => {
      const event = context.domEvent;
      const mouse = this.ensureMouse(this.pointFromEvent(event));
      mouse.wheel(event);

      // don't send mouse-wheel events if we don't yet have a mouse location!
      // TODO: Can we set the mouse location based on the wheel event?
      if (mouse.point) {
        const trail = this.rootNode.trailUnderPointer(mouse) || new Trail(this.rootNode);
        this.dispatchEvent(trail, 'wheel', mouse, context, true);
      }
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('wheelScrollAction'),
      parameters: [{
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when the mouse wheel scrolls.',
      phetioHighFrequency: true
    });
    this.touchStartAction = new PhetioAction((id, point, context) => {
      const touch = new Touch(id, point, context.domEvent);
      this.addPointer(touch);
      this.downEvent(touch, context, point);
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('touchStartAction'),
      parameters: [{
        name: 'id',
        phetioType: NumberIO
      }, {
        name: 'point',
        phetioType: Vector2.Vector2IO
      }, {
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when a touch begins.'
    });
    this.touchEndAction = new PhetioAction((id, point, context) => {
      const touch = this.findPointerById(id);
      if (touch) {
        assert && assert(touch instanceof Touch); // eslint-disable-line no-simple-type-checking-assertions, bad-sim-text
        this.upEvent(touch, context, point);
        this.removePointer(touch);
      }
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('touchEndAction'),
      parameters: [{
        name: 'id',
        phetioType: NumberIO
      }, {
        name: 'point',
        phetioType: Vector2.Vector2IO
      }, {
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when a touch ends.'
    });
    this.touchMoveAction = new PhetioAction((id, point, context) => {
      const touch = this.findPointerById(id);
      if (touch) {
        assert && assert(touch instanceof Touch); // eslint-disable-line no-simple-type-checking-assertions, bad-sim-text
        touch.move(point);
        this.moveEvent(touch, context);
      }
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('touchMoveAction'),
      parameters: [{
        name: 'id',
        phetioType: NumberIO
      }, {
        name: 'point',
        phetioType: Vector2.Vector2IO
      }, {
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when a touch moves.',
      phetioHighFrequency: true
    });
    this.touchCancelAction = new PhetioAction((id, point, context) => {
      const touch = this.findPointerById(id);
      if (touch) {
        assert && assert(touch instanceof Touch); // eslint-disable-line no-simple-type-checking-assertions, bad-sim-text
        this.cancelEvent(touch, context, point);
        this.removePointer(touch);
      }
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('touchCancelAction'),
      parameters: [{
        name: 'id',
        phetioType: NumberIO
      }, {
        name: 'point',
        phetioType: Vector2.Vector2IO
      }, {
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when a touch is canceled.'
    });
    this.penStartAction = new PhetioAction((id, point, context) => {
      const pen = new Pen(id, point, context.domEvent);
      this.addPointer(pen);
      this.downEvent(pen, context, point);
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('penStartAction'),
      parameters: [{
        name: 'id',
        phetioType: NumberIO
      }, {
        name: 'point',
        phetioType: Vector2.Vector2IO
      }, {
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when a pen touches the screen.'
    });
    this.penEndAction = new PhetioAction((id, point, context) => {
      const pen = this.findPointerById(id);
      if (pen) {
        this.upEvent(pen, context, point);
        this.removePointer(pen);
      }
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('penEndAction'),
      parameters: [{
        name: 'id',
        phetioType: NumberIO
      }, {
        name: 'point',
        phetioType: Vector2.Vector2IO
      }, {
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when a pen is lifted.'
    });
    this.penMoveAction = new PhetioAction((id, point, context) => {
      const pen = this.findPointerById(id);
      if (pen) {
        pen.move(point);
        this.moveEvent(pen, context);
      }
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('penMoveAction'),
      parameters: [{
        name: 'id',
        phetioType: NumberIO
      }, {
        name: 'point',
        phetioType: Vector2.Vector2IO
      }, {
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when a pen is moved.',
      phetioHighFrequency: true
    });
    this.penCancelAction = new PhetioAction((id, point, context) => {
      const pen = this.findPointerById(id);
      if (pen) {
        this.cancelEvent(pen, context, point);
        this.removePointer(pen);
      }
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('penCancelAction'),
      parameters: [{
        name: 'id',
        phetioType: NumberIO
      }, {
        name: 'point',
        phetioType: Vector2.Vector2IO
      }, {
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when a pen is canceled.'
    });
    this.gotPointerCaptureAction = new PhetioAction((id, context) => {
      const pointer = this.findPointerById(id);
      if (pointer) {
        pointer.onGotPointerCapture();
      }
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('gotPointerCaptureAction'),
      parameters: [{
        name: 'id',
        phetioType: NumberIO
      }, {
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when a pointer is captured (normally at the start of an interaction)',
      phetioHighFrequency: true
    });
    this.lostPointerCaptureAction = new PhetioAction((id, context) => {
      const pointer = this.findPointerById(id);
      if (pointer) {
        pointer.onLostPointerCapture();
      }
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('lostPointerCaptureAction'),
      parameters: [{
        name: 'id',
        phetioType: NumberIO
      }, {
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when a pointer loses its capture (normally at the end of an interaction)',
      phetioHighFrequency: true
    });
    this.focusinAction = new PhetioAction(context => {
      const trail = this.getPDOMEventTrail(context.domEvent, 'focusin');
      if (!trail) {
        return;
      }
      sceneryLog && sceneryLog.Input && sceneryLog.Input(`focusin(${Input.debugText(null, context.domEvent)});`);
      sceneryLog && sceneryLog.Input && sceneryLog.push();
      this.dispatchPDOMEvent(trail, 'focus', context, false);
      this.dispatchPDOMEvent(trail, 'focusin', context, true);
      sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('focusinAction'),
      parameters: [{
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when the PDOM root gets the focusin DOM event.'
    });
    this.focusoutAction = new PhetioAction(context => {
      const trail = this.getPDOMEventTrail(context.domEvent, 'focusout');
      if (!trail) {
        return;
      }
      sceneryLog && sceneryLog.Input && sceneryLog.Input(`focusOut(${Input.debugText(null, context.domEvent)});`);
      sceneryLog && sceneryLog.Input && sceneryLog.push();
      this.dispatchPDOMEvent(trail, 'blur', context, false);
      this.dispatchPDOMEvent(trail, 'focusout', context, true);
      sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('focusoutAction'),
      parameters: [{
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when the PDOM root gets the focusout DOM event.'
    });

    // https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event notes that the click action should result
    // in a MouseEvent
    this.clickAction = new PhetioAction(context => {
      const trail = this.getPDOMEventTrail(context.domEvent, 'click');
      if (!trail) {
        return;
      }
      sceneryLog && sceneryLog.Input && sceneryLog.Input(`click(${Input.debugText(null, context.domEvent)});`);
      sceneryLog && sceneryLog.Input && sceneryLog.push();
      this.dispatchPDOMEvent(trail, 'click', context, true);
      sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('clickAction'),
      parameters: [{
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when the PDOM root gets the click DOM event.'
    });
    this.inputAction = new PhetioAction(context => {
      const trail = this.getPDOMEventTrail(context.domEvent, 'input');
      if (!trail) {
        return;
      }
      sceneryLog && sceneryLog.Input && sceneryLog.Input(`input(${Input.debugText(null, context.domEvent)});`);
      sceneryLog && sceneryLog.Input && sceneryLog.push();
      this.dispatchPDOMEvent(trail, 'input', context, true);
      sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('inputAction'),
      parameters: [{
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when the PDOM root gets the input DOM event.'
    });
    this.changeAction = new PhetioAction(context => {
      const trail = this.getPDOMEventTrail(context.domEvent, 'change');
      if (!trail) {
        return;
      }
      sceneryLog && sceneryLog.Input && sceneryLog.Input(`change(${Input.debugText(null, context.domEvent)});`);
      sceneryLog && sceneryLog.Input && sceneryLog.push();
      this.dispatchPDOMEvent(trail, 'change', context, true);
      sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('changeAction'),
      parameters: [{
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when the PDOM root gets the change DOM event.'
    });
    this.keydownAction = new PhetioAction(context => {
      sceneryLog && sceneryLog.Input && sceneryLog.Input(`keydown(${Input.debugText(null, context.domEvent)});`);
      sceneryLog && sceneryLog.Input && sceneryLog.push();
      this.dispatchGlobalEvent('globalkeydown', context, true);
      const trail = this.getPDOMEventTrail(context.domEvent, 'keydown');
      trail && this.dispatchPDOMEvent(trail, 'keydown', context, true);
      this.dispatchGlobalEvent('globalkeydown', context, false);
      sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('keydownAction'),
      parameters: [{
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when the PDOM root gets the keydown DOM event.'
    });
    this.keyupAction = new PhetioAction(context => {
      sceneryLog && sceneryLog.Input && sceneryLog.Input(`keyup(${Input.debugText(null, context.domEvent)});`);
      sceneryLog && sceneryLog.Input && sceneryLog.push();
      this.dispatchGlobalEvent('globalkeyup', context, true);
      const trail = this.getPDOMEventTrail(context.domEvent, 'keydown');
      trail && this.dispatchPDOMEvent(trail, 'keyup', context, true);
      this.dispatchGlobalEvent('globalkeyup', context, false);
      sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('keyupAction'),
      parameters: [{
        name: 'context',
        phetioType: EventContextIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Emits when the PDOM root gets the keyup DOM event.'
    });
  }

  /**
   * Interrupts any input actions that are currently taking place (should stop drags, etc.)
   */
  interruptPointers() {
    _.each(this.pointers, pointer => {
      pointer.interruptAll();
    });
  }

  /**
   * Called to batch a raw DOM event (which may be immediately fired, depending on the settings). (scenery-internal)
   *
   * @param context
   * @param batchType - See BatchedDOMEvent's "enumeration"
   * @param callback - Parameter types defined by the batchType. See BatchedDOMEvent for details
   * @param triggerImmediate - Certain events can force immediate action, since browsers like Chrome
   *                                     only allow certain operations in the callback for a user gesture (e.g. like
   *                                     a mouseup to open a window).
   */
  batchEvent(context, batchType, callback, triggerImmediate) {
    sceneryLog && sceneryLog.InputEvent && sceneryLog.InputEvent('Input.batchEvent');
    sceneryLog && sceneryLog.InputEvent && sceneryLog.push();

    // If our display is not interactive, do not respond to any events (but still prevent default)
    if (this.display.interactive) {
      this.batchedEvents.push(BatchedDOMEvent.pool.create(context, batchType, callback));
      if (triggerImmediate || !this.batchDOMEvents) {
        this.fireBatchedEvents();
      }
      // NOTE: If we ever want to Display.updateDisplay() on events, do so here
    }

    // Always preventDefault on touch events, since we don't want mouse events triggered afterwards. See
    // http://www.html5rocks.com/en/mobile/touchandmouse/ for more information.
    // Additionally, IE had some issues with skipping prevent default, see
    // https://github.com/phetsims/scenery/issues/464 for mouse handling.
    // WE WILL NOT preventDefault() on keyboard or alternative input events here
    if (!(this.passiveEvents === true) && (callback !== this.mouseDown || platform.edge) && batchType !== BatchedDOMEventType.ALT_TYPE) {
      // We cannot prevent a passive event, so don't try
      context.domEvent.preventDefault();
    }
    sceneryLog && sceneryLog.InputEvent && sceneryLog.pop();
  }

  /**
   * Fires all of our events that were batched into the batchedEvents array. (scenery-internal)
   */
  fireBatchedEvents() {
    sceneryLog && sceneryLog.InputEvent && this.currentlyFiringEvents && sceneryLog.InputEvent('REENTRANCE DETECTED');
    // Don't re-entrantly enter our loop, see https://github.com/phetsims/balloons-and-static-electricity/issues/406
    if (!this.currentlyFiringEvents && this.batchedEvents.length) {
      sceneryLog && sceneryLog.InputEvent && sceneryLog.InputEvent(`Input.fireBatchedEvents length:${this.batchedEvents.length}`);
      sceneryLog && sceneryLog.InputEvent && sceneryLog.push();
      this.currentlyFiringEvents = true;

      // needs to be done in order
      const batchedEvents = this.batchedEvents;
      // IMPORTANT: We need to check the length of the array at every iteration, as it can change due to re-entrant
      // event handling, see https://github.com/phetsims/balloons-and-static-electricity/issues/406.
      // Events may be appended to this (synchronously) as part of firing initial events, so we want to FULLY run all
      // events before clearing our array.
      for (let i = 0; i < batchedEvents.length; i++) {
        const batchedEvent = batchedEvents[i];
        batchedEvent.run(this);
        batchedEvent.dispose();
      }
      cleanArray(batchedEvents);
      this.currentlyFiringEvents = false;
      sceneryLog && sceneryLog.InputEvent && sceneryLog.pop();
    }
  }

  /**
   * Clears any batched events that we don't want to process. (scenery-internal)
   *
   * NOTE: It is HIGHLY recommended to interrupt pointers and remove non-Mouse pointers before doing this, as
   * otherwise it can cause incorrect state in certain types of listeners (e.g. ones that count how many pointers
   * are over them).
   */
  clearBatchedEvents() {
    this.batchedEvents.length = 0;
  }

  /**
   * Checks all pointers to see whether they are still "over" the same nodes (trail). If not, it will fire the usual
   * enter/exit events. (scenery-internal)
   */
  validatePointers() {
    this.validatePointersAction.execute();
  }

  /**
   * Removes all non-Mouse pointers from internal tracking. (scenery-internal)
   */
  removeTemporaryPointers() {
    for (let i = this.pointers.length - 1; i >= 0; i--) {
      const pointer = this.pointers[i];
      if (!(pointer instanceof Mouse)) {
        this.pointers.splice(i, 1);

        // Send exit events. As we can't get a DOM event, we'll send a fake object instead.
        const exitTrail = pointer.trail || new Trail(this.rootNode);
        this.exitEvents(pointer, EventContext.createSynthetic(), exitTrail, 0, true);
      }
    }
  }

  /**
   * Hooks up DOM listeners to whatever type of object we are going to listen to. (scenery-internal)
   */
  connectListeners() {
    BrowserEvents.addDisplay(this.display, this.attachToWindow, this.passiveEvents);
  }

  /**
   * Removes DOM listeners from whatever type of object we were listening to. (scenery-internal)
   */
  disconnectListeners() {
    BrowserEvents.removeDisplay(this.display, this.attachToWindow, this.passiveEvents);
  }

  /**
   * Extract a {Vector2} global coordinate point from an arbitrary DOM event. (scenery-internal)
   */
  pointFromEvent(domEvent) {
    const position = Vector2.pool.create(domEvent.clientX, domEvent.clientY);
    if (!this.assumeFullWindow) {
      const domBounds = this.display.domElement.getBoundingClientRect();

      // TODO: consider totally ignoring any with zero width/height, as we aren't attached to the display?
      // For now, don't offset.
      if (domBounds.width > 0 && domBounds.height > 0) {
        position.subtractXY(domBounds.left, domBounds.top);

        // Detect a scaling of the display here (the client bounding rect having different dimensions from our
        // display), and attempt to compensate.
        // NOTE: We can't handle rotation here.
        if (domBounds.width !== this.display.width || domBounds.height !== this.display.height) {
          // TODO: Have code verify the correctness here, and that it's not triggering all the time
          position.x *= this.display.width / domBounds.width;
          position.y *= this.display.height / domBounds.height;
        }
      }
    }
    return position;
  }

  /**
   * Adds a pointer to our list.
   */
  addPointer(pointer) {
    this.pointers.push(pointer);
    this.pointerAddedEmitter.emit(pointer);
  }

  /**
   * Removes a pointer from our list. If we get future events for it (based on the ID) it will be ignored.
   */
  removePointer(pointer) {
    // sanity check version, will remove all instances
    for (let i = this.pointers.length - 1; i >= 0; i--) {
      if (this.pointers[i] === pointer) {
        this.pointers.splice(i, 1);
      }
    }
    pointer.dispose();
  }

  /**
   * Given a pointer's ID (given by the pointer/touch specifications to be unique to a specific pointer/touch),
   * returns the given pointer (if we have one).
   *
   * NOTE: There are some cases where we may have prematurely "removed" a pointer.
   */
  findPointerById(id) {
    let i = this.pointers.length;
    while (i--) {
      const pointer = this.pointers[i];
      if (pointer.id === id) {
        return pointer;
      }
    }
    return null;
  }
  getPDOMEventTrail(domEvent, eventName) {
    if (!this.display.interactive) {
      return null;
    }
    const trail = this.getTrailFromPDOMEvent(domEvent);

    // Only dispatch the event if the click did not happen rapidly after an up event. It is
    // likely that the screen reader dispatched both pointer AND click events in this case, and
    // we only want to respond to one or the other. See https://github.com/phetsims/scenery/issues/1094.
    // This is outside of the clickAction execution so that blocked clicks are not part of the PhET-iO data
    // stream.
    const notBlockingSubsequentClicksOccurringTooQuickly = trail && !(eventName === 'click' && _.some(trail.nodes, node => node.positionInPDOM) && domEvent.timeStamp - this.upTimeStamp <= PDOM_CLICK_DELAY);
    return notBlockingSubsequentClicksOccurringTooQuickly ? trail : null;
  }

  /**
   * Initializes the Mouse object on the first mouse event (this may never happen on touch devices).
   */
  initMouse(point) {
    const mouse = new Mouse(point);
    this.mouse = mouse;
    this.addPointer(mouse);
    return mouse;
  }
  ensureMouse(point) {
    const mouse = this.mouse;
    if (mouse) {
      return mouse;
    } else {
      return this.initMouse(point);
    }
  }

  /**
   * Initializes the accessible pointer object on the first pdom event.
   */
  initPDOMPointer() {
    const pdomPointer = new PDOMPointer(this.display);
    this.pdomPointer = pdomPointer;
    this.addPointer(pdomPointer);
    return pdomPointer;
  }
  ensurePDOMPointer() {
    const pdomPointer = this.pdomPointer;
    if (pdomPointer) {
      return pdomPointer;
    } else {
      return this.initPDOMPointer();
    }
  }

  /**
   * Steps to dispatch a pdom-related event. Before dispatch, the PDOMPointer is initialized if it
   * hasn't been created yet and a userGestureEmitter emits to indicate that a user has begun an interaction.
   */
  dispatchPDOMEvent(trail, eventType, context, bubbles) {
    this.ensurePDOMPointer().updateTrail(trail);

    // exclude focus and blur events because they can happen with scripting without user input
    if (PDOMUtils.USER_GESTURE_EVENTS.includes(eventType)) {
      Display.userGestureEmitter.emit();
    }
    const domEvent = context.domEvent;

    // This workaround hopefully won't be here forever, see ParallelDOM.setExcludeLabelSiblingFromInput() and https://github.com/phetsims/a11y-research/issues/156
    if (!(domEvent.target && domEvent.target.hasAttribute(PDOMUtils.DATA_EXCLUDE_FROM_INPUT))) {
      // If the trail is not pickable, don't dispatch PDOM events to those targets - but we still
      // dispatch with an empty trail to call listeners on the Display and Pointer.
      const canFireListeners = trail.isPickable() || PDOM_UNPICKABLE_EVENTS.includes(eventType);
      if (!canFireListeners) {
        trail = new Trail([]);
      }
      assert && assert(this.pdomPointer);
      this.dispatchEvent(trail, eventType, this.pdomPointer, context, bubbles);
    }
  }
  dispatchGlobalEvent(eventType, context, capture) {
    this.ensurePDOMPointer();
    assert && assert(this.pdomPointer);
    const pointer = this.pdomPointer;
    const inputEvent = new SceneryEvent(new Trail(), eventType, pointer, context);
    const recursiveGlobalDispatch = node => {
      if (!node.isDisposed && node.isVisible() && node.isInputEnabled()) {
        // Reverse iteration follows the z-order from "visually in front" to "visually in back" like normal dipatch
        for (let i = node._children.length - 1; i >= 0; i--) {
          recursiveGlobalDispatch(node._children[i]);
        }
        if (!inputEvent.aborted && !inputEvent.handled) {
          // Notification of ourself AFTER our children results in the depth-first scan.
          inputEvent.currentTarget = node;
          this.dispatchToListeners(pointer, node._inputListeners, eventType, inputEvent, capture);
        }
      }
    };
    recursiveGlobalDispatch(this.rootNode);
  }

  /**
   * From a DOM Event, get its relatedTarget and map that to the scenery Node. Will return null if relatedTarget
   * is not provided, or if relatedTarget is not under PDOM, or there is no associated Node with trail id on the
   * relatedTarget element. (scenery-internal)
   *
   * @param domEvent - DOM Event, not a SceneryEvent!
   */
  getRelatedTargetTrail(domEvent) {
    const relatedTargetElement = domEvent.relatedTarget;
    if (relatedTargetElement && this.isTargetUnderPDOM(relatedTargetElement)) {
      const relatedTarget = domEvent.relatedTarget;
      assert && assert(relatedTarget instanceof window.Element); // eslint-disable-line no-simple-type-checking-assertions
      const trailIndices = relatedTarget.getAttribute(PDOMUtils.DATA_PDOM_UNIQUE_ID);
      assert && assert(trailIndices, 'should not be null');
      return PDOMInstance.uniqueIdToTrail(this.display, trailIndices);
    }
    return null;
  }

  /**
   * Get the trail ID of the node represented by a DOM element who is the target of a DOM Event in the accessible PDOM.
   * This is a bit of a misnomer, because the domEvent doesn't have to be under the PDOM. Returns null if not in the PDOM.
   */
  getTrailFromPDOMEvent(domEvent) {
    assert && assert(domEvent.target || domEvent[TARGET_SUBSTITUTE_KEY], 'need a way to get the target');
    if (!this.display._accessible) {
      return null;
    }

    // could be serialized event for phet-io playbacks, see Input.serializeDOMEvent()
    if (domEvent[TARGET_SUBSTITUTE_KEY]) {
      const trailIndices = domEvent[TARGET_SUBSTITUTE_KEY].getAttribute(PDOMUtils.DATA_PDOM_UNIQUE_ID);
      return PDOMInstance.uniqueIdToTrail(this.display, trailIndices);
    } else {
      const target = domEvent.target;
      assert && assert(target instanceof window.Element); // eslint-disable-line no-simple-type-checking-assertions
      if (target && this.isTargetUnderPDOM(target)) {
        const trailIndices = target.getAttribute(PDOMUtils.DATA_PDOM_UNIQUE_ID);
        assert && assert(trailIndices, 'should not be null');
        return PDOMInstance.uniqueIdToTrail(this.display, trailIndices);
      }
    }
    return null;
  }

  /**
   * Triggers a logical mousedown event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerDown) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */
  mouseDown(id, point, context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`mouseDown('${id}', ${Input.debugText(point, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.mouseDownAction.execute(id, point, context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Triggers a logical mouseup event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerUp) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */
  mouseUp(point, context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`mouseUp(${Input.debugText(point, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.mouseUpAction.execute(point, context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Triggers a logical mousemove event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerMove) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */
  mouseMove(point, context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`mouseMove(${Input.debugText(point, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.mouseMoveAction.execute(point, context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Triggers a logical mouseover event (this does NOT correspond to the Scenery event, since this is for the display) (scenery-internal)
   */
  mouseOver(point, context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`mouseOver(${Input.debugText(point, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.mouseOverAction.execute(point, context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Triggers a logical mouseout event (this does NOT correspond to the Scenery event, since this is for the display) (scenery-internal)
   */
  mouseOut(point, context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`mouseOut(${Input.debugText(point, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.mouseOutAction.execute(point, context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Triggers a logical mouse-wheel/scroll event. (scenery-internal)
   */
  wheel(context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`wheel(${Input.debugText(null, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.wheelScrollAction.execute(context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Triggers a logical touchstart event. This is called for each touch point in a 'raw' event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerDown) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */
  touchStart(id, point, context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`touchStart('${id}',${Input.debugText(point, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.touchStartAction.execute(id, point, context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Triggers a logical touchend event. This is called for each touch point in a 'raw' event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerUp) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */
  touchEnd(id, point, context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`touchEnd('${id}',${Input.debugText(point, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.touchEndAction.execute(id, point, context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Triggers a logical touchmove event. This is called for each touch point in a 'raw' event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerMove) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */
  touchMove(id, point, context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`touchMove('${id}',${Input.debugText(point, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.touchMoveAction.execute(id, point, context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Triggers a logical touchcancel event. This is called for each touch point in a 'raw' event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerCancel) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */
  touchCancel(id, point, context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`touchCancel('${id}',${Input.debugText(point, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.touchCancelAction.execute(id, point, context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Triggers a logical penstart event (e.g. a stylus). This is called for each pen point in a 'raw' event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerDown) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */
  penStart(id, point, context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`penStart('${id}',${Input.debugText(point, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.penStartAction.execute(id, point, context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Triggers a logical penend event (e.g. a stylus). This is called for each pen point in a 'raw' event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerUp) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */
  penEnd(id, point, context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`penEnd('${id}',${Input.debugText(point, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.penEndAction.execute(id, point, context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Triggers a logical penmove event (e.g. a stylus). This is called for each pen point in a 'raw' event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerMove) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */
  penMove(id, point, context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`penMove('${id}',${Input.debugText(point, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.penMoveAction.execute(id, point, context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Triggers a logical pencancel event (e.g. a stylus). This is called for each pen point in a 'raw' event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerCancel) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */
  penCancel(id, point, context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`penCancel('${id}',${Input.debugText(point, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.penCancelAction.execute(id, point, context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Handles a pointerdown event, forwarding it to the proper logical event. (scenery-internal)
   */
  pointerDown(id, type, point, context) {
    // In IE for pointer down events, we want to make sure than the next interactions off the page are sent to
    // this element (it will bubble). See https://github.com/phetsims/scenery/issues/464 and
    // http://news.qooxdoo.org/mouse-capturing.
    const target = this.attachToWindow ? document.body : this.display.domElement;
    if (target.setPointerCapture && context.domEvent.pointerId) {
      // NOTE: This will error out if run on a playback destination, where a pointer with the given ID does not exist.
      target.setPointerCapture(context.domEvent.pointerId);
    }
    type = this.handleUnknownPointerType(type, id);
    switch (type) {
      case 'mouse':
        // The actual event afterwards
        this.mouseDown(id, point, context);
        break;
      case 'touch':
        this.touchStart(id, point, context);
        break;
      case 'pen':
        this.penStart(id, point, context);
        break;
      default:
        if (assert) {
          throw new Error(`Unknown pointer type: ${type}`);
        }
    }
  }

  /**
   * Handles a pointerup event, forwarding it to the proper logical event. (scenery-internal)
   */
  pointerUp(id, type, point, context) {
    // update this outside of the Action executions so that PhET-iO event playback does not override it
    this.upTimeStamp = context.domEvent.timeStamp;
    type = this.handleUnknownPointerType(type, id);
    switch (type) {
      case 'mouse':
        this.mouseUp(point, context);
        break;
      case 'touch':
        this.touchEnd(id, point, context);
        break;
      case 'pen':
        this.penEnd(id, point, context);
        break;
      default:
        if (assert) {
          throw new Error(`Unknown pointer type: ${type}`);
        }
    }
  }

  /**
   * Handles a pointercancel event, forwarding it to the proper logical event. (scenery-internal)
   */
  pointerCancel(id, type, point, context) {
    type = this.handleUnknownPointerType(type, id);
    switch (type) {
      case 'mouse':
        if (console && console.log) {
          console.log('WARNING: Pointer mouse cancel was received');
        }
        break;
      case 'touch':
        this.touchCancel(id, point, context);
        break;
      case 'pen':
        this.penCancel(id, point, context);
        break;
      default:
        if (console.log) {
          console.log(`Unknown pointer type: ${type}`);
        }
    }
  }

  /**
   * Handles a gotpointercapture event, forwarding it to the proper logical event. (scenery-internal)
   */
  gotPointerCapture(id, type, point, context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`gotPointerCapture('${id}',${Input.debugText(null, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.gotPointerCaptureAction.execute(id, context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Handles a lostpointercapture event, forwarding it to the proper logical event. (scenery-internal)
   */
  lostPointerCapture(id, type, point, context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`lostPointerCapture('${id}',${Input.debugText(null, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.lostPointerCaptureAction.execute(id, context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Handles a pointermove event, forwarding it to the proper logical event. (scenery-internal)
   */
  pointerMove(id, type, point, context) {
    type = this.handleUnknownPointerType(type, id);
    switch (type) {
      case 'mouse':
        this.mouseMove(point, context);
        break;
      case 'touch':
        this.touchMove(id, point, context);
        break;
      case 'pen':
        this.penMove(id, point, context);
        break;
      default:
        if (console.log) {
          console.log(`Unknown pointer type: ${type}`);
        }
    }
  }

  /**
   * Handles a pointerover event, forwarding it to the proper logical event. (scenery-internal)
   */
  pointerOver(id, type, point, context) {
    // TODO: accumulate mouse/touch info in the object if needed?
    // TODO: do we want to branch change on these types of events?
  }

  /**
   * Handles a pointerout event, forwarding it to the proper logical event. (scenery-internal)
   */
  pointerOut(id, type, point, context) {
    // TODO: accumulate mouse/touch info in the object if needed?
    // TODO: do we want to branch change on these types of events?
  }

  /**
   * Handles a pointerenter event, forwarding it to the proper logical event. (scenery-internal)
   */
  pointerEnter(id, type, point, context) {
    // TODO: accumulate mouse/touch info in the object if needed?
    // TODO: do we want to branch change on these types of events?
  }

  /**
   * Handles a pointerleave event, forwarding it to the proper logical event. (scenery-internal)
   */
  pointerLeave(id, type, point, context) {
    // TODO: accumulate mouse/touch info in the object if needed?
    // TODO: do we want to branch change on these types of events?
  }

  /**
   * Handles a focusin event, forwarding it to the proper logical event. (scenery-internal)
   */
  focusIn(context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`focusIn('${Input.debugText(null, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.focusinAction.execute(context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Handles a focusout event, forwarding it to the proper logical event. (scenery-internal)
   */
  focusOut(context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`focusOut('${Input.debugText(null, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.focusoutAction.execute(context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Handles an input event, forwarding it to the proper logical event. (scenery-internal)
   */
  input(context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`input('${Input.debugText(null, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.inputAction.execute(context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Handles a change event, forwarding it to the proper logical event. (scenery-internal)
   */
  change(context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`change('${Input.debugText(null, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.changeAction.execute(context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Handles a click event, forwarding it to the proper logical event. (scenery-internal)
   */
  click(context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`click('${Input.debugText(null, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.clickAction.execute(context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Handles a keydown event, forwarding it to the proper logical event. (scenery-internal)
   */
  keyDown(context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`keyDown('${Input.debugText(null, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.keydownAction.execute(context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Handles a keyup event, forwarding it to the proper logical event. (scenery-internal)
   */
  keyUp(context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`keyUp('${Input.debugText(null, context.domEvent)});`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();
    this.keyupAction.execute(context);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * When we get an unknown pointer event type (allowed in the spec, see
   * https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerType), we'll try to guess the pointer type
   * so that we can properly start/end the interaction. NOTE: this can happen for an 'up' where we received a
   * proper type for a 'down', so thus we need the detection.
   */
  handleUnknownPointerType(type, id) {
    if (type !== '') {
      return type;
    }
    return this.mouse && this.mouse.id === id ? 'mouse' : 'touch';
  }

  /**
   * Given a pointer reference, hit test it and determine the Trail that the pointer is over.
   */
  getPointerTrail(pointer) {
    return this.rootNode.trailUnderPointer(pointer) || new Trail(this.rootNode);
  }

  /**
   * Called for each logical "up" event, for any pointer type.
   */
  upEvent(pointer, context, point) {
    // if the event target is within the PDOM the AT is sending a fake pointer event to the document - do not
    // dispatch this since the PDOM should only handle Input.PDOM_EVENT_TYPES, and all other pointer input should
    // go through the Display div. Otherwise, activation will be duplicated when we handle pointer and PDOM events
    if (this.isTargetUnderPDOM(context.domEvent.target)) {
      return;
    }
    const pointChanged = pointer.up(point, context.domEvent);
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`upEvent ${pointer.toString()} changed:${pointChanged}`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();

    // We'll use this trail for the entire dispatch of this event.
    const eventTrail = this.branchChangeEvents(pointer, context, pointChanged);
    this.dispatchEvent(eventTrail, 'up', pointer, context, true);

    // touch pointers are transient, so fire exit/out to the trail afterwards
    if (pointer.isTouchLike()) {
      this.exitEvents(pointer, context, eventTrail, 0, true);
    }
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Called for each logical "down" event, for any pointer type.
   */
  downEvent(pointer, context, point) {
    // if the event target is within the PDOM the AT is sending a fake pointer event to the document - do not
    // dispatch this since the PDOM should only handle Input.PDOM_EVENT_TYPES, and all other pointer input should
    // go through the Display div. Otherwise, activation will be duplicated when we handle pointer and PDOM events
    if (this.isTargetUnderPDOM(context.domEvent.target)) {
      return;
    }
    const pointChanged = pointer.updatePoint(point);
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`downEvent ${pointer.toString()} changed:${pointChanged}`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();

    // We'll use this trail for the entire dispatch of this event.
    const eventTrail = this.branchChangeEvents(pointer, context, pointChanged);
    pointer.down(context.domEvent);
    this.dispatchEvent(eventTrail, 'down', pointer, context, true);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Called for each logical "move" event, for any pointer type.
   */
  moveEvent(pointer, context) {
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`moveEvent ${pointer.toString()}`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();

    // Always treat move events as "point changed"
    this.branchChangeEvents(pointer, context, true);
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Called for each logical "cancel" event, for any pointer type.
   */
  cancelEvent(pointer, context, point) {
    const pointChanged = pointer.cancel(point);
    sceneryLog && sceneryLog.Input && sceneryLog.Input(`cancelEvent ${pointer.toString()} changed:${pointChanged}`);
    sceneryLog && sceneryLog.Input && sceneryLog.push();

    // We'll use this trail for the entire dispatch of this event.
    const eventTrail = this.branchChangeEvents(pointer, context, pointChanged);
    this.dispatchEvent(eventTrail, 'cancel', pointer, context, true);

    // touch pointers are transient, so fire exit/out to the trail afterwards
    if (pointer.isTouchLike()) {
      this.exitEvents(pointer, context, eventTrail, 0, true);
    }
    sceneryLog && sceneryLog.Input && sceneryLog.pop();
  }

  /**
   * Dispatches any necessary events that would result from the pointer's trail changing.
   *
   * This will send the necessary exit/enter events (on subtrails that have diverged between before/after), the
   * out/over events, and if flagged a move event.
   *
   * @param pointer
   * @param context
   * @param sendMove - Whether to send move events
   * @returns - The current trail of the pointer
   */
  branchChangeEvents(pointer, context, sendMove) {
    sceneryLog && sceneryLog.InputEvent && sceneryLog.InputEvent(`branchChangeEvents: ${pointer.toString()} sendMove:${sendMove}`);
    sceneryLog && sceneryLog.InputEvent && sceneryLog.push();
    const trail = this.getPointerTrail(pointer);
    const inputEnabledTrail = trail.slice(0, Math.min(trail.nodes.length, trail.getLastInputEnabledIndex() + 1));
    const oldInputEnabledTrail = pointer.inputEnabledTrail || new Trail(this.rootNode);
    const branchInputEnabledIndex = Trail.branchIndex(inputEnabledTrail, oldInputEnabledTrail);
    const lastInputEnabledNodeChanged = oldInputEnabledTrail.lastNode() !== inputEnabledTrail.lastNode();
    if (sceneryLog && sceneryLog.InputEvent) {
      const oldTrail = pointer.trail || new Trail(this.rootNode);
      const branchIndex = Trail.branchIndex(trail, oldTrail);
      (branchIndex !== trail.length || branchIndex !== oldTrail.length) && sceneryLog.InputEvent(`changed from ${oldTrail.toString()} to ${trail.toString()}`);
    }

    // event order matches http://www.w3.org/TR/DOM-Level-3-Events/#events-mouseevent-event-order
    if (sendMove) {
      this.dispatchEvent(trail, 'move', pointer, context, true);
    }

    // We want to approximately mimic http://www.w3.org/TR/DOM-Level-3-Events/#events-mouseevent-event-order
    this.exitEvents(pointer, context, oldInputEnabledTrail, branchInputEnabledIndex, lastInputEnabledNodeChanged);
    this.enterEvents(pointer, context, inputEnabledTrail, branchInputEnabledIndex, lastInputEnabledNodeChanged);
    pointer.trail = trail;
    pointer.inputEnabledTrail = inputEnabledTrail;
    sceneryLog && sceneryLog.InputEvent && sceneryLog.pop();
    return trail;
  }

  /**
   * Triggers 'enter' events along a trail change, and an 'over' event on the leaf.
   *
   * For example, if we change from a trail [ a, b, c, d, e ] => [ a, b, x, y ], it will fire:
   *
   * - enter x
   * - enter y
   * - over y (bubbles)
   *
   * @param pointer
   * @param event
   * @param trail - The "new" trail
   * @param branchIndex - The first index where the old and new trails have a different node. We will notify
   *                               for this node and all "descendant" nodes in the relevant trail.
   * @param lastNodeChanged - If the last node didn't change, we won't sent an over event.
   */
  enterEvents(pointer, context, trail, branchIndex, lastNodeChanged) {
    if (lastNodeChanged) {
      this.dispatchEvent(trail, 'over', pointer, context, true, true);
    }
    for (let i = branchIndex; i < trail.length; i++) {
      this.dispatchEvent(trail.slice(0, i + 1), 'enter', pointer, context, false);
    }
  }

  /**
   * Triggers 'exit' events along a trail change, and an 'out' event on the leaf.
   *
   * For example, if we change from a trail [ a, b, c, d, e ] => [ a, b, x, y ], it will fire:
   *
   * - out e (bubbles)
   * - exit c
   * - exit d
   * - exit e
   *
   * @param pointer
   * @param event
   * @param trail - The "old" trail
   * @param branchIndex - The first index where the old and new trails have a different node. We will notify
   *                               for this node and all "descendant" nodes in the relevant trail.
   * @param lastNodeChanged - If the last node didn't change, we won't sent an out event.
   */
  exitEvents(pointer, context, trail, branchIndex, lastNodeChanged) {
    for (let i = trail.length - 1; i >= branchIndex; i--) {
      this.dispatchEvent(trail.slice(0, i + 1), 'exit', pointer, context, false, true);
    }
    if (lastNodeChanged) {
      this.dispatchEvent(trail, 'out', pointer, context, true);
    }
  }

  /**
   * Dispatch to all nodes in the Trail, optionally bubbling down from the leaf to the root.
   *
   * @param trail
   * @param type
   * @param pointer
   * @param context
   * @param bubbles - If bubbles is false, the event is only dispatched to the leaf node of the trail.
   * @param fireOnInputDisabled - Whether to fire this event even if nodes have inputEnabled:false
   */
  dispatchEvent(trail, type, pointer, context, bubbles, fireOnInputDisabled = false) {
    sceneryLog && sceneryLog.EventDispatch && sceneryLog.EventDispatch(`${type} trail:${trail.toString()} pointer:${pointer.toString()} at ${pointer.point ? pointer.point.toString() : 'null'}`);
    sceneryLog && sceneryLog.EventDispatch && sceneryLog.push();
    assert && assert(trail, 'Falsy trail for dispatchEvent');
    sceneryLog && sceneryLog.EventPath && sceneryLog.EventPath(`${type} ${trail.toPathString()}`);

    // NOTE: event is not immutable, as its currentTarget changes
    const inputEvent = new SceneryEvent(trail, type, pointer, context);

    // first run through the pointer's listeners to see if one of them will handle the event
    this.dispatchToListeners(pointer, pointer.getListeners(), type, inputEvent);

    // if not yet handled, run through the trail in order to see if one of them will handle the event
    // at the base of the trail should be the scene node, so the scene will be notified last
    this.dispatchToTargets(trail, type, pointer, inputEvent, bubbles, fireOnInputDisabled);

    // Notify input listeners on the Display
    this.dispatchToListeners(pointer, this.display.getInputListeners(), type, inputEvent);

    // Notify input listeners to any Display
    if (Display.inputListeners.length) {
      this.dispatchToListeners(pointer, Display.inputListeners.slice(), type, inputEvent);
    }
    sceneryLog && sceneryLog.EventDispatch && sceneryLog.pop();
  }

  /**
   * Notifies an array of listeners with a specific event.
   *
   * @param pointer
   * @param listeners - Should be a defensive array copy already.
   * @param type
   * @param inputEvent
   * @param capture - If true, this dispatch is in the capture sequence (like DOM's addEventListener useCapture).
   *                  Listeners will only be called if the listener also indicates it is for the capture sequence.
   */
  dispatchToListeners(pointer, listeners, type, inputEvent, capture = null) {
    if (inputEvent.handled) {
      return;
    }
    const specificType = pointer.type + type; // e.g. mouseup, touchup

    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      if (capture === null || capture === !!listener.capture) {
        if (!inputEvent.aborted && listener[specificType]) {
          sceneryLog && sceneryLog.EventDispatch && sceneryLog.EventDispatch(specificType);
          sceneryLog && sceneryLog.EventDispatch && sceneryLog.push();
          listener[specificType](inputEvent);
          sceneryLog && sceneryLog.EventDispatch && sceneryLog.pop();
        }
        if (!inputEvent.aborted && listener[type]) {
          sceneryLog && sceneryLog.EventDispatch && sceneryLog.EventDispatch(type);
          sceneryLog && sceneryLog.EventDispatch && sceneryLog.push();
          listener[type](inputEvent);
          sceneryLog && sceneryLog.EventDispatch && sceneryLog.pop();
        }
      }
    }
  }

  /**
   * Dispatch to all nodes in the Trail, optionally bubbling down from the leaf to the root.
   *
   * @param trail
   * @param type
   * @param pointer
   * @param inputEvent
   * @param bubbles - If bubbles is false, the event is only dispatched to the leaf node of the trail.
   * @param [fireOnInputDisabled]
   */
  dispatchToTargets(trail, type, pointer, inputEvent, bubbles, fireOnInputDisabled = false) {
    if (inputEvent.aborted || inputEvent.handled) {
      return;
    }
    const inputEnabledIndex = trail.getLastInputEnabledIndex();
    for (let i = trail.nodes.length - 1; i >= 0; bubbles ? i-- : i = -1) {
      const target = trail.nodes[i];
      const trailInputDisabled = inputEnabledIndex < i;
      if (target.isDisposed || !fireOnInputDisabled && trailInputDisabled) {
        continue;
      }
      inputEvent.currentTarget = target;
      this.dispatchToListeners(pointer, target.getInputListeners(), type, inputEvent);

      // if the input event was aborted or handled, don't follow the trail down another level
      if (inputEvent.aborted || inputEvent.handled) {
        return;
      }
    }
  }

  /**
   * Returns true if the Display is accessible and the element is a descendant of the Display PDOM.
   */
  isTargetUnderPDOM(element) {
    return this.display._accessible && this.display.pdomRootElement.contains(element);
  }

  /**
   * Saves the main information we care about from a DOM `Event` into a JSON-like structure. To support
   * polymorphism, all supported DOM event keys that scenery uses will always be included in this serialization. If
   * the particular Event interface for the instance being serialized doesn't have a certain property, then it will be
   * set as `null`. See domEventPropertiesToSerialize for the full list of supported Event properties.
   *
   * @returns - see domEventPropertiesToSerialize for list keys that are serialized
   */
  static serializeDomEvent(domEvent) {
    const entries = {
      constructorName: domEvent.constructor.name
    };
    domEventPropertiesToSerialize.forEach(property => {
      const domEventProperty = domEvent[property];

      // We serialize many Event APIs into a single object, so be graceful if properties don't exist.
      if (domEventProperty === undefined || domEventProperty === null) {
        entries[property] = null;
      } else if (domEventProperty instanceof Element && EVENT_KEY_VALUES_AS_ELEMENTS.includes(property) && typeof domEventProperty.getAttribute === 'function' &&
      // If false, then this target isn't a PDOM element, so we can skip this serialization
      domEventProperty.hasAttribute(PDOMUtils.DATA_PDOM_UNIQUE_ID)) {
        // If the target came from the accessibility PDOM, then we want to store the Node trail id of where it came from.
        entries[property] = {
          [PDOMUtils.DATA_PDOM_UNIQUE_ID]: domEventProperty.getAttribute(PDOMUtils.DATA_PDOM_UNIQUE_ID),
          // Have the ID also
          id: domEventProperty.getAttribute('id')
        };
      } else {
        // Parse to get rid of functions and circular references.
        entries[property] = typeof domEventProperty === 'object' ? {} : JSON.parse(JSON.stringify(domEventProperty));
      }
    });
    return entries;
  }

  /**
   * From a serialized dom event, return a recreated window.Event (scenery-internal)
   */
  static deserializeDomEvent(eventObject) {
    const constructorName = eventObject.constructorName || 'Event';
    const configForConstructor = _.pick(eventObject, domEventPropertiesSetInConstructor);
    // serialize the relatedTarget back into an event Object, so that it can be passed to the init config in the Event
    // constructor
    if (configForConstructor.relatedTarget) {
      // @ts-expect-error
      const htmlElement = document.getElementById(configForConstructor.relatedTarget.id);
      assert && assert(htmlElement, 'cannot deserialize event when related target is not in the DOM.');
      configForConstructor.relatedTarget = htmlElement;
    }

    // @ts-expect-error
    const domEvent = new window[constructorName](constructorName, configForConstructor);
    for (const key in eventObject) {
      // `type` is readonly, so don't try to set it.
      if (eventObject.hasOwnProperty(key) && !domEventPropertiesSetInConstructor.includes(key)) {
        // Special case for target since we can't set that read-only property. Instead use a substitute key.
        if (key === 'target') {
          if (assert) {
            const target = eventObject.target;
            if (target && target.id) {
              assert(document.getElementById(target.id), 'target should exist in the PDOM to support playback.');
            }
          }

          // @ts-expect-error
          domEvent[TARGET_SUBSTITUTE_KEY] = _.clone(eventObject[key]) || {};

          // This may not be needed since https://github.com/phetsims/scenery/issues/1296 is complete, double check on getTrailFromPDOMEvent() too
          // @ts-expect-error
          domEvent[TARGET_SUBSTITUTE_KEY].getAttribute = function (key) {
            return this[key];
          };
        } else {
          // @ts-expect-error
          domEvent[key] = eventObject[key];
        }
      }
    }
    return domEvent;
  }

  /**
   * Convenience function for logging out a point/event combination.
   *
   * @param point - Not logged if null
   * @param domEvent
   */
  static debugText(point, domEvent) {
    let result = `${domEvent.timeStamp} ${domEvent.type}`;
    if (point !== null) {
      result = `${point.x},${point.y} ${result}`;
    }
    return result;
  }

  /**
   * Maps the current MS pointer types onto the pointer spec. (scenery-internal)
   */
  static msPointerType(event) {
    // @ts-expect-error -- legacy API
    if (event.pointerType === window.MSPointerEvent.MSPOINTER_TYPE_TOUCH) {
      return 'touch';
    }
    // @ts-expect-error -- legacy API
    else if (event.pointerType === window.MSPointerEvent.MSPOINTER_TYPE_PEN) {
      return 'pen';
    }
    // @ts-expect-error -- legacy API
    else if (event.pointerType === window.MSPointerEvent.MSPOINTER_TYPE_MOUSE) {
      return 'mouse';
    } else {
      return event.pointerType; // hope for the best
    }
  }
}

scenery.register('Input', Input);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0aW9BY3Rpb24iLCJUaW55RW1pdHRlciIsIlZlY3RvcjIiLCJjbGVhbkFycmF5Iiwib3B0aW9uaXplIiwicGxhdGZvcm0iLCJFdmVudFR5cGUiLCJUYW5kZW0iLCJOdWxsYWJsZUlPIiwiTnVtYmVySU8iLCJCYXRjaGVkRE9NRXZlbnQiLCJCYXRjaGVkRE9NRXZlbnRUeXBlIiwiQnJvd3NlckV2ZW50cyIsIkRpc3BsYXkiLCJFdmVudENvbnRleHQiLCJFdmVudENvbnRleHRJTyIsIk1vdXNlIiwiUERPTUluc3RhbmNlIiwiUERPTVBvaW50ZXIiLCJQRE9NVXRpbHMiLCJQZW4iLCJQb2ludGVyIiwic2NlbmVyeSIsIlNjZW5lcnlFdmVudCIsIlRvdWNoIiwiVHJhaWwiLCJQaGV0aW9PYmplY3QiLCJJT1R5cGUiLCJBcnJheUlPIiwiQXJyYXlJT1BvaW50ZXJJTyIsIlBvaW50ZXJJTyIsImRvbUV2ZW50UHJvcGVydGllc1RvU2VyaWFsaXplIiwiZG9tRXZlbnRQcm9wZXJ0aWVzU2V0SW5Db25zdHJ1Y3RvciIsIkVWRU5UX0tFWV9WQUxVRVNfQVNfRUxFTUVOVFMiLCJQRE9NX1VOUElDS0FCTEVfRVZFTlRTIiwiVEFSR0VUX1NVQlNUSVRVVEVfS0VZIiwiUERPTV9DTElDS19ERUxBWSIsIklucHV0IiwiSW5wdXRJTyIsInZhbHVlVHlwZSIsImFwcGx5U3RhdGUiLCJfIiwibm9vcCIsInRvU3RhdGVPYmplY3QiLCJpbnB1dCIsInBvaW50ZXJzIiwic3RhdGVTY2hlbWEiLCJjb25zdHJ1Y3RvciIsImRpc3BsYXkiLCJhdHRhY2hUb1dpbmRvdyIsImJhdGNoRE9NRXZlbnRzIiwiYXNzdW1lRnVsbFdpbmRvdyIsInBhc3NpdmVFdmVudHMiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwicGhldGlvVHlwZSIsInRhbmRlbSIsIk9QVElPTkFMIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInJvb3ROb2RlIiwiYmF0Y2hlZEV2ZW50cyIsInBkb21Qb2ludGVyIiwibW91c2UiLCJwb2ludGVyQWRkZWRFbWl0dGVyIiwiY3VycmVudGx5RmlyaW5nRXZlbnRzIiwidXBUaW1lU3RhbXAiLCJ2YWxpZGF0ZVBvaW50ZXJzQWN0aW9uIiwiaSIsImxlbmd0aCIsInBvaW50ZXIiLCJwb2ludCIsImJyYW5jaENoYW5nZUV2ZW50cyIsImxhc3RFdmVudENvbnRleHQiLCJjcmVhdGVTeW50aGV0aWMiLCJwaGV0aW9QbGF5YmFjayIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0hpZ2hGcmVxdWVuY3kiLCJtb3VzZVVwQWN0aW9uIiwiY29udGV4dCIsImVuc3VyZU1vdXNlIiwiaWQiLCJ1cEV2ZW50IiwicGFyYW1ldGVycyIsIm5hbWUiLCJWZWN0b3IySU8iLCJwaGV0aW9FdmVudFR5cGUiLCJVU0VSIiwibW91c2VEb3duQWN0aW9uIiwiZG93bkV2ZW50IiwibW91c2VNb3ZlQWN0aW9uIiwibW92ZSIsIm1vdmVFdmVudCIsIm1vdXNlT3ZlckFjdGlvbiIsIm92ZXIiLCJtb3VzZU91dEFjdGlvbiIsIm91dCIsIndoZWVsU2Nyb2xsQWN0aW9uIiwiZXZlbnQiLCJkb21FdmVudCIsInBvaW50RnJvbUV2ZW50Iiwid2hlZWwiLCJ0cmFpbCIsInRyYWlsVW5kZXJQb2ludGVyIiwiZGlzcGF0Y2hFdmVudCIsInRvdWNoU3RhcnRBY3Rpb24iLCJ0b3VjaCIsImFkZFBvaW50ZXIiLCJ0b3VjaEVuZEFjdGlvbiIsImZpbmRQb2ludGVyQnlJZCIsImFzc2VydCIsInJlbW92ZVBvaW50ZXIiLCJ0b3VjaE1vdmVBY3Rpb24iLCJ0b3VjaENhbmNlbEFjdGlvbiIsImNhbmNlbEV2ZW50IiwicGVuU3RhcnRBY3Rpb24iLCJwZW4iLCJwZW5FbmRBY3Rpb24iLCJwZW5Nb3ZlQWN0aW9uIiwicGVuQ2FuY2VsQWN0aW9uIiwiZ290UG9pbnRlckNhcHR1cmVBY3Rpb24iLCJvbkdvdFBvaW50ZXJDYXB0dXJlIiwibG9zdFBvaW50ZXJDYXB0dXJlQWN0aW9uIiwib25Mb3N0UG9pbnRlckNhcHR1cmUiLCJmb2N1c2luQWN0aW9uIiwiZ2V0UERPTUV2ZW50VHJhaWwiLCJzY2VuZXJ5TG9nIiwiZGVidWdUZXh0IiwicHVzaCIsImRpc3BhdGNoUERPTUV2ZW50IiwicG9wIiwiZm9jdXNvdXRBY3Rpb24iLCJjbGlja0FjdGlvbiIsImlucHV0QWN0aW9uIiwiY2hhbmdlQWN0aW9uIiwia2V5ZG93bkFjdGlvbiIsImRpc3BhdGNoR2xvYmFsRXZlbnQiLCJrZXl1cEFjdGlvbiIsImludGVycnVwdFBvaW50ZXJzIiwiZWFjaCIsImludGVycnVwdEFsbCIsImJhdGNoRXZlbnQiLCJiYXRjaFR5cGUiLCJjYWxsYmFjayIsInRyaWdnZXJJbW1lZGlhdGUiLCJJbnB1dEV2ZW50IiwiaW50ZXJhY3RpdmUiLCJwb29sIiwiY3JlYXRlIiwiZmlyZUJhdGNoZWRFdmVudHMiLCJtb3VzZURvd24iLCJlZGdlIiwiQUxUX1RZUEUiLCJwcmV2ZW50RGVmYXVsdCIsImJhdGNoZWRFdmVudCIsInJ1biIsImRpc3Bvc2UiLCJjbGVhckJhdGNoZWRFdmVudHMiLCJ2YWxpZGF0ZVBvaW50ZXJzIiwiZXhlY3V0ZSIsInJlbW92ZVRlbXBvcmFyeVBvaW50ZXJzIiwic3BsaWNlIiwiZXhpdFRyYWlsIiwiZXhpdEV2ZW50cyIsImNvbm5lY3RMaXN0ZW5lcnMiLCJhZGREaXNwbGF5IiwiZGlzY29ubmVjdExpc3RlbmVycyIsInJlbW92ZURpc3BsYXkiLCJwb3NpdGlvbiIsImNsaWVudFgiLCJjbGllbnRZIiwiZG9tQm91bmRzIiwiZG9tRWxlbWVudCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsIndpZHRoIiwiaGVpZ2h0Iiwic3VidHJhY3RYWSIsImxlZnQiLCJ0b3AiLCJ4IiwieSIsImVtaXQiLCJldmVudE5hbWUiLCJnZXRUcmFpbEZyb21QRE9NRXZlbnQiLCJub3RCbG9ja2luZ1N1YnNlcXVlbnRDbGlja3NPY2N1cnJpbmdUb29RdWlja2x5Iiwic29tZSIsIm5vZGVzIiwibm9kZSIsInBvc2l0aW9uSW5QRE9NIiwidGltZVN0YW1wIiwiaW5pdE1vdXNlIiwiaW5pdFBET01Qb2ludGVyIiwiZW5zdXJlUERPTVBvaW50ZXIiLCJldmVudFR5cGUiLCJidWJibGVzIiwidXBkYXRlVHJhaWwiLCJVU0VSX0dFU1RVUkVfRVZFTlRTIiwiaW5jbHVkZXMiLCJ1c2VyR2VzdHVyZUVtaXR0ZXIiLCJ0YXJnZXQiLCJoYXNBdHRyaWJ1dGUiLCJEQVRBX0VYQ0xVREVfRlJPTV9JTlBVVCIsImNhbkZpcmVMaXN0ZW5lcnMiLCJpc1BpY2thYmxlIiwiY2FwdHVyZSIsImlucHV0RXZlbnQiLCJyZWN1cnNpdmVHbG9iYWxEaXNwYXRjaCIsImlzRGlzcG9zZWQiLCJpc1Zpc2libGUiLCJpc0lucHV0RW5hYmxlZCIsIl9jaGlsZHJlbiIsImFib3J0ZWQiLCJoYW5kbGVkIiwiY3VycmVudFRhcmdldCIsImRpc3BhdGNoVG9MaXN0ZW5lcnMiLCJfaW5wdXRMaXN0ZW5lcnMiLCJnZXRSZWxhdGVkVGFyZ2V0VHJhaWwiLCJyZWxhdGVkVGFyZ2V0RWxlbWVudCIsInJlbGF0ZWRUYXJnZXQiLCJpc1RhcmdldFVuZGVyUERPTSIsIndpbmRvdyIsIkVsZW1lbnQiLCJ0cmFpbEluZGljZXMiLCJnZXRBdHRyaWJ1dGUiLCJEQVRBX1BET01fVU5JUVVFX0lEIiwidW5pcXVlSWRUb1RyYWlsIiwiX2FjY2Vzc2libGUiLCJtb3VzZVVwIiwibW91c2VNb3ZlIiwibW91c2VPdmVyIiwibW91c2VPdXQiLCJ0b3VjaFN0YXJ0IiwidG91Y2hFbmQiLCJ0b3VjaE1vdmUiLCJ0b3VjaENhbmNlbCIsInBlblN0YXJ0IiwicGVuRW5kIiwicGVuTW92ZSIsInBlbkNhbmNlbCIsInBvaW50ZXJEb3duIiwidHlwZSIsImRvY3VtZW50IiwiYm9keSIsInNldFBvaW50ZXJDYXB0dXJlIiwicG9pbnRlcklkIiwiaGFuZGxlVW5rbm93blBvaW50ZXJUeXBlIiwiRXJyb3IiLCJwb2ludGVyVXAiLCJwb2ludGVyQ2FuY2VsIiwiY29uc29sZSIsImxvZyIsImdvdFBvaW50ZXJDYXB0dXJlIiwibG9zdFBvaW50ZXJDYXB0dXJlIiwicG9pbnRlck1vdmUiLCJwb2ludGVyT3ZlciIsInBvaW50ZXJPdXQiLCJwb2ludGVyRW50ZXIiLCJwb2ludGVyTGVhdmUiLCJmb2N1c0luIiwiZm9jdXNPdXQiLCJjaGFuZ2UiLCJjbGljayIsImtleURvd24iLCJrZXlVcCIsImdldFBvaW50ZXJUcmFpbCIsInBvaW50Q2hhbmdlZCIsInVwIiwidG9TdHJpbmciLCJldmVudFRyYWlsIiwiaXNUb3VjaExpa2UiLCJ1cGRhdGVQb2ludCIsImRvd24iLCJjYW5jZWwiLCJzZW5kTW92ZSIsImlucHV0RW5hYmxlZFRyYWlsIiwic2xpY2UiLCJNYXRoIiwibWluIiwiZ2V0TGFzdElucHV0RW5hYmxlZEluZGV4Iiwib2xkSW5wdXRFbmFibGVkVHJhaWwiLCJicmFuY2hJbnB1dEVuYWJsZWRJbmRleCIsImJyYW5jaEluZGV4IiwibGFzdElucHV0RW5hYmxlZE5vZGVDaGFuZ2VkIiwibGFzdE5vZGUiLCJvbGRUcmFpbCIsImVudGVyRXZlbnRzIiwibGFzdE5vZGVDaGFuZ2VkIiwiZmlyZU9uSW5wdXREaXNhYmxlZCIsIkV2ZW50RGlzcGF0Y2giLCJFdmVudFBhdGgiLCJ0b1BhdGhTdHJpbmciLCJnZXRMaXN0ZW5lcnMiLCJkaXNwYXRjaFRvVGFyZ2V0cyIsImdldElucHV0TGlzdGVuZXJzIiwiaW5wdXRMaXN0ZW5lcnMiLCJsaXN0ZW5lcnMiLCJzcGVjaWZpY1R5cGUiLCJsaXN0ZW5lciIsImlucHV0RW5hYmxlZEluZGV4IiwidHJhaWxJbnB1dERpc2FibGVkIiwiZWxlbWVudCIsInBkb21Sb290RWxlbWVudCIsImNvbnRhaW5zIiwic2VyaWFsaXplRG9tRXZlbnQiLCJlbnRyaWVzIiwiY29uc3RydWN0b3JOYW1lIiwiZm9yRWFjaCIsInByb3BlcnR5IiwiZG9tRXZlbnRQcm9wZXJ0eSIsInVuZGVmaW5lZCIsIkpTT04iLCJwYXJzZSIsInN0cmluZ2lmeSIsImRlc2VyaWFsaXplRG9tRXZlbnQiLCJldmVudE9iamVjdCIsImNvbmZpZ0ZvckNvbnN0cnVjdG9yIiwicGljayIsImh0bWxFbGVtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJrZXkiLCJoYXNPd25Qcm9wZXJ0eSIsImNsb25lIiwicmVzdWx0IiwibXNQb2ludGVyVHlwZSIsInBvaW50ZXJUeXBlIiwiTVNQb2ludGVyRXZlbnQiLCJNU1BPSU5URVJfVFlQRV9UT1VDSCIsIk1TUE9JTlRFUl9UWVBFX1BFTiIsIk1TUE9JTlRFUl9UWVBFX01PVVNFIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbnB1dC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYWluIGhhbmRsZXIgZm9yIHVzZXItaW5wdXQgZXZlbnRzIGluIFNjZW5lcnkuXHJcbiAqXHJcbiAqICoqKiBBZGRpbmcgaW5wdXQgaGFuZGxpbmcgdG8gYSBkaXNwbGF5XHJcbiAqXHJcbiAqIERpc3BsYXlzIGRvIG5vdCBoYXZlIGV2ZW50IGxpc3RlbmVycyBhdHRhY2hlZCBieSBkZWZhdWx0LiBUbyBpbml0aWFsaXplIHRoZSBldmVudCBzeXN0ZW0gKHRoYXQgd2lsbCBzZXQgdXBcclxuICogbGlzdGVuZXJzKSwgdXNlIG9uZSBvZiBEaXNwbGF5J3MgaW5pdGlhbGl6ZSpFdmVudHMgZnVuY3Rpb25zLlxyXG4gKlxyXG4gKiAqKiogUG9pbnRlcnNcclxuICpcclxuICogQSAncG9pbnRlcicgaXMgYW4gYWJzdHJhY3Qgd2F5IG9mIGRlc2NyaWJpbmcgYSBtb3VzZSwgYSBzaW5nbGUgdG91Y2ggcG9pbnQsIG9yIGEgcGVuL3N0eWx1cywgc2ltaWxhciB0byBpbiB0aGVcclxuICogUG9pbnRlciBFdmVudHMgc3BlY2lmaWNhdGlvbiAoaHR0cHM6Ly9kdmNzLnczLm9yZy9oZy9wb2ludGVyZXZlbnRzL3Jhdy1maWxlL3RpcC9wb2ludGVyRXZlbnRzLmh0bWwpLiBUb3VjaCBhbmQgcGVuXHJcbiAqIHBvaW50ZXJzIGFyZSB0cmFuc2llbnQsIGNyZWF0ZWQgd2hlbiB0aGUgcmVsZXZhbnQgRE9NIGRvd24gZXZlbnQgb2NjdXJzIGFuZCByZWxlYXNlZCB3aGVuIGNvcnJlc3BvbmRpbmcgdGhlIERPTSB1cFxyXG4gKiBvciBjYW5jZWwgZXZlbnQgb2NjdXJzLiBIb3dldmVyLCB0aGUgbW91c2UgcG9pbnRlciBpcyBwZXJzaXN0ZW50LlxyXG4gKlxyXG4gKiBJbnB1dCBldmVudCBsaXN0ZW5lcnMgY2FuIGJlIGFkZGVkIHRvIHtOb2RlfXMgZGlyZWN0bHksIG9yIHRvIGEgcG9pbnRlci4gV2hlbiBhIERPTSBldmVudCBpcyByZWNlaXZlZCwgaXQgaXMgZmlyc3RcclxuICogYnJva2VuIHVwIGludG8gbXVsdGlwbGUgZXZlbnRzIChpZiBuZWNlc3NhcnksIGUuZy4gbXVsdGlwbGUgdG91Y2ggcG9pbnRzKSwgdGhlbiB0aGUgZGlzcGF0Y2ggaXMgaGFuZGxlZCBmb3IgZWFjaFxyXG4gKiBpbmRpdmlkdWFsIFNjZW5lcnkgZXZlbnQuIEV2ZW50cyBhcmUgZmlyc3QgZmlyZWQgZm9yIGFueSBsaXN0ZW5lcnMgYXR0YWNoZWQgdG8gdGhlIHBvaW50ZXIgdGhhdCBjYXVzZWQgdGhlIGV2ZW50LFxyXG4gKiB0aGVuIGZpcmUgb24gdGhlIG5vZGUgZGlyZWN0bHkgdW5kZXIgdGhlIHBvaW50ZXIsIGFuZCBpZiBhcHBsaWNhYmxlLCBidWJibGUgdXAgdGhlIGdyYXBoIHRvIHRoZSBTY2VuZSBmcm9tIHdoaWNoIHRoZVxyXG4gKiBldmVudCB3YXMgdHJpZ2dlcmVkLiBFdmVudHMgYXJlIG5vdCBmaXJlZCBkaXJlY3RseSBvbiBub2RlcyB0aGF0IGFyZSBub3QgdW5kZXIgdGhlIHBvaW50ZXIgYXQgdGhlIHRpbWUgb2YgdGhlIGV2ZW50LlxyXG4gKiBUbyBoYW5kbGUgbWFueSBjb21tb24gcGF0dGVybnMgKGxpa2UgYnV0dG9uIHByZXNzZXMsIHdoZXJlIG1vdXNlLXVwcyBjb3VsZCBoYXBwZW4gd2hlbiBub3Qgb3ZlciB0aGUgYnV0dG9uKSwgaXQgaXNcclxuICogbmVjZXNzYXJ5IHRvIGFkZCB0aG9zZSBtb3ZlL3VwIGxpc3RlbmVycyB0byB0aGUgcG9pbnRlciBpdHNlbGYuXHJcbiAqXHJcbiAqICoqKiBMaXN0ZW5lcnMgYW5kIEV2ZW50c1xyXG4gKlxyXG4gKiBFdmVudCBsaXN0ZW5lcnMgYXJlIGFkZGVkIHdpdGggbm9kZS5hZGRJbnB1dExpc3RlbmVyKCBsaXN0ZW5lciApLCBwb2ludGVyLmFkZElucHV0TGlzdGVuZXIoIGxpc3RlbmVyICkgYW5kXHJcbiAqIGRpc3BsYXkuYWRkSW5wdXRMaXN0ZW5lciggbGlzdGVuZXIgKS5cclxuICogVGhpcyBsaXN0ZW5lciBjYW4gYmUgYW4gYXJiaXRyYXJ5IG9iamVjdCwgYW5kIHRoZSBsaXN0ZW5lciB3aWxsIGJlIHRyaWdnZXJlZCBieSBjYWxsaW5nIGxpc3RlbmVyW2V2ZW50VHlwZV0oIGV2ZW50ICksXHJcbiAqIHdoZXJlIGV2ZW50VHlwZSBpcyBvbmUgb2YgdGhlIGV2ZW50IHR5cGVzIGFzIGRlc2NyaWJlZCBiZWxvdywgYW5kIGV2ZW50IGlzIGEgU2NlbmVyeSBldmVudCB3aXRoIHRoZVxyXG4gKiBmb2xsb3dpbmcgcHJvcGVydGllczpcclxuICogLSB0cmFpbCB7VHJhaWx9IC0gUG9pbnRzIHRvIHRoZSBub2RlIHVuZGVyIHRoZSBwb2ludGVyXHJcbiAqIC0gcG9pbnRlciB7UG9pbnRlcn0gLSBUaGUgcG9pbnRlciB0aGF0IHRyaWdnZXJlZCB0aGUgZXZlbnQuIEFkZGl0aW9uYWwgaW5mb3JtYXRpb24gYWJvdXQgdGhlIG1vdXNlL3RvdWNoL3BlbiBjYW4gYmVcclxuICogICAgICAgICAgICAgICAgICAgICAgIG9idGFpbmVkIGZyb20gdGhlIHBvaW50ZXIsIGZvciBleGFtcGxlIGV2ZW50LnBvaW50ZXIucG9pbnQuXHJcbiAqIC0gdHlwZSB7c3RyaW5nfSAtIFRoZSBiYXNlIHR5cGUgb2YgdGhlIGV2ZW50IChlLmcuIGZvciB0b3VjaCBkb3duIGV2ZW50cywgaXQgd2lsbCBhbHdheXMganVzdCBiZSBcImRvd25cIikuXHJcbiAqIC0gZG9tRXZlbnQge1VJRXZlbnR9IC0gVGhlIHVuZGVybHlpbmcgRE9NIGV2ZW50IHRoYXQgdHJpZ2dlcmVkIHRoaXMgU2NlbmVyeSBldmVudC4gVGhlIERPTSBldmVudCBtYXkgY29ycmVzcG9uZCB0b1xyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgIG11bHRpcGxlIFNjZW5lcnkgZXZlbnRzLCBwYXJ0aWN1bGFybHkgZm9yIHRvdWNoIGV2ZW50cy4gVGhpcyBjb3VsZCBiZSBhIFRvdWNoRXZlbnQsXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgUG9pbnRlckV2ZW50LCBNb3VzZUV2ZW50LCBNU1BvaW50ZXJFdmVudCwgZXRjLlxyXG4gKiAtIHRhcmdldCB7Tm9kZX0gLSBUaGUgbGVhZi1tb3N0IE5vZGUgaW4gdGhlIHRyYWlsLlxyXG4gKiAtIGN1cnJlbnRUYXJnZXQge05vZGV9IC0gVGhlIE5vZGUgdG8gd2hpY2ggdGhlIGxpc3RlbmVyIGJlaW5nIGZpcmVkIGlzIGF0dGFjaGVkLCBvciBudWxsIGlmIHRoZSBsaXN0ZW5lciBpcyBiZWluZ1xyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyZWQgZGlyZWN0bHkgZnJvbSBhIHBvaW50ZXIuXHJcbiAqXHJcbiAqIEFkZGl0aW9uYWxseSwgbGlzdGVuZXJzIG1heSBzdXBwb3J0IGFuIGludGVycnVwdCgpIG1ldGhvZCB0aGF0IGRldGFjaGVzIGl0IGZyb20gcG9pbnRlcnMsIG9yIG1heSBzdXBwb3J0IGJlaW5nXHJcbiAqIFwiYXR0YWNoZWRcIiB0byBhIHBvaW50ZXIgKGluZGljYXRpbmcgYSBwcmltYXJ5IHJvbGUgaW4gY29udHJvbGxpbmcgdGhlIHBvaW50ZXIncyBiZWhhdmlvcikuIFNlZSBQb2ludGVyIGZvciBtb3JlXHJcbiAqIGluZm9ybWF0aW9uIGFib3V0IHRoZXNlIGludGVyYWN0aW9ucy5cclxuICpcclxuICogKioqIEV2ZW50IFR5cGVzXHJcbiAqXHJcbiAqIFNjZW5lcnkgd2lsbCBmaXJlIHRoZSBmb2xsb3dpbmcgYmFzZSBldmVudCB0eXBlczpcclxuICpcclxuICogLSBkb3duOiBUcmlnZ2VyZWQgd2hlbiBhIHBvaW50ZXIgaXMgcHJlc3NlZCBkb3duLiBUb3VjaCAvIHBlbiBwb2ludGVycyBhcmUgY3JlYXRlZCBmb3IgZWFjaCBkb3duIGV2ZW50LCBhbmQgYXJlXHJcbiAqICAgICAgICAgYWN0aXZlIHVudGlsIGFuIHVwL2NhbmNlbCBldmVudCBpcyBzZW50LlxyXG4gKiAtIHVwOiBUcmlnZ2VyZWQgd2hlbiBhIHBvaW50ZXIgaXMgcmVsZWFzZWQgbm9ybWFsbHkuIFRvdWNoIC8gcGVuIHBvaW50ZXJzIHdpbGwgbm90IGhhdmUgYW55IG1vcmUgZXZlbnRzIGFzc29jaWF0ZWRcclxuICogICAgICAgd2l0aCB0aGVtIGFmdGVyIGFuIHVwIGV2ZW50LlxyXG4gKiAtIGNhbmNlbDogVHJpZ2dlcmVkIHdoZW4gYSBwb2ludGVyIGlzIGNhbmNlbGVkIGFibm9ybWFsbHkuIFRvdWNoIC8gcGVuIHBvaW50ZXJzIHdpbGwgbm90IGhhdmUgYW55IG1vcmUgZXZlbnRzXHJcbiAqICAgICAgICAgICBhc3NvY2lhdGVkIHdpdGggdGhlbSBhZnRlciBhbiB1cCBldmVudC5cclxuICogLSBtb3ZlOiBUcmlnZ2VyZWQgd2hlbiBhIHBvaW50ZXIgbW92ZXMuXHJcbiAqIC0gd2hlZWw6IFRyaWdnZXJlZCB3aGVuIHRoZSAobW91c2UpIHdoZWVsIGlzIHNjcm9sbGVkLiBUaGUgYXNzb2NpYXRlZCBwb2ludGVyIHdpbGwgaGF2ZSB3aGVlbERlbHRhIGluZm9ybWF0aW9uLlxyXG4gKiAtIGVudGVyOiBUcmlnZ2VyZWQgd2hlbiBhIHBvaW50ZXIgbW92ZXMgb3ZlciBhIE5vZGUgb3Igb25lIG9mIGl0cyBjaGlsZHJlbi4gRG9lcyBub3QgYnViYmxlIHVwLiBNaXJyb3JzIGJlaGF2aW9yIGZyb21cclxuICogICAgICAgICAgdGhlIERPTSBtb3VzZWVudGVyIChodHRwOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMy1FdmVudHMvI2V2ZW50LXR5cGUtbW91c2VlbnRlcilcclxuICogLSBleGl0OiAgVHJpZ2dlcmVkIHdoZW4gYSBwb2ludGVyIG1vdmVzIG91dCBmcm9tIG92ZXIgYSBOb2RlIG9yIG9uZSBvZiBpdHMgY2hpbGRyZW4uIERvZXMgbm90IGJ1YmJsZSB1cC4gTWlycm9yc1xyXG4gKiAgICAgICAgICBiZWhhdmlvciBmcm9tIHRoZSBET00gbW91c2VsZWF2ZSAoaHR0cDovL3d3dy53My5vcmcvVFIvRE9NLUxldmVsLTMtRXZlbnRzLyNldmVudC10eXBlLW1vdXNlbGVhdmUpLlxyXG4gKiAtIG92ZXI6IFRyaWdnZXJlZCB3aGVuIGEgcG9pbnRlciBtb3ZlcyBvdmVyIGEgTm9kZSAobm90IGluY2x1ZGluZyBpdHMgY2hpbGRyZW4pLiBNaXJyb3JzIGJlaGF2aW9yIGZyb20gdGhlIERPTVxyXG4gKiAgICAgICAgIG1vdXNlb3ZlciAoaHR0cDovL3d3dy53My5vcmcvVFIvRE9NLUxldmVsLTMtRXZlbnRzLyNldmVudC10eXBlLW1vdXNlb3ZlcikuXHJcbiAqIC0gb3V0OiBUcmlnZ2VyZWQgd2hlbiBhIHBvaW50ZXIgbW92ZXMgb3V0IGZyb20gb3ZlciBhIE5vZGUgKG5vdCBpbmNsdWRpbmcgaXRzIGNoaWxkcmVuKS4gTWlycm9ycyBiZWhhdmlvciBmcm9tIHRoZVxyXG4gKiAgICAgICAgRE9NIG1vdXNlb3V0IChodHRwOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMy1FdmVudHMvI2V2ZW50LXR5cGUtbW91c2VvdXQpLlxyXG4gKlxyXG4gKiBCZWZvcmUgZmlyaW5nIHRoZSBiYXNlIGV2ZW50IHR5cGUgKGZvciBleGFtcGxlLCAnbW92ZScpLCBTY2VuZXJ5IHdpbGwgYWxzbyBmaXJlIGFuIGV2ZW50IHNwZWNpZmljIHRvIHRoZSB0eXBlIG9mXHJcbiAqIHBvaW50ZXIuIEZvciBtaWNlLCBpdCB3aWxsIGZpcmUgJ21vdXNlbW92ZScsIGZvciB0b3VjaCBldmVudHMgaXQgd2lsbCBmaXJlICd0b3VjaG1vdmUnLCBhbmQgZm9yIHBlbiBldmVudHMgaXQgd2lsbFxyXG4gKiBmaXJlICdwZW5tb3ZlJy4gU2ltaWxhcmx5LCBmb3IgYW55IHR5cGUgb2YgZXZlbnQsIGl0IHdpbGwgZmlyc3QgZmlyZSBwb2ludGVyVHlwZStldmVudFR5cGUsIGFuZCB0aGVuIGV2ZW50VHlwZS5cclxuICpcclxuICogKioqKiBQRE9NIFNwZWNpZmljIEV2ZW50IFR5cGVzXHJcbiAqXHJcbiAqIFNvbWUgZXZlbnQgdHlwZXMgY2FuIG9ubHkgYmUgdHJpZ2dlcmVkIGZyb20gdGhlIFBET00uIElmIGEgU0NFTkVSWS9Ob2RlIGhhcyBhY2Nlc3NpYmxlIGNvbnRlbnQgKHNlZVxyXG4gKiBQYXJhbGxlbERPTS5qcyBmb3IgbW9yZSBpbmZvKSwgdGhlbiBsaXN0ZW5lcnMgY2FuIGJlIGFkZGVkIGZvciBldmVudHMgZmlyZWQgZnJvbSB0aGUgUERPTS4gVGhlIGFjY2Vzc2liaWxpdHkgZXZlbnRzXHJcbiAqIHRyaWdnZXJlZCBmcm9tIGEgTm9kZSBhcmUgZGVwZW5kZW50IG9uIHRoZSBgdGFnTmFtZWAgKGVyZ28gdGhlIEhUTUxFbGVtZW50IHByaW1hcnkgc2libGluZykgc3BlY2lmaWVkIGJ5IHRoZSBOb2RlLlxyXG4gKlxyXG4gKiBTb21lIHRlcm1pbm9sb2d5IGZvciB1bmRlcnN0YW5kaW5nOlxyXG4gKiAtIFBET006ICBwYXJhbGxlbCBET00sIHNlZSBQYXJhbGxlbERPTS5qc1xyXG4gKiAtIFByaW1hcnkgU2libGluZzogIFRoZSBOb2RlJ3MgSFRNTEVsZW1lbnQgaW4gdGhlIFBET00gdGhhdCBpcyBpbnRlcmFjdGVkIHdpdGggZm9yIGFjY2Vzc2libGUgaW50ZXJhY3Rpb25zIGFuZCB0b1xyXG4gKiAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXkgYWNjZXNzaWJsZSBjb250ZW50LiBUaGUgcHJpbWFyeSBzaWJsaW5nIGhhcyB0aGUgdGFnIG5hbWUgc3BlY2lmaWVkIGJ5IHRoZSBgdGFnTmFtZWBcclxuICogICAgICAgICAgICAgICAgICAgICBvcHRpb24sIHNlZSBgUGFyYWxsZWxET00uc2V0VGFnTmFtZWAuIFByaW1hcnkgc2libGluZyBpcyBmdXJ0aGVyIGRlZmluZWQgaW4gUERPTVBlZXIuanNcclxuICogLSBBc3Npc3RpdmUgVGVjaG5vbG9neTogIGFrYSBBVCwgZGV2aWNlcyBtZWFudCB0byBpbXByb3ZlIHRoZSBjYXBhYmlsaXRpZXMgb2YgYW4gaW5kaXZpZHVhbCB3aXRoIGEgZGlzYWJpbGl0eS5cclxuICpcclxuICogVGhlIGZvbGxvd2luZyBhcmUgdGhlIHN1cHBvcnRlZCBhY2Nlc3NpYmxlIGV2ZW50czpcclxuICpcclxuICogLSBmb2N1czogVHJpZ2dlcmVkIHdoZW4gbmF2aWdhdGlvbiBmb2N1cyBpcyBzZXQgdG8gdGhpcyBOb2RlJ3MgcHJpbWFyeSBzaWJsaW5nLiBUaGlzIGNhbiBiZSB0cmlnZ2VyZWQgd2l0aCBzb21lXHJcbiAqICAgICAgICAgIEFUIHRvbywgbGlrZSBzY3JlZW4gcmVhZGVycycgdmlydHVhbCBjdXJzb3IsIGJ1dCB0aGF0IGlzIG5vdCBkZXBlbmRhYmxlIGFzIGl0IGNhbiBiZSB0b2dnbGVkIHdpdGggYSBzY3JlZW5cclxuICogICAgICAgICAgcmVhZGVyIG9wdGlvbi4gRnVydGhlcm1vcmUsIHRoaXMgZXZlbnQgaXMgbm90IHRyaWdnZXJlZCBvbiBtb2JpbGUgZGV2aWNlcy4gRG9lcyBub3QgYnViYmxlLlxyXG4gKiAtIGZvY3VzaW46IFNhbWUgYXMgJ2ZvY3VzJyBldmVudCwgYnV0IGJ1YmJsZXMuXHJcbiAqIC0gYmx1cjogIFRyaWdnZXJlZCB3aGVuIG5hdmlnYXRpb24gZm9jdXMgbGVhdmVzIHRoaXMgTm9kZSdzIHByaW1hcnkgc2libGluZy4gVGhpcyBjYW4gYmUgdHJpZ2dlcmVkIHdpdGggc29tZVxyXG4gKiAgICAgICAgICBBVCB0b28sIGxpa2Ugc2NyZWVuIHJlYWRlcnMnIHZpcnR1YWwgY3Vyc29yLCBidXQgdGhhdCBpcyBub3QgZGVwZW5kYWJsZSBhcyBpdCBjYW4gYmUgdG9nZ2xlZCB3aXRoIGEgc2NyZWVuXHJcbiAqICAgICAgICAgIHJlYWRlciBvcHRpb24uIEZ1cnRoZXJtb3JlLCB0aGlzIGV2ZW50IGlzIG5vdCB0cmlnZ2VyZWQgb24gbW9iaWxlIGRldmljZXMuXHJcbiAqIC0gZm9jdXNvdXQ6IFNhbWUgYXMgJ2JsdXInIGV2ZW50LCBidXQgYnViYmxlcy5cclxuICogLSBjbGljazogIFRyaWdnZXJlZCB3aGVuIHRoaXMgTm9kZSdzIHByaW1hcnkgc2libGluZyBpcyBjbGlja2VkLiBOb3RlLCB0aG91Z2ggdGhpcyBldmVudCBzZWVtcyBzaW1pbGFyIHRvIHNvbWUgYmFzZVxyXG4gKiAgICAgICAgICAgZXZlbnQgdHlwZXMgKHRoZSBldmVudCBpbXBsZW1lbnRzIGBNb3VzZUV2ZW50YCksIGl0IG9ubHkgYXBwbGllcyB3aGVuIHRyaWdnZXJlZCBmcm9tIHRoZSBQRE9NLlxyXG4gKiAgICAgICAgICAgU2VlIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMy1FdmVudHMvI2NsaWNrXHJcbiAqIC0gaW5wdXQ6ICBUcmlnZ2VyZWQgd2hlbiB0aGUgdmFsdWUgb2YgYW4gPGlucHV0PiwgPHNlbGVjdD4sIG9yIDx0ZXh0YXJlYT4gZWxlbWVudCBoYXMgYmVlbiBjaGFuZ2VkLlxyXG4gKiAgICAgICAgICAgU2VlIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMy1FdmVudHMvI2lucHV0XHJcbiAqIC0gY2hhbmdlOiAgVHJpZ2dlcmVkIGZvciA8aW5wdXQ+LCA8c2VsZWN0PiwgYW5kIDx0ZXh0YXJlYT4gZWxlbWVudHMgd2hlbiBhbiBhbHRlcmF0aW9uIHRvIHRoZSBlbGVtZW50J3MgdmFsdWUgaXNcclxuICogICAgICAgICAgICBjb21taXR0ZWQgYnkgdGhlIHVzZXIuIFVubGlrZSB0aGUgaW5wdXQgZXZlbnQsIHRoZSBjaGFuZ2UgZXZlbnQgaXMgbm90IG5lY2Vzc2FyaWx5IGZpcmVkIGZvciBlYWNoXHJcbiAqICAgICAgICAgICAgYWx0ZXJhdGlvbiB0byBhbiBlbGVtZW50J3MgdmFsdWUuIFNlZVxyXG4gKiAgICAgICAgICAgIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9IVE1MRWxlbWVudC9jaGFuZ2VfZXZlbnQgYW5kXHJcbiAqICAgICAgICAgICAgaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvaW5kaWNlcy5odG1sI2V2ZW50LWNoYW5nZVxyXG4gKiAtIGtleWRvd246IFRyaWdnZXJlZCBmb3IgYWxsIGtleXMgcHJlc3NlZC4gV2hlbiBhIHNjcmVlbiByZWFkZXIgaXMgYWN0aXZlLCB0aGlzIGV2ZW50IHdpbGwgYmUgb21pdHRlZFxyXG4gKiAgICAgICAgICAgIHJvbGU9XCJidXR0b25cIiBpcyBhY3RpdmF0ZWQuXHJcbiAqICAgICAgICAgICAgU2VlIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMy1FdmVudHMvI2tleWRvd25cclxuICogLSBrZXl1cCA6ICBUcmlnZ2VyZWQgZm9yIGFsbCBrZXlzIHdoZW4gcmVsZWFzZWQuIFdoZW4gYSBzY3JlZW4gcmVhZGVyIGlzIGFjdGl2ZSwgdGhpcyBldmVudCB3aWxsIGJlIG9taXR0ZWRcclxuICogICAgICAgICAgICByb2xlPVwiYnV0dG9uXCIgaXMgYWN0aXZhdGVkLlxyXG4gKiAgICAgICAgICAgIFNlZSBodHRwczovL3d3dy53My5vcmcvVFIvRE9NLUxldmVsLTMtRXZlbnRzLyNrZXl1cFxyXG4gKiAtIGdsb2JhbGtleWRvd246IFRyaWdnZXJlZCBmb3IgYWxsIGtleXMgcHJlc3NlZCwgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSBOb2RlIGhhcyBmb2N1cy4gSXQganVzdCBuZWVkcyB0byBiZVxyXG4gKiAgICAgICAgICAgICAgICAgIHZpc2libGUsIGlucHV0RW5hYmxlZCwgYW5kIGFsbCBvZiBpdHMgYW5jZXN0b3JzIHZpc2libGUgYW5kIGlucHV0RW5hYmxlZC5cclxuICogLSBnbG9iYWxrZXl1cDogICBUcmlnZ2VyZWQgZm9yIGFsbCBrZXlzIHJlbGVhc2VkLCByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhlIE5vZGUgaGFzIGZvY3VzLiBJdCBqdXN0IG5lZWRzIHRvIGJlXHJcbiAqICAgICAgICAgICAgICAgICAgdmlzaWJsZSwgaW5wdXRFbmFibGVkLCBhbmQgYWxsIG9mIGl0cyBhbmNlc3RvcnMgdmlzaWJsZSBhbmQgaW5wdXRFbmFibGVkLlxyXG4gKlxyXG4gKlxyXG4gKiAqKiogRXZlbnQgRGlzcGF0Y2hcclxuICpcclxuICogRXZlbnRzIGhhdmUgdHdvIG1ldGhvZHMgdGhhdCB3aWxsIGNhdXNlIGVhcmx5IHRlcm1pbmF0aW9uOiBldmVudC5hYm9ydCgpIHdpbGwgY2F1c2Ugbm8gbW9yZSBsaXN0ZW5lcnMgdG8gYmUgbm90aWZpZWRcclxuICogZm9yIHRoaXMgZXZlbnQsIGFuZCBldmVudC5oYW5kbGUoKSB3aWxsIGFsbG93IHRoZSBjdXJyZW50IGxldmVsIG9mIGxpc3RlbmVycyB0byBiZSBub3RpZmllZCAoYWxsIHBvaW50ZXIgbGlzdGVuZXJzLFxyXG4gKiBvciBhbGwgbGlzdGVuZXJzIGF0dGFjaGVkIHRvIHRoZSBjdXJyZW50IG5vZGUpLCBidXQgbm8gbW9yZSBsaXN0ZW5lcnMgYWZ0ZXIgdGhhdCBsZXZlbCB3aWxsIGZpcmUuIGhhbmRsZSBhbmQgYWJvcnRcclxuICogYXJlIGxpa2Ugc3RvcFByb3BhZ2F0aW9uLCBzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24gZm9yIERPTSBldmVudHMsIGV4Y2VwdCB0aGV5IGRvIG5vdCB0cmlnZ2VyIHRob3NlIERPTSBtZXRob2RzIG9uXHJcbiAqIHRoZSB1bmRlcmx5aW5nIERPTSBldmVudC5cclxuICpcclxuICogVXAvZG93bi9jYW5jZWwgZXZlbnRzIGFsbCBoYXBwZW4gc2VwYXJhdGVseSwgYnV0IGZvciBtb3ZlIGV2ZW50cywgYSBzcGVjaWZpYyBzZXF1ZW5jZSBvZiBldmVudHMgb2NjdXJzIGlmIHRoZSBwb2ludGVyXHJcbiAqIGNoYW5nZXMgdGhlIG5vZGUgaXQgaXMgb3ZlcjpcclxuICpcclxuICogMS4gVGhlIG1vdmUgZXZlbnQgaXMgZmlyZWQgKGFuZCBidWJibGVzKS5cclxuICogMi4gQW4gb3V0IGV2ZW50IGlzIGZpcmVkIGZvciB0aGUgb2xkIHRvcG1vc3QgTm9kZSAoYW5kIGJ1YmJsZXMpLlxyXG4gKiAzLiBleGl0IGV2ZW50cyBhcmUgZmlyZWQgZm9yIGFsbCBOb2RlcyBpbiB0aGUgVHJhaWwgaGllcmFyY2h5IHRoYXQgYXJlIG5vdyBub3QgdW5kZXIgdGhlIHBvaW50ZXIsIGZyb20gdGhlIHJvb3QtbW9zdFxyXG4gKiAgICB0byB0aGUgbGVhZi1tb3N0LiBEb2VzIG5vdCBidWJibGUuXHJcbiAqIDQuIGVudGVyIGV2ZW50cyBhcmUgZmlyZWQgZm9yIGFsbCBOb2RlcyBpbiB0aGUgVHJhaWwgaGllcmFyY2h5IHRoYXQgd2VyZSBub3QgdW5kZXIgdGhlIHBvaW50ZXIgKGJ1dCBub3cgYXJlKSwgZnJvbVxyXG4gKiAgICB0aGUgbGVhZi1tb3N0IHRvIHRoZSByb290LW1vc3QuIERvZXMgbm90IGJ1YmJsZS5cclxuICogNS4gQW4gb3ZlciBldmVudCBpcyBmaXJlZCBmb3IgdGhlIG5ldyB0b3Btb3N0IE5vZGUgKGFuZCBidWJibGVzKS5cclxuICpcclxuICogZXZlbnQuYWJvcnQoKSBhbmQgZXZlbnQuaGFuZGxlKCkgd2lsbCBjdXJyZW50bHkgbm90IGFmZmVjdCBvdGhlciBzdGFnZXMgaW4gdGhlICdtb3ZlJyBzZXF1ZW5jZSAoZS5nLiBldmVudC5hYm9ydCgpIGluXHJcbiAqIHRoZSAnbW92ZScgZXZlbnQgd2lsbCBub3QgYWZmZWN0IHRoZSBmb2xsb3dpbmcgJ291dCcgZXZlbnQpLlxyXG4gKlxyXG4gKiBGb3IgZWFjaCBldmVudCB0eXBlOlxyXG4gKlxyXG4gKiAxLiBMaXN0ZW5lcnMgb24gdGhlIHBvaW50ZXIgd2lsbCBiZSB0cmlnZ2VyZWQgZmlyc3QgKGluIHRoZSBvcmRlciB0aGV5IHdlcmUgYWRkZWQpXHJcbiAqIDIuIExpc3RlbmVycyBvbiB0aGUgdGFyZ2V0ICh0b3AtbW9zdCkgTm9kZSB3aWxsIGJlIHRyaWdnZXJlZCAoaW4gdGhlIG9yZGVyIHRoZXkgd2VyZSBhZGRlZCB0byB0aGF0IE5vZGUpXHJcbiAqIDMuIFRoZW4gaWYgdGhlIGV2ZW50IGJ1YmJsZXMsIGVhY2ggTm9kZSBpbiB0aGUgVHJhaWwgd2lsbCBiZSB0cmlnZ2VyZWQsIHN0YXJ0aW5nIGZyb20gdGhlIE5vZGUgdW5kZXIgdGhlIHRvcC1tb3N0XHJcbiAqICAgICh0aGF0IGp1c3QgaGFkIGxpc3RlbmVycyB0cmlnZ2VyZWQpIGFuZCBhbGwgdGhlIHdheSBkb3duIHRvIHRoZSBTY2VuZS4gTGlzdGVuZXJzIGFyZSB0cmlnZ2VyZWQgaW4gdGhlIG9yZGVyIHRoZXlcclxuICogICAgd2VyZSBhZGRlZCBmb3IgZWFjaCBOb2RlLlxyXG4gKiA0LiBMaXN0ZW5lcnMgb24gdGhlIGRpc3BsYXkgd2lsbCBiZSB0cmlnZ2VyZWQgKGluIHRoZSBvcmRlciB0aGV5IHdlcmUgYWRkZWQpXHJcbiAqXHJcbiAqIEZvciBlYWNoIGxpc3RlbmVyIGJlaW5nIG5vdGlmaWVkLCBpdCB3aWxsIGZpcmUgdGhlIG1vcmUgc3BlY2lmaWMgcG9pbnRlclR5cGUrZXZlbnRUeXBlIGZpcnN0IChlLmcuICdtb3VzZW1vdmUnKSxcclxuICogdGhlbiBldmVudFR5cGUgbmV4dCAoZS5nLiAnbW92ZScpLlxyXG4gKlxyXG4gKiBDdXJyZW50bHksIHByZXZlbnREZWZhdWx0KCkgaXMgY2FsbGVkIG9uIHRoZSBhc3NvY2lhdGVkIERPTSBldmVudCBpZiB0aGUgdG9wLW1vc3Qgbm9kZSBoYXMgdGhlICdpbnRlcmFjdGl2ZScgcHJvcGVydHlcclxuICogc2V0IHRvIGEgdHJ1dGh5IHZhbHVlLlxyXG4gKlxyXG4gKiAqKiogUmVsZXZhbnQgU3BlY2lmaWNhdGlvbnNcclxuICpcclxuICogRE9NIExldmVsIDMgZXZlbnRzIHNwZWM6IGh0dHA6Ly93d3cudzMub3JnL1RSL0RPTS1MZXZlbC0zLUV2ZW50cy9cclxuICogVG91Y2ggZXZlbnRzIHNwZWM6IGh0dHA6Ly93d3cudzMub3JnL1RSL3RvdWNoLWV2ZW50cy9cclxuICogUG9pbnRlciBldmVudHMgc3BlYyBkcmFmdDogaHR0cHM6Ly9kdmNzLnczLm9yZy9oZy9wb2ludGVyZXZlbnRzL3Jhdy1maWxlL3RpcC9wb2ludGVyRXZlbnRzLmh0bWxcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2hoNjczNTU3KHY9dnMuODUpLmFzcHhcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQaGV0aW9BY3Rpb24gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb0FjdGlvbi5qcyc7XHJcbmltcG9ydCBUaW55RW1pdHRlciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RpbnlFbWl0dGVyLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgcGxhdGZvcm0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3BsYXRmb3JtLmpzJztcclxuaW1wb3J0IEV2ZW50VHlwZSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvRXZlbnRUeXBlLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IE51bGxhYmxlSU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bGxhYmxlSU8uanMnO1xyXG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcclxuaW1wb3J0IHsgQmF0Y2hlZERPTUV2ZW50LCBCYXRjaGVkRE9NRXZlbnRDYWxsYmFjaywgQmF0Y2hlZERPTUV2ZW50VHlwZSwgQnJvd3NlckV2ZW50cywgRGlzcGxheSwgRXZlbnRDb250ZXh0LCBFdmVudENvbnRleHRJTywgTW91c2UsIE5vZGUsIFBET01JbnN0YW5jZSwgUERPTVBvaW50ZXIsIFBET01VdGlscywgUGVuLCBQb2ludGVyLCBzY2VuZXJ5LCBTY2VuZXJ5RXZlbnQsIFNjZW5lcnlMaXN0ZW5lckZ1bmN0aW9uLCBTdXBwb3J0ZWRFdmVudFR5cGVzLCBUSW5wdXRMaXN0ZW5lciwgVG91Y2gsIFRyYWlsLCBXaW5kb3dUb3VjaCB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0LCB7IFBoZXRpb09iamVjdE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IEFycmF5SU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0FycmF5SU8uanMnO1xyXG5pbXBvcnQgUGlja09wdGlvbmFsIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrT3B0aW9uYWwuanMnO1xyXG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XHJcblxyXG5jb25zdCBBcnJheUlPUG9pbnRlcklPID0gQXJyYXlJTyggUG9pbnRlci5Qb2ludGVySU8gKTtcclxuXHJcbi8vIFRoaXMgaXMgdGhlIGxpc3Qgb2Yga2V5cyB0aGF0IGdldCBzZXJpYWxpemVkIEFORCBkZXNlcmlhbGl6ZWQuIE5PVEU6IERvIG5vdCBhZGQgb3IgY2hhbmdlIHRoaXMgd2l0aG91dFxyXG4vLyBjb25zdWx0aW5nIHRoZSBQaEVULWlPIElPVHlwZSBzY2hlbWEgZm9yIHRoaXMgaW4gRXZlbnRJT1xyXG5jb25zdCBkb21FdmVudFByb3BlcnRpZXNUb1NlcmlhbGl6ZSA9IFtcclxuICAnYWx0S2V5JyxcclxuICAnYnV0dG9uJyxcclxuICAnY2hhckNvZGUnLFxyXG4gICdjbGllbnRYJyxcclxuICAnY2xpZW50WScsXHJcbiAgJ2NvZGUnLFxyXG4gICdjdHJsS2V5JyxcclxuICAnZGVsdGFNb2RlJyxcclxuICAnZGVsdGFYJyxcclxuICAnZGVsdGFZJyxcclxuICAnZGVsdGFaJyxcclxuICAna2V5JyxcclxuICAna2V5Q29kZScsXHJcbiAgJ21ldGFLZXknLFxyXG4gICdwYWdlWCcsXHJcbiAgJ3BhZ2VZJyxcclxuICAncG9pbnRlcklkJyxcclxuICAncG9pbnRlclR5cGUnLFxyXG4gICdzY2FsZScsXHJcbiAgJ3NoaWZ0S2V5JyxcclxuICAndGFyZ2V0JyxcclxuICAndHlwZScsXHJcbiAgJ3JlbGF0ZWRUYXJnZXQnLFxyXG4gICd3aGljaCdcclxuXSBhcyBjb25zdDtcclxuXHJcbi8vIFRoZSBsaXN0IG9mIHNlcmlhbGl6ZWQgcHJvcGVydGllcyBuZWVkZWQgZm9yIGRlc2VyaWFsaXphdGlvblxyXG50eXBlIFNlcmlhbGl6ZWRQcm9wZXJ0aWVzRm9yRGVzZXJpYWxpemF0aW9uID0gdHlwZW9mIGRvbUV2ZW50UHJvcGVydGllc1RvU2VyaWFsaXplW251bWJlcl07XHJcblxyXG4vLyBDYW5ub3QgYmUgc2V0IGFmdGVyIGNvbnN0cnVjdGlvbiwgYW5kIHNob3VsZCBiZSBwcm92aWRlZCBpbiB0aGUgaW5pdCBjb25maWcgdG8gdGhlIGNvbnN0cnVjdG9yKCksIHNlZSBJbnB1dC5kZXNlcmlhbGl6ZURPTUV2ZW50XHJcbmNvbnN0IGRvbUV2ZW50UHJvcGVydGllc1NldEluQ29uc3RydWN0b3I6IFNlcmlhbGl6ZWRQcm9wZXJ0aWVzRm9yRGVzZXJpYWxpemF0aW9uW10gPSBbXHJcbiAgJ2RlbHRhTW9kZScsXHJcbiAgJ2RlbHRhWCcsXHJcbiAgJ2RlbHRhWScsXHJcbiAgJ2RlbHRhWicsXHJcbiAgJ2FsdEtleScsXHJcbiAgJ2J1dHRvbicsXHJcbiAgJ2NoYXJDb2RlJyxcclxuICAnY2xpZW50WCcsXHJcbiAgJ2NsaWVudFknLFxyXG4gICdjb2RlJyxcclxuICAnY3RybEtleScsXHJcbiAgJ2tleScsXHJcbiAgJ2tleUNvZGUnLFxyXG4gICdtZXRhS2V5JyxcclxuICAncGFnZVgnLFxyXG4gICdwYWdlWScsXHJcbiAgJ3BvaW50ZXJJZCcsXHJcbiAgJ3BvaW50ZXJUeXBlJyxcclxuICAnc2hpZnRLZXknLFxyXG4gICd0eXBlJyxcclxuICAncmVsYXRlZFRhcmdldCcsXHJcbiAgJ3doaWNoJ1xyXG5dO1xyXG5cclxudHlwZSBTZXJpYWxpemVkRE9NRXZlbnQgPSB7XHJcbiAgY29uc3RydWN0b3JOYW1lOiBzdHJpbmc7IC8vIHVzZWQgdG8gZ2V0IHRoZSBjb25zdHJ1Y3RvciBmcm9tIHRoZSB3aW5kb3cgb2JqZWN0LCBzZWUgSW5wdXQuZGVzZXJpYWxpemVET01FdmVudFxyXG59ICYge1xyXG4gIFtrZXkgaW4gU2VyaWFsaXplZFByb3BlcnRpZXNGb3JEZXNlcmlhbGl6YXRpb25dPzogdW5rbm93bjtcclxufTtcclxuXHJcbi8vIEEgbGlzdCBvZiBrZXlzIG9uIGV2ZW50cyB0aGF0IG5lZWQgdG8gYmUgc2VyaWFsaXplZCBpbnRvIEhUTUxFbGVtZW50c1xyXG5jb25zdCBFVkVOVF9LRVlfVkFMVUVTX0FTX0VMRU1FTlRTOiBTZXJpYWxpemVkUHJvcGVydGllc0ZvckRlc2VyaWFsaXphdGlvbltdID0gWyAndGFyZ2V0JywgJ3JlbGF0ZWRUYXJnZXQnIF07XHJcblxyXG4vLyBBIGxpc3Qgb2YgZXZlbnRzIHRoYXQgc2hvdWxkIHN0aWxsIGZpcmUsIGV2ZW4gd2hlbiB0aGUgTm9kZSBpcyBub3QgcGlja2FibGVcclxuY29uc3QgUERPTV9VTlBJQ0tBQkxFX0VWRU5UUyA9IFsgJ2ZvY3VzJywgJ2JsdXInLCAnZm9jdXNpbicsICdmb2N1c291dCcgXTtcclxuY29uc3QgVEFSR0VUX1NVQlNUSVRVVEVfS0VZID0gJ3RhcmdldFN1YnN0aXR1dGUnIGFzIGNvbnN0O1xyXG50eXBlIFRhcmdldFN1YnN0aXR1ZGVBdWdtZW50ZWRFdmVudCA9IEV2ZW50ICYge1xyXG4gIFsgVEFSR0VUX1NVQlNUSVRVVEVfS0VZIF0/OiBFbGVtZW50O1xyXG59O1xyXG5cclxuXHJcbi8vIEEgYml0IG1vcmUgdGhhbiB0aGUgbWF4aW11bSBhbW91bnQgb2YgdGltZSB0aGF0IGlPUyAxNCBWb2ljZU92ZXIgd2FzIG9ic2VydmVkIHRvIGRlbGF5IGJldHdlZW5cclxuLy8gc2VuZGluZyBhIG1vdXNldXAgZXZlbnQgYW5kIGEgY2xpY2sgZXZlbnQuXHJcbmNvbnN0IFBET01fQ0xJQ0tfREVMQVkgPSA4MDtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxuZXhwb3J0IHR5cGUgSW5wdXRPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrT3B0aW9uYWw8UGhldGlvT2JqZWN0T3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5wdXQgZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgZGlzcGxheTogRGlzcGxheTtcclxuICBwdWJsaWMgcmVhZG9ubHkgcm9vdE5vZGU6IE5vZGU7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBhdHRhY2hUb1dpbmRvdzogYm9vbGVhbjtcclxuICBwdWJsaWMgcmVhZG9ubHkgYmF0Y2hET01FdmVudHM6IGJvb2xlYW47XHJcbiAgcHVibGljIHJlYWRvbmx5IGFzc3VtZUZ1bGxXaW5kb3c6IGJvb2xlYW47XHJcbiAgcHVibGljIHJlYWRvbmx5IHBhc3NpdmVFdmVudHM6IGJvb2xlYW4gfCBudWxsO1xyXG5cclxuICAvLyBQb2ludGVyIGZvciBhY2Nlc3NpYmlsaXR5LCBvbmx5IGNyZWF0ZWQgbGF6aWx5IG9uIGZpcnN0IHBkb20gZXZlbnQuXHJcbiAgcHVibGljIHBkb21Qb2ludGVyOiBQRE9NUG9pbnRlciB8IG51bGw7XHJcblxyXG4gIC8vIFBvaW50ZXIgZm9yIG1vdXNlLCBvbmx5IGNyZWF0ZWQgbGF6aWx5IG9uIGZpcnN0IG1vdXNlIGV2ZW50LCBzbyBubyBtb3VzZSBpcyBhbGxvY2F0ZWQgb24gdGFibGV0cy5cclxuICBwdWJsaWMgbW91c2U6IE1vdXNlIHwgbnVsbDtcclxuXHJcbiAgLy8gQWxsIGFjdGl2ZSBwb2ludGVycy5cclxuICBwdWJsaWMgcG9pbnRlcnM6IFBvaW50ZXJbXTtcclxuXHJcbiAgcHVibGljIHBvaW50ZXJBZGRlZEVtaXR0ZXI6IFRFbWl0dGVyPFsgUG9pbnRlciBdPjtcclxuXHJcbiAgLy8gV2hldGhlciB3ZSBhcmUgY3VycmVudGx5IGZpcmluZyBldmVudHMuIFdlIG5lZWQgdG8gdHJhY2sgdGhpcyB0byBoYW5kbGUgcmUtZW50cmFudCBjYXNlc1xyXG4gIC8vIGxpa2UgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2JhbGxvb25zLWFuZC1zdGF0aWMtZWxlY3RyaWNpdHkvaXNzdWVzLzQwNi5cclxuICBwdWJsaWMgY3VycmVudGx5RmlyaW5nRXZlbnRzOiBib29sZWFuO1xyXG5cclxuICBwcml2YXRlIGJhdGNoZWRFdmVudHM6IEJhdGNoZWRET01FdmVudFtdO1xyXG5cclxuICAvLyBJbiBtaWxpc2Vjb25kcywgdGhlIERPTUV2ZW50IHRpbWVTdGFtcCB3aGVuIHdlIHJlY2VpdmUgYSBsb2dpY2FsIHVwIGV2ZW50LlxyXG4gIC8vIFdlIGNhbiBjb21wYXJlIHRoaXMgdG8gdGhlIHRpbWVTdGFtcCBvbiBhIGNsaWNrIHZlbnQgdG8gZmlsdGVyIG91dCB0aGUgY2xpY2sgZXZlbnRzXHJcbiAgLy8gd2hlbiBzb21lIHNjcmVlbiByZWFkZXJzIHNlbmQgYm90aCBkb3duL3VwIGV2ZW50cyBBTkQgY2xpY2sgZXZlbnRzIHRvIHRoZSB0YXJnZXRcclxuICAvLyBlbGVtZW50LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzEwOTRcclxuICBwcml2YXRlIHVwVGltZVN0YW1wOiBudW1iZXI7XHJcblxyXG4gIC8vIEVtaXRzIHBvaW50ZXIgdmFsaWRhdGlvbiB0byB0aGUgaW5wdXQgc3RyZWFtIGZvciBwbGF5YmFja1xyXG4gIC8vIFRoaXMgaXMgYSBoaWdoIGZyZXF1ZW5jeSBldmVudCB0aGF0IGlzIG5lY2Vzc2FyeSBmb3IgcmVwcm9kdWNpYmxlIHBsYXliYWNrc1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdmFsaWRhdGVQb2ludGVyc0FjdGlvbjogUGhldGlvQWN0aW9uO1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IG1vdXNlVXBBY3Rpb246IFBoZXRpb0FjdGlvbjxbIFZlY3RvcjIsIEV2ZW50Q29udGV4dDxNb3VzZUV2ZW50PiBdPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IG1vdXNlRG93bkFjdGlvbjogUGhldGlvQWN0aW9uPFsgbnVtYmVyLCBWZWN0b3IyLCBFdmVudENvbnRleHQ8TW91c2VFdmVudD4gXT47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBtb3VzZU1vdmVBY3Rpb246IFBoZXRpb0FjdGlvbjxbIFZlY3RvcjIsIEV2ZW50Q29udGV4dDxNb3VzZUV2ZW50PiBdPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IG1vdXNlT3ZlckFjdGlvbjogUGhldGlvQWN0aW9uPFsgVmVjdG9yMiwgRXZlbnRDb250ZXh0PE1vdXNlRXZlbnQ+IF0+O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbW91c2VPdXRBY3Rpb246IFBoZXRpb0FjdGlvbjxbIFZlY3RvcjIsIEV2ZW50Q29udGV4dDxNb3VzZUV2ZW50PiBdPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IHdoZWVsU2Nyb2xsQWN0aW9uOiBQaGV0aW9BY3Rpb248WyBFdmVudENvbnRleHQ8V2hlZWxFdmVudD4gXT47XHJcbiAgcHJpdmF0ZSByZWFkb25seSB0b3VjaFN0YXJ0QWN0aW9uOiBQaGV0aW9BY3Rpb248WyBudW1iZXIsIFZlY3RvcjIsIEV2ZW50Q29udGV4dDxUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50PiBdPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IHRvdWNoRW5kQWN0aW9uOiBQaGV0aW9BY3Rpb248WyBudW1iZXIsIFZlY3RvcjIsIEV2ZW50Q29udGV4dDxUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50PiBdPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IHRvdWNoTW92ZUFjdGlvbjogUGhldGlvQWN0aW9uPFsgbnVtYmVyLCBWZWN0b3IyLCBFdmVudENvbnRleHQ8VG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudD4gXT47XHJcbiAgcHJpdmF0ZSByZWFkb25seSB0b3VjaENhbmNlbEFjdGlvbjogUGhldGlvQWN0aW9uPFsgbnVtYmVyLCBWZWN0b3IyLCBFdmVudENvbnRleHQ8VG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudD4gXT47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBwZW5TdGFydEFjdGlvbjogUGhldGlvQWN0aW9uPFsgbnVtYmVyLCBWZWN0b3IyLCBFdmVudENvbnRleHQ8UG9pbnRlckV2ZW50PiBdPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IHBlbkVuZEFjdGlvbjogUGhldGlvQWN0aW9uPFsgbnVtYmVyLCBWZWN0b3IyLCBFdmVudENvbnRleHQ8UG9pbnRlckV2ZW50PiBdPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IHBlbk1vdmVBY3Rpb246IFBoZXRpb0FjdGlvbjxbIG51bWJlciwgVmVjdG9yMiwgRXZlbnRDb250ZXh0PFBvaW50ZXJFdmVudD4gXT47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBwZW5DYW5jZWxBY3Rpb246IFBoZXRpb0FjdGlvbjxbIG51bWJlciwgVmVjdG9yMiwgRXZlbnRDb250ZXh0PFBvaW50ZXJFdmVudD4gXT47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBnb3RQb2ludGVyQ2FwdHVyZUFjdGlvbjogUGhldGlvQWN0aW9uPFsgbnVtYmVyLCBFdmVudENvbnRleHQgXT47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBsb3N0UG9pbnRlckNhcHR1cmVBY3Rpb246IFBoZXRpb0FjdGlvbjxbIG51bWJlciwgRXZlbnRDb250ZXh0IF0+O1xyXG5cclxuICAvLyBJZiBhY2Nlc3NpYmxlXHJcbiAgcHJpdmF0ZSByZWFkb25seSBmb2N1c2luQWN0aW9uOiBQaGV0aW9BY3Rpb248WyBFdmVudENvbnRleHQ8Rm9jdXNFdmVudD4gXT47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBmb2N1c291dEFjdGlvbjogUGhldGlvQWN0aW9uPFsgRXZlbnRDb250ZXh0PEZvY3VzRXZlbnQ+IF0+O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgY2xpY2tBY3Rpb246IFBoZXRpb0FjdGlvbjxbIEV2ZW50Q29udGV4dDxNb3VzZUV2ZW50PiBdPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IGlucHV0QWN0aW9uOiBQaGV0aW9BY3Rpb248WyBFdmVudENvbnRleHQ8RXZlbnQgfCBJbnB1dEV2ZW50PiBdPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IGNoYW5nZUFjdGlvbjogUGhldGlvQWN0aW9uPFsgRXZlbnRDb250ZXh0IF0+O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkga2V5ZG93bkFjdGlvbjogUGhldGlvQWN0aW9uPFsgRXZlbnRDb250ZXh0PEtleWJvYXJkRXZlbnQ+IF0+O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkga2V5dXBBY3Rpb246IFBoZXRpb0FjdGlvbjxbIEV2ZW50Q29udGV4dDxLZXlib2FyZEV2ZW50PiBdPjtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBJbnB1dElPID0gbmV3IElPVHlwZTxJbnB1dD4oICdJbnB1dElPJywge1xyXG4gICAgdmFsdWVUeXBlOiBJbnB1dCxcclxuICAgIGFwcGx5U3RhdGU6IF8ubm9vcCxcclxuICAgIHRvU3RhdGVPYmplY3Q6ICggaW5wdXQ6IElucHV0ICkgPT4ge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHBvaW50ZXJzOiBBcnJheUlPUG9pbnRlcklPLnRvU3RhdGVPYmplY3QoIGlucHV0LnBvaW50ZXJzIClcclxuICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBzdGF0ZVNjaGVtYToge1xyXG4gICAgICBwb2ludGVyczogQXJyYXlJT1BvaW50ZXJJT1xyXG4gICAgfVxyXG4gIH0gKTtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGRpc3BsYXlcclxuICAgKiBAcGFyYW0gYXR0YWNoVG9XaW5kb3cgLSBXaGV0aGVyIHRvIGFkZCBsaXN0ZW5lcnMgdG8gdGhlIHdpbmRvdyAoaW5zdGVhZCBvZiB0aGUgRGlzcGxheSdzIGRvbUVsZW1lbnQpLlxyXG4gICAqIEBwYXJhbSBiYXRjaERPTUV2ZW50cyAtIElmIHRydWUsIG1vc3QgZXZlbnQgdHlwZXMgd2lsbCBiZSBiYXRjaGVkIHVudGlsIG90aGVyd2lzZSB0cmlnZ2VyZWQuXHJcbiAgICogQHBhcmFtIGFzc3VtZUZ1bGxXaW5kb3cgLSBXZSBjYW4gb3B0aW1pemUgY2VydGFpbiB0aGluZ3MgbGlrZSBjb21wdXRpbmcgcG9pbnRzIGlmIHdlIGtub3cgdGhlIGRpc3BsYXlcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxscyB0aGUgZW50aXJlIHdpbmRvdy5cclxuICAgKiBAcGFyYW0gcGFzc2l2ZUV2ZW50cyAtIFNlZSBEaXNwbGF5J3MgZG9jdW1lbnRhdGlvbiAoY29udHJvbHMgdGhlIHByZXNlbmNlIG9mIHRoZSBwYXNzaXZlIGZsYWcgZm9yXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudHMsIHdoaWNoIGhhcyBzb21lIGFkdmFuY2VkIGNvbnNpZGVyYXRpb25zKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZGlzcGxheTogRGlzcGxheSwgYXR0YWNoVG9XaW5kb3c6IGJvb2xlYW4sIGJhdGNoRE9NRXZlbnRzOiBib29sZWFuLCBhc3N1bWVGdWxsV2luZG93OiBib29sZWFuLCBwYXNzaXZlRXZlbnRzOiBib29sZWFuIHwgbnVsbCwgcHJvdmlkZWRPcHRpb25zPzogSW5wdXRPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8SW5wdXRPcHRpb25zLCBTZWxmT3B0aW9ucywgUGhldGlvT2JqZWN0T3B0aW9ucz4oKSgge1xyXG4gICAgICBwaGV0aW9UeXBlOiBJbnB1dC5JbnB1dElPLFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRJT05BTCxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0NlbnRyYWwgcG9pbnQgZm9yIHVzZXIgaW5wdXQgZXZlbnRzLCBzdWNoIGFzIG1vdXNlLCB0b3VjaCdcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5kaXNwbGF5ID0gZGlzcGxheTtcclxuICAgIHRoaXMucm9vdE5vZGUgPSBkaXNwbGF5LnJvb3ROb2RlO1xyXG5cclxuICAgIHRoaXMuYXR0YWNoVG9XaW5kb3cgPSBhdHRhY2hUb1dpbmRvdztcclxuICAgIHRoaXMuYmF0Y2hET01FdmVudHMgPSBiYXRjaERPTUV2ZW50cztcclxuICAgIHRoaXMuYXNzdW1lRnVsbFdpbmRvdyA9IGFzc3VtZUZ1bGxXaW5kb3c7XHJcbiAgICB0aGlzLnBhc3NpdmVFdmVudHMgPSBwYXNzaXZlRXZlbnRzO1xyXG4gICAgdGhpcy5iYXRjaGVkRXZlbnRzID0gW107XHJcbiAgICB0aGlzLnBkb21Qb2ludGVyID0gbnVsbDtcclxuICAgIHRoaXMubW91c2UgPSBudWxsO1xyXG4gICAgdGhpcy5wb2ludGVycyA9IFtdO1xyXG4gICAgdGhpcy5wb2ludGVyQWRkZWRFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyPFsgUG9pbnRlciBdPigpO1xyXG4gICAgdGhpcy5jdXJyZW50bHlGaXJpbmdFdmVudHMgPSBmYWxzZTtcclxuICAgIHRoaXMudXBUaW1lU3RhbXAgPSAwO1xyXG5cclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIC8vIERlY2xhcmUgdGhlIEFjdGlvbnMgdGhhdCBzZW5kIHNjZW5lcnkgaW5wdXQgZXZlbnRzIHRvIHRoZSBQaEVULWlPIGRhdGEgc3RyZWFtLiAgTm90ZSB0aGV5IHVzZSB0aGUgZGVmYXVsdCB2YWx1ZVxyXG4gICAgLy8gb2YgcGhldGlvUmVhZE9ubHkgZmFsc2UsIGluIGNhc2UgYSBjbGllbnQgd2FudHMgdG8gc3ludGhlc2l6ZSBldmVudHMuXHJcblxyXG4gICAgdGhpcy52YWxpZGF0ZVBvaW50ZXJzQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggKCkgPT4ge1xyXG4gICAgICBsZXQgaSA9IHRoaXMucG9pbnRlcnMubGVuZ3RoO1xyXG4gICAgICB3aGlsZSAoIGktLSApIHtcclxuICAgICAgICBjb25zdCBwb2ludGVyID0gdGhpcy5wb2ludGVyc1sgaSBdO1xyXG4gICAgICAgIGlmICggcG9pbnRlci5wb2ludCAmJiBwb2ludGVyICE9PSB0aGlzLnBkb21Qb2ludGVyICkge1xyXG4gICAgICAgICAgdGhpcy5icmFuY2hDaGFuZ2VFdmVudHM8RXZlbnQ+KCBwb2ludGVyLCBwb2ludGVyLmxhc3RFdmVudENvbnRleHQgfHwgRXZlbnRDb250ZXh0LmNyZWF0ZVN5bnRoZXRpYygpLCBmYWxzZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd2YWxpZGF0ZVBvaW50ZXJzQWN0aW9uJyApLFxyXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5tb3VzZVVwQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggKCBwb2ludDogVmVjdG9yMiwgY29udGV4dDogRXZlbnRDb250ZXh0PE1vdXNlRXZlbnQ+ICkgPT4ge1xyXG4gICAgICBjb25zdCBtb3VzZSA9IHRoaXMuZW5zdXJlTW91c2UoIHBvaW50ICk7XHJcbiAgICAgIG1vdXNlLmlkID0gbnVsbDtcclxuICAgICAgdGhpcy51cEV2ZW50PE1vdXNlRXZlbnQ+KCBtb3VzZSwgY29udGV4dCwgcG9pbnQgKTtcclxuICAgIH0sIHtcclxuICAgICAgcGhldGlvUGxheWJhY2s6IHRydWUsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbW91c2VVcEFjdGlvbicgKSxcclxuICAgICAgcGFyYW1ldGVyczogW1xyXG4gICAgICAgIHsgbmFtZTogJ3BvaW50JywgcGhldGlvVHlwZTogVmVjdG9yMi5WZWN0b3IySU8gfSxcclxuICAgICAgICB7IG5hbWU6ICdjb250ZXh0JywgcGhldGlvVHlwZTogRXZlbnRDb250ZXh0SU8gfVxyXG4gICAgICBdLFxyXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgd2hlbiBhIG1vdXNlIGJ1dHRvbiBpcyByZWxlYXNlZC4nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5tb3VzZURvd25BY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCAoIGlkOiBudW1iZXIsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8TW91c2VFdmVudD4gKSA9PiB7XHJcbiAgICAgIGNvbnN0IG1vdXNlID0gdGhpcy5lbnN1cmVNb3VzZSggcG9pbnQgKTtcclxuICAgICAgbW91c2UuaWQgPSBpZDtcclxuICAgICAgdGhpcy5kb3duRXZlbnQ8TW91c2VFdmVudD4oIG1vdXNlLCBjb250ZXh0LCBwb2ludCApO1xyXG4gICAgfSwge1xyXG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb3VzZURvd25BY3Rpb24nICksXHJcbiAgICAgIHBhcmFtZXRlcnM6IFtcclxuICAgICAgICB7IG5hbWU6ICdpZCcsIHBoZXRpb1R5cGU6IE51bGxhYmxlSU8oIE51bWJlcklPICkgfSxcclxuICAgICAgICB7IG5hbWU6ICdwb2ludCcsIHBoZXRpb1R5cGU6IFZlY3RvcjIuVmVjdG9yMklPIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnY29udGV4dCcsIHBoZXRpb1R5cGU6IEV2ZW50Q29udGV4dElPIH1cclxuICAgICAgXSxcclxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW4gYSBtb3VzZSBidXR0b24gaXMgcHJlc3NlZC4nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5tb3VzZU1vdmVBY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCAoIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8TW91c2VFdmVudD4gKSA9PiB7XHJcbiAgICAgIGNvbnN0IG1vdXNlID0gdGhpcy5lbnN1cmVNb3VzZSggcG9pbnQgKTtcclxuICAgICAgbW91c2UubW92ZSggcG9pbnQgKTtcclxuICAgICAgdGhpcy5tb3ZlRXZlbnQ8TW91c2VFdmVudD4oIG1vdXNlLCBjb250ZXh0ICk7XHJcbiAgICB9LCB7XHJcbiAgICAgIHBoZXRpb1BsYXliYWNrOiB0cnVlLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21vdXNlTW92ZUFjdGlvbicgKSxcclxuICAgICAgcGFyYW1ldGVyczogW1xyXG4gICAgICAgIHsgbmFtZTogJ3BvaW50JywgcGhldGlvVHlwZTogVmVjdG9yMi5WZWN0b3IySU8gfSxcclxuICAgICAgICB7IG5hbWU6ICdjb250ZXh0JywgcGhldGlvVHlwZTogRXZlbnRDb250ZXh0SU8gfVxyXG4gICAgICBdLFxyXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgd2hlbiB0aGUgbW91c2UgaXMgbW92ZWQuJyxcclxuICAgICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMubW91c2VPdmVyQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggKCBwb2ludDogVmVjdG9yMiwgY29udGV4dDogRXZlbnRDb250ZXh0PE1vdXNlRXZlbnQ+ICkgPT4ge1xyXG4gICAgICBjb25zdCBtb3VzZSA9IHRoaXMuZW5zdXJlTW91c2UoIHBvaW50ICk7XHJcbiAgICAgIG1vdXNlLm92ZXIoIHBvaW50ICk7XHJcbiAgICAgIC8vIFRPRE86IGhvdyB0byBoYW5kbGUgbW91c2Utb3ZlciAoYW5kIGxvZyBpdCkuLi4gYXJlIHdlIGNoYW5naW5nIHRoZSBwb2ludGVyLnBvaW50IHdpdGhvdXQgYSBicmFuY2ggY2hhbmdlP1xyXG4gICAgfSwge1xyXG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb3VzZU92ZXJBY3Rpb24nICksXHJcbiAgICAgIHBhcmFtZXRlcnM6IFtcclxuICAgICAgICB7IG5hbWU6ICdwb2ludCcsIHBoZXRpb1R5cGU6IFZlY3RvcjIuVmVjdG9yMklPIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnY29udGV4dCcsIHBoZXRpb1R5cGU6IEV2ZW50Q29udGV4dElPIH1cclxuICAgICAgXSxcclxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW4gdGhlIG1vdXNlIGlzIG1vdmVkIHdoaWxlIG9uIHRoZSBzaW0uJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMubW91c2VPdXRBY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCAoIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8TW91c2VFdmVudD4gKSA9PiB7XHJcbiAgICAgIGNvbnN0IG1vdXNlID0gdGhpcy5lbnN1cmVNb3VzZSggcG9pbnQgKTtcclxuICAgICAgbW91c2Uub3V0KCBwb2ludCApO1xyXG4gICAgICAvLyBUT0RPOiBob3cgdG8gaGFuZGxlIG1vdXNlLW91dCAoYW5kIGxvZyBpdCkuLi4gYXJlIHdlIGNoYW5naW5nIHRoZSBwb2ludGVyLnBvaW50IHdpdGhvdXQgYSBicmFuY2ggY2hhbmdlP1xyXG4gICAgfSwge1xyXG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb3VzZU91dEFjdGlvbicgKSxcclxuICAgICAgcGFyYW1ldGVyczogW1xyXG4gICAgICAgIHsgbmFtZTogJ3BvaW50JywgcGhldGlvVHlwZTogVmVjdG9yMi5WZWN0b3IySU8gfSxcclxuICAgICAgICB7IG5hbWU6ICdjb250ZXh0JywgcGhldGlvVHlwZTogRXZlbnRDb250ZXh0SU8gfVxyXG4gICAgICBdLFxyXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgd2hlbiB0aGUgbW91c2UgbW92ZXMgb3V0IG9mIHRoZSBkaXNwbGF5LidcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLndoZWVsU2Nyb2xsQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggKCBjb250ZXh0OiBFdmVudENvbnRleHQ8V2hlZWxFdmVudD4gKSA9PiB7XHJcbiAgICAgIGNvbnN0IGV2ZW50ID0gY29udGV4dC5kb21FdmVudDtcclxuXHJcbiAgICAgIGNvbnN0IG1vdXNlID0gdGhpcy5lbnN1cmVNb3VzZSggdGhpcy5wb2ludEZyb21FdmVudCggZXZlbnQgKSApO1xyXG4gICAgICBtb3VzZS53aGVlbCggZXZlbnQgKTtcclxuXHJcbiAgICAgIC8vIGRvbid0IHNlbmQgbW91c2Utd2hlZWwgZXZlbnRzIGlmIHdlIGRvbid0IHlldCBoYXZlIGEgbW91c2UgbG9jYXRpb24hXHJcbiAgICAgIC8vIFRPRE86IENhbiB3ZSBzZXQgdGhlIG1vdXNlIGxvY2F0aW9uIGJhc2VkIG9uIHRoZSB3aGVlbCBldmVudD9cclxuICAgICAgaWYgKCBtb3VzZS5wb2ludCApIHtcclxuICAgICAgICBjb25zdCB0cmFpbCA9IHRoaXMucm9vdE5vZGUudHJhaWxVbmRlclBvaW50ZXIoIG1vdXNlICkgfHwgbmV3IFRyYWlsKCB0aGlzLnJvb3ROb2RlICk7XHJcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50PFdoZWVsRXZlbnQ+KCB0cmFpbCwgJ3doZWVsJywgbW91c2UsIGNvbnRleHQsIHRydWUgKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd3aGVlbFNjcm9sbEFjdGlvbicgKSxcclxuICAgICAgcGFyYW1ldGVyczogW1xyXG4gICAgICAgIHsgbmFtZTogJ2NvbnRleHQnLCBwaGV0aW9UeXBlOiBFdmVudENvbnRleHRJTyB9XHJcbiAgICAgIF0sXHJcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVIsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFbWl0cyB3aGVuIHRoZSBtb3VzZSB3aGVlbCBzY3JvbGxzLicsXHJcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnRvdWNoU3RhcnRBY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCAoIGlkOiBudW1iZXIsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8VG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudD4gKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRvdWNoID0gbmV3IFRvdWNoKCBpZCwgcG9pbnQsIGNvbnRleHQuZG9tRXZlbnQgKTtcclxuICAgICAgdGhpcy5hZGRQb2ludGVyKCB0b3VjaCApO1xyXG4gICAgICB0aGlzLmRvd25FdmVudDxUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50PiggdG91Y2gsIGNvbnRleHQsIHBvaW50ICk7XHJcbiAgICB9LCB7XHJcbiAgICAgIHBoZXRpb1BsYXliYWNrOiB0cnVlLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RvdWNoU3RhcnRBY3Rpb24nICksXHJcbiAgICAgIHBhcmFtZXRlcnM6IFtcclxuICAgICAgICB7IG5hbWU6ICdpZCcsIHBoZXRpb1R5cGU6IE51bWJlcklPIH0sXHJcbiAgICAgICAgeyBuYW1lOiAncG9pbnQnLCBwaGV0aW9UeXBlOiBWZWN0b3IyLlZlY3RvcjJJTyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ2NvbnRleHQnLCBwaGV0aW9UeXBlOiBFdmVudENvbnRleHRJTyB9XHJcbiAgICAgIF0sXHJcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVIsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFbWl0cyB3aGVuIGEgdG91Y2ggYmVnaW5zLidcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnRvdWNoRW5kQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggKCBpZDogbnVtYmVyLCBwb2ludDogVmVjdG9yMiwgY29udGV4dDogRXZlbnRDb250ZXh0PFRvdWNoRXZlbnQgfCBQb2ludGVyRXZlbnQ+ICkgPT4ge1xyXG4gICAgICBjb25zdCB0b3VjaCA9IHRoaXMuZmluZFBvaW50ZXJCeUlkKCBpZCApIGFzIFRvdWNoIHwgbnVsbDtcclxuICAgICAgaWYgKCB0b3VjaCApIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0b3VjaCBpbnN0YW5jZW9mIFRvdWNoICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2ltcGxlLXR5cGUtY2hlY2tpbmctYXNzZXJ0aW9ucywgYmFkLXNpbS10ZXh0XHJcbiAgICAgICAgdGhpcy51cEV2ZW50PFRvdWNoRXZlbnQgfCBQb2ludGVyRXZlbnQ+KCB0b3VjaCwgY29udGV4dCwgcG9pbnQgKTtcclxuICAgICAgICB0aGlzLnJlbW92ZVBvaW50ZXIoIHRvdWNoICk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAgcGhldGlvUGxheWJhY2s6IHRydWUsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndG91Y2hFbmRBY3Rpb24nICksXHJcbiAgICAgIHBhcmFtZXRlcnM6IFtcclxuICAgICAgICB7IG5hbWU6ICdpZCcsIHBoZXRpb1R5cGU6IE51bWJlcklPIH0sXHJcbiAgICAgICAgeyBuYW1lOiAncG9pbnQnLCBwaGV0aW9UeXBlOiBWZWN0b3IyLlZlY3RvcjJJTyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ2NvbnRleHQnLCBwaGV0aW9UeXBlOiBFdmVudENvbnRleHRJTyB9XHJcbiAgICAgIF0sXHJcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVIsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFbWl0cyB3aGVuIGEgdG91Y2ggZW5kcy4nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy50b3VjaE1vdmVBY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCAoIGlkOiBudW1iZXIsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8VG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudD4gKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRvdWNoID0gdGhpcy5maW5kUG9pbnRlckJ5SWQoIGlkICkgYXMgVG91Y2ggfCBudWxsO1xyXG4gICAgICBpZiAoIHRvdWNoICkge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRvdWNoIGluc3RhbmNlb2YgVG91Y2ggKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zaW1wbGUtdHlwZS1jaGVja2luZy1hc3NlcnRpb25zLCBiYWQtc2ltLXRleHRcclxuICAgICAgICB0b3VjaC5tb3ZlKCBwb2ludCApO1xyXG4gICAgICAgIHRoaXMubW92ZUV2ZW50PFRvdWNoRXZlbnQgfCBQb2ludGVyRXZlbnQ+KCB0b3VjaCwgY29udGV4dCApO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIHBoZXRpb1BsYXliYWNrOiB0cnVlLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RvdWNoTW92ZUFjdGlvbicgKSxcclxuICAgICAgcGFyYW1ldGVyczogW1xyXG4gICAgICAgIHsgbmFtZTogJ2lkJywgcGhldGlvVHlwZTogTnVtYmVySU8gfSxcclxuICAgICAgICB7IG5hbWU6ICdwb2ludCcsIHBoZXRpb1R5cGU6IFZlY3RvcjIuVmVjdG9yMklPIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnY29udGV4dCcsIHBoZXRpb1R5cGU6IEV2ZW50Q29udGV4dElPIH1cclxuICAgICAgXSxcclxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW4gYSB0b3VjaCBtb3Zlcy4nLFxyXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy50b3VjaENhbmNlbEFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggaWQ6IG51bWJlciwgcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50PiApID0+IHtcclxuICAgICAgY29uc3QgdG91Y2ggPSB0aGlzLmZpbmRQb2ludGVyQnlJZCggaWQgKSBhcyBUb3VjaCB8IG51bGw7XHJcbiAgICAgIGlmICggdG91Y2ggKSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdG91Y2ggaW5zdGFuY2VvZiBUb3VjaCApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNpbXBsZS10eXBlLWNoZWNraW5nLWFzc2VydGlvbnMsIGJhZC1zaW0tdGV4dFxyXG4gICAgICAgIHRoaXMuY2FuY2VsRXZlbnQ8VG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudD4oIHRvdWNoLCBjb250ZXh0LCBwb2ludCApO1xyXG4gICAgICAgIHRoaXMucmVtb3ZlUG9pbnRlciggdG91Y2ggKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0b3VjaENhbmNlbEFjdGlvbicgKSxcclxuICAgICAgcGFyYW1ldGVyczogW1xyXG4gICAgICAgIHsgbmFtZTogJ2lkJywgcGhldGlvVHlwZTogTnVtYmVySU8gfSxcclxuICAgICAgICB7IG5hbWU6ICdwb2ludCcsIHBoZXRpb1R5cGU6IFZlY3RvcjIuVmVjdG9yMklPIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnY29udGV4dCcsIHBoZXRpb1R5cGU6IEV2ZW50Q29udGV4dElPIH1cclxuICAgICAgXSxcclxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW4gYSB0b3VjaCBpcyBjYW5jZWxlZC4nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5wZW5TdGFydEFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggaWQ6IG51bWJlciwgcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxQb2ludGVyRXZlbnQ+ICkgPT4ge1xyXG4gICAgICBjb25zdCBwZW4gPSBuZXcgUGVuKCBpZCwgcG9pbnQsIGNvbnRleHQuZG9tRXZlbnQgKTtcclxuICAgICAgdGhpcy5hZGRQb2ludGVyKCBwZW4gKTtcclxuICAgICAgdGhpcy5kb3duRXZlbnQ8UG9pbnRlckV2ZW50PiggcGVuLCBjb250ZXh0LCBwb2ludCApO1xyXG4gICAgfSwge1xyXG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdwZW5TdGFydEFjdGlvbicgKSxcclxuICAgICAgcGFyYW1ldGVyczogW1xyXG4gICAgICAgIHsgbmFtZTogJ2lkJywgcGhldGlvVHlwZTogTnVtYmVySU8gfSxcclxuICAgICAgICB7IG5hbWU6ICdwb2ludCcsIHBoZXRpb1R5cGU6IFZlY3RvcjIuVmVjdG9yMklPIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnY29udGV4dCcsIHBoZXRpb1R5cGU6IEV2ZW50Q29udGV4dElPIH1cclxuICAgICAgXSxcclxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW4gYSBwZW4gdG91Y2hlcyB0aGUgc2NyZWVuLidcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnBlbkVuZEFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggaWQ6IG51bWJlciwgcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxQb2ludGVyRXZlbnQ+ICkgPT4ge1xyXG4gICAgICBjb25zdCBwZW4gPSB0aGlzLmZpbmRQb2ludGVyQnlJZCggaWQgKSBhcyBQZW4gfCBudWxsO1xyXG4gICAgICBpZiAoIHBlbiApIHtcclxuICAgICAgICB0aGlzLnVwRXZlbnQ8UG9pbnRlckV2ZW50PiggcGVuLCBjb250ZXh0LCBwb2ludCApO1xyXG4gICAgICAgIHRoaXMucmVtb3ZlUG9pbnRlciggcGVuICk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAgcGhldGlvUGxheWJhY2s6IHRydWUsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncGVuRW5kQWN0aW9uJyApLFxyXG4gICAgICBwYXJhbWV0ZXJzOiBbXHJcbiAgICAgICAgeyBuYW1lOiAnaWQnLCBwaGV0aW9UeXBlOiBOdW1iZXJJTyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3BvaW50JywgcGhldGlvVHlwZTogVmVjdG9yMi5WZWN0b3IySU8gfSxcclxuICAgICAgICB7IG5hbWU6ICdjb250ZXh0JywgcGhldGlvVHlwZTogRXZlbnRDb250ZXh0SU8gfVxyXG4gICAgICBdLFxyXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgd2hlbiBhIHBlbiBpcyBsaWZ0ZWQuJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMucGVuTW92ZUFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggaWQ6IG51bWJlciwgcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxQb2ludGVyRXZlbnQ+ICkgPT4ge1xyXG4gICAgICBjb25zdCBwZW4gPSB0aGlzLmZpbmRQb2ludGVyQnlJZCggaWQgKSBhcyBQZW4gfCBudWxsO1xyXG4gICAgICBpZiAoIHBlbiApIHtcclxuICAgICAgICBwZW4ubW92ZSggcG9pbnQgKTtcclxuICAgICAgICB0aGlzLm1vdmVFdmVudDxQb2ludGVyRXZlbnQ+KCBwZW4sIGNvbnRleHQgKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdwZW5Nb3ZlQWN0aW9uJyApLFxyXG4gICAgICBwYXJhbWV0ZXJzOiBbXHJcbiAgICAgICAgeyBuYW1lOiAnaWQnLCBwaGV0aW9UeXBlOiBOdW1iZXJJTyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3BvaW50JywgcGhldGlvVHlwZTogVmVjdG9yMi5WZWN0b3IySU8gfSxcclxuICAgICAgICB7IG5hbWU6ICdjb250ZXh0JywgcGhldGlvVHlwZTogRXZlbnRDb250ZXh0SU8gfVxyXG4gICAgICBdLFxyXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgd2hlbiBhIHBlbiBpcyBtb3ZlZC4nLFxyXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5wZW5DYW5jZWxBY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCAoIGlkOiBudW1iZXIsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8UG9pbnRlckV2ZW50PiApID0+IHtcclxuICAgICAgY29uc3QgcGVuID0gdGhpcy5maW5kUG9pbnRlckJ5SWQoIGlkICkgYXMgUGVuIHwgbnVsbDtcclxuICAgICAgaWYgKCBwZW4gKSB7XHJcbiAgICAgICAgdGhpcy5jYW5jZWxFdmVudDxQb2ludGVyRXZlbnQ+KCBwZW4sIGNvbnRleHQsIHBvaW50ICk7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVQb2ludGVyKCBwZW4gKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdwZW5DYW5jZWxBY3Rpb24nICksXHJcbiAgICAgIHBhcmFtZXRlcnM6IFtcclxuICAgICAgICB7IG5hbWU6ICdpZCcsIHBoZXRpb1R5cGU6IE51bWJlcklPIH0sXHJcbiAgICAgICAgeyBuYW1lOiAncG9pbnQnLCBwaGV0aW9UeXBlOiBWZWN0b3IyLlZlY3RvcjJJTyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ2NvbnRleHQnLCBwaGV0aW9UeXBlOiBFdmVudENvbnRleHRJTyB9XHJcbiAgICAgIF0sXHJcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVIsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFbWl0cyB3aGVuIGEgcGVuIGlzIGNhbmNlbGVkLidcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmdvdFBvaW50ZXJDYXB0dXJlQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggKCBpZDogbnVtYmVyLCBjb250ZXh0OiBFdmVudENvbnRleHQgKSA9PiB7XHJcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSB0aGlzLmZpbmRQb2ludGVyQnlJZCggaWQgKTtcclxuXHJcbiAgICAgIGlmICggcG9pbnRlciApIHtcclxuICAgICAgICBwb2ludGVyLm9uR290UG9pbnRlckNhcHR1cmUoKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdnb3RQb2ludGVyQ2FwdHVyZUFjdGlvbicgKSxcclxuICAgICAgcGFyYW1ldGVyczogW1xyXG4gICAgICAgIHsgbmFtZTogJ2lkJywgcGhldGlvVHlwZTogTnVtYmVySU8gfSxcclxuICAgICAgICB7IG5hbWU6ICdjb250ZXh0JywgcGhldGlvVHlwZTogRXZlbnRDb250ZXh0SU8gfVxyXG4gICAgICBdLFxyXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgd2hlbiBhIHBvaW50ZXIgaXMgY2FwdHVyZWQgKG5vcm1hbGx5IGF0IHRoZSBzdGFydCBvZiBhbiBpbnRlcmFjdGlvbiknLFxyXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5sb3N0UG9pbnRlckNhcHR1cmVBY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCAoIGlkOiBudW1iZXIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dCApID0+IHtcclxuICAgICAgY29uc3QgcG9pbnRlciA9IHRoaXMuZmluZFBvaW50ZXJCeUlkKCBpZCApO1xyXG5cclxuICAgICAgaWYgKCBwb2ludGVyICkge1xyXG4gICAgICAgIHBvaW50ZXIub25Mb3N0UG9pbnRlckNhcHR1cmUoKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdsb3N0UG9pbnRlckNhcHR1cmVBY3Rpb24nICksXHJcbiAgICAgIHBhcmFtZXRlcnM6IFtcclxuICAgICAgICB7IG5hbWU6ICdpZCcsIHBoZXRpb1R5cGU6IE51bWJlcklPIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnY29udGV4dCcsIHBoZXRpb1R5cGU6IEV2ZW50Q29udGV4dElPIH1cclxuICAgICAgXSxcclxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW4gYSBwb2ludGVyIGxvc2VzIGl0cyBjYXB0dXJlIChub3JtYWxseSBhdCB0aGUgZW5kIG9mIGFuIGludGVyYWN0aW9uKScsXHJcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmZvY3VzaW5BY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCAoIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxGb2N1c0V2ZW50PiApID0+IHtcclxuICAgICAgY29uc3QgdHJhaWwgPSB0aGlzLmdldFBET01FdmVudFRyYWlsKCBjb250ZXh0LmRvbUV2ZW50LCAnZm9jdXNpbicgKTtcclxuICAgICAgaWYgKCAhdHJhaWwgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYGZvY3VzaW4oJHtJbnB1dC5kZWJ1Z1RleHQoIG51bGwsIGNvbnRleHQuZG9tRXZlbnQgKX0pO2AgKTtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaFBET01FdmVudDxGb2N1c0V2ZW50PiggdHJhaWwsICdmb2N1cycsIGNvbnRleHQsIGZhbHNlICk7XHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hQRE9NRXZlbnQ8Rm9jdXNFdmVudD4oIHRyYWlsLCAnZm9jdXNpbicsIGNvbnRleHQsIHRydWUgKTtcclxuXHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgfSwge1xyXG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdmb2N1c2luQWN0aW9uJyApLFxyXG4gICAgICBwYXJhbWV0ZXJzOiBbXHJcbiAgICAgICAgeyBuYW1lOiAnY29udGV4dCcsIHBoZXRpb1R5cGU6IEV2ZW50Q29udGV4dElPIH1cclxuICAgICAgXSxcclxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW4gdGhlIFBET00gcm9vdCBnZXRzIHRoZSBmb2N1c2luIERPTSBldmVudC4nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5mb2N1c291dEFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggY29udGV4dDogRXZlbnRDb250ZXh0PEZvY3VzRXZlbnQ+ICkgPT4ge1xyXG4gICAgICBjb25zdCB0cmFpbCA9IHRoaXMuZ2V0UERPTUV2ZW50VHJhaWwoIGNvbnRleHQuZG9tRXZlbnQsICdmb2N1c291dCcgKTtcclxuICAgICAgaWYgKCAhdHJhaWwgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYGZvY3VzT3V0KCR7SW5wdXQuZGVidWdUZXh0KCBudWxsLCBjb250ZXh0LmRvbUV2ZW50ICl9KTtgICk7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hQRE9NRXZlbnQ8Rm9jdXNFdmVudD4oIHRyYWlsLCAnYmx1cicsIGNvbnRleHQsIGZhbHNlICk7XHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hQRE9NRXZlbnQ8Rm9jdXNFdmVudD4oIHRyYWlsLCAnZm9jdXNvdXQnLCBjb250ZXh0LCB0cnVlICk7XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgIH0sIHtcclxuICAgICAgcGhldGlvUGxheWJhY2s6IHRydWUsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZm9jdXNvdXRBY3Rpb24nICksXHJcbiAgICAgIHBhcmFtZXRlcnM6IFtcclxuICAgICAgICB7IG5hbWU6ICdjb250ZXh0JywgcGhldGlvVHlwZTogRXZlbnRDb250ZXh0SU8gfVxyXG4gICAgICBdLFxyXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgd2hlbiB0aGUgUERPTSByb290IGdldHMgdGhlIGZvY3Vzb3V0IERPTSBldmVudC4nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0VsZW1lbnQvY2xpY2tfZXZlbnQgbm90ZXMgdGhhdCB0aGUgY2xpY2sgYWN0aW9uIHNob3VsZCByZXN1bHRcclxuICAgIC8vIGluIGEgTW91c2VFdmVudFxyXG4gICAgdGhpcy5jbGlja0FjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggY29udGV4dDogRXZlbnRDb250ZXh0PE1vdXNlRXZlbnQ+ICkgPT4ge1xyXG4gICAgICBjb25zdCB0cmFpbCA9IHRoaXMuZ2V0UERPTUV2ZW50VHJhaWwoIGNvbnRleHQuZG9tRXZlbnQsICdjbGljaycgKTtcclxuICAgICAgaWYgKCAhdHJhaWwgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYGNsaWNrKCR7SW5wdXQuZGVidWdUZXh0KCBudWxsLCBjb250ZXh0LmRvbUV2ZW50ICl9KTtgICk7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hQRE9NRXZlbnQ8TW91c2VFdmVudD4oIHRyYWlsLCAnY2xpY2snLCBjb250ZXh0LCB0cnVlICk7XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgIH0sIHtcclxuICAgICAgcGhldGlvUGxheWJhY2s6IHRydWUsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnY2xpY2tBY3Rpb24nICksXHJcbiAgICAgIHBhcmFtZXRlcnM6IFtcclxuICAgICAgICB7IG5hbWU6ICdjb250ZXh0JywgcGhldGlvVHlwZTogRXZlbnRDb250ZXh0SU8gfVxyXG4gICAgICBdLFxyXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgd2hlbiB0aGUgUERPTSByb290IGdldHMgdGhlIGNsaWNrIERPTSBldmVudC4nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5pbnB1dEFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggY29udGV4dDogRXZlbnRDb250ZXh0PEV2ZW50IHwgSW5wdXRFdmVudD4gKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRyYWlsID0gdGhpcy5nZXRQRE9NRXZlbnRUcmFpbCggY29udGV4dC5kb21FdmVudCwgJ2lucHV0JyApO1xyXG4gICAgICBpZiAoICF0cmFpbCApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBgaW5wdXQoJHtJbnB1dC5kZWJ1Z1RleHQoIG51bGwsIGNvbnRleHQuZG9tRXZlbnQgKX0pO2AgKTtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaFBET01FdmVudDxFdmVudCB8IElucHV0RXZlbnQ+KCB0cmFpbCwgJ2lucHV0JywgY29udGV4dCwgdHJ1ZSApO1xyXG5cclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgICB9LCB7XHJcbiAgICAgIHBoZXRpb1BsYXliYWNrOiB0cnVlLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2lucHV0QWN0aW9uJyApLFxyXG4gICAgICBwYXJhbWV0ZXJzOiBbXHJcbiAgICAgICAgeyBuYW1lOiAnY29udGV4dCcsIHBoZXRpb1R5cGU6IEV2ZW50Q29udGV4dElPIH1cclxuICAgICAgXSxcclxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW4gdGhlIFBET00gcm9vdCBnZXRzIHRoZSBpbnB1dCBET00gZXZlbnQuJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuY2hhbmdlQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggKCBjb250ZXh0OiBFdmVudENvbnRleHQgKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRyYWlsID0gdGhpcy5nZXRQRE9NRXZlbnRUcmFpbCggY29udGV4dC5kb21FdmVudCwgJ2NoYW5nZScgKTtcclxuICAgICAgaWYgKCAhdHJhaWwgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYGNoYW5nZSgke0lucHV0LmRlYnVnVGV4dCggbnVsbCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoUERPTUV2ZW50PEV2ZW50PiggdHJhaWwsICdjaGFuZ2UnLCBjb250ZXh0LCB0cnVlICk7XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgIH0sIHtcclxuICAgICAgcGhldGlvUGxheWJhY2s6IHRydWUsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnY2hhbmdlQWN0aW9uJyApLFxyXG4gICAgICBwYXJhbWV0ZXJzOiBbXHJcbiAgICAgICAgeyBuYW1lOiAnY29udGV4dCcsIHBoZXRpb1R5cGU6IEV2ZW50Q29udGV4dElPIH1cclxuICAgICAgXSxcclxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW4gdGhlIFBET00gcm9vdCBnZXRzIHRoZSBjaGFuZ2UgRE9NIGV2ZW50LidcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmtleWRvd25BY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCAoIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxLZXlib2FyZEV2ZW50PiApID0+IHtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoIGBrZXlkb3duKCR7SW5wdXQuZGVidWdUZXh0KCBudWxsLCBjb250ZXh0LmRvbUV2ZW50ICl9KTtgICk7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hHbG9iYWxFdmVudDxLZXlib2FyZEV2ZW50PiggJ2dsb2JhbGtleWRvd24nLCBjb250ZXh0LCB0cnVlICk7XHJcblxyXG4gICAgICBjb25zdCB0cmFpbCA9IHRoaXMuZ2V0UERPTUV2ZW50VHJhaWwoIGNvbnRleHQuZG9tRXZlbnQsICdrZXlkb3duJyApO1xyXG4gICAgICB0cmFpbCAmJiB0aGlzLmRpc3BhdGNoUERPTUV2ZW50PEtleWJvYXJkRXZlbnQ+KCB0cmFpbCwgJ2tleWRvd24nLCBjb250ZXh0LCB0cnVlICk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoR2xvYmFsRXZlbnQ8S2V5Ym9hcmRFdmVudD4oICdnbG9iYWxrZXlkb3duJywgY29udGV4dCwgZmFsc2UgKTtcclxuXHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgfSwge1xyXG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdrZXlkb3duQWN0aW9uJyApLFxyXG4gICAgICBwYXJhbWV0ZXJzOiBbXHJcbiAgICAgICAgeyBuYW1lOiAnY29udGV4dCcsIHBoZXRpb1R5cGU6IEV2ZW50Q29udGV4dElPIH1cclxuICAgICAgXSxcclxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW4gdGhlIFBET00gcm9vdCBnZXRzIHRoZSBrZXlkb3duIERPTSBldmVudC4nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5rZXl1cEFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggY29udGV4dDogRXZlbnRDb250ZXh0PEtleWJvYXJkRXZlbnQ+ICkgPT4ge1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYGtleXVwKCR7SW5wdXQuZGVidWdUZXh0KCBudWxsLCBjb250ZXh0LmRvbUV2ZW50ICl9KTtgICk7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hHbG9iYWxFdmVudDxLZXlib2FyZEV2ZW50PiggJ2dsb2JhbGtleXVwJywgY29udGV4dCwgdHJ1ZSApO1xyXG5cclxuICAgICAgY29uc3QgdHJhaWwgPSB0aGlzLmdldFBET01FdmVudFRyYWlsKCBjb250ZXh0LmRvbUV2ZW50LCAna2V5ZG93bicgKTtcclxuICAgICAgdHJhaWwgJiYgdGhpcy5kaXNwYXRjaFBET01FdmVudDxLZXlib2FyZEV2ZW50PiggdHJhaWwsICdrZXl1cCcsIGNvbnRleHQsIHRydWUgKTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hHbG9iYWxFdmVudDxLZXlib2FyZEV2ZW50PiggJ2dsb2JhbGtleXVwJywgY29udGV4dCwgZmFsc2UgKTtcclxuXHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgfSwge1xyXG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdrZXl1cEFjdGlvbicgKSxcclxuICAgICAgcGFyYW1ldGVyczogW1xyXG4gICAgICAgIHsgbmFtZTogJ2NvbnRleHQnLCBwaGV0aW9UeXBlOiBFdmVudENvbnRleHRJTyB9XHJcbiAgICAgIF0sXHJcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVIsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFbWl0cyB3aGVuIHRoZSBQRE9NIHJvb3QgZ2V0cyB0aGUga2V5dXAgRE9NIGV2ZW50LidcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVycnVwdHMgYW55IGlucHV0IGFjdGlvbnMgdGhhdCBhcmUgY3VycmVudGx5IHRha2luZyBwbGFjZSAoc2hvdWxkIHN0b3AgZHJhZ3MsIGV0Yy4pXHJcbiAgICovXHJcbiAgcHVibGljIGludGVycnVwdFBvaW50ZXJzKCk6IHZvaWQge1xyXG4gICAgXy5lYWNoKCB0aGlzLnBvaW50ZXJzLCBwb2ludGVyID0+IHtcclxuICAgICAgcG9pbnRlci5pbnRlcnJ1cHRBbGwoKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB0byBiYXRjaCBhIHJhdyBET00gZXZlbnQgKHdoaWNoIG1heSBiZSBpbW1lZGlhdGVseSBmaXJlZCwgZGVwZW5kaW5nIG9uIHRoZSBzZXR0aW5ncykuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIGNvbnRleHRcclxuICAgKiBAcGFyYW0gYmF0Y2hUeXBlIC0gU2VlIEJhdGNoZWRET01FdmVudCdzIFwiZW51bWVyYXRpb25cIlxyXG4gICAqIEBwYXJhbSBjYWxsYmFjayAtIFBhcmFtZXRlciB0eXBlcyBkZWZpbmVkIGJ5IHRoZSBiYXRjaFR5cGUuIFNlZSBCYXRjaGVkRE9NRXZlbnQgZm9yIGRldGFpbHNcclxuICAgKiBAcGFyYW0gdHJpZ2dlckltbWVkaWF0ZSAtIENlcnRhaW4gZXZlbnRzIGNhbiBmb3JjZSBpbW1lZGlhdGUgYWN0aW9uLCBzaW5jZSBicm93c2VycyBsaWtlIENocm9tZVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ubHkgYWxsb3cgY2VydGFpbiBvcGVyYXRpb25zIGluIHRoZSBjYWxsYmFjayBmb3IgYSB1c2VyIGdlc3R1cmUgKGUuZy4gbGlrZVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgbW91c2V1cCB0byBvcGVuIGEgd2luZG93KS5cclxuICAgKi9cclxuICBwdWJsaWMgYmF0Y2hFdmVudCggY29udGV4dDogRXZlbnRDb250ZXh0LCBiYXRjaFR5cGU6IEJhdGNoZWRET01FdmVudFR5cGUsIGNhbGxiYWNrOiBCYXRjaGVkRE9NRXZlbnRDYWxsYmFjaywgdHJpZ2dlckltbWVkaWF0ZTogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dEV2ZW50ICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCggJ0lucHV0LmJhdGNoRXZlbnQnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBJZiBvdXIgZGlzcGxheSBpcyBub3QgaW50ZXJhY3RpdmUsIGRvIG5vdCByZXNwb25kIHRvIGFueSBldmVudHMgKGJ1dCBzdGlsbCBwcmV2ZW50IGRlZmF1bHQpXHJcbiAgICBpZiAoIHRoaXMuZGlzcGxheS5pbnRlcmFjdGl2ZSApIHtcclxuICAgICAgdGhpcy5iYXRjaGVkRXZlbnRzLnB1c2goIEJhdGNoZWRET01FdmVudC5wb29sLmNyZWF0ZSggY29udGV4dCwgYmF0Y2hUeXBlLCBjYWxsYmFjayApICk7XHJcbiAgICAgIGlmICggdHJpZ2dlckltbWVkaWF0ZSB8fCAhdGhpcy5iYXRjaERPTUV2ZW50cyApIHtcclxuICAgICAgICB0aGlzLmZpcmVCYXRjaGVkRXZlbnRzKCk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gTk9URTogSWYgd2UgZXZlciB3YW50IHRvIERpc3BsYXkudXBkYXRlRGlzcGxheSgpIG9uIGV2ZW50cywgZG8gc28gaGVyZVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEFsd2F5cyBwcmV2ZW50RGVmYXVsdCBvbiB0b3VjaCBldmVudHMsIHNpbmNlIHdlIGRvbid0IHdhbnQgbW91c2UgZXZlbnRzIHRyaWdnZXJlZCBhZnRlcndhcmRzLiBTZWVcclxuICAgIC8vIGh0dHA6Ly93d3cuaHRtbDVyb2Nrcy5jb20vZW4vbW9iaWxlL3RvdWNoYW5kbW91c2UvIGZvciBtb3JlIGluZm9ybWF0aW9uLlxyXG4gICAgLy8gQWRkaXRpb25hbGx5LCBJRSBoYWQgc29tZSBpc3N1ZXMgd2l0aCBza2lwcGluZyBwcmV2ZW50IGRlZmF1bHQsIHNlZVxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzQ2NCBmb3IgbW91c2UgaGFuZGxpbmcuXHJcbiAgICAvLyBXRSBXSUxMIE5PVCBwcmV2ZW50RGVmYXVsdCgpIG9uIGtleWJvYXJkIG9yIGFsdGVybmF0aXZlIGlucHV0IGV2ZW50cyBoZXJlXHJcbiAgICBpZiAoICEoIHRoaXMucGFzc2l2ZUV2ZW50cyA9PT0gdHJ1ZSApICYmXHJcbiAgICAgICAgICggY2FsbGJhY2sgIT09IHRoaXMubW91c2VEb3duIHx8IHBsYXRmb3JtLmVkZ2UgKSAmJlxyXG4gICAgICAgICBiYXRjaFR5cGUgIT09IEJhdGNoZWRET01FdmVudFR5cGUuQUxUX1RZUEUgKSB7XHJcbiAgICAgIC8vIFdlIGNhbm5vdCBwcmV2ZW50IGEgcGFzc2l2ZSBldmVudCwgc28gZG9uJ3QgdHJ5XHJcbiAgICAgIGNvbnRleHQuZG9tRXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmlyZXMgYWxsIG9mIG91ciBldmVudHMgdGhhdCB3ZXJlIGJhdGNoZWQgaW50byB0aGUgYmF0Y2hlZEV2ZW50cyBhcnJheS4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGZpcmVCYXRjaGVkRXZlbnRzKCk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0RXZlbnQgJiYgdGhpcy5jdXJyZW50bHlGaXJpbmdFdmVudHMgJiYgc2NlbmVyeUxvZy5JbnB1dEV2ZW50KFxyXG4gICAgICAnUkVFTlRSQU5DRSBERVRFQ1RFRCcgKTtcclxuICAgIC8vIERvbid0IHJlLWVudHJhbnRseSBlbnRlciBvdXIgbG9vcCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9iYWxsb29ucy1hbmQtc3RhdGljLWVsZWN0cmljaXR5L2lzc3Vlcy80MDZcclxuICAgIGlmICggIXRoaXMuY3VycmVudGx5RmlyaW5nRXZlbnRzICYmIHRoaXMuYmF0Y2hlZEV2ZW50cy5sZW5ndGggKSB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dEV2ZW50ICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCggYElucHV0LmZpcmVCYXRjaGVkRXZlbnRzIGxlbmd0aDoke3RoaXMuYmF0Y2hlZEV2ZW50cy5sZW5ndGh9YCApO1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAgIHRoaXMuY3VycmVudGx5RmlyaW5nRXZlbnRzID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIG5lZWRzIHRvIGJlIGRvbmUgaW4gb3JkZXJcclxuICAgICAgY29uc3QgYmF0Y2hlZEV2ZW50cyA9IHRoaXMuYmF0Y2hlZEV2ZW50cztcclxuICAgICAgLy8gSU1QT1JUQU5UOiBXZSBuZWVkIHRvIGNoZWNrIHRoZSBsZW5ndGggb2YgdGhlIGFycmF5IGF0IGV2ZXJ5IGl0ZXJhdGlvbiwgYXMgaXQgY2FuIGNoYW5nZSBkdWUgdG8gcmUtZW50cmFudFxyXG4gICAgICAvLyBldmVudCBoYW5kbGluZywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9iYWxsb29ucy1hbmQtc3RhdGljLWVsZWN0cmljaXR5L2lzc3Vlcy80MDYuXHJcbiAgICAgIC8vIEV2ZW50cyBtYXkgYmUgYXBwZW5kZWQgdG8gdGhpcyAoc3luY2hyb25vdXNseSkgYXMgcGFydCBvZiBmaXJpbmcgaW5pdGlhbCBldmVudHMsIHNvIHdlIHdhbnQgdG8gRlVMTFkgcnVuIGFsbFxyXG4gICAgICAvLyBldmVudHMgYmVmb3JlIGNsZWFyaW5nIG91ciBhcnJheS5cclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYmF0Y2hlZEV2ZW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBiYXRjaGVkRXZlbnQgPSBiYXRjaGVkRXZlbnRzWyBpIF07XHJcbiAgICAgICAgYmF0Y2hlZEV2ZW50LnJ1biggdGhpcyApO1xyXG4gICAgICAgIGJhdGNoZWRFdmVudC5kaXNwb3NlKCk7XHJcbiAgICAgIH1cclxuICAgICAgY2xlYW5BcnJheSggYmF0Y2hlZEV2ZW50cyApO1xyXG5cclxuICAgICAgdGhpcy5jdXJyZW50bHlGaXJpbmdFdmVudHMgPSBmYWxzZTtcclxuXHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dEV2ZW50ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDbGVhcnMgYW55IGJhdGNoZWQgZXZlbnRzIHRoYXQgd2UgZG9uJ3Qgd2FudCB0byBwcm9jZXNzLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKlxyXG4gICAqIE5PVEU6IEl0IGlzIEhJR0hMWSByZWNvbW1lbmRlZCB0byBpbnRlcnJ1cHQgcG9pbnRlcnMgYW5kIHJlbW92ZSBub24tTW91c2UgcG9pbnRlcnMgYmVmb3JlIGRvaW5nIHRoaXMsIGFzXHJcbiAgICogb3RoZXJ3aXNlIGl0IGNhbiBjYXVzZSBpbmNvcnJlY3Qgc3RhdGUgaW4gY2VydGFpbiB0eXBlcyBvZiBsaXN0ZW5lcnMgKGUuZy4gb25lcyB0aGF0IGNvdW50IGhvdyBtYW55IHBvaW50ZXJzXHJcbiAgICogYXJlIG92ZXIgdGhlbSkuXHJcbiAgICovXHJcbiAgcHVibGljIGNsZWFyQmF0Y2hlZEV2ZW50cygpOiB2b2lkIHtcclxuICAgIHRoaXMuYmF0Y2hlZEV2ZW50cy5sZW5ndGggPSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIGFsbCBwb2ludGVycyB0byBzZWUgd2hldGhlciB0aGV5IGFyZSBzdGlsbCBcIm92ZXJcIiB0aGUgc2FtZSBub2RlcyAodHJhaWwpLiBJZiBub3QsIGl0IHdpbGwgZmlyZSB0aGUgdXN1YWxcclxuICAgKiBlbnRlci9leGl0IGV2ZW50cy4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIHZhbGlkYXRlUG9pbnRlcnMoKTogdm9pZCB7XHJcbiAgICB0aGlzLnZhbGlkYXRlUG9pbnRlcnNBY3Rpb24uZXhlY3V0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhbGwgbm9uLU1vdXNlIHBvaW50ZXJzIGZyb20gaW50ZXJuYWwgdHJhY2tpbmcuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVUZW1wb3JhcnlQb2ludGVycygpOiB2b2lkIHtcclxuICAgIGZvciAoIGxldCBpID0gdGhpcy5wb2ludGVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcclxuICAgICAgY29uc3QgcG9pbnRlciA9IHRoaXMucG9pbnRlcnNbIGkgXTtcclxuICAgICAgaWYgKCAhKCBwb2ludGVyIGluc3RhbmNlb2YgTW91c2UgKSApIHtcclxuICAgICAgICB0aGlzLnBvaW50ZXJzLnNwbGljZSggaSwgMSApO1xyXG5cclxuICAgICAgICAvLyBTZW5kIGV4aXQgZXZlbnRzLiBBcyB3ZSBjYW4ndCBnZXQgYSBET00gZXZlbnQsIHdlJ2xsIHNlbmQgYSBmYWtlIG9iamVjdCBpbnN0ZWFkLlxyXG4gICAgICAgIGNvbnN0IGV4aXRUcmFpbCA9IHBvaW50ZXIudHJhaWwgfHwgbmV3IFRyYWlsKCB0aGlzLnJvb3ROb2RlICk7XHJcbiAgICAgICAgdGhpcy5leGl0RXZlbnRzKCBwb2ludGVyLCBFdmVudENvbnRleHQuY3JlYXRlU3ludGhldGljKCksIGV4aXRUcmFpbCwgMCwgdHJ1ZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIb29rcyB1cCBET00gbGlzdGVuZXJzIHRvIHdoYXRldmVyIHR5cGUgb2Ygb2JqZWN0IHdlIGFyZSBnb2luZyB0byBsaXN0ZW4gdG8uIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25uZWN0TGlzdGVuZXJzKCk6IHZvaWQge1xyXG4gICAgQnJvd3NlckV2ZW50cy5hZGREaXNwbGF5KCB0aGlzLmRpc3BsYXksIHRoaXMuYXR0YWNoVG9XaW5kb3csIHRoaXMucGFzc2l2ZUV2ZW50cyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBET00gbGlzdGVuZXJzIGZyb20gd2hhdGV2ZXIgdHlwZSBvZiBvYmplY3Qgd2Ugd2VyZSBsaXN0ZW5pbmcgdG8uIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBkaXNjb25uZWN0TGlzdGVuZXJzKCk6IHZvaWQge1xyXG4gICAgQnJvd3NlckV2ZW50cy5yZW1vdmVEaXNwbGF5KCB0aGlzLmRpc3BsYXksIHRoaXMuYXR0YWNoVG9XaW5kb3csIHRoaXMucGFzc2l2ZUV2ZW50cyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXh0cmFjdCBhIHtWZWN0b3IyfSBnbG9iYWwgY29vcmRpbmF0ZSBwb2ludCBmcm9tIGFuIGFyYml0cmFyeSBET00gZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBwb2ludEZyb21FdmVudCggZG9tRXZlbnQ6IE1vdXNlRXZlbnQgfCBXaW5kb3dUb3VjaCApOiBWZWN0b3IyIHtcclxuICAgIGNvbnN0IHBvc2l0aW9uID0gVmVjdG9yMi5wb29sLmNyZWF0ZSggZG9tRXZlbnQuY2xpZW50WCwgZG9tRXZlbnQuY2xpZW50WSApO1xyXG4gICAgaWYgKCAhdGhpcy5hc3N1bWVGdWxsV2luZG93ICkge1xyXG4gICAgICBjb25zdCBkb21Cb3VuZHMgPSB0aGlzLmRpc3BsYXkuZG9tRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAgIC8vIFRPRE86IGNvbnNpZGVyIHRvdGFsbHkgaWdub3JpbmcgYW55IHdpdGggemVybyB3aWR0aC9oZWlnaHQsIGFzIHdlIGFyZW4ndCBhdHRhY2hlZCB0byB0aGUgZGlzcGxheT9cclxuICAgICAgLy8gRm9yIG5vdywgZG9uJ3Qgb2Zmc2V0LlxyXG4gICAgICBpZiAoIGRvbUJvdW5kcy53aWR0aCA+IDAgJiYgZG9tQm91bmRzLmhlaWdodCA+IDAgKSB7XHJcbiAgICAgICAgcG9zaXRpb24uc3VidHJhY3RYWSggZG9tQm91bmRzLmxlZnQsIGRvbUJvdW5kcy50b3AgKTtcclxuXHJcbiAgICAgICAgLy8gRGV0ZWN0IGEgc2NhbGluZyBvZiB0aGUgZGlzcGxheSBoZXJlICh0aGUgY2xpZW50IGJvdW5kaW5nIHJlY3QgaGF2aW5nIGRpZmZlcmVudCBkaW1lbnNpb25zIGZyb20gb3VyXHJcbiAgICAgICAgLy8gZGlzcGxheSksIGFuZCBhdHRlbXB0IHRvIGNvbXBlbnNhdGUuXHJcbiAgICAgICAgLy8gTk9URTogV2UgY2FuJ3QgaGFuZGxlIHJvdGF0aW9uIGhlcmUuXHJcbiAgICAgICAgaWYgKCBkb21Cb3VuZHMud2lkdGggIT09IHRoaXMuZGlzcGxheS53aWR0aCB8fCBkb21Cb3VuZHMuaGVpZ2h0ICE9PSB0aGlzLmRpc3BsYXkuaGVpZ2h0ICkge1xyXG4gICAgICAgICAgLy8gVE9ETzogSGF2ZSBjb2RlIHZlcmlmeSB0aGUgY29ycmVjdG5lc3MgaGVyZSwgYW5kIHRoYXQgaXQncyBub3QgdHJpZ2dlcmluZyBhbGwgdGhlIHRpbWVcclxuICAgICAgICAgIHBvc2l0aW9uLnggKj0gdGhpcy5kaXNwbGF5LndpZHRoIC8gZG9tQm91bmRzLndpZHRoO1xyXG4gICAgICAgICAgcG9zaXRpb24ueSAqPSB0aGlzLmRpc3BsYXkuaGVpZ2h0IC8gZG9tQm91bmRzLmhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBwb3NpdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBwb2ludGVyIHRvIG91ciBsaXN0LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYWRkUG9pbnRlciggcG9pbnRlcjogUG9pbnRlciApOiB2b2lkIHtcclxuICAgIHRoaXMucG9pbnRlcnMucHVzaCggcG9pbnRlciApO1xyXG5cclxuICAgIHRoaXMucG9pbnRlckFkZGVkRW1pdHRlci5lbWl0KCBwb2ludGVyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGEgcG9pbnRlciBmcm9tIG91ciBsaXN0LiBJZiB3ZSBnZXQgZnV0dXJlIGV2ZW50cyBmb3IgaXQgKGJhc2VkIG9uIHRoZSBJRCkgaXQgd2lsbCBiZSBpZ25vcmVkLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgcmVtb3ZlUG9pbnRlciggcG9pbnRlcjogUG9pbnRlciApOiB2b2lkIHtcclxuICAgIC8vIHNhbml0eSBjaGVjayB2ZXJzaW9uLCB3aWxsIHJlbW92ZSBhbGwgaW5zdGFuY2VzXHJcbiAgICBmb3IgKCBsZXQgaSA9IHRoaXMucG9pbnRlcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgIGlmICggdGhpcy5wb2ludGVyc1sgaSBdID09PSBwb2ludGVyICkge1xyXG4gICAgICAgIHRoaXMucG9pbnRlcnMuc3BsaWNlKCBpLCAxICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwb2ludGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdpdmVuIGEgcG9pbnRlcidzIElEIChnaXZlbiBieSB0aGUgcG9pbnRlci90b3VjaCBzcGVjaWZpY2F0aW9ucyB0byBiZSB1bmlxdWUgdG8gYSBzcGVjaWZpYyBwb2ludGVyL3RvdWNoKSxcclxuICAgKiByZXR1cm5zIHRoZSBnaXZlbiBwb2ludGVyIChpZiB3ZSBoYXZlIG9uZSkuXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGVyZSBhcmUgc29tZSBjYXNlcyB3aGVyZSB3ZSBtYXkgaGF2ZSBwcmVtYXR1cmVseSBcInJlbW92ZWRcIiBhIHBvaW50ZXIuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBmaW5kUG9pbnRlckJ5SWQoIGlkOiBudW1iZXIgKTogTW91c2UgfCBUb3VjaCB8IFBlbiB8IG51bGwge1xyXG4gICAgbGV0IGkgPSB0aGlzLnBvaW50ZXJzLmxlbmd0aDtcclxuICAgIHdoaWxlICggaS0tICkge1xyXG4gICAgICBjb25zdCBwb2ludGVyID0gdGhpcy5wb2ludGVyc1sgaSBdIGFzIE1vdXNlIHwgVG91Y2ggfCBQZW47XHJcbiAgICAgIGlmICggcG9pbnRlci5pZCA9PT0gaWQgKSB7XHJcbiAgICAgICAgcmV0dXJuIHBvaW50ZXI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRQRE9NRXZlbnRUcmFpbCggZG9tRXZlbnQ6IFRhcmdldFN1YnN0aXR1ZGVBdWdtZW50ZWRFdmVudCwgZXZlbnROYW1lOiBzdHJpbmcgKTogVHJhaWwgfCBudWxsIHtcclxuICAgIGlmICggIXRoaXMuZGlzcGxheS5pbnRlcmFjdGl2ZSApIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdHJhaWwgPSB0aGlzLmdldFRyYWlsRnJvbVBET01FdmVudCggZG9tRXZlbnQgKTtcclxuXHJcbiAgICAvLyBPbmx5IGRpc3BhdGNoIHRoZSBldmVudCBpZiB0aGUgY2xpY2sgZGlkIG5vdCBoYXBwZW4gcmFwaWRseSBhZnRlciBhbiB1cCBldmVudC4gSXQgaXNcclxuICAgIC8vIGxpa2VseSB0aGF0IHRoZSBzY3JlZW4gcmVhZGVyIGRpc3BhdGNoZWQgYm90aCBwb2ludGVyIEFORCBjbGljayBldmVudHMgaW4gdGhpcyBjYXNlLCBhbmRcclxuICAgIC8vIHdlIG9ubHkgd2FudCB0byByZXNwb25kIHRvIG9uZSBvciB0aGUgb3RoZXIuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTA5NC5cclxuICAgIC8vIFRoaXMgaXMgb3V0c2lkZSBvZiB0aGUgY2xpY2tBY3Rpb24gZXhlY3V0aW9uIHNvIHRoYXQgYmxvY2tlZCBjbGlja3MgYXJlIG5vdCBwYXJ0IG9mIHRoZSBQaEVULWlPIGRhdGFcclxuICAgIC8vIHN0cmVhbS5cclxuICAgIGNvbnN0IG5vdEJsb2NraW5nU3Vic2VxdWVudENsaWNrc09jY3VycmluZ1Rvb1F1aWNrbHkgPSB0cmFpbCAmJiAhKCBldmVudE5hbWUgPT09ICdjbGljaycgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLnNvbWUoIHRyYWlsLm5vZGVzLCBub2RlID0+IG5vZGUucG9zaXRpb25JblBET00gKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbUV2ZW50LnRpbWVTdGFtcCAtIHRoaXMudXBUaW1lU3RhbXAgPD0gUERPTV9DTElDS19ERUxBWSApO1xyXG5cclxuICAgIHJldHVybiBub3RCbG9ja2luZ1N1YnNlcXVlbnRDbGlja3NPY2N1cnJpbmdUb29RdWlja2x5ID8gdHJhaWwgOiBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZXMgdGhlIE1vdXNlIG9iamVjdCBvbiB0aGUgZmlyc3QgbW91c2UgZXZlbnQgKHRoaXMgbWF5IG5ldmVyIGhhcHBlbiBvbiB0b3VjaCBkZXZpY2VzKS5cclxuICAgKi9cclxuICBwcml2YXRlIGluaXRNb3VzZSggcG9pbnQ6IFZlY3RvcjIgKTogTW91c2Uge1xyXG4gICAgY29uc3QgbW91c2UgPSBuZXcgTW91c2UoIHBvaW50ICk7XHJcbiAgICB0aGlzLm1vdXNlID0gbW91c2U7XHJcbiAgICB0aGlzLmFkZFBvaW50ZXIoIG1vdXNlICk7XHJcbiAgICByZXR1cm4gbW91c2U7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGVuc3VyZU1vdXNlKCBwb2ludDogVmVjdG9yMiApOiBNb3VzZSB7XHJcbiAgICBjb25zdCBtb3VzZSA9IHRoaXMubW91c2U7XHJcbiAgICBpZiAoIG1vdXNlICkge1xyXG4gICAgICByZXR1cm4gbW91c2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuaW5pdE1vdXNlKCBwb2ludCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGFjY2Vzc2libGUgcG9pbnRlciBvYmplY3Qgb24gdGhlIGZpcnN0IHBkb20gZXZlbnQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBpbml0UERPTVBvaW50ZXIoKTogUERPTVBvaW50ZXIge1xyXG4gICAgY29uc3QgcGRvbVBvaW50ZXIgPSBuZXcgUERPTVBvaW50ZXIoIHRoaXMuZGlzcGxheSApO1xyXG4gICAgdGhpcy5wZG9tUG9pbnRlciA9IHBkb21Qb2ludGVyO1xyXG5cclxuICAgIHRoaXMuYWRkUG9pbnRlciggcGRvbVBvaW50ZXIgKTtcclxuXHJcbiAgICByZXR1cm4gcGRvbVBvaW50ZXI7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGVuc3VyZVBET01Qb2ludGVyKCk6IFBET01Qb2ludGVyIHtcclxuICAgIGNvbnN0IHBkb21Qb2ludGVyID0gdGhpcy5wZG9tUG9pbnRlcjtcclxuICAgIGlmICggcGRvbVBvaW50ZXIgKSB7XHJcbiAgICAgIHJldHVybiBwZG9tUG9pbnRlcjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5pbml0UERPTVBvaW50ZXIoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXBzIHRvIGRpc3BhdGNoIGEgcGRvbS1yZWxhdGVkIGV2ZW50LiBCZWZvcmUgZGlzcGF0Y2gsIHRoZSBQRE9NUG9pbnRlciBpcyBpbml0aWFsaXplZCBpZiBpdFxyXG4gICAqIGhhc24ndCBiZWVuIGNyZWF0ZWQgeWV0IGFuZCBhIHVzZXJHZXN0dXJlRW1pdHRlciBlbWl0cyB0byBpbmRpY2F0ZSB0aGF0IGEgdXNlciBoYXMgYmVndW4gYW4gaW50ZXJhY3Rpb24uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBkaXNwYXRjaFBET01FdmVudDxET01FdmVudCBleHRlbmRzIEV2ZW50PiggdHJhaWw6IFRyYWlsLCBldmVudFR5cGU6IFN1cHBvcnRlZEV2ZW50VHlwZXMsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxET01FdmVudD4sIGJ1YmJsZXM6IGJvb2xlYW4gKTogdm9pZCB7XHJcblxyXG4gICAgdGhpcy5lbnN1cmVQRE9NUG9pbnRlcigpLnVwZGF0ZVRyYWlsKCB0cmFpbCApO1xyXG5cclxuICAgIC8vIGV4Y2x1ZGUgZm9jdXMgYW5kIGJsdXIgZXZlbnRzIGJlY2F1c2UgdGhleSBjYW4gaGFwcGVuIHdpdGggc2NyaXB0aW5nIHdpdGhvdXQgdXNlciBpbnB1dFxyXG4gICAgaWYgKCBQRE9NVXRpbHMuVVNFUl9HRVNUVVJFX0VWRU5UUy5pbmNsdWRlcyggZXZlbnRUeXBlICkgKSB7XHJcbiAgICAgIERpc3BsYXkudXNlckdlc3R1cmVFbWl0dGVyLmVtaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBkb21FdmVudCA9IGNvbnRleHQuZG9tRXZlbnQ7XHJcblxyXG4gICAgLy8gVGhpcyB3b3JrYXJvdW5kIGhvcGVmdWxseSB3b24ndCBiZSBoZXJlIGZvcmV2ZXIsIHNlZSBQYXJhbGxlbERPTS5zZXRFeGNsdWRlTGFiZWxTaWJsaW5nRnJvbUlucHV0KCkgYW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9hMTF5LXJlc2VhcmNoL2lzc3Vlcy8xNTZcclxuICAgIGlmICggISggZG9tRXZlbnQudGFyZ2V0ICYmICggZG9tRXZlbnQudGFyZ2V0IGFzIEVsZW1lbnQgKS5oYXNBdHRyaWJ1dGUoIFBET01VdGlscy5EQVRBX0VYQ0xVREVfRlJPTV9JTlBVVCApICkgKSB7XHJcblxyXG4gICAgICAvLyBJZiB0aGUgdHJhaWwgaXMgbm90IHBpY2thYmxlLCBkb24ndCBkaXNwYXRjaCBQRE9NIGV2ZW50cyB0byB0aG9zZSB0YXJnZXRzIC0gYnV0IHdlIHN0aWxsXHJcbiAgICAgIC8vIGRpc3BhdGNoIHdpdGggYW4gZW1wdHkgdHJhaWwgdG8gY2FsbCBsaXN0ZW5lcnMgb24gdGhlIERpc3BsYXkgYW5kIFBvaW50ZXIuXHJcbiAgICAgIGNvbnN0IGNhbkZpcmVMaXN0ZW5lcnMgPSB0cmFpbC5pc1BpY2thYmxlKCkgfHwgUERPTV9VTlBJQ0tBQkxFX0VWRU5UUy5pbmNsdWRlcyggZXZlbnRUeXBlICk7XHJcblxyXG4gICAgICBpZiAoICFjYW5GaXJlTGlzdGVuZXJzICkge1xyXG4gICAgICAgIHRyYWlsID0gbmV3IFRyYWlsKCBbXSApO1xyXG4gICAgICB9XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucGRvbVBvaW50ZXIgKTtcclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50PERPTUV2ZW50PiggdHJhaWwsIGV2ZW50VHlwZSwgdGhpcy5wZG9tUG9pbnRlciEsIGNvbnRleHQsIGJ1YmJsZXMgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZGlzcGF0Y2hHbG9iYWxFdmVudDxET01FdmVudCBleHRlbmRzIEV2ZW50PiggZXZlbnRUeXBlOiBTdXBwb3J0ZWRFdmVudFR5cGVzLCBjb250ZXh0OiBFdmVudENvbnRleHQ8RE9NRXZlbnQ+LCBjYXB0dXJlOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgdGhpcy5lbnN1cmVQRE9NUG9pbnRlcigpO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5wZG9tUG9pbnRlciApO1xyXG4gICAgY29uc3QgcG9pbnRlciA9IHRoaXMucGRvbVBvaW50ZXIhO1xyXG4gICAgY29uc3QgaW5wdXRFdmVudCA9IG5ldyBTY2VuZXJ5RXZlbnQ8RE9NRXZlbnQ+KCBuZXcgVHJhaWwoKSwgZXZlbnRUeXBlLCBwb2ludGVyLCBjb250ZXh0ICk7XHJcblxyXG4gICAgY29uc3QgcmVjdXJzaXZlR2xvYmFsRGlzcGF0Y2ggPSAoIG5vZGU6IE5vZGUgKSA9PiB7XHJcbiAgICAgIGlmICggIW5vZGUuaXNEaXNwb3NlZCAmJiBub2RlLmlzVmlzaWJsZSgpICYmIG5vZGUuaXNJbnB1dEVuYWJsZWQoKSApIHtcclxuICAgICAgICAvLyBSZXZlcnNlIGl0ZXJhdGlvbiBmb2xsb3dzIHRoZSB6LW9yZGVyIGZyb20gXCJ2aXN1YWxseSBpbiBmcm9udFwiIHRvIFwidmlzdWFsbHkgaW4gYmFja1wiIGxpa2Ugbm9ybWFsIGRpcGF0Y2hcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IG5vZGUuX2NoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xyXG4gICAgICAgICAgcmVjdXJzaXZlR2xvYmFsRGlzcGF0Y2goIG5vZGUuX2NoaWxkcmVuWyBpIF0gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICggIWlucHV0RXZlbnQuYWJvcnRlZCAmJiAhaW5wdXRFdmVudC5oYW5kbGVkICkge1xyXG4gICAgICAgICAgLy8gTm90aWZpY2F0aW9uIG9mIG91cnNlbGYgQUZURVIgb3VyIGNoaWxkcmVuIHJlc3VsdHMgaW4gdGhlIGRlcHRoLWZpcnN0IHNjYW4uXHJcbiAgICAgICAgICBpbnB1dEV2ZW50LmN1cnJlbnRUYXJnZXQgPSBub2RlO1xyXG4gICAgICAgICAgdGhpcy5kaXNwYXRjaFRvTGlzdGVuZXJzPERPTUV2ZW50PiggcG9pbnRlciwgbm9kZS5faW5wdXRMaXN0ZW5lcnMsIGV2ZW50VHlwZSwgaW5wdXRFdmVudCwgY2FwdHVyZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICByZWN1cnNpdmVHbG9iYWxEaXNwYXRjaCggdGhpcy5yb290Tm9kZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnJvbSBhIERPTSBFdmVudCwgZ2V0IGl0cyByZWxhdGVkVGFyZ2V0IGFuZCBtYXAgdGhhdCB0byB0aGUgc2NlbmVyeSBOb2RlLiBXaWxsIHJldHVybiBudWxsIGlmIHJlbGF0ZWRUYXJnZXRcclxuICAgKiBpcyBub3QgcHJvdmlkZWQsIG9yIGlmIHJlbGF0ZWRUYXJnZXQgaXMgbm90IHVuZGVyIFBET00sIG9yIHRoZXJlIGlzIG5vIGFzc29jaWF0ZWQgTm9kZSB3aXRoIHRyYWlsIGlkIG9uIHRoZVxyXG4gICAqIHJlbGF0ZWRUYXJnZXQgZWxlbWVudC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZG9tRXZlbnQgLSBET00gRXZlbnQsIG5vdCBhIFNjZW5lcnlFdmVudCFcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UmVsYXRlZFRhcmdldFRyYWlsKCBkb21FdmVudDogRm9jdXNFdmVudCB8IE1vdXNlRXZlbnQgKTogVHJhaWwgfCBudWxsIHtcclxuICAgIGNvbnN0IHJlbGF0ZWRUYXJnZXRFbGVtZW50ID0gZG9tRXZlbnQucmVsYXRlZFRhcmdldDtcclxuXHJcbiAgICBpZiAoIHJlbGF0ZWRUYXJnZXRFbGVtZW50ICYmIHRoaXMuaXNUYXJnZXRVbmRlclBET00oIHJlbGF0ZWRUYXJnZXRFbGVtZW50IGFzIEhUTUxFbGVtZW50ICkgKSB7XHJcblxyXG4gICAgICBjb25zdCByZWxhdGVkVGFyZ2V0ID0gKCBkb21FdmVudC5yZWxhdGVkVGFyZ2V0IGFzIHVua25vd24gYXMgRWxlbWVudCApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCByZWxhdGVkVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkVsZW1lbnQgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zaW1wbGUtdHlwZS1jaGVja2luZy1hc3NlcnRpb25zXHJcbiAgICAgIGNvbnN0IHRyYWlsSW5kaWNlcyA9IHJlbGF0ZWRUYXJnZXQuZ2V0QXR0cmlidXRlKCBQRE9NVXRpbHMuREFUQV9QRE9NX1VOSVFVRV9JRCApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0cmFpbEluZGljZXMsICdzaG91bGQgbm90IGJlIG51bGwnICk7XHJcblxyXG4gICAgICByZXR1cm4gUERPTUluc3RhbmNlLnVuaXF1ZUlkVG9UcmFpbCggdGhpcy5kaXNwbGF5LCB0cmFpbEluZGljZXMhICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgdHJhaWwgSUQgb2YgdGhlIG5vZGUgcmVwcmVzZW50ZWQgYnkgYSBET00gZWxlbWVudCB3aG8gaXMgdGhlIHRhcmdldCBvZiBhIERPTSBFdmVudCBpbiB0aGUgYWNjZXNzaWJsZSBQRE9NLlxyXG4gICAqIFRoaXMgaXMgYSBiaXQgb2YgYSBtaXNub21lciwgYmVjYXVzZSB0aGUgZG9tRXZlbnQgZG9lc24ndCBoYXZlIHRvIGJlIHVuZGVyIHRoZSBQRE9NLiBSZXR1cm5zIG51bGwgaWYgbm90IGluIHRoZSBQRE9NLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0VHJhaWxGcm9tUERPTUV2ZW50KCBkb21FdmVudDogVGFyZ2V0U3Vic3RpdHVkZUF1Z21lbnRlZEV2ZW50ICk6IFRyYWlsIHwgbnVsbCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkb21FdmVudC50YXJnZXQgfHwgZG9tRXZlbnRbIFRBUkdFVF9TVUJTVElUVVRFX0tFWSBdLCAnbmVlZCBhIHdheSB0byBnZXQgdGhlIHRhcmdldCcgKTtcclxuXHJcbiAgICBpZiAoICF0aGlzLmRpc3BsYXkuX2FjY2Vzc2libGUgKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNvdWxkIGJlIHNlcmlhbGl6ZWQgZXZlbnQgZm9yIHBoZXQtaW8gcGxheWJhY2tzLCBzZWUgSW5wdXQuc2VyaWFsaXplRE9NRXZlbnQoKVxyXG4gICAgaWYgKCBkb21FdmVudFsgVEFSR0VUX1NVQlNUSVRVVEVfS0VZIF0gKSB7XHJcbiAgICAgIGNvbnN0IHRyYWlsSW5kaWNlcyA9IGRvbUV2ZW50WyBUQVJHRVRfU1VCU1RJVFVURV9LRVkgXSEuZ2V0QXR0cmlidXRlKCBQRE9NVXRpbHMuREFUQV9QRE9NX1VOSVFVRV9JRCApO1xyXG4gICAgICByZXR1cm4gUERPTUluc3RhbmNlLnVuaXF1ZUlkVG9UcmFpbCggdGhpcy5kaXNwbGF5LCB0cmFpbEluZGljZXMhICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3QgdGFyZ2V0ID0gKCBkb21FdmVudC50YXJnZXQgYXMgdW5rbm93biBhcyBFbGVtZW50ICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5FbGVtZW50ICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2ltcGxlLXR5cGUtY2hlY2tpbmctYXNzZXJ0aW9uc1xyXG4gICAgICBpZiAoIHRhcmdldCAmJiB0aGlzLmlzVGFyZ2V0VW5kZXJQRE9NKCB0YXJnZXQgYXMgSFRNTEVsZW1lbnQgKSApIHtcclxuICAgICAgICBjb25zdCB0cmFpbEluZGljZXMgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCBQRE9NVXRpbHMuREFUQV9QRE9NX1VOSVFVRV9JRCApO1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRyYWlsSW5kaWNlcywgJ3Nob3VsZCBub3QgYmUgbnVsbCcgKTtcclxuICAgICAgICByZXR1cm4gUERPTUluc3RhbmNlLnVuaXF1ZUlkVG9UcmFpbCggdGhpcy5kaXNwbGF5LCB0cmFpbEluZGljZXMhICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZ2dlcnMgYSBsb2dpY2FsIG1vdXNlZG93biBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIG1heSBhbHNvIGJlIGNhbGxlZCBmcm9tIHRoZSBwb2ludGVyIGV2ZW50IGhhbmRsZXIgKHBvaW50ZXJEb3duKSBvciBmcm9tIHRoaW5ncyBsaWtlIGZ1enppbmcgb3JcclxuICAgKiBwbGF5YmFjay4gVGhlIGV2ZW50IG1heSBiZSBcImZha2VkXCIgZm9yIGNlcnRhaW4gcHVycG9zZXMuXHJcbiAgICovXHJcbiAgcHVibGljIG1vdXNlRG93biggaWQ6IG51bWJlciwgcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxNb3VzZUV2ZW50IHwgUG9pbnRlckV2ZW50PiApOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBgbW91c2VEb3duKCcke2lkfScsICR7SW5wdXQuZGVidWdUZXh0KCBwb2ludCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG4gICAgdGhpcy5tb3VzZURvd25BY3Rpb24uZXhlY3V0ZSggaWQsIHBvaW50LCBjb250ZXh0ICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyaWdnZXJzIGEgbG9naWNhbCBtb3VzZXVwIGV2ZW50LiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgbWF5IGFsc28gYmUgY2FsbGVkIGZyb20gdGhlIHBvaW50ZXIgZXZlbnQgaGFuZGxlciAocG9pbnRlclVwKSBvciBmcm9tIHRoaW5ncyBsaWtlIGZ1enppbmcgb3JcclxuICAgKiBwbGF5YmFjay4gVGhlIGV2ZW50IG1heSBiZSBcImZha2VkXCIgZm9yIGNlcnRhaW4gcHVycG9zZXMuXHJcbiAgICovXHJcbiAgcHVibGljIG1vdXNlVXAoIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8TW91c2VFdmVudCB8IFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYG1vdXNlVXAoJHtJbnB1dC5kZWJ1Z1RleHQoIHBvaW50LCBjb250ZXh0LmRvbUV2ZW50ICl9KTtgICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcbiAgICB0aGlzLm1vdXNlVXBBY3Rpb24uZXhlY3V0ZSggcG9pbnQsIGNvbnRleHQgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZ2dlcnMgYSBsb2dpY2FsIG1vdXNlbW92ZSBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIG1heSBhbHNvIGJlIGNhbGxlZCBmcm9tIHRoZSBwb2ludGVyIGV2ZW50IGhhbmRsZXIgKHBvaW50ZXJNb3ZlKSBvciBmcm9tIHRoaW5ncyBsaWtlIGZ1enppbmcgb3JcclxuICAgKiBwbGF5YmFjay4gVGhlIGV2ZW50IG1heSBiZSBcImZha2VkXCIgZm9yIGNlcnRhaW4gcHVycG9zZXMuXHJcbiAgICovXHJcbiAgcHVibGljIG1vdXNlTW92ZSggcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxNb3VzZUV2ZW50IHwgUG9pbnRlckV2ZW50PiApOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBgbW91c2VNb3ZlKCR7SW5wdXQuZGVidWdUZXh0KCBwb2ludCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG4gICAgdGhpcy5tb3VzZU1vdmVBY3Rpb24uZXhlY3V0ZSggcG9pbnQsIGNvbnRleHQgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZ2dlcnMgYSBsb2dpY2FsIG1vdXNlb3ZlciBldmVudCAodGhpcyBkb2VzIE5PVCBjb3JyZXNwb25kIHRvIHRoZSBTY2VuZXJ5IGV2ZW50LCBzaW5jZSB0aGlzIGlzIGZvciB0aGUgZGlzcGxheSkgKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIG1vdXNlT3ZlciggcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxNb3VzZUV2ZW50IHwgUG9pbnRlckV2ZW50PiApOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBgbW91c2VPdmVyKCR7SW5wdXQuZGVidWdUZXh0KCBwb2ludCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG4gICAgdGhpcy5tb3VzZU92ZXJBY3Rpb24uZXhlY3V0ZSggcG9pbnQsIGNvbnRleHQgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZ2dlcnMgYSBsb2dpY2FsIG1vdXNlb3V0IGV2ZW50ICh0aGlzIGRvZXMgTk9UIGNvcnJlc3BvbmQgdG8gdGhlIFNjZW5lcnkgZXZlbnQsIHNpbmNlIHRoaXMgaXMgZm9yIHRoZSBkaXNwbGF5KSAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgbW91c2VPdXQoIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8TW91c2VFdmVudCB8IFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYG1vdXNlT3V0KCR7SW5wdXQuZGVidWdUZXh0KCBwb2ludCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG4gICAgdGhpcy5tb3VzZU91dEFjdGlvbi5leGVjdXRlKCBwb2ludCwgY29udGV4dCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmlnZ2VycyBhIGxvZ2ljYWwgbW91c2Utd2hlZWwvc2Nyb2xsIGV2ZW50LiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgd2hlZWwoIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxXaGVlbEV2ZW50PiApOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBgd2hlZWwoJHtJbnB1dC5kZWJ1Z1RleHQoIG51bGwsIGNvbnRleHQuZG9tRXZlbnQgKX0pO2AgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuICAgIHRoaXMud2hlZWxTY3JvbGxBY3Rpb24uZXhlY3V0ZSggY29udGV4dCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmlnZ2VycyBhIGxvZ2ljYWwgdG91Y2hzdGFydCBldmVudC4gVGhpcyBpcyBjYWxsZWQgZm9yIGVhY2ggdG91Y2ggcG9pbnQgaW4gYSAncmF3JyBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIG1heSBhbHNvIGJlIGNhbGxlZCBmcm9tIHRoZSBwb2ludGVyIGV2ZW50IGhhbmRsZXIgKHBvaW50ZXJEb3duKSBvciBmcm9tIHRoaW5ncyBsaWtlIGZ1enppbmcgb3JcclxuICAgKiBwbGF5YmFjay4gVGhlIGV2ZW50IG1heSBiZSBcImZha2VkXCIgZm9yIGNlcnRhaW4gcHVycG9zZXMuXHJcbiAgICovXHJcbiAgcHVibGljIHRvdWNoU3RhcnQoIGlkOiBudW1iZXIsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8VG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYHRvdWNoU3RhcnQoJyR7aWR9Jywke0lucHV0LmRlYnVnVGV4dCggcG9pbnQsIGNvbnRleHQuZG9tRXZlbnQgKX0pO2AgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICB0aGlzLnRvdWNoU3RhcnRBY3Rpb24uZXhlY3V0ZSggaWQsIHBvaW50LCBjb250ZXh0ICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmlnZ2VycyBhIGxvZ2ljYWwgdG91Y2hlbmQgZXZlbnQuIFRoaXMgaXMgY2FsbGVkIGZvciBlYWNoIHRvdWNoIHBvaW50IGluIGEgJ3JhdycgZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogTk9URTogVGhpcyBtYXkgYWxzbyBiZSBjYWxsZWQgZnJvbSB0aGUgcG9pbnRlciBldmVudCBoYW5kbGVyIChwb2ludGVyVXApIG9yIGZyb20gdGhpbmdzIGxpa2UgZnV6emluZyBvclxyXG4gICAqIHBsYXliYWNrLiBUaGUgZXZlbnQgbWF5IGJlIFwiZmFrZWRcIiBmb3IgY2VydGFpbiBwdXJwb3Nlcy5cclxuICAgKi9cclxuICBwdWJsaWMgdG91Y2hFbmQoIGlkOiBudW1iZXIsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8VG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYHRvdWNoRW5kKCcke2lkfScsJHtJbnB1dC5kZWJ1Z1RleHQoIHBvaW50LCBjb250ZXh0LmRvbUV2ZW50ICl9KTtgICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgdGhpcy50b3VjaEVuZEFjdGlvbi5leGVjdXRlKCBpZCwgcG9pbnQsIGNvbnRleHQgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyaWdnZXJzIGEgbG9naWNhbCB0b3VjaG1vdmUgZXZlbnQuIFRoaXMgaXMgY2FsbGVkIGZvciBlYWNoIHRvdWNoIHBvaW50IGluIGEgJ3JhdycgZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogTk9URTogVGhpcyBtYXkgYWxzbyBiZSBjYWxsZWQgZnJvbSB0aGUgcG9pbnRlciBldmVudCBoYW5kbGVyIChwb2ludGVyTW92ZSkgb3IgZnJvbSB0aGluZ3MgbGlrZSBmdXp6aW5nIG9yXHJcbiAgICogcGxheWJhY2suIFRoZSBldmVudCBtYXkgYmUgXCJmYWtlZFwiIGZvciBjZXJ0YWluIHB1cnBvc2VzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB0b3VjaE1vdmUoIGlkOiBudW1iZXIsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8VG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYHRvdWNoTW92ZSgnJHtpZH0nLCR7SW5wdXQuZGVidWdUZXh0KCBwb2ludCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG4gICAgdGhpcy50b3VjaE1vdmVBY3Rpb24uZXhlY3V0ZSggaWQsIHBvaW50LCBjb250ZXh0ICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyaWdnZXJzIGEgbG9naWNhbCB0b3VjaGNhbmNlbCBldmVudC4gVGhpcyBpcyBjYWxsZWQgZm9yIGVhY2ggdG91Y2ggcG9pbnQgaW4gYSAncmF3JyBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIG1heSBhbHNvIGJlIGNhbGxlZCBmcm9tIHRoZSBwb2ludGVyIGV2ZW50IGhhbmRsZXIgKHBvaW50ZXJDYW5jZWwpIG9yIGZyb20gdGhpbmdzIGxpa2UgZnV6emluZyBvclxyXG4gICAqIHBsYXliYWNrLiBUaGUgZXZlbnQgbWF5IGJlIFwiZmFrZWRcIiBmb3IgY2VydGFpbiBwdXJwb3Nlcy5cclxuICAgKi9cclxuICBwdWJsaWMgdG91Y2hDYW5jZWwoIGlkOiBudW1iZXIsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8VG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYHRvdWNoQ2FuY2VsKCcke2lkfScsJHtJbnB1dC5kZWJ1Z1RleHQoIHBvaW50LCBjb250ZXh0LmRvbUV2ZW50ICl9KTtgICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcbiAgICB0aGlzLnRvdWNoQ2FuY2VsQWN0aW9uLmV4ZWN1dGUoIGlkLCBwb2ludCwgY29udGV4dCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmlnZ2VycyBhIGxvZ2ljYWwgcGVuc3RhcnQgZXZlbnQgKGUuZy4gYSBzdHlsdXMpLiBUaGlzIGlzIGNhbGxlZCBmb3IgZWFjaCBwZW4gcG9pbnQgaW4gYSAncmF3JyBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIG1heSBhbHNvIGJlIGNhbGxlZCBmcm9tIHRoZSBwb2ludGVyIGV2ZW50IGhhbmRsZXIgKHBvaW50ZXJEb3duKSBvciBmcm9tIHRoaW5ncyBsaWtlIGZ1enppbmcgb3JcclxuICAgKiBwbGF5YmFjay4gVGhlIGV2ZW50IG1heSBiZSBcImZha2VkXCIgZm9yIGNlcnRhaW4gcHVycG9zZXMuXHJcbiAgICovXHJcbiAgcHVibGljIHBlblN0YXJ0KCBpZDogbnVtYmVyLCBwb2ludDogVmVjdG9yMiwgY29udGV4dDogRXZlbnRDb250ZXh0PFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYHBlblN0YXJ0KCcke2lkfScsJHtJbnB1dC5kZWJ1Z1RleHQoIHBvaW50LCBjb250ZXh0LmRvbUV2ZW50ICl9KTtgICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcbiAgICB0aGlzLnBlblN0YXJ0QWN0aW9uLmV4ZWN1dGUoIGlkLCBwb2ludCwgY29udGV4dCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmlnZ2VycyBhIGxvZ2ljYWwgcGVuZW5kIGV2ZW50IChlLmcuIGEgc3R5bHVzKS4gVGhpcyBpcyBjYWxsZWQgZm9yIGVhY2ggcGVuIHBvaW50IGluIGEgJ3JhdycgZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogTk9URTogVGhpcyBtYXkgYWxzbyBiZSBjYWxsZWQgZnJvbSB0aGUgcG9pbnRlciBldmVudCBoYW5kbGVyIChwb2ludGVyVXApIG9yIGZyb20gdGhpbmdzIGxpa2UgZnV6emluZyBvclxyXG4gICAqIHBsYXliYWNrLiBUaGUgZXZlbnQgbWF5IGJlIFwiZmFrZWRcIiBmb3IgY2VydGFpbiBwdXJwb3Nlcy5cclxuICAgKi9cclxuICBwdWJsaWMgcGVuRW5kKCBpZDogbnVtYmVyLCBwb2ludDogVmVjdG9yMiwgY29udGV4dDogRXZlbnRDb250ZXh0PFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYHBlbkVuZCgnJHtpZH0nLCR7SW5wdXQuZGVidWdUZXh0KCBwb2ludCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG4gICAgdGhpcy5wZW5FbmRBY3Rpb24uZXhlY3V0ZSggaWQsIHBvaW50LCBjb250ZXh0ICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyaWdnZXJzIGEgbG9naWNhbCBwZW5tb3ZlIGV2ZW50IChlLmcuIGEgc3R5bHVzKS4gVGhpcyBpcyBjYWxsZWQgZm9yIGVhY2ggcGVuIHBvaW50IGluIGEgJ3JhdycgZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogTk9URTogVGhpcyBtYXkgYWxzbyBiZSBjYWxsZWQgZnJvbSB0aGUgcG9pbnRlciBldmVudCBoYW5kbGVyIChwb2ludGVyTW92ZSkgb3IgZnJvbSB0aGluZ3MgbGlrZSBmdXp6aW5nIG9yXHJcbiAgICogcGxheWJhY2suIFRoZSBldmVudCBtYXkgYmUgXCJmYWtlZFwiIGZvciBjZXJ0YWluIHB1cnBvc2VzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBwZW5Nb3ZlKCBpZDogbnVtYmVyLCBwb2ludDogVmVjdG9yMiwgY29udGV4dDogRXZlbnRDb250ZXh0PFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYHBlbk1vdmUoJyR7aWR9Jywke0lucHV0LmRlYnVnVGV4dCggcG9pbnQsIGNvbnRleHQuZG9tRXZlbnQgKX0pO2AgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuICAgIHRoaXMucGVuTW92ZUFjdGlvbi5leGVjdXRlKCBpZCwgcG9pbnQsIGNvbnRleHQgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZ2dlcnMgYSBsb2dpY2FsIHBlbmNhbmNlbCBldmVudCAoZS5nLiBhIHN0eWx1cykuIFRoaXMgaXMgY2FsbGVkIGZvciBlYWNoIHBlbiBwb2ludCBpbiBhICdyYXcnIGV2ZW50LiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgbWF5IGFsc28gYmUgY2FsbGVkIGZyb20gdGhlIHBvaW50ZXIgZXZlbnQgaGFuZGxlciAocG9pbnRlckNhbmNlbCkgb3IgZnJvbSB0aGluZ3MgbGlrZSBmdXp6aW5nIG9yXHJcbiAgICogcGxheWJhY2suIFRoZSBldmVudCBtYXkgYmUgXCJmYWtlZFwiIGZvciBjZXJ0YWluIHB1cnBvc2VzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBwZW5DYW5jZWwoIGlkOiBudW1iZXIsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8UG9pbnRlckV2ZW50PiApOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBgcGVuQ2FuY2VsKCcke2lkfScsJHtJbnB1dC5kZWJ1Z1RleHQoIHBvaW50LCBjb250ZXh0LmRvbUV2ZW50ICl9KTtgICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcbiAgICB0aGlzLnBlbkNhbmNlbEFjdGlvbi5leGVjdXRlKCBpZCwgcG9pbnQsIGNvbnRleHQgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGFuZGxlcyBhIHBvaW50ZXJkb3duIGV2ZW50LCBmb3J3YXJkaW5nIGl0IHRvIHRoZSBwcm9wZXIgbG9naWNhbCBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIHBvaW50ZXJEb3duKCBpZDogbnVtYmVyLCB0eXBlOiBzdHJpbmcsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8UG9pbnRlckV2ZW50PiApOiB2b2lkIHtcclxuICAgIC8vIEluIElFIGZvciBwb2ludGVyIGRvd24gZXZlbnRzLCB3ZSB3YW50IHRvIG1ha2Ugc3VyZSB0aGFuIHRoZSBuZXh0IGludGVyYWN0aW9ucyBvZmYgdGhlIHBhZ2UgYXJlIHNlbnQgdG9cclxuICAgIC8vIHRoaXMgZWxlbWVudCAoaXQgd2lsbCBidWJibGUpLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzQ2NCBhbmRcclxuICAgIC8vIGh0dHA6Ly9uZXdzLnFvb3hkb28ub3JnL21vdXNlLWNhcHR1cmluZy5cclxuICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuYXR0YWNoVG9XaW5kb3cgPyBkb2N1bWVudC5ib2R5IDogdGhpcy5kaXNwbGF5LmRvbUVsZW1lbnQ7XHJcbiAgICBpZiAoIHRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZSAmJiBjb250ZXh0LmRvbUV2ZW50LnBvaW50ZXJJZCApIHtcclxuICAgICAgLy8gTk9URTogVGhpcyB3aWxsIGVycm9yIG91dCBpZiBydW4gb24gYSBwbGF5YmFjayBkZXN0aW5hdGlvbiwgd2hlcmUgYSBwb2ludGVyIHdpdGggdGhlIGdpdmVuIElEIGRvZXMgbm90IGV4aXN0LlxyXG4gICAgICB0YXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoIGNvbnRleHQuZG9tRXZlbnQucG9pbnRlcklkICk7XHJcbiAgICB9XHJcblxyXG4gICAgdHlwZSA9IHRoaXMuaGFuZGxlVW5rbm93blBvaW50ZXJUeXBlKCB0eXBlLCBpZCApO1xyXG4gICAgc3dpdGNoKCB0eXBlICkge1xyXG4gICAgICBjYXNlICdtb3VzZSc6XHJcbiAgICAgICAgLy8gVGhlIGFjdHVhbCBldmVudCBhZnRlcndhcmRzXHJcbiAgICAgICAgdGhpcy5tb3VzZURvd24oIGlkLCBwb2ludCwgY29udGV4dCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICd0b3VjaCc6XHJcbiAgICAgICAgdGhpcy50b3VjaFN0YXJ0KCBpZCwgcG9pbnQsIGNvbnRleHQgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncGVuJzpcclxuICAgICAgICB0aGlzLnBlblN0YXJ0KCBpZCwgcG9pbnQsIGNvbnRleHQgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICBpZiAoIGFzc2VydCApIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggYFVua25vd24gcG9pbnRlciB0eXBlOiAke3R5cGV9YCApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhhbmRsZXMgYSBwb2ludGVydXAgZXZlbnQsIGZvcndhcmRpbmcgaXQgdG8gdGhlIHByb3BlciBsb2dpY2FsIGV2ZW50LiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgcG9pbnRlclVwKCBpZDogbnVtYmVyLCB0eXBlOiBzdHJpbmcsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8UG9pbnRlckV2ZW50PiApOiB2b2lkIHtcclxuXHJcbiAgICAvLyB1cGRhdGUgdGhpcyBvdXRzaWRlIG9mIHRoZSBBY3Rpb24gZXhlY3V0aW9ucyBzbyB0aGF0IFBoRVQtaU8gZXZlbnQgcGxheWJhY2sgZG9lcyBub3Qgb3ZlcnJpZGUgaXRcclxuICAgIHRoaXMudXBUaW1lU3RhbXAgPSBjb250ZXh0LmRvbUV2ZW50LnRpbWVTdGFtcDtcclxuXHJcbiAgICB0eXBlID0gdGhpcy5oYW5kbGVVbmtub3duUG9pbnRlclR5cGUoIHR5cGUsIGlkICk7XHJcbiAgICBzd2l0Y2goIHR5cGUgKSB7XHJcbiAgICAgIGNhc2UgJ21vdXNlJzpcclxuICAgICAgICB0aGlzLm1vdXNlVXAoIHBvaW50LCBjb250ZXh0ICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3RvdWNoJzpcclxuICAgICAgICB0aGlzLnRvdWNoRW5kKCBpZCwgcG9pbnQsIGNvbnRleHQgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncGVuJzpcclxuICAgICAgICB0aGlzLnBlbkVuZCggaWQsIHBvaW50LCBjb250ZXh0ICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgaWYgKCBhc3NlcnQgKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBVbmtub3duIHBvaW50ZXIgdHlwZTogJHt0eXBlfWAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIYW5kbGVzIGEgcG9pbnRlcmNhbmNlbCBldmVudCwgZm9yd2FyZGluZyBpdCB0byB0aGUgcHJvcGVyIGxvZ2ljYWwgZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBwb2ludGVyQ2FuY2VsKCBpZDogbnVtYmVyLCB0eXBlOiBzdHJpbmcsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8UG9pbnRlckV2ZW50PiApOiB2b2lkIHtcclxuICAgIHR5cGUgPSB0aGlzLmhhbmRsZVVua25vd25Qb2ludGVyVHlwZSggdHlwZSwgaWQgKTtcclxuICAgIHN3aXRjaCggdHlwZSApIHtcclxuICAgICAgY2FzZSAnbW91c2UnOlxyXG4gICAgICAgIGlmICggY29uc29sZSAmJiBjb25zb2xlLmxvZyApIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCAnV0FSTklORzogUG9pbnRlciBtb3VzZSBjYW5jZWwgd2FzIHJlY2VpdmVkJyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAndG91Y2gnOlxyXG4gICAgICAgIHRoaXMudG91Y2hDYW5jZWwoIGlkLCBwb2ludCwgY29udGV4dCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdwZW4nOlxyXG4gICAgICAgIHRoaXMucGVuQ2FuY2VsKCBpZCwgcG9pbnQsIGNvbnRleHQgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICBpZiAoIGNvbnNvbGUubG9nICkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coIGBVbmtub3duIHBvaW50ZXIgdHlwZTogJHt0eXBlfWAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIYW5kbGVzIGEgZ290cG9pbnRlcmNhcHR1cmUgZXZlbnQsIGZvcndhcmRpbmcgaXQgdG8gdGhlIHByb3BlciBsb2dpY2FsIGV2ZW50LiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgZ290UG9pbnRlckNhcHR1cmUoIGlkOiBudW1iZXIsIHR5cGU6IHN0cmluZywgcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dCApOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBgZ290UG9pbnRlckNhcHR1cmUoJyR7aWR9Jywke0lucHV0LmRlYnVnVGV4dCggbnVsbCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG4gICAgdGhpcy5nb3RQb2ludGVyQ2FwdHVyZUFjdGlvbi5leGVjdXRlKCBpZCwgY29udGV4dCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIYW5kbGVzIGEgbG9zdHBvaW50ZXJjYXB0dXJlIGV2ZW50LCBmb3J3YXJkaW5nIGl0IHRvIHRoZSBwcm9wZXIgbG9naWNhbCBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGxvc3RQb2ludGVyQ2FwdHVyZSggaWQ6IG51bWJlciwgdHlwZTogc3RyaW5nLCBwb2ludDogVmVjdG9yMiwgY29udGV4dDogRXZlbnRDb250ZXh0ICk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoIGBsb3N0UG9pbnRlckNhcHR1cmUoJyR7aWR9Jywke0lucHV0LmRlYnVnVGV4dCggbnVsbCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG4gICAgdGhpcy5sb3N0UG9pbnRlckNhcHR1cmVBY3Rpb24uZXhlY3V0ZSggaWQsIGNvbnRleHQgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGFuZGxlcyBhIHBvaW50ZXJtb3ZlIGV2ZW50LCBmb3J3YXJkaW5nIGl0IHRvIHRoZSBwcm9wZXIgbG9naWNhbCBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIHBvaW50ZXJNb3ZlKCBpZDogbnVtYmVyLCB0eXBlOiBzdHJpbmcsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8UG9pbnRlckV2ZW50PiApOiB2b2lkIHtcclxuICAgIHR5cGUgPSB0aGlzLmhhbmRsZVVua25vd25Qb2ludGVyVHlwZSggdHlwZSwgaWQgKTtcclxuICAgIHN3aXRjaCggdHlwZSApIHtcclxuICAgICAgY2FzZSAnbW91c2UnOlxyXG4gICAgICAgIHRoaXMubW91c2VNb3ZlKCBwb2ludCwgY29udGV4dCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICd0b3VjaCc6XHJcbiAgICAgICAgdGhpcy50b3VjaE1vdmUoIGlkLCBwb2ludCwgY29udGV4dCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdwZW4nOlxyXG4gICAgICAgIHRoaXMucGVuTW92ZSggaWQsIHBvaW50LCBjb250ZXh0ICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgaWYgKCBjb25zb2xlLmxvZyApIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCBgVW5rbm93biBwb2ludGVyIHR5cGU6ICR7dHlwZX1gICk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGFuZGxlcyBhIHBvaW50ZXJvdmVyIGV2ZW50LCBmb3J3YXJkaW5nIGl0IHRvIHRoZSBwcm9wZXIgbG9naWNhbCBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIHBvaW50ZXJPdmVyKCBpZDogbnVtYmVyLCB0eXBlOiBzdHJpbmcsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8UG9pbnRlckV2ZW50PiApOiB2b2lkIHtcclxuICAgIC8vIFRPRE86IGFjY3VtdWxhdGUgbW91c2UvdG91Y2ggaW5mbyBpbiB0aGUgb2JqZWN0IGlmIG5lZWRlZD9cclxuICAgIC8vIFRPRE86IGRvIHdlIHdhbnQgdG8gYnJhbmNoIGNoYW5nZSBvbiB0aGVzZSB0eXBlcyBvZiBldmVudHM/XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIYW5kbGVzIGEgcG9pbnRlcm91dCBldmVudCwgZm9yd2FyZGluZyBpdCB0byB0aGUgcHJvcGVyIGxvZ2ljYWwgZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBwb2ludGVyT3V0KCBpZDogbnVtYmVyLCB0eXBlOiBzdHJpbmcsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8UG9pbnRlckV2ZW50PiApOiB2b2lkIHtcclxuICAgIC8vIFRPRE86IGFjY3VtdWxhdGUgbW91c2UvdG91Y2ggaW5mbyBpbiB0aGUgb2JqZWN0IGlmIG5lZWRlZD9cclxuICAgIC8vIFRPRE86IGRvIHdlIHdhbnQgdG8gYnJhbmNoIGNoYW5nZSBvbiB0aGVzZSB0eXBlcyBvZiBldmVudHM/XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIYW5kbGVzIGEgcG9pbnRlcmVudGVyIGV2ZW50LCBmb3J3YXJkaW5nIGl0IHRvIHRoZSBwcm9wZXIgbG9naWNhbCBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIHBvaW50ZXJFbnRlciggaWQ6IG51bWJlciwgdHlwZTogc3RyaW5nLCBwb2ludDogVmVjdG9yMiwgY29udGV4dDogRXZlbnRDb250ZXh0PFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XHJcbiAgICAvLyBUT0RPOiBhY2N1bXVsYXRlIG1vdXNlL3RvdWNoIGluZm8gaW4gdGhlIG9iamVjdCBpZiBuZWVkZWQ/XHJcbiAgICAvLyBUT0RPOiBkbyB3ZSB3YW50IHRvIGJyYW5jaCBjaGFuZ2Ugb24gdGhlc2UgdHlwZXMgb2YgZXZlbnRzP1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGFuZGxlcyBhIHBvaW50ZXJsZWF2ZSBldmVudCwgZm9yd2FyZGluZyBpdCB0byB0aGUgcHJvcGVyIGxvZ2ljYWwgZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBwb2ludGVyTGVhdmUoIGlkOiBudW1iZXIsIHR5cGU6IHN0cmluZywgcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxQb2ludGVyRXZlbnQ+ICk6IHZvaWQge1xyXG4gICAgLy8gVE9ETzogYWNjdW11bGF0ZSBtb3VzZS90b3VjaCBpbmZvIGluIHRoZSBvYmplY3QgaWYgbmVlZGVkP1xyXG4gICAgLy8gVE9ETzogZG8gd2Ugd2FudCB0byBicmFuY2ggY2hhbmdlIG9uIHRoZXNlIHR5cGVzIG9mIGV2ZW50cz9cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhhbmRsZXMgYSBmb2N1c2luIGV2ZW50LCBmb3J3YXJkaW5nIGl0IHRvIHRoZSBwcm9wZXIgbG9naWNhbCBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGZvY3VzSW4oIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxGb2N1c0V2ZW50PiApOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBgZm9jdXNJbignJHtJbnB1dC5kZWJ1Z1RleHQoIG51bGwsIGNvbnRleHQuZG9tRXZlbnQgKX0pO2AgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICB0aGlzLmZvY3VzaW5BY3Rpb24uZXhlY3V0ZSggY29udGV4dCApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGFuZGxlcyBhIGZvY3Vzb3V0IGV2ZW50LCBmb3J3YXJkaW5nIGl0IHRvIHRoZSBwcm9wZXIgbG9naWNhbCBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGZvY3VzT3V0KCBjb250ZXh0OiBFdmVudENvbnRleHQ8Rm9jdXNFdmVudD4gKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYGZvY3VzT3V0KCcke0lucHV0LmRlYnVnVGV4dCggbnVsbCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIHRoaXMuZm9jdXNvdXRBY3Rpb24uZXhlY3V0ZSggY29udGV4dCApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGFuZGxlcyBhbiBpbnB1dCBldmVudCwgZm9yd2FyZGluZyBpdCB0byB0aGUgcHJvcGVyIGxvZ2ljYWwgZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBpbnB1dCggY29udGV4dDogRXZlbnRDb250ZXh0PEV2ZW50IHwgSW5wdXRFdmVudD4gKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYGlucHV0KCcke0lucHV0LmRlYnVnVGV4dCggbnVsbCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIHRoaXMuaW5wdXRBY3Rpb24uZXhlY3V0ZSggY29udGV4dCApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGFuZGxlcyBhIGNoYW5nZSBldmVudCwgZm9yd2FyZGluZyBpdCB0byB0aGUgcHJvcGVyIGxvZ2ljYWwgZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjaGFuZ2UoIGNvbnRleHQ6IEV2ZW50Q29udGV4dCApOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBgY2hhbmdlKCcke0lucHV0LmRlYnVnVGV4dCggbnVsbCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIHRoaXMuY2hhbmdlQWN0aW9uLmV4ZWN1dGUoIGNvbnRleHQgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhhbmRsZXMgYSBjbGljayBldmVudCwgZm9yd2FyZGluZyBpdCB0byB0aGUgcHJvcGVyIGxvZ2ljYWwgZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjbGljayggY29udGV4dDogRXZlbnRDb250ZXh0PE1vdXNlRXZlbnQ+ICk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoIGBjbGljaygnJHtJbnB1dC5kZWJ1Z1RleHQoIG51bGwsIGNvbnRleHQuZG9tRXZlbnQgKX0pO2AgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICB0aGlzLmNsaWNrQWN0aW9uLmV4ZWN1dGUoIGNvbnRleHQgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhhbmRsZXMgYSBrZXlkb3duIGV2ZW50LCBmb3J3YXJkaW5nIGl0IHRvIHRoZSBwcm9wZXIgbG9naWNhbCBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGtleURvd24oIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxLZXlib2FyZEV2ZW50PiApOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBga2V5RG93bignJHtJbnB1dC5kZWJ1Z1RleHQoIG51bGwsIGNvbnRleHQuZG9tRXZlbnQgKX0pO2AgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICB0aGlzLmtleWRvd25BY3Rpb24uZXhlY3V0ZSggY29udGV4dCApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGFuZGxlcyBhIGtleXVwIGV2ZW50LCBmb3J3YXJkaW5nIGl0IHRvIHRoZSBwcm9wZXIgbG9naWNhbCBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGtleVVwKCBjb250ZXh0OiBFdmVudENvbnRleHQ8S2V5Ym9hcmRFdmVudD4gKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYGtleVVwKCcke0lucHV0LmRlYnVnVGV4dCggbnVsbCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIHRoaXMua2V5dXBBY3Rpb24uZXhlY3V0ZSggY29udGV4dCApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hlbiB3ZSBnZXQgYW4gdW5rbm93biBwb2ludGVyIGV2ZW50IHR5cGUgKGFsbG93ZWQgaW4gdGhlIHNwZWMsIHNlZVxyXG4gICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Qb2ludGVyRXZlbnQvcG9pbnRlclR5cGUpLCB3ZSdsbCB0cnkgdG8gZ3Vlc3MgdGhlIHBvaW50ZXIgdHlwZVxyXG4gICAqIHNvIHRoYXQgd2UgY2FuIHByb3Blcmx5IHN0YXJ0L2VuZCB0aGUgaW50ZXJhY3Rpb24uIE5PVEU6IHRoaXMgY2FuIGhhcHBlbiBmb3IgYW4gJ3VwJyB3aGVyZSB3ZSByZWNlaXZlZCBhXHJcbiAgICogcHJvcGVyIHR5cGUgZm9yIGEgJ2Rvd24nLCBzbyB0aHVzIHdlIG5lZWQgdGhlIGRldGVjdGlvbi5cclxuICAgKi9cclxuICBwcml2YXRlIGhhbmRsZVVua25vd25Qb2ludGVyVHlwZSggdHlwZTogc3RyaW5nLCBpZDogbnVtYmVyICk6IHN0cmluZyB7XHJcbiAgICBpZiAoIHR5cGUgIT09ICcnICkge1xyXG4gICAgICByZXR1cm4gdHlwZTtcclxuICAgIH1cclxuICAgIHJldHVybiAoIHRoaXMubW91c2UgJiYgdGhpcy5tb3VzZS5pZCA9PT0gaWQgKSA/ICdtb3VzZScgOiAndG91Y2gnO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2l2ZW4gYSBwb2ludGVyIHJlZmVyZW5jZSwgaGl0IHRlc3QgaXQgYW5kIGRldGVybWluZSB0aGUgVHJhaWwgdGhhdCB0aGUgcG9pbnRlciBpcyBvdmVyLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0UG9pbnRlclRyYWlsKCBwb2ludGVyOiBQb2ludGVyICk6IFRyYWlsIHtcclxuICAgIHJldHVybiB0aGlzLnJvb3ROb2RlLnRyYWlsVW5kZXJQb2ludGVyKCBwb2ludGVyICkgfHwgbmV3IFRyYWlsKCB0aGlzLnJvb3ROb2RlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgZm9yIGVhY2ggbG9naWNhbCBcInVwXCIgZXZlbnQsIGZvciBhbnkgcG9pbnRlciB0eXBlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgdXBFdmVudDxET01FdmVudCBleHRlbmRzIEV2ZW50PiggcG9pbnRlcjogUG9pbnRlciwgY29udGV4dDogRXZlbnRDb250ZXh0PERPTUV2ZW50PiwgcG9pbnQ6IFZlY3RvcjIgKTogdm9pZCB7XHJcbiAgICAvLyBpZiB0aGUgZXZlbnQgdGFyZ2V0IGlzIHdpdGhpbiB0aGUgUERPTSB0aGUgQVQgaXMgc2VuZGluZyBhIGZha2UgcG9pbnRlciBldmVudCB0byB0aGUgZG9jdW1lbnQgLSBkbyBub3RcclxuICAgIC8vIGRpc3BhdGNoIHRoaXMgc2luY2UgdGhlIFBET00gc2hvdWxkIG9ubHkgaGFuZGxlIElucHV0LlBET01fRVZFTlRfVFlQRVMsIGFuZCBhbGwgb3RoZXIgcG9pbnRlciBpbnB1dCBzaG91bGRcclxuICAgIC8vIGdvIHRocm91Z2ggdGhlIERpc3BsYXkgZGl2LiBPdGhlcndpc2UsIGFjdGl2YXRpb24gd2lsbCBiZSBkdXBsaWNhdGVkIHdoZW4gd2UgaGFuZGxlIHBvaW50ZXIgYW5kIFBET00gZXZlbnRzXHJcbiAgICBpZiAoIHRoaXMuaXNUYXJnZXRVbmRlclBET00oIGNvbnRleHQuZG9tRXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50ICkgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwb2ludENoYW5nZWQgPSBwb2ludGVyLnVwKCBwb2ludCwgY29udGV4dC5kb21FdmVudCApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBgdXBFdmVudCAke3BvaW50ZXIudG9TdHJpbmcoKX0gY2hhbmdlZDoke3BvaW50Q2hhbmdlZH1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gV2UnbGwgdXNlIHRoaXMgdHJhaWwgZm9yIHRoZSBlbnRpcmUgZGlzcGF0Y2ggb2YgdGhpcyBldmVudC5cclxuICAgIGNvbnN0IGV2ZW50VHJhaWwgPSB0aGlzLmJyYW5jaENoYW5nZUV2ZW50czxET01FdmVudD4oIHBvaW50ZXIsIGNvbnRleHQsIHBvaW50Q2hhbmdlZCApO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudDxET01FdmVudD4oIGV2ZW50VHJhaWwsICd1cCcsIHBvaW50ZXIsIGNvbnRleHQsIHRydWUgKTtcclxuXHJcbiAgICAvLyB0b3VjaCBwb2ludGVycyBhcmUgdHJhbnNpZW50LCBzbyBmaXJlIGV4aXQvb3V0IHRvIHRoZSB0cmFpbCBhZnRlcndhcmRzXHJcbiAgICBpZiAoIHBvaW50ZXIuaXNUb3VjaExpa2UoKSApIHtcclxuICAgICAgdGhpcy5leGl0RXZlbnRzPERPTUV2ZW50PiggcG9pbnRlciwgY29udGV4dCwgZXZlbnRUcmFpbCwgMCwgdHJ1ZSApO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGZvciBlYWNoIGxvZ2ljYWwgXCJkb3duXCIgZXZlbnQsIGZvciBhbnkgcG9pbnRlciB0eXBlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZG93bkV2ZW50PERPTUV2ZW50IGV4dGVuZHMgRXZlbnQ+KCBwb2ludGVyOiBQb2ludGVyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8RE9NRXZlbnQ+LCBwb2ludDogVmVjdG9yMiApOiB2b2lkIHtcclxuICAgIC8vIGlmIHRoZSBldmVudCB0YXJnZXQgaXMgd2l0aGluIHRoZSBQRE9NIHRoZSBBVCBpcyBzZW5kaW5nIGEgZmFrZSBwb2ludGVyIGV2ZW50IHRvIHRoZSBkb2N1bWVudCAtIGRvIG5vdFxyXG4gICAgLy8gZGlzcGF0Y2ggdGhpcyBzaW5jZSB0aGUgUERPTSBzaG91bGQgb25seSBoYW5kbGUgSW5wdXQuUERPTV9FVkVOVF9UWVBFUywgYW5kIGFsbCBvdGhlciBwb2ludGVyIGlucHV0IHNob3VsZFxyXG4gICAgLy8gZ28gdGhyb3VnaCB0aGUgRGlzcGxheSBkaXYuIE90aGVyd2lzZSwgYWN0aXZhdGlvbiB3aWxsIGJlIGR1cGxpY2F0ZWQgd2hlbiB3ZSBoYW5kbGUgcG9pbnRlciBhbmQgUERPTSBldmVudHNcclxuICAgIGlmICggdGhpcy5pc1RhcmdldFVuZGVyUERPTSggY29udGV4dC5kb21FdmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQgKSApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHBvaW50Q2hhbmdlZCA9IHBvaW50ZXIudXBkYXRlUG9pbnQoIHBvaW50ICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoIGBkb3duRXZlbnQgJHtwb2ludGVyLnRvU3RyaW5nKCl9IGNoYW5nZWQ6JHtwb2ludENoYW5nZWR9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIC8vIFdlJ2xsIHVzZSB0aGlzIHRyYWlsIGZvciB0aGUgZW50aXJlIGRpc3BhdGNoIG9mIHRoaXMgZXZlbnQuXHJcbiAgICBjb25zdCBldmVudFRyYWlsID0gdGhpcy5icmFuY2hDaGFuZ2VFdmVudHM8RE9NRXZlbnQ+KCBwb2ludGVyLCBjb250ZXh0LCBwb2ludENoYW5nZWQgKTtcclxuXHJcbiAgICBwb2ludGVyLmRvd24oIGNvbnRleHQuZG9tRXZlbnQgKTtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQ8RE9NRXZlbnQ+KCBldmVudFRyYWlsLCAnZG93bicsIHBvaW50ZXIsIGNvbnRleHQsIHRydWUgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCBmb3IgZWFjaCBsb2dpY2FsIFwibW92ZVwiIGV2ZW50LCBmb3IgYW55IHBvaW50ZXIgdHlwZS5cclxuICAgKi9cclxuICBwcml2YXRlIG1vdmVFdmVudDxET01FdmVudCBleHRlbmRzIEV2ZW50PiggcG9pbnRlcjogUG9pbnRlciwgY29udGV4dDogRXZlbnRDb250ZXh0PERPTUV2ZW50PiApOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBgbW92ZUV2ZW50ICR7cG9pbnRlci50b1N0cmluZygpfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBBbHdheXMgdHJlYXQgbW92ZSBldmVudHMgYXMgXCJwb2ludCBjaGFuZ2VkXCJcclxuICAgIHRoaXMuYnJhbmNoQ2hhbmdlRXZlbnRzPERPTUV2ZW50PiggcG9pbnRlciwgY29udGV4dCwgdHJ1ZSApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGZvciBlYWNoIGxvZ2ljYWwgXCJjYW5jZWxcIiBldmVudCwgZm9yIGFueSBwb2ludGVyIHR5cGUuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjYW5jZWxFdmVudDxET01FdmVudCBleHRlbmRzIEV2ZW50PiggcG9pbnRlcjogUG9pbnRlciwgY29udGV4dDogRXZlbnRDb250ZXh0PERPTUV2ZW50PiwgcG9pbnQ6IFZlY3RvcjIgKTogdm9pZCB7XHJcbiAgICBjb25zdCBwb2ludENoYW5nZWQgPSBwb2ludGVyLmNhbmNlbCggcG9pbnQgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYGNhbmNlbEV2ZW50ICR7cG9pbnRlci50b1N0cmluZygpfSBjaGFuZ2VkOiR7cG9pbnRDaGFuZ2VkfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBXZSdsbCB1c2UgdGhpcyB0cmFpbCBmb3IgdGhlIGVudGlyZSBkaXNwYXRjaCBvZiB0aGlzIGV2ZW50LlxyXG4gICAgY29uc3QgZXZlbnRUcmFpbCA9IHRoaXMuYnJhbmNoQ2hhbmdlRXZlbnRzPERPTUV2ZW50PiggcG9pbnRlciwgY29udGV4dCwgcG9pbnRDaGFuZ2VkICk7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50PERPTUV2ZW50PiggZXZlbnRUcmFpbCwgJ2NhbmNlbCcsIHBvaW50ZXIsIGNvbnRleHQsIHRydWUgKTtcclxuXHJcbiAgICAvLyB0b3VjaCBwb2ludGVycyBhcmUgdHJhbnNpZW50LCBzbyBmaXJlIGV4aXQvb3V0IHRvIHRoZSB0cmFpbCBhZnRlcndhcmRzXHJcbiAgICBpZiAoIHBvaW50ZXIuaXNUb3VjaExpa2UoKSApIHtcclxuICAgICAgdGhpcy5leGl0RXZlbnRzPERPTUV2ZW50PiggcG9pbnRlciwgY29udGV4dCwgZXZlbnRUcmFpbCwgMCwgdHJ1ZSApO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlzcGF0Y2hlcyBhbnkgbmVjZXNzYXJ5IGV2ZW50cyB0aGF0IHdvdWxkIHJlc3VsdCBmcm9tIHRoZSBwb2ludGVyJ3MgdHJhaWwgY2hhbmdpbmcuXHJcbiAgICpcclxuICAgKiBUaGlzIHdpbGwgc2VuZCB0aGUgbmVjZXNzYXJ5IGV4aXQvZW50ZXIgZXZlbnRzIChvbiBzdWJ0cmFpbHMgdGhhdCBoYXZlIGRpdmVyZ2VkIGJldHdlZW4gYmVmb3JlL2FmdGVyKSwgdGhlXHJcbiAgICogb3V0L292ZXIgZXZlbnRzLCBhbmQgaWYgZmxhZ2dlZCBhIG1vdmUgZXZlbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcG9pbnRlclxyXG4gICAqIEBwYXJhbSBjb250ZXh0XHJcbiAgICogQHBhcmFtIHNlbmRNb3ZlIC0gV2hldGhlciB0byBzZW5kIG1vdmUgZXZlbnRzXHJcbiAgICogQHJldHVybnMgLSBUaGUgY3VycmVudCB0cmFpbCBvZiB0aGUgcG9pbnRlclxyXG4gICAqL1xyXG4gIHByaXZhdGUgYnJhbmNoQ2hhbmdlRXZlbnRzPERPTUV2ZW50IGV4dGVuZHMgRXZlbnQ+KCBwb2ludGVyOiBQb2ludGVyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8RE9NRXZlbnQ+LCBzZW5kTW92ZTogYm9vbGVhbiApOiBUcmFpbCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCAmJiBzY2VuZXJ5TG9nLklucHV0RXZlbnQoXHJcbiAgICAgIGBicmFuY2hDaGFuZ2VFdmVudHM6ICR7cG9pbnRlci50b1N0cmluZygpfSBzZW5kTW92ZToke3NlbmRNb3ZlfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dEV2ZW50ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIGNvbnN0IHRyYWlsID0gdGhpcy5nZXRQb2ludGVyVHJhaWwoIHBvaW50ZXIgKTtcclxuXHJcbiAgICBjb25zdCBpbnB1dEVuYWJsZWRUcmFpbCA9IHRyYWlsLnNsaWNlKCAwLCBNYXRoLm1pbiggdHJhaWwubm9kZXMubGVuZ3RoLCB0cmFpbC5nZXRMYXN0SW5wdXRFbmFibGVkSW5kZXgoKSArIDEgKSApO1xyXG4gICAgY29uc3Qgb2xkSW5wdXRFbmFibGVkVHJhaWwgPSBwb2ludGVyLmlucHV0RW5hYmxlZFRyYWlsIHx8IG5ldyBUcmFpbCggdGhpcy5yb290Tm9kZSApO1xyXG4gICAgY29uc3QgYnJhbmNoSW5wdXRFbmFibGVkSW5kZXggPSBUcmFpbC5icmFuY2hJbmRleCggaW5wdXRFbmFibGVkVHJhaWwsIG9sZElucHV0RW5hYmxlZFRyYWlsICk7XHJcbiAgICBjb25zdCBsYXN0SW5wdXRFbmFibGVkTm9kZUNoYW5nZWQgPSBvbGRJbnB1dEVuYWJsZWRUcmFpbC5sYXN0Tm9kZSgpICE9PSBpbnB1dEVuYWJsZWRUcmFpbC5sYXN0Tm9kZSgpO1xyXG5cclxuICAgIGlmICggc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0RXZlbnQgKSB7XHJcbiAgICAgIGNvbnN0IG9sZFRyYWlsID0gcG9pbnRlci50cmFpbCB8fCBuZXcgVHJhaWwoIHRoaXMucm9vdE5vZGUgKTtcclxuICAgICAgY29uc3QgYnJhbmNoSW5kZXggPSBUcmFpbC5icmFuY2hJbmRleCggdHJhaWwsIG9sZFRyYWlsICk7XHJcblxyXG4gICAgICAoIGJyYW5jaEluZGV4ICE9PSB0cmFpbC5sZW5ndGggfHwgYnJhbmNoSW5kZXggIT09IG9sZFRyYWlsLmxlbmd0aCApICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudChcclxuICAgICAgICBgY2hhbmdlZCBmcm9tICR7b2xkVHJhaWwudG9TdHJpbmcoKX0gdG8gJHt0cmFpbC50b1N0cmluZygpfWAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBldmVudCBvcmRlciBtYXRjaGVzIGh0dHA6Ly93d3cudzMub3JnL1RSL0RPTS1MZXZlbC0zLUV2ZW50cy8jZXZlbnRzLW1vdXNlZXZlbnQtZXZlbnQtb3JkZXJcclxuICAgIGlmICggc2VuZE1vdmUgKSB7XHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudDxET01FdmVudD4oIHRyYWlsLCAnbW92ZScsIHBvaW50ZXIsIGNvbnRleHQsIHRydWUgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBXZSB3YW50IHRvIGFwcHJveGltYXRlbHkgbWltaWMgaHR0cDovL3d3dy53My5vcmcvVFIvRE9NLUxldmVsLTMtRXZlbnRzLyNldmVudHMtbW91c2VldmVudC1ldmVudC1vcmRlclxyXG4gICAgdGhpcy5leGl0RXZlbnRzPERPTUV2ZW50PiggcG9pbnRlciwgY29udGV4dCwgb2xkSW5wdXRFbmFibGVkVHJhaWwsIGJyYW5jaElucHV0RW5hYmxlZEluZGV4LCBsYXN0SW5wdXRFbmFibGVkTm9kZUNoYW5nZWQgKTtcclxuICAgIHRoaXMuZW50ZXJFdmVudHM8RE9NRXZlbnQ+KCBwb2ludGVyLCBjb250ZXh0LCBpbnB1dEVuYWJsZWRUcmFpbCwgYnJhbmNoSW5wdXRFbmFibGVkSW5kZXgsIGxhc3RJbnB1dEVuYWJsZWROb2RlQ2hhbmdlZCApO1xyXG5cclxuICAgIHBvaW50ZXIudHJhaWwgPSB0cmFpbDtcclxuICAgIHBvaW50ZXIuaW5wdXRFbmFibGVkVHJhaWwgPSBpbnB1dEVuYWJsZWRUcmFpbDtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgcmV0dXJuIHRyYWlsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZ2dlcnMgJ2VudGVyJyBldmVudHMgYWxvbmcgYSB0cmFpbCBjaGFuZ2UsIGFuZCBhbiAnb3ZlcicgZXZlbnQgb24gdGhlIGxlYWYuXHJcbiAgICpcclxuICAgKiBGb3IgZXhhbXBsZSwgaWYgd2UgY2hhbmdlIGZyb20gYSB0cmFpbCBbIGEsIGIsIGMsIGQsIGUgXSA9PiBbIGEsIGIsIHgsIHkgXSwgaXQgd2lsbCBmaXJlOlxyXG4gICAqXHJcbiAgICogLSBlbnRlciB4XHJcbiAgICogLSBlbnRlciB5XHJcbiAgICogLSBvdmVyIHkgKGJ1YmJsZXMpXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcG9pbnRlclxyXG4gICAqIEBwYXJhbSBldmVudFxyXG4gICAqIEBwYXJhbSB0cmFpbCAtIFRoZSBcIm5ld1wiIHRyYWlsXHJcbiAgICogQHBhcmFtIGJyYW5jaEluZGV4IC0gVGhlIGZpcnN0IGluZGV4IHdoZXJlIHRoZSBvbGQgYW5kIG5ldyB0cmFpbHMgaGF2ZSBhIGRpZmZlcmVudCBub2RlLiBXZSB3aWxsIG5vdGlmeVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciB0aGlzIG5vZGUgYW5kIGFsbCBcImRlc2NlbmRhbnRcIiBub2RlcyBpbiB0aGUgcmVsZXZhbnQgdHJhaWwuXHJcbiAgICogQHBhcmFtIGxhc3ROb2RlQ2hhbmdlZCAtIElmIHRoZSBsYXN0IG5vZGUgZGlkbid0IGNoYW5nZSwgd2Ugd29uJ3Qgc2VudCBhbiBvdmVyIGV2ZW50LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZW50ZXJFdmVudHM8RE9NRXZlbnQgZXh0ZW5kcyBFdmVudD4oIHBvaW50ZXI6IFBvaW50ZXIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxET01FdmVudD4sIHRyYWlsOiBUcmFpbCwgYnJhbmNoSW5kZXg6IG51bWJlciwgbGFzdE5vZGVDaGFuZ2VkOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgaWYgKCBsYXN0Tm9kZUNoYW5nZWQgKSB7XHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudDxET01FdmVudD4oIHRyYWlsLCAnb3ZlcicsIHBvaW50ZXIsIGNvbnRleHQsIHRydWUsIHRydWUgKTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IGJyYW5jaEluZGV4OyBpIDwgdHJhaWwubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudDxET01FdmVudD4oIHRyYWlsLnNsaWNlKCAwLCBpICsgMSApLCAnZW50ZXInLCBwb2ludGVyLCBjb250ZXh0LCBmYWxzZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZ2dlcnMgJ2V4aXQnIGV2ZW50cyBhbG9uZyBhIHRyYWlsIGNoYW5nZSwgYW5kIGFuICdvdXQnIGV2ZW50IG9uIHRoZSBsZWFmLlxyXG4gICAqXHJcbiAgICogRm9yIGV4YW1wbGUsIGlmIHdlIGNoYW5nZSBmcm9tIGEgdHJhaWwgWyBhLCBiLCBjLCBkLCBlIF0gPT4gWyBhLCBiLCB4LCB5IF0sIGl0IHdpbGwgZmlyZTpcclxuICAgKlxyXG4gICAqIC0gb3V0IGUgKGJ1YmJsZXMpXHJcbiAgICogLSBleGl0IGNcclxuICAgKiAtIGV4aXQgZFxyXG4gICAqIC0gZXhpdCBlXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcG9pbnRlclxyXG4gICAqIEBwYXJhbSBldmVudFxyXG4gICAqIEBwYXJhbSB0cmFpbCAtIFRoZSBcIm9sZFwiIHRyYWlsXHJcbiAgICogQHBhcmFtIGJyYW5jaEluZGV4IC0gVGhlIGZpcnN0IGluZGV4IHdoZXJlIHRoZSBvbGQgYW5kIG5ldyB0cmFpbHMgaGF2ZSBhIGRpZmZlcmVudCBub2RlLiBXZSB3aWxsIG5vdGlmeVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciB0aGlzIG5vZGUgYW5kIGFsbCBcImRlc2NlbmRhbnRcIiBub2RlcyBpbiB0aGUgcmVsZXZhbnQgdHJhaWwuXHJcbiAgICogQHBhcmFtIGxhc3ROb2RlQ2hhbmdlZCAtIElmIHRoZSBsYXN0IG5vZGUgZGlkbid0IGNoYW5nZSwgd2Ugd29uJ3Qgc2VudCBhbiBvdXQgZXZlbnQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBleGl0RXZlbnRzPERPTUV2ZW50IGV4dGVuZHMgRXZlbnQ+KCBwb2ludGVyOiBQb2ludGVyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8RE9NRXZlbnQ+LCB0cmFpbDogVHJhaWwsIGJyYW5jaEluZGV4OiBudW1iZXIsIGxhc3ROb2RlQ2hhbmdlZDogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIGZvciAoIGxldCBpID0gdHJhaWwubGVuZ3RoIC0gMTsgaSA+PSBicmFuY2hJbmRleDsgaS0tICkge1xyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQ8RE9NRXZlbnQ+KCB0cmFpbC5zbGljZSggMCwgaSArIDEgKSwgJ2V4aXQnLCBwb2ludGVyLCBjb250ZXh0LCBmYWxzZSwgdHJ1ZSApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggbGFzdE5vZGVDaGFuZ2VkICkge1xyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQ8RE9NRXZlbnQ+KCB0cmFpbCwgJ291dCcsIHBvaW50ZXIsIGNvbnRleHQsIHRydWUgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpc3BhdGNoIHRvIGFsbCBub2RlcyBpbiB0aGUgVHJhaWwsIG9wdGlvbmFsbHkgYnViYmxpbmcgZG93biBmcm9tIHRoZSBsZWFmIHRvIHRoZSByb290LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHRyYWlsXHJcbiAgICogQHBhcmFtIHR5cGVcclxuICAgKiBAcGFyYW0gcG9pbnRlclxyXG4gICAqIEBwYXJhbSBjb250ZXh0XHJcbiAgICogQHBhcmFtIGJ1YmJsZXMgLSBJZiBidWJibGVzIGlzIGZhbHNlLCB0aGUgZXZlbnQgaXMgb25seSBkaXNwYXRjaGVkIHRvIHRoZSBsZWFmIG5vZGUgb2YgdGhlIHRyYWlsLlxyXG4gICAqIEBwYXJhbSBmaXJlT25JbnB1dERpc2FibGVkIC0gV2hldGhlciB0byBmaXJlIHRoaXMgZXZlbnQgZXZlbiBpZiBub2RlcyBoYXZlIGlucHV0RW5hYmxlZDpmYWxzZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgZGlzcGF0Y2hFdmVudDxET01FdmVudCBleHRlbmRzIEV2ZW50PiggdHJhaWw6IFRyYWlsLCB0eXBlOiBTdXBwb3J0ZWRFdmVudFR5cGVzLCBwb2ludGVyOiBQb2ludGVyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8RE9NRXZlbnQ+LCBidWJibGVzOiBib29sZWFuLCBmaXJlT25JbnB1dERpc2FibGVkID0gZmFsc2UgKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRXZlbnREaXNwYXRjaCAmJiBzY2VuZXJ5TG9nLkV2ZW50RGlzcGF0Y2goXHJcbiAgICAgIGAke3R5cGV9IHRyYWlsOiR7dHJhaWwudG9TdHJpbmcoKX0gcG9pbnRlcjoke3BvaW50ZXIudG9TdHJpbmcoKX0gYXQgJHtwb2ludGVyLnBvaW50ID8gcG9pbnRlci5wb2ludC50b1N0cmluZygpIDogJ251bGwnfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5FdmVudERpc3BhdGNoICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRyYWlsLCAnRmFsc3kgdHJhaWwgZm9yIGRpc3BhdGNoRXZlbnQnICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkV2ZW50UGF0aCAmJiBzY2VuZXJ5TG9nLkV2ZW50UGF0aCggYCR7dHlwZX0gJHt0cmFpbC50b1BhdGhTdHJpbmcoKX1gICk7XHJcblxyXG4gICAgLy8gTk9URTogZXZlbnQgaXMgbm90IGltbXV0YWJsZSwgYXMgaXRzIGN1cnJlbnRUYXJnZXQgY2hhbmdlc1xyXG4gICAgY29uc3QgaW5wdXRFdmVudCA9IG5ldyBTY2VuZXJ5RXZlbnQ8RE9NRXZlbnQ+KCB0cmFpbCwgdHlwZSwgcG9pbnRlciwgY29udGV4dCApO1xyXG5cclxuICAgIC8vIGZpcnN0IHJ1biB0aHJvdWdoIHRoZSBwb2ludGVyJ3MgbGlzdGVuZXJzIHRvIHNlZSBpZiBvbmUgb2YgdGhlbSB3aWxsIGhhbmRsZSB0aGUgZXZlbnRcclxuICAgIHRoaXMuZGlzcGF0Y2hUb0xpc3RlbmVyczxET01FdmVudD4oIHBvaW50ZXIsIHBvaW50ZXIuZ2V0TGlzdGVuZXJzKCksIHR5cGUsIGlucHV0RXZlbnQgKTtcclxuXHJcbiAgICAvLyBpZiBub3QgeWV0IGhhbmRsZWQsIHJ1biB0aHJvdWdoIHRoZSB0cmFpbCBpbiBvcmRlciB0byBzZWUgaWYgb25lIG9mIHRoZW0gd2lsbCBoYW5kbGUgdGhlIGV2ZW50XHJcbiAgICAvLyBhdCB0aGUgYmFzZSBvZiB0aGUgdHJhaWwgc2hvdWxkIGJlIHRoZSBzY2VuZSBub2RlLCBzbyB0aGUgc2NlbmUgd2lsbCBiZSBub3RpZmllZCBsYXN0XHJcbiAgICB0aGlzLmRpc3BhdGNoVG9UYXJnZXRzPERPTUV2ZW50PiggdHJhaWwsIHR5cGUsIHBvaW50ZXIsIGlucHV0RXZlbnQsIGJ1YmJsZXMsIGZpcmVPbklucHV0RGlzYWJsZWQgKTtcclxuXHJcbiAgICAvLyBOb3RpZnkgaW5wdXQgbGlzdGVuZXJzIG9uIHRoZSBEaXNwbGF5XHJcbiAgICB0aGlzLmRpc3BhdGNoVG9MaXN0ZW5lcnM8RE9NRXZlbnQ+KCBwb2ludGVyLCB0aGlzLmRpc3BsYXkuZ2V0SW5wdXRMaXN0ZW5lcnMoKSwgdHlwZSwgaW5wdXRFdmVudCApO1xyXG5cclxuICAgIC8vIE5vdGlmeSBpbnB1dCBsaXN0ZW5lcnMgdG8gYW55IERpc3BsYXlcclxuICAgIGlmICggRGlzcGxheS5pbnB1dExpc3RlbmVycy5sZW5ndGggKSB7XHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hUb0xpc3RlbmVyczxET01FdmVudD4oIHBvaW50ZXIsIERpc3BsYXkuaW5wdXRMaXN0ZW5lcnMuc2xpY2UoKSwgdHlwZSwgaW5wdXRFdmVudCApO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5FdmVudERpc3BhdGNoICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBOb3RpZmllcyBhbiBhcnJheSBvZiBsaXN0ZW5lcnMgd2l0aCBhIHNwZWNpZmljIGV2ZW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHBvaW50ZXJcclxuICAgKiBAcGFyYW0gbGlzdGVuZXJzIC0gU2hvdWxkIGJlIGEgZGVmZW5zaXZlIGFycmF5IGNvcHkgYWxyZWFkeS5cclxuICAgKiBAcGFyYW0gdHlwZVxyXG4gICAqIEBwYXJhbSBpbnB1dEV2ZW50XHJcbiAgICogQHBhcmFtIGNhcHR1cmUgLSBJZiB0cnVlLCB0aGlzIGRpc3BhdGNoIGlzIGluIHRoZSBjYXB0dXJlIHNlcXVlbmNlIChsaWtlIERPTSdzIGFkZEV2ZW50TGlzdGVuZXIgdXNlQ2FwdHVyZSkuXHJcbiAgICogICAgICAgICAgICAgICAgICBMaXN0ZW5lcnMgd2lsbCBvbmx5IGJlIGNhbGxlZCBpZiB0aGUgbGlzdGVuZXIgYWxzbyBpbmRpY2F0ZXMgaXQgaXMgZm9yIHRoZSBjYXB0dXJlIHNlcXVlbmNlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZGlzcGF0Y2hUb0xpc3RlbmVyczxET01FdmVudCBleHRlbmRzIEV2ZW50PiggcG9pbnRlcjogUG9pbnRlciwgbGlzdGVuZXJzOiBUSW5wdXRMaXN0ZW5lcltdLCB0eXBlOiBTdXBwb3J0ZWRFdmVudFR5cGVzLCBpbnB1dEV2ZW50OiBTY2VuZXJ5RXZlbnQ8RE9NRXZlbnQ+LCBjYXB0dXJlOiBib29sZWFuIHwgbnVsbCA9IG51bGwgKTogdm9pZCB7XHJcblxyXG4gICAgaWYgKCBpbnB1dEV2ZW50LmhhbmRsZWQgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzcGVjaWZpY1R5cGUgPSBwb2ludGVyLnR5cGUgKyB0eXBlIGFzIFN1cHBvcnRlZEV2ZW50VHlwZXM7IC8vIGUuZy4gbW91c2V1cCwgdG91Y2h1cFxyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbIGkgXTtcclxuXHJcbiAgICAgIGlmICggY2FwdHVyZSA9PT0gbnVsbCB8fCBjYXB0dXJlID09PSAhIWxpc3RlbmVyLmNhcHR1cmUgKSB7XHJcbiAgICAgICAgaWYgKCAhaW5wdXRFdmVudC5hYm9ydGVkICYmIGxpc3RlbmVyWyBzcGVjaWZpY1R5cGUgXSApIHtcclxuICAgICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5FdmVudERpc3BhdGNoICYmIHNjZW5lcnlMb2cuRXZlbnREaXNwYXRjaCggc3BlY2lmaWNUeXBlICk7XHJcbiAgICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRXZlbnREaXNwYXRjaCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAgICAgICAoIGxpc3RlbmVyWyBzcGVjaWZpY1R5cGUgXSBhcyBTY2VuZXJ5TGlzdGVuZXJGdW5jdGlvbjxET01FdmVudD4gKSggaW5wdXRFdmVudCApO1xyXG5cclxuICAgICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5FdmVudERpc3BhdGNoICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoICFpbnB1dEV2ZW50LmFib3J0ZWQgJiYgbGlzdGVuZXJbIHR5cGUgXSApIHtcclxuICAgICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5FdmVudERpc3BhdGNoICYmIHNjZW5lcnlMb2cuRXZlbnREaXNwYXRjaCggdHlwZSApO1xyXG4gICAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkV2ZW50RGlzcGF0Y2ggJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgICAgICAgKCBsaXN0ZW5lclsgdHlwZSBdIGFzIFNjZW5lcnlMaXN0ZW5lckZ1bmN0aW9uPERPTUV2ZW50PiApKCBpbnB1dEV2ZW50ICk7XHJcblxyXG4gICAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkV2ZW50RGlzcGF0Y2ggJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpc3BhdGNoIHRvIGFsbCBub2RlcyBpbiB0aGUgVHJhaWwsIG9wdGlvbmFsbHkgYnViYmxpbmcgZG93biBmcm9tIHRoZSBsZWFmIHRvIHRoZSByb290LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHRyYWlsXHJcbiAgICogQHBhcmFtIHR5cGVcclxuICAgKiBAcGFyYW0gcG9pbnRlclxyXG4gICAqIEBwYXJhbSBpbnB1dEV2ZW50XHJcbiAgICogQHBhcmFtIGJ1YmJsZXMgLSBJZiBidWJibGVzIGlzIGZhbHNlLCB0aGUgZXZlbnQgaXMgb25seSBkaXNwYXRjaGVkIHRvIHRoZSBsZWFmIG5vZGUgb2YgdGhlIHRyYWlsLlxyXG4gICAqIEBwYXJhbSBbZmlyZU9uSW5wdXREaXNhYmxlZF1cclxuICAgKi9cclxuICBwcml2YXRlIGRpc3BhdGNoVG9UYXJnZXRzPERPTUV2ZW50IGV4dGVuZHMgRXZlbnQ+KCB0cmFpbDogVHJhaWwsIHR5cGU6IFN1cHBvcnRlZEV2ZW50VHlwZXMsIHBvaW50ZXI6IFBvaW50ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRFdmVudDogU2NlbmVyeUV2ZW50PERPTUV2ZW50PiwgYnViYmxlczogYm9vbGVhbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJlT25JbnB1dERpc2FibGVkID0gZmFsc2UgKTogdm9pZCB7XHJcblxyXG4gICAgaWYgKCBpbnB1dEV2ZW50LmFib3J0ZWQgfHwgaW5wdXRFdmVudC5oYW5kbGVkICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaW5wdXRFbmFibGVkSW5kZXggPSB0cmFpbC5nZXRMYXN0SW5wdXRFbmFibGVkSW5kZXgoKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IHRyYWlsLm5vZGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgYnViYmxlcyA/IGktLSA6IGkgPSAtMSApIHtcclxuXHJcbiAgICAgIGNvbnN0IHRhcmdldCA9IHRyYWlsLm5vZGVzWyBpIF07XHJcblxyXG4gICAgICBjb25zdCB0cmFpbElucHV0RGlzYWJsZWQgPSBpbnB1dEVuYWJsZWRJbmRleCA8IGk7XHJcblxyXG4gICAgICBpZiAoIHRhcmdldC5pc0Rpc3Bvc2VkIHx8ICggIWZpcmVPbklucHV0RGlzYWJsZWQgJiYgdHJhaWxJbnB1dERpc2FibGVkICkgKSB7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlucHV0RXZlbnQuY3VycmVudFRhcmdldCA9IHRhcmdldDtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hUb0xpc3RlbmVyczxET01FdmVudD4oIHBvaW50ZXIsIHRhcmdldC5nZXRJbnB1dExpc3RlbmVycygpLCB0eXBlLCBpbnB1dEV2ZW50ICk7XHJcblxyXG4gICAgICAvLyBpZiB0aGUgaW5wdXQgZXZlbnQgd2FzIGFib3J0ZWQgb3IgaGFuZGxlZCwgZG9uJ3QgZm9sbG93IHRoZSB0cmFpbCBkb3duIGFub3RoZXIgbGV2ZWxcclxuICAgICAgaWYgKCBpbnB1dEV2ZW50LmFib3J0ZWQgfHwgaW5wdXRFdmVudC5oYW5kbGVkICkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBEaXNwbGF5IGlzIGFjY2Vzc2libGUgYW5kIHRoZSBlbGVtZW50IGlzIGEgZGVzY2VuZGFudCBvZiB0aGUgRGlzcGxheSBQRE9NLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgaXNUYXJnZXRVbmRlclBET00oIGVsZW1lbnQ6IEhUTUxFbGVtZW50ICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZGlzcGxheS5fYWNjZXNzaWJsZSAmJiB0aGlzLmRpc3BsYXkucGRvbVJvb3RFbGVtZW50IS5jb250YWlucyggZWxlbWVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2F2ZXMgdGhlIG1haW4gaW5mb3JtYXRpb24gd2UgY2FyZSBhYm91dCBmcm9tIGEgRE9NIGBFdmVudGAgaW50byBhIEpTT04tbGlrZSBzdHJ1Y3R1cmUuIFRvIHN1cHBvcnRcclxuICAgKiBwb2x5bW9ycGhpc20sIGFsbCBzdXBwb3J0ZWQgRE9NIGV2ZW50IGtleXMgdGhhdCBzY2VuZXJ5IHVzZXMgd2lsbCBhbHdheXMgYmUgaW5jbHVkZWQgaW4gdGhpcyBzZXJpYWxpemF0aW9uLiBJZlxyXG4gICAqIHRoZSBwYXJ0aWN1bGFyIEV2ZW50IGludGVyZmFjZSBmb3IgdGhlIGluc3RhbmNlIGJlaW5nIHNlcmlhbGl6ZWQgZG9lc24ndCBoYXZlIGEgY2VydGFpbiBwcm9wZXJ0eSwgdGhlbiBpdCB3aWxsIGJlXHJcbiAgICogc2V0IGFzIGBudWxsYC4gU2VlIGRvbUV2ZW50UHJvcGVydGllc1RvU2VyaWFsaXplIGZvciB0aGUgZnVsbCBsaXN0IG9mIHN1cHBvcnRlZCBFdmVudCBwcm9wZXJ0aWVzLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMgLSBzZWUgZG9tRXZlbnRQcm9wZXJ0aWVzVG9TZXJpYWxpemUgZm9yIGxpc3Qga2V5cyB0aGF0IGFyZSBzZXJpYWxpemVkXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBzZXJpYWxpemVEb21FdmVudCggZG9tRXZlbnQ6IEV2ZW50ICk6IFNlcmlhbGl6ZWRET01FdmVudCB7XHJcbiAgICBjb25zdCBlbnRyaWVzOiBTZXJpYWxpemVkRE9NRXZlbnQgPSB7XHJcbiAgICAgIGNvbnN0cnVjdG9yTmFtZTogZG9tRXZlbnQuY29uc3RydWN0b3IubmFtZVxyXG4gICAgfTtcclxuXHJcbiAgICBkb21FdmVudFByb3BlcnRpZXNUb1NlcmlhbGl6ZS5mb3JFYWNoKCBwcm9wZXJ0eSA9PiB7XHJcblxyXG4gICAgICBjb25zdCBkb21FdmVudFByb3BlcnR5OiBFdmVudFsga2V5b2YgRXZlbnQgXSB8IEVsZW1lbnQgPSBkb21FdmVudFsgcHJvcGVydHkgYXMga2V5b2YgRXZlbnQgXTtcclxuXHJcbiAgICAgIC8vIFdlIHNlcmlhbGl6ZSBtYW55IEV2ZW50IEFQSXMgaW50byBhIHNpbmdsZSBvYmplY3QsIHNvIGJlIGdyYWNlZnVsIGlmIHByb3BlcnRpZXMgZG9uJ3QgZXhpc3QuXHJcbiAgICAgIGlmICggZG9tRXZlbnRQcm9wZXJ0eSA9PT0gdW5kZWZpbmVkIHx8IGRvbUV2ZW50UHJvcGVydHkgPT09IG51bGwgKSB7XHJcbiAgICAgICAgZW50cmllc1sgcHJvcGVydHkgXSA9IG51bGw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGVsc2UgaWYgKCBkb21FdmVudFByb3BlcnR5IGluc3RhbmNlb2YgRWxlbWVudCAmJiBFVkVOVF9LRVlfVkFMVUVTX0FTX0VMRU1FTlRTLmluY2x1ZGVzKCBwcm9wZXJ0eSApICYmIHR5cGVvZiBkb21FdmVudFByb3BlcnR5LmdldEF0dHJpYnV0ZSA9PT0gJ2Z1bmN0aW9uJyAmJlxyXG5cclxuICAgICAgICAgICAgICAgIC8vIElmIGZhbHNlLCB0aGVuIHRoaXMgdGFyZ2V0IGlzbid0IGEgUERPTSBlbGVtZW50LCBzbyB3ZSBjYW4gc2tpcCB0aGlzIHNlcmlhbGl6YXRpb25cclxuICAgICAgICAgICAgICAgIGRvbUV2ZW50UHJvcGVydHkuaGFzQXR0cmlidXRlKCBQRE9NVXRpbHMuREFUQV9QRE9NX1VOSVFVRV9JRCApICkge1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgdGFyZ2V0IGNhbWUgZnJvbSB0aGUgYWNjZXNzaWJpbGl0eSBQRE9NLCB0aGVuIHdlIHdhbnQgdG8gc3RvcmUgdGhlIE5vZGUgdHJhaWwgaWQgb2Ygd2hlcmUgaXQgY2FtZSBmcm9tLlxyXG4gICAgICAgIGVudHJpZXNbIHByb3BlcnR5IF0gPSB7XHJcbiAgICAgICAgICBbIFBET01VdGlscy5EQVRBX1BET01fVU5JUVVFX0lEIF06IGRvbUV2ZW50UHJvcGVydHkuZ2V0QXR0cmlidXRlKCBQRE9NVXRpbHMuREFUQV9QRE9NX1VOSVFVRV9JRCApLFxyXG5cclxuICAgICAgICAgIC8vIEhhdmUgdGhlIElEIGFsc29cclxuICAgICAgICAgIGlkOiBkb21FdmVudFByb3BlcnR5LmdldEF0dHJpYnV0ZSggJ2lkJyApXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gUGFyc2UgdG8gZ2V0IHJpZCBvZiBmdW5jdGlvbnMgYW5kIGNpcmN1bGFyIHJlZmVyZW5jZXMuXHJcbiAgICAgICAgZW50cmllc1sgcHJvcGVydHkgXSA9ICggKCB0eXBlb2YgZG9tRXZlbnRQcm9wZXJ0eSA9PT0gJ29iamVjdCcgKSA/IHt9IDogSlNPTi5wYXJzZSggSlNPTi5zdHJpbmdpZnkoIGRvbUV2ZW50UHJvcGVydHkgKSApICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICByZXR1cm4gZW50cmllcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZyb20gYSBzZXJpYWxpemVkIGRvbSBldmVudCwgcmV0dXJuIGEgcmVjcmVhdGVkIHdpbmRvdy5FdmVudCAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGRlc2VyaWFsaXplRG9tRXZlbnQoIGV2ZW50T2JqZWN0OiBTZXJpYWxpemVkRE9NRXZlbnQgKTogRXZlbnQge1xyXG4gICAgY29uc3QgY29uc3RydWN0b3JOYW1lID0gZXZlbnRPYmplY3QuY29uc3RydWN0b3JOYW1lIHx8ICdFdmVudCc7XHJcblxyXG4gICAgY29uc3QgY29uZmlnRm9yQ29uc3RydWN0b3IgPSBfLnBpY2soIGV2ZW50T2JqZWN0LCBkb21FdmVudFByb3BlcnRpZXNTZXRJbkNvbnN0cnVjdG9yICk7XHJcbiAgICAvLyBzZXJpYWxpemUgdGhlIHJlbGF0ZWRUYXJnZXQgYmFjayBpbnRvIGFuIGV2ZW50IE9iamVjdCwgc28gdGhhdCBpdCBjYW4gYmUgcGFzc2VkIHRvIHRoZSBpbml0IGNvbmZpZyBpbiB0aGUgRXZlbnRcclxuICAgIC8vIGNvbnN0cnVjdG9yXHJcbiAgICBpZiAoIGNvbmZpZ0ZvckNvbnN0cnVjdG9yLnJlbGF0ZWRUYXJnZXQgKSB7XHJcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgICAgY29uc3QgaHRtbEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggY29uZmlnRm9yQ29uc3RydWN0b3IucmVsYXRlZFRhcmdldC5pZCApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBodG1sRWxlbWVudCwgJ2Nhbm5vdCBkZXNlcmlhbGl6ZSBldmVudCB3aGVuIHJlbGF0ZWQgdGFyZ2V0IGlzIG5vdCBpbiB0aGUgRE9NLicgKTtcclxuICAgICAgY29uZmlnRm9yQ29uc3RydWN0b3IucmVsYXRlZFRhcmdldCA9IGh0bWxFbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgIGNvbnN0IGRvbUV2ZW50OiBFdmVudCA9IG5ldyB3aW5kb3dbIGNvbnN0cnVjdG9yTmFtZSBdKCBjb25zdHJ1Y3Rvck5hbWUsIGNvbmZpZ0ZvckNvbnN0cnVjdG9yICk7XHJcblxyXG4gICAgZm9yICggY29uc3Qga2V5IGluIGV2ZW50T2JqZWN0ICkge1xyXG5cclxuICAgICAgLy8gYHR5cGVgIGlzIHJlYWRvbmx5LCBzbyBkb24ndCB0cnkgdG8gc2V0IGl0LlxyXG4gICAgICBpZiAoIGV2ZW50T2JqZWN0Lmhhc093blByb3BlcnR5KCBrZXkgKSAmJiAhKCBkb21FdmVudFByb3BlcnRpZXNTZXRJbkNvbnN0cnVjdG9yIGFzIHN0cmluZ1tdICkuaW5jbHVkZXMoIGtleSApICkge1xyXG5cclxuICAgICAgICAvLyBTcGVjaWFsIGNhc2UgZm9yIHRhcmdldCBzaW5jZSB3ZSBjYW4ndCBzZXQgdGhhdCByZWFkLW9ubHkgcHJvcGVydHkuIEluc3RlYWQgdXNlIGEgc3Vic3RpdHV0ZSBrZXkuXHJcbiAgICAgICAgaWYgKCBrZXkgPT09ICd0YXJnZXQnICkge1xyXG5cclxuICAgICAgICAgIGlmICggYXNzZXJ0ICkge1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBldmVudE9iamVjdC50YXJnZXQgYXMgeyBpZD86IHN0cmluZyB9IHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBpZiAoIHRhcmdldCAmJiB0YXJnZXQuaWQgKSB7XHJcbiAgICAgICAgICAgICAgYXNzZXJ0KCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggdGFyZ2V0LmlkICksICd0YXJnZXQgc2hvdWxkIGV4aXN0IGluIHRoZSBQRE9NIHRvIHN1cHBvcnQgcGxheWJhY2suJyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICAgICAgZG9tRXZlbnRbIFRBUkdFVF9TVUJTVElUVVRFX0tFWSBdID0gXy5jbG9uZSggZXZlbnRPYmplY3RbIGtleSBdICkgfHwge307XHJcblxyXG4gICAgICAgICAgLy8gVGhpcyBtYXkgbm90IGJlIG5lZWRlZCBzaW5jZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTI5NiBpcyBjb21wbGV0ZSwgZG91YmxlIGNoZWNrIG9uIGdldFRyYWlsRnJvbVBET01FdmVudCgpIHRvb1xyXG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICAgICAgZG9tRXZlbnRbIFRBUkdFVF9TVUJTVElUVVRFX0tFWSBdLmdldEF0dHJpYnV0ZSA9IGZ1bmN0aW9uKCBrZXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzWyBrZXkgXTtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgICAgICAgIGRvbUV2ZW50WyBrZXkgXSA9IGV2ZW50T2JqZWN0WyBrZXkgXTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBkb21FdmVudDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlbmllbmNlIGZ1bmN0aW9uIGZvciBsb2dnaW5nIG91dCBhIHBvaW50L2V2ZW50IGNvbWJpbmF0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHBvaW50IC0gTm90IGxvZ2dlZCBpZiBudWxsXHJcbiAgICogQHBhcmFtIGRvbUV2ZW50XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgZGVidWdUZXh0KCBwb2ludDogVmVjdG9yMiB8IG51bGwsIGRvbUV2ZW50OiBFdmVudCApOiBzdHJpbmcge1xyXG4gICAgbGV0IHJlc3VsdCA9IGAke2RvbUV2ZW50LnRpbWVTdGFtcH0gJHtkb21FdmVudC50eXBlfWA7XHJcbiAgICBpZiAoIHBvaW50ICE9PSBudWxsICkge1xyXG4gICAgICByZXN1bHQgPSBgJHtwb2ludC54fSwke3BvaW50Lnl9ICR7cmVzdWx0fWA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFwcyB0aGUgY3VycmVudCBNUyBwb2ludGVyIHR5cGVzIG9udG8gdGhlIHBvaW50ZXIgc3BlYy4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBtc1BvaW50ZXJUeXBlKCBldmVudDogUG9pbnRlckV2ZW50ICk6IHN0cmluZyB7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0tIGxlZ2FjeSBBUElcclxuICAgIGlmICggZXZlbnQucG9pbnRlclR5cGUgPT09IHdpbmRvdy5NU1BvaW50ZXJFdmVudC5NU1BPSU5URVJfVFlQRV9UT1VDSCApIHtcclxuICAgICAgcmV0dXJuICd0b3VjaCc7XHJcbiAgICB9XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0tIGxlZ2FjeSBBUElcclxuICAgIGVsc2UgaWYgKCBldmVudC5wb2ludGVyVHlwZSA9PT0gd2luZG93Lk1TUG9pbnRlckV2ZW50Lk1TUE9JTlRFUl9UWVBFX1BFTiApIHtcclxuICAgICAgcmV0dXJuICdwZW4nO1xyXG4gICAgfVxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtLSBsZWdhY3kgQVBJXHJcbiAgICBlbHNlIGlmICggZXZlbnQucG9pbnRlclR5cGUgPT09IHdpbmRvdy5NU1BvaW50ZXJFdmVudC5NU1BPSU5URVJfVFlQRV9NT1VTRSApIHtcclxuICAgICAgcmV0dXJuICdtb3VzZSc7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIGV2ZW50LnBvaW50ZXJUeXBlOyAvLyBob3BlIGZvciB0aGUgYmVzdFxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ0lucHV0JywgSW5wdXQgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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