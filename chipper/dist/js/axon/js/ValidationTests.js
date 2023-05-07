// Copyright 2019-2023, University of Colorado Boulder

/**
 * QUnit tests for Validator
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../dot/js/Vector2.js';
import EnumerationDeprecated from '../../phet-core/js/EnumerationDeprecated.js';
import { Node } from '../../scenery/js/imports.js';
import BooleanIO from '../../tandem/js/types/BooleanIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import StringIO from '../../tandem/js/types/StringIO.js';
import Emitter from './Emitter.js';
import Property from './Property.js';
import validate from './validate.js';
import Validation from './Validation.js';

// constants
const ASSERTIONS_TRUE = {
  assertions: true
};
QUnit.module('Validator');

// Note that many validation tests are in PropertyTests
QUnit.test('Test validate and Validation.isValidValue', assert => {
  window.assert && assert.throws(() => validate(4, {
    validValues: [1, 2, 3]
  }), 'invalid number');
  window.assert && assert.throws(() => validate('hello', {
    valueType: Array
  }), 'string isn\'t Array');
  assert.ok(Validation.isValueValid(3, {
    validValues: [1, 2, 3]
  }));
  assert.ok(Validation.isValueValid([], {
    valueType: Array
  }));
  assert.ok(Validation.isValueValid(7, {
    valueType: 'number',
    isValidValue: v => v > 5
  }));
  assert.ok(!Validation.isValueValid(7, {
    valueType: 'number',
    isValidValue: v => v > 7
  }));
  assert.ok(!Validation.isValueValid(7, {
    valueType: 'number',
    isValidValue: v => v < 3
  }));
});
QUnit.test('Test containsValidatorKey', assert => {
  assert.ok(Validation.containsValidatorKey({
    validValues: []
  }), 'has key validValues');
  assert.ok(!Validation.containsValidatorKey({
    shmalidValues: []
  }), 'does not have key: validValues');
  assert.ok(Validation.containsValidatorKey({
    validValues: [],
    valueType: []
  }), 'does have keys: valueType and validValues');
  assert.ok(Validation.containsValidatorKey({
    validValue: [],
    valueType: []
  }), 'still have valueType and be ok even though it doesn\'t have validValues');
  assert.ok(!Validation.containsValidatorKey(undefined), 'undefined: no validator key');
  assert.ok(!Validation.containsValidatorKey(null), 'null: no validator key');
  assert.ok(!Validation.containsValidatorKey(5), 'number: no validator key');
  assert.ok(!Validation.containsValidatorKey({
    fdsaf: true
  }), 'undefined: no validator key');
  assert.ok(!Validation.containsValidatorKey(new IOType('TestIO', {
    valueType: 'string'
  })), 'undefined: no validator key');
  assert.ok(Validation.containsValidatorKey({
    valueType: 'fdsaf'
  }), 'has valueType, even though valueType has the wrong value');
});
QUnit.test('Test getValidatorValidationError and validateValidator', assert => {
  window.assert && assert.throws(() => Validation.validateValidator({
    valueType: Array,
    // @ts-expect-error INTENTIONAL
    isValidValue: 4
  }), 'isValidValue should be function');
  window.assert && assert.ok(typeof Validation.getValidatorValidationError({
    valueType: Array,
    validValues: ['hi']
  }) === 'string', 'validValues contains invalid value');
  assert.ok(!Validation.getValidatorValidationError({
    valueType: 'number'
  }), 'good valueType');

  // @ts-expect-error
  assert.ok(Validation.getValidatorValidationError({
    validValue: 'number'
  }), 'no validator keys supplied');

  // @ts-expect-error
  assert.ok(Validation.getValidatorValidationError({
    validValue: 4
  }), 'no validator keys supplied');
  assert.ok(Validation.getValidatorValidationError({
    valueType: 'blaradysharady'
  }), 'invalid valueType string');
  assert.ok(!Validation.getValidatorValidationError({
    isValidValue: () => true
  }), 'isValidValue is a function');

  // @ts-expect-error
  assert.ok(Validation.getValidatorValidationError({
    isValidValue: 'hi'
  }), 'isValidValue should not be string');
  assert.ok(!Validation.getValidatorValidationError({
    valueType: null
  }), 'null is valid');
  assert.ok(!Validation.getValidatorValidationError({
    valueType: ['number', null]
  }), 'array of null and number is valid');
  assert.ok(!Validation.getValidatorValidationError({
    valueType: ['number', null, Node]
  }), 'array of null and number is valid');
  assert.ok(Validation.getValidatorValidationError({
    valueType: ['numberf', null, Node]
  }), 'numberf is not a valid valueType');
  assert.ok(!Validation.isValueValid(undefined, {
    valueType: ['number', 'sstring']
  }), 'sstring is not a valid valueType');

  // @ts-expect-error
  assert.ok(!Validation.isValueValid(undefined, {
    valueType: [7]
  }, ASSERTIONS_TRUE), '7 is not a valid valueType');

  // @ts-expect-error
  assert.ok(!Validation.isValueValid(undefined, {
    valueType: ['number', {}]
  }, ASSERTIONS_TRUE), 'Object literal  is not a valid valueType');
});
QUnit.test('Test valueType: {Array.<number|null|string|function|EnumerationDeprecated>}', assert => {
  assert.ok(Validation.isValueValid(null, {
    valueType: null
  }), 'null is valid');
  assert.ok(Validation.isValueValid(7, {
    valueType: ['number', null]
  }), '7 is valid for null and number');
  assert.ok(Validation.isValueValid(null, {
    valueType: ['number', null]
  }), 'null is valid for null and number');
  assert.ok(Validation.isValueValid(new Node(), {
    valueType: ['number', null, Node]
  }), 'Node is valid');
  assert.ok(Validation.isValueValid(EnumerationDeprecated.byKeys(['ROBIN', 'JAY', 'WREN']), {
    valueType: [EnumerationDeprecated, null, Node]
  }), 'Node is valid');
  assert.ok(!Validation.isValueValid('hello', {
    valueType: ['number', null, Node]
  }), 'string not valid');
  window.assert && assert.throws(() => validate(true, {
    valueType: ['number', 'string']
  }), 'number and string do not validate boolean');
  window.assert && assert.throws(() => validate(null, {
    valueType: ['number', 'string']
  }), 'number and string do not validate null');
  window.assert && assert.throws(() => validate(undefined, {
    valueType: ['number', 'string']
  }), 'number and string do not validate undefined');
  window.assert && assert.throws(() => validate(_.noop, {
    valueType: ['number', 'string']
  }), 'number and string do not validate undefined');
  const Birds = EnumerationDeprecated.byKeys(['ROBIN', 'JAY', 'WREN']);
  window.assert && assert.throws(() => validate(_.noop, {
    valueType: [Birds, 'string']
  }), 'number and string do not validate undefined');
});
QUnit.test('Test valueType: {EnumerationDeprecated}', assert => {
  const Birds = EnumerationDeprecated.byKeys(['ROBIN', 'JAY', 'WREN']);
  assert.ok(!Validation.getValidatorValidationError({
    valueType: Birds
  }), 'good valueType');

  // @ts-expect-error
  assert.ok(Validation.isValueValid(Birds.ROBIN, {
    valueType: Birds
  }), 'good value');
  assert.ok(!Validation.isValueValid(4, {
    valueType: Birds
  }), 'bad value');
});
QUnit.test('Test phetioType', assert => {
  // Stub phetioType here for testing. ts-expect-errors may be able to be removed when IOType is in typescript.
  // @ts-expect-error
  assert.ok(!Validation.getValidatorValidationError({
    phetioType: {
      validator: {
        valueType: 'number'
      }
    }
  }), 'good phetioType');
  // @ts-expect-error
  assert.ok(!Validation.getValidatorValidationError({
    phetioType: {
      validator: {
        isValidValue: () => true
      }
    }
  }), 'good phetioType');
  // @ts-expect-error
  assert.ok(Validation.getValidatorValidationError({
    phetioType: {
      notValidator: {
        isValidValue: () => true
      }
    }
  }), 'bad phetioType');
  // @ts-expect-error
  assert.ok(Validation.getValidatorValidationError({
    phetioType: {
      validator: {
        isValidValue: 'number'
      }
    }
  }), 'bad phetioType');
  // @ts-expect-error
  assert.ok(Validation.getValidatorValidationError({
    phetioType: {
      validator: {}
    }
  }), 'bad phetioType');
  // @ts-expect-error
  assert.ok(Validation.getValidatorValidationError({
    phetioType: {
      validator: null
    }
  }), 'bad phetioType');
  // @ts-expect-error
  assert.ok(Validation.getValidatorValidationError({
    phetioType: 'null'
  }), 'bad phetioType');
  // @ts-expect-error
  assert.ok(Validation.getValidatorValidationError({
    phetioType: null
  }), 'bad phetioType');
  assert.ok(Validation.isValueValid('hello', {
    phetioType: StringIO
  }), 'string valid');
  assert.ok(!Validation.isValueValid(null, {
    phetioType: StringIO
  }), 'null not valid');
  assert.ok(!Validation.isValueValid(undefined, {
    phetioType: StringIO
  }), 'undefined not valid');
  assert.ok(Validation.isValueValid('oh hi', {
    phetioType: StringIO
  }), 'string valid');
  assert.ok(Validation.isValueValid('oh no', {
    phetioType: StringIO,
    isValidValue: v => v.startsWith('o')
  }), 'string valid');
  assert.ok(!Validation.isValueValid('ho on', {
    phetioType: StringIO,
    isValidValue: v => v.startsWith('o')
  }), 'string not valid');
  assert.ok(Validation.isValueValid(new Emitter(), {
    phetioType: Emitter.EmitterIO([])
  }), 'emitter is valid');
});
QUnit.test('validationMessage is presented for all validation errors', assert => {
  const testContainsErrorMessage = (value, validator, message = validator.validationMessage) => {
    assert.ok(message, 'should have a message');
    const validationError = Validation.getValidationError(value, validator);
    assert.ok(validationError && validationError.includes(message), message);
  };
  testContainsErrorMessage(5, {
    valueType: 'boolean',
    validationMessage: 'valueType boolean, value number'
  });
  testContainsErrorMessage(true, {
    valueType: 'number',
    validationMessage: 'valueType number, value boolean'
  });
  testContainsErrorMessage(true, {
    valueType: ['string', 'number'],
    validationMessage: 'valueType string`,number value boolean'
  });
  testContainsErrorMessage(true, {
    valueType: [null, 'number'],
    validationMessage: 'valueType null,number value boolean'
  });
  testContainsErrorMessage(false, {
    validValues: ['hi', true],
    validationMessage: 'validValues with value:false'
  });
  testContainsErrorMessage(5, {
    validValues: ['hi', true],
    validationMessage: 'validValues with value:5'
  });
  testContainsErrorMessage(4, {
    isValidValue: v => v === 3,
    validationMessage: 'isValidValue 3, value 4'
  });
  testContainsErrorMessage('oh hello', {
    phetioType: Property.PropertyIO(BooleanIO),
    validationMessage: 'isValidValue 3, value string'
  });
  const ioType = new IOType('TestIO', {
    valueType: 'boolean'
  });
  const ioTypeValidationMessage = 'should be a boolean from this IOType in tests';
  ioType.validator.validationMessage = ioTypeValidationMessage;
  testContainsErrorMessage('hi', {
    phetioType: ioType
  }, ioTypeValidationMessage);
});
QUnit.test('test Validator.validators', assert => {
  assert.ok(!Validation.getValidatorValidationError({
    validators: [{
      valueType: 'boolean'
    }, {
      isValidValue: v => v === false
    }]
  }), 'correct validator');

  // @ts-expect-error
  assert.ok(Validation.getValidatorValidationError({
    validators: [{
      valueType: 'boolean'
    }, {
      isValidValue: 7
    }]
  }), 'incorrect validator');

  // @ts-expect-error
  assert.ok(Validation.getValidatorValidationError({
    validators: [{
      valueType: 'boolean'
    }, 7]
  }), 'incorrect validator2');
  assert.ok(Validation.getValidationError('7', {
    validators: [{
      valueType: 'boolean'
    }, {
      isValidValue: v => v === false
    }]
  }));
  assert.ok(Validation.getValidationError(true, {
    validators: [{
      valueType: 'boolean'
    }, {
      isValidValue: v => v === false
    }]
  }));
  assert.ok(Validation.getValidationError(undefined, {
    validators: [{
      valueType: 'boolean'
    }, {
      isValidValue: v => v === false
    }]
  }));
  assert.ok(!Validation.getValidationError(false, {
    validators: [{
      valueType: 'boolean'
    }, {
      isValidValue: v => v === false
    }]
  }));
});
QUnit.test('Validator.valueComparisonStrategy', assert => {
  const myValueArray = [7, 6, 5];

  // @ts-expect-error wrong value for valueComparisonStrategy
  assert.ok(Validation.getValidatorValidationError({
    valueComparisonStrategy: 'referfdsafdsence'
  }), 'that is not a correct valueComparisonStrategy');
  assert.ok(!Validation.getValidationError(myValueArray, {
    validators: [{
      validValues: [myValueArray],
      valueComparisonStrategy: 'reference'
    }]
  }));
  assert.ok(!Validation.getValidationError(myValueArray, {
    validators: [{
      validValues: [[7, 6, 5]],
      valueComparisonStrategy: 'lodashDeep'
    }]
  }));
  assert.ok(Validation.getValidationError(myValueArray, {
    validators: [{
      validValues: [[7, 6, 5]],
      valueComparisonStrategy: 'reference'
    }]
  }), 'That isn\'t the same array!');
  window.assert && assert.throws(() => {
    Validation.getValidationError(myValueArray, {
      validators: [{
        validValues: [[7, 6, 5]],
        valueComparisonStrategy: 'equalsFunction'
      }]
    });
  }, 'arrays do not have an equals function');
  assert.ok(!Validation.getValidationError(new Vector2(0, 0), {
    validators: [{
      validValues: [new Vector2(0, 1), new Vector2(0, 0)],
      valueComparisonStrategy: 'equalsFunction'
    }]
  }));
  assert.ok(Validation.getValidationError(new Vector2(0, 2), {
    validators: [{
      validValues: [new Vector2(0, 1), new Vector2(0, 0)],
      valueComparisonStrategy: 'equalsFunction'
    }]
  }));
  assert.ok(Validation.getValidationError(new Vector2(0, 2), {
    validators: [{
      validValues: [new Vector2(0, 100), new Vector2(2, 2)],
      // compare only the x values.
      valueComparisonStrategy: (a, b) => a.x === b.x
    }]
  }));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiRW51bWVyYXRpb25EZXByZWNhdGVkIiwiTm9kZSIsIkJvb2xlYW5JTyIsIklPVHlwZSIsIlN0cmluZ0lPIiwiRW1pdHRlciIsIlByb3BlcnR5IiwidmFsaWRhdGUiLCJWYWxpZGF0aW9uIiwiQVNTRVJUSU9OU19UUlVFIiwiYXNzZXJ0aW9ucyIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsIndpbmRvdyIsInRocm93cyIsInZhbGlkVmFsdWVzIiwidmFsdWVUeXBlIiwiQXJyYXkiLCJvayIsImlzVmFsdWVWYWxpZCIsImlzVmFsaWRWYWx1ZSIsInYiLCJjb250YWluc1ZhbGlkYXRvcktleSIsInNobWFsaWRWYWx1ZXMiLCJ2YWxpZFZhbHVlIiwidW5kZWZpbmVkIiwiZmRzYWYiLCJ2YWxpZGF0ZVZhbGlkYXRvciIsImdldFZhbGlkYXRvclZhbGlkYXRpb25FcnJvciIsImJ5S2V5cyIsIl8iLCJub29wIiwiQmlyZHMiLCJST0JJTiIsInBoZXRpb1R5cGUiLCJ2YWxpZGF0b3IiLCJub3RWYWxpZGF0b3IiLCJzdGFydHNXaXRoIiwiRW1pdHRlcklPIiwidGVzdENvbnRhaW5zRXJyb3JNZXNzYWdlIiwidmFsdWUiLCJtZXNzYWdlIiwidmFsaWRhdGlvbk1lc3NhZ2UiLCJ2YWxpZGF0aW9uRXJyb3IiLCJnZXRWYWxpZGF0aW9uRXJyb3IiLCJpbmNsdWRlcyIsIlByb3BlcnR5SU8iLCJpb1R5cGUiLCJpb1R5cGVWYWxpZGF0aW9uTWVzc2FnZSIsInZhbGlkYXRvcnMiLCJteVZhbHVlQXJyYXkiLCJ2YWx1ZUNvbXBhcmlzb25TdHJhdGVneSIsImEiLCJiIiwieCJdLCJzb3VyY2VzIjpbIlZhbGlkYXRpb25UZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBRVW5pdCB0ZXN0cyBmb3IgVmFsaWRhdG9yXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25EZXByZWNhdGVkIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbkRlcHJlY2F0ZWQuanMnO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEJvb2xlYW5JTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvQm9vbGVhbklPLmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IFN0cmluZ0lPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9TdHJpbmdJTy5qcyc7XHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4vRW1pdHRlci5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IHZhbGlkYXRlIGZyb20gJy4vdmFsaWRhdGUuanMnO1xyXG5pbXBvcnQgVmFsaWRhdGlvbiwgeyBWYWxpZGF0b3IgfSBmcm9tICcuL1ZhbGlkYXRpb24uanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEFTU0VSVElPTlNfVFJVRSA9IHsgYXNzZXJ0aW9uczogdHJ1ZSB9O1xyXG5cclxuUVVuaXQubW9kdWxlKCAnVmFsaWRhdG9yJyApO1xyXG5cclxuLy8gTm90ZSB0aGF0IG1hbnkgdmFsaWRhdGlvbiB0ZXN0cyBhcmUgaW4gUHJvcGVydHlUZXN0c1xyXG5RVW5pdC50ZXN0KCAnVGVzdCB2YWxpZGF0ZSBhbmQgVmFsaWRhdGlvbi5pc1ZhbGlkVmFsdWUnLCBhc3NlcnQgPT4ge1xyXG5cclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHZhbGlkYXRlKCA0LCB7IHZhbGlkVmFsdWVzOiBbIDEsIDIsIDMgXSB9ICksICdpbnZhbGlkIG51bWJlcicgKTtcclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHZhbGlkYXRlKCAnaGVsbG8nLCB7IHZhbHVlVHlwZTogQXJyYXkgfSApLCAnc3RyaW5nIGlzblxcJ3QgQXJyYXknICk7XHJcblxyXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5pc1ZhbHVlVmFsaWQoIDMsIHsgdmFsaWRWYWx1ZXM6IFsgMSwgMiwgMyBdIH0gKSApO1xyXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5pc1ZhbHVlVmFsaWQoIFtdLCB7IHZhbHVlVHlwZTogQXJyYXkgfSApICk7XHJcblxyXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5pc1ZhbHVlVmFsaWQoIDcsIHsgdmFsdWVUeXBlOiAnbnVtYmVyJywgaXNWYWxpZFZhbHVlOiAoIHY6IG51bWJlciApID0+IHYgPiA1IH0gKSApO1xyXG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCA3LCB7IHZhbHVlVHlwZTogJ251bWJlcicsIGlzVmFsaWRWYWx1ZTogKCB2OiBudW1iZXIgKSA9PiB2ID4gNyB9ICkgKTtcclxuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmlzVmFsdWVWYWxpZCggNywgeyB2YWx1ZVR5cGU6ICdudW1iZXInLCBpc1ZhbGlkVmFsdWU6ICggdjogbnVtYmVyICkgPT4gdiA8IDMgfSApICk7XHJcblxyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnVGVzdCBjb250YWluc1ZhbGlkYXRvcktleScsIGFzc2VydCA9PiB7XHJcbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmNvbnRhaW5zVmFsaWRhdG9yS2V5KCB7IHZhbGlkVmFsdWVzOiBbXSB9ICksICdoYXMga2V5IHZhbGlkVmFsdWVzJyApO1xyXG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uY29udGFpbnNWYWxpZGF0b3JLZXkoIHsgc2htYWxpZFZhbHVlczogW10gfSApLCAnZG9lcyBub3QgaGF2ZSBrZXk6IHZhbGlkVmFsdWVzJyApO1xyXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5jb250YWluc1ZhbGlkYXRvcktleSgge1xyXG4gICAgdmFsaWRWYWx1ZXM6IFtdLFxyXG4gICAgdmFsdWVUeXBlOiBbXVxyXG4gIH0gKSwgJ2RvZXMgaGF2ZSBrZXlzOiB2YWx1ZVR5cGUgYW5kIHZhbGlkVmFsdWVzJyApO1xyXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5jb250YWluc1ZhbGlkYXRvcktleSgge1xyXG4gICAgdmFsaWRWYWx1ZTogW10sXHJcbiAgICB2YWx1ZVR5cGU6IFtdXHJcbiAgfSApLCAnc3RpbGwgaGF2ZSB2YWx1ZVR5cGUgYW5kIGJlIG9rIGV2ZW4gdGhvdWdoIGl0IGRvZXNuXFwndCBoYXZlIHZhbGlkVmFsdWVzJyApO1xyXG5cclxuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmNvbnRhaW5zVmFsaWRhdG9yS2V5KCB1bmRlZmluZWQgKSwgJ3VuZGVmaW5lZDogbm8gdmFsaWRhdG9yIGtleScgKTtcclxuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmNvbnRhaW5zVmFsaWRhdG9yS2V5KCBudWxsICksICdudWxsOiBubyB2YWxpZGF0b3Iga2V5JyApO1xyXG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uY29udGFpbnNWYWxpZGF0b3JLZXkoIDUgKSwgJ251bWJlcjogbm8gdmFsaWRhdG9yIGtleScgKTtcclxuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmNvbnRhaW5zVmFsaWRhdG9yS2V5KCB7IGZkc2FmOiB0cnVlIH0gKSwgJ3VuZGVmaW5lZDogbm8gdmFsaWRhdG9yIGtleScgKTtcclxuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmNvbnRhaW5zVmFsaWRhdG9yS2V5KCBuZXcgSU9UeXBlKCAnVGVzdElPJywgeyB2YWx1ZVR5cGU6ICdzdHJpbmcnIH0gKSApLCAndW5kZWZpbmVkOiBubyB2YWxpZGF0b3Iga2V5JyApO1xyXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5jb250YWluc1ZhbGlkYXRvcktleSggeyB2YWx1ZVR5cGU6ICdmZHNhZicgfSApLCAnaGFzIHZhbHVlVHlwZSwgZXZlbiB0aG91Z2ggdmFsdWVUeXBlIGhhcyB0aGUgd3JvbmcgdmFsdWUnICk7XHJcbn0gKTtcclxuXHJcblxyXG5RVW5pdC50ZXN0KCAnVGVzdCBnZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IgYW5kIHZhbGlkYXRlVmFsaWRhdG9yJywgYXNzZXJ0ID0+IHtcclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IFZhbGlkYXRpb24udmFsaWRhdGVWYWxpZGF0b3IoIHtcclxuICAgIHZhbHVlVHlwZTogQXJyYXksXHJcblxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBJTlRFTlRJT05BTFxyXG4gICAgaXNWYWxpZFZhbHVlOiA0XHJcbiAgfSApLCAnaXNWYWxpZFZhbHVlIHNob3VsZCBiZSBmdW5jdGlvbicgKTtcclxuXHJcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQub2soIHR5cGVvZiBWYWxpZGF0aW9uLmdldFZhbGlkYXRvclZhbGlkYXRpb25FcnJvcigge1xyXG4gICAgdmFsdWVUeXBlOiBBcnJheSxcclxuICAgIHZhbGlkVmFsdWVzOiBbICdoaScgXVxyXG5cclxuICB9ICkgPT09ICdzdHJpbmcnLCAndmFsaWRWYWx1ZXMgY29udGFpbnMgaW52YWxpZCB2YWx1ZScgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCAhVmFsaWRhdGlvbi5nZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IoIHsgdmFsdWVUeXBlOiAnbnVtYmVyJyB9ICksICdnb29kIHZhbHVlVHlwZScgKTtcclxuXHJcbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5nZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IoIHsgdmFsaWRWYWx1ZTogJ251bWJlcicgfSApLCAnbm8gdmFsaWRhdG9yIGtleXMgc3VwcGxpZWQnICk7XHJcblxyXG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB7IHZhbGlkVmFsdWU6IDQgfSApLCAnbm8gdmFsaWRhdG9yIGtleXMgc3VwcGxpZWQnICk7XHJcbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmdldFZhbGlkYXRvclZhbGlkYXRpb25FcnJvciggeyB2YWx1ZVR5cGU6ICdibGFyYWR5c2hhcmFkeScgfSApLCAnaW52YWxpZCB2YWx1ZVR5cGUgc3RyaW5nJyApO1xyXG5cclxuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmdldFZhbGlkYXRvclZhbGlkYXRpb25FcnJvciggeyBpc1ZhbGlkVmFsdWU6ICgpID0+IHRydWUgfSApLCAnaXNWYWxpZFZhbHVlIGlzIGEgZnVuY3Rpb24nICk7XHJcblxyXG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB7IGlzVmFsaWRWYWx1ZTogJ2hpJyB9ICksICdpc1ZhbGlkVmFsdWUgc2hvdWxkIG5vdCBiZSBzdHJpbmcnICk7XHJcblxyXG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB7IHZhbHVlVHlwZTogbnVsbCB9ICksICdudWxsIGlzIHZhbGlkJyApO1xyXG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB7IHZhbHVlVHlwZTogWyAnbnVtYmVyJywgbnVsbCBdIH0gKSwgJ2FycmF5IG9mIG51bGwgYW5kIG51bWJlciBpcyB2YWxpZCcgKTtcclxuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmdldFZhbGlkYXRvclZhbGlkYXRpb25FcnJvciggeyB2YWx1ZVR5cGU6IFsgJ251bWJlcicsIG51bGwsIE5vZGUgXSB9ICksICdhcnJheSBvZiBudWxsIGFuZCBudW1iZXIgaXMgdmFsaWQnICk7XHJcbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmdldFZhbGlkYXRvclZhbGlkYXRpb25FcnJvciggeyB2YWx1ZVR5cGU6IFsgJ251bWJlcmYnLCBudWxsLCBOb2RlIF0gfSApLCAnbnVtYmVyZiBpcyBub3QgYSB2YWxpZCB2YWx1ZVR5cGUnICk7XHJcblxyXG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCB1bmRlZmluZWQsIHsgdmFsdWVUeXBlOiBbICdudW1iZXInLCAnc3N0cmluZycgXSB9ICksICdzc3RyaW5nIGlzIG5vdCBhIHZhbGlkIHZhbHVlVHlwZScgKTtcclxuXHJcbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCB1bmRlZmluZWQsIHsgdmFsdWVUeXBlOiBbIDcgXSB9LCBBU1NFUlRJT05TX1RSVUUgKSwgJzcgaXMgbm90IGEgdmFsaWQgdmFsdWVUeXBlJyApO1xyXG5cclxuICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgYXNzZXJ0Lm9rKCAhVmFsaWRhdGlvbi5pc1ZhbHVlVmFsaWQoIHVuZGVmaW5lZCwgeyB2YWx1ZVR5cGU6IFsgJ251bWJlcicsIHt9IF0gfSwgQVNTRVJUSU9OU19UUlVFICksICdPYmplY3QgbGl0ZXJhbCAgaXMgbm90IGEgdmFsaWQgdmFsdWVUeXBlJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnVGVzdCB2YWx1ZVR5cGU6IHtBcnJheS48bnVtYmVyfG51bGx8c3RyaW5nfGZ1bmN0aW9ufEVudW1lcmF0aW9uRGVwcmVjYXRlZD59JywgYXNzZXJ0ID0+IHtcclxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCBudWxsLCB7IHZhbHVlVHlwZTogbnVsbCB9ICksICdudWxsIGlzIHZhbGlkJyApO1xyXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5pc1ZhbHVlVmFsaWQoIDcsIHsgdmFsdWVUeXBlOiBbICdudW1iZXInLCBudWxsIF0gfSApLCAnNyBpcyB2YWxpZCBmb3IgbnVsbCBhbmQgbnVtYmVyJyApO1xyXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5pc1ZhbHVlVmFsaWQoIG51bGwsIHsgdmFsdWVUeXBlOiBbICdudW1iZXInLCBudWxsIF0gfSApLCAnbnVsbCBpcyB2YWxpZCBmb3IgbnVsbCBhbmQgbnVtYmVyJyApO1xyXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5pc1ZhbHVlVmFsaWQoIG5ldyBOb2RlKCksIHsgdmFsdWVUeXBlOiBbICdudW1iZXInLCBudWxsLCBOb2RlIF0gfSApLCAnTm9kZSBpcyB2YWxpZCcgKTtcclxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQuYnlLZXlzKCBbICdST0JJTicsICdKQVknLCAnV1JFTicgXSApLCB7IHZhbHVlVHlwZTogWyBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQsIG51bGwsIE5vZGUgXSB9ICksICdOb2RlIGlzIHZhbGlkJyApO1xyXG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCAnaGVsbG8nLCB7IHZhbHVlVHlwZTogWyAnbnVtYmVyJywgbnVsbCwgTm9kZSBdIH0gKSwgJ3N0cmluZyBub3QgdmFsaWQnICk7XHJcblxyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4gdmFsaWRhdGUoIHRydWUsIHsgdmFsdWVUeXBlOiBbICdudW1iZXInLCAnc3RyaW5nJyBdIH0gKSwgJ251bWJlciBhbmQgc3RyaW5nIGRvIG5vdCB2YWxpZGF0ZSBib29sZWFuJyApO1xyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4gdmFsaWRhdGUoIG51bGwsIHsgdmFsdWVUeXBlOiBbICdudW1iZXInLCAnc3RyaW5nJyBdIH0gKSwgJ251bWJlciBhbmQgc3RyaW5nIGRvIG5vdCB2YWxpZGF0ZSBudWxsJyApO1xyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4gdmFsaWRhdGUoIHVuZGVmaW5lZCwgeyB2YWx1ZVR5cGU6IFsgJ251bWJlcicsICdzdHJpbmcnIF0gfSApLCAnbnVtYmVyIGFuZCBzdHJpbmcgZG8gbm90IHZhbGlkYXRlIHVuZGVmaW5lZCcgKTtcclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHZhbGlkYXRlKCBfLm5vb3AsIHsgdmFsdWVUeXBlOiBbICdudW1iZXInLCAnc3RyaW5nJyBdIH0gKSwgJ251bWJlciBhbmQgc3RyaW5nIGRvIG5vdCB2YWxpZGF0ZSB1bmRlZmluZWQnICk7XHJcblxyXG4gIGNvbnN0IEJpcmRzID0gRW51bWVyYXRpb25EZXByZWNhdGVkLmJ5S2V5cyggWyAnUk9CSU4nLCAnSkFZJywgJ1dSRU4nIF0gKTtcclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHZhbGlkYXRlKCBfLm5vb3AsIHsgdmFsdWVUeXBlOiBbIEJpcmRzLCAnc3RyaW5nJyBdIH0gKSwgJ251bWJlciBhbmQgc3RyaW5nIGRvIG5vdCB2YWxpZGF0ZSB1bmRlZmluZWQnICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdUZXN0IHZhbHVlVHlwZToge0VudW1lcmF0aW9uRGVwcmVjYXRlZH0nLCBhc3NlcnQgPT4ge1xyXG5cclxuICBjb25zdCBCaXJkcyA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ1JPQklOJywgJ0pBWScsICdXUkVOJyBdICk7XHJcbiAgYXNzZXJ0Lm9rKCAhVmFsaWRhdGlvbi5nZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IoIHsgdmFsdWVUeXBlOiBCaXJkcyB9ICksICdnb29kIHZhbHVlVHlwZScgKTtcclxuXHJcbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5pc1ZhbHVlVmFsaWQoIEJpcmRzLlJPQklOLCB7IHZhbHVlVHlwZTogQmlyZHMgfSApLCAnZ29vZCB2YWx1ZScgKTtcclxuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmlzVmFsdWVWYWxpZCggNCwgeyB2YWx1ZVR5cGU6IEJpcmRzIH0gKSwgJ2JhZCB2YWx1ZScgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1Rlc3QgcGhldGlvVHlwZScsIGFzc2VydCA9PiB7XHJcblxyXG4gIC8vIFN0dWIgcGhldGlvVHlwZSBoZXJlIGZvciB0ZXN0aW5nLiB0cy1leHBlY3QtZXJyb3JzIG1heSBiZSBhYmxlIHRvIGJlIHJlbW92ZWQgd2hlbiBJT1R5cGUgaXMgaW4gdHlwZXNjcmlwdC5cclxuICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgYXNzZXJ0Lm9rKCAhVmFsaWRhdGlvbi5nZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IoIHsgcGhldGlvVHlwZTogeyB2YWxpZGF0b3I6IHsgdmFsdWVUeXBlOiAnbnVtYmVyJyB9IH0gfSApLCAnZ29vZCBwaGV0aW9UeXBlJyApO1xyXG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmdldFZhbGlkYXRvclZhbGlkYXRpb25FcnJvciggeyBwaGV0aW9UeXBlOiB7IHZhbGlkYXRvcjogeyBpc1ZhbGlkVmFsdWU6ICgpID0+IHRydWUgfSB9IH0gKSwgJ2dvb2QgcGhldGlvVHlwZScgKTtcclxuICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmdldFZhbGlkYXRvclZhbGlkYXRpb25FcnJvciggeyBwaGV0aW9UeXBlOiB7IG5vdFZhbGlkYXRvcjogeyBpc1ZhbGlkVmFsdWU6ICgpID0+IHRydWUgfSB9IH0gKSwgJ2JhZCBwaGV0aW9UeXBlJyApO1xyXG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB7IHBoZXRpb1R5cGU6IHsgdmFsaWRhdG9yOiB7IGlzVmFsaWRWYWx1ZTogJ251bWJlcicgfSB9IH0gKSwgJ2JhZCBwaGV0aW9UeXBlJyApO1xyXG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB7IHBoZXRpb1R5cGU6IHsgdmFsaWRhdG9yOiB7fSB9IH0gKSwgJ2JhZCBwaGV0aW9UeXBlJyApO1xyXG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB7IHBoZXRpb1R5cGU6IHsgdmFsaWRhdG9yOiBudWxsIH0gfSApLCAnYmFkIHBoZXRpb1R5cGUnICk7XHJcbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5nZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IoIHsgcGhldGlvVHlwZTogJ251bGwnIH0gKSwgJ2JhZCBwaGV0aW9UeXBlJyApO1xyXG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB7IHBoZXRpb1R5cGU6IG51bGwgfSApLCAnYmFkIHBoZXRpb1R5cGUnICk7XHJcblxyXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5pc1ZhbHVlVmFsaWQoICdoZWxsbycsIHsgcGhldGlvVHlwZTogU3RyaW5nSU8gfSApLCAnc3RyaW5nIHZhbGlkJyApO1xyXG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCBudWxsLCB7IHBoZXRpb1R5cGU6IFN0cmluZ0lPIH0gKSwgJ251bGwgbm90IHZhbGlkJyApO1xyXG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCB1bmRlZmluZWQsIHsgcGhldGlvVHlwZTogU3RyaW5nSU8gfSApLCAndW5kZWZpbmVkIG5vdCB2YWxpZCcgKTtcclxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCAnb2ggaGknLCB7IHBoZXRpb1R5cGU6IFN0cmluZ0lPIH0gKSwgJ3N0cmluZyB2YWxpZCcgKTtcclxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCAnb2ggbm8nLCB7XHJcbiAgICBwaGV0aW9UeXBlOiBTdHJpbmdJTyxcclxuICAgIGlzVmFsaWRWYWx1ZTogdiA9PiB2LnN0YXJ0c1dpdGgoICdvJyApXHJcbiAgfSApLCAnc3RyaW5nIHZhbGlkJyApO1xyXG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCAnaG8gb24nLCB7XHJcbiAgICBwaGV0aW9UeXBlOiBTdHJpbmdJTyxcclxuICAgIGlzVmFsaWRWYWx1ZTogdiA9PiB2LnN0YXJ0c1dpdGgoICdvJyApXHJcbiAgfSApLCAnc3RyaW5nIG5vdCB2YWxpZCcgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmlzVmFsdWVWYWxpZCggbmV3IEVtaXR0ZXIoKSwgeyBwaGV0aW9UeXBlOiBFbWl0dGVyLkVtaXR0ZXJJTyggW10gKSB9ICksICdlbWl0dGVyIGlzIHZhbGlkJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAndmFsaWRhdGlvbk1lc3NhZ2UgaXMgcHJlc2VudGVkIGZvciBhbGwgdmFsaWRhdGlvbiBlcnJvcnMnLCBhc3NlcnQgPT4ge1xyXG5cclxuICBjb25zdCB0ZXN0Q29udGFpbnNFcnJvck1lc3NhZ2UgPSAoIHZhbHVlOiBudW1iZXIgfCBib29sZWFuIHwgc3RyaW5nIHwgbnVtYmVyW10gfCBBcnJheTxudW1iZXIgfCBib29sZWFuIHwgc3RyaW5nPiwgdmFsaWRhdG9yOiBWYWxpZGF0b3IsIG1lc3NhZ2UgPSB2YWxpZGF0b3IudmFsaWRhdGlvbk1lc3NhZ2UgKSA9PiB7XHJcbiAgICBhc3NlcnQub2soIG1lc3NhZ2UsICdzaG91bGQgaGF2ZSBhIG1lc3NhZ2UnICk7XHJcbiAgICBjb25zdCB2YWxpZGF0aW9uRXJyb3IgPSBWYWxpZGF0aW9uLmdldFZhbGlkYXRpb25FcnJvciggdmFsdWUsIHZhbGlkYXRvciApO1xyXG4gICAgYXNzZXJ0Lm9rKCB2YWxpZGF0aW9uRXJyb3IgJiYgdmFsaWRhdGlvbkVycm9yLmluY2x1ZGVzKCBtZXNzYWdlISApLCBtZXNzYWdlICk7XHJcbiAgfTtcclxuXHJcbiAgdGVzdENvbnRhaW5zRXJyb3JNZXNzYWdlKCA1LCB7IHZhbHVlVHlwZTogJ2Jvb2xlYW4nLCB2YWxpZGF0aW9uTWVzc2FnZTogJ3ZhbHVlVHlwZSBib29sZWFuLCB2YWx1ZSBudW1iZXInIH0gKTtcclxuICB0ZXN0Q29udGFpbnNFcnJvck1lc3NhZ2UoIHRydWUsIHsgdmFsdWVUeXBlOiAnbnVtYmVyJywgdmFsaWRhdGlvbk1lc3NhZ2U6ICd2YWx1ZVR5cGUgbnVtYmVyLCB2YWx1ZSBib29sZWFuJyB9ICk7XHJcbiAgdGVzdENvbnRhaW5zRXJyb3JNZXNzYWdlKCB0cnVlLCB7IHZhbHVlVHlwZTogWyAnc3RyaW5nJywgJ251bWJlcicgXSwgdmFsaWRhdGlvbk1lc3NhZ2U6ICd2YWx1ZVR5cGUgc3RyaW5nYCxudW1iZXIgdmFsdWUgYm9vbGVhbicgfSApO1xyXG4gIHRlc3RDb250YWluc0Vycm9yTWVzc2FnZSggdHJ1ZSwgeyB2YWx1ZVR5cGU6IFsgbnVsbCwgJ251bWJlcicgXSwgdmFsaWRhdGlvbk1lc3NhZ2U6ICd2YWx1ZVR5cGUgbnVsbCxudW1iZXIgdmFsdWUgYm9vbGVhbicgfSApO1xyXG4gIHRlc3RDb250YWluc0Vycm9yTWVzc2FnZSggZmFsc2UsIHsgdmFsaWRWYWx1ZXM6IFsgJ2hpJywgdHJ1ZSBdLCB2YWxpZGF0aW9uTWVzc2FnZTogJ3ZhbGlkVmFsdWVzIHdpdGggdmFsdWU6ZmFsc2UnIH0gKTtcclxuICB0ZXN0Q29udGFpbnNFcnJvck1lc3NhZ2UoIDUsIHsgdmFsaWRWYWx1ZXM6IFsgJ2hpJywgdHJ1ZSBdLCB2YWxpZGF0aW9uTWVzc2FnZTogJ3ZhbGlkVmFsdWVzIHdpdGggdmFsdWU6NScgfSApO1xyXG4gIHRlc3RDb250YWluc0Vycm9yTWVzc2FnZSggNCwgeyBpc1ZhbGlkVmFsdWU6IHYgPT4gdiA9PT0gMywgdmFsaWRhdGlvbk1lc3NhZ2U6ICdpc1ZhbGlkVmFsdWUgMywgdmFsdWUgNCcgfSApO1xyXG4gIHRlc3RDb250YWluc0Vycm9yTWVzc2FnZSggJ29oIGhlbGxvJywgeyBwaGV0aW9UeXBlOiBQcm9wZXJ0eS5Qcm9wZXJ0eUlPKCBCb29sZWFuSU8gKSwgdmFsaWRhdGlvbk1lc3NhZ2U6ICdpc1ZhbGlkVmFsdWUgMywgdmFsdWUgc3RyaW5nJyB9ICk7XHJcblxyXG4gIGNvbnN0IGlvVHlwZSA9IG5ldyBJT1R5cGUoICdUZXN0SU8nLCB7IHZhbHVlVHlwZTogJ2Jvb2xlYW4nIH0gKTtcclxuICBjb25zdCBpb1R5cGVWYWxpZGF0aW9uTWVzc2FnZSA9ICdzaG91bGQgYmUgYSBib29sZWFuIGZyb20gdGhpcyBJT1R5cGUgaW4gdGVzdHMnO1xyXG5cclxuICBpb1R5cGUudmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlID0gaW9UeXBlVmFsaWRhdGlvbk1lc3NhZ2U7XHJcbiAgdGVzdENvbnRhaW5zRXJyb3JNZXNzYWdlKCAnaGknLCB7IHBoZXRpb1R5cGU6IGlvVHlwZSB9LCBpb1R5cGVWYWxpZGF0aW9uTWVzc2FnZSApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAndGVzdCBWYWxpZGF0b3IudmFsaWRhdG9ycycsIGFzc2VydCA9PiB7XHJcblxyXG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB7IHZhbGlkYXRvcnM6IFsgeyB2YWx1ZVR5cGU6ICdib29sZWFuJyB9LCB7IGlzVmFsaWRWYWx1ZTogdiA9PiB2ID09PSBmYWxzZSB9IF0gfSApLCAnY29ycmVjdCB2YWxpZGF0b3InICk7XHJcblxyXG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICBhc3NlcnQub2soIFZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCB7IHZhbGlkYXRvcnM6IFsgeyB2YWx1ZVR5cGU6ICdib29sZWFuJyB9LCB7IGlzVmFsaWRWYWx1ZTogNyB9IF0gfSApLCAnaW5jb3JyZWN0IHZhbGlkYXRvcicgKTtcclxuXHJcbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5nZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IoIHsgdmFsaWRhdG9yczogWyB7IHZhbHVlVHlwZTogJ2Jvb2xlYW4nIH0sIDcgXSB9ICksICdpbmNvcnJlY3QgdmFsaWRhdG9yMicgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmdldFZhbGlkYXRpb25FcnJvciggJzcnLCB7IHZhbGlkYXRvcnM6IFsgeyB2YWx1ZVR5cGU6ICdib29sZWFuJyB9LCB7IGlzVmFsaWRWYWx1ZTogdiA9PiB2ID09PSBmYWxzZSB9IF0gfSApICk7XHJcbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmdldFZhbGlkYXRpb25FcnJvciggdHJ1ZSwgeyB2YWxpZGF0b3JzOiBbIHsgdmFsdWVUeXBlOiAnYm9vbGVhbicgfSwgeyBpc1ZhbGlkVmFsdWU6IHYgPT4gdiA9PT0gZmFsc2UgfSBdIH0gKSApO1xyXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5nZXRWYWxpZGF0aW9uRXJyb3IoIHVuZGVmaW5lZCwgeyB2YWxpZGF0b3JzOiBbIHsgdmFsdWVUeXBlOiAnYm9vbGVhbicgfSwgeyBpc1ZhbGlkVmFsdWU6IHYgPT4gdiA9PT0gZmFsc2UgfSBdIH0gKSApO1xyXG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uZ2V0VmFsaWRhdGlvbkVycm9yKCBmYWxzZSwgeyB2YWxpZGF0b3JzOiBbIHsgdmFsdWVUeXBlOiAnYm9vbGVhbicgfSwgeyBpc1ZhbGlkVmFsdWU6IHYgPT4gdiA9PT0gZmFsc2UgfSBdIH0gKSApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnVmFsaWRhdG9yLnZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5JywgYXNzZXJ0ID0+IHtcclxuXHJcbiAgY29uc3QgbXlWYWx1ZUFycmF5ID0gWyA3LCA2LCA1IF07XHJcblxyXG4gIC8vIEB0cy1leHBlY3QtZXJyb3Igd3JvbmcgdmFsdWUgZm9yIHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5XHJcbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmdldFZhbGlkYXRvclZhbGlkYXRpb25FcnJvciggeyB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneTogJ3JlZmVyZmRzYWZkc2VuY2UnIH0gKSxcclxuICAgICd0aGF0IGlzIG5vdCBhIGNvcnJlY3QgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3knICk7XHJcblxyXG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uZ2V0VmFsaWRhdGlvbkVycm9yKCBteVZhbHVlQXJyYXksIHtcclxuICAgIHZhbGlkYXRvcnM6IFsgeyB2YWxpZFZhbHVlczogWyBteVZhbHVlQXJyYXkgXSwgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdyZWZlcmVuY2UnIH0gXVxyXG4gIH0gKSApO1xyXG5cclxuICBhc3NlcnQub2soICFWYWxpZGF0aW9uLmdldFZhbGlkYXRpb25FcnJvciggbXlWYWx1ZUFycmF5LCB7XHJcbiAgICB2YWxpZGF0b3JzOiBbIHsgdmFsaWRWYWx1ZXM6IFsgWyA3LCA2LCA1IF0gXSwgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdsb2Rhc2hEZWVwJyB9IF1cclxuICB9ICkgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmdldFZhbGlkYXRpb25FcnJvciggbXlWYWx1ZUFycmF5LCB7XHJcbiAgICB2YWxpZGF0b3JzOiBbIHsgdmFsaWRWYWx1ZXM6IFsgWyA3LCA2LCA1IF0gXSwgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdyZWZlcmVuY2UnIH0gXVxyXG4gIH0gKSwgJ1RoYXQgaXNuXFwndCB0aGUgc2FtZSBhcnJheSEnICk7XHJcblxyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG4gICAgVmFsaWRhdGlvbi5nZXRWYWxpZGF0aW9uRXJyb3IoIG15VmFsdWVBcnJheSwge1xyXG4gICAgICB2YWxpZGF0b3JzOiBbIHsgdmFsaWRWYWx1ZXM6IFsgWyA3LCA2LCA1IF0gXSwgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdlcXVhbHNGdW5jdGlvbicgfSBdXHJcbiAgICB9ICk7XHJcbiAgfSwgJ2FycmF5cyBkbyBub3QgaGF2ZSBhbiBlcXVhbHMgZnVuY3Rpb24nICk7XHJcblxyXG4gIGFzc2VydC5vayggIVZhbGlkYXRpb24uZ2V0VmFsaWRhdGlvbkVycm9yKCBuZXcgVmVjdG9yMiggMCwgMCApLCB7XHJcbiAgICB2YWxpZGF0b3JzOiBbIHsgdmFsaWRWYWx1ZXM6IFsgbmV3IFZlY3RvcjIoIDAsIDEgKSwgbmV3IFZlY3RvcjIoIDAsIDAgKSBdLCB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneTogJ2VxdWFsc0Z1bmN0aW9uJyB9IF1cclxuICB9ICkgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBWYWxpZGF0aW9uLmdldFZhbGlkYXRpb25FcnJvciggbmV3IFZlY3RvcjIoIDAsIDIgKSwge1xyXG4gICAgdmFsaWRhdG9yczogWyB7IHZhbGlkVmFsdWVzOiBbIG5ldyBWZWN0b3IyKCAwLCAxICksIG5ldyBWZWN0b3IyKCAwLCAwICkgXSwgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdlcXVhbHNGdW5jdGlvbicgfSBdXHJcbiAgfSApICk7XHJcblxyXG4gIGFzc2VydC5vayggVmFsaWRhdGlvbi5nZXRWYWxpZGF0aW9uRXJyb3I8VmVjdG9yMj4oIG5ldyBWZWN0b3IyKCAwLCAyICksIHtcclxuICAgIHZhbGlkYXRvcnM6IFsge1xyXG4gICAgICB2YWxpZFZhbHVlczogWyBuZXcgVmVjdG9yMiggMCwgMTAwICksIG5ldyBWZWN0b3IyKCAyLCAyICkgXSxcclxuXHJcbiAgICAgIC8vIGNvbXBhcmUgb25seSB0aGUgeCB2YWx1ZXMuXHJcbiAgICAgIHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5OiAoIGEsIGIgKSA9PiBhLnggPT09IGIueFxyXG4gICAgfSBdXHJcbiAgfSApICk7XHJcbn0gKTsiXSwibWFwcGlu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