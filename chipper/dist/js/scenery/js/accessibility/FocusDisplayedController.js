// Copyright 2021-2023, University of Colorado Boulder

/**
 * Responsible for setting the provided focusProperty to null when the Focused node either
 * becomes invisible on the Display or is removed from the scene graph. It uses a
 * TrailVisibilityTracker to determine if any Node in the Trail has become invisible.
 *
 * Meant to be scenery-internal and used by FocusManager.
 *
 * @author Jesse Greenberg
 */

import optionize from '../../../phet-core/js/optionize.js';
import { scenery, TrailVisibilityTracker } from '../imports.js';
class FocusDisplayedController {
  // last Node of the Trail that is focused, referenced so we can add and remove listeners from it
  node = null;

  // Observes the Trail to the Node and notifies when it has become invisible
  visibilityTracker = null;

  // When there is value, we will watch and update when there are changes to the displayed state of the Focus trail.

  // Bound functions that are called when the displayed state of the Node changes.

  // Handles changes to focus, adding or removing listeners

  constructor(focusProperty, providedOptions) {
    const options = optionize()({
      onRemoveFocus: _.noop
    }, providedOptions);
    assert && assert(typeof options.onRemoveFocus === 'function', 'invalid type for onRemoveFocus');
    this.focusProperty = focusProperty;
    this.onRemoveFocus = options.onRemoveFocus;
    this.boundVisibilityListener = this.handleTrailVisibilityChange.bind(this);
    this.boundInstancesChangedListener = this.handleInstancesChange.bind(this);
    this.boundFocusListener = this.handleFocusChange.bind(this);
    this.focusProperty.link(this.boundFocusListener);
  }

  /**
   * When Focus changes, remove any listeners that were attached from last Focus and
   * add new listeners if focus has a new value.
   */
  handleFocusChange(focus) {
    this.removeDisplayedListeners();
    if (focus) {
      this.addDisplayedListeners(focus);
    }
  }

  /**
   * When the Trail becomes invisible, Focus should be set to null.
   */
  handleTrailVisibilityChange() {
    if (this.visibilityTracker && !this.visibilityTracker.trailVisibleProperty.value) {
      this.focusProperty.value = null;
      this.onRemoveFocus();
    }
  }

  /**
   * If there are no more Instances for the Node with focus it has been removed from
   * the scene graph and so Focus should be set to null.
   */
  handleInstancesChange(instance) {
    if (instance.node && instance.node.instances.length === 0) {
      this.focusProperty.value = null;
      this.onRemoveFocus();
    }
  }

  /**
   * Add listeners that watch when the Displayed state of the Node with Focus has changed,
   * including visibility of the trail and attachment to a scene graph.
   */
  addDisplayedListeners(focus) {
    assert && assert(this.visibilityTracker === null, 'creating a new TrailVisibilityTracker but the last one was not disposed');
    assert && assert(this.node === null, 'Still a reference to the previously focused Node, possible memory leak');
    this.visibilityTracker = new TrailVisibilityTracker(focus.trail);
    this.visibilityTracker.addListener(this.boundVisibilityListener);
    this.node = focus.trail.lastNode();
    this.node.changedInstanceEmitter.addListener(this.boundInstancesChangedListener);
  }

  /**
   * Remove any listeners that were added to observables that fire when the Node's displayed
   * state may have changed.
   */
  removeDisplayedListeners() {
    if (this.visibilityTracker) {
      this.visibilityTracker.removeListener(this.boundVisibilityListener);
      this.visibilityTracker.dispose();
      this.visibilityTracker = null;
    }
    if (this.node) {
      this.node.changedInstanceEmitter.removeListener(this.boundInstancesChangedListener);
      this.node = null;
    }
  }
  dispose() {
    // this disposes the TrailVisibilityTracker and removes any listeners on the Node
    this.removeDisplayedListeners();
    this.focusProperty.unlink(this.boundFocusListener);
    this.node = null;
    this.visibilityTracker = null;
    this.focusProperty = null;
  }
}
scenery.register('FocusDisplayedController', FocusDisplayedController);
export default FocusDisplayedController;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJzY2VuZXJ5IiwiVHJhaWxWaXNpYmlsaXR5VHJhY2tlciIsIkZvY3VzRGlzcGxheWVkQ29udHJvbGxlciIsIm5vZGUiLCJ2aXNpYmlsaXR5VHJhY2tlciIsImNvbnN0cnVjdG9yIiwiZm9jdXNQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJvblJlbW92ZUZvY3VzIiwiXyIsIm5vb3AiLCJhc3NlcnQiLCJib3VuZFZpc2liaWxpdHlMaXN0ZW5lciIsImhhbmRsZVRyYWlsVmlzaWJpbGl0eUNoYW5nZSIsImJpbmQiLCJib3VuZEluc3RhbmNlc0NoYW5nZWRMaXN0ZW5lciIsImhhbmRsZUluc3RhbmNlc0NoYW5nZSIsImJvdW5kRm9jdXNMaXN0ZW5lciIsImhhbmRsZUZvY3VzQ2hhbmdlIiwibGluayIsImZvY3VzIiwicmVtb3ZlRGlzcGxheWVkTGlzdGVuZXJzIiwiYWRkRGlzcGxheWVkTGlzdGVuZXJzIiwidHJhaWxWaXNpYmxlUHJvcGVydHkiLCJ2YWx1ZSIsImluc3RhbmNlIiwiaW5zdGFuY2VzIiwibGVuZ3RoIiwidHJhaWwiLCJhZGRMaXN0ZW5lciIsImxhc3ROb2RlIiwiY2hhbmdlZEluc3RhbmNlRW1pdHRlciIsInJlbW92ZUxpc3RlbmVyIiwiZGlzcG9zZSIsInVubGluayIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRm9jdXNEaXNwbGF5ZWRDb250cm9sbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlc3BvbnNpYmxlIGZvciBzZXR0aW5nIHRoZSBwcm92aWRlZCBmb2N1c1Byb3BlcnR5IHRvIG51bGwgd2hlbiB0aGUgRm9jdXNlZCBub2RlIGVpdGhlclxyXG4gKiBiZWNvbWVzIGludmlzaWJsZSBvbiB0aGUgRGlzcGxheSBvciBpcyByZW1vdmVkIGZyb20gdGhlIHNjZW5lIGdyYXBoLiBJdCB1c2VzIGFcclxuICogVHJhaWxWaXNpYmlsaXR5VHJhY2tlciB0byBkZXRlcm1pbmUgaWYgYW55IE5vZGUgaW4gdGhlIFRyYWlsIGhhcyBiZWNvbWUgaW52aXNpYmxlLlxyXG4gKlxyXG4gKiBNZWFudCB0byBiZSBzY2VuZXJ5LWludGVybmFsIGFuZCB1c2VkIGJ5IEZvY3VzTWFuYWdlci5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcclxuICovXHJcblxyXG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHsgRm9jdXMsIEluc3RhbmNlLCBOb2RlLCBzY2VuZXJ5LCBUcmFpbFZpc2liaWxpdHlUcmFja2VyIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcblxyXG50eXBlIEZvY3VzRGlzcGxheWVkQ29udHJvbGxlck9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIEV4dHJhIHdvcmsgdG8gZG8gYWZ0ZXIgdGhlIGZvY3VzUHJvcGVydHkgaXMgc2V0IHRvIG51bGwgYmVjYXVzZSB0aGUgZm9jdXNlZCBOb2RlIGlzIG5vIGxvbmdlciBkaXNwbGF5ZWQgKGl0IGhhc1xyXG4gIC8vIGJlY29tZSBpbnZpc2libGUgb3IgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tIHRoZSBzY2VuZSBncmFwaCkuXHJcbiAgb25SZW1vdmVGb2N1cz86ICgpID0+IHZvaWQ7XHJcbn07XHJcblxyXG5jbGFzcyBGb2N1c0Rpc3BsYXllZENvbnRyb2xsZXIge1xyXG5cclxuICAvLyBsYXN0IE5vZGUgb2YgdGhlIFRyYWlsIHRoYXQgaXMgZm9jdXNlZCwgcmVmZXJlbmNlZCBzbyB3ZSBjYW4gYWRkIGFuZCByZW1vdmUgbGlzdGVuZXJzIGZyb20gaXRcclxuICBwcml2YXRlIG5vZGU6IE5vZGUgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgLy8gT2JzZXJ2ZXMgdGhlIFRyYWlsIHRvIHRoZSBOb2RlIGFuZCBub3RpZmllcyB3aGVuIGl0IGhhcyBiZWNvbWUgaW52aXNpYmxlXHJcbiAgcHJpdmF0ZSB2aXNpYmlsaXR5VHJhY2tlcjogVHJhaWxWaXNpYmlsaXR5VHJhY2tlciB8IG51bGwgPSBudWxsO1xyXG5cclxuICAvLyBXaGVuIHRoZXJlIGlzIHZhbHVlLCB3ZSB3aWxsIHdhdGNoIGFuZCB1cGRhdGUgd2hlbiB0aGVyZSBhcmUgY2hhbmdlcyB0byB0aGUgZGlzcGxheWVkIHN0YXRlIG9mIHRoZSBGb2N1cyB0cmFpbC5cclxuICBwcml2YXRlIGZvY3VzUHJvcGVydHk6IFRQcm9wZXJ0eTxGb2N1cyB8IG51bGw+IHwgbnVsbDtcclxuICBwcml2YXRlIHJlYWRvbmx5IG9uUmVtb3ZlRm9jdXM6ICgpID0+IHZvaWQ7XHJcblxyXG4gIC8vIEJvdW5kIGZ1bmN0aW9ucyB0aGF0IGFyZSBjYWxsZWQgd2hlbiB0aGUgZGlzcGxheWVkIHN0YXRlIG9mIHRoZSBOb2RlIGNoYW5nZXMuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBib3VuZFZpc2liaWxpdHlMaXN0ZW5lcjogKCkgPT4gdm9pZDtcclxuICBwcml2YXRlIHJlYWRvbmx5IGJvdW5kSW5zdGFuY2VzQ2hhbmdlZExpc3RlbmVyOiAoIGluc3RhbmNlOiBJbnN0YW5jZSApID0+IHZvaWQ7XHJcblxyXG4gIC8vIEhhbmRsZXMgY2hhbmdlcyB0byBmb2N1cywgYWRkaW5nIG9yIHJlbW92aW5nIGxpc3RlbmVyc1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgYm91bmRGb2N1c0xpc3RlbmVyOiAoIGZvY3VzOiBGb2N1cyB8IG51bGwgKSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGZvY3VzUHJvcGVydHk6IFRQcm9wZXJ0eTxGb2N1cyB8IG51bGw+LCBwcm92aWRlZE9wdGlvbnM/OiBGb2N1c0Rpc3BsYXllZENvbnRyb2xsZXJPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Rm9jdXNEaXNwbGF5ZWRDb250cm9sbGVyT3B0aW9ucz4oKSgge1xyXG4gICAgICBvblJlbW92ZUZvY3VzOiBfLm5vb3BcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIG9wdGlvbnMub25SZW1vdmVGb2N1cyA9PT0gJ2Z1bmN0aW9uJywgJ2ludmFsaWQgdHlwZSBmb3Igb25SZW1vdmVGb2N1cycgKTtcclxuXHJcbiAgICB0aGlzLmZvY3VzUHJvcGVydHkgPSBmb2N1c1Byb3BlcnR5O1xyXG4gICAgdGhpcy5vblJlbW92ZUZvY3VzID0gb3B0aW9ucy5vblJlbW92ZUZvY3VzO1xyXG5cclxuICAgIHRoaXMuYm91bmRWaXNpYmlsaXR5TGlzdGVuZXIgPSB0aGlzLmhhbmRsZVRyYWlsVmlzaWJpbGl0eUNoYW5nZS5iaW5kKCB0aGlzICk7XHJcbiAgICB0aGlzLmJvdW5kSW5zdGFuY2VzQ2hhbmdlZExpc3RlbmVyID0gdGhpcy5oYW5kbGVJbnN0YW5jZXNDaGFuZ2UuYmluZCggdGhpcyApO1xyXG5cclxuICAgIHRoaXMuYm91bmRGb2N1c0xpc3RlbmVyID0gdGhpcy5oYW5kbGVGb2N1c0NoYW5nZS5iaW5kKCB0aGlzICk7XHJcbiAgICB0aGlzLmZvY3VzUHJvcGVydHkubGluayggdGhpcy5ib3VuZEZvY3VzTGlzdGVuZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZW4gRm9jdXMgY2hhbmdlcywgcmVtb3ZlIGFueSBsaXN0ZW5lcnMgdGhhdCB3ZXJlIGF0dGFjaGVkIGZyb20gbGFzdCBGb2N1cyBhbmRcclxuICAgKiBhZGQgbmV3IGxpc3RlbmVycyBpZiBmb2N1cyBoYXMgYSBuZXcgdmFsdWUuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBoYW5kbGVGb2N1c0NoYW5nZSggZm9jdXM6IEZvY3VzIHwgbnVsbCApOiB2b2lkIHtcclxuICAgIHRoaXMucmVtb3ZlRGlzcGxheWVkTGlzdGVuZXJzKCk7XHJcblxyXG4gICAgaWYgKCBmb2N1cyApIHtcclxuICAgICAgdGhpcy5hZGREaXNwbGF5ZWRMaXN0ZW5lcnMoIGZvY3VzICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGVuIHRoZSBUcmFpbCBiZWNvbWVzIGludmlzaWJsZSwgRm9jdXMgc2hvdWxkIGJlIHNldCB0byBudWxsLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgaGFuZGxlVHJhaWxWaXNpYmlsaXR5Q2hhbmdlKCk6IHZvaWQge1xyXG4gICAgaWYgKCB0aGlzLnZpc2liaWxpdHlUcmFja2VyICYmICF0aGlzLnZpc2liaWxpdHlUcmFja2VyLnRyYWlsVmlzaWJsZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICB0aGlzLmZvY3VzUHJvcGVydHkhLnZhbHVlID0gbnVsbDtcclxuICAgICAgdGhpcy5vblJlbW92ZUZvY3VzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJZiB0aGVyZSBhcmUgbm8gbW9yZSBJbnN0YW5jZXMgZm9yIHRoZSBOb2RlIHdpdGggZm9jdXMgaXQgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tXHJcbiAgICogdGhlIHNjZW5lIGdyYXBoIGFuZCBzbyBGb2N1cyBzaG91bGQgYmUgc2V0IHRvIG51bGwuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBoYW5kbGVJbnN0YW5jZXNDaGFuZ2UoIGluc3RhbmNlOiBJbnN0YW5jZSApOiB2b2lkIHtcclxuICAgIGlmICggaW5zdGFuY2Uubm9kZSAmJiBpbnN0YW5jZS5ub2RlLmluc3RhbmNlcy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgIHRoaXMuZm9jdXNQcm9wZXJ0eSEudmFsdWUgPSBudWxsO1xyXG4gICAgICB0aGlzLm9uUmVtb3ZlRm9jdXMoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBsaXN0ZW5lcnMgdGhhdCB3YXRjaCB3aGVuIHRoZSBEaXNwbGF5ZWQgc3RhdGUgb2YgdGhlIE5vZGUgd2l0aCBGb2N1cyBoYXMgY2hhbmdlZCxcclxuICAgKiBpbmNsdWRpbmcgdmlzaWJpbGl0eSBvZiB0aGUgdHJhaWwgYW5kIGF0dGFjaG1lbnQgdG8gYSBzY2VuZSBncmFwaC5cclxuICAgKi9cclxuICBwcml2YXRlIGFkZERpc3BsYXllZExpc3RlbmVycyggZm9jdXM6IEZvY3VzICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy52aXNpYmlsaXR5VHJhY2tlciA9PT0gbnVsbCwgJ2NyZWF0aW5nIGEgbmV3IFRyYWlsVmlzaWJpbGl0eVRyYWNrZXIgYnV0IHRoZSBsYXN0IG9uZSB3YXMgbm90IGRpc3Bvc2VkJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5ub2RlID09PSBudWxsLCAnU3RpbGwgYSByZWZlcmVuY2UgdG8gdGhlIHByZXZpb3VzbHkgZm9jdXNlZCBOb2RlLCBwb3NzaWJsZSBtZW1vcnkgbGVhaycgKTtcclxuXHJcbiAgICB0aGlzLnZpc2liaWxpdHlUcmFja2VyID0gbmV3IFRyYWlsVmlzaWJpbGl0eVRyYWNrZXIoIGZvY3VzLnRyYWlsICk7XHJcbiAgICB0aGlzLnZpc2liaWxpdHlUcmFja2VyLmFkZExpc3RlbmVyKCB0aGlzLmJvdW5kVmlzaWJpbGl0eUxpc3RlbmVyICk7XHJcblxyXG4gICAgdGhpcy5ub2RlID0gZm9jdXMudHJhaWwubGFzdE5vZGUoKTtcclxuICAgIHRoaXMubm9kZS5jaGFuZ2VkSW5zdGFuY2VFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLmJvdW5kSW5zdGFuY2VzQ2hhbmdlZExpc3RlbmVyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYW55IGxpc3RlbmVycyB0aGF0IHdlcmUgYWRkZWQgdG8gb2JzZXJ2YWJsZXMgdGhhdCBmaXJlIHdoZW4gdGhlIE5vZGUncyBkaXNwbGF5ZWRcclxuICAgKiBzdGF0ZSBtYXkgaGF2ZSBjaGFuZ2VkLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgcmVtb3ZlRGlzcGxheWVkTGlzdGVuZXJzKCk6IHZvaWQge1xyXG4gICAgaWYgKCB0aGlzLnZpc2liaWxpdHlUcmFja2VyICkge1xyXG4gICAgICB0aGlzLnZpc2liaWxpdHlUcmFja2VyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLmJvdW5kVmlzaWJpbGl0eUxpc3RlbmVyICk7XHJcbiAgICAgIHRoaXMudmlzaWJpbGl0eVRyYWNrZXIuZGlzcG9zZSgpO1xyXG4gICAgICB0aGlzLnZpc2liaWxpdHlUcmFja2VyID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmICggdGhpcy5ub2RlICkge1xyXG4gICAgICB0aGlzLm5vZGUuY2hhbmdlZEluc3RhbmNlRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5ib3VuZEluc3RhbmNlc0NoYW5nZWRMaXN0ZW5lciApO1xyXG4gICAgICB0aGlzLm5vZGUgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XHJcblxyXG4gICAgLy8gdGhpcyBkaXNwb3NlcyB0aGUgVHJhaWxWaXNpYmlsaXR5VHJhY2tlciBhbmQgcmVtb3ZlcyBhbnkgbGlzdGVuZXJzIG9uIHRoZSBOb2RlXHJcbiAgICB0aGlzLnJlbW92ZURpc3BsYXllZExpc3RlbmVycygpO1xyXG4gICAgdGhpcy5mb2N1c1Byb3BlcnR5IS51bmxpbmsoIHRoaXMuYm91bmRGb2N1c0xpc3RlbmVyICk7XHJcblxyXG4gICAgdGhpcy5ub2RlID0gbnVsbDtcclxuICAgIHRoaXMudmlzaWJpbGl0eVRyYWNrZXIgPSBudWxsO1xyXG4gICAgdGhpcy5mb2N1c1Byb3BlcnR5ID0gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdGb2N1c0Rpc3BsYXllZENvbnRyb2xsZXInLCBGb2N1c0Rpc3BsYXllZENvbnRyb2xsZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgRm9jdXNEaXNwbGF5ZWRDb250cm9sbGVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFD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