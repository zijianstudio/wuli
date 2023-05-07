// Copyright 2016-2022, University of Colorado Boulder

/**
 * SVG drawable for Line nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Poolable from '../../../../phet-core/js/Poolable.js';
import { LineStatefulDrawable, scenery, svgns, SVGSelfDrawable } from '../../imports.js';

// TODO: change this based on memory and performance characteristics of the platform
const keepSVGLineElements = true; // whether we should pool SVG elements for the SVG rendering states, or whether we should free them when possible for memory

/*---------------------------------------------------------------------------*
 * SVG Rendering
 *----------------------------------------------------------------------------*/

class LineSVGDrawable extends LineStatefulDrawable(SVGSelfDrawable) {
  /**
   * @public
   * @override
   *
   * @param {number} renderer
   * @param {Instance} instance
   */
  initialize(renderer, instance) {
    super.initialize(renderer, instance, true, keepSVGLineElements); // usesPaint: true

    this.svgElement = this.svgElement || document.createElementNS(svgns, 'line');
  }

  /**
   * Updates the SVG elements so that they will appear like the current node's representation.
   * @protected
   * @override
   */
  updateSVGSelf() {
    const line = this.svgElement;
    if (this.dirtyX1) {
      line.setAttribute('x1', this.node.x1);
    }
    if (this.dirtyY1) {
      line.setAttribute('y1', this.node.y1);
    }
    if (this.dirtyX2) {
      line.setAttribute('x2', this.node.x2);
    }
    if (this.dirtyY2) {
      line.setAttribute('y2', this.node.y2);
    }

    // Apply any fill/stroke changes to our element.
    this.updateFillStrokeStyle(line);
  }
}
scenery.register('LineSVGDrawable', LineSVGDrawable);
Poolable.mixInto(LineSVGDrawable);
export default LineSVGDrawable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQb29sYWJsZSIsIkxpbmVTdGF0ZWZ1bERyYXdhYmxlIiwic2NlbmVyeSIsInN2Z25zIiwiU1ZHU2VsZkRyYXdhYmxlIiwia2VlcFNWR0xpbmVFbGVtZW50cyIsIkxpbmVTVkdEcmF3YWJsZSIsImluaXRpYWxpemUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwic3ZnRWxlbWVudCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudE5TIiwidXBkYXRlU1ZHU2VsZiIsImxpbmUiLCJkaXJ0eVgxIiwic2V0QXR0cmlidXRlIiwibm9kZSIsIngxIiwiZGlydHlZMSIsInkxIiwiZGlydHlYMiIsIngyIiwiZGlydHlZMiIsInkyIiwidXBkYXRlRmlsbFN0cm9rZVN0eWxlIiwicmVnaXN0ZXIiLCJtaXhJbnRvIl0sInNvdXJjZXMiOlsiTGluZVNWR0RyYXdhYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNWRyBkcmF3YWJsZSBmb3IgTGluZSBub2Rlcy5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBQb29sYWJsZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbGFibGUuanMnO1xyXG5pbXBvcnQgeyBMaW5lU3RhdGVmdWxEcmF3YWJsZSwgc2NlbmVyeSwgc3ZnbnMsIFNWR1NlbGZEcmF3YWJsZSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xyXG5cclxuLy8gVE9ETzogY2hhbmdlIHRoaXMgYmFzZWQgb24gbWVtb3J5IGFuZCBwZXJmb3JtYW5jZSBjaGFyYWN0ZXJpc3RpY3Mgb2YgdGhlIHBsYXRmb3JtXHJcbmNvbnN0IGtlZXBTVkdMaW5lRWxlbWVudHMgPSB0cnVlOyAvLyB3aGV0aGVyIHdlIHNob3VsZCBwb29sIFNWRyBlbGVtZW50cyBmb3IgdGhlIFNWRyByZW5kZXJpbmcgc3RhdGVzLCBvciB3aGV0aGVyIHdlIHNob3VsZCBmcmVlIHRoZW0gd2hlbiBwb3NzaWJsZSBmb3IgbWVtb3J5XHJcblxyXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICogU1ZHIFJlbmRlcmluZ1xyXG4gKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuY2xhc3MgTGluZVNWR0RyYXdhYmxlIGV4dGVuZHMgTGluZVN0YXRlZnVsRHJhd2FibGUoIFNWR1NlbGZEcmF3YWJsZSApIHtcclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVuZGVyZXJcclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIGluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSApIHtcclxuICAgIHN1cGVyLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgdHJ1ZSwga2VlcFNWR0xpbmVFbGVtZW50cyApOyAvLyB1c2VzUGFpbnQ6IHRydWVcclxuXHJcbiAgICB0aGlzLnN2Z0VsZW1lbnQgPSB0aGlzLnN2Z0VsZW1lbnQgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBzdmducywgJ2xpbmUnICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSBTVkcgZWxlbWVudHMgc28gdGhhdCB0aGV5IHdpbGwgYXBwZWFyIGxpa2UgdGhlIGN1cnJlbnQgbm9kZSdzIHJlcHJlc2VudGF0aW9uLlxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICB1cGRhdGVTVkdTZWxmKCkge1xyXG4gICAgY29uc3QgbGluZSA9IHRoaXMuc3ZnRWxlbWVudDtcclxuXHJcbiAgICBpZiAoIHRoaXMuZGlydHlYMSApIHtcclxuICAgICAgbGluZS5zZXRBdHRyaWJ1dGUoICd4MScsIHRoaXMubm9kZS54MSApO1xyXG4gICAgfVxyXG4gICAgaWYgKCB0aGlzLmRpcnR5WTEgKSB7XHJcbiAgICAgIGxpbmUuc2V0QXR0cmlidXRlKCAneTEnLCB0aGlzLm5vZGUueTEgKTtcclxuICAgIH1cclxuICAgIGlmICggdGhpcy5kaXJ0eVgyICkge1xyXG4gICAgICBsaW5lLnNldEF0dHJpYnV0ZSggJ3gyJywgdGhpcy5ub2RlLngyICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIHRoaXMuZGlydHlZMiApIHtcclxuICAgICAgbGluZS5zZXRBdHRyaWJ1dGUoICd5MicsIHRoaXMubm9kZS55MiApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFwcGx5IGFueSBmaWxsL3N0cm9rZSBjaGFuZ2VzIHRvIG91ciBlbGVtZW50LlxyXG4gICAgdGhpcy51cGRhdGVGaWxsU3Ryb2tlU3R5bGUoIGxpbmUgKTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdMaW5lU1ZHRHJhd2FibGUnLCBMaW5lU1ZHRHJhd2FibGUgKTtcclxuXHJcblBvb2xhYmxlLm1peEludG8oIExpbmVTVkdEcmF3YWJsZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTGluZVNWR0RyYXdhYmxlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sc0NBQXNDO0FBQzNELFNBQVNDLG9CQUFvQixFQUFFQyxPQUFPLEVBQUVDLEtBQUssRUFBRUMsZUFBZSxRQUFRLGtCQUFrQjs7QUFFeEY7QUFDQSxNQUFNQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsQ0FBQzs7QUFFbEM7QUFDQTtBQUNBOztBQUVBLE1BQU1DLGVBQWUsU0FBU0wsb0JBQW9CLENBQUVHLGVBQWdCLENBQUMsQ0FBQztFQUNwRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxVQUFVQSxDQUFFQyxRQUFRLEVBQUVDLFFBQVEsRUFBRztJQUMvQixLQUFLLENBQUNGLFVBQVUsQ0FBRUMsUUFBUSxFQUFFQyxRQUFRLEVBQUUsSUFBSSxFQUFFSixtQkFBb0IsQ0FBQyxDQUFDLENBQUM7O0lBRW5FLElBQUksQ0FBQ0ssVUFBVSxHQUFHLElBQUksQ0FBQ0EsVUFBVSxJQUFJQyxRQUFRLENBQUNDLGVBQWUsQ0FBRVQsS0FBSyxFQUFFLE1BQU8sQ0FBQztFQUNoRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VVLGFBQWFBLENBQUEsRUFBRztJQUNkLE1BQU1DLElBQUksR0FBRyxJQUFJLENBQUNKLFVBQVU7SUFFNUIsSUFBSyxJQUFJLENBQUNLLE9BQU8sRUFBRztNQUNsQkQsSUFBSSxDQUFDRSxZQUFZLENBQUUsSUFBSSxFQUFFLElBQUksQ0FBQ0MsSUFBSSxDQUFDQyxFQUFHLENBQUM7SUFDekM7SUFDQSxJQUFLLElBQUksQ0FBQ0MsT0FBTyxFQUFHO01BQ2xCTCxJQUFJLENBQUNFLFlBQVksQ0FBRSxJQUFJLEVBQUUsSUFBSSxDQUFDQyxJQUFJLENBQUNHLEVBQUcsQ0FBQztJQUN6QztJQUNBLElBQUssSUFBSSxDQUFDQyxPQUFPLEVBQUc7TUFDbEJQLElBQUksQ0FBQ0UsWUFBWSxDQUFFLElBQUksRUFBRSxJQUFJLENBQUNDLElBQUksQ0FBQ0ssRUFBRyxDQUFDO0lBQ3pDO0lBQ0EsSUFBSyxJQUFJLENBQUNDLE9BQU8sRUFBRztNQUNsQlQsSUFBSSxDQUFDRSxZQUFZLENBQUUsSUFBSSxFQUFFLElBQUksQ0FBQ0MsSUFBSSxDQUFDTyxFQUFHLENBQUM7SUFDekM7O0lBRUE7SUFDQSxJQUFJLENBQUNDLHFCQUFxQixDQUFFWCxJQUFLLENBQUM7RUFDcEM7QUFDRjtBQUVBWixPQUFPLENBQUN3QixRQUFRLENBQUUsaUJBQWlCLEVBQUVwQixlQUFnQixDQUFDO0FBRXRETixRQUFRLENBQUMyQixPQUFPLENBQUVyQixlQUFnQixDQUFDO0FBRW5DLGVBQWVBLGVBQWUifQ==