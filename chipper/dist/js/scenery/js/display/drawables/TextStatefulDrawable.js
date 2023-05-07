// Copyright 2016-2022, University of Colorado Boulder

/**
 * A trait for drawables for Text that need to store state about what the current display is currently showing,
 * so that updates to the Text will only be made on attributes that specifically changed (and no change will be
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
const TextStatefulDrawable = memoize(type => {
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
      this.dirtyText = true;
      this.dirtyFont = true;
      this.dirtyBounds = true;
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
    markDirtyText() {
      this.dirtyText = true;
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyFont() {
      this.dirtyFont = true;
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyBounds() {
      this.dirtyBounds = true;
      this.markPaintDirty();
    }

    /**
     * Clears all of the dirty flags (after they have been checked), so that future mark* methods will be able to flag
     * them again.
     * @public
     */
    setToCleanState() {
      this.paintDirty = false;
      this.dirtyText = false;
      this.dirtyFont = false;
      this.dirtyBounds = false;
    }
  };
});
scenery.register('TextStatefulDrawable', TextStatefulDrawable);
export default TextStatefulDrawable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpbmhlcml0YW5jZSIsIm1lbW9pemUiLCJQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlIiwic2NlbmVyeSIsIlNlbGZEcmF3YWJsZSIsIlRleHRTdGF0ZWZ1bERyYXdhYmxlIiwidHlwZSIsImFzc2VydCIsIl8iLCJpbmNsdWRlcyIsImluaXRpYWxpemUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwiYXJncyIsInBhaW50RGlydHkiLCJkaXJ0eVRleHQiLCJkaXJ0eUZvbnQiLCJkaXJ0eUJvdW5kcyIsIm1hcmtQYWludERpcnR5IiwibWFya0RpcnR5IiwibWFya0RpcnR5VGV4dCIsIm1hcmtEaXJ0eUZvbnQiLCJtYXJrRGlydHlCb3VuZHMiLCJzZXRUb0NsZWFuU3RhdGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRleHRTdGF0ZWZ1bERyYXdhYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgdHJhaXQgZm9yIGRyYXdhYmxlcyBmb3IgVGV4dCB0aGF0IG5lZWQgdG8gc3RvcmUgc3RhdGUgYWJvdXQgd2hhdCB0aGUgY3VycmVudCBkaXNwbGF5IGlzIGN1cnJlbnRseSBzaG93aW5nLFxyXG4gKiBzbyB0aGF0IHVwZGF0ZXMgdG8gdGhlIFRleHQgd2lsbCBvbmx5IGJlIG1hZGUgb24gYXR0cmlidXRlcyB0aGF0IHNwZWNpZmljYWxseSBjaGFuZ2VkIChhbmQgbm8gY2hhbmdlIHdpbGwgYmVcclxuICogbmVjZXNzYXJ5IGZvciBhbiBhdHRyaWJ1dGUgdGhhdCBjaGFuZ2VkIGJhY2sgdG8gaXRzIG9yaWdpbmFsL2N1cnJlbnRseS1kaXNwbGF5ZWQgdmFsdWUpLiBHZW5lcmFsbHksIHRoaXMgaXMgdXNlZFxyXG4gKiBmb3IgRE9NIGFuZCBTVkcgZHJhd2FibGVzLlxyXG4gKlxyXG4gKiBUaGlzIHdpbGwgYWxzbyBtaXggaW4gUGFpbnRhYmxlU3RhdGVmdWxEcmF3YWJsZVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IGluaGVyaXRhbmNlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9pbmhlcml0YW5jZS5qcyc7XHJcbmltcG9ydCBtZW1vaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZW1vaXplLmpzJztcclxuaW1wb3J0IHsgUGFpbnRhYmxlU3RhdGVmdWxEcmF3YWJsZSwgc2NlbmVyeSwgU2VsZkRyYXdhYmxlIH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XHJcblxyXG5jb25zdCBUZXh0U3RhdGVmdWxEcmF3YWJsZSA9IG1lbW9pemUoIHR5cGUgPT4ge1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIGluaGVyaXRhbmNlKCB0eXBlICksIFNlbGZEcmF3YWJsZSApICk7XHJcblxyXG4gIHJldHVybiBjbGFzcyBleHRlbmRzIFBhaW50YWJsZVN0YXRlZnVsRHJhd2FibGUoIHR5cGUgKSB7XHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBvdmVycmlkZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlciAtIFJlbmRlcmVyIGJpdG1hc2ssIHNlZSBSZW5kZXJlcidzIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgZGV0YWlscy5cclxuICAgICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXHJcbiAgICAgKi9cclxuICAgIGluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgLi4uYXJncyApIHtcclxuICAgICAgc3VwZXIuaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlLCAuLi5hcmdzICk7XHJcblxyXG4gICAgICAvLyBAcHJvdGVjdGVkIHtib29sZWFufSAtIEZsYWcgbWFya2VkIGFzIHRydWUgaWYgQU5ZIG9mIHRoZSBkcmF3YWJsZSBkaXJ0eSBmbGFncyBhcmUgc2V0IChiYXNpY2FsbHkgZXZlcnl0aGluZyBleGNlcHQgZm9yIHRyYW5zZm9ybXMsIGFzIHdlXHJcbiAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgbmVlZCB0byBhY2NlbGVyYXRlIHRoZSB0cmFuc2Zvcm0gY2FzZS5cclxuICAgICAgdGhpcy5wYWludERpcnR5ID0gdHJ1ZTtcclxuICAgICAgdGhpcy5kaXJ0eVRleHQgPSB0cnVlO1xyXG4gICAgICB0aGlzLmRpcnR5Rm9udCA9IHRydWU7XHJcbiAgICAgIHRoaXMuZGlydHlCb3VuZHMgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSBcImNhdGNoLWFsbFwiIGRpcnR5IG1ldGhvZCB0aGF0IGRpcmVjdGx5IG1hcmtzIHRoZSBwYWludERpcnR5IGZsYWcgYW5kIHRyaWdnZXJzIHByb3BhZ2F0aW9uIG9mIGRpcnR5XHJcbiAgICAgKiBpbmZvcm1hdGlvbi4gVGhpcyBjYW4gYmUgdXNlZCBieSBvdGhlciBtYXJrKiBtZXRob2RzLCBvciBkaXJlY3RseSBpdHNlbGYgaWYgdGhlIHBhaW50RGlydHkgZmxhZyBpcyBjaGVja2VkLlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEl0IHNob3VsZCBiZSBmaXJlZCAoaW5kaXJlY3RseSBvciBkaXJlY3RseSkgZm9yIGFueXRoaW5nIGJlc2lkZXMgdHJhbnNmb3JtcyB0aGF0IG5lZWRzIHRvIG1ha2UgYSBkcmF3YWJsZVxyXG4gICAgICogZGlydHkuXHJcbiAgICAgKi9cclxuICAgIG1hcmtQYWludERpcnR5KCkge1xyXG4gICAgICB0aGlzLnBhaW50RGlydHkgPSB0cnVlO1xyXG4gICAgICB0aGlzLm1hcmtEaXJ0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICovXHJcbiAgICBtYXJrRGlydHlUZXh0KCkge1xyXG4gICAgICB0aGlzLmRpcnR5VGV4dCA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgbWFya0RpcnR5Rm9udCgpIHtcclxuICAgICAgdGhpcy5kaXJ0eUZvbnQgPSB0cnVlO1xyXG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIG1hcmtEaXJ0eUJvdW5kcygpIHtcclxuICAgICAgdGhpcy5kaXJ0eUJvdW5kcyA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsZWFycyBhbGwgb2YgdGhlIGRpcnR5IGZsYWdzIChhZnRlciB0aGV5IGhhdmUgYmVlbiBjaGVja2VkKSwgc28gdGhhdCBmdXR1cmUgbWFyayogbWV0aG9kcyB3aWxsIGJlIGFibGUgdG8gZmxhZ1xyXG4gICAgICogdGhlbSBhZ2Fpbi5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgc2V0VG9DbGVhblN0YXRlKCkge1xyXG4gICAgICB0aGlzLnBhaW50RGlydHkgPSBmYWxzZTtcclxuICAgICAgdGhpcy5kaXJ0eVRleHQgPSBmYWxzZTtcclxuICAgICAgdGhpcy5kaXJ0eUZvbnQgPSBmYWxzZTtcclxuICAgICAgdGhpcy5kaXJ0eUJvdW5kcyA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH07XHJcbn0gKTtcclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdUZXh0U3RhdGVmdWxEcmF3YWJsZScsIFRleHRTdGF0ZWZ1bERyYXdhYmxlICk7XHJcbmV4cG9ydCBkZWZhdWx0IFRleHRTdGF0ZWZ1bERyYXdhYmxlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxPQUFPLE1BQU0scUNBQXFDO0FBQ3pELFNBQVNDLHlCQUF5QixFQUFFQyxPQUFPLEVBQUVDLFlBQVksUUFBUSxrQkFBa0I7QUFFbkYsTUFBTUMsb0JBQW9CLEdBQUdKLE9BQU8sQ0FBRUssSUFBSSxJQUFJO0VBQzVDQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUMsQ0FBQyxDQUFDQyxRQUFRLENBQUVULFdBQVcsQ0FBRU0sSUFBSyxDQUFDLEVBQUVGLFlBQWEsQ0FBRSxDQUFDO0VBRW5FLE9BQU8sY0FBY0YseUJBQXlCLENBQUVJLElBQUssQ0FBQyxDQUFDO0lBQ3JEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0lJLFVBQVVBLENBQUVDLFFBQVEsRUFBRUMsUUFBUSxFQUFFLEdBQUdDLElBQUksRUFBRztNQUN4QyxLQUFLLENBQUNILFVBQVUsQ0FBRUMsUUFBUSxFQUFFQyxRQUFRLEVBQUUsR0FBR0MsSUFBSyxDQUFDOztNQUUvQztNQUNBO01BQ0EsSUFBSSxDQUFDQyxVQUFVLEdBQUcsSUFBSTtNQUN0QixJQUFJLENBQUNDLFNBQVMsR0FBRyxJQUFJO01BQ3JCLElBQUksQ0FBQ0MsU0FBUyxHQUFHLElBQUk7TUFDckIsSUFBSSxDQUFDQyxXQUFXLEdBQUcsSUFBSTtJQUN6Qjs7SUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0lDLGNBQWNBLENBQUEsRUFBRztNQUNmLElBQUksQ0FBQ0osVUFBVSxHQUFHLElBQUk7TUFDdEIsSUFBSSxDQUFDSyxTQUFTLENBQUMsQ0FBQztJQUNsQjs7SUFFQTtBQUNKO0FBQ0E7SUFDSUMsYUFBYUEsQ0FBQSxFQUFHO01BQ2QsSUFBSSxDQUFDTCxTQUFTLEdBQUcsSUFBSTtNQUNyQixJQUFJLENBQUNHLGNBQWMsQ0FBQyxDQUFDO0lBQ3ZCOztJQUVBO0FBQ0o7QUFDQTtJQUNJRyxhQUFhQSxDQUFBLEVBQUc7TUFDZCxJQUFJLENBQUNMLFNBQVMsR0FBRyxJQUFJO01BQ3JCLElBQUksQ0FBQ0UsY0FBYyxDQUFDLENBQUM7SUFDdkI7O0lBRUE7QUFDSjtBQUNBO0lBQ0lJLGVBQWVBLENBQUEsRUFBRztNQUNoQixJQUFJLENBQUNMLFdBQVcsR0FBRyxJQUFJO01BQ3ZCLElBQUksQ0FBQ0MsY0FBYyxDQUFDLENBQUM7SUFDdkI7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtJQUNJSyxlQUFlQSxDQUFBLEVBQUc7TUFDaEIsSUFBSSxDQUFDVCxVQUFVLEdBQUcsS0FBSztNQUN2QixJQUFJLENBQUNDLFNBQVMsR0FBRyxLQUFLO01BQ3RCLElBQUksQ0FBQ0MsU0FBUyxHQUFHLEtBQUs7TUFDdEIsSUFBSSxDQUFDQyxXQUFXLEdBQUcsS0FBSztJQUMxQjtFQUNGLENBQUM7QUFDSCxDQUFFLENBQUM7QUFFSGQsT0FBTyxDQUFDcUIsUUFBUSxDQUFFLHNCQUFzQixFQUFFbkIsb0JBQXFCLENBQUM7QUFDaEUsZUFBZUEsb0JBQW9CIn0=