/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAAB5hPKHT0gAEOCuwLNPAAAAIwAYy/ibi5qoVwB0BOJ0FIHIwkHIWtqQ6IoBAw5GKxWT6oKyedZa84Csn0QFz4PqBA4UOcMcp//8v4fAAMAAARTccx540ElJMa/svW2FC6kSQSCiJdt5xI8y8MQL5OdbfirP0ZzydgUa6aIvmZMUooW/tKOghZ5ou0cKu9//oVAGFPAEVk//syxAMASCxpXt2WADEMkmtplh4OlYiFjz2kV1PuyMJQDFagVDRFltLKXWWrRxDgnPWMpnHlNalU8+atWmTnpsuW1qyenS0t7J3lgoiIsj0gREeVdS3cqkooYf0rLGdv4Kt5SxpYgTh/DNoqLW+YslFkbICYsuDpFxSBXUBrZR7OGSSiYXEsRWcdIljaFzaluUfYtQEQPT1AAAMhhf/7MsQEgAhUaU1OYehxE4sotb0k/hvmImBRgcDC40ElQtXMBE6I3WtGJhOKdjHqa2YqSHmSZ7CJlP+TFlxl6Xn9iQrf6ut70eT6UxxGl1gAgAiW260AADTiKKBAEw5x9gXPWAdkzOlkUlZ4YOosNNzCBFf271dYym8Ym2EyH407Lnzk2zBatr3jrNWApmj3tu/Z/oUAAAAOKANpAGn/+zLEBIIIqEc3rfdiMO4H5um9CK7LL8BAMaNdngghjRQkQU+prGUBANwl2mWgJQ+NnnEC4VdvPCPAqeMi5AFvd5nz3f9Bfkf/+v3+v/f/b/qGsyVhKA20MQBEgWCLYRe4qHKppyHD8oLTjPzBXwwjNV0lc5e/LYFFQyz8M9NVP1pabjhv6v/o8x/Xt6kAEMNPW2wNwJeUsHGOR758//swxAgAB1gvPaxvAjCxBei1hgmGPB6kFBzdpxaJaylrF70nQZiud6s06+4zPU1fNpVrm18u5Sf+3vY5vo/0rQDMUg4w1oAAKa/s0WEgIkOteYggHiz/r4EZlnYtA6a2Bje7rfR+myY/T7VpACRSUtljaQD/ZWxAeeTbaGOiwQBYaZFuYo8GJw1ukjRXtPvOMHr6+3HNVtvtwj3o//syxBgABkAnNay8RPCWgea0EbAG/YkAkI3/W2uBgHokJh+qEnCW4Ny08vPHRL9P6BF3/6nu/+Ijx1/8smA24AABAtqF2EXf//////FKTEFNRTMuOTkuNaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/7MsQwA8IQANtggGAwAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo=';
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