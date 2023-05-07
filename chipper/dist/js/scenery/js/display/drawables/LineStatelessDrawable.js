// Copyright 2016-2022, University of Colorado Boulder

/**
 * A trait for drawables for Line that does not store the line's state, as it just needs to track dirtyness overall.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import inheritance from '../../../../phet-core/js/inheritance.js';
import memoize from '../../../../phet-core/js/memoize.js';
import { PaintableStatelessDrawable, scenery, SelfDrawable } from '../../imports.js';
const LineStatelessDrawable = memoize(type => {
  assert && assert(_.includes(inheritance(type), SelfDrawable));
  return class extends PaintableStatelessDrawable(type) {
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
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyP1() {
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyP2() {
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyX1() {
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyY1() {
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyX2() {
      this.markPaintDirty();
    }

    /**
     * @public
     */
    markDirtyY2() {
      this.markPaintDirty();
    }
  };
});
scenery.register('LineStatelessDrawable', LineStatelessDrawable);
export default LineStatelessDrawable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpbmhlcml0YW5jZSIsIm1lbW9pemUiLCJQYWludGFibGVTdGF0ZWxlc3NEcmF3YWJsZSIsInNjZW5lcnkiLCJTZWxmRHJhd2FibGUiLCJMaW5lU3RhdGVsZXNzRHJhd2FibGUiLCJ0eXBlIiwiYXNzZXJ0IiwiXyIsImluY2x1ZGVzIiwiaW5pdGlhbGl6ZSIsInJlbmRlcmVyIiwiaW5zdGFuY2UiLCJhcmdzIiwicGFpbnREaXJ0eSIsIm1hcmtQYWludERpcnR5IiwibWFya0RpcnR5IiwibWFya0RpcnR5TGluZSIsIm1hcmtEaXJ0eVAxIiwibWFya0RpcnR5UDIiLCJtYXJrRGlydHlYMSIsIm1hcmtEaXJ0eVkxIiwibWFya0RpcnR5WDIiLCJtYXJrRGlydHlZMiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTGluZVN0YXRlbGVzc0RyYXdhYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgdHJhaXQgZm9yIGRyYXdhYmxlcyBmb3IgTGluZSB0aGF0IGRvZXMgbm90IHN0b3JlIHRoZSBsaW5lJ3Mgc3RhdGUsIGFzIGl0IGp1c3QgbmVlZHMgdG8gdHJhY2sgZGlydHluZXNzIG92ZXJhbGwuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgaW5oZXJpdGFuY2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL2luaGVyaXRhbmNlLmpzJztcclxuaW1wb3J0IG1lbW9pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lbW9pemUuanMnO1xyXG5pbXBvcnQgeyBQYWludGFibGVTdGF0ZWxlc3NEcmF3YWJsZSwgc2NlbmVyeSwgU2VsZkRyYXdhYmxlIH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XHJcblxyXG5jb25zdCBMaW5lU3RhdGVsZXNzRHJhd2FibGUgPSBtZW1vaXplKCB0eXBlID0+IHtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCBpbmhlcml0YW5jZSggdHlwZSApLCBTZWxmRHJhd2FibGUgKSApO1xyXG5cclxuICByZXR1cm4gY2xhc3MgZXh0ZW5kcyBQYWludGFibGVTdGF0ZWxlc3NEcmF3YWJsZSggdHlwZSApIHtcclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG92ZXJyaWRlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyXHJcbiAgICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxyXG4gICAgICovXHJcbiAgICBpbml0aWFsaXplKCByZW5kZXJlciwgaW5zdGFuY2UsIC4uLmFyZ3MgKSB7XHJcbiAgICAgIHN1cGVyLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgLi4uYXJncyApO1xyXG5cclxuICAgICAgLy8gQHByb3RlY3RlZCB7Ym9vbGVhbn0gLSBGbGFnIG1hcmtlZCBhcyB0cnVlIGlmIEFOWSBvZiB0aGUgZHJhd2FibGUgZGlydHkgZmxhZ3MgYXJlIHNldCAoYmFzaWNhbGx5IGV2ZXJ5dGhpbmcgZXhjZXB0IGZvciB0cmFuc2Zvcm1zLCBhcyB3ZVxyXG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgIG5lZWQgdG8gYWNjZWxlcmF0ZSB0aGUgdHJhbnNmb3JtIGNhc2UuXHJcbiAgICAgIHRoaXMucGFpbnREaXJ0eSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIFwiY2F0Y2gtYWxsXCIgZGlydHkgbWV0aG9kIHRoYXQgZGlyZWN0bHkgbWFya3MgdGhlIHBhaW50RGlydHkgZmxhZyBhbmQgdHJpZ2dlcnMgcHJvcGFnYXRpb24gb2YgZGlydHlcclxuICAgICAqIGluZm9ybWF0aW9uLiBUaGlzIGNhbiBiZSB1c2VkIGJ5IG90aGVyIG1hcmsqIG1ldGhvZHMsIG9yIGRpcmVjdGx5IGl0c2VsZiBpZiB0aGUgcGFpbnREaXJ0eSBmbGFnIGlzIGNoZWNrZWQuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogSXQgc2hvdWxkIGJlIGZpcmVkIChpbmRpcmVjdGx5IG9yIGRpcmVjdGx5KSBmb3IgYW55dGhpbmcgYmVzaWRlcyB0cmFuc2Zvcm1zIHRoYXQgbmVlZHMgdG8gbWFrZSBhIGRyYXdhYmxlXHJcbiAgICAgKiBkaXJ0eS5cclxuICAgICAqL1xyXG4gICAgbWFya1BhaW50RGlydHkoKSB7XHJcbiAgICAgIHRoaXMucGFpbnREaXJ0eSA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya0RpcnR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIG1hcmtEaXJ0eUxpbmUoKSB7XHJcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgbWFya0RpcnR5UDEoKSB7XHJcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgbWFya0RpcnR5UDIoKSB7XHJcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgbWFya0RpcnR5WDEoKSB7XHJcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgbWFya0RpcnR5WTEoKSB7XHJcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgbWFya0RpcnR5WDIoKSB7XHJcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgbWFya0RpcnR5WTIoKSB7XHJcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcclxuICAgIH1cclxuICB9O1xyXG59ICk7XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnTGluZVN0YXRlbGVzc0RyYXdhYmxlJywgTGluZVN0YXRlbGVzc0RyYXdhYmxlICk7XHJcbmV4cG9ydCBkZWZhdWx0IExpbmVTdGF0ZWxlc3NEcmF3YWJsZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxPQUFPLE1BQU0scUNBQXFDO0FBQ3pELFNBQVNDLDBCQUEwQixFQUFFQyxPQUFPLEVBQUVDLFlBQVksUUFBUSxrQkFBa0I7QUFFcEYsTUFBTUMscUJBQXFCLEdBQUdKLE9BQU8sQ0FBRUssSUFBSSxJQUFJO0VBQzdDQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUMsQ0FBQyxDQUFDQyxRQUFRLENBQUVULFdBQVcsQ0FBRU0sSUFBSyxDQUFDLEVBQUVGLFlBQWEsQ0FBRSxDQUFDO0VBRW5FLE9BQU8sY0FBY0YsMEJBQTBCLENBQUVJLElBQUssQ0FBQyxDQUFDO0lBQ3REO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0lJLFVBQVVBLENBQUVDLFFBQVEsRUFBRUMsUUFBUSxFQUFFLEdBQUdDLElBQUksRUFBRztNQUN4QyxLQUFLLENBQUNILFVBQVUsQ0FBRUMsUUFBUSxFQUFFQyxRQUFRLEVBQUUsR0FBR0MsSUFBSyxDQUFDOztNQUUvQztNQUNBO01BQ0EsSUFBSSxDQUFDQyxVQUFVLEdBQUcsSUFBSTtJQUN4Qjs7SUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0lDLGNBQWNBLENBQUEsRUFBRztNQUNmLElBQUksQ0FBQ0QsVUFBVSxHQUFHLElBQUk7TUFDdEIsSUFBSSxDQUFDRSxTQUFTLENBQUMsQ0FBQztJQUNsQjs7SUFFQTtBQUNKO0FBQ0E7SUFDSUMsYUFBYUEsQ0FBQSxFQUFHO01BQ2QsSUFBSSxDQUFDRixjQUFjLENBQUMsQ0FBQztJQUN2Qjs7SUFFQTtBQUNKO0FBQ0E7SUFDSUcsV0FBV0EsQ0FBQSxFQUFHO01BQ1osSUFBSSxDQUFDSCxjQUFjLENBQUMsQ0FBQztJQUN2Qjs7SUFFQTtBQUNKO0FBQ0E7SUFDSUksV0FBV0EsQ0FBQSxFQUFHO01BQ1osSUFBSSxDQUFDSixjQUFjLENBQUMsQ0FBQztJQUN2Qjs7SUFFQTtBQUNKO0FBQ0E7SUFDSUssV0FBV0EsQ0FBQSxFQUFHO01BQ1osSUFBSSxDQUFDTCxjQUFjLENBQUMsQ0FBQztJQUN2Qjs7SUFFQTtBQUNKO0FBQ0E7SUFDSU0sV0FBV0EsQ0FBQSxFQUFHO01BQ1osSUFBSSxDQUFDTixjQUFjLENBQUMsQ0FBQztJQUN2Qjs7SUFFQTtBQUNKO0FBQ0E7SUFDSU8sV0FBV0EsQ0FBQSxFQUFHO01BQ1osSUFBSSxDQUFDUCxjQUFjLENBQUMsQ0FBQztJQUN2Qjs7SUFFQTtBQUNKO0FBQ0E7SUFDSVEsV0FBV0EsQ0FBQSxFQUFHO01BQ1osSUFBSSxDQUFDUixjQUFjLENBQUMsQ0FBQztJQUN2QjtFQUNGLENBQUM7QUFDSCxDQUFFLENBQUM7QUFFSFosT0FBTyxDQUFDcUIsUUFBUSxDQUFFLHVCQUF1QixFQUFFbkIscUJBQXNCLENBQUM7QUFDbEUsZUFBZUEscUJBQXFCIn0=