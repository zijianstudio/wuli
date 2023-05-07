// Copyright 2016-2022, University of Colorado Boulder

/**
 * A trait for drawables for Line that need to store state about what the current display is currently showing,
 * so that updates to the Line will only be made on attributes that specifically changed (and no change will be
 * necessary for an attribute that changed back to its original/currently-displayed value). Generally, this is used
 * for DOM and SVG drawables.
 *
 * This will also mix in PaintableStatefulDrawable
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import inheritance from '../../../../phet-core/js/inheritance.js';
import memoize from '../../../../phet-core/js/memoize.js';
import { PaintableStatefulDrawable, scenery, SelfDrawable } from '../../imports.js';
const LineStatefulDrawable = memoize(type => {
  assert && assert(_.includes(inheritance(type), SelfDrawable));
  return class extends PaintableStatefulDrawable(type) {
    /**
     * @public
     * @override
     *
     * @param {number} renderer - Renderer bitmask, see Renderer's documentation for more details.
     * @param {Instance} instance
     */
    initialize(renderer, instance, ...args) {
      super.initialize(renderer, instance, ...args);

      // @protected {boolean} - Flag marked as true if ANY of the drawable dirty flags are set (basically everything except for transforms, as we
      //                        need to accelerate the transform case.
      this.paintDirty = true;
      this.dirtyX1 = true;
      this.dirtyY1 = true;
      this.dirtyX2 = true;
      this.dirtyY2 = true;
    }

    /**
     * A "catch-all" dirty method that directly marks the paintDirty flag and triggers propagation of dirty
     * information. This can be used by other mark* methods, or directly itself if the paintDirty flag is checked.
     * @public
     *
     * It should be fired (indirectly or directly) for anything besides transforms that needs to make a drawable
     * dirty.
     */
    markPaintDirty() {
      this.paintDirty = true;
      this.markDirty();
    }

    /**
     * @public
     */
    markDirtyLine() {
      this.dirtyX1 = true;
      this.dirtyY1 = true;
      this.dirtyX2 = true;
      this.dirtyY2 = true;
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyP1() {
      this.dirtyX1 = true;
      this.dirtyY1 = true;
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyP2() {
      this.dirtyX2 = true;
      this.dirtyY2 = true;
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyX1() {
      this.dirtyX1 = true;
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyY1() {
      this.dirtyY1 = true;
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyX2() {
      this.dirtyX2 = true;
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyY2() {
      this.dirtyY2 = true;
      this.markPaintDirty();
    }

    /**
     * Clears all of the dirty flags (after they have been checked), so that future mark* methods will be able to flag them again.
     * @public
     */
    setToCleanState() {
      this.paintDirty = false;
      this.dirtyX1 = false;
      this.dirtyY1 = false;
      this.dirtyX2 = false;
      this.dirtyY2 = false;
    }
  };
});
scenery.register('LineStatefulDrawable', LineStatefulDrawable);
export default LineStatefulDrawable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpbmhlcml0YW5jZSIsIm1lbW9pemUiLCJQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlIiwic2NlbmVyeSIsIlNlbGZEcmF3YWJsZSIsIkxpbmVTdGF0ZWZ1bERyYXdhYmxlIiwidHlwZSIsImFzc2VydCIsIl8iLCJpbmNsdWRlcyIsImluaXRpYWxpemUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwiYXJncyIsInBhaW50RGlydHkiLCJkaXJ0eVgxIiwiZGlydHlZMSIsImRpcnR5WDIiLCJkaXJ0eVkyIiwibWFya1BhaW50RGlydHkiLCJtYXJrRGlydHkiLCJtYXJrRGlydHlMaW5lIiwibWFya0RpcnR5UDEiLCJtYXJrRGlydHlQMiIsIm1hcmtEaXJ0eVgxIiwibWFya0RpcnR5WTEiLCJtYXJrRGlydHlYMiIsIm1hcmtEaXJ0eVkyIiwic2V0VG9DbGVhblN0YXRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMaW5lU3RhdGVmdWxEcmF3YWJsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIHRyYWl0IGZvciBkcmF3YWJsZXMgZm9yIExpbmUgdGhhdCBuZWVkIHRvIHN0b3JlIHN0YXRlIGFib3V0IHdoYXQgdGhlIGN1cnJlbnQgZGlzcGxheSBpcyBjdXJyZW50bHkgc2hvd2luZyxcclxuICogc28gdGhhdCB1cGRhdGVzIHRvIHRoZSBMaW5lIHdpbGwgb25seSBiZSBtYWRlIG9uIGF0dHJpYnV0ZXMgdGhhdCBzcGVjaWZpY2FsbHkgY2hhbmdlZCAoYW5kIG5vIGNoYW5nZSB3aWxsIGJlXHJcbiAqIG5lY2Vzc2FyeSBmb3IgYW4gYXR0cmlidXRlIHRoYXQgY2hhbmdlZCBiYWNrIHRvIGl0cyBvcmlnaW5hbC9jdXJyZW50bHktZGlzcGxheWVkIHZhbHVlKS4gR2VuZXJhbGx5LCB0aGlzIGlzIHVzZWRcclxuICogZm9yIERPTSBhbmQgU1ZHIGRyYXdhYmxlcy5cclxuICpcclxuICogVGhpcyB3aWxsIGFsc28gbWl4IGluIFBhaW50YWJsZVN0YXRlZnVsRHJhd2FibGVcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBpbmhlcml0YW5jZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvaW5oZXJpdGFuY2UuanMnO1xyXG5pbXBvcnQgbWVtb2l6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVtb2l6ZS5qcyc7XHJcbmltcG9ydCB7IFBhaW50YWJsZVN0YXRlZnVsRHJhd2FibGUsIHNjZW5lcnksIFNlbGZEcmF3YWJsZSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xyXG5cclxuY29uc3QgTGluZVN0YXRlZnVsRHJhd2FibGUgPSBtZW1vaXplKCB0eXBlID0+IHtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCBpbmhlcml0YW5jZSggdHlwZSApLCBTZWxmRHJhd2FibGUgKSApO1xyXG5cclxuICByZXR1cm4gY2xhc3MgZXh0ZW5kcyBQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlKCB0eXBlICkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAb3ZlcnJpZGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcmVuZGVyZXIgLSBSZW5kZXJlciBiaXRtYXNrLCBzZWUgUmVuZGVyZXIncyBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGRldGFpbHMuXHJcbiAgICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxyXG4gICAgICovXHJcbiAgICBpbml0aWFsaXplKCByZW5kZXJlciwgaW5zdGFuY2UsIC4uLmFyZ3MgKSB7XHJcbiAgICAgIHN1cGVyLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgLi4uYXJncyApO1xyXG5cclxuICAgICAgLy8gQHByb3RlY3RlZCB7Ym9vbGVhbn0gLSBGbGFnIG1hcmtlZCBhcyB0cnVlIGlmIEFOWSBvZiB0aGUgZHJhd2FibGUgZGlydHkgZmxhZ3MgYXJlIHNldCAoYmFzaWNhbGx5IGV2ZXJ5dGhpbmcgZXhjZXB0IGZvciB0cmFuc2Zvcm1zLCBhcyB3ZVxyXG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgIG5lZWQgdG8gYWNjZWxlcmF0ZSB0aGUgdHJhbnNmb3JtIGNhc2UuXHJcbiAgICAgIHRoaXMucGFpbnREaXJ0eSA9IHRydWU7XHJcbiAgICAgIHRoaXMuZGlydHlYMSA9IHRydWU7XHJcbiAgICAgIHRoaXMuZGlydHlZMSA9IHRydWU7XHJcbiAgICAgIHRoaXMuZGlydHlYMiA9IHRydWU7XHJcbiAgICAgIHRoaXMuZGlydHlZMiA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIFwiY2F0Y2gtYWxsXCIgZGlydHkgbWV0aG9kIHRoYXQgZGlyZWN0bHkgbWFya3MgdGhlIHBhaW50RGlydHkgZmxhZyBhbmQgdHJpZ2dlcnMgcHJvcGFnYXRpb24gb2YgZGlydHlcclxuICAgICAqIGluZm9ybWF0aW9uLiBUaGlzIGNhbiBiZSB1c2VkIGJ5IG90aGVyIG1hcmsqIG1ldGhvZHMsIG9yIGRpcmVjdGx5IGl0c2VsZiBpZiB0aGUgcGFpbnREaXJ0eSBmbGFnIGlzIGNoZWNrZWQuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogSXQgc2hvdWxkIGJlIGZpcmVkIChpbmRpcmVjdGx5IG9yIGRpcmVjdGx5KSBmb3IgYW55dGhpbmcgYmVzaWRlcyB0cmFuc2Zvcm1zIHRoYXQgbmVlZHMgdG8gbWFrZSBhIGRyYXdhYmxlXHJcbiAgICAgKiBkaXJ0eS5cclxuICAgICAqL1xyXG4gICAgbWFya1BhaW50RGlydHkoKSB7XHJcbiAgICAgIHRoaXMucGFpbnREaXJ0eSA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya0RpcnR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIG1hcmtEaXJ0eUxpbmUoKSB7XHJcbiAgICAgIHRoaXMuZGlydHlYMSA9IHRydWU7XHJcbiAgICAgIHRoaXMuZGlydHlZMSA9IHRydWU7XHJcbiAgICAgIHRoaXMuZGlydHlYMiA9IHRydWU7XHJcbiAgICAgIHRoaXMuZGlydHlZMiA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgbWFya0RpcnR5UDEoKSB7XHJcbiAgICAgIHRoaXMuZGlydHlYMSA9IHRydWU7XHJcbiAgICAgIHRoaXMuZGlydHlZMSA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgbWFya0RpcnR5UDIoKSB7XHJcbiAgICAgIHRoaXMuZGlydHlYMiA9IHRydWU7XHJcbiAgICAgIHRoaXMuZGlydHlZMiA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgbWFya0RpcnR5WDEoKSB7XHJcbiAgICAgIHRoaXMuZGlydHlYMSA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgbWFya0RpcnR5WTEoKSB7XHJcbiAgICAgIHRoaXMuZGlydHlZMSA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgbWFya0RpcnR5WDIoKSB7XHJcbiAgICAgIHRoaXMuZGlydHlYMiA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgbWFya0RpcnR5WTIoKSB7XHJcbiAgICAgIHRoaXMuZGlydHlZMiA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsZWFycyBhbGwgb2YgdGhlIGRpcnR5IGZsYWdzIChhZnRlciB0aGV5IGhhdmUgYmVlbiBjaGVja2VkKSwgc28gdGhhdCBmdXR1cmUgbWFyayogbWV0aG9kcyB3aWxsIGJlIGFibGUgdG8gZmxhZyB0aGVtIGFnYWluLlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICovXHJcbiAgICBzZXRUb0NsZWFuU3RhdGUoKSB7XHJcbiAgICAgIHRoaXMucGFpbnREaXJ0eSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmRpcnR5WDEgPSBmYWxzZTtcclxuICAgICAgdGhpcy5kaXJ0eVkxID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuZGlydHlYMiA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmRpcnR5WTIgPSBmYWxzZTtcclxuICAgIH1cclxuICB9O1xyXG59ICk7XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnTGluZVN0YXRlZnVsRHJhd2FibGUnLCBMaW5lU3RhdGVmdWxEcmF3YWJsZSApO1xyXG5leHBvcnQgZGVmYXVsdCBMaW5lU3RhdGVmdWxEcmF3YWJsZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsT0FBT0MsT0FBTyxNQUFNLHFDQUFxQztBQUN6RCxTQUFTQyx5QkFBeUIsRUFBRUMsT0FBTyxFQUFFQyxZQUFZLFFBQVEsa0JBQWtCO0FBRW5GLE1BQU1DLG9CQUFv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