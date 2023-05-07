// Copyright 2013-2023, University of Colorado Boulder

/**
 * Model for the 'Slope-Intercept' screen.
 * This is a specialization of the Point-Slope model.
 * x1 is fixed at zero, so that y1 is synonymous with y-intercept.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import GLColors from '../../common/GLColors.js';
import Line from '../../common/model/Line.js';
import graphingLines from '../../graphingLines.js';
import PointSlopeModel from '../../pointslope/model/PointSlopeModel.js';
import SlopeInterceptParameterRange from './SlopeInterceptParameterRange.js';
export default class SlopeInterceptModel extends PointSlopeModel {
  constructor(tandem) {
    super(tandem, Line.createSlopeIntercept(2, 3, 1, GLColors.INTERACTIVE_LINE), new SlopeInterceptParameterRange());
  }
}
graphingLines.register('SlopeInterceptModel', SlopeInterceptModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJHTENvbG9ycyIsIkxpbmUiLCJncmFwaGluZ0xpbmVzIiwiUG9pbnRTbG9wZU1vZGVsIiwiU2xvcGVJbnRlcmNlcHRQYXJhbWV0ZXJSYW5nZSIsIlNsb3BlSW50ZXJjZXB0TW9kZWwiLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsImNyZWF0ZVNsb3BlSW50ZXJjZXB0IiwiSU5URVJBQ1RJVkVfTElORSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2xvcGVJbnRlcmNlcHRNb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBmb3IgdGhlICdTbG9wZS1JbnRlcmNlcHQnIHNjcmVlbi5cclxuICogVGhpcyBpcyBhIHNwZWNpYWxpemF0aW9uIG9mIHRoZSBQb2ludC1TbG9wZSBtb2RlbC5cclxuICogeDEgaXMgZml4ZWQgYXQgemVybywgc28gdGhhdCB5MSBpcyBzeW5vbnltb3VzIHdpdGggeS1pbnRlcmNlcHQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEdMQ29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi9HTENvbG9ycy5qcyc7XHJcbmltcG9ydCBMaW5lIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9MaW5lLmpzJztcclxuaW1wb3J0IGdyYXBoaW5nTGluZXMgZnJvbSAnLi4vLi4vZ3JhcGhpbmdMaW5lcy5qcyc7XHJcbmltcG9ydCBQb2ludFNsb3BlTW9kZWwgZnJvbSAnLi4vLi4vcG9pbnRzbG9wZS9tb2RlbC9Qb2ludFNsb3BlTW9kZWwuanMnO1xyXG5pbXBvcnQgU2xvcGVJbnRlcmNlcHRQYXJhbWV0ZXJSYW5nZSBmcm9tICcuL1Nsb3BlSW50ZXJjZXB0UGFyYW1ldGVyUmFuZ2UuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2xvcGVJbnRlcmNlcHRNb2RlbCBleHRlbmRzIFBvaW50U2xvcGVNb2RlbCB7XHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0YW5kZW06IFRhbmRlbSApIHtcclxuICAgIHN1cGVyKCB0YW5kZW0sIExpbmUuY3JlYXRlU2xvcGVJbnRlcmNlcHQoIDIsIDMsIDEsIEdMQ29sb3JzLklOVEVSQUNUSVZFX0xJTkUgKSwgbmV3IFNsb3BlSW50ZXJjZXB0UGFyYW1ldGVyUmFuZ2UoKSApO1xyXG4gIH1cclxufVxyXG5cclxuZ3JhcGhpbmdMaW5lcy5yZWdpc3RlciggJ1Nsb3BlSW50ZXJjZXB0TW9kZWwnLCBTbG9wZUludGVyY2VwdE1vZGVsICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxRQUFRLE1BQU0sMEJBQTBCO0FBQy9DLE9BQU9DLElBQUksTUFBTSw0QkFBNEI7QUFDN0MsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUNsRCxPQUFPQyxlQUFlLE1BQU0sMkNBQTJDO0FBQ3ZFLE9BQU9DLDRCQUE0QixNQUFNLG1DQUFtQztBQUU1RSxlQUFlLE1BQU1DLG1CQUFtQixTQUFTRixlQUFlLENBQUM7RUFDeERHLFdBQVdBLENBQUVDLE1BQWMsRUFBRztJQUNuQyxLQUFLLENBQUVBLE1BQU0sRUFBRU4sSUFBSSxDQUFDTyxvQkFBb0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRVIsUUFBUSxDQUFDUyxnQkFBaUIsQ0FBQyxFQUFFLElBQUlMLDRCQUE0QixDQUFDLENBQUUsQ0FBQztFQUN0SDtBQUNGO0FBRUFGLGFBQWEsQ0FBQ1EsUUFBUSxDQUFFLHFCQUFxQixFQUFFTCxtQkFBb0IsQ0FBQyJ9