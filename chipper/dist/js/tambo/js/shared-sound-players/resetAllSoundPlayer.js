// Copyright 2019-2022, University of Colorado Boulder

/**
 * shared sound generator for reset all, uses the singleton pattern
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import resetAll_mp3 from '../../sounds/resetAll_mp3.js';
import SoundClipPlayer from '../sound-generators/SoundClipPlayer.js';
import tambo from '../tambo.js';

// create the shared sound instance
const resetAllSoundPlayer = new SoundClipPlayer(resetAll_mp3, {
  soundClipOptions: {
    initialOutputLevel: 0.39,
    enabledDuringPhetioStateSetting: true
  },
  soundManagerOptions: {
    categoryName: 'user-interface'
  }
});
tambo.register('resetAllSoundPlayer', resetAllSoundPlayer);
export default resetAllSoundPlayer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJyZXNldEFsbF9tcDMiLCJTb3VuZENsaXBQbGF5ZXIiLCJ0YW1ibyIsInJlc2V0QWxsU291bmRQbGF5ZXIiLCJzb3VuZENsaXBPcHRpb25zIiwiaW5pdGlhbE91dHB1dExldmVsIiwiZW5hYmxlZER1cmluZ1BoZXRpb1N0YXRlU2V0dGluZyIsInNvdW5kTWFuYWdlck9wdGlvbnMiLCJjYXRlZ29yeU5hbWUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbInJlc2V0QWxsU291bmRQbGF5ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogc2hhcmVkIHNvdW5kIGdlbmVyYXRvciBmb3IgcmVzZXQgYWxsLCB1c2VzIHRoZSBzaW5nbGV0b24gcGF0dGVyblxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCByZXNldEFsbF9tcDMgZnJvbSAnLi4vLi4vc291bmRzL3Jlc2V0QWxsX21wMy5qcyc7XHJcbmltcG9ydCBTb3VuZENsaXBQbGF5ZXIgZnJvbSAnLi4vc291bmQtZ2VuZXJhdG9ycy9Tb3VuZENsaXBQbGF5ZXIuanMnO1xyXG5pbXBvcnQgdGFtYm8gZnJvbSAnLi4vdGFtYm8uanMnO1xyXG5cclxuLy8gY3JlYXRlIHRoZSBzaGFyZWQgc291bmQgaW5zdGFuY2VcclxuY29uc3QgcmVzZXRBbGxTb3VuZFBsYXllciA9IG5ldyBTb3VuZENsaXBQbGF5ZXIoIHJlc2V0QWxsX21wMywge1xyXG4gIHNvdW5kQ2xpcE9wdGlvbnM6IHtcclxuICAgIGluaXRpYWxPdXRwdXRMZXZlbDogMC4zOSxcclxuICAgIGVuYWJsZWREdXJpbmdQaGV0aW9TdGF0ZVNldHRpbmc6IHRydWVcclxuICB9LFxyXG4gIHNvdW5kTWFuYWdlck9wdGlvbnM6IHsgY2F0ZWdvcnlOYW1lOiAndXNlci1pbnRlcmZhY2UnIH1cclxufSApO1xyXG5cclxudGFtYm8ucmVnaXN0ZXIoICdyZXNldEFsbFNvdW5kUGxheWVyJywgcmVzZXRBbGxTb3VuZFBsYXllciApO1xyXG5leHBvcnQgZGVmYXVsdCByZXNldEFsbFNvdW5kUGxheWVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxZQUFZLE1BQU0sOEJBQThCO0FBQ3ZELE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsS0FBSyxNQUFNLGFBQWE7O0FBRS9CO0FBQ0EsTUFBTUMsbUJBQW1CLEdBQUcsSUFBSUYsZUFBZSxDQUFFRCxZQUFZLEVBQUU7RUFDN0RJLGdCQUFnQixFQUFFO0lBQ2hCQyxrQkFBa0IsRUFBRSxJQUFJO0lBQ3hCQywrQkFBK0IsRUFBRTtFQUNuQyxDQUFDO0VBQ0RDLG1CQUFtQixFQUFFO0lBQUVDLFlBQVksRUFBRTtFQUFpQjtBQUN4RCxDQUFFLENBQUM7QUFFSE4sS0FBSyxDQUFDTyxRQUFRLENBQUUscUJBQXFCLEVBQUVOLG1CQUFvQixDQUFDO0FBQzVELGVBQWVBLG1CQUFtQiJ9