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