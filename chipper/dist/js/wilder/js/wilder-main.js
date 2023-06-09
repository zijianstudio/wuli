// Copyright 2018-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author AUTHOR
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import WilderStrings from './WilderStrings.js';
import WilderScreen from './wilder/WilderScreen.js';
import Tandem from '../../tandem/js/Tandem.js';
const wilderTitleStringProperty = WilderStrings.wilder.titleStringProperty;
const simOptions = {
  credits: {
    leadDesign: '',
    softwareDevelopment: '',
    team: '',
    qualityAssurance: '',
    graphicArts: '',
    thanks: ''
  }
};
simLauncher.launch(() => {
  const sim = new Sim(wilderTitleStringProperty, [new WilderScreen({
    tandem: Tandem.ROOT.createTandem('wilderScreen')
  })], simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIldpbGRlclN0cmluZ3MiLCJXaWxkZXJTY3JlZW4iLCJUYW5kZW0iLCJ3aWxkZXJUaXRsZVN0cmluZ1Byb3BlcnR5Iiwid2lsZGVyIiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInNpbU9wdGlvbnMiLCJjcmVkaXRzIiwibGVhZERlc2lnbiIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJ0ZWFtIiwicXVhbGl0eUFzc3VyYW5jZSIsImdyYXBoaWNBcnRzIiwidGhhbmtzIiwibGF1bmNoIiwic2ltIiwidGFuZGVtIiwiUk9PVCIsImNyZWF0ZVRhbmRlbSIsInN0YXJ0Il0sInNvdXJjZXMiOlsid2lsZGVyLW1haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIHNpbS5cclxuICpcclxuICogQGF1dGhvciBBVVRIT1JcclxuICovXHJcblxyXG5pbXBvcnQgU2ltLCB7IFNpbU9wdGlvbnMgfSBmcm9tICcuLi8uLi9qb2lzdC9qcy9TaW0uanMnO1xyXG5pbXBvcnQgc2ltTGF1bmNoZXIgZnJvbSAnLi4vLi4vam9pc3QvanMvc2ltTGF1bmNoZXIuanMnO1xyXG5pbXBvcnQgV2lsZGVyU3RyaW5ncyBmcm9tICcuL1dpbGRlclN0cmluZ3MuanMnO1xyXG5pbXBvcnQgV2lsZGVyU2NyZWVuIGZyb20gJy4vd2lsZGVyL1dpbGRlclNjcmVlbi5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcblxyXG5jb25zdCB3aWxkZXJUaXRsZVN0cmluZ1Byb3BlcnR5ID0gV2lsZGVyU3RyaW5ncy53aWxkZXIudGl0bGVTdHJpbmdQcm9wZXJ0eTtcclxuXHJcbmNvbnN0IHNpbU9wdGlvbnM6IFNpbU9wdGlvbnMgPSB7XHJcbiAgY3JlZGl0czoge1xyXG4gICAgbGVhZERlc2lnbjogJycsXHJcbiAgICBzb2Z0d2FyZURldmVsb3BtZW50OiAnJyxcclxuICAgIHRlYW06ICcnLFxyXG4gICAgcXVhbGl0eUFzc3VyYW5jZTogJycsXHJcbiAgICBncmFwaGljQXJ0czogJycsXHJcbiAgICB0aGFua3M6ICcnXHJcbiAgfVxyXG59O1xyXG5cclxuc2ltTGF1bmNoZXIubGF1bmNoKCAoKSA9PiB7XHJcbiAgY29uc3Qgc2ltID0gbmV3IFNpbSggd2lsZGVyVGl0bGVTdHJpbmdQcm9wZXJ0eSwgWyBuZXcgV2lsZGVyU2NyZWVuKCB7XHJcbiAgICB0YW5kZW06IFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggJ3dpbGRlclNjcmVlbicgKVxyXG4gIH0gKSBdLCBzaW1PcHRpb25zICk7XHJcbiAgc2ltLnN0YXJ0KCk7XHJcbn0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsR0FBRyxNQUFzQix1QkFBdUI7QUFDdkQsT0FBT0MsV0FBVyxNQUFNLCtCQUErQjtBQUN2RCxPQUFPQyxhQUFhLE1BQU0sb0JBQW9CO0FBQzlDLE9BQU9DLFlBQVksTUFBTSwwQkFBMEI7QUFDbkQsT0FBT0MsTUFBTSxNQUFNLDJCQUEyQjtBQUU5QyxNQUFNQyx5QkFBeUIsR0FBR0gsYUFBYSxDQUFDSSxNQUFNLENBQUNDLG1CQUFtQjtBQUUxRSxNQUFNQyxVQUFzQixHQUFHO0VBQzdCQyxPQUFPLEVBQUU7SUFDUEMsVUFBVSxFQUFFLEVBQUU7SUFDZEMsbUJBQW1CLEVBQUUsRUFBRTtJQUN2QkMsSUFBSSxFQUFFLEVBQUU7SUFDUkMsZ0JBQWdCLEVBQUUsRUFBRTtJQUNwQkMsV0FBVyxFQUFFLEVBQUU7SUFDZkMsTUFBTSxFQUFFO0VBQ1Y7QUFDRixDQUFDO0FBRURkLFdBQVcsQ0FBQ2UsTUFBTSxDQUFFLE1BQU07RUFDeEIsTUFBTUMsR0FBRyxHQUFHLElBQUlqQixHQUFHLENBQUVLLHlCQUF5QixFQUFFLENBQUUsSUFBSUYsWUFBWSxDQUFFO0lBQ2xFZSxNQUFNLEVBQUVkLE1BQU0sQ0FBQ2UsSUFBSSxDQUFDQyxZQUFZLENBQUUsY0FBZTtFQUNuRCxDQUFFLENBQUMsQ0FBRSxFQUFFWixVQUFXLENBQUM7RUFDbkJTLEdBQUcsQ0FBQ0ksS0FBSyxDQUFDLENBQUM7QUFDYixDQUFFLENBQUMifQ==