// Copyright 2015-2022, University of Colorado Boulder

/**
 * Main entry point for the 'Chains' application.
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import ChainsScreen from './chains/ChainsScreen.js';
import ChainsStrings from './ChainsStrings.js';
const chainsTitleStringProperty = ChainsStrings.chains.titleStringProperty;
const simOptions = {
  credits: {
    softwareDevelopment: 'PhET Interactive Simulations'
  }
};
simLauncher.launch(() => {
  new Sim(chainsTitleStringProperty, [new ChainsScreen(Tandem.ROOT.createTandem('chainsScreen'))], simOptions).start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIlRhbmRlbSIsIkNoYWluc1NjcmVlbiIsIkNoYWluc1N0cmluZ3MiLCJjaGFpbnNUaXRsZVN0cmluZ1Byb3BlcnR5IiwiY2hhaW5zIiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInNpbU9wdGlvbnMiLCJjcmVkaXRzIiwic29mdHdhcmVEZXZlbG9wbWVudCIsImxhdW5jaCIsIlJPT1QiLCJjcmVhdGVUYW5kZW0iLCJzdGFydCJdLCJzb3VyY2VzIjpbImNoYWlucy1tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1haW4gZW50cnkgcG9pbnQgZm9yIHRoZSAnQ2hhaW5zJyBhcHBsaWNhdGlvbi5cclxuICovXHJcblxyXG5pbXBvcnQgU2ltIGZyb20gJy4uLy4uL2pvaXN0L2pzL1NpbS5qcyc7XHJcbmltcG9ydCBzaW1MYXVuY2hlciBmcm9tICcuLi8uLi9qb2lzdC9qcy9zaW1MYXVuY2hlci5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBDaGFpbnNTY3JlZW4gZnJvbSAnLi9jaGFpbnMvQ2hhaW5zU2NyZWVuLmpzJztcclxuaW1wb3J0IENoYWluc1N0cmluZ3MgZnJvbSAnLi9DaGFpbnNTdHJpbmdzLmpzJztcclxuXHJcbmNvbnN0IGNoYWluc1RpdGxlU3RyaW5nUHJvcGVydHkgPSBDaGFpbnNTdHJpbmdzLmNoYWlucy50aXRsZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxuY29uc3Qgc2ltT3B0aW9ucyA9IHtcclxuICBjcmVkaXRzOiB7XHJcbiAgICBzb2Z0d2FyZURldmVsb3BtZW50OiAnUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucydcclxuICB9XHJcbn07XHJcblxyXG5zaW1MYXVuY2hlci5sYXVuY2goICgpID0+IHtcclxuICBuZXcgU2ltKCBjaGFpbnNUaXRsZVN0cmluZ1Byb3BlcnR5LCBbIG5ldyBDaGFpbnNTY3JlZW4oIFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggJ2NoYWluc1NjcmVlbicgKSApIF0sIHNpbU9wdGlvbnMgKS5zdGFydCgpO1xyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsR0FBRyxNQUFNLHVCQUF1QjtBQUN2QyxPQUFPQyxXQUFXLE1BQU0sK0JBQStCO0FBQ3ZELE9BQU9DLE1BQU0sTUFBTSwyQkFBMkI7QUFDOUMsT0FBT0MsWUFBWSxNQUFNLDBCQUEwQjtBQUNuRCxPQUFPQyxhQUFhLE1BQU0sb0JBQW9CO0FBRTlDLE1BQU1DLHlCQUF5QixHQUFHRCxhQUFhLENBQUNFLE1BQU0sQ0FBQ0MsbUJBQW1CO0FBRTFFLE1BQU1DLFVBQVUsR0FBRztFQUNqQkMsT0FBTyxFQUFFO0lBQ1BDLG1CQUFtQixFQUFFO0VBQ3ZCO0FBQ0YsQ0FBQztBQUVEVCxXQUFXLENBQUNVLE1BQU0sQ0FBRSxNQUFNO0VBQ3hCLElBQUlYLEdBQUcsQ0FBRUsseUJBQXlCLEVBQUUsQ0FBRSxJQUFJRixZQUFZLENBQUVELE1BQU0sQ0FBQ1UsSUFBSSxDQUFDQyxZQUFZLENBQUUsY0FBZSxDQUFFLENBQUMsQ0FBRSxFQUFFTCxVQUFXLENBQUMsQ0FBQ00sS0FBSyxDQUFDLENBQUM7QUFDOUgsQ0FBRSxDQUFDIn0=