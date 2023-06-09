// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main entry point for the 'Area Builder' sim.
 *
 * @author John Blanco
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import AreaBuilderStrings from './AreaBuilderStrings.js';
import AreaBuilderExploreScreen from './explore/AreaBuilderExploreScreen.js';
import AreaBuilderGameScreen from './game/AreaBuilderGameScreen.js';
const areaBuilderTitleStringProperty = AreaBuilderStrings['area-builder'].titleStringProperty;

// constants
const tandem = Tandem.ROOT;
const simOptions = {
  credits: {
    leadDesign: 'Karina K. R. Hensberry',
    softwareDevelopment: 'John Blanco',
    team: 'Bryce Gruneich, Amanda McGarry, Ariel Paul, Kathy Perkins, Beth Stade',
    qualityAssurance: 'Steele Dalton, Amanda Davis, Oliver Nix, Oliver Orejola, Arnab Purkayastha, ' + 'Amy Rouinfar, Bryan Yoelin'
  }
};
simLauncher.launch(() => {
  // create and start the sim
  new Sim(areaBuilderTitleStringProperty, [new AreaBuilderExploreScreen(tandem.createTandem('exploreScreen')), new AreaBuilderGameScreen(tandem.createTandem('gameScreen'))], simOptions).start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIlRhbmRlbSIsIkFyZWFCdWlsZGVyU3RyaW5ncyIsIkFyZWFCdWlsZGVyRXhwbG9yZVNjcmVlbiIsIkFyZWFCdWlsZGVyR2FtZVNjcmVlbiIsImFyZWFCdWlsZGVyVGl0bGVTdHJpbmdQcm9wZXJ0eSIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJ0YW5kZW0iLCJST09UIiwic2ltT3B0aW9ucyIsImNyZWRpdHMiLCJsZWFkRGVzaWduIiwic29mdHdhcmVEZXZlbG9wbWVudCIsInRlYW0iLCJxdWFsaXR5QXNzdXJhbmNlIiwibGF1bmNoIiwiY3JlYXRlVGFuZGVtIiwic3RhcnQiXSwic291cmNlcyI6WyJhcmVhLWJ1aWxkZXItbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYWluIGVudHJ5IHBvaW50IGZvciB0aGUgJ0FyZWEgQnVpbGRlcicgc2ltLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IFNpbSBmcm9tICcuLi8uLi9qb2lzdC9qcy9TaW0uanMnO1xyXG5pbXBvcnQgc2ltTGF1bmNoZXIgZnJvbSAnLi4vLi4vam9pc3QvanMvc2ltTGF1bmNoZXIuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgQXJlYUJ1aWxkZXJTdHJpbmdzIGZyb20gJy4vQXJlYUJ1aWxkZXJTdHJpbmdzLmpzJztcclxuaW1wb3J0IEFyZWFCdWlsZGVyRXhwbG9yZVNjcmVlbiBmcm9tICcuL2V4cGxvcmUvQXJlYUJ1aWxkZXJFeHBsb3JlU2NyZWVuLmpzJztcclxuaW1wb3J0IEFyZWFCdWlsZGVyR2FtZVNjcmVlbiBmcm9tICcuL2dhbWUvQXJlYUJ1aWxkZXJHYW1lU2NyZWVuLmpzJztcclxuXHJcbmNvbnN0IGFyZWFCdWlsZGVyVGl0bGVTdHJpbmdQcm9wZXJ0eSA9IEFyZWFCdWlsZGVyU3RyaW5nc1sgJ2FyZWEtYnVpbGRlcicgXS50aXRsZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IHRhbmRlbSA9IFRhbmRlbS5ST09UO1xyXG5cclxuY29uc3Qgc2ltT3B0aW9ucyA9IHtcclxuICBjcmVkaXRzOiB7XHJcbiAgICBsZWFkRGVzaWduOiAnS2FyaW5hIEsuIFIuIEhlbnNiZXJyeScsXHJcbiAgICBzb2Z0d2FyZURldmVsb3BtZW50OiAnSm9obiBCbGFuY28nLFxyXG4gICAgdGVhbTogJ0JyeWNlIEdydW5laWNoLCBBbWFuZGEgTWNHYXJyeSwgQXJpZWwgUGF1bCwgS2F0aHkgUGVya2lucywgQmV0aCBTdGFkZScsXHJcbiAgICBxdWFsaXR5QXNzdXJhbmNlOiAnU3RlZWxlIERhbHRvbiwgQW1hbmRhIERhdmlzLCBPbGl2ZXIgTml4LCBPbGl2ZXIgT3Jlam9sYSwgQXJuYWIgUHVya2F5YXN0aGEsICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgJ0FteSBSb3VpbmZhciwgQnJ5YW4gWW9lbGluJ1xyXG4gIH1cclxufTtcclxuXHJcbnNpbUxhdW5jaGVyLmxhdW5jaCggKCkgPT4ge1xyXG4gIC8vIGNyZWF0ZSBhbmQgc3RhcnQgdGhlIHNpbVxyXG4gIG5ldyBTaW0oIGFyZWFCdWlsZGVyVGl0bGVTdHJpbmdQcm9wZXJ0eSwgW1xyXG4gICAgbmV3IEFyZWFCdWlsZGVyRXhwbG9yZVNjcmVlbiggdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2V4cGxvcmVTY3JlZW4nICkgKSxcclxuICAgIG5ldyBBcmVhQnVpbGRlckdhbWVTY3JlZW4oIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdnYW1lU2NyZWVuJyApIClcclxuICBdLCBzaW1PcHRpb25zICkuc3RhcnQoKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxHQUFHLE1BQU0sdUJBQXVCO0FBQ3ZDLE9BQU9DLFdBQVcsTUFBTSwrQkFBK0I7QUFDdkQsT0FBT0MsTUFBTSxNQUFNLDJCQUEyQjtBQUM5QyxPQUFPQyxrQkFBa0IsTUFBTSx5QkFBeUI7QUFDeEQsT0FBT0Msd0JBQXdCLE1BQU0sdUNBQXVDO0FBQzVFLE9BQU9DLHFCQUFxQixNQUFNLGlDQUFpQztBQUVuRSxNQUFNQyw4QkFBOEIsR0FBR0gsa0JBQWtCLENBQUUsY0FBYyxDQUFFLENBQUNJLG1CQUFtQjs7QUFFL0Y7QUFDQSxNQUFNQyxNQUFNLEdBQUdOLE1BQU0sQ0FBQ08sSUFBSTtBQUUxQixNQUFNQyxVQUFVLEdBQUc7RUFDakJDLE9BQU8sRUFBRTtJQUNQQyxVQUFVLEVBQUUsd0JBQXdCO0lBQ3BDQyxtQkFBbUIsRUFBRSxhQUFhO0lBQ2xDQyxJQUFJLEVBQUUsdUVBQXVFO0lBQzdFQyxnQkFBZ0IsRUFBRSw4RUFBOEUsR0FDOUU7RUFDcEI7QUFDRixDQUFDO0FBRURkLFdBQVcsQ0FBQ2UsTUFBTSxDQUFFLE1BQU07RUFDeEI7RUFDQSxJQUFJaEIsR0FBRyxDQUFFTSw4QkFBOEIsRUFBRSxDQUN2QyxJQUFJRix3QkFBd0IsQ0FBRUksTUFBTSxDQUFDUyxZQUFZLENBQUUsZUFBZ0IsQ0FBRSxDQUFDLEVBQ3RFLElBQUlaLHFCQUFxQixDQUFFRyxNQUFNLENBQUNTLFlBQVksQ0FBRSxZQUFhLENBQUUsQ0FBQyxDQUNqRSxFQUFFUCxVQUFXLENBQUMsQ0FBQ1EsS0FBSyxDQUFDLENBQUM7QUFDekIsQ0FBRSxDQUFDIn0=