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