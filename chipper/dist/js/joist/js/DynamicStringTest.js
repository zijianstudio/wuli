// Copyright 2022-2023, University of Colorado Boulder

/**
 * DynamicStringTest is a handler for KeyboardEvents. It's used for testing dynamic layout in sims that may not yet
 * have submitted translations, and is enabled via ?stringTest=dynamic. Please see initialize-globals or method
 * handleEvent below for the keys that are handled. See https://github.com/phetsims/chipper/issues/1319 for history.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { localizedStrings } from '../../chipper/js/getStringModule.js';
import Utils from '../../dot/js/Utils.js';
import joist from './joist.js';
const INITIAL_STRING_FACTOR = 1;
const MAX_STRING_FACTOR = 8; // so that the sim and/or browser doesn't lock up when strings get excessively long
const MIN_STRING_FACTOR = 0.01;
const INITIAL_STRIDE = 0;

// Source of 'random' words
const WORD_SOURCE = 'Sometimes when Hippopotomonstrosesquippedaliophobia want lyrics you turn to Shakespeare like ' + 'the following text copied from some work ' + 'To be or not to be that is the question ' + 'Supercalifragilisticexpeladocious tis nobler in the mind to suffer ' + 'The slings and arrows of antidisestablishmentarianism fortune ' + 'Or to take Incomprehensibility against a sea of Floccinaucinihilipilification';
export default class DynamicStringTest {
  // How much to increase or decrease the length of the string. Its value must be > 0.
  stringFactor = INITIAL_STRING_FACTOR;

  // Non-negative integer used to create an index into WORDS.
  stride = INITIAL_STRIDE;

  // Words of different lengths that can be cycled through by changing stride
  static WORDS = WORD_SOURCE.split(' ');

  /**
   * Handles a KeyboardEvent.
   */
  handleEvent(event) {
    if (event.code === 'ArrowLeft') {
      this.halveStrings();
    } else if (event.code === 'ArrowRight') {
      this.doubleStrings();
    } else if (event.code === 'ArrowUp') {
      this.setStride(this.stride + 1);
    } else if (event.code === 'ArrowDown') {
      this.setStride(this.stride - 1);
    } else if (event.code === 'Space') {
      this.reset();
    }
  }

  /**
   * Doubles the length of all strings.
   */
  doubleStrings() {
    this.setStringFactor(Math.min(this.stringFactor * 2, MAX_STRING_FACTOR));
  }

  /**
   * Halves the length of all strings.
   */
  halveStrings() {
    this.setStringFactor(Math.max(this.stringFactor * 0.5, MIN_STRING_FACTOR));
  }

  /**
   * Sets a new stringFactor, and applies that stringFactor to all strings.
   */
  setStringFactor(stringFactor) {
    assert && assert(stringFactor > 0, `stringFactor must be > 0: ${stringFactor}`);
    this.stringFactor = stringFactor;
    console.log(`stringFactor = ${this.stringFactor}`);
    applyToAllStrings(this.stringFactor);
  }

  /**
   * Sets a new stride value, and causes strings to be set to values from the WORDS array.
   */
  setStride(newStride) {
    assert && assert(Number.isInteger(newStride), `newStride must be an integer: ${newStride}`);
    const words = DynamicStringTest.WORDS;

    // Handle wraparound.
    if (newStride > words.length - 1) {
      newStride = 0;
    } else if (newStride < 0) {
      newStride = words.length - 1;
    }
    this.stride = newStride;
    console.log(`stride = ${this.stride}`);

    // Set each string to a word from WORDS.
    localizedStrings.forEach((localizedString, index) => {
      localizedString.property.value = words[(index + this.stride) % words.length];
    });
  }

  /**
   * Resets stride and stringFactor.
   */
  reset() {
    this.setStride(INITIAL_STRIDE);
    this.setStringFactor(INITIAL_STRING_FACTOR); // reset stringFactor last, so that strings are reset to initial values
  }
}

/**
 * Applies stringFactor to all strings.
 */
function applyToAllStrings(stringFactor) {
  localizedStrings.forEach(localizedString => {
    // Restore the string to its initial value.
    localizedString.restoreInitialValue('en');
    if (stringFactor !== 1) {
      // Strip out all RTL (U+202A), LTR (U+202B), and PDF (U+202C) characters from string.
      const strippedString = localizedString.property.value.replace(/[\u202A\u202B\u202C]/g, '');
      localizedString.property.value = applyToString(stringFactor, strippedString);
    }
  });
}

/**
 * Applies stringFactor to one string.
 */
function applyToString(stringFactor, string) {
  assert && assert(stringFactor > 0, `stringFactor must be > 0: ${stringFactor}`);
  if (stringFactor > 1) {
    return doubleString(string, stringFactor);
  } else {
    // Create an array of all placeholders that are present in the string. Each placeholder is a substrings surrounded
    // by 2 sets of curly braces, like '{{value}}'. This will be an empty array if no match is found.
    const placeholders = string.match(/{{(.+?)}}/g) || [];

    // Remove all placeholders from the string.
    const noPlaceholdersString = string.replace(/{{(.+?)}}/g, '');

    // Reduce the length of the string.
    const stringLength = Utils.toFixedNumber(noPlaceholdersString.length * stringFactor + 1, 0);
    const reducedString = noPlaceholdersString.substring(0, stringLength);

    // Append placeholders to the end of the reduced string. This will add nothing if placeholders is empty.
    return reducedString + placeholders.join('');
  }
}

/**
 * Doubles a string n times.
 */
function doubleString(string, n) {
  let growingString = string;
  while (n > 1) {
    growingString += string;
    n -= 1;
  }
  return growingString;
}
joist.register('DynamicStringTest', DynamicStringTest);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJsb2NhbGl6ZWRTdHJpbmdzIiwiVXRpbHMiLCJqb2lzdCIsIklOSVRJQUxfU1RSSU5HX0ZBQ1RPUiIsIk1BWF9TVFJJTkdfRkFDVE9SIiwiTUlOX1NUUklOR19GQUNUT1IiLCJJTklUSUFMX1NUUklERSIsIldPUkRfU09VUkNFIiwiRHluYW1pY1N0cmluZ1Rlc3QiLCJzdHJpbmdGYWN0b3IiLCJzdHJpZGUiLCJXT1JEUyIsInNwbGl0IiwiaGFuZGxlRXZlbnQiLCJldmVudCIsImNvZGUiLCJoYWx2ZVN0cmluZ3MiLCJkb3VibGVTdHJpbmdzIiwic2V0U3RyaWRlIiwicmVzZXQiLCJzZXRTdHJpbmdGYWN0b3IiLCJNYXRoIiwibWluIiwibWF4IiwiYXNzZXJ0IiwiY29uc29sZSIsImxvZyIsImFwcGx5VG9BbGxTdHJpbmdzIiwibmV3U3RyaWRlIiwiTnVtYmVyIiwiaXNJbnRlZ2VyIiwid29yZHMiLCJsZW5ndGgiLCJmb3JFYWNoIiwibG9jYWxpemVkU3RyaW5nIiwiaW5kZXgiLCJwcm9wZXJ0eSIsInZhbHVlIiwicmVzdG9yZUluaXRpYWxWYWx1ZSIsInN0cmlwcGVkU3RyaW5nIiwicmVwbGFjZSIsImFwcGx5VG9TdHJpbmciLCJzdHJpbmciLCJkb3VibGVTdHJpbmciLCJwbGFjZWhvbGRlcnMiLCJtYXRjaCIsIm5vUGxhY2Vob2xkZXJzU3RyaW5nIiwic3RyaW5nTGVuZ3RoIiwidG9GaXhlZE51bWJlciIsInJlZHVjZWRTdHJpbmciLCJzdWJzdHJpbmciLCJqb2luIiwibiIsImdyb3dpbmdTdHJpbmciLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkR5bmFtaWNTdHJpbmdUZXN0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIER5bmFtaWNTdHJpbmdUZXN0IGlzIGEgaGFuZGxlciBmb3IgS2V5Ym9hcmRFdmVudHMuIEl0J3MgdXNlZCBmb3IgdGVzdGluZyBkeW5hbWljIGxheW91dCBpbiBzaW1zIHRoYXQgbWF5IG5vdCB5ZXRcclxuICogaGF2ZSBzdWJtaXR0ZWQgdHJhbnNsYXRpb25zLCBhbmQgaXMgZW5hYmxlZCB2aWEgP3N0cmluZ1Rlc3Q9ZHluYW1pYy4gUGxlYXNlIHNlZSBpbml0aWFsaXplLWdsb2JhbHMgb3IgbWV0aG9kXHJcbiAqIGhhbmRsZUV2ZW50IGJlbG93IGZvciB0aGUga2V5cyB0aGF0IGFyZSBoYW5kbGVkLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzEzMTkgZm9yIGhpc3RvcnkuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgTWFybGEgU2NodWx6IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGxvY2FsaXplZFN0cmluZ3MgfSBmcm9tICcuLi8uLi9jaGlwcGVyL2pzL2dldFN0cmluZ01vZHVsZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgam9pc3QgZnJvbSAnLi9qb2lzdC5qcyc7XHJcblxyXG5jb25zdCBJTklUSUFMX1NUUklOR19GQUNUT1IgPSAxO1xyXG5jb25zdCBNQVhfU1RSSU5HX0ZBQ1RPUiA9IDg7IC8vIHNvIHRoYXQgdGhlIHNpbSBhbmQvb3IgYnJvd3NlciBkb2Vzbid0IGxvY2sgdXAgd2hlbiBzdHJpbmdzIGdldCBleGNlc3NpdmVseSBsb25nXHJcbmNvbnN0IE1JTl9TVFJJTkdfRkFDVE9SID0gMC4wMTtcclxuY29uc3QgSU5JVElBTF9TVFJJREUgPSAwO1xyXG5cclxuLy8gU291cmNlIG9mICdyYW5kb20nIHdvcmRzXHJcbmNvbnN0IFdPUkRfU09VUkNFID0gJ1NvbWV0aW1lcyB3aGVuIEhpcHBvcG90b21vbnN0cm9zZXNxdWlwcGVkYWxpb3Bob2JpYSB3YW50IGx5cmljcyB5b3UgdHVybiB0byBTaGFrZXNwZWFyZSBsaWtlICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICd0aGUgZm9sbG93aW5nIHRleHQgY29waWVkIGZyb20gc29tZSB3b3JrICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICdUbyBiZSBvciBub3QgdG8gYmUgdGhhdCBpcyB0aGUgcXVlc3Rpb24gJyArXHJcbiAgICAgICAgICAgICAgICAgICAgJ1N1cGVyY2FsaWZyYWdpbGlzdGljZXhwZWxhZG9jaW91cyB0aXMgbm9ibGVyIGluIHRoZSBtaW5kIHRvIHN1ZmZlciAnICtcclxuICAgICAgICAgICAgICAgICAgICAnVGhlIHNsaW5ncyBhbmQgYXJyb3dzIG9mIGFudGlkaXNlc3RhYmxpc2htZW50YXJpYW5pc20gZm9ydHVuZSAnICtcclxuICAgICAgICAgICAgICAgICAgICAnT3IgdG8gdGFrZSBJbmNvbXByZWhlbnNpYmlsaXR5IGFnYWluc3QgYSBzZWEgb2YgRmxvY2NpbmF1Y2luaWhpbGlwaWxpZmljYXRpb24nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRHluYW1pY1N0cmluZ1Rlc3Qge1xyXG5cclxuICAvLyBIb3cgbXVjaCB0byBpbmNyZWFzZSBvciBkZWNyZWFzZSB0aGUgbGVuZ3RoIG9mIHRoZSBzdHJpbmcuIEl0cyB2YWx1ZSBtdXN0IGJlID4gMC5cclxuICBwcml2YXRlIHN0cmluZ0ZhY3RvciA9IElOSVRJQUxfU1RSSU5HX0ZBQ1RPUjtcclxuXHJcbiAgLy8gTm9uLW5lZ2F0aXZlIGludGVnZXIgdXNlZCB0byBjcmVhdGUgYW4gaW5kZXggaW50byBXT1JEUy5cclxuICBwcml2YXRlIHN0cmlkZSA9IElOSVRJQUxfU1RSSURFO1xyXG5cclxuICAvLyBXb3JkcyBvZiBkaWZmZXJlbnQgbGVuZ3RocyB0aGF0IGNhbiBiZSBjeWNsZWQgdGhyb3VnaCBieSBjaGFuZ2luZyBzdHJpZGVcclxuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBXT1JEUyA9IFdPUkRfU09VUkNFLnNwbGl0KCAnICcgKTtcclxuXHJcbiAgLyoqXHJcbiAgICogSGFuZGxlcyBhIEtleWJvYXJkRXZlbnQuXHJcbiAgICovXHJcbiAgcHVibGljIGhhbmRsZUV2ZW50KCBldmVudDogS2V5Ym9hcmRFdmVudCApOiB2b2lkIHtcclxuICAgIGlmICggZXZlbnQuY29kZSA9PT0gJ0Fycm93TGVmdCcgKSB7XHJcbiAgICAgIHRoaXMuaGFsdmVTdHJpbmdzKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggZXZlbnQuY29kZSA9PT0gJ0Fycm93UmlnaHQnICkge1xyXG4gICAgICB0aGlzLmRvdWJsZVN0cmluZ3MoKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBldmVudC5jb2RlID09PSAnQXJyb3dVcCcgKSB7XHJcbiAgICAgIHRoaXMuc2V0U3RyaWRlKCB0aGlzLnN0cmlkZSArIDEgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBldmVudC5jb2RlID09PSAnQXJyb3dEb3duJyApIHtcclxuICAgICAgdGhpcy5zZXRTdHJpZGUoIHRoaXMuc3RyaWRlIC0gMSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGV2ZW50LmNvZGUgPT09ICdTcGFjZScgKSB7XHJcbiAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERvdWJsZXMgdGhlIGxlbmd0aCBvZiBhbGwgc3RyaW5ncy5cclxuICAgKi9cclxuICBwcml2YXRlIGRvdWJsZVN0cmluZ3MoKTogdm9pZCB7XHJcbiAgICB0aGlzLnNldFN0cmluZ0ZhY3RvciggTWF0aC5taW4oIHRoaXMuc3RyaW5nRmFjdG9yICogMiwgTUFYX1NUUklOR19GQUNUT1IgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGFsdmVzIHRoZSBsZW5ndGggb2YgYWxsIHN0cmluZ3MuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBoYWx2ZVN0cmluZ3MoKTogdm9pZCB7XHJcbiAgICB0aGlzLnNldFN0cmluZ0ZhY3RvciggTWF0aC5tYXgoIHRoaXMuc3RyaW5nRmFjdG9yICogMC41LCBNSU5fU1RSSU5HX0ZBQ1RPUiApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIGEgbmV3IHN0cmluZ0ZhY3RvciwgYW5kIGFwcGxpZXMgdGhhdCBzdHJpbmdGYWN0b3IgdG8gYWxsIHN0cmluZ3MuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzZXRTdHJpbmdGYWN0b3IoIHN0cmluZ0ZhY3RvcjogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc3RyaW5nRmFjdG9yID4gMCwgYHN0cmluZ0ZhY3RvciBtdXN0IGJlID4gMDogJHtzdHJpbmdGYWN0b3J9YCApO1xyXG5cclxuICAgIHRoaXMuc3RyaW5nRmFjdG9yID0gc3RyaW5nRmFjdG9yO1xyXG4gICAgY29uc29sZS5sb2coIGBzdHJpbmdGYWN0b3IgPSAke3RoaXMuc3RyaW5nRmFjdG9yfWAgKTtcclxuICAgIGFwcGx5VG9BbGxTdHJpbmdzKCB0aGlzLnN0cmluZ0ZhY3RvciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyBhIG5ldyBzdHJpZGUgdmFsdWUsIGFuZCBjYXVzZXMgc3RyaW5ncyB0byBiZSBzZXQgdG8gdmFsdWVzIGZyb20gdGhlIFdPUkRTIGFycmF5LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc2V0U3RyaWRlKCBuZXdTdHJpZGU6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIG5ld1N0cmlkZSApLCBgbmV3U3RyaWRlIG11c3QgYmUgYW4gaW50ZWdlcjogJHtuZXdTdHJpZGV9YCApO1xyXG5cclxuICAgIGNvbnN0IHdvcmRzID0gRHluYW1pY1N0cmluZ1Rlc3QuV09SRFM7XHJcblxyXG4gICAgLy8gSGFuZGxlIHdyYXBhcm91bmQuXHJcbiAgICBpZiAoIG5ld1N0cmlkZSA+IHdvcmRzLmxlbmd0aCAtIDEgKSB7XHJcbiAgICAgIG5ld1N0cmlkZSA9IDA7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggbmV3U3RyaWRlIDwgMCApIHtcclxuICAgICAgbmV3U3RyaWRlID0gd29yZHMubGVuZ3RoIC0gMTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnN0cmlkZSA9IG5ld1N0cmlkZTtcclxuICAgIGNvbnNvbGUubG9nKCBgc3RyaWRlID0gJHt0aGlzLnN0cmlkZX1gICk7XHJcblxyXG4gICAgLy8gU2V0IGVhY2ggc3RyaW5nIHRvIGEgd29yZCBmcm9tIFdPUkRTLlxyXG4gICAgbG9jYWxpemVkU3RyaW5ncy5mb3JFYWNoKCAoIGxvY2FsaXplZFN0cmluZywgaW5kZXggKSA9PiB7XHJcbiAgICAgIGxvY2FsaXplZFN0cmluZy5wcm9wZXJ0eS52YWx1ZSA9IHdvcmRzWyAoIGluZGV4ICsgdGhpcy5zdHJpZGUgKSAlIHdvcmRzLmxlbmd0aCBdO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHN0cmlkZSBhbmQgc3RyaW5nRmFjdG9yLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnNldFN0cmlkZSggSU5JVElBTF9TVFJJREUgKTtcclxuICAgIHRoaXMuc2V0U3RyaW5nRmFjdG9yKCBJTklUSUFMX1NUUklOR19GQUNUT1IgKTsgLy8gcmVzZXQgc3RyaW5nRmFjdG9yIGxhc3QsIHNvIHRoYXQgc3RyaW5ncyBhcmUgcmVzZXQgdG8gaW5pdGlhbCB2YWx1ZXNcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBcHBsaWVzIHN0cmluZ0ZhY3RvciB0byBhbGwgc3RyaW5ncy5cclxuICovXHJcbmZ1bmN0aW9uIGFwcGx5VG9BbGxTdHJpbmdzKCBzdHJpbmdGYWN0b3I6IG51bWJlciApOiB2b2lkIHtcclxuICBsb2NhbGl6ZWRTdHJpbmdzLmZvckVhY2goIGxvY2FsaXplZFN0cmluZyA9PiB7XHJcblxyXG4gICAgLy8gUmVzdG9yZSB0aGUgc3RyaW5nIHRvIGl0cyBpbml0aWFsIHZhbHVlLlxyXG4gICAgbG9jYWxpemVkU3RyaW5nLnJlc3RvcmVJbml0aWFsVmFsdWUoICdlbicgKTtcclxuXHJcbiAgICBpZiAoIHN0cmluZ0ZhY3RvciAhPT0gMSApIHtcclxuXHJcbiAgICAgIC8vIFN0cmlwIG91dCBhbGwgUlRMIChVKzIwMkEpLCBMVFIgKFUrMjAyQiksIGFuZCBQREYgKFUrMjAyQykgY2hhcmFjdGVycyBmcm9tIHN0cmluZy5cclxuICAgICAgY29uc3Qgc3RyaXBwZWRTdHJpbmcgPSBsb2NhbGl6ZWRTdHJpbmcucHJvcGVydHkudmFsdWUucmVwbGFjZSggL1tcXHUyMDJBXFx1MjAyQlxcdTIwMkNdL2csICcnICk7XHJcbiAgICAgIGxvY2FsaXplZFN0cmluZy5wcm9wZXJ0eS52YWx1ZSA9IGFwcGx5VG9TdHJpbmcoIHN0cmluZ0ZhY3Rvciwgc3RyaXBwZWRTdHJpbmcgKTtcclxuICAgIH1cclxuICB9ICk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBcHBsaWVzIHN0cmluZ0ZhY3RvciB0byBvbmUgc3RyaW5nLlxyXG4gKi9cclxuZnVuY3Rpb24gYXBwbHlUb1N0cmluZyggc3RyaW5nRmFjdG9yOiBudW1iZXIsIHN0cmluZzogc3RyaW5nICk6IHN0cmluZyB7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggc3RyaW5nRmFjdG9yID4gMCwgYHN0cmluZ0ZhY3RvciBtdXN0IGJlID4gMDogJHtzdHJpbmdGYWN0b3J9YCApO1xyXG5cclxuICBpZiAoIHN0cmluZ0ZhY3RvciA+IDEgKSB7XHJcbiAgICByZXR1cm4gZG91YmxlU3RyaW5nKCBzdHJpbmcsIHN0cmluZ0ZhY3RvciApO1xyXG4gIH1cclxuICBlbHNlIHtcclxuXHJcbiAgICAvLyBDcmVhdGUgYW4gYXJyYXkgb2YgYWxsIHBsYWNlaG9sZGVycyB0aGF0IGFyZSBwcmVzZW50IGluIHRoZSBzdHJpbmcuIEVhY2ggcGxhY2Vob2xkZXIgaXMgYSBzdWJzdHJpbmdzIHN1cnJvdW5kZWRcclxuICAgIC8vIGJ5IDIgc2V0cyBvZiBjdXJseSBicmFjZXMsIGxpa2UgJ3t7dmFsdWV9fScuIFRoaXMgd2lsbCBiZSBhbiBlbXB0eSBhcnJheSBpZiBubyBtYXRjaCBpcyBmb3VuZC5cclxuICAgIGNvbnN0IHBsYWNlaG9sZGVycyA9IHN0cmluZy5tYXRjaCggL3t7KC4rPyl9fS9nICkgfHwgW107XHJcblxyXG4gICAgLy8gUmVtb3ZlIGFsbCBwbGFjZWhvbGRlcnMgZnJvbSB0aGUgc3RyaW5nLlxyXG4gICAgY29uc3Qgbm9QbGFjZWhvbGRlcnNTdHJpbmcgPSBzdHJpbmcucmVwbGFjZSggL3t7KC4rPyl9fS9nLCAnJyApO1xyXG5cclxuICAgIC8vIFJlZHVjZSB0aGUgbGVuZ3RoIG9mIHRoZSBzdHJpbmcuXHJcbiAgICBjb25zdCBzdHJpbmdMZW5ndGggPSBVdGlscy50b0ZpeGVkTnVtYmVyKCBub1BsYWNlaG9sZGVyc1N0cmluZy5sZW5ndGggKiBzdHJpbmdGYWN0b3IgKyAxLCAwICk7XHJcbiAgICBjb25zdCByZWR1Y2VkU3RyaW5nID0gbm9QbGFjZWhvbGRlcnNTdHJpbmcuc3Vic3RyaW5nKCAwLCBzdHJpbmdMZW5ndGggKTtcclxuXHJcbiAgICAvLyBBcHBlbmQgcGxhY2Vob2xkZXJzIHRvIHRoZSBlbmQgb2YgdGhlIHJlZHVjZWQgc3RyaW5nLiBUaGlzIHdpbGwgYWRkIG5vdGhpbmcgaWYgcGxhY2Vob2xkZXJzIGlzIGVtcHR5LlxyXG4gICAgcmV0dXJuIHJlZHVjZWRTdHJpbmcgKyBwbGFjZWhvbGRlcnMuam9pbiggJycgKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEb3VibGVzIGEgc3RyaW5nIG4gdGltZXMuXHJcbiAqL1xyXG5mdW5jdGlvbiBkb3VibGVTdHJpbmcoIHN0cmluZzogc3RyaW5nLCBuOiBudW1iZXIgKTogc3RyaW5nIHtcclxuICBsZXQgZ3Jvd2luZ1N0cmluZyA9IHN0cmluZztcclxuICB3aGlsZSAoIG4gPiAxICkge1xyXG4gICAgZ3Jvd2luZ1N0cmluZyArPSBzdHJpbmc7XHJcbiAgICBuIC09IDE7XHJcbiAgfVxyXG4gIHJldHVybiBncm93aW5nU3RyaW5nO1xyXG59XHJcblxyXG5qb2lzdC5yZWdpc3RlciggJ0R5bmFtaWNTdHJpbmdUZXN0JywgRHluYW1pY1N0cmluZ1Rlc3QgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxnQkFBZ0IsUUFBUSxxQ0FBcUM7QUFDdEUsT0FBT0MsS0FBSyxNQUFNLHVCQUF1QjtBQUN6QyxPQUFPQyxLQUFLLE1BQU0sWUFBWTtBQUU5QixNQUFNQyxxQkFBcUIsR0FBRyxDQUFDO0FBQy9CLE1BQU1DLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzdCLE1BQU1DLGlCQUFpQixHQUFHLElBQUk7QUFDOUIsTUFBTUMsY0FBYyxHQUFHLENBQUM7O0FBRXhCO0FBQ0EsTUFBTUMsV0FBVyxHQUFHLCtGQUErRixHQUMvRiwyQ0FBMkMsR0FDM0MsMENBQTBDLEdBQzFDLHFFQUFxRSxHQUNyRSxnRUFBZ0UsR0FDaEUsK0VBQStFO0FBRW5HLGVBQWUsTUFBTUMsaUJBQWlCLENBQUM7RUFFckM7RUFDUUMsWUFBWSxHQUFHTixxQkFBcUI7O0VBRTVDO0VBQ1FPLE1BQU0sR0FBR0osY0FBYzs7RUFFL0I7RUFDQSxPQUF3QkssS0FBSyxHQUFHSixXQUFXLENBQUNLLEtBQUssQ0FBRSxHQUFJLENBQUM7O0VBRXhEO0FBQ0Y7QUFDQTtFQUNTQyxXQUFXQSxDQUFFQyxLQUFvQixFQUFTO0lBQy9DLElBQUtBLEtBQUssQ0FBQ0MsSUFBSSxLQUFLLFdBQVcsRUFBRztNQUNoQyxJQUFJLENBQUNDLFlBQVksQ0FBQyxDQUFDO0lBQ3JCLENBQUMsTUFDSSxJQUFLRixLQUFLLENBQUNDLElBQUksS0FBSyxZQUFZLEVBQUc7TUFDdEMsSUFBSSxDQUFDRSxhQUFhLENBQUMsQ0FBQztJQUN0QixDQUFDLE1BQ0ks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