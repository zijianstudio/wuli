/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAABaA9PvSBgDFMkyxDMvAAAICQADALsHACgLA8Us9ESt3fc/rucAxZlHU4fLn/5Ryw/P8u//8H/wQWCH+QVIz9ggyoyMz023VvAggS2FHiziAdm5jGF5guw7gGNHAPg3gJluOhHwDVaG8hqmg03+wVjqpUtl1nDyj9/ZlbcuUsWaDSPr6v/42PXHmx6gV/9ssqkjIttKSQ//syxAMACFCTc1z1gDENESv1p6meAhUeCbowUEcy3YEZL+P3Tcdp0susZO3HhA1WD5NbSQvOtckHfcSkW/P+l/o1//5id9KnLdEVbvg1t9/5EIMEEGJyOgAPZyqw4EECIknzTtdFYC1sdUYOTHmyspniNZ+T5NX2fCsIrWGT4liIHtRKEM6oMT25iOcPvN6E36qwVloBAQnNQAAG4//7MsQEAEiMbVFN5ejw9gtpKa3kjlqFhBgbook3NoheoyGNHgZ6okqD7F+7ZqSDtcs6yZqVxvAnzN7RRkut7P0Bhdb0ujyzDgH8a1flEumCXeIAI80AL9bhSoTVoiM43zwiwSbdFEzUHS8cAHJ2YU7QRgcmhorW1FYrrdVmcHdvUyqU/zi2h4qBsdSptrsjAAAJIAIGAMEBIkvsDA3/+zLEBwAJEE8zTu1JcPeHp7W9PQ5MMaVM+A5DgGAAEGIIAnAZsgakTjXoGCR/sQND7SJsLCJtQLCKulDZ/na6PMzyaGJJx9////s//+n+ggAAAOJ2yMAJGxeHExzUpUzcBToUDAgEdsYoLyymHAZXAMVmjGYCBhZhG6RU28EyaXK3eri/R+OR+hXvM7FKAQI5yRhKBS6NOiKkMEig//swxAeAB2gzNUxt4zDxhmRNjmhSN/IAU5B0TO9nC70Zp0dBGLjITZChOlHG6uSAznJ22XUbNt3R//7fo7M4vspDQaToQNdxaYMkaV4xoEWJlpzGBSccyv51iJdJXIFCHfhJBwJChkELEp+zqanq/7U7P/7v7fTf8Yj4+6t9ABABJkYaRLEM810mDIkFXMNEQ5z+DTz8sxQgxTx3//syxA8ABwQpK6Dl4TCQgyU0NiRO0UcVT2Vpa7e76dm9Asm9dh8z/qfvy+4Ou/SAAAAqIHGAYOwOAKPtqAMCKmjRFZJen/qLf8kIv//9bqiz/4dVghPAYGRJ+v/7P/xXNBUU4qLNf6hbiwuKhn/xVUxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MsQkg8NwBryhBEAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
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