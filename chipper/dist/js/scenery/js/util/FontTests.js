// Copyright 2018-2020, University of Colorado Boulder

/**
 * Font tests
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Font from './Font.js';
QUnit.module('Font');
QUnit.test('Font.fromCSS', assert => {
  const font1 = Font.fromCSS('italic 1.2em "Fira Sans", sans-serif');
  assert.equal(font1.style, 'italic');
  assert.equal(font1.size, '1.2em');
  assert.equal(font1.family, '"Fira Sans", sans-serif');
  const font2 = Font.fromCSS('italic small-caps bold 16px/2 cursive');
  assert.equal(font2.style, 'italic');
  assert.equal(font2.variant, 'small-caps');
  assert.equal(font2.weight, 'bold');
  assert.equal(font2.size, '16px');
  assert.equal(font2.lineHeight, '2');
  assert.equal(font2.family, 'cursive');
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb250IiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0IiwiZm9udDEiLCJmcm9tQ1NTIiwiZXF1YWwiLCJzdHlsZSIsInNpemUiLCJmYW1pbHkiLCJmb250MiIsInZhcmlhbnQiLCJ3ZWlnaHQiLCJsaW5lSGVpZ2h0Il0sInNvdXJjZXMiOlsiRm9udFRlc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEZvbnQgdGVzdHNcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBGb250IGZyb20gJy4vRm9udC5qcyc7XHJcblxyXG5RVW5pdC5tb2R1bGUoICdGb250JyApO1xyXG5cclxuUVVuaXQudGVzdCggJ0ZvbnQuZnJvbUNTUycsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgZm9udDEgPSBGb250LmZyb21DU1MoICdpdGFsaWMgMS4yZW0gXCJGaXJhIFNhbnNcIiwgc2Fucy1zZXJpZicgKTtcclxuICBhc3NlcnQuZXF1YWwoIGZvbnQxLnN0eWxlLCAnaXRhbGljJyApO1xyXG4gIGFzc2VydC5lcXVhbCggZm9udDEuc2l6ZSwgJzEuMmVtJyApO1xyXG4gIGFzc2VydC5lcXVhbCggZm9udDEuZmFtaWx5LCAnXCJGaXJhIFNhbnNcIiwgc2Fucy1zZXJpZicgKTtcclxuXHJcbiAgY29uc3QgZm9udDIgPSBGb250LmZyb21DU1MoICdpdGFsaWMgc21hbGwtY2FwcyBib2xkIDE2cHgvMiBjdXJzaXZlJyApO1xyXG4gIGFzc2VydC5lcXVhbCggZm9udDIuc3R5bGUsICdpdGFsaWMnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBmb250Mi52YXJpYW50LCAnc21hbGwtY2FwcycgKTtcclxuICBhc3NlcnQuZXF1YWwoIGZvbnQyLndlaWdodCwgJ2JvbGQnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBmb250Mi5zaXplLCAnMTZweCcgKTtcclxuICBhc3NlcnQuZXF1YWwoIGZvbnQyLmxpbmVIZWlnaHQsICcyJyApO1xyXG4gIGFzc2VydC5lcXVhbCggZm9udDIuZmFtaWx5LCAnY3Vyc2l2ZScgKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxJQUFJLE1BQU0sV0FBVztBQUU1QkMsS0FBSyxDQUFDQyxNQUFNLENBQUUsTUFBTyxDQUFDO0FBRXRCRCxLQUFLLENBQUNFLElBQUksQ0FBRSxjQUFjLEVBQUVDLE1BQU0sSUFBSTtFQUNwQyxNQUFNQyxLQUFLLEdBQUdMLElBQUksQ0FBQ00sT0FBTyxDQUFFLHNDQUF1QyxDQUFDO0VBQ3BFRixNQUFNLENBQUNHLEtBQUssQ0FBRUYsS0FBSyxDQUFDRyxLQUFLLEVBQUUsUUFBUyxDQUFDO0VBQ3JDSixNQUFNLENBQUNHLEtBQUssQ0FBRUYsS0FBSyxDQUFDSSxJQUFJLEVBQUUsT0FBUSxDQUFDO0VBQ25DTCxNQUFNLENBQUNHLEtBQUssQ0FBRUYsS0FBSyxDQUFDSyxNQUFNLEVBQUUseUJBQTBCLENBQUM7RUFFdkQsTUFBTUMsS0FBSyxHQUFHWCxJQUFJLENBQUNNLE9BQU8sQ0FBRSx1Q0FBd0MsQ0FBQztFQUNyRUYsTUFBTSxDQUFDRyxLQUFLLENBQUVJLEtBQUssQ0FBQ0gsS0FBSyxFQUFFLFFBQVMsQ0FBQztFQUNyQ0osTUFBTSxDQUFDRyxLQUFLLENBQUVJLEtBQUssQ0FBQ0MsT0FBTyxFQUFFLFlBQWEsQ0FBQztFQUMzQ1IsTUFBTSxDQUFDRyxLQUFLLENBQUVJLEtBQUssQ0FBQ0UsTUFBTSxFQUFFLE1BQU8sQ0FBQztFQUNwQ1QsTUFBTSxDQUFDRyxLQUFLLENBQUVJLEtBQUssQ0FBQ0YsSUFBSSxFQUFFLE1BQU8sQ0FBQztFQUNsQ0wsTUFBTSxDQUFDRyxLQUFLLENBQUVJLEtBQUssQ0FBQ0csVUFBVSxFQUFFLEdBQUksQ0FBQztFQUNyQ1YsTUFBTSxDQUFDRyxLQUFLLENBQUVJLEtBQUssQ0FBQ0QsTUFBTSxFQUFFLFNBQVUsQ0FBQztBQUN6QyxDQUFFLENBQUMifQ==