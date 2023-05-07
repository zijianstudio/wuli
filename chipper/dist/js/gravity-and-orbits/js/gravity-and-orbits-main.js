// Copyright 2013-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import PreferencesModel from '../../joist/js/preferences/PreferencesModel.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import GravityAndOrbitsColors from './common/GravityAndOrbitsColors.js';
import GravityAndOrbitsStrings from './GravityAndOrbitsStrings.js';
import ModelScreen from './model/ModelScreen.js';
import ToScaleScreen from './toScale/ToScaleScreen.js';
simLauncher.launch(() => {
  const credits = {
    leadDesign: 'Emily B. Moore, Noah Podolefsky, Amy Rouinfar',
    softwareDevelopment: 'Aaron Davis, Jesse Greenberg, Jon Olson, Sam Reid',
    team: 'Trish Loeblein, Ariel Paul, Kathy Perkins',
    qualityAssurance: 'Logan Bray, Steele Dalton, Jaron Droder, Clifford Hardin, Ethan Johnson, Brooklyn Lash, Emily Miller, Elise Morgan, Liam Mulhall, Oliver Orejola, Devon Quispe, Ben Roberts, Nancy Salpepi, Kathryn Woessner, Bryan Yoelin',
    thanks: 'Thanks to Mobile Learner Labs for working with the PhET development team to convert this simulation to ' + 'HTML5.'
  };
  const simOptions = {
    credits: credits,
    // phet-io
    phetioDesigned: true,
    preferencesModel: new PreferencesModel({
      visualOptions: {
        supportsProjectorMode: true
      }
    })
  };
  const backgroundColorProperty = GravityAndOrbitsColors.backgroundProperty;
  const modelScreen = new ModelScreen({
    backgroundColorProperty: backgroundColorProperty,
    tandem: Tandem.ROOT.createTandem('modelScreen')
  });
  const toScaleScreen = new ToScaleScreen({
    backgroundColorProperty: backgroundColorProperty,
    tandem: Tandem.ROOT.createTandem('toScaleScreen')
  });
  new Sim(GravityAndOrbitsStrings['gravity-and-orbits'].titleStringProperty, [modelScreen, toScaleScreen], simOptions).start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcmVmZXJlbmNlc01vZGVsIiwiU2ltIiwic2ltTGF1bmNoZXIiLCJUYW5kZW0iLCJHcmF2aXR5QW5kT3JiaXRzQ29sb3JzIiwiR3Jhdml0eUFuZE9yYml0c1N0cmluZ3MiLCJNb2RlbFNjcmVlbiIsIlRvU2NhbGVTY3JlZW4iLCJsYXVuY2giLCJjcmVkaXRzIiwibGVhZERlc2lnbiIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJ0ZWFtIiwicXVhbGl0eUFzc3VyYW5jZSIsInRoYW5rcyIsInNpbU9wdGlvbnMiLCJwaGV0aW9EZXNpZ25lZCIsInByZWZlcmVuY2VzTW9kZWwiLCJ2aXN1YWxPcHRpb25zIiwic3VwcG9ydHNQcm9qZWN0b3JNb2RlIiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJiYWNrZ3JvdW5kUHJvcGVydHkiLCJtb2RlbFNjcmVlbiIsInRhbmRlbSIsIlJPT1QiLCJjcmVhdGVUYW5kZW0iLCJ0b1NjYWxlU2NyZWVuIiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInN0YXJ0Il0sInNvdXJjZXMiOlsiZ3Jhdml0eS1hbmQtb3JiaXRzLW1haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIHNpbS5cclxuICpcclxuICogQGF1dGhvciBBYXJvbiBEYXZpcyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgeyBDcmVkaXRzRGF0YSB9IGZyb20gJy4uLy4uL2pvaXN0L2pzL0NyZWRpdHNOb2RlLmpzJztcclxuaW1wb3J0IFByZWZlcmVuY2VzTW9kZWwgZnJvbSAnLi4vLi4vam9pc3QvanMvcHJlZmVyZW5jZXMvUHJlZmVyZW5jZXNNb2RlbC5qcyc7XHJcbmltcG9ydCBTaW0sIHsgU2ltT3B0aW9ucyB9IGZyb20gJy4uLy4uL2pvaXN0L2pzL1NpbS5qcyc7XHJcbmltcG9ydCBzaW1MYXVuY2hlciBmcm9tICcuLi8uLi9qb2lzdC9qcy9zaW1MYXVuY2hlci5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBHcmF2aXR5QW5kT3JiaXRzQ29sb3JzIGZyb20gJy4vY29tbW9uL0dyYXZpdHlBbmRPcmJpdHNDb2xvcnMuanMnO1xyXG5pbXBvcnQgR3Jhdml0eUFuZE9yYml0c1N0cmluZ3MgZnJvbSAnLi9HcmF2aXR5QW5kT3JiaXRzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBNb2RlbFNjcmVlbiBmcm9tICcuL21vZGVsL01vZGVsU2NyZWVuLmpzJztcclxuaW1wb3J0IFRvU2NhbGVTY3JlZW4gZnJvbSAnLi90b1NjYWxlL1RvU2NhbGVTY3JlZW4uanMnO1xyXG5cclxuc2ltTGF1bmNoZXIubGF1bmNoKCAoKSA9PiB7XHJcblxyXG4gIGNvbnN0IGNyZWRpdHM6IENyZWRpdHNEYXRhID0ge1xyXG4gICAgbGVhZERlc2lnbjogJ0VtaWx5IEIuIE1vb3JlLCBOb2FoIFBvZG9sZWZza3ksIEFteSBSb3VpbmZhcicsXHJcbiAgICBzb2Z0d2FyZURldmVsb3BtZW50OiAnQWFyb24gRGF2aXMsIEplc3NlIEdyZWVuYmVyZywgSm9uIE9sc29uLCBTYW0gUmVpZCcsXHJcbiAgICB0ZWFtOiAnVHJpc2ggTG9lYmxlaW4sIEFyaWVsIFBhdWwsIEthdGh5IFBlcmtpbnMnLFxyXG4gICAgcXVhbGl0eUFzc3VyYW5jZTogJ0xvZ2FuIEJyYXksIFN0ZWVsZSBEYWx0b24sIEphcm9uIERyb2RlciwgQ2xpZmZvcmQgSGFyZGluLCBFdGhhbiBKb2huc29uLCBCcm9va2x5biBMYXNoLCBFbWlseSBNaWxsZXIsIEVsaXNlIE1vcmdhbiwgTGlhbSBNdWxoYWxsLCBPbGl2ZXIgT3Jlam9sYSwgRGV2b24gUXVpc3BlLCBCZW4gUm9iZXJ0cywgTmFuY3kgU2FscGVwaSwgS2F0aHJ5biBXb2Vzc25lciwgQnJ5YW4gWW9lbGluJyxcclxuICAgIHRoYW5rczogJ1RoYW5rcyB0byBNb2JpbGUgTGVhcm5lciBMYWJzIGZvciB3b3JraW5nIHdpdGggdGhlIFBoRVQgZGV2ZWxvcG1lbnQgdGVhbSB0byBjb252ZXJ0IHRoaXMgc2ltdWxhdGlvbiB0byAnICtcclxuICAgICAgICAgICAgJ0hUTUw1LidcclxuICB9O1xyXG4gIGNvbnN0IHNpbU9wdGlvbnM6IFNpbU9wdGlvbnMgPSB7XHJcbiAgICBjcmVkaXRzOiBjcmVkaXRzLFxyXG5cclxuICAgIC8vIHBoZXQtaW9cclxuICAgIHBoZXRpb0Rlc2lnbmVkOiB0cnVlLFxyXG5cclxuICAgIHByZWZlcmVuY2VzTW9kZWw6IG5ldyBQcmVmZXJlbmNlc01vZGVsKCB7XHJcbiAgICAgIHZpc3VhbE9wdGlvbnM6IHtcclxuICAgICAgICBzdXBwb3J0c1Byb2plY3Rvck1vZGU6IHRydWVcclxuICAgICAgfVxyXG4gICAgfSApXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgYmFja2dyb3VuZENvbG9yUHJvcGVydHkgPSBHcmF2aXR5QW5kT3JiaXRzQ29sb3JzLmJhY2tncm91bmRQcm9wZXJ0eTtcclxuXHJcbiAgY29uc3QgbW9kZWxTY3JlZW4gPSBuZXcgTW9kZWxTY3JlZW4oIHtcclxuICAgIGJhY2tncm91bmRDb2xvclByb3BlcnR5OiBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSxcclxuICAgIHRhbmRlbTogVGFuZGVtLlJPT1QuY3JlYXRlVGFuZGVtKCAnbW9kZWxTY3JlZW4nIClcclxuICB9ICk7XHJcbiAgY29uc3QgdG9TY2FsZVNjcmVlbiA9IG5ldyBUb1NjYWxlU2NyZWVuKCB7XHJcbiAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogYmFja2dyb3VuZENvbG9yUHJvcGVydHksXHJcbiAgICB0YW5kZW06IFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggJ3RvU2NhbGVTY3JlZW4nIClcclxuICB9ICk7XHJcbiAgbmV3IFNpbSggR3Jhdml0eUFuZE9yYml0c1N0cmluZ3NbICdncmF2aXR5LWFuZC1vcmJpdHMnIF0udGl0bGVTdHJpbmdQcm9wZXJ0eSwgWyBtb2RlbFNjcmVlbiwgdG9TY2FsZVNjcmVlbiBdLCBzaW1PcHRpb25zICkuc3RhcnQoKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxnQkFBZ0IsTUFBTSxnREFBZ0Q7QUFDN0UsT0FBT0MsR0FBRyxNQUFzQix1QkFBdUI7QUFDdkQsT0FBT0MsV0FBVyxNQUFNLCtCQUErQjtBQUN2RCxPQUFPQyxNQUFNLE1BQU0sMkJBQTJCO0FBQzlDLE9BQU9DLHNCQUFzQixNQUFNLG9DQUFvQztBQUN2RSxPQUFPQyx1QkFBdUIsTUFBTSw4QkFBOEI7QUFDbEUsT0FBT0MsV0FBVyxNQUFNLHdCQUF3QjtBQUNoRCxPQUFPQyxhQUFhLE1BQU0sNEJBQTRCO0FBRXRETCxXQUFXLENBQUNNLE1BQU0sQ0FBRSxNQUFNO0VBRXhCLE1BQU1DLE9BQW9CLEdBQUc7SUFDM0JDLFVBQVUsRUFBRSwrQ0FBK0M7SUFDM0RDLG1CQUFtQixFQUFFLG1EQUFtRDtJQUN4RUMsSUFBSSxFQUFFLDJDQUEyQztJQUNqREMsZ0JBQWdCLEVBQUUsNE5BQTROO0lBQzlPQyxNQUFNLEVBQUUseUdBQXlHLEdBQ3pHO0VBQ1YsQ0FBQztFQUNELE1BQU1DLFVBQXNCLEdBQUc7SUFDN0JOLE9BQU8sRUFBRUEsT0FBTztJQUVoQjtJQUNBTyxjQUFjLEVBQUUsSUFBSTtJQUVwQkMsZ0JBQWdCLEVBQUUsSUFBSWpCLGdCQUFnQixDQUFFO01BQ3RDa0IsYUFBYSxFQUFFO1FBQ2JDLHFCQUFxQixFQUFFO01BQ3pCO0lBQ0YsQ0FBRTtFQUNKLENBQUM7RUFFRCxNQUFNQyx1QkFBdUIsR0FBR2hCLHNCQUFzQixDQUFDaUIsa0JBQWtCO0VBRXpFLE1BQU1DLFdBQVcsR0FBRyxJQUFJaEIsV0FBVyxDQUFFO0lBQ25DYyx1QkFBdUIsRUFBRUEsdUJBQXVCO0lBQ2hERyxNQUFNLEVBQUVwQixNQUFNLENBQUNxQixJQUFJLENBQUNDLFlBQVksQ0FBRSxhQUFjO0VBQ2xELENBQUUsQ0FBQztFQUNILE1BQU1DLGFBQWEsR0FBRyxJQUFJbkIsYUFBYSxDQUFFO0lBQ3ZDYSx1QkFBdUIsRUFBRUEsdUJBQXVCO0lBQ2hERyxNQUFNLEVBQUVwQixNQUFNLENBQUNxQixJQUFJLENBQUNDLFlBQVksQ0FBRSxlQUFnQjtFQUNwRCxDQUFFLENBQUM7RUFDSCxJQUFJeEIsR0FBRyxDQUFFSSx1QkFBdUIsQ0FBRSxvQkFBb0IsQ0FBRSxDQUFDc0IsbUJBQW1CLEVBQUUsQ0FBRUwsV0FBVyxFQUFFSSxhQUFhLENBQUUsRUFBRVgsVUFBVyxDQUFDLENBQUNhLEtBQUssQ0FBQyxDQUFDO0FBQ3BJLENBQUUsQ0FBQyJ9