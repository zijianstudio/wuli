/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';
const soundURI = 'data:audio/mpeg;base64,//swxAAABaABI1QxADFMky13MMACgAKQuKNIB4gBAMCQ4D5sQPEFpd5R1Cw/Lg//KOLjgxg/g+D7+XD5c/wf//4gqCAkURkXj1u2FoAAAALeJPp0AZEcXPL/aZPqXuBcnEwmvv41OM4LaNYcnj90sZ4d9EH5MPHDw7+JK5/a/PXdMNr0aH80u50zLj+U6i2rdRvvXbWqBAxYJNxg//syxAMASFibX12WgDD9kWspp5z3AWPnn2MTRIxsMIDVEDpTD6madLilQVLO15ODKjApC88Tg1qK9RbjUU+jmXMv1I6XV0daubSqy1klqrcVrAARdp2gINNtINDGFrj9uAc98KQnEMBNP4AIcNLeF2KHVCFJTeA6rfocTiEApYWF3461SPOmlDudodOJfQ+K7dUAIUAAAAkrqEgCBf/7MsQFggjkb0Du6UexB4noKc0c9qZDx2aHBiYBgQSBiaXQmIxql5mRp7j7UYaFGYGoQdcLAEiK1IiOD1m5bUF3zcVaMRq0JwhnkLZbKC1x64DJygQAGKBim8CQyak4Zm0ToGBUMGR+wCnTCQU4CS8WtiIGHdYE9KVPGtmmK8/PXNzur+OhLiolz3pevf//85W56wAggBAQHKxYg+b/+zLEBQNIVDcw7ndCsQCHJI3u7FQjFhvqTHR4HFAqGAgYmlvTiyogwIj1hjZWJfBogMHYLvBSkBEiGxqmHQjQsfcE0rkf///27P///0ACAwYwyDAqBJMAkMowbnjDpc9DCwMzF0GD77kDT0OTCcXTnoc7ijIghwxVmM3C1YntFBsWCaa0qaKZ6iXJ3/+tAACRtsImAyGCFqpgsBxr//swxAeACDAxLU7zQnDUBWd0zegGPBxxAcGIwWYaFh8sWHIRGGGGXcHVHNtLRUQHSpHeEQ1asVrt1kPq6ndPf3f93//Z/o7wACG2sABIlADoJIMgyBBalhyL50H5bl51srgg2GH6BSKV2IB3ZK1O///prXbQzaQf+r/R/rUAAFFPSQRpQAahD5pVhis4wo2YEmqF3I2GSEmF1Uir//syxA+ABdAfN6TkwTCZAuZ0xJhOG9Xo/zmMGJ7sU/p7ej6egEgkK7WyiIQbUVAaAUcOgZCDBzp1PDRLDQ4f+jdlf/U9Z3Jf//+h23v2AAAAEAAUEfC0SQmQGCEhr///////iypMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/7MsQpA8MkGO2hGGCwAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo=';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImJhc2U2NFNvdW5kVG9CeXRlQXJyYXkiLCJXcmFwcGVkQXVkaW9CdWZmZXIiLCJwaGV0QXVkaW9Db250ZXh0Iiwic291bmRVUkkiLCJzb3VuZEJ5dGVBcnJheSIsInVubG9jayIsImNyZWF0ZUxvY2siLCJ3cmFwcGVkQXVkaW9CdWZmZXIiLCJ1bmxvY2tlZCIsInNhZmVVbmxvY2siLCJvbkRlY29kZVN1Y2Nlc3MiLCJkZWNvZGVkQXVkaW8iLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJvbkRlY29kZUVycm9yIiwiZGVjb2RlRXJyb3IiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZUJ1ZmZlciIsInNhbXBsZVJhdGUiLCJkZWNvZGVQcm9taXNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYnVmZmVyIiwidGhlbiIsImNhdGNoIiwiZSJdLCJzb3VyY2VzIjpbInN0YWNjYXRvRF9tcDMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgKi9cclxuaW1wb3J0IGFzeW5jTG9hZGVyIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hc3luY0xvYWRlci5qcyc7XHJcbmltcG9ydCBiYXNlNjRTb3VuZFRvQnl0ZUFycmF5IGZyb20gJy4uLy4uLy4uL3RhbWJvL2pzL2Jhc2U2NFNvdW5kVG9CeXRlQXJyYXkuanMnO1xyXG5pbXBvcnQgV3JhcHBlZEF1ZGlvQnVmZmVyIGZyb20gJy4uLy4uLy4uL3RhbWJvL2pzL1dyYXBwZWRBdWRpb0J1ZmZlci5qcyc7XHJcbmltcG9ydCBwaGV0QXVkaW9Db250ZXh0IGZyb20gJy4uLy4uLy4uL3RhbWJvL2pzL3BoZXRBdWRpb0NvbnRleHQuanMnO1xyXG5cclxuY29uc3Qgc291bmRVUkkgPSAnZGF0YTphdWRpby9tcGVnO2Jhc2U2NCwvL3N3eEFBQUJhQUJJMVF4QURGTWt5MTNNTUFDZ0FLUXVLTklCNGdCQU1DUTRENXNRUEVGcGQ1UjFDdy9MZy8vS09Mamd4Zy9nK0Q3K1hENWMvd2YvLzRncUNBa1VSa1hqMXUyRm9BQUFBTGVKUHAwQVpFY1hQTC9hWlBxWHVCY25Fd212djQxT000TGFOWWNuajkwc1o0ZDlFSDVNUEhEdzcrSks1L2EvUFhkTU5yMGFIODB1NTB6TGorVTZpMnJkUnZ2WGJXcUJBeFlKTnhnLy9zeXhBTUFTRmliWDEyV2dERDlrV3NwcDV6M0FXUG5uMk1UUkl4c01JRFZFRHBURDZtYWRMaWxRVkxPMTVPREtqQXBDODhUZzFxSzlSYmpVVStqbVhNdjFJNlhWMGRhdWJTcXkxa2xxcmNWckFBUmRwMmdJTk50SU5ER0Zyajl1QWM5OEtRbkVNQk5QNEFJY05MZUYyS0hWQ0ZKVGVBNnJmb2NUaUVBcFlXRjM0NjFTUE9tbER1ZG9kT0pmUStLN2RVQUlVQUFBQWtycUVnQ0JmLzdNc1FGZ2dqa2IwRHU2VWV4QjRub0tjMGM5cVpEeDJhSEJpWUJnUVNCaWFYUW1JeHFsNW1ScDdqN1VZYUZHWUdvUWRjTEFFaUsxSWlPRDFtNWJVRjN6Y1ZhTVJxMEp3aG5rTFpiS0MxeDY0REp5Z1FBR0tCaW04Q1F5YWs0Wm0wVG9HQlVNR1Ird0NuVENRVTRDUzhXdGlJR0hkWUU5S1ZQR3RtbUs4L1BYTnp1citPaExpb2x6M3BldmYvLzg1VzU2d0FnZ0JBUUhLeFlnK2IvK3pMRUJRTklWRGN3N25kQ3NRQ0hKSTN1N0ZRakZodnFUSFI0SEZBcUdBZ1ltbHZUaXlvZ3dJajFoalpXSmZCb2dNSFlMdkJTa0JFaUd4cW1IUWpRc2ZjRTBya2YvLy8yN1AvLy8wQUNBd1l3eURBcUJKTUFrTW93Ym5qRHBjOURDd016RjBHRDc3a0RUME9UQ2NYVG5vYzdpaklnaHd4Vm1NM0MxWW50RkJzV0NhYTBxYUtaNmlYSjMvK3RBQUNSdHNJbUF5R0NGcXBnc0J4ci8vc3d4QWVBQ0RBeExVN3pRbkRVQldkMHplZ0dQQnh4QWNHSXdXWWFGaDhzV0hJUkdHR0dYY0hWSE50TFJVUUhTcEhlRVExYXNWcnQxa1BxNm5kUGYzZjkzLy9aL283d0FDRzJzQUJJbEFEb0pJTWd5QkJhbGh5TDUwSDVibDUxc3JnZzJHSDZCU0tWMklCM1pLMU8vLy9wclhiUXphUWYrci9SL3JVQUFGRlBTUVJwUUFhaEQ1cFZoaXM0d28yWUVtcUYzSTJHU0VtRjFVaXIvL3N5eEErQUJkQWZONlRrd1RDWkF1WjB4SmhPRzlYby96bU1HSjdzVS9wN2VqNmVnRWdrSzdXeWlJUWJVVkFhQVVjT2daQ0RCenAxUERSTERRNGYramRsZi9VOVozSmYvLytoMjN2MkFBQUFFQUFVRWZDMFNRbVFHQ0Voci8vLy8vLy9peXBNUVUxRk15NDVPUzQxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXYvN01zUXBBOE1rR08yaEdHQ3dBQUEwZ0FBQUJLcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxbz0nO1xyXG5jb25zdCBzb3VuZEJ5dGVBcnJheSA9IGJhc2U2NFNvdW5kVG9CeXRlQXJyYXkoIHBoZXRBdWRpb0NvbnRleHQsIHNvdW5kVVJJICk7XHJcbmNvbnN0IHVubG9jayA9IGFzeW5jTG9hZGVyLmNyZWF0ZUxvY2soIHNvdW5kVVJJICk7XHJcbmNvbnN0IHdyYXBwZWRBdWRpb0J1ZmZlciA9IG5ldyBXcmFwcGVkQXVkaW9CdWZmZXIoKTtcclxuXHJcbi8vIHNhZmUgd2F5IHRvIHVubG9ja1xyXG5sZXQgdW5sb2NrZWQgPSBmYWxzZTtcclxuY29uc3Qgc2FmZVVubG9jayA9ICgpID0+IHtcclxuICBpZiAoICF1bmxvY2tlZCApIHtcclxuICAgIHVubG9jaygpO1xyXG4gICAgdW5sb2NrZWQgPSB0cnVlO1xyXG4gIH1cclxufTtcclxuXHJcbmNvbnN0IG9uRGVjb2RlU3VjY2VzcyA9IGRlY29kZWRBdWRpbyA9PiB7XHJcbiAgaWYgKCB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS52YWx1ZSA9PT0gbnVsbCApIHtcclxuICAgIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggZGVjb2RlZEF1ZGlvICk7XHJcbiAgICBzYWZlVW5sb2NrKCk7XHJcbiAgfVxyXG59O1xyXG5jb25zdCBvbkRlY29kZUVycm9yID0gZGVjb2RlRXJyb3IgPT4ge1xyXG4gIGNvbnNvbGUud2FybiggJ2RlY29kZSBvZiBhdWRpbyBkYXRhIGZhaWxlZCwgdXNpbmcgc3R1YmJlZCBzb3VuZCwgZXJyb3I6ICcgKyBkZWNvZGVFcnJvciApO1xyXG4gIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggcGhldEF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXIoIDEsIDEsIHBoZXRBdWRpb0NvbnRleHQuc2FtcGxlUmF0ZSApICk7XHJcbiAgc2FmZVVubG9jaygpO1xyXG59O1xyXG5jb25zdCBkZWNvZGVQcm9taXNlID0gcGhldEF1ZGlvQ29udGV4dC5kZWNvZGVBdWRpb0RhdGEoIHNvdW5kQnl0ZUFycmF5LmJ1ZmZlciwgb25EZWNvZGVTdWNjZXNzLCBvbkRlY29kZUVycm9yICk7XHJcbmlmICggZGVjb2RlUHJvbWlzZSApIHtcclxuICBkZWNvZGVQcm9taXNlXHJcbiAgICAudGhlbiggZGVjb2RlZEF1ZGlvID0+IHtcclxuICAgICAgaWYgKCB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS52YWx1ZSA9PT0gbnVsbCApIHtcclxuICAgICAgICB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS5zZXQoIGRlY29kZWRBdWRpbyApO1xyXG4gICAgICAgIHNhZmVVbmxvY2soKTtcclxuICAgICAgfVxyXG4gICAgfSApXHJcbiAgICAuY2F0Y2goIGUgPT4ge1xyXG4gICAgICBjb25zb2xlLndhcm4oICdwcm9taXNlIHJlamVjdGlvbiBjYXVnaHQgZm9yIGF1ZGlvIGRlY29kZSwgZXJyb3IgPSAnICsgZSApO1xyXG4gICAgICBzYWZlVW5sb2NrKCk7XHJcbiAgICB9ICk7XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgd3JhcHBlZEF1ZGlvQnVmZmVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQSxPQUFPQSxXQUFXLE1BQU0sc0NBQXNDO0FBQzlELE9BQU9DLHNCQUFzQixNQUFNLDZDQUE2QztBQUNoRixPQUFPQyxrQkFBa0IsTUFBTSx5Q0FBeUM7QUFDeEUsT0FBT0MsZ0JBQWdCLE1BQU0sdUNBQXVDO0FBRXBFLE1BQU1DLFFBQVEsR0FBRyxpOUNBQWk5QztBQUNsK0MsTUFBTUMsY0FBYyxHQUFHSixzQkFBc0IsQ0FBRUUsZ0JBQWdCLEVBQUVDLFFBQVMsQ0FBQztBQUMzRSxNQUFNRSxNQUFNLEdBQUdOLFdBQVcsQ0FBQ08sVUFBVSxDQUFFSCxRQUFTLENBQUM7QUFDakQsTUFBTUksa0JBQWtCLEdBQUcsSUFBSU4sa0JBQWtCLENBQUMsQ0FBQzs7QUFFbkQ7QUFDQSxJQUFJTyxRQUFRLEdBQUcsS0FBSztBQUNwQixNQUFNQyxVQUFVLEdBQUdBLENBQUEsS0FBTTtFQUN2QixJQUFLLENBQUNELFFBQVEsRUFBRztJQUNmSCxNQUFNLENBQUMsQ0FBQztJQUNSRyxRQUFRLEdBQUcsSUFBSTtFQUNqQjtBQUNGLENBQUM7QUFFRCxNQUFNRSxlQUFlLEdBQUdDLFlBQVksSUFBSTtFQUN0QyxJQUFLSixrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNDLEtBQUssS0FBSyxJQUFJLEVBQUc7SUFDM0ROLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0UsR0FBRyxDQUFFSCxZQUFhLENBQUM7SUFDMURGLFVBQVUsQ0FBQyxDQUFDO0VBQ2Q7QUFDRixDQUFDO0FBQ0QsTUFBTU0sYUFBYSxHQUFHQyxXQUFXLElBQUk7RUFDbkNDLE9BQU8sQ0FBQ0MsSUFBSSxDQUFFLDJEQUEyRCxHQUFHRixXQUFZLENBQUM7RUFDekZULGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0UsR0FBRyxDQUFFWixnQkFBZ0IsQ0FBQ2lCLFlBQVksQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFakIsZ0JBQWdCLENBQUNrQixVQUFXLENBQUUsQ0FBQztFQUNoSFgsVUFBVSxDQUFDLENBQUM7QUFDZCxDQUFDO0FBQ0QsTUFBTVksYUFBYSxHQUFHbkIsZ0JBQWdCLENBQUNvQixlQUFlLENBQUVsQixjQUFjLENBQUNtQixNQUFNLEVBQUViLGVBQWUsRUFBRUssYUFBYyxDQUFDO0FBQy9HLElBQUtNLGFBQWEsRUFBRztFQUNuQkEsYUFBYSxDQUNWRyxJQUFJLENBQUViLFlBQVksSUFBSTtJQUNyQixJQUFLSixrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNDLEtBQUssS0FBSyxJQUFJLEVBQUc7TUFDM0ROLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0UsR0FBRyxDQUFFSCxZQUFhLENBQUM7TUFDMURGLFVBQVUsQ0FBQyxDQUFDO0lBQ2Q7RUFDRixDQUFFLENBQUMsQ0FDRmdCLEtBQUssQ0FBRUMsQ0FBQyxJQUFJO0lBQ1hULE9BQU8sQ0FBQ0MsSUFBSSxDQUFFLHFEQUFxRCxHQUFHUSxDQUFFLENBQUM7SUFDekVqQixVQUFVLENBQUMsQ0FBQztFQUNkLENBQUUsQ0FBQztBQUNQO0FBQ0EsZUFBZUYsa0JBQWtCIn0=