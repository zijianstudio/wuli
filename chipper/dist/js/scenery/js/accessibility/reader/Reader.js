// Copyright 2016-2021, University of Colorado Boulder

/**
 * A reader of text content for accessibility.  This takes a Cursor reads its output.  This prototype
 * uses the Web Speech API as a synthesizer for text to speech.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
 *
 * NOTE: We are no longer actively developing this since we know that users would much rather use their own
 * dedicated software. But we are keeping it around for when we want to explore any other voicing features
 * using the web speech API.
 * @author Jesse Greenberg
 */

import Emitter from '../../../../axon/js/Emitter.js';
import { scenery } from '../../imports.js';
class Reader {
  /**
   * @param {Cursor} cursor
   */
  constructor(cursor) {
    // @public, listen only, emits an event when the synth begins speaking the utterance
    this.speakingStartedEmitter = new Emitter({
      parameters: [{
        valueType: Object
      }]
    });

    // @public, listen only, emits an event when the synth has finished speaking the utterance
    this.speakingEndedEmitter = new Emitter({
      parameters: [{
        valueType: Object
      }]
    });

    // @private, flag for when screen reader is speaking - synth.speaking is unsupported for safari
    this.speaking = false;

    // @private, keep track of the polite utterances to assist with the safari specific bug, see below
    this.politeUtterances = [];

    // windows Chrome needs a temporary workaround to avoid skipping every other utterance
    // TODO: Use platform.js and revisit once platforms fix their bugs
    const userAgent = navigator.userAgent;
    const osWindows = userAgent.match(/Windows/);
    const platSafari = !!(userAgent.match(/Version\/[5-9]\./) && userAgent.match(/Safari\//) && userAgent.match(/AppleWebKit/));
    if (window.speechSynthesis && SpeechSynthesisUtterance && window.speechSynthesis.speak) {
      // @private - the speech synth
      this.synth = window.speechSynthesis;
      cursor.outputUtteranceProperty.link(outputUtterance => {
        // create a new utterance
        const utterThis = new SpeechSynthesisUtterance(outputUtterance.text);
        utterThis.addEventListener('start', event => {
          this.speakingStartedEmitter.emit(outputUtterance);
        });
        utterThis.addEventListener('end', event => {
          this.speakingEndedEmitter.emit(outputUtterance);
        });

        // get the default voice
        let defaultVoice;
        this.synth.getVoices().forEach(voice => {
          if (voice.default) {
            defaultVoice = voice;
          }
        });

        // set the voice, pitch, and rate for the utterance
        utterThis.voice = defaultVoice;
        utterThis.rate = 1.2;

        // TODO: Implement behavior for the various live roles
        // see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
        if (outputUtterance.liveRole === 'assertive' || outputUtterance.liveRole === 'off' || !outputUtterance.liveRole) {
          // empty the queue of polite utterances
          this.politeUtterances = [];
          this.speaking = true;

          // if assertive or off, cancel the current active utterance and begin speaking immediately
          // TODO: This is how most screen readers work, but we will probably want different behavior
          // for sims so multiple assertive updates do not compete.

          // On Windows, the synth must be paused before cancelation and resumed after speaking,
          // or every other utterance will be skipped.
          // NOTE: This only seems to happen on Windows for the default voice?
          if (osWindows) {
            this.synth.pause();
            this.synth.cancel();
            this.synth.speak(utterThis);
            this.synth.resume();
          } else {
            this.synth.cancel();
            this.synth.speak(utterThis);
          }
        } else if (outputUtterance.liveRole === 'polite') {
          // handle the safari specific bug where 'end' and 'start' events are fired on all utterances
          // after they are added to the queue
          if (platSafari) {
            this.politeUtterances.push(utterThis);
            const readPolite = () => {
              this.speaking = true;
              const nextUtterance = this.politeUtterances.shift();
              if (nextUtterance) {
                this.synth.speak(nextUtterance);
              } else {
                this.speaking = false;
              }
            };

            // a small delay will allow the utterance to be read in full, even if
            // added after cancel().
            if (this.speaking) {
              setTimeout(() => {
                readPolite();
              }, 2000); // eslint-disable-line bad-sim-text
            } else {
              this.synth.speak(utterThis);
              // remove from queue
              const index = this.politeUtterances.indexOf(utterThis);
              if (index > 0) {
                this.politeUtterances.splice(index, 1);
              }
            }
          } else {
            // simply add to the queue
            this.synth.speak(utterThis);
          }
        }
      });
    } else {
      cursor.outputUtteranceProperty.link(() => {
        this.speakingStartedEmitter.emit({
          text: 'Sorry! Web Speech API not supported on this platform.'
        });
      });
    }
  }
}
scenery.register('Reader', Reader);
export default Reader;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwic2NlbmVyeSIsIlJlYWRlciIsImNvbnN0cnVjdG9yIiwiY3Vyc29yIiwic3BlYWtpbmdTdGFydGVkRW1pdHRlciIsInBhcmFtZXRlcnMiLCJ2YWx1ZVR5cGUiLCJPYmplY3QiLCJzcGVha2luZ0VuZGVkRW1pdHRlciIsInNwZWFraW5nIiwicG9saXRlVXR0ZXJhbmNlcyIsInVzZXJBZ2VudCIsIm5hdmlnYXRvciIsIm9zV2luZG93cyIsIm1hdGNoIiwicGxhdFNhZmFyaSIsIndpbmRvdyIsInNwZWVjaFN5bnRoZXNpcyIsIlNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZSIsInNwZWFrIiwic3ludGgiLCJvdXRwdXRVdHRlcmFuY2VQcm9wZXJ0eSIsImxpbmsiLCJvdXRwdXRVdHRlcmFuY2UiLCJ1dHRlclRoaXMiLCJ0ZXh0IiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwiZW1pdCIsImRlZmF1bHRWb2ljZSIsImdldFZvaWNlcyIsImZvckVhY2giLCJ2b2ljZSIsImRlZmF1bHQiLCJyYXRlIiwibGl2ZVJvbGUiLCJwYXVzZSIsImNhbmNlbCIsInJlc3VtZSIsInB1c2giLCJyZWFkUG9saXRlIiwibmV4dFV0dGVyYW5jZSIsInNoaWZ0Iiwic2V0VGltZW91dCIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUmVhZGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgcmVhZGVyIG9mIHRleHQgY29udGVudCBmb3IgYWNjZXNzaWJpbGl0eS4gIFRoaXMgdGFrZXMgYSBDdXJzb3IgcmVhZHMgaXRzIG91dHB1dC4gIFRoaXMgcHJvdG90eXBlXHJcbiAqIHVzZXMgdGhlIFdlYiBTcGVlY2ggQVBJIGFzIGEgc3ludGhlc2l6ZXIgZm9yIHRleHQgdG8gc3BlZWNoLlxyXG4gKlxyXG4gKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dlYl9TcGVlY2hfQVBJXHJcbiAqXHJcbiAqIE5PVEU6IFdlIGFyZSBubyBsb25nZXIgYWN0aXZlbHkgZGV2ZWxvcGluZyB0aGlzIHNpbmNlIHdlIGtub3cgdGhhdCB1c2VycyB3b3VsZCBtdWNoIHJhdGhlciB1c2UgdGhlaXIgb3duXHJcbiAqIGRlZGljYXRlZCBzb2Z0d2FyZS4gQnV0IHdlIGFyZSBrZWVwaW5nIGl0IGFyb3VuZCBmb3Igd2hlbiB3ZSB3YW50IHRvIGV4cGxvcmUgYW55IG90aGVyIHZvaWNpbmcgZmVhdHVyZXNcclxuICogdXNpbmcgdGhlIHdlYiBzcGVlY2ggQVBJLlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKi9cclxuXHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCB7IHNjZW5lcnkgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcclxuXHJcbmNsYXNzIFJlYWRlciB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtDdXJzb3J9IGN1cnNvclxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjdXJzb3IgKSB7XHJcblxyXG4gICAgLy8gQHB1YmxpYywgbGlzdGVuIG9ubHksIGVtaXRzIGFuIGV2ZW50IHdoZW4gdGhlIHN5bnRoIGJlZ2lucyBzcGVha2luZyB0aGUgdXR0ZXJhbmNlXHJcbiAgICB0aGlzLnNwZWFraW5nU3RhcnRlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlciggeyBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiBPYmplY3QgfSBdIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljLCBsaXN0ZW4gb25seSwgZW1pdHMgYW4gZXZlbnQgd2hlbiB0aGUgc3ludGggaGFzIGZpbmlzaGVkIHNwZWFraW5nIHRoZSB1dHRlcmFuY2VcclxuICAgIHRoaXMuc3BlYWtpbmdFbmRlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlciggeyBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiBPYmplY3QgfSBdIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSwgZmxhZyBmb3Igd2hlbiBzY3JlZW4gcmVhZGVyIGlzIHNwZWFraW5nIC0gc3ludGguc3BlYWtpbmcgaXMgdW5zdXBwb3J0ZWQgZm9yIHNhZmFyaVxyXG4gICAgdGhpcy5zcGVha2luZyA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEBwcml2YXRlLCBrZWVwIHRyYWNrIG9mIHRoZSBwb2xpdGUgdXR0ZXJhbmNlcyB0byBhc3Npc3Qgd2l0aCB0aGUgc2FmYXJpIHNwZWNpZmljIGJ1Zywgc2VlIGJlbG93XHJcbiAgICB0aGlzLnBvbGl0ZVV0dGVyYW5jZXMgPSBbXTtcclxuXHJcbiAgICAvLyB3aW5kb3dzIENocm9tZSBuZWVkcyBhIHRlbXBvcmFyeSB3b3JrYXJvdW5kIHRvIGF2b2lkIHNraXBwaW5nIGV2ZXJ5IG90aGVyIHV0dGVyYW5jZVxyXG4gICAgLy8gVE9ETzogVXNlIHBsYXRmb3JtLmpzIGFuZCByZXZpc2l0IG9uY2UgcGxhdGZvcm1zIGZpeCB0aGVpciBidWdzXHJcbiAgICBjb25zdCB1c2VyQWdlbnQgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xyXG4gICAgY29uc3Qgb3NXaW5kb3dzID0gdXNlckFnZW50Lm1hdGNoKCAvV2luZG93cy8gKTtcclxuICAgIGNvbnN0IHBsYXRTYWZhcmkgPSAhISggdXNlckFnZW50Lm1hdGNoKCAvVmVyc2lvblxcL1s1LTldXFwuLyApICYmIHVzZXJBZ2VudC5tYXRjaCggL1NhZmFyaVxcLy8gKSAmJiB1c2VyQWdlbnQubWF0Y2goIC9BcHBsZVdlYktpdC8gKSApO1xyXG5cclxuICAgIGlmICggd2luZG93LnNwZWVjaFN5bnRoZXNpcyAmJiBTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2UgJiYgd2luZG93LnNwZWVjaFN5bnRoZXNpcy5zcGVhayApIHtcclxuXHJcbiAgICAgIC8vIEBwcml2YXRlIC0gdGhlIHNwZWVjaCBzeW50aFxyXG4gICAgICB0aGlzLnN5bnRoID0gd2luZG93LnNwZWVjaFN5bnRoZXNpcztcclxuXHJcbiAgICAgIGN1cnNvci5vdXRwdXRVdHRlcmFuY2VQcm9wZXJ0eS5saW5rKCBvdXRwdXRVdHRlcmFuY2UgPT4ge1xyXG5cclxuICAgICAgICAvLyBjcmVhdGUgYSBuZXcgdXR0ZXJhbmNlXHJcbiAgICAgICAgY29uc3QgdXR0ZXJUaGlzID0gbmV3IFNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZSggb3V0cHV0VXR0ZXJhbmNlLnRleHQgKTtcclxuXHJcbiAgICAgICAgdXR0ZXJUaGlzLmFkZEV2ZW50TGlzdGVuZXIoICdzdGFydCcsIGV2ZW50ID0+IHtcclxuICAgICAgICAgIHRoaXMuc3BlYWtpbmdTdGFydGVkRW1pdHRlci5lbWl0KCBvdXRwdXRVdHRlcmFuY2UgKTtcclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIHV0dGVyVGhpcy5hZGRFdmVudExpc3RlbmVyKCAnZW5kJywgZXZlbnQgPT4ge1xyXG4gICAgICAgICAgdGhpcy5zcGVha2luZ0VuZGVkRW1pdHRlci5lbWl0KCBvdXRwdXRVdHRlcmFuY2UgKTtcclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIC8vIGdldCB0aGUgZGVmYXVsdCB2b2ljZVxyXG4gICAgICAgIGxldCBkZWZhdWx0Vm9pY2U7XHJcbiAgICAgICAgdGhpcy5zeW50aC5nZXRWb2ljZXMoKS5mb3JFYWNoKCB2b2ljZSA9PiB7XHJcbiAgICAgICAgICBpZiAoIHZvaWNlLmRlZmF1bHQgKSB7XHJcbiAgICAgICAgICAgIGRlZmF1bHRWb2ljZSA9IHZvaWNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgLy8gc2V0IHRoZSB2b2ljZSwgcGl0Y2gsIGFuZCByYXRlIGZvciB0aGUgdXR0ZXJhbmNlXHJcbiAgICAgICAgdXR0ZXJUaGlzLnZvaWNlID0gZGVmYXVsdFZvaWNlO1xyXG4gICAgICAgIHV0dGVyVGhpcy5yYXRlID0gMS4yO1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBJbXBsZW1lbnQgYmVoYXZpb3IgZm9yIHRoZSB2YXJpb3VzIGxpdmUgcm9sZXNcclxuICAgICAgICAvLyBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQWNjZXNzaWJpbGl0eS9BUklBL0FSSUFfTGl2ZV9SZWdpb25zXHJcbiAgICAgICAgaWYgKCBvdXRwdXRVdHRlcmFuY2UubGl2ZVJvbGUgPT09ICdhc3NlcnRpdmUnIHx8XHJcbiAgICAgICAgICAgICBvdXRwdXRVdHRlcmFuY2UubGl2ZVJvbGUgPT09ICdvZmYnIHx8XHJcbiAgICAgICAgICAgICAhb3V0cHV0VXR0ZXJhbmNlLmxpdmVSb2xlICkge1xyXG5cclxuICAgICAgICAgIC8vIGVtcHR5IHRoZSBxdWV1ZSBvZiBwb2xpdGUgdXR0ZXJhbmNlc1xyXG4gICAgICAgICAgdGhpcy5wb2xpdGVVdHRlcmFuY2VzID0gW107XHJcbiAgICAgICAgICB0aGlzLnNwZWFraW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAvLyBpZiBhc3NlcnRpdmUgb3Igb2ZmLCBjYW5jZWwgdGhlIGN1cnJlbnQgYWN0aXZlIHV0dGVyYW5jZSBhbmQgYmVnaW4gc3BlYWtpbmcgaW1tZWRpYXRlbHlcclxuICAgICAgICAgIC8vIFRPRE86IFRoaXMgaXMgaG93IG1vc3Qgc2NyZWVuIHJlYWRlcnMgd29yaywgYnV0IHdlIHdpbGwgcHJvYmFibHkgd2FudCBkaWZmZXJlbnQgYmVoYXZpb3JcclxuICAgICAgICAgIC8vIGZvciBzaW1zIHNvIG11bHRpcGxlIGFzc2VydGl2ZSB1cGRhdGVzIGRvIG5vdCBjb21wZXRlLlxyXG5cclxuICAgICAgICAgIC8vIE9uIFdpbmRvd3MsIHRoZSBzeW50aCBtdXN0IGJlIHBhdXNlZCBiZWZvcmUgY2FuY2VsYXRpb24gYW5kIHJlc3VtZWQgYWZ0ZXIgc3BlYWtpbmcsXHJcbiAgICAgICAgICAvLyBvciBldmVyeSBvdGhlciB1dHRlcmFuY2Ugd2lsbCBiZSBza2lwcGVkLlxyXG4gICAgICAgICAgLy8gTk9URTogVGhpcyBvbmx5IHNlZW1zIHRvIGhhcHBlbiBvbiBXaW5kb3dzIGZvciB0aGUgZGVmYXVsdCB2b2ljZT9cclxuICAgICAgICAgIGlmICggb3NXaW5kb3dzICkge1xyXG4gICAgICAgICAgICB0aGlzLnN5bnRoLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc3ludGguY2FuY2VsKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc3ludGguc3BlYWsoIHV0dGVyVGhpcyApO1xyXG4gICAgICAgICAgICB0aGlzLnN5bnRoLnJlc3VtZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3ludGguY2FuY2VsKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc3ludGguc3BlYWsoIHV0dGVyVGhpcyApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggb3V0cHV0VXR0ZXJhbmNlLmxpdmVSb2xlID09PSAncG9saXRlJyApIHtcclxuXHJcbiAgICAgICAgICAvLyBoYW5kbGUgdGhlIHNhZmFyaSBzcGVjaWZpYyBidWcgd2hlcmUgJ2VuZCcgYW5kICdzdGFydCcgZXZlbnRzIGFyZSBmaXJlZCBvbiBhbGwgdXR0ZXJhbmNlc1xyXG4gICAgICAgICAgLy8gYWZ0ZXIgdGhleSBhcmUgYWRkZWQgdG8gdGhlIHF1ZXVlXHJcbiAgICAgICAgICBpZiAoIHBsYXRTYWZhcmkgKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9saXRlVXR0ZXJhbmNlcy5wdXNoKCB1dHRlclRoaXMgKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHJlYWRQb2xpdGUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5zcGVha2luZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgY29uc3QgbmV4dFV0dGVyYW5jZSA9IHRoaXMucG9saXRlVXR0ZXJhbmNlcy5zaGlmdCgpO1xyXG4gICAgICAgICAgICAgIGlmICggbmV4dFV0dGVyYW5jZSApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ludGguc3BlYWsoIG5leHRVdHRlcmFuY2UgKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwZWFraW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy8gYSBzbWFsbCBkZWxheSB3aWxsIGFsbG93IHRoZSB1dHRlcmFuY2UgdG8gYmUgcmVhZCBpbiBmdWxsLCBldmVuIGlmXHJcbiAgICAgICAgICAgIC8vIGFkZGVkIGFmdGVyIGNhbmNlbCgpLlxyXG4gICAgICAgICAgICBpZiAoIHRoaXMuc3BlYWtpbmcgKSB7XHJcbiAgICAgICAgICAgICAgc2V0VGltZW91dCggKCkgPT4geyByZWFkUG9saXRlKCk7IH0sIDIwMDAgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWQtc2ltLXRleHRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICB0aGlzLnN5bnRoLnNwZWFrKCB1dHRlclRoaXMgKTtcclxuICAgICAgICAgICAgICAvLyByZW1vdmUgZnJvbSBxdWV1ZVxyXG4gICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5wb2xpdGVVdHRlcmFuY2VzLmluZGV4T2YoIHV0dGVyVGhpcyApO1xyXG4gICAgICAgICAgICAgIGlmICggaW5kZXggPiAwICkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb2xpdGVVdHRlcmFuY2VzLnNwbGljZSggaW5kZXgsIDEgKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBzaW1wbHkgYWRkIHRvIHRoZSBxdWV1ZVxyXG4gICAgICAgICAgICB0aGlzLnN5bnRoLnNwZWFrKCB1dHRlclRoaXMgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBjdXJzb3Iub3V0cHV0VXR0ZXJhbmNlUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc3BlYWtpbmdTdGFydGVkRW1pdHRlci5lbWl0KCB7IHRleHQ6ICdTb3JyeSEgV2ViIFNwZWVjaCBBUEkgbm90IHN1cHBvcnRlZCBvbiB0aGlzIHBsYXRmb3JtLicgfSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnUmVhZGVyJywgUmVhZGVyICk7XHJcbmV4cG9ydCBkZWZhdWx0IFJlYWRlcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLGdDQUFnQztBQUNwRCxTQUFTQyxPQUFPLFFBQVEsa0JBQWtCO0FBRTFDLE1BQU1DLE1BQU0sQ0FBQztFQUNYO0FBQ0Y7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxNQUFNLEVBQUc7SUFFcEI7SUFDQSxJQUFJLENBQUNDLHNCQUFzQixHQUFHLElBQUlMLE9BQU8sQ0FBRTtNQUFFTSxVQUFVLEVBQUUsQ0FBRTtRQUFFQyxTQUFTLEVBQUVDO01BQU8sQ0FBQztJQUFHLENBQUUsQ0FBQzs7SUFFdEY7SUFDQSxJQUFJLENBQUNDLG9CQUFvQixHQUFHLElBQUlULE9BQU8sQ0FBRTtNQUFFTSxVQUFVLEVBQUUsQ0FBRTtRQUFFQyxTQUFTLEVBQUVDO01BQU8sQ0FBQztJQUFHLENBQUUsQ0FBQzs7SUFFcEY7SUFDQSxJQUFJLENBQUNFLFFBQVEsR0FBRyxLQUFLOztJQUVyQjtJQUNBLElBQUksQ0FBQ0MsZ0JBQWdCLEdBQUcsRUFBRTs7SUFFMUI7SUFDQTtJQUNBLE1BQU1DLFNBQVMs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