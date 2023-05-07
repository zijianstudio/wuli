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