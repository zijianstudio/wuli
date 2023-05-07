/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAABmgpNPSRABE0EW73HsACgACQW5xP+aMVis2oCYbJ5//wAxY4EDgkBAEKwQLnwQU6IBoIcu/h/lDnP//lDCwfg//kwSgISAYC5FI27JIAAAFe/GcTFcF8d9yMVvUbPRonjYWOPOBrVAfhR55Y371+Q5ywn1oyQXO+ZMfr7xR3GJp898/DwdM2wG+0NtfVD/qVDCAratss//syxAMASEh/c7z3gDEHD6x0/DYOgABw+Q7jugq2um1HWjMY5B4ss0ERUZTNaymOcTFDkdOezNmukr/jZ/bgvYCkVW/62t8K6Lr+WbyWeo/khRAmytZtQ9xhaV2CGEuMYfsUaInz19KDiFz9upQmZu8vobBx2HpAwIWVKDx+D11jhbcA3hzPUZG2YiekF8mmsq6VIQQOSQAAAKFjXf/7MsQFAEi0dUdN4asxAQvotbwVblNkNQStEZukE0xPkLIIRQNrIpaiERek96qnYXtrb02EmKnjHIjFEchbtJ4ORFpkEmLWc4CmkF9T8xNckGAAgFbJqZgQwIn2DgQGjAPRnzgyMiALDsl7HfhwVOklf5izIe1R0VOzARDQmMQCHLHKAxnDdR38uEW1En+7zFYAAAiA2gIDZokDg0z/+zLEBgAIiD8xTm8EsQCH5ymsPRYEcABhMxn1SMkWFwQeDgYsH8HbAHpkhBUPQ8tqgHQmlUduYukGSX/E4TNTbLP/2U7mlIl6P///+sRCS5ZJAoDIBHVjadg7hPqSVVTmUkKvBAN3mIy4QBE2ya/YwQas09D3F4y97M+baqlzf0fQo8fbtUs7Gv///311EQquSRsKAzPmIBT2EHEQ//swxAeARyg7NUxpYfCzhuf0zDxugkFX+XsIVxRqeZvZemQWtrbrugWhuTtAlZB4k6yh/Stm3pZ/a3T///1aQgwJJJhrAHPHolDDyYo8GS9Z8NC7DldDsRKkWNSBAUnevIqt58Wd8zac3ud1qgAAPqlCAOqaKwJSeApwL8UwgFZ7bwmaWPTTafil3nf/Z9rtH91GrJ/vJIIEgFso//syxBeABSAhKSZl4jB7gaZ0EKQGgQBOwqJWOJVunfTWeXK9H5b+Wf9T////I5AAAAAJI2mAFRX//+KijURUW/+oXZ//4uKu9AVFBY0BRVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MsQ3g8QoANeghEuwAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
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