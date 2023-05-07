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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImJhc2U2NFNvdW5kVG9CeXRlQXJyYXkiLCJXcmFwcGVkQXVkaW9CdWZmZXIiLCJwaGV0QXVkaW9Db250ZXh0Iiwic291bmRVUkkiLCJzb3VuZEJ5dGVBcnJheSIsInVubG9jayIsImNyZWF0ZUxvY2siLCJ3cmFwcGVkQXVkaW9CdWZmZXIiLCJ1bmxvY2tlZCIsInNhZmVVbmxvY2siLCJvbkRlY29kZVN1Y2Nlc3MiLCJkZWNvZGVkQXVkaW8iLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJvbkRlY29kZUVycm9yIiwiZGVjb2RlRXJyb3IiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZUJ1ZmZlciIsInNhbXBsZVJhdGUiLCJkZWNvZGVQcm9taXNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYnVmZmVyIiwidGhlbiIsImNhdGNoIiwiZSJdLCJzb3VyY2VzIjpbImJvdW5jZU1hcmltYmFfbXAzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlICovXHJcbmltcG9ydCBhc3luY0xvYWRlciBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXN5bmNMb2FkZXIuanMnO1xyXG5pbXBvcnQgYmFzZTY0U291bmRUb0J5dGVBcnJheSBmcm9tICcuLi8uLi90YW1iby9qcy9iYXNlNjRTb3VuZFRvQnl0ZUFycmF5LmpzJztcclxuaW1wb3J0IFdyYXBwZWRBdWRpb0J1ZmZlciBmcm9tICcuLi8uLi90YW1iby9qcy9XcmFwcGVkQXVkaW9CdWZmZXIuanMnO1xyXG5pbXBvcnQgcGhldEF1ZGlvQ29udGV4dCBmcm9tICcuLi8uLi90YW1iby9qcy9waGV0QXVkaW9Db250ZXh0LmpzJztcclxuXHJcbmNvbnN0IHNvdW5kVVJJID0gJ2RhdGE6YXVkaW8vbXBlZztiYXNlNjQsLy9zd3hBQUFCYlFDOVpRUkFCRXdvNkt6Rm5BQW84RGJibGNBQU41UzBwQjgrc0h3ZjFnL2xJbkI4K2Mvd1E1ZC84dUQ0UHk0SU85WVBsQWZCOEh6OFR2d3hBSUFBQ0FRQUFCQUFBQUJmSitTQ3J1UTBCRTl6RFlkbFpvNElYeTZvWEZ4L2tMc0x6UnNRL1ZIaElhTmlhZC9SdGpEU1pNei8zNThmZWNsdFUvc1llaG5QbnlOMHIvV1lYZC9BU0hHMEFnTVJCUmdjZUFpbVdTeC8vc3l4QWFBQ1N5TldobTJnQUVBRFNwcnR0QUNRRXNpZ3FaV1FYYllHSHkvanp5MHBvQVhRV2xqSlBGOFZ3NWhVSENldGpEamhKSXNTclYzckdnS29TUk5nWUpyUy9QbXhvYml3ditaT0svendBQThKQVdnQUNBRk1LRHp4Z1V5OEllN3RtR0pJSUFVSFpEWFlkbHZKVmF6WXVsR3BJa2pZckR1U3ByVFYvdHVwS1BvRXlITVhnTC9BcDBSYmMwL1RXb0FBQUtNV1FBRHRtQUFPUC83TXNRRmdraGNhVUdPc2tyUkRveW5LZTVJYTNMTDRHSFFDS1h5Q0lGNGlJRGpBUWVEUjRTVUJoUFdObUNwb2tQUlhZT3p3QzVJZzJrYnRTU1M2VG9vc2t0TE1neDBDNmtzOVN4Q1ZqZ1lJUUFEQUJCZE11Wkc4d1FRSnkyQzcyYUZZSk1iZ2d3Yk5qTzUzTUFnQmhyL1Nsd3BUY1JQNlJnV1JYQlp3QjhsVjZTTmFsdTZWTm5WcGxvTFRSUDlTOHBBRERCVkZjQWFWUDRBRURILyt6TEVCZ1BJaEdrbUxucUJrUkFOSklIODJFZ0lRUVNvQThXQUtSR0EyWVFJR0JoYWtaR3F5Q0tZUG9CQU9BMUw5S3d1dENiYnBMN3NFUUlMWnhZaTY2TC85bG9yVVlobndjZVR5SmdHb0RFWUNnRE1tR2NvakpnZ1FHV2RmQm1FZzVjL09Rb0kwRERlWWtEbCtTZ0RDT0JjQlFCQWV1TWdRY2loTm02Q2FxMlBpT0FDQURFVk9YLy8xTEdlRFlqN1ZVYVFBd0tBTlRCVkR3TmsvL3N3eEFXRENJeGxLRTkxbzNFSURLUUo3clJzYXZveE53ZWpENEV6QU1CR2NoQWNtTmdKbUFVR2xRNWpCSUUwZW1VdzFLY3QwTGRBaEFGVnRQMi84eUpNS3MzdS83dW5kLy8xZGM4OWNCUUFZSjRJQmhnQkVucXJmeVpaUUtwaitCaGhvQTVnaUJ3UUFoalFEWmtaS1o5b0Vwak1CWWtDU0lyck9yUjJVRnY2eEpRRENJVkwzLy9NVFgvL2YrbjlTb1lNckFVNHlhVFQ4QmhRLy9zeXhBV0RSOEE1R2k1L29CRGhoQ0xKei9BQXcwOEJwTXRBUU1Td0hNTEFRTVJRZ1I0TWFBdFBqa0hNS2dTTDV0Y2Z1V1U5aVdaNjN6Zk5YSXFDeWY5SC8vL2I5dnV2TDh4cVB6aFdtTmIxSmJqREZBUVExU1RUSHdjTUpnc3dDTERNb0dNRDRBMnN2ekNvU1JOWlUrc3FGaktzQy9SOU5EUC9zLy8vLzAxMUFDR01BUUFWQVhEQi9ITlA4YmsweGZ4QVRrVERLbXpDQUMwWmh2LzdNc1FPQWdaWUlSanZhNEpBMElQaTZkL3dBTUhHR1hZQnlXSENKa3I5UzIwWlYwL3EvWDl2Ly8ra0RBZ0lBSURDQWZUQlNGakw4MHBvd0NvRWFBSmJFUW1FSVRRR0lWbUV4Y2NCRmdzQTNrbzdCb1gyL3YvLy9HZi8vLzIvMGtBTVl5NE1hTERNZ0thZ1RCbkFXYzRQZ3lEVXdKSUFFU0lRUVV6OHRGYlgycWk1aGM5LzIvLy8vLzdhZFRWekw5WnhDZ0pjVWhBNE1ySDgwMzMvK3pMRUhvSUdZQjBRTHY5QUVOa0RvbW5QNkFDakRoRThZd2hFRGVQRkpOQ2FNSURWTVg1RVRzTzBPcmFzZ3lmWll5cTN5QkQxZityN2ZWL2M3WCt4TytveitpRGlYUk15N1YxekRYQU1jN0UrTkdGekh3UWFDWEhDdzJFWExVYjlsU3RQdi8zZi8vMVJVU1JWQVhmc3FZTG1EZ0l0Y2drYUlDakRNUkRPQnNBL210VGpNYkFrTUtRQUVNQ0NINmxhMU5CUUI2REhzM0FsUmJzLy8vc3d4QzJEeHpBZERBNS9ZQURPZzJHQnoyQUkvLy8vcFdqaWtETVNsRmdJUDB1RVRWSUoxUUFGbDYxQ0Jwa2ZCVWNuNUw1aTZBU0E4T0pJRUkxZU5QY0tmdnBNaE1qT09VWnpBaHJabC9YS1dlajZOdjBmOS9kb3NCSWtxRUNBd1lRTnJ2VHFRU3ZNVmtHcy9sQUUrWFFUcllneUJXc2lwcTNYd3E3TDl6Lyt6cExxQVg3bnJzN3QzeUhHTnlnQUFaVm1RZ2dIVEtNbzNMV3cvL3N5eERvQ0JsZ1pGUzE3UUJEUWd1SXB2MlFBakNZQm9PTnkxQ21iT0hMaCtYVytGZ1NKcXNJZXN2Nmp3azJmWXZjWDdiQ3YrK3YvcDBGRENKTUF0bk4rN044Q2hjaUxRaFRRNEw3WnhDWkZZQXBWaUtHcHIvUjFmL1gvWDNBM09wZWhKVVVGMXFBSW5DNG1zRGdNSWdBQU1sRUNERUM4eG5tTXBXWEF3aVFiRE5rS2dYaThVM1R5YS91WnRVWnI3NjZxYS8vN2Y2SDNyMGJWaXYvN01zUktnZ1p3R3hNdCt3QVEwUU1oUWM5a0FKdHhlT1lLRkZsMkFnWXBJQmxTSW1UWGVXWW5BUEo2dkdRR2c4em1HcFR5bEFwRkRLYUt2YSsxYkUvUi96VVhlb1hDdFNZYkdUZ1lXYlVSRUFrTUN4WTQ4b0RsQUFBQUppbkFRWWdXYTJzWmppanhoZWdNQTlxT1RheGF4Y3FpQStwS0ZjbkY3ZnMzQy9QK24wK0t6bnlWYk8zYS9TOUkwcUF3REhIazJhSlp1b1lNYVB5U1pZLy8rekxFV29KR3pCc1BMZnNBQU9rRElRSFBaQUJDSmVEeDBwSGNaRmptdjZkSC9vNzI5THFiZWRsWklXVWVrYjVZZ3BVQzZ6SUl4VTZoUFFDZUF4empTR2h3Skw2UUV3QUdGUmptNVRZM1UvVHU2bTBQcmErRTJpTnowVStsWDBmb1d3aENIZ0lVck5qNDBPUi9EQjJBY0J6MXFQMi9rYnQ0WERYTmV1NFZldWo0U3lkL0hzOU5Qb2ZVbXh5em9lWXhqMTRhUThPcmMwZXFLSWhCLy9zd3hHWUNCbFFYRVkxN0FBQzZnbUhabjJBQUdIdm4ySE9tSDRWbHNHQnZwR3dnZ3VIMHVYUlhxN1haTC85V2FxcHZkRlRNOFRZQmcxTUM1S2VKQTNERHpoZzZrUUJ5VFlaVjZTeEFCY1NBQXM4Z21nVXpPaXVyL2F5K2pmN2YvLy8vLzNiL28zc1p6azNWTFdJaVFxVjJodmNhcHJtaHhiejJxZ0FFR0lZQUJDSTFkTTR0RE1LZ2RRRE1GQ2dPblhDNnpxazZ6THR6SGIrZS8vc3l4SGlDQmdRVEVzeDNBQkRZQXVHWm4yQUEvNi9WVHNRTlpZcGhvWWFBWWVUYWJLTU0yaTRkVlZYQVd3NjNObjNEZVFzdkF6UmxiL09vK2taaTRoRUxNUkpscEVDMW1GcmhzdGxFeWxFelV5QmFaa3BtVWdleUI5SVdEZ0lZRGdRR0VCd0dEZ0lZakVrVWtZREI3RnM1UkswNUZIWTlIS1J3dlpHSWFKeXN4THNsS2pQb01rc1RhYVJDQWFjaTMyU2dNWUJJNlpJbDJVU2VxLy83TXNTSkEwWndHUW90ZE1DQTF4eWhBYThJRVFhVmcwQ2dDQjBPaEkyU0NvQ0pEQUtSQ1VrRlFGZ1VpN1ovLy90cVRFRk5SVE11T1RrdU02cXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFyLyt6TEVtQUlHb0JrTkxIVEFRV2tOb29tTm1DT3FxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXEvL3N3eEpRRHhvZ3pCZ3poSUlBQUFEU0FBQUFFcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxJztcclxuY29uc3Qgc291bmRCeXRlQXJyYXkgPSBiYXNlNjRTb3VuZFRvQnl0ZUFycmF5KCBwaGV0QXVkaW9Db250ZXh0LCBzb3VuZFVSSSApO1xyXG5jb25zdCB1bmxvY2sgPSBhc3luY0xvYWRlci5jcmVhdGVMb2NrKCBzb3VuZFVSSSApO1xyXG5jb25zdCB3cmFwcGVkQXVkaW9CdWZmZXIgPSBuZXcgV3JhcHBlZEF1ZGlvQnVmZmVyKCk7XHJcblxyXG4vLyBzYWZlIHdheSB0byB1bmxvY2tcclxubGV0IHVubG9ja2VkID0gZmFsc2U7XHJcbmNvbnN0IHNhZmVVbmxvY2sgPSAoKSA9PiB7XHJcbiAgaWYgKCAhdW5sb2NrZWQgKSB7XHJcbiAgICB1bmxvY2soKTtcclxuICAgIHVubG9ja2VkID0gdHJ1ZTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBvbkRlY29kZVN1Y2Nlc3MgPSBkZWNvZGVkQXVkaW8gPT4ge1xyXG4gIGlmICggd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkudmFsdWUgPT09IG51bGwgKSB7XHJcbiAgICB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS5zZXQoIGRlY29kZWRBdWRpbyApO1xyXG4gICAgc2FmZVVubG9jaygpO1xyXG4gIH1cclxufTtcclxuY29uc3Qgb25EZWNvZGVFcnJvciA9IGRlY29kZUVycm9yID0+IHtcclxuICBjb25zb2xlLndhcm4oICdkZWNvZGUgb2YgYXVkaW8gZGF0YSBmYWlsZWQsIHVzaW5nIHN0dWJiZWQgc291bmQsIGVycm9yOiAnICsgZGVjb2RlRXJyb3IgKTtcclxuICB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS5zZXQoIHBoZXRBdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyKCAxLCAxLCBwaGV0QXVkaW9Db250ZXh0LnNhbXBsZVJhdGUgKSApO1xyXG4gIHNhZmVVbmxvY2soKTtcclxufTtcclxuY29uc3QgZGVjb2RlUHJvbWlzZSA9IHBoZXRBdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhKCBzb3VuZEJ5dGVBcnJheS5idWZmZXIsIG9uRGVjb2RlU3VjY2Vzcywgb25EZWNvZGVFcnJvciApO1xyXG5pZiAoIGRlY29kZVByb21pc2UgKSB7XHJcbiAgZGVjb2RlUHJvbWlzZVxyXG4gICAgLnRoZW4oIGRlY29kZWRBdWRpbyA9PiB7XHJcbiAgICAgIGlmICggd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkudmFsdWUgPT09IG51bGwgKSB7XHJcbiAgICAgICAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBkZWNvZGVkQXVkaW8gKTtcclxuICAgICAgICBzYWZlVW5sb2NrKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKVxyXG4gICAgLmNhdGNoKCBlID0+IHtcclxuICAgICAgY29uc29sZS53YXJuKCAncHJvbWlzZSByZWplY3Rpb24gY2F1Z2h0IGZvciBhdWRpbyBkZWNvZGUsIGVycm9yID0gJyArIGUgKTtcclxuICAgICAgc2FmZVVubG9jaygpO1xyXG4gICAgfSApO1xyXG59XHJcbmV4cG9ydCBkZWZhdWx0IHdyYXBwZWRBdWRpb0J1ZmZlcjsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0EsT0FBT0EsV0FBVyxNQUFNLG1DQUFtQztBQUMzRCxPQUFPQyxzQkFBc0IsTUFBTSwwQ0FBMEM7QUFDN0UsT0FBT0Msa0JBQWtCLE1BQU0sc0NBQXNDO0FBQ3JFLE9BQU9DLGdCQUFnQixNQUFNLG9DQUFvQztBQUVqRSxNQUFNQyxRQUFRLEdBQUcseS9HQUF5L0c7QUFDMWdILE1BQU1DLGNBQWMsR0FBR0osc0JBQXNCLENBQUVFLGdCQUFnQixFQUFFQyxRQUFTLENBQUM7QUFDM0UsTUFBTUUsTUFBTSxHQUFHTixXQUFXLENBQUNPLFVBQVUsQ0FBRUgsUUFBUyxDQUFDO0FBQ2pELE1BQU1JLGtCQUFrQixHQUFHLElBQUlOLGtCQUFrQixDQUFDLENBQUM7O0FBRW5EO0FBQ0EsSUFBSU8sUUFBUSxHQUFHLEtBQUs7QUFDcEIsTUFBTUMsVUFBVSxHQUFHQSxDQUFBLEtBQU07RUFDdkIsSUFBSyxDQUFDRCxRQUFRLEVBQUc7SUFDZkgsTUFBTSxDQUFDLENBQUM7SUFDUkcsUUFBUSxHQUFHLElBQUk7RUFDakI7QUFDRixDQUFDO0FBRUQsTUFBTUUsZUFBZSxHQUFHQyxZQUFZLElBQUk7RUFDdEMsSUFBS0osa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDQyxLQUFLLEtBQUssSUFBSSxFQUFHO0lBQzNETixrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNFLEdBQUcsQ0FBRUgsWUFBYSxDQUFDO0lBQzFERixVQUFVLENBQUMsQ0FBQztFQUNkO0FBQ0YsQ0FBQztBQUNELE1BQU1NLGFBQWEsR0FBR0MsV0FBVyxJQUFJO0VBQ25DQyxPQUFPLENBQUNDLElBQUksQ0FBRSwyREFBMkQsR0FBR0YsV0FBWSxDQUFDO0VBQ3pGVCxrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNFLEdBQUcsQ0FBRVosZ0JBQWdCLENBQUNpQixZQUFZLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRWpCLGdCQUFnQixDQUFDa0IsVUFBVyxDQUFFLENBQUM7RUFDaEhYLFVBQVUsQ0FBQyxDQUFDO0FBQ2QsQ0FBQztBQUNELE1BQU1ZLGFBQWEsR0FBR25CLGdCQUFnQixDQUFDb0IsZUFBZSxDQUFFbEIsY0FBYyxDQUFDbUIsTUFBTSxFQUFFYixlQUFlLEVBQUVLLGFBQWMsQ0FBQztBQUMvRyxJQUFLTSxhQUFhLEVBQUc7RUFDbkJBLGFBQWEsQ0FDVkcsSUFBSSxDQUFFYixZQUFZLElBQUk7SUFDckIsSUFBS0osa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDQyxLQUFLLEtBQUssSUFBSSxFQUFHO01BQzNETixrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNFLEdBQUcsQ0FBRUgsWUFBYSxDQUFDO01BQzFERixVQUFVLENBQUMsQ0FBQztJQUNkO0VBQ0YsQ0FBRSxDQUFDLENBQ0ZnQixLQUFLLENBQUVDLENBQUMsSUFBSTtJQUNYVCxPQUFPLENBQUNDLElBQUksQ0FBRSxxREFBcUQsR0FBR1EsQ0FBRSxDQUFDO0lBQ3pFakIsVUFBVSxDQUFDLENBQUM7RUFDZCxDQUFFLENBQUM7QUFDUDtBQUNBLGVBQWVGLGtCQUFrQiJ9