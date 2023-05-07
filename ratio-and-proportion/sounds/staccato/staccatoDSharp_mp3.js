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