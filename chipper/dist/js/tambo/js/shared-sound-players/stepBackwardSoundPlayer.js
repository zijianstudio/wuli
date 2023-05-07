// Copyright 2019-2022, University of Colorado Boulder

/**
 * shared sound generator for the "step backward" sound, uses singleton pattern
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import stepBack_mp3 from '../../sounds/stepBack_mp3.js';
import SoundClipPlayer from '../sound-generators/SoundClipPlayer.js';
import tambo from '../tambo.js';

// create the shared sound instance
const stepBackwardSoundPlayer = new SoundClipPlayer(stepBack_mp3, {
  soundClipOptions: {
    initialOutputLevel: 0.7
  },
  soundManagerOptions: {
    categoryName: 'user-interface'
  }
});
tambo.register('stepBackwardSoundPlayer', stepBackwardSoundPlayer);
export default stepBackwardSoundPlayer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzdGVwQmFja19tcDMiLCJTb3VuZENsaXBQbGF5ZXIiLCJ0YW1ibyIsInN0ZXBCYWNrd2FyZFNvdW5kUGxheWVyIiwic291bmRDbGlwT3B0aW9ucyIsImluaXRpYWxPdXRwdXRMZXZlbCIsInNvdW5kTWFuYWdlck9wdGlvbnMiLCJjYXRlZ29yeU5hbWUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbInN0ZXBCYWNrd2FyZFNvdW5kUGxheWVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIHNoYXJlZCBzb3VuZCBnZW5lcmF0b3IgZm9yIHRoZSBcInN0ZXAgYmFja3dhcmRcIiBzb3VuZCwgdXNlcyBzaW5nbGV0b24gcGF0dGVyblxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBzdGVwQmFja19tcDMgZnJvbSAnLi4vLi4vc291bmRzL3N0ZXBCYWNrX21wMy5qcyc7XHJcbmltcG9ydCBTb3VuZENsaXBQbGF5ZXIgZnJvbSAnLi4vc291bmQtZ2VuZXJhdG9ycy9Tb3VuZENsaXBQbGF5ZXIuanMnO1xyXG5pbXBvcnQgdGFtYm8gZnJvbSAnLi4vdGFtYm8uanMnO1xyXG5cclxuLy8gY3JlYXRlIHRoZSBzaGFyZWQgc291bmQgaW5zdGFuY2VcclxuY29uc3Qgc3RlcEJhY2t3YXJkU291bmRQbGF5ZXIgPSBuZXcgU291bmRDbGlwUGxheWVyKCBzdGVwQmFja19tcDMsIHtcclxuICBzb3VuZENsaXBPcHRpb25zOiB7IGluaXRpYWxPdXRwdXRMZXZlbDogMC43IH0sXHJcbiAgc291bmRNYW5hZ2VyT3B0aW9uczogeyBjYXRlZ29yeU5hbWU6ICd1c2VyLWludGVyZmFjZScgfVxyXG59ICk7XHJcblxyXG50YW1iby5yZWdpc3RlciggJ3N0ZXBCYWNrd2FyZFNvdW5kUGxheWVyJywgc3RlcEJhY2t3YXJkU291bmRQbGF5ZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgc3RlcEJhY2t3YXJkU291bmRQbGF5ZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFlBQVksTUFBTSw4QkFBOEI7QUFDdkQsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxLQUFLLE1BQU0sYUFBYTs7QUFFL0I7QUFDQSxNQUFNQyx1QkFBdUIsR0FBRyxJQUFJRixlQUFlLENBQUVELFlBQVksRUFBRTtFQUNqRUksZ0JBQWdCLEVBQUU7SUFBRUMsa0JBQWtCLEVBQUU7RUFBSSxDQUFDO0VBQzdDQyxtQkFBbUIsRUFBRTtJQUFFQyxZQUFZLEVBQUU7RUFBaUI7QUFDeEQsQ0FBRSxDQUFDO0FBRUhMLEtBQUssQ0FBQ00sUUFBUSxDQUFFLHlCQUF5QixFQUFFTCx1QkFBd0IsQ0FBQztBQUNwRSxlQUFlQSx1QkFBdUIifQ==