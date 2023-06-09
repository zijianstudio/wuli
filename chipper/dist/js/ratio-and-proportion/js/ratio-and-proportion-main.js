// Copyright 2020-2023, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import CreateScreen from './create/CreateScreen.js';
import DiscoverScreen from './discover/DiscoverScreen.js';
import RatioAndProportionStrings from './RatioAndProportionStrings.js';
import RAPPreferencesModel from './common/view/RAPPreferencesModel.js';
const ratioAndProportionTitleStringProperty = RatioAndProportionStrings['ratio-and-proportion'].titleStringProperty;
const simOptions = {
  credits: {
    softwareDevelopment: 'John Blanco, Michael Kauzmann',
    team: 'Brett Fiedler, Amanda McGarry, Emily B. Moore, Matthew Moore, Taliesin Smith',
    contributors: 'Dor Abrahamson and the Embodied Design Research Laboratory (UC Berkeley); Clement Zheng, Peter Gyory, and Ellen Do from the ACME Lab (CU Boulder ATLAS Institute)',
    qualityAssurance: 'Logan Bray, Steele Dalton, Jaron Droder, Clifford Hardin, Megan Lai, Brooklyn Lash, Emily Miller, ' + 'Liam Mulhall, Devon Quispe, Nancy Salpepi, Kathryn Woessner',
    soundDesign: 'Ashton Morris'
  },
  preferencesModel: new RAPPreferencesModel()
};

// launch the sim - beware that scenery Image nodes created outside simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch(() => {
  const sim = new Sim(ratioAndProportionTitleStringProperty, [new DiscoverScreen(Tandem.ROOT.createTandem('discoverScreen')), new CreateScreen(Tandem.ROOT.createTandem('createScreen'))], simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIlRhbmRlbSIsIkNyZWF0ZVNjcmVlbiIsIkRpc2NvdmVyU2NyZWVuIiwiUmF0aW9BbmRQcm9wb3J0aW9uU3RyaW5ncyIsIlJBUFByZWZlcmVuY2VzTW9kZWwiLCJyYXRpb0FuZFByb3BvcnRpb25UaXRsZVN0cmluZ1Byb3BlcnR5IiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInNpbU9wdGlvbnMiLCJjcmVkaXRzIiwic29mdHdhcmVEZXZlbG9wbWVudCIsInRlYW0iLCJjb250cmlidXRvcnMiLCJxdWFsaXR5QXNzdXJhbmNlIiwic291bmREZXNpZ24iLCJwcmVmZXJlbmNlc01vZGVsIiwibGF1bmNoIiwic2ltIiwiUk9PVCIsImNyZWF0ZVRhbmRlbSIsInN0YXJ0Il0sInNvdXJjZXMiOlsicmF0aW8tYW5kLXByb3BvcnRpb24tbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYWluIGVudHJ5IHBvaW50IGZvciB0aGUgc2ltLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFNpbSwgeyBTaW1PcHRpb25zIH0gZnJvbSAnLi4vLi4vam9pc3QvanMvU2ltLmpzJztcclxuaW1wb3J0IHNpbUxhdW5jaGVyIGZyb20gJy4uLy4uL2pvaXN0L2pzL3NpbUxhdW5jaGVyLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IENyZWF0ZVNjcmVlbiBmcm9tICcuL2NyZWF0ZS9DcmVhdGVTY3JlZW4uanMnO1xyXG5pbXBvcnQgRGlzY292ZXJTY3JlZW4gZnJvbSAnLi9kaXNjb3Zlci9EaXNjb3ZlclNjcmVlbi5qcyc7XHJcbmltcG9ydCBSYXRpb0FuZFByb3BvcnRpb25TdHJpbmdzIGZyb20gJy4vUmF0aW9BbmRQcm9wb3J0aW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBSQVBQcmVmZXJlbmNlc01vZGVsIGZyb20gJy4vY29tbW9uL3ZpZXcvUkFQUHJlZmVyZW5jZXNNb2RlbC5qcyc7XHJcblxyXG5jb25zdCByYXRpb0FuZFByb3BvcnRpb25UaXRsZVN0cmluZ1Byb3BlcnR5ID0gUmF0aW9BbmRQcm9wb3J0aW9uU3RyaW5nc1sgJ3JhdGlvLWFuZC1wcm9wb3J0aW9uJyBdLnRpdGxlU3RyaW5nUHJvcGVydHk7XHJcblxyXG5jb25zdCBzaW1PcHRpb25zOiBTaW1PcHRpb25zID0ge1xyXG4gIGNyZWRpdHM6IHtcclxuICAgIHNvZnR3YXJlRGV2ZWxvcG1lbnQ6ICdKb2huIEJsYW5jbywgTWljaGFlbCBLYXV6bWFubicsXHJcbiAgICB0ZWFtOiAnQnJldHQgRmllZGxlciwgQW1hbmRhIE1jR2FycnksIEVtaWx5IEIuIE1vb3JlLCBNYXR0aGV3IE1vb3JlLCBUYWxpZXNpbiBTbWl0aCcsXHJcbiAgICBjb250cmlidXRvcnM6ICdEb3IgQWJyYWhhbXNvbiBhbmQgdGhlIEVtYm9kaWVkIERlc2lnbiBSZXNlYXJjaCBMYWJvcmF0b3J5IChVQyBCZXJrZWxleSk7IENsZW1lbnQgWmhlbmcsIFBldGVyIEd5b3J5LCBhbmQgRWxsZW4gRG8gZnJvbSB0aGUgQUNNRSBMYWIgKENVIEJvdWxkZXIgQVRMQVMgSW5zdGl0dXRlKScsXHJcbiAgICBxdWFsaXR5QXNzdXJhbmNlOiAnTG9nYW4gQnJheSwgU3RlZWxlIERhbHRvbiwgSmFyb24gRHJvZGVyLCBDbGlmZm9yZCBIYXJkaW4sIE1lZ2FuIExhaSwgQnJvb2tseW4gTGFzaCwgRW1pbHkgTWlsbGVyLCAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICdMaWFtIE11bGhhbGwsIERldm9uIFF1aXNwZSwgTmFuY3kgU2FscGVwaSwgS2F0aHJ5biBXb2Vzc25lcicsXHJcbiAgICBzb3VuZERlc2lnbjogJ0FzaHRvbiBNb3JyaXMnXHJcbiAgfSxcclxuICBwcmVmZXJlbmNlc01vZGVsOiBuZXcgUkFQUHJlZmVyZW5jZXNNb2RlbCgpXHJcbn07XHJcblxyXG4vLyBsYXVuY2ggdGhlIHNpbSAtIGJld2FyZSB0aGF0IHNjZW5lcnkgSW1hZ2Ugbm9kZXMgY3JlYXRlZCBvdXRzaWRlIHNpbUxhdW5jaGVyLmxhdW5jaCgpIHdpbGwgaGF2ZSB6ZXJvIGJvdW5kc1xyXG4vLyB1bnRpbCB0aGUgaW1hZ2VzIGFyZSBmdWxseSBsb2FkZWQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY291bG9tYnMtbGF3L2lzc3Vlcy83MFxyXG5zaW1MYXVuY2hlci5sYXVuY2goICgpID0+IHtcclxuICBjb25zdCBzaW0gPSBuZXcgU2ltKCByYXRpb0FuZFByb3BvcnRpb25UaXRsZVN0cmluZ1Byb3BlcnR5LCBbXHJcbiAgICBuZXcgRGlzY292ZXJTY3JlZW4oIFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggJ2Rpc2NvdmVyU2NyZWVuJyApICksXHJcbiAgICBuZXcgQ3JlYXRlU2NyZWVuKCBUYW5kZW0uUk9PVC5jcmVhdGVUYW5kZW0oICdjcmVhdGVTY3JlZW4nICkgKVxyXG4gIF0sIHNpbU9wdGlvbnMgKTtcclxuICBzaW0uc3RhcnQoKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxHQUFHLE1BQXNCLHVCQUF1QjtBQUN2RCxPQUFPQyxXQUFXLE1BQU0sK0JBQStCO0FBQ3ZELE9BQU9DLE1BQU0sTUFBTSwyQkFBMkI7QUFDOUMsT0FBT0MsWUFBWSxNQUFNLDBCQUEwQjtBQUNuRCxPQUFPQyxjQUFjLE1BQU0sOEJBQThCO0FBQ3pELE9BQU9DLHlCQUF5QixNQUFNLGdDQUFnQztBQUN0RSxPQUFPQyxtQkFBbUIsTUFBTSxzQ0FBc0M7QUFFdEUsTUFBTUMscUNBQXFDLEdBQUdGLHlCQUF5QixDQUFFLHNCQUFzQixDQUFFLENBQUNHLG1CQUFtQjtBQUVySCxNQUFNQyxVQUFzQixHQUFHO0VBQzdCQyxPQUFPLEVBQUU7SUFDUEMsbUJBQW1CLEVBQUUsK0JBQStCO0lBQ3BEQyxJQUFJLEVBQUUsOEVBQThFO0lBQ3BGQyxZQUFZLEVBQUUsbUtBQW1LO0lBQ2pMQyxnQkFBZ0IsRUFBRSxvR0FBb0csR0FDcEcsNkRBQTZEO0lBQy9FQyxXQUFXLEVBQUU7RUFDZixDQUFDO0VBQ0RDLGdCQUFnQixFQUFFLElBQUlWLG1CQUFtQixDQUFDO0FBQzVDLENBQUM7O0FBRUQ7QUFDQTtBQUNBTCxXQUFXLENBQUNnQixNQUFNLENBQUUsTUFBTTtFQUN4QixNQUFNQyxHQUFHLEdBQUcsSUFBSWxCLEdBQUcsQ0FBRU8scUNBQXFDLEVBQUUsQ0FDMUQsSUFBSUgsY0FBYyxDQUFFRixNQUFNLENBQUNpQixJQUFJLENBQUNDLFlBQVksQ0FBRSxnQkFBaUIsQ0FBRSxDQUFDLEVBQ2xFLElBQUlqQixZQUFZLENBQUVELE1BQU0sQ0FBQ2lCLElBQUksQ0FBQ0MsWUFBWSxDQUFFLGNBQWUsQ0FBRSxDQUFDLENBQy9ELEVBQUVYLFVBQVcsQ0FBQztFQUNmUyxHQUFHLENBQUNHLEtBQUssQ0FBQyxDQUFDO0FBQ2IsQ0FBRSxDQUFDIn0=