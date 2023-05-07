// Copyright 2016-2021, University of Colorado Boulder

/**
 * A trait for drawables for Image that need to store state about what the current display is currently showing,
 * so that updates to the Image will only be made on attributes that specifically changed (and no change will be
 * necessary for an attribute that changed back to its original/currently-displayed value). Generally, this is used
 * for DOM and SVG drawables.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import inheritance from '../../../../phet-core/js/inheritance.js';
import memoize from '../../../../phet-core/js/memoize.js';
import { scenery, SelfDrawable } from '../../imports.js';
const ImageStatefulDrawable = memoize(type => {
  assert && assert(_.includes(inheritance(type), SelfDrawable));
  return class extends type {
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
      this.dirtyImage = true;
      this.dirtyImageOpacity = true;
      this.dirtyMipmap = true;
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
    markDirtyImage() {
      this.dirtyImage = true;
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyImageOpacity() {
      this.dirtyImageOpacity = true;
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyMipmap() {
      this.dirtyMipmap = true;
      this.markPaintDirty();
    }

    /**
     * Clears all of the dirty flags (after they have been checked), so that future mark* methods will be able to flag them again.
     * @public
     */
    setToCleanState() {
      this.paintDirty = false;
      this.dirtyImage = false;
      this.dirtyImageOpacity = false;
      this.dirtyMipmap = false;
    }
  };
});
scenery.register('ImageStatefulDrawable', ImageStatefulDrawable);
export default ImageStatefulDrawable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpbmhlcml0YW5jZSIsIm1lbW9pemUiLCJzY2VuZXJ5IiwiU2VsZkRyYXdhYmxlIiwiSW1hZ2VTdGF0ZWZ1bERyYXdhYmxlIiwidHlwZSIsImFzc2VydCIsIl8iLCJpbmNsdWRlcyIsImluaXRpYWxpemUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwiYXJncyIsInBhaW50RGlydHkiLCJkaXJ0eUltYWdlIiwiZGlydHlJbWFnZU9wYWNpdHkiLCJkaXJ0eU1pcG1hcCIsIm1hcmtQYWludERpcnR5IiwibWFya0RpcnR5IiwibWFya0RpcnR5SW1hZ2UiLCJtYXJrRGlydHlJbWFnZU9wYWNpdHkiLCJtYXJrRGlydHlNaXBtYXAiLCJzZXRUb0NsZWFuU3RhdGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkltYWdlU3RhdGVmdWxEcmF3YWJsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIHRyYWl0IGZvciBkcmF3YWJsZXMgZm9yIEltYWdlIHRoYXQgbmVlZCB0byBzdG9yZSBzdGF0ZSBhYm91dCB3aGF0IHRoZSBjdXJyZW50IGRpc3BsYXkgaXMgY3VycmVudGx5IHNob3dpbmcsXHJcbiAqIHNvIHRoYXQgdXBkYXRlcyB0byB0aGUgSW1hZ2Ugd2lsbCBvbmx5IGJlIG1hZGUgb24gYXR0cmlidXRlcyB0aGF0IHNwZWNpZmljYWxseSBjaGFuZ2VkIChhbmQgbm8gY2hhbmdlIHdpbGwgYmVcclxuICogbmVjZXNzYXJ5IGZvciBhbiBhdHRyaWJ1dGUgdGhhdCBjaGFuZ2VkIGJhY2sgdG8gaXRzIG9yaWdpbmFsL2N1cnJlbnRseS1kaXNwbGF5ZWQgdmFsdWUpLiBHZW5lcmFsbHksIHRoaXMgaXMgdXNlZFxyXG4gKiBmb3IgRE9NIGFuZCBTVkcgZHJhd2FibGVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IGluaGVyaXRhbmNlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9pbmhlcml0YW5jZS5qcyc7XHJcbmltcG9ydCBtZW1vaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZW1vaXplLmpzJztcclxuaW1wb3J0IHsgc2NlbmVyeSwgU2VsZkRyYXdhYmxlIH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XHJcblxyXG5jb25zdCBJbWFnZVN0YXRlZnVsRHJhd2FibGUgPSBtZW1vaXplKCB0eXBlID0+IHtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCBpbmhlcml0YW5jZSggdHlwZSApLCBTZWxmRHJhd2FibGUgKSApO1xyXG5cclxuICByZXR1cm4gY2xhc3MgZXh0ZW5kcyB0eXBlIHtcclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG92ZXJyaWRlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyIC0gUmVuZGVyZXIgYml0bWFzaywgc2VlIFJlbmRlcmVyJ3MgZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBkZXRhaWxzLlxyXG4gICAgICogQHBhcmFtIHtJbnN0YW5jZX0gaW5zdGFuY2VcclxuICAgICAqL1xyXG4gICAgaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlLCAuLi5hcmdzICkge1xyXG4gICAgICBzdXBlci5pbml0aWFsaXplKCByZW5kZXJlciwgaW5zdGFuY2UsIC4uLmFyZ3MgKTtcclxuXHJcbiAgICAgIC8vIEBwcm90ZWN0ZWQge2Jvb2xlYW59IC0gRmxhZyBtYXJrZWQgYXMgdHJ1ZSBpZiBBTlkgb2YgdGhlIGRyYXdhYmxlIGRpcnR5IGZsYWdzIGFyZSBzZXQgKGJhc2ljYWxseSBldmVyeXRoaW5nIGV4Y2VwdCBmb3IgdHJhbnNmb3JtcywgYXMgd2VcclxuICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICBuZWVkIHRvIGFjY2VsZXJhdGUgdGhlIHRyYW5zZm9ybSBjYXNlLlxyXG4gICAgICB0aGlzLnBhaW50RGlydHkgPSB0cnVlO1xyXG4gICAgICB0aGlzLmRpcnR5SW1hZ2UgPSB0cnVlO1xyXG4gICAgICB0aGlzLmRpcnR5SW1hZ2VPcGFjaXR5ID0gdHJ1ZTtcclxuICAgICAgdGhpcy5kaXJ0eU1pcG1hcCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIFwiY2F0Y2gtYWxsXCIgZGlydHkgbWV0aG9kIHRoYXQgZGlyZWN0bHkgbWFya3MgdGhlIHBhaW50RGlydHkgZmxhZyBhbmQgdHJpZ2dlcnMgcHJvcGFnYXRpb24gb2YgZGlydHlcclxuICAgICAqIGluZm9ybWF0aW9uLiBUaGlzIGNhbiBiZSB1c2VkIGJ5IG90aGVyIG1hcmsqIG1ldGhvZHMsIG9yIGRpcmVjdGx5IGl0c2VsZiBpZiB0aGUgcGFpbnREaXJ0eSBmbGFnIGlzIGNoZWNrZWQuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogSXQgc2hvdWxkIGJlIGZpcmVkIChpbmRpcmVjdGx5IG9yIGRpcmVjdGx5KSBmb3IgYW55dGhpbmcgYmVzaWRlcyB0cmFuc2Zvcm1zIHRoYXQgbmVlZHMgdG8gbWFrZSBhIGRyYXdhYmxlXHJcbiAgICAgKiBkaXJ0eS5cclxuICAgICAqL1xyXG4gICAgbWFya1BhaW50RGlydHkoKSB7XHJcbiAgICAgIHRoaXMucGFpbnREaXJ0eSA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya0RpcnR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIG1hcmtEaXJ0eUltYWdlKCkge1xyXG4gICAgICB0aGlzLmRpcnR5SW1hZ2UgPSB0cnVlO1xyXG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIG1hcmtEaXJ0eUltYWdlT3BhY2l0eSgpIHtcclxuICAgICAgdGhpcy5kaXJ0eUltYWdlT3BhY2l0eSA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgbWFya0RpcnR5TWlwbWFwKCkge1xyXG4gICAgICB0aGlzLmRpcnR5TWlwbWFwID0gdHJ1ZTtcclxuICAgICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xlYXJzIGFsbCBvZiB0aGUgZGlydHkgZmxhZ3MgKGFmdGVyIHRoZXkgaGF2ZSBiZWVuIGNoZWNrZWQpLCBzbyB0aGF0IGZ1dHVyZSBtYXJrKiBtZXRob2RzIHdpbGwgYmUgYWJsZSB0byBmbGFnIHRoZW0gYWdhaW4uXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIHNldFRvQ2xlYW5TdGF0ZSgpIHtcclxuICAgICAgdGhpcy5wYWludERpcnR5ID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuZGlydHlJbWFnZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmRpcnR5SW1hZ2VPcGFjaXR5ID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuZGlydHlNaXBtYXAgPSBmYWxzZTtcclxuICAgIH1cclxuICB9O1xyXG59ICk7XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnSW1hZ2VTdGF0ZWZ1bERyYXdhYmxlJywgSW1hZ2VTdGF0ZWZ1bERyYXdhYmxlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBJbWFnZVN0YXRlZnVsRHJhd2FibGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsT0FBT0MsT0FBTyxNQUFNLHFDQUFxQztBQUN6RCxTQUFTQyxPQUFPLEVBQUVDLFlBQVksUUFBUSxrQkFBa0I7QUFFeEQsTUFBTUMscUJBQXFCLEdBQUdILE9BQU8sQ0FBRUksSUFBSSxJQUFJO0VBQzdDQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUMsQ0FBQyxDQUFDQyxRQUFRLENBQUVSLFdBQVcsQ0FBRUssSUFBSyxDQUFDLEVBQUVGLFlBQWEsQ0FBRSxDQUFDO0VBRW5FLE9BQU8sY0FBY0UsSUFBSSxDQUFDO0lBQ3hCO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0lJLFVBQVVBLENBQUVDLFFBQVEsRUFBRUMsUUFBUSxFQUFFLEdBQUdDLElBQUksRUFBRztNQUN4QyxLQUFLLENBQUNILFVBQVUsQ0FBRUMsUUFBUSxFQUFFQyxRQUFRLEVBQUUsR0FBR0MsSUFBSyxDQUFDOztNQUUvQztNQUNBO01BQ0EsSUFBSSxDQUFDQyxVQUFVLEdBQUcsSUFBSTtNQUN0QixJQUFJLENBQUNDLFVBQVUsR0FBRyxJQUFJO01BQ3RCLElBQUksQ0FBQ0MsaUJBQWlCLEdBQUcsSUFBSTtNQUM3QixJQUFJLENBQUNDLFdBQVcsR0FBRyxJQUFJO0lBQ3pCOztJQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDSUMsY0FBY0EsQ0FBQSxFQUFHO01BQ2YsSUFBSSxDQUFDSixVQUFVLEdBQUcsSUFBSTtNQUN0QixJQUFJLENBQUNLLFNBQVMsQ0FBQyxDQUFDO0lBQ2xCOztJQUVBO0FBQ0o7QUFDQTtJQUNJQyxjQUFjQSxDQUFBLEVBQUc7TUFDZixJQUFJLENBQUNMLFVBQVUsR0FBRyxJQUFJO01BQ3RCLElBQUksQ0FBQ0csY0FBYyxDQUFDLENBQUM7SUFDdkI7O0lBRUE7QUFDSjtBQUNBO0lBQ0lHLHFCQUFxQkEsQ0FBQSxFQUFHO01BQ3RCLElBQUksQ0FBQ0wsaUJBQWlCLEdBQUcsSUFBSTtNQUM3QixJQUFJLENBQUNFLGNBQWMsQ0FBQyxDQUFDO0lBQ3ZCOztJQUVBO0FBQ0o7QUFDQTtJQUNJSSxlQUFlQSxDQUFBLEVBQUc7TUFDaEIsSUFBSSxDQUFDTCxXQUFXLEdBQUcsSUFBSTtNQUN2QixJQUFJLENBQUNDLGNBQWMsQ0FBQyxDQUFDO0lBQ3ZCOztJQUVBO0FBQ0o7QUFDQTtBQUNBO0lBQ0lLLGVBQWVBLENBQUEsRUFBRztNQUNoQixJQUFJLENBQUNULFVBQVUsR0FBRyxLQUFLO01BQ3ZCLElBQUksQ0FBQ0MsVUFBVSxHQUFHLEtBQUs7TUFDdkIsSUFBSSxDQUFDQyxpQkFBaUIsR0FBRyxLQUFLO01BQzlCLElBQUksQ0FBQ0MsV0FBVyxHQUFHLEtBQUs7SUFDMUI7RUFDRixDQUFDO0FBQ0gsQ0FBRSxDQUFDO0FBRUhkLE9BQU8sQ0FBQ3FCLFFBQVEsQ0FBRSx1QkFBdUIsRUFBRW5CLHFCQUFzQixDQUFDO0FBRWxFLGVBQWVBLHFCQUFxQiJ9