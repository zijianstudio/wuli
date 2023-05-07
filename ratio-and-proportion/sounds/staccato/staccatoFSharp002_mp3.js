/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAABbhxOFTBABFGEOxDMvAAAGsKTssEgSDw7AgBxRCvvlNABCndCEkI3IygBG/+QhFABDvLvh/lHcEP8P/4fLwMEDCVKkwyQ+Vl6AKugeQ0g/edtsSTpFVUUSWRBglvDKJjeVPxR3M80M+VXm1BVKSAoW5iZEt4b90/eO3Grtqcn2/u9/vtoulVM4Ukzf/Wm9VjE62arAOp//syxAOACCx1bzz3gDEKEmvpl50+myiTwQTChK6AFg4lqVWi0LURWlmMTdalTTL2NFjer0sPz4RustasMK3+N/+Dr/MXPSuz9/noif/u/YRCQ5TcjACTF6VrYJXHegNuEKOFEPLNkzAZZ7TzNozdb5g31vA7p/5BMo37cMafXbWXWFgmfZeNn5vm9Bq7kYld0SwRABxJAAABwumla//7MsQFggiUd01M7eVxEIwo9Z28ZqDdyG2GpLbU0IyxEu9Ucc0Ueb+Yo2wCwTrGxMS11eCStA58pLYv4u4HhCYWztHTjWEUqv+xW/y91IgAxSgUQA5you8QiFMFfwh1W8mIOgJ2LEoJQxIYAyKoJqzOQUJIvq2bCKr5QF0/aZagbzl+nQjNP6uP+IR6S//+n///pgAAAQYnaAGAPND/+zLEBQIIiFE9reXo8PgIpqnNHSbBXoQRmcbpjYOsRY4XGj5P8uq8T0kCRm7rBR9xiEIoOv9hEaGd3zUEuPOLiUcMX9uR2/t/d////p9CAGTkYQgEAba810uEZMLAlNlWxEwkKTZNsNGAYjHmbnliKxyCfXkLGrd7S2m+/GzaAFPs/Vu9a3Yz/xT///qqAABowRpKA9ofp6SQRke4//swxAeCB7g9M0xuA3DrhiS1rmDOZyENFUeMRFDRv0MUWbURACgKNaDniXwL1JhPRWfMWld3/t2d33/65P0K0e86TmgAIQgSBAENVetshSenoC1CZxIDMVCUwTFCJPJwuuIkG2cBTdE3W5Zy+tcban6ff/po6Ne+zfuT7f+SfQAgQk5BA2BAHqOhZY8lzlhGDKzqQn+OgPD+5pdN//syxA6ABbgrM6DhgTCihCS0Fggmeoqos+9NX/vYQa3a6n///6gAAAFJI2iSBfLh5ClY+CJfHWlQFpK6dlSz4dxX6/kqP+nxF9nZJdbiqsAAAAABaAAAFf//+ptQsK1MQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MsQnA8H0AOGghEAwAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
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