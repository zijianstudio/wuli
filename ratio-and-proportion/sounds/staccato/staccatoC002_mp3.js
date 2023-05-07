/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAAB3hHFjWzAAEODSvLNPABBA0BKNabDeH43ZiM8AjG083GDN/aTPwkwklMlFwgLfuG3bYexOH8YgACCH8E09/s9MDnwQBDX//4P8o5JAAAAAEChooBiI6bLQD2KTphnlNiw4xp4EAHfl6Qiqi02+fs4y0k1Gltn7SUzTOm4/3TUBqhwfBgf/0pJ/RMKo3/eVUECW4XHGAE//syxAOASISJZ12FgDD8j+u1hq4OuoehkiA6qaIi229K8SsNKzktBD2bRYq7EzjYflsPwDRdJoe7Jo7TY9cXX/onea9vpHv/lrUXKO8tFueKyBDABTUsuqIEOwUDS0BZo1OJzXECm61cEU7GYwWV06wKIlmJK0NAyjWVnNMmnRaNNY2neDzUjaaR/deVO5O6ZJUAccDjABpYIqWBUP/7MsQFggj4YUDuaYcxAQmmWcw1jsmX1YAQCFBMZv8gAEwYTMHOE5bAnbM8OjdZI1FuJyFAbYeBRB4HounEGSC5hJCnsK0c49NVowj/0/rR66QsAIAAMIOEw8LD9EJBwwMOB87zWT3wJFiuYXFRzUqGFwUrwyWI20h4cIT2bGxgrPPMJkhDsNrTHXqKV//////pAGWEoGiYYFtzAcT/+zLEBYIIWDkuzu8mcOyHJqmN5BbgOGRhGDQXGU0A8cxKHUxYKESae2aFq2Snok/8oHVhpKZp1Nt7ZDZ+PSGzzvb//6u9jq+frRb+UGsSNtKA00aYQFJ0TMWtMFAjmm4beyiALapgltXiDC6mIyM62EFpm0Xanfmp30e3+r7t3b+mY3f5xG/cAAAUjmotjAAsRlq+BElnVsGb/A4l//swxAqCBqQtP61hJvDKBaX1rCjOEUOpFGWOuNAp4oXmcQgFQVpMhUdRt/T11RaeET3ex/QCRGxEyYC8NZIY685GNFE2pcTIMnJBlOWdMHUqOIcTdHTt/xlJd/nMBPAqMVAmz+n/8JUBBFG60SNpQBpphICaRAL7mbI0UajU1fWu1WADS3vTVR+3Zq9/frEX7q/7nv+3LgAAJ21u//syxBoABdwfNaThgLClgyU0lIxONIqCMXBY0Ih4KiEFV10NFjwm2dbvWe8Nf2t/6v/waUPGjL3GVQBJAAAABYaxUWb///////8XZ6fMhIWFRVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MsQxg8MIAt+ABEAwAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
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