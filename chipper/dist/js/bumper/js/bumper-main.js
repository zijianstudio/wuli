// Copyright 2018-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson
 */

import ChainsScreen from '../../chains/js/chains/ChainsScreen.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import BumperStrings from './BumperStrings.js';
const bumperTitleStringProperty = BumperStrings.bumper.titleStringProperty;
const tandem = Tandem.ROOT;
const simOptions = {
  credits: {
    softwareDevelopment: 'PhET Interactive Simulations'
  }
};
simLauncher.launch(() => {
  const sim = new Sim(bumperTitleStringProperty, [new ChainsScreen(tandem.createTandem('chainsScreen'))], simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGFpbnNTY3JlZW4iLCJTaW0iLCJzaW1MYXVuY2hlciIsIlRhbmRlbSIsIkJ1bXBlclN0cmluZ3MiLCJidW1wZXJUaXRsZVN0cmluZ1Byb3BlcnR5IiwiYnVtcGVyIiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInRhbmRlbSIsIlJPT1QiLCJzaW1PcHRpb25zIiwiY3JlZGl0cyIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJsYXVuY2giLCJzaW0iLCJjcmVhdGVUYW5kZW0iLCJzdGFydCJdLCJzb3VyY2VzIjpbImJ1bXBlci1tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1haW4gZW50cnkgcG9pbnQgZm9yIHRoZSBzaW0uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb25cclxuICovXHJcblxyXG5pbXBvcnQgQ2hhaW5zU2NyZWVuIGZyb20gJy4uLy4uL2NoYWlucy9qcy9jaGFpbnMvQ2hhaW5zU2NyZWVuLmpzJztcclxuaW1wb3J0IFNpbSBmcm9tICcuLi8uLi9qb2lzdC9qcy9TaW0uanMnO1xyXG5pbXBvcnQgc2ltTGF1bmNoZXIgZnJvbSAnLi4vLi4vam9pc3QvanMvc2ltTGF1bmNoZXIuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgQnVtcGVyU3RyaW5ncyBmcm9tICcuL0J1bXBlclN0cmluZ3MuanMnO1xyXG5cclxuY29uc3QgYnVtcGVyVGl0bGVTdHJpbmdQcm9wZXJ0eSA9IEJ1bXBlclN0cmluZ3MuYnVtcGVyLnRpdGxlU3RyaW5nUHJvcGVydHk7XHJcblxyXG5jb25zdCB0YW5kZW0gPSBUYW5kZW0uUk9PVDtcclxuXHJcbmNvbnN0IHNpbU9wdGlvbnMgPSB7XHJcbiAgY3JlZGl0czoge1xyXG4gICAgc29mdHdhcmVEZXZlbG9wbWVudDogJ1BoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMnXHJcbiAgfVxyXG59O1xyXG5cclxuc2ltTGF1bmNoZXIubGF1bmNoKCAoKSA9PiB7XHJcbiAgY29uc3Qgc2ltID0gbmV3IFNpbSggYnVtcGVyVGl0bGVTdHJpbmdQcm9wZXJ0eSwgWyBuZXcgQ2hhaW5zU2NyZWVuKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY2hhaW5zU2NyZWVuJyApICkgXSwgc2ltT3B0aW9ucyApO1xyXG4gIHNpbS5zdGFydCgpO1xyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFlBQVksTUFBTSx3Q0FBd0M7QUFDakUsT0FBT0MsR0FBRyxNQUFNLHVCQUF1QjtBQUN2QyxPQUFPQyxXQUFXLE1BQU0sK0JBQStCO0FBQ3ZELE9BQU9DLE1BQU0sTUFBTSwyQkFBMkI7QUFDOUMsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUU5QyxNQUFNQyx5QkFBeUIsR0FBR0QsYUFBYSxDQUFDRSxNQUFNLENBQUNDLG1CQUFtQjtBQUUxRSxNQUFNQyxNQUFNLEdBQUdMLE1BQU0sQ0FBQ00sSUFBSTtBQUUxQixNQUFNQyxVQUFVLEdBQUc7RUFDakJDLE9BQU8sRUFBRTtJQUNQQyxtQkFBbUIsRUFBRTtFQUN2QjtBQUNGLENBQUM7QUFFRFYsV0FBVyxDQUFDVyxNQUFNLENBQUUsTUFBTTtFQUN4QixNQUFNQyxHQUFHLEdBQUcsSUFBSWIsR0FBRyxDQUFFSSx5QkFBeUIsRUFBRSxDQUFFLElBQUlMLFlBQVksQ0FBRVEsTUFBTSxDQUFDTyxZQUFZLENBQUUsY0FBZSxDQUFFLENBQUMsQ0FBRSxFQUFFTCxVQUFXLENBQUM7RUFDM0hJLEdBQUcsQ0FBQ0UsS0FBSyxDQUFDLENBQUM7QUFDYixDQUFFLENBQUMifQ==