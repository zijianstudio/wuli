// Copyright 2015-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import EEBasicsScreen from './basics/EEBasicsScreen.js';
import EEExploreScreen from './explore/EEExploreScreen.js';
import ExpressionExchangeStrings from './ExpressionExchangeStrings.js';
import EEGameScreen from './game/EEGameScreen.js';
import EENegativesScreen from './negatives/EENegativesScreen.js';
const expressionExchangeTitleStringProperty = ExpressionExchangeStrings['expression-exchange'].titleStringProperty;

// credits
const simOptions = {
  credits: {
    leadDesign: 'Amanda McGarry',
    softwareDevelopment: 'John Blanco',
    graphicArts: 'Mariah Hermsmeyer',
    team: 'Ariel Paul, Kathy Perkins, David Webb',
    qualityAssurance: 'Steele Dalton, Alex Dornan, Ethan Johnson'
  }
};

// launch the sim
simLauncher.launch(() => {
  const sim = new Sim(expressionExchangeTitleStringProperty, [new EEBasicsScreen(), new EEExploreScreen(), new EENegativesScreen(), new EEGameScreen()], simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIkVFQmFzaWNzU2NyZWVuIiwiRUVFeHBsb3JlU2NyZWVuIiwiRXhwcmVzc2lvbkV4Y2hhbmdlU3RyaW5ncyIsIkVFR2FtZVNjcmVlbiIsIkVFTmVnYXRpdmVzU2NyZWVuIiwiZXhwcmVzc2lvbkV4Y2hhbmdlVGl0bGVTdHJpbmdQcm9wZXJ0eSIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJzaW1PcHRpb25zIiwiY3JlZGl0cyIsImxlYWREZXNpZ24iLCJzb2Z0d2FyZURldmVsb3BtZW50IiwiZ3JhcGhpY0FydHMiLCJ0ZWFtIiwicXVhbGl0eUFzc3VyYW5jZSIsImxhdW5jaCIsInNpbSIsInN0YXJ0Il0sInNvdXJjZXMiOlsiZXhwcmVzc2lvbi1leGNoYW5nZS1tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1haW4gZW50cnkgcG9pbnQgZm9yIHRoZSBzaW0uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgU2ltIGZyb20gJy4uLy4uL2pvaXN0L2pzL1NpbS5qcyc7XHJcbmltcG9ydCBzaW1MYXVuY2hlciBmcm9tICcuLi8uLi9qb2lzdC9qcy9zaW1MYXVuY2hlci5qcyc7XHJcbmltcG9ydCBFRUJhc2ljc1NjcmVlbiBmcm9tICcuL2Jhc2ljcy9FRUJhc2ljc1NjcmVlbi5qcyc7XHJcbmltcG9ydCBFRUV4cGxvcmVTY3JlZW4gZnJvbSAnLi9leHBsb3JlL0VFRXhwbG9yZVNjcmVlbi5qcyc7XHJcbmltcG9ydCBFeHByZXNzaW9uRXhjaGFuZ2VTdHJpbmdzIGZyb20gJy4vRXhwcmVzc2lvbkV4Y2hhbmdlU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBFRUdhbWVTY3JlZW4gZnJvbSAnLi9nYW1lL0VFR2FtZVNjcmVlbi5qcyc7XHJcbmltcG9ydCBFRU5lZ2F0aXZlc1NjcmVlbiBmcm9tICcuL25lZ2F0aXZlcy9FRU5lZ2F0aXZlc1NjcmVlbi5qcyc7XHJcblxyXG5jb25zdCBleHByZXNzaW9uRXhjaGFuZ2VUaXRsZVN0cmluZ1Byb3BlcnR5ID0gRXhwcmVzc2lvbkV4Y2hhbmdlU3RyaW5nc1sgJ2V4cHJlc3Npb24tZXhjaGFuZ2UnIF0udGl0bGVTdHJpbmdQcm9wZXJ0eTtcclxuXHJcbi8vIGNyZWRpdHNcclxuY29uc3Qgc2ltT3B0aW9ucyA9IHtcclxuICBjcmVkaXRzOiB7XHJcbiAgICBsZWFkRGVzaWduOiAnQW1hbmRhIE1jR2FycnknLFxyXG4gICAgc29mdHdhcmVEZXZlbG9wbWVudDogJ0pvaG4gQmxhbmNvJyxcclxuICAgIGdyYXBoaWNBcnRzOiAnTWFyaWFoIEhlcm1zbWV5ZXInLFxyXG4gICAgdGVhbTogJ0FyaWVsIFBhdWwsIEthdGh5IFBlcmtpbnMsIERhdmlkIFdlYmInLFxyXG4gICAgcXVhbGl0eUFzc3VyYW5jZTogJ1N0ZWVsZSBEYWx0b24sIEFsZXggRG9ybmFuLCBFdGhhbiBKb2huc29uJ1xyXG4gIH1cclxufTtcclxuXHJcbi8vIGxhdW5jaCB0aGUgc2ltXHJcbnNpbUxhdW5jaGVyLmxhdW5jaCggKCkgPT4ge1xyXG4gIGNvbnN0IHNpbSA9IG5ldyBTaW0oXHJcbiAgICBleHByZXNzaW9uRXhjaGFuZ2VUaXRsZVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgW1xyXG4gICAgICBuZXcgRUVCYXNpY3NTY3JlZW4oKSxcclxuICAgICAgbmV3IEVFRXhwbG9yZVNjcmVlbigpLFxyXG4gICAgICBuZXcgRUVOZWdhdGl2ZXNTY3JlZW4oKSxcclxuICAgICAgbmV3IEVFR2FtZVNjcmVlbigpXHJcbiAgICBdLFxyXG4gICAgc2ltT3B0aW9ucyApO1xyXG4gIHNpbS5zdGFydCgpO1xyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEdBQUcsTUFBTSx1QkFBdUI7QUFDdkMsT0FBT0MsV0FBVyxNQUFNLCtCQUErQjtBQUN2RCxPQUFPQyxjQUFjLE1BQU0sNEJBQTRCO0FBQ3ZELE9BQU9DLGVBQWUsTUFBTSw4QkFBOEI7QUFDMUQsT0FBT0MseUJBQXlCLE1BQU0sZ0NBQWdDO0FBQ3RFLE9BQU9DLFlBQVksTUFBTSx3QkFBd0I7QUFDakQsT0FBT0MsaUJBQWlCLE1BQU0sa0NBQWtDO0FBRWhFLE1BQU1DLHFDQUFxQyxHQUFHSCx5QkFBeUIsQ0FBRSxxQkFBcUIsQ0FBRSxDQUFDSSxtQkFBbUI7O0FBRXBIO0FBQ0EsTUFBTUMsVUFBVSxHQUFHO0VBQ2pCQyxPQUFPLEVBQUU7SUFDUEMsVUFBVSxFQUFFLGdCQUFnQjtJQUM1QkMsbUJBQW1CLEVBQUUsYUFBYTtJQUNsQ0MsV0FBVyxFQUFFLG1CQUFtQjtJQUNoQ0MsSUFBSSxFQUFFLHVDQUF1QztJQUM3Q0MsZ0JBQWdCLEVBQUU7RUFDcEI7QUFDRixDQUFDOztBQUVEO0FBQ0FkLFdBQVcsQ0FBQ2UsTUFBTSxDQUFFLE1BQU07RUFDeEIsTUFBTUMsR0FBRyxHQUFHLElBQUlqQixHQUFHLENBQ2pCTyxxQ0FBcUMsRUFDckMsQ0FDRSxJQUFJTCxjQUFjLENBQUMsQ0FBQyxFQUNwQixJQUFJQyxlQUFlLENBQUMsQ0FBQyxFQUNyQixJQUFJRyxpQkFBaUIsQ0FBQyxDQUFDLEVBQ3ZCLElBQUlELFlBQVksQ0FBQyxDQUFDLENBQ25CLEVBQ0RJLFVBQVcsQ0FBQztFQUNkUSxHQUFHLENBQUNDLEtBQUssQ0FBQyxDQUFDO0FBQ2IsQ0FBRSxDQUFDIn0=