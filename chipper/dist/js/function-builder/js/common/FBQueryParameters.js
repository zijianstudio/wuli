// Copyright 2015-2021, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import logGlobal from '../../../phet-core/js/logGlobal.js';
import functionBuilder from '../functionBuilder.js';
const FBQueryParameters = QueryStringMachine.getAll({
  // Adds the 'Test' screen.
  // For internal use only.
  testScreen: {
    type: 'flag'
  },
  // Populates the output carousel with 1 card of each type.
  // For internal use only.
  populateOutput: {
    type: 'flag'
  },
  // Puts a red stroke around containers in the carousels, so that empty containers are visible.
  // For internal use only.
  showContainers: {
    type: 'flag'
  },
  // Plays all Mystery challenges, in order.
  // For internal use only.
  playAll: {
    type: 'flag'
  },
  // Shows all colors, in order that they appear in pool, for Mystery challenges.
  // For internal use only.
  showAllColors: {
    type: 'flag'
  }
});
functionBuilder.register('FBQueryParameters', FBQueryParameters);

// Log query parameters
logGlobal('phet.chipper.queryParameters');
logGlobal('phet.preloads.phetio.queryParameters');
logGlobal('phet.functionBuilder.FBQueryParameters');
export default FBQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJsb2dHbG9iYWwiLCJmdW5jdGlvbkJ1aWxkZXIiLCJGQlF1ZXJ5UGFyYW1ldGVycyIsIlF1ZXJ5U3RyaW5nTWFjaGluZSIsImdldEFsbCIsInRlc3RTY3JlZW4iLCJ0eXBlIiwicG9wdWxhdGVPdXRwdXQiLCJzaG93Q29udGFpbmVycyIsInBsYXlBbGwiLCJzaG93QWxsQ29sb3JzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJGQlF1ZXJ5UGFyYW1ldGVycy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBRdWVyeSBwYXJhbWV0ZXJzIHN1cHBvcnRlZCBieSB0aGlzIHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IGxvZ0dsb2JhbCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbG9nR2xvYmFsLmpzJztcclxuaW1wb3J0IGZ1bmN0aW9uQnVpbGRlciBmcm9tICcuLi9mdW5jdGlvbkJ1aWxkZXIuanMnO1xyXG5cclxuY29uc3QgRkJRdWVyeVBhcmFtZXRlcnMgPSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0QWxsKCB7XHJcblxyXG4gIC8vIEFkZHMgdGhlICdUZXN0JyBzY3JlZW4uXHJcbiAgLy8gRm9yIGludGVybmFsIHVzZSBvbmx5LlxyXG4gIHRlc3RTY3JlZW46IHsgdHlwZTogJ2ZsYWcnIH0sXHJcblxyXG4gIC8vIFBvcHVsYXRlcyB0aGUgb3V0cHV0IGNhcm91c2VsIHdpdGggMSBjYXJkIG9mIGVhY2ggdHlwZS5cclxuICAvLyBGb3IgaW50ZXJuYWwgdXNlIG9ubHkuXHJcbiAgcG9wdWxhdGVPdXRwdXQ6IHsgdHlwZTogJ2ZsYWcnIH0sXHJcblxyXG4gIC8vIFB1dHMgYSByZWQgc3Ryb2tlIGFyb3VuZCBjb250YWluZXJzIGluIHRoZSBjYXJvdXNlbHMsIHNvIHRoYXQgZW1wdHkgY29udGFpbmVycyBhcmUgdmlzaWJsZS5cclxuICAvLyBGb3IgaW50ZXJuYWwgdXNlIG9ubHkuXHJcbiAgc2hvd0NvbnRhaW5lcnM6IHsgdHlwZTogJ2ZsYWcnIH0sXHJcblxyXG4gIC8vIFBsYXlzIGFsbCBNeXN0ZXJ5IGNoYWxsZW5nZXMsIGluIG9yZGVyLlxyXG4gIC8vIEZvciBpbnRlcm5hbCB1c2Ugb25seS5cclxuICBwbGF5QWxsOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAvLyBTaG93cyBhbGwgY29sb3JzLCBpbiBvcmRlciB0aGF0IHRoZXkgYXBwZWFyIGluIHBvb2wsIGZvciBNeXN0ZXJ5IGNoYWxsZW5nZXMuXHJcbiAgLy8gRm9yIGludGVybmFsIHVzZSBvbmx5LlxyXG4gIHNob3dBbGxDb2xvcnM6IHsgdHlwZTogJ2ZsYWcnIH1cclxufSApO1xyXG5cclxuZnVuY3Rpb25CdWlsZGVyLnJlZ2lzdGVyKCAnRkJRdWVyeVBhcmFtZXRlcnMnLCBGQlF1ZXJ5UGFyYW1ldGVycyApO1xyXG5cclxuLy8gTG9nIHF1ZXJ5IHBhcmFtZXRlcnNcclxubG9nR2xvYmFsKCAncGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycycgKTtcclxubG9nR2xvYmFsKCAncGhldC5wcmVsb2Fkcy5waGV0aW8ucXVlcnlQYXJhbWV0ZXJzJyApO1xyXG5sb2dHbG9iYWwoICdwaGV0LmZ1bmN0aW9uQnVpbGRlci5GQlF1ZXJ5UGFyYW1ldGVycycgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEZCUXVlcnlQYXJhbWV0ZXJzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sb0NBQW9DO0FBQzFELE9BQU9DLGVBQWUsTUFBTSx1QkFBdUI7QUFFbkQsTUFBTUMsaUJBQWlCLEdBQUdDLGtCQUFrQixDQUFDQyxNQUFNLENBQUU7RUFFbkQ7RUFDQTtFQUNBQyxVQUFVLEVBQUU7SUFBRUMsSUFBSSxFQUFFO0VBQU8sQ0FBQztFQUU1QjtFQUNBO0VBQ0FDLGNBQWMsRUFBRTtJQUFFRCxJQUFJLEVBQUU7RUFBTyxDQUFDO0VBRWhDO0VBQ0E7RUFDQUUsY0FBYyxFQUFFO0lBQUVGLElBQUksRUFBRTtFQUFPLENBQUM7RUFFaEM7RUFDQTtFQUNBRyxPQUFPLEVBQUU7SUFBRUgsSUFBSSxFQUFFO0VBQU8sQ0FBQztFQUV6QjtFQUNBO0VBQ0FJLGFBQWEsRUFBRTtJQUFFSixJQUFJLEVBQUU7RUFBTztBQUNoQyxDQUFFLENBQUM7QUFFSEwsZUFBZSxDQUFDVSxRQUFRLENBQUUsbUJBQW1CLEVBQUVULGlCQUFrQixDQUFDOztBQUVsRTtBQUNBRixTQUFTLENBQUUsOEJBQStCLENBQUM7QUFDM0NBLFNBQVMsQ0FBRSxzQ0FBdUMsQ0FBQztBQUNuREEsU0FBUyxDQUFFLHdDQUF5QyxDQUFDO0FBRXJELGVBQWVFLGlCQUFpQiJ9