// Copyright 2018-2021, University of Colorado Boulder

/**
 * DragListener tests
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../axon/js/Property.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Transform3 from '../../../dot/js/Transform3.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import Tandem from '../../../tandem/js/Tandem.js';
import DragListener from './DragListener.js';
import ListenerTestUtils from './ListenerTestUtils.js';
QUnit.module('DragListener');
QUnit.test('translateNode', assert => {
  ListenerTestUtils.simpleRectangleTest((display, rect, node) => {
    const listener = new DragListener({
      tandem: Tandem.ROOT_TEST.createTandem('myListener'),
      translateNode: true
    });
    rect.addInputListener(listener);
    ListenerTestUtils.mouseMove(display, 10, 10);
    ListenerTestUtils.mouseDown(display, 10, 10);
    ListenerTestUtils.mouseMove(display, 20, 15);
    ListenerTestUtils.mouseUp(display, 20, 15);
    assert.equal(rect.x, 10, 'Drag with translateNode should have changed the x translation');
    assert.equal(rect.y, 5, 'Drag with translateNode should have changed the y translation');
    listener.dispose();
  });
});
QUnit.test('translateNode with applyOffset:false', assert => {
  ListenerTestUtils.simpleRectangleTest((display, rect, node) => {
    const listener = new DragListener({
      tandem: Tandem.ROOT_TEST.createTandem('myListener'),
      translateNode: true,
      applyOffset: false
    });
    rect.addInputListener(listener);
    ListenerTestUtils.mouseMove(display, 10, 10);
    ListenerTestUtils.mouseDown(display, 10, 10);
    ListenerTestUtils.mouseMove(display, 20, 15);
    ListenerTestUtils.mouseUp(display, 20, 15);
    assert.equal(rect.x, 20, 'Drag should place the rect with its origin at the last mouse position (x)');
    assert.equal(rect.y, 15, 'Drag should place the rect with its origin at the last mouse position (y)');
    listener.dispose();
  });
});
QUnit.test('translateNode with trackAncestors', assert => {
  ListenerTestUtils.simpleRectangleTest((display, rect, node) => {
    const listener = new DragListener({
      tandem: Tandem.ROOT_TEST.createTandem('myListener'),
      translateNode: true,
      trackAncestors: true
    });
    rect.addInputListener(listener);
    ListenerTestUtils.mouseMove(display, 10, 10);
    ListenerTestUtils.mouseDown(display, 10, 10);
    node.x = 5;
    ListenerTestUtils.mouseMove(display, 20, 15);
    ListenerTestUtils.mouseUp(display, 20, 15);
    assert.equal(rect.x, 5, 'The x shift of 10 on the base node will have wiped out half of the drag change');
    assert.equal(rect.y, 5, 'No y movement occurred of the base node');
    listener.dispose();
  });
});
QUnit.test('positionProperty with hooks', assert => {
  ListenerTestUtils.simpleRectangleTest((display, rect, node) => {
    const positionProperty = new Vector2Property(Vector2.ZERO);
    positionProperty.linkAttribute(rect, 'translation');
    const listener = new DragListener({
      tandem: Tandem.ROOT_TEST.createTandem('myListener'),
      positionProperty: positionProperty
    });
    rect.addInputListener(listener);
    ListenerTestUtils.mouseMove(display, 10, 10);
    ListenerTestUtils.mouseDown(display, 10, 10);
    ListenerTestUtils.mouseMove(display, 20, 15);
    ListenerTestUtils.mouseUp(display, 20, 15);
    assert.equal(positionProperty.value.x, 10, 'Drag with translateNode should have changed the x translation');
    assert.equal(positionProperty.value.y, 5, 'Drag with translateNode should have changed the y translation');
    listener.dispose();
  });
});
QUnit.test('positionProperty with hooks and transform', assert => {
  ListenerTestUtils.simpleRectangleTest((display, rect, node) => {
    const positionProperty = new Vector2Property(Vector2.ZERO);
    const transform = new Transform3(Matrix3.translation(5, 3).timesMatrix(Matrix3.scale(2)).timesMatrix(Matrix3.rotation2(Math.PI / 4)));

    // Starts at 5,3
    positionProperty.link(position => {
      rect.translation = transform.transformPosition2(position);
    });
    const listener = new DragListener({
      tandem: Tandem.ROOT_TEST.createTandem('myListener'),
      positionProperty: positionProperty,
      transform: transform
    });
    rect.addInputListener(listener);
    ListenerTestUtils.mouseMove(display, 10, 10);
    ListenerTestUtils.mouseDown(display, 10, 10);
    ListenerTestUtils.mouseMove(display, 20, 15);
    ListenerTestUtils.mouseUp(display, 20, 15);
    assert.equal(Utils.roundSymmetric(rect.x), 15, '[x] Started at 5, moved by 10');
    assert.equal(Utils.roundSymmetric(rect.y), 8, '[y] Started at 3, moved by 5');
    listener.dispose();
  });
});
QUnit.test('positionProperty with dragBounds', assert => {
  ListenerTestUtils.simpleRectangleTest((display, rect, node) => {
    const positionProperty = new Vector2Property(Vector2.ZERO);
    positionProperty.link(position => {
      rect.translation = position;
    });
    const listener = new DragListener({
      tandem: Tandem.ROOT_TEST.createTandem('myListener'),
      positionProperty: positionProperty,
      dragBoundsProperty: new Property(new Bounds2(0, 0, 5, 5))
    });
    rect.addInputListener(listener);
    ListenerTestUtils.mouseMove(display, 10, 10);
    ListenerTestUtils.mouseDown(display, 10, 10);
    ListenerTestUtils.mouseMove(display, 50, 30);
    ListenerTestUtils.mouseUp(display, 50, 30);
    assert.equal(positionProperty.value.x, 5, '[x] Should be limited to 5 by dragBounds');
    assert.equal(positionProperty.value.y, 5, '[y] Should be limited to 5 by dragBounds  ');
    listener.dispose();
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkJvdW5kczIiLCJNYXRyaXgzIiwiVHJhbnNmb3JtMyIsIlV0aWxzIiwiVmVjdG9yMiIsIlZlY3RvcjJQcm9wZXJ0eSIsIlRhbmRlbSIsIkRyYWdMaXN0ZW5lciIsIkxpc3RlbmVyVGVzdFV0aWxzIiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0Iiwic2ltcGxlUmVjdGFuZ2xlVGVzdCIsImRpc3BsYXkiLCJyZWN0Iiwibm9kZSIsImxpc3RlbmVyIiwidGFuZGVtIiwiUk9PVF9URVNUIiwiY3JlYXRlVGFuZGVtIiwidHJhbnNsYXRlTm9kZSIsImFkZElucHV0TGlzdGVuZXIiLCJtb3VzZU1vdmUiLCJtb3VzZURvd24iLCJtb3VzZVVwIiwiZXF1YWwiLCJ4IiwieSIsImRpc3Bvc2UiLCJhcHBseU9mZnNldCIsInRyYWNrQW5jZXN0b3JzIiwicG9zaXRpb25Qcm9wZXJ0eSIsIlpFUk8iLCJsaW5rQXR0cmlidXRlIiwidmFsdWUiLCJ0cmFuc2Zvcm0iLCJ0cmFuc2xhdGlvbiIsInRpbWVzTWF0cml4Iiwic2NhbGUiLCJyb3RhdGlvbjIiLCJNYXRoIiwiUEkiLCJsaW5rIiwicG9zaXRpb24iLCJ0cmFuc2Zvcm1Qb3NpdGlvbjIiLCJyb3VuZFN5bW1ldHJpYyIsImRyYWdCb3VuZHNQcm9wZXJ0eSJdLCJzb3VyY2VzIjpbIkRyYWdMaXN0ZW5lclRlc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERyYWdMaXN0ZW5lciB0ZXN0c1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IFRyYW5zZm9ybTMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1RyYW5zZm9ybTMuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgRHJhZ0xpc3RlbmVyIGZyb20gJy4vRHJhZ0xpc3RlbmVyLmpzJztcclxuaW1wb3J0IExpc3RlbmVyVGVzdFV0aWxzIGZyb20gJy4vTGlzdGVuZXJUZXN0VXRpbHMuanMnO1xyXG5cclxuUVVuaXQubW9kdWxlKCAnRHJhZ0xpc3RlbmVyJyApO1xyXG5cclxuUVVuaXQudGVzdCggJ3RyYW5zbGF0ZU5vZGUnLCBhc3NlcnQgPT4ge1xyXG4gIExpc3RlbmVyVGVzdFV0aWxzLnNpbXBsZVJlY3RhbmdsZVRlc3QoICggZGlzcGxheSwgcmVjdCwgbm9kZSApID0+IHtcclxuICAgIGNvbnN0IGxpc3RlbmVyID0gbmV3IERyYWdMaXN0ZW5lcigge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCAnbXlMaXN0ZW5lcicgKSxcclxuICAgICAgdHJhbnNsYXRlTm9kZTogdHJ1ZVxyXG4gICAgfSApO1xyXG4gICAgcmVjdC5hZGRJbnB1dExpc3RlbmVyKCBsaXN0ZW5lciApO1xyXG5cclxuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlTW92ZSggZGlzcGxheSwgMTAsIDEwICk7XHJcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZURvd24oIGRpc3BsYXksIDEwLCAxMCApO1xyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VNb3ZlKCBkaXNwbGF5LCAyMCwgMTUgKTtcclxuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlVXAoIGRpc3BsYXksIDIwLCAxNSApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCByZWN0LngsIDEwLCAnRHJhZyB3aXRoIHRyYW5zbGF0ZU5vZGUgc2hvdWxkIGhhdmUgY2hhbmdlZCB0aGUgeCB0cmFuc2xhdGlvbicgKTtcclxuICAgIGFzc2VydC5lcXVhbCggcmVjdC55LCA1LCAnRHJhZyB3aXRoIHRyYW5zbGF0ZU5vZGUgc2hvdWxkIGhhdmUgY2hhbmdlZCB0aGUgeSB0cmFuc2xhdGlvbicgKTtcclxuICAgIGxpc3RlbmVyLmRpc3Bvc2UoKTtcclxuICB9ICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICd0cmFuc2xhdGVOb2RlIHdpdGggYXBwbHlPZmZzZXQ6ZmFsc2UnLCBhc3NlcnQgPT4ge1xyXG4gIExpc3RlbmVyVGVzdFV0aWxzLnNpbXBsZVJlY3RhbmdsZVRlc3QoICggZGlzcGxheSwgcmVjdCwgbm9kZSApID0+IHtcclxuICAgIGNvbnN0IGxpc3RlbmVyID0gbmV3IERyYWdMaXN0ZW5lcigge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCAnbXlMaXN0ZW5lcicgKSxcclxuICAgICAgdHJhbnNsYXRlTm9kZTogdHJ1ZSxcclxuICAgICAgYXBwbHlPZmZzZXQ6IGZhbHNlXHJcbiAgICB9ICk7XHJcbiAgICByZWN0LmFkZElucHV0TGlzdGVuZXIoIGxpc3RlbmVyICk7XHJcblxyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VNb3ZlKCBkaXNwbGF5LCAxMCwgMTAgKTtcclxuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlRG93biggZGlzcGxheSwgMTAsIDEwICk7XHJcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZU1vdmUoIGRpc3BsYXksIDIwLCAxNSApO1xyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VVcCggZGlzcGxheSwgMjAsIDE1ICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIHJlY3QueCwgMjAsICdEcmFnIHNob3VsZCBwbGFjZSB0aGUgcmVjdCB3aXRoIGl0cyBvcmlnaW4gYXQgdGhlIGxhc3QgbW91c2UgcG9zaXRpb24gKHgpJyApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCByZWN0LnksIDE1LCAnRHJhZyBzaG91bGQgcGxhY2UgdGhlIHJlY3Qgd2l0aCBpdHMgb3JpZ2luIGF0IHRoZSBsYXN0IG1vdXNlIHBvc2l0aW9uICh5KScgKTtcclxuICAgIGxpc3RlbmVyLmRpc3Bvc2UoKTtcclxuICB9ICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICd0cmFuc2xhdGVOb2RlIHdpdGggdHJhY2tBbmNlc3RvcnMnLCBhc3NlcnQgPT4ge1xyXG4gIExpc3RlbmVyVGVzdFV0aWxzLnNpbXBsZVJlY3RhbmdsZVRlc3QoICggZGlzcGxheSwgcmVjdCwgbm9kZSApID0+IHtcclxuICAgIGNvbnN0IGxpc3RlbmVyID0gbmV3IERyYWdMaXN0ZW5lcigge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCAnbXlMaXN0ZW5lcicgKSxcclxuICAgICAgdHJhbnNsYXRlTm9kZTogdHJ1ZSxcclxuICAgICAgdHJhY2tBbmNlc3RvcnM6IHRydWVcclxuICAgIH0gKTtcclxuICAgIHJlY3QuYWRkSW5wdXRMaXN0ZW5lciggbGlzdGVuZXIgKTtcclxuXHJcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZU1vdmUoIGRpc3BsYXksIDEwLCAxMCApO1xyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VEb3duKCBkaXNwbGF5LCAxMCwgMTAgKTtcclxuICAgIG5vZGUueCA9IDU7XHJcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZU1vdmUoIGRpc3BsYXksIDIwLCAxNSApO1xyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VVcCggZGlzcGxheSwgMjAsIDE1ICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIHJlY3QueCwgNSwgJ1RoZSB4IHNoaWZ0IG9mIDEwIG9uIHRoZSBiYXNlIG5vZGUgd2lsbCBoYXZlIHdpcGVkIG91dCBoYWxmIG9mIHRoZSBkcmFnIGNoYW5nZScgKTtcclxuICAgIGFzc2VydC5lcXVhbCggcmVjdC55LCA1LCAnTm8geSBtb3ZlbWVudCBvY2N1cnJlZCBvZiB0aGUgYmFzZSBub2RlJyApO1xyXG4gICAgbGlzdGVuZXIuZGlzcG9zZSgpO1xyXG4gIH0gKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ3Bvc2l0aW9uUHJvcGVydHkgd2l0aCBob29rcycsIGFzc2VydCA9PiB7XHJcbiAgTGlzdGVuZXJUZXN0VXRpbHMuc2ltcGxlUmVjdGFuZ2xlVGVzdCggKCBkaXNwbGF5LCByZWN0LCBub2RlICkgPT4ge1xyXG4gICAgY29uc3QgcG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIFZlY3RvcjIuWkVSTyApO1xyXG4gICAgcG9zaXRpb25Qcm9wZXJ0eS5saW5rQXR0cmlidXRlKCByZWN0LCAndHJhbnNsYXRpb24nICk7XHJcblxyXG4gICAgY29uc3QgbGlzdGVuZXIgPSBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oICdteUxpc3RlbmVyJyApLFxyXG4gICAgICBwb3NpdGlvblByb3BlcnR5OiBwb3NpdGlvblByb3BlcnR5XHJcbiAgICB9ICk7XHJcbiAgICByZWN0LmFkZElucHV0TGlzdGVuZXIoIGxpc3RlbmVyICk7XHJcblxyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VNb3ZlKCBkaXNwbGF5LCAxMCwgMTAgKTtcclxuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlRG93biggZGlzcGxheSwgMTAsIDEwICk7XHJcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZU1vdmUoIGRpc3BsYXksIDIwLCAxNSApO1xyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VVcCggZGlzcGxheSwgMjAsIDE1ICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIHBvc2l0aW9uUHJvcGVydHkudmFsdWUueCwgMTAsICdEcmFnIHdpdGggdHJhbnNsYXRlTm9kZSBzaG91bGQgaGF2ZSBjaGFuZ2VkIHRoZSB4IHRyYW5zbGF0aW9uJyApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBwb3NpdGlvblByb3BlcnR5LnZhbHVlLnksIDUsICdEcmFnIHdpdGggdHJhbnNsYXRlTm9kZSBzaG91bGQgaGF2ZSBjaGFuZ2VkIHRoZSB5IHRyYW5zbGF0aW9uJyApO1xyXG4gICAgbGlzdGVuZXIuZGlzcG9zZSgpO1xyXG4gIH0gKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ3Bvc2l0aW9uUHJvcGVydHkgd2l0aCBob29rcyBhbmQgdHJhbnNmb3JtJywgYXNzZXJ0ID0+IHtcclxuICBMaXN0ZW5lclRlc3RVdGlscy5zaW1wbGVSZWN0YW5nbGVUZXN0KCAoIGRpc3BsYXksIHJlY3QsIG5vZGUgKSA9PiB7XHJcbiAgICBjb25zdCBwb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggVmVjdG9yMi5aRVJPICk7XHJcbiAgICBjb25zdCB0cmFuc2Zvcm0gPSBuZXcgVHJhbnNmb3JtMyggTWF0cml4My50cmFuc2xhdGlvbiggNSwgMyApLnRpbWVzTWF0cml4KCBNYXRyaXgzLnNjYWxlKCAyICkgKS50aW1lc01hdHJpeCggTWF0cml4My5yb3RhdGlvbjIoIE1hdGguUEkgLyA0ICkgKSApO1xyXG5cclxuICAgIC8vIFN0YXJ0cyBhdCA1LDNcclxuICAgIHBvc2l0aW9uUHJvcGVydHkubGluayggcG9zaXRpb24gPT4ge1xyXG4gICAgICByZWN0LnRyYW5zbGF0aW9uID0gdHJhbnNmb3JtLnRyYW5zZm9ybVBvc2l0aW9uMiggcG9zaXRpb24gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBsaXN0ZW5lciA9IG5ldyBEcmFnTGlzdGVuZXIoIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggJ215TGlzdGVuZXInICksXHJcbiAgICAgIHBvc2l0aW9uUHJvcGVydHk6IHBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNmb3JtXHJcbiAgICB9ICk7XHJcbiAgICByZWN0LmFkZElucHV0TGlzdGVuZXIoIGxpc3RlbmVyICk7XHJcblxyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VNb3ZlKCBkaXNwbGF5LCAxMCwgMTAgKTtcclxuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlRG93biggZGlzcGxheSwgMTAsIDEwICk7XHJcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZU1vdmUoIGRpc3BsYXksIDIwLCAxNSApO1xyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VVcCggZGlzcGxheSwgMjAsIDE1ICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIFV0aWxzLnJvdW5kU3ltbWV0cmljKCByZWN0LnggKSwgMTUsICdbeF0gU3RhcnRlZCBhdCA1LCBtb3ZlZCBieSAxMCcgKTtcclxuICAgIGFzc2VydC5lcXVhbCggVXRpbHMucm91bmRTeW1tZXRyaWMoIHJlY3QueSApLCA4LCAnW3ldIFN0YXJ0ZWQgYXQgMywgbW92ZWQgYnkgNScgKTtcclxuICAgIGxpc3RlbmVyLmRpc3Bvc2UoKTtcclxuICB9ICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdwb3NpdGlvblByb3BlcnR5IHdpdGggZHJhZ0JvdW5kcycsIGFzc2VydCA9PiB7XHJcbiAgTGlzdGVuZXJUZXN0VXRpbHMuc2ltcGxlUmVjdGFuZ2xlVGVzdCggKCBkaXNwbGF5LCByZWN0LCBub2RlICkgPT4ge1xyXG4gICAgY29uc3QgcG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIFZlY3RvcjIuWkVSTyApO1xyXG5cclxuICAgIHBvc2l0aW9uUHJvcGVydHkubGluayggcG9zaXRpb24gPT4ge1xyXG4gICAgICByZWN0LnRyYW5zbGF0aW9uID0gcG9zaXRpb247XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbGlzdGVuZXIgPSBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oICdteUxpc3RlbmVyJyApLFxyXG4gICAgICBwb3NpdGlvblByb3BlcnR5OiBwb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICBkcmFnQm91bmRzUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggbmV3IEJvdW5kczIoIDAsIDAsIDUsIDUgKSApXHJcbiAgICB9ICk7XHJcbiAgICByZWN0LmFkZElucHV0TGlzdGVuZXIoIGxpc3RlbmVyICk7XHJcblxyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VNb3ZlKCBkaXNwbGF5LCAxMCwgMTAgKTtcclxuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlRG93biggZGlzcGxheSwgMTAsIDEwICk7XHJcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZU1vdmUoIGRpc3BsYXksIDUwLCAzMCApO1xyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VVcCggZGlzcGxheSwgNTAsIDMwICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIHBvc2l0aW9uUHJvcGVydHkudmFsdWUueCwgNSwgJ1t4XSBTaG91bGQgYmUgbGltaXRlZCB0byA1IGJ5IGRyYWdCb3VuZHMnICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIHBvc2l0aW9uUHJvcGVydHkudmFsdWUueSwgNSwgJ1t5XSBTaG91bGQgYmUgbGltaXRlZCB0byA1IGJ5IGRyYWdCb3VuZHMgICcgKTtcclxuICAgIGxpc3RlbmVyLmRpc3Bvc2UoKTtcclxuICB9ICk7XHJcbn0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLDhC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