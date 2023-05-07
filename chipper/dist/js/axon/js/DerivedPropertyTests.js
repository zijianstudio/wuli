// Copyright 2017-2022, University of Colorado Boulder

/**
 * QUnit tests for DerivedProperty
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Tandem from '../../tandem/js/Tandem.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import DerivedProperty from './DerivedProperty.js';
import Property from './Property.js';
import propertyStateHandlerSingleton from './propertyStateHandlerSingleton.js';
QUnit.module('DerivedProperty');
QUnit.test('Test stale values in DerivedProperty', assert => {
  const aProperty = new Property(1);
  const bProperty = new Property(2);
  const cProperty = new DerivedProperty([aProperty, bProperty], (aProperty, bProperty) => {
    return aProperty + bProperty;
  });
  aProperty.value = 7;
  assert.equal(cProperty.value, 9);
});
QUnit.test('Test DerivedProperty.unlink', assert => {
  const widthProperty = new Property(2);
  const startingWidthListenerCount = widthProperty['getListenerCount']();
  const heightProperty = new Property(3);
  const startingHeightListenerCount = heightProperty['getListenerCount']();
  const areaPropertyDependencies = [widthProperty, heightProperty];
  const areaProperty = new DerivedProperty(areaPropertyDependencies, (width, height) => width * height);
  const listener = function (area) {/*console.log( 'area = ' + area );*/};
  areaProperty.link(listener);
  assert.equal(widthProperty['getListenerCount'](), 1 + startingWidthListenerCount);
  assert.equal(heightProperty['getListenerCount'](), 1 + startingHeightListenerCount);
  assert.equal(areaPropertyDependencies.length, 2);

  // Unlink the listener
  areaProperty.unlink(listener);
  areaProperty.dispose();
  assert.equal(widthProperty['getListenerCount'](), startingWidthListenerCount);
  assert.equal(heightProperty['getListenerCount'](), startingHeightListenerCount);
  assert.equal(areaProperty['dependencies'], null);

  // @ts-expect-error, type of dependencyListeners is implicitly any because DerivedProperty can have up to 16 dependencies of any type
  assert.equal(areaProperty['dependencyListeners'], null);
  assert.equal(areaProperty['dependencies'], null);
});
QUnit.test('DerivedProperty.valueEquals', assert => {
  const aProperty = new Property('a');
  const bProperty = new Property('b');
  const cProperty = DerivedProperty['valueEquals'](aProperty, bProperty);
  assert.equal(cProperty.value, false);
  aProperty.value = 'b';
  assert.equal(cProperty.value, true);
});
QUnit.test('Test defer', assert => {
  const firstProperty = new Property(0);
  const secondProperty = new Property(2);
  const derivedProperty = new DerivedProperty([firstProperty, secondProperty], (a, b) => a + b);
  assert.ok(derivedProperty.value === 2, 'base case, no defer');

  // test a dependency being deferred
  firstProperty.setDeferred(true);
  assert.ok(derivedProperty.value === 2, 'same value even after defer');
  firstProperty.value = 2;
  assert.ok(derivedProperty.value === 2, 'same value even when set to new');
  const update = firstProperty.setDeferred(false);
  assert.ok(firstProperty.value === 2, 'property has new value now');
  assert.ok(derivedProperty.value === 2, 'but the derivedProperty doesnt');
  update && update();
  assert.ok(derivedProperty.value === 4, 'now derivedProperty was updated');

  // test the DerivedProperty being deferred
  derivedProperty.setDeferred(true);
  assert.ok(derivedProperty.value === 4, 'still 4');
  firstProperty.value = 4;
  assert.ok(derivedProperty.value === 4, 'still 4 after update');
  const updateAgain = derivedProperty.setDeferred(false);
  assert.ok(derivedProperty.value === 6, 'now has the correct value');
  updateAgain && updateAgain();
  assert.ok(derivedProperty.value === 6, 'nothing changed');
});
QUnit.test('DerivedProperty and/or', assert => {
  const aProperty = new Property(false);
  const bProperty = new Property(false);
  const cProperty = new Property(false);

  // correct usages of 'and' and 'or'
  const andProperty = DerivedProperty.and([aProperty, bProperty, cProperty]);
  const orProperty = DerivedProperty.or([aProperty, bProperty, cProperty]);
  assert.equal(andProperty.value, false);
  assert.equal(orProperty.value, false);
  aProperty.value = true;
  assert.equal(andProperty.value, false);
  assert.equal(orProperty.value, true);
  bProperty.value = true;
  assert.equal(andProperty.value, false);
  assert.equal(orProperty.value, true);
  cProperty.value = true;
  assert.equal(andProperty.value, true);
  assert.equal(orProperty.value, true);

  // @ts-expect-error INTENTIONAL fail: setting a dependency to a non-boolean value
  window.assert && assert.throws(() => {
    aProperty.value = 0;
  }, 'DerivedProperty dependency must have boolean value');
});
if (Tandem.PHET_IO_ENABLED) {
  QUnit.test('propertyStateHandlerSingleton tests for DerivedProperty', assert => {
    const parentTandem = Tandem.ROOT_TEST;
    const originalOrderDependencyLength = propertyStateHandlerSingleton.getNumberOfOrderDependencies();
    const getOrderDependencyLength = () => propertyStateHandlerSingleton.getNumberOfOrderDependencies() - originalOrderDependencyLength;
    const firstProperty = new Property(1, {
      tandem: parentTandem.createTandem('firstProperty'),
      phetioValueType: NumberIO
    });
    const secondProperty = new Property(1, {
      tandem: parentTandem.createTandem('secondProperty'),
      phetioValueType: NumberIO
    });
    const thirdProperty = new Property(1, {
      tandem: parentTandem.createTandem('thirdProperty'),
      phetioValueType: NumberIO
    });
    const derivedProperty = new DerivedProperty([firstProperty, secondProperty, thirdProperty], () => 3, {
      tandem: parentTandem.createTandem('derivedProperty'),
      phetioValueType: NumberIO
    });
    assert.ok(getOrderDependencyLength() === 3, 'derivedProperty adds order dependency for each dependency');
    firstProperty.dispose();
    assert.ok(getOrderDependencyLength() === 2, 'dependency dispose only removes what it effects');
    derivedProperty.dispose();
    assert.ok(getOrderDependencyLength() === 0, 'no orderDependencies after derivedProperty dispose');
    secondProperty.dispose();
    thirdProperty.dispose();
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYW5kZW0iLCJOdW1iZXJJTyIsIkRlcml2ZWRQcm9wZXJ0eSIsIlByb3BlcnR5IiwicHJvcGVydHlTdGF0ZUhhbmRsZXJTaW5nbGV0b24iLCJRVW5pdCIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJhUHJvcGVydHkiLCJiUHJvcGVydHkiLCJjUHJvcGVydHkiLCJ2YWx1ZSIsImVxdWFsIiwid2lkdGhQcm9wZXJ0eSIsInN0YXJ0aW5nV2lkdGhMaXN0ZW5lckNvdW50IiwiaGVpZ2h0UHJvcGVydHkiLCJzdGFydGluZ0hlaWdodExpc3RlbmVyQ291bnQiLCJhcmVhUHJvcGVydHlEZXBlbmRlbmNpZXMiLCJhcmVhUHJvcGVydHkiLCJ3aWR0aCIsImhlaWdodCIsImxpc3RlbmVyIiwiYXJlYSIsImxpbmsiLCJsZW5ndGgiLCJ1bmxpbmsiLCJkaXNwb3NlIiwiZmlyc3RQcm9wZXJ0eSIsInNlY29uZFByb3BlcnR5IiwiZGVyaXZlZFByb3BlcnR5IiwiYSIsImIiLCJvayIsInNldERlZmVycmVkIiwidXBkYXRlIiwidXBkYXRlQWdhaW4iLCJhbmRQcm9wZXJ0eSIsImFuZCIsIm9yUHJvcGVydHkiLCJvciIsIndpbmRvdyIsInRocm93cyIsIlBIRVRfSU9fRU5BQkxFRCIsInBhcmVudFRhbmRlbSIsIlJPT1RfVEVTVCIsIm9yaWdpbmFsT3JkZXJEZXBlbmRlbmN5TGVuZ3RoIiwiZ2V0TnVtYmVyT2ZPcmRlckRlcGVuZGVuY2llcyIsImdldE9yZGVyRGVwZW5kZW5jeUxlbmd0aCIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1ZhbHVlVHlwZSIsInRoaXJkUHJvcGVydHkiXSwic291cmNlcyI6WyJEZXJpdmVkUHJvcGVydHlUZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBRVW5pdCB0ZXN0cyBmb3IgRGVyaXZlZFByb3BlcnR5XHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBwcm9wZXJ0eVN0YXRlSGFuZGxlclNpbmdsZXRvbiBmcm9tICcuL3Byb3BlcnR5U3RhdGVIYW5kbGVyU2luZ2xldG9uLmpzJztcclxuXHJcblFVbml0Lm1vZHVsZSggJ0Rlcml2ZWRQcm9wZXJ0eScgKTtcclxuXHJcblFVbml0LnRlc3QoICdUZXN0IHN0YWxlIHZhbHVlcyBpbiBEZXJpdmVkUHJvcGVydHknLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGFQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMSApO1xyXG4gIGNvbnN0IGJQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMiApO1xyXG4gIGNvbnN0IGNQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgYVByb3BlcnR5LCBiUHJvcGVydHkgXSwgKCAoIGFQcm9wZXJ0eSwgYlByb3BlcnR5ICkgPT4ge3JldHVybiBhUHJvcGVydHkgKyBiUHJvcGVydHk7fSApICk7XHJcbiAgYVByb3BlcnR5LnZhbHVlID0gNztcclxuICBhc3NlcnQuZXF1YWwoIGNQcm9wZXJ0eS52YWx1ZSwgOSApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnVGVzdCBEZXJpdmVkUHJvcGVydHkudW5saW5rJywgYXNzZXJ0ID0+IHtcclxuXHJcbiAgY29uc3Qgd2lkdGhQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMiApO1xyXG4gIGNvbnN0IHN0YXJ0aW5nV2lkdGhMaXN0ZW5lckNvdW50ID0gd2lkdGhQcm9wZXJ0eVsgJ2dldExpc3RlbmVyQ291bnQnIF0oKTtcclxuICBjb25zdCBoZWlnaHRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMyApO1xyXG4gIGNvbnN0IHN0YXJ0aW5nSGVpZ2h0TGlzdGVuZXJDb3VudCA9IGhlaWdodFByb3BlcnR5WyAnZ2V0TGlzdGVuZXJDb3VudCcgXSgpO1xyXG4gIGNvbnN0IGFyZWFQcm9wZXJ0eURlcGVuZGVuY2llczogcmVhZG9ubHkgWyBQcm9wZXJ0eTxudW1iZXI+LCBQcm9wZXJ0eTxudW1iZXI+IF0gPSBbIHdpZHRoUHJvcGVydHksIGhlaWdodFByb3BlcnR5IF0gYXMgY29uc3Q7XHJcbiAgY29uc3QgYXJlYVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggYXJlYVByb3BlcnR5RGVwZW5kZW5jaWVzLFxyXG4gICAgKCAoIHdpZHRoLCBoZWlnaHQgKSA9PiB3aWR0aCAqIGhlaWdodCApICk7XHJcbiAgY29uc3QgbGlzdGVuZXIgPSBmdW5jdGlvbiggYXJlYTogbnVtYmVyICkgeyAvKmNvbnNvbGUubG9nKCAnYXJlYSA9ICcgKyBhcmVhICk7Ki8gfTtcclxuICBhcmVhUHJvcGVydHkubGluayggbGlzdGVuZXIgKTtcclxuXHJcbiAgYXNzZXJ0LmVxdWFsKCB3aWR0aFByb3BlcnR5WyAnZ2V0TGlzdGVuZXJDb3VudCcgXSgpLCAxICsgc3RhcnRpbmdXaWR0aExpc3RlbmVyQ291bnQgKTtcclxuICBhc3NlcnQuZXF1YWwoIGhlaWdodFByb3BlcnR5WyAnZ2V0TGlzdGVuZXJDb3VudCcgXSgpLCAxICsgc3RhcnRpbmdIZWlnaHRMaXN0ZW5lckNvdW50ICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBhcmVhUHJvcGVydHlEZXBlbmRlbmNpZXMubGVuZ3RoLCAyICk7XHJcblxyXG4gIC8vIFVubGluayB0aGUgbGlzdGVuZXJcclxuICBhcmVhUHJvcGVydHkudW5saW5rKCBsaXN0ZW5lciApO1xyXG4gIGFyZWFQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcblxyXG4gIGFzc2VydC5lcXVhbCggd2lkdGhQcm9wZXJ0eVsgJ2dldExpc3RlbmVyQ291bnQnIF0oKSwgc3RhcnRpbmdXaWR0aExpc3RlbmVyQ291bnQgKTtcclxuICBhc3NlcnQuZXF1YWwoIGhlaWdodFByb3BlcnR5WyAnZ2V0TGlzdGVuZXJDb3VudCcgXSgpLCBzdGFydGluZ0hlaWdodExpc3RlbmVyQ291bnQgKTtcclxuXHJcbiAgYXNzZXJ0LmVxdWFsKCBhcmVhUHJvcGVydHlbICdkZXBlbmRlbmNpZXMnIF0sIG51bGwgKTtcclxuXHJcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciwgdHlwZSBvZiBkZXBlbmRlbmN5TGlzdGVuZXJzIGlzIGltcGxpY2l0bHkgYW55IGJlY2F1c2UgRGVyaXZlZFByb3BlcnR5IGNhbiBoYXZlIHVwIHRvIDE2IGRlcGVuZGVuY2llcyBvZiBhbnkgdHlwZVxyXG4gIGFzc2VydC5lcXVhbCggYXJlYVByb3BlcnR5WyAnZGVwZW5kZW5jeUxpc3RlbmVycycgXSwgbnVsbCApO1xyXG4gIGFzc2VydC5lcXVhbCggYXJlYVByb3BlcnR5WyAnZGVwZW5kZW5jaWVzJyBdLCBudWxsICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdEZXJpdmVkUHJvcGVydHkudmFsdWVFcXVhbHMnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGFQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggJ2EnICk7XHJcbiAgY29uc3QgYlByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAnYicgKTtcclxuICBjb25zdCBjUHJvcGVydHkgPSBEZXJpdmVkUHJvcGVydHlbICd2YWx1ZUVxdWFscycgXSggYVByb3BlcnR5LCBiUHJvcGVydHkgKTtcclxuICBhc3NlcnQuZXF1YWwoIGNQcm9wZXJ0eS52YWx1ZSwgZmFsc2UgKTtcclxuICBhUHJvcGVydHkudmFsdWUgPSAnYic7XHJcbiAgYXNzZXJ0LmVxdWFsKCBjUHJvcGVydHkudmFsdWUsIHRydWUgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1Rlc3QgZGVmZXInLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGZpcnN0UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDAgKTtcclxuICBjb25zdCBzZWNvbmRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMiApO1xyXG4gIGNvbnN0IGRlcml2ZWRQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgZmlyc3RQcm9wZXJ0eSwgc2Vjb25kUHJvcGVydHkgXSwgKCBhLCBiICkgPT4gYSArIGIgKTtcclxuICBhc3NlcnQub2soIGRlcml2ZWRQcm9wZXJ0eS52YWx1ZSA9PT0gMiwgJ2Jhc2UgY2FzZSwgbm8gZGVmZXInICk7XHJcblxyXG4gIC8vIHRlc3QgYSBkZXBlbmRlbmN5IGJlaW5nIGRlZmVycmVkXHJcbiAgZmlyc3RQcm9wZXJ0eS5zZXREZWZlcnJlZCggdHJ1ZSApO1xyXG4gIGFzc2VydC5vayggZGVyaXZlZFByb3BlcnR5LnZhbHVlID09PSAyLCAnc2FtZSB2YWx1ZSBldmVuIGFmdGVyIGRlZmVyJyApO1xyXG4gIGZpcnN0UHJvcGVydHkudmFsdWUgPSAyO1xyXG4gIGFzc2VydC5vayggZGVyaXZlZFByb3BlcnR5LnZhbHVlID09PSAyLCAnc2FtZSB2YWx1ZSBldmVuIHdoZW4gc2V0IHRvIG5ldycgKTtcclxuICBjb25zdCB1cGRhdGUgPSBmaXJzdFByb3BlcnR5LnNldERlZmVycmVkKCBmYWxzZSApO1xyXG4gIGFzc2VydC5vayggZmlyc3RQcm9wZXJ0eS52YWx1ZSA9PT0gMiwgJ3Byb3BlcnR5IGhhcyBuZXcgdmFsdWUgbm93JyApO1xyXG4gIGFzc2VydC5vayggZGVyaXZlZFByb3BlcnR5LnZhbHVlID09PSAyLCAnYnV0IHRoZSBkZXJpdmVkUHJvcGVydHkgZG9lc250JyApO1xyXG4gIHVwZGF0ZSAmJiB1cGRhdGUoKTtcclxuICBhc3NlcnQub2soIGRlcml2ZWRQcm9wZXJ0eS52YWx1ZSA9PT0gNCwgJ25vdyBkZXJpdmVkUHJvcGVydHkgd2FzIHVwZGF0ZWQnICk7XHJcblxyXG4gIC8vIHRlc3QgdGhlIERlcml2ZWRQcm9wZXJ0eSBiZWluZyBkZWZlcnJlZFxyXG4gIGRlcml2ZWRQcm9wZXJ0eS5zZXREZWZlcnJlZCggdHJ1ZSApO1xyXG4gIGFzc2VydC5vayggZGVyaXZlZFByb3BlcnR5LnZhbHVlID09PSA0LCAnc3RpbGwgNCcgKTtcclxuICBmaXJzdFByb3BlcnR5LnZhbHVlID0gNDtcclxuICBhc3NlcnQub2soIGRlcml2ZWRQcm9wZXJ0eS52YWx1ZSA9PT0gNCwgJ3N0aWxsIDQgYWZ0ZXIgdXBkYXRlJyApO1xyXG4gIGNvbnN0IHVwZGF0ZUFnYWluID0gZGVyaXZlZFByb3BlcnR5LnNldERlZmVycmVkKCBmYWxzZSApO1xyXG4gIGFzc2VydC5vayggZGVyaXZlZFByb3BlcnR5LnZhbHVlID09PSA2LCAnbm93IGhhcyB0aGUgY29ycmVjdCB2YWx1ZScgKTtcclxuICB1cGRhdGVBZ2FpbiAmJiB1cGRhdGVBZ2FpbigpO1xyXG4gIGFzc2VydC5vayggZGVyaXZlZFByb3BlcnR5LnZhbHVlID09PSA2LCAnbm90aGluZyBjaGFuZ2VkJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnRGVyaXZlZFByb3BlcnR5IGFuZC9vcicsIGFzc2VydCA9PiB7XHJcblxyXG4gIGNvbnN0IGFQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggZmFsc2UgKTtcclxuICBjb25zdCBiUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgY29uc3QgY1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAvLyBjb3JyZWN0IHVzYWdlcyBvZiAnYW5kJyBhbmQgJ29yJ1xyXG4gIGNvbnN0IGFuZFByb3BlcnR5ID0gRGVyaXZlZFByb3BlcnR5LmFuZCggWyBhUHJvcGVydHksIGJQcm9wZXJ0eSwgY1Byb3BlcnR5IF0gKTtcclxuICBjb25zdCBvclByb3BlcnR5ID0gRGVyaXZlZFByb3BlcnR5Lm9yKCBbIGFQcm9wZXJ0eSwgYlByb3BlcnR5LCBjUHJvcGVydHkgXSApO1xyXG5cclxuICBhc3NlcnQuZXF1YWwoIGFuZFByb3BlcnR5LnZhbHVlLCBmYWxzZSApO1xyXG4gIGFzc2VydC5lcXVhbCggb3JQcm9wZXJ0eS52YWx1ZSwgZmFsc2UgKTtcclxuXHJcbiAgYVByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICBhc3NlcnQuZXF1YWwoIGFuZFByb3BlcnR5LnZhbHVlLCBmYWxzZSApO1xyXG4gIGFzc2VydC5lcXVhbCggb3JQcm9wZXJ0eS52YWx1ZSwgdHJ1ZSApO1xyXG5cclxuICBiUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gIGFzc2VydC5lcXVhbCggYW5kUHJvcGVydHkudmFsdWUsIGZhbHNlICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBvclByb3BlcnR5LnZhbHVlLCB0cnVlICk7XHJcblxyXG4gIGNQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgYXNzZXJ0LmVxdWFsKCBhbmRQcm9wZXJ0eS52YWx1ZSwgdHJ1ZSApO1xyXG4gIGFzc2VydC5lcXVhbCggb3JQcm9wZXJ0eS52YWx1ZSwgdHJ1ZSApO1xyXG5cclxuICAvLyBAdHMtZXhwZWN0LWVycm9yIElOVEVOVElPTkFMIGZhaWw6IHNldHRpbmcgYSBkZXBlbmRlbmN5IHRvIGEgbm9uLWJvb2xlYW4gdmFsdWVcclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHsgYVByb3BlcnR5LnZhbHVlID0gMDsgfSxcclxuICAgICdEZXJpdmVkUHJvcGVydHkgZGVwZW5kZW5jeSBtdXN0IGhhdmUgYm9vbGVhbiB2YWx1ZScgKTtcclxufSApO1xyXG5cclxuaWYgKCBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICkge1xyXG4gIFFVbml0LnRlc3QoICdwcm9wZXJ0eVN0YXRlSGFuZGxlclNpbmdsZXRvbiB0ZXN0cyBmb3IgRGVyaXZlZFByb3BlcnR5JywgYXNzZXJ0ID0+IHtcclxuXHJcbiAgICBjb25zdCBwYXJlbnRUYW5kZW0gPSBUYW5kZW0uUk9PVF9URVNUO1xyXG5cclxuICAgIGNvbnN0IG9yaWdpbmFsT3JkZXJEZXBlbmRlbmN5TGVuZ3RoID0gcHJvcGVydHlTdGF0ZUhhbmRsZXJTaW5nbGV0b24uZ2V0TnVtYmVyT2ZPcmRlckRlcGVuZGVuY2llcygpO1xyXG4gICAgY29uc3QgZ2V0T3JkZXJEZXBlbmRlbmN5TGVuZ3RoID0gKCkgPT4gcHJvcGVydHlTdGF0ZUhhbmRsZXJTaW5nbGV0b24uZ2V0TnVtYmVyT2ZPcmRlckRlcGVuZGVuY2llcygpIC0gb3JpZ2luYWxPcmRlckRlcGVuZGVuY3lMZW5ndGg7XHJcblxyXG4gICAgY29uc3QgZmlyc3RQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMSwge1xyXG4gICAgICB0YW5kZW06IHBhcmVudFRhbmRlbS5jcmVhdGVUYW5kZW0oICdmaXJzdFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IE51bWJlcklPXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBzZWNvbmRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMSwge1xyXG4gICAgICB0YW5kZW06IHBhcmVudFRhbmRlbS5jcmVhdGVUYW5kZW0oICdzZWNvbmRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdW1iZXJJT1xyXG4gICAgfSApO1xyXG4gICAgY29uc3QgdGhpcmRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMSwge1xyXG4gICAgICB0YW5kZW06IHBhcmVudFRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aGlyZFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IE51bWJlcklPXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgZGVyaXZlZFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBmaXJzdFByb3BlcnR5LCBzZWNvbmRQcm9wZXJ0eSwgdGhpcmRQcm9wZXJ0eSBdLCAoKSA9PiAzLCB7XHJcbiAgICAgIHRhbmRlbTogcGFyZW50VGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Rlcml2ZWRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdW1iZXJJT1xyXG4gICAgfSApO1xyXG4gICAgYXNzZXJ0Lm9rKCBnZXRPcmRlckRlcGVuZGVuY3lMZW5ndGgoKSA9PT0gMywgJ2Rlcml2ZWRQcm9wZXJ0eSBhZGRzIG9yZGVyIGRlcGVuZGVuY3kgZm9yIGVhY2ggZGVwZW5kZW5jeScgKTtcclxuXHJcbiAgICBmaXJzdFByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIGFzc2VydC5vayggZ2V0T3JkZXJEZXBlbmRlbmN5TGVuZ3RoKCkgPT09IDIsICdkZXBlbmRlbmN5IGRpc3Bvc2Ugb25seSByZW1vdmVzIHdoYXQgaXQgZWZmZWN0cycgKTtcclxuICAgIGRlcml2ZWRQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICBhc3NlcnQub2soIGdldE9yZGVyRGVwZW5kZW5jeUxlbmd0aCgpID09PSAwLCAnbm8gb3JkZXJEZXBlbmRlbmNpZXMgYWZ0ZXIgZGVyaXZlZFByb3BlcnR5IGRpc3Bvc2UnICk7XHJcblxyXG4gICAgc2Vjb25kUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcmRQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgfSApO1xyXG59Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE1BQU0sTUFBTSwyQkFBMkI7QUFDOUMsT0FBT0MsUUFBUSxNQUFNLG1DQUFtQztBQUN4RCxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBQ2xELE9BQU9DLFFBQVEsTUFBTSxlQUFlO0FBQ3BDLE9BQU9DLDZCQUE2QixNQUFNLG9DQUFvQztBQUU5RUMsS0FBSyxDQUFDQyxNQUFNLENBQUUsaUJBQWtCLENBQUM7QUFFakNELEtBQUssQ0FBQ0UsSUFBSSxDQUFFLHNDQUFzQyxFQUFFQyxNQUFNLElBQUk7RUFDNUQsTUFBTUMsU0FBUyxHQUFHLElBQUlOLFFBQVEsQ0FBRSxDQUFFLENBQUM7RUFDbkMsTUFBTU8sU0FBUyxHQUFHLElBQUlQLFFBQVEs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