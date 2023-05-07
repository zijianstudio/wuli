// Copyright 2019-2023, University of Colorado Boulder

/**
 * A PanZoomListener that supports additional forms of input for pan and zoom, including trackpad gestures, mouse
 * wheel, and keyboard input. These gestures will animate the target node to its destination translation and scale so it
 * uses a step function that must be called every animation frame.
 *
 * @author Jesse Greenberg
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import merge from '../../../phet-core/js/merge.js';
import platform from '../../../phet-core/js/platform.js';
import EventType from '../../../tandem/js/EventType.js';
import PhetioAction from '../../../tandem/js/PhetioAction.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { EventIO, FocusManager, globalKeyStateTracker, Intent, KeyboardDragListener, KeyboardUtils, KeyboardZoomUtils, Node, PanZoomListener, PDOMPointer, PDOMUtils, PressListener, scenery } from '../imports.js';

// constants
const MOVE_CURSOR = 'all-scroll';
const MAX_SCROLL_VELOCITY = 150; // max global view coords per second while scrolling with middle mouse button drag

// The max speed of translation when animating from source position to destination position in the coordinate frame
// of the parent of the targetNode of this listener. Increase the value of this to animate faster to the destination
// position when panning to targets.
const MAX_TRANSLATION_SPEED = 1000;

// scratch variables to reduce garbage
const scratchTranslationVector = new Vector2(0, 0);
const scratchScaleTargetVector = new Vector2(0, 0);
const scratchVelocityVector = new Vector2(0, 0);
const scratchBounds = new Bounds2(0, 0, 0, 0);
class AnimatedPanZoomListener extends PanZoomListener {
  /**
   * @param {Node} targetNode - Node to be transformed by this listener
   * @param {Object} [options]
   */
  constructor(targetNode, options) {
    // While this is still JavaScript, this relatively useless assertion lets us import Node for other TypeScript
    assert && assert(targetNode instanceof Node);
    options = merge({
      tandem: Tandem.REQUIRED
    }, options);
    super(targetNode, options);

    // @private {null|Vector2} - This point is the center of the transformedPanBounds (see PanZoomListener) in
    // the parent coordinate frame of the targetNode. This is the current center of the transformedPanBounds, and
    // during animation we will move this point closer to the destinationPosition.
    this.sourcePosition = null;

    // @private {null|Vector2} - The destination for translation, we will reposition the targetNode until the
    // sourcePosition matches this point. This is in the parent coordinate frame of the targetNode.
    this.destinationPosition = null;

    // @private {number} - The current scale of the targetNode. During animation we will scale the targetNode until
    // this matches the destinationScale.
    this.sourceScale = this.getCurrentScale();

    // @private {number} - The desired scale for the targetNode, the node is repositioned until sourceScale matches
    // destinationScale.
    this.destinationScale = this.getCurrentScale();

    // @private {null|Vector2} - The point at which a scale gesture was initiated. This is usually the mouse point in
    // the global coordinate frame when a wheel or trackpad zoom gesture is initiated. The targetNode will appear to
    // be zoomed into this point. This is in the global coordinate frame.
    this.scaleGestureTargetPosition = null;

    // @private {Array.<number>} - scale changes in discrete amounts for certain types of input, and in these
    // cases this array defines the discrete scales possible
    this.discreteScales = calculateDiscreteScales(this._minScale, this._maxScale);

    // @private {MiddlePress|null} - If defined, indicates that a middle mouse button is down to pan in the direction
    // of cursor movement.
    this.middlePress = null;

    // @private {Bounds2|null} - these bounds define behavior of panning during interaction with another listener
    // that declares its intent for dragging. If the pointer is out of these bounds and its intent is for dragging,
    // we will try to reposition so that the dragged object remains visible
    this._dragBounds = null;

    // @private {Bounds2} - The panBounds in the local coordinate frame of the targetNode. Generally, these are the
    // bounds of the targetNode that you can see within the panBounds.
    this._transformedPanBounds = this._panBounds.transformed(this._targetNode.matrix.inverted());

    // @private - whether or not the Pointer went down within the drag bounds - if it went down out of drag bounds
    // then user likely trying to pull an object back into view so we prevent panning during drag
    this._draggingInDragBounds = false;

    // @private {TInputListener[]} - A collection of listeners Pointers with attached listeners that are down. Used
    // primarily to determine if the attached listener defines any unique behavior that should happen during a drag,
    // such as panning to keep custom Bounds in view. See TInputListener.createPanTargetBounds.
    this._attachedPointers = [];

    // @private {boolean} - Certain calculations can only be done once available pan bounds are finite.
    this.boundsFinite = false;

    // listeners that will be bound to `this` if we are on a (non-touchscreen) safari platform, referenced for
    // removal on dispose
    let boundGestureStartListener = null;
    let boundGestureChangeListener = null;

    // @private {Action} - Action wrapping work to be done when a gesture starts on a macOS trackpad (specific
    // to that platform!). Wrapped in an action so that state is captured for PhET-iO
    this.gestureStartAction = new PhetioAction(domEvent => {
      assert && assert(domEvent instanceof window.Event);
      assert && assert(domEvent.pageX, 'pageX required on DOMEvent');
      assert && assert(domEvent.pageY, 'pageY required on DOMEvent');
      assert && assert(domEvent.scale, 'scale required on DOMEvent');

      // prevent Safari from doing anything native with this gesture
      domEvent.preventDefault();
      this.trackpadGestureStartScale = domEvent.scale;
      this.scaleGestureTargetPosition = new Vector2(domEvent.pageX, domEvent.pageY);
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('gestureStartAction'),
      parameters: [{
        name: 'event',
        phetioType: EventIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Action that executes whenever a gesture starts on a trackpad in macOS Safari.'
    });

    // @private {Action} - Action wrapping work to be done when gesture changes on a macOS trackpad (specfic to that
    // platform!). Wrapped in an action so state is captured for PhET-iO
    this.gestureChangeAction = new PhetioAction(domEvent => {
      assert && assert(domEvent instanceof window.Event);
      assert && assert(domEvent.scale, 'scale required on DOMEvent');

      // prevent Safari from changing position or scale natively
      domEvent.preventDefault();
      const newScale = this.sourceScale + domEvent.scale - this.trackpadGestureStartScale;
      this.setDestinationScale(newScale);
    }, {
      phetioPlayback: true,
      tandem: options.tandem.createTandem('gestureChangeAction'),
      parameters: [{
        name: 'event',
        phetioType: EventIO
      }],
      phetioEventType: EventType.USER,
      phetioDocumentation: 'Action that executes whenever a gesture changes on a trackpad in macOS Safari.'
    });

    // respond to macOS trackpad input, but don't respond to this input on an iOS touch screen
    if (platform.safari && !platform.mobileSafari) {
      boundGestureStartListener = this.handleGestureStartEvent.bind(this);
      boundGestureChangeListener = this.handleGestureChangeEvent.bind(this);

      // @private {number} - the scale of the targetNode at the start of the gesture, used to calculate
      // how scale to apply from 'gesturechange' event
      this.trackpadGestureStartScale = this.getCurrentScale();

      // WARNING: These events are non-standard, but this is the only way to detect and prevent native trackpad
      // input on macOS Safari. For Apple documentation about these events, see
      // https://developer.apple.com/documentation/webkitjs/gestureevent
      window.addEventListener('gesturestart', boundGestureStartListener);
      window.addEventListener('gesturechange', boundGestureChangeListener);
    }

    // Handle key input from events outside of the PDOM - in this case it is impossible for the PDOMPointer
    // to be attached so we have free reign over the keyboard
    globalKeyStateTracker.keydownEmitter.addListener(this.windowKeydown.bind(this));
    const displayFocusListener = focus => {
      if (focus && this.getCurrentScale() > 1) {
        this.keepTrailInView(focus.trail);
      }
    };
    FocusManager.pdomFocusProperty.link(displayFocusListener);

    // set source and destination positions and scales after setting from state
    // to initialize values for animation with AnimatedPanZoomListener
    this.sourceFramePanBoundsProperty.lazyLink(() => {
      const simGlobal = _.get(window, 'phet.joist.sim', null); // returns null if global isn't found

      if (simGlobal && simGlobal.isSettingPhetioStateProperty.value) {
        this.initializePositions();
        this.sourceScale = this.getCurrentScale();
        this.setDestinationScale(this.sourceScale);
      }
    }, {
      // guarantee that the matrixProperty value is up to date when this listener is called
      phetioDependencies: [this.matrixProperty]
    });

    // @private - called by dispose
    this.disposeAnimatedPanZoomListener = () => {
      boundGestureStartListener && window.removeEventListener('gesturestart', boundGestureStartListener);
      boundGestureChangeListener && window.removeEventListener('gestureChange', boundGestureChangeListener);
      FocusManager.pdomFocusProperty.unlink(displayFocusListener);
    };
  }

  /**
   * Step the listener, supporting any animation as the target node is transformed to target position and scale.
   * @public
   *
   * @param {number} dt
   */
  step(dt) {
    if (this.middlePress) {
      this.handleMiddlePress(dt);
    }

    // if dragging an item with a mouse or touch pointer, make sure that it ramains visible in the zoomed in view,
    // panning to it when it approaches edge of the screen
    if (this._attachedPointers.length > 0) {
      // only need to do this work if we are zoomed in
      if (this.getCurrentScale() > 1) {
        if (this._attachedPointers.length > 0) {
          // Filter out any pointers that no longer have an attached listener due to interruption from things like opening
          // the context menu with a right click.
          this._attachedPointers = this._attachedPointers.filter(pointer => pointer.attachedListener);
          assert && assert(this._attachedPointers.length <= 10, 'Not clearing attachedPointers, there is probably a memory leak');
        }

        // Only reposition if one of the attached pointers is down and dragging within the drag bounds area, or if one
        // of the attached pointers is a PDOMPointer, which indicates that we are dragging with alternative input
        // (in which case draggingInDragBounds does not apply)
        if (this._draggingInDragBounds || this._attachedPointers.some(pointer => pointer instanceof PDOMPointer)) {
          this.repositionDuringDrag();
        }
      }
    }
    this.animateToTargets(dt);
  }

  /**
   * Attach a MiddlePress for drag panning, if detected.
   * @public
   * @override
   *
   * @param {SceneryEvent} event
   */
  down(event) {
    PanZoomListener.prototype.down.call(this, event);

    // If the Pointer signifies the input is intended for dragging save a reference to the trail so we can support
    // keeping the event target in view during the drag operation.
    if (this._dragBounds !== null && event.pointer.hasIntent(Intent.DRAG)) {
      // if this is our only down pointer, see if we should start panning during drag
      if (this._attachedPointers.length === 0) {
        this._draggingInDragBounds = this._dragBounds.containsPoint(event.pointer.point);
      }

      // All conditions are met to start watching for bounds to keep in view during a drag interaction. Eagerly
      // save the attachedListener here so that we don't have to do any work in the move event.
      if (event.pointer.attachedListener) {
        if (!this._attachedPointers.includes(event.pointer)) {
          this._attachedPointers.push(event.pointer);
        }
      }
    }

    // begin middle press panning if we aren't already in that state
    if (event.pointer.type === 'mouse' && event.pointer.middleDown && !this.middlePress) {
      this.middlePress = new MiddlePress(event.pointer, event.trail);
      event.pointer.cursor = MOVE_CURSOR;
    } else {
      this.cancelMiddlePress();
    }
  }

  /**
   * If in a state where we are panning from a middle mouse press, exit that state.
   * @private
   */
  cancelMiddlePress() {
    if (this.middlePress) {
      this.middlePress.pointer.cursor = null;
      this.middlePress = null;
      this.stopInProgressAnimation();
    }
  }

  /**
   * Listener for the attached pointer on move. Only move if a middle press is not currently down.
   * @protected
   * @override
   *
   * @param {SceneryEvent} event
   */
  movePress(event) {
    if (!this.middlePress) {
      PanZoomListener.prototype.movePress.call(this, event);
    }
  }

  /**
   * Part of the Scenery listener API. Supports repositioning while dragging a more descendant level
   * Node under this listener. If the node and pointer are out of the dragBounds, we reposition to keep the Node
   * visible within dragBounds.
   * @public (scenery-internal)
   *
   * @param {SceneryEvent} event
   */
  move(event) {
    // No need to do this work if we are zoomed out.
    if (this._attachedPointers.length > 0 && this.getCurrentScale() > 1) {
      // Only try to get the attached listener if we didn't successfully get it on the down event. This should only
      // happen if the drag did not start withing dragBounds (the listener is likely pulling the Node into view) or
      // if a listener has not been attached yet. Once a listener is attached we can start using it to look for the
      // bounds to keep in view.
      if (this._draggingInDragBounds) {
        if (!this._attachedPointers.includes(event.pointer)) {
          const hasDragIntent = this.hasDragIntent(event.pointer);
          const currentTargetExists = event.currentTarget !== null;
          if (currentTargetExists && hasDragIntent) {
            if (event.pointer.attachedListener) {
              this._attachedPointers.push(event.pointer);
            }
          }
        }
      } else {
        this._draggingInDragBounds = this._dragBounds.containsPoint(event.pointer.point);
      }
    }
  }

  /**
   * Gets the Bounds2 in the global coordinate frame that we are going to try to keep in view during a drag
   * operation.
   * @private
   *
   * @returns {Bounds2|null}
   */
  getGlobalBoundsToViewDuringDrag() {
    let globalBoundsToView = null;
    if (this._attachedPointers.length > 0) {
      // We have an attachedListener from a SceneryEvent Pointer, see if it has information we can use to
      // get the target Bounds for the drag event.

      // Only use the first one so that unique dragging behaviors don't "fight" if multiple pointers are down.
      const activeListener = this._attachedPointers[0].attachedListener;
      if (activeListener.createPanTargetBounds) {
        // client has defined the Bounds they want to keep in view for this Pointer (it is assigned to the
        // Pointer to support multitouch cases)
        globalBoundsToView = activeListener.createPanTargetBounds();
      } else if (activeListener.listener instanceof PressListener || activeListener.listener instanceof KeyboardDragListener) {
        const attachedPressListener = activeListener.listener;

        // The PressListener might not be pressed anymore but the Pointer is still down, in which case it
        // has been interrupted or cancelled.
        // NOTE: It is possible I need to cancelPanDuringDrag() if it is no longer pressed, but I don't
        // want to clear the reference to the attachedListener, and I want to support resuming drag during touch-snag.
        if (attachedPressListener.isPressed) {
          // this will either be the PressListener's targetNode or the default target of the SceneryEvent on press
          const target = attachedPressListener.getCurrentTarget();

          // TODO: For now we cannot support DAG. We may be able to use PressListener.pressedTrail instead of
          // getCurrentTarget, and then we would have a uniquely defined trail. See
          // https://github.com/phetsims/scenery/issues/1361 and
          // https://github.com/phetsims/scenery/issues/1356#issuecomment-1039678678
          if (target.instances.length === 1) {
            globalBoundsToView = target.instances[0].trail.parentToGlobalBounds(target.visibleBounds);
          }
        }
      }
    }
    return globalBoundsToView;
  }

  /**
   * During a drag of another Node that is a descendant of this listener's targetNode, reposition if the
   * node is out of dragBounds so that the Node is always within panBounds.
   * @private
   */
  repositionDuringDrag() {
    const globalBounds = this.getGlobalBoundsToViewDuringDrag();
    globalBounds && this.keepBoundsInView(globalBounds, this._attachedPointers.some(pointer => pointer instanceof PDOMPointer));
  }

  /**
   * Stop panning during drag by clearing variables that are set to indicate and provide information for this work.
   * @param {SceneryEvent} [event] - if not provided all are panning is cancelled and we assume interruption
   * @private
   */
  cancelPanningDuringDrag(event) {
    if (event) {
      // remove the attachedPointer associated with the event
      const index = this._attachedPointers.indexOf(event.pointer);
      if (index > -1) {
        this._attachedPointers.splice(index, 1);
      }
    } else {
      // There is no SceneryEvent, we must be interrupting - clear all attachedPointers
      this._attachedPointers = [];
    }

    // Clear flag indicating we are "dragging in bounds" next move
    this._draggingInDragBounds = false;
  }

  /**
   * Scenery listener API. Cancel any drag and pan behavior for the Pointer on the event.
   * @public (scenery-internal)
   *
   * @param {SceneryEvent} event
   */
  up(event) {
    this.cancelPanningDuringDrag(event);
  }

  /**
   * Input listener for the 'wheel' event, part of the Scenery Input API.
   * @public (scenery-internal)
   *
   * @param {SceneryEvent} event
   */
  wheel(event) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener wheel');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();

    // cannot reposition if a dragging with middle mouse button - but wheel zoom should not cancel a middle press
    // (behavior copied from other browsers)
    if (!this.middlePress) {
      const wheel = new Wheel(event, this._targetScale);
      this.repositionFromWheel(wheel, event);
    }
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Keydown listener for events outside of the PDOM. Attached as a listener to the body and driven by
   * Events rather than SceneryEvents. When we handle Events from within the PDOM we need the Pointer to
   * determine if attached. But from outside of the PDOM we know that there is no focus in the document and therfore
   * the PDOMPointer is not attached.
   * @private
   *
   * @param {Event} domEvent
   */
  windowKeydown(domEvent) {
    // on any keyboard reposition interrupt the middle press panning
    this.cancelMiddlePress();
    const simGlobal = _.get(window, 'phet.joist.sim', null); // returns null if global isn't found

    if (!simGlobal || !simGlobal.display._accessible || !simGlobal.display.pdomRootElement.contains(domEvent.target)) {
      this.handleZoomCommands(domEvent);

      // handle translation without worry of the pointer being attached because there is no pointer at this level
      if (KeyboardUtils.isArrowKey(domEvent)) {
        const keyPress = new KeyPress(globalKeyStateTracker, this.getCurrentScale(), this._targetScale);
        this.repositionFromKeys(keyPress);
      }
    }
  }

  /**
   * For the Scenery listener API, handle a keydown event. This SceneryEvent will have been dispatched from
   * Input.dispatchEvent and so the Event target must be within the PDOM. In this case, we may
   * need to prevent translation if the PDOMPointer is attached.
   * @public (scenery-internal)
   *
   * @param {SceneryEvent} event
   */
  keydown(event) {
    const domEvent = event.domEvent;

    // on any keyboard reposition interrupt the middle press panning
    this.cancelMiddlePress();

    // handle zoom
    this.handleZoomCommands(domEvent);
    const keyboardDragIntent = event.pointer.hasIntent(Intent.KEYBOARD_DRAG);

    // handle translation
    if (KeyboardUtils.isArrowKey(domEvent)) {
      if (!keyboardDragIntent) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener handle arrow key down');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        const keyPress = new KeyPress(globalKeyStateTracker, this.getCurrentScale(), this._targetScale);
        this.repositionFromKeys(keyPress);
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
      }
    }
    if (KeyboardUtils.isMovementKey(domEvent)) {
      if (keyboardDragIntent) {
        // Look for any attached pointers if we are dragging with a keyboard and add them to the list. When dragging
        // stops the Pointer listener is detached and the pointer is removed from the list in `step()`.
        if (event.pointer.isAttached()) {
          if (!this._attachedPointers.includes(event.pointer)) {
            this._attachedPointers.push(event.pointer);
          }
        }
      }
    }
  }

  /**
   * Handle zoom commands from a keyboard.
   * @private
   *
   * @param {Event} domEvent
   */
  handleZoomCommands(domEvent) {
    // handle zoom - Safari doesn't receive the keyup event when the meta key is pressed so we cannot use
    // the keyStateTracker to determine if zoom keys are down
    const zoomInCommandDown = KeyboardZoomUtils.isZoomCommand(domEvent, true);
    const zoomOutCommandDown = KeyboardZoomUtils.isZoomCommand(domEvent, false);
    if (zoomInCommandDown || zoomOutCommandDown) {
      sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiPanZoomListener keyboard zoom in');
      sceneryLog && sceneryLog.InputListener && sceneryLog.push();

      // don't allow native browser zoom
      domEvent.preventDefault();
      const nextScale = this.getNextDiscreteScale(zoomInCommandDown);
      const keyPress = new KeyPress(globalKeyStateTracker, nextScale, this._targetScale);
      this.repositionFromKeys(keyPress);
    } else if (KeyboardZoomUtils.isZoomResetCommand(domEvent)) {
      sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener keyboard reset');
      sceneryLog && sceneryLog.InputListener && sceneryLog.push();

      // this is a native command, but we are taking over
      domEvent.preventDefault();
      this.resetTransform();
      sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
  }

  /**
   * This is just for macOS Safari. Responds to trackpad input. Prevents default browser behavior and sets values
   * required for for repositioning as user operates the track pad.
   * @private
   *
   * @param {Event} domEvent
   */
  handleGestureStartEvent(domEvent) {
    this.gestureStartAction.execute(domEvent);
  }

  /**
   * This is just for macOS Safari. Responds to trackpad input. Prevends default browser behavior and
   * sets destination scale as user pinches on the trackpad.
   * @private
   *
   * @param {Event} domEvent
   */
  handleGestureChangeEvent(domEvent) {
    this.gestureChangeAction.execute(domEvent);
  }

  /**
   * Handle the down MiddlePress during animation. If we have a middle press we need to update position target.
   * @private
   *
   * @param {number} dt
   */
  handleMiddlePress(dt) {
    assert && assert(this.middlePress, 'MiddlePress must be defined to handle');
    if (dt > 0) {
      const currentPoint = this.middlePress.pointer.point;
      const globalDelta = currentPoint.minus(this.middlePress.initialPoint);

      // magnitude alone is too fast, reduce by a bit
      const reducedMagnitude = globalDelta.magnitude / 100;
      if (reducedMagnitude > 0) {
        // set the delta vector in global coordinates, limited by a maximum view coords/second velocity, corrected
        // for any representative target scale
        globalDelta.setMagnitude(Math.min(reducedMagnitude / dt, MAX_SCROLL_VELOCITY * this._targetScale));
        this.setDestinationPosition(this.sourcePosition.plus(globalDelta));
      }
    }
  }

  /**
   * Translate and scale to a target point. The result of this function should make it appear that we are scaling
   * in or out of a particular point on the target node. This actually modifies the matrix of the target node. To
   * accomplish zooming into a particular point, we compute a matrix that would transform the target node from
   * the target point, then apply scale, then translate the target back to the target point.
   * @public
   *
   * @param {Vector2} globalPoint - point to zoom in on, in the global coordinate frame
   * @param {number} scaleDelta
   */
  translateScaleToTarget(globalPoint, scaleDelta) {
    const pointInLocalFrame = this._targetNode.globalToLocalPoint(globalPoint);
    const pointInParentFrame = this._targetNode.globalToParentPoint(globalPoint);
    const fromLocalPoint = Matrix3.translation(-pointInLocalFrame.x, -pointInLocalFrame.y);
    const toTargetPoint = Matrix3.translation(pointInParentFrame.x, pointInParentFrame.y);
    const nextScale = this.limitScale(this.getCurrentScale() + scaleDelta);

    // we first translate from target point, then apply scale, then translate back to target point ()
    // so that it appears as though we are zooming into that point
    const scaleMatrix = toTargetPoint.timesMatrix(Matrix3.scaling(nextScale)).timesMatrix(fromLocalPoint);
    this.matrixProperty.set(scaleMatrix);

    // make sure that we are still within PanZoomListener constraints
    this.correctReposition();
  }

  /**
   * Sets the translation and scale to a target point. Like translateScaleToTarget, but instead of taking a scaleDelta
   * it takes the final scale to be used for the target Nodes matrix.
   * @private
   *
   * @param {Vector2} globalPoint - point to translate to in the global coordinate frame
   * @param {number} scale - final scale for the transformation matrix
   */
  setTranslationScaleToTarget(globalPoint, scale) {
    const pointInLocalFrame = this._targetNode.globalToLocalPoint(globalPoint);
    const pointInParentFrame = this._targetNode.globalToParentPoint(globalPoint);
    const fromLocalPoint = Matrix3.translation(-pointInLocalFrame.x, -pointInLocalFrame.y);
    const toTargetPoint = Matrix3.translation(pointInParentFrame.x, pointInParentFrame.y);
    const nextScale = this.limitScale(scale);

    // we first translate from target point, then apply scale, then translate back to target point ()
    // so that it appears as though we are zooming into that point
    const scaleMatrix = toTargetPoint.timesMatrix(Matrix3.scaling(nextScale)).timesMatrix(fromLocalPoint);
    this.matrixProperty.set(scaleMatrix);

    // make sure that we are still within PanZoomListener constraints
    this.correctReposition();
  }

  /**
   * Translate the target node in a direction specified by deltaVector.
   * @public
   *
   * @param {Vector2} deltaVector
   */
  translateDelta(deltaVector) {
    const targetPoint = this._targetNode.globalToParentPoint(this._panBounds.center);
    const sourcePoint = targetPoint.plus(deltaVector);
    this.translateToTarget(sourcePoint, targetPoint);
  }

  /**
   * Translate the targetNode from a local point to a target point. Both points should be in the global coordinate
   * frame.
   * @public
   *
   * @param {Vector} initialPoint - in global coordinate frame, source position
   * @param {Vector2} targetPoint - in global coordinate frame, target position
   */
  translateToTarget(initialPoint, targetPoint) {
    const singleInitialPoint = this._targetNode.globalToParentPoint(initialPoint);
    const singleTargetPoint = this._targetNode.globalToParentPoint(targetPoint);
    const delta = singleTargetPoint.minus(singleInitialPoint);
    this.matrixProperty.set(Matrix3.translationFromVector(delta).timesMatrix(this._targetNode.getMatrix()));
    this.correctReposition();
  }

  /**
   * Repositions the target node in response to keyboard input.
   * @private
   *
   * @param   {KeyPress} keyPress
   */
  repositionFromKeys(keyPress) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener reposition from key press');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    const newScale = keyPress.scale;
    const currentScale = this.getCurrentScale();
    if (newScale !== currentScale) {
      // key press changed scale
      this.setDestinationScale(newScale);
      this.scaleGestureTargetPosition = keyPress.computeScaleTargetFromKeyPress();
    } else if (!keyPress.translationVector.equals(Vector2.ZERO)) {
      // key press initiated some translation
      this.setDestinationPosition(this.sourcePosition.plus(keyPress.translationVector));
    }
    this.correctReposition();
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Repositions the target node in response to wheel input. Wheel input can come from a mouse, trackpad, or
   * other. Aspects of the event are slightly different for each input source and this function tries to normalize
   * these differences.
   * @private
   *
   * @param   {Wheel} wheel
   * @param   {SceneryEvent} event
   */
  repositionFromWheel(wheel, event) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener reposition from wheel');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();

    // prevent any native browser zoom and don't allow browser go go 'back' or 'forward' a page
    event.domEvent.preventDefault();
    if (wheel.isCtrlKeyDown) {
      const nextScale = this.limitScale(this.getCurrentScale() + wheel.scaleDelta);
      this.scaleGestureTargetPosition = wheel.targetPoint;
      this.setDestinationScale(nextScale);
    } else {
      // wheel does not indicate zoom, must be translation
      this.setDestinationPosition(this.sourcePosition.plus(wheel.translationVector));
    }
    this.correctReposition();
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Upon any kind of reposition, update the source position and scale for the next update in animateToTargets.
   *
   * Note: This assumes that any kind of repositioning of the target node will eventually call correctReposition.
   * @protected
   */
  correctReposition() {
    super.correctReposition();
    if (this._panBounds.isFinite()) {
      // the pan bounds in the local coordinate frame of the target Node (generally, bounds of the targetNode
      // that are visible in the global panBounds)
      this._transformedPanBounds = this._panBounds.transformed(this._targetNode.matrix.inverted());
      this.sourcePosition = this._transformedPanBounds.center;
      this.sourceScale = this.getCurrentScale();
    }
  }

  /**
   * When a new press begins, stop any in progress animation.
   * @override
   * @protected
   *
   * @param {MultiListener.Press} press
   */
  addPress(press) {
    super.addPress(press);
    this.stopInProgressAnimation();
  }

  /**
   * When presses are removed, reset animation destinations.
   * @override
   * @protected
   *
   * @param {MultiListener.Press} press
   * @returns {}
   */
  removePress(press) {
    super.removePress(press);

    // restore the cursor if we have a middle press as we are in a state where moving the mouse will pan
    if (this.middlePress) {
      press.pointer.cursor = MOVE_CURSOR;
    }
    if (this._presses.length === 0) {
      this.stopInProgressAnimation();
    }
  }

  /**
   * Interrupt the listener. Cancels any active input and clears references upon interaction end.
   * @public
   */
  interrupt() {
    this.cancelPanningDuringDrag();
    this.cancelMiddlePress();
    super.interrupt();
  }

  /**
   * "Cancel" the listener, when input stops abnormally. Part of the scenery Input API.
   * @public
   */
  cancel() {
    this.interrupt();
  }

  /**
   * Returns true if the Intent of the Pointer indicates that it will be used for dragging of some kind.
   * @private
   *
   * @param {Pointer} pointer
   * @returns {boolean}
   */
  hasDragIntent(pointer) {
    return pointer.hasIntent(Intent.KEYBOARD_DRAG) || pointer.hasIntent(Intent.DRAG);
  }

  /**
   * Pan to a provided Node, attempting to place the node in the center of the transformedPanBounds. It may not end
   * up exactly in the center since we have to make sure panBounds are completely filled with targetNode content.
   * @public
   *
   * @param {Node} node
   */
  panToNode(node) {
    assert && assert(this._panBounds.isFinite(), 'panBounds should be defined when panning.');
    this.keepBoundsInView(node.globalBounds, true);
  }

  /**
   * Set the destination position to pan such that the provided globalBounds are totally visible within the panBounds.
   * This will never pan outside panBounds, if the provided globalBounds extend beyond them.
   *
   * If we are not using panToCenter and the globalBounds is larger than the screen size this function does nothing.
   * It doesn't make sense to try to keep the provided bounds entirely in view if they are larger than the availalable
   * view space.
   * @private
   *
   * @param {Bounds2} globalBounds - in global coordinate frame
   * @param {boolean} panToCenter - if true, we will pan to the center of the provided bounds, otherwise we will pan
   *                                until all edges are on screen
   */
  keepBoundsInView(globalBounds, panToCenter = false) {
    assert && assert(this._panBounds.isFinite(), 'panBounds should be defined when panning.');
    const boundsInTargetFrame = this._targetNode.globalToLocalBounds(globalBounds);
    const translationDelta = new Vector2(0, 0);
    let distanceToLeftEdge = 0;
    let distanceToRightEdge = 0;
    let distanceToTopEdge = 0;
    let distanceToBottomEdge = 0;
    if (panToCenter) {
      // If panning to center, the amount to pan is the distance between the center of the screen to the center of the
      // provided bounds. In this case
      distanceToLeftEdge = this._transformedPanBounds.centerX - boundsInTargetFrame.centerX;
      distanceToRightEdge = this._transformedPanBounds.centerX - boundsInTargetFrame.centerX;
      distanceToTopEdge = this._transformedPanBounds.centerY - boundsInTargetFrame.centerY;
      distanceToBottomEdge = this._transformedPanBounds.centerY - boundsInTargetFrame.centerY;
    } else if (boundsInTargetFrame.width < this._transformedPanBounds.width && boundsInTargetFrame.height < this._transformedPanBounds.height) {
      // If the provided bounds are wider than the available pan bounds we shouldn't try to shift it, it will awkwardly
      // try to slide the screen to one of the sides of the bounds. This operation only makes sense if the screen can
      // totally contain the object being dragged.

      distanceToLeftEdge = this._transformedPanBounds.left - boundsInTargetFrame.left;
      distanceToRightEdge = this._transformedPanBounds.right - boundsInTargetFrame.right;
      distanceToTopEdge = this._transformedPanBounds.top - boundsInTargetFrame.top;
      distanceToBottomEdge = this._transformedPanBounds.bottom - boundsInTargetFrame.bottom;
    }
    if (distanceToBottomEdge < 0) {
      translationDelta.y = -distanceToBottomEdge;
    }
    if (distanceToTopEdge > 0) {
      translationDelta.y = -distanceToTopEdge;
    }
    if (distanceToRightEdge < 0) {
      translationDelta.x = -distanceToRightEdge;
    }
    if (distanceToLeftEdge > 0) {
      translationDelta.x = -distanceToLeftEdge;
    }
    this.setDestinationPosition(this.sourcePosition.plus(translationDelta));
  }

  /**
   * Keep a trail in view by panning to it if it has bounds that are outside of the global panBounds.
   * @private
   * @param {Trail} trail
   */
  keepTrailInView(trail) {
    if (this._panBounds.isFinite() && trail.lastNode().bounds.isFinite()) {
      const globalBounds = trail.localToGlobalBounds(trail.lastNode().localBounds);
      if (!this._panBounds.containsBounds(globalBounds)) {
        this.keepBoundsInView(globalBounds, true);
      }
    }
  }

  /**
   * @private
   * @param {number} dt - in seconds
   */
  animateToTargets(dt) {
    assert && assert(this.boundsFinite, 'initializePositions must be called at least once before animating');
    assert && assert(this.sourcePosition.isFinite(), 'How can the source position not be a finite Vector2?');
    assert && assert(this.destinationPosition.isFinite(), 'How can the destination position not be a finite Vector2?');

    // only animate to targets if within this precision so that we don't animate forever, since animation speed
    // is dependent on the difference betwen source and destination positions
    const positionDirty = !this.destinationPosition.equalsEpsilon(this.sourcePosition, 0.1);
    const scaleDirty = !Utils.equalsEpsilon(this.sourceScale, this.destinationScale, 0.001);

    // Only a MiddlePress can support animation while down
    if (this._presses.length === 0 || this.middlePress !== null) {
      if (positionDirty) {
        // animate to the position, effectively panning over time without any scaling
        const translationDifference = this.destinationPosition.minus(this.sourcePosition);
        let translationDirection = translationDifference;
        if (translationDifference.magnitude !== 0) {
          translationDirection = translationDifference.normalized();
        }
        const translationSpeed = this.getTranslationSpeed(translationDifference.magnitude);
        scratchVelocityVector.setXY(translationSpeed, translationSpeed);

        // finally determine the final panning translation and apply
        const componentMagnitude = scratchVelocityVector.multiplyScalar(dt);
        const translationDelta = translationDirection.componentTimes(componentMagnitude);

        // in case of large dt, don't overshoot the destination
        if (translationDelta.magnitude > translationDifference.magnitude) {
          translationDelta.set(translationDifference);
        }
        assert && assert(translationDelta.isFinite(), 'Trying to translate with a non-finite Vector2');
        this.translateDelta(translationDelta);
      }
      if (scaleDirty) {
        assert && assert(this.scaleGestureTargetPosition, 'there must be a scale target point');
        const scaleDifference = this.destinationScale - this.sourceScale;
        let scaleDelta = scaleDifference * dt * 6;

        // in case of large dt make sure that we don't overshoot our destination
        if (Math.abs(scaleDelta) > Math.abs(scaleDifference)) {
          scaleDelta = scaleDifference;
        }
        this.translateScaleToTarget(this.scaleGestureTargetPosition, scaleDelta);

        // after applying the scale, the source position has changed, update destination to match
        this.setDestinationPosition(this.sourcePosition);
      } else if (this.destinationScale !== this.sourceScale) {
        // not far enough to animate but close enough that we can set destination equal to source to avoid further
        // animation steps
        this.setTranslationScaleToTarget(this.scaleGestureTargetPosition, this.destinationScale);
        this.setDestinationPosition(this.sourcePosition);
      }
    }
  }

  /**
   * Stop any in-progress transformations of the target node by setting destinations to sources immediately.
   *
   * @private
   */
  stopInProgressAnimation() {
    if (this.boundsFinite) {
      this.setDestinationScale(this.sourceScale);
      this.setDestinationPosition(this.sourcePosition);
    }
  }

  /**
   * Sets the source and destination positions. Necessary because target or pan bounds may not be defined
   * upon construction. This can set those up when they are defined.
   *
   * @private
   */
  initializePositions() {
    this.boundsFinite = this._transformedPanBounds.isFinite();
    if (this.boundsFinite) {
      this.sourcePosition = this._transformedPanBounds.center;
      this.setDestinationPosition(this.sourcePosition);
    } else {
      this.sourcePosition = null;
      this.destinationPosition = null;
    }
  }

  /**
   * @public
   * @override
   *
   * @param {Bounds2} bounds
   */
  setPanBounds(bounds) {
    super.setPanBounds(bounds);
    this.initializePositions();

    // drag bounds eroded a bit so that repositioning during drag occurs as the pointer gets close to the edge.
    this._dragBounds = bounds.erodedXY(bounds.width * 0.1, bounds.height * 0.1);
    assert && assert(this._dragBounds.hasNonzeroArea(), 'drag bounds must have some width and height');
  }

  /**
   * Upon setting target bounds, re-set source and destination positions.
   * @public
   * @override
   *
   * @param {Bounds2} targetBounds
   */
  setTargetBounds(targetBounds) {
    super.setTargetBounds(targetBounds);
    this.initializePositions();
  }

  /**
   * Set the destination position. In animation, we will try move the targetNode until sourcePosition matches
   * this point. Destination is in the local coordinate frame of the target node.
   * @private
   *
   * @param {Vector2} destination
   */
  setDestinationPosition(destination) {
    assert && assert(this.boundsFinite, 'bounds must be finite before setting destination positions');
    assert && assert(destination.isFinite(), 'provided destination position is not defined');

    // limit destination position to be within the available bounds pan bounds
    scratchBounds.setMinMax(this.sourcePosition.x - this._transformedPanBounds.left - this._panBounds.left, this.sourcePosition.y - this._transformedPanBounds.top - this._panBounds.top, this.sourcePosition.x + this._panBounds.right - this._transformedPanBounds.right, this.sourcePosition.y + this._panBounds.bottom - this._transformedPanBounds.bottom);
    this.destinationPosition = scratchBounds.closestPointTo(destination);
  }

  /**
   * Set the destination scale for the target node. In animation, target node will be repositioned until source
   * scale matches destination scale.
   * @private
   *
   * @param {number} scale
   */
  setDestinationScale(scale) {
    this.destinationScale = this.limitScale(scale);
  }

  /**
   * Calculate the translation speed to animate from our sourcePosition to our targetPosition. Speed goes to zero
   * as the translationDistance gets smaller for smooth animation as we reach our destination position. This returns
   * a speed in the coordinate frame of the parent of this listener's target Node.
   * @private
   *
   * @param {number} translationDistance
   * @returns {number}
   */
  getTranslationSpeed(translationDistance) {
    assert && assert(translationDistance >= 0, 'distance for getTranslationSpeed should be a non-negative number');

    // The larger the scale, that faster we want to translate because the distances between source and destination
    // are smaller when zoomed in. Otherwise, speeds will be slower while zoomed in.
    const scaleDistance = translationDistance * this.getCurrentScale();

    // A maximum translation factor applied to distance to determine a reasonable speed, determined by
    // inspection but could be modified. This impacts how long the "tail" of translation is as we animate.
    // While we animate to the destination position we move quickly far away from the destination and slow down
    // as we get closer to the target. Reduce this value to exaggerate that effect and move more slowly as we
    // get closer to the destination position.
    const maxScaleFactor = 5;

    // speed falls away exponentially as we get closer to our destination so that we appear to "slide" to our
    // destination which looks nice, but also prevents us from animating for too long
    const translationSpeed = scaleDistance * (1 / (Math.pow(scaleDistance, 2) - Math.pow(maxScaleFactor, 2)) + maxScaleFactor);

    // translationSpeed could be negative or go to infinity due to the behavior of the exponential calculation above.
    // Make sure that the speed is constrained and greater than zero.
    const limitedTranslationSpeed = Math.min(Math.abs(translationSpeed), MAX_TRANSLATION_SPEED * this.getCurrentScale());
    return limitedTranslationSpeed;
  }

  /**
   * Reset all transformations on the target node, and reset destination targets to source values to prevent any
   * in progress animation.
   * @public
   * @override
   */
  resetTransform() {
    super.resetTransform();
    this.stopInProgressAnimation();
  }

  /**
   * Get the next discrete scale from the current scale. Will be one of the scales along the discreteScales list
   * and limited by the min and max scales assigned to this MultiPanZoomListener.
   * @private
   *
   * @param {boolean} zoomIn - direction of zoom change, positive if zooming in
   * @returns {number} number
   */
  getNextDiscreteScale(zoomIn) {
    const currentScale = this.getCurrentScale();
    let nearestIndex;
    let distanceToCurrentScale = Number.POSITIVE_INFINITY;
    for (let i = 0; i < this.discreteScales.length; i++) {
      const distance = Math.abs(this.discreteScales[i] - currentScale);
      if (distance < distanceToCurrentScale) {
        distanceToCurrentScale = distance;
        nearestIndex = i;
      }
    }
    let nextIndex = zoomIn ? nearestIndex + 1 : nearestIndex - 1;
    nextIndex = Utils.clamp(nextIndex, 0, this.discreteScales.length - 1);
    return this.discreteScales[nextIndex];
  }

  /**
   * @public
   */
  dispose() {
    this.disposeAnimatedPanZoomListener();
  }
}

/**
 * A type that contains the information needed to respond to keyboard input.
 */
class KeyPress {
  /**
   * @param {KeyStateTracker} keyStateTracker
   * @param {KeyStateTracker} scale
   * @param {number} targetScale - scale describing the targetNode, see PanZoomListener._targetScale
   * @param {Object} [options]
   * @returns {KeyStateTracker}
   */
  constructor(keyStateTracker, scale, targetScale, options) {
    options = merge({
      // magnitude for translation vector for the target node as long as arrow keys are held down
      translationMagnitude: 80
    }, options);

    // determine resulting translation
    let xDirection = 0;
    xDirection += keyStateTracker.isKeyDown(KeyboardUtils.KEY_RIGHT_ARROW);
    xDirection -= keyStateTracker.isKeyDown(KeyboardUtils.KEY_LEFT_ARROW);
    let yDirection = 0;
    yDirection += keyStateTracker.isKeyDown(KeyboardUtils.KEY_DOWN_ARROW);
    yDirection -= keyStateTracker.isKeyDown(KeyboardUtils.KEY_UP_ARROW);

    // don't set magnitude if zero vector (as vector will become ill-defined)
    scratchTranslationVector.setXY(xDirection, yDirection);
    if (!scratchTranslationVector.equals(Vector2.ZERO)) {
      const translationMagnitude = options.translationMagnitude * targetScale;
      scratchTranslationVector.setMagnitude(translationMagnitude);
    }

    // @public (read-only) - The translation delta vector that should be applied to the target node in response
    // to the key presses
    this.translationVector = scratchTranslationVector;

    // @public (read-only) {number} - determine resulting scale and scale point
    this.scale = scale;
  }

  /**
   * Compute the target position for scaling from a key press. The target node will appear to get larger and zoom
   * into this point. If focus is within the Display, we zoom into the focused node. If not and focusable content
   * exists in the display, we zoom into the first focusable component. Otherwise, we zoom into the top left corner
   * of the screen.
   *
   * This function could be expensive, so we only call it if we know that the key press is a "scale" gesture.
   *
   * @public
   * @returns {Vector2} - a scratch Vector2 instance with the target postion
   */
  computeScaleTargetFromKeyPress() {
    // default cause, scale target will be origin of the screen
    scratchScaleTargetVector.setXY(0, 0);

    // zoom into the focused Node if it has defined bounds, it may not if it is for controlling the
    // virtual cursor and has an invisible focus highlight
    const focus = FocusManager.pdomFocusProperty.value;
    if (focus) {
      const focusTrail = FocusManager.pdomFocusProperty.value.trail;
      const focusedNode = focusTrail.lastNode();
      if (focusedNode.bounds.isFinite()) {
        scratchScaleTargetVector.set(focusTrail.parentToGlobalPoint(focusedNode.center));
      }
    } else {
      // no focusable element in the Display so try to zoom into the first focusable element
      const firstFocusable = PDOMUtils.getNextFocusable();
      if (firstFocusable !== document.body) {
        // if not the body, focused node should be contained by the body - error loudly if the browser reports
        // that this is not the case
        assert && assert(document.body.contains(firstFocusable), 'focusable should be attached to the body');

        // assumes that focusable DOM elements are correctly positioned, which should be the case - an alternative
        // could be to use Displat.getTrailFromPDOMIndicesString(), but that function requires information that is not
        // available here.
        const centerX = firstFocusable.offsetLeft + firstFocusable.offsetWidth / 2;
        const centerY = firstFocusable.offsetTop + firstFocusable.offsetHeight / 2;
        scratchScaleTargetVector.setXY(centerX, centerY);
      }
    }
    assert && assert(scratchScaleTargetVector.isFinite(), 'target position not defined');
    return scratchScaleTargetVector;
  }
}

/**
 * A type that contains the information needed to respond to a wheel input.
 */
class Wheel {
  /**
   * @param {SceneryEvent} event
   * @param {number} targetScale - scale describing the targetNode, see PanZoomListener._targetScale
   */
  constructor(event, targetScale) {
    const domEvent = event.domEvent;

    // @public (read-only) - is the ctrl key down during this wheel input? Cannot use KeyStateTracker because the
    // ctrl key might be 'down' on this event without going through the keyboard. For example, with a trackpad
    // the browser sets ctrlKey true with the zoom gesture.
    this.isCtrlKeyDown = event.domEvent.ctrlKey;

    // @public (read-only) - magnitude and direction of scale change from the wheel input
    this.scaleDelta = domEvent.deltaY > 0 ? -0.5 : 0.5;

    // @public (read-only) - the target of the wheel input in the global coordinate frame
    this.targetPoint = event.pointer.point;

    // the DOM Event specifies deltas that look appropriate and works well in different cases like
    // mouse wheel and trackpad input, both which trigger wheel events but at different rates with different
    // delta values - but they are generally too large, reducing a bit feels more natural and gives more control
    let translationX = domEvent.deltaX * 0.5;
    let translationY = domEvent.deltaY * 0.5;

    // FireFox defaults to scrolling in units of "lines" rather than pixels, resulting in slow movement - speed up
    // translation in this case
    if (domEvent.deltaMode === window.WheelEvent.DOM_DELTA_LINE) {
      translationX = translationX * 25;
      translationY = translationY * 25;
    }

    // @public (read-only)
    this.translationVector = scratchTranslationVector.setXY(translationX * targetScale, translationY * targetScale);
  }
}

/**
 * A press from a middle mouse button. Will initiate panning and destination position will be updated for as long
 * as the Pointer point is dragged away from the initial point.
 */
class MiddlePress {
  /**
   * @param {Mouse} pointer
   * @param {Trail} trail
   */
  constructor(pointer, trail) {
    assert && assert(pointer.type === 'mouse', 'incorrect pointer type');

    // @private
    this.pointer = pointer;
    this.trail = trail;

    // point of press in the global coordinate frame
    this.initialPoint = pointer.point.copy();
  }
}

/**
 * Helper function, calculates discrete scales between min and max scale limits. Creates increasing step sizes
 * so that you zoom in from high zoom reaches the max faster with fewer key presses. This is standard behavior for
 * browser zoom.
 *
 * @param {number} minScale
 * @param {number} maxScale
 * @returns {Array.<number>}
 */
const calculateDiscreteScales = (minScale, maxScale) => {
  assert && assert(minScale >= 1, 'min scales less than one are currently not supported');

  // will take this many key presses to reach maximum scale from minimum scale
  const steps = 8;

  // break the range from min to max scale into steps, then exponentiate
  const discreteScales = [];
  for (let i = 0; i < steps; i++) {
    discreteScales[i] = (maxScale - minScale) / steps * (i * i);
  }

  // normalize steps back into range of the min and max scale for this listener
  const discreteScalesMax = discreteScales[steps - 1];
  for (let i = 0; i < discreteScales.length; i++) {
    discreteScales[i] = minScale + discreteScales[i] * (maxScale - minScale) / discreteScalesMax;
  }
  return discreteScales;
};
scenery.register('AnimatedPanZoomListener', AnimatedPanZoomListener);
export default AnimatedPanZoomListener;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiTWF0cml4MyIsIlV0aWxzIiwiVmVjdG9yMiIsIm1lcmdlIiwicGxhdGZvcm0iLCJFdmVudFR5cGUiLCJQaGV0aW9BY3Rpb24iLCJUYW5kZW0iLCJFdmVudElPIiwiRm9jdXNNYW5hZ2VyIiwiZ2xvYmFsS2V5U3RhdGVUcmFja2VyIiwiSW50ZW50IiwiS2V5Ym9hcmREcmFnTGlzdGVuZXIiLCJLZXlib2FyZFV0aWxzIiwiS2V5Ym9hcmRab29tVXRpbHMiLCJOb2RlIiwiUGFuWm9vbUxpc3RlbmVyIiwiUERPTVBvaW50ZXIiLCJQRE9NVXRpbHMiLCJQcmVzc0xpc3RlbmVyIiwic2NlbmVyeSIsIk1PVkVfQ1VSU09SIiwiTUFYX1NDUk9MTF9WRUxPQ0lUWSIsIk1BWF9UUkFOU0xBVElPTl9TUEVFRCIsInNjcmF0Y2hUcmFuc2xhdGlvblZlY3RvciIsInNjcmF0Y2hTY2FsZVRhcmdldFZlY3RvciIsInNjcmF0Y2hWZWxvY2l0eVZlY3RvciIsInNjcmF0Y2hCb3VuZHMiLCJBbmltYXRlZFBhblpvb21MaXN0ZW5lciIsImNvbnN0cnVjdG9yIiwidGFyZ2V0Tm9kZSIsIm9wdGlvbnMiLCJhc3NlcnQiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInNvdXJjZVBvc2l0aW9uIiwiZGVzdGluYXRpb25Qb3NpdGlvbiIsInNvdXJjZVNjYWxlIiwiZ2V0Q3VycmVudFNjYWxlIiwiZGVzdGluYXRpb25TY2FsZSIsInNjYWxlR2VzdHVyZVRhcmdldFBvc2l0aW9uIiwiZGlzY3JldGVTY2FsZXMiLCJjYWxjdWxhdGVEaXNjcmV0ZVNjYWxlcyIsIl9taW5TY2FsZSIsIl9tYXhTY2FsZSIsIm1pZGRsZVByZXNzIiwiX2RyYWdCb3VuZHMiLCJfdHJhbnNmb3JtZWRQYW5Cb3VuZHMiLCJfcGFuQm91bmRzIiwidHJhbnNmb3JtZWQiLCJfdGFyZ2V0Tm9kZSIsIm1hdHJpeCIsImludmVydGVkIiwiX2RyYWdnaW5nSW5EcmFnQm91bmRzIiwiX2F0dGFjaGVkUG9pbnRlcnMiLCJib3VuZHNGaW5pdGUiLCJib3VuZEdlc3R1cmVTdGFydExpc3RlbmVyIiwiYm91bmRHZXN0dXJlQ2hhbmdlTGlzdGVuZXIiLCJnZXN0dXJlU3RhcnRBY3Rpb24iLCJkb21FdmVudCIsIndpbmRvdyIsIkV2ZW50IiwicGFnZVgiLCJwYWdlWSIsInNjYWxlIiwicHJldmVudERlZmF1bHQiLCJ0cmFja3BhZEdlc3R1cmVTdGFydFNjYWxlIiwicGhldGlvUGxheWJhY2siLCJjcmVhdGVUYW5kZW0iLCJwYXJhbWV0ZXJzIiwibmFtZSIsInBoZXRpb1R5cGUiLCJwaGV0aW9FdmVudFR5cGUiLCJVU0VSIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsImdlc3R1cmVDaGFuZ2VBY3Rpb24iLCJuZXdTY2FsZSIsInNldERlc3RpbmF0aW9uU2NhbGUiLCJzYWZhcmkiLCJtb2JpbGVTYWZhcmkiLCJoYW5kbGVHZXN0dXJlU3RhcnRFdmVudCIsImJpbmQiLCJoYW5kbGVHZXN0dXJlQ2hhbmdlRXZlbnQiLCJhZGRFdmVudExpc3RlbmVyIiwia2V5ZG93bkVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsIndpbmRvd0tleWRvd24iLCJkaXNwbGF5Rm9jdXNMaXN0ZW5lciIsImZvY3VzIiwia2VlcFRyYWlsSW5WaWV3IiwidHJhaWwiLCJwZG9tRm9jdXNQcm9wZXJ0eSIsImxpbmsiLCJzb3VyY2VGcmFtZVBhbkJvdW5kc1Byb3BlcnR5IiwibGF6eUxpbmsiLCJzaW1HbG9iYWwiLCJfIiwiZ2V0IiwiaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSIsInZhbHVlIiwiaW5pdGlhbGl6ZVBvc2l0aW9ucyIsInBoZXRpb0RlcGVuZGVuY2llcyIsIm1hdHJpeFByb3BlcnR5IiwiZGlzcG9zZUFuaW1hdGVkUGFuWm9vbUxpc3RlbmVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInVubGluayIsInN0ZXAiLCJkdCIsImhhbmRsZU1pZGRsZVByZXNzIiwibGVuZ3RoIiwiZmlsdGVyIiwicG9pbnRlciIsImF0dGFjaGVkTGlzdGVuZXIiLCJzb21lIiwicmVwb3NpdGlvbkR1cmluZ0RyYWciLCJhbmltYXRlVG9UYXJnZXRzIiwiZG93biIsImV2ZW50IiwicHJvdG90eXBlIiwiY2FsbCIsImhhc0ludGVudCIsIkRSQUciLCJjb250YWluc1BvaW50IiwicG9pbnQiLCJpbmNsdWRlcyIsInB1c2giLCJ0eXBlIiwibWlkZGxlRG93biIsIk1pZGRsZVByZXNzIiwiY3Vyc29yIiwiY2FuY2VsTWlkZGxlUHJlc3MiLCJzdG9wSW5Qcm9ncmVzc0FuaW1hdGlvbiIsIm1vdmVQcmVzcyIsIm1vdmUiLCJoYXNEcmFnSW50ZW50IiwiY3VycmVudFRhcmdldEV4aXN0cyIsImN1cnJlbnRUYXJnZXQiLCJnZXRHbG9iYWxCb3VuZHNUb1ZpZXdEdXJpbmdEcmFnIiwiZ2xvYmFsQm91bmRzVG9WaWV3IiwiYWN0aXZlTGlzdGVuZXIiLCJjcmVhdGVQYW5UYXJnZXRCb3VuZHMiLCJsaXN0ZW5lciIsImF0dGFjaGVkUHJlc3NMaXN0ZW5lciIsImlzUHJlc3NlZCIsInRhcmdldCIsImdldEN1cnJlbnRUYXJnZXQiLCJpbnN0YW5jZXMiLCJwYXJlbnRUb0dsb2JhbEJvdW5kcyIsInZpc2libGVCb3VuZHMiLCJnbG9iYWxCb3VuZHMiLCJrZWVwQm91bmRzSW5WaWV3IiwiY2FuY2VsUGFubmluZ0R1cmluZ0RyYWciLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJ1cCIsIndoZWVsIiwic2NlbmVyeUxvZyIsIklucHV0TGlzdGVuZXIiLCJXaGVlbCIsIl90YXJnZXRTY2FsZSIsInJlcG9zaXRpb25Gcm9tV2hlZWwiLCJwb3AiLCJkaXNwbGF5IiwiX2FjY2Vzc2libGUiLCJwZG9tUm9vdEVsZW1lbnQiLCJjb250YWlucyIsImhhbmRsZVpvb21Db21tYW5kcyIsImlzQXJyb3dLZXkiLCJrZXlQcmVzcyIsIktleVByZXNzIiwicmVwb3NpdGlvbkZyb21LZXlzIiwia2V5ZG93biIsImtleWJvYXJkRHJhZ0ludGVudCIsIktFWUJPQVJEX0RSQUciLCJpc01vdmVtZW50S2V5IiwiaXNBdHRhY2hlZCIsInpvb21JbkNvbW1hbmREb3duIiwiaXNab29tQ29tbWFuZCIsInpvb21PdXRDb21tYW5kRG93biIsIm5leHRTY2FsZSIsImdldE5leHREaXNjcmV0ZVNjYWxlIiwiaXNab29tUmVzZXRDb21tYW5kIiwicmVzZXRUcmFuc2Zvcm0iLCJleGVjdXRlIiwiY3VycmVudFBvaW50IiwiZ2xvYmFsRGVsdGEiLCJtaW51cyIsImluaXRpYWxQb2ludCIsInJlZHVjZWRNYWduaXR1ZGUiLCJtYWduaXR1ZGUiLCJzZXRNYWduaXR1ZGUiLCJNYXRoIiwibWluIiwic2V0RGVzdGluYXRpb25Qb3NpdGlvbiIsInBsdXMiLCJ0cmFuc2xhdGVTY2FsZVRvVGFyZ2V0IiwiZ2xvYmFsUG9pbnQiLCJzY2FsZURlbHRhIiwicG9pbnRJbkxvY2FsRnJhbWUiLCJnbG9iYWxUb0xvY2FsUG9pbnQiLCJwb2ludEluUGFyZW50RnJhbWUiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwiZnJvbUxvY2FsUG9pbnQiLCJ0cmFuc2xhdGlvbiIsIngiLCJ5IiwidG9UYXJnZXRQb2ludCIsImxpbWl0U2NhbGUiLCJzY2FsZU1hdHJpeCIsInRpbWVzTWF0cml4Iiwic2NhbGluZyIsInNldCIsImNvcnJlY3RSZXBvc2l0aW9uIiwic2V0VHJhbnNsYXRpb25TY2FsZVRvVGFyZ2V0IiwidHJhbnNsYXRlRGVsdGEiLCJkZWx0YVZlY3RvciIsInRhcmdldFBvaW50IiwiY2VudGVyIiwic291cmNlUG9pbnQiLCJ0cmFuc2xhdGVUb1RhcmdldCIsInNpbmdsZUluaXRpYWxQb2ludCIsInNpbmdsZVRhcmdldFBvaW50IiwiZGVsdGEiLCJ0cmFuc2xhdGlvbkZyb21WZWN0b3IiLCJnZXRNYXRyaXgiLCJjdXJyZW50U2NhbGUiLCJjb21wdXRlU2NhbGVUYXJnZXRGcm9tS2V5UHJlc3MiLCJ0cmFuc2xhdGlvblZlY3RvciIsImVxdWFscyIsIlpFUk8iLCJpc0N0cmxLZXlEb3duIiwiaXNGaW5pdGUiLCJhZGRQcmVzcyIsInByZXNzIiwicmVtb3ZlUHJlc3MiLCJfcHJlc3NlcyIsImludGVycnVwdCIsImNhbmNlbCIsInBhblRvTm9kZSIsIm5vZGUiLCJwYW5Ub0NlbnRlciIsImJvdW5kc0luVGFyZ2V0RnJhbWUiLCJnbG9iYWxUb0xvY2FsQm91bmRzIiwidHJhbnNsYXRpb25EZWx0YSIsImRpc3RhbmNlVG9MZWZ0RWRnZSIsImRpc3RhbmNlVG9SaWdodEVkZ2UiLCJkaXN0YW5jZVRvVG9wRWRnZSIsImRpc3RhbmNlVG9Cb3R0b21FZGdlIiwiY2VudGVyWCIsImNlbnRlclkiLCJ3aWR0aCIsImhlaWdodCIsImxlZnQiLCJyaWdodCIsInRvcCIsImJvdHRvbSIsImxhc3ROb2RlIiwiYm91bmRzIiwibG9jYWxUb0dsb2JhbEJvdW5kcyIsImxvY2FsQm91bmRzIiwiY29udGFpbnNCb3VuZHMiLCJwb3NpdGlvbkRpcnR5IiwiZXF1YWxzRXBzaWxvbiIsInNjYWxlRGlydHkiLCJ0cmFuc2xhdGlvbkRpZmZlcmVuY2UiLCJ0cmFuc2xhdGlvbkRpcmVjdGlvbiIsIm5vcm1hbGl6ZWQiLCJ0cmFuc2xhdGlvblNwZWVkIiwiZ2V0VHJhbnNsYXRpb25TcGVlZCIsInNldFhZIiwiY29tcG9uZW50TWFnbml0dWRlIiwibXVsdGlwbHlTY2FsYXIiLCJjb21wb25lbnRUaW1lcyIsInNjYWxlRGlmZmVyZW5jZSIsImFicyIsInNldFBhbkJvdW5kcyIsImVyb2RlZFhZIiwiaGFzTm9uemVyb0FyZWEiLCJzZXRUYXJnZXRCb3VuZHMiLCJ0YXJnZXRCb3VuZHMiLCJkZXN0aW5hdGlvbiIsInNldE1pbk1heCIsImNsb3Nlc3RQb2ludFRvIiwidHJhbnNsYXRpb25EaXN0YW5jZSIsInNjYWxlRGlzdGFuY2UiLCJtYXhTY2FsZUZhY3RvciIsInBvdyIsImxpbWl0ZWRUcmFuc2xhdGlvblNwZWVkIiwiem9vbUluIiwibmVhcmVzdEluZGV4IiwiZGlzdGFuY2VUb0N1cnJlbnRTY2FsZSIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwiaSIsImRpc3RhbmNlIiwibmV4dEluZGV4IiwiY2xhbXAiLCJkaXNwb3NlIiwia2V5U3RhdGVUcmFja2VyIiwidGFyZ2V0U2NhbGUiLCJ0cmFuc2xhdGlvbk1hZ25pdHVkZSIsInhEaXJlY3Rpb24iLCJpc0tleURvd24iLCJLRVlfUklHSFRfQVJST1ciLCJLRVlfTEVGVF9BUlJPVyIsInlEaXJlY3Rpb24iLCJLRVlfRE9XTl9BUlJPVyIsIktFWV9VUF9BUlJPVyIsImZvY3VzVHJhaWwiLCJmb2N1c2VkTm9kZSIsInBhcmVudFRvR2xvYmFsUG9pbnQiLCJmaXJzdEZvY3VzYWJsZSIsImdldE5leHRGb2N1c2FibGUiLCJkb2N1bWVudCIsImJvZHkiLCJvZmZzZXRMZWZ0Iiwib2Zmc2V0V2lkdGgiLCJvZmZzZXRUb3AiLCJvZmZzZXRIZWlnaHQiLCJjdHJsS2V5IiwiZGVsdGFZIiwidHJhbnNsYXRpb25YIiwiZGVsdGFYIiwidHJhbnNsYXRpb25ZIiwiZGVsdGFNb2RlIiwiV2hlZWxFdmVudCIsIkRPTV9ERUxUQV9MSU5FIiwiY29weSIsIm1pblNjYWxlIiwibWF4U2NhbGUiLCJzdGVwcyIsImRpc2NyZXRlU2NhbGVzTWF4IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBbmltYXRlZFBhblpvb21MaXN0ZW5lci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIFBhblpvb21MaXN0ZW5lciB0aGF0IHN1cHBvcnRzIGFkZGl0aW9uYWwgZm9ybXMgb2YgaW5wdXQgZm9yIHBhbiBhbmQgem9vbSwgaW5jbHVkaW5nIHRyYWNrcGFkIGdlc3R1cmVzLCBtb3VzZVxyXG4gKiB3aGVlbCwgYW5kIGtleWJvYXJkIGlucHV0LiBUaGVzZSBnZXN0dXJlcyB3aWxsIGFuaW1hdGUgdGhlIHRhcmdldCBub2RlIHRvIGl0cyBkZXN0aW5hdGlvbiB0cmFuc2xhdGlvbiBhbmQgc2NhbGUgc28gaXRcclxuICogdXNlcyBhIHN0ZXAgZnVuY3Rpb24gdGhhdCBtdXN0IGJlIGNhbGxlZCBldmVyeSBhbmltYXRpb24gZnJhbWUuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgcGxhdGZvcm0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3BsYXRmb3JtLmpzJztcclxuaW1wb3J0IEV2ZW50VHlwZSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvRXZlbnRUeXBlLmpzJztcclxuaW1wb3J0IFBoZXRpb0FjdGlvbiBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvUGhldGlvQWN0aW9uLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IHsgRXZlbnRJTywgRm9jdXNNYW5hZ2VyLCBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIsIEludGVudCwgS2V5Ym9hcmREcmFnTGlzdGVuZXIsIEtleWJvYXJkVXRpbHMsIEtleWJvYXJkWm9vbVV0aWxzLCBOb2RlLCBQYW5ab29tTGlzdGVuZXIsIFBET01Qb2ludGVyLCBQRE9NVXRpbHMsIFByZXNzTGlzdGVuZXIsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBNT1ZFX0NVUlNPUiA9ICdhbGwtc2Nyb2xsJztcclxuY29uc3QgTUFYX1NDUk9MTF9WRUxPQ0lUWSA9IDE1MDsgLy8gbWF4IGdsb2JhbCB2aWV3IGNvb3JkcyBwZXIgc2Vjb25kIHdoaWxlIHNjcm9sbGluZyB3aXRoIG1pZGRsZSBtb3VzZSBidXR0b24gZHJhZ1xyXG5cclxuLy8gVGhlIG1heCBzcGVlZCBvZiB0cmFuc2xhdGlvbiB3aGVuIGFuaW1hdGluZyBmcm9tIHNvdXJjZSBwb3NpdGlvbiB0byBkZXN0aW5hdGlvbiBwb3NpdGlvbiBpbiB0aGUgY29vcmRpbmF0ZSBmcmFtZVxyXG4vLyBvZiB0aGUgcGFyZW50IG9mIHRoZSB0YXJnZXROb2RlIG9mIHRoaXMgbGlzdGVuZXIuIEluY3JlYXNlIHRoZSB2YWx1ZSBvZiB0aGlzIHRvIGFuaW1hdGUgZmFzdGVyIHRvIHRoZSBkZXN0aW5hdGlvblxyXG4vLyBwb3NpdGlvbiB3aGVuIHBhbm5pbmcgdG8gdGFyZ2V0cy5cclxuY29uc3QgTUFYX1RSQU5TTEFUSU9OX1NQRUVEID0gMTAwMDtcclxuXHJcbi8vIHNjcmF0Y2ggdmFyaWFibGVzIHRvIHJlZHVjZSBnYXJiYWdlXHJcbmNvbnN0IHNjcmF0Y2hUcmFuc2xhdGlvblZlY3RvciA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbmNvbnN0IHNjcmF0Y2hTY2FsZVRhcmdldFZlY3RvciA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbmNvbnN0IHNjcmF0Y2hWZWxvY2l0eVZlY3RvciA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbmNvbnN0IHNjcmF0Y2hCb3VuZHMgPSBuZXcgQm91bmRzMiggMCwgMCwgMCwgMCApO1xyXG5cclxuY2xhc3MgQW5pbWF0ZWRQYW5ab29tTGlzdGVuZXIgZXh0ZW5kcyBQYW5ab29tTGlzdGVuZXIge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge05vZGV9IHRhcmdldE5vZGUgLSBOb2RlIHRvIGJlIHRyYW5zZm9ybWVkIGJ5IHRoaXMgbGlzdGVuZXJcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRhcmdldE5vZGUsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gV2hpbGUgdGhpcyBpcyBzdGlsbCBKYXZhU2NyaXB0LCB0aGlzIHJlbGF0aXZlbHkgdXNlbGVzcyBhc3NlcnRpb24gbGV0cyB1cyBpbXBvcnQgTm9kZSBmb3Igb3RoZXIgVHlwZVNjcmlwdFxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGFyZ2V0Tm9kZSBpbnN0YW5jZW9mIE5vZGUgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggdGFyZ2V0Tm9kZSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudWxsfFZlY3RvcjJ9IC0gVGhpcyBwb2ludCBpcyB0aGUgY2VudGVyIG9mIHRoZSB0cmFuc2Zvcm1lZFBhbkJvdW5kcyAoc2VlIFBhblpvb21MaXN0ZW5lcikgaW5cclxuICAgIC8vIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGUgdGFyZ2V0Tm9kZS4gVGhpcyBpcyB0aGUgY3VycmVudCBjZW50ZXIgb2YgdGhlIHRyYW5zZm9ybWVkUGFuQm91bmRzLCBhbmRcclxuICAgIC8vIGR1cmluZyBhbmltYXRpb24gd2Ugd2lsbCBtb3ZlIHRoaXMgcG9pbnQgY2xvc2VyIHRvIHRoZSBkZXN0aW5hdGlvblBvc2l0aW9uLlxyXG4gICAgdGhpcy5zb3VyY2VQb3NpdGlvbiA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bGx8VmVjdG9yMn0gLSBUaGUgZGVzdGluYXRpb24gZm9yIHRyYW5zbGF0aW9uLCB3ZSB3aWxsIHJlcG9zaXRpb24gdGhlIHRhcmdldE5vZGUgdW50aWwgdGhlXHJcbiAgICAvLyBzb3VyY2VQb3NpdGlvbiBtYXRjaGVzIHRoaXMgcG9pbnQuIFRoaXMgaXMgaW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lIG9mIHRoZSB0YXJnZXROb2RlLlxyXG4gICAgdGhpcy5kZXN0aW5hdGlvblBvc2l0aW9uID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIFRoZSBjdXJyZW50IHNjYWxlIG9mIHRoZSB0YXJnZXROb2RlLiBEdXJpbmcgYW5pbWF0aW9uIHdlIHdpbGwgc2NhbGUgdGhlIHRhcmdldE5vZGUgdW50aWxcclxuICAgIC8vIHRoaXMgbWF0Y2hlcyB0aGUgZGVzdGluYXRpb25TY2FsZS5cclxuICAgIHRoaXMuc291cmNlU2NhbGUgPSB0aGlzLmdldEN1cnJlbnRTY2FsZSgpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gVGhlIGRlc2lyZWQgc2NhbGUgZm9yIHRoZSB0YXJnZXROb2RlLCB0aGUgbm9kZSBpcyByZXBvc2l0aW9uZWQgdW50aWwgc291cmNlU2NhbGUgbWF0Y2hlc1xyXG4gICAgLy8gZGVzdGluYXRpb25TY2FsZS5cclxuICAgIHRoaXMuZGVzdGluYXRpb25TY2FsZSA9IHRoaXMuZ2V0Q3VycmVudFNjYWxlKCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bGx8VmVjdG9yMn0gLSBUaGUgcG9pbnQgYXQgd2hpY2ggYSBzY2FsZSBnZXN0dXJlIHdhcyBpbml0aWF0ZWQuIFRoaXMgaXMgdXN1YWxseSB0aGUgbW91c2UgcG9pbnQgaW5cclxuICAgIC8vIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZSB3aGVuIGEgd2hlZWwgb3IgdHJhY2twYWQgem9vbSBnZXN0dXJlIGlzIGluaXRpYXRlZC4gVGhlIHRhcmdldE5vZGUgd2lsbCBhcHBlYXIgdG9cclxuICAgIC8vIGJlIHpvb21lZCBpbnRvIHRoaXMgcG9pbnQuIFRoaXMgaXMgaW4gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lLlxyXG4gICAgdGhpcy5zY2FsZUdlc3R1cmVUYXJnZXRQb3NpdGlvbiA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0FycmF5LjxudW1iZXI+fSAtIHNjYWxlIGNoYW5nZXMgaW4gZGlzY3JldGUgYW1vdW50cyBmb3IgY2VydGFpbiB0eXBlcyBvZiBpbnB1dCwgYW5kIGluIHRoZXNlXHJcbiAgICAvLyBjYXNlcyB0aGlzIGFycmF5IGRlZmluZXMgdGhlIGRpc2NyZXRlIHNjYWxlcyBwb3NzaWJsZVxyXG4gICAgdGhpcy5kaXNjcmV0ZVNjYWxlcyA9IGNhbGN1bGF0ZURpc2NyZXRlU2NhbGVzKCB0aGlzLl9taW5TY2FsZSwgdGhpcy5fbWF4U2NhbGUgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7TWlkZGxlUHJlc3N8bnVsbH0gLSBJZiBkZWZpbmVkLCBpbmRpY2F0ZXMgdGhhdCBhIG1pZGRsZSBtb3VzZSBidXR0b24gaXMgZG93biB0byBwYW4gaW4gdGhlIGRpcmVjdGlvblxyXG4gICAgLy8gb2YgY3Vyc29yIG1vdmVtZW50LlxyXG4gICAgdGhpcy5taWRkbGVQcmVzcyA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0JvdW5kczJ8bnVsbH0gLSB0aGVzZSBib3VuZHMgZGVmaW5lIGJlaGF2aW9yIG9mIHBhbm5pbmcgZHVyaW5nIGludGVyYWN0aW9uIHdpdGggYW5vdGhlciBsaXN0ZW5lclxyXG4gICAgLy8gdGhhdCBkZWNsYXJlcyBpdHMgaW50ZW50IGZvciBkcmFnZ2luZy4gSWYgdGhlIHBvaW50ZXIgaXMgb3V0IG9mIHRoZXNlIGJvdW5kcyBhbmQgaXRzIGludGVudCBpcyBmb3IgZHJhZ2dpbmcsXHJcbiAgICAvLyB3ZSB3aWxsIHRyeSB0byByZXBvc2l0aW9uIHNvIHRoYXQgdGhlIGRyYWdnZWQgb2JqZWN0IHJlbWFpbnMgdmlzaWJsZVxyXG4gICAgdGhpcy5fZHJhZ0JvdW5kcyA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0JvdW5kczJ9IC0gVGhlIHBhbkJvdW5kcyBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGUgdGFyZ2V0Tm9kZS4gR2VuZXJhbGx5LCB0aGVzZSBhcmUgdGhlXHJcbiAgICAvLyBib3VuZHMgb2YgdGhlIHRhcmdldE5vZGUgdGhhdCB5b3UgY2FuIHNlZSB3aXRoaW4gdGhlIHBhbkJvdW5kcy5cclxuICAgIHRoaXMuX3RyYW5zZm9ybWVkUGFuQm91bmRzID0gdGhpcy5fcGFuQm91bmRzLnRyYW5zZm9ybWVkKCB0aGlzLl90YXJnZXROb2RlLm1hdHJpeC5pbnZlcnRlZCgpICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSB3aGV0aGVyIG9yIG5vdCB0aGUgUG9pbnRlciB3ZW50IGRvd24gd2l0aGluIHRoZSBkcmFnIGJvdW5kcyAtIGlmIGl0IHdlbnQgZG93biBvdXQgb2YgZHJhZyBib3VuZHNcclxuICAgIC8vIHRoZW4gdXNlciBsaWtlbHkgdHJ5aW5nIHRvIHB1bGwgYW4gb2JqZWN0IGJhY2sgaW50byB2aWV3IHNvIHdlIHByZXZlbnQgcGFubmluZyBkdXJpbmcgZHJhZ1xyXG4gICAgdGhpcy5fZHJhZ2dpbmdJbkRyYWdCb3VuZHMgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7VElucHV0TGlzdGVuZXJbXX0gLSBBIGNvbGxlY3Rpb24gb2YgbGlzdGVuZXJzIFBvaW50ZXJzIHdpdGggYXR0YWNoZWQgbGlzdGVuZXJzIHRoYXQgYXJlIGRvd24uIFVzZWRcclxuICAgIC8vIHByaW1hcmlseSB0byBkZXRlcm1pbmUgaWYgdGhlIGF0dGFjaGVkIGxpc3RlbmVyIGRlZmluZXMgYW55IHVuaXF1ZSBiZWhhdmlvciB0aGF0IHNob3VsZCBoYXBwZW4gZHVyaW5nIGEgZHJhZyxcclxuICAgIC8vIHN1Y2ggYXMgcGFubmluZyB0byBrZWVwIGN1c3RvbSBCb3VuZHMgaW4gdmlldy4gU2VlIFRJbnB1dExpc3RlbmVyLmNyZWF0ZVBhblRhcmdldEJvdW5kcy5cclxuICAgIHRoaXMuX2F0dGFjaGVkUG9pbnRlcnMgPSBbXTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBDZXJ0YWluIGNhbGN1bGF0aW9ucyBjYW4gb25seSBiZSBkb25lIG9uY2UgYXZhaWxhYmxlIHBhbiBib3VuZHMgYXJlIGZpbml0ZS5cclxuICAgIHRoaXMuYm91bmRzRmluaXRlID0gZmFsc2U7XHJcblxyXG4gICAgLy8gbGlzdGVuZXJzIHRoYXQgd2lsbCBiZSBib3VuZCB0byBgdGhpc2AgaWYgd2UgYXJlIG9uIGEgKG5vbi10b3VjaHNjcmVlbikgc2FmYXJpIHBsYXRmb3JtLCByZWZlcmVuY2VkIGZvclxyXG4gICAgLy8gcmVtb3ZhbCBvbiBkaXNwb3NlXHJcbiAgICBsZXQgYm91bmRHZXN0dXJlU3RhcnRMaXN0ZW5lciA9IG51bGw7XHJcbiAgICBsZXQgYm91bmRHZXN0dXJlQ2hhbmdlTGlzdGVuZXIgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBY3Rpb259IC0gQWN0aW9uIHdyYXBwaW5nIHdvcmsgdG8gYmUgZG9uZSB3aGVuIGEgZ2VzdHVyZSBzdGFydHMgb24gYSBtYWNPUyB0cmFja3BhZCAoc3BlY2lmaWNcclxuICAgIC8vIHRvIHRoYXQgcGxhdGZvcm0hKS4gV3JhcHBlZCBpbiBhbiBhY3Rpb24gc28gdGhhdCBzdGF0ZSBpcyBjYXB0dXJlZCBmb3IgUGhFVC1pT1xyXG4gICAgdGhpcy5nZXN0dXJlU3RhcnRBY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCBkb21FdmVudCA9PiB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGRvbUV2ZW50IGluc3RhbmNlb2Ygd2luZG93LkV2ZW50ICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGRvbUV2ZW50LnBhZ2VYLCAncGFnZVggcmVxdWlyZWQgb24gRE9NRXZlbnQnICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGRvbUV2ZW50LnBhZ2VZLCAncGFnZVkgcmVxdWlyZWQgb24gRE9NRXZlbnQnICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGRvbUV2ZW50LnNjYWxlLCAnc2NhbGUgcmVxdWlyZWQgb24gRE9NRXZlbnQnICk7XHJcblxyXG4gICAgICAvLyBwcmV2ZW50IFNhZmFyaSBmcm9tIGRvaW5nIGFueXRoaW5nIG5hdGl2ZSB3aXRoIHRoaXMgZ2VzdHVyZVxyXG4gICAgICBkb21FdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgdGhpcy50cmFja3BhZEdlc3R1cmVTdGFydFNjYWxlID0gZG9tRXZlbnQuc2NhbGU7XHJcbiAgICAgIHRoaXMuc2NhbGVHZXN0dXJlVGFyZ2V0UG9zaXRpb24gPSBuZXcgVmVjdG9yMiggZG9tRXZlbnQucGFnZVgsIGRvbUV2ZW50LnBhZ2VZICk7XHJcbiAgICB9LCB7XHJcbiAgICAgIHBoZXRpb1BsYXliYWNrOiB0cnVlLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2dlc3R1cmVTdGFydEFjdGlvbicgKSxcclxuICAgICAgcGFyYW1ldGVyczogWyB7IG5hbWU6ICdldmVudCcsIHBoZXRpb1R5cGU6IEV2ZW50SU8gfSBdLFxyXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnQWN0aW9uIHRoYXQgZXhlY3V0ZXMgd2hlbmV2ZXIgYSBnZXN0dXJlIHN0YXJ0cyBvbiBhIHRyYWNrcGFkIGluIG1hY09TIFNhZmFyaS4nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0FjdGlvbn0gLSBBY3Rpb24gd3JhcHBpbmcgd29yayB0byBiZSBkb25lIHdoZW4gZ2VzdHVyZSBjaGFuZ2VzIG9uIGEgbWFjT1MgdHJhY2twYWQgKHNwZWNmaWMgdG8gdGhhdFxyXG4gICAgLy8gcGxhdGZvcm0hKS4gV3JhcHBlZCBpbiBhbiBhY3Rpb24gc28gc3RhdGUgaXMgY2FwdHVyZWQgZm9yIFBoRVQtaU9cclxuICAgIHRoaXMuZ2VzdHVyZUNoYW5nZUFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oIGRvbUV2ZW50ID0+IHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZG9tRXZlbnQgaW5zdGFuY2VvZiB3aW5kb3cuRXZlbnQgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZG9tRXZlbnQuc2NhbGUsICdzY2FsZSByZXF1aXJlZCBvbiBET01FdmVudCcgKTtcclxuXHJcbiAgICAgIC8vIHByZXZlbnQgU2FmYXJpIGZyb20gY2hhbmdpbmcgcG9zaXRpb24gb3Igc2NhbGUgbmF0aXZlbHlcclxuICAgICAgZG9tRXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgIGNvbnN0IG5ld1NjYWxlID0gdGhpcy5zb3VyY2VTY2FsZSArIGRvbUV2ZW50LnNjYWxlIC0gdGhpcy50cmFja3BhZEdlc3R1cmVTdGFydFNjYWxlO1xyXG4gICAgICB0aGlzLnNldERlc3RpbmF0aW9uU2NhbGUoIG5ld1NjYWxlICk7XHJcbiAgICB9LCB7XHJcbiAgICAgIHBoZXRpb1BsYXliYWNrOiB0cnVlLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2dlc3R1cmVDaGFuZ2VBY3Rpb24nICksXHJcbiAgICAgIHBhcmFtZXRlcnM6IFsgeyBuYW1lOiAnZXZlbnQnLCBwaGV0aW9UeXBlOiBFdmVudElPIH0gXSxcclxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0FjdGlvbiB0aGF0IGV4ZWN1dGVzIHdoZW5ldmVyIGEgZ2VzdHVyZSBjaGFuZ2VzIG9uIGEgdHJhY2twYWQgaW4gbWFjT1MgU2FmYXJpLidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyByZXNwb25kIHRvIG1hY09TIHRyYWNrcGFkIGlucHV0LCBidXQgZG9uJ3QgcmVzcG9uZCB0byB0aGlzIGlucHV0IG9uIGFuIGlPUyB0b3VjaCBzY3JlZW5cclxuICAgIGlmICggcGxhdGZvcm0uc2FmYXJpICYmICFwbGF0Zm9ybS5tb2JpbGVTYWZhcmkgKSB7XHJcbiAgICAgIGJvdW5kR2VzdHVyZVN0YXJ0TGlzdGVuZXIgPSB0aGlzLmhhbmRsZUdlc3R1cmVTdGFydEV2ZW50LmJpbmQoIHRoaXMgKTtcclxuICAgICAgYm91bmRHZXN0dXJlQ2hhbmdlTGlzdGVuZXIgPSB0aGlzLmhhbmRsZUdlc3R1cmVDaGFuZ2VFdmVudC5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIHRoZSBzY2FsZSBvZiB0aGUgdGFyZ2V0Tm9kZSBhdCB0aGUgc3RhcnQgb2YgdGhlIGdlc3R1cmUsIHVzZWQgdG8gY2FsY3VsYXRlXHJcbiAgICAgIC8vIGhvdyBzY2FsZSB0byBhcHBseSBmcm9tICdnZXN0dXJlY2hhbmdlJyBldmVudFxyXG4gICAgICB0aGlzLnRyYWNrcGFkR2VzdHVyZVN0YXJ0U2NhbGUgPSB0aGlzLmdldEN1cnJlbnRTY2FsZSgpO1xyXG5cclxuICAgICAgLy8gV0FSTklORzogVGhlc2UgZXZlbnRzIGFyZSBub24tc3RhbmRhcmQsIGJ1dCB0aGlzIGlzIHRoZSBvbmx5IHdheSB0byBkZXRlY3QgYW5kIHByZXZlbnQgbmF0aXZlIHRyYWNrcGFkXHJcbiAgICAgIC8vIGlucHV0IG9uIG1hY09TIFNhZmFyaS4gRm9yIEFwcGxlIGRvY3VtZW50YXRpb24gYWJvdXQgdGhlc2UgZXZlbnRzLCBzZWVcclxuICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIuYXBwbGUuY29tL2RvY3VtZW50YXRpb24vd2Via2l0anMvZ2VzdHVyZWV2ZW50XHJcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnZ2VzdHVyZXN0YXJ0JywgYm91bmRHZXN0dXJlU3RhcnRMaXN0ZW5lciApO1xyXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2dlc3R1cmVjaGFuZ2UnLCBib3VuZEdlc3R1cmVDaGFuZ2VMaXN0ZW5lciApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEhhbmRsZSBrZXkgaW5wdXQgZnJvbSBldmVudHMgb3V0c2lkZSBvZiB0aGUgUERPTSAtIGluIHRoaXMgY2FzZSBpdCBpcyBpbXBvc3NpYmxlIGZvciB0aGUgUERPTVBvaW50ZXJcclxuICAgIC8vIHRvIGJlIGF0dGFjaGVkIHNvIHdlIGhhdmUgZnJlZSByZWlnbiBvdmVyIHRoZSBrZXlib2FyZFxyXG4gICAgZ2xvYmFsS2V5U3RhdGVUcmFja2VyLmtleWRvd25FbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLndpbmRvd0tleWRvd24uYmluZCggdGhpcyApICk7XHJcblxyXG4gICAgY29uc3QgZGlzcGxheUZvY3VzTGlzdGVuZXIgPSBmb2N1cyA9PiB7XHJcbiAgICAgIGlmICggZm9jdXMgJiYgdGhpcy5nZXRDdXJyZW50U2NhbGUoKSA+IDEgKSB7XHJcbiAgICAgICAgdGhpcy5rZWVwVHJhaWxJblZpZXcoIGZvY3VzLnRyYWlsICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBGb2N1c01hbmFnZXIucGRvbUZvY3VzUHJvcGVydHkubGluayggZGlzcGxheUZvY3VzTGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBzZXQgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBwb3NpdGlvbnMgYW5kIHNjYWxlcyBhZnRlciBzZXR0aW5nIGZyb20gc3RhdGVcclxuICAgIC8vIHRvIGluaXRpYWxpemUgdmFsdWVzIGZvciBhbmltYXRpb24gd2l0aCBBbmltYXRlZFBhblpvb21MaXN0ZW5lclxyXG4gICAgdGhpcy5zb3VyY2VGcmFtZVBhbkJvdW5kc1Byb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHNpbUdsb2JhbCA9IF8uZ2V0KCB3aW5kb3csICdwaGV0LmpvaXN0LnNpbScsIG51bGwgKTsgLy8gcmV0dXJucyBudWxsIGlmIGdsb2JhbCBpc24ndCBmb3VuZFxyXG5cclxuICAgICAgaWYgKCAoIHNpbUdsb2JhbCAmJiBzaW1HbG9iYWwuaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eS52YWx1ZSApICkge1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZVBvc2l0aW9ucygpO1xyXG4gICAgICAgIHRoaXMuc291cmNlU2NhbGUgPSB0aGlzLmdldEN1cnJlbnRTY2FsZSgpO1xyXG4gICAgICAgIHRoaXMuc2V0RGVzdGluYXRpb25TY2FsZSggdGhpcy5zb3VyY2VTY2FsZSApO1xyXG4gICAgICB9XHJcbiAgICB9LCB7XHJcblxyXG4gICAgICAvLyBndWFyYW50ZWUgdGhhdCB0aGUgbWF0cml4UHJvcGVydHkgdmFsdWUgaXMgdXAgdG8gZGF0ZSB3aGVuIHRoaXMgbGlzdGVuZXIgaXMgY2FsbGVkXHJcbiAgICAgIHBoZXRpb0RlcGVuZGVuY2llczogWyB0aGlzLm1hdHJpeFByb3BlcnR5IF1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIGNhbGxlZCBieSBkaXNwb3NlXHJcbiAgICB0aGlzLmRpc3Bvc2VBbmltYXRlZFBhblpvb21MaXN0ZW5lciA9ICgpID0+IHtcclxuICAgICAgYm91bmRHZXN0dXJlU3RhcnRMaXN0ZW5lciAmJiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2dlc3R1cmVzdGFydCcsIGJvdW5kR2VzdHVyZVN0YXJ0TGlzdGVuZXIgKTtcclxuICAgICAgYm91bmRHZXN0dXJlQ2hhbmdlTGlzdGVuZXIgJiYgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdnZXN0dXJlQ2hhbmdlJywgYm91bmRHZXN0dXJlQ2hhbmdlTGlzdGVuZXIgKTtcclxuXHJcbiAgICAgIEZvY3VzTWFuYWdlci5wZG9tRm9jdXNQcm9wZXJ0eS51bmxpbmsoIGRpc3BsYXlGb2N1c0xpc3RlbmVyICk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcCB0aGUgbGlzdGVuZXIsIHN1cHBvcnRpbmcgYW55IGFuaW1hdGlvbiBhcyB0aGUgdGFyZ2V0IG5vZGUgaXMgdHJhbnNmb3JtZWQgdG8gdGFyZ2V0IHBvc2l0aW9uIGFuZCBzY2FsZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIGlmICggdGhpcy5taWRkbGVQcmVzcyApIHtcclxuICAgICAgdGhpcy5oYW5kbGVNaWRkbGVQcmVzcyggZHQgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBkcmFnZ2luZyBhbiBpdGVtIHdpdGggYSBtb3VzZSBvciB0b3VjaCBwb2ludGVyLCBtYWtlIHN1cmUgdGhhdCBpdCByYW1haW5zIHZpc2libGUgaW4gdGhlIHpvb21lZCBpbiB2aWV3LFxyXG4gICAgLy8gcGFubmluZyB0byBpdCB3aGVuIGl0IGFwcHJvYWNoZXMgZWRnZSBvZiB0aGUgc2NyZWVuXHJcbiAgICBpZiAoIHRoaXMuX2F0dGFjaGVkUG9pbnRlcnMubGVuZ3RoID4gMCApIHtcclxuXHJcbiAgICAgIC8vIG9ubHkgbmVlZCB0byBkbyB0aGlzIHdvcmsgaWYgd2UgYXJlIHpvb21lZCBpblxyXG4gICAgICBpZiAoIHRoaXMuZ2V0Q3VycmVudFNjYWxlKCkgPiAxICkge1xyXG4gICAgICAgIGlmICggdGhpcy5fYXR0YWNoZWRQb2ludGVycy5sZW5ndGggPiAwICkge1xyXG5cclxuICAgICAgICAgIC8vIEZpbHRlciBvdXQgYW55IHBvaW50ZXJzIHRoYXQgbm8gbG9uZ2VyIGhhdmUgYW4gYXR0YWNoZWQgbGlzdGVuZXIgZHVlIHRvIGludGVycnVwdGlvbiBmcm9tIHRoaW5ncyBsaWtlIG9wZW5pbmdcclxuICAgICAgICAgIC8vIHRoZSBjb250ZXh0IG1lbnUgd2l0aCBhIHJpZ2h0IGNsaWNrLlxyXG4gICAgICAgICAgdGhpcy5fYXR0YWNoZWRQb2ludGVycyA9IHRoaXMuX2F0dGFjaGVkUG9pbnRlcnMuZmlsdGVyKCBwb2ludGVyID0+IHBvaW50ZXIuYXR0YWNoZWRMaXN0ZW5lciApO1xyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fYXR0YWNoZWRQb2ludGVycy5sZW5ndGggPD0gMTAsICdOb3QgY2xlYXJpbmcgYXR0YWNoZWRQb2ludGVycywgdGhlcmUgaXMgcHJvYmFibHkgYSBtZW1vcnkgbGVhaycgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE9ubHkgcmVwb3NpdGlvbiBpZiBvbmUgb2YgdGhlIGF0dGFjaGVkIHBvaW50ZXJzIGlzIGRvd24gYW5kIGRyYWdnaW5nIHdpdGhpbiB0aGUgZHJhZyBib3VuZHMgYXJlYSwgb3IgaWYgb25lXHJcbiAgICAgICAgLy8gb2YgdGhlIGF0dGFjaGVkIHBvaW50ZXJzIGlzIGEgUERPTVBvaW50ZXIsIHdoaWNoIGluZGljYXRlcyB0aGF0IHdlIGFyZSBkcmFnZ2luZyB3aXRoIGFsdGVybmF0aXZlIGlucHV0XHJcbiAgICAgICAgLy8gKGluIHdoaWNoIGNhc2UgZHJhZ2dpbmdJbkRyYWdCb3VuZHMgZG9lcyBub3QgYXBwbHkpXHJcbiAgICAgICAgaWYgKCB0aGlzLl9kcmFnZ2luZ0luRHJhZ0JvdW5kcyB8fCB0aGlzLl9hdHRhY2hlZFBvaW50ZXJzLnNvbWUoIHBvaW50ZXIgPT4gcG9pbnRlciBpbnN0YW5jZW9mIFBET01Qb2ludGVyICkgKSB7XHJcbiAgICAgICAgICB0aGlzLnJlcG9zaXRpb25EdXJpbmdEcmFnKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5hbmltYXRlVG9UYXJnZXRzKCBkdCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXR0YWNoIGEgTWlkZGxlUHJlc3MgZm9yIGRyYWcgcGFubmluZywgaWYgZGV0ZWN0ZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTY2VuZXJ5RXZlbnR9IGV2ZW50XHJcbiAgICovXHJcbiAgZG93biggZXZlbnQgKSB7XHJcbiAgICBQYW5ab29tTGlzdGVuZXIucHJvdG90eXBlLmRvd24uY2FsbCggdGhpcywgZXZlbnQgKTtcclxuXHJcbiAgICAvLyBJZiB0aGUgUG9pbnRlciBzaWduaWZpZXMgdGhlIGlucHV0IGlzIGludGVuZGVkIGZvciBkcmFnZ2luZyBzYXZlIGEgcmVmZXJlbmNlIHRvIHRoZSB0cmFpbCBzbyB3ZSBjYW4gc3VwcG9ydFxyXG4gICAgLy8ga2VlcGluZyB0aGUgZXZlbnQgdGFyZ2V0IGluIHZpZXcgZHVyaW5nIHRoZSBkcmFnIG9wZXJhdGlvbi5cclxuICAgIGlmICggdGhpcy5fZHJhZ0JvdW5kcyAhPT0gbnVsbCAmJiBldmVudC5wb2ludGVyLmhhc0ludGVudCggSW50ZW50LkRSQUcgKSApIHtcclxuXHJcbiAgICAgIC8vIGlmIHRoaXMgaXMgb3VyIG9ubHkgZG93biBwb2ludGVyLCBzZWUgaWYgd2Ugc2hvdWxkIHN0YXJ0IHBhbm5pbmcgZHVyaW5nIGRyYWdcclxuICAgICAgaWYgKCB0aGlzLl9hdHRhY2hlZFBvaW50ZXJzLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgICB0aGlzLl9kcmFnZ2luZ0luRHJhZ0JvdW5kcyA9IHRoaXMuX2RyYWdCb3VuZHMuY29udGFpbnNQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBBbGwgY29uZGl0aW9ucyBhcmUgbWV0IHRvIHN0YXJ0IHdhdGNoaW5nIGZvciBib3VuZHMgdG8ga2VlcCBpbiB2aWV3IGR1cmluZyBhIGRyYWcgaW50ZXJhY3Rpb24uIEVhZ2VybHlcclxuICAgICAgLy8gc2F2ZSB0aGUgYXR0YWNoZWRMaXN0ZW5lciBoZXJlIHNvIHRoYXQgd2UgZG9uJ3QgaGF2ZSB0byBkbyBhbnkgd29yayBpbiB0aGUgbW92ZSBldmVudC5cclxuICAgICAgaWYgKCBldmVudC5wb2ludGVyLmF0dGFjaGVkTGlzdGVuZXIgKSB7XHJcbiAgICAgICAgaWYgKCAhdGhpcy5fYXR0YWNoZWRQb2ludGVycy5pbmNsdWRlcyggZXZlbnQucG9pbnRlciApICkge1xyXG4gICAgICAgICAgdGhpcy5fYXR0YWNoZWRQb2ludGVycy5wdXNoKCBldmVudC5wb2ludGVyICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYmVnaW4gbWlkZGxlIHByZXNzIHBhbm5pbmcgaWYgd2UgYXJlbid0IGFscmVhZHkgaW4gdGhhdCBzdGF0ZVxyXG4gICAgaWYgKCBldmVudC5wb2ludGVyLnR5cGUgPT09ICdtb3VzZScgJiYgZXZlbnQucG9pbnRlci5taWRkbGVEb3duICYmICF0aGlzLm1pZGRsZVByZXNzICkge1xyXG4gICAgICB0aGlzLm1pZGRsZVByZXNzID0gbmV3IE1pZGRsZVByZXNzKCBldmVudC5wb2ludGVyLCBldmVudC50cmFpbCApO1xyXG4gICAgICBldmVudC5wb2ludGVyLmN1cnNvciA9IE1PVkVfQ1VSU09SO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuY2FuY2VsTWlkZGxlUHJlc3MoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElmIGluIGEgc3RhdGUgd2hlcmUgd2UgYXJlIHBhbm5pbmcgZnJvbSBhIG1pZGRsZSBtb3VzZSBwcmVzcywgZXhpdCB0aGF0IHN0YXRlLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgY2FuY2VsTWlkZGxlUHJlc3MoKSB7XHJcbiAgICBpZiAoIHRoaXMubWlkZGxlUHJlc3MgKSB7XHJcbiAgICAgIHRoaXMubWlkZGxlUHJlc3MucG9pbnRlci5jdXJzb3IgPSBudWxsO1xyXG4gICAgICB0aGlzLm1pZGRsZVByZXNzID0gbnVsbDtcclxuXHJcbiAgICAgIHRoaXMuc3RvcEluUHJvZ3Jlc3NBbmltYXRpb24oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIExpc3RlbmVyIGZvciB0aGUgYXR0YWNoZWQgcG9pbnRlciBvbiBtb3ZlLiBPbmx5IG1vdmUgaWYgYSBtaWRkbGUgcHJlc3MgaXMgbm90IGN1cnJlbnRseSBkb3duLlxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2NlbmVyeUV2ZW50fSBldmVudFxyXG4gICAqL1xyXG4gIG1vdmVQcmVzcyggZXZlbnQgKSB7XHJcbiAgICBpZiAoICF0aGlzLm1pZGRsZVByZXNzICkge1xyXG4gICAgICBQYW5ab29tTGlzdGVuZXIucHJvdG90eXBlLm1vdmVQcmVzcy5jYWxsKCB0aGlzLCBldmVudCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGFydCBvZiB0aGUgU2NlbmVyeSBsaXN0ZW5lciBBUEkuIFN1cHBvcnRzIHJlcG9zaXRpb25pbmcgd2hpbGUgZHJhZ2dpbmcgYSBtb3JlIGRlc2NlbmRhbnQgbGV2ZWxcclxuICAgKiBOb2RlIHVuZGVyIHRoaXMgbGlzdGVuZXIuIElmIHRoZSBub2RlIGFuZCBwb2ludGVyIGFyZSBvdXQgb2YgdGhlIGRyYWdCb3VuZHMsIHdlIHJlcG9zaXRpb24gdG8ga2VlcCB0aGUgTm9kZVxyXG4gICAqIHZpc2libGUgd2l0aGluIGRyYWdCb3VuZHMuXHJcbiAgICogQHB1YmxpYyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2NlbmVyeUV2ZW50fSBldmVudFxyXG4gICAqL1xyXG4gIG1vdmUoIGV2ZW50ICkge1xyXG5cclxuICAgIC8vIE5vIG5lZWQgdG8gZG8gdGhpcyB3b3JrIGlmIHdlIGFyZSB6b29tZWQgb3V0LlxyXG4gICAgaWYgKCB0aGlzLl9hdHRhY2hlZFBvaW50ZXJzLmxlbmd0aCA+IDAgJiYgdGhpcy5nZXRDdXJyZW50U2NhbGUoKSA+IDEgKSB7XHJcblxyXG4gICAgICAvLyBPbmx5IHRyeSB0byBnZXQgdGhlIGF0dGFjaGVkIGxpc3RlbmVyIGlmIHdlIGRpZG4ndCBzdWNjZXNzZnVsbHkgZ2V0IGl0IG9uIHRoZSBkb3duIGV2ZW50LiBUaGlzIHNob3VsZCBvbmx5XHJcbiAgICAgIC8vIGhhcHBlbiBpZiB0aGUgZHJhZyBkaWQgbm90IHN0YXJ0IHdpdGhpbmcgZHJhZ0JvdW5kcyAodGhlIGxpc3RlbmVyIGlzIGxpa2VseSBwdWxsaW5nIHRoZSBOb2RlIGludG8gdmlldykgb3JcclxuICAgICAgLy8gaWYgYSBsaXN0ZW5lciBoYXMgbm90IGJlZW4gYXR0YWNoZWQgeWV0LiBPbmNlIGEgbGlzdGVuZXIgaXMgYXR0YWNoZWQgd2UgY2FuIHN0YXJ0IHVzaW5nIGl0IHRvIGxvb2sgZm9yIHRoZVxyXG4gICAgICAvLyBib3VuZHMgdG8ga2VlcCBpbiB2aWV3LlxyXG4gICAgICBpZiAoIHRoaXMuX2RyYWdnaW5nSW5EcmFnQm91bmRzICkge1xyXG4gICAgICAgIGlmICggIXRoaXMuX2F0dGFjaGVkUG9pbnRlcnMuaW5jbHVkZXMoIGV2ZW50LnBvaW50ZXIgKSApIHtcclxuICAgICAgICAgIGNvbnN0IGhhc0RyYWdJbnRlbnQgPSB0aGlzLmhhc0RyYWdJbnRlbnQoIGV2ZW50LnBvaW50ZXIgKTtcclxuICAgICAgICAgIGNvbnN0IGN1cnJlbnRUYXJnZXRFeGlzdHMgPSBldmVudC5jdXJyZW50VGFyZ2V0ICE9PSBudWxsO1xyXG5cclxuICAgICAgICAgIGlmICggY3VycmVudFRhcmdldEV4aXN0cyAmJiBoYXNEcmFnSW50ZW50ICkge1xyXG4gICAgICAgICAgICBpZiAoIGV2ZW50LnBvaW50ZXIuYXR0YWNoZWRMaXN0ZW5lciApIHtcclxuICAgICAgICAgICAgICB0aGlzLl9hdHRhY2hlZFBvaW50ZXJzLnB1c2goIGV2ZW50LnBvaW50ZXIgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLl9kcmFnZ2luZ0luRHJhZ0JvdW5kcyA9IHRoaXMuX2RyYWdCb3VuZHMuY29udGFpbnNQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBCb3VuZHMyIGluIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZSB0aGF0IHdlIGFyZSBnb2luZyB0byB0cnkgdG8ga2VlcCBpbiB2aWV3IGR1cmluZyBhIGRyYWdcclxuICAgKiBvcGVyYXRpb24uXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMyfG51bGx9XHJcbiAgICovXHJcbiAgZ2V0R2xvYmFsQm91bmRzVG9WaWV3RHVyaW5nRHJhZygpIHtcclxuICAgIGxldCBnbG9iYWxCb3VuZHNUb1ZpZXcgPSBudWxsO1xyXG5cclxuICAgIGlmICggdGhpcy5fYXR0YWNoZWRQb2ludGVycy5sZW5ndGggPiAwICkge1xyXG5cclxuICAgICAgLy8gV2UgaGF2ZSBhbiBhdHRhY2hlZExpc3RlbmVyIGZyb20gYSBTY2VuZXJ5RXZlbnQgUG9pbnRlciwgc2VlIGlmIGl0IGhhcyBpbmZvcm1hdGlvbiB3ZSBjYW4gdXNlIHRvXHJcbiAgICAgIC8vIGdldCB0aGUgdGFyZ2V0IEJvdW5kcyBmb3IgdGhlIGRyYWcgZXZlbnQuXHJcblxyXG4gICAgICAvLyBPbmx5IHVzZSB0aGUgZmlyc3Qgb25lIHNvIHRoYXQgdW5pcXVlIGRyYWdnaW5nIGJlaGF2aW9ycyBkb24ndCBcImZpZ2h0XCIgaWYgbXVsdGlwbGUgcG9pbnRlcnMgYXJlIGRvd24uXHJcbiAgICAgIGNvbnN0IGFjdGl2ZUxpc3RlbmVyID0gdGhpcy5fYXR0YWNoZWRQb2ludGVyc1sgMCBdLmF0dGFjaGVkTGlzdGVuZXI7XHJcblxyXG4gICAgICBpZiAoIGFjdGl2ZUxpc3RlbmVyLmNyZWF0ZVBhblRhcmdldEJvdW5kcyApIHtcclxuXHJcbiAgICAgICAgLy8gY2xpZW50IGhhcyBkZWZpbmVkIHRoZSBCb3VuZHMgdGhleSB3YW50IHRvIGtlZXAgaW4gdmlldyBmb3IgdGhpcyBQb2ludGVyIChpdCBpcyBhc3NpZ25lZCB0byB0aGVcclxuICAgICAgICAvLyBQb2ludGVyIHRvIHN1cHBvcnQgbXVsdGl0b3VjaCBjYXNlcylcclxuICAgICAgICBnbG9iYWxCb3VuZHNUb1ZpZXcgPSBhY3RpdmVMaXN0ZW5lci5jcmVhdGVQYW5UYXJnZXRCb3VuZHMoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggYWN0aXZlTGlzdGVuZXIubGlzdGVuZXIgaW5zdGFuY2VvZiBQcmVzc0xpc3RlbmVyIHx8XHJcbiAgICAgICAgICAgICAgICBhY3RpdmVMaXN0ZW5lci5saXN0ZW5lciBpbnN0YW5jZW9mIEtleWJvYXJkRHJhZ0xpc3RlbmVyICkge1xyXG4gICAgICAgIGNvbnN0IGF0dGFjaGVkUHJlc3NMaXN0ZW5lciA9IGFjdGl2ZUxpc3RlbmVyLmxpc3RlbmVyO1xyXG5cclxuICAgICAgICAvLyBUaGUgUHJlc3NMaXN0ZW5lciBtaWdodCBub3QgYmUgcHJlc3NlZCBhbnltb3JlIGJ1dCB0aGUgUG9pbnRlciBpcyBzdGlsbCBkb3duLCBpbiB3aGljaCBjYXNlIGl0XHJcbiAgICAgICAgLy8gaGFzIGJlZW4gaW50ZXJydXB0ZWQgb3IgY2FuY2VsbGVkLlxyXG4gICAgICAgIC8vIE5PVEU6IEl0IGlzIHBvc3NpYmxlIEkgbmVlZCB0byBjYW5jZWxQYW5EdXJpbmdEcmFnKCkgaWYgaXQgaXMgbm8gbG9uZ2VyIHByZXNzZWQsIGJ1dCBJIGRvbid0XHJcbiAgICAgICAgLy8gd2FudCB0byBjbGVhciB0aGUgcmVmZXJlbmNlIHRvIHRoZSBhdHRhY2hlZExpc3RlbmVyLCBhbmQgSSB3YW50IHRvIHN1cHBvcnQgcmVzdW1pbmcgZHJhZyBkdXJpbmcgdG91Y2gtc25hZy5cclxuICAgICAgICBpZiAoIGF0dGFjaGVkUHJlc3NMaXN0ZW5lci5pc1ByZXNzZWQgKSB7XHJcblxyXG4gICAgICAgICAgLy8gdGhpcyB3aWxsIGVpdGhlciBiZSB0aGUgUHJlc3NMaXN0ZW5lcidzIHRhcmdldE5vZGUgb3IgdGhlIGRlZmF1bHQgdGFyZ2V0IG9mIHRoZSBTY2VuZXJ5RXZlbnQgb24gcHJlc3NcclxuICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGF0dGFjaGVkUHJlc3NMaXN0ZW5lci5nZXRDdXJyZW50VGFyZ2V0KCk7XHJcblxyXG4gICAgICAgICAgLy8gVE9ETzogRm9yIG5vdyB3ZSBjYW5ub3Qgc3VwcG9ydCBEQUcuIFdlIG1heSBiZSBhYmxlIHRvIHVzZSBQcmVzc0xpc3RlbmVyLnByZXNzZWRUcmFpbCBpbnN0ZWFkIG9mXHJcbiAgICAgICAgICAvLyBnZXRDdXJyZW50VGFyZ2V0LCBhbmQgdGhlbiB3ZSB3b3VsZCBoYXZlIGEgdW5pcXVlbHkgZGVmaW5lZCB0cmFpbC4gU2VlXHJcbiAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTM2MSBhbmRcclxuICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMzU2I2lzc3VlY29tbWVudC0xMDM5Njc4Njc4XHJcbiAgICAgICAgICBpZiAoIHRhcmdldC5pbnN0YW5jZXMubGVuZ3RoID09PSAxICkge1xyXG4gICAgICAgICAgICBnbG9iYWxCb3VuZHNUb1ZpZXcgPSB0YXJnZXQuaW5zdGFuY2VzWyAwIF0udHJhaWwucGFyZW50VG9HbG9iYWxCb3VuZHMoIHRhcmdldC52aXNpYmxlQm91bmRzICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGdsb2JhbEJvdW5kc1RvVmlldztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIER1cmluZyBhIGRyYWcgb2YgYW5vdGhlciBOb2RlIHRoYXQgaXMgYSBkZXNjZW5kYW50IG9mIHRoaXMgbGlzdGVuZXIncyB0YXJnZXROb2RlLCByZXBvc2l0aW9uIGlmIHRoZVxyXG4gICAqIG5vZGUgaXMgb3V0IG9mIGRyYWdCb3VuZHMgc28gdGhhdCB0aGUgTm9kZSBpcyBhbHdheXMgd2l0aGluIHBhbkJvdW5kcy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHJlcG9zaXRpb25EdXJpbmdEcmFnKCkge1xyXG4gICAgY29uc3QgZ2xvYmFsQm91bmRzID0gdGhpcy5nZXRHbG9iYWxCb3VuZHNUb1ZpZXdEdXJpbmdEcmFnKCk7XHJcbiAgICBnbG9iYWxCb3VuZHMgJiYgdGhpcy5rZWVwQm91bmRzSW5WaWV3KCBnbG9iYWxCb3VuZHMsIHRoaXMuX2F0dGFjaGVkUG9pbnRlcnMuc29tZSggcG9pbnRlciA9PiBwb2ludGVyIGluc3RhbmNlb2YgUERPTVBvaW50ZXIgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RvcCBwYW5uaW5nIGR1cmluZyBkcmFnIGJ5IGNsZWFyaW5nIHZhcmlhYmxlcyB0aGF0IGFyZSBzZXQgdG8gaW5kaWNhdGUgYW5kIHByb3ZpZGUgaW5mb3JtYXRpb24gZm9yIHRoaXMgd29yay5cclxuICAgKiBAcGFyYW0ge1NjZW5lcnlFdmVudH0gW2V2ZW50XSAtIGlmIG5vdCBwcm92aWRlZCBhbGwgYXJlIHBhbm5pbmcgaXMgY2FuY2VsbGVkIGFuZCB3ZSBhc3N1bWUgaW50ZXJydXB0aW9uXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBjYW5jZWxQYW5uaW5nRHVyaW5nRHJhZyggZXZlbnQgKSB7XHJcblxyXG4gICAgaWYgKCBldmVudCApIHtcclxuXHJcbiAgICAgIC8vIHJlbW92ZSB0aGUgYXR0YWNoZWRQb2ludGVyIGFzc29jaWF0ZWQgd2l0aCB0aGUgZXZlbnRcclxuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9hdHRhY2hlZFBvaW50ZXJzLmluZGV4T2YoIGV2ZW50LnBvaW50ZXIgKTtcclxuICAgICAgaWYgKCBpbmRleCA+IC0xICkge1xyXG4gICAgICAgIHRoaXMuX2F0dGFjaGVkUG9pbnRlcnMuc3BsaWNlKCBpbmRleCwgMSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIFRoZXJlIGlzIG5vIFNjZW5lcnlFdmVudCwgd2UgbXVzdCBiZSBpbnRlcnJ1cHRpbmcgLSBjbGVhciBhbGwgYXR0YWNoZWRQb2ludGVyc1xyXG4gICAgICB0aGlzLl9hdHRhY2hlZFBvaW50ZXJzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2xlYXIgZmxhZyBpbmRpY2F0aW5nIHdlIGFyZSBcImRyYWdnaW5nIGluIGJvdW5kc1wiIG5leHQgbW92ZVxyXG4gICAgdGhpcy5fZHJhZ2dpbmdJbkRyYWdCb3VuZHMgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNjZW5lcnkgbGlzdGVuZXIgQVBJLiBDYW5jZWwgYW55IGRyYWcgYW5kIHBhbiBiZWhhdmlvciBmb3IgdGhlIFBvaW50ZXIgb24gdGhlIGV2ZW50LlxyXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NjZW5lcnlFdmVudH0gZXZlbnRcclxuICAgKi9cclxuICB1cCggZXZlbnQgKSB7XHJcbiAgICB0aGlzLmNhbmNlbFBhbm5pbmdEdXJpbmdEcmFnKCBldmVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5wdXQgbGlzdGVuZXIgZm9yIHRoZSAnd2hlZWwnIGV2ZW50LCBwYXJ0IG9mIHRoZSBTY2VuZXJ5IElucHV0IEFQSS5cclxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTY2VuZXJ5RXZlbnR9IGV2ZW50XHJcbiAgICovXHJcbiAgd2hlZWwoIGV2ZW50ICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCAnTXVsdGlMaXN0ZW5lciB3aGVlbCcgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIC8vIGNhbm5vdCByZXBvc2l0aW9uIGlmIGEgZHJhZ2dpbmcgd2l0aCBtaWRkbGUgbW91c2UgYnV0dG9uIC0gYnV0IHdoZWVsIHpvb20gc2hvdWxkIG5vdCBjYW5jZWwgYSBtaWRkbGUgcHJlc3NcclxuICAgIC8vIChiZWhhdmlvciBjb3BpZWQgZnJvbSBvdGhlciBicm93c2VycylcclxuICAgIGlmICggIXRoaXMubWlkZGxlUHJlc3MgKSB7XHJcbiAgICAgIGNvbnN0IHdoZWVsID0gbmV3IFdoZWVsKCBldmVudCwgdGhpcy5fdGFyZ2V0U2NhbGUgKTtcclxuICAgICAgdGhpcy5yZXBvc2l0aW9uRnJvbVdoZWVsKCB3aGVlbCwgZXZlbnQgKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogS2V5ZG93biBsaXN0ZW5lciBmb3IgZXZlbnRzIG91dHNpZGUgb2YgdGhlIFBET00uIEF0dGFjaGVkIGFzIGEgbGlzdGVuZXIgdG8gdGhlIGJvZHkgYW5kIGRyaXZlbiBieVxyXG4gICAqIEV2ZW50cyByYXRoZXIgdGhhbiBTY2VuZXJ5RXZlbnRzLiBXaGVuIHdlIGhhbmRsZSBFdmVudHMgZnJvbSB3aXRoaW4gdGhlIFBET00gd2UgbmVlZCB0aGUgUG9pbnRlciB0b1xyXG4gICAqIGRldGVybWluZSBpZiBhdHRhY2hlZC4gQnV0IGZyb20gb3V0c2lkZSBvZiB0aGUgUERPTSB3ZSBrbm93IHRoYXQgdGhlcmUgaXMgbm8gZm9jdXMgaW4gdGhlIGRvY3VtZW50IGFuZCB0aGVyZm9yZVxyXG4gICAqIHRoZSBQRE9NUG9pbnRlciBpcyBub3QgYXR0YWNoZWQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RXZlbnR9IGRvbUV2ZW50XHJcbiAgICovXHJcbiAgd2luZG93S2V5ZG93biggZG9tRXZlbnQgKSB7XHJcblxyXG4gICAgLy8gb24gYW55IGtleWJvYXJkIHJlcG9zaXRpb24gaW50ZXJydXB0IHRoZSBtaWRkbGUgcHJlc3MgcGFubmluZ1xyXG4gICAgdGhpcy5jYW5jZWxNaWRkbGVQcmVzcygpO1xyXG5cclxuICAgIGNvbnN0IHNpbUdsb2JhbCA9IF8uZ2V0KCB3aW5kb3csICdwaGV0LmpvaXN0LnNpbScsIG51bGwgKTsgLy8gcmV0dXJucyBudWxsIGlmIGdsb2JhbCBpc24ndCBmb3VuZFxyXG5cclxuICAgIGlmICggIXNpbUdsb2JhbCB8fCAhc2ltR2xvYmFsLmRpc3BsYXkuX2FjY2Vzc2libGUgfHxcclxuICAgICAgICAgIXNpbUdsb2JhbC5kaXNwbGF5LnBkb21Sb290RWxlbWVudC5jb250YWlucyggZG9tRXZlbnQudGFyZ2V0ICkgKSB7XHJcbiAgICAgIHRoaXMuaGFuZGxlWm9vbUNvbW1hbmRzKCBkb21FdmVudCApO1xyXG5cclxuICAgICAgLy8gaGFuZGxlIHRyYW5zbGF0aW9uIHdpdGhvdXQgd29ycnkgb2YgdGhlIHBvaW50ZXIgYmVpbmcgYXR0YWNoZWQgYmVjYXVzZSB0aGVyZSBpcyBubyBwb2ludGVyIGF0IHRoaXMgbGV2ZWxcclxuICAgICAgaWYgKCBLZXlib2FyZFV0aWxzLmlzQXJyb3dLZXkoIGRvbUV2ZW50ICkgKSB7XHJcbiAgICAgICAgY29uc3Qga2V5UHJlc3MgPSBuZXcgS2V5UHJlc3MoIGdsb2JhbEtleVN0YXRlVHJhY2tlciwgdGhpcy5nZXRDdXJyZW50U2NhbGUoKSwgdGhpcy5fdGFyZ2V0U2NhbGUgKTtcclxuICAgICAgICB0aGlzLnJlcG9zaXRpb25Gcm9tS2V5cygga2V5UHJlc3MgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRm9yIHRoZSBTY2VuZXJ5IGxpc3RlbmVyIEFQSSwgaGFuZGxlIGEga2V5ZG93biBldmVudC4gVGhpcyBTY2VuZXJ5RXZlbnQgd2lsbCBoYXZlIGJlZW4gZGlzcGF0Y2hlZCBmcm9tXHJcbiAgICogSW5wdXQuZGlzcGF0Y2hFdmVudCBhbmQgc28gdGhlIEV2ZW50IHRhcmdldCBtdXN0IGJlIHdpdGhpbiB0aGUgUERPTS4gSW4gdGhpcyBjYXNlLCB3ZSBtYXlcclxuICAgKiBuZWVkIHRvIHByZXZlbnQgdHJhbnNsYXRpb24gaWYgdGhlIFBET01Qb2ludGVyIGlzIGF0dGFjaGVkLlxyXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NjZW5lcnlFdmVudH0gZXZlbnRcclxuICAgKi9cclxuICBrZXlkb3duKCBldmVudCApIHtcclxuICAgIGNvbnN0IGRvbUV2ZW50ID0gZXZlbnQuZG9tRXZlbnQ7XHJcblxyXG4gICAgLy8gb24gYW55IGtleWJvYXJkIHJlcG9zaXRpb24gaW50ZXJydXB0IHRoZSBtaWRkbGUgcHJlc3MgcGFubmluZ1xyXG4gICAgdGhpcy5jYW5jZWxNaWRkbGVQcmVzcygpO1xyXG5cclxuICAgIC8vIGhhbmRsZSB6b29tXHJcbiAgICB0aGlzLmhhbmRsZVpvb21Db21tYW5kcyggZG9tRXZlbnQgKTtcclxuXHJcbiAgICBjb25zdCBrZXlib2FyZERyYWdJbnRlbnQgPSBldmVudC5wb2ludGVyLmhhc0ludGVudCggSW50ZW50LktFWUJPQVJEX0RSQUcgKTtcclxuXHJcbiAgICAvLyBoYW5kbGUgdHJhbnNsYXRpb25cclxuICAgIGlmICggS2V5Ym9hcmRVdGlscy5pc0Fycm93S2V5KCBkb21FdmVudCApICkge1xyXG5cclxuICAgICAgaWYgKCAha2V5Ym9hcmREcmFnSW50ZW50ICkge1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIgaGFuZGxlIGFycm93IGtleSBkb3duJyApO1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgICAgICBjb25zdCBrZXlQcmVzcyA9IG5ldyBLZXlQcmVzcyggZ2xvYmFsS2V5U3RhdGVUcmFja2VyLCB0aGlzLmdldEN1cnJlbnRTY2FsZSgpLCB0aGlzLl90YXJnZXRTY2FsZSApO1xyXG4gICAgICAgIHRoaXMucmVwb3NpdGlvbkZyb21LZXlzKCBrZXlQcmVzcyApO1xyXG5cclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBLZXlib2FyZFV0aWxzLmlzTW92ZW1lbnRLZXkoIGRvbUV2ZW50ICkgKSB7XHJcbiAgICAgIGlmICgga2V5Ym9hcmREcmFnSW50ZW50ICkge1xyXG5cclxuICAgICAgICAvLyBMb29rIGZvciBhbnkgYXR0YWNoZWQgcG9pbnRlcnMgaWYgd2UgYXJlIGRyYWdnaW5nIHdpdGggYSBrZXlib2FyZCBhbmQgYWRkIHRoZW0gdG8gdGhlIGxpc3QuIFdoZW4gZHJhZ2dpbmdcclxuICAgICAgICAvLyBzdG9wcyB0aGUgUG9pbnRlciBsaXN0ZW5lciBpcyBkZXRhY2hlZCBhbmQgdGhlIHBvaW50ZXIgaXMgcmVtb3ZlZCBmcm9tIHRoZSBsaXN0IGluIGBzdGVwKClgLlxyXG4gICAgICAgIGlmICggZXZlbnQucG9pbnRlci5pc0F0dGFjaGVkKCkgKSB7XHJcbiAgICAgICAgICBpZiAoICF0aGlzLl9hdHRhY2hlZFBvaW50ZXJzLmluY2x1ZGVzKCBldmVudC5wb2ludGVyICkgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2F0dGFjaGVkUG9pbnRlcnMucHVzaCggZXZlbnQucG9pbnRlciApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGFuZGxlIHpvb20gY29tbWFuZHMgZnJvbSBhIGtleWJvYXJkLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxyXG4gICAqL1xyXG4gIGhhbmRsZVpvb21Db21tYW5kcyggZG9tRXZlbnQgKSB7XHJcblxyXG4gICAgLy8gaGFuZGxlIHpvb20gLSBTYWZhcmkgZG9lc24ndCByZWNlaXZlIHRoZSBrZXl1cCBldmVudCB3aGVuIHRoZSBtZXRhIGtleSBpcyBwcmVzc2VkIHNvIHdlIGNhbm5vdCB1c2VcclxuICAgIC8vIHRoZSBrZXlTdGF0ZVRyYWNrZXIgdG8gZGV0ZXJtaW5lIGlmIHpvb20ga2V5cyBhcmUgZG93blxyXG4gICAgY29uc3Qgem9vbUluQ29tbWFuZERvd24gPSBLZXlib2FyZFpvb21VdGlscy5pc1pvb21Db21tYW5kKCBkb21FdmVudCwgdHJ1ZSApO1xyXG4gICAgY29uc3Qgem9vbU91dENvbW1hbmREb3duID0gS2V5Ym9hcmRab29tVXRpbHMuaXNab29tQ29tbWFuZCggZG9tRXZlbnQsIGZhbHNlICk7XHJcblxyXG4gICAgaWYgKCB6b29tSW5Db21tYW5kRG93biB8fCB6b29tT3V0Q29tbWFuZERvd24gKSB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpUGFuWm9vbUxpc3RlbmVyIGtleWJvYXJkIHpvb20gaW4nICk7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgICAgLy8gZG9uJ3QgYWxsb3cgbmF0aXZlIGJyb3dzZXIgem9vbVxyXG4gICAgICBkb21FdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgY29uc3QgbmV4dFNjYWxlID0gdGhpcy5nZXROZXh0RGlzY3JldGVTY2FsZSggem9vbUluQ29tbWFuZERvd24gKTtcclxuICAgICAgY29uc3Qga2V5UHJlc3MgPSBuZXcgS2V5UHJlc3MoIGdsb2JhbEtleVN0YXRlVHJhY2tlciwgbmV4dFNjYWxlLCB0aGlzLl90YXJnZXRTY2FsZSApO1xyXG4gICAgICB0aGlzLnJlcG9zaXRpb25Gcm9tS2V5cygga2V5UHJlc3MgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBLZXlib2FyZFpvb21VdGlscy5pc1pvb21SZXNldENvbW1hbmQoIGRvbUV2ZW50ICkgKSB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIga2V5Ym9hcmQgcmVzZXQnICk7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgICAgLy8gdGhpcyBpcyBhIG5hdGl2ZSBjb21tYW5kLCBidXQgd2UgYXJlIHRha2luZyBvdmVyXHJcbiAgICAgIGRvbUV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIHRoaXMucmVzZXRUcmFuc2Zvcm0oKTtcclxuXHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGlzIGlzIGp1c3QgZm9yIG1hY09TIFNhZmFyaS4gUmVzcG9uZHMgdG8gdHJhY2twYWQgaW5wdXQuIFByZXZlbnRzIGRlZmF1bHQgYnJvd3NlciBiZWhhdmlvciBhbmQgc2V0cyB2YWx1ZXNcclxuICAgKiByZXF1aXJlZCBmb3IgZm9yIHJlcG9zaXRpb25pbmcgYXMgdXNlciBvcGVyYXRlcyB0aGUgdHJhY2sgcGFkLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxyXG4gICAqL1xyXG4gIGhhbmRsZUdlc3R1cmVTdGFydEV2ZW50KCBkb21FdmVudCApIHtcclxuICAgIHRoaXMuZ2VzdHVyZVN0YXJ0QWN0aW9uLmV4ZWN1dGUoIGRvbUV2ZW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGlzIGlzIGp1c3QgZm9yIG1hY09TIFNhZmFyaS4gUmVzcG9uZHMgdG8gdHJhY2twYWQgaW5wdXQuIFByZXZlbmRzIGRlZmF1bHQgYnJvd3NlciBiZWhhdmlvciBhbmRcclxuICAgKiBzZXRzIGRlc3RpbmF0aW9uIHNjYWxlIGFzIHVzZXIgcGluY2hlcyBvbiB0aGUgdHJhY2twYWQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RXZlbnR9IGRvbUV2ZW50XHJcbiAgICovXHJcbiAgaGFuZGxlR2VzdHVyZUNoYW5nZUV2ZW50KCBkb21FdmVudCApIHtcclxuICAgIHRoaXMuZ2VzdHVyZUNoYW5nZUFjdGlvbi5leGVjdXRlKCBkb21FdmVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGFuZGxlIHRoZSBkb3duIE1pZGRsZVByZXNzIGR1cmluZyBhbmltYXRpb24uIElmIHdlIGhhdmUgYSBtaWRkbGUgcHJlc3Mgd2UgbmVlZCB0byB1cGRhdGUgcG9zaXRpb24gdGFyZ2V0LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKi9cclxuICBoYW5kbGVNaWRkbGVQcmVzcyggZHQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm1pZGRsZVByZXNzLCAnTWlkZGxlUHJlc3MgbXVzdCBiZSBkZWZpbmVkIHRvIGhhbmRsZScgKTtcclxuXHJcbiAgICBpZiAoIGR0ID4gMCApIHtcclxuICAgICAgY29uc3QgY3VycmVudFBvaW50ID0gdGhpcy5taWRkbGVQcmVzcy5wb2ludGVyLnBvaW50O1xyXG4gICAgICBjb25zdCBnbG9iYWxEZWx0YSA9IGN1cnJlbnRQb2ludC5taW51cyggdGhpcy5taWRkbGVQcmVzcy5pbml0aWFsUG9pbnQgKTtcclxuXHJcbiAgICAgIC8vIG1hZ25pdHVkZSBhbG9uZSBpcyB0b28gZmFzdCwgcmVkdWNlIGJ5IGEgYml0XHJcbiAgICAgIGNvbnN0IHJlZHVjZWRNYWduaXR1ZGUgPSBnbG9iYWxEZWx0YS5tYWduaXR1ZGUgLyAxMDA7XHJcbiAgICAgIGlmICggcmVkdWNlZE1hZ25pdHVkZSA+IDAgKSB7XHJcblxyXG4gICAgICAgIC8vIHNldCB0aGUgZGVsdGEgdmVjdG9yIGluIGdsb2JhbCBjb29yZGluYXRlcywgbGltaXRlZCBieSBhIG1heGltdW0gdmlldyBjb29yZHMvc2Vjb25kIHZlbG9jaXR5LCBjb3JyZWN0ZWRcclxuICAgICAgICAvLyBmb3IgYW55IHJlcHJlc2VudGF0aXZlIHRhcmdldCBzY2FsZVxyXG4gICAgICAgIGdsb2JhbERlbHRhLnNldE1hZ25pdHVkZSggTWF0aC5taW4oIHJlZHVjZWRNYWduaXR1ZGUgLyBkdCwgTUFYX1NDUk9MTF9WRUxPQ0lUWSAqIHRoaXMuX3RhcmdldFNjYWxlICkgKTtcclxuICAgICAgICB0aGlzLnNldERlc3RpbmF0aW9uUG9zaXRpb24oIHRoaXMuc291cmNlUG9zaXRpb24ucGx1cyggZ2xvYmFsRGVsdGEgKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2xhdGUgYW5kIHNjYWxlIHRvIGEgdGFyZ2V0IHBvaW50LiBUaGUgcmVzdWx0IG9mIHRoaXMgZnVuY3Rpb24gc2hvdWxkIG1ha2UgaXQgYXBwZWFyIHRoYXQgd2UgYXJlIHNjYWxpbmdcclxuICAgKiBpbiBvciBvdXQgb2YgYSBwYXJ0aWN1bGFyIHBvaW50IG9uIHRoZSB0YXJnZXQgbm9kZS4gVGhpcyBhY3R1YWxseSBtb2RpZmllcyB0aGUgbWF0cml4IG9mIHRoZSB0YXJnZXQgbm9kZS4gVG9cclxuICAgKiBhY2NvbXBsaXNoIHpvb21pbmcgaW50byBhIHBhcnRpY3VsYXIgcG9pbnQsIHdlIGNvbXB1dGUgYSBtYXRyaXggdGhhdCB3b3VsZCB0cmFuc2Zvcm0gdGhlIHRhcmdldCBub2RlIGZyb21cclxuICAgKiB0aGUgdGFyZ2V0IHBvaW50LCB0aGVuIGFwcGx5IHNjYWxlLCB0aGVuIHRyYW5zbGF0ZSB0aGUgdGFyZ2V0IGJhY2sgdG8gdGhlIHRhcmdldCBwb2ludC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGdsb2JhbFBvaW50IC0gcG9pbnQgdG8gem9vbSBpbiBvbiwgaW4gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNjYWxlRGVsdGFcclxuICAgKi9cclxuICB0cmFuc2xhdGVTY2FsZVRvVGFyZ2V0KCBnbG9iYWxQb2ludCwgc2NhbGVEZWx0YSApIHtcclxuICAgIGNvbnN0IHBvaW50SW5Mb2NhbEZyYW1lID0gdGhpcy5fdGFyZ2V0Tm9kZS5nbG9iYWxUb0xvY2FsUG9pbnQoIGdsb2JhbFBvaW50ICk7XHJcbiAgICBjb25zdCBwb2ludEluUGFyZW50RnJhbWUgPSB0aGlzLl90YXJnZXROb2RlLmdsb2JhbFRvUGFyZW50UG9pbnQoIGdsb2JhbFBvaW50ICk7XHJcblxyXG4gICAgY29uc3QgZnJvbUxvY2FsUG9pbnQgPSBNYXRyaXgzLnRyYW5zbGF0aW9uKCAtcG9pbnRJbkxvY2FsRnJhbWUueCwgLXBvaW50SW5Mb2NhbEZyYW1lLnkgKTtcclxuICAgIGNvbnN0IHRvVGFyZ2V0UG9pbnQgPSBNYXRyaXgzLnRyYW5zbGF0aW9uKCBwb2ludEluUGFyZW50RnJhbWUueCwgcG9pbnRJblBhcmVudEZyYW1lLnkgKTtcclxuXHJcbiAgICBjb25zdCBuZXh0U2NhbGUgPSB0aGlzLmxpbWl0U2NhbGUoIHRoaXMuZ2V0Q3VycmVudFNjYWxlKCkgKyBzY2FsZURlbHRhICk7XHJcblxyXG4gICAgLy8gd2UgZmlyc3QgdHJhbnNsYXRlIGZyb20gdGFyZ2V0IHBvaW50LCB0aGVuIGFwcGx5IHNjYWxlLCB0aGVuIHRyYW5zbGF0ZSBiYWNrIHRvIHRhcmdldCBwb2ludCAoKVxyXG4gICAgLy8gc28gdGhhdCBpdCBhcHBlYXJzIGFzIHRob3VnaCB3ZSBhcmUgem9vbWluZyBpbnRvIHRoYXQgcG9pbnRcclxuICAgIGNvbnN0IHNjYWxlTWF0cml4ID0gdG9UYXJnZXRQb2ludC50aW1lc01hdHJpeCggTWF0cml4My5zY2FsaW5nKCBuZXh0U2NhbGUgKSApLnRpbWVzTWF0cml4KCBmcm9tTG9jYWxQb2ludCApO1xyXG4gICAgdGhpcy5tYXRyaXhQcm9wZXJ0eS5zZXQoIHNjYWxlTWF0cml4ICk7XHJcblxyXG4gICAgLy8gbWFrZSBzdXJlIHRoYXQgd2UgYXJlIHN0aWxsIHdpdGhpbiBQYW5ab29tTGlzdGVuZXIgY29uc3RyYWludHNcclxuICAgIHRoaXMuY29ycmVjdFJlcG9zaXRpb24oKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHRyYW5zbGF0aW9uIGFuZCBzY2FsZSB0byBhIHRhcmdldCBwb2ludC4gTGlrZSB0cmFuc2xhdGVTY2FsZVRvVGFyZ2V0LCBidXQgaW5zdGVhZCBvZiB0YWtpbmcgYSBzY2FsZURlbHRhXHJcbiAgICogaXQgdGFrZXMgdGhlIGZpbmFsIHNjYWxlIHRvIGJlIHVzZWQgZm9yIHRoZSB0YXJnZXQgTm9kZXMgbWF0cml4LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGdsb2JhbFBvaW50IC0gcG9pbnQgdG8gdHJhbnNsYXRlIHRvIGluIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzY2FsZSAtIGZpbmFsIHNjYWxlIGZvciB0aGUgdHJhbnNmb3JtYXRpb24gbWF0cml4XHJcbiAgICovXHJcbiAgc2V0VHJhbnNsYXRpb25TY2FsZVRvVGFyZ2V0KCBnbG9iYWxQb2ludCwgc2NhbGUgKSB7XHJcbiAgICBjb25zdCBwb2ludEluTG9jYWxGcmFtZSA9IHRoaXMuX3RhcmdldE5vZGUuZ2xvYmFsVG9Mb2NhbFBvaW50KCBnbG9iYWxQb2ludCApO1xyXG4gICAgY29uc3QgcG9pbnRJblBhcmVudEZyYW1lID0gdGhpcy5fdGFyZ2V0Tm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBnbG9iYWxQb2ludCApO1xyXG5cclxuICAgIGNvbnN0IGZyb21Mb2NhbFBvaW50ID0gTWF0cml4My50cmFuc2xhdGlvbiggLXBvaW50SW5Mb2NhbEZyYW1lLngsIC1wb2ludEluTG9jYWxGcmFtZS55ICk7XHJcbiAgICBjb25zdCB0b1RhcmdldFBvaW50ID0gTWF0cml4My50cmFuc2xhdGlvbiggcG9pbnRJblBhcmVudEZyYW1lLngsIHBvaW50SW5QYXJlbnRGcmFtZS55ICk7XHJcblxyXG4gICAgY29uc3QgbmV4dFNjYWxlID0gdGhpcy5saW1pdFNjYWxlKCBzY2FsZSApO1xyXG5cclxuICAgIC8vIHdlIGZpcnN0IHRyYW5zbGF0ZSBmcm9tIHRhcmdldCBwb2ludCwgdGhlbiBhcHBseSBzY2FsZSwgdGhlbiB0cmFuc2xhdGUgYmFjayB0byB0YXJnZXQgcG9pbnQgKClcclxuICAgIC8vIHNvIHRoYXQgaXQgYXBwZWFycyBhcyB0aG91Z2ggd2UgYXJlIHpvb21pbmcgaW50byB0aGF0IHBvaW50XHJcbiAgICBjb25zdCBzY2FsZU1hdHJpeCA9IHRvVGFyZ2V0UG9pbnQudGltZXNNYXRyaXgoIE1hdHJpeDMuc2NhbGluZyggbmV4dFNjYWxlICkgKS50aW1lc01hdHJpeCggZnJvbUxvY2FsUG9pbnQgKTtcclxuICAgIHRoaXMubWF0cml4UHJvcGVydHkuc2V0KCBzY2FsZU1hdHJpeCApO1xyXG5cclxuICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHdlIGFyZSBzdGlsbCB3aXRoaW4gUGFuWm9vbUxpc3RlbmVyIGNvbnN0cmFpbnRzXHJcbiAgICB0aGlzLmNvcnJlY3RSZXBvc2l0aW9uKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2xhdGUgdGhlIHRhcmdldCBub2RlIGluIGEgZGlyZWN0aW9uIHNwZWNpZmllZCBieSBkZWx0YVZlY3Rvci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGRlbHRhVmVjdG9yXHJcbiAgICovXHJcbiAgdHJhbnNsYXRlRGVsdGEoIGRlbHRhVmVjdG9yICkge1xyXG4gICAgY29uc3QgdGFyZ2V0UG9pbnQgPSB0aGlzLl90YXJnZXROb2RlLmdsb2JhbFRvUGFyZW50UG9pbnQoIHRoaXMuX3BhbkJvdW5kcy5jZW50ZXIgKTtcclxuICAgIGNvbnN0IHNvdXJjZVBvaW50ID0gdGFyZ2V0UG9pbnQucGx1cyggZGVsdGFWZWN0b3IgKTtcclxuICAgIHRoaXMudHJhbnNsYXRlVG9UYXJnZXQoIHNvdXJjZVBvaW50LCB0YXJnZXRQb2ludCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJhbnNsYXRlIHRoZSB0YXJnZXROb2RlIGZyb20gYSBsb2NhbCBwb2ludCB0byBhIHRhcmdldCBwb2ludC4gQm90aCBwb2ludHMgc2hvdWxkIGJlIGluIHRoZSBnbG9iYWwgY29vcmRpbmF0ZVxyXG4gICAqIGZyYW1lLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yfSBpbml0aWFsUG9pbnQgLSBpbiBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZSwgc291cmNlIHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSB0YXJnZXRQb2ludCAtIGluIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lLCB0YXJnZXQgcG9zaXRpb25cclxuICAgKi9cclxuICB0cmFuc2xhdGVUb1RhcmdldCggaW5pdGlhbFBvaW50LCB0YXJnZXRQb2ludCApIHtcclxuXHJcbiAgICBjb25zdCBzaW5nbGVJbml0aWFsUG9pbnQgPSB0aGlzLl90YXJnZXROb2RlLmdsb2JhbFRvUGFyZW50UG9pbnQoIGluaXRpYWxQb2ludCApO1xyXG4gICAgY29uc3Qgc2luZ2xlVGFyZ2V0UG9pbnQgPSB0aGlzLl90YXJnZXROb2RlLmdsb2JhbFRvUGFyZW50UG9pbnQoIHRhcmdldFBvaW50ICk7XHJcbiAgICBjb25zdCBkZWx0YSA9IHNpbmdsZVRhcmdldFBvaW50Lm1pbnVzKCBzaW5nbGVJbml0aWFsUG9pbnQgKTtcclxuICAgIHRoaXMubWF0cml4UHJvcGVydHkuc2V0KCBNYXRyaXgzLnRyYW5zbGF0aW9uRnJvbVZlY3RvciggZGVsdGEgKS50aW1lc01hdHJpeCggdGhpcy5fdGFyZ2V0Tm9kZS5nZXRNYXRyaXgoKSApICk7XHJcblxyXG4gICAgdGhpcy5jb3JyZWN0UmVwb3NpdGlvbigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVwb3NpdGlvbnMgdGhlIHRhcmdldCBub2RlIGluIHJlc3BvbnNlIHRvIGtleWJvYXJkIGlucHV0LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0gICB7S2V5UHJlc3N9IGtleVByZXNzXHJcbiAgICovXHJcbiAgcmVwb3NpdGlvbkZyb21LZXlzKCBrZXlQcmVzcyApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIgcmVwb3NpdGlvbiBmcm9tIGtleSBwcmVzcycgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIGNvbnN0IG5ld1NjYWxlID0ga2V5UHJlc3Muc2NhbGU7XHJcbiAgICBjb25zdCBjdXJyZW50U2NhbGUgPSB0aGlzLmdldEN1cnJlbnRTY2FsZSgpO1xyXG4gICAgaWYgKCBuZXdTY2FsZSAhPT0gY3VycmVudFNjYWxlICkge1xyXG5cclxuICAgICAgLy8ga2V5IHByZXNzIGNoYW5nZWQgc2NhbGVcclxuICAgICAgdGhpcy5zZXREZXN0aW5hdGlvblNjYWxlKCBuZXdTY2FsZSApO1xyXG4gICAgICB0aGlzLnNjYWxlR2VzdHVyZVRhcmdldFBvc2l0aW9uID0ga2V5UHJlc3MuY29tcHV0ZVNjYWxlVGFyZ2V0RnJvbUtleVByZXNzKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggIWtleVByZXNzLnRyYW5zbGF0aW9uVmVjdG9yLmVxdWFscyggVmVjdG9yMi5aRVJPICkgKSB7XHJcblxyXG4gICAgICAvLyBrZXkgcHJlc3MgaW5pdGlhdGVkIHNvbWUgdHJhbnNsYXRpb25cclxuICAgICAgdGhpcy5zZXREZXN0aW5hdGlvblBvc2l0aW9uKCB0aGlzLnNvdXJjZVBvc2l0aW9uLnBsdXMoIGtleVByZXNzLnRyYW5zbGF0aW9uVmVjdG9yICkgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNvcnJlY3RSZXBvc2l0aW9uKCk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlcG9zaXRpb25zIHRoZSB0YXJnZXQgbm9kZSBpbiByZXNwb25zZSB0byB3aGVlbCBpbnB1dC4gV2hlZWwgaW5wdXQgY2FuIGNvbWUgZnJvbSBhIG1vdXNlLCB0cmFja3BhZCwgb3JcclxuICAgKiBvdGhlci4gQXNwZWN0cyBvZiB0aGUgZXZlbnQgYXJlIHNsaWdodGx5IGRpZmZlcmVudCBmb3IgZWFjaCBpbnB1dCBzb3VyY2UgYW5kIHRoaXMgZnVuY3Rpb24gdHJpZXMgdG8gbm9ybWFsaXplXHJcbiAgICogdGhlc2UgZGlmZmVyZW5jZXMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSAgIHtXaGVlbH0gd2hlZWxcclxuICAgKiBAcGFyYW0gICB7U2NlbmVyeUV2ZW50fSBldmVudFxyXG4gICAqL1xyXG4gIHJlcG9zaXRpb25Gcm9tV2hlZWwoIHdoZWVsLCBldmVudCApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIgcmVwb3NpdGlvbiBmcm9tIHdoZWVsJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gcHJldmVudCBhbnkgbmF0aXZlIGJyb3dzZXIgem9vbSBhbmQgZG9uJ3QgYWxsb3cgYnJvd3NlciBnbyBnbyAnYmFjaycgb3IgJ2ZvcndhcmQnIGEgcGFnZVxyXG4gICAgZXZlbnQuZG9tRXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICBpZiAoIHdoZWVsLmlzQ3RybEtleURvd24gKSB7XHJcbiAgICAgIGNvbnN0IG5leHRTY2FsZSA9IHRoaXMubGltaXRTY2FsZSggdGhpcy5nZXRDdXJyZW50U2NhbGUoKSArIHdoZWVsLnNjYWxlRGVsdGEgKTtcclxuICAgICAgdGhpcy5zY2FsZUdlc3R1cmVUYXJnZXRQb3NpdGlvbiA9IHdoZWVsLnRhcmdldFBvaW50O1xyXG4gICAgICB0aGlzLnNldERlc3RpbmF0aW9uU2NhbGUoIG5leHRTY2FsZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyB3aGVlbCBkb2VzIG5vdCBpbmRpY2F0ZSB6b29tLCBtdXN0IGJlIHRyYW5zbGF0aW9uXHJcbiAgICAgIHRoaXMuc2V0RGVzdGluYXRpb25Qb3NpdGlvbiggdGhpcy5zb3VyY2VQb3NpdGlvbi5wbHVzKCB3aGVlbC50cmFuc2xhdGlvblZlY3RvciApICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jb3JyZWN0UmVwb3NpdGlvbigpO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcG9uIGFueSBraW5kIG9mIHJlcG9zaXRpb24sIHVwZGF0ZSB0aGUgc291cmNlIHBvc2l0aW9uIGFuZCBzY2FsZSBmb3IgdGhlIG5leHQgdXBkYXRlIGluIGFuaW1hdGVUb1RhcmdldHMuXHJcbiAgICpcclxuICAgKiBOb3RlOiBUaGlzIGFzc3VtZXMgdGhhdCBhbnkga2luZCBvZiByZXBvc2l0aW9uaW5nIG9mIHRoZSB0YXJnZXQgbm9kZSB3aWxsIGV2ZW50dWFsbHkgY2FsbCBjb3JyZWN0UmVwb3NpdGlvbi5cclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICovXHJcbiAgY29ycmVjdFJlcG9zaXRpb24oKSB7XHJcbiAgICBzdXBlci5jb3JyZWN0UmVwb3NpdGlvbigpO1xyXG5cclxuICAgIGlmICggdGhpcy5fcGFuQm91bmRzLmlzRmluaXRlKCkgKSB7XHJcblxyXG4gICAgICAvLyB0aGUgcGFuIGJvdW5kcyBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGUgdGFyZ2V0IE5vZGUgKGdlbmVyYWxseSwgYm91bmRzIG9mIHRoZSB0YXJnZXROb2RlXHJcbiAgICAgIC8vIHRoYXQgYXJlIHZpc2libGUgaW4gdGhlIGdsb2JhbCBwYW5Cb3VuZHMpXHJcbiAgICAgIHRoaXMuX3RyYW5zZm9ybWVkUGFuQm91bmRzID0gdGhpcy5fcGFuQm91bmRzLnRyYW5zZm9ybWVkKCB0aGlzLl90YXJnZXROb2RlLm1hdHJpeC5pbnZlcnRlZCgpICk7XHJcblxyXG4gICAgICB0aGlzLnNvdXJjZVBvc2l0aW9uID0gdGhpcy5fdHJhbnNmb3JtZWRQYW5Cb3VuZHMuY2VudGVyO1xyXG4gICAgICB0aGlzLnNvdXJjZVNjYWxlID0gdGhpcy5nZXRDdXJyZW50U2NhbGUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZW4gYSBuZXcgcHJlc3MgYmVnaW5zLCBzdG9wIGFueSBpbiBwcm9ncmVzcyBhbmltYXRpb24uXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNdWx0aUxpc3RlbmVyLlByZXNzfSBwcmVzc1xyXG4gICAqL1xyXG4gIGFkZFByZXNzKCBwcmVzcyApIHtcclxuICAgIHN1cGVyLmFkZFByZXNzKCBwcmVzcyApO1xyXG4gICAgdGhpcy5zdG9wSW5Qcm9ncmVzc0FuaW1hdGlvbigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hlbiBwcmVzc2VzIGFyZSByZW1vdmVkLCByZXNldCBhbmltYXRpb24gZGVzdGluYXRpb25zLlxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TXVsdGlMaXN0ZW5lci5QcmVzc30gcHJlc3NcclxuICAgKiBAcmV0dXJucyB7fVxyXG4gICAqL1xyXG4gIHJlbW92ZVByZXNzKCBwcmVzcyApIHtcclxuICAgIHN1cGVyLnJlbW92ZVByZXNzKCBwcmVzcyApO1xyXG5cclxuICAgIC8vIHJlc3RvcmUgdGhlIGN1cnNvciBpZiB3ZSBoYXZlIGEgbWlkZGxlIHByZXNzIGFzIHdlIGFyZSBpbiBhIHN0YXRlIHdoZXJlIG1vdmluZyB0aGUgbW91c2Ugd2lsbCBwYW5cclxuICAgIGlmICggdGhpcy5taWRkbGVQcmVzcyApIHtcclxuICAgICAgcHJlc3MucG9pbnRlci5jdXJzb3IgPSBNT1ZFX0NVUlNPUjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMuX3ByZXNzZXMubGVuZ3RoID09PSAwICkge1xyXG4gICAgICB0aGlzLnN0b3BJblByb2dyZXNzQW5pbWF0aW9uKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnRlcnJ1cHQgdGhlIGxpc3RlbmVyLiBDYW5jZWxzIGFueSBhY3RpdmUgaW5wdXQgYW5kIGNsZWFycyByZWZlcmVuY2VzIHVwb24gaW50ZXJhY3Rpb24gZW5kLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBpbnRlcnJ1cHQoKSB7XHJcbiAgICB0aGlzLmNhbmNlbFBhbm5pbmdEdXJpbmdEcmFnKCk7XHJcblxyXG4gICAgdGhpcy5jYW5jZWxNaWRkbGVQcmVzcygpO1xyXG4gICAgc3VwZXIuaW50ZXJydXB0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBcIkNhbmNlbFwiIHRoZSBsaXN0ZW5lciwgd2hlbiBpbnB1dCBzdG9wcyBhYm5vcm1hbGx5LiBQYXJ0IG9mIHRoZSBzY2VuZXJ5IElucHV0IEFQSS5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY2FuY2VsKCkge1xyXG4gICAgdGhpcy5pbnRlcnJ1cHQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgSW50ZW50IG9mIHRoZSBQb2ludGVyIGluZGljYXRlcyB0aGF0IGl0IHdpbGwgYmUgdXNlZCBmb3IgZHJhZ2dpbmcgb2Ygc29tZSBraW5kLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BvaW50ZXJ9IHBvaW50ZXJcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBoYXNEcmFnSW50ZW50KCBwb2ludGVyICkge1xyXG4gICAgcmV0dXJuIHBvaW50ZXIuaGFzSW50ZW50KCBJbnRlbnQuS0VZQk9BUkRfRFJBRyApIHx8XHJcbiAgICAgICAgICAgcG9pbnRlci5oYXNJbnRlbnQoIEludGVudC5EUkFHICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQYW4gdG8gYSBwcm92aWRlZCBOb2RlLCBhdHRlbXB0aW5nIHRvIHBsYWNlIHRoZSBub2RlIGluIHRoZSBjZW50ZXIgb2YgdGhlIHRyYW5zZm9ybWVkUGFuQm91bmRzLiBJdCBtYXkgbm90IGVuZFxyXG4gICAqIHVwIGV4YWN0bHkgaW4gdGhlIGNlbnRlciBzaW5jZSB3ZSBoYXZlIHRvIG1ha2Ugc3VyZSBwYW5Cb3VuZHMgYXJlIGNvbXBsZXRlbHkgZmlsbGVkIHdpdGggdGFyZ2V0Tm9kZSBjb250ZW50LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxyXG4gICAqL1xyXG4gIHBhblRvTm9kZSggbm9kZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3BhbkJvdW5kcy5pc0Zpbml0ZSgpLCAncGFuQm91bmRzIHNob3VsZCBiZSBkZWZpbmVkIHdoZW4gcGFubmluZy4nICk7XHJcbiAgICB0aGlzLmtlZXBCb3VuZHNJblZpZXcoIG5vZGUuZ2xvYmFsQm91bmRzLCB0cnVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGRlc3RpbmF0aW9uIHBvc2l0aW9uIHRvIHBhbiBzdWNoIHRoYXQgdGhlIHByb3ZpZGVkIGdsb2JhbEJvdW5kcyBhcmUgdG90YWxseSB2aXNpYmxlIHdpdGhpbiB0aGUgcGFuQm91bmRzLlxyXG4gICAqIFRoaXMgd2lsbCBuZXZlciBwYW4gb3V0c2lkZSBwYW5Cb3VuZHMsIGlmIHRoZSBwcm92aWRlZCBnbG9iYWxCb3VuZHMgZXh0ZW5kIGJleW9uZCB0aGVtLlxyXG4gICAqXHJcbiAgICogSWYgd2UgYXJlIG5vdCB1c2luZyBwYW5Ub0NlbnRlciBhbmQgdGhlIGdsb2JhbEJvdW5kcyBpcyBsYXJnZXIgdGhhbiB0aGUgc2NyZWVuIHNpemUgdGhpcyBmdW5jdGlvbiBkb2VzIG5vdGhpbmcuXHJcbiAgICogSXQgZG9lc24ndCBtYWtlIHNlbnNlIHRvIHRyeSB0byBrZWVwIHRoZSBwcm92aWRlZCBib3VuZHMgZW50aXJlbHkgaW4gdmlldyBpZiB0aGV5IGFyZSBsYXJnZXIgdGhhbiB0aGUgYXZhaWxhbGFibGVcclxuICAgKiB2aWV3IHNwYWNlLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IGdsb2JhbEJvdW5kcyAtIGluIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBwYW5Ub0NlbnRlciAtIGlmIHRydWUsIHdlIHdpbGwgcGFuIHRvIHRoZSBjZW50ZXIgb2YgdGhlIHByb3ZpZGVkIGJvdW5kcywgb3RoZXJ3aXNlIHdlIHdpbGwgcGFuXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVudGlsIGFsbCBlZGdlcyBhcmUgb24gc2NyZWVuXHJcbiAgICovXHJcbiAga2VlcEJvdW5kc0luVmlldyggZ2xvYmFsQm91bmRzLCBwYW5Ub0NlbnRlciA9IGZhbHNlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fcGFuQm91bmRzLmlzRmluaXRlKCksICdwYW5Cb3VuZHMgc2hvdWxkIGJlIGRlZmluZWQgd2hlbiBwYW5uaW5nLicgKTtcclxuXHJcbiAgICBjb25zdCBib3VuZHNJblRhcmdldEZyYW1lID0gdGhpcy5fdGFyZ2V0Tm9kZS5nbG9iYWxUb0xvY2FsQm91bmRzKCBnbG9iYWxCb3VuZHMgKTtcclxuICAgIGNvbnN0IHRyYW5zbGF0aW9uRGVsdGEgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG5cclxuICAgIGxldCBkaXN0YW5jZVRvTGVmdEVkZ2UgPSAwO1xyXG4gICAgbGV0IGRpc3RhbmNlVG9SaWdodEVkZ2UgPSAwO1xyXG4gICAgbGV0IGRpc3RhbmNlVG9Ub3BFZGdlID0gMDtcclxuICAgIGxldCBkaXN0YW5jZVRvQm90dG9tRWRnZSA9IDA7XHJcblxyXG4gICAgaWYgKCBwYW5Ub0NlbnRlciApIHtcclxuXHJcbiAgICAgIC8vIElmIHBhbm5pbmcgdG8gY2VudGVyLCB0aGUgYW1vdW50IHRvIHBhbiBpcyB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgY2VudGVyIG9mIHRoZSBzY3JlZW4gdG8gdGhlIGNlbnRlciBvZiB0aGVcclxuICAgICAgLy8gcHJvdmlkZWQgYm91bmRzLiBJbiB0aGlzIGNhc2VcclxuICAgICAgZGlzdGFuY2VUb0xlZnRFZGdlID0gdGhpcy5fdHJhbnNmb3JtZWRQYW5Cb3VuZHMuY2VudGVyWCAtIGJvdW5kc0luVGFyZ2V0RnJhbWUuY2VudGVyWDtcclxuICAgICAgZGlzdGFuY2VUb1JpZ2h0RWRnZSA9IHRoaXMuX3RyYW5zZm9ybWVkUGFuQm91bmRzLmNlbnRlclggLSBib3VuZHNJblRhcmdldEZyYW1lLmNlbnRlclg7XHJcbiAgICAgIGRpc3RhbmNlVG9Ub3BFZGdlID0gdGhpcy5fdHJhbnNmb3JtZWRQYW5Cb3VuZHMuY2VudGVyWSAtIGJvdW5kc0luVGFyZ2V0RnJhbWUuY2VudGVyWTtcclxuICAgICAgZGlzdGFuY2VUb0JvdHRvbUVkZ2UgPSB0aGlzLl90cmFuc2Zvcm1lZFBhbkJvdW5kcy5jZW50ZXJZIC0gYm91bmRzSW5UYXJnZXRGcmFtZS5jZW50ZXJZO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGJvdW5kc0luVGFyZ2V0RnJhbWUud2lkdGggPCB0aGlzLl90cmFuc2Zvcm1lZFBhbkJvdW5kcy53aWR0aCAmJiBib3VuZHNJblRhcmdldEZyYW1lLmhlaWdodCA8IHRoaXMuX3RyYW5zZm9ybWVkUGFuQm91bmRzLmhlaWdodCApIHtcclxuXHJcbiAgICAgIC8vIElmIHRoZSBwcm92aWRlZCBib3VuZHMgYXJlIHdpZGVyIHRoYW4gdGhlIGF2YWlsYWJsZSBwYW4gYm91bmRzIHdlIHNob3VsZG4ndCB0cnkgdG8gc2hpZnQgaXQsIGl0IHdpbGwgYXdrd2FyZGx5XHJcbiAgICAgIC8vIHRyeSB0byBzbGlkZSB0aGUgc2NyZWVuIHRvIG9uZSBvZiB0aGUgc2lkZXMgb2YgdGhlIGJvdW5kcy4gVGhpcyBvcGVyYXRpb24gb25seSBtYWtlcyBzZW5zZSBpZiB0aGUgc2NyZWVuIGNhblxyXG4gICAgICAvLyB0b3RhbGx5IGNvbnRhaW4gdGhlIG9iamVjdCBiZWluZyBkcmFnZ2VkLlxyXG5cclxuICAgICAgZGlzdGFuY2VUb0xlZnRFZGdlID0gdGhpcy5fdHJhbnNmb3JtZWRQYW5Cb3VuZHMubGVmdCAtIGJvdW5kc0luVGFyZ2V0RnJhbWUubGVmdDtcclxuICAgICAgZGlzdGFuY2VUb1JpZ2h0RWRnZSA9IHRoaXMuX3RyYW5zZm9ybWVkUGFuQm91bmRzLnJpZ2h0IC0gYm91bmRzSW5UYXJnZXRGcmFtZS5yaWdodDtcclxuICAgICAgZGlzdGFuY2VUb1RvcEVkZ2UgPSB0aGlzLl90cmFuc2Zvcm1lZFBhbkJvdW5kcy50b3AgLSBib3VuZHNJblRhcmdldEZyYW1lLnRvcDtcclxuICAgICAgZGlzdGFuY2VUb0JvdHRvbUVkZ2UgPSB0aGlzLl90cmFuc2Zvcm1lZFBhbkJvdW5kcy5ib3R0b20gLSBib3VuZHNJblRhcmdldEZyYW1lLmJvdHRvbTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIGRpc3RhbmNlVG9Cb3R0b21FZGdlIDwgMCApIHtcclxuICAgICAgdHJhbnNsYXRpb25EZWx0YS55ID0gLWRpc3RhbmNlVG9Cb3R0b21FZGdlO1xyXG4gICAgfVxyXG4gICAgaWYgKCBkaXN0YW5jZVRvVG9wRWRnZSA+IDAgKSB7XHJcbiAgICAgIHRyYW5zbGF0aW9uRGVsdGEueSA9IC1kaXN0YW5jZVRvVG9wRWRnZTtcclxuICAgIH1cclxuICAgIGlmICggZGlzdGFuY2VUb1JpZ2h0RWRnZSA8IDAgKSB7XHJcbiAgICAgIHRyYW5zbGF0aW9uRGVsdGEueCA9IC1kaXN0YW5jZVRvUmlnaHRFZGdlO1xyXG4gICAgfVxyXG4gICAgaWYgKCBkaXN0YW5jZVRvTGVmdEVkZ2UgPiAwICkge1xyXG4gICAgICB0cmFuc2xhdGlvbkRlbHRhLnggPSAtZGlzdGFuY2VUb0xlZnRFZGdlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2V0RGVzdGluYXRpb25Qb3NpdGlvbiggdGhpcy5zb3VyY2VQb3NpdGlvbi5wbHVzKCB0cmFuc2xhdGlvbkRlbHRhICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEtlZXAgYSB0cmFpbCBpbiB2aWV3IGJ5IHBhbm5pbmcgdG8gaXQgaWYgaXQgaGFzIGJvdW5kcyB0aGF0IGFyZSBvdXRzaWRlIG9mIHRoZSBnbG9iYWwgcGFuQm91bmRzLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHBhcmFtIHtUcmFpbH0gdHJhaWxcclxuICAgKi9cclxuICBrZWVwVHJhaWxJblZpZXcoIHRyYWlsICkge1xyXG4gICAgaWYgKCB0aGlzLl9wYW5Cb3VuZHMuaXNGaW5pdGUoKSAmJiB0cmFpbC5sYXN0Tm9kZSgpLmJvdW5kcy5pc0Zpbml0ZSgpICkge1xyXG4gICAgICBjb25zdCBnbG9iYWxCb3VuZHMgPSB0cmFpbC5sb2NhbFRvR2xvYmFsQm91bmRzKCB0cmFpbC5sYXN0Tm9kZSgpLmxvY2FsQm91bmRzICk7XHJcbiAgICAgIGlmICggIXRoaXMuX3BhbkJvdW5kcy5jb250YWluc0JvdW5kcyggZ2xvYmFsQm91bmRzICkgKSB7XHJcbiAgICAgICAgdGhpcy5rZWVwQm91bmRzSW5WaWV3KCBnbG9iYWxCb3VuZHMsIHRydWUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSBpbiBzZWNvbmRzXHJcbiAgICovXHJcbiAgYW5pbWF0ZVRvVGFyZ2V0cyggZHQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmJvdW5kc0Zpbml0ZSwgJ2luaXRpYWxpemVQb3NpdGlvbnMgbXVzdCBiZSBjYWxsZWQgYXQgbGVhc3Qgb25jZSBiZWZvcmUgYW5pbWF0aW5nJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5zb3VyY2VQb3NpdGlvbi5pc0Zpbml0ZSgpLCAnSG93IGNhbiB0aGUgc291cmNlIHBvc2l0aW9uIG5vdCBiZSBhIGZpbml0ZSBWZWN0b3IyPycgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZGVzdGluYXRpb25Qb3NpdGlvbi5pc0Zpbml0ZSgpLCAnSG93IGNhbiB0aGUgZGVzdGluYXRpb24gcG9zaXRpb24gbm90IGJlIGEgZmluaXRlIFZlY3RvcjI/JyApO1xyXG5cclxuICAgIC8vIG9ubHkgYW5pbWF0ZSB0byB0YXJnZXRzIGlmIHdpdGhpbiB0aGlzIHByZWNpc2lvbiBzbyB0aGF0IHdlIGRvbid0IGFuaW1hdGUgZm9yZXZlciwgc2luY2UgYW5pbWF0aW9uIHNwZWVkXHJcbiAgICAvLyBpcyBkZXBlbmRlbnQgb24gdGhlIGRpZmZlcmVuY2UgYmV0d2VuIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gcG9zaXRpb25zXHJcbiAgICBjb25zdCBwb3NpdGlvbkRpcnR5ID0gIXRoaXMuZGVzdGluYXRpb25Qb3NpdGlvbi5lcXVhbHNFcHNpbG9uKCB0aGlzLnNvdXJjZVBvc2l0aW9uLCAwLjEgKTtcclxuICAgIGNvbnN0IHNjYWxlRGlydHkgPSAhVXRpbHMuZXF1YWxzRXBzaWxvbiggdGhpcy5zb3VyY2VTY2FsZSwgdGhpcy5kZXN0aW5hdGlvblNjYWxlLCAwLjAwMSApO1xyXG5cclxuICAgIC8vIE9ubHkgYSBNaWRkbGVQcmVzcyBjYW4gc3VwcG9ydCBhbmltYXRpb24gd2hpbGUgZG93blxyXG4gICAgaWYgKCB0aGlzLl9wcmVzc2VzLmxlbmd0aCA9PT0gMCB8fCB0aGlzLm1pZGRsZVByZXNzICE9PSBudWxsICkge1xyXG4gICAgICBpZiAoIHBvc2l0aW9uRGlydHkgKSB7XHJcblxyXG4gICAgICAgIC8vIGFuaW1hdGUgdG8gdGhlIHBvc2l0aW9uLCBlZmZlY3RpdmVseSBwYW5uaW5nIG92ZXIgdGltZSB3aXRob3V0IGFueSBzY2FsaW5nXHJcbiAgICAgICAgY29uc3QgdHJhbnNsYXRpb25EaWZmZXJlbmNlID0gdGhpcy5kZXN0aW5hdGlvblBvc2l0aW9uLm1pbnVzKCB0aGlzLnNvdXJjZVBvc2l0aW9uICk7XHJcblxyXG4gICAgICAgIGxldCB0cmFuc2xhdGlvbkRpcmVjdGlvbiA9IHRyYW5zbGF0aW9uRGlmZmVyZW5jZTtcclxuICAgICAgICBpZiAoIHRyYW5zbGF0aW9uRGlmZmVyZW5jZS5tYWduaXR1ZGUgIT09IDAgKSB7XHJcbiAgICAgICAgICB0cmFuc2xhdGlvbkRpcmVjdGlvbiA9IHRyYW5zbGF0aW9uRGlmZmVyZW5jZS5ub3JtYWxpemVkKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB0cmFuc2xhdGlvblNwZWVkID0gdGhpcy5nZXRUcmFuc2xhdGlvblNwZWVkKCB0cmFuc2xhdGlvbkRpZmZlcmVuY2UubWFnbml0dWRlICk7XHJcbiAgICAgICAgc2NyYXRjaFZlbG9jaXR5VmVjdG9yLnNldFhZKCB0cmFuc2xhdGlvblNwZWVkLCB0cmFuc2xhdGlvblNwZWVkICk7XHJcblxyXG4gICAgICAgIC8vIGZpbmFsbHkgZGV0ZXJtaW5lIHRoZSBmaW5hbCBwYW5uaW5nIHRyYW5zbGF0aW9uIGFuZCBhcHBseVxyXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudE1hZ25pdHVkZSA9IHNjcmF0Y2hWZWxvY2l0eVZlY3Rvci5tdWx0aXBseVNjYWxhciggZHQgKTtcclxuICAgICAgICBjb25zdCB0cmFuc2xhdGlvbkRlbHRhID0gdHJhbnNsYXRpb25EaXJlY3Rpb24uY29tcG9uZW50VGltZXMoIGNvbXBvbmVudE1hZ25pdHVkZSApO1xyXG5cclxuICAgICAgICAvLyBpbiBjYXNlIG9mIGxhcmdlIGR0LCBkb24ndCBvdmVyc2hvb3QgdGhlIGRlc3RpbmF0aW9uXHJcbiAgICAgICAgaWYgKCB0cmFuc2xhdGlvbkRlbHRhLm1hZ25pdHVkZSA+IHRyYW5zbGF0aW9uRGlmZmVyZW5jZS5tYWduaXR1ZGUgKSB7XHJcbiAgICAgICAgICB0cmFuc2xhdGlvbkRlbHRhLnNldCggdHJhbnNsYXRpb25EaWZmZXJlbmNlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0cmFuc2xhdGlvbkRlbHRhLmlzRmluaXRlKCksICdUcnlpbmcgdG8gdHJhbnNsYXRlIHdpdGggYSBub24tZmluaXRlIFZlY3RvcjInICk7XHJcbiAgICAgICAgdGhpcy50cmFuc2xhdGVEZWx0YSggdHJhbnNsYXRpb25EZWx0YSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIHNjYWxlRGlydHkgKSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5zY2FsZUdlc3R1cmVUYXJnZXRQb3NpdGlvbiwgJ3RoZXJlIG11c3QgYmUgYSBzY2FsZSB0YXJnZXQgcG9pbnQnICk7XHJcblxyXG4gICAgICAgIGNvbnN0IHNjYWxlRGlmZmVyZW5jZSA9IHRoaXMuZGVzdGluYXRpb25TY2FsZSAtIHRoaXMuc291cmNlU2NhbGU7XHJcbiAgICAgICAgbGV0IHNjYWxlRGVsdGEgPSBzY2FsZURpZmZlcmVuY2UgKiBkdCAqIDY7XHJcblxyXG4gICAgICAgIC8vIGluIGNhc2Ugb2YgbGFyZ2UgZHQgbWFrZSBzdXJlIHRoYXQgd2UgZG9uJ3Qgb3ZlcnNob290IG91ciBkZXN0aW5hdGlvblxyXG4gICAgICAgIGlmICggTWF0aC5hYnMoIHNjYWxlRGVsdGEgKSA+IE1hdGguYWJzKCBzY2FsZURpZmZlcmVuY2UgKSApIHtcclxuICAgICAgICAgIHNjYWxlRGVsdGEgPSBzY2FsZURpZmZlcmVuY2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudHJhbnNsYXRlU2NhbGVUb1RhcmdldCggdGhpcy5zY2FsZUdlc3R1cmVUYXJnZXRQb3NpdGlvbiwgc2NhbGVEZWx0YSApO1xyXG5cclxuICAgICAgICAvLyBhZnRlciBhcHBseWluZyB0aGUgc2NhbGUsIHRoZSBzb3VyY2UgcG9zaXRpb24gaGFzIGNoYW5nZWQsIHVwZGF0ZSBkZXN0aW5hdGlvbiB0byBtYXRjaFxyXG4gICAgICAgIHRoaXMuc2V0RGVzdGluYXRpb25Qb3NpdGlvbiggdGhpcy5zb3VyY2VQb3NpdGlvbiApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB0aGlzLmRlc3RpbmF0aW9uU2NhbGUgIT09IHRoaXMuc291cmNlU2NhbGUgKSB7XHJcblxyXG4gICAgICAgIC8vIG5vdCBmYXIgZW5vdWdoIHRvIGFuaW1hdGUgYnV0IGNsb3NlIGVub3VnaCB0aGF0IHdlIGNhbiBzZXQgZGVzdGluYXRpb24gZXF1YWwgdG8gc291cmNlIHRvIGF2b2lkIGZ1cnRoZXJcclxuICAgICAgICAvLyBhbmltYXRpb24gc3RlcHNcclxuICAgICAgICB0aGlzLnNldFRyYW5zbGF0aW9uU2NhbGVUb1RhcmdldCggdGhpcy5zY2FsZUdlc3R1cmVUYXJnZXRQb3NpdGlvbiwgdGhpcy5kZXN0aW5hdGlvblNjYWxlICk7XHJcbiAgICAgICAgdGhpcy5zZXREZXN0aW5hdGlvblBvc2l0aW9uKCB0aGlzLnNvdXJjZVBvc2l0aW9uICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0b3AgYW55IGluLXByb2dyZXNzIHRyYW5zZm9ybWF0aW9ucyBvZiB0aGUgdGFyZ2V0IG5vZGUgYnkgc2V0dGluZyBkZXN0aW5hdGlvbnMgdG8gc291cmNlcyBpbW1lZGlhdGVseS5cclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgc3RvcEluUHJvZ3Jlc3NBbmltYXRpb24oKSB7XHJcbiAgICBpZiAoIHRoaXMuYm91bmRzRmluaXRlICkge1xyXG4gICAgICB0aGlzLnNldERlc3RpbmF0aW9uU2NhbGUoIHRoaXMuc291cmNlU2NhbGUgKTtcclxuICAgICAgdGhpcy5zZXREZXN0aW5hdGlvblBvc2l0aW9uKCB0aGlzLnNvdXJjZVBvc2l0aW9uICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIHBvc2l0aW9ucy4gTmVjZXNzYXJ5IGJlY2F1c2UgdGFyZ2V0IG9yIHBhbiBib3VuZHMgbWF5IG5vdCBiZSBkZWZpbmVkXHJcbiAgICogdXBvbiBjb25zdHJ1Y3Rpb24uIFRoaXMgY2FuIHNldCB0aG9zZSB1cCB3aGVuIHRoZXkgYXJlIGRlZmluZWQuXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGluaXRpYWxpemVQb3NpdGlvbnMoKSB7XHJcbiAgICB0aGlzLmJvdW5kc0Zpbml0ZSA9IHRoaXMuX3RyYW5zZm9ybWVkUGFuQm91bmRzLmlzRmluaXRlKCk7XHJcblxyXG4gICAgaWYgKCB0aGlzLmJvdW5kc0Zpbml0ZSApIHtcclxuXHJcbiAgICAgIHRoaXMuc291cmNlUG9zaXRpb24gPSB0aGlzLl90cmFuc2Zvcm1lZFBhbkJvdW5kcy5jZW50ZXI7XHJcbiAgICAgIHRoaXMuc2V0RGVzdGluYXRpb25Qb3NpdGlvbiggdGhpcy5zb3VyY2VQb3NpdGlvbiApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuc291cmNlUG9zaXRpb24gPSBudWxsO1xyXG4gICAgICB0aGlzLmRlc3RpbmF0aW9uUG9zaXRpb24gPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb3VuZHMyfSBib3VuZHNcclxuICAgKi9cclxuICBzZXRQYW5Cb3VuZHMoIGJvdW5kcyApIHtcclxuICAgIHN1cGVyLnNldFBhbkJvdW5kcyggYm91bmRzICk7XHJcbiAgICB0aGlzLmluaXRpYWxpemVQb3NpdGlvbnMoKTtcclxuXHJcbiAgICAvLyBkcmFnIGJvdW5kcyBlcm9kZWQgYSBiaXQgc28gdGhhdCByZXBvc2l0aW9uaW5nIGR1cmluZyBkcmFnIG9jY3VycyBhcyB0aGUgcG9pbnRlciBnZXRzIGNsb3NlIHRvIHRoZSBlZGdlLlxyXG4gICAgdGhpcy5fZHJhZ0JvdW5kcyA9IGJvdW5kcy5lcm9kZWRYWSggYm91bmRzLndpZHRoICogMC4xLCBib3VuZHMuaGVpZ2h0ICogMC4xICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9kcmFnQm91bmRzLmhhc05vbnplcm9BcmVhKCksICdkcmFnIGJvdW5kcyBtdXN0IGhhdmUgc29tZSB3aWR0aCBhbmQgaGVpZ2h0JyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBvbiBzZXR0aW5nIHRhcmdldCBib3VuZHMsIHJlLXNldCBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIHBvc2l0aW9ucy5cclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IHRhcmdldEJvdW5kc1xyXG4gICAqL1xyXG4gIHNldFRhcmdldEJvdW5kcyggdGFyZ2V0Qm91bmRzICkge1xyXG4gICAgc3VwZXIuc2V0VGFyZ2V0Qm91bmRzKCB0YXJnZXRCb3VuZHMgKTtcclxuICAgIHRoaXMuaW5pdGlhbGl6ZVBvc2l0aW9ucygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBkZXN0aW5hdGlvbiBwb3NpdGlvbi4gSW4gYW5pbWF0aW9uLCB3ZSB3aWxsIHRyeSBtb3ZlIHRoZSB0YXJnZXROb2RlIHVudGlsIHNvdXJjZVBvc2l0aW9uIG1hdGNoZXNcclxuICAgKiB0aGlzIHBvaW50LiBEZXN0aW5hdGlvbiBpcyBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGUgdGFyZ2V0IG5vZGUuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gZGVzdGluYXRpb25cclxuICAgKi9cclxuICBzZXREZXN0aW5hdGlvblBvc2l0aW9uKCBkZXN0aW5hdGlvbiApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYm91bmRzRmluaXRlLCAnYm91bmRzIG11c3QgYmUgZmluaXRlIGJlZm9yZSBzZXR0aW5nIGRlc3RpbmF0aW9uIHBvc2l0aW9ucycgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGRlc3RpbmF0aW9uLmlzRmluaXRlKCksICdwcm92aWRlZCBkZXN0aW5hdGlvbiBwb3NpdGlvbiBpcyBub3QgZGVmaW5lZCcgKTtcclxuXHJcbiAgICAvLyBsaW1pdCBkZXN0aW5hdGlvbiBwb3NpdGlvbiB0byBiZSB3aXRoaW4gdGhlIGF2YWlsYWJsZSBib3VuZHMgcGFuIGJvdW5kc1xyXG4gICAgc2NyYXRjaEJvdW5kcy5zZXRNaW5NYXgoXHJcbiAgICAgIHRoaXMuc291cmNlUG9zaXRpb24ueCAtIHRoaXMuX3RyYW5zZm9ybWVkUGFuQm91bmRzLmxlZnQgLSB0aGlzLl9wYW5Cb3VuZHMubGVmdCxcclxuICAgICAgdGhpcy5zb3VyY2VQb3NpdGlvbi55IC0gdGhpcy5fdHJhbnNmb3JtZWRQYW5Cb3VuZHMudG9wIC0gdGhpcy5fcGFuQm91bmRzLnRvcCxcclxuICAgICAgdGhpcy5zb3VyY2VQb3NpdGlvbi54ICsgdGhpcy5fcGFuQm91bmRzLnJpZ2h0IC0gdGhpcy5fdHJhbnNmb3JtZWRQYW5Cb3VuZHMucmlnaHQsXHJcbiAgICAgIHRoaXMuc291cmNlUG9zaXRpb24ueSArIHRoaXMuX3BhbkJvdW5kcy5ib3R0b20gLSB0aGlzLl90cmFuc2Zvcm1lZFBhbkJvdW5kcy5ib3R0b21cclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5kZXN0aW5hdGlvblBvc2l0aW9uID0gc2NyYXRjaEJvdW5kcy5jbG9zZXN0UG9pbnRUbyggZGVzdGluYXRpb24gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgZGVzdGluYXRpb24gc2NhbGUgZm9yIHRoZSB0YXJnZXQgbm9kZS4gSW4gYW5pbWF0aW9uLCB0YXJnZXQgbm9kZSB3aWxsIGJlIHJlcG9zaXRpb25lZCB1bnRpbCBzb3VyY2VcclxuICAgKiBzY2FsZSBtYXRjaGVzIGRlc3RpbmF0aW9uIHNjYWxlLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gc2NhbGVcclxuICAgKi9cclxuICBzZXREZXN0aW5hdGlvblNjYWxlKCBzY2FsZSApIHtcclxuICAgIHRoaXMuZGVzdGluYXRpb25TY2FsZSA9IHRoaXMubGltaXRTY2FsZSggc2NhbGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGN1bGF0ZSB0aGUgdHJhbnNsYXRpb24gc3BlZWQgdG8gYW5pbWF0ZSBmcm9tIG91ciBzb3VyY2VQb3NpdGlvbiB0byBvdXIgdGFyZ2V0UG9zaXRpb24uIFNwZWVkIGdvZXMgdG8gemVyb1xyXG4gICAqIGFzIHRoZSB0cmFuc2xhdGlvbkRpc3RhbmNlIGdldHMgc21hbGxlciBmb3Igc21vb3RoIGFuaW1hdGlvbiBhcyB3ZSByZWFjaCBvdXIgZGVzdGluYXRpb24gcG9zaXRpb24uIFRoaXMgcmV0dXJuc1xyXG4gICAqIGEgc3BlZWQgaW4gdGhlIGNvb3JkaW5hdGUgZnJhbWUgb2YgdGhlIHBhcmVudCBvZiB0aGlzIGxpc3RlbmVyJ3MgdGFyZ2V0IE5vZGUuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0cmFuc2xhdGlvbkRpc3RhbmNlXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRUcmFuc2xhdGlvblNwZWVkKCB0cmFuc2xhdGlvbkRpc3RhbmNlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHJhbnNsYXRpb25EaXN0YW5jZSA+PSAwLCAnZGlzdGFuY2UgZm9yIGdldFRyYW5zbGF0aW9uU3BlZWQgc2hvdWxkIGJlIGEgbm9uLW5lZ2F0aXZlIG51bWJlcicgKTtcclxuXHJcbiAgICAvLyBUaGUgbGFyZ2VyIHRoZSBzY2FsZSwgdGhhdCBmYXN0ZXIgd2Ugd2FudCB0byB0cmFuc2xhdGUgYmVjYXVzZSB0aGUgZGlzdGFuY2VzIGJldHdlZW4gc291cmNlIGFuZCBkZXN0aW5hdGlvblxyXG4gICAgLy8gYXJlIHNtYWxsZXIgd2hlbiB6b29tZWQgaW4uIE90aGVyd2lzZSwgc3BlZWRzIHdpbGwgYmUgc2xvd2VyIHdoaWxlIHpvb21lZCBpbi5cclxuICAgIGNvbnN0IHNjYWxlRGlzdGFuY2UgPSB0cmFuc2xhdGlvbkRpc3RhbmNlICogdGhpcy5nZXRDdXJyZW50U2NhbGUoKTtcclxuXHJcbiAgICAvLyBBIG1heGltdW0gdHJhbnNsYXRpb24gZmFjdG9yIGFwcGxpZWQgdG8gZGlzdGFuY2UgdG8gZGV0ZXJtaW5lIGEgcmVhc29uYWJsZSBzcGVlZCwgZGV0ZXJtaW5lZCBieVxyXG4gICAgLy8gaW5zcGVjdGlvbiBidXQgY291bGQgYmUgbW9kaWZpZWQuIFRoaXMgaW1wYWN0cyBob3cgbG9uZyB0aGUgXCJ0YWlsXCIgb2YgdHJhbnNsYXRpb24gaXMgYXMgd2UgYW5pbWF0ZS5cclxuICAgIC8vIFdoaWxlIHdlIGFuaW1hdGUgdG8gdGhlIGRlc3RpbmF0aW9uIHBvc2l0aW9uIHdlIG1vdmUgcXVpY2tseSBmYXIgYXdheSBmcm9tIHRoZSBkZXN0aW5hdGlvbiBhbmQgc2xvdyBkb3duXHJcbiAgICAvLyBhcyB3ZSBnZXQgY2xvc2VyIHRvIHRoZSB0YXJnZXQuIFJlZHVjZSB0aGlzIHZhbHVlIHRvIGV4YWdnZXJhdGUgdGhhdCBlZmZlY3QgYW5kIG1vdmUgbW9yZSBzbG93bHkgYXMgd2VcclxuICAgIC8vIGdldCBjbG9zZXIgdG8gdGhlIGRlc3RpbmF0aW9uIHBvc2l0aW9uLlxyXG4gICAgY29uc3QgbWF4U2NhbGVGYWN0b3IgPSA1O1xyXG5cclxuICAgIC8vIHNwZWVkIGZhbGxzIGF3YXkgZXhwb25lbnRpYWxseSBhcyB3ZSBnZXQgY2xvc2VyIHRvIG91ciBkZXN0aW5hdGlvbiBzbyB0aGF0IHdlIGFwcGVhciB0byBcInNsaWRlXCIgdG8gb3VyXHJcbiAgICAvLyBkZXN0aW5hdGlvbiB3aGljaCBsb29rcyBuaWNlLCBidXQgYWxzbyBwcmV2ZW50cyB1cyBmcm9tIGFuaW1hdGluZyBmb3IgdG9vIGxvbmdcclxuICAgIGNvbnN0IHRyYW5zbGF0aW9uU3BlZWQgPSBzY2FsZURpc3RhbmNlICogKCAxIC8gKCBNYXRoLnBvdyggc2NhbGVEaXN0YW5jZSwgMiApIC0gTWF0aC5wb3coIG1heFNjYWxlRmFjdG9yLCAyICkgKSArIG1heFNjYWxlRmFjdG9yICk7XHJcblxyXG4gICAgLy8gdHJhbnNsYXRpb25TcGVlZCBjb3VsZCBiZSBuZWdhdGl2ZSBvciBnbyB0byBpbmZpbml0eSBkdWUgdG8gdGhlIGJlaGF2aW9yIG9mIHRoZSBleHBvbmVudGlhbCBjYWxjdWxhdGlvbiBhYm92ZS5cclxuICAgIC8vIE1ha2Ugc3VyZSB0aGF0IHRoZSBzcGVlZCBpcyBjb25zdHJhaW5lZCBhbmQgZ3JlYXRlciB0aGFuIHplcm8uXHJcbiAgICBjb25zdCBsaW1pdGVkVHJhbnNsYXRpb25TcGVlZCA9IE1hdGgubWluKCBNYXRoLmFicyggdHJhbnNsYXRpb25TcGVlZCApLCBNQVhfVFJBTlNMQVRJT05fU1BFRUQgKiB0aGlzLmdldEN1cnJlbnRTY2FsZSgpICk7XHJcbiAgICByZXR1cm4gbGltaXRlZFRyYW5zbGF0aW9uU3BlZWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldCBhbGwgdHJhbnNmb3JtYXRpb25zIG9uIHRoZSB0YXJnZXQgbm9kZSwgYW5kIHJlc2V0IGRlc3RpbmF0aW9uIHRhcmdldHMgdG8gc291cmNlIHZhbHVlcyB0byBwcmV2ZW50IGFueVxyXG4gICAqIGluIHByb2dyZXNzIGFuaW1hdGlvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgcmVzZXRUcmFuc2Zvcm0oKSB7XHJcbiAgICBzdXBlci5yZXNldFRyYW5zZm9ybSgpO1xyXG4gICAgdGhpcy5zdG9wSW5Qcm9ncmVzc0FuaW1hdGlvbigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBuZXh0IGRpc2NyZXRlIHNjYWxlIGZyb20gdGhlIGN1cnJlbnQgc2NhbGUuIFdpbGwgYmUgb25lIG9mIHRoZSBzY2FsZXMgYWxvbmcgdGhlIGRpc2NyZXRlU2NhbGVzIGxpc3RcclxuICAgKiBhbmQgbGltaXRlZCBieSB0aGUgbWluIGFuZCBtYXggc2NhbGVzIGFzc2lnbmVkIHRvIHRoaXMgTXVsdGlQYW5ab29tTGlzdGVuZXIuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gem9vbUluIC0gZGlyZWN0aW9uIG9mIHpvb20gY2hhbmdlLCBwb3NpdGl2ZSBpZiB6b29taW5nIGluXHJcbiAgICogQHJldHVybnMge251bWJlcn0gbnVtYmVyXHJcbiAgICovXHJcbiAgZ2V0TmV4dERpc2NyZXRlU2NhbGUoIHpvb21JbiApIHtcclxuXHJcbiAgICBjb25zdCBjdXJyZW50U2NhbGUgPSB0aGlzLmdldEN1cnJlbnRTY2FsZSgpO1xyXG5cclxuICAgIGxldCBuZWFyZXN0SW5kZXg7XHJcbiAgICBsZXQgZGlzdGFuY2VUb0N1cnJlbnRTY2FsZSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuZGlzY3JldGVTY2FsZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5hYnMoIHRoaXMuZGlzY3JldGVTY2FsZXNbIGkgXSAtIGN1cnJlbnRTY2FsZSApO1xyXG4gICAgICBpZiAoIGRpc3RhbmNlIDwgZGlzdGFuY2VUb0N1cnJlbnRTY2FsZSApIHtcclxuICAgICAgICBkaXN0YW5jZVRvQ3VycmVudFNjYWxlID0gZGlzdGFuY2U7XHJcbiAgICAgICAgbmVhcmVzdEluZGV4ID0gaTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBuZXh0SW5kZXggPSB6b29tSW4gPyBuZWFyZXN0SW5kZXggKyAxIDogbmVhcmVzdEluZGV4IC0gMTtcclxuICAgIG5leHRJbmRleCA9IFV0aWxzLmNsYW1wKCBuZXh0SW5kZXgsIDAsIHRoaXMuZGlzY3JldGVTY2FsZXMubGVuZ3RoIC0gMSApO1xyXG4gICAgcmV0dXJuIHRoaXMuZGlzY3JldGVTY2FsZXNbIG5leHRJbmRleCBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLmRpc3Bvc2VBbmltYXRlZFBhblpvb21MaXN0ZW5lcigpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEEgdHlwZSB0aGF0IGNvbnRhaW5zIHRoZSBpbmZvcm1hdGlvbiBuZWVkZWQgdG8gcmVzcG9uZCB0byBrZXlib2FyZCBpbnB1dC5cclxuICovXHJcbmNsYXNzIEtleVByZXNzIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtLZXlTdGF0ZVRyYWNrZXJ9IGtleVN0YXRlVHJhY2tlclxyXG4gICAqIEBwYXJhbSB7S2V5U3RhdGVUcmFja2VyfSBzY2FsZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0YXJnZXRTY2FsZSAtIHNjYWxlIGRlc2NyaWJpbmcgdGhlIHRhcmdldE5vZGUsIHNlZSBQYW5ab29tTGlzdGVuZXIuX3RhcmdldFNjYWxlXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqIEByZXR1cm5zIHtLZXlTdGF0ZVRyYWNrZXJ9XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGtleVN0YXRlVHJhY2tlciwgc2NhbGUsIHRhcmdldFNjYWxlLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLy8gbWFnbml0dWRlIGZvciB0cmFuc2xhdGlvbiB2ZWN0b3IgZm9yIHRoZSB0YXJnZXQgbm9kZSBhcyBsb25nIGFzIGFycm93IGtleXMgYXJlIGhlbGQgZG93blxyXG4gICAgICB0cmFuc2xhdGlvbk1hZ25pdHVkZTogODBcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBkZXRlcm1pbmUgcmVzdWx0aW5nIHRyYW5zbGF0aW9uXHJcbiAgICBsZXQgeERpcmVjdGlvbiA9IDA7XHJcbiAgICB4RGlyZWN0aW9uICs9IGtleVN0YXRlVHJhY2tlci5pc0tleURvd24oIEtleWJvYXJkVXRpbHMuS0VZX1JJR0hUX0FSUk9XICk7XHJcbiAgICB4RGlyZWN0aW9uIC09IGtleVN0YXRlVHJhY2tlci5pc0tleURvd24oIEtleWJvYXJkVXRpbHMuS0VZX0xFRlRfQVJST1cgKTtcclxuXHJcbiAgICBsZXQgeURpcmVjdGlvbiA9IDA7XHJcbiAgICB5RGlyZWN0aW9uICs9IGtleVN0YXRlVHJhY2tlci5pc0tleURvd24oIEtleWJvYXJkVXRpbHMuS0VZX0RPV05fQVJST1cgKTtcclxuICAgIHlEaXJlY3Rpb24gLT0ga2V5U3RhdGVUcmFja2VyLmlzS2V5RG93biggS2V5Ym9hcmRVdGlscy5LRVlfVVBfQVJST1cgKTtcclxuXHJcbiAgICAvLyBkb24ndCBzZXQgbWFnbml0dWRlIGlmIHplcm8gdmVjdG9yIChhcyB2ZWN0b3Igd2lsbCBiZWNvbWUgaWxsLWRlZmluZWQpXHJcbiAgICBzY3JhdGNoVHJhbnNsYXRpb25WZWN0b3Iuc2V0WFkoIHhEaXJlY3Rpb24sIHlEaXJlY3Rpb24gKTtcclxuICAgIGlmICggIXNjcmF0Y2hUcmFuc2xhdGlvblZlY3Rvci5lcXVhbHMoIFZlY3RvcjIuWkVSTyApICkge1xyXG4gICAgICBjb25zdCB0cmFuc2xhdGlvbk1hZ25pdHVkZSA9IG9wdGlvbnMudHJhbnNsYXRpb25NYWduaXR1ZGUgKiB0YXJnZXRTY2FsZTtcclxuICAgICAgc2NyYXRjaFRyYW5zbGF0aW9uVmVjdG9yLnNldE1hZ25pdHVkZSggdHJhbnNsYXRpb25NYWduaXR1ZGUgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gVGhlIHRyYW5zbGF0aW9uIGRlbHRhIHZlY3RvciB0aGF0IHNob3VsZCBiZSBhcHBsaWVkIHRvIHRoZSB0YXJnZXQgbm9kZSBpbiByZXNwb25zZVxyXG4gICAgLy8gdG8gdGhlIGtleSBwcmVzc2VzXHJcbiAgICB0aGlzLnRyYW5zbGF0aW9uVmVjdG9yID0gc2NyYXRjaFRyYW5zbGF0aW9uVmVjdG9yO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge251bWJlcn0gLSBkZXRlcm1pbmUgcmVzdWx0aW5nIHNjYWxlIGFuZCBzY2FsZSBwb2ludFxyXG4gICAgdGhpcy5zY2FsZSA9IHNjYWxlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tcHV0ZSB0aGUgdGFyZ2V0IHBvc2l0aW9uIGZvciBzY2FsaW5nIGZyb20gYSBrZXkgcHJlc3MuIFRoZSB0YXJnZXQgbm9kZSB3aWxsIGFwcGVhciB0byBnZXQgbGFyZ2VyIGFuZCB6b29tXHJcbiAgICogaW50byB0aGlzIHBvaW50LiBJZiBmb2N1cyBpcyB3aXRoaW4gdGhlIERpc3BsYXksIHdlIHpvb20gaW50byB0aGUgZm9jdXNlZCBub2RlLiBJZiBub3QgYW5kIGZvY3VzYWJsZSBjb250ZW50XHJcbiAgICogZXhpc3RzIGluIHRoZSBkaXNwbGF5LCB3ZSB6b29tIGludG8gdGhlIGZpcnN0IGZvY3VzYWJsZSBjb21wb25lbnQuIE90aGVyd2lzZSwgd2Ugem9vbSBpbnRvIHRoZSB0b3AgbGVmdCBjb3JuZXJcclxuICAgKiBvZiB0aGUgc2NyZWVuLlxyXG4gICAqXHJcbiAgICogVGhpcyBmdW5jdGlvbiBjb3VsZCBiZSBleHBlbnNpdmUsIHNvIHdlIG9ubHkgY2FsbCBpdCBpZiB3ZSBrbm93IHRoYXQgdGhlIGtleSBwcmVzcyBpcyBhIFwic2NhbGVcIiBnZXN0dXJlLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfSAtIGEgc2NyYXRjaCBWZWN0b3IyIGluc3RhbmNlIHdpdGggdGhlIHRhcmdldCBwb3N0aW9uXHJcbiAgICovXHJcbiAgY29tcHV0ZVNjYWxlVGFyZ2V0RnJvbUtleVByZXNzKCkge1xyXG5cclxuICAgIC8vIGRlZmF1bHQgY2F1c2UsIHNjYWxlIHRhcmdldCB3aWxsIGJlIG9yaWdpbiBvZiB0aGUgc2NyZWVuXHJcbiAgICBzY3JhdGNoU2NhbGVUYXJnZXRWZWN0b3Iuc2V0WFkoIDAsIDAgKTtcclxuXHJcbiAgICAvLyB6b29tIGludG8gdGhlIGZvY3VzZWQgTm9kZSBpZiBpdCBoYXMgZGVmaW5lZCBib3VuZHMsIGl0IG1heSBub3QgaWYgaXQgaXMgZm9yIGNvbnRyb2xsaW5nIHRoZVxyXG4gICAgLy8gdmlydHVhbCBjdXJzb3IgYW5kIGhhcyBhbiBpbnZpc2libGUgZm9jdXMgaGlnaGxpZ2h0XHJcbiAgICBjb25zdCBmb2N1cyA9IEZvY3VzTWFuYWdlci5wZG9tRm9jdXNQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGlmICggZm9jdXMgKSB7XHJcbiAgICAgIGNvbnN0IGZvY3VzVHJhaWwgPSBGb2N1c01hbmFnZXIucGRvbUZvY3VzUHJvcGVydHkudmFsdWUudHJhaWw7XHJcbiAgICAgIGNvbnN0IGZvY3VzZWROb2RlID0gZm9jdXNUcmFpbC5sYXN0Tm9kZSgpO1xyXG4gICAgICBpZiAoIGZvY3VzZWROb2RlLmJvdW5kcy5pc0Zpbml0ZSgpICkge1xyXG4gICAgICAgIHNjcmF0Y2hTY2FsZVRhcmdldFZlY3Rvci5zZXQoIGZvY3VzVHJhaWwucGFyZW50VG9HbG9iYWxQb2ludCggZm9jdXNlZE5vZGUuY2VudGVyICkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBubyBmb2N1c2FibGUgZWxlbWVudCBpbiB0aGUgRGlzcGxheSBzbyB0cnkgdG8gem9vbSBpbnRvIHRoZSBmaXJzdCBmb2N1c2FibGUgZWxlbWVudFxyXG4gICAgICBjb25zdCBmaXJzdEZvY3VzYWJsZSA9IFBET01VdGlscy5nZXROZXh0Rm9jdXNhYmxlKCk7XHJcbiAgICAgIGlmICggZmlyc3RGb2N1c2FibGUgIT09IGRvY3VtZW50LmJvZHkgKSB7XHJcblxyXG4gICAgICAgIC8vIGlmIG5vdCB0aGUgYm9keSwgZm9jdXNlZCBub2RlIHNob3VsZCBiZSBjb250YWluZWQgYnkgdGhlIGJvZHkgLSBlcnJvciBsb3VkbHkgaWYgdGhlIGJyb3dzZXIgcmVwb3J0c1xyXG4gICAgICAgIC8vIHRoYXQgdGhpcyBpcyBub3QgdGhlIGNhc2VcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkb2N1bWVudC5ib2R5LmNvbnRhaW5zKCBmaXJzdEZvY3VzYWJsZSApLCAnZm9jdXNhYmxlIHNob3VsZCBiZSBhdHRhY2hlZCB0byB0aGUgYm9keScgKTtcclxuXHJcbiAgICAgICAgLy8gYXNzdW1lcyB0aGF0IGZvY3VzYWJsZSBET00gZWxlbWVudHMgYXJlIGNvcnJlY3RseSBwb3NpdGlvbmVkLCB3aGljaCBzaG91bGQgYmUgdGhlIGNhc2UgLSBhbiBhbHRlcm5hdGl2ZVxyXG4gICAgICAgIC8vIGNvdWxkIGJlIHRvIHVzZSBEaXNwbGF0LmdldFRyYWlsRnJvbVBET01JbmRpY2VzU3RyaW5nKCksIGJ1dCB0aGF0IGZ1bmN0aW9uIHJlcXVpcmVzIGluZm9ybWF0aW9uIHRoYXQgaXMgbm90XHJcbiAgICAgICAgLy8gYXZhaWxhYmxlIGhlcmUuXHJcbiAgICAgICAgY29uc3QgY2VudGVyWCA9IGZpcnN0Rm9jdXNhYmxlLm9mZnNldExlZnQgKyBmaXJzdEZvY3VzYWJsZS5vZmZzZXRXaWR0aCAvIDI7XHJcbiAgICAgICAgY29uc3QgY2VudGVyWSA9IGZpcnN0Rm9jdXNhYmxlLm9mZnNldFRvcCArIGZpcnN0Rm9jdXNhYmxlLm9mZnNldEhlaWdodCAvIDI7XHJcbiAgICAgICAgc2NyYXRjaFNjYWxlVGFyZ2V0VmVjdG9yLnNldFhZKCBjZW50ZXJYLCBjZW50ZXJZICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzY3JhdGNoU2NhbGVUYXJnZXRWZWN0b3IuaXNGaW5pdGUoKSwgJ3RhcmdldCBwb3NpdGlvbiBub3QgZGVmaW5lZCcgKTtcclxuICAgIHJldHVybiBzY3JhdGNoU2NhbGVUYXJnZXRWZWN0b3I7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQSB0eXBlIHRoYXQgY29udGFpbnMgdGhlIGluZm9ybWF0aW9uIG5lZWRlZCB0byByZXNwb25kIHRvIGEgd2hlZWwgaW5wdXQuXHJcbiAqL1xyXG5jbGFzcyBXaGVlbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7U2NlbmVyeUV2ZW50fSBldmVudFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0YXJnZXRTY2FsZSAtIHNjYWxlIGRlc2NyaWJpbmcgdGhlIHRhcmdldE5vZGUsIHNlZSBQYW5ab29tTGlzdGVuZXIuX3RhcmdldFNjYWxlXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGV2ZW50LCB0YXJnZXRTY2FsZSApIHtcclxuICAgIGNvbnN0IGRvbUV2ZW50ID0gZXZlbnQuZG9tRXZlbnQ7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSAtIGlzIHRoZSBjdHJsIGtleSBkb3duIGR1cmluZyB0aGlzIHdoZWVsIGlucHV0PyBDYW5ub3QgdXNlIEtleVN0YXRlVHJhY2tlciBiZWNhdXNlIHRoZVxyXG4gICAgLy8gY3RybCBrZXkgbWlnaHQgYmUgJ2Rvd24nIG9uIHRoaXMgZXZlbnQgd2l0aG91dCBnb2luZyB0aHJvdWdoIHRoZSBrZXlib2FyZC4gRm9yIGV4YW1wbGUsIHdpdGggYSB0cmFja3BhZFxyXG4gICAgLy8gdGhlIGJyb3dzZXIgc2V0cyBjdHJsS2V5IHRydWUgd2l0aCB0aGUgem9vbSBnZXN0dXJlLlxyXG4gICAgdGhpcy5pc0N0cmxLZXlEb3duID0gZXZlbnQuZG9tRXZlbnQuY3RybEtleTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gbWFnbml0dWRlIGFuZCBkaXJlY3Rpb24gb2Ygc2NhbGUgY2hhbmdlIGZyb20gdGhlIHdoZWVsIGlucHV0XHJcbiAgICB0aGlzLnNjYWxlRGVsdGEgPSBkb21FdmVudC5kZWx0YVkgPiAwID8gLTAuNSA6IDAuNTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gdGhlIHRhcmdldCBvZiB0aGUgd2hlZWwgaW5wdXQgaW4gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lXHJcbiAgICB0aGlzLnRhcmdldFBvaW50ID0gZXZlbnQucG9pbnRlci5wb2ludDtcclxuXHJcbiAgICAvLyB0aGUgRE9NIEV2ZW50IHNwZWNpZmllcyBkZWx0YXMgdGhhdCBsb29rIGFwcHJvcHJpYXRlIGFuZCB3b3JrcyB3ZWxsIGluIGRpZmZlcmVudCBjYXNlcyBsaWtlXHJcbiAgICAvLyBtb3VzZSB3aGVlbCBhbmQgdHJhY2twYWQgaW5wdXQsIGJvdGggd2hpY2ggdHJpZ2dlciB3aGVlbCBldmVudHMgYnV0IGF0IGRpZmZlcmVudCByYXRlcyB3aXRoIGRpZmZlcmVudFxyXG4gICAgLy8gZGVsdGEgdmFsdWVzIC0gYnV0IHRoZXkgYXJlIGdlbmVyYWxseSB0b28gbGFyZ2UsIHJlZHVjaW5nIGEgYml0IGZlZWxzIG1vcmUgbmF0dXJhbCBhbmQgZ2l2ZXMgbW9yZSBjb250cm9sXHJcbiAgICBsZXQgdHJhbnNsYXRpb25YID0gZG9tRXZlbnQuZGVsdGFYICogMC41O1xyXG4gICAgbGV0IHRyYW5zbGF0aW9uWSA9IGRvbUV2ZW50LmRlbHRhWSAqIDAuNTtcclxuXHJcbiAgICAvLyBGaXJlRm94IGRlZmF1bHRzIHRvIHNjcm9sbGluZyBpbiB1bml0cyBvZiBcImxpbmVzXCIgcmF0aGVyIHRoYW4gcGl4ZWxzLCByZXN1bHRpbmcgaW4gc2xvdyBtb3ZlbWVudCAtIHNwZWVkIHVwXHJcbiAgICAvLyB0cmFuc2xhdGlvbiBpbiB0aGlzIGNhc2VcclxuICAgIGlmICggZG9tRXZlbnQuZGVsdGFNb2RlID09PSB3aW5kb3cuV2hlZWxFdmVudC5ET01fREVMVEFfTElORSApIHtcclxuICAgICAgdHJhbnNsYXRpb25YID0gdHJhbnNsYXRpb25YICogMjU7XHJcbiAgICAgIHRyYW5zbGF0aW9uWSA9IHRyYW5zbGF0aW9uWSAqIDI1O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSlcclxuICAgIHRoaXMudHJhbnNsYXRpb25WZWN0b3IgPSBzY3JhdGNoVHJhbnNsYXRpb25WZWN0b3Iuc2V0WFkoIHRyYW5zbGF0aW9uWCAqIHRhcmdldFNjYWxlLCB0cmFuc2xhdGlvblkgKiB0YXJnZXRTY2FsZSApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEEgcHJlc3MgZnJvbSBhIG1pZGRsZSBtb3VzZSBidXR0b24uIFdpbGwgaW5pdGlhdGUgcGFubmluZyBhbmQgZGVzdGluYXRpb24gcG9zaXRpb24gd2lsbCBiZSB1cGRhdGVkIGZvciBhcyBsb25nXHJcbiAqIGFzIHRoZSBQb2ludGVyIHBvaW50IGlzIGRyYWdnZWQgYXdheSBmcm9tIHRoZSBpbml0aWFsIHBvaW50LlxyXG4gKi9cclxuY2xhc3MgTWlkZGxlUHJlc3Mge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge01vdXNlfSBwb2ludGVyXHJcbiAgICogQHBhcmFtIHtUcmFpbH0gdHJhaWxcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcG9pbnRlciwgdHJhaWwgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb2ludGVyLnR5cGUgPT09ICdtb3VzZScsICdpbmNvcnJlY3QgcG9pbnRlciB0eXBlJyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLnBvaW50ZXIgPSBwb2ludGVyO1xyXG4gICAgdGhpcy50cmFpbCA9IHRyYWlsO1xyXG5cclxuICAgIC8vIHBvaW50IG9mIHByZXNzIGluIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZVxyXG4gICAgdGhpcy5pbml0aWFsUG9pbnQgPSBwb2ludGVyLnBvaW50LmNvcHkoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBIZWxwZXIgZnVuY3Rpb24sIGNhbGN1bGF0ZXMgZGlzY3JldGUgc2NhbGVzIGJldHdlZW4gbWluIGFuZCBtYXggc2NhbGUgbGltaXRzLiBDcmVhdGVzIGluY3JlYXNpbmcgc3RlcCBzaXplc1xyXG4gKiBzbyB0aGF0IHlvdSB6b29tIGluIGZyb20gaGlnaCB6b29tIHJlYWNoZXMgdGhlIG1heCBmYXN0ZXIgd2l0aCBmZXdlciBrZXkgcHJlc3Nlcy4gVGhpcyBpcyBzdGFuZGFyZCBiZWhhdmlvciBmb3JcclxuICogYnJvd3NlciB6b29tLlxyXG4gKlxyXG4gKiBAcGFyYW0ge251bWJlcn0gbWluU2NhbGVcclxuICogQHBhcmFtIHtudW1iZXJ9IG1heFNjYWxlXHJcbiAqIEByZXR1cm5zIHtBcnJheS48bnVtYmVyPn1cclxuICovXHJcbmNvbnN0IGNhbGN1bGF0ZURpc2NyZXRlU2NhbGVzID0gKCBtaW5TY2FsZSwgbWF4U2NhbGUgKSA9PiB7XHJcblxyXG4gIGFzc2VydCAmJiBhc3NlcnQoIG1pblNjYWxlID49IDEsICdtaW4gc2NhbGVzIGxlc3MgdGhhbiBvbmUgYXJlIGN1cnJlbnRseSBub3Qgc3VwcG9ydGVkJyApO1xyXG5cclxuICAvLyB3aWxsIHRha2UgdGhpcyBtYW55IGtleSBwcmVzc2VzIHRvIHJlYWNoIG1heGltdW0gc2NhbGUgZnJvbSBtaW5pbXVtIHNjYWxlXHJcbiAgY29uc3Qgc3RlcHMgPSA4O1xyXG5cclxuICAvLyBicmVhayB0aGUgcmFuZ2UgZnJvbSBtaW4gdG8gbWF4IHNjYWxlIGludG8gc3RlcHMsIHRoZW4gZXhwb25lbnRpYXRlXHJcbiAgY29uc3QgZGlzY3JldGVTY2FsZXMgPSBbXTtcclxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGVwczsgaSsrICkge1xyXG4gICAgZGlzY3JldGVTY2FsZXNbIGkgXSA9ICggbWF4U2NhbGUgLSBtaW5TY2FsZSApIC8gc3RlcHMgKiAoIGkgKiBpICk7XHJcbiAgfVxyXG5cclxuICAvLyBub3JtYWxpemUgc3RlcHMgYmFjayBpbnRvIHJhbmdlIG9mIHRoZSBtaW4gYW5kIG1heCBzY2FsZSBmb3IgdGhpcyBsaXN0ZW5lclxyXG4gIGNvbnN0IGRpc2NyZXRlU2NhbGVzTWF4ID0gZGlzY3JldGVTY2FsZXNbIHN0ZXBzIC0gMSBdO1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IGRpc2NyZXRlU2NhbGVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgZGlzY3JldGVTY2FsZXNbIGkgXSA9IG1pblNjYWxlICsgZGlzY3JldGVTY2FsZXNbIGkgXSAqICggbWF4U2NhbGUgLSBtaW5TY2FsZSApIC8gZGlzY3JldGVTY2FsZXNNYXg7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZGlzY3JldGVTY2FsZXM7XHJcbn07XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnQW5pbWF0ZWRQYW5ab29tTGlzdGVuZXInLCBBbmltYXRlZFBhblpvb21MaXN0ZW5lciApO1xyXG5leHBvcnQgZGVmYXVsdCBBbmltYXRlZFBhblpvb21MaXN0ZW5lcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxLQUFLLE1BQU0sMEJBQTBCO0FBQzVDLE9BQU9DLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsS0FBSyxNQUFNLGdDQUFnQztBQUNsRCxPQUFPQyxRQUFRLE1BQU0sbUNBQW1DO0FBQ3hELE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsWUFBWSxNQUFNLG9DQUFvQztBQUM3RCxPQUFPQyxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELFNBQVNDLE9BQU8sRUFBRUMsWUFBWSxFQUFFQyxxQkFBcUIsRUFBRUMsTUFBTSxFQUFFQyxvQkFBb0IsRUFBRUMsYUFBYSxFQUFFQyxpQkFBaUIsRUFBRUMsSUFBSSxFQUFFQyxlQUFlLEVBQUVDLFdBQVcsRUFBRUMsU0FBUyxFQUFFQyxhQUFhLEVBQUVDLE9BQU8sUUFBUSxlQUFlOztBQUVuTjtBQUNBLE1BQU1DLFdBQVcsR0FBRyxZQUFZO0FBQ2hDLE1BQU1DLG1CQUFtQixHQUFHLEdBQUcsQ0FBQyxDQUFDOztBQUVqQztBQUNBO0FBQ0E7QUFDQSxNQUFNQyxx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