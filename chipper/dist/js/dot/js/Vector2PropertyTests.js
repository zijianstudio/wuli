// Copyright 2019-2022, University of Colorado Boulder

/**
 * QUnit Tests for Vector2Property
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from './Bounds2.js';
import Vector2 from './Vector2.js';
import Vector2Property from './Vector2Property.js';
QUnit.module('Vector2Property');
QUnit.test('Vector2Property', assert => {
  let vectorProperty = null;

  // constructor value
  assert.ok(() => {
    vectorProperty = new Vector2Property(Vector2.ZERO);
  }, 'good constructor value');
  window.assert && assert.throws(() => {
    vectorProperty = new Vector2Property(true);
  }, 'bad constructor value');

  // set value
  assert.ok(() => {
    vectorProperty.set(new Vector2(1, 1));
  }, 'good set value');
  window.assert && assert.throws(() => {
    vectorProperty.set(5);
  }, 'bad set value');

  // validValues option
  assert.ok(() => {
    vectorProperty = new Vector2Property(Vector2.ZERO, {
      validValues: [Vector2.ZERO, new Vector2(1, 1)]
    });
  }, 'good validValues');
  window.assert && assert.throws(() => {
    vectorProperty = new Vector2Property(Vector2.ZERO, {
      validValues: [1, 2, 3]
    });
  }, 'bad validValues');

  // isValidValue option
  assert.ok(() => {
    vectorProperty = new Vector2Property(Vector2.ZERO, {
      isValidValue: value => value.x >= 0 && value.y <= 0
    });
  }, 'good isValidValue');
  window.assert && assert.throws(() => {
    vectorProperty = new Vector2Property(Vector2.ZERO, {
      isValidValue: value => typeof value === 'string'
    });
  }, 'bad isValidValue');
  assert.ok(true, 'so we have at least 1 test in this set');
});
QUnit.test('Vector2Property.validBounds', assert => {
  let vectorProperty = null;
  window.assert && assert.throws(() => {
    vectorProperty = new Vector2Property(Vector2.ZERO, {
      validBounds: 'fdsa'
    });
  }, 'validBounds as a string');
  window.assert && assert.throws(() => {
    vectorProperty = new Vector2Property(Vector2.ZERO, {
      validBounds: 543
    });
  }, 'validBounds as a string');
  vectorProperty = new Vector2Property(Vector2.ZERO, {
    validBounds: null
  });
  vectorProperty = new Vector2Property(Vector2.ZERO, {
    validBounds: Bounds2.EVERYTHING
  });
  const myBounds = new Bounds2(1, 1, 2, 2);
  window.assert && assert.throws(() => {
    vectorProperty = new Vector2Property(Vector2.ZERO, {
      validBounds: myBounds
    });
  }, 'starting value outside of validBounds');
  vectorProperty = new Vector2Property(new Vector2(1, 2), {
    validBounds: myBounds
  });
  assert.ok(vectorProperty.validBounds === myBounds, 'same Bounds2 reference');
  vectorProperty.value = new Vector2(1, 1);
  vectorProperty.value = new Vector2(1.5, 1.5);
  vectorProperty.value = new Vector2(2, 2);
  window.assert && assert.throws(() => {
    vectorProperty.value = new Vector2(10, 10);
  }, 'value outside of validBounds');
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiVmVjdG9yMiIsIlZlY3RvcjJQcm9wZXJ0eSIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsInZlY3RvclByb3BlcnR5Iiwib2siLCJaRVJPIiwid2luZG93IiwidGhyb3dzIiwic2V0IiwidmFsaWRWYWx1ZXMiLCJpc1ZhbGlkVmFsdWUiLCJ2YWx1ZSIsIngiLCJ5IiwidmFsaWRCb3VuZHMiLCJFVkVSWVRISU5HIiwibXlCb3VuZHMiXSwic291cmNlcyI6WyJWZWN0b3IyUHJvcGVydHlUZXN0cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBRVW5pdCBUZXN0cyBmb3IgVmVjdG9yMlByb3BlcnR5XHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuL1ZlY3RvcjJQcm9wZXJ0eS5qcyc7XHJcblxyXG5RVW5pdC5tb2R1bGUoICdWZWN0b3IyUHJvcGVydHknICk7XHJcblFVbml0LnRlc3QoICdWZWN0b3IyUHJvcGVydHknLCBhc3NlcnQgPT4ge1xyXG5cclxuICBsZXQgdmVjdG9yUHJvcGVydHkgPSBudWxsO1xyXG5cclxuICAvLyBjb25zdHJ1Y3RvciB2YWx1ZVxyXG4gIGFzc2VydC5vayggKCkgPT4ge1xyXG4gICAgdmVjdG9yUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBWZWN0b3IyLlpFUk8gKTtcclxuICB9LCAnZ29vZCBjb25zdHJ1Y3RvciB2YWx1ZScgKTtcclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuICAgIHZlY3RvclByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggdHJ1ZSApO1xyXG4gIH0sICdiYWQgY29uc3RydWN0b3IgdmFsdWUnICk7XHJcblxyXG4gIC8vIHNldCB2YWx1ZVxyXG4gIGFzc2VydC5vayggKCkgPT4ge1xyXG4gICAgdmVjdG9yUHJvcGVydHkuc2V0KCBuZXcgVmVjdG9yMiggMSwgMSApICk7XHJcbiAgfSwgJ2dvb2Qgc2V0IHZhbHVlJyApO1xyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG4gICAgdmVjdG9yUHJvcGVydHkuc2V0KCA1ICk7XHJcbiAgfSwgJ2JhZCBzZXQgdmFsdWUnICk7XHJcblxyXG4gIC8vIHZhbGlkVmFsdWVzIG9wdGlvblxyXG4gIGFzc2VydC5vayggKCkgPT4ge1xyXG4gICAgdmVjdG9yUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBWZWN0b3IyLlpFUk8sIHtcclxuICAgICAgdmFsaWRWYWx1ZXM6IFsgVmVjdG9yMi5aRVJPLCBuZXcgVmVjdG9yMiggMSwgMSApIF1cclxuICAgIH0gKTtcclxuICB9LCAnZ29vZCB2YWxpZFZhbHVlcycgKTtcclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuICAgIHZlY3RvclByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggVmVjdG9yMi5aRVJPLCB7XHJcbiAgICAgIHZhbGlkVmFsdWVzOiBbIDEsIDIsIDMgXVxyXG4gICAgfSApO1xyXG4gIH0sICdiYWQgdmFsaWRWYWx1ZXMnICk7XHJcblxyXG4gIC8vIGlzVmFsaWRWYWx1ZSBvcHRpb25cclxuICBhc3NlcnQub2soICgpID0+IHtcclxuICAgIHZlY3RvclByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggVmVjdG9yMi5aRVJPLCB7XHJcbiAgICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gKCB2YWx1ZS54ID49IDAgJiYgdmFsdWUueSA8PSAwIClcclxuICAgIH0gKTtcclxuICB9LCAnZ29vZCBpc1ZhbGlkVmFsdWUnICk7XHJcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XHJcbiAgICB2ZWN0b3JQcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIFZlY3RvcjIuWkVSTywge1xyXG4gICAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZydcclxuICAgIH0gKTtcclxuICB9LCAnYmFkIGlzVmFsaWRWYWx1ZScgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnc28gd2UgaGF2ZSBhdCBsZWFzdCAxIHRlc3QgaW4gdGhpcyBzZXQnICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdWZWN0b3IyUHJvcGVydHkudmFsaWRCb3VuZHMnLCBhc3NlcnQgPT4ge1xyXG4gIGxldCB2ZWN0b3JQcm9wZXJ0eSA9IG51bGw7XHJcblxyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG4gICAgdmVjdG9yUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBWZWN0b3IyLlpFUk8sIHtcclxuICAgICAgdmFsaWRCb3VuZHM6ICdmZHNhJ1xyXG4gICAgfSApO1xyXG4gIH0sICd2YWxpZEJvdW5kcyBhcyBhIHN0cmluZycgKTtcclxuXHJcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XHJcbiAgICB2ZWN0b3JQcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIFZlY3RvcjIuWkVSTywge1xyXG4gICAgICB2YWxpZEJvdW5kczogNTQzXHJcbiAgICB9ICk7XHJcbiAgfSwgJ3ZhbGlkQm91bmRzIGFzIGEgc3RyaW5nJyApO1xyXG5cclxuICB2ZWN0b3JQcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIFZlY3RvcjIuWkVSTywge1xyXG4gICAgdmFsaWRCb3VuZHM6IG51bGxcclxuICB9ICk7XHJcblxyXG4gIHZlY3RvclByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggVmVjdG9yMi5aRVJPLCB7XHJcbiAgICB2YWxpZEJvdW5kczogQm91bmRzMi5FVkVSWVRISU5HXHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBteUJvdW5kcyA9IG5ldyBCb3VuZHMyKCAxLCAxLCAyLCAyICk7XHJcblxyXG5cclxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuICAgIHZlY3RvclByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggVmVjdG9yMi5aRVJPLCB7XHJcbiAgICAgIHZhbGlkQm91bmRzOiBteUJvdW5kc1xyXG4gICAgfSApO1xyXG4gIH0sICdzdGFydGluZyB2YWx1ZSBvdXRzaWRlIG9mIHZhbGlkQm91bmRzJyApO1xyXG5cclxuICB2ZWN0b3JQcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIG5ldyBWZWN0b3IyKCAxLCAyICksIHtcclxuICAgIHZhbGlkQm91bmRzOiBteUJvdW5kc1xyXG4gIH0gKTtcclxuICBhc3NlcnQub2soIHZlY3RvclByb3BlcnR5LnZhbGlkQm91bmRzID09PSBteUJvdW5kcywgJ3NhbWUgQm91bmRzMiByZWZlcmVuY2UnICk7XHJcblxyXG4gIHZlY3RvclByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjIoIDEsIDEgKTtcclxuICB2ZWN0b3JQcm9wZXJ0eS52YWx1ZSA9IG5ldyBWZWN0b3IyKCAxLjUsIDEuNSApO1xyXG4gIHZlY3RvclByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjIoIDIsIDIgKTtcclxuXHJcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XHJcbiAgICB2ZWN0b3JQcm9wZXJ0eS52YWx1ZSA9IG5ldyBWZWN0b3IyKCAxMCwgMTAgKTtcclxuICB9LCAndmFsdWUgb3V0c2lkZSBvZiB2YWxpZEJvdW5kcycgKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtB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