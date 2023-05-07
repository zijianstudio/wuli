/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAABziHXLRjAAEXGXG3GNACgEAnfvv8EAGAyewQIIcyM99s8Z7u//3u78ZzCBAgQQxyYAQcHC09iLPTtQIOEAIHC4IHFh/4n//+T9tlkrkljYICAgFAgAACoBGjxzxOBLZpKoE9LCwoFFSOTy+WEoF8C0wKMXrnTg96VfvYupf/qTSR//RWYqar//mxIVX/4SVUNXkSQCKT//syxAOACFiVb/z0ADENmmx09gj2TcAzXjkGSeJr6XK0ZTj5EeeM3KFhYbJIKRFFW5r9l+Va5qjdv9rwarUf/6/Pk0R6pYW9hLCf08SuF1+sJb8rOtJuRgf4LsFWdQMZXmjsAmzoSh70vuLo5tcxLhwrdt2DM/MrO6IbokEOr/3K3NM5W7AxLjOVs31V9WC8Skgm9CoB+u2AlJQMe//7MsQEAAhYjzdMGE9Awg5ndPEZPmWHL0CPtQn5ZUu1typbKSM5nbbn5wMSrvc5+SO/yXMURjHbdnkhoUpgJW+ywwcMEiz542GzjNh6v/+sEJNKRoIklQT/LYOYIp/jPZ8KA+/qmpS+/qUxiNZ+xJeHAJIqzj0k1B1u/9X//dT6KgBq+RIBKgC3JDKhZQii7l30f6ZS66ZWpUBRIRb/+zLEDgIF0HElRGCiMOOhYXScCEtF6jygL9RXrLSrvCiv3f4dDfkk60gQnKAEnLh5YMOVGcl5dauwk2pHmf2hf0Mn0cpWVi/7yqy0N8zxxNJf6KZSt/Xq3YrPbzGDHJMVIAbstjSTbgDBERlAOtsQqHob5qV0r6vTlLuFb0QM//ujqJUTlK1C3AXI8qg7b5b8kDSiAE7sPpLSFUio//swxB4ARlCrCaC8QnB8g6A0FIwOZQ58HWRLeWJQ7iUiJh7tR7ypEkGgKnZG0AABIgGtyPaBGgKocuTsN5mNiAwfJe////7+R//9NUxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//syxDiDxAwaq4zhIKAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MsRsA8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
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