// Copyright 2018-2023, University of Colorado Boulder

/**
 * OpenRange tests
 *
 * @author Michael Barlow (PhET Interactive Simulations)
 */

import OpenRange from './OpenRange.js';
import Range from './Range.js';
const minHalfOpenOptions = {
  openMax: false
};
const maxHalfOpenOptions = {
  openMin: false
};
QUnit.module('OpenRange');
QUnit.test('half open min', assert => {
  const testMinOpenRange = new OpenRange(1, 10, minHalfOpenOptions);
  assert.notOk(testMinOpenRange.contains(1), '(1, 10] does not contain 1');
  assert.notOk(testMinOpenRange.intersects(new Range(0, 1)), '(1, 10] does not intersect [0, 1]');
  assert.notOk(testMinOpenRange.containsRange(new Range(1, 2), '(1, 10] does not contain [1, 2]'));
  assert.ok(testMinOpenRange.contains(1.000000001), '(1, 10] contains 1.000000001');
  assert.ok(testMinOpenRange.intersects(new Range(0, 1.000000001)), '(1, 10] intersects [0, 1.000000001]');
  assert.ok(testMinOpenRange.containsRange(new Range(1.000000001, 2)), '(1, 10] contains [1.000000001, 2]');
});
QUnit.test('half open max', assert => {
  const maxOpenRange = new OpenRange(1, 10, maxHalfOpenOptions);
  assert.notOk(maxOpenRange.contains(10), '[1, 10) does not contain 10');
  assert.notOk(maxOpenRange.intersects(new Range(10, 11)), '[1, 10) does not intersect [10,11]');
  assert.notOk(maxOpenRange.containsRange(new Range(9, 10), '[1, 10) does not contain [9, 10]'));
  assert.ok(maxOpenRange.contains(9.999999999), '[1, 10) contains 9.999999999');
  assert.ok(maxOpenRange.intersects(new Range(9.999999999, 11)), '[1, 10) intersects [9.999999999, 11]');
  assert.ok(maxOpenRange.containsRange(new Range(9, 9.999999999)), '[1, 10) contains [9, 9.999999999]');
});
QUnit.test('fully open range', assert => {
  const openRange = new OpenRange(1, 10);
  assert.notOk(openRange.contains(1), '(1, 10) does not contain 1');
  assert.notOk(openRange.contains(10), '(1, 10) does not contain 10');
  assert.notOk(openRange.intersects(new Range(0, 1)), '(1, 10) does not intersect [0, 1]');
  assert.notOk(openRange.intersects(new Range(10, 11)), '(1, 10) does not intersect [10,11]');
  assert.notOk(openRange.containsRange(new Range(9, 10), '(1, 10) does not contain [9, 10]'));
  assert.notOk(openRange.containsRange(new Range(1, 2), '(1, 10) does not contain [1, 2]'));
  assert.ok(openRange.contains(1.000000001), '(1, 10) contains 1.000000001');
  assert.ok(openRange.contains(9.999999999), '(1, 10) contains 9.999999999');
  assert.ok(openRange.intersects(new Range(0, 1.000000001)), '(1, 10) intersects [0, 1.000000001]');
  assert.ok(openRange.intersects(new Range(9.999999999, 11)), '(1, 10) intersects [9.999999999, 11]');
  assert.ok(openRange.containsRange(new Range(9, 9.999999999)), '(1, 10) contains [9, 9.999999999]');
  assert.ok(openRange.containsRange(new Range(1.000000001, 2)), '(1, 10) contains [1.000000001, 2]');
});
QUnit.test('setter overrides', assert => {
  let openRange = new OpenRange(1, 10);
  assert.notOk(openRange.setMin(2), 'can set min < max');
  window.assert && assert.throws(() => {
    openRange.setMin(10);
  }, 'cannot set min = max in OpenRange');
  openRange = new OpenRange(1, 10);
  assert.notOk(openRange.setMax(2), 'can set max > min');
  window.assert && assert.throws(() => {
    openRange.setMax(1);
  }, 'cannot set min = max in OpenRange');
});
QUnit.test('assertion failures', assert => {
  if (window.assert) {
    assert.throws(() => new OpenRange(1, 10, {
      openMin: false,
      openMax: false
    }), 'include both min and max throws an error');
    assert.throws(() => new OpenRange(1, 1, minHalfOpenOptions), 'min open range with min === max throws an error');
    assert.throws(() => new OpenRange(1, 1, maxHalfOpenOptions), 'max open range with min === max throws an error');
    assert.throws(() => new OpenRange(1, 1), 'full open range with min === max throws an error');
    let range = new OpenRange(1, 10);
    assert.throws(() => {
      range.setMin(10);
    }, 'setting min equal to max throws an error');
    range = new OpenRange(1, 10);
    assert.throws(() => {
      range.setMin(11);
    }, 'setting min greater than max throws an error');
    range = new OpenRange(1, 10);
    assert.throws(() => {
      range.setMax(1);
    }, 'setting max equal to min throws an error');
    range = new OpenRange(1, 10);
    assert.throws(() => {
      range.setMax(0);
    }, 'setting max less than min throws an error');
  }
  assert.ok(true);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPcGVuUmFuZ2UiLCJSYW5nZSIsIm1pbkhhbGZPcGVuT3B0aW9ucyIsIm9wZW5NYXgiLCJtYXhIYWxmT3Blbk9wdGlvbnMiLCJvcGVuTWluIiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0IiwidGVzdE1pbk9wZW5SYW5nZSIsIm5vdE9rIiwiY29udGFpbnMiLCJpbnRlcnNlY3RzIiwiY29udGFpbnNSYW5nZSIsIm9rIiwibWF4T3BlblJhbmdlIiwib3BlblJhbmdlIiwic2V0TWluIiwid2luZG93IiwidGhyb3dzIiwic2V0TWF4IiwicmFuZ2UiXSwic291cmNlcyI6WyJPcGVuUmFuZ2VUZXN0cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBPcGVuUmFuZ2UgdGVzdHNcclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIEJhcmxvdyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgT3BlblJhbmdlIGZyb20gJy4vT3BlblJhbmdlLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4vUmFuZ2UuanMnO1xyXG5cclxuY29uc3QgbWluSGFsZk9wZW5PcHRpb25zID0geyBvcGVuTWF4OiBmYWxzZSB9O1xyXG5jb25zdCBtYXhIYWxmT3Blbk9wdGlvbnMgPSB7IG9wZW5NaW46IGZhbHNlIH07XHJcblxyXG5RVW5pdC5tb2R1bGUoICdPcGVuUmFuZ2UnICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnaGFsZiBvcGVuIG1pbicsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgdGVzdE1pbk9wZW5SYW5nZSA9IG5ldyBPcGVuUmFuZ2UoIDEsIDEwLCBtaW5IYWxmT3Blbk9wdGlvbnMgKTtcclxuICBhc3NlcnQubm90T2soIHRlc3RNaW5PcGVuUmFuZ2UuY29udGFpbnMoIDEgKSwgJygxLCAxMF0gZG9lcyBub3QgY29udGFpbiAxJyApO1xyXG4gIGFzc2VydC5ub3RPayggdGVzdE1pbk9wZW5SYW5nZS5pbnRlcnNlY3RzKCBuZXcgUmFuZ2UoIDAsIDEgKSApLCAnKDEsIDEwXSBkb2VzIG5vdCBpbnRlcnNlY3QgWzAsIDFdJyApO1xyXG4gIGFzc2VydC5ub3RPayggdGVzdE1pbk9wZW5SYW5nZS5jb250YWluc1JhbmdlKCBuZXcgUmFuZ2UoIDEsIDIgKSwgJygxLCAxMF0gZG9lcyBub3QgY29udGFpbiBbMSwgMl0nICkgKTtcclxuICBhc3NlcnQub2soIHRlc3RNaW5PcGVuUmFuZ2UuY29udGFpbnMoIDEuMDAwMDAwMDAxICksICcoMSwgMTBdIGNvbnRhaW5zIDEuMDAwMDAwMDAxJyApO1xyXG4gIGFzc2VydC5vayggdGVzdE1pbk9wZW5SYW5nZS5pbnRlcnNlY3RzKCBuZXcgUmFuZ2UoIDAsIDEuMDAwMDAwMDAxICkgKSwgJygxLCAxMF0gaW50ZXJzZWN0cyBbMCwgMS4wMDAwMDAwMDFdJyApO1xyXG4gIGFzc2VydC5vayggdGVzdE1pbk9wZW5SYW5nZS5jb250YWluc1JhbmdlKCBuZXcgUmFuZ2UoIDEuMDAwMDAwMDAxLCAyICkgKSwgJygxLCAxMF0gY29udGFpbnMgWzEuMDAwMDAwMDAxLCAyXScgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ2hhbGYgb3BlbiBtYXgnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IG1heE9wZW5SYW5nZSA9IG5ldyBPcGVuUmFuZ2UoIDEsIDEwLCBtYXhIYWxmT3Blbk9wdGlvbnMgKTtcclxuICBhc3NlcnQubm90T2soIG1heE9wZW5SYW5nZS5jb250YWlucyggMTAgKSwgJ1sxLCAxMCkgZG9lcyBub3QgY29udGFpbiAxMCcgKTtcclxuICBhc3NlcnQubm90T2soIG1heE9wZW5SYW5nZS5pbnRlcnNlY3RzKCBuZXcgUmFuZ2UoIDEwLCAxMSApICksICdbMSwgMTApIGRvZXMgbm90IGludGVyc2VjdCBbMTAsMTFdJyApO1xyXG4gIGFzc2VydC5ub3RPayggbWF4T3BlblJhbmdlLmNvbnRhaW5zUmFuZ2UoIG5ldyBSYW5nZSggOSwgMTAgKSwgJ1sxLCAxMCkgZG9lcyBub3QgY29udGFpbiBbOSwgMTBdJyApICk7XHJcbiAgYXNzZXJ0Lm9rKCBtYXhPcGVuUmFuZ2UuY29udGFpbnMoIDkuOTk5OTk5OTk5ICksICdbMSwgMTApIGNvbnRhaW5zIDkuOTk5OTk5OTk5JyApO1xyXG4gIGFzc2VydC5vayggbWF4T3BlblJhbmdlLmludGVyc2VjdHMoIG5ldyBSYW5nZSggOS45OTk5OTk5OTksIDExICkgKSwgJ1sxLCAxMCkgaW50ZXJzZWN0cyBbOS45OTk5OTk5OTksIDExXScgKTtcclxuICBhc3NlcnQub2soIG1heE9wZW5SYW5nZS5jb250YWluc1JhbmdlKCBuZXcgUmFuZ2UoIDksIDkuOTk5OTk5OTk5ICkgKSwgJ1sxLCAxMCkgY29udGFpbnMgWzksIDkuOTk5OTk5OTk5XScgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ2Z1bGx5IG9wZW4gcmFuZ2UnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IG9wZW5SYW5nZSA9IG5ldyBPcGVuUmFuZ2UoIDEsIDEwICk7XHJcbiAgYXNzZXJ0Lm5vdE9rKCBvcGVuUmFuZ2UuY29udGFpbnMoIDEgKSwgJygxLCAxMCkgZG9lcyBub3QgY29udGFpbiAxJyApO1xyXG4gIGFzc2VydC5ub3RPayggb3BlblJhbmdlLmNvbnRhaW5zKCAxMCApLCAnKDEsIDEwKSBkb2VzIG5vdCBjb250YWluIDEwJyApO1xyXG4gIGFzc2VydC5ub3RPayggb3BlblJhbmdlLmludGVyc2VjdHMoIG5ldyBSYW5nZSggMCwgMSApICksICcoMSwgMTApIGRvZXMgbm90IGludGVyc2VjdCBbMCwgMV0nICk7XHJcbiAgYXNzZXJ0Lm5vdE9rKCBvcGVuUmFuZ2UuaW50ZXJzZWN0cyggbmV3IFJhbmdlKCAxMCwgMTEgKSApLCAnKDEsIDEwKSBkb2VzIG5vdCBpbnRlcnNlY3QgWzEwLDExXScgKTtcclxuICBhc3NlcnQubm90T2soIG9wZW5SYW5nZS5jb250YWluc1JhbmdlKCBuZXcgUmFuZ2UoIDksIDEwICksICcoMSwgMTApIGRvZXMgbm90IGNvbnRhaW4gWzksIDEwXScgKSApO1xyXG4gIGFzc2VydC5ub3RPayggb3BlblJhbmdlLmNvbnRhaW5zUmFuZ2UoIG5ldyBSYW5nZSggMSwgMiApLCAnKDEsIDEwKSBkb2VzIG5vdCBjb250YWluIFsxLCAyXScgKSApO1xyXG4gIGFzc2VydC5vayggb3BlblJhbmdlLmNvbnRhaW5zKCAxLjAwMDAwMDAwMSApLCAnKDEsIDEwKSBjb250YWlucyAxLjAwMDAwMDAwMScgKTtcclxuICBhc3NlcnQub2soIG9wZW5SYW5nZS5jb250YWlucyggOS45OTk5OTk5OTkgKSwgJygxLCAxMCkgY29udGFpbnMgOS45OTk5OTk5OTknICk7XHJcbiAgYXNzZXJ0Lm9rKCBvcGVuUmFuZ2UuaW50ZXJzZWN0cyggbmV3IFJhbmdlKCAwLCAxLjAwMDAwMDAwMSApICksICcoMSwgMTApIGludGVyc2VjdHMgWzAsIDEuMDAwMDAwMDAxXScgKTtcclxuICBhc3NlcnQub2soIG9wZW5SYW5nZS5pbnRlcnNlY3RzKCBuZXcgUmFuZ2UoIDkuOTk5OTk5OTk5LCAxMSApICksICcoMSwgMTApIGludGVyc2VjdHMgWzkuOTk5OTk5OTk5LCAxMV0nICk7XHJcbiAgYXNzZXJ0Lm9rKCBvcGVuUmFuZ2UuY29udGFpbnNSYW5nZSggbmV3IFJhbmdlKCA5LCA5Ljk5OTk5OTk5OSApICksICcoMSwgMTApIGNvbnRhaW5zIFs5LCA5Ljk5OTk5OTk5OV0nICk7XHJcbiAgYXNzZXJ0Lm9rKCBvcGVuUmFuZ2UuY29udGFpbnNSYW5nZSggbmV3IFJhbmdlKCAxLjAwMDAwMDAwMSwgMiApICksICcoMSwgMTApIGNvbnRhaW5zIFsxLjAwMDAwMDAwMSwgMl0nICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdzZXR0ZXIgb3ZlcnJpZGVzJywgYXNzZXJ0ID0+IHtcclxuICBsZXQgb3BlblJhbmdlID0gbmV3IE9wZW5SYW5nZSggMSwgMTAgKTtcclxuICBhc3NlcnQubm90T2soIG9wZW5SYW5nZS5zZXRNaW4oIDIgKSwgJ2NhbiBzZXQgbWluIDwgbWF4JyApO1xyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4geyBvcGVuUmFuZ2Uuc2V0TWluKCAxMCApOyB9LCAnY2Fubm90IHNldCBtaW4gPSBtYXggaW4gT3BlblJhbmdlJyApO1xyXG4gIG9wZW5SYW5nZSA9IG5ldyBPcGVuUmFuZ2UoIDEsIDEwICk7XHJcbiAgYXNzZXJ0Lm5vdE9rKCBvcGVuUmFuZ2Uuc2V0TWF4KCAyICksICdjYW4gc2V0IG1heCA+IG1pbicgKTtcclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHsgb3BlblJhbmdlLnNldE1heCggMSApOyB9LCAnY2Fubm90IHNldCBtaW4gPSBtYXggaW4gT3BlblJhbmdlJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnYXNzZXJ0aW9uIGZhaWx1cmVzJywgYXNzZXJ0ID0+IHtcclxuICBpZiAoIHdpbmRvdy5hc3NlcnQgKSB7XHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBuZXcgT3BlblJhbmdlKCAxLCAxMCwge1xyXG4gICAgICBvcGVuTWluOiBmYWxzZSxcclxuICAgICAgb3Blbk1heDogZmFsc2VcclxuICAgIH0gKSwgJ2luY2x1ZGUgYm90aCBtaW4gYW5kIG1heCB0aHJvd3MgYW4gZXJyb3InICk7XHJcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBuZXcgT3BlblJhbmdlKCAxLCAxLCBtaW5IYWxmT3Blbk9wdGlvbnMgKSwgJ21pbiBvcGVuIHJhbmdlIHdpdGggbWluID09PSBtYXggdGhyb3dzIGFuIGVycm9yJyApO1xyXG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbmV3IE9wZW5SYW5nZSggMSwgMSwgbWF4SGFsZk9wZW5PcHRpb25zICksICdtYXggb3BlbiByYW5nZSB3aXRoIG1pbiA9PT0gbWF4IHRocm93cyBhbiBlcnJvcicgKTtcclxuICAgIGFzc2VydC50aHJvd3MoICgpID0+IG5ldyBPcGVuUmFuZ2UoIDEsIDEgKSwgJ2Z1bGwgb3BlbiByYW5nZSB3aXRoIG1pbiA9PT0gbWF4IHRocm93cyBhbiBlcnJvcicgKTtcclxuXHJcbiAgICBsZXQgcmFuZ2UgPSBuZXcgT3BlblJhbmdlKCAxLCAxMCApO1xyXG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4geyByYW5nZS5zZXRNaW4oIDEwICk7IH0sICdzZXR0aW5nIG1pbiBlcXVhbCB0byBtYXggdGhyb3dzIGFuIGVycm9yJyApO1xyXG4gICAgcmFuZ2UgPSBuZXcgT3BlblJhbmdlKCAxLCAxMCApO1xyXG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4geyByYW5nZS5zZXRNaW4oIDExICk7IH0sICdzZXR0aW5nIG1pbiBncmVhdGVyIHRoYW4gbWF4IHRocm93cyBhbiBlcnJvcicgKTtcclxuICAgIHJhbmdlID0gbmV3IE9wZW5SYW5nZSggMSwgMTAgKTtcclxuICAgIGFzc2VydC50aHJvd3MoICgpID0+IHsgcmFuZ2Uuc2V0TWF4KCAxICk7IH0sICdzZXR0aW5nIG1heCBlcXVhbCB0byBtaW4gdGhyb3dzIGFuIGVycm9yJyApO1xyXG4gICAgcmFuZ2UgPSBuZXcgT3BlblJhbmdlKCAxLCAxMCApO1xyXG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4geyByYW5nZS5zZXRNYXgoIDAgKTsgfSwgJ3NldHRpbmcgbWF4IGxlc3MgdGhhbiBtaW4gdGhyb3dzIGFuIGVycm9yJyApO1xyXG4gIH1cclxuICBhc3NlcnQub2soIHRydWUgKTtcclxufSApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGdCQUFnQjtBQUN0QyxPQUFPQyxLQUFLLE1BQU0sWUFBWTtBQUU5QixNQUFNQyxrQkFBa0IsR0FBRztFQUFFQyxPQUFPLEVBQUU7QUFBTSxDQUFDO0FBQzdDLE1BQU1DLGtCQUFrQixHQUFHO0VBQUVDLE9BQU8sRUFBRTtBQUFNLENBQUM7QUFFN0NDLEtB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