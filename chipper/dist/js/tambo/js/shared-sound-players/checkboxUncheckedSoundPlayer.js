// Copyright 2019-2022, University of Colorado Boulder

/**
 * shared sound generator for un-checking a checkbox, uses the singleton pattern
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import checkboxUnchecked_mp3 from '../../sounds/checkboxUnchecked_mp3.js';
import SoundClipPlayer from '../sound-generators/SoundClipPlayer.js';
import tambo from '../tambo.js';

// create the shared sound instance
const checkboxUncheckedSoundPlayer = new SoundClipPlayer(checkboxUnchecked_mp3, {
  soundClipOptions: {
    initialOutputLevel: 0.7
  },
  soundManagerOptions: {
    categoryName: 'user-interface'
  }
});
tambo.register('checkboxUncheckedSoundPlayer', checkboxUncheckedSoundPlayer);
export default checkboxUncheckedSoundPlayer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjaGVja2JveFVuY2hlY2tlZF9tcDMiLCJTb3VuZENsaXBQbGF5ZXIiLCJ0YW1ibyIsImNoZWNrYm94VW5jaGVja2VkU291bmRQbGF5ZXIiLCJzb3VuZENsaXBPcHRpb25zIiwiaW5pdGlhbE91dHB1dExldmVsIiwic291bmRNYW5hZ2VyT3B0aW9ucyIsImNhdGVnb3J5TmFtZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiY2hlY2tib3hVbmNoZWNrZWRTb3VuZFBsYXllci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBzaGFyZWQgc291bmQgZ2VuZXJhdG9yIGZvciB1bi1jaGVja2luZyBhIGNoZWNrYm94LCB1c2VzIHRoZSBzaW5nbGV0b24gcGF0dGVyblxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBjaGVja2JveFVuY2hlY2tlZF9tcDMgZnJvbSAnLi4vLi4vc291bmRzL2NoZWNrYm94VW5jaGVja2VkX21wMy5qcyc7XHJcbmltcG9ydCBTb3VuZENsaXBQbGF5ZXIgZnJvbSAnLi4vc291bmQtZ2VuZXJhdG9ycy9Tb3VuZENsaXBQbGF5ZXIuanMnO1xyXG5pbXBvcnQgdGFtYm8gZnJvbSAnLi4vdGFtYm8uanMnO1xyXG5cclxuLy8gY3JlYXRlIHRoZSBzaGFyZWQgc291bmQgaW5zdGFuY2VcclxuY29uc3QgY2hlY2tib3hVbmNoZWNrZWRTb3VuZFBsYXllciA9IG5ldyBTb3VuZENsaXBQbGF5ZXIoIGNoZWNrYm94VW5jaGVja2VkX21wMywge1xyXG4gIHNvdW5kQ2xpcE9wdGlvbnM6IHsgaW5pdGlhbE91dHB1dExldmVsOiAwLjcgfSxcclxuICBzb3VuZE1hbmFnZXJPcHRpb25zOiB7IGNhdGVnb3J5TmFtZTogJ3VzZXItaW50ZXJmYWNlJyB9XHJcbn0gKTtcclxuXHJcbnRhbWJvLnJlZ2lzdGVyKCAnY2hlY2tib3hVbmNoZWNrZWRTb3VuZFBsYXllcicsIGNoZWNrYm94VW5jaGVja2VkU291bmRQbGF5ZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgY2hlY2tib3hVbmNoZWNrZWRTb3VuZFBsYXllcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EscUJBQXFCLE1BQU0sdUNBQXVDO0FBQ3pFLE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsS0FBSyxNQUFNLGFBQWE7O0FBRS9CO0FBQ0EsTUFBTUMsNEJBQTRCLEdBQUcsSUFBSUYsZUFBZSxDQUFFRCxxQkFBcUIsRUFBRTtFQUMvRUksZ0JBQWdCLEVBQUU7SUFBRUMsa0JBQWtCLEVBQUU7RUFBSSxDQUFDO0VBQzdDQyxtQkFBbUIsRUFBRTtJQUFFQyxZQUFZLEVBQUU7RUFBaUI7QUFDeEQsQ0FBRSxDQUFDO0FBRUhMLEtBQUssQ0FBQ00sUUFBUSxDQUFFLDhCQUE4QixFQUFFTCw0QkFBNkIsQ0FBQztBQUM5RSxlQUFlQSw0QkFBNEIifQ==