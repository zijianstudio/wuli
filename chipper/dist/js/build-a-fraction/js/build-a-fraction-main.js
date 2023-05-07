// Copyright 2018-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import BuildAFractionStrings from './BuildAFractionStrings.js';
import BuildAFractionScreen from './view/BuildAFractionScreen.js';
import LabScreen from './view/LabScreen.js';
import MixedNumbersScreen from './view/MixedNumbersScreen.js';
const buildAFractionTitleStringProperty = BuildAFractionStrings['build-a-fraction'].titleStringProperty;
const simOptions = {
  credits: {
    leadDesign: 'Ariel Paul',
    softwareDevelopment: 'Jonathan Olson, Sam Reid',
    team: 'Mike Dubson, Karina K. R. Hensberry, Trish Loeblein, Amanda McGarry, Kathy Perkins',
    qualityAssurance: 'Steele Dalton, Megan Lai, Liam Mulhall, Laura Rea, Jacob Romero, Kathryn Woessner, and Kelly Wurtz',
    graphicArts: '',
    thanks: ''
  }
};
simLauncher.launch(() => {
  const sim = new Sim(buildAFractionTitleStringProperty, [new BuildAFractionScreen(), new MixedNumbersScreen(), new LabScreen()], simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIkJ1aWxkQUZyYWN0aW9uU3RyaW5ncyIsIkJ1aWxkQUZyYWN0aW9uU2NyZWVuIiwiTGFiU2NyZWVuIiwiTWl4ZWROdW1iZXJzU2NyZWVuIiwiYnVpbGRBRnJhY3Rpb25UaXRsZVN0cmluZ1Byb3BlcnR5IiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInNpbU9wdGlvbnMiLCJjcmVkaXRzIiwibGVhZERlc2lnbiIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJ0ZWFtIiwicXVhbGl0eUFzc3VyYW5jZSIsImdyYXBoaWNBcnRzIiwidGhhbmtzIiwibGF1bmNoIiwic2ltIiwic3RhcnQiXSwic291cmNlcyI6WyJidWlsZC1hLWZyYWN0aW9uLW1haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIHNpbS5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBTaW0gZnJvbSAnLi4vLi4vam9pc3QvanMvU2ltLmpzJztcclxuaW1wb3J0IHNpbUxhdW5jaGVyIGZyb20gJy4uLy4uL2pvaXN0L2pzL3NpbUxhdW5jaGVyLmpzJztcclxuaW1wb3J0IEJ1aWxkQUZyYWN0aW9uU3RyaW5ncyBmcm9tICcuL0J1aWxkQUZyYWN0aW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBCdWlsZEFGcmFjdGlvblNjcmVlbiBmcm9tICcuL3ZpZXcvQnVpbGRBRnJhY3Rpb25TY3JlZW4uanMnO1xyXG5pbXBvcnQgTGFiU2NyZWVuIGZyb20gJy4vdmlldy9MYWJTY3JlZW4uanMnO1xyXG5pbXBvcnQgTWl4ZWROdW1iZXJzU2NyZWVuIGZyb20gJy4vdmlldy9NaXhlZE51bWJlcnNTY3JlZW4uanMnO1xyXG5cclxuY29uc3QgYnVpbGRBRnJhY3Rpb25UaXRsZVN0cmluZ1Byb3BlcnR5ID0gQnVpbGRBRnJhY3Rpb25TdHJpbmdzWyAnYnVpbGQtYS1mcmFjdGlvbicgXS50aXRsZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxuY29uc3Qgc2ltT3B0aW9ucyA9IHtcclxuICBjcmVkaXRzOiB7XHJcbiAgICBsZWFkRGVzaWduOiAnQXJpZWwgUGF1bCcsXHJcbiAgICBzb2Z0d2FyZURldmVsb3BtZW50OiAnSm9uYXRoYW4gT2xzb24sIFNhbSBSZWlkJyxcclxuICAgIHRlYW06ICdNaWtlIER1YnNvbiwgS2FyaW5hIEsuIFIuIEhlbnNiZXJyeSwgVHJpc2ggTG9lYmxlaW4sIEFtYW5kYSBNY0dhcnJ5LCBLYXRoeSBQZXJraW5zJyxcclxuICAgIHF1YWxpdHlBc3N1cmFuY2U6ICdTdGVlbGUgRGFsdG9uLCBNZWdhbiBMYWksIExpYW0gTXVsaGFsbCwgTGF1cmEgUmVhLCBKYWNvYiBSb21lcm8sIEthdGhyeW4gV29lc3NuZXIsIGFuZCBLZWxseSBXdXJ0eicsXHJcbiAgICBncmFwaGljQXJ0czogJycsXHJcbiAgICB0aGFua3M6ICcnXHJcbiAgfVxyXG59O1xyXG5cclxuc2ltTGF1bmNoZXIubGF1bmNoKCAoKSA9PiB7XHJcbiAgY29uc3Qgc2ltID0gbmV3IFNpbSggYnVpbGRBRnJhY3Rpb25UaXRsZVN0cmluZ1Byb3BlcnR5LCBbXHJcbiAgICBuZXcgQnVpbGRBRnJhY3Rpb25TY3JlZW4oKSxcclxuICAgIG5ldyBNaXhlZE51bWJlcnNTY3JlZW4oKSxcclxuICAgIG5ldyBMYWJTY3JlZW4oKVxyXG4gIF0sIHNpbU9wdGlvbnMgKTtcclxuICBzaW0uc3RhcnQoKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxHQUFHLE1BQU0sdUJBQXVCO0FBQ3ZDLE9BQU9DLFdBQVcsTUFBTSwrQkFBK0I7QUFDdkQsT0FBT0MscUJBQXFCLE1BQU0sNEJBQTRCO0FBQzlELE9BQU9DLG9CQUFvQixNQUFNLGdDQUFnQztBQUNqRSxPQUFPQyxTQUFTLE1BQU0scUJBQXFCO0FBQzNDLE9BQU9DLGtCQUFrQixNQUFNLDhCQUE4QjtBQUU3RCxNQUFNQyxpQ0FBaUMsR0FBR0oscUJBQXFCLENBQUUsa0JBQWtCLENBQUUsQ0FBQ0ssbUJBQW1CO0FBRXpHLE1BQU1DLFVBQVUsR0FBRztFQUNqQkMsT0FBTyxFQUFFO0lBQ1BDLFVBQVUsRUFBRSxZQUFZO0lBQ3hCQyxtQkFBbUIsRUFBRSwwQkFBMEI7SUFDL0NDLElBQUksRUFBRSxvRkFBb0Y7SUFDMUZDLGdCQUFnQixFQUFFLG9HQUFvRztJQUN0SEMsV0FBVyxFQUFFLEVBQUU7SUFDZkMsTUFBTSxFQUFFO0VBQ1Y7QUFDRixDQUFDO0FBRURkLFdBQVcsQ0FBQ2UsTUFBTSxDQUFFLE1BQU07RUFDeEIsTUFBTUMsR0FBRyxHQUFHLElBQUlqQixHQUFHLENBQUVNLGlDQUFpQyxFQUFFLENBQ3RELElBQUlILG9CQUFvQixDQUFDLENBQUMsRUFDMUIsSUFBSUUsa0JBQWtCLENBQUMsQ0FBQyxFQUN4QixJQUFJRCxTQUFTLENBQUMsQ0FBQyxDQUNoQixFQUFFSSxVQUFXLENBQUM7RUFDZlMsR0FBRyxDQUFDQyxLQUFLLENBQUMsQ0FBQztBQUNiLENBQUUsQ0FBQyJ9