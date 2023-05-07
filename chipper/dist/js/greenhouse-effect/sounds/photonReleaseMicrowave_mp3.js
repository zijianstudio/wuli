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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImJhc2U2NFNvdW5kVG9CeXRlQXJyYXkiLCJXcmFwcGVkQXVkaW9CdWZmZXIiLCJwaGV0QXVkaW9Db250ZXh0Iiwic291bmRVUkkiLCJzb3VuZEJ5dGVBcnJheSIsInVubG9jayIsImNyZWF0ZUxvY2siLCJ3cmFwcGVkQXVkaW9CdWZmZXIiLCJ1bmxvY2tlZCIsInNhZmVVbmxvY2siLCJvbkRlY29kZVN1Y2Nlc3MiLCJkZWNvZGVkQXVkaW8iLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJvbkRlY29kZUVycm9yIiwiZGVjb2RlRXJyb3IiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZUJ1ZmZlciIsInNhbXBsZVJhdGUiLCJkZWNvZGVQcm9taXNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYnVmZmVyIiwidGhlbiIsImNhdGNoIiwiZSJdLCJzb3VyY2VzIjpbInBob3RvblJlbGVhc2VNaWNyb3dhdmVfbXAzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlICovXHJcbmltcG9ydCBhc3luY0xvYWRlciBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXN5bmNMb2FkZXIuanMnO1xyXG5pbXBvcnQgYmFzZTY0U291bmRUb0J5dGVBcnJheSBmcm9tICcuLi8uLi90YW1iby9qcy9iYXNlNjRTb3VuZFRvQnl0ZUFycmF5LmpzJztcclxuaW1wb3J0IFdyYXBwZWRBdWRpb0J1ZmZlciBmcm9tICcuLi8uLi90YW1iby9qcy9XcmFwcGVkQXVkaW9CdWZmZXIuanMnO1xyXG5pbXBvcnQgcGhldEF1ZGlvQ29udGV4dCBmcm9tICcuLi8uLi90YW1iby9qcy9waGV0QXVkaW9Db250ZXh0LmpzJztcclxuXHJcbmNvbnN0IHNvdW5kVVJJID0gJ2RhdGE6YXVkaW8vbXBlZztiYXNlNjQsLy9zd3hBQUFBQUFCcEJRQUFDRG9rcWpETXRBQS8yZEZ0REN1TjNuL2J4cGlrU2dIL2ljK25paGZtWmZCSVFXZmt1a1BJSmNZM3RRWWxTV0hZTm4wR3NzbUVxWHlWVC9mNWhDQXAvR0Z4cW9BRWlWWmFBbUxHRnF1NllOQlZSZ1F5WHFubjlYL3A5cjE1enJzdFhYQndPc1BkS0lVUDNlS2hGWVB5QjVJRU15TUpxODMwTG05ZG83RE9LaEU0TlV4cUdLeFpzeVd0QzB2aWFVcS8vc3l4Q1lBRGRVWldUMkZnRGx0SW15MWxoM09WL3RUaXYybHk1eVVUVW9oVzB5Wkp6SmJsL1cwMVY2b2lBSHgrMWZlSUM1UzFkdEFGS05FRkpKR0FqVmJza25BNlg4MGpzOGtyYk0vREJOc2Iya28zMGRlMFFLRFVlckx5MHR5aDFoUVhsVDBlTjVoaFE0aVhxVEhtUnVMVk96NTh2Rk5NaDZDY0M3bVo1emNvN0N4U2Raa3cxZEpsbXY4Y2FobktFL1ZjU2JiaFUzWEFLeHJIUC83TXNRRkFBaXBFWGVIcFVkeEZDRHR0UFBCNkVPQVRSdEdHZ1JHRVRTL0lOT2ZmYVBMVUVuNzlIc2VmL2xPUHNxS2RHNzlCVUxQYW4va0FJRGRmekJCRGV5TnlqYWo5Ni80ekhHeCtTWlJHd0xiRUNHSnRYd05TQ2VCS3lGeWlEbzh6VWFxMmFpZWNJVVdQbVRSTUV1OXZmWVM2dmRkT2JxVkwyL3NCRkZRZEI2YmZWckY0SHVzLyt1cnEvN2YvT3R6cmxPNlZZd043cUNsTTN6Lyt6TEVBNEFJSExGdnA1MnZRUmFpYmZUMkhPZ0FIWTFKMGRnc0hPa2l4ODFOMVcxUDkwL1RyblFxaUNZTis2Nm5ZOFAxNlBDaE5VTzR5WjltdmVoV0VDYS9iL21ReS95emptVDZPdmJSQ0JZdFZRRms2K0JVMmRuYUVyc0RJTVlGUitFbHZ5NzZVVXNVcVd0M3hkNk5MRzh0ajV6TDF5aGkxMEpsUnhXbVRGZkNILy95b0Z2TWI5akx0Ly8velJlLzVRYitoZUQ2NlFMa3JBSzIvL3N3eEFRQUNJMFJlVWVoU3RFTEgrN284Nm02V3gxRmJZalRndTAyK1dzSExtUk1tRVBSYWRxOUYxT2IrZzVwODh2bjk2Q0RCUlRSditIb0tQSmkzMUtFNnFWMnkyaTJQTC94SUJZYlJzb0tuQjB6Z0tPVlFHcnBvS1VmMHgvR29yemphbVRwNTFRWXhLb3E1T1ZQNzhiUC9FQTF4VDFId1NKYlBYaThJS2Q5TzkyQTQxa2tQYkloc2x2bC8xL3pnYmZNZENxUkFFTUFJelFWLy9zeXhBT0FDQ2ovY2VnOVFRRVJuKy8wOXBaeW53NEI2THE2UEJTNUZuR3JHYzA0L2lYbENWM0ZYSVVlMVZmNkMwTy95SUxieW5NTkNrTmYvSXdTKzM2WXlBelMweC9tTC9wLy81QjdlblFpdHFTRVMyNThETmN6N0NNRWk1czFTUzZmc1dXVjM1SSs0eDdmTldYYy9YNzkzK2pLeHhhWE0xQ1hvZC9qU0ZpcnEvcjR3eCtyYjVGQTJPemFmbzM5UURkL1Rld2FrVzJpbTRpd0wvLzdNc1FFZ0FpMUUzMm5uYXZ4RGFBdXRQVVdhZ0hDd0VIU09ST1VHU2hZanNxQXB4a3RGZFNvYmVXcWoxQ1RrMHQwcUxkbTFTY24zMnhuRHh2dnI1M2kxZW10RTkxNnoydi8vL29GeHVyay8wMWtSSXh0RnR1b0JsUGd5UXhBaEU3S1I1a0hnOVBQclRSMnRtU3JwS1R5cGxPYmltd3VQb0w4OG5MZlB4L2lzV29mS3BwK1Foci8vMEdmL1JnUG0rLy8vaGZyOFJ6U3NvQ2tqUUQvK3pMRUJBQUljUU4vcDZ6ck1ROGlielQwblY3OG1TMkxxUHVoUUlKUWtJVXFneUw2cENGeXdaVktJYThEaW5rVG5hdTM5VHNUOHBHeTZWdmdRQmFpZjIxZWc2MWYwb3BUYjZmLzlnT0wrUnpRclpkaEtqYlFDUE45bUlNTEErS3F4ZDFhekl1UWtGL1E2MVozcDJyU2kvS2NqbFNYL0dNeDhmakgvZ29QVWZNL05mRXByVU0vWWEwUDA3YmEvN2c1OGh4MTFja0lrazZ0M0lGSS8vc3d4QVFBQ0ZFQmRZZWhTekVQSUMydzlhbXVpblJ3anp3WVNVTGVmN0Fyc0IwWVlKN0k1azNwRUpqbDhxTm4vb2JrVDFPanBQbWQ4TUJ5ajc2Y3ZpNEtHalNKZEYwTW8vMS8vNmhmZVdxSVNRU25NMGd3a1lmak9OV0NjNUVzYTJxRXJWRnphaG0xeWVoTC9abnVOVWtjR29tWGxmMzh2bTkxWk4rK0dSTDYvcTI0TlQrYjMzR3UrMlorMzdTZ3E1Q0lsZkVkYTlhNDdMSUEvL3N5eEFRQUNJVVJmNmVWcjdFTG4rNDA5S2ttZzJkcEx3elpQbUxERXNjVFR6OWovclFGUU9SNFJOdEtuUGhJR2UrVFI4ZjVCbzdMSHJ3K2YvMHNyS05lbzlyZmRxRDdaMy85SE9EaTZ1a2Exb050MXhJeHRrQXBpcFRndVowd3pCYzNBK3hQRGpHcGpKTkZ5ZGxiTWVPem55bzI1MWVmcHlYbG5sczVDMU1EVHVab1NiOC9JUVVWNS9lalBPYjVOOVAvSmFJd05YT0dhcWEyTVAvN01zUUVnQWdJc1dmbnBPeWcvSmRxOVpZbzZBRVdZQ3BSQnpSbEFXcnhwT2xXMFBKMG1kZDJVVkRCd0djbVRST3NRalN5V1hvMG9XVkNldGFmVG9YbyticjN4TUV2UGF2LzcrUmhJSUphSkFxcVFEVTNxaTZxcjR4d2drVE9TQzR4anVLZjQ3Ulp5Mlgwajh6NXhyMUZGajdGZXZiUDVOUTdTbGNpZjc2YXZqQUZiM29TVy91L2h2M3FwUUtCcFRMa3ZRRFo1dVJNU1p6RWhsai8rekxFQ0lBSGZMRmJyQmpuQU80ZnJDajBDYXEvQVljT0s0SnJXTU9rbHBXOUVtbzlCMjZsR1hwb2JWR3BTWHo1L25QdlIvcnpnbWtTdmJiZC9sL1RnVFBSUlRrUUNDWE1SWlYybFdSeWVoc1UybEU2aUFvTWxOSGIxMnY4ZjdoTU9tdlhRWGwrejdkOGowZlAvd3BLWFFmU2wzbysyZi8vaGZKMWhRYUtiaXNzQVJTa2lvTWtLbEQ3UEV3a2FvRnVSRDRJQVluTEtkSlZmVloxLy9zd3hCQ0FCMENOWVllczZ6RG5uK21KbGh6b1dwMm9XVzJuRDh2NkQ3YWZqNWU4VzcxdTM2MmNwM2V6bHcxY0NqclFPcFpBVU5pRGxOY3VFd2hpQklIQ053V0Y5MzAwNnk5OG5STlQ5UkdEZng5eENCQmxFbHJaSTNYODB2L3IvWC8vMyt2Ly9qcnMwRythV0EyUXpvRXh3dU9JWm5ob3JPWVNhZ09lTjFNNkNpaFF4aE9JSjVVbUV4N1o2WnVucVdiL29TWDNMLzkvLy9mLy8vc3l4Qm9BQjNVRFlTWVU2dkRwb0N1azlKelcvMzgwQVl2NGVJN0dvMnBVb0p1cmlrQy92akFLNGxKV1I2d0hNMURUeHlwVXU3Z2JpcHNNNVU4eTJ2ZlA3WGY5c1RGOTgwUCt1cWE2LzIyLy8vNkNLL1dOZ01DNEJTMklDanViZlYvS3hZZ3phYnJSbUViWmpib0R5Qmh4dkxENko4QnN6WVAzYjBhdkRuYXhNL0xpeHQ2RURhUG0xRnZicWQvLzVNQVFORVZ0Qy84SHJ1WHZTUC83TXNRakFBZElyMUZNSkt5QThSTXBKWWVjNEN2bGVNYTJoUmwyRVVTM1lRdG5CNm9ib0p4YTZEWGtaVUlPY2ZmYzZwVEZ6YlhYTjc0bmI1Sis2MUg0cnBiLytWcVVnSzJ4cDlnSjVYZy9TbHdNSUVvK1QwaWFTZFM1Y0QyUDAzb1ZJNDlWU0x3RzQrcEpXemVSeDM1NXpmVm83K1kvMmJKVmJiVDlEdlZSdC8vejIvNER4Wkd6VzAyMjdZMmdJNktRaUFjbEhzWWlVTWpRczZQLyt6TEVLNEFJTFJkTlI3RG5BUHNpN0RUQ25aYVBRb0hkeHRGTHJxMkUyVjFidTZvNkFjTTJXYytmeWVKeSs5VzdiNjl0UHp1YnRwLy83ZitLU05Va0tPYWFlUkVNQVdFbFhpRUhXeVJKVGxvV0xTWmZLWGFIanlzQ2l4Q0RrS2VNNFZMR2d4NVBWMTZMb1BqRnZHUkpyZXFtNWRFWnIvLzlQeVNhRGJVaisva1AwU2dIZ1d1RHB1T0VSYlJVSUh5bkxUc1N2bE9wQW5mYXZWY28vL3N3eEM4QUIzeHZPQ3hwQlFEaUZlcnd4NTRHV2xlZnAyYkxzaGJUWGlnQ2xkQy8vVUoveVAvNk00bzFodXZTV0tXd0FieVdnd0F6WXhjQTdVNDBJU3c0UWMyRDNaTk9LeDNxNk12YTZEK29rVEJBUmlramptbks2aXluVy9jRDRQZHVyKy9FNFhGckoxZmFhVUdNYW9nQUhiakxXNnFMUUVPWklSTUN3RVRhNDR4d0lZeHRVLzlDOFB2bTFIU1VxTlZOQitmSGF4V2xIeHMrLy9zeXhEZ0FCL3l2U2FlZHN5RDRsaWVwbGh6b0k4bzc5cllnR2Z2OVR1RTlNNnNRaVFtcEtTcUFBZDB4ZG5UVlpRSzJWNFA1RkVKckJSYUREVzJqaHo3SnAwbW9qMEV5NERvSDVVbVdKQnRkU0F0a1dOM3Azd1lGcjcvVld1S0hUYXNSQ3QydldUU29BVDVWeDRsUk1aUUpSQ3psRldjUHlBdUtpMmZNK1o5Yk1Ebk10Vm1BM3hCV0Y5V3VsYjFmeFI5V29sTDBLaVk4WERqM1l2LzdNc1E5QUFmZ3NVR3NNVWRoQUJIb2RQWXRMRmd1K1dyb0FLUFFBT2RLV2dOUEJvdGtKZ2ZJU1psNytya3Z6STRMbWVJRFgwU3REQ0pMNkVldGVld3R1QmhEaWNyS05rbllmVDB2QmlIVmgybWF6SHBNdGFkWTdoaDlxMHUvNWhvQk9Da1FSUkI5eVpoZ0dCSFRDM1ZPVnc0THBJa1JCdlZJV0VkaHF3NllIZVlTak5jUFZrcmhoSlJFNmUwVGRpdHNKc3l6aHlzc3lhdFN6YkwvK3pERVFZQUk2SzhxelNXdEFSK1I1WjJtTlBLaGxPVG1GdnhUOVAvL1o4dFZBRUtJSFFBRHRpWUh3RUhpWmhxb2xqZVNQS2JzbHFKUFUxQ3FnMDIvYmZlelFRVkN6emhwUWt4SkRsVjFNcVpqRnNiYk5RdlZHcVhYRmYvMmdXQktBQXdrOTJrY29TSWZvdWdUOU5GMTJXT0VMY1JHVWtJMmpZeWgzaDhYT2VuRm1KZU5BUlk4bFp0QzJKeWRSdXB4Mk92cnFXLy8vLy8vcVJULyt6TEVQUUFIaEkwcEplbERnUEtSNVIyWG5PcVcvS1NKSWczb2pTSE5nSVFVVll5aFZtVERyaFRoTkttakZ2RDhZenV0U3BiRWpCUWI0eG5HMEYrVUwxclAvVFl2UitqOVNmLy85SVJkZjFRQm0vdWNEQzFBaG1iY1pEeWoyWktib2JKMEdqTjlJUHM3YUg0bVd3TDhaQmJvZnJ6c282Nk83MGYvcjdQLy9Rb2xsSWx1Tnhsa1FkL3RJRFNRNG1VM2k3eVVIcUJWRzBZazZvcFIvL3N5eEVTQUJ5U1BPVU04NC9ETkRXY2s5S25XWHVnSnR5cllUaXhXTGJJOWxJMWw1QnhCczZuLy9iNTA5NkhNMWZ0Ly90MEFBaU9LUUpOR0JhMjNaY2NtTDNGK0lGWUV3NDhEQUczV2hyVGdDV2Nyb0F2RlpLVk8wZVZHV2l0di8ramZVdC8vUnFULyt1b0ZWYTIyMDA2SlZvYm1RU1l6Y1JOdThrQnpHUWZsblNwdW9GSjFWNmhsY2h5bzU4cVE1dWo3ZjlQNWIvcTd2Ly9Sb1AvN01zUlNBSWVNbXp1c0xhZXcwNU9sS0d3Y1dBQldGSk1GUEI1NVZId2xzSE16Uzg1b0p1bHp5TnJyeHIrQTIza2ZxK1VmUlpyNlArWDcvLy9LYUpaWnBUVU1qQVo1WlI0Q1F6MnZWd0MyVnY4YmY2Q3RYVmJQYmYyN2FyOFNkK3lyLzZNVVdlS01MSWdkSVRVRGdTdnhsdys2bFRMOUlmYjl0Vi80bjg4VTdRMWRUOUcyanczejJuK1crWXl0QUFCTklOU0hEampsdDVBbkpVUC8rekRFWFFBR09Kc3hRTDFCVUtrTlpTZ1huREswUmxFdjgxUlYwMFBycDA1djBrZHY5SCtWdlV2YndmdjlWOUE0Qzc4cjg5cUlBQUFaaEprZFhIeFBRWVVZR0dGMmMvclhqSTAvRnRsaVJYTjBIL3hIN0ExTzNONG9WOXYvTDRQL1F4VTlCWCtTZjJkYWdBSCtFS3pBRFU0V0NySWZQR2Fjc20ycEM2MlZsRXk0ci9YL2IvemdQci82UDZ0K2pHcjZqZjVZQVFPMkFuY2FOK0wvK3pMRWNvQUVtRWN4UUxCQlVLdVA1V2dVaUc3Q05oekhiRldCUnRpNGFNUHRQcHhqVm8zVWIvQXY4Vi83Q3YvemFvUG1WZm1XVUwrQTE0YjVYL1RWUkFRQmJyQVVzQUNnSzBObG5ycGRVOWE2ajlIdTVYNmNWNTVaRlNUeXBadlQvaDFBQUFDQW9CV2lnUnV4S0pVMEVpR2NSdkFaWkcycEk4K2o0S3NyVGRCWDlCVC93Si8rWWZFWDVKZi8vbGcxNTVXeUt1VzNTV0FBQWFxUS8vc3l4STZBQmVqZkdVRzhRbERObStKMDh3aXFpVVZMQ0kwTEZrU01BeS9wcVgvOUpja0NxZWV2S2krdFFGb1hLNy83N1VhMmdibE1vWGMrNllxZndHTXp5bUFHRS9vK3BYK0ZOWkdzTk55eVRFRk5SVE11T1RrdU5hcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxQ0pUQUFBQUFBQUREQ2haUHo1Ly83TXNTaEFBVTQzeEZFaEVlUXladmY2UEdJOHFFellVQ2pHQ1ZOTXRoTUkxNFJHejZ1cEZPY25wZ3dvMzZ6TmRTSks0UXFURUZOUlRNdU9Ua3VOYXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFyLyt6REV0b0FFWUFFSG9JUkpzTDBSbTdUekNOaXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxci8rekxFMElCRXZHanJwSmhIc0g4RzJyV0hpTmFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxLy9zeXhOS0R4YWdXRjg5N29PQUFBRFNBQUFBRXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFnPT0nO1xyXG5jb25zdCBzb3VuZEJ5dGVBcnJheSA9IGJhc2U2NFNvdW5kVG9CeXRlQXJyYXkoIHBoZXRBdWRpb0NvbnRleHQsIHNvdW5kVVJJICk7XHJcbmNvbnN0IHVubG9jayA9IGFzeW5jTG9hZGVyLmNyZWF0ZUxvY2soIHNvdW5kVVJJICk7XHJcbmNvbnN0IHdyYXBwZWRBdWRpb0J1ZmZlciA9IG5ldyBXcmFwcGVkQXVkaW9CdWZmZXIoKTtcclxuXHJcbi8vIHNhZmUgd2F5IHRvIHVubG9ja1xyXG5sZXQgdW5sb2NrZWQgPSBmYWxzZTtcclxuY29uc3Qgc2FmZVVubG9jayA9ICgpID0+IHtcclxuICBpZiAoICF1bmxvY2tlZCApIHtcclxuICAgIHVubG9jaygpO1xyXG4gICAgdW5sb2NrZWQgPSB0cnVlO1xyXG4gIH1cclxufTtcclxuXHJcbmNvbnN0IG9uRGVjb2RlU3VjY2VzcyA9IGRlY29kZWRBdWRpbyA9PiB7XHJcbiAgaWYgKCB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS52YWx1ZSA9PT0gbnVsbCApIHtcclxuICAgIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggZGVjb2RlZEF1ZGlvICk7XHJcbiAgICBzYWZlVW5sb2NrKCk7XHJcbiAgfVxyXG59O1xyXG5jb25zdCBvbkRlY29kZUVycm9yID0gZGVjb2RlRXJyb3IgPT4ge1xyXG4gIGNvbnNvbGUud2FybiggJ2RlY29kZSBvZiBhdWRpbyBkYXRhIGZhaWxlZCwgdXNpbmcgc3R1YmJlZCBzb3VuZCwgZXJyb3I6ICcgKyBkZWNvZGVFcnJvciApO1xyXG4gIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggcGhldEF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXIoIDEsIDEsIHBoZXRBdWRpb0NvbnRleHQuc2FtcGxlUmF0ZSApICk7XHJcbiAgc2FmZVVubG9jaygpO1xyXG59O1xyXG5jb25zdCBkZWNvZGVQcm9taXNlID0gcGhldEF1ZGlvQ29udGV4dC5kZWNvZGVBdWRpb0RhdGEoIHNvdW5kQnl0ZUFycmF5LmJ1ZmZlciwgb25EZWNvZGVTdWNjZXNzLCBvbkRlY29kZUVycm9yICk7XHJcbmlmICggZGVjb2RlUHJvbWlzZSApIHtcclxuICBkZWNvZGVQcm9taXNlXHJcbiAgICAudGhlbiggZGVjb2RlZEF1ZGlvID0+IHtcclxuICAgICAgaWYgKCB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS52YWx1ZSA9PT0gbnVsbCApIHtcclxuICAgICAgICB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS5zZXQoIGRlY29kZWRBdWRpbyApO1xyXG4gICAgICAgIHNhZmVVbmxvY2soKTtcclxuICAgICAgfVxyXG4gICAgfSApXHJcbiAgICAuY2F0Y2goIGUgPT4ge1xyXG4gICAgICBjb25zb2xlLndhcm4oICdwcm9taXNlIHJlamVjdGlvbiBjYXVnaHQgZm9yIGF1ZGlvIGRlY29kZSwgZXJyb3IgPSAnICsgZSApO1xyXG4gICAgICBzYWZlVW5sb2NrKCk7XHJcbiAgICB9ICk7XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgd3JhcHBlZEF1ZGlvQnVmZmVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQSxPQUFPQSxXQUFXLE1BQU0sbUNBQW1DO0FBQzNELE9BQU9DLHNCQUFzQixNQUFNLDBDQUEwQztBQUM3RSxPQUFPQyxrQkFBa0IsTUFBTSxzQ0FBc0M7QUFDckUsT0FBT0MsZ0JBQWdCLE1BQU0sb0NBQW9DO0FBRWpFLE1BQU1DLFFBQVEsR0FBRyx5cE1BQXlwTTtBQUMxcU0sTUFBTUMsY0FBYyxHQUFHSixzQkFBc0IsQ0FBRUUsZ0JBQWdCLEVBQUVDLFFBQVMsQ0FBQztBQUMzRSxNQUFNRSxNQUFNLEdBQUdOLFdBQVcsQ0FBQ08sVUFBVSxDQUFFSCxRQUFTLENBQUM7QUFDakQsTUFBTUksa0JBQWtCLEdBQUcsSUFBSU4sa0JBQWtCLENBQUMsQ0FBQzs7QUFFbkQ7QUFDQSxJQUFJTyxRQUFRLEdBQUcsS0FBSztBQUNwQixNQUFNQyxVQUFVLEdBQUdBLENBQUEsS0FBTTtFQUN2QixJQUFLLENBQUNELFFBQVEsRUFBRztJQUNmSCxNQUFNLENBQUMsQ0FBQztJQUNSRyxRQUFRLEdBQUcsSUFBSTtFQUNqQjtBQUNGLENBQUM7QUFFRCxNQUFNRSxlQUFlLEdBQUdDLFlBQVksSUFBSTtFQUN0QyxJQUFLSixrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNDLEtBQUssS0FBSyxJQUFJLEVBQUc7SUFDM0ROLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0UsR0FBRyxDQUFFSCxZQUFhLENBQUM7SUFDMURGLFVBQVUsQ0FBQyxDQUFDO0VBQ2Q7QUFDRixDQUFDO0FBQ0QsTUFBTU0sYUFBYSxHQUFHQyxXQUFXLElBQUk7RUFDbkNDLE9BQU8sQ0FBQ0MsSUFBSSxDQUFFLDJEQUEyRCxHQUFHRixXQUFZLENBQUM7RUFDekZULGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0UsR0FBRyxDQUFFWixnQkFBZ0IsQ0FBQ2lCLFlBQVksQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFakIsZ0JBQWdCLENBQUNrQixVQUFXLENBQUUsQ0FBQztFQUNoSFgsVUFBVSxDQUFDLENBQUM7QUFDZCxDQUFDO0FBQ0QsTUFBTVksYUFBYSxHQUFHbkIsZ0JBQWdCLENBQUNvQixlQUFlLENBQUVsQixjQUFjLENBQUNtQixNQUFNLEVBQUViLGVBQWUsRUFBRUssYUFBYyxDQUFDO0FBQy9HLElBQUtNLGFBQWEsRUFBRztFQUNuQkEsYUFBYSxDQUNWRyxJQUFJLENBQUViLFlBQVksSUFBSTtJQUNyQixJQUFLSixrQkFBa0IsQ0FBQ0ssbUJBQW1CLENBQUNDLEtBQUssS0FBSyxJQUFJLEVBQUc7TUFDM0ROLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0UsR0FBRyxDQUFFSCxZQUFhLENBQUM7TUFDMURGLFVBQVUsQ0FBQyxDQUFDO0lBQ2Q7RUFDRixDQUFFLENBQUMsQ0FDRmdCLEtBQUssQ0FBRUMsQ0FBQyxJQUFJO0lBQ1hULE9BQU8sQ0FBQ0MsSUFBSSxDQUFFLHFEQUFxRCxHQUFHUSxDQUFFLENBQUM7SUFDekVqQixVQUFVLENBQUMsQ0FBQztFQUNkLENBQUUsQ0FBQztBQUNQO0FBQ0EsZUFBZUYsa0JBQWtCIn0=