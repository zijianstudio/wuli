// Copyright 2013-2022, University of Colorado Boulder

/**
 * Main file for the Build an Atom simulation.
 */

import PreferencesModel from '../../joist/js/preferences/PreferencesModel.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import AtomScreen from './atom/AtomScreen.js';
import BuildAnAtomStrings from './BuildAnAtomStrings.js';
import BAAGlobalPreferences from './common/BAAGlobalPreferences.js';
import VisualPreferencesNode from './common/view/VisualPreferencesNode.js';
import GameScreen from './game/GameScreen.js';
import SymbolScreen from './symbol/SymbolScreen.js';
const buildAnAtomTitleStringProperty = BuildAnAtomStrings['build-an-atom'].titleStringProperty;

// root tandem
const tandem = Tandem.ROOT;
const simOptions = {
  credits: {
    leadDesign: 'Kelly Lancaster',
    softwareDevelopment: 'John Blanco, Aadish Gupta, Sam Reid',
    team: 'Jack Barbera, Suzanne Brahmia, Julia Chamberlain, Yuen-ying Carpenter, ' + 'Kelly Lancaster, Patricia Loeblein, Emily B. Moore, Robert Parson, ' + 'Ariel Paul, Kathy Perkins, Sharon Siman-Tov',
    qualityAssurance: 'Steele Dalton, Alex Dornan, Bryce Griebenow, Ethan Johnson, ' + 'Elise Morgan, Ben Roberts',
    thanks: 'Conversion of this simulation to HTML5 was funded by the Royal Society of Chemistry.'
  },
  preferencesModel: new PreferencesModel({
    visualOptions: {
      customPreferences: [{
        createContent: tandem => new VisualPreferencesNode(BAAGlobalPreferences.highContrastParticlesProperty, tandem.createTandem('simPreferences'))
      }]
    }
  })
};
simLauncher.launch(() => {
  const screens = [new AtomScreen(tandem.createTandem('atomScreen')), new SymbolScreen(tandem.createTandem('symbolScreen'))];

  // PhET-iO does not support the game screen (yet), see https://github.com/phetsims/build-an-atom/issues/156
  if (!Tandem.PHET_IO_ENABLED) {
    screens.push(new GameScreen(tandem.createTandem('gameScreen')));
  }
  new Sim(buildAnAtomTitleStringProperty, screens, simOptions).start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcmVmZXJlbmNlc01vZGVsIiwiU2ltIiwic2ltTGF1bmNoZXIiLCJUYW5kZW0iLCJBdG9tU2NyZWVuIiwiQnVpbGRBbkF0b21TdHJpbmdzIiwiQkFBR2xvYmFsUHJlZmVyZW5jZXMiLCJWaXN1YWxQcmVmZXJlbmNlc05vZGUiLCJHYW1lU2NyZWVuIiwiU3ltYm9sU2NyZWVuIiwiYnVpbGRBbkF0b21UaXRsZVN0cmluZ1Byb3BlcnR5IiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInRhbmRlbSIsIlJPT1QiLCJzaW1PcHRpb25zIiwiY3JlZGl0cyIsImxlYWREZXNpZ24iLCJzb2Z0d2FyZURldmVsb3BtZW50IiwidGVhbSIsInF1YWxpdHlBc3N1cmFuY2UiLCJ0aGFua3MiLCJwcmVmZXJlbmNlc01vZGVsIiwidmlzdWFsT3B0aW9ucyIsImN1c3RvbVByZWZlcmVuY2VzIiwiY3JlYXRlQ29udGVudCIsImhpZ2hDb250cmFzdFBhcnRpY2xlc1Byb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwibGF1bmNoIiwic2NyZWVucyIsIlBIRVRfSU9fRU5BQkxFRCIsInB1c2giLCJzdGFydCJdLCJzb3VyY2VzIjpbImJ1aWxkLWFuLWF0b20tbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYWluIGZpbGUgZm9yIHRoZSBCdWlsZCBhbiBBdG9tIHNpbXVsYXRpb24uXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByZWZlcmVuY2VzTW9kZWwgZnJvbSAnLi4vLi4vam9pc3QvanMvcHJlZmVyZW5jZXMvUHJlZmVyZW5jZXNNb2RlbC5qcyc7XHJcbmltcG9ydCBTaW0gZnJvbSAnLi4vLi4vam9pc3QvanMvU2ltLmpzJztcclxuaW1wb3J0IHNpbUxhdW5jaGVyIGZyb20gJy4uLy4uL2pvaXN0L2pzL3NpbUxhdW5jaGVyLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEF0b21TY3JlZW4gZnJvbSAnLi9hdG9tL0F0b21TY3JlZW4uanMnO1xyXG5pbXBvcnQgQnVpbGRBbkF0b21TdHJpbmdzIGZyb20gJy4vQnVpbGRBbkF0b21TdHJpbmdzLmpzJztcclxuaW1wb3J0IEJBQUdsb2JhbFByZWZlcmVuY2VzIGZyb20gJy4vY29tbW9uL0JBQUdsb2JhbFByZWZlcmVuY2VzLmpzJztcclxuaW1wb3J0IFZpc3VhbFByZWZlcmVuY2VzTm9kZSBmcm9tICcuL2NvbW1vbi92aWV3L1Zpc3VhbFByZWZlcmVuY2VzTm9kZS5qcyc7XHJcbmltcG9ydCBHYW1lU2NyZWVuIGZyb20gJy4vZ2FtZS9HYW1lU2NyZWVuLmpzJztcclxuaW1wb3J0IFN5bWJvbFNjcmVlbiBmcm9tICcuL3N5bWJvbC9TeW1ib2xTY3JlZW4uanMnO1xyXG5cclxuY29uc3QgYnVpbGRBbkF0b21UaXRsZVN0cmluZ1Byb3BlcnR5ID0gQnVpbGRBbkF0b21TdHJpbmdzWyAnYnVpbGQtYW4tYXRvbScgXS50aXRsZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxuLy8gcm9vdCB0YW5kZW1cclxuY29uc3QgdGFuZGVtID0gVGFuZGVtLlJPT1Q7XHJcblxyXG5jb25zdCBzaW1PcHRpb25zID0ge1xyXG4gIGNyZWRpdHM6IHtcclxuICAgIGxlYWREZXNpZ246ICdLZWxseSBMYW5jYXN0ZXInLFxyXG4gICAgc29mdHdhcmVEZXZlbG9wbWVudDogJ0pvaG4gQmxhbmNvLCBBYWRpc2ggR3VwdGEsIFNhbSBSZWlkJyxcclxuICAgIHRlYW06ICdKYWNrIEJhcmJlcmEsIFN1emFubmUgQnJhaG1pYSwgSnVsaWEgQ2hhbWJlcmxhaW4sIFl1ZW4teWluZyBDYXJwZW50ZXIsICcgK1xyXG4gICAgICAgICAgJ0tlbGx5IExhbmNhc3RlciwgUGF0cmljaWEgTG9lYmxlaW4sIEVtaWx5IEIuIE1vb3JlLCBSb2JlcnQgUGFyc29uLCAnICtcclxuICAgICAgICAgICdBcmllbCBQYXVsLCBLYXRoeSBQZXJraW5zLCBTaGFyb24gU2ltYW4tVG92JyxcclxuICAgIHF1YWxpdHlBc3N1cmFuY2U6ICdTdGVlbGUgRGFsdG9uLCBBbGV4IERvcm5hbiwgQnJ5Y2UgR3JpZWJlbm93LCBFdGhhbiBKb2huc29uLCAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICdFbGlzZSBNb3JnYW4sIEJlbiBSb2JlcnRzJyxcclxuICAgIHRoYW5rczogJ0NvbnZlcnNpb24gb2YgdGhpcyBzaW11bGF0aW9uIHRvIEhUTUw1IHdhcyBmdW5kZWQgYnkgdGhlIFJveWFsIFNvY2lldHkgb2YgQ2hlbWlzdHJ5LidcclxuICB9LFxyXG5cclxuICBwcmVmZXJlbmNlc01vZGVsOiBuZXcgUHJlZmVyZW5jZXNNb2RlbCgge1xyXG4gICAgdmlzdWFsT3B0aW9uczoge1xyXG4gICAgICBjdXN0b21QcmVmZXJlbmNlczogWyB7XHJcbiAgICAgICAgY3JlYXRlQ29udGVudDogdGFuZGVtID0+IG5ldyBWaXN1YWxQcmVmZXJlbmNlc05vZGUoIEJBQUdsb2JhbFByZWZlcmVuY2VzLmhpZ2hDb250cmFzdFBhcnRpY2xlc1Byb3BlcnR5LFxyXG4gICAgICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NpbVByZWZlcmVuY2VzJyApIClcclxuICAgICAgfSBdXHJcbiAgICB9XHJcbiAgfSApXHJcbn07XHJcblxyXG5zaW1MYXVuY2hlci5sYXVuY2goICgpID0+IHtcclxuICBjb25zdCBzY3JlZW5zID0gW1xyXG4gICAgbmV3IEF0b21TY3JlZW4oIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdhdG9tU2NyZWVuJyApICksXHJcbiAgICBuZXcgU3ltYm9sU2NyZWVuKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3ltYm9sU2NyZWVuJyApIClcclxuICBdO1xyXG5cclxuICAvLyBQaEVULWlPIGRvZXMgbm90IHN1cHBvcnQgdGhlIGdhbWUgc2NyZWVuICh5ZXQpLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2J1aWxkLWFuLWF0b20vaXNzdWVzLzE1NlxyXG4gIGlmICggIVRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgKSB7XHJcbiAgICBzY3JlZW5zLnB1c2goIG5ldyBHYW1lU2NyZWVuKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZ2FtZVNjcmVlbicgKSApICk7XHJcbiAgfVxyXG4gIG5ldyBTaW0oIGJ1aWxkQW5BdG9tVGl0bGVTdHJpbmdQcm9wZXJ0eSwgc2NyZWVucywgc2ltT3B0aW9ucyApLnN0YXJ0KCk7XHJcbn0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxnQkFBZ0IsTUFBTSxnREFBZ0Q7QUFDN0UsT0FBT0MsR0FBRyxNQUFNLHVCQUF1QjtBQUN2QyxPQUFPQyxXQUFXLE1BQU0sK0JBQStCO0FBQ3ZELE9BQU9DLE1BQU0sTUFBTSwyQkFBMkI7QUFDOUMsT0FBT0MsVUFBVSxNQUFNLHNCQUFzQjtBQUM3QyxPQUFPQyxrQkFBa0IsTUFBTSx5QkFBeUI7QUFDeEQsT0FBT0Msb0JBQW9CLE1BQU0sa0NBQWtDO0FBQ25FLE9BQU9DLHFCQUFxQixNQUFNLHdDQUF3QztBQUMxRSxPQUFPQyxVQUFVLE1BQU0sc0JBQXNCO0FBQzdDLE9BQU9DLFlBQVksTUFBTSwwQkFBMEI7QUFFbkQsTUFBTUMsOEJBQThCLEdBQUdMLGtCQUFrQixDQUFFLGVBQWUsQ0FBRSxDQUFDTSxtQkFBbUI7O0FBRWhHO0FBQ0EsTUFBTUMsTUFBTSxHQUFHVCxNQUFNLENBQUNVLElBQUk7QUFFMUIsTUFBTUMsVUFBVSxHQUFHO0VBQ2pCQyxPQUFPLEVBQUU7SUFDUEMsVUFBVSxFQUFFLGlCQUFpQjtJQUM3QkMsbUJBQW1CLEVBQUUscUNBQXFDO0lBQzFEQyxJQUFJLEVBQUUseUVBQXlFLEdBQ3pFLHFFQUFxRSxHQUNyRSw2Q0FBNkM7SUFDbkRDLGdCQUFnQixFQUFFLDhEQUE4RCxHQUM5RCwyQkFBMkI7SUFDN0NDLE1BQU0sRUFBRTtFQUNWLENBQUM7RUFFREMsZ0JBQWdCLEVBQUUsSUFBSXJCLGdCQUFnQixDQUFFO0lBQ3RDc0IsYUFBYSxFQUFFO01BQ2JDLGlCQUFpQixFQUFFLENBQUU7UUFDbkJDLGFBQWEsRUFBRVosTUFBTSxJQUFJLElBQUlMLHFCQUFxQixDQUFFRCxvQkFBb0IsQ0FBQ21CLDZCQUE2QixFQUNwR2IsTUFBTSxDQUFDYyxZQUFZLENBQUUsZ0JBQWlCLENBQUU7TUFDNUMsQ0FBQztJQUNIO0VBQ0YsQ0FBRTtBQUNKLENBQUM7QUFFRHhCLFdBQVcsQ0FBQ3lCLE1BQU0sQ0FBRSxNQUFNO0VBQ3hCLE1BQU1DLE9BQU8sR0FBRyxDQUNkLElBQUl4QixVQUFVLENBQUVRLE1BQU0sQ0FBQ2MsWUFBWSxDQUFFLFlBQWEsQ0FBRSxDQUFDLEVBQ3JELElBQUlqQixZQUFZLENBQUVHLE1BQU0sQ0FBQ2MsWUFBWSxDQUFFLGNBQWUsQ0FBRSxDQUFDLENBQzFEOztFQUVEO0VBQ0EsSUFBSyxDQUFDdkIsTUFBTSxDQUFDMEIsZUFBZSxFQUFHO0lBQzdCRCxPQUFPLENBQUNFLElBQUksQ0FBRSxJQUFJdEIsVUFBVSxDQUFFSSxNQUFNLENBQUNjLFlBQVksQ0FBRSxZQUFhLENBQUUsQ0FBRSxDQUFDO0VBQ3ZFO0VBQ0EsSUFBSXpCLEdBQUcsQ0FBRVMsOEJBQThCLEVBQUVrQixPQUFPLEVBQUVkLFVBQVcsQ0FBQyxDQUFDaUIsS0FBSyxDQUFDLENBQUM7QUFDeEUsQ0FBRSxDQUFDIn0=