// Copyright 2018-2021, University of Colorado Boulder

/**
 * arrayDifference tests
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import arrayDifference from './arrayDifference.js';
import arrayRemove from './arrayRemove.js';
QUnit.module('arrayDifference');
function assertDifferences(assert, a, b, expectedAOnly, expectedBOnly, expectedBoth) {
  const aOnly = [];
  const bOnly = [];
  const inBoth = [];
  const result = arrayDifference(a, b, aOnly, bOnly, inBoth);
  assert.ok(_.isEqual(aOnly, expectedAOnly), `aOnly: ${a.toString()} diff ${b.toString()} expected: ${expectedAOnly.toString()} actual: ${aOnly.toString()}`);
  assert.ok(_.isEqual(bOnly, expectedBOnly), `bOnly: ${a.toString()} diff ${b.toString()} expected: ${expectedBOnly.toString()} actual: ${bOnly.toString()}`);
  assert.ok(_.isEqual(inBoth, expectedBoth), `inBoth: ${a.toString()} diff ${b.toString()} expected: ${expectedBoth.toString()} actual: ${inBoth.toString()}`);
  assert.ok(_.isEqual(aOnly, result), `return value: ${a.toString()} diff ${b.toString()}`);
}
function generatedTest(assert, maxNumber, aSize, bSize) {
  const a = [];
  const b = [];
  const aOnly = [];
  const bOnly = [];
  const inBoth = [];
  let item;
  const range = _.range(1, maxNumber);
  const aRange = range.slice();
  const bRange = range.slice();
  while (a.length < aSize) {
    item = _.sample(aRange); // eslint-disable-line bad-sim-text
    arrayRemove(aRange, item);
    a.push(item);
  }
  while (b.length < bSize) {
    item = _.sample(bRange); // eslint-disable-line bad-sim-text
    arrayRemove(bRange, item);
    b.push(item);
  }
  for (let i = 0; i < range.length; i++) {
    item = range[i];
    const inA = _.includes(a, item);
    const inB = _.includes(b, item);
    if (inA && inB) {
      inBoth.push(item);
    } else if (inA) {
      aOnly.push(item);
    } else if (inB) {
      bOnly.push(item);
    }
  }
  aOnly.sort((x, y) => a.indexOf(x) - a.indexOf(y));
  bOnly.sort((x, y) => b.indexOf(x) - b.indexOf(y));
  inBoth.sort((x, y) => a.indexOf(x) - a.indexOf(y));
  assertDifferences(assert, a, b, aOnly, bOnly, inBoth);
}
QUnit.test('Simple Usage 1', assert => {
  const a = [1, 2];
  const b = [2, 3];
  assert.ok(_.isEqual(arrayDifference(a, b), [1]));
});
QUnit.test('General Usage 1', assert => {
  assertDifferences(assert, [1, 2], [2, 3], [1], [3], [2]);
});
QUnit.test('General Usage 2', assert => {
  const a = [2, 19, 7, 12, 8, 6, 14, 5, 4, 9];
  const b = [17, 18, 9, 14, 20, 4, 3, 15];
  const aOnly = [2, 19, 7, 12, 8, 6, 5];
  const bOnly = [17, 18, 20, 3, 15];
  const inBoth = [14, 4, 9];
  assertDifferences(assert, a, b, aOnly, bOnly, inBoth);
});
QUnit.test('General Usage 3', assert => {
  assertDifferences(assert, [1, 2, 3, 4, 5], [3], [1, 2, 4, 5], [], [3]);
});
QUnit.test('General Usage 4', assert => {
  assertDifferences(assert, [1, 2, 3, 4, 5], [], [1, 2, 3, 4, 5], [], []);
});
QUnit.test('General Usage 5', assert => {
  assertDifferences(assert, [], [1, 2, 3, 4, 5], [], [1, 2, 3, 4, 5], []);
});
QUnit.test('Generated tests', assert => {
  _.times(20, () => {
    generatedTest(assert, 20, 10, 10);
  });
  _.times(4, () => {
    const size = 30;
    for (let i = 0; i <= size; i++) {
      generatedTest(assert, size + 5, i, size - i);
    }
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhcnJheURpZmZlcmVuY2UiLCJhcnJheVJlbW92ZSIsIlFVbml0IiwibW9kdWxlIiwiYXNzZXJ0RGlmZmVyZW5jZXMiLCJhc3NlcnQiLCJhIiwiYiIsImV4cGVjdGVkQU9ubHkiLCJleHBlY3RlZEJPbmx5IiwiZXhwZWN0ZWRCb3RoIiwiYU9ubHkiLCJiT25seSIsImluQm90aCIsInJlc3VsdCIsIm9rIiwiXyIsImlzRXF1YWwiLCJ0b1N0cmluZyIsImdlbmVyYXRlZFRlc3QiLCJtYXhOdW1iZXIiLCJhU2l6ZSIsImJTaXplIiwiaXRlbSIsInJhbmdlIiwiYVJhbmdlIiwic2xpY2UiLCJiUmFuZ2UiLCJsZW5ndGgiLCJzYW1wbGUiLCJwdXNoIiwiaSIsImluQSIsImluY2x1ZGVzIiwiaW5CIiwic29ydCIsIngiLCJ5IiwiaW5kZXhPZiIsInRlc3QiLCJ0aW1lcyIsInNpemUiXSwic291cmNlcyI6WyJhcnJheURpZmZlcmVuY2VUZXN0cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBhcnJheURpZmZlcmVuY2UgdGVzdHNcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBhcnJheURpZmZlcmVuY2UgZnJvbSAnLi9hcnJheURpZmZlcmVuY2UuanMnO1xyXG5pbXBvcnQgYXJyYXlSZW1vdmUgZnJvbSAnLi9hcnJheVJlbW92ZS5qcyc7XHJcblxyXG5RVW5pdC5tb2R1bGUoICdhcnJheURpZmZlcmVuY2UnICk7XHJcblxyXG5mdW5jdGlvbiBhc3NlcnREaWZmZXJlbmNlcyggYXNzZXJ0LCBhLCBiLCBleHBlY3RlZEFPbmx5LCBleHBlY3RlZEJPbmx5LCBleHBlY3RlZEJvdGggKSB7XHJcbiAgY29uc3QgYU9ubHkgPSBbXTtcclxuICBjb25zdCBiT25seSA9IFtdO1xyXG4gIGNvbnN0IGluQm90aCA9IFtdO1xyXG4gIGNvbnN0IHJlc3VsdCA9IGFycmF5RGlmZmVyZW5jZSggYSwgYiwgYU9ubHksIGJPbmx5LCBpbkJvdGggKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBfLmlzRXF1YWwoIGFPbmx5LCBleHBlY3RlZEFPbmx5ICksIGBhT25seTogJHthLnRvU3RyaW5nKCl9IGRpZmYgJHtiLnRvU3RyaW5nKCl9IGV4cGVjdGVkOiAke2V4cGVjdGVkQU9ubHkudG9TdHJpbmcoKX0gYWN0dWFsOiAke2FPbmx5LnRvU3RyaW5nKCl9YCApO1xyXG4gIGFzc2VydC5vayggXy5pc0VxdWFsKCBiT25seSwgZXhwZWN0ZWRCT25seSApLCBgYk9ubHk6ICR7YS50b1N0cmluZygpfSBkaWZmICR7Yi50b1N0cmluZygpfSBleHBlY3RlZDogJHtleHBlY3RlZEJPbmx5LnRvU3RyaW5nKCl9IGFjdHVhbDogJHtiT25seS50b1N0cmluZygpfWAgKTtcclxuICBhc3NlcnQub2soIF8uaXNFcXVhbCggaW5Cb3RoLCBleHBlY3RlZEJvdGggKSwgYGluQm90aDogJHthLnRvU3RyaW5nKCl9IGRpZmYgJHtiLnRvU3RyaW5nKCl9IGV4cGVjdGVkOiAke2V4cGVjdGVkQm90aC50b1N0cmluZygpfSBhY3R1YWw6ICR7aW5Cb3RoLnRvU3RyaW5nKCl9YCApO1xyXG4gIGFzc2VydC5vayggXy5pc0VxdWFsKCBhT25seSwgcmVzdWx0ICksIGByZXR1cm4gdmFsdWU6ICR7YS50b1N0cmluZygpfSBkaWZmICR7Yi50b1N0cmluZygpfWAgKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2VuZXJhdGVkVGVzdCggYXNzZXJ0LCBtYXhOdW1iZXIsIGFTaXplLCBiU2l6ZSApIHtcclxuICBjb25zdCBhID0gW107XHJcbiAgY29uc3QgYiA9IFtdO1xyXG4gIGNvbnN0IGFPbmx5ID0gW107XHJcbiAgY29uc3QgYk9ubHkgPSBbXTtcclxuICBjb25zdCBpbkJvdGggPSBbXTtcclxuICBsZXQgaXRlbTtcclxuXHJcbiAgY29uc3QgcmFuZ2UgPSBfLnJhbmdlKCAxLCBtYXhOdW1iZXIgKTtcclxuICBjb25zdCBhUmFuZ2UgPSByYW5nZS5zbGljZSgpO1xyXG4gIGNvbnN0IGJSYW5nZSA9IHJhbmdlLnNsaWNlKCk7XHJcblxyXG4gIHdoaWxlICggYS5sZW5ndGggPCBhU2l6ZSApIHtcclxuICAgIGl0ZW0gPSBfLnNhbXBsZSggYVJhbmdlICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFkLXNpbS10ZXh0XHJcbiAgICBhcnJheVJlbW92ZSggYVJhbmdlLCBpdGVtICk7XHJcbiAgICBhLnB1c2goIGl0ZW0gKTtcclxuICB9XHJcbiAgd2hpbGUgKCBiLmxlbmd0aCA8IGJTaXplICkge1xyXG4gICAgaXRlbSA9IF8uc2FtcGxlKCBiUmFuZ2UgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWQtc2ltLXRleHRcclxuICAgIGFycmF5UmVtb3ZlKCBiUmFuZ2UsIGl0ZW0gKTtcclxuICAgIGIucHVzaCggaXRlbSApO1xyXG4gIH1cclxuXHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgcmFuZ2UubGVuZ3RoOyBpKysgKSB7XHJcbiAgICBpdGVtID0gcmFuZ2VbIGkgXTtcclxuXHJcbiAgICBjb25zdCBpbkEgPSBfLmluY2x1ZGVzKCBhLCBpdGVtICk7XHJcbiAgICBjb25zdCBpbkIgPSBfLmluY2x1ZGVzKCBiLCBpdGVtICk7XHJcblxyXG4gICAgaWYgKCBpbkEgJiYgaW5CICkge1xyXG4gICAgICBpbkJvdGgucHVzaCggaXRlbSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGluQSApIHtcclxuICAgICAgYU9ubHkucHVzaCggaXRlbSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGluQiApIHtcclxuICAgICAgYk9ubHkucHVzaCggaXRlbSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYU9ubHkuc29ydCggKCB4LCB5ICkgPT4gYS5pbmRleE9mKCB4ICkgLSBhLmluZGV4T2YoIHkgKSApO1xyXG4gIGJPbmx5LnNvcnQoICggeCwgeSApID0+IGIuaW5kZXhPZiggeCApIC0gYi5pbmRleE9mKCB5ICkgKTtcclxuICBpbkJvdGguc29ydCggKCB4LCB5ICkgPT4gYS5pbmRleE9mKCB4ICkgLSBhLmluZGV4T2YoIHkgKSApO1xyXG5cclxuICBhc3NlcnREaWZmZXJlbmNlcyggYXNzZXJ0LCBhLCBiLCBhT25seSwgYk9ubHksIGluQm90aCApO1xyXG59XHJcblxyXG5RVW5pdC50ZXN0KCAnU2ltcGxlIFVzYWdlIDEnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGEgPSBbIDEsIDIgXTtcclxuICBjb25zdCBiID0gWyAyLCAzIF07XHJcbiAgYXNzZXJ0Lm9rKCBfLmlzRXF1YWwoIGFycmF5RGlmZmVyZW5jZSggYSwgYiApLCBbIDEgXSApICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdHZW5lcmFsIFVzYWdlIDEnLCBhc3NlcnQgPT4ge1xyXG4gIGFzc2VydERpZmZlcmVuY2VzKCBhc3NlcnQsIFsgMSwgMiBdLCBbIDIsIDMgXSwgWyAxIF0sIFsgMyBdLCBbIDIgXSApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnR2VuZXJhbCBVc2FnZSAyJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBhID0gWyAyLCAxOSwgNywgMTIsIDgsIDYsIDE0LCA1LCA0LCA5IF07XHJcbiAgY29uc3QgYiA9IFsgMTcsIDE4LCA5LCAxNCwgMjAsIDQsIDMsIDE1IF07XHJcbiAgY29uc3QgYU9ubHkgPSBbIDIsIDE5LCA3LCAxMiwgOCwgNiwgNSBdO1xyXG4gIGNvbnN0IGJPbmx5ID0gWyAxNywgMTgsIDIwLCAzLCAxNSBdO1xyXG4gIGNvbnN0IGluQm90aCA9IFsgMTQsIDQsIDkgXTtcclxuICBhc3NlcnREaWZmZXJlbmNlcyggYXNzZXJ0LCBhLCBiLCBhT25seSwgYk9ubHksIGluQm90aCApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnR2VuZXJhbCBVc2FnZSAzJywgYXNzZXJ0ID0+IHtcclxuICBhc3NlcnREaWZmZXJlbmNlcyggYXNzZXJ0LCBbIDEsIDIsIDMsIDQsIDUgXSwgWyAzIF0sIFsgMSwgMiwgNCwgNSBdLCBbXSwgWyAzIF0gKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0dlbmVyYWwgVXNhZ2UgNCcsIGFzc2VydCA9PiB7XHJcbiAgYXNzZXJ0RGlmZmVyZW5jZXMoIGFzc2VydCwgWyAxLCAyLCAzLCA0LCA1IF0sIFtdLCBbIDEsIDIsIDMsIDQsIDUgXSwgW10sIFtdICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdHZW5lcmFsIFVzYWdlIDUnLCBhc3NlcnQgPT4ge1xyXG4gIGFzc2VydERpZmZlcmVuY2VzKCBhc3NlcnQsIFtdLCBbIDEsIDIsIDMsIDQsIDUgXSwgW10sIFsgMSwgMiwgMywgNCwgNSBdLCBbXSApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnR2VuZXJhdGVkIHRlc3RzJywgYXNzZXJ0ID0+IHtcclxuICBfLnRpbWVzKCAyMCwgKCkgPT4ge1xyXG4gICAgZ2VuZXJhdGVkVGVzdCggYXNzZXJ0LCAyMCwgMTAsIDEwICk7XHJcbiAgfSApO1xyXG4gIF8udGltZXMoIDQsICgpID0+IHtcclxuICAgIGNvbnN0IHNpemUgPSAzMDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8PSBzaXplOyBpKysgKSB7XHJcbiAgICAgIGdlbmVyYXRlZFRlc3QoIGFzc2VydCwgc2l6ZSArIDUsIGksIHNpemUgLSBpICk7XHJcbiAgICB9XHJcbiAgfSApO1xyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSxzQkFBc0I7QUFDbEQsT0FBT0MsV0FBVyxNQUFNLGtCQUFrQjtBQUUxQ0MsS0FBSyxDQUFDQyxNQUFNLENBQUUsaUJBQWtCLENBQUM7QUFFakMsU0FBU0MsaUJBQWlCQSxDQUFFQyxNQUFNLEVBQUVDLENBQUMsRUFBRUMsQ0FBQyxFQUFFQyxhQUFhLEVBQUVDLGFB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