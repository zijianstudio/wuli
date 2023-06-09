// Copyright 2018-2023, University of Colorado Boulder

/**
 * Strings for mathematical symbols, with markup for RichText.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import MathSymbolFont from '../../../scenery-phet/js/MathSymbolFont.js';
import graphingLines from '../graphingLines.js';
import GraphingLinesStrings from '../GraphingLinesStrings.js';
const GLSymbols = {
  b: MathSymbolFont.getRichTextMarkup(GraphingLinesStrings.symbol.intercept),
  m: MathSymbolFont.getRichTextMarkup(GraphingLinesStrings.symbol.slope),
  x: MathSymbolFont.getRichTextMarkup(GraphingLinesStrings.symbol.x),
  y: MathSymbolFont.getRichTextMarkup(GraphingLinesStrings.symbol.y)
};
graphingLines.register('GLSymbols', GLSymbols);
export default GLSymbols;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXRoU3ltYm9sRm9udCIsImdyYXBoaW5nTGluZXMiLCJHcmFwaGluZ0xpbmVzU3RyaW5ncyIsIkdMU3ltYm9scyIsImIiLCJnZXRSaWNoVGV4dE1hcmt1cCIsInN5bWJvbCIsImludGVyY2VwdCIsIm0iLCJzbG9wZSIsIngiLCJ5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHTFN5bWJvbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU3RyaW5ncyBmb3IgbWF0aGVtYXRpY2FsIHN5bWJvbHMsIHdpdGggbWFya3VwIGZvciBSaWNoVGV4dC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgTWF0aFN5bWJvbEZvbnQgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xGb250LmpzJztcclxuaW1wb3J0IGdyYXBoaW5nTGluZXMgZnJvbSAnLi4vZ3JhcGhpbmdMaW5lcy5qcyc7XHJcbmltcG9ydCBHcmFwaGluZ0xpbmVzU3RyaW5ncyBmcm9tICcuLi9HcmFwaGluZ0xpbmVzU3RyaW5ncy5qcyc7XHJcblxyXG5jb25zdCBHTFN5bWJvbHMgPSB7XHJcbiAgYjogTWF0aFN5bWJvbEZvbnQuZ2V0UmljaFRleHRNYXJrdXAoIEdyYXBoaW5nTGluZXNTdHJpbmdzLnN5bWJvbC5pbnRlcmNlcHQgKSxcclxuICBtOiBNYXRoU3ltYm9sRm9udC5nZXRSaWNoVGV4dE1hcmt1cCggR3JhcGhpbmdMaW5lc1N0cmluZ3Muc3ltYm9sLnNsb3BlICksXHJcbiAgeDogTWF0aFN5bWJvbEZvbnQuZ2V0UmljaFRleHRNYXJrdXAoIEdyYXBoaW5nTGluZXNTdHJpbmdzLnN5bWJvbC54ICksXHJcbiAgeTogTWF0aFN5bWJvbEZvbnQuZ2V0UmljaFRleHRNYXJrdXAoIEdyYXBoaW5nTGluZXNTdHJpbmdzLnN5bWJvbC55IClcclxufTtcclxuXHJcbmdyYXBoaW5nTGluZXMucmVnaXN0ZXIoICdHTFN5bWJvbHMnLCBHTFN5bWJvbHMgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdMU3ltYm9sczsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLDRDQUE0QztBQUN2RSxPQUFPQyxhQUFhLE1BQU0scUJBQXFCO0FBQy9DLE9BQU9DLG9CQUFvQixNQUFNLDRCQUE0QjtBQUU3RCxNQUFNQyxTQUFTLEdBQUc7RUFDaEJDLENBQUMsRUFBRUosY0FBYyxDQUFDSyxpQkFBaUIsQ0FBRUgsb0JBQW9CLENBQUNJLE1BQU0sQ0FBQ0MsU0FBVSxDQUFDO0VBQzVFQyxDQUFDLEVBQUVSLGNBQWMsQ0FBQ0ssaUJBQWlCLENBQUVILG9CQUFvQixDQUFDSSxNQUFNLENBQUNHLEtBQU0sQ0FBQztFQUN4RUMsQ0FBQyxFQUFFVixjQUFjLENBQUNLLGlCQUFpQixDQUFFSCxvQkFBb0IsQ0FBQ0ksTUFBTSxDQUFDSSxDQUFFLENBQUM7RUFDcEVDLENBQUMsRUFBRVgsY0FBYyxDQUFDSyxpQkFBaUIsQ0FBRUgsb0JBQW9CLENBQUNJLE1BQU0sQ0FBQ0ssQ0FBRTtBQUNyRSxDQUFDO0FBRURWLGFBQWEsQ0FBQ1csUUFBUSxDQUFFLFdBQVcsRUFBRVQsU0FBVSxDQUFDO0FBRWhELGVBQWVBLFNBQVMifQ==