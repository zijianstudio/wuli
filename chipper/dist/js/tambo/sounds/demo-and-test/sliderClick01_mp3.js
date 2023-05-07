/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImJhc2U2NFNvdW5kVG9CeXRlQXJyYXkiLCJXcmFwcGVkQXVkaW9CdWZmZXIiLCJwaGV0QXVkaW9Db250ZXh0Iiwic291bmRVUkkiLCJzb3VuZEJ5dGVBcnJheSIsInVubG9jayIsImNyZWF0ZUxvY2siLCJ3cmFwcGVkQXVkaW9CdWZmZXIiLCJ1bmxvY2tlZCIsInNhZmVVbmxvY2siLCJvbkRlY29kZVN1Y2Nlc3MiLCJkZWNvZGVkQXVkaW8iLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJvbkRlY29kZUVycm9yIiwiZGVjb2RlRXJyb3IiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZUJ1ZmZlciIsInNhbXBsZVJhdGUiLCJkZWNvZGVQcm9taXNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYnVmZmVyIiwidGhlbiIsImNhdGNoIiwiZSJdLCJzb3VyY2VzIjpbInNsaWRlckNsaWNrMDFfbXAzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlICovXHJcbmltcG9ydCBhc3luY0xvYWRlciBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvYXN5bmNMb2FkZXIuanMnO1xyXG5pbXBvcnQgYmFzZTY0U291bmRUb0J5dGVBcnJheSBmcm9tICcuLi8uLi8uLi90YW1iby9qcy9iYXNlNjRTb3VuZFRvQnl0ZUFycmF5LmpzJztcclxuaW1wb3J0IFdyYXBwZWRBdWRpb0J1ZmZlciBmcm9tICcuLi8uLi8uLi90YW1iby9qcy9XcmFwcGVkQXVkaW9CdWZmZXIuanMnO1xyXG5pbXBvcnQgcGhldEF1ZGlvQ29udGV4dCBmcm9tICcuLi8uLi8uLi90YW1iby9qcy9waGV0QXVkaW9Db250ZXh0LmpzJztcclxuXHJcbmNvbnN0IHNvdW5kVVJJID0gJ2RhdGE6YXVkaW8vbXBlZztiYXNlNjQsLy91d0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBU1c1bWJ3QUFBQThBQUFBQ0FBQUhWd0NxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcS8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzhBQUFBQVRHRjJZelUzTGpJMEFBQUFBQUFBQUFBQUFBQUFKQUFBQUFBQUFBQUFCMWM2SFZYQkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRC8rN0JrQUFBRTR5blBuV3RBQUU3Z0NFaWdqQUFaM2Ewc0dlc0FBWXZENUdzQ1VBRUFBQVA2RzJ0ckRvbmxzd0NETU9QTXlsTnExT3RXTzFhT3RRT0kwTkFHSVJab1dKdllweDNwMHBCeXBSeUpCeUpCeXBoekpSeG54c2tRT09LeUZ5RWlFeEVWRVZGQkZpT0pEOXZ1Y3JkdHJiRDJKckVYWXpoM0ljakZKU1dMZWRQVHl1Tnh1Tnh1TVJpV1VsSmhoaGhubm5ubm5YcDdkSlNBZ0NBSUFtRDRQZytENElCakFZUGcrRC9sQVRCOEgvLzRQZytVREh5Ly9sd2ZCOFA2Q2dBUUJjdUQ0ZkFqb1BuNVFFQVFNZytIOTB1SC9MZ2c3eWdJTy9VQ0FJQStENFBueTRQZytENS85UUlRUWRnbUQvK29NYnVDWVBuNFlmd2NCQllQZytDQUlBZ0NId1FpY0h3Y09mVUdEQWdCaE1Jb0o5L2tUcjkwdzFoVXpFL09DV1NZVlpWM0RBakFyT1VSd015amhYelVIRDhCdzd4aU9pVkdBS0JDQmdmR01Ca3ZJTUd5QUZCR21RR1B5dzRHZUZEd0dRc1RBR0hZY1lHQ29INFVCNks4YUd3R0cwS2dHQUlKb0dLd1lvR0hRRW9lK1VoUVJQK0RkcFBBTGdZQXdLQXhBd1RBWkpwTXBHU2Z3RkFHa1ZMb1dYQllpRFpsRFVyK0h1aXpSNUVkQitvWlpGY1Y5WDhWcVZCeWh5U2NHV0xxQnNwLy8vTWk4WHZSUi8vLy9NakV1bXRSTkdKZGFrVFJpMy8rLy8vcUx4ZTZqSkljMy85enY5ZUtDQUlBd0Fnd0FnQUFBQUFPemt6SVJWTFY1Mm5WejdlcVBWVW9aMTkxVW8wSGdaTjkvZDBOMjkzVGttcnBlelA3cTZLaklYU3RpWHp2UHQ1NWYvWlBPck5uTnZabXNub2VpblFodXgxcHB5MVJkcTEvLy9XblZaMFVaLy95TnFaeUlZVXBKSUFBQkFaVmxjaElBQUFBQUFoVXBaZS8wekZjekR3MlZCQWFGRUJPa2NJR1NZbEFBRFFyQkFDUE15bTlBM2hZR1AvN3NtUVlnQWFHZXNodWRlQUFYRzhvK2NFSUFCUXhEc0ljOTRBSTRZQVh5NEFnQkY0WFpTUDFPUkJCeTNLWjJwbzZxYkVjQmJDQUR3Q0drOU1VVjZzS2tqVUdBTk1Xc2I1UGxNampkYlZEakZZR2FJeGNQVmV3dTVNV3o2Ny94LzJSOUVqeFkrdjhiL3JuRzlmUDNpZDVtYUh1UEpyUHRqZGM2dC9tdi9yLzRtWThQRHlsWStaOGJ6OVkrOC83K01ldnpyRy83N3B1YThXUGlkNXVhOXA0bi8vOWMrMlBYUHhpbU5aM3ZkdGIzLy8vLy8vLy9qTjcweENxL2x4Ri9xdEdXakFBSUJJTk5FQUFBQUNEMzdGNjc3dTdaaEFSQytZU0tWWElmeEF1VWhaRVg2aGlrVkdMSi9ybmtHTk4vOTByblFOVnFscC8rVm0wVHVSdFpTdC85cnN0blp4amJVMUszdVJ2Ly9kRGlYcXBaeU4vLzNNN01hVVVKQlAvOVhnbktMYUdwSENyQTRnSVNCRmVBekFxaHhMWlBRam9TRlZod2dxUllXUXZ4T2k1S3B1T1luUnBNMHFkUTFRN1VweW9heTBZazhvcG1KUEs1bTNCWVZiR2dzTEs5cmg4K3JpRStqVzlZTnZtdGE2OXExL3hhMi9pMXJiOWExOVhzV3Z0YTJyUG8xdldERjNWNjlyckVKOXEwSjliZWF4V3dVVkNHUWdwNEsvM2YvLy81QlhncG9LS3lDc2dwNEthQ2lzZ3JnVU5paTRvTHdLY0ZCV0l2RUYrRU1LQmYvL2xUcFo2ZzZWRFJiOHFHaEYveXp4S01QQ0wrZEV2TFBCVVllLy8vaVZ3aWlJT2xRMnNGVG9OREFhRG9sT25mK1ZPaUpRZFRFRk5SVE11TVRBd0lDaGhiSEJvWVNBeUtWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWUT09JztcclxuY29uc3Qgc291bmRCeXRlQXJyYXkgPSBiYXNlNjRTb3VuZFRvQnl0ZUFycmF5KCBwaGV0QXVkaW9Db250ZXh0LCBzb3VuZFVSSSApO1xyXG5jb25zdCB1bmxvY2sgPSBhc3luY0xvYWRlci5jcmVhdGVMb2NrKCBzb3VuZFVSSSApO1xyXG5jb25zdCB3cmFwcGVkQXVkaW9CdWZmZXIgPSBuZXcgV3JhcHBlZEF1ZGlvQnVmZmVyKCk7XHJcblxyXG4vLyBzYWZlIHdheSB0byB1bmxvY2tcclxubGV0IHVubG9ja2VkID0gZmFsc2U7XHJcbmNvbnN0IHNhZmVVbmxvY2sgPSAoKSA9PiB7XHJcbiAgaWYgKCAhdW5sb2NrZWQgKSB7XHJcbiAgICB1bmxvY2soKTtcclxuICAgIHVubG9ja2VkID0gdHJ1ZTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBvbkRlY29kZVN1Y2Nlc3MgPSBkZWNvZGVkQXVkaW8gPT4ge1xyXG4gIGlmICggd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkudmFsdWUgPT09IG51bGwgKSB7XHJcbiAgICB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS5zZXQoIGRlY29kZWRBdWRpbyApO1xyXG4gICAgc2FmZVVubG9jaygpO1xyXG4gIH1cclxufTtcclxuY29uc3Qgb25EZWNvZGVFcnJvciA9IGRlY29kZUVycm9yID0+IHtcclxuICBjb25zb2xlLndhcm4oICdkZWNvZGUgb2YgYXVkaW8gZGF0YSBmYWlsZWQsIHVzaW5nIHN0dWJiZWQgc291bmQsIGVycm9yOiAnICsgZGVjb2RlRXJyb3IgKTtcclxuICB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS5zZXQoIHBoZXRBdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyKCAxLCAxLCBwaGV0QXVkaW9Db250ZXh0LnNhbXBsZVJhdGUgKSApO1xyXG4gIHNhZmVVbmxvY2soKTtcclxufTtcclxuY29uc3QgZGVjb2RlUHJvbWlzZSA9IHBoZXRBdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhKCBzb3VuZEJ5dGVBcnJheS5idWZmZXIsIG9uRGVjb2RlU3VjY2Vzcywgb25EZWNvZGVFcnJvciApO1xyXG5pZiAoIGRlY29kZVByb21pc2UgKSB7XHJcbiAgZGVjb2RlUHJvbWlzZVxyXG4gICAgLnRoZW4oIGRlY29kZWRBdWRpbyA9PiB7XHJcbiAgICAgIGlmICggd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkudmFsdWUgPT09IG51bGwgKSB7XHJcbiAgICAgICAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBkZWNvZGVkQXVkaW8gKTtcclxuICAgICAgICBzYWZlVW5sb2NrKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKVxyXG4gICAgLmNhdGNoKCBlID0+IHtcclxuICAgICAgY29uc29sZS53YXJuKCAncHJvbWlzZSByZWplY3Rpb24gY2F1Z2h0IGZvciBhdWRpbyBkZWNvZGUsIGVycm9yID0gJyArIGUgKTtcclxuICAgICAgc2FmZVVubG9jaygpO1xyXG4gICAgfSApO1xyXG59XHJcbmV4cG9ydCBkZWZhdWx0IHdyYXBwZWRBdWRpb0J1ZmZlcjsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0EsT0FBT0EsV0FBVyxNQUFNLHNDQUFzQztBQUM5RCxPQUFPQyxzQkFBc0IsTUFBTSw2Q0FBNkM7QUFDaEYsT0FBT0Msa0JBQWtCLE1BQU0seUNBQXlDO0FBQ3hFLE9BQU9DLGdCQUFnQixNQUFNLHVDQUF1QztBQUVwRSxNQUFNQyxRQUFRLEdBQUcscStFQUFxK0U7QUFDdC9FLE1BQU1DLGNBQWMsR0FBR0osc0JBQXNCLENBQUVFLGdCQUFnQixFQUFFQyxRQUFTLENBQUM7QUFDM0UsTUFBTUUsTUFBTSxHQUFHTixXQUFXLENBQUNPLFVBQVUsQ0FBRUgsUUFBUyxDQUFDO0FBQ2pELE1BQU1JLGtCQUFrQixHQUFHLElBQUlOLGtCQUFrQixDQUFDLENBQUM7O0FBRW5EO0FBQ0EsSUFBSU8sUUFBUSxHQUFHLEtBQUs7QUFDcEIsTUFBTUMsVUFBVSxHQUFHQSxDQUFBLEtBQU07RUFDdkIsSUFBSyxDQUFDRCxRQUFRLEVBQUc7SUFDZkgsTUFBTSxDQUFDLENBQUM7SUFDUkcsUUFBUSxHQUFHLElBQUk7RUFDakI7QUFDRixDQUFDO0FBRUQsTUFBTUUsZUFBZSxHQUFHQyxZQUFZLElBQUk7RUFDdEMsSUFBS0osa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDQyxLQUFLLEtBQUssSUFBSSxFQUFHO0lBQzNETixrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNFLEdBQUcsQ0FBRUgsWUFBYSxDQUFDO0lBQzFERixVQUFVLENBQUMsQ0FBQztFQUNkO0FBQ0YsQ0FBQztBQUNELE1BQU1NLGFBQWEsR0FBR0MsV0FBVyxJQUFJO0VBQ25DQyxPQUFPLENBQUNDLElBQUksQ0FBRSwyREFBMkQsR0FBR0YsV0FBWSxDQUFDO0VBQ3pGVCxrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNFLEdBQUcsQ0FBRVosZ0JBQWdCLENBQUNpQixZQUFZLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRWpCLGdCQUFnQixDQUFDa0IsVUFBVyxDQUFFLENBQUM7RUFDaEhYLFVBQVUsQ0FBQyxDQUFDO0FBQ2QsQ0FBQztBQUNELE1BQU1ZLGFBQWEsR0FBR25CLGdCQUFnQixDQUFDb0IsZUFBZSxDQUFFbEIsY0FBYyxDQUFDbUIsTUFBTSxFQUFFYixlQUFlLEVBQUVLLGFBQWMsQ0FBQztBQUMvRyxJQUFLTSxhQUFhLEVBQUc7RUFDbkJBLGFBQWEsQ0FDVkcsSUFBSSxDQUFFYixZQUFZLElBQUk7SUFDckIsSUFBS0osa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDQyxLQUFLLEtBQUssSUFBSSxFQUFHO01BQzNETixrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNFLEdBQUcsQ0FBRUgsWUFBYSxDQUFDO01BQzFERixVQUFVLENBQUMsQ0FBQztJQUNkO0VBQ0YsQ0FBRSxDQUFDLENBQ0ZnQixLQUFLLENBQUVDLENBQUMsSUFBSTtJQUNYVCxPQUFPLENBQUNDLElBQUksQ0FBRSxxREFBcUQsR0FBR1EsQ0FBRSxDQUFDO0lBQ3pFakIsVUFBVSxDQUFDLENBQUM7RUFDZCxDQUFFLENBQUM7QUFDUDtBQUNBLGVBQWVGLGtCQUFrQiJ9