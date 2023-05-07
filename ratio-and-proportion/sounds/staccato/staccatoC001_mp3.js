/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAABvxNGHWhgAEakWvLNLAAAAcGAN2xAzsAHjaQjkRjfMDQDk8EvzAAjCBAEEQALEfi7G7bmiJ00AxehV3gGLKBj/ykv/9v/9NT5gAACXbGCBQbsoCjgPbF6EF1kruDFxQBdf0Ko8iLPn0CgPwPEEWH4G0nDUPpmR2Pfrwxy/cv++7dyzd11/nFZHAcUFvSpQRa+ajlgAbq//syxAQASIBhZ12HgDEFkynpvKB/7KGJDha0PRB1oeYw1vkuEjWcWe2udxIXGQT8yWWVVbgvGaVOxvnXy9//9p3GRQ7lnyxolPZUiRnl1W+VAAEhGWCTcy8CBB8E6NCRYZctRYZCK6ZdMgpmlrOi0PdxoXc01ZfyRG8szIDepvjL/2JXKv2tSTVUVqIvi/XyaiyqAL2AAG/nGSAmHf/7MsQFAghgVTrNd2Aw+YjotczgTogH65fCWcLEJmoiHOL/gkNOlFm3Z4aaRQ9xRQoAomqimRKbiN0u3g33OwU48YRmWdnWz79NkoeWkQnLIMLAAGIVhAMHp1JGA5l8wta4L2lSIQq7MgqNmsQkVFQwCEZnJKVUsdvsYZtLfWjY+JWryv/QZQr/fdo9dQAAajwHD1SwCdMDkkNmeXH/+zLECAIIOD8vLXdgMRCG5unNPGaDwKgpoBAGSZEUmCQIO0C6KexopQ06yMgUuvM+WvlXWrL8I9/MpUa/TXev/////9nTrL+WRtOAaRyjRhUYnTc4aUGgEMHAUCfUYIh32ERMBDbOBzIxgOoINHoT6N5HFaJI+QG9qLm/3VdHR2de1Szb5pAFY6dQAIKeyQNIA5iYMYWG59yEk8Kt//swxAkABvwrM0xzIDCzBKe1p5ieaXaFjTlYAkGarF2rVLXfK5XorVOrJkqct0W1Fkf1K+irU/6lHhwBBbbuuokYAbM7IyWPeIDBzWRZVl8VQhKORIA9VOiVTqIravN07v/1U9O3u0UAAHkGkAqCypUEYeaewwFCKszXXWkSDSEVuYZ1aDV4GZut/n39/+////R/8mCQC7ttbW0o//syxBoABYwhIUxoAVCSAWZ0F6QGCY3TFBILPIzqCuRzsqCyddX6Zatzv+s7kf+d/9a4AAAAAAASAELP/////////WK9YpxUWkxBTUUzLjk5LjWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/7MsQ1g8LYAu2ghGAwAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo=';
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