/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAABxA7KnWGAAENjqwDMvAABAAFAmGsLCOovsClNKQctRw1vNpy+cLlE5Xn4gAOB8t2WGCzrrFhwH9/BCXD5cP8H5SUOf////nDHFAw4YUZzbIAv4/wCnC4SNwUAHrH+igrK8osCPDwmAkiSPeSJfZknNIsH7j3vuasa25N9/H/xLPWus7kuc57xhL6nDASrlkkgAGLFOlC//syxAWASOynbVz2gDEHkGtprCyuAB2FyyxYIk5k6tHF8hT6xiHo2qNxkotEcSyRePhbkkmGMPNHIpKG1E8PI2qMyVSetHl5Ht6LVt5k9Gj9AEIztzUeRyeUL7Ml/CA6YjD4oByNXs1mEhHH57eUTVi3hIrGmJaG5CXSoCK3uJ36Jb6Q9EM3yS3nb+qCK9YrnqnlqgApsCAAEkp/Wf/7MsQEgQhsY0LtceMxEQnnGd3hDimJCGmHQDyUPBliSlYCmSWEqeMRBQxcWSCMaaA6k0cY2RITx/lEdi/Mg9U/7WldfwVn/qZyqf//9bkg3AEBmINpcQdAkUE4wlxYy5GAYAl2iUAjQIlwqBrqbUwMGPpSCabyTJAUpDS89RW7zuTRpPzKq5N7/1VrO2f//////0UAAEEKN0SMAFD/+zLEBIAIAEU9rmnk8QkHpimu7EavWs1sFAQ1vRjaAOEialhIHPX4LdMxeIcInIHAtUOquQ3cawbpt63UcTrP7M+/RrV/u/rvXX+OAAAoyNIGALyCyoNEGMlmMOLmzAimIgTETBRA5bzCBWJRMQBhmiquyX1IAV7hfrPQt7H9wDZo6+9B/6P2f6f/7/p7lQEB/tskDAOA6V2C65rm//swxAcAB2gzO0xvIHDdBWc1rDyWCYOFlrFh1BTF+VdO9bkBsnPsX1lXbdnUFSKq8RHdUa6cT6+Sp5xOlq//5yr6QQQQ2rbY21ApKHmsiEMYQ0Lhk+XacoRTRZntHyMwcLdOdyCncRlq20XPG9d3/b/yL0dUav+n3LUAAB200mqJVGGfjkDSMcNWiBhN8tiIQkkHOU7klsQBcFDq//syxBEABlwpIUxwwxCbguV0F5gOpzTpRVu7tG3/Rou9sqn1/9oBAAM1jkbQgqMbpJAMw9AkyURPTjDyzp7lXWkez+zkYl96er9n/6EACSgAAAeHi7CLv//////igtULM1C4r+sUFkxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MsQoA8NAAOGAhEAwAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
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