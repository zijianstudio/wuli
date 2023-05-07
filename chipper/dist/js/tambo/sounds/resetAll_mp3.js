/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';
const soundURI = 'data:audio/mpeg;base64,//swxAADBmUg7gCM3gjdH+EKkCADXz1BJf+Sv+D////B/+wLRCz8Ob7nQMDFvER3BwvY1oeojPpiEQYQL0nv/PTaE9Mj+CGSDyAlZCn+8ALh+7wp/1AwM6X1dlkJsf90b/9q79N/rXbyJO1mvPWrJd51MyMpH2ewI2SON/D/ewqahUQACtOQSosYwemRvEQowgEMcAgGEnpMUTvv//syxA4ACWhZFlm3gBFDi2o3N4ACrPHCPBpQhfbtmAGADTeZ8V0FwZZz7p/u/7+JQnto6loivZdV4Z1XlUuVdY1Lv+XQAAaMTt1uEgAAAAAAAQ8AArHCEEcJahjISY0EG2FI4VnM4hqpkY8GtFIRBaKjcwWceAuhbBTW6J8QDSFrH/mEBxb5d8U53t7PlPAT2yll2jZVACnAARxCcv/7MsQDgkgkcTrd5IA5BAvmCd0NJwsw0uCYBQDJggBQmDskmY6QmZhRg+GCmBMoavWoyp1qZ9gRJUQaaFMf69Sa+yTfVe4x/3OVdnVKMdKDDvJ8gUKw4NzA4GAUJBhODx2QtRhi5B4/L5/Up6DBhyokLWexBtC7iXyfKsZbB1IHwsB9K4vS+CEluYQqOR1866oAMyABVggADJrmg5n/+zLEBgJIfGE2zHjFsQIJ5MmvbIl6YGQHxijkGGCiVoaIA7gQAgYCIETlr1EgBV3RdMlXzWbjsuq6UvqokR/EJJkyOmHTj41omg1p0jAzELohQsQEB1CaikKiLmCCpiHEnncwfadxBGfHpoo+CBIBDCLIqAshdpPKZeluUP5zbxQ5Fvu3t44/T/SvuKjVZsAAAibS0LyzYwBg4UmQ//swxAeCSRxvOG5oy2kGiScdjuSUyKaeHhoOrm7C+YolB04mHJEmPFg4ujKsBTWWAOCpfJlb1d2tzlTmTiLTV3bp7za0Z/919hjJC4APjwAlCbqVZYa9YIgfTGCoeGQZ8GAyeg5QzFUojk+KBe8LhA45CbHJ6Wx5yp6IS93Z2hpf1lDT/OnWyBVfjBwNDw7BVQA2AAC20yWHGcEh//syxAWCSLRTNsz3ZLkJC2fZnrDmJOtswTCEwVN8w4N80jCgRg+bgQ2ZlAGvCpvr+ZeNGYDibCEiEtbiF7+U8GyfPP4FqrmjcgsZvxZu2TncBoq1zVeNoY3tzesBa4DAHRBDkHKgFGZqaGFJMGK8lmeI9GGYaDIEgYMS87YKktC0Pz1IYF1ycmq1d0oztLpbo5gygAAB90/gLdWCH//7MsQFgkeAWThscMVhCQzoqY2xHxCNEsAkwwkGjTICZWaqqJgEyHApoFgGLG1qpMAIEeuJRoLRRABh1Kd0TrzK2zTrRhwIQoA4D5tDKCOUoYhib/itAWJjBk7QIQA3VAMuAxkaMcQTn4E7xdMJHCYATHJ8d7xtudt5pTp/HOv92wABEZXvyYJqAACc4AAh5LJFIWLDCEUAnCYgIj7/+zLECgJHZGNFLG0I8N6L51mNmK4yEwQ9TLMqnwSCuIOiZh5cUHAqAFrkflFRxoKSzB1zNV+bVtzTFHMF8HTNtWTD7ASgQgc8wMwEIoVoSwAJZC4xnnwayFLcWOArlnjWXqlphKpea1oUJjGplVrUSVbIaiwACIKXqAIbCkJolC4htvvMPaJlGBGYs2GDTZ7rCAg0SGnnVO/c3LyA//swxBSARyBfQkzsyrjmjOoo/bCnJEpkPd0gZ9iC7vtGGGKl2kAAGUwCYNUOItz9IT7nuDEarEhGGGU6xn4Q6OKkFzuWPvOXdUnrrRKeZPeqVXa/AuutA8vEkmy0FMVcAAVUU0IjaWiOiMxgzCUhZ452o+UIOYiwkOM20SlAsByQFGEgK1KgqRcBUIw4K60iIsW3kfsKtgyMuAJc//syxB6CRyRfPE1warjhDShc/aSnMUBRTh/IBPpIoaDjIcYxIsSxGgc6qlMXBVILmTyCxPmJV0cW5rMG2YbGyBvyyM8l55zY60oAAIU4AAAIaSrYqIQEfElFgTjnMJHw2qQzO5RX6DQMYziCHJljXIGj1Lg/uRPwjmJqURp8anVTfz/nwJWgAAylAgV/25sFV0/TWgoQTu6sMMgQ5f/7MsQpgEeEa0NM8Mcw4ozpacyZHxExUrTH9IkGJYwZHotnZK1ACitNzotE/KtCjBtkWyT9CpJAAE04AAAIGSFa0o8/kXFQCJSNOjlJMXBfPZVljvn0SHByx0nZmaLtLZhUWI5MxZ8Vqyq/kRNb2FhWAQhF4JzlAWIwJGUCBBgo+ZpSGWanAYmIEgCUkgQuDGq0yGTougTEXYxG8sf/+zLEMwBHPFtBTuUouOEI5pm/bMZ7l8v/mPO/hZqS//RVAAAOQAAABeSt7bAgBtszxhYB4GhfmCazGYHQSxoQqCi4uCYPNhyKv5nqAI+IEn81YVP23nVTg1UKuJgFBcym6jqc1tgSKh7+GcQgsYlghYvyKyCSZhDpfp7VtsLhMhne1ss5ulprWdgGhF1////+lQAAmgBXCzVTjx0u//swxD2CR1RJMU9tKKDTh+Xhn2jGmIARjRpwsB9K/Rp2OQcULFsrMTgiJbVVFARDTgVIrO2LM68uO+Xe6zoLygqYDAHXZYv9C93GliIAACIpsJhZlACo2KnowEyySIHOkHgQ+aPVbNfq0Idrtr///3feAEAAQNgC8i/YOQQHX0FADwKHQYrzKQgCvBcYRHzAgjoF1LnpKoJPe2+e//syxEkCBsBJLw13JjDHhual3LEWrn0OVaiFf///////+sxI8BpgATI1M9DEswQBM5HQWsHIy9CZMJBRtJKIlYABR29sLIgCFgqVFEs/rzNwr16lxYzk0Z+XTSEQCCAaYLrFgYBAgVEmUMG/hn5EUmnhYmUaAkKOhzS6R4YwrNB5+N09H+Wozq88qPEZf/7//+x3rXWiaAA8DIxYRv/7MsRZAsboNyjMe0Rg4YcjQb9swKRhyQCk0QC4oGAk5NY/jOVggMbME4ayRZYUkctGgKLVUbKAgFH2NxZ/52lux9zP73//c1l0f////9m/zSoAYUYAACIg6AStCbiiMpEADA0QTO3szEocjNHR5sswK0CJHEaIaHHaDxon+uQx2/vt1HT+z////6cb9qVYwBnDKpuBeYELM+DoUNT/+zLEZQMHeDkmTXdGMQmJI8m/bMDzfQbiMjoeMxKQWjBMAHMKIOwUOcyQHoIyJdArUH6cSRQxIZHHqep/7/dm+gAPGACIGIX5smYGDLCmKBGdTnm6GiiZYY1YTx1RIeKgO2Q9j4eT/DoIYkNeluT+WUtBez//+mz+pX7jFgKFVaY0D5jYKGAAYYPFpiQqGY9KaK18Zj8BnHvCuFxe//swxGmCR2RHKu7pKLDtiOMBv2jIIxmZF8Y0QmBDgMMlANpjL4zGpXS16K1hPX0GxomhBGQuZhxKHHQwKmNkAiHzBdYytG2gIEWD2sLFBWQnbWwKXmHg0MBwWp554rO1RUAB2G/VFKedTFtPHfo/+z/r8+Y+NgyRCPYKpxnY+AAYEmJoRObfqEZknjeGtw6MiMOSJyXKGrAElmIA//syxHGDx1A3IG17JgDsh2LBz3DAAULJfLtM4iEspM564AP//////R7/SgAKAADCBEEJICixwVRlMVATFDgzGtNGA7sxnAzxgeBgbKonCvXFQykQQgswmAL+UWfmxSfdMGV////UJHIBCjtSJHYxkuBwSIAc0iWMzl+4w9wNwj+AZkmFQsde7wdWgcASELlYukkOySVRrlq3XDW6Nv/7MsR6g4iMLxxt+2YQ+Qbiwb9wwKKMJiAaczkM0yBfYsOOo5MLlbkwJQtDGxZDD8EBg6GmDOQUHgGpAeFEvrRuMVKX9ascvQ1Y0DQDhBYpAJUAiQIIqHhhQzaw9Z2DOxjMuhBipf8yY7ywAX0T2XLRxQNY4Ifo06c5/f93T0//o/+6T1MOpjIiBEQCxg0RQxrE7RA+1oQ1BEwwgA7/+zDEfQPHXDUabfuGANeG4oG/cMBIYwLBQxCV4HGcjSiEJBO0KRUtDKrdm4ef//////1P0SAWJAAUgK8B7ha0wDSy5dQ2dzYbwzNQEw1aX4VYcWMDpDQ1tjRerYl7y6marf//orbXQzEH0HP0U0AISQC0hKmN0MDByAK8YAOOZjDCSAMDgE0adk+VJhTBMEBZgZAS8FWW39NCYrv/+zLEiAMGjDsWDXuGAOmGo82uDNqf///p/6v9uvpCgCIxk4AHdsBA5CBAYnMSCT5mqzTUsDgjzYoE5TwUAV2ZRKRI7GobqUUvzvVwO7/////9vxXVYK9yiYaJgUkDVQUggWtZJMswWJzvUFMzDEcES1TkN+hVkFtgYfVyshBp9CVHASd9/+lfVoffs/aT/+3oSkBBgT5AlYk6rQms//syxJSDBzw1FA3roIDkBWNNnujApKRAhozVgIwtAQowEhGngjd6dRpDYQBq26snZ3+jl3//5H/9LPxm6ggbKSQTGkBwJDr9AEAZRWZh0SYgjAAdh4nEPHBJ1I+L20Vnud4NBUNXf//9lH9PR6myyEnLxTHIxkgIFsgoOhuNFBgNIiwaOJzpdEzxASS7XUMuZitqGWgTH0gqoIlpBP/7MsSfA4boLRZte2YA5YaiAb7owLmO6v9fR6/KM+v+tPb6ahpQsqVkpWKwJLBg4DAOB0YyeFg4COajuYRQYQP8HpT1wceQNLJHn2f///47Y9VxKxrhCkWPuCFhWo81A1FdTJHImAMYU1ZBCzE1tMDAQ7B43PHRwJxW4JQqQFtJU2s7///1dLdz7TLkFTS2Co0qLGjYngEk7e9diUP/+zDEqoMHICsabPMmEM4Eow2e5MIIZrVcxtoYKA8xbIDmUnGddoh0rLaVhaELboGA3I///+32tj0qUhAXA4lABA0VFRzYs5Bxwo8cRAZqIgBjC0wyrCVrVBy0Sl3U0lLcrNkmJX3vXQ9xHrF1kft9KnLd0/5XIPY0tSK0DTykPgmqBACpusgAjZhT0YwByozh1IJWKp2KmeLt9Ov/+zLEt4MG7C8QLXcGENuFYg2eZMLR2pQ6RirmqAoCYKg0PHnDwUA5I6x8afWSCCjoaGWkABNLoLs3MMFnGvzaGfMY2VvKaYxjfVvVP6f/9DGVtSlb//VsrzTGDCnJFXIg08GgaduIVUxBTUUzLjk5LjNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//syxMQDx4gzCgzwxsDphiFBzJkQVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MsTMggc4KQgN5YhA0YShqJwkmlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+zDE2QBG9BsHQYXiANIdX3A0iMBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImJhc2U2NFNvdW5kVG9CeXRlQXJyYXkiLCJXcmFwcGVkQXVkaW9CdWZmZXIiLCJwaGV0QXVkaW9Db250ZXh0Iiwic291bmRVUkkiLCJzb3VuZEJ5dGVBcnJheSIsInVubG9jayIsImNyZWF0ZUxvY2siLCJ3cmFwcGVkQXVkaW9CdWZmZXIiLCJ1bmxvY2tlZCIsInNhZmVVbmxvY2siLCJvbkRlY29kZVN1Y2Nlc3MiLCJkZWNvZGVkQXVkaW8iLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJvbkRlY29kZUVycm9yIiwiZGVjb2RlRXJyb3IiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZUJ1ZmZlciIsInNhbXBsZVJhdGUiLCJkZWNvZGVQcm9taXNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYnVmZmVyIiwidGhlbiIsImNhdGNoIiwiZSJdLCJzb3VyY2VzIjpbInJlc2V0QWxsX21wMy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSAqL1xyXG5pbXBvcnQgYXN5bmNMb2FkZXIgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FzeW5jTG9hZGVyLmpzJztcclxuaW1wb3J0IGJhc2U2NFNvdW5kVG9CeXRlQXJyYXkgZnJvbSAnLi4vLi4vdGFtYm8vanMvYmFzZTY0U291bmRUb0J5dGVBcnJheS5qcyc7XHJcbmltcG9ydCBXcmFwcGVkQXVkaW9CdWZmZXIgZnJvbSAnLi4vLi4vdGFtYm8vanMvV3JhcHBlZEF1ZGlvQnVmZmVyLmpzJztcclxuaW1wb3J0IHBoZXRBdWRpb0NvbnRleHQgZnJvbSAnLi4vLi4vdGFtYm8vanMvcGhldEF1ZGlvQ29udGV4dC5qcyc7XHJcblxyXG5jb25zdCBzb3VuZFVSSSA9ICdkYXRhOmF1ZGlvL21wZWc7YmFzZTY0LC8vc3d4QUFEQm1VZzdnQ00zZ2pkSCtFS2tDQURYejFCSmYrU3YrRC8vLy9CLyt3TFJDejhPYjduUU1ERnZFUjNCd3ZZMW9lb2pQcGlFUVlRTDBudi9QVGFFOU1qK0NHU0R5QWxaQ24rOEFMaCs3d3AvMUF3TTZYMWRsa0pzZjkwYi85cTc5Ti9yWGJ5Sk8xbXZQV3JKZDUxTXlNcEgyZXdJMlNPTi9EL2V3cWFoVVFBQ3RPUVNvc1l3ZW1SdkVRb3dnRU1jQWdHRW5wTVVUdnYvL3N5eEE0QUNXaFpGbG0zZ0JGRGkybzNONEFDclBIQ1BCcFFoZmJ0bUFHQURUZVo4VjBGd1paejdwL3UvNytKUW50bzZsb2l2WmRWNFoxWGxVdVZkWTFMditYUUFBYU1UdDF1RWdBQUFBQUFBUThBQXJIQ0VFY0phaGpJU1kwRUcyRkk0Vm5NNGhxcGtZOEd0RklSQmFLamN3V2NlQXVoYkJUVzZKOFFEU0ZySC9tRUJ4YjVkOFU1M3Q3UGxQQVQyeWxsMmpaVkFDbkFBUnhDY3YvN01zUURna2drY1RyZDVJQTVCQXZtQ2QwTkp3c3cwdUNZQlFESmdnQlFtRHNrbVk2UW1aaFJnK0dDbUJNb2F2V295cDFxWjlnUkpVUWFhRk1mNjlTYSt5VGZWZTR4LzNPVmRuVktNZEtERHZKOGdVS3c0TnpBNEdBVUpCaE9EeDJRdFJoaTVCNC9MNS9VcDZEQmh5b2tMV2V4QnRDN2lYeWZLc1piQjFJSHdzQjlLNHZTK0NFbHVZUXFPUjE4NjZvQU15QUJWZ2dBREpybWc1bi8rekxFQmdKSWZHRTJ6SGpGc1FJSjVNbXZiSWw2WUdRSHhpamtHR0NpVm9hSUE3Z1FBZ1lDSUVUbHIxRWdCVjNSZE1sWHpXYmpzdXE2VXZxb2tSL0VKSmt5T21IVGo0MW9tZzFwMGpBekVMb2hRc1FFQjFDYWlrS2lMbUNDcGlIRW5uY3dmYWR4QkdmSHBvbytDQklCRENMSXFBc2hkcFBLWmVsdVVQNXpieFE1RnZ1M3Q0NC9UL1N2dUtqVlpzQUFBaWJTMEx5ell3Qmc0VW1RLy9zd3hBZUNTUnh2T0c1b3kya0dpU2NkanVTVXlLYWVIaG9Pcm03QytZb2xCMDRtSEpFbVBGZzR1aktzQlRXV0FPQ3BmSmxiMWQydHpsVG1UaUxUVjNicDd6YTBaLzkxOWhqSkM0QVBqd0FsQ2JxVlpZYTlZSWdmVEdDb2VHUVo4R0F5ZWc1UXpGVW9qaytLQmU4TGhBNDVDYkhKNld4NXlwNklTOTNaMmhwZjFsRFQvT25XeUJWZmpCd05EdzdCVlFBMkFBQzIweVdIR2NFaC8vc3l4QVdDU0xSVE5zejNaTGtKQzJmWm5yRG1KT3Rzd1RDRXdWTjh3NE44MGpDZ1JnK2JnUTJabEFHdkNwdnIrWmVOR1lEaWJDRWlFdGJpRjcrVThHeWZQUDRGcXJtamNnc1p2eFp1MlRuY0JvcTF6VmVOb1kzdHplc0JhNERBSFJCRGtIS2dGR1pxYUdGSk1HSzhsbWVJOUdHWWFESUVnWU1TODdZS2t0QzBQejFJWUYxeWNtcTFkMG96dExwYm81Z3lnQUFCOTAvZ0xkV0NILy83TXNRRmdrZUFXVGhzY01WaENRem9xWTJ4SHhDTkVzQWt3d2tHalRJQ1pXYXFxSmdFeUhBcG9GZ0dMRzFxcE1BSUVldUpSb0xSUkFCaDFLZDBUcnpLMnpUclJod0lRb0E0RDV0REtDT1VvWWhpYi9pdEFXSmpCazdRSVFBM1ZBTXVBeGthTWNRVG40RTd4ZE1KSENZQVRISjhkN3h0dWR0NXBUcC9IT3Y5MndBQkVaWHZ5WUpxQUFDYzRBQWg1TEpGSVdMRENFVUFuQ1lnSWo3Lyt6TEVDZ0pIWkdORkxHMEk4TjZMNTFtTm1LNHlFd1E5VExNcW53U0N1SU9pWmg1Y1VIQXFBRnJrZmxGUnhvS1N6QjF6TlYrYlZ0elRGSE1GOEhUTnRXVEQ3QVNnUWdjOHdNd0VJb1ZvU3dBSlpDNHhubndheUZMY1dPQXJsbmpXWHFscGhLcGVhMW9VSmpHcGxWclVTVmJJYWl3QUNJS1hxQUliQ2tKb2xDNGh0dnZNUGFKbEdCR1lzMkdEVFo3ckNBZzBTR25uVk8vYzNMeUEvL3N3eEJTQVJ5QmZRa3pzeXJqbWpPb28vYkNuSkVwa1BkMGdaOWlDN3Z0R0dHS2wya0FBR1V3Q1lOVU9JdHo5SVQ3bnVERWFyRWhHR0dVNnhuNFE2T0trRnp1V1B2T1hkVW5yclJLZVpQZXFWWGEvQXV1dEE4dkVrbXkwRk1WY0FBVlVVMElqYVdpT2lNeGd6Q1VoWjQ1Mm8rVUlPWWl3a09NMjBTbEFzQnlRRkdFZ0sxS2dxUmNCVUl3NEs2MGlJc1cza2ZzS3RneU11QUpjLy9zeXhCNkNSeVJmUEUxd2FyamhEU2hjL2FTbk1VQlJUaC9JQlBwSW9hRGpJY1l4SXNTeEdnYzZxbE1YQlZJTG1UeUN4UG1KVjBjVzVyTUcyWWJHeUJ2eXlNOGw1NXpZNjBvQUFJVTRBQUFJYVNyWXFJUUVmRWxGZ1Rqbk1KSHcycVF6TzVSWDZEUU1ZemlDSEpsalhJR2oxTGcvdVJQd2ptSnFVUnA4YW5WVGZ6L253SldnQUF5bEFnVi8yNXNGVjAvVFdnb1FUdTZzTU1nUTVmLzdNc1FwZ0VlRWEwTk04TWN3NG96cGFjeVpIeEV4VXJUSDlJa0dKWXdaSG90blpLMUFDaXROem90RS9LdENqQnRrV3lUOUNwSkFBRTA0QUFBSUdTRmEwbzgva1hGUUNKU05PamxKTVhCZlBaVmxqdm4wU0hCeXgwblptYUx0TFpoVVdJNU14WjhWcXlxL2tSTmIyRmhXQVFoRjRKemxBV0l3SkdVQ0JCZ28rWnBTR1dhbkFZbUlFZ0NVa2dRdURHcTB5R1RvdWdURVhZeEc4c2YvK3pMRU13QkhQRnRCVHVVb3VPRUk1cG0vYk1aN2w4di9tUE8vaFpxUy8vUlZBQUFPUUFBQUJlU3Q3YkFnQnRzenhoWUI0R2hmbUNhekdZSFFTeG9RcUNpNHVDWVBOaHlLdjVucUFJK0lFbjgxWVZQMjNuVlRnMVVLdUpnRkJjeW02anFjMXRnU0toNytHY1Fnc1lsZ2hZdnlLeUNTWmhEcGZwN1Z0c0xoTWhuZTFzczV1bHByV2RnR2hGMS8vLy8rbFFBQW1nQlhDelZUangwdS8vc3d4RDJDUjFSSk1VOXRLS0RUaCtYaG4yakdtSUFSalJwd3NCOUsvUnAyT1FjVUxGc3JNVGdpSmJWVkZBUkRUZ1ZJck8yTE02OHVPK1hlNnpvTHlncVlEQUhYWll2OUM5M0dsaUlBQUNJcHNKaFpsQUNvMktub3dFeXlTSUhPa0hnUSthUFZiTmZxMElkcnRyLy8vM2ZlQUVBQVFOZ0M4aS9ZT1FRSFgwRkFEd0tIUVlyektRZ0N2QmNZUkh6QWdqb0YxTG5wS29KUGUyK2UvL3N5eEVrQ0JzQkpMdzEzSmpESGh1YWwzTEVXcm4wT1ZhaUZmLy8vLy8vLytzeEk4QnBnQVRJMU05REVzd1FCTTVIUVdzSEl5OUNaTUpCUnRKS0lsWUFCUjI5c0xJZ0NGZ3FWRkVzL3J6TndyMTZseFl6azBaK1hUU0VRQ0NBYVlMckZnWUJBZ1ZFbVVNRy9objVFVW1uaFltVWFBa0tPaHpTNlI0WXdyTkI1K04wOUgrV296cTg4cVBFWmYvNy8vK3gzclhXaWFBQThESXhZUnYvN01zUlpBc2JvTnlqTWUwUmc0WWNqUWI5c3dLUmh5UUNrMFFDNG9HQWs1Tlkvak9WZ2dNYk1FNGF5UlpZVWtjdEdnS0xWVWJLQWdGSDJOeFovNTJsdXg5elA3My8vYzFsMGYvLy8vOW0velNvQVlVWUFBQ0lnNkFTdENiaWlNcEVBREEwUVRPM3N6RW9jak5IUjVzc3dLMENKSEVhSWFISGFEeG9uK3VReDIvdnQxSFQrei8vLy82Y2I5cVZZd0JuREtwdUJlWUVMTStEb1VOVC8rekxFWlFNSGVEa21UWGRHTVFtSkk4bS9iTUR6ZlFiaU1qb2VNeEtRV2pCTUFITUtJT3dVT2N5UUhvSXlKZEFyVUg2Y1NSUXhJWkhIcWVwLzcvZG0rZ0FQR0FDSUdJWDVzbVlHRExDbUtCR2RUbm02R2lpWllZMVlUeDFSSWVLZ08yUTlqNGVUL0RvSVlrTmVsdVQrV1V0QmV6Ly8rbXorcFg3akZnS0ZWYVkwRDVqWUtHQUFZWVBGcGlRcUdZOUthSzE4Wmo4Qm5IdkN1RnhlLy9zd3hHbUNSMlJIS3U3cEtMRHRpT01CdjJqSUl4bVpGOFkwUW1CRGdNTWxBTnBqTDR6R3BYUzE2SzFoUFgwR3hvbWhCR1F1Wmh4S0hIUXdLbU5rQWlIekJkWXl0RzJnSUVXRDJzTEZCV1FuYld3S1htSGcwTUJ3V3A1NTRyTzFSVUFCMkcvVkZLZWRURnRQSGZvLyt6L3I4K1krTmd5UkNQWUtweG5ZK0FBWUVtSm9ST2JmcUVaa25qZUd0dzZNaU1PU0p5WEtHckFFbG1JQS8vc3l4SEdEeDFBM0lHMTdKZ0RzaDJMQnozREFBVUxKZkx0TTRpRXNwTTU2NEFQLy8vLy8vUjcvU2dBS0FBRENCRUVKSUNpeHdWUmxNVkFURkRnekd0TkdBN3N4bkF6eGdlQmdiS29uQ3ZYRlF5a1FRZ3N3bUFMK1VXZm14U2ZkTUdWLy8vL1VKSElCQ2p0U0pIWXhrdUJ3U0lBYzBpV016bCs0dzl3TndqK0Faa21GUXNkZTd3ZFdnY0FTRUxsWXVra095U1ZScmxxM1hEVzZOdi83TXNSNmc0aU1MeHh0KzJZUStRYml3Yjl3d0tLTUppQWFjemtNMHlCZllzT09vNU1MbGJrd0pRdERHeFpERDhFQmc2R21ET1FVSGdHcEFlRkV2clJ1TVZLWDlhc2N2UTFZMERRRGhCWXBBSlVBaVFJSXFIaGhRemF3OVoyRE94ak11aEJpcGY4eVk3eXdBWDBUMlhMUnhRTlk0SWZvMDZjNS9mOTNUMC8vby8rNlQxTU9waklpQkVRQ3hnMFJReHJFN1JBKzFvUTFCRXd3Z0E3Lyt6REVmUVBIWERVYWJmdUdBTmVHNG9HL2NNQklZd0xCUXhDVjRIR2NqU2lFSkJPMEtSVXRES3JkbTRlZi8vLy8vLzFQMFNBV0pBQVVnSzhCN2hhMHdEU3k1ZFEyZHpZYnd6TlFFdzFhWDRWWWNXTURwRFExdGpSZXJZbDd5Nm1hcmYvL29yYlhRekVIMEhQMFUwQUlTUUMwaEttTjBNREJ5QUs4WUFPT1pqRENTQU1EZ0UwYWRrK1ZKaFRCTUVCWmdaQVM4RldXMzlOQ1lydi8rekxFaUFNR2pEc1dEWHVHQU9tR284MnVETnFmLy8vcC82djl1dnBDZ0NJeGs0QUhkc0JBNUNCQVluTVNDVDVtcXpUVXNEZ2p6WW9FNVR3VUFWMlpSS1JJN0dvYnFVVXZ6dlZ3TzcvLy8vLzl2eFhWWUs5eWlZYUpnVWtEVlFVZ2dXdFpKTXN3V0p6dlVGTXpERWNFUzFUa04raFZrRnRnWWZWeXNoQnA5Q1ZIQVNkOS8rbGZWb2Zmcy9hVC8rM29Ta0JCZ1Q1QWxZazZyUW1zLy9zeXhKU0RCencxRkEzcm9JRGtCV05ObnVqQXBLUkFob3pWZ0l3dEFRb3dFaEduZ2pkNmRScERZUUJxMjZzblozK2psMy8vNUgvOUxQeG02Z2diS1NRVEdrQndKRHI5QUVBWlJXWmgwU1lnakFBZGg0bkVQSEJKMUkrTDIwVm51ZDROQlVOWGYvLzlsSDlQUjZteXlFbkx4VEhJeGtnSUZzZ29PaHVORkJnTklpd2FPSnpwZEV6eEFTUzdYVU11Wml0cUdXZ1RIMGdxb0lscEJQLzdNc1NmQTRib0xSWnRlMllBNVlhaUFiN293TG1PNnY5ZlI2L0tNK3YrdFBiNmFocFFzcVZrcFdLd0pMQmc0REFPQjBZeWVGZzRDT2FqdVlSUVlRUDhIcFQxd2NlUU5MSkhuMmYvLy80N1k5VnhLeHJoQ2tXUHVDRmhXbzgxQTFGZFRKSEltQU1ZVTFaQkN6RTF0TURBUTdCNDNQSFJ3SnhXNEpRcVFGdEpVMnM3Ly8vMWRMZHo3VExrRlRTMkNvMHFMR2pZbmdFazdlOWRpVVAvK3pERXFvTUhJQ3NhYlBNbUVNNEVvdzJlNU1JSVpyVmN4dG9ZS0E4eGJJRG1VbkdkZG9oMHJMYVZoYUVMYm9HQTNJLy8vKzMydGowcVVoQVhBNGxBQkEwVkZSellzNUJ4d284Y1JBWnFJZ0JqQzB3eXJDVnJWQnkwU2wzVTBsTGNyTmttSlgzdlhROXhIckYxa2Z0OUtuTGQwLzVYSVBZMHRTSzBEVHlrUGdtcUJBQ3B1c2dBalpoVDBZd0J5b3poMUlKV0twMkttZUx0OU92Lyt6TEV0NE1HN0M4UUxYY0dFTnVGWWcyZVpNTFIycFE2UmlybXFBb0NZS2cwUEhuRHdVQTVJNng4YWZXU0NDam9hR1drQUJOTG9MczNNTUZuR3Z6YUdmTVkyVnZLYVl4amZWdlZQNmYvOURHVnRTbGIvL1ZzcnpUR0RDbkpGWElnMDhHZ2FkdUlWVXhCVFVVekxqazVMak5WVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlYvL3N5eE1RRHg0Z3pDZ3p3eHNEcGhpRkJ6SmtRVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVmYvN01zVE1nZ2M0S1FnTjVZaEEwWVNocUp3a21sVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWWC8rekRFMlFCRzlCc0hRWVhpQU5JZFgzQTBpTUJWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlU9JztcclxuY29uc3Qgc291bmRCeXRlQXJyYXkgPSBiYXNlNjRTb3VuZFRvQnl0ZUFycmF5KCBwaGV0QXVkaW9Db250ZXh0LCBzb3VuZFVSSSApO1xyXG5jb25zdCB1bmxvY2sgPSBhc3luY0xvYWRlci5jcmVhdGVMb2NrKCBzb3VuZFVSSSApO1xyXG5jb25zdCB3cmFwcGVkQXVkaW9CdWZmZXIgPSBuZXcgV3JhcHBlZEF1ZGlvQnVmZmVyKCk7XHJcblxyXG4vLyBzYWZlIHdheSB0byB1bmxvY2tcclxubGV0IHVubG9ja2VkID0gZmFsc2U7XHJcbmNvbnN0IHNhZmVVbmxvY2sgPSAoKSA9PiB7XHJcbiAgaWYgKCAhdW5sb2NrZWQgKSB7XHJcbiAgICB1bmxvY2soKTtcclxuICAgIHVubG9ja2VkID0gdHJ1ZTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBvbkRlY29kZVN1Y2Nlc3MgPSBkZWNvZGVkQXVkaW8gPT4ge1xyXG4gIGlmICggd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkudmFsdWUgPT09IG51bGwgKSB7XHJcbiAgICB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS5zZXQoIGRlY29kZWRBdWRpbyApO1xyXG4gICAgc2FmZVVubG9jaygpO1xyXG4gIH1cclxufTtcclxuY29uc3Qgb25EZWNvZGVFcnJvciA9IGRlY29kZUVycm9yID0+IHtcclxuICBjb25zb2xlLndhcm4oICdkZWNvZGUgb2YgYXVkaW8gZGF0YSBmYWlsZWQsIHVzaW5nIHN0dWJiZWQgc291bmQsIGVycm9yOiAnICsgZGVjb2RlRXJyb3IgKTtcclxuICB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS5zZXQoIHBoZXRBdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyKCAxLCAxLCBwaGV0QXVkaW9Db250ZXh0LnNhbXBsZVJhdGUgKSApO1xyXG4gIHNhZmVVbmxvY2soKTtcclxufTtcclxuY29uc3QgZGVjb2RlUHJvbWlzZSA9IHBoZXRBdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhKCBzb3VuZEJ5dGVBcnJheS5idWZmZXIsIG9uRGVjb2RlU3VjY2Vzcywgb25EZWNvZGVFcnJvciApO1xyXG5pZiAoIGRlY29kZVByb21pc2UgKSB7XHJcbiAgZGVjb2RlUHJvbWlzZVxyXG4gICAgLnRoZW4oIGRlY29kZWRBdWRpbyA9PiB7XHJcbiAgICAgIGlmICggd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkudmFsdWUgPT09IG51bGwgKSB7XHJcbiAgICAgICAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBkZWNvZGVkQXVkaW8gKTtcclxuICAgICAgICBzYWZlVW5sb2NrKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKVxyXG4gICAgLmNhdGNoKCBlID0+IHtcclxuICAgICAgY29uc29sZS53YXJuKCAncHJvbWlzZSByZWplY3Rpb24gY2F1Z2h0IGZvciBhdWRpbyBkZWNvZGUsIGVycm9yID0gJyArIGUgKTtcclxuICAgICAgc2FmZVVubG9jaygpO1xyXG4gICAgfSApO1xyXG59XHJcbmV4cG9ydCBkZWZhdWx0IHdyYXBwZWRBdWRpb0J1ZmZlcjsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0EsT0FBT0EsV0FBVyxNQUFNLG1DQUFtQztBQUMzRCxPQUFPQyxzQkFBc0IsTUFBTSwwQ0FBMEM7QUFDN0UsT0FBT0Msa0JBQWtCLE1BQU0sc0NBQXNDO0FBQ3JFLE9BQU9DLGdCQUFnQixNQUFNLG9DQUFvQztBQUVqRSxNQUFNQyxRQUFRLEdBQUcscXZMQUFxdkw7QUFDdHdMLE1BQU1DLGNBQWMsR0FBR0osc0JBQXNCLENBQUVFLGdCQUFnQixFQUFFQyxRQUFTLENBQUM7QUFDM0UsTUFBTUUsTUFBTSxHQUFHTixXQUFXLENBQUNPLFVBQVUsQ0FBRUgsUUFBUyxDQUFDO0FBQ2pELE1BQU1JLGtCQUFrQixHQUFHLElBQUlOLGtCQUFrQixDQUFDLENBQUM7O0FBRW5EO0FBQ0EsSUFBSU8sUUFBUSxHQUFHLEtBQUs7QUFDcEIsTUFBTUMsVUFBVSxHQUFHQSxDQUFBLEtBQU07RUFDdkIsSUFBSyxDQUFDRCxRQUFRLEVBQUc7SUFDZkgsTUFBTSxDQUFDLENBQUM7SUFDUkcsUUFBUSxHQUFHLElBQUk7RUFDakI7QUFDRixDQUFDO0FBRUQsTUFBTUUsZUFBZSxHQUFHQyxZQUFZLElBQUk7RUFDdEMsSUFBS0osa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDQyxLQUFLLEtBQUssSUFBSSxFQUFHO0lBQzNETixrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNFLEdBQUcsQ0FBRUgsWUFBYSxDQUFDO0lBQzFERixVQUFVLENBQUMsQ0FBQztFQUNkO0FBQ0YsQ0FBQztBQUNELE1BQU1NLGFBQWEsR0FBR0MsV0FBVyxJQUFJO0VBQ25DQyxPQUFPLENBQUNDLElBQUksQ0FBRSwyREFBMkQsR0FBR0YsV0FBWSxDQUFDO0VBQ3pGVCxrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNFLEdBQUcsQ0FBRVosZ0JBQWdCLENBQUNpQixZQUFZLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRWpCLGdCQUFnQixDQUFDa0IsVUFBVyxDQUFFLENBQUM7RUFDaEhYLFVBQVUsQ0FBQyxDQUFDO0FBQ2QsQ0FBQztBQUNELE1BQU1ZLGFBQWEsR0FBR25CLGdCQUFnQixDQUFDb0IsZUFBZSxDQUFFbEIsY0FBYyxDQUFDbUIsTUFBTSxFQUFFYixlQUFlLEVBQUVLLGFBQWMsQ0FBQztBQUMvRyxJQUFLTSxhQUFhLEVBQUc7RUFDbkJBLGFBQWEsQ0FDVkcsSUFBSSxDQUFFYixZQUFZLElBQUk7SUFDckIsSUFBS0osa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDQyxLQUFLLEtBQUssSUFBSSxFQUFHO01BQzNETixrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNFLEdBQUcsQ0FBRUgsWUFBYSxDQUFDO01BQzFERixVQUFVLENBQUMsQ0FBQztJQUNkO0VBQ0YsQ0FBRSxDQUFDLENBQ0ZnQixLQUFLLENBQUVDLENBQUMsSUFBSTtJQUNYVCxPQUFPLENBQUNDLElBQUksQ0FBRSxxREFBcUQsR0FBR1EsQ0FBRSxDQUFDO0lBQ3pFakIsVUFBVSxDQUFDLENBQUM7RUFDZCxDQUFFLENBQUM7QUFDUDtBQUNBLGVBQWVGLGtCQUFrQiJ9