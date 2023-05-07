// Copyright 2017-2022, University of Colorado Boulder

/**
 * QUnit tests for NumberProperty
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../dot/js/Range.js';
import Tandem from '../../tandem/js/Tandem.js';
import NumberProperty, { DEFAULT_RANGE } from './NumberProperty.js';
import Property from './Property.js';
QUnit.module('NumberProperty');
QUnit.test('Test NumberProperty', assert => {
  assert.ok(true, 'one test needed when running without assertions');
  let property = new NumberProperty(42); // highly random, do not change

  // valueType
  window.assert && assert.throws(() => {
    // @ts-expect-error INTENTIONAL
    property = new NumberProperty('foo');
  }, 'initial value has invalid valueType');
  property = new NumberProperty(0);
  property.value = 1;
  window.assert && assert.throws(() => {
    // @ts-expect-error INTENTIONAL
    property.value = 'foo';
  }, 'set value has invalid valueType');

  // numberType
  property = new NumberProperty(0, {
    numberType: 'FloatingPoint'
  });
  property.value = 1;
  property.value = 1.2;
  window.assert && assert.throws(() => {
    property = new NumberProperty(1.2, {
      numberType: 'Integer'
    });
  }, 'initial value has invalid numberType');
  window.assert && assert.throws(() => {
    property = new NumberProperty(0, {
      numberType: 'Integer',
      validValues: [0, 1, 1.2, 2]
    });
  }, 'member of validValues has invalid numberType');
  property = new NumberProperty(0, {
    numberType: 'Integer'
  });
  property.value = 1;
  window.assert && assert.throws(() => {
    property.value = 1.2;
  }, 'set value has invalid numberType');

  // range
  window.assert && assert.throws(() => {
    // @ts-expect-error INTENTIONAL
    property = new NumberProperty(0, {
      range: [0, 10]
    });
  }, 'bad range');
  window.assert && assert.throws(() => {
    property = new NumberProperty(11, {
      range: new Range(0, 10)
    });
  }, 'initial value is greater than range.max');
  window.assert && assert.throws(() => {
    property = new NumberProperty(-1, {
      range: new Range(0, 10)
    });
  }, 'initial value is less than range.min');
  window.assert && assert.throws(() => {
    property = new NumberProperty(0, {
      range: new Range(0, 10),
      validValues: [0, 1, 2, 11]
    });
  }, 'member of validValues is greater than range.max');
  window.assert && assert.throws(() => {
    property = new NumberProperty(0, {
      range: new Range(0, 10),
      validValues: [-1, 0, 1, 2]
    });
  }, 'member of validValues is less than range.min');
  property = new NumberProperty(0, {
    range: new Range(0, 10)
  });
  property.value = 5;
  window.assert && assert.throws(() => {
    property.value = 11;
  }, 'set value is greater than range.max');
  window.assert && assert.throws(() => {
    property.value = -1;
  }, 'set value is less than range.min');

  // units
  window.assert && assert.throws(() => {
    property = new NumberProperty(0, {
      units: 'elephants'
    });
  }, 'bad units');

  ///////////////////////////////
  property = new NumberProperty(0, {
    range: new Range(0, 10)
  });
  property.rangeProperty.value = new Range(0, 100);
  property.value = 99;
  property.rangeProperty.value = new Range(90, 100);

  // This should not fail, but will until we support nested deferral for PhET-iO support, see https://github.com/phetsims/axon/issues/282
  // p.reset();

  ///////////////////////////////
  property = new NumberProperty(0, {
    range: new Range(0, 10)
  });
  property.value = 5;
  property.rangeProperty.value = new Range(4, 10);
  property.reset();
  assert.ok(property.value === 0, 'reset');
  assert.ok(property.rangeProperty.value.min === 0, 'reset range');
});
QUnit.test('Test NumberProperty range option as Property', assert => {
  let rangeProperty = new Property(new Range(0, 1));
  let property = new NumberProperty(4);

  // valueType
  window.assert && assert.throws(() => {
    // @ts-expect-error INTENTIONAL
    property = new NumberProperty(0, {
      range: 'hi'
    });
  }, 'incorrect range type');
  property = new NumberProperty(0, {
    range: rangeProperty
  });
  assert.ok(property.rangeProperty === rangeProperty, 'rangeProperty should be set');
  assert.ok(property.range === rangeProperty.value, 'rangeProperty value should be set NumberProperty.set on construction');
  property.value = 1;
  property.value = 0;
  property.value = 0.5;
  window.assert && assert.throws(() => {
    property.value = 2;
  }, 'larger than range');
  window.assert && assert.throws(() => {
    property.value = -2;
  }, 'smaller than range');
  window.assert && assert.throws(() => {
    rangeProperty.value = new Range(5, 10);
  }, 'current value outside of range');

  // reset from previous test setting to [5,10]
  property.dispose();
  rangeProperty.dispose();
  rangeProperty = new Property(new Range(0, 1));
  property = new NumberProperty(0, {
    range: rangeProperty
  });
  rangeProperty.value = new Range(0, 10);
  property.value = 2;
  property.setValueAndRange(100, new Range(99, 101));
  const myRange = new Range(5, 10);
  property.setValueAndRange(6, myRange);
  assert.ok(myRange === property.rangeProperty.value, 'reference should be kept');
  property = new NumberProperty(0, {
    range: new Range(0, 1)
  });
  assert.ok(property.rangeProperty instanceof Property, 'created a rangeProperty from a range');

  // deferring ordering dependencies
  ///////////////////////////////////////////////////////
  let pCalled = 0;
  let pRangeCalled = 0;
  property.lazyLink(() => pCalled++);
  property.rangeProperty.lazyLink(() => pRangeCalled++);
  property.setDeferred(true);
  property.rangeProperty.setDeferred(true);
  property.set(3);
  assert.ok(pCalled === 0, 'p is still deferred, should not call listeners');
  property.rangeProperty.set(new Range(2, 3));
  assert.ok(pRangeCalled === 0, 'p.rangeProperty is still deferred, should not call listeners');
  const notifyPListeners = property.setDeferred(false);
  if (window.assert) {
    assert.throws(() => {
      notifyPListeners && notifyPListeners();
    }, 'rangeProperty is not yet undeferred and so has the wrong value');
    property['notifying'] = false; // since the above threw an error, reset
  }

  const notifyRangeListeners = property.rangeProperty.setDeferred(false);
  notifyPListeners && notifyPListeners();
  assert.ok(pCalled === 1, 'p listeners should have been called');
  notifyRangeListeners && notifyRangeListeners();
  assert.ok(pRangeCalled === 1, 'p.rangeProperty is still deferred, should not call listeners');
  property.setValueAndRange(-100, new Range(-101, -99));
  assert.ok(pCalled === 2, 'p listeners should have been called again');
  assert.ok(pRangeCalled === 2, 'p.rangeProperty is still deferred, should not call listeners again');
  property = new NumberProperty(0);
  property.value = 4;
  assert.ok(property.rangeProperty.value === DEFAULT_RANGE, 'rangeProperty should have been created');
  property.rangeProperty.value = new Range(0, 4);
  window.assert && assert.throws(() => {
    property.value = 5;
  }, 'current value outside of range');
});
QUnit.test('Test NumberProperty phet-io options', assert => {
  const tandem = Tandem.ROOT_TEST;
  let property = new NumberProperty(0, {
    range: new Range(0, 20),
    tandem: tandem.createTandem('numberProperty'),
    rangePropertyOptions: {
      tandem: tandem.createTandem('rangeProperty')
    }
  });
  assert.ok(property.rangeProperty.isPhetioInstrumented(), 'rangeProperty instrumented');
  assert.ok(property.rangeProperty.tandem.name === 'rangeProperty', 'rangeProperty instrumented');
  property.dispose();
  property = new NumberProperty(0, {
    range: DEFAULT_RANGE
  });
  assert.ok(!property.rangeProperty.isPhetioInstrumented(), 'null ranges do not get instrumented rangeProperty');
  window.assert && Tandem.VALIDATION && assert.throws(() => {
    property = new NumberProperty(0, {
      range: new Range(0, 20),
      tandem: tandem.createTandem('numberProperty2'),
      rangePropertyOptions: {
        tandem: tandem.createTandem('rangePropertyfdsa')
      }
    });
  }, 'cannot instrument default rangeProperty with tandem other than "rangeProperty"');
  property.dispose();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsIlRhbmRlbSIsIk51bWJlclByb3BlcnR5IiwiREVGQVVMVF9SQU5HRSIsIlByb3BlcnR5IiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0Iiwib2siLCJwcm9wZXJ0eSIsIndpbmRvdyIsInRocm93cyIsInZhbHVlIiwibnVtYmVyVHlwZSIsInZhbGlkVmFsdWVzIiwicmFuZ2UiLCJ1bml0cyIsInJhbmdlUHJvcGVydHkiLCJyZXNldCIsIm1pbiIsImRpc3Bvc2UiLCJzZXRWYWx1ZUFuZFJhbmdlIiwibXlSYW5nZSIsInBDYWxsZWQiLCJwUmFuZ2VDYWxsZWQiLCJsYXp5TGluayIsInNldERlZmVycmVkIiwic2V0Iiwibm90aWZ5UExpc3RlbmVycyIsIm5vdGlmeVJhbmdlTGlzdGVuZXJzIiwidGFuZGVtIiwiUk9PVF9URVNUIiwiY3JlYXRlVGFuZGVtIiwicmFuZ2VQcm9wZXJ0eU9wdGlvbnMiLCJpc1BoZXRpb0luc3RydW1lbnRlZCIsIm5hbWUiLCJWQUxJREFUSU9OIl0sInNvdXJjZXMiOlsiTnVtYmVyUHJvcGVydHlUZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBRVW5pdCB0ZXN0cyBmb3IgTnVtYmVyUHJvcGVydHlcclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5LCB7IERFRkFVTFRfUkFOR0UgfSBmcm9tICcuL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4vUHJvcGVydHkuanMnO1xyXG5cclxuUVVuaXQubW9kdWxlKCAnTnVtYmVyUHJvcGVydHknICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnVGVzdCBOdW1iZXJQcm9wZXJ0eScsIGFzc2VydCA9PiB7XHJcbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnb25lIHRlc3QgbmVlZGVkIHdoZW4gcnVubmluZyB3aXRob3V0IGFzc2VydGlvbnMnICk7XHJcblxyXG4gIGxldCBwcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggNDIgKTsgLy8gaGlnaGx5IHJhbmRvbSwgZG8gbm90IGNoYW5nZVxyXG5cclxuICAvLyB2YWx1ZVR5cGVcclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuXHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIElOVEVOVElPTkFMXHJcbiAgICBwcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggJ2ZvbycgKTtcclxuICB9LCAnaW5pdGlhbCB2YWx1ZSBoYXMgaW52YWxpZCB2YWx1ZVR5cGUnICk7XHJcbiAgcHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKTtcclxuICBwcm9wZXJ0eS52YWx1ZSA9IDE7XHJcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XHJcblxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBJTlRFTlRJT05BTFxyXG4gICAgcHJvcGVydHkudmFsdWUgPSAnZm9vJztcclxuICB9LCAnc2V0IHZhbHVlIGhhcyBpbnZhbGlkIHZhbHVlVHlwZScgKTtcclxuXHJcbiAgLy8gbnVtYmVyVHlwZVxyXG4gIHByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7IG51bWJlclR5cGU6ICdGbG9hdGluZ1BvaW50JyB9ICk7XHJcbiAgcHJvcGVydHkudmFsdWUgPSAxO1xyXG4gIHByb3BlcnR5LnZhbHVlID0gMS4yO1xyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG4gICAgcHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDEuMiwgeyBudW1iZXJUeXBlOiAnSW50ZWdlcicgfSApO1xyXG4gIH0sICdpbml0aWFsIHZhbHVlIGhhcyBpbnZhbGlkIG51bWJlclR5cGUnICk7XHJcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XHJcbiAgICBwcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICBudW1iZXJUeXBlOiAnSW50ZWdlcicsXHJcbiAgICAgIHZhbGlkVmFsdWVzOiBbIDAsIDEsIDEuMiwgMiBdXHJcbiAgICB9ICk7XHJcbiAgfSwgJ21lbWJlciBvZiB2YWxpZFZhbHVlcyBoYXMgaW52YWxpZCBudW1iZXJUeXBlJyApO1xyXG4gIHByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7IG51bWJlclR5cGU6ICdJbnRlZ2VyJyB9ICk7XHJcbiAgcHJvcGVydHkudmFsdWUgPSAxO1xyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG4gICAgcHJvcGVydHkudmFsdWUgPSAxLjI7XHJcbiAgfSwgJ3NldCB2YWx1ZSBoYXMgaW52YWxpZCBudW1iZXJUeXBlJyApO1xyXG5cclxuICAvLyByYW5nZVxyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG5cclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgSU5URU5USU9OQUxcclxuICAgIHByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7IHJhbmdlOiBbIDAsIDEwIF0gfSApO1xyXG4gIH0sICdiYWQgcmFuZ2UnICk7XHJcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XHJcbiAgICBwcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMTEsIHsgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMTAgKSB9ICk7XHJcbiAgfSwgJ2luaXRpYWwgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIHJhbmdlLm1heCcgKTtcclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuICAgIHByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAtMSwgeyByYW5nZTogbmV3IFJhbmdlKCAwLCAxMCApIH0gKTtcclxuICB9LCAnaW5pdGlhbCB2YWx1ZSBpcyBsZXNzIHRoYW4gcmFuZ2UubWluJyApO1xyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG4gICAgcHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMTAgKSxcclxuICAgICAgdmFsaWRWYWx1ZXM6IFsgMCwgMSwgMiwgMTEgXVxyXG4gICAgfSApO1xyXG4gIH0sICdtZW1iZXIgb2YgdmFsaWRWYWx1ZXMgaXMgZ3JlYXRlciB0aGFuIHJhbmdlLm1heCcgKTtcclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuICAgIHByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDEwICksXHJcbiAgICAgIHZhbGlkVmFsdWVzOiBbIC0xLCAwLCAxLCAyIF1cclxuICAgIH0gKTtcclxuICB9LCAnbWVtYmVyIG9mIHZhbGlkVmFsdWVzIGlzIGxlc3MgdGhhbiByYW5nZS5taW4nICk7XHJcbiAgcHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHsgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMTAgKSB9ICk7XHJcbiAgcHJvcGVydHkudmFsdWUgPSA1O1xyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG4gICAgcHJvcGVydHkudmFsdWUgPSAxMTtcclxuICB9LCAnc2V0IHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiByYW5nZS5tYXgnICk7XHJcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XHJcbiAgICBwcm9wZXJ0eS52YWx1ZSA9IC0xO1xyXG4gIH0sICdzZXQgdmFsdWUgaXMgbGVzcyB0aGFuIHJhbmdlLm1pbicgKTtcclxuXHJcbiAgLy8gdW5pdHNcclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuICAgIHByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7IHVuaXRzOiAnZWxlcGhhbnRzJyB9ICk7XHJcbiAgfSwgJ2JhZCB1bml0cycgKTtcclxuXHJcbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gIHByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7IHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDEwICkgfSApO1xyXG4gIHByb3BlcnR5LnJhbmdlUHJvcGVydHkudmFsdWUgPSBuZXcgUmFuZ2UoIDAsIDEwMCApO1xyXG4gIHByb3BlcnR5LnZhbHVlID0gOTk7XHJcbiAgcHJvcGVydHkucmFuZ2VQcm9wZXJ0eS52YWx1ZSA9IG5ldyBSYW5nZSggOTAsIDEwMCApO1xyXG5cclxuICAvLyBUaGlzIHNob3VsZCBub3QgZmFpbCwgYnV0IHdpbGwgdW50aWwgd2Ugc3VwcG9ydCBuZXN0ZWQgZGVmZXJyYWwgZm9yIFBoRVQtaU8gc3VwcG9ydCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9heG9uL2lzc3Vlcy8yODJcclxuICAvLyBwLnJlc2V0KCk7XHJcblxyXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICBwcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwgeyByYW5nZTogbmV3IFJhbmdlKCAwLCAxMCApIH0gKTtcclxuICBwcm9wZXJ0eS52YWx1ZSA9IDU7XHJcbiAgcHJvcGVydHkucmFuZ2VQcm9wZXJ0eS52YWx1ZSA9IG5ldyBSYW5nZSggNCwgMTAgKTtcclxuICBwcm9wZXJ0eS5yZXNldCgpO1xyXG4gIGFzc2VydC5vayggcHJvcGVydHkudmFsdWUgPT09IDAsICdyZXNldCcgKTtcclxuICBhc3NlcnQub2soIHByb3BlcnR5LnJhbmdlUHJvcGVydHkudmFsdWUubWluID09PSAwLCAncmVzZXQgcmFuZ2UnICk7XHJcbn0gKTtcclxuXHJcblxyXG5RVW5pdC50ZXN0KCAnVGVzdCBOdW1iZXJQcm9wZXJ0eSByYW5nZSBvcHRpb24gYXMgUHJvcGVydHknLCBhc3NlcnQgPT4ge1xyXG5cclxuICBsZXQgcmFuZ2VQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbmV3IFJhbmdlKCAwLCAxICkgKTtcclxuICBsZXQgcHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDQgKTtcclxuXHJcbiAgLy8gdmFsdWVUeXBlXHJcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XHJcblxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBJTlRFTlRJT05BTFxyXG4gICAgcHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHsgcmFuZ2U6ICdoaScgfSApO1xyXG4gIH0sICdpbmNvcnJlY3QgcmFuZ2UgdHlwZScgKTtcclxuXHJcbiAgcHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHsgcmFuZ2U6IHJhbmdlUHJvcGVydHkgfSApO1xyXG4gIGFzc2VydC5vayggcHJvcGVydHkucmFuZ2VQcm9wZXJ0eSA9PT0gcmFuZ2VQcm9wZXJ0eSwgJ3JhbmdlUHJvcGVydHkgc2hvdWxkIGJlIHNldCcgKTtcclxuICBhc3NlcnQub2soIHByb3BlcnR5LnJhbmdlID09PSByYW5nZVByb3BlcnR5LnZhbHVlLCAncmFuZ2VQcm9wZXJ0eSB2YWx1ZSBzaG91bGQgYmUgc2V0IE51bWJlclByb3BlcnR5LnNldCBvbiBjb25zdHJ1Y3Rpb24nICk7XHJcbiAgcHJvcGVydHkudmFsdWUgPSAxO1xyXG4gIHByb3BlcnR5LnZhbHVlID0gMDtcclxuICBwcm9wZXJ0eS52YWx1ZSA9IDAuNTtcclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuICAgIHByb3BlcnR5LnZhbHVlID0gMjtcclxuICB9LCAnbGFyZ2VyIHRoYW4gcmFuZ2UnICk7XHJcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XHJcbiAgICBwcm9wZXJ0eS52YWx1ZSA9IC0yO1xyXG4gIH0sICdzbWFsbGVyIHRoYW4gcmFuZ2UnICk7XHJcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XHJcbiAgICByYW5nZVByb3BlcnR5LnZhbHVlID0gbmV3IFJhbmdlKCA1LCAxMCApO1xyXG4gIH0sICdjdXJyZW50IHZhbHVlIG91dHNpZGUgb2YgcmFuZ2UnICk7XHJcblxyXG4gIC8vIHJlc2V0IGZyb20gcHJldmlvdXMgdGVzdCBzZXR0aW5nIHRvIFs1LDEwXVxyXG4gIHByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICByYW5nZVByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICByYW5nZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBuZXcgUmFuZ2UoIDAsIDEgKSApO1xyXG5cclxuICBwcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwgeyByYW5nZTogcmFuZ2VQcm9wZXJ0eSB9ICk7XHJcbiAgcmFuZ2VQcm9wZXJ0eS52YWx1ZSA9IG5ldyBSYW5nZSggMCwgMTAgKTtcclxuICBwcm9wZXJ0eS52YWx1ZSA9IDI7XHJcblxyXG4gIHByb3BlcnR5LnNldFZhbHVlQW5kUmFuZ2UoIDEwMCwgbmV3IFJhbmdlKCA5OSwgMTAxICkgKTtcclxuXHJcbiAgY29uc3QgbXlSYW5nZSA9IG5ldyBSYW5nZSggNSwgMTAgKTtcclxuICBwcm9wZXJ0eS5zZXRWYWx1ZUFuZFJhbmdlKCA2LCBteVJhbmdlICk7XHJcblxyXG4gIGFzc2VydC5vayggbXlSYW5nZSA9PT0gcHJvcGVydHkucmFuZ2VQcm9wZXJ0eS52YWx1ZSwgJ3JlZmVyZW5jZSBzaG91bGQgYmUga2VwdCcgKTtcclxuXHJcbiAgcHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHsgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMSApIH0gKTtcclxuICBhc3NlcnQub2soIHByb3BlcnR5LnJhbmdlUHJvcGVydHkgaW5zdGFuY2VvZiBQcm9wZXJ0eSwgJ2NyZWF0ZWQgYSByYW5nZVByb3BlcnR5IGZyb20gYSByYW5nZScgKTtcclxuXHJcbiAgLy8gZGVmZXJyaW5nIG9yZGVyaW5nIGRlcGVuZGVuY2llc1xyXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICBsZXQgcENhbGxlZCA9IDA7XHJcbiAgbGV0IHBSYW5nZUNhbGxlZCA9IDA7XHJcbiAgcHJvcGVydHkubGF6eUxpbmsoICgpID0+IHBDYWxsZWQrKyApO1xyXG4gIHByb3BlcnR5LnJhbmdlUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHBSYW5nZUNhbGxlZCsrICk7XHJcbiAgcHJvcGVydHkuc2V0RGVmZXJyZWQoIHRydWUgKTtcclxuICBwcm9wZXJ0eS5yYW5nZVByb3BlcnR5LnNldERlZmVycmVkKCB0cnVlICk7XHJcbiAgcHJvcGVydHkuc2V0KCAzICk7XHJcbiAgYXNzZXJ0Lm9rKCBwQ2FsbGVkID09PSAwLCAncCBpcyBzdGlsbCBkZWZlcnJlZCwgc2hvdWxkIG5vdCBjYWxsIGxpc3RlbmVycycgKTtcclxuICBwcm9wZXJ0eS5yYW5nZVByb3BlcnR5LnNldCggbmV3IFJhbmdlKCAyLCAzICkgKTtcclxuICBhc3NlcnQub2soIHBSYW5nZUNhbGxlZCA9PT0gMCwgJ3AucmFuZ2VQcm9wZXJ0eSBpcyBzdGlsbCBkZWZlcnJlZCwgc2hvdWxkIG5vdCBjYWxsIGxpc3RlbmVycycgKTtcclxuICBjb25zdCBub3RpZnlQTGlzdGVuZXJzID0gcHJvcGVydHkuc2V0RGVmZXJyZWQoIGZhbHNlICk7XHJcblxyXG5cclxuICBpZiAoIHdpbmRvdy5hc3NlcnQgKSB7XHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XHJcbiAgICAgIG5vdGlmeVBMaXN0ZW5lcnMgJiYgbm90aWZ5UExpc3RlbmVycygpO1xyXG4gICAgfSwgJ3JhbmdlUHJvcGVydHkgaXMgbm90IHlldCB1bmRlZmVycmVkIGFuZCBzbyBoYXMgdGhlIHdyb25nIHZhbHVlJyApO1xyXG5cclxuICAgIHByb3BlcnR5WyAnbm90aWZ5aW5nJyBdID0gZmFsc2U7IC8vIHNpbmNlIHRoZSBhYm92ZSB0aHJldyBhbiBlcnJvciwgcmVzZXRcclxuICB9XHJcbiAgY29uc3Qgbm90aWZ5UmFuZ2VMaXN0ZW5lcnMgPSBwcm9wZXJ0eS5yYW5nZVByb3BlcnR5LnNldERlZmVycmVkKCBmYWxzZSApO1xyXG4gIG5vdGlmeVBMaXN0ZW5lcnMgJiYgbm90aWZ5UExpc3RlbmVycygpO1xyXG4gIGFzc2VydC5vayggcENhbGxlZCA9PT0gMSwgJ3AgbGlzdGVuZXJzIHNob3VsZCBoYXZlIGJlZW4gY2FsbGVkJyApO1xyXG4gIG5vdGlmeVJhbmdlTGlzdGVuZXJzICYmIG5vdGlmeVJhbmdlTGlzdGVuZXJzKCk7XHJcbiAgYXNzZXJ0Lm9rKCBwUmFuZ2VDYWxsZWQgPT09IDEsICdwLnJhbmdlUHJvcGVydHkgaXMgc3RpbGwgZGVmZXJyZWQsIHNob3VsZCBub3QgY2FsbCBsaXN0ZW5lcnMnICk7XHJcblxyXG4gIHByb3BlcnR5LnNldFZhbHVlQW5kUmFuZ2UoIC0xMDAsIG5ldyBSYW5nZSggLTEwMSwgLTk5ICkgKTtcclxuICBhc3NlcnQub2soIHBDYWxsZWQgPT09IDIsICdwIGxpc3RlbmVycyBzaG91bGQgaGF2ZSBiZWVuIGNhbGxlZCBhZ2FpbicgKTtcclxuICBhc3NlcnQub2soIHBSYW5nZUNhbGxlZCA9PT0gMiwgJ3AucmFuZ2VQcm9wZXJ0eSBpcyBzdGlsbCBkZWZlcnJlZCwgc2hvdWxkIG5vdCBjYWxsIGxpc3RlbmVycyBhZ2FpbicgKTtcclxuXHJcbiAgcHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKTtcclxuICBwcm9wZXJ0eS52YWx1ZSA9IDQ7XHJcbiAgYXNzZXJ0Lm9rKCBwcm9wZXJ0eS5yYW5nZVByb3BlcnR5LnZhbHVlID09PSBERUZBVUxUX1JBTkdFLCAncmFuZ2VQcm9wZXJ0eSBzaG91bGQgaGF2ZSBiZWVuIGNyZWF0ZWQnICk7XHJcbiAgcHJvcGVydHkucmFuZ2VQcm9wZXJ0eS52YWx1ZSA9IG5ldyBSYW5nZSggMCwgNCApO1xyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG4gICAgcHJvcGVydHkudmFsdWUgPSA1O1xyXG4gIH0sICdjdXJyZW50IHZhbHVlIG91dHNpZGUgb2YgcmFuZ2UnICk7XHJcbn0gKTtcclxuUVVuaXQudGVzdCggJ1Rlc3QgTnVtYmVyUHJvcGVydHkgcGhldC1pbyBvcHRpb25zJywgYXNzZXJ0ID0+IHtcclxuXHJcbiAgY29uc3QgdGFuZGVtID0gVGFuZGVtLlJPT1RfVEVTVDtcclxuICBsZXQgcHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDIwICksXHJcbiAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdudW1iZXJQcm9wZXJ0eScgKSxcclxuICAgIHJhbmdlUHJvcGVydHlPcHRpb25zOiB7IHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JhbmdlUHJvcGVydHknICkgfVxyXG4gIH0gKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBwcm9wZXJ0eS5yYW5nZVByb3BlcnR5LmlzUGhldGlvSW5zdHJ1bWVudGVkKCksICdyYW5nZVByb3BlcnR5IGluc3RydW1lbnRlZCcgKTtcclxuICBhc3NlcnQub2soIHByb3BlcnR5LnJhbmdlUHJvcGVydHkudGFuZGVtLm5hbWUgPT09ICdyYW5nZVByb3BlcnR5JywgJ3JhbmdlUHJvcGVydHkgaW5zdHJ1bWVudGVkJyApO1xyXG5cclxuICBwcm9wZXJ0eS5kaXNwb3NlKCk7XHJcblxyXG4gIHByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICByYW5nZTogREVGQVVMVF9SQU5HRVxyXG4gIH0gKTtcclxuICBhc3NlcnQub2soICFwcm9wZXJ0eS5yYW5nZVByb3BlcnR5LmlzUGhldGlvSW5zdHJ1bWVudGVkKCksICdudWxsIHJhbmdlcyBkbyBub3QgZ2V0IGluc3RydW1lbnRlZCByYW5nZVByb3BlcnR5JyApO1xyXG5cclxuICB3aW5kb3cuYXNzZXJ0ICYmIFRhbmRlbS5WQUxJREFUSU9OICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuICAgIHByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDIwICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ251bWJlclByb3BlcnR5MicgKSxcclxuICAgICAgcmFuZ2VQcm9wZXJ0eU9wdGlvbnM6IHsgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmFuZ2VQcm9wZXJ0eWZkc2EnICkgfVxyXG4gICAgfSApO1xyXG4gIH0sICdjYW5ub3QgaW5zdHJ1bWVudCBkZWZhdWx0IHJhbmdlUHJvcGVydHkgd2l0aCB0YW5kZW0gb3RoZXIgdGhhbiBcInJhbmdlUHJvcGVydHlcIicgKTtcclxuICBwcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbn0gKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLHVCQUF1QjtBQUN6QyxPQUFPQyxNQUFNLE1BQU0sMkJBQTJCO0FBQzlDLE9BQU9DLGNBQWMsSUFBSUMsYUFBYSxRQUFRLHFCQUFxQjtBQUNuRSxPQUFPQyxRQUFRLE1BQU0sZUFBZTtBQUVwQ0MsS0FBSyxDQUFDQyxNQUFNLENBQUUsZ0JBQWlCLENBQUM7QUFFaENELEtBQUssQ0FBQ0UsSUFBSSxDQUFFLHFCQUFxQixFQUFFQyxNQUFNLElBQUk7RUFDM0NBLE1B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