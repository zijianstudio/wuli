// Copyright 2019-2022, University of Colorado Boulder

/**
 * shared sound generator for picking something up, uses the singleton pattern
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import grab2_mp3 from '../../sounds/grab2_mp3.js';
import SoundClipPlayer from '../sound-generators/SoundClipPlayer.js';
import tambo from '../tambo.js';

// create the shared sound instance
const grabSoundPlayer = new SoundClipPlayer(grab2_mp3, {
  soundClipOptions: {
    initialOutputLevel: 0.7
  },
  soundManagerOptions: {
    categoryName: 'user-interface'
  }
});
tambo.register('grabSoundPlayer', grabSoundPlayer);
export default grabSoundPlayer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJncmFiMl9tcDMiLCJTb3VuZENsaXBQbGF5ZXIiLCJ0YW1ibyIsImdyYWJTb3VuZFBsYXllciIsInNvdW5kQ2xpcE9wdGlvbnMiLCJpbml0aWFsT3V0cHV0TGV2ZWwiLCJzb3VuZE1hbmFnZXJPcHRpb25zIiwiY2F0ZWdvcnlOYW1lIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJncmFiU291bmRQbGF5ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogc2hhcmVkIHNvdW5kIGdlbmVyYXRvciBmb3IgcGlja2luZyBzb21ldGhpbmcgdXAsIHVzZXMgdGhlIHNpbmdsZXRvbiBwYXR0ZXJuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IGdyYWIyX21wMyBmcm9tICcuLi8uLi9zb3VuZHMvZ3JhYjJfbXAzLmpzJztcclxuaW1wb3J0IFNvdW5kQ2xpcFBsYXllciBmcm9tICcuLi9zb3VuZC1nZW5lcmF0b3JzL1NvdW5kQ2xpcFBsYXllci5qcyc7XHJcbmltcG9ydCB0YW1ibyBmcm9tICcuLi90YW1iby5qcyc7XHJcblxyXG4vLyBjcmVhdGUgdGhlIHNoYXJlZCBzb3VuZCBpbnN0YW5jZVxyXG5jb25zdCBncmFiU291bmRQbGF5ZXIgPSBuZXcgU291bmRDbGlwUGxheWVyKCBncmFiMl9tcDMsIHtcclxuICBzb3VuZENsaXBPcHRpb25zOiB7IGluaXRpYWxPdXRwdXRMZXZlbDogMC43IH0sXHJcbiAgc291bmRNYW5hZ2VyT3B0aW9uczogeyBjYXRlZ29yeU5hbWU6ICd1c2VyLWludGVyZmFjZScgfVxyXG59ICk7XHJcblxyXG50YW1iby5yZWdpc3RlciggJ2dyYWJTb3VuZFBsYXllcicsIGdyYWJTb3VuZFBsYXllciApO1xyXG5leHBvcnQgZGVmYXVsdCBncmFiU291bmRQbGF5ZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSwyQkFBMkI7QUFDakQsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxLQUFLLE1BQU0sYUFBYTs7QUFFL0I7QUFDQSxNQUFNQyxlQUFlLEdBQUcsSUFBSUYsZUFBZSxDQUFFRCxTQUFTLEVBQUU7RUFDdERJLGdCQUFnQixFQUFFO0lBQUVDLGtCQUFrQixFQUFFO0VBQUksQ0FBQztFQUM3Q0MsbUJBQW1CLEVBQUU7SUFBRUMsWUFBWSxFQUFFO0VBQWlCO0FBQ3hELENBQUUsQ0FBQztBQUVITCxLQUFLLENBQUNNLFFBQVEsQ0FBRSxpQkFBaUIsRUFBRUwsZUFBZ0IsQ0FBQztBQUNwRCxlQUFlQSxlQUFlIn0=