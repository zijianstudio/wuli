/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAABuxfFhWkgAkjDOtXNPAAM2FAC46nA/34904aimlgnNimtEkIMHB4Xunp+/tRiHXIxW2UBMEzdEAoFDC4IChi0aNvYI20gAAIAiwAoEjKDp591YJcnXWKTjZOXHipnhwGNRuXioltlIqXv2wS5ehWnmyKNnMtDIC6aW67JSiniTz5dbxf/+KFxQ9nKG0u+7SqAEJZOSSA//syxAMASDyLZ12VgDEElCrpvJx2BirWWcnAOq7JO4SRXTGlt1+XW+l1Z+w2PSaeqWtk1vSVbrE061jrVJrbJNN1L21w793uv1oKyq/kPLcsCYEqk1XjTp2Gw0gMAXmVagaGFRG5I+Js2HxUsx9qqJVnTZcdBHEZ48GsLDBI1cRQlRB5/ozlQGkUmtUtrqj1apEApajAAAOFSMAUA//7MsQFgkjAWTrvceNw/QlnKZ7oFgCA2mHIj+ZIGanRiN0Avjjw7YcY/ZAFBTCy8hlAXrodsKCkb0sIBSnzBKX1Xc3lfZoitf4/guN+qmruBtwUGnoZBJg6JRqt4hlOChWCxheGJuCMBjQZCJM75KPrfkIgjLt9dEQMrDT1KrbOZ2FQ3PkFv6F5eflfdu/jKgABfQkbCgPgJa8YOAH/+zLEBoIITD03TXdgMPwGpumO7AacjwORqphoAOb5taspSuc0JxVVghJcEhzxzDICIFte7VHuSN734ata/s6P+QTW+5f//srV/cNckraUAWWsgwJBs4CGE1UTLgACfAcYrSsoKIRMDXnRDCV8rSTyTN/F/efc5ap61U6F94S7tP9bPub/3UbX8nUAABFq2QNtQAoXKriASHSZgQiC//swxAmACCAtN65vAnDghKY1zTBelZgAyc4LqWNYNqmoQ+h0Ax6b27QL3kPWPYh4oxbLdn9NadH7snUF+9qSFHf7bAACATLJImTBWYUIhObeqpxA7FhAONgVbA5JAJbWjQDn+XPRYcFByW3UaIzuv7PryU6KavXd/1r0KgAEkgLYIwhAiAUjjd4JnoFUOV8x+NjoN4myy5vqmZ7p//syxBAABRgfN6NlgPCMAma8F6QO+n+v//v/b/+sBERE0h2oukYAiJCSU5o5wNXHzyxg4Ow11/DvYdLf4l+2zkbbAAAABgcNWkxBTUUzLjk5LjWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/7MsQuA8DwBPKBCEA4AAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo=';
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