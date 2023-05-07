// Copyright 2020-2022, University of Colorado Boulder

/**
 * SimulationMode enumerates the simulation modes. The mode determines which UI components are available,
 * whether the clock is running, etc.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import naturalSelection from '../../naturalSelection.js';
export default class SimulationMode extends EnumerationValue {
  // the simulation is staged, but waiting for the user press 'Add a Mate' or 'Play' button
  static STAGED = new SimulationMode();

  // the simulation is active
  static ACTIVE = new SimulationMode();

  // the simulation has completed and the user is reviewing results
  static COMPLETED = new SimulationMode();
  static enumeration = new Enumeration(SimulationMode);
}
naturalSelection.register('SimulationMode', SimulationMode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJuYXR1cmFsU2VsZWN0aW9uIiwiU2ltdWxhdGlvbk1vZGUiLCJTVEFHRUQiLCJBQ1RJVkUiLCJDT01QTEVURUQiLCJlbnVtZXJhdGlvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2ltdWxhdGlvbk1vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2ltdWxhdGlvbk1vZGUgZW51bWVyYXRlcyB0aGUgc2ltdWxhdGlvbiBtb2Rlcy4gVGhlIG1vZGUgZGV0ZXJtaW5lcyB3aGljaCBVSSBjb21wb25lbnRzIGFyZSBhdmFpbGFibGUsXHJcbiAqIHdoZXRoZXIgdGhlIGNsb2NrIGlzIHJ1bm5pbmcsIGV0Yy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uVmFsdWUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uVmFsdWUuanMnO1xyXG5pbXBvcnQgbmF0dXJhbFNlbGVjdGlvbiBmcm9tICcuLi8uLi9uYXR1cmFsU2VsZWN0aW9uLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpbXVsYXRpb25Nb2RlIGV4dGVuZHMgRW51bWVyYXRpb25WYWx1ZSB7XHJcblxyXG4gIC8vIHRoZSBzaW11bGF0aW9uIGlzIHN0YWdlZCwgYnV0IHdhaXRpbmcgZm9yIHRoZSB1c2VyIHByZXNzICdBZGQgYSBNYXRlJyBvciAnUGxheScgYnV0dG9uXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBTVEFHRUQgPSBuZXcgU2ltdWxhdGlvbk1vZGUoKTtcclxuXHJcbiAgLy8gdGhlIHNpbXVsYXRpb24gaXMgYWN0aXZlXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBBQ1RJVkUgPSBuZXcgU2ltdWxhdGlvbk1vZGUoKTtcclxuXHJcbiAgLy8gdGhlIHNpbXVsYXRpb24gaGFzIGNvbXBsZXRlZCBhbmQgdGhlIHVzZXIgaXMgcmV2aWV3aW5nIHJlc3VsdHNcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IENPTVBMRVRFRCA9IG5ldyBTaW11bGF0aW9uTW9kZSgpO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGVudW1lcmF0aW9uID0gbmV3IEVudW1lcmF0aW9uKCBTaW11bGF0aW9uTW9kZSApO1xyXG59XHJcblxyXG5uYXR1cmFsU2VsZWN0aW9uLnJlZ2lzdGVyKCAnU2ltdWxhdGlvbk1vZGUnLCBTaW11bGF0aW9uTW9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsT0FBT0MsZ0JBQWdCLE1BQU0sOENBQThDO0FBQzNFLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUV4RCxlQUFlLE1BQU1DLGNBQWMsU0FBU0YsZ0JBQWdCLENBQUM7RUFFM0Q7RUFDQSxPQUF1QkcsTUFBTSxHQUFHLElBQUlELGNBQWMsQ0FBQyxDQUFDOztFQUVwRDtFQUNBLE9BQXVCRSxNQUFNLEdBQUcsSUFBSUYsY0FBYyxDQUFDLENBQUM7O0VBRXBEO0VBQ0EsT0FBdUJHLFNBQVMsR0FBRyxJQUFJSCxjQUFjLENBQUMsQ0FBQztFQUV2RCxPQUF1QkksV0FBVyxHQUFHLElBQUlQLFdBQVcsQ0FBRUcsY0FBZSxDQUFDO0FBQ3hFO0FBRUFELGdCQUFnQixDQUFDTSxRQUFRLENBQUUsZ0JBQWdCLEVBQUVMLGNBQWUsQ0FBQyJ9