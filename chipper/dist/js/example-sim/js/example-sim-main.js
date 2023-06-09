// Copyright 2013-2022, University of Colorado Boulder

/**
 * This is the main entry point for the sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import ExampleSimStrings from './ExampleSimStrings.js';
import MagnetsScreen from './magnets/MagnetsScreen.js';
import ParticlesScreen from './particles/ParticlesScreen.js';
const simOptions = {
  // These credits will appear in the About dialog, accessed from the PhET menu in the navigation bar.
  // All credits fields are optional, see joist.AboutDialog.
  credits: {
    leadDesign: 'Boris',
    softwareDevelopment: 'Natasha',
    team: 'Chico, Groucho, Gummo, Harpo, Zeppo',
    qualityAssurance: 'Curly, Larry, Moe',
    graphicArts: 'Dali, Picasso, Warhol',
    thanks: 'Thanks to the ACME Dynamite Company for funding this sim!'
  }
};
simLauncher.launch(() => {
  const titleStringProperty = ExampleSimStrings['example-sim'].titleStringProperty;
  const screens = [new MagnetsScreen(), new ParticlesScreen()];
  const sim = new Sim(titleStringProperty, screens, simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIkV4YW1wbGVTaW1TdHJpbmdzIiwiTWFnbmV0c1NjcmVlbiIsIlBhcnRpY2xlc1NjcmVlbiIsInNpbU9wdGlvbnMiLCJjcmVkaXRzIiwibGVhZERlc2lnbiIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJ0ZWFtIiwicXVhbGl0eUFzc3VyYW5jZSIsImdyYXBoaWNBcnRzIiwidGhhbmtzIiwibGF1bmNoIiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInNjcmVlbnMiLCJzaW0iLCJzdGFydCJdLCJzb3VyY2VzIjpbImV4YW1wbGUtc2ltLW1haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhpcyBpcyB0aGUgbWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIHNpbS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgU2ltIGZyb20gJy4uLy4uL2pvaXN0L2pzL1NpbS5qcyc7XHJcbmltcG9ydCBzaW1MYXVuY2hlciBmcm9tICcuLi8uLi9qb2lzdC9qcy9zaW1MYXVuY2hlci5qcyc7XHJcbmltcG9ydCBFeGFtcGxlU2ltU3RyaW5ncyBmcm9tICcuL0V4YW1wbGVTaW1TdHJpbmdzLmpzJztcclxuaW1wb3J0IE1hZ25ldHNTY3JlZW4gZnJvbSAnLi9tYWduZXRzL01hZ25ldHNTY3JlZW4uanMnO1xyXG5pbXBvcnQgUGFydGljbGVzU2NyZWVuIGZyb20gJy4vcGFydGljbGVzL1BhcnRpY2xlc1NjcmVlbi5qcyc7XHJcblxyXG5jb25zdCBzaW1PcHRpb25zID0ge1xyXG5cclxuICAvLyBUaGVzZSBjcmVkaXRzIHdpbGwgYXBwZWFyIGluIHRoZSBBYm91dCBkaWFsb2csIGFjY2Vzc2VkIGZyb20gdGhlIFBoRVQgbWVudSBpbiB0aGUgbmF2aWdhdGlvbiBiYXIuXHJcbiAgLy8gQWxsIGNyZWRpdHMgZmllbGRzIGFyZSBvcHRpb25hbCwgc2VlIGpvaXN0LkFib3V0RGlhbG9nLlxyXG4gIGNyZWRpdHM6IHtcclxuICAgIGxlYWREZXNpZ246ICdCb3JpcycsXHJcbiAgICBzb2Z0d2FyZURldmVsb3BtZW50OiAnTmF0YXNoYScsXHJcbiAgICB0ZWFtOiAnQ2hpY28sIEdyb3VjaG8sIEd1bW1vLCBIYXJwbywgWmVwcG8nLFxyXG4gICAgcXVhbGl0eUFzc3VyYW5jZTogJ0N1cmx5LCBMYXJyeSwgTW9lJyxcclxuICAgIGdyYXBoaWNBcnRzOiAnRGFsaSwgUGljYXNzbywgV2FyaG9sJyxcclxuICAgIHRoYW5rczogJ1RoYW5rcyB0byB0aGUgQUNNRSBEeW5hbWl0ZSBDb21wYW55IGZvciBmdW5kaW5nIHRoaXMgc2ltISdcclxuICB9XHJcbn07XHJcblxyXG5zaW1MYXVuY2hlci5sYXVuY2goICgpID0+IHtcclxuICBjb25zdCB0aXRsZVN0cmluZ1Byb3BlcnR5ID0gRXhhbXBsZVNpbVN0cmluZ3NbICdleGFtcGxlLXNpbScgXS50aXRsZVN0cmluZ1Byb3BlcnR5O1xyXG4gIGNvbnN0IHNjcmVlbnMgPSBbIG5ldyBNYWduZXRzU2NyZWVuKCksIG5ldyBQYXJ0aWNsZXNTY3JlZW4oKSBdO1xyXG4gIGNvbnN0IHNpbSA9IG5ldyBTaW0oIHRpdGxlU3RyaW5nUHJvcGVydHksIHNjcmVlbnMsIHNpbU9wdGlvbnMgKTtcclxuICBzaW0uc3RhcnQoKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEdBQUcsTUFBTSx1QkFBdUI7QUFDdkMsT0FBT0MsV0FBVyxNQUFNLCtCQUErQjtBQUN2RCxPQUFPQyxpQkFBaUIsTUFBTSx3QkFBd0I7QUFDdEQsT0FBT0MsYUFBYSxNQUFNLDRCQUE0QjtBQUN0RCxPQUFPQyxlQUFlLE1BQU0sZ0NBQWdDO0FBRTVELE1BQU1DLFVBQVUsR0FBRztFQUVqQjtFQUNBO0VBQ0FDLE9BQU8sRUFBRTtJQUNQQyxVQUFVLEVBQUUsT0FBTztJQUNuQkMsbUJBQW1CLEVBQUUsU0FBUztJQUM5QkMsSUFBSSxFQUFFLHFDQUFxQztJQUMzQ0MsZ0JBQWdCLEVBQUUsbUJBQW1CO0lBQ3JDQyxXQUFXLEVBQUUsdUJBQXVCO0lBQ3BDQyxNQUFNLEVBQUU7RUFDVjtBQUNGLENBQUM7QUFFRFgsV0FBVyxDQUFDWSxNQUFNLENBQUUsTUFBTTtFQUN4QixNQUFNQyxtQkFBbUIsR0FBR1osaUJBQWlCLENBQUUsYUFBYSxDQUFFLENBQUNZLG1CQUFtQjtFQUNsRixNQUFNQyxPQUFPLEdBQUcsQ0FBRSxJQUFJWixhQUFhLENBQUMsQ0FBQyxFQUFFLElBQUlDLGVBQWUsQ0FBQyxDQUFDLENBQUU7RUFDOUQsTUFBTVksR0FBRyxHQUFHLElBQUloQixHQUFHLENBQUVjLG1CQUFtQixFQUFFQyxPQUFPLEVBQUVWLFVBQVcsQ0FBQztFQUMvRFcsR0FBRyxDQUFDQyxLQUFLLENBQUMsQ0FBQztBQUNiLENBQUUsQ0FBQyJ9