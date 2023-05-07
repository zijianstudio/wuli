// Copyright 2018-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ExploreScreen from '../../area-model-common/js/screens/ExploreScreen.js';
import GenericScreen from '../../area-model-common/js/screens/GenericScreen.js';
import VariablesGameScreen from '../../area-model-common/js/screens/VariablesGameScreen.js';
import VariablesScreen from '../../area-model-common/js/screens/VariablesScreen.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import AreaModelAlgebraStrings from './AreaModelAlgebraStrings.js';
const areaModelAlgebraTitleStringProperty = AreaModelAlgebraStrings['area-model-algebra'].titleStringProperty;
const simOptions = {
  credits: {
    leadDesign: 'Amy Hanson, Amanda McGarry',
    softwareDevelopment: 'Jonathan Olson',
    team: 'Karina Hensberry, Susan Miller, Ariel Paul, Kathy Perkins, Oliver Nix',
    qualityAssurance: 'Steele Dalton, Bryce Griebenow, Ethan Johnson, Liam Mulhall, Ben Roberts, Jacob Romero, Ethan Ward, Clara Wilson, Kathryn Woessner',
    graphicArts: 'Mariah Hermsmeyer, Amanda McGarry, Diana L\u00f3pez Tavares'
  }
};
simLauncher.launch(() => {
  const sim = new Sim(areaModelAlgebraTitleStringProperty, [new ExploreScreen(), new GenericScreen(), new VariablesScreen(), new VariablesGameScreen()], simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFeHBsb3JlU2NyZWVuIiwiR2VuZXJpY1NjcmVlbiIsIlZhcmlhYmxlc0dhbWVTY3JlZW4iLCJWYXJpYWJsZXNTY3JlZW4iLCJTaW0iLCJzaW1MYXVuY2hlciIsIkFyZWFNb2RlbEFsZ2VicmFTdHJpbmdzIiwiYXJlYU1vZGVsQWxnZWJyYVRpdGxlU3RyaW5nUHJvcGVydHkiLCJ0aXRsZVN0cmluZ1Byb3BlcnR5Iiwic2ltT3B0aW9ucyIsImNyZWRpdHMiLCJsZWFkRGVzaWduIiwic29mdHdhcmVEZXZlbG9wbWVudCIsInRlYW0iLCJxdWFsaXR5QXNzdXJhbmNlIiwiZ3JhcGhpY0FydHMiLCJsYXVuY2giLCJzaW0iLCJzdGFydCJdLCJzb3VyY2VzIjpbImFyZWEtbW9kZWwtYWxnZWJyYS1tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1haW4gZW50cnkgcG9pbnQgZm9yIHRoZSBzaW0uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgRXhwbG9yZVNjcmVlbiBmcm9tICcuLi8uLi9hcmVhLW1vZGVsLWNvbW1vbi9qcy9zY3JlZW5zL0V4cGxvcmVTY3JlZW4uanMnO1xyXG5pbXBvcnQgR2VuZXJpY1NjcmVlbiBmcm9tICcuLi8uLi9hcmVhLW1vZGVsLWNvbW1vbi9qcy9zY3JlZW5zL0dlbmVyaWNTY3JlZW4uanMnO1xyXG5pbXBvcnQgVmFyaWFibGVzR2FtZVNjcmVlbiBmcm9tICcuLi8uLi9hcmVhLW1vZGVsLWNvbW1vbi9qcy9zY3JlZW5zL1ZhcmlhYmxlc0dhbWVTY3JlZW4uanMnO1xyXG5pbXBvcnQgVmFyaWFibGVzU2NyZWVuIGZyb20gJy4uLy4uL2FyZWEtbW9kZWwtY29tbW9uL2pzL3NjcmVlbnMvVmFyaWFibGVzU2NyZWVuLmpzJztcclxuaW1wb3J0IFNpbSBmcm9tICcuLi8uLi9qb2lzdC9qcy9TaW0uanMnO1xyXG5pbXBvcnQgc2ltTGF1bmNoZXIgZnJvbSAnLi4vLi4vam9pc3QvanMvc2ltTGF1bmNoZXIuanMnO1xyXG5pbXBvcnQgQXJlYU1vZGVsQWxnZWJyYVN0cmluZ3MgZnJvbSAnLi9BcmVhTW9kZWxBbGdlYnJhU3RyaW5ncy5qcyc7XHJcblxyXG5jb25zdCBhcmVhTW9kZWxBbGdlYnJhVGl0bGVTdHJpbmdQcm9wZXJ0eSA9IEFyZWFNb2RlbEFsZ2VicmFTdHJpbmdzWyAnYXJlYS1tb2RlbC1hbGdlYnJhJyBdLnRpdGxlU3RyaW5nUHJvcGVydHk7XHJcblxyXG5jb25zdCBzaW1PcHRpb25zID0ge1xyXG4gIGNyZWRpdHM6IHtcclxuICAgIGxlYWREZXNpZ246ICdBbXkgSGFuc29uLCBBbWFuZGEgTWNHYXJyeScsXHJcbiAgICBzb2Z0d2FyZURldmVsb3BtZW50OiAnSm9uYXRoYW4gT2xzb24nLFxyXG4gICAgdGVhbTogJ0thcmluYSBIZW5zYmVycnksIFN1c2FuIE1pbGxlciwgQXJpZWwgUGF1bCwgS2F0aHkgUGVya2lucywgT2xpdmVyIE5peCcsXHJcbiAgICBxdWFsaXR5QXNzdXJhbmNlOiAnU3RlZWxlIERhbHRvbiwgQnJ5Y2UgR3JpZWJlbm93LCBFdGhhbiBKb2huc29uLCBMaWFtIE11bGhhbGwsIEJlbiBSb2JlcnRzLCBKYWNvYiBSb21lcm8sIEV0aGFuIFdhcmQsIENsYXJhIFdpbHNvbiwgS2F0aHJ5biBXb2Vzc25lcicsXHJcbiAgICBncmFwaGljQXJ0czogJ01hcmlhaCBIZXJtc21leWVyLCBBbWFuZGEgTWNHYXJyeSwgRGlhbmEgTFxcdTAwZjNwZXogVGF2YXJlcydcclxuICB9XHJcbn07XHJcblxyXG5zaW1MYXVuY2hlci5sYXVuY2goICgpID0+IHtcclxuICBjb25zdCBzaW0gPSBuZXcgU2ltKCBhcmVhTW9kZWxBbGdlYnJhVGl0bGVTdHJpbmdQcm9wZXJ0eSwgW1xyXG4gICAgbmV3IEV4cGxvcmVTY3JlZW4oKSxcclxuICAgIG5ldyBHZW5lcmljU2NyZWVuKCksXHJcbiAgICBuZXcgVmFyaWFibGVzU2NyZWVuKCksXHJcbiAgICBuZXcgVmFyaWFibGVzR2FtZVNjcmVlbigpXHJcbiAgXSwgc2ltT3B0aW9ucyApO1xyXG4gIHNpbS5zdGFydCgpO1xyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGFBQWEsTUFBTSxxREFBcUQ7QUFDL0UsT0FBT0MsYUFBYSxNQUFNLHFEQUFxRDtBQUMvRSxPQUFPQyxtQkFBbUIsTUFBTSwyREFBMkQ7QUFDM0YsT0FBT0MsZUFBZSxNQUFNLHVEQUF1RDtBQUNuRixPQUFPQyxHQUFHLE1BQU0sdUJBQXVCO0FBQ3ZDLE9BQU9DLFdBQVcsTUFBTSwrQkFBK0I7QUFDdkQsT0FBT0MsdUJBQXVCLE1BQU0sOEJBQThCO0FBRWxFLE1BQU1DLG1DQUFtQyxHQUFHRCx1QkFBdUIsQ0FBRSxvQkFBb0IsQ0FBRSxDQUFDRSxtQkFBbUI7QUFFL0csTUFBTUMsVUFBVSxHQUFHO0VBQ2pCQyxPQUFPLEVBQUU7SUFDUEMsVUFBVSxFQUFFLDRCQUE0QjtJQUN4Q0MsbUJBQW1CLEVBQUUsZ0JBQWdCO0lBQ3JDQyxJQUFJLEVBQUUsdUVBQXVFO0lBQzdFQyxnQkFBZ0IsRUFBRSxvSUFBb0k7SUFDdEpDLFdBQVcsRUFBRTtFQUNmO0FBQ0YsQ0FBQztBQUVEVixXQUFXLENBQUNXLE1BQU0sQ0FBRSxNQUFNO0VBQ3hCLE1BQU1DLEdBQUcsR0FBRyxJQUFJYixHQUFHLENBQUVHLG1DQUFtQyxFQUFFLENBQ3hELElBQUlQLGFBQWEsQ0FBQyxDQUFDLEVBQ25CLElBQUlDLGFBQWEsQ0FBQyxDQUFDLEVBQ25CLElBQUlFLGVBQWUsQ0FBQyxDQUFDLEVBQ3JCLElBQUlELG1CQUFtQixDQUFDLENBQUMsQ0FDMUIsRUFBRU8sVUFBVyxDQUFDO0VBQ2ZRLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDLENBQUM7QUFDYixDQUFFLENBQUMifQ==