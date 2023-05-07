// Copyright 2018-2023, University of Colorado Boulder

/**
 * Tests for EnumerationDeprecated
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationDeprecated from './EnumerationDeprecated.js';
QUnit.module('EnumerationDeprecated');
QUnit.test('Basic enumeration', assert => {
  const CardinalDirection = EnumerationDeprecated.byKeys(['NORTH', 'SOUTH', 'EAST', 'WEST']);
  assert.equal(CardinalDirection.NORTH, 'NORTH', 'Equality for NORTH');
  assert.equal(CardinalDirection.SOUTH, 'SOUTH', 'Equality for SOUTH');
  assert.equal(CardinalDirection.EAST, 'EAST', 'Equality for EAST');
  assert.equal(CardinalDirection.WEST, 'WEST', 'Equality for WEST');
  assert.equal(CardinalDirection.includes(CardinalDirection.NORTH), true, 'NORTH is in the enumeration');
  assert.equal(CardinalDirection.includes('NORTH'), false, 'Strings shouln\'t match');
  assert.equal(CardinalDirection.includes('YORKSHIRE_TERRIER_WITH_THE_CANDLE_STICK_IN_THE_BALLROOM'), false, 'Not in the enumeration');
  assert.equal(CardinalDirection.includes({
    name: 'NORTH'
  }), false, 'Should not be able to synthesize EnumerationDeprecated values');

  // Test toString
  const object = {};
  object[CardinalDirection.NORTH] = 'exit';
  assert.equal(object.NORTH, 'exit', 'toString should work seamlessly');
  window.assert && assert.throws(() => {
    CardinalDirection.SOMETHING_AFTER_THE_FREEZE = 5;
  }, 'Should not be able to set things after initialization');
  window.assert && assert.throws(() => {
    const X = EnumerationDeprecated.byKeys(['lowercase', 'should', 'fail']);
    assert.ok(!!X, 'fake assertion so x is used');
  }, 'EnumerationDeprecated should fail for lowercase values');
});
QUnit.test('Before freeze test', assert => {
  const E = EnumerationDeprecated.byKeys(['A', 'B'], {
    beforeFreeze: E => {
      E.opposite = e => {
        window.assert && window.assert(E.includes(e));
        return e === E.A ? E.B : E.A;
      };
    }
  });
  assert.equal(E.A, 'A', 'Equality for A');
  assert.equal(E.B, 'B', 'Equality for B');
  assert.equal(E.opposite(E.A), E.B, 'Custom function check 1');
  assert.equal(E.opposite(E.B), E.A, 'Custom function check 2');
  window.assert && assert.throws(() => {
    E.SOMETHING_AFTER_THE_FREEZE = 5;
  }, 'Should not be able to set things after initialization');
});
QUnit.test('VALUES', assert => {
  const People = EnumerationDeprecated.byKeys(['ALICE', 'BOB']);
  assert.ok(true, 'at least one assertion must run per test');
  window.assert && assert.throws(() => {
    People.VALUES = 'something else';
  }, 'Setting values after initialization should throw an error.');
});
QUnit.test('Rich', assert => {
  class Planet {
    constructor(order) {
      this.order = order;
    }

    // @public
    getString(name) {
      return `${name} is a person from the ${this.order} planet.`;
    }
  }
  class Venus extends Planet {}
  const Planets = EnumerationDeprecated.byMap({
    MARS: new Planet(2),
    EARTH: new Planet(3)
  });
  assert.ok(Planets.MARS.order === 2, 'mars order should match');
  assert.ok(typeof Planets.EARTH.getString('bob') === 'string', 'should return a string');
  window.assert && assert.throws(() => {
    Planets.MARS = 'hello'; // fails because enumeration values should not be reassignable
  });

  window.assert && assert.throws(() => {
    Planets.MARS.name = 'not mars!'; // Should not be able to reassign enumeration value properties
  });

  window.assert && assert.throws(() => {
    EnumerationDeprecated.byMap({
      MARS: new Planet(2),
      EARTH: new Planet(3),
      VENUS: new Venus(7) // Forbidden at the moment, see https://github.com/phetsims/phet-core/issues/50#issuecomment-575324970
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbkRlcHJlY2F0ZWQiLCJRVW5pdCIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJDYXJkaW5hbERpcmVjdGlvbiIsImJ5S2V5cyIsImVxdWFsIiwiTk9SVEgiLCJTT1VUSCIsIkVBU1QiLCJXRVNUIiwiaW5jbHVkZXMiLCJuYW1lIiwib2JqZWN0Iiwid2luZG93IiwidGhyb3dzIiwiU09NRVRISU5HX0FGVEVSX1RIRV9GUkVFWkUiLCJYIiwib2siLCJFIiwiYmVmb3JlRnJlZXplIiwib3Bwb3NpdGUiLCJlIiwiQSIsIkIiLCJQZW9wbGUiLCJWQUxVRVMiLCJQbGFuZXQiLCJjb25zdHJ1Y3RvciIsIm9yZGVyIiwiZ2V0U3RyaW5nIiwiVmVudXMiLCJQbGFuZXRzIiwiYnlNYXAiLCJNQVJTIiwiRUFSVEgiLCJWRU5VUyJdLCJzb3VyY2VzIjpbIkVudW1lcmF0aW9uRGVwcmVjYXRlZFRlc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRlc3RzIGZvciBFbnVtZXJhdGlvbkRlcHJlY2F0ZWRcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgZnJvbSAnLi9FbnVtZXJhdGlvbkRlcHJlY2F0ZWQuanMnO1xyXG5cclxuUVVuaXQubW9kdWxlKCAnRW51bWVyYXRpb25EZXByZWNhdGVkJyApO1xyXG5cclxuUVVuaXQudGVzdCggJ0Jhc2ljIGVudW1lcmF0aW9uJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBDYXJkaW5hbERpcmVjdGlvbiA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ05PUlRIJywgJ1NPVVRIJywgJ0VBU1QnLCAnV0VTVCcgXSApO1xyXG5cclxuICBhc3NlcnQuZXF1YWwoIENhcmRpbmFsRGlyZWN0aW9uLk5PUlRILCAnTk9SVEgnLCAnRXF1YWxpdHkgZm9yIE5PUlRIJyApO1xyXG4gIGFzc2VydC5lcXVhbCggQ2FyZGluYWxEaXJlY3Rpb24uU09VVEgsICdTT1VUSCcsICdFcXVhbGl0eSBmb3IgU09VVEgnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBDYXJkaW5hbERpcmVjdGlvbi5FQVNULCAnRUFTVCcsICdFcXVhbGl0eSBmb3IgRUFTVCcgKTtcclxuICBhc3NlcnQuZXF1YWwoIENhcmRpbmFsRGlyZWN0aW9uLldFU1QsICdXRVNUJywgJ0VxdWFsaXR5IGZvciBXRVNUJyApO1xyXG5cclxuICBhc3NlcnQuZXF1YWwoIENhcmRpbmFsRGlyZWN0aW9uLmluY2x1ZGVzKCBDYXJkaW5hbERpcmVjdGlvbi5OT1JUSCApLCB0cnVlLCAnTk9SVEggaXMgaW4gdGhlIGVudW1lcmF0aW9uJyApO1xyXG4gIGFzc2VydC5lcXVhbCggQ2FyZGluYWxEaXJlY3Rpb24uaW5jbHVkZXMoICdOT1JUSCcgKSwgZmFsc2UsICdTdHJpbmdzIHNob3VsblxcJ3QgbWF0Y2gnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBDYXJkaW5hbERpcmVjdGlvbi5pbmNsdWRlcyggJ1lPUktTSElSRV9URVJSSUVSX1dJVEhfVEhFX0NBTkRMRV9TVElDS19JTl9USEVfQkFMTFJPT00nICksIGZhbHNlLFxyXG4gICAgJ05vdCBpbiB0aGUgZW51bWVyYXRpb24nICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBDYXJkaW5hbERpcmVjdGlvbi5pbmNsdWRlcyggeyBuYW1lOiAnTk9SVEgnIH0gKSwgZmFsc2UsICdTaG91bGQgbm90IGJlIGFibGUgdG8gc3ludGhlc2l6ZSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgdmFsdWVzJyApO1xyXG5cclxuICAvLyBUZXN0IHRvU3RyaW5nXHJcbiAgY29uc3Qgb2JqZWN0ID0ge307XHJcbiAgb2JqZWN0WyBDYXJkaW5hbERpcmVjdGlvbi5OT1JUSCBdID0gJ2V4aXQnO1xyXG4gIGFzc2VydC5lcXVhbCggb2JqZWN0Lk5PUlRILCAnZXhpdCcsICd0b1N0cmluZyBzaG91bGQgd29yayBzZWFtbGVzc2x5JyApO1xyXG5cclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuICAgIENhcmRpbmFsRGlyZWN0aW9uLlNPTUVUSElOR19BRlRFUl9USEVfRlJFRVpFID0gNTtcclxuICB9LCAnU2hvdWxkIG5vdCBiZSBhYmxlIHRvIHNldCB0aGluZ3MgYWZ0ZXIgaW5pdGlhbGl6YXRpb24nICk7XHJcblxyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG4gICAgY29uc3QgWCA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ2xvd2VyY2FzZScsICdzaG91bGQnLCAnZmFpbCcgXSApO1xyXG4gICAgYXNzZXJ0Lm9rKCAhIVgsICdmYWtlIGFzc2VydGlvbiBzbyB4IGlzIHVzZWQnICk7XHJcbiAgfSwgJ0VudW1lcmF0aW9uRGVwcmVjYXRlZCBzaG91bGQgZmFpbCBmb3IgbG93ZXJjYXNlIHZhbHVlcycgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0JlZm9yZSBmcmVlemUgdGVzdCcsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgRSA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ0EnLCAnQicgXSwge1xyXG4gICAgYmVmb3JlRnJlZXplOiBFID0+IHtcclxuICAgICAgRS5vcHBvc2l0ZSA9IGUgPT4ge1xyXG4gICAgICAgIHdpbmRvdy5hc3NlcnQgJiYgd2luZG93LmFzc2VydCggRS5pbmNsdWRlcyggZSApICk7XHJcbiAgICAgICAgcmV0dXJuIGUgPT09IEUuQSA/IEUuQiA6IEUuQTtcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9ICk7XHJcblxyXG4gIGFzc2VydC5lcXVhbCggRS5BLCAnQScsICdFcXVhbGl0eSBmb3IgQScgKTtcclxuICBhc3NlcnQuZXF1YWwoIEUuQiwgJ0InLCAnRXF1YWxpdHkgZm9yIEInICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBFLm9wcG9zaXRlKCBFLkEgKSwgRS5CLCAnQ3VzdG9tIGZ1bmN0aW9uIGNoZWNrIDEnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBFLm9wcG9zaXRlKCBFLkIgKSwgRS5BLCAnQ3VzdG9tIGZ1bmN0aW9uIGNoZWNrIDInICk7XHJcblxyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG4gICAgRS5TT01FVEhJTkdfQUZURVJfVEhFX0ZSRUVaRSA9IDU7XHJcbiAgfSwgJ1Nob3VsZCBub3QgYmUgYWJsZSB0byBzZXQgdGhpbmdzIGFmdGVyIGluaXRpYWxpemF0aW9uJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnVkFMVUVTJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBQZW9wbGUgPSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQuYnlLZXlzKCBbICdBTElDRScsICdCT0InIF0gKTtcclxuICBhc3NlcnQub2soIHRydWUsICdhdCBsZWFzdCBvbmUgYXNzZXJ0aW9uIG11c3QgcnVuIHBlciB0ZXN0JyApO1xyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG4gICAgUGVvcGxlLlZBTFVFUyA9ICdzb21ldGhpbmcgZWxzZSc7XHJcbiAgfSwgJ1NldHRpbmcgdmFsdWVzIGFmdGVyIGluaXRpYWxpemF0aW9uIHNob3VsZCB0aHJvdyBhbiBlcnJvci4nICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdSaWNoJywgYXNzZXJ0ID0+IHtcclxuICBjbGFzcyBQbGFuZXQge1xyXG4gICAgY29uc3RydWN0b3IoIG9yZGVyICkge1xyXG4gICAgICB0aGlzLm9yZGVyID0gb3JkZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHB1YmxpY1xyXG4gICAgZ2V0U3RyaW5nKCBuYW1lICkge1xyXG4gICAgICByZXR1cm4gYCR7bmFtZX0gaXMgYSBwZXJzb24gZnJvbSB0aGUgJHt0aGlzLm9yZGVyfSBwbGFuZXQuYDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNsYXNzIFZlbnVzIGV4dGVuZHMgUGxhbmV0IHt9XHJcblxyXG4gIGNvbnN0IFBsYW5ldHMgPSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQuYnlNYXAoIHtcclxuICAgIE1BUlM6IG5ldyBQbGFuZXQoIDIgKSxcclxuICAgIEVBUlRIOiBuZXcgUGxhbmV0KCAzIClcclxuICB9ICk7XHJcblxyXG4gIGFzc2VydC5vayggUGxhbmV0cy5NQVJTLm9yZGVyID09PSAyLCAnbWFycyBvcmRlciBzaG91bGQgbWF0Y2gnICk7XHJcbiAgYXNzZXJ0Lm9rKCB0eXBlb2YgUGxhbmV0cy5FQVJUSC5nZXRTdHJpbmcoICdib2InICkgPT09ICdzdHJpbmcnLCAnc2hvdWxkIHJldHVybiBhIHN0cmluZycgKTtcclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuICAgIFBsYW5ldHMuTUFSUyA9ICdoZWxsbyc7IC8vIGZhaWxzIGJlY2F1c2UgZW51bWVyYXRpb24gdmFsdWVzIHNob3VsZCBub3QgYmUgcmVhc3NpZ25hYmxlXHJcbiAgfSApO1xyXG5cclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuICAgIFBsYW5ldHMuTUFSUy5uYW1lID0gJ25vdCBtYXJzISc7IC8vIFNob3VsZCBub3QgYmUgYWJsZSB0byByZWFzc2lnbiBlbnVtZXJhdGlvbiB2YWx1ZSBwcm9wZXJ0aWVzXHJcbiAgfSApO1xyXG5cclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuICAgIEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieU1hcCgge1xyXG4gICAgICBNQVJTOiBuZXcgUGxhbmV0KCAyICksXHJcbiAgICAgIEVBUlRIOiBuZXcgUGxhbmV0KCAzICksXHJcbiAgICAgIFZFTlVTOiBuZXcgVmVudXMoIDcgKSAvLyBGb3JiaWRkZW4gYXQgdGhlIG1vbWVudCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWNvcmUvaXNzdWVzLzUwI2lzc3VlY29tbWVudC01NzUzMjQ5NzBcclxuICAgIH0gKTtcclxuICB9ICk7XHJcbn0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EscUJBQXFCLE1BQU0sNEJBQTRCO0FBRTlEQyxLQUFLLENBQUNDLE1BQU0sQ0FBRSx1QkFBd0IsQ0FBQztBQUV2Q0QsS0FBSyxDQUFDRSxJQUFJLENBQUUsbUJBQW1CLEVBQUVDLE1BQU0sSUFBSTtFQUN6QyxNQUFNQyxpQkFBaUIsR0FBR0wscUJBQXFCLENBQUNNLE1BQU0sQ0FBRSxDQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBRyxDQUFDO0VBRTlGRixNQUFNLENBQUNHLEtBQUssQ0FBRUYsaUJBQWlCLENBQUNHLEtBQUssRUFBRSxPQUFPLEVBQUUsb0JBQXFCLENBQUM7RUFDdEVKLE1BQU0sQ0FBQ0csS0FBSyxDQUFFRixpQkFBaUIsQ0FBQ0ksS0FBSyxFQUFFLE9BQU8sRUFBRSxvQkFBcUIsQ0FBQztFQUN0RUwsTUFBTSxDQUFDRyxLQUFLLENBQUVGLGlCQUFpQixDQUFDSyxJQUFJLEVBQUUsTUFBTSxFQUFFLG1CQUFvQixDQUFDO0VBQ25FTixNQUFNLENBQUNHLEtBQUssQ0FBRUYsaUJBQWlCLENBQUNNLElBQUksRUFBRSxNQUFNLEVBQUUsbUJBQW9CLENBQUM7RUFFbkVQLE1BQU0sQ0FBQ0csS0FBSyxDQUFFRixpQkFBaUIsQ0FBQ08sUUFBUSxDQUFFUCxpQkFBaUIsQ0FBQ0csS0FBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLDZCQUE4QixDQUFDO0VBQzFHSixNQUFNLENBQUNHLEtBQUssQ0FBRUYsaUJBQWlCLENBQUNPLFFBQVEsQ0FBRSxPQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUseUJBQTBCLENBQUM7RUFDdkZSLE1BQU0sQ0FBQ0csS0FBSyxDQUFFRixpQkFBaUIsQ0FB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