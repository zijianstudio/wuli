// Copyright 2017-2021, University of Colorado Boulder

/**
 *
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import scenery from '../scenery.js';
function snapshotToCanvas(snapshot) {
  const canvas = document.createElement('canvas');
  canvas.width = snapshot.width;
  canvas.height = snapshot.height;
  const context = canvas.getContext('2d');
  context.putImageData(snapshot, 0, 0);
  $(canvas).css('border', '1px solid black');
  return canvas;
}

// TODO: factor out
// compares two pixel snapshots {ImageData} and uses the qunit's assert to verify they are the same
function snapshotEquals(assert, a, b, threshold, message, extraDom) {
  let isEqual = a.width === b.width && a.height === b.height;
  let largestDifference = 0;
  let totalDifference = 0;
  const colorDiffData = document.createElement('canvas').getContext('2d').createImageData(a.width, a.height);
  const alphaDiffData = document.createElement('canvas').getContext('2d').createImageData(a.width, a.height);
  if (isEqual) {
    for (let i = 0; i < a.data.length; i++) {
      const diff = Math.abs(a.data[i] - b.data[i]);
      if (i % 4 === 3) {
        colorDiffData.data[i] = 255;
        alphaDiffData.data[i] = 255;
        alphaDiffData.data[i - 3] = diff; // red
        alphaDiffData.data[i - 2] = diff; // green
        alphaDiffData.data[i - 1] = diff; // blue
      } else {
        colorDiffData.data[i] = diff;
      }
      const alphaIndex = i - i % 4 + 3;
      // grab the associated alpha channel and multiply it times the diff
      const alphaMultipliedDiff = i % 4 === 3 ? diff : diff * (a.data[alphaIndex] / 255) * (b.data[alphaIndex] / 255);
      totalDifference += alphaMultipliedDiff;
      // if ( alphaMultipliedDiff > threshold ) {
      // console.log( message + ': ' + Math.abs( a.data[i] - b.data[i] ) );
      largestDifference = Math.max(largestDifference, alphaMultipliedDiff);
      // isEqual = false;
      // break;
      // }
    }
  }

  const averageDifference = totalDifference / (4 * a.width * a.height);
  if (averageDifference > threshold) {
    const display = $('#display');
    // header
    const note = document.createElement('h2');
    $(note).text(message);
    display.append(note);
    const differenceDiv = document.createElement('div');
    $(differenceDiv).text(`(actual) (expected) (color diff) (alpha diff) Diffs max: ${largestDifference}, average: ${averageDifference}`);
    display.append(differenceDiv);
    display.append(snapshotToCanvas(a));
    display.append(snapshotToCanvas(b));
    display.append(snapshotToCanvas(colorDiffData));
    display.append(snapshotToCanvas(alphaDiffData));
    if (extraDom) {
      display.append(extraDom);
    }

    // for a line-break
    display.append(document.createElement('div'));
    isEqual = false;
  }
  assert.ok(isEqual, message);
  return isEqual;
}
scenery.register('snapshotEquals', snapshotEquals);
export default snapshotEquals;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzY2VuZXJ5Iiwic25hcHNob3RUb0NhbnZhcyIsInNuYXBzaG90IiwiY2FudmFzIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwid2lkdGgiLCJoZWlnaHQiLCJjb250ZXh0IiwiZ2V0Q29udGV4dCIsInB1dEltYWdlRGF0YSIsIiQiLCJjc3MiLCJzbmFwc2hvdEVxdWFscyIsImFzc2VydCIsImEiLCJiIiwidGhyZXNob2xkIiwibWVzc2FnZSIsImV4dHJhRG9tIiwiaXNFcXVhbCIsImxhcmdlc3REaWZmZXJlbmNlIiwidG90YWxEaWZmZXJlbmNlIiwiY29sb3JEaWZmRGF0YSIsImNyZWF0ZUltYWdlRGF0YSIsImFscGhhRGlmZkRhdGEiLCJpIiwiZGF0YSIsImxlbmd0aCIsImRpZmYiLCJNYXRoIiwiYWJzIiwiYWxwaGFJbmRleCIsImFscGhhTXVsdGlwbGllZERpZmYiLCJtYXgiLCJhdmVyYWdlRGlmZmVyZW5jZSIsImRpc3BsYXkiLCJub3RlIiwidGV4dCIsImFwcGVuZCIsImRpZmZlcmVuY2VEaXYiLCJvayIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsic25hcHNob3RFcXVhbHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICpcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgc2NlbmVyeSBmcm9tICcuLi9zY2VuZXJ5LmpzJztcclxuXHJcbmZ1bmN0aW9uIHNuYXBzaG90VG9DYW52YXMoIHNuYXBzaG90ICkge1xyXG5cclxuICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4gIGNhbnZhcy53aWR0aCA9IHNuYXBzaG90LndpZHRoO1xyXG4gIGNhbnZhcy5oZWlnaHQgPSBzbmFwc2hvdC5oZWlnaHQ7XHJcbiAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XHJcbiAgY29udGV4dC5wdXRJbWFnZURhdGEoIHNuYXBzaG90LCAwLCAwICk7XHJcbiAgJCggY2FudmFzICkuY3NzKCAnYm9yZGVyJywgJzFweCBzb2xpZCBibGFjaycgKTtcclxuICByZXR1cm4gY2FudmFzO1xyXG59XHJcblxyXG4vLyBUT0RPOiBmYWN0b3Igb3V0XHJcbi8vIGNvbXBhcmVzIHR3byBwaXhlbCBzbmFwc2hvdHMge0ltYWdlRGF0YX0gYW5kIHVzZXMgdGhlIHF1bml0J3MgYXNzZXJ0IHRvIHZlcmlmeSB0aGV5IGFyZSB0aGUgc2FtZVxyXG5mdW5jdGlvbiBzbmFwc2hvdEVxdWFscyggYXNzZXJ0LCBhLCBiLCB0aHJlc2hvbGQsIG1lc3NhZ2UsIGV4dHJhRG9tICkge1xyXG5cclxuICBsZXQgaXNFcXVhbCA9IGEud2lkdGggPT09IGIud2lkdGggJiYgYS5oZWlnaHQgPT09IGIuaGVpZ2h0O1xyXG4gIGxldCBsYXJnZXN0RGlmZmVyZW5jZSA9IDA7XHJcbiAgbGV0IHRvdGFsRGlmZmVyZW5jZSA9IDA7XHJcbiAgY29uc3QgY29sb3JEaWZmRGF0YSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICkuZ2V0Q29udGV4dCggJzJkJyApLmNyZWF0ZUltYWdlRGF0YSggYS53aWR0aCwgYS5oZWlnaHQgKTtcclxuICBjb25zdCBhbHBoYURpZmZEYXRhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKS5nZXRDb250ZXh0KCAnMmQnICkuY3JlYXRlSW1hZ2VEYXRhKCBhLndpZHRoLCBhLmhlaWdodCApO1xyXG4gIGlmICggaXNFcXVhbCApIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGEuZGF0YS5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgZGlmZiA9IE1hdGguYWJzKCBhLmRhdGFbIGkgXSAtIGIuZGF0YVsgaSBdICk7XHJcbiAgICAgIGlmICggaSAlIDQgPT09IDMgKSB7XHJcbiAgICAgICAgY29sb3JEaWZmRGF0YS5kYXRhWyBpIF0gPSAyNTU7XHJcbiAgICAgICAgYWxwaGFEaWZmRGF0YS5kYXRhWyBpIF0gPSAyNTU7XHJcbiAgICAgICAgYWxwaGFEaWZmRGF0YS5kYXRhWyBpIC0gMyBdID0gZGlmZjsgLy8gcmVkXHJcbiAgICAgICAgYWxwaGFEaWZmRGF0YS5kYXRhWyBpIC0gMiBdID0gZGlmZjsgLy8gZ3JlZW5cclxuICAgICAgICBhbHBoYURpZmZEYXRhLmRhdGFbIGkgLSAxIF0gPSBkaWZmOyAvLyBibHVlXHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgY29sb3JEaWZmRGF0YS5kYXRhWyBpIF0gPSBkaWZmO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGFscGhhSW5kZXggPSAoIGkgLSAoIGkgJSA0ICkgKyAzICk7XHJcbiAgICAgIC8vIGdyYWIgdGhlIGFzc29jaWF0ZWQgYWxwaGEgY2hhbm5lbCBhbmQgbXVsdGlwbHkgaXQgdGltZXMgdGhlIGRpZmZcclxuICAgICAgY29uc3QgYWxwaGFNdWx0aXBsaWVkRGlmZiA9ICggaSAlIDQgPT09IDMgKSA/IGRpZmYgOiBkaWZmICogKCBhLmRhdGFbIGFscGhhSW5kZXggXSAvIDI1NSApICogKCBiLmRhdGFbIGFscGhhSW5kZXggXSAvIDI1NSApO1xyXG5cclxuICAgICAgdG90YWxEaWZmZXJlbmNlICs9IGFscGhhTXVsdGlwbGllZERpZmY7XHJcbiAgICAgIC8vIGlmICggYWxwaGFNdWx0aXBsaWVkRGlmZiA+IHRocmVzaG9sZCApIHtcclxuICAgICAgLy8gY29uc29sZS5sb2coIG1lc3NhZ2UgKyAnOiAnICsgTWF0aC5hYnMoIGEuZGF0YVtpXSAtIGIuZGF0YVtpXSApICk7XHJcbiAgICAgIGxhcmdlc3REaWZmZXJlbmNlID0gTWF0aC5tYXgoIGxhcmdlc3REaWZmZXJlbmNlLCBhbHBoYU11bHRpcGxpZWREaWZmICk7XHJcbiAgICAgIC8vIGlzRXF1YWwgPSBmYWxzZTtcclxuICAgICAgLy8gYnJlYWs7XHJcbiAgICAgIC8vIH1cclxuICAgIH1cclxuICB9XHJcbiAgY29uc3QgYXZlcmFnZURpZmZlcmVuY2UgPSB0b3RhbERpZmZlcmVuY2UgLyAoIDQgKiBhLndpZHRoICogYS5oZWlnaHQgKTtcclxuICBpZiAoIGF2ZXJhZ2VEaWZmZXJlbmNlID4gdGhyZXNob2xkICkge1xyXG4gICAgY29uc3QgZGlzcGxheSA9ICQoICcjZGlzcGxheScgKTtcclxuICAgIC8vIGhlYWRlclxyXG4gICAgY29uc3Qgbm90ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdoMicgKTtcclxuICAgICQoIG5vdGUgKS50ZXh0KCBtZXNzYWdlICk7XHJcbiAgICBkaXNwbGF5LmFwcGVuZCggbm90ZSApO1xyXG4gICAgY29uc3QgZGlmZmVyZW5jZURpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XHJcbiAgICAkKCBkaWZmZXJlbmNlRGl2ICkudGV4dCggYChhY3R1YWwpIChleHBlY3RlZCkgKGNvbG9yIGRpZmYpIChhbHBoYSBkaWZmKSBEaWZmcyBtYXg6ICR7bGFyZ2VzdERpZmZlcmVuY2V9LCBhdmVyYWdlOiAke2F2ZXJhZ2VEaWZmZXJlbmNlfWAgKTtcclxuICAgIGRpc3BsYXkuYXBwZW5kKCBkaWZmZXJlbmNlRGl2ICk7XHJcblxyXG4gICAgZGlzcGxheS5hcHBlbmQoIHNuYXBzaG90VG9DYW52YXMoIGEgKSApO1xyXG4gICAgZGlzcGxheS5hcHBlbmQoIHNuYXBzaG90VG9DYW52YXMoIGIgKSApO1xyXG4gICAgZGlzcGxheS5hcHBlbmQoIHNuYXBzaG90VG9DYW52YXMoIGNvbG9yRGlmZkRhdGEgKSApO1xyXG4gICAgZGlzcGxheS5hcHBlbmQoIHNuYXBzaG90VG9DYW52YXMoIGFscGhhRGlmZkRhdGEgKSApO1xyXG5cclxuICAgIGlmICggZXh0cmFEb20gKSB7XHJcbiAgICAgIGRpc3BsYXkuYXBwZW5kKCBleHRyYURvbSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGZvciBhIGxpbmUtYnJlYWtcclxuICAgIGRpc3BsYXkuYXBwZW5kKCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApICk7XHJcblxyXG4gICAgaXNFcXVhbCA9IGZhbHNlO1xyXG4gIH1cclxuICBhc3NlcnQub2soIGlzRXF1YWwsIG1lc3NhZ2UgKTtcclxuICByZXR1cm4gaXNFcXVhbDtcclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ3NuYXBzaG90RXF1YWxzJywgc25hcHNob3RFcXVhbHMgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHNuYXBzaG90RXF1YWxzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sZUFBZTtBQUVuQyxTQUFTQyxnQkFBZ0JBLENBQUVDLFFBQVEsRUFBRztFQUVwQyxNQUFNQyxNQUFNLEdBQUdDLFFBQVEsQ0FBQ0MsYUFBYSxDQUFFLFFBQVMsQ0FBQztFQUNqREYsTUFBTSxDQUFDRyxLQUFLLEdBQUdKLFFBQVEsQ0FBQ0ksS0FBSztFQUM3QkgsTUFBTSxDQUFDSSxNQUFNLEdBQUdMLFFBQVEsQ0FBQ0ssTUFBTTtFQUMvQixNQUFNQyxPQUFPLEdBQUdMLE1BQU0sQ0FBQ00sVUFBVSxDQUFFLElBQUssQ0FBQztFQUN6Q0QsT0FBTyxDQUFDRSxZQUFZLENBQUVSLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0VBQ3RDUyxDQUFDLENBQUVSLE1BQU8sQ0FBQyxDQUFDUyxHQUFHLENBQUUsUUFBUSxFQUFFLGlCQUFrQixDQUFDO0VBQzlDLE9BQU9ULE1BQU07QUFDZjs7QUFFQTtBQUNBO0FBQ0EsU0FBU1UsY0FBY0EsQ0FBRUMsTUFBTSxFQUFFQyxDQUFDLEVBQUVDLENBQUMsRUFBRUMsU0FBUyxFQUFFQyxPQUFPLEVBQUVDLFFBQVEsRUFBRztFQUVwRSxJQUFJQyxPQUFPLEdBQUdMLENBQUMsQ0FBQ1QsS0FBSyxLQUFLVSxDQUFDLENBQUNWLEtBQUssSUFB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