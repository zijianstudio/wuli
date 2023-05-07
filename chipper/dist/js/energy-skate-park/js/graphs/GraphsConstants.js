// Copyright 2019-2022, University of Colorado Boulder

/**
 * EnergySkateParkConstants for the Graphs screen of Energy Skate Park.\
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Range from '../../../dot/js/Range.js';
import energySkatePark from '../energySkatePark.js';

// constants
const TIME_PER_SAMPLE = 1 / 60; // in seconds (assuming 60 fps, one sample per frame)
const RECORDED_TIME = 5; // recording 5 seconds of data
const MAX_SAMPLES = RECORDED_TIME / TIME_PER_SAMPLE;
const GraphsConstants = {
  MAX_SAMPLES: MAX_SAMPLES,
  // maximum recording time for energy vs time plot, in seconds
  MAX_PLOTTED_TIME: 20,
  // determined to be reasonable by inspecting energies at large skater heights - anything
  // above this will be off of the graph
  MAX_PLOTTED_ENERGY: 3000,
  // ranges for the energy plot, when scale changes
  PLOT_RANGES: [new Range(-20000, 20000), new Range(-17500, 17500), new Range(-15000, 15000), new Range(-12500, 12500), new Range(-10000, 10000), new Range(-9000, 9000), new Range(-8000, 8000), new Range(-7000, 7000), new Range(-6000, 6000), new Range(-5000, 5000), new Range(-4000, 4000), new Range(-3000, 3000),
  // default
  new Range(-2500, 2500), new Range(-2000, 2000), new Range(-1500, 1500), new Range(-1000, 1000), new Range(-500, 500), new Range(-200, 200), new Range(-100, 100), new Range(-50, 50)],
  // dimensions for the tracks in the graphs screen, reused and referenced by many components in this screen
  // in model coordinates (meters)
  TRACK_WIDTH: 10,
  TRACK_HEIGHT: 4
};
energySkatePark.register('GraphsConstants', GraphsConstants);
export default GraphsConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsImVuZXJneVNrYXRlUGFyayIsIlRJTUVfUEVSX1NBTVBMRSIsIlJFQ09SREVEX1RJTUUiLCJNQVhfU0FNUExFUyIsIkdyYXBoc0NvbnN0YW50cyIsIk1BWF9QTE9UVEVEX1RJTUUiLCJNQVhfUExPVFRFRF9FTkVSR1kiLCJQTE9UX1JBTkdFUyIsIlRSQUNLX1dJRFRIIiwiVFJBQ0tfSEVJR0hUIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHcmFwaHNDb25zdGFudHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRW5lcmd5U2thdGVQYXJrQ29uc3RhbnRzIGZvciB0aGUgR3JhcGhzIHNjcmVlbiBvZiBFbmVyZ3kgU2thdGUgUGFyay5cXFxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IGVuZXJneVNrYXRlUGFyayBmcm9tICcuLi9lbmVyZ3lTa2F0ZVBhcmsuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFRJTUVfUEVSX1NBTVBMRSA9IDEgLyA2MDsgLy8gaW4gc2Vjb25kcyAoYXNzdW1pbmcgNjAgZnBzLCBvbmUgc2FtcGxlIHBlciBmcmFtZSlcclxuY29uc3QgUkVDT1JERURfVElNRSA9IDU7IC8vIHJlY29yZGluZyA1IHNlY29uZHMgb2YgZGF0YVxyXG5jb25zdCBNQVhfU0FNUExFUyA9IFJFQ09SREVEX1RJTUUgLyBUSU1FX1BFUl9TQU1QTEU7XHJcblxyXG5jb25zdCBHcmFwaHNDb25zdGFudHMgPSB7XHJcbiAgTUFYX1NBTVBMRVM6IE1BWF9TQU1QTEVTLFxyXG5cclxuICAvLyBtYXhpbXVtIHJlY29yZGluZyB0aW1lIGZvciBlbmVyZ3kgdnMgdGltZSBwbG90LCBpbiBzZWNvbmRzXHJcbiAgTUFYX1BMT1RURURfVElNRTogMjAsXHJcblxyXG4gIC8vIGRldGVybWluZWQgdG8gYmUgcmVhc29uYWJsZSBieSBpbnNwZWN0aW5nIGVuZXJnaWVzIGF0IGxhcmdlIHNrYXRlciBoZWlnaHRzIC0gYW55dGhpbmdcclxuICAvLyBhYm92ZSB0aGlzIHdpbGwgYmUgb2ZmIG9mIHRoZSBncmFwaFxyXG4gIE1BWF9QTE9UVEVEX0VORVJHWTogMzAwMCxcclxuXHJcbiAgLy8gcmFuZ2VzIGZvciB0aGUgZW5lcmd5IHBsb3QsIHdoZW4gc2NhbGUgY2hhbmdlc1xyXG4gIFBMT1RfUkFOR0VTOiBbXHJcbiAgICBuZXcgUmFuZ2UoIC0yMDAwMCwgMjAwMDAgKSxcclxuICAgIG5ldyBSYW5nZSggLTE3NTAwLCAxNzUwMCApLFxyXG4gICAgbmV3IFJhbmdlKCAtMTUwMDAsIDE1MDAwICksXHJcbiAgICBuZXcgUmFuZ2UoIC0xMjUwMCwgMTI1MDAgKSxcclxuICAgIG5ldyBSYW5nZSggLTEwMDAwLCAxMDAwMCApLFxyXG4gICAgbmV3IFJhbmdlKCAtOTAwMCwgOTAwMCApLFxyXG4gICAgbmV3IFJhbmdlKCAtODAwMCwgODAwMCApLFxyXG4gICAgbmV3IFJhbmdlKCAtNzAwMCwgNzAwMCApLFxyXG4gICAgbmV3IFJhbmdlKCAtNjAwMCwgNjAwMCApLFxyXG4gICAgbmV3IFJhbmdlKCAtNTAwMCwgNTAwMCApLFxyXG4gICAgbmV3IFJhbmdlKCAtNDAwMCwgNDAwMCApLFxyXG4gICAgbmV3IFJhbmdlKCAtMzAwMCwgMzAwMCApLCAvLyBkZWZhdWx0XHJcbiAgICBuZXcgUmFuZ2UoIC0yNTAwLCAyNTAwICksXHJcbiAgICBuZXcgUmFuZ2UoIC0yMDAwLCAyMDAwICksXHJcbiAgICBuZXcgUmFuZ2UoIC0xNTAwLCAxNTAwICksXHJcbiAgICBuZXcgUmFuZ2UoIC0xMDAwLCAxMDAwICksXHJcbiAgICBuZXcgUmFuZ2UoIC01MDAsIDUwMCApLFxyXG4gICAgbmV3IFJhbmdlKCAtMjAwLCAyMDAgKSxcclxuICAgIG5ldyBSYW5nZSggLTEwMCwgMTAwICksXHJcbiAgICBuZXcgUmFuZ2UoIC01MCwgNTAgKVxyXG4gIF0sXHJcblxyXG4gIC8vIGRpbWVuc2lvbnMgZm9yIHRoZSB0cmFja3MgaW4gdGhlIGdyYXBocyBzY3JlZW4sIHJldXNlZCBhbmQgcmVmZXJlbmNlZCBieSBtYW55IGNvbXBvbmVudHMgaW4gdGhpcyBzY3JlZW5cclxuICAvLyBpbiBtb2RlbCBjb29yZGluYXRlcyAobWV0ZXJzKVxyXG4gIFRSQUNLX1dJRFRIOiAxMCxcclxuICBUUkFDS19IRUlHSFQ6IDRcclxufTtcclxuXHJcbmVuZXJneVNrYXRlUGFyay5yZWdpc3RlciggJ0dyYXBoc0NvbnN0YW50cycsIEdyYXBoc0NvbnN0YW50cyApO1xyXG5leHBvcnQgZGVmYXVsdCBHcmFwaHNDb25zdGFudHM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSwwQkFBMEI7QUFDNUMsT0FBT0MsZUFBZSxNQUFNLHVCQUF1Qjs7QUFFbkQ7QUFDQSxNQUFNQyxlQUFlLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLE1BQU1DLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6QixNQUFNQyxXQUFXLEdBQUdELGFBQWEsR0FBR0QsZUFBZTtBQUVuRCxNQUFNRyxlQUFlLEdBQUc7RUFDdEJELFdBQVcsRUFBRUEsV0FBVztFQUV4QjtFQUNBRSxnQkFBZ0IsRUFBRSxFQUFFO0VBRXBCO0VBQ0E7RUFDQUMsa0JBQWtCLEVBQUUsSUFBSTtFQUV4QjtFQUNBQyxXQUFXLEVBQUUsQ0FDWCxJQUFJUixLQUFLLENBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBTSxDQUFDLEVBQzFCLElBQUlBLEtBQUssQ0FBRSxDQUFDLEtBQUssRUFBRSxLQUFNLENBQUMsRUFDMUIsSUFBSUEsS0FBSyxDQUFFLENBQUMsS0FBSyxFQUFFLEtBQU0sQ0FBQyxFQUMxQixJQUFJQSxLQUFLLENBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBTSxDQUFDLEVBQzFCLElBQUlBLEtBQUssQ0FBRSxDQUFDLEtBQUssRUFBRSxLQUFNLENBQUMsRUFDMUIsSUFBSUEsS0FBSyxDQUFFLENBQUMsSUFBSSxFQUFFLElBQUssQ0FBQyxFQUN4QixJQUFJQSxLQUFLLENBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSyxDQUFDLEVBQ3hCLElBQUlBLEtBQUssQ0FBRSxDQUFDLElBQUksRUFBRSxJQUFLLENBQUMsRUFDeEIsSUFBSUEsS0FBSyxDQUFFLENBQUMsSUFBSSxFQUFFLElBQUssQ0FBQyxFQUN4QixJQUFJQSxLQUFLLENBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSyxDQUFDLEVBQ3hCLElBQUlBLEtBQUssQ0FBRSxDQUFDLElBQUksRUFBRSxJQUFLLENBQUMsRUFDeEIsSUFBSUEsS0FBSyxDQUFFLENBQUMsSUFBSSxFQUFFLElBQUssQ0FBQztFQUFFO0VBQzFCLElBQUlBLEtBQUssQ0FBRSxDQUFDLElBQUksRUFBRSxJQUFLLENBQUMsRUFDeEIsSUFBSUEsS0FBSyxDQUFFLENBQUMsSUFBSSxFQUFFLElBQUssQ0FBQyxFQUN4QixJQUFJQSxLQUFLLENBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSyxDQUFDLEVBQ3hCLElBQUlBLEtBQUssQ0FBRSxDQUFDLElBQUksRUFBRSxJQUFLLENBQUMsRUFDeEIsSUFBSUEsS0FBSyxDQUFFLENBQUMsR0FBRyxFQUFFLEdBQUksQ0FBQyxFQUN0QixJQUFJQSxLQUFLLENBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBSSxDQUFDLEVBQ3RCLElBQUlBLEtBQUssQ0FBRSxDQUFDLEdBQUcsRUFBRSxHQUFJLENBQUMsRUFDdEIsSUFBSUEsS0FBSyxDQUFFLENBQUMsRUFBRSxFQUFFLEVBQUcsQ0FBQyxDQUNyQjtFQUVEO0VBQ0E7RUFDQVMsV0FBVyxFQUFFLEVBQUU7RUFDZkMsWUFBWSxFQUFFO0FBQ2hCLENBQUM7QUFFRFQsZUFBZSxDQUFDVSxRQUFRLENBQUUsaUJBQWlCLEVBQUVOLGVBQWdCLENBQUM7QUFDOUQsZUFBZUEsZUFBZSJ9