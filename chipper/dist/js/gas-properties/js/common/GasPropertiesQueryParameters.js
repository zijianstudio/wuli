// Copyright 2018-2022, University of Colorado Boulder

/**
 * GasPropertiesQueryParameters defines the query parameters that are specific to this sim.
 * Running with ?log will print these query parameters and their values to the console at startup.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import logGlobal from '../../../phet-core/js/logGlobal.js';
import gasProperties from '../gasProperties.js';
const GasPropertiesQueryParameters = QueryStringMachine.getAll({
  //==================================================================================================================
  // Public-facing query parameters.
  //==================================================================================================================

  /**
   * Whether to add noise to the pressure gauge to make it behave more realistically. Public facing.
   *
   * In code, this should not be used or interrogated directly. It's sole usage is to set the initial value of
   * GasPropertiesPreferences.pressureNoiseProperty. See https://github.com/phetsims/gas-properties/issues/92
   */
  pressureNoise: {
    type: 'boolean',
    defaultValue: true,
    public: true
  },
  //==================================================================================================================
  // For internal use only. Expose to the public only after discussion and promotion to public-facing.
  //==================================================================================================================

  // Shows a red dot at the origin of some UI components, for debugging layout and drag listeners.
  // For internal use only.
  origin: {
    type: 'flag'
  },
  // Fills the canvasBounds of each CanvasNode, for debugging size and position.
  // For internal use only.
  canvasBounds: {
    type: 'flag'
  },
  // Shows how the collision detection space is partitioned into a 2D grid of regions.
  // For internal use only.
  regions: {
    type: 'flag'
  },
  // Shows the model and view coordinates that correspond to the cursor position.
  // For internal use only.
  pointerCoordinates: {
    type: 'flag'
  },
  // Determines how fast particles are heated or cooled. Smaller numbers result in faster heating/cooling.
  // For internal use only.
  heatCool: {
    type: 'number',
    isValidValue: value => value > 0,
    defaultValue: 800
  },
  // Pressure at which the lid blows off of the container, in kPa.
  // For internal use only.
  maxPressure: {
    type: 'number',
    isValidValue: value => value > 0,
    defaultValue: 20000
  },
  // Maximum temperature in K. Exceeding this results in an Oops dialog.
  // For internal use only.
  maxTemperature: {
    type: 'number',
    isValidValue: value => value > 0,
    defaultValue: 100000
  },
  // Speed limit for the container's left movable wall, in pm/ps. Relevant when reducing the container size.
  // For internal use only.
  wallSpeedLimit: {
    type: 'number',
    isValidValue: value => value > 0,
    defaultValue: 800
  }
});
gasProperties.register('GasPropertiesQueryParameters', GasPropertiesQueryParameters);

// Log query parameters
logGlobal('phet.chipper.queryParameters');
logGlobal('phet.preloads.phetio.queryParameters');
logGlobal('phet.gasProperties.GasPropertiesQueryParameters');
export default GasPropertiesQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJsb2dHbG9iYWwiLCJnYXNQcm9wZXJ0aWVzIiwiR2FzUHJvcGVydGllc1F1ZXJ5UGFyYW1ldGVycyIsIlF1ZXJ5U3RyaW5nTWFjaGluZSIsImdldEFsbCIsInByZXNzdXJlTm9pc2UiLCJ0eXBlIiwiZGVmYXVsdFZhbHVlIiwicHVibGljIiwib3JpZ2luIiwiY2FudmFzQm91bmRzIiwicmVnaW9ucyIsInBvaW50ZXJDb29yZGluYXRlcyIsImhlYXRDb29sIiwiaXNWYWxpZFZhbHVlIiwidmFsdWUiLCJtYXhQcmVzc3VyZSIsIm1heFRlbXBlcmF0dXJlIiwid2FsbFNwZWVkTGltaXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdhc1Byb3BlcnRpZXNRdWVyeVBhcmFtZXRlcnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR2FzUHJvcGVydGllc1F1ZXJ5UGFyYW1ldGVycyBkZWZpbmVzIHRoZSBxdWVyeSBwYXJhbWV0ZXJzIHRoYXQgYXJlIHNwZWNpZmljIHRvIHRoaXMgc2ltLlxyXG4gKiBSdW5uaW5nIHdpdGggP2xvZyB3aWxsIHByaW50IHRoZXNlIHF1ZXJ5IHBhcmFtZXRlcnMgYW5kIHRoZWlyIHZhbHVlcyB0byB0aGUgY29uc29sZSBhdCBzdGFydHVwLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBsb2dHbG9iYWwgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2xvZ0dsb2JhbC5qcyc7XHJcbmltcG9ydCBnYXNQcm9wZXJ0aWVzIGZyb20gJy4uL2dhc1Byb3BlcnRpZXMuanMnO1xyXG5cclxuY29uc3QgR2FzUHJvcGVydGllc1F1ZXJ5UGFyYW1ldGVycyA9IFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRBbGwoIHtcclxuXHJcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBQdWJsaWMtZmFjaW5nIHF1ZXJ5IHBhcmFtZXRlcnMuXHJcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciB0byBhZGQgbm9pc2UgdG8gdGhlIHByZXNzdXJlIGdhdWdlIHRvIG1ha2UgaXQgYmVoYXZlIG1vcmUgcmVhbGlzdGljYWxseS4gUHVibGljIGZhY2luZy5cclxuICAgKlxyXG4gICAqIEluIGNvZGUsIHRoaXMgc2hvdWxkIG5vdCBiZSB1c2VkIG9yIGludGVycm9nYXRlZCBkaXJlY3RseS4gSXQncyBzb2xlIHVzYWdlIGlzIHRvIHNldCB0aGUgaW5pdGlhbCB2YWx1ZSBvZlxyXG4gICAqIEdhc1Byb3BlcnRpZXNQcmVmZXJlbmNlcy5wcmVzc3VyZU5vaXNlUHJvcGVydHkuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ2FzLXByb3BlcnRpZXMvaXNzdWVzLzkyXHJcbiAgICovXHJcbiAgcHJlc3N1cmVOb2lzZToge1xyXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgZGVmYXVsdFZhbHVlOiB0cnVlLFxyXG4gICAgcHVibGljOiB0cnVlXHJcbiAgfSxcclxuXHJcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBGb3IgaW50ZXJuYWwgdXNlIG9ubHkuIEV4cG9zZSB0byB0aGUgcHVibGljIG9ubHkgYWZ0ZXIgZGlzY3Vzc2lvbiBhbmQgcHJvbW90aW9uIHRvIHB1YmxpYy1mYWNpbmcuXHJcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLy8gU2hvd3MgYSByZWQgZG90IGF0IHRoZSBvcmlnaW4gb2Ygc29tZSBVSSBjb21wb25lbnRzLCBmb3IgZGVidWdnaW5nIGxheW91dCBhbmQgZHJhZyBsaXN0ZW5lcnMuXHJcbiAgLy8gRm9yIGludGVybmFsIHVzZSBvbmx5LlxyXG4gIG9yaWdpbjogeyB0eXBlOiAnZmxhZycgfSxcclxuXHJcbiAgLy8gRmlsbHMgdGhlIGNhbnZhc0JvdW5kcyBvZiBlYWNoIENhbnZhc05vZGUsIGZvciBkZWJ1Z2dpbmcgc2l6ZSBhbmQgcG9zaXRpb24uXHJcbiAgLy8gRm9yIGludGVybmFsIHVzZSBvbmx5LlxyXG4gIGNhbnZhc0JvdW5kczogeyB0eXBlOiAnZmxhZycgfSxcclxuXHJcbiAgLy8gU2hvd3MgaG93IHRoZSBjb2xsaXNpb24gZGV0ZWN0aW9uIHNwYWNlIGlzIHBhcnRpdGlvbmVkIGludG8gYSAyRCBncmlkIG9mIHJlZ2lvbnMuXHJcbiAgLy8gRm9yIGludGVybmFsIHVzZSBvbmx5LlxyXG4gIHJlZ2lvbnM6IHsgdHlwZTogJ2ZsYWcnIH0sXHJcblxyXG4gIC8vIFNob3dzIHRoZSBtb2RlbCBhbmQgdmlldyBjb29yZGluYXRlcyB0aGF0IGNvcnJlc3BvbmQgdG8gdGhlIGN1cnNvciBwb3NpdGlvbi5cclxuICAvLyBGb3IgaW50ZXJuYWwgdXNlIG9ubHkuXHJcbiAgcG9pbnRlckNvb3JkaW5hdGVzOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAvLyBEZXRlcm1pbmVzIGhvdyBmYXN0IHBhcnRpY2xlcyBhcmUgaGVhdGVkIG9yIGNvb2xlZC4gU21hbGxlciBudW1iZXJzIHJlc3VsdCBpbiBmYXN0ZXIgaGVhdGluZy9jb29saW5nLlxyXG4gIC8vIEZvciBpbnRlcm5hbCB1c2Ugb25seS5cclxuICBoZWF0Q29vbDoge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+ICggdmFsdWUgPiAwICksXHJcbiAgICBkZWZhdWx0VmFsdWU6IDgwMFxyXG4gIH0sXHJcblxyXG4gIC8vIFByZXNzdXJlIGF0IHdoaWNoIHRoZSBsaWQgYmxvd3Mgb2ZmIG9mIHRoZSBjb250YWluZXIsIGluIGtQYS5cclxuICAvLyBGb3IgaW50ZXJuYWwgdXNlIG9ubHkuXHJcbiAgbWF4UHJlc3N1cmU6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiAoIHZhbHVlID4gMCApLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAyMDAwMFxyXG4gIH0sXHJcblxyXG4gIC8vIE1heGltdW0gdGVtcGVyYXR1cmUgaW4gSy4gRXhjZWVkaW5nIHRoaXMgcmVzdWx0cyBpbiBhbiBPb3BzIGRpYWxvZy5cclxuICAvLyBGb3IgaW50ZXJuYWwgdXNlIG9ubHkuXHJcbiAgbWF4VGVtcGVyYXR1cmU6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiAoIHZhbHVlID4gMCApLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAxMDAwMDBcclxuICB9LFxyXG5cclxuICAvLyBTcGVlZCBsaW1pdCBmb3IgdGhlIGNvbnRhaW5lcidzIGxlZnQgbW92YWJsZSB3YWxsLCBpbiBwbS9wcy4gUmVsZXZhbnQgd2hlbiByZWR1Y2luZyB0aGUgY29udGFpbmVyIHNpemUuXHJcbiAgLy8gRm9yIGludGVybmFsIHVzZSBvbmx5LlxyXG4gIHdhbGxTcGVlZExpbWl0OiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gKCB2YWx1ZSA+IDAgKSxcclxuICAgIGRlZmF1bHRWYWx1ZTogODAwXHJcbiAgfVxyXG59ICk7XHJcblxyXG5nYXNQcm9wZXJ0aWVzLnJlZ2lzdGVyKCAnR2FzUHJvcGVydGllc1F1ZXJ5UGFyYW1ldGVycycsIEdhc1Byb3BlcnRpZXNRdWVyeVBhcmFtZXRlcnMgKTtcclxuXHJcbi8vIExvZyBxdWVyeSBwYXJhbWV0ZXJzXHJcbmxvZ0dsb2JhbCggJ3BoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMnICk7XHJcbmxvZ0dsb2JhbCggJ3BoZXQucHJlbG9hZHMucGhldGlvLnF1ZXJ5UGFyYW1ldGVycycgKTtcclxubG9nR2xvYmFsKCAncGhldC5nYXNQcm9wZXJ0aWVzLkdhc1Byb3BlcnRpZXNRdWVyeVBhcmFtZXRlcnMnICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHYXNQcm9wZXJ0aWVzUXVlcnlQYXJhbWV0ZXJzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxvQ0FBb0M7QUFDMUQsT0FBT0MsYUFBYSxNQUFNLHFCQUFxQjtBQUUvQyxNQUFNQyw0QkFBNEIsR0FBR0Msa0JBQWtCLENBQUNDLE1BQU0sQ0FBRTtFQUU5RDtFQUNBO0VBQ0E7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLGFBQWEsRUFBRTtJQUNiQyxJQUFJLEVBQUUsU0FBUztJQUNmQyxZQUFZLEVBQUUsSUFBSTtJQUNsQkMsTUFBTSxFQUFFO0VBQ1YsQ0FBQztFQUVEO0VBQ0E7RUFDQTs7RUFFQTtFQUNBO0VBQ0FDLE1BQU0sRUFBRTtJQUFFSCxJQUFJLEVBQUU7RUFBTyxDQUFDO0VBRXhCO0VBQ0E7RUFDQUksWUFBWSxFQUFFO0lBQUVKLElBQUksRUFBRTtFQUFPLENBQUM7RUFFOUI7RUFDQTtFQUNBSyxPQUFPLEVBQUU7SUFBRUwsSUFBSSxFQUFFO0VBQU8sQ0FBQztFQUV6QjtFQUNBO0VBQ0FNLGtCQUFrQixFQUFFO0lBQUVOLElBQUksRUFBRTtFQUFPLENBQUM7RUFFcEM7RUFDQTtFQUNBTyxRQUFRLEVBQUU7SUFDUlAsSUFBSSxFQUFFLFFBQVE7SUFDZFEsWUFBWSxFQUFFQyxLQUFLLElBQU1BLEtBQUssR0FBRyxDQUFHO0lBQ3BDUixZQUFZLEVBQUU7RUFDaEIsQ0FBQztFQUVEO0VBQ0E7RUFDQVMsV0FBVyxFQUFFO0lBQ1hWLElBQUksRUFBRSxRQUFRO0lBQ2RRLFlBQVksRUFBRUMsS0FBSyxJQUFNQSxLQUFLLEdBQUcsQ0FBRztJQUNwQ1IsWUFBWSxFQUFFO0VBQ2hCLENBQUM7RUFFRDtFQUNBO0VBQ0FVLGNBQWMsRUFBRTtJQUNkWCxJQUFJLEVBQUUsUUFBUTtJQUNkUSxZQUFZLEVBQUVDLEtBQUssSUFBTUEsS0FBSyxHQUFHLENBQUc7SUFDcENSLFlBQVksRUFBRTtFQUNoQixDQUFDO0VBRUQ7RUFDQTtFQUNBVyxjQUFjLEVBQUU7SUFDZFosSUFBSSxFQUFFLFFBQVE7SUFDZFEsWUFBWSxFQUFFQyxLQUFLLElBQU1BLEtBQUssR0FBRyxDQUFHO0lBQ3BDUixZQUFZLEVBQUU7RUFDaEI7QUFDRixDQUFFLENBQUM7QUFFSE4sYUFBYSxDQUFDa0IsUUFBUSxDQUFFLDhCQUE4QixFQUFFakIsNEJBQTZCLENBQUM7O0FBRXRGO0FBQ0FGLFNBQVMsQ0FBRSw4QkFBK0IsQ0FBQztBQUMzQ0EsU0FBUyxDQUFFLHNDQUF1QyxDQUFDO0FBQ25EQSxTQUFTLENBQUUsaURBQWtELENBQUM7QUFFOUQsZUFBZUUsNEJBQTRCIn0=