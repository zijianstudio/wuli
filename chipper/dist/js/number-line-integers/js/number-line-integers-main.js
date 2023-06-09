// Copyright 2019-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import NLIExploreScreen from './explore/NLIExploreScreen.js';
import NLIGenericScreen from './generic/NLIGenericScreen.js';
import NumberLineIntegersStrings from './NumberLineIntegersStrings.js';
const numberLineIntegersTitleStringProperty = NumberLineIntegersStrings['number-line-integers'].titleStringProperty;
const simOptions = {
  credits: {
    leadDesign: 'Amanda McGarry',
    softwareDevelopment: 'John Blanco, Chris Klusendorf, Saurabh Totey',
    team: 'Ariel Paul, Kathy Perkins, and in cooperation with the Next-Lab project',
    qualityAssurance: 'Logan Bray, Liam Mulhall, Jacob Romero, Kathryn Woessner',
    graphicArts: 'Megan Lai',
    soundDesign: '',
    thanks: ''
  }
};

// launch the sim - beware that scenery Image nodes created outside of simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch(() => {
  const screens = [new NLIExploreScreen(Tandem.ROOT.createTandem('exploreScreen')), new NLIGenericScreen(Tandem.ROOT.createTandem('genericScreen'))];
  const sim = new Sim(numberLineIntegersTitleStringProperty, screens, simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIlRhbmRlbSIsIk5MSUV4cGxvcmVTY3JlZW4iLCJOTElHZW5lcmljU2NyZWVuIiwiTnVtYmVyTGluZUludGVnZXJzU3RyaW5ncyIsIm51bWJlckxpbmVJbnRlZ2Vyc1RpdGxlU3RyaW5nUHJvcGVydHkiLCJ0aXRsZVN0cmluZ1Byb3BlcnR5Iiwic2ltT3B0aW9ucyIsImNyZWRpdHMiLCJsZWFkRGVzaWduIiwic29mdHdhcmVEZXZlbG9wbWVudCIsInRlYW0iLCJxdWFsaXR5QXNzdXJhbmNlIiwiZ3JhcGhpY0FydHMiLCJzb3VuZERlc2lnbiIsInRoYW5rcyIsImxhdW5jaCIsInNjcmVlbnMiLCJST09UIiwiY3JlYXRlVGFuZGVtIiwic2ltIiwic3RhcnQiXSwic291cmNlcyI6WyJudW1iZXItbGluZS1pbnRlZ2Vycy1tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1haW4gZW50cnkgcG9pbnQgZm9yIHRoZSBzaW0uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFNpbSBmcm9tICcuLi8uLi9qb2lzdC9qcy9TaW0uanMnO1xyXG5pbXBvcnQgc2ltTGF1bmNoZXIgZnJvbSAnLi4vLi4vam9pc3QvanMvc2ltTGF1bmNoZXIuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgTkxJRXhwbG9yZVNjcmVlbiBmcm9tICcuL2V4cGxvcmUvTkxJRXhwbG9yZVNjcmVlbi5qcyc7XHJcbmltcG9ydCBOTElHZW5lcmljU2NyZWVuIGZyb20gJy4vZ2VuZXJpYy9OTElHZW5lcmljU2NyZWVuLmpzJztcclxuaW1wb3J0IE51bWJlckxpbmVJbnRlZ2Vyc1N0cmluZ3MgZnJvbSAnLi9OdW1iZXJMaW5lSW50ZWdlcnNTdHJpbmdzLmpzJztcclxuXHJcbmNvbnN0IG51bWJlckxpbmVJbnRlZ2Vyc1RpdGxlU3RyaW5nUHJvcGVydHkgPSBOdW1iZXJMaW5lSW50ZWdlcnNTdHJpbmdzWyAnbnVtYmVyLWxpbmUtaW50ZWdlcnMnIF0udGl0bGVTdHJpbmdQcm9wZXJ0eTtcclxuXHJcbmNvbnN0IHNpbU9wdGlvbnMgPSB7XHJcbiAgY3JlZGl0czoge1xyXG4gICAgbGVhZERlc2lnbjogJ0FtYW5kYSBNY0dhcnJ5JyxcclxuICAgIHNvZnR3YXJlRGV2ZWxvcG1lbnQ6ICdKb2huIEJsYW5jbywgQ2hyaXMgS2x1c2VuZG9yZiwgU2F1cmFiaCBUb3RleScsXHJcbiAgICB0ZWFtOiAnQXJpZWwgUGF1bCwgS2F0aHkgUGVya2lucywgYW5kIGluIGNvb3BlcmF0aW9uIHdpdGggdGhlIE5leHQtTGFiIHByb2plY3QnLFxyXG4gICAgcXVhbGl0eUFzc3VyYW5jZTogJ0xvZ2FuIEJyYXksIExpYW0gTXVsaGFsbCwgSmFjb2IgUm9tZXJvLCBLYXRocnluIFdvZXNzbmVyJyxcclxuICAgIGdyYXBoaWNBcnRzOiAnTWVnYW4gTGFpJyxcclxuICAgIHNvdW5kRGVzaWduOiAnJyxcclxuICAgIHRoYW5rczogJydcclxuICB9XHJcbn07XHJcblxyXG4vLyBsYXVuY2ggdGhlIHNpbSAtIGJld2FyZSB0aGF0IHNjZW5lcnkgSW1hZ2Ugbm9kZXMgY3JlYXRlZCBvdXRzaWRlIG9mIHNpbUxhdW5jaGVyLmxhdW5jaCgpIHdpbGwgaGF2ZSB6ZXJvIGJvdW5kc1xyXG4vLyB1bnRpbCB0aGUgaW1hZ2VzIGFyZSBmdWxseSBsb2FkZWQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY291bG9tYnMtbGF3L2lzc3Vlcy83MFxyXG5zaW1MYXVuY2hlci5sYXVuY2goICgpID0+IHtcclxuICBjb25zdCBzY3JlZW5zID0gW1xyXG4gICAgbmV3IE5MSUV4cGxvcmVTY3JlZW4oIFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggJ2V4cGxvcmVTY3JlZW4nICkgKSxcclxuICAgIG5ldyBOTElHZW5lcmljU2NyZWVuKCBUYW5kZW0uUk9PVC5jcmVhdGVUYW5kZW0oICdnZW5lcmljU2NyZWVuJyApIClcclxuICBdO1xyXG4gIGNvbnN0IHNpbSA9IG5ldyBTaW0oIG51bWJlckxpbmVJbnRlZ2Vyc1RpdGxlU3RyaW5nUHJvcGVydHksIHNjcmVlbnMsIHNpbU9wdGlvbnMgKTtcclxuICBzaW0uc3RhcnQoKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxHQUFHLE1BQU0sdUJBQXVCO0FBQ3ZDLE9BQU9DLFdBQVcsTUFBTSwrQkFBK0I7QUFDdkQsT0FBT0MsTUFBTSxNQUFNLDJCQUEyQjtBQUM5QyxPQUFPQyxnQkFBZ0IsTUFBTSwrQkFBK0I7QUFDNUQsT0FBT0MsZ0JBQWdCLE1BQU0sK0JBQStCO0FBQzVELE9BQU9DLHlCQUF5QixNQUFNLGdDQUFnQztBQUV0RSxNQUFNQyxxQ0FBcUMsR0FBR0QseUJBQXlCLENBQUUsc0JBQXNCLENBQUUsQ0FBQ0UsbUJBQW1CO0FBRXJILE1BQU1DLFVBQVUsR0FBRztFQUNqQkMsT0FBTyxFQUFFO0lBQ1BDLFVBQVUsRUFBRSxnQkFBZ0I7SUFDNUJDLG1CQUFtQixFQUFFLDhDQUE4QztJQUNuRUMsSUFBSSxFQUFFLHlFQUF5RTtJQUMvRUMsZ0JBQWdCLEVBQUUsMERBQTBEO0lBQzVFQyxXQUFXLEVBQUUsV0FBVztJQUN4QkMsV0FBVyxFQUFFLEVBQUU7SUFDZkMsTUFBTSxFQUFFO0VBQ1Y7QUFDRixDQUFDOztBQUVEO0FBQ0E7QUFDQWYsV0FBVyxDQUFDZ0IsTUFBTSxDQUFFLE1BQU07RUFDeEIsTUFBTUMsT0FBTyxHQUFHLENBQ2QsSUFBSWYsZ0JBQWdCLENBQUVELE1BQU0sQ0FBQ2lCLElBQUksQ0FBQ0MsWUFBWSxDQUFFLGVBQWdCLENBQUUsQ0FBQyxFQUNuRSxJQUFJaEIsZ0JBQWdCLENBQUVGLE1BQU0sQ0FBQ2lCLElBQUksQ0FBQ0MsWUFBWSxDQUFFLGVBQWdCLENBQUUsQ0FBQyxDQUNwRTtFQUNELE1BQU1DLEdBQUcsR0FBRyxJQUFJckIsR0FBRyxDQUFFTSxxQ0FBcUMsRUFBRVksT0FBTyxFQUFFVixVQUFXLENBQUM7RUFDakZhLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDLENBQUM7QUFDYixDQUFFLENBQUMifQ==