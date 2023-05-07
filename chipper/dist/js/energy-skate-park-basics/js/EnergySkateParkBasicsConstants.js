// Copyright 2013-2020, University of Colorado Boulder

/**
 * EnergySkateParkBasicsConstants specific to Energy Skate Park: Basics.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Dimension2 from '../../dot/js/Dimension2.js';
import Range from '../../dot/js/Range.js';
import EnergySkateParkConstants from '../../energy-skate-park/js/common/EnergySkateParkConstants.js';
import energySkateParkBasics from './energySkateParkBasics.js';
const minMass = 25; // kg
const maxMass = 100;
const defaultMass = (minMass + maxMass) / 2;
const massRange = new Range(minMass, maxMass);

// REVIEW: This should be prefixed with teh simulation name: EnergySkateParkBasicsConstants
const EnergySkateParkBasicsConstants = {
  SLIDER_OPTIONS: {
    thumbSize: new Dimension2(13, 30),
    tickLabelSpacing: 0,
    majorTickLength: 15
  },
  // threshold for allowing thermal energy to be cleared, generally used in a function with the graph height scale
  // factor to determine whether thermal energy can be cleared
  ALLOW_THERMAL_CLEAR_BASIS: 1E-6,
  DEFAULT_MASS: (minMass + maxMass) / 2,
  MIN_MASS: minMass,
  MAX_MASS: maxMass,
  MASS_RANGE: new Range(minMass, maxMass),
  // all options that are consistent for models in the basics simulation - this object should be used by
  // everything extending the main simulation
  BASICS_MODEL_OPTIONS: {
    skaterOptions: {
      defaultMass: defaultMass,
      massRange: massRange
    },
    defaultSpeedValueVisible: false,
    // by default, most basics screens have half value of friction on startup
    defaultFriction: (EnergySkateParkConstants.MAX_FRICTION - EnergySkateParkConstants.MIN_FRICTION) / 2
  }
};
energySkateParkBasics.register('EnergySkateParkBasicsConstants', EnergySkateParkBasicsConstants);
export default EnergySkateParkBasicsConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiUmFuZ2UiLCJFbmVyZ3lTa2F0ZVBhcmtDb25zdGFudHMiLCJlbmVyZ3lTa2F0ZVBhcmtCYXNpY3MiLCJtaW5NYXNzIiwibWF4TWFzcyIsImRlZmF1bHRNYXNzIiwibWFzc1JhbmdlIiwiRW5lcmd5U2thdGVQYXJrQmFzaWNzQ29uc3RhbnRzIiwiU0xJREVSX09QVElPTlMiLCJ0aHVtYlNpemUiLCJ0aWNrTGFiZWxTcGFjaW5nIiwibWFqb3JUaWNrTGVuZ3RoIiwiQUxMT1dfVEhFUk1BTF9DTEVBUl9CQVNJUyIsIkRFRkFVTFRfTUFTUyIsIk1JTl9NQVNTIiwiTUFYX01BU1MiLCJNQVNTX1JBTkdFIiwiQkFTSUNTX01PREVMX09QVElPTlMiLCJza2F0ZXJPcHRpb25zIiwiZGVmYXVsdFNwZWVkVmFsdWVWaXNpYmxlIiwiZGVmYXVsdEZyaWN0aW9uIiwiTUFYX0ZSSUNUSU9OIiwiTUlOX0ZSSUNUSU9OIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFbmVyZ3lTa2F0ZVBhcmtCYXNpY3NDb25zdGFudHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRW5lcmd5U2thdGVQYXJrQmFzaWNzQ29uc3RhbnRzIHNwZWNpZmljIHRvIEVuZXJneSBTa2F0ZSBQYXJrOiBCYXNpY3MuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IEVuZXJneVNrYXRlUGFya0NvbnN0YW50cyBmcm9tICcuLi8uLi9lbmVyZ3ktc2thdGUtcGFyay9qcy9jb21tb24vRW5lcmd5U2thdGVQYXJrQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IGVuZXJneVNrYXRlUGFya0Jhc2ljcyBmcm9tICcuL2VuZXJneVNrYXRlUGFya0Jhc2ljcy5qcyc7XHJcblxyXG5jb25zdCBtaW5NYXNzID0gMjU7IC8vIGtnXHJcbmNvbnN0IG1heE1hc3MgPSAxMDA7XHJcbmNvbnN0IGRlZmF1bHRNYXNzID0gKCBtaW5NYXNzICsgbWF4TWFzcyApIC8gMjtcclxuY29uc3QgbWFzc1JhbmdlID0gbmV3IFJhbmdlKCBtaW5NYXNzLCBtYXhNYXNzICk7XHJcblxyXG4vLyBSRVZJRVc6IFRoaXMgc2hvdWxkIGJlIHByZWZpeGVkIHdpdGggdGVoIHNpbXVsYXRpb24gbmFtZTogRW5lcmd5U2thdGVQYXJrQmFzaWNzQ29uc3RhbnRzXHJcbmNvbnN0IEVuZXJneVNrYXRlUGFya0Jhc2ljc0NvbnN0YW50cyA9IHtcclxuICBTTElERVJfT1BUSU9OUzoge1xyXG4gICAgdGh1bWJTaXplOiBuZXcgRGltZW5zaW9uMiggMTMsIDMwICksXHJcbiAgICB0aWNrTGFiZWxTcGFjaW5nOiAwLFxyXG4gICAgbWFqb3JUaWNrTGVuZ3RoOiAxNVxyXG4gIH0sXHJcblxyXG4gIC8vIHRocmVzaG9sZCBmb3IgYWxsb3dpbmcgdGhlcm1hbCBlbmVyZ3kgdG8gYmUgY2xlYXJlZCwgZ2VuZXJhbGx5IHVzZWQgaW4gYSBmdW5jdGlvbiB3aXRoIHRoZSBncmFwaCBoZWlnaHQgc2NhbGVcclxuICAvLyBmYWN0b3IgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlcm1hbCBlbmVyZ3kgY2FuIGJlIGNsZWFyZWRcclxuICBBTExPV19USEVSTUFMX0NMRUFSX0JBU0lTOiAxRS02LFxyXG5cclxuICBERUZBVUxUX01BU1M6ICggbWluTWFzcyArIG1heE1hc3MgKSAvIDIsXHJcbiAgTUlOX01BU1M6IG1pbk1hc3MsXHJcbiAgTUFYX01BU1M6IG1heE1hc3MsXHJcbiAgTUFTU19SQU5HRTogbmV3IFJhbmdlKCBtaW5NYXNzLCBtYXhNYXNzICksXHJcblxyXG4gIC8vIGFsbCBvcHRpb25zIHRoYXQgYXJlIGNvbnNpc3RlbnQgZm9yIG1vZGVscyBpbiB0aGUgYmFzaWNzIHNpbXVsYXRpb24gLSB0aGlzIG9iamVjdCBzaG91bGQgYmUgdXNlZCBieVxyXG4gIC8vIGV2ZXJ5dGhpbmcgZXh0ZW5kaW5nIHRoZSBtYWluIHNpbXVsYXRpb25cclxuICBCQVNJQ1NfTU9ERUxfT1BUSU9OUzoge1xyXG4gICAgc2thdGVyT3B0aW9uczoge1xyXG4gICAgICBkZWZhdWx0TWFzczogZGVmYXVsdE1hc3MsXHJcbiAgICAgIG1hc3NSYW5nZTogbWFzc1JhbmdlXHJcbiAgICB9LFxyXG4gICAgZGVmYXVsdFNwZWVkVmFsdWVWaXNpYmxlOiBmYWxzZSxcclxuXHJcbiAgICAvLyBieSBkZWZhdWx0LCBtb3N0IGJhc2ljcyBzY3JlZW5zIGhhdmUgaGFsZiB2YWx1ZSBvZiBmcmljdGlvbiBvbiBzdGFydHVwXHJcbiAgICBkZWZhdWx0RnJpY3Rpb246ICggRW5lcmd5U2thdGVQYXJrQ29uc3RhbnRzLk1BWF9GUklDVElPTiAtIEVuZXJneVNrYXRlUGFya0NvbnN0YW50cy5NSU5fRlJJQ1RJT04gKSAvIDJcclxuICB9XHJcbn07XHJcblxyXG5lbmVyZ3lTa2F0ZVBhcmtCYXNpY3MucmVnaXN0ZXIoICdFbmVyZ3lTa2F0ZVBhcmtCYXNpY3NDb25zdGFudHMnLCBFbmVyZ3lTa2F0ZVBhcmtCYXNpY3NDb25zdGFudHMgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEVuZXJneVNrYXRlUGFya0Jhc2ljc0NvbnN0YW50czsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLDRCQUE0QjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sdUJBQXVCO0FBQ3pDLE9BQU9DLHdCQUF3QixNQUFNLCtEQUErRDtBQUNwRyxPQUFPQyxxQkFBcUIsTUFBTSw0QkFBNEI7QUFFOUQsTUFBTUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLE1BQU1DLE9BQU8sR0FBRyxHQUFHO0FBQ25CLE1BQU1DLFdBQVcsR0FBRyxDQUFFRixPQUFPLEdBQUdDLE9BQU8sSUFBSyxDQUFDO0FBQzdDLE1BQU1FLFNBQVMsR0FBRyxJQUFJTixLQUFLLENBQUVHLE9BQU8sRUFBRUMsT0FBUSxDQUFDOztBQUUvQztBQUNBLE1BQU1HLDhCQUE4QixHQUFHO0VBQ3JDQyxjQUFjLEVBQUU7SUFDZEMsU0FBUyxFQUFFLElBQUlWLFVBQVUsQ0FBRSxFQUFFLEVBQUUsRUFBRyxDQUFDO0lBQ25DVyxnQkFBZ0IsRUFBRSxDQUFDO0lBQ25CQyxlQUFlLEVBQUU7RUFDbkIsQ0FBQztFQUVEO0VBQ0E7RUFDQUMseUJBQXlCLEVBQUUsSUFBSTtFQUUvQkMsWUFBWSxFQUFFLENBQUVWLE9BQU8sR0FBR0MsT0FBTyxJQUFLLENBQUM7RUFDdkNVLFFBQVEsRUFBRVgsT0FBTztFQUNqQlksUUFBUSxFQUFFWCxPQUFPO0VBQ2pCWSxVQUFVLEVBQUUsSUFBSWhCLEtBQUssQ0FBRUcsT0FBTyxFQUFFQyxPQUFRLENBQUM7RUFFekM7RUFDQTtFQUNBYSxvQkFBb0IsRUFBRTtJQUNwQkMsYUFBYSxFQUFFO01BQ2JiLFdBQVcsRUFBRUEsV0FBVztNQUN4QkMsU0FBUyxFQUFFQTtJQUNiLENBQUM7SUFDRGEsd0JBQXdCLEVBQUUsS0FBSztJQUUvQjtJQUNBQyxlQUFlLEVBQUUsQ0FBRW5CLHdCQUF3QixDQUFDb0IsWUFBWSxHQUFHcEIsd0JBQXdCLENBQUNxQixZQUFZLElBQUs7RUFDdkc7QUFDRixDQUFDO0FBRURwQixxQkFBcUIsQ0FBQ3FCLFFBQVEsQ0FBRSxnQ0FBZ0MsRUFBRWhCLDhCQUErQixDQUFDO0FBRWxHLGVBQWVBLDhCQUE4QiJ9