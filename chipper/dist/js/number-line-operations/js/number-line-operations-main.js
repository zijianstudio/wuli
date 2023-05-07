// Copyright 2020-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import NLOChipsScreen from './chips/NLOChipsScreen.js';
import NLOGenericScreen from './generic/NLOGenericScreen.js';
import NLONetWorthScreen from './net-worth/NLONetWorthScreen.js';
import NumberLineOperationsStrings from './NumberLineOperationsStrings.js';
import NLOOperationsScreen from './operations/NLOOperationsScreen.js';
const numberLineOperationsTitleStringProperty = NumberLineOperationsStrings['number-line-operations'].titleStringProperty;
const simOptions = {
  credits: {
    leadDesign: 'Amanda McGarry',
    softwareDevelopment: 'John Blanco',
    team: 'Kathy Perkins',
    qualityAssurance: 'Logan Bray, Brooklyn Lash, Liam Mulhall, Devon Quispe, Kathryn Woessner',
    graphicArts: 'Megan Lai'
  }
};

// launch the sim - beware that scenery Image nodes created outside of simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch(() => {
  const screens = [new NLOChipsScreen(Tandem.ROOT.createTandem('chipsScreen')), new NLONetWorthScreen(Tandem.ROOT.createTandem('netWorthScreen')), new NLOOperationsScreen(Tandem.ROOT.createTandem('operationsScreen')), new NLOGenericScreen(Tandem.ROOT.createTandem('genericScreen'))];
  const sim = new Sim(numberLineOperationsTitleStringProperty, screens, simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIlRhbmRlbSIsIk5MT0NoaXBzU2NyZWVuIiwiTkxPR2VuZXJpY1NjcmVlbiIsIk5MT05ldFdvcnRoU2NyZWVuIiwiTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzIiwiTkxPT3BlcmF0aW9uc1NjcmVlbiIsIm51bWJlckxpbmVPcGVyYXRpb25zVGl0bGVTdHJpbmdQcm9wZXJ0eSIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJzaW1PcHRpb25zIiwiY3JlZGl0cyIsImxlYWREZXNpZ24iLCJzb2Z0d2FyZURldmVsb3BtZW50IiwidGVhbSIsInF1YWxpdHlBc3N1cmFuY2UiLCJncmFwaGljQXJ0cyIsImxhdW5jaCIsInNjcmVlbnMiLCJST09UIiwiY3JlYXRlVGFuZGVtIiwic2ltIiwic3RhcnQiXSwic291cmNlcyI6WyJudW1iZXItbGluZS1vcGVyYXRpb25zLW1haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIHNpbS5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgU2ltIGZyb20gJy4uLy4uL2pvaXN0L2pzL1NpbS5qcyc7XHJcbmltcG9ydCBzaW1MYXVuY2hlciBmcm9tICcuLi8uLi9qb2lzdC9qcy9zaW1MYXVuY2hlci5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBOTE9DaGlwc1NjcmVlbiBmcm9tICcuL2NoaXBzL05MT0NoaXBzU2NyZWVuLmpzJztcclxuaW1wb3J0IE5MT0dlbmVyaWNTY3JlZW4gZnJvbSAnLi9nZW5lcmljL05MT0dlbmVyaWNTY3JlZW4uanMnO1xyXG5pbXBvcnQgTkxPTmV0V29ydGhTY3JlZW4gZnJvbSAnLi9uZXQtd29ydGgvTkxPTmV0V29ydGhTY3JlZW4uanMnO1xyXG5pbXBvcnQgTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzIGZyb20gJy4vTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzLmpzJztcclxuaW1wb3J0IE5MT09wZXJhdGlvbnNTY3JlZW4gZnJvbSAnLi9vcGVyYXRpb25zL05MT09wZXJhdGlvbnNTY3JlZW4uanMnO1xyXG5cclxuY29uc3QgbnVtYmVyTGluZU9wZXJhdGlvbnNUaXRsZVN0cmluZ1Byb3BlcnR5ID0gTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzWyAnbnVtYmVyLWxpbmUtb3BlcmF0aW9ucycgXS50aXRsZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxuY29uc3Qgc2ltT3B0aW9ucyA9IHtcclxuICBjcmVkaXRzOiB7XHJcbiAgICBsZWFkRGVzaWduOiAnQW1hbmRhIE1jR2FycnknLFxyXG4gICAgc29mdHdhcmVEZXZlbG9wbWVudDogJ0pvaG4gQmxhbmNvJyxcclxuICAgIHRlYW06ICdLYXRoeSBQZXJraW5zJyxcclxuICAgIHF1YWxpdHlBc3N1cmFuY2U6ICdMb2dhbiBCcmF5LCBCcm9va2x5biBMYXNoLCBMaWFtIE11bGhhbGwsIERldm9uIFF1aXNwZSwgS2F0aHJ5biBXb2Vzc25lcicsXHJcbiAgICBncmFwaGljQXJ0czogJ01lZ2FuIExhaSdcclxuICB9XHJcbn07XHJcblxyXG4vLyBsYXVuY2ggdGhlIHNpbSAtIGJld2FyZSB0aGF0IHNjZW5lcnkgSW1hZ2Ugbm9kZXMgY3JlYXRlZCBvdXRzaWRlIG9mIHNpbUxhdW5jaGVyLmxhdW5jaCgpIHdpbGwgaGF2ZSB6ZXJvIGJvdW5kc1xyXG4vLyB1bnRpbCB0aGUgaW1hZ2VzIGFyZSBmdWxseSBsb2FkZWQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY291bG9tYnMtbGF3L2lzc3Vlcy83MFxyXG5zaW1MYXVuY2hlci5sYXVuY2goICgpID0+IHtcclxuICBjb25zdCBzY3JlZW5zID0gW1xyXG4gICAgbmV3IE5MT0NoaXBzU2NyZWVuKCBUYW5kZW0uUk9PVC5jcmVhdGVUYW5kZW0oICdjaGlwc1NjcmVlbicgKSApLFxyXG4gICAgbmV3IE5MT05ldFdvcnRoU2NyZWVuKCBUYW5kZW0uUk9PVC5jcmVhdGVUYW5kZW0oICduZXRXb3J0aFNjcmVlbicgKSApLFxyXG4gICAgbmV3IE5MT09wZXJhdGlvbnNTY3JlZW4oIFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggJ29wZXJhdGlvbnNTY3JlZW4nICkgKSxcclxuICAgIG5ldyBOTE9HZW5lcmljU2NyZWVuKCBUYW5kZW0uUk9PVC5jcmVhdGVUYW5kZW0oICdnZW5lcmljU2NyZWVuJyApIClcclxuICBdO1xyXG4gIGNvbnN0IHNpbSA9IG5ldyBTaW0oIG51bWJlckxpbmVPcGVyYXRpb25zVGl0bGVTdHJpbmdQcm9wZXJ0eSwgc2NyZWVucywgc2ltT3B0aW9ucyApO1xyXG4gIHNpbS5zdGFydCgpO1xyXG59ICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxHQUFHLE1BQU0sdUJBQXVCO0FBQ3ZDLE9BQU9DLFdBQVcsTUFBTSwrQkFBK0I7QUFDdkQsT0FBT0MsTUFBTSxNQUFNLDJCQUEyQjtBQUM5QyxPQUFPQyxjQUFjLE1BQU0sMkJBQTJCO0FBQ3RELE9BQU9DLGdCQUFnQixNQUFNLCtCQUErQjtBQUM1RCxPQUFPQyxpQkFBaUIsTUFBTSxrQ0FBa0M7QUFDaEUsT0FBT0MsMkJBQTJCLE1BQU0sa0NBQWtDO0FBQzFFLE9BQU9DLG1CQUFtQixNQUFNLHFDQUFxQztBQUVyRSxNQUFNQyx1Q0FBdUMsR0FBR0YsMkJBQTJCLENBQUUsd0JBQXdCLENBQUUsQ0FBQ0csbUJBQW1CO0FBRTNILE1BQU1DLFVBQVUsR0FBRztFQUNqQkMsT0FBTyxFQUFFO0lBQ1BDLFVBQVUsRUFBRSxnQkFBZ0I7SUFDNUJDLG1CQUFtQixFQUFFLGFBQWE7SUFDbENDLElBQUksRUFBRSxlQUFlO0lBQ3JCQyxnQkFBZ0IsRUFBRSx5RUFBeUU7SUFDM0ZDLFdBQVcsRUFBRTtFQUNmO0FBQ0YsQ0FBQzs7QUFFRDtBQUNBO0FBQ0FmLFdBQVcsQ0FBQ2dCLE1BQU0sQ0FBRSxNQUFNO0VBQ3hCLE1BQU1DLE9BQU8sR0FBRyxDQUNkLElBQUlmLGNBQWMsQ0FBRUQsTUFBTSxDQUFDaUIsSUFBSSxDQUFDQyxZQUFZLENBQUUsYUFBYyxDQUFFLENBQUMsRUFDL0QsSUFBSWYsaUJBQWlCLENBQUVILE1BQU0sQ0FBQ2lCLElBQUksQ0FBQ0MsWUFBWSxDQUFFLGdCQUFpQixDQUFFLENBQUMsRUFDckUsSUFBSWIsbUJBQW1CLENBQUVMLE1BQU0sQ0FBQ2lCLElBQUksQ0FBQ0MsWUFBWSxDQUFFLGtCQUFtQixDQUFFLENBQUMsRUFDekUsSUFBSWhCLGdCQUFnQixDQUFFRixNQUFNLENBQUNpQixJQUFJLENBQUNDLFlBQVksQ0FBRSxlQUFnQixDQUFFLENBQUMsQ0FDcEU7RUFDRCxNQUFNQyxHQUFHLEdBQUcsSUFBSXJCLEdBQUcsQ0FBRVEsdUNBQXVDLEVBQUVVLE9BQU8sRUFBRVIsVUFBVyxDQUFDO0VBQ25GVyxHQUFHLENBQUNDLEtBQUssQ0FBQyxDQUFDO0FBQ2IsQ0FBRSxDQUFDIn0=