// Copyright 2016-2022, University of Colorado Boulder

/**
 * Query String parser that supports type coercion, defaults, error checking, etc. based on a schema.
 * See QueryStringMachine.get for the description of a schema.
 *
 * Implemented as a UMD (Universal Module Definition) so that it's capable of working everywhere.
 * See https://github.com/umdjs/umd/blob/master/templates/returnExports.js
 *
 * See TYPES for a description of the schema types and their properties.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
(function (root, factory) {
  if (typeof window.define === 'function' && window.define.amd) {
    // AMD. Register as an anonymous module.
    window.define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.QueryStringMachine = factory();
  }
})(this, () => {
  // Default string that splits array strings
  const DEFAULT_SEPARATOR = ',';

  // If a query parameter has private:true in its schema, it must pass this predicate to be read from the URL.
  // See https://github.com/phetsims/chipper/issues/743
  const privatePredicate = () => {
    // Trying to access localStorage may fail with a SecurityError if cookies are blocked in a certain way.
    // See https://github.com/phetsims/qa/issues/329 for more information.
    try {
      return localStorage.getItem('phetTeamMember') === 'true';
    } catch (e) {
      return false;
    }
  };

  /**
   * Valid parameter strings begin with ? or are the empty string.  This is used for assertions in some cases and for
   * throwing Errors in other cases.
   * @param {string} string
   * @returns {boolean}
   */
  const isParameterString = string => string.length === 0 || string.indexOf('?') === 0;

  // Just return a value to define the module export.
  // This example returns an object, but the module
  // can return a function as the exported value.
  return function () {
    /**
     * In order to support graceful failures for user-supplied values, we fall back to default values when public: true
     * is specified.  If the schema entry is public: false, then a queryStringMachineAssert is thrown.
     * @param {boolean} predicate
     * @param {string} key
     * @param {Object} value - value of the parsed type, or, if parsing failed, the {string} that would not parse
     * @param {Object} schema
     * @param {string} message
     * @returns {Object}
     */
    const getValidValue = (predicate, key, value, schema, message) => {
      if (!predicate) {
        if (schema.public) {
          QueryStringMachine.addWarning(key, value, message);
          if (schema.hasOwnProperty('defaultValue')) {
            value = schema.defaultValue;
          } else {
            const typeSchema = TYPES[schema.type];
            queryStringMachineAssert(typeSchema.hasOwnProperty('defaultValue'), 'Type must have a default value if the provided schema does not have one.');
            value = typeSchema.defaultValue;
          }
        } else {
          queryStringMachineAssert(predicate, message);
        }
      }
      return value;
    };

    /**
     * Query String Machine is a query string parser that supports type coercion, default values & validation. Please
     * visit PhET's <a href="https://github.com/phetsims/query-string-machine" target="_blank">query-string-machine</a>
     * repository for documentation and examples.
     */
    const QueryStringMachine = {
      // @public (read-only) {{key:string, value:{*}, message:string}[]} - cleared by some tests in QueryStringMachineTests.js
      // See QueryStringMachine.addWarning for a description of these fields, and to add warnings.
      warnings: [],
      /**
       * Gets the value for a single query parameter.
       *
       * @param {string} key - the query parameter name
       * @param {Object} schema
       * @returns {*} query parameter value, converted to the proper type
       * @public
       */
      get: function (key, schema) {
        return this.getForString(key, schema, window.location.search);
      },
      /**
       * Gets values for every query parameter, using the specified schema map.
       *
       * @param {Object} schemaMap - see QueryStringMachine.getAllForString
       * @returns {Object} - see QueryStringMachine.getAllForString
       * @public
       */
      getAll: function (schemaMap) {
        return this.getAllForString(schemaMap, window.location.search);
      },
      /**
       * Like `get` but for an arbitrary parameter string.
       *
       * @param {string} key - the query parameter name
       * @param {Object} schema - see QueryStringMachine.get
       * @param {string} string - the parameters string.  Must begin with '?' or be the empty string
       * @returns {*} query parameter value, converted to the proper type
       * @public
       */
      getForString: function (key, schema, string) {
        if (!isParameterString(string)) {
          throw new Error(`Query strings should be either the empty string or start with a "?": ${string}`);
        }

        // Ignore URL values for private query parameters that fail privatePredicate.
        // See https://github.com/phetsims/chipper/issues/743.
        const values = schema.private && !privatePredicate() ? [] : getValues(key, string);
        validateSchema(key, schema);
        let value = parseValues(key, schema, values);
        if (schema.hasOwnProperty('validValues')) {
          value = getValidValue(isValidValue(value, schema.validValues), key, value, schema, `Invalid value supplied for key "${key}": ${value} is not a member of valid values: ${schema.validValues.join(', ')}`);
        }

        // isValidValue evaluates to true
        else if (schema.hasOwnProperty('isValidValue')) {
          value = getValidValue(schema.isValidValue(value), key, value, schema, `Invalid value supplied for key "${key}": ${value}`);
        }
        let valueValid = TYPES[schema.type].isValidValue(value);

        // support custom validation for elementSchema for arrays
        if (schema.type === 'array' && Array.isArray(value)) {
          let elementsValid = true;
          for (let i = 0; i < value.length; i++) {
            const element = value[i];
            if (!TYPES[schema.elementSchema.type].isValidValue(element)) {
              elementsValid = false;
              break;
            }
            if (schema.elementSchema.hasOwnProperty('isValidValue') && !schema.elementSchema.isValidValue(element)) {
              elementsValid = false;
              break;
            }
            if (schema.elementSchema.hasOwnProperty('validValues') && !isValidValue(element, schema.elementSchema.validValues)) {
              elementsValid = false;
              break;
            }
          }
          valueValid = valueValid && elementsValid;
        }

        // dispatch further validation to a type-specific function
        value = getValidValue(valueValid, key, value, schema, `Invalid value for type, key: ${key}`);
        return value;
      },
      /**
       * Like `getAll` but for an arbitrary parameters string.
       * @param {Object} schemaMap - key/value pairs, key is query parameter name and value is a schema
       * @param {string} string - the parameters string
       * @returns {Object} - key/value pairs holding the parsed results
       * @public
       */
      getAllForString: function (schemaMap, string) {
        const result = {};
        for (const key in schemaMap) {
          if (schemaMap.hasOwnProperty(key)) {
            result[key] = this.getForString(key, schemaMap[key], string);
          }
        }
        return result;
      },
      /**
       * Returns true if the window.location.search contains the given key
       * @param {string} key
       * @returns {boolean} true if the window.location.search contains the given key
       * @public
       */
      containsKey: function (key) {
        return this.containsKeyForString(key, window.location.search);
      },
      /**
       * Returns true if the given string contains the specified key
       * @param {string} key - the key to check for
       * @param {string} string - the query string to search. Must begin with '?' or be the empty string
       * @returns {boolean} true if the given string contains the given key
       * @public
       */
      containsKeyForString: function (key, string) {
        if (!isParameterString(string)) {
          throw new Error(`Query strings should be either the empty string or start with a "?": ${string}`);
        }
        const values = getValues(key, string);
        return values.length > 0;
      },
      /**
       * Returns true if the objects are equal.  Exported on the QueryStringMachine for testing.  Only works for
       * arrays objects that contain primitives (i.e. terminals are compared with ===)
       * @param {Object} a - an object to compare
       * @param {Object} b - an object to compare
       * @private - however, it is called from QueryStringMachineTests
       */
      deepEquals: function (a, b) {
        if (typeof a !== typeof b) {
          return false;
        }
        if (typeof a === 'string' || typeof a === 'number' || typeof a === 'boolean') {
          return a === b;
        }
        if (a === null && b === null) {
          return true;
        }
        if (a === undefined && b === undefined) {
          return true;
        }
        if (a === null && b === undefined) {
          return false;
        }
        if (a === undefined && b === null) {
          return false;
        }
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) {
          return false;
        } else if (aKeys.length === 0) {
          return a === b;
        } else {
          for (let i = 0; i < aKeys.length; i++) {
            if (aKeys[i] !== bKeys[i]) {
              return false;
            }
            const aChild = a[aKeys[i]];
            const bChild = b[aKeys[i]];
            if (!QueryStringMachine.deepEquals(aChild, bChild)) {
              return false;
            }
          }
          return true;
        }
      },
      /**
       * Returns a new URL but without the key-value pair.
       *
       * @param {string} queryString - tail of a URL including the beginning '?' (if any)
       * @param {string} key
       * @public
       */
      removeKeyValuePair: function (queryString, key) {
        assert && assert(typeof queryString === 'string', `url should be string, but it was: ${typeof queryString}`);
        assert && assert(typeof key === 'string', `url should be string, but it was: ${typeof key}`);
        assert && assert(isParameterString(queryString), 'queryString should be length 0 or begin with ?');
        assert && assert(key.length > 0, 'url should be a string with length > 0');
        if (queryString.indexOf('?') === 0) {
          const newParameters = [];
          const query = queryString.substring(1);
          const elements = query.split('&');
          for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const keyAndMaybeValue = element.split('=');
            const elementKey = decodeURIComponent(keyAndMaybeValue[0]);
            if (elementKey !== key) {
              newParameters.push(element);
            }
          }
          if (newParameters.length > 0) {
            return `?${newParameters.join('&')}`;
          } else {
            return '';
          }
        } else {
          return queryString;
        }
      },
      /**
       * Remove all the keys from the queryString (ok if they do not appear at all)
       * @param {string} queryString
       * @param {string[]} keys
       * @returns {string}
       * @public
       */
      removeKeyValuePairs: function (queryString, keys) {
        for (let i = 0; i < keys.length; i++) {
          queryString = this.removeKeyValuePair(queryString, keys[i]);
        }
        return queryString;
      },
      /**
       * Appends a query string to a given url.
       * @param {string} url - may or may not already have other query parameters
       * @param {string} queryParameters - may start with '', '?' or '&'
       * @returns {string}
       * @public
       * @static
       *
       * @example
       * // Limit to the second screen
       * simURL = QueryStringMachine.appendQueryString( simURL, 'screens=2' );
       */
      appendQueryString: function (url, queryParameters) {
        if (queryParameters.indexOf('?') === 0 || queryParameters.indexOf('&') === 0) {
          queryParameters = queryParameters.substring(1);
        }
        if (queryParameters.length === 0) {
          return url;
        }
        const combination = url.indexOf('?') >= 0 ? '&' : '?';
        return url + combination + queryParameters;
      },
      /**
       * Helper function for multiple query strings
       * @param {string} url - may or may not already have other query parameters
       * @param {Array.<string>} queryStringArray - each item may start with '', '?', or '&'
       * @returns {string}
       * @public
       * @static
       *
       * @example
       * sourceFrame.src = QueryStringMachine.appendQueryStringArray( simURL, [ 'screens=2', 'frameTitle=source' ] );
       */
      appendQueryStringArray: function (url, queryStringArray) {
        for (let i = 0; i < queryStringArray.length; i++) {
          url = this.appendQueryString(url, queryStringArray[i]);
        }
        return url;
      },
      /**
       * Returns the query string at the end of a url, or '?' if there is none.
       * @param {string} url
       * @returns {string}
       * @public
       */
      getQueryString: function (url) {
        const index = url.indexOf('?');
        if (index >= 0) {
          return url.substring(index);
        } else {
          return '?';
        }
      },
      /**
       * Adds a warning to the console and QueryStringMachine.warnings to indicate that the provided invalid value will
       * not be used.
       *
       * @param {string} key - the query parameter name
       * @param {Object} value - type depends on schema type
       * @param {string} message - the message that indicates the problem with the value
       * @public
       */
      addWarning: function (key, value, message) {
        console.warn(message);
        this.warnings.push({
          key: key,
          value: value,
          message: message
        });
      },
      /**
       * Determines if there is a warning for a specified key.
       * @param {string} key
       * @returns {boolean}
       * @public
       */
      hasWarning: function (key) {
        let hasWarning = false;
        for (let i = 0; i < this.warnings.length && !hasWarning; i++) {
          hasWarning = this.warnings[i].key === key;
        }
        return hasWarning;
      },
      /**
       * @param {string} queryString - tail of a URL including the beginning '?' (if any)
       * @returns {string[]} - the split up still-URI-encoded parameters (with values if present)
       * @public
       */
      getQueryParametersFromString: function (queryString) {
        if (queryString.indexOf('?') === 0) {
          const query = queryString.substring(1);
          return query.split('&');
        }
        return [];
      },
      /**
       * @param {string} key - the query parameter key to return if present
       * @param {string} string - a URL including a "?" if it has a query string
       * @returns {string|null} - the query parameter as it appears in the URL, like `key=VALUE`, or null if not present
       * @public
       */
      getSingleQueryParameterString: function (key, string) {
        const queryString = this.getQueryString(string);
        const queryParameters = this.getQueryParametersFromString(queryString);
        for (let i = 0; i < queryParameters.length; i++) {
          const queryParameter = queryParameters[i];
          const keyAndMaybeValue = queryParameter.split('=');
          if (decodeURIComponent(keyAndMaybeValue[0]) === key) {
            return queryParameter;
          }
        }
        return null;
      }
    };

    /**
     * Query strings may show the same key appearing multiple times, such as ?value=2&value=3.
     * This method recovers all of the string values.  For this example, it would be ['2','3'].
     *
     * @param {string} key - the key for which we are finding values.
     * @param {string} string - the parameters string
     * @returns {Array.<string|null>} - the resulting values, null indicates the query parameter is present with no value
     */
    const getValues = function (key, string) {
      const values = [];
      const params = string.slice(1).split('&');
      for (let i = 0; i < params.length; i++) {
        const splitByEquals = params[i].split('=');
        const name = splitByEquals[0];
        const value = splitByEquals.slice(1).join('='); // Support arbitrary number of '=' in the value
        if (name === key) {
          if (value) {
            values.push(decodeURIComponent(value));
          } else {
            values.push(null); // no value provided
          }
        }
      }

      return values;
    };

    // Schema validation ===============================================================================================

    /**
     * Validates the schema for a query parameter.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     */
    const validateSchema = function (key, schema) {
      // type is required
      queryStringMachineAssert(schema.hasOwnProperty('type'), `type field is required for key: ${key}`);

      // type is valid
      queryStringMachineAssert(TYPES.hasOwnProperty(schema.type), `invalid type: ${schema.type} for key: ${key}`);

      // parse is a function
      if (schema.hasOwnProperty('parse')) {
        queryStringMachineAssert(typeof schema.parse === 'function', `parse must be a function for key: ${key}`);
      }

      // validValues and isValidValue are optional and mutually exclusive
      queryStringMachineAssert(!(schema.hasOwnProperty('validValues') && schema.hasOwnProperty('isValidValue')), schema, key, `validValues and isValidValue are mutually exclusive for key: ${key}`);

      // validValues is an Array
      if (schema.hasOwnProperty('validValues')) {
        queryStringMachineAssert(Array.isArray(schema.validValues), `isValidValue must be an array for key: ${key}`);
      }

      // isValidValue is a function
      if (schema.hasOwnProperty('isValidValue')) {
        queryStringMachineAssert(typeof schema.isValidValue === 'function', `isValidValue must be a function for key: ${key}`);
      }

      // defaultValue has the correct type
      if (schema.hasOwnProperty('defaultValue')) {
        queryStringMachineAssert(TYPES[schema.type].isValidValue(schema.defaultValue), `defaultValue incorrect type: ${key}`);
      }

      // validValues have the correct type
      if (schema.hasOwnProperty('validValues')) {
        schema.validValues.forEach(value => queryStringMachineAssert(TYPES[schema.type].isValidValue(value), `validValue incorrect type for key: ${key}`));
      }

      // defaultValue is a member of validValues
      if (schema.hasOwnProperty('defaultValue') && schema.hasOwnProperty('validValues')) {
        queryStringMachineAssert(isValidValue(schema.defaultValue, schema.validValues), schema, key, `defaultValue must be a member of validValues, for key: ${key}`);
      }

      // defaultValue must exist for a public schema so there's a fallback in case a user provides an invalid value.
      // However, defaultValue is not required for flags since they're only a key. While marking a flag as public: true
      // doesn't change its behavior, it's allowed so that we can use the public key for documentation, see https://github.com/phetsims/query-string-machine/issues/41
      if (schema.hasOwnProperty('public') && schema.public && schema.type !== 'flag') {
        queryStringMachineAssert(schema.hasOwnProperty('defaultValue'), `defaultValue is required when public: true for key: ${key}`);
      }

      // verify that the schema has appropriate properties
      validateSchemaProperties(key, schema, TYPES[schema.type].required, TYPES[schema.type].optional);

      // dispatch further validation to an (optional) type-specific function
      if (TYPES[schema.type].validateSchema) {
        TYPES[schema.type].validateSchema(key, schema);
      }
    };

    /**
     * Validates schema for type 'array'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     */
    const validateArraySchema = function (key, schema) {
      // separator is a single character
      if (schema.hasOwnProperty('separator')) {
        queryStringMachineAssert(typeof schema.separator === 'string' && schema.separator.length === 1, `invalid separator: ${schema.separator}, for key: ${key}`);
      }
      queryStringMachineAssert(!schema.elementSchema.hasOwnProperty('public'), 'Array elements should not declare public; it comes from the array schema itself.');

      // validate elementSchema
      validateSchema(`${key}.element`, schema.elementSchema);
    };

    /**
     * Verifies that a schema contains only supported properties, and contains all required properties.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string[]} requiredProperties - properties that the schema must have
     * @param {string[]} optionalProperties - properties that the schema may optionally have
     */
    const validateSchemaProperties = function (key, schema, requiredProperties, optionalProperties) {
      // {string[]}, the names of the properties in the schema
      const schemaProperties = Object.getOwnPropertyNames(schema);

      // verify that all required properties are present
      requiredProperties.forEach(property => {
        queryStringMachineAssert(schemaProperties.indexOf(property) !== -1, `missing required property: ${property} for key: ${key}`);
      });

      // verify that there are no unsupported properties
      const supportedProperties = requiredProperties.concat(optionalProperties);
      schemaProperties.forEach(property => {
        queryStringMachineAssert(property === 'type' || supportedProperties.indexOf(property) !== -1, `unsupported property: ${property} for key: ${key}`);
      });
    };

    // Parsing =========================================================================================================

    /**
     * Uses the supplied schema to convert query parameter value(s) from string to the desired value type.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {Array.<string|null|undefined>} values - any matches from the query string,
     *   could be multiple for ?value=x&value=y for example
     * @returns {*} the associated value, converted to the proper type
     */
    const parseValues = function (key, schema, values) {
      let returnValue;

      // values contains values for all occurrences of the query parameter.  We currently support only 1 occurrence.
      queryStringMachineAssert(values.length <= 1, `query parameter cannot occur multiple times: ${key}`);
      if (schema.type === 'flag') {
        // flag is a convenient variation of boolean, which depends on whether the query string is present or not
        returnValue = TYPES[schema.type].parse(key, schema, values[0]);
      } else {
        queryStringMachineAssert(values[0] !== undefined || schema.hasOwnProperty('defaultValue'), `missing required query parameter: ${key}`);
        if (values[0] === undefined) {
          // not in the query string, use the default
          returnValue = schema.defaultValue;
        } else {
          // dispatch parsing of query string to a type-specific function
          returnValue = TYPES[schema.type].parse(key, schema, values[0]);
        }
      }
      return returnValue;
    };

    /**
     * Parses the value for a type 'flag'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {null|undefined|string} value - value from the query parameter string
     * @returns {boolean|string}
     */
    const parseFlag = function (key, schema, value) {
      return value === null ? true : value === undefined ? false : value;
    };

    /**
     * Parses the value for a type 'boolean'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string|null} string - value from the query parameter string
     * @returns {boolean|string|null}
     */
    const parseBoolean = function (key, schema, string) {
      return string === 'true' ? true : string === 'false' ? false : string;
    };

    /**
     * Parses the value for a type 'number'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string|null} string - value from the query parameter string
     * @returns {number|string|null}
     */
    const parseNumber = function (key, schema, string) {
      const number = Number(string);
      return string === null || isNaN(number) ? string : number;
    };

    /**
     * Parses the value for a type 'number'.
     * The value to be parsed is already string, so it is guaranteed to parse as a string.
     * @param {string} key
     * @param {Object} schema
     * @param {string|null} string
     * @returns {string|null}
     */
    const parseString = function (key, schema, string) {
      return string;
    };

    /**
     * Parses the value for a type 'array'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string|null} value - value from the query parameter string
     * @returns {Array.<*>|null}
     */
    const parseArray = function (key, schema, value) {
      let returnValue;
      if (value === null) {
        // null signifies an empty array. For instance ?screens= would give []
        // See https://github.com/phetsims/query-string-machine/issues/17
        returnValue = [];
      } else {
        // Split up the string into an array of values. E.g. ?screens=1,2 would give [1,2]
        returnValue = value.split(schema.separator || DEFAULT_SEPARATOR).map(element => parseValues(key, schema.elementSchema, [element]));
      }
      return returnValue;
    };

    /**
     * Parses the value for a type 'custom'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string} value - value from the query parameter string
     * @returns {*}
     */
    const parseCustom = function (key, schema, value) {
      return schema.parse(value);
    };

    // Utilities =======================================================================================================

    /**
     * Determines if value is in a set of valid values, uses deep comparison.
     * @param {*} value
     * @param {Array.<*>} validValues
     * @returns {boolean}
     */
    const isValidValue = function (value, validValues) {
      let found = false;
      for (let i = 0; i < validValues.length && !found; i++) {
        found = QueryStringMachine.deepEquals(validValues[i], value);
      }
      return found;
    };

    /**
     * Query parameters are specified by the user, and are outside the control of the programmer.
     * So the application should throw an Error if query parameters are invalid.
     * @param {boolean} predicate - if predicate evaluates to false, an Error is thrown
     * @param {string} message
     */
    const queryStringMachineAssert = function (predicate, message) {
      if (!predicate) {
        console && console.log && console.log(message);
        throw new Error(`Query String Machine Assertion failed: ${message}`);
      }
    };

    //==================================================================================================================

    /**
     * Data structure that describes each query parameter type, which properties are required vs optional,
     * how to validate, and how to parse.
     *
     * The properties that are required or optional depend on the type (see TYPES), and include:
     * type - {string} the type name
     * defaultValue - the value to use if no query parameter is provided. If there is no defaultValue, then
     *    the query parameter is required in the query string; omitting the query parameter will result in an Error.
     * validValues - array of the valid values for the query parameter
     * isValidValue - function that takes a parsed Object (not string) and checks if it is acceptable
     * elementSchema - specifies the schema for elements in an array
     * separator -  array elements are separated by this string, defaults to `,`
     * parse - a function that takes a string and returns an Object
     */
    const TYPES = {
      // NOTE: Types for this are currently in phet-types.d.ts! Changes here should be made there also

      // value is true if present, false if absent
      flag: {
        required: [],
        optional: ['private', 'public'],
        validateSchema: null,
        // no type-specific schema validation
        parse: parseFlag,
        isValidValue: value => value === true || value === false,
        defaultValue: true // only needed for flags marks as 'public: true`
      },

      // value is either true or false, e.g. showAnswer=true
      boolean: {
        required: [],
        optional: ['defaultValue', 'private', 'public'],
        validateSchema: null,
        // no type-specific schema validation
        parse: parseBoolean,
        isValidValue: value => value === true || value === false
      },
      // value is a number, e.g. frameRate=100
      number: {
        required: [],
        optional: ['defaultValue', 'validValues', 'isValidValue', 'private', 'public'],
        validateSchema: null,
        // no type-specific schema validation
        parse: parseNumber,
        isValidValue: value => typeof value === 'number' && !isNaN(value)
      },
      // value is a string, e.g. name=Ringo
      string: {
        required: [],
        optional: ['defaultValue', 'validValues', 'isValidValue', 'private', 'public'],
        validateSchema: null,
        // no type-specific schema validation
        parse: parseString,
        isValidValue: value => value === null || typeof value === 'string'
      },
      // value is an array, e.g. screens=1,2,3
      array: {
        required: ['elementSchema'],
        optional: ['defaultValue', 'validValues', 'isValidValue', 'separator', 'validValues', 'private', 'public'],
        validateSchema: validateArraySchema,
        parse: parseArray,
        isValidValue: value => Array.isArray(value) || value === null
      },
      // value is a custom data type, e.g. color=255,0,255
      custom: {
        required: ['parse'],
        optional: ['defaultValue', 'validValues', 'isValidValue', 'private', 'public'],
        validateSchema: null,
        // no type-specific schema validation
        parse: parseCustom,
        isValidValue: value => {
          // TODO do we need to add a property to 'custom' schema that handles validation of custom value's type? see https://github.com/phetsims/query-string-machine/issues/35
          return true;
        }
      }
    };
    return QueryStringMachine;
  }();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJyb290IiwiZmFjdG9yeSIsIndpbmRvdyIsImRlZmluZSIsImFtZCIsIm1vZHVsZSIsImV4cG9ydHMiLCJRdWVyeVN0cmluZ01hY2hpbmUiLCJERUZBVUxUX1NFUEFSQVRPUiIsInByaXZhdGVQcmVkaWNhdGUiLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwiZSIsImlzUGFyYW1ldGVyU3RyaW5nIiwic3RyaW5nIiwibGVuZ3RoIiwiaW5kZXhPZiIsImdldFZhbGlkVmFsdWUiLCJwcmVkaWNhdGUiLCJrZXkiLCJ2YWx1ZSIsInNjaGVtYSIsIm1lc3NhZ2UiLCJwdWJsaWMiLCJhZGRXYXJuaW5nIiwiaGFzT3duUHJvcGVydHkiLCJkZWZhdWx0VmFsdWUiLCJ0eXBlU2NoZW1hIiwiVFlQRVMiLCJ0eXBlIiwicXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0Iiwid2FybmluZ3MiLCJnZXQiLCJnZXRGb3JTdHJpbmciLCJsb2NhdGlvbiIsInNlYXJjaCIsImdldEFsbCIsInNjaGVtYU1hcCIsImdldEFsbEZvclN0cmluZyIsIkVycm9yIiwidmFsdWVzIiwicHJpdmF0ZSIsImdldFZhbHVlcyIsInZhbGlkYXRlU2NoZW1hIiwicGFyc2VWYWx1ZXMiLCJpc1ZhbGlkVmFsdWUiLCJ2YWxpZFZhbHVlcyIsImpvaW4iLCJ2YWx1ZVZhbGlkIiwiQXJyYXkiLCJpc0FycmF5IiwiZWxlbWVudHNWYWxpZCIsImkiLCJlbGVtZW50IiwiZWxlbWVudFNjaGVtYSIsInJlc3VsdCIsImNvbnRhaW5zS2V5IiwiY29udGFpbnNLZXlGb3JTdHJpbmciLCJkZWVwRXF1YWxzIiwiYSIsImIiLCJ1bmRlZmluZWQiLCJhS2V5cyIsIk9iamVjdCIsImtleXMiLCJiS2V5cyIsImFDaGlsZCIsImJDaGlsZCIsInJlbW92ZUtleVZhbHVlUGFpciIsInF1ZXJ5U3RyaW5nIiwiYXNzZXJ0IiwibmV3UGFyYW1ldGVycyIsInF1ZXJ5Iiwic3Vic3RyaW5nIiwiZWxlbWVudHMiLCJzcGxpdCIsImtleUFuZE1heWJlVmFsdWUiLCJlbGVtZW50S2V5IiwiZGVjb2RlVVJJQ29tcG9uZW50IiwicHVzaCIsInJlbW92ZUtleVZhbHVlUGFpcnMiLCJhcHBlbmRRdWVyeVN0cmluZyIsInVybCIsInF1ZXJ5UGFyYW1ldGVycyIsImNvbWJpbmF0aW9uIiwiYXBwZW5kUXVlcnlTdHJpbmdBcnJheSIsInF1ZXJ5U3RyaW5nQXJyYXkiLCJnZXRRdWVyeVN0cmluZyIsImluZGV4IiwiY29uc29sZSIsIndhcm4iLCJoYXNXYXJuaW5nIiwiZ2V0UXVlcnlQYXJhbWV0ZXJzRnJvbVN0cmluZyIsImdldFNpbmdsZVF1ZXJ5UGFyYW1ldGVyU3RyaW5nIiwicXVlcnlQYXJhbWV0ZXIiLCJwYXJhbXMiLCJzbGljZSIsInNwbGl0QnlFcXVhbHMiLCJuYW1lIiwicGFyc2UiLCJmb3JFYWNoIiwidmFsaWRhdGVTY2hlbWFQcm9wZXJ0aWVzIiwicmVxdWlyZWQiLCJvcHRpb25hbCIsInZhbGlkYXRlQXJyYXlTY2hlbWEiLCJzZXBhcmF0b3IiLCJyZXF1aXJlZFByb3BlcnRpZXMiLCJvcHRpb25hbFByb3BlcnRpZXMiLCJzY2hlbWFQcm9wZXJ0aWVzIiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsInByb3BlcnR5Iiwic3VwcG9ydGVkUHJvcGVydGllcyIsImNvbmNhdCIsInJldHVyblZhbHVlIiwicGFyc2VGbGFnIiwicGFyc2VCb29sZWFuIiwicGFyc2VOdW1iZXIiLCJudW1iZXIiLCJOdW1iZXIiLCJpc05hTiIsInBhcnNlU3RyaW5nIiwicGFyc2VBcnJheSIsIm1hcCIsInBhcnNlQ3VzdG9tIiwiZm91bmQiLCJsb2ciLCJmbGFnIiwiYm9vbGVhbiIsImFycmF5IiwiY3VzdG9tIl0sInNvdXJjZXMiOlsiUXVlcnlTdHJpbmdNYWNoaW5lLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFF1ZXJ5IFN0cmluZyBwYXJzZXIgdGhhdCBzdXBwb3J0cyB0eXBlIGNvZXJjaW9uLCBkZWZhdWx0cywgZXJyb3IgY2hlY2tpbmcsIGV0Yy4gYmFzZWQgb24gYSBzY2hlbWEuXHJcbiAqIFNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0IGZvciB0aGUgZGVzY3JpcHRpb24gb2YgYSBzY2hlbWEuXHJcbiAqXHJcbiAqIEltcGxlbWVudGVkIGFzIGEgVU1EIChVbml2ZXJzYWwgTW9kdWxlIERlZmluaXRpb24pIHNvIHRoYXQgaXQncyBjYXBhYmxlIG9mIHdvcmtpbmcgZXZlcnl3aGVyZS5cclxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS91bWRqcy91bWQvYmxvYi9tYXN0ZXIvdGVtcGxhdGVzL3JldHVybkV4cG9ydHMuanNcclxuICpcclxuICogU2VlIFRZUEVTIGZvciBhIGRlc2NyaXB0aW9uIG9mIHRoZSBzY2hlbWEgdHlwZXMgYW5kIHRoZWlyIHByb3BlcnRpZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG4oIGZ1bmN0aW9uKCByb290LCBmYWN0b3J5ICkge1xyXG5cclxuICBpZiAoIHR5cGVvZiB3aW5kb3cuZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIHdpbmRvdy5kZWZpbmUuYW1kICkge1xyXG5cclxuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cclxuICAgIHdpbmRvdy5kZWZpbmUoIFtdLCBmYWN0b3J5ICk7XHJcbiAgfVxyXG4gIGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcclxuXHJcbiAgICAvLyBOb2RlLiBEb2VzIG5vdCB3b3JrIHdpdGggc3RyaWN0IENvbW1vbkpTLCBidXRcclxuICAgIC8vIG9ubHkgQ29tbW9uSlMtbGlrZSBlbnZpcm9ubWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLFxyXG4gICAgLy8gbGlrZSBOb2RlLlxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG5cclxuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXHJcbiAgICByb290LlF1ZXJ5U3RyaW5nTWFjaGluZSA9IGZhY3RvcnkoKTtcclxuICB9XHJcbn0oIHRoaXMsICgpID0+IHtcclxuXHJcbiAgLy8gRGVmYXVsdCBzdHJpbmcgdGhhdCBzcGxpdHMgYXJyYXkgc3RyaW5nc1xyXG4gIGNvbnN0IERFRkFVTFRfU0VQQVJBVE9SID0gJywnO1xyXG5cclxuICAvLyBJZiBhIHF1ZXJ5IHBhcmFtZXRlciBoYXMgcHJpdmF0ZTp0cnVlIGluIGl0cyBzY2hlbWEsIGl0IG11c3QgcGFzcyB0aGlzIHByZWRpY2F0ZSB0byBiZSByZWFkIGZyb20gdGhlIFVSTC5cclxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzc0M1xyXG4gIGNvbnN0IHByaXZhdGVQcmVkaWNhdGUgPSAoKSA9PiB7XHJcbiAgICAvLyBUcnlpbmcgdG8gYWNjZXNzIGxvY2FsU3RvcmFnZSBtYXkgZmFpbCB3aXRoIGEgU2VjdXJpdHlFcnJvciBpZiBjb29raWVzIGFyZSBibG9ja2VkIGluIGEgY2VydGFpbiB3YXkuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3FhL2lzc3Vlcy8zMjkgZm9yIG1vcmUgaW5mb3JtYXRpb24uXHJcbiAgICB0cnkge1xyXG4gICAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oICdwaGV0VGVhbU1lbWJlcicgKSA9PT0gJ3RydWUnO1xyXG4gICAgfVxyXG4gICAgY2F0Y2goIGUgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBWYWxpZCBwYXJhbWV0ZXIgc3RyaW5ncyBiZWdpbiB3aXRoID8gb3IgYXJlIHRoZSBlbXB0eSBzdHJpbmcuICBUaGlzIGlzIHVzZWQgZm9yIGFzc2VydGlvbnMgaW4gc29tZSBjYXNlcyBhbmQgZm9yXHJcbiAgICogdGhyb3dpbmcgRXJyb3JzIGluIG90aGVyIGNhc2VzLlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmdcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBjb25zdCBpc1BhcmFtZXRlclN0cmluZyA9IHN0cmluZyA9PiBzdHJpbmcubGVuZ3RoID09PSAwIHx8IHN0cmluZy5pbmRleE9mKCAnPycgKSA9PT0gMDtcclxuXHJcbiAgLy8gSnVzdCByZXR1cm4gYSB2YWx1ZSB0byBkZWZpbmUgdGhlIG1vZHVsZSBleHBvcnQuXHJcbiAgLy8gVGhpcyBleGFtcGxlIHJldHVybnMgYW4gb2JqZWN0LCBidXQgdGhlIG1vZHVsZVxyXG4gIC8vIGNhbiByZXR1cm4gYSBmdW5jdGlvbiBhcyB0aGUgZXhwb3J0ZWQgdmFsdWUuXHJcbiAgcmV0dXJuICggZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbiBvcmRlciB0byBzdXBwb3J0IGdyYWNlZnVsIGZhaWx1cmVzIGZvciB1c2VyLXN1cHBsaWVkIHZhbHVlcywgd2UgZmFsbCBiYWNrIHRvIGRlZmF1bHQgdmFsdWVzIHdoZW4gcHVibGljOiB0cnVlXHJcbiAgICAgKiBpcyBzcGVjaWZpZWQuICBJZiB0aGUgc2NoZW1hIGVudHJ5IGlzIHB1YmxpYzogZmFsc2UsIHRoZW4gYSBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQgaXMgdGhyb3duLlxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBwcmVkaWNhdGVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZSAtIHZhbHVlIG9mIHRoZSBwYXJzZWQgdHlwZSwgb3IsIGlmIHBhcnNpbmcgZmFpbGVkLCB0aGUge3N0cmluZ30gdGhhdCB3b3VsZCBub3QgcGFyc2VcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzY2hlbWFcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlXHJcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxyXG4gICAgICovXHJcbiAgICBjb25zdCBnZXRWYWxpZFZhbHVlID0gKCBwcmVkaWNhdGUsIGtleSwgdmFsdWUsIHNjaGVtYSwgbWVzc2FnZSApID0+IHtcclxuICAgICAgaWYgKCAhcHJlZGljYXRlICkge1xyXG5cclxuICAgICAgICBpZiAoIHNjaGVtYS5wdWJsaWMgKSB7XHJcbiAgICAgICAgICBRdWVyeVN0cmluZ01hY2hpbmUuYWRkV2FybmluZygga2V5LCB2YWx1ZSwgbWVzc2FnZSApO1xyXG4gICAgICAgICAgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdkZWZhdWx0VmFsdWUnICkgKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gc2NoZW1hLmRlZmF1bHRWYWx1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCB0eXBlU2NoZW1hID0gVFlQRVNbIHNjaGVtYS50eXBlIF07XHJcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggdHlwZVNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ2RlZmF1bHRWYWx1ZScgKSxcclxuICAgICAgICAgICAgICAnVHlwZSBtdXN0IGhhdmUgYSBkZWZhdWx0IHZhbHVlIGlmIHRoZSBwcm92aWRlZCBzY2hlbWEgZG9lcyBub3QgaGF2ZSBvbmUuJyApO1xyXG4gICAgICAgICAgICB2YWx1ZSA9IHR5cGVTY2hlbWEuZGVmYXVsdFZhbHVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggcHJlZGljYXRlLCBtZXNzYWdlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBRdWVyeSBTdHJpbmcgTWFjaGluZSBpcyBhIHF1ZXJ5IHN0cmluZyBwYXJzZXIgdGhhdCBzdXBwb3J0cyB0eXBlIGNvZXJjaW9uLCBkZWZhdWx0IHZhbHVlcyAmIHZhbGlkYXRpb24uIFBsZWFzZVxyXG4gICAgICogdmlzaXQgUGhFVCdzIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmVcIiB0YXJnZXQ9XCJfYmxhbmtcIj5xdWVyeS1zdHJpbmctbWFjaGluZTwvYT5cclxuICAgICAqIHJlcG9zaXRvcnkgZm9yIGRvY3VtZW50YXRpb24gYW5kIGV4YW1wbGVzLlxyXG4gICAgICovXHJcbiAgICBjb25zdCBRdWVyeVN0cmluZ01hY2hpbmUgPSB7XHJcblxyXG4gICAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHt7a2V5OnN0cmluZywgdmFsdWU6eyp9LCBtZXNzYWdlOnN0cmluZ31bXX0gLSBjbGVhcmVkIGJ5IHNvbWUgdGVzdHMgaW4gUXVlcnlTdHJpbmdNYWNoaW5lVGVzdHMuanNcclxuICAgICAgLy8gU2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5hZGRXYXJuaW5nIGZvciBhIGRlc2NyaXB0aW9uIG9mIHRoZXNlIGZpZWxkcywgYW5kIHRvIGFkZCB3YXJuaW5ncy5cclxuICAgICAgd2FybmluZ3M6IFtdLFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEdldHMgdGhlIHZhbHVlIGZvciBhIHNpbmdsZSBxdWVyeSBwYXJhbWV0ZXIuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcclxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IHNjaGVtYVxyXG4gICAgICAgKiBAcmV0dXJucyB7Kn0gcXVlcnkgcGFyYW1ldGVyIHZhbHVlLCBjb252ZXJ0ZWQgdG8gdGhlIHByb3BlciB0eXBlXHJcbiAgICAgICAqIEBwdWJsaWNcclxuICAgICAgICovXHJcbiAgICAgIGdldDogZnVuY3Rpb24oIGtleSwgc2NoZW1hICkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZvclN0cmluZygga2V5LCBzY2hlbWEsIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBHZXRzIHZhbHVlcyBmb3IgZXZlcnkgcXVlcnkgcGFyYW1ldGVyLCB1c2luZyB0aGUgc3BlY2lmaWVkIHNjaGVtYSBtYXAuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzY2hlbWFNYXAgLSBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldEFsbEZvclN0cmluZ1xyXG4gICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSAtIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0QWxsRm9yU3RyaW5nXHJcbiAgICAgICAqIEBwdWJsaWNcclxuICAgICAgICovXHJcbiAgICAgIGdldEFsbDogZnVuY3Rpb24oIHNjaGVtYU1hcCApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRBbGxGb3JTdHJpbmcoIHNjaGVtYU1hcCwgd2luZG93LmxvY2F0aW9uLnNlYXJjaCApO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIExpa2UgYGdldGAgYnV0IGZvciBhbiBhcmJpdHJhcnkgcGFyYW1ldGVyIHN0cmluZy5cclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxyXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gc2NoZW1hIC0gc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRcclxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyAtIHRoZSBwYXJhbWV0ZXJzIHN0cmluZy4gIE11c3QgYmVnaW4gd2l0aCAnPycgb3IgYmUgdGhlIGVtcHR5IHN0cmluZ1xyXG4gICAgICAgKiBAcmV0dXJucyB7Kn0gcXVlcnkgcGFyYW1ldGVyIHZhbHVlLCBjb252ZXJ0ZWQgdG8gdGhlIHByb3BlciB0eXBlXHJcbiAgICAgICAqIEBwdWJsaWNcclxuICAgICAgICovXHJcbiAgICAgIGdldEZvclN0cmluZzogZnVuY3Rpb24oIGtleSwgc2NoZW1hLCBzdHJpbmcgKSB7XHJcblxyXG4gICAgICAgIGlmICggIWlzUGFyYW1ldGVyU3RyaW5nKCBzdHJpbmcgKSApIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggYFF1ZXJ5IHN0cmluZ3Mgc2hvdWxkIGJlIGVpdGhlciB0aGUgZW1wdHkgc3RyaW5nIG9yIHN0YXJ0IHdpdGggYSBcIj9cIjogJHtzdHJpbmd9YCApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWdub3JlIFVSTCB2YWx1ZXMgZm9yIHByaXZhdGUgcXVlcnkgcGFyYW1ldGVycyB0aGF0IGZhaWwgcHJpdmF0ZVByZWRpY2F0ZS5cclxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzc0My5cclxuICAgICAgICBjb25zdCB2YWx1ZXMgPSAoIHNjaGVtYS5wcml2YXRlICYmICFwcml2YXRlUHJlZGljYXRlKCkgKSA/IFtdIDogZ2V0VmFsdWVzKCBrZXksIHN0cmluZyApO1xyXG5cclxuICAgICAgICB2YWxpZGF0ZVNjaGVtYSgga2V5LCBzY2hlbWEgKTtcclxuXHJcbiAgICAgICAgbGV0IHZhbHVlID0gcGFyc2VWYWx1ZXMoIGtleSwgc2NoZW1hLCB2YWx1ZXMgKTtcclxuXHJcbiAgICAgICAgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICd2YWxpZFZhbHVlcycgKSApIHtcclxuICAgICAgICAgIHZhbHVlID0gZ2V0VmFsaWRWYWx1ZSggaXNWYWxpZFZhbHVlKCB2YWx1ZSwgc2NoZW1hLnZhbGlkVmFsdWVzICksIGtleSwgdmFsdWUsIHNjaGVtYSxcclxuICAgICAgICAgICAgYEludmFsaWQgdmFsdWUgc3VwcGxpZWQgZm9yIGtleSBcIiR7a2V5fVwiOiAke3ZhbHVlfSBpcyBub3QgYSBtZW1iZXIgb2YgdmFsaWQgdmFsdWVzOiAke3NjaGVtYS52YWxpZFZhbHVlcy5qb2luKCAnLCAnICl9YFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGlzVmFsaWRWYWx1ZSBldmFsdWF0ZXMgdG8gdHJ1ZVxyXG4gICAgICAgIGVsc2UgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdpc1ZhbGlkVmFsdWUnICkgKSB7XHJcbiAgICAgICAgICB2YWx1ZSA9IGdldFZhbGlkVmFsdWUoIHNjaGVtYS5pc1ZhbGlkVmFsdWUoIHZhbHVlICksIGtleSwgdmFsdWUsIHNjaGVtYSxcclxuICAgICAgICAgICAgYEludmFsaWQgdmFsdWUgc3VwcGxpZWQgZm9yIGtleSBcIiR7a2V5fVwiOiAke3ZhbHVlfWBcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgdmFsdWVWYWxpZCA9IFRZUEVTWyBzY2hlbWEudHlwZSBdLmlzVmFsaWRWYWx1ZSggdmFsdWUgKTtcclxuXHJcbiAgICAgICAgLy8gc3VwcG9ydCBjdXN0b20gdmFsaWRhdGlvbiBmb3IgZWxlbWVudFNjaGVtYSBmb3IgYXJyYXlzXHJcbiAgICAgICAgaWYgKCBzY2hlbWEudHlwZSA9PT0gJ2FycmF5JyAmJiBBcnJheS5pc0FycmF5KCB2YWx1ZSApICkge1xyXG4gICAgICAgICAgbGV0IGVsZW1lbnRzVmFsaWQgPSB0cnVlO1xyXG4gICAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSB2YWx1ZVsgaSBdO1xyXG4gICAgICAgICAgICBpZiAoICFUWVBFU1sgc2NoZW1hLmVsZW1lbnRTY2hlbWEudHlwZSBdLmlzVmFsaWRWYWx1ZSggZWxlbWVudCApICkge1xyXG4gICAgICAgICAgICAgIGVsZW1lbnRzVmFsaWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIHNjaGVtYS5lbGVtZW50U2NoZW1hLmhhc093blByb3BlcnR5KCAnaXNWYWxpZFZhbHVlJyApICYmICFzY2hlbWEuZWxlbWVudFNjaGVtYS5pc1ZhbGlkVmFsdWUoIGVsZW1lbnQgKSApIHtcclxuICAgICAgICAgICAgICBlbGVtZW50c1ZhbGlkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCBzY2hlbWEuZWxlbWVudFNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ3ZhbGlkVmFsdWVzJyApICYmICFpc1ZhbGlkVmFsdWUoIGVsZW1lbnQsIHNjaGVtYS5lbGVtZW50U2NoZW1hLnZhbGlkVmFsdWVzICkgKSB7XHJcbiAgICAgICAgICAgICAgZWxlbWVudHNWYWxpZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB2YWx1ZVZhbGlkID0gdmFsdWVWYWxpZCAmJiBlbGVtZW50c1ZhbGlkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gZGlzcGF0Y2ggZnVydGhlciB2YWxpZGF0aW9uIHRvIGEgdHlwZS1zcGVjaWZpYyBmdW5jdGlvblxyXG4gICAgICAgIHZhbHVlID0gZ2V0VmFsaWRWYWx1ZSggdmFsdWVWYWxpZCwga2V5LCB2YWx1ZSwgc2NoZW1hLCBgSW52YWxpZCB2YWx1ZSBmb3IgdHlwZSwga2V5OiAke2tleX1gICk7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIExpa2UgYGdldEFsbGAgYnV0IGZvciBhbiBhcmJpdHJhcnkgcGFyYW1ldGVycyBzdHJpbmcuXHJcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzY2hlbWFNYXAgLSBrZXkvdmFsdWUgcGFpcnMsIGtleSBpcyBxdWVyeSBwYXJhbWV0ZXIgbmFtZSBhbmQgdmFsdWUgaXMgYSBzY2hlbWFcclxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyAtIHRoZSBwYXJhbWV0ZXJzIHN0cmluZ1xyXG4gICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSAtIGtleS92YWx1ZSBwYWlycyBob2xkaW5nIHRoZSBwYXJzZWQgcmVzdWx0c1xyXG4gICAgICAgKiBAcHVibGljXHJcbiAgICAgICAqL1xyXG4gICAgICBnZXRBbGxGb3JTdHJpbmc6IGZ1bmN0aW9uKCBzY2hlbWFNYXAsIHN0cmluZyApIHtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSB7fTtcclxuICAgICAgICBmb3IgKCBjb25zdCBrZXkgaW4gc2NoZW1hTWFwICkge1xyXG4gICAgICAgICAgaWYgKCBzY2hlbWFNYXAuaGFzT3duUHJvcGVydHkoIGtleSApICkge1xyXG4gICAgICAgICAgICByZXN1bHRbIGtleSBdID0gdGhpcy5nZXRGb3JTdHJpbmcoIGtleSwgc2NoZW1hTWFwWyBrZXkgXSwgc3RyaW5nICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cubG9jYXRpb24uc2VhcmNoIGNvbnRhaW5zIHRoZSBnaXZlbiBrZXlcclxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxyXG4gICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgd2luZG93LmxvY2F0aW9uLnNlYXJjaCBjb250YWlucyB0aGUgZ2l2ZW4ga2V5XHJcbiAgICAgICAqIEBwdWJsaWNcclxuICAgICAgICovXHJcbiAgICAgIGNvbnRhaW5zS2V5OiBmdW5jdGlvbigga2V5ICkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5zS2V5Rm9yU3RyaW5nKCBrZXksIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIHN0cmluZyBjb250YWlucyB0aGUgc3BlY2lmaWVkIGtleVxyXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IC0gdGhlIGtleSB0byBjaGVjayBmb3JcclxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyAtIHRoZSBxdWVyeSBzdHJpbmcgdG8gc2VhcmNoLiBNdXN0IGJlZ2luIHdpdGggJz8nIG9yIGJlIHRoZSBlbXB0eSBzdHJpbmdcclxuICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIGdpdmVuIHN0cmluZyBjb250YWlucyB0aGUgZ2l2ZW4ga2V5XHJcbiAgICAgICAqIEBwdWJsaWNcclxuICAgICAgICovXHJcbiAgICAgIGNvbnRhaW5zS2V5Rm9yU3RyaW5nOiBmdW5jdGlvbigga2V5LCBzdHJpbmcgKSB7XHJcbiAgICAgICAgaWYgKCAhaXNQYXJhbWV0ZXJTdHJpbmcoIHN0cmluZyApICkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgUXVlcnkgc3RyaW5ncyBzaG91bGQgYmUgZWl0aGVyIHRoZSBlbXB0eSBzdHJpbmcgb3Igc3RhcnQgd2l0aCBhIFwiP1wiOiAke3N0cmluZ31gICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IGdldFZhbHVlcygga2V5LCBzdHJpbmcgKTtcclxuICAgICAgICByZXR1cm4gdmFsdWVzLmxlbmd0aCA+IDA7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBvYmplY3RzIGFyZSBlcXVhbC4gIEV4cG9ydGVkIG9uIHRoZSBRdWVyeVN0cmluZ01hY2hpbmUgZm9yIHRlc3RpbmcuICBPbmx5IHdvcmtzIGZvclxyXG4gICAgICAgKiBhcnJheXMgb2JqZWN0cyB0aGF0IGNvbnRhaW4gcHJpbWl0aXZlcyAoaS5lLiB0ZXJtaW5hbHMgYXJlIGNvbXBhcmVkIHdpdGggPT09KVxyXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gYSAtIGFuIG9iamVjdCB0byBjb21wYXJlXHJcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBiIC0gYW4gb2JqZWN0IHRvIGNvbXBhcmVcclxuICAgICAgICogQHByaXZhdGUgLSBob3dldmVyLCBpdCBpcyBjYWxsZWQgZnJvbSBRdWVyeVN0cmluZ01hY2hpbmVUZXN0c1xyXG4gICAgICAgKi9cclxuICAgICAgZGVlcEVxdWFsczogZnVuY3Rpb24oIGEsIGIgKSB7XHJcbiAgICAgICAgaWYgKCB0eXBlb2YgYSAhPT0gdHlwZW9mIGIgKSB7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggdHlwZW9mIGEgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBhID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgYSA9PT0gJ2Jvb2xlYW4nICkge1xyXG4gICAgICAgICAgcmV0dXJuIGEgPT09IGI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggYSA9PT0gbnVsbCAmJiBiID09PSBudWxsICkge1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggYSA9PT0gdW5kZWZpbmVkICYmIGIgPT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIGEgPT09IG51bGwgJiYgYiA9PT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIGEgPT09IHVuZGVmaW5lZCAmJiBiID09PSBudWxsICkge1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBhS2V5cyA9IE9iamVjdC5rZXlzKCBhICk7XHJcbiAgICAgICAgY29uc3QgYktleXMgPSBPYmplY3Qua2V5cyggYiApO1xyXG4gICAgICAgIGlmICggYUtleXMubGVuZ3RoICE9PSBiS2V5cy5sZW5ndGggKSB7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBhS2V5cy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgICAgICByZXR1cm4gYSA9PT0gYjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhS2V5cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICAgICAgaWYgKCBhS2V5c1sgaSBdICE9PSBiS2V5c1sgaSBdICkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBhQ2hpbGQgPSBhWyBhS2V5c1sgaSBdIF07XHJcbiAgICAgICAgICAgIGNvbnN0IGJDaGlsZCA9IGJbIGFLZXlzWyBpIF0gXTtcclxuICAgICAgICAgICAgaWYgKCAhUXVlcnlTdHJpbmdNYWNoaW5lLmRlZXBFcXVhbHMoIGFDaGlsZCwgYkNoaWxkICkgKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUmV0dXJucyBhIG5ldyBVUkwgYnV0IHdpdGhvdXQgdGhlIGtleS12YWx1ZSBwYWlyLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcXVlcnlTdHJpbmcgLSB0YWlsIG9mIGEgVVJMIGluY2x1ZGluZyB0aGUgYmVnaW5uaW5nICc/JyAoaWYgYW55KVxyXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XHJcbiAgICAgICAqIEBwdWJsaWNcclxuICAgICAgICovXHJcbiAgICAgIHJlbW92ZUtleVZhbHVlUGFpcjogZnVuY3Rpb24oIHF1ZXJ5U3RyaW5nLCBrZXkgKSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHF1ZXJ5U3RyaW5nID09PSAnc3RyaW5nJywgYHVybCBzaG91bGQgYmUgc3RyaW5nLCBidXQgaXQgd2FzOiAke3R5cGVvZiBxdWVyeVN0cmluZ31gICk7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGtleSA9PT0gJ3N0cmluZycsIGB1cmwgc2hvdWxkIGJlIHN0cmluZywgYnV0IGl0IHdhczogJHt0eXBlb2Yga2V5fWAgKTtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc1BhcmFtZXRlclN0cmluZyggcXVlcnlTdHJpbmcgKSwgJ3F1ZXJ5U3RyaW5nIHNob3VsZCBiZSBsZW5ndGggMCBvciBiZWdpbiB3aXRoID8nICk7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCgga2V5Lmxlbmd0aCA+IDAsICd1cmwgc2hvdWxkIGJlIGEgc3RyaW5nIHdpdGggbGVuZ3RoID4gMCcgKTtcclxuXHJcbiAgICAgICAgaWYgKCBxdWVyeVN0cmluZy5pbmRleE9mKCAnPycgKSA9PT0gMCApIHtcclxuICAgICAgICAgIGNvbnN0IG5ld1BhcmFtZXRlcnMgPSBbXTtcclxuICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gcXVlcnlTdHJpbmcuc3Vic3RyaW5nKCAxICk7XHJcbiAgICAgICAgICBjb25zdCBlbGVtZW50cyA9IHF1ZXJ5LnNwbGl0KCAnJicgKTtcclxuICAgICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudHNbIGkgXTtcclxuICAgICAgICAgICAgY29uc3Qga2V5QW5kTWF5YmVWYWx1ZSA9IGVsZW1lbnQuc3BsaXQoICc9JyApO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudEtleSA9IGRlY29kZVVSSUNvbXBvbmVudCgga2V5QW5kTWF5YmVWYWx1ZVsgMCBdICk7XHJcbiAgICAgICAgICAgIGlmICggZWxlbWVudEtleSAhPT0ga2V5ICkge1xyXG4gICAgICAgICAgICAgIG5ld1BhcmFtZXRlcnMucHVzaCggZWxlbWVudCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCBuZXdQYXJhbWV0ZXJzLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBgPyR7bmV3UGFyYW1ldGVycy5qb2luKCAnJicgKX1gO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gcXVlcnlTdHJpbmc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFJlbW92ZSBhbGwgdGhlIGtleXMgZnJvbSB0aGUgcXVlcnlTdHJpbmcgKG9rIGlmIHRoZXkgZG8gbm90IGFwcGVhciBhdCBhbGwpXHJcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBxdWVyeVN0cmluZ1xyXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBrZXlzXHJcbiAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgICAqIEBwdWJsaWNcclxuICAgICAgICovXHJcbiAgICAgIHJlbW92ZUtleVZhbHVlUGFpcnM6IGZ1bmN0aW9uKCBxdWVyeVN0cmluZywga2V5cyApIHtcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgcXVlcnlTdHJpbmcgPSB0aGlzLnJlbW92ZUtleVZhbHVlUGFpciggcXVlcnlTdHJpbmcsIGtleXNbIGkgXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcXVlcnlTdHJpbmc7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQXBwZW5kcyBhIHF1ZXJ5IHN0cmluZyB0byBhIGdpdmVuIHVybC5cclxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIG1heSBvciBtYXkgbm90IGFscmVhZHkgaGF2ZSBvdGhlciBxdWVyeSBwYXJhbWV0ZXJzXHJcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBxdWVyeVBhcmFtZXRlcnMgLSBtYXkgc3RhcnQgd2l0aCAnJywgJz8nIG9yICcmJ1xyXG4gICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICAgKiBAcHVibGljXHJcbiAgICAgICAqIEBzdGF0aWNcclxuICAgICAgICpcclxuICAgICAgICogQGV4YW1wbGVcclxuICAgICAgICogLy8gTGltaXQgdG8gdGhlIHNlY29uZCBzY3JlZW5cclxuICAgICAgICogc2ltVVJMID0gUXVlcnlTdHJpbmdNYWNoaW5lLmFwcGVuZFF1ZXJ5U3RyaW5nKCBzaW1VUkwsICdzY3JlZW5zPTInICk7XHJcbiAgICAgICAqL1xyXG4gICAgICBhcHBlbmRRdWVyeVN0cmluZzogZnVuY3Rpb24oIHVybCwgcXVlcnlQYXJhbWV0ZXJzICkge1xyXG4gICAgICAgIGlmICggcXVlcnlQYXJhbWV0ZXJzLmluZGV4T2YoICc/JyApID09PSAwIHx8IHF1ZXJ5UGFyYW1ldGVycy5pbmRleE9mKCAnJicgKSA9PT0gMCApIHtcclxuICAgICAgICAgIHF1ZXJ5UGFyYW1ldGVycyA9IHF1ZXJ5UGFyYW1ldGVycy5zdWJzdHJpbmcoIDEgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBxdWVyeVBhcmFtZXRlcnMubGVuZ3RoID09PSAwICkge1xyXG4gICAgICAgICAgcmV0dXJuIHVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgY29tYmluYXRpb24gPSB1cmwuaW5kZXhPZiggJz8nICkgPj0gMCA/ICcmJyA6ICc/JztcclxuICAgICAgICByZXR1cm4gdXJsICsgY29tYmluYXRpb24gKyBxdWVyeVBhcmFtZXRlcnM7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSGVscGVyIGZ1bmN0aW9uIGZvciBtdWx0aXBsZSBxdWVyeSBzdHJpbmdzXHJcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgLSBtYXkgb3IgbWF5IG5vdCBhbHJlYWR5IGhhdmUgb3RoZXIgcXVlcnkgcGFyYW1ldGVyc1xyXG4gICAgICAgKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBxdWVyeVN0cmluZ0FycmF5IC0gZWFjaCBpdGVtIG1heSBzdGFydCB3aXRoICcnLCAnPycsIG9yICcmJ1xyXG4gICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICAgKiBAcHVibGljXHJcbiAgICAgICAqIEBzdGF0aWNcclxuICAgICAgICpcclxuICAgICAgICogQGV4YW1wbGVcclxuICAgICAgICogc291cmNlRnJhbWUuc3JjID0gUXVlcnlTdHJpbmdNYWNoaW5lLmFwcGVuZFF1ZXJ5U3RyaW5nQXJyYXkoIHNpbVVSTCwgWyAnc2NyZWVucz0yJywgJ2ZyYW1lVGl0bGU9c291cmNlJyBdICk7XHJcbiAgICAgICAqL1xyXG4gICAgICBhcHBlbmRRdWVyeVN0cmluZ0FycmF5OiBmdW5jdGlvbiggdXJsLCBxdWVyeVN0cmluZ0FycmF5ICkge1xyXG5cclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBxdWVyeVN0cmluZ0FycmF5Lmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgdXJsID0gdGhpcy5hcHBlbmRRdWVyeVN0cmluZyggdXJsLCBxdWVyeVN0cmluZ0FycmF5WyBpIF0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVybDtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBSZXR1cm5zIHRoZSBxdWVyeSBzdHJpbmcgYXQgdGhlIGVuZCBvZiBhIHVybCwgb3IgJz8nIGlmIHRoZXJlIGlzIG5vbmUuXHJcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcclxuICAgICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAgICogQHB1YmxpY1xyXG4gICAgICAgKi9cclxuICAgICAgZ2V0UXVlcnlTdHJpbmc6IGZ1bmN0aW9uKCB1cmwgKSB7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSB1cmwuaW5kZXhPZiggJz8nICk7XHJcblxyXG4gICAgICAgIGlmICggaW5kZXggPj0gMCApIHtcclxuICAgICAgICAgIHJldHVybiB1cmwuc3Vic3RyaW5nKCBpbmRleCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiAnPyc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEFkZHMgYSB3YXJuaW5nIHRvIHRoZSBjb25zb2xlIGFuZCBRdWVyeVN0cmluZ01hY2hpbmUud2FybmluZ3MgdG8gaW5kaWNhdGUgdGhhdCB0aGUgcHJvdmlkZWQgaW52YWxpZCB2YWx1ZSB3aWxsXHJcbiAgICAgICAqIG5vdCBiZSB1c2VkLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXHJcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZSAtIHR5cGUgZGVwZW5kcyBvbiBzY2hlbWEgdHlwZVxyXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIHRoZSBtZXNzYWdlIHRoYXQgaW5kaWNhdGVzIHRoZSBwcm9ibGVtIHdpdGggdGhlIHZhbHVlXHJcbiAgICAgICAqIEBwdWJsaWNcclxuICAgICAgICovXHJcbiAgICAgIGFkZFdhcm5pbmc6IGZ1bmN0aW9uKCBrZXksIHZhbHVlLCBtZXNzYWdlICkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybiggbWVzc2FnZSApO1xyXG5cclxuICAgICAgICB0aGlzLndhcm5pbmdzLnB1c2goIHtcclxuICAgICAgICAgIGtleToga2V5LFxyXG4gICAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgbWVzc2FnZTogbWVzc2FnZVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBEZXRlcm1pbmVzIGlmIHRoZXJlIGlzIGEgd2FybmluZyBmb3IgYSBzcGVjaWZpZWQga2V5LlxyXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XHJcbiAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgKiBAcHVibGljXHJcbiAgICAgICAqL1xyXG4gICAgICBoYXNXYXJuaW5nOiBmdW5jdGlvbigga2V5ICkge1xyXG4gICAgICAgIGxldCBoYXNXYXJuaW5nID0gZmFsc2U7XHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy53YXJuaW5ncy5sZW5ndGggJiYgIWhhc1dhcm5pbmc7IGkrKyApIHtcclxuICAgICAgICAgIGhhc1dhcm5pbmcgPSAoIHRoaXMud2FybmluZ3NbIGkgXS5rZXkgPT09IGtleSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaGFzV2FybmluZztcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcXVlcnlTdHJpbmcgLSB0YWlsIG9mIGEgVVJMIGluY2x1ZGluZyB0aGUgYmVnaW5uaW5nICc/JyAoaWYgYW55KVxyXG4gICAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IC0gdGhlIHNwbGl0IHVwIHN0aWxsLVVSSS1lbmNvZGVkIHBhcmFtZXRlcnMgKHdpdGggdmFsdWVzIGlmIHByZXNlbnQpXHJcbiAgICAgICAqIEBwdWJsaWNcclxuICAgICAgICovXHJcbiAgICAgIGdldFF1ZXJ5UGFyYW1ldGVyc0Zyb21TdHJpbmc6IGZ1bmN0aW9uKCBxdWVyeVN0cmluZyApIHtcclxuICAgICAgICBpZiAoIHF1ZXJ5U3RyaW5nLmluZGV4T2YoICc/JyApID09PSAwICkge1xyXG4gICAgICAgICAgY29uc3QgcXVlcnkgPSBxdWVyeVN0cmluZy5zdWJzdHJpbmcoIDEgKTtcclxuICAgICAgICAgIHJldHVybiBxdWVyeS5zcGxpdCggJyYnICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBrZXkgdG8gcmV0dXJuIGlmIHByZXNlbnRcclxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyAtIGEgVVJMIGluY2x1ZGluZyBhIFwiP1wiIGlmIGl0IGhhcyBhIHF1ZXJ5IHN0cmluZ1xyXG4gICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfG51bGx9IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBhcyBpdCBhcHBlYXJzIGluIHRoZSBVUkwsIGxpa2UgYGtleT1WQUxVRWAsIG9yIG51bGwgaWYgbm90IHByZXNlbnRcclxuICAgICAgICogQHB1YmxpY1xyXG4gICAgICAgKi9cclxuICAgICAgZ2V0U2luZ2xlUXVlcnlQYXJhbWV0ZXJTdHJpbmc6IGZ1bmN0aW9uKCBrZXksIHN0cmluZyApIHtcclxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZyA9IHRoaXMuZ2V0UXVlcnlTdHJpbmcoIHN0cmluZyApO1xyXG4gICAgICAgIGNvbnN0IHF1ZXJ5UGFyYW1ldGVycyA9IHRoaXMuZ2V0UXVlcnlQYXJhbWV0ZXJzRnJvbVN0cmluZyggcXVlcnlTdHJpbmcgKTtcclxuXHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcXVlcnlQYXJhbWV0ZXJzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgY29uc3QgcXVlcnlQYXJhbWV0ZXIgPSBxdWVyeVBhcmFtZXRlcnNbIGkgXTtcclxuICAgICAgICAgIGNvbnN0IGtleUFuZE1heWJlVmFsdWUgPSBxdWVyeVBhcmFtZXRlci5zcGxpdCggJz0nICk7XHJcblxyXG4gICAgICAgICAgaWYgKCBkZWNvZGVVUklDb21wb25lbnQoIGtleUFuZE1heWJlVmFsdWVbIDAgXSApID09PSBrZXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBxdWVyeVBhcmFtZXRlcjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUXVlcnkgc3RyaW5ncyBtYXkgc2hvdyB0aGUgc2FtZSBrZXkgYXBwZWFyaW5nIG11bHRpcGxlIHRpbWVzLCBzdWNoIGFzID92YWx1ZT0yJnZhbHVlPTMuXHJcbiAgICAgKiBUaGlzIG1ldGhvZCByZWNvdmVycyBhbGwgb2YgdGhlIHN0cmluZyB2YWx1ZXMuICBGb3IgdGhpcyBleGFtcGxlLCBpdCB3b3VsZCBiZSBbJzInLCczJ10uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSAtIHRoZSBrZXkgZm9yIHdoaWNoIHdlIGFyZSBmaW5kaW5nIHZhbHVlcy5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSB0aGUgcGFyYW1ldGVycyBzdHJpbmdcclxuICAgICAqIEByZXR1cm5zIHtBcnJheS48c3RyaW5nfG51bGw+fSAtIHRoZSByZXN1bHRpbmcgdmFsdWVzLCBudWxsIGluZGljYXRlcyB0aGUgcXVlcnkgcGFyYW1ldGVyIGlzIHByZXNlbnQgd2l0aCBubyB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBjb25zdCBnZXRWYWx1ZXMgPSBmdW5jdGlvbigga2V5LCBzdHJpbmcgKSB7XHJcbiAgICAgIGNvbnN0IHZhbHVlcyA9IFtdO1xyXG4gICAgICBjb25zdCBwYXJhbXMgPSBzdHJpbmcuc2xpY2UoIDEgKS5zcGxpdCggJyYnICk7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBhcmFtcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBzcGxpdEJ5RXF1YWxzID0gcGFyYW1zWyBpIF0uc3BsaXQoICc9JyApO1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBzcGxpdEJ5RXF1YWxzWyAwIF07XHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSBzcGxpdEJ5RXF1YWxzLnNsaWNlKCAxICkuam9pbiggJz0nICk7IC8vIFN1cHBvcnQgYXJiaXRyYXJ5IG51bWJlciBvZiAnPScgaW4gdGhlIHZhbHVlXHJcbiAgICAgICAgaWYgKCBuYW1lID09PSBrZXkgKSB7XHJcbiAgICAgICAgICBpZiAoIHZhbHVlICkge1xyXG4gICAgICAgICAgICB2YWx1ZXMucHVzaCggZGVjb2RlVVJJQ29tcG9uZW50KCB2YWx1ZSApICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFsdWVzLnB1c2goIG51bGwgKTsgLy8gbm8gdmFsdWUgcHJvdmlkZWRcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHZhbHVlcztcclxuICAgIH07XHJcblxyXG4gICAgLy8gU2NoZW1hIHZhbGlkYXRpb24gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFZhbGlkYXRlcyB0aGUgc2NoZW1hIGZvciBhIHF1ZXJ5IHBhcmFtZXRlci5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzY2hlbWEgLSBzY2hlbWEgdGhhdCBkZXNjcmliZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciwgc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRcclxuICAgICAqL1xyXG4gICAgY29uc3QgdmFsaWRhdGVTY2hlbWEgPSBmdW5jdGlvbigga2V5LCBzY2hlbWEgKSB7XHJcblxyXG4gICAgICAvLyB0eXBlIGlzIHJlcXVpcmVkXHJcbiAgICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggc2NoZW1hLmhhc093blByb3BlcnR5KCAndHlwZScgKSwgYHR5cGUgZmllbGQgaXMgcmVxdWlyZWQgZm9yIGtleTogJHtrZXl9YCApO1xyXG5cclxuICAgICAgLy8gdHlwZSBpcyB2YWxpZFxyXG4gICAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIFRZUEVTLmhhc093blByb3BlcnR5KCBzY2hlbWEudHlwZSApLCBgaW52YWxpZCB0eXBlOiAke3NjaGVtYS50eXBlfSBmb3Iga2V5OiAke2tleX1gICk7XHJcblxyXG4gICAgICAvLyBwYXJzZSBpcyBhIGZ1bmN0aW9uXHJcbiAgICAgIGlmICggc2NoZW1hLmhhc093blByb3BlcnR5KCAncGFyc2UnICkgKSB7XHJcbiAgICAgICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCB0eXBlb2Ygc2NoZW1hLnBhcnNlID09PSAnZnVuY3Rpb24nLCBgcGFyc2UgbXVzdCBiZSBhIGZ1bmN0aW9uIGZvciBrZXk6ICR7a2V5fWAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdmFsaWRWYWx1ZXMgYW5kIGlzVmFsaWRWYWx1ZSBhcmUgb3B0aW9uYWwgYW5kIG11dHVhbGx5IGV4Y2x1c2l2ZVxyXG4gICAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoICEoIHNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ3ZhbGlkVmFsdWVzJyApICYmIHNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ2lzVmFsaWRWYWx1ZScgKSApLFxyXG4gICAgICAgIHNjaGVtYSwga2V5LCBgdmFsaWRWYWx1ZXMgYW5kIGlzVmFsaWRWYWx1ZSBhcmUgbXV0dWFsbHkgZXhjbHVzaXZlIGZvciBrZXk6ICR7a2V5fWAgKTtcclxuXHJcbiAgICAgIC8vIHZhbGlkVmFsdWVzIGlzIGFuIEFycmF5XHJcbiAgICAgIGlmICggc2NoZW1hLmhhc093blByb3BlcnR5KCAndmFsaWRWYWx1ZXMnICkgKSB7XHJcbiAgICAgICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBBcnJheS5pc0FycmF5KCBzY2hlbWEudmFsaWRWYWx1ZXMgKSwgYGlzVmFsaWRWYWx1ZSBtdXN0IGJlIGFuIGFycmF5IGZvciBrZXk6ICR7a2V5fWAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaXNWYWxpZFZhbHVlIGlzIGEgZnVuY3Rpb25cclxuICAgICAgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdpc1ZhbGlkVmFsdWUnICkgKSB7XHJcbiAgICAgICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCB0eXBlb2Ygc2NoZW1hLmlzVmFsaWRWYWx1ZSA9PT0gJ2Z1bmN0aW9uJywgYGlzVmFsaWRWYWx1ZSBtdXN0IGJlIGEgZnVuY3Rpb24gZm9yIGtleTogJHtrZXl9YCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBkZWZhdWx0VmFsdWUgaGFzIHRoZSBjb3JyZWN0IHR5cGVcclxuICAgICAgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdkZWZhdWx0VmFsdWUnICkgKSB7XHJcbiAgICAgICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBUWVBFU1sgc2NoZW1hLnR5cGUgXS5pc1ZhbGlkVmFsdWUoIHNjaGVtYS5kZWZhdWx0VmFsdWUgKSwgYGRlZmF1bHRWYWx1ZSBpbmNvcnJlY3QgdHlwZTogJHtrZXl9YCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB2YWxpZFZhbHVlcyBoYXZlIHRoZSBjb3JyZWN0IHR5cGVcclxuICAgICAgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICd2YWxpZFZhbHVlcycgKSApIHtcclxuICAgICAgICBzY2hlbWEudmFsaWRWYWx1ZXMuZm9yRWFjaCggdmFsdWUgPT4gcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBUWVBFU1sgc2NoZW1hLnR5cGUgXS5pc1ZhbGlkVmFsdWUoIHZhbHVlICksIGB2YWxpZFZhbHVlIGluY29ycmVjdCB0eXBlIGZvciBrZXk6ICR7a2V5fWAgKSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBkZWZhdWx0VmFsdWUgaXMgYSBtZW1iZXIgb2YgdmFsaWRWYWx1ZXNcclxuICAgICAgaWYgKCBzY2hlbWEuaGFzT3duUHJvcGVydHkoICdkZWZhdWx0VmFsdWUnICkgJiYgc2NoZW1hLmhhc093blByb3BlcnR5KCAndmFsaWRWYWx1ZXMnICkgKSB7XHJcbiAgICAgICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCBpc1ZhbGlkVmFsdWUoIHNjaGVtYS5kZWZhdWx0VmFsdWUsIHNjaGVtYS52YWxpZFZhbHVlcyApLCBzY2hlbWEsXHJcbiAgICAgICAgICBrZXksIGBkZWZhdWx0VmFsdWUgbXVzdCBiZSBhIG1lbWJlciBvZiB2YWxpZFZhbHVlcywgZm9yIGtleTogJHtrZXl9YCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBkZWZhdWx0VmFsdWUgbXVzdCBleGlzdCBmb3IgYSBwdWJsaWMgc2NoZW1hIHNvIHRoZXJlJ3MgYSBmYWxsYmFjayBpbiBjYXNlIGEgdXNlciBwcm92aWRlcyBhbiBpbnZhbGlkIHZhbHVlLlxyXG4gICAgICAvLyBIb3dldmVyLCBkZWZhdWx0VmFsdWUgaXMgbm90IHJlcXVpcmVkIGZvciBmbGFncyBzaW5jZSB0aGV5J3JlIG9ubHkgYSBrZXkuIFdoaWxlIG1hcmtpbmcgYSBmbGFnIGFzIHB1YmxpYzogdHJ1ZVxyXG4gICAgICAvLyBkb2Vzbid0IGNoYW5nZSBpdHMgYmVoYXZpb3IsIGl0J3MgYWxsb3dlZCBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlIHB1YmxpYyBrZXkgZm9yIGRvY3VtZW50YXRpb24sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVlcnktc3RyaW5nLW1hY2hpbmUvaXNzdWVzLzQxXHJcbiAgICAgIGlmICggc2NoZW1hLmhhc093blByb3BlcnR5KCAncHVibGljJyApICYmIHNjaGVtYS5wdWJsaWMgJiYgc2NoZW1hLnR5cGUgIT09ICdmbGFnJyApIHtcclxuICAgICAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIHNjaGVtYS5oYXNPd25Qcm9wZXJ0eSggJ2RlZmF1bHRWYWx1ZScgKSwgYGRlZmF1bHRWYWx1ZSBpcyByZXF1aXJlZCB3aGVuIHB1YmxpYzogdHJ1ZSBmb3Iga2V5OiAke2tleX1gICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHZlcmlmeSB0aGF0IHRoZSBzY2hlbWEgaGFzIGFwcHJvcHJpYXRlIHByb3BlcnRpZXNcclxuICAgICAgdmFsaWRhdGVTY2hlbWFQcm9wZXJ0aWVzKCBrZXksIHNjaGVtYSwgVFlQRVNbIHNjaGVtYS50eXBlIF0ucmVxdWlyZWQsIFRZUEVTWyBzY2hlbWEudHlwZSBdLm9wdGlvbmFsICk7XHJcblxyXG4gICAgICAvLyBkaXNwYXRjaCBmdXJ0aGVyIHZhbGlkYXRpb24gdG8gYW4gKG9wdGlvbmFsKSB0eXBlLXNwZWNpZmljIGZ1bmN0aW9uXHJcbiAgICAgIGlmICggVFlQRVNbIHNjaGVtYS50eXBlIF0udmFsaWRhdGVTY2hlbWEgKSB7XHJcbiAgICAgICAgVFlQRVNbIHNjaGVtYS50eXBlIF0udmFsaWRhdGVTY2hlbWEoIGtleSwgc2NoZW1hICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBWYWxpZGF0ZXMgc2NoZW1hIGZvciB0eXBlICdhcnJheScuXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc2NoZW1hIC0gc2NoZW1hIHRoYXQgZGVzY3JpYmVzIHRoZSBxdWVyeSBwYXJhbWV0ZXIsIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0XHJcbiAgICAgKi9cclxuICAgIGNvbnN0IHZhbGlkYXRlQXJyYXlTY2hlbWEgPSBmdW5jdGlvbigga2V5LCBzY2hlbWEgKSB7XHJcblxyXG4gICAgICAvLyBzZXBhcmF0b3IgaXMgYSBzaW5nbGUgY2hhcmFjdGVyXHJcbiAgICAgIGlmICggc2NoZW1hLmhhc093blByb3BlcnR5KCAnc2VwYXJhdG9yJyApICkge1xyXG4gICAgICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggdHlwZW9mIHNjaGVtYS5zZXBhcmF0b3IgPT09ICdzdHJpbmcnICYmIHNjaGVtYS5zZXBhcmF0b3IubGVuZ3RoID09PSAxLCBgaW52YWxpZCBzZXBhcmF0b3I6ICR7c2NoZW1hLnNlcGFyYXRvcn0sIGZvciBrZXk6ICR7a2V5fWAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcXVlcnlTdHJpbmdNYWNoaW5lQXNzZXJ0KCAhc2NoZW1hLmVsZW1lbnRTY2hlbWEuaGFzT3duUHJvcGVydHkoICdwdWJsaWMnICksICdBcnJheSBlbGVtZW50cyBzaG91bGQgbm90IGRlY2xhcmUgcHVibGljOyBpdCBjb21lcyBmcm9tIHRoZSBhcnJheSBzY2hlbWEgaXRzZWxmLicgKTtcclxuXHJcbiAgICAgIC8vIHZhbGlkYXRlIGVsZW1lbnRTY2hlbWFcclxuICAgICAgdmFsaWRhdGVTY2hlbWEoIGAke2tleX0uZWxlbWVudGAsIHNjaGVtYS5lbGVtZW50U2NoZW1hICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVmVyaWZpZXMgdGhhdCBhIHNjaGVtYSBjb250YWlucyBvbmx5IHN1cHBvcnRlZCBwcm9wZXJ0aWVzLCBhbmQgY29udGFpbnMgYWxsIHJlcXVpcmVkIHByb3BlcnRpZXMuXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IC0gdGhlIHF1ZXJ5IHBhcmFtZXRlciBuYW1lXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc2NoZW1hIC0gc2NoZW1hIHRoYXQgZGVzY3JpYmVzIHRoZSBxdWVyeSBwYXJhbWV0ZXIsIHNlZSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSByZXF1aXJlZFByb3BlcnRpZXMgLSBwcm9wZXJ0aWVzIHRoYXQgdGhlIHNjaGVtYSBtdXN0IGhhdmVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IG9wdGlvbmFsUHJvcGVydGllcyAtIHByb3BlcnRpZXMgdGhhdCB0aGUgc2NoZW1hIG1heSBvcHRpb25hbGx5IGhhdmVcclxuICAgICAqL1xyXG4gICAgY29uc3QgdmFsaWRhdGVTY2hlbWFQcm9wZXJ0aWVzID0gZnVuY3Rpb24oIGtleSwgc2NoZW1hLCByZXF1aXJlZFByb3BlcnRpZXMsIG9wdGlvbmFsUHJvcGVydGllcyApIHtcclxuXHJcbiAgICAgIC8vIHtzdHJpbmdbXX0sIHRoZSBuYW1lcyBvZiB0aGUgcHJvcGVydGllcyBpbiB0aGUgc2NoZW1hXHJcbiAgICAgIGNvbnN0IHNjaGVtYVByb3BlcnRpZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyggc2NoZW1hICk7XHJcblxyXG4gICAgICAvLyB2ZXJpZnkgdGhhdCBhbGwgcmVxdWlyZWQgcHJvcGVydGllcyBhcmUgcHJlc2VudFxyXG4gICAgICByZXF1aXJlZFByb3BlcnRpZXMuZm9yRWFjaCggcHJvcGVydHkgPT4ge1xyXG4gICAgICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggc2NoZW1hUHJvcGVydGllcy5pbmRleE9mKCBwcm9wZXJ0eSApICE9PSAtMSwgYG1pc3NpbmcgcmVxdWlyZWQgcHJvcGVydHk6ICR7cHJvcGVydHl9IGZvciBrZXk6ICR7a2V5fWAgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gdmVyaWZ5IHRoYXQgdGhlcmUgYXJlIG5vIHVuc3VwcG9ydGVkIHByb3BlcnRpZXNcclxuICAgICAgY29uc3Qgc3VwcG9ydGVkUHJvcGVydGllcyA9IHJlcXVpcmVkUHJvcGVydGllcy5jb25jYXQoIG9wdGlvbmFsUHJvcGVydGllcyApO1xyXG4gICAgICBzY2hlbWFQcm9wZXJ0aWVzLmZvckVhY2goIHByb3BlcnR5ID0+IHtcclxuICAgICAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIHByb3BlcnR5ID09PSAndHlwZScgfHwgc3VwcG9ydGVkUHJvcGVydGllcy5pbmRleE9mKCBwcm9wZXJ0eSApICE9PSAtMSwgYHVuc3VwcG9ydGVkIHByb3BlcnR5OiAke3Byb3BlcnR5fSBmb3Iga2V5OiAke2tleX1gICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gUGFyc2luZyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZXMgdGhlIHN1cHBsaWVkIHNjaGVtYSB0byBjb252ZXJ0IHF1ZXJ5IHBhcmFtZXRlciB2YWx1ZShzKSBmcm9tIHN0cmluZyB0byB0aGUgZGVzaXJlZCB2YWx1ZSB0eXBlLlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxyXG4gICAgICogQHBhcmFtIHtBcnJheS48c3RyaW5nfG51bGx8dW5kZWZpbmVkPn0gdmFsdWVzIC0gYW55IG1hdGNoZXMgZnJvbSB0aGUgcXVlcnkgc3RyaW5nLFxyXG4gICAgICogICBjb3VsZCBiZSBtdWx0aXBsZSBmb3IgP3ZhbHVlPXgmdmFsdWU9eSBmb3IgZXhhbXBsZVxyXG4gICAgICogQHJldHVybnMgeyp9IHRoZSBhc3NvY2lhdGVkIHZhbHVlLCBjb252ZXJ0ZWQgdG8gdGhlIHByb3BlciB0eXBlXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IHBhcnNlVmFsdWVzID0gZnVuY3Rpb24oIGtleSwgc2NoZW1hLCB2YWx1ZXMgKSB7XHJcbiAgICAgIGxldCByZXR1cm5WYWx1ZTtcclxuXHJcbiAgICAgIC8vIHZhbHVlcyBjb250YWlucyB2YWx1ZXMgZm9yIGFsbCBvY2N1cnJlbmNlcyBvZiB0aGUgcXVlcnkgcGFyYW1ldGVyLiAgV2UgY3VycmVudGx5IHN1cHBvcnQgb25seSAxIG9jY3VycmVuY2UuXHJcbiAgICAgIHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCggdmFsdWVzLmxlbmd0aCA8PSAxLCBgcXVlcnkgcGFyYW1ldGVyIGNhbm5vdCBvY2N1ciBtdWx0aXBsZSB0aW1lczogJHtrZXl9YCApO1xyXG5cclxuICAgICAgaWYgKCBzY2hlbWEudHlwZSA9PT0gJ2ZsYWcnICkge1xyXG5cclxuICAgICAgICAvLyBmbGFnIGlzIGEgY29udmVuaWVudCB2YXJpYXRpb24gb2YgYm9vbGVhbiwgd2hpY2ggZGVwZW5kcyBvbiB3aGV0aGVyIHRoZSBxdWVyeSBzdHJpbmcgaXMgcHJlc2VudCBvciBub3RcclxuICAgICAgICByZXR1cm5WYWx1ZSA9IFRZUEVTWyBzY2hlbWEudHlwZSBdLnBhcnNlKCBrZXksIHNjaGVtYSwgdmFsdWVzWyAwIF0gKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBxdWVyeVN0cmluZ01hY2hpbmVBc3NlcnQoIHZhbHVlc1sgMCBdICE9PSB1bmRlZmluZWQgfHwgc2NoZW1hLmhhc093blByb3BlcnR5KCAnZGVmYXVsdFZhbHVlJyApLFxyXG4gICAgICAgICAgYG1pc3NpbmcgcmVxdWlyZWQgcXVlcnkgcGFyYW1ldGVyOiAke2tleX1gICk7XHJcbiAgICAgICAgaWYgKCB2YWx1ZXNbIDAgXSA9PT0gdW5kZWZpbmVkICkge1xyXG5cclxuICAgICAgICAgIC8vIG5vdCBpbiB0aGUgcXVlcnkgc3RyaW5nLCB1c2UgdGhlIGRlZmF1bHRcclxuICAgICAgICAgIHJldHVyblZhbHVlID0gc2NoZW1hLmRlZmF1bHRWYWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gZGlzcGF0Y2ggcGFyc2luZyBvZiBxdWVyeSBzdHJpbmcgdG8gYSB0eXBlLXNwZWNpZmljIGZ1bmN0aW9uXHJcbiAgICAgICAgICByZXR1cm5WYWx1ZSA9IFRZUEVTWyBzY2hlbWEudHlwZSBdLnBhcnNlKCBrZXksIHNjaGVtYSwgdmFsdWVzWyAwIF0gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZXMgdGhlIHZhbHVlIGZvciBhIHR5cGUgJ2ZsYWcnLlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSAtIHRoZSBxdWVyeSBwYXJhbWV0ZXIgbmFtZVxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHNjaGVtYSAtIHNjaGVtYSB0aGF0IGRlc2NyaWJlcyB0aGUgcXVlcnkgcGFyYW1ldGVyLCBzZWUgUXVlcnlTdHJpbmdNYWNoaW5lLmdldFxyXG4gICAgICogQHBhcmFtIHtudWxsfHVuZGVmaW5lZHxzdHJpbmd9IHZhbHVlIC0gdmFsdWUgZnJvbSB0aGUgcXVlcnkgcGFyYW1ldGVyIHN0cmluZ1xyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW58c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBjb25zdCBwYXJzZUZsYWcgPSBmdW5jdGlvbigga2V5LCBzY2hlbWEsIHZhbHVlICkge1xyXG4gICAgICByZXR1cm4gdmFsdWUgPT09IG51bGwgPyB0cnVlIDogdmFsdWUgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogdmFsdWU7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGFyc2VzIHRoZSB2YWx1ZSBmb3IgYSB0eXBlICdib29sZWFuJy5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzY2hlbWEgLSBzY2hlbWEgdGhhdCBkZXNjcmliZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciwgc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG51bGx9IHN0cmluZyAtIHZhbHVlIGZyb20gdGhlIHF1ZXJ5IHBhcmFtZXRlciBzdHJpbmdcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufHN0cmluZ3xudWxsfVxyXG4gICAgICovXHJcbiAgICBjb25zdCBwYXJzZUJvb2xlYW4gPSBmdW5jdGlvbigga2V5LCBzY2hlbWEsIHN0cmluZyApIHtcclxuICAgICAgcmV0dXJuIHN0cmluZyA9PT0gJ3RydWUnID8gdHJ1ZSA6IHN0cmluZyA9PT0gJ2ZhbHNlJyA/IGZhbHNlIDogc3RyaW5nO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlcyB0aGUgdmFsdWUgZm9yIGEgdHlwZSAnbnVtYmVyJy5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzY2hlbWEgLSBzY2hlbWEgdGhhdCBkZXNjcmliZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciwgc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG51bGx9IHN0cmluZyAtIHZhbHVlIGZyb20gdGhlIHF1ZXJ5IHBhcmFtZXRlciBzdHJpbmdcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ8c3RyaW5nfG51bGx9XHJcbiAgICAgKi9cclxuICAgIGNvbnN0IHBhcnNlTnVtYmVyID0gZnVuY3Rpb24oIGtleSwgc2NoZW1hLCBzdHJpbmcgKSB7XHJcbiAgICAgIGNvbnN0IG51bWJlciA9IE51bWJlciggc3RyaW5nICk7XHJcbiAgICAgIHJldHVybiBzdHJpbmcgPT09IG51bGwgfHwgaXNOYU4oIG51bWJlciApID8gc3RyaW5nIDogbnVtYmVyO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlcyB0aGUgdmFsdWUgZm9yIGEgdHlwZSAnbnVtYmVyJy5cclxuICAgICAqIFRoZSB2YWx1ZSB0byBiZSBwYXJzZWQgaXMgYWxyZWFkeSBzdHJpbmcsIHNvIGl0IGlzIGd1YXJhbnRlZWQgdG8gcGFyc2UgYXMgYSBzdHJpbmcuXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc2NoZW1hXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xudWxsfSBzdHJpbmdcclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd8bnVsbH1cclxuICAgICAqL1xyXG4gICAgY29uc3QgcGFyc2VTdHJpbmcgPSBmdW5jdGlvbigga2V5LCBzY2hlbWEsIHN0cmluZyApIHtcclxuICAgICAgcmV0dXJuIHN0cmluZztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZXMgdGhlIHZhbHVlIGZvciBhIHR5cGUgJ2FycmF5Jy5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzY2hlbWEgLSBzY2hlbWEgdGhhdCBkZXNjcmliZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciwgc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG51bGx9IHZhbHVlIC0gdmFsdWUgZnJvbSB0aGUgcXVlcnkgcGFyYW1ldGVyIHN0cmluZ1xyXG4gICAgICogQHJldHVybnMge0FycmF5LjwqPnxudWxsfVxyXG4gICAgICovXHJcbiAgICBjb25zdCBwYXJzZUFycmF5ID0gZnVuY3Rpb24oIGtleSwgc2NoZW1hLCB2YWx1ZSApIHtcclxuXHJcbiAgICAgIGxldCByZXR1cm5WYWx1ZTtcclxuXHJcbiAgICAgIGlmICggdmFsdWUgPT09IG51bGwgKSB7XHJcblxyXG4gICAgICAgIC8vIG51bGwgc2lnbmlmaWVzIGFuIGVtcHR5IGFycmF5LiBGb3IgaW5zdGFuY2UgP3NjcmVlbnM9IHdvdWxkIGdpdmUgW11cclxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3F1ZXJ5LXN0cmluZy1tYWNoaW5lL2lzc3Vlcy8xN1xyXG4gICAgICAgIHJldHVyblZhbHVlID0gW107XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIFNwbGl0IHVwIHRoZSBzdHJpbmcgaW50byBhbiBhcnJheSBvZiB2YWx1ZXMuIEUuZy4gP3NjcmVlbnM9MSwyIHdvdWxkIGdpdmUgWzEsMl1cclxuICAgICAgICByZXR1cm5WYWx1ZSA9IHZhbHVlLnNwbGl0KCBzY2hlbWEuc2VwYXJhdG9yIHx8IERFRkFVTFRfU0VQQVJBVE9SIClcclxuICAgICAgICAgIC5tYXAoIGVsZW1lbnQgPT4gcGFyc2VWYWx1ZXMoIGtleSwgc2NoZW1hLmVsZW1lbnRTY2hlbWEsIFsgZWxlbWVudCBdICkgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlcyB0aGUgdmFsdWUgZm9yIGEgdHlwZSAnY3VzdG9tJy5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgLSB0aGUgcXVlcnkgcGFyYW1ldGVyIG5hbWVcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzY2hlbWEgLSBzY2hlbWEgdGhhdCBkZXNjcmliZXMgdGhlIHF1ZXJ5IHBhcmFtZXRlciwgc2VlIFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIHZhbHVlIGZyb20gdGhlIHF1ZXJ5IHBhcmFtZXRlciBzdHJpbmdcclxuICAgICAqIEByZXR1cm5zIHsqfVxyXG4gICAgICovXHJcbiAgICBjb25zdCBwYXJzZUN1c3RvbSA9IGZ1bmN0aW9uKCBrZXksIHNjaGVtYSwgdmFsdWUgKSB7XHJcbiAgICAgIHJldHVybiBzY2hlbWEucGFyc2UoIHZhbHVlICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFV0aWxpdGllcyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRlcm1pbmVzIGlmIHZhbHVlIGlzIGluIGEgc2V0IG9mIHZhbGlkIHZhbHVlcywgdXNlcyBkZWVwIGNvbXBhcmlzb24uXHJcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlXHJcbiAgICAgKiBAcGFyYW0ge0FycmF5LjwqPn0gdmFsaWRWYWx1ZXNcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBjb25zdCBpc1ZhbGlkVmFsdWUgPSBmdW5jdGlvbiggdmFsdWUsIHZhbGlkVmFsdWVzICkge1xyXG4gICAgICBsZXQgZm91bmQgPSBmYWxzZTtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdmFsaWRWYWx1ZXMubGVuZ3RoICYmICFmb3VuZDsgaSsrICkge1xyXG4gICAgICAgIGZvdW5kID0gUXVlcnlTdHJpbmdNYWNoaW5lLmRlZXBFcXVhbHMoIHZhbGlkVmFsdWVzWyBpIF0sIHZhbHVlICk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZvdW5kO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFF1ZXJ5IHBhcmFtZXRlcnMgYXJlIHNwZWNpZmllZCBieSB0aGUgdXNlciwgYW5kIGFyZSBvdXRzaWRlIHRoZSBjb250cm9sIG9mIHRoZSBwcm9ncmFtbWVyLlxyXG4gICAgICogU28gdGhlIGFwcGxpY2F0aW9uIHNob3VsZCB0aHJvdyBhbiBFcnJvciBpZiBxdWVyeSBwYXJhbWV0ZXJzIGFyZSBpbnZhbGlkLlxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBwcmVkaWNhdGUgLSBpZiBwcmVkaWNhdGUgZXZhbHVhdGVzIHRvIGZhbHNlLCBhbiBFcnJvciBpcyB0aHJvd25cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IHF1ZXJ5U3RyaW5nTWFjaGluZUFzc2VydCA9IGZ1bmN0aW9uKCBwcmVkaWNhdGUsIG1lc3NhZ2UgKSB7XHJcbiAgICAgIGlmICggIXByZWRpY2F0ZSApIHtcclxuICAgICAgICBjb25zb2xlICYmIGNvbnNvbGUubG9nICYmIGNvbnNvbGUubG9nKCBtZXNzYWdlICk7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgUXVlcnkgU3RyaW5nIE1hY2hpbmUgQXNzZXJ0aW9uIGZhaWxlZDogJHttZXNzYWdlfWAgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGF0YSBzdHJ1Y3R1cmUgdGhhdCBkZXNjcmliZXMgZWFjaCBxdWVyeSBwYXJhbWV0ZXIgdHlwZSwgd2hpY2ggcHJvcGVydGllcyBhcmUgcmVxdWlyZWQgdnMgb3B0aW9uYWwsXHJcbiAgICAgKiBob3cgdG8gdmFsaWRhdGUsIGFuZCBob3cgdG8gcGFyc2UuXHJcbiAgICAgKlxyXG4gICAgICogVGhlIHByb3BlcnRpZXMgdGhhdCBhcmUgcmVxdWlyZWQgb3Igb3B0aW9uYWwgZGVwZW5kIG9uIHRoZSB0eXBlIChzZWUgVFlQRVMpLCBhbmQgaW5jbHVkZTpcclxuICAgICAqIHR5cGUgLSB7c3RyaW5nfSB0aGUgdHlwZSBuYW1lXHJcbiAgICAgKiBkZWZhdWx0VmFsdWUgLSB0aGUgdmFsdWUgdG8gdXNlIGlmIG5vIHF1ZXJ5IHBhcmFtZXRlciBpcyBwcm92aWRlZC4gSWYgdGhlcmUgaXMgbm8gZGVmYXVsdFZhbHVlLCB0aGVuXHJcbiAgICAgKiAgICB0aGUgcXVlcnkgcGFyYW1ldGVyIGlzIHJlcXVpcmVkIGluIHRoZSBxdWVyeSBzdHJpbmc7IG9taXR0aW5nIHRoZSBxdWVyeSBwYXJhbWV0ZXIgd2lsbCByZXN1bHQgaW4gYW4gRXJyb3IuXHJcbiAgICAgKiB2YWxpZFZhbHVlcyAtIGFycmF5IG9mIHRoZSB2YWxpZCB2YWx1ZXMgZm9yIHRoZSBxdWVyeSBwYXJhbWV0ZXJcclxuICAgICAqIGlzVmFsaWRWYWx1ZSAtIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSBwYXJzZWQgT2JqZWN0IChub3Qgc3RyaW5nKSBhbmQgY2hlY2tzIGlmIGl0IGlzIGFjY2VwdGFibGVcclxuICAgICAqIGVsZW1lbnRTY2hlbWEgLSBzcGVjaWZpZXMgdGhlIHNjaGVtYSBmb3IgZWxlbWVudHMgaW4gYW4gYXJyYXlcclxuICAgICAqIHNlcGFyYXRvciAtICBhcnJheSBlbGVtZW50cyBhcmUgc2VwYXJhdGVkIGJ5IHRoaXMgc3RyaW5nLCBkZWZhdWx0cyB0byBgLGBcclxuICAgICAqIHBhcnNlIC0gYSBmdW5jdGlvbiB0aGF0IHRha2VzIGEgc3RyaW5nIGFuZCByZXR1cm5zIGFuIE9iamVjdFxyXG4gICAgICovXHJcbiAgICBjb25zdCBUWVBFUyA9IHtcclxuICAgICAgLy8gTk9URTogVHlwZXMgZm9yIHRoaXMgYXJlIGN1cnJlbnRseSBpbiBwaGV0LXR5cGVzLmQudHMhIENoYW5nZXMgaGVyZSBzaG91bGQgYmUgbWFkZSB0aGVyZSBhbHNvXHJcblxyXG4gICAgICAvLyB2YWx1ZSBpcyB0cnVlIGlmIHByZXNlbnQsIGZhbHNlIGlmIGFic2VudFxyXG4gICAgICBmbGFnOiB7XHJcbiAgICAgICAgcmVxdWlyZWQ6IFtdLFxyXG4gICAgICAgIG9wdGlvbmFsOiBbICdwcml2YXRlJywgJ3B1YmxpYycgXSxcclxuICAgICAgICB2YWxpZGF0ZVNjaGVtYTogbnVsbCwgLy8gbm8gdHlwZS1zcGVjaWZpYyBzY2hlbWEgdmFsaWRhdGlvblxyXG4gICAgICAgIHBhcnNlOiBwYXJzZUZsYWcsXHJcbiAgICAgICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiB2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gZmFsc2UsXHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB0cnVlIC8vIG9ubHkgbmVlZGVkIGZvciBmbGFncyBtYXJrcyBhcyAncHVibGljOiB0cnVlYFxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gdmFsdWUgaXMgZWl0aGVyIHRydWUgb3IgZmFsc2UsIGUuZy4gc2hvd0Fuc3dlcj10cnVlXHJcbiAgICAgIGJvb2xlYW46IHtcclxuICAgICAgICByZXF1aXJlZDogW10sXHJcbiAgICAgICAgb3B0aW9uYWw6IFsgJ2RlZmF1bHRWYWx1ZScsICdwcml2YXRlJywgJ3B1YmxpYycgXSxcclxuICAgICAgICB2YWxpZGF0ZVNjaGVtYTogbnVsbCwgLy8gbm8gdHlwZS1zcGVjaWZpYyBzY2hlbWEgdmFsaWRhdGlvblxyXG4gICAgICAgIHBhcnNlOiBwYXJzZUJvb2xlYW4sXHJcbiAgICAgICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiB2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gZmFsc2VcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIHZhbHVlIGlzIGEgbnVtYmVyLCBlLmcuIGZyYW1lUmF0ZT0xMDBcclxuICAgICAgbnVtYmVyOiB7XHJcbiAgICAgICAgcmVxdWlyZWQ6IFtdLFxyXG4gICAgICAgIG9wdGlvbmFsOiBbICdkZWZhdWx0VmFsdWUnLCAndmFsaWRWYWx1ZXMnLCAnaXNWYWxpZFZhbHVlJywgJ3ByaXZhdGUnLCAncHVibGljJyBdLFxyXG4gICAgICAgIHZhbGlkYXRlU2NoZW1hOiBudWxsLCAvLyBubyB0eXBlLXNwZWNpZmljIHNjaGVtYSB2YWxpZGF0aW9uXHJcbiAgICAgICAgcGFyc2U6IHBhcnNlTnVtYmVyLFxyXG4gICAgICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhaXNOYU4oIHZhbHVlIClcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIHZhbHVlIGlzIGEgc3RyaW5nLCBlLmcuIG5hbWU9UmluZ29cclxuICAgICAgc3RyaW5nOiB7XHJcbiAgICAgICAgcmVxdWlyZWQ6IFtdLFxyXG4gICAgICAgIG9wdGlvbmFsOiBbICdkZWZhdWx0VmFsdWUnLCAndmFsaWRWYWx1ZXMnLCAnaXNWYWxpZFZhbHVlJywgJ3ByaXZhdGUnLCAncHVibGljJyBdLFxyXG4gICAgICAgIHZhbGlkYXRlU2NoZW1hOiBudWxsLCAvLyBubyB0eXBlLXNwZWNpZmljIHNjaGVtYSB2YWxpZGF0aW9uXHJcbiAgICAgICAgcGFyc2U6IHBhcnNlU3RyaW5nLFxyXG4gICAgICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gdmFsdWUgPT09IG51bGwgfHwgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJ1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gdmFsdWUgaXMgYW4gYXJyYXksIGUuZy4gc2NyZWVucz0xLDIsM1xyXG4gICAgICBhcnJheToge1xyXG4gICAgICAgIHJlcXVpcmVkOiBbICdlbGVtZW50U2NoZW1hJyBdLFxyXG4gICAgICAgIG9wdGlvbmFsOiBbICdkZWZhdWx0VmFsdWUnLCAndmFsaWRWYWx1ZXMnLCAnaXNWYWxpZFZhbHVlJywgJ3NlcGFyYXRvcicsICd2YWxpZFZhbHVlcycsICdwcml2YXRlJywgJ3B1YmxpYycgXSxcclxuICAgICAgICB2YWxpZGF0ZVNjaGVtYTogdmFsaWRhdGVBcnJheVNjaGVtYSxcclxuICAgICAgICBwYXJzZTogcGFyc2VBcnJheSxcclxuICAgICAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IEFycmF5LmlzQXJyYXkoIHZhbHVlICkgfHwgdmFsdWUgPT09IG51bGxcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIHZhbHVlIGlzIGEgY3VzdG9tIGRhdGEgdHlwZSwgZS5nLiBjb2xvcj0yNTUsMCwyNTVcclxuICAgICAgY3VzdG9tOiB7XHJcbiAgICAgICAgcmVxdWlyZWQ6IFsgJ3BhcnNlJyBdLFxyXG4gICAgICAgIG9wdGlvbmFsOiBbICdkZWZhdWx0VmFsdWUnLCAndmFsaWRWYWx1ZXMnLCAnaXNWYWxpZFZhbHVlJywgJ3ByaXZhdGUnLCAncHVibGljJyBdLFxyXG4gICAgICAgIHZhbGlkYXRlU2NoZW1hOiBudWxsLCAvLyBubyB0eXBlLXNwZWNpZmljIHNjaGVtYSB2YWxpZGF0aW9uXHJcbiAgICAgICAgcGFyc2U6IHBhcnNlQ3VzdG9tLFxyXG4gICAgICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4ge1xyXG5cclxuICAgICAgICAgIC8vIFRPRE8gZG8gd2UgbmVlZCB0byBhZGQgYSBwcm9wZXJ0eSB0byAnY3VzdG9tJyBzY2hlbWEgdGhhdCBoYW5kbGVzIHZhbGlkYXRpb24gb2YgY3VzdG9tIHZhbHVlJ3MgdHlwZT8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWVyeS1zdHJpbmctbWFjaGluZS9pc3N1ZXMvMzVcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gUXVlcnlTdHJpbmdNYWNoaW5lO1xyXG4gIH0gKSgpO1xyXG59ICkgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFLFdBQVVBLElBQUksRUFBRUMsT0FBTyxFQUFHO0VBRTFCLElBQUssT0FBT0MsTUFBTSxDQUFDQyxNQUFNLEtBQUssVUFBVSxJQUFJRCxNQUFNLENBQUNDLE1BQU0sQ0FBQ0MsR0FBRyxFQUFHO0lBRTlEO0lBQ0FGLE1BQU0sQ0FBQ0MsTUFBTSxDQUFFLEVBQUUsRUFBRUYsT0FBUSxDQUFDO0VBQzlCLENBQUMsTUFDSSxJQUFLLE9BQU9JLE1BQU0sS0FBSyxRQUFRLElBQUlBLE1BQU0sQ0FBQ0MsT0FBTyxFQUFHO0lBRXZEO0lBQ0E7SUFDQTtJQUNBRCxNQUFNLENBQUNDLE9BQU8sR0FBR0wsT0FBTyxDQUFDLENBQUM7RUFDNUIs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