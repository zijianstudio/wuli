// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Michael Dubson (PhET Interactive Simulations)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import OpticsLabScreen from './optics-lab/OpticsLabScreen.js';
import OpticsLabStrings from './OpticsLabStrings.js';

//following 2 lines always required in every sim

const opticsLabTitleStringProperty = OpticsLabStrings['optics-lab'].titleStringProperty;
const simOptions = {
  credits: {
    //TODO fill in credits
    leadDesign: 'Michael Dubson',
    softwareDevelopment: 'Michael Dubson',
    team: '',
    thanks: ''
  }
};
simLauncher.launch(() => {
  const sim = new Sim(opticsLabTitleStringProperty, [new OpticsLabScreen()], simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIk9wdGljc0xhYlNjcmVlbiIsIk9wdGljc0xhYlN0cmluZ3MiLCJvcHRpY3NMYWJUaXRsZVN0cmluZ1Byb3BlcnR5IiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInNpbU9wdGlvbnMiLCJjcmVkaXRzIiwibGVhZERlc2lnbiIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJ0ZWFtIiwidGhhbmtzIiwibGF1bmNoIiwic2ltIiwic3RhcnQiXSwic291cmNlcyI6WyJvcHRpY3MtbGFiLW1haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIHNpbS5cclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIER1YnNvbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgU2ltIGZyb20gJy4uLy4uL2pvaXN0L2pzL1NpbS5qcyc7XHJcbmltcG9ydCBzaW1MYXVuY2hlciBmcm9tICcuLi8uLi9qb2lzdC9qcy9zaW1MYXVuY2hlci5qcyc7XHJcbmltcG9ydCBPcHRpY3NMYWJTY3JlZW4gZnJvbSAnLi9vcHRpY3MtbGFiL09wdGljc0xhYlNjcmVlbi5qcyc7XHJcbmltcG9ydCBPcHRpY3NMYWJTdHJpbmdzIGZyb20gJy4vT3B0aWNzTGFiU3RyaW5ncy5qcyc7XHJcblxyXG4vL2ZvbGxvd2luZyAyIGxpbmVzIGFsd2F5cyByZXF1aXJlZCBpbiBldmVyeSBzaW1cclxuXHJcbmNvbnN0IG9wdGljc0xhYlRpdGxlU3RyaW5nUHJvcGVydHkgPSBPcHRpY3NMYWJTdHJpbmdzWyAnb3B0aWNzLWxhYicgXS50aXRsZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxuY29uc3Qgc2ltT3B0aW9ucyA9IHtcclxuICBjcmVkaXRzOiB7XHJcbiAgICAvL1RPRE8gZmlsbCBpbiBjcmVkaXRzXHJcbiAgICBsZWFkRGVzaWduOiAnTWljaGFlbCBEdWJzb24nLFxyXG4gICAgc29mdHdhcmVEZXZlbG9wbWVudDogJ01pY2hhZWwgRHVic29uJyxcclxuICAgIHRlYW06ICcnLFxyXG4gICAgdGhhbmtzOiAnJ1xyXG4gIH1cclxufTtcclxuXHJcbnNpbUxhdW5jaGVyLmxhdW5jaCggKCkgPT4ge1xyXG4gIGNvbnN0IHNpbSA9IG5ldyBTaW0oIG9wdGljc0xhYlRpdGxlU3RyaW5nUHJvcGVydHksIFsgbmV3IE9wdGljc0xhYlNjcmVlbigpIF0sIHNpbU9wdGlvbnMgKTtcclxuICBzaW0uc3RhcnQoKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxHQUFHLE1BQU0sdUJBQXVCO0FBQ3ZDLE9BQU9DLFdBQVcsTUFBTSwrQkFBK0I7QUFDdkQsT0FBT0MsZUFBZSxNQUFNLGlDQUFpQztBQUM3RCxPQUFPQyxnQkFBZ0IsTUFBTSx1QkFBdUI7O0FBRXBEOztBQUVBLE1BQU1DLDRCQUE0QixHQUFHRCxnQkFBZ0IsQ0FBRSxZQUFZLENBQUUsQ0FBQ0UsbUJBQW1CO0FBRXpGLE1BQU1DLFVBQVUsR0FBRztFQUNqQkMsT0FBTyxFQUFFO0lBQ1A7SUFDQUMsVUFBVSxFQUFFLGdCQUFnQjtJQUM1QkMsbUJBQW1CLEVBQUUsZ0JBQWdCO0lBQ3JDQyxJQUFJLEVBQUUsRUFBRTtJQUNSQyxNQUFNLEVBQUU7RUFDVjtBQUNGLENBQUM7QUFFRFYsV0FBVyxDQUFDVyxNQUFNLENBQUUsTUFBTTtFQUN4QixNQUFNQyxHQUFHLEdBQUcsSUFBSWIsR0FBRyxDQUFFSSw0QkFBNEIsRUFBRSxDQUFFLElBQUlGLGVBQWUsQ0FBQyxDQUFDLENBQUUsRUFBRUksVUFBVyxDQUFDO0VBQzFGTyxHQUFHLENBQUNDLEtBQUssQ0FBQyxDQUFDO0FBQ2IsQ0FBRSxDQUFDIn0=