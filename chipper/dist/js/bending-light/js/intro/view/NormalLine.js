// Copyright 2015-2022, University of Colorado Boulder

/**
 * The normal line is a graphic that indicates the point of intersection of the light ray and the perpendicular angle at
 * the interface.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import { Shape } from '../../../../kite/js/imports.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';
class NormalLine extends Node {
  /**
   * @param height - height of normal
   * @param lineDash
   * @param [providedOptions] - options that can be passed on to the underlying node
   */
  constructor(height, lineDash, providedOptions) {
    super();
    this.addChild(new Path(Shape.lineSegment(0, 0, 0, height), {
      stroke: 'black',
      lineDash: lineDash
    }));
    this.mutate(providedOptions);
  }
}
bendingLight.register('NormalLine', NormalLine);
export default NormalLine;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIk5vZGUiLCJQYXRoIiwiYmVuZGluZ0xpZ2h0IiwiTm9ybWFsTGluZSIsImNvbnN0cnVjdG9yIiwiaGVpZ2h0IiwibGluZURhc2giLCJwcm92aWRlZE9wdGlvbnMiLCJhZGRDaGlsZCIsImxpbmVTZWdtZW50Iiwic3Ryb2tlIiwibXV0YXRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOb3JtYWxMaW5lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSBub3JtYWwgbGluZSBpcyBhIGdyYXBoaWMgdGhhdCBpbmRpY2F0ZXMgdGhlIHBvaW50IG9mIGludGVyc2VjdGlvbiBvZiB0aGUgbGlnaHQgcmF5IGFuZCB0aGUgcGVycGVuZGljdWxhciBhbmdsZSBhdFxyXG4gKiB0aGUgaW50ZXJmYWNlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENoYW5kcmFzaGVrYXIgQmVtYWdvbmkgKEFjdHVhbCBDb25jZXB0cylcclxuICovXHJcblxyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIE5vZGVPcHRpb25zLCBQYXRoIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGJlbmRpbmdMaWdodCBmcm9tICcuLi8uLi9iZW5kaW5nTGlnaHQuanMnO1xyXG5cclxuY2xhc3MgTm9ybWFsTGluZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gaGVpZ2h0IC0gaGVpZ2h0IG9mIG5vcm1hbFxyXG4gICAqIEBwYXJhbSBsaW5lRGFzaFxyXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXSAtIG9wdGlvbnMgdGhhdCBjYW4gYmUgcGFzc2VkIG9uIHRvIHRoZSB1bmRlcmx5aW5nIG5vZGVcclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGhlaWdodDogbnVtYmVyLCBsaW5lRGFzaDogbnVtYmVyW10sIHByb3ZpZGVkT3B0aW9ucz86IE5vZGVPcHRpb25zICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgUGF0aCggU2hhcGUubGluZVNlZ21lbnQoIDAsIDAsIDAsIGhlaWdodCApLCB7XHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgbGluZURhc2g6IGxpbmVEYXNoXHJcbiAgICB9ICkgKTtcclxuICAgIHRoaXMubXV0YXRlKCBwcm92aWRlZE9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmJlbmRpbmdMaWdodC5yZWdpc3RlciggJ05vcm1hbExpbmUnLCBOb3JtYWxMaW5lICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBOb3JtYWxMaW5lOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxTQUFTQyxJQUFJLEVBQWVDLElBQUksUUFBUSxtQ0FBbUM7QUFDM0UsT0FBT0MsWUFBWSxNQUFNLHVCQUF1QjtBQUVoRCxNQUFNQyxVQUFVLFNBQVNILElBQUksQ0FBQztFQUU1QjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ1NJLFdBQVdBLENBQUVDLE1BQWMsRUFBRUMsUUFBa0IsRUFBRUMsZUFBNkIsRUFBRztJQUN0RixLQUFLLENBQUMsQ0FBQztJQUVQLElBQUksQ0FBQ0MsUUFBUSxDQUFFLElBQUlQLElBQUksQ0FBRUYsS0FBSyxDQUFDVSxXQUFXLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVKLE1BQU8sQ0FBQyxFQUFFO01BQzdESyxNQUFNLEVBQUUsT0FBTztNQUNmSixRQUFRLEVBQUVBO0lBQ1osQ0FBRSxDQUFFLENBQUM7SUFDTCxJQUFJLENBQUNLLE1BQU0sQ0FBRUosZUFBZ0IsQ0FBQztFQUNoQztBQUNGO0FBRUFMLFlBQVksQ0FBQ1UsUUFBUSxDQUFFLFlBQVksRUFBRVQsVUFBVyxDQUFDO0FBRWpELGVBQWVBLFVBQVUifQ==