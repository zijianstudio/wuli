// Copyright 2018-2020, University of Colorado Boulder

/**
 * Tests for dimensionMap
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import dimensionMap from './dimensionMap.js';
QUnit.module('dimensionMap');
QUnit.test('1 dimensional', assert => {
  function checkMap(values, map, message) {
    assert.ok(_.isEqual(dimensionMap(1, values, map), values.map(map)), message);
  }
  checkMap([1, 2, 4], x => x, 'Identity');
  checkMap([1, 2, 4], x => 2 * x, 'Simple map');
  checkMap([1, 2, 4], (x, index) => 2 * x + index, 'Indexed map');
});
QUnit.test('multidimensional', assert => {
  const dim2 = [[1, 4, 10], [5, 3, -1]];
  const dim3 = [[[1, 9, 25], [23]], [[5, 5, 5, 5], [2, 9], [1], [3, -10]]];
  assert.ok(_.isEqual(dimensionMap(2, dim2, x => x), dim2), '2-dimensional identity');
  assert.ok(_.isEqual(dimensionMap(3, dim3, x => x), dim3), '3-dimensional identity');
  assert.ok(_.isEqual(dimensionMap(2, dim2, (x, idx1, idx2) => dim2[idx1][idx2]), dim2), '2-dimensional indexing-based');
  assert.ok(_.isEqual(dimensionMap(3, dim3, (x, idx1, idx2, idx3) => dim3[idx1][idx2][idx3]), dim3), '3-dimensional indexing-based');
  assert.ok(_.isEqual(dimensionMap(2, dim2, x => 2 * x), [[2, 8, 20], [10, 6, -2]]), '2-dimensional times 2');
  assert.ok(_.isEqual(dimensionMap(3, dim3, x => 2 * x), [[[2, 18, 50], [46]], [[10, 10, 10, 10], [4, 18], [2], [6, -20]]]), '3-dimensional times 2');
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkaW1lbnNpb25NYXAiLCJRVW5pdCIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJjaGVja01hcCIsInZhbHVlcyIsIm1hcCIsIm1lc3NhZ2UiLCJvayIsIl8iLCJpc0VxdWFsIiwieCIsImluZGV4IiwiZGltMiIsImRpbTMiLCJpZHgxIiwiaWR4MiIsImlkeDMiXSwic291cmNlcyI6WyJkaW1lbnNpb25NYXBUZXN0cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUZXN0cyBmb3IgZGltZW5zaW9uTWFwXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgZGltZW5zaW9uTWFwIGZyb20gJy4vZGltZW5zaW9uTWFwLmpzJztcclxuXHJcblFVbml0Lm1vZHVsZSggJ2RpbWVuc2lvbk1hcCcgKTtcclxuXHJcblFVbml0LnRlc3QoICcxIGRpbWVuc2lvbmFsJywgYXNzZXJ0ID0+IHtcclxuICBmdW5jdGlvbiBjaGVja01hcCggdmFsdWVzLCBtYXAsIG1lc3NhZ2UgKSB7XHJcbiAgICBhc3NlcnQub2soIF8uaXNFcXVhbCggZGltZW5zaW9uTWFwKCAxLCB2YWx1ZXMsIG1hcCApLCB2YWx1ZXMubWFwKCBtYXAgKSApLCBtZXNzYWdlICk7XHJcbiAgfVxyXG5cclxuICBjaGVja01hcCggWyAxLCAyLCA0IF0sIHggPT4geCwgJ0lkZW50aXR5JyApO1xyXG4gIGNoZWNrTWFwKCBbIDEsIDIsIDQgXSwgeCA9PiAyICogeCwgJ1NpbXBsZSBtYXAnICk7XHJcbiAgY2hlY2tNYXAoIFsgMSwgMiwgNCBdLCAoIHgsIGluZGV4ICkgPT4gMiAqIHggKyBpbmRleCwgJ0luZGV4ZWQgbWFwJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnbXVsdGlkaW1lbnNpb25hbCcsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgZGltMiA9IFtcclxuICAgIFsgMSwgNCwgMTAgXSxcclxuICAgIFsgNSwgMywgLTEgXVxyXG4gIF07XHJcblxyXG4gIGNvbnN0IGRpbTMgPSBbXHJcbiAgICBbXHJcbiAgICAgIFsgMSwgOSwgMjUgXSxcclxuICAgICAgWyAyMyBdXHJcbiAgICBdLFxyXG4gICAgW1xyXG4gICAgICBbIDUsIDUsIDUsIDUgXSxcclxuICAgICAgWyAyLCA5IF0sXHJcbiAgICAgIFsgMSBdLFxyXG4gICAgICBbIDMsIC0xMCBdXHJcbiAgICBdXHJcbiAgXTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBfLmlzRXF1YWwoIGRpbWVuc2lvbk1hcCggMiwgZGltMiwgeCA9PiB4ICksIGRpbTIgKSwgJzItZGltZW5zaW9uYWwgaWRlbnRpdHknICk7XHJcbiAgYXNzZXJ0Lm9rKCBfLmlzRXF1YWwoIGRpbWVuc2lvbk1hcCggMywgZGltMywgeCA9PiB4ICksIGRpbTMgKSwgJzMtZGltZW5zaW9uYWwgaWRlbnRpdHknICk7XHJcbiAgYXNzZXJ0Lm9rKCBfLmlzRXF1YWwoIGRpbWVuc2lvbk1hcCggMiwgZGltMiwgKCB4LCBpZHgxLCBpZHgyICkgPT4gZGltMlsgaWR4MSBdWyBpZHgyIF0gKSwgZGltMiApLCAnMi1kaW1lbnNpb25hbCBpbmRleGluZy1iYXNlZCcgKTtcclxuICBhc3NlcnQub2soIF8uaXNFcXVhbCggZGltZW5zaW9uTWFwKCAzLCBkaW0zLCAoIHgsIGlkeDEsIGlkeDIsIGlkeDMgKSA9PiBkaW0zWyBpZHgxIF1bIGlkeDIgXVsgaWR4MyBdICksIGRpbTMgKSwgJzMtZGltZW5zaW9uYWwgaW5kZXhpbmctYmFzZWQnICk7XHJcbiAgYXNzZXJ0Lm9rKCBfLmlzRXF1YWwoIGRpbWVuc2lvbk1hcCggMiwgZGltMiwgeCA9PiAyICogeCApLCBbXHJcbiAgICBbIDIsIDgsIDIwIF0sXHJcbiAgICBbIDEwLCA2LCAtMiBdXHJcbiAgXSApLCAnMi1kaW1lbnNpb25hbCB0aW1lcyAyJyApO1xyXG4gIGFzc2VydC5vayggXy5pc0VxdWFsKCBkaW1lbnNpb25NYXAoIDMsIGRpbTMsIHggPT4gMiAqIHggKSwgW1xyXG4gICAgW1xyXG4gICAgICBbIDIsIDE4LCA1MCBdLFxyXG4gICAgICBbIDQ2IF1cclxuICAgIF0sXHJcbiAgICBbXHJcbiAgICAgIFsgMTAsIDEwLCAxMCwgMTAgXSxcclxuICAgICAgWyA0LCAxOCBdLFxyXG4gICAgICBbIDIgXSxcclxuICAgICAgWyA2LCAtMjAgXVxyXG4gICAgXVxyXG4gIF0gKSwgJzMtZGltZW5zaW9uYWwgdGltZXMgMicgKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxZQUFZLE1BQU0sbUJBQW1CO0FBRTVDQyxLQUFLLENBQUNDLE1BQU0sQ0FBRSxjQUFlLENBQUM7QUFFOUJELEtBQUssQ0FBQ0UsSUFBSSxDQUFFLGVBQWUsRUFBRUMsTUFBTSxJQUFJO0VBQ3JDLFNBQVNDLFFBQVFBLENBQUVDLE1BQU0sRUFBRUMsR0FBRyxFQUFFQyxPQUFPLEVBQUc7SUFDeENKLE1BQU0sQ0FBQ0ssRUFBRSxDQUFFQyxDQUFDLENBQUNDLE9BQU8sQ0FBRVgsWUFBWSxDQUFFLENBQUMsRUFBRU0sTUFBTSxFQUFFQyxHQUFJLENBQUMsRUFBRUQsTUFBTSxDQUFDQyxHQUFHLENBQUVBLEdBQUksQ0FBRSxDQUFDLEVBQUVDLE9BQVEsQ0FBQztFQUN0RjtFQUVBSCxRQUFRLENBQUUsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUFFTyxDQUFDLElBQUlBLENBQUMsRUFBRSxVQUFXLENBQUM7RUFDM0NQLFFBQVEsQ0FBRSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQUVPLENBQUMsSUFBSSxDQUFDLEdBQUdBLENBQUMsRUFBRSxZQUFhLENBQUM7RUFDakRQLFFBQVEsQ0FBRSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFF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