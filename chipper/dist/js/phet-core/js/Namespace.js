// Copyright 2015-2023, University of Colorado Boulder

/**
 * @author Jonathan Olson
 * @author Chris Malley (PixelZoom, Inc.)
 */

import isHMR from './isHMR.js';
class Namespace {
  /**
   * @param {string} name
   */
  constructor(name) {
    this.name = name; // @public (read-only)

    if (window.phet) {
      // We already create the chipper namespace, so we just attach to it with the register function.
      if (name === 'chipper') {
        window.phet.chipper.name = 'chipper';
        window.phet.chipper.register = this.register.bind(window.phet.chipper);
        return window.phet.chipper; // eslint-disable-line -- we want to provide the namespace API on something already existing
      } else {
        /* TODO: Ideally we should always assert this, but in PhET-iO wrapper code, multiple built modules define the
           TODO: same namespace, this should be fixed in https://github.com/phetsims/phet-io-wrappers/issues/477 */
        const ignoreAssertion = !_.hasIn(window, 'phet.chipper.brand');
        assert && !ignoreAssertion && assert(!window.phet[name], `namespace ${name} already exists`);
        window.phet[name] = this;
      }
    }
  }

  /**
   * Registers a key-value pair with the namespace.
   *
   * If there are no dots ('.') in the key, it will be assigned to the namespace. For example:
   * - x.register( 'A', A );
   * will set x.A = A.
   *
   * If the key contains one or more dots ('.'), it's treated somewhat like a path expression. For instance, if the
   * following is called:
   * - x.register( 'A.B.C', C );
   * then the register function will navigate to the object x.A.B and add x.A.B.C = C.
   *
   * @param {string} key
   * @param {*} value
   * @returns {*} value, for chaining
   * @public
   */
  register(key, value) {
    // When using hot module replacement, a module will be loaded and initialized twice, and hence its namespace.register
    // function will be called twice.  This should not be an assertion error.

    // If the key isn't compound (doesn't contain '.'), we can just look it up on this namespace
    if (key.indexOf('.') < 0) {
      if (!isHMR) {
        assert && assert(!this[key], `${key} is already registered for namespace ${this.name}`);
      }
      this[key] = value;
    }
    // Compound (contains '.' at least once). x.register( 'A.B.C', C ) should set x.A.B.C.
    else {
      const keys = key.split('.'); // e.g. [ 'A', 'B', 'C' ]

      // Walk into the namespace, verifying that each level exists. e.g. parent => x.A.B
      let parent = this; // eslint-disable-line consistent-this
      for (let i = 0; i < keys.length - 1; i++) {
        // for all but the last key

        if (!isHMR) {
          assert && assert(!!parent[keys[i]], `${[this.name].concat(keys.slice(0, i + 1)).join('.')} needs to be defined to register ${key}`);
        }
        parent = parent[keys[i]];
      }

      // Write into the inner namespace, e.g. x.A.B[ 'C' ] = C
      const lastKey = keys[keys.length - 1];
      if (!isHMR) {
        assert && assert(!parent[lastKey], `${key} is already registered for namespace ${this.name}`);
      }
      parent[lastKey] = value;
    }
    return value;
  }
}
export default Namespace;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc0hNUiIsIk5hbWVzcGFjZSIsImNvbnN0cnVjdG9yIiwibmFtZSIsIndpbmRvdyIsInBoZXQiLCJjaGlwcGVyIiwicmVnaXN0ZXIiLCJiaW5kIiwiaWdub3JlQXNzZXJ0aW9uIiwiXyIsImhhc0luIiwiYXNzZXJ0Iiwia2V5IiwidmFsdWUiLCJpbmRleE9mIiwia2V5cyIsInNwbGl0IiwicGFyZW50IiwiaSIsImxlbmd0aCIsImNvbmNhdCIsInNsaWNlIiwiam9pbiIsImxhc3RLZXkiXSwic291cmNlcyI6WyJOYW1lc3BhY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvblxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBpc0hNUiBmcm9tICcuL2lzSE1SLmpzJztcclxuXHJcbmNsYXNzIE5hbWVzcGFjZSB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbmFtZSApIHtcclxuXHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lOyAvLyBAcHVibGljIChyZWFkLW9ubHkpXHJcblxyXG4gICAgaWYgKCB3aW5kb3cucGhldCApIHtcclxuICAgICAgLy8gV2UgYWxyZWFkeSBjcmVhdGUgdGhlIGNoaXBwZXIgbmFtZXNwYWNlLCBzbyB3ZSBqdXN0IGF0dGFjaCB0byBpdCB3aXRoIHRoZSByZWdpc3RlciBmdW5jdGlvbi5cclxuICAgICAgaWYgKCBuYW1lID09PSAnY2hpcHBlcicgKSB7XHJcbiAgICAgICAgd2luZG93LnBoZXQuY2hpcHBlci5uYW1lID0gJ2NoaXBwZXInO1xyXG4gICAgICAgIHdpbmRvdy5waGV0LmNoaXBwZXIucmVnaXN0ZXIgPSB0aGlzLnJlZ2lzdGVyLmJpbmQoIHdpbmRvdy5waGV0LmNoaXBwZXIgKTtcclxuICAgICAgICByZXR1cm4gd2luZG93LnBoZXQuY2hpcHBlcjsgLy8gZXNsaW50LWRpc2FibGUtbGluZSAtLSB3ZSB3YW50IHRvIHByb3ZpZGUgdGhlIG5hbWVzcGFjZSBBUEkgb24gc29tZXRoaW5nIGFscmVhZHkgZXhpc3RpbmdcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvKiBUT0RPOiBJZGVhbGx5IHdlIHNob3VsZCBhbHdheXMgYXNzZXJ0IHRoaXMsIGJ1dCBpbiBQaEVULWlPIHdyYXBwZXIgY29kZSwgbXVsdGlwbGUgYnVpbHQgbW9kdWxlcyBkZWZpbmUgdGhlXHJcbiAgICAgICAgICAgVE9ETzogc2FtZSBuYW1lc3BhY2UsIHRoaXMgc2hvdWxkIGJlIGZpeGVkIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvLXdyYXBwZXJzL2lzc3Vlcy80NzcgKi9cclxuICAgICAgICBjb25zdCBpZ25vcmVBc3NlcnRpb24gPSAhXy5oYXNJbiggd2luZG93LCAncGhldC5jaGlwcGVyLmJyYW5kJyApO1xyXG4gICAgICAgIGFzc2VydCAmJiAhaWdub3JlQXNzZXJ0aW9uICYmIGFzc2VydCggIXdpbmRvdy5waGV0WyBuYW1lIF0sIGBuYW1lc3BhY2UgJHtuYW1lfSBhbHJlYWR5IGV4aXN0c2AgKTtcclxuICAgICAgICB3aW5kb3cucGhldFsgbmFtZSBdID0gdGhpcztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVnaXN0ZXJzIGEga2V5LXZhbHVlIHBhaXIgd2l0aCB0aGUgbmFtZXNwYWNlLlxyXG4gICAqXHJcbiAgICogSWYgdGhlcmUgYXJlIG5vIGRvdHMgKCcuJykgaW4gdGhlIGtleSwgaXQgd2lsbCBiZSBhc3NpZ25lZCB0byB0aGUgbmFtZXNwYWNlLiBGb3IgZXhhbXBsZTpcclxuICAgKiAtIHgucmVnaXN0ZXIoICdBJywgQSApO1xyXG4gICAqIHdpbGwgc2V0IHguQSA9IEEuXHJcbiAgICpcclxuICAgKiBJZiB0aGUga2V5IGNvbnRhaW5zIG9uZSBvciBtb3JlIGRvdHMgKCcuJyksIGl0J3MgdHJlYXRlZCBzb21ld2hhdCBsaWtlIGEgcGF0aCBleHByZXNzaW9uLiBGb3IgaW5zdGFuY2UsIGlmIHRoZVxyXG4gICAqIGZvbGxvd2luZyBpcyBjYWxsZWQ6XHJcbiAgICogLSB4LnJlZ2lzdGVyKCAnQS5CLkMnLCBDICk7XHJcbiAgICogdGhlbiB0aGUgcmVnaXN0ZXIgZnVuY3Rpb24gd2lsbCBuYXZpZ2F0ZSB0byB0aGUgb2JqZWN0IHguQS5CIGFuZCBhZGQgeC5BLkIuQyA9IEMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XHJcbiAgICogQHBhcmFtIHsqfSB2YWx1ZVxyXG4gICAqIEByZXR1cm5zIHsqfSB2YWx1ZSwgZm9yIGNoYWluaW5nXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlZ2lzdGVyKCBrZXksIHZhbHVlICkge1xyXG5cclxuICAgIC8vIFdoZW4gdXNpbmcgaG90IG1vZHVsZSByZXBsYWNlbWVudCwgYSBtb2R1bGUgd2lsbCBiZSBsb2FkZWQgYW5kIGluaXRpYWxpemVkIHR3aWNlLCBhbmQgaGVuY2UgaXRzIG5hbWVzcGFjZS5yZWdpc3RlclxyXG4gICAgLy8gZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgdHdpY2UuICBUaGlzIHNob3VsZCBub3QgYmUgYW4gYXNzZXJ0aW9uIGVycm9yLlxyXG5cclxuICAgIC8vIElmIHRoZSBrZXkgaXNuJ3QgY29tcG91bmQgKGRvZXNuJ3QgY29udGFpbiAnLicpLCB3ZSBjYW4ganVzdCBsb29rIGl0IHVwIG9uIHRoaXMgbmFtZXNwYWNlXHJcbiAgICBpZiAoIGtleS5pbmRleE9mKCAnLicgKSA8IDAgKSB7XHJcbiAgICAgIGlmICggIWlzSE1SICkge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzWyBrZXkgXSwgYCR7a2V5fSBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQgZm9yIG5hbWVzcGFjZSAke3RoaXMubmFtZX1gICk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpc1sga2V5IF0gPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIC8vIENvbXBvdW5kIChjb250YWlucyAnLicgYXQgbGVhc3Qgb25jZSkuIHgucmVnaXN0ZXIoICdBLkIuQycsIEMgKSBzaG91bGQgc2V0IHguQS5CLkMuXHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3Qga2V5cyA9IGtleS5zcGxpdCggJy4nICk7IC8vIGUuZy4gWyAnQScsICdCJywgJ0MnIF1cclxuXHJcbiAgICAgIC8vIFdhbGsgaW50byB0aGUgbmFtZXNwYWNlLCB2ZXJpZnlpbmcgdGhhdCBlYWNoIGxldmVsIGV4aXN0cy4gZS5nLiBwYXJlbnQgPT4geC5BLkJcclxuICAgICAgbGV0IHBhcmVudCA9IHRoaXM7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY29uc2lzdGVudC10aGlzXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoIC0gMTsgaSsrICkgeyAvLyBmb3IgYWxsIGJ1dCB0aGUgbGFzdCBrZXlcclxuXHJcbiAgICAgICAgaWYgKCAhaXNITVIgKSB7XHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhIXBhcmVudFsga2V5c1sgaSBdIF0sXHJcbiAgICAgICAgICAgIGAke1sgdGhpcy5uYW1lIF0uY29uY2F0KCBrZXlzLnNsaWNlKCAwLCBpICsgMSApICkuam9pbiggJy4nICl9IG5lZWRzIHRvIGJlIGRlZmluZWQgdG8gcmVnaXN0ZXIgJHtrZXl9YCApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGFyZW50ID0gcGFyZW50WyBrZXlzWyBpIF0gXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gV3JpdGUgaW50byB0aGUgaW5uZXIgbmFtZXNwYWNlLCBlLmcuIHguQS5CWyAnQycgXSA9IENcclxuICAgICAgY29uc3QgbGFzdEtleSA9IGtleXNbIGtleXMubGVuZ3RoIC0gMSBdO1xyXG5cclxuICAgICAgaWYgKCAhaXNITVIgKSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXBhcmVudFsgbGFzdEtleSBdLCBgJHtrZXl9IGlzIGFscmVhZHkgcmVnaXN0ZXJlZCBmb3IgbmFtZXNwYWNlICR7dGhpcy5uYW1lfWAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGFyZW50WyBsYXN0S2V5IF0gPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBOYW1lc3BhY2U7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sWUFBWTtBQUU5QixNQUFNQyxTQUFTLENBQUM7RUFDZDtBQUNGO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsSUFBSSxFQUFHO0lBRWxCLElBQUksQ0FBQ0EsSUFBSSxHQUFHQSxJQUFJLENBQUMsQ0FBQzs7SUFFbEIsSUFBS0MsTUFBTSxDQUFDQyxJQUFJLEVBQUc7TUFDakI7TUFDQSxJQUFLRixJQUFJLEtBQUssU0FBUyxFQUFHO1FBQ3hCQyxNQUFNLENBQUNDLElBQUksQ0FBQ0MsT0FBTyxDQUFDSCxJQUFJLEdBQUcsU0FBUztRQUNwQ0MsTUFBTSxDQUFDQyxJQUFJLENBQUNDLE9BQU8sQ0FBQ0MsUUFBUSxHQUFHLElBQUksQ0FBQ0EsUUFBUSxDQUFDQyxJQUFJLENBQUVKLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDQyxPQUFRLENBQUM7UUFDeEUsT0FBT0YsTUFBTSxDQUFDQyxJQUFJLENBQUNDLE9BQU8sQ0FBQyxDQUFDO01BQzlCLENBQUMsTUFDSTtRQUNIO0FBQ1I7UUFDUSxNQUFNRyxlQUFlLEdBQUcsQ0FBQ0MsQ0FBQyxDQUFDQyxLQUFLLENBQUVQLE1BQU0sRUFBRSxvQkFBcUIsQ0FBQztRQUNoRVEsTUFBTSxJQUFJLENBQUNILGVBQWUsSUFBSUcsTUFBTSxDQUFFLENBQUNSLE1BQU0sQ0FBQ0MsSUFBSSxDQUFFRixJQUFJLENBQUUsRUFBRyxhQUFZQSxJQUFLLGlCQUFpQixDQUFDO1FBQ2hHQyxNQUFNLENBQUNDLElBQUksQ0FBRUYsSUFBSSxDQUFFLEdBQUcsSUFBSTtNQUM1QjtJQUNGO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSSxRQUFRQSxDQUFFTSxHQUFHLEVBQUVDLEtBQUssRUFBRztJQUVyQjtJQUNBOztJQUVBO0lBQ0EsSUFBS0QsR0FBRyxDQUFDRSxPQUFPLENBQUUsR0FBSSxDQUFDLEdBQUcsQ0FBQyxFQUFHO01BQzVCLElBQUssQ0FBQ2YsS0FBSyxFQUFHO1FBQ1pZLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUMsSUFBSSxDQUFFQyxHQUFHLENBQUUsRUFBRyxHQUFFQSxHQUFJLHdDQUF1QyxJQUFJLENBQUNWLElBQUssRUFBRSxDQUFDO01BQzdGO01BQ0EsSUFBSSxDQUFFVSxHQUFHLENBQUUsR0FBR0MsS0FBSztJQUNyQjtJQUNBO0lBQUEsS0FDSztNQUNILE1BQU1FLElBQUksR0FBR0gsR0FBRyxDQUFDSSxLQUFLLENBQUUsR0FBSSxDQUFDLENBQUMsQ0FBQzs7TUFFL0I7TUFDQSxJQUFJQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUM7TUFDbkIsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdILElBQUksQ0FBQ0ksTUFBTSxHQUFHLENBQUMsRUFBRUQsQ0FBQyxFQUFFLEVBQUc7UUFBRTs7UUFFNUMsSUFBSyxDQUFDbkIsS0FBSyxFQUFHO1VBQ1pZLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUMsQ0FBQ00sTUFBTSxDQUFFRixJQUFJLENBQUVHLENBQUMsQ0FBRSxDQUFFLEVBQ3BDLEdBQUUsQ0FBRSxJQUFJLENBQUNoQixJQUFJLENBQUUsQ0FBQ2tCLE1BQU0sQ0FBRUwsSUFBSSxDQUFDTSxLQUFLLENBQUUsQ0FBQyxFQUFFSCxDQUFDLEdBQUcsQ0FBRSxDQUFFLENBQUMsQ0FBQ0ksSUFBSSxDQUFFLEdBQUksQ0FBRSxvQ0FBbUNWLEdBQUksRUFBRSxDQUFDO1FBQzVHO1FBRUFLLE1BQU0sR0FBR0EsTUFBTSxDQUFFRixJQUFJLENBQUVHLENBQUMsQ0FBRSxDQUFFO01BQzlCOztNQUVBO01BQ0EsTUFBTUssT0FBTyxHQUFHUixJQUFJLENBQUVBLElBQUksQ0FBQ0ksTUFBTSxHQUFHLENBQUMsQ0FBRTtNQUV2QyxJQUFLLENBQUNwQixLQUFLLEVBQUc7UUFDWlksTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQ00sTUFBTSxDQUFFTSxPQUFPLENBQUUsRUFBRyxHQUFFWCxHQUFJLHdDQUF1QyxJQUFJLENBQUNWLElBQUssRUFBRSxDQUFDO01BQ25HO01BRUFlLE1BQU0sQ0FBRU0sT0FBTyxDQUFFLEdBQUdWLEtBQUs7SUFDM0I7SUFFQSxPQUFPQSxLQUFLO0VBQ2Q7QUFDRjtBQUVBLGVBQWViLFNBQVMifQ==