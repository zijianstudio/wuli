// Copyright 2013-2022, University of Colorado Boulder

/**
 * Basic dragging for a node.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import deprecationWarning from '../../../phet-core/js/deprecationWarning.js';
import merge from '../../../phet-core/js/merge.js';
import EventType from '../../../tandem/js/EventType.js';
import PhetioAction from '../../../tandem/js/PhetioAction.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { Mouse, scenery, SceneryEvent } from '../imports.js';

/**
 * @deprecated - please use DragListener for new code
 */
class SimpleDragHandler extends PhetioObject {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    assert && deprecationWarning('SimpleDragHandler is deprecated, please use DragListener instead');
    options = merge({
      start: null,
      // {null|function(SceneryEvent,Trail)} called when a drag is started
      drag: null,
      // {null|function(SceneryEvent,Trail)} called when pointer moves
      end: null,
      // {null|function(SceneryEvent,Trail)} called when a drag is ended

      // {null|function} Called when the pointer moves.
      // Signature is translate( { delta: Vector2, oldPosition: Vector2, position: Vector2 } )
      translate: null,
      //

      // {boolean|function:boolean}
      allowTouchSnag: false,
      // allow changing the mouse button that activates the drag listener.
      // -1 should activate on any mouse button, 0 on left, 1 for middle, 2 for right, etc.
      mouseButton: 0,
      // while dragging with the mouse, sets the cursor to this value
      // (or use null to not override the cursor while dragging)
      dragCursor: 'pointer',
      // when set to true, the handler will get "attached" to a pointer during use, preventing the pointer from starting
      // a drag via something like PressListener
      attach: true,
      // phetio
      tandem: Tandem.REQUIRED,
      phetioState: false,
      phetioEventType: EventType.USER,
      phetioReadOnly: true
    }, options);
    super();
    this.options = options; // @private

    // @public (read-only) {BooleanProperty} - indicates whether dragging is in progress
    this.isDraggingProperty = new BooleanProperty(false, {
      phetioReadOnly: options.phetioReadOnly,
      phetioState: false,
      tandem: options.tandem.createTandem('isDraggingProperty'),
      phetioDocumentation: 'Indicates whether the object is dragging'
    });

    // @public {Pointer|null} - the pointer doing the current dragging
    this.pointer = null;

    // @public {Trail|null} - stores the path to the node that is being dragged
    this.trail = null;

    // @public {Transform3|null} - transform of the trail to our node (but not including our node, so we can prepend
    // the deltas)
    this.transform = null;

    // @public {Node|null} - the node that we are handling the drag for
    this.node = null;

    // @protected {Vector2|null} - the location of the drag at the previous event (so we can calculate a delta)
    this.lastDragPoint = null;

    // @protected {Matrix3|null} - the node's transform at the start of the drag, so we can reset on a touch cancel
    this.startTransformMatrix = null;

    // @public {number|undefined} - tracks which mouse button was pressed, so we can handle that specifically
    this.mouseButton = undefined;

    // @public {boolean} - This will be set to true for endDrag calls that are the result of the listener being
    // interrupted. It will be set back to false after the endDrag is finished.
    this.interrupted = false;

    // @private {Pointer|null} - There are cases like https://github.com/phetsims/equality-explorer/issues/97 where if
    // a touchenter starts a drag that is IMMEDIATELY interrupted, the touchdown would start another drag. We record
    // interruptions here so that we can prevent future enter/down events from the same touch pointer from triggering
    // another startDrag.
    this.lastInterruptedTouchLikePointer = null;

    // @private {boolean}
    this._attach = options.attach;

    // @private {Action}
    this.dragStartAction = new PhetioAction((point, event) => {
      if (this.dragging) {
        return;
      }
      sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('SimpleDragHandler startDrag');
      sceneryLog && sceneryLog.InputListener && sceneryLog.push();

      // set a flag on the pointer so it won't pick up other nodes
      if (this._attach) {
        // Only set the `dragging` flag on the pointer if we have attach:true
        // See https://github.com/phetsims/scenery/issues/206
        event.pointer.dragging = true;
      }
      event.pointer.cursor = this.options.dragCursor;
      event.pointer.addInputListener(this.dragListener, this.options.attach);

      // mark the Intent of this pointer listener to indicate that we want to drag and therefore potentially
      // change the behavior of other listeners in the dispatch phase
      event.pointer.reserveForDrag();

      // set all of our persistent information
      this.isDraggingProperty.set(true);
      this.pointer = event.pointer;
      this.trail = event.trail.subtrailTo(event.currentTarget, true);
      this.transform = this.trail.getTransform();
      this.node = event.currentTarget;
      this.lastDragPoint = event.pointer.point;
      this.startTransformMatrix = event.currentTarget.getMatrix().copy();
      // event.domEvent may not exist for touch-to-snag
      this.mouseButton = event.pointer instanceof Mouse ? event.domEvent.button : undefined;
      if (this.options.start) {
        this.options.start.call(null, event, this.trail);
      }
      sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }, {
      tandem: options.tandem.createTandem('dragStartAction'),
      phetioReadOnly: options.phetioReadOnly,
      parameters: [{
        name: 'point',
        phetioType: Vector2.Vector2IO,
        phetioDocumentation: 'the position of the drag start in view coordinates'
      }, {
        phetioPrivate: true,
        valueType: [SceneryEvent, null]
      }]
    });

    // @private {Action}
    this.dragAction = new PhetioAction((point, event) => {
      if (!this.dragging || this.isDisposed) {
        return;
      }
      const globalDelta = this.pointer.point.minus(this.lastDragPoint);

      // ignore move events that have 0-length. Chrome seems to be auto-firing these on Windows,
      // see https://code.google.com/p/chromium/issues/detail?id=327114
      if (globalDelta.magnitudeSquared === 0) {
        return;
      }
      const delta = this.transform.inverseDelta2(globalDelta);
      assert && assert(event.pointer === this.pointer, 'Wrong pointer in move');
      sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`SimpleDragHandler (pointer) move for ${this.trail.toString()}`);
      sceneryLog && sceneryLog.InputListener && sceneryLog.push();

      // move by the delta between the previous point, using the precomputed transform
      // prepend the translation on the node, so we can ignore whatever other transform state the node has
      if (this.options.translate) {
        const translation = this.node.getMatrix().getTranslation();
        this.options.translate.call(null, {
          delta: delta,
          oldPosition: translation,
          position: translation.plus(delta)
        });
      }
      this.lastDragPoint = this.pointer.point;
      if (this.options.drag) {
        // TODO: add the position in to the listener
        const saveCurrentTarget = event.currentTarget;
        event.currentTarget = this.node; // #66: currentTarget on a pointer is null, so set it to the node we're dragging
        this.options.drag.call(null, event, this.trail); // new position (old position?) delta
        event.currentTarget = saveCurrentTarget; // be polite to other listeners, restore currentTarget
      }

      sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }, {
      phetioHighFrequency: true,
      phetioReadOnly: options.phetioReadOnly,
      tandem: options.tandem.createTandem('dragAction'),
      parameters: [{
        name: 'point',
        phetioType: Vector2.Vector2IO,
        phetioDocumentation: 'the position of the drag in view coordinates'
      }, {
        phetioPrivate: true,
        valueType: [SceneryEvent, null]
      }]
    });

    // @private {Action}
    this.dragEndAction = new PhetioAction((point, event) => {
      if (!this.dragging) {
        return;
      }
      sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('SimpleDragHandler endDrag');
      sceneryLog && sceneryLog.InputListener && sceneryLog.push();
      if (this._attach) {
        // Only set the `dragging` flag on the pointer if we have attach:true
        // See https://github.com/phetsims/scenery/issues/206
        this.pointer.dragging = false;
      }
      this.pointer.cursor = null;
      this.pointer.removeInputListener(this.dragListener);
      this.isDraggingProperty.set(false);
      if (this.options.end) {
        // drag end may be triggered programmatically and hence event and trail may be undefined
        this.options.end.call(null, event, this.trail);
      }

      // release our reference
      this.pointer = null;
      sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }, {
      tandem: options.tandem.createTandem('dragEndAction'),
      phetioReadOnly: options.phetioReadOnly,
      parameters: [{
        name: 'point',
        phetioType: Vector2.Vector2IO,
        phetioDocumentation: 'the position of the drag end in view coordinates'
      }, {
        phetioPrivate: true,
        isValidValue: value => {
          return value === null || value instanceof SceneryEvent ||
          // When interrupted, an object literal is used to signify the interruption,
          // see SimpleDragHandler.interrupt
          value.pointer && value.currentTarget;
        }
      }]
    });

    // @protected {function} - if an ancestor is transformed, pin our node
    this.transformListener = {
      transform: args => {
        if (!this.trail.isExtensionOf(args.trail, true)) {
          return;
        }
        const newMatrix = args.trail.getMatrix();
        const oldMatrix = this.transform.getMatrix();

        // if A was the trail's old transform, B is the trail's new transform, we need to apply (B^-1 A) to our node
        this.node.prependMatrix(newMatrix.inverted().timesMatrix(oldMatrix));

        // store the new matrix so we can do deltas using it now
        this.transform.setMatrix(newMatrix);
      }
    };

    // @protected {function} - this listener gets added to the pointer when it starts dragging our node
    this.dragListener = {
      // mouse/touch up
      up: event => {
        if (!this.dragging || this.isDisposed) {
          return;
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`SimpleDragHandler (pointer) up for ${this.trail.toString()}`);
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        assert && assert(event.pointer === this.pointer, 'Wrong pointer in up');
        if (!(event.pointer instanceof Mouse) || event.domEvent.button === this.mouseButton) {
          const saveCurrentTarget = event.currentTarget;
          event.currentTarget = this.node; // #66: currentTarget on a pointer is null, so set it to the node we're dragging
          this.endDrag(event);
          event.currentTarget = saveCurrentTarget; // be polite to other listeners, restore currentTarget
        }

        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
      },
      // touch cancel
      cancel: event => {
        if (!this.dragging || this.isDisposed) {
          return;
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`SimpleDragHandler (pointer) cancel for ${this.trail.toString()}`);
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        assert && assert(event.pointer === this.pointer, 'Wrong pointer in cancel');
        const saveCurrentTarget = event.currentTarget;
        event.currentTarget = this.node; // #66: currentTarget on a pointer is null, so set it to the node we're dragging
        this.endDrag(event);
        event.currentTarget = saveCurrentTarget; // be polite to other listeners, restore currentTarget

        // since it's a cancel event, go back!
        if (!this.transform) {
          this.node.setMatrix(this.startTransformMatrix);
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
      },
      // mouse/touch move
      move: event => {
        this.dragAction.execute(event.pointer.point, event);
      },
      // pointer interruption
      interrupt: () => {
        this.interrupt();
      }
    };
    this.initializePhetioObject({}, options);
  }

  // @private
  get dragging() {
    return this.isDraggingProperty.get();
  }
  set dragging(d) {
    assert && assert(false, 'illegal call to set dragging on SimpleDragHandler');
  }

  /**
   * @public
   *
   * @param {SceneryEvent} event
   */
  startDrag(event) {
    this.dragStartAction.execute(event.pointer.point, event);
  }

  /**
   * @public
   *
   * @param {SceneryEvent} event
   */
  endDrag(event) {
    // Signify drag ended.  In the case of programmatically ended drags, signify drag ended at 0,0.
    // see https://github.com/phetsims/ph-scale-basics/issues/43
    this.dragEndAction.execute(event ? event.pointer.point : Vector2.ZERO, event);
  }

  /**
   * Called when input is interrupted on this listener, see https://github.com/phetsims/scenery/issues/218
   * @public
   */
  interrupt() {
    if (this.dragging) {
      sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('SimpleDragHandler interrupt');
      sceneryLog && sceneryLog.InputListener && sceneryLog.push();
      this.interrupted = true;
      if (this.pointer && this.pointer.isTouchLike()) {
        this.lastInterruptedTouchLikePointer = this.pointer;
      }

      // We create a synthetic event here, as there is no available event here.
      this.endDrag({
        pointer: this.pointer,
        currentTarget: this.node
      });
      this.interrupted = false;
      sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
  }

  /**
   * @public
   *
   * @param {SceneryEvent} event
   */
  tryToSnag(event) {
    // don't allow drag attempts that use the wrong mouse button (-1 indicates any mouse button works)
    if (event.pointer instanceof Mouse && event.domEvent && this.options.mouseButton !== event.domEvent.button && this.options.mouseButton !== -1) {
      return;
    }

    // If we're disposed, we can't start new drags.
    if (this.isDisposed) {
      return;
    }

    // only start dragging if the pointer isn't dragging anything, we aren't being dragged, and if it's a mouse it's button is down
    if (!this.dragging && (
    // Don't check pointer.dragging if we don't attach, see https://github.com/phetsims/scenery/issues/206
    !event.pointer.dragging || !this._attach) && event.pointer !== this.lastInterruptedTouchLikePointer && event.canStartPress()) {
      this.startDrag(event);
    }
  }

  /**
   * @public
   *
   * @param {SceneryEvent} event
   */
  tryTouchToSnag(event) {
    // allow touches to start a drag by moving "over" this node, and allows clients to specify custom logic for when touchSnag is allowable
    if (this.options.allowTouchSnag && (this.options.allowTouchSnag === true || this.options.allowTouchSnag(event))) {
      this.tryToSnag(event);
    }
  }

  /*---------------------------------------------------------------------------*
   * events called from the node input listener
   *----------------------------------------------------------------------------*/

  /**
   * Event listener method - mouse/touch down on this node
   * @public (scenery-internal)
   *
   * @param {SceneryEvent} event
   */
  down(event) {
    this.tryToSnag(event);
  }

  /**
   * Event listener method - touch enters this node
   * @public (scenery-internal)
   *
   * @param {SceneryEvent} event
   */
  touchenter(event) {
    this.tryTouchToSnag(event);
  }

  /**
   * Event listener method - touch moves over this node
   * @public (scenery-internal)
   *
   * @param {SceneryEvent} event
   */
  touchmove(event) {
    this.tryTouchToSnag(event);
  }

  /**
   * Disposes this listener, releasing any references it may have to a pointer.
   * @public
   */
  dispose() {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('SimpleDragHandler dispose');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    if (this.dragging) {
      if (this._attach) {
        // Only set the `dragging` flag on the pointer if we have attach:true
        // See https://github.com/phetsims/scenery/issues/206
        this.pointer.dragging = false;
      }
      this.pointer.cursor = null;
      this.pointer.removeInputListener(this.dragListener);
    }
    this.isDraggingProperty.dispose();

    // It seemed without disposing these led to a memory leak in Energy Skate Park: Basics
    this.dragEndAction.dispose();
    this.dragAction.dispose();
    this.dragStartAction.dispose();
    super.dispose();
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Creates an input listener that forwards events to the specified input listener
   * @public
   *
   * See https://github.com/phetsims/scenery/issues/639
   *
   * @param {function(SceneryEvent)} down - down function to be added to the input listener
   * @param {Object} [options]
   * @returns {Object} a scenery input listener
   */
  static createForwardingListener(down, options) {
    options = merge({
      allowTouchSnag: false
    }, options);
    return {
      down: event => {
        if (!event.pointer.dragging && event.canStartPress()) {
          down(event);
        }
      },
      touchenter: function (event) {
        options.allowTouchSnag && this.down(event);
      },
      touchmove: function (event) {
        options.allowTouchSnag && this.down(event);
      }
    };
  }
}
scenery.register('SimpleDragHandler', SimpleDragHandler);
export default SimpleDragHandler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJWZWN0b3IyIiwiZGVwcmVjYXRpb25XYXJuaW5nIiwibWVyZ2UiLCJFdmVudFR5cGUiLCJQaGV0aW9BY3Rpb24iLCJQaGV0aW9PYmplY3QiLCJUYW5kZW0iLCJNb3VzZSIsInNjZW5lcnkiLCJTY2VuZXJ5RXZlbnQiLCJTaW1wbGVEcmFnSGFuZGxlciIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsImFzc2VydCIsInN0YXJ0IiwiZHJhZyIsImVuZCIsInRyYW5zbGF0ZSIsImFsbG93VG91Y2hTbmFnIiwibW91c2VCdXR0b24iLCJkcmFnQ3Vyc29yIiwiYXR0YWNoIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJwaGV0aW9TdGF0ZSIsInBoZXRpb0V2ZW50VHlwZSIsIlVTRVIiLCJwaGV0aW9SZWFkT25seSIsImlzRHJhZ2dpbmdQcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJwb2ludGVyIiwidHJhaWwiLCJ0cmFuc2Zvcm0iLCJub2RlIiwibGFzdERyYWdQb2ludCIsInN0YXJ0VHJhbnNmb3JtTWF0cml4IiwidW5kZWZpbmVkIiwiaW50ZXJydXB0ZWQiLCJsYXN0SW50ZXJydXB0ZWRUb3VjaExpa2VQb2ludGVyIiwiX2F0dGFjaCIsImRyYWdTdGFydEFjdGlvbiIsInBvaW50IiwiZXZlbnQiLCJkcmFnZ2luZyIsInNjZW5lcnlMb2ciLCJJbnB1dExpc3RlbmVyIiwicHVzaCIsImN1cnNvciIsImFkZElucHV0TGlzdGVuZXIiLCJkcmFnTGlzdGVuZXIiLCJyZXNlcnZlRm9yRHJhZyIsInNldCIsInN1YnRyYWlsVG8iLCJjdXJyZW50VGFyZ2V0IiwiZ2V0VHJhbnNmb3JtIiwiZ2V0TWF0cml4IiwiY29weSIsImRvbUV2ZW50IiwiYnV0dG9uIiwiY2FsbCIsInBvcCIsInBhcmFtZXRlcnMiLCJuYW1lIiwicGhldGlvVHlwZSIsIlZlY3RvcjJJTyIsInBoZXRpb1ByaXZhdGUiLCJ2YWx1ZVR5cGUiLCJkcmFnQWN0aW9uIiwiaXNEaXNwb3NlZCIsImdsb2JhbERlbHRhIiwibWludXMiLCJtYWduaXR1ZGVTcXVhcmVkIiwiZGVsdGEiLCJpbnZlcnNlRGVsdGEyIiwidG9TdHJpbmciLCJ0cmFuc2xhdGlvbiIsImdldFRyYW5zbGF0aW9uIiwib2xkUG9zaXRpb24iLCJwb3NpdGlvbiIsInBsdXMiLCJzYXZlQ3VycmVudFRhcmdldCIsInBoZXRpb0hpZ2hGcmVxdWVuY3kiLCJkcmFnRW5kQWN0aW9uIiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsImlzVmFsaWRWYWx1ZSIsInZhbHVlIiwidHJhbnNmb3JtTGlzdGVuZXIiLCJhcmdzIiwiaXNFeHRlbnNpb25PZiIsIm5ld01hdHJpeCIsIm9sZE1hdHJpeCIsInByZXBlbmRNYXRyaXgiLCJpbnZlcnRlZCIsInRpbWVzTWF0cml4Iiwic2V0TWF0cml4IiwidXAiLCJlbmREcmFnIiwiY2FuY2VsIiwibW92ZSIsImV4ZWN1dGUiLCJpbnRlcnJ1cHQiLCJpbml0aWFsaXplUGhldGlvT2JqZWN0IiwiZ2V0IiwiZCIsInN0YXJ0RHJhZyIsIlpFUk8iLCJpc1RvdWNoTGlrZSIsInRyeVRvU25hZyIsImNhblN0YXJ0UHJlc3MiLCJ0cnlUb3VjaFRvU25hZyIsImRvd24iLCJ0b3VjaGVudGVyIiwidG91Y2htb3ZlIiwiZGlzcG9zZSIsImNyZWF0ZUZvcndhcmRpbmdMaXN0ZW5lciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2ltcGxlRHJhZ0hhbmRsZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQmFzaWMgZHJhZ2dpbmcgZm9yIGEgbm9kZS5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBkZXByZWNhdGlvbldhcm5pbmcgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2RlcHJlY2F0aW9uV2FybmluZy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgRXZlbnRUeXBlIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9FdmVudFR5cGUuanMnO1xyXG5pbXBvcnQgUGhldGlvQWN0aW9uIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9BY3Rpb24uanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0IGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgeyBNb3VzZSwgc2NlbmVyeSwgU2NlbmVyeUV2ZW50IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcblxyXG4vKipcclxuICogQGRlcHJlY2F0ZWQgLSBwbGVhc2UgdXNlIERyYWdMaXN0ZW5lciBmb3IgbmV3IGNvZGVcclxuICovXHJcbmNsYXNzIFNpbXBsZURyYWdIYW5kbGVyIGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgZGVwcmVjYXRpb25XYXJuaW5nKCAnU2ltcGxlRHJhZ0hhbmRsZXIgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBEcmFnTGlzdGVuZXIgaW5zdGVhZCcgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIHN0YXJ0OiBudWxsLCAvLyB7bnVsbHxmdW5jdGlvbihTY2VuZXJ5RXZlbnQsVHJhaWwpfSBjYWxsZWQgd2hlbiBhIGRyYWcgaXMgc3RhcnRlZFxyXG4gICAgICBkcmFnOiBudWxsLCAvLyB7bnVsbHxmdW5jdGlvbihTY2VuZXJ5RXZlbnQsVHJhaWwpfSBjYWxsZWQgd2hlbiBwb2ludGVyIG1vdmVzXHJcbiAgICAgIGVuZDogbnVsbCwgIC8vIHtudWxsfGZ1bmN0aW9uKFNjZW5lcnlFdmVudCxUcmFpbCl9IGNhbGxlZCB3aGVuIGEgZHJhZyBpcyBlbmRlZFxyXG5cclxuICAgICAgLy8ge251bGx8ZnVuY3Rpb259IENhbGxlZCB3aGVuIHRoZSBwb2ludGVyIG1vdmVzLlxyXG4gICAgICAvLyBTaWduYXR1cmUgaXMgdHJhbnNsYXRlKCB7IGRlbHRhOiBWZWN0b3IyLCBvbGRQb3NpdGlvbjogVmVjdG9yMiwgcG9zaXRpb246IFZlY3RvcjIgfSApXHJcbiAgICAgIHRyYW5zbGF0ZTogbnVsbCwgLy9cclxuXHJcbiAgICAgIC8vIHtib29sZWFufGZ1bmN0aW9uOmJvb2xlYW59XHJcbiAgICAgIGFsbG93VG91Y2hTbmFnOiBmYWxzZSxcclxuXHJcbiAgICAgIC8vIGFsbG93IGNoYW5naW5nIHRoZSBtb3VzZSBidXR0b24gdGhhdCBhY3RpdmF0ZXMgdGhlIGRyYWcgbGlzdGVuZXIuXHJcbiAgICAgIC8vIC0xIHNob3VsZCBhY3RpdmF0ZSBvbiBhbnkgbW91c2UgYnV0dG9uLCAwIG9uIGxlZnQsIDEgZm9yIG1pZGRsZSwgMiBmb3IgcmlnaHQsIGV0Yy5cclxuICAgICAgbW91c2VCdXR0b246IDAsXHJcblxyXG4gICAgICAvLyB3aGlsZSBkcmFnZ2luZyB3aXRoIHRoZSBtb3VzZSwgc2V0cyB0aGUgY3Vyc29yIHRvIHRoaXMgdmFsdWVcclxuICAgICAgLy8gKG9yIHVzZSBudWxsIHRvIG5vdCBvdmVycmlkZSB0aGUgY3Vyc29yIHdoaWxlIGRyYWdnaW5nKVxyXG4gICAgICBkcmFnQ3Vyc29yOiAncG9pbnRlcicsXHJcblxyXG4gICAgICAvLyB3aGVuIHNldCB0byB0cnVlLCB0aGUgaGFuZGxlciB3aWxsIGdldCBcImF0dGFjaGVkXCIgdG8gYSBwb2ludGVyIGR1cmluZyB1c2UsIHByZXZlbnRpbmcgdGhlIHBvaW50ZXIgZnJvbSBzdGFydGluZ1xyXG4gICAgICAvLyBhIGRyYWcgdmlhIHNvbWV0aGluZyBsaWtlIFByZXNzTGlzdGVuZXJcclxuICAgICAgYXR0YWNoOiB0cnVlLFxyXG5cclxuICAgICAgLy8gcGhldGlvXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxyXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2UsXHJcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVIsXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcblxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uczsgLy8gQHByaXZhdGVcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtCb29sZWFuUHJvcGVydHl9IC0gaW5kaWNhdGVzIHdoZXRoZXIgZHJhZ2dpbmcgaXMgaW4gcHJvZ3Jlc3NcclxuICAgIHRoaXMuaXNEcmFnZ2luZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IG9wdGlvbnMucGhldGlvUmVhZE9ubHksXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdpc0RyYWdnaW5nUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdJbmRpY2F0ZXMgd2hldGhlciB0aGUgb2JqZWN0IGlzIGRyYWdnaW5nJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1BvaW50ZXJ8bnVsbH0gLSB0aGUgcG9pbnRlciBkb2luZyB0aGUgY3VycmVudCBkcmFnZ2luZ1xyXG4gICAgdGhpcy5wb2ludGVyID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtUcmFpbHxudWxsfSAtIHN0b3JlcyB0aGUgcGF0aCB0byB0aGUgbm9kZSB0aGF0IGlzIGJlaW5nIGRyYWdnZWRcclxuICAgIHRoaXMudHJhaWwgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1RyYW5zZm9ybTN8bnVsbH0gLSB0cmFuc2Zvcm0gb2YgdGhlIHRyYWlsIHRvIG91ciBub2RlIChidXQgbm90IGluY2x1ZGluZyBvdXIgbm9kZSwgc28gd2UgY2FuIHByZXBlbmRcclxuICAgIC8vIHRoZSBkZWx0YXMpXHJcbiAgICB0aGlzLnRyYW5zZm9ybSA9IG51bGw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Tm9kZXxudWxsfSAtIHRoZSBub2RlIHRoYXQgd2UgYXJlIGhhbmRsaW5nIHRoZSBkcmFnIGZvclxyXG4gICAgdGhpcy5ub2RlID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHJvdGVjdGVkIHtWZWN0b3IyfG51bGx9IC0gdGhlIGxvY2F0aW9uIG9mIHRoZSBkcmFnIGF0IHRoZSBwcmV2aW91cyBldmVudCAoc28gd2UgY2FuIGNhbGN1bGF0ZSBhIGRlbHRhKVxyXG4gICAgdGhpcy5sYXN0RHJhZ1BvaW50ID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHJvdGVjdGVkIHtNYXRyaXgzfG51bGx9IC0gdGhlIG5vZGUncyB0cmFuc2Zvcm0gYXQgdGhlIHN0YXJ0IG9mIHRoZSBkcmFnLCBzbyB3ZSBjYW4gcmVzZXQgb24gYSB0b3VjaCBjYW5jZWxcclxuICAgIHRoaXMuc3RhcnRUcmFuc2Zvcm1NYXRyaXggPSBudWxsO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcnx1bmRlZmluZWR9IC0gdHJhY2tzIHdoaWNoIG1vdXNlIGJ1dHRvbiB3YXMgcHJlc3NlZCwgc28gd2UgY2FuIGhhbmRsZSB0aGF0IHNwZWNpZmljYWxseVxyXG4gICAgdGhpcy5tb3VzZUJ1dHRvbiA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtib29sZWFufSAtIFRoaXMgd2lsbCBiZSBzZXQgdG8gdHJ1ZSBmb3IgZW5kRHJhZyBjYWxscyB0aGF0IGFyZSB0aGUgcmVzdWx0IG9mIHRoZSBsaXN0ZW5lciBiZWluZ1xyXG4gICAgLy8gaW50ZXJydXB0ZWQuIEl0IHdpbGwgYmUgc2V0IGJhY2sgdG8gZmFsc2UgYWZ0ZXIgdGhlIGVuZERyYWcgaXMgZmluaXNoZWQuXHJcbiAgICB0aGlzLmludGVycnVwdGVkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1BvaW50ZXJ8bnVsbH0gLSBUaGVyZSBhcmUgY2FzZXMgbGlrZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzk3IHdoZXJlIGlmXHJcbiAgICAvLyBhIHRvdWNoZW50ZXIgc3RhcnRzIGEgZHJhZyB0aGF0IGlzIElNTUVESUFURUxZIGludGVycnVwdGVkLCB0aGUgdG91Y2hkb3duIHdvdWxkIHN0YXJ0IGFub3RoZXIgZHJhZy4gV2UgcmVjb3JkXHJcbiAgICAvLyBpbnRlcnJ1cHRpb25zIGhlcmUgc28gdGhhdCB3ZSBjYW4gcHJldmVudCBmdXR1cmUgZW50ZXIvZG93biBldmVudHMgZnJvbSB0aGUgc2FtZSB0b3VjaCBwb2ludGVyIGZyb20gdHJpZ2dlcmluZ1xyXG4gICAgLy8gYW5vdGhlciBzdGFydERyYWcuXHJcbiAgICB0aGlzLmxhc3RJbnRlcnJ1cHRlZFRvdWNoTGlrZVBvaW50ZXIgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufVxyXG4gICAgdGhpcy5fYXR0YWNoID0gb3B0aW9ucy5hdHRhY2g7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0FjdGlvbn1cclxuICAgIHRoaXMuZHJhZ1N0YXJ0QWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggKCBwb2ludCwgZXZlbnQgKSA9PiB7XHJcblxyXG4gICAgICBpZiAoIHRoaXMuZHJhZ2dpbmcgKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCAnU2ltcGxlRHJhZ0hhbmRsZXIgc3RhcnREcmFnJyApO1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAgIC8vIHNldCBhIGZsYWcgb24gdGhlIHBvaW50ZXIgc28gaXQgd29uJ3QgcGljayB1cCBvdGhlciBub2Rlc1xyXG4gICAgICBpZiAoIHRoaXMuX2F0dGFjaCApIHtcclxuICAgICAgICAvLyBPbmx5IHNldCB0aGUgYGRyYWdnaW5nYCBmbGFnIG9uIHRoZSBwb2ludGVyIGlmIHdlIGhhdmUgYXR0YWNoOnRydWVcclxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzIwNlxyXG4gICAgICAgIGV2ZW50LnBvaW50ZXIuZHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGV2ZW50LnBvaW50ZXIuY3Vyc29yID0gdGhpcy5vcHRpb25zLmRyYWdDdXJzb3I7XHJcbiAgICAgIGV2ZW50LnBvaW50ZXIuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5kcmFnTGlzdGVuZXIsIHRoaXMub3B0aW9ucy5hdHRhY2ggKTtcclxuXHJcbiAgICAgIC8vIG1hcmsgdGhlIEludGVudCBvZiB0aGlzIHBvaW50ZXIgbGlzdGVuZXIgdG8gaW5kaWNhdGUgdGhhdCB3ZSB3YW50IHRvIGRyYWcgYW5kIHRoZXJlZm9yZSBwb3RlbnRpYWxseVxyXG4gICAgICAvLyBjaGFuZ2UgdGhlIGJlaGF2aW9yIG9mIG90aGVyIGxpc3RlbmVycyBpbiB0aGUgZGlzcGF0Y2ggcGhhc2VcclxuICAgICAgZXZlbnQucG9pbnRlci5yZXNlcnZlRm9yRHJhZygpO1xyXG5cclxuICAgICAgLy8gc2V0IGFsbCBvZiBvdXIgcGVyc2lzdGVudCBpbmZvcm1hdGlvblxyXG4gICAgICB0aGlzLmlzRHJhZ2dpbmdQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICAgICAgdGhpcy5wb2ludGVyID0gZXZlbnQucG9pbnRlcjtcclxuICAgICAgdGhpcy50cmFpbCA9IGV2ZW50LnRyYWlsLnN1YnRyYWlsVG8oIGV2ZW50LmN1cnJlbnRUYXJnZXQsIHRydWUgKTtcclxuICAgICAgdGhpcy50cmFuc2Zvcm0gPSB0aGlzLnRyYWlsLmdldFRyYW5zZm9ybSgpO1xyXG4gICAgICB0aGlzLm5vZGUgPSBldmVudC5jdXJyZW50VGFyZ2V0O1xyXG4gICAgICB0aGlzLmxhc3REcmFnUG9pbnQgPSBldmVudC5wb2ludGVyLnBvaW50O1xyXG4gICAgICB0aGlzLnN0YXJ0VHJhbnNmb3JtTWF0cml4ID0gZXZlbnQuY3VycmVudFRhcmdldC5nZXRNYXRyaXgoKS5jb3B5KCk7XHJcbiAgICAgIC8vIGV2ZW50LmRvbUV2ZW50IG1heSBub3QgZXhpc3QgZm9yIHRvdWNoLXRvLXNuYWdcclxuICAgICAgdGhpcy5tb3VzZUJ1dHRvbiA9IGV2ZW50LnBvaW50ZXIgaW5zdGFuY2VvZiBNb3VzZSA/IGV2ZW50LmRvbUV2ZW50LmJ1dHRvbiA6IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgIGlmICggdGhpcy5vcHRpb25zLnN0YXJ0ICkge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5zdGFydC5jYWxsKCBudWxsLCBldmVudCwgdGhpcy50cmFpbCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgfSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RyYWdTdGFydEFjdGlvbicgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IG9wdGlvbnMucGhldGlvUmVhZE9ubHksXHJcbiAgICAgIHBhcmFtZXRlcnM6IFsge1xyXG4gICAgICAgIG5hbWU6ICdwb2ludCcsXHJcbiAgICAgICAgcGhldGlvVHlwZTogVmVjdG9yMi5WZWN0b3IySU8sXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSBwb3NpdGlvbiBvZiB0aGUgZHJhZyBzdGFydCBpbiB2aWV3IGNvb3JkaW5hdGVzJ1xyXG4gICAgICB9LCB7XHJcbiAgICAgICAgcGhldGlvUHJpdmF0ZTogdHJ1ZSxcclxuICAgICAgICB2YWx1ZVR5cGU6IFsgU2NlbmVyeUV2ZW50LCBudWxsIF1cclxuICAgICAgfSBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0FjdGlvbn1cclxuICAgIHRoaXMuZHJhZ0FjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggcG9pbnQsIGV2ZW50ICkgPT4ge1xyXG5cclxuICAgICAgaWYgKCAhdGhpcy5kcmFnZ2luZyB8fCB0aGlzLmlzRGlzcG9zZWQgKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgY29uc3QgZ2xvYmFsRGVsdGEgPSB0aGlzLnBvaW50ZXIucG9pbnQubWludXMoIHRoaXMubGFzdERyYWdQb2ludCApO1xyXG5cclxuICAgICAgLy8gaWdub3JlIG1vdmUgZXZlbnRzIHRoYXQgaGF2ZSAwLWxlbmd0aC4gQ2hyb21lIHNlZW1zIHRvIGJlIGF1dG8tZmlyaW5nIHRoZXNlIG9uIFdpbmRvd3MsXHJcbiAgICAgIC8vIHNlZSBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MzI3MTE0XHJcbiAgICAgIGlmICggZ2xvYmFsRGVsdGEubWFnbml0dWRlU3F1YXJlZCA9PT0gMCApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGRlbHRhID0gdGhpcy50cmFuc2Zvcm0uaW52ZXJzZURlbHRhMiggZ2xvYmFsRGVsdGEgKTtcclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGV2ZW50LnBvaW50ZXIgPT09IHRoaXMucG9pbnRlciwgJ1dyb25nIHBvaW50ZXIgaW4gbW92ZScgKTtcclxuXHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggYFNpbXBsZURyYWdIYW5kbGVyIChwb2ludGVyKSBtb3ZlIGZvciAke3RoaXMudHJhaWwudG9TdHJpbmcoKX1gICk7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgICAgLy8gbW92ZSBieSB0aGUgZGVsdGEgYmV0d2VlbiB0aGUgcHJldmlvdXMgcG9pbnQsIHVzaW5nIHRoZSBwcmVjb21wdXRlZCB0cmFuc2Zvcm1cclxuICAgICAgLy8gcHJlcGVuZCB0aGUgdHJhbnNsYXRpb24gb24gdGhlIG5vZGUsIHNvIHdlIGNhbiBpZ25vcmUgd2hhdGV2ZXIgb3RoZXIgdHJhbnNmb3JtIHN0YXRlIHRoZSBub2RlIGhhc1xyXG4gICAgICBpZiAoIHRoaXMub3B0aW9ucy50cmFuc2xhdGUgKSB7XHJcbiAgICAgICAgY29uc3QgdHJhbnNsYXRpb24gPSB0aGlzLm5vZGUuZ2V0TWF0cml4KCkuZ2V0VHJhbnNsYXRpb24oKTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMudHJhbnNsYXRlLmNhbGwoIG51bGwsIHtcclxuICAgICAgICAgIGRlbHRhOiBkZWx0YSxcclxuICAgICAgICAgIG9sZFBvc2l0aW9uOiB0cmFuc2xhdGlvbixcclxuICAgICAgICAgIHBvc2l0aW9uOiB0cmFuc2xhdGlvbi5wbHVzKCBkZWx0YSApXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMubGFzdERyYWdQb2ludCA9IHRoaXMucG9pbnRlci5wb2ludDtcclxuXHJcbiAgICAgIGlmICggdGhpcy5vcHRpb25zLmRyYWcgKSB7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IGFkZCB0aGUgcG9zaXRpb24gaW4gdG8gdGhlIGxpc3RlbmVyXHJcbiAgICAgICAgY29uc3Qgc2F2ZUN1cnJlbnRUYXJnZXQgPSBldmVudC5jdXJyZW50VGFyZ2V0O1xyXG4gICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQgPSB0aGlzLm5vZGU7IC8vICM2NjogY3VycmVudFRhcmdldCBvbiBhIHBvaW50ZXIgaXMgbnVsbCwgc28gc2V0IGl0IHRvIHRoZSBub2RlIHdlJ3JlIGRyYWdnaW5nXHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmRyYWcuY2FsbCggbnVsbCwgZXZlbnQsIHRoaXMudHJhaWwgKTsgLy8gbmV3IHBvc2l0aW9uIChvbGQgcG9zaXRpb24/KSBkZWx0YVxyXG4gICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQgPSBzYXZlQ3VycmVudFRhcmdldDsgLy8gYmUgcG9saXRlIHRvIG90aGVyIGxpc3RlbmVycywgcmVzdG9yZSBjdXJyZW50VGFyZ2V0XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgICB9LCB7XHJcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWUsXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiBvcHRpb25zLnBoZXRpb1JlYWRPbmx5LFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RyYWdBY3Rpb24nICksXHJcbiAgICAgIHBhcmFtZXRlcnM6IFsge1xyXG4gICAgICAgIG5hbWU6ICdwb2ludCcsXHJcbiAgICAgICAgcGhldGlvVHlwZTogVmVjdG9yMi5WZWN0b3IySU8sXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSBwb3NpdGlvbiBvZiB0aGUgZHJhZyBpbiB2aWV3IGNvb3JkaW5hdGVzJ1xyXG4gICAgICB9LCB7XHJcbiAgICAgICAgcGhldGlvUHJpdmF0ZTogdHJ1ZSxcclxuICAgICAgICB2YWx1ZVR5cGU6IFsgU2NlbmVyeUV2ZW50LCBudWxsIF1cclxuICAgICAgfSBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0FjdGlvbn1cclxuICAgIHRoaXMuZHJhZ0VuZEFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggcG9pbnQsIGV2ZW50ICkgPT4ge1xyXG5cclxuICAgICAgaWYgKCAhdGhpcy5kcmFnZ2luZyApIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdTaW1wbGVEcmFnSGFuZGxlciBlbmREcmFnJyApO1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAgIGlmICggdGhpcy5fYXR0YWNoICkge1xyXG4gICAgICAgIC8vIE9ubHkgc2V0IHRoZSBgZHJhZ2dpbmdgIGZsYWcgb24gdGhlIHBvaW50ZXIgaWYgd2UgaGF2ZSBhdHRhY2g6dHJ1ZVxyXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMjA2XHJcbiAgICAgICAgdGhpcy5wb2ludGVyLmRyYWdnaW5nID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5wb2ludGVyLmN1cnNvciA9IG51bGw7XHJcbiAgICAgIHRoaXMucG9pbnRlci5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLmRyYWdMaXN0ZW5lciApO1xyXG5cclxuICAgICAgdGhpcy5pc0RyYWdnaW5nUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLm9wdGlvbnMuZW5kICkge1xyXG5cclxuICAgICAgICAvLyBkcmFnIGVuZCBtYXkgYmUgdHJpZ2dlcmVkIHByb2dyYW1tYXRpY2FsbHkgYW5kIGhlbmNlIGV2ZW50IGFuZCB0cmFpbCBtYXkgYmUgdW5kZWZpbmVkXHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmVuZC5jYWxsKCBudWxsLCBldmVudCwgdGhpcy50cmFpbCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZWxlYXNlIG91ciByZWZlcmVuY2VcclxuICAgICAgdGhpcy5wb2ludGVyID0gbnVsbDtcclxuXHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgICB9LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ0VuZEFjdGlvbicgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IG9wdGlvbnMucGhldGlvUmVhZE9ubHksXHJcbiAgICAgIHBhcmFtZXRlcnM6IFsge1xyXG4gICAgICAgIG5hbWU6ICdwb2ludCcsXHJcbiAgICAgICAgcGhldGlvVHlwZTogVmVjdG9yMi5WZWN0b3IySU8sXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSBwb3NpdGlvbiBvZiB0aGUgZHJhZyBlbmQgaW4gdmlldyBjb29yZGluYXRlcydcclxuICAgICAgfSwge1xyXG4gICAgICAgIHBoZXRpb1ByaXZhdGU6IHRydWUsXHJcbiAgICAgICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgaW5zdGFuY2VvZiBTY2VuZXJ5RXZlbnQgfHxcclxuXHJcbiAgICAgICAgICAgICAgICAgLy8gV2hlbiBpbnRlcnJ1cHRlZCwgYW4gb2JqZWN0IGxpdGVyYWwgaXMgdXNlZCB0byBzaWduaWZ5IHRoZSBpbnRlcnJ1cHRpb24sXHJcbiAgICAgICAgICAgICAgICAgLy8gc2VlIFNpbXBsZURyYWdIYW5kbGVyLmludGVycnVwdFxyXG4gICAgICAgICAgICAgICAgICggdmFsdWUucG9pbnRlciAmJiB2YWx1ZS5jdXJyZW50VGFyZ2V0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJvdGVjdGVkIHtmdW5jdGlvbn0gLSBpZiBhbiBhbmNlc3RvciBpcyB0cmFuc2Zvcm1lZCwgcGluIG91ciBub2RlXHJcbiAgICB0aGlzLnRyYW5zZm9ybUxpc3RlbmVyID0ge1xyXG4gICAgICB0cmFuc2Zvcm06IGFyZ3MgPT4ge1xyXG4gICAgICAgIGlmICggIXRoaXMudHJhaWwuaXNFeHRlbnNpb25PZiggYXJncy50cmFpbCwgdHJ1ZSApICkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbmV3TWF0cml4ID0gYXJncy50cmFpbC5nZXRNYXRyaXgoKTtcclxuICAgICAgICBjb25zdCBvbGRNYXRyaXggPSB0aGlzLnRyYW5zZm9ybS5nZXRNYXRyaXgoKTtcclxuXHJcbiAgICAgICAgLy8gaWYgQSB3YXMgdGhlIHRyYWlsJ3Mgb2xkIHRyYW5zZm9ybSwgQiBpcyB0aGUgdHJhaWwncyBuZXcgdHJhbnNmb3JtLCB3ZSBuZWVkIHRvIGFwcGx5IChCXi0xIEEpIHRvIG91ciBub2RlXHJcbiAgICAgICAgdGhpcy5ub2RlLnByZXBlbmRNYXRyaXgoIG5ld01hdHJpeC5pbnZlcnRlZCgpLnRpbWVzTWF0cml4KCBvbGRNYXRyaXggKSApO1xyXG5cclxuICAgICAgICAvLyBzdG9yZSB0aGUgbmV3IG1hdHJpeCBzbyB3ZSBjYW4gZG8gZGVsdGFzIHVzaW5nIGl0IG5vd1xyXG4gICAgICAgIHRoaXMudHJhbnNmb3JtLnNldE1hdHJpeCggbmV3TWF0cml4ICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gQHByb3RlY3RlZCB7ZnVuY3Rpb259IC0gdGhpcyBsaXN0ZW5lciBnZXRzIGFkZGVkIHRvIHRoZSBwb2ludGVyIHdoZW4gaXQgc3RhcnRzIGRyYWdnaW5nIG91ciBub2RlXHJcbiAgICB0aGlzLmRyYWdMaXN0ZW5lciA9IHtcclxuICAgICAgLy8gbW91c2UvdG91Y2ggdXBcclxuICAgICAgdXA6IGV2ZW50ID0+IHtcclxuICAgICAgICBpZiAoICF0aGlzLmRyYWdnaW5nIHx8IHRoaXMuaXNEaXNwb3NlZCApIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggYFNpbXBsZURyYWdIYW5kbGVyIChwb2ludGVyKSB1cCBmb3IgJHt0aGlzLnRyYWlsLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBldmVudC5wb2ludGVyID09PSB0aGlzLnBvaW50ZXIsICdXcm9uZyBwb2ludGVyIGluIHVwJyApO1xyXG4gICAgICAgIGlmICggISggZXZlbnQucG9pbnRlciBpbnN0YW5jZW9mIE1vdXNlICkgfHwgZXZlbnQuZG9tRXZlbnQuYnV0dG9uID09PSB0aGlzLm1vdXNlQnV0dG9uICkge1xyXG4gICAgICAgICAgY29uc3Qgc2F2ZUN1cnJlbnRUYXJnZXQgPSBldmVudC5jdXJyZW50VGFyZ2V0O1xyXG4gICAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldCA9IHRoaXMubm9kZTsgLy8gIzY2OiBjdXJyZW50VGFyZ2V0IG9uIGEgcG9pbnRlciBpcyBudWxsLCBzbyBzZXQgaXQgdG8gdGhlIG5vZGUgd2UncmUgZHJhZ2dpbmdcclxuICAgICAgICAgIHRoaXMuZW5kRHJhZyggZXZlbnQgKTtcclxuICAgICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQgPSBzYXZlQ3VycmVudFRhcmdldDsgLy8gYmUgcG9saXRlIHRvIG90aGVyIGxpc3RlbmVycywgcmVzdG9yZSBjdXJyZW50VGFyZ2V0XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gdG91Y2ggY2FuY2VsXHJcbiAgICAgIGNhbmNlbDogZXZlbnQgPT4ge1xyXG4gICAgICAgIGlmICggIXRoaXMuZHJhZ2dpbmcgfHwgdGhpcy5pc0Rpc3Bvc2VkICkgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgU2ltcGxlRHJhZ0hhbmRsZXIgKHBvaW50ZXIpIGNhbmNlbCBmb3IgJHt0aGlzLnRyYWlsLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBldmVudC5wb2ludGVyID09PSB0aGlzLnBvaW50ZXIsICdXcm9uZyBwb2ludGVyIGluIGNhbmNlbCcgKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc2F2ZUN1cnJlbnRUYXJnZXQgPSBldmVudC5jdXJyZW50VGFyZ2V0O1xyXG4gICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQgPSB0aGlzLm5vZGU7IC8vICM2NjogY3VycmVudFRhcmdldCBvbiBhIHBvaW50ZXIgaXMgbnVsbCwgc28gc2V0IGl0IHRvIHRoZSBub2RlIHdlJ3JlIGRyYWdnaW5nXHJcbiAgICAgICAgdGhpcy5lbmREcmFnKCBldmVudCApO1xyXG4gICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQgPSBzYXZlQ3VycmVudFRhcmdldDsgLy8gYmUgcG9saXRlIHRvIG90aGVyIGxpc3RlbmVycywgcmVzdG9yZSBjdXJyZW50VGFyZ2V0XHJcblxyXG4gICAgICAgIC8vIHNpbmNlIGl0J3MgYSBjYW5jZWwgZXZlbnQsIGdvIGJhY2shXHJcbiAgICAgICAgaWYgKCAhdGhpcy50cmFuc2Zvcm0gKSB7XHJcbiAgICAgICAgICB0aGlzLm5vZGUuc2V0TWF0cml4KCB0aGlzLnN0YXJ0VHJhbnNmb3JtTWF0cml4ICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gbW91c2UvdG91Y2ggbW92ZVxyXG4gICAgICBtb3ZlOiBldmVudCA9PiB7XHJcbiAgICAgICAgdGhpcy5kcmFnQWN0aW9uLmV4ZWN1dGUoIGV2ZW50LnBvaW50ZXIucG9pbnQsIGV2ZW50ICk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBwb2ludGVyIGludGVycnVwdGlvblxyXG4gICAgICBpbnRlcnJ1cHQ6ICgpID0+IHtcclxuICAgICAgICB0aGlzLmludGVycnVwdCgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuaW5pdGlhbGl6ZVBoZXRpb09iamVjdCgge30sIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlXHJcbiAgZ2V0IGRyYWdnaW5nKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaXNEcmFnZ2luZ1Byb3BlcnR5LmdldCgpO1xyXG4gIH1cclxuXHJcbiAgc2V0IGRyYWdnaW5nKCBkICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdpbGxlZ2FsIGNhbGwgdG8gc2V0IGRyYWdnaW5nIG9uIFNpbXBsZURyYWdIYW5kbGVyJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTY2VuZXJ5RXZlbnR9IGV2ZW50XHJcbiAgICovXHJcbiAgc3RhcnREcmFnKCBldmVudCApIHtcclxuICAgIHRoaXMuZHJhZ1N0YXJ0QWN0aW9uLmV4ZWN1dGUoIGV2ZW50LnBvaW50ZXIucG9pbnQsIGV2ZW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NjZW5lcnlFdmVudH0gZXZlbnRcclxuICAgKi9cclxuICBlbmREcmFnKCBldmVudCApIHtcclxuXHJcbiAgICAvLyBTaWduaWZ5IGRyYWcgZW5kZWQuICBJbiB0aGUgY2FzZSBvZiBwcm9ncmFtbWF0aWNhbGx5IGVuZGVkIGRyYWdzLCBzaWduaWZ5IGRyYWcgZW5kZWQgYXQgMCwwLlxyXG4gICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waC1zY2FsZS1iYXNpY3MvaXNzdWVzLzQzXHJcbiAgICB0aGlzLmRyYWdFbmRBY3Rpb24uZXhlY3V0ZSggZXZlbnQgPyBldmVudC5wb2ludGVyLnBvaW50IDogVmVjdG9yMi5aRVJPLCBldmVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gaW5wdXQgaXMgaW50ZXJydXB0ZWQgb24gdGhpcyBsaXN0ZW5lciwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8yMThcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgaW50ZXJydXB0KCkge1xyXG4gICAgaWYgKCB0aGlzLmRyYWdnaW5nICkge1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdTaW1wbGVEcmFnSGFuZGxlciBpbnRlcnJ1cHQnICk7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgICAgdGhpcy5pbnRlcnJ1cHRlZCA9IHRydWU7XHJcblxyXG4gICAgICBpZiAoIHRoaXMucG9pbnRlciAmJiB0aGlzLnBvaW50ZXIuaXNUb3VjaExpa2UoKSApIHtcclxuICAgICAgICB0aGlzLmxhc3RJbnRlcnJ1cHRlZFRvdWNoTGlrZVBvaW50ZXIgPSB0aGlzLnBvaW50ZXI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFdlIGNyZWF0ZSBhIHN5bnRoZXRpYyBldmVudCBoZXJlLCBhcyB0aGVyZSBpcyBubyBhdmFpbGFibGUgZXZlbnQgaGVyZS5cclxuICAgICAgdGhpcy5lbmREcmFnKCB7XHJcbiAgICAgICAgcG9pbnRlcjogdGhpcy5wb2ludGVyLFxyXG4gICAgICAgIGN1cnJlbnRUYXJnZXQ6IHRoaXMubm9kZVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICB0aGlzLmludGVycnVwdGVkID0gZmFsc2U7XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTY2VuZXJ5RXZlbnR9IGV2ZW50XHJcbiAgICovXHJcbiAgdHJ5VG9TbmFnKCBldmVudCApIHtcclxuICAgIC8vIGRvbid0IGFsbG93IGRyYWcgYXR0ZW1wdHMgdGhhdCB1c2UgdGhlIHdyb25nIG1vdXNlIGJ1dHRvbiAoLTEgaW5kaWNhdGVzIGFueSBtb3VzZSBidXR0b24gd29ya3MpXHJcbiAgICBpZiAoIGV2ZW50LnBvaW50ZXIgaW5zdGFuY2VvZiBNb3VzZSAmJlxyXG4gICAgICAgICBldmVudC5kb21FdmVudCAmJlxyXG4gICAgICAgICB0aGlzLm9wdGlvbnMubW91c2VCdXR0b24gIT09IGV2ZW50LmRvbUV2ZW50LmJ1dHRvbiAmJlxyXG4gICAgICAgICB0aGlzLm9wdGlvbnMubW91c2VCdXR0b24gIT09IC0xICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgd2UncmUgZGlzcG9zZWQsIHdlIGNhbid0IHN0YXJ0IG5ldyBkcmFncy5cclxuICAgIGlmICggdGhpcy5pc0Rpc3Bvc2VkICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gb25seSBzdGFydCBkcmFnZ2luZyBpZiB0aGUgcG9pbnRlciBpc24ndCBkcmFnZ2luZyBhbnl0aGluZywgd2UgYXJlbid0IGJlaW5nIGRyYWdnZWQsIGFuZCBpZiBpdCdzIGEgbW91c2UgaXQncyBidXR0b24gaXMgZG93blxyXG4gICAgaWYgKCAhdGhpcy5kcmFnZ2luZyAmJlxyXG4gICAgICAgICAvLyBEb24ndCBjaGVjayBwb2ludGVyLmRyYWdnaW5nIGlmIHdlIGRvbid0IGF0dGFjaCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8yMDZcclxuICAgICAgICAgKCAhZXZlbnQucG9pbnRlci5kcmFnZ2luZyB8fCAhdGhpcy5fYXR0YWNoICkgJiZcclxuICAgICAgICAgZXZlbnQucG9pbnRlciAhPT0gdGhpcy5sYXN0SW50ZXJydXB0ZWRUb3VjaExpa2VQb2ludGVyICYmXHJcbiAgICAgICAgIGV2ZW50LmNhblN0YXJ0UHJlc3MoKSApIHtcclxuICAgICAgdGhpcy5zdGFydERyYWcoIGV2ZW50ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NjZW5lcnlFdmVudH0gZXZlbnRcclxuICAgKi9cclxuICB0cnlUb3VjaFRvU25hZyggZXZlbnQgKSB7XHJcbiAgICAvLyBhbGxvdyB0b3VjaGVzIHRvIHN0YXJ0IGEgZHJhZyBieSBtb3ZpbmcgXCJvdmVyXCIgdGhpcyBub2RlLCBhbmQgYWxsb3dzIGNsaWVudHMgdG8gc3BlY2lmeSBjdXN0b20gbG9naWMgZm9yIHdoZW4gdG91Y2hTbmFnIGlzIGFsbG93YWJsZVxyXG4gICAgaWYgKCB0aGlzLm9wdGlvbnMuYWxsb3dUb3VjaFNuYWcgJiYgKCB0aGlzLm9wdGlvbnMuYWxsb3dUb3VjaFNuYWcgPT09IHRydWUgfHwgdGhpcy5vcHRpb25zLmFsbG93VG91Y2hTbmFnKCBldmVudCApICkgKSB7XHJcbiAgICAgIHRoaXMudHJ5VG9TbmFnKCBldmVudCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogZXZlbnRzIGNhbGxlZCBmcm9tIHRoZSBub2RlIGlucHV0IGxpc3RlbmVyXHJcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLyoqXHJcbiAgICogRXZlbnQgbGlzdGVuZXIgbWV0aG9kIC0gbW91c2UvdG91Y2ggZG93biBvbiB0aGlzIG5vZGVcclxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTY2VuZXJ5RXZlbnR9IGV2ZW50XHJcbiAgICovXHJcbiAgZG93biggZXZlbnQgKSB7XHJcbiAgICB0aGlzLnRyeVRvU25hZyggZXZlbnQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEV2ZW50IGxpc3RlbmVyIG1ldGhvZCAtIHRvdWNoIGVudGVycyB0aGlzIG5vZGVcclxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTY2VuZXJ5RXZlbnR9IGV2ZW50XHJcbiAgICovXHJcbiAgdG91Y2hlbnRlciggZXZlbnQgKSB7XHJcbiAgICB0aGlzLnRyeVRvdWNoVG9TbmFnKCBldmVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXZlbnQgbGlzdGVuZXIgbWV0aG9kIC0gdG91Y2ggbW92ZXMgb3ZlciB0aGlzIG5vZGVcclxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTY2VuZXJ5RXZlbnR9IGV2ZW50XHJcbiAgICovXHJcbiAgdG91Y2htb3ZlKCBldmVudCApIHtcclxuICAgIHRoaXMudHJ5VG91Y2hUb1NuYWcoIGV2ZW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNwb3NlcyB0aGlzIGxpc3RlbmVyLCByZWxlYXNpbmcgYW55IHJlZmVyZW5jZXMgaXQgbWF5IGhhdmUgdG8gYSBwb2ludGVyLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCAnU2ltcGxlRHJhZ0hhbmRsZXIgZGlzcG9zZScgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIGlmICggdGhpcy5kcmFnZ2luZyApIHtcclxuICAgICAgaWYgKCB0aGlzLl9hdHRhY2ggKSB7XHJcbiAgICAgICAgLy8gT25seSBzZXQgdGhlIGBkcmFnZ2luZ2AgZmxhZyBvbiB0aGUgcG9pbnRlciBpZiB3ZSBoYXZlIGF0dGFjaDp0cnVlXHJcbiAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8yMDZcclxuICAgICAgICB0aGlzLnBvaW50ZXIuZHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnBvaW50ZXIuY3Vyc29yID0gbnVsbDtcclxuICAgICAgdGhpcy5wb2ludGVyLnJlbW92ZUlucHV0TGlzdGVuZXIoIHRoaXMuZHJhZ0xpc3RlbmVyICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmlzRHJhZ2dpbmdQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcblxyXG4gICAgLy8gSXQgc2VlbWVkIHdpdGhvdXQgZGlzcG9zaW5nIHRoZXNlIGxlZCB0byBhIG1lbW9yeSBsZWFrIGluIEVuZXJneSBTa2F0ZSBQYXJrOiBCYXNpY3NcclxuICAgIHRoaXMuZHJhZ0VuZEFjdGlvbi5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLmRyYWdBY3Rpb24uZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5kcmFnU3RhcnRBY3Rpb24uZGlzcG9zZSgpO1xyXG5cclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYW4gaW5wdXQgbGlzdGVuZXIgdGhhdCBmb3J3YXJkcyBldmVudHMgdG8gdGhlIHNwZWNpZmllZCBpbnB1dCBsaXN0ZW5lclxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNjM5XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKFNjZW5lcnlFdmVudCl9IGRvd24gLSBkb3duIGZ1bmN0aW9uIHRvIGJlIGFkZGVkIHRvIHRoZSBpbnB1dCBsaXN0ZW5lclxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBhIHNjZW5lcnkgaW5wdXQgbGlzdGVuZXJcclxuICAgKi9cclxuICBzdGF0aWMgY3JlYXRlRm9yd2FyZGluZ0xpc3RlbmVyKCBkb3duLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBhbGxvd1RvdWNoU25hZzogZmFsc2VcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBkb3duOiBldmVudCA9PiB7XHJcbiAgICAgICAgaWYgKCAhZXZlbnQucG9pbnRlci5kcmFnZ2luZyAmJiBldmVudC5jYW5TdGFydFByZXNzKCkgKSB7XHJcbiAgICAgICAgICBkb3duKCBldmVudCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgdG91Y2hlbnRlcjogZnVuY3Rpb24oIGV2ZW50ICkge1xyXG4gICAgICAgIG9wdGlvbnMuYWxsb3dUb3VjaFNuYWcgJiYgdGhpcy5kb3duKCBldmVudCApO1xyXG4gICAgICB9LFxyXG4gICAgICB0b3VjaG1vdmU6IGZ1bmN0aW9uKCBldmVudCApIHtcclxuICAgICAgICBvcHRpb25zLmFsbG93VG91Y2hTbmFnICYmIHRoaXMuZG93biggZXZlbnQgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdTaW1wbGVEcmFnSGFuZGxlcicsIFNpbXBsZURyYWdIYW5kbGVyICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTaW1wbGVEcmFnSGFuZGxlcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHFDQUFxQztBQUNqRSxPQUFPQyxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLGtCQUFrQixNQUFNLDZDQUE2QztBQUM1RSxPQUFPQyxLQUFLLE1BQU0sZ0NBQWdDO0FBQ2xELE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsWUFBWSxNQUFNLG9DQUFvQztBQUM3RCxPQUFPQyxZQUFZLE1BQU0sb0NBQW9DO0FBQzdELE9BQU9DLE1BQU0sTUFBTSw4QkFBOEI7QUFDakQsU0FBU0MsS0FBSyxFQUFFQyxPQUFPLEVBQUVDLFlBQVksUUFBUSxlQUFlOztBQUU1RDtBQUNBO0FBQ0E7QUFDQSxNQUFNQyxpQkFBaUIsU0FBU0wsWUFBWSxDQUFDO0VBQzNDO0FBQ0Y7QUFDQTtFQUNFTSxXQUFXQSxDQUFFQyxPQUFPLEVBQUc7SUFDckJDLE1BQU0sSUFBSVosa0JBQWtCLENBQUUsa0VBQW1FLENBQUM7SUFFbEdXLE9BQU8sR0FBR1YsS0FBSyxDQUFFO01BRWZZLEtBQUssRUFBRSxJQUFJO01BQUU7TUFDYkMsSUFBSSxFQUFFLElBQUk7TUFBRTtNQUNaQyxHQUFHLEVBQUUsSUFBSTtNQUFHOztNQUVaO01BQ0E7TUFDQUMsU0FBUyxFQUFFLElBQUk7TUFBRTs7TUFFakI7TUFDQUMsY0FBYyxFQUFFLEtBQUs7TUFFckI7TUFDQTtNQUNBQyxXQUFXLEVBQUUsQ0FBQztNQUVkO01BQ0E7TUFDQUMsVUFBVSxFQUFFLFNBQVM7TUFFckI7TUFDQTtNQUNBQyxNQUFNLEVBQUUsSUFBSTtNQUVaO01BQ0FDLE1BQU0sRUFBRWhCLE1BQU0sQ0FBQ2lCLFFBQVE7TUFDdkJDLFdBQVcsRUFBRSxLQUFLO01BQ2xCQyxlQUFlLEVBQUV0QixTQUFTLENBQUN1QixJQUFJO01BQy9CQyxjQUFjLEVBQUU7SUFFbEIsQ0FBQyxFQUFFZixPQUFRLENBQUM7SUFFWixLQUFLLENBQUMsQ0FBQztJQUVQLElBQUksQ0FBQ0EsT0FBTyxHQUFHQSxPQUFPLENBQUMsQ0FBQzs7SUFFeEI7SUFDQSxJQUFJLENBQUNnQixrQkFBa0IsR0FBRyxJQUFJN0IsZUFBZSxDQUFFLEtBQUssRUFBRTtNQUNwRDRCLGNBQWMsRUFBRWYsT0FBTyxDQUFDZSxjQUFjO01BQ3RDSCxXQUFXLEVBQUUsS0FBSztNQUNsQkYsTUFBTSxFQUFFVixPQUFPLENBQUNVLE1BQU0sQ0FBQ08sWUFBWSxDQUFFLG9CQUFxQixDQUFDO01BQzNEQyxtQkFBbUIsRUFBRTtJQUN2QixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNDLE9BQU8sR0FBRyxJQUFJOztJQUVuQjtJQUNBLElBQUksQ0FBQ0MsS0FBSyxHQUFHLElBQUk7O0lBRWpCO0lBQ0E7SUFDQSxJQUFJLENBQUNDLFNBQVMsR0FBRyxJQUFJOztJQUVyQjtJQUNBLElBQUksQ0FBQ0MsSUFBSSxHQUFHLElBQUk7O0lBRWhCO0lBQ0EsSUFBSSxDQUFDQyxhQUFhLEdBQUcsSUFBSTs7SUFFekI7SUFDQSxJQUFJLENBQUNDLG9CQUFvQixHQUFHLElBQUk7O0lBRWhDO0lBQ0EsSUFBSSxDQUFDakIsV0FBVyxHQUFHa0IsU0FBUzs7SUFFNUI7SUFDQTtJQUNBLElBQUksQ0FBQ0MsV0FBVyxHQUFHLEtBQUs7O0lBRXhCO0lBQ0E7SUFDQTtJQUNBO0lBQ0EsSUFBSSxDQUFDQywrQkFBK0IsR0FBRyxJQUFJOztJQUUzQztJQUNBLElBQUksQ0FBQ0MsT0FBTyxHQUFHNUIsT0FBTyxDQUFDUyxNQUFNOztJQUU3QjtJQUNBLElBQUksQ0FBQ29CLGVBQWUsR0FBRyxJQUFJckMsWUFBWSxDQUFFLENBQUVzQyxLQUFLLEVBQUVDLEtBQUssS0FBTTtNQUUzRCxJQUFLLElBQUksQ0FBQ0MsUUFBUSxFQUFHO1FBQUU7TUFBUTtNQUUvQkMsVUFBVSxJQUFJQSxVQUFVLENBQUNDLGFBQWEsSUFBSUQsVUFBVSxDQUFDQyxhQUFhLENBQUUsNkJBQThCLENBQUM7TUFDbkdELFVBQVUsSUFBSUEsVUFBVSxDQUFDQyxhQUFhLElBQUlELFVBQVUsQ0FBQ0UsSUFBSSxDQUFDLENBQUM7O01BRTNEO01BQ0EsSUFBSyxJQUFJLENBQUNQLE9BQU8sRUFBRztRQUNsQjtRQUNBO1FBQ0FHLEtBQUssQ0FBQ1osT0FBTyxDQUFDYSxRQUFRLEdBQUcsSUFBSTtNQUMvQjtNQUNBRCxLQUFLLENBQUNaLE9BQU8sQ0FBQ2lCLE1BQU0sR0FBRyxJQUFJLENBQUNwQyxPQUFPLENBQUNRLFVBQVU7TUFDOUN1QixLQUFLLENBQUNaLE9BQU8sQ0FBQ2tCLGdCQUFnQixDQUFFLElBQUksQ0FBQ0MsWUFBWSxFQUFFLElBQUksQ0FBQ3RDLE9BQU8sQ0FBQ1MsTUFBTyxDQUFDOztNQUV4RTtNQUNBO01BQ0FzQixLQUFLLENBQUNaLE9BQU8sQ0FBQ29CLGNBQWMsQ0FBQyxDQUFDOztNQUU5QjtNQUNBLElBQUksQ0FBQ3ZCLGtCQUFrQixDQUFDd0IsR0FBRyxDQUFFLElBQUssQ0FBQztNQUNuQyxJQUFJLENBQUNyQixPQUFPLEdBQUdZLEtBQUssQ0FBQ1osT0FBTztNQUM1QixJQUFJLENBQUNDLEtBQUssR0FBR1csS0FBSyxDQUFDWCxLQUFLLENBQUNxQixVQUFVLENBQUVWLEtBQUssQ0FBQ1csYUFBYSxFQUFFLElBQUssQ0FBQztNQUNoRSxJQUFJLENBQUNyQixTQUFTLEdBQUcsSUFBSSxDQUFDRCxLQUFLLENBQUN1QixZQUFZLENBQUMsQ0FBQztNQUMxQyxJQUFJLENBQUNyQixJQUFJLEdBQUdTLEtBQUssQ0FBQ1csYUFBYTtNQUMvQixJQUFJLENBQUNuQixhQUFhLEdBQUdRLEtBQUssQ0FBQ1osT0FBTyxDQUFDVyxLQUFLO01BQ3hDLElBQUksQ0FBQ04sb0JBQW9CLEdBQUdPLEtBQUssQ0FBQ1csYUFBYSxDQUFDRSxTQUFTLENBQUMsQ0FBQyxDQUFDQyxJQUFJLENBQUMsQ0FBQztNQUNsRTtNQUNBLElBQUksQ0FBQ3RDLFdBQVcsR0FBR3dCLEtBQUssQ0FBQ1osT0FBTyxZQUFZeEIsS0FBSyxHQUFHb0MsS0FBSyxDQUFDZSxRQUFRLENBQUNDLE1BQU0sR0FBR3RCLFNBQVM7TUFFckYsSUFBSyxJQUFJLENBQUN6QixPQUFPLENBQUNFLEtBQUssRUFBRztRQUN4QixJQUFJLENBQUNGLE9BQU8sQ0FBQ0UsS0FBSyxDQUFDOEMsSUFBSSxDQUFFLElBQUksRUFBRWpCLEtBQUssRUFBRSxJQUFJLENBQUNYLEtBQU0sQ0FBQztNQUNwRDtNQUVBYSxVQUFVLElBQUlBLFVBQVUsQ0FBQ0MsYUFBYSxJQUFJRCxVQUFVLENBQUNnQixHQUFHLENBQUMsQ0FBQztJQUM1RCxDQUFDLEVBQUU7TUFDRHZDLE1BQU0sRUFBRVYsT0FBTyxDQUFDVSxNQUFNLENBQUNPLFlBQVksQ0FBRSxpQkFBa0IsQ0FBQztNQUN4REYsY0FBYyxFQUFFZixPQUFPLENBQUNlLGNBQWM7TUFDdENtQyxVQUFVLEVBQUUsQ0FBRTtRQUNaQyxJQUFJLEVBQUUsT0FBTztRQUNiQyxVQUFVLEVBQUVoRSxPQUFPLENBQUNpRSxTQUFTO1FBQzdCbkMsbUJBQW1CLEVBQUU7TUFDdkIsQ0FBQyxFQUFFO1FBQ0RvQyxhQUFhLEVBQUUsSUFBSTtRQUNuQkMsU0FBUyxFQUFFLENBQUUxRCxZQUFZLEVBQUUsSUFBSTtNQUNqQyxDQUFDO0lBQ0gsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDMkQsVUFBVSxHQUFHLElBQUloRSxZQUFZLENBQUUsQ0FBRXNDLEtBQUssRUFBRUMsS0FBSyxLQUFNO01BRXRELElBQUssQ0FBQyxJQUFJLENBQUNDLFFBQVEsSUFBSSxJQUFJLENBQUN5QixVQUFVLEVBQUc7UUFBRTtNQUFRO01BRW5ELE1BQU1DLFdBQVcsR0FBRyxJQUFJLENBQUN2QyxPQUFPLENBQUNXLEtBQUssQ0FBQzZCLEtBQUssQ0FBRSxJQUFJLENBQUNwQyxhQUFjLENBQUM7O01BRWxFO01BQ0E7TUFDQSxJQUFLbUMsV0FBVyxDQUFDRSxnQkFBZ0IsS0FBSyxDQUFDLEVBQUc7UUFDeEM7TUFDRjtNQUVBLE1BQU1DLEtBQUssR0FBRyxJQUFJLENBQUN4QyxTQUFTLENBQUN5QyxhQUFhLENBQUVKLFdBQVksQ0FBQztNQUV6RHpELE1BQU0sSUFBSUEsTUFBTSxDQUFFOEIsS0FBSyxDQUFDWixPQUFPLEtBQUssSUFBSSxDQUFDQSxPQUFPLEVBQUUsdUJBQXdCLENBQUM7TUFFM0VjLFVBQVUsSUFBSUEsVUFBVSxDQUFDQyxhQUFhLElBQUlELFVBQVUsQ0FBQ0MsYUFBYSxDQUFHLHdDQUF1QyxJQUFJLENBQUNkLEtBQUssQ0FBQzJDLFFBQVEsQ0FBQyxDQUFFLEVBQUUsQ0FBQztNQUNySTlCLFVBQVUsSUFBSUEsVUFBVSxDQUFDQyxhQUFhLElBQUlELFVBQVUsQ0FBQ0UsSUFBSSxDQUFDLENBQUM7O01BRTNEO01BQ0E7TUFDQSxJQUFLLElBQUksQ0FBQ25DLE9BQU8sQ0FBQ0ssU0FBUyxFQUFHO1FBQzVCLE1BQU0yRCxXQUFXLEdBQUcsSUFBSSxDQUFDMUMsSUFBSSxDQUFDc0IsU0FBUyxDQUFDLENBQUMsQ0FBQ3FCLGNBQWMsQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQ2pFLE9BQU8sQ0FBQ0ssU0FBUyxDQUFDMkMsSUFBSSxDQUFFLElBQUksRUFBRTtVQUNqQ2EsS0FBSyxFQUFFQSxLQUFLO1VBQ1pLLFdBQVcsRUFBRUYsV0FBVztVQUN4QkcsUUFBUSxFQUFFSCxXQUFXLENBQUNJLElBQUksQ0FBRVAsS0FBTTtRQUNwQyxDQUFFLENBQUM7TUFDTDtNQUNBLElBQUksQ0FBQ3RDLGFBQWEsR0FBRyxJQUFJLENBQUNKLE9BQU8sQ0FBQ1csS0FBSztNQUV2QyxJQUFLLElBQUksQ0FBQzlCLE9BQU8sQ0FBQ0csSUFBSSxFQUFHO1FBRXZCO1FBQ0EsTUFBTWtFLGlCQUFpQixHQUFHdEMsS0FBSyxDQUFDVyxhQUFhO1FBQzdDWCxLQUFLLENBQUNXLGFBQWEsR0FBRyxJQUFJLENBQUNwQixJQUFJLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUN0QixPQUFPLENBQUNHLElBQUksQ0FBQzZDLElBQUksQ0FBRSxJQUFJLEVBQUVqQixLQUFLLEVBQUUsSUFBSSxDQUFDWCxLQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ25EVyxLQUFLLENBQUNXLGFBQWEsR0FBRzJCLGlCQUFpQixDQUFDLENBQUM7TUFDM0M7O01BRUFwQyxVQUFVLElBQUlBLFVBQVUsQ0FBQ0MsYUFBYSxJQUFJRCxVQUFVLENBQUNnQixHQUFHLENBQUMsQ0FBQztJQUM1RCxDQUFDLEVBQUU7TUFDRHFCLG1CQUFtQixFQUFFLElBQUk7TUFDekJ2RCxjQUFjLEVBQUVmLE9BQU8sQ0FBQ2UsY0FBYztNQUN0Q0wsTUFBTSxFQUFFVixPQUFPLENBQUNVLE1BQU0sQ0FBQ08sWUFBWSxDQUFFLFlBQWEsQ0FBQztNQUNuRGlDLFVBQVUsRUFBRSxDQUFFO1FBQ1pDLElBQUksRUFBRSxPQUFPO1FBQ2JDLFVBQVUsRUFBRWhFLE9BQU8sQ0FBQ2lFLFNBQVM7UUFDN0JuQyxtQkFBbUIsRUFBRTtNQUN2QixDQUFDLEVBQUU7UUFDRG9DLGFBQWEsRUFBRSxJQUFJO1FBQ25CQyxTQUFTLEVBQUUsQ0FBRTFELFlBQVksRUFBRSxJQUFJO01BQ2pDLENBQUM7SUFDSCxDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUMwRSxhQUFhLEdBQUcsSUFBSS9FLFlBQVksQ0FBRSxDQUFFc0MsS0FBSyxFQUFFQyxLQUFLLEtBQU07TUFFekQsSUFBSyxDQUFDLElBQUksQ0FBQ0MsUUFBUSxFQUFHO1FBQUU7TUFBUTtNQUVoQ0MsVUFBVSxJQUFJQSxVQUFVLENBQUNDLGFBQWEsSUFBSUQsVUFBVSxDQUFDQyxhQUFhLENBQUUsMkJBQTRCLENBQUM7TUFDakdELFVBQVUsSUFBSUEsVUFBVSxDQUFDQyxhQUFhLElBQUlELFVBQVUsQ0FBQ0UsSUFBSSxDQUFDLENBQUM7TUFFM0QsSUFBSyxJQUFJLENBQUNQLE9BQU8sRUFBRztRQUNsQjtRQUNBO1FBQ0EsSUFBSSxDQUFDVCxPQUFPLENBQUNhLFFBQVEsR0FBRyxLQUFLO01BQy9CO01BQ0EsSUFBSSxDQUFDYixPQUFPLENBQUNpQixNQUFNLEdBQUcsSUFBSTtNQUMxQixJQUFJLENBQUNqQixPQUFPLENBQUNxRCxtQkFBbUIsQ0FBRSxJQUFJLENBQUNsQyxZQUFhLENBQUM7TUFFckQsSUFBSSxDQUFDdEIsa0JBQWtCLENBQUN3QixHQUFHLENBQUUsS0FBTSxDQUFDO01BRXBDLElBQUssSUFBSSxDQUFDeEMsT0FBTyxDQUFDSSxHQUFHLEVBQUc7UUFFdEI7UUFDQSxJQUFJLENBQUNKLE9BQU8sQ0FBQ0ksR0FBRyxDQUFDNEMsSUFBSSxDQUFFLElBQUksRUFBRWpCLEtBQUssRUFBRSxJQUFJLENBQUNYLEtBQU0sQ0FBQztNQUNsRDs7TUFFQTtNQUNBLElBQUksQ0FBQ0QsT0FBTyxHQUFHLElBQUk7TUFFbkJjLFVBQVUsSUFBSUEsVUFBVSxDQUFDQyxhQUFhLElBQUlELFVBQVUsQ0FBQ2dCLEdBQUcsQ0FBQyxDQUFDO0lBQzVELENBQUMsRUFBRTtNQUNEdkMsTUFBTSxFQUFFVixPQUFPLENBQUNVLE1BQU0sQ0FBQ08sWUFBWSxDQUFFLGVBQWdCLENBQUM7TUFDdERGLGNBQWMsRUFBRWYsT0FBTyxDQUFDZSxjQUFjO01BQ3RDbUMsVUFBVSxFQUFFLENBQUU7UUFDWkMsSUFBSSxFQUFFLE9BQU87UUFDYkMsVUFBVSxFQUFFaEUsT0FBTyxDQUFDaUUsU0FBUztRQUM3Qm5DLG1CQUFtQixFQUFFO01BQ3ZCLENBQUMsRUFBRTtRQUNEb0MsYUFBYSxFQUFFLElBQUk7UUFDbkJtQixZQUFZLEVBQUVDLEtBQUssSUFBSTtVQUNyQixPQUFPQSxLQUFLLEtBQUssSUFBSSxJQUFJQSxLQUFLLFlBQVk3RSxZQUFZO1VBRS9DO1VBQ0E7VUFDRTZFLEtBQUssQ0FBQ3ZELE9BQU8sSUFBSXVELEtBQUssQ0FBQ2hDLGFBQWU7UUFDakQ7TUFDRixDQUFDO0lBRUgsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDaUMsaUJBQWlCLEdBQUc7TUFDdkJ0RCxTQUFTLEVBQUV1RCxJQUFJLElBQUk7UUFDakIsSUFBSyxDQUFDLElBQUksQ0FBQ3hELEtBQUssQ0FBQ3lELGFBQWEsQ0FBRUQsSUFBSSxDQUFDeEQsS0FBSyxFQUFFLElBQUssQ0FBQyxFQUFHO1VBQ25EO1FBQ0Y7UUFFQSxNQUFNMEQsU0FBUyxHQUFHRixJQUFJLENBQUN4RCxLQUFLLENBQUN3QixTQUFTLENBQUMsQ0FBQztRQUN4QyxNQUFNbUMsU0FBUyxHQUFHLElBQUksQ0FBQzFELFNBQVMsQ0FBQ3VCLFNBQVMsQ0FBQyxDQUFDOztRQUU1QztRQUNBLElBQUksQ0FBQ3RCLElBQUksQ0FBQzBELGFBQWEsQ0FBRUYsU0FBUyxDQUFDRyxRQUFRLENBQUMsQ0FBQyxDQUFDQyxXQUFXLENBQUVILFNBQVUsQ0FBRSxDQUFDOztRQUV4RTtRQUNBLElBQUksQ0FBQzFELFNBQVMsQ0FBQzhELFNBQVMsQ0FBRUwsU0FBVSxDQUFDO01BQ3ZDO0lBQ0YsQ0FBQzs7SUFFRDtJQUNBLElBQUksQ0FBQ3hDLFlBQVksR0FBRztNQUNsQjtNQUNBOEMsRUFBRSxFQUFFckQsS0FBSyxJQUFJO1FBQ1gsSUFBSyxDQUFDLElBQUksQ0FBQ0MsUUFBUSxJQUFJLElBQUksQ0FBQ3lCLFVBQVUsRUFBRztVQUFFO1FBQVE7UUFFbkR4QixVQUFVLElBQUlBLFVBQVUsQ0FBQ0MsYUFBYSxJQUFJRCxVQUFVLENBQUNDLGFBQWEsQ0FBRyxzQ0FBcUMsSUFBSSxDQUFDZCxLQUFLLENBQUMyQyxRQUFRLENBQUMsQ0FBRSxFQUFFLENBQUM7UUFDbkk5QixVQUFVLElBQUlBLFVBQVUsQ0FBQ0MsYUFBYSxJQUFJRCxVQUFVLENBQUNFLElBQUksQ0FBQyxDQUFDO1FBRTNEbEMsTUFBTSxJQUFJQSxNQUFNLENBQUU4QixLQUFLLENBQUNaLE9BQU8sS0FBSyxJQUFJLENBQUNBLE9BQU8sRUFBRSxxQkFBc0IsQ0FBQztRQUN6RSxJQUFLLEVBQUdZLEtBQUssQ0FBQ1osT0FBTyxZQUFZeEIsS0FBSyxDQUFFLElBQUlvQyxLQUFLLENBQUNlLFFBQVEsQ0FBQ0MsTUFBTSxLQUFLLElBQUksQ0FBQ3hDLFdBQVcsRUFBRztVQUN2RixNQUFNOEQsaUJBQWlCLEdBQUd0QyxLQUFLLENBQUNXLGFBQWE7VUFDN0NYLEtBQUssQ0FBQ1csYUFBYSxHQUFHLElBQUksQ0FBQ3BCLElBQUksQ0FBQyxDQUFDO1VBQ2pDLElBQUksQ0FBQytELE9BQU8sQ0FBRXRELEtBQU0sQ0FBQztVQUNyQkEsS0FBSyxDQUFDVyxhQUFhLEdBQUcyQixpQkFBaUIsQ0FBQyxDQUFDO1FBQzNDOztRQUVBcEMsVUFBVSxJQUFJQSxVQUFVLENBQUNDLGFBQWEsSUFBSUQsVUFBVSxDQUFDZ0IsR0FBRyxDQUFDLENBQUM7TUFDNUQsQ0FBQztNQUVEO01BQ0FxQyxNQUFNLEVBQUV2RCxLQUFLLElBQUk7UUFDZixJQUFLLENBQUMsSUFBSSxDQUFDQyxRQUFRLElBQUksSUFBSSxDQUFDeUIsVUFBVSxFQUFHO1VBQUU7UUFBUTtRQUVuRHhCLFVBQVUsSUFBSUEsVUFBVSxDQUFDQyxhQUFhLElBQUlELFVBQVUsQ0FBQ0MsYUFBYSxDQUFHLDBDQUF5QyxJQUFJLENBQUNkLEtBQUssQ0FBQzJDLFFBQVEsQ0FBQyxDQUFFLEVBQUUsQ0FBQztRQUN2STlCLFVBQVUsSUFBSUEsVUFBVSxDQUFDQyxhQUFhLElBQUlELFVBQVUsQ0FBQ0UsSUFBSSxDQUFDLENBQUM7UUFFM0RsQyxNQUFNLElBQUlBLE1BQU0sQ0FBRThCLEtBQUssQ0FBQ1osT0FBTyxLQUFLLElBQUksQ0FBQ0EsT0FBTyxFQUFFLHlCQUEwQixDQUFDO1FBRTdFLE1BQU1rRCxpQkFBaUIsR0FBR3RDLEtBQUssQ0FBQ1csYUFBYTtRQUM3Q1gsS0FBSyxDQUFDVyxhQUFhLEdBQUcsSUFBSSxDQUFDcEIsSUFBSSxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDK0QsT0FBTyxDQUFFdEQsS0FBTSxDQUFDO1FBQ3JCQSxLQUFLLENBQUNXLGFBQWEsR0FBRzJCLGlCQUFpQixDQUFDLENBQUM7O1FBRXpDO1FBQ0EsSUFBSyxDQUFDLElBQUksQ0FBQ2hELFNBQVMsRUFBRztVQUNyQixJQUFJLENBQUNDLElBQUksQ0FBQzZELFNBQVMsQ0FBRSxJQUFJLENBQUMzRCxvQkFBcUIsQ0FBQztRQUNsRDtRQUVBUyxVQUFVLElBQUlBLFVBQVUsQ0FBQ0MsYUFBYSxJQUFJRCxVQUFVLENBQUNnQixHQUFHLENBQUMsQ0FBQztNQUM1RCxDQUFDO01BRUQ7TUFDQXNDLElBQUksRUFBRXhELEtBQUssSUFBSTtRQUNiLElBQUksQ0FBQ3lCLFVBQVUsQ0FBQ2dDLE9BQU8sQ0FBRXpELEtBQUssQ0FBQ1osT0FBTyxDQUFDVyxLQUFLLEVBQUVDLEtBQU0sQ0FBQztNQUN2RCxDQUFDO01BRUQ7TUFDQTBELFNBQVMsRUFBRUEsQ0FBQSxLQUFNO1FBQ2YsSUFBSSxDQUFDQSxTQUFTLENBQUMsQ0FBQztNQUNsQjtJQUNGLENBQUM7SUFFRCxJQUFJLENBQUNDLHNCQUFzQixDQUFFLENBQUMsQ0FBQyxFQUFFMUYsT0FBUSxDQUFDO0VBQzVDOztFQUVBO0VBQ0EsSUFBSWdDLFFBQVFBLENBQUEsRUFBRztJQUNiLE9BQU8sSUFBSSxDQUFDaEIsa0JBQWtCLENBQUMyRSxHQUFHLENBQUMsQ0FBQztFQUN0QztFQUVBLElBQUkzRCxRQUFRQSxDQUFFNEQsQ0FBQyxFQUFHO0lBQ2hCM0YsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLG1EQUFvRCxDQUFDO0VBQ2hGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRTRGLFNBQVNBLENBQUU5RCxLQUFLLEVBQUc7SUFDakIsSUFBSSxDQUFDRixlQUFlLENBQUMyRCxPQUFPLENBQUV6RCxLQUFLLENBQUNaLE9BQU8sQ0FBQ1csS0FBSyxFQUFFQyxLQUFNLENBQUM7RUFDNUQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFc0QsT0FBT0EsQ0FBRXRELEtBQUssRUFBRztJQUVmO0lBQ0E7SUFDQSxJQUFJLENBQUN3QyxhQUFhLENBQUNpQixPQUFPLENBQUV6RCxLQUFLLEdBQUdBLEtBQUssQ0FBQ1osT0FBTyxDQUFDVyxLQUFLLEdBQUcxQyxPQUFPLENBQUMwRyxJQUFJLEVBQUUvRCxLQUFNLENBQUM7RUFDakY7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRTBELFNBQVNBLENBQUEsRUFBRztJQUNWLElBQUssSUFBSSxDQUFDekQsUUFBUSxFQUFHO01BQ25CQyxVQUFVLElBQUlBLFVBQVUsQ0FBQ0MsYUFBYSxJQUFJRCxVQUFVLENBQUNDLGFBQWEsQ0FBRSw2QkFBOEIsQ0FBQztNQUNuR0QsVUFBVSxJQUFJQSxVQUFVLENBQUNDLGFBQWEsSUFBSUQsVUFBVSxDQUFDRSxJQUFJLENBQUMsQ0FBQztNQUUzRCxJQUFJLENBQUNULFdBQVcsR0FBRyxJQUFJO01BRXZCLElBQUssSUFBSSxDQUFDUCxPQUFPLElBQUksSUFBSSxDQUFDQSxPQUFPLENBQUM0RSxXQUFXLENBQUMsQ0FBQyxFQUFHO1FBQ2hELElBQUksQ0FBQ3BFLCtCQUErQixHQUFHLElBQUksQ0FBQ1IsT0FBTztNQUNyRDs7TUFFQTtNQUNBLElBQUksQ0FBQ2tFLE9BQU8sQ0FBRTtRQUNabEUsT0FBTyxFQUFFLElBQUksQ0FBQ0EsT0FBTztRQUNyQnVCLGFBQWEsRUFBRSxJQUFJLENBQUNwQjtNQUN0QixDQUFFLENBQUM7TUFFSCxJQUFJLENBQUNJLFdBQVcsR0FBRyxLQUFLO01BRXhCTyxVQUFVLElBQUlBLFVBQVUsQ0FBQ0MsYUFBYSxJQUFJRCxVQUFVLENBQUNnQixHQUFHLENBQUMsQ0FBQztJQUM1RDtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRStDLFNBQVNBLENBQUVqRSxLQUFLLEVBQUc7SUFDakI7SUFDQSxJQUFLQSxLQUFLLENBQUNaLE9BQU8sWUFBWXhCLEtBQUssSUFDOUJvQyxLQUFLLENBQUNlLFFBQVEsSUFDZCxJQUFJLENBQUM5QyxPQUFPLENBQUNPLFdBQVcsS0FBS3dCLEtBQUssQ0FBQ2UsUUFBUSxDQUFDQyxNQUFNLElBQ2xELElBQUksQ0FBQy9DLE9BQU8sQ0FBQ08sV0FBVyxLQUFLLENBQUMsQ0FBQyxFQUFHO01BQ3JDO0lBQ0Y7O0lBRUE7SUFDQSxJQUFLLElBQUksQ0FBQ2tELFVBQVUsRUFBRztNQUNyQjtJQUNGOztJQUVBO0lBQ0EsSUFBSyxDQUFDLElBQUksQ0FBQ3pCLFFBQVE7SUFDZDtJQUNFLENBQUNELEtBQUssQ0FBQ1osT0FBTyxDQUFDYSxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUNKLE9BQU8sQ0FBRSxJQUM1Q0csS0FBSyxDQUFDWixPQUFPLEtBQUssSUFBSSxDQUFDUSwrQkFBK0IsSUFDdERJLEtBQUssQ0FBQ2tFLGFBQWEsQ0FBQyxDQUFDLEVBQUc7TUFDM0IsSUFBSSxDQUFDSixTQUFTLENBQUU5RCxLQUFNLENBQUM7SUFDekI7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VtRSxjQUFjQSxDQUFFbkUsS0FBSyxFQUFHO0lBQ3RCO0lBQ0EsSUFBSyxJQUFJLENBQUMvQixPQUFPLENBQUNNLGNBQWMsS0FBTSxJQUFJLENBQUNOLE9BQU8sQ0FBQ00sY0FBYyxLQUFLLElBQUksSUFBSSxJQUFJLENBQUNOLE9BQU8sQ0FBQ00sY0FBYyxDQUFFeUIsS0FBTSxDQUFDLENBQUUsRUFBRztNQUNySCxJQUFJLENBQUNpRSxTQUFTLENBQUVqRSxLQUFNLENBQUM7SUFDekI7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7O0VBRUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VvRSxJQUFJQSxDQUFFcEUsS0FBSyxFQUFHO0lBQ1osSUFBSSxDQUFDaUUsU0FBUyxDQUFFakUsS0FBTSxDQUFDO0VBQ3pCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFcUUsVUFBVUEsQ0FBRXJFLEtBQUssRUFBRztJQUNsQixJQUFJLENBQUNtRSxjQUFjLENBQUVuRSxLQUFNLENBQUM7RUFDOUI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VzRSxTQUFTQSxDQUFFdEUsS0FBSyxFQUFHO0lBQ2pCLElBQUksQ0FBQ21FLGNBQWMsQ0FBRW5FLEtBQU0sQ0FBQztFQUM5Qjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFdUUsT0FBT0EsQ0FBQSxFQUFHO0lBQ1JyRSxVQUFVLElBQUlBLFVBQVUsQ0FBQ0MsYUFBYSxJQUFJRCxVQUFVLENBQUNDLGFBQWEsQ0FBRSwyQkFBNEIsQ0FBQztJQUNqR0QsVUFBVSxJQUFJQSxVQUFVLENBQUNDLGFBQWEsSUFBSUQsVUFBVSxDQUFDRSxJQUFJLENBQUMsQ0FBQztJQUUzRCxJQUFLLElBQUksQ0FBQ0gsUUFBUSxFQUFHO01BQ25CLElBQUssSUFBSSxDQUFDSixPQUFPLEVBQUc7UUFDbEI7UUFDQTtRQUNBLElBQUksQ0FBQ1QsT0FBTyxDQUFDYSxRQUFRLEdBQUcsS0FBSztNQUMvQjtNQUNBLElBQUksQ0FBQ2IsT0FBTyxDQUFDaUIsTUFBTSxHQUFHLElBQUk7TUFDMUIsSUFBSSxDQUFDakIsT0FBTyxDQUFDcUQsbUJBQW1CLENBQUUsSUFBSSxDQUFDbEMsWUFBYSxDQUFDO0lBQ3ZEO0lBQ0EsSUFBSSxDQUFDdEIsa0JBQWtCLENBQUNzRixPQUFPLENBQUMsQ0FBQzs7SUFFakM7SUFDQSxJQUFJLENBQUMvQixhQUFhLENBQUMrQixPQUFPLENBQUMsQ0FBQztJQUM1QixJQUFJLENBQUM5QyxVQUFVLENBQUM4QyxPQUFPLENBQUMsQ0FBQztJQUN6QixJQUFJLENBQUN6RSxlQUFlLENBQUN5RSxPQUFPLENBQUMsQ0FBQztJQUU5QixLQUFLLENBQUNBLE9BQU8sQ0FBQyxDQUFDO0lBRWZyRSxVQUFVLElBQUlBLFVBQVUsQ0FBQ0MsYUFBYSxJQUFJRCxVQUFVLENBQUNnQixHQUFHLENBQUMsQ0FBQztFQUM1RDs7RUFHQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQU9zRCx3QkFBd0JBLENBQUVKLElBQUksRUFBRW5HLE9BQU8sRUFBRztJQUUvQ0EsT0FBTyxHQUFHVixLQUFLLENBQUU7TUFDZmdCLGNBQWMsRUFBRTtJQUNsQixDQUFDLEVBQUVOLE9BQVEsQ0FBQztJQUVaLE9BQU87TUFDTG1HLElBQUksRUFBRXBFLEtBQUssSUFBSTtRQUNiLElBQUssQ0FBQ0EsS0FBSyxDQUFDWixPQUFPLENBQUNhLFFBQVEsSUFBSUQsS0FBSyxDQUFDa0UsYUFBYSxDQUFDLENBQUMsRUFBRztVQUN0REUsSUFBSSxDQUFFcEUsS0FBTSxDQUFDO1FBQ2Y7TUFDRixDQUFDO01BQ0RxRSxVQUFVLEVBQUUsU0FBQUEsQ0FBVXJFLEtBQUssRUFBRztRQUM1Qi9CLE9BQU8sQ0FBQ00sY0FBYyxJQUFJLElBQUksQ0FBQzZGLElBQUksQ0FBRXBFLEtBQU0sQ0FBQztNQUM5QyxDQUFDO01BQ0RzRSxTQUFTLEVBQUUsU0FBQUEsQ0FBVXRFLEtBQUssRUFBRztRQUMzQi9CLE9BQU8sQ0FBQ00sY0FBYyxJQUFJLElBQUksQ0FBQzZGLElBQUksQ0FBRXBFLEtBQU0sQ0FBQztNQUM5QztJQUNGLENBQUM7RUFDSDtBQUNGO0FBRUFuQyxPQUFPLENBQUM0RyxRQUFRLENBQUUsbUJBQW1CLEVBQUUxRyxpQkFBa0IsQ0FBQztBQUUxRCxlQUFlQSxpQkFBaUIifQ==