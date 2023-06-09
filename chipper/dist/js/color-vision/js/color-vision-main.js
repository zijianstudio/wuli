// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import ColorVisionStrings from './ColorVisionStrings.js';
import RGBScreen from './rgb/RGBScreen.js';
import SingleBulbScreen from './singlebulb/SingleBulbScreen.js';
const colorVisionTitleStringProperty = ColorVisionStrings['color-vision'].titleStringProperty;
const tandem = Tandem.ROOT;
const simOptions = {
  credits: {
    leadDesign: 'Bryce Gruneich, Kathy Perkins',
    softwareDevelopment: 'Aaron Davis, Ron LeMaster, Chris Malley (PixelZoom, Inc.), Sam Reid',
    team: 'Wendy Adams, Danielle Harlow, Ariel Paul, Carl Wieman',
    qualityAssurance: 'Oliver Orejola, Amy Rouinfar, Bryan Yoelin',
    graphicArts: 'Mike Fowler'
  }
};
simLauncher.launch(() => {
  const sim = new Sim(colorVisionTitleStringProperty, [new SingleBulbScreen(tandem.createTandem('singleBulbScreen')), new RGBScreen(tandem.createTandem('rgbBulbsScreen'))], simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIlRhbmRlbSIsIkNvbG9yVmlzaW9uU3RyaW5ncyIsIlJHQlNjcmVlbiIsIlNpbmdsZUJ1bGJTY3JlZW4iLCJjb2xvclZpc2lvblRpdGxlU3RyaW5nUHJvcGVydHkiLCJ0aXRsZVN0cmluZ1Byb3BlcnR5IiwidGFuZGVtIiwiUk9PVCIsInNpbU9wdGlvbnMiLCJjcmVkaXRzIiwibGVhZERlc2lnbiIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJ0ZWFtIiwicXVhbGl0eUFzc3VyYW5jZSIsImdyYXBoaWNBcnRzIiwibGF1bmNoIiwic2ltIiwiY3JlYXRlVGFuZGVtIiwic3RhcnQiXSwic291cmNlcyI6WyJjb2xvci12aXNpb24tbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYWluIGVudHJ5IHBvaW50IGZvciB0aGUgc2ltLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEFhcm9uIERhdmlzIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTaW0gZnJvbSAnLi4vLi4vam9pc3QvanMvU2ltLmpzJztcclxuaW1wb3J0IHNpbUxhdW5jaGVyIGZyb20gJy4uLy4uL2pvaXN0L2pzL3NpbUxhdW5jaGVyLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IENvbG9yVmlzaW9uU3RyaW5ncyBmcm9tICcuL0NvbG9yVmlzaW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBSR0JTY3JlZW4gZnJvbSAnLi9yZ2IvUkdCU2NyZWVuLmpzJztcclxuaW1wb3J0IFNpbmdsZUJ1bGJTY3JlZW4gZnJvbSAnLi9zaW5nbGVidWxiL1NpbmdsZUJ1bGJTY3JlZW4uanMnO1xyXG5cclxuY29uc3QgY29sb3JWaXNpb25UaXRsZVN0cmluZ1Byb3BlcnR5ID0gQ29sb3JWaXNpb25TdHJpbmdzWyAnY29sb3ItdmlzaW9uJyBdLnRpdGxlU3RyaW5nUHJvcGVydHk7XHJcblxyXG5jb25zdCB0YW5kZW0gPSBUYW5kZW0uUk9PVDtcclxuXHJcbmNvbnN0IHNpbU9wdGlvbnMgPSB7XHJcbiAgY3JlZGl0czoge1xyXG4gICAgbGVhZERlc2lnbjogJ0JyeWNlIEdydW5laWNoLCBLYXRoeSBQZXJraW5zJyxcclxuICAgIHNvZnR3YXJlRGV2ZWxvcG1lbnQ6ICdBYXJvbiBEYXZpcywgUm9uIExlTWFzdGVyLCBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLiksIFNhbSBSZWlkJyxcclxuICAgIHRlYW06ICdXZW5keSBBZGFtcywgRGFuaWVsbGUgSGFybG93LCBBcmllbCBQYXVsLCBDYXJsIFdpZW1hbicsXHJcbiAgICBxdWFsaXR5QXNzdXJhbmNlOiAnT2xpdmVyIE9yZWpvbGEsIEFteSBSb3VpbmZhciwgQnJ5YW4gWW9lbGluJyxcclxuICAgIGdyYXBoaWNBcnRzOiAnTWlrZSBGb3dsZXInXHJcbiAgfVxyXG59O1xyXG5cclxuc2ltTGF1bmNoZXIubGF1bmNoKCAoKSA9PiB7XHJcbiAgY29uc3Qgc2ltID0gbmV3IFNpbSggY29sb3JWaXNpb25UaXRsZVN0cmluZ1Byb3BlcnR5LCBbXHJcbiAgICBuZXcgU2luZ2xlQnVsYlNjcmVlbiggdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NpbmdsZUJ1bGJTY3JlZW4nICkgKSxcclxuICAgIG5ldyBSR0JTY3JlZW4oIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZ2JCdWxic1NjcmVlbicgKSApXHJcbiAgXSwgc2ltT3B0aW9ucyApO1xyXG4gIHNpbS5zdGFydCgpO1xyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEdBQUcsTUFBTSx1QkFBdUI7QUFDdkMsT0FBT0MsV0FBVyxNQUFNLCtCQUErQjtBQUN2RCxPQUFPQyxNQUFNLE1BQU0sMkJBQTJCO0FBQzlDLE9BQU9DLGtCQUFrQixNQUFNLHlCQUF5QjtBQUN4RCxPQUFPQyxTQUFTLE1BQU0sb0JBQW9CO0FBQzFDLE9BQU9DLGdCQUFnQixNQUFNLGtDQUFrQztBQUUvRCxNQUFNQyw4QkFBOEIsR0FBR0gsa0JBQWtCLENBQUUsY0FBYyxDQUFFLENBQUNJLG1CQUFtQjtBQUUvRixNQUFNQyxNQUFNLEdBQUdOLE1BQU0sQ0FBQ08sSUFBSTtBQUUxQixNQUFNQyxVQUFVLEdBQUc7RUFDakJDLE9BQU8sRUFBRTtJQUNQQyxVQUFVLEVBQUUsK0JBQStCO0lBQzNDQyxtQkFBbUIsRUFBRSxxRUFBcUU7SUFDMUZDLElBQUksRUFBRSx1REFBdUQ7SUFDN0RDLGdCQUFnQixFQUFFLDRDQUE0QztJQUM5REMsV0FBVyxFQUFFO0VBQ2Y7QUFDRixDQUFDO0FBRURmLFdBQVcsQ0FBQ2dCLE1BQU0sQ0FBRSxNQUFNO0VBQ3hCLE1BQU1DLEdBQUcsR0FBRyxJQUFJbEIsR0FBRyxDQUFFTSw4QkFBOEIsRUFBRSxDQUNuRCxJQUFJRCxnQkFBZ0IsQ0FBRUcsTUFBTSxDQUFDVyxZQUFZLENBQUUsa0JBQW1CLENBQUUsQ0FBQyxFQUNqRSxJQUFJZixTQUFTLENBQUVJLE1BQU0sQ0FBQ1csWUFBWSxDQUFFLGdCQUFpQixDQUFFLENBQUMsQ0FDekQsRUFBRVQsVUFBVyxDQUFDO0VBQ2ZRLEdBQUcsQ0FBQ0UsS0FBSyxDQUFDLENBQUM7QUFDYixDQUFFLENBQUMifQ==