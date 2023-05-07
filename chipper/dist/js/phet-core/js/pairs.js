// Copyright 2014-2023, University of Colorado Boulder

/**
 * Creates an array of arrays, which consists of pairs of objects from the input array without duplication.
 *
 * For example, phet.phetCore.pairs( [ 'a', 'b', 'c' ] ) will return:
 * [ [ 'a', 'b' ], [ 'a', 'c' ], [ 'b', 'c' ] ]
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import phetCore from './phetCore.js';
function pairs(array) {
  const result = [];
  const length = array.length;
  if (length > 1) {
    for (let i = 0; i < length - 1; i++) {
      const first = array[i];
      for (let j = i + 1; j < length; j++) {
        result.push([first, array[j]]);
      }
    }
  }
  return result;
}
phetCore.register('pairs', pairs);
export default pairs;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwaGV0Q29yZSIsInBhaXJzIiwiYXJyYXkiLCJyZXN1bHQiLCJsZW5ndGgiLCJpIiwiZmlyc3QiLCJqIiwicHVzaCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsicGFpcnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiBhcnJheXMsIHdoaWNoIGNvbnNpc3RzIG9mIHBhaXJzIG9mIG9iamVjdHMgZnJvbSB0aGUgaW5wdXQgYXJyYXkgd2l0aG91dCBkdXBsaWNhdGlvbi5cclxuICpcclxuICogRm9yIGV4YW1wbGUsIHBoZXQucGhldENvcmUucGFpcnMoIFsgJ2EnLCAnYicsICdjJyBdICkgd2lsbCByZXR1cm46XHJcbiAqIFsgWyAnYScsICdiJyBdLCBbICdhJywgJ2MnIF0sIFsgJ2InLCAnYycgXSBdXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgcGhldENvcmUgZnJvbSAnLi9waGV0Q29yZS5qcyc7XHJcblxyXG5mdW5jdGlvbiBwYWlycyggYXJyYXkgKSB7XHJcbiAgY29uc3QgcmVzdWx0ID0gW107XHJcbiAgY29uc3QgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xyXG4gIGlmICggbGVuZ3RoID4gMSApIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxlbmd0aCAtIDE7IGkrKyApIHtcclxuICAgICAgY29uc3QgZmlyc3QgPSBhcnJheVsgaSBdO1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IGkgKyAxOyBqIDwgbGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgICAgcmVzdWx0LnB1c2goIFsgZmlyc3QsIGFycmF5WyBqIF0gXSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbnBoZXRDb3JlLnJlZ2lzdGVyKCAncGFpcnMnLCBwYWlycyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgcGFpcnM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxlQUFlO0FBRXBDLFNBQVNDLEtBQUtBLENBQUVDLEtBQUssRUFBRztFQUN0QixNQUFNQyxNQUFNLEdBQUcsRUFBRTtFQUNqQixNQUFNQyxNQUFNLEdBQUdGLEtBQUssQ0FBQ0UsTUFBTTtFQUMzQixJQUFLQSxNQUFNLEdBQUcsQ0FBQyxFQUFHO0lBQ2hCLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHRCxNQUFNLEdBQUcsQ0FBQyxFQUFFQyxDQUFDLEVBQUUsRUFBRztNQUNyQyxNQUFNQyxLQUFLLEdBQUdKLEtBQUssQ0FBRUcsQ0FBQyxDQUFFO01BQ3hCLEtBQU0sSUFBSUUsQ0FBQyxHQUFHRixDQUFDLEdBQUcsQ0FBQyxFQUFFRSxDQUFDLEdBQUdILE1BQU0sRUFBRUcsQ0FBQyxFQUFFLEVBQUc7UUFDckNKLE1BQU0sQ0FBQ0ssSUFBSSxDQUFFLENBQUVGLEtBQUssRUFBRUosS0FBSyxDQUFFSyxDQUFDLENBQUUsQ0FBRyxDQUFDO01BQ3RDO0lBQ0Y7RUFDRjtFQUNBLE9BQU9KLE1BQU07QUFDZjtBQUVBSCxRQUFRLENBQUNTLFFBQVEsQ0FBRSxPQUFPLEVBQUVSLEtBQU0sQ0FBQztBQUVuQyxlQUFlQSxLQUFLIn0=