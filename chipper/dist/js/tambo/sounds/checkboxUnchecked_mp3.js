/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';
const soundURI = 'data:audio/mpeg;base64,//swxAAAB3BPLHWkgAEQCy03MPADAYAEAMYCIAZnV5vYJv2ZoxqgRhBhkBBkRJhwZa9g7/tbYe1+jC4beogQMZ4Z5zn7mgQQdxOH//////6SQAIzbNJJdtgAAAAAAHjcV2B1EBJLBB4wV9rCWp5eq0EHE43FpgLhkjdNEqGhFqhSQlQ4TwqZdZ7fN/Hm6YKiu/33NoUAACApAAAI//syxAOCSGxzQ123gDkDjCZJvLDmDQ0HhMRgBVEjBws2OIM9Cky1VU0REAhgK47nqWwHAkIYcB7ePHvXeo2cV1nG4uL6rjXjzXt951bbjQs/hQuyxEeFQaEGUgRohuYvQkhIfrBnlFyQoUla/qMye4qGxUqjhxTJIFPCOfamTewcOH2SkYCFVa21OLZrySygx+bV4B1xgBhA1DB0Bf/7MsQFAAfISyw1x4AxL4ssNzGAAigYRigH0YoI18mGQKOgZ+FY0UWnyRsLJgZYCShStOpdQYKdeV5/q9jbIDYPkLAYtiTETvrZLIYEb2u2uogAAAAAAhkChusjjbfkXleOGpiySKjhjUIlMla3JEsHQqgBs2ns50DIPtDIgjJE46JnUPRPPPOG5G8/yKxQADAZFTP1KgAAIX0AGkv/+zLEA4IIRJ9DPaUAMQuN5o2tmYqinck4ucZbhxEBHFls3WFfhr6dyvz3zgxEmEABChAREwQIwJRfc1jx6QHFWNNqQkrG5wvNNbdf1b//kxUACACHIGAlgmUgpccbebl+BkKCZXQyCAwpKkwRUzEk7AIAwgTBahUNNHisAuFoYmM12rXbbUJ2v5Cwa++fDf///+mgDERUoJgUemjg//swxAUDSExLJi3phxEQCmQBrbx0BkCOdSyG/xxiJyFwYUOAZiABRh0Zh64k8Pj7NAJTjWFStFgyvxBK5IhTLDstCt9Y/SAqpLqiYU1gRqYoIfCMbtwYtoG77YMaQdBGoPhoQOPIxjIsCrswBnOHTzqNAI9TIQEiAQc0oSX9JssKWBt5O9HJA8fEWBHxeXEQzXUAKsQAXwMjEM3O//syxAUCSDxVLM1lJzEbCWPFrmxBNqHM4RC+k5ZUzwUcEaSmKZZCdwJRBNZkJiwDdFN36YdSqdqUT6pYDZ5ScxSDVfZPSpL8M//b6NxDNtjDhTpxDmMDKQMMw1k08tNDTxrGMKLQxRDCMevDKlACBZi1WYsoiEOBwEwdI9e0vdBptNKZfgzJsVH29qtOpUET8k9v4mAAAExTEHgUKP/7MsQEggfQUyJNc0QA2AklmY2YpukjMG6N4KPFG4xmOjdBnIQqBgcbgGQGmcNGdaHtBQplqcsNdnbkroa0zXiUXxyr9wz/WF9usagQAkSHDHulGU3DjA44xIgQwADplHVAGUl7G/MbPAcXSMAgRGUSoN9OUp+zGuLf///V3//+ugKcCSTofFaj5oNcoyUgyJfAIDMwsQBGeEBQiGf/+zLEDgJHUD8UDOksQN6F39wxsAA60sBDGHr5bR5oZBEMkscKhnEIJPCh6j//////+n6AmBgKjhFZNEIgmCyGD2UQjAVEweC2peqxVyOIpL/WDXZ7cNcFTtQdJCEFQVGLPFgaUHJ6dhojDlVttOCJU4BB0qsXplV/tncqptv/p//+n//6abf////9QTTTTRVV9UEJK0kIixWmqoc///swxBiDxvgCi4CEYAgAADSAAAAE/1TTVEWK6UxBTUUzLjk5LjNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImJhc2U2NFNvdW5kVG9CeXRlQXJyYXkiLCJXcmFwcGVkQXVkaW9CdWZmZXIiLCJwaGV0QXVkaW9Db250ZXh0Iiwic291bmRVUkkiLCJzb3VuZEJ5dGVBcnJheSIsInVubG9jayIsImNyZWF0ZUxvY2siLCJ3cmFwcGVkQXVkaW9CdWZmZXIiLCJ1bmxvY2tlZCIsInNhZmVVbmxvY2siLCJvbkRlY29kZVN1Y2Nlc3MiLCJkZWNvZGVkQXVkaW8iLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJvbkRlY29kZUVycm9yIiwiZGVjb2RlRXJyb3IiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZUJ1ZmZlciIsInNhbXBsZVJhdGUiLCJkZWNvZGVQcm9taXNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYnVmZmVyIiwidGhlbiIsImNhdGNoIiwiZSJdLCJzb3VyY2VzIjpbImNoZWNrYm94VW5jaGVja2VkX21wMy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSAqL1xyXG5pbXBvcnQgYXN5bmNMb2FkZXIgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FzeW5jTG9hZGVyLmpzJztcclxuaW1wb3J0IGJhc2U2NFNvdW5kVG9CeXRlQXJyYXkgZnJvbSAnLi4vLi4vdGFtYm8vanMvYmFzZTY0U291bmRUb0J5dGVBcnJheS5qcyc7XHJcbmltcG9ydCBXcmFwcGVkQXVkaW9CdWZmZXIgZnJvbSAnLi4vLi4vdGFtYm8vanMvV3JhcHBlZEF1ZGlvQnVmZmVyLmpzJztcclxuaW1wb3J0IHBoZXRBdWRpb0NvbnRleHQgZnJvbSAnLi4vLi4vdGFtYm8vanMvcGhldEF1ZGlvQ29udGV4dC5qcyc7XHJcblxyXG5jb25zdCBzb3VuZFVSSSA9ICdkYXRhOmF1ZGlvL21wZWc7YmFzZTY0LC8vc3d4QUFBQjNCUExIV2tnQUVRQ3kwM01QQURBWUFFQU1ZQ0lBWm5WNXZZSnYyWm94cWdSaEJoa0JCa1JKaHdaYTlnNy90YlllMStqQzRiZW9nUU1aNFo1em43bWdRUWR4T0gvLy8vLy82U1FBSXpiTkpKZHRnQUFBQUFBSGpjVjJCMUVCSkxCQjR3VjlyQ1dwNWVxMEVIRTQzRnBnTGhramRORXFHaEZxaFNRbFE0VHdxWmRaN2ZOL0htNllLaXUvMzNOb1VBQUNBcEFBQUkvL3N5eEFPQ1NHeHpRMTIzZ0RrRGpDWkp2TERtRFEwSGhNUmdCVkVqQndzMk9JTTlDa3kxVlUwUkVBaGdLNDducVd3SEFrSVljQjdlUEh2WGVvMmNWMW5HNHVMNnJqWGp6WHQ5NTFiYmpRcy9oUXV5eEVlRlFhRUdVZ1JvaHVZdlFraElmckJubEZ5UW9VbGEvcU15ZTRxR3hVcWpoeFRKSUZQQ09mYW1UZXdjT0gyU2tZQ0ZWYTIxT0xacnlTeWd4K2JWNEIxeGdCaEExREIwQmYvN01zUUZBQWZJU3l3MXg0QXhMNHNzTnpHQUFpZ1lSaWdIMFlvSTE4bUdRS09nWitGWTBVV255UnNMSmdaWUNTaFN0T3BkUVlLZGVWNS9xOWpiSURZUGtMQVl0aVRFVHZyWkxJWUViMnUydW9nQUFBQUFBaGtDaHVzampiZmtYbGVPR3BpeVNLamhqVUlsTWxhM0pFc0hRcWdCczJuczUwRElQdERJZ2pKRTQ2Sm5VUFJQUFBPRzVHOC95S3hRQURBWkZUUDFLZ0FBSVgwQUdrdi8rekxFQTRJSVJKOURQYVVBTVF1TjVvMnRtWXFpbmNrNHVjWmJoeEVCSEZsczNXRmZocjZkeXZ6M3pneEVtRUFCQ2hBUkV3UUl3SlJmYzFqeDZRSEZXTk5xUWtyRzV3dk5OYmRmMWIvL2t4VUFDQUNISUdBbGdtVWdwY2NiZWJsK0JrS0NaWFF5Q0F3cEtrd1JVekVrN0FJQXdnVEJhaFVOTkhpc0F1Rm9ZbU0xMnJYYmJVSjJ2NUN3YSsrZkRmLy8vK21nREVSVW9KZ1VlbWpnLy9zd3hBVURTRXhMSmkzcGh4RVFDbVFCcmJ4MEJrQ09kU3lHL3h4aUp5RndZVU9BWmlBQlJoMFpoNjRrOFBqN05BSlRqV0ZTdEZneXZ4Qks1SWhUTERzdEN0OVkvU0FxcExxaVlVMWdScVlvSWZDTWJ0d1l0b0c3N1lNYVFkQkdvUGhvUU9QSXhqSXNDcnN3Qm5PSFR6cU5BSTlUSVFFaUFRYzBvU1g5SnNzS1dCdDVPOUhKQThmRVdCSHhlWEVRelhVQUtzUUFYd01qRU0zTy8vc3l4QVVDU0R4VkxNMWxKekViQ1dQRnJteEJOcUhNNFJDK2s1WlV6d1VjRWFTbUtaWkNkd0pSQk5aa0ppd0RkRk4zNllkU3FkcVVUNnBZRFo1U2N4U0RWZlpQU3BMOE0vL2I2TnhETnRqRGhUcHhEbU1ES1FNTXcxazA4dE5EVHhyR01LTFF4UkRDTWV2REtsQUNCWmkxV1lzb2lFT0J3RXdkSTllMHZkQnB0TktaZmd6SnNWSDI5cXRPcFVFVDhrOXY0bUFBQUV4VEVIZ1VLUC83TXNRRWdnZlFVeUpOYzBRQTJBa2xtWTJZcHVrak1HNk40S1BGRzR4bU9qZEJuSVFxQmdjYmdHUUdtY05HZGFIdEJRcGxxY3NOZG5ia3JvYTB6WGlVWHh5cjl3ei9XRjl1c2FnUUFrU0hESHVsR1UzRGpBNDR4SWdRd0FEcGxIVkFHVWw3Ry9NYlBBY1hTTUFnUkdVU29OOU9VcCt6R3VMZi8vL1YzLy8rdWdLY0NTVG9mRmFqNW9OY295VWd5SmZBSURNd3NRQkdlRUJRaUdmLyt6TEVEZ0pIVUQ4VURPa3NRTjZGMzl3eHNBQTYwc0JER0hyNWJSNW9aQkVNa3NjS2huRUlKUENoNmovLy8vLy8rbjZBbUJnS2poRlpORUlnbUN5R0QyVVFqQVZFd2VDMnBlcXhWeU9JcEwvV0RYWjdjTmNGVHRRZEpDRUZRVkdMUEZnYVVISjZkaG9qRGxWdHRPQ0pVNEJCMHFzWHBsVi90bmNxcHR2L3AvLytuLy82YWJmLy8vLzlRVFRUVFJWVjlVRUpLMGtJaXhXbXFvYy8vL3N3eEJpRHh2Z0NpNENFWUFnQUFEU0FBQUFFLzFUVFZFV0s2VXhCVFVVekxqazVMak5WVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWJztcclxuY29uc3Qgc291bmRCeXRlQXJyYXkgPSBiYXNlNjRTb3VuZFRvQnl0ZUFycmF5KCBwaGV0QXVkaW9Db250ZXh0LCBzb3VuZFVSSSApO1xyXG5jb25zdCB1bmxvY2sgPSBhc3luY0xvYWRlci5jcmVhdGVMb2NrKCBzb3VuZFVSSSApO1xyXG5jb25zdCB3cmFwcGVkQXVkaW9CdWZmZXIgPSBuZXcgV3JhcHBlZEF1ZGlvQnVmZmVyKCk7XHJcblxyXG4vLyBzYWZlIHdheSB0byB1bmxvY2tcclxubGV0IHVubG9ja2VkID0gZmFsc2U7XHJcbmNvbnN0IHNhZmVVbmxvY2sgPSAoKSA9PiB7XHJcbiAgaWYgKCAhdW5sb2NrZWQgKSB7XHJcbiAgICB1bmxvY2soKTtcclxuICAgIHVubG9ja2VkID0gdHJ1ZTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBvbkRlY29kZVN1Y2Nlc3MgPSBkZWNvZGVkQXVkaW8gPT4ge1xyXG4gIGlmICggd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkudmFsdWUgPT09IG51bGwgKSB7XHJcbiAgICB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS5zZXQoIGRlY29kZWRBdWRpbyApO1xyXG4gICAgc2FmZVVubG9jaygpO1xyXG4gIH1cclxufTtcclxuY29uc3Qgb25EZWNvZGVFcnJvciA9IGRlY29kZUVycm9yID0+IHtcclxuICBjb25zb2xlLndhcm4oICdkZWNvZGUgb2YgYXVkaW8gZGF0YSBmYWlsZWQsIHVzaW5nIHN0dWJiZWQgc291bmQsIGVycm9yOiAnICsgZGVjb2RlRXJyb3IgKTtcclxuICB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS5zZXQoIHBoZXRBdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyKCAxLCAxLCBwaGV0QXVkaW9Db250ZXh0LnNhbXBsZVJhdGUgKSApO1xyXG4gIHNhZmVVbmxvY2soKTtcclxufTtcclxuY29uc3QgZGVjb2RlUHJvbWlzZSA9IHBoZXRBdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhKCBzb3VuZEJ5dGVBcnJheS5idWZmZXIsIG9uRGVjb2RlU3VjY2Vzcywgb25EZWNvZGVFcnJvciApO1xyXG5pZiAoIGRlY29kZVByb21pc2UgKSB7XHJcbiAgZGVjb2RlUHJvbWlzZVxyXG4gICAgLnRoZW4oIGRlY29kZWRBdWRpbyA9PiB7XHJcbiAgICAgIGlmICggd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkudmFsdWUgPT09IG51bGwgKSB7XHJcbiAgICAgICAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBkZWNvZGVkQXVkaW8gKTtcclxuICAgICAgICBzYWZlVW5sb2NrKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKVxyXG4gICAgLmNhdGNoKCBlID0+IHtcclxuICAgICAgY29uc29sZS53YXJuKCAncHJvbWlzZSByZWplY3Rpb24gY2F1Z2h0IGZvciBhdWRpbyBkZWNvZGUsIGVycm9yID0gJyArIGUgKTtcclxuICAgICAgc2FmZVVubG9jaygpO1xyXG4gICAgfSApO1xyXG59XHJcbmV4cG9ydCBkZWZhdWx0IHdyYXBwZWRBdWRpb0J1ZmZlcjsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0EsT0FBT0EsV0FBVyxNQUFNLG1DQUFtQztBQUMzRCxPQUFPQyxzQkFBc0IsTUFBTSwwQ0FBMEM7QUFDN0UsT0FBT0Msa0JBQWtCLE1BQU0sc0NBQXNDO0FBQ3JFLE9BQU9DLGdCQUFnQixNQUFNLG9DQUFvQztBQUVqRSxNQUFNQyxRQUFRLEdBQUcsaTNEQUFpM0Q7QUFDbDRELE1BQU1DLGNBQWMsR0FBR0osc0JBQXNCLENBQUVFLGdCQUFnQixFQUFFQyxRQUFTLENBQUM7QUFDM0UsTUFBTUUsTUFBTSxHQUFHTixXQUFXLENBQUNPLFVBQVUsQ0FBRUgsUUFBUyxDQUFDO0FBQ2pELE1BQU1JLGtCQUFrQixHQUFHLElBQUlOLGtCQUFrQixDQUFDLENBQUM7O0FBRW5EO0FBQ0EsSUFBSU8sUUFBUSxHQUFHLEtBQUs7QUFDcEIsTUFBTUMsVUFBVSxHQUFHQSxDQUFBLEtBQU07RUFDdkIsSUFBSyxDQUFDRCxRQUFRLEVBQUc7SUFDZkgsTUFBTSxDQUFDLENBQUM7SUFDUkcsUUFBUSxHQUFHLElBQUk7RUFDakI7QUFDRixDQUFDO0FBRUQsTUFBTUUsZUFBZSxHQUFHQyxZQUFZLElBQUk7RUFDdEMsSUFBS0osa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDQyxLQUFLLEtBQUssSUFBSSxFQUFHO0lBQzNETixrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNFLEdBQUcsQ0FBRUgsWUFBYSxDQUFDO0lBQzFERixVQUFVLENBQUMsQ0FBQztFQUNkO0FBQ0YsQ0FBQztBQUNELE1BQU1NLGFBQWEsR0FBR0MsV0FBVyxJQUFJO0VBQ25DQyxPQUFPLENBQUNDLElBQUksQ0FBRSwyREFBMkQsR0FBR0YsV0FBWSxDQUFDO0VBQ3pGVCxrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNFLEdBQUcsQ0FBRVosZ0JBQWdCLENBQUNpQixZQUFZLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRWpCLGdCQUFnQixDQUFDa0IsVUFBVyxDQUFFLENBQUM7RUFDaEhYLFVBQVUsQ0FBQyxDQUFDO0FBQ2QsQ0FBQztBQUNELE1BQU1ZLGFBQWEsR0FBR25CLGdCQUFnQixDQUFDb0IsZUFBZSxDQUFFbEIsY0FBYyxDQUFDbUIsTUFBTSxFQUFFYixlQUFlLEVBQUVLLGFBQWMsQ0FBQztBQUMvRyxJQUFLTSxhQUFhLEVBQUc7RUFDbkJBLGFBQWEsQ0FDVkcsSUFBSSxDQUFFYixZQUFZLElBQUk7SUFDckIsSUFBS0osa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDQyxLQUFLLEtBQUssSUFBSSxFQUFHO01BQzNETixrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNFLEdBQUcsQ0FBRUgsWUFBYSxDQUFDO01BQzFERixVQUFVLENBQUMsQ0FBQztJQUNkO0VBQ0YsQ0FBRSxDQUFDLENBQ0ZnQixLQUFLLENBQUVDLENBQUMsSUFBSTtJQUNYVCxPQUFPLENBQUNDLElBQUksQ0FBRSxxREFBcUQsR0FBR1EsQ0FBRSxDQUFDO0lBQ3pFakIsVUFBVSxDQUFDLENBQUM7RUFDZCxDQUFFLENBQUM7QUFDUDtBQUNBLGVBQWVGLGtCQUFrQiJ9