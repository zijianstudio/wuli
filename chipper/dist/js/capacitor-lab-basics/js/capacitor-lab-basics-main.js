// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Emily Randall (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import CapacitanceScreen from './capacitance/CapacitanceScreen.js';
import CapacitorLabBasicsStrings from './CapacitorLabBasicsStrings.js';
import CLBLightBulbScreen from './light-bulb/CLBLightBulbScreen.js';
const capacitorLabBasicsTitleStringProperty = CapacitorLabBasicsStrings['capacitor-lab-basics'].titleStringProperty;

// constants
const tandem = Tandem.ROOT;
const simOptions = {
  credits: {
    leadDesign: 'Amy Rouinfar',
    softwareDevelopment: 'Andrew Adare, Jesse Greenberg, Chris Malley, Emily Randall, Jonathan Olson',
    team: 'Emily B. Moore, Ariel Paul, Kathy Perkins, Emily Randall',
    qualityAssurance: 'Steele Dalton, Amanda Davis, Kerrie Dochen, Bryce Griebenow, Ethan Johnson, Elise Morgan, Liam Mulhall, Oliver Orejola, Arnab Purkayastha, Ben Roberts, Clara Wilson, Bryan Yoelin'
  }
};
simLauncher.launch(() => {
  // Tracks whether a circuit switch has been changed by user. Once the switch has been changed in either screen,
  // the cue arrows (used to hint that the switch is available) should disappear from both screens.
  const switchUsedProperty = new Property(false);
  const screens = [new CapacitanceScreen(switchUsedProperty, tandem.createTandem('capacitanceScreen')), new CLBLightBulbScreen(switchUsedProperty, tandem.createTandem('lightBulbScreen'))];
  const sim = new Sim(capacitorLabBasicsTitleStringProperty, screens, simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNpbSIsInNpbUxhdW5jaGVyIiwiVGFuZGVtIiwiQ2FwYWNpdGFuY2VTY3JlZW4iLCJDYXBhY2l0b3JMYWJCYXNpY3NTdHJpbmdzIiwiQ0xCTGlnaHRCdWxiU2NyZWVuIiwiY2FwYWNpdG9yTGFiQmFzaWNzVGl0bGVTdHJpbmdQcm9wZXJ0eSIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJ0YW5kZW0iLCJST09UIiwic2ltT3B0aW9ucyIsImNyZWRpdHMiLCJsZWFkRGVzaWduIiwic29mdHdhcmVEZXZlbG9wbWVudCIsInRlYW0iLCJxdWFsaXR5QXNzdXJhbmNlIiwibGF1bmNoIiwic3dpdGNoVXNlZFByb3BlcnR5Iiwic2NyZWVucyIsImNyZWF0ZVRhbmRlbSIsInNpbSIsInN0YXJ0Il0sInNvdXJjZXMiOlsiY2FwYWNpdG9yLWxhYi1iYXNpY3MtbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYWluIGVudHJ5IHBvaW50IGZvciB0aGUgc2ltLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEVtaWx5IFJhbmRhbGwgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIEFuZHJldyBBZGFyZSAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTaW0gZnJvbSAnLi4vLi4vam9pc3QvanMvU2ltLmpzJztcclxuaW1wb3J0IHNpbUxhdW5jaGVyIGZyb20gJy4uLy4uL2pvaXN0L2pzL3NpbUxhdW5jaGVyLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IENhcGFjaXRhbmNlU2NyZWVuIGZyb20gJy4vY2FwYWNpdGFuY2UvQ2FwYWNpdGFuY2VTY3JlZW4uanMnO1xyXG5pbXBvcnQgQ2FwYWNpdG9yTGFiQmFzaWNzU3RyaW5ncyBmcm9tICcuL0NhcGFjaXRvckxhYkJhc2ljc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgQ0xCTGlnaHRCdWxiU2NyZWVuIGZyb20gJy4vbGlnaHQtYnVsYi9DTEJMaWdodEJ1bGJTY3JlZW4uanMnO1xyXG5cclxuY29uc3QgY2FwYWNpdG9yTGFiQmFzaWNzVGl0bGVTdHJpbmdQcm9wZXJ0eSA9IENhcGFjaXRvckxhYkJhc2ljc1N0cmluZ3NbICdjYXBhY2l0b3ItbGFiLWJhc2ljcycgXS50aXRsZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IHRhbmRlbSA9IFRhbmRlbS5ST09UO1xyXG5cclxuY29uc3Qgc2ltT3B0aW9ucyA9IHtcclxuICBjcmVkaXRzOiB7XHJcbiAgICBsZWFkRGVzaWduOiAnQW15IFJvdWluZmFyJyxcclxuICAgIHNvZnR3YXJlRGV2ZWxvcG1lbnQ6ICdBbmRyZXcgQWRhcmUsIEplc3NlIEdyZWVuYmVyZywgQ2hyaXMgTWFsbGV5LCBFbWlseSBSYW5kYWxsLCBKb25hdGhhbiBPbHNvbicsXHJcbiAgICB0ZWFtOiAnRW1pbHkgQi4gTW9vcmUsIEFyaWVsIFBhdWwsIEthdGh5IFBlcmtpbnMsIEVtaWx5IFJhbmRhbGwnLFxyXG4gICAgcXVhbGl0eUFzc3VyYW5jZTogJ1N0ZWVsZSBEYWx0b24sIEFtYW5kYSBEYXZpcywgS2VycmllIERvY2hlbiwgQnJ5Y2UgR3JpZWJlbm93LCBFdGhhbiBKb2huc29uLCBFbGlzZSBNb3JnYW4sIExpYW0gTXVsaGFsbCwgT2xpdmVyIE9yZWpvbGEsIEFybmFiIFB1cmtheWFzdGhhLCBCZW4gUm9iZXJ0cywgQ2xhcmEgV2lsc29uLCBCcnlhbiBZb2VsaW4nXHJcbiAgfVxyXG59O1xyXG5cclxuc2ltTGF1bmNoZXIubGF1bmNoKCAoKSA9PiB7XHJcblxyXG4gIC8vIFRyYWNrcyB3aGV0aGVyIGEgY2lyY3VpdCBzd2l0Y2ggaGFzIGJlZW4gY2hhbmdlZCBieSB1c2VyLiBPbmNlIHRoZSBzd2l0Y2ggaGFzIGJlZW4gY2hhbmdlZCBpbiBlaXRoZXIgc2NyZWVuLFxyXG4gIC8vIHRoZSBjdWUgYXJyb3dzICh1c2VkIHRvIGhpbnQgdGhhdCB0aGUgc3dpdGNoIGlzIGF2YWlsYWJsZSkgc2hvdWxkIGRpc2FwcGVhciBmcm9tIGJvdGggc2NyZWVucy5cclxuICBjb25zdCBzd2l0Y2hVc2VkUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gIGNvbnN0IHNjcmVlbnMgPSBbXHJcbiAgICBuZXcgQ2FwYWNpdGFuY2VTY3JlZW4oIHN3aXRjaFVzZWRQcm9wZXJ0eSwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NhcGFjaXRhbmNlU2NyZWVuJyApICksXHJcbiAgICBuZXcgQ0xCTGlnaHRCdWxiU2NyZWVuKCBzd2l0Y2hVc2VkUHJvcGVydHksIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsaWdodEJ1bGJTY3JlZW4nICkgKVxyXG4gIF07XHJcbiAgY29uc3Qgc2ltID0gbmV3IFNpbSggY2FwYWNpdG9yTGFiQmFzaWNzVGl0bGVTdHJpbmdQcm9wZXJ0eSwgc2NyZWVucywgc2ltT3B0aW9ucyApO1xyXG4gIHNpbS5zdGFydCgpO1xyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sMkJBQTJCO0FBQ2hELE9BQU9DLEdBQUcsTUFBTSx1QkFBdUI7QUFDdkMsT0FBT0MsV0FBVyxNQUFNLCtCQUErQjtBQUN2RCxPQUFPQyxNQUFNLE1BQU0sMkJBQTJCO0FBQzlDLE9BQU9DLGlCQUFpQixNQUFNLG9DQUFvQztBQUNsRSxPQUFPQyx5QkFBeUIsTUFBTSxnQ0FBZ0M7QUFDdEUsT0FBT0Msa0JBQWtCLE1BQU0sb0NBQW9DO0FBRW5FLE1BQU1DLHFDQUFxQyxHQUFHRix5QkFBeUIsQ0FBRSxzQkFBc0IsQ0FBRSxDQUFDRyxtQkFBbUI7O0FBRXJIO0FBQ0EsTUFBTUMsTUFBTSxHQUFHTixNQUFNLENBQUNPLElBQUk7QUFFMUIsTUFBTUMsVUFBVSxHQUFHO0VBQ2pCQyxPQUFPLEVBQUU7SUFDUEMsVUFBVSxFQUFFLGNBQWM7SUFDMUJDLG1CQUFtQixFQUFFLDRFQUE0RTtJQUNqR0MsSUFBSSxFQUFFLDBEQUEwRDtJQUNoRUMsZ0JBQWdCLEVBQUU7RUFDcEI7QUFDRixDQUFDO0FBRURkLFdBQVcsQ0FBQ2UsTUFBTSxDQUFFLE1BQU07RUFFeEI7RUFDQTtFQUNBLE1BQU1DLGtCQUFrQixHQUFHLElBQUlsQixRQUFRLENBQUUsS0FBTSxDQUFDO0VBRWhELE1BQU1tQixPQUFPLEdBQUcsQ0FDZCxJQUFJZixpQkFBaUIsQ0FBRWMsa0JBQWtCLEVBQUVULE1BQU0sQ0FBQ1csWUFBWSxDQUFFLG1CQUFvQixDQUFFLENBQUMsRUFDdkYsSUFBSWQsa0JBQWtCLENBQUVZLGtCQUFrQixFQUFFVCxNQUFNLENBQUNXLFlBQVksQ0FBRSxpQkFBa0IsQ0FBRSxDQUFDLENBQ3ZGO0VBQ0QsTUFBTUMsR0FBRyxHQUFHLElBQUlwQixHQUFHLENBQUVNLHFDQUFxQyxFQUFFWSxPQUFPLEVBQUVSLFVBQVcsQ0FBQztFQUNqRlUsR0FBRyxDQUFDQyxLQUFLLENBQUMsQ0FBQztBQUNiLENBQUUsQ0FBQyJ9