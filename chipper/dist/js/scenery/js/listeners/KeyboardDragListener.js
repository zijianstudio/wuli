// Copyright 2019-2023, University of Colorado Boulder

/**
 * A general type for keyboard dragging. Objects can be dragged in one or two dimensions with the arrow keys and with
 * the WASD keys. See the option keyboardDragDirection for a description of how keyboard keys can be mapped to
 * motion for 1D and 2D motion. This can be added to a node through addInputListener for accessibility, which is mixed
 * into Nodes with the ParallelDOM trait.
 *
 * JavaScript does not natively handle multiple 'keydown' events at once, so we have a custom implementation that
 * tracks which keys are down and for how long in a step() function. To support keydown timing, AXON/timer is used. In
 * scenery this is supported via Display.updateOnRequestAnimationFrame(), which will step the time on each frame.
 * If using KeyboardDragListener in a more customized Display, like done in phetsims (see JOIST/Sim), the time must be
 * manually stepped (by emitting the timer).
 *
 * For the purposes of this file, a "hotkey" is a collection of keys that, when pressed together in the right
 * order, fire a callback.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Barlow
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import PhetioAction from '../../../tandem/js/PhetioAction.js';
import EnabledComponent from '../../../axon/js/EnabledComponent.js';
import Emitter from '../../../axon/js/Emitter.js';
import Property from '../../../axon/js/Property.js';
import stepTimer from '../../../axon/js/stepTimer.js';
import Transform3 from '../../../dot/js/Transform3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import platform from '../../../phet-core/js/platform.js';
import EventType from '../../../tandem/js/EventType.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { KeyboardUtils, scenery, SceneryEvent } from '../imports.js';
import optionize from '../../../phet-core/js/optionize.js';
import assertMutuallyExclusiveOptions from '../../../phet-core/js/assertMutuallyExclusiveOptions.js';

// Possible movement types for this KeyboardDragListener. 2D motion ('both') or 1D motion ('leftRight' or 'upDown').

const KEYBOARD_DRAG_DIRECTION_KEY_MAP = new Map([['both', {
  left: [KeyboardUtils.KEY_A, KeyboardUtils.KEY_LEFT_ARROW],
  right: [KeyboardUtils.KEY_RIGHT_ARROW, KeyboardUtils.KEY_D],
  up: [KeyboardUtils.KEY_UP_ARROW, KeyboardUtils.KEY_W],
  down: [KeyboardUtils.KEY_DOWN_ARROW, KeyboardUtils.KEY_S]
}], ['leftRight', {
  left: [KeyboardUtils.KEY_A, KeyboardUtils.KEY_LEFT_ARROW, KeyboardUtils.KEY_DOWN_ARROW, KeyboardUtils.KEY_S],
  right: [KeyboardUtils.KEY_RIGHT_ARROW, KeyboardUtils.KEY_D, KeyboardUtils.KEY_UP_ARROW, KeyboardUtils.KEY_W],
  up: [],
  down: []
}], ['upDown', {
  left: [],
  right: [],
  up: [KeyboardUtils.KEY_RIGHT_ARROW, KeyboardUtils.KEY_D, KeyboardUtils.KEY_UP_ARROW, KeyboardUtils.KEY_W],
  down: [KeyboardUtils.KEY_A, KeyboardUtils.KEY_LEFT_ARROW, KeyboardUtils.KEY_DOWN_ARROW, KeyboardUtils.KEY_S]
}]]);
class KeyboardDragListener extends EnabledComponent {
  // See options for documentation

  // Tracks the state of the keyboard. JavaScript doesn't handle multiple key presses, so we track which keys are
  // currently down and update based on state of this collection of objects.
  // TODO: Consider a global state object for this, see https://github.com/phetsims/scenery/issues/1054
  // A list of hotkeys, each of which has some behavior when each individual key of the hotkey is pressed in order.
  // See this.addHotkey() for more information.
  // The Hotkey that is currently down
  // When a hotkey group is pressed down, dragging will be disabled until any keys are up again
  // Delay before calling a Hotkey listener (if all Hotkeys are being held down), incremented in step. In milliseconds.
  // Counters to allow for press-and-hold functionality that enables user to incrementally move the draggable object or
  // hold the movement key for continuous or stepped movement - values in ms
  // Variable to determine when the initial delay is complete
  // Fires to conduct the start and end of a drag, added for PhET-iO interoperability
  // @deprecated - Use the drag option instead.
  // Implements disposal
  // A listener added to the pointer when dragging starts so that we can attach a listener and provide a channel of
  // communication to the AnimatedPanZoomListener to define custom behavior for screen panning during a drag operation.
  // A reference to the Pointer during a drag operation so that we can add/remove the _pointerListener.
  // Whether we are using a velocity implementation or delta implementation for dragging. See options
  // dragDelta and dragVelocity for more information.
  constructor(providedOptions) {
    // Use either dragVelocity or dragDelta, cannot use both at the same time.
    assert && assertMutuallyExclusiveOptions(providedOptions, ['dragVelocity', 'shiftDragVelocity'], ['dragDelta', 'shiftDragDelta']);
    assert && assertMutuallyExclusiveOptions(providedOptions, ['mapPosition'], ['dragBoundsProperty']);
    const options = optionize()({
      // default moves the object roughly 600 view coordinates every second, assuming 60 fps
      dragDelta: 10,
      shiftDragDelta: 5,
      dragVelocity: 0,
      shiftDragVelocity: 0,
      keyboardDragDirection: 'both',
      positionProperty: null,
      transform: null,
      dragBoundsProperty: null,
      mapPosition: null,
      start: null,
      drag: null,
      end: null,
      moveOnHoldDelay: 0,
      moveOnHoldInterval: 1000 / 60,
      // an average dt value at 60 frames a second
      hotkeyHoldInterval: 800,
      phetioEnabledPropertyInstrumented: false,
      tandem: Tandem.REQUIRED,
      // DragListener by default doesn't allow PhET-iO to trigger drag Action events
      phetioReadOnly: true
    }, providedOptions);
    assert && assert(options.shiftDragVelocity <= options.dragVelocity, 'shiftDragVelocity should be less than or equal to shiftDragVelocity, it is intended to provide more fine-grained control');
    assert && assert(options.shiftDragDelta <= options.dragDelta, 'shiftDragDelta should be less than or equal to dragDelta, it is intended to provide more fine-grained control');
    super(options);

    // mutable attributes declared from options, see options for info, as well as getters and setters
    this._start = options.start;
    this._drag = options.drag;
    this._end = options.end;
    this._dragBoundsProperty = options.dragBoundsProperty || new Property(null);
    this._mapPosition = options.mapPosition;
    this._transform = options.transform;
    this._positionProperty = options.positionProperty;
    this._dragVelocity = options.dragVelocity;
    this._shiftDragVelocity = options.shiftDragVelocity;
    this._dragDelta = options.dragDelta;
    this._shiftDragDelta = options.shiftDragDelta;
    this._moveOnHoldDelay = options.moveOnHoldDelay;
    this.moveOnHoldInterval = options.moveOnHoldInterval;
    this._hotkeyHoldInterval = options.hotkeyHoldInterval;
    this._keyboardDragDirection = options.keyboardDragDirection;
    this.keyState = [];
    this._hotkeys = [];
    this.currentHotkey = null;
    this.hotkeyDisablingDragging = false;

    // This is initialized to the "threshold" so that the first hotkey will fire immediately. Only subsequent actions
    // while holding the hotkey should result in a delay of this much. in ms
    this.hotkeyHoldIntervalCounter = this._hotkeyHoldInterval;

    // for readability - since dragVelocity and dragDelta are mutually exclusive, a value for either one of these
    // indicates dragging implementation should use velocity
    this.useDragVelocity = options.dragVelocity > 0 || options.shiftDragVelocity > 0;
    this.moveOnHoldDelayCounter = 0;
    this.moveOnHoldIntervalCounter = 0;
    this.delayComplete = false;
    this.dragStartAction = new PhetioAction(event => {
      const key = KeyboardUtils.getEventCode(event.domEvent);
      assert && assert(key, 'How can we have a null key for KeyboardDragListener?');

      // If there are no movement keys down, attach a listener to the Pointer that will tell the AnimatedPanZoomListener
      // to keep this Node in view
      if (!this.movementKeysDown && KeyboardUtils.isMovementKey(event.domEvent)) {
        assert && assert(this._pointer === null, 'We should have cleared the Pointer reference by now.');
        this._pointer = event.pointer;
        event.pointer.addInputListener(this._pointerListener, true);
      }

      // update the key state
      this.keyState.push({
        keyDown: true,
        key: key,
        timeDown: 0 // in ms
      });

      if (this._start) {
        if (this.movementKeysDown) {
          this._start(event);
        }
      }

      // initial movement on down should only be used for dragDelta implementation
      if (!this.useDragVelocity) {
        // move object on first down before a delay
        const positionDelta = this.shiftKeyDown() ? this._shiftDragDelta : this._dragDelta;
        this.updatePosition(positionDelta);
        this.moveOnHoldIntervalCounter = 0;
      }
    }, {
      parameters: [{
        name: 'event',
        phetioType: SceneryEvent.SceneryEventIO
      }],
      tandem: options.tandem.createTandem('dragStartAction'),
      phetioDocumentation: 'Emits whenever a keyboard drag starts.',
      phetioReadOnly: options.phetioReadOnly,
      phetioEventType: EventType.USER
    });

    // Emits an event every drag
    // @deprecated - Use the drag option instead
    this.dragEmitter = new Emitter({
      tandem: options.tandem.createTandem('dragEmitter'),
      phetioHighFrequency: true,
      phetioDocumentation: 'Emits whenever a keyboard drag occurs.',
      phetioReadOnly: options.phetioReadOnly,
      phetioEventType: EventType.USER
    });
    this.dragEndAction = new PhetioAction(event => {
      // If there are no movement keys down, attach a listener to the Pointer that will tell the AnimatedPanZoomListener
      // to keep this Node in view
      if (!this.movementKeysDown) {
        assert && assert(event.pointer === this._pointer, 'How could the event Pointer be anything other than this PDOMPointer?');
        this._pointer.removeInputListener(this._pointerListener);
        this._pointer = null;
      }
      this._end && this._end(event);
    }, {
      parameters: [{
        name: 'event',
        phetioType: SceneryEvent.SceneryEventIO
      }],
      tandem: options.tandem.createTandem('dragEndAction'),
      phetioDocumentation: 'Emits whenever a keyboard drag ends.',
      phetioReadOnly: options.phetioReadOnly,
      phetioEventType: EventType.USER
    });

    // step the drag listener, must be removed in dispose
    const stepListener = this.step.bind(this);
    stepTimer.addListener(stepListener);
    this.enabledProperty.lazyLink(this.onEnabledPropertyChange.bind(this));
    this._pointerListener = {
      listener: this,
      interrupt: this.interrupt.bind(this)
    };
    this._pointer = null;

    // called in dispose
    this._disposeKeyboardDragListener = () => {
      stepTimer.removeListener(stepListener);
    };
  }

  /**
   * Returns the drag bounds in model coordinates.
   */
  getDragBounds() {
    return this._dragBoundsProperty.value;
  }
  get dragBounds() {
    return this.getDragBounds();
  }

  /**
   * Sets the drag transform of the listener.
   */
  setTransform(transform) {
    this._transform = transform;
  }
  set transform(transform) {
    this.setTransform(transform);
  }
  get transform() {
    return this.getTransform();
  }

  /**
   * Returns the transform of the listener.
   */
  getTransform() {
    return this._transform;
  }

  /**
   * Getter for the dragVelocity property, see options.dragVelocity for more info.
   */
  get dragVelocity() {
    return this._dragVelocity;
  }

  /**
   * Setter for the dragVelocity property, see options.dragVelocity for more info.
   */
  set dragVelocity(dragVelocity) {
    this._dragVelocity = dragVelocity;
  }

  /**
   * Getter for the shiftDragVelocity property, see options.shiftDragVelocity for more info.
   */
  get shiftDragVelocity() {
    return this._shiftDragVelocity;
  }

  /**
   * Setter for the shiftDragVelocity property, see options.shiftDragVelocity for more info.
   */
  set shiftDragVelocity(shiftDragVelocity) {
    this._shiftDragVelocity = shiftDragVelocity;
  }

  /**
   * Getter for the dragDelta property, see options.dragDelta for more info.
   */
  get dragDelta() {
    return this._dragDelta;
  }

  /**
   * Setter for the dragDelta property, see options.dragDelta for more info.
   */
  set dragDelta(dragDelta) {
    this._dragDelta = dragDelta;
  }

  /**
   * Getter for the shiftDragDelta property, see options.shiftDragDelta for more info.
   */
  get shiftDragDelta() {
    return this._shiftDragDelta;
  }

  /**
   * Setter for the shiftDragDelta property, see options.shiftDragDelta for more info.
   */
  set shiftDragDelta(shiftDragDelta) {
    this._shiftDragDelta = shiftDragDelta;
  }

  /**
   * Getter for the moveOnHoldDelay property, see options.moveOnHoldDelay for more info.
   */
  get moveOnHoldDelay() {
    return this._moveOnHoldDelay;
  }

  /**
   * Setter for the moveOnHoldDelay property, see options.moveOnHoldDelay for more info.
   */
  set moveOnHoldDelay(moveOnHoldDelay) {
    this._moveOnHoldDelay = moveOnHoldDelay;
  }

  /**
   * Getter for the moveOnHoldInterval property, see options.moveOnHoldInterval for more info.
   */
  get moveOnHoldInterval() {
    return this._moveOnHoldInterval;
  }

  /**
   * Setter for the moveOnHoldInterval property, see options.moveOnHoldInterval for more info.
   */
  set moveOnHoldInterval(moveOnHoldInterval) {
    assert && assert(moveOnHoldInterval > 0, 'if the moveOnHoldInterval is 0, then the dragging will be ' + 'dependent on how often the dragListener is stepped');
    this._moveOnHoldInterval = moveOnHoldInterval;
  }

  /**
   * Getter for the hotkeyHoldInterval property, see options.hotkeyHoldInterval for more info.
   */
  get hotkeyHoldInterval() {
    return this._hotkeyHoldInterval;
  }

  /**
   * Setter for the hotkeyHoldInterval property, see options.hotkeyHoldInterval for more info.
   */
  set hotkeyHoldInterval(hotkeyHoldInterval) {
    this._hotkeyHoldInterval = hotkeyHoldInterval;
  }
  get isPressed() {
    return !!this._pointer;
  }

  /**
   * Get the current target Node of the drag.
   */
  getCurrentTarget() {
    assert && assert(this.isPressed, 'We have no currentTarget if we are not pressed');
    assert && assert(this._pointer && this._pointer.trail, 'Must have a Pointer with an active trail if we are pressed');
    return this._pointer.trail.lastNode();
  }

  /**
   * Fired when the enabledProperty changes
   */
  onEnabledPropertyChange(enabled) {
    !enabled && this.interrupt();
  }

  /**
   * Implements keyboard dragging when listener is attached to the Node, public because this is called as part of
   * the Scenery Input API, but clients should not call this directly.
   */
  keydown(event) {
    const domEvent = event.domEvent;
    const key = KeyboardUtils.getEventCode(domEvent);
    assert && assert(key, 'How can we have a null key from a keydown in KeyboardDragListener?');

    // If the meta key is down (command key/windows key) prevent movement and do not preventDefault.
    // Meta key + arrow key is a command to go back a page, and we need to allow that. But also, macOS
    // fails to provide keyup events once the meta key is pressed, see
    // http://web.archive.org/web/20160304022453/http://bitspushedaround.com/on-a-few-things-you-may-not-know-about-the-hellish-command-key-and-javascript-events/
    if (domEvent.metaKey) {
      return;
    }

    // required to work with Safari and VoiceOver, otherwise arrow keys will move virtual cursor, see https://github.com/phetsims/balloons-and-static-electricity/issues/205#issuecomment-263428003
    // prevent default for WASD too, see https://github.com/phetsims/friction/issues/167
    if (KeyboardUtils.isMovementKey(domEvent)) {
      domEvent.preventDefault();
    }

    // reserve keyboard events for dragging to prevent default panning behavior with zoom features
    event.pointer.reserveForKeyboardDrag();

    // if the key is already down, don't do anything else (we don't want to create a new keystate object
    // for a key that is already being tracked and down, nor call startDrag every keydown event)
    if (this.keyInListDown([key])) {
      return;
    }

    // Prevent a VoiceOver bug where pressing multiple arrow keys at once causes the AT to send the wrong keys
    // through the keyup event - as a workaround, we only allow one arrow key to be down at a time. If two are pressed
    // down, we immediately clear the keystate and return
    // see https://github.com/phetsims/balloons-and-static-electricity/issues/384
    if (platform.safari) {
      if (KeyboardUtils.isArrowKey(domEvent)) {
        if (this.keyInListDown([KeyboardUtils.KEY_RIGHT_ARROW, KeyboardUtils.KEY_LEFT_ARROW, KeyboardUtils.KEY_UP_ARROW, KeyboardUtils.KEY_DOWN_ARROW])) {
          this.interrupt();
          return;
        }
      }
    }
    this.canDrag() && this.dragStartAction.execute(event);
  }

  /**
   * Behavior for keyboard 'up' DOM event. Public so it can be attached with addInputListener()
   *
   * Note that this event is assigned in the constructor, and not to the prototype. As of writing this,
   * `Node.addInputListener` only supports type properties as event listeners, and not the event keys as
   * prototype methods. Please see https://github.com/phetsims/scenery/issues/851 for more information.
   */
  keyup(event) {
    const domEvent = event.domEvent;
    const key = KeyboardUtils.getEventCode(domEvent);
    const moveKeysDown = this.movementKeysDown;

    // if the shift key is down when we navigate to the object, add it to the keystate because it won't be added until
    // the next keydown event
    if (key === KeyboardUtils.KEY_TAB) {
      if (domEvent.shiftKey) {
        // add 'shift' to the keystate until it is released again
        this.keyState.push({
          keyDown: true,
          key: KeyboardUtils.KEY_SHIFT_LEFT,
          timeDown: 0 // in ms
        });
      }
    }

    for (let i = 0; i < this.keyState.length; i++) {
      if (key === this.keyState[i].key) {
        this.keyState.splice(i, 1);
      }
    }
    const moveKeysStillDown = this.movementKeysDown;

    // if movement keys are no longer down after keyup, call the optional end drag function
    if (!moveKeysStillDown && moveKeysDown !== moveKeysStillDown) {
      this.dragEndAction.execute(event);
    }

    // if any current hotkey keys are no longer down, clear out the current hotkey and reset.
    if (this.currentHotkey && !this.allKeysInListDown(this.currentHotkey.keys)) {
      this.resetHotkeyState();
    }
    this.resetPressAndHold();
  }

  /**
   * Interrupts and resets the listener on blur so that listener state is reset and keys are removed from the keyState
   * array. Public because this is called with the scenery listener API. Clients should not call this directly.
   *
   * focusout bubbles, which is important so that the work of interrupt happens as focus moves between children of
   * a parent with a KeyboardDragListener, which can create state for the keystate.
   * See https://github.com/phetsims/scenery/issues/1461.
   */
  focusout(event) {
    this.interrupt();
  }

  /**
   * Step function for the drag handler. JavaScript does not natively handle multiple keydown events at once,
   * so we need to track the state of the keyboard in an Object and manage dragging in this function.
   * In order for the drag handler to work.
   *
   * @param dt - in seconds
   */
  step(dt) {
    // dt is in seconds and we convert to ms
    const ms = dt * 1000;

    // no-op unless a key is down
    if (this.keyState.length > 0) {
      // for each key that is still down, increment the tracked time that has been down
      for (let i = 0; i < this.keyState.length; i++) {
        if (this.keyState[i].keyDown) {
          this.keyState[i].timeDown += ms;
        }
      }

      // Movement delay counters should only increment if movement keys are pressed down. They will get reset
      // every up event.
      if (this.movementKeysDown) {
        this.moveOnHoldDelayCounter += ms;
        this.moveOnHoldIntervalCounter += ms;
      }

      // update timer for keygroup if one is being held down
      if (this.currentHotkey) {
        this.hotkeyHoldIntervalCounter += ms;
      }
      let positionDelta = 0;
      if (this.useDragVelocity) {
        // calculate change in position from time step
        const positionVelocitySeconds = this.shiftKeyDown() ? this._shiftDragVelocity : this._dragVelocity;
        const positionVelocityMilliseconds = positionVelocitySeconds / 1000;
        positionDelta = ms * positionVelocityMilliseconds;
      } else {
        // If dragging by deltas, we are only movable every moveOnHoldInterval.
        let movable = false;

        // Wait for a longer delay (moveOnHoldDelay) on initial press and hold.
        if (this.moveOnHoldDelayCounter >= this._moveOnHoldDelay && !this.delayComplete) {
          movable = true;
          this.delayComplete = true;
          this.moveOnHoldIntervalCounter = 0;
        }

        // Initial delay is complete, now we will move every moveOnHoldInterval
        if (this.delayComplete && this.moveOnHoldIntervalCounter >= this._moveOnHoldInterval) {
          movable = true;

          // If updating as a result of the moveOnHoldIntervalCounter, don't automatically throw away any "remainder"
          // time by setting back to 0. We want to accumulate them so that, no matter the clock speed of the
          // runtime, the long-term effect of the drag is consistent.
          const overflowTime = this.moveOnHoldIntervalCounter - this._moveOnHoldInterval; // ms

          // This doesn't take into account if 2 updatePosition calls should occur based on the current timing.
          this.moveOnHoldIntervalCounter = overflowTime;
        }
        positionDelta = movable ? this.shiftKeyDown() ? this._shiftDragDelta : this._dragDelta : 0;
      }
      if (positionDelta > 0) {
        this.updatePosition(positionDelta);
      }
    }
  }

  /**
   * Returns true if a drag can begin from input with this listener.
   */
  canDrag() {
    return this.enabledProperty.value;
  }

  /**
   * Update the state of hotkeys, and fire hotkey callbacks if one is active.
   */
  updateHotkeys() {
    // check to see if any hotkey combinations are down
    for (let j = 0; j < this._hotkeys.length; j++) {
      const hotkeysDownList = [];
      const keys = this._hotkeys[j].keys;
      for (let k = 0; k < keys.length; k++) {
        for (let l = 0; l < this.keyState.length; l++) {
          if (this.keyState[l].key === keys[k]) {
            hotkeysDownList.push(this.keyState[l]);
          }
        }
      }

      // There is only a single hotkey and it is down, the hotkeys must be in order
      let keysInOrder = hotkeysDownList.length === 1 && keys.length === 1;

      // the hotkeysDownList array order should match the order of the key group, so now we just need to make
      // sure that the key down times are in the right order
      for (let m = 0; m < hotkeysDownList.length - 1; m++) {
        if (hotkeysDownList[m + 1] && hotkeysDownList[m].timeDown > hotkeysDownList[m + 1].timeDown) {
          keysInOrder = true;
        }
      }

      // if keys are in order, call the callback associated with the group, and disable dragging until
      // all hotkeys associated with that group are up again
      if (keysInOrder) {
        this.currentHotkey = this._hotkeys[j];
        if (this.hotkeyHoldIntervalCounter >= this._hotkeyHoldInterval) {
          // Set the counter to begin counting the next interval between hotkey activations.
          this.hotkeyHoldIntervalCounter = 0;

          // call the callback last, after internal state has been updated. This solves a bug caused if this callback
          // then makes this listener interrupt.
          this._hotkeys[j].callback();
        }
      }
    }

    // if a key group is down, check to see if any of those keys are still down - if so, we will disable dragging
    // until all of them are up
    if (this.currentHotkey) {
      if (this.keyInListDown(this.currentHotkey.keys)) {
        this.hotkeyDisablingDragging = true;
      } else {
        this.hotkeyDisablingDragging = false;

        // keys are no longer down, clear the group
        this.currentHotkey = null;
      }
    }
  }

  /**
   * Handle the actual change in position of associated object based on currently pressed keys. Called in step function
   * and keydown listener.
   *
   * @param delta - potential change in position in x and y for the position Property
   */
  updatePosition(delta) {
    // hotkeys may disable dragging, so do this first
    this.updateHotkeys();
    if (!this.hotkeyDisablingDragging) {
      // handle the change in position
      let deltaX = 0;
      let deltaY = 0;
      if (this.leftMovementKeysDown()) {
        deltaX -= delta;
      }
      if (this.rightMovementKeysDown()) {
        deltaX += delta;
      }
      if (this.upMovementKeysDown()) {
        deltaY -= delta;
      }
      if (this.downMovementKeysDown()) {
        deltaY += delta;
      }

      // only initiate move if there was some attempted keyboard drag
      let vectorDelta = new Vector2(deltaX, deltaY);
      if (!vectorDelta.equals(Vector2.ZERO)) {
        // to model coordinates
        if (this._transform) {
          const transform = this._transform instanceof Transform3 ? this._transform : this._transform.value;
          vectorDelta = transform.inverseDelta2(vectorDelta);
        }

        // synchronize with model position
        if (this._positionProperty) {
          let newPosition = this._positionProperty.get().plus(vectorDelta);
          newPosition = this.mapModelPoint(newPosition);

          // update the position if it is different
          if (!newPosition.equals(this._positionProperty.get())) {
            this._positionProperty.set(newPosition);
          }
        }

        // call our drag function
        if (this._drag) {
          this._drag(vectorDelta, this);
        }
        this.dragEmitter.emit();
      }
    }
  }

  /**
   * Apply a mapping from the drag target's model position to an allowed model position.
   *
   * A common example is using dragBounds, where the position of the drag target is constrained to within a bounding
   * box. This is done by mapping points outside the bounding box to the closest position inside the box. More
   * general mappings can be used.
   *
   * Should be overridden (or use mapPosition) if a custom transformation is needed.
   *
   * @returns - A point in the model coordinate frame
   */
  mapModelPoint(modelPoint) {
    if (this._mapPosition) {
      return this._mapPosition(modelPoint);
    } else if (this._dragBoundsProperty.value) {
      return this._dragBoundsProperty.value.closestPointTo(modelPoint);
    } else {
      return modelPoint;
    }
  }

  /**
   * Returns true if any of the keys in the list are currently down.
   */
  keyInListDown(keys) {
    let keyIsDown = false;
    for (let i = 0; i < this.keyState.length; i++) {
      if (this.keyState[i].keyDown) {
        for (let j = 0; j < keys.length; j++) {
          if (keys[j] === this.keyState[i].key) {
            keyIsDown = true;
            break;
          }
        }
      }
      if (keyIsDown) {
        // no need to keep looking
        break;
      }
    }
    return keyIsDown;
  }

  /**
   * Return true if all keys in the list are currently held down.
   */
  allKeysInListDown(keys) {
    assert && assert(keys.length > 0, 'You are testing to see if an empty list of keys is down?');
    let allKeysDown = true;
    for (let i = 0; i < keys.length; i++) {
      const foundKey = _.find(this.keyState, pressedKeyTiming => pressedKeyTiming.key === keys[i]);
      if (!foundKey || !foundKey.keyDown) {
        // key is not in the keystate or is not currently pressed down, all provided keys are not down
        allKeysDown = false;
        break;
      }
    }
    return allKeysDown;
  }

  /**
   * Get the keyboard keys for the KeyboardDragDirection of this KeyboardDragListener.
   */
  getKeyboardDragDirectionKeys() {
    const directionKeys = KEYBOARD_DRAG_DIRECTION_KEY_MAP.get(this._keyboardDragDirection);
    assert && assert(directionKeys, `No direction keys found in map for KeyboardDragDirection ${this._keyboardDragDirection}`);
    return directionKeys;
  }

  /**
   * Returns true if the keystate indicates that a key is down that should move the object to the left.
   */
  leftMovementKeysDown() {
    return this.keyInListDown(this.getKeyboardDragDirectionKeys().left);
  }

  /**
   * Returns true if the keystate indicates that a key is down that should move the object to the right.
   */
  rightMovementKeysDown() {
    return this.keyInListDown(this.getKeyboardDragDirectionKeys().right);
  }

  /**
   * Returns true if the keystate indicates that a key is down that should move the object up.
   */
  upMovementKeysDown() {
    return this.keyInListDown(this.getKeyboardDragDirectionKeys().up);
  }

  /**
   * Returns true if the keystate indicates that a key is down that should move the upject down.
   */
  downMovementKeysDown() {
    return this.keyInListDown(this.getKeyboardDragDirectionKeys().down);
  }

  /**
   * Returns true if any of the movement keys are down (arrow keys or WASD keys).
   */
  getMovementKeysDown() {
    return this.rightMovementKeysDown() || this.leftMovementKeysDown() || this.upMovementKeysDown() || this.downMovementKeysDown();
  }
  get movementKeysDown() {
    return this.getMovementKeysDown();
  }

  /**
   * Returns true if the enter key is currently pressed down.
   */
  enterKeyDown() {
    return this.keyInListDown([KeyboardUtils.KEY_ENTER]);
  }

  /**
   * Returns true if the keystate indicates that the shift key is currently down.
   */
  shiftKeyDown() {
    return this.keyInListDown(KeyboardUtils.SHIFT_KEYS);
  }

  /**
   * Add a hotkey that behaves such that the desired callback will be called when all keys listed in the array are
   * pressed down in order.
   */
  addHotkey(hotkey) {
    this._hotkeys.push(hotkey);
  }

  /**
   * Remove a hotkey that was added with addHotkey.
   */
  removeHotkey(hotkey) {
    assert && assert(this._hotkeys.includes(hotkey), 'Trying to remove a hotkey that is not in the list of hotkeys.');
    const hotkeyIndex = this._hotkeys.indexOf(hotkey);
    this._hotkeys.splice(hotkeyIndex, 1);
  }

  /**
   * Sets the hotkeys of the KeyboardDragListener to passed-in array.
   */
  setHotkeys(hotkeys) {
    this._hotkeys = hotkeys.slice(0); // shallow copy
  }

  /**
   * See setHotkeys() for more information.
   */
  set hotkeys(hotkeys) {
    this.setHotkeys(hotkeys);
  }

  /**
   * Clear all hotkeys from this KeyboardDragListener.
   */
  removeAllHotkeys() {
    this._hotkeys = [];
  }

  /**
   * Resets the timers and control variables for the press and hold functionality.
   */
  resetPressAndHold() {
    this.delayComplete = false;
    this.moveOnHoldDelayCounter = 0;
    this.moveOnHoldIntervalCounter = 0;
  }

  /**
   * Resets the timers and control variables for the hotkey functionality.
   */
  resetHotkeyState() {
    this.currentHotkey = null;
    this.hotkeyHoldIntervalCounter = this._hotkeyHoldInterval; // reset to threshold so the hotkey fires immediately next time.
    this.hotkeyDisablingDragging = false;
  }

  /**
   * Reset the keystate Object tracking which keys are currently pressed down.
   */
  interrupt() {
    this.keyState = [];
    this.resetHotkeyState();
    this.resetPressAndHold();
    if (this._pointer) {
      assert && assert(this._pointer.listeners.includes(this._pointerListener), 'A reference to the Pointer means it should have the pointerListener');
      this._pointer.removeInputListener(this._pointerListener);
      this._pointer = null;
      this._end && this._end();
    }
  }

  /**
   * Make eligible for garbage collection.
   */
  dispose() {
    this.interrupt();
    this._disposeKeyboardDragListener();
    super.dispose();
  }

  /**
   * Returns true if the key corresponds to a key that should move the object to the left.
   */
  static isLeftMovementKey(key) {
    return key === KeyboardUtils.KEY_A || key === KeyboardUtils.KEY_LEFT_ARROW;
  }

  /**
   * Returns true if the key corresponds to a key that should move the object to the right.
   */
  static isRightMovementKey(key) {
    return key === KeyboardUtils.KEY_D || key === KeyboardUtils.KEY_RIGHT_ARROW;
  }

  /**
   * Returns true if the key corresponds to a key that should move the object up.
   */
  static isUpMovementKey(key) {
    return key === KeyboardUtils.KEY_W || key === KeyboardUtils.KEY_UP_ARROW;
  }

  /**
   * Returns true if the key corresponds to a key that should move the object down.
   */
  static isDownMovementKey(key) {
    return key === KeyboardUtils.KEY_S || key === KeyboardUtils.KEY_DOWN_ARROW;
  }
}
scenery.register('KeyboardDragListener', KeyboardDragListener);
export default KeyboardDragListener;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0aW9BY3Rpb24iLCJFbmFibGVkQ29tcG9uZW50IiwiRW1pdHRlciIsIlByb3BlcnR5Iiwic3RlcFRpbWVyIiwiVHJhbnNmb3JtMyIsIlZlY3RvcjIiLCJwbGF0Zm9ybSIsIkV2ZW50VHlwZSIsIlRhbmRlbSIsIktleWJvYXJkVXRpbHMiLCJzY2VuZXJ5IiwiU2NlbmVyeUV2ZW50Iiwib3B0aW9uaXplIiwiYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zIiwiS0VZQk9BUkRfRFJBR19ESVJFQ1RJT05fS0VZX01BUCIsIk1hcCIsImxlZnQiLCJLRVlfQSIsIktFWV9MRUZUX0FSUk9XIiwicmlnaHQiLCJLRVlfUklHSFRfQVJST1ciLCJLRVlfRCIsInVwIiwiS0VZX1VQX0FSUk9XIiwiS0VZX1ciLCJkb3duIiwiS0VZX0RPV05fQVJST1ciLCJLRVlfUyIsIktleWJvYXJkRHJhZ0xpc3RlbmVyIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJhc3NlcnQiLCJvcHRpb25zIiwiZHJhZ0RlbHRhIiwic2hpZnREcmFnRGVsdGEiLCJkcmFnVmVsb2NpdHkiLCJzaGlmdERyYWdWZWxvY2l0eSIsImtleWJvYXJkRHJhZ0RpcmVjdGlvbiIsInBvc2l0aW9uUHJvcGVydHkiLCJ0cmFuc2Zvcm0iLCJkcmFnQm91bmRzUHJvcGVydHkiLCJtYXBQb3NpdGlvbiIsInN0YXJ0IiwiZHJhZyIsImVuZCIsIm1vdmVPbkhvbGREZWxheSIsIm1vdmVPbkhvbGRJbnRlcnZhbCIsImhvdGtleUhvbGRJbnRlcnZhbCIsInBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsInRhbmRlbSIsIlJFUVVJUkVEIiwicGhldGlvUmVhZE9ubHkiLCJfc3RhcnQiLCJfZHJhZyIsIl9lbmQiLCJfZHJhZ0JvdW5kc1Byb3BlcnR5IiwiX21hcFBvc2l0aW9uIiwiX3RyYW5zZm9ybSIsIl9wb3NpdGlvblByb3BlcnR5IiwiX2RyYWdWZWxvY2l0eSIsIl9zaGlmdERyYWdWZWxvY2l0eSIsIl9kcmFnRGVsdGEiLCJfc2hpZnREcmFnRGVsdGEiLCJfbW92ZU9uSG9sZERlbGF5IiwiX2hvdGtleUhvbGRJbnRlcnZhbCIsIl9rZXlib2FyZERyYWdEaXJlY3Rpb24iLCJrZXlTdGF0ZSIsIl9ob3RrZXlzIiwiY3VycmVudEhvdGtleSIsImhvdGtleURpc2FibGluZ0RyYWdnaW5nIiwiaG90a2V5SG9sZEludGVydmFsQ291bnRlciIsInVzZURyYWdWZWxvY2l0eSIsIm1vdmVPbkhvbGREZWxheUNvdW50ZXIiLCJtb3ZlT25Ib2xkSW50ZXJ2YWxDb3VudGVyIiwiZGVsYXlDb21wbGV0ZSIsImRyYWdTdGFydEFjdGlvbiIsImV2ZW50Iiwia2V5IiwiZ2V0RXZlbnRDb2RlIiwiZG9tRXZlbnQiLCJtb3ZlbWVudEtleXNEb3duIiwiaXNNb3ZlbWVudEtleSIsIl9wb2ludGVyIiwicG9pbnRlciIsImFkZElucHV0TGlzdGVuZXIiLCJfcG9pbnRlckxpc3RlbmVyIiwicHVzaCIsImtleURvd24iLCJ0aW1lRG93biIsInBvc2l0aW9uRGVsdGEiLCJzaGlmdEtleURvd24iLCJ1cGRhdGVQb3NpdGlvbiIsInBhcmFtZXRlcnMiLCJuYW1lIiwicGhldGlvVHlwZSIsIlNjZW5lcnlFdmVudElPIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInBoZXRpb0V2ZW50VHlwZSIsIlVTRVIiLCJkcmFnRW1pdHRlciIsInBoZXRpb0hpZ2hGcmVxdWVuY3kiLCJkcmFnRW5kQWN0aW9uIiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsInN0ZXBMaXN0ZW5lciIsInN0ZXAiLCJiaW5kIiwiYWRkTGlzdGVuZXIiLCJlbmFibGVkUHJvcGVydHkiLCJsYXp5TGluayIsIm9uRW5hYmxlZFByb3BlcnR5Q2hhbmdlIiwibGlzdGVuZXIiLCJpbnRlcnJ1cHQiLCJfZGlzcG9zZUtleWJvYXJkRHJhZ0xpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJnZXREcmFnQm91bmRzIiwidmFsdWUiLCJkcmFnQm91bmRzIiwic2V0VHJhbnNmb3JtIiwiZ2V0VHJhbnNmb3JtIiwiX21vdmVPbkhvbGRJbnRlcnZhbCIsImlzUHJlc3NlZCIsImdldEN1cnJlbnRUYXJnZXQiLCJ0cmFpbCIsImxhc3ROb2RlIiwiZW5hYmxlZCIsImtleWRvd24iLCJtZXRhS2V5IiwicHJldmVudERlZmF1bHQiLCJyZXNlcnZlRm9yS2V5Ym9hcmREcmFnIiwia2V5SW5MaXN0RG93biIsInNhZmFyaSIsImlzQXJyb3dLZXkiLCJjYW5EcmFnIiwiZXhlY3V0ZSIsImtleXVwIiwibW92ZUtleXNEb3duIiwiS0VZX1RBQiIsInNoaWZ0S2V5IiwiS0VZX1NISUZUX0xFRlQiLCJpIiwibGVuZ3RoIiwic3BsaWNlIiwibW92ZUtleXNTdGlsbERvd24iLCJhbGxLZXlzSW5MaXN0RG93biIsImtleXMiLCJyZXNldEhvdGtleVN0YXRlIiwicmVzZXRQcmVzc0FuZEhvbGQiLCJmb2N1c291dCIsImR0IiwibXMiLCJwb3NpdGlvblZlbG9jaXR5U2Vjb25kcyIsInBvc2l0aW9uVmVsb2NpdHlNaWxsaXNlY29uZHMiLCJtb3ZhYmxlIiwib3ZlcmZsb3dUaW1lIiwidXBkYXRlSG90a2V5cyIsImoiLCJob3RrZXlzRG93bkxpc3QiLCJrIiwibCIsImtleXNJbk9yZGVyIiwibSIsImNhbGxiYWNrIiwiZGVsdGEiLCJkZWx0YVgiLCJkZWx0YVkiLCJsZWZ0TW92ZW1lbnRLZXlzRG93biIsInJpZ2h0TW92ZW1lbnRLZXlzRG93biIsInVwTW92ZW1lbnRLZXlzRG93biIsImRvd25Nb3ZlbWVudEtleXNEb3duIiwidmVjdG9yRGVsdGEiLCJlcXVhbHMiLCJaRVJPIiwiaW52ZXJzZURlbHRhMiIsIm5ld1Bvc2l0aW9uIiwiZ2V0IiwicGx1cyIsIm1hcE1vZGVsUG9pbnQiLCJzZXQiLCJlbWl0IiwibW9kZWxQb2ludCIsImNsb3Nlc3RQb2ludFRvIiwia2V5SXNEb3duIiwiYWxsS2V5c0Rvd24iLCJmb3VuZEtleSIsIl8iLCJmaW5kIiwicHJlc3NlZEtleVRpbWluZyIsImdldEtleWJvYXJkRHJhZ0RpcmVjdGlvbktleXMiLCJkaXJlY3Rpb25LZXlzIiwiZ2V0TW92ZW1lbnRLZXlzRG93biIsImVudGVyS2V5RG93biIsIktFWV9FTlRFUiIsIlNISUZUX0tFWVMiLCJhZGRIb3RrZXkiLCJob3RrZXkiLCJyZW1vdmVIb3RrZXkiLCJpbmNsdWRlcyIsImhvdGtleUluZGV4IiwiaW5kZXhPZiIsInNldEhvdGtleXMiLCJob3RrZXlzIiwic2xpY2UiLCJyZW1vdmVBbGxIb3RrZXlzIiwibGlzdGVuZXJzIiwiZGlzcG9zZSIsImlzTGVmdE1vdmVtZW50S2V5IiwiaXNSaWdodE1vdmVtZW50S2V5IiwiaXNVcE1vdmVtZW50S2V5IiwiaXNEb3duTW92ZW1lbnRLZXkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIktleWJvYXJkRHJhZ0xpc3RlbmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgZ2VuZXJhbCB0eXBlIGZvciBrZXlib2FyZCBkcmFnZ2luZy4gT2JqZWN0cyBjYW4gYmUgZHJhZ2dlZCBpbiBvbmUgb3IgdHdvIGRpbWVuc2lvbnMgd2l0aCB0aGUgYXJyb3cga2V5cyBhbmQgd2l0aFxyXG4gKiB0aGUgV0FTRCBrZXlzLiBTZWUgdGhlIG9wdGlvbiBrZXlib2FyZERyYWdEaXJlY3Rpb24gZm9yIGEgZGVzY3JpcHRpb24gb2YgaG93IGtleWJvYXJkIGtleXMgY2FuIGJlIG1hcHBlZCB0b1xyXG4gKiBtb3Rpb24gZm9yIDFEIGFuZCAyRCBtb3Rpb24uIFRoaXMgY2FuIGJlIGFkZGVkIHRvIGEgbm9kZSB0aHJvdWdoIGFkZElucHV0TGlzdGVuZXIgZm9yIGFjY2Vzc2liaWxpdHksIHdoaWNoIGlzIG1peGVkXHJcbiAqIGludG8gTm9kZXMgd2l0aCB0aGUgUGFyYWxsZWxET00gdHJhaXQuXHJcbiAqXHJcbiAqIEphdmFTY3JpcHQgZG9lcyBub3QgbmF0aXZlbHkgaGFuZGxlIG11bHRpcGxlICdrZXlkb3duJyBldmVudHMgYXQgb25jZSwgc28gd2UgaGF2ZSBhIGN1c3RvbSBpbXBsZW1lbnRhdGlvbiB0aGF0XHJcbiAqIHRyYWNrcyB3aGljaCBrZXlzIGFyZSBkb3duIGFuZCBmb3IgaG93IGxvbmcgaW4gYSBzdGVwKCkgZnVuY3Rpb24uIFRvIHN1cHBvcnQga2V5ZG93biB0aW1pbmcsIEFYT04vdGltZXIgaXMgdXNlZC4gSW5cclxuICogc2NlbmVyeSB0aGlzIGlzIHN1cHBvcnRlZCB2aWEgRGlzcGxheS51cGRhdGVPblJlcXVlc3RBbmltYXRpb25GcmFtZSgpLCB3aGljaCB3aWxsIHN0ZXAgdGhlIHRpbWUgb24gZWFjaCBmcmFtZS5cclxuICogSWYgdXNpbmcgS2V5Ym9hcmREcmFnTGlzdGVuZXIgaW4gYSBtb3JlIGN1c3RvbWl6ZWQgRGlzcGxheSwgbGlrZSBkb25lIGluIHBoZXRzaW1zIChzZWUgSk9JU1QvU2ltKSwgdGhlIHRpbWUgbXVzdCBiZVxyXG4gKiBtYW51YWxseSBzdGVwcGVkIChieSBlbWl0dGluZyB0aGUgdGltZXIpLlxyXG4gKlxyXG4gKiBGb3IgdGhlIHB1cnBvc2VzIG9mIHRoaXMgZmlsZSwgYSBcImhvdGtleVwiIGlzIGEgY29sbGVjdGlvbiBvZiBrZXlzIHRoYXQsIHdoZW4gcHJlc3NlZCB0b2dldGhlciBpbiB0aGUgcmlnaHRcclxuICogb3JkZXIsIGZpcmUgYSBjYWxsYmFjay5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgTWljaGFlbCBCYXJsb3dcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQaGV0aW9BY3Rpb24gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb0FjdGlvbi5qcyc7XHJcbmltcG9ydCBFbmFibGVkQ29tcG9uZW50LCB7IEVuYWJsZWRDb21wb25lbnRPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9FbmFibGVkQ29tcG9uZW50LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgc3RlcFRpbWVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvc3RlcFRpbWVyLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgVHJhbnNmb3JtMyBmcm9tICcuLi8uLi8uLi9kb3QvanMvVHJhbnNmb3JtMy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHBsYXRmb3JtIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9wbGF0Zm9ybS5qcyc7XHJcbmltcG9ydCBFdmVudFR5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL0V2ZW50VHlwZS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCB7IEtleWJvYXJkVXRpbHMsIE5vZGUsIFBET01Qb2ludGVyLCBzY2VuZXJ5LCBTY2VuZXJ5RXZlbnQsIFRJbnB1dExpc3RlbmVyIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBURW1pdHRlciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RFbWl0dGVyLmpzJztcclxuaW1wb3J0IGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zLmpzJztcclxuXHJcbnR5cGUgUHJlc3NlZEtleVRpbWluZyA9IHtcclxuXHJcbiAgLy8gSXMgdGhlIGtleSBjdXJyZW50bHkgZG93bj9cclxuICBrZXlEb3duOiBib29sZWFuO1xyXG5cclxuICAvLyBIb3cgbG9uZyBoYXMgdGhlIGtleSBiZWVuIHByZXNzZWQgaW4gbWlsbGlzZWNvbmRzXHJcbiAgdGltZURvd246IG51bWJlcjtcclxuXHJcbiAgLy8gS2V5Ym9hcmRFdmVudC5rZXkgc3RyaW5nXHJcbiAga2V5OiBzdHJpbmc7XHJcbn07XHJcblxyXG50eXBlIEhvdGtleSA9IHtcclxuXHJcbiAgLy8gS2V5cyB0byBiZSBwcmVzc2VkIGluIG9yZGVyIHRvIHRyaWdnZXIgdGhlIGNhbGxiYWNrIG9mIHRoZSBIb3RrZXlcclxuICBrZXlzOiBzdHJpbmdbXTtcclxuXHJcbiAgLy8gQ2FsbGVkIHdoZW4ga2V5cyBhcmUgcHJlc3NlZCBpbiBvcmRlclxyXG4gIGNhbGxiYWNrOiAoKSA9PiB2b2lkO1xyXG59O1xyXG5cclxuLy8gUG9zc2libGUgbW92ZW1lbnQgdHlwZXMgZm9yIHRoaXMgS2V5Ym9hcmREcmFnTGlzdGVuZXIuIDJEIG1vdGlvbiAoJ2JvdGgnKSBvciAxRCBtb3Rpb24gKCdsZWZ0UmlnaHQnIG9yICd1cERvd24nKS5cclxudHlwZSBLZXlib2FyZERyYWdEaXJlY3Rpb24gPSAnYm90aCcgfCAnbGVmdFJpZ2h0JyB8ICd1cERvd24nO1xyXG5cclxudHlwZSBLZXlib2FyZERyYWdEaXJlY3Rpb25LZXlzID0ge1xyXG4gIGxlZnQ6IHN0cmluZ1tdO1xyXG4gIHJpZ2h0OiBzdHJpbmdbXTtcclxuICB1cDogc3RyaW5nW107XHJcbiAgZG93bjogc3RyaW5nW107XHJcbn07XHJcblxyXG5jb25zdCBLRVlCT0FSRF9EUkFHX0RJUkVDVElPTl9LRVlfTUFQID0gbmV3IE1hcDxLZXlib2FyZERyYWdEaXJlY3Rpb24sIEtleWJvYXJkRHJhZ0RpcmVjdGlvbktleXM+KCBbXHJcbiAgWyAnYm90aCcsIHtcclxuICAgIGxlZnQ6IFsgS2V5Ym9hcmRVdGlscy5LRVlfQSwgS2V5Ym9hcmRVdGlscy5LRVlfTEVGVF9BUlJPVyBdLFxyXG4gICAgcmlnaHQ6IFsgS2V5Ym9hcmRVdGlscy5LRVlfUklHSFRfQVJST1csIEtleWJvYXJkVXRpbHMuS0VZX0QgXSxcclxuICAgIHVwOiBbIEtleWJvYXJkVXRpbHMuS0VZX1VQX0FSUk9XLCBLZXlib2FyZFV0aWxzLktFWV9XIF0sXHJcbiAgICBkb3duOiBbIEtleWJvYXJkVXRpbHMuS0VZX0RPV05fQVJST1csIEtleWJvYXJkVXRpbHMuS0VZX1MgXVxyXG4gIH0gXSxcclxuICBbICdsZWZ0UmlnaHQnLCB7XHJcbiAgICBsZWZ0OiBbIEtleWJvYXJkVXRpbHMuS0VZX0EsIEtleWJvYXJkVXRpbHMuS0VZX0xFRlRfQVJST1csIEtleWJvYXJkVXRpbHMuS0VZX0RPV05fQVJST1csIEtleWJvYXJkVXRpbHMuS0VZX1MgXSxcclxuICAgIHJpZ2h0OiBbIEtleWJvYXJkVXRpbHMuS0VZX1JJR0hUX0FSUk9XLCBLZXlib2FyZFV0aWxzLktFWV9ELCBLZXlib2FyZFV0aWxzLktFWV9VUF9BUlJPVywgS2V5Ym9hcmRVdGlscy5LRVlfVyBdLFxyXG4gICAgdXA6IFtdLFxyXG4gICAgZG93bjogW11cclxuICB9IF0sXHJcbiAgWyAndXBEb3duJywge1xyXG4gICAgbGVmdDogW10sXHJcbiAgICByaWdodDogW10sXHJcbiAgICB1cDogWyBLZXlib2FyZFV0aWxzLktFWV9SSUdIVF9BUlJPVywgS2V5Ym9hcmRVdGlscy5LRVlfRCwgS2V5Ym9hcmRVdGlscy5LRVlfVVBfQVJST1csIEtleWJvYXJkVXRpbHMuS0VZX1cgXSxcclxuICAgIGRvd246IFsgS2V5Ym9hcmRVdGlscy5LRVlfQSwgS2V5Ym9hcmRVdGlscy5LRVlfTEVGVF9BUlJPVywgS2V5Ym9hcmRVdGlscy5LRVlfRE9XTl9BUlJPVywgS2V5Ym9hcmRVdGlscy5LRVlfUyBdXHJcbiAgfSBdXHJcbl0gKTtcclxuXHJcbnR5cGUgTWFwUG9zaXRpb24gPSAoIHBvaW50OiBWZWN0b3IyICkgPT4gVmVjdG9yMjtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIEhvdyBtdWNoIHRoZSBwb3NpdGlvbiBQcm9wZXJ0eSB3aWxsIGNoYW5nZSBpbiB2aWV3IGNvb3JkaW5hdGVzIGV2ZXJ5IG1vdmVPbkhvbGRJbnRlcnZhbC4gT2JqZWN0IHdpbGxcclxuICAvLyBtb3ZlIGluIGRpc2NyZXRlIHN0ZXBzIGF0IHRoaXMgaW50ZXJ2YWwuIElmIHlvdSB3b3VsZCBsaWtlIHNtb290aGVyIFwiYW5pbWF0ZWRcIiBtb3Rpb24gdXNlIGRyYWdWZWxvY2l0eVxyXG4gIC8vIGluc3RlYWQuIGRyYWdEZWx0YSBwcm9kdWNlcyBhIFVYIHRoYXQgaXMgbW9yZSB0eXBpY2FsIGZvciBhcHBsaWNhdGlvbnMgYnV0IGRyYWdWZWxvY2l0eSBpcyBiZXR0ZXIgZm9yIHZpZGVvXHJcbiAgLy8gZ2FtZS1saWtlIGNvbXBvbmVudHMuIGRyYWdEZWx0YSBhbmQgZHJhZ1ZlbG9jaXR5IGFyZSBtdXR1YWxseSBleGNsdXNpdmUgb3B0aW9ucy5cclxuICBkcmFnRGVsdGE/OiBudW1iZXI7XHJcblxyXG4gIC8vIEhvdyBtdWNoIHRoZSBQb3NpdGlvblByb3BlcnR5IHdpbGwgY2hhbmdlIGluIHZpZXcgY29vcmRpbmF0ZXMgZXZlcnkgbW92ZU9uSG9sZEludGVydmFsIHdoaWxlIHRoZSBzaGlmdCBtb2RpZmllclxyXG4gIC8vIGtleSBpcyBwcmVzc2VkLiBTaGlmdCBtb2RpZmllciBzaG91bGQgcHJvZHVjZSBtb3JlIGZpbmUtZ3JhaW5lZCBtb3Rpb24gc28gdGhpcyB2YWx1ZSBuZWVkcyB0byBiZSBsZXNzIHRoYW5cclxuICAvLyBkcmFnRGVsdGEgaWYgcHJvdmlkZWQuIE9iamVjdCB3aWxsIG1vdmUgaW4gZGlzY3JldGUgc3RlcHMuIElmIHlvdSB3b3VsZCBsaWtlIHNtb290aGVyIFwiYW5pbWF0ZWRcIiBtb3Rpb24gdXNlXHJcbiAgLy8gZHJhZ1ZlbG9jaXR5IG9wdGlvbnMgaW5zdGVhZC4gZHJhZ0RlbHRhIG9wdGlvbnMgcHJvZHVjZSBhIFVYIHRoYXQgaXMgbW9yZSB0eXBpY2FsIGZvciBhcHBsaWNhdGlvbnMgYnV0IGRyYWdWZWxvY2l0eVxyXG4gIC8vIGlzIGJldHRlciBmb3IgZ2FtZS1saWtlIGNvbXBvbmVudHMuIGRyYWdEZWx0YSBhbmQgZHJhZ1ZlbG9jaXR5IGFyZSBtdXR1YWxseSBleGNsdXNpdmUgb3B0aW9ucy5cclxuICBzaGlmdERyYWdEZWx0YT86IG51bWJlcjtcclxuXHJcbiAgLy8gV2hpbGUgYSBkaXJlY3Rpb24ga2V5IGlzIGhlbGQgZG93biwgdGhlIHRhcmdldCB3aWxsIG1vdmUgYnkgdGhpcyBhbW91bnQgaW4gdmlldyBjb29yZGluYXRlcyBldmVyeSBzZWNvbmQuXHJcbiAgLy8gVGhpcyBpcyBhbiBhbHRlcm5hdGl2ZSB3YXkgdG8gY29udHJvbCBtb3Rpb24gd2l0aCBrZXlib2FyZCB0aGFuIGRyYWdEZWx0YSBhbmQgcHJvZHVjZXMgc21vb3RoZXIgbW90aW9uIGZvclxyXG4gIC8vIHRoZSBvYmplY3QuIGRyYWdWZWxvY2l0eSBhbmQgZHJhZ0RlbHRhIG9wdGlvbnMgYXJlIG11dHVhbGx5IGV4Y2x1c2l2ZS4gU2VlIGRyYWdEZWx0YSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuICBkcmFnVmVsb2NpdHk/OiBudW1iZXI7XHJcblxyXG4gIC8vIFdoaWxlIGEgZGlyZWN0aW9uIGtleSBpcyBoZWxkIGRvd24gd2l0aCB0aGUgc2hpZnQgbW9kaWZpZXIga2V5LCB0aGUgdGFyZ2V0IHdpbGwgbW92ZSBieSB0aGlzIGFtb3VudCBpbiB2aWV3XHJcbiAgLy8gY29vcmRpbmF0ZXMgZXZlcnkgc2Vjb25kLiBTaGlmdCBtb2RpZmllciBzaG91bGQgcHJvZHVjZSBtb3JlIGZpbmUtZ3JhaW5lZCBtb3Rpb24gc28gdGhpcyB2YWx1ZSBuZWVkcyB0byBiZSBsZXNzXHJcbiAgLy8gdGhhbiBkcmFnVmVsb2NpdHkgaWYgcHJvdmlkZWQuIFRoaXMgaXMgYW4gYWx0ZXJuYXRpdmUgd2F5IHRvIGNvbnRyb2wgbW90aW9uIHdpdGgga2V5Ym9hcmQgdGhhbiBkcmFnRGVsdGEgYW5kXHJcbiAgLy8gcHJvZHVjZXMgc21vb3RoZXIgbW90aW9uIGZvciB0aGUgb2JqZWN0LiBkcmFnVmVsb2NpdHkgYW5kIGRyYWdEZWx0YSBvcHRpb25zIGFyZSBtdXR1YWxseSBleGNsdXNpdmUuIFNlZSBkcmFnRGVsdGFcclxuICAvLyBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuICBzaGlmdERyYWdWZWxvY2l0eT86IG51bWJlcjtcclxuXHJcbiAgLy8gU3BlY2lmaWVzIHRoZSBkaXJlY3Rpb24gb2YgbW90aW9uIGZvciB0aGUgS2V5Ym9hcmREcmFnTGlzdGVuZXIuIEJ5IGRlZmF1bHQsIHRoZSBwb3NpdGlvbiBWZWN0b3IyIGNhbiBjaGFuZ2UgaW5cclxuICAvLyBib3RoIGRpcmVjdGlvbnMgYnkgcHJlc3NpbmcgdGhlIGFycm93IGtleXMuIEJ1dCB5b3UgY2FuIGNvbnN0cmFpbiBkcmFnZ2luZyB0byAxRCBsZWZ0LXJpZ2h0IG9yIHVwLWRvd24gbW90aW9uXHJcbiAgLy8gd2l0aCB0aGlzIHZhbHVlLlxyXG4gIGtleWJvYXJkRHJhZ0RpcmVjdGlvbj86IEtleWJvYXJkRHJhZ0RpcmVjdGlvbjtcclxuXHJcbiAgLy8gSWYgcHJvdmlkZWQsIGl0IHdpbGwgYmUgc3luY2hyb25pemVkIHdpdGggdGhlIGRyYWcgcG9zaXRpb24gaW4gdGhlIG1vZGVsIGZyYW1lLCBhcHBseWluZyBwcm92aWRlZCB0cmFuc2Zvcm1zIGFzXHJcbiAgLy8gbmVlZGVkLiBNb3N0IHVzZWZ1bCB3aGVuIHVzZWQgd2l0aCB0cmFuc2Zvcm0gb3B0aW9uXHJcbiAgcG9zaXRpb25Qcm9wZXJ0eT86IFRQcm9wZXJ0eTxWZWN0b3IyPiB8IG51bGw7XHJcblxyXG4gIC8vIElmIHByb3ZpZGVkLCB0aGlzIHdpbGwgYmUgdGhlIGNvbnZlcnNpb24gYmV0d2VlbiB0aGUgdmlldyBhbmQgbW9kZWwgY29vcmRpbmF0ZSBmcmFtZXMuIFVzdWFsbHkgbW9zdCB1c2VmdWwgd2hlblxyXG4gIC8vIHBhaXJlZCB3aXRoIHRoZSBwb3NpdGlvblByb3BlcnR5LlxyXG4gIHRyYW5zZm9ybT86IFRyYW5zZm9ybTMgfCBUUmVhZE9ubHlQcm9wZXJ0eTxUcmFuc2Zvcm0zPiB8IG51bGw7XHJcblxyXG4gIC8vIElmIHByb3ZpZGVkLCB0aGUgbW9kZWwgcG9zaXRpb24gd2lsbCBiZSBjb25zdHJhaW5lZCB0byBiZSBpbnNpZGUgdGhlc2UgYm91bmRzLCBpbiBtb2RlbCBjb29yZGluYXRlc1xyXG4gIGRyYWdCb3VuZHNQcm9wZXJ0eT86IFRSZWFkT25seVByb3BlcnR5PEJvdW5kczIgfCBudWxsPiB8IG51bGw7XHJcblxyXG4gIC8vIElmIHByb3ZpZGVkLCBpdCB3aWxsIGFsbG93IGN1c3RvbSBtYXBwaW5nXHJcbiAgLy8gZnJvbSB0aGUgZGVzaXJlZCBwb3NpdGlvbiAoaS5lLiB3aGVyZSB0aGUgcG9pbnRlciBpcykgdG8gdGhlIGFjdHVhbCBwb3NzaWJsZSBwb3NpdGlvbiAoaS5lLiB3aGVyZSB0aGUgZHJhZ2dlZFxyXG4gIC8vIG9iamVjdCBlbmRzIHVwKS4gRm9yIGV4YW1wbGUsIHVzaW5nIGRyYWdCb3VuZHNQcm9wZXJ0eSBpcyBlcXVpdmFsZW50IHRvIHBhc3Npbmc6XHJcbiAgLy8gICBtYXBQb3NpdGlvbjogZnVuY3Rpb24oIHBvaW50ICkgeyByZXR1cm4gZHJhZ0JvdW5kc1Byb3BlcnR5LnZhbHVlLmNsb3Nlc3RQb2ludFRvKCBwb2ludCApOyB9XHJcbiAgbWFwUG9zaXRpb24/OiBNYXBQb3NpdGlvbiB8IG51bGw7XHJcblxyXG4gIC8vIENhbGxlZCB3aGVuIGtleWJvYXJkIGRyYWcgaXMgc3RhcnRlZCAob24gaW5pdGlhbCBwcmVzcykuXHJcbiAgc3RhcnQ/OiAoICggZXZlbnQ6IFNjZW5lcnlFdmVudCApID0+IHZvaWQgKSB8IG51bGw7XHJcblxyXG4gIC8vIENhbGxlZCBkdXJpbmcgZHJhZy4gTm90ZSB0aGF0IHRoaXMgZG9lcyBub3QgcHJvdmlkZSB0aGUgU2NlbmVyeUV2ZW50LiBEcmFnZ2luZyBoYXBwZW5zIGR1cmluZyBhbmltYXRpb25cclxuICAvLyAoYXMgbG9uZyBhcyBrZXlzIGFyZSBkb3duKSwgc28gdGhlcmUgaXMgbm8gZXZlbnQgYXNzb2NpYXRlZCB3aXRoIHRoZSBkcmFnLlxyXG4gIGRyYWc/OiAoICggdmlld0RlbHRhOiBWZWN0b3IyICkgPT4gdm9pZCApIHwgbnVsbDtcclxuXHJcbiAgLy8gQ2FsbGVkIHdoZW4ga2V5Ym9hcmQgZHJhZ2dpbmcgZW5kcy5cclxuICBlbmQ/OiAoICggZXZlbnQ/OiBTY2VuZXJ5RXZlbnQgKSA9PiB2b2lkICkgfCBudWxsO1xyXG5cclxuICAvLyBBcnJvdyBrZXlzIG11c3QgYmUgcHJlc3NlZCB0aGlzIGxvbmcgdG8gYmVnaW4gbW92ZW1lbnQgc2V0IG9uIG1vdmVPbkhvbGRJbnRlcnZhbCwgaW4gbXNcclxuICBtb3ZlT25Ib2xkRGVsYXk/OiBudW1iZXI7XHJcblxyXG4gIC8vIFRpbWUgaW50ZXJ2YWwgYXQgd2hpY2ggdGhlIG9iamVjdCB3aWxsIGNoYW5nZSBwb3NpdGlvbiB3aGlsZSB0aGUgYXJyb3cga2V5IGlzIGhlbGQgZG93biwgaW4gbXMuIFRoaXMgbXVzdCBiZSBsYXJnZXJcclxuICAvLyB0aGFuIDAgdG8gcHJldmVudCBkcmFnZ2luZyB0aGF0IGlzIGJhc2VkIG9uIGhvdyBvZnRlbiBhbmltYXRpb24tZnJhbWUgc3RlcHMgb2NjdXIuXHJcbiAgbW92ZU9uSG9sZEludGVydmFsPzogbnVtYmVyO1xyXG5cclxuICAvLyBUaW1lIGludGVydmFsIGF0IHdoaWNoIGhvbGRpbmcgZG93biBhIGhvdGtleSBncm91cCB3aWxsIHRyaWdnZXIgYW4gYXNzb2NpYXRlZCBsaXN0ZW5lciwgaW4gbXNcclxuICBob3RrZXlIb2xkSW50ZXJ2YWw/OiBudW1iZXI7XHJcblxyXG4gIC8vIEVuYWJsZWRDb21wb25lbnRcclxuICAvLyBCeSBkZWZhdWx0LCBkbyBub3QgaW5zdHJ1bWVudCB0aGUgZW5hYmxlZFByb3BlcnR5OyBvcHQgaW4gd2l0aCB0aGlzIG9wdGlvbi4gU2VlIEVuYWJsZWRDb21wb25lbnRcclxuICBwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQ/OiBib29sZWFuO1xyXG5cclxuICAvLyBwaGV0LWlvXHJcbiAgdGFuZGVtPzogVGFuZGVtO1xyXG5cclxuICAvLyBUaG91Z2ggRHJhZ0xpc3RlbmVyIGlzIG5vdCBpbnN0cnVtZW50ZWQsIGRlY2xhcmUgdGhlc2UgaGVyZSB0byBzdXBwb3J0IHByb3Blcmx5IHBhc3NpbmcgdGhpcyB0byBjaGlsZHJlbiwgc2VlXHJcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3RhbmRlbS9pc3N1ZXMvNjAuXHJcbiAgcGhldGlvUmVhZE9ubHk/OiBib29sZWFuO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgS2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBFbmFibGVkQ29tcG9uZW50T3B0aW9ucztcclxuXHJcbmNsYXNzIEtleWJvYXJkRHJhZ0xpc3RlbmVyIGV4dGVuZHMgRW5hYmxlZENvbXBvbmVudCBpbXBsZW1lbnRzIFRJbnB1dExpc3RlbmVyIHtcclxuXHJcbiAgLy8gU2VlIG9wdGlvbnMgZm9yIGRvY3VtZW50YXRpb25cclxuICBwcml2YXRlIF9zdGFydDogKCAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKSA9PiB2b2lkICkgfCBudWxsO1xyXG4gIHByaXZhdGUgX2RyYWc6ICggKCB2aWV3RGVsdGE6IFZlY3RvcjIsIGxpc3RlbmVyOiBLZXlib2FyZERyYWdMaXN0ZW5lciApID0+IHZvaWQgKSB8IG51bGw7XHJcbiAgcHJpdmF0ZSBfZW5kOiAoICggZXZlbnQ/OiBTY2VuZXJ5RXZlbnQgKSA9PiB2b2lkICkgfCBudWxsO1xyXG4gIHByaXZhdGUgX2RyYWdCb3VuZHNQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Qm91bmRzMiB8IG51bGw+O1xyXG4gIHByaXZhdGUgX21hcFBvc2l0aW9uOiBNYXBQb3NpdGlvbiB8IG51bGw7XHJcbiAgcHJpdmF0ZSBfdHJhbnNmb3JtOiBUcmFuc2Zvcm0zIHwgVFJlYWRPbmx5UHJvcGVydHk8VHJhbnNmb3JtMz4gfCBudWxsO1xyXG4gIHByaXZhdGUgX2tleWJvYXJkRHJhZ0RpcmVjdGlvbjogS2V5Ym9hcmREcmFnRGlyZWN0aW9uO1xyXG4gIHByaXZhdGUgX3Bvc2l0aW9uUHJvcGVydHk6IFRQcm9wZXJ0eTxWZWN0b3IyPiB8IG51bGw7XHJcbiAgcHJpdmF0ZSBfZHJhZ1ZlbG9jaXR5OiBudW1iZXI7XHJcbiAgcHJpdmF0ZSBfc2hpZnREcmFnVmVsb2NpdHk6IG51bWJlcjtcclxuICBwcml2YXRlIF9kcmFnRGVsdGE6IG51bWJlcjtcclxuICBwcml2YXRlIF9zaGlmdERyYWdEZWx0YTogbnVtYmVyO1xyXG4gIHByaXZhdGUgX21vdmVPbkhvbGREZWxheTogbnVtYmVyO1xyXG4gIHByaXZhdGUgX21vdmVPbkhvbGRJbnRlcnZhbCE6IG51bWJlcjtcclxuICBwcml2YXRlIF9ob3RrZXlIb2xkSW50ZXJ2YWw6IG51bWJlcjtcclxuXHJcbiAgLy8gVHJhY2tzIHRoZSBzdGF0ZSBvZiB0aGUga2V5Ym9hcmQuIEphdmFTY3JpcHQgZG9lc24ndCBoYW5kbGUgbXVsdGlwbGUga2V5IHByZXNzZXMsIHNvIHdlIHRyYWNrIHdoaWNoIGtleXMgYXJlXHJcbiAgLy8gY3VycmVudGx5IGRvd24gYW5kIHVwZGF0ZSBiYXNlZCBvbiBzdGF0ZSBvZiB0aGlzIGNvbGxlY3Rpb24gb2Ygb2JqZWN0cy5cclxuICAvLyBUT0RPOiBDb25zaWRlciBhIGdsb2JhbCBzdGF0ZSBvYmplY3QgZm9yIHRoaXMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTA1NFxyXG4gIHByaXZhdGUga2V5U3RhdGU6IFByZXNzZWRLZXlUaW1pbmdbXTtcclxuXHJcbiAgLy8gQSBsaXN0IG9mIGhvdGtleXMsIGVhY2ggb2Ygd2hpY2ggaGFzIHNvbWUgYmVoYXZpb3Igd2hlbiBlYWNoIGluZGl2aWR1YWwga2V5IG9mIHRoZSBob3RrZXkgaXMgcHJlc3NlZCBpbiBvcmRlci5cclxuICAvLyBTZWUgdGhpcy5hZGRIb3RrZXkoKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuICBwcml2YXRlIF9ob3RrZXlzOiBIb3RrZXlbXTtcclxuXHJcbiAgLy8gVGhlIEhvdGtleSB0aGF0IGlzIGN1cnJlbnRseSBkb3duXHJcbiAgcHJpdmF0ZSBjdXJyZW50SG90a2V5OiBIb3RrZXkgfCBudWxsO1xyXG5cclxuICAvLyBXaGVuIGEgaG90a2V5IGdyb3VwIGlzIHByZXNzZWQgZG93biwgZHJhZ2dpbmcgd2lsbCBiZSBkaXNhYmxlZCB1bnRpbCBhbnkga2V5cyBhcmUgdXAgYWdhaW5cclxuICBwcml2YXRlIGhvdGtleURpc2FibGluZ0RyYWdnaW5nOiBib29sZWFuO1xyXG5cclxuICAvLyBEZWxheSBiZWZvcmUgY2FsbGluZyBhIEhvdGtleSBsaXN0ZW5lciAoaWYgYWxsIEhvdGtleXMgYXJlIGJlaW5nIGhlbGQgZG93biksIGluY3JlbWVudGVkIGluIHN0ZXAuIEluIG1pbGxpc2Vjb25kcy5cclxuICBwcml2YXRlIGhvdGtleUhvbGRJbnRlcnZhbENvdW50ZXI6IG51bWJlcjtcclxuXHJcbiAgLy8gQ291bnRlcnMgdG8gYWxsb3cgZm9yIHByZXNzLWFuZC1ob2xkIGZ1bmN0aW9uYWxpdHkgdGhhdCBlbmFibGVzIHVzZXIgdG8gaW5jcmVtZW50YWxseSBtb3ZlIHRoZSBkcmFnZ2FibGUgb2JqZWN0IG9yXHJcbiAgLy8gaG9sZCB0aGUgbW92ZW1lbnQga2V5IGZvciBjb250aW51b3VzIG9yIHN0ZXBwZWQgbW92ZW1lbnQgLSB2YWx1ZXMgaW4gbXNcclxuICBwcml2YXRlIG1vdmVPbkhvbGREZWxheUNvdW50ZXI6IG51bWJlcjtcclxuICBwcml2YXRlIG1vdmVPbkhvbGRJbnRlcnZhbENvdW50ZXI6IG51bWJlcjtcclxuXHJcbiAgLy8gVmFyaWFibGUgdG8gZGV0ZXJtaW5lIHdoZW4gdGhlIGluaXRpYWwgZGVsYXkgaXMgY29tcGxldGVcclxuICBwcml2YXRlIGRlbGF5Q29tcGxldGU6IGJvb2xlYW47XHJcblxyXG4gIC8vIEZpcmVzIHRvIGNvbmR1Y3QgdGhlIHN0YXJ0IGFuZCBlbmQgb2YgYSBkcmFnLCBhZGRlZCBmb3IgUGhFVC1pTyBpbnRlcm9wZXJhYmlsaXR5XHJcbiAgcHJpdmF0ZSBkcmFnU3RhcnRBY3Rpb246IFBoZXRpb0FjdGlvbjxbIFNjZW5lcnlFdmVudCBdPjtcclxuICBwcml2YXRlIGRyYWdFbmRBY3Rpb246IFBoZXRpb0FjdGlvbjxbIFNjZW5lcnlFdmVudCBdPjtcclxuXHJcbiAgLy8gQGRlcHJlY2F0ZWQgLSBVc2UgdGhlIGRyYWcgb3B0aW9uIGluc3RlYWQuXHJcbiAgcHVibGljIGRyYWdFbWl0dGVyOiBURW1pdHRlcjtcclxuXHJcbiAgLy8gSW1wbGVtZW50cyBkaXNwb3NhbFxyXG4gIHByaXZhdGUgcmVhZG9ubHkgX2Rpc3Bvc2VLZXlib2FyZERyYWdMaXN0ZW5lcjogKCkgPT4gdm9pZDtcclxuXHJcbiAgLy8gQSBsaXN0ZW5lciBhZGRlZCB0byB0aGUgcG9pbnRlciB3aGVuIGRyYWdnaW5nIHN0YXJ0cyBzbyB0aGF0IHdlIGNhbiBhdHRhY2ggYSBsaXN0ZW5lciBhbmQgcHJvdmlkZSBhIGNoYW5uZWwgb2ZcclxuICAvLyBjb21tdW5pY2F0aW9uIHRvIHRoZSBBbmltYXRlZFBhblpvb21MaXN0ZW5lciB0byBkZWZpbmUgY3VzdG9tIGJlaGF2aW9yIGZvciBzY3JlZW4gcGFubmluZyBkdXJpbmcgYSBkcmFnIG9wZXJhdGlvbi5cclxuICBwcml2YXRlIHJlYWRvbmx5IF9wb2ludGVyTGlzdGVuZXI6IFRJbnB1dExpc3RlbmVyO1xyXG5cclxuICAvLyBBIHJlZmVyZW5jZSB0byB0aGUgUG9pbnRlciBkdXJpbmcgYSBkcmFnIG9wZXJhdGlvbiBzbyB0aGF0IHdlIGNhbiBhZGQvcmVtb3ZlIHRoZSBfcG9pbnRlckxpc3RlbmVyLlxyXG4gIHByaXZhdGUgX3BvaW50ZXI6IFBET01Qb2ludGVyIHwgbnVsbDtcclxuXHJcbiAgLy8gV2hldGhlciB3ZSBhcmUgdXNpbmcgYSB2ZWxvY2l0eSBpbXBsZW1lbnRhdGlvbiBvciBkZWx0YSBpbXBsZW1lbnRhdGlvbiBmb3IgZHJhZ2dpbmcuIFNlZSBvcHRpb25zXHJcbiAgLy8gZHJhZ0RlbHRhIGFuZCBkcmFnVmVsb2NpdHkgZm9yIG1vcmUgaW5mb3JtYXRpb24uXHJcbiAgcHJpdmF0ZSByZWFkb25seSB1c2VEcmFnVmVsb2NpdHk6IGJvb2xlYW47XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogS2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zICkge1xyXG5cclxuICAgIC8vIFVzZSBlaXRoZXIgZHJhZ1ZlbG9jaXR5IG9yIGRyYWdEZWx0YSwgY2Fubm90IHVzZSBib3RoIGF0IHRoZSBzYW1lIHRpbWUuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zKCBwcm92aWRlZE9wdGlvbnMsIFsgJ2RyYWdWZWxvY2l0eScsICdzaGlmdERyYWdWZWxvY2l0eScgXSwgWyAnZHJhZ0RlbHRhJywgJ3NoaWZ0RHJhZ0RlbHRhJyBdICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zKCBwcm92aWRlZE9wdGlvbnMsIFsgJ21hcFBvc2l0aW9uJyBdLCBbICdkcmFnQm91bmRzUHJvcGVydHknIF0gKTtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEtleWJvYXJkRHJhZ0xpc3RlbmVyT3B0aW9ucywgU2VsZk9wdGlvbnMsIEVuYWJsZWRDb21wb25lbnRPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBkZWZhdWx0IG1vdmVzIHRoZSBvYmplY3Qgcm91Z2hseSA2MDAgdmlldyBjb29yZGluYXRlcyBldmVyeSBzZWNvbmQsIGFzc3VtaW5nIDYwIGZwc1xyXG4gICAgICBkcmFnRGVsdGE6IDEwLFxyXG4gICAgICBzaGlmdERyYWdEZWx0YTogNSxcclxuICAgICAgZHJhZ1ZlbG9jaXR5OiAwLFxyXG4gICAgICBzaGlmdERyYWdWZWxvY2l0eTogMCxcclxuICAgICAga2V5Ym9hcmREcmFnRGlyZWN0aW9uOiAnYm90aCcsXHJcbiAgICAgIHBvc2l0aW9uUHJvcGVydHk6IG51bGwsXHJcbiAgICAgIHRyYW5zZm9ybTogbnVsbCxcclxuICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiBudWxsLFxyXG4gICAgICBtYXBQb3NpdGlvbjogbnVsbCxcclxuICAgICAgc3RhcnQ6IG51bGwsXHJcbiAgICAgIGRyYWc6IG51bGwsXHJcbiAgICAgIGVuZDogbnVsbCxcclxuICAgICAgbW92ZU9uSG9sZERlbGF5OiAwLFxyXG4gICAgICBtb3ZlT25Ib2xkSW50ZXJ2YWw6IDEwMDAgLyA2MCwgLy8gYW4gYXZlcmFnZSBkdCB2YWx1ZSBhdCA2MCBmcmFtZXMgYSBzZWNvbmRcclxuICAgICAgaG90a2V5SG9sZEludGVydmFsOiA4MDAsXHJcbiAgICAgIHBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZDogZmFsc2UsXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxyXG5cclxuICAgICAgLy8gRHJhZ0xpc3RlbmVyIGJ5IGRlZmF1bHQgZG9lc24ndCBhbGxvdyBQaEVULWlPIHRvIHRyaWdnZXIgZHJhZyBBY3Rpb24gZXZlbnRzXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnNoaWZ0RHJhZ1ZlbG9jaXR5IDw9IG9wdGlvbnMuZHJhZ1ZlbG9jaXR5LCAnc2hpZnREcmFnVmVsb2NpdHkgc2hvdWxkIGJlIGxlc3MgdGhhbiBvciBlcXVhbCB0byBzaGlmdERyYWdWZWxvY2l0eSwgaXQgaXMgaW50ZW5kZWQgdG8gcHJvdmlkZSBtb3JlIGZpbmUtZ3JhaW5lZCBjb250cm9sJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5zaGlmdERyYWdEZWx0YSA8PSBvcHRpb25zLmRyYWdEZWx0YSwgJ3NoaWZ0RHJhZ0RlbHRhIHNob3VsZCBiZSBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gZHJhZ0RlbHRhLCBpdCBpcyBpbnRlbmRlZCB0byBwcm92aWRlIG1vcmUgZmluZS1ncmFpbmVkIGNvbnRyb2wnICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBtdXRhYmxlIGF0dHJpYnV0ZXMgZGVjbGFyZWQgZnJvbSBvcHRpb25zLCBzZWUgb3B0aW9ucyBmb3IgaW5mbywgYXMgd2VsbCBhcyBnZXR0ZXJzIGFuZCBzZXR0ZXJzXHJcbiAgICB0aGlzLl9zdGFydCA9IG9wdGlvbnMuc3RhcnQ7XHJcbiAgICB0aGlzLl9kcmFnID0gb3B0aW9ucy5kcmFnO1xyXG4gICAgdGhpcy5fZW5kID0gb3B0aW9ucy5lbmQ7XHJcbiAgICB0aGlzLl9kcmFnQm91bmRzUHJvcGVydHkgPSAoIG9wdGlvbnMuZHJhZ0JvdW5kc1Byb3BlcnR5IHx8IG5ldyBQcm9wZXJ0eSggbnVsbCApICk7XHJcbiAgICB0aGlzLl9tYXBQb3NpdGlvbiA9IG9wdGlvbnMubWFwUG9zaXRpb247XHJcbiAgICB0aGlzLl90cmFuc2Zvcm0gPSBvcHRpb25zLnRyYW5zZm9ybTtcclxuICAgIHRoaXMuX3Bvc2l0aW9uUHJvcGVydHkgPSBvcHRpb25zLnBvc2l0aW9uUHJvcGVydHk7XHJcbiAgICB0aGlzLl9kcmFnVmVsb2NpdHkgPSBvcHRpb25zLmRyYWdWZWxvY2l0eTtcclxuICAgIHRoaXMuX3NoaWZ0RHJhZ1ZlbG9jaXR5ID0gb3B0aW9ucy5zaGlmdERyYWdWZWxvY2l0eTtcclxuICAgIHRoaXMuX2RyYWdEZWx0YSA9IG9wdGlvbnMuZHJhZ0RlbHRhO1xyXG4gICAgdGhpcy5fc2hpZnREcmFnRGVsdGEgPSBvcHRpb25zLnNoaWZ0RHJhZ0RlbHRhO1xyXG4gICAgdGhpcy5fbW92ZU9uSG9sZERlbGF5ID0gb3B0aW9ucy5tb3ZlT25Ib2xkRGVsYXk7XHJcbiAgICB0aGlzLm1vdmVPbkhvbGRJbnRlcnZhbCA9IG9wdGlvbnMubW92ZU9uSG9sZEludGVydmFsO1xyXG4gICAgdGhpcy5faG90a2V5SG9sZEludGVydmFsID0gb3B0aW9ucy5ob3RrZXlIb2xkSW50ZXJ2YWw7XHJcbiAgICB0aGlzLl9rZXlib2FyZERyYWdEaXJlY3Rpb24gPSBvcHRpb25zLmtleWJvYXJkRHJhZ0RpcmVjdGlvbjtcclxuXHJcbiAgICB0aGlzLmtleVN0YXRlID0gW107XHJcbiAgICB0aGlzLl9ob3RrZXlzID0gW107XHJcbiAgICB0aGlzLmN1cnJlbnRIb3RrZXkgPSBudWxsO1xyXG4gICAgdGhpcy5ob3RrZXlEaXNhYmxpbmdEcmFnZ2luZyA9IGZhbHNlO1xyXG5cclxuICAgIC8vIFRoaXMgaXMgaW5pdGlhbGl6ZWQgdG8gdGhlIFwidGhyZXNob2xkXCIgc28gdGhhdCB0aGUgZmlyc3QgaG90a2V5IHdpbGwgZmlyZSBpbW1lZGlhdGVseS4gT25seSBzdWJzZXF1ZW50IGFjdGlvbnNcclxuICAgIC8vIHdoaWxlIGhvbGRpbmcgdGhlIGhvdGtleSBzaG91bGQgcmVzdWx0IGluIGEgZGVsYXkgb2YgdGhpcyBtdWNoLiBpbiBtc1xyXG4gICAgdGhpcy5ob3RrZXlIb2xkSW50ZXJ2YWxDb3VudGVyID0gdGhpcy5faG90a2V5SG9sZEludGVydmFsO1xyXG5cclxuICAgIC8vIGZvciByZWFkYWJpbGl0eSAtIHNpbmNlIGRyYWdWZWxvY2l0eSBhbmQgZHJhZ0RlbHRhIGFyZSBtdXR1YWxseSBleGNsdXNpdmUsIGEgdmFsdWUgZm9yIGVpdGhlciBvbmUgb2YgdGhlc2VcclxuICAgIC8vIGluZGljYXRlcyBkcmFnZ2luZyBpbXBsZW1lbnRhdGlvbiBzaG91bGQgdXNlIHZlbG9jaXR5XHJcbiAgICB0aGlzLnVzZURyYWdWZWxvY2l0eSA9IG9wdGlvbnMuZHJhZ1ZlbG9jaXR5ID4gMCB8fCBvcHRpb25zLnNoaWZ0RHJhZ1ZlbG9jaXR5ID4gMDtcclxuXHJcbiAgICB0aGlzLm1vdmVPbkhvbGREZWxheUNvdW50ZXIgPSAwO1xyXG4gICAgdGhpcy5tb3ZlT25Ib2xkSW50ZXJ2YWxDb3VudGVyID0gMDtcclxuXHJcbiAgICB0aGlzLmRlbGF5Q29tcGxldGUgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmRyYWdTdGFydEFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oIGV2ZW50ID0+IHtcclxuICAgICAgY29uc3Qga2V5ID0gS2V5Ym9hcmRVdGlscy5nZXRFdmVudENvZGUoIGV2ZW50LmRvbUV2ZW50ICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGtleSwgJ0hvdyBjYW4gd2UgaGF2ZSBhIG51bGwga2V5IGZvciBLZXlib2FyZERyYWdMaXN0ZW5lcj8nICk7XHJcblxyXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gbW92ZW1lbnQga2V5cyBkb3duLCBhdHRhY2ggYSBsaXN0ZW5lciB0byB0aGUgUG9pbnRlciB0aGF0IHdpbGwgdGVsbCB0aGUgQW5pbWF0ZWRQYW5ab29tTGlzdGVuZXJcclxuICAgICAgLy8gdG8ga2VlcCB0aGlzIE5vZGUgaW4gdmlld1xyXG4gICAgICBpZiAoICF0aGlzLm1vdmVtZW50S2V5c0Rvd24gJiYgS2V5Ym9hcmRVdGlscy5pc01vdmVtZW50S2V5KCBldmVudC5kb21FdmVudCApICkge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3BvaW50ZXIgPT09IG51bGwsICdXZSBzaG91bGQgaGF2ZSBjbGVhcmVkIHRoZSBQb2ludGVyIHJlZmVyZW5jZSBieSBub3cuJyApO1xyXG4gICAgICAgIHRoaXMuX3BvaW50ZXIgPSBldmVudC5wb2ludGVyIGFzIFBET01Qb2ludGVyO1xyXG4gICAgICAgIGV2ZW50LnBvaW50ZXIuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5fcG9pbnRlckxpc3RlbmVyLCB0cnVlICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHVwZGF0ZSB0aGUga2V5IHN0YXRlXHJcbiAgICAgIHRoaXMua2V5U3RhdGUucHVzaCgge1xyXG4gICAgICAgIGtleURvd246IHRydWUsXHJcbiAgICAgICAga2V5OiBrZXkhLFxyXG4gICAgICAgIHRpbWVEb3duOiAwIC8vIGluIG1zXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGlmICggdGhpcy5fc3RhcnQgKSB7XHJcbiAgICAgICAgaWYgKCB0aGlzLm1vdmVtZW50S2V5c0Rvd24gKSB7XHJcbiAgICAgICAgICB0aGlzLl9zdGFydCggZXZlbnQgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGluaXRpYWwgbW92ZW1lbnQgb24gZG93biBzaG91bGQgb25seSBiZSB1c2VkIGZvciBkcmFnRGVsdGEgaW1wbGVtZW50YXRpb25cclxuICAgICAgaWYgKCAhdGhpcy51c2VEcmFnVmVsb2NpdHkgKSB7XHJcblxyXG4gICAgICAgIC8vIG1vdmUgb2JqZWN0IG9uIGZpcnN0IGRvd24gYmVmb3JlIGEgZGVsYXlcclxuICAgICAgICBjb25zdCBwb3NpdGlvbkRlbHRhID0gdGhpcy5zaGlmdEtleURvd24oKSA/IHRoaXMuX3NoaWZ0RHJhZ0RlbHRhIDogdGhpcy5fZHJhZ0RlbHRhO1xyXG4gICAgICAgIHRoaXMudXBkYXRlUG9zaXRpb24oIHBvc2l0aW9uRGVsdGEgKTtcclxuICAgICAgICB0aGlzLm1vdmVPbkhvbGRJbnRlcnZhbENvdW50ZXIgPSAwO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgIHBhcmFtZXRlcnM6IFsgeyBuYW1lOiAnZXZlbnQnLCBwaGV0aW9UeXBlOiBTY2VuZXJ5RXZlbnQuU2NlbmVyeUV2ZW50SU8gfSBdLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RyYWdTdGFydEFjdGlvbicgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW5ldmVyIGEga2V5Ym9hcmQgZHJhZyBzdGFydHMuJyxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IG9wdGlvbnMucGhldGlvUmVhZE9ubHksXHJcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVJcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBFbWl0cyBhbiBldmVudCBldmVyeSBkcmFnXHJcbiAgICAvLyBAZGVwcmVjYXRlZCAtIFVzZSB0aGUgZHJhZyBvcHRpb24gaW5zdGVhZFxyXG4gICAgdGhpcy5kcmFnRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ0VtaXR0ZXInICksXHJcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFbWl0cyB3aGVuZXZlciBhIGtleWJvYXJkIGRyYWcgb2NjdXJzLicsXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiBvcHRpb25zLnBoZXRpb1JlYWRPbmx5LFxyXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5kcmFnRW5kQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggZXZlbnQgPT4ge1xyXG5cclxuICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIG1vdmVtZW50IGtleXMgZG93biwgYXR0YWNoIGEgbGlzdGVuZXIgdG8gdGhlIFBvaW50ZXIgdGhhdCB3aWxsIHRlbGwgdGhlIEFuaW1hdGVkUGFuWm9vbUxpc3RlbmVyXHJcbiAgICAgIC8vIHRvIGtlZXAgdGhpcyBOb2RlIGluIHZpZXdcclxuICAgICAgaWYgKCAhdGhpcy5tb3ZlbWVudEtleXNEb3duICkge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGV2ZW50LnBvaW50ZXIgPT09IHRoaXMuX3BvaW50ZXIsICdIb3cgY291bGQgdGhlIGV2ZW50IFBvaW50ZXIgYmUgYW55dGhpbmcgb3RoZXIgdGhhbiB0aGlzIFBET01Qb2ludGVyPycgKTtcclxuICAgICAgICB0aGlzLl9wb2ludGVyIS5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9wb2ludGVyTGlzdGVuZXIgKTtcclxuICAgICAgICB0aGlzLl9wb2ludGVyID0gbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fZW5kICYmIHRoaXMuX2VuZCggZXZlbnQgKTtcclxuICAgIH0sIHtcclxuICAgICAgcGFyYW1ldGVyczogWyB7IG5hbWU6ICdldmVudCcsIHBoZXRpb1R5cGU6IFNjZW5lcnlFdmVudC5TY2VuZXJ5RXZlbnRJTyB9IF0sXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ0VuZEFjdGlvbicgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW5ldmVyIGEga2V5Ym9hcmQgZHJhZyBlbmRzLicsXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiBvcHRpb25zLnBoZXRpb1JlYWRPbmx5LFxyXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gc3RlcCB0aGUgZHJhZyBsaXN0ZW5lciwgbXVzdCBiZSByZW1vdmVkIGluIGRpc3Bvc2VcclxuICAgIGNvbnN0IHN0ZXBMaXN0ZW5lciA9IHRoaXMuc3RlcC5iaW5kKCB0aGlzICk7XHJcbiAgICBzdGVwVGltZXIuYWRkTGlzdGVuZXIoIHN0ZXBMaXN0ZW5lciApO1xyXG5cclxuICAgIHRoaXMuZW5hYmxlZFByb3BlcnR5LmxhenlMaW5rKCB0aGlzLm9uRW5hYmxlZFByb3BlcnR5Q2hhbmdlLmJpbmQoIHRoaXMgKSApO1xyXG5cclxuICAgIHRoaXMuX3BvaW50ZXJMaXN0ZW5lciA9IHtcclxuICAgICAgbGlzdGVuZXI6IHRoaXMsXHJcbiAgICAgIGludGVycnVwdDogdGhpcy5pbnRlcnJ1cHQuYmluZCggdGhpcyApXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX3BvaW50ZXIgPSBudWxsO1xyXG5cclxuICAgIC8vIGNhbGxlZCBpbiBkaXNwb3NlXHJcbiAgICB0aGlzLl9kaXNwb3NlS2V5Ym9hcmREcmFnTGlzdGVuZXIgPSAoKSA9PiB7XHJcbiAgICAgIHN0ZXBUaW1lci5yZW1vdmVMaXN0ZW5lciggc3RlcExpc3RlbmVyICk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgZHJhZyBib3VuZHMgaW4gbW9kZWwgY29vcmRpbmF0ZXMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldERyYWdCb3VuZHMoKTogQm91bmRzMiB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX2RyYWdCb3VuZHNQcm9wZXJ0eS52YWx1ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgZHJhZ0JvdW5kcygpOiBCb3VuZHMyIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldERyYWdCb3VuZHMoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBkcmFnIHRyYW5zZm9ybSBvZiB0aGUgbGlzdGVuZXIuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFRyYW5zZm9ybSggdHJhbnNmb3JtOiBUcmFuc2Zvcm0zIHwgVFJlYWRPbmx5UHJvcGVydHk8VHJhbnNmb3JtMz4gfCBudWxsICk6IHZvaWQge1xyXG4gICAgdGhpcy5fdHJhbnNmb3JtID0gdHJhbnNmb3JtO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCB0cmFuc2Zvcm0oIHRyYW5zZm9ybTogVHJhbnNmb3JtMyB8IFRSZWFkT25seVByb3BlcnR5PFRyYW5zZm9ybTM+IHwgbnVsbCApIHsgdGhpcy5zZXRUcmFuc2Zvcm0oIHRyYW5zZm9ybSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgdHJhbnNmb3JtKCk6IFRyYW5zZm9ybTMgfCBUUmVhZE9ubHlQcm9wZXJ0eTxUcmFuc2Zvcm0zPiB8IG51bGwgeyByZXR1cm4gdGhpcy5nZXRUcmFuc2Zvcm0oKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB0cmFuc2Zvcm0gb2YgdGhlIGxpc3RlbmVyLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRUcmFuc2Zvcm0oKTogVHJhbnNmb3JtMyB8IFRSZWFkT25seVByb3BlcnR5PFRyYW5zZm9ybTM+IHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0dGVyIGZvciB0aGUgZHJhZ1ZlbG9jaXR5IHByb3BlcnR5LCBzZWUgb3B0aW9ucy5kcmFnVmVsb2NpdHkgZm9yIG1vcmUgaW5mby5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGRyYWdWZWxvY2l0eSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fZHJhZ1ZlbG9jaXR5OyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHRlciBmb3IgdGhlIGRyYWdWZWxvY2l0eSBwcm9wZXJ0eSwgc2VlIG9wdGlvbnMuZHJhZ1ZlbG9jaXR5IGZvciBtb3JlIGluZm8uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCBkcmFnVmVsb2NpdHkoIGRyYWdWZWxvY2l0eTogbnVtYmVyICkgeyB0aGlzLl9kcmFnVmVsb2NpdHkgPSBkcmFnVmVsb2NpdHk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0dGVyIGZvciB0aGUgc2hpZnREcmFnVmVsb2NpdHkgcHJvcGVydHksIHNlZSBvcHRpb25zLnNoaWZ0RHJhZ1ZlbG9jaXR5IGZvciBtb3JlIGluZm8uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBzaGlmdERyYWdWZWxvY2l0eSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fc2hpZnREcmFnVmVsb2NpdHk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0dGVyIGZvciB0aGUgc2hpZnREcmFnVmVsb2NpdHkgcHJvcGVydHksIHNlZSBvcHRpb25zLnNoaWZ0RHJhZ1ZlbG9jaXR5IGZvciBtb3JlIGluZm8uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCBzaGlmdERyYWdWZWxvY2l0eSggc2hpZnREcmFnVmVsb2NpdHk6IG51bWJlciApIHsgdGhpcy5fc2hpZnREcmFnVmVsb2NpdHkgPSBzaGlmdERyYWdWZWxvY2l0eTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXR0ZXIgZm9yIHRoZSBkcmFnRGVsdGEgcHJvcGVydHksIHNlZSBvcHRpb25zLmRyYWdEZWx0YSBmb3IgbW9yZSBpbmZvLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgZHJhZ0RlbHRhKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9kcmFnRGVsdGE7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0dGVyIGZvciB0aGUgZHJhZ0RlbHRhIHByb3BlcnR5LCBzZWUgb3B0aW9ucy5kcmFnRGVsdGEgZm9yIG1vcmUgaW5mby5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0IGRyYWdEZWx0YSggZHJhZ0RlbHRhOiBudW1iZXIgKSB7IHRoaXMuX2RyYWdEZWx0YSA9IGRyYWdEZWx0YTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXR0ZXIgZm9yIHRoZSBzaGlmdERyYWdEZWx0YSBwcm9wZXJ0eSwgc2VlIG9wdGlvbnMuc2hpZnREcmFnRGVsdGEgZm9yIG1vcmUgaW5mby5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IHNoaWZ0RHJhZ0RlbHRhKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9zaGlmdERyYWdEZWx0YTsgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXR0ZXIgZm9yIHRoZSBzaGlmdERyYWdEZWx0YSBwcm9wZXJ0eSwgc2VlIG9wdGlvbnMuc2hpZnREcmFnRGVsdGEgZm9yIG1vcmUgaW5mby5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0IHNoaWZ0RHJhZ0RlbHRhKCBzaGlmdERyYWdEZWx0YTogbnVtYmVyICkgeyB0aGlzLl9zaGlmdERyYWdEZWx0YSA9IHNoaWZ0RHJhZ0RlbHRhOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHRlciBmb3IgdGhlIG1vdmVPbkhvbGREZWxheSBwcm9wZXJ0eSwgc2VlIG9wdGlvbnMubW92ZU9uSG9sZERlbGF5IGZvciBtb3JlIGluZm8uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBtb3ZlT25Ib2xkRGVsYXkoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX21vdmVPbkhvbGREZWxheTsgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXR0ZXIgZm9yIHRoZSBtb3ZlT25Ib2xkRGVsYXkgcHJvcGVydHksIHNlZSBvcHRpb25zLm1vdmVPbkhvbGREZWxheSBmb3IgbW9yZSBpbmZvLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgbW92ZU9uSG9sZERlbGF5KCBtb3ZlT25Ib2xkRGVsYXk6IG51bWJlciApIHsgdGhpcy5fbW92ZU9uSG9sZERlbGF5ID0gbW92ZU9uSG9sZERlbGF5OyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHRlciBmb3IgdGhlIG1vdmVPbkhvbGRJbnRlcnZhbCBwcm9wZXJ0eSwgc2VlIG9wdGlvbnMubW92ZU9uSG9sZEludGVydmFsIGZvciBtb3JlIGluZm8uXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBtb3ZlT25Ib2xkSW50ZXJ2YWwoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX21vdmVPbkhvbGRJbnRlcnZhbDsgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXR0ZXIgZm9yIHRoZSBtb3ZlT25Ib2xkSW50ZXJ2YWwgcHJvcGVydHksIHNlZSBvcHRpb25zLm1vdmVPbkhvbGRJbnRlcnZhbCBmb3IgbW9yZSBpbmZvLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgbW92ZU9uSG9sZEludGVydmFsKCBtb3ZlT25Ib2xkSW50ZXJ2YWw6IG51bWJlciApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1vdmVPbkhvbGRJbnRlcnZhbCA+IDAsICdpZiB0aGUgbW92ZU9uSG9sZEludGVydmFsIGlzIDAsIHRoZW4gdGhlIGRyYWdnaW5nIHdpbGwgYmUgJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGVwZW5kZW50IG9uIGhvdyBvZnRlbiB0aGUgZHJhZ0xpc3RlbmVyIGlzIHN0ZXBwZWQnICk7XHJcbiAgICB0aGlzLl9tb3ZlT25Ib2xkSW50ZXJ2YWwgPSBtb3ZlT25Ib2xkSW50ZXJ2YWw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXR0ZXIgZm9yIHRoZSBob3RrZXlIb2xkSW50ZXJ2YWwgcHJvcGVydHksIHNlZSBvcHRpb25zLmhvdGtleUhvbGRJbnRlcnZhbCBmb3IgbW9yZSBpbmZvLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgaG90a2V5SG9sZEludGVydmFsKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9ob3RrZXlIb2xkSW50ZXJ2YWw7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0dGVyIGZvciB0aGUgaG90a2V5SG9sZEludGVydmFsIHByb3BlcnR5LCBzZWUgb3B0aW9ucy5ob3RrZXlIb2xkSW50ZXJ2YWwgZm9yIG1vcmUgaW5mby5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0IGhvdGtleUhvbGRJbnRlcnZhbCggaG90a2V5SG9sZEludGVydmFsOiBudW1iZXIgKSB7IHRoaXMuX2hvdGtleUhvbGRJbnRlcnZhbCA9IGhvdGtleUhvbGRJbnRlcnZhbDsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGlzUHJlc3NlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAhIXRoaXMuX3BvaW50ZXI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGN1cnJlbnQgdGFyZ2V0IE5vZGUgb2YgdGhlIGRyYWcuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEN1cnJlbnRUYXJnZXQoKTogTm9kZSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzUHJlc3NlZCwgJ1dlIGhhdmUgbm8gY3VycmVudFRhcmdldCBpZiB3ZSBhcmUgbm90IHByZXNzZWQnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9wb2ludGVyICYmIHRoaXMuX3BvaW50ZXIudHJhaWwsICdNdXN0IGhhdmUgYSBQb2ludGVyIHdpdGggYW4gYWN0aXZlIHRyYWlsIGlmIHdlIGFyZSBwcmVzc2VkJyApO1xyXG4gICAgcmV0dXJuIHRoaXMuX3BvaW50ZXIhLnRyYWlsIS5sYXN0Tm9kZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmlyZWQgd2hlbiB0aGUgZW5hYmxlZFByb3BlcnR5IGNoYW5nZXNcclxuICAgKi9cclxuICBwcml2YXRlIG9uRW5hYmxlZFByb3BlcnR5Q2hhbmdlKCBlbmFibGVkOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgIWVuYWJsZWQgJiYgdGhpcy5pbnRlcnJ1cHQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEltcGxlbWVudHMga2V5Ym9hcmQgZHJhZ2dpbmcgd2hlbiBsaXN0ZW5lciBpcyBhdHRhY2hlZCB0byB0aGUgTm9kZSwgcHVibGljIGJlY2F1c2UgdGhpcyBpcyBjYWxsZWQgYXMgcGFydCBvZlxyXG4gICAqIHRoZSBTY2VuZXJ5IElucHV0IEFQSSwgYnV0IGNsaWVudHMgc2hvdWxkIG5vdCBjYWxsIHRoaXMgZGlyZWN0bHkuXHJcbiAgICovXHJcbiAgcHVibGljIGtleWRvd24oIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKTogdm9pZCB7XHJcbiAgICBjb25zdCBkb21FdmVudCA9IGV2ZW50LmRvbUV2ZW50IGFzIEtleWJvYXJkRXZlbnQ7XHJcbiAgICBjb25zdCBrZXkgPSBLZXlib2FyZFV0aWxzLmdldEV2ZW50Q29kZSggZG9tRXZlbnQgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGtleSwgJ0hvdyBjYW4gd2UgaGF2ZSBhIG51bGwga2V5IGZyb20gYSBrZXlkb3duIGluIEtleWJvYXJkRHJhZ0xpc3RlbmVyPycgKTtcclxuXHJcbiAgICAvLyBJZiB0aGUgbWV0YSBrZXkgaXMgZG93biAoY29tbWFuZCBrZXkvd2luZG93cyBrZXkpIHByZXZlbnQgbW92ZW1lbnQgYW5kIGRvIG5vdCBwcmV2ZW50RGVmYXVsdC5cclxuICAgIC8vIE1ldGEga2V5ICsgYXJyb3cga2V5IGlzIGEgY29tbWFuZCB0byBnbyBiYWNrIGEgcGFnZSwgYW5kIHdlIG5lZWQgdG8gYWxsb3cgdGhhdC4gQnV0IGFsc28sIG1hY09TXHJcbiAgICAvLyBmYWlscyB0byBwcm92aWRlIGtleXVwIGV2ZW50cyBvbmNlIHRoZSBtZXRhIGtleSBpcyBwcmVzc2VkLCBzZWVcclxuICAgIC8vIGh0dHA6Ly93ZWIuYXJjaGl2ZS5vcmcvd2ViLzIwMTYwMzA0MDIyNDUzL2h0dHA6Ly9iaXRzcHVzaGVkYXJvdW5kLmNvbS9vbi1hLWZldy10aGluZ3MteW91LW1heS1ub3Qta25vdy1hYm91dC10aGUtaGVsbGlzaC1jb21tYW5kLWtleS1hbmQtamF2YXNjcmlwdC1ldmVudHMvXHJcbiAgICBpZiAoIGRvbUV2ZW50Lm1ldGFLZXkgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZXF1aXJlZCB0byB3b3JrIHdpdGggU2FmYXJpIGFuZCBWb2ljZU92ZXIsIG90aGVyd2lzZSBhcnJvdyBrZXlzIHdpbGwgbW92ZSB2aXJ0dWFsIGN1cnNvciwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9iYWxsb29ucy1hbmQtc3RhdGljLWVsZWN0cmljaXR5L2lzc3Vlcy8yMDUjaXNzdWVjb21tZW50LTI2MzQyODAwM1xyXG4gICAgLy8gcHJldmVudCBkZWZhdWx0IGZvciBXQVNEIHRvbywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mcmljdGlvbi9pc3N1ZXMvMTY3XHJcbiAgICBpZiAoIEtleWJvYXJkVXRpbHMuaXNNb3ZlbWVudEtleSggZG9tRXZlbnQgKSApIHtcclxuICAgICAgZG9tRXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZXNlcnZlIGtleWJvYXJkIGV2ZW50cyBmb3IgZHJhZ2dpbmcgdG8gcHJldmVudCBkZWZhdWx0IHBhbm5pbmcgYmVoYXZpb3Igd2l0aCB6b29tIGZlYXR1cmVzXHJcbiAgICBldmVudC5wb2ludGVyLnJlc2VydmVGb3JLZXlib2FyZERyYWcoKTtcclxuXHJcbiAgICAvLyBpZiB0aGUga2V5IGlzIGFscmVhZHkgZG93biwgZG9uJ3QgZG8gYW55dGhpbmcgZWxzZSAod2UgZG9uJ3Qgd2FudCB0byBjcmVhdGUgYSBuZXcga2V5c3RhdGUgb2JqZWN0XHJcbiAgICAvLyBmb3IgYSBrZXkgdGhhdCBpcyBhbHJlYWR5IGJlaW5nIHRyYWNrZWQgYW5kIGRvd24sIG5vciBjYWxsIHN0YXJ0RHJhZyBldmVyeSBrZXlkb3duIGV2ZW50KVxyXG4gICAgaWYgKCB0aGlzLmtleUluTGlzdERvd24oIFsga2V5ISBdICkgKSB7IHJldHVybjsgfVxyXG5cclxuICAgIC8vIFByZXZlbnQgYSBWb2ljZU92ZXIgYnVnIHdoZXJlIHByZXNzaW5nIG11bHRpcGxlIGFycm93IGtleXMgYXQgb25jZSBjYXVzZXMgdGhlIEFUIHRvIHNlbmQgdGhlIHdyb25nIGtleXNcclxuICAgIC8vIHRocm91Z2ggdGhlIGtleXVwIGV2ZW50IC0gYXMgYSB3b3JrYXJvdW5kLCB3ZSBvbmx5IGFsbG93IG9uZSBhcnJvdyBrZXkgdG8gYmUgZG93biBhdCBhIHRpbWUuIElmIHR3byBhcmUgcHJlc3NlZFxyXG4gICAgLy8gZG93biwgd2UgaW1tZWRpYXRlbHkgY2xlYXIgdGhlIGtleXN0YXRlIGFuZCByZXR1cm5cclxuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYmFsbG9vbnMtYW5kLXN0YXRpYy1lbGVjdHJpY2l0eS9pc3N1ZXMvMzg0XHJcbiAgICBpZiAoIHBsYXRmb3JtLnNhZmFyaSApIHtcclxuICAgICAgaWYgKCBLZXlib2FyZFV0aWxzLmlzQXJyb3dLZXkoIGRvbUV2ZW50ICkgKSB7XHJcbiAgICAgICAgaWYgKCB0aGlzLmtleUluTGlzdERvd24oIFtcclxuICAgICAgICAgIEtleWJvYXJkVXRpbHMuS0VZX1JJR0hUX0FSUk9XLCBLZXlib2FyZFV0aWxzLktFWV9MRUZUX0FSUk9XLFxyXG4gICAgICAgICAgS2V5Ym9hcmRVdGlscy5LRVlfVVBfQVJST1csIEtleWJvYXJkVXRpbHMuS0VZX0RPV05fQVJST1cgXSApICkge1xyXG4gICAgICAgICAgdGhpcy5pbnRlcnJ1cHQoKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNhbkRyYWcoKSAmJiB0aGlzLmRyYWdTdGFydEFjdGlvbi5leGVjdXRlKCBldmVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQmVoYXZpb3IgZm9yIGtleWJvYXJkICd1cCcgRE9NIGV2ZW50LiBQdWJsaWMgc28gaXQgY2FuIGJlIGF0dGFjaGVkIHdpdGggYWRkSW5wdXRMaXN0ZW5lcigpXHJcbiAgICpcclxuICAgKiBOb3RlIHRoYXQgdGhpcyBldmVudCBpcyBhc3NpZ25lZCBpbiB0aGUgY29uc3RydWN0b3IsIGFuZCBub3QgdG8gdGhlIHByb3RvdHlwZS4gQXMgb2Ygd3JpdGluZyB0aGlzLFxyXG4gICAqIGBOb2RlLmFkZElucHV0TGlzdGVuZXJgIG9ubHkgc3VwcG9ydHMgdHlwZSBwcm9wZXJ0aWVzIGFzIGV2ZW50IGxpc3RlbmVycywgYW5kIG5vdCB0aGUgZXZlbnQga2V5cyBhc1xyXG4gICAqIHByb3RvdHlwZSBtZXRob2RzLiBQbGVhc2Ugc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84NTEgZm9yIG1vcmUgaW5mb3JtYXRpb24uXHJcbiAgICovXHJcbiAgcHVibGljIGtleXVwKCBldmVudDogU2NlbmVyeUV2ZW50ICk6IHZvaWQge1xyXG4gICAgY29uc3QgZG9tRXZlbnQgPSBldmVudC5kb21FdmVudCBhcyBLZXlib2FyZEV2ZW50O1xyXG4gICAgY29uc3Qga2V5ID0gS2V5Ym9hcmRVdGlscy5nZXRFdmVudENvZGUoIGRvbUV2ZW50ICk7XHJcblxyXG4gICAgY29uc3QgbW92ZUtleXNEb3duID0gdGhpcy5tb3ZlbWVudEtleXNEb3duO1xyXG5cclxuICAgIC8vIGlmIHRoZSBzaGlmdCBrZXkgaXMgZG93biB3aGVuIHdlIG5hdmlnYXRlIHRvIHRoZSBvYmplY3QsIGFkZCBpdCB0byB0aGUga2V5c3RhdGUgYmVjYXVzZSBpdCB3b24ndCBiZSBhZGRlZCB1bnRpbFxyXG4gICAgLy8gdGhlIG5leHQga2V5ZG93biBldmVudFxyXG4gICAgaWYgKCBrZXkgPT09IEtleWJvYXJkVXRpbHMuS0VZX1RBQiApIHtcclxuICAgICAgaWYgKCBkb21FdmVudC5zaGlmdEtleSApIHtcclxuXHJcbiAgICAgICAgLy8gYWRkICdzaGlmdCcgdG8gdGhlIGtleXN0YXRlIHVudGlsIGl0IGlzIHJlbGVhc2VkIGFnYWluXHJcbiAgICAgICAgdGhpcy5rZXlTdGF0ZS5wdXNoKCB7XHJcbiAgICAgICAgICBrZXlEb3duOiB0cnVlLFxyXG4gICAgICAgICAga2V5OiBLZXlib2FyZFV0aWxzLktFWV9TSElGVF9MRUZULFxyXG4gICAgICAgICAgdGltZURvd246IDAgLy8gaW4gbXNcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmtleVN0YXRlLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIGtleSA9PT0gdGhpcy5rZXlTdGF0ZVsgaSBdLmtleSApIHtcclxuICAgICAgICB0aGlzLmtleVN0YXRlLnNwbGljZSggaSwgMSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbW92ZUtleXNTdGlsbERvd24gPSB0aGlzLm1vdmVtZW50S2V5c0Rvd247XHJcblxyXG4gICAgLy8gaWYgbW92ZW1lbnQga2V5cyBhcmUgbm8gbG9uZ2VyIGRvd24gYWZ0ZXIga2V5dXAsIGNhbGwgdGhlIG9wdGlvbmFsIGVuZCBkcmFnIGZ1bmN0aW9uXHJcbiAgICBpZiAoICFtb3ZlS2V5c1N0aWxsRG93biAmJiBtb3ZlS2V5c0Rvd24gIT09IG1vdmVLZXlzU3RpbGxEb3duICkge1xyXG4gICAgICB0aGlzLmRyYWdFbmRBY3Rpb24uZXhlY3V0ZSggZXZlbnQgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBhbnkgY3VycmVudCBob3RrZXkga2V5cyBhcmUgbm8gbG9uZ2VyIGRvd24sIGNsZWFyIG91dCB0aGUgY3VycmVudCBob3RrZXkgYW5kIHJlc2V0LlxyXG4gICAgaWYgKCB0aGlzLmN1cnJlbnRIb3RrZXkgJiYgIXRoaXMuYWxsS2V5c0luTGlzdERvd24oIHRoaXMuY3VycmVudEhvdGtleS5rZXlzICkgKSB7XHJcbiAgICAgIHRoaXMucmVzZXRIb3RrZXlTdGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucmVzZXRQcmVzc0FuZEhvbGQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVycnVwdHMgYW5kIHJlc2V0cyB0aGUgbGlzdGVuZXIgb24gYmx1ciBzbyB0aGF0IGxpc3RlbmVyIHN0YXRlIGlzIHJlc2V0IGFuZCBrZXlzIGFyZSByZW1vdmVkIGZyb20gdGhlIGtleVN0YXRlXHJcbiAgICogYXJyYXkuIFB1YmxpYyBiZWNhdXNlIHRoaXMgaXMgY2FsbGVkIHdpdGggdGhlIHNjZW5lcnkgbGlzdGVuZXIgQVBJLiBDbGllbnRzIHNob3VsZCBub3QgY2FsbCB0aGlzIGRpcmVjdGx5LlxyXG4gICAqXHJcbiAgICogZm9jdXNvdXQgYnViYmxlcywgd2hpY2ggaXMgaW1wb3J0YW50IHNvIHRoYXQgdGhlIHdvcmsgb2YgaW50ZXJydXB0IGhhcHBlbnMgYXMgZm9jdXMgbW92ZXMgYmV0d2VlbiBjaGlsZHJlbiBvZlxyXG4gICAqIGEgcGFyZW50IHdpdGggYSBLZXlib2FyZERyYWdMaXN0ZW5lciwgd2hpY2ggY2FuIGNyZWF0ZSBzdGF0ZSBmb3IgdGhlIGtleXN0YXRlLlxyXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTQ2MS5cclxuICAgKi9cclxuICBwdWJsaWMgZm9jdXNvdXQoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKTogdm9pZCB7XHJcbiAgICB0aGlzLmludGVycnVwdCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcCBmdW5jdGlvbiBmb3IgdGhlIGRyYWcgaGFuZGxlci4gSmF2YVNjcmlwdCBkb2VzIG5vdCBuYXRpdmVseSBoYW5kbGUgbXVsdGlwbGUga2V5ZG93biBldmVudHMgYXQgb25jZSxcclxuICAgKiBzbyB3ZSBuZWVkIHRvIHRyYWNrIHRoZSBzdGF0ZSBvZiB0aGUga2V5Ym9hcmQgaW4gYW4gT2JqZWN0IGFuZCBtYW5hZ2UgZHJhZ2dpbmcgaW4gdGhpcyBmdW5jdGlvbi5cclxuICAgKiBJbiBvcmRlciBmb3IgdGhlIGRyYWcgaGFuZGxlciB0byB3b3JrLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGR0IC0gaW4gc2Vjb25kc1xyXG4gICAqL1xyXG4gIHByaXZhdGUgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBkdCBpcyBpbiBzZWNvbmRzIGFuZCB3ZSBjb252ZXJ0IHRvIG1zXHJcbiAgICBjb25zdCBtcyA9IGR0ICogMTAwMDtcclxuXHJcbiAgICAvLyBuby1vcCB1bmxlc3MgYSBrZXkgaXMgZG93blxyXG4gICAgaWYgKCB0aGlzLmtleVN0YXRlLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgIC8vIGZvciBlYWNoIGtleSB0aGF0IGlzIHN0aWxsIGRvd24sIGluY3JlbWVudCB0aGUgdHJhY2tlZCB0aW1lIHRoYXQgaGFzIGJlZW4gZG93blxyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmtleVN0YXRlLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGlmICggdGhpcy5rZXlTdGF0ZVsgaSBdLmtleURvd24gKSB7XHJcbiAgICAgICAgICB0aGlzLmtleVN0YXRlWyBpIF0udGltZURvd24gKz0gbXM7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBNb3ZlbWVudCBkZWxheSBjb3VudGVycyBzaG91bGQgb25seSBpbmNyZW1lbnQgaWYgbW92ZW1lbnQga2V5cyBhcmUgcHJlc3NlZCBkb3duLiBUaGV5IHdpbGwgZ2V0IHJlc2V0XHJcbiAgICAgIC8vIGV2ZXJ5IHVwIGV2ZW50LlxyXG4gICAgICBpZiAoIHRoaXMubW92ZW1lbnRLZXlzRG93biApIHtcclxuICAgICAgICB0aGlzLm1vdmVPbkhvbGREZWxheUNvdW50ZXIgKz0gbXM7XHJcbiAgICAgICAgdGhpcy5tb3ZlT25Ib2xkSW50ZXJ2YWxDb3VudGVyICs9IG1zO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB1cGRhdGUgdGltZXIgZm9yIGtleWdyb3VwIGlmIG9uZSBpcyBiZWluZyBoZWxkIGRvd25cclxuICAgICAgaWYgKCB0aGlzLmN1cnJlbnRIb3RrZXkgKSB7XHJcbiAgICAgICAgdGhpcy5ob3RrZXlIb2xkSW50ZXJ2YWxDb3VudGVyICs9IG1zO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgcG9zaXRpb25EZWx0YSA9IDA7XHJcblxyXG4gICAgICBpZiAoIHRoaXMudXNlRHJhZ1ZlbG9jaXR5ICkge1xyXG5cclxuICAgICAgICAvLyBjYWxjdWxhdGUgY2hhbmdlIGluIHBvc2l0aW9uIGZyb20gdGltZSBzdGVwXHJcbiAgICAgICAgY29uc3QgcG9zaXRpb25WZWxvY2l0eVNlY29uZHMgPSB0aGlzLnNoaWZ0S2V5RG93bigpID8gdGhpcy5fc2hpZnREcmFnVmVsb2NpdHkgOiB0aGlzLl9kcmFnVmVsb2NpdHk7XHJcbiAgICAgICAgY29uc3QgcG9zaXRpb25WZWxvY2l0eU1pbGxpc2Vjb25kcyA9IHBvc2l0aW9uVmVsb2NpdHlTZWNvbmRzIC8gMTAwMDtcclxuICAgICAgICBwb3NpdGlvbkRlbHRhID0gbXMgKiBwb3NpdGlvblZlbG9jaXR5TWlsbGlzZWNvbmRzO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBJZiBkcmFnZ2luZyBieSBkZWx0YXMsIHdlIGFyZSBvbmx5IG1vdmFibGUgZXZlcnkgbW92ZU9uSG9sZEludGVydmFsLlxyXG4gICAgICAgIGxldCBtb3ZhYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIFdhaXQgZm9yIGEgbG9uZ2VyIGRlbGF5IChtb3ZlT25Ib2xkRGVsYXkpIG9uIGluaXRpYWwgcHJlc3MgYW5kIGhvbGQuXHJcbiAgICAgICAgaWYgKCB0aGlzLm1vdmVPbkhvbGREZWxheUNvdW50ZXIgPj0gdGhpcy5fbW92ZU9uSG9sZERlbGF5ICYmICF0aGlzLmRlbGF5Q29tcGxldGUgKSB7XHJcbiAgICAgICAgICBtb3ZhYmxlID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMuZGVsYXlDb21wbGV0ZSA9IHRydWU7XHJcbiAgICAgICAgICB0aGlzLm1vdmVPbkhvbGRJbnRlcnZhbENvdW50ZXIgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbCBkZWxheSBpcyBjb21wbGV0ZSwgbm93IHdlIHdpbGwgbW92ZSBldmVyeSBtb3ZlT25Ib2xkSW50ZXJ2YWxcclxuICAgICAgICBpZiAoIHRoaXMuZGVsYXlDb21wbGV0ZSAmJiB0aGlzLm1vdmVPbkhvbGRJbnRlcnZhbENvdW50ZXIgPj0gdGhpcy5fbW92ZU9uSG9sZEludGVydmFsICkge1xyXG4gICAgICAgICAgbW92YWJsZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgLy8gSWYgdXBkYXRpbmcgYXMgYSByZXN1bHQgb2YgdGhlIG1vdmVPbkhvbGRJbnRlcnZhbENvdW50ZXIsIGRvbid0IGF1dG9tYXRpY2FsbHkgdGhyb3cgYXdheSBhbnkgXCJyZW1haW5kZXJcIlxyXG4gICAgICAgICAgLy8gdGltZSBieSBzZXR0aW5nIGJhY2sgdG8gMC4gV2Ugd2FudCB0byBhY2N1bXVsYXRlIHRoZW0gc28gdGhhdCwgbm8gbWF0dGVyIHRoZSBjbG9jayBzcGVlZCBvZiB0aGVcclxuICAgICAgICAgIC8vIHJ1bnRpbWUsIHRoZSBsb25nLXRlcm0gZWZmZWN0IG9mIHRoZSBkcmFnIGlzIGNvbnNpc3RlbnQuXHJcbiAgICAgICAgICBjb25zdCBvdmVyZmxvd1RpbWUgPSB0aGlzLm1vdmVPbkhvbGRJbnRlcnZhbENvdW50ZXIgLSB0aGlzLl9tb3ZlT25Ib2xkSW50ZXJ2YWw7IC8vIG1zXHJcblxyXG4gICAgICAgICAgLy8gVGhpcyBkb2Vzbid0IHRha2UgaW50byBhY2NvdW50IGlmIDIgdXBkYXRlUG9zaXRpb24gY2FsbHMgc2hvdWxkIG9jY3VyIGJhc2VkIG9uIHRoZSBjdXJyZW50IHRpbWluZy5cclxuICAgICAgICAgIHRoaXMubW92ZU9uSG9sZEludGVydmFsQ291bnRlciA9IG92ZXJmbG93VGltZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBvc2l0aW9uRGVsdGEgPSBtb3ZhYmxlID8gKCB0aGlzLnNoaWZ0S2V5RG93bigpID8gdGhpcy5fc2hpZnREcmFnRGVsdGEgOiB0aGlzLl9kcmFnRGVsdGEgKSA6IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggcG9zaXRpb25EZWx0YSA+IDAgKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVQb3NpdGlvbiggcG9zaXRpb25EZWx0YSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgYSBkcmFnIGNhbiBiZWdpbiBmcm9tIGlucHV0IHdpdGggdGhpcyBsaXN0ZW5lci5cclxuICAgKi9cclxuICBwcml2YXRlIGNhbkRyYWcoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5lbmFibGVkUHJvcGVydHkudmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIHN0YXRlIG9mIGhvdGtleXMsIGFuZCBmaXJlIGhvdGtleSBjYWxsYmFja3MgaWYgb25lIGlzIGFjdGl2ZS5cclxuICAgKi9cclxuICBwcml2YXRlIHVwZGF0ZUhvdGtleXMoKTogdm9pZCB7XHJcblxyXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIGFueSBob3RrZXkgY29tYmluYXRpb25zIGFyZSBkb3duXHJcbiAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLl9ob3RrZXlzLmxlbmd0aDsgaisrICkge1xyXG4gICAgICBjb25zdCBob3RrZXlzRG93bkxpc3QgPSBbXTtcclxuICAgICAgY29uc3Qga2V5cyA9IHRoaXMuX2hvdGtleXNbIGogXS5rZXlzO1xyXG5cclxuICAgICAgZm9yICggbGV0IGsgPSAwOyBrIDwga2V5cy5sZW5ndGg7IGsrKyApIHtcclxuICAgICAgICBmb3IgKCBsZXQgbCA9IDA7IGwgPCB0aGlzLmtleVN0YXRlLmxlbmd0aDsgbCsrICkge1xyXG4gICAgICAgICAgaWYgKCB0aGlzLmtleVN0YXRlWyBsIF0ua2V5ID09PSBrZXlzWyBrIF0gKSB7XHJcbiAgICAgICAgICAgIGhvdGtleXNEb3duTGlzdC5wdXNoKCB0aGlzLmtleVN0YXRlWyBsIF0gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFRoZXJlIGlzIG9ubHkgYSBzaW5nbGUgaG90a2V5IGFuZCBpdCBpcyBkb3duLCB0aGUgaG90a2V5cyBtdXN0IGJlIGluIG9yZGVyXHJcbiAgICAgIGxldCBrZXlzSW5PcmRlciA9IGhvdGtleXNEb3duTGlzdC5sZW5ndGggPT09IDEgJiYga2V5cy5sZW5ndGggPT09IDE7XHJcblxyXG4gICAgICAvLyB0aGUgaG90a2V5c0Rvd25MaXN0IGFycmF5IG9yZGVyIHNob3VsZCBtYXRjaCB0aGUgb3JkZXIgb2YgdGhlIGtleSBncm91cCwgc28gbm93IHdlIGp1c3QgbmVlZCB0byBtYWtlXHJcbiAgICAgIC8vIHN1cmUgdGhhdCB0aGUga2V5IGRvd24gdGltZXMgYXJlIGluIHRoZSByaWdodCBvcmRlclxyXG4gICAgICBmb3IgKCBsZXQgbSA9IDA7IG0gPCBob3RrZXlzRG93bkxpc3QubGVuZ3RoIC0gMTsgbSsrICkge1xyXG4gICAgICAgIGlmICggaG90a2V5c0Rvd25MaXN0WyBtICsgMSBdICYmIGhvdGtleXNEb3duTGlzdFsgbSBdLnRpbWVEb3duID4gaG90a2V5c0Rvd25MaXN0WyBtICsgMSBdLnRpbWVEb3duICkge1xyXG4gICAgICAgICAga2V5c0luT3JkZXIgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaWYga2V5cyBhcmUgaW4gb3JkZXIsIGNhbGwgdGhlIGNhbGxiYWNrIGFzc29jaWF0ZWQgd2l0aCB0aGUgZ3JvdXAsIGFuZCBkaXNhYmxlIGRyYWdnaW5nIHVudGlsXHJcbiAgICAgIC8vIGFsbCBob3RrZXlzIGFzc29jaWF0ZWQgd2l0aCB0aGF0IGdyb3VwIGFyZSB1cCBhZ2FpblxyXG4gICAgICBpZiAoIGtleXNJbk9yZGVyICkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudEhvdGtleSA9IHRoaXMuX2hvdGtleXNbIGogXTtcclxuICAgICAgICBpZiAoIHRoaXMuaG90a2V5SG9sZEludGVydmFsQ291bnRlciA+PSB0aGlzLl9ob3RrZXlIb2xkSW50ZXJ2YWwgKSB7XHJcblxyXG4gICAgICAgICAgLy8gU2V0IHRoZSBjb3VudGVyIHRvIGJlZ2luIGNvdW50aW5nIHRoZSBuZXh0IGludGVydmFsIGJldHdlZW4gaG90a2V5IGFjdGl2YXRpb25zLlxyXG4gICAgICAgICAgdGhpcy5ob3RrZXlIb2xkSW50ZXJ2YWxDb3VudGVyID0gMDtcclxuXHJcbiAgICAgICAgICAvLyBjYWxsIHRoZSBjYWxsYmFjayBsYXN0LCBhZnRlciBpbnRlcm5hbCBzdGF0ZSBoYXMgYmVlbiB1cGRhdGVkLiBUaGlzIHNvbHZlcyBhIGJ1ZyBjYXVzZWQgaWYgdGhpcyBjYWxsYmFja1xyXG4gICAgICAgICAgLy8gdGhlbiBtYWtlcyB0aGlzIGxpc3RlbmVyIGludGVycnVwdC5cclxuICAgICAgICAgIHRoaXMuX2hvdGtleXNbIGogXS5jYWxsYmFjaygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGEga2V5IGdyb3VwIGlzIGRvd24sIGNoZWNrIHRvIHNlZSBpZiBhbnkgb2YgdGhvc2Uga2V5cyBhcmUgc3RpbGwgZG93biAtIGlmIHNvLCB3ZSB3aWxsIGRpc2FibGUgZHJhZ2dpbmdcclxuICAgIC8vIHVudGlsIGFsbCBvZiB0aGVtIGFyZSB1cFxyXG4gICAgaWYgKCB0aGlzLmN1cnJlbnRIb3RrZXkgKSB7XHJcbiAgICAgIGlmICggdGhpcy5rZXlJbkxpc3REb3duKCB0aGlzLmN1cnJlbnRIb3RrZXkua2V5cyApICkge1xyXG4gICAgICAgIHRoaXMuaG90a2V5RGlzYWJsaW5nRHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuaG90a2V5RGlzYWJsaW5nRHJhZ2dpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8ga2V5cyBhcmUgbm8gbG9uZ2VyIGRvd24sIGNsZWFyIHRoZSBncm91cFxyXG4gICAgICAgIHRoaXMuY3VycmVudEhvdGtleSA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhhbmRsZSB0aGUgYWN0dWFsIGNoYW5nZSBpbiBwb3NpdGlvbiBvZiBhc3NvY2lhdGVkIG9iamVjdCBiYXNlZCBvbiBjdXJyZW50bHkgcHJlc3NlZCBrZXlzLiBDYWxsZWQgaW4gc3RlcCBmdW5jdGlvblxyXG4gICAqIGFuZCBrZXlkb3duIGxpc3RlbmVyLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGRlbHRhIC0gcG90ZW50aWFsIGNoYW5nZSBpbiBwb3NpdGlvbiBpbiB4IGFuZCB5IGZvciB0aGUgcG9zaXRpb24gUHJvcGVydHlcclxuICAgKi9cclxuICBwcml2YXRlIHVwZGF0ZVBvc2l0aW9uKCBkZWx0YTogbnVtYmVyICk6IHZvaWQge1xyXG5cclxuICAgIC8vIGhvdGtleXMgbWF5IGRpc2FibGUgZHJhZ2dpbmcsIHNvIGRvIHRoaXMgZmlyc3RcclxuICAgIHRoaXMudXBkYXRlSG90a2V5cygpO1xyXG5cclxuICAgIGlmICggIXRoaXMuaG90a2V5RGlzYWJsaW5nRHJhZ2dpbmcgKSB7XHJcblxyXG4gICAgICAvLyBoYW5kbGUgdGhlIGNoYW5nZSBpbiBwb3NpdGlvblxyXG4gICAgICBsZXQgZGVsdGFYID0gMDtcclxuICAgICAgbGV0IGRlbHRhWSA9IDA7XHJcblxyXG4gICAgICBpZiAoIHRoaXMubGVmdE1vdmVtZW50S2V5c0Rvd24oKSApIHtcclxuICAgICAgICBkZWx0YVggLT0gZGVsdGE7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCB0aGlzLnJpZ2h0TW92ZW1lbnRLZXlzRG93bigpICkge1xyXG4gICAgICAgIGRlbHRhWCArPSBkZWx0YTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCB0aGlzLnVwTW92ZW1lbnRLZXlzRG93bigpICkge1xyXG4gICAgICAgIGRlbHRhWSAtPSBkZWx0YTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHRoaXMuZG93bk1vdmVtZW50S2V5c0Rvd24oKSApIHtcclxuICAgICAgICBkZWx0YVkgKz0gZGVsdGE7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIG9ubHkgaW5pdGlhdGUgbW92ZSBpZiB0aGVyZSB3YXMgc29tZSBhdHRlbXB0ZWQga2V5Ym9hcmQgZHJhZ1xyXG4gICAgICBsZXQgdmVjdG9yRGVsdGEgPSBuZXcgVmVjdG9yMiggZGVsdGFYLCBkZWx0YVkgKTtcclxuICAgICAgaWYgKCAhdmVjdG9yRGVsdGEuZXF1YWxzKCBWZWN0b3IyLlpFUk8gKSApIHtcclxuXHJcbiAgICAgICAgLy8gdG8gbW9kZWwgY29vcmRpbmF0ZXNcclxuICAgICAgICBpZiAoIHRoaXMuX3RyYW5zZm9ybSApIHtcclxuICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybSA9IHRoaXMuX3RyYW5zZm9ybSBpbnN0YW5jZW9mIFRyYW5zZm9ybTMgPyB0aGlzLl90cmFuc2Zvcm0gOiB0aGlzLl90cmFuc2Zvcm0udmFsdWU7XHJcblxyXG4gICAgICAgICAgdmVjdG9yRGVsdGEgPSB0cmFuc2Zvcm0uaW52ZXJzZURlbHRhMiggdmVjdG9yRGVsdGEgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHN5bmNocm9uaXplIHdpdGggbW9kZWwgcG9zaXRpb25cclxuICAgICAgICBpZiAoIHRoaXMuX3Bvc2l0aW9uUHJvcGVydHkgKSB7XHJcbiAgICAgICAgICBsZXQgbmV3UG9zaXRpb24gPSB0aGlzLl9wb3NpdGlvblByb3BlcnR5LmdldCgpLnBsdXMoIHZlY3RvckRlbHRhICk7XHJcblxyXG4gICAgICAgICAgbmV3UG9zaXRpb24gPSB0aGlzLm1hcE1vZGVsUG9pbnQoIG5ld1Bvc2l0aW9uICk7XHJcblxyXG4gICAgICAgICAgLy8gdXBkYXRlIHRoZSBwb3NpdGlvbiBpZiBpdCBpcyBkaWZmZXJlbnRcclxuICAgICAgICAgIGlmICggIW5ld1Bvc2l0aW9uLmVxdWFscyggdGhpcy5fcG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApICkge1xyXG4gICAgICAgICAgICB0aGlzLl9wb3NpdGlvblByb3BlcnR5LnNldCggbmV3UG9zaXRpb24gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNhbGwgb3VyIGRyYWcgZnVuY3Rpb25cclxuICAgICAgICBpZiAoIHRoaXMuX2RyYWcgKSB7XHJcbiAgICAgICAgICB0aGlzLl9kcmFnKCB2ZWN0b3JEZWx0YSwgdGhpcyApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5kcmFnRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFwcGx5IGEgbWFwcGluZyBmcm9tIHRoZSBkcmFnIHRhcmdldCdzIG1vZGVsIHBvc2l0aW9uIHRvIGFuIGFsbG93ZWQgbW9kZWwgcG9zaXRpb24uXHJcbiAgICpcclxuICAgKiBBIGNvbW1vbiBleGFtcGxlIGlzIHVzaW5nIGRyYWdCb3VuZHMsIHdoZXJlIHRoZSBwb3NpdGlvbiBvZiB0aGUgZHJhZyB0YXJnZXQgaXMgY29uc3RyYWluZWQgdG8gd2l0aGluIGEgYm91bmRpbmdcclxuICAgKiBib3guIFRoaXMgaXMgZG9uZSBieSBtYXBwaW5nIHBvaW50cyBvdXRzaWRlIHRoZSBib3VuZGluZyBib3ggdG8gdGhlIGNsb3Nlc3QgcG9zaXRpb24gaW5zaWRlIHRoZSBib3guIE1vcmVcclxuICAgKiBnZW5lcmFsIG1hcHBpbmdzIGNhbiBiZSB1c2VkLlxyXG4gICAqXHJcbiAgICogU2hvdWxkIGJlIG92ZXJyaWRkZW4gKG9yIHVzZSBtYXBQb3NpdGlvbikgaWYgYSBjdXN0b20gdHJhbnNmb3JtYXRpb24gaXMgbmVlZGVkLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMgLSBBIHBvaW50IGluIHRoZSBtb2RlbCBjb29yZGluYXRlIGZyYW1lXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIG1hcE1vZGVsUG9pbnQoIG1vZGVsUG9pbnQ6IFZlY3RvcjIgKTogVmVjdG9yMiB7XHJcbiAgICBpZiAoIHRoaXMuX21hcFBvc2l0aW9uICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5fbWFwUG9zaXRpb24oIG1vZGVsUG9pbnQgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLl9kcmFnQm91bmRzUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9kcmFnQm91bmRzUHJvcGVydHkudmFsdWUuY2xvc2VzdFBvaW50VG8oIG1vZGVsUG9pbnQgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gbW9kZWxQb2ludDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBhbnkgb2YgdGhlIGtleXMgaW4gdGhlIGxpc3QgYXJlIGN1cnJlbnRseSBkb3duLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBrZXlJbkxpc3REb3duKCBrZXlzOiBzdHJpbmdbXSApOiBib29sZWFuIHtcclxuICAgIGxldCBrZXlJc0Rvd24gPSBmYWxzZTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMua2V5U3RhdGUubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGlmICggdGhpcy5rZXlTdGF0ZVsgaSBdLmtleURvd24gKSB7XHJcbiAgICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwga2V5cy5sZW5ndGg7IGorKyApIHtcclxuICAgICAgICAgIGlmICgga2V5c1sgaiBdID09PSB0aGlzLmtleVN0YXRlWyBpIF0ua2V5ICkge1xyXG4gICAgICAgICAgICBrZXlJc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBrZXlJc0Rvd24gKSB7XHJcbiAgICAgICAgLy8gbm8gbmVlZCB0byBrZWVwIGxvb2tpbmdcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBrZXlJc0Rvd247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm4gdHJ1ZSBpZiBhbGwga2V5cyBpbiB0aGUgbGlzdCBhcmUgY3VycmVudGx5IGhlbGQgZG93bi5cclxuICAgKi9cclxuICBwdWJsaWMgYWxsS2V5c0luTGlzdERvd24oIGtleXM6IHN0cmluZ1tdICk6IGJvb2xlYW4ge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCgga2V5cy5sZW5ndGggPiAwLCAnWW91IGFyZSB0ZXN0aW5nIHRvIHNlZSBpZiBhbiBlbXB0eSBsaXN0IG9mIGtleXMgaXMgZG93bj8nICk7XHJcblxyXG4gICAgbGV0IGFsbEtleXNEb3duID0gdHJ1ZTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBmb3VuZEtleSA9IF8uZmluZCggdGhpcy5rZXlTdGF0ZSwgcHJlc3NlZEtleVRpbWluZyA9PiBwcmVzc2VkS2V5VGltaW5nLmtleSA9PT0ga2V5c1sgaSBdICk7XHJcbiAgICAgIGlmICggIWZvdW5kS2V5IHx8ICFmb3VuZEtleS5rZXlEb3duICkge1xyXG5cclxuICAgICAgICAvLyBrZXkgaXMgbm90IGluIHRoZSBrZXlzdGF0ZSBvciBpcyBub3QgY3VycmVudGx5IHByZXNzZWQgZG93biwgYWxsIHByb3ZpZGVkIGtleXMgYXJlIG5vdCBkb3duXHJcbiAgICAgICAgYWxsS2V5c0Rvd24gPSBmYWxzZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhbGxLZXlzRG93bjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUga2V5Ym9hcmQga2V5cyBmb3IgdGhlIEtleWJvYXJkRHJhZ0RpcmVjdGlvbiBvZiB0aGlzIEtleWJvYXJkRHJhZ0xpc3RlbmVyLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0S2V5Ym9hcmREcmFnRGlyZWN0aW9uS2V5cygpOiBLZXlib2FyZERyYWdEaXJlY3Rpb25LZXlzIHtcclxuICAgIGNvbnN0IGRpcmVjdGlvbktleXMgPSBLRVlCT0FSRF9EUkFHX0RJUkVDVElPTl9LRVlfTUFQLmdldCggdGhpcy5fa2V5Ym9hcmREcmFnRGlyZWN0aW9uICkhO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZGlyZWN0aW9uS2V5cywgYE5vIGRpcmVjdGlvbiBrZXlzIGZvdW5kIGluIG1hcCBmb3IgS2V5Ym9hcmREcmFnRGlyZWN0aW9uICR7dGhpcy5fa2V5Ym9hcmREcmFnRGlyZWN0aW9ufWAgKTtcclxuICAgIHJldHVybiBkaXJlY3Rpb25LZXlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBrZXlzdGF0ZSBpbmRpY2F0ZXMgdGhhdCBhIGtleSBpcyBkb3duIHRoYXQgc2hvdWxkIG1vdmUgdGhlIG9iamVjdCB0byB0aGUgbGVmdC5cclxuICAgKi9cclxuICBwdWJsaWMgbGVmdE1vdmVtZW50S2V5c0Rvd24oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5rZXlJbkxpc3REb3duKCB0aGlzLmdldEtleWJvYXJkRHJhZ0RpcmVjdGlvbktleXMoKS5sZWZ0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGtleXN0YXRlIGluZGljYXRlcyB0aGF0IGEga2V5IGlzIGRvd24gdGhhdCBzaG91bGQgbW92ZSB0aGUgb2JqZWN0IHRvIHRoZSByaWdodC5cclxuICAgKi9cclxuICBwdWJsaWMgcmlnaHRNb3ZlbWVudEtleXNEb3duKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMua2V5SW5MaXN0RG93biggdGhpcy5nZXRLZXlib2FyZERyYWdEaXJlY3Rpb25LZXlzKCkucmlnaHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUga2V5c3RhdGUgaW5kaWNhdGVzIHRoYXQgYSBrZXkgaXMgZG93biB0aGF0IHNob3VsZCBtb3ZlIHRoZSBvYmplY3QgdXAuXHJcbiAgICovXHJcbiAgcHVibGljIHVwTW92ZW1lbnRLZXlzRG93bigpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmtleUluTGlzdERvd24oIHRoaXMuZ2V0S2V5Ym9hcmREcmFnRGlyZWN0aW9uS2V5cygpLnVwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGtleXN0YXRlIGluZGljYXRlcyB0aGF0IGEga2V5IGlzIGRvd24gdGhhdCBzaG91bGQgbW92ZSB0aGUgdXBqZWN0IGRvd24uXHJcbiAgICovXHJcbiAgcHVibGljIGRvd25Nb3ZlbWVudEtleXNEb3duKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMua2V5SW5MaXN0RG93biggdGhpcy5nZXRLZXlib2FyZERyYWdEaXJlY3Rpb25LZXlzKCkuZG93biApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIGFueSBvZiB0aGUgbW92ZW1lbnQga2V5cyBhcmUgZG93biAoYXJyb3cga2V5cyBvciBXQVNEIGtleXMpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRNb3ZlbWVudEtleXNEb3duKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMucmlnaHRNb3ZlbWVudEtleXNEb3duKCkgfHwgdGhpcy5sZWZ0TW92ZW1lbnRLZXlzRG93bigpIHx8XHJcbiAgICAgICAgICAgdGhpcy51cE1vdmVtZW50S2V5c0Rvd24oKSB8fCB0aGlzLmRvd25Nb3ZlbWVudEtleXNEb3duKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IG1vdmVtZW50S2V5c0Rvd24oKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmdldE1vdmVtZW50S2V5c0Rvd24oKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGVudGVyIGtleSBpcyBjdXJyZW50bHkgcHJlc3NlZCBkb3duLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBlbnRlcktleURvd24oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5rZXlJbkxpc3REb3duKCBbIEtleWJvYXJkVXRpbHMuS0VZX0VOVEVSIF0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUga2V5c3RhdGUgaW5kaWNhdGVzIHRoYXQgdGhlIHNoaWZ0IGtleSBpcyBjdXJyZW50bHkgZG93bi5cclxuICAgKi9cclxuICBwdWJsaWMgc2hpZnRLZXlEb3duKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMua2V5SW5MaXN0RG93biggS2V5Ym9hcmRVdGlscy5TSElGVF9LRVlTICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYSBob3RrZXkgdGhhdCBiZWhhdmVzIHN1Y2ggdGhhdCB0aGUgZGVzaXJlZCBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCB3aGVuIGFsbCBrZXlzIGxpc3RlZCBpbiB0aGUgYXJyYXkgYXJlXHJcbiAgICogcHJlc3NlZCBkb3duIGluIG9yZGVyLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRIb3RrZXkoIGhvdGtleTogSG90a2V5ICk6IHZvaWQge1xyXG4gICAgdGhpcy5faG90a2V5cy5wdXNoKCBob3RrZXkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBhIGhvdGtleSB0aGF0IHdhcyBhZGRlZCB3aXRoIGFkZEhvdGtleS5cclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlSG90a2V5KCBob3RrZXk6IEhvdGtleSApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2hvdGtleXMuaW5jbHVkZXMoIGhvdGtleSApLCAnVHJ5aW5nIHRvIHJlbW92ZSBhIGhvdGtleSB0aGF0IGlzIG5vdCBpbiB0aGUgbGlzdCBvZiBob3RrZXlzLicgKTtcclxuXHJcbiAgICBjb25zdCBob3RrZXlJbmRleCA9IHRoaXMuX2hvdGtleXMuaW5kZXhPZiggaG90a2V5ICk7XHJcbiAgICB0aGlzLl9ob3RrZXlzLnNwbGljZSggaG90a2V5SW5kZXgsIDEgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGhvdGtleXMgb2YgdGhlIEtleWJvYXJkRHJhZ0xpc3RlbmVyIHRvIHBhc3NlZC1pbiBhcnJheS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0SG90a2V5cyggaG90a2V5czogSG90a2V5W10gKTogdm9pZCB7XHJcbiAgICB0aGlzLl9ob3RrZXlzID0gaG90a2V5cy5zbGljZSggMCApOyAvLyBzaGFsbG93IGNvcHlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBzZXRIb3RrZXlzKCkgZm9yIG1vcmUgaW5mb3JtYXRpb24uXHJcbiAgICovXHJcbiAgcHVibGljIHNldCBob3RrZXlzKCBob3RrZXlzOiBIb3RrZXlbXSApIHtcclxuICAgIHRoaXMuc2V0SG90a2V5cyggaG90a2V5cyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYXIgYWxsIGhvdGtleXMgZnJvbSB0aGlzIEtleWJvYXJkRHJhZ0xpc3RlbmVyLlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVBbGxIb3RrZXlzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5faG90a2V5cyA9IFtdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoZSB0aW1lcnMgYW5kIGNvbnRyb2wgdmFyaWFibGVzIGZvciB0aGUgcHJlc3MgYW5kIGhvbGQgZnVuY3Rpb25hbGl0eS5cclxuICAgKi9cclxuICBwcml2YXRlIHJlc2V0UHJlc3NBbmRIb2xkKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kZWxheUNvbXBsZXRlID0gZmFsc2U7XHJcbiAgICB0aGlzLm1vdmVPbkhvbGREZWxheUNvdW50ZXIgPSAwO1xyXG4gICAgdGhpcy5tb3ZlT25Ib2xkSW50ZXJ2YWxDb3VudGVyID0gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyB0aGUgdGltZXJzIGFuZCBjb250cm9sIHZhcmlhYmxlcyBmb3IgdGhlIGhvdGtleSBmdW5jdGlvbmFsaXR5LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgcmVzZXRIb3RrZXlTdGF0ZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuY3VycmVudEhvdGtleSA9IG51bGw7XHJcbiAgICB0aGlzLmhvdGtleUhvbGRJbnRlcnZhbENvdW50ZXIgPSB0aGlzLl9ob3RrZXlIb2xkSW50ZXJ2YWw7IC8vIHJlc2V0IHRvIHRocmVzaG9sZCBzbyB0aGUgaG90a2V5IGZpcmVzIGltbWVkaWF0ZWx5IG5leHQgdGltZS5cclxuICAgIHRoaXMuaG90a2V5RGlzYWJsaW5nRHJhZ2dpbmcgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IHRoZSBrZXlzdGF0ZSBPYmplY3QgdHJhY2tpbmcgd2hpY2gga2V5cyBhcmUgY3VycmVudGx5IHByZXNzZWQgZG93bi5cclxuICAgKi9cclxuICBwdWJsaWMgaW50ZXJydXB0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5rZXlTdGF0ZSA9IFtdO1xyXG4gICAgdGhpcy5yZXNldEhvdGtleVN0YXRlKCk7XHJcbiAgICB0aGlzLnJlc2V0UHJlc3NBbmRIb2xkKCk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9wb2ludGVyICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9wb2ludGVyLmxpc3RlbmVycy5pbmNsdWRlcyggdGhpcy5fcG9pbnRlckxpc3RlbmVyICksXHJcbiAgICAgICAgJ0EgcmVmZXJlbmNlIHRvIHRoZSBQb2ludGVyIG1lYW5zIGl0IHNob3VsZCBoYXZlIHRoZSBwb2ludGVyTGlzdGVuZXInICk7XHJcbiAgICAgIHRoaXMuX3BvaW50ZXIucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5fcG9pbnRlckxpc3RlbmVyICk7XHJcbiAgICAgIHRoaXMuX3BvaW50ZXIgPSBudWxsO1xyXG5cclxuICAgICAgdGhpcy5fZW5kICYmIHRoaXMuX2VuZCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFrZSBlbGlnaWJsZSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5pbnRlcnJ1cHQoKTtcclxuICAgIHRoaXMuX2Rpc3Bvc2VLZXlib2FyZERyYWdMaXN0ZW5lcigpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBrZXkgY29ycmVzcG9uZHMgdG8gYSBrZXkgdGhhdCBzaG91bGQgbW92ZSB0aGUgb2JqZWN0IHRvIHRoZSBsZWZ0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgaXNMZWZ0TW92ZW1lbnRLZXkoIGtleTogc3RyaW5nICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIGtleSA9PT0gS2V5Ym9hcmRVdGlscy5LRVlfQSB8fCBrZXkgPT09IEtleWJvYXJkVXRpbHMuS0VZX0xFRlRfQVJST1c7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGtleSBjb3JyZXNwb25kcyB0byBhIGtleSB0aGF0IHNob3VsZCBtb3ZlIHRoZSBvYmplY3QgdG8gdGhlIHJpZ2h0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgaXNSaWdodE1vdmVtZW50S2V5KCBrZXk6IHN0cmluZyApOiBib29sZWFuIHtcclxuICAgIHJldHVybiBrZXkgPT09IEtleWJvYXJkVXRpbHMuS0VZX0QgfHwga2V5ID09PSBLZXlib2FyZFV0aWxzLktFWV9SSUdIVF9BUlJPVztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUga2V5IGNvcnJlc3BvbmRzIHRvIGEga2V5IHRoYXQgc2hvdWxkIG1vdmUgdGhlIG9iamVjdCB1cC5cclxuICAgKi9cclxuICBwcml2YXRlIHN0YXRpYyBpc1VwTW92ZW1lbnRLZXkoIGtleTogc3RyaW5nICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIGtleSA9PT0gS2V5Ym9hcmRVdGlscy5LRVlfVyB8fCBrZXkgPT09IEtleWJvYXJkVXRpbHMuS0VZX1VQX0FSUk9XO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBrZXkgY29ycmVzcG9uZHMgdG8gYSBrZXkgdGhhdCBzaG91bGQgbW92ZSB0aGUgb2JqZWN0IGRvd24uXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBpc0Rvd25Nb3ZlbWVudEtleSgga2V5OiBzdHJpbmcgKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4ga2V5ID09PSBLZXlib2FyZFV0aWxzLktFWV9TIHx8IGtleSA9PT0gS2V5Ym9hcmRVdGlscy5LRVlfRE9XTl9BUlJPVztcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdLZXlib2FyZERyYWdMaXN0ZW5lcicsIEtleWJvYXJkRHJhZ0xpc3RlbmVyICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBLZXlib2FyZERyYWdMaXN0ZW5lcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFlBQVksTUFBTSxvQ0FBb0M7QUFDN0QsT0FBT0MsZ0JBQWdCLE1BQW1DLHNDQUFzQztBQUNoRyxPQUFPQyxPQUFPLE1BQU0sNkJBQTZCO0FBQ2pELE9BQU9DLFFBQVEsTUFBTSw4QkFBOEI7QUFDbkQsT0FBT0MsU0FBUyxNQUFNLCtCQUErQjtBQUVyRCxPQUFPQyxVQUFVLE1BQU0sK0JBQStCO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsUUFBUSxNQUFNLG1DQUFtQztBQUN4RCxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLE1BQU0sTUFBTSw4QkFBOEI7QUFDakQsU0FBU0MsYUFBYSxFQUFxQkMsT0FBTyxFQUFFQyxZQUFZLFFBQXdCLGVBQWU7QUFFdkcsT0FBT0MsU0FBUyxNQUFNLG9DQUFvQztBQUcxRCxPQUFPQyw4QkFBOEIsTUFBTSx5REFBeUQ7O0FBdUJwRzs7QUFVQSxNQUFNQywrQkFBK0IsR0FBRyxJQUFJQyxHQUFHLENBQW9ELENBQ2pHLENBQUUsTUFBTSxFQUFFO0VBQ1JDLElBQUksRUFBRSxDQUFFUCxhQUFhLENBQUNRLEtBQUssRUFBRVIsYUFBYSxDQUFDUyxjQUFjLENBQUU7RUFDM0RDLEtBQUssRUFBRSxDQUFFVixhQUFhLENBQUNXLGVBQWUsRUFBRVgsYUFBYSxDQUFDWSxLQUFLLENBQUU7RUFDN0RDLEVBQUUsRUFBRSxDQUFFYixhQUFhLENBQUNjLFlBQVksRUFBRWQsYUFBYSxDQUFDZSxLQUFLLENBQUU7RUFDdkRDLElBQUksRUFBRSxDQUFFaEIsYUFBYSxDQUFDaUIsY0FBYyxF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