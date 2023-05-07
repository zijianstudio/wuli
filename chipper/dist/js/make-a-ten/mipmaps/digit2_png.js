/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
const mipmaps = [{
  "width": 171,
  "height": 312,
  "url": "data:image/png;base64,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"
}, {
  "width": 86,
  "height": 156,
  "url": "data:image/png;base64,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"
}, {
  "width": 43,
  "height": 78,
  "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAABOCAYAAAC5ZO8pAAAAAklEQVR4AewaftIAAASBSURBVNXBfYzWdQEA8M/zfZ6DYwTZSfIWMkTTJuuf2kyc6QChcokxnOnwJacze0GtnFJtwlADsnNjI4K5aeLU2qk3NTccLB1qjnA4NdCcGCovEzhgB0fAc1xu/EG33/f3u+f9gc8npzauxK2YhJFowVHsxna8hWXYqAo51WnDclyBVtn+i/VYiqdVIKdyN2ABxivPEbyEn2GrMuRVZiV+gxHKl8dXMQvb8S8lyivPeXgOM1FQnS9iOvZhgxLklW4WHscktdOKS/AR3jWAvNLciXaMVHuD8S08g/0y5AxsCeZisGx7sRFvYz0+w2hchItxvmzPYaYMOdkexRzkpduCp7EQ3dItxB34grhDmIp/SJGXrgPXIIjbgxWYidU4ItvfsRcXo1VSC1rxjBQFSW14Ft8W14dX8AtsVJ4/IYc/YIikC2XI6+8ydOAb4g6iHddhp8pswHBMRk5/X8LbeE9E3gn3YzHGiduO2/GQ6q3BNJwp6TA6ReQd9xRuwxBxm3A9/qZ2PsZstOivFytFBMzALOk2YDpeU1trsU7SWVIEXIkWceswBdvUxyPo099p+K6IgAniXsYUdKufv2CrpEtFBOyWtBaXoaj+3pd0hoiA1Sg6rg8dmIaixnhf0lgRBazChZiMTszXWJ9KCiIKjvuJ5nlHUouIoPmOKlFwcjoqImi+CZKOiQia7xxJ+0UEzTdS0g4RQfONl9QlImi+8ZJeERE011cwVn89WCciaK4bMEh/n6EoImiuyZI+liJorkmSPpAiaJ4f4ExJr0sRNM9sSfvwmBRB81wgaQuKUgTNcR0mStooQ9Ac10o6hr/KEDTeWEyW9BFekiFovPkYLumfBhA01hB8T1IvVhlA0FiLMUbSZrxoAEHjtGG2uNVKEDTOEoyW1IUHlCBojAtwlbi16FKCoDF+h+GSDqJdiYL6+xUuEbcGbyhRUF9n45cIkrqxSBmC+lqOUeKexRvKENTPfZgq7hPcqUxBfXwfP0dOUhEPokuZgto7Aw9huLgXsVQFgtp7AhPF/RtzVCiorZWYKu4g7ka3CgW1Mw83SvdndKpCUBvXYh5axH2An6pSUL1paMcw6Z5UA0F1xuOPGCndGtyrBoLKFdCBc6TbjKvVSFC5F/BN6XbgFnSpkaAyT2CGdPswF6+poaB8D+OH0vXg1+hQY0F5luFG5MQdxkIsVwdB6ZbhVuTF9eJBLFInBaV5DHOQk+5R/FYdFWQbhg5Ml+153KzOCtJ9B+34mmxvYpYGKIhrx80YJts2/AhFDVDQ3zW4B183sB7chXc0SMFxZ2MppmKQ0ryHcZiIDzVADldgOcaoTC+6cAiHsR89OII+dKEHPTiMXvRiJ7biQ2xG0QAKWIAxKpfHl1WniL04gO34D9Zhhf+TwwEMdXLaiU7c5nMBQ528RuHHWOtzecx38puAfEDRqeHygF1OEQVswmhxfdiFbuzCARzBbnTjEPrQK1seeQxGG0ZgEEZhBE6XbQ9+X8C9OA3n4hi6sAXrsQqb1N9c3IRz0eqEHdiAJXj1f/YY+zYRxKy3AAAAAElFTkSuQmCC"
}, {
  "width": 22,
  "height": 39,
  "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAnCAYAAAALkrgzAAAAAklEQVR4AewaftIAAAJPSURBVK3BT2jVdQAA8M/7vh/GOziXOLMxL6IMRYh5yaAugglB/kkUdccExWKgSNEhR4kLjRDFCs0OjgQvwlProOBFCDxIMBFBGYosWeGfuUmulvo6fIXfb2/vzfenzydnegV8i/fQhgkM41fsxzVV5FT3AfrQqbKHOIQvVZBX2R4cQLvqCngHs3FembypjqMHBakHuIZBUasooAtDGJCRmKyI1ciJfsdP6MWE1PfYigSvYDtOyMiLFuIM3kUOz3AW61DEM5P9gvlYhhzmoIh7XshjM05iqegJvsY2PFbdOazB60gwioteCOhBh2gMn+JztTmOkqhLRsAc0Sh244jafYc/Re0yElxCCV/gpPrdxTzMkpHgQ80ZEwUZQfPyoucygua9KvpLRtC8uaJHMoLmrECb6K6MoDnrEUTXZQTNeVP0FD/LCBrXhSWiIVyRETTuIxREA8oEjUmwSlRCUZmgMfvRIbqNE8oE9ZuPLVIXVBDU7yDmie6jTwVBfbbifanTGFJBULvF6MUM0SB2qiKo3TF0iMaxF+OqCGrTj7el+tFvGsHL7cNmqVvY7iWC6X2MnUhET9CnBkF1m7AXBdFTfIMf1SCobA0OoVX0HD9gjxolptqIw5grdQo71CEx2Sf4DK1SF9GtTonoDXyFlUikbqBbA3LoRQ9mm+oGbmIEI/gbIxjDBIZwFX8ok2AXWlTWiU7TK+Ex7uMmjqKYoEVzcmhBCxbgLWwI+Mf/axbWJriM5XiEQdzBMEZxD/+iJJXDDLyGNizCcszEBH7D0f8Af8V8tN3WDIsAAAAASUVORK5CYII="
}, {
  "width": 11,
  "height": 20,
  "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAUCAYAAABbLMdoAAAAAklEQVR4AewaftIAAAELSURBVIXBPSiEYQAA4Md7XwZSRIlTsiiTSRgsRpOfWK10ZzOwIxmklAwyoQyK2CxKsdikGMhwkgySn3STr+7q/JzzPGW+m0Ya9bjHNiblJRRsYAIVeEAdepDEvlgCtdhFP04xjhQu0It2rOMtgWN0Yw1DuJZziQh9eMRJQCWWMea3eTyhTSxCm9JeUS4W/K8Kz2JBacOoxpVYUNoAPrAjFvwtoAdXuBML/raAJhzKC4rrwCjuMCsvKG4ZNVjFs7zgty104ggzvgi+W8QIMpjyQ1AwhxSekMaZHyI0YAmDyGIae4ooww1a5Lwjg3d8IIsX3GIlQrOCCrQqrj3CJrI4RwavchJIoguNOPgEf4E5rRBqyboAAAAASUVORK5CYII="
}];
mipmaps.forEach(mipmap => {
  mipmap.img = new Image();
  const unlock = asyncLoader.createLock(mipmap.img);
  mipmap.img.onload = unlock;
  mipmap.img.src = mipmap.url; // trigger the loading of the image for its level
  mipmap.canvas = document.createElement('canvas');
  mipmap.canvas.width = mipmap.width;
  mipmap.canvas.height = mipmap.height;
  const context = mipmap.canvas.getContext('2d');
  mipmap.updateCanvas = () => {
    if (mipmap.img.complete && (typeof mipmap.img.naturalWidth === 'undefined' || mipmap.img.naturalWidth > 0)) {
      context.drawImage(mipmap.img, 0, 0);
      delete mipmap.updateCanvas;
    }
  };
});
export default mipmaps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsIm1pcG1hcHMiLCJmb3JFYWNoIiwibWlwbWFwIiwiaW1nIiwiSW1hZ2UiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwib25sb2FkIiwic3JjIiwidXJsIiwiY2FudmFzIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwid2lkdGgiLCJoZWlnaHQiLCJjb250ZXh0IiwiZ2V0Q29udGV4dCIsInVwZGF0ZUNhbnZhcyIsImNvbXBsZXRlIiwibmF0dXJhbFdpZHRoIiwiZHJhd0ltYWdlIl0sInNvdXJjZXMiOlsiZGlnaXQyX3BuZy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSAqL1xyXG5pbXBvcnQgYXN5bmNMb2FkZXIgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FzeW5jTG9hZGVyLmpzJztcclxuXHJcbmNvbnN0IG1pcG1hcHMgPSBbXHJcbiAge1xyXG4gICAgXCJ3aWR0aFwiOiAxNzEsXHJcbiAgICBcImhlaWdodFwiOiAzMTIsXHJcbiAgICBcInVybFwiOiBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBS3NBQUFFNENBWUFBQUFrYlFOQUFBQUFBa2xFUVZSNEFld2FmdElBQUJIL1NVUkJWTzNCcTU0aitYM0c0ZS83M3dabVVwaFpLMWNnR1FaMWhjVm9aSlJQVU5kY3dmUmV3WlN1WUxYTWJLcVptVFhNek5WWGtCSkxXRFVMTExGbGI5YWV0WHRuNTdCenFLUDBleDdaSm53ZVNSbXdBVGJBQ3RnQUN6N3VCTlJBQzlSQUE5UzJhOElua1czQ3I1T1VBMXNnQXhaMDZ3R29nTXAyUlhndjJTYThuNlFWY0Fma3dJSmhuSUFLT0FBSDJ5M2g3MlNiOERaSlM2QUFYakMrZStCZys4Q0ZrMjNDRTBsM1FBRXNtSlpIb0FSSzJ3MFhTTFlKSUdrRDdJRWJwdThlS0d3M1hCRFo1dEpKS29DWHpNODlVTmh1dUFDeXphV1NsQUVsY00yODNRT0Y3WVl6SnR0Y0drbExvQUJlY0Y1MndONTJ5eGxLWEJoSkc2QUdYbkIrWGdLTnBDMW5TTGE1RkpJSzRDV1g0UUhJYlRlY0Nkbm0zRW5hQUNXdzVyS2NnTUwybmpQd1RWRVVuRE5KT2ZBbjRKckw4eHZnUDNhNzNlOTJ1OTFmaXFMNGdSbVRiYzZScENWUUFzOElmL01JYkczWHpGVGlERW5hQURYd2pQQVAxOEIvUzhxWnFjU1prWFFIL0Rkd1RYaWZWNUpLWmtpMk9RZVNsa0FKUENOOGl0ZEFicnRsSmhKblFOSUdxSUZuaEUvMURLZ2tMWm1KeE14SnlvRUt1Q1o4cmpWUVNWb3lBNGtaazdRSFhnRUx3cGRhQTVXa0pSUDNUVkVVekkyazVXNjMrd3Z3bjRRdS9CYjQvVzYzKzFOUkZEOHdVWW1aa2JRQmF1Q0cwS1UxVURGaGlSbVJsQU1WY0Uzb3cxcFN5VVFsWmtKU0Fid0NGb1ErM1VvcW1LQnZpcUpneWlRdGQ3dmRINEVYaEtGa3U5M3VvU2lLaGdsSlRKaWtKVkFCdDRTaEhTUXRtWkRFUkVuYUFEV3dKb3hoQVJ5WWtNUUVTY3FBQ3JnbWpPbEcwaDBUOFUxUkZFeUpwQno0TS9BYjV1a0kvQzl3RHp3QUQ4QUQ4QUE4QUEvQUF5QkF3SkpwKzdmZGJ2ZW5vaWhhUm5iRmhFamFBeStZajBlZ0FpcWd0bDN6bVNRdGdReklnQzF3emJRc2dCTElHSmxzTXdXU1N1Q1c2WHNOVk1EQmRrUEhKR1ZBRHR3eUxmOXV1MkpFVjR4TTBoSTRBRGRNMXhIWUF3ZmJMVDJ5WFFHVnBBSW9nRnVtb1FSV2pFaTJHWXVrSlZBQmE2Ym5CQnlBdmUyYWtVamFBSHZnaHZFOXQxMHlraXRHSW1rRFZNQ0NhWGtFU21CdnUyVmt0bXNnazNRSGZNZTRDcUJrSkxMTjBDUnRnQXBZTUIyUFFHRzdaS0lrYllBS1dEQ2VQOWcrTUlJckJpWXBCL2JBZ21sNEJBcmJKUk5udTVhMEFpcGd6VGp1Z0FNalNBeElVZzY4QWhhTTd3VHNnSTN0a3BtdzNRSVpjR1FjTjVKV2pDQXhFRWs1OElwcHVBZFd0Z3ZiTFROanV3VXk0TWc0N2hqQkZRT1FWQUF2R2Q4RGNHZTdadVpzdDhCRzBnRjR4ckMyd0IwRFMvUk1VZ204WkZ3bjRGdmJtZTJhODVJRFI0WjFMV25Md0JJOWtiU1VkQUJ1R2RkcllHVjd6eG15M1FJWmNHUllXd2IyVFZFVWRFM1NFcWlBRzhaekF2N0xkdkdqSHpoalJWSDhzTnZ0L2dUOEh2Z3R3L2pYM1c3M3g2SW9mbUFnaVk1SjJnQTFzR1k4cjRHVjdRTVh3bllMYklFVHcxZ0FXd2FVNkpDa0RLaUFhOFp4QXI2MXZiWGRjbUZzTjBER2NMWU1LTkVSU1Rud1YyREJPSTVBWm52UEJiTmRBODhaeGpNRzlFMVJGSHd0U1NYd2t2RjhiM3RiRk1YL0VTaUtvdDd0ZHY4S2JPalpicmM3RmtYeFB3emdpcThnYVFsVXdKcHhuSURjOW9Id1MzZkFCbGpUcnkxd1lBQ0pMeVFwQXhwZ3pUaU9RR2I3UUhpSDdSYklnUlA5MmpLUXhCZVFWQUIvQlJhTTR6V1EyYTRKSDJTN0JncjZ0WkMwWVFCWGZBWkpLNkFFYmhqUHpuWkIrQ1MyOTVLMndBMzkyUUkxUFV0OElrbDNRQTNjTUk0VDhBZmJCZUZ6NWZScnl3QytLWXFDajVHVTdYYTdDdmhQNERlTTR4SDREOXNWNGJNVlJkSHVkanNCR2YzNDdXNjMrNzRvaWgvb1VlSWpKQlhBWDRGcnhuTUVOclpyd3RmWUE0LzBKNk5uaVErUXRBZGVNcTU3SUxQZEVyNks3UllvNkU5R3p4THZJV2tMdkdCYzk3WnoyeTJoRTdaTDRKRitaUFFzOFF1U2xrREp1SjdiemdsOXlPbkhXdEtTSGlYZXRRY1dqT2U1N1pMUUM5c1Y4RWcvTW5xVStCbEpLK0NXY1p5QWY3ZGRFdnBXMEkrTUhpWGVsak9PRTVEWnJnaTlzMTBDajNSdlE0OFNiOHNaM2duSWJOZUVJWlYwNzRZZUpYNGlhUU5jTTZ3VGtObXVDVVBiMHdOSkdUMUpQTWtZMWhIWTJLNEpnN1BkQXEvcDNvYWVKSjVzR000UnlHdzNoREdWZEc5RlR4SlBWZ3pqQ0dTMlc4S29iQitBRTkzYTBKUEVrdzM5T3dLWjdaWXdGUWU2ZFVOUEVrOFc5T3NJWkxaYndwUWM2SmlrSlQxSURPTUlaTFpid3RSVWRHOUREeEw5T3dLWjdaWXdPYlpiNElGdXJlaEJvbDlISUxQZEVxYXNvbHNyZXBCNDhrQzNqa0JtdXlWTVhVVzNWdlFnOGFTbE8wY2dzOTBTNXFDbVd5dDZrSGhTMFkxNzJ4dmJMV0VXYkxmQWtlNHM2VUhpeVlHdmQyODdKOHhSVFhmVzlDRHhFOXNOY09UTDdXem5oTGxxbUxqRTIvWjhtZWUyQzhLY1ZVeGM0bWRzbDhBRG4rNEUvTTUyU1ppN2xnNUp5dWhZNGwwNWNPTFhQUUFyMnpWaDltelhURnppRjJ3M1FBYWNlTDhUOE54Mlpyc2xuSk1URTVaNEQ5czFzQUsrQng2QkUvQUFmQXVzYkplRWMxUXpZVmQ4Z08wV3VBUHVDR0VDRWlFOGFaaXdSQWhQR3JxVDBiRkVDRE9SQ0dFbUVpSE1SQ0tFbVVpRU1CT0pFUHBSMDdGRUNQMW82VmdpaEpsSWhEQVRpUkJtSWhIQ2t4VVRsZ2poeVlydU5IUXNFVUlQYkRkMExCSENreVVUbGdqaHlab0pTNFRRdlNNOVNJVHdJMGtaM1ducFFTS0VtVWlFOEVaR2QycDZrQWpoalNYZGFlbEJJb1EzTm5TbnBRZUpFTjVZMFoyYUhpUkNlT09hN3JUMElCRXVucVNNRHRtdTZVRWlCTmd3QTRrUVlFTjNIdWhKSWdUWTBKMlduaVJDZ0RYZHFlbEpJbHcwU1JuZGF1aEpJbHk2RGQxcTZFa2lYTHFNYnRYMEpCRXUzWWJ1bkd5MzlDUVJMcGFrRlhCTmQycDZsQWlYTEtOYk5UMUtoRXVXMGEyR0hpWENKY3ZvVmsyUEV1RWlTVm9CMTNTcnBrZUpjS2t5dXZWb3U2VkhpWENwdG5TcnBtZUpjS2t5dWxYVHMwUzRPSkl5WUVHM2FucVdDSmNvbzNzMVBVdUVTN1NsVzQrMkczcVdDQmRGMGdwWTA2MmFBU1RDcGNub1hzMEFFdUhTYk9sZXhRQVM0ZEk4bzJPMkt3YVFDQmREMHBidUhSbElJbHlTTGQyckdFZ2lYSkl0M2FzWVNDSmNCRWxiWUVIM0tnYVNDSmNpbzN0SDJ5MERTWVJMc2FWN0ZRTktoTE1uYVF0YzA3MktBU1hDSmRqU2o0b0JKY0lsMk5LOW8rMldBU1hDV1pPMEJSWjByMkpnaVhEdXR2VGp3TUFTNFd4SldnSzNkTzlrdTJKZ2lYRE90dlNqWWdTSmNNN3U2TWVCRVNUQ1daSzBBdGIwbzJJRWlYQ3U3dWpIMFhiRENCTGhYT1gwbzJJa2lYQjJKT1hBZ242VWpDUVJ6bEZPUHg1dDE0d2tFYzZLcEJWd1F6OHFScFFJNSthTy9od1lVU0tjRFVsTElLY2ZKOXNIUnBRSTUyUUxMT2pIZ1pFbHdqa3A2TStCa1NYQ1daQzBCYTdweDhuMmdaRWx3cm00b3o4SEppQVJaazlTQnR6UW41SUpTSVJ6a05PZlI5c1ZFNUFJc3lacEJkelNud01Ua1FoelY5Q3Zrb2xJaE5tU3RBSnU2Yy9SZHMxRUpNS2NGZlNyWkVJU1laWWtyWUJiK2xVeUlZa3dWd1g5dXJmZE1pR0pNRHVTVnNBdC9Ub3dNWWt3UndYOWVyUjlZR0lTWVZZa3JZQmIrbFV5UVlrd04zdjZWekpCaVRBYmtqTGdHZjI2dDkwd1FZa3dKd1g5SzVtb1JKZ0ZTVnZnaG40OTJxNllxRVNZaXozOUs1aXdSSmc4U1hmQU5mMDZBUWNtTEJFbVRkSVNLT2pmM25iTGhDWEMxTzJCQmYwcm1iaEVtQ3hKRytDVy90M2JicGk0UkppeVBjTW9tSUZFbUNSSk9YQkQveDVzTjh4QUlreU9wQ1d3WnhnRk01RUlVN1FIRnZUdndYYkZUQ1RDcEVqS2dGdUdVVEFqaVRBWmtwWkF5VEFlYkZmTVNDSk15UjF3elRBS1ppWVJKa0hTQm5qSk1CNXNWOHhNSWt4RnlYQUtaaWdSUmllcEFOWU00OEYyeFF3bHdxZ2tiWUNYREtkZ3BoSmhiQ1hEdWJkZE1WT0pNQnBKQmJCbU9BVXpsZ2lqa0xRQlhqS2NuZTJHR1V1RXdVbGFBZ2VHY3dMMnpGd2lqS0VBcmhsT1lidGw1aEpoVUpLMndBdUdjN1M5NXd3a3dtQWtMWUdTWWQxeEpoSmhTQWRnd1hEdWJWZWNpVVFZaEtRQ3VHRTRKK0NPTTVJSXZaTzBBVjR5ckR2YkxXY2tFWG9sYVFrY0dOYUQ3Wkl6a3doOUs0RnJobk1DY3M1UUl2UkcwaDN3akdFVnRodk9VQ0wwUXRJRytJNWhQZGplYzZZU29YT1Nsa0RGc0U1QXpobExoRDRjZ0FYRHVyUGRjTVlTb1ZPU0N1Q0dZYjIyWFhMbUVxRXprcmJBUzRiMUNPUmNnRVRvaEtRTlVESzhyZTJXQzVBSVgwM1NFaWlCQmNQNjFuYk5oVWlFTHBUQW1tRzl0cjNuZ2lUQ1Y1RlVBTThZMWlPUWMyRVM0WXRKMmdJdkdWNXV1K1hDSk1JWGtiUUJTb2EzczExeGdSTGhzMGxhQWdkZ3diQ090Z3N1VkNKOGlRcTRabGduSU9lQ0pjSm5rVlFDYTRaWDJLNjVZSW53eVNUZEFiY003OEgybmd1WENKOUUwaGI0am5Ia0JCTGhWMG5hQUNYajJObHVDQ1RDUjBsYUFnZGd3ZkFlYlJlRXYwdUVENUswQkNyZ21uSGtoSDlLaEkvWkEydkc4V0M3SXZ4VElyeVhwRDF3eTNnS3dsc1M0UjJTY3VBRjR6bmFyZ2h2U1lTM1NNcUFWNHpyUUhoSEl2eVRwQTF3WUZ5UHdKN3dqa1Q0TzBsTG9BSVdqR3RydXlXOEl4R1F0QVFxWU1HNHZyVmRFOTRyRWY2bUJOYU02N1h0UGVHREVoZE9VZ2s4WTF4SElDZDhWT0tDU2JvRGJoblhDY2h0dDRTUFNsd29TVG53SGVQYjJxNEp2eXB4Z1NSdGdGZU03N250aXZCSkVoZEcwZ2FvR04rOTdaTHd5UklYUk5JU09BQUx4dlZnT3lkOGxzU0ZrTFFFS3VDYWNSMkJMZUd6SlM3SEFWZ3pyaE93dGQwU1BsdmlBa2dxZ1J2R2RRSXkydzNoaXlUT25LUVN1R1Y4dWUyYThNVVNaMHhTRHR3eXZ1ZTJENFN2a2poVGtuTGdGZVA3M25aSitHcUpNeVFwQjE0eHZudmJkNFJPSk02TXBBMndaM3dQdG5OQ1p4Sm5STklHcUlBRjR6b0NXMEtuRW1kQzBnYW9nQVhqT2dLWjdaYlFxY1Faa0xRQkttREJ1RTdBMW5aTDZGeGk1aVF0Z1JKWU1LNFRrTmx1Q0wxSXpKaWtKVkFCYThaMUFqTGJOYUUzaVptU3RBUXFZTTM0Y3RzMW9WZUpHWkswQkNwZ3pmaWUyejRRZXBlWUdVbExvQUxXak8rNTdaSXdpTVNNU0ZvQ0ZiQm1mTTl0bDRUQkpHWkMwaEtvZ0RYanU3ZGRFZ2FWbUFGSlM2QUMxb3p2M25aT0dGeGk0aVF0Z1FwWU03Nmo3Wnd3aWlzbVROSUdxSUFGNHpzQ0dXRTBpWW1TdEFFcVlNSDRUa0JtdXlXTTVvb0prcFFCQjJEQitFNUFacnNsak9xS2laR1VBNitZanEzdG1qQzZLeVpFVWdHOFpEcWUyNjRJazNERlJFZ3FnVnVtWTJlN0pFekdGU09UdEFRcVlNMTAzTnN1Q0pOeXhZZ2tiWUFEY00xMEhHM25oTW01WWlTU2NtQVBMSmlPUnlBalROSVZBNU8wQlBiQUxkTnlBcmEyVzhJa1hURWdTUnVnQk5aTXo5WjJUWmlzS3dZaUtRZjJ3SUxwK2RaMlJaaTBLM29tYVFtVXdET202ZDcybmpCNVYvUkkwaFlvZ1FYVGRMU2RFMmJoaWg1SVdnSWw4SXpwT2dFWllUYXU2SmlrTFZBQ0M2WXRzOTBTWnVPS2praGFBU1Z3dy9SOWE3c216TW9WSFpCVUFIZkFndWw3Ylh0UG1KMHJ2b0trTGJBSHJwbUhSeUFuek5JVlgwRFNDaWlCRytZbHQ5MFNadW1LenlCcENSVEFDK2JuZTlzVlliYXUrRVNTN29BQ1dEQS9KNkFnek5vVnYwTFNCaWlCTmZQVkFGdEpEZERZYmdpekk5dDhpS1FDZU1sNU9nSTFVQU8xN1lvd2FiTE5MMG5hQUNXdzVySWNnUlpvZ0lZM2FxRGxqZHAyU3hpRmJQTnprbkpnRHl3SUgzTUNhcDYwUU0zYkt0N1cyRzRJWDBTMitRZEpPZkNLTUtRVFVQT3VCbWg0dnhwb2VRL2JGV2RLdHZrYlNWdmd6NFJ6OU1EYmFxRGxTY1dUMm5iTEJNazJrcFpBQXl3STRja0RielJBQTdSQURiUzJhd1oyeFJ0N1lFRUliN3ZoalJ0K1FSSS9lZ1Fhb0FZYW9MWmQwUk1CUzZBQkZvVFFqU05RQXhWUTI2N3BnSUF0OEdkQzZNOGpVQUVIMndlK2tJQTk4SUlRaG5FQ0RrQnB1K0l6Q0tpQUcwSVkzaEhZMnk3NUJBSWE0Sm9ReG5NRTdteFhmTVEzd0hlRU1LN2ZBdmx1dC91WG9pait3Z2NJTUNGTXh4SEliTGY4UWlLRWFWa0RsYVFsdjVBSVlYcldRQ1ZweWM4a1FwaW1OVkR5TTRrUXB1dVpwQzAvU1lRd2JYdCtrZ2hoMnE0bDVmd29FY0wwRmZ4SWdBbGgrbjZYQ0dFZThrUUk4NUFsNElFUXBtK2RDR0VtRWxBUnd2UWRFOUFRd3ZSVkNhZ0lZZnIyeVhZRFBCTENkTzFzTjFlOFVRSXZtYjhIM2xZRExXOXJnSWIzYTIzWGpFalNCbGp5ZmhudnluaXlCTmFjbDN2YkJUKzY0bzBTZU1uMEhJRVdhSUNHTjJxZzVZM0dkc01ac1YzellSV2ZRVkxHR3l0Z0JTeUJEYkFFMWt6ZnZlMmNuOGcyZnlOcEQ3eGdXQ2VnQmhxZ0FTcCtaTHNpOUU3U0NsZ0JHYkFCTW1EQk5PeHNGL3pNRlU4S0lBUFc5T2NCcUlBYXFHMDNoTkhZYm9BR3FQaUpwQTJRQXptd1lIaEg0TTUyeFMvSU52OGdhUWxVd0pwdVBBSVZVQUVIMnkxaEZpUXRnVDF3eXpBZWdjSjJ5UWZJTmo4bmFRbmNBWGZBZ3MvekNOUkFCVlMyYThLc1NWb0JkMEFPTE9qV0NUZ0FwZTJLWHlIYnZJK2tKYkFGTW1ERkd6ZkFJOUR3UmdNMFFBVTB0aHZDMlpLMEJUSWdBOVo4bVFlZ0JpcmJCejdEL3dONWlVRHBjRE9nUUFBQUFBQkpSVTVFcmtKZ2dnPT1cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJ3aWR0aFwiOiA4NixcclxuICAgIFwiaGVpZ2h0XCI6IDE1NixcclxuICAgIFwidXJsXCI6IFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFGWUFBQUNjQ0FZQUFBRGxKVndsQUFBQUFrbEVRVlI0QWV3YWZ0SUFBQWpQU1VSQlZPM0JEYXhWOVdFQThOLzkzeE4zdTJkY0h3UExRL0hqcWExbEpyZzQ2VnFjYTRDbHlhYmlWTkxhemVuV2xDR1lJbFdqcUxVakZrcGxMY1ZWYkx0Sk45R0twZFF1ZGl4MWhXMTEwRlJrTmM1U1VBWjJKVHlWci9uR0MzZnp0cHZrbWpENjRUdm4zSFB2UGZmYysvdVY1Tk1jWElieE9CMWpITzhnOW1JLzl1SmhySmNqSmZsUndXZHhLU1pJYmgrK2oxVllyYzFLOG1FT0Z1STAyZGlOamJnRmg3UkJTWHNOWWlYZXB6bjI0Mjl4Q3c1cG9aTDJXWWdiY2JMbWV3bXJjSWNXS1dtOUFYd1JsMmk5TFZpQVRacXNyTFd1d1VPWW9qMU93ZThqNEY4MFVWbnIzSXMvdzFqdDlSWk14MWw0VEpPVU5kOEExbU1XSXZreEdSZmpLNmpKV0ZselhZSjFtQ3lmenNRMGZCazFHU3Bybm9WWWpyZkp0NG1ZaGxVeVZOWWNYOFJIOFJhZFlTTE94VG9aS2N0V0Jlc3hDMEZuT1E4Ui9sRUd5ckl6aUkxNHQ4NTFQcDdFanpTb0pCdVg0SDZjS2x0VmJNTkIvQUJiSEc4cXpzRlpPRjAydG1DS0JwVTBiallXWTZ4c2pHQUwxdUZoSEJMUEIvRVJ2RXZqN3NBU0RTaHB6Q0xjaEQ2TjI0Mi94eWN3SkwwNStCZ21TRzhuenRHQXN2U1c0bFpVTkdZbjdzVVZXSS9ER3ZNMEhzRTBERWhuREE3Z0tTbVZwWE1mRmlCSWJ6OCtqNnV3UWJZTzQyOHdEUk9sMDQ4SHBGU1czQ1A0WStuVjhCZ3V3enJVTkVjTnEzQXh6cFRjT0R5R2ZWSW9pNitDYitKUzZlM0dBdHlKdzFyaks1aUdpWktKVU1KNktaVEZNNGlOZUpkMGFsaUwzOEcvYXEwYUhzTlZHQ09aRS9CNUtaU05iaGJXNEd6cHZJSzdjRE5xMnFPS1RiZ0N2eXkrOFZpTGZSSXFlM04zWXluR1N1Y1pYSWJIdGQ4UVhzTU1CUEdWc0Y1Q2taK3ZINnR3dWZTK2ltdFFsUitmeFVXNFVueVRwUkQ1V2JmalQzR2FkS3BZanR2bDA0Y3hGZVBGY3o0cXFFcWc3SGlyc1FDL0lwMzl1QXRMNUZjVkorSzk0amtCejJLYkJJSmpGdU1QcGJjSGM3RkMvaTNDRHZITmtsQlExNC9aMHR1Rnk3Rlc1M2hFZktkSktLaTdCV09sc3gwWFlhdk9zZ2k3eGZOT0NRVjFVNlh6UFV6RGtNNzBiZkdjaE9rU0NPcE9rZHhtdkFkRE90YzlxSW5uM1JJSTZrNlh6R1pNUjFWbjI0Wm54SE94QklLNlNIeWJNUjFWeGZDOGVFNlFRRkEzTEo3Tm1JNnE0bmhZUEcrVlFGRDNvdEU5Z2Vtb0twYU5HREc2Y1JJSTZuWjRjMnZ3UGxRVlR4VTdqVzZDQklLNlQySFl6NnBoQmE1V2JBZkVNeWltb0c0clZxRG1tQmN4RHpjcXZpUGlPVkZNa1dQdXdsTzRCay9oUGxSMWgrMzRQUm1LSE84YitJYnU4Ky9pT1JYUGlpSG9PZXF3ZUg1VlRFRlBVd1E5U2J3cXBxQW5pUmZGRlBRMFJkQnoxTm5pT1NLbW9PZW9mdkc4SUthZzU2aHpqVzVFQWtIUFVaSFJIWlJBMEhQVVc0MXV2d1NDbnFOT01ickRFZ2g2Qm5HeTBmMjNCSUtlNmVKNVJRSkJ6d3p4YkpGQTBETWduaTBTQ0hyT05yb2F0a29nNkc0WFlzRG9kcUVxZ2FDN1hTMmVseVVVZExkZkY4OEJDUVhkN2RmRTg4OFNDcnJYNzJLY2VEWklLT2hlMTRsbkNQOG1vYUI3dlYwOHU2VVFkS2RKbUN5ZVBWSUl1dE04OFgxVkNrRjN1a0E4STNoY0NrSDNtWVRKNG5rT1ZTa0UzV2NlS3VMNUR5a0YzV2VLK05aSUtlZ3VGK0EzeExNUFg1TlMwRjF1RmQvM05TRG9MbFBGOTZRR0JOMWpQaWFJcDRyN05TRG9IdThYMzNNWTBvQ2dPMXlBQzhYM2xBWUYzZUhqaU1SVHczMGFGQlRmSUg1YmZOL0ROZzBLaXU5Mm5DUytmNUtCb05qNk1WTjhJMWd1QTBHeExjTlk4VDJOSVJrSWlxc2ZNeVh6Z0l3RXhiVU1ZOFczRzZ0bEpDaW1RVndobVkweUZCVFRFdlNMcjRvbE1oUVV6MVRNbE15M3NVdUdndUpaaW9way9sekdnbUtaZzRzazgxMzhnNHdGeFZIQnJaSjdVQk1FeGJFU1owam1XYXpVQkVFeHpNRFZrdnVDSmdtS1lUa3FrbmtXS3pWSjBQbFc0anpKZlVFVEJaMXRCdjVJY3QvRlNrMFVkSzRLUG9jK3lkUndweVlMT3RmbjhBN0pyY2UzTkZuUW1XYmpXc250eHdJdEVIU2VBU3hDSkxtL3dpNHRFSFNlUnpGZWNsdXdVSXNFbmVWZS9KYmtockZBQ3dXZFl6YXVsODVLYk5KQ1FXZVloRVdJSlBja0ZtcXhJUDhxZUJqakpiY1g3OWNHUWY2dHh2bVNxK0kyREdtRElOK1c0Q3JwL0RWV2E1TWd2ejZDQmRKNUJ0ZHJveUNmcHVKanFFaHVHRGRvc3lCL0JyQWFZNlh6RURacHN5QmZLdmc2enBUT0RzeVRBMEcrUElncDBydFhUZ1Q1c1FLenBQY0NWc3FKSUI4V1lhN0dmRW1PQk8xM0RXNUNKTDFIOFVrNUVyVFhWSHdHZmRKN0J0ZkptYUI5QnJBR1k2VzNCMWVpS21lQzlxamdDWndxdldGOEZMdmtVTkFlMzhSNTBxdmhMcXlWVTBIcnJjUEZHck1NSytSWTBGcjM0UXFOK1JKdWwzTkI2eXpGWEkxWmp6L1JBWUxXdUJzM2FjeG1YS2xEQk0xM0kyNURKTDN0dUFSVkhTSm9ydm40QkNMcDdjWTBITkpCZ3VhWmo4WG9rOTRlek1LUURoTTB4M3dzUnAvMDl1TnliTldCZ3V6TngyTDBTVzhFYzdGVmg0cGs2MjdjaGtoNk5keUJ0VHBZSkRzck1CZVJ4bndLSzNTNFNEWWV3UWMwN2k5eHB3S0lOR1lBWDhjVWpYc0NzeFZFSkwxWnVBZG5hTnh6bUtsQUl1a3N4UTNvMDdpOW1JbXFBb2trTXdrUDREZGxZd1EzWXBlQ2ljUzNHTmVqWDNZK2piVUtLREs2R1ZpQ0MyWHJVWHhjUVVWK3NYN2NqNW1veU5ZT1hLZkFJai9mUGJnV0o4dGVEVGVqcXNCS2pqY0R5M0dlNWhuQjAvZ2ZiTVczc0VIQmxCeXpGRGVnVCt1TjRDVWN3bUg4R0QvQkhoekVIaHpBQWV6QkVid2d4MHJxL2dJMzZFd0hNYUx1SUY1VDl4cXFqcW1wMjRjaC9DZCtpQVBZZytkUmxaRUlzekJINXhxRE1lb21hc3d3OXVFQURtTVlXL0VkYkpCQWhBOGgwblBVU1RnSlp6bm1jblVqMklFZllSMVdleE1sN01EYjlTVDFFamJoazlqcXA1U3hESkdlcEU3RUpQd0J6c0RqL3ArQWlwNUc5T0hEMklTS053UTlXWGtQL3M0YmdwNHNUY09kWGhmMFpPMWFyd3Q2c25ZMlpnWU02OG5hQndQMjZzbGN3RXQ2c3ZaUWhPL2d2WnByR0svaUNJYlZqZUFuNnY0WFA5YVlNa3JxZmdrbnFIc2J5cGlnTmRiZzhRakw4Q0djTExrYWZvaVhjUVFIc0IwNzhRTzhpaGZreHlBR2NDNG00MXowNFJ5TTA3ZzF1TnJyU3VybVl6SDZ2TGtxdG1FN0hzV1RPS1FZWnVKbVhDUzVuYmdmbi9HR2ttTm00QmFjaFhHbzRyL3dNbDdCQnF6RGtHSzdGUE53RGdiOVlzOWpOeDdFbC8yVS93UHM3ZElGTW13c2JBQUFBQUJKUlU1RXJrSmdnZz09XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwid2lkdGhcIjogNDMsXHJcbiAgICBcImhlaWdodFwiOiA3OCxcclxuICAgIFwidXJsXCI6IFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFDc0FBQUJPQ0FZQUFBQzVaTzhwQUFBQUFrbEVRVlI0QWV3YWZ0SUFBQVNCU1VSQlZOWEJmWXpXZFFFQThNL3pmWjZEWXdUWlNmSVdNa1RUSnV1ZjJreWM2UUNoY29reG5PbndKYWN6ZTBHdG5GSnR3bEFEc25Oakk0SzVhZUxVMnFrM05UY2NMQjFxam5BNE5kQ2NHQ292RXpoZ0IwZkFjMXh1L0VHMzMvZjN1K2Y5Z2M4bnB6YXV4SzJZaEpGb3dWSHN4bmE4aFdYWXFBbzUxV25EY2x5QlZ0bitpL1ZZaXFkVklLZHlOMkFCeGl2UEVieUVuMkdyTXVSVlppVitneEhLbDhkWE1RdmI4UzhseWl2UGVYZ09NMUZRblM5aU92WmhneExrbFc0V0hzY2t0ZE9LUy9BUjNqV0F2TkxjaVhhTVZIdUQ4UzA4Zy8weTVBeHNDZVppc0d4N3NSRnZZejArdzJoY2hJdHh2bXpQWWFZTU9ka2V4UnprcGR1Q3A3RVEzZEl0eEIzNGdyaERtSXAvU0pHWHJnUFhJSWpiZ3hXWWlkVTRJdHZmc1JjWG8xVlNDMXJ4akJRRlNXMTRGdDhXMTRkWDhBdHNWSjQvSVljL1lJaWtDMlhJNis4eWRPQWI0ZzZpSGRkaHA4cHN3SEJNUms1L1g4TGJlRTlFM2duM1l6SEdpZHVPMi9HUTZxM0JOSndwNlRBNlJlUWQ5eFJ1d3hCeG0zQTkvcVoyUHNac3RPaXZGeXRGQk16QUxPazJZRHBlVTF0cnNVN1NXVklFWElrV2Nlc3dCZHZVeHlQbzA5OXArSzZJZ0FuaVhzWVVkS3VmdjJDcnBFdEZCT3lXdEJhWG9haiszcGQwaG9pQTFTZzZyZzhkbUlhaXhuaGYwbGdSQmF6Q2haaU1Uc3pYV0o5S0NpSUtqdnVKNW5sSFVvdUlvUG1PS2xGd2Nqb3FJbWkrQ1pLT2lRaWE3eHhKKzBVRXpUZFMwZzRSUWZPTmw5UWxJbWkrOFpKZUVSRTAxMWN3Vm44OVdDY2lhSzRiTUVoL242RW9JbWl1eVpJK2xpSm9ya21TUHBBaWFKNGY0RXhKcjBzUk5NOXNTZnZ3bUJSQjgxd2dhUXVLVWdUTmNSMG1TdG9vUTlBYzEwbzZoci9LRURUZVdFeVc5QkZla2lGb3ZQa1lMdW1mQmhBMDFoQjhUMUl2VmhsQTBGaUxNVWJTWnJ4b0FFSGp0R0cydU5WS0VEVE9Fb3lXMUlVSGxDQm9qQXR3bGJpMTZGS0NvREYraCtHU0RxSmRpWUw2K3hVdUViY0dieWhSVUY5bjQ1Y0lrcnF4U0JtQytscU9VZUtleFJ2S0VOVFBmWmdxN2hQY3FVeEJmWHdmUDBkT1VoRVBva3VaZ3RvN0F3OWh1TGdYc1ZRRmd0cDdBaFBGL1J0elZDaW9yWldZS3U0ZzdrYTNDZ1cxTXc4M1N2ZG5kS3BDVUJ2WFloNWF4SDJBbjZwU1VMMXBhTWN3Nlo1VUEwRjF4dU9QR0NuZEd0eXJCb0xLRmRDQmM2VGJqS3ZWU0ZDNUYvQk42WGJnRm5TcGthQXlUMkNHZFBzd0Y2K3BvYUI4RCtPSDB2WGcxK2hRWTBGNWx1Rkc1TVFkeGtJc1Z3ZEI2WmJoVnVURjllSkJMRkluQmFWNURIT1FrKzVSL0ZZZEZXUWJoZzVNbCsxNTNLek9DdEo5QiszNG1teHZZcFlHS0locng4MFlKdHMyL0FoRkRWRFEzelc0QjE4M3NCN2NoWGMwU01GeFoyTXBwbUtRMHJ5SGNaaUlEelZBRGxkZ09jYW9UQys2Y0FpSHNSODlPSUkrZEtFSFBUaU1YdlJpSjdiaVEyeEcwUUFLV0lBeEtwZkhsMVduaUwwNGdPMzREOVpoaGYrVHd3RU1kWExhaVU3YzVuTUJRNTI4UnVISFdPdHplY3gzOHB1QWZFRFJxZUh5Z0YxT0VRVnN3bWh4ZmRpRmJ1ekNBUnpCYm5UakVQclFLMXNlZVF4R0cwWmdFRVpoQkU2WGJROStYOEM5T0EzbjRoaTZzQVhyc1FxYjFOOWMzSVJ6MGVxRUhkaUFKWGoxZi9ZWSt6WVJ4S3kzQUFBQUFFbEZUa1N1UW1DQ1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcIndpZHRoXCI6IDIyLFxyXG4gICAgXCJoZWlnaHRcIjogMzksXHJcbiAgICBcInVybFwiOiBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQllBQUFBbkNBWUFBQUFMa3JnekFBQUFBa2xFUVZSNEFld2FmdElBQUFKUFNVUkJWSzNCVDJqVmRRQUE4TS83dmgvR096aVhPTE14TDZJTVJZaDV5YUF1Z2dsQi9ra1VkY2NFeFdLZ1NORWhSNGtMalJERkNzME9qZ1F2d2xQcm9PQkZDRHhJTUJGQkdZb3NXZUdmdVVtdWx2bzZmSVhmYjIvdnpmZW56eWRuZWdWOGkvZlFoZ2tNNDFmc3h6VlY1RlQzQWZyUXFiS0hPSVF2VlpCWDJSNGNRTHZxQ25nSHMzRmVtYnlwanFNSEJha0h1SVpCVWFzb29BdERHSkNSbUt5STFjaUpmc2RQNk1XRTFQZllpZ1N2WUR0T3lNaUxGdUlNM2tVT3ozQVc2MURFTTVQOWd2bFloaHptb0loN1hzaGpNMDVpcWVnSnZzWTJQRmJkT2F6QjYwZ3dpb3RlQ09oQmgyZ01uK0p6dFRtT2txaExSc0FjMFNoMjQ0amFmWWMvUmUweUVseENDVi9ncFByZHhUek1rcEhnUTgwWkV3VVpRZlB5b3VjeWd1YTlLdnBMUnRDOHVhSkhNb0xtckVDYjZLNk1vRG5yRVVUWFpRVE5lVlAwRkQvTENCclhoU1dpSVZ5UkVUVHVJeFJFQThvRWpVbXdTbFJDVVptZ01mdlJJYnFORThvRTladVBMVklYVkJEVTd5RG1pZTZqVHdWQmZiYmlmYW5UR0ZKQlVMdkY2TVVNMFNCMnFpS28zVEYwaU1heEYrT3FDR3JUajdlbCt0RnZHc0hMN2NObXFWdlk3aVdDNlgyTW5VaEVUOUNuQmtGMW03QVhCZEZUZklNZjFTQ29iQTBPb1ZYMEhEOWdqeG9scHRxSXc1Z3JkUW83MUNFeDJTZjRESzFTRjlHdFRvbm9EWHlGbFVpa2JxQmJBM0xvUlE5bW0rb0dibUlFSS9nYkl4akRCSVp3Rlg4b2syQVhXbFRXaVU3VEsrRXg3dU1tanFLWW9FVnpjbWhCQ3hiZ0xXd0krTWYvYXhiV0pyaU01WGlFUWR6Qk1FWnhELytpSkpYRERMeUdOaXpDY3N6RUJIN0QwZjhBZjhWOHROM1dESXNBQUFBQVNVVk9SSzVDWUlJPVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcIndpZHRoXCI6IDExLFxyXG4gICAgXCJoZWlnaHRcIjogMjAsXHJcbiAgICBcInVybFwiOiBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQXNBQUFBVUNBWUFBQUJiTE1kb0FBQUFBa2xFUVZSNEFld2FmdElBQUFFTFNVUkJWSVhCUFNpRVlRQUE0TWQ3WHdaU1JJbFRzaWlUU1Jnc1JwT2ZXSzEwWnpPd0l4bWtsQXd5b1F5SzJDeEtzZGlrR01od2tneVNuM1NUcis3cS9KenpQR1crbTBZYTliakhOaWJsSlJSc1lBSVZlRUFkZXBERXZsZ0N0ZGhGUDA0eGpoUXUwSXQyck9NdGdXTjBZdzFEdUpaemlRaDllTVJKUUNXV01lYTNlVHloVFN4Q205SmVVUzRXL0s4S3oySkJhY09veHBWWVVOb0FQckFqRnZ3dG9BZFh1Qk1ML3JhQUpoektDNHJyd0NqdU1Dc3ZLRzRaTlZqRnM3emd0eTEwNGdnenZnaStXOFFJTXBqeVExQXdoeFNla01hWkh5STBZQW1EeUdJYWU0b293dzFhNUx3amczZDhJSXNYM0dJbFFyT0NDclFxcmozQ0pySTRSd2F2Y2hKSW9ndU5PUGdFZjRFNXJSQnF5Ym9BQUFBQVNVVk9SSzVDWUlJPVwiXHJcbiAgfVxyXG5dO1xyXG5taXBtYXBzLmZvckVhY2goIG1pcG1hcCA9PiB7XHJcbiAgbWlwbWFwLmltZyA9IG5ldyBJbWFnZSgpO1xyXG4gIGNvbnN0IHVubG9jayA9IGFzeW5jTG9hZGVyLmNyZWF0ZUxvY2soIG1pcG1hcC5pbWcgKTtcclxuICBtaXBtYXAuaW1nLm9ubG9hZCA9IHVubG9jaztcclxuICBtaXBtYXAuaW1nLnNyYyA9IG1pcG1hcC51cmw7IC8vIHRyaWdnZXIgdGhlIGxvYWRpbmcgb2YgdGhlIGltYWdlIGZvciBpdHMgbGV2ZWxcclxuICBtaXBtYXAuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICBtaXBtYXAuY2FudmFzLndpZHRoID0gbWlwbWFwLndpZHRoO1xyXG4gIG1pcG1hcC5jYW52YXMuaGVpZ2h0ID0gbWlwbWFwLmhlaWdodDtcclxuICBjb25zdCBjb250ZXh0ID0gbWlwbWFwLmNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XHJcbiAgbWlwbWFwLnVwZGF0ZUNhbnZhcyA9ICgpID0+IHtcclxuICAgIGlmICggbWlwbWFwLmltZy5jb21wbGV0ZSAmJiAoIHR5cGVvZiBtaXBtYXAuaW1nLm5hdHVyYWxXaWR0aCA9PT0gJ3VuZGVmaW5lZCcgfHwgbWlwbWFwLmltZy5uYXR1cmFsV2lkdGggPiAwICkgKSB7XHJcbiAgICAgIGNvbnRleHQuZHJhd0ltYWdlKCBtaXBtYXAuaW1nLCAwLCAwICk7XHJcbiAgICAgIGRlbGV0ZSBtaXBtYXAudXBkYXRlQ2FudmFzO1xyXG4gICAgfVxyXG4gIH07XHJcbn0gKTtcclxuZXhwb3J0IGRlZmF1bHQgbWlwbWFwczsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0EsT0FBT0EsV0FBVyxNQUFNLG1DQUFtQztBQUUzRCxNQUFNQyxPQUFPLEdBQUcsQ0FDZDtFQUNFLE9BQU8sRUFBRSxHQUFHO0VBQ1osUUFBUSxFQUFFLEdBQUc7RUFDYixLQUFLLEVBQUU7QUFDVCxDQUFDLEVBQ0Q7RUFDRSxPQUFPLEVBQUUsRUFBRTtFQUNYLFFBQVEsRUFBRSxHQUFHO0VBQ2IsS0FBSyxFQUFFO0FBQ1QsQ0FBQyxFQUNEO0VBQ0UsT0FBTyxFQUFFLEVBQUU7RUFDWCxRQUFRLEVBQUUsRUFBRTtFQUNaLEtBQUssRUFBRTtBQUNULENBQUMsRUFDRDtFQUNFLE9BQU8sRUFBRSxFQUFFO0VBQ1gsUUFBUSxFQUFFLEVBQUU7RUFDWixLQUFLLEVBQUU7QUFDVCxDQUFDLEVBQ0Q7RUFDRSxPQUFPLEVBQUUsRUFBRTtFQUNYLFFBQVEsRUFBRSxFQUFFO0VBQ1osS0FBSyxFQUFFO0FBQ1QsQ0FBQyxDQUNGO0FBQ0RBLE9BQU8sQ0FBQ0MsT0FBTyxDQUFFQyxNQUFNLElBQUk7RUFDekJBLE1BQU0sQ0FBQ0MsR0FBRyxHQUFHLElBQUlDLEtBQUssQ0FBQyxDQUFDO0VBQ3hCLE1BQU1DLE1BQU0sR0FBR04sV0FBVyxDQUFDTyxVQUFVLENBQUVKLE1BQU0sQ0FBQ0MsR0FBSSxDQUFDO0VBQ25ERCxNQUFNLENBQUNDLEdBQUcsQ0FBQ0ksTUFBTSxHQUFHRixNQUFNO0VBQzFCSCxNQUFNLENBQUNDLEdBQUcsQ0FBQ0ssR0FBRyxHQUFHTixNQUFNLENBQUNPLEdBQUcsQ0FBQyxDQUFDO0VBQzdCUCxNQUFNLENBQUNRLE1BQU0sR0FBR0MsUUFBUSxDQUFDQyxhQUFhLENBQUUsUUFBUyxDQUFDO0VBQ2xEVixNQUFNLENBQUNRLE1BQU0sQ0FBQ0csS0FBSyxHQUFHWCxNQUFNLENBQUNXLEtBQUs7RUFDbENYLE1BQU0sQ0FBQ1EsTUFBTSxDQUFDSSxNQUFNLEdBQUdaLE1BQU0sQ0FBQ1ksTUFBTTtFQUNwQyxNQUFNQyxPQUFPLEdBQUdiLE1BQU0sQ0FBQ1EsTUFBTSxDQUFDTSxVQUFVLENBQUUsSUFBSyxDQUFDO0VBQ2hEZCxNQUFNLENBQUNlLFlBQVksR0FBRyxNQUFNO0lBQzFCLElBQUtmLE1BQU0sQ0FBQ0MsR0FBRyxDQUFDZSxRQUFRLEtBQU0sT0FBT2hCLE1BQU0sQ0FBQ0MsR0FBRyxDQUFDZ0IsWUFBWSxLQUFLLFdBQVcsSUFBSWpCLE1BQU0sQ0FBQ0MsR0FBRyxDQUFDZ0IsWUFBWSxHQUFHLENBQUMsQ0FBRSxFQUFHO01BQzlHSixPQUFPLENBQUNLLFNBQVMsQ0FBRWxCLE1BQU0sQ0FBQ0MsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7TUFDckMsT0FBT0QsTUFBTSxDQUFDZSxZQUFZO0lBQzVCO0VBQ0YsQ0FBQztBQUNILENBQUUsQ0FBQztBQUNILGVBQWVqQixPQUFPIn0=