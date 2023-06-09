// Copyright 2020-2022, University of Colorado Boulder

/**
 * shared sound generator for when something encounters a boundary
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import boundaryReached_mp3 from '../../sounds/boundaryReached_mp3.js';
import SoundClipPlayer from '../sound-generators/SoundClipPlayer.js';
import tambo from '../tambo.js';

// create the shared sound instance
const boundaryReachedSoundPlayer = new SoundClipPlayer(boundaryReached_mp3, {
  soundClipOptions: {
    initialOutputLevel: 0.8
  },
  soundManagerOptions: {
    categoryName: 'user-interface'
  }
});
tambo.register('boundaryReachedSoundPlayer', boundaryReachedSoundPlayer);
export default boundaryReachedSoundPlayer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib3VuZGFyeVJlYWNoZWRfbXAzIiwiU291bmRDbGlwUGxheWVyIiwidGFtYm8iLCJib3VuZGFyeVJlYWNoZWRTb3VuZFBsYXllciIsInNvdW5kQ2xpcE9wdGlvbnMiLCJpbml0aWFsT3V0cHV0TGV2ZWwiLCJzb3VuZE1hbmFnZXJPcHRpb25zIiwiY2F0ZWdvcnlOYW1lIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJib3VuZGFyeVJlYWNoZWRTb3VuZFBsYXllci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBzaGFyZWQgc291bmQgZ2VuZXJhdG9yIGZvciB3aGVuIHNvbWV0aGluZyBlbmNvdW50ZXJzIGEgYm91bmRhcnlcclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgYm91bmRhcnlSZWFjaGVkX21wMyBmcm9tICcuLi8uLi9zb3VuZHMvYm91bmRhcnlSZWFjaGVkX21wMy5qcyc7XHJcbmltcG9ydCBTb3VuZENsaXBQbGF5ZXIgZnJvbSAnLi4vc291bmQtZ2VuZXJhdG9ycy9Tb3VuZENsaXBQbGF5ZXIuanMnO1xyXG5pbXBvcnQgdGFtYm8gZnJvbSAnLi4vdGFtYm8uanMnO1xyXG5cclxuLy8gY3JlYXRlIHRoZSBzaGFyZWQgc291bmQgaW5zdGFuY2VcclxuY29uc3QgYm91bmRhcnlSZWFjaGVkU291bmRQbGF5ZXIgPSBuZXcgU291bmRDbGlwUGxheWVyKCBib3VuZGFyeVJlYWNoZWRfbXAzLCB7XHJcbiAgc291bmRDbGlwT3B0aW9uczogeyBpbml0aWFsT3V0cHV0TGV2ZWw6IDAuOCB9LFxyXG4gIHNvdW5kTWFuYWdlck9wdGlvbnM6IHsgY2F0ZWdvcnlOYW1lOiAndXNlci1pbnRlcmZhY2UnIH1cclxufSApO1xyXG5cclxudGFtYm8ucmVnaXN0ZXIoICdib3VuZGFyeVJlYWNoZWRTb3VuZFBsYXllcicsIGJvdW5kYXJ5UmVhY2hlZFNvdW5kUGxheWVyICk7XHJcbmV4cG9ydCBkZWZhdWx0IGJvdW5kYXJ5UmVhY2hlZFNvdW5kUGxheWVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxtQkFBbUIsTUFBTSxxQ0FBcUM7QUFDckUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxLQUFLLE1BQU0sYUFBYTs7QUFFL0I7QUFDQSxNQUFNQywwQkFBMEIsR0FBRyxJQUFJRixlQUFlLENBQUVELG1CQUFtQixFQUFFO0VBQzNFSSxnQkFBZ0IsRUFBRTtJQUFFQyxrQkFBa0IsRUFBRTtFQUFJLENBQUM7RUFDN0NDLG1CQUFtQixFQUFFO0lBQUVDLFlBQVksRUFBRTtFQUFpQjtBQUN4RCxDQUFFLENBQUM7QUFFSEwsS0FBSyxDQUFDTSxRQUFRLENBQUUsNEJBQTRCLEVBQUVMLDBCQUEyQixDQUFDO0FBQzFFLGVBQWVBLDBCQUEwQiJ9