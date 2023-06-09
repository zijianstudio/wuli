// Copyright 2015-2022, University of Colorado Boulder

/**
 * Models the intersection between a light ray and an interface, needed so we can optionally depict normals at each
 * intersection.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import bendingLight from '../../bendingLight.js';
class Intersection {
  /**
   * @param unitNormal - unit normal at the intersection of light ray
   * @param point - point where the light ray intersects
   */
  constructor(unitNormal, point) {
    // Unit normal at the meeting between two interfaces where the light ray has struck
    this.unitNormal = unitNormal; // (read-only)

    // The point where the light ray struck
    this.point = point; // (read-only)
  }
}

bendingLight.register('Intersection', Intersection);
export default Intersection;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJiZW5kaW5nTGlnaHQiLCJJbnRlcnNlY3Rpb24iLCJjb25zdHJ1Y3RvciIsInVuaXROb3JtYWwiLCJwb2ludCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSW50ZXJzZWN0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVscyB0aGUgaW50ZXJzZWN0aW9uIGJldHdlZW4gYSBsaWdodCByYXkgYW5kIGFuIGludGVyZmFjZSwgbmVlZGVkIHNvIHdlIGNhbiBvcHRpb25hbGx5IGRlcGljdCBub3JtYWxzIGF0IGVhY2hcclxuICogaW50ZXJzZWN0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENoYW5kcmFzaGVrYXIgQmVtYWdvbmkgKEFjdHVhbCBDb25jZXB0cylcclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBiZW5kaW5nTGlnaHQgZnJvbSAnLi4vLi4vYmVuZGluZ0xpZ2h0LmpzJztcclxuXHJcbmNsYXNzIEludGVyc2VjdGlvbiB7XHJcbiAgcHVibGljIHJlYWRvbmx5IHVuaXROb3JtYWw6IFZlY3RvcjI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHBvaW50OiBWZWN0b3IyO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gdW5pdE5vcm1hbCAtIHVuaXQgbm9ybWFsIGF0IHRoZSBpbnRlcnNlY3Rpb24gb2YgbGlnaHQgcmF5XHJcbiAgICogQHBhcmFtIHBvaW50IC0gcG9pbnQgd2hlcmUgdGhlIGxpZ2h0IHJheSBpbnRlcnNlY3RzXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB1bml0Tm9ybWFsOiBWZWN0b3IyLCBwb2ludDogVmVjdG9yMiApIHtcclxuXHJcbiAgICAvLyBVbml0IG5vcm1hbCBhdCB0aGUgbWVldGluZyBiZXR3ZWVuIHR3byBpbnRlcmZhY2VzIHdoZXJlIHRoZSBsaWdodCByYXkgaGFzIHN0cnVja1xyXG4gICAgdGhpcy51bml0Tm9ybWFsID0gdW5pdE5vcm1hbDsgLy8gKHJlYWQtb25seSlcclxuXHJcbiAgICAvLyBUaGUgcG9pbnQgd2hlcmUgdGhlIGxpZ2h0IHJheSBzdHJ1Y2tcclxuICAgIHRoaXMucG9pbnQgPSBwb2ludDsgLy8gKHJlYWQtb25seSlcclxuICB9XHJcbn1cclxuXHJcbmJlbmRpbmdMaWdodC5yZWdpc3RlciggJ0ludGVyc2VjdGlvbicsIEludGVyc2VjdGlvbiApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgSW50ZXJzZWN0aW9uOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsWUFBWSxNQUFNLHVCQUF1QjtBQUVoRCxNQUFNQyxZQUFZLENBQUM7RUFJakI7QUFDRjtBQUNBO0FBQ0E7RUFDU0MsV0FBV0EsQ0FBRUMsVUFBbUIsRUFBRUMsS0FBYyxFQUFHO0lBRXhEO0lBQ0EsSUFBSSxDQUFDRCxVQUFVLEdBQUdBLFVBQVUsQ0FBQyxDQUFDOztJQUU5QjtJQUNBLElBQUksQ0FBQ0MsS0FBSyxHQUFHQSxLQUFLLENBQUMsQ0FBQztFQUN0QjtBQUNGOztBQUVBSixZQUFZLENBQUNLLFFBQVEsQ0FBRSxjQUFjLEVBQUVKLFlBQWEsQ0FBQztBQUVyRCxlQUFlQSxZQUFZIn0=