// Copyright 2016-2022, University of Colorado Boulder

/**
 * Hooks up listeners to a paint (fill or stroke) to determine when its represented value has changed.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import { Color, Gradient, scenery } from '../imports.js';
class PaintObserver {
  /**
   * An observer for a paint (fill or stroke), that will be able to trigger notifications when it changes.
   *
   * @param {function} changeCallback - To be called on any change (with no arguments)
   */
  constructor(changeCallback) {
    // @private {PaintDef} - Our unwrapped fill/stroke value
    this.primary = null;

    // @private {function} - Our callback
    this.changeCallback = changeCallback;

    // @private {function} - To be called when a potential change is detected
    this.notifyChangeCallback = this.notifyChanged.bind(this);

    // @private {function} - To be called whenever our secondary fill/stroke value may have changed
    this.updateSecondaryListener = this.updateSecondary.bind(this);

    // @private {Object} - Maps {number} property.id => {number} count (number of times we would be listening to it)
    this.secondaryPropertyCountsMap = {};
  }

  /**
   * Should be called when our paint (fill/stroke) may have changed.
   * @public (scenery-internal)
   *
   * Should update any listeners (if necessary), and call the callback (if necessary).
   *
   * NOTE: To clean state, set this to null.
   *
   * @param {PaintDef} primary
   */
  setPrimary(primary) {
    if (primary !== this.primary) {
      sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] primary update');
      sceneryLog && sceneryLog.Paints && sceneryLog.push();
      this.detachPrimary(this.primary);
      this.primary = primary;
      this.attachPrimary(primary);
      this.notifyChangeCallback();
      sceneryLog && sceneryLog.Paints && sceneryLog.pop();
    }
  }

  /**
   * Releases references without sending the notifications.
   * @public
   */
  clean() {
    sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] clean');
    sceneryLog && sceneryLog.Paints && sceneryLog.push();
    this.detachPrimary(this.primary);
    this.primary = null;
    sceneryLog && sceneryLog.Paints && sceneryLog.pop();
  }

  /**
   * Called when the value of a "primary" Property (contents of one, main or as a Gradient) is potentially changed.
   * @private
   *
   * @param {string|Color} newPaint
   * @param {string|Color} oldPaint
   * @param {Property} property
   */
  updateSecondary(newPaint, oldPaint, property) {
    sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] secondary update');
    sceneryLog && sceneryLog.Paints && sceneryLog.push();
    const count = this.secondaryPropertyCountsMap[property.id];
    assert && assert(count > 0, 'We should always be removing at least one reference');
    for (let i = 0; i < count; i++) {
      this.attachSecondary(newPaint);
    }
    this.notifyChangeCallback();
    sceneryLog && sceneryLog.Paints && sceneryLog.pop();
  }

  /**
   * Attempt to attach listeners to the paint's primary (the paint itself), or something else that acts like the primary
   * (properties on a gradient).
   * @private
   *
   * TODO: Note that this is called for gradient colors also
   *
   * NOTE: If it's a Property, we'll also need to handle the secondary (part inside the Property).
   *
   * @param {PaintDef} paint
   */
  attachPrimary(paint) {
    sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] attachPrimary');
    sceneryLog && sceneryLog.Paints && sceneryLog.push();
    if (paint instanceof ReadOnlyProperty) {
      sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] add Property listener');
      sceneryLog && sceneryLog.Paints && sceneryLog.push();
      this.secondaryLazyLinkProperty(paint);
      this.attachSecondary(paint.get());
      sceneryLog && sceneryLog.Paints && sceneryLog.pop();
    } else if (paint instanceof Color) {
      sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] Color changed to immutable');

      // We set the color to be immutable, so we don't need to add a listener
      paint.setImmutable();
    } else if (paint instanceof Gradient) {
      sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] add Gradient listeners');
      sceneryLog && sceneryLog.Paints && sceneryLog.push();
      for (let i = 0; i < paint.stops.length; i++) {
        this.attachPrimary(paint.stops[i].color);
      }
      sceneryLog && sceneryLog.Paints && sceneryLog.pop();
    }
    sceneryLog && sceneryLog.Paints && sceneryLog.pop();
  }

  /**
   * Attempt to detach listeners from the paint's primary (the paint itself).
   * @private
   *
   * TODO: Note that this is called for gradient colors also
   *
   * NOTE: If it's a Property or Gradient, we'll also need to handle the secondaries (part(s) inside the Property(ies)).
   *
   * @param {PaintDef} paint
   */
  detachPrimary(paint) {
    sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] detachPrimary');
    sceneryLog && sceneryLog.Paints && sceneryLog.push();
    if (paint instanceof ReadOnlyProperty) {
      sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] remove Property listener');
      sceneryLog && sceneryLog.Paints && sceneryLog.push();
      this.secondaryUnlinkProperty(paint);
      sceneryLog && sceneryLog.Paints && sceneryLog.pop();
    } else if (paint instanceof Gradient) {
      sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] remove Gradient listeners');
      sceneryLog && sceneryLog.Paints && sceneryLog.push();
      for (let i = 0; i < paint.stops.length; i++) {
        this.detachPrimary(paint.stops[i].color);
      }
      sceneryLog && sceneryLog.Paints && sceneryLog.pop();
    }
    sceneryLog && sceneryLog.Paints && sceneryLog.pop();
  }

  /**
   * Attempt to attach listeners to the paint's secondary (part within the Property).
   * @private
   *
   * @param {string|Color} paint
   */
  attachSecondary(paint) {
    sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] attachSecondary');
    sceneryLog && sceneryLog.Paints && sceneryLog.push();
    if (paint instanceof Color) {
      sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] Color set to immutable');

      // We set the color to be immutable, so we don't need to add a listener
      paint.setImmutable();
    }
    sceneryLog && sceneryLog.Paints && sceneryLog.pop();
  }

  /**
   * Calls the change callback, and invalidates the paint itself if it's a gradient.
   * @private
   */
  notifyChanged() {
    sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] changed');
    sceneryLog && sceneryLog.Paints && sceneryLog.push();
    if (this.primary instanceof Gradient) {
      this.primary.invalidateCanvasGradient();
    }
    this.changeCallback();
    sceneryLog && sceneryLog.Paints && sceneryLog.pop();
  }

  /**
   * Adds our secondary listener to the Property (unless there is already one, in which case we record the counts).
   * @private
   *
   * @param {Property.<*>} property
   */
  secondaryLazyLinkProperty(property) {
    sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[PaintObserver] secondaryLazyLinkProperty ${property._id}`);
    sceneryLog && sceneryLog.Paints && sceneryLog.push();
    const id = property.id;
    const count = this.secondaryPropertyCountsMap[id];
    if (count) {
      this.secondaryPropertyCountsMap[id]++;
    } else {
      this.secondaryPropertyCountsMap[id] = 1;
      property.lazyLink(this.updateSecondaryListener);
    }
    sceneryLog && sceneryLog.Paints && sceneryLog.pop();
  }

  /**
   * Removes our secondary listener from the Property (unless there were more than 1 time we needed to listen to it,
   * in which case we reduce the count).
   * @private
   *
   * @param {Property.<*>} property
   */
  secondaryUnlinkProperty(property) {
    sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[PaintObserver] secondaryUnlinkProperty ${property._id}`);
    sceneryLog && sceneryLog.Paints && sceneryLog.push();
    const id = property.id;
    const count = --this.secondaryPropertyCountsMap[id];
    assert && assert(count >= 0, 'We should have had a reference before');
    if (count === 0) {
      delete this.secondaryPropertyCountsMap[id];
      if (!property.isDisposed) {
        property.unlink(this.updateSecondaryListener);
      }
    }
    sceneryLog && sceneryLog.Paints && sceneryLog.pop();
  }
}
scenery.register('PaintObserver', PaintObserver);
export default PaintObserver;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFkT25seVByb3BlcnR5IiwiQ29sb3IiLCJHcmFkaWVudCIsInNjZW5lcnkiLCJQYWludE9ic2VydmVyIiwiY29uc3RydWN0b3IiLCJjaGFuZ2VDYWxsYmFjayIsInByaW1hcnkiLCJub3RpZnlDaGFuZ2VDYWxsYmFjayIsIm5vdGlmeUNoYW5nZWQiLCJiaW5kIiwidXBkYXRlU2Vjb25kYXJ5TGlzdGVuZXIiLCJ1cGRhdGVTZWNvbmRhcnkiLCJzZWNvbmRhcnlQcm9wZXJ0eUNvdW50c01hcCIsInNldFByaW1hcnkiLCJzY2VuZXJ5TG9nIiwiUGFpbnRzIiwicHVzaCIsImRldGFjaFByaW1hcnkiLCJhdHRhY2hQcmltYXJ5IiwicG9wIiwiY2xlYW4iLCJuZXdQYWludCIsIm9sZFBhaW50IiwicHJvcGVydHkiLCJjb3VudCIsImlkIiwiYXNzZXJ0IiwiaSIsImF0dGFjaFNlY29uZGFyeSIsInBhaW50Iiwic2Vjb25kYXJ5TGF6eUxpbmtQcm9wZXJ0eSIsImdldCIsInNldEltbXV0YWJsZSIsInN0b3BzIiwibGVuZ3RoIiwiY29sb3IiLCJzZWNvbmRhcnlVbmxpbmtQcm9wZXJ0eSIsImludmFsaWRhdGVDYW52YXNHcmFkaWVudCIsIl9pZCIsImxhenlMaW5rIiwiaXNEaXNwb3NlZCIsInVubGluayIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGFpbnRPYnNlcnZlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBIb29rcyB1cCBsaXN0ZW5lcnMgdG8gYSBwYWludCAoZmlsbCBvciBzdHJva2UpIHRvIGRldGVybWluZSB3aGVuIGl0cyByZXByZXNlbnRlZCB2YWx1ZSBoYXMgY2hhbmdlZC5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBHcmFkaWVudCwgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5cclxuY2xhc3MgUGFpbnRPYnNlcnZlciB7XHJcbiAgLyoqXHJcbiAgICogQW4gb2JzZXJ2ZXIgZm9yIGEgcGFpbnQgKGZpbGwgb3Igc3Ryb2tlKSwgdGhhdCB3aWxsIGJlIGFibGUgdG8gdHJpZ2dlciBub3RpZmljYXRpb25zIHdoZW4gaXQgY2hhbmdlcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNoYW5nZUNhbGxiYWNrIC0gVG8gYmUgY2FsbGVkIG9uIGFueSBjaGFuZ2UgKHdpdGggbm8gYXJndW1lbnRzKVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjaGFuZ2VDYWxsYmFjayApIHtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7UGFpbnREZWZ9IC0gT3VyIHVud3JhcHBlZCBmaWxsL3N0cm9rZSB2YWx1ZVxyXG4gICAgdGhpcy5wcmltYXJ5ID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259IC0gT3VyIGNhbGxiYWNrXHJcbiAgICB0aGlzLmNoYW5nZUNhbGxiYWNrID0gY2hhbmdlQ2FsbGJhY2s7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Z1bmN0aW9ufSAtIFRvIGJlIGNhbGxlZCB3aGVuIGEgcG90ZW50aWFsIGNoYW5nZSBpcyBkZXRlY3RlZFxyXG4gICAgdGhpcy5ub3RpZnlDaGFuZ2VDYWxsYmFjayA9IHRoaXMubm90aWZ5Q2hhbmdlZC5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Z1bmN0aW9ufSAtIFRvIGJlIGNhbGxlZCB3aGVuZXZlciBvdXIgc2Vjb25kYXJ5IGZpbGwvc3Ryb2tlIHZhbHVlIG1heSBoYXZlIGNoYW5nZWRcclxuICAgIHRoaXMudXBkYXRlU2Vjb25kYXJ5TGlzdGVuZXIgPSB0aGlzLnVwZGF0ZVNlY29uZGFyeS5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge09iamVjdH0gLSBNYXBzIHtudW1iZXJ9IHByb3BlcnR5LmlkID0+IHtudW1iZXJ9IGNvdW50IChudW1iZXIgb2YgdGltZXMgd2Ugd291bGQgYmUgbGlzdGVuaW5nIHRvIGl0KVxyXG4gICAgdGhpcy5zZWNvbmRhcnlQcm9wZXJ0eUNvdW50c01hcCA9IHt9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2hvdWxkIGJlIGNhbGxlZCB3aGVuIG91ciBwYWludCAoZmlsbC9zdHJva2UpIG1heSBoYXZlIGNoYW5nZWQuXHJcbiAgICogQHB1YmxpYyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKlxyXG4gICAqIFNob3VsZCB1cGRhdGUgYW55IGxpc3RlbmVycyAoaWYgbmVjZXNzYXJ5KSwgYW5kIGNhbGwgdGhlIGNhbGxiYWNrIChpZiBuZWNlc3NhcnkpLlxyXG4gICAqXHJcbiAgICogTk9URTogVG8gY2xlYW4gc3RhdGUsIHNldCB0aGlzIHRvIG51bGwuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BhaW50RGVmfSBwcmltYXJ5XHJcbiAgICovXHJcbiAgc2V0UHJpbWFyeSggcHJpbWFyeSApIHtcclxuICAgIGlmICggcHJpbWFyeSAhPT0gdGhpcy5wcmltYXJ5ICkge1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cuUGFpbnRzKCAnW1BhaW50T2JzZXJ2ZXJdIHByaW1hcnkgdXBkYXRlJyApO1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgICAgdGhpcy5kZXRhY2hQcmltYXJ5KCB0aGlzLnByaW1hcnkgKTtcclxuICAgICAgdGhpcy5wcmltYXJ5ID0gcHJpbWFyeTtcclxuICAgICAgdGhpcy5hdHRhY2hQcmltYXJ5KCBwcmltYXJ5ICk7XHJcbiAgICAgIHRoaXMubm90aWZ5Q2hhbmdlQ2FsbGJhY2soKTtcclxuXHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXMgd2l0aG91dCBzZW5kaW5nIHRoZSBub3RpZmljYXRpb25zLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjbGVhbigpIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoICdbUGFpbnRPYnNlcnZlcl0gY2xlYW4nICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIHRoaXMuZGV0YWNoUHJpbWFyeSggdGhpcy5wcmltYXJ5ICk7XHJcbiAgICB0aGlzLnByaW1hcnkgPSBudWxsO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIHRoZSB2YWx1ZSBvZiBhIFwicHJpbWFyeVwiIFByb3BlcnR5IChjb250ZW50cyBvZiBvbmUsIG1haW4gb3IgYXMgYSBHcmFkaWVudCkgaXMgcG90ZW50aWFsbHkgY2hhbmdlZC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd8Q29sb3J9IG5ld1BhaW50XHJcbiAgICogQHBhcmFtIHtzdHJpbmd8Q29sb3J9IG9sZFBhaW50XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eX0gcHJvcGVydHlcclxuICAgKi9cclxuICB1cGRhdGVTZWNvbmRhcnkoIG5ld1BhaW50LCBvbGRQYWludCwgcHJvcGVydHkgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cuUGFpbnRzKCAnW1BhaW50T2JzZXJ2ZXJdIHNlY29uZGFyeSB1cGRhdGUnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIGNvbnN0IGNvdW50ID0gdGhpcy5zZWNvbmRhcnlQcm9wZXJ0eUNvdW50c01hcFsgcHJvcGVydHkuaWQgXTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvdW50ID4gMCwgJ1dlIHNob3VsZCBhbHdheXMgYmUgcmVtb3ZpbmcgYXQgbGVhc3Qgb25lIHJlZmVyZW5jZScgKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrICkge1xyXG4gICAgICB0aGlzLmF0dGFjaFNlY29uZGFyeSggbmV3UGFpbnQgKTtcclxuICAgIH1cclxuICAgIHRoaXMubm90aWZ5Q2hhbmdlQ2FsbGJhY2soKTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBdHRlbXB0IHRvIGF0dGFjaCBsaXN0ZW5lcnMgdG8gdGhlIHBhaW50J3MgcHJpbWFyeSAodGhlIHBhaW50IGl0c2VsZiksIG9yIHNvbWV0aGluZyBlbHNlIHRoYXQgYWN0cyBsaWtlIHRoZSBwcmltYXJ5XHJcbiAgICogKHByb3BlcnRpZXMgb24gYSBncmFkaWVudCkuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIFRPRE86IE5vdGUgdGhhdCB0aGlzIGlzIGNhbGxlZCBmb3IgZ3JhZGllbnQgY29sb3JzIGFsc29cclxuICAgKlxyXG4gICAqIE5PVEU6IElmIGl0J3MgYSBQcm9wZXJ0eSwgd2UnbGwgYWxzbyBuZWVkIHRvIGhhbmRsZSB0aGUgc2Vjb25kYXJ5IChwYXJ0IGluc2lkZSB0aGUgUHJvcGVydHkpLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQYWludERlZn0gcGFpbnRcclxuICAgKi9cclxuICBhdHRhY2hQcmltYXJ5KCBwYWludCApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoICdbUGFpbnRPYnNlcnZlcl0gYXR0YWNoUHJpbWFyeScgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgaWYgKCBwYWludCBpbnN0YW5jZW9mIFJlYWRPbmx5UHJvcGVydHkgKSB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoICdbUGFpbnRPYnNlcnZlcl0gYWRkIFByb3BlcnR5IGxpc3RlbmVyJyApO1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG4gICAgICB0aGlzLnNlY29uZGFyeUxhenlMaW5rUHJvcGVydHkoIHBhaW50ICk7XHJcbiAgICAgIHRoaXMuYXR0YWNoU2Vjb25kYXJ5KCBwYWludC5nZXQoKSApO1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggcGFpbnQgaW5zdGFuY2VvZiBDb2xvciApIHtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggJ1tQYWludE9ic2VydmVyXSBDb2xvciBjaGFuZ2VkIHRvIGltbXV0YWJsZScgKTtcclxuXHJcbiAgICAgIC8vIFdlIHNldCB0aGUgY29sb3IgdG8gYmUgaW1tdXRhYmxlLCBzbyB3ZSBkb24ndCBuZWVkIHRvIGFkZCBhIGxpc3RlbmVyXHJcbiAgICAgIHBhaW50LnNldEltbXV0YWJsZSgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHBhaW50IGluc3RhbmNlb2YgR3JhZGllbnQgKSB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoICdbUGFpbnRPYnNlcnZlcl0gYWRkIEdyYWRpZW50IGxpc3RlbmVycycgKTtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcGFpbnQuc3RvcHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgdGhpcy5hdHRhY2hQcmltYXJ5KCBwYWludC5zdG9wc1sgaSBdLmNvbG9yICk7XHJcbiAgICAgIH1cclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEF0dGVtcHQgdG8gZGV0YWNoIGxpc3RlbmVycyBmcm9tIHRoZSBwYWludCdzIHByaW1hcnkgKHRoZSBwYWludCBpdHNlbGYpLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBUT0RPOiBOb3RlIHRoYXQgdGhpcyBpcyBjYWxsZWQgZm9yIGdyYWRpZW50IGNvbG9ycyBhbHNvXHJcbiAgICpcclxuICAgKiBOT1RFOiBJZiBpdCdzIGEgUHJvcGVydHkgb3IgR3JhZGllbnQsIHdlJ2xsIGFsc28gbmVlZCB0byBoYW5kbGUgdGhlIHNlY29uZGFyaWVzIChwYXJ0KHMpIGluc2lkZSB0aGUgUHJvcGVydHkoaWVzKSkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BhaW50RGVmfSBwYWludFxyXG4gICAqL1xyXG4gIGRldGFjaFByaW1hcnkoIHBhaW50ICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggJ1tQYWludE9ic2VydmVyXSBkZXRhY2hQcmltYXJ5JyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBpZiAoIHBhaW50IGluc3RhbmNlb2YgUmVhZE9ubHlQcm9wZXJ0eSApIHtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggJ1tQYWludE9ic2VydmVyXSByZW1vdmUgUHJvcGVydHkgbGlzdGVuZXInICk7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcbiAgICAgIHRoaXMuc2Vjb25kYXJ5VW5saW5rUHJvcGVydHkoIHBhaW50ICk7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBwYWludCBpbnN0YW5jZW9mIEdyYWRpZW50ICkge1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cuUGFpbnRzKCAnW1BhaW50T2JzZXJ2ZXJdIHJlbW92ZSBHcmFkaWVudCBsaXN0ZW5lcnMnICk7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBhaW50LnN0b3BzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIHRoaXMuZGV0YWNoUHJpbWFyeSggcGFpbnQuc3RvcHNbIGkgXS5jb2xvciApO1xyXG4gICAgICB9XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBdHRlbXB0IHRvIGF0dGFjaCBsaXN0ZW5lcnMgdG8gdGhlIHBhaW50J3Mgc2Vjb25kYXJ5IChwYXJ0IHdpdGhpbiB0aGUgUHJvcGVydHkpLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ3xDb2xvcn0gcGFpbnRcclxuICAgKi9cclxuICBhdHRhY2hTZWNvbmRhcnkoIHBhaW50ICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggJ1tQYWludE9ic2VydmVyXSBhdHRhY2hTZWNvbmRhcnknICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIGlmICggcGFpbnQgaW5zdGFuY2VvZiBDb2xvciApIHtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggJ1tQYWludE9ic2VydmVyXSBDb2xvciBzZXQgdG8gaW1tdXRhYmxlJyApO1xyXG5cclxuICAgICAgLy8gV2Ugc2V0IHRoZSBjb2xvciB0byBiZSBpbW11dGFibGUsIHNvIHdlIGRvbid0IG5lZWQgdG8gYWRkIGEgbGlzdGVuZXJcclxuICAgICAgcGFpbnQuc2V0SW1tdXRhYmxlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIGNoYW5nZSBjYWxsYmFjaywgYW5kIGludmFsaWRhdGVzIHRoZSBwYWludCBpdHNlbGYgaWYgaXQncyBhIGdyYWRpZW50LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgbm90aWZ5Q2hhbmdlZCgpIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoICdbUGFpbnRPYnNlcnZlcl0gY2hhbmdlZCcgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgaWYgKCB0aGlzLnByaW1hcnkgaW5zdGFuY2VvZiBHcmFkaWVudCApIHtcclxuICAgICAgdGhpcy5wcmltYXJ5LmludmFsaWRhdGVDYW52YXNHcmFkaWVudCgpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5jaGFuZ2VDYWxsYmFjaygpO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgb3VyIHNlY29uZGFyeSBsaXN0ZW5lciB0byB0aGUgUHJvcGVydHkgKHVubGVzcyB0aGVyZSBpcyBhbHJlYWR5IG9uZSwgaW4gd2hpY2ggY2FzZSB3ZSByZWNvcmQgdGhlIGNvdW50cykuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPCo+fSBwcm9wZXJ0eVxyXG4gICAqL1xyXG4gIHNlY29uZGFyeUxhenlMaW5rUHJvcGVydHkoIHByb3BlcnR5ICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggYFtQYWludE9ic2VydmVyXSBzZWNvbmRhcnlMYXp5TGlua1Byb3BlcnR5ICR7cHJvcGVydHkuX2lkfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgY29uc3QgaWQgPSBwcm9wZXJ0eS5pZDtcclxuICAgIGNvbnN0IGNvdW50ID0gdGhpcy5zZWNvbmRhcnlQcm9wZXJ0eUNvdW50c01hcFsgaWQgXTtcclxuICAgIGlmICggY291bnQgKSB7XHJcbiAgICAgIHRoaXMuc2Vjb25kYXJ5UHJvcGVydHlDb3VudHNNYXBbIGlkIF0rKztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLnNlY29uZGFyeVByb3BlcnR5Q291bnRzTWFwWyBpZCBdID0gMTtcclxuICAgICAgcHJvcGVydHkubGF6eUxpbmsoIHRoaXMudXBkYXRlU2Vjb25kYXJ5TGlzdGVuZXIgKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIG91ciBzZWNvbmRhcnkgbGlzdGVuZXIgZnJvbSB0aGUgUHJvcGVydHkgKHVubGVzcyB0aGVyZSB3ZXJlIG1vcmUgdGhhbiAxIHRpbWUgd2UgbmVlZGVkIHRvIGxpc3RlbiB0byBpdCxcclxuICAgKiBpbiB3aGljaCBjYXNlIHdlIHJlZHVjZSB0aGUgY291bnQpLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjwqPn0gcHJvcGVydHlcclxuICAgKi9cclxuICBzZWNvbmRhcnlVbmxpbmtQcm9wZXJ0eSggcHJvcGVydHkgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cuUGFpbnRzKCBgW1BhaW50T2JzZXJ2ZXJdIHNlY29uZGFyeVVubGlua1Byb3BlcnR5ICR7cHJvcGVydHkuX2lkfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgY29uc3QgaWQgPSBwcm9wZXJ0eS5pZDtcclxuICAgIGNvbnN0IGNvdW50ID0gLS10aGlzLnNlY29uZGFyeVByb3BlcnR5Q291bnRzTWFwWyBpZCBdO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY291bnQgPj0gMCwgJ1dlIHNob3VsZCBoYXZlIGhhZCBhIHJlZmVyZW5jZSBiZWZvcmUnICk7XHJcblxyXG4gICAgaWYgKCBjb3VudCA9PT0gMCApIHtcclxuICAgICAgZGVsZXRlIHRoaXMuc2Vjb25kYXJ5UHJvcGVydHlDb3VudHNNYXBbIGlkIF07XHJcbiAgICAgIGlmICggIXByb3BlcnR5LmlzRGlzcG9zZWQgKSB7XHJcbiAgICAgICAgcHJvcGVydHkudW5saW5rKCB0aGlzLnVwZGF0ZVNlY29uZGFyeUxpc3RlbmVyICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnUGFpbnRPYnNlcnZlcicsIFBhaW50T2JzZXJ2ZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgUGFpbnRPYnNlcnZlcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZ0JBQWdCLE1BQU0sc0NBQXNDO0FBQ25FLFNBQVNDLEtBQUssRUFBRUMsUUFBUSxFQUFFQyxPQUFPLFFBQVEsZUFBZTtBQUV4RCxNQUFNQyxhQUFhLENBQUM7RUFDbEI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxjQUFjLEVBQUc7SUFFNUI7SUFDQSxJQUFJLENBQUNDLE9BQU8sR0FBRyxJQUFJOztJQUVuQjtJQUNBLElBQUksQ0FBQ0QsY0FBYyxHQUFHQSxjQUFjOztJQUVwQztJQUNBLElBQUksQ0FBQ0Usb0JBQW9CLEdBQUcsSUFBSSxDQUFDQyxhQUFhLENBQUNDLElBQUksQ0FBRSxJQUFLLENBQUM7O0lBRTNEO0lBQ0EsSUFBSSxDQUFDQyx1QkFBdUIsR0FBRyxJQUFJLENBQUNDLGVBQWUsQ0FBQ0YsSUFBSSxDQUFFLElBQUssQ0FBQzs7SUFFaEU7SUFDQSxJQUFJLENBQUNHLDBCQUEwQixHQUFHLENBQUMsQ0FBQztFQUN0Qzs7RUFFQTtB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