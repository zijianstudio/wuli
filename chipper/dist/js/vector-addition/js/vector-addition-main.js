// Copyright 2019-2022, University of Colorado Boulder

/**
 * Main entry point for the 'Vector Addition' sim.
 *
 * @author Martin Veillette
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import VectorAdditionConstants from './common/VectorAdditionConstants.js';
import EquationsScreen from './equations/EquationsScreen.js';
import Explore1DScreen from './explore1D/Explore1DScreen.js';
import Explore2DScreen from './explore2D/Explore2DScreen.js';
import LabScreen from './lab/LabScreen.js';
import VectorAdditionStrings from './VectorAdditionStrings.js';
simLauncher.launch(() => {
  const screens = [new Explore1DScreen(Tandem.ROOT.createTandem('explore1DScreen')), new Explore2DScreen(Tandem.ROOT.createTandem('explore2DScreen')), new LabScreen(Tandem.ROOT.createTandem('labScreen')), new EquationsScreen(Tandem.ROOT.createTandem('equationsScreen'))];
  const sim = new Sim(VectorAdditionStrings['vector-addition'].titleStringProperty, screens, {
    credits: VectorAdditionConstants.CREDITS
  });
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIlRhbmRlbSIsIlZlY3RvckFkZGl0aW9uQ29uc3RhbnRzIiwiRXF1YXRpb25zU2NyZWVuIiwiRXhwbG9yZTFEU2NyZWVuIiwiRXhwbG9yZTJEU2NyZWVuIiwiTGFiU2NyZWVuIiwiVmVjdG9yQWRkaXRpb25TdHJpbmdzIiwibGF1bmNoIiwic2NyZWVucyIsIlJPT1QiLCJjcmVhdGVUYW5kZW0iLCJzaW0iLCJ0aXRsZVN0cmluZ1Byb3BlcnR5IiwiY3JlZGl0cyIsIkNSRURJVFMiLCJzdGFydCJdLCJzb3VyY2VzIjpbInZlY3Rvci1hZGRpdGlvbi1tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1haW4gZW50cnkgcG9pbnQgZm9yIHRoZSAnVmVjdG9yIEFkZGl0aW9uJyBzaW0uXHJcbiAqXHJcbiAqIEBhdXRob3IgTWFydGluIFZlaWxsZXR0ZVxyXG4gKi9cclxuXHJcbmltcG9ydCBTaW0gZnJvbSAnLi4vLi4vam9pc3QvanMvU2ltLmpzJztcclxuaW1wb3J0IHNpbUxhdW5jaGVyIGZyb20gJy4uLy4uL2pvaXN0L2pzL3NpbUxhdW5jaGVyLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzIGZyb20gJy4vY29tbW9uL1ZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEVxdWF0aW9uc1NjcmVlbiBmcm9tICcuL2VxdWF0aW9ucy9FcXVhdGlvbnNTY3JlZW4uanMnO1xyXG5pbXBvcnQgRXhwbG9yZTFEU2NyZWVuIGZyb20gJy4vZXhwbG9yZTFEL0V4cGxvcmUxRFNjcmVlbi5qcyc7XHJcbmltcG9ydCBFeHBsb3JlMkRTY3JlZW4gZnJvbSAnLi9leHBsb3JlMkQvRXhwbG9yZTJEU2NyZWVuLmpzJztcclxuaW1wb3J0IExhYlNjcmVlbiBmcm9tICcuL2xhYi9MYWJTY3JlZW4uanMnO1xyXG5pbXBvcnQgVmVjdG9yQWRkaXRpb25TdHJpbmdzIGZyb20gJy4vVmVjdG9yQWRkaXRpb25TdHJpbmdzLmpzJztcclxuXHJcbnNpbUxhdW5jaGVyLmxhdW5jaCggKCkgPT4ge1xyXG5cclxuICBjb25zdCBzY3JlZW5zID0gW1xyXG4gICAgbmV3IEV4cGxvcmUxRFNjcmVlbiggVGFuZGVtLlJPT1QuY3JlYXRlVGFuZGVtKCAnZXhwbG9yZTFEU2NyZWVuJyApICksXHJcbiAgICBuZXcgRXhwbG9yZTJEU2NyZWVuKCBUYW5kZW0uUk9PVC5jcmVhdGVUYW5kZW0oICdleHBsb3JlMkRTY3JlZW4nICkgKSxcclxuICAgIG5ldyBMYWJTY3JlZW4oIFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggJ2xhYlNjcmVlbicgKSApLFxyXG4gICAgbmV3IEVxdWF0aW9uc1NjcmVlbiggVGFuZGVtLlJPT1QuY3JlYXRlVGFuZGVtKCAnZXF1YXRpb25zU2NyZWVuJyApIClcclxuICBdO1xyXG5cclxuICBjb25zdCBzaW0gPSBuZXcgU2ltKCBWZWN0b3JBZGRpdGlvblN0cmluZ3NbICd2ZWN0b3ItYWRkaXRpb24nIF0udGl0bGVTdHJpbmdQcm9wZXJ0eSwgc2NyZWVucywge1xyXG4gICAgY3JlZGl0czogVmVjdG9yQWRkaXRpb25Db25zdGFudHMuQ1JFRElUU1xyXG4gIH0gKTtcclxuXHJcbiAgc2ltLnN0YXJ0KCk7XHJcbn0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsR0FBRyxNQUFNLHVCQUF1QjtBQUN2QyxPQUFPQyxXQUFXLE1BQU0sK0JBQStCO0FBQ3ZELE9BQU9DLE1BQU0sTUFBTSwyQkFBMkI7QUFDOUMsT0FBT0MsdUJBQXVCLE1BQU0scUNBQXFDO0FBQ3pFLE9BQU9DLGVBQWUsTUFBTSxnQ0FBZ0M7QUFDNUQsT0FBT0MsZUFBZSxNQUFNLGdDQUFnQztBQUM1RCxPQUFPQyxlQUFlLE1BQU0sZ0NBQWdDO0FBQzVELE9BQU9DLFNBQVMsTUFBTSxvQkFBb0I7QUFDMUMsT0FBT0MscUJBQXFCLE1BQU0sNEJBQTRCO0FBRTlEUCxXQUFXLENBQUNRLE1BQU0sQ0FBRSxNQUFNO0VBRXhCLE1BQU1DLE9BQU8sR0FBRyxDQUNkLElBQUlMLGVBQWUsQ0FBRUgsTUFBTSxDQUFDUyxJQUFJLENBQUNDLFlBQVksQ0FBRSxpQkFBa0IsQ0FBRSxDQUFDLEVBQ3BFLElBQUlOLGVBQWUsQ0FBRUosTUFBTSxDQUFDUyxJQUFJLENBQUNDLFlBQVksQ0FBRSxpQkFBa0IsQ0FBRSxDQUFDLEVBQ3BFLElBQUlMLFNBQVMsQ0FBRUwsTUFBTSxDQUFDUyxJQUFJLENBQUNDLFlBQVksQ0FBRSxXQUFZLENBQUUsQ0FBQyxFQUN4RCxJQUFJUixlQUFlLENBQUVGLE1BQU0sQ0FBQ1MsSUFBSSxDQUFDQyxZQUFZLENBQUUsaUJBQWtCLENBQUUsQ0FBQyxDQUNyRTtFQUVELE1BQU1DLEdBQUcsR0FBRyxJQUFJYixHQUFHLENBQUVRLHFCQUFxQixDQUFFLGlCQUFpQixDQUFFLENBQUNNLG1CQUFtQixFQUFFSixPQUFPLEVBQUU7SUFDNUZLLE9BQU8sRUFBRVosdUJBQXVCLENBQUNhO0VBQ25DLENBQUUsQ0FBQztFQUVISCxHQUFHLENBQUNJLEtBQUssQ0FBQyxDQUFDO0FBQ2IsQ0FBRSxDQUFDIn0=