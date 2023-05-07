// Copyright 2015-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import EnergyScreen from './energy/EnergyScreen.js';
import HookesLawStrings from './HookesLawStrings.js';
import IntroScreen from './intro/IntroScreen.js';
import SystemsScreen from './systems/SystemsScreen.js';
simLauncher.launch(() => {
  const screens = [new IntroScreen(Tandem.ROOT.createTandem('introScreen')), new SystemsScreen(Tandem.ROOT.createTandem('systemsScreen')), new EnergyScreen(Tandem.ROOT.createTandem('energyScreen'))];
  const sim = new Sim(HookesLawStrings['hookes-law'].titleStringProperty, screens, {
    credits: {
      leadDesign: 'Amy Rouinfar',
      softwareDevelopment: 'Chris Malley (PixelZoom, Inc.)',
      team: 'Michael Dubson, Bruna Shinohara de Mendon\u00e7a, Ariel Paul, Kathy Perkins, Martin Veillette',
      qualityAssurance: 'Steele Dalton, Brooklyn Lash, Elise Morgan, Oliver Orejola, Bryan Yoelin',
      graphicArts: 'Mariah Hermsmeyer'
    }
  });
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIlRhbmRlbSIsIkVuZXJneVNjcmVlbiIsIkhvb2tlc0xhd1N0cmluZ3MiLCJJbnRyb1NjcmVlbiIsIlN5c3RlbXNTY3JlZW4iLCJsYXVuY2giLCJzY3JlZW5zIiwiUk9PVCIsImNyZWF0ZVRhbmRlbSIsInNpbSIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJjcmVkaXRzIiwibGVhZERlc2lnbiIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJ0ZWFtIiwicXVhbGl0eUFzc3VyYW5jZSIsImdyYXBoaWNBcnRzIiwic3RhcnQiXSwic291cmNlcyI6WyJob29rZXMtbGF3LW1haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIHNpbS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgU2ltIGZyb20gJy4uLy4uL2pvaXN0L2pzL1NpbS5qcyc7XHJcbmltcG9ydCBzaW1MYXVuY2hlciBmcm9tICcuLi8uLi9qb2lzdC9qcy9zaW1MYXVuY2hlci5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBFbmVyZ3lTY3JlZW4gZnJvbSAnLi9lbmVyZ3kvRW5lcmd5U2NyZWVuLmpzJztcclxuaW1wb3J0IEhvb2tlc0xhd1N0cmluZ3MgZnJvbSAnLi9Ib29rZXNMYXdTdHJpbmdzLmpzJztcclxuaW1wb3J0IEludHJvU2NyZWVuIGZyb20gJy4vaW50cm8vSW50cm9TY3JlZW4uanMnO1xyXG5pbXBvcnQgU3lzdGVtc1NjcmVlbiBmcm9tICcuL3N5c3RlbXMvU3lzdGVtc1NjcmVlbi5qcyc7XHJcblxyXG5zaW1MYXVuY2hlci5sYXVuY2goICgpID0+IHtcclxuXHJcbiAgY29uc3Qgc2NyZWVucyA9IFtcclxuICAgIG5ldyBJbnRyb1NjcmVlbiggVGFuZGVtLlJPT1QuY3JlYXRlVGFuZGVtKCAnaW50cm9TY3JlZW4nICkgKSxcclxuICAgIG5ldyBTeXN0ZW1zU2NyZWVuKCBUYW5kZW0uUk9PVC5jcmVhdGVUYW5kZW0oICdzeXN0ZW1zU2NyZWVuJyApICksXHJcbiAgICBuZXcgRW5lcmd5U2NyZWVuKCBUYW5kZW0uUk9PVC5jcmVhdGVUYW5kZW0oICdlbmVyZ3lTY3JlZW4nICkgKVxyXG4gIF07XHJcblxyXG4gIGNvbnN0IHNpbSA9IG5ldyBTaW0oIEhvb2tlc0xhd1N0cmluZ3NbICdob29rZXMtbGF3JyBdLnRpdGxlU3RyaW5nUHJvcGVydHksIHNjcmVlbnMsIHtcclxuICAgIGNyZWRpdHM6IHtcclxuICAgICAgbGVhZERlc2lnbjogJ0FteSBSb3VpbmZhcicsXHJcbiAgICAgIHNvZnR3YXJlRGV2ZWxvcG1lbnQ6ICdDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLiknLFxyXG4gICAgICB0ZWFtOiAnTWljaGFlbCBEdWJzb24sIEJydW5hIFNoaW5vaGFyYSBkZSBNZW5kb25cXHUwMGU3YSwgQXJpZWwgUGF1bCwgS2F0aHkgUGVya2lucywgTWFydGluIFZlaWxsZXR0ZScsXHJcbiAgICAgIHF1YWxpdHlBc3N1cmFuY2U6ICdTdGVlbGUgRGFsdG9uLCBCcm9va2x5biBMYXNoLCBFbGlzZSBNb3JnYW4sIE9saXZlciBPcmVqb2xhLCBCcnlhbiBZb2VsaW4nLFxyXG4gICAgICBncmFwaGljQXJ0czogJ01hcmlhaCBIZXJtc21leWVyJ1xyXG4gICAgfVxyXG4gIH0gKTtcclxuXHJcbiAgc2ltLnN0YXJ0KCk7XHJcbn0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsR0FBRyxNQUFNLHVCQUF1QjtBQUN2QyxPQUFPQyxXQUFXLE1BQU0sK0JBQStCO0FBQ3ZELE9BQU9DLE1BQU0sTUFBTSwyQkFBMkI7QUFDOUMsT0FBT0MsWUFBWSxNQUFNLDBCQUEwQjtBQUNuRCxPQUFPQyxnQkFBZ0IsTUFBTSx1QkFBdUI7QUFDcEQsT0FBT0MsV0FBVyxNQUFNLHdCQUF3QjtBQUNoRCxPQUFPQyxhQUFhLE1BQU0sNEJBQTRCO0FBRXRETCxXQUFXLENBQUNNLE1BQU0sQ0FBRSxNQUFNO0VBRXhCLE1BQU1DLE9BQU8sR0FBRyxDQUNkLElBQUlILFdBQVcsQ0FBRUgsTUFBTSxDQUFDTyxJQUFJLENBQUNDLFlBQVksQ0FBRSxhQUFjLENBQUUsQ0FBQyxFQUM1RCxJQUFJSixhQUFhLENBQUVKLE1BQU0sQ0FBQ08sSUFBSSxDQUFDQyxZQUFZLENBQUUsZUFBZ0IsQ0FBRSxDQUFDLEVBQ2hFLElBQUlQLFlBQVksQ0FBRUQsTUFBTSxDQUFDTyxJQUFJLENBQUNDLFlBQVksQ0FBRSxjQUFlLENBQUUsQ0FBQyxDQUMvRDtFQUVELE1BQU1DLEdBQUcsR0FBRyxJQUFJWCxHQUFHLENBQUVJLGdCQUFnQixDQUFFLFlBQVksQ0FBRSxDQUFDUSxtQkFBbUIsRUFBRUosT0FBTyxFQUFFO0lBQ2xGSyxPQUFPLEVBQUU7TUFDUEMsVUFBVSxFQUFFLGNBQWM7TUFDMUJDLG1CQUFtQixFQUFFLGdDQUFnQztNQUNyREMsSUFBSSxFQUFFLCtGQUErRjtNQUNyR0MsZ0JBQWdCLEVBQUUsMEVBQTBFO01BQzVGQyxXQUFXLEVBQUU7SUFDZjtFQUNGLENBQUUsQ0FBQztFQUVIUCxHQUFHLENBQUNRLEtBQUssQ0FBQyxDQUFDO0FBQ2IsQ0FBRSxDQUFDIn0=