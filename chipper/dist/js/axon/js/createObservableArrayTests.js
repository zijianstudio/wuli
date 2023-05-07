// Copyright 2020-2022, University of Colorado Boulder

/**
 * QUnit tests for createObservableArray
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Random from '../../dot/js/Random.js';
import arrayRemove from '../../phet-core/js/arrayRemove.js';
import createObservableArray from './createObservableArray.js';
QUnit.module('createObservableArray');
QUnit.test('Hello', assert => {
  assert.ok('first test');
  const run = (name, command) => {
    console.log(`START: ${name}`);
    const result = command();
    console.log(`END: ${name}\n\n`);
    return result;
  };
  const observableArray = run('create', () => createObservableArray({
    elements: ['a', 'bc']
  }));
  assert.ok(Array.isArray(observableArray), 'isArray check');
  assert.ok(observableArray instanceof Array, 'instanceof check'); // eslint-disable-line no-instanceof-array

  run('push hello', () => observableArray.push('hello'));
  run('set element 0', () => {
    observableArray[0] = 'dinosaur';
  });
  run('set element 5', () => {
    observableArray[5] = 'hamburger';
  });
  run('length = 0', () => {
    observableArray.length = 0;
  });
  run('a,b,c', () => {
    observableArray.push('a');
    observableArray.push('b');
    observableArray.push('c');
  });
  run('splice', () => observableArray.splice(0, 1));
});

// Creates an array that is tested with the given modifiers against the expected results.
const testArrayEmitters = (assert, modifier, expected) => {
  const array = createObservableArray();
  const deltas = [];
  array.elementAddedEmitter.addListener(e => deltas.push({
    type: 'added',
    value: e
  }));
  array.elementRemovedEmitter.addListener(e => deltas.push({
    type: 'removed',
    value: e
  }));
  modifier(array);
  assert.deepEqual(deltas, expected);
};
QUnit.test('Test axon array length', assert => {
  const array = createObservableArray();
  array.push('hello');
  assert.equal(array.lengthProperty.value, 1, 'array lengthProperty test');
  assert.equal(array.length, 1, 'array length test');
  array.pop();
  assert.equal(array.lengthProperty.value, 0, 'array lengthProperty test');
  assert.equal(array.length, 0, 'array length test');
  array.push(1, 2, 3);
  assert.equal(array.lengthProperty.value, 3, 'array lengthProperty test');
  assert.equal(array.length, 3, 'array length test');
  array.shift();
  assert.equal(array.lengthProperty.value, 2, 'array lengthProperty test');
  assert.equal(array.length, 2, 'array length test');
  array.splice(0, 2, 'parrot', 'anemone', 'blue');
  assert.equal(array.lengthProperty.value, 3, 'array lengthProperty test');
  assert.equal(array.length, 3, 'array length test');
  array.unshift('qunit', 'test');
  assert.equal(array.lengthProperty.value, 5, 'array lengthProperty test');
  assert.equal(array.length, 5, 'array length test');
  array.length = 0;
  assert.equal(array.lengthProperty.value, 0, 'array lengthProperty test after setLengthAndNotify');
  assert.equal(array.length, 0, 'array length test after setLengthAndNotify');
});
QUnit.test('Test delete', assert => {
  testArrayEmitters(assert, array => {
    array.push('test');
    delete array[0];

    // FOR REVIEWER: The commented out code does not appear to have been testing anything. Expected does not include any
    // return value comparisons for array.hello. Should this be actually testing something or safe to delete?
    // array.hello = 'there';
    // delete array.hello;

    array[-7] = 'time';
    delete array[-7];
  }, [{
    type: 'added',
    value: 'test'
  }, {
    type: 'removed',
    value: 'test'
  }]);
});
QUnit.test('Test same value', assert => {
  testArrayEmitters(assert, array => {
    array.push('test');
    array.shuffle(new Random()); // eslint-disable-line bad-sim-text
  }, [{
    type: 'added',
    value: 'test'
  }]);
});
QUnit.test('Test axon array', assert => {
  testArrayEmitters(assert, array => {
    array.push('test');
    array.push('test');
    array.push('test');
    array.push('test');
    array.length = 1;
    array.pop();
    array.push('hello');
    array.push('hello');
    array.push('hello');
    array.push('time');
    arrayRemove(array, 'hello');
  }, [{
    type: 'added',
    value: 'test'
  }, {
    type: 'added',
    value: 'test'
  }, {
    type: 'added',
    value: 'test'
  }, {
    type: 'added',
    value: 'test'
  }, {
    type: 'removed',
    value: 'test'
  }, {
    type: 'removed',
    value: 'test'
  }, {
    type: 'removed',
    value: 'test'
  }, {
    type: 'removed',
    value: 'test'
  }, {
    type: 'added',
    value: 'hello'
  }, {
    type: 'added',
    value: 'hello'
  }, {
    type: 'added',
    value: 'hello'
  }, {
    type: 'added',
    value: 'time'
  }, {
    type: 'removed',
    value: 'hello'
  }]);
});
QUnit.test('Test axon array using Array.prototype.push.call etc', assert => {
  testArrayEmitters(assert, array => {
    array.push('test');
    array.push('test');
    array.push('test');
    array.push('test');
    array.length = 1;
    array.pop();
    array.push('hello');
    Array.prototype.push.call(array, 'hello');
    array.push('hello');
    Array.prototype.push.apply(array, ['time']);
    arrayRemove(array, 'hello');
  }, [{
    type: 'added',
    value: 'test'
  }, {
    type: 'added',
    value: 'test'
  }, {
    type: 'added',
    value: 'test'
  }, {
    type: 'added',
    value: 'test'
  }, {
    type: 'removed',
    value: 'test'
  }, {
    type: 'removed',
    value: 'test'
  }, {
    type: 'removed',
    value: 'test'
  }, {
    type: 'removed',
    value: 'test'
  }, {
    type: 'added',
    value: 'hello'
  }, {
    type: 'added',
    value: 'hello'
  }, {
    type: 'added',
    value: 'hello'
  }, {
    type: 'added',
    value: 'time'
  }, {
    type: 'removed',
    value: 'hello'
  }]);
});
QUnit.test('Test axon array setLength', assert => {
  testArrayEmitters(assert, array => {
    array.push('hello');
    array.length = 0;
    array.length = 4;
    array[12] = 'cheetah';
  }, [{
    type: 'added',
    value: 'hello'
  }, {
    type: 'removed',
    value: 'hello'
  }, {
    type: 'added',
    value: 'cheetah'
  }]);
});
QUnit.test('Test createObservableArray.push', assert => {
  testArrayEmitters(assert, array => {
    array.push('hello', 'there', 'old', undefined);
  }, [{
    type: 'added',
    value: 'hello'
  }, {
    type: 'added',
    value: 'there'
  }, {
    type: 'added',
    value: 'old'
  }, {
    type: 'added',
    value: undefined
  }]);
});
QUnit.test('Test createObservableArray.pop', assert => {
  testArrayEmitters(assert, array => {
    array.push(7);
    const popped = array.pop();
    assert.equal(popped, 7);
  }, [{
    type: 'added',
    value: 7
  }, {
    type: 'removed',
    value: 7
  }]);
});
QUnit.test('Test createObservableArray.shift', assert => {
  testArrayEmitters(assert, array => {
    array.push(7, 3);
    const removed = array.shift();
    assert.equal(removed, 7);
  }, [{
    type: 'added',
    value: 7
  }, {
    type: 'added',
    value: 3
  }, {
    type: 'removed',
    value: 7
  }]);
});
QUnit.test('Test createObservableArray.unshift', assert => {
  // From this example: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
  testArrayEmitters(assert, array => {
    array.push('angel', 'clown', 'drum', 'sturgeon');
    array.unshift('trumpet', 'dino');
    assert.ok(array[0] === 'trumpet');
  }, [{
    type: 'added',
    value: 'angel'
  }, {
    type: 'added',
    value: 'clown'
  }, {
    type: 'added',
    value: 'drum'
  }, {
    type: 'added',
    value: 'sturgeon'
  }, {
    type: 'added',
    value: 'trumpet'
  }, {
    type: 'added',
    value: 'dino'
  }]);
});

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin
QUnit.test('Test createObservableArray.copyWithin', assert => {
  testArrayEmitters(assert, array => {
    array.push(1, 2, 3, 4, 5);
    array.copyWithin(-2, 0); // [1, 2, 3, 1, 2]
  }, [{
    type: 'added',
    value: 1
  }, {
    type: 'added',
    value: 2
  }, {
    type: 'added',
    value: 3
  }, {
    type: 'added',
    value: 4
  }, {
    type: 'added',
    value: 5
  }, {
    type: 'removed',
    value: 4
  }, {
    type: 'removed',
    value: 5
  }, {
    type: 'added',
    value: 1
  }, {
    type: 'added',
    value: 2
  }]);
  testArrayEmitters(assert, array => {
    array.push(1, 2, 3, 4, 5);
    array.copyWithin(0, 3); //  [4, 5, 3, 4, 5]
  }, [{
    type: 'added',
    value: 1
  }, {
    type: 'added',
    value: 2
  }, {
    type: 'added',
    value: 3
  }, {
    type: 'added',
    value: 4
  }, {
    type: 'added',
    value: 5
  }, {
    type: 'removed',
    value: 1
  }, {
    type: 'removed',
    value: 2
  }, {
    type: 'added',
    value: 4
  }, {
    type: 'added',
    value: 5
  }]);
  testArrayEmitters(assert, array => {
    array.push(1, 2, 3, 4, 5);
    array.copyWithin(0, 3, 4); //  [4, 2, 3, 4, 5]
  }, [{
    type: 'added',
    value: 1
  }, {
    type: 'added',
    value: 2
  }, {
    type: 'added',
    value: 3
  }, {
    type: 'added',
    value: 4
  }, {
    type: 'added',
    value: 5
  }, {
    type: 'removed',
    value: 1
  }, {
    type: 'added',
    value: 4
  }]);
  testArrayEmitters(assert, array => {
    array.push(1, 2, 3, 4, 5);
    array.copyWithin(-2, -3, -1); //   [1, 2, 3, 3, 4]
  }, [{
    type: 'added',
    value: 1
  }, {
    type: 'added',
    value: 2
  }, {
    type: 'added',
    value: 3
  }, {
    type: 'added',
    value: 4
  }, {
    type: 'added',
    value: 5
  }, {
    type: 'removed',
    value: 5
  }, {
    type: 'added',
    value: 3
  }]);
});

// Examples from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
QUnit.test('Test createObservableArray.fill', assert => {
  testArrayEmitters(assert, array => {
    array.push(1, 2, 3);
    array.fill(4); // [4,4,4]
  }, [{
    type: 'added',
    value: 1
  }, {
    type: 'added',
    value: 2
  }, {
    type: 'added',
    value: 3
  }, {
    type: 'removed',
    value: 1
  }, {
    type: 'removed',
    value: 2
  }, {
    type: 'removed',
    value: 3
  }, {
    type: 'added',
    value: 4
  }, {
    type: 'added',
    value: 4
  }, {
    type: 'added',
    value: 4
  }]);
  testArrayEmitters(assert, array => {
    array.push(1, 2, 3);
    array.fill(4, 1); // [1,4,4]
  }, [{
    type: 'added',
    value: 1
  }, {
    type: 'added',
    value: 2
  }, {
    type: 'added',
    value: 3
  }, {
    type: 'removed',
    value: 2
  }, {
    type: 'removed',
    value: 3
  }, {
    type: 'added',
    value: 4
  }, {
    type: 'added',
    value: 4
  }]);
  testArrayEmitters(assert, array => {
    array.push(1, 2, 3);
    array.fill(4, 1, 2); // [1,4,3]
  }, [{
    type: 'added',
    value: 1
  }, {
    type: 'added',
    value: 2
  }, {
    type: 'added',
    value: 3
  }, {
    type: 'removed',
    value: 2
  }, {
    type: 'added',
    value: 4
  }]);
  testArrayEmitters(assert, array => {
    array.push(1, 2, 3);
    array.fill(4, 1, 1); // [1,2,3]
  }, [{
    type: 'added',
    value: 1
  }, {
    type: 'added',
    value: 2
  }, {
    type: 'added',
    value: 3
  }]);
  testArrayEmitters(assert, array => {
    array.push(1, 2, 3);
    array.fill(4, 3, 3); // [1,2,3]
  }, [{
    type: 'added',
    value: 1
  }, {
    type: 'added',
    value: 2
  }, {
    type: 'added',
    value: 3
  }]);
  testArrayEmitters(assert, array => {
    array.push(1, 2, 3);
    array.fill(4, -3, -2); // [4,2,3]
  }, [{
    type: 'added',
    value: 1
  }, {
    type: 'added',
    value: 2
  }, {
    type: 'added',
    value: 3
  }, {
    type: 'removed',
    value: 1
  }, {
    type: 'added',
    value: 4
  }]);
  testArrayEmitters(assert, array => {
    array.push(1, 2, 3);
    array.fill(4, NaN, NaN); // [1,2,3]
  }, [{
    type: 'added',
    value: 1
  }, {
    type: 'added',
    value: 2
  }, {
    type: 'added',
    value: 3
  }]);
  testArrayEmitters(assert, array => {
    array.push(1, 2, 3);
    array.fill(4, 3, 5); // [1,2,3]
  }, [{
    type: 'added',
    value: 1
  }, {
    type: 'added',
    value: 2
  }, {
    type: 'added',
    value: 3
  }]);
});
QUnit.test('Test that length is correct in emitter callbacks after push', assert => {
  const a = createObservableArray();
  a.elementAddedEmitter.addListener(element => {
    assert.equal(a.length, 1);
    assert.equal(a.lengthProperty.value, 1);
    assert.equal(element, 'hello');
  });
  a.push('hello');
});
QUnit.test('Test return types', assert => {
  assert.ok(true);
  const a = createObservableArray();
  a.push('hello');
  const x = a.slice();
  x.unshift(7);
  assert.ok(true, 'make sure it is safe to unshift on a sliced createObservableArray');
});
QUnit.test('Test constructor arguments', assert => {
  const a1 = createObservableArray({
    length: 7
  });
  assert.equal(a1.lengthProperty.value, 7, 'array length test');
  a1.push('hello');
  assert.equal(a1.lengthProperty.value, 8, 'array length test');
  assert.equal(a1[7], 'hello', 'for push, element should be added at the end of the array');
  const a2 = createObservableArray({
    elements: ['hi', 'there']
  });
  assert.equal(a2.length, 2, 'array length test');
  assert.equal(a2[0], 'hi', 'first element correct');
  assert.equal(a2[1], 'there', 'second element correct');
  assert.equal(a2.length, 2, 'length correct');
  let a3 = null;
  window.assert && assert.throws(() => {
    a3 = createObservableArray({
      elements: [3],
      length: 1
    });
  }, 'length and elements are mutually exclusive');
  assert.equal(a3, null, 'should not have been assigned');

  // valid element types should succeed
  const a4 = createObservableArray({
    elements: ['a', 'b'],
    // @ts-expect-error, force set value type for testing
    valueType: 'string'
  });
  assert.ok(!!a4, 'correct element types should succeed');

  // invalid element types should fail
  window.assert && assert.throws(() => createObservableArray({
    elements: ['a', 'b'],
    // @ts-expect-error, force set value type for testing
    valueType: 'number'
  }), 'should fail for invalid element types');
});
QUnit.test('Test function values', assert => {
  const array = createObservableArray();
  let number = 7;
  array.push(() => {
    number++;
  });
  array[0]();
  assert.equal(8, number, 'array should support function values');
});
QUnit.test('createObservableArrayTests misc', assert => {
  const array = createObservableArray();
  assert.ok(Array.isArray(array), 'should be an array');
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5kb20iLCJhcnJheVJlbW92ZSIsImNyZWF0ZU9ic2VydmFibGVBcnJheSIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsIm9rIiwicnVuIiwibmFtZSIsImNvbW1hbmQiLCJjb25zb2xlIiwibG9nIiwicmVzdWx0Iiwib2JzZXJ2YWJsZUFycmF5IiwiZWxlbWVudHMiLCJBcnJheSIsImlzQXJyYXkiLCJwdXNoIiwibGVuZ3RoIiwic3BsaWNlIiwidGVzdEFycmF5RW1pdHRlcnMiLCJtb2RpZmllciIsImV4cGVjdGVkIiwiYXJyYXkiLCJkZWx0YXMiLCJlbGVtZW50QWRkZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJlIiwidHlwZSIsInZhbHVlIiwiZWxlbWVudFJlbW92ZWRFbWl0dGVyIiwiZGVlcEVxdWFsIiwiZXF1YWwiLCJsZW5ndGhQcm9wZXJ0eSIsInBvcCIsInNoaWZ0IiwidW5zaGlmdCIsInNodWZmbGUiLCJwcm90b3R5cGUiLCJjYWxsIiwiYXBwbHkiLCJ1bmRlZmluZWQiLCJwb3BwZWQiLCJyZW1vdmVkIiwiY29weVdpdGhpbiIsImZpbGwiLCJOYU4iLCJhIiwiZWxlbWVudCIsIngiLCJzbGljZSIsImExIiwiYTIiLCJhMyIsIndpbmRvdyIsInRocm93cyIsImE0IiwidmFsdWVUeXBlIiwibnVtYmVyIl0sInNvdXJjZXMiOlsiY3JlYXRlT2JzZXJ2YWJsZUFycmF5VGVzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUVVuaXQgdGVzdHMgZm9yIGNyZWF0ZU9ic2VydmFibGVBcnJheVxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBSYW5kb20gZnJvbSAnLi4vLi4vZG90L2pzL1JhbmRvbS5qcyc7XHJcbmltcG9ydCBhcnJheVJlbW92ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXJyYXlSZW1vdmUuanMnO1xyXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5LCB7IE9ic2VydmFibGVBcnJheSB9IGZyb20gJy4vY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XHJcblxyXG5RVW5pdC5tb2R1bGUoICdjcmVhdGVPYnNlcnZhYmxlQXJyYXknICk7XHJcblxyXG50eXBlIHJ1bkNhbGxiYWNrID0gKCkgPT4gSW50ZW50aW9uYWxBbnk7XHJcblxyXG50eXBlIHRlc3RBcnJheUVtaXR0ZXJzQ2FsbGJhY2sgPSB7ICggYXJyYXk6IE9ic2VydmFibGVBcnJheTx1bmtub3duPiApOiB2b2lkIH07XHJcblxyXG5RVW5pdC50ZXN0KCAnSGVsbG8nLCBhc3NlcnQgPT4ge1xyXG5cclxuICBhc3NlcnQub2soICdmaXJzdCB0ZXN0JyApO1xyXG5cclxuICBjb25zdCBydW4gPSAoIG5hbWU6IHN0cmluZywgY29tbWFuZDogcnVuQ2FsbGJhY2sgKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyggYFNUQVJUOiAke25hbWV9YCApO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gY29tbWFuZCgpO1xyXG4gICAgY29uc29sZS5sb2coIGBFTkQ6ICR7bmFtZX1cXG5cXG5gICk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IG9ic2VydmFibGVBcnJheSA9IHJ1biggJ2NyZWF0ZScsICgpID0+IGNyZWF0ZU9ic2VydmFibGVBcnJheSgge1xyXG4gICAgZWxlbWVudHM6IFsgJ2EnLCAnYmMnIF1cclxuICB9ICkgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBBcnJheS5pc0FycmF5KCBvYnNlcnZhYmxlQXJyYXkgKSwgJ2lzQXJyYXkgY2hlY2snICk7XHJcbiAgYXNzZXJ0Lm9rKCBvYnNlcnZhYmxlQXJyYXkgaW5zdGFuY2VvZiBBcnJheSwgJ2luc3RhbmNlb2YgY2hlY2snICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8taW5zdGFuY2VvZi1hcnJheVxyXG5cclxuICBydW4oICdwdXNoIGhlbGxvJywgKCkgPT4gb2JzZXJ2YWJsZUFycmF5LnB1c2goICdoZWxsbycgKSApO1xyXG4gIHJ1biggJ3NldCBlbGVtZW50IDAnLCAoKSA9PiB7IG9ic2VydmFibGVBcnJheVsgMCBdID0gJ2Rpbm9zYXVyJzsgfSApO1xyXG4gIHJ1biggJ3NldCBlbGVtZW50IDUnLCAoKSA9PiB7IG9ic2VydmFibGVBcnJheVsgNSBdID0gJ2hhbWJ1cmdlcic7IH0gKTtcclxuICBydW4oICdsZW5ndGggPSAwJywgKCkgPT4geyBvYnNlcnZhYmxlQXJyYXkubGVuZ3RoID0gMDsgfSApO1xyXG4gIHJ1biggJ2EsYixjJywgKCkgPT4ge1xyXG4gICAgb2JzZXJ2YWJsZUFycmF5LnB1c2goICdhJyApO1xyXG4gICAgb2JzZXJ2YWJsZUFycmF5LnB1c2goICdiJyApO1xyXG4gICAgb2JzZXJ2YWJsZUFycmF5LnB1c2goICdjJyApO1xyXG4gIH0gKTtcclxuICBydW4oICdzcGxpY2UnLCAoKSA9PiBvYnNlcnZhYmxlQXJyYXkuc3BsaWNlKCAwLCAxICkgKTtcclxufSApO1xyXG5cclxuLy8gQ3JlYXRlcyBhbiBhcnJheSB0aGF0IGlzIHRlc3RlZCB3aXRoIHRoZSBnaXZlbiBtb2RpZmllcnMgYWdhaW5zdCB0aGUgZXhwZWN0ZWQgcmVzdWx0cy5cclxuY29uc3QgdGVzdEFycmF5RW1pdHRlcnMgPSAoIGFzc2VydDogQXNzZXJ0LCBtb2RpZmllcjogdGVzdEFycmF5RW1pdHRlcnNDYWxsYmFjaywgZXhwZWN0ZWQ6IEFycmF5PHVua25vd24+ICkgPT4ge1xyXG4gIGNvbnN0IGFycmF5ID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XHJcbiAgY29uc3QgZGVsdGFzOiBBcnJheTx1bmtub3duPiA9IFtdO1xyXG4gIGFycmF5LmVsZW1lbnRBZGRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGUgPT4gZGVsdGFzLnB1c2goIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IGUgfSApICk7XHJcbiAgYXJyYXkuZWxlbWVudFJlbW92ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBlID0+IGRlbHRhcy5wdXNoKCB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6IGUgfSApICk7XHJcbiAgbW9kaWZpZXIoIGFycmF5ICk7XHJcbiAgYXNzZXJ0LmRlZXBFcXVhbCggZGVsdGFzLCBleHBlY3RlZCApO1xyXG59O1xyXG5cclxuUVVuaXQudGVzdCggJ1Rlc3QgYXhvbiBhcnJheSBsZW5ndGgnLCBhc3NlcnQgPT4ge1xyXG5cclxuICBjb25zdCBhcnJheSA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG4gIGFycmF5LnB1c2goICdoZWxsbycgKTtcclxuICBhc3NlcnQuZXF1YWwoIGFycmF5Lmxlbmd0aFByb3BlcnR5LnZhbHVlLCAxLCAnYXJyYXkgbGVuZ3RoUHJvcGVydHkgdGVzdCcgKTtcclxuICBhc3NlcnQuZXF1YWwoIGFycmF5Lmxlbmd0aCwgMSwgJ2FycmF5IGxlbmd0aCB0ZXN0JyApO1xyXG4gIGFycmF5LnBvcCgpO1xyXG4gIGFzc2VydC5lcXVhbCggYXJyYXkubGVuZ3RoUHJvcGVydHkudmFsdWUsIDAsICdhcnJheSBsZW5ndGhQcm9wZXJ0eSB0ZXN0JyApO1xyXG4gIGFzc2VydC5lcXVhbCggYXJyYXkubGVuZ3RoLCAwLCAnYXJyYXkgbGVuZ3RoIHRlc3QnICk7XHJcbiAgYXJyYXkucHVzaCggMSwgMiwgMyApO1xyXG4gIGFzc2VydC5lcXVhbCggYXJyYXkubGVuZ3RoUHJvcGVydHkudmFsdWUsIDMsICdhcnJheSBsZW5ndGhQcm9wZXJ0eSB0ZXN0JyApO1xyXG4gIGFzc2VydC5lcXVhbCggYXJyYXkubGVuZ3RoLCAzLCAnYXJyYXkgbGVuZ3RoIHRlc3QnICk7XHJcbiAgYXJyYXkuc2hpZnQoKTtcclxuICBhc3NlcnQuZXF1YWwoIGFycmF5Lmxlbmd0aFByb3BlcnR5LnZhbHVlLCAyLCAnYXJyYXkgbGVuZ3RoUHJvcGVydHkgdGVzdCcgKTtcclxuICBhc3NlcnQuZXF1YWwoIGFycmF5Lmxlbmd0aCwgMiwgJ2FycmF5IGxlbmd0aCB0ZXN0JyApO1xyXG4gIGFycmF5LnNwbGljZSggMCwgMiwgJ3BhcnJvdCcsICdhbmVtb25lJywgJ2JsdWUnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBhcnJheS5sZW5ndGhQcm9wZXJ0eS52YWx1ZSwgMywgJ2FycmF5IGxlbmd0aFByb3BlcnR5IHRlc3QnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBhcnJheS5sZW5ndGgsIDMsICdhcnJheSBsZW5ndGggdGVzdCcgKTtcclxuICBhcnJheS51bnNoaWZ0KCAncXVuaXQnLCAndGVzdCcgKTtcclxuICBhc3NlcnQuZXF1YWwoIGFycmF5Lmxlbmd0aFByb3BlcnR5LnZhbHVlLCA1LCAnYXJyYXkgbGVuZ3RoUHJvcGVydHkgdGVzdCcgKTtcclxuICBhc3NlcnQuZXF1YWwoIGFycmF5Lmxlbmd0aCwgNSwgJ2FycmF5IGxlbmd0aCB0ZXN0JyApO1xyXG4gIGFycmF5Lmxlbmd0aCA9IDA7XHJcbiAgYXNzZXJ0LmVxdWFsKCBhcnJheS5sZW5ndGhQcm9wZXJ0eS52YWx1ZSwgMCwgJ2FycmF5IGxlbmd0aFByb3BlcnR5IHRlc3QgYWZ0ZXIgc2V0TGVuZ3RoQW5kTm90aWZ5JyApO1xyXG4gIGFzc2VydC5lcXVhbCggYXJyYXkubGVuZ3RoLCAwLCAnYXJyYXkgbGVuZ3RoIHRlc3QgYWZ0ZXIgc2V0TGVuZ3RoQW5kTm90aWZ5JyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnVGVzdCBkZWxldGUnLCBhc3NlcnQgPT4ge1xyXG5cclxuICB0ZXN0QXJyYXlFbWl0dGVycyggYXNzZXJ0LCBhcnJheSA9PiB7XHJcblxyXG4gICAgYXJyYXkucHVzaCggJ3Rlc3QnICk7XHJcbiAgICBkZWxldGUgYXJyYXlbIDAgXTtcclxuXHJcbiAgICAvLyBGT1IgUkVWSUVXRVI6IFRoZSBjb21tZW50ZWQgb3V0IGNvZGUgZG9lcyBub3QgYXBwZWFyIHRvIGhhdmUgYmVlbiB0ZXN0aW5nIGFueXRoaW5nLiBFeHBlY3RlZCBkb2VzIG5vdCBpbmNsdWRlIGFueVxyXG4gICAgLy8gcmV0dXJuIHZhbHVlIGNvbXBhcmlzb25zIGZvciBhcnJheS5oZWxsby4gU2hvdWxkIHRoaXMgYmUgYWN0dWFsbHkgdGVzdGluZyBzb21ldGhpbmcgb3Igc2FmZSB0byBkZWxldGU/XHJcbiAgICAvLyBhcnJheS5oZWxsbyA9ICd0aGVyZSc7XHJcbiAgICAvLyBkZWxldGUgYXJyYXkuaGVsbG87XHJcblxyXG4gICAgYXJyYXlbIC03IF0gPSAndGltZSc7XHJcbiAgICBkZWxldGUgYXJyYXlbIC03IF07XHJcbiAgfSwgW1xyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ3Rlc3QnIH0sXHJcbiAgICB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6ICd0ZXN0JyB9XHJcbiAgXSApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnVGVzdCBzYW1lIHZhbHVlJywgYXNzZXJ0ID0+IHtcclxuXHJcbiAgdGVzdEFycmF5RW1pdHRlcnMoIGFzc2VydCwgYXJyYXkgPT4ge1xyXG5cclxuICAgIGFycmF5LnB1c2goICd0ZXN0JyApO1xyXG4gICAgYXJyYXkuc2h1ZmZsZSggbmV3IFJhbmRvbSgpICk7Ly8gZXNsaW50LWRpc2FibGUtbGluZSBiYWQtc2ltLXRleHRcclxuICB9LCBbXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAndGVzdCcgfVxyXG4gIF0gKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1Rlc3QgYXhvbiBhcnJheScsIGFzc2VydCA9PiB7XHJcblxyXG4gIHRlc3RBcnJheUVtaXR0ZXJzKCBhc3NlcnQsIGFycmF5ID0+IHtcclxuXHJcbiAgICBhcnJheS5wdXNoKCAndGVzdCcgKTtcclxuICAgIGFycmF5LnB1c2goICd0ZXN0JyApO1xyXG4gICAgYXJyYXkucHVzaCggJ3Rlc3QnICk7XHJcbiAgICBhcnJheS5wdXNoKCAndGVzdCcgKTtcclxuXHJcbiAgICBhcnJheS5sZW5ndGggPSAxO1xyXG5cclxuICAgIGFycmF5LnBvcCgpO1xyXG4gICAgYXJyYXkucHVzaCggJ2hlbGxvJyApO1xyXG4gICAgYXJyYXkucHVzaCggJ2hlbGxvJyApO1xyXG4gICAgYXJyYXkucHVzaCggJ2hlbGxvJyApO1xyXG4gICAgYXJyYXkucHVzaCggJ3RpbWUnICk7XHJcblxyXG4gICAgYXJyYXlSZW1vdmUoIGFycmF5LCAnaGVsbG8nICk7XHJcbiAgfSwgW1xyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ3Rlc3QnIH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAndGVzdCcgfSxcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6ICd0ZXN0JyB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ3Rlc3QnIH0sXHJcbiAgICB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6ICd0ZXN0JyB9LFxyXG4gICAgeyB0eXBlOiAncmVtb3ZlZCcsIHZhbHVlOiAndGVzdCcgfSxcclxuICAgIHsgdHlwZTogJ3JlbW92ZWQnLCB2YWx1ZTogJ3Rlc3QnIH0sXHJcbiAgICB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6ICd0ZXN0JyB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ2hlbGxvJyB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ2hlbGxvJyB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ2hlbGxvJyB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ3RpbWUnIH0sXHJcbiAgICB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6ICdoZWxsbycgfVxyXG4gIF0gKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1Rlc3QgYXhvbiBhcnJheSB1c2luZyBBcnJheS5wcm90b3R5cGUucHVzaC5jYWxsIGV0YycsIGFzc2VydCA9PiB7XHJcblxyXG4gIHRlc3RBcnJheUVtaXR0ZXJzKCBhc3NlcnQsIGFycmF5ID0+IHtcclxuXHJcbiAgICBhcnJheS5wdXNoKCAndGVzdCcgKTtcclxuICAgIGFycmF5LnB1c2goICd0ZXN0JyApO1xyXG4gICAgYXJyYXkucHVzaCggJ3Rlc3QnICk7XHJcbiAgICBhcnJheS5wdXNoKCAndGVzdCcgKTtcclxuXHJcbiAgICBhcnJheS5sZW5ndGggPSAxO1xyXG5cclxuICAgIGFycmF5LnBvcCgpO1xyXG4gICAgYXJyYXkucHVzaCggJ2hlbGxvJyApO1xyXG4gICAgQXJyYXkucHJvdG90eXBlLnB1c2guY2FsbCggYXJyYXksICdoZWxsbycgKTtcclxuICAgIGFycmF5LnB1c2goICdoZWxsbycgKTtcclxuICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KCBhcnJheSwgWyAndGltZScgXSApO1xyXG4gICAgYXJyYXlSZW1vdmUoIGFycmF5LCAnaGVsbG8nICk7XHJcbiAgfSwgW1xyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ3Rlc3QnIH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAndGVzdCcgfSxcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6ICd0ZXN0JyB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ3Rlc3QnIH0sXHJcbiAgICB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6ICd0ZXN0JyB9LFxyXG4gICAgeyB0eXBlOiAncmVtb3ZlZCcsIHZhbHVlOiAndGVzdCcgfSxcclxuICAgIHsgdHlwZTogJ3JlbW92ZWQnLCB2YWx1ZTogJ3Rlc3QnIH0sXHJcbiAgICB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6ICd0ZXN0JyB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ2hlbGxvJyB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ2hlbGxvJyB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ2hlbGxvJyB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ3RpbWUnIH0sXHJcbiAgICB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6ICdoZWxsbycgfVxyXG4gIF0gKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1Rlc3QgYXhvbiBhcnJheSBzZXRMZW5ndGgnLCBhc3NlcnQgPT4ge1xyXG4gIHRlc3RBcnJheUVtaXR0ZXJzKCBhc3NlcnQsIGFycmF5ID0+IHtcclxuICAgIGFycmF5LnB1c2goICdoZWxsbycgKTtcclxuICAgIGFycmF5Lmxlbmd0aCA9IDA7XHJcbiAgICBhcnJheS5sZW5ndGggPSA0O1xyXG4gICAgYXJyYXlbIDEyIF0gPSAnY2hlZXRhaCc7XHJcbiAgfSwgW1xyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ2hlbGxvJyB9LFxyXG4gICAgeyB0eXBlOiAncmVtb3ZlZCcsIHZhbHVlOiAnaGVsbG8nIH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAnY2hlZXRhaCcgfVxyXG4gIF0gKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1Rlc3QgY3JlYXRlT2JzZXJ2YWJsZUFycmF5LnB1c2gnLCBhc3NlcnQgPT4ge1xyXG4gIHRlc3RBcnJheUVtaXR0ZXJzKCBhc3NlcnQsIGFycmF5ID0+IHtcclxuICAgIGFycmF5LnB1c2goICdoZWxsbycsICd0aGVyZScsICdvbGQnLCB1bmRlZmluZWQgKTtcclxuICB9LCBbXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAnaGVsbG8nIH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAndGhlcmUnIH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAnb2xkJyB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogdW5kZWZpbmVkIH1cclxuICBdICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdUZXN0IGNyZWF0ZU9ic2VydmFibGVBcnJheS5wb3AnLCBhc3NlcnQgPT4ge1xyXG4gIHRlc3RBcnJheUVtaXR0ZXJzKCBhc3NlcnQsIGFycmF5ID0+IHtcclxuICAgIGFycmF5LnB1c2goIDcgKTtcclxuICAgIGNvbnN0IHBvcHBlZCA9IGFycmF5LnBvcCgpO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBwb3BwZWQsIDcgKTtcclxuICB9LCBbXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiA3IH0sXHJcbiAgICB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6IDcgfVxyXG4gIF0gKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1Rlc3QgY3JlYXRlT2JzZXJ2YWJsZUFycmF5LnNoaWZ0JywgYXNzZXJ0ID0+IHtcclxuICB0ZXN0QXJyYXlFbWl0dGVycyggYXNzZXJ0LCBhcnJheSA9PiB7XHJcbiAgICBhcnJheS5wdXNoKCA3LCAzICk7XHJcbiAgICBjb25zdCByZW1vdmVkID0gYXJyYXkuc2hpZnQoKTtcclxuICAgIGFzc2VydC5lcXVhbCggcmVtb3ZlZCwgNyApO1xyXG4gIH0sIFtcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDcgfSxcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDMgfSxcclxuICAgIHsgdHlwZTogJ3JlbW92ZWQnLCB2YWx1ZTogNyB9XHJcbiAgXSApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnVGVzdCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkudW5zaGlmdCcsIGFzc2VydCA9PiB7XHJcblxyXG4gIC8vIEZyb20gdGhpcyBleGFtcGxlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9zcGxpY2VcclxuICB0ZXN0QXJyYXlFbWl0dGVycyggYXNzZXJ0LCBhcnJheSA9PiB7XHJcbiAgICBhcnJheS5wdXNoKCAnYW5nZWwnLCAnY2xvd24nLCAnZHJ1bScsICdzdHVyZ2VvbicgKTtcclxuICAgIGFycmF5LnVuc2hpZnQoICd0cnVtcGV0JywgJ2Rpbm8nICk7XHJcblxyXG4gICAgYXNzZXJ0Lm9rKCBhcnJheVsgMCBdID09PSAndHJ1bXBldCcgKTtcclxuICB9LCBbXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAnYW5nZWwnIH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAnY2xvd24nIH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAnZHJ1bScgfSxcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6ICdzdHVyZ2VvbicgfSxcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6ICd0cnVtcGV0JyB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogJ2Rpbm8nIH1cclxuICBdICk7XHJcbn0gKTtcclxuXHJcbi8vIEZyb20gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvY29weVdpdGhpblxyXG5RVW5pdC50ZXN0KCAnVGVzdCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkuY29weVdpdGhpbicsIGFzc2VydCA9PiB7XHJcbiAgdGVzdEFycmF5RW1pdHRlcnMoIGFzc2VydCwgYXJyYXkgPT4ge1xyXG4gICAgYXJyYXkucHVzaCggMSwgMiwgMywgNCwgNSApO1xyXG4gICAgYXJyYXkuY29weVdpdGhpbiggLTIsIDAgKTsgLy8gWzEsIDIsIDMsIDEsIDJdXHJcbiAgfSwgW1xyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMSB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMiB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMyB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogNCB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogNSB9LFxyXG4gICAgeyB0eXBlOiAncmVtb3ZlZCcsIHZhbHVlOiA0IH0sXHJcbiAgICB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6IDUgfSxcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDEgfSxcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDIgfVxyXG4gIF0gKTtcclxuXHJcbiAgdGVzdEFycmF5RW1pdHRlcnMoIGFzc2VydCwgYXJyYXkgPT4ge1xyXG4gICAgYXJyYXkucHVzaCggMSwgMiwgMywgNCwgNSApO1xyXG4gICAgYXJyYXkuY29weVdpdGhpbiggMCwgMyApOyAvLyAgWzQsIDUsIDMsIDQsIDVdXHJcbiAgfSwgW1xyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMSB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMiB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMyB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogNCB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogNSB9LFxyXG4gICAgeyB0eXBlOiAncmVtb3ZlZCcsIHZhbHVlOiAxIH0sXHJcbiAgICB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6IDIgfSxcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDQgfSxcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDUgfVxyXG4gIF0gKTtcclxuXHJcbiAgdGVzdEFycmF5RW1pdHRlcnMoIGFzc2VydCwgYXJyYXkgPT4ge1xyXG4gICAgYXJyYXkucHVzaCggMSwgMiwgMywgNCwgNSApO1xyXG4gICAgYXJyYXkuY29weVdpdGhpbiggMCwgMywgNCApOyAvLyAgWzQsIDIsIDMsIDQsIDVdXHJcbiAgfSwgW1xyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMSB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMiB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMyB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogNCB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogNSB9LFxyXG4gICAgeyB0eXBlOiAncmVtb3ZlZCcsIHZhbHVlOiAxIH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiA0IH1cclxuICBdICk7XHJcblxyXG4gIHRlc3RBcnJheUVtaXR0ZXJzKCBhc3NlcnQsIGFycmF5ID0+IHtcclxuICAgIGFycmF5LnB1c2goIDEsIDIsIDMsIDQsIDUgKTtcclxuICAgIGFycmF5LmNvcHlXaXRoaW4oIC0yLCAtMywgLTEgKTsgLy8gICBbMSwgMiwgMywgMywgNF1cclxuICB9LCBbXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAxIH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAyIH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAzIH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiA0IH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiA1IH0sXHJcbiAgICB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6IDUgfSxcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDMgfVxyXG4gIF0gKTtcclxufSApO1xyXG5cclxuLy8gRXhhbXBsZXMgZnJvbSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9maWxsXHJcblFVbml0LnRlc3QoICdUZXN0IGNyZWF0ZU9ic2VydmFibGVBcnJheS5maWxsJywgYXNzZXJ0ID0+IHtcclxuICB0ZXN0QXJyYXlFbWl0dGVycyggYXNzZXJ0LCBhcnJheSA9PiB7XHJcbiAgICBhcnJheS5wdXNoKCAxLCAyLCAzICk7XHJcbiAgICBhcnJheS5maWxsKCA0ICk7IC8vIFs0LDQsNF1cclxuICB9LCBbXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAxIH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAyIH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAzIH0sXHJcbiAgICB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6IDEgfSxcclxuICAgIHsgdHlwZTogJ3JlbW92ZWQnLCB2YWx1ZTogMiB9LFxyXG4gICAgeyB0eXBlOiAncmVtb3ZlZCcsIHZhbHVlOiAzIH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiA0IH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiA0IH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiA0IH1cclxuICBdICk7XHJcblxyXG4gIHRlc3RBcnJheUVtaXR0ZXJzKCBhc3NlcnQsIGFycmF5ID0+IHtcclxuICAgIGFycmF5LnB1c2goIDEsIDIsIDMgKTtcclxuICAgIGFycmF5LmZpbGwoIDQsIDEgKTsgLy8gWzEsNCw0XVxyXG4gIH0sIFtcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDEgfSxcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDIgfSxcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDMgfSxcclxuICAgIHsgdHlwZTogJ3JlbW92ZWQnLCB2YWx1ZTogMiB9LFxyXG4gICAgeyB0eXBlOiAncmVtb3ZlZCcsIHZhbHVlOiAzIH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiA0IH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiA0IH1cclxuICBdICk7XHJcblxyXG4gIHRlc3RBcnJheUVtaXR0ZXJzKCBhc3NlcnQsIGFycmF5ID0+IHtcclxuICAgIGFycmF5LnB1c2goIDEsIDIsIDMgKTtcclxuICAgIGFycmF5LmZpbGwoIDQsIDEsIDIgKTsgLy8gWzEsNCwzXVxyXG4gIH0sIFtcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDEgfSxcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDIgfSxcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDMgfSxcclxuICAgIHsgdHlwZTogJ3JlbW92ZWQnLCB2YWx1ZTogMiB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogNCB9XHJcbiAgXSApO1xyXG5cclxuICB0ZXN0QXJyYXlFbWl0dGVycyggYXNzZXJ0LCBhcnJheSA9PiB7XHJcbiAgICBhcnJheS5wdXNoKCAxLCAyLCAzICk7XHJcbiAgICBhcnJheS5maWxsKCA0LCAxLCAxICk7IC8vIFsxLDIsM11cclxuICB9LCBbXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAxIH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAyIH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAzIH1cclxuICBdICk7XHJcblxyXG4gIHRlc3RBcnJheUVtaXR0ZXJzKCBhc3NlcnQsIGFycmF5ID0+IHtcclxuICAgIGFycmF5LnB1c2goIDEsIDIsIDMgKTtcclxuICAgIGFycmF5LmZpbGwoIDQsIDMsIDMgKTsgLy8gWzEsMiwzXVxyXG4gIH0sIFtcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDEgfSxcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDIgfSxcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDMgfVxyXG4gIF0gKTtcclxuXHJcbiAgdGVzdEFycmF5RW1pdHRlcnMoIGFzc2VydCwgYXJyYXkgPT4ge1xyXG4gICAgYXJyYXkucHVzaCggMSwgMiwgMyApO1xyXG4gICAgYXJyYXkuZmlsbCggNCwgLTMsIC0yICk7IC8vIFs0LDIsM11cclxuICB9LCBbXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAxIH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAyIH0sXHJcbiAgICB7IHR5cGU6ICdhZGRlZCcsIHZhbHVlOiAzIH0sXHJcbiAgICB7IHR5cGU6ICdyZW1vdmVkJywgdmFsdWU6IDEgfSxcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDQgfVxyXG4gIF0gKTtcclxuXHJcbiAgdGVzdEFycmF5RW1pdHRlcnMoIGFzc2VydCwgYXJyYXkgPT4ge1xyXG4gICAgYXJyYXkucHVzaCggMSwgMiwgMyApO1xyXG4gICAgYXJyYXkuZmlsbCggNCwgTmFOLCBOYU4gKTsgLy8gWzEsMiwzXVxyXG4gIH0sIFtcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDEgfSxcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDIgfSxcclxuICAgIHsgdHlwZTogJ2FkZGVkJywgdmFsdWU6IDMgfVxyXG4gIF0gKTtcclxuXHJcbiAgdGVzdEFycmF5RW1pdHRlcnMoIGFzc2VydCwgYXJyYXkgPT4ge1xyXG4gICAgYXJyYXkucHVzaCggMSwgMiwgMyApO1xyXG4gICAgYXJyYXkuZmlsbCggNCwgMywgNSApOyAvLyBbMSwyLDNdXHJcbiAgfSwgW1xyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMSB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMiB9LFxyXG4gICAgeyB0eXBlOiAnYWRkZWQnLCB2YWx1ZTogMyB9XHJcbiAgXSApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnVGVzdCB0aGF0IGxlbmd0aCBpcyBjb3JyZWN0IGluIGVtaXR0ZXIgY2FsbGJhY2tzIGFmdGVyIHB1c2gnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGEgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTtcclxuICBhLmVsZW1lbnRBZGRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGVsZW1lbnQgPT4ge1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBhLmxlbmd0aCwgMSApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBhLmxlbmd0aFByb3BlcnR5LnZhbHVlLCAxICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIGVsZW1lbnQsICdoZWxsbycgKTtcclxuICB9ICk7XHJcbiAgYS5wdXNoKCAnaGVsbG8nICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdUZXN0IHJldHVybiB0eXBlcycsIGFzc2VydCA9PiB7XHJcblxyXG4gIGFzc2VydC5vayggdHJ1ZSApO1xyXG4gIGNvbnN0IGEgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTtcclxuICBhLnB1c2goICdoZWxsbycgKTtcclxuXHJcbiAgY29uc3QgeCA9IGEuc2xpY2UoKTtcclxuICB4LnVuc2hpZnQoIDcgKTtcclxuICBhc3NlcnQub2soIHRydWUsICdtYWtlIHN1cmUgaXQgaXMgc2FmZSB0byB1bnNoaWZ0IG9uIGEgc2xpY2VkIGNyZWF0ZU9ic2VydmFibGVBcnJheScgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1Rlc3QgY29uc3RydWN0b3IgYXJndW1lbnRzJywgYXNzZXJ0ID0+IHtcclxuXHJcbiAgY29uc3QgYTEgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHtcclxuICAgIGxlbmd0aDogN1xyXG4gIH0gKTtcclxuICBhc3NlcnQuZXF1YWwoIGExLmxlbmd0aFByb3BlcnR5LnZhbHVlLCA3LCAnYXJyYXkgbGVuZ3RoIHRlc3QnICk7XHJcbiAgYTEucHVzaCggJ2hlbGxvJyApO1xyXG4gIGFzc2VydC5lcXVhbCggYTEubGVuZ3RoUHJvcGVydHkudmFsdWUsIDgsICdhcnJheSBsZW5ndGggdGVzdCcgKTtcclxuICBhc3NlcnQuZXF1YWwoIGExWyA3IF0sICdoZWxsbycsICdmb3IgcHVzaCwgZWxlbWVudCBzaG91bGQgYmUgYWRkZWQgYXQgdGhlIGVuZCBvZiB0aGUgYXJyYXknICk7XHJcblxyXG4gIGNvbnN0IGEyID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCB7XHJcbiAgICBlbGVtZW50czogWyAnaGknLCAndGhlcmUnIF1cclxuICB9ICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBhMi5sZW5ndGgsIDIsICdhcnJheSBsZW5ndGggdGVzdCcgKTtcclxuICBhc3NlcnQuZXF1YWwoIGEyWyAwIF0sICdoaScsICdmaXJzdCBlbGVtZW50IGNvcnJlY3QnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBhMlsgMSBdLCAndGhlcmUnLCAnc2Vjb25kIGVsZW1lbnQgY29ycmVjdCcgKTtcclxuICBhc3NlcnQuZXF1YWwoIGEyLmxlbmd0aCwgMiwgJ2xlbmd0aCBjb3JyZWN0JyApO1xyXG5cclxuICBsZXQgYTMgPSBudWxsO1xyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG4gICAgYTMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHsgZWxlbWVudHM6IFsgMyBdLCBsZW5ndGg6IDEgfSApO1xyXG4gIH0sICdsZW5ndGggYW5kIGVsZW1lbnRzIGFyZSBtdXR1YWxseSBleGNsdXNpdmUnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBhMywgbnVsbCwgJ3Nob3VsZCBub3QgaGF2ZSBiZWVuIGFzc2lnbmVkJyApO1xyXG5cclxuICAvLyB2YWxpZCBlbGVtZW50IHR5cGVzIHNob3VsZCBzdWNjZWVkXHJcbiAgY29uc3QgYTQgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHtcclxuICAgIGVsZW1lbnRzOiBbICdhJywgJ2InIF0sXHJcblxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciwgZm9yY2Ugc2V0IHZhbHVlIHR5cGUgZm9yIHRlc3RpbmdcclxuICAgIHZhbHVlVHlwZTogJ3N0cmluZydcclxuICB9ICk7XHJcbiAgYXNzZXJ0Lm9rKCAhIWE0LCAnY29ycmVjdCBlbGVtZW50IHR5cGVzIHNob3VsZCBzdWNjZWVkJyApO1xyXG5cclxuICAvLyBpbnZhbGlkIGVsZW1lbnQgdHlwZXMgc2hvdWxkIGZhaWxcclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IGNyZWF0ZU9ic2VydmFibGVBcnJheSgge1xyXG4gICAgZWxlbWVudHM6IFsgJ2EnLCAnYicgXSxcclxuXHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yLCBmb3JjZSBzZXQgdmFsdWUgdHlwZSBmb3IgdGVzdGluZ1xyXG4gICAgdmFsdWVUeXBlOiAnbnVtYmVyJ1xyXG4gIH0gKSwgJ3Nob3VsZCBmYWlsIGZvciBpbnZhbGlkIGVsZW1lbnQgdHlwZXMnICk7XHJcblxyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnVGVzdCBmdW5jdGlvbiB2YWx1ZXMnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGFycmF5OiBBcnJheTwoKSA9PiB2b2lkPiA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG4gIGxldCBudW1iZXIgPSA3O1xyXG4gIGFycmF5LnB1c2goICgpID0+IHtcclxuICAgIG51bWJlcisrO1xyXG4gIH0gKTtcclxuICBhcnJheVsgMCBdKCk7XHJcbiAgYXNzZXJ0LmVxdWFsKCA4LCBudW1iZXIsICdhcnJheSBzaG91bGQgc3VwcG9ydCBmdW5jdGlvbiB2YWx1ZXMnICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdjcmVhdGVPYnNlcnZhYmxlQXJyYXlUZXN0cyBtaXNjJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBhcnJheSA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG4gIGFzc2VydC5vayggQXJyYXkuaXNBcnJheSggYXJyYXkgKSwgJ3Nob3VsZCBiZSBhbiBhcnJheScgKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxNQUFNLE1BQU0sd0JBQXdCO0FBQzNDLE9BQU9DLFdBQVcsTUFBTSxtQ0FBbUM7QUFDM0QsT0FBT0MscUJBQXFCLE1BQTJCLDRCQUE0QjtBQUduRkMsS0FBSyxDQUFDQyxNQUFNLENBQUUsdUJBQXdCLENBQUM7QUFNdkNELEtBQUssQ0FBQ0UsSUFBSSxDQUFFLE9BQU8sRUFBRUMsTUFBTSxJQUFJO0VBRTdCQSxNQUFNLENBQUNDLEVBQUUsQ0FBRSxZQUFhLENBQUM7RUFFekIsTUFBTUMsR0FBRyxHQUFHQSxDQUFFQyxJQUFZLEVBQUVDLE9BQW9CLEtBQU07SUFDcERDLE9BQU8sQ0FBQ0MsR0FBRyxDQUFHLFVBQVNILElBQUssRUFBRSxDQUFDO0lBQy9CLE1BQU1JLE1BQU0sR0FBR0gsT0FBTyxDQUFDLENBQUM7SUFDeEJD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QUFLLEVBQUU7RUFBRSxDQUFDLEVBQzNCO0lBQUVELElBQUksRUFBRSxTQUFTO0lBQUVDLEtBQUssRUFBRTtFQUFFLENBQUMsRUFDN0I7SUFBRUQsSUFBSSxFQUFFLFNBQVM7SUFBRUMsS0FBSyxFQUFFO0VBQUUsQ0FBQyxFQUM3QjtJQUFFRCxJQUFJLEVBQUUsT0FBTztJQUFFQyxLQUFLLEVBQUU7RUFBRSxDQUFDLEVBQzNCO0lBQUVELElBQUksRUFBRSxPQUFPO0lBQUVDLEtBQUssRUFBRTtFQUFFLENBQUMsQ0FDM0IsQ0FBQztFQUVIVCxpQkFBaUIsQ0FBRWYsTUFBTSxFQUFFa0IsS0FBSyxJQUFJO0lBQ2xDQSxLQUFLLENBQUNOLElBQUksQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0lBQzNCTSxLQUFLLENBQUNxQixVQUFVLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFDLENBQUM7RUFDNUIsQ0FBQyxFQUFFLENBQ0Q7SUFBRWhCLElBQUksRUFBRSxPQUFPO0lBQUVDLEtBQUssRUFBRTtFQUFFLENBQUMsRUFDM0I7SUFBRUQsSUFBSSxFQUFFLE9BQU87SUFBRUMsS0FBSyxFQUFFO0VBQUUsQ0FBQyxFQUMzQjtJQUFFRCxJQUFJLEVBQUUsT0FBTztJQUFFQyxLQUFLLEVBQUU7RUFBRSxDQUFDLEVBQzNCO0lBQUVELElBQUksRUFBRSxPQUFPO0lBQUVDLEtBQUssRUFBRTtFQUFFLENBQUMsRUFDM0I7SUFBRUQsSUFBSSxFQUFFLE9BQU87SUFBRUMsS0FBSyxFQUFFO0VBQUUsQ0FBQyxFQUMzQjtJQUFFRCxJQUFJLEVBQUUsU0FBUztJQUFFQyxLQUFLLEVBQUU7RUFBRSxDQUFDLEVBQzdCO0lBQUVELElBQUksRUFBRSxTQUFTO0lBQUVDLEtBQUssRUFBRTtFQUFFLENBQUMsRUFDN0I7SUFBRUQsSUFBSSxFQUFFLE9BQU87SUFBRUMsS0FBSyxFQUFFO0VBQUUsQ0FBQyxFQUMzQjtJQUFFRCxJQUFJLEVBQUUsT0FBTztJQUFFQyxLQUFLLEVB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QU87SUFBRUMsS0FBSyxFQUFFO0VBQUUsQ0FBQyxFQUMzQjtJQUFFRCxJQUFJLEVBQUUsT0FBTztJQUFFQyxLQUFLLEVBQUU7RUFBRSxDQUFDLEVBQzNCO0lBQUVELElBQUksRUFBRSxPQUFPO0lBQUVDLEtBQUssRUFBRTtFQUFFLENBQUMsRUFDM0I7SUFBRUQsSUFBSSxFQUFFLFNBQVM7SUFBRUMsS0FBSyxFQUFFO0VBQUUsQ0FBQyxFQUM3QjtJQUFFRCxJQUFJLEVBQUUsT0FBTztJQUFFQyxLQUFLLEVBQUU7RUFBRSxDQUFDLENBQzNCLENBQUM7RUFFSFQsaUJBQWlCLENBQUVmLE1BQU0sRUFBRWtCLEtBQUssSUFBSTtJQUNsQ0EsS0FBSyxDQUFDTixJQUFJLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7SUFDckJNLEtBQUssQ0FBQ3NCLElBQUksQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFDLENBQUM7RUFDekIsQ0FBQyxFQUFFLENBQ0Q7SUFBRWpCLElBQUksRUFBRSxPQUFPO0lBQUVDLEtBQUssRUFBRTtFQUFFLENBQUMsRUFDM0I7SUFBRUQsSUFBSSxFQUFFLE9BQU87SUFBRUMsS0FBSyxFQUFFO0VBQUUsQ0FBQyxFQUMzQjtJQUFFRCxJQUFJLEVBQUUsT0FBTztJQUFFQyxLQUFLLEVBQUU7RUFBRSxDQUFDLENBQzNCLENBQUM7RUFFSFQsaUJBQWlCLENBQUVmLE1BQU0sRUFBRWtCLEtBQUssSUFBSTtJQUNsQ0EsS0FBSyxDQUFDTixJQUFJLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7SUFDckJNLEtBQUssQ0FBQ3NCLElBQUksQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFDLENBQUM7RUFDekIsQ0FBQyxFQUFFLENBQ0Q7SUFBRWpCLElBQUksRUFBRSxPQUFPO0lBQUVDLEtBQUssRUFBRTtFQUFFLENBQUMsRUFDM0I7SUFBRUQsSUFBSSxFQUFFLE9BQU87SUFBRUMsS0FBSyxFQUFFO0VBQUUsQ0FBQyxFQUMz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