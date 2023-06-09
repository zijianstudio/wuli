// Copyright 2013-2022, University of Colorado Boulder

/**
 * Main entry point for the 'Concentration' sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BLLSim from '../../beers-law-lab/js/common/view/BLLSim.js';
import ConcentrationScreen from '../../beers-law-lab/js/concentration/ConcentrationScreen.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import ConcentrationStrings from './ConcentrationStrings.js';
simLauncher.launch(() => {
  const screens = [new ConcentrationScreen(Tandem.ROOT.createTandem('concentrationScreen'))];
  const sim = new BLLSim(ConcentrationStrings.concentration.titleStringProperty, screens);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCTExTaW0iLCJDb25jZW50cmF0aW9uU2NyZWVuIiwic2ltTGF1bmNoZXIiLCJUYW5kZW0iLCJDb25jZW50cmF0aW9uU3RyaW5ncyIsImxhdW5jaCIsInNjcmVlbnMiLCJST09UIiwiY3JlYXRlVGFuZGVtIiwic2ltIiwiY29uY2VudHJhdGlvbiIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJzdGFydCJdLCJzb3VyY2VzIjpbImNvbmNlbnRyYXRpb24tbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYWluIGVudHJ5IHBvaW50IGZvciB0aGUgJ0NvbmNlbnRyYXRpb24nIHNpbS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgQkxMU2ltIGZyb20gJy4uLy4uL2JlZXJzLWxhdy1sYWIvanMvY29tbW9uL3ZpZXcvQkxMU2ltLmpzJztcclxuaW1wb3J0IENvbmNlbnRyYXRpb25TY3JlZW4gZnJvbSAnLi4vLi4vYmVlcnMtbGF3LWxhYi9qcy9jb25jZW50cmF0aW9uL0NvbmNlbnRyYXRpb25TY3JlZW4uanMnO1xyXG5pbXBvcnQgc2ltTGF1bmNoZXIgZnJvbSAnLi4vLi4vam9pc3QvanMvc2ltTGF1bmNoZXIuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgQ29uY2VudHJhdGlvblN0cmluZ3MgZnJvbSAnLi9Db25jZW50cmF0aW9uU3RyaW5ncy5qcyc7XHJcblxyXG5zaW1MYXVuY2hlci5sYXVuY2goICgpID0+IHtcclxuICBjb25zdCBzY3JlZW5zID0gW1xyXG4gICAgbmV3IENvbmNlbnRyYXRpb25TY3JlZW4oIFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggJ2NvbmNlbnRyYXRpb25TY3JlZW4nICkgKVxyXG4gIF07XHJcbiAgY29uc3Qgc2ltID0gbmV3IEJMTFNpbSggQ29uY2VudHJhdGlvblN0cmluZ3MuY29uY2VudHJhdGlvbi50aXRsZVN0cmluZ1Byb3BlcnR5LCBzY3JlZW5zICk7XHJcbiAgc2ltLnN0YXJ0KCk7XHJcbn0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsTUFBTSxNQUFNLDhDQUE4QztBQUNqRSxPQUFPQyxtQkFBbUIsTUFBTSw2REFBNkQ7QUFDN0YsT0FBT0MsV0FBVyxNQUFNLCtCQUErQjtBQUN2RCxPQUFPQyxNQUFNLE1BQU0sMkJBQTJCO0FBQzlDLE9BQU9DLG9CQUFvQixNQUFNLDJCQUEyQjtBQUU1REYsV0FBVyxDQUFDRyxNQUFNLENBQUUsTUFBTTtFQUN4QixNQUFNQyxPQUFPLEdBQUcsQ0FDZCxJQUFJTCxtQkFBbUIsQ0FBRUUsTUFBTSxDQUFDSSxJQUFJLENBQUNDLFlBQVksQ0FBRSxxQkFBc0IsQ0FBRSxDQUFDLENBQzdFO0VBQ0QsTUFBTUMsR0FBRyxHQUFHLElBQUlULE1BQU0sQ0FBRUksb0JBQW9CLENBQUNNLGFBQWEsQ0FBQ0MsbUJBQW1CLEVBQUVMLE9BQVEsQ0FBQztFQUN6RkcsR0FBRyxDQUFDRyxLQUFLLENBQUMsQ0FBQztBQUNiLENBQUUsQ0FBQyJ9