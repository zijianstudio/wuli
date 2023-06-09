// Copyright 2016-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Matt Pennington (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import EnergyScreen from './energy/EnergyScreen.js';
import IntroScreen from './intro/IntroScreen.js';
import LabScreen from './lab/LabScreen.js';
import MassesAndSpringsStrings from './MassesAndSpringsStrings.js';
import VectorsScreen from './vectors/VectorsScreen.js';
const massesAndSpringsTitleStringProperty = MassesAndSpringsStrings['masses-and-springs'].titleStringProperty;

// constants
const tandem = Tandem.ROOT;
const simOptions = {
  credits: {
    leadDesign: 'Amy Rouinfar, Mike Dubson',
    softwareDevelopment: 'Denzell Barnett, Matt Pennington',
    team: 'Wendy Adams, Ariel Paul, Kathy Perkins',
    qualityAssurance: 'Steele Dalton, Bryce Griebenow, Ethan Johnson, Megan Lai, Liam Mulhall, Arnab Purkayastha, Benjamin Roberts, Jacob Romero, Clara Wilson, Kathryn Woessner'
  }
};
simLauncher.launch(() => {
  const sim = new Sim(massesAndSpringsTitleStringProperty, [new IntroScreen(tandem.createTandem('introScreen')), new VectorsScreen(tandem.createTandem('vectorsScreen')), new EnergyScreen(tandem.createTandem('energyScreen')), new LabScreen(tandem.createTandem('labScreen'))], simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIlRhbmRlbSIsIkVuZXJneVNjcmVlbiIsIkludHJvU2NyZWVuIiwiTGFiU2NyZWVuIiwiTWFzc2VzQW5kU3ByaW5nc1N0cmluZ3MiLCJWZWN0b3JzU2NyZWVuIiwibWFzc2VzQW5kU3ByaW5nc1RpdGxlU3RyaW5nUHJvcGVydHkiLCJ0aXRsZVN0cmluZ1Byb3BlcnR5IiwidGFuZGVtIiwiUk9PVCIsInNpbU9wdGlvbnMiLCJjcmVkaXRzIiwibGVhZERlc2lnbiIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJ0ZWFtIiwicXVhbGl0eUFzc3VyYW5jZSIsImxhdW5jaCIsInNpbSIsImNyZWF0ZVRhbmRlbSIsInN0YXJ0Il0sInNvdXJjZXMiOlsibWFzc2VzLWFuZC1zcHJpbmdzLW1haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIHNpbS5cclxuICpcclxuICogQGF1dGhvciBNYXR0IFBlbm5pbmd0b24gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgRGVuemVsbCBCYXJuZXR0IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTaW0gZnJvbSAnLi4vLi4vam9pc3QvanMvU2ltLmpzJztcclxuaW1wb3J0IHNpbUxhdW5jaGVyIGZyb20gJy4uLy4uL2pvaXN0L2pzL3NpbUxhdW5jaGVyLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEVuZXJneVNjcmVlbiBmcm9tICcuL2VuZXJneS9FbmVyZ3lTY3JlZW4uanMnO1xyXG5pbXBvcnQgSW50cm9TY3JlZW4gZnJvbSAnLi9pbnRyby9JbnRyb1NjcmVlbi5qcyc7XHJcbmltcG9ydCBMYWJTY3JlZW4gZnJvbSAnLi9sYWIvTGFiU2NyZWVuLmpzJztcclxuaW1wb3J0IE1hc3Nlc0FuZFNwcmluZ3NTdHJpbmdzIGZyb20gJy4vTWFzc2VzQW5kU3ByaW5nc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgVmVjdG9yc1NjcmVlbiBmcm9tICcuL3ZlY3RvcnMvVmVjdG9yc1NjcmVlbi5qcyc7XHJcblxyXG5jb25zdCBtYXNzZXNBbmRTcHJpbmdzVGl0bGVTdHJpbmdQcm9wZXJ0eSA9IE1hc3Nlc0FuZFNwcmluZ3NTdHJpbmdzWyAnbWFzc2VzLWFuZC1zcHJpbmdzJyBdLnRpdGxlU3RyaW5nUHJvcGVydHk7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgdGFuZGVtID0gVGFuZGVtLlJPT1Q7XHJcblxyXG5jb25zdCBzaW1PcHRpb25zID0ge1xyXG4gIGNyZWRpdHM6IHtcclxuICAgIGxlYWREZXNpZ246ICdBbXkgUm91aW5mYXIsIE1pa2UgRHVic29uJyxcclxuICAgIHNvZnR3YXJlRGV2ZWxvcG1lbnQ6ICdEZW56ZWxsIEJhcm5ldHQsIE1hdHQgUGVubmluZ3RvbicsXHJcbiAgICB0ZWFtOiAnV2VuZHkgQWRhbXMsIEFyaWVsIFBhdWwsIEthdGh5IFBlcmtpbnMnLFxyXG4gICAgcXVhbGl0eUFzc3VyYW5jZTpcclxuICAgICAgJ1N0ZWVsZSBEYWx0b24sIEJyeWNlIEdyaWViZW5vdywgRXRoYW4gSm9obnNvbiwgTWVnYW4gTGFpLCBMaWFtIE11bGhhbGwsIEFybmFiIFB1cmtheWFzdGhhLCBCZW5qYW1pbiBSb2JlcnRzLCBKYWNvYiBSb21lcm8sIENsYXJhIFdpbHNvbiwgS2F0aHJ5biBXb2Vzc25lcidcclxuICB9XHJcbn07XHJcblxyXG5zaW1MYXVuY2hlci5sYXVuY2goICgpID0+IHtcclxuICBjb25zdCBzaW0gPSBuZXcgU2ltKCBtYXNzZXNBbmRTcHJpbmdzVGl0bGVTdHJpbmdQcm9wZXJ0eSwgW1xyXG4gICAgbmV3IEludHJvU2NyZWVuKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaW50cm9TY3JlZW4nICkgKSxcclxuICAgIG5ldyBWZWN0b3JzU2NyZWVuKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmVjdG9yc1NjcmVlbicgKSApLFxyXG4gICAgbmV3IEVuZXJneVNjcmVlbiggdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VuZXJneVNjcmVlbicgKSApLFxyXG4gICAgbmV3IExhYlNjcmVlbiggdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xhYlNjcmVlbicgKSApXHJcbiAgXSwgc2ltT3B0aW9ucyApO1xyXG4gIHNpbS5zdGFydCgpO1xyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsR0FBRyxNQUFNLHVCQUF1QjtBQUN2QyxPQUFPQyxXQUFXLE1BQU0sK0JBQStCO0FBQ3ZELE9BQU9DLE1BQU0sTUFBTSwyQkFBMkI7QUFDOUMsT0FBT0MsWUFBWSxNQUFNLDBCQUEwQjtBQUNuRCxPQUFPQyxXQUFXLE1BQU0sd0JBQXdCO0FBQ2hELE9BQU9DLFNBQVMsTUFBTSxvQkFBb0I7QUFDMUMsT0FBT0MsdUJBQXVCLE1BQU0sOEJBQThCO0FBQ2xFLE9BQU9DLGFBQWEsTUFBTSw0QkFBNEI7QUFFdEQsTUFBTUMsbUNBQW1DLEdBQUdGLHVCQUF1QixDQUFFLG9CQUFvQixDQUFFLENBQUNHLG1CQUFtQjs7QUFFL0c7QUFDQSxNQUFNQyxNQUFNLEdBQUdSLE1BQU0sQ0FBQ1MsSUFBSTtBQUUxQixNQUFNQyxVQUFVLEdBQUc7RUFDakJDLE9BQU8sRUFBRTtJQUNQQyxVQUFVLEVBQUUsMkJBQTJCO0lBQ3ZDQyxtQkFBbUIsRUFBRSxrQ0FBa0M7SUFDdkRDLElBQUksRUFBRSx3Q0FBd0M7SUFDOUNDLGdCQUFnQixFQUNkO0VBQ0o7QUFDRixDQUFDO0FBRURoQixXQUFXLENBQUNpQixNQUFNLENBQUUsTUFBTTtFQUN4QixNQUFNQyxHQUFHLEdBQUcsSUFBSW5CLEdBQUcsQ0FBRVEsbUNBQW1DLEVBQUUsQ0FDeEQsSUFBSUosV0FBVyxDQUFFTSxNQUFNLENBQUNVLFlBQVksQ0FBRSxhQUFjLENBQUUsQ0FBQyxFQUN2RCxJQUFJYixhQUFhLENBQUVHLE1BQU0sQ0FBQ1UsWUFBWSxDQUFFLGVBQWdCLENBQUUsQ0FBQyxFQUMzRCxJQUFJakIsWUFBWSxDQUFFTyxNQUFNLENBQUNVLFlBQVksQ0FBRSxjQUFlLENBQUUsQ0FBQyxFQUN6RCxJQUFJZixTQUFTLENBQUVLLE1BQU0sQ0FBQ1UsWUFBWSxDQUFFLFdBQVksQ0FBRSxDQUFDLENBQ3BELEVBQUVSLFVBQVcsQ0FBQztFQUNmTyxHQUFHLENBQUNFLEtBQUssQ0FBQyxDQUFDO0FBQ2IsQ0FBRSxDQUFDIn0=