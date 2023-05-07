/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAABaABI1QxADFMky13MMACgAKQuKNIB4gBAMCQ4D5sQPEFpd5R1Cw/Lg//KOLjgxg/g+D7+XD5c/wf//4gqCAkURkXj1u2FoAAAALeJPp0AZEcXPL/aZPqXuBcnEwmvv41OM4LaNYcnj90sZ4d9EH5MPHDw7+JK5/a/PXdMNr0aH80u50zLj+U6i2rdRvvXbWqBAxYJNxg//syxAMASFibX12WgDD9kWspp5z3AWPnn2MTRIxsMIDVEDpTD6madLilQVLO15ODKjApC88Tg1qK9RbjUU+jmXMv1I6XV0daubSqy1klqrcVrAARdp2gINNtINDGFrj9uAc98KQnEMBNP4AIcNLeF2KHVCFJTeA6rfocTiEApYWF3461SPOmlDudodOJfQ+K7dUAIUAAAAkrqEgCBf/7MsQFggjkb0Du6UexB4noKc0c9qZDx2aHBiYBgQSBiaXQmIxql5mRp7j7UYaFGYGoQdcLAEiK1IiOD1m5bUF3zcVaMRq0JwhnkLZbKC1x64DJygQAGKBim8CQyak4Zm0ToGBUMGR+wCnTCQU4CS8WtiIGHdYE9KVPGtmmK8/PXNzur+OhLiolz3pevf//85W56wAggBAQHKxYg+b/+zLEBQNIVDcw7ndCsQCHJI3u7FQjFhvqTHR4HFAqGAgYmlvTiyogwIj1hjZWJfBogMHYLvBSkBEiGxqmHQjQsfcE0rkf///27P///0ACAwYwyDAqBJMAkMowbnjDpc9DCwMzF0GD77kDT0OTCcXTnoc7ijIghwxVmM3C1YntFBsWCaa0qaKZ6iXJ3/+tAACRtsImAyGCFqpgsBxr//swxAeACDAxLU7zQnDUBWd0zegGPBxxAcGIwWYaFh8sWHIRGGGGXcHVHNtLRUQHSpHeEQ1asVrt1kPq6ndPf3f93//Z/o7wACG2sABIlADoJIMgyBBalhyL50H5bl51srgg2GH6BSKV2IB3ZK1O///prXbQzaQf+r/R/rUAAFFPSQRpQAahD5pVhis4wo2YEmqF3I2GSEmF1Uir//syxA+ABdAfN6TkwTCZAuZ0xJhOG9Xo/zmMGJ7sU/p7ej6egEgkK7WyiIQbUVAaAUcOgZCDBzp1PDRLDQ4f+jdlf/U9Z3Jf//+h23v2AAAAEAAUEfC0SQmQGCEhr///////iypMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/7MsQpA8MkGO2hGGCwAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo=';
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