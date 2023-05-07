// Copyright 2017-2023, University of Colorado Boulder

/**
 * Listens to presses (down events), attaching a listener to the pointer when one occurs, so that a release (up/cancel
 * or interruption) can be recorded.
 *
 * This is the base type for both DragListener and FireListener, which contains the shared logic that would be needed
 * by both.
 *
 * PressListener is fine to use directly, particularly when drag-coordinate information is needed (e.g. DragListener),
 * or if the interaction is more complicated than a simple button fire (e.g. FireListener).
 *
 * For example usage, see scenery/examples/input.html. Additionally, a typical "simple" PressListener direct usage
 * would be something like:
 *
 *   someNode.addInputListener( new PressListener( {
 *     press: () => { ... },
 *     release: () => { ... }
 *   } ) );
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import PhetioAction from '../../../tandem/js/PhetioAction.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import EnabledComponent from '../../../axon/js/EnabledComponent.js';
import createObservableArray from '../../../axon/js/createObservableArray.js';
import stepTimer from '../../../axon/js/stepTimer.js';
import optionize from '../../../phet-core/js/optionize.js';
import EventType from '../../../tandem/js/EventType.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import { Mouse, Node, scenery, SceneryEvent } from '../imports.js';
// global
let globalID = 0;

// Factor out to reduce memory footprint, see https://github.com/phetsims/tandem/issues/71
const truePredicate = _.constant(true);
const isPressedListener = listener => listener.isPressed;
export default class PressListener extends EnabledComponent {
  // Unique global ID for this listener

  // Contains all pointers that are over our button. Tracked by adding with 'enter' events and removing with 'exit'
  // events.
  // (read-only) - Tracks whether this listener is "pressed" or not.
  // (read-only) - It will be set to true when at least one pointer is over the listener.
  // This is not effected by PDOM focus.
  // (read-only) - True when either isOverProperty is true, or when focused and the
  // related Display is showing its focusHighlights, see this.validateOver() for details.
  // (read-only) - It will be set to true when either:
  //   1. The listener is pressed and the pointer that is pressing is over the listener.
  //   2. There is at least one unpressed pointer that is over the listener.
  // (read-only) - It will be set to true when either:
  //   1. The listener is pressed.
  //   2. There is at least one unpressed pointer that is over the listener.
  // This is essentially true when ( isPressed || isHovering ).
  // (read-only) - Whether the listener has focus (should appear to be over)
  // (read-only) - The current pointer, or null when not pressed. There can be short periods of
  // time when this has a value when isPressedProperty.value is false, such as during the processing of a pointer
  // release, but these periods should be very brief.
  // (read-only) - The Trail for the press, with no descendant nodes past the currentTarget
  // or targetNode (if provided). Will generally be null when not pressed, though there can be short periods of time
  // where this has a value when isPressedProperty.value is false, such as during the processing of a release, but
  // these periods should be very brief.
  //(read-only) - Whether the last press was interrupted. Will be valid until the next press.
  // For the collapseDragEvents feature, this will hold the last pending drag event to trigger a call to drag() with,
  // if one has been skipped.
  // Whether our pointer listener is referenced by the pointer (need to have a flag due to handling disposal properly).
  // isHoveringProperty updates (not a DerivedProperty because we need to hook to passed-in properties)
  // isHighlightedProperty updates (not a DerivedProperty because we need to hook to passed-in properties)
  // (read-only) - Whether a press is being processed from a pdom click input event from the PDOM.
  // (read-only) - This Property was added to support input from the PDOM. It tracks whether
  // or not the button should "look" down. This will be true if downProperty is true or if a pdom click is in
  // progress. For a click event from the pdom, the listeners are fired right away but the button will look down for
  // as long as a11yLooksPressedInterval. See PressListener.click() for more details.
  // When pdom clicking begins, this will be added to a timeout so that the
  // pdomClickingProperty is updated after some delay. This is required since an assistive device (like a switch) may
  // send "click" events directly instead of keydown/keyup pairs. If a click initiates while already in progress,
  // this listener will be removed to start the timeout over. null until timout is added.
  // The listener that gets added to the pointer when we are pressed
  // Executed on press event
  // The main implementation of "press" handling is implemented as a callback to the PhetioAction, so things are nested
  // nicely for phet-io.
  // Executed on release event
  // The main implementation of "release" handling is implemented as a callback to the PhetioAction, so things are nested
  // nicely for phet-io.
  // To support looksOverProperty being true based on focus, we need to monitor the display from which
  // the event has come from to see if that display is showing its focusHighlights, see
  // Display.prototype.focusManager.FocusManager.pdomFocusHighlightsVisibleProperty for details.
  // we need the same exact function to add and remove as a listener
  constructor(providedOptions) {
    const options = optionize()({
      press: _.noop,
      release: _.noop,
      targetNode: null,
      drag: _.noop,
      attach: true,
      mouseButton: 0,
      pressCursor: 'pointer',
      useInputListenerCursor: false,
      canStartPress: truePredicate,
      a11yLooksPressedInterval: 100,
      collapseDragEvents: false,
      // EnabledComponent
      // By default, PressListener does not have an instrumented enabledProperty, but you can opt in with this option.
      phetioEnabledPropertyInstrumented: false,
      // phet-io (EnabledComponent)
      // For PhET-iO instrumentation. If only using the PressListener for hover behavior, there is no need to
      // instrument because events are only added to the data stream for press/release and not for hover events. Please pass
      // Tandem.OPT_OUT as the tandem option to not instrument an instance.
      tandem: Tandem.REQUIRED,
      phetioReadOnly: true,
      phetioFeatured: PhetioObject.DEFAULT_OPTIONS.phetioFeatured
    }, providedOptions);
    assert && assert(typeof options.mouseButton === 'number' && options.mouseButton >= 0 && options.mouseButton % 1 === 0, 'mouseButton should be a non-negative integer');
    assert && assert(options.pressCursor === null || typeof options.pressCursor === 'string', 'pressCursor should either be a string or null');
    assert && assert(typeof options.press === 'function', 'The press callback should be a function');
    assert && assert(typeof options.release === 'function', 'The release callback should be a function');
    assert && assert(typeof options.drag === 'function', 'The drag callback should be a function');
    assert && assert(options.targetNode === null || options.targetNode instanceof Node, 'If provided, targetNode should be a Node');
    assert && assert(typeof options.attach === 'boolean', 'attach should be a boolean');
    assert && assert(typeof options.a11yLooksPressedInterval === 'number', 'a11yLooksPressedInterval should be a number');
    super(options);
    this._id = globalID++;
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} construction`);
    this._mouseButton = options.mouseButton;
    this._a11yLooksPressedInterval = options.a11yLooksPressedInterval;
    this._pressCursor = options.pressCursor;
    this._pressListener = options.press;
    this._releaseListener = options.release;
    this._dragListener = options.drag;
    this._canStartPress = options.canStartPress;
    this._targetNode = options.targetNode;
    this._attach = options.attach;
    this._collapseDragEvents = options.collapseDragEvents;
    this.overPointers = createObservableArray();
    this.isPressedProperty = new BooleanProperty(false, {
      reentrant: true
    });
    this.isOverProperty = new BooleanProperty(false);
    this.looksOverProperty = new BooleanProperty(false);
    this.isHoveringProperty = new BooleanProperty(false);
    this.isHighlightedProperty = new BooleanProperty(false);
    this.isFocusedProperty = new BooleanProperty(false);
    this.cursorProperty = new DerivedProperty([this.enabledProperty], enabled => {
      if (options.useInputListenerCursor && enabled && this._attach) {
        return this._pressCursor;
      } else {
        return null;
      }
    });
    this.pointer = null;
    this.pressedTrail = null;
    this.interrupted = false;
    this._pendingCollapsedDragEvent = null;
    this._listeningToPointer = false;
    this._isHoveringListener = this.invalidateHovering.bind(this);
    this._isHighlightedListener = this.invalidateHighlighted.bind(this);
    this.pdomClickingProperty = new BooleanProperty(false);
    this.looksPressedProperty = DerivedProperty.or([this.pdomClickingProperty, this.isPressedProperty]);
    this._pdomClickingTimeoutListener = null;
    this._pointerListener = {
      up: this.pointerUp.bind(this),
      cancel: this.pointerCancel.bind(this),
      move: this.pointerMove.bind(this),
      interrupt: this.pointerInterrupt.bind(this),
      listener: this
    };
    this._pressAction = new PhetioAction(this.onPress.bind(this), {
      tandem: options.tandem.createTandem('pressAction'),
      phetioDocumentation: 'Executes whenever a press occurs. The first argument when executing can be ' + 'used to convey info about the SceneryEvent.',
      phetioReadOnly: true,
      phetioFeatured: options.phetioFeatured,
      phetioEventType: EventType.USER,
      parameters: [{
        name: 'event',
        phetioType: SceneryEvent.SceneryEventIO
      }, {
        phetioPrivate: true,
        valueType: [Node, null]
      }, {
        phetioPrivate: true,
        valueType: ['function', null]
      }]
    });
    this._releaseAction = new PhetioAction(this.onRelease.bind(this), {
      parameters: [{
        name: 'event',
        phetioType: NullableIO(SceneryEvent.SceneryEventIO)
      }, {
        phetioPrivate: true,
        valueType: ['function', null]
      }],
      // phet-io
      tandem: options.tandem.createTandem('releaseAction'),
      phetioDocumentation: 'Executes whenever a release occurs.',
      phetioReadOnly: true,
      phetioFeatured: options.phetioFeatured,
      phetioEventType: EventType.USER
    });
    this.display = null;
    this.boundInvalidateOverListener = this.invalidateOver.bind(this);

    // update isOverProperty (not a DerivedProperty because we need to hook to passed-in properties)
    this.overPointers.lengthProperty.link(this.invalidateOver.bind(this));
    this.isFocusedProperty.link(this.invalidateOver.bind(this));

    // update isHoveringProperty (not a DerivedProperty because we need to hook to passed-in properties)
    this.overPointers.lengthProperty.link(this._isHoveringListener);
    this.isPressedProperty.link(this._isHoveringListener);

    // Update isHovering when any pointer's isDownProperty changes.
    // NOTE: overPointers is cleared on dispose, which should remove all of these (interior) listeners)
    this.overPointers.addItemAddedListener(pointer => pointer.isDownProperty.link(this._isHoveringListener));
    this.overPointers.addItemRemovedListener(pointer => pointer.isDownProperty.unlink(this._isHoveringListener));

    // update isHighlightedProperty (not a DerivedProperty because we need to hook to passed-in properties)
    this.isHoveringProperty.link(this._isHighlightedListener);
    this.isPressedProperty.link(this._isHighlightedListener);
    this.enabledProperty.lazyLink(this.onEnabledPropertyChange.bind(this));
  }

  /**
   * Whether this listener is currently activated with a press.
   */
  get isPressed() {
    return this.isPressedProperty.value;
  }
  get cursor() {
    return this.cursorProperty.value;
  }
  get attach() {
    return this._attach;
  }
  get targetNode() {
    return this._targetNode;
  }

  /**
   * The main node that this listener is responsible for dragging.
   */
  getCurrentTarget() {
    assert && assert(this.isPressed, 'We have no currentTarget if we are not pressed');
    return this.pressedTrail.lastNode();
  }
  get currentTarget() {
    return this.getCurrentTarget();
  }

  /**
   * Returns whether a press can be started with a particular event.
   */
  canPress(event) {
    return !!this.enabledProperty.value && !this.isPressed && this._canStartPress(event, this) && (
    // Only let presses be started with the correct mouse button.
    // @ts-expect-error Typed SceneryEvent
    !(event.pointer instanceof Mouse) || event.domEvent.button === this._mouseButton) && (
    // We can't attach to a pointer that is already attached.
    !this._attach || !event.pointer.isAttached());
  }

  /**
   * Returns whether this PressListener can be clicked from keyboard input. This copies part of canPress, but
   * we didn't want to use canClick in canPress because canClick could be overridden in subtypes.
   */
  canClick() {
    // If this listener is already involved in pressing something (or our options predicate returns false) we can't
    // press something.
    return this.enabledProperty.value && !this.isPressed && this._canStartPress(null, this);
  }

  /**
   * Moves the listener to the 'pressed' state if possible (attaches listeners and initializes press-related
   * properties).
   *
   * This can be overridden (with super-calls) when custom press behavior is needed for a type.
   *
   * This can be called by outside clients in order to try to begin a process (generally on an already-pressed
   * pointer), and is useful if a 'drag' needs to change between listeners. Use canPress( event ) to determine if
   * a press can be started (if needed beforehand).
   *
   * @param event
   * @param [targetNode] - If provided, will take the place of the targetNode for this call. Useful for
   *                              forwarded presses.
   * @param [callback] - to be run at the end of the function, but only on success
   * @returns success - Returns whether the press was actually started
   */
  press(event, targetNode, callback) {
    assert && assert(event, 'An event is required');
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} press`);
    if (!this.canPress(event)) {
      sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} could not press`);
      return false;
    }

    // Flush out a pending drag, so it happens before we press
    this.flushCollapsedDrag();
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} successful press`);
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    this._pressAction.execute(event, targetNode || null, callback || null); // cannot pass undefined into execute call

    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    return true;
  }

  /**
   * Releases a pressed listener.
   *
   * This can be overridden (with super-calls) when custom release behavior is needed for a type.
   *
   * This can be called from the outside to release the press without the pointer having actually fired any 'up'
   * events. If the cancel/interrupt behavior is more preferable, call interrupt() on this listener instead.
   *
   * @param [event] - scenery event if there was one. We can't guarantee an event, in part to support interrupting.
   * @param [callback] - called at the end of the release
   */
  release(event, callback) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} release`);
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();

    // Flush out a pending drag, so it happens before we release
    this.flushCollapsedDrag();
    this._releaseAction.execute(event || null, callback || null); // cannot pass undefined to execute call

    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Called when move events are fired on the attached pointer listener.
   *
   * This can be overridden (with super-calls) when custom drag behavior is needed for a type.
   *
   * (scenery-internal, effectively protected)
   */
  drag(event) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} drag`);
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    assert && assert(this.isPressed, 'Can only drag while pressed');
    this._dragListener(event, this);
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Interrupts the listener, releasing it (canceling behavior).
   *
   * This effectively releases/ends the press, and sets the `interrupted` flag to true while firing these events
   * so that code can determine whether a release/end happened naturally, or was canceled in some way.
   *
   * This can be called manually, but can also be called through node.interruptSubtreeInput().
   */
  interrupt() {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} interrupt`);
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();

    // handle pdom interrupt
    if (this.pdomClickingProperty.value) {
      this.interrupted = true;

      // it is possible we are interrupting a click with a pointer press, in which case
      // we are listening to the Pointer listener - do a full release in this case
      if (this._listeningToPointer) {
        this.release();
      } else {
        // release on interrupt (without going through onRelease, which handles mouse/touch specific things)
        this.isPressedProperty.value = false;
        this._releaseListener(null, this);
      }

      // clear the clicking timer, specific to pdom input
      // @ts-expect-error TODO: This looks buggy, will need to ignore for now
      if (stepTimer.hasListener(this._pdomClickingTimeoutListener)) {
        // @ts-expect-error TODO: This looks buggy, will need to ignore for now
        stepTimer.clearTimeout(this._pdomClickingTimeoutListener);

        // interrupt may be called after the PressListener has been disposed (for instance, internally by scenery
        // if the Node receives a blur event after the PressListener is disposed)
        if (!this.pdomClickingProperty.isDisposed) {
          this.pdomClickingProperty.value = false;
        }
      }
    } else if (this.isPressed) {
      // handle pointer interrupt
      sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} interrupting`);
      this.interrupted = true;
      this.release();
    }
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * This should be called when the listened "Node" is effectively removed from the scene graph AND
   * expected to be placed back in such that it could potentially get multiple "enter" events, see
   * https://github.com/phetsims/scenery/issues/1021
   *
   * This will clear the list of pointers considered "over" the Node, so that when it is placed back in, the state
   * will be correct, and another "enter" event will not be missing an "exit".
   */
  clearOverPointers() {
    this.overPointers.clear(); // We have listeners that will trigger the proper refreshes
  }

  /**
   * If collapseDragEvents is set to true, this step() should be called every frame so that the collapsed drag
   * can be fired.
   */
  step() {
    this.flushCollapsedDrag();
  }

  /**
   * Set the callback that will create a Bounds2 in the global coordinate frame for the AnimatedPanZoomListener to
   * keep in view during a drag operation. During drag input the AnimatedPanZoomListener will pan the screen to
   * try and keep the returned Bounds2 visible. By default, the AnimatedPanZoomListener will try to keep the target of
   * the drag in view but that may not always work if the target is not associated with the translated Node, the target
   * is not defined, or the target has bounds that do not accurately surround the graphic you want to keep in view.
   */
  setCreatePanTargetBounds(createDragPanTargetBounds) {
    // Forwarded to the pointerListener so that the AnimatedPanZoomListener can get this callback from the attached
    // listener
    this._pointerListener.createPanTargetBounds = createDragPanTargetBounds;
  }
  set createPanTargetBounds(createDragPanTargetBounds) {
    this.setCreatePanTargetBounds(createDragPanTargetBounds);
  }

  /**
   * A convenient way to create and set the callback that will return a Bounds2 in the global coordinate frame for the
   * AnimatedPanZoomListener to keep in view during a drag operation. The AnimatedPanZoomListener will try to keep the
   * bounds of the last Node of the provided trail visible by panning the screen during a drag operation. See
   * setCreatePanTargetBounds() for more documentation.
   */
  setCreatePanTargetBoundsFromTrail(trail) {
    assert && assert(trail.length > 0, 'trail has no Nodes to provide localBounds');
    this.setCreatePanTargetBounds(() => trail.localToGlobalBounds(trail.lastNode().localBounds));
  }
  set createPanTargetBoundsFromTrail(trail) {
    this.setCreatePanTargetBoundsFromTrail(trail);
  }

  /**
   * If there is a pending collapsed drag waiting, we'll fire that drag (usually before other events or during a step)
   */
  flushCollapsedDrag() {
    if (this._pendingCollapsedDragEvent) {
      this.drag(this._pendingCollapsedDragEvent);
    }
    this._pendingCollapsedDragEvent = null;
  }

  /**
   * Recomputes the value for isOverProperty. Separate to reduce anonymous function closures.
   */
  invalidateOver() {
    let pointerAttachedToOther = false;
    if (this._listeningToPointer) {
      // this pointer listener is attached to the pointer
      pointerAttachedToOther = false;
    } else {
      // a listener other than this one is attached to the pointer so it should not be considered over
      for (let i = 0; i < this.overPointers.length; i++) {
        if (this.overPointers.get(i).isAttached()) {
          pointerAttachedToOther = true;
          break;
        }
      }
    }

    // isOverProperty is only for the `over` event, looksOverProperty includes focused pressListeners (only when the
    // display is showing focus highlights)
    this.isOverProperty.value = this.overPointers.length > 0 && !pointerAttachedToOther;
    this.looksOverProperty.value = this.isOverProperty.value || this.isFocusedProperty.value && !!this.display && this.display.focusManager.pdomFocusHighlightsVisibleProperty.value;
  }

  /**
   * Recomputes the value for isHoveringProperty. Separate to reduce anonymous function closures.
   */
  invalidateHovering() {
    for (let i = 0; i < this.overPointers.length; i++) {
      const pointer = this.overPointers[i];
      if (!pointer.isDown || pointer === this.pointer) {
        this.isHoveringProperty.value = true;
        return;
      }
    }
    this.isHoveringProperty.value = false;
  }

  /**
   * Recomputes the value for isHighlightedProperty. Separate to reduce anonymous function closures.
   */
  invalidateHighlighted() {
    this.isHighlightedProperty.value = this.isHoveringProperty.value || this.isPressedProperty.value;
  }

  /**
   * Fired when the enabledProperty changes
   */
  onEnabledPropertyChange(enabled) {
    !enabled && this.interrupt();
  }

  /**
   * Internal code executed as the first step of a press.
   *
   * @param event
   * @param [targetNode] - If provided, will take the place of the targetNode for this call. Useful for
   *                              forwarded presses.
   * @param [callback] - to be run at the end of the function, but only on success
   */
  onPress(event, targetNode, callback) {
    assert && assert(!this.isDisposed, 'Should not press on a disposed listener');
    const givenTargetNode = targetNode || this._targetNode;

    // Set this properties before the property change, so they are visible to listeners.
    this.pointer = event.pointer;
    this.pressedTrail = givenTargetNode ? givenTargetNode.getUniqueTrail() : event.trail.subtrailTo(event.currentTarget, false);
    this.interrupted = false; // clears the flag (don't set to false before here)

    this.pointer.addInputListener(this._pointerListener, this._attach);
    this._listeningToPointer = true;
    this.pointer.cursor = this.pressedTrail.lastNode().getEffectiveCursor() || this._pressCursor;
    this.isPressedProperty.value = true;

    // Notify after everything else is set up
    this._pressListener(event, this);
    callback && callback();
  }

  /**
   * Internal code executed as the first step of a release.
   *
   * @param event - scenery event if there was one
   * @param [callback] - called at the end of the release
   */
  onRelease(event, callback) {
    assert && assert(this.isPressed, 'This listener is not pressed');
    const pressedListener = this;
    pressedListener.pointer.removeInputListener(this._pointerListener);
    this._listeningToPointer = false;

    // Set the pressed state false *before* invoking the callback, otherwise an infinite loop can result in some
    // circumstances.
    this.isPressedProperty.value = false;

    // Notify after the rest of release is called in order to prevent it from triggering interrupt().
    this._releaseListener(event, this);
    callback && callback();

    // These properties are cleared now, at the end of the onRelease, in case they were needed by the callback or in
    // listeners on the pressed Property.
    pressedListener.pointer.cursor = null;
    this.pointer = null;
    this.pressedTrail = null;
  }

  /**
   * Called with 'down' events (part of the listener API). (scenery-internal)
   *
   * NOTE: Do not call directly. See the press method instead.
   */
  down(event) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} down`);
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    this.press(event);
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Called with 'up' events (part of the listener API). (scenery-internal)
   *
   * NOTE: Do not call directly.
   */
  up(event) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} up`);
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();

    // Recalculate over/hovering Properties.
    this.invalidateOver();
    this.invalidateHovering();
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Called with 'enter' events (part of the listener API). (scenery-internal)
   *
   * NOTE: Do not call directly.
   */
  enter(event) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} enter`);
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    this.overPointers.push(event.pointer);
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Called with `move` events (part of the listener API). It is necessary to check for `over` state changes on move
   * in case a pointer listener gets interrupted and resumes movement over a target. (scenery-internal)
   */
  move(event) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} move`);
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    this.invalidateOver();
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Called with 'exit' events (part of the listener API). (scenery-internal)
   *
   * NOTE: Do not call directly.
   */
  exit(event) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} exit`);
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();

    // NOTE: We don't require the pointer to be included here, since we may have added the listener after the 'enter'
    // was fired. See https://github.com/phetsims/area-model-common/issues/159 for more details.
    if (this.overPointers.includes(event.pointer)) {
      this.overPointers.remove(event.pointer);
    }
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Called with 'up' events from the pointer (part of the listener API) (scenery-internal)
   *
   * NOTE: Do not call directly.
   */
  pointerUp(event) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} pointer up`);
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();

    // Since our callback can get queued up and THEN interrupted before this happens, we'll check to make sure we are
    // still pressed by the time we get here. If not pressed, then there is nothing to do.
    // See https://github.com/phetsims/capacitor-lab-basics/issues/251
    if (this.isPressed) {
      assert && assert(event.pointer === this.pointer);
      this.release(event);
    }
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Called with 'cancel' events from the pointer (part of the listener API) (scenery-internal)
   *
   * NOTE: Do not call directly.
   */
  pointerCancel(event) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} pointer cancel`);
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();

    // Since our callback can get queued up and THEN interrupted before this happens, we'll check to make sure we are
    // still pressed by the time we get here. If not pressed, then there is nothing to do.
    // See https://github.com/phetsims/capacitor-lab-basics/issues/251
    if (this.isPressed) {
      assert && assert(event.pointer === this.pointer);
      this.interrupt(); // will mark as interrupted and release()
    }

    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Called with 'move' events from the pointer (part of the listener API) (scenery-internal)
   *
   * NOTE: Do not call directly.
   */
  pointerMove(event) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} pointer move`);
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();

    // Since our callback can get queued up and THEN interrupted before this happens, we'll check to make sure we are
    // still pressed by the time we get here. If not pressed, then there is nothing to do.
    // See https://github.com/phetsims/capacitor-lab-basics/issues/251
    if (this.isPressed) {
      assert && assert(event.pointer === this.pointer);
      if (this._collapseDragEvents) {
        this._pendingCollapsedDragEvent = event;
      } else {
        this.drag(event);
      }
    }
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Called when the pointer needs to interrupt its current listener (usually so another can be added). (scenery-internal)
   *
   * NOTE: Do not call directly.
   */
  pointerInterrupt() {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} pointer interrupt`);
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    this.interrupt();
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Click listener, called when this is treated as an accessible input listener.
   * In general not needed to be public, but just used in edge cases to get proper click logic for pdom.
   *
   * Handle the click event from DOM for PDOM. Clicks by calling press and release immediately.
   * When assistive technology is used, the browser may not receive 'keydown' or 'keyup' events on input elements, but
   * only a single 'click' event. We need to toggle the pressed state from the single 'click' event.
   *
   * This will fire listeners immediately, but adds a delay for the pdomClickingProperty so that you can make a
   * button look pressed from a single DOM click event. For example usage, see sun/ButtonModel.looksPressedProperty.
   *
   * @param event
   * @param [callback] optionally called immediately after press, but only on successful click
   * @returns success - Returns whether the press was actually started
   */
  click(event, callback) {
    if (this.canClick()) {
      this.interrupted = false; // clears the flag (don't set to false before here)

      this.pdomClickingProperty.value = true;

      // ensure that button is 'focused' so listener can be called while button is down
      this.isFocusedProperty.value = true;
      this.isPressedProperty.value = true;

      // fire the optional callback
      // @ts-expect-error
      this._pressListener(event, this);
      callback && callback();

      // no longer down, don't reset 'over' so button can be styled as long as it has focus
      this.isPressedProperty.value = false;

      // fire the callback from options
      this._releaseListener(event, this);

      // if we are already clicking, remove the previous timeout - this assumes that clearTimeout is a noop if the
      // listener is no longer attached
      // @ts-expect-error TODO: This looks buggy, will need to ignore for now
      stepTimer.clearTimeout(this._pdomClickingTimeoutListener);

      // Now add the timeout back to start over, saving so that it can be removed later. Even when this listener was
      // interrupted from above logic, we still delay setting this to false to support visual "pressing" redraw.
      // @ts-expect-error TODO: This looks buggy, will need to ignore for now
      this._pdomClickingTimeoutListener = stepTimer.setTimeout(() => {
        // the listener may have been disposed before the end of a11yLooksPressedInterval, like if it fires and
        // disposes itself immediately
        if (!this.pdomClickingProperty.isDisposed) {
          this.pdomClickingProperty.value = false;
        }
      }, this._a11yLooksPressedInterval);
    }
    return true;
  }

  /**
   * Focus listener, called when this is treated as an accessible input listener and its target is focused. (scenery-internal)
   * @pdom
   */
  focus(event) {
    // Get the Display related to this accessible event.
    const accessibleDisplays = event.trail.rootNode().getRootedDisplays().filter(display => display.isAccessible());
    assert && assert(accessibleDisplays.length === 1, 'cannot focus node with zero or multiple accessible displays attached');
    //
    this.display = accessibleDisplays[0];
    if (!this.display.focusManager.pdomFocusHighlightsVisibleProperty.hasListener(this.boundInvalidateOverListener)) {
      this.display.focusManager.pdomFocusHighlightsVisibleProperty.link(this.boundInvalidateOverListener);
    }

    // On focus, button should look 'over'.
    this.isFocusedProperty.value = true;
  }

  /**
   * Blur listener, called when this is treated as an accessible input listener.
   * @pdom
   */
  blur() {
    if (this.display) {
      if (this.display.focusManager.pdomFocusHighlightsVisibleProperty.hasListener(this.boundInvalidateOverListener)) {
        this.display.focusManager.pdomFocusHighlightsVisibleProperty.unlink(this.boundInvalidateOverListener);
      }
      this.display = null;
    }

    // On blur, the button should no longer look 'over'.
    this.isFocusedProperty.value = false;
  }

  /**
   * Disposes the listener, releasing references. It should not be used after this.
   */
  dispose() {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} dispose`);
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();

    // We need to release references to any pointers that are over us.
    this.overPointers.clear();
    if (this._listeningToPointer && isPressedListener(this)) {
      this.pointer.removeInputListener(this._pointerListener);
    }

    // These Properties could have already been disposed, for example in the sun button hierarchy, see https://github.com/phetsims/sun/issues/372
    if (!this.isPressedProperty.isDisposed) {
      this.isPressedProperty.unlink(this._isHighlightedListener);
      this.isPressedProperty.unlink(this._isHoveringListener);
    }
    !this.isHoveringProperty.isDisposed && this.isHoveringProperty.unlink(this._isHighlightedListener);
    this._pressAction.dispose();
    this._releaseAction.dispose();
    this.looksPressedProperty.dispose();
    this.pdomClickingProperty.dispose();
    this.cursorProperty.dispose();
    this.isFocusedProperty.dispose();
    this.isHighlightedProperty.dispose();
    this.isHoveringProperty.dispose();
    this.looksOverProperty.dispose();
    this.isOverProperty.dispose();
    this.isPressedProperty.dispose();
    this.overPointers.dispose();

    // Remove references to the stored display, if we have any.
    if (this.display) {
      this.display.focusManager.pdomFocusHighlightsVisibleProperty.unlink(this.boundInvalidateOverListener);
      this.display = null;
    }
    super.dispose();
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }
  static phetioAPI = {
    pressAction: {
      phetioType: PhetioAction.PhetioActionIO([SceneryEvent.SceneryEventIO])
    },
    releaseAction: {
      phetioType: PhetioAction.PhetioActionIO([NullableIO(SceneryEvent.SceneryEventIO)])
    }
  };
}
scenery.register('PressListener', PressListener);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0aW9BY3Rpb24iLCJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbmFibGVkQ29tcG9uZW50IiwiY3JlYXRlT2JzZXJ2YWJsZUFycmF5Iiwic3RlcFRpbWVyIiwib3B0aW9uaXplIiwiRXZlbnRUeXBlIiwiUGhldGlvT2JqZWN0IiwiVGFuZGVtIiwiTnVsbGFibGVJTyIsIk1vdXNlIiwiTm9kZSIsInNjZW5lcnkiLCJTY2VuZXJ5RXZlbnQiLCJnbG9iYWxJRCIsInRydWVQcmVkaWNhdGUiLCJfIiwiY29uc3RhbnQiLCJpc1ByZXNzZWRMaXN0ZW5lciIsImxpc3RlbmVyIiwiaXNQcmVzc2VkIiwiUHJlc3NMaXN0ZW5lciIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInByZXNzIiwibm9vcCIsInJlbGVhc2UiLCJ0YXJnZXROb2RlIiwiZHJhZyIsImF0dGFjaCIsIm1vdXNlQnV0dG9uIiwicHJlc3NDdXJzb3IiLCJ1c2VJbnB1dExpc3RlbmVyQ3Vyc29yIiwiY2FuU3RhcnRQcmVzcyIsImExMXlMb29rc1ByZXNzZWRJbnRlcnZhbCIsImNvbGxhcHNlRHJhZ0V2ZW50cyIsInBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsInRhbmRlbSIsIlJFUVVJUkVEIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9GZWF0dXJlZCIsIkRFRkFVTFRfT1BUSU9OUyIsImFzc2VydCIsIl9pZCIsInNjZW5lcnlMb2ciLCJJbnB1dExpc3RlbmVyIiwiX21vdXNlQnV0dG9uIiwiX2ExMXlMb29rc1ByZXNzZWRJbnRlcnZhbCIsIl9wcmVzc0N1cnNvciIsIl9wcmVzc0xpc3RlbmVyIiwiX3JlbGVhc2VMaXN0ZW5lciIsIl9kcmFnTGlzdGVuZXIiLCJfY2FuU3RhcnRQcmVzcyIsIl90YXJnZXROb2RlIiwiX2F0dGFjaCIsIl9jb2xsYXBzZURyYWdFdmVudHMiLCJvdmVyUG9pbnRlcnMiLCJpc1ByZXNzZWRQcm9wZXJ0eSIsInJlZW50cmFudCIsImlzT3ZlclByb3BlcnR5IiwibG9va3NPdmVyUHJvcGVydHkiLCJpc0hvdmVyaW5nUHJvcGVydHkiLCJpc0hpZ2hsaWdodGVkUHJvcGVydHkiLCJpc0ZvY3VzZWRQcm9wZXJ0eSIsImN1cnNvclByb3BlcnR5IiwiZW5hYmxlZFByb3BlcnR5IiwiZW5hYmxlZCIsInBvaW50ZXIiLCJwcmVzc2VkVHJhaWwiLCJpbnRlcnJ1cHRlZCIsIl9wZW5kaW5nQ29sbGFwc2VkRHJhZ0V2ZW50IiwiX2xpc3RlbmluZ1RvUG9pbnRlciIsIl9pc0hvdmVyaW5nTGlzdGVuZXIiLCJpbnZhbGlkYXRlSG92ZXJpbmciLCJiaW5kIiwiX2lzSGlnaGxpZ2h0ZWRMaXN0ZW5lciIsImludmFsaWRhdGVIaWdobGlnaHRlZCIsInBkb21DbGlja2luZ1Byb3BlcnR5IiwibG9va3NQcmVzc2VkUHJvcGVydHkiLCJvciIsIl9wZG9tQ2xpY2tpbmdUaW1lb3V0TGlzdGVuZXIiLCJfcG9pbnRlckxpc3RlbmVyIiwidXAiLCJwb2ludGVyVXAiLCJjYW5jZWwiLCJwb2ludGVyQ2FuY2VsIiwibW92ZSIsInBvaW50ZXJNb3ZlIiwiaW50ZXJydXB0IiwicG9pbnRlckludGVycnVwdCIsIl9wcmVzc0FjdGlvbiIsIm9uUHJlc3MiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwicGhldGlvRXZlbnRUeXBlIiwiVVNFUiIsInBhcmFtZXRlcnMiLCJuYW1lIiwicGhldGlvVHlwZSIsIlNjZW5lcnlFdmVudElPIiwicGhldGlvUHJpdmF0ZSIsInZhbHVlVHlwZSIsIl9yZWxlYXNlQWN0aW9uIiwib25SZWxlYXNlIiwiZGlzcGxheSIsImJvdW5kSW52YWxpZGF0ZU92ZXJMaXN0ZW5lciIsImludmFsaWRhdGVPdmVyIiwibGVuZ3RoUHJvcGVydHkiLCJsaW5rIiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJpc0Rvd25Qcm9wZXJ0eSIsImFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJ1bmxpbmsiLCJsYXp5TGluayIsIm9uRW5hYmxlZFByb3BlcnR5Q2hhbmdlIiwidmFsdWUiLCJjdXJzb3IiLCJnZXRDdXJyZW50VGFyZ2V0IiwibGFzdE5vZGUiLCJjdXJyZW50VGFyZ2V0IiwiY2FuUHJlc3MiLCJldmVudCIsImRvbUV2ZW50IiwiYnV0dG9uIiwiaXNBdHRhY2hlZCIsImNhbkNsaWNrIiwiY2FsbGJhY2siLCJmbHVzaENvbGxhcHNlZERyYWciLCJwdXNoIiwiZXhlY3V0ZSIsInBvcCIsImhhc0xpc3RlbmVyIiwiY2xlYXJUaW1lb3V0IiwiaXNEaXNwb3NlZCIsImNsZWFyT3ZlclBvaW50ZXJzIiwiY2xlYXIiLCJzdGVwIiwic2V0Q3JlYXRlUGFuVGFyZ2V0Qm91bmRzIiwiY3JlYXRlRHJhZ1BhblRhcmdldEJvdW5kcyIsImNyZWF0ZVBhblRhcmdldEJvdW5kcyIsInNldENyZWF0ZVBhblRhcmdldEJvdW5kc0Zyb21UcmFpbCIsInRyYWlsIiwibGVuZ3RoIiwibG9jYWxUb0dsb2JhbEJvdW5kcyIsImxvY2FsQm91bmRzIiwiY3JlYXRlUGFuVGFyZ2V0Qm91bmRzRnJvbVRyYWlsIiwicG9pbnRlckF0dGFjaGVkVG9PdGhlciIsImkiLCJnZXQiLCJmb2N1c01hbmFnZXIiLCJwZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5IiwiaXNEb3duIiwiZ2l2ZW5UYXJnZXROb2RlIiwiZ2V0VW5pcXVlVHJhaWwiLCJzdWJ0cmFpbFRvIiwiYWRkSW5wdXRMaXN0ZW5lciIsImdldEVmZmVjdGl2ZUN1cnNvciIsInByZXNzZWRMaXN0ZW5lciIsInJlbW92ZUlucHV0TGlzdGVuZXIiLCJkb3duIiwiZW50ZXIiLCJleGl0IiwiaW5jbHVkZXMiLCJyZW1vdmUiLCJjbGljayIsInNldFRpbWVvdXQiLCJmb2N1cyIsImFjY2Vzc2libGVEaXNwbGF5cyIsInJvb3ROb2RlIiwiZ2V0Um9vdGVkRGlzcGxheXMiLCJmaWx0ZXIiLCJpc0FjY2Vzc2libGUiLCJibHVyIiwiZGlzcG9zZSIsInBoZXRpb0FQSSIsInByZXNzQWN0aW9uIiwiUGhldGlvQWN0aW9uSU8iLCJyZWxlYXNlQWN0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQcmVzc0xpc3RlbmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIExpc3RlbnMgdG8gcHJlc3NlcyAoZG93biBldmVudHMpLCBhdHRhY2hpbmcgYSBsaXN0ZW5lciB0byB0aGUgcG9pbnRlciB3aGVuIG9uZSBvY2N1cnMsIHNvIHRoYXQgYSByZWxlYXNlICh1cC9jYW5jZWxcclxuICogb3IgaW50ZXJydXB0aW9uKSBjYW4gYmUgcmVjb3JkZWQuXHJcbiAqXHJcbiAqIFRoaXMgaXMgdGhlIGJhc2UgdHlwZSBmb3IgYm90aCBEcmFnTGlzdGVuZXIgYW5kIEZpcmVMaXN0ZW5lciwgd2hpY2ggY29udGFpbnMgdGhlIHNoYXJlZCBsb2dpYyB0aGF0IHdvdWxkIGJlIG5lZWRlZFxyXG4gKiBieSBib3RoLlxyXG4gKlxyXG4gKiBQcmVzc0xpc3RlbmVyIGlzIGZpbmUgdG8gdXNlIGRpcmVjdGx5LCBwYXJ0aWN1bGFybHkgd2hlbiBkcmFnLWNvb3JkaW5hdGUgaW5mb3JtYXRpb24gaXMgbmVlZGVkIChlLmcuIERyYWdMaXN0ZW5lciksXHJcbiAqIG9yIGlmIHRoZSBpbnRlcmFjdGlvbiBpcyBtb3JlIGNvbXBsaWNhdGVkIHRoYW4gYSBzaW1wbGUgYnV0dG9uIGZpcmUgKGUuZy4gRmlyZUxpc3RlbmVyKS5cclxuICpcclxuICogRm9yIGV4YW1wbGUgdXNhZ2UsIHNlZSBzY2VuZXJ5L2V4YW1wbGVzL2lucHV0Lmh0bWwuIEFkZGl0aW9uYWxseSwgYSB0eXBpY2FsIFwic2ltcGxlXCIgUHJlc3NMaXN0ZW5lciBkaXJlY3QgdXNhZ2VcclxuICogd291bGQgYmUgc29tZXRoaW5nIGxpa2U6XHJcbiAqXHJcbiAqICAgc29tZU5vZGUuYWRkSW5wdXRMaXN0ZW5lciggbmV3IFByZXNzTGlzdGVuZXIoIHtcclxuICogICAgIHByZXNzOiAoKSA9PiB7IC4uLiB9LFxyXG4gKiAgICAgcmVsZWFzZTogKCkgPT4geyAuLi4gfVxyXG4gKiAgIH0gKSApO1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFBoZXRpb0FjdGlvbiBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvUGhldGlvQWN0aW9uLmpzJztcclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW5hYmxlZENvbXBvbmVudCwgeyBFbmFibGVkQ29tcG9uZW50T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL2F4b24vanMvRW5hYmxlZENvbXBvbmVudC5qcyc7XHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXksIHsgT2JzZXJ2YWJsZUFycmF5IH0gZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgc3RlcFRpbWVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvc3RlcFRpbWVyLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFdpdGhvdXROdWxsIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9XaXRob3V0TnVsbC5qcyc7XHJcbmltcG9ydCBFdmVudFR5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL0V2ZW50VHlwZS5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBOdWxsYWJsZUlPIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdWxsYWJsZUlPLmpzJztcclxuaW1wb3J0IHsgRGlzcGxheSwgTW91c2UsIE5vZGUsIFBvaW50ZXIsIHNjZW5lcnksIFNjZW5lcnlFdmVudCwgVElucHV0TGlzdGVuZXIsIFRyYWlsIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XHJcblxyXG4vLyBnbG9iYWxcclxubGV0IGdsb2JhbElEID0gMDtcclxuXHJcbi8vIEZhY3RvciBvdXQgdG8gcmVkdWNlIG1lbW9yeSBmb290cHJpbnQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdGFuZGVtL2lzc3Vlcy83MVxyXG5jb25zdCB0cnVlUHJlZGljYXRlOiAoICggLi4uYXJnczogSW50ZW50aW9uYWxBbnlbXSApID0+IHRydWUgKSA9IF8uY29uc3RhbnQoIHRydWUgKTtcclxuXHJcbmV4cG9ydCB0eXBlIFByZXNzTGlzdGVuZXJET01FdmVudCA9IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50IHwgRm9jdXNFdmVudCB8IEtleWJvYXJkRXZlbnQ7XHJcbmV4cG9ydCB0eXBlIFByZXNzTGlzdGVuZXJFdmVudCA9IFNjZW5lcnlFdmVudDxQcmVzc0xpc3RlbmVyRE9NRXZlbnQ+O1xyXG5leHBvcnQgdHlwZSBQcmVzc0xpc3RlbmVyQ2FsbGJhY2s8TGlzdGVuZXIgZXh0ZW5kcyBQcmVzc0xpc3RlbmVyPiA9ICggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCwgbGlzdGVuZXI6IExpc3RlbmVyICkgPT4gdm9pZDtcclxuZXhwb3J0IHR5cGUgUHJlc3NMaXN0ZW5lck51bGxhYmxlQ2FsbGJhY2s8TGlzdGVuZXIgZXh0ZW5kcyBQcmVzc0xpc3RlbmVyPiA9ICggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCB8IG51bGwsIGxpc3RlbmVyOiBMaXN0ZW5lciApID0+IHZvaWQ7XHJcbmV4cG9ydCB0eXBlIFByZXNzTGlzdGVuZXJDYW5TdGFydFByZXNzQ2FsbGJhY2s8TGlzdGVuZXIgZXh0ZW5kcyBQcmVzc0xpc3RlbmVyPiA9ICggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCB8IG51bGwsIGxpc3RlbmVyOiBMaXN0ZW5lciApID0+IGJvb2xlYW47XHJcblxyXG50eXBlIFNlbGZPcHRpb25zPExpc3RlbmVyIGV4dGVuZHMgUHJlc3NMaXN0ZW5lcj4gPSB7XHJcbiAgLy8gQ2FsbGVkIHdoZW4gdGhpcyBsaXN0ZW5lciBpcyBwcmVzc2VkICh0eXBpY2FsbHkgZnJvbSBhIGRvd24gZXZlbnQsIGJ1dCBjYW4gYmUgdHJpZ2dlcmVkIGJ5IG90aGVyIGhhbmRsZXJzKVxyXG4gIHByZXNzPzogUHJlc3NMaXN0ZW5lckNhbGxiYWNrPExpc3RlbmVyPjtcclxuXHJcbiAgLy8gQ2FsbGVkIHdoZW4gdGhpcyBsaXN0ZW5lciBpcyByZWxlYXNlZC4gTm90ZSB0aGF0IGFuIFNjZW5lcnlFdmVudCBhcmcgY2Fubm90IGJlIGd1YXJhbnRlZWQgZnJvbSB0aGlzIGxpc3RlbmVyLiBUaGlzXHJcbiAgLy8gaXMsIGluIHBhcnQsIHRvIHN1cHBvcnQgaW50ZXJydXB0LiAocG9pbnRlciB1cC9jYW5jZWwgb3IgaW50ZXJydXB0IHdoZW4gcHJlc3NlZC9hZnRlciBjbGljayBmcm9tIHRoZSBwZG9tKS5cclxuICAvLyBOT1RFOiBUaGlzIHdpbGwgYWxzbyBiZSBjYWxsZWQgaWYgdGhlIHByZXNzIGlzIFwicmVsZWFzZWRcIiBkdWUgdG8gYmVpbmcgaW50ZXJydXB0ZWQgb3IgY2FuY2VsZWQuXHJcbiAgcmVsZWFzZT86IFByZXNzTGlzdGVuZXJOdWxsYWJsZUNhbGxiYWNrPExpc3RlbmVyPjtcclxuXHJcbiAgLy8gQ2FsbGVkIHdoZW4gdGhpcyBsaXN0ZW5lciBpcyBkcmFnZ2VkIChtb3ZlIGV2ZW50cyBvbiB0aGUgcG9pbnRlciB3aGlsZSBwcmVzc2VkKVxyXG4gIGRyYWc/OiBQcmVzc0xpc3RlbmVyQ2FsbGJhY2s8TGlzdGVuZXI+O1xyXG5cclxuICAvLyBJZiBwcm92aWRlZCwgdGhlIHByZXNzZWRUcmFpbCAoY2FsY3VsYXRlZCBmcm9tIHRoZSBkb3duIGV2ZW50KSB3aWxsIGJlIHJlcGxhY2VkIHdpdGggdGhlIChzdWIpdHJhaWwgdGhhdCBlbmRzIHdpdGhcclxuICAvLyB0aGUgdGFyZ2V0Tm9kZSBhcyB0aGUgbGVhZi1tb3N0IE5vZGUuIFRoaXMgYWZmZWN0cyB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUgY29tcHV0YXRpb25zLlxyXG4gIC8vIFRoaXMgaXMgaWRlYWxseSB1c2VkIHdoZW4gdGhlIE5vZGUgd2hpY2ggaGFzIHRoaXMgaW5wdXQgbGlzdGVuZXIgaXMgZGlmZmVyZW50IGZyb20gdGhlIE5vZGUgYmVpbmcgdHJhbnNmb3JtZWQsXHJcbiAgLy8gYXMgb3RoZXJ3aXNlIG9mZnNldHMgYW5kIGRyYWcgYmVoYXZpb3Igd291bGQgYmUgaW5jb3JyZWN0IGJ5IGRlZmF1bHQuXHJcbiAgdGFyZ2V0Tm9kZT86IE5vZGUgfCBudWxsO1xyXG5cclxuICAvLyBJZiB0cnVlLCB0aGlzIGxpc3RlbmVyIHdpbGwgbm90IFwicHJlc3NcIiB3aGlsZSB0aGUgYXNzb2NpYXRlZCBwb2ludGVyIGlzIGF0dGFjaGVkLCBhbmQgd2hlbiBwcmVzc2VkLFxyXG4gIC8vIHdpbGwgbWFyayBpdHNlbGYgYXMgYXR0YWNoZWQgdG8gdGhlIHBvaW50ZXIuIElmIHRoaXMgbGlzdGVuZXIgc2hvdWxkIG5vdCBiZSBpbnRlcnJ1cHRlZCBieSBvdGhlcnMgYW5kIGlzbid0XHJcbiAgLy8gYSBcInByaW1hcnlcIiBoYW5kbGVyIG9mIHRoZSBwb2ludGVyJ3MgYmVoYXZpb3IsIHRoaXMgc2hvdWxkIGJlIHNldCB0byBmYWxzZS5cclxuICBhdHRhY2g/OiBib29sZWFuO1xyXG5cclxuICAvLyBSZXN0cmljdHMgdG8gdGhlIHNwZWNpZmljIG1vdXNlIGJ1dHRvbiAoYnV0IGFsbG93cyBhbnkgdG91Y2gpLiBPbmx5IG9uZSBtb3VzZSBidXR0b24gaXMgYWxsb3dlZCBhdFxyXG4gIC8vIGEgdGltZS4gVGhlIGJ1dHRvbiBudW1iZXJzIGFyZSBkZWZpbmVkIGluIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Nb3VzZUV2ZW50L2J1dHRvbixcclxuICAvLyB3aGVyZSB0eXBpY2FsbHk6XHJcbiAgLy8gICAwOiBMZWZ0IG1vdXNlIGJ1dHRvblxyXG4gIC8vICAgMTogTWlkZGxlIG1vdXNlIGJ1dHRvbiAob3Igd2hlZWwgcHJlc3MpXHJcbiAgLy8gICAyOiBSaWdodCBtb3VzZSBidXR0b25cclxuICAvLyAgIDMrOiBvdGhlciBzcGVjaWZpYyBudW1iZXJlZCBidXR0b25zIHRoYXQgYXJlIG1vcmUgcmFyZVxyXG4gIG1vdXNlQnV0dG9uPzogbnVtYmVyO1xyXG5cclxuICAvLyBJZiB0aGUgdGFyZ2V0Tm9kZS9jdXJyZW50VGFyZ2V0IGRvbid0IGhhdmUgYSBjdXN0b20gY3Vyc29yLCB0aGlzIHdpbGwgc2V0IHRoZSBwb2ludGVyIGN1cnNvciB0b1xyXG4gIC8vIHRoaXMgdmFsdWUgd2hlbiB0aGlzIGxpc3RlbmVyIGlzIFwicHJlc3NlZFwiLiBUaGlzIG1lYW5zIHRoYXQgZXZlbiB3aGVuIHRoZSBtb3VzZSBtb3ZlcyBvdXQgb2YgdGhlIG5vZGUgYWZ0ZXJcclxuICAvLyBwcmVzc2luZyBkb3duLCBpdCB3aWxsIHN0aWxsIGhhdmUgdGhpcyBjdXJzb3IgKG92ZXJyaWRpbmcgdGhlIGN1cnNvciBvZiB3aGF0ZXZlciBub2RlcyB0aGUgcG9pbnRlciBtYXkgYmVcclxuICAvLyBvdmVyKS5cclxuICBwcmVzc0N1cnNvcj86IHN0cmluZyB8IG51bGw7XHJcblxyXG4gIC8vIFdoZW4gdHJ1ZSwgYW55IG5vZGUgdGhpcyBsaXN0ZW5lciBpcyBhZGRlZCB0byB3aWxsIHVzZSB0aGlzIGxpc3RlbmVyJ3MgY3Vyc29yIChzZWUgb3B0aW9ucy5wcmVzc0N1cnNvcilcclxuICAvLyBhcyB0aGUgY3Vyc29yIGZvciB0aGF0IG5vZGUuIFRoaXMgb25seSBhcHBsaWVzIGlmIHRoZSBub2RlJ3MgY3Vyc29yIGlzIG51bGwsIHNlZSBOb2RlLmdldEVmZmVjdGl2ZUN1cnNvcigpLlxyXG4gIHVzZUlucHV0TGlzdGVuZXJDdXJzb3I/OiBib29sZWFuO1xyXG5cclxuICAvLyBDaGVja3MgdGhpcyB3aGVuIHRyeWluZyB0byBzdGFydCBhIHByZXNzLiBJZiB0aGlzIGZ1bmN0aW9uIHJldHVybnMgZmFsc2UsIGEgcHJlc3Mgd2lsbCBub3QgYmUgc3RhcnRlZFxyXG4gIGNhblN0YXJ0UHJlc3M/OiBQcmVzc0xpc3RlbmVyQ2FuU3RhcnRQcmVzc0NhbGxiYWNrPExpc3RlbmVyPjtcclxuXHJcbiAgLy8gKGExMXkpIC0gSG93IGxvbmcgc29tZXRoaW5nIHNob3VsZCAnbG9vaycgcHJlc3NlZCBhZnRlciBhbiBhY2Nlc3NpYmxlIGNsaWNrIGlucHV0IGV2ZW50LCBpbiBtc1xyXG4gIGExMXlMb29rc1ByZXNzZWRJbnRlcnZhbD86IG51bWJlcjtcclxuXHJcbiAgLy8gSWYgdHJ1ZSwgbXVsdGlwbGUgZHJhZyBldmVudHMgaW4gYSByb3cgKGJldHdlZW4gc3RlcHMpIHdpbGwgYmUgY29sbGFwc2VkIGludG8gb25lIGRyYWcgZXZlbnRcclxuICAvLyAodXN1YWxseSBmb3IgcGVyZm9ybWFuY2UpIGJ5IGp1c3QgY2FsbGluZyB0aGUgY2FsbGJhY2tzIGZvciB0aGUgbGFzdCBkcmFnIGV2ZW50LiBPdGhlciBldmVudHMgKHByZXNzL3JlbGVhc2VcclxuICAvLyBoYW5kbGluZykgd2lsbCBmb3JjZSB0aHJvdWdoIHRoZSBsYXN0IHBlbmRpbmcgZHJhZyBldmVudC4gQ2FsbGluZyBzdGVwKCkgZXZlcnkgZnJhbWUgd2lsbCB0aGVuIGJlIGdlbmVyYWxseVxyXG4gIC8vIG5lY2Vzc2FyeSB0byBoYXZlIGFjY3VyYXRlLWxvb2tpbmcgZHJhZ3MuIE5PVEUgdGhhdCB0aGlzIG1heSBwdXQgaW4gZXZlbnRzIG91dC1vZi1vcmRlci5cclxuICAvLyBUaGlzIGlzIGFwcHJvcHJpYXRlIHdoZW4gdGhlIGRyYWcgb3BlcmF0aW9uIGlzIGV4cGVuc2l2ZSBwZXJmb3JtYW5jZS13aXNlIEFORCBpZGVhbGx5IHNob3VsZCBvbmx5IGJlIHJ1biBhdFxyXG4gIC8vIG1vc3Qgb25jZSBwZXIgZnJhbWUgKGFueSBtb3JlLCBhbmQgaXQgd291bGQgYmUgYSB3YXN0ZSkuXHJcbiAgY29sbGFwc2VEcmFnRXZlbnRzPzogYm9vbGVhbjtcclxuXHJcbiAgLy8gVGhvdWdoIFByZXNzTGlzdGVuZXIgaXMgbm90IGluc3RydW1lbnRlZCwgZGVjbGFyZSB0aGVzZSBoZXJlIHRvIHN1cHBvcnQgcHJvcGVybHkgcGFzc2luZyB0aGlzIHRvIGNoaWxkcmVuLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3RhbmRlbS9pc3N1ZXMvNjAuXHJcbiAgLy8gUHJlc3NMaXN0ZW5lciBieSBkZWZhdWx0IGRvZXNuJ3QgYWxsb3cgUGhFVC1pTyB0byB0cmlnZ2VyIHByZXNzL3JlbGVhc2UgQWN0aW9uIGV2ZW50c1xyXG4gIHBoZXRpb1JlYWRPbmx5PzogYm9vbGVhbjtcclxuICBwaGV0aW9GZWF0dXJlZD86IGJvb2xlYW47XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBQcmVzc0xpc3RlbmVyT3B0aW9uczxMaXN0ZW5lciBleHRlbmRzIFByZXNzTGlzdGVuZXIgPSBQcmVzc0xpc3RlbmVyPiA9IFNlbGZPcHRpb25zPExpc3RlbmVyPiAmIEVuYWJsZWRDb21wb25lbnRPcHRpb25zO1xyXG5cclxuZXhwb3J0IHR5cGUgUHJlc3NlZFByZXNzTGlzdGVuZXIgPSBXaXRob3V0TnVsbDxQcmVzc0xpc3RlbmVyLCAncG9pbnRlcicgfCAncHJlc3NlZFRyYWlsJz47XHJcbmNvbnN0IGlzUHJlc3NlZExpc3RlbmVyID0gKCBsaXN0ZW5lcjogUHJlc3NMaXN0ZW5lciApOiBsaXN0ZW5lciBpcyBQcmVzc2VkUHJlc3NMaXN0ZW5lciA9PiBsaXN0ZW5lci5pc1ByZXNzZWQ7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcmVzc0xpc3RlbmVyIGV4dGVuZHMgRW5hYmxlZENvbXBvbmVudCBpbXBsZW1lbnRzIFRJbnB1dExpc3RlbmVyIHtcclxuXHJcbiAgLy8gVW5pcXVlIGdsb2JhbCBJRCBmb3IgdGhpcyBsaXN0ZW5lclxyXG4gIHByaXZhdGUgX2lkOiBudW1iZXI7XHJcblxyXG4gIHByaXZhdGUgX21vdXNlQnV0dG9uOiBudW1iZXI7XHJcbiAgcHJpdmF0ZSBfYTExeUxvb2tzUHJlc3NlZEludGVydmFsOiBudW1iZXI7XHJcblxyXG4gIHByaXZhdGUgX3ByZXNzQ3Vyc29yOiBzdHJpbmcgfCBudWxsO1xyXG5cclxuICBwcml2YXRlIF9wcmVzc0xpc3RlbmVyOiBQcmVzc0xpc3RlbmVyQ2FsbGJhY2s8UHJlc3NMaXN0ZW5lcj47XHJcbiAgcHJpdmF0ZSBfcmVsZWFzZUxpc3RlbmVyOiBQcmVzc0xpc3RlbmVyTnVsbGFibGVDYWxsYmFjazxQcmVzc0xpc3RlbmVyPjtcclxuICBwcml2YXRlIF9kcmFnTGlzdGVuZXI6IFByZXNzTGlzdGVuZXJDYWxsYmFjazxQcmVzc0xpc3RlbmVyPjtcclxuICBwcml2YXRlIF9jYW5TdGFydFByZXNzOiBQcmVzc0xpc3RlbmVyQ2FuU3RhcnRQcmVzc0NhbGxiYWNrPFByZXNzTGlzdGVuZXI+O1xyXG5cclxuICBwcml2YXRlIF90YXJnZXROb2RlOiBOb2RlIHwgbnVsbDtcclxuXHJcbiAgcHJpdmF0ZSBfYXR0YWNoOiBib29sZWFuO1xyXG4gIHByaXZhdGUgX2NvbGxhcHNlRHJhZ0V2ZW50czogYm9vbGVhbjtcclxuXHJcbiAgLy8gQ29udGFpbnMgYWxsIHBvaW50ZXJzIHRoYXQgYXJlIG92ZXIgb3VyIGJ1dHRvbi4gVHJhY2tlZCBieSBhZGRpbmcgd2l0aCAnZW50ZXInIGV2ZW50cyBhbmQgcmVtb3Zpbmcgd2l0aCAnZXhpdCdcclxuICAvLyBldmVudHMuXHJcbiAgcHVibGljIHJlYWRvbmx5IG92ZXJQb2ludGVyczogT2JzZXJ2YWJsZUFycmF5PFBvaW50ZXI+O1xyXG5cclxuICAvLyAocmVhZC1vbmx5KSAtIFRyYWNrcyB3aGV0aGVyIHRoaXMgbGlzdGVuZXIgaXMgXCJwcmVzc2VkXCIgb3Igbm90LlxyXG4gIHB1YmxpYyByZWFkb25seSBpc1ByZXNzZWRQcm9wZXJ0eTogVFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICAvLyAocmVhZC1vbmx5KSAtIEl0IHdpbGwgYmUgc2V0IHRvIHRydWUgd2hlbiBhdCBsZWFzdCBvbmUgcG9pbnRlciBpcyBvdmVyIHRoZSBsaXN0ZW5lci5cclxuICAvLyBUaGlzIGlzIG5vdCBlZmZlY3RlZCBieSBQRE9NIGZvY3VzLlxyXG4gIHB1YmxpYyByZWFkb25seSBpc092ZXJQcm9wZXJ0eTogVFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICAvLyAocmVhZC1vbmx5KSAtIFRydWUgd2hlbiBlaXRoZXIgaXNPdmVyUHJvcGVydHkgaXMgdHJ1ZSwgb3Igd2hlbiBmb2N1c2VkIGFuZCB0aGVcclxuICAvLyByZWxhdGVkIERpc3BsYXkgaXMgc2hvd2luZyBpdHMgZm9jdXNIaWdobGlnaHRzLCBzZWUgdGhpcy52YWxpZGF0ZU92ZXIoKSBmb3IgZGV0YWlscy5cclxuICBwdWJsaWMgcmVhZG9ubHkgbG9va3NPdmVyUHJvcGVydHk6IFRQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gKHJlYWQtb25seSkgLSBJdCB3aWxsIGJlIHNldCB0byB0cnVlIHdoZW4gZWl0aGVyOlxyXG4gIC8vICAgMS4gVGhlIGxpc3RlbmVyIGlzIHByZXNzZWQgYW5kIHRoZSBwb2ludGVyIHRoYXQgaXMgcHJlc3NpbmcgaXMgb3ZlciB0aGUgbGlzdGVuZXIuXHJcbiAgLy8gICAyLiBUaGVyZSBpcyBhdCBsZWFzdCBvbmUgdW5wcmVzc2VkIHBvaW50ZXIgdGhhdCBpcyBvdmVyIHRoZSBsaXN0ZW5lci5cclxuICBwdWJsaWMgcmVhZG9ubHkgaXNIb3ZlcmluZ1Byb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vIChyZWFkLW9ubHkpIC0gSXQgd2lsbCBiZSBzZXQgdG8gdHJ1ZSB3aGVuIGVpdGhlcjpcclxuICAvLyAgIDEuIFRoZSBsaXN0ZW5lciBpcyBwcmVzc2VkLlxyXG4gIC8vICAgMi4gVGhlcmUgaXMgYXQgbGVhc3Qgb25lIHVucHJlc3NlZCBwb2ludGVyIHRoYXQgaXMgb3ZlciB0aGUgbGlzdGVuZXIuXHJcbiAgLy8gVGhpcyBpcyBlc3NlbnRpYWxseSB0cnVlIHdoZW4gKCBpc1ByZXNzZWQgfHwgaXNIb3ZlcmluZyApLlxyXG4gIHB1YmxpYyByZWFkb25seSBpc0hpZ2hsaWdodGVkUHJvcGVydHk6IFRQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gKHJlYWQtb25seSkgLSBXaGV0aGVyIHRoZSBsaXN0ZW5lciBoYXMgZm9jdXMgKHNob3VsZCBhcHBlYXIgdG8gYmUgb3ZlcilcclxuICBwdWJsaWMgcmVhZG9ubHkgaXNGb2N1c2VkUHJvcGVydHk6IFRQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBjdXJzb3JQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nIHwgbnVsbD47XHJcblxyXG4gIC8vIChyZWFkLW9ubHkpIC0gVGhlIGN1cnJlbnQgcG9pbnRlciwgb3IgbnVsbCB3aGVuIG5vdCBwcmVzc2VkLiBUaGVyZSBjYW4gYmUgc2hvcnQgcGVyaW9kcyBvZlxyXG4gIC8vIHRpbWUgd2hlbiB0aGlzIGhhcyBhIHZhbHVlIHdoZW4gaXNQcmVzc2VkUHJvcGVydHkudmFsdWUgaXMgZmFsc2UsIHN1Y2ggYXMgZHVyaW5nIHRoZSBwcm9jZXNzaW5nIG9mIGEgcG9pbnRlclxyXG4gIC8vIHJlbGVhc2UsIGJ1dCB0aGVzZSBwZXJpb2RzIHNob3VsZCBiZSB2ZXJ5IGJyaWVmLlxyXG4gIHB1YmxpYyBwb2ludGVyOiBQb2ludGVyIHwgbnVsbDtcclxuXHJcbiAgLy8gKHJlYWQtb25seSkgLSBUaGUgVHJhaWwgZm9yIHRoZSBwcmVzcywgd2l0aCBubyBkZXNjZW5kYW50IG5vZGVzIHBhc3QgdGhlIGN1cnJlbnRUYXJnZXRcclxuICAvLyBvciB0YXJnZXROb2RlIChpZiBwcm92aWRlZCkuIFdpbGwgZ2VuZXJhbGx5IGJlIG51bGwgd2hlbiBub3QgcHJlc3NlZCwgdGhvdWdoIHRoZXJlIGNhbiBiZSBzaG9ydCBwZXJpb2RzIG9mIHRpbWVcclxuICAvLyB3aGVyZSB0aGlzIGhhcyBhIHZhbHVlIHdoZW4gaXNQcmVzc2VkUHJvcGVydHkudmFsdWUgaXMgZmFsc2UsIHN1Y2ggYXMgZHVyaW5nIHRoZSBwcm9jZXNzaW5nIG9mIGEgcmVsZWFzZSwgYnV0XHJcbiAgLy8gdGhlc2UgcGVyaW9kcyBzaG91bGQgYmUgdmVyeSBicmllZi5cclxuICBwdWJsaWMgcHJlc3NlZFRyYWlsOiBUcmFpbCB8IG51bGw7XHJcblxyXG4gIC8vKHJlYWQtb25seSkgLSBXaGV0aGVyIHRoZSBsYXN0IHByZXNzIHdhcyBpbnRlcnJ1cHRlZC4gV2lsbCBiZSB2YWxpZCB1bnRpbCB0aGUgbmV4dCBwcmVzcy5cclxuICBwdWJsaWMgaW50ZXJydXB0ZWQ6IGJvb2xlYW47XHJcblxyXG4gIC8vIEZvciB0aGUgY29sbGFwc2VEcmFnRXZlbnRzIGZlYXR1cmUsIHRoaXMgd2lsbCBob2xkIHRoZSBsYXN0IHBlbmRpbmcgZHJhZyBldmVudCB0byB0cmlnZ2VyIGEgY2FsbCB0byBkcmFnKCkgd2l0aCxcclxuICAvLyBpZiBvbmUgaGFzIGJlZW4gc2tpcHBlZC5cclxuICBwcml2YXRlIF9wZW5kaW5nQ29sbGFwc2VkRHJhZ0V2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgfCBudWxsO1xyXG5cclxuICAvLyBXaGV0aGVyIG91ciBwb2ludGVyIGxpc3RlbmVyIGlzIHJlZmVyZW5jZWQgYnkgdGhlIHBvaW50ZXIgKG5lZWQgdG8gaGF2ZSBhIGZsYWcgZHVlIHRvIGhhbmRsaW5nIGRpc3Bvc2FsIHByb3Blcmx5KS5cclxuICBwcml2YXRlIF9saXN0ZW5pbmdUb1BvaW50ZXI6IGJvb2xlYW47XHJcblxyXG4gIC8vIGlzSG92ZXJpbmdQcm9wZXJ0eSB1cGRhdGVzIChub3QgYSBEZXJpdmVkUHJvcGVydHkgYmVjYXVzZSB3ZSBuZWVkIHRvIGhvb2sgdG8gcGFzc2VkLWluIHByb3BlcnRpZXMpXHJcbiAgcHJpdmF0ZSBfaXNIb3ZlcmluZ0xpc3RlbmVyOiAoKSA9PiB2b2lkO1xyXG5cclxuICAvLyBpc0hpZ2hsaWdodGVkUHJvcGVydHkgdXBkYXRlcyAobm90IGEgRGVyaXZlZFByb3BlcnR5IGJlY2F1c2Ugd2UgbmVlZCB0byBob29rIHRvIHBhc3NlZC1pbiBwcm9wZXJ0aWVzKVxyXG4gIHByaXZhdGUgX2lzSGlnaGxpZ2h0ZWRMaXN0ZW5lcjogKCkgPT4gdm9pZDtcclxuXHJcbiAgLy8gKHJlYWQtb25seSkgLSBXaGV0aGVyIGEgcHJlc3MgaXMgYmVpbmcgcHJvY2Vzc2VkIGZyb20gYSBwZG9tIGNsaWNrIGlucHV0IGV2ZW50IGZyb20gdGhlIFBET00uXHJcbiAgcHVibGljIHJlYWRvbmx5IHBkb21DbGlja2luZ1Byb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vIChyZWFkLW9ubHkpIC0gVGhpcyBQcm9wZXJ0eSB3YXMgYWRkZWQgdG8gc3VwcG9ydCBpbnB1dCBmcm9tIHRoZSBQRE9NLiBJdCB0cmFja3Mgd2hldGhlclxyXG4gIC8vIG9yIG5vdCB0aGUgYnV0dG9uIHNob3VsZCBcImxvb2tcIiBkb3duLiBUaGlzIHdpbGwgYmUgdHJ1ZSBpZiBkb3duUHJvcGVydHkgaXMgdHJ1ZSBvciBpZiBhIHBkb20gY2xpY2sgaXMgaW5cclxuICAvLyBwcm9ncmVzcy4gRm9yIGEgY2xpY2sgZXZlbnQgZnJvbSB0aGUgcGRvbSwgdGhlIGxpc3RlbmVycyBhcmUgZmlyZWQgcmlnaHQgYXdheSBidXQgdGhlIGJ1dHRvbiB3aWxsIGxvb2sgZG93biBmb3JcclxuICAvLyBhcyBsb25nIGFzIGExMXlMb29rc1ByZXNzZWRJbnRlcnZhbC4gU2VlIFByZXNzTGlzdGVuZXIuY2xpY2soKSBmb3IgbW9yZSBkZXRhaWxzLlxyXG4gIHB1YmxpYyByZWFkb25seSBsb29rc1ByZXNzZWRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vIFdoZW4gcGRvbSBjbGlja2luZyBiZWdpbnMsIHRoaXMgd2lsbCBiZSBhZGRlZCB0byBhIHRpbWVvdXQgc28gdGhhdCB0aGVcclxuICAvLyBwZG9tQ2xpY2tpbmdQcm9wZXJ0eSBpcyB1cGRhdGVkIGFmdGVyIHNvbWUgZGVsYXkuIFRoaXMgaXMgcmVxdWlyZWQgc2luY2UgYW4gYXNzaXN0aXZlIGRldmljZSAobGlrZSBhIHN3aXRjaCkgbWF5XHJcbiAgLy8gc2VuZCBcImNsaWNrXCIgZXZlbnRzIGRpcmVjdGx5IGluc3RlYWQgb2Yga2V5ZG93bi9rZXl1cCBwYWlycy4gSWYgYSBjbGljayBpbml0aWF0ZXMgd2hpbGUgYWxyZWFkeSBpbiBwcm9ncmVzcyxcclxuICAvLyB0aGlzIGxpc3RlbmVyIHdpbGwgYmUgcmVtb3ZlZCB0byBzdGFydCB0aGUgdGltZW91dCBvdmVyLiBudWxsIHVudGlsIHRpbW91dCBpcyBhZGRlZC5cclxuICBwcml2YXRlIF9wZG9tQ2xpY2tpbmdUaW1lb3V0TGlzdGVuZXI6ICggKCkgPT4gdm9pZCApIHwgbnVsbDtcclxuXHJcbiAgLy8gVGhlIGxpc3RlbmVyIHRoYXQgZ2V0cyBhZGRlZCB0byB0aGUgcG9pbnRlciB3aGVuIHdlIGFyZSBwcmVzc2VkXHJcbiAgcHJpdmF0ZSBfcG9pbnRlckxpc3RlbmVyOiBUSW5wdXRMaXN0ZW5lcjtcclxuXHJcbiAgLy8gRXhlY3V0ZWQgb24gcHJlc3MgZXZlbnRcclxuICAvLyBUaGUgbWFpbiBpbXBsZW1lbnRhdGlvbiBvZiBcInByZXNzXCIgaGFuZGxpbmcgaXMgaW1wbGVtZW50ZWQgYXMgYSBjYWxsYmFjayB0byB0aGUgUGhldGlvQWN0aW9uLCBzbyB0aGluZ3MgYXJlIG5lc3RlZFxyXG4gIC8vIG5pY2VseSBmb3IgcGhldC1pby5cclxuICBwcml2YXRlIF9wcmVzc0FjdGlvbjogUGhldGlvQWN0aW9uPFsgUHJlc3NMaXN0ZW5lckV2ZW50LCBOb2RlIHwgbnVsbCwgKCAoKSA9PiB2b2lkICkgfCBudWxsIF0+O1xyXG5cclxuICAvLyBFeGVjdXRlZCBvbiByZWxlYXNlIGV2ZW50XHJcbiAgLy8gVGhlIG1haW4gaW1wbGVtZW50YXRpb24gb2YgXCJyZWxlYXNlXCIgaGFuZGxpbmcgaXMgaW1wbGVtZW50ZWQgYXMgYSBjYWxsYmFjayB0byB0aGUgUGhldGlvQWN0aW9uLCBzbyB0aGluZ3MgYXJlIG5lc3RlZFxyXG4gIC8vIG5pY2VseSBmb3IgcGhldC1pby5cclxuICBwcml2YXRlIF9yZWxlYXNlQWN0aW9uOiBQaGV0aW9BY3Rpb248WyBQcmVzc0xpc3RlbmVyRXZlbnQgfCBudWxsLCAoICgpID0+IHZvaWQgKSB8IG51bGwgXT47XHJcblxyXG4gIC8vIFRvIHN1cHBvcnQgbG9va3NPdmVyUHJvcGVydHkgYmVpbmcgdHJ1ZSBiYXNlZCBvbiBmb2N1cywgd2UgbmVlZCB0byBtb25pdG9yIHRoZSBkaXNwbGF5IGZyb20gd2hpY2hcclxuICAvLyB0aGUgZXZlbnQgaGFzIGNvbWUgZnJvbSB0byBzZWUgaWYgdGhhdCBkaXNwbGF5IGlzIHNob3dpbmcgaXRzIGZvY3VzSGlnaGxpZ2h0cywgc2VlXHJcbiAgLy8gRGlzcGxheS5wcm90b3R5cGUuZm9jdXNNYW5hZ2VyLkZvY3VzTWFuYWdlci5wZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5IGZvciBkZXRhaWxzLlxyXG4gIHB1YmxpYyBkaXNwbGF5OiBEaXNwbGF5IHwgbnVsbDtcclxuXHJcbiAgLy8gd2UgbmVlZCB0aGUgc2FtZSBleGFjdCBmdW5jdGlvbiB0byBhZGQgYW5kIHJlbW92ZSBhcyBhIGxpc3RlbmVyXHJcbiAgcHJpdmF0ZSBib3VuZEludmFsaWRhdGVPdmVyTGlzdGVuZXI6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogUHJlc3NMaXN0ZW5lck9wdGlvbnMgKSB7XHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFByZXNzTGlzdGVuZXJPcHRpb25zLCBTZWxmT3B0aW9uczxQcmVzc0xpc3RlbmVyPiwgRW5hYmxlZENvbXBvbmVudE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIHByZXNzOiBfLm5vb3AsXHJcbiAgICAgIHJlbGVhc2U6IF8ubm9vcCxcclxuICAgICAgdGFyZ2V0Tm9kZTogbnVsbCxcclxuICAgICAgZHJhZzogXy5ub29wLFxyXG4gICAgICBhdHRhY2g6IHRydWUsXHJcbiAgICAgIG1vdXNlQnV0dG9uOiAwLFxyXG4gICAgICBwcmVzc0N1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICB1c2VJbnB1dExpc3RlbmVyQ3Vyc29yOiBmYWxzZSxcclxuICAgICAgY2FuU3RhcnRQcmVzczogdHJ1ZVByZWRpY2F0ZSxcclxuICAgICAgYTExeUxvb2tzUHJlc3NlZEludGVydmFsOiAxMDAsXHJcbiAgICAgIGNvbGxhcHNlRHJhZ0V2ZW50czogZmFsc2UsXHJcblxyXG4gICAgICAvLyBFbmFibGVkQ29tcG9uZW50XHJcbiAgICAgIC8vIEJ5IGRlZmF1bHQsIFByZXNzTGlzdGVuZXIgZG9lcyBub3QgaGF2ZSBhbiBpbnN0cnVtZW50ZWQgZW5hYmxlZFByb3BlcnR5LCBidXQgeW91IGNhbiBvcHQgaW4gd2l0aCB0aGlzIG9wdGlvbi5cclxuICAgICAgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiBmYWxzZSxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW8gKEVuYWJsZWRDb21wb25lbnQpXHJcbiAgICAgIC8vIEZvciBQaEVULWlPIGluc3RydW1lbnRhdGlvbi4gSWYgb25seSB1c2luZyB0aGUgUHJlc3NMaXN0ZW5lciBmb3IgaG92ZXIgYmVoYXZpb3IsIHRoZXJlIGlzIG5vIG5lZWQgdG9cclxuICAgICAgLy8gaW5zdHJ1bWVudCBiZWNhdXNlIGV2ZW50cyBhcmUgb25seSBhZGRlZCB0byB0aGUgZGF0YSBzdHJlYW0gZm9yIHByZXNzL3JlbGVhc2UgYW5kIG5vdCBmb3IgaG92ZXIgZXZlbnRzLiBQbGVhc2UgcGFzc1xyXG4gICAgICAvLyBUYW5kZW0uT1BUX09VVCBhcyB0aGUgdGFuZGVtIG9wdGlvbiB0byBub3QgaW5zdHJ1bWVudCBhbiBpbnN0YW5jZS5cclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXHJcblxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvRmVhdHVyZWQ6IFBoZXRpb09iamVjdC5ERUZBVUxUX09QVElPTlMucGhldGlvRmVhdHVyZWRcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBvcHRpb25zLm1vdXNlQnV0dG9uID09PSAnbnVtYmVyJyAmJiBvcHRpb25zLm1vdXNlQnV0dG9uID49IDAgJiYgb3B0aW9ucy5tb3VzZUJ1dHRvbiAlIDEgPT09IDAsXHJcbiAgICAgICdtb3VzZUJ1dHRvbiBzaG91bGQgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMucHJlc3NDdXJzb3IgPT09IG51bGwgfHwgdHlwZW9mIG9wdGlvbnMucHJlc3NDdXJzb3IgPT09ICdzdHJpbmcnLFxyXG4gICAgICAncHJlc3NDdXJzb3Igc2hvdWxkIGVpdGhlciBiZSBhIHN0cmluZyBvciBudWxsJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIG9wdGlvbnMucHJlc3MgPT09ICdmdW5jdGlvbicsXHJcbiAgICAgICdUaGUgcHJlc3MgY2FsbGJhY2sgc2hvdWxkIGJlIGEgZnVuY3Rpb24nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Ygb3B0aW9ucy5yZWxlYXNlID09PSAnZnVuY3Rpb24nLFxyXG4gICAgICAnVGhlIHJlbGVhc2UgY2FsbGJhY2sgc2hvdWxkIGJlIGEgZnVuY3Rpb24nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Ygb3B0aW9ucy5kcmFnID09PSAnZnVuY3Rpb24nLFxyXG4gICAgICAnVGhlIGRyYWcgY2FsbGJhY2sgc2hvdWxkIGJlIGEgZnVuY3Rpb24nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnRhcmdldE5vZGUgPT09IG51bGwgfHwgb3B0aW9ucy50YXJnZXROb2RlIGluc3RhbmNlb2YgTm9kZSxcclxuICAgICAgJ0lmIHByb3ZpZGVkLCB0YXJnZXROb2RlIHNob3VsZCBiZSBhIE5vZGUnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Ygb3B0aW9ucy5hdHRhY2ggPT09ICdib29sZWFuJywgJ2F0dGFjaCBzaG91bGQgYmUgYSBib29sZWFuJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIG9wdGlvbnMuYTExeUxvb2tzUHJlc3NlZEludGVydmFsID09PSAnbnVtYmVyJyxcclxuICAgICAgJ2ExMXlMb29rc1ByZXNzZWRJbnRlcnZhbCBzaG91bGQgYmUgYSBudW1iZXInICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLl9pZCA9IGdsb2JhbElEKys7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgUHJlc3NMaXN0ZW5lciMke3RoaXMuX2lkfSBjb25zdHJ1Y3Rpb25gICk7XHJcblxyXG4gICAgdGhpcy5fbW91c2VCdXR0b24gPSBvcHRpb25zLm1vdXNlQnV0dG9uO1xyXG4gICAgdGhpcy5fYTExeUxvb2tzUHJlc3NlZEludGVydmFsID0gb3B0aW9ucy5hMTF5TG9va3NQcmVzc2VkSW50ZXJ2YWw7XHJcbiAgICB0aGlzLl9wcmVzc0N1cnNvciA9IG9wdGlvbnMucHJlc3NDdXJzb3I7XHJcblxyXG4gICAgdGhpcy5fcHJlc3NMaXN0ZW5lciA9IG9wdGlvbnMucHJlc3M7XHJcbiAgICB0aGlzLl9yZWxlYXNlTGlzdGVuZXIgPSBvcHRpb25zLnJlbGVhc2U7XHJcbiAgICB0aGlzLl9kcmFnTGlzdGVuZXIgPSBvcHRpb25zLmRyYWc7XHJcbiAgICB0aGlzLl9jYW5TdGFydFByZXNzID0gb3B0aW9ucy5jYW5TdGFydFByZXNzO1xyXG5cclxuICAgIHRoaXMuX3RhcmdldE5vZGUgPSBvcHRpb25zLnRhcmdldE5vZGU7XHJcblxyXG4gICAgdGhpcy5fYXR0YWNoID0gb3B0aW9ucy5hdHRhY2g7XHJcbiAgICB0aGlzLl9jb2xsYXBzZURyYWdFdmVudHMgPSBvcHRpb25zLmNvbGxhcHNlRHJhZ0V2ZW50cztcclxuXHJcbiAgICB0aGlzLm92ZXJQb2ludGVycyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG5cclxuICAgIHRoaXMuaXNQcmVzc2VkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwgeyByZWVudHJhbnQ6IHRydWUgfSApO1xyXG4gICAgdGhpcy5pc092ZXJQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgICB0aGlzLmxvb2tzT3ZlclByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuICAgIHRoaXMuaXNIb3ZlcmluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuICAgIHRoaXMuaXNIaWdobGlnaHRlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuICAgIHRoaXMuaXNGb2N1c2VkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG4gICAgdGhpcy5jdXJzb3JQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5lbmFibGVkUHJvcGVydHkgXSwgZW5hYmxlZCA9PiB7XHJcbiAgICAgIGlmICggb3B0aW9ucy51c2VJbnB1dExpc3RlbmVyQ3Vyc29yICYmIGVuYWJsZWQgJiYgdGhpcy5fYXR0YWNoICkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wcmVzc0N1cnNvcjtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuXHJcbiAgICB0aGlzLnBvaW50ZXIgPSBudWxsO1xyXG4gICAgdGhpcy5wcmVzc2VkVHJhaWwgPSBudWxsO1xyXG4gICAgdGhpcy5pbnRlcnJ1cHRlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5fcGVuZGluZ0NvbGxhcHNlZERyYWdFdmVudCA9IG51bGw7XHJcbiAgICB0aGlzLl9saXN0ZW5pbmdUb1BvaW50ZXIgPSBmYWxzZTtcclxuICAgIHRoaXMuX2lzSG92ZXJpbmdMaXN0ZW5lciA9IHRoaXMuaW52YWxpZGF0ZUhvdmVyaW5nLmJpbmQoIHRoaXMgKTtcclxuICAgIHRoaXMuX2lzSGlnaGxpZ2h0ZWRMaXN0ZW5lciA9IHRoaXMuaW52YWxpZGF0ZUhpZ2hsaWdodGVkLmJpbmQoIHRoaXMgKTtcclxuICAgIHRoaXMucGRvbUNsaWNraW5nUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG4gICAgdGhpcy5sb29rc1ByZXNzZWRQcm9wZXJ0eSA9IERlcml2ZWRQcm9wZXJ0eS5vciggWyB0aGlzLnBkb21DbGlja2luZ1Byb3BlcnR5LCB0aGlzLmlzUHJlc3NlZFByb3BlcnR5IF0gKTtcclxuICAgIHRoaXMuX3Bkb21DbGlja2luZ1RpbWVvdXRMaXN0ZW5lciA9IG51bGw7XHJcbiAgICB0aGlzLl9wb2ludGVyTGlzdGVuZXIgPSB7XHJcbiAgICAgIHVwOiB0aGlzLnBvaW50ZXJVcC5iaW5kKCB0aGlzICksXHJcbiAgICAgIGNhbmNlbDogdGhpcy5wb2ludGVyQ2FuY2VsLmJpbmQoIHRoaXMgKSxcclxuICAgICAgbW92ZTogdGhpcy5wb2ludGVyTW92ZS5iaW5kKCB0aGlzICksXHJcbiAgICAgIGludGVycnVwdDogdGhpcy5wb2ludGVySW50ZXJydXB0LmJpbmQoIHRoaXMgKSxcclxuICAgICAgbGlzdGVuZXI6IHRoaXNcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fcHJlc3NBY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCB0aGlzLm9uUHJlc3MuYmluZCggdGhpcyApLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncHJlc3NBY3Rpb24nICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFeGVjdXRlcyB3aGVuZXZlciBhIHByZXNzIG9jY3Vycy4gVGhlIGZpcnN0IGFyZ3VtZW50IHdoZW4gZXhlY3V0aW5nIGNhbiBiZSAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3VzZWQgdG8gY29udmV5IGluZm8gYWJvdXQgdGhlIFNjZW5lcnlFdmVudC4nLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvRmVhdHVyZWQ6IG9wdGlvbnMucGhldGlvRmVhdHVyZWQsXHJcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVIsXHJcbiAgICAgIHBhcmFtZXRlcnM6IFsge1xyXG4gICAgICAgIG5hbWU6ICdldmVudCcsXHJcbiAgICAgICAgcGhldGlvVHlwZTogU2NlbmVyeUV2ZW50LlNjZW5lcnlFdmVudElPXHJcbiAgICAgIH0sIHtcclxuICAgICAgICBwaGV0aW9Qcml2YXRlOiB0cnVlLFxyXG4gICAgICAgIHZhbHVlVHlwZTogWyBOb2RlLCBudWxsIF1cclxuICAgICAgfSwge1xyXG4gICAgICAgIHBoZXRpb1ByaXZhdGU6IHRydWUsXHJcbiAgICAgICAgdmFsdWVUeXBlOiBbICdmdW5jdGlvbicsIG51bGwgXVxyXG4gICAgICB9XHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLl9yZWxlYXNlQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggdGhpcy5vblJlbGVhc2UuYmluZCggdGhpcyApLCB7XHJcbiAgICAgIHBhcmFtZXRlcnM6IFsge1xyXG4gICAgICAgIG5hbWU6ICdldmVudCcsXHJcbiAgICAgICAgcGhldGlvVHlwZTogTnVsbGFibGVJTyggU2NlbmVyeUV2ZW50LlNjZW5lcnlFdmVudElPIClcclxuICAgICAgfSwge1xyXG4gICAgICAgIHBoZXRpb1ByaXZhdGU6IHRydWUsXHJcbiAgICAgICAgdmFsdWVUeXBlOiBbICdmdW5jdGlvbicsIG51bGwgXVxyXG4gICAgICB9IF0sXHJcblxyXG4gICAgICAvLyBwaGV0LWlvXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVsZWFzZUFjdGlvbicgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0V4ZWN1dGVzIHdoZW5ldmVyIGEgcmVsZWFzZSBvY2N1cnMuJyxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiBvcHRpb25zLnBoZXRpb0ZlYXR1cmVkLFxyXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5kaXNwbGF5ID0gbnVsbDtcclxuICAgIHRoaXMuYm91bmRJbnZhbGlkYXRlT3Zlckxpc3RlbmVyID0gdGhpcy5pbnZhbGlkYXRlT3Zlci5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIGlzT3ZlclByb3BlcnR5IChub3QgYSBEZXJpdmVkUHJvcGVydHkgYmVjYXVzZSB3ZSBuZWVkIHRvIGhvb2sgdG8gcGFzc2VkLWluIHByb3BlcnRpZXMpXHJcbiAgICB0aGlzLm92ZXJQb2ludGVycy5sZW5ndGhQcm9wZXJ0eS5saW5rKCB0aGlzLmludmFsaWRhdGVPdmVyLmJpbmQoIHRoaXMgKSApO1xyXG4gICAgdGhpcy5pc0ZvY3VzZWRQcm9wZXJ0eS5saW5rKCB0aGlzLmludmFsaWRhdGVPdmVyLmJpbmQoIHRoaXMgKSApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSBpc0hvdmVyaW5nUHJvcGVydHkgKG5vdCBhIERlcml2ZWRQcm9wZXJ0eSBiZWNhdXNlIHdlIG5lZWQgdG8gaG9vayB0byBwYXNzZWQtaW4gcHJvcGVydGllcylcclxuICAgIHRoaXMub3ZlclBvaW50ZXJzLmxlbmd0aFByb3BlcnR5LmxpbmsoIHRoaXMuX2lzSG92ZXJpbmdMaXN0ZW5lciApO1xyXG4gICAgdGhpcy5pc1ByZXNzZWRQcm9wZXJ0eS5saW5rKCB0aGlzLl9pc0hvdmVyaW5nTGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgaXNIb3ZlcmluZyB3aGVuIGFueSBwb2ludGVyJ3MgaXNEb3duUHJvcGVydHkgY2hhbmdlcy5cclxuICAgIC8vIE5PVEU6IG92ZXJQb2ludGVycyBpcyBjbGVhcmVkIG9uIGRpc3Bvc2UsIHdoaWNoIHNob3VsZCByZW1vdmUgYWxsIG9mIHRoZXNlIChpbnRlcmlvcikgbGlzdGVuZXJzKVxyXG4gICAgdGhpcy5vdmVyUG9pbnRlcnMuYWRkSXRlbUFkZGVkTGlzdGVuZXIoIHBvaW50ZXIgPT4gcG9pbnRlci5pc0Rvd25Qcm9wZXJ0eS5saW5rKCB0aGlzLl9pc0hvdmVyaW5nTGlzdGVuZXIgKSApO1xyXG4gICAgdGhpcy5vdmVyUG9pbnRlcnMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggcG9pbnRlciA9PiBwb2ludGVyLmlzRG93blByb3BlcnR5LnVubGluayggdGhpcy5faXNIb3ZlcmluZ0xpc3RlbmVyICkgKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgaXNIaWdobGlnaHRlZFByb3BlcnR5IChub3QgYSBEZXJpdmVkUHJvcGVydHkgYmVjYXVzZSB3ZSBuZWVkIHRvIGhvb2sgdG8gcGFzc2VkLWluIHByb3BlcnRpZXMpXHJcbiAgICB0aGlzLmlzSG92ZXJpbmdQcm9wZXJ0eS5saW5rKCB0aGlzLl9pc0hpZ2hsaWdodGVkTGlzdGVuZXIgKTtcclxuICAgIHRoaXMuaXNQcmVzc2VkUHJvcGVydHkubGluayggdGhpcy5faXNIaWdobGlnaHRlZExpc3RlbmVyICk7XHJcblxyXG4gICAgdGhpcy5lbmFibGVkUHJvcGVydHkubGF6eUxpbmsoIHRoaXMub25FbmFibGVkUHJvcGVydHlDaGFuZ2UuYmluZCggdGhpcyApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIHRoaXMgbGlzdGVuZXIgaXMgY3VycmVudGx5IGFjdGl2YXRlZCB3aXRoIGEgcHJlc3MuXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBpc1ByZXNzZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5pc1ByZXNzZWRQcm9wZXJ0eS52YWx1ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgY3Vyc29yKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuY3Vyc29yUHJvcGVydHkudmFsdWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGF0dGFjaCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9hdHRhY2g7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHRhcmdldE5vZGUoKTogTm9kZSB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX3RhcmdldE5vZGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgbWFpbiBub2RlIHRoYXQgdGhpcyBsaXN0ZW5lciBpcyByZXNwb25zaWJsZSBmb3IgZHJhZ2dpbmcuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEN1cnJlbnRUYXJnZXQoKTogTm9kZSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzUHJlc3NlZCwgJ1dlIGhhdmUgbm8gY3VycmVudFRhcmdldCBpZiB3ZSBhcmUgbm90IHByZXNzZWQnICk7XHJcblxyXG4gICAgcmV0dXJuICggdGhpcyBhcyBQcmVzc2VkUHJlc3NMaXN0ZW5lciApLnByZXNzZWRUcmFpbC5sYXN0Tm9kZSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBjdXJyZW50VGFyZ2V0KCk6IE5vZGUge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudFRhcmdldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIGEgcHJlc3MgY2FuIGJlIHN0YXJ0ZWQgd2l0aCBhIHBhcnRpY3VsYXIgZXZlbnQuXHJcbiAgICovXHJcbiAgcHVibGljIGNhblByZXNzKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICEhdGhpcy5lbmFibGVkUHJvcGVydHkudmFsdWUgJiZcclxuICAgICAgICAgICAhdGhpcy5pc1ByZXNzZWQgJiZcclxuICAgICAgICAgICB0aGlzLl9jYW5TdGFydFByZXNzKCBldmVudCwgdGhpcyApICYmXHJcbiAgICAgICAgICAgLy8gT25seSBsZXQgcHJlc3NlcyBiZSBzdGFydGVkIHdpdGggdGhlIGNvcnJlY3QgbW91c2UgYnV0dG9uLlxyXG4gICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVHlwZWQgU2NlbmVyeUV2ZW50XHJcbiAgICAgICAgICAgKCAhKCBldmVudC5wb2ludGVyIGluc3RhbmNlb2YgTW91c2UgKSB8fCBldmVudC5kb21FdmVudC5idXR0b24gPT09IHRoaXMuX21vdXNlQnV0dG9uICkgJiZcclxuICAgICAgICAgICAvLyBXZSBjYW4ndCBhdHRhY2ggdG8gYSBwb2ludGVyIHRoYXQgaXMgYWxyZWFkeSBhdHRhY2hlZC5cclxuICAgICAgICAgICAoICF0aGlzLl9hdHRhY2ggfHwgIWV2ZW50LnBvaW50ZXIuaXNBdHRhY2hlZCgpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBQcmVzc0xpc3RlbmVyIGNhbiBiZSBjbGlja2VkIGZyb20ga2V5Ym9hcmQgaW5wdXQuIFRoaXMgY29waWVzIHBhcnQgb2YgY2FuUHJlc3MsIGJ1dFxyXG4gICAqIHdlIGRpZG4ndCB3YW50IHRvIHVzZSBjYW5DbGljayBpbiBjYW5QcmVzcyBiZWNhdXNlIGNhbkNsaWNrIGNvdWxkIGJlIG92ZXJyaWRkZW4gaW4gc3VidHlwZXMuXHJcbiAgICovXHJcbiAgcHVibGljIGNhbkNsaWNrKCk6IGJvb2xlYW4ge1xyXG4gICAgLy8gSWYgdGhpcyBsaXN0ZW5lciBpcyBhbHJlYWR5IGludm9sdmVkIGluIHByZXNzaW5nIHNvbWV0aGluZyAob3Igb3VyIG9wdGlvbnMgcHJlZGljYXRlIHJldHVybnMgZmFsc2UpIHdlIGNhbid0XHJcbiAgICAvLyBwcmVzcyBzb21ldGhpbmcuXHJcbiAgICByZXR1cm4gdGhpcy5lbmFibGVkUHJvcGVydHkudmFsdWUgJiYgIXRoaXMuaXNQcmVzc2VkICYmIHRoaXMuX2NhblN0YXJ0UHJlc3MoIG51bGwsIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmVzIHRoZSBsaXN0ZW5lciB0byB0aGUgJ3ByZXNzZWQnIHN0YXRlIGlmIHBvc3NpYmxlIChhdHRhY2hlcyBsaXN0ZW5lcnMgYW5kIGluaXRpYWxpemVzIHByZXNzLXJlbGF0ZWRcclxuICAgKiBwcm9wZXJ0aWVzKS5cclxuICAgKlxyXG4gICAqIFRoaXMgY2FuIGJlIG92ZXJyaWRkZW4gKHdpdGggc3VwZXItY2FsbHMpIHdoZW4gY3VzdG9tIHByZXNzIGJlaGF2aW9yIGlzIG5lZWRlZCBmb3IgYSB0eXBlLlxyXG4gICAqXHJcbiAgICogVGhpcyBjYW4gYmUgY2FsbGVkIGJ5IG91dHNpZGUgY2xpZW50cyBpbiBvcmRlciB0byB0cnkgdG8gYmVnaW4gYSBwcm9jZXNzIChnZW5lcmFsbHkgb24gYW4gYWxyZWFkeS1wcmVzc2VkXHJcbiAgICogcG9pbnRlciksIGFuZCBpcyB1c2VmdWwgaWYgYSAnZHJhZycgbmVlZHMgdG8gY2hhbmdlIGJldHdlZW4gbGlzdGVuZXJzLiBVc2UgY2FuUHJlc3MoIGV2ZW50ICkgdG8gZGV0ZXJtaW5lIGlmXHJcbiAgICogYSBwcmVzcyBjYW4gYmUgc3RhcnRlZCAoaWYgbmVlZGVkIGJlZm9yZWhhbmQpLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGV2ZW50XHJcbiAgICogQHBhcmFtIFt0YXJnZXROb2RlXSAtIElmIHByb3ZpZGVkLCB3aWxsIHRha2UgdGhlIHBsYWNlIG9mIHRoZSB0YXJnZXROb2RlIGZvciB0aGlzIGNhbGwuIFVzZWZ1bCBmb3JcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcndhcmRlZCBwcmVzc2VzLlxyXG4gICAqIEBwYXJhbSBbY2FsbGJhY2tdIC0gdG8gYmUgcnVuIGF0IHRoZSBlbmQgb2YgdGhlIGZ1bmN0aW9uLCBidXQgb25seSBvbiBzdWNjZXNzXHJcbiAgICogQHJldHVybnMgc3VjY2VzcyAtIFJldHVybnMgd2hldGhlciB0aGUgcHJlc3Mgd2FzIGFjdHVhbGx5IHN0YXJ0ZWRcclxuICAgKi9cclxuICBwdWJsaWMgcHJlc3MoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQsIHRhcmdldE5vZGU/OiBOb2RlLCBjYWxsYmFjaz86ICgpID0+IHZvaWQgKTogYm9vbGVhbiB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBldmVudCwgJ0FuIGV2ZW50IGlzIHJlcXVpcmVkJyApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggYFByZXNzTGlzdGVuZXIjJHt0aGlzLl9pZH0gcHJlc3NgICk7XHJcblxyXG4gICAgaWYgKCAhdGhpcy5jYW5QcmVzcyggZXZlbnQgKSApIHtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgUHJlc3NMaXN0ZW5lciMke3RoaXMuX2lkfSBjb3VsZCBub3QgcHJlc3NgICk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGbHVzaCBvdXQgYSBwZW5kaW5nIGRyYWcsIHNvIGl0IGhhcHBlbnMgYmVmb3JlIHdlIHByZXNzXHJcbiAgICB0aGlzLmZsdXNoQ29sbGFwc2VkRHJhZygpO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggYFByZXNzTGlzdGVuZXIjJHt0aGlzLl9pZH0gc3VjY2Vzc2Z1bCBwcmVzc2AgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG4gICAgdGhpcy5fcHJlc3NBY3Rpb24uZXhlY3V0ZSggZXZlbnQsIHRhcmdldE5vZGUgfHwgbnVsbCwgY2FsbGJhY2sgfHwgbnVsbCApOyAvLyBjYW5ub3QgcGFzcyB1bmRlZmluZWQgaW50byBleGVjdXRlIGNhbGxcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVsZWFzZXMgYSBwcmVzc2VkIGxpc3RlbmVyLlxyXG4gICAqXHJcbiAgICogVGhpcyBjYW4gYmUgb3ZlcnJpZGRlbiAod2l0aCBzdXBlci1jYWxscykgd2hlbiBjdXN0b20gcmVsZWFzZSBiZWhhdmlvciBpcyBuZWVkZWQgZm9yIGEgdHlwZS5cclxuICAgKlxyXG4gICAqIFRoaXMgY2FuIGJlIGNhbGxlZCBmcm9tIHRoZSBvdXRzaWRlIHRvIHJlbGVhc2UgdGhlIHByZXNzIHdpdGhvdXQgdGhlIHBvaW50ZXIgaGF2aW5nIGFjdHVhbGx5IGZpcmVkIGFueSAndXAnXHJcbiAgICogZXZlbnRzLiBJZiB0aGUgY2FuY2VsL2ludGVycnVwdCBiZWhhdmlvciBpcyBtb3JlIHByZWZlcmFibGUsIGNhbGwgaW50ZXJydXB0KCkgb24gdGhpcyBsaXN0ZW5lciBpbnN0ZWFkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIFtldmVudF0gLSBzY2VuZXJ5IGV2ZW50IGlmIHRoZXJlIHdhcyBvbmUuIFdlIGNhbid0IGd1YXJhbnRlZSBhbiBldmVudCwgaW4gcGFydCB0byBzdXBwb3J0IGludGVycnVwdGluZy5cclxuICAgKiBAcGFyYW0gW2NhbGxiYWNrXSAtIGNhbGxlZCBhdCB0aGUgZW5kIG9mIHRoZSByZWxlYXNlXHJcbiAgICovXHJcbiAgcHVibGljIHJlbGVhc2UoIGV2ZW50PzogUHJlc3NMaXN0ZW5lckV2ZW50LCBjYWxsYmFjaz86ICgpID0+IHZvaWQgKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoIGBQcmVzc0xpc3RlbmVyIyR7dGhpcy5faWR9IHJlbGVhc2VgICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBGbHVzaCBvdXQgYSBwZW5kaW5nIGRyYWcsIHNvIGl0IGhhcHBlbnMgYmVmb3JlIHdlIHJlbGVhc2VcclxuICAgIHRoaXMuZmx1c2hDb2xsYXBzZWREcmFnKCk7XHJcblxyXG4gICAgdGhpcy5fcmVsZWFzZUFjdGlvbi5leGVjdXRlKCBldmVudCB8fCBudWxsLCBjYWxsYmFjayB8fCBudWxsICk7IC8vIGNhbm5vdCBwYXNzIHVuZGVmaW5lZCB0byBleGVjdXRlIGNhbGxcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gbW92ZSBldmVudHMgYXJlIGZpcmVkIG9uIHRoZSBhdHRhY2hlZCBwb2ludGVyIGxpc3RlbmVyLlxyXG4gICAqXHJcbiAgICogVGhpcyBjYW4gYmUgb3ZlcnJpZGRlbiAod2l0aCBzdXBlci1jYWxscykgd2hlbiBjdXN0b20gZHJhZyBiZWhhdmlvciBpcyBuZWVkZWQgZm9yIGEgdHlwZS5cclxuICAgKlxyXG4gICAqIChzY2VuZXJ5LWludGVybmFsLCBlZmZlY3RpdmVseSBwcm90ZWN0ZWQpXHJcbiAgICovXHJcbiAgcHVibGljIGRyYWcoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoIGBQcmVzc0xpc3RlbmVyIyR7dGhpcy5faWR9IGRyYWdgICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzUHJlc3NlZCwgJ0NhbiBvbmx5IGRyYWcgd2hpbGUgcHJlc3NlZCcgKTtcclxuXHJcbiAgICB0aGlzLl9kcmFnTGlzdGVuZXIoIGV2ZW50LCB0aGlzICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVycnVwdHMgdGhlIGxpc3RlbmVyLCByZWxlYXNpbmcgaXQgKGNhbmNlbGluZyBiZWhhdmlvcikuXHJcbiAgICpcclxuICAgKiBUaGlzIGVmZmVjdGl2ZWx5IHJlbGVhc2VzL2VuZHMgdGhlIHByZXNzLCBhbmQgc2V0cyB0aGUgYGludGVycnVwdGVkYCBmbGFnIHRvIHRydWUgd2hpbGUgZmlyaW5nIHRoZXNlIGV2ZW50c1xyXG4gICAqIHNvIHRoYXQgY29kZSBjYW4gZGV0ZXJtaW5lIHdoZXRoZXIgYSByZWxlYXNlL2VuZCBoYXBwZW5lZCBuYXR1cmFsbHksIG9yIHdhcyBjYW5jZWxlZCBpbiBzb21lIHdheS5cclxuICAgKlxyXG4gICAqIFRoaXMgY2FuIGJlIGNhbGxlZCBtYW51YWxseSwgYnV0IGNhbiBhbHNvIGJlIGNhbGxlZCB0aHJvdWdoIG5vZGUuaW50ZXJydXB0U3VidHJlZUlucHV0KCkuXHJcbiAgICovXHJcbiAgcHVibGljIGludGVycnVwdCgpOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggYFByZXNzTGlzdGVuZXIjJHt0aGlzLl9pZH0gaW50ZXJydXB0YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gaGFuZGxlIHBkb20gaW50ZXJydXB0XHJcbiAgICBpZiAoIHRoaXMucGRvbUNsaWNraW5nUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHRoaXMuaW50ZXJydXB0ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgLy8gaXQgaXMgcG9zc2libGUgd2UgYXJlIGludGVycnVwdGluZyBhIGNsaWNrIHdpdGggYSBwb2ludGVyIHByZXNzLCBpbiB3aGljaCBjYXNlXHJcbiAgICAgIC8vIHdlIGFyZSBsaXN0ZW5pbmcgdG8gdGhlIFBvaW50ZXIgbGlzdGVuZXIgLSBkbyBhIGZ1bGwgcmVsZWFzZSBpbiB0aGlzIGNhc2VcclxuICAgICAgaWYgKCB0aGlzLl9saXN0ZW5pbmdUb1BvaW50ZXIgKSB7XHJcbiAgICAgICAgdGhpcy5yZWxlYXNlKCk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIHJlbGVhc2Ugb24gaW50ZXJydXB0ICh3aXRob3V0IGdvaW5nIHRocm91Z2ggb25SZWxlYXNlLCB3aGljaCBoYW5kbGVzIG1vdXNlL3RvdWNoIHNwZWNpZmljIHRoaW5ncylcclxuICAgICAgICB0aGlzLmlzUHJlc3NlZFByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fcmVsZWFzZUxpc3RlbmVyKCBudWxsLCB0aGlzICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGNsZWFyIHRoZSBjbGlja2luZyB0aW1lciwgc3BlY2lmaWMgdG8gcGRvbSBpbnB1dFxyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE86IFRoaXMgbG9va3MgYnVnZ3ksIHdpbGwgbmVlZCB0byBpZ25vcmUgZm9yIG5vd1xyXG4gICAgICBpZiAoIHN0ZXBUaW1lci5oYXNMaXN0ZW5lciggdGhpcy5fcGRvbUNsaWNraW5nVGltZW91dExpc3RlbmVyICkgKSB7XHJcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPOiBUaGlzIGxvb2tzIGJ1Z2d5LCB3aWxsIG5lZWQgdG8gaWdub3JlIGZvciBub3dcclxuICAgICAgICBzdGVwVGltZXIuY2xlYXJUaW1lb3V0KCB0aGlzLl9wZG9tQ2xpY2tpbmdUaW1lb3V0TGlzdGVuZXIgKTtcclxuXHJcbiAgICAgICAgLy8gaW50ZXJydXB0IG1heSBiZSBjYWxsZWQgYWZ0ZXIgdGhlIFByZXNzTGlzdGVuZXIgaGFzIGJlZW4gZGlzcG9zZWQgKGZvciBpbnN0YW5jZSwgaW50ZXJuYWxseSBieSBzY2VuZXJ5XHJcbiAgICAgICAgLy8gaWYgdGhlIE5vZGUgcmVjZWl2ZXMgYSBibHVyIGV2ZW50IGFmdGVyIHRoZSBQcmVzc0xpc3RlbmVyIGlzIGRpc3Bvc2VkKVxyXG4gICAgICAgIGlmICggIXRoaXMucGRvbUNsaWNraW5nUHJvcGVydHkuaXNEaXNwb3NlZCApIHtcclxuICAgICAgICAgIHRoaXMucGRvbUNsaWNraW5nUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLmlzUHJlc3NlZCApIHtcclxuXHJcbiAgICAgIC8vIGhhbmRsZSBwb2ludGVyIGludGVycnVwdFxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoIGBQcmVzc0xpc3RlbmVyIyR7dGhpcy5faWR9IGludGVycnVwdGluZ2AgKTtcclxuICAgICAgdGhpcy5pbnRlcnJ1cHRlZCA9IHRydWU7XHJcblxyXG4gICAgICB0aGlzLnJlbGVhc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhpcyBzaG91bGQgYmUgY2FsbGVkIHdoZW4gdGhlIGxpc3RlbmVkIFwiTm9kZVwiIGlzIGVmZmVjdGl2ZWx5IHJlbW92ZWQgZnJvbSB0aGUgc2NlbmUgZ3JhcGggQU5EXHJcbiAgICogZXhwZWN0ZWQgdG8gYmUgcGxhY2VkIGJhY2sgaW4gc3VjaCB0aGF0IGl0IGNvdWxkIHBvdGVudGlhbGx5IGdldCBtdWx0aXBsZSBcImVudGVyXCIgZXZlbnRzLCBzZWVcclxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTAyMVxyXG4gICAqXHJcbiAgICogVGhpcyB3aWxsIGNsZWFyIHRoZSBsaXN0IG9mIHBvaW50ZXJzIGNvbnNpZGVyZWQgXCJvdmVyXCIgdGhlIE5vZGUsIHNvIHRoYXQgd2hlbiBpdCBpcyBwbGFjZWQgYmFjayBpbiwgdGhlIHN0YXRlXHJcbiAgICogd2lsbCBiZSBjb3JyZWN0LCBhbmQgYW5vdGhlciBcImVudGVyXCIgZXZlbnQgd2lsbCBub3QgYmUgbWlzc2luZyBhbiBcImV4aXRcIi5cclxuICAgKi9cclxuICBwdWJsaWMgY2xlYXJPdmVyUG9pbnRlcnMoKTogdm9pZCB7XHJcbiAgICB0aGlzLm92ZXJQb2ludGVycy5jbGVhcigpOyAvLyBXZSBoYXZlIGxpc3RlbmVycyB0aGF0IHdpbGwgdHJpZ2dlciB0aGUgcHJvcGVyIHJlZnJlc2hlc1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSWYgY29sbGFwc2VEcmFnRXZlbnRzIGlzIHNldCB0byB0cnVlLCB0aGlzIHN0ZXAoKSBzaG91bGQgYmUgY2FsbGVkIGV2ZXJ5IGZyYW1lIHNvIHRoYXQgdGhlIGNvbGxhcHNlZCBkcmFnXHJcbiAgICogY2FuIGJlIGZpcmVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGVwKCk6IHZvaWQge1xyXG4gICAgdGhpcy5mbHVzaENvbGxhcHNlZERyYWcoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgY2FsbGJhY2sgdGhhdCB3aWxsIGNyZWF0ZSBhIEJvdW5kczIgaW4gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lIGZvciB0aGUgQW5pbWF0ZWRQYW5ab29tTGlzdGVuZXIgdG9cclxuICAgKiBrZWVwIGluIHZpZXcgZHVyaW5nIGEgZHJhZyBvcGVyYXRpb24uIER1cmluZyBkcmFnIGlucHV0IHRoZSBBbmltYXRlZFBhblpvb21MaXN0ZW5lciB3aWxsIHBhbiB0aGUgc2NyZWVuIHRvXHJcbiAgICogdHJ5IGFuZCBrZWVwIHRoZSByZXR1cm5lZCBCb3VuZHMyIHZpc2libGUuIEJ5IGRlZmF1bHQsIHRoZSBBbmltYXRlZFBhblpvb21MaXN0ZW5lciB3aWxsIHRyeSB0byBrZWVwIHRoZSB0YXJnZXQgb2ZcclxuICAgKiB0aGUgZHJhZyBpbiB2aWV3IGJ1dCB0aGF0IG1heSBub3QgYWx3YXlzIHdvcmsgaWYgdGhlIHRhcmdldCBpcyBub3QgYXNzb2NpYXRlZCB3aXRoIHRoZSB0cmFuc2xhdGVkIE5vZGUsIHRoZSB0YXJnZXRcclxuICAgKiBpcyBub3QgZGVmaW5lZCwgb3IgdGhlIHRhcmdldCBoYXMgYm91bmRzIHRoYXQgZG8gbm90IGFjY3VyYXRlbHkgc3Vycm91bmQgdGhlIGdyYXBoaWMgeW91IHdhbnQgdG8ga2VlcCBpbiB2aWV3LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRDcmVhdGVQYW5UYXJnZXRCb3VuZHMoIGNyZWF0ZURyYWdQYW5UYXJnZXRCb3VuZHM6ICggKCkgPT4gQm91bmRzMiApIHwgbnVsbCApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBGb3J3YXJkZWQgdG8gdGhlIHBvaW50ZXJMaXN0ZW5lciBzbyB0aGF0IHRoZSBBbmltYXRlZFBhblpvb21MaXN0ZW5lciBjYW4gZ2V0IHRoaXMgY2FsbGJhY2sgZnJvbSB0aGUgYXR0YWNoZWRcclxuICAgIC8vIGxpc3RlbmVyXHJcbiAgICB0aGlzLl9wb2ludGVyTGlzdGVuZXIuY3JlYXRlUGFuVGFyZ2V0Qm91bmRzID0gY3JlYXRlRHJhZ1BhblRhcmdldEJvdW5kcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgY3JlYXRlUGFuVGFyZ2V0Qm91bmRzKCBjcmVhdGVEcmFnUGFuVGFyZ2V0Qm91bmRzOiAoICgpID0+IEJvdW5kczIgKSB8IG51bGwgKSB7IHRoaXMuc2V0Q3JlYXRlUGFuVGFyZ2V0Qm91bmRzKCBjcmVhdGVEcmFnUGFuVGFyZ2V0Qm91bmRzICk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBjb252ZW5pZW50IHdheSB0byBjcmVhdGUgYW5kIHNldCB0aGUgY2FsbGJhY2sgdGhhdCB3aWxsIHJldHVybiBhIEJvdW5kczIgaW4gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lIGZvciB0aGVcclxuICAgKiBBbmltYXRlZFBhblpvb21MaXN0ZW5lciB0byBrZWVwIGluIHZpZXcgZHVyaW5nIGEgZHJhZyBvcGVyYXRpb24uIFRoZSBBbmltYXRlZFBhblpvb21MaXN0ZW5lciB3aWxsIHRyeSB0byBrZWVwIHRoZVxyXG4gICAqIGJvdW5kcyBvZiB0aGUgbGFzdCBOb2RlIG9mIHRoZSBwcm92aWRlZCB0cmFpbCB2aXNpYmxlIGJ5IHBhbm5pbmcgdGhlIHNjcmVlbiBkdXJpbmcgYSBkcmFnIG9wZXJhdGlvbi4gU2VlXHJcbiAgICogc2V0Q3JlYXRlUGFuVGFyZ2V0Qm91bmRzKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0Q3JlYXRlUGFuVGFyZ2V0Qm91bmRzRnJvbVRyYWlsKCB0cmFpbDogVHJhaWwgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0cmFpbC5sZW5ndGggPiAwLCAndHJhaWwgaGFzIG5vIE5vZGVzIHRvIHByb3ZpZGUgbG9jYWxCb3VuZHMnICk7XHJcbiAgICB0aGlzLnNldENyZWF0ZVBhblRhcmdldEJvdW5kcyggKCkgPT4gdHJhaWwubG9jYWxUb0dsb2JhbEJvdW5kcyggdHJhaWwubGFzdE5vZGUoKS5sb2NhbEJvdW5kcyApICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGNyZWF0ZVBhblRhcmdldEJvdW5kc0Zyb21UcmFpbCggdHJhaWw6IFRyYWlsICkgeyB0aGlzLnNldENyZWF0ZVBhblRhcmdldEJvdW5kc0Zyb21UcmFpbCggdHJhaWwgKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBJZiB0aGVyZSBpcyBhIHBlbmRpbmcgY29sbGFwc2VkIGRyYWcgd2FpdGluZywgd2UnbGwgZmlyZSB0aGF0IGRyYWcgKHVzdWFsbHkgYmVmb3JlIG90aGVyIGV2ZW50cyBvciBkdXJpbmcgYSBzdGVwKVxyXG4gICAqL1xyXG4gIHByaXZhdGUgZmx1c2hDb2xsYXBzZWREcmFnKCk6IHZvaWQge1xyXG4gICAgaWYgKCB0aGlzLl9wZW5kaW5nQ29sbGFwc2VkRHJhZ0V2ZW50ICkge1xyXG4gICAgICB0aGlzLmRyYWcoIHRoaXMuX3BlbmRpbmdDb2xsYXBzZWREcmFnRXZlbnQgKTtcclxuICAgIH1cclxuICAgIHRoaXMuX3BlbmRpbmdDb2xsYXBzZWREcmFnRXZlbnQgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVjb21wdXRlcyB0aGUgdmFsdWUgZm9yIGlzT3ZlclByb3BlcnR5LiBTZXBhcmF0ZSB0byByZWR1Y2UgYW5vbnltb3VzIGZ1bmN0aW9uIGNsb3N1cmVzLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgaW52YWxpZGF0ZU92ZXIoKTogdm9pZCB7XHJcbiAgICBsZXQgcG9pbnRlckF0dGFjaGVkVG9PdGhlciA9IGZhbHNlO1xyXG5cclxuICAgIGlmICggdGhpcy5fbGlzdGVuaW5nVG9Qb2ludGVyICkge1xyXG5cclxuICAgICAgLy8gdGhpcyBwb2ludGVyIGxpc3RlbmVyIGlzIGF0dGFjaGVkIHRvIHRoZSBwb2ludGVyXHJcbiAgICAgIHBvaW50ZXJBdHRhY2hlZFRvT3RoZXIgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gYSBsaXN0ZW5lciBvdGhlciB0aGFuIHRoaXMgb25lIGlzIGF0dGFjaGVkIHRvIHRoZSBwb2ludGVyIHNvIGl0IHNob3VsZCBub3QgYmUgY29uc2lkZXJlZCBvdmVyXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMub3ZlclBvaW50ZXJzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGlmICggdGhpcy5vdmVyUG9pbnRlcnMuZ2V0KCBpICkhLmlzQXR0YWNoZWQoKSApIHtcclxuICAgICAgICAgIHBvaW50ZXJBdHRhY2hlZFRvT3RoZXIgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaXNPdmVyUHJvcGVydHkgaXMgb25seSBmb3IgdGhlIGBvdmVyYCBldmVudCwgbG9va3NPdmVyUHJvcGVydHkgaW5jbHVkZXMgZm9jdXNlZCBwcmVzc0xpc3RlbmVycyAob25seSB3aGVuIHRoZVxyXG4gICAgLy8gZGlzcGxheSBpcyBzaG93aW5nIGZvY3VzIGhpZ2hsaWdodHMpXHJcbiAgICB0aGlzLmlzT3ZlclByb3BlcnR5LnZhbHVlID0gKCB0aGlzLm92ZXJQb2ludGVycy5sZW5ndGggPiAwICYmICFwb2ludGVyQXR0YWNoZWRUb090aGVyICk7XHJcbiAgICB0aGlzLmxvb2tzT3ZlclByb3BlcnR5LnZhbHVlID0gdGhpcy5pc092ZXJQcm9wZXJ0eS52YWx1ZSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggdGhpcy5pc0ZvY3VzZWRQcm9wZXJ0eS52YWx1ZSAmJiAhIXRoaXMuZGlzcGxheSAmJiB0aGlzLmRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBkb21Gb2N1c0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkudmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlY29tcHV0ZXMgdGhlIHZhbHVlIGZvciBpc0hvdmVyaW5nUHJvcGVydHkuIFNlcGFyYXRlIHRvIHJlZHVjZSBhbm9ueW1vdXMgZnVuY3Rpb24gY2xvc3VyZXMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBpbnZhbGlkYXRlSG92ZXJpbmcoKTogdm9pZCB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm92ZXJQb2ludGVycy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgcG9pbnRlciA9IHRoaXMub3ZlclBvaW50ZXJzWyBpIF07XHJcbiAgICAgIGlmICggIXBvaW50ZXIuaXNEb3duIHx8IHBvaW50ZXIgPT09IHRoaXMucG9pbnRlciApIHtcclxuICAgICAgICB0aGlzLmlzSG92ZXJpbmdQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmlzSG92ZXJpbmdQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVjb21wdXRlcyB0aGUgdmFsdWUgZm9yIGlzSGlnaGxpZ2h0ZWRQcm9wZXJ0eS4gU2VwYXJhdGUgdG8gcmVkdWNlIGFub255bW91cyBmdW5jdGlvbiBjbG9zdXJlcy5cclxuICAgKi9cclxuICBwcml2YXRlIGludmFsaWRhdGVIaWdobGlnaHRlZCgpOiB2b2lkIHtcclxuICAgIHRoaXMuaXNIaWdobGlnaHRlZFByb3BlcnR5LnZhbHVlID0gdGhpcy5pc0hvdmVyaW5nUHJvcGVydHkudmFsdWUgfHwgdGhpcy5pc1ByZXNzZWRQcm9wZXJ0eS52YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpcmVkIHdoZW4gdGhlIGVuYWJsZWRQcm9wZXJ0eSBjaGFuZ2VzXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIG9uRW5hYmxlZFByb3BlcnR5Q2hhbmdlKCBlbmFibGVkOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgIWVuYWJsZWQgJiYgdGhpcy5pbnRlcnJ1cHQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVybmFsIGNvZGUgZXhlY3V0ZWQgYXMgdGhlIGZpcnN0IHN0ZXAgb2YgYSBwcmVzcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBldmVudFxyXG4gICAqIEBwYXJhbSBbdGFyZ2V0Tm9kZV0gLSBJZiBwcm92aWRlZCwgd2lsbCB0YWtlIHRoZSBwbGFjZSBvZiB0aGUgdGFyZ2V0Tm9kZSBmb3IgdGhpcyBjYWxsLiBVc2VmdWwgZm9yXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3J3YXJkZWQgcHJlc3Nlcy5cclxuICAgKiBAcGFyYW0gW2NhbGxiYWNrXSAtIHRvIGJlIHJ1biBhdCB0aGUgZW5kIG9mIHRoZSBmdW5jdGlvbiwgYnV0IG9ubHkgb24gc3VjY2Vzc1xyXG4gICAqL1xyXG4gIHByaXZhdGUgb25QcmVzcyggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCwgdGFyZ2V0Tm9kZTogTm9kZSB8IG51bGwsIGNhbGxiYWNrOiAoICgpID0+IHZvaWQgKSB8IG51bGwgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pc0Rpc3Bvc2VkLCAnU2hvdWxkIG5vdCBwcmVzcyBvbiBhIGRpc3Bvc2VkIGxpc3RlbmVyJyApO1xyXG5cclxuICAgIGNvbnN0IGdpdmVuVGFyZ2V0Tm9kZSA9IHRhcmdldE5vZGUgfHwgdGhpcy5fdGFyZ2V0Tm9kZTtcclxuXHJcbiAgICAvLyBTZXQgdGhpcyBwcm9wZXJ0aWVzIGJlZm9yZSB0aGUgcHJvcGVydHkgY2hhbmdlLCBzbyB0aGV5IGFyZSB2aXNpYmxlIHRvIGxpc3RlbmVycy5cclxuICAgIHRoaXMucG9pbnRlciA9IGV2ZW50LnBvaW50ZXI7XHJcbiAgICB0aGlzLnByZXNzZWRUcmFpbCA9IGdpdmVuVGFyZ2V0Tm9kZSA/IGdpdmVuVGFyZ2V0Tm9kZS5nZXRVbmlxdWVUcmFpbCgpIDogZXZlbnQudHJhaWwuc3VidHJhaWxUbyggZXZlbnQuY3VycmVudFRhcmdldCEsIGZhbHNlICk7XHJcblxyXG4gICAgdGhpcy5pbnRlcnJ1cHRlZCA9IGZhbHNlOyAvLyBjbGVhcnMgdGhlIGZsYWcgKGRvbid0IHNldCB0byBmYWxzZSBiZWZvcmUgaGVyZSlcclxuXHJcbiAgICB0aGlzLnBvaW50ZXIuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5fcG9pbnRlckxpc3RlbmVyLCB0aGlzLl9hdHRhY2ggKTtcclxuICAgIHRoaXMuX2xpc3RlbmluZ1RvUG9pbnRlciA9IHRydWU7XHJcblxyXG4gICAgdGhpcy5wb2ludGVyLmN1cnNvciA9IHRoaXMucHJlc3NlZFRyYWlsLmxhc3ROb2RlKCkuZ2V0RWZmZWN0aXZlQ3Vyc29yKCkgfHwgdGhpcy5fcHJlc3NDdXJzb3I7XHJcblxyXG4gICAgdGhpcy5pc1ByZXNzZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcblxyXG4gICAgLy8gTm90aWZ5IGFmdGVyIGV2ZXJ5dGhpbmcgZWxzZSBpcyBzZXQgdXBcclxuICAgIHRoaXMuX3ByZXNzTGlzdGVuZXIoIGV2ZW50LCB0aGlzICk7XHJcblxyXG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVybmFsIGNvZGUgZXhlY3V0ZWQgYXMgdGhlIGZpcnN0IHN0ZXAgb2YgYSByZWxlYXNlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGV2ZW50IC0gc2NlbmVyeSBldmVudCBpZiB0aGVyZSB3YXMgb25lXHJcbiAgICogQHBhcmFtIFtjYWxsYmFja10gLSBjYWxsZWQgYXQgdGhlIGVuZCBvZiB0aGUgcmVsZWFzZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgb25SZWxlYXNlKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50IHwgbnVsbCwgY2FsbGJhY2s6ICggKCkgPT4gdm9pZCApIHwgbnVsbCApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNQcmVzc2VkLCAnVGhpcyBsaXN0ZW5lciBpcyBub3QgcHJlc3NlZCcgKTtcclxuICAgIGNvbnN0IHByZXNzZWRMaXN0ZW5lciA9IHRoaXMgYXMgUHJlc3NlZFByZXNzTGlzdGVuZXI7XHJcblxyXG4gICAgcHJlc3NlZExpc3RlbmVyLnBvaW50ZXIucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5fcG9pbnRlckxpc3RlbmVyICk7XHJcbiAgICB0aGlzLl9saXN0ZW5pbmdUb1BvaW50ZXIgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIHByZXNzZWQgc3RhdGUgZmFsc2UgKmJlZm9yZSogaW52b2tpbmcgdGhlIGNhbGxiYWNrLCBvdGhlcndpc2UgYW4gaW5maW5pdGUgbG9vcCBjYW4gcmVzdWx0IGluIHNvbWVcclxuICAgIC8vIGNpcmN1bXN0YW5jZXMuXHJcbiAgICB0aGlzLmlzUHJlc3NlZFByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcblxyXG4gICAgLy8gTm90aWZ5IGFmdGVyIHRoZSByZXN0IG9mIHJlbGVhc2UgaXMgY2FsbGVkIGluIG9yZGVyIHRvIHByZXZlbnQgaXQgZnJvbSB0cmlnZ2VyaW5nIGludGVycnVwdCgpLlxyXG4gICAgdGhpcy5fcmVsZWFzZUxpc3RlbmVyKCBldmVudCwgdGhpcyApO1xyXG5cclxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCk7XHJcblxyXG4gICAgLy8gVGhlc2UgcHJvcGVydGllcyBhcmUgY2xlYXJlZCBub3csIGF0IHRoZSBlbmQgb2YgdGhlIG9uUmVsZWFzZSwgaW4gY2FzZSB0aGV5IHdlcmUgbmVlZGVkIGJ5IHRoZSBjYWxsYmFjayBvciBpblxyXG4gICAgLy8gbGlzdGVuZXJzIG9uIHRoZSBwcmVzc2VkIFByb3BlcnR5LlxyXG4gICAgcHJlc3NlZExpc3RlbmVyLnBvaW50ZXIuY3Vyc29yID0gbnVsbDtcclxuICAgIHRoaXMucG9pbnRlciA9IG51bGw7XHJcbiAgICB0aGlzLnByZXNzZWRUcmFpbCA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2l0aCAnZG93bicgZXZlbnRzIChwYXJ0IG9mIHRoZSBsaXN0ZW5lciBBUEkpLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKlxyXG4gICAqIE5PVEU6IERvIG5vdCBjYWxsIGRpcmVjdGx5LiBTZWUgdGhlIHByZXNzIG1ldGhvZCBpbnN0ZWFkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBkb3duKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgUHJlc3NMaXN0ZW5lciMke3RoaXMuX2lkfSBkb3duYCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgdGhpcy5wcmVzcyggZXZlbnQgKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdpdGggJ3VwJyBldmVudHMgKHBhcnQgb2YgdGhlIGxpc3RlbmVyIEFQSSkuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogTk9URTogRG8gbm90IGNhbGwgZGlyZWN0bHkuXHJcbiAgICovXHJcbiAgcHVibGljIHVwKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgUHJlc3NMaXN0ZW5lciMke3RoaXMuX2lkfSB1cGAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIC8vIFJlY2FsY3VsYXRlIG92ZXIvaG92ZXJpbmcgUHJvcGVydGllcy5cclxuICAgIHRoaXMuaW52YWxpZGF0ZU92ZXIoKTtcclxuICAgIHRoaXMuaW52YWxpZGF0ZUhvdmVyaW5nKCk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aXRoICdlbnRlcicgZXZlbnRzIChwYXJ0IG9mIHRoZSBsaXN0ZW5lciBBUEkpLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKlxyXG4gICAqIE5PVEU6IERvIG5vdCBjYWxsIGRpcmVjdGx5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBlbnRlciggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCApOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggYFByZXNzTGlzdGVuZXIjJHt0aGlzLl9pZH0gZW50ZXJgICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICB0aGlzLm92ZXJQb2ludGVycy5wdXNoKCBldmVudC5wb2ludGVyICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aXRoIGBtb3ZlYCBldmVudHMgKHBhcnQgb2YgdGhlIGxpc3RlbmVyIEFQSSkuIEl0IGlzIG5lY2Vzc2FyeSB0byBjaGVjayBmb3IgYG92ZXJgIHN0YXRlIGNoYW5nZXMgb24gbW92ZVxyXG4gICAqIGluIGNhc2UgYSBwb2ludGVyIGxpc3RlbmVyIGdldHMgaW50ZXJydXB0ZWQgYW5kIHJlc3VtZXMgbW92ZW1lbnQgb3ZlciBhIHRhcmdldC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIG1vdmUoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoIGBQcmVzc0xpc3RlbmVyIyR7dGhpcy5faWR9IG1vdmVgICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICB0aGlzLmludmFsaWRhdGVPdmVyKCk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aXRoICdleGl0JyBldmVudHMgKHBhcnQgb2YgdGhlIGxpc3RlbmVyIEFQSSkuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogTk9URTogRG8gbm90IGNhbGwgZGlyZWN0bHkuXHJcbiAgICovXHJcbiAgcHVibGljIGV4aXQoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoIGBQcmVzc0xpc3RlbmVyIyR7dGhpcy5faWR9IGV4aXRgICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBOT1RFOiBXZSBkb24ndCByZXF1aXJlIHRoZSBwb2ludGVyIHRvIGJlIGluY2x1ZGVkIGhlcmUsIHNpbmNlIHdlIG1heSBoYXZlIGFkZGVkIHRoZSBsaXN0ZW5lciBhZnRlciB0aGUgJ2VudGVyJ1xyXG4gICAgLy8gd2FzIGZpcmVkLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FyZWEtbW9kZWwtY29tbW9uL2lzc3Vlcy8xNTkgZm9yIG1vcmUgZGV0YWlscy5cclxuICAgIGlmICggdGhpcy5vdmVyUG9pbnRlcnMuaW5jbHVkZXMoIGV2ZW50LnBvaW50ZXIgKSApIHtcclxuICAgICAgdGhpcy5vdmVyUG9pbnRlcnMucmVtb3ZlKCBldmVudC5wb2ludGVyICk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aXRoICd1cCcgZXZlbnRzIGZyb20gdGhlIHBvaW50ZXIgKHBhcnQgb2YgdGhlIGxpc3RlbmVyIEFQSSkgKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBOT1RFOiBEbyBub3QgY2FsbCBkaXJlY3RseS5cclxuICAgKi9cclxuICBwdWJsaWMgcG9pbnRlclVwKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgUHJlc3NMaXN0ZW5lciMke3RoaXMuX2lkfSBwb2ludGVyIHVwYCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gU2luY2Ugb3VyIGNhbGxiYWNrIGNhbiBnZXQgcXVldWVkIHVwIGFuZCBUSEVOIGludGVycnVwdGVkIGJlZm9yZSB0aGlzIGhhcHBlbnMsIHdlJ2xsIGNoZWNrIHRvIG1ha2Ugc3VyZSB3ZSBhcmVcclxuICAgIC8vIHN0aWxsIHByZXNzZWQgYnkgdGhlIHRpbWUgd2UgZ2V0IGhlcmUuIElmIG5vdCBwcmVzc2VkLCB0aGVuIHRoZXJlIGlzIG5vdGhpbmcgdG8gZG8uXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NhcGFjaXRvci1sYWItYmFzaWNzL2lzc3Vlcy8yNTFcclxuICAgIGlmICggdGhpcy5pc1ByZXNzZWQgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGV2ZW50LnBvaW50ZXIgPT09IHRoaXMucG9pbnRlciApO1xyXG5cclxuICAgICAgdGhpcy5yZWxlYXNlKCBldmVudCApO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2l0aCAnY2FuY2VsJyBldmVudHMgZnJvbSB0aGUgcG9pbnRlciAocGFydCBvZiB0aGUgbGlzdGVuZXIgQVBJKSAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKlxyXG4gICAqIE5PVEU6IERvIG5vdCBjYWxsIGRpcmVjdGx5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBwb2ludGVyQ2FuY2VsKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgUHJlc3NMaXN0ZW5lciMke3RoaXMuX2lkfSBwb2ludGVyIGNhbmNlbGAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIC8vIFNpbmNlIG91ciBjYWxsYmFjayBjYW4gZ2V0IHF1ZXVlZCB1cCBhbmQgVEhFTiBpbnRlcnJ1cHRlZCBiZWZvcmUgdGhpcyBoYXBwZW5zLCB3ZSdsbCBjaGVjayB0byBtYWtlIHN1cmUgd2UgYXJlXHJcbiAgICAvLyBzdGlsbCBwcmVzc2VkIGJ5IHRoZSB0aW1lIHdlIGdldCBoZXJlLiBJZiBub3QgcHJlc3NlZCwgdGhlbiB0aGVyZSBpcyBub3RoaW5nIHRvIGRvLlxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jYXBhY2l0b3ItbGFiLWJhc2ljcy9pc3N1ZXMvMjUxXHJcbiAgICBpZiAoIHRoaXMuaXNQcmVzc2VkICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBldmVudC5wb2ludGVyID09PSB0aGlzLnBvaW50ZXIgKTtcclxuXHJcbiAgICAgIHRoaXMuaW50ZXJydXB0KCk7IC8vIHdpbGwgbWFyayBhcyBpbnRlcnJ1cHRlZCBhbmQgcmVsZWFzZSgpXHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aXRoICdtb3ZlJyBldmVudHMgZnJvbSB0aGUgcG9pbnRlciAocGFydCBvZiB0aGUgbGlzdGVuZXIgQVBJKSAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKlxyXG4gICAqIE5PVEU6IERvIG5vdCBjYWxsIGRpcmVjdGx5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBwb2ludGVyTW92ZSggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCApOiB2b2lkIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggYFByZXNzTGlzdGVuZXIjJHt0aGlzLl9pZH0gcG9pbnRlciBtb3ZlYCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gU2luY2Ugb3VyIGNhbGxiYWNrIGNhbiBnZXQgcXVldWVkIHVwIGFuZCBUSEVOIGludGVycnVwdGVkIGJlZm9yZSB0aGlzIGhhcHBlbnMsIHdlJ2xsIGNoZWNrIHRvIG1ha2Ugc3VyZSB3ZSBhcmVcclxuICAgIC8vIHN0aWxsIHByZXNzZWQgYnkgdGhlIHRpbWUgd2UgZ2V0IGhlcmUuIElmIG5vdCBwcmVzc2VkLCB0aGVuIHRoZXJlIGlzIG5vdGhpbmcgdG8gZG8uXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NhcGFjaXRvci1sYWItYmFzaWNzL2lzc3Vlcy8yNTFcclxuICAgIGlmICggdGhpcy5pc1ByZXNzZWQgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGV2ZW50LnBvaW50ZXIgPT09IHRoaXMucG9pbnRlciApO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLl9jb2xsYXBzZURyYWdFdmVudHMgKSB7XHJcbiAgICAgICAgdGhpcy5fcGVuZGluZ0NvbGxhcHNlZERyYWdFdmVudCA9IGV2ZW50O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZHJhZyggZXZlbnQgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiB0aGUgcG9pbnRlciBuZWVkcyB0byBpbnRlcnJ1cHQgaXRzIGN1cnJlbnQgbGlzdGVuZXIgKHVzdWFsbHkgc28gYW5vdGhlciBjYW4gYmUgYWRkZWQpLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKlxyXG4gICAqIE5PVEU6IERvIG5vdCBjYWxsIGRpcmVjdGx5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBwb2ludGVySW50ZXJydXB0KCk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgUHJlc3NMaXN0ZW5lciMke3RoaXMuX2lkfSBwb2ludGVyIGludGVycnVwdGAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIHRoaXMuaW50ZXJydXB0KCk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsaWNrIGxpc3RlbmVyLCBjYWxsZWQgd2hlbiB0aGlzIGlzIHRyZWF0ZWQgYXMgYW4gYWNjZXNzaWJsZSBpbnB1dCBsaXN0ZW5lci5cclxuICAgKiBJbiBnZW5lcmFsIG5vdCBuZWVkZWQgdG8gYmUgcHVibGljLCBidXQganVzdCB1c2VkIGluIGVkZ2UgY2FzZXMgdG8gZ2V0IHByb3BlciBjbGljayBsb2dpYyBmb3IgcGRvbS5cclxuICAgKlxyXG4gICAqIEhhbmRsZSB0aGUgY2xpY2sgZXZlbnQgZnJvbSBET00gZm9yIFBET00uIENsaWNrcyBieSBjYWxsaW5nIHByZXNzIGFuZCByZWxlYXNlIGltbWVkaWF0ZWx5LlxyXG4gICAqIFdoZW4gYXNzaXN0aXZlIHRlY2hub2xvZ3kgaXMgdXNlZCwgdGhlIGJyb3dzZXIgbWF5IG5vdCByZWNlaXZlICdrZXlkb3duJyBvciAna2V5dXAnIGV2ZW50cyBvbiBpbnB1dCBlbGVtZW50cywgYnV0XHJcbiAgICogb25seSBhIHNpbmdsZSAnY2xpY2snIGV2ZW50LiBXZSBuZWVkIHRvIHRvZ2dsZSB0aGUgcHJlc3NlZCBzdGF0ZSBmcm9tIHRoZSBzaW5nbGUgJ2NsaWNrJyBldmVudC5cclxuICAgKlxyXG4gICAqIFRoaXMgd2lsbCBmaXJlIGxpc3RlbmVycyBpbW1lZGlhdGVseSwgYnV0IGFkZHMgYSBkZWxheSBmb3IgdGhlIHBkb21DbGlja2luZ1Byb3BlcnR5IHNvIHRoYXQgeW91IGNhbiBtYWtlIGFcclxuICAgKiBidXR0b24gbG9vayBwcmVzc2VkIGZyb20gYSBzaW5nbGUgRE9NIGNsaWNrIGV2ZW50LiBGb3IgZXhhbXBsZSB1c2FnZSwgc2VlIHN1bi9CdXR0b25Nb2RlbC5sb29rc1ByZXNzZWRQcm9wZXJ0eS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBldmVudFxyXG4gICAqIEBwYXJhbSBbY2FsbGJhY2tdIG9wdGlvbmFsbHkgY2FsbGVkIGltbWVkaWF0ZWx5IGFmdGVyIHByZXNzLCBidXQgb25seSBvbiBzdWNjZXNzZnVsIGNsaWNrXHJcbiAgICogQHJldHVybnMgc3VjY2VzcyAtIFJldHVybnMgd2hldGhlciB0aGUgcHJlc3Mgd2FzIGFjdHVhbGx5IHN0YXJ0ZWRcclxuICAgKi9cclxuICBwdWJsaWMgY2xpY2soIGV2ZW50OiBTY2VuZXJ5RXZlbnQ8TW91c2VFdmVudD4gfCBudWxsLCBjYWxsYmFjaz86ICgpID0+IHZvaWQgKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIHRoaXMuY2FuQ2xpY2soKSApIHtcclxuICAgICAgdGhpcy5pbnRlcnJ1cHRlZCA9IGZhbHNlOyAvLyBjbGVhcnMgdGhlIGZsYWcgKGRvbid0IHNldCB0byBmYWxzZSBiZWZvcmUgaGVyZSlcclxuXHJcbiAgICAgIHRoaXMucGRvbUNsaWNraW5nUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG5cclxuICAgICAgLy8gZW5zdXJlIHRoYXQgYnV0dG9uIGlzICdmb2N1c2VkJyBzbyBsaXN0ZW5lciBjYW4gYmUgY2FsbGVkIHdoaWxlIGJ1dHRvbiBpcyBkb3duXHJcbiAgICAgIHRoaXMuaXNGb2N1c2VkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICB0aGlzLmlzUHJlc3NlZFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIGZpcmUgdGhlIG9wdGlvbmFsIGNhbGxiYWNrXHJcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgICAgdGhpcy5fcHJlc3NMaXN0ZW5lciggZXZlbnQsIHRoaXMgKTtcclxuXHJcbiAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCk7XHJcblxyXG4gICAgICAvLyBubyBsb25nZXIgZG93biwgZG9uJ3QgcmVzZXQgJ292ZXInIHNvIGJ1dHRvbiBjYW4gYmUgc3R5bGVkIGFzIGxvbmcgYXMgaXQgaGFzIGZvY3VzXHJcbiAgICAgIHRoaXMuaXNQcmVzc2VkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIGZpcmUgdGhlIGNhbGxiYWNrIGZyb20gb3B0aW9uc1xyXG4gICAgICB0aGlzLl9yZWxlYXNlTGlzdGVuZXIoIGV2ZW50LCB0aGlzICk7XHJcblxyXG4gICAgICAvLyBpZiB3ZSBhcmUgYWxyZWFkeSBjbGlja2luZywgcmVtb3ZlIHRoZSBwcmV2aW91cyB0aW1lb3V0IC0gdGhpcyBhc3N1bWVzIHRoYXQgY2xlYXJUaW1lb3V0IGlzIGEgbm9vcCBpZiB0aGVcclxuICAgICAgLy8gbGlzdGVuZXIgaXMgbm8gbG9uZ2VyIGF0dGFjaGVkXHJcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVE9ETzogVGhpcyBsb29rcyBidWdneSwgd2lsbCBuZWVkIHRvIGlnbm9yZSBmb3Igbm93XHJcbiAgICAgIHN0ZXBUaW1lci5jbGVhclRpbWVvdXQoIHRoaXMuX3Bkb21DbGlja2luZ1RpbWVvdXRMaXN0ZW5lciApO1xyXG5cclxuICAgICAgLy8gTm93IGFkZCB0aGUgdGltZW91dCBiYWNrIHRvIHN0YXJ0IG92ZXIsIHNhdmluZyBzbyB0aGF0IGl0IGNhbiBiZSByZW1vdmVkIGxhdGVyLiBFdmVuIHdoZW4gdGhpcyBsaXN0ZW5lciB3YXNcclxuICAgICAgLy8gaW50ZXJydXB0ZWQgZnJvbSBhYm92ZSBsb2dpYywgd2Ugc3RpbGwgZGVsYXkgc2V0dGluZyB0aGlzIHRvIGZhbHNlIHRvIHN1cHBvcnQgdmlzdWFsIFwicHJlc3NpbmdcIiByZWRyYXcuXHJcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVE9ETzogVGhpcyBsb29rcyBidWdneSwgd2lsbCBuZWVkIHRvIGlnbm9yZSBmb3Igbm93XHJcbiAgICAgIHRoaXMuX3Bkb21DbGlja2luZ1RpbWVvdXRMaXN0ZW5lciA9IHN0ZXBUaW1lci5zZXRUaW1lb3V0KCAoKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIHRoZSBsaXN0ZW5lciBtYXkgaGF2ZSBiZWVuIGRpc3Bvc2VkIGJlZm9yZSB0aGUgZW5kIG9mIGExMXlMb29rc1ByZXNzZWRJbnRlcnZhbCwgbGlrZSBpZiBpdCBmaXJlcyBhbmRcclxuICAgICAgICAvLyBkaXNwb3NlcyBpdHNlbGYgaW1tZWRpYXRlbHlcclxuICAgICAgICBpZiAoICF0aGlzLnBkb21DbGlja2luZ1Byb3BlcnR5LmlzRGlzcG9zZWQgKSB7XHJcbiAgICAgICAgICB0aGlzLnBkb21DbGlja2luZ1Byb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LCB0aGlzLl9hMTF5TG9va3NQcmVzc2VkSW50ZXJ2YWwgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZvY3VzIGxpc3RlbmVyLCBjYWxsZWQgd2hlbiB0aGlzIGlzIHRyZWF0ZWQgYXMgYW4gYWNjZXNzaWJsZSBpbnB1dCBsaXN0ZW5lciBhbmQgaXRzIHRhcmdldCBpcyBmb2N1c2VkLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKiBAcGRvbVxyXG4gICAqL1xyXG4gIHB1YmxpYyBmb2N1cyggZXZlbnQ6IFNjZW5lcnlFdmVudDxGb2N1c0V2ZW50PiApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBHZXQgdGhlIERpc3BsYXkgcmVsYXRlZCB0byB0aGlzIGFjY2Vzc2libGUgZXZlbnQuXHJcbiAgICBjb25zdCBhY2Nlc3NpYmxlRGlzcGxheXMgPSBldmVudC50cmFpbC5yb290Tm9kZSgpLmdldFJvb3RlZERpc3BsYXlzKCkuZmlsdGVyKCBkaXNwbGF5ID0+IGRpc3BsYXkuaXNBY2Nlc3NpYmxlKCkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFjY2Vzc2libGVEaXNwbGF5cy5sZW5ndGggPT09IDEsXHJcbiAgICAgICdjYW5ub3QgZm9jdXMgbm9kZSB3aXRoIHplcm8gb3IgbXVsdGlwbGUgYWNjZXNzaWJsZSBkaXNwbGF5cyBhdHRhY2hlZCcgKTtcclxuICAgIC8vXHJcbiAgICB0aGlzLmRpc3BsYXkgPSBhY2Nlc3NpYmxlRGlzcGxheXNbIDAgXTtcclxuICAgIGlmICggIXRoaXMuZGlzcGxheS5mb2N1c01hbmFnZXIucGRvbUZvY3VzSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eS5oYXNMaXN0ZW5lciggdGhpcy5ib3VuZEludmFsaWRhdGVPdmVyTGlzdGVuZXIgKSApIHtcclxuICAgICAgdGhpcy5kaXNwbGF5LmZvY3VzTWFuYWdlci5wZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LmxpbmsoIHRoaXMuYm91bmRJbnZhbGlkYXRlT3Zlckxpc3RlbmVyICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gT24gZm9jdXMsIGJ1dHRvbiBzaG91bGQgbG9vayAnb3ZlcicuXHJcbiAgICB0aGlzLmlzRm9jdXNlZFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEJsdXIgbGlzdGVuZXIsIGNhbGxlZCB3aGVuIHRoaXMgaXMgdHJlYXRlZCBhcyBhbiBhY2Nlc3NpYmxlIGlucHV0IGxpc3RlbmVyLlxyXG4gICAqIEBwZG9tXHJcbiAgICovXHJcbiAgcHVibGljIGJsdXIoKTogdm9pZCB7XHJcbiAgICBpZiAoIHRoaXMuZGlzcGxheSApIHtcclxuICAgICAgaWYgKCB0aGlzLmRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBkb21Gb2N1c0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkuaGFzTGlzdGVuZXIoIHRoaXMuYm91bmRJbnZhbGlkYXRlT3Zlckxpc3RlbmVyICkgKSB7XHJcbiAgICAgICAgdGhpcy5kaXNwbGF5LmZvY3VzTWFuYWdlci5wZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LnVubGluayggdGhpcy5ib3VuZEludmFsaWRhdGVPdmVyTGlzdGVuZXIgKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmRpc3BsYXkgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE9uIGJsdXIsIHRoZSBidXR0b24gc2hvdWxkIG5vIGxvbmdlciBsb29rICdvdmVyJy5cclxuICAgIHRoaXMuaXNGb2N1c2VkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpc3Bvc2VzIHRoZSBsaXN0ZW5lciwgcmVsZWFzaW5nIHJlZmVyZW5jZXMuIEl0IHNob3VsZCBub3QgYmUgdXNlZCBhZnRlciB0aGlzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgUHJlc3NMaXN0ZW5lciMke3RoaXMuX2lkfSBkaXNwb3NlYCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gV2UgbmVlZCB0byByZWxlYXNlIHJlZmVyZW5jZXMgdG8gYW55IHBvaW50ZXJzIHRoYXQgYXJlIG92ZXIgdXMuXHJcbiAgICB0aGlzLm92ZXJQb2ludGVycy5jbGVhcigpO1xyXG5cclxuICAgIGlmICggdGhpcy5fbGlzdGVuaW5nVG9Qb2ludGVyICYmIGlzUHJlc3NlZExpc3RlbmVyKCB0aGlzICkgKSB7XHJcbiAgICAgIHRoaXMucG9pbnRlci5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9wb2ludGVyTGlzdGVuZXIgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGVzZSBQcm9wZXJ0aWVzIGNvdWxkIGhhdmUgYWxyZWFkeSBiZWVuIGRpc3Bvc2VkLCBmb3IgZXhhbXBsZSBpbiB0aGUgc3VuIGJ1dHRvbiBoaWVyYXJjaHksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy8zNzJcclxuICAgIGlmICggIXRoaXMuaXNQcmVzc2VkUHJvcGVydHkuaXNEaXNwb3NlZCApIHtcclxuICAgICAgdGhpcy5pc1ByZXNzZWRQcm9wZXJ0eS51bmxpbmsoIHRoaXMuX2lzSGlnaGxpZ2h0ZWRMaXN0ZW5lciApO1xyXG4gICAgICB0aGlzLmlzUHJlc3NlZFByb3BlcnR5LnVubGluayggdGhpcy5faXNIb3ZlcmluZ0xpc3RlbmVyICk7XHJcbiAgICB9XHJcbiAgICAhdGhpcy5pc0hvdmVyaW5nUHJvcGVydHkuaXNEaXNwb3NlZCAmJiB0aGlzLmlzSG92ZXJpbmdQcm9wZXJ0eS51bmxpbmsoIHRoaXMuX2lzSGlnaGxpZ2h0ZWRMaXN0ZW5lciApO1xyXG5cclxuICAgIHRoaXMuX3ByZXNzQWN0aW9uLmRpc3Bvc2UoKTtcclxuICAgIHRoaXMuX3JlbGVhc2VBY3Rpb24uZGlzcG9zZSgpO1xyXG5cclxuICAgIHRoaXMubG9va3NQcmVzc2VkUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5wZG9tQ2xpY2tpbmdQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLmN1cnNvclByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHRoaXMuaXNGb2N1c2VkUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5pc0hpZ2hsaWdodGVkUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5pc0hvdmVyaW5nUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5sb29rc092ZXJQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLmlzT3ZlclByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHRoaXMuaXNQcmVzc2VkUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5vdmVyUG9pbnRlcnMuZGlzcG9zZSgpO1xyXG5cclxuICAgIC8vIFJlbW92ZSByZWZlcmVuY2VzIHRvIHRoZSBzdG9yZWQgZGlzcGxheSwgaWYgd2UgaGF2ZSBhbnkuXHJcbiAgICBpZiAoIHRoaXMuZGlzcGxheSApIHtcclxuICAgICAgdGhpcy5kaXNwbGF5LmZvY3VzTWFuYWdlci5wZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LnVubGluayggdGhpcy5ib3VuZEludmFsaWRhdGVPdmVyTGlzdGVuZXIgKTtcclxuICAgICAgdGhpcy5kaXNwbGF5ID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcGhldGlvQVBJID0ge1xyXG4gICAgcHJlc3NBY3Rpb246IHsgcGhldGlvVHlwZTogUGhldGlvQWN0aW9uLlBoZXRpb0FjdGlvbklPKCBbIFNjZW5lcnlFdmVudC5TY2VuZXJ5RXZlbnRJTyBdICkgfSxcclxuICAgIHJlbGVhc2VBY3Rpb246IHsgcGhldGlvVHlwZTogUGhldGlvQWN0aW9uLlBoZXRpb0FjdGlvbklPKCBbIE51bGxhYmxlSU8oIFNjZW5lcnlFdmVudC5TY2VuZXJ5RXZlbnRJTyApIF0gKSB9XHJcbiAgfTtcclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ1ByZXNzTGlzdGVuZXInLCBQcmVzc0xpc3RlbmVyICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxZQUFZLE1BQU0sb0NBQW9DO0FBQzdELE9BQU9DLGVB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