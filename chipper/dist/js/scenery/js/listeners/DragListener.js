// Copyright 2017-2023, University of Colorado Boulder

/**
 * PressListener subtype customized for handling most drag-related listener needs.
 *
 * DragListener uses some specific terminology that is helpful to understand:
 *
 * - Drag target: The node whose trail is used for coordinate transforms. When a targetNode is specified, it will be the
 *                drag target. Otherwise, whatever was the currentTarget during event bubbling for the event that
 *                triggered press will be used (almost always the node that the listener is added to).
 * - Global coordinate frame: Coordinate frame of the Display (specifically its rootNode's local coordinate frame),
 *                            that in some applications will be screen coordinates.
 * - Parent coordinate frame: The parent coordinate frame of our drag target. Basically, it's the coordinate frame
 *                            you'd need to use to set dragTarget.translation = <parent coordinate frame point> for the
 *                            drag target to follow the pointer.
 * - Local coordinate frame: The local coordinate frame of our drag target, where (0,0) would be at the drag target's
 *                           origin.
 * - Model coordinate frame: Optionally defined by a model-view transform (treating the parent coordinate frame as the
 *                           view). When a transform is provided, it's the coordinate frame needed for setting
 *                           dragModelElement.position = <model coordinate frame point>. If a transform is not provided
 *                           (or overridden), it will be the same as the parent coordinate frame.
 *
 * The typical coordinate handling of DragListener is to:
 * 1. When a drag is started (with press), record the pointer's position in the local coordinate frame. This is visually
 *    where the pointer is over the drag target, and typically most drags will want to move the dragged element so that
 *    the pointer continues to be over this point.
 * 2. When the pointer is moved, compute the new parent translation to keep the pointer on the same place on the
 *    dragged element.
 * 3. (optionally) map that to a model position, and (optionally) move that model position to satisfy any constraints of
 *    where the element can be dragged (recomputing the parent/model translation as needed)
 * 4. Apply the required translation (with a provided drag callback, using the positionProperty, or directly
 *    transforming the Node if translateNode:true).
 *
 * For example usage, see scenery/examples/input.html
 *
 * For most PhET model-view usage, it's recommended to include a model position Property as the `positionProperty`
 * option, along with the `transform` option specifying the MVT. By default, this will then assume that the Node with
 * the listener is positioned in the "view" coordinate frame, and will properly handle offsets and transformations.
 * It is assumed that when the model `positionProperty` changes, that the position of the Node would also change.
 * If it's another Node being transformed, please use the `targetNode` option to specify which Node is being
 * transformed. If something more complicated than a Node being transformed is going on (like positioning multiple
 * items, positioning based on the center, changing something in CanvasNode), it's recommended to pass the
 * `useParentOffset` option (so that the DragListener will NOT try to compute offsets based on the Node's position), or
 * to use `applyOffset:false` (effectively having drags reposition the Node so that the origin is at the pointer).
 *
 * The typical PhET usage would look like:
 *
 *   new DragListener( {
 *     positionProperty: someObject.positionProperty,
 *     transform: modelViewTransform
 *   } )
 *
 * Additionally, for PhET usage it's also fine NOT to hook into a `positionProperty`. Typically using start/end/drag,
 * and values can be read out (like `modelPoint`, `localPoint`, `parentPoint`, `modelDelta`) from the listener to do
 * operations. For instance, if deltas and model positions are the only thing desired:
 *
 *   new DragListener( {
 *     drag: ( event, listener ) => {
 *       doSomethingWith( listener.modelDelta, listener.modelPoint );
 *     }
 *   } )
 *
 * It's completely fine to use one DragListener with multiple objects, however this isn't done as much since specifying
 * positionProperty only works with ONE model position Property (so if things are backed by the same Property it would
 * be fine). Doing things based on modelPoint/modelDelta/etc. should be completely fine using one listener with
 * multiple nodes. The typical pattern IS creating one DragListener per draggable view Node.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import PhetioAction from '../../../tandem/js/PhetioAction.js';
import Transform3 from '../../../dot/js/Transform3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import optionize from '../../../phet-core/js/optionize.js';
import EventType from '../../../tandem/js/EventType.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { PressListener, scenery, SceneryEvent, TransformTracker } from '../imports.js';
import Property from '../../../axon/js/Property.js';

// Scratch vectors used to prevent allocations
const scratchVector2A = new Vector2(0, 0);
const isPressedListener = listener => listener.isPressed;
export default class DragListener extends PressListener {
  // Alias for isPressedProperty (as this name makes more sense for dragging)

  // The point of the drag in the target's global coordinate frame. Updated with mutation.

  // The point of the drag in the target's local coordinate frame. Updated with mutation.

  // Current drag point in the parent coordinate frame. Updated with mutation.

  // Current drag point in the model coordinate frame

  // Stores the model delta computed during every repositioning

  // If useParentOffset is true, this will be set to the parent-coordinate offset at the start
  // of a drag, and the "offset" will be handled by applying this offset compared to where the pointer is.
  // Handles watching ancestor transforms for callbacks.
  // Listener passed to the transform tracker
  // There are cases like https://github.com/phetsims/equality-explorer/issues/97 where if
  // a touchenter starts a drag that is IMMEDIATELY interrupted, the touchdown would start another drag. We record
  // interruptions here so that we can prevent future enter/down events from the same touch pointer from triggering
  // another startDrag.
  // Emitted on drag. Used for triggering phet-io events to the data stream, see https://github.com/phetsims/scenery/issues/842
  constructor(providedOptions) {
    const options = optionize()({
      positionProperty: null,
      start: null,
      end: null,
      transform: null,
      dragBoundsProperty: null,
      allowTouchSnag: true,
      applyOffset: true,
      useParentOffset: false,
      trackAncestors: false,
      translateNode: false,
      mapPosition: null,
      offsetPosition: null,
      canClick: false,
      tandem: Tandem.REQUIRED,
      // Though DragListener is not instrumented, declare these here to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60.
      // DragListener by default doesn't allow PhET-iO to trigger drag Action events
      phetioReadOnly: true,
      phetioFeatured: PhetioObject.DEFAULT_OPTIONS.phetioFeatured
    }, providedOptions);
    assert && assert(!options.dragBounds, 'options.dragBounds was removed in favor of options.dragBoundsProperty');
    assert && assert(!options.useParentOffset || options.positionProperty, 'If useParentOffset is set, a positionProperty is required');
    assert && assert(!(options.mapPosition && options.dragBoundsProperty), 'Only one of mapPosition and dragBoundsProperty can be provided, as they handle mapping of the drag point');

    // @ts-expect-error TODO: See https://github.com/phetsims/phet-core/issues/128
    super(options);
    this._allowTouchSnag = options.allowTouchSnag;
    this._applyOffset = options.applyOffset;
    this._useParentOffset = options.useParentOffset;
    this._trackAncestors = options.trackAncestors;
    this._translateNode = options.translateNode;
    this._transform = options.transform;
    this._positionProperty = options.positionProperty;
    this._mapPosition = options.mapPosition;
    this._offsetPosition = options.offsetPosition;
    this._dragBoundsProperty = options.dragBoundsProperty || new Property(null);
    this._start = options.start;
    this._end = options.end;
    this._canClick = options.canClick;
    this.isUserControlledProperty = this.isPressedProperty;
    this._globalPoint = new Vector2(0, 0);
    this._localPoint = new Vector2(0, 0);
    this._parentPoint = new Vector2(0, 0);
    this._modelPoint = new Vector2(0, 0);
    this._modelDelta = new Vector2(0, 0);
    this._parentOffset = new Vector2(0, 0);
    this._transformTracker = null;
    this._transformTrackerListener = this.ancestorTransformed.bind(this);
    this._lastInterruptedTouchLikePointer = null;
    this._dragAction = new PhetioAction(event => {
      assert && assert(isPressedListener(this));
      const pressedListener = this;
      const point = pressedListener.pointer.point;
      if (point) {
        // This is done first, before the drag listener is called (from the prototype drag call)
        if (!this._globalPoint.equals(point)) {
          this.reposition(point);
        }
      }
      PressListener.prototype.drag.call(this, event);
    }, {
      parameters: [{
        name: 'event',
        phetioType: SceneryEvent.SceneryEventIO
      }],
      phetioFeatured: options.phetioFeatured,
      tandem: options.tandem.createTandem('dragAction'),
      phetioHighFrequency: true,
      phetioDocumentation: 'Emits whenever a drag occurs with an SceneryEventIO argument.',
      phetioReadOnly: options.phetioReadOnly,
      phetioEventType: EventType.USER
    });
  }

  /**
   * Attempts to start a drag with a press.
   *
   * NOTE: This is safe to call externally in order to attempt to start a press. dragListener.canPress( event ) can
   * be used to determine whether this will actually start a drag.
   *
   * @param event
   * @param [targetNode] - If provided, will take the place of the targetNode for this call. Useful for forwarded presses.
   * @param [callback] - to be run at the end of the function, but only on success
   * @returns success - Returns whether the press was actually started
   */
  press(event, targetNode, callback) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DragListener press');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    const success = super.press(event, targetNode, () => {
      sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DragListener successful press');
      sceneryLog && sceneryLog.InputListener && sceneryLog.push();
      assert && assert(isPressedListener(this));
      const pressedListener = this;

      // signify that this listener is reserved for dragging so that other listeners can change
      // their behavior during scenery event dispatch
      pressedListener.pointer.reserveForDrag();
      this.attachTransformTracker();
      assert && assert(pressedListener.pointer.point !== null);
      const point = pressedListener.pointer.point;

      // Compute the parent point corresponding to the pointer's position
      const parentPoint = this.globalToParentPoint(this._localPoint.set(point));
      if (this._useParentOffset) {
        this.modelToParentPoint(this._parentOffset.set(this._positionProperty.value)).subtract(parentPoint);
      }

      // Set the local point
      this.parentToLocalPoint(parentPoint);
      this.reposition(point);

      // Notify after positioning and other changes
      this._start && this._start(event, pressedListener);
      callback && callback();
      sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    });
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    return success;
  }

  /**
   * Stops the drag.
   *
   * This can be called from the outside to stop the drag without the pointer having actually fired any 'up'
   * events. If the cancel/interrupt behavior is more preferable, call interrupt() on this listener instead.
   *
   * @param [event] - scenery event if there was one
   * @param [callback] - called at the end of the release
   */
  release(event, callback) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DragListener release');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    super.release(event, () => {
      this.detachTransformTracker();

      // Notify after the rest of release is called in order to prevent it from triggering interrupt().
      this._end && this._end(event || null, this);
      callback && callback();
    });
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Components using DragListener should generally not be activated with a click. A single click from alternative
   * input would pick up the component then immediately release it. But occasionally that is desirable and can be
   * controlled with the canClick option.
   */
  canClick() {
    return super.canClick() && this._canClick;
  }

  /**
   * Activate the DragListener with a click activation. Usually, DragListener will NOT be activated with a click
   * and canClick will return false. Components that can be dragged usually should not be picked up/released
   * from a single click event that may have even come from event bubbling. But it can be optionally allowed for some
   * components that have drag functionality but can still be activated with a single click event.
   * (scenery-internal) (part of the scenery listener API)
   */
  click(event, callback) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DragListener click');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    const success = super.click(event, () => {
      sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DragListener successful press');
      sceneryLog && sceneryLog.InputListener && sceneryLog.push();

      // notify that we have started a change
      this._start && this._start(event, this);
      callback && callback();

      // notify that we have finished a 'drag' activation through click
      this._end && this._end(event, this);
      sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    });
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    return success;
  }

  /**
   * Called when move events are fired on the attached pointer listener during a drag.
   */
  drag(event) {
    assert && assert(isPressedListener(this));
    const pressedListener = this;
    const point = pressedListener.pointer.point;

    // Ignore global moves that have zero length (Chrome might autofire, see
    // https://code.google.com/p/chromium/issues/detail?id=327114)
    if (!point || this._globalPoint.equals(point)) {
      return;
    }
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DragListener drag');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    this._dragAction.execute(event);
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Attempts to start a touch snag, given a SceneryEvent.
   *
   * Should be safe to be called externally with an event.
   */
  tryTouchSnag(event) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DragListener tryTouchSnag');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    if (this._allowTouchSnag && (!this.attach || !event.pointer.isAttached())) {
      this.press(event);
    }
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Returns a defensive copy of the local-coordinate-frame point of the drag.
   */
  getGlobalPoint() {
    return this._globalPoint.copy();
  }
  get globalPoint() {
    return this.getGlobalPoint();
  }

  /**
   * Returns a defensive copy of the local-coordinate-frame point of the drag.
   */
  getLocalPoint() {
    return this._localPoint.copy();
  }
  get localPoint() {
    return this.getLocalPoint();
  }

  /**
   * Returns a defensive copy of the parent-coordinate-frame point of the drag.
   */
  getParentPoint() {
    return this._parentPoint.copy();
  }
  get parentPoint() {
    return this.getParentPoint();
  }

  /**
   * Returns a defensive copy of the model-coordinate-frame point of the drag.
   */
  getModelPoint() {
    return this._modelPoint.copy();
  }
  get modelPoint() {
    return this.getModelPoint();
  }

  /**
   * Returns a defensive copy of the model-coordinate-frame delta.
   */
  getModelDelta() {
    return this._modelDelta.copy();
  }
  get modelDelta() {
    return this.getModelDelta();
  }

  /**
   * Maps a point from the global coordinate frame to our drag target's parent coordinate frame.
   *
   * NOTE: This mutates the input vector (for performance)
   *
   * Should be overridden if a custom transformation is needed.
   */
  globalToParentPoint(globalPoint) {
    assert && assert(isPressedListener(this));
    const pressedListener = this;
    let referenceResult;
    if (assert) {
      referenceResult = pressedListener.pressedTrail.globalToParentPoint(globalPoint);
    }
    pressedListener.pressedTrail.getParentTransform().getInverse().multiplyVector2(globalPoint);
    assert && assert(globalPoint.equals(referenceResult));
    return globalPoint;
  }

  /**
   * Maps a point from the drag target's parent coordinate frame to its local coordinate frame.
   *
   * NOTE: This mutates the input vector (for performance)
   *
   * Should be overridden if a custom transformation is needed.
   */
  parentToLocalPoint(parentPoint) {
    assert && assert(isPressedListener(this));
    const pressedListener = this;
    let referenceResult;
    if (assert) {
      referenceResult = pressedListener.pressedTrail.lastNode().parentToLocalPoint(parentPoint);
    }
    pressedListener.pressedTrail.lastNode().getTransform().getInverse().multiplyVector2(parentPoint);
    assert && assert(parentPoint.equals(referenceResult));
    return parentPoint;
  }

  /**
   * Maps a point from the drag target's local coordinate frame to its parent coordinate frame.
   *
   * NOTE: This mutates the input vector (for performance)
   *
   * Should be overridden if a custom transformation is needed.
   */
  localToParentPoint(localPoint) {
    assert && assert(isPressedListener(this));
    const pressedListener = this;
    let referenceResult;
    if (assert) {
      referenceResult = pressedListener.pressedTrail.lastNode().localToParentPoint(localPoint);
    }
    pressedListener.pressedTrail.lastNode().getMatrix().multiplyVector2(localPoint);
    assert && assert(localPoint.equals(referenceResult));
    return localPoint;
  }

  /**
   * Maps a point from the drag target's parent coordinate frame to the model coordinate frame.
   *
   * NOTE: This mutates the input vector (for performance)
   *
   * Should be overridden if a custom transformation is needed. Note that by default, unless a transform is provided,
   * the parent coordinate frame will be the same as the model coordinate frame.
   */
  parentToModelPoint(parentPoint) {
    if (this._transform) {
      const transform = this._transform instanceof Transform3 ? this._transform : this._transform.value;
      transform.getInverse().multiplyVector2(parentPoint);
    }
    return parentPoint;
  }

  /**
   * Maps a point from the model coordinate frame to the drag target's parent coordinate frame.
   *
   * NOTE: This mutates the input vector (for performance)
   *
   * Should be overridden if a custom transformation is needed. Note that by default, unless a transform is provided,
   * the parent coordinate frame will be the same as the model coordinate frame.
   */
  modelToParentPoint(modelPoint) {
    if (this._transform) {
      const transform = this._transform instanceof Transform3 ? this._transform : this._transform.value;
      transform.getMatrix().multiplyVector2(modelPoint);
    }
    return modelPoint;
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
   * Mutates the parentPoint given to account for the initial pointer's offset from the drag target's origin.
   */
  applyParentOffset(parentPoint) {
    if (this._offsetPosition) {
      parentPoint.add(this._offsetPosition(parentPoint, this));
    }

    // Don't apply any offset if applyOffset is false
    if (this._applyOffset) {
      if (this._useParentOffset) {
        parentPoint.add(this._parentOffset);
      } else {
        // Add the difference between our local origin (in the parent coordinate frame) and the local point (in the same
        // parent coordinate frame).
        parentPoint.subtract(this.localToParentPoint(scratchVector2A.set(this._localPoint)));
        parentPoint.add(this.localToParentPoint(scratchVector2A.setXY(0, 0)));
      }
    }
  }

  /**
   * Triggers an update of the drag position, potentially changing position properties.
   *
   * Should be called when something that changes the output positions of the drag occurs (most often, a drag event
   * itself).
   */
  reposition(globalPoint) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DragListener reposition');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    assert && assert(isPressedListener(this));
    const pressedListener = this;
    this._globalPoint.set(globalPoint);

    // Update parentPoint mutably.
    this.applyParentOffset(this.globalToParentPoint(this._parentPoint.set(globalPoint)));

    // To compute the delta (new - old), we first mutate it to (-old)
    this._modelDelta.set(this._modelPoint).negate();

    // Compute the modelPoint from the parentPoint
    this._modelPoint.set(this.mapModelPoint(this.parentToModelPoint(scratchVector2A.set(this._parentPoint))));

    // Complete the delta computation
    this._modelDelta.add(this._modelPoint);

    // Apply any mapping changes back to the parent point
    this.modelToParentPoint(this._parentPoint.set(this._modelPoint));
    if (this._translateNode) {
      pressedListener.pressedTrail.lastNode().translation = this._parentPoint;
    }
    if (this._positionProperty) {
      this._positionProperty.value = this._modelPoint.copy(); // Include an extra reference so that it will change.
    }

    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Called with 'touchenter' events (part of the listener API). (scenery-internal)
   *
   * NOTE: Do not call directly. See the press method instead.
   */
  touchenter(event) {
    if (event.pointer.isDownProperty.value) {
      this.tryTouchSnag(event);
    }
  }

  /**
   * Called with 'touchmove' events (part of the listener API). (scenery-internal)
   *
   * NOTE: Do not call directly. See the press method instead.
   */
  touchmove(event) {
    this.tryTouchSnag(event);
  }

  /**
   * Called when an ancestor's transform has changed (when trackAncestors is true).
   */
  ancestorTransformed() {
    assert && assert(isPressedListener(this));
    const pressedListener = this;
    const point = pressedListener.pointer.point;
    if (point) {
      // Reposition based on the current point.
      this.reposition(point);
    }
  }

  /**
   * Attaches our transform tracker (begins listening to the ancestor transforms)
   */
  attachTransformTracker() {
    assert && assert(isPressedListener(this));
    const pressedListener = this;
    if (this._trackAncestors) {
      this._transformTracker = new TransformTracker(pressedListener.pressedTrail.copy().removeDescendant());
      this._transformTracker.addListener(this._transformTrackerListener);
    }
  }

  /**
   * Detaches our transform tracker (stops listening to the ancestor transforms)
   */
  detachTransformTracker() {
    if (this._transformTracker) {
      this._transformTracker.removeListener(this._transformTrackerListener);
      this._transformTracker.dispose();
      this._transformTracker = null;
    }
  }

  /**
   * Returns the drag bounds of the listener.
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
   * Interrupts the listener, releasing it (canceling behavior).
   *
   * This effectively releases/ends the press, and sets the `interrupted` flag to true while firing these events
   * so that code can determine whether a release/end happened naturally, or was canceled in some way.
   *
   * This can be called manually, but can also be called through node.interruptSubtreeInput().
   */
  interrupt() {
    if (this.pointer && this.pointer.isTouchLike()) {
      this._lastInterruptedTouchLikePointer = this.pointer;
    }
    super.interrupt();
  }

  /**
   * Returns whether a press can be started with a particular event.
   */
  canPress(event) {
    if (event.pointer === this._lastInterruptedTouchLikePointer) {
      return false;
    }
    return super.canPress(event);
  }

  /**
   * Disposes the listener, releasing references. It should not be used after this.
   */
  dispose() {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DragListener dispose');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    this._dragAction.dispose();
    this.detachTransformTracker();
    super.dispose();
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Creates an input listener that forwards events to the specified input listener. The target listener should
   * probably be using PressListener.options.targetNode so that the forwarded drag has the correct Trail
   *
   * See https://github.com/phetsims/scenery/issues/639
   */
  static createForwardingListener(down, providedOptions) {
    const options = optionize()({
      allowTouchSnag: true // see https://github.com/phetsims/scenery/issues/999
    }, providedOptions);
    return {
      down(event) {
        if (event.canStartPress()) {
          down(event);
        }
      },
      touchenter(event) {
        options.allowTouchSnag && this.down(event);
      },
      touchmove(event) {
        options.allowTouchSnag && this.down(event);
      }
    };
  }
}
scenery.register('DragListener', DragListener);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0aW9BY3Rpb24iLCJUcmFuc2Zvcm0zIiwiVmVjdG9yMiIsIm9wdGlvbml6ZSIsIkV2ZW50VHlwZSIsIlBoZXRpb09iamVjdCIsIlRhbmRlbSIsIlByZXNzTGlzdGVuZXIiLCJzY2VuZXJ5IiwiU2NlbmVyeUV2ZW50IiwiVHJhbnNmb3JtVHJhY2tlciIsIlByb3BlcnR5Iiwic2NyYXRjaFZlY3RvcjJBIiwiaXNQcmVzc2VkTGlzdGVuZXIiLCJsaXN0ZW5lciIsImlzUHJlc3NlZCIsIkRyYWdMaXN0ZW5lciIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInBvc2l0aW9uUHJvcGVydHkiLCJzdGFydCIsImVuZCIsInRyYW5zZm9ybSIsImRyYWdCb3VuZHNQcm9wZXJ0eSIsImFsbG93VG91Y2hTbmFnIiwiYXBwbHlPZmZzZXQiLCJ1c2VQYXJlbnRPZmZzZXQiLCJ0cmFja0FuY2VzdG9ycyIsInRyYW5zbGF0ZU5vZGUiLCJtYXBQb3NpdGlvbiIsIm9mZnNldFBvc2l0aW9uIiwiY2FuQ2xpY2siLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInBoZXRpb1JlYWRPbmx5IiwicGhldGlvRmVhdHVyZWQiLCJERUZBVUxUX09QVElPTlMiLCJhc3NlcnQiLCJkcmFnQm91bmRzIiwiX2FsbG93VG91Y2hTbmFnIiwiX2FwcGx5T2Zmc2V0IiwiX3VzZVBhcmVudE9mZnNldCIsIl90cmFja0FuY2VzdG9ycyIsIl90cmFuc2xhdGVOb2RlIiwiX3RyYW5zZm9ybSIsIl9wb3NpdGlvblByb3BlcnR5IiwiX21hcFBvc2l0aW9uIiwiX29mZnNldFBvc2l0aW9uIiwiX2RyYWdCb3VuZHNQcm9wZXJ0eSIsIl9zdGFydCIsIl9lbmQiLCJfY2FuQ2xpY2siLCJpc1VzZXJDb250cm9sbGVkUHJvcGVydHkiLCJpc1ByZXNzZWRQcm9wZXJ0eSIsIl9nbG9iYWxQb2ludCIsIl9sb2NhbFBvaW50IiwiX3BhcmVudFBvaW50IiwiX21vZGVsUG9pbnQiLCJfbW9kZWxEZWx0YSIsIl9wYXJlbnRPZmZzZXQiLCJfdHJhbnNmb3JtVHJhY2tlciIsIl90cmFuc2Zvcm1UcmFja2VyTGlzdGVuZXIiLCJhbmNlc3RvclRyYW5zZm9ybWVkIiwiYmluZCIsIl9sYXN0SW50ZXJydXB0ZWRUb3VjaExpa2VQb2ludGVyIiwiX2RyYWdBY3Rpb24iLCJldmVudCIsInByZXNzZWRMaXN0ZW5lciIsInBvaW50IiwicG9pbnRlciIsImVxdWFscyIsInJlcG9zaXRpb24iLCJwcm90b3R5cGUiLCJkcmFnIiwiY2FsbCIsInBhcmFtZXRlcnMiLCJuYW1lIiwicGhldGlvVHlwZSIsIlNjZW5lcnlFdmVudElPIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvSGlnaEZyZXF1ZW5jeSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJwaGV0aW9FdmVudFR5cGUiLCJVU0VSIiwicHJlc3MiLCJ0YXJnZXROb2RlIiwiY2FsbGJhY2siLCJzY2VuZXJ5TG9nIiwiSW5wdXRMaXN0ZW5lciIsInB1c2giLCJzdWNjZXNzIiwicmVzZXJ2ZUZvckRyYWciLCJhdHRhY2hUcmFuc2Zvcm1UcmFja2VyIiwicGFyZW50UG9pbnQiLCJnbG9iYWxUb1BhcmVudFBvaW50Iiwic2V0IiwibW9kZWxUb1BhcmVudFBvaW50IiwidmFsdWUiLCJzdWJ0cmFjdCIsInBhcmVudFRvTG9jYWxQb2ludCIsInBvcCIsInJlbGVhc2UiLCJkZXRhY2hUcmFuc2Zvcm1UcmFja2VyIiwiY2xpY2siLCJleGVjdXRlIiwidHJ5VG91Y2hTbmFnIiwiYXR0YWNoIiwiaXNBdHRhY2hlZCIsImdldEdsb2JhbFBvaW50IiwiY29weSIsImdsb2JhbFBvaW50IiwiZ2V0TG9jYWxQb2ludCIsImxvY2FsUG9pbnQiLCJnZXRQYXJlbnRQb2ludCIsImdldE1vZGVsUG9pbnQiLCJtb2RlbFBvaW50IiwiZ2V0TW9kZWxEZWx0YSIsIm1vZGVsRGVsdGEiLCJyZWZlcmVuY2VSZXN1bHQiLCJwcmVzc2VkVHJhaWwiLCJnZXRQYXJlbnRUcmFuc2Zvcm0iLCJnZXRJbnZlcnNlIiwibXVsdGlwbHlWZWN0b3IyIiwibGFzdE5vZGUiLCJnZXRUcmFuc2Zvcm0iLCJsb2NhbFRvUGFyZW50UG9pbnQiLCJnZXRNYXRyaXgiLCJwYXJlbnRUb01vZGVsUG9pbnQiLCJtYXBNb2RlbFBvaW50IiwiY2xvc2VzdFBvaW50VG8iLCJhcHBseVBhcmVudE9mZnNldCIsImFkZCIsInNldFhZIiwibmVnYXRlIiwidHJhbnNsYXRpb24iLCJ0b3VjaGVudGVyIiwiaXNEb3duUHJvcGVydHkiLCJ0b3VjaG1vdmUiLCJyZW1vdmVEZXNjZW5kYW50IiwiYWRkTGlzdGVuZXIiLCJyZW1vdmVMaXN0ZW5lciIsImRpc3Bvc2UiLCJnZXREcmFnQm91bmRzIiwic2V0VHJhbnNmb3JtIiwiaW50ZXJydXB0IiwiaXNUb3VjaExpa2UiLCJjYW5QcmVzcyIsImNyZWF0ZUZvcndhcmRpbmdMaXN0ZW5lciIsImRvd24iLCJjYW5TdGFydFByZXNzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEcmFnTGlzdGVuZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUHJlc3NMaXN0ZW5lciBzdWJ0eXBlIGN1c3RvbWl6ZWQgZm9yIGhhbmRsaW5nIG1vc3QgZHJhZy1yZWxhdGVkIGxpc3RlbmVyIG5lZWRzLlxyXG4gKlxyXG4gKiBEcmFnTGlzdGVuZXIgdXNlcyBzb21lIHNwZWNpZmljIHRlcm1pbm9sb2d5IHRoYXQgaXMgaGVscGZ1bCB0byB1bmRlcnN0YW5kOlxyXG4gKlxyXG4gKiAtIERyYWcgdGFyZ2V0OiBUaGUgbm9kZSB3aG9zZSB0cmFpbCBpcyB1c2VkIGZvciBjb29yZGluYXRlIHRyYW5zZm9ybXMuIFdoZW4gYSB0YXJnZXROb2RlIGlzIHNwZWNpZmllZCwgaXQgd2lsbCBiZSB0aGVcclxuICogICAgICAgICAgICAgICAgZHJhZyB0YXJnZXQuIE90aGVyd2lzZSwgd2hhdGV2ZXIgd2FzIHRoZSBjdXJyZW50VGFyZ2V0IGR1cmluZyBldmVudCBidWJibGluZyBmb3IgdGhlIGV2ZW50IHRoYXRcclxuICogICAgICAgICAgICAgICAgdHJpZ2dlcmVkIHByZXNzIHdpbGwgYmUgdXNlZCAoYWxtb3N0IGFsd2F5cyB0aGUgbm9kZSB0aGF0IHRoZSBsaXN0ZW5lciBpcyBhZGRlZCB0bykuXHJcbiAqIC0gR2xvYmFsIGNvb3JkaW5hdGUgZnJhbWU6IENvb3JkaW5hdGUgZnJhbWUgb2YgdGhlIERpc3BsYXkgKHNwZWNpZmljYWxseSBpdHMgcm9vdE5vZGUncyBsb2NhbCBjb29yZGluYXRlIGZyYW1lKSxcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdCBpbiBzb21lIGFwcGxpY2F0aW9ucyB3aWxsIGJlIHNjcmVlbiBjb29yZGluYXRlcy5cclxuICogLSBQYXJlbnQgY29vcmRpbmF0ZSBmcmFtZTogVGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lIG9mIG91ciBkcmFnIHRhcmdldC4gQmFzaWNhbGx5LCBpdCdzIHRoZSBjb29yZGluYXRlIGZyYW1lXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlvdSdkIG5lZWQgdG8gdXNlIHRvIHNldCBkcmFnVGFyZ2V0LnRyYW5zbGF0aW9uID0gPHBhcmVudCBjb29yZGluYXRlIGZyYW1lIHBvaW50PiBmb3IgdGhlXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYWcgdGFyZ2V0IHRvIGZvbGxvdyB0aGUgcG9pbnRlci5cclxuICogLSBMb2NhbCBjb29yZGluYXRlIGZyYW1lOiBUaGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSBvZiBvdXIgZHJhZyB0YXJnZXQsIHdoZXJlICgwLDApIHdvdWxkIGJlIGF0IHRoZSBkcmFnIHRhcmdldCdzXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luLlxyXG4gKiAtIE1vZGVsIGNvb3JkaW5hdGUgZnJhbWU6IE9wdGlvbmFsbHkgZGVmaW5lZCBieSBhIG1vZGVsLXZpZXcgdHJhbnNmb3JtICh0cmVhdGluZyB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUgYXMgdGhlXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldykuIFdoZW4gYSB0cmFuc2Zvcm0gaXMgcHJvdmlkZWQsIGl0J3MgdGhlIGNvb3JkaW5hdGUgZnJhbWUgbmVlZGVkIGZvciBzZXR0aW5nXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ01vZGVsRWxlbWVudC5wb3NpdGlvbiA9IDxtb2RlbCBjb29yZGluYXRlIGZyYW1lIHBvaW50Pi4gSWYgYSB0cmFuc2Zvcm0gaXMgbm90IHByb3ZpZGVkXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgKG9yIG92ZXJyaWRkZW4pLCBpdCB3aWxsIGJlIHRoZSBzYW1lIGFzIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZS5cclxuICpcclxuICogVGhlIHR5cGljYWwgY29vcmRpbmF0ZSBoYW5kbGluZyBvZiBEcmFnTGlzdGVuZXIgaXMgdG86XHJcbiAqIDEuIFdoZW4gYSBkcmFnIGlzIHN0YXJ0ZWQgKHdpdGggcHJlc3MpLCByZWNvcmQgdGhlIHBvaW50ZXIncyBwb3NpdGlvbiBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZS4gVGhpcyBpcyB2aXN1YWxseVxyXG4gKiAgICB3aGVyZSB0aGUgcG9pbnRlciBpcyBvdmVyIHRoZSBkcmFnIHRhcmdldCwgYW5kIHR5cGljYWxseSBtb3N0IGRyYWdzIHdpbGwgd2FudCB0byBtb3ZlIHRoZSBkcmFnZ2VkIGVsZW1lbnQgc28gdGhhdFxyXG4gKiAgICB0aGUgcG9pbnRlciBjb250aW51ZXMgdG8gYmUgb3ZlciB0aGlzIHBvaW50LlxyXG4gKiAyLiBXaGVuIHRoZSBwb2ludGVyIGlzIG1vdmVkLCBjb21wdXRlIHRoZSBuZXcgcGFyZW50IHRyYW5zbGF0aW9uIHRvIGtlZXAgdGhlIHBvaW50ZXIgb24gdGhlIHNhbWUgcGxhY2Ugb24gdGhlXHJcbiAqICAgIGRyYWdnZWQgZWxlbWVudC5cclxuICogMy4gKG9wdGlvbmFsbHkpIG1hcCB0aGF0IHRvIGEgbW9kZWwgcG9zaXRpb24sIGFuZCAob3B0aW9uYWxseSkgbW92ZSB0aGF0IG1vZGVsIHBvc2l0aW9uIHRvIHNhdGlzZnkgYW55IGNvbnN0cmFpbnRzIG9mXHJcbiAqICAgIHdoZXJlIHRoZSBlbGVtZW50IGNhbiBiZSBkcmFnZ2VkIChyZWNvbXB1dGluZyB0aGUgcGFyZW50L21vZGVsIHRyYW5zbGF0aW9uIGFzIG5lZWRlZClcclxuICogNC4gQXBwbHkgdGhlIHJlcXVpcmVkIHRyYW5zbGF0aW9uICh3aXRoIGEgcHJvdmlkZWQgZHJhZyBjYWxsYmFjaywgdXNpbmcgdGhlIHBvc2l0aW9uUHJvcGVydHksIG9yIGRpcmVjdGx5XHJcbiAqICAgIHRyYW5zZm9ybWluZyB0aGUgTm9kZSBpZiB0cmFuc2xhdGVOb2RlOnRydWUpLlxyXG4gKlxyXG4gKiBGb3IgZXhhbXBsZSB1c2FnZSwgc2VlIHNjZW5lcnkvZXhhbXBsZXMvaW5wdXQuaHRtbFxyXG4gKlxyXG4gKiBGb3IgbW9zdCBQaEVUIG1vZGVsLXZpZXcgdXNhZ2UsIGl0J3MgcmVjb21tZW5kZWQgdG8gaW5jbHVkZSBhIG1vZGVsIHBvc2l0aW9uIFByb3BlcnR5IGFzIHRoZSBgcG9zaXRpb25Qcm9wZXJ0eWBcclxuICogb3B0aW9uLCBhbG9uZyB3aXRoIHRoZSBgdHJhbnNmb3JtYCBvcHRpb24gc3BlY2lmeWluZyB0aGUgTVZULiBCeSBkZWZhdWx0LCB0aGlzIHdpbGwgdGhlbiBhc3N1bWUgdGhhdCB0aGUgTm9kZSB3aXRoXHJcbiAqIHRoZSBsaXN0ZW5lciBpcyBwb3NpdGlvbmVkIGluIHRoZSBcInZpZXdcIiBjb29yZGluYXRlIGZyYW1lLCBhbmQgd2lsbCBwcm9wZXJseSBoYW5kbGUgb2Zmc2V0cyBhbmQgdHJhbnNmb3JtYXRpb25zLlxyXG4gKiBJdCBpcyBhc3N1bWVkIHRoYXQgd2hlbiB0aGUgbW9kZWwgYHBvc2l0aW9uUHJvcGVydHlgIGNoYW5nZXMsIHRoYXQgdGhlIHBvc2l0aW9uIG9mIHRoZSBOb2RlIHdvdWxkIGFsc28gY2hhbmdlLlxyXG4gKiBJZiBpdCdzIGFub3RoZXIgTm9kZSBiZWluZyB0cmFuc2Zvcm1lZCwgcGxlYXNlIHVzZSB0aGUgYHRhcmdldE5vZGVgIG9wdGlvbiB0byBzcGVjaWZ5IHdoaWNoIE5vZGUgaXMgYmVpbmdcclxuICogdHJhbnNmb3JtZWQuIElmIHNvbWV0aGluZyBtb3JlIGNvbXBsaWNhdGVkIHRoYW4gYSBOb2RlIGJlaW5nIHRyYW5zZm9ybWVkIGlzIGdvaW5nIG9uIChsaWtlIHBvc2l0aW9uaW5nIG11bHRpcGxlXHJcbiAqIGl0ZW1zLCBwb3NpdGlvbmluZyBiYXNlZCBvbiB0aGUgY2VudGVyLCBjaGFuZ2luZyBzb21ldGhpbmcgaW4gQ2FudmFzTm9kZSksIGl0J3MgcmVjb21tZW5kZWQgdG8gcGFzcyB0aGVcclxuICogYHVzZVBhcmVudE9mZnNldGAgb3B0aW9uIChzbyB0aGF0IHRoZSBEcmFnTGlzdGVuZXIgd2lsbCBOT1QgdHJ5IHRvIGNvbXB1dGUgb2Zmc2V0cyBiYXNlZCBvbiB0aGUgTm9kZSdzIHBvc2l0aW9uKSwgb3JcclxuICogdG8gdXNlIGBhcHBseU9mZnNldDpmYWxzZWAgKGVmZmVjdGl2ZWx5IGhhdmluZyBkcmFncyByZXBvc2l0aW9uIHRoZSBOb2RlIHNvIHRoYXQgdGhlIG9yaWdpbiBpcyBhdCB0aGUgcG9pbnRlcikuXHJcbiAqXHJcbiAqIFRoZSB0eXBpY2FsIFBoRVQgdXNhZ2Ugd291bGQgbG9vayBsaWtlOlxyXG4gKlxyXG4gKiAgIG5ldyBEcmFnTGlzdGVuZXIoIHtcclxuICogICAgIHBvc2l0aW9uUHJvcGVydHk6IHNvbWVPYmplY3QucG9zaXRpb25Qcm9wZXJ0eSxcclxuICogICAgIHRyYW5zZm9ybTogbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAqICAgfSApXHJcbiAqXHJcbiAqIEFkZGl0aW9uYWxseSwgZm9yIFBoRVQgdXNhZ2UgaXQncyBhbHNvIGZpbmUgTk9UIHRvIGhvb2sgaW50byBhIGBwb3NpdGlvblByb3BlcnR5YC4gVHlwaWNhbGx5IHVzaW5nIHN0YXJ0L2VuZC9kcmFnLFxyXG4gKiBhbmQgdmFsdWVzIGNhbiBiZSByZWFkIG91dCAobGlrZSBgbW9kZWxQb2ludGAsIGBsb2NhbFBvaW50YCwgYHBhcmVudFBvaW50YCwgYG1vZGVsRGVsdGFgKSBmcm9tIHRoZSBsaXN0ZW5lciB0byBkb1xyXG4gKiBvcGVyYXRpb25zLiBGb3IgaW5zdGFuY2UsIGlmIGRlbHRhcyBhbmQgbW9kZWwgcG9zaXRpb25zIGFyZSB0aGUgb25seSB0aGluZyBkZXNpcmVkOlxyXG4gKlxyXG4gKiAgIG5ldyBEcmFnTGlzdGVuZXIoIHtcclxuICogICAgIGRyYWc6ICggZXZlbnQsIGxpc3RlbmVyICkgPT4ge1xyXG4gKiAgICAgICBkb1NvbWV0aGluZ1dpdGgoIGxpc3RlbmVyLm1vZGVsRGVsdGEsIGxpc3RlbmVyLm1vZGVsUG9pbnQgKTtcclxuICogICAgIH1cclxuICogICB9IClcclxuICpcclxuICogSXQncyBjb21wbGV0ZWx5IGZpbmUgdG8gdXNlIG9uZSBEcmFnTGlzdGVuZXIgd2l0aCBtdWx0aXBsZSBvYmplY3RzLCBob3dldmVyIHRoaXMgaXNuJ3QgZG9uZSBhcyBtdWNoIHNpbmNlIHNwZWNpZnlpbmdcclxuICogcG9zaXRpb25Qcm9wZXJ0eSBvbmx5IHdvcmtzIHdpdGggT05FIG1vZGVsIHBvc2l0aW9uIFByb3BlcnR5IChzbyBpZiB0aGluZ3MgYXJlIGJhY2tlZCBieSB0aGUgc2FtZSBQcm9wZXJ0eSBpdCB3b3VsZFxyXG4gKiBiZSBmaW5lKS4gRG9pbmcgdGhpbmdzIGJhc2VkIG9uIG1vZGVsUG9pbnQvbW9kZWxEZWx0YS9ldGMuIHNob3VsZCBiZSBjb21wbGV0ZWx5IGZpbmUgdXNpbmcgb25lIGxpc3RlbmVyIHdpdGhcclxuICogbXVsdGlwbGUgbm9kZXMuIFRoZSB0eXBpY2FsIHBhdHRlcm4gSVMgY3JlYXRpbmcgb25lIERyYWdMaXN0ZW5lciBwZXIgZHJhZ2dhYmxlIHZpZXcgTm9kZS5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBQaGV0aW9BY3Rpb24gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb0FjdGlvbi5qcyc7XHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFRyYW5zZm9ybTMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1RyYW5zZm9ybTMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBSZXF1aXJlZE9wdGlvbiBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUmVxdWlyZWRPcHRpb24uanMnO1xyXG5pbXBvcnQgRXZlbnRUeXBlIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9FdmVudFR5cGUuanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0IGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBQb2ludGVyLCBQcmVzc2VkUHJlc3NMaXN0ZW5lciwgUHJlc3NMaXN0ZW5lciwgUHJlc3NMaXN0ZW5lckNhbGxiYWNrLCBQcmVzc0xpc3RlbmVyRXZlbnQsIFByZXNzTGlzdGVuZXJOdWxsYWJsZUNhbGxiYWNrLCBQcmVzc0xpc3RlbmVyT3B0aW9ucywgc2NlbmVyeSwgU2NlbmVyeUV2ZW50LCBUSW5wdXRMaXN0ZW5lciwgVHJhbnNmb3JtVHJhY2tlciB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcblxyXG4vLyBTY3JhdGNoIHZlY3RvcnMgdXNlZCB0byBwcmV2ZW50IGFsbG9jYXRpb25zXHJcbmNvbnN0IHNjcmF0Y2hWZWN0b3IyQSA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcblxyXG50eXBlIE1hcFBvc2l0aW9uID0gKCBwb2ludDogVmVjdG9yMiApID0+IFZlY3RvcjI7XHJcbnR5cGUgT2Zmc2V0UG9zaXRpb248TGlzdGVuZXIgZXh0ZW5kcyBEcmFnTGlzdGVuZXI+ID0gKCBwb2ludDogVmVjdG9yMiwgbGlzdGVuZXI6IExpc3RlbmVyICkgPT4gVmVjdG9yMjtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnM8TGlzdGVuZXIgZXh0ZW5kcyBEcmFnTGlzdGVuZXI+ID0ge1xyXG4gIC8vIElmIHByb3ZpZGVkLCBpdCB3aWxsIGJlIHN5bmNocm9uaXplZCB3aXRoIHRoZSBkcmFnIHBvc2l0aW9uIGluIHRoZSBtb2RlbCBjb29yZGluYXRlXHJcbiAgLy8gZnJhbWUgKGFwcGx5aW5nIGFueSBwcm92aWRlZCB0cmFuc2Zvcm1zIGFzIG5lZWRlZCkuIFR5cGljYWxseSwgRFVSSU5HIGEgZHJhZyB0aGlzIFByb3BlcnR5IHNob3VsZCBub3QgYmVcclxuICAvLyBtb2RpZmllZCBleHRlcm5hbGx5IChhcyB0aGUgbmV4dCBkcmFnIGV2ZW50IHdpbGwgcHJvYmFibHkgdW5kbyB0aGUgY2hhbmdlKSwgYnV0IGl0J3MgY29tcGxldGVseSBmaW5lIHRvIG1vZGlmeVxyXG4gIC8vIHRoaXMgUHJvcGVydHkgYXQgYW55IG90aGVyIHRpbWUuXHJcbiAgcG9zaXRpb25Qcm9wZXJ0eT86IFRQcm9wZXJ0eTxWZWN0b3IyPiB8IG51bGw7XHJcblxyXG4gIC8vIENhbGxlZCBhcyBzdGFydCggZXZlbnQ6IHtTY2VuZXJ5RXZlbnR9LCBsaXN0ZW5lcjoge0RyYWdMaXN0ZW5lcn0gKSB3aGVuIHRoZSBkcmFnIGlzIHN0YXJ0ZWQuXHJcbiAgLy8gVGhpcyBpcyBwcmVmZXJyZWQgb3ZlciBwYXNzaW5nIHByZXNzKCksIGFzIHRoZSBkcmFnIHN0YXJ0IGhhc24ndCBiZWVuIGZ1bGx5IHByb2Nlc3NlZCBhdCB0aGF0IHBvaW50LlxyXG4gIHN0YXJ0PzogUHJlc3NMaXN0ZW5lckNhbGxiYWNrPExpc3RlbmVyPiB8IG51bGw7XHJcblxyXG4gIC8vIENhbGxlZCBhcyBlbmQoIGxpc3RlbmVyOiB7RHJhZ0xpc3RlbmVyfSApIHdoZW4gdGhlIGRyYWcgaXMgZW5kZWQuIFRoaXMgaXMgcHJlZmVycmVkIG92ZXJcclxuICAvLyBwYXNzaW5nIHJlbGVhc2UoKSwgYXMgdGhlIGRyYWcgc3RhcnQgaGFzbid0IGJlZW4gZnVsbHkgcHJvY2Vzc2VkIGF0IHRoYXQgcG9pbnQuXHJcbiAgLy8gTk9URTogVGhpcyB3aWxsIGFsc28gYmUgY2FsbGVkIGlmIHRoZSBkcmFnIGlzIGVuZGVkIGR1ZSB0byBiZWluZyBpbnRlcnJ1cHRlZCBvciBjYW5jZWxlZC5cclxuICBlbmQ/OiBQcmVzc0xpc3RlbmVyTnVsbGFibGVDYWxsYmFjazxMaXN0ZW5lcj4gfCBudWxsO1xyXG5cclxuICAvLyBJZiBwcm92aWRlZCwgdGhpcyB3aWxsIGJlIHRoZSBjb252ZXJzaW9uIGJldHdlZW4gdGhlIHBhcmVudCAodmlldykgYW5kIG1vZGVsIGNvb3JkaW5hdGVcclxuICAvLyBmcmFtZXMuIFVzdWFsbHkgbW9zdCB1c2VmdWwgd2hlbiBwYWlyZWQgd2l0aCB0aGUgcG9zaXRpb25Qcm9wZXJ0eS5cclxuICB0cmFuc2Zvcm0/OiBUcmFuc2Zvcm0zIHwgVFJlYWRPbmx5UHJvcGVydHk8VHJhbnNmb3JtMz4gfCBudWxsO1xyXG5cclxuICAvLyBJZiBwcm92aWRlZCwgdGhlIG1vZGVsIHBvc2l0aW9uIHdpbGwgYmUgY29uc3RyYWluZWQgdG8gYmUgaW5zaWRlIHRoZXNlIGJvdW5kcy5cclxuICBkcmFnQm91bmRzUHJvcGVydHk/OiBUUmVhZE9ubHlQcm9wZXJ0eTxCb3VuZHMyIHwgbnVsbD4gfCBudWxsO1xyXG5cclxuICAvLyBJZiB0cnVlLCB1bmF0dGFjaGVkIHRvdWNoZXMgdGhhdCBtb3ZlIGFjcm9zcyBvdXIgbm9kZSB3aWxsIHRyaWdnZXIgYSBwcmVzcygpLiBUaGlzIGhlbHBzIHNvbWV0aW1lc1xyXG4gIC8vIGZvciBzbWFsbCBkcmFnZ2FibGUgb2JqZWN0cy5cclxuICBhbGxvd1RvdWNoU25hZz86IGJvb2xlYW47XHJcblxyXG4gIC8vIElmIHRydWUsIHRoZSBpbml0aWFsIG9mZnNldCBvZiB0aGUgcG9pbnRlcidzIHBvc2l0aW9uIGlzIHRha2VuIGludG8gYWNjb3VudCwgc28gdGhhdCBkcmFncyB3aWxsXHJcbiAgLy8gdHJ5IHRvIGtlZXAgdGhlIHBvaW50ZXIgYXQgdGhlIHNhbWUgbG9jYWwgcG9pbnQgb2Ygb3VyIGRyYWdnZWQgbm9kZS5cclxuICAvLyBOT1RFOiBUaGUgZGVmYXVsdCBiZWhhdmlvciBpcyB0byB1c2UgdGhlIGdpdmVuIE5vZGUgKGVpdGhlciB0aGUgdGFyZ2V0Tm9kZSBvciB0aGUgbm9kZSB3aXRoIHRoZSBsaXN0ZW5lciBvbiBpdClcclxuICAvLyBhbmQgdXNlIGl0cyB0cmFuc2Zvcm0gdG8gY29tcHV0ZSB0aGUgXCJsb2NhbCBwb2ludFwiIChhc3N1bWluZyB0aGF0IHRoZSBub2RlJ3MgbG9jYWwgb3JpZ2luIGlzIHdoYXQgaXNcclxuICAvLyB0cmFuc2Zvcm1lZCBhcm91bmQpLiBUaGlzIGlzIGlkZWFsIGZvciBtb3N0IHNpdHVhdGlvbnMsIGJ1dCBpdCdzIGFsc28gcG9zc2libGUgdG8gdXNlIGEgcGFyZW50LWNvb3JkaW5hdGVcclxuICAvLyBiYXNlZCBhcHByb2FjaCBmb3Igb2Zmc2V0cyAoc2VlIHVzZVBhcmVudE9mZnNldClcclxuICBhcHBseU9mZnNldD86IGJvb2xlYW47XHJcblxyXG4gIC8vIElmIHNldCB0byB0cnVlLCB0aGVuIGFueSBvZmZzZXRzIGFwcGxpZWQgd2lsbCBiZSBoYW5kbGVkIGluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBzcGFjZSB1c2luZyB0aGVcclxuICAvLyBwb3NpdGlvblByb3BlcnR5IGFzIHRoZSBcImdyb3VuZCB0cnV0aFwiLCBpbnN0ZWFkIG9mIGxvb2tpbmcgYXQgdGhlIE5vZGUncyBhY3R1YWwgcG9zaXRpb24gYW5kIHRyYW5zZm9ybS4gVGhpc1xyXG4gIC8vIGlzIHVzZWZ1bCBpZiB0aGUgcG9zaXRpb24vdHJhbnNmb3JtIGNhbm5vdCBiZSBhcHBsaWVkIGRpcmVjdGx5IHRvIGEgc2luZ2xlIE5vZGUgKGUuZy4gcG9zaXRpb25pbmcgbXVsdGlwbGVcclxuICAvLyBpbmRlcGVuZGVudCBub2Rlcywgb3IgY2VudGVyaW5nIHRoaW5ncyBpbnN0ZWFkIG9mIHRyYW5zZm9ybWluZyBiYXNlZCBvbiB0aGUgb3JpZ2luIG9mIHRoZSBOb2RlKS5cclxuICAvL1xyXG4gIC8vIE5PVEU6IFVzZSB0aGlzIG9wdGlvbiBtb3N0IGxpa2VseSBpZiBjb252ZXJ0aW5nIGZyb20gTW92YWJsZURyYWdIYW5kbGVyLCBiZWNhdXNlIGl0IHRyYW5zZm9ybWVkIGJhc2VkIGluXHJcbiAgLy8gdGhlIHBhcmVudCdzIGNvb3JkaW5hdGUgZnJhbWUuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTAxNFxyXG4gIC8vXHJcbiAgLy8gTk9URTogVGhpcyBhbHNvIHJlcXVpcmVzIHByb3ZpZGluZyBhIHBvc2l0aW9uUHJvcGVydHlcclxuICB1c2VQYXJlbnRPZmZzZXQ/OiBib29sZWFuO1xyXG5cclxuICAvLyBJZiB0cnVlLCBhbmNlc3RvciB0cmFuc2Zvcm1zIHdpbGwgYmUgd2F0Y2hlZC4gSWYgdGhleSBjaGFuZ2UsIGl0IHdpbGwgdHJpZ2dlciBhIHJlcG9zaXRpb25pbmc7XHJcbiAgLy8gd2hpY2ggd2lsbCB1c3VhbGx5IGFkanVzdCB0aGUgcG9zaXRpb24vdHJhbnNmb3JtIHRvIG1haW50YWluIHBvc2l0aW9uLlxyXG4gIHRyYWNrQW5jZXN0b3JzPzogYm9vbGVhbjtcclxuXHJcbiAgLy8gSWYgdHJ1ZSwgdGhlIGVmZmVjdGl2ZSBjdXJyZW50VGFyZ2V0IHdpbGwgYmUgdHJhbnNsYXRlZCB3aGVuIHRoZSBkcmFnIHBvc2l0aW9uIGNoYW5nZXMuXHJcbiAgdHJhbnNsYXRlTm9kZT86IGJvb2xlYW47XHJcblxyXG4gIC8vIElmIHByb3ZpZGVkLCBpdCB3aWxsIGFsbG93IGN1c3RvbSBtYXBwaW5nXHJcbiAgLy8gZnJvbSB0aGUgZGVzaXJlZCBwb3NpdGlvbiAoaS5lLiB3aGVyZSB0aGUgcG9pbnRlciBpcykgdG8gdGhlIGFjdHVhbCBwb3NzaWJsZSBwb3NpdGlvbiAoaS5lLiB3aGVyZSB0aGUgZHJhZ2dlZFxyXG4gIC8vIG9iamVjdCBlbmRzIHVwKS4gRm9yIGV4YW1wbGUsIHVzaW5nIGRyYWdCb3VuZHNQcm9wZXJ0eSBpcyBlcXVpdmFsZW50IHRvIHBhc3Npbmc6XHJcbiAgLy8gICBtYXBQb3NpdGlvbjogZnVuY3Rpb24oIHBvaW50ICkgeyByZXR1cm4gZHJhZ0JvdW5kc1Byb3BlcnR5LnZhbHVlLmNsb3Nlc3RQb2ludFRvKCBwb2ludCApOyB9XHJcbiAgbWFwUG9zaXRpb24/OiBNYXBQb3NpdGlvbiB8IG51bGw7XHJcblxyXG4gIC8vIElmIHByb3ZpZGVkLCBpdHMgcmVzdWx0IHdpbGwgYmUgYWRkZWQgdG8gdGhlIHBhcmVudFBvaW50IGJlZm9yZSBjb21wdXRhdGlvbiBjb250aW51ZXMsIHRvIGFsbG93IHRoZSBhYmlsaXR5IHRvXHJcbiAgLy8gXCJvZmZzZXRcIiB3aGVyZSB0aGUgcG9pbnRlciBwb3NpdGlvbiBzZWVtcyB0byBiZS4gVXNlZnVsIGZvciB0b3VjaCwgd2hlcmUgdGhpbmdzIHNob3VsZG4ndCBiZSB1bmRlciB0aGUgcG9pbnRlclxyXG4gIC8vIGRpcmVjdGx5LlxyXG4gIG9mZnNldFBvc2l0aW9uPzogT2Zmc2V0UG9zaXRpb248TGlzdGVuZXI+IHwgbnVsbDtcclxuXHJcbiAgLy8gcGRvbVxyXG4gIC8vIFdoZXRoZXIgdG8gYWxsb3cgYGNsaWNrYCBldmVudHMgdG8gdHJpZ2dlciBiZWhhdmlvciBpbiB0aGUgc3VwZXJ0eXBlIFByZXNzTGlzdGVuZXIuXHJcbiAgLy8gR2VuZXJhbGx5IERyYWdMaXN0ZW5lciBzaG91bGQgbm90IHJlc3BvbmQgdG8gY2xpY2sgZXZlbnRzLCBidXQgdGhlcmUgYXJlIHNvbWUgZXhjZXB0aW9ucyB3aGVyZSBkcmFnXHJcbiAgLy8gZnVuY3Rpb25hbGl0eSBpcyBuaWNlIGJ1dCBhIGNsaWNrIHNob3VsZCBzdGlsbCBhY3RpdmF0ZSB0aGUgY29tcG9uZW50LiBTZWVcclxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy82OTZcclxuICBjYW5DbGljaz86IGJvb2xlYW47XHJcbn07XHJcbmV4cG9ydCB0eXBlIERyYWdMaXN0ZW5lck9wdGlvbnM8TGlzdGVuZXIgZXh0ZW5kcyBEcmFnTGlzdGVuZXI+ID0gU2VsZk9wdGlvbnM8TGlzdGVuZXI+ICYgUHJlc3NMaXN0ZW5lck9wdGlvbnM8TGlzdGVuZXI+O1xyXG50eXBlIENyZWF0ZUZvcndhcmRpbmdMaXN0ZW5lck9wdGlvbnMgPSB7XHJcbiAgYWxsb3dUb3VjaFNuYWc/OiBib29sZWFuO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgUHJlc3NlZERyYWdMaXN0ZW5lciA9IERyYWdMaXN0ZW5lciAmIFByZXNzZWRQcmVzc0xpc3RlbmVyO1xyXG5jb25zdCBpc1ByZXNzZWRMaXN0ZW5lciA9ICggbGlzdGVuZXI6IERyYWdMaXN0ZW5lciApOiBsaXN0ZW5lciBpcyBQcmVzc2VkRHJhZ0xpc3RlbmVyID0+IGxpc3RlbmVyLmlzUHJlc3NlZDtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERyYWdMaXN0ZW5lciBleHRlbmRzIFByZXNzTGlzdGVuZXIgaW1wbGVtZW50cyBUSW5wdXRMaXN0ZW5lciB7XHJcblxyXG4gIC8vIEFsaWFzIGZvciBpc1ByZXNzZWRQcm9wZXJ0eSAoYXMgdGhpcyBuYW1lIG1ha2VzIG1vcmUgc2Vuc2UgZm9yIGRyYWdnaW5nKVxyXG4gIHB1YmxpYyBpc1VzZXJDb250cm9sbGVkUHJvcGVydHk6IFRQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgcHJpdmF0ZSBfYWxsb3dUb3VjaFNuYWc6IFJlcXVpcmVkT3B0aW9uPFNlbGZPcHRpb25zPERyYWdMaXN0ZW5lcj4sICdhbGxvd1RvdWNoU25hZyc+O1xyXG4gIHByaXZhdGUgX2FwcGx5T2Zmc2V0OiBSZXF1aXJlZE9wdGlvbjxTZWxmT3B0aW9uczxEcmFnTGlzdGVuZXI+LCAnYXBwbHlPZmZzZXQnPjtcclxuICBwcml2YXRlIF91c2VQYXJlbnRPZmZzZXQ6IFJlcXVpcmVkT3B0aW9uPFNlbGZPcHRpb25zPERyYWdMaXN0ZW5lcj4sICd1c2VQYXJlbnRPZmZzZXQnPjtcclxuICBwcml2YXRlIF90cmFja0FuY2VzdG9yczogUmVxdWlyZWRPcHRpb248U2VsZk9wdGlvbnM8RHJhZ0xpc3RlbmVyPiwgJ3RyYWNrQW5jZXN0b3JzJz47XHJcbiAgcHJpdmF0ZSBfdHJhbnNsYXRlTm9kZTogUmVxdWlyZWRPcHRpb248U2VsZk9wdGlvbnM8RHJhZ0xpc3RlbmVyPiwgJ3RyYW5zbGF0ZU5vZGUnPjtcclxuICBwcml2YXRlIF90cmFuc2Zvcm06IFJlcXVpcmVkT3B0aW9uPFNlbGZPcHRpb25zPERyYWdMaXN0ZW5lcj4sICd0cmFuc2Zvcm0nPjtcclxuICBwcml2YXRlIF9wb3NpdGlvblByb3BlcnR5OiBSZXF1aXJlZE9wdGlvbjxTZWxmT3B0aW9uczxEcmFnTGlzdGVuZXI+LCAncG9zaXRpb25Qcm9wZXJ0eSc+O1xyXG4gIHByaXZhdGUgX21hcFBvc2l0aW9uOiBSZXF1aXJlZE9wdGlvbjxTZWxmT3B0aW9uczxEcmFnTGlzdGVuZXI+LCAnbWFwUG9zaXRpb24nPjtcclxuICBwcml2YXRlIF9vZmZzZXRQb3NpdGlvbjogUmVxdWlyZWRPcHRpb248U2VsZk9wdGlvbnM8UHJlc3NlZERyYWdMaXN0ZW5lcj4sICdvZmZzZXRQb3NpdGlvbic+O1xyXG4gIHByaXZhdGUgX2RyYWdCb3VuZHNQcm9wZXJ0eTogTm9uTnVsbGFibGU8UmVxdWlyZWRPcHRpb248U2VsZk9wdGlvbnM8RHJhZ0xpc3RlbmVyPiwgJ2RyYWdCb3VuZHNQcm9wZXJ0eSc+PjtcclxuICBwcml2YXRlIF9zdGFydDogUmVxdWlyZWRPcHRpb248U2VsZk9wdGlvbnM8UHJlc3NlZERyYWdMaXN0ZW5lcj4sICdzdGFydCc+O1xyXG4gIHByaXZhdGUgX2VuZDogUmVxdWlyZWRPcHRpb248U2VsZk9wdGlvbnM8UHJlc3NlZERyYWdMaXN0ZW5lcj4sICdlbmQnPjtcclxuICBwcml2YXRlIF9jYW5DbGljazogUmVxdWlyZWRPcHRpb248U2VsZk9wdGlvbnM8RHJhZ0xpc3RlbmVyPiwgJ2NhbkNsaWNrJz47XHJcblxyXG4gIC8vIFRoZSBwb2ludCBvZiB0aGUgZHJhZyBpbiB0aGUgdGFyZ2V0J3MgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUuIFVwZGF0ZWQgd2l0aCBtdXRhdGlvbi5cclxuICBwcml2YXRlIF9nbG9iYWxQb2ludDogVmVjdG9yMjtcclxuXHJcbiAgLy8gVGhlIHBvaW50IG9mIHRoZSBkcmFnIGluIHRoZSB0YXJnZXQncyBsb2NhbCBjb29yZGluYXRlIGZyYW1lLiBVcGRhdGVkIHdpdGggbXV0YXRpb24uXHJcbiAgcHJpdmF0ZSBfbG9jYWxQb2ludDogVmVjdG9yMjtcclxuXHJcbiAgLy8gQ3VycmVudCBkcmFnIHBvaW50IGluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZS4gVXBkYXRlZCB3aXRoIG11dGF0aW9uLlxyXG4gIHByaXZhdGUgX3BhcmVudFBvaW50OiBWZWN0b3IyO1xyXG5cclxuICAvLyBDdXJyZW50IGRyYWcgcG9pbnQgaW4gdGhlIG1vZGVsIGNvb3JkaW5hdGUgZnJhbWVcclxuICBwcml2YXRlIF9tb2RlbFBvaW50OiBWZWN0b3IyO1xyXG5cclxuICAvLyBTdG9yZXMgdGhlIG1vZGVsIGRlbHRhIGNvbXB1dGVkIGR1cmluZyBldmVyeSByZXBvc2l0aW9uaW5nXHJcbiAgcHJpdmF0ZSBfbW9kZWxEZWx0YTogVmVjdG9yMjtcclxuXHJcbiAgLy8gSWYgdXNlUGFyZW50T2Zmc2V0IGlzIHRydWUsIHRoaXMgd2lsbCBiZSBzZXQgdG8gdGhlIHBhcmVudC1jb29yZGluYXRlIG9mZnNldCBhdCB0aGUgc3RhcnRcclxuICAvLyBvZiBhIGRyYWcsIGFuZCB0aGUgXCJvZmZzZXRcIiB3aWxsIGJlIGhhbmRsZWQgYnkgYXBwbHlpbmcgdGhpcyBvZmZzZXQgY29tcGFyZWQgdG8gd2hlcmUgdGhlIHBvaW50ZXIgaXMuXHJcbiAgcHJpdmF0ZSBfcGFyZW50T2Zmc2V0OiBWZWN0b3IyO1xyXG5cclxuICAvLyBIYW5kbGVzIHdhdGNoaW5nIGFuY2VzdG9yIHRyYW5zZm9ybXMgZm9yIGNhbGxiYWNrcy5cclxuICBwcml2YXRlIF90cmFuc2Zvcm1UcmFja2VyOiBUcmFuc2Zvcm1UcmFja2VyIHwgbnVsbDtcclxuXHJcbiAgLy8gTGlzdGVuZXIgcGFzc2VkIHRvIHRoZSB0cmFuc2Zvcm0gdHJhY2tlclxyXG4gIHByaXZhdGUgX3RyYW5zZm9ybVRyYWNrZXJMaXN0ZW5lcjogKCkgPT4gdm9pZDtcclxuXHJcbiAgLy8gVGhlcmUgYXJlIGNhc2VzIGxpa2UgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VxdWFsaXR5LWV4cGxvcmVyL2lzc3Vlcy85NyB3aGVyZSBpZlxyXG4gIC8vIGEgdG91Y2hlbnRlciBzdGFydHMgYSBkcmFnIHRoYXQgaXMgSU1NRURJQVRFTFkgaW50ZXJydXB0ZWQsIHRoZSB0b3VjaGRvd24gd291bGQgc3RhcnQgYW5vdGhlciBkcmFnLiBXZSByZWNvcmRcclxuICAvLyBpbnRlcnJ1cHRpb25zIGhlcmUgc28gdGhhdCB3ZSBjYW4gcHJldmVudCBmdXR1cmUgZW50ZXIvZG93biBldmVudHMgZnJvbSB0aGUgc2FtZSB0b3VjaCBwb2ludGVyIGZyb20gdHJpZ2dlcmluZ1xyXG4gIC8vIGFub3RoZXIgc3RhcnREcmFnLlxyXG4gIHByaXZhdGUgX2xhc3RJbnRlcnJ1cHRlZFRvdWNoTGlrZVBvaW50ZXI6IFBvaW50ZXIgfCBudWxsO1xyXG5cclxuICAvLyBFbWl0dGVkIG9uIGRyYWcuIFVzZWQgZm9yIHRyaWdnZXJpbmcgcGhldC1pbyBldmVudHMgdG8gdGhlIGRhdGEgc3RyZWFtLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg0MlxyXG4gIHByaXZhdGUgX2RyYWdBY3Rpb246IFBoZXRpb0FjdGlvbjxbIFByZXNzTGlzdGVuZXJFdmVudCBdPjtcclxuXHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogRHJhZ0xpc3RlbmVyT3B0aW9uczxQcmVzc2VkRHJhZ0xpc3RlbmVyPiApIHtcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8RHJhZ0xpc3RlbmVyT3B0aW9uczxQcmVzc2VkRHJhZ0xpc3RlbmVyPiwgU2VsZk9wdGlvbnM8UHJlc3NlZERyYWdMaXN0ZW5lcj4sIFByZXNzTGlzdGVuZXJPcHRpb25zPFByZXNzZWREcmFnTGlzdGVuZXI+PigpKCB7XHJcbiAgICAgIHBvc2l0aW9uUHJvcGVydHk6IG51bGwsXHJcbiAgICAgIHN0YXJ0OiBudWxsLFxyXG4gICAgICBlbmQ6IG51bGwsXHJcbiAgICAgIHRyYW5zZm9ybTogbnVsbCxcclxuICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiBudWxsLFxyXG4gICAgICBhbGxvd1RvdWNoU25hZzogdHJ1ZSxcclxuICAgICAgYXBwbHlPZmZzZXQ6IHRydWUsXHJcbiAgICAgIHVzZVBhcmVudE9mZnNldDogZmFsc2UsXHJcbiAgICAgIHRyYWNrQW5jZXN0b3JzOiBmYWxzZSxcclxuICAgICAgdHJhbnNsYXRlTm9kZTogZmFsc2UsXHJcbiAgICAgIG1hcFBvc2l0aW9uOiBudWxsLFxyXG4gICAgICBvZmZzZXRQb3NpdGlvbjogbnVsbCxcclxuICAgICAgY2FuQ2xpY2s6IGZhbHNlLFxyXG5cclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXHJcblxyXG4gICAgICAvLyBUaG91Z2ggRHJhZ0xpc3RlbmVyIGlzIG5vdCBpbnN0cnVtZW50ZWQsIGRlY2xhcmUgdGhlc2UgaGVyZSB0byBzdXBwb3J0IHByb3Blcmx5IHBhc3NpbmcgdGhpcyB0byBjaGlsZHJlbiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90YW5kZW0vaXNzdWVzLzYwLlxyXG4gICAgICAvLyBEcmFnTGlzdGVuZXIgYnkgZGVmYXVsdCBkb2Vzbid0IGFsbG93IFBoRVQtaU8gdG8gdHJpZ2dlciBkcmFnIEFjdGlvbiBldmVudHNcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiBQaGV0aW9PYmplY3QuREVGQVVMVF9PUFRJT05TLnBoZXRpb0ZlYXR1cmVkXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhKCBvcHRpb25zIGFzIHVua25vd24gYXMgeyBkcmFnQm91bmRzOiBCb3VuZHMyIH0gKS5kcmFnQm91bmRzLCAnb3B0aW9ucy5kcmFnQm91bmRzIHdhcyByZW1vdmVkIGluIGZhdm9yIG9mIG9wdGlvbnMuZHJhZ0JvdW5kc1Byb3BlcnR5JyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMudXNlUGFyZW50T2Zmc2V0IHx8IG9wdGlvbnMucG9zaXRpb25Qcm9wZXJ0eSwgJ0lmIHVzZVBhcmVudE9mZnNldCBpcyBzZXQsIGEgcG9zaXRpb25Qcm9wZXJ0eSBpcyByZXF1aXJlZCcgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KFxyXG4gICAgICAhKCBvcHRpb25zLm1hcFBvc2l0aW9uICYmIG9wdGlvbnMuZHJhZ0JvdW5kc1Byb3BlcnR5ICksXHJcbiAgICAgICdPbmx5IG9uZSBvZiBtYXBQb3NpdGlvbiBhbmQgZHJhZ0JvdW5kc1Byb3BlcnR5IGNhbiBiZSBwcm92aWRlZCwgYXMgdGhleSBoYW5kbGUgbWFwcGluZyBvZiB0aGUgZHJhZyBwb2ludCdcclxuICAgICk7XHJcblxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPOiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtY29yZS9pc3N1ZXMvMTI4XHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuX2FsbG93VG91Y2hTbmFnID0gb3B0aW9ucy5hbGxvd1RvdWNoU25hZztcclxuICAgIHRoaXMuX2FwcGx5T2Zmc2V0ID0gb3B0aW9ucy5hcHBseU9mZnNldDtcclxuICAgIHRoaXMuX3VzZVBhcmVudE9mZnNldCA9IG9wdGlvbnMudXNlUGFyZW50T2Zmc2V0O1xyXG4gICAgdGhpcy5fdHJhY2tBbmNlc3RvcnMgPSBvcHRpb25zLnRyYWNrQW5jZXN0b3JzO1xyXG4gICAgdGhpcy5fdHJhbnNsYXRlTm9kZSA9IG9wdGlvbnMudHJhbnNsYXRlTm9kZTtcclxuICAgIHRoaXMuX3RyYW5zZm9ybSA9IG9wdGlvbnMudHJhbnNmb3JtO1xyXG4gICAgdGhpcy5fcG9zaXRpb25Qcm9wZXJ0eSA9IG9wdGlvbnMucG9zaXRpb25Qcm9wZXJ0eTtcclxuICAgIHRoaXMuX21hcFBvc2l0aW9uID0gb3B0aW9ucy5tYXBQb3NpdGlvbjtcclxuICAgIHRoaXMuX29mZnNldFBvc2l0aW9uID0gb3B0aW9ucy5vZmZzZXRQb3NpdGlvbjtcclxuICAgIHRoaXMuX2RyYWdCb3VuZHNQcm9wZXJ0eSA9ICggb3B0aW9ucy5kcmFnQm91bmRzUHJvcGVydHkgfHwgbmV3IFByb3BlcnR5KCBudWxsICkgKTtcclxuICAgIHRoaXMuX3N0YXJ0ID0gb3B0aW9ucy5zdGFydDtcclxuICAgIHRoaXMuX2VuZCA9IG9wdGlvbnMuZW5kO1xyXG4gICAgdGhpcy5fY2FuQ2xpY2sgPSBvcHRpb25zLmNhbkNsaWNrO1xyXG4gICAgdGhpcy5pc1VzZXJDb250cm9sbGVkUHJvcGVydHkgPSB0aGlzLmlzUHJlc3NlZFByb3BlcnR5O1xyXG4gICAgdGhpcy5fZ2xvYmFsUG9pbnQgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG4gICAgdGhpcy5fbG9jYWxQb2ludCA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbiAgICB0aGlzLl9wYXJlbnRQb2ludCA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbiAgICB0aGlzLl9tb2RlbFBvaW50ID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgIHRoaXMuX21vZGVsRGVsdGEgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG4gICAgdGhpcy5fcGFyZW50T2Zmc2V0ID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgIHRoaXMuX3RyYW5zZm9ybVRyYWNrZXIgPSBudWxsO1xyXG4gICAgdGhpcy5fdHJhbnNmb3JtVHJhY2tlckxpc3RlbmVyID0gdGhpcy5hbmNlc3RvclRyYW5zZm9ybWVkLmJpbmQoIHRoaXMgKTtcclxuICAgIHRoaXMuX2xhc3RJbnRlcnJ1cHRlZFRvdWNoTGlrZVBvaW50ZXIgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuX2RyYWdBY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCBldmVudCA9PiB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzUHJlc3NlZExpc3RlbmVyKCB0aGlzICkgKTtcclxuICAgICAgY29uc3QgcHJlc3NlZExpc3RlbmVyID0gdGhpcyBhcyBQcmVzc2VkRHJhZ0xpc3RlbmVyO1xyXG5cclxuICAgICAgY29uc3QgcG9pbnQgPSBwcmVzc2VkTGlzdGVuZXIucG9pbnRlci5wb2ludDtcclxuXHJcbiAgICAgIGlmICggcG9pbnQgKSB7XHJcbiAgICAgICAgLy8gVGhpcyBpcyBkb25lIGZpcnN0LCBiZWZvcmUgdGhlIGRyYWcgbGlzdGVuZXIgaXMgY2FsbGVkIChmcm9tIHRoZSBwcm90b3R5cGUgZHJhZyBjYWxsKVxyXG4gICAgICAgIGlmICggIXRoaXMuX2dsb2JhbFBvaW50LmVxdWFscyggcG9pbnQgKSApIHtcclxuICAgICAgICAgIHRoaXMucmVwb3NpdGlvbiggcG9pbnQgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIFByZXNzTGlzdGVuZXIucHJvdG90eXBlLmRyYWcuY2FsbCggdGhpcywgZXZlbnQgKTtcclxuICAgIH0sIHtcclxuICAgICAgcGFyYW1ldGVyczogWyB7IG5hbWU6ICdldmVudCcsIHBoZXRpb1R5cGU6IFNjZW5lcnlFdmVudC5TY2VuZXJ5RXZlbnRJTyB9IF0sXHJcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiBvcHRpb25zLnBoZXRpb0ZlYXR1cmVkLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RyYWdBY3Rpb24nICksXHJcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFbWl0cyB3aGVuZXZlciBhIGRyYWcgb2NjdXJzIHdpdGggYW4gU2NlbmVyeUV2ZW50SU8gYXJndW1lbnQuJyxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IG9wdGlvbnMucGhldGlvUmVhZE9ubHksXHJcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVJcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEF0dGVtcHRzIHRvIHN0YXJ0IGEgZHJhZyB3aXRoIGEgcHJlc3MuXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIGlzIHNhZmUgdG8gY2FsbCBleHRlcm5hbGx5IGluIG9yZGVyIHRvIGF0dGVtcHQgdG8gc3RhcnQgYSBwcmVzcy4gZHJhZ0xpc3RlbmVyLmNhblByZXNzKCBldmVudCApIGNhblxyXG4gICAqIGJlIHVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyB3aWxsIGFjdHVhbGx5IHN0YXJ0IGEgZHJhZy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBldmVudFxyXG4gICAqIEBwYXJhbSBbdGFyZ2V0Tm9kZV0gLSBJZiBwcm92aWRlZCwgd2lsbCB0YWtlIHRoZSBwbGFjZSBvZiB0aGUgdGFyZ2V0Tm9kZSBmb3IgdGhpcyBjYWxsLiBVc2VmdWwgZm9yIGZvcndhcmRlZCBwcmVzc2VzLlxyXG4gICAqIEBwYXJhbSBbY2FsbGJhY2tdIC0gdG8gYmUgcnVuIGF0IHRoZSBlbmQgb2YgdGhlIGZ1bmN0aW9uLCBidXQgb25seSBvbiBzdWNjZXNzXHJcbiAgICogQHJldHVybnMgc3VjY2VzcyAtIFJldHVybnMgd2hldGhlciB0aGUgcHJlc3Mgd2FzIGFjdHVhbGx5IHN0YXJ0ZWRcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgcHJlc3MoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQsIHRhcmdldE5vZGU/OiBOb2RlLCBjYWxsYmFjaz86ICgpID0+IHZvaWQgKTogYm9vbGVhbiB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdEcmFnTGlzdGVuZXIgcHJlc3MnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBjb25zdCBzdWNjZXNzID0gc3VwZXIucHJlc3MoIGV2ZW50LCB0YXJnZXROb2RlLCAoKSA9PiB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ0RyYWdMaXN0ZW5lciBzdWNjZXNzZnVsIHByZXNzJyApO1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzUHJlc3NlZExpc3RlbmVyKCB0aGlzICkgKTtcclxuICAgICAgY29uc3QgcHJlc3NlZExpc3RlbmVyID0gdGhpcyBhcyBQcmVzc2VkRHJhZ0xpc3RlbmVyO1xyXG5cclxuICAgICAgLy8gc2lnbmlmeSB0aGF0IHRoaXMgbGlzdGVuZXIgaXMgcmVzZXJ2ZWQgZm9yIGRyYWdnaW5nIHNvIHRoYXQgb3RoZXIgbGlzdGVuZXJzIGNhbiBjaGFuZ2VcclxuICAgICAgLy8gdGhlaXIgYmVoYXZpb3IgZHVyaW5nIHNjZW5lcnkgZXZlbnQgZGlzcGF0Y2hcclxuICAgICAgcHJlc3NlZExpc3RlbmVyLnBvaW50ZXIucmVzZXJ2ZUZvckRyYWcoKTtcclxuXHJcbiAgICAgIHRoaXMuYXR0YWNoVHJhbnNmb3JtVHJhY2tlcigpO1xyXG5cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcHJlc3NlZExpc3RlbmVyLnBvaW50ZXIucG9pbnQgIT09IG51bGwgKTtcclxuICAgICAgY29uc3QgcG9pbnQgPSBwcmVzc2VkTGlzdGVuZXIucG9pbnRlci5wb2ludDtcclxuXHJcbiAgICAgIC8vIENvbXB1dGUgdGhlIHBhcmVudCBwb2ludCBjb3JyZXNwb25kaW5nIHRvIHRoZSBwb2ludGVyJ3MgcG9zaXRpb25cclxuICAgICAgY29uc3QgcGFyZW50UG9pbnQgPSB0aGlzLmdsb2JhbFRvUGFyZW50UG9pbnQoIHRoaXMuX2xvY2FsUG9pbnQuc2V0KCBwb2ludCApICk7XHJcblxyXG4gICAgICBpZiAoIHRoaXMuX3VzZVBhcmVudE9mZnNldCApIHtcclxuICAgICAgICB0aGlzLm1vZGVsVG9QYXJlbnRQb2ludCggdGhpcy5fcGFyZW50T2Zmc2V0LnNldCggdGhpcy5fcG9zaXRpb25Qcm9wZXJ0eSEudmFsdWUgKSApLnN1YnRyYWN0KCBwYXJlbnRQb2ludCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTZXQgdGhlIGxvY2FsIHBvaW50XHJcbiAgICAgIHRoaXMucGFyZW50VG9Mb2NhbFBvaW50KCBwYXJlbnRQb2ludCApO1xyXG5cclxuICAgICAgdGhpcy5yZXBvc2l0aW9uKCBwb2ludCApO1xyXG5cclxuICAgICAgLy8gTm90aWZ5IGFmdGVyIHBvc2l0aW9uaW5nIGFuZCBvdGhlciBjaGFuZ2VzXHJcbiAgICAgIHRoaXMuX3N0YXJ0ICYmIHRoaXMuX3N0YXJ0KCBldmVudCwgcHJlc3NlZExpc3RlbmVyICk7XHJcblxyXG4gICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygpO1xyXG5cclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG5cclxuICAgIHJldHVybiBzdWNjZXNzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RvcHMgdGhlIGRyYWcuXHJcbiAgICpcclxuICAgKiBUaGlzIGNhbiBiZSBjYWxsZWQgZnJvbSB0aGUgb3V0c2lkZSB0byBzdG9wIHRoZSBkcmFnIHdpdGhvdXQgdGhlIHBvaW50ZXIgaGF2aW5nIGFjdHVhbGx5IGZpcmVkIGFueSAndXAnXHJcbiAgICogZXZlbnRzLiBJZiB0aGUgY2FuY2VsL2ludGVycnVwdCBiZWhhdmlvciBpcyBtb3JlIHByZWZlcmFibGUsIGNhbGwgaW50ZXJydXB0KCkgb24gdGhpcyBsaXN0ZW5lciBpbnN0ZWFkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIFtldmVudF0gLSBzY2VuZXJ5IGV2ZW50IGlmIHRoZXJlIHdhcyBvbmVcclxuICAgKiBAcGFyYW0gW2NhbGxiYWNrXSAtIGNhbGxlZCBhdCB0aGUgZW5kIG9mIHRoZSByZWxlYXNlXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIHJlbGVhc2UoIGV2ZW50PzogUHJlc3NMaXN0ZW5lckV2ZW50LCBjYWxsYmFjaz86ICgpID0+IHZvaWQgKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdEcmFnTGlzdGVuZXIgcmVsZWFzZScgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIHN1cGVyLnJlbGVhc2UoIGV2ZW50LCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuZGV0YWNoVHJhbnNmb3JtVHJhY2tlcigpO1xyXG5cclxuICAgICAgLy8gTm90aWZ5IGFmdGVyIHRoZSByZXN0IG9mIHJlbGVhc2UgaXMgY2FsbGVkIGluIG9yZGVyIHRvIHByZXZlbnQgaXQgZnJvbSB0cmlnZ2VyaW5nIGludGVycnVwdCgpLlxyXG4gICAgICB0aGlzLl9lbmQgJiYgdGhpcy5fZW5kKCBldmVudCB8fCBudWxsLCB0aGlzIGFzIFByZXNzZWREcmFnTGlzdGVuZXIgKTtcclxuXHJcbiAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbXBvbmVudHMgdXNpbmcgRHJhZ0xpc3RlbmVyIHNob3VsZCBnZW5lcmFsbHkgbm90IGJlIGFjdGl2YXRlZCB3aXRoIGEgY2xpY2suIEEgc2luZ2xlIGNsaWNrIGZyb20gYWx0ZXJuYXRpdmVcclxuICAgKiBpbnB1dCB3b3VsZCBwaWNrIHVwIHRoZSBjb21wb25lbnQgdGhlbiBpbW1lZGlhdGVseSByZWxlYXNlIGl0LiBCdXQgb2NjYXNpb25hbGx5IHRoYXQgaXMgZGVzaXJhYmxlIGFuZCBjYW4gYmVcclxuICAgKiBjb250cm9sbGVkIHdpdGggdGhlIGNhbkNsaWNrIG9wdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgY2FuQ2xpY2soKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gc3VwZXIuY2FuQ2xpY2soKSAmJiB0aGlzLl9jYW5DbGljaztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFjdGl2YXRlIHRoZSBEcmFnTGlzdGVuZXIgd2l0aCBhIGNsaWNrIGFjdGl2YXRpb24uIFVzdWFsbHksIERyYWdMaXN0ZW5lciB3aWxsIE5PVCBiZSBhY3RpdmF0ZWQgd2l0aCBhIGNsaWNrXHJcbiAgICogYW5kIGNhbkNsaWNrIHdpbGwgcmV0dXJuIGZhbHNlLiBDb21wb25lbnRzIHRoYXQgY2FuIGJlIGRyYWdnZWQgdXN1YWxseSBzaG91bGQgbm90IGJlIHBpY2tlZCB1cC9yZWxlYXNlZFxyXG4gICAqIGZyb20gYSBzaW5nbGUgY2xpY2sgZXZlbnQgdGhhdCBtYXkgaGF2ZSBldmVuIGNvbWUgZnJvbSBldmVudCBidWJibGluZy4gQnV0IGl0IGNhbiBiZSBvcHRpb25hbGx5IGFsbG93ZWQgZm9yIHNvbWVcclxuICAgKiBjb21wb25lbnRzIHRoYXQgaGF2ZSBkcmFnIGZ1bmN0aW9uYWxpdHkgYnV0IGNhbiBzdGlsbCBiZSBhY3RpdmF0ZWQgd2l0aCBhIHNpbmdsZSBjbGljayBldmVudC5cclxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbCkgKHBhcnQgb2YgdGhlIHNjZW5lcnkgbGlzdGVuZXIgQVBJKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBjbGljayggZXZlbnQ6IFNjZW5lcnlFdmVudDxNb3VzZUV2ZW50PiwgY2FsbGJhY2s/OiAoKSA9PiB2b2lkICk6IGJvb2xlYW4ge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCAnRHJhZ0xpc3RlbmVyIGNsaWNrJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgY29uc3Qgc3VjY2VzcyA9IHN1cGVyLmNsaWNrKCBldmVudCwgKCkgPT4ge1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdEcmFnTGlzdGVuZXIgc3VjY2Vzc2Z1bCBwcmVzcycgKTtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgICAvLyBub3RpZnkgdGhhdCB3ZSBoYXZlIHN0YXJ0ZWQgYSBjaGFuZ2VcclxuICAgICAgdGhpcy5fc3RhcnQgJiYgdGhpcy5fc3RhcnQoIGV2ZW50LCB0aGlzIGFzIFByZXNzZWREcmFnTGlzdGVuZXIgKTtcclxuXHJcbiAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCk7XHJcblxyXG4gICAgICAvLyBub3RpZnkgdGhhdCB3ZSBoYXZlIGZpbmlzaGVkIGEgJ2RyYWcnIGFjdGl2YXRpb24gdGhyb3VnaCBjbGlja1xyXG4gICAgICB0aGlzLl9lbmQgJiYgdGhpcy5fZW5kKCBldmVudCwgdGhpcyBhcyBQcmVzc2VkRHJhZ0xpc3RlbmVyICk7XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcblxyXG4gICAgcmV0dXJuIHN1Y2Nlc3M7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBtb3ZlIGV2ZW50cyBhcmUgZmlyZWQgb24gdGhlIGF0dGFjaGVkIHBvaW50ZXIgbGlzdGVuZXIgZHVyaW5nIGEgZHJhZy5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgZHJhZyggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzUHJlc3NlZExpc3RlbmVyKCB0aGlzICkgKTtcclxuICAgIGNvbnN0IHByZXNzZWRMaXN0ZW5lciA9IHRoaXMgYXMgUHJlc3NlZERyYWdMaXN0ZW5lcjtcclxuXHJcbiAgICBjb25zdCBwb2ludCA9IHByZXNzZWRMaXN0ZW5lci5wb2ludGVyLnBvaW50O1xyXG5cclxuICAgIC8vIElnbm9yZSBnbG9iYWwgbW92ZXMgdGhhdCBoYXZlIHplcm8gbGVuZ3RoIChDaHJvbWUgbWlnaHQgYXV0b2ZpcmUsIHNlZVxyXG4gICAgLy8gaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTMyNzExNClcclxuICAgIGlmICggIXBvaW50IHx8IHRoaXMuX2dsb2JhbFBvaW50LmVxdWFscyggcG9pbnQgKSApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ0RyYWdMaXN0ZW5lciBkcmFnJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgdGhpcy5fZHJhZ0FjdGlvbi5leGVjdXRlKCBldmVudCApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBdHRlbXB0cyB0byBzdGFydCBhIHRvdWNoIHNuYWcsIGdpdmVuIGEgU2NlbmVyeUV2ZW50LlxyXG4gICAqXHJcbiAgICogU2hvdWxkIGJlIHNhZmUgdG8gYmUgY2FsbGVkIGV4dGVybmFsbHkgd2l0aCBhbiBldmVudC5cclxuICAgKi9cclxuICBwdWJsaWMgdHJ5VG91Y2hTbmFnKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCAnRHJhZ0xpc3RlbmVyIHRyeVRvdWNoU25hZycgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIGlmICggdGhpcy5fYWxsb3dUb3VjaFNuYWcgJiYgKCAhdGhpcy5hdHRhY2ggfHwgIWV2ZW50LnBvaW50ZXIuaXNBdHRhY2hlZCgpICkgKSB7XHJcbiAgICAgIHRoaXMucHJlc3MoIGV2ZW50ICk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBkZWZlbnNpdmUgY29weSBvZiB0aGUgbG9jYWwtY29vcmRpbmF0ZS1mcmFtZSBwb2ludCBvZiB0aGUgZHJhZy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0R2xvYmFsUG9pbnQoKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5fZ2xvYmFsUG9pbnQuY29weSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBnbG9iYWxQb2ludCgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0R2xvYmFsUG9pbnQoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgZGVmZW5zaXZlIGNvcHkgb2YgdGhlIGxvY2FsLWNvb3JkaW5hdGUtZnJhbWUgcG9pbnQgb2YgdGhlIGRyYWcuXHJcbiAgICovXHJcbiAgcHVibGljIGdldExvY2FsUG9pbnQoKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gdGhpcy5fbG9jYWxQb2ludC5jb3B5KCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGxvY2FsUG9pbnQoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldExvY2FsUG9pbnQoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgZGVmZW5zaXZlIGNvcHkgb2YgdGhlIHBhcmVudC1jb29yZGluYXRlLWZyYW1lIHBvaW50IG9mIHRoZSBkcmFnLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRQYXJlbnRQb2ludCgpOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLl9wYXJlbnRQb2ludC5jb3B5KCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHBhcmVudFBvaW50KCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5nZXRQYXJlbnRQb2ludCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBkZWZlbnNpdmUgY29weSBvZiB0aGUgbW9kZWwtY29vcmRpbmF0ZS1mcmFtZSBwb2ludCBvZiB0aGUgZHJhZy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TW9kZWxQb2ludCgpOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLl9tb2RlbFBvaW50LmNvcHkoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgbW9kZWxQb2ludCgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0TW9kZWxQb2ludCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBkZWZlbnNpdmUgY29weSBvZiB0aGUgbW9kZWwtY29vcmRpbmF0ZS1mcmFtZSBkZWx0YS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TW9kZWxEZWx0YSgpOiBWZWN0b3IyIHtcclxuICAgIHJldHVybiB0aGlzLl9tb2RlbERlbHRhLmNvcHkoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgbW9kZWxEZWx0YSgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0TW9kZWxEZWx0YSgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hcHMgYSBwb2ludCBmcm9tIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZSB0byBvdXIgZHJhZyB0YXJnZXQncyBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZS5cclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgbXV0YXRlcyB0aGUgaW5wdXQgdmVjdG9yIChmb3IgcGVyZm9ybWFuY2UpXHJcbiAgICpcclxuICAgKiBTaG91bGQgYmUgb3ZlcnJpZGRlbiBpZiBhIGN1c3RvbSB0cmFuc2Zvcm1hdGlvbiBpcyBuZWVkZWQuXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGdsb2JhbFRvUGFyZW50UG9pbnQoIGdsb2JhbFBvaW50OiBWZWN0b3IyICk6IFZlY3RvcjIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNQcmVzc2VkTGlzdGVuZXIoIHRoaXMgKSApO1xyXG4gICAgY29uc3QgcHJlc3NlZExpc3RlbmVyID0gdGhpcyBhcyBQcmVzc2VkRHJhZ0xpc3RlbmVyO1xyXG5cclxuICAgIGxldCByZWZlcmVuY2VSZXN1bHQ6IFZlY3RvcjIgfCB1bmRlZmluZWQ7XHJcbiAgICBpZiAoIGFzc2VydCApIHtcclxuICAgICAgcmVmZXJlbmNlUmVzdWx0ID0gcHJlc3NlZExpc3RlbmVyLnByZXNzZWRUcmFpbC5nbG9iYWxUb1BhcmVudFBvaW50KCBnbG9iYWxQb2ludCApO1xyXG4gICAgfVxyXG4gICAgcHJlc3NlZExpc3RlbmVyLnByZXNzZWRUcmFpbC5nZXRQYXJlbnRUcmFuc2Zvcm0oKS5nZXRJbnZlcnNlKCkubXVsdGlwbHlWZWN0b3IyKCBnbG9iYWxQb2ludCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZ2xvYmFsUG9pbnQuZXF1YWxzKCByZWZlcmVuY2VSZXN1bHQhICkgKTtcclxuICAgIHJldHVybiBnbG9iYWxQb2ludDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hcHMgYSBwb2ludCBmcm9tIHRoZSBkcmFnIHRhcmdldCdzIHBhcmVudCBjb29yZGluYXRlIGZyYW1lIHRvIGl0cyBsb2NhbCBjb29yZGluYXRlIGZyYW1lLlxyXG4gICAqXHJcbiAgICogTk9URTogVGhpcyBtdXRhdGVzIHRoZSBpbnB1dCB2ZWN0b3IgKGZvciBwZXJmb3JtYW5jZSlcclxuICAgKlxyXG4gICAqIFNob3VsZCBiZSBvdmVycmlkZGVuIGlmIGEgY3VzdG9tIHRyYW5zZm9ybWF0aW9uIGlzIG5lZWRlZC5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgcGFyZW50VG9Mb2NhbFBvaW50KCBwYXJlbnRQb2ludDogVmVjdG9yMiApOiBWZWN0b3IyIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzUHJlc3NlZExpc3RlbmVyKCB0aGlzICkgKTtcclxuICAgIGNvbnN0IHByZXNzZWRMaXN0ZW5lciA9IHRoaXMgYXMgUHJlc3NlZERyYWdMaXN0ZW5lcjtcclxuXHJcbiAgICBsZXQgcmVmZXJlbmNlUmVzdWx0OiBWZWN0b3IyO1xyXG4gICAgaWYgKCBhc3NlcnQgKSB7XHJcbiAgICAgIHJlZmVyZW5jZVJlc3VsdCA9IHByZXNzZWRMaXN0ZW5lci5wcmVzc2VkVHJhaWwubGFzdE5vZGUoKS5wYXJlbnRUb0xvY2FsUG9pbnQoIHBhcmVudFBvaW50ICk7XHJcbiAgICB9XHJcbiAgICBwcmVzc2VkTGlzdGVuZXIucHJlc3NlZFRyYWlsLmxhc3ROb2RlKCkuZ2V0VHJhbnNmb3JtKCkuZ2V0SW52ZXJzZSgpLm11bHRpcGx5VmVjdG9yMiggcGFyZW50UG9pbnQgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBhcmVudFBvaW50LmVxdWFscyggcmVmZXJlbmNlUmVzdWx0ISApICk7XHJcbiAgICByZXR1cm4gcGFyZW50UG9pbnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYXBzIGEgcG9pbnQgZnJvbSB0aGUgZHJhZyB0YXJnZXQncyBsb2NhbCBjb29yZGluYXRlIGZyYW1lIHRvIGl0cyBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZS5cclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgbXV0YXRlcyB0aGUgaW5wdXQgdmVjdG9yIChmb3IgcGVyZm9ybWFuY2UpXHJcbiAgICpcclxuICAgKiBTaG91bGQgYmUgb3ZlcnJpZGRlbiBpZiBhIGN1c3RvbSB0cmFuc2Zvcm1hdGlvbiBpcyBuZWVkZWQuXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGxvY2FsVG9QYXJlbnRQb2ludCggbG9jYWxQb2ludDogVmVjdG9yMiApOiBWZWN0b3IyIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzUHJlc3NlZExpc3RlbmVyKCB0aGlzICkgKTtcclxuICAgIGNvbnN0IHByZXNzZWRMaXN0ZW5lciA9IHRoaXMgYXMgUHJlc3NlZERyYWdMaXN0ZW5lcjtcclxuXHJcbiAgICBsZXQgcmVmZXJlbmNlUmVzdWx0OiBWZWN0b3IyO1xyXG4gICAgaWYgKCBhc3NlcnQgKSB7XHJcbiAgICAgIHJlZmVyZW5jZVJlc3VsdCA9IHByZXNzZWRMaXN0ZW5lci5wcmVzc2VkVHJhaWwubGFzdE5vZGUoKS5sb2NhbFRvUGFyZW50UG9pbnQoIGxvY2FsUG9pbnQgKTtcclxuICAgIH1cclxuICAgIHByZXNzZWRMaXN0ZW5lci5wcmVzc2VkVHJhaWwubGFzdE5vZGUoKS5nZXRNYXRyaXgoKS5tdWx0aXBseVZlY3RvcjIoIGxvY2FsUG9pbnQgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxvY2FsUG9pbnQuZXF1YWxzKCByZWZlcmVuY2VSZXN1bHQhICkgKTtcclxuICAgIHJldHVybiBsb2NhbFBvaW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFwcyBhIHBvaW50IGZyb20gdGhlIGRyYWcgdGFyZ2V0J3MgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUgdG8gdGhlIG1vZGVsIGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIG11dGF0ZXMgdGhlIGlucHV0IHZlY3RvciAoZm9yIHBlcmZvcm1hbmNlKVxyXG4gICAqXHJcbiAgICogU2hvdWxkIGJlIG92ZXJyaWRkZW4gaWYgYSBjdXN0b20gdHJhbnNmb3JtYXRpb24gaXMgbmVlZGVkLiBOb3RlIHRoYXQgYnkgZGVmYXVsdCwgdW5sZXNzIGEgdHJhbnNmb3JtIGlzIHByb3ZpZGVkLFxyXG4gICAqIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSB3aWxsIGJlIHRoZSBzYW1lIGFzIHRoZSBtb2RlbCBjb29yZGluYXRlIGZyYW1lLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBwYXJlbnRUb01vZGVsUG9pbnQoIHBhcmVudFBvaW50OiBWZWN0b3IyICk6IFZlY3RvcjIge1xyXG4gICAgaWYgKCB0aGlzLl90cmFuc2Zvcm0gKSB7XHJcbiAgICAgIGNvbnN0IHRyYW5zZm9ybSA9IHRoaXMuX3RyYW5zZm9ybSBpbnN0YW5jZW9mIFRyYW5zZm9ybTMgPyB0aGlzLl90cmFuc2Zvcm0gOiB0aGlzLl90cmFuc2Zvcm0udmFsdWU7XHJcblxyXG4gICAgICB0cmFuc2Zvcm0uZ2V0SW52ZXJzZSgpLm11bHRpcGx5VmVjdG9yMiggcGFyZW50UG9pbnQgKTtcclxuICAgIH1cclxuICAgIHJldHVybiBwYXJlbnRQb2ludDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hcHMgYSBwb2ludCBmcm9tIHRoZSBtb2RlbCBjb29yZGluYXRlIGZyYW1lIHRvIHRoZSBkcmFnIHRhcmdldCdzIHBhcmVudCBjb29yZGluYXRlIGZyYW1lLlxyXG4gICAqXHJcbiAgICogTk9URTogVGhpcyBtdXRhdGVzIHRoZSBpbnB1dCB2ZWN0b3IgKGZvciBwZXJmb3JtYW5jZSlcclxuICAgKlxyXG4gICAqIFNob3VsZCBiZSBvdmVycmlkZGVuIGlmIGEgY3VzdG9tIHRyYW5zZm9ybWF0aW9uIGlzIG5lZWRlZC4gTm90ZSB0aGF0IGJ5IGRlZmF1bHQsIHVubGVzcyBhIHRyYW5zZm9ybSBpcyBwcm92aWRlZCxcclxuICAgKiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUgd2lsbCBiZSB0aGUgc2FtZSBhcyB0aGUgbW9kZWwgY29vcmRpbmF0ZSBmcmFtZS5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgbW9kZWxUb1BhcmVudFBvaW50KCBtb2RlbFBvaW50OiBWZWN0b3IyICk6IFZlY3RvcjIge1xyXG4gICAgaWYgKCB0aGlzLl90cmFuc2Zvcm0gKSB7XHJcbiAgICAgIGNvbnN0IHRyYW5zZm9ybSA9IHRoaXMuX3RyYW5zZm9ybSBpbnN0YW5jZW9mIFRyYW5zZm9ybTMgPyB0aGlzLl90cmFuc2Zvcm0gOiB0aGlzLl90cmFuc2Zvcm0udmFsdWU7XHJcblxyXG4gICAgICB0cmFuc2Zvcm0uZ2V0TWF0cml4KCkubXVsdGlwbHlWZWN0b3IyKCBtb2RlbFBvaW50ICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbW9kZWxQb2ludDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFwcGx5IGEgbWFwcGluZyBmcm9tIHRoZSBkcmFnIHRhcmdldCdzIG1vZGVsIHBvc2l0aW9uIHRvIGFuIGFsbG93ZWQgbW9kZWwgcG9zaXRpb24uXHJcbiAgICpcclxuICAgKiBBIGNvbW1vbiBleGFtcGxlIGlzIHVzaW5nIGRyYWdCb3VuZHMsIHdoZXJlIHRoZSBwb3NpdGlvbiBvZiB0aGUgZHJhZyB0YXJnZXQgaXMgY29uc3RyYWluZWQgdG8gd2l0aGluIGEgYm91bmRpbmdcclxuICAgKiBib3guIFRoaXMgaXMgZG9uZSBieSBtYXBwaW5nIHBvaW50cyBvdXRzaWRlIHRoZSBib3VuZGluZyBib3ggdG8gdGhlIGNsb3Nlc3QgcG9zaXRpb24gaW5zaWRlIHRoZSBib3guIE1vcmVcclxuICAgKiBnZW5lcmFsIG1hcHBpbmdzIGNhbiBiZSB1c2VkLlxyXG4gICAqXHJcbiAgICogU2hvdWxkIGJlIG92ZXJyaWRkZW4gKG9yIHVzZSBtYXBQb3NpdGlvbikgaWYgYSBjdXN0b20gdHJhbnNmb3JtYXRpb24gaXMgbmVlZGVkLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMgLSBBIHBvaW50IGluIHRoZSBtb2RlbCBjb29yZGluYXRlIGZyYW1lXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIG1hcE1vZGVsUG9pbnQoIG1vZGVsUG9pbnQ6IFZlY3RvcjIgKTogVmVjdG9yMiB7XHJcbiAgICBpZiAoIHRoaXMuX21hcFBvc2l0aW9uICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5fbWFwUG9zaXRpb24oIG1vZGVsUG9pbnQgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLl9kcmFnQm91bmRzUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9kcmFnQm91bmRzUHJvcGVydHkudmFsdWUuY2xvc2VzdFBvaW50VG8oIG1vZGVsUG9pbnQgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gbW9kZWxQb2ludDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE11dGF0ZXMgdGhlIHBhcmVudFBvaW50IGdpdmVuIHRvIGFjY291bnQgZm9yIHRoZSBpbml0aWFsIHBvaW50ZXIncyBvZmZzZXQgZnJvbSB0aGUgZHJhZyB0YXJnZXQncyBvcmlnaW4uXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGFwcGx5UGFyZW50T2Zmc2V0KCBwYXJlbnRQb2ludDogVmVjdG9yMiApOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy5fb2Zmc2V0UG9zaXRpb24gKSB7XHJcbiAgICAgIHBhcmVudFBvaW50LmFkZCggdGhpcy5fb2Zmc2V0UG9zaXRpb24oIHBhcmVudFBvaW50LCB0aGlzIGFzIFByZXNzZWREcmFnTGlzdGVuZXIgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIERvbid0IGFwcGx5IGFueSBvZmZzZXQgaWYgYXBwbHlPZmZzZXQgaXMgZmFsc2VcclxuICAgIGlmICggdGhpcy5fYXBwbHlPZmZzZXQgKSB7XHJcbiAgICAgIGlmICggdGhpcy5fdXNlUGFyZW50T2Zmc2V0ICkge1xyXG4gICAgICAgIHBhcmVudFBvaW50LmFkZCggdGhpcy5fcGFyZW50T2Zmc2V0ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8gQWRkIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gb3VyIGxvY2FsIG9yaWdpbiAoaW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lKSBhbmQgdGhlIGxvY2FsIHBvaW50IChpbiB0aGUgc2FtZVxyXG4gICAgICAgIC8vIHBhcmVudCBjb29yZGluYXRlIGZyYW1lKS5cclxuICAgICAgICBwYXJlbnRQb2ludC5zdWJ0cmFjdCggdGhpcy5sb2NhbFRvUGFyZW50UG9pbnQoIHNjcmF0Y2hWZWN0b3IyQS5zZXQoIHRoaXMuX2xvY2FsUG9pbnQgKSApICk7XHJcbiAgICAgICAgcGFyZW50UG9pbnQuYWRkKCB0aGlzLmxvY2FsVG9QYXJlbnRQb2ludCggc2NyYXRjaFZlY3RvcjJBLnNldFhZKCAwLCAwICkgKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmlnZ2VycyBhbiB1cGRhdGUgb2YgdGhlIGRyYWcgcG9zaXRpb24sIHBvdGVudGlhbGx5IGNoYW5naW5nIHBvc2l0aW9uIHByb3BlcnRpZXMuXHJcbiAgICpcclxuICAgKiBTaG91bGQgYmUgY2FsbGVkIHdoZW4gc29tZXRoaW5nIHRoYXQgY2hhbmdlcyB0aGUgb3V0cHV0IHBvc2l0aW9ucyBvZiB0aGUgZHJhZyBvY2N1cnMgKG1vc3Qgb2Z0ZW4sIGEgZHJhZyBldmVudFxyXG4gICAqIGl0c2VsZikuXHJcbiAgICovXHJcbiAgcHVibGljIHJlcG9zaXRpb24oIGdsb2JhbFBvaW50OiBWZWN0b3IyICk6IHZvaWQge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCAnRHJhZ0xpc3RlbmVyIHJlcG9zaXRpb24nICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc1ByZXNzZWRMaXN0ZW5lciggdGhpcyApICk7XHJcbiAgICBjb25zdCBwcmVzc2VkTGlzdGVuZXIgPSB0aGlzIGFzIFByZXNzZWREcmFnTGlzdGVuZXI7XHJcblxyXG4gICAgdGhpcy5fZ2xvYmFsUG9pbnQuc2V0KCBnbG9iYWxQb2ludCApO1xyXG5cclxuICAgIC8vIFVwZGF0ZSBwYXJlbnRQb2ludCBtdXRhYmx5LlxyXG4gICAgdGhpcy5hcHBseVBhcmVudE9mZnNldCggdGhpcy5nbG9iYWxUb1BhcmVudFBvaW50KCB0aGlzLl9wYXJlbnRQb2ludC5zZXQoIGdsb2JhbFBvaW50ICkgKSApO1xyXG5cclxuICAgIC8vIFRvIGNvbXB1dGUgdGhlIGRlbHRhIChuZXcgLSBvbGQpLCB3ZSBmaXJzdCBtdXRhdGUgaXQgdG8gKC1vbGQpXHJcbiAgICB0aGlzLl9tb2RlbERlbHRhLnNldCggdGhpcy5fbW9kZWxQb2ludCApLm5lZ2F0ZSgpO1xyXG5cclxuICAgIC8vIENvbXB1dGUgdGhlIG1vZGVsUG9pbnQgZnJvbSB0aGUgcGFyZW50UG9pbnRcclxuICAgIHRoaXMuX21vZGVsUG9pbnQuc2V0KCB0aGlzLm1hcE1vZGVsUG9pbnQoIHRoaXMucGFyZW50VG9Nb2RlbFBvaW50KCBzY3JhdGNoVmVjdG9yMkEuc2V0KCB0aGlzLl9wYXJlbnRQb2ludCApICkgKSApO1xyXG5cclxuICAgIC8vIENvbXBsZXRlIHRoZSBkZWx0YSBjb21wdXRhdGlvblxyXG4gICAgdGhpcy5fbW9kZWxEZWx0YS5hZGQoIHRoaXMuX21vZGVsUG9pbnQgKTtcclxuXHJcbiAgICAvLyBBcHBseSBhbnkgbWFwcGluZyBjaGFuZ2VzIGJhY2sgdG8gdGhlIHBhcmVudCBwb2ludFxyXG4gICAgdGhpcy5tb2RlbFRvUGFyZW50UG9pbnQoIHRoaXMuX3BhcmVudFBvaW50LnNldCggdGhpcy5fbW9kZWxQb2ludCApICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl90cmFuc2xhdGVOb2RlICkge1xyXG4gICAgICBwcmVzc2VkTGlzdGVuZXIucHJlc3NlZFRyYWlsLmxhc3ROb2RlKCkudHJhbnNsYXRpb24gPSB0aGlzLl9wYXJlbnRQb2ludDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMuX3Bvc2l0aW9uUHJvcGVydHkgKSB7XHJcbiAgICAgIHRoaXMuX3Bvc2l0aW9uUHJvcGVydHkudmFsdWUgPSB0aGlzLl9tb2RlbFBvaW50LmNvcHkoKTsgLy8gSW5jbHVkZSBhbiBleHRyYSByZWZlcmVuY2Ugc28gdGhhdCBpdCB3aWxsIGNoYW5nZS5cclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdpdGggJ3RvdWNoZW50ZXInIGV2ZW50cyAocGFydCBvZiB0aGUgbGlzdGVuZXIgQVBJKS4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBOT1RFOiBEbyBub3QgY2FsbCBkaXJlY3RseS4gU2VlIHRoZSBwcmVzcyBtZXRob2QgaW5zdGVhZC5cclxuICAgKi9cclxuICBwdWJsaWMgdG91Y2hlbnRlciggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCApOiB2b2lkIHtcclxuICAgIGlmICggZXZlbnQucG9pbnRlci5pc0Rvd25Qcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgdGhpcy50cnlUb3VjaFNuYWcoIGV2ZW50ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2l0aCAndG91Y2htb3ZlJyBldmVudHMgKHBhcnQgb2YgdGhlIGxpc3RlbmVyIEFQSSkuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogTk9URTogRG8gbm90IGNhbGwgZGlyZWN0bHkuIFNlZSB0aGUgcHJlc3MgbWV0aG9kIGluc3RlYWQuXHJcbiAgICovXHJcbiAgcHVibGljIHRvdWNobW92ZSggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCApOiB2b2lkIHtcclxuICAgIHRoaXMudHJ5VG91Y2hTbmFnKCBldmVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gYW4gYW5jZXN0b3IncyB0cmFuc2Zvcm0gaGFzIGNoYW5nZWQgKHdoZW4gdHJhY2tBbmNlc3RvcnMgaXMgdHJ1ZSkuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhbmNlc3RvclRyYW5zZm9ybWVkKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNQcmVzc2VkTGlzdGVuZXIoIHRoaXMgKSApO1xyXG4gICAgY29uc3QgcHJlc3NlZExpc3RlbmVyID0gdGhpcyBhcyBQcmVzc2VkRHJhZ0xpc3RlbmVyO1xyXG4gICAgY29uc3QgcG9pbnQgPSBwcmVzc2VkTGlzdGVuZXIucG9pbnRlci5wb2ludDtcclxuXHJcbiAgICBpZiAoIHBvaW50ICkge1xyXG4gICAgICAvLyBSZXBvc2l0aW9uIGJhc2VkIG9uIHRoZSBjdXJyZW50IHBvaW50LlxyXG4gICAgICB0aGlzLnJlcG9zaXRpb24oIHBvaW50ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBdHRhY2hlcyBvdXIgdHJhbnNmb3JtIHRyYWNrZXIgKGJlZ2lucyBsaXN0ZW5pbmcgdG8gdGhlIGFuY2VzdG9yIHRyYW5zZm9ybXMpXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhdHRhY2hUcmFuc2Zvcm1UcmFja2VyKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNQcmVzc2VkTGlzdGVuZXIoIHRoaXMgKSApO1xyXG4gICAgY29uc3QgcHJlc3NlZExpc3RlbmVyID0gdGhpcyBhcyBQcmVzc2VkRHJhZ0xpc3RlbmVyO1xyXG5cclxuICAgIGlmICggdGhpcy5fdHJhY2tBbmNlc3RvcnMgKSB7XHJcbiAgICAgIHRoaXMuX3RyYW5zZm9ybVRyYWNrZXIgPSBuZXcgVHJhbnNmb3JtVHJhY2tlciggcHJlc3NlZExpc3RlbmVyLnByZXNzZWRUcmFpbC5jb3B5KCkucmVtb3ZlRGVzY2VuZGFudCgpICk7XHJcbiAgICAgIHRoaXMuX3RyYW5zZm9ybVRyYWNrZXIuYWRkTGlzdGVuZXIoIHRoaXMuX3RyYW5zZm9ybVRyYWNrZXJMaXN0ZW5lciApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0YWNoZXMgb3VyIHRyYW5zZm9ybSB0cmFja2VyIChzdG9wcyBsaXN0ZW5pbmcgdG8gdGhlIGFuY2VzdG9yIHRyYW5zZm9ybXMpXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBkZXRhY2hUcmFuc2Zvcm1UcmFja2VyKCk6IHZvaWQge1xyXG4gICAgaWYgKCB0aGlzLl90cmFuc2Zvcm1UcmFja2VyICkge1xyXG4gICAgICB0aGlzLl90cmFuc2Zvcm1UcmFja2VyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLl90cmFuc2Zvcm1UcmFja2VyTGlzdGVuZXIgKTtcclxuICAgICAgdGhpcy5fdHJhbnNmb3JtVHJhY2tlci5kaXNwb3NlKCk7XHJcbiAgICAgIHRoaXMuX3RyYW5zZm9ybVRyYWNrZXIgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgZHJhZyBib3VuZHMgb2YgdGhlIGxpc3RlbmVyLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXREcmFnQm91bmRzKCk6IEJvdW5kczIgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9kcmFnQm91bmRzUHJvcGVydHkudmFsdWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGRyYWdCb3VuZHMoKTogQm91bmRzMiB8IG51bGwgeyByZXR1cm4gdGhpcy5nZXREcmFnQm91bmRzKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgZHJhZyB0cmFuc2Zvcm0gb2YgdGhlIGxpc3RlbmVyLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRUcmFuc2Zvcm0oIHRyYW5zZm9ybTogVHJhbnNmb3JtMyB8IFRSZWFkT25seVByb3BlcnR5PFRyYW5zZm9ybTM+IHwgbnVsbCApOiB2b2lkIHtcclxuICAgIHRoaXMuX3RyYW5zZm9ybSA9IHRyYW5zZm9ybTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgdHJhbnNmb3JtKCB0cmFuc2Zvcm06IFRyYW5zZm9ybTMgfCBUUmVhZE9ubHlQcm9wZXJ0eTxUcmFuc2Zvcm0zPiB8IG51bGwgKSB7IHRoaXMuc2V0VHJhbnNmb3JtKCB0cmFuc2Zvcm0gKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHRyYW5zZm9ybSgpOiBUcmFuc2Zvcm0zIHwgVFJlYWRPbmx5UHJvcGVydHk8VHJhbnNmb3JtMz4gfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0VHJhbnNmb3JtKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgdHJhbnNmb3JtIG9mIHRoZSBsaXN0ZW5lci5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VHJhbnNmb3JtKCk6IFRyYW5zZm9ybTMgfCBUUmVhZE9ubHlQcm9wZXJ0eTxUcmFuc2Zvcm0zPiB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVycnVwdHMgdGhlIGxpc3RlbmVyLCByZWxlYXNpbmcgaXQgKGNhbmNlbGluZyBiZWhhdmlvcikuXHJcbiAgICpcclxuICAgKiBUaGlzIGVmZmVjdGl2ZWx5IHJlbGVhc2VzL2VuZHMgdGhlIHByZXNzLCBhbmQgc2V0cyB0aGUgYGludGVycnVwdGVkYCBmbGFnIHRvIHRydWUgd2hpbGUgZmlyaW5nIHRoZXNlIGV2ZW50c1xyXG4gICAqIHNvIHRoYXQgY29kZSBjYW4gZGV0ZXJtaW5lIHdoZXRoZXIgYSByZWxlYXNlL2VuZCBoYXBwZW5lZCBuYXR1cmFsbHksIG9yIHdhcyBjYW5jZWxlZCBpbiBzb21lIHdheS5cclxuICAgKlxyXG4gICAqIFRoaXMgY2FuIGJlIGNhbGxlZCBtYW51YWxseSwgYnV0IGNhbiBhbHNvIGJlIGNhbGxlZCB0aHJvdWdoIG5vZGUuaW50ZXJydXB0U3VidHJlZUlucHV0KCkuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGludGVycnVwdCgpOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy5wb2ludGVyICYmIHRoaXMucG9pbnRlci5pc1RvdWNoTGlrZSgpICkge1xyXG4gICAgICB0aGlzLl9sYXN0SW50ZXJydXB0ZWRUb3VjaExpa2VQb2ludGVyID0gdGhpcy5wb2ludGVyO1xyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyLmludGVycnVwdCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIGEgcHJlc3MgY2FuIGJlIHN0YXJ0ZWQgd2l0aCBhIHBhcnRpY3VsYXIgZXZlbnQuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGNhblByZXNzKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCBldmVudC5wb2ludGVyID09PSB0aGlzLl9sYXN0SW50ZXJydXB0ZWRUb3VjaExpa2VQb2ludGVyICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHN1cGVyLmNhblByZXNzKCBldmVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlzcG9zZXMgdGhlIGxpc3RlbmVyLCByZWxlYXNpbmcgcmVmZXJlbmNlcy4gSXQgc2hvdWxkIG5vdCBiZSB1c2VkIGFmdGVyIHRoaXMuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdEcmFnTGlzdGVuZXIgZGlzcG9zZScgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIHRoaXMuX2RyYWdBY3Rpb24uZGlzcG9zZSgpO1xyXG5cclxuICAgIHRoaXMuZGV0YWNoVHJhbnNmb3JtVHJhY2tlcigpO1xyXG5cclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhbiBpbnB1dCBsaXN0ZW5lciB0aGF0IGZvcndhcmRzIGV2ZW50cyB0byB0aGUgc3BlY2lmaWVkIGlucHV0IGxpc3RlbmVyLiBUaGUgdGFyZ2V0IGxpc3RlbmVyIHNob3VsZFxyXG4gICAqIHByb2JhYmx5IGJlIHVzaW5nIFByZXNzTGlzdGVuZXIub3B0aW9ucy50YXJnZXROb2RlIHNvIHRoYXQgdGhlIGZvcndhcmRlZCBkcmFnIGhhcyB0aGUgY29ycmVjdCBUcmFpbFxyXG4gICAqXHJcbiAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy82MzlcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZUZvcndhcmRpbmdMaXN0ZW5lciggZG93bjogKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICkgPT4gdm9pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zPzogQ3JlYXRlRm9yd2FyZGluZ0xpc3RlbmVyT3B0aW9ucyApOiBUSW5wdXRMaXN0ZW5lciB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDcmVhdGVGb3J3YXJkaW5nTGlzdGVuZXJPcHRpb25zLCBDcmVhdGVGb3J3YXJkaW5nTGlzdGVuZXJPcHRpb25zPigpKCB7XHJcbiAgICAgIGFsbG93VG91Y2hTbmFnOiB0cnVlIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvOTk5XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBkb3duKCBldmVudCApIHtcclxuICAgICAgICBpZiAoIGV2ZW50LmNhblN0YXJ0UHJlc3MoKSApIHtcclxuICAgICAgICAgIGRvd24oIGV2ZW50ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB0b3VjaGVudGVyKCBldmVudCApIHtcclxuICAgICAgICBvcHRpb25zLmFsbG93VG91Y2hTbmFnICYmIHRoaXMuZG93biEoIGV2ZW50ICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHRvdWNobW92ZSggZXZlbnQgKSB7XHJcbiAgICAgICAgb3B0aW9ucy5hbGxvd1RvdWNoU25hZyAmJiB0aGlzLmRvd24hKCBldmVudCApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ0RyYWdMaXN0ZW5lcicsIERyYWdMaXN0ZW5lciApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFlBQVksTUFBTSxvQ0FBb0M7QUFJN0QsT0FBT0MsVUFBVSxNQUFNLCtCQUErQjtBQUN0RCxPQUFPQyxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLFNBQVMsTUFBTSxvQ0FBb0M7QUFFMUQsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxZQUFZLE1BQU0sb0NBQW9DO0FBQzdELE9BQU9DLE1BQU0sTUFBTSw4QkFBOEI7QUFDakQsU0FBOENDLGFBQWEsRUFBa0dDLE9BQU8sRUFBRUMsWUFBWSxFQUFrQkMsZ0JBQWdCLFFBQVEsZUFBZTtBQUMzTyxPQUFPQyxRQUFRLE1BQU0sOEJBQThCOztBQUVuRDtBQUNBLE1BQU1DLGVBQWUsR0FBRyxJQUFJVixPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztBQWtGM0MsTUFBTVcsaUJBQWlCLEdBQUtDLFFBQXNCLElBQXVD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