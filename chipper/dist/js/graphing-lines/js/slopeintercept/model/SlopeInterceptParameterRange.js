// Copyright 2013-2023, University of Colorado Boulder

/**
 * Methods for computing ranges of line parameters for slope-intercept form,
 * so that slope and intercept are within the visible range of the graph.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../../dot/js/Range.js';
import graphingLines from '../../graphingLines.js';
import PointSlopeParameterRange from '../../pointslope/model/PointSlopeParameterRange.js';
export default class SlopeInterceptParameterRange extends PointSlopeParameterRange {
  constructor() {
    super();
  }

  // Ranges are identical to point-slope, except that x1 is fixed at 0 for slope-intercept.
  x1() {
    return new Range(0, 0);
  }
}
graphingLines.register('SlopeInterceptParameterRange', SlopeInterceptParameterRange);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsImdyYXBoaW5nTGluZXMiLCJQb2ludFNsb3BlUGFyYW1ldGVyUmFuZ2UiLCJTbG9wZUludGVyY2VwdFBhcmFtZXRlclJhbmdlIiwiY29uc3RydWN0b3IiLCJ4MSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2xvcGVJbnRlcmNlcHRQYXJhbWV0ZXJSYW5nZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNZXRob2RzIGZvciBjb21wdXRpbmcgcmFuZ2VzIG9mIGxpbmUgcGFyYW1ldGVycyBmb3Igc2xvcGUtaW50ZXJjZXB0IGZvcm0sXHJcbiAqIHNvIHRoYXQgc2xvcGUgYW5kIGludGVyY2VwdCBhcmUgd2l0aGluIHRoZSB2aXNpYmxlIHJhbmdlIG9mIHRoZSBncmFwaC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IGdyYXBoaW5nTGluZXMgZnJvbSAnLi4vLi4vZ3JhcGhpbmdMaW5lcy5qcyc7XHJcbmltcG9ydCBQb2ludFNsb3BlUGFyYW1ldGVyUmFuZ2UgZnJvbSAnLi4vLi4vcG9pbnRzbG9wZS9tb2RlbC9Qb2ludFNsb3BlUGFyYW1ldGVyUmFuZ2UuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2xvcGVJbnRlcmNlcHRQYXJhbWV0ZXJSYW5nZSBleHRlbmRzIFBvaW50U2xvcGVQYXJhbWV0ZXJSYW5nZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgfVxyXG5cclxuICAvLyBSYW5nZXMgYXJlIGlkZW50aWNhbCB0byBwb2ludC1zbG9wZSwgZXhjZXB0IHRoYXQgeDEgaXMgZml4ZWQgYXQgMCBmb3Igc2xvcGUtaW50ZXJjZXB0LlxyXG4gIHB1YmxpYyBvdmVycmlkZSB4MSgpOiBSYW5nZSB7XHJcbiAgICByZXR1cm4gbmV3IFJhbmdlKCAwLCAwICk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmFwaGluZ0xpbmVzLnJlZ2lzdGVyKCAnU2xvcGVJbnRlcmNlcHRQYXJhbWV0ZXJSYW5nZScsIFNsb3BlSW50ZXJjZXB0UGFyYW1ldGVyUmFuZ2UgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLGFBQWEsTUFBTSx3QkFBd0I7QUFDbEQsT0FBT0Msd0JBQXdCLE1BQU0sb0RBQW9EO0FBRXpGLGVBQWUsTUFBTUMsNEJBQTRCLFNBQVNELHdCQUF3QixDQUFDO0VBRTFFRSxXQUFXQSxDQUFBLEVBQUc7SUFDbkIsS0FBSyxDQUFDLENBQUM7RUFDVDs7RUFFQTtFQUNnQkMsRUFBRUEsQ0FBQSxFQUFVO0lBQzFCLE9BQU8sSUFBSUwsS0FBSyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7RUFDMUI7QUFDRjtBQUVBQyxhQUFhLENBQUNLLFFBQVEsQ0FBRSw4QkFBOEIsRUFBRUgsNEJBQTZCLENBQUMifQ==