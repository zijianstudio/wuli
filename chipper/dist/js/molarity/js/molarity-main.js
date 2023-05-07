// Copyright 2013-2022, University of Colorado Boulder

/**
 * Main entry point for the 'Molarity' sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import MolarityScreen from './molarity/MolarityScreen.js';
import MolarityStrings from './MolarityStrings.js';
const molarityTitleStringProperty = MolarityStrings.molarity.titleStringProperty;

// constants
const tandem = Tandem.ROOT;
const options = {
  credits: {
    leadDesign: 'Julia Chamberlain',
    softwareDevelopment: 'Chris Malley (PixelZoom, Inc.), John Blanco, Michael Kauzmann, Taylor Want',
    team: 'Kelly Lancaster, Emily B. Moore, Matthew Moore, Robert Parson, Kathy Perkins, Taliesin Smith, Brianna Tomlinson',
    soundDesign: 'Ashton Morris',
    qualityAssurance: 'Jaspe Arias, Logan Bray, Steele Dalton, Alex Dornan, Ethan Johnson, Megan Lai, Elise Morgan, Liam Mulhall, Oliver Orejola, Jacob Romero, Kathryn Woessner, Bryan Yoelin'
  }
};
simLauncher.launch(() => {
  const screens = [new MolarityScreen(tandem.createTandem('molarityScreen'))];
  const sim = new Sim(molarityTitleStringProperty, screens, options);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIlRhbmRlbSIsIk1vbGFyaXR5U2NyZWVuIiwiTW9sYXJpdHlTdHJpbmdzIiwibW9sYXJpdHlUaXRsZVN0cmluZ1Byb3BlcnR5IiwibW9sYXJpdHkiLCJ0aXRsZVN0cmluZ1Byb3BlcnR5IiwidGFuZGVtIiwiUk9PVCIsIm9wdGlvbnMiLCJjcmVkaXRzIiwibGVhZERlc2lnbiIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJ0ZWFtIiwic291bmREZXNpZ24iLCJxdWFsaXR5QXNzdXJhbmNlIiwibGF1bmNoIiwic2NyZWVucyIsImNyZWF0ZVRhbmRlbSIsInNpbSIsInN0YXJ0Il0sInNvdXJjZXMiOlsibW9sYXJpdHktbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYWluIGVudHJ5IHBvaW50IGZvciB0aGUgJ01vbGFyaXR5JyBzaW0uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFNpbSBmcm9tICcuLi8uLi9qb2lzdC9qcy9TaW0uanMnO1xyXG5pbXBvcnQgc2ltTGF1bmNoZXIgZnJvbSAnLi4vLi4vam9pc3QvanMvc2ltTGF1bmNoZXIuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgTW9sYXJpdHlTY3JlZW4gZnJvbSAnLi9tb2xhcml0eS9Nb2xhcml0eVNjcmVlbi5qcyc7XHJcbmltcG9ydCBNb2xhcml0eVN0cmluZ3MgZnJvbSAnLi9Nb2xhcml0eVN0cmluZ3MuanMnO1xyXG5cclxuY29uc3QgbW9sYXJpdHlUaXRsZVN0cmluZ1Byb3BlcnR5ID0gTW9sYXJpdHlTdHJpbmdzLm1vbGFyaXR5LnRpdGxlU3RyaW5nUHJvcGVydHk7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgdGFuZGVtID0gVGFuZGVtLlJPT1Q7XHJcblxyXG5jb25zdCBvcHRpb25zID0ge1xyXG4gIGNyZWRpdHM6IHtcclxuICAgIGxlYWREZXNpZ246ICdKdWxpYSBDaGFtYmVybGFpbicsXHJcbiAgICBzb2Z0d2FyZURldmVsb3BtZW50OiAnQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pLCBKb2huIEJsYW5jbywgTWljaGFlbCBLYXV6bWFubiwgVGF5bG9yIFdhbnQnLFxyXG4gICAgdGVhbTogJ0tlbGx5IExhbmNhc3RlciwgRW1pbHkgQi4gTW9vcmUsIE1hdHRoZXcgTW9vcmUsIFJvYmVydCBQYXJzb24sIEthdGh5IFBlcmtpbnMsIFRhbGllc2luIFNtaXRoLCBCcmlhbm5hIFRvbWxpbnNvbicsXHJcbiAgICBzb3VuZERlc2lnbjogJ0FzaHRvbiBNb3JyaXMnLFxyXG4gICAgcXVhbGl0eUFzc3VyYW5jZTogJ0phc3BlIEFyaWFzLCBMb2dhbiBCcmF5LCBTdGVlbGUgRGFsdG9uLCBBbGV4IERvcm5hbiwgRXRoYW4gSm9obnNvbiwgTWVnYW4gTGFpLCBFbGlzZSBNb3JnYW4sIExpYW0gTXVsaGFsbCwgT2xpdmVyIE9yZWpvbGEsIEphY29iIFJvbWVybywgS2F0aHJ5biBXb2Vzc25lciwgQnJ5YW4gWW9lbGluJ1xyXG4gIH1cclxufTtcclxuXHJcbnNpbUxhdW5jaGVyLmxhdW5jaCggKCkgPT4ge1xyXG4gIGNvbnN0IHNjcmVlbnMgPSBbIG5ldyBNb2xhcml0eVNjcmVlbiggdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21vbGFyaXR5U2NyZWVuJyApICkgXTtcclxuICBjb25zdCBzaW0gPSBuZXcgU2ltKCBtb2xhcml0eVRpdGxlU3RyaW5nUHJvcGVydHksIHNjcmVlbnMsIG9wdGlvbnMgKTtcclxuICBzaW0uc3RhcnQoKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxHQUFHLE1BQU0sdUJBQXVCO0FBQ3ZDLE9BQU9DLFdBQVcsTUFBTSwrQkFBK0I7QUFDdkQsT0FBT0MsTUFBTSxNQUFNLDJCQUEyQjtBQUM5QyxPQUFPQyxjQUFjLE1BQU0sOEJBQThCO0FBQ3pELE9BQU9DLGVBQWUsTUFBTSxzQkFBc0I7QUFFbEQsTUFBTUMsMkJBQTJCLEdBQUdELGVBQWUsQ0FBQ0UsUUFBUSxDQUFDQyxtQkFBbUI7O0FBRWhGO0FBQ0EsTUFBTUMsTUFBTSxHQUFHTixNQUFNLENBQUNPLElBQUk7QUFFMUIsTUFBTUMsT0FBTyxHQUFHO0VBQ2RDLE9BQU8sRUFBRTtJQUNQQyxVQUFVLEVBQUUsbUJBQW1CO0lBQy9CQyxtQkFBbUIsRUFBRSw0RUFBNEU7SUFDakdDLElBQUksRUFBRSxpSEFBaUg7SUFDdkhDLFdBQVcsRUFBRSxlQUFlO0lBQzVCQyxnQkFBZ0IsRUFBRTtFQUNwQjtBQUNGLENBQUM7QUFFRGYsV0FBVyxDQUFDZ0IsTUFBTSxDQUFFLE1BQU07RUFDeEIsTUFBTUMsT0FBTyxHQUFHLENBQUUsSUFBSWYsY0FBYyxDQUFFSyxNQUFNLENBQUNXLFlBQVksQ0FBRSxnQkFBaUIsQ0FBRSxDQUFDLENBQUU7RUFDakYsTUFBTUMsR0FBRyxHQUFHLElBQUlwQixHQUFHLENBQUVLLDJCQUEyQixFQUFFYSxPQUFPLEVBQUVSLE9BQVEsQ0FBQztFQUNwRVUsR0FBRyxDQUFDQyxLQUFLLENBQUMsQ0FBQztBQUNiLENBQUUsQ0FBQyJ9