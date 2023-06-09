// Copyright 2018-2022, University of Colorado Boulder

/**
 * `phetAudioContext` is a singleton instance of a Web Audio context that is used for all Web Audio interaction within
 * a sim.
 *
 * @author John Blanco
 */

import tambo from './tambo.js';

// create a Web Audio context
let phetAudioContext;
if (window.AudioContext) {
  phetAudioContext = new window.AudioContext();
} else if (window.webkitAudioContext) {
  phetAudioContext = new window.webkitAudioContext(); // eslint-disable-line new-cap
} else {
  // The browser doesn't support creating an audio context, create an empty object.  Failures will occur the first time
  // any code tries to do anything with the audio context.
  phetAudioContext = {};
  console.error('error: this browser does not support Web Audio');
}

// register for phet-io
tambo.register('phetAudioContext', phetAudioContext);
export default phetAudioContext;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0YW1ibyIsInBoZXRBdWRpb0NvbnRleHQiLCJ3aW5kb3ciLCJBdWRpb0NvbnRleHQiLCJ3ZWJraXRBdWRpb0NvbnRleHQiLCJjb25zb2xlIiwiZXJyb3IiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbInBoZXRBdWRpb0NvbnRleHQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogYHBoZXRBdWRpb0NvbnRleHRgIGlzIGEgc2luZ2xldG9uIGluc3RhbmNlIG9mIGEgV2ViIEF1ZGlvIGNvbnRleHQgdGhhdCBpcyB1c2VkIGZvciBhbGwgV2ViIEF1ZGlvIGludGVyYWN0aW9uIHdpdGhpblxyXG4gKiBhIHNpbS5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xyXG5pbXBvcnQgdGFtYm8gZnJvbSAnLi90YW1iby5qcyc7XHJcblxyXG4vLyBjcmVhdGUgYSBXZWIgQXVkaW8gY29udGV4dFxyXG5sZXQgcGhldEF1ZGlvQ29udGV4dDogQXVkaW9Db250ZXh0O1xyXG5pZiAoIHdpbmRvdy5BdWRpb0NvbnRleHQgKSB7XHJcbiAgcGhldEF1ZGlvQ29udGV4dCA9IG5ldyB3aW5kb3cuQXVkaW9Db250ZXh0KCk7XHJcbn1cclxuZWxzZSBpZiAoICggd2luZG93IGFzIEludGVudGlvbmFsQW55ICkud2Via2l0QXVkaW9Db250ZXh0ICkge1xyXG4gIHBoZXRBdWRpb0NvbnRleHQgPSBuZXcgKCAoIHdpbmRvdyBhcyBJbnRlbnRpb25hbEFueSApLndlYmtpdEF1ZGlvQ29udGV4dCApKCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbmV3LWNhcFxyXG59XHJcbmVsc2Uge1xyXG5cclxuICAvLyBUaGUgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgY3JlYXRpbmcgYW4gYXVkaW8gY29udGV4dCwgY3JlYXRlIGFuIGVtcHR5IG9iamVjdC4gIEZhaWx1cmVzIHdpbGwgb2NjdXIgdGhlIGZpcnN0IHRpbWVcclxuICAvLyBhbnkgY29kZSB0cmllcyB0byBkbyBhbnl0aGluZyB3aXRoIHRoZSBhdWRpbyBjb250ZXh0LlxyXG4gIHBoZXRBdWRpb0NvbnRleHQgPSB7fSBhcyBBdWRpb0NvbnRleHQ7XHJcbiAgY29uc29sZS5lcnJvciggJ2Vycm9yOiB0aGlzIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBXZWIgQXVkaW8nICk7XHJcbn1cclxuXHJcbi8vIHJlZ2lzdGVyIGZvciBwaGV0LWlvXHJcbnRhbWJvLnJlZ2lzdGVyKCAncGhldEF1ZGlvQ29udGV4dCcsIHBoZXRBdWRpb0NvbnRleHQgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHBoZXRBdWRpb0NvbnRleHQ7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsS0FBSyxNQUFNLFlBQVk7O0FBRTlCO0FBQ0EsSUFBSUMsZ0JBQThCO0FBQ2xDLElBQUtDLE1BQU0sQ0FBQ0MsWUFBWSxFQUFHO0VBQ3pCRixnQkFBZ0IsR0FBRyxJQUFJQyxNQUFNLENBQUNDLFlBQVksQ0FBQyxDQUFDO0FBQzlDLENBQUMsTUFDSSxJQUFPRCxNQUFNLENBQXFCRSxrQkFBa0IsRUFBRztFQUMxREgsZ0JBQWdCLEdBQUcsSUFBUUMsTUFBTSxDQUFxQkUsa0JBQWtCLENBQUcsQ0FBQyxDQUFDLENBQUM7QUFDaEYsQ0FBQyxNQUNJO0VBRUg7RUFDQTtFQUNBSCxnQkFBZ0IsR0FBRyxDQUFDLENBQWlCO0VBQ3JDSSxPQUFPLENBQUNDLEtBQUssQ0FBRSxnREFBaUQsQ0FBQztBQUNuRTs7QUFFQTtBQUNBTixLQUFLLENBQUNPLFFBQVEsQ0FBRSxrQkFBa0IsRUFBRU4sZ0JBQWlCLENBQUM7QUFFdEQsZUFBZUEsZ0JBQWdCIn0=