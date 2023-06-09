// Copyright 2022, University of Colorado Boulder

/**
 * An internal representation of a row/column for grid/flow handling in constraints (set up for pooling)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { scenery } from '../../imports.js';
export default class LayoutLine {
  // A range of sizes along the secondary axis that our cells could take up
  // (scenery-internal)

  // A range of positions where our align:origin content could go out to (the farthest +/- from 0 that our align:origin
  // nodes go).
  // (scenery-internal)
  // The line's size (along the secondary axis)
  // (scenery-internal)
  // The line's position (along the primary axis)
  // (scenery-internal)
  initializeLayoutLine() {
    this.min = 0;
    this.max = Number.POSITIVE_INFINITY;
    this.minOrigin = Number.POSITIVE_INFINITY;
    this.maxOrigin = Number.NEGATIVE_INFINITY;
    this.size = 0;
    this.position = 0;
  }

  /**
   * Whether there was origin-based content in the layout
   * (scenery-internal)
   */
  hasOrigin() {
    return isFinite(this.minOrigin) && isFinite(this.maxOrigin);
  }
}
scenery.register('LayoutLine', LayoutLine);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzY2VuZXJ5IiwiTGF5b3V0TGluZSIsImluaXRpYWxpemVMYXlvdXRMaW5lIiwibWluIiwibWF4IiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJtaW5PcmlnaW4iLCJtYXhPcmlnaW4iLCJORUdBVElWRV9JTkZJTklUWSIsInNpemUiLCJwb3NpdGlvbiIsImhhc09yaWdpbiIsImlzRmluaXRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMYXlvdXRMaW5lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBbiBpbnRlcm5hbCByZXByZXNlbnRhdGlvbiBvZiBhIHJvdy9jb2x1bW4gZm9yIGdyaWQvZmxvdyBoYW5kbGluZyBpbiBjb25zdHJhaW50cyAoc2V0IHVwIGZvciBwb29saW5nKVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgc2NlbmVyeSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGF5b3V0TGluZSB7XHJcblxyXG4gIC8vIEEgcmFuZ2Ugb2Ygc2l6ZXMgYWxvbmcgdGhlIHNlY29uZGFyeSBheGlzIHRoYXQgb3VyIGNlbGxzIGNvdWxkIHRha2UgdXBcclxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICBwdWJsaWMgbWluITogbnVtYmVyO1xyXG4gIHB1YmxpYyBtYXghOiBudW1iZXI7XHJcblxyXG4gIC8vIEEgcmFuZ2Ugb2YgcG9zaXRpb25zIHdoZXJlIG91ciBhbGlnbjpvcmlnaW4gY29udGVudCBjb3VsZCBnbyBvdXQgdG8gKHRoZSBmYXJ0aGVzdCArLy0gZnJvbSAwIHRoYXQgb3VyIGFsaWduOm9yaWdpblxyXG4gIC8vIG5vZGVzIGdvKS5cclxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICBwdWJsaWMgbWluT3JpZ2luITogbnVtYmVyO1xyXG4gIHB1YmxpYyBtYXhPcmlnaW4hOiBudW1iZXI7XHJcblxyXG4gIC8vIFRoZSBsaW5lJ3Mgc2l6ZSAoYWxvbmcgdGhlIHNlY29uZGFyeSBheGlzKVxyXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxyXG4gIHB1YmxpYyBzaXplITogbnVtYmVyO1xyXG5cclxuICAvLyBUaGUgbGluZSdzIHBvc2l0aW9uIChhbG9uZyB0aGUgcHJpbWFyeSBheGlzKVxyXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxyXG4gIHB1YmxpYyBwb3NpdGlvbiE6IG51bWJlcjtcclxuXHJcbiAgcHJvdGVjdGVkIGluaXRpYWxpemVMYXlvdXRMaW5lKCk6IHZvaWQge1xyXG4gICAgdGhpcy5taW4gPSAwO1xyXG4gICAgdGhpcy5tYXggPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICB0aGlzLm1pbk9yaWdpbiA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuICAgIHRoaXMubWF4T3JpZ2luID0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZO1xyXG4gICAgdGhpcy5zaXplID0gMDtcclxuICAgIHRoaXMucG9zaXRpb24gPSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGVyZSB3YXMgb3JpZ2luLWJhc2VkIGNvbnRlbnQgaW4gdGhlIGxheW91dFxyXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBoYXNPcmlnaW4oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gaXNGaW5pdGUoIHRoaXMubWluT3JpZ2luICkgJiYgaXNGaW5pdGUoIHRoaXMubWF4T3JpZ2luICk7XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnTGF5b3V0TGluZScsIExheW91dExpbmUgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLE9BQU8sUUFBUSxrQkFBa0I7QUFFMUMsZUFBZSxNQUFNQyxVQUFVLENBQUM7RUFFOUI7RUFDQTs7RUFJQTtFQUNBO0VBQ0E7RUFJQTtFQUNBO0VBR0E7RUFDQTtFQUdVQyxvQkFBb0JBLENBQUEsRUFBUztJQUNyQyxJQUFJLENBQUNDLEdBQUcsR0FBRyxDQUFDO0lBQ1osSUFBSSxDQUFDQyxHQUFHLEdBQUdDLE1BQU0sQ0FBQ0MsaUJBQWlCO0lBQ25DLElBQUksQ0FBQ0MsU0FBUyxHQUFHRixNQUFNLENBQUNDLGlCQUFpQjtJQUN6QyxJQUFJLENBQUNFLFNBQVMsR0FBR0gsTUFBTSxDQUFDSSxpQkFBaUI7SUFDekMsSUFBSSxDQUFDQyxJQUFJLEdBQUcsQ0FBQztJQUNiLElBQUksQ0FBQ0MsUUFBUSxHQUFHLENBQUM7RUFDbkI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDU0MsU0FBU0EsQ0FBQSxFQUFZO0lBQzFCLE9BQU9DLFFBQVEsQ0FBRSxJQUFJLENBQUNOLFNBQVUsQ0FBQyxJQUFJTSxRQUFRLENBQUUsSUFBSSxDQUFDTCxTQUFVLENBQUM7RUFDakU7QUFDRjtBQUVBUixPQUFPLENBQUNjLFFBQVEsQ0FBRSxZQUFZLEVBQUViLFVBQVcsQ0FBQyJ9