// Copyright 2018-2021, University of Colorado Boulder

/**
 * Tests for TermList.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Term from './Term.js';
import TermList from './TermList.js';
QUnit.module('TermList');
QUnit.test('Times', assert => {
  assert.ok(new TermList([new Term(3, 1),
  // 3x
  new Term(-2, 0) // -2
  ]).times(new TermList([new Term(2, 1),
  // 2x
  new Term(1, 0) // 1
  ])).equals(new TermList([new Term(6, 2),
  // 6x^2
  new Term(3, 1),
  // 3x
  new Term(-4, 1),
  // -4x
  new Term(-2, 0) // -2
  ])), 'Example multiplication');
});
QUnit.test('Ordering', assert => {
  assert.ok(new TermList([new Term(3, 2), new Term(1, 1), new Term(2, 0)]).orderedByExponent().equals(new TermList([new Term(3, 2), new Term(1, 1), new Term(2, 0)])), 'Ordering (no change)');
  assert.ok(new TermList([new Term(2, 0), new Term(1, 1), new Term(3, 2)]).orderedByExponent().equals(new TermList([new Term(3, 2), new Term(1, 1), new Term(2, 0)])), 'Ordering (reversed)');
});
QUnit.test('Negative test', assert => {
  assert.ok(!new TermList([new Term(3, 2), new Term(1, 1), new Term(2, 0)]).hasNegativeTerm(), 'No negative');
  assert.ok(new TermList([new Term(3, 2), new Term(1, 1), new Term(-2, 0)]).hasNegativeTerm(), 'Has negative');
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZXJtIiwiVGVybUxpc3QiLCJRVW5pdCIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJvayIsInRpbWVzIiwiZXF1YWxzIiwib3JkZXJlZEJ5RXhwb25lbnQiLCJoYXNOZWdhdGl2ZVRlcm0iXSwic291cmNlcyI6WyJUZXJtTGlzdFRlc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRlc3RzIGZvciBUZXJtTGlzdC5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBUZXJtIGZyb20gJy4vVGVybS5qcyc7XHJcbmltcG9ydCBUZXJtTGlzdCBmcm9tICcuL1Rlcm1MaXN0LmpzJztcclxuXHJcblFVbml0Lm1vZHVsZSggJ1Rlcm1MaXN0JyApO1xyXG5cclxuUVVuaXQudGVzdCggJ1RpbWVzJywgYXNzZXJ0ID0+IHtcclxuICBhc3NlcnQub2soIG5ldyBUZXJtTGlzdCggW1xyXG4gICAgbmV3IFRlcm0oIDMsIDEgKSwgLy8gM3hcclxuICAgIG5ldyBUZXJtKCAtMiwgMCApIC8vIC0yXHJcbiAgXSApLnRpbWVzKCBuZXcgVGVybUxpc3QoIFtcclxuICAgIG5ldyBUZXJtKCAyLCAxICksIC8vIDJ4XHJcbiAgICBuZXcgVGVybSggMSwgMCApIC8vIDFcclxuICBdICkgKS5lcXVhbHMoIG5ldyBUZXJtTGlzdCggW1xyXG4gICAgbmV3IFRlcm0oIDYsIDIgKSwgLy8gNnheMlxyXG4gICAgbmV3IFRlcm0oIDMsIDEgKSwgLy8gM3hcclxuICAgIG5ldyBUZXJtKCAtNCwgMSApLCAvLyAtNHhcclxuICAgIG5ldyBUZXJtKCAtMiwgMCApIC8vIC0yXHJcbiAgXSApICksICdFeGFtcGxlIG11bHRpcGxpY2F0aW9uJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnT3JkZXJpbmcnLCBhc3NlcnQgPT4ge1xyXG4gIGFzc2VydC5vayggbmV3IFRlcm1MaXN0KCBbXHJcbiAgICBuZXcgVGVybSggMywgMiApLFxyXG4gICAgbmV3IFRlcm0oIDEsIDEgKSxcclxuICAgIG5ldyBUZXJtKCAyLCAwIClcclxuICBdICkub3JkZXJlZEJ5RXhwb25lbnQoKS5lcXVhbHMoIG5ldyBUZXJtTGlzdCggW1xyXG4gICAgbmV3IFRlcm0oIDMsIDIgKSxcclxuICAgIG5ldyBUZXJtKCAxLCAxICksXHJcbiAgICBuZXcgVGVybSggMiwgMCApXHJcbiAgXSApICksICdPcmRlcmluZyAobm8gY2hhbmdlKScgKTtcclxuICBhc3NlcnQub2soIG5ldyBUZXJtTGlzdCggW1xyXG4gICAgbmV3IFRlcm0oIDIsIDAgKSxcclxuICAgIG5ldyBUZXJtKCAxLCAxICksXHJcbiAgICBuZXcgVGVybSggMywgMiApXHJcbiAgXSApLm9yZGVyZWRCeUV4cG9uZW50KCkuZXF1YWxzKCBuZXcgVGVybUxpc3QoIFtcclxuICAgIG5ldyBUZXJtKCAzLCAyICksXHJcbiAgICBuZXcgVGVybSggMSwgMSApLFxyXG4gICAgbmV3IFRlcm0oIDIsIDAgKVxyXG4gIF0gKSApLCAnT3JkZXJpbmcgKHJldmVyc2VkKScgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ05lZ2F0aXZlIHRlc3QnLCBhc3NlcnQgPT4ge1xyXG4gIGFzc2VydC5vayggIW5ldyBUZXJtTGlzdCggW1xyXG4gICAgbmV3IFRlcm0oIDMsIDIgKSxcclxuICAgIG5ldyBUZXJtKCAxLCAxICksXHJcbiAgICBuZXcgVGVybSggMiwgMCApXHJcbiAgXSApLmhhc05lZ2F0aXZlVGVybSgpLCAnTm8gbmVnYXRpdmUnICk7XHJcbiAgYXNzZXJ0Lm9rKCBuZXcgVGVybUxpc3QoIFtcclxuICAgIG5ldyBUZXJtKCAzLCAyICksXHJcbiAgICBuZXcgVGVybSggMSwgMSApLFxyXG4gICAgbmV3IFRlcm0oIC0yLCAwIClcclxu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