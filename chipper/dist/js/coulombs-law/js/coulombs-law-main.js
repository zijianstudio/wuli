// Copyright 2017-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Michael Barlow (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import PreferencesModel from '../../joist/js/preferences/PreferencesModel.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import CoulombsLawAtomicScreen from './atomic/CoulombsLawAtomicScreen.js';
import CoulombsLawStrings from './CoulombsLawStrings.js';
import CoulombsLawMacroScreen from './macro/CoulombsLawMacroScreen.js';
const coulombsLawTitleStringProperty = CoulombsLawStrings['coulombs-law'].titleStringProperty;
const tandem = Tandem.ROOT;
const simOptions = {
  credits: {
    leadDesign: 'Amy Rouinfar',
    softwareDevelopment: 'Jesse Greenberg, Michael Barlow',
    team: 'Amy Hanson, Ariel Paul, Kathy Perkins',
    qualityAssurance: 'Steele Dalton, Liam Mulhall, Laura Rea, Jacob Romero, Kathryn Woessner, Kelly Wurtz',
    graphicArts: 'Mariah Hermsmeyer, Cheryl McCutchan',
    thanks: ''
  },
  preferencesModel: new PreferencesModel({
    visualOptions: {
      supportsProjectorMode: true
    }
  })
};
simLauncher.launch(() => {
  const screens = [new CoulombsLawMacroScreen(tandem.createTandem('macroScreen')), new CoulombsLawAtomicScreen(tandem.createTandem('atomicScreen'))];
  const sim = new Sim(coulombsLawTitleStringProperty, screens, simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcmVmZXJlbmNlc01vZGVsIiwiU2ltIiwic2ltTGF1bmNoZXIiLCJUYW5kZW0iLCJDb3Vsb21ic0xhd0F0b21pY1NjcmVlbiIsIkNvdWxvbWJzTGF3U3RyaW5ncyIsIkNvdWxvbWJzTGF3TWFjcm9TY3JlZW4iLCJjb3Vsb21ic0xhd1RpdGxlU3RyaW5nUHJvcGVydHkiLCJ0aXRsZVN0cmluZ1Byb3BlcnR5IiwidGFuZGVtIiwiUk9PVCIsInNpbU9wdGlvbnMiLCJjcmVkaXRzIiwibGVhZERlc2lnbiIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJ0ZWFtIiwicXVhbGl0eUFzc3VyYW5jZSIsImdyYXBoaWNBcnRzIiwidGhhbmtzIiwicHJlZmVyZW5jZXNNb2RlbCIsInZpc3VhbE9wdGlvbnMiLCJzdXBwb3J0c1Byb2plY3Rvck1vZGUiLCJsYXVuY2giLCJzY3JlZW5zIiwiY3JlYXRlVGFuZGVtIiwic2ltIiwic3RhcnQiXSwic291cmNlcyI6WyJjb3Vsb21icy1sYXctbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYWluIGVudHJ5IHBvaW50IGZvciB0aGUgc2ltLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgQmFybG93IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUHJlZmVyZW5jZXNNb2RlbCBmcm9tICcuLi8uLi9qb2lzdC9qcy9wcmVmZXJlbmNlcy9QcmVmZXJlbmNlc01vZGVsLmpzJztcclxuaW1wb3J0IFNpbSBmcm9tICcuLi8uLi9qb2lzdC9qcy9TaW0uanMnO1xyXG5pbXBvcnQgc2ltTGF1bmNoZXIgZnJvbSAnLi4vLi4vam9pc3QvanMvc2ltTGF1bmNoZXIuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgQ291bG9tYnNMYXdBdG9taWNTY3JlZW4gZnJvbSAnLi9hdG9taWMvQ291bG9tYnNMYXdBdG9taWNTY3JlZW4uanMnO1xyXG5pbXBvcnQgQ291bG9tYnNMYXdTdHJpbmdzIGZyb20gJy4vQ291bG9tYnNMYXdTdHJpbmdzLmpzJztcclxuaW1wb3J0IENvdWxvbWJzTGF3TWFjcm9TY3JlZW4gZnJvbSAnLi9tYWNyby9Db3Vsb21ic0xhd01hY3JvU2NyZWVuLmpzJztcclxuXHJcbmNvbnN0IGNvdWxvbWJzTGF3VGl0bGVTdHJpbmdQcm9wZXJ0eSA9IENvdWxvbWJzTGF3U3RyaW5nc1sgJ2NvdWxvbWJzLWxhdycgXS50aXRsZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxuY29uc3QgdGFuZGVtID0gVGFuZGVtLlJPT1Q7XHJcblxyXG5jb25zdCBzaW1PcHRpb25zID0ge1xyXG4gIGNyZWRpdHM6IHtcclxuICAgIGxlYWREZXNpZ246ICdBbXkgUm91aW5mYXInLFxyXG4gICAgc29mdHdhcmVEZXZlbG9wbWVudDogJ0plc3NlIEdyZWVuYmVyZywgTWljaGFlbCBCYXJsb3cnLFxyXG4gICAgdGVhbTogJ0FteSBIYW5zb24sIEFyaWVsIFBhdWwsIEthdGh5IFBlcmtpbnMnLFxyXG4gICAgcXVhbGl0eUFzc3VyYW5jZTogJ1N0ZWVsZSBEYWx0b24sIExpYW0gTXVsaGFsbCwgTGF1cmEgUmVhLCBKYWNvYiBSb21lcm8sIEthdGhyeW4gV29lc3NuZXIsIEtlbGx5IFd1cnR6JyxcclxuICAgIGdyYXBoaWNBcnRzOiAnTWFyaWFoIEhlcm1zbWV5ZXIsIENoZXJ5bCBNY0N1dGNoYW4nLFxyXG4gICAgdGhhbmtzOiAnJ1xyXG4gIH0sXHJcblxyXG4gIHByZWZlcmVuY2VzTW9kZWw6IG5ldyBQcmVmZXJlbmNlc01vZGVsKCB7XHJcbiAgICB2aXN1YWxPcHRpb25zOiB7XHJcbiAgICAgIHN1cHBvcnRzUHJvamVjdG9yTW9kZTogdHJ1ZVxyXG4gICAgfVxyXG4gIH0gKVxyXG59O1xyXG5cclxuc2ltTGF1bmNoZXIubGF1bmNoKCAoKSA9PiB7XHJcbiAgY29uc3Qgc2NyZWVucyA9IFtcclxuICAgIG5ldyBDb3Vsb21ic0xhd01hY3JvU2NyZWVuKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWFjcm9TY3JlZW4nICkgKSxcclxuICAgIG5ldyBDb3Vsb21ic0xhd0F0b21pY1NjcmVlbiggdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2F0b21pY1NjcmVlbicgKSApXHJcbiAgXTtcclxuICBjb25zdCBzaW0gPSBuZXcgU2ltKCBjb3Vsb21ic0xhd1RpdGxlU3RyaW5nUHJvcGVydHksIHNjcmVlbnMsIHNpbU9wdGlvbnMgKTtcclxuICBzaW0uc3RhcnQoKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGdCQUFnQixNQUFNLGdEQUFnRDtBQUM3RSxPQUFPQyxHQUFHLE1BQU0sdUJBQXVCO0FBQ3ZDLE9BQU9DLFdBQVcsTUFBTSwrQkFBK0I7QUFDdkQsT0FBT0MsTUFBTSxNQUFNLDJCQUEyQjtBQUM5QyxPQUFPQyx1QkFBdUIsTUFBTSxxQ0FBcUM7QUFDekUsT0FBT0Msa0JBQWtCLE1BQU0seUJBQXlCO0FBQ3hELE9BQU9DLHNCQUFzQixNQUFNLG1DQUFtQztBQUV0RSxNQUFNQyw4QkFBOEIsR0FBR0Ysa0JBQWtCLENBQUUsY0FBYyxDQUFFLENBQUNHLG1CQUFtQjtBQUUvRixNQUFNQyxNQUFNLEdBQUdOLE1BQU0sQ0FBQ08sSUFBSTtBQUUxQixNQUFNQyxVQUFVLEdBQUc7RUFDakJDLE9BQU8sRUFBRTtJQUNQQyxVQUFVLEVBQUUsY0FBYztJQUMxQkMsbUJBQW1CLEVBQUUsaUNBQWlDO0lBQ3REQyxJQUFJLEVBQUUsdUNBQXVDO0lBQzdDQyxnQkFBZ0IsRUFBRSxxRkFBcUY7SUFDdkdDLFdBQVcsRUFBRSxxQ0FBcUM7SUFDbERDLE1BQU0sRUFBRTtFQUNWLENBQUM7RUFFREMsZ0JBQWdCLEVBQUUsSUFBSW5CLGdCQUFnQixDQUFFO0lBQ3RDb0IsYUFBYSxFQUFFO01BQ2JDLHFCQUFxQixFQUFFO0lBQ3pCO0VBQ0YsQ0FBRTtBQUNKLENBQUM7QUFFRG5CLFdBQVcsQ0FBQ29CLE1BQU0sQ0FBRSxNQUFNO0VBQ3hCLE1BQU1DLE9BQU8sR0FBRyxDQUNkLElBQUlqQixzQkFBc0IsQ0FBRUcsTUFBTSxDQUFDZSxZQUFZLENBQUUsYUFBYyxDQUFFLENBQUMsRUFDbEUsSUFBSXBCLHVCQUF1QixDQUFFSyxNQUFNLENBQUNlLFlBQVksQ0FBRSxjQUFlLENBQUUsQ0FBQyxDQUNyRTtFQUNELE1BQU1DLEdBQUcsR0FBRyxJQUFJeEIsR0FBRyxDQUFFTSw4QkFBOEIsRUFBRWdCLE9BQU8sRUFBRVosVUFBVyxDQUFDO0VBQzFFYyxHQUFHLENBQUNDLEtBQUssQ0FBQyxDQUFDO0FBQ2IsQ0FBRSxDQUFDIn0=