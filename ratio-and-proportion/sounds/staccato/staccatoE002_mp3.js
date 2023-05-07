/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAABqxBNnSUgBEmDWyDMYAABAYt4FYrboUAEAAGIhQECTFyMVtqAmG5IGLIydIEw2+CAMcocKO4Y/wf//35xb/KQQ/E58TvqkWNFOEEDAamBy7gCPKCXqdJaRNQSWwcOc3FuiRBAQeiKCjLTIH0rHKYEYg1WK8pKTkrjlaWw9TYX/z7z+ZVywoBofqMJjP7mgEAHKbTcAFz//syxAQACHBxa1z3gDEPEqw1h50uevSYgKyq2cpJU7FYQtLT/Qxq2RQ89QmI4xws0osvzVcpqu4SlZa6kt/9Z/fWxmLyz+S/w1zvnlu+mAaABAgAYXbKAAXaq1lgQnkVR+iiC1M9P4IAM6uLkOlo3kGh4uXlJv1KQki2ikCuIwBT746NSM0dItQBxLR84l2463U/iKoCEB3NgAAB9f/7MsQEAAhEc1NMvNDxE4nn5c085l8obFFDwrchnbWTWTlMpZ4CbIAr4QWiVM4PCLKpqeAIcrtLwuxTazEHTbzlxm/YddyKX8hOdwVUOxEAAAXgGACCOW+QAmGSgD5eJD5Xqtx7/DMnWWKa1SRjWpSwlBiz6DXdLAAEhVdWUGyYsjOJEjodRpOc+W5HPU/////0/SsAEEAKwbWwAH3/+zLEBIAH0EdFrOnjMQYI57WePGaU47MBX8y9ZhbcFHzTM5TLFtgSCnTc2VIzobpiBbHnM+EeB7os1CdJSfSSRz/czmPf9FH//pABCACjtsjEAC0VhZMZEpwIUlAUVesAYvIlRrzBigIkwjk0YZJrSxEyRCNtBLqgIDtcuv8Rqy3267vTFfm/7///6QEQLcEbSgOZtsibYxgNbpQT//swxAiAR2Q9NUzpgbDlBea1jeBGNFWiaye+axU3gLCEiUzWWzPXdoB1ZfClHtWXX7LP3fF/dtrmeV0f/0X3gAhBJSyxhznmhIFgcKaJxtQYcaePkvZpqYTeX6RO2Q25bASvr9RaNdbLw66g0j+n/Q3sMbLLv/5ZlQAgiVLRBAlA+etwPUEShKHDlC9drK7CAlLaFEh626lQS9PV//syxBGABgwlNae8QzCBg+SwF5gO/Cp0YJXgX/9M5/9OnQAAACoPphg1OMEYrdZQCjWdHyffyPuv+7+jJVZb///+TdrgAAAAALAABBQTud/////+oWxb/FRZTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MsQtA8LYCOehDCAwAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
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