/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';
const soundURI = 'data:audio/mpeg;base64,//swxAAABpAhE1WQgDEChGf3OiJCAAAJRgWMA3lCIUyXzv3PfM52Qw9nimjE2HsTh+X09sHwQBB10u/y4e//+gEAQ5cP/u//4nAABASEQsFsvw9GFpIAMRiGNLEgMlRmNb+1MIjHNu4KFilyMxQYzAAc3e/P+566F6J7olttvvTZ9lv1/6++U+z1qgAJHLdLYAABaRtXAaLgn8Bq//syxAiAiaBvUb22ADjOA6MNz+wKcSQr2BxEgs/qJ0XkEPODBEPhEBEOh7HwdhJLwTjcKQmIaxUepm3yySi6sRnp0hr1J8lYfUroW0RJYrMlFAAMN5mqFGCchxplBCFCZuwLfmAFg8RsPKaZAGhqJlpCZMCBA+iTjFW///////Xb//1B2gACzEgggAM2IOQFMKEH4x1EgzS0KJMJgP/7MsQMAkZUGwtNe0BwqQNgNawkjoI6rU0xQyo8AgUADX4Q45so+ubX4c/Qr//w0AVA5axJGw1awwFk8Bk0bAWushk77jjeDg6Vcjgr38sDQNfUJZ3KgqCoK0xBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+zLEIYPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//swxGWDwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//syxKkDwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MsS7g8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+zLEu4PAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//swxLwDwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImJhc2U2NFNvdW5kVG9CeXRlQXJyYXkiLCJXcmFwcGVkQXVkaW9CdWZmZXIiLCJwaGV0QXVkaW9Db250ZXh0Iiwic291bmRVUkkiLCJzb3VuZEJ5dGVBcnJheSIsInVubG9jayIsImNyZWF0ZUxvY2siLCJ3cmFwcGVkQXVkaW9CdWZmZXIiLCJ1bmxvY2tlZCIsInNhZmVVbmxvY2siLCJvbkRlY29kZVN1Y2Nlc3MiLCJkZWNvZGVkQXVkaW8iLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJvbkRlY29kZUVycm9yIiwiZGVjb2RlRXJyb3IiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZUJ1ZmZlciIsInNhbXBsZVJhdGUiLCJkZWNvZGVQcm9taXNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYnVmZmVyIiwidGhlbiIsImNhdGNoIiwiZSJdLCJzb3VyY2VzIjpbInJlbGVhc2VfbXAzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlICovXHJcbmltcG9ydCBhc3luY0xvYWRlciBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXN5bmNMb2FkZXIuanMnO1xyXG5pbXBvcnQgYmFzZTY0U291bmRUb0J5dGVBcnJheSBmcm9tICcuLi8uLi90YW1iby9qcy9iYXNlNjRTb3VuZFRvQnl0ZUFycmF5LmpzJztcclxuaW1wb3J0IFdyYXBwZWRBdWRpb0J1ZmZlciBmcm9tICcuLi8uLi90YW1iby9qcy9XcmFwcGVkQXVkaW9CdWZmZXIuanMnO1xyXG5pbXBvcnQgcGhldEF1ZGlvQ29udGV4dCBmcm9tICcuLi8uLi90YW1iby9qcy9waGV0QXVkaW9Db250ZXh0LmpzJztcclxuXHJcbmNvbnN0IHNvdW5kVVJJID0gJ2RhdGE6YXVkaW8vbXBlZztiYXNlNjQsLy9zd3hBQUFCcEFoRTFXUWdERUNoR2YzT2lKQ0FBQUpSZ1dNQTNsQ0lVeVh6djNQZk01MlF3OW5pbWpFMkhzVGgrWDA5c0h3UUJCMTB1L3k0ZS8vK2dFQVE1Y1AvdS8vNG5BQUJBU0VRc0Zzdnc5R0ZwSUFNUmlHTkxFZ01sUm1OYisxTUlqSE51NEtGaWx5TXhRWXpBQWMzZS9QKzU2NkY2SjdvbHR0dnZUWjlsdjEvNisrVSt6MXFnQUpITGRMWUFBQmFSdFhBYUxnbjhCcS8vc3l4QWlBaWFCdlViMjJBRGpPQTZNTnord0tjU1FyMkJ4RWdzL3FKMFhrRVBPREJFUGhFQkVPaDdId2RoSkx3VGpjS1FtSWF4VWVwbTN5eVNpNnNSbnAwaHIxSjhsWWZVcm9XMFJKWXJNbEZBQU1ONW1xRkdDY2h4cGxCQ0ZDWnV3TGZtQUZnOFJzUEthWkFHaHFKbHBDWk1DQkEraVRqRlcvLy8vLy8vWGIvLzFCMmdBQ3pFZ2dnQU0ySU9RRk1LRUg0eDFFZ3pTMEtKTUpnUC83TXNRTUFrWlVHd3ROZTBCd3FRTmdOYXdram9JNnJVMHhReW84QWdVQURYNFE0NXNvK3ViWDRjL1FyLy93MEFWQTVheEpHdzFhd3dGazhCazBiQVd1c2hrNzdqamVEZzZWY2pncjM4c0RRTmZVSlozS2dxQ29LMHhCVFVVekxqazVMalZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZYLyt6TEVJWVBBQUFHa0FBQUFJQUFBTklBQUFBUlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlV4QlRVVXpMams1TGpWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlYvL3N3eEdXRHdBQUJwQUFBQUNBQUFEU0FBQUFFVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVk1RVTFGTXk0NU9TNDFWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWLy9zeXhLa0R3QUFCcEFBQUFDQUFBRFNBQUFBRVZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZNUVUxRk15NDVPUzQxVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZmLzdNc1M3ZzhBQUFhUUFBQUFnQUFBMGdBQUFCRlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlgvK3pMRXU0UEFBQUdrQUFBQUlBQUFOSUFBQUFSVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVi8vc3d4THdEd0FBQnBBQUFBQ0FBQURTQUFBQUVWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlYnO1xyXG5jb25zdCBzb3VuZEJ5dGVBcnJheSA9IGJhc2U2NFNvdW5kVG9CeXRlQXJyYXkoIHBoZXRBdWRpb0NvbnRleHQsIHNvdW5kVVJJICk7XHJcbmNvbnN0IHVubG9jayA9IGFzeW5jTG9hZGVyLmNyZWF0ZUxvY2soIHNvdW5kVVJJICk7XHJcbmNvbnN0IHdyYXBwZWRBdWRpb0J1ZmZlciA9IG5ldyBXcmFwcGVkQXVkaW9CdWZmZXIoKTtcclxuXHJcbi8vIHNhZmUgd2F5IHRvIHVubG9ja1xyXG5sZXQgdW5sb2NrZWQgPSBmYWxzZTtcclxuY29uc3Qgc2FmZVVubG9jayA9ICgpID0+IHtcclxuICBpZiAoICF1bmxvY2tlZCApIHtcclxuICAgIHVubG9jaygpO1xyXG4gICAgdW5sb2NrZWQgPSB0cnVlO1xyXG4gIH1cclxufTtcclxuXHJcbmNvbnN0IG9uRGVjb2RlU3VjY2VzcyA9IGRlY29kZWRBdWRpbyA9PiB7XHJcbiAgaWYgKCB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS52YWx1ZSA9PT0gbnVsbCApIHtcclxuICAgIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggZGVjb2RlZEF1ZGlvICk7XHJcbiAgICBzYWZlVW5sb2NrKCk7XHJcbiAgfVxyXG59O1xyXG5jb25zdCBvbkRlY29kZUVycm9yID0gZGVjb2RlRXJyb3IgPT4ge1xyXG4gIGNvbnNvbGUud2FybiggJ2RlY29kZSBvZiBhdWRpbyBkYXRhIGZhaWxlZCwgdXNpbmcgc3R1YmJlZCBzb3VuZCwgZXJyb3I6ICcgKyBkZWNvZGVFcnJvciApO1xyXG4gIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggcGhldEF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXIoIDEsIDEsIHBoZXRBdWRpb0NvbnRleHQuc2FtcGxlUmF0ZSApICk7XHJcbiAgc2FmZVVubG9jaygpO1xyXG59O1xyXG5jb25zdCBkZWNvZGVQcm9taXNlID0gcGhldEF1ZGlvQ29udGV4dC5kZWNvZGVBdWRpb0RhdGEoIHNvdW5kQnl0ZUFycmF5LmJ1ZmZlciwgb25EZWNvZGVTdWNjZXNzLCBvbkRlY29kZUVycm9yICk7XHJcbmlmICggZGVjb2RlUHJvbWlzZSApIHtcclxuICBkZWNvZGVQcm9taXNlXHJcbiAgICAudGhlbiggZGVjb2RlZEF1ZGlvID0+IHtcclxuICAgICAgaWYgKCB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS52YWx1ZSA9PT0gbnVsbCApIHtcclxuICAgICAgICB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS5zZXQoIGRlY29kZWRBdWRpbyApO1xyXG4gICAgICAgIHNhZmVVbmxvY2soKTtcclxuICAgICAgfVxyXG4gICAgfSApXHJcbiAgICAuY2F0Y2goIGUgPT4ge1xyXG4gICAgICBjb25zb2xlLndhcm4oICdwcm9taXNlIHJlamVjdGlvbiBjYXVnaHQgZm9yIGF1ZGlvIGRlY29kZSwgZXJyb3IgPSAnICsgZSApO1xyXG4gICAgICBzYWZlVW5sb2NrKCk7XHJcbiAgICB9ICk7XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgd3JhcHBlZEF1ZGlvQnVmZmVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQSxPQUFPQSxXQUFXLE1BQU0sbUNBQW1DO0FBQzNELE9BQU9DLHNCQUFzQixNQUFNLDBDQUEwQztBQUM3RSxPQUFPQyxrQkFBa0IsTUFBTSxzQ0FBc0M7QUFDckUsT0FBT0MsZ0JBQWdCLE1BQU0sb0NBQW9DO0FBRWpFLE1BQU1DLFFBQVEsR0FBRyxpM0RBQWkzRDtBQUNsNEQsTUFBTUMsY0FBYyxHQUFHSixzQkFBc0IsQ0FBRUUsZ0JBQWdCLEVBQUVDLFFBQVMsQ0FBQztBQUMzRSxNQUFNRSxNQUFNLEdBQUdOLFdBQVcsQ0FBQ08sVUFBVSxDQUFFSCxRQUFTLENBQUM7QUFDakQsTUFBTUksa0JBQWtCLEdBQUcsSUFBSU4sa0JBQWtCLENBQUMsQ0FBQzs7QUFFbkQ7QUFDQSxJQUFJTyxRQUFRLEdBQUcsS0FBSztBQUNwQixNQUFNQyxVQUFVLEdBQUdBLENBQUEsS0FBTTtFQUN2QixJQUFLLENBQUNELFFBQVEsRUFBRztJQUNmSCxNQUFNLENBQUMsQ0FBQztJQUNSRyxRQUFRLEdBQUcsSUFBSTtFQUNqQjtBQUNGLENBQUM7QUFFRCxNQUFNRSxlQUFlLEdBQUdDLFlBQVksSUFBSTtFQUN0QyxJQUFLSixrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNDLEtBQUssS0FBSyxJQUFJLEVBQUc7SUFDM0ROLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0UsR0FBRyxDQUFFSCxZQUFhLENBQUM7SUFDMURGLFVBQVUsQ0FBQyxDQUFDO0VBQ2Q7QUFDRixDQUFDO0FBQ0QsTUFBTU0sYUFBYSxHQUFHQyxXQUFXLElBQUk7RUFDbkNDLE9BQU8sQ0FBQ0MsSUFBSSxDQUFFLDJEQUEyRCxHQUFHRixXQUFZLENBQUM7RUFDekZULGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0UsR0FBRyxDQUFFWixnQkFBZ0IsQ0FBQ2lCLFlBQVksQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFakIsZ0JBQWdCLENBQUNrQixVQUFXLENBQUUsQ0FBQztFQUNoSFgsVUFBVSxDQUFDLENBQUM7QUFDZCxDQUFDO0FBQ0QsTUFBTVksYUFBYSxHQUFHbkIsZ0JBQWdCLENBQUNvQixlQUFlLENBQUVsQixjQUFjLENBQUNtQixNQUFNLEVBQUViLGVBQWUsRUFBRUssYUFBYyxDQUFDO0FBQy9HLElBQUtNLGFBQWEsRUFBRztFQUNuQkEsYUFBYSxDQUNWRyxJQUFJLENBQUViLFlBQVksSUFBSTtJQUNyQixJQUFLSixrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNDLEtBQUssS0FBSyxJQUFJLEVBQUc7TUFDM0ROLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0UsR0FBRyxDQUFFSCxZQUFhLENBQUM7TUFDMURGLFVBQVUsQ0FBQyxDQUFDO0lBQ2Q7RUFDRixDQUFFLENBQUMsQ0FDRmdCLEtBQUssQ0FBRUMsQ0FBQyxJQUFJO0lBQ1hULE9BQU8sQ0FBQ0MsSUFBSSxDQUFFLHFEQUFxRCxHQUFHUSxDQUFFLENBQUM7SUFDekVqQixVQUFVLENBQUMsQ0FBQztFQUNkLENBQUUsQ0FBQztBQUNQO0FBQ0EsZUFBZUYsa0JBQWtCIn0=