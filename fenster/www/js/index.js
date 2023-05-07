// Copyright 2022, University of Colorado Boulder

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener( 'deviceready', onDeviceReady, false );

function onDeviceReady() {
  // Cordova is now initialized. Have fun!
  console.log( 'Running cordova-' + cordova.platformId + '@' + cordova.version );

  if ( window.speechSynthesis ) {
    alert( 'Cordova has built-in speech synthesis! You may not need a plugin.' );
  }

  const simFrame = document.getElementById( 'sim-frame' );

  // Assign the implementation of SpeechSynthesis to the parent window, the simulation will try to use this
  // polyfill implementation with utterance-queue/SpeechSynthesisParentPolyfill
  window.SpeechSynthesis = SpeechSynthesis;
  window.SpeechSynthesisUtterance = SpeechSynthesisUtterance;
  window.speechSynthesis = new SpeechSynthesis();

  // Assign the simulation src after polyfills are ready for use. Query parameters request
  simFrame.src = 'quadrilateral_en_phet.html?postMessageOnLoad&speechSynthesisFromParent';
}

/**
 * A polyfill for SpeechSynthesis that implements the feature using a Text to Speech plugin for Cordova. This is
 * an implementation of web SpeechSynthesis, see https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
 */
class SpeechSynthesis {
  constructor() {

    // A boolean value that returns `true` if an utterance is currently in the process of being spoken.
    this.speaking = false;

    // A boolean value that returns true if the SpeechSynthesis object is in a paused state.
    this.paused = false;

    // A boolean value that returns true if the utterance queue contains as-yet-unspoken utterances.
    this.pending = false;

    // A function that is called when the list of available voices changes.
    // TODO: Probably a better way to implement events.
    this.onvoiceschanged = () => {};
  }

  /**
   * Removes all Utterances from the utterance queue and stops speech.
   * @public
   */
  cancel() {

    // According to https://github.com/spasma/cordova-plugin-tts-advanced#readme the way to cancel is
    // to request an empyt string and set the cancel option to true.
    this.pluginSpeak( new SpeechSynthesisUtterance( '' ), true );
  }

  /**
   * Returns a list of SpeechSynthesisVoice objects representing all the available voices on the
   * current device.
   * @public
   */
  getVoices() {

    // TODO: implement voices
    return [];
  }

  /**
   * Puts the SpeechSynthesis object into a paused state.
   * @public
   */
  pause() {
    console.log( 'SpeechSynthesis pause requested but TTS plugin does not support pause/resume.' );
  }

  /**
   * Puts the SpeechSynthesis object into a non-paused state. Resumes it if it was alreadyd paused.
   * @public
   */
  resume() {
    console.log( 'SpeechSynthesis resume requested but TTS plugin does not support pause/resume.' );
  }

  /**
   * @public
   */
  addEventListener( eventType, callback ) {
    if ( eventType === 'voicesChanged' ) {

      // TODO: Add an event listener to when the voices change
    }
    else {
      throw new Error( 'event type not supported, can only use voicesChanged' );
    }
  }

  /**
   * Internal implementation of speak with the TTS plugin, with the ability to cancel previous utterances.
   * @private
   * @param utterance
   * @param withCancel - if true, anything currently being spoken will be cancelled.
   */
  pluginSpeak( utterance, withCancel ) {
    console.log( utterance.text );

    // synchronously set the speaking flag to true
    this.speaking = true;

    // TTS doesn't offer a 'start' event so we do our best by calling start callbacks eagerly.
    utterance.fireStart();

    TTS.speak( {
      text: utterance.text,
      rate: utterance.rate,
      pitch: utterance.pitch,

      // NOTE: TTS plugin does not support volume. It is not adjusted by the sim so this is not a big issue for now.
      // volume: utterance.volume,

      // TODO: Implement the voice somehow
      // identifier: utterance.voice.voiceURI,

      cancel: withCancel
    } ).then( () => {

      // fire the end event on the Utterance
      utterance.fireEnd();

      // speech success, we are no longer speaking
      this.speaking = false;
    }, () => {
      alert( 'TODO! We dont expect to hit this, if we do investigate.' );

      // fire the end event on the Utterance
      utterance.fireError();

      // speech failure? We are probably no longer speaking still
      this.speaking = false;
    } );
  }

  /**
   * Adds an utterance to the utterance queue. It will be spoken when any other utterances are queued before it
   * have been spoken.
   * @public
   * @param {SpeechSynthesisUtterance} utterance
   */
  speak( utterance ) {

    // To match the behavior of Web SpeechSynthesis, utterances do not cancel each other when using the basic speak.
    // SpeechSynthesisAnnouncer will cancel utterances for us.
    this.pluginSpeak( utterance, false );
  }
}

class SpeechSynthesisUtterance {

  /**
   * @param {string} text - the string to speak
   */
  constructor( text ) {

    // @public {string} - Gets and sets the text that will be synthesized when the utterance is spoken.
    this.text = text;

    // @public {string} Gets and sets the language of the utterance.
    this.lang;

    // @public {number} Gets and sets the pitch at which the utterance will be spoken at.
    this.pitch = 1.0;

    // @public {number} Gets and sets the speed at which the utterance will be spoken at.
    this.rate = 1.0;

    // @public {SpeechSynthesisVoice} Gets and sets the voice that will be used to speak the utterance.
    this.voice;

    // @public {number} Gets and sets the volume that the utterance will be spoken at.
    this.volume = 1.0;

    // @private {Map<string, function[]>} Maps string to a collection of functions that are called back when the event
    // happens
    this.listenerMap = new Map();
  }

  /**
   * @public
   */
  addEventListener( eventType, callback ) {
    if ( this.listenerMap.has( eventType ) ) {
      this.listenerMap.get( eventType ).push( callback );
    }
    else {
      this.listenerMap.set( eventType, [ callback ] );
    }
  }

  /**
   * Remove a callback for the eventType.
   * @public
   */
  removeEventListener( eventType, callback ) {

    // Gracefully handle when there is no event type/callback listener. DOM behavior is to do nothing if we try to
    // remove an event listener that does not exist, see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
    const listenerList = this.listenerMap.get( eventType );
    if ( listenerList && listenerList.includes( callback ) ) {
      this.listenerMap.set( eventType, listenerList.filter( listener => listener !== callback ) );
    }
  }

  /**
   * Call back listeners assigned to the provided eventType.
   * @private
   *
   * @param {string} eventType
   */
  fireEvent( eventType ) {
    if ( this.listenerMap.has( eventType ) ) {
      this.listenerMap.get( eventType ).forEach( listener => {
        listener();
      } );
    }
  }

  /**
   * Call start event callbacks.
   * @private
   */
  fireStart() {
    this.fireEvent( 'start' );
  }

  /**
   * Call end event callbacks.
   * @private
   */
  fireEnd() {
    this.fireEvent( 'end' );
  }

  /**
   * Call error event callbacks.
   * @private
   */
  fireError() {
    this.fireEvent( 'error' );
  }
}
