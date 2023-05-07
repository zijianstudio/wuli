/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

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