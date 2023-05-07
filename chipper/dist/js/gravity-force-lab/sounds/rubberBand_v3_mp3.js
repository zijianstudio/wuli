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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImJhc2U2NFNvdW5kVG9CeXRlQXJyYXkiLCJXcmFwcGVkQXVkaW9CdWZmZXIiLCJwaGV0QXVkaW9Db250ZXh0Iiwic291bmRVUkkiLCJzb3VuZEJ5dGVBcnJheSIsInVubG9jayIsImNyZWF0ZUxvY2siLCJ3cmFwcGVkQXVkaW9CdWZmZXIiLCJ1bmxvY2tlZCIsInNhZmVVbmxvY2siLCJvbkRlY29kZVN1Y2Nlc3MiLCJkZWNvZGVkQXVkaW8iLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJvbkRlY29kZUVycm9yIiwiZGVjb2RlRXJyb3IiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZUJ1ZmZlciIsInNhbXBsZVJhdGUiLCJkZWNvZGVQcm9taXNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYnVmZmVyIiwidGhlbiIsImNhdGNoIiwiZSJdLCJzb3VyY2VzIjpbInJ1YmJlckJhbmRfdjNfbXAzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlICovXHJcbmltcG9ydCBhc3luY0xvYWRlciBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXN5bmNMb2FkZXIuanMnO1xyXG5pbXBvcnQgYmFzZTY0U291bmRUb0J5dGVBcnJheSBmcm9tICcuLi8uLi90YW1iby9qcy9iYXNlNjRTb3VuZFRvQnl0ZUFycmF5LmpzJztcclxuaW1wb3J0IFdyYXBwZWRBdWRpb0J1ZmZlciBmcm9tICcuLi8uLi90YW1iby9qcy9XcmFwcGVkQXVkaW9CdWZmZXIuanMnO1xyXG5pbXBvcnQgcGhldEF1ZGlvQ29udGV4dCBmcm9tICcuLi8uLi90YW1iby9qcy9waGV0QXVkaW9Db250ZXh0LmpzJztcclxuXHJcbmNvbnN0IHNvdW5kVVJJID0gJ2RhdGE6YXVkaW8vbXBlZztiYXNlNjQsLy9zd3hBQUFCZ1FBK3pRUmdCRUlwaU9qTmlBQUFhVldRVUlXRDU4b2NMbHdmeWpwY0h3ZkI4SHpsYnhHLytVREhEOWN1RDRQbjFBK0Q0UGgvOFQ5WVBnL0IvL0pnQUVBSVlBUVFSVE10UEhEMXpGcS9mczVWN24vK3NmU1RXMVdwTTFiYnRBeGZiMU1jT0JpQjJ0NUNjd3h5QzBJdjdmWWZXcmY2Lys3bVFsMzZwLy81NUJDRlpFbEFFa01yWjg3WnJ4SnQ4Z2tuMXhDdG1qaC8vc3l4QW9BQ2NpWldMbWpnQUQvaTJxUHRvQUFMNy8zRGRlTnZyZzRDNGpDYmhPSkJBSHdvRzFzUndRTU1PT1BIZmlPSloxNDFFVW9TL01RYU5SMGNiRWVVQW1GWEorM1lmNDc1UXg4ODRBQUFMZ3g0eERWUUhGSmE1R3hQcDhIZWpVQ1VzYzFBMFBROWxMUWVGa2pxU0xhNDVvdEQ1NCtKVVZNT1BBN1BFMHl3Wm5WN0t0OFh1LytZK3pmY1ZjcUNvQUI0R0lDUjdnaVJEWkVpUC83TXNRR2dBazRnVXpOcEdlQS80WnJJWmVrQm9QdnBXYTBLZytjTUJ4dHN3UzlnbldoRit3dzVEM1ZORG9oeTJnbnoxQ2tRTHYyM3FpaXg5NFRZRkFNOXBLek16UkZhbnJQT0l5YjFwV3lMN1FGYWxHd2d3QlpJSElub0Fqb0dqcEVhSkI0VkU0SUN0YnJJbVVhaXRRSUR3V01vUkREMjFiQllHaHdra3drRkJEcy90TEZFRFhKT0dzU3hhUW9IMkNsQUNaVVhBdlFDb2VDQTZULyt6TEVCWUFJZkRGUkRXRWdlUnFJYUttOG1Dbk1XQU5nTU1zalJWZ1lrSGlVUk12NjdTd3BDeHh6SVFuSEhQbXJrMXJwQ24rTGxQcXQvZGJVNzlwN3VkZCtRU2FNZC8vLzVmNmI0TXdBRWdrSnVZQUJTVU90Q1RhTkE1QWMwTWlzMGtUQVl4Q0hkZ21qdmhZdllZb2hJeU1LdlMySW9vem9YTmVKby9xcFJxMkgwYVpreE4rK0lyODFlTFdjQjEzNGR5NGxWUUJBQ0lTTG9BTWovL3N3eEFRQUNIaXhQMDRrWjRFQ0VpamhzdzNtQlliVFM0ekZRWFNvUW1NS21ReU1BUWhTRVJFOVFvVjFDd1pVMTdSQ2pUVFk0VFpJUmJtYUh2V2dTSGVKTCtYNXhwa1gvYzkybUNmZG1USkVGVlZ2d01BT3prUUFPQ2kvWWtFeUdTdXpLbWszMytmaUt5NlM5bmpSYlFaVlhSSmNPc3VZaWtJcE90akdhZFZhZHQrSWxUUHQxQ0NTYldaQXAxRDg4aFVBQkFnVndBd3ZMVFdJLy9zeXhBVUNTR2l0T3k0d1oyRDJDcWNaekpndDJNaGhNeGVCQXdUc09aMnpFd0Rrek9EeEFMeGJjaFZRMmhoWWEyQnQ4cUpPVm9kVWlPMWtxd3lab3E3VFQrd3JWcmVwL3AwSzQ4L0ZVdFdZVm9KUXRRUGVCdEVkSGdjTjExTG52aTBJbnJzT2c0d2FNb2tjQzRVZTV2aHJsbHp1WTlGaWRsRFptYTRDNU5MYXlqWTV5NkhGeStQLy9sa0FBSlRnTU11MG5Lb1M0ZWdZWkt6dFpQLzdNc1FJZ2tjSU16a09aU0M0MnhDbTVjeVlKbHdVQzVPRHBzVHJyMFFseFUwZ1ZZT3lpQVNEaktiaUVUaElRU2ZRei93ZHU0ZDFUbzZjK1prbFlNUkhVQnlVVDhGdXhJSkJJcnRnVGNwSE54WU9PRXFFQU1CUWNTWDlPRnJoRVJxU0tSV05PZjdNUERJOWwvSndWZVd6ZnVvQUpwV1lBQXdTY2p1UXBDZ0hDQTBHQkJwYm1ObFh6QmhORDljd2F1RGRESjdDQzRaUjlLRjhKVHIvK3pMRUZRQkhWSU0xTGpCcE1NZ0taSVhkREQwWTJjQ0U1TU5VTW05bCtCVU9GNFdvZFF4NnBRMzRNazU1dy9nWXlJZER1c09PQkh3VUNiRkFyVklhdzdIcmNCU3V6TklBZ1NMblZiVEZ0cVFaTExESmZ3N2lDRUFES3Z0alExRHpINWpxVHpIaGhvOFFHcVpFWjY3blNWeU1YQmo2ZEpOR3dISnZZYldsbnJNUHRRblFJRFR4NzlkM0svLy9XQ0JvSFJCL3FXSnRSOGNHS21RRC8vc3d4Q0tEQnRROUlFN3A0TURtQ1NQRjNhUWdRY1NqSWpBaFpsdkM4N3RnRERLQUpqd21lVExIVEtuOFZyakQrMzFOS3FDNG5zN2YyZW85djYvZDlWVUlESVJIV05QVUVnNnhGTjVSREp5a2FEaTVpWHFtVVJVaW9HZWdkTFEzSElzNnVYUUpPMXlCYjVqeWovb3QvVC90bzltN1daUlpMSnFnaUlCWFJQcUxqTVNBTWFRVU5FSWVYM2RRZ0JFY3laUENJTWFFcEMrMXZ4eUovL3N5eEMyRFJwUTVIQzl0Z1FEaUIyTUI3YkFnN28yY1F0QTNjSzZ2L01LL2J0L3ZyUFhVcWhxbHc1Zm5UeXB3QS9vMHg4YWloeHBMbElRS3hRTlFWdjNwOGFFdmpOR1VxMC8wV29sM0xFSWhwWUNwd28vOS9idWRjWitzRlZjTmY1Uk1paE9PZUdOdUFBSU43Um5ncGh3TUJSUDZxMytkTEsxMFdkZHF2NjNLL3ozdi85ZjZhdW95VVVBelIrQ1dBWjZWbHF0MExCeENRQktHU3YvN01zUTZnd2FZSXlKT2FZQ1FzUVJrQ2QwOENxRGp1K1dpaUxGdks4d3ZWZUpZb1kvLzJOL3AyczJIUDBidnJyUDBvTXJFZGMyQ0FOd09HVEtBS0RrNkhCWWFBd2pCVWh1TkJrWU9PbFN4U2xPVWJqM0g5ekdxZFd5MzliRjJrYXRkYWRUV2hqMWJhQUpRZ3hEQmJqU2FBN09tSWpNZzJuR2hrYUhTLzlDem00K2NHQzJqaC9qV1U1R3ZvWDdHdlJyK083NEh2US9obnM3T1grbi8rekxFVGdQR09ERVVEMjFoQU5rSElvSHVLQ0JxVmNPZGFnK1FRMG9UalBUcVVMVjA0S3lZYTZYY3NkVWlyZHp2MTgxYlpwYjRacTlVdDkxRzVOTmpLRHhUV2pJQW13ZjNtL2lRT1NDSW9BQU8zQk41dWpJc2dGSGVFQ0RmRmRySnhEUGYvbEs5ZWhGeWJ2SXpXeFlxMnhhbEVGd053dGdPNlMzTWdRcUREWVBwVUFZcWFST0cwcC9xSU9aUmNtaVphajJNbUw5WDA4UlByL2F2Ly9zd3hGNERCb0F6Rms5c29RQ3dBK1BKektRU2N4ZDQ2b2t5am9SRm1vVFZBRVRETUJYanprQ3pqR0RuRlJVZGZabkJ6MTBBZ1NIN3dEN1FlZDZYKzc1YU5lOWJiUG5lWllzK3RYemx1eXJTZ3lzS0EvMUd3NkFNNFpFemdrdTY4cjNRUXpsOGVCYzNsNmtPU3JVS1Uxak5lNnNwdWNwQjFmY1puTmRPM05yNGFmTUpyYW95cWNrN1ZOSTNNTTM2b1NkbGtrazN4NCtMNDhnby8vc3l4SEdEUm5RMUVnN3NRUURPQm1KRjNCeFkwUFhUWFZCc2F3MTIxYWpWM2JSYnVOSFZSZTdkR3hxRWVNUGJMVUFZY1MvWm9GbUh0Tm5NTk00YTRCSThWeUs2VzF6S2pXNGExRmN2NUg5bjMwL0FiWEJyTVBLbTB2MUhpWnJkdDBxRlVjTXlRVTVBQUNvWXNpbnkyd0VTVW1sMTBWak8xZmI3b3V5K2UyS3d3dU1ydDZyUFFva0NMeklXVTlRbzB1QXdDR25oaGhKd25PQkE4Ly83TXNTQmd3WVFOeFJPNkVEQTBnYWlBZDBjSUdpdHVBNEVBRUU3VW9HTWZKMkZPNG41aGk3YTN0RmhnTVd0VzRYOUJoVWk1VG5peDlyR1RwVzQvSjBJS3FJWWFrUEI2WVVnTjBzc1JLdFZpaEs0MjFUa0tVNFhLQ0ZnSUxHTk5PUWxIdUVIMHNFOGNRSUxTcU52cGxkRnhFZTJ4U09vQUFnQkVBdzNaRERzZ2JOYzhqUkJWVzNHY2poY0NsSGdFMVFMVmVkN3ZvdjdvbjNHWlFQLyt6TEVrd09HVkQ4UUR1aEJBTUFENGduTkxBaXJlcGNpOEdRS2NMalhzakFXQzVJVmNoSVFjaFVBQXdPVUFnemRNREJRak9zZ2NCRkQ3VU1TUlM1V2pXSWl0c2p2bXVsYi9iVHlheWU2THBVTkZsTk10Q0J0SWxHTlFwN2FIa1BXTkMzRHRRMDZRaVljUkpNcVNoNVI3ajExcURleTFTcXpPSlA4TExjY1RUZWZSQmdZSW5PY3NZR3hEQXdRRkdxV1pWU3FBQUFBZ044QVFLUFIvL3N3eEtXREJld1RGazVnd0ZEWkFtSEozUmdJMFlrQ1lTQ2dYZzhwTnlyYkxWWUhzcDFjNjVuZTkrRzNGYm1JTUErWlVRWVRjMFhKZzlLcE9tRGloVWVkWWtkUW9RRFdCRWhMR29vT2xublUzb0xEdzZWR1BCWXFNUENVcWRCb3E3K2Rocjd1R3IrSGF3MVdIZjUyb08wVlRFRk5SVE11T1RrdU0xVlZWVlZWVlZWVlZWVlZWVlZWVlZWUmdCREJRd01FSENCd2NGaFlXRnhVLy9zeXhMWUFCdGdQRU01bDRCRHFBbUZsekxBQVZGUlVXRmhZV0YyZjFDd3NMQ3dxS2lvcUtmK0tpclBXS3M0dC9yRlJWQ3BNUVUxRk15NDVPUzR6cXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXF2LzdNc1RCQWthNEV3c3VaWUFBellGZzFieWtBcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXIvK3pERTBBSUc2QXNIamJCQUFMaUI0Tm1EQkFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFyLyt6TEUxQVBHQkJhVVFRaGlVQUFBTklBQUFBU3FxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXEnO1xyXG5jb25zdCBzb3VuZEJ5dGVBcnJheSA9IGJhc2U2NFNvdW5kVG9CeXRlQXJyYXkoIHBoZXRBdWRpb0NvbnRleHQsIHNvdW5kVVJJICk7XHJcbmNvbnN0IHVubG9jayA9IGFzeW5jTG9hZGVyLmNyZWF0ZUxvY2soIHNvdW5kVVJJICk7XHJcbmNvbnN0IHdyYXBwZWRBdWRpb0J1ZmZlciA9IG5ldyBXcmFwcGVkQXVkaW9CdWZmZXIoKTtcclxuXHJcbi8vIHNhZmUgd2F5IHRvIHVubG9ja1xyXG5sZXQgdW5sb2NrZWQgPSBmYWxzZTtcclxuY29uc3Qgc2FmZVVubG9jayA9ICgpID0+IHtcclxuICBpZiAoICF1bmxvY2tlZCApIHtcclxuICAgIHVubG9jaygpO1xyXG4gICAgdW5sb2NrZWQgPSB0cnVlO1xyXG4gIH1cclxufTtcclxuXHJcbmNvbnN0IG9uRGVjb2RlU3VjY2VzcyA9IGRlY29kZWRBdWRpbyA9PiB7XHJcbiAgaWYgKCB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS52YWx1ZSA9PT0gbnVsbCApIHtcclxuICAgIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggZGVjb2RlZEF1ZGlvICk7XHJcbiAgICBzYWZlVW5sb2NrKCk7XHJcbiAgfVxyXG59O1xyXG5jb25zdCBvbkRlY29kZUVycm9yID0gZGVjb2RlRXJyb3IgPT4ge1xyXG4gIGNvbnNvbGUud2FybiggJ2RlY29kZSBvZiBhdWRpbyBkYXRhIGZhaWxlZCwgdXNpbmcgc3R1YmJlZCBzb3VuZCwgZXJyb3I6ICcgKyBkZWNvZGVFcnJvciApO1xyXG4gIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggcGhldEF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXIoIDEsIDEsIHBoZXRBdWRpb0NvbnRleHQuc2FtcGxlUmF0ZSApICk7XHJcbiAgc2FmZVVubG9jaygpO1xyXG59O1xyXG5jb25zdCBkZWNvZGVQcm9taXNlID0gcGhldEF1ZGlvQ29udGV4dC5kZWNvZGVBdWRpb0RhdGEoIHNvdW5kQnl0ZUFycmF5LmJ1ZmZlciwgb25EZWNvZGVTdWNjZXNzLCBvbkRlY29kZUVycm9yICk7XHJcbmlmICggZGVjb2RlUHJvbWlzZSApIHtcclxuICBkZWNvZGVQcm9taXNlXHJcbiAgICAudGhlbiggZGVjb2RlZEF1ZGlvID0+IHtcclxuICAgICAgaWYgKCB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS52YWx1ZSA9PT0gbnVsbCApIHtcclxuICAgICAgICB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS5zZXQoIGRlY29kZWRBdWRpbyApO1xyXG4gICAgICAgIHNhZmVVbmxvY2soKTtcclxuICAgICAgfVxyXG4gICAgfSApXHJcbiAgICAuY2F0Y2goIGUgPT4ge1xyXG4gICAgICBjb25zb2xlLndhcm4oICdwcm9taXNlIHJlamVjdGlvbiBjYXVnaHQgZm9yIGF1ZGlvIGRlY29kZSwgZXJyb3IgPSAnICsgZSApO1xyXG4gICAgICBzYWZlVW5sb2NrKCk7XHJcbiAgICB9ICk7XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgd3JhcHBlZEF1ZGlvQnVmZmVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQSxPQUFPQSxXQUFXLE1BQU0sbUNBQW1DO0FBQzNELE9BQU9DLHNCQUFzQixNQUFNLDBDQUEwQztBQUM3RSxPQUFPQyxrQkFBa0IsTUFBTSxzQ0FBc0M7QUFDckUsT0FBT0MsZ0JBQWdCLE1BQU0sb0NBQW9DO0FBRWpFLE1BQU1DLFFBQVEsR0FBRyw2eklBQTZ6STtBQUM5MEksTUFBTUMsY0FBYyxHQUFHSixzQkFBc0IsQ0FBRUUsZ0JBQWdCLEVBQUVDLFFBQVMsQ0FBQztBQUMzRSxNQUFNRSxNQUFNLEdBQUdOLFdBQVcsQ0FBQ08sVUFBVSxDQUFFSCxRQUFTLENBQUM7QUFDakQsTUFBTUksa0JBQWtCLEdBQUcsSUFBSU4sa0JBQWtCLENBQUMsQ0FBQzs7QUFFbkQ7QUFDQSxJQUFJTyxRQUFRLEdBQUcsS0FBSztBQUNwQixNQUFNQyxVQUFVLEdBQUdBLENBQUEsS0FBTTtFQUN2QixJQUFLLENBQUNELFFBQVEsRUFBRztJQUNmSCxNQUFNLENBQUMsQ0FBQztJQUNSRyxRQUFRLEdBQUcsSUFBSTtFQUNqQjtBQUNGLENBQUM7QUFFRCxNQUFNRSxlQUFlLEdBQUdDLFlBQVksSUFBSTtFQUN0QyxJQUFLSixrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNDLEtBQUssS0FBSyxJQUFJLEVBQUc7SUFDM0ROLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0UsR0FBRyxDQUFFSCxZQUFhLENBQUM7SUFDMURGLFVBQVUsQ0FBQyxDQUFDO0VBQ2Q7QUFDRixDQUFDO0FBQ0QsTUFBTU0sYUFBYSxHQUFHQyxXQUFXLElBQUk7RUFDbkNDLE9BQU8sQ0FBQ0MsSUFBSSxDQUFFLDJEQUEyRCxHQUFHRixXQUFZLENBQUM7RUFDekZULGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0UsR0FBRyxDQUFFWixnQkFBZ0IsQ0FBQ2lCLFlBQVksQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFakIsZ0JBQWdCLENBQUNrQixVQUFXLENBQUUsQ0FBQztFQUNoSFgsVUFBVSxDQUFDLENBQUM7QUFDZCxDQUFDO0FBQ0QsTUFBTVksYUFBYSxHQUFHbkIsZ0JBQWdCLENBQUNvQixlQUFlLENBQUVsQixjQUFjLENBQUNtQixNQUFNLEVBQUViLGVBQWUsRUFBRUssYUFBYyxDQUFDO0FBQy9HLElBQUtNLGFBQWEsRUFBRztFQUNuQkEsYUFBYSxDQUNWRyxJQUFJLENBQUViLFlBQVksSUFBSTtJQUNyQixJQUFLSixrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNDLEtBQUssS0FBSyxJQUFJLEVBQUc7TUFDM0ROLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0UsR0FBRyxDQUFFSCxZQUFhLENBQUM7TUFDMURGLFVBQVUsQ0FBQyxDQUFDO0lBQ2Q7RUFDRixDQUFFLENBQUMsQ0FDRmdCLEtBQUssQ0FBRUMsQ0FBQyxJQUFJO0lBQ1hULE9BQU8sQ0FBQ0MsSUFBSSxDQUFFLHFEQUFxRCxHQUFHUSxDQUFFLENBQUM7SUFDekVqQixVQUFVLENBQUMsQ0FBQztFQUNkLENBQUUsQ0FBQztBQUNQO0FBQ0EsZUFBZUYsa0JBQWtCIn0=