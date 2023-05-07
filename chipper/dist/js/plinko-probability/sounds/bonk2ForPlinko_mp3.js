/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';
const soundURI = 'data:audio/mpeg;base64,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H0KgiPLJIjBDVSABhgYzDnrTqSUkjVgBIqzaDo21y/w1GsOczwqBBStbyPIt362UXWxuItS4Ys7nJdf1UGHEFQIVRAE4tqn/+zLEgAMHLDEYTukmgQqH4oXdGRIeZTwOFR05pCV/MCiMwqVbiq8yLa0KP0gB+jp7V3BaPu4yL7XktyDrISlHPPFxxsbjgyLLHh0ZAUhjdA7a5C3ZgcHRqHQx+GxjjxijyI8OW7DF++cG1DVe8FbL9Pb3d2v4H77Vb3Nbjb7ZALJLSo8AQKqxWjVepALIgsGzKe5PwdbQCWXqJmeQ//syxIYDB7wvFCx3ZAD5h+KJ3QzYaokrl3av5hm3RvmsuupG0YqpiJkwUKrHvYpmXIH0Akkbdk7qNPRwFhWd2Bx6YeYWVmCFrYo7NWQc+1WtQ5+12jRK8hyHZidlnklslI8wjYKsVFZ9B484KCEiXUONg+rCAIhE5SStwFVwQKDVfMNqIABGAAqMjOoLu+VijrUh4iYLcj0IqRrO6//7MMSLgwe8IxhOZYgQ4Ifihd0I2OUQ9ZPOoRYjN2LfFha9AFeHEjAqUrAf468yOSCEz3NDlVhCDz8pTYRW5nJ6z/6rJVo8sJkXvPHpzZVIln9L2qSf71MNJPzyKnei9uKQ+ywFCZ8DaeEKBRoiJwAWU4lwhGA0tcKPrd+SQ793OV3/n1F2FyfjRlymEqxIaw2gZA2MABle8jI1xf/7MsSUAgbkIxrOZSZRAQfiRc2s0OjzhBaYgtZNlBYBkAiBCYRA5ActjkRptmQG7rFbkV+zN7PIFv1yg2oEgtawvZE1F4v2bVpzJqXTLInXZa4UNuq+xAJgqQCYKoDRCuZIlzJEuZRJNIVHoUnoU3Ik3Ik3IknoUnoUnxmKopiiWUklmKopiiUaSSzFUUxSLDBliQSimTJZUSWbFxL/+zLEnAIHeCsUTmVmQNIEI5jNmJIBImCWPhGJolDiHQLBqHBPLCtx9wYBQrUSH4sa1En4sjU1+LI1Nfi3FG8W4o3i3VVMQU1FMy45OS4zVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//syxKeDxjwhEg3oxkDRhWMAnZiQVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MMS4A8wAfxYGZSGIvYSbAMYwUFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImJhc2U2NFNvdW5kVG9CeXRlQXJyYXkiLCJXcmFwcGVkQXVkaW9CdWZmZXIiLCJwaGV0QXVkaW9Db250ZXh0Iiwic291bmRVUkkiLCJzb3VuZEJ5dGVBcnJheSIsInVubG9jayIsImNyZWF0ZUxvY2siLCJ3cmFwcGVkQXVkaW9CdWZmZXIiLCJ1bmxvY2tlZCIsInNhZmVVbmxvY2siLCJvbkRlY29kZVN1Y2Nlc3MiLCJkZWNvZGVkQXVkaW8iLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJvbkRlY29kZUVycm9yIiwiZGVjb2RlRXJyb3IiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZUJ1ZmZlciIsInNhbXBsZVJhdGUiLCJkZWNvZGVQcm9taXNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYnVmZmVyIiwidGhlbiIsImNhdGNoIiwiZSJdLCJzb3VyY2VzIjpbImJvbmsyRm9yUGxpbmtvX21wMy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSAqL1xyXG5pbXBvcnQgYXN5bmNMb2FkZXIgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FzeW5jTG9hZGVyLmpzJztcclxuaW1wb3J0IGJhc2U2NFNvdW5kVG9CeXRlQXJyYXkgZnJvbSAnLi4vLi4vdGFtYm8vanMvYmFzZTY0U291bmRUb0J5dGVBcnJheS5qcyc7XHJcbmltcG9ydCBXcmFwcGVkQXVkaW9CdWZmZXIgZnJvbSAnLi4vLi4vdGFtYm8vanMvV3JhcHBlZEF1ZGlvQnVmZmVyLmpzJztcclxuaW1wb3J0IHBoZXRBdWRpb0NvbnRleHQgZnJvbSAnLi4vLi4vdGFtYm8vanMvcGhldEF1ZGlvQ29udGV4dC5qcyc7XHJcblxyXG5jb25zdCBzb3VuZFVSSSA9ICdkYXRhOmF1ZGlvL21wZWc7YmFzZTY0LFNVUXpBd0FBQUFBQVlWUkRUMDRBQUFBT0FBQUFVMjkxYm1RZ1JXWm1aV04wYzFSSlZESUFBQUFTQUFBQVFtOXVheUF5SUdadmNpQlFiR2x1YTI5VVdVVlNBQUFBQlFBQUFESXdNVFpVUkZKREFBQUFCUUFBQURJd01UWlVVRVV4QUFBQUJRQUFBRkJvUlZULyt6REVBQUFHUEFFQk5ERUFFU2tkcGdNNDBBQVFWUzZVUWdIeHdJSEFUUGljSHdmQkNjN1FmeE9EOE0rRDcveTRJQWc2bmx3UUJCMmM0WThId2ZmTHZpQUV3L0x2SjkrdE10RE0xUlQvZnRrNTJKbEJoSy82VGEyWUczWXBGUDA0TFlCZUNXZjRsQW1CaXIveUdPd2VBNmxuN3ZwMGpBUzhtRW9iLy9mV09NbHpBK2Jtbi8vNVFFSk1NbFAvZ0l3S3F1d0VORnZyVXJBQTNZbi8rekxFQlFCSTBHbFZ2YlNBSVFTUFp3M2RJUldCcFJEMHFTMk1KQ2pONHNGRzZtN2pWb2VUSm1IMmRhejVJbWxRc2ZDcElrVGtzWVRGTEtxS0tzWXhXSnFWemZVbW01VUZSbUN2NWJCVVJlSlF6WWdCWlV3eE1KcjRPQlV3eEJrNEtyQVNuTXdIRUUzRTlDY3hGdDR5dlNsblE4Rng0TEJReFZNWXRPNVBlNlVYKzcyLzN2cXJsN3BESHV6REl5U2ZmNTBBUlZnQUNRZ1hDMXlBLy9zeXhBVURTR3lOT3M3c1Ixa0NrR2RKM1NUV1ZjQW9JekNJUkRRMlBEeEVReHd3RVJFQ2dkaURodjVBTm5PcEtha2IzWTNMMmR3RjJCSXVjVUIwSGNLNzJ2amxzN0RUdnZVZ1J3M2k0MG1CZ1BxcU91N2tUV01PaU9abjFxZkkrRlFSbXlRMEZnZDY2NEpGVVNMaHNDTEpUcXk5cGJCTW9yN3I3Q1Z1LzczZHE0T0RFTWpLcFJucThwWWF4K29BUTBnQVlqSFVDTDNlT09GcERQLzdNc1FIQWtpa2p6ck9NTXk1Q285bVNkMGc0Q0lRUG1IZzFhSVRCSWRCQTNlaHJMUkpRRUMzbjFTV09BcE5veVpTQnV2Z3hIWUlrcGFtb3NXbjk4bkVSZVgyNVJjWTNlSU9JTTBQWmc0UkpmTkxSYzVjeGRaZ2lRQjBuV1I1THhqRkJrb1FRTGFZeHR1OE1NR1pOZy95L25KQnF3NFhIUUxCZ21VUHRkdVdpam5oNHMzU0NsZTRyT0FldzdjaENUZ0FBQnBDSXFxd295RUlDaUQvK3pERUJ3TkkzSDh3YnVVbXdSU1BaWW11b0hrTURDRUpUS0Q4eit6Rm93M0lNWWZaMllOYm83MWdEeUVDaE05ZGFCcHR3SW9sa3BUaC9QZTlhdi9sUnlHbWQrN0pPRE1oME5od0RkWldISWVqVGtHQUFzSFV5U3RNUVJlT1hyS0EwVm1ENGttQlF5Z2tEa3VWdlAyeFJkc3pUVGQ5N1l6WHFUSUtxRndGb0p4VjZncVVHeTVxbE54OTJmTjZNU2hVWS9GQkF5QUFZMFBNcHBELyt6TEVCSUJIUkdrNHpIRUU4T3NNNWczY3NNMHpkQkdzSENrNDNjRE9nU0FnU0JBWWR0OUlCcEFOQ01XRzJMSGIyWWJqRGVZRVpPL1dpcjdRdVl0VFFEandVYm5ubFJoQzR1Z29NeUpEaURRR0JBem1YbkFuZG0wSWpYRWhTVVRCQ0FZTFlFUjhmbmxwWE9xUFlLT3JFenp2MmYzSS8rMW5ZN1o4Smc3WENDNEFBaUEzQUFBREhtSVMyWWNjSEFNWkRUYkpRL1VETUhNekNCbFcvL3N5eEE0Q1IxaFBNMHhzeFNqbGplWUozSXptU0RhR0VTN09Cd2tvME9FSGtENHhjYnRROGRNeEc0UG5BVzNVOGJvRWJLUXdlQ0FPQVY5TnJRUURoUUlqQ0tram0rTVFvSEdMamVTRFlaaDYxZWx0TENyQUdRR0ZNYU5RQ29VZHdjVmxWUXlGUjNZRURUTGtpMVZDWlVBQUJSNnd4L0hLa0t6akJBdE9BMjgwY0FTQUlHWGk5VnpRMjRqeTBtVnlabjc2RGd3bEV0VGRxdDFGcWYvN01zUVhnRWNzYnpMT1lHajQ1QW5sV2MyWTVUM3FGSDZtR1ZUODFyWmdDWGd4c2FtL1ZNd1JwTDRqcFRQMWZzK3M5TVpOd1NhckNLYjJIZmN0NTUyUVRjcWpEbzJZVWlPRHlqMTVtd2dxMzVDSzVMcmRzemRLQUlNZ0FHRllhc2xlSjQ1VUlBSkhRNkdaRVB1eDdBNDBXS2hMU3FhQXJXR1NEcFlTZzRwb3o0bE1KdDJsRkZvdVU2c1pveTRSQm42TmtvTUFBRnoreUNIbk1iZi8rekRFSWdKSE9HOHV6dVRHK040TnBabkdEVll3c0RUcnAvTmhBd3dJSkF1S0c0aTRCbzdCVEVjbWpKK3RVUFdBNks0R0hLUnhVcHFjVENLRUlNT0RwN3JxQUFDVllBQUdCWFVkMkdHaWpBRU1BaVUydDFUOWRBbzVnbHJVazhVbHo5MThKVkRybE9WUnJtaEFMUTluUVpKQ25QVnFxN3VSclBRcGk4UFVCUURJbWhxKzRyeEp5aklpTkVkdzhwSkJHWTRXcGNESlluQ2tXQmovK3pMRUxJSUhVRzh2TG1USE1PUUpKWm5OSk1wZ21NdmpOSlhZSU9qb25mWWhEUW80R3c1UUl2Ly8vZC8vL3FvRDNBR1JDOGp0TTNjZ3VXWU1BUnpGSUdxZ2dZR0VReUhtaWp3SFprVTBCc3pIa1B6cWxISHI3ZCtYY1dQUWdEaWcyZXh6UmdPdkFhaWxUS2hVRUNCQ0lJRXdnRWJUMDR6U2x3RlhJa0szbjhoOWRVdWt0UE16MDNlcjJhR1YxYVdreCs3c2xCTjlZQ1NnVFAwVi8vc3l4RGFDUm9oSEtxenhnVERnaUtRSm4yaUFWYUVEMFRJZzRxOXNMVEJNTWdnN0Y3RGNvTU1BaTB3Z04wVm02MGtWYnpucGdhOHg5dEY5UjFBM1lMb2VJS0NYWjM0cTdXMzlWWC8vNlRJa0twZXd4TDh2QVlJZ2lZVER3Y3Era2ExRHNZYkM0WnFzWVVDNkR5d2xRZVlwd3drRGlCSVFVWUtFRnVld3BTcS9rKzc5Zi8vcDlWLytoUXdIZzRWbXl1QWtkUXFBd1lBUU5aaVFxUC83TXNSRUF3ZEFTeVJNOE1HUTdnampnZDBKRUNuSExZaENEUFNZRkZLWVMzSUNZUklwYWNDbE5qREVCeWVMTEo2RCt6dC90L1IvMi9kOVIrUVNURHJ4QXUyRUdBZ2t6dTRJRGZFTHpDTWdUR2Z4VU1xcXZwNFdTeTJ0WnpwN083dktsbmRlMzRISEIwUlB4bTBOZDNmMy8vLy8zTVVoUFVHV201REF3b0VIVlpnTkEvR0pta2tjUTlHU0ZCa3dZTkZhWmpUclNVZFNYWEs5dS9qLyt6REVUUU5IREQ4Y0wyekd3TzJINDBHdTZJajNIdHJPOTl6SXVTV1QvUzdWMGR2OTMvLzVTb0FFRXFBYkRTQ3N3RXVsSkl3YUQwMS9rOC9ZTkFoY1ltYUZyWEtnV1hNMHpwZ2ZBcGxSa3VRdHAvdTEvMi8zLyt2KzRoWDNLaEFBd3JtUlNmdGxpWDVqR0dFWWptOVdEbW1JcW1FNG9tQUlqbHJITGlrUExucE1CQU9qdVlXTXdTQTFuZTZqLy9YL1IwZjJmcWZ0eXlpMVlUai8rekxFVm9NSFNFRWNEWHRrQU5PRXBBMmU3QkRRM05QRzBRbEZCSW1HUFdSSGhaSkNtZUNpUVp2YlVwY0xaQVN0dlBMYnE3UDcrNy8xMStuUi96Vi9JUStCamplTDNRdE1zRWVLdzduTXMzZUNZdzBIZ3doSG9RQU92Q0FYb0xvNFYyTmNHNnRvalJKWmk2cmRUOVgveWZ6MDl6T2pZbTAyVlJueFZ0SURWYVhJaXpTU3d3d01RQUFBUXpNd3AxT1M1TU9OTVNIVE1nZVdhYzYvLy9zeXhHS0RCeVEvSEV6MFpRQy9CR1FKbnVpQXdudHVtYzRDU0xVZFBaMmR5Vm8yTFpGdzJ6UTNaaXUxT0dtWklmU1daYWJFTkhkcHFXR21HbUFRMGEwMFI4d2d5Sk5UMUxvZG1xV0tiSkVpR1JjN0JGdjdPN21iazhVMjNYZW51a293NmNRUGhZTERHRXppTjFuWVdPZ0FONVREWU9qbzJGaldRU0RDUVhpUVloQ0FMY0pmS0Y1OGxkQ2xRUXhtc2JEL2JyT2ZwLzE3ZFdiTGdQLzdNc1J5QXdmQVFSWU05TVVBOEFma0NkME0ybVNsTFJPSzBvRkVHMXNhTU11RkZWQ1VnTUE2QnFkNmxGeGdEZ0tNWmlWeDVqWkppd0k5TEtCclFvT3B3R2ZCUk4xVTZwNW5wWHUxOUhEbnJtbWQyNVdqTG82Tldtc2dQZWdDQ3Nta2NITXVMMG1FWWdIRDA2R21ZQUdCWWdta3FnSUV5bUdvWllyVnkwc05wV1R5cXBSVEhTSjRReUhiMzZuL1d2cysxTEJjWFRRTVM1cTdBOC8vK3pERWVRTUcrQ01pVG1zR0VRSUlJb0dPaktCVHk1TkFDWkxOSVlaV2w0QlhtRVF1Ry9OYUg2SWhqaUVZSWhGMjM4bGZWZjRkN1Z2ZlVKamtnZDJqa096dTcvMWJFc1p2VmEyQjJWekJrU1R5bGpBSEgwS2dpUExKSWpCRFZTQUJoZ1l6RG5yVHFTVWtqVmdCSXF6YURvMjF5L3cxR3NPY3p3cUJCU3RieVBJdDM2MlVYV3h1SXRTNFlzN25KZGYxVUdIRUZRSVZSQUU0dHFuLyt6TEVnQU1ITERFWVR1a21nUXFING9YZEdSSWVaVHdPRlIwNXBDVi9NQ2lNd3FWYmlxOHlMYTBLUDBnQitqcDdWM0JhUHU0eUw3WGt0eURySVNsSFBQRnh4c2JqZ3lMTEhoMFpBVWhqZEE3YTVDM1pnY0hScUhReCtHeGpqeGlqeUk4T1c3REYrK2NHMURWZThGYkw5UGIzZDJ2NEg3N1ZiM05iamI3WkFMSkxTbzhBUUtxeFdqVmVwQUxJZ3NHektlNVB3ZGJRQ1dYcUptZVEvL3N5eElZREI3d3ZGQ3gzWkFENWgrS0ozUXpZYW9rcmwzYXY1aG0zUnZtc3V1cEcwWXFwaUprd1VLckh2WXBtWElIMEFra2JkazdxTlBSd0ZoV2QyQng2WWVZV1ZtQ0ZyWW83TldRYysxV3RRNSsxMmpSSzhoeUhaaWRsbmtsc2xJOHdqWUtzVkZaOUI0ODRLQ0VpWFVPTmcrckNBSWhFNVNTdHdGVndRS0RWZk1OcUlBQkdBQXFNak9vTHUrVmlqclVoNGlZTGNqMElxUnJPNi8vN01NU0xnd2U4SXhoT1pZZ1E0SWZpaGQwSTJPVVE5WlBPb1JZak4yTGZGaGE5QUZlSEVqQXFVckFmNDY4eU9TQ0V6M05EbFZoQ0R6OHBUWVJXNW5KNnovNnJKVm84c0prWHZQSHB6WlZJbG45TDJxU2Y3MU1OSlB6eUtuZWk5dUtRK3l3RkNaOERhZUVLQlJvaUp3QVdVNGx3aEdBMHRjS1ByZCtTUTc5M09WMy9uMUYyRnlmalJseW1FcXhJYXcyZ1pBMk1BQmxlOGpJMXhmLzdNc1NVQWdia0l4ck9aU1pSQVFmaVJjMnMwT2p6aEJhWWd0Wk5sQllCa0FpQkNZUkE1QWN0amtScHRtUUc3ckZia1Yrek43UElGdjF5ZzJvRWd0YXd2WkUxRjR2MmJWcHpKcVhUTEluWFphNFVOdXEreEFKZ3FRQ1lLb0RSQ3VaSWx6SkV1WlJKTklWSG9Vbm9VM0lrM0lrM0lrbm9Vbm9VbnhtS29waWlXVWtsbUtvcGlpVWFTU3pGVVV4U0xEQmxpUVNpbVRKWlVTV2JGeEwvK3pMRW5BSUhlQ3NVVG1WbVFOSUVJNWpObUpJQkltQ1dQaEdKb2xEaUhRTEJxSEJQTEN0eDl3WUJRclVTSDRzYTFFbjRzalUxK0xJMU5maTNGRzhXNG8zaTNWVk1RVTFGTXk0NU9TNHpWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVi8vc3l4S2VEeGp3aEVnM294a0RSaFdNQW5aaVFWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWZi83TU1TNEE4d0FmeFlHWlNHSXZZU2JBTVl3VUZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlE9PSc7XHJcbmNvbnN0IHNvdW5kQnl0ZUFycmF5ID0gYmFzZTY0U291bmRUb0J5dGVBcnJheSggcGhldEF1ZGlvQ29udGV4dCwgc291bmRVUkkgKTtcclxuY29uc3QgdW5sb2NrID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggc291bmRVUkkgKTtcclxuY29uc3Qgd3JhcHBlZEF1ZGlvQnVmZmVyID0gbmV3IFdyYXBwZWRBdWRpb0J1ZmZlcigpO1xyXG5cclxuLy8gc2FmZSB3YXkgdG8gdW5sb2NrXHJcbmxldCB1bmxvY2tlZCA9IGZhbHNlO1xyXG5jb25zdCBzYWZlVW5sb2NrID0gKCkgPT4ge1xyXG4gIGlmICggIXVubG9ja2VkICkge1xyXG4gICAgdW5sb2NrKCk7XHJcbiAgICB1bmxvY2tlZCA9IHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3Qgb25EZWNvZGVTdWNjZXNzID0gZGVjb2RlZEF1ZGlvID0+IHtcclxuICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBkZWNvZGVkQXVkaW8gKTtcclxuICAgIHNhZmVVbmxvY2soKTtcclxuICB9XHJcbn07XHJcbmNvbnN0IG9uRGVjb2RlRXJyb3IgPSBkZWNvZGVFcnJvciA9PiB7XHJcbiAgY29uc29sZS53YXJuKCAnZGVjb2RlIG9mIGF1ZGlvIGRhdGEgZmFpbGVkLCB1c2luZyBzdHViYmVkIHNvdW5kLCBlcnJvcjogJyArIGRlY29kZUVycm9yICk7XHJcbiAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBwaGV0QXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlciggMSwgMSwgcGhldEF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlICkgKTtcclxuICBzYWZlVW5sb2NrKCk7XHJcbn07XHJcbmNvbnN0IGRlY29kZVByb21pc2UgPSBwaGV0QXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YSggc291bmRCeXRlQXJyYXkuYnVmZmVyLCBvbkRlY29kZVN1Y2Nlc3MsIG9uRGVjb2RlRXJyb3IgKTtcclxuaWYgKCBkZWNvZGVQcm9taXNlICkge1xyXG4gIGRlY29kZVByb21pc2VcclxuICAgIC50aGVuKCBkZWNvZGVkQXVkaW8gPT4ge1xyXG4gICAgICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xyXG4gICAgICAgIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggZGVjb2RlZEF1ZGlvICk7XHJcbiAgICAgICAgc2FmZVVubG9jaygpO1xyXG4gICAgICB9XHJcbiAgICB9IClcclxuICAgIC5jYXRjaCggZSA9PiB7XHJcbiAgICAgIGNvbnNvbGUud2FybiggJ3Byb21pc2UgcmVqZWN0aW9uIGNhdWdodCBmb3IgYXVkaW8gZGVjb2RlLCBlcnJvciA9ICcgKyBlICk7XHJcbiAgICAgIHNhZmVVbmxvY2soKTtcclxuICAgIH0gKTtcclxufVxyXG5leHBvcnQgZGVmYXVsdCB3cmFwcGVkQXVkaW9CdWZmZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLE9BQU9BLFdBQVcsTUFBTSxtQ0FBbUM7QUFDM0QsT0FBT0Msc0JBQXNCLE1BQU0sMENBQTBDO0FBQzdFLE9BQU9DLGtCQUFrQixNQUFNLHNDQUFzQztBQUNyRSxPQUFPQyxnQkFBZ0IsTUFBTSxvQ0FBb0M7QUFFakUsTUFBTUMsUUFBUSxHQUFHLGlrS0FBaWtLO0FBQ2xsSyxNQUFNQyxjQUFjLEdBQUdKLHNCQUFzQixDQUFFRSxnQkFBZ0IsRUFBRUMsUUFBUyxDQUFDO0FBQzNFLE1BQU1FLE1BQU0sR0FBR04sV0FBVyxDQUFDTyxVQUFVLENBQUVILFFBQVMsQ0FBQztBQUNqRCxNQUFNSSxrQkFBa0IsR0FBRyxJQUFJTixrQkFBa0IsQ0FBQyxDQUFDOztBQUVuRDtBQUNBLElBQUlPLFFBQVEsR0FBRyxLQUFLO0FBQ3BCLE1BQU1DLFVBQVUsR0FBR0EsQ0FBQSxLQUFNO0VBQ3ZCLElBQUssQ0FBQ0QsUUFBUSxFQUFHO0lBQ2ZILE1BQU0sQ0FBQyxDQUFDO0lBQ1JHLFFBQVEsR0FBRyxJQUFJO0VBQ2pCO0FBQ0YsQ0FBQztBQUVELE1BQU1FLGVBQWUsR0FBR0MsWUFBWSxJQUFJO0VBQ3RDLElBQUtKLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLElBQUksRUFBRztJQUMzRE4sa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVILFlBQWEsQ0FBQztJQUMxREYsVUFBVSxDQUFDLENBQUM7RUFDZDtBQUNGLENBQUM7QUFDRCxNQUFNTSxhQUFhLEdBQUdDLFdBQVcsSUFBSTtFQUNuQ0MsT0FBTyxDQUFDQyxJQUFJLENBQUUsMkRBQTJELEdBQUdGLFdBQVksQ0FBQztFQUN6RlQsa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVaLGdCQUFnQixDQUFDaUIsWUFBWSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVqQixnQkFBZ0IsQ0FBQ2tCLFVBQVcsQ0FBRSxDQUFDO0VBQ2hIWCxVQUFVLENBQUMsQ0FBQztBQUNkLENBQUM7QUFDRCxNQUFNWSxhQUFhLEdBQUduQixnQkFBZ0IsQ0FBQ29CLGVBQWUsQ0FBRWxCLGNBQWMsQ0FBQ21CLE1BQU0sRUFBRWIsZUFBZSxFQUFFSyxhQUFjLENBQUM7QUFDL0csSUFBS00sYUFBYSxFQUFHO0VBQ25CQSxhQUFhLENBQ1ZHLElBQUksQ0FBRWIsWUFBWSxJQUFJO0lBQ3JCLElBQUtKLGtCQUFrQixDQUFDSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLElBQUksRUFBRztNQUMzRE4sa0JBQWtCLENBQUNLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVILFlBQWEsQ0FBQztNQUMxREYsVUFBVSxDQUFDLENBQUM7SUFDZDtFQUNGLENBQUUsQ0FBQyxDQUNGZ0IsS0FBSyxDQUFFQyxDQUFDLElBQUk7SUFDWFQsT0FBTyxDQUFDQyxJQUFJLENBQUUscURBQXFELEdBQUdRLENBQUUsQ0FBQztJQUN6RWpCLFVBQVUsQ0FBQyxDQUFDO0VBQ2QsQ0FBRSxDQUFDO0FBQ1A7QUFDQSxlQUFlRixrQkFBa0IifQ==