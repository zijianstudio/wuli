// Copyright 2019-2023, University of Colorado Boulder

/**
 * The definition file for "validators" used to validate values. This file holds associated logic that validates the
 * schema of the "validator" object, as well as testing if a value adheres to the restrictions provided by a validator.
 * See validate.js for usage with assertions to check that values are valid.
 *
 * Examples:
 *
 * A Validator that only accepts number values:
 * { valueType: 'number' }
 *
 * A Validator that only accepts the numbers "2" or "3":
 * { valueType: 'number', validValues: [ 2, 3 ] }
 *
 * A Validator that accepts any Object:
 * { valueType: Object }
 *
 * A Validator that accepts EnumerationDeprecated values (NOTE! This is deprecated, use the new class-based enumeration pattern as the valueType):
 * { valueType: MyEnumeration }
 * and/or
 * { validValues: MyEnumeration.VALUES }
 *
 * A Validator that accepts a string or a number greater than 2:
 * { isValidValue: value => { typeof value === 'string' || (typeof value === 'number' && value > 2)} }
 *
 * A Validator for a number that should be an even number greater than 10
 * { valueType: 'number', validators: [ { isValidValue: v => v > 10 }, { isValidValue: v => v%2 === 0 }] }
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../phet-core/js/EnumerationDeprecated.js';
import optionize from '../../phet-core/js/optionize.js';
import axon from './axon.js';
const TYPEOF_STRINGS = ['string', 'number', 'boolean', 'function'];

// eslint-disable-line @typescript-eslint/ban-types

// Key names are verbose so this can be mixed into other contexts like AXON/Property. `undefined` and `null` have the
// same semantics so that we can use this feature without having extend and allocate new objects at every validation.
const VALIDATOR_KEYS = ['valueType', 'validValues', 'valueComparisonStrategy', 'isValidValue', 'phetioType', 'validators'];
export default class Validation {
  /**
   * @returns an error string if incorrect, otherwise null if valid
   */
  static getValidatorValidationError(validator) {
    if (!(validator instanceof Object)) {
      // There won't be a validationMessage on a non-object
      return 'validator must be an Object';
    }
    if (!(validator.hasOwnProperty('isValidValue') || validator.hasOwnProperty('valueType') || validator.hasOwnProperty('validValues') || validator.hasOwnProperty('valueComparisonStrategy') || validator.hasOwnProperty('phetioType') || validator.hasOwnProperty('validators'))) {
      return this.combineErrorMessages(`validator must have at least one of: ${VALIDATOR_KEYS.join(',')}`, validator.validationMessage);
    }
    if (validator.hasOwnProperty('valueType')) {
      const valueTypeValidationError = Validation.getValueOrElementTypeValidationError(validator.valueType);
      if (valueTypeValidationError) {
        return this.combineErrorMessages(`Invalid valueType: ${validator.valueType}, error: ${valueTypeValidationError}`, validator.validationMessage);
      }
    }
    if (validator.hasOwnProperty('isValidValue')) {
      if (!(typeof validator.isValidValue === 'function' || validator.isValidValue === null || validator.isValidValue === undefined)) {
        return this.combineErrorMessages(`isValidValue must be a function: ${validator.isValidValue}`, validator.validationMessage);
      }
    }
    if (validator.hasOwnProperty('valueComparisonStrategy')) {
      // Only accepted values are below
      if (!(validator.valueComparisonStrategy === 'reference' || validator.valueComparisonStrategy === 'lodashDeep' || validator.valueComparisonStrategy === 'equalsFunction' || typeof validator.isValidValue === 'function')) {
        return this.combineErrorMessages(`valueComparisonStrategy must be "reference", "lodashDeep", 
        "equalsFunction", or a comparison function: ${validator.valueComparisonStrategy}`, validator.validationMessage);
      }
    }
    if (validator.validValues !== undefined && validator.validValues !== null) {
      if (!Array.isArray(validator.validValues)) {
        return this.combineErrorMessages(`validValues must be an array: ${validator.validValues}`, validator.validationMessage);
      }

      // Make sure each validValue matches the other rules, if any.
      const validatorWithoutValidValues = _.omit(validator, 'validValues');
      if (Validation.containsValidatorKey(validatorWithoutValidValues)) {
        for (let i = 0; i < validator.validValues.length; i++) {
          const validValue = validator.validValues[i];
          const validValueValidationError = Validation.getValidationError(validValue, validatorWithoutValidValues);
          if (validValueValidationError) {
            return this.combineErrorMessages(`Item not valid in validValues: ${validValue}, error: ${validValueValidationError}`, validator.validationMessage);
          }
        }
      }
    }
    if (validator.hasOwnProperty('phetioType')) {
      if (!validator.phetioType) {
        return this.combineErrorMessages('falsey phetioType provided', validator.validationMessage);
      }
      if (!validator.phetioType.validator) {
        return this.combineErrorMessages(`validator needed for phetioType: ${validator.phetioType.typeName}`, validator.validationMessage);
      }
      const phetioTypeValidationError = Validation.getValidatorValidationError(validator.phetioType.validator);
      if (phetioTypeValidationError) {
        return this.combineErrorMessages(phetioTypeValidationError, validator.validationMessage);
      }
    }
    if (validator.hasOwnProperty('validators')) {
      const validators = validator.validators;
      for (let i = 0; i < validators.length; i++) {
        const subValidator = validators[i];
        const subValidationError = Validation.getValidatorValidationError(subValidator);
        if (subValidationError) {
          return this.combineErrorMessages(`validators[${i}] invalid: ${subValidationError}`, validator.validationMessage);
        }
      }
    }
    return null;
  }

  /**
   * Validate that the valueType is of the expected format. Does not add validationMessage to any error it reports.
   * @returns - null if valid
   */
  static getValueTypeValidatorValidationError(valueType) {
    if (!(typeof valueType === 'function' || typeof valueType === 'string' || valueType instanceof EnumerationDeprecated || valueType === null || valueType === undefined)) {
      return `valueType must be {function|string|EnumerationDeprecated|null|undefined}, valueType=${valueType}`;
    }

    // {string} valueType must be one of the primitives in TYPEOF_STRINGS, for typeof comparison
    if (typeof valueType === 'string') {
      if (!_.includes(TYPEOF_STRINGS, valueType)) {
        return `valueType not a supported primitive types: ${valueType}`;
      }
    }
    return null;
  }
  static validateValidator(validator) {
    if (assert) {
      const error = Validation.getValidatorValidationError(validator);
      error && assert(false, error);
    }
  }

  /**
   * @param validator - object which may or may not contain validation keys
   */
  static containsValidatorKey(validator) {
    if (!(validator instanceof Object)) {
      return false;
    }
    for (let i = 0; i < VALIDATOR_KEYS.length; i++) {
      if (validator.hasOwnProperty(VALIDATOR_KEYS[i])) {
        return true;
      }
    }
    return false;
  }
  static combineErrorMessages(genericMessage, specificMessage) {
    if (specificMessage) {
      genericMessage = `${specificMessage}: ${genericMessage}`;
    }
    return genericMessage;
  }
  static isValueValid(value, validator, providedOptions) {
    return this.getValidationError(value, validator, providedOptions) === null;
  }

  /**
   * Determines whether a value is valid (returning a boolean value), returning the problem as a string if invalid,
   * otherwise returning null when valid.
   */
  static getValidationError(value, validator, providedOptions) {
    const options = optionize()({
      validateValidator: true
    }, providedOptions);
    if (options.validateValidator) {
      const validatorValidationError = Validation.getValidatorValidationError(validator);
      if (validatorValidationError) {
        return validatorValidationError;
      }
    }

    // Check valueType, which can be an array, string, type, or null
    if (validator.hasOwnProperty('valueType')) {
      const valueType = validator.valueType;
      if (Array.isArray(valueType)) {
        // Only one should be valid, so error out if none of them returned valid (valid=null)
        if (!_.some(valueType.map(typeInArray => !Validation.getValueTypeValidationError(value, typeInArray, validator.validationMessage)))) {
          return this.combineErrorMessages(`value not valid for any valueType in ${valueType.toString().substring(0, 100)}, value: ${value}`, validator.validationMessage);
        }
      } else if (valueType) {
        const valueTypeValidationError = Validation.getValueTypeValidationError(value, valueType, validator.validationMessage);
        if (valueTypeValidationError) {
          // getValueTypeValidationError will add the validationMessage for us
          return valueTypeValidationError;
        }
      }
    }
    if (validator.validValues) {
      const valueComparisonStrategy = validator.valueComparisonStrategy || 'reference';
      const valueValid = validator.validValues.some(validValue => {
        if (valueComparisonStrategy === 'reference') {
          return validValue === value;
        }
        if (valueComparisonStrategy === 'equalsFunction') {
          const validComparable = validValue;
          assert && assert(!!validComparable.equals, 'no equals function for 1st arg');
          assert && assert(!!value.equals, 'no equals function for 2nd arg');
          assert && assert(validComparable.equals(value) === value.equals(validComparable), 'incompatible equality checks');
          return validComparable.equals(value);
        }
        if (valueComparisonStrategy === 'lodashDeep') {
          return _.isEqual(validValue, value);
        } else {
          return valueComparisonStrategy(validValue, value);
        }
      });
      if (!valueValid) {
        return this.combineErrorMessages(`value not in validValues: ${value}`, validator.validationMessage);
      }
    }
    if (validator.hasOwnProperty('isValidValue') && !validator.isValidValue(value)) {
      return this.combineErrorMessages(`value failed isValidValue: ${value}`, validator.validationMessage);
    }
    if (validator.hasOwnProperty('phetioType')) {
      const phetioTypeValidationError = Validation.getValidationError(value, validator.phetioType.validator, options);
      if (phetioTypeValidationError) {
        return this.combineErrorMessages(`value failed phetioType validator: ${value}, error: ${phetioTypeValidationError}`, validator.validationMessage);
      }
    }
    if (validator.hasOwnProperty('validators')) {
      const validators = validator.validators;
      for (let i = 0; i < validators.length; i++) {
        const subValidator = validators[i];
        const subValidationError = Validation.getValidationError(value, subValidator, options);
        if (subValidationError) {
          return this.combineErrorMessages(`Failed validation for validators[${i}]: ${subValidationError}`, validator.validationMessage);
        }
      }
    }
    return null;
  }
  static getValueTypeValidationError(value, valueType, message) {
    if (typeof valueType === 'string' && typeof value !== valueType) {
      // primitive type
      return this.combineErrorMessages(`value should have typeof ${valueType}, value=${value}`, message);
    } else if (valueType === Array && !Array.isArray(value)) {
      return this.combineErrorMessages(`value should have been an array, value=${value}`, message);
    } else if (valueType instanceof EnumerationDeprecated && !valueType.includes(value)) {
      return this.combineErrorMessages(`value is not a member of EnumerationDeprecated ${valueType}`, message);
    } else if (typeof valueType === 'function' && !(value instanceof valueType)) {
      // constructor
      return this.combineErrorMessages(`value should be instanceof ${valueType.name}, value=${value}`, message);
    }
    if (valueType === null && value !== null) {
      return this.combineErrorMessages(`value should be null, value=${value}`, message);
    }
    return null;
  }

  /**
   * Validate a type that can be a type, or an array of multiple types. Does not add validationMessage to any error
   * it reports
   */
  static getValueOrElementTypeValidationError(type) {
    if (Array.isArray(type)) {
      // If not every type in the list is valid, then return false, pass options through verbatim.
      for (let i = 0; i < type.length; i++) {
        const typeElement = type[i];
        const error = Validation.getValueTypeValidatorValidationError(typeElement);
        if (error) {
          return `Array value invalid: ${error}`;
        }
      }
    } else if (type) {
      const error = Validation.getValueTypeValidatorValidationError(type);
      if (error) {
        return `Value type invalid: ${error}`;
      }
    }
    return null;
  }
  static VALIDATOR_KEYS = VALIDATOR_KEYS;

  /**
   * General validator for validating that a string doesn't have template variables in it.
   */
  static STRING_WITHOUT_TEMPLATE_VARS_VALIDATOR = {
    valueType: 'string',
    isValidValue: v => !/\{\{\w*\}\}/.test(v)
  };
}
axon.register('Validation', Validation);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbkRlcHJlY2F0ZWQiLCJvcHRpb25pemUiLCJheG9uIiwiVFlQRU9GX1NUUklOR1MiLCJWQUxJREFUT1JfS0VZUyIsIlZhbGlkYXRpb24iLCJnZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IiLCJ2YWxpZGF0b3IiLCJPYmplY3QiLCJoYXNPd25Qcm9wZXJ0eSIsImNvbWJpbmVFcnJvck1lc3NhZ2VzIiwiam9pbiIsInZhbGlkYXRpb25NZXNzYWdlIiwidmFsdWVUeXBlVmFsaWRhdGlvbkVycm9yIiwiZ2V0VmFsdWVPckVsZW1lbnRUeXBlVmFsaWRhdGlvbkVycm9yIiwidmFsdWVUeXBlIiwiaXNWYWxpZFZhbHVlIiwidW5kZWZpbmVkIiwidmFsdWVDb21wYXJpc29uU3RyYXRlZ3kiLCJ2YWxpZFZhbHVlcyIsIkFycmF5IiwiaXNBcnJheSIsInZhbGlkYXRvcldpdGhvdXRWYWxpZFZhbHVlcyIsIl8iLCJvbWl0IiwiY29udGFpbnNWYWxpZGF0b3JLZXkiLCJpIiwibGVuZ3RoIiwidmFsaWRWYWx1ZSIsInZhbGlkVmFsdWVWYWxpZGF0aW9uRXJyb3IiLCJnZXRWYWxpZGF0aW9uRXJyb3IiLCJwaGV0aW9UeXBlIiwidHlwZU5hbWUiLCJwaGV0aW9UeXBlVmFsaWRhdGlvbkVycm9yIiwidmFsaWRhdG9ycyIsInN1YlZhbGlkYXRvciIsInN1YlZhbGlkYXRpb25FcnJvciIsImdldFZhbHVlVHlwZVZhbGlkYXRvclZhbGlkYXRpb25FcnJvciIsImluY2x1ZGVzIiwidmFsaWRhdGVWYWxpZGF0b3IiLCJhc3NlcnQiLCJlcnJvciIsImdlbmVyaWNNZXNzYWdlIiwic3BlY2lmaWNNZXNzYWdlIiwiaXNWYWx1ZVZhbGlkIiwidmFsdWUiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwidmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yIiwic29tZSIsIm1hcCIsInR5cGVJbkFycmF5IiwiZ2V0VmFsdWVUeXBlVmFsaWRhdGlvbkVycm9yIiwidG9TdHJpbmciLCJzdWJzdHJpbmciLCJ2YWx1ZVZhbGlkIiwidmFsaWRDb21wYXJhYmxlIiwiZXF1YWxzIiwiaXNFcXVhbCIsIm1lc3NhZ2UiLCJuYW1lIiwidHlwZSIsInR5cGVFbGVtZW50IiwiU1RSSU5HX1dJVEhPVVRfVEVNUExBVEVfVkFSU19WQUxJREFUT1IiLCJ2IiwidGVzdCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVmFsaWRhdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgZGVmaW5pdGlvbiBmaWxlIGZvciBcInZhbGlkYXRvcnNcIiB1c2VkIHRvIHZhbGlkYXRlIHZhbHVlcy4gVGhpcyBmaWxlIGhvbGRzIGFzc29jaWF0ZWQgbG9naWMgdGhhdCB2YWxpZGF0ZXMgdGhlXHJcbiAqIHNjaGVtYSBvZiB0aGUgXCJ2YWxpZGF0b3JcIiBvYmplY3QsIGFzIHdlbGwgYXMgdGVzdGluZyBpZiBhIHZhbHVlIGFkaGVyZXMgdG8gdGhlIHJlc3RyaWN0aW9ucyBwcm92aWRlZCBieSBhIHZhbGlkYXRvci5cclxuICogU2VlIHZhbGlkYXRlLmpzIGZvciB1c2FnZSB3aXRoIGFzc2VydGlvbnMgdG8gY2hlY2sgdGhhdCB2YWx1ZXMgYXJlIHZhbGlkLlxyXG4gKlxyXG4gKiBFeGFtcGxlczpcclxuICpcclxuICogQSBWYWxpZGF0b3IgdGhhdCBvbmx5IGFjY2VwdHMgbnVtYmVyIHZhbHVlczpcclxuICogeyB2YWx1ZVR5cGU6ICdudW1iZXInIH1cclxuICpcclxuICogQSBWYWxpZGF0b3IgdGhhdCBvbmx5IGFjY2VwdHMgdGhlIG51bWJlcnMgXCIyXCIgb3IgXCIzXCI6XHJcbiAqIHsgdmFsdWVUeXBlOiAnbnVtYmVyJywgdmFsaWRWYWx1ZXM6IFsgMiwgMyBdIH1cclxuICpcclxuICogQSBWYWxpZGF0b3IgdGhhdCBhY2NlcHRzIGFueSBPYmplY3Q6XHJcbiAqIHsgdmFsdWVUeXBlOiBPYmplY3QgfVxyXG4gKlxyXG4gKiBBIFZhbGlkYXRvciB0aGF0IGFjY2VwdHMgRW51bWVyYXRpb25EZXByZWNhdGVkIHZhbHVlcyAoTk9URSEgVGhpcyBpcyBkZXByZWNhdGVkLCB1c2UgdGhlIG5ldyBjbGFzcy1iYXNlZCBlbnVtZXJhdGlvbiBwYXR0ZXJuIGFzIHRoZSB2YWx1ZVR5cGUpOlxyXG4gKiB7IHZhbHVlVHlwZTogTXlFbnVtZXJhdGlvbiB9XHJcbiAqIGFuZC9vclxyXG4gKiB7IHZhbGlkVmFsdWVzOiBNeUVudW1lcmF0aW9uLlZBTFVFUyB9XHJcbiAqXHJcbiAqIEEgVmFsaWRhdG9yIHRoYXQgYWNjZXB0cyBhIHN0cmluZyBvciBhIG51bWJlciBncmVhdGVyIHRoYW4gMjpcclxuICogeyBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IHsgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiB2YWx1ZSA+IDIpfSB9XHJcbiAqXHJcbiAqIEEgVmFsaWRhdG9yIGZvciBhIG51bWJlciB0aGF0IHNob3VsZCBiZSBhbiBldmVuIG51bWJlciBncmVhdGVyIHRoYW4gMTBcclxuICogeyB2YWx1ZVR5cGU6ICdudW1iZXInLCB2YWxpZGF0b3JzOiBbIHsgaXNWYWxpZFZhbHVlOiB2ID0+IHYgPiAxMCB9LCB7IGlzVmFsaWRWYWx1ZTogdiA9PiB2JTIgPT09IDAgfV0gfVxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uRGVwcmVjYXRlZCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25EZXByZWNhdGVkLmpzJztcclxuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBheG9uIGZyb20gJy4vYXhvbi5qcyc7XHJcbmltcG9ydCB7IENvbXBhcmFibGVPYmplY3QgfSBmcm9tICcuL1RpbnlQcm9wZXJ0eS5qcyc7XHJcblxyXG5jb25zdCBUWVBFT0ZfU1RSSU5HUyA9IFsgJ3N0cmluZycsICdudW1iZXInLCAnYm9vbGVhbicsICdmdW5jdGlvbicgXTtcclxuXHJcbmV4cG9ydCB0eXBlIElzVmFsaWRWYWx1ZU9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIEJ5IGRlZmF1bHQgdmFsaWRhdGlvbiB3aWxsIGFsd2F5cyBjaGVjayB0aGUgdmFsaWRpdHkgb2YgdGhlICB2YWxpZGF0b3IgaXRzZWxmLiAgSG93ZXZlciwgZm9yIHR5cGVzIGxpa2VcclxuICAvLyBQcm9wZXJ0eSBhbmQgRW1pdHRlciByZS1jaGVja2luZyB0aGUgdmFsaWRhdG9yIGV2ZXJ5IHRpbWUgdGhlIFByb3BlcnR5IHZhbHVlIGNoYW5nZXMgb3IgdGhlIEVtaXR0ZXIgZW1pdHNcclxuICAvLyB3YXN0ZXMgY3B1LiBIZW5jZSBjYXNlcyBsaWtlIHRob3NlIGNhbiBvcHQtb3V0XHJcbiAgdmFsaWRhdGVWYWxpZGF0b3I/OiBib29sZWFuO1xyXG59O1xyXG5cclxudHlwZSBWYWx1ZVR5cGUgPVxyXG4gIHN0cmluZyB8XHJcbiAgRW51bWVyYXRpb25EZXByZWNhdGVkIHxcclxuICBudWxsIHxcclxuICBWYWx1ZVR5cGVbXSB8XHJcblxyXG4gIC8vIGFsbG93IEZ1bmN0aW9uIGhlcmUgc2luY2UgaXQgaXMgdGhlIGFwcHJvcHJpYXRlIGxldmVsIG9mIGFic3RyYWN0aW9uIGZvciBjaGVja2luZyBpbnN0YW5jZW9mXHJcbiAgRnVuY3Rpb247IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10eXBlc1xyXG5cclxudHlwZSBWYWx1ZUNvbXBhcmlzb25TdHJhdGVneTxUID0gdW5rbm93bj4gPSAnZXF1YWxzRnVuY3Rpb24nIHwgJ3JlZmVyZW5jZScgfCAnbG9kYXNoRGVlcCcgfCAoICggYTogVCwgYjogVCApID0+IGJvb2xlYW4gKTtcclxuXHJcbmV4cG9ydCB0eXBlIFZhbGlkYXRvcjxUID0gdW5rbm93bj4gPSB7XHJcblxyXG4gIC8vIFR5cGUgb2YgdGhlIHZhbHVlLlxyXG4gIC8vIElmIHtmdW5jdGlvbn0sIHRoZSBmdW5jdGlvbiBtdXN0IGJlIGEgY29uc3RydWN0b3IuXHJcbiAgLy8gSWYge3N0cmluZ30sIHRoZSBzdHJpbmcgbXVzdCBiZSBvbmUgb2YgdGhlIHByaW1pdGl2ZSB0eXBlcyBsaXN0ZWQgaW4gVFlQRU9GX1NUUklOR1MuXHJcbiAgLy8gSWYge251bGx8dW5kZWZpbmVkfSwgdGhlIHZhbHVlIG11c3QgYmUgbnVsbCAod2hpY2ggZG9lc24ndCBtYWtlIHNlbnNlIHVudGlsIHRoZSBuZXh0IGxpbmUgb2YgZG9jKVxyXG4gIC8vIElmIHtBcnJheS48c3RyaW5nfGZ1bmN0aW9ufG51bGx8dW5kZWZpbmVkPn0sIGVhY2ggaXRlbSBtdXN0IGJlIGEgbGVnYWwgdmFsdWUgYXMgZXhwbGFpbmVkIGluIHRoZSBhYm92ZSBkb2NcclxuICAvLyBVbnVzZWQgaWYgbnVsbC5cclxuICAvLyBFeGFtcGxlczpcclxuICAvLyB2YWx1ZVR5cGU6IFZlY3RvcjJcclxuICAvLyB2YWx1ZVR5cGU6ICdzdHJpbmcnXHJcbiAgLy8gdmFsdWVUeXBlOiAnbnVtYmVyJyxcclxuICAvLyB2YWx1ZVR5cGU6IFsgJ251bWJlcicsIG51bGwgXVxyXG4gIC8vIHZhbHVlVHlwZTogWyAnbnVtYmVyJywgJ3N0cmluZycsIE5vZGUsIG51bGwgXVxyXG4gIHZhbHVlVHlwZT86IFZhbHVlVHlwZSB8IFZhbHVlVHlwZVtdO1xyXG5cclxuICAvLyBWYWxpZCB2YWx1ZXMgZm9yIHRoaXMgUHJvcGVydHkuIFVudXNlZCBpZiBudWxsLlxyXG4gIC8vIEV4YW1wbGU6XHJcbiAgLy8gdmFsaWRWYWx1ZXM6IFsgJ2hvcml6b250YWwnLCAndmVydGljYWwnIF1cclxuICB2YWxpZFZhbHVlcz86IHJlYWRvbmx5IFRbXTtcclxuXHJcbiAgLy8gZXF1YWxzRnVuY3Rpb24gLT4gbXVzdCBoYXZlIC5lcXVhbHMoKSBmdW5jdGlvbiBvbiB0aGUgdHlwZSBUXHJcbiAgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k/OiBWYWx1ZUNvbXBhcmlzb25TdHJhdGVneTxUPjtcclxuXHJcbiAgLy8gRnVuY3Rpb24gdGhhdCB2YWxpZGF0ZXMgdGhlIHZhbHVlLiBTaW5nbGUgYXJndW1lbnQgaXMgdGhlIHZhbHVlLCByZXR1cm5zIGJvb2xlYW4uIFVudXNlZCBpZiBudWxsLlxyXG4gIC8vIEV4YW1wbGU6XHJcbiAgLy8gaXNWYWxpZFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7IHJldHVybiBOdW1iZXIuaXNJbnRlZ2VyKCB2YWx1ZSApICYmIHZhbHVlID49IDA7IH1cclxuICBpc1ZhbGlkVmFsdWU/OiAoIHY6IFQgKSA9PiBib29sZWFuO1xyXG5cclxuICAvLyBBIElPVHlwZSB1c2VkIHRvIHNwZWNpZnkgdGhlIHB1YmxpYyB0eXBpbmcgZm9yIFBoRVQtaU8uIEVhY2ggSU9UeXBlIG11c3QgaGF2ZSBhXHJcbiAgLy8gYHZhbGlkYXRvcmAga2V5IHNwZWNpZmllZCB0aGF0IGNhbiBiZSB1c2VkIGZvciB2YWxpZGF0aW9uLiBTZWUgSU9UeXBlIGZvciBhbiBleGFtcGxlLlxyXG4gIHBoZXRpb1R5cGU/OiBJT1R5cGU7XHJcblxyXG4gIC8vIGlmIHByb3ZpZGVkLCB0aGlzIHdpbGwgcHJvdmlkZSBzdXBwbGVtZW50YWwgaW5mb3JtYXRpb24gdG8gdGhlIGFzc2VydGlvbi92YWxpZGF0aW9uIG1lc3NhZ2VzIGluIGFkZGl0aW9uIHRvIHRoZVxyXG4gIC8vIHZhbGlkYXRlLWtleS1zcGVjaWZpYyBtZXNzYWdlIHRoYXQgd2lsbCBiZSBnaXZlbi5cclxuICB2YWxpZGF0aW9uTWVzc2FnZT86IHN0cmluZztcclxuXHJcbiAgLy8gQSBsaXN0IG9mIFZhbGlkYXRvciBvYmplY3RzLCBlYWNoIG9mIHdoaWNoIG11c3QgcGFzcyB0byBiZSBhIHZhbGlkIHZhbHVlXHJcbiAgdmFsaWRhdG9ycz86IFZhbGlkYXRvcjxUPltdO1xyXG59O1xyXG5cclxuLy8gS2V5IG5hbWVzIGFyZSB2ZXJib3NlIHNvIHRoaXMgY2FuIGJlIG1peGVkIGludG8gb3RoZXIgY29udGV4dHMgbGlrZSBBWE9OL1Byb3BlcnR5LiBgdW5kZWZpbmVkYCBhbmQgYG51bGxgIGhhdmUgdGhlXHJcbi8vIHNhbWUgc2VtYW50aWNzIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGlzIGZlYXR1cmUgd2l0aG91dCBoYXZpbmcgZXh0ZW5kIGFuZCBhbGxvY2F0ZSBuZXcgb2JqZWN0cyBhdCBldmVyeSB2YWxpZGF0aW9uLlxyXG5jb25zdCBWQUxJREFUT1JfS0VZUzogQXJyYXk8a2V5b2YgVmFsaWRhdG9yPiA9IFtcclxuICAndmFsdWVUeXBlJyxcclxuICAndmFsaWRWYWx1ZXMnLFxyXG4gICd2YWx1ZUNvbXBhcmlzb25TdHJhdGVneScsXHJcbiAgJ2lzVmFsaWRWYWx1ZScsXHJcbiAgJ3BoZXRpb1R5cGUnLFxyXG4gICd2YWxpZGF0b3JzJ1xyXG5dO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmFsaWRhdGlvbiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIGFuIGVycm9yIHN0cmluZyBpZiBpbmNvcnJlY3QsIG90aGVyd2lzZSBudWxsIGlmIHZhbGlkXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBnZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3I8VD4oIHZhbGlkYXRvcjogVmFsaWRhdG9yPFQ+ICk6IHN0cmluZyB8IG51bGwge1xyXG5cclxuICAgIGlmICggISggdmFsaWRhdG9yIGluc3RhbmNlb2YgT2JqZWN0ICkgKSB7XHJcblxyXG4gICAgICAvLyBUaGVyZSB3b24ndCBiZSBhIHZhbGlkYXRpb25NZXNzYWdlIG9uIGEgbm9uLW9iamVjdFxyXG4gICAgICByZXR1cm4gJ3ZhbGlkYXRvciBtdXN0IGJlIGFuIE9iamVjdCc7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCAhKCB2YWxpZGF0b3IuaGFzT3duUHJvcGVydHkoICdpc1ZhbGlkVmFsdWUnICkgfHxcclxuICAgICAgICAgICAgdmFsaWRhdG9yLmhhc093blByb3BlcnR5KCAndmFsdWVUeXBlJyApIHx8XHJcbiAgICAgICAgICAgIHZhbGlkYXRvci5oYXNPd25Qcm9wZXJ0eSggJ3ZhbGlkVmFsdWVzJyApIHx8XHJcbiAgICAgICAgICAgIHZhbGlkYXRvci5oYXNPd25Qcm9wZXJ0eSggJ3ZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5JyApIHx8XHJcbiAgICAgICAgICAgIHZhbGlkYXRvci5oYXNPd25Qcm9wZXJ0eSggJ3BoZXRpb1R5cGUnICkgfHxcclxuICAgICAgICAgICAgdmFsaWRhdG9yLmhhc093blByb3BlcnR5KCAndmFsaWRhdG9ycycgKSApICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5jb21iaW5lRXJyb3JNZXNzYWdlcyggYHZhbGlkYXRvciBtdXN0IGhhdmUgYXQgbGVhc3Qgb25lIG9mOiAke1ZBTElEQVRPUl9LRVlTLmpvaW4oICcsJyApfWAsIHZhbGlkYXRvci52YWxpZGF0aW9uTWVzc2FnZSApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggdmFsaWRhdG9yLmhhc093blByb3BlcnR5KCAndmFsdWVUeXBlJyApICkge1xyXG4gICAgICBjb25zdCB2YWx1ZVR5cGVWYWxpZGF0aW9uRXJyb3IgPSBWYWxpZGF0aW9uLmdldFZhbHVlT3JFbGVtZW50VHlwZVZhbGlkYXRpb25FcnJvciggdmFsaWRhdG9yLnZhbHVlVHlwZSEgKTtcclxuICAgICAgaWYgKCB2YWx1ZVR5cGVWYWxpZGF0aW9uRXJyb3IgKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tYmluZUVycm9yTWVzc2FnZXMoXHJcbiAgICAgICAgICBgSW52YWxpZCB2YWx1ZVR5cGU6ICR7dmFsaWRhdG9yLnZhbHVlVHlwZX0sIGVycm9yOiAke3ZhbHVlVHlwZVZhbGlkYXRpb25FcnJvcn1gLFxyXG4gICAgICAgICAgdmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHZhbGlkYXRvci5oYXNPd25Qcm9wZXJ0eSggJ2lzVmFsaWRWYWx1ZScgKSApIHtcclxuICAgICAgaWYgKCAhKCB0eXBlb2YgdmFsaWRhdG9yLmlzVmFsaWRWYWx1ZSA9PT0gJ2Z1bmN0aW9uJyB8fFxyXG4gICAgICAgICAgICAgIHZhbGlkYXRvci5pc1ZhbGlkVmFsdWUgPT09IG51bGwgfHxcclxuICAgICAgICAgICAgICB2YWxpZGF0b3IuaXNWYWxpZFZhbHVlID09PSB1bmRlZmluZWQgKSApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb21iaW5lRXJyb3JNZXNzYWdlcyggYGlzVmFsaWRWYWx1ZSBtdXN0IGJlIGEgZnVuY3Rpb246ICR7dmFsaWRhdG9yLmlzVmFsaWRWYWx1ZX1gLFxyXG4gICAgICAgICAgdmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHZhbGlkYXRvci5oYXNPd25Qcm9wZXJ0eSggJ3ZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5JyApICkge1xyXG5cclxuICAgICAgLy8gT25seSBhY2NlcHRlZCB2YWx1ZXMgYXJlIGJlbG93XHJcbiAgICAgIGlmICggISggdmFsaWRhdG9yLnZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5ID09PSAncmVmZXJlbmNlJyB8fFxyXG4gICAgICAgICAgICAgIHZhbGlkYXRvci52YWx1ZUNvbXBhcmlzb25TdHJhdGVneSA9PT0gJ2xvZGFzaERlZXAnIHx8XHJcbiAgICAgICAgICAgICAgdmFsaWRhdG9yLnZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5ID09PSAnZXF1YWxzRnVuY3Rpb24nIHx8XHJcbiAgICAgICAgICAgICAgdHlwZW9mIHZhbGlkYXRvci5pc1ZhbGlkVmFsdWUgPT09ICdmdW5jdGlvbicgKSApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb21iaW5lRXJyb3JNZXNzYWdlcyggYHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5IG11c3QgYmUgXCJyZWZlcmVuY2VcIiwgXCJsb2Rhc2hEZWVwXCIsIFxyXG4gICAgICAgIFwiZXF1YWxzRnVuY3Rpb25cIiwgb3IgYSBjb21wYXJpc29uIGZ1bmN0aW9uOiAke3ZhbGlkYXRvci52YWx1ZUNvbXBhcmlzb25TdHJhdGVneX1gLFxyXG4gICAgICAgICAgdmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHZhbGlkYXRvci52YWxpZFZhbHVlcyAhPT0gdW5kZWZpbmVkICYmIHZhbGlkYXRvci52YWxpZFZhbHVlcyAhPT0gbnVsbCApIHtcclxuICAgICAgaWYgKCAhQXJyYXkuaXNBcnJheSggdmFsaWRhdG9yLnZhbGlkVmFsdWVzICkgKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tYmluZUVycm9yTWVzc2FnZXMoIGB2YWxpZFZhbHVlcyBtdXN0IGJlIGFuIGFycmF5OiAke3ZhbGlkYXRvci52YWxpZFZhbHVlc31gLFxyXG4gICAgICAgICAgdmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE1ha2Ugc3VyZSBlYWNoIHZhbGlkVmFsdWUgbWF0Y2hlcyB0aGUgb3RoZXIgcnVsZXMsIGlmIGFueS5cclxuICAgICAgY29uc3QgdmFsaWRhdG9yV2l0aG91dFZhbGlkVmFsdWVzID0gXy5vbWl0KCB2YWxpZGF0b3IsICd2YWxpZFZhbHVlcycgKTtcclxuICAgICAgaWYgKCBWYWxpZGF0aW9uLmNvbnRhaW5zVmFsaWRhdG9yS2V5KCB2YWxpZGF0b3JXaXRob3V0VmFsaWRWYWx1ZXMgKSApIHtcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB2YWxpZGF0b3IudmFsaWRWYWx1ZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgICBjb25zdCB2YWxpZFZhbHVlID0gdmFsaWRhdG9yLnZhbGlkVmFsdWVzWyBpIF07XHJcbiAgICAgICAgICBjb25zdCB2YWxpZFZhbHVlVmFsaWRhdGlvbkVycm9yID0gVmFsaWRhdGlvbi5nZXRWYWxpZGF0aW9uRXJyb3IoIHZhbGlkVmFsdWUsIHZhbGlkYXRvcldpdGhvdXRWYWxpZFZhbHVlcyApO1xyXG4gICAgICAgICAgaWYgKCB2YWxpZFZhbHVlVmFsaWRhdGlvbkVycm9yICkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21iaW5lRXJyb3JNZXNzYWdlcyhcclxuICAgICAgICAgICAgICBgSXRlbSBub3QgdmFsaWQgaW4gdmFsaWRWYWx1ZXM6ICR7dmFsaWRWYWx1ZX0sIGVycm9yOiAke3ZhbGlkVmFsdWVWYWxpZGF0aW9uRXJyb3J9YCwgdmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB2YWxpZGF0b3IuaGFzT3duUHJvcGVydHkoICdwaGV0aW9UeXBlJyApICkge1xyXG4gICAgICBpZiAoICF2YWxpZGF0b3IucGhldGlvVHlwZSApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb21iaW5lRXJyb3JNZXNzYWdlcyggJ2ZhbHNleSBwaGV0aW9UeXBlIHByb3ZpZGVkJywgdmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCAhdmFsaWRhdG9yLnBoZXRpb1R5cGUudmFsaWRhdG9yICkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbWJpbmVFcnJvck1lc3NhZ2VzKCBgdmFsaWRhdG9yIG5lZWRlZCBmb3IgcGhldGlvVHlwZTogJHt2YWxpZGF0b3IucGhldGlvVHlwZS50eXBlTmFtZX1gLFxyXG4gICAgICAgICAgdmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHBoZXRpb1R5cGVWYWxpZGF0aW9uRXJyb3IgPSBWYWxpZGF0aW9uLmdldFZhbGlkYXRvclZhbGlkYXRpb25FcnJvciggdmFsaWRhdG9yLnBoZXRpb1R5cGUudmFsaWRhdG9yICk7XHJcbiAgICAgIGlmICggcGhldGlvVHlwZVZhbGlkYXRpb25FcnJvciApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb21iaW5lRXJyb3JNZXNzYWdlcyggcGhldGlvVHlwZVZhbGlkYXRpb25FcnJvciwgdmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHZhbGlkYXRvci5oYXNPd25Qcm9wZXJ0eSggJ3ZhbGlkYXRvcnMnICkgKSB7XHJcbiAgICAgIGNvbnN0IHZhbGlkYXRvcnMgPSB2YWxpZGF0b3IudmFsaWRhdG9ycyE7XHJcblxyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB2YWxpZGF0b3JzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IHN1YlZhbGlkYXRvciA9IHZhbGlkYXRvcnNbIGkgXTtcclxuICAgICAgICBjb25zdCBzdWJWYWxpZGF0aW9uRXJyb3IgPSBWYWxpZGF0aW9uLmdldFZhbGlkYXRvclZhbGlkYXRpb25FcnJvciggc3ViVmFsaWRhdG9yICk7XHJcbiAgICAgICAgaWYgKCBzdWJWYWxpZGF0aW9uRXJyb3IgKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb21iaW5lRXJyb3JNZXNzYWdlcyggYHZhbGlkYXRvcnNbJHtpfV0gaW52YWxpZDogJHtzdWJWYWxpZGF0aW9uRXJyb3J9YCwgdmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBWYWxpZGF0ZSB0aGF0IHRoZSB2YWx1ZVR5cGUgaXMgb2YgdGhlIGV4cGVjdGVkIGZvcm1hdC4gRG9lcyBub3QgYWRkIHZhbGlkYXRpb25NZXNzYWdlIHRvIGFueSBlcnJvciBpdCByZXBvcnRzLlxyXG4gICAqIEByZXR1cm5zIC0gbnVsbCBpZiB2YWxpZFxyXG4gICAqL1xyXG4gIHByaXZhdGUgc3RhdGljIGdldFZhbHVlVHlwZVZhbGlkYXRvclZhbGlkYXRpb25FcnJvciggdmFsdWVUeXBlOiBWYWx1ZVR5cGUgKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICBpZiAoICEoIHR5cGVvZiB2YWx1ZVR5cGUgPT09ICdmdW5jdGlvbicgfHxcclxuICAgICAgICAgICAgdHlwZW9mIHZhbHVlVHlwZSA9PT0gJ3N0cmluZycgfHxcclxuICAgICAgICAgICAgdmFsdWVUeXBlIGluc3RhbmNlb2YgRW51bWVyYXRpb25EZXByZWNhdGVkIHx8XHJcbiAgICAgICAgICAgIHZhbHVlVHlwZSA9PT0gbnVsbCB8fFxyXG4gICAgICAgICAgICB2YWx1ZVR5cGUgPT09IHVuZGVmaW5lZCApICkge1xyXG4gICAgICByZXR1cm4gYHZhbHVlVHlwZSBtdXN0IGJlIHtmdW5jdGlvbnxzdHJpbmd8RW51bWVyYXRpb25EZXByZWNhdGVkfG51bGx8dW5kZWZpbmVkfSwgdmFsdWVUeXBlPSR7dmFsdWVUeXBlfWA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8ge3N0cmluZ30gdmFsdWVUeXBlIG11c3QgYmUgb25lIG9mIHRoZSBwcmltaXRpdmVzIGluIFRZUEVPRl9TVFJJTkdTLCBmb3IgdHlwZW9mIGNvbXBhcmlzb25cclxuICAgIGlmICggdHlwZW9mIHZhbHVlVHlwZSA9PT0gJ3N0cmluZycgKSB7XHJcbiAgICAgIGlmICggIV8uaW5jbHVkZXMoIFRZUEVPRl9TVFJJTkdTLCB2YWx1ZVR5cGUgKSApIHtcclxuICAgICAgICByZXR1cm4gYHZhbHVlVHlwZSBub3QgYSBzdXBwb3J0ZWQgcHJpbWl0aXZlIHR5cGVzOiAke3ZhbHVlVHlwZX1gO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgdmFsaWRhdGVWYWxpZGF0b3I8VD4oIHZhbGlkYXRvcjogVmFsaWRhdG9yPFQ+ICk6IHZvaWQge1xyXG4gICAgaWYgKCBhc3NlcnQgKSB7XHJcbiAgICAgIGNvbnN0IGVycm9yID0gVmFsaWRhdGlvbi5nZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IoIHZhbGlkYXRvciApO1xyXG4gICAgICBlcnJvciAmJiBhc3NlcnQoIGZhbHNlLCBlcnJvciApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHZhbGlkYXRvciAtIG9iamVjdCB3aGljaCBtYXkgb3IgbWF5IG5vdCBjb250YWluIHZhbGlkYXRpb24ga2V5c1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY29udGFpbnNWYWxpZGF0b3JLZXkoIHZhbGlkYXRvcjogSW50ZW50aW9uYWxBbnkgKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoICEoIHZhbGlkYXRvciBpbnN0YW5jZW9mIE9iamVjdCApICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBWQUxJREFUT1JfS0VZUy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCB2YWxpZGF0b3IuaGFzT3duUHJvcGVydHkoIFZBTElEQVRPUl9LRVlTWyBpIF0gKSApIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzdGF0aWMgY29tYmluZUVycm9yTWVzc2FnZXMoIGdlbmVyaWNNZXNzYWdlOiBzdHJpbmcsIHNwZWNpZmljTWVzc2FnZT86IHN0cmluZyApOiBzdHJpbmcge1xyXG4gICAgaWYgKCBzcGVjaWZpY01lc3NhZ2UgKSB7XHJcbiAgICAgIGdlbmVyaWNNZXNzYWdlID0gYCR7c3BlY2lmaWNNZXNzYWdlfTogJHtnZW5lcmljTWVzc2FnZX1gO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGdlbmVyaWNNZXNzYWdlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyBpc1ZhbHVlVmFsaWQ8VD4oIHZhbHVlOiBULCB2YWxpZGF0b3I6IFZhbGlkYXRvcjxUPiwgcHJvdmlkZWRPcHRpb25zPzogSXNWYWxpZFZhbHVlT3B0aW9ucyApOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmdldFZhbGlkYXRpb25FcnJvciggdmFsdWUsIHZhbGlkYXRvciwgcHJvdmlkZWRPcHRpb25zICkgPT09IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSB2YWx1ZSBpcyB2YWxpZCAocmV0dXJuaW5nIGEgYm9vbGVhbiB2YWx1ZSksIHJldHVybmluZyB0aGUgcHJvYmxlbSBhcyBhIHN0cmluZyBpZiBpbnZhbGlkLFxyXG4gICAqIG90aGVyd2lzZSByZXR1cm5pbmcgbnVsbCB3aGVuIHZhbGlkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgZ2V0VmFsaWRhdGlvbkVycm9yPFQ+KCB2YWx1ZTogSW50ZW50aW9uYWxBbnksIHZhbGlkYXRvcjogVmFsaWRhdG9yPFQ+LCBwcm92aWRlZE9wdGlvbnM/OiBJc1ZhbGlkVmFsdWVPcHRpb25zICk6IHN0cmluZyB8IG51bGwge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8SXNWYWxpZFZhbHVlT3B0aW9ucz4oKSgge1xyXG4gICAgICB2YWxpZGF0ZVZhbGlkYXRvcjogdHJ1ZVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgaWYgKCBvcHRpb25zLnZhbGlkYXRlVmFsaWRhdG9yICkge1xyXG4gICAgICBjb25zdCB2YWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IgPSBWYWxpZGF0aW9uLmdldFZhbGlkYXRvclZhbGlkYXRpb25FcnJvciggdmFsaWRhdG9yICk7XHJcbiAgICAgIGlmICggdmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yICkge1xyXG4gICAgICAgIHJldHVybiB2YWxpZGF0b3JWYWxpZGF0aW9uRXJyb3I7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayB2YWx1ZVR5cGUsIHdoaWNoIGNhbiBiZSBhbiBhcnJheSwgc3RyaW5nLCB0eXBlLCBvciBudWxsXHJcbiAgICBpZiAoIHZhbGlkYXRvci5oYXNPd25Qcm9wZXJ0eSggJ3ZhbHVlVHlwZScgKSApIHtcclxuICAgICAgY29uc3QgdmFsdWVUeXBlID0gdmFsaWRhdG9yLnZhbHVlVHlwZTtcclxuICAgICAgaWYgKCBBcnJheS5pc0FycmF5KCB2YWx1ZVR5cGUgKSApIHtcclxuXHJcbiAgICAgICAgLy8gT25seSBvbmUgc2hvdWxkIGJlIHZhbGlkLCBzbyBlcnJvciBvdXQgaWYgbm9uZSBvZiB0aGVtIHJldHVybmVkIHZhbGlkICh2YWxpZD1udWxsKVxyXG4gICAgICAgIGlmICggIV8uc29tZSggdmFsdWVUeXBlLm1hcCggKCB0eXBlSW5BcnJheTogVmFsdWVUeXBlICkgPT4gIVZhbGlkYXRpb24uZ2V0VmFsdWVUeXBlVmFsaWRhdGlvbkVycm9yKCB2YWx1ZSwgdHlwZUluQXJyYXksIHZhbGlkYXRvci52YWxpZGF0aW9uTWVzc2FnZSApICkgKSApIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLmNvbWJpbmVFcnJvck1lc3NhZ2VzKFxyXG4gICAgICAgICAgICBgdmFsdWUgbm90IHZhbGlkIGZvciBhbnkgdmFsdWVUeXBlIGluICR7dmFsdWVUeXBlLnRvU3RyaW5nKCkuc3Vic3RyaW5nKCAwLCAxMDAgKX0sIHZhbHVlOiAke3ZhbHVlfWAsXHJcbiAgICAgICAgICAgIHZhbGlkYXRvci52YWxpZGF0aW9uTWVzc2FnZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggdmFsdWVUeXBlICkge1xyXG5cclxuICAgICAgICBjb25zdCB2YWx1ZVR5cGVWYWxpZGF0aW9uRXJyb3IgPSBWYWxpZGF0aW9uLmdldFZhbHVlVHlwZVZhbGlkYXRpb25FcnJvciggdmFsdWUsIHZhbHVlVHlwZSwgdmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlICk7XHJcbiAgICAgICAgaWYgKCB2YWx1ZVR5cGVWYWxpZGF0aW9uRXJyb3IgKSB7XHJcblxyXG4gICAgICAgICAgLy8gZ2V0VmFsdWVUeXBlVmFsaWRhdGlvbkVycm9yIHdpbGwgYWRkIHRoZSB2YWxpZGF0aW9uTWVzc2FnZSBmb3IgdXNcclxuICAgICAgICAgIHJldHVybiB2YWx1ZVR5cGVWYWxpZGF0aW9uRXJyb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB2YWxpZGF0b3IudmFsaWRWYWx1ZXMgKSB7XHJcblxyXG4gICAgICBjb25zdCB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneTogVmFsdWVDb21wYXJpc29uU3RyYXRlZ3k8VD4gPSB2YWxpZGF0b3IudmFsdWVDb21wYXJpc29uU3RyYXRlZ3kgfHwgJ3JlZmVyZW5jZSc7XHJcbiAgICAgIGNvbnN0IHZhbHVlVmFsaWQgPSB2YWxpZGF0b3IudmFsaWRWYWx1ZXMuc29tZSggdmFsaWRWYWx1ZSA9PiB7XHJcblxyXG4gICAgICAgIGlmICggdmFsdWVDb21wYXJpc29uU3RyYXRlZ3kgPT09ICdyZWZlcmVuY2UnICkge1xyXG4gICAgICAgICAgcmV0dXJuIHZhbGlkVmFsdWUgPT09IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5ID09PSAnZXF1YWxzRnVuY3Rpb24nICkge1xyXG4gICAgICAgICAgY29uc3QgdmFsaWRDb21wYXJhYmxlID0gdmFsaWRWYWx1ZSBhcyBDb21wYXJhYmxlT2JqZWN0O1xyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggISF2YWxpZENvbXBhcmFibGUuZXF1YWxzLCAnbm8gZXF1YWxzIGZ1bmN0aW9uIGZvciAxc3QgYXJnJyApO1xyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggISF2YWx1ZS5lcXVhbHMsICdubyBlcXVhbHMgZnVuY3Rpb24gZm9yIDJuZCBhcmcnICk7XHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2YWxpZENvbXBhcmFibGUuZXF1YWxzKCB2YWx1ZSApID09PSB2YWx1ZS5lcXVhbHMoIHZhbGlkQ29tcGFyYWJsZSApLCAnaW5jb21wYXRpYmxlIGVxdWFsaXR5IGNoZWNrcycgKTtcclxuXHJcbiAgICAgICAgICByZXR1cm4gdmFsaWRDb21wYXJhYmxlLmVxdWFscyggdmFsdWUgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneSA9PT0gJ2xvZGFzaERlZXAnICkge1xyXG4gICAgICAgICAgcmV0dXJuIF8uaXNFcXVhbCggdmFsaWRWYWx1ZSwgdmFsdWUgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gdmFsdWVDb21wYXJpc29uU3RyYXRlZ3koIHZhbGlkVmFsdWUsIHZhbHVlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBpZiAoICF2YWx1ZVZhbGlkICkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbWJpbmVFcnJvck1lc3NhZ2VzKCBgdmFsdWUgbm90IGluIHZhbGlkVmFsdWVzOiAke3ZhbHVlfWAsIHZhbGlkYXRvci52YWxpZGF0aW9uTWVzc2FnZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoIHZhbGlkYXRvci5oYXNPd25Qcm9wZXJ0eSggJ2lzVmFsaWRWYWx1ZScgKSAmJiAhdmFsaWRhdG9yLmlzVmFsaWRWYWx1ZSEoIHZhbHVlICkgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNvbWJpbmVFcnJvck1lc3NhZ2VzKCBgdmFsdWUgZmFpbGVkIGlzVmFsaWRWYWx1ZTogJHt2YWx1ZX1gLCB2YWxpZGF0b3IudmFsaWRhdGlvbk1lc3NhZ2UgKTtcclxuICAgIH1cclxuICAgIGlmICggdmFsaWRhdG9yLmhhc093blByb3BlcnR5KCAncGhldGlvVHlwZScgKSApIHtcclxuXHJcbiAgICAgIGNvbnN0IHBoZXRpb1R5cGVWYWxpZGF0aW9uRXJyb3IgPSBWYWxpZGF0aW9uLmdldFZhbGlkYXRpb25FcnJvciggdmFsdWUsIHZhbGlkYXRvci5waGV0aW9UeXBlIS52YWxpZGF0b3IsIG9wdGlvbnMgKTtcclxuICAgICAgaWYgKCBwaGV0aW9UeXBlVmFsaWRhdGlvbkVycm9yICkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbWJpbmVFcnJvck1lc3NhZ2VzKCBgdmFsdWUgZmFpbGVkIHBoZXRpb1R5cGUgdmFsaWRhdG9yOiAke3ZhbHVlfSwgZXJyb3I6ICR7cGhldGlvVHlwZVZhbGlkYXRpb25FcnJvcn1gLCB2YWxpZGF0b3IudmFsaWRhdGlvbk1lc3NhZ2UgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICggdmFsaWRhdG9yLmhhc093blByb3BlcnR5KCAndmFsaWRhdG9ycycgKSApIHtcclxuICAgICAgY29uc3QgdmFsaWRhdG9ycyA9IHZhbGlkYXRvci52YWxpZGF0b3JzITtcclxuXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHZhbGlkYXRvcnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3Qgc3ViVmFsaWRhdG9yID0gdmFsaWRhdG9yc1sgaSBdO1xyXG4gICAgICAgIGNvbnN0IHN1YlZhbGlkYXRpb25FcnJvciA9IFZhbGlkYXRpb24uZ2V0VmFsaWRhdGlvbkVycm9yKCB2YWx1ZSwgc3ViVmFsaWRhdG9yLCBvcHRpb25zICk7XHJcbiAgICAgICAgaWYgKCBzdWJWYWxpZGF0aW9uRXJyb3IgKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb21iaW5lRXJyb3JNZXNzYWdlcyggYEZhaWxlZCB2YWxpZGF0aW9uIGZvciB2YWxpZGF0b3JzWyR7aX1dOiAke3N1YlZhbGlkYXRpb25FcnJvcn1gLCB2YWxpZGF0b3IudmFsaWRhdGlvbk1lc3NhZ2UgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc3RhdGljIGdldFZhbHVlVHlwZVZhbGlkYXRpb25FcnJvciggdmFsdWU6IEludGVudGlvbmFsQW55LCB2YWx1ZVR5cGU6IFZhbHVlVHlwZSwgbWVzc2FnZT86IHN0cmluZyApOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIGlmICggdHlwZW9mIHZhbHVlVHlwZSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIHZhbHVlICE9PSB2YWx1ZVR5cGUgKSB7IC8vIHByaW1pdGl2ZSB0eXBlXHJcbiAgICAgIHJldHVybiB0aGlzLmNvbWJpbmVFcnJvck1lc3NhZ2VzKCBgdmFsdWUgc2hvdWxkIGhhdmUgdHlwZW9mICR7dmFsdWVUeXBlfSwgdmFsdWU9JHt2YWx1ZX1gLCBtZXNzYWdlICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdmFsdWVUeXBlID09PSBBcnJheSAmJiAhQXJyYXkuaXNBcnJheSggdmFsdWUgKSApIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY29tYmluZUVycm9yTWVzc2FnZXMoIGB2YWx1ZSBzaG91bGQgaGF2ZSBiZWVuIGFuIGFycmF5LCB2YWx1ZT0ke3ZhbHVlfWAsIG1lc3NhZ2UgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB2YWx1ZVR5cGUgaW5zdGFuY2VvZiBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgJiYgIXZhbHVlVHlwZS5pbmNsdWRlcyggdmFsdWUgKSApIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY29tYmluZUVycm9yTWVzc2FnZXMoIGB2YWx1ZSBpcyBub3QgYSBtZW1iZXIgb2YgRW51bWVyYXRpb25EZXByZWNhdGVkICR7dmFsdWVUeXBlfWAsIG1lc3NhZ2UgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0eXBlb2YgdmFsdWVUeXBlID09PSAnZnVuY3Rpb24nICYmICEoIHZhbHVlIGluc3RhbmNlb2YgdmFsdWVUeXBlICkgKSB7IC8vIGNvbnN0cnVjdG9yXHJcbiAgICAgIHJldHVybiB0aGlzLmNvbWJpbmVFcnJvck1lc3NhZ2VzKCBgdmFsdWUgc2hvdWxkIGJlIGluc3RhbmNlb2YgJHt2YWx1ZVR5cGUubmFtZX0sIHZhbHVlPSR7dmFsdWV9YCwgbWVzc2FnZSApO1xyXG4gICAgfVxyXG4gICAgaWYgKCB2YWx1ZVR5cGUgPT09IG51bGwgJiYgdmFsdWUgIT09IG51bGwgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNvbWJpbmVFcnJvck1lc3NhZ2VzKCBgdmFsdWUgc2hvdWxkIGJlIG51bGwsIHZhbHVlPSR7dmFsdWV9YCwgbWVzc2FnZSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBWYWxpZGF0ZSBhIHR5cGUgdGhhdCBjYW4gYmUgYSB0eXBlLCBvciBhbiBhcnJheSBvZiBtdWx0aXBsZSB0eXBlcy4gRG9lcyBub3QgYWRkIHZhbGlkYXRpb25NZXNzYWdlIHRvIGFueSBlcnJvclxyXG4gICAqIGl0IHJlcG9ydHNcclxuICAgKi9cclxuICBwcml2YXRlIHN0YXRpYyBnZXRWYWx1ZU9yRWxlbWVudFR5cGVWYWxpZGF0aW9uRXJyb3IoIHR5cGU6IFZhbHVlVHlwZSApOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIGlmICggQXJyYXkuaXNBcnJheSggdHlwZSApICkge1xyXG5cclxuICAgICAgLy8gSWYgbm90IGV2ZXJ5IHR5cGUgaW4gdGhlIGxpc3QgaXMgdmFsaWQsIHRoZW4gcmV0dXJuIGZhbHNlLCBwYXNzIG9wdGlvbnMgdGhyb3VnaCB2ZXJiYXRpbS5cclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdHlwZS5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCB0eXBlRWxlbWVudCA9IHR5cGVbIGkgXTtcclxuICAgICAgICBjb25zdCBlcnJvciA9IFZhbGlkYXRpb24uZ2V0VmFsdWVUeXBlVmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB0eXBlRWxlbWVudCApO1xyXG4gICAgICAgIGlmICggZXJyb3IgKSB7XHJcbiAgICAgICAgICByZXR1cm4gYEFycmF5IHZhbHVlIGludmFsaWQ6ICR7ZXJyb3J9YDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0eXBlICkge1xyXG4gICAgICBjb25zdCBlcnJvciA9IFZhbGlkYXRpb24uZ2V0VmFsdWVUeXBlVmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB0eXBlICk7XHJcbiAgICAgIGlmICggZXJyb3IgKSB7XHJcbiAgICAgICAgcmV0dXJuIGBWYWx1ZSB0eXBlIGludmFsaWQ6ICR7ZXJyb3J9YDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBWQUxJREFUT1JfS0VZUyA9IFZBTElEQVRPUl9LRVlTO1xyXG5cclxuICAvKipcclxuICAgKiBHZW5lcmFsIHZhbGlkYXRvciBmb3IgdmFsaWRhdGluZyB0aGF0IGEgc3RyaW5nIGRvZXNuJ3QgaGF2ZSB0ZW1wbGF0ZSB2YXJpYWJsZXMgaW4gaXQuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBTVFJJTkdfV0lUSE9VVF9URU1QTEFURV9WQVJTX1ZBTElEQVRPUjogVmFsaWRhdG9yPHN0cmluZz4gPSB7XHJcbiAgICB2YWx1ZVR5cGU6ICdzdHJpbmcnLFxyXG4gICAgaXNWYWxpZFZhbHVlOiB2ID0+ICEvXFx7XFx7XFx3KlxcfVxcfS8udGVzdCggdiApXHJcbiAgfTtcclxufVxyXG5cclxuYXhvbi5yZWdpc3RlciggJ1ZhbGlkYXRpb24nLCBWYWxpZGF0aW9uICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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