/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';
const soundURI = 'data:audio/mpeg;base64,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qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xDE1gPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/7EMTWA8AAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//sQxNYDwAABpAAAACAAADSAAAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xDE1gPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImJhc2U2NFNvdW5kVG9CeXRlQXJyYXkiLCJXcmFwcGVkQXVkaW9CdWZmZXIiLCJwaGV0QXVkaW9Db250ZXh0Iiwic291bmRVUkkiLCJzb3VuZEJ5dGVBcnJheSIsInVubG9jayIsImNyZWF0ZUxvY2siLCJ3cmFwcGVkQXVkaW9CdWZmZXIiLCJ1bmxvY2tlZCIsInNhZmVVbmxvY2siLCJvbkRlY29kZVN1Y2Nlc3MiLCJkZWNvZGVkQXVkaW8iLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJvbkRlY29kZUVycm9yIiwiZGVjb2RlRXJyb3IiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZUJ1ZmZlciIsInNhbXBsZVJhdGUiLCJkZWNvZGVQcm9taXNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYnVmZmVyIiwidGhlbiIsImNhdGNoIiwiZSJdLCJzb3VyY2VzIjpbImdlbmVyYWxCb3VuZGFyeUJvb3BfbXAzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlICovXHJcbmltcG9ydCBhc3luY0xvYWRlciBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXN5bmNMb2FkZXIuanMnO1xyXG5pbXBvcnQgYmFzZTY0U291bmRUb0J5dGVBcnJheSBmcm9tICcuLi8uLi90YW1iby9qcy9iYXNlNjRTb3VuZFRvQnl0ZUFycmF5LmpzJztcclxuaW1wb3J0IFdyYXBwZWRBdWRpb0J1ZmZlciBmcm9tICcuLi8uLi90YW1iby9qcy9XcmFwcGVkQXVkaW9CdWZmZXIuanMnO1xyXG5pbXBvcnQgcGhldEF1ZGlvQ29udGV4dCBmcm9tICcuLi8uLi90YW1iby9qcy9waGV0QXVkaW9Db250ZXh0LmpzJztcclxuXHJcbmNvbnN0IHNvdW5kVVJJID0gJ2RhdGE6YXVkaW8vbXBlZztiYXNlNjQsU1VRekJBQUFBQUFBSTFSVFUwVUFBQUFQQUFBRFRHRjJaalU0TGpJNUxqRXdNQUFBQUFBQUFBQUFBQUFBLy90QXdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVdHbHVad0FBQUE4QUFBQUpBQUFJcHdCMWRYVjFkWFYxZFhWMWRabVptWm1abVptWm1abVp0N2UzdDdlM3Q3ZTN0N2ZEdzhQRHc4UER3OFBEdzgvUHo4L1B6OC9QejgvUDI5dmIyOXZiMjl2YjI5dm41K2ZuNStmbjUrZm41L1B6OC9QejgvUHo4L1B6Ly8vLy8vLy8vLy8vLy84QUFBQUFUR0YyWXpVNExqVTBBQUFBQUFBQUFBQUFBQUFBSkFhUkFBQUFBQUFBQ0tmQUt2UW5BQUFBQUFELys5REVBQUFPc0U5QWRaR0FLOFFiSlBjL3NFQUFHKzNjMm5EZWlPS0kya0VMVEZaT2U4OGJUbFZOWW95aWpLSU1RQXVJb0l4Q0hMQ0pYZmlBQUdCdTd1N2l3QUFRQUFBQVBILytoSC8vK0hoNjMvL2gvLy85RHcvL3dBSGZtSGgvK0FBSC9IRHcvL0FBQjJZZUhoNDhBQUFBQVJoNGVIandBQUFBQkdIaDRlUEFBQUFBRVllSGg3MkFBQUFBQWdJR2pLVGFBZ0FBQURGNXpqNDFwb0JuTWIzWXVEclo0bHN3V1VUM05DWktrREJKQTBJd1BnS2ZNT2ZDQ2pCQ3dYRXdmY0ZUTUFaQU1qQlpBVWt3VG9EM01KNUJIVEF0UUl3d044QlNJQUI4d2w2T0JhZ2QzbXlnQmhRNG4yYVNvR0NDcGpnK2dqQlJYTEZCVWMxRnpGQk5ZSXdFQ1Q2RWdGUU13Y1lUV1pqTjh6ZXRkcVlyN09NRmdBU0FtdlNGYnNDTW5zeXQ1WWFpTHV4bXRUYy9Mbi96bS8veTV5NVd1c05ocHJ6RHNzdC92bi8vLy8vVnBaVFdwcFZWcGFWV3QvZzBGUVZFUVZEU3U3NVVSQlVGUkVESUtpSzVTclArRlFWRkFxQ3BZS2dxSWdxQ29pQ29CbitBTlROUjlRbmY5UURBeUNUTUx3UGt4aWlNekxhbnRNRlVGZ3dCUUZ6QlNCWk1Bd0IxTjlENUtvd0d3ZWlZQThoQUJMaWdRQU10dXFBQ2dDaEFCZ2hRQ29XRXdqSEhZb2V5bks3bnlPSVVXb2dZZHpFUGVYUmRmLzkzRXpTVFBISHpkTXZOVlVSY0pyTXUxUW4veU5Idk9DaVRQVmNLWjRKZDlhQUJnWmdBR0Z3Q09ZcG9ZQnVTVHVuREdKV0FqRUR3WG9lZERIVWN5a1JNT0VEUnZVeVJHV3NzOUR4RHNLaXEraG9HTC9OSmN5SGFWL1dxUzEwTGo4bTRmVWd0S3dFb3o5eHpreFRFVWlQWFN4V1pnOGRSMU1WTkZzS25HY2IxalZFU3AvSmVlaFlkS0EyQjJnc2dvZkRwOE94WXdJVWc4UDBycXAxcGZheTlTeFNNS1UvMjBMdnRRZ0FHUGQvclJBTUNjQzR3TmdXVEExRTRNY3R2WTE5dzlqQ09CN05TK01PQ01LT2VBRWlEdTFnVURMSktTWGsxb3VNMkprMFJpcFpISUd6WWt2bUpaYUJzVTNHenc0WHZXUEJjZmtYRDJBNGx6b2JYOXpVMUhtRHB4cm5qaStRWXl3dWx5OWZXdUJONUJJSkxMREFiWUlCUTRrSHl3amNSVVpZOGNIaVJBaWd6QzlWYWh5VW9sUHF1cFgwK2dBQksvLzc2dEFBRUlNTVFnRXpFUlRSTkFPeXZJeUtBeEhZdE9IUUtxQXdab0dOTVYyamlwVWhLYW5hWUV1cVhOQUtESkVpUXdSYlV4U2dELy90d3hPT0NEa2pqTEgza0FDSXhsQ05kN2JDOFNSTktYVllGUmRGS1YrNE5XU0tuVkJRT2xYU1FkR0xPaE1OUkZ2OGU3Ly8vOUNlR3FreEJUVVV6TGpFd01LcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXBNUVUxRk15NHhNRENxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcWt4QlRVVXpMakV3TUtxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcVRFRk5SVE11TVRBd3FxcXFxcXFxcXFxcXFxcXFxdi83WU1UMkFCR1FvUnRQYVlWaGZ3Mmk5Y3drcktxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXBNUVUxRk15NHhNRENxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcWt4QlRVVXpMakV3TUtxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcVRFRk5SVE11TVRBd3FxcXFxdi83RU1UV0E4QUFBZjRBQUFBZ0FBQTBnQUFBQktxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcS8vc1F4TllEd0FBQnBBQUFBQ0FBQURTQUFBQUVxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXIvK3hERTFnUEFBQUdrQUFBQUlBQUFOSUFBQUFTcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXF2LzdFTVRXQThBQUFhUUFBQUFnQUFBMGdBQUFCS3FxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxLy9zUXhOWUR3QUFCcEFBQUFDQUFBRFNBQUFBRXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxci8reERFMWdQQUFBR2tBQUFBSUFBQU5JQUFBQVNxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcWc9PSc7XHJcbmNvbnN0IHNvdW5kQnl0ZUFycmF5ID0gYmFzZTY0U291bmRUb0J5dGVBcnJheSggcGhldEF1ZGlvQ29udGV4dCwgc291bmRVUkkgKTtcclxuY29uc3QgdW5sb2NrID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggc291bmRVUkkgKTtcclxuY29uc3Qgd3JhcHBlZEF1ZGlvQnVmZmVyID0gbmV3IFdyYXBwZWRBdWRpb0J1ZmZlcigpO1xyXG5cclxuLy8gc2FmZSB3YXkgdG8gdW5sb2NrXHJcbmxldCB1bmxvY2tlZCA9IGZhbHNlO1xyXG5jb25zdCBzYWZlVW5sb2NrID0gKCkgPT4ge1xyXG4gIGlmICggIXVubG9ja2VkICkge1xyXG4gICAgdW5sb2NrKCk7XHJcbiAgICB1bmxvY2tlZCA9IHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3Qgb25EZWNvZGVTdWNjZXNzID0gZGVjb2RlZEF1ZGlvID0+IHtcclxuICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBkZWNvZGVkQXVkaW8gKTtcclxuICAgIHNhZmVVbmxvY2soKTtcclxuICB9XHJcbn07XHJcbmNvbnN0IG9uRGVjb2RlRXJyb3IgPSBkZWNvZGVFcnJvciA9PiB7XHJcbiAgY29uc29sZS53YXJuKCAnZGVjb2RlIG9mIGF1ZGlvIGRhdGEgZmFpbGVkLCB1c2luZyBzdHViYmVkIHNvdW5kLCBlcnJvcjogJyArIGRlY29kZUVycm9yICk7XHJcbiAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBwaGV0QXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlciggMSwgMSwgcGhldEF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlICkgKTtcclxuICBzYWZlVW5sb2NrKCk7XHJcbn07XHJcbmNvbnN0IGRlY29kZVByb21pc2UgPSBwaGV0QXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YSggc291bmRCeXRlQXJyYXkuYnVmZmVyLCBvbkRlY29kZVN1Y2Nlc3MsIG9uRGVjb2RlRXJyb3IgKTtcclxuaWYgKCBkZWNvZGVQcm9taXNlICkge1xyXG4gIGRlY29kZVByb21pc2VcclxuICAgIC50aGVuKCBkZWNvZGVkQXVkaW8gPT4ge1xyXG4gICAgICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgICAgIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggZGVjb2RlZEF1ZGlvICk7XHJcbiAgICAgICAgc2FmZVVubG9jaygpO1xyXG4gICAgICB9XHJcbiAgICB9IClcclxuICAgIC5jYXRjaCggZSA9PiB7XHJcbiAgICAgIGNvbnNvbGUud2FybiggJ3Byb21pc2UgcmVqZWN0aW9uIGNhdWdodCBmb3IgYXVkaW8gZGVjb2RlLCBlcnJvciA9ICcgKyBlICk7XHJcbiAgICAgIHNhZmVVbmxvY2soKTtcclxuICAgIH0gKTtcclxufVxyXG5leHBvcnQgZGVmYXVsdCB3cmFwcGVkQXVkaW9CdWZmZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLE9BQU9BLFdBQVcsTUFBTSxtQ0FBbUM7QUFDM0QsT0FBT0Msc0JBQXNCLE1BQU0sMENBQTBDO0FBQzdFLE9BQU9DLGtCQUFrQixNQUFNLHNDQUFzQztBQUNyRSxPQUFPQyxnQkFBZ0IsTUFBTSxvQ0FBb0M7QUFFakUsTUFBTUMsUUFBUSxHQUFHLGkrRkFBaStGO0FBQ2wvRixNQUFNQyxjQUFjLEdBQUdKLHNCQUFzQixDQUFFRSxnQkFBZ0IsRUFBRUMsUUFBUyxDQUFDO0FBQzNFLE1BQU1FLE1BQU0sR0FBR04sV0FBVyxDQUFDTyxVQUFVLENBQUVILFFBQVMsQ0FBQztBQUNqRCxNQUFNSSxrQkFBa0IsR0FBRyxJQUFJTixrQkFBa0IsQ0FBQyxDQUFDOztBQUVuRDtBQUNBLElBQUlPLFFBQVEsR0FBRyxLQUFLO0FBQ3BCLE1BQU1DLFVBQVUsR0FBR0EsQ0FBQSxLQUFNO0VBQ3ZCLElBQUssQ0FBQ0QsUUFBUSxFQUFHO0lBQ2ZILE1BQU0sQ0FBQyxDQUFDO0lBQ1JHLFFBQVEsR0FBRyxJQUFJO0VBQ2pCO0FBQ0YsQ0FBQztBQUVELE1BQU1FLGVBQWUsR0FBR0MsWUFBWSxJQUFJO0VBQ3RDLElBQUtKLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLElBQUksRUFBRztJQUMzRE4sa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVILFlBQWEsQ0FBQztJQUMxREYsVUFBVSxDQUFDLENBQUM7RUFDZDtBQUNGLENBQUM7QUFDRCxNQUFNTSxhQUFhLEdBQUdDLFdBQVcsSUFBSTtFQUNuQ0MsT0FBTyxDQUFDQyxJQUFJLENBQUUsMkRBQTJELEdBQUdGLFdBQVksQ0FBQztFQUN6RlQsa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVaLGdCQUFnQixDQUFDaUIsWUFBWSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVqQixnQkFBZ0IsQ0FBQ2tCLFVBQVcsQ0FBRSxDQUFDO0VBQ2hIWCxVQUFVLENBQUMsQ0FBQztBQUNkLENBQUM7QUFDRCxNQUFNWSxhQUFhLEdBQUduQixnQkFBZ0IsQ0FBQ29CLGVBQWUsQ0FBRWxCLGNBQWMsQ0FBQ21CLE1BQU0sRUFBRWIsZUFBZSxFQUFFSyxhQUFjLENBQUM7QUFDL0csSUFBS00sYUFBYSxFQUFHO0VBQ25CQSxhQUFhLENBQ1ZHLElBQUksQ0FBRWIsWUFBWSxJQUFJO0lBQ3JCLElBQUtKLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLElBQUksRUFBRztNQUMzRE4sa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVILFlBQWEsQ0FBQztNQUMxREYsVUFBVSxDQUFDLENBQUM7SUFDZDtFQUNGLENBQUUsQ0FBQyxDQUNGZ0IsS0FBSyxDQUFFQyxDQUFDLElBQUk7SUFDWFQsT0FBTyxDQUFDQyxJQUFJLENBQUUscURBQXFELEdBQUdRLENBQUUsQ0FBQztJQUN6RWpCLFVBQVUsQ0FBQyxDQUFDO0VBQ2QsQ0FBRSxDQUFDO0FBQ1A7QUFDQSxlQUFlRixrQkFBa0IifQ==