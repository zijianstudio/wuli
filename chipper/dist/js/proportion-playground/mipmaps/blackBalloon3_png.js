/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
const mipmaps = [{
  "width": 144,
  "height": 178,
  "url": "data:image/png;base64,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"
}, {
  "width": 72,
  "height": 89,
  "url": "data:image/png;base64,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"
}, {
  "width": 36,
  "height": 45,
  "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAtCAYAAADGD8lQAAAAAklEQVR4AewaftIAAAU8SURBVM3BTYjcZx3A8e/vef47O7uZfZlM1iSMM7s7CagJKmkwgRJFEjGIeLE9tJQgRnuQHIoVPCgIvQhaBFtLL+JJUnLpwYJC1rpKwKakJAe3oFXz77xQNcvszv5nZ2fn7Xl+zuoUhiUxu3H25fMRtiGXnf4kwpNi7McRpkBSoBOA8F8KEoEuoVr0zi+I6i/DUnGRLRIeIped/qZY+xWET4tIBhHDVqmiquvAX9Xr23j3Ulgs/pn/QXiA3PTMd8WaZ0XkOCIMgnpdQ/1b2nEvhaXir7kPYZNcJjsmgb0qxnwZEcMOUNWadtzLYSH/fTax9MllsmMSBG+KtecREXaIiMTEyOPJicnZysrKr+hj6XMwlfqNWPNZuhKJBJcvX+bixYtkMhmq1SpRFDEwIkZEPjU5MTleWVmZo8fSk5uZ/Ymx5hlEiMViXLlyhdnZWUZHR0mn05w5c4aZmRnu3LnDwIgIIo8lx8bzlShaoMvQlctkj4uRryPChkuXLpFOp+mnqhQKBVSVQRKRuAT2e/QYusTaH4gxSbrOnj3LyZMn6ee9Z25ujuvXr7MTROREbnrmBboMG4x8np4LFy4gIvS7ffs2c3Nz7BgRxJqv0mVymezTIpKh69y5c0xNTdGvXC5z7do1dpzIiVwm+yWDtecRYcPp06fZbH5+Hu89O01EDNY+YcTIMbpGRkZIp9P0W1pa4ubNm+wWMeZjBiRF16lTpxgaGqLf3bt32V2aMaDjdB09epTN8vk8u0okYegZHh7Ge0+/MAzZTQLj9mAy+ZyIJBcWFpifn6dcLrMhCAJu3LhBu91mF1k5ljt2S4x8hv1AtW5Aq+wTqlSNqobsG7pq6Pg7qLIvKCUDelVVa+wDqv5dE5aKq8Df2GOq6nD+qqFLvb/FXlP9S1gq3jJscP5VVBvsJe9/R5ehKywV/6SqC+wR9b6szr9Al6FHnXsdVfaCen09LBWX6TL0hIXCj1S1wC5T7/M49216DH3U+zdQdoyq4pzjQ6ra0o57MSwV1+kx9HP+eVVf6HQ6VCoVWq0Wg6CqNBoN7t27R7PZ5D9UwfnXwmLhVfpY+lSqkU+OT8RsYL9Qq9VkcXER5xzGGKy1iAjboao0m02WlpYol8s450ilUhhjUK9v3s2//wSbWDapRCt/TE4mPzcUi81GUUSz2WR1dZVqtcoGVWWDquK9x3uP9x7vPd57nHM451hfX6dcLrO8vEyr1WLD4cOHicfjqHN/0I67WKlGnk2E+8hlssdlKPjtaq02s7i4yCBMTU0xMT6u6v0b2nFPhqVih/uw3EelGi0nE2PvDY/EvxgEwYF6vc6jstZy5MgREgcSkTr30zCff7ZSjTwPYHmASjX6ezIx9l58ZOTxRCIxaYyh0WiwVSJCKpXi0KFDneFY7Ia2O98Ki4Vf8BDCQ+Qy2eMS2Fcw5rxzbqjRaFCv16nVanjv+ZAxhng8zujoKLFYjOGh2Jox5h117udhsfAaWyRsUS6bfVqs/Roip0TkI4jgvcd7jxGDiHjQfwHvq/Nv4/0rYamYZ5uER3DoYKrQcZ1sLBgiMXrgZUTfQeX3YanwAf+ngEfgnTMrUcTk+Pg/w1L5OQbIsE3TH818o9lupemyxrYYMMM25DLZYK2+9p21el3oanfah3OZ6QsMkGEbGq3Wz6q12ifoqdZq8dX62o9zmWzAgBi2KJfJHlxvrD/VarXot1KNHmu0mi8yIIata1sbrFpr6RfYAGNsxIAI25DLZNPNdvv5Tqd9ot3u2CAIWsPDw2+V/vHBDxmQfwP/z2G3SDfFKwAAAABJRU5ErkJggg=="
}, {
  "width": 18,
  "height": 23,
  "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAXCAYAAAAGAx/kAAAAAklEQVR4AewaftIAAAJaSURBVKXBvWsTcRgH8O/zu4s58sa1aY3WFpIoEvsm6RZwcFKc6ipIJl/QzUmoFfwDsgjaxU2HIohLcdBsGSqKBHFQUDiaNiGmUC9nXsi9PibYoUhq0/TzIfwjGU/cIUGXQHQaQBRAEH+1wLzNzN/g8SuttPEaexB2JePxLAnxkIjOgAj/w8wumD+z4y5pm6V36JLQlYwnbpAkPZ6bnz+ZXlhAtVqFbdvYDxEJIpqAEJdHIupX3aj/kJKTU1GSpZfTMzNj2WwWqVQKqVQK6+vrOAgRBUFI67q+IuCTl0mIU4uLi/D7/Wg2m1hdXcWgiGg6mUg8EkR0IZPJIBaLoSefz6NSqWBgRCASVwSIJmZnZ9Gj6zoKhQIOjRAXAAKqqqKnVqthSKoMwM7lckin05BlGcMgQJIB1Jl5vFgsYlgMNAWYSzi6mmDmDzgiZv4iYDtPmNnAkJjZhus+F1p56yeY32NYzAWtVFoT6GLXXfE8r2PbNg7CzDBNE67rgpm32XaW0SWhSzeM76PqSLpuGNPtdhtEBCJCDzODmeF5HizLQr1eR7vdRjgUMtjj+9pmaQ1dMnaxbd8Oh8Jnd37tzFUqFewnHA4jOhots+ctaRsbL7CLsEdycuqcJ4lnpmVlWq2WaDQaYGb4fD4Eg0EofkVXFOWtcN0HWnlLwx6EPpLx+F3X8265rnfeJ8sfSYgqwJ9gO0+18paOw1AjkTehQMDAgAT6mIiduGpa1kXbcULHx8bvYQACfXRM81rHNAOmZYlOp3MdA5DRhxoK3Tzmk4uO40YURcn/bjZwkD/qbBC7QXYd3QAAAABJRU5ErkJggg=="
}, {
  "width": 9,
  "height": 12,
  "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAMCAYAAACwXJejAAAAAklEQVR4AewaftIAAAEOSURBVH3BvUrDUBgG4PecpA2tYF0zxJBsjnbSNZudXZz1HlTQxV28hU4VvAMJdBDsPeiQHpQM0gaT1KT56TmfDhmK0D4Pwx/XcW4Y56cA9gF0AOQgBERqFEynD8x1nLuTweDaNE19OBxiHRFVpNQttyzrzPM8PQxD/McYazPOz/lhv28WRQHf97GBrc1ms0shhBHHMTYgDiAUQmCLL05EE2xBRC8cq9V9WZTzqqqglAIRQUqJLMugpHxHVV9p30ky39vtrbI8P46iyIiiCFLKut1qvbY07SL4/HhjaLi2fZQtl4/dTveJMTwHQozR0NFI0sVB+rOwyqKM4zQZY42ORm+nO+KM1YbRnsRpgnW/kJuEhrDJ/OwAAAAASUVORK5CYII="
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsIm1pcG1hcHMiLCJmb3JFYWNoIiwibWlwbWFwIiwiaW1nIiwiSW1hZ2UiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwib25sb2FkIiwic3JjIiwidXJsIiwiY2FudmFzIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwid2lkdGgiLCJoZWlnaHQiLCJjb250ZXh0IiwiZ2V0Q29udGV4dCIsInVwZGF0ZUNhbnZhcyIsImNvbXBsZXRlIiwibmF0dXJhbFdpZHRoIiwiZHJhd0ltYWdlIl0sInNvdXJjZXMiOlsiYmxhY2tCYWxsb29uM19wbmcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgKi9cclxuaW1wb3J0IGFzeW5jTG9hZGVyIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9hc3luY0xvYWRlci5qcyc7XHJcblxyXG5jb25zdCBtaXBtYXBzID0gW1xyXG4gIHtcclxuICAgIFwid2lkdGhcIjogMTQ0LFxyXG4gICAgXCJoZWlnaHRcIjogMTc4LFxyXG4gICAgXCJ1cmxcIjogXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUpBQUFBQ3lDQVlBQUFDdElrYUZBQUFBQWtsRVFWUjRBZXdhZnRJQUFCWEZTVVJCVk8zQnNXOWNaYjd3OGUvdk9UTWVUNXlZdyt5K0l1QkljMVluQllYUmRXTzBvZ2ltTWx2aGRLUWlOS3Z0Z1BKV2dUOWd0YVJZcE51UXBJSmJyYWxldVdLVzV0V1ZtMEdiWWxmS2tjNlIxbHA4Z1prejlqakg5cHg1ZnU4eElZc0pjVHkyeDQ3SGVUNGZ3Zm0zc0I3TU1aZzRTdUlZQitHTUMrdkJET0FETTRBUDFJR0FCK2JZVFFRUjlxVldlVVNEQjJJZ0FXSWdCcHBSRXFlY1ljSVpFZGFER1NBQVpvRFhnUUFJRUVHRWdvQUlPOFFJUHhCaEtGVFpvVmI1Z1NxZ3FGVUtLZEFFbXNEWFFETks0aVpuaERDQ3ducmdBM1BBNjhBTU1JY0lJb0FZRUJBUkVPR3BVMldIV2dWVlZCVlVLVFNBSnZCWG9CRWxjY29JRWtaQVdBOThZQTU0QzVnREFqRUNZa0JBakdIVXFMV2dpbG9GVlFwTjRBdGdNVXJpSmlOQ09LWENlakFETEFCdkFUTmlCTVFnUmtDRXMwYXRCYXVvS3FpbXdDTHdSWlRFaTV4aXdpa1Mxb01aNEIxZ0FaRkFSTUFJWWd6UEZGWFVLbW90cUtiQUl2QkZsTVNMbkRMQ1V4Yldnd0I0RDFoQUpCQWppREVnZ2xOUVJhMmkxb0pxQ3R3R2JrWkpISE1LQ0U5SldBK3VBKzhBYzJJTTRoa1F3WGtDVmJSdlVXc3BOSUE3VVJMZjVpa1NUbGhZRDY0RE54QUp4RE9JTVRnSHA5YWlmUXVxTVhBSCtEaEs0cFFUSnB5UXNCN01BWDlDWk1hVVBCREJHUUpWdE45SHJhYkFUZURqS0lsVFRvaHd6TUo2NEFNM2dQZkY4eERQNEJ3RFZiVGZSNjJtd00wb2lUL2tCQWpIS0t3SGM4QXRNUktJNTRFSXpqRlR4ZVo5VUcwQ1Y2TWtqamxHSHNja3JBY2ZBcmZFODN3cGVTQ0Njd0pFRU05UXVJanE5WnJ2LzZQZFNmL09NUkdHTEt3SFBuQUxrUVZUOGtBRTUrbFFhOUc4VCtIaktJay80QmdJUXhUV2d4bmdsaGd6SXlVUDV4UlF4ZVo5VUcwQVY2TWtUaGtpanlFSjY4RU04S1Y0SnBDU2gzTktpQ0NlQVNWQTljMmE3LzkzdTVOdU1pUWVReERXZ3huZ1N5bDV2bmdlenVranhvQnlFZFUvMUh4L3FkMUp2MkVJUEk0b3JBY3p3SmRTOG53eEJ1ZjBFbU1vaktQNmRzMzNsOXFkOUJ1T3lPTUl3bm93QTN3cEpjOFhZM0JPUHpFR1JNYXgrbmJOOTVmYW5mUWJqc0Rqa01KNk1BTjhLU1hQRjJNNGpQbjVlVjU5OVZXcTFTcnRkcHM4ejNHT240aUFNbzdxbXpYZnY5UHVwSnNja25BSVlUM3dnUy9GTXpQaWVSelUxTlFVYjcvOU5sTlRVK3kyc3JMQzh2SXlkKy9lcGRWcTRSd3Z6ZnVvdFUzZ2pTaUpVdzdCNHhCcXZ2OS94WmpmU3Nuam9HWm5aL245NzMvUDVPUWtqNXFjbk9UbGwxL215cFVyVEU5UGsrYzU3WGFiUE05eGhrK01BZVVpcWkrM08rbC9jd2dlQnhUV2d3OFJ1VzdLSlE3cTJyVnJ6TS9QTTRqSnlVbGVlZVVWWG52dE5WNTQ0UVhhN1RicjYrczR3eVhHb0ZaZnJqM25TN3VUTmpnZ2p3TUk2OEVjY011VVN5RENRVnk3ZG8zWjJWa09xbHd1TXpVMXhXdXZ2Y2JseTVkcHQ5dTBXaTJjNFJFanFMVnpOZC8vdXQxSi84NEJlQXdvckFjKzhQK2s1STJMTVJ6RXRXdlhtSjJkNWFocXRScXpzN05jdm55WktJcklzZ3huQ0VSQUJLeStXZlA5LzJwMzBrMEc1REdnbXU5L0pzYk1pT2R4RVBQejgxeTVjb1ZocXRWcVhMbHloU3pMU0pJRTUraEVCSlJ4VkgvYjdxUjNHSkJoQUdFOW1BTVdwT1J4RUxPenM4elB6M05jNXVmbnFkVnFPTU1oSlE5RTVzSjY4RDRETWd6bWxuZ2VCekUxTmNYQ3dnTEhaV1ZsaFQvKzhZKzBXaTJjNFRFbGo4S05zQjc0RE1Dd2o3QWVmSWhJSUo1aFVOVnFsWGZmZlpkcXRjcHhXRmxaNFpOUFBxSFZhdUVNbVFoaWpBL2NZZ0NHSndqcmdRKzhaMG9lQjNIdDJqVnF0UnJINGU3ZHUzenl5U2RrV1laelBLVGtVVmdJNjhFYyt6QTgyZnRpeEVlRVFVMVBUek05UGMxeFdGNWU1dE5QUHlYTE1wempKWjVINFFiN01Pd2hyQWMrOEo1NEhvT3FWcXRjdTNhTjQ3Qzh2TXhubjMyR2N6TEVNeUF5RjlhRDZ6eUJZVy92aXhFZkVRYTFzTEJBdFZwbDJLSW80clBQUHNNNVdlSVpDamQ0QXNQZTNoSFBZMUNYTDE5bWRuYVdZVnRaV2VIVFR6L0ZPWGxpRElnRVlUMjR6aDRNanhIV2crdUlCSWd3cUxmZWVvdGhhN1ZhZlBMSkoyUlpodk4waUdjb3ZNY2VESS8zam5pR1FjM096akkxTmNVd1pWbkdyVnUzeUxJTTUra1JZMEJrSnF3SGN6eUc0UkZoUFFpQU9UR0dRVlNyVmVibjV4bTJ4Y1ZGVmxaV2NKNCtNWWJDZXp5RzRaY1d4QmdHZGVYS0ZXcTFHc1AwMVZkZnNieThqSE02aUdjb0xJVDFJT0FSaGw5NkJ5TU1vbHF0Y3VYS0ZZWnBaV1dGcGFVbG5OTkZqS0d3d0NNTXU0VDFJQUJteEJnR01UMDlUYlZhWlpnKy8veHpzaXpET1dXTVVIaVBSeGgrYmtHTVlWRHo4L01NMDlMU0Vpc3JLemluanhoRElRanJ3UXk3R0g3dWRZd3dpTm5aV1dxMUdzUFNhclg0NnF1dmNFNHZNWWJDTyt4aStMa0ZFV0VRcjc3NktzTzB1TGhJbG1VNHA1Z1JDZ3ZzWXZoUldBL21FQUVSOWxPcjFRakRrR0dKb29pN2QrL2luRzVpRElVZ3JBY0JQekw4WkU1RUdNU1ZLMWNZcHFXbEpaelJJTVpRV09CSGhwLzhCMFlZeFBUME5NTVNSUkgzN3QzREdSRWlGRjduUjRhZnpJZ0krNW1hbXFKV3F6RXNTMHRMT0tORGpGQ1k0MGVHbndTSXNKL1oyVm1HcGRWcWNlL2VQWndSSWtMQkQrdkJEQVZESWF3SGM0Z3dpT25wYVlabGFXa0paL1NJTVJSbUtCZ2VDRVNFL1V4TlRWR3IxUmlXdTNmdjRvd2dFUXIvUWNId1FJQUkrd25Ea0dHNWUvY3VXWmJoakI0eFFtR0dndUdCT2dPNGZQa3l3L0szdi8wTlo2VE5VVEE4RUlnUjloT0dJY055OSs1ZG5CRWx3bzZ3SHZpR0FkVnFOYXJWS3NNUVJSRlpsdUdNTGpGQ1ljYnd3Qno3ZU9tbGx4aVdlL2Z1NFl3Nm9SQVlIaExoU2FhbXBoaVdLSXB3UnB3SWhjQXdvS21wS1labFpXVUY1MHg0empDZ2FyWEtNTFJhTGJJc3d4bHRZb1RDakdGQUw3MzBFc1BRYnJkeHpnN0RnS3JWS3NPd3NyS0NjM1lZVGxpV1pUaG54b3poaExWYUxad3pRSVNDWDJKQVVSU3hZM3g4bkttcEtRNnIzVzdqbkIwbEJ2VG5QLytaM2FyVktsTlRVNFJoeU9YTGx3bkRFT2ZaVStLUXNpemozcjE3M0x0M2o2V2xKYXJWS3RQVDA3enl5aXRNVDAvalBCdEtERW1XWlN3dkw3Tzh2RXkxV21WNmVwcFhYbm1GTUF5cFZxczRaMU9KQjFKVWZVUVloaXpMV0Y1ZVpubDVtUjFUVTFPODlOSkxURTFOa1dVWnp0a2hGTUo2OEtVcGwrWVF3WEVHWmJkN0dCem5NRlFwTkEwUHhHb1Z4em1nMVBCQWd1TWNndUdCRkZVY1oxQ3FTaUUxUE5BRXhYRUdwdXo0MnZCQXJGWnhuTUVwT3d5RktJbGpIT2NnVkNrMERUOXBvb3JqREVLVkhhbmhKN0ZheFhFR29rcVV4QTNEVDc0R3hYSDJwVW9ocFdENFNRTlZIR2MvcWtxaFNjSHdrNlpheFhIMnBleG9VakQ4S0VyaUZJaFJ4WEdlU0MyRnJ5a1lmcTZoVm5HY0oxR3JGSm9VREQvM05hbzR6cDVVS2FSUkVqY3BHSDZ1b2FvNHpsNVVsVUtUSHhsMmlaSzRpV3FLS283eldGWXAvSlVmR1g2cG9WWnhuTWRSVlFxTC9NandTMStnaXVQOGdpcW9wbEVTTi9tUjRaY2FhaTJPOHlpMVNxSEJMb1pIUkVrY0E3RmFpK1A4akNxRkw5akY4SGlMcU9JNHU2bTFGQmJaeGZCNGQ5UXFqdk9RV2t1aEdTVnh5aTZHeDRpU3VJbHFpaXFPOHdPckZPN3dDTVBlRnRWYUhHZUhXa3Roa1VjWTl2YUZXc1Z4MUZvS2kxRVN4enpDc0ljb2lSZFJUVkhGZWJacDMxTDRnc2N3UE5taVdvdnpERk1GMVRSSzR0czhodUhKYnFwVm5HZVg5aTJGMit6QjhBUlJFamRSalZIRmVUYXB0UlJ1c2dmRC9oYTFiM0dlUGRxM0ZCcFJFc2Zzd2JDL20yb3R6ck5IcmFYd0VVOWcyRWVVeERIUVZHdHhuaDFxTGFnMm95UnU4QVNHd2R6RVdweG5oL1l0aFp2c3d6Q1lSYldhb29wejlxbTFvQnBIU1h5YmZSZ0dFQ1Z4Q2l5cXRUaG5uL1l0aFk4WWdHRndON1Z2Y2M0MjdWdFFiVVJKZkpzQkdBWVVKWEVUYUtpMU9HZVg5dnNVUG1KQWhvTzVvMzJMY3pacDMxSm9SRW5jWUVDR0E0aVMrRGFxTWFvNFo0d3EydTlUZUpjRE1CemNIZTMzY2M0VzdmY3BmQlFsY2N3QkdBN3VZN1dhb29wek5xaTFxTlVZK0pnRDhqaWdkaWZkclBsK0ZaZ1RZM0JHbi9aeUNsZWpKUDQ3QjJRNG5OdHFMYWppakRiTit4UVdveVJ1Y0FpR1E0aVNPQVp1YTkvaWpDNjFGclUyQmQ3bGtBeUg5NUZhQzZvNFQxZXYxOE5heTRHb29ubWZ3dFVvaVZNT3lYQklVUkxId0czdFc1eW5ZMnRyaTlYVlZlSTRwdC92Y3hBMjcxUDRPRXJpQmtkUTRtZytVR3NYUkkyUENJK0s0NWpKeVVsODM4Y1lnek1jV1pieC9mZmZrMlVaRDVYTFpRYWwvVDZvTnFNay9vQWo4amlDZGlmZHJQbCtGWFJPak9GUjNXNlh0YlUxMnUwMmVaNVRxVlR3UEEvbmNMSXNZM1YxbFZhclJaN25QRlF1bC9GOW4wR290V2pmcHNBYjdVNmFja1FlUjFUei9TYktIOFNZY1VUWXpWckwvZnYzMmJHMXRVV2FwbXh2YjFNcWxTaVh5emlEeWJLTTFkVlZXcTBXZVo3enFIUG56bkhod2dYMnBZcm1mUXEvaTVLNHlSQjRIRkc3azI3V2ZIOVZWUmZFTSt6bWVSNXBtckxiOXZZMmEydHJaRm5HamtxbGd2TjRXWmF4dXJwS3E5VWl6M1AyOHZ6enoxT3BWTmlQN2VVVVBvaVMrSE9HeEdNSTJwMjBXWHZPWHdDNUtFWjR5UE04TmpZMjZQZjdQQ3JQY3pZMk5saGZYOGRhUzZWU1FVUndJTXN5VmxkWGFiVmE1SG5PZmk1ZXZJaUk4Q1MybDFPNEhTWHhmekpFSGtOUzgvMS9vSHBkakFFUkhsSlY3dCsvejE2c3RXUlpScnZkSnM5enl1VXlwVktKWjFHV1pheXVydEpxdGNqem5FRk1UazV5NGNJRm5rVHpQcWcyb2lTK3lwQjVERW03azhZMTMvZUIzNG94UERRMk5rYW4wMEZWMmMvVzFoYWRUb2VOalExRWhISzVqSWh3MW1WWnh1cnFLcTFXaXp6UE9ZZ1hYM3dSei9QWWkrWjkxTm9tOEx0Mko5MWt5RHlHcU9iNy80UHFIeEFaRnhGMmlBZzdzaXhqVVAxK240Mk5EZHJ0Tm5tZXMyTnNiSXl6Wm0xdGpYLzk2MStrYVVxZTV4elU1T1FrazVPVDdFWHpQbXB0RTNnalN1S1VZK0F4Uk8xT3VsbnovWDlnOVczeFBCNnFWQ3AwT2gxVWxZUGEydHFpMisyU3BpbTlYbzhkWTJOampLcGVyMGVyMWVLYmI3NmgyKzFpcmVVd2pERmN2SGdSei9ONEhNMzdxTFZONEkwb2lWT09pY2VRdFR2cDMydStQNFB5c2hqRERoRmhSNVpsSEphcXNyVzFSYmZiSlUxVHRyYTJVRldNTVhpZXgybG1yV1Y5ZlozVjFWVysvLzU3TmpjM1VWV080dGUvL2pVVEV4TThqdVo5MU5vbThFYVV4Q25IcU1UeGVGZXRuYUV2Z1hpR0hiVmFqYlcxTlhxOUhrZGxyYVhiN2RMdGR0bFJMcGVwVkNwVUtoV3ExU3FWU2dWakRFOVRyOWRqWTJPRExNdm9kcnNNMCtUa0pMN3Y4emlhOTFGcm04QWJVUktuSERQaG1JVDFZQTc0MHBSTElNS09MTXY0NXovL3lVbXBWcXZzS0pmTGxNdGxocVhYNjlIcjlkaExudWYwZWoyT1E2VlM0ZEtsU3hoamVKVG1mZFRhSnZCR2xNUXBKMEE0Um1FOStCQ1JHNlpjNHFGdnYvMldORTF4RHM0WXcyOSs4eHVNTVR6SzluSlFiUUJYb3lST09TRWV4NmpkU1J1MTUvd1psSmZGR0haTVRFeXdzYkZCdjkvSEdad3hoa3VYTGxFdWwva1pWV3plQjlYYlVSSmZiWGZTVFU2UXh6R3IrZjRTcW04Q0Y4VVlkbHk0Y0lGT3A0T3E0dXpQR01PbFM1ZW9WQ3JzcHRhaWVaL0NCMUVTL3lkUGdjY3hhM2ZTelpydi93K3FieU15TGlLSUNCTVRFNnl2cjZPcU9IdXJWQ3BjdW5TSnNiRXhkdE4rSCszYkZQaGRsTVNmODVSNG5JQjJKLzJtNXZ0TFdIMGJrWEVSb1ZRcU1URXh3ZnI2T3FxSzgwdlZhcFdwcVNsS3BSTC9wb3JOKzJDMUNid1JKWEdUcDhqamhMUTc2VGMxMzEvRjZvSVlBeUtVU2lVbUppWllYMTlIVlhGKzR2cytMNzc0SWlMQ1Eyb3RtdmNwZkJ3bDhkVjJKMDE1eWp4T1VMdVRObXUrbjZpMUMySU1pRkFxbFppWW1PRCsvZnRZYTNuV0dXTzRlUEVpenovL1BMdHAza2Y3TmdhdVJrbjhYNXdTSGllczNVbWJOZDlQMU5vRk1RWkVLSlZLVEU1TzB1djEyTjdlNWxsMS92eDVMbDI2UktWUzRTSHRXelRQUWZVMmNEVks0cjl6aWdoUFNWZ1ByZ08zcE9RaHh2RFEydG9hMzM3N0xkWmFuaFhHR0Y1NDRRWE9uei9QdjZtaS9UNXFOUWJlalpLNHdTa2tQRVZoUFpnRC9pS2U1NHRuZU1oYVM1cW10TnR0ckxXY1ZjWVlubi8rZVh6Znh4akRRNXIzVVd0VDRDYndjWlRFS2FlVThKU0Y5V0FHK0lzWUUwakpZemRyTGQxdWwxYXJSYS9YNDZ3d3hqQTVPY212ZnZVcmpERThwSDJMOXZzVWJnTWZSVWtjYzhvSnAwQllEM3pnTDRqTW1aSUhJandxeXpMU05LWGI3VEtxeXVVeWs1T1QrTDZQTVlhSHRHL1JmcDlDQS9nb1N1SUdJMEk0UmNKNjhDRndRendQOFF5UDArdjFXRjlmWjIxdGpWNnZ4Mmxuak9IOCtmTk1URXh3L3Z4NWR0TytSZnQ5Q2czZ295aUpHNHdZNFpRSjY4RU1jRXVNeklqbmdRaDc2WGE3Ykd4czBPMTJzZFp5V3BUTFphclZLaE1URTV3L2Y1NmZVVVg3RnJXV3dtM2dUcFRFRFVhVWNFcUY5ZUJENElaNEJ2RTg5dFB0ZHRuWTJLRGI3V0t0NVNSVktoVXFsUXJWYXBWcXRVcTVYT1pSYWkzYXQ2Q2FBcmVCbTFFU3g0dzQ0UlFMNjBFQTNBQ3VpK2Nobm1FUVcxdGJaRmxHcjlkamEydUxQTS9wOVhvY2hUR0dTcVdDNTNsVUtoVktwUkxsY3BscXRjcGUxRnF3aWxwTG9RSGNpWkw0Tm1lSU1BTENlakFIM0FEbXhET0lNU0RDUVZscjJkcmFZcmNzeTlpdFdxMnlXNmxVb2x3dU15aTFGcXlpMWxKb0FuZUF4U2lKWTg0Z1lZU0U5U0FBYmdBTFlzVEhHTVFZbmlwVjFGclVLcWhTYUFCZkFJdFJFc2VjY2NJSUN1dUJEeXdBN3dCellneUlJRVpBaEdPamlxcUNLbW9WVkNrMGdRYndWNkFSSlhIS00wUVljV0U5OElFRjRIVmdEZ2pFQ0lnQkFSSGhCeUlNUkpVZGFwVWZxRVVWVUtVUUEwM2dhNkFSSlhHRFo1eHd4b1QxNE1Oc2MvUEc1dFltWStVeGpERlV4c1l3eHZCdklvandBN1hLSTVwQUNzUkFBalNCTkVyaUJzNHZsRGg3R3NDTlZwcXlsK3I0T0RzbXF1ZDRibkt5RVNYeEd6aUhZamg3bXRYeGNaNGsyOXdrMjl4a2ZIeWN3aDJjUXpPY01WRVNwd3pBR0VObGJJekNJczZoR1o1UkUrZk9VV2hFU1p6aUhKcmhqQW5yUVdDdFpUK1Y4aGlGditJY2llSHNtZG5hM21ZL1kyTmpGQm80UjJJNGU5N2F5TzZ6bjNLcFJDSEZPUkxER1JMV0F4OVkyTGgvbi8yVVNpV2lKRzdpSEluaGJGbklOamY5UE05eFRvYmhiTG14dnRGbEVIbWVFOWFER1p3ak1ad1JZVDE0ZjJ0N08xanZkaGxFTDg4cEJEaEhZamdEd25yZ0F6ZStiN2NZMU9iV0pvWFhjWTdFY0RiOGFlUCtmVC9iM0dSUUcvZnZVMWpBT1JMRGlBdnJ3WnkxOXZwMzdSWUhzYlc5VFo3blFWZ1BydU1jbW1HRWhmWEFCMjYxT2lsNW5uTlFyVTVLNFFiT29SbEcyNDFzY3pQb3JLMXhHT3ZkTHRubVpoRFdnei9oSElwaFJJWDFZTVphKy83L2Z2OGRSL0cvMzMrSHRmYjlzQjRzNEJ5WVlYVGQ2cXl2a2VjNVI1SG5PZCsxV3hSdWhmVmdCdWRBUEVaUVdBL2UzOXJldnI3NjNiY013L2IyTmlLTVY4ZkgzNno1L3AxMko5M0VHWWhoeElUMXdBZHVmTjl1TVV5dE5HVzkydzJBditBTXpEQjYzdCs0ZjkvUE5qY1p0dS9hTGZJOG53dnJ3UUxPUUF5ajU3M3YyaTJPZzdXV1ZpZWw4QTdPUUF3akpLd0hjMXZiMjM2ZTV4eVhQTThwK0RnRE1ZeVcxRE9HNDNSaDRqeUZHR2NnaGhFU0pYR3pWQ3JGejAxT2NseEtwUktGT3pnRE1ZeWVxNzkrdnBZK056bkpzRlhHeHFpT2oxT0ljUWJpTVdMYW5mU2JtdTh2bmF0VzM1dzRkODVYbE8zdGJZN3F3dm56dlBEci80T0l2QnNsY1FObklNSUlDK3ZCZGVDR3RUYll1SCtmYkd1VFBNL0pOamZaanpHR3l0Z1lFOVZ6VEp3N1I2bFVpb0VQb2lSZXhCbVljQWFFOVdBR21BTmVCMmFBd0ZyTDF2WTJqMU1aRzhNWVE2RUJOSUcvUmttOGlITmcveDlUSnlZNWRhSUVFd0FBQUFCSlJVNUVya0pnZ2c9PVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcIndpZHRoXCI6IDcyLFxyXG4gICAgXCJoZWlnaHRcIjogODksXHJcbiAgICBcInVybFwiOiBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBRWdBQUFCWkNBWUFBQUNkWjJKNUFBQUFBa2xFUVZSNEFld2FmdElBQUFxc1NVUkJWTzNCVzR4YzlYM0E4ZS92ZDg3c3hSN1A3dGhlZzEweng4eTZYSXFoQmhRb2NWSUw2cW92aVJ5SkJxblVsZE1HS1ZMYWg2cjBJVlVMcUlCUXF6eFVLR3JvN1FGUUZFU0NtaVp0S1pJeGNXVnRTMXMydFFxbVFMeFR6c0ZoRnhzemUyWjNkcTduLyt1YTJORXdIbnZYMkx2TVhqNGZZWkhsYzhIMUFqY0IxeHV5SFd3VElpcUMwc3B3WnVaQVRnaDJ6T0IvQkk2TVJXR0JSU1Fza0h3dTZBTStEN0pYbEMySWJoWmhHMGdmQW9od1VjekFqRm1uekNpWWN6Rm1oNEIvS0VUaFVSYUljQm5sYzhHdkFiOGpudVpGWkFjaWZZaXdZTXpBRERQN3NUbjdNV2JQRktMd1cxeEd3aVhLQjhIblFiNnNxanNSQ1ZEaEUyT0dPWnN3NTQ2QWZiTVFodi9JSlJJK3BueHUyNE9pOGtWUjNZRUtYY2NaNXR4cjV0d1BnRWNLVVZqbFl4QXVVajRYZkU1VS8wdzh2UUVSdXA0WjV0dzdscmp2RnFMd2ZpNlNjQkh5dWVBSjliMHZvZHJIVW1PR0pjbC9tN045aFNoOG5Ya1M1bUU0RjJ4RzVGdmllM2Nod2xKbXplU0VPZmNuaFNqOFcrYkJZdzdEdVdBenFpOUp5djhVSWl4MW9ycFdrTHNHTTVuZVlod2ZZZzRlRnpDY0N6YWorcEw0M25Vc0p5bzlJckpyTUpOSkZlUDRoMXlBeDNua2MwR2ZxTHdrdm44akhmVDM5N052M3o3dXZQTk9naUJnY25LU3Fha3BsZ3dSRmVUMmJDWXpWWXpqLytBOGhQUElCOXUrcHluL0MzU3dmZnQyN3IzM1hyTFpMSzBtSmlZNGV2UW9CdzhlcEZLcHNCUlk0b3FXSlBjVW92QkZPdkRvWURnWFBLeSsveFZFYUxkOSszYjI3OS9Qd01BQTdkTHBOUGw4bmwyN2RqRTBOTVJiYjcxRmtpUjBNMUhweC9oTU5qUHdOOFU0YnRMR284MXdMc2pqZVg4bm52YlRadVBHamR4MzMzMWtNaGt1eFBkOXRtN2R5aTIzM01MTEw3OU1raVIwTTFITm1yUHJpL0hrZDJpanRER1JiNHFuV2RwNG5zZisvZnNaR0JoZ1BtcTFHaSs4OEFMMWVwMmxRRDNkbTg4RnYwVWJwVVUrRit4UlQzK0ZEdTYrKzI2MmJ0M0tmRXhQVC9QMDAwL3p5aXV2c0dTbytxSjZQMjJVRmlMeVI2ajZ0TG5tbW11NDdiYmJtSTlxdGNwVFR6M0Y2NisvemxJam52NWlQcmZ0UVZvb1orUnp3YTNpNmFmcFlPL2V2WGlleDF3YWpRYlBQZmNjeDQ0ZFkwa1NRVlIrZ3hiS0dRSi9nR29mYlhidjNzMldMVnVZandNSERqQTZPc3BTSnA1ZWw4OEZ2ODBaeWxtZTNrb2J6L1BZdlhzMzgvSHFxNjl5NE1BQmxqd1JST1JMbktITXl1ZUN6NHJvdGJUWnRXc1gyV3lXdWNSeHpEUFBQTU95b1hyYmNDN1l6Q3pscDc2TUN1MXV2LzEyNXVQZ3dZTlVLaFdXQzFIcE0vaDlaaW16UlBYbmFUTThQTXlXTFZ1WXkvSGp4emw4K0RETGlnZ2k4a3ZNVWs0VDJVYWJPKzY0Zy9rNGRPZ1F5NUxxZGN6UzRWeVFGMkVMYmE2Kyttcm1jdUxFQ1VaSFIxbU9SR1JUUGhmY3JnWTdFYUhWVlZkZHhmcjE2NW5MbTIrK3liS2x3cXc5S25BVElyUzYrZWFibVkvRGh3K3pySW5zVmtPMjArYUtLNjVnTGhNVEU1dzhlWkxsVEVSNkZHd1RiUVlIQjVuTHFWT25XUFpFMWlrZERBd01NSmYzM251UDVVNkVqVW9IYTlldVpTN0hqeDluQlZpcmRGQXNGcW5WYWx6SXlaTW5XUUUyK0hUdzhNTVBjMW9taytIR0cyL2toaHR1SUFnQzFxeFp3MW4xZXAyVndCZWh6bm1VU2lWR1JrWVlHUm5COHp4Mjd0ekpqaDA3R0J3Y0pFa1NWZ0xKNTRLdmEwL3FEMWwxTHVmS0NoUXdWblYyU2dYZUFtUFZ1Y3dvcWNHUE1HTlZKemFsaFNnc212RU9xODVoem1hVUQ5azdyRHFYV2FUTXNzVGVZOVZIbVRIcmdQSWhleDR6VnJWdzFoUTRwTXdTK0dmTW1xejZHY09PalVYaHVESnJMQXJIemRscnJQb1pjMVpnbG5LR09mYzJxMzdLRE14K3dDemxEQkY1RWpOV2dUa3JBMDh4U3psakxIejcrK2JjQkt2QXVkRkNGRmFacGJRd1owZFk2Y3d3czI5emh0SkN6SjdFakpYTW5QdEpJUXIvbWpPVUZtTlIrQ3pPUWxheXhQMHJMWlEyTGtuK2t4WEtuQ3NERDlCQ09kZWY0MXlURmNnU2QyZ3NDZ3UwVU5vVW9uRFVuUHNSSzR3bExzYnNJZG9vSFpqWnR6RmpKYkVrK1pkQ0ZJN1NSdW1nRUlhUDQ5ei9zVUpZa2t3QVg2VUQ1VHhjNHI2SHNmeVpnYk52RktLd1NBZksrVDFxTG5tZlpjNmF5YitQaFc4L3hua281MUdJd3FJbDd2c1lTNWFaTVRNemc1blJpVFdURTVqdDR3S1VDL3M5YzhrN25GR3BWSmljbktUUmFORE56SXpwNlduQ01HUmlZZ0lSNFJ6T05YSHVzYkVvTEhBQkhoZFFqT05tTmpNd0pLcWZSUVFSNGQxMzN5V09ZNUlrd2ZkOWZOK25XNWdaNVhLWjhmRnhTcVVTempuUzZUVHBkSnFQTU1NMWt5Y0tVZmdRYy9DWVF6R09EMllIQnI4b3FwdFVsVnF0UnFQUm9GYXJVU3FWcUZhcitMNlA3L3VJQ0o4RU02TmNMak0rUGs2cFZNSTV4MWxEUTBPa1VpbGF1V2J5ZkNFSzl6RVBIdk9RelF4RUluSVBJdXI3UGxOVFU1elZhRFNZbXBxaVZDcWhxcWdxbnVleEdKeHpsTXRseHNmSEtaVktPT2RvMWR2YnkvcjE2eEVSenJKR2N3U3p6eFhqdU1rOGVNeERNWTdmR2x5WHVWWTg3NlpVS2tXMVdxWFJhTkRLekppWm1TR09ZOHJsTXFyS2FaN25JU0pjVHJWYWpWS3B4UGo0T05QVDB6am42T1RLSzY4a2xVcHhsaldhSTJhMnB4Q0ZWZVpKbUtkOEx1Z1QxU1BpZTlmVzYzV2lLR0krVkpYKy9uN1M2VFMrNzNPYXFqSWZ6amxhVmF0VnBxYW1xTmZyekdYRGhnMWtzMW5Pc2taenhNejJGS0t3eWtVUUxrSStGK3dSei91T2VKcU40NWlUSjAvU2pRWUhCOW00Y1NNZk1zTTFrK2N4dTdzUWhWVXVrc2RGS01aeEladkoxRVJrVDE5L3Z6cm5xRmFyZEpOc05zdUdEUnNRRVhDdTZackpFNFVvM0ZlTTR5WWZnOGRGS3NieHk0UHJNbXRGOURQOWE5WmdabFNyVmJyQjBOQVEyV3dXRWNHYXlRa1M5MEFoQ2gvaUVuaDhETVU0Zm5Fd2s5bWtxcC9xWDdNR1ZhVlNxZkJKNmVucFlmUG16YVRUYVhDR05aTWZZclozTEFwZjRCSUpseUNmQ3g1WDMvc3FxbjYxV3VXRER6NWdabWFHeFNJaWJOaXdnVXdtZzZwaVNmS09KZTZ2Q2xINEdKZUpjSW55dWVCcjRubGZFMDhIbUZXcjFTaVZTc1J4ekVKUlZkYXZYMDg2bmNiM2ZTeHhzU1hKM3dQM0Y2S3d5R1VrWEFiNVhMQkhWUDlDUE4yQkNLYzFtMDBxbFFxVGs1UFVhalV1bGFxU1RxZFp0MjRkdmIyOXFDam0zUHVXdUJjRisrT3hLQ3l3QUlUTGFEZ1gvQ1dlZDQ5NHVwRVc5WHFkZXIxT3VWeW1XcTNTYURTNEVOLzM2ZTN0cGJlM2wvNytmbFNWbnA0ZVJBU2NZYzY5WnM0ZEJQNjBFSVZGRnBCd21RM25ncnpCSStMcFhhSjZKU0owMG13Mk9TMUpFazd6UEkvVFBNOURSUGdJNXpDejF5MXhSNEZ2RktMd01JdEVXQ0Q1WE5DSDhCVkJ2b0RxZGhHMklnckMrUmxnQmxqVnpJNlpzL2N3L2czczJVSVVIdVVUSUN5U243dHk4OGgwdWZ6cG5wNFV2dWVEZ0tkS1Q2cm5DSEFTK0YvZ0RaRC9La1J2djBLWDhGa2t2VDI5NVo5TWpOUHFpbzFEOUtSNjdpdEU0U2hkU2xrMFJnZHZGS0p3bEM2bUxKS1pTaVZMbTFRcTlTNWRUbGtFK1Z4d3EzTnVKMjE2VXFtRUxxY3Nnc1M1UnlhblNqNXQ2bzJHVDVkVEZsZytGL3o2VEdYbVYrdjFPdTBhelVhZUxxY3NvSHd1NktzM0dvK2VLaFo5T3FqWDYwRSt0KzFCdXBpeWdNenM4WGlxZEsxemprNktjVXlsV3ZuZGZDNzRCYnFVc2tEeXVXRFhUS1h5bTFQVDAxeklxY25pcGtheitXdytGL1RSaFpRRjBtdzJIejQxV1Z6TEhPcjFPaDlNRm5jNDU1NmtDeWtMWURnWDVLdjEyaTgzbTAzbW96d3p3MHkxY2h0ZFNGa1lGUlZ0Y2hGOHozK2ZMcVFzZ0xFb0hGK3pwdi9yVjJ3Y3F2YjA5RENYOVlOWitucDdSK2hDd2dMSzU0SmJ6ZXlCbVVybGFsVzVwcGtrZlVuaU9NM3pGRSs5MlBPOE4zcDdlLytwRUw3OUtGM28vd0VRZVprZzhzeENaQUFBQUFCSlJVNUVya0pnZ2c9PVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcIndpZHRoXCI6IDM2LFxyXG4gICAgXCJoZWlnaHRcIjogNDUsXHJcbiAgICBcInVybFwiOiBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQ1FBQUFBdENBWUFBQURHRDhsUUFBQUFBa2xFUVZSNEFld2FmdElBQUFVOFNVUkJWTTNCVFlqY1p4M0E4ZS92ZWY0N083dVpmWmxNMWlTTU03czdDYWdKS21rd2dSSkZFakdJZUxFOXRKUWdSbnVRSElvVlBDZ0l2UWhhQkZ0TEwrSkpVbkxwd1lKQzFycEt3S2FrSkFlM29GWHo3N3hRTmN2c3p2NW5aMmZuN1hsK3p1b1VoaVV4dTNIMjVmTVJ0aUdYbmY0a3dwTmk3TWNScGtCU29CT0E4RjhLRW9FdW9WcjB6aStJNmkvRFVuR1JMUkllSXBlZC9xWlkreFdFVDR0SUJoSERWcW1pcXV2QVg5WHIyM2ozVWxncy9wbi9RWGlBM1BUTWQ4V2FaMFhrT0NJTWducGRRLzFiMm5FdmhhWGlyN2tQWVpOY0pqc21nYjBxeG53WkVjTU9VTldhZHR6TFlTSC9mVGF4OU1sbHNtTVNCRytLdGVjUkVYYUlpTVRFeU9QSmljblp5c3JLcitoajZYTXdsZnFOV1BOWnVoS0pCSmN2WCtiaXhZdGtNaG1xMVNwUkZERXdJa1pFUGpVNU1UbGVXVm1abzhmU2s1dVovWW14NWhsRWlNVmlYTGx5aGRuWldVWkhSMG1uMDV3NWM0YVptUm51M0xuRHdJZ0lJbzhseDhiemxTaGFvTXZRbGN0a2o0dVJyeVBDaGt1WExwRk9wK21ucWhRS0JWU1ZRUktSdUFUMmUvUVl1c1RhSDRneFNick9uajNMeVpNbjZlZTlaMjV1anV2WHI3TVRST1JFYm5ybUJib01HNHg4bnA0TEZ5NGdJdlM3ZmZzMmMzTno3QmdSeEpxdjBtVnltZXpUSXBLaDY5eTVjMHhOVGRHdlhDNXo3ZG8xZHB6SWlWd20reVdEdGVjUlljUHAwNmZaYkg1K0h1ODlPMDFFRE5ZK1ljVElNYnBHUmtaSXA5UDBXMXBhNHViTm0rd1dNZVpqQmlSRjE2bFRweGdhR3FMZjNidDMyVjJhTWFEamRCMDllcFROOHZrOHUwb2tZZWdaSGg3R2UwKy9NQXpaVFFMajltQXkrWnlJSkJjV0ZwaWZuNmRjTHJNaENBSnUzTGhCdTkxbUYxazVsanQyUzR4OGh2MUF0VzVBcSt3VHFsU05xb2JzRzdwcTZQZzdxTEl2S0NVRGVsVlZhK3dEcXY1ZEU1YUtxOERmMkdPcTZuRCtxcUZMdmIvRlhsUDlTMWdxM2pKc2NQNVZWQnZzSmU5L1I1ZWhLeXdWLzZTcUMrd1I5YjZzenI5QWw2RkhuWHNkVmZhQ2VuMDlMQldYNlRMMGhJWENqMVMxd0M1VDcvTTQ5MjE2REgzVSt6ZFFkb3lxNHB6alE2cmEwbzU3TVN3VjEra3g5SFArZVZWZjZIUTZWQ29WV3EwV2c2Q3FOQm9ON3QyN1I3UFo1RDlVd2ZuWHdtTGhWZnBZK2xTcWtVK09UOFJzWUw5UXE5VmtjWEVSNXh6R0dLeTFpQWpib2FvMG0wMldscFlvbDhzNDUwaWxVaGhqVUs5djNzMi8vd1NiV0RhcFJDdC9URTRtUHpjVWk4MUdVVVN6MldSMWRaVnF0Y29HVldXRHF1Szl4M3VQOXg3dlBkNTduSE00NTFoZlg2ZGNMck84dkV5cjFXTEQ0Y09IaWNmanFITi8wSTY3V0tsR25rMkUrOGhsc3NkbEtQanRhcTAyczdpNHlDQk1UVTB4TVQ2dTZ2MGIybkZQaHFWaWgvdXczRWVsR2kwbkUyUHZEWS9FdnhnRXdZRjZ2YzZqc3RaeTVNZ1JFZ2NTa1RyMzB6Q2ZmN1pTalR3UFlIbUFTalg2ZXpJeDlsNThaT1R4UkNJeGFZeWgwV2l3VlNKQ0twWGkwS0ZEbmVGWTdJYTJPOThLaTRWZjhCRENRK1F5MmVNUzJGY3c1cnh6YnFqUmFGQ3YxNm5WYW5qditaQXhobmc4enVqb0tMRllqT0doMkpveDVoMTE3dWRoc2ZBYVd5UnNVUzZiZlZxcy9Sb2lwMFRrSTRqZ3ZjZDdqeEdEaUhqUWZ3SHZxL052NC8wcllhbVlaNXVFUjNEb1lLclFjWjFzTEJnaU1YcmdaVVRmUWVYM1lhbndBZituZ0VmZ25UTXJVY1RrK1BnL3cxTDVPUWJJc0UzVEg4MThvOWx1cGVteXhyWVlNTU0yNURMWllLMis5cDIxZWwzb2FuZmFoM09aNlFzTWtHRWJHcTNXejZxMTJpZm9xZFpxOGRYNjJvOXptV3pBZ0JpMktKZkpIbHh2ckQvVmFyWG90MUtOSG11MG1pOHlJSWF0YTFzYnJGcHI2UmZZQUdOc3hJQUkyNURMWk5QTmR2djVUcWQ5b3QzdTJDQUlXc1BEdzIrVi92SEJEeG1RZndQL3oyRzNTRGZGS3dBQUFBQkpSVTVFcmtKZ2dnPT1cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJ3aWR0aFwiOiAxOCxcclxuICAgIFwiaGVpZ2h0XCI6IDIzLFxyXG4gICAgXCJ1cmxcIjogXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUJJQUFBQVhDQVlBQUFBR0F4L2tBQUFBQWtsRVFWUjRBZXdhZnRJQUFBSmFTVVJCVktYQnZXc1RjUmdIOE8venU0czU4c2ExYVkzV0ZwSW9FdnNtNlJad2NGS2M2aXBJSmwvUXpVbW9GZndEc2dqYXhVMkhJb2hMY2RCc0dTcUtCSEZRVURpYU5pR21VQzluWHNpOVBpYllvVWhxMC9Ueklmd2pHVS9jSVVHWFFIUWFRQlJBRUgrMXdMek56Ti9nOFN1dHRQRWFleEIySmVQeExBbnhrSWpPZ0FqL3c4d3VtRCt6NHk1cG02VjM2SkxRbFl3bmJwQWtQWjZibnorWlhsaEF0VnFGYmR2WUR4RUpJcHFBRUpkSEl1cFgzYWova0pLVFUxR1NwWmZUTXpOajJXd1dxVlFLcVZRSzYrdnJPQWdSQlVGSTY3cStJdUNUbDBtSVU0dUxpL0Q3L1dnMm0xaGRYY1dnaUdnNm1VZzhFa1IwSVpQSklCYUxvU2VmejZOU3FXQmdSQ0FTVndTSUptWm5aOUdqNnpvS2hRSU9qUkFYQUFLcXFxS25WcXRoU0tvTXdNN2xja2luMDVCbEdjTWdRSklCMUpsNXZGZ3NZbGdNTkFXWVN6aTZtbURtRHpnaVp2NGlZRHRQbU5uQWtKalpodXMrRjFwNTZ5ZVkzMk5ZekFXdFZGb1Q2R0xYWGZFOHIyUGJOZzdDekRCTkU2N3JncG0zMlhhVzBTV2hTemVNNzZQcVNMcHVHTlB0ZGh0RUJDSkNEek9EbWVGNUhpekxRcjFlUjd2ZFJqZ1VNdGpqKzlwbWFRMWRNbmF4YmQ4T2g4Sm5kMzd0ekZVcUZld25IQTRqT2hvdHMrY3RhUnNiTDdDTHNFZHljdXFjSjRsbnBtVmxXcTJXYURRYVlHYjRmRDRFZzBFb2ZrVlhGT1d0Y04wSFdubEx3eDZFUHBMeCtGM1g4MjY1cm5mZUo4c2ZTWWdxd0o5Z08wKzE4cGFPdzFBamtUZWhRTURBZ0FUNm1JaWR1R3BhMWtYYmNVTEh4OGJ2WVFBQ2ZYUk04MXJITkFPbVpZbE9wM01kQTVEUmh4b0szVHptazR1TzQwWVVSY24vYmpad2tEL3FiQkM3UVhZZDNRQUFBQUJKUlU1RXJrSmdnZz09XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwid2lkdGhcIjogOSxcclxuICAgIFwiaGVpZ2h0XCI6IDEyLFxyXG4gICAgXCJ1cmxcIjogXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFrQUFBQU1DQVlBQUFDd1hKZWpBQUFBQWtsRVFWUjRBZXdhZnRJQUFBRU9TVVJCVkgzQnZVckRVQmdHNFBlY3BBMnRZRjB6eEpCc2puYlNOWnVkWFp6MUhsVFF4VjI4aFU0VnZBTUpkQkRzUGVpUUhwUU0wZ2FUMUtUNTZUbWZEaG1LMEQ0UHd4L1hjVzRZNTZjQTlnRjBBT1FnQkVScUZFeW5EOHgxbkx1VHdlRGFORTE5T0J4aUhSRlZwTlF0dHl6cnpQTThQUXhEL01jWWF6UE96L2xodjI4V1JRSGY5N0dCcmMxbXMwc2hoQkhITVRZZ0RpQVVRbUNMTDA1RUUyeEJSQzhjcTlWOVdaVHpxcXFnbEFJUlFVcUpMTXVncEh4SFZWOXAzMGt5Mzl2dHJiSThQNDZpeUlpaUNGTEt1dDFxdmJZMDdTTDQvSGhqYUxpMmZaUXRsNC9kVHZlSk1Ud0hRb3pSME5GSTBzVkIrck93eXFLTTR6UVpZNDJPUm0rbk8rS00xWWJSbnNScGduVy9rSnVFaHJESi9Pd0FBQUFBU1VWT1JLNUNZSUk9XCJcclxuICB9XHJcbl07XHJcbm1pcG1hcHMuZm9yRWFjaCggbWlwbWFwID0+IHtcclxuICBtaXBtYXAuaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgY29uc3QgdW5sb2NrID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggbWlwbWFwLmltZyApO1xyXG4gIG1pcG1hcC5pbWcub25sb2FkID0gdW5sb2NrO1xyXG4gIG1pcG1hcC5pbWcuc3JjID0gbWlwbWFwLnVybDsgLy8gdHJpZ2dlciB0aGUgbG9hZGluZyBvZiB0aGUgaW1hZ2UgZm9yIGl0cyBsZXZlbFxyXG4gIG1pcG1hcC5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4gIG1pcG1hcC5jYW52YXMud2lkdGggPSBtaXBtYXAud2lkdGg7XHJcbiAgbWlwbWFwLmNhbnZhcy5oZWlnaHQgPSBtaXBtYXAuaGVpZ2h0O1xyXG4gIGNvbnN0IGNvbnRleHQgPSBtaXBtYXAuY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcclxuICBtaXBtYXAudXBkYXRlQ2FudmFzID0gKCkgPT4ge1xyXG4gICAgaWYgKCBtaXBtYXAuaW1nLmNvbXBsZXRlICYmICggdHlwZW9mIG1pcG1hcC5pbWcubmF0dXJhbFdpZHRoID09PSAndW5kZWZpbmVkJyB8fCBtaXBtYXAuaW1nLm5hdHVyYWxXaWR0aCA+IDAgKSApIHtcclxuICAgICAgY29udGV4dC5kcmF3SW1hZ2UoIG1pcG1hcC5pbWcsIDAsIDAgKTtcclxuICAgICAgZGVsZXRlIG1pcG1hcC51cGRhdGVDYW52YXM7XHJcbiAgICB9XHJcbiAgfTtcclxufSApO1xyXG5leHBvcnQgZGVmYXVsdCBtaXBtYXBzOyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQSxPQUFPQSxXQUFXLE1BQU0sbUNBQW1DO0FBRTNELE1BQU1DLE9BQU8sR0FBRyxDQUNkO0VBQ0UsT0FBTyxFQUFFLEdBQUc7RUFDWixRQUFRLEVBQUUsR0FBRztFQUNiLEtBQUssRUFBRTtBQUNULENBQUMsRUFDRDtFQUNFLE9BQU8sRUFBRSxFQUFFO0VBQ1gsUUFBUSxFQUFFLEVBQUU7RUFDWixLQUFLLEVBQUU7QUFDVCxDQUFDLEVBQ0Q7RUFDRSxPQUFPLEVBQUUsRUFBRTtFQUNYLFFBQVEsRUFBRSxFQUFFO0VBQ1osS0FBSyxFQUFFO0FBQ1QsQ0FBQyxFQUNEO0VBQ0UsT0FBTyxFQUFFLEVBQUU7RUFDWCxRQUFRLEVBQUUsRUFBRTtFQUNaLEtBQUssRUFBRTtBQUNULENBQUMsRUFDRDtFQUNFLE9BQU8sRUFBRSxDQUFDO0VBQ1YsUUFBUSxFQUFFLEVBQUU7RUFDWixLQUFLLEVBQUU7QUFDVCxDQUFDLENBQ0Y7QUFDREEsT0FBTyxDQUFDQyxPQUFPLENBQUVDLE1BQU0sSUFBSTtFQUN6QkEsTUFBTSxDQUFDQyxHQUFHLEdBQUcsSUFBSUMsS0FBSyxDQUFDLENBQUM7RUFDeEIsTUFBTUMsTUFBTSxHQUFHTixXQUFXLENBQUNPLFVBQVUsQ0FBRUosTUFBTSxDQUFDQyxHQUFJLENBQUM7RUFDbkRELE1BQU0sQ0FBQ0MsR0FBRyxDQUFDSSxNQUFNLEdBQUdGLE1BQU07RUFDMUJILE1BQU0sQ0FBQ0MsR0FBRyxDQUFDSyxHQUFHLEdBQUdOLE1BQU0sQ0FBQ08sR0FBRyxDQUFDLENBQUM7RUFDN0JQLE1BQU0sQ0FBQ1EsTUFBTSxHQUFHQyxRQUFRLENBQUNDLGFBQWEsQ0FBRSxRQUFTLENBQUM7RUFDbERWLE1BQU0sQ0FBQ1EsTUFBTSxDQUFDRyxLQUFLLEdBQUdYLE1BQU0sQ0FBQ1csS0FBSztFQUNsQ1gsTUFBTSxDQUFDUSxNQUFNLENBQUNJLE1BQU0sR0FBR1osTUFBTSxDQUFDWSxNQUFNO0VBQ3BDLE1BQU1DLE9BQU8sR0FBR2IsTUFBTSxDQUFDUSxNQUFNLENBQUNNLFVBQVUsQ0FBRSxJQUFLLENBQUM7RUFDaERkLE1BQU0sQ0FBQ2UsWUFBWSxHQUFHLE1BQU07SUFDMUIsSUFBS2YsTUFBTSxDQUFDQyxHQUFHLENBQUNlLFFBQVEsS0FBTSxPQUFPaEIsTUFBTSxDQUFDQyxHQUFHLENBQUNnQixZQUFZLEtBQUssV0FBVyxJQUFJakIsTUFBTSxDQUFDQyxHQUFHLENBQUNnQixZQUFZLEdBQUcsQ0FBQyxDQUFFLEVBQUc7TUFDOUdKLE9BQU8sQ0FBQ0ssU0FBUyxDQUFFbEIsTUFBTSxDQUFDQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztNQUNyQyxPQUFPRCxNQUFNLENBQUNlLFlBQVk7SUFDNUI7RUFDRixDQUFDO0FBQ0gsQ0FBRSxDQUFDO0FBQ0gsZUFBZWpCLE9BQU8ifQ==