// Copyright 2021-2022, University of Colorado Boulder

/**
 * QUnit tests for EnabledComponent
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from './BooleanProperty.js';
import EnabledComponent from './EnabledComponent.js';
import Property from './Property.js';
QUnit.module('EnabledComponent');
QUnit.test('EnabledComponent into Object', assert => {
  class EnabledObject extends EnabledComponent {
    constructor(options) {
      super(options);
    }
  }
  const object = new EnabledObject();
  testEnabledComponent(assert, object, 'default enabledProperty created');
  object['disposeEnabledComponent']();
  assert.ok(object.enabledProperty.isDisposed, 'enabledProperty should be disposed because it was not passed in');
  const myEnabledProperty = new BooleanProperty(false);
  const passedInEnabledPropertyObject = new EnabledObject({
    enabledProperty: myEnabledProperty
  });
  testEnabledComponent(assert, object, 'passed in enabledProperty');
  assert.ok(myEnabledProperty === passedInEnabledPropertyObject.enabledProperty, 'passed in should be the same');
  passedInEnabledPropertyObject['disposeEnabledComponent']();
  assert.ok(!myEnabledProperty.isDisposed, 'do not dispose my enabledProperty!');
});

/**
 * Test basic functionality for an object that uses EnabledComponent
 * assert - from QUnit
 * enabledObject - subtype of EnabledComponent
 * message - to tack onto assert messages
 */
function testEnabledComponent(assert, enabledObject, message) {
  assert.ok(enabledObject.enabledProperty instanceof Property, `${message}: enabledProperty should exist`);
  assert.ok(enabledObject.enabledProperty.value === enabledObject.enabled, `${message}: test getter`);
  enabledObject.enabled = false;
  assert.ok(!enabledObject.enabled, `${message}: test setter`);
  assert.ok(enabledObject.enabledProperty.value === enabledObject.enabled, `${message}: test getter after setting`);
  assert.ok(!enabledObject.enabledProperty.value, `${message}: test getter after setting`);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbmFibGVkQ29tcG9uZW50IiwiUHJvcGVydHkiLCJRVW5pdCIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJFbmFibGVkT2JqZWN0IiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwib2JqZWN0IiwidGVzdEVuYWJsZWRDb21wb25lbnQiLCJvayIsImVuYWJsZWRQcm9wZXJ0eSIsImlzRGlzcG9zZWQiLCJteUVuYWJsZWRQcm9wZXJ0eSIsInBhc3NlZEluRW5hYmxlZFByb3BlcnR5T2JqZWN0IiwiZW5hYmxlZE9iamVjdCIsIm1lc3NhZ2UiLCJ2YWx1ZSIsImVuYWJsZWQiXSwic291cmNlcyI6WyJFbmFibGVkQ29tcG9uZW50VGVzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUVVuaXQgdGVzdHMgZm9yIEVuYWJsZWRDb21wb25lbnRcclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW5hYmxlZENvbXBvbmVudCwgeyBFbmFibGVkQ29tcG9uZW50T3B0aW9ucyB9IGZyb20gJy4vRW5hYmxlZENvbXBvbmVudC5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuL1Byb3BlcnR5LmpzJztcclxuXHJcblFVbml0Lm1vZHVsZSggJ0VuYWJsZWRDb21wb25lbnQnICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnRW5hYmxlZENvbXBvbmVudCBpbnRvIE9iamVjdCcsIGFzc2VydCA9PiB7XHJcblxyXG4gIGNsYXNzIEVuYWJsZWRPYmplY3QgZXh0ZW5kcyBFbmFibGVkQ29tcG9uZW50IHtcclxuICAgIHB1YmxpYyBjb25zdHJ1Y3Rvciggb3B0aW9ucz86IEVuYWJsZWRDb21wb25lbnRPcHRpb25zICkge1xyXG4gICAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3Qgb2JqZWN0ID0gbmV3IEVuYWJsZWRPYmplY3QoKTtcclxuICB0ZXN0RW5hYmxlZENvbXBvbmVudCggYXNzZXJ0LCBvYmplY3QsICdkZWZhdWx0IGVuYWJsZWRQcm9wZXJ0eSBjcmVhdGVkJyApO1xyXG5cclxuICBvYmplY3RbICdkaXNwb3NlRW5hYmxlZENvbXBvbmVudCcgXSgpO1xyXG4gIGFzc2VydC5vayggb2JqZWN0LmVuYWJsZWRQcm9wZXJ0eS5pc0Rpc3Bvc2VkLCAnZW5hYmxlZFByb3BlcnR5IHNob3VsZCBiZSBkaXNwb3NlZCBiZWNhdXNlIGl0IHdhcyBub3QgcGFzc2VkIGluJyApO1xyXG5cclxuICBjb25zdCBteUVuYWJsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgY29uc3QgcGFzc2VkSW5FbmFibGVkUHJvcGVydHlPYmplY3QgPSBuZXcgRW5hYmxlZE9iamVjdCgge1xyXG4gICAgZW5hYmxlZFByb3BlcnR5OiBteUVuYWJsZWRQcm9wZXJ0eVxyXG4gIH0gKTtcclxuICB0ZXN0RW5hYmxlZENvbXBvbmVudCggYXNzZXJ0LCBvYmplY3QsICdwYXNzZWQgaW4gZW5hYmxlZFByb3BlcnR5JyApO1xyXG4gIGFzc2VydC5vayggbXlFbmFibGVkUHJvcGVydHkgPT09IHBhc3NlZEluRW5hYmxlZFByb3BlcnR5T2JqZWN0LmVuYWJsZWRQcm9wZXJ0eSwgJ3Bhc3NlZCBpbiBzaG91bGQgYmUgdGhlIHNhbWUnICk7XHJcbiAgcGFzc2VkSW5FbmFibGVkUHJvcGVydHlPYmplY3RbICdkaXNwb3NlRW5hYmxlZENvbXBvbmVudCcgXSgpO1xyXG4gIGFzc2VydC5vayggIW15RW5hYmxlZFByb3BlcnR5LmlzRGlzcG9zZWQsICdkbyBub3QgZGlzcG9zZSBteSBlbmFibGVkUHJvcGVydHkhJyApO1xyXG59ICk7XHJcblxyXG4vKipcclxuICogVGVzdCBiYXNpYyBmdW5jdGlvbmFsaXR5IGZvciBhbiBvYmplY3QgdGhhdCB1c2VzIEVuYWJsZWRDb21wb25lbnRcclxuICogYXNzZXJ0IC0gZnJvbSBRVW5pdFxyXG4gKiBlbmFibGVkT2JqZWN0IC0gc3VidHlwZSBvZiBFbmFibGVkQ29tcG9uZW50XHJcbiAqIG1lc3NhZ2UgLSB0byB0YWNrIG9udG8gYXNzZXJ0IG1lc3NhZ2VzXHJcbiAqL1xyXG5mdW5jdGlvbiB0ZXN0RW5hYmxlZENvbXBvbmVudCggYXNzZXJ0OiBBc3NlcnQsIGVuYWJsZWRPYmplY3Q6IEVuYWJsZWRDb21wb25lbnQsIG1lc3NhZ2U6IHN0cmluZyApOiB2b2lkIHtcclxuICBhc3NlcnQub2soIGVuYWJsZWRPYmplY3QuZW5hYmxlZFByb3BlcnR5IGluc3RhbmNlb2YgUHJvcGVydHksIGAke21lc3NhZ2V9OiBlbmFibGVkUHJvcGVydHkgc2hvdWxkIGV4aXN0YCApO1xyXG4gIGFzc2VydC5vayggZW5hYmxlZE9iamVjdC5lbmFibGVkUHJvcGVydHkudmFsdWUgPT09IGVuYWJsZWRPYmplY3QuZW5hYmxlZCwgYCR7bWVzc2FnZX06IHRlc3QgZ2V0dGVyYCApO1xyXG5cclxuICBlbmFibGVkT2JqZWN0LmVuYWJsZWQgPSBmYWxzZTtcclxuICBhc3NlcnQub2soICFlbmFibGVkT2JqZWN0LmVuYWJsZWQsIGAke21lc3NhZ2V9OiB0ZXN0IHNldHRlcmAgKTtcclxuICBhc3NlcnQub2soIGVuYWJsZWRPYmplY3QuZW5hYmxlZFByb3BlcnR5LnZhbHVlID09PSBlbmFibGVkT2JqZWN0LmVuYWJsZWQsIGAke21lc3NhZ2V9OiB0ZXN0IGdldHRlciBhZnRlciBzZXR0aW5nYCApO1xyXG4gIGFzc2VydC5vayggIWVuYWJsZWRPYmplY3QuZW5hYmxlZFByb3BlcnR5LnZhbHVlLCBgJHttZXNzYWdlfTogdGVzdCBnZXR0ZXIgYWZ0ZXIgc2V0dGluZ2AgKTtc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