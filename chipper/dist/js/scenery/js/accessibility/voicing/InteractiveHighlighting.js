// Copyright 2021-2023, University of Colorado Boulder

/**
 * A trait for Node that mixes functionality to support visual highlights that appear on hover with a pointer.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import { DelayedMutate, Focus, Node, scenery } from '../../imports.js';
import memoize from '../../../../phet-core/js/memoize.js';

// constants
// option keys for InteractiveHighlighting, each of these will have a setter and getter and values are applied with mutate()
const INTERACTIVE_HIGHLIGHTING_OPTIONS = ['interactiveHighlight', 'interactiveHighlightLayerable', 'interactiveHighlightEnabled'];
const InteractiveHighlighting = memoize(Type => {
  // @ts-expect-error
  assert && assert(!Type._mixesInteractiveHighlighting, 'InteractiveHighlighting is already added to this Type');
  const InteractiveHighlightingClass = DelayedMutate('InteractiveHighlightingClass', INTERACTIVE_HIGHLIGHTING_OPTIONS, class InteractiveHighlightingClass extends Type {
    // Input listener to activate the HighlightOverlay upon pointer input. Uses exit and enter instead of over and out
    // because we do not want this to fire from bubbling. The highlight should be around this Node when it receives
    // input.

    // A reference to the Pointer so that we can add and remove listeners from it when necessary.
    // Since this is on the trait, only one pointer can have a listener for this Node that uses InteractiveHighlighting
    // at one time.
    // A map that collects all of the Displays that this InteractiveHighlighting Node is
    // attached to, mapping the unique ID of the Instance Trail to the Display. We need a reference to the
    // Displays to activate the Focus Property associated with highlighting, and to add/remove listeners when
    // features that require highlighting are enabled/disabled. Note that this is updated asynchronously
    // (with updateDisplay) since Instances are added asynchronously.
    // The highlight that will surround this Node when it is activated and a Pointer is currently over it. When
    // null, the focus highlight will be used (as defined in ParallelDOM.js).
    // If true, the highlight will be layerable in the scene graph instead of drawn
    // above everything in the HighlightOverlay. If true, you are responsible for adding the interactiveHighlight
    // in the location you want in the scene graph. The interactiveHighlight will become visible when
    // this.interactiveHighlightActivated is true.
    // If true, the highlight will be displayed on activation input. If false, it will not and we can remove listeners
    // that would do this work.
    // Emits an event when the interactive highlight changes for this Node
    // When new instances of this Node are created, adds an entry to the map of Displays.
    // Listener that adds/removes other listeners that activate highlights when
    // the feature becomes enabled/disabled so that we don't do extra work related to highlighting unless
    // it is necessary.
    // Input listener that locks the HighlightOverlay so that there are no updates to the highlight
    // while the pointer is down over something that uses InteractiveHighlighting.
    constructor(...args) {
      super(...args);
      this._activationListener = {
        enter: this._onPointerEntered.bind(this),
        move: this._onPointerMove.bind(this),
        exit: this._onPointerExited.bind(this),
        down: this._onPointerDown.bind(this)
      };
      this._pointer = null;
      this.displays = {};
      this._interactiveHighlight = null;
      this._interactiveHighlightLayerable = false;
      this._interactiveHighlightEnabled = true;
      this.interactiveHighlightChangedEmitter = new TinyEmitter();
      this._changedInstanceListener = this.onChangedInstance.bind(this);
      this.changedInstanceEmitter.addListener(this._changedInstanceListener);
      this._interactiveHighlightingEnabledListener = this._onInteractiveHighlightingEnabledChange.bind(this);
      const boundPointerReleaseListener = this._onPointerRelease.bind(this);
      const boundPointerCancel = this._onPointerCancel.bind(this);
      this._pointerListener = {
        up: boundPointerReleaseListener,
        cancel: boundPointerCancel,
        interrupt: boundPointerCancel
      };
    }

    /**
     * Whether a Node composes InteractiveHighlighting.
     */
    get isInteractiveHighlighting() {
      return true;
    }
    static get _mixesInteractiveHighlighting() {
      return true;
    }

    /**
     * Set the interactive highlight for this node. By default, the highlight will be a pink rectangle that surrounds
     * the node's local bounds.
     */
    setInteractiveHighlight(interactiveHighlight) {
      if (this._interactiveHighlight !== interactiveHighlight) {
        this._interactiveHighlight = interactiveHighlight;
        if (this._interactiveHighlightLayerable) {
          // if focus highlight is layerable, it must be a node for the scene graph
          assert && assert(interactiveHighlight instanceof Node); // eslint-disable-line no-simple-type-checking-assertions

          // make sure the highlight is invisible, the HighlightOverlay will manage visibility
          interactiveHighlight.visible = false;
        }
        this.interactiveHighlightChangedEmitter.emit();
      }
    }
    set interactiveHighlight(interactiveHighlight) {
      this.setInteractiveHighlight(interactiveHighlight);
    }
    get interactiveHighlight() {
      return this.getInteractiveHighlight();
    }

    /**
     * Returns the interactive highlight for this Node.
     */
    getInteractiveHighlight() {
      return this._interactiveHighlight;
    }

    /**
     * Sets whether the highlight is layerable in the scene graph instead of above everything in the
     * highlight overlay. If layerable, you must provide a custom highlight and it must be a Node. The highlight
     * Node will always be invisible unless this Node is activated with a pointer.
     */
    setInteractiveHighlightLayerable(interactiveHighlightLayerable) {
      if (this._interactiveHighlightLayerable !== interactiveHighlightLayerable) {
        this._interactiveHighlightLayerable = interactiveHighlightLayerable;
        if (this._interactiveHighlight) {
          assert && assert(this._interactiveHighlight instanceof Node);
          this._interactiveHighlight.visible = false;
          this.interactiveHighlightChangedEmitter.emit();
        }
      }
    }
    set interactiveHighlightLayerable(interactiveHighlightLayerable) {
      this.setInteractiveHighlightLayerable(interactiveHighlightLayerable);
    }
    get interactiveHighlightLayerable() {
      return this.getInteractiveHighlightLayerable();
    }

    /**
     * Get whether the interactive highlight is layerable in the scene graph.
     */
    getInteractiveHighlightLayerable() {
      return this._interactiveHighlightLayerable;
    }

    /**
     * Set the enabled state of Interactive Highlights on this Node. When false, highlights will not activate
     * on this Node with mouse and touch input. You can also disable Interactive Highlights by making the node
     * pickable: false. Use this when you want to disable Interactive Highlights without modifying pickability.
     */
    setInteractiveHighlightEnabled(enabled) {
      this._interactiveHighlightEnabled = enabled;

      // Each display has its own focusManager.pointerHighlightsVisibleProperty, so we need to go through all of them
      // and update after this enabled change
      const trailIds = Object.keys(this.displays);
      for (let i = 0; i < trailIds.length; i++) {
        const display = this.displays[trailIds[i]];
        this._interactiveHighlightingEnabledListener(display.focusManager.pointerHighlightsVisibleProperty.value);
      }
    }

    /**
     * Are Interactive Highlights enabled for this Node? When false, no highlights activate from mouse and touch.
     */
    getInteractiveHighlightEnabled() {
      return this._interactiveHighlightEnabled;
    }
    set interactiveHighlightEnabled(enabled) {
      this.setInteractiveHighlightEnabled(enabled);
    }
    get interactiveHighlightEnabled() {
      return this.getInteractiveHighlightEnabled();
    }

    /**
     * Returns true if this Node is "activated" by a pointer, indicating that a Pointer is over it
     * and this Node mixes InteractiveHighlighting so an interactive highlight should surround it.
     */
    isInteractiveHighlightActivated() {
      let activated = false;
      const trailIds = Object.keys(this.displays);
      for (let i = 0; i < trailIds.length; i++) {
        const pointerFocus = this.displays[trailIds[i]].focusManager.pointerFocusProperty.value;
        if (pointerFocus && pointerFocus.trail.lastNode() === this) {
          activated = true;
          break;
        }
      }
      return activated;
    }
    get interactiveHighlightActivated() {
      return this.isInteractiveHighlightActivated();
    }
    dispose() {
      this.changedInstanceEmitter.removeListener(this._changedInstanceListener);

      // remove the activation listener if it is currently attached
      if (this.hasInputListener(this._activationListener)) {
        this.removeInputListener(this._activationListener);
      }

      // remove listeners on displays and remove Displays from the map
      const trailIds = Object.keys(this.displays);
      for (let i = 0; i < trailIds.length; i++) {
        const display = this.displays[trailIds[i]];
        display.focusManager.pointerHighlightsVisibleProperty.unlink(this._interactiveHighlightingEnabledListener);
        delete this.displays[trailIds[i]];
      }
      super.dispose && super.dispose();
    }

    /**
     * When a Pointer enters this Node, signal to the Displays that the pointer is over this Node so that the
     * HighlightOverlay can be activated.
     */
    _onPointerEntered(event) {
      const displays = Object.values(this.displays);
      for (let i = 0; i < displays.length; i++) {
        const display = displays[i];
        if (display.focusManager.pointerFocusProperty.value === null || !event.trail.equals(display.focusManager.pointerFocusProperty.value.trail)) {
          display.focusManager.pointerFocusProperty.set(new Focus(display, event.trail));
        }
      }
    }
    _onPointerMove(event) {
      const displays = Object.values(this.displays);
      for (let i = 0; i < displays.length; i++) {
        const display = displays[i];

        // the SceneryEvent might have gone through a descendant of this Node
        const rootToSelf = event.trail.subtrailTo(this);

        // only do more work on move if the event indicates that pointer focus might have changed
        if (display.focusManager.pointerFocusProperty.value === null || !rootToSelf.equals(display.focusManager.pointerFocusProperty.value.trail)) {
          if (!this.getDescendantsUseHighlighting(event.trail)) {
            display.focusManager.pointerFocusProperty.set(new Focus(display, rootToSelf));
          }
        }
      }
    }

    /**
     * When a pointer exits this Node or its children, signal to the Displays that pointer focus has changed to
     * deactivate the HighlightOverlay. This can also fire when visibility/pickability of the Node changes.
     */
    _onPointerExited(event) {
      const displays = Object.values(this.displays);
      for (let i = 0; i < displays.length; i++) {
        const display = displays[i];
        display.focusManager.pointerFocusProperty.set(null);

        // An exit event may come from a Node along the trail becoming invisible or unpickable. In that case unlock
        // focus and remove pointer listeners so that highlights can continue to update from new input.
        if (!event.trail.isPickable()) {
          // unlock and remove pointer listeners
          this._onPointerRelease(event);
        }
      }
    }

    /**
     * When a pointer goes down on this Node, signal to the Displays that the pointerFocus is locked
     */
    _onPointerDown(event) {
      if (this._pointer === null) {
        const displays = Object.values(this.displays);
        for (let i = 0; i < displays.length; i++) {
          const display = displays[i];
          const focus = display.focusManager.pointerFocusProperty.value;

          // focus should generally be defined when pointer enters the Node, but it may be null in cases of
          // cancel or interrupt
          if (focus) {
            // Set the lockedPointerFocusProperty with a copy of the Focus (as deep as possible) because we want
            // to keep a reference to the old Trail while pointerFocusProperty changes.
            display.focusManager.lockedPointerFocusProperty.set(new Focus(focus.display, focus.trail.copy()));
          }
        }
        this._pointer = event.pointer;
        this._pointer.addInputListener(this._pointerListener);
      }
    }

    /**
     * When a Pointer goes up after going down on this Node, signal to the Displays that the pointerFocusProperty no
     * longer needs to be locked.
     *
     * @param [event] - may be called during interrupt or cancel, in which case there is no event
     */
    _onPointerRelease(event) {
      const displays = Object.values(this.displays);
      for (let i = 0; i < displays.length; i++) {
        const display = displays[i];
        display.focusManager.lockedPointerFocusProperty.value = null;
      }
      if (this._pointer && this._pointer.listeners.includes(this._pointerListener)) {
        this._pointer.removeInputListener(this._pointerListener);
        this._pointer = null;
      }
    }

    /**
     * If the pointer listener is cancelled or interrupted, clear focus and remove input listeners.
     */
    _onPointerCancel(event) {
      const displays = Object.values(this.displays);
      for (let i = 0; i < displays.length; i++) {
        const display = displays[i];
        display.focusManager.pointerFocusProperty.set(null);
      }

      // unlock and remove pointer listeners
      this._onPointerRelease(event);
    }

    /**
     * Add or remove listeners related to activating interactive highlighting when the feature becomes enabled.
     * Work related to interactive highlighting is avoided unless the feature is enabled.
     */
    _onInteractiveHighlightingEnabledChange(featureEnabled) {
      // Only listen to the activation listener if the feature is enabled and highlighting is enabled for this Node.
      const enabled = featureEnabled && this._interactiveHighlightEnabled;
      const hasActivationListener = this.hasInputListener(this._activationListener);
      if (enabled && !hasActivationListener) {
        this.addInputListener(this._activationListener);
      } else if (!enabled && hasActivationListener) {
        this.removeInputListener(this._activationListener);
      }
    }

    /**
     * Add the Display to the collection when this Node is added to a scene graph. Also adds listeners to the
     * Display that turns on highlighting when the feature is enabled.
     */
    onChangedInstance(instance, added) {
      assert && assert(instance.trail, 'should have a trail');
      if (added) {
        this.displays[instance.trail.uniqueId] = instance.display;

        // Listener may already by on the display in cases of DAG, only add if this is the first instance of this Node
        if (!instance.display.focusManager.pointerHighlightsVisibleProperty.hasListener(this._interactiveHighlightingEnabledListener)) {
          instance.display.focusManager.pointerHighlightsVisibleProperty.link(this._interactiveHighlightingEnabledListener);
        }
      } else {
        assert && assert(instance.node, 'should have a node');
        const display = this.displays[instance.trail.uniqueId];

        // If the node was disposed, this display reference has already been cleaned up, but instances are updated
        // (disposed) on the next frame after the node was disposed. Only unlink if there are no more instances of
        // this node;
        if (display && instance.node.instances.length === 0) {
          display.focusManager.pointerHighlightsVisibleProperty.unlink(this._interactiveHighlightingEnabledListener);
        }
        delete this.displays[instance.trail.uniqueId];
      }
    }

    /**
     * Returns true if any nodes from this Node to the leaf of the Trail use Voicing features in some way. In
     * general, we do not want to activate voicing features in this case because the leaf-most Nodes in the Trail
     * should be activated instead.
     */
    getDescendantsUseHighlighting(trail) {
      const indexOfSelf = trail.nodes.indexOf(this);

      // all the way to length, end not included in slice - and if start value is greater than index range
      // an empty array is returned
      const childToLeafNodes = trail.nodes.slice(indexOfSelf + 1, trail.nodes.length);

      // if any of the nodes from leaf to self use InteractiveHighlighting, they should receive input, and we shouldn't
      // speak the content for this Node
      let descendantsUseVoicing = false;
      for (let i = 0; i < childToLeafNodes.length; i++) {
        if (childToLeafNodes[i].isInteractiveHighlighting) {
          descendantsUseVoicing = true;
          break;
        }
      }
      return descendantsUseVoicing;
    }
    mutate(options) {
      return super.mutate(options);
    }
  });

  /**
   * {Array.<string>} - String keys for all the allowed options that will be set by Node.mutate( options ), in
   * the order they will be evaluated.
   *
   * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
   *       cases that may apply.
   */
  InteractiveHighlightingClass.prototype._mutatorKeys = INTERACTIVE_HIGHLIGHTING_OPTIONS.concat(InteractiveHighlightingClass.prototype._mutatorKeys);
  assert && assert(InteractiveHighlightingClass.prototype._mutatorKeys.length === _.uniq(InteractiveHighlightingClass.prototype._mutatorKeys).length, 'duplicate mutator keys in InteractiveHighlighting');
  return InteractiveHighlightingClass;
});

// Provides a way to determine if a Node is composed with InteractiveHighlighting by type
const wrapper = () => InteractiveHighlighting(Node);
scenery.register('InteractiveHighlighting', InteractiveHighlighting);
export default InteractiveHighlighting;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsIkRlbGF5ZWRNdXRhdGUiLCJGb2N1cyIsIk5vZGUiLCJzY2VuZXJ5IiwibWVtb2l6ZSIsIklOVEVSQUNUSVZFX0hJR0hMSUdIVElOR19PUFRJT05TIiwiSW50ZXJhY3RpdmVIaWdobGlnaHRpbmciLCJUeXBlIiwiYXNzZXJ0IiwiX21peGVzSW50ZXJhY3RpdmVIaWdobGlnaHRpbmciLCJJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ0NsYXNzIiwiY29uc3RydWN0b3IiLCJhcmdzIiwiX2FjdGl2YXRpb25MaXN0ZW5lciIsImVudGVyIiwiX29uUG9pbnRlckVudGVyZWQiLCJiaW5kIiwibW92ZSIsIl9vblBvaW50ZXJNb3ZlIiwiZXhpdCIsIl9vblBvaW50ZXJFeGl0ZWQiLCJkb3duIiwiX29uUG9pbnRlckRvd24iLCJfcG9pbnRlciIsImRpc3BsYXlzIiwiX2ludGVyYWN0aXZlSGlnaGxpZ2h0IiwiX2ludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlIiwiX2ludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZCIsImludGVyYWN0aXZlSGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXIiLCJfY2hhbmdlZEluc3RhbmNlTGlzdGVuZXIiLCJvbkNoYW5nZWRJbnN0YW5jZSIsImNoYW5nZWRJbnN0YW5jZUVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsIl9pbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ0VuYWJsZWRMaXN0ZW5lciIsIl9vbkludGVyYWN0aXZlSGlnaGxpZ2h0aW5nRW5hYmxlZENoYW5nZSIsImJvdW5kUG9pbnRlclJlbGVhc2VMaXN0ZW5lciIsIl9vblBvaW50ZXJSZWxlYXNlIiwiYm91bmRQb2ludGVyQ2FuY2VsIiwiX29uUG9pbnRlckNhbmNlbCIsIl9wb2ludGVyTGlzdGVuZXIiLCJ1cCIsImNhbmNlbCIsImludGVycnVwdCIsImlzSW50ZXJhY3RpdmVIaWdobGlnaHRpbmciLCJzZXRJbnRlcmFjdGl2ZUhpZ2hsaWdodCIsImludGVyYWN0aXZlSGlnaGxpZ2h0IiwidmlzaWJsZSIsImVtaXQiLCJnZXRJbnRlcmFjdGl2ZUhpZ2hsaWdodCIsInNldEludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlIiwiaW50ZXJhY3RpdmVIaWdobGlnaHRMYXllcmFibGUiLCJnZXRJbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZSIsInNldEludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZCIsImVuYWJsZWQiLCJ0cmFpbElkcyIsIk9iamVjdCIsImtleXMiLCJpIiwibGVuZ3RoIiwiZGlzcGxheSIsImZvY3VzTWFuYWdlciIsInBvaW50ZXJIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5IiwidmFsdWUiLCJnZXRJbnRlcmFjdGl2ZUhpZ2hsaWdodEVuYWJsZWQiLCJpbnRlcmFjdGl2ZUhpZ2hsaWdodEVuYWJsZWQiLCJpc0ludGVyYWN0aXZlSGlnaGxpZ2h0QWN0aXZhdGVkIiwiYWN0aXZhdGVkIiwicG9pbnRlckZvY3VzIiwicG9pbnRlckZvY3VzUHJvcGVydHkiLCJ0cmFpbCIsImxhc3ROb2RlIiwiaW50ZXJhY3RpdmVIaWdobGlnaHRBY3RpdmF0ZWQiLCJkaXNwb3NlIiwicmVtb3ZlTGlzdGVuZXIiLCJoYXNJbnB1dExpc3RlbmVyIiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsInVubGluayIsImV2ZW50IiwidmFsdWVzIiwiZXF1YWxzIiwic2V0Iiwicm9vdFRvU2VsZiIsInN1YnRyYWlsVG8iLCJnZXREZXNjZW5kYW50c1VzZUhpZ2hsaWdodGluZyIsImlzUGlja2FibGUiLCJmb2N1cyIsImxvY2tlZFBvaW50ZXJGb2N1c1Byb3BlcnR5IiwiY29weSIsInBvaW50ZXIiLCJhZGRJbnB1dExpc3RlbmVyIiwibGlzdGVuZXJzIiwiaW5jbHVkZXMiLCJmZWF0dXJlRW5hYmxlZCIsImhhc0FjdGl2YXRpb25MaXN0ZW5lciIsImluc3RhbmNlIiwiYWRkZWQiLCJ1bmlxdWVJZCIsImhhc0xpc3RlbmVyIiwibGluayIsIm5vZGUiLCJpbnN0YW5jZXMiLCJpbmRleE9mU2VsZiIsIm5vZGVzIiwiaW5kZXhPZiIsImNoaWxkVG9MZWFmTm9kZXMiLCJzbGljZSIsImRlc2NlbmRhbnRzVXNlVm9pY2luZyIsIm11dGF0ZSIsIm9wdGlvbnMiLCJwcm90b3R5cGUiLCJfbXV0YXRvcktleXMiLCJjb25jYXQiLCJfIiwidW5pcSIsIndyYXBwZXIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkludGVyYWN0aXZlSGlnaGxpZ2h0aW5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgdHJhaXQgZm9yIE5vZGUgdGhhdCBtaXhlcyBmdW5jdGlvbmFsaXR5IHRvIHN1cHBvcnQgdmlzdWFsIGhpZ2hsaWdodHMgdGhhdCBhcHBlYXIgb24gaG92ZXIgd2l0aCBhIHBvaW50ZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBUaW55RW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RpbnlFbWl0dGVyLmpzJztcclxuaW1wb3J0IENvbnN0cnVjdG9yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9Db25zdHJ1Y3Rvci5qcyc7XHJcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xyXG5pbXBvcnQgeyBEZWxheWVkTXV0YXRlLCBEaXNwbGF5LCBGb2N1cywgSW5zdGFuY2UsIE5vZGUsIFBvaW50ZXIsIHNjZW5lcnksIFNjZW5lcnlFdmVudCwgVElucHV0TGlzdGVuZXIsIFRyYWlsIH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB7IEhpZ2hsaWdodCB9IGZyb20gJy4uLy4uL292ZXJsYXlzL0hpZ2hsaWdodE92ZXJsYXkuanMnO1xyXG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XHJcbmltcG9ydCBtZW1vaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZW1vaXplLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG4vLyBvcHRpb24ga2V5cyBmb3IgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcsIGVhY2ggb2YgdGhlc2Ugd2lsbCBoYXZlIGEgc2V0dGVyIGFuZCBnZXR0ZXIgYW5kIHZhbHVlcyBhcmUgYXBwbGllZCB3aXRoIG11dGF0ZSgpXHJcbmNvbnN0IElOVEVSQUNUSVZFX0hJR0hMSUdIVElOR19PUFRJT05TID0gW1xyXG4gICdpbnRlcmFjdGl2ZUhpZ2hsaWdodCcsXHJcbiAgJ2ludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlJyxcclxuICAnaW50ZXJhY3RpdmVIaWdobGlnaHRFbmFibGVkJ1xyXG5dO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBpbnRlcmFjdGl2ZUhpZ2hsaWdodD86IEhpZ2hsaWdodDtcclxuICBpbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZT86IGJvb2xlYW47XHJcbiAgaW50ZXJhY3RpdmVIaWdobGlnaHRFbmFibGVkPzogYm9vbGVhbjtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nT3B0aW9ucyA9IFNlbGZPcHRpb25zO1xyXG5cclxuY29uc3QgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcgPSBtZW1vaXplKCA8U3VwZXJUeXBlIGV4dGVuZHMgQ29uc3RydWN0b3I8Tm9kZT4+KCBUeXBlOiBTdXBlclR5cGUgKSA9PiB7XHJcblxyXG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCAhVHlwZS5fbWl4ZXNJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZywgJ0ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nIGlzIGFscmVhZHkgYWRkZWQgdG8gdGhpcyBUeXBlJyApO1xyXG5cclxuICBjb25zdCBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ0NsYXNzID0gRGVsYXllZE11dGF0ZSggJ0ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nQ2xhc3MnLCBJTlRFUkFDVElWRV9ISUdITElHSFRJTkdfT1BUSU9OUywgY2xhc3MgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmdDbGFzcyBleHRlbmRzIFR5cGUge1xyXG5cclxuICAgIC8vIElucHV0IGxpc3RlbmVyIHRvIGFjdGl2YXRlIHRoZSBIaWdobGlnaHRPdmVybGF5IHVwb24gcG9pbnRlciBpbnB1dC4gVXNlcyBleGl0IGFuZCBlbnRlciBpbnN0ZWFkIG9mIG92ZXIgYW5kIG91dFxyXG4gICAgLy8gYmVjYXVzZSB3ZSBkbyBub3Qgd2FudCB0aGlzIHRvIGZpcmUgZnJvbSBidWJibGluZy4gVGhlIGhpZ2hsaWdodCBzaG91bGQgYmUgYXJvdW5kIHRoaXMgTm9kZSB3aGVuIGl0IHJlY2VpdmVzXHJcbiAgICAvLyBpbnB1dC5cclxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2FjdGl2YXRpb25MaXN0ZW5lcjogVElucHV0TGlzdGVuZXI7XHJcblxyXG4gICAgLy8gQSByZWZlcmVuY2UgdG8gdGhlIFBvaW50ZXIgc28gdGhhdCB3ZSBjYW4gYWRkIGFuZCByZW1vdmUgbGlzdGVuZXJzIGZyb20gaXQgd2hlbiBuZWNlc3NhcnkuXHJcbiAgICAvLyBTaW5jZSB0aGlzIGlzIG9uIHRoZSB0cmFpdCwgb25seSBvbmUgcG9pbnRlciBjYW4gaGF2ZSBhIGxpc3RlbmVyIGZvciB0aGlzIE5vZGUgdGhhdCB1c2VzIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nXHJcbiAgICAvLyBhdCBvbmUgdGltZS5cclxuICAgIHByaXZhdGUgX3BvaW50ZXI6IG51bGwgfCBQb2ludGVyO1xyXG5cclxuICAgIC8vIEEgbWFwIHRoYXQgY29sbGVjdHMgYWxsIG9mIHRoZSBEaXNwbGF5cyB0aGF0IHRoaXMgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcgTm9kZSBpc1xyXG4gICAgLy8gYXR0YWNoZWQgdG8sIG1hcHBpbmcgdGhlIHVuaXF1ZSBJRCBvZiB0aGUgSW5zdGFuY2UgVHJhaWwgdG8gdGhlIERpc3BsYXkuIFdlIG5lZWQgYSByZWZlcmVuY2UgdG8gdGhlXHJcbiAgICAvLyBEaXNwbGF5cyB0byBhY3RpdmF0ZSB0aGUgRm9jdXMgUHJvcGVydHkgYXNzb2NpYXRlZCB3aXRoIGhpZ2hsaWdodGluZywgYW5kIHRvIGFkZC9yZW1vdmUgbGlzdGVuZXJzIHdoZW5cclxuICAgIC8vIGZlYXR1cmVzIHRoYXQgcmVxdWlyZSBoaWdobGlnaHRpbmcgYXJlIGVuYWJsZWQvZGlzYWJsZWQuIE5vdGUgdGhhdCB0aGlzIGlzIHVwZGF0ZWQgYXN5bmNocm9ub3VzbHlcclxuICAgIC8vICh3aXRoIHVwZGF0ZURpc3BsYXkpIHNpbmNlIEluc3RhbmNlcyBhcmUgYWRkZWQgYXN5bmNocm9ub3VzbHkuXHJcbiAgICBwcm90ZWN0ZWQgZGlzcGxheXM6IFJlY29yZDxzdHJpbmcsIERpc3BsYXk+O1xyXG5cclxuICAgIC8vIFRoZSBoaWdobGlnaHQgdGhhdCB3aWxsIHN1cnJvdW5kIHRoaXMgTm9kZSB3aGVuIGl0IGlzIGFjdGl2YXRlZCBhbmQgYSBQb2ludGVyIGlzIGN1cnJlbnRseSBvdmVyIGl0LiBXaGVuXHJcbiAgICAvLyBudWxsLCB0aGUgZm9jdXMgaGlnaGxpZ2h0IHdpbGwgYmUgdXNlZCAoYXMgZGVmaW5lZCBpbiBQYXJhbGxlbERPTS5qcykuXHJcbiAgICBwcml2YXRlIF9pbnRlcmFjdGl2ZUhpZ2hsaWdodDogSGlnaGxpZ2h0O1xyXG5cclxuICAgIC8vIElmIHRydWUsIHRoZSBoaWdobGlnaHQgd2lsbCBiZSBsYXllcmFibGUgaW4gdGhlIHNjZW5lIGdyYXBoIGluc3RlYWQgb2YgZHJhd25cclxuICAgIC8vIGFib3ZlIGV2ZXJ5dGhpbmcgaW4gdGhlIEhpZ2hsaWdodE92ZXJsYXkuIElmIHRydWUsIHlvdSBhcmUgcmVzcG9uc2libGUgZm9yIGFkZGluZyB0aGUgaW50ZXJhY3RpdmVIaWdobGlnaHRcclxuICAgIC8vIGluIHRoZSBsb2NhdGlvbiB5b3Ugd2FudCBpbiB0aGUgc2NlbmUgZ3JhcGguIFRoZSBpbnRlcmFjdGl2ZUhpZ2hsaWdodCB3aWxsIGJlY29tZSB2aXNpYmxlIHdoZW5cclxuICAgIC8vIHRoaXMuaW50ZXJhY3RpdmVIaWdobGlnaHRBY3RpdmF0ZWQgaXMgdHJ1ZS5cclxuICAgIHByaXZhdGUgX2ludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlOiBib29sZWFuO1xyXG5cclxuICAgIC8vIElmIHRydWUsIHRoZSBoaWdobGlnaHQgd2lsbCBiZSBkaXNwbGF5ZWQgb24gYWN0aXZhdGlvbiBpbnB1dC4gSWYgZmFsc2UsIGl0IHdpbGwgbm90IGFuZCB3ZSBjYW4gcmVtb3ZlIGxpc3RlbmVyc1xyXG4gICAgLy8gdGhhdCB3b3VsZCBkbyB0aGlzIHdvcmsuXHJcbiAgICBwcml2YXRlIF9pbnRlcmFjdGl2ZUhpZ2hsaWdodEVuYWJsZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgLy8gRW1pdHMgYW4gZXZlbnQgd2hlbiB0aGUgaW50ZXJhY3RpdmUgaGlnaGxpZ2h0IGNoYW5nZXMgZm9yIHRoaXMgTm9kZVxyXG4gICAgcHVibGljIGludGVyYWN0aXZlSGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXI6IFRFbWl0dGVyO1xyXG5cclxuICAgIC8vIFdoZW4gbmV3IGluc3RhbmNlcyBvZiB0aGlzIE5vZGUgYXJlIGNyZWF0ZWQsIGFkZHMgYW4gZW50cnkgdG8gdGhlIG1hcCBvZiBEaXNwbGF5cy5cclxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2NoYW5nZWRJbnN0YW5jZUxpc3RlbmVyOiAoIGluc3RhbmNlOiBJbnN0YW5jZSwgYWRkZWQ6IGJvb2xlYW4gKSA9PiB2b2lkO1xyXG5cclxuICAgIC8vIExpc3RlbmVyIHRoYXQgYWRkcy9yZW1vdmVzIG90aGVyIGxpc3RlbmVycyB0aGF0IGFjdGl2YXRlIGhpZ2hsaWdodHMgd2hlblxyXG4gICAgLy8gdGhlIGZlYXR1cmUgYmVjb21lcyBlbmFibGVkL2Rpc2FibGVkIHNvIHRoYXQgd2UgZG9uJ3QgZG8gZXh0cmEgd29yayByZWxhdGVkIHRvIGhpZ2hsaWdodGluZyB1bmxlc3NcclxuICAgIC8vIGl0IGlzIG5lY2Vzc2FyeS5cclxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nRW5hYmxlZExpc3RlbmVyOiAoIGVuYWJsZWQ6IGJvb2xlYW4gKSA9PiB2b2lkO1xyXG5cclxuICAgIC8vIElucHV0IGxpc3RlbmVyIHRoYXQgbG9ja3MgdGhlIEhpZ2hsaWdodE92ZXJsYXkgc28gdGhhdCB0aGVyZSBhcmUgbm8gdXBkYXRlcyB0byB0aGUgaGlnaGxpZ2h0XHJcbiAgICAvLyB3aGlsZSB0aGUgcG9pbnRlciBpcyBkb3duIG92ZXIgc29tZXRoaW5nIHRoYXQgdXNlcyBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZy5cclxuICAgIHByaXZhdGUgcmVhZG9ubHkgX3BvaW50ZXJMaXN0ZW5lcjogVElucHV0TGlzdGVuZXI7XHJcblxyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKCAuLi5hcmdzOiBJbnRlbnRpb25hbEFueVtdICkge1xyXG4gICAgICBzdXBlciggLi4uYXJncyApO1xyXG5cclxuICAgICAgdGhpcy5fYWN0aXZhdGlvbkxpc3RlbmVyID0ge1xyXG4gICAgICAgIGVudGVyOiB0aGlzLl9vblBvaW50ZXJFbnRlcmVkLmJpbmQoIHRoaXMgKSxcclxuICAgICAgICBtb3ZlOiB0aGlzLl9vblBvaW50ZXJNb3ZlLmJpbmQoIHRoaXMgKSxcclxuICAgICAgICBleGl0OiB0aGlzLl9vblBvaW50ZXJFeGl0ZWQuYmluZCggdGhpcyApLFxyXG4gICAgICAgIGRvd246IHRoaXMuX29uUG9pbnRlckRvd24uYmluZCggdGhpcyApXHJcbiAgICAgIH07XHJcblxyXG4gICAgICB0aGlzLl9wb2ludGVyID0gbnVsbDtcclxuICAgICAgdGhpcy5kaXNwbGF5cyA9IHt9O1xyXG4gICAgICB0aGlzLl9pbnRlcmFjdGl2ZUhpZ2hsaWdodCA9IG51bGw7XHJcbiAgICAgIHRoaXMuX2ludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuX2ludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZCA9IHRydWU7XHJcbiAgICAgIHRoaXMuaW50ZXJhY3RpdmVIaWdobGlnaHRDaGFuZ2VkRW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xyXG5cclxuICAgICAgdGhpcy5fY2hhbmdlZEluc3RhbmNlTGlzdGVuZXIgPSB0aGlzLm9uQ2hhbmdlZEluc3RhbmNlLmJpbmQoIHRoaXMgKTtcclxuICAgICAgdGhpcy5jaGFuZ2VkSW5zdGFuY2VFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLl9jaGFuZ2VkSW5zdGFuY2VMaXN0ZW5lciApO1xyXG5cclxuICAgICAgdGhpcy5faW50ZXJhY3RpdmVIaWdobGlnaHRpbmdFbmFibGVkTGlzdGVuZXIgPSB0aGlzLl9vbkludGVyYWN0aXZlSGlnaGxpZ2h0aW5nRW5hYmxlZENoYW5nZS5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgICBjb25zdCBib3VuZFBvaW50ZXJSZWxlYXNlTGlzdGVuZXIgPSB0aGlzLl9vblBvaW50ZXJSZWxlYXNlLmJpbmQoIHRoaXMgKTtcclxuICAgICAgY29uc3QgYm91bmRQb2ludGVyQ2FuY2VsID0gdGhpcy5fb25Qb2ludGVyQ2FuY2VsLmJpbmQoIHRoaXMgKTtcclxuXHJcbiAgICAgIHRoaXMuX3BvaW50ZXJMaXN0ZW5lciA9IHtcclxuICAgICAgICB1cDogYm91bmRQb2ludGVyUmVsZWFzZUxpc3RlbmVyLFxyXG4gICAgICAgIGNhbmNlbDogYm91bmRQb2ludGVyQ2FuY2VsLFxyXG4gICAgICAgIGludGVycnVwdDogYm91bmRQb2ludGVyQ2FuY2VsXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGV0aGVyIGEgTm9kZSBjb21wb3NlcyBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBpc0ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nKCk6IGJvb2xlYW4ge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldCBfbWl4ZXNJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZygpOiBib29sZWFuIHsgcmV0dXJuIHRydWU7fVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSBpbnRlcmFjdGl2ZSBoaWdobGlnaHQgZm9yIHRoaXMgbm9kZS4gQnkgZGVmYXVsdCwgdGhlIGhpZ2hsaWdodCB3aWxsIGJlIGEgcGluayByZWN0YW5nbGUgdGhhdCBzdXJyb3VuZHNcclxuICAgICAqIHRoZSBub2RlJ3MgbG9jYWwgYm91bmRzLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0SW50ZXJhY3RpdmVIaWdobGlnaHQoIGludGVyYWN0aXZlSGlnaGxpZ2h0OiBIaWdobGlnaHQgKTogdm9pZCB7XHJcblxyXG4gICAgICBpZiAoIHRoaXMuX2ludGVyYWN0aXZlSGlnaGxpZ2h0ICE9PSBpbnRlcmFjdGl2ZUhpZ2hsaWdodCApIHtcclxuICAgICAgICB0aGlzLl9pbnRlcmFjdGl2ZUhpZ2hsaWdodCA9IGludGVyYWN0aXZlSGlnaGxpZ2h0O1xyXG5cclxuICAgICAgICBpZiAoIHRoaXMuX2ludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlICkge1xyXG5cclxuICAgICAgICAgIC8vIGlmIGZvY3VzIGhpZ2hsaWdodCBpcyBsYXllcmFibGUsIGl0IG11c3QgYmUgYSBub2RlIGZvciB0aGUgc2NlbmUgZ3JhcGhcclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGludGVyYWN0aXZlSGlnaGxpZ2h0IGluc3RhbmNlb2YgTm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNpbXBsZS10eXBlLWNoZWNraW5nLWFzc2VydGlvbnNcclxuXHJcbiAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhlIGhpZ2hsaWdodCBpcyBpbnZpc2libGUsIHRoZSBIaWdobGlnaHRPdmVybGF5IHdpbGwgbWFuYWdlIHZpc2liaWxpdHlcclxuICAgICAgICAgICggaW50ZXJhY3RpdmVIaWdobGlnaHQgYXMgTm9kZSApLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaW50ZXJhY3RpdmVIaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IGludGVyYWN0aXZlSGlnaGxpZ2h0KCBpbnRlcmFjdGl2ZUhpZ2hsaWdodDogSGlnaGxpZ2h0ICkgeyB0aGlzLnNldEludGVyYWN0aXZlSGlnaGxpZ2h0KCBpbnRlcmFjdGl2ZUhpZ2hsaWdodCApOyB9XHJcblxyXG4gICAgcHVibGljIGdldCBpbnRlcmFjdGl2ZUhpZ2hsaWdodCgpOiBIaWdobGlnaHQgeyByZXR1cm4gdGhpcy5nZXRJbnRlcmFjdGl2ZUhpZ2hsaWdodCgpOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBpbnRlcmFjdGl2ZSBoaWdobGlnaHQgZm9yIHRoaXMgTm9kZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEludGVyYWN0aXZlSGlnaGxpZ2h0KCk6IEhpZ2hsaWdodCB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9pbnRlcmFjdGl2ZUhpZ2hsaWdodDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgd2hldGhlciB0aGUgaGlnaGxpZ2h0IGlzIGxheWVyYWJsZSBpbiB0aGUgc2NlbmUgZ3JhcGggaW5zdGVhZCBvZiBhYm92ZSBldmVyeXRoaW5nIGluIHRoZVxyXG4gICAgICogaGlnaGxpZ2h0IG92ZXJsYXkuIElmIGxheWVyYWJsZSwgeW91IG11c3QgcHJvdmlkZSBhIGN1c3RvbSBoaWdobGlnaHQgYW5kIGl0IG11c3QgYmUgYSBOb2RlLiBUaGUgaGlnaGxpZ2h0XHJcbiAgICAgKiBOb2RlIHdpbGwgYWx3YXlzIGJlIGludmlzaWJsZSB1bmxlc3MgdGhpcyBOb2RlIGlzIGFjdGl2YXRlZCB3aXRoIGEgcG9pbnRlci5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldEludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlKCBpbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZTogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgICAgaWYgKCB0aGlzLl9pbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZSAhPT0gaW50ZXJhY3RpdmVIaWdobGlnaHRMYXllcmFibGUgKSB7XHJcbiAgICAgICAgdGhpcy5faW50ZXJhY3RpdmVIaWdobGlnaHRMYXllcmFibGUgPSBpbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZTtcclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLl9pbnRlcmFjdGl2ZUhpZ2hsaWdodCApIHtcclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2ludGVyYWN0aXZlSGlnaGxpZ2h0IGluc3RhbmNlb2YgTm9kZSApO1xyXG4gICAgICAgICAgKCB0aGlzLl9pbnRlcmFjdGl2ZUhpZ2hsaWdodCBhcyBOb2RlICkudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgIHRoaXMuaW50ZXJhY3RpdmVIaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBpbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZSggaW50ZXJhY3RpdmVIaWdobGlnaHRMYXllcmFibGU6IGJvb2xlYW4gKSB7IHRoaXMuc2V0SW50ZXJhY3RpdmVIaWdobGlnaHRMYXllcmFibGUoIGludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlICk7IH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlKCkgeyByZXR1cm4gdGhpcy5nZXRJbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZSgpOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgd2hldGhlciB0aGUgaW50ZXJhY3RpdmUgaGlnaGxpZ2h0IGlzIGxheWVyYWJsZSBpbiB0aGUgc2NlbmUgZ3JhcGguXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRJbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZSgpOiBib29sZWFuIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2ludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSBlbmFibGVkIHN0YXRlIG9mIEludGVyYWN0aXZlIEhpZ2hsaWdodHMgb24gdGhpcyBOb2RlLiBXaGVuIGZhbHNlLCBoaWdobGlnaHRzIHdpbGwgbm90IGFjdGl2YXRlXHJcbiAgICAgKiBvbiB0aGlzIE5vZGUgd2l0aCBtb3VzZSBhbmQgdG91Y2ggaW5wdXQuIFlvdSBjYW4gYWxzbyBkaXNhYmxlIEludGVyYWN0aXZlIEhpZ2hsaWdodHMgYnkgbWFraW5nIHRoZSBub2RlXHJcbiAgICAgKiBwaWNrYWJsZTogZmFsc2UuIFVzZSB0aGlzIHdoZW4geW91IHdhbnQgdG8gZGlzYWJsZSBJbnRlcmFjdGl2ZSBIaWdobGlnaHRzIHdpdGhvdXQgbW9kaWZ5aW5nIHBpY2thYmlsaXR5LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0SW50ZXJhY3RpdmVIaWdobGlnaHRFbmFibGVkKCBlbmFibGVkOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgICB0aGlzLl9pbnRlcmFjdGl2ZUhpZ2hsaWdodEVuYWJsZWQgPSBlbmFibGVkO1xyXG5cclxuICAgICAgLy8gRWFjaCBkaXNwbGF5IGhhcyBpdHMgb3duIGZvY3VzTWFuYWdlci5wb2ludGVySGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eSwgc28gd2UgbmVlZCB0byBnbyB0aHJvdWdoIGFsbCBvZiB0aGVtXHJcbiAgICAgIC8vIGFuZCB1cGRhdGUgYWZ0ZXIgdGhpcyBlbmFibGVkIGNoYW5nZVxyXG4gICAgICBjb25zdCB0cmFpbElkcyA9IE9iamVjdC5rZXlzKCB0aGlzLmRpc3BsYXlzICk7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRyYWlsSWRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IGRpc3BsYXkgPSB0aGlzLmRpc3BsYXlzWyB0cmFpbElkc1sgaSBdIF07XHJcbiAgICAgICAgdGhpcy5faW50ZXJhY3RpdmVIaWdobGlnaHRpbmdFbmFibGVkTGlzdGVuZXIoIGRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBvaW50ZXJIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFyZSBJbnRlcmFjdGl2ZSBIaWdobGlnaHRzIGVuYWJsZWQgZm9yIHRoaXMgTm9kZT8gV2hlbiBmYWxzZSwgbm8gaGlnaGxpZ2h0cyBhY3RpdmF0ZSBmcm9tIG1vdXNlIGFuZCB0b3VjaC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZCgpOiBib29sZWFuIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2ludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IGludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZCggZW5hYmxlZDogYm9vbGVhbiApIHsgdGhpcy5zZXRJbnRlcmFjdGl2ZUhpZ2hsaWdodEVuYWJsZWQoIGVuYWJsZWQgKTsgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaW50ZXJhY3RpdmVIaWdobGlnaHRFbmFibGVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5nZXRJbnRlcmFjdGl2ZUhpZ2hsaWdodEVuYWJsZWQoKTsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgTm9kZSBpcyBcImFjdGl2YXRlZFwiIGJ5IGEgcG9pbnRlciwgaW5kaWNhdGluZyB0aGF0IGEgUG9pbnRlciBpcyBvdmVyIGl0XHJcbiAgICAgKiBhbmQgdGhpcyBOb2RlIG1peGVzIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nIHNvIGFuIGludGVyYWN0aXZlIGhpZ2hsaWdodCBzaG91bGQgc3Vycm91bmQgaXQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBpc0ludGVyYWN0aXZlSGlnaGxpZ2h0QWN0aXZhdGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICBsZXQgYWN0aXZhdGVkID0gZmFsc2U7XHJcblxyXG4gICAgICBjb25zdCB0cmFpbElkcyA9IE9iamVjdC5rZXlzKCB0aGlzLmRpc3BsYXlzICk7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRyYWlsSWRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IHBvaW50ZXJGb2N1cyA9IHRoaXMuZGlzcGxheXNbIHRyYWlsSWRzWyBpIF0gXS5mb2N1c01hbmFnZXIucG9pbnRlckZvY3VzUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgaWYgKCBwb2ludGVyRm9jdXMgJiYgcG9pbnRlckZvY3VzLnRyYWlsLmxhc3ROb2RlKCkgPT09IHRoaXMgKSB7XHJcbiAgICAgICAgICBhY3RpdmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBhY3RpdmF0ZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBpbnRlcmFjdGl2ZUhpZ2hsaWdodEFjdGl2YXRlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuaXNJbnRlcmFjdGl2ZUhpZ2hsaWdodEFjdGl2YXRlZCgpOyB9XHJcblxyXG4gICAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuY2hhbmdlZEluc3RhbmNlRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5fY2hhbmdlZEluc3RhbmNlTGlzdGVuZXIgKTtcclxuXHJcbiAgICAgIC8vIHJlbW92ZSB0aGUgYWN0aXZhdGlvbiBsaXN0ZW5lciBpZiBpdCBpcyBjdXJyZW50bHkgYXR0YWNoZWRcclxuICAgICAgaWYgKCB0aGlzLmhhc0lucHV0TGlzdGVuZXIoIHRoaXMuX2FjdGl2YXRpb25MaXN0ZW5lciApICkge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5fYWN0aXZhdGlvbkxpc3RlbmVyICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lcnMgb24gZGlzcGxheXMgYW5kIHJlbW92ZSBEaXNwbGF5cyBmcm9tIHRoZSBtYXBcclxuICAgICAgY29uc3QgdHJhaWxJZHMgPSBPYmplY3Qua2V5cyggdGhpcy5kaXNwbGF5cyApO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0cmFpbElkcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBkaXNwbGF5ID0gdGhpcy5kaXNwbGF5c1sgdHJhaWxJZHNbIGkgXSBdO1xyXG5cclxuICAgICAgICBkaXNwbGF5LmZvY3VzTWFuYWdlci5wb2ludGVySGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eS51bmxpbmsoIHRoaXMuX2ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nRW5hYmxlZExpc3RlbmVyICk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuZGlzcGxheXNbIHRyYWlsSWRzWyBpIF0gXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgc3VwZXIuZGlzcG9zZSAmJiBzdXBlci5kaXNwb3NlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGVuIGEgUG9pbnRlciBlbnRlcnMgdGhpcyBOb2RlLCBzaWduYWwgdG8gdGhlIERpc3BsYXlzIHRoYXQgdGhlIHBvaW50ZXIgaXMgb3ZlciB0aGlzIE5vZGUgc28gdGhhdCB0aGVcclxuICAgICAqIEhpZ2hsaWdodE92ZXJsYXkgY2FuIGJlIGFjdGl2YXRlZC5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfb25Qb2ludGVyRW50ZXJlZCggZXZlbnQ6IFNjZW5lcnlFdmVudDxNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XHJcblxyXG4gICAgICBjb25zdCBkaXNwbGF5cyA9IE9iamVjdC52YWx1ZXMoIHRoaXMuZGlzcGxheXMgKTtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZGlzcGxheXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgZGlzcGxheSA9IGRpc3BsYXlzWyBpIF07XHJcblxyXG4gICAgICAgIGlmICggZGlzcGxheS5mb2N1c01hbmFnZXIucG9pbnRlckZvY3VzUHJvcGVydHkudmFsdWUgPT09IG51bGwgfHwgIWV2ZW50LnRyYWlsLmVxdWFscyggZGlzcGxheS5mb2N1c01hbmFnZXIucG9pbnRlckZvY3VzUHJvcGVydHkudmFsdWUudHJhaWwgKSApIHtcclxuXHJcbiAgICAgICAgICBkaXNwbGF5LmZvY3VzTWFuYWdlci5wb2ludGVyRm9jdXNQcm9wZXJ0eS5zZXQoIG5ldyBGb2N1cyggZGlzcGxheSwgZXZlbnQudHJhaWwgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX29uUG9pbnRlck1vdmUoIGV2ZW50OiBTY2VuZXJ5RXZlbnQ8TW91c2VFdmVudCB8IFRvdWNoRXZlbnQgfCBQb2ludGVyRXZlbnQ+ICk6IHZvaWQge1xyXG5cclxuICAgICAgY29uc3QgZGlzcGxheXMgPSBPYmplY3QudmFsdWVzKCB0aGlzLmRpc3BsYXlzICk7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGRpc3BsYXlzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IGRpc3BsYXkgPSBkaXNwbGF5c1sgaSBdO1xyXG5cclxuICAgICAgICAvLyB0aGUgU2NlbmVyeUV2ZW50IG1pZ2h0IGhhdmUgZ29uZSB0aHJvdWdoIGEgZGVzY2VuZGFudCBvZiB0aGlzIE5vZGVcclxuICAgICAgICBjb25zdCByb290VG9TZWxmID0gZXZlbnQudHJhaWwuc3VidHJhaWxUbyggdGhpcyApO1xyXG5cclxuICAgICAgICAvLyBvbmx5IGRvIG1vcmUgd29yayBvbiBtb3ZlIGlmIHRoZSBldmVudCBpbmRpY2F0ZXMgdGhhdCBwb2ludGVyIGZvY3VzIG1pZ2h0IGhhdmUgY2hhbmdlZFxyXG4gICAgICAgIGlmICggZGlzcGxheS5mb2N1c01hbmFnZXIucG9pbnRlckZvY3VzUHJvcGVydHkudmFsdWUgPT09IG51bGwgfHwgIXJvb3RUb1NlbGYuZXF1YWxzKCBkaXNwbGF5LmZvY3VzTWFuYWdlci5wb2ludGVyRm9jdXNQcm9wZXJ0eS52YWx1ZS50cmFpbCApICkge1xyXG5cclxuICAgICAgICAgIGlmICggIXRoaXMuZ2V0RGVzY2VuZGFudHNVc2VIaWdobGlnaHRpbmcoIGV2ZW50LnRyYWlsICkgKSB7XHJcblxyXG4gICAgICAgICAgICBkaXNwbGF5LmZvY3VzTWFuYWdlci5wb2ludGVyRm9jdXNQcm9wZXJ0eS5zZXQoIG5ldyBGb2N1cyggZGlzcGxheSwgcm9vdFRvU2VsZiApICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGVuIGEgcG9pbnRlciBleGl0cyB0aGlzIE5vZGUgb3IgaXRzIGNoaWxkcmVuLCBzaWduYWwgdG8gdGhlIERpc3BsYXlzIHRoYXQgcG9pbnRlciBmb2N1cyBoYXMgY2hhbmdlZCB0b1xyXG4gICAgICogZGVhY3RpdmF0ZSB0aGUgSGlnaGxpZ2h0T3ZlcmxheS4gVGhpcyBjYW4gYWxzbyBmaXJlIHdoZW4gdmlzaWJpbGl0eS9waWNrYWJpbGl0eSBvZiB0aGUgTm9kZSBjaGFuZ2VzLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9vblBvaW50ZXJFeGl0ZWQoIGV2ZW50OiBTY2VuZXJ5RXZlbnQ8TW91c2VFdmVudCB8IFRvdWNoRXZlbnQgfCBQb2ludGVyRXZlbnQ+ICk6IHZvaWQge1xyXG5cclxuICAgICAgY29uc3QgZGlzcGxheXMgPSBPYmplY3QudmFsdWVzKCB0aGlzLmRpc3BsYXlzICk7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGRpc3BsYXlzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IGRpc3BsYXkgPSBkaXNwbGF5c1sgaSBdO1xyXG4gICAgICAgIGRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBvaW50ZXJGb2N1c1Byb3BlcnR5LnNldCggbnVsbCApO1xyXG5cclxuICAgICAgICAvLyBBbiBleGl0IGV2ZW50IG1heSBjb21lIGZyb20gYSBOb2RlIGFsb25nIHRoZSB0cmFpbCBiZWNvbWluZyBpbnZpc2libGUgb3IgdW5waWNrYWJsZS4gSW4gdGhhdCBjYXNlIHVubG9ja1xyXG4gICAgICAgIC8vIGZvY3VzIGFuZCByZW1vdmUgcG9pbnRlciBsaXN0ZW5lcnMgc28gdGhhdCBoaWdobGlnaHRzIGNhbiBjb250aW51ZSB0byB1cGRhdGUgZnJvbSBuZXcgaW5wdXQuXHJcbiAgICAgICAgaWYgKCAhZXZlbnQudHJhaWwuaXNQaWNrYWJsZSgpICkge1xyXG5cclxuICAgICAgICAgIC8vIHVubG9jayBhbmQgcmVtb3ZlIHBvaW50ZXIgbGlzdGVuZXJzXHJcbiAgICAgICAgICB0aGlzLl9vblBvaW50ZXJSZWxlYXNlKCBldmVudCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hlbiBhIHBvaW50ZXIgZ29lcyBkb3duIG9uIHRoaXMgTm9kZSwgc2lnbmFsIHRvIHRoZSBEaXNwbGF5cyB0aGF0IHRoZSBwb2ludGVyRm9jdXMgaXMgbG9ja2VkXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX29uUG9pbnRlckRvd24oIGV2ZW50OiBTY2VuZXJ5RXZlbnQ8TW91c2VFdmVudCB8IFRvdWNoRXZlbnQgfCBQb2ludGVyRXZlbnQ+ICk6IHZvaWQge1xyXG5cclxuICAgICAgaWYgKCB0aGlzLl9wb2ludGVyID09PSBudWxsICkge1xyXG4gICAgICAgIGNvbnN0IGRpc3BsYXlzID0gT2JqZWN0LnZhbHVlcyggdGhpcy5kaXNwbGF5cyApO1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGRpc3BsYXlzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgY29uc3QgZGlzcGxheSA9IGRpc3BsYXlzWyBpIF07XHJcbiAgICAgICAgICBjb25zdCBmb2N1cyA9IGRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBvaW50ZXJGb2N1c1Byb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgICAgICAgIC8vIGZvY3VzIHNob3VsZCBnZW5lcmFsbHkgYmUgZGVmaW5lZCB3aGVuIHBvaW50ZXIgZW50ZXJzIHRoZSBOb2RlLCBidXQgaXQgbWF5IGJlIG51bGwgaW4gY2FzZXMgb2ZcclxuICAgICAgICAgIC8vIGNhbmNlbCBvciBpbnRlcnJ1cHRcclxuICAgICAgICAgIGlmICggZm9jdXMgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBTZXQgdGhlIGxvY2tlZFBvaW50ZXJGb2N1c1Byb3BlcnR5IHdpdGggYSBjb3B5IG9mIHRoZSBGb2N1cyAoYXMgZGVlcCBhcyBwb3NzaWJsZSkgYmVjYXVzZSB3ZSB3YW50XHJcbiAgICAgICAgICAgIC8vIHRvIGtlZXAgYSByZWZlcmVuY2UgdG8gdGhlIG9sZCBUcmFpbCB3aGlsZSBwb2ludGVyRm9jdXNQcm9wZXJ0eSBjaGFuZ2VzLlxyXG4gICAgICAgICAgICBkaXNwbGF5LmZvY3VzTWFuYWdlci5sb2NrZWRQb2ludGVyRm9jdXNQcm9wZXJ0eS5zZXQoIG5ldyBGb2N1cyggZm9jdXMuZGlzcGxheSwgZm9jdXMudHJhaWwuY29weSgpICkgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX3BvaW50ZXIgPSBldmVudC5wb2ludGVyO1xyXG4gICAgICAgIHRoaXMuX3BvaW50ZXIuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5fcG9pbnRlckxpc3RlbmVyICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFdoZW4gYSBQb2ludGVyIGdvZXMgdXAgYWZ0ZXIgZ29pbmcgZG93biBvbiB0aGlzIE5vZGUsIHNpZ25hbCB0byB0aGUgRGlzcGxheXMgdGhhdCB0aGUgcG9pbnRlckZvY3VzUHJvcGVydHkgbm9cclxuICAgICAqIGxvbmdlciBuZWVkcyB0byBiZSBsb2NrZWQuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIFtldmVudF0gLSBtYXkgYmUgY2FsbGVkIGR1cmluZyBpbnRlcnJ1cHQgb3IgY2FuY2VsLCBpbiB3aGljaCBjYXNlIHRoZXJlIGlzIG5vIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX29uUG9pbnRlclJlbGVhc2UoIGV2ZW50PzogU2NlbmVyeUV2ZW50PE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50PiApOiB2b2lkIHtcclxuXHJcbiAgICAgIGNvbnN0IGRpc3BsYXlzID0gT2JqZWN0LnZhbHVlcyggdGhpcy5kaXNwbGF5cyApO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBkaXNwbGF5cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBkaXNwbGF5ID0gZGlzcGxheXNbIGkgXTtcclxuICAgICAgICBkaXNwbGF5LmZvY3VzTWFuYWdlci5sb2NrZWRQb2ludGVyRm9jdXNQcm9wZXJ0eS52YWx1ZSA9IG51bGw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggdGhpcy5fcG9pbnRlciAmJiB0aGlzLl9wb2ludGVyLmxpc3RlbmVycy5pbmNsdWRlcyggdGhpcy5fcG9pbnRlckxpc3RlbmVyICkgKSB7XHJcbiAgICAgICAgdGhpcy5fcG9pbnRlci5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9wb2ludGVyTGlzdGVuZXIgKTtcclxuICAgICAgICB0aGlzLl9wb2ludGVyID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSWYgdGhlIHBvaW50ZXIgbGlzdGVuZXIgaXMgY2FuY2VsbGVkIG9yIGludGVycnVwdGVkLCBjbGVhciBmb2N1cyBhbmQgcmVtb3ZlIGlucHV0IGxpc3RlbmVycy5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfb25Qb2ludGVyQ2FuY2VsKCBldmVudD86IFNjZW5lcnlFdmVudDxNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XHJcblxyXG4gICAgICBjb25zdCBkaXNwbGF5cyA9IE9iamVjdC52YWx1ZXMoIHRoaXMuZGlzcGxheXMgKTtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZGlzcGxheXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgZGlzcGxheSA9IGRpc3BsYXlzWyBpIF07XHJcbiAgICAgICAgZGlzcGxheS5mb2N1c01hbmFnZXIucG9pbnRlckZvY3VzUHJvcGVydHkuc2V0KCBudWxsICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHVubG9jayBhbmQgcmVtb3ZlIHBvaW50ZXIgbGlzdGVuZXJzXHJcbiAgICAgIHRoaXMuX29uUG9pbnRlclJlbGVhc2UoIGV2ZW50ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgb3IgcmVtb3ZlIGxpc3RlbmVycyByZWxhdGVkIHRvIGFjdGl2YXRpbmcgaW50ZXJhY3RpdmUgaGlnaGxpZ2h0aW5nIHdoZW4gdGhlIGZlYXR1cmUgYmVjb21lcyBlbmFibGVkLlxyXG4gICAgICogV29yayByZWxhdGVkIHRvIGludGVyYWN0aXZlIGhpZ2hsaWdodGluZyBpcyBhdm9pZGVkIHVubGVzcyB0aGUgZmVhdHVyZSBpcyBlbmFibGVkLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9vbkludGVyYWN0aXZlSGlnaGxpZ2h0aW5nRW5hYmxlZENoYW5nZSggZmVhdHVyZUVuYWJsZWQ6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICAgIC8vIE9ubHkgbGlzdGVuIHRvIHRoZSBhY3RpdmF0aW9uIGxpc3RlbmVyIGlmIHRoZSBmZWF0dXJlIGlzIGVuYWJsZWQgYW5kIGhpZ2hsaWdodGluZyBpcyBlbmFibGVkIGZvciB0aGlzIE5vZGUuXHJcbiAgICAgIGNvbnN0IGVuYWJsZWQgPSBmZWF0dXJlRW5hYmxlZCAmJiB0aGlzLl9pbnRlcmFjdGl2ZUhpZ2hsaWdodEVuYWJsZWQ7XHJcblxyXG4gICAgICBjb25zdCBoYXNBY3RpdmF0aW9uTGlzdGVuZXIgPSB0aGlzLmhhc0lucHV0TGlzdGVuZXIoIHRoaXMuX2FjdGl2YXRpb25MaXN0ZW5lciApO1xyXG4gICAgICBpZiAoIGVuYWJsZWQgJiYgIWhhc0FjdGl2YXRpb25MaXN0ZW5lciApIHtcclxuICAgICAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIHRoaXMuX2FjdGl2YXRpb25MaXN0ZW5lciApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCAhZW5hYmxlZCAmJiBoYXNBY3RpdmF0aW9uTGlzdGVuZXIgKSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9hY3RpdmF0aW9uTGlzdGVuZXIgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkIHRoZSBEaXNwbGF5IHRvIHRoZSBjb2xsZWN0aW9uIHdoZW4gdGhpcyBOb2RlIGlzIGFkZGVkIHRvIGEgc2NlbmUgZ3JhcGguIEFsc28gYWRkcyBsaXN0ZW5lcnMgdG8gdGhlXHJcbiAgICAgKiBEaXNwbGF5IHRoYXQgdHVybnMgb24gaGlnaGxpZ2h0aW5nIHdoZW4gdGhlIGZlYXR1cmUgaXMgZW5hYmxlZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIG9uQ2hhbmdlZEluc3RhbmNlKCBpbnN0YW5jZTogSW5zdGFuY2UsIGFkZGVkOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbnN0YW5jZS50cmFpbCwgJ3Nob3VsZCBoYXZlIGEgdHJhaWwnICk7XHJcblxyXG4gICAgICBpZiAoIGFkZGVkICkge1xyXG4gICAgICAgIHRoaXMuZGlzcGxheXNbIGluc3RhbmNlLnRyYWlsIS51bmlxdWVJZCBdID0gaW5zdGFuY2UuZGlzcGxheTtcclxuXHJcbiAgICAgICAgLy8gTGlzdGVuZXIgbWF5IGFscmVhZHkgYnkgb24gdGhlIGRpc3BsYXkgaW4gY2FzZXMgb2YgREFHLCBvbmx5IGFkZCBpZiB0aGlzIGlzIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiB0aGlzIE5vZGVcclxuICAgICAgICBpZiAoICFpbnN0YW5jZS5kaXNwbGF5LmZvY3VzTWFuYWdlci5wb2ludGVySGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eS5oYXNMaXN0ZW5lciggdGhpcy5faW50ZXJhY3RpdmVIaWdobGlnaHRpbmdFbmFibGVkTGlzdGVuZXIgKSApIHtcclxuICAgICAgICAgIGluc3RhbmNlLmRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBvaW50ZXJIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LmxpbmsoIHRoaXMuX2ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nRW5hYmxlZExpc3RlbmVyICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGluc3RhbmNlLm5vZGUsICdzaG91bGQgaGF2ZSBhIG5vZGUnICk7XHJcbiAgICAgICAgY29uc3QgZGlzcGxheSA9IHRoaXMuZGlzcGxheXNbIGluc3RhbmNlLnRyYWlsIS51bmlxdWVJZCBdO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgbm9kZSB3YXMgZGlzcG9zZWQsIHRoaXMgZGlzcGxheSByZWZlcmVuY2UgaGFzIGFscmVhZHkgYmVlbiBjbGVhbmVkIHVwLCBidXQgaW5zdGFuY2VzIGFyZSB1cGRhdGVkXHJcbiAgICAgICAgLy8gKGRpc3Bvc2VkKSBvbiB0aGUgbmV4dCBmcmFtZSBhZnRlciB0aGUgbm9kZSB3YXMgZGlzcG9zZWQuIE9ubHkgdW5saW5rIGlmIHRoZXJlIGFyZSBubyBtb3JlIGluc3RhbmNlcyBvZlxyXG4gICAgICAgIC8vIHRoaXMgbm9kZTtcclxuICAgICAgICBpZiAoIGRpc3BsYXkgJiYgaW5zdGFuY2Uubm9kZSEuaW5zdGFuY2VzLmxlbmd0aCA9PT0gMCApIHtcclxuXHJcbiAgICAgICAgICBkaXNwbGF5LmZvY3VzTWFuYWdlci5wb2ludGVySGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eS51bmxpbmsoIHRoaXMuX2ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nRW5hYmxlZExpc3RlbmVyICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkZWxldGUgdGhpcy5kaXNwbGF5c1sgaW5zdGFuY2UudHJhaWwhLnVuaXF1ZUlkIF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiBhbnkgbm9kZXMgZnJvbSB0aGlzIE5vZGUgdG8gdGhlIGxlYWYgb2YgdGhlIFRyYWlsIHVzZSBWb2ljaW5nIGZlYXR1cmVzIGluIHNvbWUgd2F5LiBJblxyXG4gICAgICogZ2VuZXJhbCwgd2UgZG8gbm90IHdhbnQgdG8gYWN0aXZhdGUgdm9pY2luZyBmZWF0dXJlcyBpbiB0aGlzIGNhc2UgYmVjYXVzZSB0aGUgbGVhZi1tb3N0IE5vZGVzIGluIHRoZSBUcmFpbFxyXG4gICAgICogc2hvdWxkIGJlIGFjdGl2YXRlZCBpbnN0ZWFkLlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGVzY2VuZGFudHNVc2VIaWdobGlnaHRpbmcoIHRyYWlsOiBUcmFpbCApOiBib29sZWFuIHtcclxuICAgICAgY29uc3QgaW5kZXhPZlNlbGYgPSB0cmFpbC5ub2Rlcy5pbmRleE9mKCB0aGlzICk7XHJcblxyXG4gICAgICAvLyBhbGwgdGhlIHdheSB0byBsZW5ndGgsIGVuZCBub3QgaW5jbHVkZWQgaW4gc2xpY2UgLSBhbmQgaWYgc3RhcnQgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIGluZGV4IHJhbmdlXHJcbiAgICAgIC8vIGFuIGVtcHR5IGFycmF5IGlzIHJldHVybmVkXHJcbiAgICAgIGNvbnN0IGNoaWxkVG9MZWFmTm9kZXMgPSB0cmFpbC5ub2Rlcy5zbGljZSggaW5kZXhPZlNlbGYgKyAxLCB0cmFpbC5ub2Rlcy5sZW5ndGggKTtcclxuXHJcbiAgICAgIC8vIGlmIGFueSBvZiB0aGUgbm9kZXMgZnJvbSBsZWFmIHRvIHNlbGYgdXNlIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nLCB0aGV5IHNob3VsZCByZWNlaXZlIGlucHV0LCBhbmQgd2Ugc2hvdWxkbid0XHJcbiAgICAgIC8vIHNwZWFrIHRoZSBjb250ZW50IGZvciB0aGlzIE5vZGVcclxuICAgICAgbGV0IGRlc2NlbmRhbnRzVXNlVm9pY2luZyA9IGZhbHNlO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjaGlsZFRvTGVhZk5vZGVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGlmICggKCBjaGlsZFRvTGVhZk5vZGVzWyBpIF0gYXMgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmdOb2RlICkuaXNJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyApIHtcclxuICAgICAgICAgIGRlc2NlbmRhbnRzVXNlVm9pY2luZyA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBkZXNjZW5kYW50c1VzZVZvaWNpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG92ZXJyaWRlIG11dGF0ZSggb3B0aW9ucz86IFNlbGZPcHRpb25zICYgUGFyYW1ldGVyczxJbnN0YW5jZVR5cGU8U3VwZXJUeXBlPlsgJ211dGF0ZScgXT5bIDAgXSApOiB0aGlzIHtcclxuICAgICAgcmV0dXJuIHN1cGVyLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gICAgfVxyXG4gIH0gKTtcclxuXHJcbiAgLyoqXHJcbiAgICoge0FycmF5LjxzdHJpbmc+fSAtIFN0cmluZyBrZXlzIGZvciBhbGwgdGhlIGFsbG93ZWQgb3B0aW9ucyB0aGF0IHdpbGwgYmUgc2V0IGJ5IE5vZGUubXV0YXRlKCBvcHRpb25zICksIGluXHJcbiAgICogdGhlIG9yZGVyIHRoZXkgd2lsbCBiZSBldmFsdWF0ZWQuXHJcbiAgICpcclxuICAgKiBOT1RFOiBTZWUgTm9kZSdzIF9tdXRhdG9yS2V5cyBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGhvdyB0aGlzIG9wZXJhdGVzLCBhbmQgcG90ZW50aWFsIHNwZWNpYWxcclxuICAgKiAgICAgICBjYXNlcyB0aGF0IG1heSBhcHBseS5cclxuICAgKi9cclxuICBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ0NsYXNzLnByb3RvdHlwZS5fbXV0YXRvcktleXMgPSBJTlRFUkFDVElWRV9ISUdITElHSFRJTkdfT1BUSU9OUy5jb25jYXQoIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nQ2xhc3MucHJvdG90eXBlLl9tdXRhdG9yS2V5cyApO1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nQ2xhc3MucHJvdG90eXBlLl9tdXRhdG9yS2V5cy5sZW5ndGggPT09XHJcbiAgICAgICAgICAgICAgICAgICAgXy51bmlxKCBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ0NsYXNzLnByb3RvdHlwZS5fbXV0YXRvcktleXMgKS5sZW5ndGgsXHJcbiAgICAnZHVwbGljYXRlIG11dGF0b3Iga2V5cyBpbiBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZycgKTtcclxuXHJcbiAgcmV0dXJuIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nQ2xhc3M7XHJcbn0gKTtcclxuXHJcbi8vIFByb3ZpZGVzIGEgd2F5IHRvIGRldGVybWluZSBpZiBhIE5vZGUgaXMgY29tcG9zZWQgd2l0aCBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyBieSB0eXBlXHJcbmNvbnN0IHdyYXBwZXIgPSAoKSA9PiBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyggTm9kZSApO1xyXG5leHBvcnQgdHlwZSBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ05vZGUgPSBJbnN0YW5jZVR5cGU8UmV0dXJuVHlwZTx0eXBlb2Ygd3JhcHBlcj4+O1xyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ0ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nJywgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcgKTtcclxuZXhwb3J0IGRlZmF1bHQgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmc7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxXQUFXLE1BQU0sb0NBQW9DO0FBRzVELFNBQVNDLGFBQWEsRUFBV0MsS0FBSyxFQUFZQyxJQUFJLEVBQVdDLE9BQU8sUUFBNkMsa0JBQWtCO0FBR3ZJLE9BQU9DLE9BQU8sTUFBTSxxQ0FBcUM7O0FBRXpEO0FBQ0E7QUFDQSxNQUFNQyxnQ0FBZ0MsR0FBRyxDQUN2QyxzQkFBc0IsRUFDdEIsK0JBQStCLEVBQy9CLDZCQUE2QixDQUM5QjtBQVVELE1BQU1DLHVCQUF1QixHQUFHRixPQUFPLENBQXlDRyxJQUFlLElBQU07RUFFbkc7RUFDQUMsTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQ0QsSUFBSSxDQUFDRSw2QkFBNkIsRUFBRSx1REFBd0QsQ0FBQztFQUVoSCxNQUFNQyw0QkFBNEIsR0FBR1YsYUFBYSxDQUFFLDhCQUE4QixFQUFFSyxnQ0FBZ0MsRUFBRSxNQUFNSyw0QkFBNEIsU0FBU0gsSUFBSSxDQUFDO0lBRXBLO0lBQ0E7SUFDQTs7SUFHQTtJQUNBO0lBQ0E7SUFHQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBR0E7SUFDQTtJQUdBO0lBQ0E7SUFDQTtJQUNBO0lBR0E7SUFDQTtJQUdBO0lBR0E7SUFHQTtJQUNBO0lBQ0E7SUFHQTtJQUNBO0lBR09JLFdBQVdBLENBQUUsR0FBR0MsSUFBc0IsRUFBRztNQUM5QyxLQUFLLENBQUUsR0FBR0EsSUFBSyxDQUFDO01BRWhCLElBQUksQ0FBQ0MsbUJBQW1CLEdBQUc7UUFDekJDLEtBQUssRUFBRSxJQUFJLENBQUNDLGlCQUFpQixDQUFDQyxJQUFJLENBQUUsSUFBSyxDQUFDO1FBQzFD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