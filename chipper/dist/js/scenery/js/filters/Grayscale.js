// Copyright 2020-2022, University of Colorado Boulder

/**
 * Grayscale filter
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import toSVGNumber from '../../../dot/js/toSVGNumber.js';
import { ColorMatrixFilter, scenery } from '../imports.js';
export default class Grayscale extends ColorMatrixFilter {
  /**
   * @param [amount] - The amount of the effect, from 0 (none) to 1 (full)
   */
  constructor(amount = 1) {
    assert && assert(isFinite(amount), 'Grayscale amount should be finite');
    assert && assert(amount >= 0, 'Grayscale amount should be non-negative');
    assert && assert(amount <= 1, 'Grayscale amount should be no greater than 1');
    const n = 1 - amount;

    // https://drafts.fxtf.org/filter-effects/#grayscaleEquivalent
    // (0.2126 + 0.7874 * [1 - amount]) (0.7152 - 0.7152  * [1 - amount]) (0.0722 - 0.0722 * [1 - amount]) 0 0
    // (0.2126 - 0.2126 * [1 - amount]) (0.7152 + 0.2848  * [1 - amount]) (0.0722 - 0.0722 * [1 - amount]) 0 0
    // (0.2126 - 0.2126 * [1 - amount]) (0.7152 - 0.7152  * [1 - amount]) (0.0722 + 0.9278 * [1 - amount]) 0 0
    // 0 0 0 1 0
    super(0.2126 + 0.7874 * n, 0.7152 - 0.7152 * n, 0.0722 - 0.0722 * n, 0, 0, 0.2126 - 0.2126 * n, 0.7152 + 0.2848 * n, 0.0722 - 0.0722 * n, 0, 0, 0.2126 - 0.2126 * n, 0.7152 - 0.7152 * n, 0.0722 + 0.9278 * n, 0, 0, 0, 0, 0, 1, 0);
    this.amount = amount;
  }

  /**
   * Returns the CSS-style filter substring specific to this single filter, e.g. `grayscale(1)`. This should be used for
   * both DOM elements (https://developer.mozilla.org/en-US/docs/Web/CSS/filter) and when supported, Canvas
   * (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter).
   */
  getCSSFilterString() {
    return `grayscale(${toSVGNumber(this.amount)})`;
  }
  isDOMCompatible() {
    return true;
  }

  // Turns things fully gray-scale (instead of partially)
  static FULL = new Grayscale(1);
}
scenery.register('Grayscale', Grayscale);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0b1NWR051bWJlciIsIkNvbG9yTWF0cml4RmlsdGVyIiwic2NlbmVyeSIsIkdyYXlzY2FsZSIsImNvbnN0cnVjdG9yIiwiYW1vdW50IiwiYXNzZXJ0IiwiaXNGaW5pdGUiLCJuIiwiZ2V0Q1NTRmlsdGVyU3RyaW5nIiwiaXNET01Db21wYXRpYmxlIiwiRlVMTCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR3JheXNjYWxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEdyYXlzY2FsZSBmaWx0ZXJcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCB0b1NWR051bWJlciBmcm9tICcuLi8uLi8uLi9kb3QvanMvdG9TVkdOdW1iZXIuanMnO1xyXG5pbXBvcnQgeyBDb2xvck1hdHJpeEZpbHRlciwgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JheXNjYWxlIGV4dGVuZHMgQ29sb3JNYXRyaXhGaWx0ZXIge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGFtb3VudDogbnVtYmVyO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gW2Ftb3VudF0gLSBUaGUgYW1vdW50IG9mIHRoZSBlZmZlY3QsIGZyb20gMCAobm9uZSkgdG8gMSAoZnVsbClcclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGFtb3VudCA9IDEgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYW1vdW50ICksICdHcmF5c2NhbGUgYW1vdW50IHNob3VsZCBiZSBmaW5pdGUnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhbW91bnQgPj0gMCwgJ0dyYXlzY2FsZSBhbW91bnQgc2hvdWxkIGJlIG5vbi1uZWdhdGl2ZScgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFtb3VudCA8PSAxLCAnR3JheXNjYWxlIGFtb3VudCBzaG91bGQgYmUgbm8gZ3JlYXRlciB0aGFuIDEnICk7XHJcblxyXG4gICAgY29uc3QgbiA9IDEgLSBhbW91bnQ7XHJcblxyXG4gICAgLy8gaHR0cHM6Ly9kcmFmdHMuZnh0Zi5vcmcvZmlsdGVyLWVmZmVjdHMvI2dyYXlzY2FsZUVxdWl2YWxlbnRcclxuICAgIC8vICgwLjIxMjYgKyAwLjc4NzQgKiBbMSAtIGFtb3VudF0pICgwLjcxNTIgLSAwLjcxNTIgICogWzEgLSBhbW91bnRdKSAoMC4wNzIyIC0gMC4wNzIyICogWzEgLSBhbW91bnRdKSAwIDBcclxuICAgIC8vICgwLjIxMjYgLSAwLjIxMjYgKiBbMSAtIGFtb3VudF0pICgwLjcxNTIgKyAwLjI4NDggICogWzEgLSBhbW91bnRdKSAoMC4wNzIyIC0gMC4wNzIyICogWzEgLSBhbW91bnRdKSAwIDBcclxuICAgIC8vICgwLjIxMjYgLSAwLjIxMjYgKiBbMSAtIGFtb3VudF0pICgwLjcxNTIgLSAwLjcxNTIgICogWzEgLSBhbW91bnRdKSAoMC4wNzIyICsgMC45Mjc4ICogWzEgLSBhbW91bnRdKSAwIDBcclxuICAgIC8vIDAgMCAwIDEgMFxyXG4gICAgc3VwZXIoXHJcbiAgICAgIDAuMjEyNiArIDAuNzg3NCAqIG4sIDAuNzE1MiAtIDAuNzE1MiAqIG4sIDAuMDcyMiAtIDAuMDcyMiAqIG4sIDAsIDAsXHJcbiAgICAgIDAuMjEyNiAtIDAuMjEyNiAqIG4sIDAuNzE1MiArIDAuMjg0OCAqIG4sIDAuMDcyMiAtIDAuMDcyMiAqIG4sIDAsIDAsXHJcbiAgICAgIDAuMjEyNiAtIDAuMjEyNiAqIG4sIDAuNzE1MiAtIDAuNzE1MiAqIG4sIDAuMDcyMiArIDAuOTI3OCAqIG4sIDAsIDAsXHJcbiAgICAgIDAsIDAsIDAsIDEsIDBcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5hbW91bnQgPSBhbW91bnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBDU1Mtc3R5bGUgZmlsdGVyIHN1YnN0cmluZyBzcGVjaWZpYyB0byB0aGlzIHNpbmdsZSBmaWx0ZXIsIGUuZy4gYGdyYXlzY2FsZSgxKWAuIFRoaXMgc2hvdWxkIGJlIHVzZWQgZm9yXHJcbiAgICogYm90aCBET00gZWxlbWVudHMgKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTUy9maWx0ZXIpIGFuZCB3aGVuIHN1cHBvcnRlZCwgQ2FudmFzXHJcbiAgICogKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DYW52YXNSZW5kZXJpbmdDb250ZXh0MkQvZmlsdGVyKS5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0Q1NTRmlsdGVyU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYGdyYXlzY2FsZSgke3RvU1ZHTnVtYmVyKCB0aGlzLmFtb3VudCApfSlgO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGlzRE9NQ29tcGF0aWJsZSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLy8gVHVybnMgdGhpbmdzIGZ1bGx5IGdyYXktc2NhbGUgKGluc3RlYWQgb2YgcGFydGlhbGx5KVxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgRlVMTCA9IG5ldyBHcmF5c2NhbGUoIDEgKTtcclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ0dyYXlzY2FsZScsIEdyYXlzY2FsZSApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLGdDQUFnQztBQUN4RCxTQUFTQyxpQkFBaUIsRUFBRUMsT0FBTyxRQUFRLGVBQWU7QUFFMUQsZUFBZSxNQUFNQyxTQUFTLFNBQVNGLGlCQUFpQixDQUFDO0VBSXZEO0FBQ0Y7QUFDQTtFQUNTRyxXQUFXQSxDQUFFQyxNQUFNLEdBQUcsQ0FBQyxFQUFHO0lBQy9CQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUMsUUFBUSxDQUFFRixNQUFPLENBQUMsRUFBRSxtQ0FBb0MsQ0FBQztJQUMzRUMsTUFBTSxJQUFJQSxNQUFNLENBQUVELE1BQU0sSUFBSSxDQUFDLEVBQUUseUNBQTBDLENBQUM7SUFDMUVDLE1BQU0sSUFBSUEsTUFBTSxDQUFFRCxNQUFNLElBQUksQ0FBQyxFQUFFLDhDQUErQyxDQUFDO0lBRS9FLE1BQU1HLENBQUMsR0FBRyxDQUFDLEdBQUdILE1BQU07O0lBRXBCO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQSxLQUFLLENBQ0gsTUFBTSxHQUFHLE1BQU0sR0FBR0csQ0FBQyxFQUFFLE1BQU0sR0FBRyxNQUFNLEdBQUdBLENBQUMsRUFBRSxNQUFNLEdBQUcsTUFBTSxHQUFHQSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFDbkUsTUFBTSxHQUFHLE1BQU0sR0FBR0EsQ0FBQyxFQUFFLE1BQU0sR0FBRyxNQUFNLEdBQUdBLENBQUMsRUFBRSxNQUFNLEdBQUcsTUFBTSxHQUFHQSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFDbkUsTUFBTSxHQUFHLE1BQU0sR0FBR0EsQ0FBQyxFQUFFLE1BQU0sR0FBRyxNQUFNLEdBQUdBLENBQUMsRUFBRSxNQUFNLEdBQUcsTUFBTSxHQUFHQSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFDbkUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQ2QsQ0FBQztJQUVELElBQUksQ0FBQ0gsTUFBTSxHQUFHQSxNQUFNO0VBQ3RCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDa0JJLGtCQUFrQkEsQ0FBQSxFQUFXO0lBQzNDLE9BQVEsYUFBWVQsV0FBVyxDQUFFLElBQUksQ0FBQ0ssTUFBTyxDQUFFLEdBQUU7RUFDbkQ7RUFFZ0JLLGVBQWVBLENBQUEsRUFBWTtJQUN6QyxPQUFPLElBQUk7RUFDYjs7RUFFQTtFQUNBLE9BQXVCQyxJQUFJLEdBQUcsSUFBSVIsU0FBUyxDQUFFLENBQUUsQ0FBQztBQUNsRDtBQUVBRCxPQUFPLENBQUNVLFFBQVEsQ0FBRSxXQUFXLEVBQUVULFNBQVUsQ0FBQyJ9