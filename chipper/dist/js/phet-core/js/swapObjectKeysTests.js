// Copyright 2019-2020, University of Colorado Boulder

/**
 * swapObjectKeys tests
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import swapObjectKeys from './swapObjectKeys.js';
QUnit.module('swapObjectKeys');
QUnit.test('swapObjectKeys', assert => {
  let object = {
    x: 3,
    y: 4
  };
  swapObjectKeys(object, 'x', 'y');
  assert.ok(object.x === 4);
  assert.ok(object.y === 3);
  object = {
    x: 3,
    y: undefined
  };
  swapObjectKeys(object, 'x', 'y');
  assert.ok(object.x === undefined);
  assert.ok(object.hasOwnProperty('x'));
  assert.ok(object.y === 3);
  object = {
    x: 3,
    y: new RegExp('matchOnThis')
  };
  const regex = object.y; // store the reference
  swapObjectKeys(object, 'x', 'y');
  assert.ok(object.x === regex, 'reference to object');
  assert.ok(object.y === 3, 'reference to primitive');
  object = {
    x: 4
  };
  swapObjectKeys(object, 'x', 'y');
  assert.ok(object.y === 4);
  assert.ok(!Object.hasOwnProperty('x'));
  object = {
    otherStuff: 'hi'
  };
  swapObjectKeys(object, 'x', 'y');
  assert.ok(object.otherStuff === 'hi');
  assert.ok(!Object.hasOwnProperty('x'));
  assert.ok(!Object.hasOwnProperty('y'));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzd2FwT2JqZWN0S2V5cyIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsIm9iamVjdCIsIngiLCJ5Iiwib2siLCJ1bmRlZmluZWQiLCJoYXNPd25Qcm9wZXJ0eSIsIlJlZ0V4cCIsInJlZ2V4IiwiT2JqZWN0Iiwib3RoZXJTdHVmZiJdLCJzb3VyY2VzIjpbInN3YXBPYmplY3RLZXlzVGVzdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogc3dhcE9iamVjdEtleXMgdGVzdHNcclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBzd2FwT2JqZWN0S2V5cyBmcm9tICcuL3N3YXBPYmplY3RLZXlzLmpzJztcclxuXHJcblFVbml0Lm1vZHVsZSggJ3N3YXBPYmplY3RLZXlzJyApO1xyXG5cclxuUVVuaXQudGVzdCggJ3N3YXBPYmplY3RLZXlzJywgYXNzZXJ0ID0+IHtcclxuICBsZXQgb2JqZWN0ID0geyB4OiAzLCB5OiA0IH07XHJcbiAgc3dhcE9iamVjdEtleXMoIG9iamVjdCwgJ3gnLCAneScgKTtcclxuICBhc3NlcnQub2soIG9iamVjdC54ID09PSA0ICk7XHJcbiAgYXNzZXJ0Lm9rKCBvYmplY3QueSA9PT0gMyApO1xyXG5cclxuICBvYmplY3QgPSB7IHg6IDMsIHk6IHVuZGVmaW5lZCB9O1xyXG4gIHN3YXBPYmplY3RLZXlzKCBvYmplY3QsICd4JywgJ3knICk7XHJcbiAgYXNzZXJ0Lm9rKCBvYmplY3QueCA9PT0gdW5kZWZpbmVkICk7XHJcbiAgYXNzZXJ0Lm9rKCBvYmplY3QuaGFzT3duUHJvcGVydHkoICd4JyApICk7XHJcbiAgYXNzZXJ0Lm9rKCBvYmplY3QueSA9PT0gMyApO1xyXG5cclxuICBvYmplY3QgPSB7IHg6IDMsIHk6IG5ldyBSZWdFeHAoICdtYXRjaE9uVGhpcycgKSB9O1xyXG4gIGNvbnN0IHJlZ2V4ID0gb2JqZWN0Lnk7IC8vIHN0b3JlIHRoZSByZWZlcmVuY2VcclxuICBzd2FwT2JqZWN0S2V5cyggb2JqZWN0LCAneCcsICd5JyApO1xyXG4gIGFzc2VydC5vayggb2JqZWN0LnggPT09IHJlZ2V4LCAncmVmZXJlbmNlIHRvIG9iamVjdCcgKTtcclxuICBhc3NlcnQub2soIG9iamVjdC55ID09PSAzLCAncmVmZXJlbmNlIHRvIHByaW1pdGl2ZScgKTtcclxuXHJcbiAgb2JqZWN0ID0geyB4OiA0IH07XHJcbiAgc3dhcE9iamVjdEtleXMoIG9iamVjdCwgJ3gnLCAneScgKTtcclxuICBhc3NlcnQub2soIG9iamVjdC55ID09PSA0ICk7XHJcbiAgYXNzZXJ0Lm9rKCAhT2JqZWN0Lmhhc093blByb3BlcnR5KCAneCcgKSApO1xyXG5cclxuICBvYmplY3QgPSB7IG90aGVyU3R1ZmY6ICdoaScgfTtcclxuICBzd2FwT2JqZWN0S2V5cyggb2JqZWN0LCAneCcsICd5JyApO1xyXG4gIGFzc2VydC5vayggb2JqZWN0Lm90aGVyU3R1ZmYgPT09ICdoaScgKTtcclxuICBhc3NlcnQub2soICFPYmplY3QuaGFzT3duUHJvcGVydHkoICd4JyApICk7XHJcbiAgYXNzZXJ0Lm9rKCAhT2JqZWN0Lmhhc093blByb3BlcnR5KCAneScgKSApO1xyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGNBQWMsTUFBTSxxQkFBcUI7QUFFaERDLEtBQUssQ0FBQ0MsTUFBTSxDQUFFLGdCQUFpQixDQUFDO0FBRWhDRCxLQUFLLENBQUNFLElBQUksQ0FBRSxnQkFBZ0IsRUFBRUMsTUFBTSxJQUFJO0VBQ3RDLElBQUlDLE1BQU0sR0FBRztJQUFFQyxDQUFDLEVBQUUsQ0FBQztJQUFFQyxDQUFDLEVBQUU7RUFBRSxDQUFDO0VBQzNCUCxjQUFjLENBQUVLLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBSSxDQUFDO0VBQ2xDRCxNQUFNLENBQUNJLEVBQUUsQ0FBRUgsTUFBTSxDQUFDQyxDQUFDLEtBQUssQ0FBRSxDQUFDO0VBQzNCRixNQUFNLENBQUNJLEVBQUUsQ0FBRUgsTUFBTSxDQUFDRSxDQUFDLEtBQUssQ0FBRSxDQUFDO0VBRTNCRixNQUFNLEdBQUc7SUFBRUMsQ0FBQyxFQUFFLENBQUM7SUFBRUMsQ0FBQyxFQUFFRTtFQUFVLENBQUM7RUFDL0JULGNBQWMsQ0FBRUssTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFJLENBQUM7RUFDbENELE1BQU0sQ0FBQ0ksRUFBRSxDQUFFSCxNQUFNLENBQUNDLENBQUMsS0FBS0csU0FBVSxDQUFDO0VBQ25DTCxNQUFNLENBQUNJLEVBQUUsQ0FBRUgsTUFBTSxDQUFDSyxjQUFjLENBQUUsR0FBSSxDQUFFLENBQUM7RUFDekNOLE1BQU0sQ0FBQ0ksRUFBRSxDQUFFSCxNQUFNLENBQUNFLENBQUMsS0FBSyxDQUFFLENBQUM7RUFFM0JGLE1BQU0sR0FBRztJQUFFQyxDQUFDLEVBQUUsQ0FBQztJQUFFQyxDQUFDLEVBQUUsSUFBSUksTUFBTSxDQUFFLGFBQWM7RUFBRSxDQUFDO0VBQ2pELE1BQU1DLEtBQUssR0FBR1AsTUFBTSxDQUFDRSxDQUFDLENBQUMsQ0FBQztFQUN4QlAsY0FBYyxDQUFFSyxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUksQ0FBQztFQUNsQ0QsTUFBTSxDQUFDSSxFQUFFLENBQUVILE1BQU0sQ0FBQ0MsQ0FBQyxLQUFLTSxLQUFLLEVBQUUscUJBQXNCLENBQUM7RUFDdERSLE1BQU0sQ0FBQ0ksRUFBRSxDQUFFSCxNQUFNLENBQUNFLENBQUMsS0FBSyxDQUFDLEVBQUUsd0JBQXlCLENBQUM7RUFFckRGLE1BQU0sR0FBRztJQUFFQyxDQUFDLEVBQUU7RUFBRSxDQUFDO0VBQ2pCTixjQUFjLENBQUVLLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBSSxDQUFDO0VBQ2xDRCxNQUFNLENBQUNJLEVBQUUsQ0FBRUgsTUFBTSxDQUFDRSxDQUFDLEtBQUssQ0FBRSxDQUFDO0VBQzNCSCxNQUFNLENBQUNJLEVBQUUsQ0FBRSxDQUFDSyxNQUFNLENBQUNILGNBQWMsQ0FBRSxHQUFJLENBQUUsQ0FBQztFQUUxQ0wsTUFBTSxHQUFHO0lBQUVTLFVBQVUsRUFBRTtFQUFLLENBQUM7RUFDN0JkLGNBQWMsQ0FBRUssTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFJLENBQUM7RUFDbENELE1BQU0sQ0FBQ0ksRUFBRSxDQUFFSCxNQUFNLENBQUNTLFVBQVUsS0FBSyxJQUFLLENBQUM7RUFDdkNWLE1BQU0sQ0FBQ0ksRUFBRSxDQUFFLENBQUNLLE1BQU0sQ0FBQ0gsY0FBYyxDQUFFLEdBQUksQ0FBRSxDQUFDO0VBQzFDTixNQUFNLENBQUNJLEVBQUUsQ0FBRSxDQUFDSyxNQUFNLENBQUNILGNBQWMsQ0FBRSxHQUFJLENBQUUsQ0FBQztBQUM1QyxDQUFFLENBQUMifQ==