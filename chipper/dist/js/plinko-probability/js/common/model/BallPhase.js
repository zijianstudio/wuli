// Copyright 2016-2020, University of Colorado Boulder

/**
 * Describes "phases" of a ball, on its journey from the hopper to a bin.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import plinkoProbability from '../../plinkoProbability.js';
const BallPhase = {
  INITIAL: 0,
  // ball has left the hopper
  FALLING: 1,
  // ball is falling within bounds of board
  EXITED: 2,
  // ball has exited the lower bounds of board and entered a bin
  COLLECTED: 3 // ball has landed in final position
};

plinkoProbability.register('BallPhase', BallPhase);

// make enum immutable, without the runtime penalty in production code
if (assert) {
  Object.freeze(BallPhase);
}
export default BallPhase;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwbGlua29Qcm9iYWJpbGl0eSIsIkJhbGxQaGFzZSIsIklOSVRJQUwiLCJGQUxMSU5HIiwiRVhJVEVEIiwiQ09MTEVDVEVEIiwicmVnaXN0ZXIiLCJhc3NlcnQiLCJPYmplY3QiLCJmcmVlemUiXSwic291cmNlcyI6WyJCYWxsUGhhc2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGVzY3JpYmVzIFwicGhhc2VzXCIgb2YgYSBiYWxsLCBvbiBpdHMgam91cm5leSBmcm9tIHRoZSBob3BwZXIgdG8gYSBiaW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IHBsaW5rb1Byb2JhYmlsaXR5IGZyb20gJy4uLy4uL3BsaW5rb1Byb2JhYmlsaXR5LmpzJztcclxuXHJcbmNvbnN0IEJhbGxQaGFzZSA9IHtcclxuICBJTklUSUFMOiAwLCAgIC8vIGJhbGwgaGFzIGxlZnQgdGhlIGhvcHBlclxyXG4gIEZBTExJTkc6IDEsICAgLy8gYmFsbCBpcyBmYWxsaW5nIHdpdGhpbiBib3VuZHMgb2YgYm9hcmRcclxuICBFWElURUQ6IDIsICAgIC8vIGJhbGwgaGFzIGV4aXRlZCB0aGUgbG93ZXIgYm91bmRzIG9mIGJvYXJkIGFuZCBlbnRlcmVkIGEgYmluXHJcbiAgQ09MTEVDVEVEOiAzICAvLyBiYWxsIGhhcyBsYW5kZWQgaW4gZmluYWwgcG9zaXRpb25cclxufTtcclxuXHJcbnBsaW5rb1Byb2JhYmlsaXR5LnJlZ2lzdGVyKCAnQmFsbFBoYXNlJywgQmFsbFBoYXNlICk7XHJcblxyXG4vLyBtYWtlIGVudW0gaW1tdXRhYmxlLCB3aXRob3V0IHRoZSBydW50aW1lIHBlbmFsdHkgaW4gcHJvZHVjdGlvbiBjb2RlXHJcbmlmICggYXNzZXJ0ICkgeyBPYmplY3QuZnJlZXplKCBCYWxsUGhhc2UgKTsgfVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQmFsbFBoYXNlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxpQkFBaUIsTUFBTSw0QkFBNEI7QUFFMUQsTUFBTUMsU0FBUyxHQUFHO0VBQ2hCQyxPQUFPLEVBQUUsQ0FBQztFQUFJO0VBQ2RDLE9BQU8sRUFBRSxDQUFDO0VBQUk7RUFDZEMsTUFBTSxFQUFFLENBQUM7RUFBSztFQUNkQyxTQUFTLEVBQUUsQ0FBQyxDQUFFO0FBQ2hCLENBQUM7O0FBRURMLGlCQUFpQixDQUFDTSxRQUFRLENBQUUsV0FBVyxFQUFFTCxTQUFVLENBQUM7O0FBRXBEO0FBQ0EsSUFBS00sTUFBTSxFQUFHO0VBQUVDLE1BQU0sQ0FBQ0MsTUFBTSxDQUFFUixTQUFVLENBQUM7QUFBRTtBQUU1QyxlQUFlQSxTQUFTIn0=