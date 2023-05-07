// Copyright 2015-2023, University of Colorado Boulder

/**
 * Returns a map such that map["locale"]["REPO/stringKey"] will be the string value (with fallbacks to English where needed).
 * Loads each string file only once, and only loads the repository/locale combinations necessary.
 */

const _ = require('lodash');
const assert = require('assert');
const ChipperConstants = require('../common/ChipperConstants');
const pascalCase = require('../common/pascalCase');
const ChipperStringUtils = require('../common/ChipperStringUtils');
const fs = require('fs');
const grunt = require('grunt');
const localeInfo = require('../data/localeInfo'); // Locale information
const path = require('path');

/**
 * Load all the required string files into memory, so we don't load them multiple times (for each usage).
 *
 * @param {Array.<string>} reposWithUsedStrings - All of the repos that have 1+ used strings
 * @param {Array.<string>} locales - All supported locales for this build
 * @returns {Object} - maps {locale:string} => Another map with: {stringKey:string} => {stringValue:string}
 */
const getStringFilesContents = (reposWithUsedStrings, locales) => {
  const stringFilesContents = {}; // maps [repositoryName][locale] => contents of locale string file

  reposWithUsedStrings.forEach(repo => {
    stringFilesContents[repo] = {};

    /**
     * Adds a locale into our stringFilesContents map.
     *
     * @param {string} locale
     * @param {boolean} isRTL
     */
    const addLocale = (locale, isRTL) => {
      // Read optional string file
      const stringsFilename = path.normalize(`../${locale === ChipperConstants.FALLBACK_LOCALE ? '' : 'babel/'}${repo}/${repo}-strings_${locale}.json`);
      let fileContents;
      try {
        fileContents = grunt.file.readJSON(stringsFilename);
      } catch (error) {
        grunt.log.debug(`missing string file: ${stringsFilename}`);
        fileContents = {};
      }

      // Format the string values
      ChipperStringUtils.formatStringValues(fileContents, isRTL);
      stringFilesContents[repo][locale] = fileContents;
    };
    locales.forEach(locale => {
      assert(localeInfo[locale], `unsupported locale: ${locale}`);
      const isRTL = localeInfo[locale].direction === 'rtl';

      // Handle fallback locales
      addLocale(locale, isRTL);
      if (locale.length > 2) {
        const middleLocale = locale.slice(0, 2);
        if (!locales.includes(middleLocale)) {
          addLocale(middleLocale, isRTL);
        }
      }
    });
  });
  return stringFilesContents;
};

/**
 * @param {string} mainRepo
 * @param {Array.<string>} locales
 * @param {Array.<string>} phetLibs - Used to check for bad string dependencies
 * @param {Array.<string>} usedModules - relative file path of the module (filename) from the repos root
 *
 * @returns {Object} - map[locale][stringKey] => {string}
 */
module.exports = function (mainRepo, locales, phetLibs, usedModules) {
  assert(locales.indexOf(ChipperConstants.FALLBACK_LOCALE) !== -1, 'fallback locale is required');

  /**
   * For a given locale, return an array of specific locales that we'll use as fallbacks, e.g.
   * 'zh_CN' => [ 'zh_CN', 'zh', 'en' ]
   * 'es' => [ 'es', 'en' ]
   * 'en' => [ 'en' ]
   *
   * @param {string} locale
   * @returns {Array.<string>}
   */
  const localeFallbacks = locale => {
    return [...(locale !== ChipperConstants.FALLBACK_LOCALE ? [locale] : []),
    // e.g. 'zh_CN'
    ...(locale.length > 2 && locale.slice(0, 2) !== ChipperConstants.FALLBACK_LOCALE ? [locale.slice(0, 2)] : []),
    // e.g. 'zh'
    ChipperConstants.FALLBACK_LOCALE // e.g. 'en'
    ];
  };

  // Load the file contents of every single JS module that used any strings
  const usedFileContents = usedModules.map(usedModule => fs.readFileSync(`../${usedModule}`, 'utf-8'));

  // Compute which repositories contain one more more used strings (since we'll need to load string files for those
  // repositories).
  let reposWithUsedStrings = [];
  usedFileContents.forEach(fileContent => {
    // [a-zA-Z_$][a-zA-Z0-9_$] ---- general JS identifiers, first character can't be a number
    // [^\n\r] ---- grab everything except for newlines here, so we get everything
    const allImportStatements = fileContent.match(/import [a-zA-Z_$][a-zA-Z0-9_$]*Strings from '[^\n\r]+Strings.js';/g);
    if (allImportStatements) {
      reposWithUsedStrings.push(...allImportStatements.map(importStatement => {
        // Grabs out the prefix before `Strings.js` (without the leading slash too)
        const importName = importStatement.match(/\/([\w-]+)Strings\.js/)[1];

        // kebab case the repo
        return _.kebabCase(importName);
      }));
    }
  });
  reposWithUsedStrings = _.uniq(reposWithUsedStrings).filter(repo => {
    return fs.existsSync(`../${repo}/package.json`);
  });

  // Compute a map of {repo:string} => {requirejsNamepsace:string}, so we can construct full string keys from strings
  // that would be accessing them, e.g. `JoistStrings.ResetAllButton.name` => `JOIST/ResetAllButton.name`.
  const requirejsNamespaceMap = {};
  reposWithUsedStrings.forEach(repo => {
    const packageObject = JSON.parse(fs.readFileSync(`../${repo}/package.json`, 'utf-8'));
    requirejsNamespaceMap[repo] = packageObject.phet.requirejsNamespace;
  });

  // Load all the required string files into memory, so we don't load them multiple times (for each usage)
  // maps [repositoryName][locale] => contents of locale string file
  const stringFilesContents = getStringFilesContents(reposWithUsedStrings, locales);

  // Initialize our full stringMap object (which will be filled with results and then returned as our string map).
  const stringMap = {};
  const stringMetadata = {};
  locales.forEach(locale => {
    stringMap[locale] = {};
  });

  // combine our strings into [locale][stringKey] map, using the fallback locale where necessary. In regards to nested
  // strings, this data structure doesn't nest. Instead it gets nested string values, and then sets them with the
  // flat key string like `"FRICTION/a11y.some.string.here": { value: 'My Some String' }`
  reposWithUsedStrings.forEach(repo => {
    // Scan all of the files with string module references, scanning for anything that looks like a string access for
    // our repo. This will include the string module reference, e.g. `JoistStrings.ResetAllButton.name`, but could also
    // include slightly more (since we're string parsing), e.g. `JoistStrings.ResetAllButton.name.length` would be
    // included, even though only part of that is a string access.
    let stringAccesses = [];
    const prefix = `${pascalCase(repo)}Strings`; // e.g. JoistStrings
    usedFileContents.forEach((fileContent, i) => {
      // Only scan files where we can identify an import for it
      if (fileContent.includes(`import ${prefix} from`)) {
        // Look for normal matches, e.g. `JoistStrings.` followed by one or more chunks like:
        // .somethingVaguely_alphaNum3r1c
        // [ 'aStringInBracketsBecauseOfSpecialCharacters' ]
        //
        // It will also then end on anything that doesn't look like another one of those chunks
        // [a-zA-Z_$][a-zA-Z0-9_$]* ---- this grabs things that looks like valid JS identifiers
        // \\[ '[^']+' \\])+ ---- this grabs things like our second case above
        // [^\\.\\[] ---- matches something at the end that is NOT either of those other two cases
        // It is also generalized to support arbitrary whitespace and requires that ' match ' or " match ", since
        // this must support JS code and minified TypeScript code
        // Matches one final character that is not '.' or '[', since any valid string accesses should NOT have that
        // after. NOTE: there are some degenerate cases that will break this, e.g.:
        // - JoistStrings.someStringProperty[ 0 ]
        // - JoistStrings.something[ 0 ]
        // - JoistStrings.something[ 'length' ]
        const matches = fileContent.match(new RegExp(`${prefix}(\\.[a-zA-Z_$][a-zA-Z0-9_$]*|\\[\\s*['"][^'"]+['"]\\s*\\])+[^\\.\\[]`, 'g'));
        if (matches) {
          stringAccesses.push(...matches.map(match => {
            return match
            // We always have to strip off the last character - it's a character that shouldn't be in a string access
            .slice(0, match.length - 1)
            // Handle JoistStrings[ 'some-thingStringProperty' ].value => JoistStrings[ 'some-thing' ]
            // -- Anything after StringProperty should go
            // away, but we need to add the final '] to maintain the format
            .replace(/StringProperty'].*/, '\']')
            // Handle JoistStrings.somethingStringProperty.value => JoistStrings.something
            .replace(/StringProperty.*/, '');
          }));
        }
      }
    });

    // Strip off our prefixes, so our stringAccesses will have things like `'ResetAllButton.name'` inside.
    stringAccesses = _.uniq(stringAccesses).map(str => str.slice(prefix.length));

    // The JS outputted by TS is minified and missing the whitespace
    const depth = 2;

    // Turn each string access into an array of parts, e.g. '.ResetAllButton.name' => [ 'ResetAllButton', 'name' ]
    // or '[ \'A\' ].B[ \'C\' ]' => [ 'A', 'B', 'C' ]
    // Regex grabs either `.identifier` or `[ 'text' ]`.
    const stringKeysByParts = stringAccesses.map(access => access.match(/\.[a-zA-Z_$][a-zA-Z0-9_$]*|\[\s*['"][^'"]+['"]\s*\]/g).map(token => {
      return token.startsWith('.') ? token.slice(1) : token.slice(depth, token.length - depth);
    }));

    // Concatenate the string parts for each access into something that looks like a partial string key, e.g.
    // [ 'ResetAllButton', 'name' ] => 'ResetAllButton.name'
    const partialStringKeys = _.uniq(stringKeysByParts.map(parts => parts.join('.'))).filter(key => key !== 'js');

    // For each string key and locale, we'll look up the string entry and fill it into the stringMap
    partialStringKeys.forEach(partialStringKey => {
      locales.forEach(locale => {
        let stringEntry = null;
        for (const fallbackLocale of localeFallbacks(locale)) {
          const stringFileContents = stringFilesContents[repo][fallbackLocale];
          if (stringFileContents) {
            stringEntry = ChipperStringUtils.getStringEntryFromMap(stringFileContents, partialStringKey);
            if (stringEntry) {
              break;
            }
          }
        }
        if (!partialStringKey.endsWith('StringProperty')) {
          assert(stringEntry !== null, `Missing string information for ${repo} ${partialStringKey}`);
          const stringKey = `${requirejsNamespaceMap[repo]}/${partialStringKey}`;
          stringMap[locale][stringKey] = stringEntry.value;
          if (stringEntry.metadata && locale === ChipperConstants.FALLBACK_LOCALE) {
            stringMetadata[stringKey] = stringEntry.metadata;
          }
        }
      });
    });
  });
  return {
    stringMap: stringMap,
    stringMetadata: stringMetadata
  };
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsImFzc2VydCIsIkNoaXBwZXJDb25zdGFudHMiLCJwYXNjYWxDYXNlIiwiQ2hpcHBlclN0cmluZ1V0aWxzIiwiZnMiLCJncnVudCIsImxvY2FsZUluZm8iLCJwYXRoIiwiZ2V0U3RyaW5nRmlsZXNDb250ZW50cyIsInJlcG9zV2l0aFVzZWRTdHJpbmdzIiwibG9jYWxlcyIsInN0cmluZ0ZpbGVzQ29udGVudHMiLCJmb3JFYWNoIiwicmVwbyIsImFkZExvY2FsZSIsImxvY2FsZSIsImlzUlRMIiwic3RyaW5nc0ZpbGVuYW1lIiwibm9ybWFsaXplIiwiRkFMTEJBQ0tfTE9DQUxFIiwiZmlsZUNvbnRlbnRzIiwiZmlsZSIsInJlYWRKU09OIiwiZXJyb3IiLCJsb2ciLCJkZWJ1ZyIsImZvcm1hdFN0cmluZ1ZhbHVlcyIsImRpcmVjdGlvbiIsImxlbmd0aCIsIm1pZGRsZUxvY2FsZSIsInNsaWNlIiwiaW5jbHVkZXMiLCJtb2R1bGUiLCJleHBvcnRzIiwibWFpblJlcG8iLCJwaGV0TGlicyIsInVzZWRNb2R1bGVzIiwiaW5kZXhPZiIsImxvY2FsZUZhbGxiYWNrcyIsInVzZWRGaWxlQ29udGVudHMiLCJtYXAiLCJ1c2VkTW9kdWxlIiwicmVhZEZpbGVTeW5jIiwiZmlsZUNvbnRlbnQiLCJhbGxJbXBvcnRTdGF0ZW1lbnRzIiwibWF0Y2giLCJwdXNoIiwiaW1wb3J0U3RhdGVtZW50IiwiaW1wb3J0TmFtZSIsImtlYmFiQ2FzZSIsInVuaXEiLCJmaWx0ZXIiLCJleGlzdHNTeW5jIiwicmVxdWlyZWpzTmFtZXNwYWNlTWFwIiwicGFja2FnZU9iamVjdCIsIkpTT04iLCJwYXJzZSIsInBoZXQiLCJyZXF1aXJlanNOYW1lc3BhY2UiLCJzdHJpbmdNYXAiLCJzdHJpbmdNZXRhZGF0YSIsInN0cmluZ0FjY2Vzc2VzIiwicHJlZml4IiwiaSIsIm1hdGNoZXMiLCJSZWdFeHAiLCJyZXBsYWNlIiwic3RyIiwiZGVwdGgiLCJzdHJpbmdLZXlzQnlQYXJ0cyIsImFjY2VzcyIsInRva2VuIiwic3RhcnRzV2l0aCIsInBhcnRpYWxTdHJpbmdLZXlzIiwicGFydHMiLCJqb2luIiwia2V5IiwicGFydGlhbFN0cmluZ0tleSIsInN0cmluZ0VudHJ5IiwiZmFsbGJhY2tMb2NhbGUiLCJzdHJpbmdGaWxlQ29udGVudHMiLCJnZXRTdHJpbmdFbnRyeUZyb21NYXAiLCJlbmRzV2l0aCIsInN0cmluZ0tleSIsInZhbHVlIiwibWV0YWRhdGEiXSwic291cmNlcyI6WyJnZXRTdHJpbmdNYXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmV0dXJucyBhIG1hcCBzdWNoIHRoYXQgbWFwW1wibG9jYWxlXCJdW1wiUkVQTy9zdHJpbmdLZXlcIl0gd2lsbCBiZSB0aGUgc3RyaW5nIHZhbHVlICh3aXRoIGZhbGxiYWNrcyB0byBFbmdsaXNoIHdoZXJlIG5lZWRlZCkuXHJcbiAqIExvYWRzIGVhY2ggc3RyaW5nIGZpbGUgb25seSBvbmNlLCBhbmQgb25seSBsb2FkcyB0aGUgcmVwb3NpdG9yeS9sb2NhbGUgY29tYmluYXRpb25zIG5lY2Vzc2FyeS5cclxuICovXHJcblxyXG5cclxuY29uc3QgXyA9IHJlcXVpcmUoICdsb2Rhc2gnICk7XHJcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoICdhc3NlcnQnICk7XHJcbmNvbnN0IENoaXBwZXJDb25zdGFudHMgPSByZXF1aXJlKCAnLi4vY29tbW9uL0NoaXBwZXJDb25zdGFudHMnICk7XHJcbmNvbnN0IHBhc2NhbENhc2UgPSByZXF1aXJlKCAnLi4vY29tbW9uL3Bhc2NhbENhc2UnICk7XHJcbmNvbnN0IENoaXBwZXJTdHJpbmdVdGlscyA9IHJlcXVpcmUoICcuLi9jb21tb24vQ2hpcHBlclN0cmluZ1V0aWxzJyApO1xyXG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcclxuY29uc3QgZ3J1bnQgPSByZXF1aXJlKCAnZ3J1bnQnICk7XHJcbmNvbnN0IGxvY2FsZUluZm8gPSByZXF1aXJlKCAnLi4vZGF0YS9sb2NhbGVJbmZvJyApOyAvLyBMb2NhbGUgaW5mb3JtYXRpb25cclxuY29uc3QgcGF0aCA9IHJlcXVpcmUoICdwYXRoJyApO1xyXG5cclxuLyoqXHJcbiAqIExvYWQgYWxsIHRoZSByZXF1aXJlZCBzdHJpbmcgZmlsZXMgaW50byBtZW1vcnksIHNvIHdlIGRvbid0IGxvYWQgdGhlbSBtdWx0aXBsZSB0aW1lcyAoZm9yIGVhY2ggdXNhZ2UpLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSByZXBvc1dpdGhVc2VkU3RyaW5ncyAtIEFsbCBvZiB0aGUgcmVwb3MgdGhhdCBoYXZlIDErIHVzZWQgc3RyaW5nc1xyXG4gKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBsb2NhbGVzIC0gQWxsIHN1cHBvcnRlZCBsb2NhbGVzIGZvciB0aGlzIGJ1aWxkXHJcbiAqIEByZXR1cm5zIHtPYmplY3R9IC0gbWFwcyB7bG9jYWxlOnN0cmluZ30gPT4gQW5vdGhlciBtYXAgd2l0aDoge3N0cmluZ0tleTpzdHJpbmd9ID0+IHtzdHJpbmdWYWx1ZTpzdHJpbmd9XHJcbiAqL1xyXG5jb25zdCBnZXRTdHJpbmdGaWxlc0NvbnRlbnRzID0gKCByZXBvc1dpdGhVc2VkU3RyaW5ncywgbG9jYWxlcyApID0+IHtcclxuICBjb25zdCBzdHJpbmdGaWxlc0NvbnRlbnRzID0ge307IC8vIG1hcHMgW3JlcG9zaXRvcnlOYW1lXVtsb2NhbGVdID0+IGNvbnRlbnRzIG9mIGxvY2FsZSBzdHJpbmcgZmlsZVxyXG5cclxuICByZXBvc1dpdGhVc2VkU3RyaW5ncy5mb3JFYWNoKCByZXBvID0+IHtcclxuICAgIHN0cmluZ0ZpbGVzQ29udGVudHNbIHJlcG8gXSA9IHt9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhIGxvY2FsZSBpbnRvIG91ciBzdHJpbmdGaWxlc0NvbnRlbnRzIG1hcC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbG9jYWxlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzUlRMXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IGFkZExvY2FsZSA9ICggbG9jYWxlLCBpc1JUTCApID0+IHtcclxuICAgICAgLy8gUmVhZCBvcHRpb25hbCBzdHJpbmcgZmlsZVxyXG4gICAgICBjb25zdCBzdHJpbmdzRmlsZW5hbWUgPSBwYXRoLm5vcm1hbGl6ZSggYC4uLyR7bG9jYWxlID09PSBDaGlwcGVyQ29uc3RhbnRzLkZBTExCQUNLX0xPQ0FMRSA/ICcnIDogJ2JhYmVsLyd9JHtyZXBvfS8ke3JlcG99LXN0cmluZ3NfJHtsb2NhbGV9Lmpzb25gICk7XHJcbiAgICAgIGxldCBmaWxlQ29udGVudHM7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgZmlsZUNvbnRlbnRzID0gZ3J1bnQuZmlsZS5yZWFkSlNPTiggc3RyaW5nc0ZpbGVuYW1lICk7XHJcbiAgICAgIH1cclxuICAgICAgY2F0Y2goIGVycm9yICkge1xyXG4gICAgICAgIGdydW50LmxvZy5kZWJ1ZyggYG1pc3Npbmcgc3RyaW5nIGZpbGU6ICR7c3RyaW5nc0ZpbGVuYW1lfWAgKTtcclxuICAgICAgICBmaWxlQ29udGVudHMgPSB7fTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRm9ybWF0IHRoZSBzdHJpbmcgdmFsdWVzXHJcbiAgICAgIENoaXBwZXJTdHJpbmdVdGlscy5mb3JtYXRTdHJpbmdWYWx1ZXMoIGZpbGVDb250ZW50cywgaXNSVEwgKTtcclxuXHJcbiAgICAgIHN0cmluZ0ZpbGVzQ29udGVudHNbIHJlcG8gXVsgbG9jYWxlIF0gPSBmaWxlQ29udGVudHM7XHJcbiAgICB9O1xyXG5cclxuICAgIGxvY2FsZXMuZm9yRWFjaCggbG9jYWxlID0+IHtcclxuICAgICAgYXNzZXJ0KCBsb2NhbGVJbmZvWyBsb2NhbGUgXSwgYHVuc3VwcG9ydGVkIGxvY2FsZTogJHtsb2NhbGV9YCApO1xyXG4gICAgICBjb25zdCBpc1JUTCA9IGxvY2FsZUluZm9bIGxvY2FsZSBdLmRpcmVjdGlvbiA9PT0gJ3J0bCc7XHJcblxyXG4gICAgICAvLyBIYW5kbGUgZmFsbGJhY2sgbG9jYWxlc1xyXG4gICAgICBhZGRMb2NhbGUoIGxvY2FsZSwgaXNSVEwgKTtcclxuICAgICAgaWYgKCBsb2NhbGUubGVuZ3RoID4gMiApIHtcclxuICAgICAgICBjb25zdCBtaWRkbGVMb2NhbGUgPSBsb2NhbGUuc2xpY2UoIDAsIDIgKTtcclxuICAgICAgICBpZiAoICFsb2NhbGVzLmluY2x1ZGVzKCBtaWRkbGVMb2NhbGUgKSApIHtcclxuICAgICAgICAgIGFkZExvY2FsZSggbWlkZGxlTG9jYWxlLCBpc1JUTCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH0gKTtcclxuXHJcbiAgcmV0dXJuIHN0cmluZ0ZpbGVzQ29udGVudHM7XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtzdHJpbmd9IG1haW5SZXBvXHJcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IGxvY2FsZXNcclxuICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gcGhldExpYnMgLSBVc2VkIHRvIGNoZWNrIGZvciBiYWQgc3RyaW5nIGRlcGVuZGVuY2llc1xyXG4gKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSB1c2VkTW9kdWxlcyAtIHJlbGF0aXZlIGZpbGUgcGF0aCBvZiB0aGUgbW9kdWxlIChmaWxlbmFtZSkgZnJvbSB0aGUgcmVwb3Mgcm9vdFxyXG4gKlxyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSAtIG1hcFtsb2NhbGVdW3N0cmluZ0tleV0gPT4ge3N0cmluZ31cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIG1haW5SZXBvLCBsb2NhbGVzLCBwaGV0TGlicywgdXNlZE1vZHVsZXMgKSB7XHJcblxyXG4gIGFzc2VydCggbG9jYWxlcy5pbmRleE9mKCBDaGlwcGVyQ29uc3RhbnRzLkZBTExCQUNLX0xPQ0FMRSApICE9PSAtMSwgJ2ZhbGxiYWNrIGxvY2FsZSBpcyByZXF1aXJlZCcgKTtcclxuXHJcbiAgLyoqXHJcbiAgICogRm9yIGEgZ2l2ZW4gbG9jYWxlLCByZXR1cm4gYW4gYXJyYXkgb2Ygc3BlY2lmaWMgbG9jYWxlcyB0aGF0IHdlJ2xsIHVzZSBhcyBmYWxsYmFja3MsIGUuZy5cclxuICAgKiAnemhfQ04nID0+IFsgJ3poX0NOJywgJ3poJywgJ2VuJyBdXHJcbiAgICogJ2VzJyA9PiBbICdlcycsICdlbicgXVxyXG4gICAqICdlbicgPT4gWyAnZW4nIF1cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBsb2NhbGVcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPHN0cmluZz59XHJcbiAgICovXHJcbiAgY29uc3QgbG9jYWxlRmFsbGJhY2tzID0gbG9jYWxlID0+IHtcclxuICAgIHJldHVybiBbXHJcbiAgICAgIC4uLiggbG9jYWxlICE9PSBDaGlwcGVyQ29uc3RhbnRzLkZBTExCQUNLX0xPQ0FMRSA/IFsgbG9jYWxlIF0gOiBbXSApLCAvLyBlLmcuICd6aF9DTidcclxuICAgICAgLi4uKCAoIGxvY2FsZS5sZW5ndGggPiAyICYmIGxvY2FsZS5zbGljZSggMCwgMiApICE9PSBDaGlwcGVyQ29uc3RhbnRzLkZBTExCQUNLX0xPQ0FMRSApID8gWyBsb2NhbGUuc2xpY2UoIDAsIDIgKSBdIDogW10gKSwgLy8gZS5nLiAnemgnXHJcbiAgICAgIENoaXBwZXJDb25zdGFudHMuRkFMTEJBQ0tfTE9DQUxFIC8vIGUuZy4gJ2VuJ1xyXG4gICAgXTtcclxuICB9O1xyXG5cclxuICAvLyBMb2FkIHRoZSBmaWxlIGNvbnRlbnRzIG9mIGV2ZXJ5IHNpbmdsZSBKUyBtb2R1bGUgdGhhdCB1c2VkIGFueSBzdHJpbmdzXHJcbiAgY29uc3QgdXNlZEZpbGVDb250ZW50cyA9IHVzZWRNb2R1bGVzLm1hcCggdXNlZE1vZHVsZSA9PiBmcy5yZWFkRmlsZVN5bmMoIGAuLi8ke3VzZWRNb2R1bGV9YCwgJ3V0Zi04JyApICk7XHJcblxyXG4gIC8vIENvbXB1dGUgd2hpY2ggcmVwb3NpdG9yaWVzIGNvbnRhaW4gb25lIG1vcmUgbW9yZSB1c2VkIHN0cmluZ3MgKHNpbmNlIHdlJ2xsIG5lZWQgdG8gbG9hZCBzdHJpbmcgZmlsZXMgZm9yIHRob3NlXHJcbiAgLy8gcmVwb3NpdG9yaWVzKS5cclxuICBsZXQgcmVwb3NXaXRoVXNlZFN0cmluZ3MgPSBbXTtcclxuICB1c2VkRmlsZUNvbnRlbnRzLmZvckVhY2goIGZpbGVDb250ZW50ID0+IHtcclxuICAgIC8vIFthLXpBLVpfJF1bYS16QS1aMC05XyRdIC0tLS0gZ2VuZXJhbCBKUyBpZGVudGlmaWVycywgZmlyc3QgY2hhcmFjdGVyIGNhbid0IGJlIGEgbnVtYmVyXHJcbiAgICAvLyBbXlxcblxccl0gLS0tLSBncmFiIGV2ZXJ5dGhpbmcgZXhjZXB0IGZvciBuZXdsaW5lcyBoZXJlLCBzbyB3ZSBnZXQgZXZlcnl0aGluZ1xyXG4gICAgY29uc3QgYWxsSW1wb3J0U3RhdGVtZW50cyA9IGZpbGVDb250ZW50Lm1hdGNoKCAvaW1wb3J0IFthLXpBLVpfJF1bYS16QS1aMC05XyRdKlN0cmluZ3MgZnJvbSAnW15cXG5cXHJdK1N0cmluZ3MuanMnOy9nICk7XHJcbiAgICBpZiAoIGFsbEltcG9ydFN0YXRlbWVudHMgKSB7XHJcbiAgICAgIHJlcG9zV2l0aFVzZWRTdHJpbmdzLnB1c2goIC4uLmFsbEltcG9ydFN0YXRlbWVudHMubWFwKCBpbXBvcnRTdGF0ZW1lbnQgPT4ge1xyXG4gICAgICAgIC8vIEdyYWJzIG91dCB0aGUgcHJlZml4IGJlZm9yZSBgU3RyaW5ncy5qc2AgKHdpdGhvdXQgdGhlIGxlYWRpbmcgc2xhc2ggdG9vKVxyXG4gICAgICAgIGNvbnN0IGltcG9ydE5hbWUgPSBpbXBvcnRTdGF0ZW1lbnQubWF0Y2goIC9cXC8oW1xcdy1dKylTdHJpbmdzXFwuanMvIClbIDEgXTtcclxuXHJcbiAgICAgICAgLy8ga2ViYWIgY2FzZSB0aGUgcmVwb1xyXG4gICAgICAgIHJldHVybiBfLmtlYmFiQ2FzZSggaW1wb3J0TmFtZSApO1xyXG4gICAgICB9ICkgKTtcclxuICAgIH1cclxuICB9ICk7XHJcbiAgcmVwb3NXaXRoVXNlZFN0cmluZ3MgPSBfLnVuaXEoIHJlcG9zV2l0aFVzZWRTdHJpbmdzICkuZmlsdGVyKCByZXBvID0+IHtcclxuICAgIHJldHVybiBmcy5leGlzdHNTeW5jKCBgLi4vJHtyZXBvfS9wYWNrYWdlLmpzb25gICk7XHJcbiAgfSApO1xyXG5cclxuICAvLyBDb21wdXRlIGEgbWFwIG9mIHtyZXBvOnN0cmluZ30gPT4ge3JlcXVpcmVqc05hbWVwc2FjZTpzdHJpbmd9LCBzbyB3ZSBjYW4gY29uc3RydWN0IGZ1bGwgc3RyaW5nIGtleXMgZnJvbSBzdHJpbmdzXHJcbiAgLy8gdGhhdCB3b3VsZCBiZSBhY2Nlc3NpbmcgdGhlbSwgZS5nLiBgSm9pc3RTdHJpbmdzLlJlc2V0QWxsQnV0dG9uLm5hbWVgID0+IGBKT0lTVC9SZXNldEFsbEJ1dHRvbi5uYW1lYC5cclxuICBjb25zdCByZXF1aXJlanNOYW1lc3BhY2VNYXAgPSB7fTtcclxuICByZXBvc1dpdGhVc2VkU3RyaW5ncy5mb3JFYWNoKCByZXBvID0+IHtcclxuICAgIGNvbnN0IHBhY2thZ2VPYmplY3QgPSBKU09OLnBhcnNlKCBmcy5yZWFkRmlsZVN5bmMoIGAuLi8ke3JlcG99L3BhY2thZ2UuanNvbmAsICd1dGYtOCcgKSApO1xyXG4gICAgcmVxdWlyZWpzTmFtZXNwYWNlTWFwWyByZXBvIF0gPSBwYWNrYWdlT2JqZWN0LnBoZXQucmVxdWlyZWpzTmFtZXNwYWNlO1xyXG4gIH0gKTtcclxuXHJcbiAgLy8gTG9hZCBhbGwgdGhlIHJlcXVpcmVkIHN0cmluZyBmaWxlcyBpbnRvIG1lbW9yeSwgc28gd2UgZG9uJ3QgbG9hZCB0aGVtIG11bHRpcGxlIHRpbWVzIChmb3IgZWFjaCB1c2FnZSlcclxuICAvLyBtYXBzIFtyZXBvc2l0b3J5TmFtZV1bbG9jYWxlXSA9PiBjb250ZW50cyBvZiBsb2NhbGUgc3RyaW5nIGZpbGVcclxuICBjb25zdCBzdHJpbmdGaWxlc0NvbnRlbnRzID0gZ2V0U3RyaW5nRmlsZXNDb250ZW50cyggcmVwb3NXaXRoVXNlZFN0cmluZ3MsIGxvY2FsZXMgKTtcclxuXHJcbiAgLy8gSW5pdGlhbGl6ZSBvdXIgZnVsbCBzdHJpbmdNYXAgb2JqZWN0ICh3aGljaCB3aWxsIGJlIGZpbGxlZCB3aXRoIHJlc3VsdHMgYW5kIHRoZW4gcmV0dXJuZWQgYXMgb3VyIHN0cmluZyBtYXApLlxyXG4gIGNvbnN0IHN0cmluZ01hcCA9IHt9O1xyXG4gIGNvbnN0IHN0cmluZ01ldGFkYXRhID0ge307XHJcbiAgbG9jYWxlcy5mb3JFYWNoKCBsb2NhbGUgPT4ge1xyXG4gICAgc3RyaW5nTWFwWyBsb2NhbGUgXSA9IHt9O1xyXG4gIH0gKTtcclxuXHJcbiAgLy8gY29tYmluZSBvdXIgc3RyaW5ncyBpbnRvIFtsb2NhbGVdW3N0cmluZ0tleV0gbWFwLCB1c2luZyB0aGUgZmFsbGJhY2sgbG9jYWxlIHdoZXJlIG5lY2Vzc2FyeS4gSW4gcmVnYXJkcyB0byBuZXN0ZWRcclxuICAvLyBzdHJpbmdzLCB0aGlzIGRhdGEgc3RydWN0dXJlIGRvZXNuJ3QgbmVzdC4gSW5zdGVhZCBpdCBnZXRzIG5lc3RlZCBzdHJpbmcgdmFsdWVzLCBhbmQgdGhlbiBzZXRzIHRoZW0gd2l0aCB0aGVcclxuICAvLyBmbGF0IGtleSBzdHJpbmcgbGlrZSBgXCJGUklDVElPTi9hMTF5LnNvbWUuc3RyaW5nLmhlcmVcIjogeyB2YWx1ZTogJ015IFNvbWUgU3RyaW5nJyB9YFxyXG4gIHJlcG9zV2l0aFVzZWRTdHJpbmdzLmZvckVhY2goIHJlcG8gPT4ge1xyXG5cclxuICAgIC8vIFNjYW4gYWxsIG9mIHRoZSBmaWxlcyB3aXRoIHN0cmluZyBtb2R1bGUgcmVmZXJlbmNlcywgc2Nhbm5pbmcgZm9yIGFueXRoaW5nIHRoYXQgbG9va3MgbGlrZSBhIHN0cmluZyBhY2Nlc3MgZm9yXHJcbiAgICAvLyBvdXIgcmVwby4gVGhpcyB3aWxsIGluY2x1ZGUgdGhlIHN0cmluZyBtb2R1bGUgcmVmZXJlbmNlLCBlLmcuIGBKb2lzdFN0cmluZ3MuUmVzZXRBbGxCdXR0b24ubmFtZWAsIGJ1dCBjb3VsZCBhbHNvXHJcbiAgICAvLyBpbmNsdWRlIHNsaWdodGx5IG1vcmUgKHNpbmNlIHdlJ3JlIHN0cmluZyBwYXJzaW5nKSwgZS5nLiBgSm9pc3RTdHJpbmdzLlJlc2V0QWxsQnV0dG9uLm5hbWUubGVuZ3RoYCB3b3VsZCBiZVxyXG4gICAgLy8gaW5jbHVkZWQsIGV2ZW4gdGhvdWdoIG9ubHkgcGFydCBvZiB0aGF0IGlzIGEgc3RyaW5nIGFjY2Vzcy5cclxuICAgIGxldCBzdHJpbmdBY2Nlc3NlcyA9IFtdO1xyXG5cclxuICAgIGNvbnN0IHByZWZpeCA9IGAke3Bhc2NhbENhc2UoIHJlcG8gKX1TdHJpbmdzYDsgLy8gZS5nLiBKb2lzdFN0cmluZ3NcclxuICAgIHVzZWRGaWxlQ29udGVudHMuZm9yRWFjaCggKCBmaWxlQ29udGVudCwgaSApID0+IHtcclxuICAgICAgLy8gT25seSBzY2FuIGZpbGVzIHdoZXJlIHdlIGNhbiBpZGVudGlmeSBhbiBpbXBvcnQgZm9yIGl0XHJcbiAgICAgIGlmICggZmlsZUNvbnRlbnQuaW5jbHVkZXMoIGBpbXBvcnQgJHtwcmVmaXh9IGZyb21gICkgKSB7XHJcblxyXG4gICAgICAgIC8vIExvb2sgZm9yIG5vcm1hbCBtYXRjaGVzLCBlLmcuIGBKb2lzdFN0cmluZ3MuYCBmb2xsb3dlZCBieSBvbmUgb3IgbW9yZSBjaHVua3MgbGlrZTpcclxuICAgICAgICAvLyAuc29tZXRoaW5nVmFndWVseV9hbHBoYU51bTNyMWNcclxuICAgICAgICAvLyBbICdhU3RyaW5nSW5CcmFja2V0c0JlY2F1c2VPZlNwZWNpYWxDaGFyYWN0ZXJzJyBdXHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyBJdCB3aWxsIGFsc28gdGhlbiBlbmQgb24gYW55dGhpbmcgdGhhdCBkb2Vzbid0IGxvb2sgbGlrZSBhbm90aGVyIG9uZSBvZiB0aG9zZSBjaHVua3NcclxuICAgICAgICAvLyBbYS16QS1aXyRdW2EtekEtWjAtOV8kXSogLS0tLSB0aGlzIGdyYWJzIHRoaW5ncyB0aGF0IGxvb2tzIGxpa2UgdmFsaWQgSlMgaWRlbnRpZmllcnNcclxuICAgICAgICAvLyBcXFxcWyAnW14nXSsnIFxcXFxdKSsgLS0tLSB0aGlzIGdyYWJzIHRoaW5ncyBsaWtlIG91ciBzZWNvbmQgY2FzZSBhYm92ZVxyXG4gICAgICAgIC8vIFteXFxcXC5cXFxcW10gLS0tLSBtYXRjaGVzIHNvbWV0aGluZyBhdCB0aGUgZW5kIHRoYXQgaXMgTk9UIGVpdGhlciBvZiB0aG9zZSBvdGhlciB0d28gY2FzZXNcclxuICAgICAgICAvLyBJdCBpcyBhbHNvIGdlbmVyYWxpemVkIHRvIHN1cHBvcnQgYXJiaXRyYXJ5IHdoaXRlc3BhY2UgYW5kIHJlcXVpcmVzIHRoYXQgJyBtYXRjaCAnIG9yIFwiIG1hdGNoIFwiLCBzaW5jZVxyXG4gICAgICAgIC8vIHRoaXMgbXVzdCBzdXBwb3J0IEpTIGNvZGUgYW5kIG1pbmlmaWVkIFR5cGVTY3JpcHQgY29kZVxyXG4gICAgICAgIC8vIE1hdGNoZXMgb25lIGZpbmFsIGNoYXJhY3RlciB0aGF0IGlzIG5vdCAnLicgb3IgJ1snLCBzaW5jZSBhbnkgdmFsaWQgc3RyaW5nIGFjY2Vzc2VzIHNob3VsZCBOT1QgaGF2ZSB0aGF0XHJcbiAgICAgICAgLy8gYWZ0ZXIuIE5PVEU6IHRoZXJlIGFyZSBzb21lIGRlZ2VuZXJhdGUgY2FzZXMgdGhhdCB3aWxsIGJyZWFrIHRoaXMsIGUuZy46XHJcbiAgICAgICAgLy8gLSBKb2lzdFN0cmluZ3Muc29tZVN0cmluZ1Byb3BlcnR5WyAwIF1cclxuICAgICAgICAvLyAtIEpvaXN0U3RyaW5ncy5zb21ldGhpbmdbIDAgXVxyXG4gICAgICAgIC8vIC0gSm9pc3RTdHJpbmdzLnNvbWV0aGluZ1sgJ2xlbmd0aCcgXVxyXG4gICAgICAgIGNvbnN0IG1hdGNoZXMgPSBmaWxlQ29udGVudC5tYXRjaCggbmV3IFJlZ0V4cCggYCR7cHJlZml4fShcXFxcLlthLXpBLVpfJF1bYS16QS1aMC05XyRdKnxcXFxcW1xcXFxzKlsnXCJdW14nXCJdK1snXCJdXFxcXHMqXFxcXF0pK1teXFxcXC5cXFxcW11gLCAnZycgKSApO1xyXG4gICAgICAgIGlmICggbWF0Y2hlcyApIHtcclxuICAgICAgICAgIHN0cmluZ0FjY2Vzc2VzLnB1c2goIC4uLm1hdGNoZXMubWFwKCBtYXRjaCA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBtYXRjaFxyXG4gICAgICAgICAgICAgIC8vIFdlIGFsd2F5cyBoYXZlIHRvIHN0cmlwIG9mZiB0aGUgbGFzdCBjaGFyYWN0ZXIgLSBpdCdzIGEgY2hhcmFjdGVyIHRoYXQgc2hvdWxkbid0IGJlIGluIGEgc3RyaW5nIGFjY2Vzc1xyXG4gICAgICAgICAgICAgIC5zbGljZSggMCwgbWF0Y2gubGVuZ3RoIC0gMSApXHJcbiAgICAgICAgICAgICAgLy8gSGFuZGxlIEpvaXN0U3RyaW5nc1sgJ3NvbWUtdGhpbmdTdHJpbmdQcm9wZXJ0eScgXS52YWx1ZSA9PiBKb2lzdFN0cmluZ3NbICdzb21lLXRoaW5nJyBdXHJcbiAgICAgICAgICAgICAgLy8gLS0gQW55dGhpbmcgYWZ0ZXIgU3RyaW5nUHJvcGVydHkgc2hvdWxkIGdvXHJcbiAgICAgICAgICAgICAgLy8gYXdheSwgYnV0IHdlIG5lZWQgdG8gYWRkIHRoZSBmaW5hbCAnXSB0byBtYWludGFpbiB0aGUgZm9ybWF0XHJcbiAgICAgICAgICAgICAgLnJlcGxhY2UoIC9TdHJpbmdQcm9wZXJ0eSddLiovLCAnXFwnXScgKVxyXG4gICAgICAgICAgICAgIC8vIEhhbmRsZSBKb2lzdFN0cmluZ3Muc29tZXRoaW5nU3RyaW5nUHJvcGVydHkudmFsdWUgPT4gSm9pc3RTdHJpbmdzLnNvbWV0aGluZ1xyXG4gICAgICAgICAgICAgIC5yZXBsYWNlKCAvU3RyaW5nUHJvcGVydHkuKi8sICcnICk7XHJcbiAgICAgICAgICB9ICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTdHJpcCBvZmYgb3VyIHByZWZpeGVzLCBzbyBvdXIgc3RyaW5nQWNjZXNzZXMgd2lsbCBoYXZlIHRoaW5ncyBsaWtlIGAnUmVzZXRBbGxCdXR0b24ubmFtZSdgIGluc2lkZS5cclxuICAgIHN0cmluZ0FjY2Vzc2VzID0gXy51bmlxKCBzdHJpbmdBY2Nlc3NlcyApLm1hcCggc3RyID0+IHN0ci5zbGljZSggcHJlZml4Lmxlbmd0aCApICk7XHJcblxyXG4gICAgLy8gVGhlIEpTIG91dHB1dHRlZCBieSBUUyBpcyBtaW5pZmllZCBhbmQgbWlzc2luZyB0aGUgd2hpdGVzcGFjZVxyXG4gICAgY29uc3QgZGVwdGggPSAyO1xyXG5cclxuICAgIC8vIFR1cm4gZWFjaCBzdHJpbmcgYWNjZXNzIGludG8gYW4gYXJyYXkgb2YgcGFydHMsIGUuZy4gJy5SZXNldEFsbEJ1dHRvbi5uYW1lJyA9PiBbICdSZXNldEFsbEJ1dHRvbicsICduYW1lJyBdXHJcbiAgICAvLyBvciAnWyBcXCdBXFwnIF0uQlsgXFwnQ1xcJyBdJyA9PiBbICdBJywgJ0InLCAnQycgXVxyXG4gICAgLy8gUmVnZXggZ3JhYnMgZWl0aGVyIGAuaWRlbnRpZmllcmAgb3IgYFsgJ3RleHQnIF1gLlxyXG4gICAgY29uc3Qgc3RyaW5nS2V5c0J5UGFydHMgPSBzdHJpbmdBY2Nlc3Nlcy5tYXAoIGFjY2VzcyA9PiBhY2Nlc3MubWF0Y2goIC9cXC5bYS16QS1aXyRdW2EtekEtWjAtOV8kXSp8XFxbXFxzKlsnXCJdW14nXCJdK1snXCJdXFxzKlxcXS9nICkubWFwKCB0b2tlbiA9PiB7XHJcbiAgICAgIHJldHVybiB0b2tlbi5zdGFydHNXaXRoKCAnLicgKSA/IHRva2VuLnNsaWNlKCAxICkgOiB0b2tlbi5zbGljZSggZGVwdGgsIHRva2VuLmxlbmd0aCAtIGRlcHRoICk7XHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBDb25jYXRlbmF0ZSB0aGUgc3RyaW5nIHBhcnRzIGZvciBlYWNoIGFjY2VzcyBpbnRvIHNvbWV0aGluZyB0aGF0IGxvb2tzIGxpa2UgYSBwYXJ0aWFsIHN0cmluZyBrZXksIGUuZy5cclxuICAgIC8vIFsgJ1Jlc2V0QWxsQnV0dG9uJywgJ25hbWUnIF0gPT4gJ1Jlc2V0QWxsQnV0dG9uLm5hbWUnXHJcbiAgICBjb25zdCBwYXJ0aWFsU3RyaW5nS2V5cyA9IF8udW5pcSggc3RyaW5nS2V5c0J5UGFydHMubWFwKCBwYXJ0cyA9PiBwYXJ0cy5qb2luKCAnLicgKSApICkuZmlsdGVyKCBrZXkgPT4ga2V5ICE9PSAnanMnICk7XHJcblxyXG4gICAgLy8gRm9yIGVhY2ggc3RyaW5nIGtleSBhbmQgbG9jYWxlLCB3ZSdsbCBsb29rIHVwIHRoZSBzdHJpbmcgZW50cnkgYW5kIGZpbGwgaXQgaW50byB0aGUgc3RyaW5nTWFwXHJcbiAgICBwYXJ0aWFsU3RyaW5nS2V5cy5mb3JFYWNoKCBwYXJ0aWFsU3RyaW5nS2V5ID0+IHtcclxuICAgICAgbG9jYWxlcy5mb3JFYWNoKCBsb2NhbGUgPT4ge1xyXG4gICAgICAgIGxldCBzdHJpbmdFbnRyeSA9IG51bGw7XHJcbiAgICAgICAgZm9yICggY29uc3QgZmFsbGJhY2tMb2NhbGUgb2YgbG9jYWxlRmFsbGJhY2tzKCBsb2NhbGUgKSApIHtcclxuICAgICAgICAgIGNvbnN0IHN0cmluZ0ZpbGVDb250ZW50cyA9IHN0cmluZ0ZpbGVzQ29udGVudHNbIHJlcG8gXVsgZmFsbGJhY2tMb2NhbGUgXTtcclxuICAgICAgICAgIGlmICggc3RyaW5nRmlsZUNvbnRlbnRzICkge1xyXG4gICAgICAgICAgICBzdHJpbmdFbnRyeSA9IENoaXBwZXJTdHJpbmdVdGlscy5nZXRTdHJpbmdFbnRyeUZyb21NYXAoIHN0cmluZ0ZpbGVDb250ZW50cywgcGFydGlhbFN0cmluZ0tleSApO1xyXG4gICAgICAgICAgICBpZiAoIHN0cmluZ0VudHJ5ICkge1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggIXBhcnRpYWxTdHJpbmdLZXkuZW5kc1dpdGgoICdTdHJpbmdQcm9wZXJ0eScgKSApIHtcclxuICAgICAgICAgIGFzc2VydCggc3RyaW5nRW50cnkgIT09IG51bGwsIGBNaXNzaW5nIHN0cmluZyBpbmZvcm1hdGlvbiBmb3IgJHtyZXBvfSAke3BhcnRpYWxTdHJpbmdLZXl9YCApO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHN0cmluZ0tleSA9IGAke3JlcXVpcmVqc05hbWVzcGFjZU1hcFsgcmVwbyBdfS8ke3BhcnRpYWxTdHJpbmdLZXl9YDtcclxuICAgICAgICAgIHN0cmluZ01hcFsgbG9jYWxlIF1bIHN0cmluZ0tleSBdID0gc3RyaW5nRW50cnkudmFsdWU7XHJcbiAgICAgICAgICBpZiAoIHN0cmluZ0VudHJ5Lm1ldGFkYXRhICYmIGxvY2FsZSA9PT0gQ2hpcHBlckNvbnN0YW50cy5GQUxMQkFDS19MT0NBTEUgKSB7XHJcbiAgICAgICAgICAgIHN0cmluZ01ldGFkYXRhWyBzdHJpbmdLZXkgXSA9IHN0cmluZ0VudHJ5Lm1ldGFkYXRhO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG4gIH0gKTtcclxuXHJcbiAgcmV0dXJuIHsgc3RyaW5nTWFwOiBzdHJpbmdNYXAsIHN0cmluZ01ldGFkYXRhOiBzdHJpbmdNZXRhZGF0YSB9O1xyXG59OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsTUFBTUEsQ0FBQyxHQUFHQyxPQUFPLENBQUUsUUFBUyxDQUFDO0FBQzdCLE1BQU1DLE1BQU0sR0FBR0QsT0FBTyxDQUFFLFFBQVMsQ0FBQztBQUNsQyxNQUFNRSxnQkFBZ0IsR0FBR0YsT0FBTyxDQUFFLDRCQUE2QixDQUFDO0FBQ2hFLE1BQU1HLFVBQVUsR0FBR0gsT0FBTyxDQUFFLHNCQUF1QixDQUFDO0FBQ3BELE1BQU1JLGtCQUFrQixHQUFHSixPQUFPLENBQUUsOEJBQStCLENBQUM7QUFDcEUsTUFBTUssRUFBRSxHQUFHTCxPQUFPLENBQUUsSUFBSyxDQUFDO0FBQzFCLE1B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