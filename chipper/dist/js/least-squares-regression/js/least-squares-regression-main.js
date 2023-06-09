// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Martin Veillette (Berea College)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import LeastSquaresRegressionScreen from './least-squares-regression/LeastSquaresRegressionScreen.js';
import LeastSquaresRegressionStrings from './LeastSquaresRegressionStrings.js';
const leastSquaresRegressionTitleStringProperty = LeastSquaresRegressionStrings['least-squares-regression'].titleStringProperty;
const simOptions = {
  credits: {
    leadDesign: 'Amanda McGarry',
    softwareDevelopment: 'Martin Veillette',
    team: 'Trish Loeblein, Ariel Paul, Kathy Perkins',
    qualityAssurance: 'Steele Dalton, Bryan Yoelin'
  }
};
simLauncher.launch(() => {
  const sim = new Sim(leastSquaresRegressionTitleStringProperty, [new LeastSquaresRegressionScreen()], simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIkxlYXN0U3F1YXJlc1JlZ3Jlc3Npb25TY3JlZW4iLCJMZWFzdFNxdWFyZXNSZWdyZXNzaW9uU3RyaW5ncyIsImxlYXN0U3F1YXJlc1JlZ3Jlc3Npb25UaXRsZVN0cmluZ1Byb3BlcnR5IiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInNpbU9wdGlvbnMiLCJjcmVkaXRzIiwibGVhZERlc2lnbiIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJ0ZWFtIiwicXVhbGl0eUFzc3VyYW5jZSIsImxhdW5jaCIsInNpbSIsInN0YXJ0Il0sInNvdXJjZXMiOlsibGVhc3Qtc3F1YXJlcy1yZWdyZXNzaW9uLW1haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIHNpbS5cclxuICpcclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlIChCZXJlYSBDb2xsZWdlKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTaW0gZnJvbSAnLi4vLi4vam9pc3QvanMvU2ltLmpzJztcclxuaW1wb3J0IHNpbUxhdW5jaGVyIGZyb20gJy4uLy4uL2pvaXN0L2pzL3NpbUxhdW5jaGVyLmpzJztcclxuaW1wb3J0IExlYXN0U3F1YXJlc1JlZ3Jlc3Npb25TY3JlZW4gZnJvbSAnLi9sZWFzdC1zcXVhcmVzLXJlZ3Jlc3Npb24vTGVhc3RTcXVhcmVzUmVncmVzc2lvblNjcmVlbi5qcyc7XHJcbmltcG9ydCBMZWFzdFNxdWFyZXNSZWdyZXNzaW9uU3RyaW5ncyBmcm9tICcuL0xlYXN0U3F1YXJlc1JlZ3Jlc3Npb25TdHJpbmdzLmpzJztcclxuXHJcbmNvbnN0IGxlYXN0U3F1YXJlc1JlZ3Jlc3Npb25UaXRsZVN0cmluZ1Byb3BlcnR5ID0gTGVhc3RTcXVhcmVzUmVncmVzc2lvblN0cmluZ3NbICdsZWFzdC1zcXVhcmVzLXJlZ3Jlc3Npb24nIF0udGl0bGVTdHJpbmdQcm9wZXJ0eTtcclxuXHJcbmNvbnN0IHNpbU9wdGlvbnMgPSB7XHJcbiAgY3JlZGl0czoge1xyXG4gICAgbGVhZERlc2lnbjogJ0FtYW5kYSBNY0dhcnJ5JyxcclxuICAgIHNvZnR3YXJlRGV2ZWxvcG1lbnQ6ICdNYXJ0aW4gVmVpbGxldHRlJyxcclxuICAgIHRlYW06ICdUcmlzaCBMb2VibGVpbiwgQXJpZWwgUGF1bCwgS2F0aHkgUGVya2lucycsXHJcbiAgICBxdWFsaXR5QXNzdXJhbmNlOiAnU3RlZWxlIERhbHRvbiwgQnJ5YW4gWW9lbGluJ1xyXG4gIH1cclxufTtcclxuXHJcbnNpbUxhdW5jaGVyLmxhdW5jaCggKCkgPT4ge1xyXG4gIGNvbnN0IHNpbSA9IG5ldyBTaW0oIGxlYXN0U3F1YXJlc1JlZ3Jlc3Npb25UaXRsZVN0cmluZ1Byb3BlcnR5LCBbIG5ldyBMZWFzdFNxdWFyZXNSZWdyZXNzaW9uU2NyZWVuKCkgXSwgc2ltT3B0aW9ucyApO1xyXG4gIHNpbS5zdGFydCgpO1xyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEdBQUcsTUFBTSx1QkFBdUI7QUFDdkMsT0FBT0MsV0FBVyxNQUFNLCtCQUErQjtBQUN2RCxPQUFPQyw0QkFBNEIsTUFBTSw0REFBNEQ7QUFDckcsT0FBT0MsNkJBQTZCLE1BQU0sb0NBQW9DO0FBRTlFLE1BQU1DLHlDQUF5QyxHQUFHRCw2QkFBNkIsQ0FBRSwwQkFBMEIsQ0FBRSxDQUFDRSxtQkFBbUI7QUFFakksTUFBTUMsVUFBVSxHQUFHO0VBQ2pCQyxPQUFPLEVBQUU7SUFDUEMsVUFBVSxFQUFFLGdCQUFnQjtJQUM1QkMsbUJBQW1CLEVBQUUsa0JBQWtCO0lBQ3ZDQyxJQUFJLEVBQUUsMkNBQTJDO0lBQ2pEQyxnQkFBZ0IsRUFBRTtFQUNwQjtBQUNGLENBQUM7QUFFRFYsV0FBVyxDQUFDVyxNQUFNLENBQUUsTUFBTTtFQUN4QixNQUFNQyxHQUFHLEdBQUcsSUFBSWIsR0FBRyxDQUFFSSx5Q0FBeUMsRUFBRSxDQUFFLElBQUlGLDRCQUE0QixDQUFDLENBQUMsQ0FBRSxFQUFFSSxVQUFXLENBQUM7RUFDcEhPLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDLENBQUM7QUFDYixDQUFFLENBQUMifQ==