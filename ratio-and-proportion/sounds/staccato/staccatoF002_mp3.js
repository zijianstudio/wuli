/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAABvBVHjT2ABEhiytLNMAACAljCHGBnDDSxKBcGg0FklYhYh5L3NgQwCYNy3+nYln5UAmFcZwYONr7Hb+MLKF34nh/l3o9Yfl1rAAATHdcxQYyEcIam/ZS+UiJOVoR1KUMp/AvPDYIAVBwA4HgOlALiwuEgHvKIqeHVRlJOFLupomsQCAOHXqM5AXajTqK55gEIMxpJuOQ//syxAOASIRXZb2HgDEBjer1jTwmAJzv6u1+Ts2TrCtNgseMW+a9KkBctZrWjwtLLhiLu91hJNH9h6sWthQstepYtbbou5dZ6GvdqDv1ErZZ9IIgoybW2BzJbqsaOrUmoDWmk6RSkHXiuA2TiwGUGcRP+wJBz1gSIN3+CHC4/5mPJlTw7CvmvU6p/pTT6tLPlVEqACEETbtAAAA1Sv/7MsQFAAfQVUmt4YmxFIlntcy9Hq9f5JU7ztWKvJZY4EiWcgFalSGt8gZO7jI0mdfgYxxTOosEPB1usIyPnzsdvo64CR9IOTngAQhEm2LIGACSGikuULhQ5/3gcIlLV3iIJgLBIOsqiZyQP2j4/ZAKRE3+U4Fh/+bwHG3qJ2sb65WpX/G1vbd/t//9VP91ABGYuNAFg/2ELpohGFL/+zLEBwAIoEEvTfdCsNkGJ/W8vJ4pxR8piwB6AJO0KAma3g4XRbOww7blaj9yxjYsdlV2IKI1N6ttBy52cPrPWdZtN//Ff///9f2pACDLka1sDYBMaQmqjcbD3DQsiSseiD/i1rDo+BoJewXSIoXeoYgNZKnWpHqu1bEXnf/6/a761QIm/YFgbALm6lyPJnmKRDqFzDaATSXrJ5QN//swxA0ABhAvO03lJPDDA+b1p+CGH0jcDpmvQaevd/+rvv//9f00d2xjWLBBDRakljaUBdKROqWSM/6KDZEHXSC1i3rKnxKG0LCTytexl9Gmr7mU/r9H9jv9vXqVBBJSkoDiAUBEbAxdUyIUSEG4pkRpZnYCXPpOW6f+3dcz9H///ofrvyUoAAAJdg4I0oLoMg+MXLuiXPXxLYS8//syxB+ABTwfM6Nl4HCgAmV0FbAGly0Rf1HqcKh37Z3Lest7M7W7LJlAAAGUChlIdnVP+qIt2dUVUOzton/7lMDBJEWWK1TLFaLrJaaqqkxBTUUzLjk5LjWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/7MsQ6g8TI2r0hAE3oAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo=';
const soundByteArray = base64SoundToByteArray( phetAudioContext, soundURI );
const unlock = asyncLoader.createLock( soundURI );
const wrappedAudioBuffer = new WrappedAudioBuffer();

// safe way to unlock
let unlocked = false;
const safeUnlock = () => {
  if ( !unlocked ) {
    unlock();
    unlocked = true;
  }
};

const onDecodeSuccess = decodedAudio => {
  if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {
    wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
    safeUnlock();
  }
};
const onDecodeError = decodeError => {
  console.warn( 'decode of audio data failed, using stubbed sound, error: ' + decodeError );
  wrappedAudioBuffer.audioBufferProperty.set( phetAudioContext.createBuffer( 1, 1, phetAudioContext.sampleRate ) );
  safeUnlock();
};
const decodePromise = phetAudioContext.decodeAudioData( soundByteArray.buffer, onDecodeSuccess, onDecodeError );
if ( decodePromise ) {
  decodePromise
    .then( decodedAudio => {
      if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {
        wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
        safeUnlock();
      }
    } )
    .catch( e => {
      console.warn( 'promise rejection caught for audio decode, error = ' + e );
      safeUnlock();
    } );
}
export default wrappedAudioBuffer;