// Copyright 2023, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Zijian Wang
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import RelativityScreen from './relativity/RelativityScreen.js';
import RelativityStrings from './RelativityStrings.js';
import './common/RelativityQueryParameters.js';

// Launch the sim. Beware that scenery Image nodes created outside simLauncher.launch() will have zero bounds
// until the images are fully loaded. See https://github.com/phetsims/coulombs-law/issues/70#issuecomment-429037461
simLauncher.launch(() => {
  const titleStringProperty = RelativityStrings['relativity'].titleStringProperty;
  const screens = [new RelativityScreen({
    tandem: Tandem.ROOT.createTandem('relativityScreen')
  })];
  const options = {
    //TODO fill in credits, all of these fields are optional, see joist.CreditsNode
    credits: {
      leadDesign: '',
      softwareDevelopment: '',
      team: '',
      contributors: '',
      qualityAssurance: '',
      graphicArts: '',
      soundDesign: '',
      thanks: ''
    }
  };
  const sim = new Sim(titleStringProperty, screens, options);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIlRhbmRlbSIsIlJlbGF0aXZpdHlTY3JlZW4iLCJSZWxhdGl2aXR5U3RyaW5ncyIsImxhdW5jaCIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJzY3JlZW5zIiwidGFuZGVtIiwiUk9PVCIsImNyZWF0ZVRhbmRlbSIsIm9wdGlvbnMiLCJjcmVkaXRzIiwibGVhZERlc2lnbiIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJ0ZWFtIiwiY29udHJpYnV0b3JzIiwicXVhbGl0eUFzc3VyYW5jZSIsImdyYXBoaWNBcnRzIiwic291bmREZXNpZ24iLCJ0aGFua3MiLCJzaW0iLCJzdGFydCJdLCJzb3VyY2VzIjpbInJlbGF0aXZpdHktbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIHNpbS5cclxuICpcclxuICogQGF1dGhvciBaaWppYW4gV2FuZ1xyXG4gKi9cclxuXHJcbmltcG9ydCBTaW0sIHsgU2ltT3B0aW9ucyB9IGZyb20gJy4uLy4uL2pvaXN0L2pzL1NpbS5qcyc7XHJcbmltcG9ydCBzaW1MYXVuY2hlciBmcm9tICcuLi8uLi9qb2lzdC9qcy9zaW1MYXVuY2hlci5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBSZWxhdGl2aXR5U2NyZWVuIGZyb20gJy4vcmVsYXRpdml0eS9SZWxhdGl2aXR5U2NyZWVuLmpzJztcclxuaW1wb3J0IFJlbGF0aXZpdHlTdHJpbmdzIGZyb20gJy4vUmVsYXRpdml0eVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgJy4vY29tbW9uL1JlbGF0aXZpdHlRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5cclxuLy8gTGF1bmNoIHRoZSBzaW0uIEJld2FyZSB0aGF0IHNjZW5lcnkgSW1hZ2Ugbm9kZXMgY3JlYXRlZCBvdXRzaWRlIHNpbUxhdW5jaGVyLmxhdW5jaCgpIHdpbGwgaGF2ZSB6ZXJvIGJvdW5kc1xyXG4vLyB1bnRpbCB0aGUgaW1hZ2VzIGFyZSBmdWxseSBsb2FkZWQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY291bG9tYnMtbGF3L2lzc3Vlcy83MCNpc3N1ZWNvbW1lbnQtNDI5MDM3NDYxXHJcbnNpbUxhdW5jaGVyLmxhdW5jaCggKCkgPT4ge1xyXG5cclxuICBjb25zdCB0aXRsZVN0cmluZ1Byb3BlcnR5ID0gUmVsYXRpdml0eVN0cmluZ3NbICdyZWxhdGl2aXR5JyBdLnRpdGxlU3RyaW5nUHJvcGVydHk7XHJcblxyXG4gIGNvbnN0IHNjcmVlbnMgPSBbXHJcbiAgICBuZXcgUmVsYXRpdml0eVNjcmVlbiggeyB0YW5kZW06IFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggJ3JlbGF0aXZpdHlTY3JlZW4nICkgfSApXHJcbiAgXTtcclxuXHJcbiAgY29uc3Qgb3B0aW9uczogU2ltT3B0aW9ucyA9IHtcclxuXHJcbiAgICAvL1RPRE8gZmlsbCBpbiBjcmVkaXRzLCBhbGwgb2YgdGhlc2UgZmllbGRzIGFyZSBvcHRpb25hbCwgc2VlIGpvaXN0LkNyZWRpdHNOb2RlXHJcbiAgICBjcmVkaXRzOiB7XHJcbiAgICAgIGxlYWREZXNpZ246ICcnLFxyXG4gICAgICBzb2Z0d2FyZURldmVsb3BtZW50OiAnJyxcclxuICAgICAgdGVhbTogJycsXHJcbiAgICAgIGNvbnRyaWJ1dG9yczogJycsXHJcbiAgICAgIHF1YWxpdHlBc3N1cmFuY2U6ICcnLFxyXG4gICAgICBncmFwaGljQXJ0czogJycsXHJcbiAgICAgIHNvdW5kRGVzaWduOiAnJyxcclxuICAgICAgdGhhbmtzOiAnJ1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IHNpbSA9IG5ldyBTaW0oIHRpdGxlU3RyaW5nUHJvcGVydHksIHNjcmVlbnMsIG9wdGlvbnMgKTtcclxuICBzaW0uc3RhcnQoKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxHQUFHLE1BQXNCLHVCQUF1QjtBQUN2RCxPQUFPQyxXQUFXLE1BQU0sK0JBQStCO0FBQ3ZELE9BQU9DLE1BQU0sTUFBTSwyQkFBMkI7QUFDOUMsT0FBT0MsZ0JBQWdCLE1BQU0sa0NBQWtDO0FBQy9ELE9BQU9DLGlCQUFpQixNQUFNLHdCQUF3QjtBQUN0RCxPQUFPLHVDQUF1Qzs7QUFFOUM7QUFDQTtBQUNBSCxXQUFXLENBQUNJLE1BQU0sQ0FBRSxNQUFNO0VBRXhCLE1BQU1DLG1CQUFtQixHQUFHRixpQkFBaUIsQ0FBRSxZQUFZLENBQUUsQ0FBQ0UsbUJBQW1CO0VBRWpGLE1BQU1DLE9BQU8sR0FBRyxDQUNkLElBQUlKLGdCQUFnQixDQUFFO0lBQUVLLE1BQU0sRUFBRU4sTUFBTSxDQUFDTyxJQUFJLENBQUNDLFlBQVksQ0FBRSxrQkFBbUI7RUFBRSxDQUFFLENBQUMsQ0FDbkY7RUFFRCxNQUFNQyxPQUFtQixHQUFHO0lBRTFCO0lBQ0FDLE9BQU8sRUFBRTtNQUNQQyxVQUFVLEVBQUUsRUFBRTtNQUNkQyxtQkFBbUIsRUFBRSxFQUFFO01BQ3ZCQyxJQUFJLEVBQUUsRUFBRTtNQUNSQyxZQUFZLEVBQUUsRUFBRTtNQUNoQkMsZ0JBQWdCLEVBQUUsRUFBRTtNQUNwQkMsV0FBVyxFQUFFLEVBQUU7TUFDZkMsV0FBVyxFQUFFLEVBQUU7TUFDZkMsTUFBTSxFQUFFO0lBQ1Y7RUFDRixDQUFDO0VBRUQsTUFBTUMsR0FBRyxHQUFHLElBQUlyQixHQUFHLENBQUVNLG1CQUFtQixFQUFFQyxPQUFPLEVBQUVJLE9BQVEsQ0FBQztFQUM1RFUsR0FBRyxDQUFDQyxLQUFLLENBQUMsQ0FBQztBQUNiLENBQUUsQ0FBQyJ9