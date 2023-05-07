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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImJhc2U2NFNvdW5kVG9CeXRlQXJyYXkiLCJXcmFwcGVkQXVkaW9CdWZmZXIiLCJwaGV0QXVkaW9Db250ZXh0Iiwic291bmRVUkkiLCJzb3VuZEJ5dGVBcnJheSIsInVubG9jayIsImNyZWF0ZUxvY2siLCJ3cmFwcGVkQXVkaW9CdWZmZXIiLCJ1bmxvY2tlZCIsInNhZmVVbmxvY2siLCJvbkRlY29kZVN1Y2Nlc3MiLCJkZWNvZGVkQXVkaW8iLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJvbkRlY29kZUVycm9yIiwiZGVjb2RlRXJyb3IiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZUJ1ZmZlciIsInNhbXBsZVJhdGUiLCJkZWNvZGVQcm9taXNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYnVmZmVyIiwidGhlbiIsImNhdGNoIiwiZSJdLCJzb3VyY2VzIjpbInBob3RvbkVtaXRJcl9tcDMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgKi9cclxuaW1wb3J0IGFzeW5jTG9hZGVyIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9hc3luY0xvYWRlci5qcyc7XHJcbmltcG9ydCBiYXNlNjRTb3VuZFRvQnl0ZUFycmF5IGZyb20gJy4uLy4uL3RhbWJvL2pzL2Jhc2U2NFNvdW5kVG9CeXRlQXJyYXkuanMnO1xyXG5pbXBvcnQgV3JhcHBlZEF1ZGlvQnVmZmVyIGZyb20gJy4uLy4uL3RhbWJvL2pzL1dyYXBwZWRBdWRpb0J1ZmZlci5qcyc7XHJcbmltcG9ydCBwaGV0QXVkaW9Db250ZXh0IGZyb20gJy4uLy4uL3RhbWJvL2pzL3BoZXRBdWRpb0NvbnRleHQuanMnO1xyXG5cclxuY29uc3Qgc291bmRVUkkgPSAnZGF0YTphdWRpby9tcGVnO2Jhc2U2NCwvL3N3eEFBQUJweTlEblF6Z0FFcW1Hb3pIdEFBQUJJb0FSQ29jREF3TTNkM2QzTkJ1Tno1amZ6Qm9OQ0ErQXdIQkJUM1JsR2hpbm52TTIvLy82bi9uajQzY3dINDNKd1EvREFJQUZ6ak45U0ZobWdnQUhoM1Z0akFqODgrV3VQaGpPT1ZXTW1DZmplQ3NHMTFFNDJDcmtpVFJ1bW1OWTg2eXNSYXJKdnVNQWZ5Y1Z2Ly9WLzVjYTFaSnR2V01JWS81ZjJmL3JXMHEzUVJtaGtBLy9zeXhBT0FDSFM3WTd6MmdERU1JZXc5aGlqb0FDampLWkhKaERTUVRuY29FSk9oS1JVd3FFK3RLRWtJRlZ5WGZqKytvd0E5QVZ3RmttTEFjcDQ0eTZ4aHhscHE2bTlYLytyVit0eGNMVDUwK3JnRU5xZzZuZ0FpOFFyR21pTTFnUEV4WElUeGdIcU1VUEVCM2hjV1pXMlpnNXBHL2NId21DSktGeVpyY1dTbi8vLy8yL3dYQnVvaTMvLy8vVTR0VDZmS2ZHSjlBSmZwR3BQR0FQLzdNc1FFQUFoUXVXUHNQYWRCRHhkdDlQYXFXcDRjL0JVNk9HU3NoTlM4V05KdmtnTGZPaVJmaVRxbklRRkJkL0F5cFVLMWticVFCb0FUdW5yOGRoT2I3Ky8vLzIveEFxanovL3d4L2Q3ZHdMZFZtY29pWFFHVmRYZ0htU01GTG95MWVjaUhHWDZxazl6cWhBdUVGcG1pdjVmVjZRT3NIV080OHg0em9ad0dBR1Q5dlQvLzBYL0NnQlFnL2YvOWJtL05lcXFYQUtWM0NZRkhBUUQvK3pMRUJJQUloTHRqN0RJSFFRNlhiblQ0S2xJYzUwSzcwVUpWa3NmUXBGYXcvSCtjUEFlWjREVDNLMzVlU1N2OWdic0V5UnU2L1dIcGpRUGZzbk1FNnRQLzZuL21CQ2tGVVRSLy84Si95VzVHbjc4UFVSYXdQTnpGZEdOQkU2R2Z0Y3VUMVRpMVFWNDEwTlBISWZNdmg5Q0lIb2VtTExDM29qWjRjWlVOekRVQmtWMi82Zi8vVXYvak1hSU9mL3lIOHg1V3RRcjFlb29iQlFGUC8vc3d4QVNBQ0swUGE2dzg2ZEVFRnJBODlUWGVsSm0zcFZyRTU3N1hIQXFtVCtleGxHaVgxQzBOdVp6czlyL2pVRC8raGJCbWJ6Qlo0MFNmUUZCei8wYjEvK0lTSCtCb3RRdi8vLy92cC84cTBRUXU4U2p1dE15U0FoU1dQd2xmS01pdU1TQVg4bUprVXFobTBmQkVsNDZqVlJQT0FYQ2NsNHhNejcwN3NCbkFIcVRlMnhrV2V2LzgwL3l1SkhmL3QvTDEvQisyZjdoc0xmRGMvL3N5eEFTQUNKQzVkYWV4cVZFTUYyNDA5b3BhZHJBT2ZBMHd5cmhlQ3dGOEFvWVFWaUp5U0FDNW5RL1pDaCtQLzZuV1A0Q2RCZUxIVzMxaUZQZnI1MUhyLy9PRXIva2lpczFkLytiL0YvbnZnZGJaNGVveEdBVjhjN0M3NEI2amd5T3hRTkprSUcyR3Rjc1VJQnNHdE5DaUpPQjZ2WUNqQVloVEpBZW9rSEg4bHR3NUJUWi9mci8vOVArbzhYLzY4Vy9ocFlnUWxvbEpaWjF0RVAvN01zUUVnQWh3dVgvbmhiSXhDaGN0dFllMU9oZVhKUGlDNEtsQWN4bHpZdmhTeG5xZ1A0NHNFQ2lka3VRWmE5K2tDUWd1bXpKbm44NERFSncvMjVXL25mL3lIL2NnQkxFMGNoLy85LzY5aUs5WG9jWVRFQTE1K0diS1E2anFWMHZNSGxjaVlPbmNyVXVtR3BjeTAzRndqWmYvNi8vd1JHZ2kwcE9yV0NLK2U2d2k0Mi92enYvLzcvNlJ1bzkvL2IrWGlERjJxVm1IbG9ZZ0gxRC8rekxFQllBSHNMbUQ1N1JTOFA0UHJiVDJOUEwvTkRKZ0VUeXhwK1JGRTdoSE8vVEsvYzBYdUg4QkxPVDlMeklJcUJ5UExXWjdheExmMyt2ci84T0Mvd1JrRmYvMy9ydUFzdGR3NmlBWURDOFh6a3lGSUJ4b1Yya1FoQnZWZXJqWXdORlUycTgxSGVtdyt3dUNBRFVYQTVZRURIVWRCSzdLQ2lTYjM5Ui9mOGw1QXAvL3IrdThHeSsyaUZnRWdhYmpQSFprS1lsdUZPenVtWXh2Ly9zd3hBc0FSNGtQYjZlSnNIRGZsMjQwOW9wZUtVREV6MUhNck50R0wxWDNEdUt4OWpJdCt3OWgwdC9xK2ovKzMrUDJZLyszLy82Ly9uWDNBMDN1NHdpZTVIYUx0eHBIbjNyQlYrWTN5Y01CN2MzMmora09FK2czc05BQ21XT01ZYmp6K0xOSC8wVHovL0JILzBFUmYvLy9ENnEwQ3phYUhKZ0JBWmhSVTl5aUZYdEtUNVgwdk5hQXgrNnhGeHFIQWlldjBnclFqTHAwUWlvZS8vc3l4QlFBQnZ4bGI2ZTFrbkR1bEd3MWhLanFKVTB6b01ENzVEWjlQbWtmLzZ2bDN2QVJXT1FRdEFNQzltNEJmTEJlUlRhK0dBTUtqSk9aU0NLMGp3RER2ajBLK2lsdk5Cd0VJZXVnNXRvQm9rL082UDYvL1VtOVl4di85WFJodXRtTlA3NmFwRUVCZkZWZTJERElyb1l1THRyajJ4YWVTNUtPYjE4Wmk5WHFFYkJVbDVHZTIxaGR5Ti82L01mMTZ4My9nZUhEd09uLy8veWRDdi83TXNRZUFBZHN1M0dudFBMdzZSY3QvUGFxVnNJS3JRc0lvWkV3QkF2RUx2Z3F6VzZvWUp6OWFMVVhSeXdaemRjL0x0UTY5WFdZQTFDdWh0ZnFBNmYvNnA3K3ZyS2laL2g2c1dQbmYxMTNBNGQ0ZUhkbWpFQWpRV285KzFsaXl1bUZQcUZZbm8vYzdVR2t3WG9ESExTTjhXd2VrYkw5amdWaHhYL1dqN2YvbXYrVFduVy8veS9xVFRNQmJkZGpWRVFRTVphaDI0R3lqT0dpRWlILyt6TEVKd0FIYkx0NTU0bXdjTzBYYlBUMHFQWkFjYW9zcDJSV0RQdU9oWGJsQnIxQUlBRkNzWENLa0hNRG9KZmYyTCsvcCtuL0tqZFMvLy8vU3BRUEw3S0lLQUVCUFZUSjNCUWg0MHZNZGxJczJvalhyREtSbUx2WXk4MStOTU9hYk1jZmJVSHpmenVvcDdGUC8zLzFKcGIvLzMwMUNPaHdpTGE1aGtKeUFjd281Qmt3RW81ZURaMmppK0NCc3VzTGlVbWd1Y0I4cjcvQXFnck0vL3N3eEMrQUIwQzdaYWZCVVBEbkYydjFoS2pxcC9CdEcvLy8vLzMvMEc2RTUzb1BhZXkzSTBoMm5JcysyeGhpRFlHK2M0dG5Mb0tuU1BaNUYwdHZHUVB2SUI2enVGVzNWNkliUUtveHJmNmhxUStRei94YnlKYnZXSWFGT1JGVm4yYjBGRDE5Sm9GVzArRERZbEEvRHNRbXhTZ1BacEJzUjRSQk9FVC9peXJMd3NkV2RhL3o0V2tiSC8xZzZ5QzdmNm05RC82ejMrY2FhZk8wLy9zeXhEa0FCNHhsYWFlWnJMRHdGeW8xbExUbytxY0pWWXg5bGJncnQ5c3FLMG1CRmpQVjdKVUNEaG0rV0J1UjgxUkUyYnNSemx6OUpubUFOQkNYTi94SmY1cTlQVC85aTMrVWRCKzMvZi8vK1J0L2xMK1ZtQTl2bWh2MmhUbUNiMlE3aDUrVTdHRTV6NzlTeElBU0F2NHRBejMrRWtOMi8wQzRGUDZmLzVySE5TVVg5SXVKRkhWOC95QmxVdmYvV0tLOGkzZmJtcXR0Z1pzeW9mLzdNc1JBZ0FkaERXdW5zVVZ3NnBuc2NQTXBsdGt6aXY1bVNvakp2Z1Fha1pialBKRU1SYit3WkExTlF4YTZpa3YvNUdTdm9uLzBmL2MxUlEvci8xbGRGUWNWUWgxbGhnRWRnSDdsRURSRnM1U2JwQVFkTVVZZ0djVGloZjd6dHR6WDBnN2hTbjJVZXYxalNmLy8vK2xyeTMvT3VvMSt5OVRlY1hGMWZWa0tkQWt1bmF4YVNJQ25TSU9zUzhIemt5aWNVb0U0ZFJNeDIrZXcrZC8vK3pMRVNZQUhLTHR0cDZWSE1QRWJLN1dFdE9wK3M4RllCajFtUkJSV2M0NUJmLy85Lyt1dC85RkNNcjRqei8vWnRyVUFqZTJnWWtSSUNseUJzRWRCRVNZekJNRzVGUzFreXhRR09ldDBCdkY3elQweGZpWk05bGVvVjRyZmZ6Z3NiOHUzS1VRcFMyVGgyRHlmMllkQmhiMWJPeWxlUXFOVk1BamRrZ29rYllIT1J4MGF3NTlPamF3SWtRUUhmWnBHY0V1Vm5rMXVlNkgvWU1BSS8vc3d4RktBQjFDN1lhZ3hwM0VYbDJzMUpCK0dRU0thWnhCWnJ4amxQNmZuQitUNlQ2bExadVZrcit2bkJoVFB1LzNKOUV3SHUvOU1Wc2pBMTA4bmVlcHFjcm1LcWtRbmVZMnlOZzlZc2dQNm0rNFN3VW5mOFFnZi9YN3Z6aXpWcWZkbVVXSFR2NUVGT1g5bjNKN1pNbDdHNzA3SkpYU0s5cmFZWkcwQjlQMVRzY29QYlRPdTVHcERieFZqVXBUb3Zwbk5WZnNKZ0djOCsvcUQvL3N5eEZXQUNHUzVVNndscDVFRm15ejA4eW1XOGJmUDlCWTNsdXFPK3FDVFQvVUZINkZ1NW51eU1uUlUrL1Z1VWZRZ01CcVd5R0Jva2dmKzVabXlnakpzQnR0SWFSM0FTOG9Ia1J4OTdwVzlabjV1RCtFNk1Va1NXVE1uNUQvbytkYnFicVVwNnFyLytVVzZuZnQxZHIvMDFxOHd3ZlVVQ3k2Mm1GdHRBZjJOekpBQTNlWmFuY0QrRGN4RXNhaWRxVDV4dlFFc0JjTjlhdmp4Ti8vN01zUlhBQWg1QzErbnRPOXhEeUFxTlpTMDd2L1cvb3Q3L1VmOVZYT0R6UjdtMkhxN0JpaWtVZkxidGJSUWRidHFhSkl5QTNyMlJvRmh3aTBjeUljdFpvL25xYTluVnlTdVg4NEE4QkVmS2VmWitJei8rcG45YUsybEhkZWoycUhYOGxkZFRVU2huMXFVRGJiN090Mk5BVjIydnNqMlIvVnIxRW5XSmxaR3BtSFRFcnExZDBiNUgzclBBMklEZ2pYUVg3Q1VoNGYvMzlqZHExUC8rekRFVndBSDJNVmJwNkdxc08rWXE3UUhxRGFqNnl0LzZ4c24rcjUrK005M1hraFFOZHY2c3JOQXRXTElNOFlGWlNLemJXV25jS21IZTFXbXMrZDU0RVFCQTh3aEV3ejFFQzM2ZEc4ODdyYlBSV245R2ZJbkw1dVU2U1ZWRUE3LzNwWnNxQUdGdXF0SW42bjNVaHl2SFRhaVBWNVJxZG5VejlIemdMRVhuNytaQnNGTnZYYk1rbTlmYTIyZXMyWUdENlFuelZzM2YvMUNFV2IvK3pMRVhRQklPTkZkcDY0TE1PZVhhN1RXS082N1ZZU0ZBRFl2c0g1ZzZjQUFLTGdxR0tQVkpVVGxFRFR0NXpWUytDekYwbUpMUG1KU0xPUHpmNnJsZTgzYmRJMlBLbkR5akg2TkRvVG9DQWtrbHB0Z0JxT29CRFlJdVdGQlVLNENUU2F5dG9qdEhiSDNRT3pGZHgzNGNJYXpWekpTcTEwUkx4dHQxL1E5Rm1RbzBjM05USy95K25QMGdBU09YWWQyUmdEVy8zSkNHaWpwTXlTTS8vc3l4R01BQjJ5N1JhQmxvU0R5bENwMUJMVHVSYUVFSHpJbEtOcWhHa3JLSG42SUYwQ2tGOWljZk0xODNDVk5XYlhGZXdGZnI2RTY3K3YxSHY0enlpb1FHM1hmT3kyQUFmNHp5ekRjekpLN1RoZVkxZnZzdDk1ZjRzc250YXZNZ3RkRUdtMVcxVkFJY0VhZmRQVk5YZGJqNk5kbGEvcTJxaDN5SWhGdXUzbVZrUUEzYUhVSVNQZGJ3OUZhKzFyWG5wYlBwcC9tc3J4Sy8vTDBKUC83TXNSckFBZUVvVW1KTWFldzlCaW5kYWFWZUVKYkU3YlRFOXVEOE8rais2NXBuc2w1bFV2NTNsbTdrL3ZvRVkwdDEweXNZSUg4TjdHRWNCNDZJZW40U1l2YkRaV1NWM1Exc1NUYXpZQmhEM2pWeUFwVm84WTAxK290NC8wUG9uWTFWci93TmliLzl0U1FFVGNjTlVrQm8zKzhNeUF3YkJuSFRmdkNKRnFsUFVXTGJzOXNvL0NiQUtCOWs1ODgra0V3SUh6a2JrZjM1MGY3Zk9uLyt6REVjZ0FIVE1WWHA4ank4TzZZNnZUWG5UN0tONVJQLy9aL1ZRUUc0MjRJV2lBQi8vY3pKSUJJbkJ5NXVHSGVhRlNZYVpkcmZ1dkxoSitrQ1ZFT1pGMDBST3pTdGdzeFFmeXMyRWZ6SGZVYnAxLzZBT2dRSzdiYlBLMkFBYXlxS2dIbWxOakVSeGRTNkR6S3U3dnRjdXRwRTdyUkJvQW5qeVJ3MktrVzFpRk5mL1UzcWZsVjJ6eGlpeXVyMUY4OVFtd0pHNUtxMmtBeHZkTC8rekxFZW9BSFhMbFRwOEN0c09zWTZIV1dpWHJFdUVKaDg5cDFiRCtzakYxVW9OdCtMbFBTQW56NFVZS2hkSXpKZE5PeGVBa0xmYnpYekovOWYrdjFreDkzLy9yK1dLQWJiY2lpYVFFRzljdGNYMFZ5MzdFeG0yVStsd2JtZFZkNlhVZUFmZ2xUakpwb0pQb0JWaElmYjFtM292NnV2ZmIvTk1RZi8vWjkxUkNxckVEYVNvL3VyY29HUW9tbW40eFNTVnVJaldwWmU5dUY5TVZRLy9zeXhJT0FCMEM1UWF5MFRiRHFseXEwMWpVZVp6Vm5KWXlyNHFvL1Y1MHo2alI2OW40ai8vUi9SOGl3Zi80amFBQUd2MU56QkMwWE5tN2tvcnVDSFoyU3AwK25vaE1BRWNTcGtZbVptWTdHd0FLUVpqenRPL1g4bGxWYlAwNlAvdTFLSkFTYmNoeHFJQUg3MU13VVMrb1NxdTRrTkRVN3ZTWmQ5ZXBaYzZqWUZiQmxObExUTktXb1NaTDdka1Y5WmQrLzEvL25uQUJSSlFNZ2dQLzdNc1NOQUFkNHUwV3NIYXN3NHBjb2RaRzFYalZnRnVRZzVnTkE2dE5xUFFzVXZubGZVM0w3Ymx3RHdKVlNsbjlIV0RqTyt0OFdkLzNVNzZQK3IxMW9CdE9OcHBnRXdGWU1rM1N0bDYzZE9FUnRxNnZYODA2eklDL1dsZS9yQ1lsditMLy9zOWYvdjZmckNGSjlSUkJvQTFvUi9pN0llMWlrdnoxTmR0L1YrWG02QUVncmEyVlZxRmFGWnR1cXNOZi9SMi8vK1FWSUJOcUNHTnIvK3pERWxvQUdoSWs1VFFtckVOa1JKK21EdFdZa1FVcEJ3TjJtOHpNUi9iU3QvMjlZaXg0V1dhcmZxQlNpQmJaWHJQYVBYL2J1ci8vLzBjS3MrN0FNTlhXRWdOVXFOeE9ROWZ2bjh3Q3hNVldXY2ZyQ1luL1hsdTcvNTJXLzFkdEgxRWdFaW02MGtRREJVdXNCV0JOdlNHOTduemwvWWZ3QitTLzZaY0ZOM3QrNy9SOTMvYlhzNzVJQkJBQkJPRm1lbE4rQlFTaWg4ZGt3THBMLyt6TEVwSUFHZUxzMXJKbW1vTU9NWldnOU5GQlU5YlpiK1dxMjlPeDFLaXlhbXJManNrWmpyQTBISmRGSmJyMU9XQVNnUVl4YlROdE9meEVXZWxCeVNxWFR0Zk1HbTZCK3RCQm42bWE5REhUYUpQMVo4d2c2WnpFUFVmV0lnbU1OSk5FSXdOdlBnTHpyTXlRLzh3ZS9ZTGZqM3E2a1FiZkt2WlgxL010UC85SEpYZW4xdXBYWFNCWHRWS1F6M1JCcklMa3RyclIxTXRyOUJQMmYvL3N5eExZQUJXQm5QNkRob3JDdURLV29QVUJZbDRBRFY5dnBoWjBXOXZXM1p2T3IzK0N2cjBHYnFJOXk5emZwUi85QnQ4bWlVVWdVbTNHbTIwbEJXcDRIOEJ4SnBWb25ucnJQMTZTL3BQckpvQTlDKzNxNVVBcUFobWYyNElFMnFFNnRhU2pyLzNBMzllb3pObHA5Sy84WUdQRUNaS2tUYUNGK1VpU1JBdEJTNFJ5TElUVXFnM2RSc3QzWk5CRGRSenpJU0c4NDZsTHVZQUdoT1AvN01zVE9nQVY4ZnorbFBhU3duQXhtNVFDMDlwdFVjdjBDOVFaZmJTejlxczNVRWJ3eHVCRlk5SEZ1UmVzOWFkQ2VjWDlDQUFBQUtoUVRVbkZxN25KWW1JSTA0SUNrTjI3bkVDMDdIa0pVN094c3BSaWdiclowRVFFUVNEc2tYalhwR0lUc242L0ZyNGVmVWNqWWtjZnFnM3FrVlIxUW9LZngzVVVJK28wcG5TUVdZU0h3WlZOZUJyWWRGbDVsVkpSSnBCSzJXcU50TndXclRBSC8rekRFNlFBRkFHVTFwb1duc1dXa1loM0psZWpJUWpQcVpsUFFhcnBOWHQ2WU90ZXBsKzRtQWtXLzg5OE9qWFBYLzMvMlkrZC9MeWdpRDhHOGk3SHg5VWdFSkZHaW0wVEE5Smt6VUdVUE90U2wrbS9wcmQ5WnUrc25BREkvL3JMQWFJU1gvcXo2c1Ixb0hPOEZNVDlINFIzL29DL1p1MDF1OUxJQUNia0tVVTFvR1lXMEJmcDVQVW50VWMwSFJQbkcxbm4xRzRvTTA3ZGRFTDcvK3pMRTY0QUZYSWMxcG9ZSHNOdWdaYVVnaTRibm42VTZoZ0FZM1RQNVFXYTU4blRvSkoxSDZEL1JuOXFaZnlqOVcvVGlsVXhCa0ZxOHRKa3FEZGJHNVFrRlFlYlNVZGVrcGl2b05QSW1mV2RkMFVqVHp3blFuVlpkV21lYVV3TVVRNTZIMDZtK0tTaUlvVkVWcW9paXVyYlprNFhrZkdqcFlrYnpEaTcxTloyWmxFb1ZqZHoyUVNSbFRvZ0t0bFJ0SjZFWWdVaEpHbWcyMUJETC8vc3l4UDZBQ0NVRE1hYUl1dkVTSWVTcE9BbCtJYXh5NFhmdHJiMDkvUUtkZitnTUNuLzZzRGQ5RDRyZ0N0Zjdxc0hPK2VWb0ZwYVdJcVJ0d1ZibTYxVWhvRy90VXVXTk9meU9OMENzbXJMc3V0c2ErWmhVbi8rZ0dwSVA5RC9sUlAxeURjaWJIcTRyTWlrbHAzL2MvNGNqNzhZTEM4NUFOcmlka1NhS2FCYlIyR1VGaGJHakdDR3NhR1E5SDF3OUdUREUwUUFRWW1nd2tTWU41Ly83TU1UL2dBdVpJeEd0eUt2QTJxQm10TkNMbHJ5bEloV0Q2K1JYdGJvVCtZcG5EVHJWZnpmem9EU0hZdk5xVGF3Y2EvdjlQRHJYbFlVNmlJcjlQZ1lmMFluRXh5dWw1ZWlKWkRrSy9GeFc2Q2lGN3NUY2FWVm9BaHgxQWlNcFFLaDR2c1R5dmtJcXAwVnVyTy90NkFDMy9pZy83ZENDUFIvUkc3U3QvNmY5MmJ2YjArWTZlSXBMYUF6VkFBTEFBVFRlSGJkU25pb1ZPVHZ3aHYvN01zVDVBRWNrenltcHdFdnhCS1JrdFRHTFJyOHNxWndDYVo1a3pmclpTdk5uNTBScC8rb0hvcGZ1MWhBV1ZLRkVIbVlkOFNYNm8yaWp1Tm41UVFlbFc3M08vRldMZDJIRDJ5dDBPUlh4Wmt4QlRVVXpMams1TGpWVlZWVm9CRkIyQkRhNjhXcmcwZzVscWFpMzM5ZkQ4My83L09zbXRzSFdabDkzYTIveDlhS1UrNzZnNy9YV0RFOWR6akpJNEhldUdFa0phWGtwNUpOb0ovRC8rekxFL29BTGtTTWRUTXpyOEtRTXBmUVhxRTZRemNvaVR4Ri8vZHZLL1Q5WHAveHhlckp3NldVU0RDM0RuV090cTBJakZRQURiQURhYjR5cTFxV1JtQVZvSFBGdXorTTFFQ3JkalJNOHBubkUyVFFNRURUcUo0RWsxMS9wQi9CNmJ4RVhsbEZtVldEQjVKZytjYXR4eWhYMFh3RmY1WkJnYVBIWEJxdFpIRmloOURtY0JSVlpnNEl0aDhxL0x4WWE4UUNNc3ZDRjE5NHRhSUtCLy9zeXhQK0FDOVVsSTZ4RkMvRXVwS0wxcHBWK1ZaNUIzdjczUkF2MGYvMC8rcHVsK1VidC8vVi9zMW1aMlJnYi8wQnJYcytpdFVRQUc3VUdISEpoOVhkU0pzNUNVTVVla0dBMW9vOWhPekFpdlV2NkNjaS9OK0kvOXZONkZ4dGVYS3BsWmh1OWZTUTlqeVZGVXN1dmZheXVoUWVaYXdnTjByNWRLbXFTZUlCSmE5REM2NjhWa3pqSlVBY2NPNUJqOXhhQ2I2Z1l1K1g1QkRRVFp2LzdNTVR1QUFaOUF5T2c0S0p4TUtTaEtiYVZlazdQOWk5Ui9uN0ZqdXBCLzM4WU1IOUJCdFdGa3l4YlEwMW4vd2svanZsVmlBYVcyWWd0bTNHWDJaSlFTUlliSDFoSmY1V3VtUWR3VWpXK1MrTnhqditQZm1GOTBFWnVOUy9xUjB5Zi9vTm42RlVNU0paQVU1Uk01OHF4UjVRZkhqdFkrMlFCcGU1NXBaMk9MRkdSQVJTYmdabGttR056R3RTaVBBV25ucUt0UzlEV0xjYkRZdi83TXNUckFBVkV1eVdtaEUzUTBKbms5TkNVN3ROeUJkSTFDWHpBREFuYWZ0NGpESHhzVFhKSnJhZ01hZVNDQnk0aEVrREJ4ZFJteHg0TlE2dXZCZHlxbHkxNndieU12S1VaODNEOFVNSC9pUVkwNkFNOHNBYmt2d290Y2dGNTBMQTIycjcrbGpWVHgvWU9uOC8vL241Ri8vK2Y2NXYxc3Q2NUJWWTZzTVNhVEtnSDlCaHhOQVk3NW5LQkdDRFIwWFJIQ2h0NXdieTdXOGMrUklyLyt6TEUvNEFMalNiOVRjQ3IwTFNkNDdUUWlPcHMvd0lGL3ZhcUVPcFV2aDBJRkFNbmZnM1VmcE9SRU9XdHBLQmR0WmlKYXF3R2JkYUlKWEdCYS9sdzNpKzRST2lPbWRBNkgra0g4Yjl4MmxQaVgvMUR2cU5tSzRHRmRGRUVMLzdDM1I2bzdDNkhuT1VPb1Z5SzNJWDRSTnhBVkhZMmtMSnFJdkV0a2RDZ3hEelY1UUF3RmR5S3hkZEkwWm1WR2xhdFRxV2NYWk1wSTFKa09BMEIvL3N5eFA2QUNQRWxBNjBNNTFENEllSDA4WlRxRWsxTE1EVlBhUm9Odmh2SnRTUmN0ODlKRXQvWXhmL0ExbFZ1MDZmKzl0M1B5Z0hyL0dDcHgrVjkrY2prK2txOUdLWmJtUDI1YnQ4Qmh6WnVFUkpGRmRWTVFVMUZNeTQ1T1M0MVZWVlZWVlZWVlZWVlZWVlZWZFFMYmdNS2RiSUE3T1dGdEgwdHQrWDVoWDNhTWxtLy9wZGJ0K3E2L3pJb0V0dEZETWtiQWJSU0tReDVIclM0anYvN01NVC9nQW1wSlFlbm1PZFJhcUdldFpPaGV1cUdwLzMvR290Zi9oWi8vVnZSK24zZC9SZmlTM3lVNHphMUpYSlNwNldWVkEybGxEdW9qWUZaeWpOUFVURFNQdkc0bzdTclk1WHA1di9JUUpoU2E5TmpZOUFwQWNMaGtaMzAvMlg0ZXJaVTMraFdZOUYzZTIydzExbGtBM1dqN2RCbWsvcVFWYlFPWFR4Ukw2RmI1ZElGTFdZRjg5V2NFRmdFR3lSZXMxYlJNQi9BTVNnV0d2LzdNc1R2QUFWazl4R2poSFB3N0pGZGFhR2M2azhYVW5mNnllOUZmYjcyMnFOazFkTXE5WTVwVnZSVW45cmVaUFRQYThzVXJHSk1uc3JRbDJ0a2dsbGpiQUFjcG9CQWVETEFNS0hIV2EwcGlSLzFOLzliVkhSV29ENGwyL3NiQzVDRG5MZmgyci9pWDROR0FvQ1FGMmkvb0ZBUmpRL21BSGdkcm5CcGNFaHd3R0FJSXdLZ1lsZFE4bE03VFRWdU0yZVZxYlBuOHl5aU1RZHREQTcvK3pMRS80QUlNUkQ3cDR5bmNacWptSVhLR1hvZWprWFVVYWxPNTRWNkx2SURXWWJPUjFsTzNKS2V4aXJTc1pXdUVRS3hVVU9tbXpPWlg1Y3ltRHpsYVorWTNTcUN6NmgwVk0rYjRkSEdLa1R1SFV4QlRVVXpMams1TGpXcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcWQ0aUlkZ0FNQUFBQS8vc3l4T09BQTl4TS82S0FUbkRCbDEwMEJod21IOWNaZEpaNHlVczFEQTlMb3pFRXhSZ3dRSW9OZzREUVcrZis2UHFBcURaTVFVMUZNeTQ1T1M0MXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxdi83TU1UL2dBYWNaczJnNFVFaFlDSWFOWkhSbHFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXYvN01zVDhnQVhzWk1PZzVnRXh3cUNOVmN5VmVLcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxci8rekxFMEFQRklFaDk3UUdPc0FBQU5JQUFBQVNxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxJztcclxuY29uc3Qgc291bmRCeXRlQXJyYXkgPSBiYXNlNjRTb3VuZFRvQnl0ZUFycmF5KCBwaGV0QXVkaW9Db250ZXh0LCBzb3VuZFVSSSApO1xyXG5jb25zdCB1bmxvY2sgPSBhc3luY0xvYWRlci5jcmVhdGVMb2NrKCBzb3VuZFVSSSApO1xyXG5jb25zdCB3cmFwcGVkQXVkaW9CdWZmZXIgPSBuZXcgV3JhcHBlZEF1ZGlvQnVmZmVyKCk7XHJcblxyXG4vLyBzYWZlIHdheSB0byB1bmxvY2tcclxubGV0IHVubG9ja2VkID0gZmFsc2U7XHJcbmNvbnN0IHNhZmVVbmxvY2sgPSAoKSA9PiB7XHJcbiAgaWYgKCAhdW5sb2NrZWQgKSB7XHJcbiAgICB1bmxvY2soKTtcclxuICAgIHVubG9ja2VkID0gdHJ1ZTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBvbkRlY29kZVN1Y2Nlc3MgPSBkZWNvZGVkQXVkaW8gPT4ge1xyXG4gIGlmICggd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkudmFsdWUgPT09IG51bGwgKSB7XHJcbiAgICB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS5zZXQoIGRlY29kZWRBdWRpbyApO1xyXG4gICAgc2FmZVVubG9jaygpO1xyXG4gIH1cclxufTtcclxuY29uc3Qgb25EZWNvZGVFcnJvciA9IGRlY29kZUVycm9yID0+IHtcclxuICBjb25zb2xlLndhcm4oICdkZWNvZGUgb2YgYXVkaW8gZGF0YSBmYWlsZWQsIHVzaW5nIHN0dWJiZWQgc291bmQsIGVycm9yOiAnICsgZGVjb2RlRXJyb3IgKTtcclxuICB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS5zZXQoIHBoZXRBdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyKCAxLCAxLCBwaGV0QXVkaW9Db250ZXh0LnNhbXBsZVJhdGUgKSApO1xyXG4gIHNhZmVVbmxvY2soKTtcclxufTtcclxuY29uc3QgZGVjb2RlUHJvbWlzZSA9IHBoZXRBdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhKCBzb3VuZEJ5dGVBcnJheS5idWZmZXIsIG9uRGVjb2RlU3VjY2Vzcywgb25EZWNvZGVFcnJvciApO1xyXG5pZiAoIGRlY29kZVByb21pc2UgKSB7XHJcbiAgZGVjb2RlUHJvbWlzZVxyXG4gICAgLnRoZW4oIGRlY29kZWRBdWRpbyA9PiB7XHJcbiAgICAgIGlmICggd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkudmFsdWUgPT09IG51bGwgKSB7XHJcbiAgICAgICAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBkZWNvZGVkQXVkaW8gKTtcclxuICAgICAgICBzYWZlVW5sb2NrKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKVxyXG4gICAgLmNhdGNoKCBlID0+IHtcclxuICAgICAgY29uc29sZS53YXJuKCAncHJvbWlzZSByZWplY3Rpb24gY2F1Z2h0IGZvciBhdWRpbyBkZWNvZGUsIGVycm9yID0gJyArIGUgKTtcclxuICAgICAgc2FmZVVubG9jaygpO1xyXG4gICAgfSApO1xyXG59XHJcbmV4cG9ydCBkZWZhdWx0IHdyYXBwZWRBdWRpb0J1ZmZlcjsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0EsT0FBT0EsV0FBVyxNQUFNLG1DQUFtQztBQUMzRCxPQUFPQyxzQkFBc0IsTUFBTSwwQ0FBMEM7QUFDN0UsT0FBT0Msa0JBQWtCLE1BQU0sc0NBQXNDO0FBQ3JFLE9BQU9DLGdCQUFnQixNQUFNLG9DQUFvQztBQUVqRSxNQUFNQyxRQUFRLEdBQUcseWhVQUF5aFU7QUFDMWlVLE1BQU1DLGNBQWMsR0FBR0osc0JBQXNCLENBQUVFLGdCQUFnQixFQUFFQyxRQUFTLENBQUM7QUFDM0UsTUFBTUUsTUFBTSxHQUFHTixXQUFXLENBQUNPLFVBQVUsQ0FBRUgsUUFBUyxDQUFDO0FBQ2pELE1BQU1JLGtCQUFrQixHQUFHLElBQUlOLGtCQUFrQixDQUFDLENBQUM7O0FBRW5EO0FBQ0EsSUFBSU8sUUFBUSxHQUFHLEtBQUs7QUFDcEIsTUFBTUMsVUFBVSxHQUFHQSxDQUFBLEtBQU07RUFDdkIsSUFBSyxDQUFDRCxRQUFRLEVBQUc7SUFDZkgsTUFBTSxDQUFDLENBQUM7SUFDUkcsUUFBUSxHQUFHLElBQUk7RUFDakI7QUFDRixDQUFDO0FBRUQsTUFBTUUsZUFBZSxHQUFHQyxZQUFZLElBQUk7RUFDdEMsSUFBS0osa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDQyxLQUFLLEtBQUssSUFBSSxFQUFHO0lBQzNETixrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNFLEdBQUcsQ0FBRUgsWUFBYSxDQUFDO0lBQzFERixVQUFVLENBQUMsQ0FBQztFQUNkO0FBQ0YsQ0FBQztBQUNELE1BQU1NLGFBQWEsR0FBR0MsV0FBVyxJQUFJO0VBQ25DQyxPQUFPLENBQUNDLElBQUksQ0FBRSwyREFBMkQsR0FBR0YsV0FBWSxDQUFDO0VBQ3pGVCxrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNFLEdBQUcsQ0FBRVosZ0JBQWdCLENBQUNpQixZQUFZLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRWpCLGdCQUFnQixDQUFDa0IsVUFBVyxDQUFFLENBQUM7RUFDaEhYLFVBQVUsQ0FBQyxDQUFDO0FBQ2QsQ0FBQztBQUNELE1BQU1ZLGFBQWEsR0FBR25CLGdCQUFnQixDQUFDb0IsZUFBZSxDQUFFbEIsY0FBYyxDQUFDbUIsTUFBTSxFQUFFYixlQUFlLEVBQUVLLGFBQWMsQ0FBQztBQUMvRyxJQUFLTSxhQUFhLEVBQUc7RUFDbkJBLGFBQWEsQ0FDVkcsSUFBSSxDQUFFYixZQUFZLElBQUk7SUFDckIsSUFBS0osa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDQyxLQUFLLEtBQUssSUFBSSxFQUFHO01BQzNETixrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNFLEdBQUcsQ0FBRUgsWUFBYSxDQUFDO01BQzFERixVQUFVLENBQUMsQ0FBQztJQUNkO0VBQ0YsQ0FBRSxDQUFDLENBQ0ZnQixLQUFLLENBQUVDLENBQUMsSUFBSTtJQUNYVCxPQUFPLENBQUNDLElBQUksQ0FBRSxxREFBcUQsR0FBR1EsQ0FBRSxDQUFDO0lBQ3pFakIsVUFBVSxDQUFDLENBQUM7RUFDZCxDQUFFLENBQUM7QUFDUDtBQUNBLGVBQWVGLGtCQUFrQiJ9