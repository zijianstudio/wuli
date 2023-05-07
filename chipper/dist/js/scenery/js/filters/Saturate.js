// Copyright 2020-2022, University of Colorado Boulder

/**
 * Saturate filter
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import toSVGNumber from '../../../dot/js/toSVGNumber.js';
import { ColorMatrixFilter, scenery } from '../imports.js';
export default class Saturate extends ColorMatrixFilter {
  /**
   * @param amount - The amount of the effect, from 0 (no saturation), 1 (normal), or higher to over-saturate
   */
  constructor(amount) {
    assert && assert(isFinite(amount), 'Saturate amount should be finite');
    assert && assert(amount >= 0, 'Saturate amount should be non-negative');

    // near https://drafts.fxtf.org/filter-effects/#attr-valuedef-type-huerotate
    super(0.213 + 0.787 * amount, 0.715 - 0.715 * amount, 0.072 - 0.072 * amount, 0, 0, 0.213 - 0.213 * amount, 0.715 - 0.285 * amount, 0.072 - 0.072 * amount, 0, 0, 0.213 - 0.213 * amount, 0.715 - 0.715 * amount, 0.072 - 0.928 * amount, 0, 0, 0, 0, 0, 1, 0);
    this.amount = amount;
  }

  /**
   * Returns the CSS-style filter substring specific to this single filter, e.g. `grayscale(1)`. This should be used for
   * both DOM elements (https://developer.mozilla.org/en-US/docs/Web/CSS/filter) and when supported, Canvas
   * (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter).
   */
  getCSSFilterString() {
    return `saturate(${toSVGNumber(this.amount)})`;
  }
  isDOMCompatible() {
    return true;
  }
}
scenery.register('Saturate', Saturate);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0b1NWR051bWJlciIsIkNvbG9yTWF0cml4RmlsdGVyIiwic2NlbmVyeSIsIlNhdHVyYXRlIiwiY29uc3RydWN0b3IiLCJhbW91bnQiLCJhc3NlcnQiLCJpc0Zpbml0ZSIsImdldENTU0ZpbHRlclN0cmluZyIsImlzRE9NQ29tcGF0aWJsZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2F0dXJhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2F0dXJhdGUgZmlsdGVyXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgdG9TVkdOdW1iZXIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL3RvU1ZHTnVtYmVyLmpzJztcclxuaW1wb3J0IHsgQ29sb3JNYXRyaXhGaWx0ZXIsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNhdHVyYXRlIGV4dGVuZHMgQ29sb3JNYXRyaXhGaWx0ZXIge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGFtb3VudDogbnVtYmVyO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gYW1vdW50IC0gVGhlIGFtb3VudCBvZiB0aGUgZWZmZWN0LCBmcm9tIDAgKG5vIHNhdHVyYXRpb24pLCAxIChub3JtYWwpLCBvciBoaWdoZXIgdG8gb3Zlci1zYXR1cmF0ZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYW1vdW50OiBudW1iZXIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYW1vdW50ICksICdTYXR1cmF0ZSBhbW91bnQgc2hvdWxkIGJlIGZpbml0ZScgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFtb3VudCA+PSAwLCAnU2F0dXJhdGUgYW1vdW50IHNob3VsZCBiZSBub24tbmVnYXRpdmUnICk7XHJcblxyXG4gICAgLy8gbmVhciBodHRwczovL2RyYWZ0cy5meHRmLm9yZy9maWx0ZXItZWZmZWN0cy8jYXR0ci12YWx1ZWRlZi10eXBlLWh1ZXJvdGF0ZVxyXG4gICAgc3VwZXIoXHJcbiAgICAgIDAuMjEzICsgMC43ODcgKiBhbW91bnQsIDAuNzE1IC0gMC43MTUgKiBhbW91bnQsIDAuMDcyIC0gMC4wNzIgKiBhbW91bnQsIDAsIDAsXHJcbiAgICAgIDAuMjEzIC0gMC4yMTMgKiBhbW91bnQsIDAuNzE1IC0gMC4yODUgKiBhbW91bnQsIDAuMDcyIC0gMC4wNzIgKiBhbW91bnQsIDAsIDAsXHJcbiAgICAgIDAuMjEzIC0gMC4yMTMgKiBhbW91bnQsIDAuNzE1IC0gMC43MTUgKiBhbW91bnQsIDAuMDcyIC0gMC45MjggKiBhbW91bnQsIDAsIDAsXHJcbiAgICAgIDAsIDAsIDAsIDEsIDBcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5hbW91bnQgPSBhbW91bnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBDU1Mtc3R5bGUgZmlsdGVyIHN1YnN0cmluZyBzcGVjaWZpYyB0byB0aGlzIHNpbmdsZSBmaWx0ZXIsIGUuZy4gYGdyYXlzY2FsZSgxKWAuIFRoaXMgc2hvdWxkIGJlIHVzZWQgZm9yXHJcbiAgICogYm90aCBET00gZWxlbWVudHMgKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTUy9maWx0ZXIpIGFuZCB3aGVuIHN1cHBvcnRlZCwgQ2FudmFzXHJcbiAgICogKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DYW52YXNSZW5kZXJpbmdDb250ZXh0MkQvZmlsdGVyKS5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0Q1NTRmlsdGVyU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYHNhdHVyYXRlKCR7dG9TVkdOdW1iZXIoIHRoaXMuYW1vdW50ICl9KWA7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgaXNET01Db21wYXRpYmxlKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnU2F0dXJhdGUnLCBTYXR1cmF0ZSApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLGdDQUFnQztBQUN4RCxTQUFTQyxpQkFBaUIsRUFBRUMsT0FBTyxRQUFRLGVBQWU7QUFFMUQsZUFBZSxNQUFNQyxRQUFRLFNBQVNGLGlCQUFpQixDQUFDO0VBSXREO0FBQ0Y7QUFDQTtFQUNTRyxXQUFXQSxDQUFFQyxNQUFjLEVBQUc7SUFDbkNDLE1BQU0sSUFBSUEsTUFBTSxDQUFFQyxRQUFRLENBQUVGLE1BQU8sQ0FBQyxFQUFFLGtDQUFtQyxDQUFDO0lBQzFFQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUQsTUFBTSxJQUFJLENBQUMsRUFBRSx3Q0FBeUMsQ0FBQzs7SUFFekU7SUFDQSxLQUFLLENBQ0gsS0FBSyxHQUFHLEtBQUssR0FBR0EsTUFBTSxFQUFFLEtBQUssR0FBRyxLQUFLLEdBQUdBLE1BQU0sRUFBRSxLQUFLLEdBQUcsS0FBSyxHQUFHQSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFDNUUsS0FBSyxHQUFHLEtBQUssR0FBR0EsTUFBTSxFQUFFLEtBQUssR0FBRyxLQUFLLEdBQUdBLE1BQU0sRUFBRSxLQUFLLEdBQUcsS0FBSyxHQUFHQSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFDNUUsS0FBSyxHQUFHLEtBQUssR0FBR0EsTUFBTSxFQUFFLEtBQUssR0FBRyxLQUFLLEdBQUdBLE1BQU0sRUFBRSxLQUFLLEdBQUcsS0FBSyxHQUFHQSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFDNUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQ2QsQ0FBQztJQUVELElBQUksQ0FBQ0EsTUFBTSxHQUFHQSxNQUFNO0VBQ3RCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDa0JHLGtCQUFrQkEsQ0FBQSxFQUFXO0lBQzNDLE9BQVEsWUFBV1IsV0FBVyxDQUFFLElBQUksQ0FBQ0ssTUFBTyxDQUFFLEdBQUU7RUFDbEQ7RUFFZ0JJLGVBQWVBLENBQUEsRUFBWTtJQUN6QyxPQUFPLElBQUk7RUFDYjtBQUNGO0FBRUFQLE9BQU8sQ0FBQ1EsUUFBUSxDQUFFLFVBQVUsRUFBRVAsUUFBUyxDQUFDIn0=