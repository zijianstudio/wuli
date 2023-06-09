// Copyright 2017-2023, University of Colorado Boulder

/**
 * Control for setting the rate of the race car.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import URConstants from '../../common/URConstants.js';
import RateAccordionBox from '../../common/view/RateAccordionBox.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
export default class RaceCarRateAccordionBox extends RateAccordionBox {
  /**
   * @param {RaceCar} car
   * @param {Object} [options]
   */
  constructor(car, options) {
    options = merge({
      numeratorUnits: UnitRatesStrings.miles,
      denominatorUnits: UnitRatesStrings.hours,
      numeratorRange: URConstants.MILES_RANGE,
      denominatorRange: URConstants.HOURS_RANGE,
      numeratorPickerColor: car.color,
      denominatorPickerColor: car.color,
      numeratorPickerIncrementFunction: miles => miles + URConstants.MILES_DELTA,
      numeratorPickerDecrementFunction: miles => miles - URConstants.MILES_DELTA,
      denominatorPickerIncrementFunction: value => value + URConstants.HOURS_DELTA,
      denominatorPickerDecrementFunction: value => value - URConstants.HOURS_DELTA,
      denominatorDecimals: URConstants.HOURS_DECIMALS,
      pickerFont: new PhetFont(20)
    }, options);
    super(car.rate, options);
  }
}
unitRates.register('RaceCarRateAccordionBox', RaceCarRateAccordionBox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlBoZXRGb250IiwiVVJDb25zdGFudHMiLCJSYXRlQWNjb3JkaW9uQm94IiwidW5pdFJhdGVzIiwiVW5pdFJhdGVzU3RyaW5ncyIsIlJhY2VDYXJSYXRlQWNjb3JkaW9uQm94IiwiY29uc3RydWN0b3IiLCJjYXIiLCJvcHRpb25zIiwibnVtZXJhdG9yVW5pdHMiLCJtaWxlcyIsImRlbm9taW5hdG9yVW5pdHMiLCJob3VycyIsIm51bWVyYXRvclJhbmdlIiwiTUlMRVNfUkFOR0UiLCJkZW5vbWluYXRvclJhbmdlIiwiSE9VUlNfUkFOR0UiLCJudW1lcmF0b3JQaWNrZXJDb2xvciIsImNvbG9yIiwiZGVub21pbmF0b3JQaWNrZXJDb2xvciIsIm51bWVyYXRvclBpY2tlckluY3JlbWVudEZ1bmN0aW9uIiwiTUlMRVNfREVMVEEiLCJudW1lcmF0b3JQaWNrZXJEZWNyZW1lbnRGdW5jdGlvbiIsImRlbm9taW5hdG9yUGlja2VySW5jcmVtZW50RnVuY3Rpb24iLCJ2YWx1ZSIsIkhPVVJTX0RFTFRBIiwiZGVub21pbmF0b3JQaWNrZXJEZWNyZW1lbnRGdW5jdGlvbiIsImRlbm9taW5hdG9yRGVjaW1hbHMiLCJIT1VSU19ERUNJTUFMUyIsInBpY2tlckZvbnQiLCJyYXRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJSYWNlQ2FyUmF0ZUFjY29yZGlvbkJveC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb250cm9sIGZvciBzZXR0aW5nIHRoZSByYXRlIG9mIHRoZSByYWNlIGNhci5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBVUkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vVVJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgUmF0ZUFjY29yZGlvbkJveCBmcm9tICcuLi8uLi9jb21tb24vdmlldy9SYXRlQWNjb3JkaW9uQm94LmpzJztcclxuaW1wb3J0IHVuaXRSYXRlcyBmcm9tICcuLi8uLi91bml0UmF0ZXMuanMnO1xyXG5pbXBvcnQgVW5pdFJhdGVzU3RyaW5ncyBmcm9tICcuLi8uLi9Vbml0UmF0ZXNTdHJpbmdzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJhY2VDYXJSYXRlQWNjb3JkaW9uQm94IGV4dGVuZHMgUmF0ZUFjY29yZGlvbkJveCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UmFjZUNhcn0gY2FyXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjYXIsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIG51bWVyYXRvclVuaXRzOiBVbml0UmF0ZXNTdHJpbmdzLm1pbGVzLFxyXG4gICAgICBkZW5vbWluYXRvclVuaXRzOiBVbml0UmF0ZXNTdHJpbmdzLmhvdXJzLFxyXG4gICAgICBudW1lcmF0b3JSYW5nZTogVVJDb25zdGFudHMuTUlMRVNfUkFOR0UsXHJcbiAgICAgIGRlbm9taW5hdG9yUmFuZ2U6IFVSQ29uc3RhbnRzLkhPVVJTX1JBTkdFLFxyXG4gICAgICBudW1lcmF0b3JQaWNrZXJDb2xvcjogY2FyLmNvbG9yLFxyXG4gICAgICBkZW5vbWluYXRvclBpY2tlckNvbG9yOiBjYXIuY29sb3IsXHJcbiAgICAgIG51bWVyYXRvclBpY2tlckluY3JlbWVudEZ1bmN0aW9uOiBtaWxlcyA9PiAoIG1pbGVzICsgVVJDb25zdGFudHMuTUlMRVNfREVMVEEgKSxcclxuICAgICAgbnVtZXJhdG9yUGlja2VyRGVjcmVtZW50RnVuY3Rpb246IG1pbGVzID0+ICggbWlsZXMgLSBVUkNvbnN0YW50cy5NSUxFU19ERUxUQSApLFxyXG4gICAgICBkZW5vbWluYXRvclBpY2tlckluY3JlbWVudEZ1bmN0aW9uOiB2YWx1ZSA9PiAoIHZhbHVlICsgVVJDb25zdGFudHMuSE9VUlNfREVMVEEgKSxcclxuICAgICAgZGVub21pbmF0b3JQaWNrZXJEZWNyZW1lbnRGdW5jdGlvbjogdmFsdWUgPT4gKCB2YWx1ZSAtIFVSQ29uc3RhbnRzLkhPVVJTX0RFTFRBICksXHJcbiAgICAgIGRlbm9taW5hdG9yRGVjaW1hbHM6IFVSQ29uc3RhbnRzLkhPVVJTX0RFQ0lNQUxTLFxyXG4gICAgICBwaWNrZXJGb250OiBuZXcgUGhldEZvbnQoIDIwIClcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggY2FyLnJhdGUsIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbnVuaXRSYXRlcy5yZWdpc3RlciggJ1JhY2VDYXJSYXRlQWNjb3JkaW9uQm94JywgUmFjZUNhclJhdGVBY2NvcmRpb25Cb3ggKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLFdBQVcsTUFBTSw2QkFBNkI7QUFDckQsT0FBT0MsZ0JBQWdCLE1BQU0sdUNBQXVDO0FBQ3BFLE9BQU9DLFNBQVMsTUFBTSxvQkFBb0I7QUFDMUMsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBRXhELGVBQWUsTUFBTUMsdUJBQXVCLFNBQVNILGdCQUFnQixDQUFDO0VBRXBFO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VJLFdBQVdBLENBQUVDLEdBQUcsRUFBRUMsT0FBTyxFQUFHO0lBRTFCQSxPQUFPLEdBQUdULEtBQUssQ0FBRTtNQUNmVSxjQUFjLEVBQUVMLGdCQUFnQixDQUFDTSxLQUFLO01BQ3RDQyxnQkFBZ0IsRUFBRVAsZ0JBQWdCLENBQUNRLEtBQUs7TUFDeENDLGNBQWMsRUFBRVosV0FBVyxDQUFDYSxXQUFXO01BQ3ZDQyxnQkFBZ0IsRUFBRWQsV0FBVyxDQUFDZSxXQUFXO01BQ3pDQyxvQkFBb0IsRUFBRVYsR0FBRyxDQUFDVyxLQUFLO01BQy9CQyxzQkFBc0IsRUFBRVosR0FBRyxDQUFDVyxLQUFLO01BQ2pDRSxnQ0FBZ0MsRUFBRVYsS0FBSyxJQUFNQSxLQUFLLEdBQUdULFdBQVcsQ0FBQ29CLFdBQWE7TUFDOUVDLGdDQUFnQyxFQUFFWixLQUFLLElBQU1BLEtBQUssR0FBR1QsV0FBVyxDQUFDb0IsV0FBYTtNQUM5RUUsa0NBQWtDLEVBQUVDLEtBQUssSUFBTUEsS0FBSyxHQUFHdkIsV0FBVyxDQUFDd0IsV0FBYTtNQUNoRkMsa0NBQWtDLEVBQUVGLEtBQUssSUFBTUEsS0FBSyxHQUFHdkIsV0FBVyxDQUFDd0IsV0FBYTtNQUNoRkUsbUJBQW1CLEVBQUUxQixXQUFXLENBQUMyQixjQUFjO01BQy9DQyxVQUFVLEVBQUUsSUFBSTdCLFFBQVEsQ0FBRSxFQUFHO0lBQy9CLENBQUMsRUFBRVEsT0FBUSxDQUFDO0lBRVosS0FBSyxDQUFFRCxHQUFHLENBQUN1QixJQUFJLEVBQUV0QixPQUFRLENBQUM7RUFDNUI7QUFDRjtBQUVBTCxTQUFTLENBQUM0QixRQUFRLENBQUUseUJBQXlCLEVBQUUxQix1QkFBd0IsQ0FBQyJ9