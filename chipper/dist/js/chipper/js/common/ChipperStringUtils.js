// Copyright 2015-2023, University of Colorado Boulder

/**
 * String utilities used throughout chipper.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

/* eslint-env node */

const assert = require('assert');
const _ = require('lodash');

// What divides the repo prefix from the rest of the string key, like `FRICTION/friction.title`
const NAMESPACE_PREFIX_DIVIDER = '/';
const A11Y_MARKER = 'a11y.';
const ChipperStringUtils = {
  /**
   * Pad LTR/RTL language values with unicode embedding marks (see https://github.com/phetsims/joist/issues/152)
   * Uses directional formatting characters: http://unicode.org/reports/tr9/#Directional_Formatting_Characters
   *
   * @param {string} str
   * @param {boolean} isRTL
   * @returns {string} the input string padded with the embedding marks, or an empty string if the input was empty
   */
  addDirectionalFormatting: function (str, isRTL) {
    if (str.length > 0) {
      return `${(isRTL ? '\u202b' : '\u202a') + str}\u202c`;
    } else {
      return str;
    }
  },
  /**
   * Appends spaces to a string
   *
   * @param {string} str - the input string
   * @param {number} n - number of spaces to append
   * @returns {string} a new string
   */
  padString: function (str, n) {
    while (str.length < n) {
      str += ' ';
    }
    return str;
  },
  /**
   * Replaces all occurrences of {string} find with {string} replace in {string} str
   *
   * @param {string} str - the input string
   * @param {string} find - the string to find
   * @param {string} replaceWith - the string to replace find with
   * @returns {string} a new string
   */
  replaceAll: function (str, find, replaceWith) {
    return str.replace(new RegExp(find.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replaceWith);
  },
  // TODO chipper#316 determine why this behaves differently than str.replace for some cases (eg, 'MAIN_INLINE_JAVASCRIPT')
  /**
   * Replaces the first occurrence of {string} find with {string} replaceWith in {string} str
   *
   * @param {string} str - the input string
   * @param {string} find - the string to find
   * @param {string} replaceWith - the string to replace find with
   * @returns {string} a new string
   */
  replaceFirst: function (str, find, replaceWith) {
    const idx = str.indexOf(find);
    if (str.indexOf(find) !== -1) {
      return str.slice(0, idx) + replaceWith + str.slice(idx + find.length);
    } else {
      return str;
    }
  },
  /**
   * Returns a string with all of the keys of the mapping replaced with the values.
   * @public
   *
   * @param {string} str
   * @param {Object} mapping
   * @returns {string}
   */
  replacePlaceholders: function (str, mapping) {
    Object.keys(mapping).forEach(key => {
      const replacement = mapping[key];
      key = `{{${key}}}`;
      let index;
      while ((index = str.indexOf(key)) >= 0) {
        str = str.slice(0, index) + replacement + str.slice(index + key.length);
      }
    });
    Object.keys(mapping).forEach(key => {
      if (str.indexOf(`{{${key}}}`) >= 0) {
        throw new Error(`Template string detected in placeholders: ${key}\n\n${str.slice(0, str.indexOf(`{{${key}}}`) + 10)}`);
      }
    });
    return str;
  },
  /**
   * Recurse through a string file and format each string value appropriately
   * @param {StringMap} stringMap
   * @param {boolean} isRTL - is right to left language
   * @param {boolean} [assertNoWhitespace] - when true, assert that trimming each string value doesn't change the string.
   * @public
   */
  formatStringValues: function (stringMap, isRTL, assertNoWhitespace) {
    ChipperStringUtils.forEachString(stringMap, (key, stringObject) => {
      assert && assertNoWhitespace && assert(stringObject.value === stringObject.value.trim(), `String should not have trailing or leading whitespace, key: ${key}, value: "${stringObject.value}"`);

      // remove leading/trailing whitespace, see chipper#619. Do this before addDirectionalFormatting
      stringObject.value = ChipperStringUtils.addDirectionalFormatting(stringObject.value.trim(), isRTL);
    });
  },
  /**
   * Given a key, get the appropriate string from the "map" object, or null if the key does not appear in the map.
   * This method is called in unbuilt mode from the string plugin and during the build via CHIPPER/getStringMap.
   * This method supports recursing through keys that support string nesting. This method was created to support
   * nested string keys in https://github.com/phetsims/rosetta/issues/193
   * @param {StringMap} map - where an "intermediate" Object should hold nested strings
   * @param {string} key - like `FRICTION/friction.title` or using nesting like `a11y.nested.string.here`
   * @returns {Object|null} - the string entry of the key, or null if the key does not appear in the map
   * @throws  {Error} - if the key doesn't hold a string value in the map
   * @public
   */
  getStringEntryFromMap(map, key) {
    if (key.indexOf(NAMESPACE_PREFIX_DIVIDER) >= 0) {
      throw new Error('getStringEntryFromMap key should not have REPO/');
    }

    // Lodash gives precedence to  "key1.key2" over "key1:{key2}", so we do too.
    const result = _.at(map, key)[0];
    if (result) {
      if (result.value === undefined) {
        throw new Error(`no value for string: ${key}`);
      }
      if (typeof result.value !== 'string') {
        throw new Error(`value should be a string for key ${key}`);
      }

      // Until rosetta supports nested strings in https://github.com/phetsims/rosetta/issues/215, keep this assertion.
      // This should be after because the above errors are more specific. This is better as a fallback.
      assert && !ChipperStringUtils.isA11yStringKey(key) && assert(map[key], `nested strings are not allowed outside of a11y string object for key: ${key}`);
      return result;
    }

    // They key does not appear in the map
    return null;
  },
  /**
   * @public
   * @param {string} key - without "string!REPO" at the beginning, just the actual "string key"
   * @returns {boolean}
   */
  isA11yStringKey(key) {
    return key.indexOf(ChipperStringUtils.A11Y_MARKER) === 0;
  },
  /**
   * The start of any a11y specific string key.
   * @public
   * @type {string}
   */
  A11Y_MARKER: A11Y_MARKER,
  /**
   * Call a function on each object with a "value" attribute in an object tree.
   * @param {StringMap} map - string map, like a loaded JSON strings file
   * @param {function(key:string, StringObject)} func
   * @param {string} [keySoFar] - while recursing, build up a string of the key separated with dots.
   * @public
   */
  forEachString(map, func, keySoFar = '') {
    for (const key in map) {
      if (map.hasOwnProperty(key)) {
        const nextKey = keySoFar ? `${keySoFar}.${key}` : key; // don't start with period, assumes '' is falsey
        const stringObject = map[key];

        // no need to support non-object, null, or arrays in the string map, for example stringObject.history in
        // locale specific files.
        if (typeof stringObject !== 'object' || stringObject === null || Array.isArray(stringObject)) {
          continue;
        }
        if (stringObject.value) {
          func(nextKey, stringObject);
        }

        // recurse to the next level since if it wasn't the `value` key
        key !== 'value' && ChipperStringUtils.forEachString(stringObject, func, nextKey);
      }
    }
  }
};

/**
 * @typedef {Object} StringMapNode
 * @property {StringMapNode} * - A key that stores a StringMapNode inside this one.
 */
/**
 * @typedef {Object} StringObject
 * An object that has a "value" field that holds the string. It can still include more nested `StringObject`s.
 * Each StringMapNode should have at least one StringObject nested inside it.
 * @extends {StringMapNode}
 * @property {string} value - the value key is used in
 */
/**
 * @typedef {Object.<string, StringMapNode>>} StringMap
 * @extends {StringMapNode}
 * A string map can be either a flat map of StringObject (see the output of CHIPPER/getStringMap), or can be a nested
 * Object with StringObjects throughout the object structure (as supported in English JSON string files).
 */

module.exports = ChipperStringUtils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3NlcnQiLCJyZXF1aXJlIiwiXyIsIk5BTUVTUEFDRV9QUkVGSVhfRElWSURFUiIsIkExMVlfTUFSS0VSIiwiQ2hpcHBlclN0cmluZ1V0aWxzIiwiYWRkRGlyZWN0aW9uYWxGb3JtYXR0aW5nIiwic3RyIiwiaXNSVEwiLCJsZW5ndGgiLCJwYWRTdHJpbmciLCJuIiwicmVwbGFjZUFsbCIsImZpbmQiLCJyZXBsYWNlV2l0aCIsInJlcGxhY2UiLCJSZWdFeHAiLCJyZXBsYWNlRmlyc3QiLCJpZHgiLCJpbmRleE9mIiwic2xpY2UiLCJyZXBsYWNlUGxhY2Vob2xkZXJzIiwibWFwcGluZyIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwia2V5IiwicmVwbGFjZW1lbnQiLCJpbmRleCIsIkVycm9yIiwiZm9ybWF0U3RyaW5nVmFsdWVzIiwic3RyaW5nTWFwIiwiYXNzZXJ0Tm9XaGl0ZXNwYWNlIiwiZm9yRWFjaFN0cmluZyIsInN0cmluZ09iamVjdCIsInZhbHVlIiwidHJpbSIsImdldFN0cmluZ0VudHJ5RnJvbU1hcCIsIm1hcCIsInJlc3VsdCIsImF0IiwidW5kZWZpbmVkIiwiaXNBMTF5U3RyaW5nS2V5IiwiZnVuYyIsImtleVNvRmFyIiwiaGFzT3duUHJvcGVydHkiLCJuZXh0S2V5IiwiQXJyYXkiLCJpc0FycmF5IiwibW9kdWxlIiwiZXhwb3J0cyJdLCJzb3VyY2VzIjpbIkNoaXBwZXJTdHJpbmdVdGlscy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTdHJpbmcgdXRpbGl0aWVzIHVzZWQgdGhyb3VnaG91dCBjaGlwcGVyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuLyogZXNsaW50LWVudiBub2RlICovXHJcblxyXG5cclxuY29uc3QgYXNzZXJ0ID0gcmVxdWlyZSggJ2Fzc2VydCcgKTtcclxuY29uc3QgXyA9IHJlcXVpcmUoICdsb2Rhc2gnICk7XHJcblxyXG4vLyBXaGF0IGRpdmlkZXMgdGhlIHJlcG8gcHJlZml4IGZyb20gdGhlIHJlc3Qgb2YgdGhlIHN0cmluZyBrZXksIGxpa2UgYEZSSUNUSU9OL2ZyaWN0aW9uLnRpdGxlYFxyXG5jb25zdCBOQU1FU1BBQ0VfUFJFRklYX0RJVklERVIgPSAnLyc7XHJcbmNvbnN0IEExMVlfTUFSS0VSID0gJ2ExMXkuJztcclxuXHJcbmNvbnN0IENoaXBwZXJTdHJpbmdVdGlscyA9IHtcclxuXHJcbiAgLyoqXHJcbiAgICogUGFkIExUUi9SVEwgbGFuZ3VhZ2UgdmFsdWVzIHdpdGggdW5pY29kZSBlbWJlZGRpbmcgbWFya3MgKHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzE1MilcclxuICAgKiBVc2VzIGRpcmVjdGlvbmFsIGZvcm1hdHRpbmcgY2hhcmFjdGVyczogaHR0cDovL3VuaWNvZGUub3JnL3JlcG9ydHMvdHI5LyNEaXJlY3Rpb25hbF9Gb3JtYXR0aW5nX0NoYXJhY3RlcnNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzUlRMXHJcbiAgICogQHJldHVybnMge3N0cmluZ30gdGhlIGlucHV0IHN0cmluZyBwYWRkZWQgd2l0aCB0aGUgZW1iZWRkaW5nIG1hcmtzLCBvciBhbiBlbXB0eSBzdHJpbmcgaWYgdGhlIGlucHV0IHdhcyBlbXB0eVxyXG4gICAqL1xyXG4gIGFkZERpcmVjdGlvbmFsRm9ybWF0dGluZzogZnVuY3Rpb24oIHN0ciwgaXNSVEwgKSB7XHJcbiAgICBpZiAoIHN0ci5sZW5ndGggPiAwICkge1xyXG4gICAgICByZXR1cm4gYCR7KCBpc1JUTCA/ICdcXHUyMDJiJyA6ICdcXHUyMDJhJyApICsgc3RyfVxcdTIwMmNgO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBzdHI7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQXBwZW5kcyBzcGFjZXMgdG8gYSBzdHJpbmdcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgLSB0aGUgaW5wdXQgc3RyaW5nXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG4gLSBudW1iZXIgb2Ygc3BhY2VzIHRvIGFwcGVuZFxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IGEgbmV3IHN0cmluZ1xyXG4gICAqL1xyXG4gIHBhZFN0cmluZzogZnVuY3Rpb24oIHN0ciwgbiApIHtcclxuICAgIHdoaWxlICggc3RyLmxlbmd0aCA8IG4gKSB7XHJcbiAgICAgIHN0ciArPSAnICc7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3RyO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlcGxhY2VzIGFsbCBvY2N1cnJlbmNlcyBvZiB7c3RyaW5nfSBmaW5kIHdpdGgge3N0cmluZ30gcmVwbGFjZSBpbiB7c3RyaW5nfSBzdHJcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgLSB0aGUgaW5wdXQgc3RyaW5nXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbmQgLSB0aGUgc3RyaW5nIHRvIGZpbmRcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVwbGFjZVdpdGggLSB0aGUgc3RyaW5nIHRvIHJlcGxhY2UgZmluZCB3aXRoXHJcbiAgICogQHJldHVybnMge3N0cmluZ30gYSBuZXcgc3RyaW5nXHJcbiAgICovXHJcbiAgcmVwbGFjZUFsbDogZnVuY3Rpb24oIHN0ciwgZmluZCwgcmVwbGFjZVdpdGggKSB7XHJcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoIG5ldyBSZWdFeHAoIGZpbmQucmVwbGFjZSggL1stL1xcXFxeJCorPy4oKXxbXFxde31dL2csICdcXFxcJCYnICksICdnJyApLCByZXBsYWNlV2l0aCApO1xyXG4gIH0sXHJcblxyXG4gIC8vIFRPRE8gY2hpcHBlciMzMTYgZGV0ZXJtaW5lIHdoeSB0aGlzIGJlaGF2ZXMgZGlmZmVyZW50bHkgdGhhbiBzdHIucmVwbGFjZSBmb3Igc29tZSBjYXNlcyAoZWcsICdNQUlOX0lOTElORV9KQVZBU0NSSVBUJylcclxuICAvKipcclxuICAgKiBSZXBsYWNlcyB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB7c3RyaW5nfSBmaW5kIHdpdGgge3N0cmluZ30gcmVwbGFjZVdpdGggaW4ge3N0cmluZ30gc3RyXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyIC0gdGhlIGlucHV0IHN0cmluZ1xyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaW5kIC0gdGhlIHN0cmluZyB0byBmaW5kXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlcGxhY2VXaXRoIC0gdGhlIHN0cmluZyB0byByZXBsYWNlIGZpbmQgd2l0aFxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IGEgbmV3IHN0cmluZ1xyXG4gICAqL1xyXG4gIHJlcGxhY2VGaXJzdDogZnVuY3Rpb24oIHN0ciwgZmluZCwgcmVwbGFjZVdpdGggKSB7XHJcbiAgICBjb25zdCBpZHggPSBzdHIuaW5kZXhPZiggZmluZCApO1xyXG4gICAgaWYgKCBzdHIuaW5kZXhPZiggZmluZCApICE9PSAtMSApIHtcclxuICAgICAgcmV0dXJuIHN0ci5zbGljZSggMCwgaWR4ICkgKyByZXBsYWNlV2l0aCArIHN0ci5zbGljZSggaWR4ICsgZmluZC5sZW5ndGggKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gc3RyO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBzdHJpbmcgd2l0aCBhbGwgb2YgdGhlIGtleXMgb2YgdGhlIG1hcHBpbmcgcmVwbGFjZWQgd2l0aCB0aGUgdmFsdWVzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcclxuICAgKiBAcGFyYW0ge09iamVjdH0gbWFwcGluZ1xyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgcmVwbGFjZVBsYWNlaG9sZGVyczogZnVuY3Rpb24oIHN0ciwgbWFwcGluZyApIHtcclxuICAgIE9iamVjdC5rZXlzKCBtYXBwaW5nICkuZm9yRWFjaCgga2V5ID0+IHtcclxuICAgICAgY29uc3QgcmVwbGFjZW1lbnQgPSBtYXBwaW5nWyBrZXkgXTtcclxuICAgICAga2V5ID0gYHt7JHtrZXl9fX1gO1xyXG4gICAgICBsZXQgaW5kZXg7XHJcbiAgICAgIHdoaWxlICggKCBpbmRleCA9IHN0ci5pbmRleE9mKCBrZXkgKSApID49IDAgKSB7XHJcbiAgICAgICAgc3RyID0gc3RyLnNsaWNlKCAwLCBpbmRleCApICsgcmVwbGFjZW1lbnQgKyBzdHIuc2xpY2UoIGluZGV4ICsga2V5Lmxlbmd0aCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICBPYmplY3Qua2V5cyggbWFwcGluZyApLmZvckVhY2goIGtleSA9PiB7XHJcbiAgICAgIGlmICggc3RyLmluZGV4T2YoIGB7eyR7a2V5fX19YCApID49IDAgKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgVGVtcGxhdGUgc3RyaW5nIGRldGVjdGVkIGluIHBsYWNlaG9sZGVyczogJHtrZXl9XFxuXFxuJHtzdHIuc2xpY2UoIDAsIHN0ci5pbmRleE9mKCBge3ske2tleX19fWAgKSArIDEwICl9YCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICByZXR1cm4gc3RyO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlY3Vyc2UgdGhyb3VnaCBhIHN0cmluZyBmaWxlIGFuZCBmb3JtYXQgZWFjaCBzdHJpbmcgdmFsdWUgYXBwcm9wcmlhdGVseVxyXG4gICAqIEBwYXJhbSB7U3RyaW5nTWFwfSBzdHJpbmdNYXBcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzUlRMIC0gaXMgcmlnaHQgdG8gbGVmdCBsYW5ndWFnZVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Fzc2VydE5vV2hpdGVzcGFjZV0gLSB3aGVuIHRydWUsIGFzc2VydCB0aGF0IHRyaW1taW5nIGVhY2ggc3RyaW5nIHZhbHVlIGRvZXNuJ3QgY2hhbmdlIHRoZSBzdHJpbmcuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGZvcm1hdFN0cmluZ1ZhbHVlczogZnVuY3Rpb24oIHN0cmluZ01hcCwgaXNSVEwsIGFzc2VydE5vV2hpdGVzcGFjZSApIHtcclxuICAgIENoaXBwZXJTdHJpbmdVdGlscy5mb3JFYWNoU3RyaW5nKCBzdHJpbmdNYXAsICgga2V5LCBzdHJpbmdPYmplY3QgKSA9PiB7XHJcblxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0Tm9XaGl0ZXNwYWNlICYmIGFzc2VydCggc3RyaW5nT2JqZWN0LnZhbHVlID09PSBzdHJpbmdPYmplY3QudmFsdWUudHJpbSgpLFxyXG4gICAgICAgIGBTdHJpbmcgc2hvdWxkIG5vdCBoYXZlIHRyYWlsaW5nIG9yIGxlYWRpbmcgd2hpdGVzcGFjZSwga2V5OiAke2tleX0sIHZhbHVlOiBcIiR7c3RyaW5nT2JqZWN0LnZhbHVlfVwiYCApO1xyXG5cclxuICAgICAgLy8gcmVtb3ZlIGxlYWRpbmcvdHJhaWxpbmcgd2hpdGVzcGFjZSwgc2VlIGNoaXBwZXIjNjE5LiBEbyB0aGlzIGJlZm9yZSBhZGREaXJlY3Rpb25hbEZvcm1hdHRpbmdcclxuICAgICAgc3RyaW5nT2JqZWN0LnZhbHVlID0gQ2hpcHBlclN0cmluZ1V0aWxzLmFkZERpcmVjdGlvbmFsRm9ybWF0dGluZyggc3RyaW5nT2JqZWN0LnZhbHVlLnRyaW0oKSwgaXNSVEwgKTtcclxuICAgIH0gKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiBhIGtleSwgZ2V0IHRoZSBhcHByb3ByaWF0ZSBzdHJpbmcgZnJvbSB0aGUgXCJtYXBcIiBvYmplY3QsIG9yIG51bGwgaWYgdGhlIGtleSBkb2VzIG5vdCBhcHBlYXIgaW4gdGhlIG1hcC5cclxuICAgKiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgaW4gdW5idWlsdCBtb2RlIGZyb20gdGhlIHN0cmluZyBwbHVnaW4gYW5kIGR1cmluZyB0aGUgYnVpbGQgdmlhIENISVBQRVIvZ2V0U3RyaW5nTWFwLlxyXG4gICAqIFRoaXMgbWV0aG9kIHN1cHBvcnRzIHJlY3Vyc2luZyB0aHJvdWdoIGtleXMgdGhhdCBzdXBwb3J0IHN0cmluZyBuZXN0aW5nLiBUaGlzIG1ldGhvZCB3YXMgY3JlYXRlZCB0byBzdXBwb3J0XHJcbiAgICogbmVzdGVkIHN0cmluZyBrZXlzIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9yb3NldHRhL2lzc3Vlcy8xOTNcclxuICAgKiBAcGFyYW0ge1N0cmluZ01hcH0gbWFwIC0gd2hlcmUgYW4gXCJpbnRlcm1lZGlhdGVcIiBPYmplY3Qgc2hvdWxkIGhvbGQgbmVzdGVkIHN0cmluZ3NcclxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IC0gbGlrZSBgRlJJQ1RJT04vZnJpY3Rpb24udGl0bGVgIG9yIHVzaW5nIG5lc3RpbmcgbGlrZSBgYTExeS5uZXN0ZWQuc3RyaW5nLmhlcmVgXHJcbiAgICogQHJldHVybnMge09iamVjdHxudWxsfSAtIHRoZSBzdHJpbmcgZW50cnkgb2YgdGhlIGtleSwgb3IgbnVsbCBpZiB0aGUga2V5IGRvZXMgbm90IGFwcGVhciBpbiB0aGUgbWFwXHJcbiAgICogQHRocm93cyAge0Vycm9yfSAtIGlmIHRoZSBrZXkgZG9lc24ndCBob2xkIGEgc3RyaW5nIHZhbHVlIGluIHRoZSBtYXBcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0U3RyaW5nRW50cnlGcm9tTWFwKCBtYXAsIGtleSApIHtcclxuXHJcbiAgICBpZiAoIGtleS5pbmRleE9mKCBOQU1FU1BBQ0VfUFJFRklYX0RJVklERVIgKSA+PSAwICkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdnZXRTdHJpbmdFbnRyeUZyb21NYXAga2V5IHNob3VsZCBub3QgaGF2ZSBSRVBPLycgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMb2Rhc2ggZ2l2ZXMgcHJlY2VkZW5jZSB0byAgXCJrZXkxLmtleTJcIiBvdmVyIFwia2V5MTp7a2V5Mn1cIiwgc28gd2UgZG8gdG9vLlxyXG4gICAgY29uc3QgcmVzdWx0ID0gXy5hdCggbWFwLCBrZXkgKVsgMCBdO1xyXG4gICAgaWYgKCByZXN1bHQgKSB7XHJcbiAgICAgIGlmICggcmVzdWx0LnZhbHVlID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgbm8gdmFsdWUgZm9yIHN0cmluZzogJHtrZXl9YCApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggdHlwZW9mIHJlc3VsdC52YWx1ZSAhPT0gJ3N0cmluZycgKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgdmFsdWUgc2hvdWxkIGJlIGEgc3RyaW5nIGZvciBrZXkgJHtrZXl9YCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBVbnRpbCByb3NldHRhIHN1cHBvcnRzIG5lc3RlZCBzdHJpbmdzIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9yb3NldHRhL2lzc3Vlcy8yMTUsIGtlZXAgdGhpcyBhc3NlcnRpb24uXHJcbiAgICAgIC8vIFRoaXMgc2hvdWxkIGJlIGFmdGVyIGJlY2F1c2UgdGhlIGFib3ZlIGVycm9ycyBhcmUgbW9yZSBzcGVjaWZpYy4gVGhpcyBpcyBiZXR0ZXIgYXMgYSBmYWxsYmFjay5cclxuICAgICAgYXNzZXJ0ICYmICFDaGlwcGVyU3RyaW5nVXRpbHMuaXNBMTF5U3RyaW5nS2V5KCBrZXkgKSAmJiBhc3NlcnQoIG1hcFsga2V5IF0sXHJcbiAgICAgICAgYG5lc3RlZCBzdHJpbmdzIGFyZSBub3QgYWxsb3dlZCBvdXRzaWRlIG9mIGExMXkgc3RyaW5nIG9iamVjdCBmb3Iga2V5OiAke2tleX1gICk7XHJcblxyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoZXkga2V5IGRvZXMgbm90IGFwcGVhciBpbiB0aGUgbWFwXHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleSAtIHdpdGhvdXQgXCJzdHJpbmchUkVQT1wiIGF0IHRoZSBiZWdpbm5pbmcsIGp1c3QgdGhlIGFjdHVhbCBcInN0cmluZyBrZXlcIlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzQTExeVN0cmluZ0tleSgga2V5ICkge1xyXG4gICAgcmV0dXJuIGtleS5pbmRleE9mKCBDaGlwcGVyU3RyaW5nVXRpbHMuQTExWV9NQVJLRVIgKSA9PT0gMDtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBUaGUgc3RhcnQgb2YgYW55IGExMXkgc3BlY2lmaWMgc3RyaW5nIGtleS5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHR5cGUge3N0cmluZ31cclxuICAgKi9cclxuICBBMTFZX01BUktFUjogQTExWV9NQVJLRVIsXHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGwgYSBmdW5jdGlvbiBvbiBlYWNoIG9iamVjdCB3aXRoIGEgXCJ2YWx1ZVwiIGF0dHJpYnV0ZSBpbiBhbiBvYmplY3QgdHJlZS5cclxuICAgKiBAcGFyYW0ge1N0cmluZ01hcH0gbWFwIC0gc3RyaW5nIG1hcCwgbGlrZSBhIGxvYWRlZCBKU09OIHN0cmluZ3MgZmlsZVxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oa2V5OnN0cmluZywgU3RyaW5nT2JqZWN0KX0gZnVuY1xyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBba2V5U29GYXJdIC0gd2hpbGUgcmVjdXJzaW5nLCBidWlsZCB1cCBhIHN0cmluZyBvZiB0aGUga2V5IHNlcGFyYXRlZCB3aXRoIGRvdHMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGZvckVhY2hTdHJpbmcoIG1hcCwgZnVuYywga2V5U29GYXIgPSAnJyApIHtcclxuICAgIGZvciAoIGNvbnN0IGtleSBpbiBtYXAgKSB7XHJcbiAgICAgIGlmICggbWFwLmhhc093blByb3BlcnR5KCBrZXkgKSApIHtcclxuICAgICAgICBjb25zdCBuZXh0S2V5ID0ga2V5U29GYXIgPyBgJHtrZXlTb0Zhcn0uJHtrZXl9YCA6IGtleTsgLy8gZG9uJ3Qgc3RhcnQgd2l0aCBwZXJpb2QsIGFzc3VtZXMgJycgaXMgZmFsc2V5XHJcbiAgICAgICAgY29uc3Qgc3RyaW5nT2JqZWN0ID0gbWFwWyBrZXkgXTtcclxuXHJcbiAgICAgICAgLy8gbm8gbmVlZCB0byBzdXBwb3J0IG5vbi1vYmplY3QsIG51bGwsIG9yIGFycmF5cyBpbiB0aGUgc3RyaW5nIG1hcCwgZm9yIGV4YW1wbGUgc3RyaW5nT2JqZWN0Lmhpc3RvcnkgaW5cclxuICAgICAgICAvLyBsb2NhbGUgc3BlY2lmaWMgZmlsZXMuXHJcbiAgICAgICAgaWYgKCB0eXBlb2Ygc3RyaW5nT2JqZWN0ICE9PSAnb2JqZWN0JyB8fCBzdHJpbmdPYmplY3QgPT09IG51bGwgfHwgQXJyYXkuaXNBcnJheSggc3RyaW5nT2JqZWN0ICkgKSB7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBzdHJpbmdPYmplY3QudmFsdWUgKSB7XHJcbiAgICAgICAgICBmdW5jKCBuZXh0S2V5LCBzdHJpbmdPYmplY3QgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJlY3Vyc2UgdG8gdGhlIG5leHQgbGV2ZWwgc2luY2UgaWYgaXQgd2Fzbid0IHRoZSBgdmFsdWVgIGtleVxyXG4gICAgICAgIGtleSAhPT0gJ3ZhbHVlJyAmJiBDaGlwcGVyU3RyaW5nVXRpbHMuZm9yRWFjaFN0cmluZyggc3RyaW5nT2JqZWN0LCBmdW5jLCBuZXh0S2V5ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogQHR5cGVkZWYge09iamVjdH0gU3RyaW5nTWFwTm9kZVxyXG4gKiBAcHJvcGVydHkge1N0cmluZ01hcE5vZGV9ICogLSBBIGtleSB0aGF0IHN0b3JlcyBhIFN0cmluZ01hcE5vZGUgaW5zaWRlIHRoaXMgb25lLlxyXG4gKi9cclxuLyoqXHJcbiAqIEB0eXBlZGVmIHtPYmplY3R9IFN0cmluZ09iamVjdFxyXG4gKiBBbiBvYmplY3QgdGhhdCBoYXMgYSBcInZhbHVlXCIgZmllbGQgdGhhdCBob2xkcyB0aGUgc3RyaW5nLiBJdCBjYW4gc3RpbGwgaW5jbHVkZSBtb3JlIG5lc3RlZCBgU3RyaW5nT2JqZWN0YHMuXHJcbiAqIEVhY2ggU3RyaW5nTWFwTm9kZSBzaG91bGQgaGF2ZSBhdCBsZWFzdCBvbmUgU3RyaW5nT2JqZWN0IG5lc3RlZCBpbnNpZGUgaXQuXHJcbiAqIEBleHRlbmRzIHtTdHJpbmdNYXBOb2RlfVxyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdmFsdWUgLSB0aGUgdmFsdWUga2V5IGlzIHVzZWQgaW5cclxuICovXHJcbi8qKlxyXG4gKiBAdHlwZWRlZiB7T2JqZWN0LjxzdHJpbmcsIFN0cmluZ01hcE5vZGU+Pn0gU3RyaW5nTWFwXHJcbiAqIEBleHRlbmRzIHtTdHJpbmdNYXBOb2RlfVxyXG4gKiBBIHN0cmluZyBtYXAgY2FuIGJlIGVpdGhlciBhIGZsYXQgbWFwIG9mIFN0cmluZ09iamVjdCAoc2VlIHRoZSBvdXRwdXQgb2YgQ0hJUFBFUi9nZXRTdHJpbmdNYXApLCBvciBjYW4gYmUgYSBuZXN0ZWRcclxuICogT2JqZWN0IHdpdGggU3RyaW5nT2JqZWN0cyB0aHJvdWdob3V0IHRoZSBvYmplY3Qgc3RydWN0dXJlIChhcyBzdXBwb3J0ZWQgaW4gRW5nbGlzaCBKU09OIHN0cmluZyBmaWxlcykuXHJcbiAqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDaGlwcGVyU3RyaW5nVXRpbHM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBR0EsTUFBTUEsTUFBTSxHQUFHQyxPQUFPLENBQUUsUUFBUyxDQUFDO0FBQ2xDLE1BQU1DLENBQUMsR0FBR0QsT0FBTyxDQUFFLFFBQVMsQ0FBQzs7QUFFN0I7QUFDQSxNQUFNRSx3QkFBd0IsR0FBRyxHQUFHO0FBQ3BDLE1BQU1DLFdBQVcsR0FBRyxPQUFPO0FBRTNCLE1BQU1DLGtCQUFrQixHQUFHO0VBRXpCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsd0JBQXdCLEVBQUUsU0FBQUEsQ0FBVUMsR0FBRyxFQUFFQyxLQUFLLEVBQUc7SUFDL0MsSUFBS0QsR0FBRyxDQUFDRSxNQUFNLEdBQUcsQ0FBQyxFQUFHO01BQ3BCLE9BQVEsR0FBRSxDQUFFRCxLQUFLLEdBQUcsUUFBUSxHQUFHLFFBQVEsSUFBS0QsR0FBSSxRQUFPO0lBQ3pELENBQUMsTUFDSTtNQUNILE9BQU9BLEdBQUc7SUFDWjtFQUNGLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxTQUFTLEVBQUUsU0FBQUEsQ0FBVUgsR0FBRyxFQUFFSSxDQUFDLEVBQUc7SUFDNUIsT0FBUUosR0FBRyxDQUFDRSxNQUFNLEdBQUdFLENBQUMsRUFBRztNQUN2QkosR0FBRyxJQUFJLEdBQUc7SUFDWjtJQUNBLE9BQU9BLEdBQUc7RUFDWixDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSyxVQUFVLEVBQUUsU0FBQUEsQ0FBVUwsR0FBRyxFQUFFTSxJQUFJLEVBQUVDLFdBQVcsRUFBRztJQUM3QyxPQUFPUCxHQUFHLENBQUNRLE9BQU8sQ0FBRSxJQUFJQyxNQUFNLENBQUVILElBQUksQ0FBQ0UsT0FBTyxDQUFFLHVCQUF1QixFQUFFLE1BQU8sQ0FBQyxFQUFFLEdBQUksQ0FBQyxFQUFFRCxXQUFZLENBQUM7RUFDdkcsQ0FBQztFQUVEO0VBQ0E7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxZQUFZLEVBQUUsU0FBQUEsQ0FBVVYsR0FBRyxFQUFFTSxJQUFJLEVBQUVDLFdBQVcsRUFBRztJQUMvQyxNQUFNSSxHQUFHLEdBQUdYLEdBQUcsQ0FBQ1ksT0FBTyxDQUFFTixJQUFLLENBQUM7SUFDL0IsSUFBS04sR0FBRyxDQUFDWSxPQUFPLENBQUVOLElBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFHO01BQ2hDLE9BQU9OLEdBQUcsQ0FBQ2EsS0FBSyxDQUFFLENBQUMsRUFBRUYsR0FBSSxDQUFDLEdBQUdKLFdBQVcsR0FBR1AsR0FBRyxDQUFDYSxLQUFLLENBQUVGLEdBQUcsR0FBR0wsSUFBSSxDQUFDSixNQUFPLENBQUM7SUFDM0UsQ0FBQyxNQUNJO01BQ0gsT0FBT0YsR0FBRztJQUNaO0VBQ0YsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRWMsbUJBQW1CLEVBQUUsU0FBQUEsQ0FBVWQsR0FBRyxFQUFFZSxPQUFPLEVBQUc7SUFDNUNDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFFRixPQUFRLENBQUMsQ0FBQ0csT0FBTyxDQUFFQyxHQUFHLElBQUk7TUFDckMsTUFBTUMsV0FBVyxHQUFHTCxPQUFPLENBQUVJLEdBQUcsQ0FBRTtNQUNsQ0EsR0FBRyxHQUFJLEtBQUlBLEdBQUksSUFBRztNQUNsQixJQUFJRSxLQUFLO01BQ1QsT0FBUSxDQUFFQSxLQUFLLEdBQUdyQixHQUFHLENBQUNZLE9BQU8sQ0FBRU8sR0FBSSxDQUFDLEtBQU0sQ0FBQyxFQUFHO1FBQzVDbkIsR0FBRyxHQUFHQSxHQUFHLENBQUNhLEtBQUssQ0FBRSxDQUFDLEVBQUVRLEtBQU0sQ0FBQyxHQUFHRCxXQUFXLEdBQUdwQixHQUFHLENBQUNhLEtBQUssQ0FBRVEsS0FBSyxHQUFHRixHQUFHLENBQUNqQixNQUFPLENBQUM7TUFDN0U7SUFDRixDQUFFLENBQUM7SUFDSGMsTUFBTSxDQUFDQyxJQUFJLENBQUVGLE9BQVEsQ0FBQyxDQUFDRyxPQUFPLENBQUVDLEdBQUcsSUFBSTtNQUNyQyxJQUFLbkIsR0FBRyxDQUFDWSxPQUFPLENBQUcsS0FBSU8sR0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUc7UUFDdEMsTUFBTSxJQUFJRyxLQUFLLENBQUcsNkNBQTRDSCxHQUFJLE9BQU1uQixHQUFHLENBQUNhLEtBQUssQ0FBRSxDQUFDLEVBQUViLEdBQUcsQ0FBQ1ksT0FBTyxDQUFHLEtBQUlPLEdBQUksSUFBSSxDQUFDLEdBQUcsRUFBRyxDQUFFLEVBQUUsQ0FBQztNQUM5SDtJQUNGLENBQUUsQ0FBQztJQUNILE9BQU9uQixHQUFHO0VBQ1osQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0V1QixrQkFBa0IsRUFBRSxTQUFBQSxDQUFVQyxTQUFTLEVBQUV2QixLQUFLLEVBQUV3QixrQkFBa0IsRUFBRztJQUNuRTNCLGtCQUFrQixDQUFDNEIsYUFBYSxDQUFFRixTQUFTLEVBQUUsQ0FBRUwsR0FBRyxFQUFFUSxZQUFZLEtBQU07TUFFcEVsQyxNQUFNLElBQUlnQyxrQkFBa0IsSUFBSWhDLE1BQU0sQ0FBRWtDLFlBQVksQ0FBQ0MsS0FBSyxLQUFLRCxZQUFZLENBQUNDLEtBQUssQ0FBQ0MsSUFBSSxDQUFDLENBQUMsRUFDckYsK0RBQThEVixHQUFJLGFBQVlRLFlBQVksQ0FBQ0MsS0FBTSxHQUFHLENBQUM7O01BRXhHO01BQ0FELFlBQVksQ0FBQ0MsS0FBSyxHQUFHOUIsa0JBQWtCLENBQUNDLHdCQUF3QixDQUFFNEIsWUFBWSxDQUFDQyxLQUFLLENBQUNDLElBQUksQ0FBQyxDQUFDLEVBQUU1QixLQUFNLENBQUM7SUFDdEcsQ0FBRSxDQUFDO0VBQ0wsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRTZCLHFCQUFxQkEsQ0FBRUMsR0FBRyxFQUFFWixHQUFHLEVBQUc7SUFFaEMsSUFBS0EsR0FBRyxDQUFDUCxPQUFPLENBQUVoQix3QkFBeUIsQ0FBQyxJQUFJLENBQUMsRUFBRztNQUNsRCxNQUFNLElBQUkwQixLQUFLLENBQUUsaURBQWtELENBQUM7SUFDdEU7O0lBRUE7SUFDQSxNQUFNVSxNQUFNLEdBQUdyQyxDQUFDLENBQUNzQyxFQUFFLENBQUVGLEdBQUcsRUFBRVosR0FBSSxDQUFDLENBQUUsQ0FBQyxDQUFFO0lBQ3BDLElBQUthLE1BQU0sRUFBRztNQUNaLElBQUtBLE1BQU0sQ0FBQ0osS0FBSyxLQUFLTSxTQUFTLEVBQUc7UUFDaEMsTUFBTSxJQUFJWixLQUFLLENBQUcsd0JBQXVCSCxHQUFJLEVBQUUsQ0FBQztNQUNsRDtNQUNBLElBQUssT0FBT2EsTUFBTSxDQUFDSixLQUFLLEtBQUssUUFBUSxFQUFHO1FBQ3RDLE1BQU0sSUFBSU4sS0FBSyxDQUFHLG9DQUFtQ0gsR0FBSSxFQUFFLENBQUM7TUFDOUQ7O01BRUE7TUFDQTtNQUNBMUIsTUFBTSxJQUFJLENBQUNLLGtCQUFrQixDQUFDcUMsZUFBZSxDQUFFaEIsR0FBSSxDQUFDLElBQUkxQixNQUFNLENBQUVzQyxHQUFHLENBQUVaLEdBQUcsQ0FBRSxFQUN2RSx5RUFBd0VBLEdBQUksRUFBRSxDQUFDO01BRWxGLE9BQU9hLE1BQU07SUFDZjs7SUFFQTtJQUNBLE9BQU8sSUFBSTtFQUNiLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VHLGVBQWVBLENBQUVoQixHQUFHLEVBQUc7SUFDckIsT0FBT0EsR0FBRyxDQUFDUCxPQUFPLENBQUVkLGtCQUFrQixDQUFDRCxXQUFZLENBQUMsS0FBSyxDQUFDO0VBQzVELENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VBLFdBQVcsRUFBRUEsV0FBVztFQUV4QjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFNkIsYUFBYUEsQ0FBRUssR0FBRyxFQUFFSyxJQUFJLEVBQUVDLFFBQVEsR0FBRyxFQUFFLEVBQUc7SUFDeEMsS0FBTSxNQUFNbEIsR0FBRyxJQUFJWSxHQUFHLEVBQUc7TUFDdkIsSUFBS0EsR0FBRyxDQUFDTyxjQUFjLENBQUVuQixHQUFJLENBQUMsRUFBRztRQUMvQixNQUFNb0IsT0FBTyxHQUFHRixRQUFRLEdBQUksR0FBRUEsUUFBUyxJQUFHbEIsR0FBSSxFQUFDLEdBQUdBLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZELE1BQU1RLFlBQVksR0FBR0ksR0FBRyxDQUFFWixHQUFHLENBQUU7O1FBRS9CO1FBQ0E7UUFDQSxJQUFLLE9BQU9RLFlBQVksS0FBSyxRQUFRLElBQUlBLFlBQVksS0FBSyxJQUFJLElBQUlhLEtBQUssQ0FBQ0MsT0FBTyxDQUFFZCxZQUFhLENBQUMsRUFBRztVQUNoRztRQUNGO1FBQ0EsSUFBS0EsWUFBWSxDQUFDQyxLQUFLLEVBQUc7VUFDeEJRLElBQUksQ0FBRUcsT0FBTyxFQUFFWixZQUFhLENBQUM7UUFDL0I7O1FBRUE7UUFDQVIsR0FBRyxLQUFLLE9BQU8sSUFBSXJCLGtCQUFrQixDQUFDNEIsYUFBYSxDQUFFQyxZQUFZLEVBQUVTLElBQUksRUFBRUcsT0FBUSxDQUFDO01BQ3BGO0lBQ0Y7RUFDRjtBQUNGLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQUcsTUFBTSxDQUFDQyxPQUFPLEdBQUc3QyxrQkFBa0IifQ==