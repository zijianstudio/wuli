/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAABsxNIHWEgAEnDitHNPAAAJdwAPmjkZWgKlNszvc5vAz2pq3orqDrHXe1+H79IGyeSBAxc+ujntKIIWgQDQff8P/7P/hhSAAAoGM4QMCmM89MqKPuFWYZYUOtTRszOojNJEkJx9V2NUSefs4XqGIaIh1ez9Yt2lqjsmu3prcbtF5qU1+w1g73CWkvtPOf9QuqAAQu78AW//syxAMASDhzYT2lgDEJjaspp7FuhTs5MNCQlMmviTyGWlA4UNAX5sNv+TZDukIYIpaUrQiAaecVJ8mQak01II2t1eUnW/6N6Litbvaqup5YASH3bIHEakMm9rpMxcYGAayyRlJA3ZyexnhDr0Lsl9bGEl9L6a3CH05duOLcg7kCWloSufVa1AkV9iqZhPFedU/01QBCPdtAgAAxXP/7MsQEgAiAYUlN6eLxEglodc28Xmlvn9JxNTXSI9xn0peJMI2goo1Gqxg1ZnQRoitVFtKyOpTF1U2XXlhZoSKL5Dq38RvzmjWLluz//+7tAAAIEsgAEYBjsFMrBgKOhrwBIDSwCuDdsUASyjKaIGgA9w7gz4Uo2SmrCJ0E8qW8eNtmoz6a0b/t247////5elKXP/6lAAAAMiutjAD/+zLEBAIH2Ds/rm3i8PmF5ume7AYYJF2CodOGXMhCU0DBRM80uS/SVMbVSJhMaYQL3F1PLUo4Slnq0fCePbb6hRDmDt3i0sxvmf+tanJW2oD2HTlCoWGWsRGfhC1BHJmLlS7VVzTI1GVninaNFL1LV7PmkrrVy+27bydb6y/b2/fvKiqkbGO9f8uqAIwwkDAcJJoiGEwgmMuTm0gO//swxAkAB+wtKOz3gDDMhac1lh1GYhABi6GgNahAcFQ0AGkGKZesaTBufeW7aquq70o8pv/3sYcr51h3//Mp85szgACCTutEbSgTWomhnp8LRyEUDPYFOhYhghSw/SC54WBF5J7DUihLXDjH/2den/1fb6v+2gCUEVbBLGEAiBtIOYE9nTcBFWPOCSFKwhaQ4t2/7qtZmidzz/1f//syxBMABSAbN6Nh4PB4A2PknCQW//2NAAIM+UAsYe8CLDk9liwwTatDj0fv9Ya+q65uJf+WwwAAAAAAsgASh7//////1ios3/4p/FRRpoCitUxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MsQzg8NsAO2ggEuwAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
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