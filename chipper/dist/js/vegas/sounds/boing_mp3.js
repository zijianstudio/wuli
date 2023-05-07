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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImJhc2U2NFNvdW5kVG9CeXRlQXJyYXkiLCJXcmFwcGVkQXVkaW9CdWZmZXIiLCJwaGV0QXVkaW9Db250ZXh0Iiwic291bmRVUkkiLCJzb3VuZEJ5dGVBcnJheSIsInVubG9jayIsImNyZWF0ZUxvY2siLCJ3cmFwcGVkQXVkaW9CdWZmZXIiLCJ1bmxvY2tlZCIsInNhZmVVbmxvY2siLCJvbkRlY29kZVN1Y2Nlc3MiLCJkZWNvZGVkQXVkaW8iLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJvbkRlY29kZUVycm9yIiwiZGVjb2RlRXJyb3IiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZUJ1ZmZlciIsInNhbXBsZVJhdGUiLCJkZWNvZGVQcm9taXNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYnVmZmVyIiwidGhlbiIsImNhdGNoIiwiZSJdLCJzb3VyY2VzIjpbImJvaW5nX21wMy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSAqL1xyXG5pbXBvcnQgYXN5bmNMb2FkZXIgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FzeW5jTG9hZGVyLmpzJztcclxuaW1wb3J0IGJhc2U2NFNvdW5kVG9CeXRlQXJyYXkgZnJvbSAnLi4vLi4vdGFtYm8vanMvYmFzZTY0U291bmRUb0J5dGVBcnJheS5qcyc7XHJcbmltcG9ydCBXcmFwcGVkQXVkaW9CdWZmZXIgZnJvbSAnLi4vLi4vdGFtYm8vanMvV3JhcHBlZEF1ZGlvQnVmZmVyLmpzJztcclxuaW1wb3J0IHBoZXRBdWRpb0NvbnRleHQgZnJvbSAnLi4vLi4vdGFtYm8vanMvcGhldEF1ZGlvQ29udGV4dC5qcyc7XHJcblxyXG5jb25zdCBzb3VuZFVSSSA9ICdkYXRhOmF1ZGlvL21wZWc7YmFzZTY0LFNVUXpBd0FBQUFBQVZWUkRUMDRBQUFBT0FBQUFjMjkxYm1RZ1pXWm1aV04wYzFSSlZESUFBQUFHQUFBQVltOXBibWRVVUVVeEFBQUFJd0FBQUhKbFpXeDNiM0pzWkhOMGRXUnBiM01zSUcxdlpHbG1hV1ZrSUdKNUlGQm9SVlQvK3hURUFBQUQ5QjFGTkpDQUVKVU5yWU13Z0FBQUFHdFJnRC8xQlNFVVlVQkFVRWlCd2ZCQUVBUUJEaWQvUGx6Ly80SWN2bmxhMXo4YWRyWnBHeWhyRmYyNFEvUVJTNFp3RnhmclZhdVA0dHI2U3YrVlM3TVB2OVo5QUFJa2dCRC8reFRFQXdCRVVETjduTUVBTUtLR2JqUm5wTWdDcHdyT3hvWHRlTElEZENvK21ad2NKU09pVVkzRkk4RE0vLzBoU1FnQUFBQUNRQm91V3dGWU92aWJvY0tzTm1Rd29McnZiN3NmTkNJb3NyRVFUQVFHSzUwciswMVZZQUFBQUtILyt4VEVBb0VFcUZOcERDUk1pSkFHTG5SbUdNamV0M3FET0t5aEQ3TWljbzdaZDlNR2h0b2xxZEdsYm8yckdXanRESWxoWks0Z0Fnd1lBQWlsWmpsY0NmQWlDNGZBbzRJdEEvbFBUcEpkVW9XeUVlUWYyZitrWTFWWWdBQUFBNEQvK3hURUF3QkV1RE5yZ3owa3dJOEZMS2F3SUFBQkJhRHJBdTF2UXlnSjlURkF6blhBSW5XUy9NVytnR21mY1BWSUZRdXpvcUFCQkRKSmhoaFlpSHhtaVZ0Qmp3NUR1UXU5eVdhaEJBSURvRURHUFhFc0YyOGc1Yk4yL3ZMMjVqUC8reFRFQTRBRStHTm9HWlFBQUl1STdVTXdnQUZkVVJJMHNwQXd6UDJMMkdYeFVCWUp4eVF3bUpKcjY4Z21QLzJGclhHMDZITDJlK2QxS0M1OVljSHAwUUV0UHNGc2xLY3RFSElMNFUzcytGLzh5eUUzNFFQTzRzUHhxMy8zTTR2Lyt4VEVBNEFFMkdWcUdZV0FDSkdIN1VNdzhBQWgzaTBhR0FwNElDTWdyQWlJZ1FnbWpzYzk5anU0LzdZZk5wL2l2MWtZYXkrOXZQOGFmcmM4Wm1rdUs3U0RWdEppdlpRR0J4R0tydGZ2NG1XYkxnTVdlbWFsU05WMzhacldqWjcvK3hURUF3QUVzRlZvR1BhQUFKNklMTU1lOEFId0ZLckNEUGxJVDRHV0VvUGNaQmZBQTZGdWQ2ckU5SmIvTkM2b1o0UEJKejIrOFRPM1ZZVjRiNHVwMmtGTk1rNHNqR0F5bXFBRUM0UjlkVlZxaERtWVloQkMyditiMGFyWmpxNy8reFRFQVlBRVpFdG1HTWVBQUpBR3JRTWU4QUZyTjhqeWRTZ0lRRG9BWWdaa2dDQXJFK2Z6anJxT0xaeXA4WnJFSU01OTlNWDN2QzhsTnhQQlJ3L0laakY5QlFBckN4bDdXeFNDZExEMkFQRGdzSjNzYlovLytWVzl2bjM4YzhQLyt4VEVBd0FFK0VGbUdZd0FDSThJYklNZThBRVpxM0QrYmNuS0VabDhGbUV3M2ZwWWRDTnZSYjVuVi80cHFPUkpKNThETXY5V2JNWHg3NWJaRjdiZXFSL2lMdzBQQVhSMUowRDBlTXpCTmZ1VWEvaWF2b2xnczc2MXJmZTN6NnovK3hURUFvQUVzRDltR1llQUFJTUdMZStlWUFmNjV2cHVhWndid3NvUllXa0lEamVTSnl3ME1VVGpuTjZhZlFDR2h4NFRlVlVhUkFBVkFRL0VydVR3NExPMnpOajVFeFJXb3RRSE1GZU9SdktPWTUrcmYxVy95RUFHTjBBQUFBYi8reFRFQklCRUhDbDFvd1VrS0hxRnJpNmVrQWIyK0hWUzF1bEVSQ01QRjNNUVJLS2MzN01ON21IRk1CanNhSUFCSXl1OVFvclZwaTdMZDFEaUtYSldyc2RhZG9KaUU4NzdYQ2lsaTJVNWhTL0gyNzgxTXN5RVFGMXJ3S2lGUkFyLyt4VEVDZ0FHbUcxY0dZd0FDSmdJYkVNZThBQnBHVmt4ZmlDendGcU1IVXVwWGgxL3F0WFBmTThQd3ExYzkvLzk1di9xVldITzF2TmFpZnN3dkQ4TCtJY1cwR1l5a09GZ2dBblRsQUdFMS8zSEhWOFhieGtJTzNTNERiZXBGOWovK3hURUFnQUVsRGxnR1llQUFKT0g3QU13OEFERFUxakFQS1JyUXFoa1JaQ0toVVFtS21GY1BjNzNLTnZ4Z3FDYW9KTmUvM1dmbCtWemN6RFdEdDh4VWRBaUhMUytnZ0VtVkJjZ1A1MWhwTjBPMW8rc09VRE10WDZWZGJ6aHl5Ly8reFRFQW9BRXREOWdHUGVBQUpDSDY4TXc4QUFYVnN4RlNIQUlnZndUd2FzbWdFZFNGNlZvSHRDR1RHYWZ2Mmg1NjJzZk8wVVhMUHkvdjBrelQ3dnM5Q2oweFJyYmNCSnNGNEljdm5DeVdwM0d0WWdmb0JYZkNqMnRqUmR6K1V6Lyt4VEVBd0FFa0R0ZUdZWUFBSVVGTFhlWVlBVUZTUmZLQVFxUVJ2Z0JMWlNrNkJCQXRFMG5pM2F6TWR4RFlKQUpaaktwckVRQUczQUFBQWNQWHlzUE9lN0NxYVVFUVFnSnBSb0h5bW94ejJXbi9lU1plc2FBQmFVQUFBQnptSkgvK3hURUJZQUVORnQzdEpFQU9JYUhhOE13OEFDeTdpMkcxMjArZmtFdU1TeVoxWnU2MTlheFpEdVlmanVqM09ieGlOSkJYYlpjMERRWWdzT3dJTG1QVmlIQXgyalB2NCsxV3RkSytoV1cxYmVkTjh3NFB5ekcrZ2lGaTJRS1JlTC8reFRFQ1FBRVlEOWVHWWVBQUlpR3E4TXc4QUJld0NLaHkwem9TMU5lOC9Qbmdqc0xtcHk3anVqM2JnT3JscStzT296Z1NrYVFzSUlZZEFKMVFvcFFNazRJekJSN0x3R3FwbGxySHZ1RzFNbTlTQXNpbkFNRjhUWXRyd0FlR21QLyt4VEVDNEFFTUQ5Y0dQZUFBSU9ISzRNZThBRFhDeCt5VnhNeVhCbnhSOTFpdGZoY3gza0ZpUWtOcUUxRnVBMWhaRFdGak5NSExNNC9zNERhdURuOWxWeDBzc29YRnhoOVRPN0FNa1kwcDBhZ0xDb3pDb1JFb0hycDlGcFVoUWYvK3hURUQ0QUdwRlZPR1l5QUFJMEhLb014Z0FDVW5pNGxIZzR0M2p6UnJQZUg1ZjlpemtCS25SS0t4ZW5pWHZiamZpY0JMUnR1dy9ic0tVSE1iZ0FRdERHQTdURFg5czU4K29HaVd6MXFpdTF2eGwrS2VsZlpUY1pEdWk5S3hoai8reFRFQ0lBRjZEOU1HYXdBQUtDSUtrTXk4QUJDWmxHQW9aZ2tvZUVaNHk0VHd3TmdydlNyL2Z2blo0VlBRKzBxbmVWZ1g1WFR4TFZwclZ0cDdNblZTNEJJS0hJeVFqSlVBOGdaS2VKdzJnd1dDRFgvZmQ0U1BycDlOVkcwZ0NYLyt4VEVBZ0JEOUNscm5KR0FPSCtFclBhZUVBWCtBQUZiM0djZVIyaFVKMVVRTGxGV0ZCSFdZYTFZa2wxWmhhemIvaEFBTWt3RDJlRGFQQW5tM0dvNVBGV1ZGelhnSTlpY3hIKzlaVjM3RWFXTGRsbGlyV2xUMFlWM2FXaWhMR1QvK3hURUI0QUUzRDlVR1llQUFLMEtxZ016RUFCQ294VVprZUJlRmlqSjkrUTlDWnMrUEU4VldIejNBbERmNmwzd0xOVTdTTlFFNGFaYXdockZvSmhvWVlPQVpBWW5LNGdFWFFWUXVGN211UFpzaitmUG9QOExxbm55Wk4xL0l4TC8reFRFQTRBRkZEbE9HWXdBQUpHSDZnTXc4QUNYMXR1bFNMbmUwMjZTMVRtU0xSWFJhbFFsSjNTeWJMODkvUEhnT1ZyZ2czek1PNmRmS1hhZ0pwT0VNVTJiYUJYVE9GaEpmZkFkQXdnRWN5MGtYSkN2V1BUVE5PK1JRTUpud2RYLyt4VEVBb0FFekQ5UUdQZUFBSTRINmdNZmdBQm04dXNYVGV0RmVBbUlTY3hpa1dBeEFZQVVJcElLNEpRcVl0cE1kak1HQXQzbmc4UW5xT0ZSUDRveVFrY3lqNkxFZENWWWU3Z2pJdGVOUkNVZjc4NjFZRDVjdDlsM05OQjFRMEgvK3hURUF3QUVYRHRLR1l3QUFJNkdhWU14Z0FBU2RHN0NiRVlWdEFqVmgxWTVzR0JNcWxyS3B2MnlLN1YvNlRKZk5NNmxUbTJJRndiR3lPbHI1d1VXa05NWGlHQU5lY3dYYTZ5M00yQzJaeG9TUjdidXRXRHlTSWFlMnM3aWdiei8reFRFQlFBRVREbE1HWVlBQUljR3JEZVNNQVJKNnl4bEFOR1VYTWxSWFRhbHhRUVlCTWRYV1ptWXAvM1g2SWdKL2JBQUFBRkFpdFRCRTR0YVp5SXd5RFFnRTZ4aDJyVXhrazBtOTlxMXFwWTBnQzVKQUFBQWpIQkxTVXlSNDBULyt4VEVDQUJFQkNscHBKa2dlSDBFTGZhU01BZE5id3l3ZmszaU9FRkxPMTZhN255dHU2dEFOU1dnRlhMTENwSVNpbVJsSStuRkV2S0ZleGpweTgxZ29WdExUbFdmd2ViVVlqR05hYmlkaHkwOVJycU5qWDF0STJHalVySEloREwvK3hURURZQUVHRGxPR1llQUFJY0lLWU13OEFGaithQ0R0RDN4eVU1eWI3RGpkc0p1MUhUQ1lML2ROWU55WkFQRS9SMFVJSzlWUHQ5ZUwralZnU21pK0RRdm5HV2FpVjJPbzNoaTRVREF3VkFwYlE2d05aSER4VDhLTnFEL1BiUC8reFRFRVlBRWZFRk1HWWVBQ0l1SDZVTWU4QUVXMVBFVEZIbkdwQVlTZlJFK29Ea05jSUNkWnhpYVJ5M2dlVFV5ci8wSytYTjJ1Q2t3Q0FHZ3VTUzVaMi9IaFRnRTgrRVF0a0Fua3BOOGtoQVhFOEZ0dUFvQm8zMmpiWkVBTzBELyt4VEVFNEJFTERWR3ZNZUFBSDJHNnZhU1lBVUNob25oR1pLUW94dE5BbzlIRmlReFFjTElrS0wvdTVuVEFUL2RuSlVpYjZROWxYVEl4SStFUG9HMGFCWUJNMUdhQXBSbE56eS9seDRudmRtU0JJbTRrV0lyS3BLZzRFQWp6R0wvK3hURUdJQUVHRDlHR1BlQUFNNEg1d014a0FDQUFtTiswTWxaekZjd2lVa1Q3TFhVa2xETkwrblV2OGxybEZ4Wm9PV2dBV0xYZXBWVU9DdzhEc3dqc3BqK2NRWUNtazZyTmtxRXNTelFXdUlrOUg1b0psbGNYaEgvZGNsVEhaYi8reFRFRTRBRWJERkNHWWVBQUgrR0owT3c4QUJabGN2b25ZbEVFTThWNHZSL2k5NHlFYTB3Y05Fdk1TTkhsSjM3bFFUS25iYnpydDB0V0phekNLRmdqYkRLZ3daNUExb0R2M3NqcUUyZjM0UVVBRHlnQngrcmNkWUVObWhnalpuLyt4VEVGd0JEM0RFNkIrR0lxSDBGYUtpWG1VMENJcnNjakFOUFFqQVp5djJTSHROWktoYlFMd0FBRGo1L0Y4R2pFUENvU3k2WGpJRG9RbXdJYzVOak1OU2w5SzRnWVJKbzNmUTJWcU9aMHlwdG1rb21wOGw1aktnM3VRR3loM2ovK3hURUhRQkQrRGxESkxERytIOEdwSUQ4R1Jqd2xSeVJQcW9BSUt3QXhxR3BHc0psTGtHRWdaaDhMa0s0c2dlamp1cFB4alI2UGFhWU1reEJUVVV6TGprNUxqT3FxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxci8reFRFSW9QRCtERCt3WVRLSUFBQU5JQUFBQVNxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFvPSc7XHJcbmNvbnN0IHNvdW5kQnl0ZUFycmF5ID0gYmFzZTY0U291bmRUb0J5dGVBcnJheSggcGhldEF1ZGlvQ29udGV4dCwgc291bmRVUkkgKTtcclxuY29uc3QgdW5sb2NrID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggc291bmRVUkkgKTtcclxuY29uc3Qgd3JhcHBlZEF1ZGlvQnVmZmVyID0gbmV3IFdyYXBwZWRBdWRpb0J1ZmZlcigpO1xyXG5cclxuLy8gc2FmZSB3YXkgdG8gdW5sb2NrXHJcbmxldCB1bmxvY2tlZCA9IGZhbHNlO1xyXG5jb25zdCBzYWZlVW5sb2NrID0gKCkgPT4ge1xyXG4gIGlmICggIXVubG9ja2VkICkge1xyXG4gICAgdW5sb2NrKCk7XHJcbiAgICB1bmxvY2tlZCA9IHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3Qgb25EZWNvZGVTdWNjZXNzID0gZGVjb2RlZEF1ZGlvID0+IHtcclxuICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBkZWNvZGVkQXVkaW8gKTtcclxuICAgIHNhZmVVbmxvY2soKTtcclxuICB9XHJcbn07XHJcbmNvbnN0IG9uRGVjb2RlRXJyb3IgPSBkZWNvZGVFcnJvciA9PiB7XHJcbiAgY29uc29sZS53YXJuKCAnZGVjb2RlIG9mIGF1ZGlvIGRhdGEgZmFpbGVkLCB1c2luZyBzdHViYmVkIHNvdW5kLCBlcnJvcjogJyArIGRlY29kZUVycm9yICk7XHJcbiAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBwaGV0QXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlciggMSwgMSwgcGhldEF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlICkgKTtcclxuICBzYWZlVW5sb2NrKCk7XHJcbn07XHJcbmNvbnN0IGRlY29kZVByb21pc2UgPSBwaGV0QXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YSggc291bmRCeXRlQXJyYXkuYnVmZmVyLCBvbkRlY29kZVN1Y2Nlc3MsIG9uRGVjb2RlRXJyb3IgKTtcclxuaWYgKCBkZWNvZGVQcm9taXNlICkge1xyXG4gIGRlY29kZVByb21pc2VcclxuICAgIC50aGVuKCBkZWNvZGVkQXVkaW8gPT4ge1xyXG4gICAgICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgICAgIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggZGVjb2RlZEF1ZGlvICk7XHJcbiAgICAgICAgc2FmZVVubG9jaygpO1xyXG4gICAgICB9XHJcbiAgICB9IClcclxuICAgIC5jYXRjaCggZSA9PiB7XHJcbiAgICAgIGNvbnNvbGUud2FybiggJ3Byb21pc2UgcmVqZWN0aW9uIGNhdWdodCBmb3IgYXVkaW8gZGVjb2RlLCBlcnJvciA9ICcgKyBlICk7XHJcbiAgICAgIHNhZmVVbmxvY2soKTtcclxuICAgIH0gKTtcclxufVxyXG5leHBvcnQgZGVmYXVsdCB3cmFwcGVkQXVkaW9CdWZmZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLE9BQU9BLFdBQVcsTUFBTSxtQ0FBbUM7QUFDM0QsT0FBT0Msc0JBQXNCLE1BQU0sMENBQTBDO0FBQzdFLE9BQU9DLGtCQUFrQixNQUFNLHNDQUFzQztBQUNyRSxPQUFPQyxnQkFBZ0IsTUFBTSxvQ0FBb0M7QUFFakUsTUFBTUMsUUFBUSxHQUFHLHloSkFBeWhKO0FBQzFpSixNQUFNQyxjQUFjLEdBQUdKLHNCQUFzQixDQUFFRSxnQkFBZ0IsRUFBRUMsUUFBUyxDQUFDO0FBQzNFLE1BQU1FLE1BQU0sR0FBR04sV0FBVyxDQUFDTyxVQUFVLENBQUVILFFBQVMsQ0FBQztBQUNqRCxNQUFNSSxrQkFBa0IsR0FBRyxJQUFJTixrQkFBa0IsQ0FBQyxDQUFDOztBQUVuRDtBQUNBLElBQUlPLFFBQVEsR0FBRyxLQUFLO0FBQ3BCLE1BQU1DLFVBQVUsR0FBR0EsQ0FBQSxLQUFNO0VBQ3ZCLElBQUssQ0FBQ0QsUUFBUSxFQUFHO0lBQ2ZILE1BQU0sQ0FBQyxDQUFDO0lBQ1JHLFFBQVEsR0FBRyxJQUFJO0VBQ2pCO0FBQ0YsQ0FBQztBQUVELE1BQU1FLGVBQWUsR0FBR0MsWUFBWSxJQUFJO0VBQ3RDLElBQUtKLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLElBQUksRUFBRztJQUMzRE4sa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVILFlBQWEsQ0FBQztJQUMxREYsVUFBVSxDQUFDLENBQUM7RUFDZDtBQUNGLENBQUM7QUFDRCxNQUFNTSxhQUFhLEdBQUdDLFdBQVcsSUFBSTtFQUNuQ0MsT0FBTyxDQUFDQyxJQUFJLENBQUUsMkRBQTJELEdBQUdGLFdBQVksQ0FBQztFQUN6RlQsa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVaLGdCQUFnQixDQUFDaUIsWUFBWSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVqQixnQkFBZ0IsQ0FBQ2tCLFVBQVcsQ0FBRSxDQUFDO0VBQ2hIWCxVQUFVLENBQUMsQ0FBQztBQUNkLENBQUM7QUFDRCxNQUFNWSxhQUFhLEdBQUduQixnQkFBZ0IsQ0FBQ29CLGVBQWUsQ0FBRWxCLGNBQWMsQ0FBQ21CLE1BQU0sRUFBRWIsZUFBZSxFQUFFSyxhQUFjLENBQUM7QUFDL0csSUFBS00sYUFBYSxFQUFHO0VBQ25CQSxhQUFhLENBQ1ZHLElBQUksQ0FBRWIsWUFBWSxJQUFJO0lBQ3JCLElBQUtKLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLElBQUksRUFBRztNQUMzRE4sa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVILFlBQWEsQ0FBQztNQUMxREYsVUFBVSxDQUFDLENBQUM7SUFDZDtFQUNGLENBQUUsQ0FBQyxDQUNGZ0IsS0FBSyxDQUFFQyxDQUFDLElBQUk7SUFDWFQsT0FBTyxDQUFDQyxJQUFJLENBQUUscURBQXFELEdBQUdRLENBQUUsQ0FBQztJQUN6RWpCLFVBQVUsQ0FBQyxDQUFDO0VBQ2QsQ0FBRSxDQUFDO0FBQ1A7QUFDQSxlQUFlRixrQkFBa0IifQ==