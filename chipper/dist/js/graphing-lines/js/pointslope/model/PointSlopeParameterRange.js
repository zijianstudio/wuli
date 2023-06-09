// Copyright 2013-2023, University of Colorado Boulder

/**
 * Methods for computing ranges of line parameters for point-slope form,
 * so that point and slope are within the visible range of the graph,
 * and to prevent the 2 points that define the line from being identical.
 *
 * Point-slope form is: (y - y1) = (rise/run)(x - x1)
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../../dot/js/Range.js';
import graphingLines from '../../graphingLines.js';
export default class PointSlopeParameterRange {
  // Range for the x component of the point (x1,y1)
  x1(line, graph) {
    const min = Math.max(graph.xRange.min, graph.xRange.min - line.run);
    const max = Math.min(graph.xRange.max, graph.xRange.max - line.run);
    return new Range(min, max);
  }

  // Range for the y component of the point (x1,y1)
  y1(line, graph) {
    const min = Math.max(graph.yRange.min, graph.yRange.min - line.rise);
    const max = Math.min(graph.yRange.max, graph.yRange.max - line.rise);
    return new Range(min, max);
  }

  // Range for the vertical component of the slope
  // Prevents overlapping points at extremes, see https://github.com/phetsims/graphing-lines/issues/75
  rise(line, graph) {
    const min = line.run === 0 && line.y1 === graph.yRange.min ? 1 : graph.yRange.min - line.y1;
    const max = line.run === 0 && line.y1 === graph.yRange.max ? -1 : graph.yRange.max - line.y1;
    return new Range(min, max);
  }

  // Range for the horizontal component of the slope
  // Prevents overlapping points at extremes, see https://github.com/phetsims/graphing-lines/issues/75
  run(line, graph) {
    const min = line.rise === 0 && line.x1 === graph.xRange.min ? 1 : graph.xRange.min - line.x1;
    const max = line.rise === 0 && line.x1 === graph.xRange.max ? -1 : graph.xRange.max - line.x1;
    return new Range(min, max);
  }
}
graphingLines.register('PointSlopeParameterRange', PointSlopeParameterRange);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsImdyYXBoaW5nTGluZXMiLCJQb2ludFNsb3BlUGFyYW1ldGVyUmFuZ2UiLCJ4MSIsImxpbmUiLCJncmFwaCIsIm1pbiIsIk1hdGgiLCJtYXgiLCJ4UmFuZ2UiLCJydW4iLCJ5MSIsInlSYW5nZSIsInJpc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBvaW50U2xvcGVQYXJhbWV0ZXJSYW5nZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNZXRob2RzIGZvciBjb21wdXRpbmcgcmFuZ2VzIG9mIGxpbmUgcGFyYW1ldGVycyBmb3IgcG9pbnQtc2xvcGUgZm9ybSxcclxuICogc28gdGhhdCBwb2ludCBhbmQgc2xvcGUgYXJlIHdpdGhpbiB0aGUgdmlzaWJsZSByYW5nZSBvZiB0aGUgZ3JhcGgsXHJcbiAqIGFuZCB0byBwcmV2ZW50IHRoZSAyIHBvaW50cyB0aGF0IGRlZmluZSB0aGUgbGluZSBmcm9tIGJlaW5nIGlkZW50aWNhbC5cclxuICpcclxuICogUG9pbnQtc2xvcGUgZm9ybSBpczogKHkgLSB5MSkgPSAocmlzZS9ydW4pKHggLSB4MSlcclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IGdyYXBoaW5nTGluZXMgZnJvbSAnLi4vLi4vZ3JhcGhpbmdMaW5lcy5qcyc7XHJcbmltcG9ydCBMaW5lIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9MaW5lLmpzJztcclxuaW1wb3J0IEdyYXBoIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9HcmFwaC5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb2ludFNsb3BlUGFyYW1ldGVyUmFuZ2Uge1xyXG5cclxuICAvLyBSYW5nZSBmb3IgdGhlIHggY29tcG9uZW50IG9mIHRoZSBwb2ludCAoeDEseTEpXHJcbiAgcHVibGljIHgxKCBsaW5lOiBMaW5lLCBncmFwaDogR3JhcGggKTogUmFuZ2Uge1xyXG4gICAgY29uc3QgbWluID0gTWF0aC5tYXgoIGdyYXBoLnhSYW5nZS5taW4sIGdyYXBoLnhSYW5nZS5taW4gLSBsaW5lLnJ1biApO1xyXG4gICAgY29uc3QgbWF4ID0gTWF0aC5taW4oIGdyYXBoLnhSYW5nZS5tYXgsIGdyYXBoLnhSYW5nZS5tYXggLSBsaW5lLnJ1biApO1xyXG4gICAgcmV0dXJuIG5ldyBSYW5nZSggbWluLCBtYXggKTtcclxuICB9XHJcblxyXG4gIC8vIFJhbmdlIGZvciB0aGUgeSBjb21wb25lbnQgb2YgdGhlIHBvaW50ICh4MSx5MSlcclxuICBwdWJsaWMgeTEoIGxpbmU6IExpbmUsIGdyYXBoOiBHcmFwaCApOiBSYW5nZSB7XHJcbiAgICBjb25zdCBtaW4gPSBNYXRoLm1heCggZ3JhcGgueVJhbmdlLm1pbiwgZ3JhcGgueVJhbmdlLm1pbiAtIGxpbmUucmlzZSApO1xyXG4gICAgY29uc3QgbWF4ID0gTWF0aC5taW4oIGdyYXBoLnlSYW5nZS5tYXgsIGdyYXBoLnlSYW5nZS5tYXggLSBsaW5lLnJpc2UgKTtcclxuICAgIHJldHVybiBuZXcgUmFuZ2UoIG1pbiwgbWF4ICk7XHJcbiAgfVxyXG5cclxuICAvLyBSYW5nZSBmb3IgdGhlIHZlcnRpY2FsIGNvbXBvbmVudCBvZiB0aGUgc2xvcGVcclxuICAvLyBQcmV2ZW50cyBvdmVybGFwcGluZyBwb2ludHMgYXQgZXh0cmVtZXMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ3JhcGhpbmctbGluZXMvaXNzdWVzLzc1XHJcbiAgcHVibGljIHJpc2UoIGxpbmU6IExpbmUsIGdyYXBoOiBHcmFwaCApOiBSYW5nZSB7XHJcbiAgICBjb25zdCBtaW4gPSAoIGxpbmUucnVuID09PSAwICYmIGxpbmUueTEgPT09IGdyYXBoLnlSYW5nZS5taW4gKSA/IDEgOiAoIGdyYXBoLnlSYW5nZS5taW4gLSBsaW5lLnkxICk7XHJcbiAgICBjb25zdCBtYXggPSAoIGxpbmUucnVuID09PSAwICYmIGxpbmUueTEgPT09IGdyYXBoLnlSYW5nZS5tYXggKSA/IC0xIDogKCBncmFwaC55UmFuZ2UubWF4IC0gbGluZS55MSApO1xyXG4gICAgcmV0dXJuIG5ldyBSYW5nZSggbWluLCBtYXggKTtcclxuICB9XHJcblxyXG4gIC8vIFJhbmdlIGZvciB0aGUgaG9yaXpvbnRhbCBjb21wb25lbnQgb2YgdGhlIHNsb3BlXHJcbiAgLy8gUHJldmVudHMgb3ZlcmxhcHBpbmcgcG9pbnRzIGF0IGV4dHJlbWVzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyYXBoaW5nLWxpbmVzL2lzc3Vlcy83NVxyXG4gIHB1YmxpYyBydW4oIGxpbmU6IExpbmUsIGdyYXBoOiBHcmFwaCApOiBSYW5nZSB7XHJcbiAgICBjb25zdCBtaW4gPSAoIGxpbmUucmlzZSA9PT0gMCAmJiBsaW5lLngxID09PSBncmFwaC54UmFuZ2UubWluICkgPyAxIDogKCBncmFwaC54UmFuZ2UubWluIC0gbGluZS54MSApO1xyXG4gICAgY29uc3QgbWF4ID0gKCBsaW5lLnJpc2UgPT09IDAgJiYgbGluZS54MSA9PT0gZ3JhcGgueFJhbmdlLm1heCApID8gLTEgOiAoIGdyYXBoLnhSYW5nZS5tYXggLSBsaW5lLngxICk7XHJcbiAgICByZXR1cm4gbmV3IFJhbmdlKCBtaW4sIG1heCApO1xyXG4gIH1cclxufVxyXG5cclxuZ3JhcGhpbmdMaW5lcy5yZWdpc3RlciggJ1BvaW50U2xvcGVQYXJhbWV0ZXJSYW5nZScsIFBvaW50U2xvcGVQYXJhbWV0ZXJSYW5nZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsYUFBYSxNQUFNLHdCQUF3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