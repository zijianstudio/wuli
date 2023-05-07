// Copyright 2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import MeanShareAndBalanceStrings from './MeanShareAndBalanceStrings.js';
import IntroScreen from './intro/IntroScreen.js';
import LevelingOutScreen from './leveling-out/LevelingOutScreen.js';
const simOptions = {
  credits: {
    leadDesign: 'Amanda McGarry',
    softwareDevelopment: 'Marla Schulz, Sam Reid',
    team: 'Kelly Findley, Marilyn Hartzell, Ariel Paul, Kathy Perkins, David Webb',
    qualityAssurance: 'Clifford Hardin, Emily Miller, Nancy Salpepi, Kathryn Woessner',
    graphicArts: 'Mariah Hermsmeyer'
    // soundDesign: '',
    // thanks: ''
  }
};

// launch the sim - beware that scenery Image nodes created outside of simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch(() => {
  const sim = new Sim(MeanShareAndBalanceStrings['mean-share-and-balance'].titleStringProperty, [new IntroScreen({
    tandem: Tandem.ROOT.createTandem('introScreen')
  }), new LevelingOutScreen({
    tandem: Tandem.ROOT.createTandem('levelingOutScreen')
  })], simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIlRhbmRlbSIsIk1lYW5TaGFyZUFuZEJhbGFuY2VTdHJpbmdzIiwiSW50cm9TY3JlZW4iLCJMZXZlbGluZ091dFNjcmVlbiIsInNpbU9wdGlvbnMiLCJjcmVkaXRzIiwibGVhZERlc2lnbiIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJ0ZWFtIiwicXVhbGl0eUFzc3VyYW5jZSIsImdyYXBoaWNBcnRzIiwibGF1bmNoIiwic2ltIiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInRhbmRlbSIsIlJPT1QiLCJjcmVhdGVUYW5kZW0iLCJzdGFydCJdLCJzb3VyY2VzIjpbIm1lYW4tc2hhcmUtYW5kLWJhbGFuY2UtbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIHNpbS5cclxuICpcclxuICogQGF1dGhvciBNYXJsYSBTY2h1bHogKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFNpbSwgeyBTaW1PcHRpb25zIH0gZnJvbSAnLi4vLi4vam9pc3QvanMvU2ltLmpzJztcclxuaW1wb3J0IHNpbUxhdW5jaGVyIGZyb20gJy4uLy4uL2pvaXN0L2pzL3NpbUxhdW5jaGVyLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IE1lYW5TaGFyZUFuZEJhbGFuY2VTdHJpbmdzIGZyb20gJy4vTWVhblNoYXJlQW5kQmFsYW5jZVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgSW50cm9TY3JlZW4gZnJvbSAnLi9pbnRyby9JbnRyb1NjcmVlbi5qcyc7XHJcbmltcG9ydCBMZXZlbGluZ091dFNjcmVlbiBmcm9tICcuL2xldmVsaW5nLW91dC9MZXZlbGluZ091dFNjcmVlbi5qcyc7XHJcblxyXG5jb25zdCBzaW1PcHRpb25zOiBTaW1PcHRpb25zID0ge1xyXG5cclxuICBjcmVkaXRzOiB7XHJcbiAgICBsZWFkRGVzaWduOiAnQW1hbmRhIE1jR2FycnknLFxyXG4gICAgc29mdHdhcmVEZXZlbG9wbWVudDogJ01hcmxhIFNjaHVseiwgU2FtIFJlaWQnLFxyXG4gICAgdGVhbTogJ0tlbGx5IEZpbmRsZXksIE1hcmlseW4gSGFydHplbGwsIEFyaWVsIFBhdWwsIEthdGh5IFBlcmtpbnMsIERhdmlkIFdlYmInLFxyXG4gICAgcXVhbGl0eUFzc3VyYW5jZTogJ0NsaWZmb3JkIEhhcmRpbiwgRW1pbHkgTWlsbGVyLCBOYW5jeSBTYWxwZXBpLCBLYXRocnluIFdvZXNzbmVyJyxcclxuICAgIGdyYXBoaWNBcnRzOiAnTWFyaWFoIEhlcm1zbWV5ZXInXHJcbiAgICAvLyBzb3VuZERlc2lnbjogJycsXHJcbiAgICAvLyB0aGFua3M6ICcnXHJcbiAgfVxyXG59O1xyXG5cclxuLy8gbGF1bmNoIHRoZSBzaW0gLSBiZXdhcmUgdGhhdCBzY2VuZXJ5IEltYWdlIG5vZGVzIGNyZWF0ZWQgb3V0c2lkZSBvZiBzaW1MYXVuY2hlci5sYXVuY2goKSB3aWxsIGhhdmUgemVybyBib3VuZHNcclxuLy8gdW50aWwgdGhlIGltYWdlcyBhcmUgZnVsbHkgbG9hZGVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NvdWxvbWJzLWxhdy9pc3N1ZXMvNzBcclxuc2ltTGF1bmNoZXIubGF1bmNoKCAoKSA9PiB7XHJcbiAgY29uc3Qgc2ltID0gbmV3IFNpbSggTWVhblNoYXJlQW5kQmFsYW5jZVN0cmluZ3NbICdtZWFuLXNoYXJlLWFuZC1iYWxhbmNlJyBdLnRpdGxlU3RyaW5nUHJvcGVydHksIFtcclxuICAgIG5ldyBJbnRyb1NjcmVlbiggeyB0YW5kZW06IFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggJ2ludHJvU2NyZWVuJyApIH0gKSxcclxuICAgIG5ldyBMZXZlbGluZ091dFNjcmVlbiggeyB0YW5kZW06IFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggJ2xldmVsaW5nT3V0U2NyZWVuJyApIH0gKVxyXG4gIF0sIHNpbU9wdGlvbnMgKTtcclxuICBzaW0uc3RhcnQoKTtcclxufSApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxHQUFHLE1BQXNCLHVCQUF1QjtBQUN2RCxPQUFPQyxXQUFXLE1BQU0sK0JBQStCO0FBQ3ZELE9BQU9DLE1BQU0sTUFBTSwyQkFBMkI7QUFDOUMsT0FBT0MsMEJBQTBCLE1BQU0saUNBQWlDO0FBQ3hFLE9BQU9DLFdBQVcsTUFBTSx3QkFBd0I7QUFDaEQsT0FBT0MsaUJBQWlCLE1BQU0scUNBQXFDO0FBRW5FLE1BQU1DLFVBQXNCLEdBQUc7RUFFN0JDLE9BQU8sRUFBRTtJQUNQQyxVQUFVLEVBQUUsZ0JBQWdCO0lBQzVCQyxtQkFBbUIsRUFBRSx3QkFBd0I7SUFDN0NDLElBQUksRUFBRSx3RUFBd0U7SUFDOUVDLGdCQUFnQixFQUFFLGdFQUFnRTtJQUNsRkMsV0FBVyxFQUFFO0lBQ2I7SUFDQTtFQUNGO0FBQ0YsQ0FBQzs7QUFFRDtBQUNBO0FBQ0FYLFdBQVcsQ0FBQ1ksTUFBTSxDQUFFLE1BQU07RUFDeEIsTUFBTUMsR0FBRyxHQUFHLElBQUlkLEdBQUcsQ0FBRUcsMEJBQTBCLENBQUUsd0JBQXdCLENBQUUsQ0FBQ1ksbUJBQW1CLEVBQUUsQ0FDL0YsSUFBSVgsV0FBVyxDQUFFO0lBQUVZLE1BQU0sRUFBRWQsTUFBTSxDQUFDZSxJQUFJLENBQUNDLFlBQVksQ0FBRSxhQUFjO0VBQUUsQ0FBRSxDQUFDLEVBQ3hFLElBQUliLGlCQUFpQixDQUFFO0lBQUVXLE1BQU0sRUFBRWQsTUFBTSxDQUFDZSxJQUFJLENBQUNDLFlBQVksQ0FBRSxtQkFBb0I7RUFBRSxDQUFFLENBQUMsQ0FDckYsRUFBRVosVUFBVyxDQUFDO0VBQ2ZRLEdBQUcsQ0FBQ0ssS0FBSyxDQUFDLENBQUM7QUFDYixDQUFFLENBQUMifQ==