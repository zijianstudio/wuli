/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';
const soundURI = 'data:audio/mpeg;base64,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';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImJhc2U2NFNvdW5kVG9CeXRlQXJyYXkiLCJXcmFwcGVkQXVkaW9CdWZmZXIiLCJwaGV0QXVkaW9Db250ZXh0Iiwic291bmRVUkkiLCJzb3VuZEJ5dGVBcnJheSIsInVubG9jayIsImNyZWF0ZUxvY2siLCJ3cmFwcGVkQXVkaW9CdWZmZXIiLCJ1bmxvY2tlZCIsInNhZmVVbmxvY2siLCJvbkRlY29kZVN1Y2Nlc3MiLCJkZWNvZGVkQXVkaW8iLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJvbkRlY29kZUVycm9yIiwiZGVjb2RlRXJyb3IiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZUJ1ZmZlciIsInNhbXBsZVJhdGUiLCJkZWNvZGVQcm9taXNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYnVmZmVyIiwidGhlbiIsImNhdGNoIiwiZSJdLCJzb3VyY2VzIjpbInN3aXRjaFRvUmlnaHRfbXAzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlICovXHJcbmltcG9ydCBhc3luY0xvYWRlciBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXN5bmNMb2FkZXIuanMnO1xyXG5pbXBvcnQgYmFzZTY0U291bmRUb0J5dGVBcnJheSBmcm9tICcuLi8uLi90YW1iby9qcy9iYXNlNjRTb3VuZFRvQnl0ZUFycmF5LmpzJztcclxuaW1wb3J0IFdyYXBwZWRBdWRpb0J1ZmZlciBmcm9tICcuLi8uLi90YW1iby9qcy9XcmFwcGVkQXVkaW9CdWZmZXIuanMnO1xyXG5pbXBvcnQgcGhldEF1ZGlvQ29udGV4dCBmcm9tICcuLi8uLi90YW1iby9qcy9waGV0QXVkaW9Db250ZXh0LmpzJztcclxuXHJcbmNvbnN0IHNvdW5kVVJJID0gJ2RhdGE6YXVkaW8vbXBlZztiYXNlNjQsLy9zd3hBQUFCUVFESFZRUkFCRmJraTMzTUxBQ0FGaUFORWhyZ2FnUVdmRTZlVWNKeHdQdjV3dUQveW5oL2FYZkx2RC85SGx3ZkQvL0VFRVBEN1poT0FrRlNqbGFxRUlpUVFBRXM0ZWlKV0pjMVAxWVdIbFNoc1V6Y3VmV0EwOTRIeDF1cTBHMjBsME93TXJQK1hGNTlnY0t4OEpQNzdwTzNtOTk4cy9Zdy9uTFZYbnJycFFCc1hKVUZNTEVubWxGbU4veURSU2tBMndiRWdBQS8vc3l4QVFBQ0tSemQ3ekhnQWtHQis4MWhneHlnOVYvS1N2amVQRU02TVR3REFCQWZJU2NSMzNPNTZxNWQ0eHFrSDd2M2ppYVpNRDZrWTlzanhyWTJkbmIxSEhmdk5SL2tXSUFCai9kWVExMStIMGpJS0pBSkpLb08ya2FYZVdpSklraVNJS2tDcDZTU1NSYXdFb25PTGwzN1ZTb1VCWExCMVI0UkFyRVFOSG9LbmUvd1ZCVTl3V0R2NEtoTDhzOVFOUC9RaXFvaEFOYU95SWdBUC83TXNRRWdBaHdZVnZtUE1paEZvdnF2TXd0UkFINkFlMTRjUkNKQTBna0kwbDNvQWFWaFR4TDJVRkd3UlVsMDBta09tN3NwbnJOenRDVmpCY2E5cGUxWkFBSW1WNkhzZGtrWWJxQ0pCaXhhV1FRWlpLWnNnZ0Fhb3ZqdVJ6MGF5NHNBU3RzQmE4cUNSTFl6SnFSdmRvNk44a3hMNXVsdmMxdDY4c2VlZWpLU3BwMDlrME5pdzlqMHhVN2N3WURJTkliOVpIMFZadG9oTFpKSWtqLyt6TEVBNEFJV0l0bHJDQlBjUlVScmJhd0lBWUFKeGVWMTZrL1pkbVh5dUdYS3RVRFBMVHlXdmM4SGhIdUVtYkRXeFpzM2EyNkp6b2UwbitkTHBQOW1vcURVTGJqZ29tcDZCUjd0cDQ3S2tiL1l5N0hIR2lRQUxRYTR2QllkaWE3NDIvOFRnNkhhL1l2ZW90NWlBZ2dBVURBd1BQZ1JHMklRQUFBQWpFQXdQMXl2b1FJVG9FQUFBUTVZUGcrQndjT2YrRDRQaGdBSnR0YTdzT0IvL3N3eEFPQUNIUnhnYmowZ0FFTmpleDNzSUFBUUFnSUJBUUFCd3ZGOTVJOUJxc2FMalJmRzhIOHZvWGlvUG9GT1RuUDVmcjZCQWJUQ2lhSnFVLy94TlBVeU93a3J2dVYrSDBza2Z3d2toLzh1R2dhTjdVNHlrZ0JJMFdsME5ScDlpVFR1T3RUUDNoNzRmTHEyUkpJNVlENEloU0lab2oxWDFVVkpFWnI2K2VNWmRpUUFEaTJXc1lxYWo2dTFIS05vOVRhMUJaMkdXZnUyUnBFLy9zeXhBT0F5RVJmYzZla2JIRUZpeTI0eDVndWdDd05ETTBRa0lPSXBBcmtTQnFFaXFJK2xUNGpQWEE2cDBCSnljN0EvdWVRSUVETjhHVnhaME5SVTZod1pXWit1MHZtSkFjWkgxcy9mdldUb0NLandxZ3JSQ1Q1VEEyU3BXUmVNUWFSYnRpd3Z3b0hHUXdWVHpDTWxFbnlObjl1N01MQVZnc2hVTmlxMkMyMENDeWdURVp3NTZXT3BZc3pSM0d0WG9XNmh0LzJXUkZFQUJJVWJQLzdNc1FGZ0FqQWsyT3N2UUd4RlJMbzlZWVUzSTVYbUFHbVgyR2pkS1ZTeUV5ZkVlaTJXNHhCeVFlWDEySnYrSlNVQ1VOZTNkUWN4RC8vK3JkL3haeXNUWklySWlaUjdxSld0c2VtNzczSkxnVFgwdWFhWkFFaHE4N1lXQ0xBazJRUFJEc2lqQ2RRTXlUZlRVQVNHWVdkaGgwcnZFbURyRi9vYnExM2xTYkVuTzZpdTBYdEpBWTBBbG5Ub29ETFdMWXoxblhhbFRJSkhMZGJZbVQvK3pMRUE0QUhWTFZQb1R5ak1KOEQ1ZWd3dkFJQWE0aU9ZQnZPUnVxY2tLSWptVDBmM3dHb0pEcHltbHNvcTBJZ1VjWmxhbEtKb3FENjNiZWhYU2IzZEgxYU1HN3RqNTFvaWk2bEJsSjBBU3RiZ2lURlFuNDBLTTNDM0twTk8rdG5pYitXQ2crSXBML2V6OVAvMnY5dENnQUN4QmJhVHdCWTJldVFnSWpJQ3dCYklLcDlEQ3o2enZzbmVETGwxaFU2QlR2WjVXait6L3dWVjlRSS8vc3d4QllBQlZ3ZkdVTTh3bEI4Z2lHMEVJZ09DSWVsYWtBY0FMZGhSSXdyUllSa2NSZVdmNnZiLy8vS3lwTDk2dllWMTEyMjJBVkxGbEE0UTBoT0hnTkFLSUJPSlJVcW9KZGxWVXhCVFVVekxqazVMalZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlYvL3N5eERTRHd4UWswSVNaSUhnQUFEU0FBQUFFVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlE9PSc7XHJcbmNvbnN0IHNvdW5kQnl0ZUFycmF5ID0gYmFzZTY0U291bmRUb0J5dGVBcnJheSggcGhldEF1ZGlvQ29udGV4dCwgc291bmRVUkkgKTtcclxuY29uc3QgdW5sb2NrID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggc291bmRVUkkgKTtcclxuY29uc3Qgd3JhcHBlZEF1ZGlvQnVmZmVyID0gbmV3IFdyYXBwZWRBdWRpb0J1ZmZlcigpO1xyXG5cclxuLy8gc2FmZSB3YXkgdG8gdW5sb2NrXHJcbmxldCB1bmxvY2tlZCA9IGZhbHNlO1xyXG5jb25zdCBzYWZlVW5sb2NrID0gKCkgPT4ge1xyXG4gIGlmICggIXVubG9ja2VkICkge1xyXG4gICAgdW5sb2NrKCk7XHJcbiAgICB1bmxvY2tlZCA9IHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3Qgb25EZWNvZGVTdWNjZXNzID0gZGVjb2RlZEF1ZGlvID0+IHtcclxuICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBkZWNvZGVkQXVkaW8gKTtcclxuICAgIHNhZmVVbmxvY2soKTtcclxuICB9XHJcbn07XHJcbmNvbnN0IG9uRGVjb2RlRXJyb3IgPSBkZWNvZGVFcnJvciA9PiB7XHJcbiAgY29uc29sZS53YXJuKCAnZGVjb2RlIG9mIGF1ZGlvIGRhdGEgZmFpbGVkLCB1c2luZyBzdHViYmVkIHNvdW5kLCBlcnJvcjogJyArIGRlY29kZUVycm9yICk7XHJcbiAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBwaGV0QXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlciggMSwgMSwgcGhldEF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlICkgKTtcclxuICBzYWZlVW5sb2NrKCk7XHJcbn07XHJcbmNvbnN0IGRlY29kZVByb21pc2UgPSBwaGV0QXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YSggc291bmRCeXRlQXJyYXkuYnVmZmVyLCBvbkRlY29kZVN1Y2Nlc3MsIG9uRGVjb2RlRXJyb3IgKTtcclxuaWYgKCBkZWNvZGVQcm9taXNlICkge1xyXG4gIGRlY29kZVByb21pc2VcclxuICAgIC50aGVuKCBkZWNvZGVkQXVkaW8gPT4ge1xyXG4gICAgICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgICAgIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggZGVjb2RlZEF1ZGlvICk7XHJcbiAgICAgICAgc2FmZVVubG9jaygpO1xyXG4gICAgICB9XHJcbiAgICB9IClcclxuICAgIC5jYXRjaCggZSA9PiB7XHJcbiAgICAgIGNvbnNvbGUud2FybiggJ3Byb21pc2UgcmVqZWN0aW9uIGNhdWdodCBmb3IgYXVkaW8gZGVjb2RlLCBlcnJvciA9ICcgKyBlICk7XHJcbiAgICAgIHNhZmVVbmxvY2soKTtcclxuICAgIH0gKTtcclxufVxyXG5leHBvcnQgZGVmYXVsdCB3cmFwcGVkQXVkaW9CdWZmZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLE9BQU9BLFdBQVcsTUFBTSxtQ0FBbUM7QUFDM0QsT0FBT0Msc0JBQXNCLE1BQU0sMENBQTBDO0FBQzdFLE9BQU9DLGtCQUFrQixNQUFNLHNDQUFzQztBQUNyRSxPQUFPQyxnQkFBZ0IsTUFBTSxvQ0FBb0M7QUFFakUsTUFBTUMsUUFBUSxHQUFHLHFrRUFBcWtFO0FBQ3RsRSxNQUFNQyxjQUFjLEdBQUdKLHNCQUFzQixDQUFFRSxnQkFBZ0IsRUFBRUMsUUFBUyxDQUFDO0FBQzNFLE1BQU1FLE1BQU0sR0FBR04sV0FBVyxDQUFDTyxVQUFVLENBQUVILFFBQVMsQ0FBQztBQUNqRCxNQUFNSSxrQkFBa0IsR0FBRyxJQUFJTixrQkFBa0IsQ0FBQyxDQUFDOztBQUVuRDtBQUNBLElBQUlPLFFBQVEsR0FBRyxLQUFLO0FBQ3BCLE1BQU1DLFVBQVUsR0FBR0EsQ0FBQSxLQUFNO0VBQ3ZCLElBQUssQ0FBQ0QsUUFBUSxFQUFHO0lBQ2ZILE1BQU0sQ0FBQyxDQUFDO0lBQ1JHLFFBQVEsR0FBRyxJQUFJO0VBQ2pCO0FBQ0YsQ0FBQztBQUVELE1BQU1FLGVBQWUsR0FBR0MsWUFBWSxJQUFJO0VBQ3RDLElBQUtKLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLElBQUksRUFBRztJQUMzRE4sa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVILFlBQWEsQ0FBQztJQUMxREYsVUFBVSxDQUFDLENBQUM7RUFDZDtBQUNGLENBQUM7QUFDRCxNQUFNTSxhQUFhLEdBQUdDLFdBQVcsSUFBSTtFQUNuQ0MsT0FBTyxDQUFDQyxJQUFJLENBQUUsMkRBQTJELEdBQUdGLFdBQVksQ0FBQztFQUN6RlQsa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVaLGdCQUFnQixDQUFDaUIsWUFBWSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVqQixnQkFBZ0IsQ0FBQ2tCLFVBQVcsQ0FBRSxDQUFDO0VBQ2hIWCxVQUFVLENBQUMsQ0FBQztBQUNkLENBQUM7QUFDRCxNQUFNWSxhQUFhLEdBQUduQixnQkFBZ0IsQ0FBQ29CLGVBQWUsQ0FBRWxCLGNBQWMsQ0FBQ21CLE1BQU0sRUFBRWIsZUFBZSxFQUFFSyxhQUFjLENBQUM7QUFDL0csSUFBS00sYUFBYSxFQUFHO0VBQ25CQSxhQUFhLENBQ1ZHLElBQUksQ0FBRWIsWUFBWSxJQUFJO0lBQ3JCLElBQUtKLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLElBQUksRUFBRztNQUMzRE4sa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVILFlBQWEsQ0FBQztNQUMxREYsVUFBVSxDQUFDLENBQUM7SUFDZDtFQUNGLENBQUUsQ0FBQyxDQUNGZ0IsS0FBSyxDQUFFQyxDQUFDLElBQUk7SUFDWFQsT0FBTyxDQUFDQyxJQUFJLENBQUUscURBQXFELEdBQUdRLENBQUUsQ0FBQztJQUN6RWpCLFVBQVUsQ0FBQyxDQUFDO0VBQ2QsQ0FBRSxDQUFDO0FBQ1A7QUFDQSxlQUFlRixrQkFBa0IifQ==