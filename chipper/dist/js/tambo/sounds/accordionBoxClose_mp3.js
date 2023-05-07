/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';
const soundURI = 'data:audio/mpeg;base64,//swxAAABSAbF7TAgDE5nqu/MHICAAAAcDYkDIEtmZ+0OAIDonAEAIOjgnenW/yhz/g+fh+CEocif//+c5RVQlRIdHdXcHffj/DYYCgBdaS6OzOU+xCNTd7EPI6nQ7mODNUkXlljx1AXgvbsgTi8z3+Z7a8aMfHP9uQFmXb1f/cmZM/9//sIhYP//sNqQJAgNJhWTyGAwFAoAATS//syxAeACW0Hgbi1EBESBuvjNGAAfDtZrw0MQaBPJj2MwQyJDLEhJZGoPjAvCMnP3dlJiAtJ8xr/PKk5hYV//3KDxif//6MYVcnt//+VFswo04EQAACAAC9YdezBqNoZHHQDlUSCuyZAkxazLI1qAeiR+JfccaBj1xti9B5JXrESzzBnSIgoXKxEzkQCos+pbPmxfwWXkwAAFm+93//7MsQDgAh4Z1G5gwABEY3y9x5iAuzlQAAAAAB2Wop4QsaAhgpWdRTKJsZcpp1XP57ykSikyYckLZ4Ty1TSs+HageepBZpVjXhgAMSIXXKmU65I0d/7dt7v7sNgMBwALVb09GkvHVk7fqBciIEitH44DchaeFCkbZVn3vi+3iz997uspO3MNCwv4nKHDdB/+gTro/8WA6oYAgMAeW//+zLEAwAIZH9bHaGAAQMgrTTxid9Ko07zWxQmamYZMUXJVhdXnyiL/VNVCqJJVOgImNStCjd9bH2ZjwZ/qQYUyG79QVWCpgKmMChqVd/4VIkkywFXa2uRpIAhLLU5m1VG6LimpHOKzIapjKZdQGJoCUbq7bMoVyt+j5W6t+WZ/r/KqPLMbv1Kxurf//8tBTuFZBUABV3GwiMDZuFj//swxAUCB4SDK0ywaICeAyN0wyROlYmGu6/rSDZ4E2kDhIFxZeHE1XJXBGqqqgLGqsZQ8m6ArsXr1fUvL1lChr+v/7fq//SC5HLZU2AEjwW0VUCig+dQNmTNmsUQ+tQt+EhX+skFfU3+n+u7/hV6TEFNRTMuOTkuNaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
const soundByteArray = base64SoundToByteArray(phetAudioContext, soundURI);
const unlock = asyncLoader.createLock(soundURI);
const wrappedAudioBuffer = new WrappedAudioBuffer();

// safe way to unlock
let unlocked = false;
const safeUnlock = () => {
  if (!unlocked) {
    unlock();
    unlocked = true;
  }
};
const onDecodeSuccess = decodedAudio => {
  if (wrappedAudioBuffer.audioBufferProperty.value === null) {
    wrappedAudioBuffer.audioBufferProperty.set(decodedAudio);
    safeUnlock();
  }
};
const onDecodeError = decodeError => {
  console.warn('decode of audio data failed, using stubbed sound, error: ' + decodeError);
  wrappedAudioBuffer.audioBufferProperty.set(phetAudioContext.createBuffer(1, 1, phetAudioContext.sampleRate));
  safeUnlock();
};
const decodePromise = phetAudioContext.decodeAudioData(soundByteArray.buffer, onDecodeSuccess, onDecodeError);
if (decodePromise) {
  decodePromise.then(decodedAudio => {
    if (wrappedAudioBuffer.audioBufferProperty.value === null) {
      wrappedAudioBuffer.audioBufferProperty.set(decodedAudio);
      safeUnlock();
    }
  }).catch(e => {
    console.warn('promise rejection caught for audio decode, error = ' + e);
    safeUnlock();
  });
}
export default wrappedAudioBuffer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImJhc2U2NFNvdW5kVG9CeXRlQXJyYXkiLCJXcmFwcGVkQXVkaW9CdWZmZXIiLCJwaGV0QXVkaW9Db250ZXh0Iiwic291bmRVUkkiLCJzb3VuZEJ5dGVBcnJheSIsInVubG9jayIsImNyZWF0ZUxvY2siLCJ3cmFwcGVkQXVkaW9CdWZmZXIiLCJ1bmxvY2tlZCIsInNhZmVVbmxvY2siLCJvbkRlY29kZVN1Y2Nlc3MiLCJkZWNvZGVkQXVkaW8iLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJvbkRlY29kZUVycm9yIiwiZGVjb2RlRXJyb3IiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZUJ1ZmZlciIsInNhbXBsZVJhdGUiLCJkZWNvZGVQcm9taXNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYnVmZmVyIiwidGhlbiIsImNhdGNoIiwiZSJdLCJzb3VyY2VzIjpbImFjY29yZGlvbkJveENsb3NlX21wMy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSAqL1xyXG5pbXBvcnQgYXN5bmNMb2FkZXIgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FzeW5jTG9hZGVyLmpzJztcclxuaW1wb3J0IGJhc2U2NFNvdW5kVG9CeXRlQXJyYXkgZnJvbSAnLi4vLi4vdGFtYm8vanMvYmFzZTY0U291bmRUb0J5dGVBcnJheS5qcyc7XHJcbmltcG9ydCBXcmFwcGVkQXVkaW9CdWZmZXIgZnJvbSAnLi4vLi4vdGFtYm8vanMvV3JhcHBlZEF1ZGlvQnVmZmVyLmpzJztcclxuaW1wb3J0IHBoZXRBdWRpb0NvbnRleHQgZnJvbSAnLi4vLi4vdGFtYm8vanMvcGhldEF1ZGlvQ29udGV4dC5qcyc7XHJcblxyXG5jb25zdCBzb3VuZFVSSSA9ICdkYXRhOmF1ZGlvL21wZWc7YmFzZTY0LC8vc3d4QUFBQlNBYkY3VEFnREU1bnF1L01ISUNBQUFBY0RZa0RJRXRtWiswT0FJRG9uQUVBSU9qZ25lblcveWh6L2crZmgrQ0VvY2lmLy8rYzVSVlFsUklkSGRYY0hmZmovRFlZQ2dCZGFTNk96T1UreENOVGQ3RVBJNm5RN21PRE5Va1hsbGp4MUFYZ3Zic2dUaTh6MytaN2E4YU1mSFA5dVFGbVhiMWYvY21aTS85Ly9zSWhZUC8vc05xUUpBZ05KaFdUeUdBd0ZBb0FBVFMvL3N5eEFlQUNXMEhnYmkxRUJFU0J1dmpOR0FBZkR0WnJ3ME1RYUJQSmoyTXdReUpETEVoSlpHb1BqQXZDTW5QM2RsSmlBdEo4eHIvUEtrNWhZVi8vM0tEeGlmLy82TVlWY250Ly8rVkZzd28wNEVRQUFDQUFDOVlkZXpCcU5vWkhIUURsVVNDdXlaQWt4YXpMSTFxQWVpUitKZmNjYUJqMXh0aTlCNUpYckVTenpCblNJZ29YS3hFemtRQ29zK3BiUG14ZndXWGt3QUFGbSs5My8vN01zUURnQWg0WjFHNWd3QUJFWTN5OXg1aUF1emxRQUFBQUFCMldvcDRRc2FBaGdwV2RSVEtKc1pjcHAxWFA1N3lrU2lreVlja0xaNFR5MVRTcytIYWdlZXBCWnBWalhoZ0FNU0lYWEttVTY1STBkLzdkdDd2N3NOZ01Cd0FMVmIwOUdrdkhWazdmcUJjaUlFaXRINDREY2hhZUZDa2JaVm4zdmkrM2l6OTk3dXNwTzNNTkN3djRuS0hEZEIvK2dUcm8vOFdBNm9ZQWdNQWVXLy8rekxFQXdBSVpIOWJIYUdBQVFNZ3JUVHhpZDlLbzA3eld4UW1hbVlaTVVYSlZoZFhueWlML1ZOVkNxSkpWT2dJbU5TdENqZDliSDJaandaL3FRWVV5Rzc5UVZXQ3BnS21NQ2hxVmQvNFZJa2t5d0ZYYTJ1UnBJQWhMTFU1bTFWRzZMaW1wSE9LeklhcGpLWmRRR0pvQ1VicTdiTW9WeXQrajVXNnQrV1ovci9LcVBMTWJ2MUt4dXJmLy84dEJUdUZaQlVBQlYzR3dpTURadUZqLy9zd3hBVUNCNFNESzB5d2FJQ2VBeU4wd3lST2xZbUd1Ni9yU0RaNEUya0RoSUZ4WmVIRTFYSlhCR3FxcWdMR3FzWlE4bTZBcnNYcjFmVXZMMWxDaHIrdi83ZnEvL1NDNUhMWlUyQUVqd1cwVlVDaWcrZFFObVRObXNVUSt0UXQrRWhYK3NrRmZVMytuK3U3L2hWNlRFRk5SVE11T1RrdU5hcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcSc7XHJcbmNvbnN0IHNvdW5kQnl0ZUFycmF5ID0gYmFzZTY0U291bmRUb0J5dGVBcnJheSggcGhldEF1ZGlvQ29udGV4dCwgc291bmRVUkkgKTtcclxuY29uc3QgdW5sb2NrID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggc291bmRVUkkgKTtcclxuY29uc3Qgd3JhcHBlZEF1ZGlvQnVmZmVyID0gbmV3IFdyYXBwZWRBdWRpb0J1ZmZlcigpO1xyXG5cclxuLy8gc2FmZSB3YXkgdG8gdW5sb2NrXHJcbmxldCB1bmxvY2tlZCA9IGZhbHNlO1xyXG5jb25zdCBzYWZlVW5sb2NrID0gKCkgPT4ge1xyXG4gIGlmICggIXVubG9ja2VkICkge1xyXG4gICAgdW5sb2NrKCk7XHJcbiAgICB1bmxvY2tlZCA9IHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3Qgb25EZWNvZGVTdWNjZXNzID0gZGVjb2RlZEF1ZGlvID0+IHtcclxuICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBkZWNvZGVkQXVkaW8gKTtcclxuICAgIHNhZmVVbmxvY2soKTtcclxuICB9XHJcbn07XHJcbmNvbnN0IG9uRGVjb2RlRXJyb3IgPSBkZWNvZGVFcnJvciA9PiB7XHJcbiAgY29uc29sZS53YXJuKCAnZGVjb2RlIG9mIGF1ZGlvIGRhdGEgZmFpbGVkLCB1c2luZyBzdHViYmVkIHNvdW5kLCBlcnJvcjogJyArIGRlY29kZUVycm9yICk7XHJcbiAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBwaGV0QXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlciggMSwgMSwgcGhldEF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlICkgKTtcclxuICBzYWZlVW5sb2NrKCk7XHJcbn07XHJcbmNvbnN0IGRlY29kZVByb21pc2UgPSBwaGV0QXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YSggc291bmRCeXRlQXJyYXkuYnVmZmVyLCBvbkRlY29kZVN1Y2Nlc3MsIG9uRGVjb2RlRXJyb3IgKTtcclxuaWYgKCBkZWNvZGVQcm9taXNlICkge1xyXG4gIGRlY29kZVByb21pc2VcclxuICAgIC50aGVuKCBkZWNvZGVkQXVkaW8gPT4ge1xyXG4gICAgICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgICAgIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggZGVjb2RlZEF1ZGlvICk7XHJcbiAgICAgICAgc2FmZVVubG9jaygpO1xyXG4gICAgICB9XHJcbiAgICB9IClcclxuICAgIC5jYXRjaCggZSA9PiB7XHJcbiAgICAgIGNvbnNvbGUud2FybiggJ3Byb21pc2UgcmVqZWN0aW9uIGNhdWdodCBmb3IgYXVkaW8gZGVjb2RlLCBlcnJvciA9ICcgKyBlICk7XHJcbiAgICAgIHNhZmVVbmxvY2soKTtcclxuICAgIH0gKTtcclxufVxyXG5leHBvcnQgZGVmYXVsdCB3cmFwcGVkQXVkaW9CdWZmZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLE9BQU9BLFdBQVcsTUFBTSxtQ0FBbUM7QUFDM0QsT0FBT0Msc0JBQXNCLE1BQU0sMENBQTBDO0FBQzdFLE9BQU9DLGtCQUFrQixNQUFNLHNDQUFzQztBQUNyRSxPQUFPQyxnQkFBZ0IsTUFBTSxvQ0FBb0M7QUFFakUsTUFBTUMsUUFBUSxHQUFHLDZpQ0FBNmlDO0FBQzlqQyxNQUFNQyxjQUFjLEdBQUdKLHNCQUFzQixDQUFFRSxnQkFBZ0IsRUFBRUMsUUFBUyxDQUFDO0FBQzNFLE1BQU1FLE1BQU0sR0FBR04sV0FBVyxDQUFDTyxVQUFVLENBQUVILFFBQVMsQ0FBQztBQUNqRCxNQUFNSSxrQkFBa0IsR0FBRyxJQUFJTixrQkFBa0IsQ0FBQyxDQUFDOztBQUVuRDtBQUNBLElBQUlPLFFBQVEsR0FBRyxLQUFLO0FBQ3BCLE1BQU1DLFVBQVUsR0FBR0EsQ0FBQSxLQUFNO0VBQ3ZCLElBQUssQ0FBQ0QsUUFBUSxFQUFHO0lBQ2ZILE1BQU0sQ0FBQyxDQUFDO0lBQ1JHLFFBQVEsR0FBRyxJQUFJO0VBQ2pCO0FBQ0YsQ0FBQztBQUVELE1BQU1FLGVBQWUsR0FBR0MsWUFBWSxJQUFJO0VBQ3RDLElBQUtKLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLElBQUksRUFBRztJQUMzRE4sa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVILFlBQWEsQ0FBQztJQUMxREYsVUFBVSxDQUFDLENBQUM7RUFDZDtBQUNGLENBQUM7QUFDRCxNQUFNTSxhQUFhLEdBQUdDLFdBQVcsSUFBSTtFQUNuQ0MsT0FBTyxDQUFDQyxJQUFJLENBQUUsMkRBQTJELEdBQUdGLFdBQVksQ0FBQztFQUN6RlQsa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVaLGdCQUFnQixDQUFDaUIsWUFBWSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVqQixnQkFBZ0IsQ0FBQ2tCLFVBQVcsQ0FBRSxDQUFDO0VBQ2hIWCxVQUFVLENBQUMsQ0FBQztBQUNkLENBQUM7QUFDRCxNQUFNWSxhQUFhLEdBQUduQixnQkFBZ0IsQ0FBQ29CLGVBQWUsQ0FBRWxCLGNBQWMsQ0FBQ21CLE1BQU0sRUFBRWIsZUFBZSxFQUFFSyxhQUFjLENBQUM7QUFDL0csSUFBS00sYUFBYSxFQUFHO0VBQ25CQSxhQUFhLENBQ1ZHLElBQUksQ0FBRWIsWUFBWSxJQUFJO0lBQ3JCLElBQUtKLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLElBQUksRUFBRztNQUMzRE4sa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVILFlBQWEsQ0FBQztNQUMxREYsVUFBVSxDQUFDLENBQUM7SUFDZDtFQUNGLENBQUUsQ0FBQyxDQUNGZ0IsS0FBSyxDQUFFQyxDQUFDLElBQUk7SUFDWFQsT0FBTyxDQUFDQyxJQUFJLENBQUUscURBQXFELEdBQUdRLENBQUUsQ0FBQztJQUN6RWpCLFVBQVUsQ0FBQyxDQUFDO0VBQ2QsQ0FBRSxDQUFDO0FBQ1A7QUFDQSxlQUFlRixrQkFBa0IifQ==