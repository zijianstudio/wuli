/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';
const soundURI = 'data:audio/mpeg;base64,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VVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MsSFAMQYRv2jCSqwfoPTuPekJ1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+zDEqIPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+zLEu4PAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImJhc2U2NFNvdW5kVG9CeXRlQXJyYXkiLCJXcmFwcGVkQXVkaW9CdWZmZXIiLCJwaGV0QXVkaW9Db250ZXh0Iiwic291bmRVUkkiLCJzb3VuZEJ5dGVBcnJheSIsInVubG9jayIsImNyZWF0ZUxvY2siLCJ3cmFwcGVkQXVkaW9CdWZmZXIiLCJ1bmxvY2tlZCIsInNhZmVVbmxvY2siLCJvbkRlY29kZVN1Y2Nlc3MiLCJkZWNvZGVkQXVkaW8iLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJvbkRlY29kZUVycm9yIiwiZGVjb2RlRXJyb3IiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZUJ1ZmZlciIsInNhbXBsZVJhdGUiLCJkZWNvZGVQcm9taXNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYnVmZmVyIiwidGhlbiIsImNhdGNoIiwiZSJdLCJzb3VyY2VzIjpbImdvQmFja19tcDMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgKi9cclxuaW1wb3J0IGFzeW5jTG9hZGVyIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9hc3luY0xvYWRlci5qcyc7XHJcbmltcG9ydCBiYXNlNjRTb3VuZFRvQnl0ZUFycmF5IGZyb20gJy4uLy4uL3RhbWJvL2pzL2Jhc2U2NFNvdW5kVG9CeXRlQXJyYXkuanMnO1xyXG5pbXBvcnQgV3JhcHBlZEF1ZGlvQnVmZmVyIGZyb20gJy4uLy4uL3RhbWJvL2pzL1dyYXBwZWRBdWRpb0J1ZmZlci5qcyc7XHJcbmltcG9ydCBwaGV0QXVkaW9Db250ZXh0IGZyb20gJy4uLy4uL3RhbWJvL2pzL3BoZXRBdWRpb0NvbnRleHQuanMnO1xyXG5cclxuY29uc3Qgc291bmRVUkkgPSAnZGF0YTphdWRpby9tcGVnO2Jhc2U2NCwvL3N3eEFBQUJRQWErMVR4Z0RGQ0R1cDNOemtDQUFIOTJXVUFBSkFXQTd3dndNNFNNbDdQaCsvZjNCOFByZUNBSVFRZytmaGpLQSsvL1cvOEh3S0J3TUJRT2xtTldLUFFOZ0FEQlFVeElVQXNPY1VIa0lPc0M3Y2JmQi96S3dzeDBKejdqUkpmcFhvVTFoWStJNG9NNTZCSkFIWVFZUHQ2YUluTU4vSUFqZi9JZ201dWNkaS82ZjA2Ly8wZXBVQVFHQkFLQlFNaUdBQUFBQUFKLy9zeXhBY0FDV0JuWTdtTUFCRUhtT3d6c0tBR09oTXdabHVIMUxHRGlVZGs0Sk9JR0FNa1p0NFVRVThmaU9IeDlzUWFVQkZPS2RWTXNmeGFVanNYb2xjdytYUHBvVC9nWmhjaE5TQW5VeFZ1NjZ3Q2tReU4vQVNCUmR4WFcwQWRwcTBydXc5UFhNNzBQZHJTSUs0Y05aU1VoZFdkMzFrTGowMldSVTlMaVEvUlhXc1ZFNkZOVklSRkZXZWo1UjdsYlR2TUxMQUs0eklvNjR3QkpQLzdNc1FFZ0VpVXgyZXNKVW54QlJkczlQWWRQbXlScG4xY1FKWC94OGFFeU5pdEFxeThUQTZTNTJyNlA0UWo2c2Y4S28xMVZBN3NyeEdhZEJFblBKUzZrSmpnT29kcTN5L3ErNk45dktGc25hQjNHbzVYWWJ4dWtpRjFoQU1oVGFMWVdhNDVKTGpPU29EV0tlM25abVNBdSs5ZGhXMkg1UkdJeHp6VmlqZUJ3ZHBGRDhjQVVjMytoSnVaODc1YklabmRRRWtnRVNJQUN0Y2dwbGIvK3pMRUJZQUkyS05KVGIxbklSSVpLMm1GbGlJaUFqUGQ0Qk5ET3pnZU9TNFpGMDRYY1dFU0V0RTVHUmE4MjRFSkZyUHBWWTgyU2JWZWwvN3h4NlRDV3pta2cxaTQzdTc5UmZqcGZLNGgwYk5DQlVCY2pvQW1adVhyNGMweTVIcXYyMjdzVWtZdXUyLzhQMXJrQncyLzhYNk5CMk5Hd2RDenpkLzgzMDk3NG93WDdlbUx5M3pTVjRiSVQ2bk02Tll2LzMrTytoWEVBRUF3QlcyUS8vc3d4QU9BU0JocFg2eXd4ZUVLRjJwbGxnbWFBTnhmYkVrU0RBUkZLT2I1MXlkT0JFb0xpVW1lSkpkVUU1R1pVRWN1a29MMDZsU1crblczUlFPSkl0WnN3d2tjTXVlTVVKVXZpTDJmdWdNRkFDcDJGdnlZcTRlQWFoQlIxcU1RaTdHYmI2cXh2Q1JkeXhOMkp1VnBkUXJBUXBlRFo1MkU3R2tmZjdtcWhpYXRkWDJETmZZdERtMkxpWGp5UWlzMjV0WEFBQUFHQUNFdGVMY0cvL3N5eEFVQUNNQlRWUzFoSllFRERhMGsvTEVHQ2pwb2lHaEZJZWdGUGRnU2JxSVJkVWFjMUJzNzhSRmE4TU16TFBxaVpvMTlobytJUlFJUlVKUk9HRkdFTDZHTWdPb1NST0VRSktCOXpnL3B3R0FFWmJ3WWxFekJxVEhSeVZxWFpJanNqTHdPdHJycFlGS1pDWkVCMmR0V21iOUxqWGVmblp6Ynd3bjV5dzhuUW9YY0srUzl4VTlwOTg4WWZpMnI5RDFBU0FNRk51U1FBV1hKaHYvN01zUUZnQWUwWjIrbm9NNncrWlRzOVBTSk4xc1N4VnBwb0k1T00wMDcyangrd2pJWlFHdFg4eFk5Z1lvTFdDaGttNjJyWGt4TmtOYVpQY0RDdzhJTFdsL0pwKzN0V2dEQVdna25IWUFNSHVFdENoUURwSzU2VzA1eGxVQmx6QXVkRlJFeWlVQzEvLzJhVTN0R3ZzZXlvczRoblZObXRNWlZkN2NmdCtvZmExNjE5YUU3d1dhVWx5UmdEU2JRa1E0WmdVd2ZkWkRGUTducWhFei8rekxFQzRBSGxLVmpSN0Jsc1BLWWJYVERIazZ5ZW9haVZnSFovRlVFWmtiaFJpeEgvOFZsQjlzTHdGV09NWHd3WUEvMSsrUUpiS2wvVkFDMjQwNDViUUFERUZoT0hNb0VvaVJ0RjFJWUQyS25hRUYwNWRaT2gyZG5jbU9lUnNRbUdZd1MxM1doZldpZVVyVkd2c0RHNnN2S3RyK2Y1ZFZBQWdBazVBQU92Z2tjSXEzOUdWMlM5SlErQ3RBMFJId2lIaE9VU2MwQktzdkNFZkY1Ly9zd3hCS0FCM2lQVTB5azU1RG5GR3NsaGh6K3JOVUJobVpaU1dxSTNkYVd2TFZFdzN6SVJvbE9pSnNDV1YyL0FLMFVoc0tGVW1sUzkrQzhVK25QUndObUVhZmJzUms3cTdCMTVTRE9BL0txeVluN0t5dTFldXl1MCsxN1FTZkxXOGVsNnFhRndaSlNYOEFjSjBWRzFTRHpoUWlUWEhDMkNCRWkwMGFFSk92YTJvWHZwTEs2d2tYYUVlZUZNNHYyYTFxMGxIemJlVkFNMExKSy8vc3l4QnNBUjNDalV5d2s2YkRuRldvbGhoUys4ZmVWcnFsWUNLVkQ2NDhiZFNycExvUmlGbHpWUURaMGdtUnZ5VlMrcXJKY2o3R3E1SzhkUVZOamVtb3Fvbkk2aUlabjFFclZ4Z0ZTblhqZU1xb2tWWUMrNWJXMWJJQUJSam9USktGM0NkbkFOQ0VsSFJKS25KZlQxY0c4NVZZK0Z2VlQvcFdJVGJCYmozYlBPZEUwUXRqcDJPM3ZvRysyU3QrOWtTcVYxb3lXREFQUXNScW5hUC83TXNRa0FFZFlqV0dudk9QdzZaUnJkUFFlVHJlbkVzWlQxVnFWY3hNd2wxSGp2ZU9ScHZLR0kyTlByTFhtOTlXMFpKUnNwMDdVRllSWlEzS3ZqamtkRktvQURwMG9Bdk9nQWN1TEJETjQwNmp3cSs4aSt6cGtGb1htU0l3VkhTYUYzQW1HcENuZUZEOEU0ZTFUVnUrTW1qeDJKcG4xRExKT1JudTFZQWxDeEpDazhBQTNnMHNFUjRmR1J5bDBPbUlvQnNQNE9IcXcyV0FET21ILyt6TEVMUUFIVEkxRHJMQ3FvTytUNS9XbUZQRDQ0cTJVeXQrVXpZZWJEdWhlczE2REh3dnQweGczUVh4byt1djZLZ0RibEJjUUFBL0ZSOHlQSTN2MlZ1RSthSnlvU1BYUjRsbWRHMFFMbksvdGJyeTFOMnRxaW5rdS9lY3Blc3VwZ0NCYzBsVkJKNWZmZXNBTm1SdDE5V1lnbEJTRVlnTlNFNW9wRHNDWnVURE1taU9QUkplbUJCcEErTjFIbFZad1RIc05lWm01eFV2bFh4Qk4vL3N3eERXQVJ5aVBQVXc4NWREZkU2aHhCaWkrdHliVXpWK1hBT0FtVUtCYzJTQUJnOUFZeUFLdEVUb3N2aWJCb3A1ZGFtK25NdDMwZHVjU0o4ajI2OHhLd3lheUM3cjJvVk8xNFJsdCtSbzVHeisvLzBVSXlDa1U0QitUR0RId2hLSUl3eHhadENWWXVSTDFuNXp6Zk9DVFkvbEpBaEZDUjZ2aE56NGkzaDNKYTNsVzdZaXZ0eThqUi85eXY2S2FLaVNBVkFJakRVUU1PakUxLy9zeXhFQ0NCMnlGS3UyODVjRG5rS1ZwcDV5NkpjSmNGK2R5aXFtcGtaUDAxZ2toREJ4NmV6Z1hscW50V09CK05rVkVmV1VHcjUxdnpuc3Z1LzlIL2ZZckdKSnZnQ1ZBVEtPZ1lsWHNPQ25nVFN1bytldzRxSVZkcG1TSnZqWmN0YmdOZ1pFY21pOXNHN1QxLzIvcXFyb0FBQVRqTzhTaEpsbGlhd21CYmp4N0tWcVVnSU1WbVppSHJGcDJsZlhiMExzNjJEUkhZVWxsY3Exanl2LzdNc1JKZzBiNGR5SnRNYXNRdXd5amdiZUl1bldkM0t6N1paZjh1OU5Gbi9xLy9oNnp2dVZTUStKVkVWZ3djcEp5U2dncmM3aHFrVjVWYWlRNVlDNVZUMkNxYWZLaEt5a0ZpRExBWjV4VEdwK1hyeEo2NkxQLzFmLzBmK1BxQUFDZEFwcUYvQWJnQjRwTjVIVDR4SU5NOGI5VmVzTnhnNmd4TXlGVVVzOWttQ3lnQzlTNml0NXVMSG15WGFwLzZ2N0xQc20wTjd2UkV3Rk9hOEQvK3pMRVdnT0gvSFVTYmVJRDBOV09vZzJubExyWFhvQlBsWXA4T1ZrSGdpTG5PUjQxeldvRmhqSGVDZk4zL2ovaFphZE5RMkNIN2U4ZmhkUlBiUWZ0LzYvTVlWeVhQUUJDQUNUZi9BOXBBVFJXTDdqWkVPSnpiV1I5MndzVzc3OWVidDMvUi95OFRvLy9pVzA0RTlGMEZaVzI1ZUdrdmtyYlVBb25Fd1p0S0FCS1NvWWpGMStCb0ZMRkZvYkNpZEcwZkwwMUVvNkxRRzVmbWY2QS8vc3d4R01BQnh4bkNtMDhwZERjSHlIZGc0aTZUMEZiLzlERTM2Ny9iWUFBQU9RNUZIajhQSm9nd0YxYUFzZEREWENJbHk2UldrS251NlhoM2QzY0djU1lXVUdRRWZNaEhwcEhJYWZxWVQ0a05NaE52LzZxZHFnMWRVeEJUVVV6TGprNUxqVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlYvL3N5eEc2QUJranBCVWVjUjVDaWtlQjBzWWlXVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVk1RVTFGTXk0NU9TNDFWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVmYvN01zU0ZBTVFZUnYyakNTcXdmb1BUdVBla0oxVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWWC8rekRFcUlQQUFBR2tBQUFBSUFBQU5JQUFBQVJWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlgvK3pMRXU0UEFBQUdrQUFBQUlBQUFOSUFBQUFSVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVic7XHJcbmNvbnN0IHNvdW5kQnl0ZUFycmF5ID0gYmFzZTY0U291bmRUb0J5dGVBcnJheSggcGhldEF1ZGlvQ29udGV4dCwgc291bmRVUkkgKTtcclxuY29uc3QgdW5sb2NrID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggc291bmRVUkkgKTtcclxuY29uc3Qgd3JhcHBlZEF1ZGlvQnVmZmVyID0gbmV3IFdyYXBwZWRBdWRpb0J1ZmZlcigpO1xyXG5cclxuLy8gc2FmZSB3YXkgdG8gdW5sb2NrXHJcbmxldCB1bmxvY2tlZCA9IGZhbHNlO1xyXG5jb25zdCBzYWZlVW5sb2NrID0gKCkgPT4ge1xyXG4gIGlmICggIXVubG9ja2VkICkge1xyXG4gICAgdW5sb2NrKCk7XHJcbiAgICB1bmxvY2tlZCA9IHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3Qgb25EZWNvZGVTdWNjZXNzID0gZGVjb2RlZEF1ZGlvID0+IHtcclxuICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBkZWNvZGVkQXVkaW8gKTtcclxuICAgIHNhZmVVbmxvY2soKTtcclxuICB9XHJcbn07XHJcbmNvbnN0IG9uRGVjb2RlRXJyb3IgPSBkZWNvZGVFcnJvciA9PiB7XHJcbiAgY29uc29sZS53YXJuKCAnZGVjb2RlIG9mIGF1ZGlvIGRhdGEgZmFpbGVkLCB1c2luZyBzdHViYmVkIHNvdW5kLCBlcnJvcjogJyArIGRlY29kZUVycm9yICk7XHJcbiAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBwaGV0QXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlciggMSwgMSwgcGhldEF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlICkgKTtcclxuICBzYWZlVW5sb2NrKCk7XHJcbn07XHJcbmNvbnN0IGRlY29kZVByb21pc2UgPSBwaGV0QXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YSggc291bmRCeXRlQXJyYXkuYnVmZmVyLCBvbkRlY29kZVN1Y2Nlc3MsIG9uRGVjb2RlRXJyb3IgKTtcclxuaWYgKCBkZWNvZGVQcm9taXNlICkge1xyXG4gIGRlY29kZVByb21pc2VcclxuICAgIC50aGVuKCBkZWNvZGVkQXVkaW8gPT4ge1xyXG4gICAgICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgICAgIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggZGVjb2RlZEF1ZGlvICk7XHJcbiAgICAgICAgc2FmZVVubG9jaygpO1xyXG4gICAgICB9XHJcbiAgICB9IClcclxuICAgIC5jYXRjaCggZSA9PiB7XHJcbiAgICAgIGNvbnNvbGUud2FybiggJ3Byb21pc2UgcmVqZWN0aW9uIGNhdWdodCBmb3IgYXVkaW8gZGVjb2RlLCBlcnJvciA9ICcgKyBlICk7XHJcbiAgICAgIHNhZmVVbmxvY2soKTtcclxuICAgIH0gKTtcclxufVxyXG5leHBvcnQgZGVmYXVsdCB3cmFwcGVkQXVkaW9CdWZmZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLE9BQU9BLFdBQVcsTUFBTSxtQ0FBbUM7QUFDM0QsT0FBT0Msc0JBQXNCLE1BQU0sMENBQTBDO0FBQzdFLE9BQU9DLGtCQUFrQixNQUFNLHNDQUFzQztBQUNyRSxPQUFPQyxnQkFBZ0IsTUFBTSxvQ0FBb0M7QUFFakUsTUFBTUMsUUFBUSxHQUFHLDZ6SUFBNnpJO0FBQzkwSSxNQUFNQyxjQUFjLEdBQUdKLHNCQUFzQixDQUFFRSxnQkFBZ0IsRUFBRUMsUUFBUyxDQUFDO0FBQzNFLE1BQU1FLE1BQU0sR0FBR04sV0FBVyxDQUFDTyxVQUFVLENBQUVILFFBQVMsQ0FBQztBQUNqRCxNQUFNSSxrQkFBa0IsR0FBRyxJQUFJTixrQkFBa0IsQ0FBQyxDQUFDOztBQUVuRDtBQUNBLElBQUlPLFFBQVEsR0FBRyxLQUFLO0FBQ3BCLE1BQU1DLFVBQVUsR0FBR0EsQ0FBQSxLQUFNO0VBQ3ZCLElBQUssQ0FBQ0QsUUFBUSxFQUFHO0lBQ2ZILE1BQU0sQ0FBQyxDQUFDO0lBQ1JHLFFBQVEsR0FBRyxJQUFJO0VBQ2pCO0FBQ0YsQ0FBQztBQUVELE1BQU1FLGVBQWUsR0FBR0MsWUFBWSxJQUFJO0VBQ3RDLElBQUtKLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLElBQUksRUFBRztJQUMzRE4sa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVILFlBQWEsQ0FBQztJQUMxREYsVUFBVSxDQUFDLENBQUM7RUFDZDtBQUNGLENBQUM7QUFDRCxNQUFNTSxhQUFhLEdBQUdDLFdBQVcsSUFBSTtFQUNuQ0MsT0FBTyxDQUFDQyxJQUFJLENBQUUsMkRBQTJELEdBQUdGLFdBQVksQ0FBQztFQUN6RlQsa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVaLGdCQUFnQixDQUFDaUIsWUFBWSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVqQixnQkFBZ0IsQ0FBQ2tCLFVBQVcsQ0FBRSxDQUFDO0VBQ2hIWCxVQUFVLENBQUMsQ0FBQztBQUNkLENBQUM7QUFDRCxNQUFNWSxhQUFhLEdBQUduQixnQkFBZ0IsQ0FBQ29CLGVBQWUsQ0FBRWxCLGNBQWMsQ0FBQ21CLE1BQU0sRUFBRWIsZUFBZSxFQUFFSyxhQUFjLENBQUM7QUFDL0csSUFBS00sYUFBYSxFQUFHO0VBQ25CQSxhQUFhLENBQ1ZHLElBQUksQ0FBRWIsWUFBWSxJQUFJO0lBQ3JCLElBQUtKLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLElBQUksRUFBRztNQUMzRE4sa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVILFlBQWEsQ0FBQztNQUMxREYsVUFBVSxDQUFDLENBQUM7SUFDZDtFQUNGLENBQUUsQ0FBQyxDQUNGZ0IsS0FBSyxDQUFFQyxDQUFDLElBQUk7SUFDWFQsT0FBTyxDQUFDQyxJQUFJLENBQUUscURBQXFELEdBQUdRLENBQUUsQ0FBQztJQUN6RWpCLFVBQVUsQ0FBQyxDQUFDO0VBQ2QsQ0FBRSxDQUFDO0FBQ1A7QUFDQSxlQUFlRixrQkFBa0IifQ==