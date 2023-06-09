// Copyright 2013-2023, University of Colorado Boulder

/**
 * Main entry point for the 'Graphing Lines' sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import GraphingLinesStrings from './GraphingLinesStrings.js';
import LineGameScreen from './linegame/LineGameScreen.js';
import PointSlopeScreen from './pointslope/PointSlopeScreen.js';
import SlopeScreen from './slope/SlopeScreen.js';
import SlopeInterceptScreen from './slopeintercept/SlopeInterceptScreen.js';
simLauncher.launch(() => {
  const titleStringProperty = GraphingLinesStrings['graphing-lines'].titleStringProperty;
  const screens = [new SlopeScreen(Tandem.ROOT.createTandem('slopeScreen')), new SlopeInterceptScreen(Tandem.ROOT.createTandem('slopeInterceptScreen')), new PointSlopeScreen(Tandem.ROOT.createTandem('pointSlopeScreen')), new LineGameScreen(Tandem.ROOT.createTandem('lineGameScreen'))];
  const options = {
    credits: {
      leadDesign: 'Ariel Paul',
      softwareDevelopment: 'Chris Malley (PixelZoom, Inc.)',
      team: 'Bryce Gruneich, Karina K. R. Hensberry, Patricia Loeblein, Amanda McGarry, Kathy Perkins',
      graphicArts: 'Megan Lai, Sharon Siman-Tov',
      qualityAssurance: 'Steele Dalton, Bryce Griebenow, Elise Morgan, Liam Mulhall, Oliver Orejola, Laura Rea, ' + 'Benjamin Roberts, Jacob Romero, Kathryn Woessner, Bryan Yoelin'
    }
  };
  const sim = new Sim(titleStringProperty, screens, options);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIlRhbmRlbSIsIkdyYXBoaW5nTGluZXNTdHJpbmdzIiwiTGluZUdhbWVTY3JlZW4iLCJQb2ludFNsb3BlU2NyZWVuIiwiU2xvcGVTY3JlZW4iLCJTbG9wZUludGVyY2VwdFNjcmVlbiIsImxhdW5jaCIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJzY3JlZW5zIiwiUk9PVCIsImNyZWF0ZVRhbmRlbSIsIm9wdGlvbnMiLCJjcmVkaXRzIiwibGVhZERlc2lnbiIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJ0ZWFtIiwiZ3JhcGhpY0FydHMiLCJxdWFsaXR5QXNzdXJhbmNlIiwic2ltIiwic3RhcnQiXSwic291cmNlcyI6WyJncmFwaGluZy1saW5lcy1tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1haW4gZW50cnkgcG9pbnQgZm9yIHRoZSAnR3JhcGhpbmcgTGluZXMnIHNpbS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgU2ltIGZyb20gJy4uLy4uL2pvaXN0L2pzL1NpbS5qcyc7XHJcbmltcG9ydCBzaW1MYXVuY2hlciBmcm9tICcuLi8uLi9qb2lzdC9qcy9zaW1MYXVuY2hlci5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBHcmFwaGluZ0xpbmVzU3RyaW5ncyBmcm9tICcuL0dyYXBoaW5nTGluZXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IExpbmVHYW1lU2NyZWVuIGZyb20gJy4vbGluZWdhbWUvTGluZUdhbWVTY3JlZW4uanMnO1xyXG5pbXBvcnQgUG9pbnRTbG9wZVNjcmVlbiBmcm9tICcuL3BvaW50c2xvcGUvUG9pbnRTbG9wZVNjcmVlbi5qcyc7XHJcbmltcG9ydCBTbG9wZVNjcmVlbiBmcm9tICcuL3Nsb3BlL1Nsb3BlU2NyZWVuLmpzJztcclxuaW1wb3J0IFNsb3BlSW50ZXJjZXB0U2NyZWVuIGZyb20gJy4vc2xvcGVpbnRlcmNlcHQvU2xvcGVJbnRlcmNlcHRTY3JlZW4uanMnO1xyXG5cclxuc2ltTGF1bmNoZXIubGF1bmNoKCAoKSA9PiB7XHJcblxyXG4gIGNvbnN0IHRpdGxlU3RyaW5nUHJvcGVydHkgPSBHcmFwaGluZ0xpbmVzU3RyaW5nc1sgJ2dyYXBoaW5nLWxpbmVzJyBdLnRpdGxlU3RyaW5nUHJvcGVydHk7XHJcblxyXG4gIGNvbnN0IHNjcmVlbnMgPSBbXHJcbiAgICBuZXcgU2xvcGVTY3JlZW4oIFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggJ3Nsb3BlU2NyZWVuJyApICksXHJcbiAgICBuZXcgU2xvcGVJbnRlcmNlcHRTY3JlZW4oIFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggJ3Nsb3BlSW50ZXJjZXB0U2NyZWVuJyApICksXHJcbiAgICBuZXcgUG9pbnRTbG9wZVNjcmVlbiggVGFuZGVtLlJPT1QuY3JlYXRlVGFuZGVtKCAncG9pbnRTbG9wZVNjcmVlbicgKSApLFxyXG4gICAgbmV3IExpbmVHYW1lU2NyZWVuKCBUYW5kZW0uUk9PVC5jcmVhdGVUYW5kZW0oICdsaW5lR2FtZVNjcmVlbicgKSApXHJcbiAgXTtcclxuXHJcbiAgY29uc3Qgb3B0aW9ucyA9IHtcclxuICAgIGNyZWRpdHM6IHtcclxuICAgICAgbGVhZERlc2lnbjogJ0FyaWVsIFBhdWwnLFxyXG4gICAgICBzb2Z0d2FyZURldmVsb3BtZW50OiAnQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pJyxcclxuICAgICAgdGVhbTogJ0JyeWNlIEdydW5laWNoLCBLYXJpbmEgSy4gUi4gSGVuc2JlcnJ5LCBQYXRyaWNpYSBMb2VibGVpbiwgQW1hbmRhIE1jR2FycnksIEthdGh5IFBlcmtpbnMnLFxyXG4gICAgICBncmFwaGljQXJ0czogJ01lZ2FuIExhaSwgU2hhcm9uIFNpbWFuLVRvdicsXHJcbiAgICAgIHF1YWxpdHlBc3N1cmFuY2U6ICdTdGVlbGUgRGFsdG9uLCBCcnljZSBHcmllYmVub3csIEVsaXNlIE1vcmdhbiwgTGlhbSBNdWxoYWxsLCBPbGl2ZXIgT3Jlam9sYSwgTGF1cmEgUmVhLCAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0JlbmphbWluIFJvYmVydHMsIEphY29iIFJvbWVybywgS2F0aHJ5biBXb2Vzc25lciwgQnJ5YW4gWW9lbGluJ1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IHNpbSA9IG5ldyBTaW0oIHRpdGxlU3RyaW5nUHJvcGVydHksIHNjcmVlbnMsIG9wdGlvbnMgKTtcclxuICBzaW0uc3RhcnQoKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxHQUFHLE1BQU0sdUJBQXVCO0FBQ3ZDLE9BQU9DLFdBQVcsTUFBTSwrQkFBK0I7QUFDdkQsT0FBT0MsTUFBTSxNQUFNLDJCQUEyQjtBQUM5QyxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFDNUQsT0FBT0MsY0FBYyxNQUFNLDhCQUE4QjtBQUN6RCxPQUFPQyxnQkFBZ0IsTUFBTSxrQ0FBa0M7QUFDL0QsT0FBT0MsV0FBVyxNQUFNLHdCQUF3QjtBQUNoRCxPQUFPQyxvQkFBb0IsTUFBTSwwQ0FBMEM7QUFFM0VOLFdBQVcsQ0FBQ08sTUFBTSxDQUFFLE1BQU07RUFFeEIsTUFBTUMsbUJBQW1CLEdBQUdOLG9CQUFvQixDQUFFLGdCQUFnQixDQUFFLENBQUNNLG1CQUFtQjtFQUV4RixNQUFNQyxPQUFPLEdBQUcsQ0FDZCxJQUFJSixXQUFXLENBQUVKLE1BQU0sQ0FBQ1MsSUFBSSxDQUFDQyxZQUFZLENBQUUsYUFBYyxDQUFFLENBQUMsRUFDNUQsSUFBSUwsb0JBQW9CLENBQUVMLE1BQU0sQ0FBQ1MsSUFBSSxDQUFDQyxZQUFZLENBQUUsc0JBQXVCLENBQUUsQ0FBQyxFQUM5RSxJQUFJUCxnQkFBZ0IsQ0FBRUgsTUFBTSxDQUFDUyxJQUFJLENBQUNDLFlBQVksQ0FBRSxrQkFBbUIsQ0FBRSxDQUFDLEVBQ3RFLElBQUlSLGNBQWMsQ0FBRUYsTUFBTSxDQUFDUyxJQUFJLENBQUNDLFlBQVksQ0FBRSxnQkFBaUIsQ0FBRSxDQUFDLENBQ25FO0VBRUQsTUFBTUMsT0FBTyxHQUFHO0lBQ2RDLE9BQU8sRUFBRTtNQUNQQyxVQUFVLEVBQUUsWUFBWTtNQUN4QkMsbUJBQW1CLEVBQUUsZ0NBQWdDO01BQ3JEQyxJQUFJLEVBQUUsMEZBQTBGO01BQ2hHQyxXQUFXLEVBQUUsNkJBQTZCO01BQzFDQyxnQkFBZ0IsRUFBRSx5RkFBeUYsR0FDekY7SUFDcEI7RUFDRixDQUFDO0VBRUQsTUFBTUMsR0FBRyxHQUFHLElBQUlwQixHQUFHLENBQUVTLG1CQUFtQixFQUFFQyxPQUFPLEVBQUVHLE9BQVEsQ0FBQztFQUM1RE8sR0FBRyxDQUFDQyxLQUFLLENBQUMsQ0FBQztBQUNiLENBQUUsQ0FBQyJ9