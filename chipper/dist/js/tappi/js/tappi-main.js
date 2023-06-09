// Copyright 2019-2022, University of Colorado Boulder

/**
 * Main entry point for the demo and test harness for this library.
 *
 * @author Jesse Greenberg
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import BasicsScreen from './demo/basics/BasicsScreen.js';
import PatternsScreen from './demo/patterns/PatternsScreen.js';
import TappiStrings from './TappiStrings.js';
const tappiTitleStringProperty = TappiStrings.tappi.titleStringProperty;
const simOptions = {
  credits: {
    //TODO fill in credits, all of these fields are optional, see joist.CreditsNode
    leadDesign: '',
    softwareDevelopment: '',
    team: '',
    qualityAssurance: '',
    graphicArts: '',
    soundDesign: '',
    thanks: ''
  }
};

// launch the sim - beware that scenery Image nodes created outside of simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch(() => {
  const sim = new Sim(tappiTitleStringProperty, [new BasicsScreen(Tandem.ROOT.createTandem('basicsScreen')), new PatternsScreen()], simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIlRhbmRlbSIsIkJhc2ljc1NjcmVlbiIsIlBhdHRlcm5zU2NyZWVuIiwiVGFwcGlTdHJpbmdzIiwidGFwcGlUaXRsZVN0cmluZ1Byb3BlcnR5IiwidGFwcGkiLCJ0aXRsZVN0cmluZ1Byb3BlcnR5Iiwic2ltT3B0aW9ucyIsImNyZWRpdHMiLCJsZWFkRGVzaWduIiwic29mdHdhcmVEZXZlbG9wbWVudCIsInRlYW0iLCJxdWFsaXR5QXNzdXJhbmNlIiwiZ3JhcGhpY0FydHMiLCJzb3VuZERlc2lnbiIsInRoYW5rcyIsImxhdW5jaCIsInNpbSIsIlJPT1QiLCJjcmVhdGVUYW5kZW0iLCJzdGFydCJdLCJzb3VyY2VzIjpbInRhcHBpLW1haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIGRlbW8gYW5kIHRlc3QgaGFybmVzcyBmb3IgdGhpcyBsaWJyYXJ5LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKi9cclxuXHJcbmltcG9ydCBTaW0sIHsgU2ltT3B0aW9ucyB9IGZyb20gJy4uLy4uL2pvaXN0L2pzL1NpbS5qcyc7XHJcbmltcG9ydCBzaW1MYXVuY2hlciBmcm9tICcuLi8uLi9qb2lzdC9qcy9zaW1MYXVuY2hlci5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBCYXNpY3NTY3JlZW4gZnJvbSAnLi9kZW1vL2Jhc2ljcy9CYXNpY3NTY3JlZW4uanMnO1xyXG5pbXBvcnQgUGF0dGVybnNTY3JlZW4gZnJvbSAnLi9kZW1vL3BhdHRlcm5zL1BhdHRlcm5zU2NyZWVuLmpzJztcclxuaW1wb3J0IFRhcHBpU3RyaW5ncyBmcm9tICcuL1RhcHBpU3RyaW5ncy5qcyc7XHJcblxyXG5jb25zdCB0YXBwaVRpdGxlU3RyaW5nUHJvcGVydHkgPSBUYXBwaVN0cmluZ3MudGFwcGkudGl0bGVTdHJpbmdQcm9wZXJ0eTtcclxuXHJcbmNvbnN0IHNpbU9wdGlvbnM6IFNpbU9wdGlvbnMgPSB7XHJcbiAgY3JlZGl0czoge1xyXG4gICAgLy9UT0RPIGZpbGwgaW4gY3JlZGl0cywgYWxsIG9mIHRoZXNlIGZpZWxkcyBhcmUgb3B0aW9uYWwsIHNlZSBqb2lzdC5DcmVkaXRzTm9kZVxyXG4gICAgbGVhZERlc2lnbjogJycsXHJcbiAgICBzb2Z0d2FyZURldmVsb3BtZW50OiAnJyxcclxuICAgIHRlYW06ICcnLFxyXG4gICAgcXVhbGl0eUFzc3VyYW5jZTogJycsXHJcbiAgICBncmFwaGljQXJ0czogJycsXHJcbiAgICBzb3VuZERlc2lnbjogJycsXHJcbiAgICB0aGFua3M6ICcnXHJcbiAgfVxyXG59O1xyXG5cclxuLy8gbGF1bmNoIHRoZSBzaW0gLSBiZXdhcmUgdGhhdCBzY2VuZXJ5IEltYWdlIG5vZGVzIGNyZWF0ZWQgb3V0c2lkZSBvZiBzaW1MYXVuY2hlci5sYXVuY2goKSB3aWxsIGhhdmUgemVybyBib3VuZHNcclxuLy8gdW50aWwgdGhlIGltYWdlcyBhcmUgZnVsbHkgbG9hZGVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NvdWxvbWJzLWxhdy9pc3N1ZXMvNzBcclxuc2ltTGF1bmNoZXIubGF1bmNoKCAoKSA9PiB7XHJcbiAgY29uc3Qgc2ltID0gbmV3IFNpbSggdGFwcGlUaXRsZVN0cmluZ1Byb3BlcnR5LCBbXHJcbiAgICBuZXcgQmFzaWNzU2NyZWVuKCBUYW5kZW0uUk9PVC5jcmVhdGVUYW5kZW0oICdiYXNpY3NTY3JlZW4nICkgKSxcclxuICAgIG5ldyBQYXR0ZXJuc1NjcmVlbigpXHJcbiAgXSwgc2ltT3B0aW9ucyApO1xyXG4gIHNpbS5zdGFydCgpO1xyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEdBQUcsTUFBc0IsdUJBQXVCO0FBQ3ZELE9BQU9DLFdBQVcsTUFBTSwrQkFBK0I7QUFDdkQsT0FBT0MsTUFBTSxNQUFNLDJCQUEyQjtBQUM5QyxPQUFPQyxZQUFZLE1BQU0sK0JBQStCO0FBQ3hELE9BQU9DLGNBQWMsTUFBTSxtQ0FBbUM7QUFDOUQsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjtBQUU1QyxNQUFNQyx3QkFBd0IsR0FBR0QsWUFBWSxDQUFDRSxLQUFLLENBQUNDLG1CQUFtQjtBQUV2RSxNQUFNQyxVQUFzQixHQUFHO0VBQzdCQyxPQUFPLEVBQUU7SUFDUDtJQUNBQyxVQUFVLEVBQUUsRUFBRTtJQUNkQyxtQkFBbUIsRUFBRSxFQUFFO0lBQ3ZCQyxJQUFJLEVBQUUsRUFBRTtJQUNSQyxnQkFBZ0IsRUFBRSxFQUFFO0lBQ3BCQyxXQUFXLEVBQUUsRUFBRTtJQUNmQyxXQUFXLEVBQUUsRUFBRTtJQUNmQyxNQUFNLEVBQUU7RUFDVjtBQUNGLENBQUM7O0FBRUQ7QUFDQTtBQUNBaEIsV0FBVyxDQUFDaUIsTUFBTSxDQUFFLE1BQU07RUFDeEIsTUFBTUMsR0FBRyxHQUFHLElBQUluQixHQUFHLENBQUVNLHdCQUF3QixFQUFFLENBQzdDLElBQUlILFlBQVksQ0FBRUQsTUFBTSxDQUFDa0IsSUFBSSxDQUFDQyxZQUFZLENBQUUsY0FBZSxDQUFFLENBQUMsRUFDOUQsSUFBSWpCLGNBQWMsQ0FBQyxDQUFDLENBQ3JCLEVBQUVLLFVBQVcsQ0FBQztFQUNmVSxHQUFHLENBQUNHLEtBQUssQ0FBQyxDQUFDO0FBQ2IsQ0FBRSxDQUFDIn0=