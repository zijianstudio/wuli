// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main entry point for the 'Plinko Probability' sim.
 *
 * @author Martin Veillette (Berea College)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import IntroScreen from './intro/IntroScreen.js';
import LabScreen from './lab/LabScreen.js';
import PlinkoProbabilityStrings from './PlinkoProbabilityStrings.js';
const plinkoProbabilityTitleStringProperty = PlinkoProbabilityStrings['plinko-probability'].titleStringProperty;
const simOptions = {
  credits: {
    leadDesign: 'Michael Dubson, Amanda McGarry',
    softwareDevelopment: 'Martin Veillette, Denzell Barnett, Chris Malley (PixelZoom, Inc.), Guillermo Ramos-Macias',
    team: 'Karina K. Hensberry, Trish Loeblein, Ariel Paul, Kathy Perkins',
    qualityAssurance: 'Steele Dalton, Amanda Davis, Alex Dornan, Bryce Griebenow, Ben Roberts'
  }
};
simLauncher.launch(() => {
  const sim = new Sim(plinkoProbabilityTitleStringProperty, [new IntroScreen(), new LabScreen()], simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIkludHJvU2NyZWVuIiwiTGFiU2NyZWVuIiwiUGxpbmtvUHJvYmFiaWxpdHlTdHJpbmdzIiwicGxpbmtvUHJvYmFiaWxpdHlUaXRsZVN0cmluZ1Byb3BlcnR5IiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInNpbU9wdGlvbnMiLCJjcmVkaXRzIiwibGVhZERlc2lnbiIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJ0ZWFtIiwicXVhbGl0eUFzc3VyYW5jZSIsImxhdW5jaCIsInNpbSIsInN0YXJ0Il0sInNvdXJjZXMiOlsicGxpbmtvLXByb2JhYmlsaXR5LW1haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlICdQbGlua28gUHJvYmFiaWxpdHknIHNpbS5cclxuICpcclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlIChCZXJlYSBDb2xsZWdlKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTaW0gZnJvbSAnLi4vLi4vam9pc3QvanMvU2ltLmpzJztcclxuaW1wb3J0IHNpbUxhdW5jaGVyIGZyb20gJy4uLy4uL2pvaXN0L2pzL3NpbUxhdW5jaGVyLmpzJztcclxuaW1wb3J0IEludHJvU2NyZWVuIGZyb20gJy4vaW50cm8vSW50cm9TY3JlZW4uanMnO1xyXG5pbXBvcnQgTGFiU2NyZWVuIGZyb20gJy4vbGFiL0xhYlNjcmVlbi5qcyc7XHJcbmltcG9ydCBQbGlua29Qcm9iYWJpbGl0eVN0cmluZ3MgZnJvbSAnLi9QbGlua29Qcm9iYWJpbGl0eVN0cmluZ3MuanMnO1xyXG5cclxuY29uc3QgcGxpbmtvUHJvYmFiaWxpdHlUaXRsZVN0cmluZ1Byb3BlcnR5ID0gUGxpbmtvUHJvYmFiaWxpdHlTdHJpbmdzWyAncGxpbmtvLXByb2JhYmlsaXR5JyBdLnRpdGxlU3RyaW5nUHJvcGVydHk7XHJcblxyXG5jb25zdCBzaW1PcHRpb25zID0ge1xyXG4gIGNyZWRpdHM6IHtcclxuICAgIGxlYWREZXNpZ246ICdNaWNoYWVsIER1YnNvbiwgQW1hbmRhIE1jR2FycnknLFxyXG4gICAgc29mdHdhcmVEZXZlbG9wbWVudDogJ01hcnRpbiBWZWlsbGV0dGUsIERlbnplbGwgQmFybmV0dCwgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pLCBHdWlsbGVybW8gUmFtb3MtTWFjaWFzJyxcclxuICAgIHRlYW06ICdLYXJpbmEgSy4gSGVuc2JlcnJ5LCBUcmlzaCBMb2VibGVpbiwgQXJpZWwgUGF1bCwgS2F0aHkgUGVya2lucycsXHJcbiAgICBxdWFsaXR5QXNzdXJhbmNlOiAnU3RlZWxlIERhbHRvbiwgQW1hbmRhIERhdmlzLCBBbGV4IERvcm5hbiwgQnJ5Y2UgR3JpZWJlbm93LCBCZW4gUm9iZXJ0cydcclxuICB9XHJcbn07XHJcblxyXG5zaW1MYXVuY2hlci5sYXVuY2goICgpID0+IHtcclxuICBjb25zdCBzaW0gPSBuZXcgU2ltKCBwbGlua29Qcm9iYWJpbGl0eVRpdGxlU3RyaW5nUHJvcGVydHksIFsgbmV3IEludHJvU2NyZWVuKCksIG5ldyBMYWJTY3JlZW4oKSBdLCBzaW1PcHRpb25zICk7XHJcbiAgc2ltLnN0YXJ0KCk7XHJcbn0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsR0FBRyxNQUFNLHVCQUF1QjtBQUN2QyxPQUFPQyxXQUFXLE1BQU0sK0JBQStCO0FBQ3ZELE9BQU9DLFdBQVcsTUFBTSx3QkFBd0I7QUFDaEQsT0FBT0MsU0FBUyxNQUFNLG9CQUFvQjtBQUMxQyxPQUFPQyx3QkFBd0IsTUFBTSwrQkFBK0I7QUFFcEUsTUFBTUMsb0NBQW9DLEdBQUdELHdCQUF3QixDQUFFLG9CQUFvQixDQUFFLENBQUNFLG1CQUFtQjtBQUVqSCxNQUFNQyxVQUFVLEdBQUc7RUFDakJDLE9BQU8sRUFBRTtJQUNQQyxVQUFVLEVBQUUsZ0NBQWdDO0lBQzVDQyxtQkFBbUIsRUFBRSwyRkFBMkY7SUFDaEhDLElBQUksRUFBRSxnRUFBZ0U7SUFDdEVDLGdCQUFnQixFQUFFO0VBQ3BCO0FBQ0YsQ0FBQztBQUVEWCxXQUFXLENBQUNZLE1BQU0sQ0FBRSxNQUFNO0VBQ3hCLE1BQU1DLEdBQUcsR0FBRyxJQUFJZCxHQUFHLENBQUVLLG9DQUFvQyxFQUFFLENBQUUsSUFBSUgsV0FBVyxDQUFDLENBQUMsRUFBRSxJQUFJQyxTQUFTLENBQUMsQ0FBQyxDQUFFLEVBQUVJLFVBQVcsQ0FBQztFQUMvR08sR0FBRyxDQUFDQyxLQUFLLENBQUMsQ0FBQztBQUNiLENBQUUsQ0FBQyJ9