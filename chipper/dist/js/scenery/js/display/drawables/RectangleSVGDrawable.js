// Copyright 2016-2022, University of Colorado Boulder

/**
 * SVG drawable for Rectangle nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Poolable from '../../../../phet-core/js/Poolable.js';
import { RectangleStatefulDrawable, scenery, svgns, SVGSelfDrawable } from '../../imports.js';

// TODO: change this based on memory and performance characteristics of the platform
const keepSVGRectangleElements = true; // whether we should pool SVG elements for the SVG rendering states, or whether we should free them when possible for memory

class RectangleSVGDrawable extends RectangleStatefulDrawable(SVGSelfDrawable) {
  /**
   * @public
   * @override
   *
   * @param {number} renderer
   * @param {Instance} instance
   */
  initialize(renderer, instance) {
    super.initialize(renderer, instance, true, keepSVGRectangleElements); // usesPaint: true

    this.lastArcW = -1; // invalid on purpose
    this.lastArcH = -1; // invalid on purpose

    // @protected {SVGRectElement} - Sole SVG element for this drawable, implementing API for SVGSelfDrawable
    this.svgElement = this.svgElement || document.createElementNS(svgns, 'rect');
  }

  /**
   * Updates the SVG elements so that they will appear like the current node's representation.
   * @protected
   *
   * Implements the interface for SVGSelfDrawable (and is called from the SVGSelfDrawable's update).
   */
  updateSVGSelf() {
    const rect = this.svgElement;
    if (this.dirtyX) {
      rect.setAttribute('x', this.node._rectX);
    }
    if (this.dirtyY) {
      rect.setAttribute('y', this.node._rectY);
    }
    if (this.dirtyWidth) {
      rect.setAttribute('width', this.node._rectWidth);
    }
    if (this.dirtyHeight) {
      rect.setAttribute('height', this.node._rectHeight);
    }
    if (this.dirtyCornerXRadius || this.dirtyCornerYRadius || this.dirtyWidth || this.dirtyHeight) {
      let arcw = 0;
      let arch = 0;

      // workaround for various browsers if rx=20, ry=0 (behavior is inconsistent, either identical to rx=20,ry=20, rx=0,ry=0. We'll treat it as rx=0,ry=0)
      // see https://github.com/phetsims/scenery/issues/183
      if (this.node.isRounded()) {
        const maximumArcSize = this.node.getMaximumArcSize();
        arcw = Math.min(this.node._cornerXRadius, maximumArcSize);
        arch = Math.min(this.node._cornerYRadius, maximumArcSize);
      }
      if (arcw !== this.lastArcW) {
        this.lastArcW = arcw;
        rect.setAttribute('rx', arcw);
      }
      if (arch !== this.lastArcH) {
        this.lastArcH = arch;
        rect.setAttribute('ry', arch);
      }
    }

    // Apply any fill/stroke changes to our element.
    this.updateFillStrokeStyle(rect);
  }
}
scenery.register('RectangleSVGDrawable', RectangleSVGDrawable);
Poolable.mixInto(RectangleSVGDrawable);
export default RectangleSVGDrawable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQb29sYWJsZSIsIlJlY3RhbmdsZVN0YXRlZnVsRHJhd2FibGUiLCJzY2VuZXJ5Iiwic3ZnbnMiLCJTVkdTZWxmRHJhd2FibGUiLCJrZWVwU1ZHUmVjdGFuZ2xlRWxlbWVudHMiLCJSZWN0YW5nbGVTVkdEcmF3YWJsZSIsImluaXRpYWxpemUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwibGFzdEFyY1ciLCJsYXN0QXJjSCIsInN2Z0VsZW1lbnQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnROUyIsInVwZGF0ZVNWR1NlbGYiLCJyZWN0IiwiZGlydHlYIiwic2V0QXR0cmlidXRlIiwibm9kZSIsIl9yZWN0WCIsImRpcnR5WSIsIl9yZWN0WSIsImRpcnR5V2lkdGgiLCJfcmVjdFdpZHRoIiwiZGlydHlIZWlnaHQiLCJfcmVjdEhlaWdodCIsImRpcnR5Q29ybmVyWFJhZGl1cyIsImRpcnR5Q29ybmVyWVJhZGl1cyIsImFyY3ciLCJhcmNoIiwiaXNSb3VuZGVkIiwibWF4aW11bUFyY1NpemUiLCJnZXRNYXhpbXVtQXJjU2l6ZSIsIk1hdGgiLCJtaW4iLCJfY29ybmVyWFJhZGl1cyIsIl9jb3JuZXJZUmFkaXVzIiwidXBkYXRlRmlsbFN0cm9rZVN0eWxlIiwicmVnaXN0ZXIiLCJtaXhJbnRvIl0sInNvdXJjZXMiOlsiUmVjdGFuZ2xlU1ZHRHJhd2FibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU1ZHIGRyYXdhYmxlIGZvciBSZWN0YW5nbGUgbm9kZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgUG9vbGFibGUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2xhYmxlLmpzJztcclxuaW1wb3J0IHsgUmVjdGFuZ2xlU3RhdGVmdWxEcmF3YWJsZSwgc2NlbmVyeSwgc3ZnbnMsIFNWR1NlbGZEcmF3YWJsZSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xyXG5cclxuLy8gVE9ETzogY2hhbmdlIHRoaXMgYmFzZWQgb24gbWVtb3J5IGFuZCBwZXJmb3JtYW5jZSBjaGFyYWN0ZXJpc3RpY3Mgb2YgdGhlIHBsYXRmb3JtXHJcbmNvbnN0IGtlZXBTVkdSZWN0YW5nbGVFbGVtZW50cyA9IHRydWU7IC8vIHdoZXRoZXIgd2Ugc2hvdWxkIHBvb2wgU1ZHIGVsZW1lbnRzIGZvciB0aGUgU1ZHIHJlbmRlcmluZyBzdGF0ZXMsIG9yIHdoZXRoZXIgd2Ugc2hvdWxkIGZyZWUgdGhlbSB3aGVuIHBvc3NpYmxlIGZvciBtZW1vcnlcclxuXHJcbmNsYXNzIFJlY3RhbmdsZVNWR0RyYXdhYmxlIGV4dGVuZHMgUmVjdGFuZ2xlU3RhdGVmdWxEcmF3YWJsZSggU1ZHU2VsZkRyYXdhYmxlICkge1xyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlICkge1xyXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlLCB0cnVlLCBrZWVwU1ZHUmVjdGFuZ2xlRWxlbWVudHMgKTsgLy8gdXNlc1BhaW50OiB0cnVlXHJcblxyXG4gICAgdGhpcy5sYXN0QXJjVyA9IC0xOyAvLyBpbnZhbGlkIG9uIHB1cnBvc2VcclxuICAgIHRoaXMubGFzdEFyY0ggPSAtMTsgLy8gaW52YWxpZCBvbiBwdXJwb3NlXHJcblxyXG4gICAgLy8gQHByb3RlY3RlZCB7U1ZHUmVjdEVsZW1lbnR9IC0gU29sZSBTVkcgZWxlbWVudCBmb3IgdGhpcyBkcmF3YWJsZSwgaW1wbGVtZW50aW5nIEFQSSBmb3IgU1ZHU2VsZkRyYXdhYmxlXHJcbiAgICB0aGlzLnN2Z0VsZW1lbnQgPSB0aGlzLnN2Z0VsZW1lbnQgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBzdmducywgJ3JlY3QnICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSBTVkcgZWxlbWVudHMgc28gdGhhdCB0aGV5IHdpbGwgYXBwZWFyIGxpa2UgdGhlIGN1cnJlbnQgbm9kZSdzIHJlcHJlc2VudGF0aW9uLlxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKlxyXG4gICAqIEltcGxlbWVudHMgdGhlIGludGVyZmFjZSBmb3IgU1ZHU2VsZkRyYXdhYmxlIChhbmQgaXMgY2FsbGVkIGZyb20gdGhlIFNWR1NlbGZEcmF3YWJsZSdzIHVwZGF0ZSkuXHJcbiAgICovXHJcbiAgdXBkYXRlU1ZHU2VsZigpIHtcclxuICAgIGNvbnN0IHJlY3QgPSB0aGlzLnN2Z0VsZW1lbnQ7XHJcblxyXG4gICAgaWYgKCB0aGlzLmRpcnR5WCApIHtcclxuICAgICAgcmVjdC5zZXRBdHRyaWJ1dGUoICd4JywgdGhpcy5ub2RlLl9yZWN0WCApO1xyXG4gICAgfVxyXG4gICAgaWYgKCB0aGlzLmRpcnR5WSApIHtcclxuICAgICAgcmVjdC5zZXRBdHRyaWJ1dGUoICd5JywgdGhpcy5ub2RlLl9yZWN0WSApO1xyXG4gICAgfVxyXG4gICAgaWYgKCB0aGlzLmRpcnR5V2lkdGggKSB7XHJcbiAgICAgIHJlY3Quc2V0QXR0cmlidXRlKCAnd2lkdGgnLCB0aGlzLm5vZGUuX3JlY3RXaWR0aCApO1xyXG4gICAgfVxyXG4gICAgaWYgKCB0aGlzLmRpcnR5SGVpZ2h0ICkge1xyXG4gICAgICByZWN0LnNldEF0dHJpYnV0ZSggJ2hlaWdodCcsIHRoaXMubm9kZS5fcmVjdEhlaWdodCApO1xyXG4gICAgfVxyXG4gICAgaWYgKCB0aGlzLmRpcnR5Q29ybmVyWFJhZGl1cyB8fCB0aGlzLmRpcnR5Q29ybmVyWVJhZGl1cyB8fCB0aGlzLmRpcnR5V2lkdGggfHwgdGhpcy5kaXJ0eUhlaWdodCApIHtcclxuICAgICAgbGV0IGFyY3cgPSAwO1xyXG4gICAgICBsZXQgYXJjaCA9IDA7XHJcblxyXG4gICAgICAvLyB3b3JrYXJvdW5kIGZvciB2YXJpb3VzIGJyb3dzZXJzIGlmIHJ4PTIwLCByeT0wIChiZWhhdmlvciBpcyBpbmNvbnNpc3RlbnQsIGVpdGhlciBpZGVudGljYWwgdG8gcng9MjAscnk9MjAsIHJ4PTAscnk9MC4gV2UnbGwgdHJlYXQgaXQgYXMgcng9MCxyeT0wKVxyXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE4M1xyXG4gICAgICBpZiAoIHRoaXMubm9kZS5pc1JvdW5kZWQoKSApIHtcclxuICAgICAgICBjb25zdCBtYXhpbXVtQXJjU2l6ZSA9IHRoaXMubm9kZS5nZXRNYXhpbXVtQXJjU2l6ZSgpO1xyXG4gICAgICAgIGFyY3cgPSBNYXRoLm1pbiggdGhpcy5ub2RlLl9jb3JuZXJYUmFkaXVzLCBtYXhpbXVtQXJjU2l6ZSApO1xyXG4gICAgICAgIGFyY2ggPSBNYXRoLm1pbiggdGhpcy5ub2RlLl9jb3JuZXJZUmFkaXVzLCBtYXhpbXVtQXJjU2l6ZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggYXJjdyAhPT0gdGhpcy5sYXN0QXJjVyApIHtcclxuICAgICAgICB0aGlzLmxhc3RBcmNXID0gYXJjdztcclxuICAgICAgICByZWN0LnNldEF0dHJpYnV0ZSggJ3J4JywgYXJjdyApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggYXJjaCAhPT0gdGhpcy5sYXN0QXJjSCApIHtcclxuICAgICAgICB0aGlzLmxhc3RBcmNIID0gYXJjaDtcclxuICAgICAgICByZWN0LnNldEF0dHJpYnV0ZSggJ3J5JywgYXJjaCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQXBwbHkgYW55IGZpbGwvc3Ryb2tlIGNoYW5nZXMgdG8gb3VyIGVsZW1lbnQuXHJcbiAgICB0aGlzLnVwZGF0ZUZpbGxTdHJva2VTdHlsZSggcmVjdCApO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ1JlY3RhbmdsZVNWR0RyYXdhYmxlJywgUmVjdGFuZ2xlU1ZHRHJhd2FibGUgKTtcclxuXHJcblBvb2xhYmxlLm1peEludG8oIFJlY3RhbmdsZVNWR0RyYXdhYmxlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSZWN0YW5nbGVTVkdEcmF3YWJsZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLHNDQUFzQztBQUMzRCxTQUFTQyx5QkFBeUIsRUFBRUMsT0FBTyxFQUFFQyxLQUFLLEVBQUVDLGVBQWUsUUFBUSxrQkFBa0I7O0FBRTdGO0FBQ0EsTUFBTUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDLENBQUM7O0FBRXZDLE1BQU1DLG9CQUFvQixTQUFTTCx5QkFBeUIsQ0FBRUcsZUFBZ0IsQ0FBQyxDQUFDO0VBQzlFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VHLFVBQVVBLENBQUVDLFFBQVEsRUFBRUMsUUFBUSxFQUFHO0lBQy9CLEtBQUssQ0FBQ0YsVUFBVSxDQUFFQyxRQUFRLEVBQUVDLFFBQVEsRUFBRSxJQUFJLEVBQUVKLHdCQUF5QixDQUFDLENBQUMsQ0FBQzs7SUFFeEUsSUFBSSxDQUFDSyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQixJQUFJLENBQUNDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOztJQUVwQjtJQUNBLElBQUksQ0FBQ0MsVUFBVSxHQUFHLElBQUksQ0FBQ0EsVUFBVSxJQUFJQyxRQUFRLENBQUNDLGVBQWUsQ0FBRVgsS0FBSyxFQUFFLE1BQU8sQ0FBQztFQUNoRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVksYUFBYUEsQ0FBQSxFQUFHO0lBQ2QsTUFBTUMsSUFBSSxHQUFHLElBQUksQ0FBQ0osVUFBVTtJQUU1QixJQUFLLElBQUksQ0FBQ0ssTUFBTSxFQUFHO01BQ2pCRCxJQUFJLENBQUNFLFlBQVksQ0FBRSxHQUFHLEVBQUUsSUFBSSxDQUFDQyxJQUFJLENBQUNDLE1BQU8sQ0FBQztJQUM1QztJQUNBLElBQUssSUFBSSxDQUFDQyxNQUFNLEVBQUc7TUFDakJMLElBQUksQ0FBQ0UsWUFBWSxDQUFFLEdBQUcsRUFBRSxJQUFJLENBQUNDLElBQUksQ0FBQ0csTUFBTyxDQUFDO0lBQzVDO0lBQ0EsSUFBSyxJQUFJLENBQUNDLFVBQVUsRUFBRztNQUNyQlAsSUFBSSxDQUFDRSxZQUFZLENBQUUsT0FBTyxFQUFFLElBQUksQ0FBQ0MsSUFBSSxDQUFDSyxVQUFXLENBQUM7SUFDcEQ7SUFDQSxJQUFLLElBQUksQ0FBQ0MsV0FBVyxFQUFHO01BQ3RCVCxJQUFJLENBQUNFLFlBQVksQ0FBRSxRQUFRLEVBQUUsSUFBSSxDQUFDQyxJQUFJLENBQUNPLFdBQVksQ0FBQztJQUN0RDtJQUNBLElBQUssSUFBSSxDQUFDQyxrQkFBa0IsSUFBSSxJQUFJLENBQUNDLGtCQUFrQixJQUFJLElBQUksQ0FBQ0wsVUFBVSxJQUFJLElBQUksQ0FBQ0UsV0FBVyxFQUFHO01BQy9GLElBQUlJLElBQUksR0FBRyxDQUFDO01BQ1osSUFBSUMsSUFBSSxHQUFHLENBQUM7O01BRVo7TUFDQTtNQUNBLElBQUssSUFBSSxDQUFDWCxJQUFJLENBQUNZLFNBQVMsQ0FBQyxDQUFDLEVBQUc7UUFDM0IsTUFBTUMsY0FBYyxHQUFHLElBQUksQ0FBQ2IsSUFBSSxDQUFDYyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3BESixJQUFJLEdBQUdLLElBQUksQ0FBQ0MsR0FBRyxDQUFFLElBQUksQ0FBQ2hCLElBQUksQ0FBQ2lCLGNBQWMsRUFBRUosY0FBZSxDQUFDO1FBQzNERixJQUFJLEdBQUdJLElBQUksQ0FBQ0MsR0FBRyxDQUFFLElBQUksQ0FBQ2hCLElBQUksQ0FBQ2tCLGNBQWMsRUFBRUwsY0FBZSxDQUFDO01BQzdEO01BQ0EsSUFBS0gsSUFBSSxLQUFLLElBQUksQ0FBQ25CLFFBQVEsRUFBRztRQUM1QixJQUFJLENBQUNBLFFBQVEsR0FBR21CLElBQUk7UUFDcEJiLElBQUksQ0FBQ0UsWUFBWSxDQUFFLElBQUksRUFBRVcsSUFBSyxDQUFDO01BQ2pDO01BQ0EsSUFBS0MsSUFBSSxLQUFLLElBQUksQ0FBQ25CLFFBQVEsRUFBRztRQUM1QixJQUFJLENBQUNBLFFBQVEsR0FBR21CLElBQUk7UUFDcEJkLElBQUksQ0FBQ0UsWUFBWSxDQUFFLElBQUksRUFBRVksSUFBSyxDQUFDO01BQ2pDO0lBQ0Y7O0lBRUE7SUFDQSxJQUFJLENBQUNRLHFCQUFxQixDQUFFdEIsSUFBSyxDQUFDO0VBQ3BDO0FBQ0Y7QUFFQWQsT0FBTyxDQUFDcUMsUUFBUSxDQUFFLHNCQUFzQixFQUFFakMsb0JBQXFCLENBQUM7QUFFaEVOLFFBQVEsQ0FBQ3dDLE9BQU8sQ0FBRWxDLG9CQUFxQixDQUFDO0FBRXhDLGVBQWVBLG9CQUFvQiJ9