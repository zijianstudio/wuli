// Copyright 2016-2022, University of Colorado Boulder

/**
 * A trait for drawables for nodes that mix in Paintable that need to store state about what the current display is
 * currently showing, so that updates to the node's fill/stroke will only be made on attributes that specifically
 * changed (and no change will be necessary for an attribute that changed back to its original/currently-displayed
 * value). Generally, this is used for DOM and SVG drawables.
 *
 * Given the type (constructor) of a drawable, we'll mix in a combination of:
 * - initialization/disposal with the *State suffix
 * - mark* methods to be called on all drawables of nodes of this type, that set specific dirty flags
 * @public
 *
 * This will allow drawables that mix in this type to do the following during an update:
 * 1. Check specific dirty flags (e.g. if the fill changed, update the fill of our SVG element).
 * 2. Call setToCleanState() once done, to clear the dirty flags.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import inheritance from '../../../../phet-core/js/inheritance.js';
import memoize from '../../../../phet-core/js/memoize.js';
import { Color, PaintObserver, scenery, SelfDrawable } from '../../imports.js';
const PaintableStatefulDrawable = memoize(type => {
  assert && assert(_.includes(inheritance(type), SelfDrawable));
  return class extends type {
    /**
     * Initializes the paintable part of the stateful trait state, starting its "lifetime" until it is disposed
     * @protected
     *
     * @param {number} renderer - Renderer bitmask, see Renderer's documentation for more details.
     * @param {Instance} instance
     */
    initialize(renderer, instance, ...args) {
      super.initialize(renderer, instance, ...args);

      // @protected {boolean} - Whether the fill has changed since our last update.
      this.dirtyFill = true;

      // @protected {boolean} - Stores whether we last had a stroke.
      this.hadStroke = false;

      // @protected {boolean} - Whether the stroke has changed since our last update.
      this.dirtyStroke = true;

      // @protected {boolean} - Whether the lineWidth has changed since our last update.
      this.dirtyLineWidth = true;

      // @protected {boolean} - Whether the line options (cap, join, dash, dashoffset, miterlimit) have changed since
      //                        our last update.
      this.dirtyLineOptions = true;

      // @protected {boolean} - Whether the cached paints has changed since our last update.
      this.dirtyCachedPaints = true;

      // @protected {Array.<PaintDef>}
      // Stores the last seen cached paints, so we can update our listeners/etc.
      this.lastCachedPaints = [];

      // @private {function} - Callback for when the fill is marked as dirty
      this.fillCallback = this.fillCallback || this.markDirtyFill.bind(this);

      // @private {function} - Callback for when the stroke is marked as dirty
      this.strokeCallback = this.strokeCallback || this.markDirtyStroke.bind(this);

      // @private {PaintObserver} - Observers the fill property for nodes
      this.fillObserver = this.fillObserver || new PaintObserver(this.fillCallback);

      // @private {PaintObserver} - Observers the stroke property for nodes
      this.strokeObserver = this.strokeObserver || new PaintObserver(this.strokeCallback);

      // Hook up our fill/stroke observers to this node
      this.fillObserver.setPrimary(instance.node._fill);
      this.strokeObserver.setPrimary(instance.node._stroke);
    }

    /**
     * Cleans the dirty-flag states to the 'not-dirty' option, so that we can listen for future changes.
     * @protected
     */
    cleanPaintableState() {
      // TODO: is this being called when we need it to be called?
      this.dirtyFill = false;
      this.dirtyStroke = false;
      this.dirtyLineWidth = false;
      this.dirtyLineOptions = false;
      this.dirtyCachedPaints = false;
      this.hadStroke = this.node.getStroke() !== null;
    }

    /**
     * Disposes the paintable stateful trait state, so it can be put into the pool to be initialized again.
     * @public
     * @override
     */
    dispose() {
      super.dispose();
      this.fillObserver.clean();
      this.strokeObserver.clean();
    }

    /**
     * Called when the fill of the paintable node changes.
     * @public
     */
    markDirtyFill() {
      assert && Color.checkPaint(this.instance.node._fill);
      this.dirtyFill = true;
      this.markPaintDirty();
      this.fillObserver.setPrimary(this.instance.node._fill);
      // TODO: look into having the fillObserver be notified of Node changes as our source
    }

    /**
     * Called when the stroke of the paintable node changes.
     * @public
     */
    markDirtyStroke() {
      assert && Color.checkPaint(this.instance.node._stroke);
      this.dirtyStroke = true;
      this.markPaintDirty();
      this.strokeObserver.setPrimary(this.instance.node._stroke);
      // TODO: look into having the strokeObserver be notified of Node changes as our source
    }

    /**
     * Called when the lineWidth of the paintable node changes.
     * @public
     */
    markDirtyLineWidth() {
      this.dirtyLineWidth = true;
      this.markPaintDirty();
    }

    /**
     * Called when the line options (lineWidth/lineJoin, etc) of the paintable node changes.
     * @public
     */
    markDirtyLineOptions() {
      this.dirtyLineOptions = true;
      this.markPaintDirty();
    }

    /**
     * Called when the cached paints of the paintable node changes.
     * @public
     */
    markDirtyCachedPaints() {
      this.dirtyCachedPaints = true;
      this.markPaintDirty();
    }
  };
});
scenery.register('PaintableStatefulDrawable', PaintableStatefulDrawable);
export default PaintableStatefulDrawable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpbmhlcml0YW5jZSIsIm1lbW9pemUiLCJDb2xvciIsIlBhaW50T2JzZXJ2ZXIiLCJzY2VuZXJ5IiwiU2VsZkRyYXdhYmxlIiwiUGFpbnRhYmxlU3RhdGVmdWxEcmF3YWJsZSIsInR5cGUiLCJhc3NlcnQiLCJfIiwiaW5jbHVkZXMiLCJpbml0aWFsaXplIiwicmVuZGVyZXIiLCJpbnN0YW5jZSIsImFyZ3MiLCJkaXJ0eUZpbGwiLCJoYWRTdHJva2UiLCJkaXJ0eVN0cm9rZSIsImRpcnR5TGluZVdpZHRoIiwiZGlydHlMaW5lT3B0aW9ucyIsImRpcnR5Q2FjaGVkUGFpbnRzIiwibGFzdENhY2hlZFBhaW50cyIsImZpbGxDYWxsYmFjayIsIm1hcmtEaXJ0eUZpbGwiLCJiaW5kIiwic3Ryb2tlQ2FsbGJhY2siLCJtYXJrRGlydHlTdHJva2UiLCJmaWxsT2JzZXJ2ZXIiLCJzdHJva2VPYnNlcnZlciIsInNldFByaW1hcnkiLCJub2RlIiwiX2ZpbGwiLCJfc3Ryb2tlIiwiY2xlYW5QYWludGFibGVTdGF0ZSIsImdldFN0cm9rZSIsImRpc3Bvc2UiLCJjbGVhbiIsImNoZWNrUGFpbnQiLCJtYXJrUGFpbnREaXJ0eSIsIm1hcmtEaXJ0eUxpbmVXaWR0aCIsIm1hcmtEaXJ0eUxpbmVPcHRpb25zIiwibWFya0RpcnR5Q2FjaGVkUGFpbnRzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgdHJhaXQgZm9yIGRyYXdhYmxlcyBmb3Igbm9kZXMgdGhhdCBtaXggaW4gUGFpbnRhYmxlIHRoYXQgbmVlZCB0byBzdG9yZSBzdGF0ZSBhYm91dCB3aGF0IHRoZSBjdXJyZW50IGRpc3BsYXkgaXNcclxuICogY3VycmVudGx5IHNob3dpbmcsIHNvIHRoYXQgdXBkYXRlcyB0byB0aGUgbm9kZSdzIGZpbGwvc3Ryb2tlIHdpbGwgb25seSBiZSBtYWRlIG9uIGF0dHJpYnV0ZXMgdGhhdCBzcGVjaWZpY2FsbHlcclxuICogY2hhbmdlZCAoYW5kIG5vIGNoYW5nZSB3aWxsIGJlIG5lY2Vzc2FyeSBmb3IgYW4gYXR0cmlidXRlIHRoYXQgY2hhbmdlZCBiYWNrIHRvIGl0cyBvcmlnaW5hbC9jdXJyZW50bHktZGlzcGxheWVkXHJcbiAqIHZhbHVlKS4gR2VuZXJhbGx5LCB0aGlzIGlzIHVzZWQgZm9yIERPTSBhbmQgU1ZHIGRyYXdhYmxlcy5cclxuICpcclxuICogR2l2ZW4gdGhlIHR5cGUgKGNvbnN0cnVjdG9yKSBvZiBhIGRyYXdhYmxlLCB3ZSdsbCBtaXggaW4gYSBjb21iaW5hdGlvbiBvZjpcclxuICogLSBpbml0aWFsaXphdGlvbi9kaXNwb3NhbCB3aXRoIHRoZSAqU3RhdGUgc3VmZml4XHJcbiAqIC0gbWFyayogbWV0aG9kcyB0byBiZSBjYWxsZWQgb24gYWxsIGRyYXdhYmxlcyBvZiBub2RlcyBvZiB0aGlzIHR5cGUsIHRoYXQgc2V0IHNwZWNpZmljIGRpcnR5IGZsYWdzXHJcbiAqIEBwdWJsaWNcclxuICpcclxuICogVGhpcyB3aWxsIGFsbG93IGRyYXdhYmxlcyB0aGF0IG1peCBpbiB0aGlzIHR5cGUgdG8gZG8gdGhlIGZvbGxvd2luZyBkdXJpbmcgYW4gdXBkYXRlOlxyXG4gKiAxLiBDaGVjayBzcGVjaWZpYyBkaXJ0eSBmbGFncyAoZS5nLiBpZiB0aGUgZmlsbCBjaGFuZ2VkLCB1cGRhdGUgdGhlIGZpbGwgb2Ygb3VyIFNWRyBlbGVtZW50KS5cclxuICogMi4gQ2FsbCBzZXRUb0NsZWFuU3RhdGUoKSBvbmNlIGRvbmUsIHRvIGNsZWFyIHRoZSBkaXJ0eSBmbGFncy5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBpbmhlcml0YW5jZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvaW5oZXJpdGFuY2UuanMnO1xyXG5pbXBvcnQgbWVtb2l6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVtb2l6ZS5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBQYWludE9ic2VydmVyLCBzY2VuZXJ5LCBTZWxmRHJhd2FibGUgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcclxuXHJcbmNvbnN0IFBhaW50YWJsZVN0YXRlZnVsRHJhd2FibGUgPSBtZW1vaXplKCB0eXBlID0+IHtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCBpbmhlcml0YW5jZSggdHlwZSApLCBTZWxmRHJhd2FibGUgKSApO1xyXG5cclxuICByZXR1cm4gY2xhc3MgZXh0ZW5kcyB0eXBlIHtcclxuICAgIC8qKlxyXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIHBhaW50YWJsZSBwYXJ0IG9mIHRoZSBzdGF0ZWZ1bCB0cmFpdCBzdGF0ZSwgc3RhcnRpbmcgaXRzIFwibGlmZXRpbWVcIiB1bnRpbCBpdCBpcyBkaXNwb3NlZFxyXG4gICAgICogQHByb3RlY3RlZFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlciAtIFJlbmRlcmVyIGJpdG1hc2ssIHNlZSBSZW5kZXJlcidzIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgZGV0YWlscy5cclxuICAgICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXHJcbiAgICAgKi9cclxuICAgIGluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgLi4uYXJncyApIHtcclxuICAgICAgc3VwZXIuaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlLCAuLi5hcmdzICk7XHJcblxyXG4gICAgICAvLyBAcHJvdGVjdGVkIHtib29sZWFufSAtIFdoZXRoZXIgdGhlIGZpbGwgaGFzIGNoYW5nZWQgc2luY2Ugb3VyIGxhc3QgdXBkYXRlLlxyXG4gICAgICB0aGlzLmRpcnR5RmlsbCA9IHRydWU7XHJcblxyXG4gICAgICAvLyBAcHJvdGVjdGVkIHtib29sZWFufSAtIFN0b3JlcyB3aGV0aGVyIHdlIGxhc3QgaGFkIGEgc3Ryb2tlLlxyXG4gICAgICB0aGlzLmhhZFN0cm9rZSA9IGZhbHNlO1xyXG5cclxuICAgICAgLy8gQHByb3RlY3RlZCB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoZSBzdHJva2UgaGFzIGNoYW5nZWQgc2luY2Ugb3VyIGxhc3QgdXBkYXRlLlxyXG4gICAgICB0aGlzLmRpcnR5U3Ryb2tlID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIEBwcm90ZWN0ZWQge2Jvb2xlYW59IC0gV2hldGhlciB0aGUgbGluZVdpZHRoIGhhcyBjaGFuZ2VkIHNpbmNlIG91ciBsYXN0IHVwZGF0ZS5cclxuICAgICAgdGhpcy5kaXJ0eUxpbmVXaWR0aCA9IHRydWU7XHJcblxyXG4gICAgICAvLyBAcHJvdGVjdGVkIHtib29sZWFufSAtIFdoZXRoZXIgdGhlIGxpbmUgb3B0aW9ucyAoY2FwLCBqb2luLCBkYXNoLCBkYXNob2Zmc2V0LCBtaXRlcmxpbWl0KSBoYXZlIGNoYW5nZWQgc2luY2VcclxuICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICBvdXIgbGFzdCB1cGRhdGUuXHJcbiAgICAgIHRoaXMuZGlydHlMaW5lT3B0aW9ucyA9IHRydWU7XHJcblxyXG4gICAgICAvLyBAcHJvdGVjdGVkIHtib29sZWFufSAtIFdoZXRoZXIgdGhlIGNhY2hlZCBwYWludHMgaGFzIGNoYW5nZWQgc2luY2Ugb3VyIGxhc3QgdXBkYXRlLlxyXG4gICAgICB0aGlzLmRpcnR5Q2FjaGVkUGFpbnRzID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIEBwcm90ZWN0ZWQge0FycmF5LjxQYWludERlZj59XHJcbiAgICAgIC8vIFN0b3JlcyB0aGUgbGFzdCBzZWVuIGNhY2hlZCBwYWludHMsIHNvIHdlIGNhbiB1cGRhdGUgb3VyIGxpc3RlbmVycy9ldGMuXHJcbiAgICAgIHRoaXMubGFzdENhY2hlZFBhaW50cyA9IFtdO1xyXG5cclxuICAgICAgLy8gQHByaXZhdGUge2Z1bmN0aW9ufSAtIENhbGxiYWNrIGZvciB3aGVuIHRoZSBmaWxsIGlzIG1hcmtlZCBhcyBkaXJ0eVxyXG4gICAgICB0aGlzLmZpbGxDYWxsYmFjayA9IHRoaXMuZmlsbENhbGxiYWNrIHx8IHRoaXMubWFya0RpcnR5RmlsbC5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259IC0gQ2FsbGJhY2sgZm9yIHdoZW4gdGhlIHN0cm9rZSBpcyBtYXJrZWQgYXMgZGlydHlcclxuICAgICAgdGhpcy5zdHJva2VDYWxsYmFjayA9IHRoaXMuc3Ryb2tlQ2FsbGJhY2sgfHwgdGhpcy5tYXJrRGlydHlTdHJva2UuYmluZCggdGhpcyApO1xyXG5cclxuICAgICAgLy8gQHByaXZhdGUge1BhaW50T2JzZXJ2ZXJ9IC0gT2JzZXJ2ZXJzIHRoZSBmaWxsIHByb3BlcnR5IGZvciBub2Rlc1xyXG4gICAgICB0aGlzLmZpbGxPYnNlcnZlciA9IHRoaXMuZmlsbE9ic2VydmVyIHx8IG5ldyBQYWludE9ic2VydmVyKCB0aGlzLmZpbGxDYWxsYmFjayApO1xyXG5cclxuICAgICAgLy8gQHByaXZhdGUge1BhaW50T2JzZXJ2ZXJ9IC0gT2JzZXJ2ZXJzIHRoZSBzdHJva2UgcHJvcGVydHkgZm9yIG5vZGVzXHJcbiAgICAgIHRoaXMuc3Ryb2tlT2JzZXJ2ZXIgPSB0aGlzLnN0cm9rZU9ic2VydmVyIHx8IG5ldyBQYWludE9ic2VydmVyKCB0aGlzLnN0cm9rZUNhbGxiYWNrICk7XHJcblxyXG4gICAgICAvLyBIb29rIHVwIG91ciBmaWxsL3N0cm9rZSBvYnNlcnZlcnMgdG8gdGhpcyBub2RlXHJcbiAgICAgIHRoaXMuZmlsbE9ic2VydmVyLnNldFByaW1hcnkoIGluc3RhbmNlLm5vZGUuX2ZpbGwgKTtcclxuICAgICAgdGhpcy5zdHJva2VPYnNlcnZlci5zZXRQcmltYXJ5KCBpbnN0YW5jZS5ub2RlLl9zdHJva2UgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsZWFucyB0aGUgZGlydHktZmxhZyBzdGF0ZXMgdG8gdGhlICdub3QtZGlydHknIG9wdGlvbiwgc28gdGhhdCB3ZSBjYW4gbGlzdGVuIGZvciBmdXR1cmUgY2hhbmdlcy5cclxuICAgICAqIEBwcm90ZWN0ZWRcclxuICAgICAqL1xyXG4gICAgY2xlYW5QYWludGFibGVTdGF0ZSgpIHtcclxuICAgICAgLy8gVE9ETzogaXMgdGhpcyBiZWluZyBjYWxsZWQgd2hlbiB3ZSBuZWVkIGl0IHRvIGJlIGNhbGxlZD9cclxuICAgICAgdGhpcy5kaXJ0eUZpbGwgPSBmYWxzZTtcclxuXHJcbiAgICAgIHRoaXMuZGlydHlTdHJva2UgPSBmYWxzZTtcclxuICAgICAgdGhpcy5kaXJ0eUxpbmVXaWR0aCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmRpcnR5TGluZU9wdGlvbnMgPSBmYWxzZTtcclxuICAgICAgdGhpcy5kaXJ0eUNhY2hlZFBhaW50cyA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmhhZFN0cm9rZSA9IHRoaXMubm9kZS5nZXRTdHJva2UoKSAhPT0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERpc3Bvc2VzIHRoZSBwYWludGFibGUgc3RhdGVmdWwgdHJhaXQgc3RhdGUsIHNvIGl0IGNhbiBiZSBwdXQgaW50byB0aGUgcG9vbCB0byBiZSBpbml0aWFsaXplZCBhZ2Fpbi5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBvdmVycmlkZVxyXG4gICAgICovXHJcbiAgICBkaXNwb3NlKCkge1xyXG4gICAgICBzdXBlci5kaXNwb3NlKCk7XHJcblxyXG4gICAgICB0aGlzLmZpbGxPYnNlcnZlci5jbGVhbigpO1xyXG4gICAgICB0aGlzLnN0cm9rZU9ic2VydmVyLmNsZWFuKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgd2hlbiB0aGUgZmlsbCBvZiB0aGUgcGFpbnRhYmxlIG5vZGUgY2hhbmdlcy5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgbWFya0RpcnR5RmlsbCgpIHtcclxuICAgICAgYXNzZXJ0ICYmIENvbG9yLmNoZWNrUGFpbnQoIHRoaXMuaW5zdGFuY2Uubm9kZS5fZmlsbCApO1xyXG5cclxuICAgICAgdGhpcy5kaXJ0eUZpbGwgPSB0cnVlO1xyXG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XHJcbiAgICAgIHRoaXMuZmlsbE9ic2VydmVyLnNldFByaW1hcnkoIHRoaXMuaW5zdGFuY2Uubm9kZS5fZmlsbCApO1xyXG4gICAgICAvLyBUT0RPOiBsb29rIGludG8gaGF2aW5nIHRoZSBmaWxsT2JzZXJ2ZXIgYmUgbm90aWZpZWQgb2YgTm9kZSBjaGFuZ2VzIGFzIG91ciBzb3VyY2VcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGxlZCB3aGVuIHRoZSBzdHJva2Ugb2YgdGhlIHBhaW50YWJsZSBub2RlIGNoYW5nZXMuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIG1hcmtEaXJ0eVN0cm9rZSgpIHtcclxuICAgICAgYXNzZXJ0ICYmIENvbG9yLmNoZWNrUGFpbnQoIHRoaXMuaW5zdGFuY2Uubm9kZS5fc3Ryb2tlICk7XHJcblxyXG4gICAgICB0aGlzLmRpcnR5U3Ryb2tlID0gdHJ1ZTtcclxuICAgICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xyXG4gICAgICB0aGlzLnN0cm9rZU9ic2VydmVyLnNldFByaW1hcnkoIHRoaXMuaW5zdGFuY2Uubm9kZS5fc3Ryb2tlICk7XHJcbiAgICAgIC8vIFRPRE86IGxvb2sgaW50byBoYXZpbmcgdGhlIHN0cm9rZU9ic2VydmVyIGJlIG5vdGlmaWVkIG9mIE5vZGUgY2hhbmdlcyBhcyBvdXIgc291cmNlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgd2hlbiB0aGUgbGluZVdpZHRoIG9mIHRoZSBwYWludGFibGUgbm9kZSBjaGFuZ2VzLlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICovXHJcbiAgICBtYXJrRGlydHlMaW5lV2lkdGgoKSB7XHJcbiAgICAgIHRoaXMuZGlydHlMaW5lV2lkdGggPSB0cnVlO1xyXG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgd2hlbiB0aGUgbGluZSBvcHRpb25zIChsaW5lV2lkdGgvbGluZUpvaW4sIGV0Yykgb2YgdGhlIHBhaW50YWJsZSBub2RlIGNoYW5nZXMuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIG1hcmtEaXJ0eUxpbmVPcHRpb25zKCkge1xyXG4gICAgICB0aGlzLmRpcnR5TGluZU9wdGlvbnMgPSB0cnVlO1xyXG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgd2hlbiB0aGUgY2FjaGVkIHBhaW50cyBvZiB0aGUgcGFpbnRhYmxlIG5vZGUgY2hhbmdlcy5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgbWFya0RpcnR5Q2FjaGVkUGFpbnRzKCkge1xyXG4gICAgICB0aGlzLmRpcnR5Q2FjaGVkUGFpbnRzID0gdHJ1ZTtcclxuICAgICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xyXG4gICAgfVxyXG4gIH07XHJcbn0gKTtcclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlJywgUGFpbnRhYmxlU3RhdGVmdWxEcmF3YWJsZSApO1xyXG5leHBvcnQgZGVmYXVsdCBQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxXQUFXLE1BQU0seUNBQXlDO0FBQ2pFLE9BQU9DLE9BQU8sTUFBTSxxQ0FBcUM7QUFDekQsU0FBU0MsS0FB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