// Copyright 2020-2022, University of Colorado Boulder

/**
 * Opacity filter
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import toSVGNumber from '../../../dot/js/toSVGNumber.js';
import { Filter, scenery } from '../imports.js';
export default class Opacity extends Filter {
  /**
   * NOTE: Generally prefer setting a Node's opacity, unless this is required for stacking of filters.
   *
   * @param amount - The amount of opacity, from 0 (invisible) to 1 (fully visible)
   */
  constructor(amount) {
    assert && assert(isFinite(amount), 'Opacity amount should be finite');
    assert && assert(amount >= 0, 'Opacity amount should be non-negative');
    assert && assert(amount <= 1, 'Opacity amount should be no greater than 1');
    super();
    this.amount = amount;
  }

  /**
   * Returns the CSS-style filter substring specific to this single filter, e.g. `grayscale(1)`. This should be used for
   * both DOM elements (https://developer.mozilla.org/en-US/docs/Web/CSS/filter) and when supported, Canvas
   * (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter).
   */
  getCSSFilterString() {
    return `opacity(${toSVGNumber(this.amount)})`;
  }
  isDOMCompatible() {
    return true;
  }
  applyCanvasFilter(wrapper) {
    throw new Error('unimplemented');
  }
  applySVGFilter(svgFilter, inName, resultName) {
    throw new Error('unimplemented');
  }
}
scenery.register('Opacity', Opacity);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0b1NWR051bWJlciIsIkZpbHRlciIsInNjZW5lcnkiLCJPcGFjaXR5IiwiY29uc3RydWN0b3IiLCJhbW91bnQiLCJhc3NlcnQiLCJpc0Zpbml0ZSIsImdldENTU0ZpbHRlclN0cmluZyIsImlzRE9NQ29tcGF0aWJsZSIsImFwcGx5Q2FudmFzRmlsdGVyIiwid3JhcHBlciIsIkVycm9yIiwiYXBwbHlTVkdGaWx0ZXIiLCJzdmdGaWx0ZXIiLCJpbk5hbWUiLCJyZXN1bHROYW1lIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJPcGFjaXR5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE9wYWNpdHkgZmlsdGVyXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgdG9TVkdOdW1iZXIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL3RvU1ZHTnVtYmVyLmpzJztcclxuaW1wb3J0IHsgQ2FudmFzQ29udGV4dFdyYXBwZXIsIEZpbHRlciwgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3BhY2l0eSBleHRlbmRzIEZpbHRlciB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgYW1vdW50OiBudW1iZXI7XHJcblxyXG4gIC8qKlxyXG4gICAqIE5PVEU6IEdlbmVyYWxseSBwcmVmZXIgc2V0dGluZyBhIE5vZGUncyBvcGFjaXR5LCB1bmxlc3MgdGhpcyBpcyByZXF1aXJlZCBmb3Igc3RhY2tpbmcgb2YgZmlsdGVycy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBhbW91bnQgLSBUaGUgYW1vdW50IG9mIG9wYWNpdHksIGZyb20gMCAoaW52aXNpYmxlKSB0byAxIChmdWxseSB2aXNpYmxlKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYW1vdW50OiBudW1iZXIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYW1vdW50ICksICdPcGFjaXR5IGFtb3VudCBzaG91bGQgYmUgZmluaXRlJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYW1vdW50ID49IDAsICdPcGFjaXR5IGFtb3VudCBzaG91bGQgYmUgbm9uLW5lZ2F0aXZlJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYW1vdW50IDw9IDEsICdPcGFjaXR5IGFtb3VudCBzaG91bGQgYmUgbm8gZ3JlYXRlciB0aGFuIDEnICk7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICB0aGlzLmFtb3VudCA9IGFtb3VudDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIENTUy1zdHlsZSBmaWx0ZXIgc3Vic3RyaW5nIHNwZWNpZmljIHRvIHRoaXMgc2luZ2xlIGZpbHRlciwgZS5nLiBgZ3JheXNjYWxlKDEpYC4gVGhpcyBzaG91bGQgYmUgdXNlZCBmb3JcclxuICAgKiBib3RoIERPTSBlbGVtZW50cyAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL2ZpbHRlcikgYW5kIHdoZW4gc3VwcG9ydGVkLCBDYW52YXNcclxuICAgKiAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRC9maWx0ZXIpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDU1NGaWx0ZXJTdHJpbmcoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBgb3BhY2l0eSgke3RvU1ZHTnVtYmVyKCB0aGlzLmFtb3VudCApfSlgO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGlzRE9NQ29tcGF0aWJsZSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGFwcGx5Q2FudmFzRmlsdGVyKCB3cmFwcGVyOiBDYW52YXNDb250ZXh0V3JhcHBlciApOiB2b2lkIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ3VuaW1wbGVtZW50ZWQnICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXBwbHlTVkdGaWx0ZXIoIHN2Z0ZpbHRlcjogU1ZHRmlsdGVyRWxlbWVudCwgaW5OYW1lOiBzdHJpbmcsIHJlc3VsdE5hbWU/OiBzdHJpbmcgKTogdm9pZCB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoICd1bmltcGxlbWVudGVkJyApO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ09wYWNpdHknLCBPcGFjaXR5ICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxXQUFXLE1BQU0sZ0NBQWdDO0FBQ3hELFNBQStCQyxNQUFNLEVBQUVDLE9BQU8sUUFBUSxlQUFlO0FBRXJFLGVBQWUsTUFBTUMsT0FBTyxTQUFTRixNQUFNLENBQUM7RUFJMUM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNTRyxXQUFXQSxDQUFFQyxNQUFjLEVBQUc7SUFDbkNDLE1BQU0sSUFBSUEsTUFBTSxDQUFFQyxRQUFRLENBQUVGLE1BQU8sQ0FBQyxFQUFFLGlDQUFrQyxDQUFDO0lBQ3pFQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUQsTUFBTSxJQUFJLENBQUMsRUFBRSx1Q0FBd0MsQ0FBQztJQUN4RUMsTUFBTSxJQUFJQSxNQUFNLENBQUVELE1BQU0sSUFBSSxDQUFDLEVBQUUsNENBQTZDLENBQUM7SUFFN0UsS0FBSyxDQUFDLENBQUM7SUFFUCxJQUFJLENBQUNBLE1BQU0sR0FBR0EsTUFBTTtFQUN0Qjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ1NHLGtCQUFrQkEsQ0FBQSxFQUFXO0lBQ2xDLE9BQVEsV0FBVVIsV0FBVyxDQUFFLElBQUksQ0FBQ0ssTUFBTyxDQUFFLEdBQUU7RUFDakQ7RUFFZ0JJLGVBQWVBLENBQUEsRUFBWTtJQUN6QyxPQUFPLElBQUk7RUFDYjtFQUVPQyxpQkFBaUJBLENBQUVDLE9BQTZCLEVBQVM7SUFDOUQsTUFBTSxJQUFJQyxLQUFLLENBQUUsZUFBZ0IsQ0FBQztFQUNwQztFQUVPQyxjQUFjQSxDQUFFQyxTQUEyQixFQUFFQyxNQUFjLEVBQUVDLFVBQW1CLEVBQVM7SUFDOUYsTUFBTSxJQUFJSixLQUFLLENBQUUsZUFBZ0IsQ0FBQztFQUNwQztBQUNGO0FBRUFWLE9BQU8sQ0FBQ2UsUUFBUSxDQUFFLFNBQVMsRUFBRWQsT0FBUSxDQUFDIn0=