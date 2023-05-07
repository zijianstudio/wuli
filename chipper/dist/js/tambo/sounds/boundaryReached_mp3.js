/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';
const soundURI = 'data:audio/mpeg;base64,//swxAAAB5g/PnT2AAEODWz3MPACATcwAQxWRG8v4t4m5Y0gGrH+vEEIQ0J864QJgfEs//KUlhYscDHWH/BDD+7p8EAQBB3pBAEAQBABg+fwQAAABLbkkl+wAAAAAAApUEcylxWEbBYbjKTtTlM3eamWe5RAcBxA6VypWY/T+Lr1S1waL6rSucRXH9ORv3pvMuaX8aPVHAAHBUpB//syxAMCSChfPF28ABkDiqWd3bC1gSAHIAIB+Eua0PmBBI8GxoUDjBQgFHgkCKwrcSkWU6j9Sd+KaBUriJjhajVnvzMt1d7qnsZ///XxGarCW8ICUBSEMlofMKEEMUxHBpw1wME1UzDAIKgQMlzDhMDDKBify5qB0oNf2gp6peEUEQRlcTW9MN8XxQTaJeim2apgHXh0BA42HdjNLf/7MsQFggh4Wyguaea5EwulXc0k5sOdsU8HATEgJBsocOAYml+fvgPRkTAMqGk6FmJpDTjOn1MGkcUStpHsmIbInFwJGEsLanJYVDH8wCQSw4BWcJUpo5emDQ4bvFJ8R8GGQ8Y04EKYPAAk7BdNV8H2mJ54aS6xWdoQwIjE7LBlCLKCIUyihd/5O1Pr/Z//r//+ugAkgUDASheRbs7/+zLEBQIIMF0i7mknUQqKI43cjOo+4jDKZN4nQ+nnzAIQAIFAOgYZUEPnmTwex2HYpllk6m47QrXB/jCOonH1PVe/P+7f/yX////+oAJ/YCSrrMBgnNhCHMIDzMAgfM3JgRnS+W8QBgr0D4Pqy1k7lMfZVff9q1aA+omBkMhA4OM8FGFw99bPp+T/fX//9dUAKAcCZaSBQNNowTBB//swxAaDB/xNGm7hhtEICaLN3DDSlmkhAGok1mBAQFtknQ4AT4+pYJAiw0w4BwzUW4PaQgrVEGL6z0z0QVwH+d6Zr///6v8oAG7eA3pboQCSbFGAYeB2anAuc/ywAh/BhEZkqxPg7Bp8kJci1ITUM1YE9UZUPaWOT+Ks/zzcz8VejwR+j/T+z9HSADd3AQ+ZeKCgZHp2Fh8NAB5O//syxAkDR9RNFG7hJpD2jqINzpSynmlDBxw8IELTAVYo5IBlgwaHhk9qYTAyl58Dpjtf6q3Dv1vTRnvlv8S/6P9ABicJuxgUDmP6IKqoMDx1iggKEpYCCGUl4HnjMrXBkpxbk2rPIg7z9PwGIK9Ap1blL/0jaJjb9f+W/PU/5aoApe4BRQuWYMAobdPOYFIYaMk6fJDqYhBGg0Dsu//7MsQOgwiUUQZu4MdRBQogTdwY6oFDoaFxGnF+6NKF+px/5Pgxp7nlue5Ehb/4DjJz2n9+z8633/7v/KgFMbgIZImmDYHG86VGIYtGiJdHPZNmA4QJDruegBSAp2mvCtqonzjRyjPTPpc6RzbxeJPndFfzH/Zkv/9X75b/LSHIAAIqqsBDGcsQI0YnBj5+kYCQsu4vQoAi2rOVhXH/+zLED4JGvEEAbm0jUKoO4KmTCVZRFoN0WXzjW0zW6Q28yWOZvKPjXpnMNBsVda1ccCOMpS9GgcVUAh+JxR+hMHbWqv3wolHgh/gLfq3QCfwYlZ2+kmoAAAqSPYAAAZXQtxfw5RFhnCEoyBHegrALYEK6pBnXpBhS/4ci6AoaNlhus1y3kjUghRNDGRIyxJtzBboYMpeic0Op0DSX//swxCMCxQBO96eMy3C2A0AB73hMkPMgl18xMmNDDAXHMEdYykxBTUUzLjk5LjWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImJhc2U2NFNvdW5kVG9CeXRlQXJyYXkiLCJXcmFwcGVkQXVkaW9CdWZmZXIiLCJwaGV0QXVkaW9Db250ZXh0Iiwic291bmRVUkkiLCJzb3VuZEJ5dGVBcnJheSIsInVubG9jayIsImNyZWF0ZUxvY2siLCJ3cmFwcGVkQXVkaW9CdWZmZXIiLCJ1bmxvY2tlZCIsInNhZmVVbmxvY2siLCJvbkRlY29kZVN1Y2Nlc3MiLCJkZWNvZGVkQXVkaW8iLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJvbkRlY29kZUVycm9yIiwiZGVjb2RlRXJyb3IiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZUJ1ZmZlciIsInNhbXBsZVJhdGUiLCJkZWNvZGVQcm9taXNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYnVmZmVyIiwidGhlbiIsImNhdGNoIiwiZSJdLCJzb3VyY2VzIjpbImJvdW5kYXJ5UmVhY2hlZF9tcDMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgKi9cclxuaW1wb3J0IGFzeW5jTG9hZGVyIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9hc3luY0xvYWRlci5qcyc7XHJcbmltcG9ydCBiYXNlNjRTb3VuZFRvQnl0ZUFycmF5IGZyb20gJy4uLy4uL3RhbWJvL2pzL2Jhc2U2NFNvdW5kVG9CeXRlQXJyYXkuanMnO1xyXG5pbXBvcnQgV3JhcHBlZEF1ZGlvQnVmZmVyIGZyb20gJy4uLy4uL3RhbWJvL2pzL1dyYXBwZWRBdWRpb0J1ZmZlci5qcyc7XHJcbmltcG9ydCBwaGV0QXVkaW9Db250ZXh0IGZyb20gJy4uLy4uL3RhbWJvL2pzL3BoZXRBdWRpb0NvbnRleHQuanMnO1xyXG5cclxuY29uc3Qgc291bmRVUkkgPSAnZGF0YTphdWRpby9tcGVnO2Jhc2U2NCwvL3N3eEFBQUI1Zy9QblQyQUFFT0RXejNNUEFDQVRjd0FReFdSRzh2NHQ0bTVZMGdHckgrdkVFSVEwSjg2NFFKZ2ZFcy8vS1VsaFlzY0RIV0gvQkREKzdwOEVBUUJCM3BCQUVBUUJBQmcrZndRQUFBQkxia2tsK3dBQUFBQUFBcFVFY3lseFdFYkJZYmpLVHRUbE0zZWFtV2U1UkFjQnhBNlZ5cFdZL1QrTHIxUzF3YUw2clN1Y1JYSDlPUnYzcHZNdWFYOGFQVkhBQUhCVXBCLy9zeXhBTUNTQ2hmUEYyOEFCa0RpcVdkM2JDMWdTQUhJQUlCK0V1YTBQbUJCSThHeG9VRGpCUWdGSGdrQ0t3cmNTa1dVNmo5U2QrS2FCVXJpSmpoYWpWbnZ6TXQxZDdxbnNaLy8vWHhHYXJDVzhJQ1VCU0VNbG9mTUtFRU1VeEhCcHcxd01FMVV6REFJS2dRTWx6RGhNRERLQmlmeTVxQjBvTmYyZ3A2cGVFVUVRUmxjVFc5TU44WHhRVGFKZWltMmFwZ0hYaDBCQTQySGRqTkxmLzdNc1FGZ2doNFd5Z3VhZWE1RXd1bFhjMGs1c09kc1U4SEFURWdKQnNvY09BWW1sK2Z2Z1BSa1RBTXFHazZGbUpwRFRqT24xTUdrY1VTdHBIc21JYkluRndKR0VzTGFuSllWREg4d0NRU3c0QldjSlVwbzVlbURRNGJ2Rko4UjhHR1E4WTA0RUtZUEFBazdCZE5WOEgybUo1NGFTNnhXZG9Rd0lqRTdMQmxDTEtDSVV5aWhkLzVPMVByL1ovL3IvLyt1Z0FrZ1VEQVNoZVJiczcvK3pMRUJRSUlNRjBpN21rblVRcUtJNDNjak9vKzRqREtaTjRuUStubnpBSVFBSUZBT2dZWlVFUG5tVHdleDJIWXBsbGs2bTQ3UXJYQi9qQ09vbkgxUFZlL1ArN2YveVgvLy8vK29BSi9ZQ1Nyck1CZ25OaENITUlEek1BZ2ZNM0pnUm5TK1c4UUJncjBENFBxeTFrN2xNZlpWZmY5cTFhQStvbUJrTWhBNE9NOEZHRnc5OWJQcCtUL2ZYLy85ZFVBS0FjQ1phU0JRTk5vd1RCQi8vc3d4QWFEQi94TkdtN2hodEVJQ2FMTjNERFNsbWtoQUdvazFtQkFRRnRrblE0QVQ0K3BZSkFpdzB3NEJ3elVXNFBhUWdyVkVHTDZ6MHowUVZ3SCtkNlpyLy8vNnY4b0FHN2VBM3Bib1FDU2JGR0FZZUIyYW5BdWMveXdBaC9CaEVaa3F4UGc3QnA4a0pjaTFJVFVNMVlFOVVaVVBhV09UK0tzL3p6Y3o4VmVqd1Irai9UK3o5SFNBRGQzQVErWmVLQ2daSHAyRmg4TkFCNU8vL3N5eEFrRFI5Uk5GRzdoSnBEMmpxSU56cFN5bm1sREJ4dzhJRUxUQVZZbzVJQmxnd2FIaGs5cVlUQXlsNThEcGp0ZjZxM0R2MXZUUm52bHY4Uy82UDlBQmljSnV4Z1VEbVA2SUtxb01EeDFpZ2dLRXBZQ0NHVWw0SG5qTXJYQmtweGJrMnJQSWc3ejlQd0dJSzlBcDFibEwvMGphSmpiOWYrVy9QVS81YW9BcGU0QlJRdVdZTUFvYmRQT1lGSVlhTWs2ZkpEcVloQkdnMERzdS8vN01zUU9nd2lVVVFadTRNZFJCUW9nVGR3WTZvRkRvYUZ4R25GKzZOS0YrcHgvNVBneHA3bmx1ZTVFaGIvNERqSnoybjkrejg2MzMvN3YvS2dGTWJnSVpJbW1EWUhHODZWR0lZdEdpSmRIUFpObUE0UUpEcnVlZ0JTQXAybXZDdHFvbnpqUnlqUFRQcGM2UnpieGVKUG5kRmZ6SC9aa3YvOVg3NWIvTFNISUFBSXFxc0JER2NzUUkwWW5CajUra1lDUXN1NHZRb0FpMnJPVmhYSC8rekxFRDRKR3ZFRUFibTBqVUtvTzRLbVRDVlpSRm9OMFdYempXMHpXNlEyOHlXT1p2S1BqWHBuTU5Cc1ZkYTFjY0NPTXBTOUdnY1ZVQWgrSnhSK2hNSGJXcXYzd29sSGdoL2dMZnEzUUNmd1lsWjIra21vQUFBcVNQWUFBQVpYUXR4Znc1UkZobkNFb3lCSGVnckFMWUVLNnBCblhwQmhTLzRjaTZBb2FObGh1czF5M2tqVWdoUk5ER1JJeXhKdHpCYm9ZTXBlaWMwT3AwRFNYLy9zd3hDTUN4UUJPOTZlTXkzQzJBMEFCNzNoTWtQTWdsMTh4TW1ORERBWEhNRWRZeWt4QlRVVXpMams1TGpXcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcSc7XHJcbmNvbnN0IHNvdW5kQnl0ZUFycmF5ID0gYmFzZTY0U291bmRUb0J5dGVBcnJheSggcGhldEF1ZGlvQ29udGV4dCwgc291bmRVUkkgKTtcclxuY29uc3QgdW5sb2NrID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggc291bmRVUkkgKTtcclxuY29uc3Qgd3JhcHBlZEF1ZGlvQnVmZmVyID0gbmV3IFdyYXBwZWRBdWRpb0J1ZmZlcigpO1xyXG5cclxuLy8gc2FmZSB3YXkgdG8gdW5sb2NrXHJcbmxldCB1bmxvY2tlZCA9IGZhbHNlO1xyXG5jb25zdCBzYWZlVW5sb2NrID0gKCkgPT4ge1xyXG4gIGlmICggIXVubG9ja2VkICkge1xyXG4gICAgdW5sb2NrKCk7XHJcbiAgICB1bmxvY2tlZCA9IHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3Qgb25EZWNvZGVTdWNjZXNzID0gZGVjb2RlZEF1ZGlvID0+IHtcclxuICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBkZWNvZGVkQXVkaW8gKTtcclxuICAgIHNhZmVVbmxvY2soKTtcclxuICB9XHJcbn07XHJcbmNvbnN0IG9uRGVjb2RlRXJyb3IgPSBkZWNvZGVFcnJvciA9PiB7XHJcbiAgY29uc29sZS53YXJuKCAnZGVjb2RlIG9mIGF1ZGlvIGRhdGEgZmFpbGVkLCB1c2luZyBzdHViYmVkIHNvdW5kLCBlcnJvcjogJyArIGRlY29kZUVycm9yICk7XHJcbiAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBwaGV0QXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlciggMSwgMSwgcGhldEF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlICkgKTtcclxuICBzYWZlVW5sb2NrKCk7XHJcbn07XHJcbmNvbnN0IGRlY29kZVByb21pc2UgPSBwaGV0QXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YSggc291bmRCeXRlQXJyYXkuYnVmZmVyLCBvbkRlY29kZVN1Y2Nlc3MsIG9uRGVjb2RlRXJyb3IgKTtcclxuaWYgKCBkZWNvZGVQcm9taXNlICkge1xyXG4gIGRlY29kZVByb21pc2VcclxuICAgIC50aGVuKCBkZWNvZGVkQXVkaW8gPT4ge1xyXG4gICAgICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgICAgIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggZGVjb2RlZEF1ZGlvICk7XHJcbiAgICAgICAgc2FmZVVubG9jaygpO1xyXG4gICAgICB9XHJcbiAgICB9IClcclxuICAgIC5jYXRjaCggZSA9PiB7XHJcbiAgICAgIGNvbnNvbGUud2FybiggJ3Byb21pc2UgcmVqZWN0aW9uIGNhdWdodCBmb3IgYXVkaW8gZGVjb2RlLCBlcnJvciA9ICcgKyBlICk7XHJcbiAgICAgIHNhZmVVbmxvY2soKTtcclxuICAgIH0gKTtcclxufVxyXG5leHBvcnQgZGVmYXVsdCB3cmFwcGVkQXVkaW9CdWZmZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLE9BQU9BLFdBQVcsTUFBTSxtQ0FBbUM7QUFDM0QsT0FBT0Msc0JBQXNCLE1BQU0sMENBQTBDO0FBQzdFLE9BQU9DLGtCQUFrQixNQUFNLHNDQUFzQztBQUNyRSxPQUFPQyxnQkFBZ0IsTUFBTSxvQ0FBb0M7QUFFakUsTUFBTUMsUUFBUSxHQUFHLGkzREFBaTNEO0FBQ2w0RCxNQUFNQyxjQUFjLEdBQUdKLHNCQUFzQixDQUFFRSxnQkFBZ0IsRUFBRUMsUUFBUyxDQUFDO0FBQzNFLE1BQU1FLE1BQU0sR0FBR04sV0FBVyxDQUFDTyxVQUFVLENBQUVILFFBQVMsQ0FBQztBQUNqRCxNQUFNSSxrQkFBa0IsR0FBRyxJQUFJTixrQkFBa0IsQ0FBQyxDQUFDOztBQUVuRDtBQUNBLElBQUlPLFFBQVEsR0FBRyxLQUFLO0FBQ3BCLE1BQU1DLFVBQVUsR0FBR0EsQ0FBQSxLQUFNO0VBQ3ZCLElBQUssQ0FBQ0QsUUFBUSxFQUFHO0lBQ2ZILE1BQU0sQ0FBQyxDQUFDO0lBQ1JHLFFBQVEsR0FBRyxJQUFJO0VBQ2pCO0FBQ0YsQ0FBQztBQUVELE1BQU1FLGVBQWUsR0FBR0MsWUFBWSxJQUFJO0VBQ3RDLElBQUtKLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLElBQUksRUFBRztJQUMzRE4sa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVILFlBQWEsQ0FBQztJQUMxREYsVUFBVSxDQUFDLENBQUM7RUFDZDtBQUNGLENBQUM7QUFDRCxNQUFNTSxhQUFhLEdBQUdDLFdBQVcsSUFBSTtFQUNuQ0MsT0FBTyxDQUFDQyxJQUFJLENBQUUsMkRBQTJELEdBQUdGLFdBQVksQ0FBQztFQUN6RlQsa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVaLGdCQUFnQixDQUFDaUIsWUFBWSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVqQixnQkFBZ0IsQ0FBQ2tCLFVBQVcsQ0FBRSxDQUFDO0VBQ2hIWCxVQUFVLENBQUMsQ0FBQztBQUNkLENBQUM7QUFDRCxNQUFNWSxhQUFhLEdBQUduQixnQkFBZ0IsQ0FBQ29CLGVBQWUsQ0FBRWxCLGNBQWMsQ0FBQ21CLE1BQU0sRUFBRWIsZUFBZSxFQUFFSyxhQUFjLENBQUM7QUFDL0csSUFBS00sYUFBYSxFQUFHO0VBQ25CQSxhQUFhLENBQ1ZHLElBQUksQ0FBRWIsWUFBWSxJQUFJO0lBQ3JCLElBQUtKLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLElBQUksRUFBRztNQUMzRE4sa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVILFlBQWEsQ0FBQztNQUMxREYsVUFBVSxDQUFDLENBQUM7SUFDZDtFQUNGLENBQUUsQ0FBQyxDQUNGZ0IsS0FBSyxDQUFFQyxDQUFDLElBQUk7SUFDWFQsT0FBTyxDQUFDQyxJQUFJLENBQUUscURBQXFELEdBQUdRLENBQUUsQ0FBQztJQUN6RWpCLFVBQVUsQ0FBQyxDQUFDO0VBQ2QsQ0FBRSxDQUFDO0FBQ1A7QUFDQSxlQUFlRixrQkFBa0IifQ==