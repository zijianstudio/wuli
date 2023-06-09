// Copyright 2013-2022, University of Colorado Boulder

/**
 * Miscellaneous tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

QUnit.module('Miscellaneous');
const includeBleedingEdgeCanvasTests = false;
QUnit.test('ES5 Object.defineProperty get/set', assert => {
  const ob = {
    _key: 5
  };
  Object.defineProperty(ob, 'key', {
    enumerable: true,
    configurable: true,
    get: function () {
      return this._key;
    },
    set: function (val) {
      this._key = val;
    }
  });
  ob.key += 1;
  assert.equal(ob._key, 6, 'incremented object value');
});

// QUnit.test( 'Canvas WebGL Context and Features', function(assert) {
//   var canvas = document.createElement( 'canvas' );
//   var context = canvas.getContext( "webgl" ) || canvas.getContext( "experimental-webgl" );
//   assert.ok( context, 'context' );
// } );

if (includeBleedingEdgeCanvasTests) {
  // v5 canvas additions
  QUnit.module('Bleeding Edge Canvas Support');
  QUnit.test('Canvas 2D v5 Features', assert => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const neededMethods = ['addHitRegion', 'ellipse', 'resetClip', 'resetTransform'];
    _.each(neededMethods, method => {
      assert.ok(context[method] !== undefined, `context.${method}`);
    });
  });
  QUnit.test('Path object support', assert => {
    new Path(null); // eslint-disable-line no-new, no-undef
  });

  QUnit.test('Text width measurement in canvas', assert => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const metrics = context.measureText('Hello World');
    _.each(['actualBoundingBoxLeft', 'actualBoundingBoxRight', 'actualBoundingBoxAscent', 'actualBoundingBoxDescent'], method => {
      assert.ok(metrics[method] !== undefined, `metrics.${method}`);
    });
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJRVW5pdCIsIm1vZHVsZSIsImluY2x1ZGVCbGVlZGluZ0VkZ2VDYW52YXNUZXN0cyIsInRlc3QiLCJhc3NlcnQiLCJvYiIsIl9rZXkiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImVudW1lcmFibGUiLCJjb25maWd1cmFibGUiLCJnZXQiLCJzZXQiLCJ2YWwiLCJrZXkiLCJlcXVhbCIsImNhbnZhcyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImNvbnRleHQiLCJnZXRDb250ZXh0IiwibmVlZGVkTWV0aG9kcyIsIl8iLCJlYWNoIiwibWV0aG9kIiwib2siLCJ1bmRlZmluZWQiLCJQYXRoIiwibWV0cmljcyIsIm1lYXN1cmVUZXh0Il0sInNvdXJjZXMiOlsiTWlzY2VsbGFuZW91c1Rlc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1pc2NlbGxhbmVvdXMgdGVzdHNcclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5RVW5pdC5tb2R1bGUoICdNaXNjZWxsYW5lb3VzJyApO1xyXG5cclxuY29uc3QgaW5jbHVkZUJsZWVkaW5nRWRnZUNhbnZhc1Rlc3RzID0gZmFsc2U7XHJcblxyXG5RVW5pdC50ZXN0KCAnRVM1IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBnZXQvc2V0JywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBvYiA9IHsgX2tleTogNSB9O1xyXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggb2IsICdrZXknLCB7XHJcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2tleTsgfSxcclxuICAgIHNldDogZnVuY3Rpb24oIHZhbCApIHsgdGhpcy5fa2V5ID0gdmFsOyB9XHJcbiAgfSApO1xyXG4gIG9iLmtleSArPSAxO1xyXG4gIGFzc2VydC5lcXVhbCggb2IuX2tleSwgNiwgJ2luY3JlbWVudGVkIG9iamVjdCB2YWx1ZScgKTtcclxufSApO1xyXG5cclxuLy8gUVVuaXQudGVzdCggJ0NhbnZhcyBXZWJHTCBDb250ZXh0IGFuZCBGZWF0dXJlcycsIGZ1bmN0aW9uKGFzc2VydCkge1xyXG4vLyAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4vLyAgIHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoIFwid2ViZ2xcIiApIHx8IGNhbnZhcy5nZXRDb250ZXh0KCBcImV4cGVyaW1lbnRhbC13ZWJnbFwiICk7XHJcbi8vICAgYXNzZXJ0Lm9rKCBjb250ZXh0LCAnY29udGV4dCcgKTtcclxuLy8gfSApO1xyXG5cclxuaWYgKCBpbmNsdWRlQmxlZWRpbmdFZGdlQ2FudmFzVGVzdHMgKSB7XHJcbiAgLy8gdjUgY2FudmFzIGFkZGl0aW9uc1xyXG4gIFFVbml0Lm1vZHVsZSggJ0JsZWVkaW5nIEVkZ2UgQ2FudmFzIFN1cHBvcnQnICk7XHJcblxyXG4gIFFVbml0LnRlc3QoICdDYW52YXMgMkQgdjUgRmVhdHVyZXMnLCBhc3NlcnQgPT4ge1xyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApO1xyXG5cclxuICAgIGNvbnN0IG5lZWRlZE1ldGhvZHMgPSBbXHJcbiAgICAgICdhZGRIaXRSZWdpb24nLFxyXG4gICAgICAnZWxsaXBzZScsXHJcbiAgICAgICdyZXNldENsaXAnLFxyXG4gICAgICAncmVzZXRUcmFuc2Zvcm0nXHJcbiAgICBdO1xyXG4gICAgXy5lYWNoKCBuZWVkZWRNZXRob2RzLCBtZXRob2QgPT4ge1xyXG4gICAgICBhc3NlcnQub2soIGNvbnRleHRbIG1ldGhvZCBdICE9PSB1bmRlZmluZWQsIGBjb250ZXh0LiR7bWV0aG9kfWAgKTtcclxuICAgIH0gKTtcclxuICB9ICk7XHJcblxyXG4gIFFVbml0LnRlc3QoICdQYXRoIG9iamVjdCBzdXBwb3J0JywgYXNzZXJ0ID0+IHtcclxuICAgIG5ldyBQYXRoKCBudWxsICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbmV3LCBuby11bmRlZlxyXG4gIH0gKTtcclxuXHJcbiAgUVVuaXQudGVzdCggJ1RleHQgd2lkdGggbWVhc3VyZW1lbnQgaW4gY2FudmFzJywgYXNzZXJ0ID0+IHtcclxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XHJcbiAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcclxuICAgIGNvbnN0IG1ldHJpY3MgPSBjb250ZXh0Lm1lYXN1cmVUZXh0KCAnSGVsbG8gV29ybGQnICk7XHJcbiAgICBfLmVhY2goIFsgJ2FjdHVhbEJvdW5kaW5nQm94TGVmdCcsICdhY3R1YWxCb3VuZGluZ0JveFJpZ2h0JywgJ2FjdHVhbEJvdW5kaW5nQm94QXNjZW50JywgJ2FjdHVhbEJvdW5kaW5nQm94RGVzY2VudCcgXSwgbWV0aG9kID0+IHtcclxuICAgICAgYXNzZXJ0Lm9rKCBtZXRyaWNzWyBtZXRob2QgXSAhPT0gdW5kZWZpbmVkLCBgbWV0cmljcy4ke21ldGhvZH1gICk7XHJcbiAgICB9ICk7XHJcbiAgfSApO1xyXG59Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBQSxLQUFLLENBQUNDLE1BQU0sQ0FBRSxlQUFnQixDQUFDO0FBRS9CLE1BQU1DLDhCQUE4QixHQUFHLEtBQUs7QUFFNUNGLEtBQUssQ0FBQ0csSUFBSSxDQUFFLG1DQUFtQyxFQUFFQyxNQUFNLElBQUk7RUFDekQsTUFBTUMsRUFBRSxHQUFHO0lBQUVDLElBQUksRUFBRTtFQUFFLENBQUM7RUFDdEJDLE1BQU0sQ0FBQ0MsY0FBYyxDQUFFSCxFQUFFLEVBQUUsS0FBSyxFQUFFO0lBQ2hDSSxVQUFVLEVBQUUsSUFBSTtJQUNoQkMsWUFBWSxFQUFFLElBQUk7SUFDbEJDLEdBQUcsRUFBRSxTQUFBQSxDQUFBLEVBQVc7TUFBRSxPQUFPLElBQUksQ0FBQ0wsSUFBSTtJQUFFLENBQUM7SUFDckNNLEdBQUcsRUFBRSxTQUFBQSxDQUFVQyxHQUFHLEVBQUc7TUFBRSxJQUFJLENBQUNQLElBQUksR0FBR08sR0FBRztJQUFFO0VBQzFDLENBQUUsQ0FBQztFQUNIUixFQUFFLENBQUNTLEdBQUcsSUFBSSxDQUFDO0VBQ1hWLE1BQU0sQ0FBQ1csS0FBSyxDQUFFVixFQUFFLENBQUNDLElBQUksRUFBRSxDQUFDLEVBQUUsMEJBQTJCLENBQUM7QUFDeEQsQ0FBRSxDQUFDOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsSUFBS0osOEJBQThCLEVBQUc7RUFDcEM7RUFDQUYsS0FBSyxDQUFDQyxNQUFNLENBQUUsOEJBQStCLENBQUM7RUFFOUNELEtBQUssQ0FBQ0csSUFBSSxDQUFFLHVCQUF1QixFQUFFQyxNQUFNLElBQUk7SUFDN0MsTUFBTVksTUFBTSxHQUFHQyxRQUFRLENBQUNDLGFBQWEsQ0FBRSxRQUFTLENBQUM7SUFDakQsTUFBTUMsT0FBTyxHQUFHSCxNQUFNLENBQUNJLFVBQVUsQ0FBRSxJQUFLLENBQUM7SUFFekMsTUFBTUMsYUFBYSxHQUFHLENBQ3BCLGNBQWMsRUFDZCxTQUFTLEVBQ1QsV0FBVyxFQUNYLGdCQUFnQixDQUNqQjtJQUNEQyxDQUFDLENBQUNDLElBQUksQ0FBRUYsYUFBYSxFQUFFRyxNQUFNLElBQUk7TUFDL0JwQixNQUFNLENBQUNxQixFQUFFLENBQUVOLE9BQU8sQ0FBRUssTUFBTSxDQUFFLEtBQUtFLFNBQVMsRUFBRyxXQUFVRixNQUFPLEVBQUUsQ0FBQztJQUNuRSxDQUFFLENBQUM7RUFDTCxDQUFFLENBQUM7RUFFSHhCLEtBQUssQ0FBQ0csSUFBSSxDQUFFLHFCQUFxQixFQUFFQyxNQUFNLElBQUk7SUFDM0MsSUFBSXVCLElBQUksQ0FBRSxJQUFLLENBQUMsQ0FBQyxDQUFDO0VBQ3BCLENBQUUsQ0FBQzs7RUFFSDNCLEtBQUssQ0FBQ0csSUFBSSxDQUFFLGtDQUFrQyxFQUFFQyxNQUFNLElBQUk7SUFDeEQsTUFBTVksTUFBTSxHQUFHQyxRQUFRLENBQUNDLGFBQWEsQ0FBRSxRQUFTLENBQUM7SUFDakQsTUFBTUMsT0FBTyxHQUFHSCxNQUFNLENBQUNJLFVBQVUsQ0FBRSxJQUFLLENBQUM7SUFDekMsTUFBTVEsT0FBTyxHQUFHVCxPQUFPLENBQUNVLFdBQVcsQ0FBRSxhQUFjLENBQUM7SUFDcERQLENBQUMsQ0FBQ0MsSUFBSSxDQUFFLENBQUUsdUJBQXVCLEVBQUUsd0JBQXdCLEVBQUUseUJBQXlCLEVBQUUsMEJBQTBCLENBQUUsRUFBRUMsTUFBTSxJQUFJO01BQzlIcEIsTUFBTSxDQUFDcUIsRUFBRSxDQUFFRyxPQUFPLENBQUVKLE1BQU0sQ0FBRSxLQUFLRSxTQUFTLEVBQUcsV0FBVUYsTUFBTyxFQUFFLENBQUM7SUFDbkUsQ0FBRSxDQUFDO0VBQ0wsQ0FBRSxDQUFDO0FBQ0wifQ==