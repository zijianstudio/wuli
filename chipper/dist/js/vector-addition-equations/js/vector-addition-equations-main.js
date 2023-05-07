// Copyright 2019-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import VectorAdditionConstants from '../../vector-addition/js/common/VectorAdditionConstants.js';
import EquationsScreen from '../../vector-addition/js/equations/EquationsScreen.js';
import VectorAdditionEquationsStrings from './VectorAdditionEquationsStrings.js';
simLauncher.launch(() => {
  const screens = [new EquationsScreen(Tandem.ROOT.createTandem('vectorAdditionEquationsScreen'))];
  const sim = new Sim(VectorAdditionEquationsStrings['vector-addition-equations'].titleStringProperty, screens, {
    credits: VectorAdditionConstants.CREDITS
  });
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIlRhbmRlbSIsIlZlY3RvckFkZGl0aW9uQ29uc3RhbnRzIiwiRXF1YXRpb25zU2NyZWVuIiwiVmVjdG9yQWRkaXRpb25FcXVhdGlvbnNTdHJpbmdzIiwibGF1bmNoIiwic2NyZWVucyIsIlJPT1QiLCJjcmVhdGVUYW5kZW0iLCJzaW0iLCJ0aXRsZVN0cmluZ1Byb3BlcnR5IiwiY3JlZGl0cyIsIkNSRURJVFMiLCJzdGFydCJdLCJzb3VyY2VzIjpbInZlY3Rvci1hZGRpdGlvbi1lcXVhdGlvbnMtbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYWluIGVudHJ5IHBvaW50IGZvciB0aGUgc2ltLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTaW0gZnJvbSAnLi4vLi4vam9pc3QvanMvU2ltLmpzJztcclxuaW1wb3J0IHNpbUxhdW5jaGVyIGZyb20gJy4uLy4uL2pvaXN0L2pzL3NpbUxhdW5jaGVyLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzIGZyb20gJy4uLy4uL3ZlY3Rvci1hZGRpdGlvbi9qcy9jb21tb24vVmVjdG9yQWRkaXRpb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgRXF1YXRpb25zU2NyZWVuIGZyb20gJy4uLy4uL3ZlY3Rvci1hZGRpdGlvbi9qcy9lcXVhdGlvbnMvRXF1YXRpb25zU2NyZWVuLmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uRXF1YXRpb25zU3RyaW5ncyBmcm9tICcuL1ZlY3RvckFkZGl0aW9uRXF1YXRpb25zU3RyaW5ncy5qcyc7XHJcblxyXG5zaW1MYXVuY2hlci5sYXVuY2goICgpID0+IHtcclxuXHJcbiAgY29uc3Qgc2NyZWVucyA9IFtcclxuICAgIG5ldyBFcXVhdGlvbnNTY3JlZW4oIFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggJ3ZlY3RvckFkZGl0aW9uRXF1YXRpb25zU2NyZWVuJyApIClcclxuICBdO1xyXG5cclxuICBjb25zdCBzaW0gPSBuZXcgU2ltKCBWZWN0b3JBZGRpdGlvbkVxdWF0aW9uc1N0cmluZ3NbICd2ZWN0b3ItYWRkaXRpb24tZXF1YXRpb25zJyBdLnRpdGxlU3RyaW5nUHJvcGVydHksIHNjcmVlbnMsIHtcclxuICAgIGNyZWRpdHM6IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLkNSRURJVFNcclxuICB9ICk7XHJcblxyXG4gIHNpbS5zdGFydCgpO1xyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEdBQUcsTUFBTSx1QkFBdUI7QUFDdkMsT0FBT0MsV0FBVyxNQUFNLCtCQUErQjtBQUN2RCxPQUFPQyxNQUFNLE1BQU0sMkJBQTJCO0FBQzlDLE9BQU9DLHVCQUF1QixNQUFNLDREQUE0RDtBQUNoRyxPQUFPQyxlQUFlLE1BQU0sdURBQXVEO0FBQ25GLE9BQU9DLDhCQUE4QixNQUFNLHFDQUFxQztBQUVoRkosV0FBVyxDQUFDSyxNQUFNLENBQUUsTUFBTTtFQUV4QixNQUFNQyxPQUFPLEdBQUcsQ0FDZCxJQUFJSCxlQUFlLENBQUVGLE1BQU0sQ0FBQ00sSUFBSSxDQUFDQyxZQUFZLENBQUUsK0JBQWdDLENBQUUsQ0FBQyxDQUNuRjtFQUVELE1BQU1DLEdBQUcsR0FBRyxJQUFJVixHQUFHLENBQUVLLDhCQUE4QixDQUFFLDJCQUEyQixDQUFFLENBQUNNLG1CQUFtQixFQUFFSixPQUFPLEVBQUU7SUFDL0dLLE9BQU8sRUFBRVQsdUJBQXVCLENBQUNVO0VBQ25DLENBQUUsQ0FBQztFQUVISCxHQUFHLENBQUNJLEtBQUssQ0FBQyxDQUFDO0FBQ2IsQ0FBRSxDQUFDIn0=