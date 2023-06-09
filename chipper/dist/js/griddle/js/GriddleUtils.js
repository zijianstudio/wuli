// Copyright 2020, University of Colorado Boulder

/**
 * Utilities used by griddle.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 *
 * @deprecated - please use bamboo
 */

import deprecationWarning from '../../phet-core/js/deprecationWarning.js';
import griddle from './griddle.js';
const GriddleUtils = {
  /**
   * Returns values between min<=value<=max such that value = anchor + n*delta, where n is any integer
   * @param {number} min - minimum value (inclusive)
   * @param {number} max - maximum value (inclusive)
   * @param {number} [delta] - spacing
   * @param {number} [anchor] - origin or value guaranteed to match, typically zero
   * @returns {number[]}
   * @public
   */
  getValuesInRangeWithAnchor(min, max, delta = 1, anchor = 0) {
    assert && deprecationWarning('Please use bamboo');
    const nMin = Math.floor((min - anchor) / delta);
    const nMax = Math.ceil((max - anchor) / delta);
    const results = [];
    for (let n = nMin; n <= nMax; n++) {
      const result = anchor + n * delta;
      if (result >= min && result <= max) {
        results.push(result);
      }
    }
    return results;
  }
};
griddle.register('GriddleUtils', GriddleUtils);
export default GriddleUtils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkZXByZWNhdGlvbldhcm5pbmciLCJncmlkZGxlIiwiR3JpZGRsZVV0aWxzIiwiZ2V0VmFsdWVzSW5SYW5nZVdpdGhBbmNob3IiLCJtaW4iLCJtYXgiLCJkZWx0YSIsImFuY2hvciIsImFzc2VydCIsIm5NaW4iLCJNYXRoIiwiZmxvb3IiLCJuTWF4IiwiY2VpbCIsInJlc3VsdHMiLCJuIiwicmVzdWx0IiwicHVzaCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR3JpZGRsZVV0aWxzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBVdGlsaXRpZXMgdXNlZCBieSBncmlkZGxlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKlxyXG4gKiBAZGVwcmVjYXRlZCAtIHBsZWFzZSB1c2UgYmFtYm9vXHJcbiAqL1xyXG5cclxuaW1wb3J0IGRlcHJlY2F0aW9uV2FybmluZyBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZGVwcmVjYXRpb25XYXJuaW5nLmpzJztcclxuaW1wb3J0IGdyaWRkbGUgZnJvbSAnLi9ncmlkZGxlLmpzJztcclxuXHJcbmNvbnN0IEdyaWRkbGVVdGlscyA9IHtcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB2YWx1ZXMgYmV0d2VlbiBtaW48PXZhbHVlPD1tYXggc3VjaCB0aGF0IHZhbHVlID0gYW5jaG9yICsgbipkZWx0YSwgd2hlcmUgbiBpcyBhbnkgaW50ZWdlclxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gLSBtaW5pbXVtIHZhbHVlIChpbmNsdXNpdmUpXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1heCAtIG1heGltdW0gdmFsdWUgKGluY2x1c2l2ZSlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gW2RlbHRhXSAtIHNwYWNpbmdcclxuICAgKiBAcGFyYW0ge251bWJlcn0gW2FuY2hvcl0gLSBvcmlnaW4gb3IgdmFsdWUgZ3VhcmFudGVlZCB0byBtYXRjaCwgdHlwaWNhbGx5IHplcm9cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyW119XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFZhbHVlc0luUmFuZ2VXaXRoQW5jaG9yKCBtaW4sIG1heCwgZGVsdGEgPSAxLCBhbmNob3IgPSAwICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBkZXByZWNhdGlvbldhcm5pbmcoICdQbGVhc2UgdXNlIGJhbWJvbycgKTtcclxuXHJcbiAgICBjb25zdCBuTWluID0gTWF0aC5mbG9vciggKCBtaW4gLSBhbmNob3IgKSAvIGRlbHRhICk7XHJcbiAgICBjb25zdCBuTWF4ID0gTWF0aC5jZWlsKCAoIG1heCAtIGFuY2hvciApIC8gZGVsdGEgKTtcclxuXHJcbiAgICBjb25zdCByZXN1bHRzID0gW107XHJcbiAgICBmb3IgKCBsZXQgbiA9IG5NaW47IG4gPD0gbk1heDsgbisrICkge1xyXG4gICAgICBjb25zdCByZXN1bHQgPSBhbmNob3IgKyBuICogZGVsdGE7XHJcbiAgICAgIGlmICggcmVzdWx0ID49IG1pbiAmJiByZXN1bHQgPD0gbWF4ICkge1xyXG4gICAgICAgIHJlc3VsdHMucHVzaCggcmVzdWx0ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHRzO1xyXG4gIH1cclxufTtcclxuXHJcbmdyaWRkbGUucmVnaXN0ZXIoICdHcmlkZGxlVXRpbHMnLCBHcmlkZGxlVXRpbHMgKTtcclxuZXhwb3J0IGRlZmF1bHQgR3JpZGRsZVV0aWxzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0Esa0JBQWtCLE1BQU0sMENBQTBDO0FBQ3pFLE9BQU9DLE9BQU8sTUFBTSxjQUFjO0FBRWxDLE1BQU1DLFlBQVksR0FBRztFQUVuQjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsMEJBQTBCQSxDQUFFQyxHQUFHLEVBQUVDLEdBQUcsRUFBRUMsS0FBSyxHQUFHLENBQUMsRUFBRUMsTUFBTSxHQUFHLENBQUMsRUFBRztJQUU1REMsTUFBTSxJQUFJUixrQkFBa0IsQ0FBRSxtQkFBb0IsQ0FBQztJQUVuRCxNQUFNUyxJQUFJLEdBQUdDLElBQUksQ0FBQ0MsS0FBSyxDQUFFLENBQUVQLEdBQUcsR0FBR0csTUFBTSxJQUFLRCxLQUFNLENBQUM7SUFDbkQsTUFBTU0sSUFBSSxHQUFHRixJQUFJLENBQUNHLElBQUksQ0FBRSxDQUFFUixHQUFHLEdBQUdFLE1BQU0sSUFBS0QsS0FBTSxDQUFDO0lBRWxELE1BQU1RLE9BQU8sR0FBRyxFQUFFO0lBQ2xCLEtBQU0sSUFBSUMsQ0FBQyxHQUFHTixJQUFJLEVBQUVNLENBQUMsSUFBSUgsSUFBSSxFQUFFRyxDQUFDLEVBQUUsRUFBRztNQUNuQyxNQUFNQyxNQUFNLEdBQUdULE1BQU0sR0FBR1EsQ0FBQyxHQUFHVCxLQUFLO01BQ2pDLElBQUtVLE1BQU0sSUFBSVosR0FBRyxJQUFJWSxNQUFNLElBQUlYLEdBQUcsRUFBRztRQUNwQ1MsT0FBTyxDQUFDRyxJQUFJLENBQUVELE1BQU8sQ0FBQztNQUN4QjtJQUNGO0lBQ0EsT0FBT0YsT0FBTztFQUNoQjtBQUNGLENBQUM7QUFFRGIsT0FBTyxDQUFDaUIsUUFBUSxDQUFFLGNBQWMsRUFBRWhCLFlBQWEsQ0FBQztBQUNoRCxlQUFlQSxZQUFZIn0=