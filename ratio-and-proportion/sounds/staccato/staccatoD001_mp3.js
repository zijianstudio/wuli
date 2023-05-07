/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAAB3xNInWGAAENDOxLMvAAAICHALlly0U3vTQABDQgDIdUuAgAbS7bmHYfihAgBwsVOyWZq2BLJ9ljmr1+GZ+OBA5WH85yjv/w///TgAAAAAqdzisA6QzABRGikuEJoX0MKA0RX4h8DEsqM4FapcEMHiox5qBk33NVn0ucLP3TT6HFVuoOZs337uT0PVcmlKpEBLoW3YAE//syxAOASHBdbV2HgDEBEaupmB2f02uv6mS1OklQVC5M9cHk0spdFq2PFKPJ9Y6kbXtvxCbzJdKZ/XGJ/86/euK0T0j2zt9xZ8GisWeIqxp25ASK2raAxqtMswoPkMaN4xIN63gBaaIz6pGAiWWXQXkkxISRxTjWkKCJsPAWeUJY62IC+Nn2aPCVo+rY1bo34uoAAio7ABADJgBXKf/7MsQFggjUbUtN4WrxCAnoKbyxXpQMogEbPWpocmNBwQsAOgZjC88PlVxx298MwQnl3qgMD88Es9ogMhE8RSVUKEN6P5tG0mxwbSP/////QBckoAYBrRLLkxDW7YDYjJhCFnsb5bNYeyc9Ml+I2KpDf0D4qdItVckOzQsehA7qEERa4pi3sTGyiM7Pd/R/////ZQAAAA65aJHAHMb/+zLEBQIIRD9BreHqcQmG5mnN4M6lyAkxGPCMVvxwINp3EfndEQQdGXIxSBywlVPgbBXV0K88vQNKNiGnKJH7f1//V0qYiSlUUjP/x4FOQNkQGVRg7ghBplC5mCA+h4CBGY0yos2kIMYmanxFQQVwiC6JkO2ltLOx42WE/9LKuTSBKHC+z/3q7VP3C////oUKUMOkBQccmMgx60KD//swxAaCB4AvJE3zYnDOhWaprOBO0OUEgxeFDZHoONCTAyk0wgMb6QoANfBhGAp1ikXTKV9axlMt/z27p+j39P///+qqJJI0oEiadToC4gl6CWcHeGhQ5CAY+4HlwmIg7NTsBSK0r2ezorelfUhLEOd+v6/7f3dSAAl8PpIAkgyA14TWnmfnJbXZ5LUDRBqu0hGeRss/76NH2/7l//syxBIABSQhLyZh4TCSA2a0FLAO+7d///YCUSndtQJGADnQyo9YAMq3lz08p86y5xU6n//Kncq5sO9Ya/y1TkkcAAAgYQEqGJYKCBg4LCwON///ZFRUW/xUVrFG///624sqTEFNRTMuOTkuNaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/7MsQvA8RkFsOhiGQgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo=';
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