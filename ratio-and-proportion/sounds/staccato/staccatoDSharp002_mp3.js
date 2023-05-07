/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAABuBdHnWBgBEijOrDNPAAAABQ4Bw15GSB4wdFJMBcJlCp8v+j/InYciWTcbtuaIlDvAMWfu7wDFnC3eBw///5R3/4Y//+J0+ASBCOIEfCUA+zeGjTlQVKNCMMhTBShKOHAjsr8o7ukwKAy1yJ6n4isZDabTBPDCgibprbkhv3GWrP4+7+GZYfCXgy9ISzn2IAASkpgAHK//syxAOACByDWz2mgDEQEKu1l6Gm4MS+EcwBH3teEYEg5Mw1rq5RJsy6XSptaWgHo2JZIFiSqKRRUZDGF/JxhmKHRSzXq5ijq5k8RfvnlEAABK6Ta0AAwxKXg7wUh38CwKk1MzjYyI7/XjV3iGE1nQdwP3HgE1jTH8F1fSKPGrUFvjA+q0Obk2KYG18xcyTXKz0nAAAACn8AAZxAmP/7MsQFAkioWz2O7eVw7Apmpd2s7tATFDBuBBbwkL2ICmuBr5AiPChCtnQgkR0o0q3tZWcaBseDiVc74eyrjNxAxcntHZ02qulVPq0ZAGkaALoAVHMHA8RAIYf0oeCgsHA+lYCE3ATUh+RGg5OnOhTk0yUze2qxIBuNZySeSivwQQ5mBaDNWiXXweoVAAG520RuAzmHFnrEMLyY9iH/+zLECIIIREM7TmGqsOUGZrWeaBYkk3cCyTSAfdAkMEcP1FclZp/uRAljk6kLIJbvnSjSjYwpdel//4nwmjrs/Wgkzqf1glxyRhKA5DkiUOBhuGH7Rcim5AITZFdi6LIilq6gW0o8+ffYS1HnbjzU19vb/s/N/60OfRsu/1KyygAAAkrBI2lAeCMRR0MHp47aLlM4gDM4lpkS/REr//swxA6CR5wtM6zzQHDDhWb1vCSeTYk3VGlvf7dWK8vxSz6Mztv90XM37PYrUlm6n3xWq5ISttFaZ0XZgFSo4MOgu4KZFu2pahxYre6cHv1TOxu5weE7E/LBilLJnpV9/+ds/d++ABBKe1lsbcD6VeC1BlqXJGUDNtDENXEaLl10au9rKH78ud/X/Wyb1/Si49fcAgAABNtZa2lA//syxBsABcAbO6fhYnCXgmX0FJgGYTgAiY2jUYlkVSXEpaxZ3DX7FiL4K/9Z38Nf/lsr/323AAVB4bFD3AQWiqqIGExBTUUzLjk5LjWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/7MsQ1A8H8EOKEpEB4AAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo=';
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