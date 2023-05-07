// Copyright 2013-2022, University of Colorado Boulder

/**
 * Main file for the Under Pressure simulation.
 */

import UnderPressureScreen from '../../fluid-pressure-and-flow/js/under-pressure/UnderPressureScreen.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import UnderPressureStrings from './UnderPressureStrings.js';
const underPressureTitleStringProperty = UnderPressureStrings['under-pressure'].titleStringProperty;
const simOptions = {
  credits: {
    leadDesign: 'Sam Reid',
    softwareDevelopment: 'John Blanco, Aadish Gupta, Sam Reid',
    team: 'Bryce Gruneich, Trish Loeblein, Ariel Paul, Kathy Perkins, Rachel Pepper, Noah Podolefsky',
    qualityAssurance: 'Steele Dalton, Amanda Davis, Bryce Griebenow, Elise Morgan, Ben Roberts',
    thanks: 'Thanks to Mobile Learner Labs and Actual Concepts for working with the PhET development team to ' + 'convert this simulation to HTML5.'
  }
};
simLauncher.launch(() => {
  const sim = new Sim(underPressureTitleStringProperty, [new UnderPressureScreen()], simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVbmRlclByZXNzdXJlU2NyZWVuIiwiU2ltIiwic2ltTGF1bmNoZXIiLCJVbmRlclByZXNzdXJlU3RyaW5ncyIsInVuZGVyUHJlc3N1cmVUaXRsZVN0cmluZ1Byb3BlcnR5IiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInNpbU9wdGlvbnMiLCJjcmVkaXRzIiwibGVhZERlc2lnbiIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJ0ZWFtIiwicXVhbGl0eUFzc3VyYW5jZSIsInRoYW5rcyIsImxhdW5jaCIsInNpbSIsInN0YXJ0Il0sInNvdXJjZXMiOlsidW5kZXItcHJlc3N1cmUtbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYWluIGZpbGUgZm9yIHRoZSBVbmRlciBQcmVzc3VyZSBzaW11bGF0aW9uLlxyXG4gKi9cclxuXHJcbmltcG9ydCBVbmRlclByZXNzdXJlU2NyZWVuIGZyb20gJy4uLy4uL2ZsdWlkLXByZXNzdXJlLWFuZC1mbG93L2pzL3VuZGVyLXByZXNzdXJlL1VuZGVyUHJlc3N1cmVTY3JlZW4uanMnO1xyXG5pbXBvcnQgU2ltIGZyb20gJy4uLy4uL2pvaXN0L2pzL1NpbS5qcyc7XHJcbmltcG9ydCBzaW1MYXVuY2hlciBmcm9tICcuLi8uLi9qb2lzdC9qcy9zaW1MYXVuY2hlci5qcyc7XHJcbmltcG9ydCBVbmRlclByZXNzdXJlU3RyaW5ncyBmcm9tICcuL1VuZGVyUHJlc3N1cmVTdHJpbmdzLmpzJztcclxuXHJcbmNvbnN0IHVuZGVyUHJlc3N1cmVUaXRsZVN0cmluZ1Byb3BlcnR5ID0gVW5kZXJQcmVzc3VyZVN0cmluZ3NbICd1bmRlci1wcmVzc3VyZScgXS50aXRsZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxuY29uc3Qgc2ltT3B0aW9ucyA9IHtcclxuICBjcmVkaXRzOiB7XHJcbiAgICBsZWFkRGVzaWduOiAnU2FtIFJlaWQnLFxyXG4gICAgc29mdHdhcmVEZXZlbG9wbWVudDogJ0pvaG4gQmxhbmNvLCBBYWRpc2ggR3VwdGEsIFNhbSBSZWlkJyxcclxuICAgIHRlYW06ICdCcnljZSBHcnVuZWljaCwgVHJpc2ggTG9lYmxlaW4sIEFyaWVsIFBhdWwsIEthdGh5IFBlcmtpbnMsIFJhY2hlbCBQZXBwZXIsIE5vYWggUG9kb2xlZnNreScsXHJcbiAgICBxdWFsaXR5QXNzdXJhbmNlOiAnU3RlZWxlIERhbHRvbiwgQW1hbmRhIERhdmlzLCBCcnljZSBHcmllYmVub3csIEVsaXNlIE1vcmdhbiwgQmVuIFJvYmVydHMnLFxyXG4gICAgdGhhbmtzOiAnVGhhbmtzIHRvIE1vYmlsZSBMZWFybmVyIExhYnMgYW5kIEFjdHVhbCBDb25jZXB0cyBmb3Igd29ya2luZyB3aXRoIHRoZSBQaEVUIGRldmVsb3BtZW50IHRlYW0gdG8gJyArXHJcbiAgICAgICAgICAgICdjb252ZXJ0IHRoaXMgc2ltdWxhdGlvbiB0byBIVE1MNS4nXHJcbiAgfVxyXG59O1xyXG5cclxuc2ltTGF1bmNoZXIubGF1bmNoKCAoKSA9PiB7XHJcbiAgY29uc3Qgc2ltID0gbmV3IFNpbSggdW5kZXJQcmVzc3VyZVRpdGxlU3RyaW5nUHJvcGVydHksIFsgbmV3IFVuZGVyUHJlc3N1cmVTY3JlZW4oKSBdLCBzaW1PcHRpb25zICk7XHJcbiAgc2ltLnN0YXJ0KCk7XHJcbn0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxtQkFBbUIsTUFBTSx3RUFBd0U7QUFDeEcsT0FBT0MsR0FBRyxNQUFNLHVCQUF1QjtBQUN2QyxPQUFPQyxXQUFXLE1BQU0sK0JBQStCO0FBQ3ZELE9BQU9DLG9CQUFvQixNQUFNLDJCQUEyQjtBQUU1RCxNQUFNQyxnQ0FBZ0MsR0FBR0Qsb0JBQW9CLENBQUUsZ0JBQWdCLENBQUUsQ0FBQ0UsbUJBQW1CO0FBRXJHLE1BQU1DLFVBQVUsR0FBRztFQUNqQkMsT0FBTyxFQUFFO0lBQ1BDLFVBQVUsRUFBRSxVQUFVO0lBQ3RCQyxtQkFBbUIsRUFBRSxxQ0FBcUM7SUFDMURDLElBQUksRUFBRSwyRkFBMkY7SUFDakdDLGdCQUFnQixFQUFFLHlFQUF5RTtJQUMzRkMsTUFBTSxFQUFFLGtHQUFrRyxHQUNsRztFQUNWO0FBQ0YsQ0FBQztBQUVEVixXQUFXLENBQUNXLE1BQU0sQ0FBRSxNQUFNO0VBQ3hCLE1BQU1DLEdBQUcsR0FBRyxJQUFJYixHQUFHLENBQUVHLGdDQUFnQyxFQUFFLENBQUUsSUFBSUosbUJBQW1CLENBQUMsQ0FBQyxDQUFFLEVBQUVNLFVBQVcsQ0FBQztFQUNsR1EsR0FBRyxDQUFDQyxLQUFLLENBQUMsQ0FBQztBQUNiLENBQUUsQ0FBQyJ9