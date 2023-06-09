// Copyright 2016-2020, University of Colorado Boulder

/**
 * Constants that are shared between the various portions of the Gravity Force Lab simulation.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import Range from '../../dot/js/Range.js';
import Mass from '../../gravity-force-lab/js/model/Mass.js';
import gravityForceLabBasics from './gravityForceLabBasics.js';

// constants
const BILLION_MULTIPLIER = 1000000000;
const MIN_MASS = 1.00 * BILLION_MULTIPLIER; // kg
const MAX_MASS = 10.0 * BILLION_MULTIPLIER; // kg
const MAX_DISTANCE_FROM_CENTER = 5000; // meters, empirically determined boundary for masses
const MASS_DENSITY = 1.5; // kg/m^3

const GFLBConstants = {
  BACKGROUND_COLOR_PROPERTY: new Property('#ffffc2'),
  BILLION_MULTIPLIER: BILLION_MULTIPLIER,
  // a billion for scaling values (since basics version uses billions of kg)
  MASS_RANGE: new Range(MIN_MASS, MAX_MASS),
  MASS_DENSITY: MASS_DENSITY,
  CONSTANT_RADIUS: Mass.calculateRadius(MIN_MASS, MASS_DENSITY),
  // meters
  MIN_DISTANCE_BETWEEN_MASSES: 200,
  // meters
  PULL_POSITION_RANGE: new Range(-MAX_DISTANCE_FROM_CENTER, MAX_DISTANCE_FROM_CENTER),
  MASS_POSITION_DELTA: 100,
  // in m, masses can move in 0.1 km increments and will snap to these positions
  MASS_STEP_SIZE: 500 // in m, each time the mass is moved with a keyboard
};

gravityForceLabBasics.register('GFLBConstants', GFLBConstants);
export default GFLBConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlJhbmdlIiwiTWFzcyIsImdyYXZpdHlGb3JjZUxhYkJhc2ljcyIsIkJJTExJT05fTVVMVElQTElFUiIsIk1JTl9NQVNTIiwiTUFYX01BU1MiLCJNQVhfRElTVEFOQ0VfRlJPTV9DRU5URVIiLCJNQVNTX0RFTlNJVFkiLCJHRkxCQ29uc3RhbnRzIiwiQkFDS0dST1VORF9DT0xPUl9QUk9QRVJUWSIsIk1BU1NfUkFOR0UiLCJDT05TVEFOVF9SQURJVVMiLCJjYWxjdWxhdGVSYWRpdXMiLCJNSU5fRElTVEFOQ0VfQkVUV0VFTl9NQVNTRVMiLCJQVUxMX1BPU0lUSU9OX1JBTkdFIiwiTUFTU19QT1NJVElPTl9ERUxUQSIsIk1BU1NfU1RFUF9TSVpFIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHRkxCQ29uc3RhbnRzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbnN0YW50cyB0aGF0IGFyZSBzaGFyZWQgYmV0d2VlbiB0aGUgdmFyaW91cyBwb3J0aW9ucyBvZiB0aGUgR3Jhdml0eSBGb3JjZSBMYWIgc2ltdWxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgTWFzcyBmcm9tICcuLi8uLi9ncmF2aXR5LWZvcmNlLWxhYi9qcy9tb2RlbC9NYXNzLmpzJztcclxuaW1wb3J0IGdyYXZpdHlGb3JjZUxhYkJhc2ljcyBmcm9tICcuL2dyYXZpdHlGb3JjZUxhYkJhc2ljcy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQklMTElPTl9NVUxUSVBMSUVSID0gMTAwMDAwMDAwMDtcclxuY29uc3QgTUlOX01BU1MgPSAxLjAwICogQklMTElPTl9NVUxUSVBMSUVSOyAvLyBrZ1xyXG5jb25zdCBNQVhfTUFTUyA9IDEwLjAgKiBCSUxMSU9OX01VTFRJUExJRVI7IC8vIGtnXHJcbmNvbnN0IE1BWF9ESVNUQU5DRV9GUk9NX0NFTlRFUiA9IDUwMDA7IC8vIG1ldGVycywgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCBib3VuZGFyeSBmb3IgbWFzc2VzXHJcbmNvbnN0IE1BU1NfREVOU0lUWSA9IDEuNTsgLy8ga2cvbV4zXHJcblxyXG5jb25zdCBHRkxCQ29uc3RhbnRzID0ge1xyXG4gIEJBQ0tHUk9VTkRfQ09MT1JfUFJPUEVSVFk6IG5ldyBQcm9wZXJ0eSggJyNmZmZmYzInICksXHJcbiAgQklMTElPTl9NVUxUSVBMSUVSOiBCSUxMSU9OX01VTFRJUExJRVIsIC8vIGEgYmlsbGlvbiBmb3Igc2NhbGluZyB2YWx1ZXMgKHNpbmNlIGJhc2ljcyB2ZXJzaW9uIHVzZXMgYmlsbGlvbnMgb2Yga2cpXHJcbiAgTUFTU19SQU5HRTogbmV3IFJhbmdlKCBNSU5fTUFTUywgTUFYX01BU1MgKSxcclxuICBNQVNTX0RFTlNJVFk6IE1BU1NfREVOU0lUWSxcclxuICBDT05TVEFOVF9SQURJVVM6IE1hc3MuY2FsY3VsYXRlUmFkaXVzKCBNSU5fTUFTUywgTUFTU19ERU5TSVRZICksIC8vIG1ldGVyc1xyXG4gIE1JTl9ESVNUQU5DRV9CRVRXRUVOX01BU1NFUzogMjAwLCAvLyBtZXRlcnNcclxuICBQVUxMX1BPU0lUSU9OX1JBTkdFOiBuZXcgUmFuZ2UoIC1NQVhfRElTVEFOQ0VfRlJPTV9DRU5URVIsIE1BWF9ESVNUQU5DRV9GUk9NX0NFTlRFUiApLFxyXG4gIE1BU1NfUE9TSVRJT05fREVMVEE6IDEwMCwgLy8gaW4gbSwgbWFzc2VzIGNhbiBtb3ZlIGluIDAuMSBrbSBpbmNyZW1lbnRzIGFuZCB3aWxsIHNuYXAgdG8gdGhlc2UgcG9zaXRpb25zXHJcbiAgTUFTU19TVEVQX1NJWkU6IDUwMCAvLyBpbiBtLCBlYWNoIHRpbWUgdGhlIG1hc3MgaXMgbW92ZWQgd2l0aCBhIGtleWJvYXJkXHJcbn07XHJcblxyXG5ncmF2aXR5Rm9yY2VMYWJCYXNpY3MucmVnaXN0ZXIoICdHRkxCQ29uc3RhbnRzJywgR0ZMQkNvbnN0YW50cyApO1xyXG5leHBvcnQgZGVmYXVsdCBHRkxCQ29uc3RhbnRzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sMkJBQTJCO0FBQ2hELE9BQU9DLEtBQUssTUFBTSx1QkFBdUI7QUFDekMsT0FBT0MsSUFBSSxNQUFNLDBDQUEwQztBQUMzRCxPQUFPQyxxQkFBcUIsTUFBTSw0QkFBNEI7O0FBRTlEO0FBQ0EsTUFBTUMsa0JBQWtCLEdBQUcsVUFBVTtBQUNyQyxNQUFNQyxRQUFRLEdBQUcsSUFBSSxHQUFHRCxrQkFBa0IsQ0FBQyxDQUFDO0FBQzVDLE1BQU1FLFFBQVEsR0FBRyxJQUFJLEdBQUdGLGtCQUFrQixDQUFDLENBQUM7QUFDNUMsTUFBTUcsd0JBQXdCLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDdkMsTUFBTUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxDQUFDOztBQUUxQixNQUFNQyxhQUFhLEdBQUc7RUFDcEJDLHlCQUF5QixFQUFFLElBQUlWLFFBQVEsQ0FBRSxTQUFVLENBQUM7RUFDcERJLGtCQUFrQixFQUFFQSxrQkFBa0I7RUFBRTtFQUN4Q08sVUFBVSxFQUFFLElBQUlWLEtBQUssQ0FBRUksUUFBUSxFQUFFQyxRQUFTLENBQUM7RUFDM0NFLFlBQVksRUFBRUEsWUFBWTtFQUMxQkksZUFBZSxFQUFFVixJQUFJLENBQUNXLGVBQWUsQ0FBRVIsUUFBUSxFQUFFRyxZQUFhLENBQUM7RUFBRTtFQUNqRU0sMkJBQTJCLEVBQUUsR0FBRztFQUFFO0VBQ2xDQyxtQkFBbUIsRUFBRSxJQUFJZCxLQUFLLENBQUUsQ0FBQ00sd0JBQXdCLEVBQUVBLHdCQUF5QixDQUFDO0VBQ3JGUyxtQkFBbUIsRUFBRSxHQUFHO0VBQUU7RUFDMUJDLGNBQWMsRUFBRSxHQUFHLENBQUM7QUFDdEIsQ0FBQzs7QUFFRGQscUJBQXFCLENBQUNlLFFBQVEsQ0FBRSxlQUFlLEVBQUVULGFBQWMsQ0FBQztBQUNoRSxlQUFlQSxhQUFhIn0=