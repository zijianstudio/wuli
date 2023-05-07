// Copyright 2019-2022, University of Colorado Boulder

import Property from '../../axon/js/Property.js';
import EnumerationDeprecated from './EnumerationDeprecated.js';
import merge from './merge.js';
QUnit.module('merge');

// test proper merger for 2 objects
QUnit.test('merge two objects', assert => {
  const original = {
    prop1: 'value1',
    prop2: 'value2',
    subcomponentOptions: {
      subProp1: 'subValue1',
      subProp2: 'subValue2'
    },
    subcomponentOptions2: {
      subSubcomponentOptions: {
        subSubProp1: 'subSubValue1'
      }
    },
    prop3: 'value3'
  };
  const merge1 = {
    subcomponentOptions: {
      subProp1: 'subvalue1 changed',
      subProp3: 'new subvalue'
    },
    subcomponentOptions2: {
      subSubcomponentOptions: {
        subSubProp1: 'all gone now',
        test: 'this is here too'
      }
    },
    prop3: 'new value3',
    prop4: 'value4'
  };
  const preMergeSourceCopy = Object.assign({}, merge1);
  const merged = merge(original, merge1);
  assert.equal(merged.prop1, 'value1', 'merge should not alter target keys that aren\'t in the source');
  assert.equal(merged.prop4, 'value4', 'merge should not alter source keys that aren\'t in the target');
  let shouldBe = {
    subProp1: 'subvalue1 changed',
    subProp2: 'subValue2',
    subProp3: 'new subvalue'
  };
  assert.deepEqual(merged.subcomponentOptions, shouldBe, 'merge should combine singly nested objects');
  shouldBe = {
    prop1: 'value1',
    prop2: 'value2',
    subcomponentOptions: {
      subProp1: 'subvalue1 changed',
      subProp3: 'new subvalue',
      subProp2: 'subValue2'
    },
    subcomponentOptions2: {
      subSubcomponentOptions: {
        subSubProp1: 'all gone now',
        test: 'this is here too'
      }
    },
    prop3: 'new value3',
    prop4: 'value4'
  };
  assert.deepEqual(merged, shouldBe, 'merge should combine arbitrarily nested objects');
  assert.deepEqual(merge1, preMergeSourceCopy, 'merge should not alter sources');
});

// test multiple objects
QUnit.test('test multiple objects', assert => {
  const original = {
    prop1: 'value1',
    prop2: 'value2',
    subcomponentOptions: {
      subProp1: 'subValue1',
      subProp2: 'subValue2'
    },
    subcomponentOptions2: {
      subSubcomponentOptions: {
        subSubProp1: 'subSubValue1'
      }
    },
    prop3: 'value3'
  };
  const merge1 = {
    subcomponentOptions: {
      subProp1: 'subvalue1 changed',
      subProp3: 'new subvalue',
      except: 'me'
    },
    subcomponentOptions2: {
      subSubcomponentOptions: {
        subSubProp1: 'all gone now',
        test: 'this is here too'
      }
    },
    prop3: 'new value3',
    prop4: 'value4'
  };
  const merge2 = {
    prop5: 'value5',
    subcomponentOptions: {
      subProp1: 'everything',
      subProp2: 'here is',
      subProp3: 'from',
      subProp4: 'merge2'
    }
  };
  const merge3 = {
    prop6: 'value6',
    prop5: 'value5 from merge3',
    subcomponentOptions: {
      subProp5: 'BONJOUR'
    },
    subcomponentOptions2: {
      test2: ['test2', 'test3'],
      subSubcomponentOptions: {
        test: 'test form merge3',
        subSubProp1: 'subSub from merge3'
      }
    }
  };
  const merge1Copy = _.cloneDeep(merge1);
  const merge2Copy = _.cloneDeep(merge2);
  const merge3Copy = _.cloneDeep(merge3);
  Object.freeze(merge1);
  Object.freeze(merge2);
  Object.freeze(merge3);
  const merged = merge(original, merge1, merge2, merge3);
  const expected = {
    prop1: 'value1',
    prop2: 'value2',
    subcomponentOptions: {
      subProp1: 'everything',
      subProp2: 'here is',
      subProp3: 'from',
      subProp4: 'merge2',
      except: 'me',
      subProp5: 'BONJOUR'
    },
    subcomponentOptions2: {
      test2: ['test2', 'test3'],
      subSubcomponentOptions: {
        test: 'test form merge3',
        subSubProp1: 'subSub from merge3'
      }
    },
    prop3: 'new value3',
    prop4: 'value4',
    prop5: 'value5 from merge3',
    prop6: 'value6'
  };
  assert.notEqual(merged, expected, 'sanity check: ensure merged and expected objects are not the same reference');
  assert.deepEqual(merged, expected, 'merge should properly combine multiple objects');
  assert.deepEqual(merge1, merge1Copy, 'merge should not alter source objects');
  assert.deepEqual(merge2, merge2Copy, 'merge should not alter source objects');
  assert.deepEqual(merge3, merge3Copy, 'merge should not alter source objects');
});

// check that it errors loudly if something other than an object is used
QUnit.test('check for proper assertion errors', assert => {
  const original = {
    subOptions: {
      test: 'val',
      test2: 'val2'
    }
  };
  const TestClass = class {
    constructor() {
      this.test = 'class';
    }
  };
  const merges = {
    a: {
      subOptions: ['val', 'val2']
    },
    b: {
      subOptions: Object.create({
        test: 'a',
        test1: 3
      })
    },
    c: {
      subOptions: 'a string to test'
    },
    d: {
      subOptions: 42
    },
    e: {
      // @ts-expect-error
      subOptions: function () {
        this.a = 42;
      }
    },
    f: {
      subOptions: new TestClass()
    }
  };
  const getterMerge = {
    get subOptions() {
      return {
        test: 'should not work'
      };
    }
  };
  if (window.assert) {
    assert.throws(() => merge(original, merges.a), 'merge should not allow arrays to be merged');
    assert.throws(() => merge(original, merges.b), 'merge should not allow inherited objects to be merged');
    assert.throws(() => merge(original, merges.f), 'merge should not allow instances to be merged');
    assert.throws(() => merge(original, merges.c), 'merge should not allow strings to be merged');
    assert.throws(() => merge(original, merges.d), 'merge should not allow numbers to be merged');
    assert.throws(() => merge(original, merges.e), 'merge should not allow functions to be merged');
    assert.throws(() => merge(original, getterMerge), 'merge should not work with getters');

    // @ts-expect-error INTENTIONAL
    assert.throws(() => merge(original), 'merge should not work without a source');
  }
  assert.equal(1, 1, 'for no ?ea query param');
});
QUnit.test('check for reference level equality (e.g. for object literals, Properties, Enumerations)', assert => {
  const testEnum = {
    A: {
      testA: 'valueA'
    },
    B: {
      testB: 'valueB'
    },
    C: {
      testC: 'valueC'
    }
  };
  const testProperty = {
    value: 42
  };
  const testProperty2 = {
    value: 'forty two'
  };
  const original = {
    prop: testProperty,
    nestedOptions: {
      needsAnEnum: testEnum.A,
      moreOptions: {
        needsAnEnum: testEnum.C
      }
    }
  };
  const merger = {
    prop: testProperty2,
    nestedOptions: {
      needsAnEnum: testEnum.B,
      moreOptions: {
        needsDifferentEnum: testEnum.A
      }
    }
  };
  const originalCopy = _.cloneDeep(original);
  Object.freeze(original);
  const mergedFresh = merge({}, original, merger);
  assert.equal(original.prop.value, originalCopy.prop.value, 'merge should not alter source object values');
  assert.ok(_.isEqual(original, originalCopy), 'merge should not alter source objects');
  assert.equal(mergedFresh.nestedOptions.needsAnEnum, testEnum.B, 'merge should preserve references to overwritten object literals');
  assert.equal(mergedFresh.nestedOptions.moreOptions.needsAnEnum, testEnum.C, 'merge should preserve object literals from target');
  assert.equal(mergedFresh.nestedOptions.moreOptions.needsDifferentEnum, testEnum.A, 'merge should preserve object literals from source');
  mergedFresh.prop.value = 'forty three';
  assert.equal(testProperty2.value, 'forty three', 'merge should pass object literal references');
  assert.equal(testProperty.value, 42, 'original object literal should be overwritten');
  const merged = merge({}, original, merger);
  assert.ok(merged.nestedOptions.needsAnEnum === testEnum.B, 'merge should preserve overwritten EnumerationDeprecated types');
  assert.ok(merged.nestedOptions.moreOptions.needsAnEnum === testEnum.C, 'merge should preserve EnumerationDeprecated types from target');
  assert.ok(merged.nestedOptions.moreOptions.needsDifferentEnum === testEnum.A, 'merge should preserve EnumerationDeprecated types from source');
});
QUnit.test('try a horribly nested case', assert => {
  const original = {
    p1Options: {
      n1Options: {
        n2Options: {
          n3Options: {
            n4Options: {
              n5: 'overwrite me'
            }
          }
        }
      }
    },
    p2Options: {
      n1Options: {
        p3: 'keep me'
      }
    }
  };
  const merge1 = {
    p1Options: {
      n1Options: {
        n2Options: {
          n3Options: {
            n4Options: {
              n5: 'overwritten'
            }
          }
        }
      }
    },
    p2Options: {
      n1Options: {
        p4: 'p3 kept',
        n2Options: {
          n3Options: {
            n4Options: {
              n5Options: {
                n6Options: {
                  p5: 'never make options like this'
                }
              }
            }
          }
        }
      }
    }
  };
  Object.freeze(merge1);
  const merged = merge(original, merge1);
  const expected = {
    p1Options: {
      n1Options: {
        n2Options: {
          n3Options: {
            n4Options: {
              n5: 'overwritten'
            }
          }
        }
      }
    },
    p2Options: {
      n1Options: {
        p3: 'keep me',
        p4: 'p3 kept',
        n2Options: {
          n3Options: {
            n4Options: {
              n5Options: {
                n6Options: {
                  p5: 'never make options like this'
                }
              }
            }
          }
        }
      }
    }
  };
  assert.deepEqual(merged, expected, 'merge should handle some deeply nested stuff');
});
QUnit.test('minor change', assert => {
  const a = {
    sliderOptions: {
      hello: 'there'
    }
  };
  const b = {
    sliderOptions: {
      time: 'now'
    }
  };
  merge({}, a, b);
  assert.ok(!a.sliderOptions.hasOwnProperty('time'), 'time shouldnt leak over to a');
});
QUnit.test('test wrong args', assert => {
  if (window.assert) {
    // in first arg
    assert.throws(() => merge(undefined, {}), 'unsupported first arg "undefined"');
    assert.throws(() => merge(null, {}), 'unsupported arg "null"');
    assert.throws(() => merge(true, {}), 'unsupported arg "boolean"');
    assert.throws(() => merge('hello', {}), 'unsupported arg "string"');
    assert.throws(() => merge(4, {}), 'unsupported arg "number"');
    assert.throws(() => merge(Image, {}), 'unsupported arg of Object with extra prototype');
    assert.throws(() => merge({
      get hi() {
        return 3;
      }
    }, {}), 'unsupported arg with getter');
    assert.throws(() => merge({
      set hi(stuff) {/* noop */}
    }, {}), 'unsupported arg with setter');

    // in second arg
    assert.throws(() => merge({}, true, {}), 'unsupported second arg "boolean"');
    assert.throws(() => merge({}, 'hello', {}), 'unsupported second arg "string"');
    assert.throws(() => merge({}, 4, {}), 'unsupported second arg "number"');
    assert.throws(() => merge({}, Image, {}), 'unsupported second arg of Object with extra prototype');
    assert.throws(() => merge({}, {
      get hi() {
        return 3;
      }
    }, {}), 'unsupported second arg with getter');
    assert.throws(() => merge({}, {
      set hi(stuff) {/* noop */}
    }, {}), 'unsupported second arg with setter');

    // in second arg with no third object
    assert.throws(() => merge({}, true), 'unsupported second arg with no third "boolean"');
    assert.throws(() => merge({}, 'hello'), 'unsupported second arg with no third "string"');
    assert.throws(() => merge({}, 4), 'unsupported second arg with no third "number"');
    assert.throws(() => merge({}, Image), 'unsupported second arg with no third of Object with extra prototype');
    assert.throws(() => merge({}, {
      get hi() {
        return 3;
      }
    }), 'unsupported second arg with no third with getter');
    assert.throws(() => merge({}, {
      set hi(stuff) {/* noop */}
    }), 'unsupported second arg with no third with getter');

    // in some options
    assert.throws(() => merge({}, {
      someOptions: true
    }, {}), 'unsupported arg in options "boolean"');
    assert.throws(() => merge({}, {
      someOptions: 'hello'
    }, {}), 'unsupported arg in options "string"');
    assert.throws(() => merge({}, {
      someOptions: 4
    }, {}), 'unsupported arg in options "number"');
    assert.throws(() => merge({}, {
      someOptions: Image
    }, {}), 'unsupported arg in options of Object with extra prototype');
    assert.throws(() => merge({}, {
      someOptions: {
        get hi() {
          return 3;
        }
      }
    }, {}), 'unsupported arg in options with getter');
    assert.throws(() => merge({}, {
      someOptions: {
        set hi(stuff) {/* noop */}
      }
    }, {}), 'unsupported arg in options with getter');
  } else {
    assert.ok(true, 'no assertions enabled');
  }

  // allowed cases that should not error
  merge({}, null, {});
  merge({}, null);
  merge({}, {}, null);
  merge({
    xOptions: {
      test: 1
    }
  }, {
    xOptions: null
  });
  merge({}, {
    someOptions: null
  }, {});
  merge({}, {
    someOptions: undefined
  }, {});
});
QUnit.test('do not recurse for non *Options', assert => {
  const testFirstProperty = new Property('hi');
  const testSecondProperty = new Property('hi2');
  const TestEnumeration = EnumerationDeprecated.byKeys(['ONE', 'TWO']);
  const TestEnumeration2 = EnumerationDeprecated.byKeys(['ONE1', 'TWO2']);
  const original = {
    prop: testFirstProperty,
    enum: TestEnumeration,
    someOptions: {
      nestedProp: testFirstProperty
    }
  };
  let newObject = merge({}, original);
  assert.ok(_.isEqual(original, newObject), 'should be equal from reference equality');
  assert.ok(original.prop === newObject.prop, 'same Property');
  assert.ok(original.enum === newObject.enum, 'same EnumerationDeprecated');

  // test defaults with other non mergeable objects
  newObject = merge({
    prop: testSecondProperty,
    enum: TestEnumeration2,
    someOptions: {
      nestedProp: testSecondProperty
    }
  }, original);
  assert.ok(_.isEqual(original, newObject), 'should be equal');
  assert.ok(original.prop === newObject.prop, 'same Property, ignore default');
  assert.ok(original.enum === newObject.enum, 'same EnumerationDeprecated, ignore default');
});
QUnit.test('support optional options', assert => {
  const mergeXYZ = options => {
    return merge({
      x: 1,
      y: 2,
      z: 3
    }, options);
  };
  const noOptions = mergeXYZ();
  assert.ok(noOptions.x === 1, 'x property should be merged from default');
  assert.ok(noOptions.y === 2, 'y property should be merged from default');
  assert.ok(noOptions.z === 3, 'z property should be merged from default');
  const testNestedFunctionCallOptions = options => {
    return mergeXYZ(merge({
      x: 2,
      g: 54,
      treeSays: 'hello'
    }, options));
  };
  const noOptions2 = testNestedFunctionCallOptions();
  assert.ok(noOptions2.x === 2, 'x property should be merged from default');
  assert.ok(noOptions2.y === 2, 'y property should be merged from default');
  assert.ok(noOptions2.z === 3, 'z property should be merged from default');
  assert.ok(noOptions2.g === 54, 'g property should be merged from default');
  assert.ok(noOptions2.treeSays === 'hello', 'property should be merged from default');
});
QUnit.test('does not support deep equals on keyname of "Options"', assert => {
  const referenceObject = {
    hello: 2
  };
  const merged = merge({}, {
    Options: referenceObject
  });
  const deepMerged = merge({}, {
    someOptions: referenceObject
  });
  assert.ok(merged.Options === referenceObject, '"Options" should not deep equal');
  referenceObject.hello = 3;
  assert.ok(merged.Options.hello === 3, 'value should change because it is a reference');
  assert.ok(deepMerged.someOptions.hello === 2, 'value should not change because it was deep copied');
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkVudW1lcmF0aW9uRGVwcmVjYXRlZCIsIm1lcmdlIiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0Iiwib3JpZ2luYWwiLCJwcm9wMSIsInByb3AyIiwic3ViY29tcG9uZW50T3B0aW9ucyIsInN1YlByb3AxIiwic3ViUHJvcDIiLCJzdWJjb21wb25lbnRPcHRpb25zMiIsInN1YlN1YmNvbXBvbmVudE9wdGlvbnMiLCJzdWJTdWJQcm9wMSIsInByb3AzIiwibWVyZ2UxIiwic3ViUHJvcDMiLCJwcm9wNCIsInByZU1lcmdlU291cmNlQ29weSIsIk9iamVjdCIsImFzc2lnbiIsIm1lcmdlZCIsImVxdWFsIiwic2hvdWxkQmUiLCJkZWVwRXF1YWwiLCJleGNlcHQiLCJtZXJnZTIiLCJwcm9wNSIsInN1YlByb3A0IiwibWVyZ2UzIiwicHJvcDYiLCJzdWJQcm9wNSIsInRlc3QyIiwibWVyZ2UxQ29weSIsIl8iLCJjbG9uZURlZXAiLCJtZXJnZTJDb3B5IiwibWVyZ2UzQ29weSIsImZyZWV6ZSIsImV4cGVjdGVkIiwibm90RXF1YWwiLCJzdWJPcHRpb25zIiwiVGVzdENsYXNzIiwiY29uc3RydWN0b3IiLCJtZXJnZXMiLCJhIiwiYiIsImNyZWF0ZSIsInRlc3QxIiwiYyIsImQiLCJlIiwiZiIsImdldHRlck1lcmdlIiwid2luZG93IiwidGhyb3dzIiwidGVzdEVudW0iLCJBIiwidGVzdEEiLCJCIiwidGVzdEIiLCJDIiwidGVzdEMiLCJ0ZXN0UHJvcGVydHkiLCJ2YWx1ZSIsInRlc3RQcm9wZXJ0eTIiLCJwcm9wIiwibmVzdGVkT3B0aW9ucyIsIm5lZWRzQW5FbnVtIiwibW9yZU9wdGlvbnMiLCJtZXJnZXIiLCJuZWVkc0RpZmZlcmVudEVudW0iLCJvcmlnaW5hbENvcHkiLCJtZXJnZWRGcmVzaCIsIm9rIiwiaXNFcXVhbCIsInAxT3B0aW9ucyIsIm4xT3B0aW9ucyIsIm4yT3B0aW9ucyIsIm4zT3B0aW9ucyIsIm40T3B0aW9ucyIsIm41IiwicDJPcHRpb25zIiwicDMiLCJwNCIsIm41T3B0aW9ucyIsIm42T3B0aW9ucyIsInA1Iiwic2xpZGVyT3B0aW9ucyIsImhlbGxvIiwidGltZSIsImhhc093blByb3BlcnR5IiwidW5kZWZpbmVkIiwiSW1hZ2UiLCJoaSIsInN0dWZmIiwic29tZU9wdGlvbnMiLCJ4T3B0aW9ucyIsInRlc3RGaXJzdFByb3BlcnR5IiwidGVzdFNlY29uZFByb3BlcnR5IiwiVGVzdEVudW1lcmF0aW9uIiwiYnlLZXlzIiwiVGVzdEVudW1lcmF0aW9uMiIsImVudW0iLCJuZXN0ZWRQcm9wIiwibmV3T2JqZWN0IiwibWVyZ2VYWVoiLCJvcHRpb25zIiwieCIsInkiLCJ6Iiwibm9PcHRpb25zIiwidGVzdE5lc3RlZEZ1bmN0aW9uQ2FsbE9wdGlvbnMiLCJnIiwidHJlZVNheXMiLCJub09wdGlvbnMyIiwicmVmZXJlbmNlT2JqZWN0IiwiT3B0aW9ucyIsImRlZXBNZXJnZWQiXSwic291cmNlcyI6WyJtZXJnZVRlc3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uRGVwcmVjYXRlZCBmcm9tICcuL0VudW1lcmF0aW9uRGVwcmVjYXRlZC5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuL21lcmdlLmpzJztcclxuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4vdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xyXG5cclxuUVVuaXQubW9kdWxlKCAnbWVyZ2UnICk7XHJcblxyXG4vLyB0ZXN0IHByb3BlciBtZXJnZXIgZm9yIDIgb2JqZWN0c1xyXG5RVW5pdC50ZXN0KCAnbWVyZ2UgdHdvIG9iamVjdHMnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IG9yaWdpbmFsID0ge1xyXG4gICAgcHJvcDE6ICd2YWx1ZTEnLFxyXG4gICAgcHJvcDI6ICd2YWx1ZTInLFxyXG4gICAgc3ViY29tcG9uZW50T3B0aW9uczoge1xyXG4gICAgICBzdWJQcm9wMTogJ3N1YlZhbHVlMScsXHJcbiAgICAgIHN1YlByb3AyOiAnc3ViVmFsdWUyJ1xyXG4gICAgfSxcclxuICAgIHN1YmNvbXBvbmVudE9wdGlvbnMyOiB7XHJcbiAgICAgIHN1YlN1YmNvbXBvbmVudE9wdGlvbnM6IHtcclxuICAgICAgICBzdWJTdWJQcm9wMTogJ3N1YlN1YlZhbHVlMSdcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHByb3AzOiAndmFsdWUzJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IG1lcmdlMSA9IHtcclxuICAgIHN1YmNvbXBvbmVudE9wdGlvbnM6IHtcclxuICAgICAgc3ViUHJvcDE6ICdzdWJ2YWx1ZTEgY2hhbmdlZCcsXHJcbiAgICAgIHN1YlByb3AzOiAnbmV3IHN1YnZhbHVlJ1xyXG4gICAgfSxcclxuICAgIHN1YmNvbXBvbmVudE9wdGlvbnMyOiB7XHJcbiAgICAgIHN1YlN1YmNvbXBvbmVudE9wdGlvbnM6IHtcclxuICAgICAgICBzdWJTdWJQcm9wMTogJ2FsbCBnb25lIG5vdycsXHJcbiAgICAgICAgdGVzdDogJ3RoaXMgaXMgaGVyZSB0b28nXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBwcm9wMzogJ25ldyB2YWx1ZTMnLFxyXG4gICAgcHJvcDQ6ICd2YWx1ZTQnXHJcbiAgfTtcclxuICBjb25zdCBwcmVNZXJnZVNvdXJjZUNvcHkgPSBPYmplY3QuYXNzaWduKCB7fSwgbWVyZ2UxICk7XHJcbiAgY29uc3QgbWVyZ2VkID0gbWVyZ2UoIG9yaWdpbmFsLCBtZXJnZTEgKTtcclxuXHJcbiAgYXNzZXJ0LmVxdWFsKCBtZXJnZWQucHJvcDEsICd2YWx1ZTEnLCAnbWVyZ2Ugc2hvdWxkIG5vdCBhbHRlciB0YXJnZXQga2V5cyB0aGF0IGFyZW5cXCd0IGluIHRoZSBzb3VyY2UnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBtZXJnZWQucHJvcDQsICd2YWx1ZTQnLCAnbWVyZ2Ugc2hvdWxkIG5vdCBhbHRlciBzb3VyY2Uga2V5cyB0aGF0IGFyZW5cXCd0IGluIHRoZSB0YXJnZXQnICk7XHJcblxyXG4gIGxldCBzaG91bGRCZTogSW50ZW50aW9uYWxBbnkgPSB7XHJcbiAgICBzdWJQcm9wMTogJ3N1YnZhbHVlMSBjaGFuZ2VkJyxcclxuICAgIHN1YlByb3AyOiAnc3ViVmFsdWUyJyxcclxuICAgIHN1YlByb3AzOiAnbmV3IHN1YnZhbHVlJ1xyXG4gIH07XHJcbiAgYXNzZXJ0LmRlZXBFcXVhbCggbWVyZ2VkLnN1YmNvbXBvbmVudE9wdGlvbnMsIHNob3VsZEJlLCAnbWVyZ2Ugc2hvdWxkIGNvbWJpbmUgc2luZ2x5IG5lc3RlZCBvYmplY3RzJyApO1xyXG5cclxuICBzaG91bGRCZSA9IHtcclxuICAgIHByb3AxOiAndmFsdWUxJyxcclxuICAgIHByb3AyOiAndmFsdWUyJyxcclxuICAgIHN1YmNvbXBvbmVudE9wdGlvbnM6IHtcclxuICAgICAgc3ViUHJvcDE6ICdzdWJ2YWx1ZTEgY2hhbmdlZCcsXHJcbiAgICAgIHN1YlByb3AzOiAnbmV3IHN1YnZhbHVlJyxcclxuICAgICAgc3ViUHJvcDI6ICdzdWJWYWx1ZTInXHJcbiAgICB9LFxyXG4gICAgc3ViY29tcG9uZW50T3B0aW9uczI6IHtcclxuICAgICAgc3ViU3ViY29tcG9uZW50T3B0aW9uczoge1xyXG4gICAgICAgIHN1YlN1YlByb3AxOiAnYWxsIGdvbmUgbm93JyxcclxuICAgICAgICB0ZXN0OiAndGhpcyBpcyBoZXJlIHRvbydcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHByb3AzOiAnbmV3IHZhbHVlMycsXHJcbiAgICBwcm9wNDogJ3ZhbHVlNCdcclxuICB9O1xyXG4gIGFzc2VydC5kZWVwRXF1YWwoIG1lcmdlZCwgc2hvdWxkQmUsICdtZXJnZSBzaG91bGQgY29tYmluZSBhcmJpdHJhcmlseSBuZXN0ZWQgb2JqZWN0cycgKTtcclxuICBhc3NlcnQuZGVlcEVxdWFsKCBtZXJnZTEsIHByZU1lcmdlU291cmNlQ29weSwgJ21lcmdlIHNob3VsZCBub3QgYWx0ZXIgc291cmNlcycgKTtcclxufSApO1xyXG5cclxuLy8gdGVzdCBtdWx0aXBsZSBvYmplY3RzXHJcblFVbml0LnRlc3QoICd0ZXN0IG11bHRpcGxlIG9iamVjdHMnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IG9yaWdpbmFsID0ge1xyXG4gICAgcHJvcDE6ICd2YWx1ZTEnLFxyXG4gICAgcHJvcDI6ICd2YWx1ZTInLFxyXG4gICAgc3ViY29tcG9uZW50T3B0aW9uczoge1xyXG4gICAgICBzdWJQcm9wMTogJ3N1YlZhbHVlMScsXHJcbiAgICAgIHN1YlByb3AyOiAnc3ViVmFsdWUyJ1xyXG4gICAgfSxcclxuICAgIHN1YmNvbXBvbmVudE9wdGlvbnMyOiB7XHJcbiAgICAgIHN1YlN1YmNvbXBvbmVudE9wdGlvbnM6IHtcclxuICAgICAgICBzdWJTdWJQcm9wMTogJ3N1YlN1YlZhbHVlMSdcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHByb3AzOiAndmFsdWUzJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IG1lcmdlMSA9IHtcclxuICAgIHN1YmNvbXBvbmVudE9wdGlvbnM6IHtcclxuICAgICAgc3ViUHJvcDE6ICdzdWJ2YWx1ZTEgY2hhbmdlZCcsXHJcbiAgICAgIHN1YlByb3AzOiAnbmV3IHN1YnZhbHVlJyxcclxuICAgICAgZXhjZXB0OiAnbWUnXHJcbiAgICB9LFxyXG4gICAgc3ViY29tcG9uZW50T3B0aW9uczI6IHtcclxuICAgICAgc3ViU3ViY29tcG9uZW50T3B0aW9uczoge1xyXG4gICAgICAgIHN1YlN1YlByb3AxOiAnYWxsIGdvbmUgbm93JyxcclxuICAgICAgICB0ZXN0OiAndGhpcyBpcyBoZXJlIHRvbydcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHByb3AzOiAnbmV3IHZhbHVlMycsXHJcbiAgICBwcm9wNDogJ3ZhbHVlNCdcclxuICB9O1xyXG5cclxuICBjb25zdCBtZXJnZTIgPSB7XHJcbiAgICBwcm9wNTogJ3ZhbHVlNScsXHJcbiAgICBzdWJjb21wb25lbnRPcHRpb25zOiB7XHJcbiAgICAgIHN1YlByb3AxOiAnZXZlcnl0aGluZycsXHJcbiAgICAgIHN1YlByb3AyOiAnaGVyZSBpcycsXHJcbiAgICAgIHN1YlByb3AzOiAnZnJvbScsXHJcbiAgICAgIHN1YlByb3A0OiAnbWVyZ2UyJ1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IG1lcmdlMyA9IHtcclxuICAgIHByb3A2OiAndmFsdWU2JyxcclxuICAgIHByb3A1OiAndmFsdWU1IGZyb20gbWVyZ2UzJyxcclxuICAgIHN1YmNvbXBvbmVudE9wdGlvbnM6IHtcclxuICAgICAgc3ViUHJvcDU6ICdCT05KT1VSJ1xyXG4gICAgfSxcclxuICAgIHN1YmNvbXBvbmVudE9wdGlvbnMyOiB7XHJcbiAgICAgIHRlc3QyOiBbICd0ZXN0MicsICd0ZXN0MycgXSxcclxuICAgICAgc3ViU3ViY29tcG9uZW50T3B0aW9uczoge1xyXG4gICAgICAgIHRlc3Q6ICd0ZXN0IGZvcm0gbWVyZ2UzJyxcclxuICAgICAgICBzdWJTdWJQcm9wMTogJ3N1YlN1YiBmcm9tIG1lcmdlMydcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbiAgY29uc3QgbWVyZ2UxQ29weSA9IF8uY2xvbmVEZWVwKCBtZXJnZTEgKTtcclxuICBjb25zdCBtZXJnZTJDb3B5ID0gXy5jbG9uZURlZXAoIG1lcmdlMiApO1xyXG4gIGNvbnN0IG1lcmdlM0NvcHkgPSBfLmNsb25lRGVlcCggbWVyZ2UzICk7XHJcblxyXG4gIE9iamVjdC5mcmVlemUoIG1lcmdlMSApO1xyXG4gIE9iamVjdC5mcmVlemUoIG1lcmdlMiApO1xyXG4gIE9iamVjdC5mcmVlemUoIG1lcmdlMyApO1xyXG4gIGNvbnN0IG1lcmdlZCA9IG1lcmdlKCBvcmlnaW5hbCwgbWVyZ2UxLCBtZXJnZTIsIG1lcmdlMyApO1xyXG5cclxuICBjb25zdCBleHBlY3RlZCA9IHtcclxuICAgIHByb3AxOiAndmFsdWUxJyxcclxuICAgIHByb3AyOiAndmFsdWUyJyxcclxuICAgIHN1YmNvbXBvbmVudE9wdGlvbnM6IHtcclxuICAgICAgc3ViUHJvcDE6ICdldmVyeXRoaW5nJyxcclxuICAgICAgc3ViUHJvcDI6ICdoZXJlIGlzJyxcclxuICAgICAgc3ViUHJvcDM6ICdmcm9tJyxcclxuICAgICAgc3ViUHJvcDQ6ICdtZXJnZTInLFxyXG4gICAgICBleGNlcHQ6ICdtZScsXHJcbiAgICAgIHN1YlByb3A1OiAnQk9OSk9VUidcclxuICAgIH0sXHJcbiAgICBzdWJjb21wb25lbnRPcHRpb25zMjoge1xyXG4gICAgICB0ZXN0MjogWyAndGVzdDInLCAndGVzdDMnIF0sXHJcbiAgICAgIHN1YlN1YmNvbXBvbmVudE9wdGlvbnM6IHtcclxuICAgICAgICB0ZXN0OiAndGVzdCBmb3JtIG1lcmdlMycsXHJcbiAgICAgICAgc3ViU3ViUHJvcDE6ICdzdWJTdWIgZnJvbSBtZXJnZTMnXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBwcm9wMzogJ25ldyB2YWx1ZTMnLFxyXG4gICAgcHJvcDQ6ICd2YWx1ZTQnLFxyXG4gICAgcHJvcDU6ICd2YWx1ZTUgZnJvbSBtZXJnZTMnLFxyXG4gICAgcHJvcDY6ICd2YWx1ZTYnXHJcbiAgfTtcclxuICBhc3NlcnQubm90RXF1YWwoIG1lcmdlZCwgZXhwZWN0ZWQsICdzYW5pdHkgY2hlY2s6IGVuc3VyZSBtZXJnZWQgYW5kIGV4cGVjdGVkIG9iamVjdHMgYXJlIG5vdCB0aGUgc2FtZSByZWZlcmVuY2UnICk7XHJcbiAgYXNzZXJ0LmRlZXBFcXVhbCggbWVyZ2VkLCBleHBlY3RlZCwgJ21lcmdlIHNob3VsZCBwcm9wZXJseSBjb21iaW5lIG11bHRpcGxlIG9iamVjdHMnICk7XHJcbiAgYXNzZXJ0LmRlZXBFcXVhbCggbWVyZ2UxLCBtZXJnZTFDb3B5LCAnbWVyZ2Ugc2hvdWxkIG5vdCBhbHRlciBzb3VyY2Ugb2JqZWN0cycgKTtcclxuICBhc3NlcnQuZGVlcEVxdWFsKCBtZXJnZTIsIG1lcmdlMkNvcHksICdtZXJnZSBzaG91bGQgbm90IGFsdGVyIHNvdXJjZSBvYmplY3RzJyApO1xyXG4gIGFzc2VydC5kZWVwRXF1YWwoIG1lcmdlMywgbWVyZ2UzQ29weSwgJ21lcmdlIHNob3VsZCBub3QgYWx0ZXIgc291cmNlIG9iamVjdHMnICk7XHJcbn0gKTtcclxuXHJcbi8vIGNoZWNrIHRoYXQgaXQgZXJyb3JzIGxvdWRseSBpZiBzb21ldGhpbmcgb3RoZXIgdGhhbiBhbiBvYmplY3QgaXMgdXNlZFxyXG5RVW5pdC50ZXN0KCAnY2hlY2sgZm9yIHByb3BlciBhc3NlcnRpb24gZXJyb3JzJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBvcmlnaW5hbCA9IHtcclxuICAgIHN1Yk9wdGlvbnM6IHtcclxuICAgICAgdGVzdDogJ3ZhbCcsXHJcbiAgICAgIHRlc3QyOiAndmFsMidcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCBUZXN0Q2xhc3MgPSBjbGFzcyB7XHJcbiAgICBwcml2YXRlIHRlc3Q6IHN0cmluZztcclxuXHJcbiAgICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgIHRoaXMudGVzdCA9ICdjbGFzcyc7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbWVyZ2VzID0ge1xyXG4gICAgYToge1xyXG4gICAgICBzdWJPcHRpb25zOiBbICd2YWwnLCAndmFsMicgXVxyXG4gICAgfSxcclxuICAgIGI6IHtcclxuICAgICAgc3ViT3B0aW9uczogT2JqZWN0LmNyZWF0ZSggeyB0ZXN0OiAnYScsIHRlc3QxOiAzIH0gKVxyXG4gICAgfSxcclxuICAgIGM6IHtcclxuICAgICAgc3ViT3B0aW9uczogJ2Egc3RyaW5nIHRvIHRlc3QnXHJcbiAgICB9LFxyXG4gICAgZDoge1xyXG4gICAgICBzdWJPcHRpb25zOiA0MlxyXG4gICAgfSxcclxuICAgIGU6IHtcclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICBzdWJPcHRpb25zOiBmdW5jdGlvbigpIHsgdGhpcy5hID0gNDI7IH1cclxuICAgIH0sXHJcbiAgICBmOiB7XHJcbiAgICAgIHN1Yk9wdGlvbnM6IG5ldyBUZXN0Q2xhc3MoKVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IGdldHRlck1lcmdlID0ge1xyXG4gICAgZ2V0IHN1Yk9wdGlvbnMoKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgdGVzdDogJ3Nob3VsZCBub3Qgd29yaydcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBpZiAoIHdpbmRvdy5hc3NlcnQgKSB7XHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSggb3JpZ2luYWwsIG1lcmdlcy5hICksICdtZXJnZSBzaG91bGQgbm90IGFsbG93IGFycmF5cyB0byBiZSBtZXJnZWQnICk7XHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSggb3JpZ2luYWwsIG1lcmdlcy5iICksICdtZXJnZSBzaG91bGQgbm90IGFsbG93IGluaGVyaXRlZCBvYmplY3RzIHRvIGJlIG1lcmdlZCcgKTtcclxuICAgIGFzc2VydC50aHJvd3MoICgpID0+IG1lcmdlKCBvcmlnaW5hbCwgbWVyZ2VzLmYgKSwgJ21lcmdlIHNob3VsZCBub3QgYWxsb3cgaW5zdGFuY2VzIHRvIGJlIG1lcmdlZCcgKTtcclxuICAgIGFzc2VydC50aHJvd3MoICgpID0+IG1lcmdlKCBvcmlnaW5hbCwgbWVyZ2VzLmMgKSwgJ21lcmdlIHNob3VsZCBub3QgYWxsb3cgc3RyaW5ncyB0byBiZSBtZXJnZWQnICk7XHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSggb3JpZ2luYWwsIG1lcmdlcy5kICksICdtZXJnZSBzaG91bGQgbm90IGFsbG93IG51bWJlcnMgdG8gYmUgbWVyZ2VkJyApO1xyXG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoIG9yaWdpbmFsLCBtZXJnZXMuZSApLCAnbWVyZ2Ugc2hvdWxkIG5vdCBhbGxvdyBmdW5jdGlvbnMgdG8gYmUgbWVyZ2VkJyApO1xyXG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoIG9yaWdpbmFsLCBnZXR0ZXJNZXJnZSApLCAnbWVyZ2Ugc2hvdWxkIG5vdCB3b3JrIHdpdGggZ2V0dGVycycgKTtcclxuXHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIElOVEVOVElPTkFMXHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSggb3JpZ2luYWwgKSwgJ21lcmdlIHNob3VsZCBub3Qgd29yayB3aXRob3V0IGEgc291cmNlJyApO1xyXG4gIH1cclxuICBhc3NlcnQuZXF1YWwoIDEsIDEsICdmb3Igbm8gP2VhIHF1ZXJ5IHBhcmFtJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnY2hlY2sgZm9yIHJlZmVyZW5jZSBsZXZlbCBlcXVhbGl0eSAoZS5nLiBmb3Igb2JqZWN0IGxpdGVyYWxzLCBQcm9wZXJ0aWVzLCBFbnVtZXJhdGlvbnMpJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCB0ZXN0RW51bSA9IHtcclxuICAgIEE6IHtcclxuICAgICAgdGVzdEE6ICd2YWx1ZUEnXHJcbiAgICB9LFxyXG4gICAgQjoge1xyXG4gICAgICB0ZXN0QjogJ3ZhbHVlQidcclxuICAgIH0sXHJcbiAgICBDOiB7XHJcbiAgICAgIHRlc3RDOiAndmFsdWVDJ1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHR5cGUgVmFsdWVhYmxlID0geyB2YWx1ZTogbnVtYmVyIHwgc3RyaW5nIH07XHJcbiAgY29uc3QgdGVzdFByb3BlcnR5OiBWYWx1ZWFibGUgPSB7IHZhbHVlOiA0MiB9O1xyXG4gIGNvbnN0IHRlc3RQcm9wZXJ0eTI6IFZhbHVlYWJsZSA9IHsgdmFsdWU6ICdmb3J0eSB0d28nIH07XHJcbiAgY29uc3Qgb3JpZ2luYWwgPSB7XHJcbiAgICBwcm9wOiB0ZXN0UHJvcGVydHksXHJcbiAgICBuZXN0ZWRPcHRpb25zOiB7XHJcbiAgICAgIG5lZWRzQW5FbnVtOiB0ZXN0RW51bS5BLFxyXG4gICAgICBtb3JlT3B0aW9uczoge1xyXG4gICAgICAgIG5lZWRzQW5FbnVtOiB0ZXN0RW51bS5DXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG4gIGNvbnN0IG1lcmdlciA9IHtcclxuICAgIHByb3A6IHRlc3RQcm9wZXJ0eTIsXHJcbiAgICBuZXN0ZWRPcHRpb25zOiB7XHJcbiAgICAgIG5lZWRzQW5FbnVtOiB0ZXN0RW51bS5CLFxyXG4gICAgICBtb3JlT3B0aW9uczoge1xyXG4gICAgICAgIG5lZWRzRGlmZmVyZW50RW51bTogdGVzdEVudW0uQVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuICBjb25zdCBvcmlnaW5hbENvcHkgPSBfLmNsb25lRGVlcCggb3JpZ2luYWwgKTtcclxuICBPYmplY3QuZnJlZXplKCBvcmlnaW5hbCApO1xyXG4gIGNvbnN0IG1lcmdlZEZyZXNoID0gbWVyZ2UoIHt9LCBvcmlnaW5hbCwgbWVyZ2VyICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBvcmlnaW5hbC5wcm9wLnZhbHVlLCBvcmlnaW5hbENvcHkucHJvcC52YWx1ZSwgJ21lcmdlIHNob3VsZCBub3QgYWx0ZXIgc291cmNlIG9iamVjdCB2YWx1ZXMnICk7XHJcbiAgYXNzZXJ0Lm9rKCBfLmlzRXF1YWwoIG9yaWdpbmFsLCBvcmlnaW5hbENvcHkgKSwgJ21lcmdlIHNob3VsZCBub3QgYWx0ZXIgc291cmNlIG9iamVjdHMnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBtZXJnZWRGcmVzaC5uZXN0ZWRPcHRpb25zLm5lZWRzQW5FbnVtLCB0ZXN0RW51bS5CLCAnbWVyZ2Ugc2hvdWxkIHByZXNlcnZlIHJlZmVyZW5jZXMgdG8gb3ZlcndyaXR0ZW4gb2JqZWN0IGxpdGVyYWxzJyApO1xyXG4gIGFzc2VydC5lcXVhbCggbWVyZ2VkRnJlc2gubmVzdGVkT3B0aW9ucy5tb3JlT3B0aW9ucy5uZWVkc0FuRW51bSwgdGVzdEVudW0uQywgJ21lcmdlIHNob3VsZCBwcmVzZXJ2ZSBvYmplY3QgbGl0ZXJhbHMgZnJvbSB0YXJnZXQnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBtZXJnZWRGcmVzaC5uZXN0ZWRPcHRpb25zLm1vcmVPcHRpb25zLm5lZWRzRGlmZmVyZW50RW51bSwgdGVzdEVudW0uQSwgJ21lcmdlIHNob3VsZCBwcmVzZXJ2ZSBvYmplY3QgbGl0ZXJhbHMgZnJvbSBzb3VyY2UnICk7XHJcbiAgbWVyZ2VkRnJlc2gucHJvcC52YWx1ZSA9ICdmb3J0eSB0aHJlZSc7XHJcbiAgYXNzZXJ0LmVxdWFsKCB0ZXN0UHJvcGVydHkyLnZhbHVlLCAnZm9ydHkgdGhyZWUnLCAnbWVyZ2Ugc2hvdWxkIHBhc3Mgb2JqZWN0IGxpdGVyYWwgcmVmZXJlbmNlcycgKTtcclxuICBhc3NlcnQuZXF1YWwoIHRlc3RQcm9wZXJ0eS52YWx1ZSwgNDIsICdvcmlnaW5hbCBvYmplY3QgbGl0ZXJhbCBzaG91bGQgYmUgb3ZlcndyaXR0ZW4nICk7XHJcblxyXG4gIGNvbnN0IG1lcmdlZCA9IG1lcmdlKCB7fSwgb3JpZ2luYWwsIG1lcmdlciApO1xyXG4gIGFzc2VydC5vayggbWVyZ2VkLm5lc3RlZE9wdGlvbnMubmVlZHNBbkVudW0gPT09IHRlc3RFbnVtLkIsICdtZXJnZSBzaG91bGQgcHJlc2VydmUgb3ZlcndyaXR0ZW4gRW51bWVyYXRpb25EZXByZWNhdGVkIHR5cGVzJyApO1xyXG4gIGFzc2VydC5vayggbWVyZ2VkLm5lc3RlZE9wdGlvbnMubW9yZU9wdGlvbnMubmVlZHNBbkVudW0gPT09IHRlc3RFbnVtLkMsICdtZXJnZSBzaG91bGQgcHJlc2VydmUgRW51bWVyYXRpb25EZXByZWNhdGVkIHR5cGVzIGZyb20gdGFyZ2V0JyApO1xyXG4gIGFzc2VydC5vayggbWVyZ2VkLm5lc3RlZE9wdGlvbnMubW9yZU9wdGlvbnMubmVlZHNEaWZmZXJlbnRFbnVtID09PSB0ZXN0RW51bS5BLCAnbWVyZ2Ugc2hvdWxkIHByZXNlcnZlIEVudW1lcmF0aW9uRGVwcmVjYXRlZCB0eXBlcyBmcm9tIHNvdXJjZScgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ3RyeSBhIGhvcnJpYmx5IG5lc3RlZCBjYXNlJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBvcmlnaW5hbCA9IHtcclxuICAgIHAxT3B0aW9uczogeyBuMU9wdGlvbnM6IHsgbjJPcHRpb25zOiB7IG4zT3B0aW9uczogeyBuNE9wdGlvbnM6IHsgbjU6ICdvdmVyd3JpdGUgbWUnIH0gfSB9IH0gfSxcclxuICAgIHAyT3B0aW9uczoge1xyXG4gICAgICBuMU9wdGlvbnM6IHtcclxuICAgICAgICBwMzogJ2tlZXAgbWUnXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG4gIGNvbnN0IG1lcmdlMSA9IHtcclxuICAgIHAxT3B0aW9uczoge1xyXG4gICAgICBuMU9wdGlvbnM6IHtcclxuICAgICAgICBuMk9wdGlvbnM6IHtcclxuICAgICAgICAgIG4zT3B0aW9uczoge1xyXG4gICAgICAgICAgICBuNE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBuNTogJ292ZXJ3cml0dGVuJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgcDJPcHRpb25zOiB7XHJcbiAgICAgIG4xT3B0aW9uczoge1xyXG4gICAgICAgIHA0OiAncDMga2VwdCcsXHJcbiAgICAgICAgbjJPcHRpb25zOiB7XHJcbiAgICAgICAgICBuM09wdGlvbnM6IHtcclxuICAgICAgICAgICAgbjRPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgbjVPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBuNk9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgICAgcDU6ICduZXZlciBtYWtlIG9wdGlvbnMgbGlrZSB0aGlzJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIE9iamVjdC5mcmVlemUoIG1lcmdlMSApO1xyXG4gIGNvbnN0IG1lcmdlZCA9IG1lcmdlKCBvcmlnaW5hbCwgbWVyZ2UxICk7XHJcbiAgY29uc3QgZXhwZWN0ZWQgPSB7XHJcbiAgICBwMU9wdGlvbnM6IHtcclxuICAgICAgbjFPcHRpb25zOiB7XHJcbiAgICAgICAgbjJPcHRpb25zOiB7XHJcbiAgICAgICAgICBuM09wdGlvbnM6IHtcclxuICAgICAgICAgICAgbjRPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgbjU6ICdvdmVyd3JpdHRlbidcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHAyT3B0aW9uczoge1xyXG4gICAgICBuMU9wdGlvbnM6IHtcclxuICAgICAgICBwMzogJ2tlZXAgbWUnLFxyXG4gICAgICAgIHA0OiAncDMga2VwdCcsXHJcbiAgICAgICAgbjJPcHRpb25zOiB7XHJcbiAgICAgICAgICBuM09wdGlvbnM6IHtcclxuICAgICAgICAgICAgbjRPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgbjVPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBuNk9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgICAgcDU6ICduZXZlciBtYWtlIG9wdGlvbnMgbGlrZSB0aGlzJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbiAgYXNzZXJ0LmRlZXBFcXVhbCggbWVyZ2VkLCBleHBlY3RlZCwgJ21lcmdlIHNob3VsZCBoYW5kbGUgc29tZSBkZWVwbHkgbmVzdGVkIHN0dWZmJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnbWlub3IgY2hhbmdlJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBhID0ge1xyXG4gICAgc2xpZGVyT3B0aW9uczoge1xyXG4gICAgICBoZWxsbzogJ3RoZXJlJ1xyXG4gICAgfVxyXG4gIH07XHJcbiAgY29uc3QgYiA9IHtcclxuICAgIHNsaWRlck9wdGlvbnM6IHtcclxuICAgICAgdGltZTogJ25vdydcclxuICAgIH1cclxuICB9O1xyXG4gIG1lcmdlKCB7fSwgYSwgYiApO1xyXG4gIGFzc2VydC5vayggIWEuc2xpZGVyT3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ3RpbWUnICksICd0aW1lIHNob3VsZG50IGxlYWsgb3ZlciB0byBhJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAndGVzdCB3cm9uZyBhcmdzJywgYXNzZXJ0ID0+IHtcclxuICBpZiAoIHdpbmRvdy5hc3NlcnQgKSB7XHJcblxyXG4gICAgLy8gaW4gZmlyc3QgYXJnXHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSggdW5kZWZpbmVkLCB7fSApLCAndW5zdXBwb3J0ZWQgZmlyc3QgYXJnIFwidW5kZWZpbmVkXCInICk7XHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSggbnVsbCwge30gKSwgJ3Vuc3VwcG9ydGVkIGFyZyBcIm51bGxcIicgKTtcclxuICAgIGFzc2VydC50aHJvd3MoICgpID0+IG1lcmdlKCB0cnVlLCB7fSApLCAndW5zdXBwb3J0ZWQgYXJnIFwiYm9vbGVhblwiJyApO1xyXG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoICdoZWxsbycsIHt9ICksICd1bnN1cHBvcnRlZCBhcmcgXCJzdHJpbmdcIicgKTtcclxuICAgIGFzc2VydC50aHJvd3MoICgpID0+IG1lcmdlKCA0LCB7fSApLCAndW5zdXBwb3J0ZWQgYXJnIFwibnVtYmVyXCInICk7XHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSggSW1hZ2UsIHt9ICksICd1bnN1cHBvcnRlZCBhcmcgb2YgT2JqZWN0IHdpdGggZXh0cmEgcHJvdG90eXBlJyApO1xyXG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoIHsgZ2V0IGhpKCkgeyByZXR1cm4gMzsgfSB9LCB7fSApLCAndW5zdXBwb3J0ZWQgYXJnIHdpdGggZ2V0dGVyJyApO1xyXG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoIHsgc2V0IGhpKCBzdHVmZjogbnVtYmVyICkgeyAvKiBub29wICovfSB9LCB7fSApLCAndW5zdXBwb3J0ZWQgYXJnIHdpdGggc2V0dGVyJyApO1xyXG5cclxuICAgIC8vIGluIHNlY29uZCBhcmdcclxuICAgIGFzc2VydC50aHJvd3MoICgpID0+IG1lcmdlKCB7fSwgdHJ1ZSwge30gKSwgJ3Vuc3VwcG9ydGVkIHNlY29uZCBhcmcgXCJib29sZWFuXCInICk7XHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSgge30sICdoZWxsbycsIHt9ICksICd1bnN1cHBvcnRlZCBzZWNvbmQgYXJnIFwic3RyaW5nXCInICk7XHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSgge30sIDQsIHt9ICksICd1bnN1cHBvcnRlZCBzZWNvbmQgYXJnIFwibnVtYmVyXCInICk7XHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSgge30sIEltYWdlLCB7fSApLCAndW5zdXBwb3J0ZWQgc2Vjb25kIGFyZyBvZiBPYmplY3Qgd2l0aCBleHRyYSBwcm90b3R5cGUnICk7XHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSgge30sIHsgZ2V0IGhpKCkgeyByZXR1cm4gMzsgfSB9LCB7fSApLCAndW5zdXBwb3J0ZWQgc2Vjb25kIGFyZyB3aXRoIGdldHRlcicgKTtcclxuICAgIGFzc2VydC50aHJvd3MoICgpID0+IG1lcmdlKCB7fSwgeyBzZXQgaGkoIHN0dWZmOiBudW1iZXIgKSB7Lyogbm9vcCAqL30gfSwge30gKSwgJ3Vuc3VwcG9ydGVkIHNlY29uZCBhcmcgd2l0aCBzZXR0ZXInICk7XHJcblxyXG4gICAgLy8gaW4gc2Vjb25kIGFyZyB3aXRoIG5vIHRoaXJkIG9iamVjdFxyXG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoIHt9LCB0cnVlICksICd1bnN1cHBvcnRlZCBzZWNvbmQgYXJnIHdpdGggbm8gdGhpcmQgXCJib29sZWFuXCInICk7XHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSgge30sICdoZWxsbycgKSwgJ3Vuc3VwcG9ydGVkIHNlY29uZCBhcmcgd2l0aCBubyB0aGlyZCBcInN0cmluZ1wiJyApO1xyXG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoIHt9LCA0ICksICd1bnN1cHBvcnRlZCBzZWNvbmQgYXJnIHdpdGggbm8gdGhpcmQgXCJudW1iZXJcIicgKTtcclxuICAgIGFzc2VydC50aHJvd3MoICgpID0+IG1lcmdlKCB7fSwgSW1hZ2UgKSwgJ3Vuc3VwcG9ydGVkIHNlY29uZCBhcmcgd2l0aCBubyB0aGlyZCBvZiBPYmplY3Qgd2l0aCBleHRyYSBwcm90b3R5cGUnICk7XHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSgge30sIHsgZ2V0IGhpKCkgeyByZXR1cm4gMzsgfSB9ICksICd1bnN1cHBvcnRlZCBzZWNvbmQgYXJnIHdpdGggbm8gdGhpcmQgd2l0aCBnZXR0ZXInICk7XHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSgge30sIHsgc2V0IGhpKCBzdHVmZjogbnVtYmVyICkgey8qIG5vb3AgKi99IH0gKSwgJ3Vuc3VwcG9ydGVkIHNlY29uZCBhcmcgd2l0aCBubyB0aGlyZCB3aXRoIGdldHRlcicgKTtcclxuXHJcbiAgICAvLyBpbiBzb21lIG9wdGlvbnNcclxuICAgIGFzc2VydC50aHJvd3MoICgpID0+IG1lcmdlKCB7fSwgeyBzb21lT3B0aW9uczogdHJ1ZSB9LCB7fSApLCAndW5zdXBwb3J0ZWQgYXJnIGluIG9wdGlvbnMgXCJib29sZWFuXCInICk7XHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSgge30sIHsgc29tZU9wdGlvbnM6ICdoZWxsbycgfSwge30gKSwgJ3Vuc3VwcG9ydGVkIGFyZyBpbiBvcHRpb25zIFwic3RyaW5nXCInICk7XHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSgge30sIHsgc29tZU9wdGlvbnM6IDQgfSwge30gKSwgJ3Vuc3VwcG9ydGVkIGFyZyBpbiBvcHRpb25zIFwibnVtYmVyXCInICk7XHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSgge30sIHsgc29tZU9wdGlvbnM6IEltYWdlIH0sIHt9ICksICd1bnN1cHBvcnRlZCBhcmcgaW4gb3B0aW9ucyBvZiBPYmplY3Qgd2l0aCBleHRyYSBwcm90b3R5cGUnICk7XHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSgge30sIHsgc29tZU9wdGlvbnM6IHsgZ2V0IGhpKCkgeyByZXR1cm4gMzsgfSB9IH0sIHt9ICksICd1bnN1cHBvcnRlZCBhcmcgaW4gb3B0aW9ucyB3aXRoIGdldHRlcicgKTtcclxuICAgIGFzc2VydC50aHJvd3MoICgpID0+IG1lcmdlKCB7fSwgeyBzb21lT3B0aW9uczogeyBzZXQgaGkoIHN0dWZmOiBudW1iZXIgKSB7Lyogbm9vcCAqL30gfSB9LCB7fSApLCAndW5zdXBwb3J0ZWQgYXJnIGluIG9wdGlvbnMgd2l0aCBnZXR0ZXInICk7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgYXNzZXJ0Lm9rKCB0cnVlLCAnbm8gYXNzZXJ0aW9ucyBlbmFibGVkJyApO1xyXG4gIH1cclxuXHJcbiAgLy8gYWxsb3dlZCBjYXNlcyB0aGF0IHNob3VsZCBub3QgZXJyb3JcclxuICBtZXJnZSgge30sIG51bGwsIHt9ICk7XHJcbiAgbWVyZ2UoIHt9LCBudWxsICk7XHJcbiAgbWVyZ2UoIHt9LCB7fSwgbnVsbCApO1xyXG4gIG1lcmdlKCB7IHhPcHRpb25zOiB7IHRlc3Q6IDEgfSB9LCB7IHhPcHRpb25zOiBudWxsIH0gKTtcclxuICBtZXJnZSgge30sIHsgc29tZU9wdGlvbnM6IG51bGwgfSwge30gKTtcclxuICBtZXJnZSgge30sIHsgc29tZU9wdGlvbnM6IHVuZGVmaW5lZCB9LCB7fSApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnZG8gbm90IHJlY3Vyc2UgZm9yIG5vbiAqT3B0aW9ucycsIGFzc2VydCA9PiB7XHJcblxyXG4gIGNvbnN0IHRlc3RGaXJzdFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAnaGknICk7XHJcbiAgY29uc3QgdGVzdFNlY29uZFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAnaGkyJyApO1xyXG4gIGNvbnN0IFRlc3RFbnVtZXJhdGlvbiA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ09ORScsICdUV08nIF0gKTtcclxuICBjb25zdCBUZXN0RW51bWVyYXRpb24yID0gRW51bWVyYXRpb25EZXByZWNhdGVkLmJ5S2V5cyggWyAnT05FMScsICdUV08yJyBdICk7XHJcbiAgY29uc3Qgb3JpZ2luYWwgPSB7XHJcbiAgICBwcm9wOiB0ZXN0Rmlyc3RQcm9wZXJ0eSxcclxuICAgIGVudW06IFRlc3RFbnVtZXJhdGlvbixcclxuICAgIHNvbWVPcHRpb25zOiB7IG5lc3RlZFByb3A6IHRlc3RGaXJzdFByb3BlcnR5IH1cclxuICB9O1xyXG5cclxuICBsZXQgbmV3T2JqZWN0ID0gbWVyZ2UoIHt9LCBvcmlnaW5hbCApO1xyXG4gIGFzc2VydC5vayggXy5pc0VxdWFsKCBvcmlnaW5hbCwgbmV3T2JqZWN0ICksICdzaG91bGQgYmUgZXF1YWwgZnJvbSByZWZlcmVuY2UgZXF1YWxpdHknICk7XHJcbiAgYXNzZXJ0Lm9rKCBvcmlnaW5hbC5wcm9wID09PSBuZXdPYmplY3QucHJvcCwgJ3NhbWUgUHJvcGVydHknICk7XHJcbiAgYXNzZXJ0Lm9rKCBvcmlnaW5hbC5lbnVtID09PSBuZXdPYmplY3QuZW51bSwgJ3NhbWUgRW51bWVyYXRpb25EZXByZWNhdGVkJyApO1xyXG5cclxuICAvLyB0ZXN0IGRlZmF1bHRzIHdpdGggb3RoZXIgbm9uIG1lcmdlYWJsZSBvYmplY3RzXHJcbiAgbmV3T2JqZWN0ID0gbWVyZ2UoIHtcclxuICAgIHByb3A6IHRlc3RTZWNvbmRQcm9wZXJ0eSxcclxuICAgIGVudW06IFRlc3RFbnVtZXJhdGlvbjIsXHJcbiAgICBzb21lT3B0aW9uczogeyBuZXN0ZWRQcm9wOiB0ZXN0U2Vjb25kUHJvcGVydHkgfVxyXG4gIH0sIG9yaWdpbmFsICk7XHJcbiAgYXNzZXJ0Lm9rKCBfLmlzRXF1YWwoIG9yaWdpbmFsLCBuZXdPYmplY3QgKSwgJ3Nob3VsZCBiZSBlcXVhbCcgKTtcclxuICBhc3NlcnQub2soIG9yaWdpbmFsLnByb3AgPT09IG5ld09iamVjdC5wcm9wLCAnc2FtZSBQcm9wZXJ0eSwgaWdub3JlIGRlZmF1bHQnICk7XHJcbiAgYXNzZXJ0Lm9rKCBvcmlnaW5hbC5lbnVtID09PSBuZXdPYmplY3QuZW51bSwgJ3NhbWUgRW51bWVyYXRpb25EZXByZWNhdGVkLCBpZ25vcmUgZGVmYXVsdCcgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ3N1cHBvcnQgb3B0aW9uYWwgb3B0aW9ucycsIGFzc2VydCA9PiB7XHJcblxyXG4gIGNvbnN0IG1lcmdlWFlaID0gKCBvcHRpb25zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gKSA9PiB7XHJcbiAgICByZXR1cm4gbWVyZ2UoIHtcclxuICAgICAgeDogMSxcclxuICAgICAgeTogMixcclxuICAgICAgejogM1xyXG4gICAgfSwgb3B0aW9ucyApO1xyXG4gIH07XHJcbiAgY29uc3Qgbm9PcHRpb25zID0gbWVyZ2VYWVooKTtcclxuICBhc3NlcnQub2soIG5vT3B0aW9ucy54ID09PSAxLCAneCBwcm9wZXJ0eSBzaG91bGQgYmUgbWVyZ2VkIGZyb20gZGVmYXVsdCcgKTtcclxuICBhc3NlcnQub2soIG5vT3B0aW9ucy55ID09PSAyLCAneSBwcm9wZXJ0eSBzaG91bGQgYmUgbWVyZ2VkIGZyb20gZGVmYXVsdCcgKTtcclxuICBhc3NlcnQub2soIG5vT3B0aW9ucy56ID09PSAzLCAneiBwcm9wZXJ0eSBzaG91bGQgYmUgbWVyZ2VkIGZyb20gZGVmYXVsdCcgKTtcclxuXHJcbiAgY29uc3QgdGVzdE5lc3RlZEZ1bmN0aW9uQ2FsbE9wdGlvbnMgPSAoIG9wdGlvbnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiApID0+IHtcclxuICAgIHJldHVybiBtZXJnZVhZWiggbWVyZ2UoIHtcclxuICAgICAgeDogMixcclxuICAgICAgZzogNTQsXHJcbiAgICAgIHRyZWVTYXlzOiAnaGVsbG8nXHJcbiAgICB9LCBvcHRpb25zICkgKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBub09wdGlvbnMyID0gdGVzdE5lc3RlZEZ1bmN0aW9uQ2FsbE9wdGlvbnMoKTtcclxuICBhc3NlcnQub2soIG5vT3B0aW9uczIueCA9PT0gMiwgJ3ggcHJvcGVydHkgc2hvdWxkIGJlIG1lcmdlZCBmcm9tIGRlZmF1bHQnICk7XHJcbiAgYXNzZXJ0Lm9rKCBub09wdGlvbnMyLnkgPT09IDIsICd5IHByb3BlcnR5IHNob3VsZCBiZSBtZXJnZWQgZnJvbSBkZWZhdWx0JyApO1xyXG4gIGFzc2VydC5vayggbm9PcHRpb25zMi56ID09PSAzLCAneiBwcm9wZXJ0eSBzaG91bGQgYmUgbWVyZ2VkIGZyb20gZGVmYXVsdCcgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBub09wdGlvbnMyLmcgPT09IDU0LCAnZyBwcm9wZXJ0eSBzaG91bGQgYmUgbWVyZ2VkIGZyb20gZGVmYXVsdCcgKTtcclxuICBhc3NlcnQub2soIG5vT3B0aW9uczIudHJlZVNheXMgPT09ICdoZWxsbycsICdwcm9wZXJ0eSBzaG91bGQgYmUgbWVyZ2VkIGZyb20gZGVmYXVsdCcgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ2RvZXMgbm90IHN1cHBvcnQgZGVlcCBlcXVhbHMgb24ga2V5bmFtZSBvZiBcIk9wdGlvbnNcIicsIGFzc2VydCA9PiB7XHJcblxyXG4gIGNvbnN0IHJlZmVyZW5jZU9iamVjdCA9IHtcclxuICAgIGhlbGxvOiAyXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbWVyZ2VkID0gbWVyZ2UoIHt9LCB7XHJcbiAgICBPcHRpb25zOiByZWZlcmVuY2VPYmplY3RcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IGRlZXBNZXJnZWQgPSBtZXJnZSgge30sIHtcclxuICAgIHNvbWVPcHRpb25zOiByZWZlcmVuY2VPYmplY3RcclxuICB9ICk7XHJcblxyXG4gIGFzc2VydC5vayggbWVyZ2VkLk9wdGlvbnMgPT09IHJlZmVyZW5jZU9iamVjdCwgJ1wiT3B0aW9uc1wiIHNob3VsZCBub3QgZGVlcCBlcXVhbCcgKTtcclxuICByZWZlcmVuY2VPYmplY3QuaGVsbG8gPSAzO1xyXG4gIGFzc2VydC5vayggbWVyZ2VkLk9wdGlvbnMuaGVsbG8gPT09IDMsICd2YWx1ZSBzaG91bGQgY2hhbmdlIGJlY2F1c2UgaXQgaXMgYSByZWZlcmVuY2UnICk7XHJcbiAgYXNzZXJ0Lm9rKCBkZWVwTWVyZ2VkLnNvbWVPcHRpb25zLmhlbGxvID09PSAyLCAndmFsdWUgc2hvdWxkIG5vdCBjaGFuZ2UgYmVjYXVzZSBpdCB3YXMgZGVlcCBjb3BpZWQnICk7XHJcbn0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUdBLE9BQU9BLFFBQVEsTUFBTSwyQkFBMkI7QUFDaEQsT0FBT0MscUJBQXFCLE1BQU0sNEJBQTRCO0FBQzlELE9BQU9DLEtBQUssTUFBTSxZQUFZO0FBRzlCQyxLQUFLLENBQUNDLE1BQU0sQ0FBRSxPQUFRLENBQUM7O0FBRXZCO0FBQ0FELEtBQUssQ0FBQ0UsSUFBSSxDQUFFLG1CQUFtQixFQUFFQyxNQUFNLElBQUk7RUFDekMsTUFBTUMsUUFBUSxHQUFHO0lBQ2ZDLEtBQUssRUFBRSxRQUFRO0lBQ2ZDLEtBQUssRUFBRSxRQUFRO0lBQ2ZDLG1CQUFtQixFQUFFO01BQ25CQyxRQUFRLEVBQUUsV0FBVztNQUNyQkMsUUFBUSxFQUFFO0lBQ1osQ0FBQztJQUNEQyxvQkFBb0IsRUFBRTtNQUNwQkMsc0JBQXNCLEVBQUU7UUFDdEJDLFdBQVcsRUFBRTtNQUNmO0lBQ0YsQ0FBQztJQUNEQyxLQUFLLEVBQUU7RUFDVCxDQUFDO0VBRUQsTUFBTUMsTUFBTSxHQUFHO0lBQ2JQLG1CQUFtQixF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