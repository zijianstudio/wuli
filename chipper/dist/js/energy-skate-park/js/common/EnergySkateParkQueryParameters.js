// Copyright 2016-2021, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import energySkatePark from '../energySkatePark.js';
const EnergySkateParkQueryParameters = QueryStringMachine.getAll({
  // Print out console messages related to the physics
  debugLog: {
    type: 'flag'
  },
  // Print out console messages related to attaching and detaching from the tracks
  debugAttachDetach: {
    type: 'flag'
  },
  // Shows the drag bounds for the control points on the premade tracks - normal behavior is for them to only be
  // visible during drag
  showPointBounds: {
    type: 'flag'
  },
  // Changes the units for acceleration due to gravity from m/s^2 to N/kg, as requested by
  // a user. So this is definitely public. - see https://github.com/phetsims/energy-skate-park/issues/293 for request issue
  // @public
  altAccelerationUnits: {
    type: 'flag',
    public: true
  },
  // This indicates the index (1-based) of the track to show, and enables some other track debugging
  testTrackIndex: {
    type: 'number',
    defaultValue: 0
  }
});
energySkatePark.register('EnergySkateParkQueryParameters', EnergySkateParkQueryParameters);
export default EnergySkateParkQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJlbmVyZ3lTa2F0ZVBhcmsiLCJFbmVyZ3lTa2F0ZVBhcmtRdWVyeVBhcmFtZXRlcnMiLCJRdWVyeVN0cmluZ01hY2hpbmUiLCJnZXRBbGwiLCJkZWJ1Z0xvZyIsInR5cGUiLCJkZWJ1Z0F0dGFjaERldGFjaCIsInNob3dQb2ludEJvdW5kcyIsImFsdEFjY2VsZXJhdGlvblVuaXRzIiwicHVibGljIiwidGVzdFRyYWNrSW5kZXgiLCJkZWZhdWx0VmFsdWUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVuZXJneVNrYXRlUGFya1F1ZXJ5UGFyYW1ldGVycy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBRdWVyeSBwYXJhbWV0ZXJzIHN1cHBvcnRlZCBieSB0aGlzIHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IGVuZXJneVNrYXRlUGFyayBmcm9tICcuLi9lbmVyZ3lTa2F0ZVBhcmsuanMnO1xyXG5cclxuY29uc3QgRW5lcmd5U2thdGVQYXJrUXVlcnlQYXJhbWV0ZXJzID0gUXVlcnlTdHJpbmdNYWNoaW5lLmdldEFsbCgge1xyXG5cclxuICAvLyBQcmludCBvdXQgY29uc29sZSBtZXNzYWdlcyByZWxhdGVkIHRvIHRoZSBwaHlzaWNzXHJcbiAgZGVidWdMb2c6IHsgdHlwZTogJ2ZsYWcnIH0sXHJcblxyXG4gIC8vIFByaW50IG91dCBjb25zb2xlIG1lc3NhZ2VzIHJlbGF0ZWQgdG8gYXR0YWNoaW5nIGFuZCBkZXRhY2hpbmcgZnJvbSB0aGUgdHJhY2tzXHJcbiAgZGVidWdBdHRhY2hEZXRhY2g6IHsgdHlwZTogJ2ZsYWcnIH0sXHJcblxyXG4gIC8vIFNob3dzIHRoZSBkcmFnIGJvdW5kcyBmb3IgdGhlIGNvbnRyb2wgcG9pbnRzIG9uIHRoZSBwcmVtYWRlIHRyYWNrcyAtIG5vcm1hbCBiZWhhdmlvciBpcyBmb3IgdGhlbSB0byBvbmx5IGJlXHJcbiAgLy8gdmlzaWJsZSBkdXJpbmcgZHJhZ1xyXG4gIHNob3dQb2ludEJvdW5kczogeyB0eXBlOiAnZmxhZycgfSxcclxuXHJcbiAgLy8gQ2hhbmdlcyB0aGUgdW5pdHMgZm9yIGFjY2VsZXJhdGlvbiBkdWUgdG8gZ3Jhdml0eSBmcm9tIG0vc14yIHRvIE4va2csIGFzIHJlcXVlc3RlZCBieVxyXG4gIC8vIGEgdXNlci4gU28gdGhpcyBpcyBkZWZpbml0ZWx5IHB1YmxpYy4gLSBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VuZXJneS1za2F0ZS1wYXJrL2lzc3Vlcy8yOTMgZm9yIHJlcXVlc3QgaXNzdWVcclxuICAvLyBAcHVibGljXHJcbiAgYWx0QWNjZWxlcmF0aW9uVW5pdHM6IHsgdHlwZTogJ2ZsYWcnLCBwdWJsaWM6IHRydWUgfSxcclxuXHJcbiAgLy8gVGhpcyBpbmRpY2F0ZXMgdGhlIGluZGV4ICgxLWJhc2VkKSBvZiB0aGUgdHJhY2sgdG8gc2hvdywgYW5kIGVuYWJsZXMgc29tZSBvdGhlciB0cmFjayBkZWJ1Z2dpbmdcclxuICB0ZXN0VHJhY2tJbmRleDoge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IDBcclxuICB9XHJcbn0gKTtcclxuXHJcbmVuZXJneVNrYXRlUGFyay5yZWdpc3RlciggJ0VuZXJneVNrYXRlUGFya1F1ZXJ5UGFyYW1ldGVycycsIEVuZXJneVNrYXRlUGFya1F1ZXJ5UGFyYW1ldGVycyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRW5lcmd5U2thdGVQYXJrUXVlcnlQYXJhbWV0ZXJzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sdUJBQXVCO0FBRW5ELE1BQU1DLDhCQUE4QixHQUFHQyxrQkFBa0IsQ0FBQ0MsTUFBTSxDQUFFO0VBRWhFO0VBQ0FDLFFBQVEsRUFBRTtJQUFFQyxJQUFJLEVBQUU7RUFBTyxDQUFDO0VBRTFCO0VBQ0FDLGlCQUFpQixFQUFFO0lBQUVELElBQUksRUFBRTtFQUFPLENBQUM7RUFFbkM7RUFDQTtFQUNBRSxlQUFlLEVBQUU7SUFBRUYsSUFBSSxFQUFFO0VBQU8sQ0FBQztFQUVqQztFQUNBO0VBQ0E7RUFDQUcsb0JBQW9CLEVBQUU7SUFBRUgsSUFBSSxFQUFFLE1BQU07SUFBRUksTUFBTSxFQUFFO0VBQUssQ0FBQztFQUVwRDtFQUNBQyxjQUFjLEVBQUU7SUFDZEwsSUFBSSxFQUFFLFFBQVE7SUFDZE0sWUFBWSxFQUFFO0VBQ2hCO0FBQ0YsQ0FBRSxDQUFDO0FBRUhYLGVBQWUsQ0FBQ1ksUUFBUSxDQUFFLGdDQUFnQyxFQUFFWCw4QkFBK0IsQ0FBQztBQUU1RixlQUFlQSw4QkFBOEIifQ==