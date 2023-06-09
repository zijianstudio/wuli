// Copyright 2013-2022, University of Colorado Boulder

/**
 * Main entry point for the 'Beer's Law Lab' sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import simLauncher from '../../joist/js/simLauncher.js';
import BeersLawScreen from './beerslaw/BeersLawScreen.js';
import BeersLawLabStrings from './BeersLawLabStrings.js';
import ConcentrationScreen from './concentration/ConcentrationScreen.js';
import Tandem from '../../tandem/js/Tandem.js';
import BLLSim from './common/view/BLLSim.js';
simLauncher.launch(() => {
  const screens = [new ConcentrationScreen(Tandem.ROOT.createTandem('concentrationScreen')), new BeersLawScreen(Tandem.ROOT.createTandem('beersLawScreen'))];
  const sim = new BLLSim(BeersLawLabStrings['beers-law-lab'].titleStringProperty, screens);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzaW1MYXVuY2hlciIsIkJlZXJzTGF3U2NyZWVuIiwiQmVlcnNMYXdMYWJTdHJpbmdzIiwiQ29uY2VudHJhdGlvblNjcmVlbiIsIlRhbmRlbSIsIkJMTFNpbSIsImxhdW5jaCIsInNjcmVlbnMiLCJST09UIiwiY3JlYXRlVGFuZGVtIiwic2ltIiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInN0YXJ0Il0sInNvdXJjZXMiOlsiYmVlcnMtbGF3LWxhYi1tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1haW4gZW50cnkgcG9pbnQgZm9yIHRoZSAnQmVlcidzIExhdyBMYWInIHNpbS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgc2ltTGF1bmNoZXIgZnJvbSAnLi4vLi4vam9pc3QvanMvc2ltTGF1bmNoZXIuanMnO1xyXG5pbXBvcnQgQmVlcnNMYXdTY3JlZW4gZnJvbSAnLi9iZWVyc2xhdy9CZWVyc0xhd1NjcmVlbi5qcyc7XHJcbmltcG9ydCBCZWVyc0xhd0xhYlN0cmluZ3MgZnJvbSAnLi9CZWVyc0xhd0xhYlN0cmluZ3MuanMnO1xyXG5pbXBvcnQgQ29uY2VudHJhdGlvblNjcmVlbiBmcm9tICcuL2NvbmNlbnRyYXRpb24vQ29uY2VudHJhdGlvblNjcmVlbi5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBCTExTaW0gZnJvbSAnLi9jb21tb24vdmlldy9CTExTaW0uanMnO1xyXG5cclxuc2ltTGF1bmNoZXIubGF1bmNoKCAoKSA9PiB7XHJcbiAgY29uc3Qgc2NyZWVucyA9IFtcclxuICAgIG5ldyBDb25jZW50cmF0aW9uU2NyZWVuKCBUYW5kZW0uUk9PVC5jcmVhdGVUYW5kZW0oICdjb25jZW50cmF0aW9uU2NyZWVuJyApICksXHJcbiAgICBuZXcgQmVlcnNMYXdTY3JlZW4oIFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggJ2JlZXJzTGF3U2NyZWVuJyApIClcclxuICBdO1xyXG4gIGNvbnN0IHNpbSA9IG5ldyBCTExTaW0oIEJlZXJzTGF3TGFiU3RyaW5nc1sgJ2JlZXJzLWxhdy1sYWInIF0udGl0bGVTdHJpbmdQcm9wZXJ0eSwgc2NyZWVucyApO1xyXG4gIHNpbS5zdGFydCgpO1xyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFdBQVcsTUFBTSwrQkFBK0I7QUFDdkQsT0FBT0MsY0FBYyxNQUFNLDhCQUE4QjtBQUN6RCxPQUFPQyxrQkFBa0IsTUFBTSx5QkFBeUI7QUFDeEQsT0FBT0MsbUJBQW1CLE1BQU0sd0NBQXdDO0FBQ3hFLE9BQU9DLE1BQU0sTUFBTSwyQkFBMkI7QUFDOUMsT0FBT0MsTUFBTSxNQUFNLHlCQUF5QjtBQUU1Q0wsV0FBVyxDQUFDTSxNQUFNLENBQUUsTUFBTTtFQUN4QixNQUFNQyxPQUFPLEdBQUcsQ0FDZCxJQUFJSixtQkFBbUIsQ0FBRUMsTUFBTSxDQUFDSSxJQUFJLENBQUNDLFlBQVksQ0FBRSxxQkFBc0IsQ0FBRSxDQUFDLEVBQzVFLElBQUlSLGNBQWMsQ0FBRUcsTUFBTSxDQUFDSSxJQUFJLENBQUNDLFlBQVksQ0FBRSxnQkFBaUIsQ0FBRSxDQUFDLENBQ25FO0VBQ0QsTUFBTUMsR0FBRyxHQUFHLElBQUlMLE1BQU0sQ0FBRUgsa0JBQWtCLENBQUUsZUFBZSxDQUFFLENBQUNTLG1CQUFtQixFQUFFSixPQUFRLENBQUM7RUFDNUZHLEdBQUcsQ0FBQ0UsS0FBSyxDQUFDLENBQUM7QUFDYixDQUFFLENBQUMifQ==