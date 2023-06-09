// Copyright 2013-2022, University of Colorado Boulder

/**
 * Main entry point for the 'Gravity Force Lab' sim.
 *
 * @author Anton Ulyanov (Mlearner)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import WOASScreen from './wave-on-a-string/view/WOASScreen.js';
import WaveOnAStringStrings from './WaveOnAStringStrings.js';
const waveOnAStringTitleStringProperty = WaveOnAStringStrings['wave-on-a-string'].titleStringProperty;
const simOptions = {
  credits: {
    leadDesign: 'Michael Dubson, Ariel Paul',
    softwareDevelopment: 'Jonathan Olson, Michael Dubson',
    team: 'Trish Loeblein, Ariel Paul, Kathy Perkins, Amy Rouinfar',
    graphicArts: 'Sharon Siman-Tov',
    thanks: 'Thanks to Mobile Learner Labs for working with the PhET development team ' + 'to convert this simulation to HTML5.'
  }
};
simLauncher.launch(() => {
  //Create and start the sim
  new Sim(waveOnAStringTitleStringProperty, [new WOASScreen(Tandem.ROOT.createTandem('waveOnAStringScreen'))], simOptions).start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIlRhbmRlbSIsIldPQVNTY3JlZW4iLCJXYXZlT25BU3RyaW5nU3RyaW5ncyIsIndhdmVPbkFTdHJpbmdUaXRsZVN0cmluZ1Byb3BlcnR5IiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInNpbU9wdGlvbnMiLCJjcmVkaXRzIiwibGVhZERlc2lnbiIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJ0ZWFtIiwiZ3JhcGhpY0FydHMiLCJ0aGFua3MiLCJsYXVuY2giLCJST09UIiwiY3JlYXRlVGFuZGVtIiwic3RhcnQiXSwic291cmNlcyI6WyJ3YXZlLW9uLWEtc3RyaW5nLW1haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlICdHcmF2aXR5IEZvcmNlIExhYicgc2ltLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEFudG9uIFVseWFub3YgKE1sZWFybmVyKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTaW0gZnJvbSAnLi4vLi4vam9pc3QvanMvU2ltLmpzJztcclxuaW1wb3J0IHNpbUxhdW5jaGVyIGZyb20gJy4uLy4uL2pvaXN0L2pzL3NpbUxhdW5jaGVyLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IFdPQVNTY3JlZW4gZnJvbSAnLi93YXZlLW9uLWEtc3RyaW5nL3ZpZXcvV09BU1NjcmVlbi5qcyc7XHJcbmltcG9ydCBXYXZlT25BU3RyaW5nU3RyaW5ncyBmcm9tICcuL1dhdmVPbkFTdHJpbmdTdHJpbmdzLmpzJztcclxuXHJcbmNvbnN0IHdhdmVPbkFTdHJpbmdUaXRsZVN0cmluZ1Byb3BlcnR5ID0gV2F2ZU9uQVN0cmluZ1N0cmluZ3NbICd3YXZlLW9uLWEtc3RyaW5nJyBdLnRpdGxlU3RyaW5nUHJvcGVydHk7XHJcblxyXG5jb25zdCBzaW1PcHRpb25zID0ge1xyXG4gIGNyZWRpdHM6IHtcclxuICAgIGxlYWREZXNpZ246ICdNaWNoYWVsIER1YnNvbiwgQXJpZWwgUGF1bCcsXHJcbiAgICBzb2Z0d2FyZURldmVsb3BtZW50OiAnSm9uYXRoYW4gT2xzb24sIE1pY2hhZWwgRHVic29uJyxcclxuICAgIHRlYW06ICdUcmlzaCBMb2VibGVpbiwgQXJpZWwgUGF1bCwgS2F0aHkgUGVya2lucywgQW15IFJvdWluZmFyJyxcclxuICAgIGdyYXBoaWNBcnRzOiAnU2hhcm9uIFNpbWFuLVRvdicsXHJcbiAgICB0aGFua3M6ICdUaGFua3MgdG8gTW9iaWxlIExlYXJuZXIgTGFicyBmb3Igd29ya2luZyB3aXRoIHRoZSBQaEVUIGRldmVsb3BtZW50IHRlYW0gJyArXHJcbiAgICAgICAgICAgICd0byBjb252ZXJ0IHRoaXMgc2ltdWxhdGlvbiB0byBIVE1MNS4nXHJcbiAgfVxyXG59O1xyXG5cclxuc2ltTGF1bmNoZXIubGF1bmNoKCAoKSA9PiB7XHJcbiAgLy9DcmVhdGUgYW5kIHN0YXJ0IHRoZSBzaW1cclxuICBuZXcgU2ltKCB3YXZlT25BU3RyaW5nVGl0bGVTdHJpbmdQcm9wZXJ0eSwgW1xyXG4gICAgbmV3IFdPQVNTY3JlZW4oIFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggJ3dhdmVPbkFTdHJpbmdTY3JlZW4nICkgKVxyXG4gIF0sIHNpbU9wdGlvbnMgKS5zdGFydCgpO1xyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEdBQUcsTUFBTSx1QkFBdUI7QUFDdkMsT0FBT0MsV0FBVyxNQUFNLCtCQUErQjtBQUN2RCxPQUFPQyxNQUFNLE1BQU0sMkJBQTJCO0FBQzlDLE9BQU9DLFVBQVUsTUFBTSx1Q0FBdUM7QUFDOUQsT0FBT0Msb0JBQW9CLE1BQU0sMkJBQTJCO0FBRTVELE1BQU1DLGdDQUFnQyxHQUFHRCxvQkFBb0IsQ0FBRSxrQkFBa0IsQ0FBRSxDQUFDRSxtQkFBbUI7QUFFdkcsTUFBTUMsVUFBVSxHQUFHO0VBQ2pCQyxPQUFPLEVBQUU7SUFDUEMsVUFBVSxFQUFFLDRCQUE0QjtJQUN4Q0MsbUJBQW1CLEVBQUUsZ0NBQWdDO0lBQ3JEQyxJQUFJLEVBQUUseURBQXlEO0lBQy9EQyxXQUFXLEVBQUUsa0JBQWtCO0lBQy9CQyxNQUFNLEVBQUUsMkVBQTJFLEdBQzNFO0VBQ1Y7QUFDRixDQUFDO0FBRURaLFdBQVcsQ0FBQ2EsTUFBTSxDQUFFLE1BQU07RUFDeEI7RUFDQSxJQUFJZCxHQUFHLENBQUVLLGdDQUFnQyxFQUFFLENBQ3pDLElBQUlGLFVBQVUsQ0FBRUQsTUFBTSxDQUFDYSxJQUFJLENBQUNDLFlBQVksQ0FBRSxxQkFBc0IsQ0FBRSxDQUFDLENBQ3BFLEVBQUVULFVBQVcsQ0FBQyxDQUFDVSxLQUFLLENBQUMsQ0FBQztBQUN6QixDQUFFLENBQUMifQ==