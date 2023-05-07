// Copyright 2016-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import ExploreScreen from './explore/ExploreScreen.js';
import PredictScreen from './predict/PredictScreen.js';
import ProportionPlaygroundStrings from './ProportionPlaygroundStrings.js';
const proportionPlaygroundTitleStringProperty = ProportionPlaygroundStrings['proportion-playground'].titleStringProperty;
const simOptions = {
  credits: {
    leadDesign: 'Amanda McGarry',
    softwareDevelopment: 'Andrea Lin, Sam Reid, Jonathan Olson',
    team: 'Karina K. R. Hensberry, Ariel Paul, Kathy Perkins, Beth Stade, Ian Whitacre',
    qualityAssurance: 'Steele Dalton, Bryce Griebenow, Ethan Johnson, Ben Roberts, Maggie Wiseman',
    graphicArts: 'Mariah Hermsmeyer',
    thanks: 'This sim builds (in part) on prior work by our colleagues at SRI and the SunBay team (http://sunbay.sri.com/).'
  }
};
simLauncher.launch(() => {
  const sim = new Sim(proportionPlaygroundTitleStringProperty, [new ExploreScreen(Tandem.ROOT.createTandem('exporeScreen')), new PredictScreen(Tandem.ROOT.createTandem('predictScreen'))], simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIlRhbmRlbSIsIkV4cGxvcmVTY3JlZW4iLCJQcmVkaWN0U2NyZWVuIiwiUHJvcG9ydGlvblBsYXlncm91bmRTdHJpbmdzIiwicHJvcG9ydGlvblBsYXlncm91bmRUaXRsZVN0cmluZ1Byb3BlcnR5IiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInNpbU9wdGlvbnMiLCJjcmVkaXRzIiwibGVhZERlc2lnbiIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJ0ZWFtIiwicXVhbGl0eUFzc3VyYW5jZSIsImdyYXBoaWNBcnRzIiwidGhhbmtzIiwibGF1bmNoIiwic2ltIiwiUk9PVCIsImNyZWF0ZVRhbmRlbSIsInN0YXJ0Il0sInNvdXJjZXMiOlsicHJvcG9ydGlvbi1wbGF5Z3JvdW5kLW1haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIHNpbS5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgU2ltIGZyb20gJy4uLy4uL2pvaXN0L2pzL1NpbS5qcyc7XHJcbmltcG9ydCBzaW1MYXVuY2hlciBmcm9tICcuLi8uLi9qb2lzdC9qcy9zaW1MYXVuY2hlci5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBFeHBsb3JlU2NyZWVuIGZyb20gJy4vZXhwbG9yZS9FeHBsb3JlU2NyZWVuLmpzJztcclxuaW1wb3J0IFByZWRpY3RTY3JlZW4gZnJvbSAnLi9wcmVkaWN0L1ByZWRpY3RTY3JlZW4uanMnO1xyXG5pbXBvcnQgUHJvcG9ydGlvblBsYXlncm91bmRTdHJpbmdzIGZyb20gJy4vUHJvcG9ydGlvblBsYXlncm91bmRTdHJpbmdzLmpzJztcclxuXHJcbmNvbnN0IHByb3BvcnRpb25QbGF5Z3JvdW5kVGl0bGVTdHJpbmdQcm9wZXJ0eSA9IFByb3BvcnRpb25QbGF5Z3JvdW5kU3RyaW5nc1sgJ3Byb3BvcnRpb24tcGxheWdyb3VuZCcgXS50aXRsZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxuY29uc3Qgc2ltT3B0aW9ucyA9IHtcclxuICBjcmVkaXRzOiB7XHJcbiAgICBsZWFkRGVzaWduOiAnQW1hbmRhIE1jR2FycnknLFxyXG4gICAgc29mdHdhcmVEZXZlbG9wbWVudDogJ0FuZHJlYSBMaW4sIFNhbSBSZWlkLCBKb25hdGhhbiBPbHNvbicsXHJcbiAgICB0ZWFtOiAnS2FyaW5hIEsuIFIuIEhlbnNiZXJyeSwgQXJpZWwgUGF1bCwgS2F0aHkgUGVya2lucywgQmV0aCBTdGFkZSwgSWFuIFdoaXRhY3JlJyxcclxuICAgIHF1YWxpdHlBc3N1cmFuY2U6ICdTdGVlbGUgRGFsdG9uLCBCcnljZSBHcmllYmVub3csIEV0aGFuIEpvaG5zb24sIEJlbiBSb2JlcnRzLCBNYWdnaWUgV2lzZW1hbicsXHJcbiAgICBncmFwaGljQXJ0czogJ01hcmlhaCBIZXJtc21leWVyJyxcclxuICAgIHRoYW5rczogJ1RoaXMgc2ltIGJ1aWxkcyAoaW4gcGFydCkgb24gcHJpb3Igd29yayBieSBvdXIgY29sbGVhZ3VlcyBhdCBTUkkgYW5kIHRoZSBTdW5CYXkgdGVhbSAoaHR0cDovL3N1bmJheS5zcmkuY29tLykuJ1xyXG4gIH1cclxufTtcclxuXHJcbnNpbUxhdW5jaGVyLmxhdW5jaCggKCkgPT4ge1xyXG4gIGNvbnN0IHNpbSA9IG5ldyBTaW0oIHByb3BvcnRpb25QbGF5Z3JvdW5kVGl0bGVTdHJpbmdQcm9wZXJ0eSwgW1xyXG4gICAgbmV3IEV4cGxvcmVTY3JlZW4oIFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggJ2V4cG9yZVNjcmVlbicgKSApLFxyXG4gICAgbmV3IFByZWRpY3RTY3JlZW4oIFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggJ3ByZWRpY3RTY3JlZW4nICkgKVxyXG4gIF0sIHNpbU9wdGlvbnMgKTtcclxuICBzaW0uc3RhcnQoKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxHQUFHLE1BQU0sdUJBQXVCO0FBQ3ZDLE9BQU9DLFdBQVcsTUFBTSwrQkFBK0I7QUFDdkQsT0FBT0MsTUFBTSxNQUFNLDJCQUEyQjtBQUM5QyxPQUFPQyxhQUFhLE1BQU0sNEJBQTRCO0FBQ3RELE9BQU9DLGFBQWEsTUFBTSw0QkFBNEI7QUFDdEQsT0FBT0MsMkJBQTJCLE1BQU0sa0NBQWtDO0FBRTFFLE1BQU1DLHVDQUF1QyxHQUFHRCwyQkFBMkIsQ0FBRSx1QkFBdUIsQ0FBRSxDQUFDRSxtQkFBbUI7QUFFMUgsTUFBTUMsVUFBVSxHQUFHO0VBQ2pCQyxPQUFPLEVBQUU7SUFDUEMsVUFBVSxFQUFFLGdCQUFnQjtJQUM1QkMsbUJBQW1CLEVBQUUsc0NBQXNDO0lBQzNEQyxJQUFJLEVBQUUsNkVBQTZFO0lBQ25GQyxnQkFBZ0IsRUFBRSw0RUFBNEU7SUFDOUZDLFdBQVcsRUFBRSxtQkFBbUI7SUFDaENDLE1BQU0sRUFBRTtFQUNWO0FBQ0YsQ0FBQztBQUVEZCxXQUFXLENBQUNlLE1BQU0sQ0FBRSxNQUFNO0VBQ3hCLE1BQU1DLEdBQUcsR0FBRyxJQUFJakIsR0FBRyxDQUFFTSx1Q0FBdUMsRUFBRSxDQUM1RCxJQUFJSCxhQUFhLENBQUVELE1BQU0sQ0FBQ2dCLElBQUksQ0FBQ0MsWUFBWSxDQUFFLGNBQWUsQ0FBRSxDQUFDLEVBQy9ELElBQUlmLGFBQWEsQ0FBRUYsTUFBTSxDQUFDZ0IsSUFBSSxDQUFDQyxZQUFZLENBQUUsZUFBZ0IsQ0FBRSxDQUFDLENBQ2pFLEVBQUVYLFVBQVcsQ0FBQztFQUNmUyxHQUFHLENBQUNHLEtBQUssQ0FBQyxDQUFDO0FBQ2IsQ0FBRSxDQUFDIn0=