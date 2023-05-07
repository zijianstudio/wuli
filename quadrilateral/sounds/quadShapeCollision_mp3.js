/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,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';
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