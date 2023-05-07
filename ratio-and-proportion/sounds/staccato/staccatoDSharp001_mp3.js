/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAABVAfMHSRADFVErF3MPICBJJCgnP3NGjbUBMV6ogYAZc/XB+CEoGFv8Pl3/yjvzhQ5KOBD/5wo7nOotFtSbNWvbbb+/0AAACffRWMoPK2IPxfdOIP7CZROX3dtPca4jgM4Pxvgaj3iKx5eVuvSncpo2KTUhYpTH1uFDi39Zfumd69X9N78XTMPjRwkUBLmFECAWnU3IAE//syxAOASFx3aV2HgDEHDyqpt6U2aM5UqsN9cWHVKEgozygo/28MW+CXVXWfGEo9fqq24Q4WXTbLNZig1hIone/9f/f+YEbfp/qlXX7M7z0kACA7l0MIEYajpAZBqDNbbsRMT00IENb4Izb2GSsa5RCiu4pkvT3lkfcbrk8mo0a3JACZyRNL6Kc1CuRL0aeK3KyKARAdyAUAA1OCkP/7MsQFAAhUXUVOYekxDglmnb7kHjlVSVtHhgu9VIieESZD1oCDRF7PRAljnMiAZMG9puQ0rNoDZNpW8dwFKf6Zov9vhrOHbjs9//9UaAFCAAIAxiWDCUVA8Q0gebDOgKfwLiSapgsKBCTCKZCfVPWFKSLGcyGDxcGcyrpnb5ALe2fpmTb+5Z9P/////7H9PrTVAAAozIANeCPAQKD/+zLEBYIIiDsvLvMkcPsGpqmeaA6gQmEO6HfxAmBoCMEFUadVDw4Iyh1l4fln0UfFxZZ6ZIljYtFQNa1nsy3oab00/kN7f7b3LYV///oB5SRtKA/WwUcCAKYf6xvoXhgKeQsST8gEXUoXTIg3+tlEnDmKFuuqoubeuW6n8ls6urVbQPStCuxfchf36O4AAEluW6yBgGKgUWayYLYA//swxAgABoQzPa3h4rDjBWRxruwCtK/pwqPGvQWQ1FmN+uSl+kkTXHbXGyVT751ZBfu/Vo///9f1AAAAAT/OwO0NV4YDAWY6yUCyMWZkDBAzgpSRnEglmbzc3EVm65HsZIqRe9r9PRfX//Rvbfu+m1nSACbTe21EgcAC1KIzI1SeKLZZrDbq5tqJkaF6nkEOr7P9Dbfb///+hLKA//syxBUABTAjP6HgQTCSgmSoZ5gOADAjbSAYKHH6RoBOR5BMAgVcZ/1qltnki3PVjOntqBr///V3VbgAAAALQBIALB7///FP/////FRQWqFsBCwuKkxBTUUzLjk5LjWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/7MsQxg8NcAOmghEuwAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo=';
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