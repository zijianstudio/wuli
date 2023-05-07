// Copyright 2020-2022, University of Colorado Boulder

/**
 * DropShadow filter
 *
 * EXPERIMENTAL! DO not use in production code yet
 *
 * TODO: preventFit OR handle bounds increase (or both)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import toSVGNumber from '../../../dot/js/toSVGNumber.js';
import { ColorDef, Filter, PaintDef, scenery } from '../imports.js';
export default class DropShadow extends Filter {
  /**
   * @param offset
   * @param blurRadius
   * @param color
   * @param [filterRegionPercentage]
   */
  constructor(offset, blurRadius, color, filterRegionPercentage = 15) {
    assert && assert(offset.isFinite(), 'DropShadow offset should be finite');
    assert && assert(isFinite(blurRadius), 'DropShadow blurRadius should be finite');
    assert && assert(blurRadius >= 0, 'DropShadow blurRadius should be non-negative');
    assert && assert(ColorDef.isColorDef(color), 'DropShadow color should be a ColorDef');
    super();

    // TODO: consider linking to the ColorDef (if it's a Property), or indicating that we need an update

    this.offset = offset;
    this.blurRadius = blurRadius;
    this.color = color;
    this.colorCSS = PaintDef.toColor(color).toCSS();
    this.filterRegionPercentageIncrease = filterRegionPercentage;
  }

  /**
   * Returns the CSS-style filter substring specific to this single filter, e.g. `grayscale(1)`. This should be used for
   * both DOM elements (https://developer.mozilla.org/en-US/docs/Web/CSS/filter) and when supported, Canvas
   * (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter).
   */
  getCSSFilterString() {
    return `drop-shadow(${toSVGNumber(this.offset.x)}px ${toSVGNumber(this.offset.y)}px ${toSVGNumber(this.blurRadius)}px ${this.colorCSS})`;
  }
  isDOMCompatible() {
    return true;
  }
  applyCanvasFilter() {
    throw new Error('unimplemented');
  }
  applySVGFilter(svgFilter, inName, resultName) {
    throw new Error('unimplemented');
  }
}
scenery.register('DropShadow', DropShadow);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0b1NWR051bWJlciIsIkNvbG9yRGVmIiwiRmlsdGVyIiwiUGFpbnREZWYiLCJzY2VuZXJ5IiwiRHJvcFNoYWRvdyIsImNvbnN0cnVjdG9yIiwib2Zmc2V0IiwiYmx1clJhZGl1cyIsImNvbG9yIiwiZmlsdGVyUmVnaW9uUGVyY2VudGFnZSIsImFzc2VydCIsImlzRmluaXRlIiwiaXNDb2xvckRlZiIsImNvbG9yQ1NTIiwidG9Db2xvciIsInRvQ1NTIiwiZmlsdGVyUmVnaW9uUGVyY2VudGFnZUluY3JlYXNlIiwiZ2V0Q1NTRmlsdGVyU3RyaW5nIiwieCIsInkiLCJpc0RPTUNvbXBhdGlibGUiLCJhcHBseUNhbnZhc0ZpbHRlciIsIkVycm9yIiwiYXBwbHlTVkdGaWx0ZXIiLCJzdmdGaWx0ZXIiLCJpbk5hbWUiLCJyZXN1bHROYW1lIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEcm9wU2hhZG93LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERyb3BTaGFkb3cgZmlsdGVyXHJcbiAqXHJcbiAqIEVYUEVSSU1FTlRBTCEgRE8gbm90IHVzZSBpbiBwcm9kdWN0aW9uIGNvZGUgeWV0XHJcbiAqXHJcbiAqIFRPRE86IHByZXZlbnRGaXQgT1IgaGFuZGxlIGJvdW5kcyBpbmNyZWFzZSAob3IgYm90aClcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCB0b1NWR051bWJlciBmcm9tICcuLi8uLi8uLi9kb3QvanMvdG9TVkdOdW1iZXIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IENvbG9yRGVmLCBGaWx0ZXIsIFRDb2xvciwgUGFpbnREZWYsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERyb3BTaGFkb3cgZXh0ZW5kcyBGaWx0ZXIge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IG9mZnNldDogVmVjdG9yMjtcclxuICBwcml2YXRlIHJlYWRvbmx5IGJsdXJSYWRpdXM6IG51bWJlcjtcclxuICBwcml2YXRlIHJlYWRvbmx5IGNvbG9yOiBUQ29sb3I7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBjb2xvckNTUzogc3RyaW5nO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gb2Zmc2V0XHJcbiAgICogQHBhcmFtIGJsdXJSYWRpdXNcclxuICAgKiBAcGFyYW0gY29sb3JcclxuICAgKiBAcGFyYW0gW2ZpbHRlclJlZ2lvblBlcmNlbnRhZ2VdXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBvZmZzZXQ6IFZlY3RvcjIsIGJsdXJSYWRpdXM6IG51bWJlciwgY29sb3I6IFRDb2xvciwgZmlsdGVyUmVnaW9uUGVyY2VudGFnZSA9IDE1ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb2Zmc2V0LmlzRmluaXRlKCksICdEcm9wU2hhZG93IG9mZnNldCBzaG91bGQgYmUgZmluaXRlJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIGJsdXJSYWRpdXMgKSwgJ0Ryb3BTaGFkb3cgYmx1clJhZGl1cyBzaG91bGQgYmUgZmluaXRlJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmx1clJhZGl1cyA+PSAwLCAnRHJvcFNoYWRvdyBibHVyUmFkaXVzIHNob3VsZCBiZSBub24tbmVnYXRpdmUnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBDb2xvckRlZi5pc0NvbG9yRGVmKCBjb2xvciApLCAnRHJvcFNoYWRvdyBjb2xvciBzaG91bGQgYmUgYSBDb2xvckRlZicgKTtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIFRPRE86IGNvbnNpZGVyIGxpbmtpbmcgdG8gdGhlIENvbG9yRGVmIChpZiBpdCdzIGEgUHJvcGVydHkpLCBvciBpbmRpY2F0aW5nIHRoYXQgd2UgbmVlZCBhbiB1cGRhdGVcclxuXHJcbiAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcclxuICAgIHRoaXMuYmx1clJhZGl1cyA9IGJsdXJSYWRpdXM7XHJcbiAgICB0aGlzLmNvbG9yID0gY29sb3I7XHJcbiAgICB0aGlzLmNvbG9yQ1NTID0gUGFpbnREZWYudG9Db2xvciggY29sb3IgKS50b0NTUygpO1xyXG5cclxuICAgIHRoaXMuZmlsdGVyUmVnaW9uUGVyY2VudGFnZUluY3JlYXNlID0gZmlsdGVyUmVnaW9uUGVyY2VudGFnZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIENTUy1zdHlsZSBmaWx0ZXIgc3Vic3RyaW5nIHNwZWNpZmljIHRvIHRoaXMgc2luZ2xlIGZpbHRlciwgZS5nLiBgZ3JheXNjYWxlKDEpYC4gVGhpcyBzaG91bGQgYmUgdXNlZCBmb3JcclxuICAgKiBib3RoIERPTSBlbGVtZW50cyAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL2ZpbHRlcikgYW5kIHdoZW4gc3VwcG9ydGVkLCBDYW52YXNcclxuICAgKiAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRC9maWx0ZXIpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDU1NGaWx0ZXJTdHJpbmcoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBgZHJvcC1zaGFkb3coJHt0b1NWR051bWJlciggdGhpcy5vZmZzZXQueCApfXB4ICR7dG9TVkdOdW1iZXIoIHRoaXMub2Zmc2V0LnkgKX1weCAke3RvU1ZHTnVtYmVyKCB0aGlzLmJsdXJSYWRpdXMgKX1weCAke3RoaXMuY29sb3JDU1N9KWA7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgaXNET01Db21wYXRpYmxlKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXBwbHlDYW52YXNGaWx0ZXIoKTogdm9pZCB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoICd1bmltcGxlbWVudGVkJyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGFwcGx5U1ZHRmlsdGVyKCBzdmdGaWx0ZXI6IFNWR0ZpbHRlckVsZW1lbnQsIGluTmFtZTogc3RyaW5nLCByZXN1bHROYW1lPzogc3RyaW5nICk6IHZvaWQge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAndW5pbXBsZW1lbnRlZCcgKTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdEcm9wU2hhZG93JywgRHJvcFNoYWRvdyApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxXQUFXLE1BQU0sZ0NBQWdDO0FBRXhELFNBQVNDLFFBQVEsRUFBRUMsTUFBTSxFQUFVQyxRQUFRLEVBQUVDLE9BQU8sUUFBUSxlQUFlO0FBRTNFLGVBQWUsTUFBTUMsVUFBVSxTQUFTSCxNQUFNLENBQUM7RUFPN0M7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NJLFdBQVdBLENBQUVDLE1BQWUsRUFBRUMsVUFBa0IsRUFBRUMsS0FBYSxFQUFFQyxzQkFBc0IsR0FBRyxFQUFFLEVBQUc7SUFDcEdDLE1BQU0sSUFBSUEsTUFBTSxDQUFFSixNQUFNLENBQUNLLFFBQVEsQ0FBQyxDQUFDLEVBQUUsb0NBQXFDLENBQUM7SUFDM0VELE1BQU0sSUFBSUEsTUFBTSxDQUFFQyxRQUFRLENBQUVKLFVBQVcsQ0FBQyxFQUFFLHdDQUF5QyxDQUFDO0lBQ3BGRyxNQUFNLElBQUlBLE1BQU0sQ0FBRUgsVUFBVSxJQUFJLENBQUMsRUFBRSw4Q0FBK0MsQ0FBQztJQUNuRkcsTUFBTSxJQUFJQSxNQUFNLENBQUVWLFFBQVEsQ0FBQ1ksVUFBVSxDQUFFSixLQUFNLENBQUMsRUFBRSx1Q0FBd0MsQ0FBQztJQUV6RixLQUFLLENBQUMsQ0FBQzs7SUFFUDs7SUFFQSxJQUFJLENBQUNGLE1BQU0sR0FBR0EsTUFBTTtJQUNwQixJQUFJLENBQUNDLFVBQVUsR0FBR0EsVUFBVTtJQUM1QixJQUFJLENBQUNDLEtBQUssR0FBR0EsS0FBSztJQUNsQixJQUFJLENBQUNLLFFBQVEsR0FBR1gsUUFBUSxDQUFDWSxPQUFPLENBQUVOLEtBQU0sQ0FBQyxDQUFDTyxLQUFLLENBQUMsQ0FBQztJQUVqRCxJQUFJLENBQUNDLDhCQUE4QixHQUFHUCxzQkFBc0I7RUFDOUQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNTUSxrQkFBa0JBLENBQUEsRUFBVztJQUNsQyxPQUFRLGVBQWNsQixXQUFXLENBQUUsSUFBSSxDQUFDTyxNQUFNLENBQUNZLENBQUUsQ0FBRSxNQUFLbkIsV0FBVyxDQUFFLElBQUksQ0FBQ08sTUFBTSxDQUFDYSxDQUFFLENBQUUsTUFBS3BCLFdBQVcsQ0FBRSxJQUFJLENBQUNRLFVBQVcsQ0FBRSxNQUFLLElBQUksQ0FBQ00sUUFBUyxHQUFFO0VBQ2hKO0VBRWdCTyxlQUFlQSxDQUFBLEVBQVk7SUFDekMsT0FBTyxJQUFJO0VBQ2I7RUFFT0MsaUJBQWlCQSxDQUFBLEVBQVM7SUFDL0IsTUFBTSxJQUFJQyxLQUFLLENBQUUsZUFBZ0IsQ0FBQztFQUNwQztFQUVPQyxjQUFjQSxDQUFFQyxTQUEyQixFQUFFQyxNQUFjLEVBQUVDLFVBQW1CLEVBQVM7SUFDOUYsTUFBTSxJQUFJSixLQUFLLENBQUUsZUFBZ0IsQ0FBQztFQUNwQztBQUNGO0FBRUFuQixPQUFPLENBQUN3QixRQUFRLENBQUUsWUFBWSxFQUFFdkIsVUFBVyxDQUFDIn0=