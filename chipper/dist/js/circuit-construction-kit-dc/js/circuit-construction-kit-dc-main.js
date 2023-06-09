// Copyright 2016-2023, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import CCKCSimulationPreferencesContentNode from '../../circuit-construction-kit-common/js/view/CCKCSimulationPreferencesContentNode.js';
import PreferencesModel from '../../joist/js/preferences/PreferencesModel.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
// Image is required for making toDataURLNodeSynchronous work in the built version
import '../../scenery/js/nodes/Image.js';
import soundManager from '../../tambo/js/soundManager.js';
import Tandem from '../../tandem/js/Tandem.js';
import CircuitConstructionKitDcStrings from './CircuitConstructionKitDcStrings.js';
import IntroScreen from './intro/IntroScreen.js';
import LabScreen from './lab/LabScreen.js';
import CodapScreen from './codap/CodapScreen.js';
import CCKCQueryParameters from '../../circuit-construction-kit-common/js/CCKCQueryParameters.js';

// constants
const tandem = Tandem.ROOT;
const circuitConstructionKitDcTitleStringProperty = CircuitConstructionKitDcStrings['circuit-construction-kit-dc'].titleStringProperty;
simLauncher.launch(() => {
  const showCodapScreen = CCKCQueryParameters.codap;
  const screensToShow = showCodapScreen ? [new CodapScreen(tandem.createTandem('codapScreen'))] : [new IntroScreen(tandem.createTandem('introScreen')), new LabScreen(tandem.createTandem('labScreen'), {
    showNoncontactAmmeters: true
  })];

  // Launch the simulation once everything is ready
  const sim = new Sim(circuitConstructionKitDcTitleStringProperty, screensToShow, {
    preferencesModel: new PreferencesModel({
      simulationOptions: {
        customPreferences: [{
          createContent: tandem => new CCKCSimulationPreferencesContentNode(tandem.createTandem('simPreferences'))
        }]
      }
    }),
    credits: {
      leadDesign: 'Amy Rouinfar',
      softwareDevelopment: 'Sam Reid, Denzell Barnett, Matthew Blackman',
      team: 'Michael Dubson, Ariel Paul, Kathy Perkins, Wendy Adams, Carl Wieman',
      qualityAssurance: 'Jaspe Arias, Steele Dalton, Amanda Davis, Alex Dornan, Jaron Droder, Bryce Griebenow, Clifford Hardin, Ethan Johnson, Megan Lai, Brooklyn Lash, Emily Miller, Matthew Moore, Liam Mulhall, Devon Quispe, Ben Roberts, Jacob Romero, Nancy Salpepi, Ethan Ward, Kathryn Woessner',
      graphicArts: 'Bryce Gruneich, Mariah Hermsmeyer, Cheryl McCutchan'
    },
    phetioDesigned: true
  });
  sim.start();

  // Disable sounds for joist/home screen/navigation bar/carousel, but leave sound for the dog bark
  soundManager.setOutputLevelForCategory('user-interface', 0);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDQ0tDU2ltdWxhdGlvblByZWZlcmVuY2VzQ29udGVudE5vZGUiLCJQcmVmZXJlbmNlc01vZGVsIiwiU2ltIiwic2ltTGF1bmNoZXIiLCJzb3VuZE1hbmFnZXIiLCJUYW5kZW0iLCJDaXJjdWl0Q29uc3RydWN0aW9uS2l0RGNTdHJpbmdzIiwiSW50cm9TY3JlZW4iLCJMYWJTY3JlZW4iLCJDb2RhcFNjcmVlbiIsIkNDS0NRdWVyeVBhcmFtZXRlcnMiLCJ0YW5kZW0iLCJST09UIiwiY2lyY3VpdENvbnN0cnVjdGlvbktpdERjVGl0bGVTdHJpbmdQcm9wZXJ0eSIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJsYXVuY2giLCJzaG93Q29kYXBTY3JlZW4iLCJjb2RhcCIsInNjcmVlbnNUb1Nob3ciLCJjcmVhdGVUYW5kZW0iLCJzaG93Tm9uY29udGFjdEFtbWV0ZXJzIiwic2ltIiwicHJlZmVyZW5jZXNNb2RlbCIsInNpbXVsYXRpb25PcHRpb25zIiwiY3VzdG9tUHJlZmVyZW5jZXMiLCJjcmVhdGVDb250ZW50IiwiY3JlZGl0cyIsImxlYWREZXNpZ24iLCJzb2Z0d2FyZURldmVsb3BtZW50IiwidGVhbSIsInF1YWxpdHlBc3N1cmFuY2UiLCJncmFwaGljQXJ0cyIsInBoZXRpb0Rlc2lnbmVkIiwic3RhcnQiLCJzZXRPdXRwdXRMZXZlbEZvckNhdGVnb3J5Il0sInNvdXJjZXMiOlsiY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWRjLW1haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIHNpbS5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQ0NLQ1NpbXVsYXRpb25QcmVmZXJlbmNlc0NvbnRlbnROb2RlIGZyb20gJy4uLy4uL2NpcmN1aXQtY29uc3RydWN0aW9uLWtpdC1jb21tb24vanMvdmlldy9DQ0tDU2ltdWxhdGlvblByZWZlcmVuY2VzQ29udGVudE5vZGUuanMnO1xyXG5pbXBvcnQgUHJlZmVyZW5jZXNNb2RlbCBmcm9tICcuLi8uLi9qb2lzdC9qcy9wcmVmZXJlbmNlcy9QcmVmZXJlbmNlc01vZGVsLmpzJztcclxuaW1wb3J0IFNpbSBmcm9tICcuLi8uLi9qb2lzdC9qcy9TaW0uanMnO1xyXG5pbXBvcnQgc2ltTGF1bmNoZXIgZnJvbSAnLi4vLi4vam9pc3QvanMvc2ltTGF1bmNoZXIuanMnO1xyXG4vLyBJbWFnZSBpcyByZXF1aXJlZCBmb3IgbWFraW5nIHRvRGF0YVVSTE5vZGVTeW5jaHJvbm91cyB3b3JrIGluIHRoZSBidWlsdCB2ZXJzaW9uXHJcbmltcG9ydCAnLi4vLi4vc2NlbmVyeS9qcy9ub2Rlcy9JbWFnZS5qcyc7XHJcbmltcG9ydCBzb3VuZE1hbmFnZXIgZnJvbSAnLi4vLi4vdGFtYm8vanMvc291bmRNYW5hZ2VyLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IENpcmN1aXRDb25zdHJ1Y3Rpb25LaXREY1N0cmluZ3MgZnJvbSAnLi9DaXJjdWl0Q29uc3RydWN0aW9uS2l0RGNTdHJpbmdzLmpzJztcclxuaW1wb3J0IEludHJvU2NyZWVuIGZyb20gJy4vaW50cm8vSW50cm9TY3JlZW4uanMnO1xyXG5pbXBvcnQgTGFiU2NyZWVuIGZyb20gJy4vbGFiL0xhYlNjcmVlbi5qcyc7XHJcbmltcG9ydCBDb2RhcFNjcmVlbiBmcm9tICcuL2NvZGFwL0NvZGFwU2NyZWVuLmpzJztcclxuaW1wb3J0IENDS0NRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vLi4vY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWNvbW1vbi9qcy9DQ0tDUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCB0YW5kZW0gPSBUYW5kZW0uUk9PVDtcclxuXHJcbmNvbnN0IGNpcmN1aXRDb25zdHJ1Y3Rpb25LaXREY1RpdGxlU3RyaW5nUHJvcGVydHkgPSBDaXJjdWl0Q29uc3RydWN0aW9uS2l0RGNTdHJpbmdzWyAnY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWRjJyBdLnRpdGxlU3RyaW5nUHJvcGVydHk7XHJcblxyXG5zaW1MYXVuY2hlci5sYXVuY2goICgpID0+IHtcclxuXHJcbiAgY29uc3Qgc2hvd0NvZGFwU2NyZWVuID0gQ0NLQ1F1ZXJ5UGFyYW1ldGVycy5jb2RhcDtcclxuXHJcbiAgY29uc3Qgc2NyZWVuc1RvU2hvdyA9IHNob3dDb2RhcFNjcmVlbiA/IFsgbmV3IENvZGFwU2NyZWVuKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY29kYXBTY3JlZW4nICkgKSBdIDogW1xyXG4gICAgbmV3IEludHJvU2NyZWVuKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaW50cm9TY3JlZW4nICkgKSxcclxuICAgIG5ldyBMYWJTY3JlZW4oIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsYWJTY3JlZW4nICksIHtcclxuICAgICAgc2hvd05vbmNvbnRhY3RBbW1ldGVyczogdHJ1ZVxyXG4gICAgfSApXHJcbiAgXTtcclxuXHJcbiAgLy8gTGF1bmNoIHRoZSBzaW11bGF0aW9uIG9uY2UgZXZlcnl0aGluZyBpcyByZWFkeVxyXG4gIGNvbnN0IHNpbSA9IG5ldyBTaW0oIGNpcmN1aXRDb25zdHJ1Y3Rpb25LaXREY1RpdGxlU3RyaW5nUHJvcGVydHksIHNjcmVlbnNUb1Nob3csIHtcclxuICAgIHByZWZlcmVuY2VzTW9kZWw6IG5ldyBQcmVmZXJlbmNlc01vZGVsKCB7XHJcbiAgICAgIHNpbXVsYXRpb25PcHRpb25zOiB7XHJcbiAgICAgICAgY3VzdG9tUHJlZmVyZW5jZXM6IFsge1xyXG4gICAgICAgICAgY3JlYXRlQ29udGVudDogdGFuZGVtID0+IG5ldyBDQ0tDU2ltdWxhdGlvblByZWZlcmVuY2VzQ29udGVudE5vZGUoIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaW1QcmVmZXJlbmNlcycgKSApXHJcbiAgICAgICAgfSBdXHJcbiAgICAgIH1cclxuICAgIH0gKSxcclxuICAgIGNyZWRpdHM6IHtcclxuICAgICAgbGVhZERlc2lnbjogJ0FteSBSb3VpbmZhcicsXHJcbiAgICAgIHNvZnR3YXJlRGV2ZWxvcG1lbnQ6ICdTYW0gUmVpZCwgRGVuemVsbCBCYXJuZXR0LCBNYXR0aGV3IEJsYWNrbWFuJyxcclxuICAgICAgdGVhbTogJ01pY2hhZWwgRHVic29uLCBBcmllbCBQYXVsLCBLYXRoeSBQZXJraW5zLCBXZW5keSBBZGFtcywgQ2FybCBXaWVtYW4nLFxyXG4gICAgICBxdWFsaXR5QXNzdXJhbmNlOiAnSmFzcGUgQXJpYXMsIFN0ZWVsZSBEYWx0b24sIEFtYW5kYSBEYXZpcywgQWxleCBEb3JuYW4sIEphcm9uIERyb2RlciwgQnJ5Y2UgR3JpZWJlbm93LCBDbGlmZm9yZCBIYXJkaW4sIEV0aGFuIEpvaG5zb24sIE1lZ2FuIExhaSwgQnJvb2tseW4gTGFzaCwgRW1pbHkgTWlsbGVyLCBNYXR0aGV3IE1vb3JlLCBMaWFtIE11bGhhbGwsIERldm9uIFF1aXNwZSwgQmVuIFJvYmVydHMsIEphY29iIFJvbWVybywgTmFuY3kgU2FscGVwaSwgRXRoYW4gV2FyZCwgS2F0aHJ5biBXb2Vzc25lcicsXHJcbiAgICAgIGdyYXBoaWNBcnRzOiAnQnJ5Y2UgR3J1bmVpY2gsIE1hcmlhaCBIZXJtc21leWVyLCBDaGVyeWwgTWNDdXRjaGFuJ1xyXG4gICAgfSxcclxuICAgIHBoZXRpb0Rlc2lnbmVkOiB0cnVlXHJcbiAgfSApO1xyXG4gIHNpbS5zdGFydCgpO1xyXG5cclxuICAvLyBEaXNhYmxlIHNvdW5kcyBmb3Igam9pc3QvaG9tZSBzY3JlZW4vbmF2aWdhdGlvbiBiYXIvY2Fyb3VzZWwsIGJ1dCBsZWF2ZSBzb3VuZCBmb3IgdGhlIGRvZyBiYXJrXHJcbiAgc291bmRNYW5hZ2VyLnNldE91dHB1dExldmVsRm9yQ2F0ZWdvcnkoICd1c2VyLWludGVyZmFjZScsIDAgKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxvQ0FBb0MsTUFBTSx1RkFBdUY7QUFDeEksT0FBT0MsZ0JBQWdCLE1BQU0sZ0RBQWdEO0FBQzdFLE9BQU9DLEdBQUcsTUFBTSx1QkFBdUI7QUFDdkMsT0FBT0MsV0FBVyxNQUFNLCtCQUErQjtBQUN2RDtBQUNBLE9BQU8saUNBQWlDO0FBQ3hDLE9BQU9DLFlBQVksTUFBTSxnQ0FBZ0M7QUFDekQsT0FBT0MsTUFBTSxNQUFNLDJCQUEyQjtBQUM5QyxPQUFPQywrQkFBK0IsTUFBTSxzQ0FBc0M7QUFDbEYsT0FBT0MsV0FBVyxNQUFNLHdCQUF3QjtBQUNoRCxPQUFPQyxTQUFTLE1BQU0sb0JBQW9CO0FBQzFDLE9BQU9DLFdBQVcsTUFBTSx3QkFBd0I7QUFDaEQsT0FBT0MsbUJBQW1CLE1BQU0saUVBQWlFOztBQUVqRztBQUNBLE1BQU1DLE1BQU0sR0FBR04sTUFBTSxDQUFDTyxJQUFJO0FBRTFCLE1BQU1DLDJDQUEyQyxHQUFHUCwrQkFBK0IsQ0FBRSw2QkFBNkIsQ0FBRSxDQUFDUSxtQkFBbUI7QUFFeElYLFdBQVcsQ0FBQ1ksTUFBTSxDQUFFLE1BQU07RUFFeEIsTUFBTUMsZUFBZSxHQUFHTixtQkFBbUIsQ0FBQ08sS0FBSztFQUVqRCxNQUFNQyxhQUFhLEdBQUdGLGVBQWUsR0FBRyxDQUFFLElBQUlQLFdBQVcsQ0FBRUUsTUFBTSxDQUFDUSxZQUFZLENBQUUsYUFBYyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQ3BHLElBQUlaLFdBQVcsQ0FBRUksTUFBTSxDQUFDUSxZQUFZLENBQUUsYUFBYyxDQUFFLENBQUMsRUFDdkQsSUFBSVgsU0FBUyxDQUFFRyxNQUFNLENBQUNRLFlBQVksQ0FBRSxXQUFZLENBQUMsRUFBRTtJQUNqREMsc0JBQXNCLEVBQUU7RUFDMUIsQ0FBRSxDQUFDLENBQ0o7O0VBRUQ7RUFDQSxNQUFNQyxHQUFHLEdBQUcsSUFBSW5CLEdBQUcsQ0FBRVcsMkNBQTJDLEVBQUVLLGFBQWEsRUFBRTtJQUMvRUksZ0JBQWdCLEVBQUUsSUFBSXJCLGdCQUFnQixDQUFFO01BQ3RDc0IsaUJBQWlCLEVBQUU7UUFDakJDLGlCQUFpQixFQUFFLENBQUU7VUFDbkJDLGFBQWEsRUFBRWQsTUFBTSxJQUFJLElBQUlYLG9DQUFvQyxDQUFFVyxNQUFNLENBQUNRLFlBQVksQ0FBRSxnQkFBaUIsQ0FBRTtRQUM3RyxDQUFDO01BQ0g7SUFDRixDQUFFLENBQUM7SUFDSE8sT0FBTyxFQUFFO01BQ1BDLFVBQVUsRUFBRSxjQUFjO01BQzFCQyxtQkFBbUIsRUFBRSw2Q0FBNkM7TUFDbEVDLElBQUksRUFBRSxxRUFBcUU7TUFDM0VDLGdCQUFnQixFQUFFLGlSQUFpUjtNQUNuU0MsV0FBVyxFQUFFO0lBQ2YsQ0FBQztJQUNEQyxjQUFjLEVBQUU7RUFDbEIsQ0FBRSxDQUFDO0VBQ0hYLEdBQUcsQ0FBQ1ksS0FBSyxDQUFDLENBQUM7O0VBRVg7RUFDQTdCLFlBQVksQ0FBQzhCLHlCQUF5QixDQUFFLGdCQUFnQixFQUFFLENBQUUsQ0FBQztBQUMvRCxDQUFFLENBQUMifQ==