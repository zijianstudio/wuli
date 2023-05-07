/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAAByhPIjT0gAEXDStDNMAAAgcCRAbwAGAZmOPgHIJgS801HOwKxWPMoGLIwuCYbbKAmG24IIXOl29KAg4EHKOCQMLD8H//y7+HzAAjFEAUMNJHAUU5PQOGI9kCEt+QKSJkWnVjNIAlhnwsoLGLSwfENwt0C43KoqjQuWHnZEr5nnd7b9PvB0mcQnMqd9//6gwgy65I5LAA//syxAQASJCnbb2GgDEFkCr1vLS23+basKCk5liMhiarkronKUcIei3Y4HKJZYnoVhLJJBiFpw6kqixWW0khPjbW39SPSfo9LrP/501kepn+wEMUGNSSwRgVWUp7GX0jrOqysgFI4keWB1A6OxnpsRMLJr9EFyZBngHYPPAwB1ZYxRuzETUs071mLbo62VmJerw0ACEBbd2AAAB9Dv/7MsQFAQigb0us8kFxBIloKZ7sDvLDyNpjynjQFTqWyOBcSbyAlRKCxIuU6EOsFRWgVwMoHeygv0Ci8LeyCPGdFGzYaJTNExyRxOz1tMSeASjuEbAPclNZlpZYwZhgWEZGFQcQEIHYlBXnboRTUQp6iSw0WzluMAIbhy3UXkhbr/Wrj/42pbPfsbT/R//s/TXVAACBTjtsjcBxxOz/+zLEBYBIIEM9rPdiMQeHZ3XNYJ64wOBMI4JHhhYs+owIgNKR9ZU2UFQMlubW0iz/K5EEU/++yTNrmo13r9dNX3/0p1+eZtq/+ukAEIJxq2QBGGEwcgcZUxQ8Xx4ImOkaB9SKMKeABTpqbqLKHi4Z1BpVzetzv25zG0qv92eGfddQ5eTVVO73e5SUXRgAIqo5E0oDKGGmnh2DVe9B//swxAgASCQvMUxzIrC5BOb1rBieycSbcVVE0SBAc6mEz07C39gKqspbvebfk6vFPbqIbdaXt//vSufixlc6nsFcAqsMzoAIRSMskaRUvhxIs2nIORpqM7jIe5TWXQQArRZ2FDZavb7UtfrX999H//9X7f0VABBRLsYDZMD+zkPq4MLUUGX0T0q+Fp83UBFbU8QlaalbU//3T7G+//syxBOARcgfMawzCDB2AuZ0FhgOyJO77f/9u4Agg3/62QnQlEsBsWEl5POVEoKhqsJHvVK/5LrSSQMLQAP///8X/+sVFkxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MsQxg8GAAuxgBEAwAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
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