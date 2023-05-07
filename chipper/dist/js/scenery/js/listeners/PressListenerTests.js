// Copyright 2018-2021, University of Colorado Boulder

/**
 * PressListener tests
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Tandem from '../../../tandem/js/Tandem.js';
import ListenerTestUtils from './ListenerTestUtils.js';
import PressListener from './PressListener.js';
QUnit.module('PressListener');
QUnit.test('Basics', assert => {
  ListenerTestUtils.simpleRectangleTest((display, rect, node) => {
    let pressCount = 0;
    let releaseCount = 0;
    let dragCount = 0;
    const listener = new PressListener({
      tandem: Tandem.ROOT_TEST.createTandem('myListener'),
      press: (event, listener) => {
        pressCount++;
      },
      release: (event, listener) => {
        releaseCount++;
      },
      drag: (event, listener) => {
        dragCount++;
      }
    });
    rect.addInputListener(listener);
    assert.equal(pressCount, 0, '[1] Has not been pressed yet');
    assert.equal(releaseCount, 0, '[1] Has not been released yet');
    assert.equal(dragCount, 0, '[1] Has not been dragged yet');
    assert.equal(listener.isPressedProperty.value, false, '[1] Is not pressed');
    assert.equal(listener.isOverProperty.value, false, '[1] Is not over');
    assert.equal(listener.isHoveringProperty.value, false, '[1] Is not hovering');
    assert.equal(listener.isHighlightedProperty.value, false, '[1] Is not highlighted');
    assert.equal(listener.interrupted, false, '[1] Is not interrupted');
    ListenerTestUtils.mouseMove(display, 10, 10);
    assert.equal(pressCount, 0, '[2] Has not been pressed yet');
    assert.equal(releaseCount, 0, '[2] Has not been released yet');
    assert.equal(dragCount, 0, '[2] Has not been dragged yet');
    assert.equal(listener.isPressedProperty.value, false, '[2] Is not pressed');
    assert.equal(listener.isOverProperty.value, true, '[2] Is over');
    assert.equal(listener.isHoveringProperty.value, true, '[2] Is hovering');
    assert.equal(listener.isHighlightedProperty.value, true, '[2] Is highlighted');
    assert.equal(listener.interrupted, false, '[2] Is not interrupted');
    ListenerTestUtils.mouseDown(display, 10, 10);
    assert.equal(pressCount, 1, '[3] Pressed once');
    assert.equal(releaseCount, 0, '[3] Has not been released yet');
    assert.equal(dragCount, 0, '[3] Has not been dragged yet');
    assert.equal(listener.isPressedProperty.value, true, '[3] Is pressed');
    assert.equal(listener.isOverProperty.value, true, '[3] Is over');
    assert.equal(listener.isHoveringProperty.value, true, '[3] Is hovering');
    assert.equal(listener.isHighlightedProperty.value, true, '[3] Is highlighted');
    assert.equal(listener.interrupted, false, '[3] Is not interrupted');
    assert.ok(listener.pressedTrail.lastNode() === rect, '[3] Dragging the proper rectangle');

    // A move that goes "outside" the node
    ListenerTestUtils.mouseMove(display, 50, 10);
    assert.equal(pressCount, 1, '[4] Pressed once');
    assert.equal(releaseCount, 0, '[4] Has not been released yet');
    assert.equal(dragCount, 1, '[4] Dragged once');
    assert.equal(listener.isPressedProperty.value, true, '[4] Is pressed');
    assert.equal(listener.isOverProperty.value, false, '[4] Is NOT over anymore');
    assert.equal(listener.isHoveringProperty.value, false, '[4] Is NOT hovering');
    assert.equal(listener.isHighlightedProperty.value, true, '[4] Is highlighted');
    assert.equal(listener.interrupted, false, '[4] Is not interrupted');
    ListenerTestUtils.mouseUp(display, 50, 10);
    assert.equal(pressCount, 1, '[5] Pressed once');
    assert.equal(releaseCount, 1, '[5] Released once');
    assert.equal(dragCount, 1, '[5] Dragged once');
    assert.equal(listener.isPressedProperty.value, false, '[5] Is NOT pressed');
    assert.equal(listener.isOverProperty.value, false, '[5] Is NOT over anymore');
    assert.equal(listener.isHoveringProperty.value, false, '[5] Is NOT hovering');
    assert.equal(listener.isHighlightedProperty.value, false, '[5] Is NOT highlighted');
    assert.equal(listener.interrupted, false, '[5] Is not interrupted');
    listener.dispose();
  });
});
QUnit.test('Interruption', assert => {
  ListenerTestUtils.simpleRectangleTest((display, rect, node) => {
    const listener = new PressListener({
      tandem: Tandem.ROOT_TEST.createTandem('myListener')
    });
    rect.addInputListener(listener);
    ListenerTestUtils.mouseDown(display, 10, 10);
    assert.equal(listener.isPressedProperty.value, true, 'Is pressed before the interruption');
    listener.interrupt();
    assert.equal(listener.isPressedProperty.value, false, 'Is NOT pressed after the interruption');
    listener.dispose();
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYW5kZW0iLCJMaXN0ZW5lclRlc3RVdGlscyIsIlByZXNzTGlzdGVuZXIiLCJRVW5pdCIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJzaW1wbGVSZWN0YW5nbGVUZXN0IiwiZGlzcGxheSIsInJlY3QiLCJub2RlIiwicHJlc3NDb3VudCIsInJlbGVhc2VDb3VudCIsImRyYWdDb3VudCIsImxpc3RlbmVyIiwidGFuZGVtIiwiUk9PVF9URVNUIiwiY3JlYXRlVGFuZGVtIiwicHJlc3MiLCJldmVudCIsInJlbGVhc2UiLCJkcmFnIiwiYWRkSW5wdXRMaXN0ZW5lciIsImVxdWFsIiwiaXNQcmVzc2VkUHJvcGVydHkiLCJ2YWx1ZSIsImlzT3ZlclByb3BlcnR5IiwiaXNIb3ZlcmluZ1Byb3BlcnR5IiwiaXNIaWdobGlnaHRlZFByb3BlcnR5IiwiaW50ZXJydXB0ZWQiLCJtb3VzZU1vdmUiLCJtb3VzZURvd24iLCJvayIsInByZXNzZWRUcmFpbCIsImxhc3ROb2RlIiwibW91c2VVcCIsImRpc3Bvc2UiLCJpbnRlcnJ1cHQiXSwic291cmNlcyI6WyJQcmVzc0xpc3RlbmVyVGVzdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUHJlc3NMaXN0ZW5lciB0ZXN0c1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IExpc3RlbmVyVGVzdFV0aWxzIGZyb20gJy4vTGlzdGVuZXJUZXN0VXRpbHMuanMnO1xyXG5pbXBvcnQgUHJlc3NMaXN0ZW5lciBmcm9tICcuL1ByZXNzTGlzdGVuZXIuanMnO1xyXG5cclxuUVVuaXQubW9kdWxlKCAnUHJlc3NMaXN0ZW5lcicgKTtcclxuXHJcblFVbml0LnRlc3QoICdCYXNpY3MnLCBhc3NlcnQgPT4ge1xyXG4gIExpc3RlbmVyVGVzdFV0aWxzLnNpbXBsZVJlY3RhbmdsZVRlc3QoICggZGlzcGxheSwgcmVjdCwgbm9kZSApID0+IHtcclxuICAgIGxldCBwcmVzc0NvdW50ID0gMDtcclxuICAgIGxldCByZWxlYXNlQ291bnQgPSAwO1xyXG4gICAgbGV0IGRyYWdDb3VudCA9IDA7XHJcbiAgICBjb25zdCBsaXN0ZW5lciA9IG5ldyBQcmVzc0xpc3RlbmVyKCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oICdteUxpc3RlbmVyJyApLFxyXG5cclxuICAgICAgcHJlc3M6ICggZXZlbnQsIGxpc3RlbmVyICkgPT4ge1xyXG4gICAgICAgIHByZXNzQ291bnQrKztcclxuICAgICAgfSxcclxuICAgICAgcmVsZWFzZTogKCBldmVudCwgbGlzdGVuZXIgKSA9PiB7XHJcbiAgICAgICAgcmVsZWFzZUNvdW50Kys7XHJcbiAgICAgIH0sXHJcbiAgICAgIGRyYWc6ICggZXZlbnQsIGxpc3RlbmVyICkgPT4ge1xyXG4gICAgICAgIGRyYWdDb3VudCsrO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICByZWN0LmFkZElucHV0TGlzdGVuZXIoIGxpc3RlbmVyICk7XHJcblxyXG4gICAgYXNzZXJ0LmVxdWFsKCBwcmVzc0NvdW50LCAwLCAnWzFdIEhhcyBub3QgYmVlbiBwcmVzc2VkIHlldCcgKTtcclxuICAgIGFzc2VydC5lcXVhbCggcmVsZWFzZUNvdW50LCAwLCAnWzFdIEhhcyBub3QgYmVlbiByZWxlYXNlZCB5ZXQnICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIGRyYWdDb3VudCwgMCwgJ1sxXSBIYXMgbm90IGJlZW4gZHJhZ2dlZCB5ZXQnICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIGxpc3RlbmVyLmlzUHJlc3NlZFByb3BlcnR5LnZhbHVlLCBmYWxzZSwgJ1sxXSBJcyBub3QgcHJlc3NlZCcgKTtcclxuICAgIGFzc2VydC5lcXVhbCggbGlzdGVuZXIuaXNPdmVyUHJvcGVydHkudmFsdWUsIGZhbHNlLCAnWzFdIElzIG5vdCBvdmVyJyApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBsaXN0ZW5lci5pc0hvdmVyaW5nUHJvcGVydHkudmFsdWUsIGZhbHNlLCAnWzFdIElzIG5vdCBob3ZlcmluZycgKTtcclxuICAgIGFzc2VydC5lcXVhbCggbGlzdGVuZXIuaXNIaWdobGlnaHRlZFByb3BlcnR5LnZhbHVlLCBmYWxzZSwgJ1sxXSBJcyBub3QgaGlnaGxpZ2h0ZWQnICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIGxpc3RlbmVyLmludGVycnVwdGVkLCBmYWxzZSwgJ1sxXSBJcyBub3QgaW50ZXJydXB0ZWQnICk7XHJcblxyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VNb3ZlKCBkaXNwbGF5LCAxMCwgMTAgKTtcclxuXHJcbiAgICBhc3NlcnQuZXF1YWwoIHByZXNzQ291bnQsIDAsICdbMl0gSGFzIG5vdCBiZWVuIHByZXNzZWQgeWV0JyApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCByZWxlYXNlQ291bnQsIDAsICdbMl0gSGFzIG5vdCBiZWVuIHJlbGVhc2VkIHlldCcgKTtcclxuICAgIGFzc2VydC5lcXVhbCggZHJhZ0NvdW50LCAwLCAnWzJdIEhhcyBub3QgYmVlbiBkcmFnZ2VkIHlldCcgKTtcclxuICAgIGFzc2VydC5lcXVhbCggbGlzdGVuZXIuaXNQcmVzc2VkUHJvcGVydHkudmFsdWUsIGZhbHNlLCAnWzJdIElzIG5vdCBwcmVzc2VkJyApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBsaXN0ZW5lci5pc092ZXJQcm9wZXJ0eS52YWx1ZSwgdHJ1ZSwgJ1syXSBJcyBvdmVyJyApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBsaXN0ZW5lci5pc0hvdmVyaW5nUHJvcGVydHkudmFsdWUsIHRydWUsICdbMl0gSXMgaG92ZXJpbmcnICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIGxpc3RlbmVyLmlzSGlnaGxpZ2h0ZWRQcm9wZXJ0eS52YWx1ZSwgdHJ1ZSwgJ1syXSBJcyBoaWdobGlnaHRlZCcgKTtcclxuICAgIGFzc2VydC5lcXVhbCggbGlzdGVuZXIuaW50ZXJydXB0ZWQsIGZhbHNlLCAnWzJdIElzIG5vdCBpbnRlcnJ1cHRlZCcgKTtcclxuXHJcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZURvd24oIGRpc3BsYXksIDEwLCAxMCApO1xyXG5cclxuICAgIGFzc2VydC5lcXVhbCggcHJlc3NDb3VudCwgMSwgJ1szXSBQcmVzc2VkIG9uY2UnICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIHJlbGVhc2VDb3VudCwgMCwgJ1szXSBIYXMgbm90IGJlZW4gcmVsZWFzZWQgeWV0JyApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBkcmFnQ291bnQsIDAsICdbM10gSGFzIG5vdCBiZWVuIGRyYWdnZWQgeWV0JyApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBsaXN0ZW5lci5pc1ByZXNzZWRQcm9wZXJ0eS52YWx1ZSwgdHJ1ZSwgJ1szXSBJcyBwcmVzc2VkJyApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBsaXN0ZW5lci5pc092ZXJQcm9wZXJ0eS52YWx1ZSwgdHJ1ZSwgJ1szXSBJcyBvdmVyJyApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBsaXN0ZW5lci5pc0hvdmVyaW5nUHJvcGVydHkudmFsdWUsIHRydWUsICdbM10gSXMgaG92ZXJpbmcnICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIGxpc3RlbmVyLmlzSGlnaGxpZ2h0ZWRQcm9wZXJ0eS52YWx1ZSwgdHJ1ZSwgJ1szXSBJcyBoaWdobGlnaHRlZCcgKTtcclxuICAgIGFzc2VydC5lcXVhbCggbGlzdGVuZXIuaW50ZXJydXB0ZWQsIGZhbHNlLCAnWzNdIElzIG5vdCBpbnRlcnJ1cHRlZCcgKTtcclxuXHJcbiAgICBhc3NlcnQub2soIGxpc3RlbmVyLnByZXNzZWRUcmFpbC5sYXN0Tm9kZSgpID09PSByZWN0LCAnWzNdIERyYWdnaW5nIHRoZSBwcm9wZXIgcmVjdGFuZ2xlJyApO1xyXG5cclxuICAgIC8vIEEgbW92ZSB0aGF0IGdvZXMgXCJvdXRzaWRlXCIgdGhlIG5vZGVcclxuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlTW92ZSggZGlzcGxheSwgNTAsIDEwICk7XHJcblxyXG4gICAgYXNzZXJ0LmVxdWFsKCBwcmVzc0NvdW50LCAxLCAnWzRdIFByZXNzZWQgb25jZScgKTtcclxuICAgIGFzc2VydC5lcXVhbCggcmVsZWFzZUNvdW50LCAwLCAnWzRdIEhhcyBub3QgYmVlbiByZWxlYXNlZCB5ZXQnICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIGRyYWdDb3VudCwgMSwgJ1s0XSBEcmFnZ2VkIG9uY2UnICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIGxpc3RlbmVyLmlzUHJlc3NlZFByb3BlcnR5LnZhbHVlLCB0cnVlLCAnWzRdIElzIHByZXNzZWQnICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIGxpc3RlbmVyLmlzT3ZlclByb3BlcnR5LnZhbHVlLCBmYWxzZSwgJ1s0XSBJcyBOT1Qgb3ZlciBhbnltb3JlJyApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBsaXN0ZW5lci5pc0hvdmVyaW5nUHJvcGVydHkudmFsdWUsIGZhbHNlLCAnWzRdIElzIE5PVCBob3ZlcmluZycgKTtcclxuICAgIGFzc2VydC5lcXVhbCggbGlzdGVuZXIuaXNIaWdobGlnaHRlZFByb3BlcnR5LnZhbHVlLCB0cnVlLCAnWzRdIElzIGhpZ2hsaWdodGVkJyApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBsaXN0ZW5lci5pbnRlcnJ1cHRlZCwgZmFsc2UsICdbNF0gSXMgbm90IGludGVycnVwdGVkJyApO1xyXG5cclxuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlVXAoIGRpc3BsYXksIDUwLCAxMCApO1xyXG5cclxuICAgIGFzc2VydC5lcXVhbCggcHJlc3NDb3VudCwgMSwgJ1s1XSBQcmVzc2VkIG9uY2UnICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIHJlbGVhc2VDb3VudCwgMSwgJ1s1XSBSZWxlYXNlZCBvbmNlJyApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBkcmFnQ291bnQsIDEsICdbNV0gRHJhZ2dlZCBvbmNlJyApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBsaXN0ZW5lci5pc1ByZXNzZWRQcm9wZXJ0eS52YWx1ZSwgZmFsc2UsICdbNV0gSXMgTk9UIHByZXNzZWQnICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIGxpc3RlbmVyLmlzT3ZlclByb3BlcnR5LnZhbHVlLCBmYWxzZSwgJ1s1XSBJcyBOT1Qgb3ZlciBhbnltb3JlJyApO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBsaXN0ZW5lci5pc0hvdmVyaW5nUHJvcGVydHkudmFsdWUsIGZhbHNlLCAnWzVdIElzIE5PVCBob3ZlcmluZycgKTtcclxuICAgIGFzc2VydC5lcXVhbCggbGlzdGVuZXIuaXNIaWdobGlnaHRlZFByb3BlcnR5LnZhbHVlLCBmYWxzZSwgJ1s1XSBJcyBOT1QgaGlnaGxpZ2h0ZWQnICk7XHJcbiAgICBhc3NlcnQuZXF1YWwoIGxpc3RlbmVyLmludGVycnVwdGVkLCBmYWxzZSwgJ1s1XSBJcyBub3QgaW50ZXJydXB0ZWQnICk7XHJcbiAgICBsaXN0ZW5lci5kaXNwb3NlKCk7XHJcbiAgfSApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnSW50ZXJydXB0aW9uJywgYXNzZXJ0ID0+IHtcclxuICBMaXN0ZW5lclRlc3RVdGlscy5zaW1wbGVSZWN0YW5nbGVUZXN0KCAoIGRpc3BsYXksIHJlY3QsIG5vZGUgKSA9PiB7XHJcbiAgICBjb25zdCBsaXN0ZW5lciA9IG5ldyBQcmVzc0xpc3RlbmVyKCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oICdteUxpc3RlbmVyJyApXHJcbiAgICB9ICk7XHJcbiAgICByZWN0LmFkZElucHV0TGlzdGVuZXIoIGxpc3RlbmVyICk7XHJcblxyXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VEb3duKCBkaXNwbGF5LCAxMCwgMTAgKTtcclxuXHJcbiAgICBhc3NlcnQuZXF1YWwoIGxpc3RlbmVyLmlzUHJlc3NlZFByb3BlcnR5LnZhbHVlLCB0cnVlLCAnSXMgcHJlc3NlZCBiZWZvcmUgdGhlIGludGVycnVwdGlvbicgKTtcclxuICAgIGxpc3RlbmVyLmludGVycnVwdCgpO1xyXG4gICAgYXNzZXJ0LmVxdWFsKCBsaXN0ZW5lci5pc1ByZXNzZWRQcm9wZXJ0eS52YWx1ZSwgZmFsc2UsICdJcyBOT1QgcHJlc3NlZCBhZnRlciB0aGUgaW50ZXJydXB0aW9uJyApO1xyXG4gICAgbGlzdGVuZXIuZGlzcG9zZSgpO1xyXG4gIH0gKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELE9BQU9DLGlCQUFpQixNQUFNLHdCQUF3QjtBQUN0RCxPQUFPQyxhQUFhLE1BQU0sb0JBQW9CO0FBRTlDQyxLQUFLLENBQUNDLE1BQU0sQ0FBRSxlQUFnQixDQUFDO0FBRS9CRCxLQUFLLENBQUNFLElBQUksQ0FBRSxRQUFRLEVBQUVDLE1BQU0sSUFBSTtFQUM5QkwsaUJBQWlCLENBQUNNLG1CQUFtQixDQUFFLENBQUVDLE9BQU8sRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEtBQU07SUFDaEUsSUFBSUMsVUFBVSxHQUFHLENBQUM7SUFDbEIsSUFBSUMsWUFBWSxHQUFHLENBQUM7SUFDcEIsSUFBSUMsU0FBUyxHQUFHLENBQUM7SUFDakIsTUFBTUMsUUFBUSxHQUFHLElBQUlaLGFBQWEsQ0FBRTtNQUNsQ2EsTUFBTSxFQUFFZixNQUFNLENBQUNnQixTQUFTLENBQUNDLFlBQVksQ0FBRSxZQUFhLENBQUM7TUFFckRDLEtBQUssRUFBRUEsQ0FBRUMsS0FBSyxFQUFFTCxRQUFRLEtBQU07UUFDNUJILFVBQVUsRUFBRTtNQUNkLENBQUM7TUFDRFMsT0FBTyxFQUFFQSxDQUFFRCxLQUFLLEVBQUVMLFFBQVEsS0FBTTtRQUM5QkYsWUFBWSxFQUFFO01BQ2hCLENBQUM7TUFDRFMsSUFB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