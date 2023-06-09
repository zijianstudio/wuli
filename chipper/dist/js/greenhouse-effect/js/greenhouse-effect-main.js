// Copyright 2020-2023, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import GreenhouseEffectStrings from './GreenhouseEffectStrings.js';
import LayerModelScreen from './layer-model/LayerModelScreen.js';
import PhotonsScreen from './photons/PhotonsScreen.js';
import WavesScreen from './waves/WavesScreen.js';
const greenhouseEffectTitleStringProperty = GreenhouseEffectStrings['greenhouse-effect'].titleStringProperty;
const simOptions = {
  // Enabled for high-performance Sprites
  webgl: true,
  credits: {
    leadDesign: 'Kathy Perkins, Amy Rouinfar',
    softwareDevelopment: 'John Blanco, Jesse Greenberg, Sam Reid',
    team: 'Wendy Adams, Danielle Harlow, Kelly Lancaster, Trish Loeblein, Robert Parson, Carl Wieman',
    qualityAssurance: 'Jaron Droder, Clifford Hardin, Amanda McGarry, Emily Miller, Nancy Salpepi,<br>Marla Schulz, Kathryn Woessner',
    graphicArts: '',
    soundDesign: 'Ashton Morris',
    thanks: 'Dedicated to the memory of Ron LeMaster.'
  }
};

// Launch the sim.  Beware that scenery Image nodes created outside simLauncher.launch() will have zero bounds until the
// images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70.
simLauncher.launch(() => {
  const sim = new Sim(greenhouseEffectTitleStringProperty, [new WavesScreen(Tandem.ROOT.createTandem('wavesScreen')), new PhotonsScreen(Tandem.ROOT.createTandem('photonsScreen')), new LayerModelScreen(Tandem.ROOT.createTandem('layerModelScreen'))], simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIlRhbmRlbSIsIkdyZWVuaG91c2VFZmZlY3RTdHJpbmdzIiwiTGF5ZXJNb2RlbFNjcmVlbiIsIlBob3RvbnNTY3JlZW4iLCJXYXZlc1NjcmVlbiIsImdyZWVuaG91c2VFZmZlY3RUaXRsZVN0cmluZ1Byb3BlcnR5IiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInNpbU9wdGlvbnMiLCJ3ZWJnbCIsImNyZWRpdHMiLCJsZWFkRGVzaWduIiwic29mdHdhcmVEZXZlbG9wbWVudCIsInRlYW0iLCJxdWFsaXR5QXNzdXJhbmNlIiwiZ3JhcGhpY0FydHMiLCJzb3VuZERlc2lnbiIsInRoYW5rcyIsImxhdW5jaCIsInNpbSIsIlJPT1QiLCJjcmVhdGVUYW5kZW0iLCJzdGFydCJdLCJzb3VyY2VzIjpbImdyZWVuaG91c2UtZWZmZWN0LW1haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIHNpbS5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBTaW0sIHsgU2ltT3B0aW9ucyB9IGZyb20gJy4uLy4uL2pvaXN0L2pzL1NpbS5qcyc7XHJcbmltcG9ydCBzaW1MYXVuY2hlciBmcm9tICcuLi8uLi9qb2lzdC9qcy9zaW1MYXVuY2hlci5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncyBmcm9tICcuL0dyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmpzJztcclxuaW1wb3J0IExheWVyTW9kZWxTY3JlZW4gZnJvbSAnLi9sYXllci1tb2RlbC9MYXllck1vZGVsU2NyZWVuLmpzJztcclxuaW1wb3J0IFBob3RvbnNTY3JlZW4gZnJvbSAnLi9waG90b25zL1Bob3RvbnNTY3JlZW4uanMnO1xyXG5pbXBvcnQgV2F2ZXNTY3JlZW4gZnJvbSAnLi93YXZlcy9XYXZlc1NjcmVlbi5qcyc7XHJcblxyXG5jb25zdCBncmVlbmhvdXNlRWZmZWN0VGl0bGVTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzWyAnZ3JlZW5ob3VzZS1lZmZlY3QnIF0udGl0bGVTdHJpbmdQcm9wZXJ0eTtcclxuXHJcbmNvbnN0IHNpbU9wdGlvbnM6IFNpbU9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIEVuYWJsZWQgZm9yIGhpZ2gtcGVyZm9ybWFuY2UgU3ByaXRlc1xyXG4gIHdlYmdsOiB0cnVlLFxyXG5cclxuICBjcmVkaXRzOiB7XHJcbiAgICBsZWFkRGVzaWduOiAnS2F0aHkgUGVya2lucywgQW15IFJvdWluZmFyJyxcclxuICAgIHNvZnR3YXJlRGV2ZWxvcG1lbnQ6ICdKb2huIEJsYW5jbywgSmVzc2UgR3JlZW5iZXJnLCBTYW0gUmVpZCcsXHJcbiAgICB0ZWFtOiAnV2VuZHkgQWRhbXMsIERhbmllbGxlIEhhcmxvdywgS2VsbHkgTGFuY2FzdGVyLCBUcmlzaCBMb2VibGVpbiwgUm9iZXJ0IFBhcnNvbiwgQ2FybCBXaWVtYW4nLFxyXG4gICAgcXVhbGl0eUFzc3VyYW5jZTogJ0phcm9uIERyb2RlciwgQ2xpZmZvcmQgSGFyZGluLCBBbWFuZGEgTWNHYXJyeSwgRW1pbHkgTWlsbGVyLCBOYW5jeSBTYWxwZXBpLDxicj5NYXJsYSBTY2h1bHosIEthdGhyeW4gV29lc3NuZXInLFxyXG4gICAgZ3JhcGhpY0FydHM6ICcnLFxyXG4gICAgc291bmREZXNpZ246ICdBc2h0b24gTW9ycmlzJyxcclxuICAgIHRoYW5rczogJ0RlZGljYXRlZCB0byB0aGUgbWVtb3J5IG9mIFJvbiBMZU1hc3Rlci4nXHJcbiAgfVxyXG59O1xyXG5cclxuLy8gTGF1bmNoIHRoZSBzaW0uICBCZXdhcmUgdGhhdCBzY2VuZXJ5IEltYWdlIG5vZGVzIGNyZWF0ZWQgb3V0c2lkZSBzaW1MYXVuY2hlci5sYXVuY2goKSB3aWxsIGhhdmUgemVybyBib3VuZHMgdW50aWwgdGhlXHJcbi8vIGltYWdlcyBhcmUgZnVsbHkgbG9hZGVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NvdWxvbWJzLWxhdy9pc3N1ZXMvNzAuXHJcbnNpbUxhdW5jaGVyLmxhdW5jaCggKCkgPT4ge1xyXG4gIGNvbnN0IHNpbSA9IG5ldyBTaW0oXHJcbiAgICBncmVlbmhvdXNlRWZmZWN0VGl0bGVTdHJpbmdQcm9wZXJ0eSxcclxuICAgIFtcclxuICAgICAgbmV3IFdhdmVzU2NyZWVuKCBUYW5kZW0uUk9PVC5jcmVhdGVUYW5kZW0oICd3YXZlc1NjcmVlbicgKSApLFxyXG4gICAgICBuZXcgUGhvdG9uc1NjcmVlbiggVGFuZGVtLlJPT1QuY3JlYXRlVGFuZGVtKCAncGhvdG9uc1NjcmVlbicgKSApLFxyXG4gICAgICBuZXcgTGF5ZXJNb2RlbFNjcmVlbiggVGFuZGVtLlJPT1QuY3JlYXRlVGFuZGVtKCAnbGF5ZXJNb2RlbFNjcmVlbicgKSApXHJcbiAgICBdLFxyXG4gICAgc2ltT3B0aW9uc1xyXG4gICk7XHJcbiAgc2ltLnN0YXJ0KCk7XHJcbn0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsR0FBRyxNQUFzQix1QkFBdUI7QUFDdkQsT0FBT0MsV0FBVyxNQUFNLCtCQUErQjtBQUN2RCxPQUFPQyxNQUFNLE1BQU0sMkJBQTJCO0FBQzlDLE9BQU9DLHVCQUF1QixNQUFNLDhCQUE4QjtBQUNsRSxPQUFPQyxnQkFBZ0IsTUFBTSxtQ0FBbUM7QUFDaEUsT0FBT0MsYUFBYSxNQUFNLDRCQUE0QjtBQUN0RCxPQUFPQyxXQUFXLE1BQU0sd0JBQXdCO0FBRWhELE1BQU1DLG1DQUFtQyxHQUFHSix1QkFBdUIsQ0FBRSxtQkFBbUIsQ0FBRSxDQUFDSyxtQkFBbUI7QUFFOUcsTUFBTUMsVUFBc0IsR0FBRztFQUU3QjtFQUNBQyxLQUFLLEVBQUUsSUFBSTtFQUVYQyxPQUFPLEVBQUU7SUFDUEMsVUFBVSxFQUFFLDZCQUE2QjtJQUN6Q0MsbUJBQW1CLEVBQUUsd0NBQXdDO0lBQzdEQyxJQUFJLEVBQUUsMkZBQTJGO0lBQ2pHQyxnQkFBZ0IsRUFBRSwrR0FBK0c7SUFDaklDLFdBQVcsRUFBRSxFQUFFO0lBQ2ZDLFdBQVcsRUFBRSxlQUFlO0lBQzVCQyxNQUFNLEVBQUU7RUFDVjtBQUNGLENBQUM7O0FBRUQ7QUFDQTtBQUNBakIsV0FBVyxDQUFDa0IsTUFBTSxDQUFFLE1BQU07RUFDeEIsTUFBTUMsR0FBRyxHQUFHLElBQUlwQixHQUFHLENBQ2pCTyxtQ0FBbUMsRUFDbkMsQ0FDRSxJQUFJRCxXQUFXLENBQUVKLE1BQU0sQ0FBQ21CLElBQUksQ0FBQ0MsWUFBWSxDQUFFLGFBQWMsQ0FBRSxDQUFDLEVBQzVELElBQUlqQixhQUFhLENBQUVILE1BQU0sQ0FBQ21CLElBQUksQ0FBQ0MsWUFBWSxDQUFFLGVBQWdCLENBQUUsQ0FBQyxFQUNoRSxJQUFJbEIsZ0JBQWdCLENBQUVGLE1BQU0sQ0FBQ21CLElBQUksQ0FBQ0MsWUFBWSxDQUFFLGtCQUFtQixDQUFFLENBQUMsQ0FDdkUsRUFDRGIsVUFDRixDQUFDO0VBQ0RXLEdBQUcsQ0FBQ0csS0FBSyxDQUFDLENBQUM7QUFDYixDQUFFLENBQUMifQ==