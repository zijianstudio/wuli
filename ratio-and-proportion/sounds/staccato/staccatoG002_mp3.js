/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAABqg9NHTzABElDe+rHvACAJSEAePNQ0+W8narL4DnEzR6kNA6GTL8AAAhh5MncEyaZQEHAgcny4PvEDgQ/KHPKO///4YAAlvv/klctF1AAAeJxZV8p2qi0x4pMtVRdt014QjQf8UnKXpijD3SutN9P9yXcPnc/j4+s7k8nHLIlIeYw2xpkT6Z49wx4ACWhTAwHHNJZbAA//syxAQASIhrc7z3gDEIDiu1l4nmMbaiE9SIog0k5QZKIjQ1afodEKN2sCMzOWXooVS+sfwc7Lr8lONwWFAxt/1/9rxfI1PsPLOw76v4K1ukRAgGk65ZSYidW+KBErIl9F1oNqInxviQttDswNEzl98DhARGWFKfA9aemQpDxoZ/kE2mjZkFyZv+7agLcM+R11V7FQABHTjgAAMHLf/7MsQEgghUVUVN44RxDwqodbw9VmJPqsoU8zNx57QuRyTpk70IR4CQudVmSpt665IOIMgn7E8XyceVwmykTY/7qgt+zqhVLOyrrPI/3WEFRXAAQAy0ig+MsqMA5TfApPEssJCwWiD2jteD1yhJYmFR8pSqYtPGnsIzQeJ4yMLAGlv/Ci05VahCnJ0h/////+t1CgAALkAADSAUxoL/+zLEBQIIUEkrLu0pIQOG5mmeYCZYFBwNGPGGi/KhBImHYKGVIbGJuXHz9JnJECgVOZO80EIi9iQhUCNfDmhwJL3AQmkCATIw5n9kudNoyRoIA6TVfOYnWYmZJ+AXkwRUzMTgIxTHBeFCwqY6/SipikLJbasVQo2RmmxiSfV8kvf0MWtX6k9H6v/9JBNVFQgQG1JbdIxAj1XbgKgK//swxAcAB6A1Pa3hKrDWBWY0/SQ2Ypwwa7iNsuCosb+GOuoA66IImmDrfXRFg3n4XHM86jsZamBwI6E3++3+v9mv/+8AABJGRthkQADKhiTGSBIeg2xJHlWElInVONZUqgGYQ1rbsFBs9DSUHWa9nT1/9rfVf/X//pUItNuD3AQBwC1oBTejaSS0WWiix7qkRMytu/nA0/vRvcfH//syxBEABWQrP6DhITCqA2Q0N4Qmf/6z////9/b0AAABCQNskGCiYSJPwHMguhpgiYumZI+dBXwa6Sv6na/1///ARUFfzsNQ6hCqAJB4GQqKCwsHv/6//xYWFSJkYLiMyAhYVDJkYLsMuFhUiZFm//WK1UxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MsQqA8UkALZBDEBAAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
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