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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImJhc2U2NFNvdW5kVG9CeXRlQXJyYXkiLCJXcmFwcGVkQXVkaW9CdWZmZXIiLCJwaGV0QXVkaW9Db250ZXh0Iiwic291bmRVUkkiLCJzb3VuZEJ5dGVBcnJheSIsInVubG9jayIsImNyZWF0ZUxvY2siLCJ3cmFwcGVkQXVkaW9CdWZmZXIiLCJ1bmxvY2tlZCIsInNhZmVVbmxvY2siLCJvbkRlY29kZVN1Y2Nlc3MiLCJkZWNvZGVkQXVkaW8iLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJvbkRlY29kZUVycm9yIiwiZGVjb2RlRXJyb3IiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZUJ1ZmZlciIsInNhbXBsZVJhdGUiLCJkZWNvZGVQcm9taXNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYnVmZmVyIiwidGhlbiIsImNhdGNoIiwiZSJdLCJzb3VyY2VzIjpbInNjcnVuY2hlZE1hc3NDb2xsaXNpb25Tb25pY1dvbXBfbXAzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlICovXHJcbmltcG9ydCBhc3luY0xvYWRlciBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXN5bmNMb2FkZXIuanMnO1xyXG5pbXBvcnQgYmFzZTY0U291bmRUb0J5dGVBcnJheSBmcm9tICcuLi8uLi90YW1iby9qcy9iYXNlNjRTb3VuZFRvQnl0ZUFycmF5LmpzJztcclxuaW1wb3J0IFdyYXBwZWRBdWRpb0J1ZmZlciBmcm9tICcuLi8uLi90YW1iby9qcy9XcmFwcGVkQXVkaW9CdWZmZXIuanMnO1xyXG5pbXBvcnQgcGhldEF1ZGlvQ29udGV4dCBmcm9tICcuLi8uLi90YW1iby9qcy9waGV0QXVkaW9Db250ZXh0LmpzJztcclxuXHJcbmNvbnN0IHNvdW5kVVJJID0gJ2RhdGE6YXVkaW8vbXBlZztiYXNlNjQsLy9zd3hBQUFROFFQQWF3OHdEQzZBMTkxN1dCRUFBSnRtNEFBRUFDQndZUUMrWVFCSlNGVVFpc0QxZ1RkLy8vLy8vL0hBQUFCQVNYUkdhR1l3YkhpNUJuU0NZRkFiWjlraHJ4cCtjWnpnUURXR0R3NTNGUVlXQjV4Ny9NUmpxTlgvSm96Nk1oaFArUnIrekpLeE9Rd3dNVUxOWitBeXJlUVM4REFTZk1TR1l4MEZoNUptSUFRN0tYZi8rNTJjWG11dTNUekdhb3orblk0dC8vOS8vc3l4QjBEeVZUdThnL3dROERuQldCQi9taElYblgvcC9uLy85WC8vK0NJY0U3OVlJR0dncS9aOGo1VFViU0F2RkdWMUF4UnljM21xOEtjZkd4b1lKblhLbUZTZzBRQkFLN25IdjNiZWRlMVVJQmhuVkZmL1IvMi8vL2VWLzExTVJFandUTlNicDQ2TEgvSk9kVFFEempML1ZPTU5ldzNDQzJqTDVMZFA1Q1JzMFBqanpqTUkwUW5ERGRkQzczOGZ1SDR4VXZVWVpCOXpSNDZJUC83TXNRZWdBbjhMd0lQKzJKQlBJVWpYZjlvVWk2Z0hVQTJTaDlEZjNxZDJjZDdPaHMvL2l3UWdFbTIrREJZQkxFeG5RUHZOQlRER0RQVERvNHljNkdUNmRIT09qNDhZeTNUR3pObkNITUVvSGt4YzQvVG8yYmxObCtGMlFkUDhyRXhwOHUrdVRwOG4xR1g1ckFQN3J2YWwzRFBiL3RvSVFTUTRCQUpJWWxZTnZteEpDY0JzQnhJZVlCY05ZR0Zodmh4clZoZ3lZdGlKQW42NituLyt6TEVFd0lLc0MwV2IvZG1FU0FGWkJudTdNYXVSeEhNWDU0cVljV2puUHRwdUpDWStGaEFZcVJUZW5rZHNOQUZDYml0Y29zWXQvUVU1MXY2MzZqWEtmVC8vcENyU0FBQVc0d3BEU0RCL1FuT3ZzS1V5NDZaRGh2VW9Ob0tKUXhyeDNqd2txVFFKZHpnRjBQRHpKY1pGb1NhZ3dDZWVBbjBxMEpnK24zMk02T3RqdFRHMEUyL1QvM2YvcFVBTllDQVlIVUVjdWw2YVY0bkJ0MFEvL3N3eEFnQ0NMd3ZIczc3b0xFbEJhSU4vMnlVbEdGQlZPYThqSTVtRVNqR0tVY29jOHFTWStpcVlreCtiNWhzWmZqMllMRE1rVWlzdmVXVHVYM3RBVXp6RzNVdHpmLy8vNy9VQUtBRUFZR21Lc0dXcGdXcGtjZ21NWUdja3VtTExJWkJqMzRzbUxUZG5ITVBRYWw2ZlozaGg4Ry9DWEVhU1FUSjdpS2J1Sm1WQ1Jqb0F5bUE4NFJidEhyUC85Zi8vLy8vOUNvQUFBQXpXV0FOLy9zeXhBT0NCM3doS2EzM2dIRUtoS0hON3V5S2dHRGhadnRNYTdOMmFIL0liSXo2YmJmTWNZd1pzeDFtd3BpYnhMZ3dEd2NKVmtRM09abVd6SEdqdUd2czZQLy80bC8wLzlUamJhSEJoNnI0bWVLSTJaaFhhaC9YYm1tNEhqSWFqejQ1OTRxQnBlbHB0QWFwaFNKeG5rcVpjbUdsaWpweXp1Rjh0bk8wd0tqMmVsODlGL3pQKzMvMmYvNmFBUURFbkh3WUR4MHB0SEZoSHNRcThmLzdNc1FJQWdlVUd4THZhd1FSSEJQZ0RlMFVxckRLY3BvOEpQbVVNQ3VKMndqNEQvaU5KSUJzc3NNcUhqeHhOeDlUbVYrTERPS2Y5WCtSSjlOZFdkLy9jQVFDRGdaeVNSeDg2WmlIK0FuV2M5OFpCbUJoTG1CWUVZUTVUQ1BERG9RY2JHaGlRVk5sLzU1WFV4SG1vMmRaWGxaSG0wTUJMZlVwZjdCOXYvL3FOZi9ZR2YvLzFIOVZBQUFLRmRHSmJnQmpCc0IwY2l4dnVZaGphQjcvK3pMRUNnSUg1UmNQcnVTaWtPUWk0U25kaUJZRDlESWtMV2hQeEVCcUR1aXdibEhvUitOT3JTMVgrUWdneGtQNDEvLy96Zi8vbUszLy8xLy8raUN6c2F3a1NUQWFsK0lhMGk2Zk8rQWdQTHJLWXVWRVpUSEsrclJQVmhHaXdvQUkwbmIrcjNWL1VydC8vMUlWdi8vcUMvLy9NLy8vb1lWMUtnQUNBUUlzZUFObS9jUG9adUFVYmh4aWhBdER3SW9ITlFkYUc0aDYwUGRlQXFwcC8vc3d4QkdBQjJCMjlVNllTb0NSQUtQME1JZ0dRTlVxcCtVVC9aaWY0Wi9xYldYOU8ySmY5UjEyRy9TUkFUYnRramdzamdBQ3pWTkx0UHAzTzIwOVR2MU9STHFGT20vS1Z2bjV4ZVg5YU9YbEtnV2t4a280bWdUQUdIY1pFUllDMDQ5MjZTNVZ3c2V2YllkUFpHUkkySS8rblN2Y3IrM3lTY2tBRnRBZ0FWQlFTRHdWYjZ6T0VqWC9IMHhCVFVVekxqazVMalZWVlZWVlZWVlYvL3N5eENVQVJNd0ZEYUVBWURCS0FOMjBNUXdHVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlE9PSc7XHJcbmNvbnN0IHNvdW5kQnl0ZUFycmF5ID0gYmFzZTY0U291bmRUb0J5dGVBcnJheSggcGhldEF1ZGlvQ29udGV4dCwgc291bmRVUkkgKTtcclxuY29uc3QgdW5sb2NrID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggc291bmRVUkkgKTtcclxuY29uc3Qgd3JhcHBlZEF1ZGlvQnVmZmVyID0gbmV3IFdyYXBwZWRBdWRpb0J1ZmZlcigpO1xyXG5cclxuLy8gc2FmZSB3YXkgdG8gdW5sb2NrXHJcbmxldCB1bmxvY2tlZCA9IGZhbHNlO1xyXG5jb25zdCBzYWZlVW5sb2NrID0gKCkgPT4ge1xyXG4gIGlmICggIXVubG9ja2VkICkge1xyXG4gICAgdW5sb2NrKCk7XHJcbiAgICB1bmxvY2tlZCA9IHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3Qgb25EZWNvZGVTdWNjZXNzID0gZGVjb2RlZEF1ZGlvID0+IHtcclxuICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBkZWNvZGVkQXVkaW8gKTtcclxuICAgIHNhZmVVbmxvY2soKTtcclxuICB9XHJcbn07XHJcbmNvbnN0IG9uRGVjb2RlRXJyb3IgPSBkZWNvZGVFcnJvciA9PiB7XHJcbiAgY29uc29sZS53YXJuKCAnZGVjb2RlIG9mIGF1ZGlvIGRhdGEgZmFpbGVkLCB1c2luZyBzdHViYmVkIHNvdW5kLCBlcnJvcjogJyArIGRlY29kZUVycm9yICk7XHJcbiAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBwaGV0QXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlciggMSwgMSwgcGhldEF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlICkgKTtcclxuICBzYWZlVW5sb2NrKCk7XHJcbn07XHJcbmNvbnN0IGRlY29kZVByb21pc2UgPSBwaGV0QXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YSggc291bmRCeXRlQXJyYXkuYnVmZmVyLCBvbkRlY29kZVN1Y2Nlc3MsIG9uRGVjb2RlRXJyb3IgKTtcclxuaWYgKCBkZWNvZGVQcm9taXNlICkge1xyXG4gIGRlY29kZVByb21pc2VcclxuICAgIC50aGVuKCBkZWNvZGVkQXVkaW8gPT4ge1xyXG4gICAgICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgICAgIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggZGVjb2RlZEF1ZGlvICk7XHJcbiAgICAgICAgc2FmZVVubG9jaygpO1xyXG4gICAgICB9XHJcbiAgICB9IClcclxuICAgIC5jYXRjaCggZSA9PiB7XHJcbiAgICAgIGNvbnNvbGUud2FybiggJ3Byb21pc2UgcmVqZWN0aW9uIGNhdWdodCBmb3IgYXVkaW8gZGVjb2RlLCBlcnJvciA9ICcgKyBlICk7XHJcbiAgICAgIHNhZmVVbmxvY2soKTtcclxuICAgIH0gKTtcclxufVxyXG5leHBvcnQgZGVmYXVsdCB3cmFwcGVkQXVkaW9CdWZmZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLE9BQU9BLFdBQVcsTUFBTSxtQ0FBbUM7QUFDM0QsT0FBT0Msc0JBQXNCLE1BQU0sMENBQTBDO0FBQzdFLE9BQU9DLGtCQUFrQixNQUFNLHNDQUFzQztBQUNyRSxPQUFPQyxnQkFBZ0IsTUFBTSxvQ0FBb0M7QUFFakUsTUFBTUMsUUFBUSxHQUFHLHFrRUFBcWtFO0FBQ3RsRSxNQUFNQyxjQUFjLEdBQUdKLHNCQUFzQixDQUFFRSxnQkFBZ0IsRUFBRUMsUUFBUyxDQUFDO0FBQzNFLE1BQU1FLE1BQU0sR0FBR04sV0FBVyxDQUFDTyxVQUFVLENBQUVILFFBQVMsQ0FBQztBQUNqRCxNQUFNSSxrQkFBa0IsR0FBRyxJQUFJTixrQkFBa0IsQ0FBQyxDQUFDOztBQUVuRDtBQUNBLElBQUlPLFFBQVEsR0FBRyxLQUFLO0FBQ3BCLE1BQU1DLFVBQVUsR0FBR0EsQ0FBQSxLQUFNO0VBQ3ZCLElBQUssQ0FBQ0QsUUFBUSxFQUFHO0lBQ2ZILE1BQU0sQ0FBQyxDQUFDO0lBQ1JHLFFBQVEsR0FBRyxJQUFJO0VBQ2pCO0FBQ0YsQ0FBQztBQUVELE1BQU1FLGVBQWUsR0FBR0MsWUFBWSxJQUFJO0VBQ3RDLElBQUtKLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLElBQUksRUFBRztJQUMzRE4sa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVILFlBQWEsQ0FBQztJQUMxREYsVUFBVSxDQUFDLENBQUM7RUFDZDtBQUNGLENBQUM7QUFDRCxNQUFNTSxhQUFhLEdBQUdDLFdBQVcsSUFBSTtFQUNuQ0MsT0FBTyxDQUFDQyxJQUFJLENBQUUsMkRBQTJELEdBQUdGLFdBQVksQ0FBQztFQUN6RlQsa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVaLGdCQUFnQixDQUFDaUIsWUFBWSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVqQixnQkFBZ0IsQ0FBQ2tCLFVBQVcsQ0FBRSxDQUFDO0VBQ2hIWCxVQUFVLENBQUMsQ0FBQztBQUNkLENBQUM7QUFDRCxNQUFNWSxhQUFhLEdBQUduQixnQkFBZ0IsQ0FBQ29CLGVBQWUsQ0FBRWxCLGNBQWMsQ0FBQ21CLE1BQU0sRUFBRWIsZUFBZSxFQUFFSyxhQUFjLENBQUM7QUFDL0csSUFBS00sYUFBYSxFQUFHO0VBQ25CQSxhQUFhLENBQ1ZHLElBQUksQ0FBRWIsWUFBWSxJQUFJO0lBQ3JCLElBQUtKLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLElBQUksRUFBRztNQUMzRE4sa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVILFlBQWEsQ0FBQztNQUMxREYsVUFBVSxDQUFDLENBQUM7SUFDZDtFQUNGLENBQUUsQ0FBQyxDQUNGZ0IsS0FBSyxDQUFFQyxDQUFDLElBQUk7SUFDWFQsT0FBTyxDQUFDQyxJQUFJLENBQUUscURBQXFELEdBQUdRLENBQUUsQ0FBQztJQUN6RWpCLFVBQVUsQ0FBQyxDQUFDO0VBQ2QsQ0FBRSxDQUFDO0FBQ1A7QUFDQSxlQUFlRixrQkFBa0IifQ==