/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,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le2DQZWJ3by53hDhbh/CzAOosIMED68YjSFeBVKRpRR/kJMACES4Qo9DKJUPUIUJsP4wTJN4Qo6n8zDNG7WdLYtHKqUUhXRJCVm6dVNdQZ6J5nJyiDygFuUJyoS1TtR1TyK1dE6Z06sp5yUrlNVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVmQAAAFZNrqg7hlzXOQMP4U55ZDzpjOAEcz6QmKAFIuamGUWnfAbn4xwa7ZsABgiZ6KKWyh6YCLQKBC4iHRLtPlYY2UIL0Tkux6IWss0sz6DSK+lpeaNBxuKxKVcK9KnUbqTVCqVrVHi+z5hYmuBLCYV0fCfWFpxZlankSkUQr1Q0qlXKVTKZMqRzZYCOIKJ8MonZqIUwxH0sSLa72FDdK5Sr7IqmFufumZWrlSK9YVShQ4vpMiNErOBae6URfTCMIwzcNMxB5CGgmgHkHaF4//uwxGeD5aIKeS5l54gAADSAAAAELWQ0kxcSDCOhjEaLehC1VlTyJSCkVay+bYEdlTy6Y2R24q5SrzHDgQ5o2fp8nkSuGdocmViXLeyObKrlK2P4lL0niszCplyvsEemZIc1plcnV5jdRtZzWSdlYoc1qkxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+7LEAAPAAAGkAAAAIAAANIAAAARMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
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