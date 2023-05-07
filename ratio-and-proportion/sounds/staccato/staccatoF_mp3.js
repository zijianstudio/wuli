/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAABmApJnSRABEyka1/MLAARATc4goQEmEYJk5QAYGzaiBAx5gAgBh8QKl1OwQDAkOfy7ymfnJQMScH//y5veH4IO+QAAAAAApSAQMRbcs/4AAAAmHYVAZxtmFmQI76YbThCujl/W4bZ3sQJmDsvGpmxibSeY5lTPYtUuW537+1rXm3RceyvjPMGHjtF8axsRIBMmXN8AO1//syxAOASFhdYT2HgDEKEWt1rCy+LmtNePvoRL2ukkSg7BlgYZQkQ9A2T1F6jfCPewXqRTfxCFy1byqFCa1e1i1bbV1AE7gznu38l1nrpKmkEQUpxGzUOCRXJfJpo8pUwUrIOlKhZzdcDSmcz4p0PK53aWOeFd4Whf+wFVvVsQTXD1dSs78kt+3F3qd838Gy8TVnagEwVEdEAAMtFP/7MsQEgQiEZUFOPS0xCwlmmc7wRtuT6qVHAfAGAZmqpzADZDtENBNdD7mRhU28S4O4DlF3gY2PcuoTX8g7neu2uQvll3fjRLn6z1vWp//KgoAEBxUZFAeaoYGFJuJypiAA6YyM5hi0nmQYuOC1VDRozUsl9ghByZ0htTKKNnW7Kose4sDkHfmZF///////Q7ofGwAQmgwEDkWBIKz/+zLEBQAIOEsxLXeCMQyIZV2+wGYEx8g0/5IxhAAoApbMxBPzzoaWDaMmWaAAjE6TMhBDJIrlcWGtf70NtZ1tmt3X/a//0f///6f/uAOGgiRAdg4kwCgCMWMTGjwQEgIYAxKAZhAlJtmFEMxtGQDH00gmy4CcHZLToizT2Snl7uS/Z/7WprJ6Eejlpi63/9IRN/3rZA4B4SgZvUsx//swxAaABtQ3PU3lpTC3BOfpnCSeSmJhdfjDxA6G9JUtKg0IhmaDaSwo8nPnHTu+g2+v9fo/1I//n3/bWGRgmd+W6wNgRKzJ2KkG6eCLbMUlRqzJZHEAcqmuALDtfs+5RxsnX6ulv/1d//9lVQAEPSbJAgQC8hBb4xcwHL2CM7BFwPZ3aZsICC6poY7Y9Hs3z3mlTDx3/v21Ko6t//syxBeABkQlJ01gRPCRgub0FKQGf/7XAkpLfcC0BiAuhUwKp8AqM88Ohogp71HSP/qeVO////s507/+lQG42AAAAwWsBg4LB7///////+oWFWRUUx4qLExBTUUzLjk5LjWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/7MsQwA8NcFtWABGIwAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo=';
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