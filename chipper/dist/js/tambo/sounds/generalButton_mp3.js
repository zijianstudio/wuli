/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';
const soundURI = 'data:audio/mpeg;base64,//swxAAABlAhPLTAgDE1De+/HoACAH4CwkCAJDo5gDgPRksn2WLHOB8EHShd5cHwfBBwgBBOJw/UCAY/lAxWD/4DB9+CH/6XQjMTIIcYUIQPQIRAIBAACUIawkYq7IQ/BawVqEc7mTjD+OFygBAnHbHq7UkLJ8aCnnrZlPpg3IkRJBgPH/MCQCI985/yAnHAAhmv3lHuAgAgAxJF//syxAOACHQpa7zBAAD8EunxpI3HUCEZHQlA2EYuDsSjE5EkSQGhUDYDxOARLoiBmIgalVgq4qWeWBqsNYKywNO+p/sxFyKwVOlXRFDtZ0S86oQ0C2W+wBOmlaWuS6+BIqZMz+AYy3FuwBkKXM2idVoKlYwUd/oIGgsbLpEbaCsmIyZRtbw6TPwj+mYmGr8QqnGHBLo3LKAAxKabZ//7MsQGAAhsl1OsPMcxAo3mpbCaAvIuuQRmW4WNHhDBJnoBORIlh+I9dvGCTCKP0kzo7rHHTi87diQ2XqnRN77y8lnKUl8zf+X0Fu0iCDV/9AP7el8Cw8raZKqiYShe+6bzYk0zXmEuGnBDcQhyRzPeI4Jbsmj5OxzZVhSX9adVU4Kk9r9esE3etv+/6wUIg3Wm62nA3Ab0EIcLUQ7/+zLECABGICs9oemDMLwEZrQcvFYyDBCUCgUAwQCUSvgROof5poGn9O7o70P/X9P/T+360+lAhIJVtyuNDljXzM7Ek0fGUB/ltZQF8iD7dBcVTs00f31POqR0/V/q/pjEe1z3jyAAQRBHGmSBEEVK6QIYH2miQZKNfgCVtiH9vVLp+w7an/d0jdUx9VnqZIJSvFtsaUFKKFBVCzoe//swxBwABSAhLaDl4nCsA+a0fDyG3vbgKx5OhNXyuPYt7kJJSg9B6heqxP93q/9P6IwSQ8LbYIFBVUF85RwseJPX6+Q7qIq7f/8ayokh7P//V8oyAABbhbGEIBBhOJgEGTBx6KjUiosS54l6y0i3jOz/6f///RVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//syxDWABEQTMaCF4HCNAmL0EJgGVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImJhc2U2NFNvdW5kVG9CeXRlQXJyYXkiLCJXcmFwcGVkQXVkaW9CdWZmZXIiLCJwaGV0QXVkaW9Db250ZXh0Iiwic291bmRVUkkiLCJzb3VuZEJ5dGVBcnJheSIsInVubG9jayIsImNyZWF0ZUxvY2siLCJ3cmFwcGVkQXVkaW9CdWZmZXIiLCJ1bmxvY2tlZCIsInNhZmVVbmxvY2siLCJvbkRlY29kZVN1Y2Nlc3MiLCJkZWNvZGVkQXVkaW8iLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJvbkRlY29kZUVycm9yIiwiZGVjb2RlRXJyb3IiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZUJ1ZmZlciIsInNhbXBsZVJhdGUiLCJkZWNvZGVQcm9taXNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYnVmZmVyIiwidGhlbiIsImNhdGNoIiwiZSJdLCJzb3VyY2VzIjpbImdlbmVyYWxCdXR0b25fbXAzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlICovXHJcbmltcG9ydCBhc3luY0xvYWRlciBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXN5bmNMb2FkZXIuanMnO1xyXG5pbXBvcnQgYmFzZTY0U291bmRUb0J5dGVBcnJheSBmcm9tICcuLi8uLi90YW1iby9qcy9iYXNlNjRTb3VuZFRvQnl0ZUFycmF5LmpzJztcclxuaW1wb3J0IFdyYXBwZWRBdWRpb0J1ZmZlciBmcm9tICcuLi8uLi90YW1iby9qcy9XcmFwcGVkQXVkaW9CdWZmZXIuanMnO1xyXG5pbXBvcnQgcGhldEF1ZGlvQ29udGV4dCBmcm9tICcuLi8uLi90YW1iby9qcy9waGV0QXVkaW9Db250ZXh0LmpzJztcclxuXHJcbmNvbnN0IHNvdW5kVVJJID0gJ2RhdGE6YXVkaW8vbXBlZztiYXNlNjQsLy9zd3hBQUFCbEFoUExUQWdERTFEZSsvSG9BQ0FINEN3a0NBSkRvNWdEZ1BSa3NuMldMSE9COEVIU2hkNWNId2ZCQndnQkJPSncvVUNBWS9sQXhXRC80REI5K0NILzZYUWpNVElJY1lVSVFQUUlSQUlCQUFDVUlhd2tZcTdJUS9CYXdWcUVjN21UakQrT0Z5Z0JBbkhiSHE3VWtMSjhhQ25uclpsUHBnM0lrUkpCZ1BIL01DUUNJOTg1L3lBbkhBQWhtdjNsSHVBZ0FnQXhKRi8vc3l4QU9BQ0hRcGE3ekJBQUQ4RXVueHBJM0hVQ0VaSFFsQTJFWXVEc1NqRTVFa1NRR2hVRFlEeE9BUkxvaUJtSWdhbFZncTRxV2VXQnFzTllLeXdOTytwL3N4RnlLd1ZPbFhSRkR0WjBTODZvUTBDMlcrd0JPbWxhV3VTNitCSXFaTXorQVl5M0Z1d0JrS1hNMmlkVm9LbFl3VWQvb0lHZ3NiTHBFYmFDc21JeVpSdGJ3NlRQd2orbVltR3I4UXFuR0hCTG8zTEtBQXhLYWJaLy83TXNRR0FBaHNsMU9zUE1jeEFvM21wYkNhQXZJdXVRUm1XNFdOSGhEQkpub0JPUklsaCtJOWR2R0NUQ0tQMGt6bzdySEhUaTg3ZGlRMlhxblJONzd5OGxuS1VsOHpmK1gwRnUwaUNEVi85QVA3ZWw4Q3c4cmFaS3FpWVNoZSs2YnpZazB6WG1FdUduQkRjUWh5UnpQZUk0SmJzbWo1T3h6WlZoU1g5YWRWVTRLazlyOWVzRTNldHYrLzZ3VUlnM1dtNjJuQTNBYjBFSWNMVVE3Lyt6TEVDQUJHSUNzOW9lbURNTHdFWnJRY3ZGWXlEQkNVQ2dVQXdRQ1VTdmdST29mNXBvR245TzdvNzBQL1g5UC9UKzM2MCtsQWhJSlZ0eXVORGxqWHpNN0VrMGZHVUIvbHRaUUY4aUQ3ZEJjVlRzMDBmMzFQT3FSMC9WL3EvcGpFZTF6M2p5QUFRUkJIR21TQkVFVks2UUlZSDJtaVFaS05mZ0NWdGlIOXZWTHArdzdhbi9kMGpkVXg5Vm5xWklKU3ZGdHNhVUZLS0ZCVkN6b2UvL3N3eEJ3QUJTQWhMYURsNG5Dc0ErYTBmRHlHM3ZiZ0t4NU9oTlh5dVBZdDdrSkpTZzlCNmhlcXhQOTNxLzlQNkl3U1E4TGJZSUZCVlVGODVSd3NlSlBYNitRN3FJcTdmLzhheW9raDdQLy9WOG95QUFCYmhiR0VJQkJoT0pnRUdUQng2S2pVaW9zUzU0bDZ5MGkzak96LzZmLy8vUlZNUVUxRk15NDVPUzQxVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWLy9zeXhEV0FCRVFUTWFDRjRIQ05BbUwwRUpnR1ZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZRPT0nO1xyXG5jb25zdCBzb3VuZEJ5dGVBcnJheSA9IGJhc2U2NFNvdW5kVG9CeXRlQXJyYXkoIHBoZXRBdWRpb0NvbnRleHQsIHNvdW5kVVJJICk7XHJcbmNvbnN0IHVubG9jayA9IGFzeW5jTG9hZGVyLmNyZWF0ZUxvY2soIHNvdW5kVVJJICk7XHJcbmNvbnN0IHdyYXBwZWRBdWRpb0J1ZmZlciA9IG5ldyBXcmFwcGVkQXVkaW9CdWZmZXIoKTtcclxuXHJcbi8vIHNhZmUgd2F5IHRvIHVubG9ja1xyXG5sZXQgdW5sb2NrZWQgPSBmYWxzZTtcclxuY29uc3Qgc2FmZVVubG9jayA9ICgpID0+IHtcclxuICBpZiAoICF1bmxvY2tlZCApIHtcclxuICAgIHVubG9jaygpO1xyXG4gICAgdW5sb2NrZWQgPSB0cnVlO1xyXG4gIH1cclxufTtcclxuXHJcbmNvbnN0IG9uRGVjb2RlU3VjY2VzcyA9IGRlY29kZWRBdWRpbyA9PiB7XHJcbiAgaWYgKCB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS52YWx1ZSA9PT0gbnVsbCApIHtcclxuICAgIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggZGVjb2RlZEF1ZGlvICk7XHJcbiAgICBzYWZlVW5sb2NrKCk7XHJcbiAgfVxyXG59O1xyXG5jb25zdCBvbkRlY29kZUVycm9yID0gZGVjb2RlRXJyb3IgPT4ge1xyXG4gIGNvbnNvbGUud2FybiggJ2RlY29kZSBvZiBhdWRpbyBkYXRhIGZhaWxlZCwgdXNpbmcgc3R1YmJlZCBzb3VuZCwgZXJyb3I6ICcgKyBkZWNvZGVFcnJvciApO1xyXG4gIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggcGhldEF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXIoIDEsIDEsIHBoZXRBdWRpb0NvbnRleHQuc2FtcGxlUmF0ZSApICk7XHJcbiAgc2FmZVVubG9jaygpO1xyXG59O1xyXG5jb25zdCBkZWNvZGVQcm9taXNlID0gcGhldEF1ZGlvQ29udGV4dC5kZWNvZGVBdWRpb0RhdGEoIHNvdW5kQnl0ZUFycmF5LmJ1ZmZlciwgb25EZWNvZGVTdWNjZXNzLCBvbkRlY29kZUVycm9yICk7XHJcbmlmICggZGVjb2RlUHJvbWlzZSApIHtcclxuICBkZWNvZGVQcm9taXNlXHJcbiAgICAudGhlbiggZGVjb2RlZEF1ZGlvID0+IHtcclxuICAgICAgaWYgKCB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS52YWx1ZSA9PT0gbnVsbCApIHtcclxuICAgICAgICB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS5zZXQoIGRlY29kZWRBdWRpbyApO1xyXG4gICAgICAgIHNhZmVVbmxvY2soKTtcclxuICAgICAgfVxyXG4gICAgfSApXHJcbiAgICAuY2F0Y2goIGUgPT4ge1xyXG4gICAgICBjb25zb2xlLndhcm4oICdwcm9taXNlIHJlamVjdGlvbiBjYXVnaHQgZm9yIGF1ZGlvIGRlY29kZSwgZXJyb3IgPSAnICsgZSApO1xyXG4gICAgICBzYWZlVW5sb2NrKCk7XHJcbiAgICB9ICk7XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgd3JhcHBlZEF1ZGlvQnVmZmVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQSxPQUFPQSxXQUFXLE1BQU0sbUNBQW1DO0FBQzNELE9BQU9DLHNCQUFzQixNQUFNLDBDQUEwQztBQUM3RSxPQUFPQyxrQkFBa0IsTUFBTSxzQ0FBc0M7QUFDckUsT0FBT0MsZ0JBQWdCLE1BQU0sb0NBQW9DO0FBRWpFLE1BQU1DLFFBQVEsR0FBRyxpd0NBQWl3QztBQUNseEMsTUFBTUMsY0FBYyxHQUFHSixzQkFBc0IsQ0FBRUUsZ0JBQWdCLEVBQUVDLFFBQVMsQ0FBQztBQUMzRSxNQUFNRSxNQUFNLEdBQUdOLFdBQVcsQ0FBQ08sVUFBVSxDQUFFSCxRQUFTLENBQUM7QUFDakQsTUFBTUksa0JBQWtCLEdBQUcsSUFBSU4sa0JBQWtCLENBQUMsQ0FBQzs7QUFFbkQ7QUFDQSxJQUFJTyxRQUFRLEdBQUcsS0FBSztBQUNwQixNQUFNQyxVQUFVLEdBQUdBLENBQUEsS0FBTTtFQUN2QixJQUFLLENBQUNELFFBQVEsRUFBRztJQUNmSCxNQUFNLENBQUMsQ0FBQztJQUNSRyxRQUFRLEdBQUcsSUFBSTtFQUNqQjtBQUNGLENBQUM7QUFFRCxNQUFNRSxlQUFlLEdBQUdDLFlBQVksSUFBSTtFQUN0QyxJQUFLSixrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNDLEtBQUssS0FBSyxJQUFJLEVBQUc7SUFDM0ROLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0UsR0FBRyxDQUFFSCxZQUFhLENBQUM7SUFDMURGLFVBQVUsQ0FBQyxDQUFDO0VBQ2Q7QUFDRixDQUFDO0FBQ0QsTUFBTU0sYUFBYSxHQUFHQyxXQUFXLElBQUk7RUFDbkNDLE9BQU8sQ0FBQ0MsSUFBSSxDQUFFLDJEQUEyRCxHQUFHRixXQUFZLENBQUM7RUFDekZULGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0UsR0FBRyxDQUFFWixnQkFBZ0IsQ0FBQ2lCLFlBQVksQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFakIsZ0JBQWdCLENBQUNrQixVQUFXLENBQUUsQ0FBQztFQUNoSFgsVUFBVSxDQUFDLENBQUM7QUFDZCxDQUFDO0FBQ0QsTUFBTVksYUFBYSxHQUFHbkIsZ0JBQWdCLENBQUNvQixlQUFlLENBQUVsQixjQUFjLENBQUNtQixNQUFNLEVBQUViLGVBQWUsRUFBRUssYUFBYyxDQUFDO0FBQy9HLElBQUtNLGFBQWEsRUFBRztFQUNuQkEsYUFBYSxDQUNWRyxJQUFJLENBQUViLFlBQVksSUFBSTtJQUNyQixJQUFLSixrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNDLEtBQUssS0FBSyxJQUFJLEVBQUc7TUFDM0ROLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0UsR0FBRyxDQUFFSCxZQUFhLENBQUM7TUFDMURGLFVBQVUsQ0FBQyxDQUFDO0lBQ2Q7RUFDRixDQUFFLENBQUMsQ0FDRmdCLEtBQUssQ0FBRUMsQ0FBQyxJQUFJO0lBQ1hULE9BQU8sQ0FBQ0MsSUFBSSxDQUFFLHFEQUFxRCxHQUFHUSxDQUFFLENBQUM7SUFDekVqQixVQUFVLENBQUMsQ0FBQztFQUNkLENBQUUsQ0FBQztBQUNQO0FBQ0EsZUFBZUYsa0JBQWtCIn0=