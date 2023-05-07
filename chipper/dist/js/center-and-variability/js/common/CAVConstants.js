// Copyright 2022-2023, University of Colorado Boulder

/**
 * Constants used throughout this simulation.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import Tandem from '../../../tandem/js/Tandem.js';
import centerAndVariability from '../centerAndVariability.js';
import CAVQueryParameters from './CAVQueryParameters.js';
import PlotType from './model/PlotType.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import Range from '../../../dot/js/Range.js';

// Right skewed means most of the data is on the left, see https://github.com/phetsims/center-and-variability/issues/112
const RIGHT_SKEWED_DATA = [6, 9, 11, 14, 11, 8, 6, 5, 5, 5, 5, 5, 5, 5, 5];
const NUMBER_LINE_MARGIN_X = 207;
const MAIN_FONT = new PhetFont(16);
const CAVConstants = {
  SCREEN_VIEW_X_MARGIN: 15,
  SCREEN_VIEW_Y_MARGIN: 15,
  GRAVITY: -9.8,
  // in meters/second^2
  MAIN_FONT: MAIN_FONT,
  NUMBER_OF_OBJECTS: 15,
  // number of objects in the play area on each screen
  CHECKBOX_TEXT_MAX_WIDTH: 107,
  // the top checkboxes are left aligned with the play area checkboxes, so their max width is smaller to accommodate
  // for the accordion box margin
  PLOT_TYPE_PROPERTY: new EnumerationProperty(CAVQueryParameters.plotType === 'dotPlot' ? PlotType.DOT_PLOT : PlotType.LINE_PLOT, {
    tandem: Tandem.PREFERENCES.createTandem('plotTypeProperty')
  }),
  ARROW_LINE_WIDTH: 0.5,
  RIGHT_SKEWED_DATA: RIGHT_SKEWED_DATA,
  LEFT_SKEWED_DATA: RIGHT_SKEWED_DATA.slice().reverse(),
  CHART_VIEW_WIDTH: ScreenView.DEFAULT_LAYOUT_BOUNDS.width - NUMBER_LINE_MARGIN_X * 2,
  NUMBER_LINE_MARGIN_X: NUMBER_LINE_MARGIN_X,
  INFO_DIALOG_MAX_TEXT_WIDTH: 700,
  CHECKBOX_TEXT_OPTIONS: {
    font: MAIN_FONT,
    maxWidth: 90
  },
  PHYSICAL_RANGE: new Range(1, 15)
};
centerAndVariability.register('CAVConstants', CAVConstants);
export default CAVConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvblByb3BlcnR5IiwiUGhldEZvbnQiLCJUYW5kZW0iLCJjZW50ZXJBbmRWYXJpYWJpbGl0eSIsIkNBVlF1ZXJ5UGFyYW1ldGVycyIsIlBsb3RUeXBlIiwiU2NyZWVuVmlldyIsIlJhbmdlIiwiUklHSFRfU0tFV0VEX0RBVEEiLCJOVU1CRVJfTElORV9NQVJHSU5fWCIsIk1BSU5fRk9OVCIsIkNBVkNvbnN0YW50cyIsIlNDUkVFTl9WSUVXX1hfTUFSR0lOIiwiU0NSRUVOX1ZJRVdfWV9NQVJHSU4iLCJHUkFWSVRZIiwiTlVNQkVSX09GX09CSkVDVFMiLCJDSEVDS0JPWF9URVhUX01BWF9XSURUSCIsIlBMT1RfVFlQRV9QUk9QRVJUWSIsInBsb3RUeXBlIiwiRE9UX1BMT1QiLCJMSU5FX1BMT1QiLCJ0YW5kZW0iLCJQUkVGRVJFTkNFUyIsImNyZWF0ZVRhbmRlbSIsIkFSUk9XX0xJTkVfV0lEVEgiLCJMRUZUX1NLRVdFRF9EQVRBIiwic2xpY2UiLCJyZXZlcnNlIiwiQ0hBUlRfVklFV19XSURUSCIsIkRFRkFVTFRfTEFZT1VUX0JPVU5EUyIsIndpZHRoIiwiSU5GT19ESUFMT0dfTUFYX1RFWFRfV0lEVEgiLCJDSEVDS0JPWF9URVhUX09QVElPTlMiLCJmb250IiwibWF4V2lkdGgiLCJQSFlTSUNBTF9SQU5HRSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ0FWQ29uc3RhbnRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbnN0YW50cyB1c2VkIHRocm91Z2hvdXQgdGhpcyBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBjZW50ZXJBbmRWYXJpYWJpbGl0eSBmcm9tICcuLi9jZW50ZXJBbmRWYXJpYWJpbGl0eS5qcyc7XHJcbmltcG9ydCBDQVZRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi9DQVZRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgUGxvdFR5cGUgZnJvbSAnLi9tb2RlbC9QbG90VHlwZS5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuXHJcbi8vIFJpZ2h0IHNrZXdlZCBtZWFucyBtb3N0IG9mIHRoZSBkYXRhIGlzIG9uIHRoZSBsZWZ0LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NlbnRlci1hbmQtdmFyaWFiaWxpdHkvaXNzdWVzLzExMlxyXG5jb25zdCBSSUdIVF9TS0VXRURfREFUQSA9IFtcclxuICA2LCA5LCAxMSwgMTQsIDExLFxyXG4gIDgsIDYsIDUsIDUsIDUsXHJcbiAgNSwgNSwgNSwgNSwgNVxyXG5dO1xyXG5cclxuY29uc3QgTlVNQkVSX0xJTkVfTUFSR0lOX1ggPSAyMDc7XHJcblxyXG5jb25zdCBNQUlOX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDE2ICk7XHJcbmNvbnN0IENBVkNvbnN0YW50cyA9IHtcclxuICBTQ1JFRU5fVklFV19YX01BUkdJTjogMTUsXHJcbiAgU0NSRUVOX1ZJRVdfWV9NQVJHSU46IDE1LFxyXG4gIEdSQVZJVFk6IC05LjgsIC8vIGluIG1ldGVycy9zZWNvbmReMlxyXG4gIE1BSU5fRk9OVDogTUFJTl9GT05ULFxyXG4gIE5VTUJFUl9PRl9PQkpFQ1RTOiAxNSwgLy8gbnVtYmVyIG9mIG9iamVjdHMgaW4gdGhlIHBsYXkgYXJlYSBvbiBlYWNoIHNjcmVlblxyXG4gIENIRUNLQk9YX1RFWFRfTUFYX1dJRFRIOiAxMDcsXHJcblxyXG4gIC8vIHRoZSB0b3AgY2hlY2tib3hlcyBhcmUgbGVmdCBhbGlnbmVkIHdpdGggdGhlIHBsYXkgYXJlYSBjaGVja2JveGVzLCBzbyB0aGVpciBtYXggd2lkdGggaXMgc21hbGxlciB0byBhY2NvbW1vZGF0ZVxyXG4gIC8vIGZvciB0aGUgYWNjb3JkaW9uIGJveCBtYXJnaW5cclxuICBQTE9UX1RZUEVfUFJPUEVSVFk6IG5ldyBFbnVtZXJhdGlvblByb3BlcnR5KCBDQVZRdWVyeVBhcmFtZXRlcnMucGxvdFR5cGUgPT09ICdkb3RQbG90JyA/IFBsb3RUeXBlLkRPVF9QTE9UIDogUGxvdFR5cGUuTElORV9QTE9ULCB7XHJcbiAgICB0YW5kZW06IFRhbmRlbS5QUkVGRVJFTkNFUy5jcmVhdGVUYW5kZW0oICdwbG90VHlwZVByb3BlcnR5JyApXHJcbiAgfSApLFxyXG4gIEFSUk9XX0xJTkVfV0lEVEg6IDAuNSxcclxuICBSSUdIVF9TS0VXRURfREFUQTogUklHSFRfU0tFV0VEX0RBVEEsXHJcbiAgTEVGVF9TS0VXRURfREFUQTogUklHSFRfU0tFV0VEX0RBVEEuc2xpY2UoKS5yZXZlcnNlKCksXHJcblxyXG4gIENIQVJUX1ZJRVdfV0lEVEg6IFNjcmVlblZpZXcuREVGQVVMVF9MQVlPVVRfQk9VTkRTLndpZHRoIC0gTlVNQkVSX0xJTkVfTUFSR0lOX1ggKiAyLFxyXG4gIE5VTUJFUl9MSU5FX01BUkdJTl9YOiBOVU1CRVJfTElORV9NQVJHSU5fWCxcclxuXHJcbiAgSU5GT19ESUFMT0dfTUFYX1RFWFRfV0lEVEg6IDcwMCxcclxuXHJcbiAgQ0hFQ0tCT1hfVEVYVF9PUFRJT05TOiB7XHJcbiAgICBmb250OiBNQUlOX0ZPTlQsXHJcbiAgICBtYXhXaWR0aDogOTBcclxuICB9LFxyXG5cclxuICBQSFlTSUNBTF9SQU5HRTogbmV3IFJhbmdlKCAxLCAxNSApXHJcbn07XHJcblxyXG5jZW50ZXJBbmRWYXJpYWJpbGl0eS5yZWdpc3RlciggJ0NBVkNvbnN0YW50cycsIENBVkNvbnN0YW50cyApO1xyXG5leHBvcnQgZGVmYXVsdCBDQVZDb25zdGFudHM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsbUJBQW1CLE1BQU0seUNBQXlDO0FBQ3pFLE9BQU9DLFFBQVEsTUFBTSxzQ0FBc0M7QUFDM0QsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxPQUFPQyxvQkFBb0IsTUFBTSw0QkFBNEI7QUFDN0QsT0FBT0Msa0JBQWtCLE1BQU0seUJBQXlCO0FBQ3hELE9BQU9DLFFBQVEsTUFBTSxxQkFBcUI7QUFDMUMsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxPQUFPQyxLQUFLLE1BQU0sMEJBQTBCOztBQUU1QztBQUNBLE1BQU1DLGlCQUFpQixHQUFHLENBQ3hCLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ2hCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQ2IsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FDZDtBQUVELE1BQU1DLG9CQUFvQixHQUFHLEdBQUc7QUFFaEMsTUFBTUMsU0FBUyxHQUFHLElBQUlULFFBQVEsQ0FBRSxFQUFHLENBQUM7QUFDcEMsTUFBTVUsWUFBWSxHQUFHO0VBQ25CQyxvQkFBb0IsRUFBRSxFQUFFO0VBQ3hCQyxvQkFBb0IsRUFBRSxFQUFFO0VBQ3hCQyxPQUFPLEVBQUUsQ0FBQyxHQUFHO0VBQUU7RUFDZkosU0FBUyxFQUFFQSxTQUFTO0VBQ3BCSyxpQkFBaUIsRUFBRSxFQUFFO0VBQUU7RUFDdkJDLHVCQUF1QixFQUFFLEdBQUc7RUFFNUI7RUFDQTtFQUNBQyxrQkFBa0IsRUFBRSxJQUFJakIsbUJBQW1CLENBQUVJLGtCQUFrQixDQUFDYyxRQUFRLEtBQUssU0FBUyxHQUFHYixRQUFRLENBQUNjLFFBQVEsR0FBR2QsUUFBUSxDQUFDZSxTQUFTLEVBQUU7SUFDL0hDLE1BQU0sRUFBRW5CLE1BQU0sQ0FBQ29CLFdBQVcsQ0FBQ0MsWUFBWSxDQUFFLGtCQUFtQjtFQUM5RCxDQUFFLENBQUM7RUFDSEMsZ0JBQWdCLEVBQUUsR0FBRztFQUNyQmhCLGlCQUFpQixFQUFFQSxpQkFBaUI7RUFDcENpQixnQkFBZ0IsRUFBRWpCLGlCQUFpQixDQUFDa0IsS0FBSyxDQUFDLENBQUMsQ0FBQ0MsT0FBTyxDQUFDLENBQUM7RUFFckRDLGdCQUFnQixFQUFFdEIsVUFBVSxDQUFDdUIscUJBQXFCLENBQUNDLEtBQUssR0FBR3JCLG9CQUFvQixHQUFHLENBQUM7RUFDbkZBLG9CQUFvQixFQUFFQSxvQkFBb0I7RUFFMUNzQiwwQkFBMEIsRUFBRSxHQUFHO0VBRS9CQyxxQkFBcUIsRUFBRTtJQUNyQkMsSUFBSSxFQUFFdkIsU0FBUztJQUNmd0IsUUFBUSxFQUFFO0VBQ1osQ0FBQztFQUVEQyxjQUFjLEVBQUUsSUFBSTVCLEtBQUssQ0FBRSxDQUFDLEVBQUUsRUFBRztBQUNuQyxDQUFDO0FBRURKLG9CQUFvQixDQUFDaUMsUUFBUSxDQUFFLGNBQWMsRUFBRXpCLFlBQWEsQ0FBQztBQUM3RCxlQUFlQSxZQUFZIn0=