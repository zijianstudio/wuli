/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';
const soundURI = 'data:audio/mpeg;base64,//swxAABRogc+yMlJhEnGaNCnqAAkAABWQIenZ2LBh0GA2gTSDblrNGj6+Td0flCjthxlZ85yEuD5+cIXxOhQIBjD5SoEwfIZM8Qj5KgFgkkTZyGGCoEwUD06x9lOXCGVIycYAKCYcYCwAmF2BTGRJkA8LmgviHPfFQCmLZ7/8jH7///nocPCT//kY/J//+oY4ToE025QApvrXjF//syxASACGx3RLm2gAEWiynXNvAAC41yKq7o6U4g8MVGaef1YMjGwwXUkxmCXABvTzOFmJOPPfOaiGyn6383UXEnfS4PP5TmIY8v57//wGAAP7gBHRlgZKYKGLmLCGbs6lzQH5igoYG5FpGvrZdbJYFq6kWqQxc4CdvDeaqyUeMOv49t1pE0PFA0uJJdhVnL4mSnCpKIAAAAEOBNgf/7MsQEAUh4N1e9owAhBIppTcyY5S2boIafrMwvMwW8MZF9V4tNltaVP871rnBRIlUmyDTwVBUmsS5UNBoDHhK4RA0W/8rLFcRv8FRE//lQWDjawjEFAGIFsGYmQleF4Abrhugm0EcCgCULaJgLsYg1xnbX3/jYsWFkyZAghERDRdr1Mf3uDpRiiAAAA8/ofvAgG4AIDa6uVTVQWJH/+zLEBYAIgJdGTiRsqRQIaaWNpJeYlUdxHAk4QuQDtJxLilvWWtNGRwroWBILNoYIh9XGKMCM1XASoywwICIM/sqk1hKZQCZTbDBhSWeQBfq+kCAYhJW6MzHCBXSNCywKBg1pONUljg8NpELNUo06WU+rjlLPNOt/cieNOJHWov5LJr+FBR3Dfl27/O7y/WVd/8IAAKmoABry9VfJ//swxAUCSJA/MS15hPj7CCOBz+iQMjyYJGGO2ZAaEivBhZgZmFkSmbEQxACENAQIxdFawej84oJpVofhi0/Vs94g9xJufNNB/FEc4Fy8qSC4CJQeIhMDSmYAURhTymHHnZpj3InCYeYCUGEfElBomgvOYOgCKHdnmmMGNDlmEAagjXIfcK/BrZv/981AF+oUMRsCww9HgCgDmAsB//syxAaCCPg/Hm9s6oD2iCVdnxSukYMYh5m8ckmwBqeZ+IIxkjwgHra0uYsocRxzWZ6aGODZhIMXhd6Mv003xCHfg+d9n+z/9/XS/b9dn6joQAAMRmBnMUZIkT5YMeQjIy/2fDATCMML0WE3TxWjDNA7AwMg8A2lAv9tH7duYn/CI78Il/m////////xlS6oqUONkPhUCJCg2BjN6f/7MsQHg8cMQRoM+2LA8oXjAb/skOHBrTaangwpiMUumUI7IYhQnpvcUZkimLkBggeXWbrFnVtcmcf///6TqPxQIBheZoBGzhp9BYYnqIUGaXA9JhPYOuYQ4MtmmEAZJhBACEJswlUiycNEpMDpqNIgOmzoeW//////6wMVWQ7jAUFyMCKBgPuDFszNlbmML8Qww5ErjgGNxMDAJAb/+zLEEQNG+CscLfskkNCFI02vZJAvJTEOrGnrhickdEP6//////6/7tm6ABvyzZbpQDFlhzTpkHJ+mIS6KIQZDEDWYNr0lswuQQj8bNEQHAphMtnqto63p////f//0hQGQAJTJGyqKFgBwSIxl1ChkZmBqOAhnqSxuAiqGFaA2JmEyahDU3sh+nuN/9X//irfsQF2tolihrSV8E2x//swxB8CBmwpGm77KCDpBSNdnvCKywxrvo5jYoHRqYWSmaT8xhYfgEHITVpOjHrudl7eS0aWnv0akTHcj6hnd66tPX99AEAaAV4o19MADFnMgYlIoRl4IMmEgFOYVBH5rRAmlAtIbMJMoRL9e6QUm2N////qt+mv7FpuoRuk3acFVZBkKlDFZTIGlTmL1jYcRjD50j8KVQsLgpkh//syxCuDBygpEsz7JIDnBWGBruCQAslsUflFi/z////6P3PUohU8BK7yKjLj5supC5yH2cJjmEEb+pnFfYDJ4yUIYxVlI/1Gcx5AIH9EjK9daQz4W//////qtYyJNRQktTUJuZSgYAJRRSAEKWaoYKXyFwQZgOZlTfnM2dvp+ljAUHsAicorgmaoTb6//RWzs9v37NwRuJa5BFUDPv/7MsQ2Aga0JQoM9wSA3gQh9czwwLeqQAB9yNEBhRgm1sAGkNPvAgrAj6dEFBwKFR6uq9mNTT2HVJuaz6/jDDKL7f/XYqvbfshoIAABOS1EAMBxbgAx+ONrBhIwMKDTvkNKwGzDZkY2yjqdY+7/R1ftzWUL2TYdQABdDg2gGmqeLy7i9QAAAIK6IAAwrXZagHPjeIitglbBqUGWVv7/+zLEQwAGWCETQO2C0OaD4XQdpFi9D//qt/Rq3Y6GIaoaHxcbGk1AAMoemivgA+24iAEGVrAYsoZhrG8BLObk0vtuFZBS2y+71/WtH7Iue7lyLlvT0taZZ3FF6s4A0RI8ITB65v6bNv/mP2/62+77z9jpmu0Pv+/E8TVd7MsBGnq6qHFtNG2RTKdPL9GgOTRCf6GCiVKjL5hCEP+I//swxFCABiAbC6DnAkC2AyHoN7yCXmH/GPjM1VVVVVf/2Zi+qvVb/4zKqlqqhQwEKY2bXVY1VV6ql4UBPalqXBQ2aEVVTEFNRTMuOTkuM1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//syxGSDxtEO/gUA1MjrIl6AII1xVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImJhc2U2NFNvdW5kVG9CeXRlQXJyYXkiLCJXcmFwcGVkQXVkaW9CdWZmZXIiLCJwaGV0QXVkaW9Db250ZXh0Iiwic291bmRVUkkiLCJzb3VuZEJ5dGVBcnJheSIsInVubG9jayIsImNyZWF0ZUxvY2siLCJ3cmFwcGVkQXVkaW9CdWZmZXIiLCJ1bmxvY2tlZCIsInNhZmVVbmxvY2siLCJvbkRlY29kZVN1Y2Nlc3MiLCJkZWNvZGVkQXVkaW8iLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJvbkRlY29kZUVycm9yIiwiZGVjb2RlRXJyb3IiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZUJ1ZmZlciIsInNhbXBsZVJhdGUiLCJkZWNvZGVQcm9taXNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYnVmZmVyIiwidGhlbiIsImNhdGNoIiwiZSJdLCJzb3VyY2VzIjpbInNlbGVjdGlvbkFycGVnZ2lvMDAyX21wMy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSAqL1xyXG5pbXBvcnQgYXN5bmNMb2FkZXIgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FzeW5jTG9hZGVyLmpzJztcclxuaW1wb3J0IGJhc2U2NFNvdW5kVG9CeXRlQXJyYXkgZnJvbSAnLi4vLi4vdGFtYm8vanMvYmFzZTY0U291bmRUb0J5dGVBcnJheS5qcyc7XHJcbmltcG9ydCBXcmFwcGVkQXVkaW9CdWZmZXIgZnJvbSAnLi4vLi4vdGFtYm8vanMvV3JhcHBlZEF1ZGlvQnVmZmVyLmpzJztcclxuaW1wb3J0IHBoZXRBdWRpb0NvbnRleHQgZnJvbSAnLi4vLi4vdGFtYm8vanMvcGhldEF1ZGlvQ29udGV4dC5qcyc7XHJcblxyXG5jb25zdCBzb3VuZFVSSSA9ICdkYXRhOmF1ZGlvL21wZWc7YmFzZTY0LC8vc3d4QUFCUm9nYyt5TWxKaEVuR2FOQ25xQUFrQUFCV1FJZW5aMkxCaDBHQTJnVFNEYmxyTkdqNitUZDBmbENqdGh4bFo4NXlFdUQ1K2NJWHhPaFFJQmpENVNvRXdmSVpNOFFqNUtnRmdra1RaeUdHQ29Fd1VEMDZ4OWxPWENHVkl5Y1lBS0NZY1lDd0FtRjJCVEdSSmtBOExtZ3ZpSFBmRlFDbUxaNy84akg3Ly8vbm9jUENULy9rWS9KLy8rb1k0VG9FMDI1UUFwdnJYakYvL3N5eEFTQUNHeDNSTG0yZ0FFV2l5blhOdkFBQzQxeUtxN282VTRnOE1WR2FlZjFZTWpHd3dYVWt4bUNYQUJ2VHpPRm1KT1BQZk9haUd5bjYzODNVWEVuZlM0UFA1VG1JWTh2NTcvL3dHQUFQN2dCSFJsZ1pLWUtHTG1MQ0diczZselFINWlnb1lHNUZwR3ZyWmRiSllGcTZrV3FReGM0Q2R2RGVhcXlVZU1PdjQ5dDFwRTBQRkEwdUpKZGhWbkw0bVNuQ3BLSUFBQUFFT0JOZ2YvN01zUUVBVWg0TjFlOW93QWhCSXBwVGN5WTVTMmJvSWFmck13dk13VzhNWkY5VjR0Tmx0YVZQODcxcm5CUklsVW15RFR3VkJVbXNTNVVOQm9ESGhLNFJBMFcvOHJMRmNSdjhGUkUvL2xRV0RqYXdqRUZBR0lGc0dZbVFsZUY0QWJyaHVnbTBFY0NnQ1VMYUpnTHNZZzF4bmJYMy9qWXNXRmt5WkFnaEVSRFJkcjFNZjN1RHBSaWlBQUFBOC9vZnZBZ0c0QUlEYTZ1VlRWUVdKSC8rekxFQllBSWdKZEdUaVJzcVJRSWFhV05wSmVZbFVkeEhBazRRdVFEdEp4TGlsdldXdE5HUndyb1dCSUxOb1lJaDlYR0tNQ00xWEFTb3l3d0lDSU0vc3FrMWhLWlFDWlRiREJoU1dlUUJmcStrQ0FZaEpXNk16SENCWFNOQ3l3S0JnMXBPTlVsamc4TnBFTE5VbzA2V1UrcmpsTFBOT3QvY2llTk9KSFdvdjVMSnIrRkJSM0RmbDI3L083eS9XVmQvOElBQUttb0FCcnk5VmZKLy9zd3hBVUNTSkEvTVMxNWhQajdDQ09CeitpUU1qeVlKR0dPMlpBYUVpdkJoWmdabUZrU21iRVF4QUNFTkFRSXhkRmF3ZWo4NG9KcFZvZmhpMC9Wczk0Zzl4SnVmTk5CL0ZFYzRGeThxU0M0Q0pRZUloTURTbVlBVVJoVHltSEhuWnBqM0luQ1llWUNVR0VmRWxCb21ndk9ZT2dDS0hkbm1tTUdORGxtRUFhZ2pYSWZjSy9Cclp2Lzk4MUFGK29VTVJzQ3d3OUhnQ2dEbUFzQi8vc3l4QWFDQ1BnL0htOXM2b0QyaUNWZG54U3VrWU1ZaDVtOGNrbXdCcWVaK0lJeGtqd2dIcmEwdVlzb2NSeHpXWjZhR09EWmhJTVhoZDZNdjAwM3hDSGZnK2Q5bit6LzkvWFMvYjlkbjZqb1FBQU1SbUJuTVVaSWtUNVlNZVFqSXkvMmZEQVRDTU1MMFdFM1R4V2pETkE3QXdNZzhBMmxBdjl0SDdkdVluL0NJNzhJbC9tLy8vLy8vLy94bFM2b3FVT05rUGhVQ0pDZzJCak42Zi83TXNRSGc4Y01RUm9NKzJMQThvWGpBYi9za09IQnJUYWFuZ3dwaU1VdW1VSTdJWWhRbnB2Y1Vaa2ltTGtCZ2dlWFdickZuVnRjbWNmLy8vNlRxUHhRSUJoZVpvQkd6aHA5QllZbnFJVUdhWEE5SmhQWU91WVE0TXRtbUVBWkpoQkFDRUpzd2xVaXljTkVwTURwcU5JZ09tem9lVy8vLy8vLzZ3TVZXUTdqQVVGeU1DS0JnUHVERnN6TmxibU1MOFF3dzVFcmpnR054TURBSkFiLyt6TEVFUU5HK0NzY0xmc2trTkNGSTAydlpKQXZKVEVPckducmhpY2tkRVA2Ly8vLy8vNi83dG02QUJ2eXpaYnBRREZsaHpUcGtISittSVM2S0lRWkRFRFdZTnIwbHN3dVFRajhiTkVRSEFwaE10bnF0bzYzcC8vLy9mLy8waFFHUUFKVEpHeXFLRmdCd1NJeGwxQ2hrWm1CcU9BaG5xU3h1QWlxR0ZhQTJKbUV5YWhEVTNzaCtudU4vOVgvL2lyZnNRRjJ0b2xpaHJTVjhFMngvL3N3eEI4Q0Jtd3BHbTc3S0NEcEJTTmRudkNLeXd4cnZvNWpZb0hScVlXU21hVDh4aFlmZ0VISVRWcE9qSHJ1ZGw3ZVMwYVdudjBha1RIY2o2aG5kNjZ0UFg5OUFFQWFBVjRvMTlNQURGbk1nWWxJb1JsNElNbUVnRk9ZVkJINXJSQW1sQXRJYk1KTW9STDllNlFVbTJOLy8vL3F0K212N0ZwdW9SdWszYWNGVlpCa0tsREZaVElHbFRtTDFqWWNSakQ1MGo4S1ZRc0xncGtoLy9zeXhDdURCeWdwRXN6N0pJRG5CV0dCcnVDUUFzbHNVZmxGaS96Ly8vLzZQM1BVb2hVOEJLN3lLakxqNXN1cEM1eUgyY0pqbUVFYitwbkZmWURKNHlVSVl4VmxJLzFHY3g1QUlIOUVqSzlkYVF6NFcvLy8vLy9xdFl5Sk5SUWt0VFVKdVpTZ1lBSlJSU0FFS1dhb1lLWHlGd1FaZ09abFRmbk0yZHZwK2xqQVVIc0FpY29yZ21hb1RiNi8vUld6czl2MzdOd1J1SmE1QkZVRFB2LzdNc1EyQWdhMEpRb005d1NBM2dRaDljend3TGVxUUFCOXlORUJoUmdtMXNBR2tOUHZBZ3JBajZkRUZCd0tGUjZ1cTltTlRUMkhWSnVhejYvakRES0w3Zi9YWXF2YmZzaG9JQUFCT1MxRUFNQnhiZ0F4K09OckJoSXdNS0RUdmtOS3dHekRaa1kyeWpxZFkrNy9SMWZ0eldVTDJUWWRRQUJkRGcyZ0dtcWVMeTdpOVFBQUFJSzZJQUF3clhaYWdIUGplSWl0Z2xiQnFVR1dWdjcvK3pMRVF3QUdXQ0VUUU8yQzBPYUQ0WFFkcEZpOUQvL3F0L1JxM1k2R0lhb2FIeGNiR2sxQUFNb2VtaXZnQSsyNGlBRUdWckFZc29aaHJHOEJMT2JrMHZ0dUZaQlMyeSs3MS9XdEg3SXVlN2x5TGx2VDB0YVpaM0ZGNnM0QTBSSThJVEI2NXY2Yk52L21QMi82Mis3N3o5anBtdTBQdisvRThUVmQ3TXNCR25xNnFIRnRORzJSVEtkUEw5R2dPVFJDZjZHQ2lWS2pMNWhDRVArSS8vc3d4RkNBQmlBYkM2RG5Ba0MyQXlIb043eUNYbUgvR1BqTTFWVlZWVmYvMlppK3F2VmIvNHpLcWxxcWhRd0VLWTJiWFZZMVZWNnFsNFVCUGFscVhCUTJhRVZWVEVGTlJUTXVPVGt1TTFWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlYvL3N5eEdTRHh0RU8vZ1VBMU1qcklsNkFJSTF4VlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlE9PSc7XHJcbmNvbnN0IHNvdW5kQnl0ZUFycmF5ID0gYmFzZTY0U291bmRUb0J5dGVBcnJheSggcGhldEF1ZGlvQ29udGV4dCwgc291bmRVUkkgKTtcclxuY29uc3QgdW5sb2NrID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggc291bmRVUkkgKTtcclxuY29uc3Qgd3JhcHBlZEF1ZGlvQnVmZmVyID0gbmV3IFdyYXBwZWRBdWRpb0J1ZmZlcigpO1xyXG5cclxuLy8gc2FmZSB3YXkgdG8gdW5sb2NrXHJcbmxldCB1bmxvY2tlZCA9IGZhbHNlO1xyXG5jb25zdCBzYWZlVW5sb2NrID0gKCkgPT4ge1xyXG4gIGlmICggIXVubG9ja2VkICkge1xyXG4gICAgdW5sb2NrKCk7XHJcbiAgICB1bmxvY2tlZCA9IHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3Qgb25EZWNvZGVTdWNjZXNzID0gZGVjb2RlZEF1ZGlvID0+IHtcclxuICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBkZWNvZGVkQXVkaW8gKTtcclxuICAgIHNhZmVVbmxvY2soKTtcclxuICB9XHJcbn07XHJcbmNvbnN0IG9uRGVjb2RlRXJyb3IgPSBkZWNvZGVFcnJvciA9PiB7XHJcbiAgY29uc29sZS53YXJuKCAnZGVjb2RlIG9mIGF1ZGlvIGRhdGEgZmFpbGVkLCB1c2luZyBzdHViYmVkIHNvdW5kLCBlcnJvcjogJyArIGRlY29kZUVycm9yICk7XHJcbiAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBwaGV0QXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlciggMSwgMSwgcGhldEF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlICkgKTtcclxuICBzYWZlVW5sb2NrKCk7XHJcbn07XHJcbmNvbnN0IGRlY29kZVByb21pc2UgPSBwaGV0QXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YSggc291bmRCeXRlQXJyYXkuYnVmZmVyLCBvbkRlY29kZVN1Y2Nlc3MsIG9uRGVjb2RlRXJyb3IgKTtcclxuaWYgKCBkZWNvZGVQcm9taXNlICkge1xyXG4gIGRlY29kZVByb21pc2VcclxuICAgIC50aGVuKCBkZWNvZGVkQXVkaW8gPT4ge1xyXG4gICAgICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgICAgIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggZGVjb2RlZEF1ZGlvICk7XHJcbiAgICAgICAgc2FmZVVubG9jaygpO1xyXG4gICAgICB9XHJcbiAgICB9IClcclxuICAgIC5jYXRjaCggZSA9PiB7XHJcbiAgICAgIGNvbnNvbGUud2FybiggJ3Byb21pc2UgcmVqZWN0aW9uIGNhdWdodCBmb3IgYXVkaW8gZGVjb2RlLCBlcnJvciA9ICcgKyBlICk7XHJcbiAgICAgIHNhZmVVbmxvY2soKTtcclxuICAgIH0gKTtcclxufVxyXG5leHBvcnQgZGVmYXVsdCB3cmFwcGVkQXVkaW9CdWZmZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLE9BQU9BLFdBQVcsTUFBTSxtQ0FBbUM7QUFDM0QsT0FBT0Msc0JBQXNCLE1BQU0sMENBQTBDO0FBQzdFLE9BQU9DLGtCQUFrQixNQUFNLHNDQUFzQztBQUNyRSxPQUFPQyxnQkFBZ0IsTUFBTSxvQ0FBb0M7QUFFakUsTUFBTUMsUUFBUSxHQUFHLHk0RkFBeTRGO0FBQzE1RixNQUFNQyxjQUFjLEdBQUdKLHNCQUFzQixDQUFFRSxnQkFBZ0IsRUFBRUMsUUFBUyxDQUFDO0FBQzNFLE1BQU1FLE1BQU0sR0FBR04sV0FBVyxDQUFDTyxVQUFVLENBQUVILFFBQVMsQ0FBQztBQUNqRCxNQUFNSSxrQkFBa0IsR0FBRyxJQUFJTixrQkFBa0IsQ0FBQyxDQUFDOztBQUVuRDtBQUNBLElBQUlPLFFBQVEsR0FBRyxLQUFLO0FBQ3BCLE1BQU1DLFVBQVUsR0FBR0EsQ0FBQSxLQUFNO0VBQ3ZCLElBQUssQ0FBQ0QsUUFBUSxFQUFHO0lBQ2ZILE1BQU0sQ0FBQyxDQUFDO0lBQ1JHLFFBQVEsR0FBRyxJQUFJO0VBQ2pCO0FBQ0YsQ0FBQztBQUVELE1BQU1FLGVBQWUsR0FBR0MsWUFBWSxJQUFJO0VBQ3RDLElBQUtKLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLElBQUksRUFBRztJQUMzRE4sa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVILFlBQWEsQ0FBQztJQUMxREYsVUFBVSxDQUFDLENBQUM7RUFDZDtBQUNGLENBQUM7QUFDRCxNQUFNTSxhQUFhLEdBQUdDLFdBQVcsSUFBSTtFQUNuQ0MsT0FBTyxDQUFDQyxJQUFJLENBQUUsMkRBQTJELEdBQUdGLFdBQVksQ0FBQztFQUN6RlQsa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVaLGdCQUFnQixDQUFDaUIsWUFBWSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVqQixnQkFBZ0IsQ0FBQ2tCLFVBQVcsQ0FBRSxDQUFDO0VBQ2hIWCxVQUFVLENBQUMsQ0FBQztBQUNkLENBQUM7QUFDRCxNQUFNWSxhQUFhLEdBQUduQixnQkFBZ0IsQ0FBQ29CLGVBQWUsQ0FBRWxCLGNBQWMsQ0FBQ21CLE1BQU0sRUFBRWIsZUFBZSxFQUFFSyxhQUFjLENBQUM7QUFDL0csSUFBS00sYUFBYSxFQUFHO0VBQ25CQSxhQUFhLENBQ1ZHLElBQUksQ0FBRWIsWUFBWSxJQUFJO0lBQ3JCLElBQUtKLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLElBQUksRUFBRztNQUMzRE4sa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVILFlBQWEsQ0FBQztNQUMxREYsVUFBVSxDQUFDLENBQUM7SUFDZDtFQUNGLENBQUUsQ0FBQyxDQUNGZ0IsS0FBSyxDQUFFQyxDQUFDLElBQUk7SUFDWFQsT0FBTyxDQUFDQyxJQUFJLENBQUUscURBQXFELEdBQUdRLENBQUUsQ0FBQztJQUN6RWpCLFVBQVUsQ0FBQyxDQUFDO0VBQ2QsQ0FBRSxDQUFDO0FBQ1A7QUFDQSxlQUFlRixrQkFBa0IifQ==