/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAABbgjAHTBABFGkrA3MPKDBQc3AAOO7RIPGSWWyoAGA94kCQeavA4WBBY4H1OSXeGMP7f5//yhz4Ph/+IAQZDSzObznu+wvAAAAAAl8xD6B1E+cstiSF1vnIKPBCOR2es8iWE8apIkflILmSd05u6XvseacOhONO40O//5LydpdkhUzb1///dHOr5387ugHKoAAJAU1AAB//syxAOCCDx/W12mgDELj+opvCx+wCjyYQqVaiaz9MoSSd5WRY/LSV3Pen0grgiSw4F3GBNZLOYmjrMe2SKPpG23X9FR+bBqdLPyTzwtJSJMxSSMACys44MBDsoNICXENJ6XJlFPrVUFJpayWqz93FJdzSJr8yG83HRIeQnCxr6F/8o053Dv5raancY+u1/w1DpWAABLsAAOfIHGmP/7MsQFAkgEVT8s90AxDgjlGe5kZkoRHaJND4oiEg6GNRY+IR57RUXeg15qLcfRRmVsJWJS6XlPbgxvuV38m5huTnYyq/3UqyUPyIQzMhwE8GAmGDUPicSxzBuIxkRXMhZsxAKRIsgyBmdysoaKAU14iURYaGZBaqC4ZAUs5MqHvl1Tq1S6enD5q1lcX/99AABpRiBIA+1UwKMwMUb/+zLEBwII/D8tTXdgMPsGZN2/bAQ4B+MZRAqFmmCARRkRiYRGh4oGAqRxpZ0vayMgzzWWFJB5UKDtfCArPMpo1mOnv/6jkv/9vVs+mp4saUQSIAD8xKNGDSGKZxaTRyJ6Y4PGZ8RjIohNAimfAKpMJ7mgG7e6WCllSLMGz1AV9TtG//d//o5DhnpdNV9iAZG2ESAeKyFRhsMZ4Y5Z//swxAeABpgrKuz3QDDEhKb1vDxWTBKB5MWEjj9LQOADgKVGLDT1L2Drledt41JKnV/UpH/+yU7PyqwACklLLNI2Apww0Rlh1o8JGdlBl7Y0ncfKOUoEFZ3BmtRZavN07vn/1SfE2HtXEP4pDJJIwMkihKhfGZdmn6R3GQyMgkdDQkEycEDjIymmOxMkFxEGGZmyB3F2tm52T4uH//syxBgCC1UlAm7spVEfJKHpox1Sk9BXjWjRpdSk7qByi340DfPyERpnGgxf1L5WEA42hhMX6G//GDm///48cf7cbTXCjS4zVQQzKZUkztR5cfqNPfzkaoZRF58oLvGqcakTpf5V8UHjUib+pFSWo8+NwlKCTzSLf/7jreWEr//5Qm3///Hyym205fxpGQSwIp4Jh1UjOqHu5GVysv/7MsQKgMP0AxWgBEAwIQLd0AAMDs/6Pv//j/8sV/9AA/3AAUMFBxFMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+zLEOoPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
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