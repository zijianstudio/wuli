// Copyright 2019-2023, University of Colorado Boulder

/**
 * Throws an assertion error if assertions are enabled and the value is invalid, otherwise returns the value.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import axon from './axon.js';
import Validation from './Validation.js';

/**
 * If assertions are enabled, assert out if the value does not adhere to the validator. No-op without assertions.
 * @deprecated - this solution is worse than a direct assertion (or otherwise call Validation.getValidationError directly)
 */
const validate = (value, validator, providedOptions) => {
  if (assert) {
    // Throws an error if not valid
    const result = Validation.getValidationError(value, validator, providedOptions);
    if (result) {
      const prunedValidator = _.pick(validator, Validation.VALIDATOR_KEYS);
      assert && assert(false, 'validation failed:', result, 'prunedValidator:', prunedValidator);
    }
  }
};
axon.register('validate', validate);
export default validate;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJheG9uIiwiVmFsaWRhdGlvbiIsInZhbGlkYXRlIiwidmFsdWUiLCJ2YWxpZGF0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJhc3NlcnQiLCJyZXN1bHQiLCJnZXRWYWxpZGF0aW9uRXJyb3IiLCJwcnVuZWRWYWxpZGF0b3IiLCJfIiwicGljayIsIlZBTElEQVRPUl9LRVlTIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJ2YWxpZGF0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaHJvd3MgYW4gYXNzZXJ0aW9uIGVycm9yIGlmIGFzc2VydGlvbnMgYXJlIGVuYWJsZWQgYW5kIHRoZSB2YWx1ZSBpcyBpbnZhbGlkLCBvdGhlcndpc2UgcmV0dXJucyB0aGUgdmFsdWUuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgYXhvbiBmcm9tICcuL2F4b24uanMnO1xyXG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcclxuaW1wb3J0IFZhbGlkYXRpb24sIHsgSXNWYWxpZFZhbHVlT3B0aW9ucywgVmFsaWRhdG9yIH0gZnJvbSAnLi9WYWxpZGF0aW9uLmpzJztcclxuXHJcbi8qKlxyXG4gKiBJZiBhc3NlcnRpb25zIGFyZSBlbmFibGVkLCBhc3NlcnQgb3V0IGlmIHRoZSB2YWx1ZSBkb2VzIG5vdCBhZGhlcmUgdG8gdGhlIHZhbGlkYXRvci4gTm8tb3Agd2l0aG91dCBhc3NlcnRpb25zLlxyXG4gKiBAZGVwcmVjYXRlZCAtIHRoaXMgc29sdXRpb24gaXMgd29yc2UgdGhhbiBhIGRpcmVjdCBhc3NlcnRpb24gKG9yIG90aGVyd2lzZSBjYWxsIFZhbGlkYXRpb24uZ2V0VmFsaWRhdGlvbkVycm9yIGRpcmVjdGx5KVxyXG4gKi9cclxuY29uc3QgdmFsaWRhdGUgPSA8VD4oIHZhbHVlOiBJbnRlbnRpb25hbEFueSwgdmFsaWRhdG9yOiBWYWxpZGF0b3I8VD4sIHByb3ZpZGVkT3B0aW9ucz86IElzVmFsaWRWYWx1ZU9wdGlvbnMgKTogdm9pZCA9PiB7XHJcblxyXG4gIGlmICggYXNzZXJ0ICkge1xyXG5cclxuICAgIC8vIFRocm93cyBhbiBlcnJvciBpZiBub3QgdmFsaWRcclxuICAgIGNvbnN0IHJlc3VsdCA9IFZhbGlkYXRpb24uZ2V0VmFsaWRhdGlvbkVycm9yKCB2YWx1ZSwgdmFsaWRhdG9yLCBwcm92aWRlZE9wdGlvbnMgKTtcclxuICAgIGlmICggcmVzdWx0ICkge1xyXG4gICAgICBjb25zdCBwcnVuZWRWYWxpZGF0b3IgPSBfLnBpY2soIHZhbGlkYXRvciwgVmFsaWRhdGlvbi5WQUxJREFUT1JfS0VZUyApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ3ZhbGlkYXRpb24gZmFpbGVkOicsIHJlc3VsdCwgJ3BydW5lZFZhbGlkYXRvcjonLCBwcnVuZWRWYWxpZGF0b3IgKTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5cclxuYXhvbi5yZWdpc3RlciggJ3ZhbGlkYXRlJywgdmFsaWRhdGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgdmFsaWRhdGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsSUFBSSxNQUFNLFdBQVc7QUFFNUIsT0FBT0MsVUFBVSxNQUEwQyxpQkFBaUI7O0FBRTVFO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTUMsUUFBUSxHQUFHQSxDQUFLQyxLQUFxQixFQUFFQyxTQUF1QixFQUFFQyxlQUFxQyxLQUFZO0VBRXJILElBQUtDLE1BQU0sRUFBRztJQUVaO0lBQ0EsTUFBTUMsTUFBTSxHQUFHTixVQUFVLENBQUNPLGtCQUFrQixDQUFFTCxLQUFLLEVBQUVDLFNBQVMsRUFBRUMsZUFBZ0IsQ0FBQztJQUNqRixJQUFLRSxNQUFNLEVBQUc7TUFDWixNQUFNRSxlQUFlLEdBQUdDLENBQUMsQ0FBQ0MsSUFBSSxDQUFFUCxTQUFTLEVBQUVILFVBQVUsQ0FBQ1csY0FBZSxDQUFDO01BQ3RFTixNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsb0JBQW9CLEVBQUVDLE1BQU0sRUFBRSxrQkFBa0IsRUFBRUUsZUFBZ0IsQ0FBQztJQUM5RjtFQUNGO0FBQ0YsQ0FBQztBQUdEVCxJQUFJLENBQUNhLFFBQVEsQ0FBRSxVQUFVLEVBQUVYLFFBQVMsQ0FBQztBQUNyQyxlQUFlQSxRQUFRIn0=