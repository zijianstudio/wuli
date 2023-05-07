/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAABTgpNvQxABFWjS23MMABACA05aAhOHc4nETrgbwDAxwIOQs+UcGP85nChwv+Ud/KHPrD4jP1wf5egMAAEhWqKSSTb/gAAB7H3LghBwoNPSXy5cjjNfU6hiKM6eV8KX2wagRRip/bkMyEpDaI3uTIetLGke991/7csrAlY/0jnAyQF7f8P/ETyzC//8B0gUoAVp2nG4AF//syxAOASHB3aV2FgDEFEmqppZZfB5a/pLdyXZdlSxr0ZoGB2bi+kU7NwCobFxsB8NTrTKtUlHkQFQ+GyJq7/mh6Pc1/PLUtfKxNyMRf91xGsABEi5YasNSu+Z6ONb4xiNLnsqUxaaXziIQ8mn7zwsfs10taX/D12iPtZSJa1V+Ua0g+mVwevcbcIgqOVsz5sw6WAClAAAAayEBhYP/7MsQFAkjQbT7uaKfw8gjmqd5oXCmCxEZ23RxkSBgRQDmlEOgPa+SgzyE2gwUKmzgkHTkD6kwaHZpCYjFezdn96o8rs4rmtgLBrS8ARWY2odAOIAGexJpDmBAjGbvKGcjMYHCYgEBquaDIAaiAA0aDCa/oKEVE4ARdO6QaJS2GAaYZdd06WOs6n/HoGekAAAn+gwDTGYcgQYbA6a3/+zLEB4IIuEcvLuzncOCGJumeYBaieHlKGDkYJAqYSLiJJqThi4eYsqPXLgIRnEA6nEbbEPA0qpWvscv8C7410JTv6ur9v/p///+lJxJG0oD5oaQVA+YU4ZqATp7QeYaNRFNw0aTlNmkNigAiNTNZSJUap14yGcv/bd/f+jq9Cv/r/9kAAAFGSNpEwH4GlBQDB82phTT4hDghFjLI//swxAyACCwxLa1zILDdheb1rBimvFlGsAkY8xnmlJCMLXvNinclF2XXqNz9rrVud0Jo7KOptP+yv2fu/WAAi0lpBI0IFSzahwgqB5p5X/B2VM3fXygSf2kFSCUreAEHnnPWLmK9H/t2HRU4YUMT//qsX/+pAAJJMsbaQECpou0g0MgFhQ28BZpa1mYksegqRveKKWt/ap/+yQ1///syxBOABZAhL61kwvCXgiX0tgxGmd3///7ASAGrdJY2BAjQYjEEkFQox5ICyzxLgqddPV4ahqvT9mv6f///86qwAAAAAAGAEFFf//////////FRQWpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/7MsQuA8KQBOGBBEAwAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo=';
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