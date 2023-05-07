/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,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YjaEGJxZmqvBqSYaZ7ZZh0OhgfF1TEFNRTMuOTkuM1VVVVVVVVVVVVVVVVVVVVVVVQEkUcBuQofJis1cWt9Z+a1rzCHmuHD4Qwr8K5ZhCH/CEK3E/1Y1+f/7MsTqAgh9GxoMcGDJBZ+kJbCM81cKAk0DAIlS6ufQqgInAUIKJCiV/ZwET6lAokmOCoo1TEFNRTMuOTkuM1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+zLE6wIJKRcargRpyPChI5lAjjhVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//swxOwCSEEjFq0Eb8EJpCIVMJn6VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//syxN8DyNkdAweEb9gAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
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