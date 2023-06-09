// Copyright 2016-2020, University of Colorado Boulder

/**
 * View-specific properties common to all screens.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import plinkoProbability from '../../plinkoProbability.js';

// constants
const HISTOGRAM_MODE_VALUES = ['counter', 'cylinder', 'fraction']; // values for histogramModeProperty

class PlinkoProbabilityViewProperties {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      histogramMode: 'cylinder' // {string} see HISTOGRAM_MODE_VALUES
    }, options);

    // @public
    this.histogramModeProperty = new StringProperty(options.histogramMode, {
      validValues: HISTOGRAM_MODE_VALUES
    });
    this.expandedAccordionBoxProperty = new BooleanProperty(true);
    this.isTheoreticalHistogramVisibleProperty = new BooleanProperty(false);
    this.isSoundEnabledProperty = new BooleanProperty(false);
  }

  // @public
  reset() {
    this.histogramModeProperty.reset();
    this.expandedAccordionBoxProperty.reset();
    this.isTheoreticalHistogramVisibleProperty.reset();
    this.isSoundEnabledProperty.reset();
  }
}
plinkoProbability.register('PlinkoProbabilityViewProperties', PlinkoProbabilityViewProperties);
export default PlinkoProbabilityViewProperties;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJTdHJpbmdQcm9wZXJ0eSIsIm1lcmdlIiwicGxpbmtvUHJvYmFiaWxpdHkiLCJISVNUT0dSQU1fTU9ERV9WQUxVRVMiLCJQbGlua29Qcm9iYWJpbGl0eVZpZXdQcm9wZXJ0aWVzIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiaGlzdG9ncmFtTW9kZSIsImhpc3RvZ3JhbU1vZGVQcm9wZXJ0eSIsInZhbGlkVmFsdWVzIiwiZXhwYW5kZWRBY2NvcmRpb25Cb3hQcm9wZXJ0eSIsImlzVGhlb3JldGljYWxIaXN0b2dyYW1WaXNpYmxlUHJvcGVydHkiLCJpc1NvdW5kRW5hYmxlZFByb3BlcnR5IiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBsaW5rb1Byb2JhYmlsaXR5Vmlld1Byb3BlcnRpZXMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldy1zcGVjaWZpYyBwcm9wZXJ0aWVzIGNvbW1vbiB0byBhbGwgc2NyZWVucy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvU3RyaW5nUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHBsaW5rb1Byb2JhYmlsaXR5IGZyb20gJy4uLy4uL3BsaW5rb1Byb2JhYmlsaXR5LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBISVNUT0dSQU1fTU9ERV9WQUxVRVMgPSBbICdjb3VudGVyJywgJ2N5bGluZGVyJywgJ2ZyYWN0aW9uJyBdOyAvLyB2YWx1ZXMgZm9yIGhpc3RvZ3JhbU1vZGVQcm9wZXJ0eVxyXG5cclxuY2xhc3MgUGxpbmtvUHJvYmFiaWxpdHlWaWV3UHJvcGVydGllcyB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBoaXN0b2dyYW1Nb2RlOiAnY3lsaW5kZXInIC8vIHtzdHJpbmd9IHNlZSBISVNUT0dSQU1fTU9ERV9WQUxVRVNcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICB0aGlzLmhpc3RvZ3JhbU1vZGVQcm9wZXJ0eSA9IG5ldyBTdHJpbmdQcm9wZXJ0eSggb3B0aW9ucy5oaXN0b2dyYW1Nb2RlLCB7XHJcbiAgICAgIHZhbGlkVmFsdWVzOiBISVNUT0dSQU1fTU9ERV9WQUxVRVNcclxuICAgIH0gKTtcclxuICAgIHRoaXMuZXhwYW5kZWRBY2NvcmRpb25Cb3hQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcclxuICAgIHRoaXMuaXNUaGVvcmV0aWNhbEhpc3RvZ3JhbVZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgICB0aGlzLmlzU291bmRFbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuaGlzdG9ncmFtTW9kZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmV4cGFuZGVkQWNjb3JkaW9uQm94UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuaXNUaGVvcmV0aWNhbEhpc3RvZ3JhbVZpc2libGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5pc1NvdW5kRW5hYmxlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5wbGlua29Qcm9iYWJpbGl0eS5yZWdpc3RlciggJ1BsaW5rb1Byb2JhYmlsaXR5Vmlld1Byb3BlcnRpZXMnLCBQbGlua29Qcm9iYWJpbGl0eVZpZXdQcm9wZXJ0aWVzICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQbGlua29Qcm9iYWJpbGl0eVZpZXdQcm9wZXJ0aWVzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxpQkFBaUIsTUFBTSw0QkFBNEI7O0FBRTFEO0FBQ0EsTUFBTUMscUJBQXFCLEdBQUcsQ0FBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBRSxDQUFDLENBQUM7O0FBRXJFLE1BQU1DLCtCQUErQixDQUFDO0VBQ3BDO0FBQ0Y7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxPQUFPLEVBQUc7SUFFckJBLE9BQU8sR0FBR0wsS0FBSyxDQUFFO01BQ2ZNLGFBQWEsRUFBRSxVQUFVLENBQUM7SUFDNUIsQ0FBQyxFQUFFRCxPQUFRLENBQUM7O0lBRVo7SUFDQSxJQUFJLENBQUNFLHFCQUFxQixHQUFHLElBQUlSLGNBQWMsQ0FBRU0sT0FBTyxDQUFDQyxhQUFhLEVBQUU7TUFDdEVFLFdBQVcsRUFBRU47SUFDZixDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNPLDRCQUE0QixHQUFHLElBQUlYLGVBQWUsQ0FBRSxJQUFLLENBQUM7SUFDL0QsSUFBSSxDQUFDWSxxQ0FBcUMsR0FBRyxJQUFJWixlQUFlLENBQUUsS0FBTSxDQUFDO0lBQ3pFLElBQUksQ0FBQ2Esc0JBQXNCLEdBQUcsSUFBSWIsZUFBZSxDQUFFLEtBQU0sQ0FBQztFQUM1RDs7RUFHQTtFQUNBYyxLQUFLQSxDQUFBLEVBQUc7SUFDTixJQUFJLENBQUNMLHFCQUFxQixDQUFDSyxLQUFLLENBQUMsQ0FBQztJQUNsQyxJQUFJLENBQUNILDRCQUE0QixDQUFDRyxLQUFLLENBQUMsQ0FBQztJQUN6QyxJQUFJLENBQUNGLHFDQUFxQyxDQUFDRSxLQUFLLENBQUMsQ0FBQztJQUNsRCxJQUFJLENBQUNELHNCQUFzQixDQUFDQyxLQUFLLENBQUMsQ0FBQztFQUNyQztBQUNGO0FBRUFYLGlCQUFpQixDQUFDWSxRQUFRLENBQUUsaUNBQWlDLEVBQUVWLCtCQUFnQyxDQUFDO0FBRWhHLGVBQWVBLCtCQUErQiJ9