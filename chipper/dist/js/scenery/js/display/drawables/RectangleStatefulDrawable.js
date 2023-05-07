// Copyright 2016-2022, University of Colorado Boulder

/**
 * A trait for drawables for Rectangle that need to store state about what the current display is currently showing,
 * so that updates to the Rectangle will only be made on attributes that specifically changed (and no change will be
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
const RectangleStatefulDrawable = memoize(type => {
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
      this.dirtyX = true;
      this.dirtyY = true;
      this.dirtyWidth = true;
      this.dirtyHeight = true;
      this.dirtyCornerXRadius = true;
      this.dirtyCornerYRadius = true;
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
    markDirtyRectangle() {
      // TODO: consider bitmask instead?
      this.dirtyX = true;
      this.dirtyY = true;
      this.dirtyWidth = true;
      this.dirtyHeight = true;
      this.dirtyCornerXRadius = true;
      this.dirtyCornerYRadius = true;
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyX() {
      this.dirtyX = true;
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyY() {
      this.dirtyY = true;
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyWidth() {
      this.dirtyWidth = true;
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyHeight() {
      this.dirtyHeight = true;
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyCornerXRadius() {
      this.dirtyCornerXRadius = true;
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyCornerYRadius() {
      this.dirtyCornerYRadius = true;
      this.markPaintDirty();
    }

    /**
     * Clears all of the dirty flags (after they have been checked), so that future mark* methods will be able to flag them again.
     * @public
     */
    setToCleanState() {
      this.paintDirty = false;
      this.dirtyX = false;
      this.dirtyY = false;
      this.dirtyWidth = false;
      this.dirtyHeight = false;
      this.dirtyCornerXRadius = false;
      this.dirtyCornerYRadius = false;
    }
  };
});
scenery.register('RectangleStatefulDrawable', RectangleStatefulDrawable);
export default RectangleStatefulDrawable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpbmhlcml0YW5jZSIsIm1lbW9pemUiLCJQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlIiwic2NlbmVyeSIsIlNlbGZEcmF3YWJsZSIsIlJlY3RhbmdsZVN0YXRlZnVsRHJhd2FibGUiLCJ0eXBlIiwiYXNzZXJ0IiwiXyIsImluY2x1ZGVzIiwiaW5pdGlhbGl6ZSIsInJlbmRlcmVyIiwiaW5zdGFuY2UiLCJhcmdzIiwicGFpbnREaXJ0eSIsImRpcnR5WCIsImRpcnR5WSIsImRpcnR5V2lkdGgiLCJkaXJ0eUhlaWdodCIsImRpcnR5Q29ybmVyWFJhZGl1cyIsImRpcnR5Q29ybmVyWVJhZGl1cyIsIm1hcmtQYWludERpcnR5IiwibWFya0RpcnR5IiwibWFya0RpcnR5UmVjdGFuZ2xlIiwibWFya0RpcnR5WCIsIm1hcmtEaXJ0eVkiLCJtYXJrRGlydHlXaWR0aCIsIm1hcmtEaXJ0eUhlaWdodCIsIm1hcmtEaXJ0eUNvcm5lclhSYWRpdXMiLCJtYXJrRGlydHlDb3JuZXJZUmFkaXVzIiwic2V0VG9DbGVhblN0YXRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJSZWN0YW5nbGVTdGF0ZWZ1bERyYXdhYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgdHJhaXQgZm9yIGRyYXdhYmxlcyBmb3IgUmVjdGFuZ2xlIHRoYXQgbmVlZCB0byBzdG9yZSBzdGF0ZSBhYm91dCB3aGF0IHRoZSBjdXJyZW50IGRpc3BsYXkgaXMgY3VycmVudGx5IHNob3dpbmcsXHJcbiAqIHNvIHRoYXQgdXBkYXRlcyB0byB0aGUgUmVjdGFuZ2xlIHdpbGwgb25seSBiZSBtYWRlIG9uIGF0dHJpYnV0ZXMgdGhhdCBzcGVjaWZpY2FsbHkgY2hhbmdlZCAoYW5kIG5vIGNoYW5nZSB3aWxsIGJlXHJcbiAqIG5lY2Vzc2FyeSBmb3IgYW4gYXR0cmlidXRlIHRoYXQgY2hhbmdlZCBiYWNrIHRvIGl0cyBvcmlnaW5hbC9jdXJyZW50bHktZGlzcGxheWVkIHZhbHVlKS4gR2VuZXJhbGx5LCB0aGlzIGlzIHVzZWRcclxuICogZm9yIERPTSBhbmQgU1ZHIGRyYXdhYmxlcy5cclxuICpcclxuICogVGhpcyB3aWxsIGFsc28gbWl4IGluIFBhaW50YWJsZVN0YXRlZnVsRHJhd2FibGVcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBpbmhlcml0YW5jZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvaW5oZXJpdGFuY2UuanMnO1xyXG5pbXBvcnQgbWVtb2l6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVtb2l6ZS5qcyc7XHJcbmltcG9ydCB7IFBhaW50YWJsZVN0YXRlZnVsRHJhd2FibGUsIHNjZW5lcnksIFNlbGZEcmF3YWJsZSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xyXG5cclxuY29uc3QgUmVjdGFuZ2xlU3RhdGVmdWxEcmF3YWJsZSA9IG1lbW9pemUoIHR5cGUgPT4ge1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIGluaGVyaXRhbmNlKCB0eXBlICksIFNlbGZEcmF3YWJsZSApICk7XHJcblxyXG4gIHJldHVybiBjbGFzcyBleHRlbmRzIFBhaW50YWJsZVN0YXRlZnVsRHJhd2FibGUoIHR5cGUgKSB7XHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBvdmVycmlkZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlciAtIFJlbmRlcmVyIGJpdG1hc2ssIHNlZSBSZW5kZXJlcidzIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgZGV0YWlscy5cclxuICAgICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXHJcbiAgICAgKi9cclxuICAgIGluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgLi4uYXJncyApIHtcclxuICAgICAgc3VwZXIuaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlLCAuLi5hcmdzICk7XHJcblxyXG4gICAgICAvLyBAcHJvdGVjdGVkIHtib29sZWFufSAtIEZsYWcgbWFya2VkIGFzIHRydWUgaWYgQU5ZIG9mIHRoZSBkcmF3YWJsZSBkaXJ0eSBmbGFncyBhcmUgc2V0IChiYXNpY2FsbHkgZXZlcnl0aGluZyBleGNlcHQgZm9yIHRyYW5zZm9ybXMsIGFzIHdlXHJcbiAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgbmVlZCB0byBhY2NlbGVyYXRlIHRoZSB0cmFuc2Zvcm0gY2FzZS5cclxuICAgICAgdGhpcy5wYWludERpcnR5ID0gdHJ1ZTtcclxuICAgICAgdGhpcy5kaXJ0eVggPSB0cnVlO1xyXG4gICAgICB0aGlzLmRpcnR5WSA9IHRydWU7XHJcbiAgICAgIHRoaXMuZGlydHlXaWR0aCA9IHRydWU7XHJcbiAgICAgIHRoaXMuZGlydHlIZWlnaHQgPSB0cnVlO1xyXG4gICAgICB0aGlzLmRpcnR5Q29ybmVyWFJhZGl1cyA9IHRydWU7XHJcbiAgICAgIHRoaXMuZGlydHlDb3JuZXJZUmFkaXVzID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEEgXCJjYXRjaC1hbGxcIiBkaXJ0eSBtZXRob2QgdGhhdCBkaXJlY3RseSBtYXJrcyB0aGUgcGFpbnREaXJ0eSBmbGFnIGFuZCB0cmlnZ2VycyBwcm9wYWdhdGlvbiBvZiBkaXJ0eVxyXG4gICAgICogaW5mb3JtYXRpb24uIFRoaXMgY2FuIGJlIHVzZWQgYnkgb3RoZXIgbWFyayogbWV0aG9kcywgb3IgZGlyZWN0bHkgaXRzZWxmIGlmIHRoZSBwYWludERpcnR5IGZsYWcgaXMgY2hlY2tlZC5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBJdCBzaG91bGQgYmUgZmlyZWQgKGluZGlyZWN0bHkgb3IgZGlyZWN0bHkpIGZvciBhbnl0aGluZyBiZXNpZGVzIHRyYW5zZm9ybXMgdGhhdCBuZWVkcyB0byBtYWtlIGEgZHJhd2FibGVcclxuICAgICAqIGRpcnR5LlxyXG4gICAgICovXHJcbiAgICBtYXJrUGFpbnREaXJ0eSgpIHtcclxuICAgICAgdGhpcy5wYWludERpcnR5ID0gdHJ1ZTtcclxuICAgICAgdGhpcy5tYXJrRGlydHkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgbWFya0RpcnR5UmVjdGFuZ2xlKCkge1xyXG4gICAgICAvLyBUT0RPOiBjb25zaWRlciBiaXRtYXNrIGluc3RlYWQ/XHJcbiAgICAgIHRoaXMuZGlydHlYID0gdHJ1ZTtcclxuICAgICAgdGhpcy5kaXJ0eVkgPSB0cnVlO1xyXG4gICAgICB0aGlzLmRpcnR5V2lkdGggPSB0cnVlO1xyXG4gICAgICB0aGlzLmRpcnR5SGVpZ2h0ID0gdHJ1ZTtcclxuICAgICAgdGhpcy5kaXJ0eUNvcm5lclhSYWRpdXMgPSB0cnVlO1xyXG4gICAgICB0aGlzLmRpcnR5Q29ybmVyWVJhZGl1cyA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgbWFya0RpcnR5WCgpIHtcclxuICAgICAgdGhpcy5kaXJ0eVggPSB0cnVlO1xyXG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIG1hcmtEaXJ0eVkoKSB7XHJcbiAgICAgIHRoaXMuZGlydHlZID0gdHJ1ZTtcclxuICAgICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICovXHJcbiAgICBtYXJrRGlydHlXaWR0aCgpIHtcclxuICAgICAgdGhpcy5kaXJ0eVdpZHRoID0gdHJ1ZTtcclxuICAgICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICovXHJcbiAgICBtYXJrRGlydHlIZWlnaHQoKSB7XHJcbiAgICAgIHRoaXMuZGlydHlIZWlnaHQgPSB0cnVlO1xyXG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIG1hcmtEaXJ0eUNvcm5lclhSYWRpdXMoKSB7XHJcbiAgICAgIHRoaXMuZGlydHlDb3JuZXJYUmFkaXVzID0gdHJ1ZTtcclxuICAgICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICovXHJcbiAgICBtYXJrRGlydHlDb3JuZXJZUmFkaXVzKCkge1xyXG4gICAgICB0aGlzLmRpcnR5Q29ybmVyWVJhZGl1cyA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsZWFycyBhbGwgb2YgdGhlIGRpcnR5IGZsYWdzIChhZnRlciB0aGV5IGhhdmUgYmVlbiBjaGVja2VkKSwgc28gdGhhdCBmdXR1cmUgbWFyayogbWV0aG9kcyB3aWxsIGJlIGFibGUgdG8gZmxhZyB0aGVtIGFnYWluLlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICovXHJcbiAgICBzZXRUb0NsZWFuU3RhdGUoKSB7XHJcbiAgICAgIHRoaXMucGFpbnREaXJ0eSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmRpcnR5WCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmRpcnR5WSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmRpcnR5V2lkdGggPSBmYWxzZTtcclxuICAgICAgdGhpcy5kaXJ0eUhlaWdodCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmRpcnR5Q29ybmVyWFJhZGl1cyA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmRpcnR5Q29ybmVyWVJhZGl1cyA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH07XHJcbn0gKTtcclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdSZWN0YW5nbGVTdGF0ZWZ1bERyYXdhYmxlJywgUmVjdGFuZ2xlU3RhdGVmdWxEcmF3YWJsZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUmVjdGFuZ2xlU3RhdGVmdWxEcmF3YWJsZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsT0FBT0MsT0FBTyxNQUFNLHFDQUFxQztBQUN6RCxTQUFTQyx5QkFBeUIsRUFBRUMsT0FBTyxFQUFFQyxZQUFZLFFBQVEsa0JBQWtCO0FBRW5GLE1BQU1DLHlCQUF5QixHQUFHSixPQUFPLENBQUVLLElBQUksSUFBSTtFQUNqREMsTUFBTSxJQUFJQSxNQUFNLENBQUVDLENBQUMsQ0FBQ0MsUUFBUSxDQUFFVCxXQUFXLENBQUVNLElBQUssQ0FBQyxFQUFFRixZQUFhLENBQUUsQ0FBQztFQUVuRSxPQUFPLGNBQWNGLHlCQUF5QixDQUFFSSxJQUFLLENBQUMsQ0FBQztJQUNyRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNJSSxVQUFVQSxDQUFFQyxRQUFRLEVBQUVDLFFBQVEsRUFBRSxHQUFHQyxJQUFJLEVBQUc7TUFDeEMsS0FBSyxDQUFDSCxVQUFVLENBQUVDLFFBQVEsRUFBRUMsUUFBUSxFQUFFLEdBQUdDLElBQUssQ0FBQzs7TUFFL0M7TUFDQTtNQUNBLElBQUksQ0FBQ0MsVUFBVSxHQUFHLElBQUk7TUFDdEIsSUFBSSxDQUFDQyxNQUFNLEdBQUcsSUFBSTtNQUNsQixJQUFJLENBQUNDLE1BQU0sR0FBRyxJQUFJO01BQ2xCLElBQUksQ0FBQ0MsVUFBVSxHQUFHLElBQUk7TUFDdEIsSUFB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