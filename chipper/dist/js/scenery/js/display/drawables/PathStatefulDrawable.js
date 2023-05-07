// Copyright 2016-2022, University of Colorado Boulder

/**
 * A trait for drawables for Path that need to store state about what the current display is currently showing,
 * so that updates to the Path will only be made on attributes that specifically changed (and no change will be
 * necessary for an attribute that changed back to its original/currently-displayed value). Generally, this is used
 * for DOM and SVG drawables.
 *
 * This will mix in PaintableStatefulDrawable
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import inheritance from '../../../../phet-core/js/inheritance.js';
import memoize from '../../../../phet-core/js/memoize.js';
import { PaintableStatefulDrawable, scenery, SelfDrawable } from '../../imports.js';
const PathStatefulDrawable = memoize(type => {
  assert && assert(_.includes(inheritance(type), SelfDrawable));
  return class extends PaintableStatefulDrawable(type) {
    /**
     * @public
     * @override
     *
     * @param {number} renderer
     * @param {Instance} instance
     */
    initialize(renderer, instance, ...args) {
      super.initialize(renderer, instance, ...args);

      // @protected {boolean} - Flag marked as true if ANY of the drawable dirty flags are set (basically everything except for transforms, as we
      //                        need to accelerate the transform case.
      this.paintDirty = true;
      this.dirtyShape = true;
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
    markDirtyShape() {
      this.dirtyShape = true;
      this.markPaintDirty();
    }

    /**
     * Clears all of the dirty flags (after they have been checked), so that future mark* methods will be able to flag them again.
     * @public
     */
    setToCleanState() {
      this.paintDirty = false;
      this.dirtyShape = false;
    }
  };
});
scenery.register('PathStatefulDrawable', PathStatefulDrawable);
export default PathStatefulDrawable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpbmhlcml0YW5jZSIsIm1lbW9pemUiLCJQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlIiwic2NlbmVyeSIsIlNlbGZEcmF3YWJsZSIsIlBhdGhTdGF0ZWZ1bERyYXdhYmxlIiwidHlwZSIsImFzc2VydCIsIl8iLCJpbmNsdWRlcyIsImluaXRpYWxpemUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwiYXJncyIsInBhaW50RGlydHkiLCJkaXJ0eVNoYXBlIiwibWFya1BhaW50RGlydHkiLCJtYXJrRGlydHkiLCJtYXJrRGlydHlTaGFwZSIsInNldFRvQ2xlYW5TdGF0ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGF0aFN0YXRlZnVsRHJhd2FibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSB0cmFpdCBmb3IgZHJhd2FibGVzIGZvciBQYXRoIHRoYXQgbmVlZCB0byBzdG9yZSBzdGF0ZSBhYm91dCB3aGF0IHRoZSBjdXJyZW50IGRpc3BsYXkgaXMgY3VycmVudGx5IHNob3dpbmcsXHJcbiAqIHNvIHRoYXQgdXBkYXRlcyB0byB0aGUgUGF0aCB3aWxsIG9ubHkgYmUgbWFkZSBvbiBhdHRyaWJ1dGVzIHRoYXQgc3BlY2lmaWNhbGx5IGNoYW5nZWQgKGFuZCBubyBjaGFuZ2Ugd2lsbCBiZVxyXG4gKiBuZWNlc3NhcnkgZm9yIGFuIGF0dHJpYnV0ZSB0aGF0IGNoYW5nZWQgYmFjayB0byBpdHMgb3JpZ2luYWwvY3VycmVudGx5LWRpc3BsYXllZCB2YWx1ZSkuIEdlbmVyYWxseSwgdGhpcyBpcyB1c2VkXHJcbiAqIGZvciBET00gYW5kIFNWRyBkcmF3YWJsZXMuXHJcbiAqXHJcbiAqIFRoaXMgd2lsbCBtaXggaW4gUGFpbnRhYmxlU3RhdGVmdWxEcmF3YWJsZVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IGluaGVyaXRhbmNlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9pbmhlcml0YW5jZS5qcyc7XHJcbmltcG9ydCBtZW1vaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZW1vaXplLmpzJztcclxuaW1wb3J0IHsgUGFpbnRhYmxlU3RhdGVmdWxEcmF3YWJsZSwgc2NlbmVyeSwgU2VsZkRyYXdhYmxlIH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XHJcblxyXG5jb25zdCBQYXRoU3RhdGVmdWxEcmF3YWJsZSA9IG1lbW9pemUoIHR5cGUgPT4ge1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIGluaGVyaXRhbmNlKCB0eXBlICksIFNlbGZEcmF3YWJsZSApICk7XHJcblxyXG4gIHJldHVybiBjbGFzcyBleHRlbmRzIFBhaW50YWJsZVN0YXRlZnVsRHJhd2FibGUoIHR5cGUgKSB7XHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBvdmVycmlkZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxyXG4gICAgICogQHBhcmFtIHtJbnN0YW5jZX0gaW5zdGFuY2VcclxuICAgICAqL1xyXG4gICAgaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlLCAuLi5hcmdzICkge1xyXG4gICAgICBzdXBlci5pbml0aWFsaXplKCByZW5kZXJlciwgaW5zdGFuY2UsIC4uLmFyZ3MgKTtcclxuXHJcbiAgICAgIC8vIEBwcm90ZWN0ZWQge2Jvb2xlYW59IC0gRmxhZyBtYXJrZWQgYXMgdHJ1ZSBpZiBBTlkgb2YgdGhlIGRyYXdhYmxlIGRpcnR5IGZsYWdzIGFyZSBzZXQgKGJhc2ljYWxseSBldmVyeXRoaW5nIGV4Y2VwdCBmb3IgdHJhbnNmb3JtcywgYXMgd2VcclxuICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICBuZWVkIHRvIGFjY2VsZXJhdGUgdGhlIHRyYW5zZm9ybSBjYXNlLlxyXG4gICAgICB0aGlzLnBhaW50RGlydHkgPSB0cnVlO1xyXG4gICAgICB0aGlzLmRpcnR5U2hhcGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSBcImNhdGNoLWFsbFwiIGRpcnR5IG1ldGhvZCB0aGF0IGRpcmVjdGx5IG1hcmtzIHRoZSBwYWludERpcnR5IGZsYWcgYW5kIHRyaWdnZXJzIHByb3BhZ2F0aW9uIG9mIGRpcnR5XHJcbiAgICAgKiBpbmZvcm1hdGlvbi4gVGhpcyBjYW4gYmUgdXNlZCBieSBvdGhlciBtYXJrKiBtZXRob2RzLCBvciBkaXJlY3RseSBpdHNlbGYgaWYgdGhlIHBhaW50RGlydHkgZmxhZyBpcyBjaGVja2VkLlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEl0IHNob3VsZCBiZSBmaXJlZCAoaW5kaXJlY3RseSBvciBkaXJlY3RseSkgZm9yIGFueXRoaW5nIGJlc2lkZXMgdHJhbnNmb3JtcyB0aGF0IG5lZWRzIHRvIG1ha2UgYSBkcmF3YWJsZVxyXG4gICAgICogZGlydHkuXHJcbiAgICAgKi9cclxuICAgIG1hcmtQYWludERpcnR5KCkge1xyXG4gICAgICB0aGlzLnBhaW50RGlydHkgPSB0cnVlO1xyXG4gICAgICB0aGlzLm1hcmtEaXJ0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICovXHJcbiAgICBtYXJrRGlydHlTaGFwZSgpIHtcclxuICAgICAgdGhpcy5kaXJ0eVNoYXBlID0gdHJ1ZTtcclxuICAgICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xlYXJzIGFsbCBvZiB0aGUgZGlydHkgZmxhZ3MgKGFmdGVyIHRoZXkgaGF2ZSBiZWVuIGNoZWNrZWQpLCBzbyB0aGF0IGZ1dHVyZSBtYXJrKiBtZXRob2RzIHdpbGwgYmUgYWJsZSB0byBmbGFnIHRoZW0gYWdhaW4uXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIHNldFRvQ2xlYW5TdGF0ZSgpIHtcclxuICAgICAgdGhpcy5wYWludERpcnR5ID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuZGlydHlTaGFwZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH07XHJcbn0gKTtcclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdQYXRoU3RhdGVmdWxEcmF3YWJsZScsIFBhdGhTdGF0ZWZ1bERyYXdhYmxlICk7XHJcbmV4cG9ydCBkZWZhdWx0IFBhdGhTdGF0ZWZ1bERyYXdhYmxlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxPQUFPLE1BQU0scUNBQXFDO0FBQ3pELFNBQVNDLHlCQUF5QixFQUFFQyxPQUFPLEVBQUVDLFlBQVksUUFBUSxrQkFBa0I7QUFFbkYsTUFBTUMsb0JBQW9CLEdBQUdKLE9BQU8sQ0FBRUssSUFBSSxJQUFJO0VBQzVDQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUMsQ0FBQyxDQUFDQyxRQUFRLENBQUVULFdBQVcsQ0FBRU0sSUFBSyxDQUFDLEVBQUVGLFlBQWEsQ0FBRSxDQUFDO0VBRW5FLE9BQU8sY0FBY0YseUJBQXlCLENBQUVJLElBQUssQ0FBQyxDQUFDO0lBQ3JEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0lJLFVBQVVBLENBQUVDLFFBQVEsRUFBRUMsUUFBUSxFQUFFLEdBQUdDLElBQUksRUFBRztNQUN4QyxLQUFLLENBQUNILFVBQVUsQ0FBRUMsUUFBUSxFQUFFQyxRQUFRLEVBQUUsR0FBR0MsSUFBSyxDQUFDOztNQUUvQztNQUNBO01BQ0EsSUFBSSxDQUFDQyxVQUFVLEdBQUcsSUFBSTtNQUN0QixJQUFJLENBQUNDLFVBQVUsR0FBRyxJQUFJO0lBQ3hCOztJQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDSUMsY0FBY0EsQ0FBQSxFQUFHO01BQ2YsSUFBSSxDQUFDRixVQUFVLEdBQUcsSUFBSTtNQUN0QixJQUFJLENBQUNHLFNBQVMsQ0FBQyxDQUFDO0lBQ2xCOztJQUVBO0FBQ0o7QUFDQTtJQUNJQyxjQUFjQSxDQUFBLEVBQUc7TUFDZixJQUFJLENBQUNILFVBQVUsR0FBRyxJQUFJO01BQ3RCLElBQUksQ0FBQ0MsY0FBYyxDQUFDLENBQUM7SUFDdkI7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7SUFDSUcsZUFBZUEsQ0FBQSxFQUFHO01BQ2hCLElBQUksQ0FBQ0wsVUFBVSxHQUFHLEtBQUs7TUFDdkIsSUFBSSxDQUFDQyxVQUFVLEdBQUcsS0FBSztJQUN6QjtFQUNGLENBQUM7QUFDSCxDQUFFLENBQUM7QUFFSFosT0FBTyxDQUFDaUIsUUFBUSxDQUFFLHNCQUFzQixFQUFFZixvQkFBcUIsQ0FBQztBQUNoRSxlQUFlQSxvQkFBb0IifQ==