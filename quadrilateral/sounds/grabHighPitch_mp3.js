/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,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VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UsS8gcMIEqHPbGBwdwMO+f7oBlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tSxKKDwDgCAAwAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
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