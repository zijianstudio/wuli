// Copyright 2016-2022, University of Colorado Boulder

/**
 * A trait for drawables for Circle that need to store state about what the current display is currently showing,
 * so that updates to the Circle will only be made on attributes that specifically changed (and no change will be
 * necessary for an attribute that changed back to its original/currently-displayed value). Generally, this is used
 * for DOM and SVG drawables.
 *
 * This trait also mixes PaintableStatefulDrawable.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import inheritance from '../../../../phet-core/js/inheritance.js';
import memoize from '../../../../phet-core/js/memoize.js';
import { PaintableStatefulDrawable, scenery, SelfDrawable } from '../../imports.js';
const CircleStatefulDrawable = memoize(type => {
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

      // @protected {boolean} - Whether the radius has changed since our last update.
      this.dirtyRadius = true;
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
     * Called when the radius of the circle changes.
     * @public
     */
    markDirtyRadius() {
      this.dirtyRadius = true;
      this.markPaintDirty();
    }

    /**
     * Clears all of the dirty flags (after they have been checked), so that future mark* methods will be able to flag them again.
     * @public
     */
    setToCleanState() {
      this.paintDirty = false;
      this.dirtyRadius = false;
    }
  };
});
scenery.register('CircleStatefulDrawable', CircleStatefulDrawable);
export default CircleStatefulDrawable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpbmhlcml0YW5jZSIsIm1lbW9pemUiLCJQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlIiwic2NlbmVyeSIsIlNlbGZEcmF3YWJsZSIsIkNpcmNsZVN0YXRlZnVsRHJhd2FibGUiLCJ0eXBlIiwiYXNzZXJ0IiwiXyIsImluY2x1ZGVzIiwiaW5pdGlhbGl6ZSIsInJlbmRlcmVyIiwiaW5zdGFuY2UiLCJhcmdzIiwicGFpbnREaXJ0eSIsImRpcnR5UmFkaXVzIiwibWFya1BhaW50RGlydHkiLCJtYXJrRGlydHkiLCJtYXJrRGlydHlSYWRpdXMiLCJzZXRUb0NsZWFuU3RhdGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNpcmNsZVN0YXRlZnVsRHJhd2FibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSB0cmFpdCBmb3IgZHJhd2FibGVzIGZvciBDaXJjbGUgdGhhdCBuZWVkIHRvIHN0b3JlIHN0YXRlIGFib3V0IHdoYXQgdGhlIGN1cnJlbnQgZGlzcGxheSBpcyBjdXJyZW50bHkgc2hvd2luZyxcclxuICogc28gdGhhdCB1cGRhdGVzIHRvIHRoZSBDaXJjbGUgd2lsbCBvbmx5IGJlIG1hZGUgb24gYXR0cmlidXRlcyB0aGF0IHNwZWNpZmljYWxseSBjaGFuZ2VkIChhbmQgbm8gY2hhbmdlIHdpbGwgYmVcclxuICogbmVjZXNzYXJ5IGZvciBhbiBhdHRyaWJ1dGUgdGhhdCBjaGFuZ2VkIGJhY2sgdG8gaXRzIG9yaWdpbmFsL2N1cnJlbnRseS1kaXNwbGF5ZWQgdmFsdWUpLiBHZW5lcmFsbHksIHRoaXMgaXMgdXNlZFxyXG4gKiBmb3IgRE9NIGFuZCBTVkcgZHJhd2FibGVzLlxyXG4gKlxyXG4gKiBUaGlzIHRyYWl0IGFsc28gbWl4ZXMgUGFpbnRhYmxlU3RhdGVmdWxEcmF3YWJsZS5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBpbmhlcml0YW5jZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvaW5oZXJpdGFuY2UuanMnO1xyXG5pbXBvcnQgbWVtb2l6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVtb2l6ZS5qcyc7XHJcbmltcG9ydCB7IFBhaW50YWJsZVN0YXRlZnVsRHJhd2FibGUsIHNjZW5lcnksIFNlbGZEcmF3YWJsZSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xyXG5cclxuY29uc3QgQ2lyY2xlU3RhdGVmdWxEcmF3YWJsZSA9IG1lbW9pemUoIHR5cGUgPT4ge1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIGluaGVyaXRhbmNlKCB0eXBlICksIFNlbGZEcmF3YWJsZSApICk7XHJcblxyXG4gIHJldHVybiBjbGFzcyBleHRlbmRzIFBhaW50YWJsZVN0YXRlZnVsRHJhd2FibGUoIHR5cGUgKSB7XHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBvdmVycmlkZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlciAtIFJlbmRlcmVyIGJpdG1hc2ssIHNlZSBSZW5kZXJlcidzIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgZGV0YWlscy5cclxuICAgICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXHJcbiAgICAgKi9cclxuICAgIGluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgLi4uYXJncyApIHtcclxuICAgICAgc3VwZXIuaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlLCAuLi5hcmdzICk7XHJcblxyXG4gICAgICAvLyBAcHJvdGVjdGVkIHtib29sZWFufSAtIEZsYWcgbWFya2VkIGFzIHRydWUgaWYgQU5ZIG9mIHRoZSBkcmF3YWJsZSBkaXJ0eSBmbGFncyBhcmUgc2V0IChiYXNpY2FsbHkgZXZlcnl0aGluZyBleGNlcHQgZm9yIHRyYW5zZm9ybXMsIGFzIHdlXHJcbiAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgbmVlZCB0byBhY2NlbGVyYXRlIHRoZSB0cmFuc2Zvcm0gY2FzZS5cclxuICAgICAgdGhpcy5wYWludERpcnR5ID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIEBwcm90ZWN0ZWQge2Jvb2xlYW59IC0gV2hldGhlciB0aGUgcmFkaXVzIGhhcyBjaGFuZ2VkIHNpbmNlIG91ciBsYXN0IHVwZGF0ZS5cclxuICAgICAgdGhpcy5kaXJ0eVJhZGl1cyA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIFwiY2F0Y2gtYWxsXCIgZGlydHkgbWV0aG9kIHRoYXQgZGlyZWN0bHkgbWFya3MgdGhlIHBhaW50RGlydHkgZmxhZyBhbmQgdHJpZ2dlcnMgcHJvcGFnYXRpb24gb2YgZGlydHlcclxuICAgICAqIGluZm9ybWF0aW9uLiBUaGlzIGNhbiBiZSB1c2VkIGJ5IG90aGVyIG1hcmsqIG1ldGhvZHMsIG9yIGRpcmVjdGx5IGl0c2VsZiBpZiB0aGUgcGFpbnREaXJ0eSBmbGFnIGlzIGNoZWNrZWQuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogSXQgc2hvdWxkIGJlIGZpcmVkIChpbmRpcmVjdGx5IG9yIGRpcmVjdGx5KSBmb3IgYW55dGhpbmcgYmVzaWRlcyB0cmFuc2Zvcm1zIHRoYXQgbmVlZHMgdG8gbWFrZSBhIGRyYXdhYmxlXHJcbiAgICAgKiBkaXJ0eS5cclxuICAgICAqL1xyXG4gICAgbWFya1BhaW50RGlydHkoKSB7XHJcbiAgICAgIHRoaXMucGFpbnREaXJ0eSA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya0RpcnR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgd2hlbiB0aGUgcmFkaXVzIG9mIHRoZSBjaXJjbGUgY2hhbmdlcy5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgbWFya0RpcnR5UmFkaXVzKCkge1xyXG4gICAgICB0aGlzLmRpcnR5UmFkaXVzID0gdHJ1ZTtcclxuICAgICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xlYXJzIGFsbCBvZiB0aGUgZGlydHkgZmxhZ3MgKGFmdGVyIHRoZXkgaGF2ZSBiZWVuIGNoZWNrZWQpLCBzbyB0aGF0IGZ1dHVyZSBtYXJrKiBtZXRob2RzIHdpbGwgYmUgYWJsZSB0byBmbGFnIHRoZW0gYWdhaW4uXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIHNldFRvQ2xlYW5TdGF0ZSgpIHtcclxuICAgICAgdGhpcy5wYWludERpcnR5ID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuZGlydHlSYWRpdXMgPSBmYWxzZTtcclxuICAgIH1cclxuICB9O1xyXG59ICk7XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnQ2lyY2xlU3RhdGVmdWxEcmF3YWJsZScsIENpcmNsZVN0YXRlZnVsRHJhd2FibGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IENpcmNsZVN0YXRlZnVsRHJhd2FibGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxXQUFXLE1BQU0seUNBQXlDO0FBQ2pFLE9BQU9DLE9BQU8sTUFBTSxxQ0FBcUM7QUFDekQsU0FBU0MseUJBQXlCLEVBQUVDLE9BQU8sRUFBRUMsWUFBWSxRQUFRLGtCQUFrQjtBQUVuRixNQUFNQyxzQkFBc0IsR0FBR0osT0FBTyxDQUFFSyxJQUFJLElBQUk7RUFDOUNDLE1BQU0sSUFBSUEsTUFBTSxDQUFFQyxDQUFDLENBQUNDLFFBQVEsQ0FBRVQsV0FBVyxDQUFFTSxJQUFLLENBQUMsRUFBRUYsWUFBYSxDQUFFLENBQUM7RUFFbkUsT0FBTyxjQUFjRix5QkFBeUIsQ0FBRUksSUFBSyxDQUFDLENBQUM7SUFDckQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDSUksVUFBVUEsQ0FBRUMsUUFBUSxFQUFFQyxRQUFRLEVBQUUsR0FBR0MsSUFBSSxFQUFHO01BQ3hDLEtBQUssQ0FBQ0gsVUFBVSxDQUFFQyxRQUFRLEVBQUVDLFFBQVEsRUFBRSxHQUFHQyxJQUFLLENBQUM7O01BRS9DO01BQ0E7TUFDQSxJQUFJLENBQUNDLFVBQVUsR0FBRyxJQUFJOztNQUV0QjtNQUNBLElBQUksQ0FBQ0MsV0FBVyxHQUFHLElBQUk7SUFDekI7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNJQyxjQUFjQSxDQUFBLEVBQUc7TUFDZixJQUFJLENBQUNGLFVBQVUsR0FBRyxJQUFJO01BQ3RCLElBQUksQ0FBQ0csU0FBUyxDQUFDLENBQUM7SUFDbEI7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7SUFDSUMsZUFBZUEsQ0FBQSxFQUFHO01BQ2hCLElBQUksQ0FBQ0gsV0FBVyxHQUFHLElBQUk7TUFDdkIsSUFBSSxDQUFDQyxjQUFjLENBQUMsQ0FBQztJQUN2Qjs7SUFFQTtBQUNKO0FBQ0E7QUFDQTtJQUNJRyxlQUFlQSxDQUFBLEVBQUc7TUFDaEIsSUFBSSxDQUFDTCxVQUFVLEdBQUcsS0FBSztNQUN2QixJQUFJLENBQUNDLFdBQVcsR0FBRyxLQUFLO0lBQzFCO0VBQ0YsQ0FBQztBQUNILENBQUUsQ0FBQztBQUVIWixPQUFPLENBQUNpQixRQUFRLENBQUUsd0JBQXdCLEVBQUVmLHNCQUF1QixDQUFDO0FBRXBFLGVBQWVBLHNCQUFzQiJ9