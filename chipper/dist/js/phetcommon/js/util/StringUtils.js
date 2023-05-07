// Copyright 2013-2023, University of Colorado Boulder

/**
 * Collection of utility functions related to Strings.
 */

import localeInfoModule from '../../../chipper/js/data/localeInfoModule.js';
import phetcommon from '../phetcommon.js';

// Unicode embedding marks that we use.
const LTR = '\u202a';
const RTL = '\u202b';
const POP = '\u202c';
const StringUtils = {
  /**
   * NOTE: Please use StringUtils.fillIn instead of this function.
   *
   * http://mobzish.blogspot.com/2008/10/simple-messageformat-for-javascript.html
   * Similar to Java's MessageFormat, supports simple substitution, simple substitution only.
   * The full MessageFormat specification allows conditional formatting, for example to support pluralisation.
   *
   * Example:
   * > StringUtils.format( '{0} + {1}', 2, 3 )
   * "2 + 3"
   *
   * @param {string} pattern pattern string, with N placeholders, where N is an integer
   * @returns {string}
   * @public
   * @deprecated - please use StringUtils.fillIn
   */
  format: function (pattern) {
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    return pattern.replace(/{(\d)}/g, (r, n) => args[+n + 1]);
  },
  /**
   * Fills in a set of placeholders in a template.
   * Placeholders are specified with pairs of curly braces, e.g. '{{name}} is {{age}} years old'
   * See https://github.com/phetsims/phetcommon/issues/36
   *
   * Example:
   * > StringUtils.fillIn( '{{name}} is {{age}} years old', { name: 'Fred', age: 23 } )
   * "Fred is 23 years old"
   *
   * @param {string|TReadOnlyProperty<string>} template - the template, containing zero or more placeholders
   * @param {Object} values - a hash whose keys correspond to the placeholder names, e.g. { name: 'Fred', age: 23 }
   *                          Unused keys are silently ignored. All placeholders do not need to be filled.
   * @returns {string}
   * @public
   */
  fillIn: function (template, values) {
    template = template && template.get ? template.get() : template;
    assert && assert(typeof template === 'string', `invalid template: ${template}`);

    // To catch attempts to use StringUtils.fillIn like StringUtils.format
    assert && assert(values && typeof values === 'object', `invalid values: ${values}`);
    let newString = template;

    // {string[]} parse out the set of placeholders
    const placeholders = template.match(/\{\{[^{}]+\}\}/g) || [];

    // replace each placeholder with its corresponding value
    for (let i = 0; i < placeholders.length; i++) {
      const placeholder = placeholders[i];

      // key is the portion of the placeholder between the curly braces
      const key = placeholder.replace('{{', '').replace('}}', '');
      if (values[key] !== undefined) {
        // Support Properties as values
        const valueString = values[key] && values[key].get ? values[key].get() : values[key];
        newString = newString.replace(placeholder, valueString);
      }
    }
    return newString;
  },
  /**
   * @public
   * @returns {boolean} - Whether this length-1 string is equal to one of the three directional embedding marks used.
   */
  isEmbeddingMark: function (chr) {
    return chr === LTR || chr === RTL || chr === POP;
  },
  /**
   * Given a string with embedding marks, this function returns an equivalent string.slice() but prefixes and suffixes
   * the string with the embedding marks needed to ensure things have the correct LTR/RTL order.
   * @public
   *
   * For example, with a test string:
   *
   * embeddedDebugString( '\u202a\u202bhi\u202c\u202c' )
   * === "[LTR][RTL]hi[POP][POP]"
   *
   * We could grab the first word, and it adds the ending POP:
   * embeddedDebugString( embeddedSlice( '\u202afirst\u202bsecond\u202cthird\u202c', 0, 6 ) )
   * === "[LTR]first[POP]"
   *
   * Or the second word:
   * embeddedDebugString( embeddedSlice( '\u202afirst\u202bsecond\u202cthird\u202c', 6, 14 ) )
   * === "[RTL]second[POP]"
   *
   * Or a custom range:
   * embeddedDebugString( embeddedSlice( '\u202afirst\u202bsecond\u202cthird\u202c', 3, -3 ) )
   * === "[LTR]rst[RTL]second[POP]thi[POP]"
   *
   * @param {string} string - The main source string to slice from
   * @param {number} startIndex - The starting index where the slice starts (includes char at this index)
   * @param {number} [endIndex] - The ending index where the slice stops (does NOT include char at this index)
   * @returns {string} - The sliced string, with embedding marks added at hte start and end.
   */
  embeddedSlice: function (string, startIndex, endIndex) {
    // {Array.<string>} - array of LTR/RTL embedding marks that are currently on the stack for the current location.
    const stack = [];
    let chr;
    if (endIndex === undefined) {
      endIndex = string.length;
    }
    if (endIndex < 0) {
      endIndex += string.length;
    }

    // To avoid returning an extra adjacent [LTR][POP] or [RTL][POP], we can move the start forward and the
    // end backwards as long as they are over embedding marks to avoid this.
    while (startIndex < string.length && StringUtils.isEmbeddingMark(string.charAt(startIndex))) {
      startIndex++;
    }
    while (endIndex >= 1 && StringUtils.isEmbeddingMark(string.charAt(endIndex - 1))) {
      endIndex--;
    }

    // If our string will be empty, just bail out.
    if (startIndex >= endIndex || startIndex >= string.length) {
      return '';
    }

    // Walk up to the start of the string
    for (let i = 0; i < startIndex; i++) {
      chr = string.charAt(i);
      if (chr === LTR || chr === RTL) {
        stack.push(chr);
      } else if (chr === POP) {
        stack.pop();
      }
    }

    // Will store the minimum stack size during our slice. This allows us to turn [LTR][RTL]boo[POP][POP] into
    // [RTL]boo[POP] by skipping the "outer" layers.
    let minimumStackSize = stack.length;

    // Save our initial stack for prefix computation
    let startStack = stack.slice();

    // A normal string slice
    const slice = string.slice(startIndex, endIndex);

    // Walk through the sliced string, to determine what we need for the suffix
    for (let j = 0; j < slice.length; j++) {
      chr = slice.charAt(j);
      if (chr === LTR || chr === RTL) {
        stack.push(chr);
      } else if (chr === POP) {
        stack.pop();
        minimumStackSize = Math.min(stack.length, minimumStackSize);
      }
    }

    // Our ending stack for suffix computation
    let endStack = stack;

    // Always leave one stack level on top
    const numSkippedStackLevels = Math.max(0, minimumStackSize - 1);
    startStack = startStack.slice(numSkippedStackLevels);
    endStack = endStack.slice(numSkippedStackLevels);

    // Our prefix will be the embedding marks that have been skipped and not popped.
    const prefix = startStack.join('');

    // Our suffix includes one POP for each embedding mark currently on the stack
    const suffix = endStack.join('').replace(/./g, POP);
    return prefix + slice + suffix;
  },
  /**
   * String's split() API, but uses embeddedSlice() on the extracted strings.
   * @public
   *
   * For example, given a string:
   *
   * StringUtils.embeddedDebugString( '\u202aHello  there, \u202bHow are you\u202c doing?\u202c' );
   * === "[LTR]Hello  there, [RTL]How are you[POP] doing?[POP]"
   *
   * Using embeddedSplit with a regular expression matching a sequence of spaces:
   * StringUtils.embeddedSplit( '\u202aHello  there, \u202bHow are you\u202c doing?\u202c', / +/ )
   *            .map( StringUtils.embeddedDebugString );
   * === [ "[LTR]Hello[POP]",
   *       "[LTR]there,[POP]",
   *       "[RTL]How[POP]",
   *       "[RTL]are[POP]",
   *       "[RTL]you[POP]",
   *       "[LTR]doing?[POP]" ]
   */
  embeddedSplit: function (string, separator, limit) {
    // Matching split API
    if (separator === undefined) {
      return [string];
    }

    // {Array.<string>} - What we will push to and return.
    let result = [];

    // { index: {number}, length: {number} } - Last result of findSeparatorMatch()
    let separatorMatch;

    // Remaining part of the string to split up. Will have substrings removed from the start.
    let stringToSplit = string;

    // Finds the index and length of the first substring of stringToSplit that matches the separator (string or regex)
    // and returns an object with the type  { index: {number}, length: {number} }.
    // If index === -1, there was no match for the separator.
    function findSeparatorMatch() {
      let index;
      let length;
      if (separator instanceof window.RegExp) {
        const match = stringToSplit.match(separator);
        if (match) {
          index = match.index;
          length = match[0].length;
        } else {
          index = -1;
        }
      } else {
        assert && assert(typeof separator === 'string');
        index = stringToSplit.indexOf(separator);
        length = separator.length;
      }
      return {
        index: index,
        length: length
      };
    }

    // Loop until we run out of matches for the separator. For each separator match, stringToSplit for the next
    // iteration will have everything up to the end of the separator match chopped off. The indexOffset variable
    // stores how many characters we have chopped off in this fashion, so that we can index into the original string.
    let indexOffset = 0;
    while ((separatorMatch = findSeparatorMatch()).index >= 0) {
      // Extract embedded slice from the original, up until the separator match
      result.push(StringUtils.embeddedSlice(string, indexOffset, indexOffset + separatorMatch.index));

      // Handle chopping off the section of stringToSplit, so we can do simple matching in findSeparatorMatch()
      const offset = separatorMatch.index + separatorMatch.length;
      stringToSplit = stringToSplit.slice(offset);
      indexOffset += offset;
    }

    // Embedded slice for after the last match. May be an empty string.
    result.push(StringUtils.embeddedSlice(string, indexOffset));

    // Matching split API
    if (limit !== undefined) {
      assert && assert(typeof limit === 'number');
      result = _.first(result, limit);
    }
    return result;
  },
  /**
   * Replaces embedding mark characters with visible strings. Useful for debugging for strings with embedding marks.
   * @public
   *
   * @param {string} string
   * @returns {string} - With embedding marks replaced.
   */
  embeddedDebugString: function (string) {
    return string.replace(/\u202a/g, '[LTR]').replace(/\u202b/g, '[RTL]').replace(/\u202c/g, '[POP]');
  },
  /**
   * Wraps a string with embedding marks for LTR display.
   * @public
   *
   * @param {string} string
   * @returns {string}
   */
  wrapLTR: function (string) {
    return LTR + string + POP;
  },
  /**
   * Wraps a string with embedding marks for RTL display.
   * @public
   *
   * @param {string} string
   * @returns {string}
   */
  wrapRTL: function (string) {
    return RTL + string + POP;
  },
  /**
   * Wraps a string with embedding marks for LTR/RTL display, depending on the direction
   * @public
   *
   * @param {string} string
   * @param {string} direction - either 'ltr' or 'rtl'
   * @returns {string}
   */
  wrapDirection: function (string, direction) {
    assert && assert(direction === 'ltr' || direction === 'rtl');
    if (direction === 'ltr') {
      return StringUtils.wrapLTR(string);
    } else {
      return StringUtils.wrapRTL(string);
    }
  },
  /**
   * Given a locale, e.g. 'es', provides the localized name, e.g. 'Español'
   *
   * @param {string} locale
   * @returns {string}
   */
  localeToLocalizedName: function (locale) {
    assert && assert(localeInfoModule[locale], 'locale needs to be a valid locale code defined in localeInfoModule');
    return StringUtils.wrapDirection(localeInfoModule[locale].localizedName, localeInfoModule[locale].direction);
  },
  /**
   * Capitalize the first letter of the given string.
   * @param {string} string
   * @returns {string}
   * @public
   */
  capitalize(string) {
    assert && assert(string.length > 0, 'expected a non-zero string');
    return string[0].toUpperCase() + string.slice(1);
  }
};
phetcommon.register('StringUtils', StringUtils);
export default StringUtils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJsb2NhbGVJbmZvTW9kdWxlIiwicGhldGNvbW1vbiIsIkxUUiIsIlJUTCIsIlBPUCIsIlN0cmluZ1V0aWxzIiwiZm9ybWF0IiwicGF0dGVybiIsImFyZ3MiLCJhcmd1bWVudHMiLCJyZXBsYWNlIiwiciIsIm4iLCJmaWxsSW4iLCJ0ZW1wbGF0ZSIsInZhbHVlcyIsImdldCIsImFzc2VydCIsIm5ld1N0cmluZyIsInBsYWNlaG9sZGVycyIsIm1hdGNoIiwiaSIsImxlbmd0aCIsInBsYWNlaG9sZGVyIiwia2V5IiwidW5kZWZpbmVkIiwidmFsdWVTdHJpbmciLCJpc0VtYmVkZGluZ01hcmsiLCJjaHIiLCJlbWJlZGRlZFNsaWNlIiwic3RyaW5nIiwic3RhcnRJbmRleCIsImVuZEluZGV4Iiwic3RhY2siLCJjaGFyQXQiLCJwdXNoIiwicG9wIiwibWluaW11bVN0YWNrU2l6ZSIsInN0YXJ0U3RhY2siLCJzbGljZSIsImoiLCJNYXRoIiwibWluIiwiZW5kU3RhY2siLCJudW1Ta2lwcGVkU3RhY2tMZXZlbHMiLCJtYXgiLCJwcmVmaXgiLCJqb2luIiwic3VmZml4IiwiZW1iZWRkZWRTcGxpdCIsInNlcGFyYXRvciIsImxpbWl0IiwicmVzdWx0Iiwic2VwYXJhdG9yTWF0Y2giLCJzdHJpbmdUb1NwbGl0IiwiZmluZFNlcGFyYXRvck1hdGNoIiwiaW5kZXgiLCJ3aW5kb3ciLCJSZWdFeHAiLCJpbmRleE9mIiwiaW5kZXhPZmZzZXQiLCJvZmZzZXQiLCJfIiwiZmlyc3QiLCJlbWJlZGRlZERlYnVnU3RyaW5nIiwid3JhcExUUiIsIndyYXBSVEwiLCJ3cmFwRGlyZWN0aW9uIiwiZGlyZWN0aW9uIiwibG9jYWxlVG9Mb2NhbGl6ZWROYW1lIiwibG9jYWxlIiwibG9jYWxpemVkTmFtZSIsImNhcGl0YWxpemUiLCJ0b1VwcGVyQ2FzZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3RyaW5nVXRpbHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29sbGVjdGlvbiBvZiB1dGlsaXR5IGZ1bmN0aW9ucyByZWxhdGVkIHRvIFN0cmluZ3MuXHJcbiAqL1xyXG5cclxuaW1wb3J0IGxvY2FsZUluZm9Nb2R1bGUgZnJvbSAnLi4vLi4vLi4vY2hpcHBlci9qcy9kYXRhL2xvY2FsZUluZm9Nb2R1bGUuanMnO1xyXG5pbXBvcnQgcGhldGNvbW1vbiBmcm9tICcuLi9waGV0Y29tbW9uLmpzJztcclxuXHJcbi8vIFVuaWNvZGUgZW1iZWRkaW5nIG1hcmtzIHRoYXQgd2UgdXNlLlxyXG5jb25zdCBMVFIgPSAnXFx1MjAyYSc7XHJcbmNvbnN0IFJUTCA9ICdcXHUyMDJiJztcclxuY29uc3QgUE9QID0gJ1xcdTIwMmMnO1xyXG5cclxuY29uc3QgU3RyaW5nVXRpbHMgPSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIE5PVEU6IFBsZWFzZSB1c2UgU3RyaW5nVXRpbHMuZmlsbEluIGluc3RlYWQgb2YgdGhpcyBmdW5jdGlvbi5cclxuICAgKlxyXG4gICAqIGh0dHA6Ly9tb2J6aXNoLmJsb2dzcG90LmNvbS8yMDA4LzEwL3NpbXBsZS1tZXNzYWdlZm9ybWF0LWZvci1qYXZhc2NyaXB0Lmh0bWxcclxuICAgKiBTaW1pbGFyIHRvIEphdmEncyBNZXNzYWdlRm9ybWF0LCBzdXBwb3J0cyBzaW1wbGUgc3Vic3RpdHV0aW9uLCBzaW1wbGUgc3Vic3RpdHV0aW9uIG9ubHkuXHJcbiAgICogVGhlIGZ1bGwgTWVzc2FnZUZvcm1hdCBzcGVjaWZpY2F0aW9uIGFsbG93cyBjb25kaXRpb25hbCBmb3JtYXR0aW5nLCBmb3IgZXhhbXBsZSB0byBzdXBwb3J0IHBsdXJhbGlzYXRpb24uXHJcbiAgICpcclxuICAgKiBFeGFtcGxlOlxyXG4gICAqID4gU3RyaW5nVXRpbHMuZm9ybWF0KCAnezB9ICsgezF9JywgMiwgMyApXHJcbiAgICogXCIyICsgM1wiXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0dGVybiBwYXR0ZXJuIHN0cmluZywgd2l0aCBOIHBsYWNlaG9sZGVycywgd2hlcmUgTiBpcyBhbiBpbnRlZ2VyXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKiBAcHVibGljXHJcbiAgICogQGRlcHJlY2F0ZWQgLSBwbGVhc2UgdXNlIFN0cmluZ1V0aWxzLmZpbGxJblxyXG4gICAqL1xyXG4gIGZvcm1hdDogZnVuY3Rpb24oIHBhdHRlcm4gKSB7XHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJlZmVyLXJlc3QtcGFyYW1zXHJcbiAgICBjb25zdCBhcmdzID0gYXJndW1lbnRzO1xyXG4gICAgcmV0dXJuIHBhdHRlcm4ucmVwbGFjZSggL3soXFxkKX0vZywgKCByLCBuICkgPT4gYXJnc1sgK24gKyAxIF0gKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBGaWxscyBpbiBhIHNldCBvZiBwbGFjZWhvbGRlcnMgaW4gYSB0ZW1wbGF0ZS5cclxuICAgKiBQbGFjZWhvbGRlcnMgYXJlIHNwZWNpZmllZCB3aXRoIHBhaXJzIG9mIGN1cmx5IGJyYWNlcywgZS5nLiAne3tuYW1lfX0gaXMge3thZ2V9fSB5ZWFycyBvbGQnXHJcbiAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0Y29tbW9uL2lzc3Vlcy8zNlxyXG4gICAqXHJcbiAgICogRXhhbXBsZTpcclxuICAgKiA+IFN0cmluZ1V0aWxzLmZpbGxJbiggJ3t7bmFtZX19IGlzIHt7YWdlfX0geWVhcnMgb2xkJywgeyBuYW1lOiAnRnJlZCcsIGFnZTogMjMgfSApXHJcbiAgICogXCJGcmVkIGlzIDIzIHllYXJzIG9sZFwiXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ3xUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+fSB0ZW1wbGF0ZSAtIHRoZSB0ZW1wbGF0ZSwgY29udGFpbmluZyB6ZXJvIG9yIG1vcmUgcGxhY2Vob2xkZXJzXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IHZhbHVlcyAtIGEgaGFzaCB3aG9zZSBrZXlzIGNvcnJlc3BvbmQgdG8gdGhlIHBsYWNlaG9sZGVyIG5hbWVzLCBlLmcuIHsgbmFtZTogJ0ZyZWQnLCBhZ2U6IDIzIH1cclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgVW51c2VkIGtleXMgYXJlIHNpbGVudGx5IGlnbm9yZWQuIEFsbCBwbGFjZWhvbGRlcnMgZG8gbm90IG5lZWQgdG8gYmUgZmlsbGVkLlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGZpbGxJbjogZnVuY3Rpb24oIHRlbXBsYXRlLCB2YWx1ZXMgKSB7XHJcbiAgICB0ZW1wbGF0ZSA9ICggdGVtcGxhdGUgJiYgdGVtcGxhdGUuZ2V0ICkgPyB0ZW1wbGF0ZS5nZXQoKSA6IHRlbXBsYXRlO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHRlbXBsYXRlID09PSAnc3RyaW5nJywgYGludmFsaWQgdGVtcGxhdGU6ICR7dGVtcGxhdGV9YCApO1xyXG5cclxuICAgIC8vIFRvIGNhdGNoIGF0dGVtcHRzIHRvIHVzZSBTdHJpbmdVdGlscy5maWxsSW4gbGlrZSBTdHJpbmdVdGlscy5mb3JtYXRcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhbHVlcyAmJiB0eXBlb2YgdmFsdWVzID09PSAnb2JqZWN0JywgYGludmFsaWQgdmFsdWVzOiAke3ZhbHVlc31gICk7XHJcblxyXG4gICAgbGV0IG5ld1N0cmluZyA9IHRlbXBsYXRlO1xyXG5cclxuICAgIC8vIHtzdHJpbmdbXX0gcGFyc2Ugb3V0IHRoZSBzZXQgb2YgcGxhY2Vob2xkZXJzXHJcbiAgICBjb25zdCBwbGFjZWhvbGRlcnMgPSB0ZW1wbGF0ZS5tYXRjaCggL1xce1xce1tee31dK1xcfVxcfS9nICkgfHwgW107XHJcblxyXG4gICAgLy8gcmVwbGFjZSBlYWNoIHBsYWNlaG9sZGVyIHdpdGggaXRzIGNvcnJlc3BvbmRpbmcgdmFsdWVcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBsYWNlaG9sZGVycy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgcGxhY2Vob2xkZXIgPSBwbGFjZWhvbGRlcnNbIGkgXTtcclxuXHJcbiAgICAgIC8vIGtleSBpcyB0aGUgcG9ydGlvbiBvZiB0aGUgcGxhY2Vob2xkZXIgYmV0d2VlbiB0aGUgY3VybHkgYnJhY2VzXHJcbiAgICAgIGNvbnN0IGtleSA9IHBsYWNlaG9sZGVyLnJlcGxhY2UoICd7eycsICcnICkucmVwbGFjZSggJ319JywgJycgKTtcclxuICAgICAgaWYgKCB2YWx1ZXNbIGtleSBdICE9PSB1bmRlZmluZWQgKSB7XHJcblxyXG4gICAgICAgIC8vIFN1cHBvcnQgUHJvcGVydGllcyBhcyB2YWx1ZXNcclxuICAgICAgICBjb25zdCB2YWx1ZVN0cmluZyA9ICggdmFsdWVzWyBrZXkgXSAmJiB2YWx1ZXNbIGtleSBdLmdldCApID8gdmFsdWVzWyBrZXkgXS5nZXQoKSA6IHZhbHVlc1sga2V5IF07XHJcbiAgICAgICAgbmV3U3RyaW5nID0gbmV3U3RyaW5nLnJlcGxhY2UoIHBsYWNlaG9sZGVyLCB2YWx1ZVN0cmluZyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5ld1N0cmluZztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gV2hldGhlciB0aGlzIGxlbmd0aC0xIHN0cmluZyBpcyBlcXVhbCB0byBvbmUgb2YgdGhlIHRocmVlIGRpcmVjdGlvbmFsIGVtYmVkZGluZyBtYXJrcyB1c2VkLlxyXG4gICAqL1xyXG4gIGlzRW1iZWRkaW5nTWFyazogZnVuY3Rpb24oIGNociApIHtcclxuICAgIHJldHVybiBjaHIgPT09IExUUiB8fCBjaHIgPT09IFJUTCB8fCBjaHIgPT09IFBPUDtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiBhIHN0cmluZyB3aXRoIGVtYmVkZGluZyBtYXJrcywgdGhpcyBmdW5jdGlvbiByZXR1cm5zIGFuIGVxdWl2YWxlbnQgc3RyaW5nLnNsaWNlKCkgYnV0IHByZWZpeGVzIGFuZCBzdWZmaXhlc1xyXG4gICAqIHRoZSBzdHJpbmcgd2l0aCB0aGUgZW1iZWRkaW5nIG1hcmtzIG5lZWRlZCB0byBlbnN1cmUgdGhpbmdzIGhhdmUgdGhlIGNvcnJlY3QgTFRSL1JUTCBvcmRlci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBGb3IgZXhhbXBsZSwgd2l0aCBhIHRlc3Qgc3RyaW5nOlxyXG4gICAqXHJcbiAgICogZW1iZWRkZWREZWJ1Z1N0cmluZyggJ1xcdTIwMmFcXHUyMDJiaGlcXHUyMDJjXFx1MjAyYycgKVxyXG4gICAqID09PSBcIltMVFJdW1JUTF1oaVtQT1BdW1BPUF1cIlxyXG4gICAqXHJcbiAgICogV2UgY291bGQgZ3JhYiB0aGUgZmlyc3Qgd29yZCwgYW5kIGl0IGFkZHMgdGhlIGVuZGluZyBQT1A6XHJcbiAgICogZW1iZWRkZWREZWJ1Z1N0cmluZyggZW1iZWRkZWRTbGljZSggJ1xcdTIwMmFmaXJzdFxcdTIwMmJzZWNvbmRcXHUyMDJjdGhpcmRcXHUyMDJjJywgMCwgNiApIClcclxuICAgKiA9PT0gXCJbTFRSXWZpcnN0W1BPUF1cIlxyXG4gICAqXHJcbiAgICogT3IgdGhlIHNlY29uZCB3b3JkOlxyXG4gICAqIGVtYmVkZGVkRGVidWdTdHJpbmcoIGVtYmVkZGVkU2xpY2UoICdcXHUyMDJhZmlyc3RcXHUyMDJic2Vjb25kXFx1MjAyY3RoaXJkXFx1MjAyYycsIDYsIDE0ICkgKVxyXG4gICAqID09PSBcIltSVExdc2Vjb25kW1BPUF1cIlxyXG4gICAqXHJcbiAgICogT3IgYSBjdXN0b20gcmFuZ2U6XHJcbiAgICogZW1iZWRkZWREZWJ1Z1N0cmluZyggZW1iZWRkZWRTbGljZSggJ1xcdTIwMmFmaXJzdFxcdTIwMmJzZWNvbmRcXHUyMDJjdGhpcmRcXHUyMDJjJywgMywgLTMgKSApXHJcbiAgICogPT09IFwiW0xUUl1yc3RbUlRMXXNlY29uZFtQT1BddGhpW1BPUF1cIlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyAtIFRoZSBtYWluIHNvdXJjZSBzdHJpbmcgdG8gc2xpY2UgZnJvbVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydEluZGV4IC0gVGhlIHN0YXJ0aW5nIGluZGV4IHdoZXJlIHRoZSBzbGljZSBzdGFydHMgKGluY2x1ZGVzIGNoYXIgYXQgdGhpcyBpbmRleClcclxuICAgKiBAcGFyYW0ge251bWJlcn0gW2VuZEluZGV4XSAtIFRoZSBlbmRpbmcgaW5kZXggd2hlcmUgdGhlIHNsaWNlIHN0b3BzIChkb2VzIE5PVCBpbmNsdWRlIGNoYXIgYXQgdGhpcyBpbmRleClcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIFRoZSBzbGljZWQgc3RyaW5nLCB3aXRoIGVtYmVkZGluZyBtYXJrcyBhZGRlZCBhdCBodGUgc3RhcnQgYW5kIGVuZC5cclxuICAgKi9cclxuICBlbWJlZGRlZFNsaWNlOiBmdW5jdGlvbiggc3RyaW5nLCBzdGFydEluZGV4LCBlbmRJbmRleCApIHtcclxuICAgIC8vIHtBcnJheS48c3RyaW5nPn0gLSBhcnJheSBvZiBMVFIvUlRMIGVtYmVkZGluZyBtYXJrcyB0aGF0IGFyZSBjdXJyZW50bHkgb24gdGhlIHN0YWNrIGZvciB0aGUgY3VycmVudCBsb2NhdGlvbi5cclxuICAgIGNvbnN0IHN0YWNrID0gW107XHJcbiAgICBsZXQgY2hyO1xyXG5cclxuICAgIGlmICggZW5kSW5kZXggPT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgZW5kSW5kZXggPSBzdHJpbmcubGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgaWYgKCBlbmRJbmRleCA8IDAgKSB7XHJcbiAgICAgIGVuZEluZGV4ICs9IHN0cmluZy5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVG8gYXZvaWQgcmV0dXJuaW5nIGFuIGV4dHJhIGFkamFjZW50IFtMVFJdW1BPUF0gb3IgW1JUTF1bUE9QXSwgd2UgY2FuIG1vdmUgdGhlIHN0YXJ0IGZvcndhcmQgYW5kIHRoZVxyXG4gICAgLy8gZW5kIGJhY2t3YXJkcyBhcyBsb25nIGFzIHRoZXkgYXJlIG92ZXIgZW1iZWRkaW5nIG1hcmtzIHRvIGF2b2lkIHRoaXMuXHJcbiAgICB3aGlsZSAoIHN0YXJ0SW5kZXggPCBzdHJpbmcubGVuZ3RoICYmIFN0cmluZ1V0aWxzLmlzRW1iZWRkaW5nTWFyayggc3RyaW5nLmNoYXJBdCggc3RhcnRJbmRleCApICkgKSB7XHJcbiAgICAgIHN0YXJ0SW5kZXgrKztcclxuICAgIH1cclxuICAgIHdoaWxlICggZW5kSW5kZXggPj0gMSAmJiBTdHJpbmdVdGlscy5pc0VtYmVkZGluZ01hcmsoIHN0cmluZy5jaGFyQXQoIGVuZEluZGV4IC0gMSApICkgKSB7XHJcbiAgICAgIGVuZEluZGV4LS07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgb3VyIHN0cmluZyB3aWxsIGJlIGVtcHR5LCBqdXN0IGJhaWwgb3V0LlxyXG4gICAgaWYgKCBzdGFydEluZGV4ID49IGVuZEluZGV4IHx8IHN0YXJ0SW5kZXggPj0gc3RyaW5nLmxlbmd0aCApIHtcclxuICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFdhbGsgdXAgdG8gdGhlIHN0YXJ0IG9mIHRoZSBzdHJpbmdcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0YXJ0SW5kZXg7IGkrKyApIHtcclxuICAgICAgY2hyID0gc3RyaW5nLmNoYXJBdCggaSApO1xyXG4gICAgICBpZiAoIGNociA9PT0gTFRSIHx8IGNociA9PT0gUlRMICkge1xyXG4gICAgICAgIHN0YWNrLnB1c2goIGNociApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBjaHIgPT09IFBPUCApIHtcclxuICAgICAgICBzdGFjay5wb3AoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFdpbGwgc3RvcmUgdGhlIG1pbmltdW0gc3RhY2sgc2l6ZSBkdXJpbmcgb3VyIHNsaWNlLiBUaGlzIGFsbG93cyB1cyB0byB0dXJuIFtMVFJdW1JUTF1ib29bUE9QXVtQT1BdIGludG9cclxuICAgIC8vIFtSVExdYm9vW1BPUF0gYnkgc2tpcHBpbmcgdGhlIFwib3V0ZXJcIiBsYXllcnMuXHJcbiAgICBsZXQgbWluaW11bVN0YWNrU2l6ZSA9IHN0YWNrLmxlbmd0aDtcclxuXHJcbiAgICAvLyBTYXZlIG91ciBpbml0aWFsIHN0YWNrIGZvciBwcmVmaXggY29tcHV0YXRpb25cclxuICAgIGxldCBzdGFydFN0YWNrID0gc3RhY2suc2xpY2UoKTtcclxuXHJcbiAgICAvLyBBIG5vcm1hbCBzdHJpbmcgc2xpY2VcclxuICAgIGNvbnN0IHNsaWNlID0gc3RyaW5nLnNsaWNlKCBzdGFydEluZGV4LCBlbmRJbmRleCApO1xyXG5cclxuICAgIC8vIFdhbGsgdGhyb3VnaCB0aGUgc2xpY2VkIHN0cmluZywgdG8gZGV0ZXJtaW5lIHdoYXQgd2UgbmVlZCBmb3IgdGhlIHN1ZmZpeFxyXG4gICAgZm9yICggbGV0IGogPSAwOyBqIDwgc2xpY2UubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgIGNociA9IHNsaWNlLmNoYXJBdCggaiApO1xyXG4gICAgICBpZiAoIGNociA9PT0gTFRSIHx8IGNociA9PT0gUlRMICkge1xyXG4gICAgICAgIHN0YWNrLnB1c2goIGNociApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBjaHIgPT09IFBPUCApIHtcclxuICAgICAgICBzdGFjay5wb3AoKTtcclxuICAgICAgICBtaW5pbXVtU3RhY2tTaXplID0gTWF0aC5taW4oIHN0YWNrLmxlbmd0aCwgbWluaW11bVN0YWNrU2l6ZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gT3VyIGVuZGluZyBzdGFjayBmb3Igc3VmZml4IGNvbXB1dGF0aW9uXHJcbiAgICBsZXQgZW5kU3RhY2sgPSBzdGFjaztcclxuXHJcbiAgICAvLyBBbHdheXMgbGVhdmUgb25lIHN0YWNrIGxldmVsIG9uIHRvcFxyXG4gICAgY29uc3QgbnVtU2tpcHBlZFN0YWNrTGV2ZWxzID0gTWF0aC5tYXgoIDAsIG1pbmltdW1TdGFja1NpemUgLSAxICk7XHJcbiAgICBzdGFydFN0YWNrID0gc3RhcnRTdGFjay5zbGljZSggbnVtU2tpcHBlZFN0YWNrTGV2ZWxzICk7XHJcbiAgICBlbmRTdGFjayA9IGVuZFN0YWNrLnNsaWNlKCBudW1Ta2lwcGVkU3RhY2tMZXZlbHMgKTtcclxuXHJcbiAgICAvLyBPdXIgcHJlZml4IHdpbGwgYmUgdGhlIGVtYmVkZGluZyBtYXJrcyB0aGF0IGhhdmUgYmVlbiBza2lwcGVkIGFuZCBub3QgcG9wcGVkLlxyXG4gICAgY29uc3QgcHJlZml4ID0gc3RhcnRTdGFjay5qb2luKCAnJyApO1xyXG5cclxuICAgIC8vIE91ciBzdWZmaXggaW5jbHVkZXMgb25lIFBPUCBmb3IgZWFjaCBlbWJlZGRpbmcgbWFyayBjdXJyZW50bHkgb24gdGhlIHN0YWNrXHJcbiAgICBjb25zdCBzdWZmaXggPSBlbmRTdGFjay5qb2luKCAnJyApLnJlcGxhY2UoIC8uL2csIFBPUCApO1xyXG5cclxuICAgIHJldHVybiBwcmVmaXggKyBzbGljZSArIHN1ZmZpeDtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBTdHJpbmcncyBzcGxpdCgpIEFQSSwgYnV0IHVzZXMgZW1iZWRkZWRTbGljZSgpIG9uIHRoZSBleHRyYWN0ZWQgc3RyaW5ncy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBGb3IgZXhhbXBsZSwgZ2l2ZW4gYSBzdHJpbmc6XHJcbiAgICpcclxuICAgKiBTdHJpbmdVdGlscy5lbWJlZGRlZERlYnVnU3RyaW5nKCAnXFx1MjAyYUhlbGxvICB0aGVyZSwgXFx1MjAyYkhvdyBhcmUgeW91XFx1MjAyYyBkb2luZz9cXHUyMDJjJyApO1xyXG4gICAqID09PSBcIltMVFJdSGVsbG8gIHRoZXJlLCBbUlRMXUhvdyBhcmUgeW91W1BPUF0gZG9pbmc/W1BPUF1cIlxyXG4gICAqXHJcbiAgICogVXNpbmcgZW1iZWRkZWRTcGxpdCB3aXRoIGEgcmVndWxhciBleHByZXNzaW9uIG1hdGNoaW5nIGEgc2VxdWVuY2Ugb2Ygc3BhY2VzOlxyXG4gICAqIFN0cmluZ1V0aWxzLmVtYmVkZGVkU3BsaXQoICdcXHUyMDJhSGVsbG8gIHRoZXJlLCBcXHUyMDJiSG93IGFyZSB5b3VcXHUyMDJjIGRvaW5nP1xcdTIwMmMnLCAvICsvIClcclxuICAgKiAgICAgICAgICAgIC5tYXAoIFN0cmluZ1V0aWxzLmVtYmVkZGVkRGVidWdTdHJpbmcgKTtcclxuICAgKiA9PT0gWyBcIltMVFJdSGVsbG9bUE9QXVwiLFxyXG4gICAqICAgICAgIFwiW0xUUl10aGVyZSxbUE9QXVwiLFxyXG4gICAqICAgICAgIFwiW1JUTF1Ib3dbUE9QXVwiLFxyXG4gICAqICAgICAgIFwiW1JUTF1hcmVbUE9QXVwiLFxyXG4gICAqICAgICAgIFwiW1JUTF15b3VbUE9QXVwiLFxyXG4gICAqICAgICAgIFwiW0xUUl1kb2luZz9bUE9QXVwiIF1cclxuICAgKi9cclxuICBlbWJlZGRlZFNwbGl0OiBmdW5jdGlvbiggc3RyaW5nLCBzZXBhcmF0b3IsIGxpbWl0ICkge1xyXG4gICAgLy8gTWF0Y2hpbmcgc3BsaXQgQVBJXHJcbiAgICBpZiAoIHNlcGFyYXRvciA9PT0gdW5kZWZpbmVkICkge1xyXG4gICAgICByZXR1cm4gWyBzdHJpbmcgXTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB7QXJyYXkuPHN0cmluZz59IC0gV2hhdCB3ZSB3aWxsIHB1c2ggdG8gYW5kIHJldHVybi5cclxuICAgIGxldCByZXN1bHQgPSBbXTtcclxuXHJcbiAgICAvLyB7IGluZGV4OiB7bnVtYmVyfSwgbGVuZ3RoOiB7bnVtYmVyfSB9IC0gTGFzdCByZXN1bHQgb2YgZmluZFNlcGFyYXRvck1hdGNoKClcclxuICAgIGxldCBzZXBhcmF0b3JNYXRjaDtcclxuXHJcbiAgICAvLyBSZW1haW5pbmcgcGFydCBvZiB0aGUgc3RyaW5nIHRvIHNwbGl0IHVwLiBXaWxsIGhhdmUgc3Vic3RyaW5ncyByZW1vdmVkIGZyb20gdGhlIHN0YXJ0LlxyXG4gICAgbGV0IHN0cmluZ1RvU3BsaXQgPSBzdHJpbmc7XHJcblxyXG4gICAgLy8gRmluZHMgdGhlIGluZGV4IGFuZCBsZW5ndGggb2YgdGhlIGZpcnN0IHN1YnN0cmluZyBvZiBzdHJpbmdUb1NwbGl0IHRoYXQgbWF0Y2hlcyB0aGUgc2VwYXJhdG9yIChzdHJpbmcgb3IgcmVnZXgpXHJcbiAgICAvLyBhbmQgcmV0dXJucyBhbiBvYmplY3Qgd2l0aCB0aGUgdHlwZSAgeyBpbmRleDoge251bWJlcn0sIGxlbmd0aDoge251bWJlcn0gfS5cclxuICAgIC8vIElmIGluZGV4ID09PSAtMSwgdGhlcmUgd2FzIG5vIG1hdGNoIGZvciB0aGUgc2VwYXJhdG9yLlxyXG4gICAgZnVuY3Rpb24gZmluZFNlcGFyYXRvck1hdGNoKCkge1xyXG4gICAgICBsZXQgaW5kZXg7XHJcbiAgICAgIGxldCBsZW5ndGg7XHJcbiAgICAgIGlmICggc2VwYXJhdG9yIGluc3RhbmNlb2Ygd2luZG93LlJlZ0V4cCApIHtcclxuICAgICAgICBjb25zdCBtYXRjaCA9IHN0cmluZ1RvU3BsaXQubWF0Y2goIHNlcGFyYXRvciApO1xyXG4gICAgICAgIGlmICggbWF0Y2ggKSB7XHJcbiAgICAgICAgICBpbmRleCA9IG1hdGNoLmluZGV4O1xyXG4gICAgICAgICAgbGVuZ3RoID0gbWF0Y2hbIDAgXS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgaW5kZXggPSAtMTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHNlcGFyYXRvciA9PT0gJ3N0cmluZycgKTtcclxuXHJcbiAgICAgICAgaW5kZXggPSBzdHJpbmdUb1NwbGl0LmluZGV4T2YoIHNlcGFyYXRvciApO1xyXG4gICAgICAgIGxlbmd0aCA9IHNlcGFyYXRvci5sZW5ndGg7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBpbmRleDogaW5kZXgsXHJcbiAgICAgICAgbGVuZ3RoOiBsZW5ndGhcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMb29wIHVudGlsIHdlIHJ1biBvdXQgb2YgbWF0Y2hlcyBmb3IgdGhlIHNlcGFyYXRvci4gRm9yIGVhY2ggc2VwYXJhdG9yIG1hdGNoLCBzdHJpbmdUb1NwbGl0IGZvciB0aGUgbmV4dFxyXG4gICAgLy8gaXRlcmF0aW9uIHdpbGwgaGF2ZSBldmVyeXRoaW5nIHVwIHRvIHRoZSBlbmQgb2YgdGhlIHNlcGFyYXRvciBtYXRjaCBjaG9wcGVkIG9mZi4gVGhlIGluZGV4T2Zmc2V0IHZhcmlhYmxlXHJcbiAgICAvLyBzdG9yZXMgaG93IG1hbnkgY2hhcmFjdGVycyB3ZSBoYXZlIGNob3BwZWQgb2ZmIGluIHRoaXMgZmFzaGlvbiwgc28gdGhhdCB3ZSBjYW4gaW5kZXggaW50byB0aGUgb3JpZ2luYWwgc3RyaW5nLlxyXG4gICAgbGV0IGluZGV4T2Zmc2V0ID0gMDtcclxuICAgIHdoaWxlICggKCBzZXBhcmF0b3JNYXRjaCA9IGZpbmRTZXBhcmF0b3JNYXRjaCgpICkuaW5kZXggPj0gMCApIHtcclxuICAgICAgLy8gRXh0cmFjdCBlbWJlZGRlZCBzbGljZSBmcm9tIHRoZSBvcmlnaW5hbCwgdXAgdW50aWwgdGhlIHNlcGFyYXRvciBtYXRjaFxyXG4gICAgICByZXN1bHQucHVzaCggU3RyaW5nVXRpbHMuZW1iZWRkZWRTbGljZSggc3RyaW5nLCBpbmRleE9mZnNldCwgaW5kZXhPZmZzZXQgKyBzZXBhcmF0b3JNYXRjaC5pbmRleCApICk7XHJcblxyXG4gICAgICAvLyBIYW5kbGUgY2hvcHBpbmcgb2ZmIHRoZSBzZWN0aW9uIG9mIHN0cmluZ1RvU3BsaXQsIHNvIHdlIGNhbiBkbyBzaW1wbGUgbWF0Y2hpbmcgaW4gZmluZFNlcGFyYXRvck1hdGNoKClcclxuICAgICAgY29uc3Qgb2Zmc2V0ID0gc2VwYXJhdG9yTWF0Y2guaW5kZXggKyBzZXBhcmF0b3JNYXRjaC5sZW5ndGg7XHJcbiAgICAgIHN0cmluZ1RvU3BsaXQgPSBzdHJpbmdUb1NwbGl0LnNsaWNlKCBvZmZzZXQgKTtcclxuICAgICAgaW5kZXhPZmZzZXQgKz0gb2Zmc2V0O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEVtYmVkZGVkIHNsaWNlIGZvciBhZnRlciB0aGUgbGFzdCBtYXRjaC4gTWF5IGJlIGFuIGVtcHR5IHN0cmluZy5cclxuICAgIHJlc3VsdC5wdXNoKCBTdHJpbmdVdGlscy5lbWJlZGRlZFNsaWNlKCBzdHJpbmcsIGluZGV4T2Zmc2V0ICkgKTtcclxuXHJcbiAgICAvLyBNYXRjaGluZyBzcGxpdCBBUElcclxuICAgIGlmICggbGltaXQgIT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGxpbWl0ID09PSAnbnVtYmVyJyApO1xyXG5cclxuICAgICAgcmVzdWx0ID0gXy5maXJzdCggcmVzdWx0LCBsaW1pdCApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmVwbGFjZXMgZW1iZWRkaW5nIG1hcmsgY2hhcmFjdGVycyB3aXRoIHZpc2libGUgc3RyaW5ncy4gVXNlZnVsIGZvciBkZWJ1Z2dpbmcgZm9yIHN0cmluZ3Mgd2l0aCBlbWJlZGRpbmcgbWFya3MuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZ1xyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gV2l0aCBlbWJlZGRpbmcgbWFya3MgcmVwbGFjZWQuXHJcbiAgICovXHJcbiAgZW1iZWRkZWREZWJ1Z1N0cmluZzogZnVuY3Rpb24oIHN0cmluZyApIHtcclxuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSggL1xcdTIwMmEvZywgJ1tMVFJdJyApLnJlcGxhY2UoIC9cXHUyMDJiL2csICdbUlRMXScgKS5yZXBsYWNlKCAvXFx1MjAyYy9nLCAnW1BPUF0nICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogV3JhcHMgYSBzdHJpbmcgd2l0aCBlbWJlZGRpbmcgbWFya3MgZm9yIExUUiBkaXNwbGF5LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmdcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIHdyYXBMVFI6IGZ1bmN0aW9uKCBzdHJpbmcgKSB7XHJcbiAgICByZXR1cm4gTFRSICsgc3RyaW5nICsgUE9QO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFdyYXBzIGEgc3RyaW5nIHdpdGggZW1iZWRkaW5nIG1hcmtzIGZvciBSVEwgZGlzcGxheS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICB3cmFwUlRMOiBmdW5jdGlvbiggc3RyaW5nICkge1xyXG4gICAgcmV0dXJuIFJUTCArIHN0cmluZyArIFBPUDtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBXcmFwcyBhIHN0cmluZyB3aXRoIGVtYmVkZGluZyBtYXJrcyBmb3IgTFRSL1JUTCBkaXNwbGF5LCBkZXBlbmRpbmcgb24gdGhlIGRpcmVjdGlvblxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmdcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZGlyZWN0aW9uIC0gZWl0aGVyICdsdHInIG9yICdydGwnXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICB3cmFwRGlyZWN0aW9uOiBmdW5jdGlvbiggc3RyaW5nLCBkaXJlY3Rpb24gKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkaXJlY3Rpb24gPT09ICdsdHInIHx8IGRpcmVjdGlvbiA9PT0gJ3J0bCcgKTtcclxuXHJcbiAgICBpZiAoIGRpcmVjdGlvbiA9PT0gJ2x0cicgKSB7XHJcbiAgICAgIHJldHVybiBTdHJpbmdVdGlscy53cmFwTFRSKCBzdHJpbmcgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gU3RyaW5nVXRpbHMud3JhcFJUTCggc3RyaW5nICk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogR2l2ZW4gYSBsb2NhbGUsIGUuZy4gJ2VzJywgcHJvdmlkZXMgdGhlIGxvY2FsaXplZCBuYW1lLCBlLmcuICdFc3Bhw7FvbCdcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBsb2NhbGVcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGxvY2FsZVRvTG9jYWxpemVkTmFtZTogZnVuY3Rpb24oIGxvY2FsZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxvY2FsZUluZm9Nb2R1bGVbIGxvY2FsZSBdLCAnbG9jYWxlIG5lZWRzIHRvIGJlIGEgdmFsaWQgbG9jYWxlIGNvZGUgZGVmaW5lZCBpbiBsb2NhbGVJbmZvTW9kdWxlJyApO1xyXG5cclxuICAgIHJldHVybiBTdHJpbmdVdGlscy53cmFwRGlyZWN0aW9uKFxyXG4gICAgICBsb2NhbGVJbmZvTW9kdWxlWyBsb2NhbGUgXS5sb2NhbGl6ZWROYW1lLFxyXG4gICAgICBsb2NhbGVJbmZvTW9kdWxlWyBsb2NhbGUgXS5kaXJlY3Rpb25cclxuICAgICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FwaXRhbGl6ZSB0aGUgZmlyc3QgbGV0dGVyIG9mIHRoZSBnaXZlbiBzdHJpbmcuXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZ1xyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNhcGl0YWxpemUoIHN0cmluZyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHN0cmluZy5sZW5ndGggPiAwLCAnZXhwZWN0ZWQgYSBub24temVybyBzdHJpbmcnICk7XHJcbiAgICByZXR1cm4gc3RyaW5nWyAwIF0udG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSggMSApO1xyXG4gIH1cclxufTtcclxuXHJcbnBoZXRjb21tb24ucmVnaXN0ZXIoICdTdHJpbmdVdGlscycsIFN0cmluZ1V0aWxzICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTdHJpbmdVdGlsczsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxnQkFBZ0IsTUFBTSw4Q0FBOEM7QUFDM0UsT0FBT0MsVUFBVSxNQUFNLGtCQUFrQjs7QUFFekM7QUFDQSxNQUFNQyxHQUFHLEdBQUcsUUFBUTtBQUNwQixNQUFNQyxHQUFHLEdBQUcsUUFBUTtBQUNwQixNQUFNQyxHQUFHLEdBQUcsUUFBUTtBQUVwQixNQUFNQyxXQUFXLEdBQUc7RUFFbEI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsTUFBTSxFQUFFLFNBQUFBLENBQVVDLE9BQU8sRUFBRztJQUMxQjtJQUNBLE1BQU1DLElBQUksR0FBR0MsU0FBUztJQUN0QixPQUFPRixPQUFPLENBQUNHLE9BQU8sQ0FBRSxTQUFTLEVBQUUsQ0FBRUMsQ0FBQyxFQUFFQyxDQUFDLEtBQU1KLElBQUksQ0FBRSxDQUFDSSxDQUFDLEdBQUcsQ0FBQyxDQUFHLENBQUM7RUFDakUsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxNQUFNLEVBQUUsU0FBQUEsQ0FBVUMsUUFBUSxFQUFFQyxNQUFNLEVBQUc7SUFDbkNELFFBQVEsR0FBS0EsUUFBUSxJQUFJQSxRQUFRLENBQUNFLEdBQUcsR0FBS0YsUUFBUSxDQUFDRSxHQUFHLENBQUMsQ0FBQyxHQUFHRixRQUFRO0lBQ25FRyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPSCxRQUFRLEtBQUssUUFBUSxFQUFHLHFCQUFvQkEsUUFBUyxFQUFFLENBQUM7O0lBRWpGO0lBQ0FHLE1BQU0sSUFBSUEsTUFBTSxDQUFFRixNQUFNLElBQUksT0FBT0EsTUFBTSxLQUFLLFFBQVEsRUFBRyxtQkFBa0JBLE1BQU8sRUFBRSxDQUFDO0lBRXJGLElBQUlHLFNBQVMsR0FBR0osUUFBUTs7SUFFeEI7SUFDQSxNQUFNSyxZQUFZLEdBQUdMLFFBQVEsQ0FBQ00sS0FBSyxDQUFFLGlCQUFrQixDQUFDLElBQUksRUFBRTs7SUFFOUQ7SUFDQSxLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0YsWUFBWSxDQUFDRyxNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFHO01BQzlDLE1BQU1FLFdBQVcsR0FBR0osWUFBWSxDQUFFRSxDQUFDLENBQUU7O01BRXJDO01BQ0EsTUFBTUcsR0FBRyxHQUFHRCxXQUFXLENBQUNiLE9BQU8sQ0FBRSxJQUFJLEVBQUUsRUFBRyxDQUFDLENBQUNBLE9BQU8sQ0FBRSxJQUFJLEVBQUUsRUFBRyxDQUFDO01BQy9ELElBQUtLLE1BQU0sQ0FBRVMsR0FBRyxDQUFFLEtBQUtDLFNBQVMsRUFBRztRQUVqQztRQUNBLE1BQU1DLFdBQVcsR0FBS1gsTUFBTSxDQUFFUyxHQUFHLENBQUUsSUFBSVQsTUFBTSxDQUFFUyxHQUFHLENBQUUsQ0FBQ1IsR0FBRyxHQUFLRCxNQUFNLENBQUVTLEdBQUcsQ0FBRSxDQUFDUixHQUFHLENBQUMsQ0FBQyxHQUFHRCxNQUFNLENBQUVTLEdBQUcsQ0FBRTtRQUNoR04sU0FBUyxHQUFHQSxTQUFTLENBQUNSLE9BQU8sQ0FBRWEsV0FBVyxFQUFFRyxXQUFZLENBQUM7TUFDM0Q7SUFDRjtJQUVBLE9BQU9SLFNBQVM7RUFDbEIsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VTLGVBQWUsRUFBRSxTQUFBQSxDQUFVQyxHQUFHLEVBQUc7SUFDL0IsT0FBT0EsR0FBRyxLQUFLMUIsR0FBRyxJQUFJMEIsR0FBRyxLQUFLekIsR0FBRyxJQUFJeUIsR0FBRyxLQUFLeEIsR0FBRztFQUNsRCxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0V5QixhQUFhLEVBQUUsU0FBQUEsQ0FBVUMsTUFBTSxFQUFFQyxVQUFVLEVBQUVDLFFBQVEsRUFBRztJQUN0RDtJQUNBLE1BQU1DLEtBQUssR0FBRyxFQUFFO0lBQ2hCLElBQUlMLEdBQUc7SUFFUCxJQUFLSSxRQUFRLEtBQUtQLFNBQVMsRUFBRztNQUM1Qk8sUUFBUSxHQUFHRixNQUFNLENBQUNSLE1BQU07SUFDMUI7SUFDQSxJQUFLVSxRQUFRLEdBQUcsQ0FBQyxFQUFHO01BQ2xCQSxRQUFRLElBQUlGLE1BQU0sQ0FBQ1IsTUFBTTtJQUMzQjs7SUFFQTtJQUNBO0lBQ0EsT0FBUVMsVUFBVSxHQUFHRCxNQUFNLENBQUNSLE1BQU0sSUFBSWpCLFdBQVcsQ0FBQ3NCLGVBQWUsQ0FBRUcsTUFBTSxDQUFDSSxNQUFNLENBQUVILFVBQVcsQ0FBRSxDQUFDLEVBQUc7TUFDakdBLFVBQVUsRUFBRTtJQUNkO0lBQ0EsT0FBUUMsUUFBUSxJQUFJLENBQUMsSUFBSTNCLFdBQVcsQ0FBQ3NCLGVBQWUsQ0FBRUcsTUFBTSxDQUFDSSxNQUFNLENBQUVGLFFBQVEsR0FBRyxDQUFFLENBQUUsQ0FBQyxFQUFHO01BQ3RGQSxRQUFRLEVBQUU7SUFDWjs7SUFFQTtJQUNBLElBQUtELFVBQVUsSUFBSUMsUUFBUSxJQUFJRCxVQUFVLElBQUlELE1BQU0sQ0FBQ1IsTUFBTSxFQUFHO01BQzNELE9BQU8sRUFBRTtJQUNYOztJQUVBO0lBQ0EsS0FBTSxJQUFJRCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdVLFVBQVUsRUFBRVYsQ0FBQyxFQUFFLEVBQUc7TUFDckNPLEdBQUcsR0FBR0UsTUFBTSxDQUFDSSxNQUFNLENBQUViLENBQUUsQ0FBQztNQUN4QixJQUFLTyxHQUFHLEtBQUsxQixHQUFHLElBQUkwQixHQUFHLEtBQUt6QixHQUFHLEVBQUc7UUFDaEM4QixLQUFLLENBQUNFLElBQUksQ0FBRVAsR0FBSSxDQUFDO01BQ25CLENBQUMsTUFDSSxJQUFLQSxHQUFHLEtBQUt4QixHQUFHLEVBQUc7UUFDdEI2QixLQUFLLENBQUNHLEdBQUcsQ0FBQyxDQUFDO01BQ2I7SUFDRjs7SUFFQTtJQUNBO0lBQ0EsSUFBSUMsZ0JBQWdCLEdBQUdKLEtBQUssQ0FBQ1gsTUFBTTs7SUFFbkM7SUFDQSxJQUFJZ0IsVUFBVSxHQUFHTCxLQUFLLENBQUNNLEtBQUssQ0FBQyxDQUFDOztJQUU5QjtJQUNBLE1BQU1BLEtBQUssR0FBR1QsTUFBTSxDQUFDUyxLQUFLLENBQUVSLFVBQVUsRUFBRUMsUUFBUyxDQUFDOztJQUVsRDtJQUNBLEtBQU0sSUFBSVEsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHRCxLQUFLLENBQUNqQixNQUFNLEVBQUVrQixDQUFDLEVBQUUsRUFBRztNQUN2Q1osR0FBRyxHQUFHVyxLQUFLLENBQUNMLE1BQU0sQ0FBRU0sQ0FBRSxDQUFDO01BQ3ZCLElBQUtaLEdBQUcsS0FBSzFCLEdBQUcsSUFBSTBCLEdBQUcsS0FBS3pCLEdBQUcsRUFBRztRQUNoQzhCLEtBQUssQ0FBQ0UsSUFBSSxDQUFFUCxHQUFJLENBQUM7TUFDbkIsQ0FBQyxNQUNJLElBQUtBLEdBQUcsS0FBS3hCLEdBQUcsRUFBRztRQUN0QjZCLEtBQUssQ0FBQ0csR0FBRyxDQUFDLENBQUM7UUFDWEMsZ0JBQWdCLEdBQUdJLElBQUksQ0FBQ0MsR0FBRyxDQUFFVCxLQUFLLENBQUNYLE1BQU0sRUFBRWUsZ0JBQWlCLENBQUM7TUFDL0Q7SUFDRjs7SUFFQTtJQUNBLElBQUlNLFFBQVEsR0FBR1YsS0FBSzs7SUFFcEI7SUFDQSxNQUFNVyxxQkFBcUIsR0FBR0gsSUFBSSxDQUFDSSxHQUFHLENBQUUsQ0FBQyxFQUFFUixnQkFBZ0IsR0FBRyxDQUFFLENBQUM7SUFDakVDLFVBQVUsR0FBR0EsVUFBVSxDQUFDQyxLQUFLLENBQUVLLHFCQUFzQixDQUFDO0lBQ3RERCxRQUFRLEdBQUdBLFFBQVEsQ0FBQ0osS0FBSyxDQUFFSyxxQkFBc0IsQ0FBQzs7SUFFbEQ7SUFDQSxNQUFNRSxNQUFNLEdBQUdSLFVBQVUsQ0FBQ1MsSUFBSSxDQUFFLEVBQUcsQ0FBQzs7SUFFcEM7SUFDQSxNQUFNQyxNQUFNLEdBQUdMLFFBQVEsQ0FBQ0ksSUFBSSxDQUFFLEVBQUcsQ0FBQyxDQUFDckMsT0FBTyxDQUFFLElBQUksRUFBRU4sR0FBSSxDQUFDO0lBRXZELE9BQU8wQyxNQUFNLEdBQUdQLEtBQUssR0FBR1MsTUFBTTtFQUNoQyxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsYUFBYSxFQUFFLFNBQUFBLENBQVVuQixNQUFNLEVBQUVvQixTQUFTLEVBQUVDLEtBQUssRUFBRztJQUNsRDtJQUNBLElBQUtELFNBQVMsS0FBS3pCLFNBQVMsRUFBRztNQUM3QixPQUFPLENBQUVLLE1BQU0sQ0FBRTtJQUNuQjs7SUFFQTtJQUNBLElBQUlzQixNQUFNLEdBQUcsRUFBRTs7SUFFZjtJQUNBLElBQUlDLGNBQWM7O0lBRWxCO0lBQ0EsSUFBSUMsYUFBYSxHQUFHeEIsTUFBTTs7SUFFMUI7SUFDQTtJQUNBO0lBQ0EsU0FBU3lCLGtCQUFrQkEsQ0FBQSxFQUFHO01BQzVCLElBQUlDLEtBQUs7TUFDVCxJQUFJbEMsTUFBTTtNQUNWLElBQUs0QixTQUFTLFlBQVlPLE1BQU0sQ0FBQ0MsTUFBTSxFQUFHO1FBQ3hDLE1BQU10QyxLQUFLLEdBQUdrQyxhQUFhLENBQUNsQyxLQUFLLENBQUU4QixTQUFVLENBQUM7UUFDOUMsSUFBSzlCLEtBQUssRUFBRztVQUNYb0MsS0FBSyxHQUFHcEMsS0FBSyxDQUFDb0MsS0FBSztVQUNuQmxDLE1BQU0sR0FBR0YsS0FBSyxDQUFFLENBQUMsQ0FBRSxDQUFDRSxNQUFNO1FBQzVCLENBQUMsTUFDSTtVQUNIa0MsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNaO01BQ0YsQ0FBQyxNQUNJO1FBQ0h2QyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxPQUFPaUMsU0FBUyxLQUFLLFFBQVMsQ0FBQztRQUVqRE0sS0FBSyxHQUFHRixhQUFhLENBQUNLLE9BQU8sQ0FBRVQsU0FBVSxDQUFDO1FBQzFDNUIsTUFBTSxHQUFHNEIsU0FBUyxDQUFDNUIsTUFBTTtNQUMzQjtNQUNBLE9BQU87UUFDTGtDLEtBQUssRUFBRUEsS0FBSztRQUNabEMsTUFBTSxFQUFFQTtNQUNWLENBQUM7SUFDSDs7SUFFQTtJQUNBO0lBQ0E7SUFDQSxJQUFJc0MsV0FBVyxHQUFHLENBQUM7SUFDbkIsT0FBUSxDQUFFUCxjQUFjLEdBQUdFLGtCQUFrQixDQUFDLENBQUMsRUFBR0MsS0FBSyxJQUFJLENBQUMsRUFBRztNQUM3RDtNQUNBSixNQUFNLENBQUNqQixJQUFJLENBQUU5QixXQUFXLENBQUN3QixhQUFhLENBQUVDLE1BQU0sRUFBRThCLFdBQVcsRUFBRUEsV0FBVyxHQUFHUCxjQUFjLENBQUNHLEtBQU0sQ0FBRSxDQUFDOztNQUVuRztNQUNBLE1BQU1LLE1BQU0sR0FBR1IsY0FBYyxDQUFDRyxLQUFLLEdBQUdILGNBQWMsQ0FBQy9CLE1BQU07TUFDM0RnQyxhQUFhLEdBQUdBLGFBQWEsQ0FBQ2YsS0FBSyxDQUFFc0IsTUFBTyxDQUFDO01BQzdDRCxXQUFXLElBQUlDLE1BQU07SUFDdkI7O0lBRUE7SUFDQVQsTUFBTSxDQUFDakIsSUFBSSxDQUFFOUIsV0FBVyxDQUFDd0IsYUFBYSxDQUFFQyxNQUFNLEVBQUU4QixXQUFZLENBQUUsQ0FBQzs7SUFFL0Q7SUFDQSxJQUFLVCxLQUFLLEtBQUsxQixTQUFTLEVBQUc7TUFDekJSLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU9rQyxLQUFLLEtBQUssUUFBUyxDQUFDO01BRTdDQyxNQUFNLEdBQUdVLENBQUMsQ0FBQ0MsS0FBSyxDQUFFWCxNQUFNLEVBQUVELEtBQU0sQ0FBQztJQUNuQztJQUVBLE9BQU9DLE1BQU07RUFDZixDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVksbUJBQW1CLEVBQUUsU0FBQUEsQ0FBVWxDLE1BQU0sRUFBRztJQUN0QyxPQUFPQSxNQUFNLENBQUNwQixPQUFPLENBQUUsU0FBUyxFQUFFLE9BQVEsQ0FBQyxDQUFDQSxPQUFPLENBQUUsU0FBUyxFQUFFLE9BQVEsQ0FBQyxDQUFDQSxPQUFPLENBQUUsU0FBUyxFQUFFLE9BQVEsQ0FBQztFQUN6RyxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRXVELE9BQU8sRUFBRSxTQUFBQSxDQUFVbkMsTUFBTSxFQUFHO0lBQzFCLE9BQU81QixHQUFHLEdBQUc0QixNQUFNLEdBQUcxQixHQUFHO0VBQzNCLENBQUM7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFOEQsT0FBTyxFQUFFLFNBQUFBLENBQVVwQyxNQUFNLEVBQUc7SUFDMUIsT0FBTzNCLEdBQUcsR0FBRzJCLE1BQU0sR0FBRzFCLEdBQUc7RUFDM0IsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRStELGFBQWEsRUFBRSxTQUFBQSxDQUFVckMsTUFBTSxFQUFFc0MsU0FBUyxFQUFHO0lBQzNDbkQsTUFBTSxJQUFJQSxNQUFNLENBQUVtRCxTQUFTLEtBQUssS0FBSyxJQUFJQSxTQUFTLEtBQUssS0FBTSxDQUFDO0lBRTlELElBQUtBLFNBQVMsS0FBSyxLQUFLLEVBQUc7TUFDekIsT0FBTy9ELFdBQVcsQ0FBQzRELE9BQU8sQ0FBRW5DLE1BQU8sQ0FBQztJQUN0QyxDQUFDLE1BQ0k7TUFDSCxPQUFPekIsV0FBVyxDQUFDNkQsT0FBTyxDQUFFcEMsTUFBTyxDQUFDO0lBQ3RDO0VBQ0YsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFdUMscUJBQXFCLEVBQUUsU0FBQUEsQ0FBVUMsTUFBTSxFQUFHO0lBQ3hDckQsTUFBTSxJQUFJQSxNQUFNLENBQUVqQixnQkFBZ0IsQ0FBRXNFLE1BQU0sQ0FBRSxFQUFFLG9FQUFxRSxDQUFDO0lBRXBILE9BQU9qRSxXQUFXLENBQUM4RCxhQUFhLENBQzlCbkUsZ0JBQWdCLENBQUVzRSxNQUFNLENBQUUsQ0FBQ0MsYUFBYSxFQUN4Q3ZFLGdCQUFnQixDQUFFc0UsTUFBTSxDQUFFLENBQUNGLFNBQzdCLENBQUM7RUFDSCxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VJLFVBQVVBLENBQUUxQyxNQUFNLEVBQUc7SUFDbkJiLE1BQU0sSUFBSUEsTUFBTSxDQUFFYSxNQUFNLENBQUNSLE1BQU0sR0FBRyxDQUFDLEVBQUUsNEJBQTZCLENBQUM7SUFDbkUsT0FBT1EsTUFBTSxDQUFFLENBQUMsQ0FBRSxDQUFDMkMsV0FBVyxDQUFDLENBQUMsR0FBRzNDLE1BQU0sQ0FBQ1MsS0FBSyxDQUFFLENBQUUsQ0FBQztFQUN0RDtBQUNGLENBQUM7QUFFRHRDLFVBQVUsQ0FBQ3lFLFFBQVEsQ0FBRSxhQUFhLEVBQUVyRSxXQUFZLENBQUM7QUFFakQsZUFBZUEsV0FBVyJ9