/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
const mipmaps = [{
  "width": 148,
  "height": 101,
  "url": "data:image/png;base64,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"
}, {
  "width": 74,
  "height": 51,
  "url": "data:image/png;base64,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"
}, {
  "width": 37,
  "height": 26,
  "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAaCAYAAAAwspV7AAAAAklEQVR4AewaftIAAAPlSURBVM3BW0xbBQCA4b+Hc1oOkyIMWqBQLgPk5gaEgNlcQSZDYgYOSAZxos7Li+xh+ibxkqgP7mHqwxQ1Jhr1YZqYSTLGboyhyGJIDDI37kUK5dKxpp3QYluO4cFkIUtpoST7PpWiKH1AIg8QEUgEjDxABELA7Yb2dhsuF0Gx2+0MjQ2xnkAIhIV5mZu7yPW+qwTK4XTwdG8NZ2Z+YD2BEBgaukVDfTV5+XlcvnSJjSwsLtDSf5yDEU/yUuYx1hMIgdnZWWJ2xqDT6SgoKOBCZyeKonA/lnkLzw28QLFQTOv+N0lKTGI9gS2y2+3E6/X8LzYujpLSUjo6OvD5fKxxOhysGZ4cpvGvZzkqN3Hc1IIkSdyPyBb9OTDA3n37uFd0dDQmk4kLnZ3kx8cjNzZx8eO3OaZ+h9NRH1FbUoM/AluwurqK1+dDkiTWi4yMJC02HrH1JAP7l2nSvMEnthZqS2rYiMgWjI6MkJ+fz71stgXc7jnc7pv4pGt4Tw8wfONfOttkHj3Xynh0Nruqq/FHZBOWlpaQZZnBwQFKH9vF1NQvCMJN4Czh4X+gUlUQEVHFXfsjzHZmYHIbMLraUeJ+x3fnDhsRCdL4eBcq1VvI8iLlT4zjch1CEExACYrSgCDEk5QUwxqDAUYdV1AmV1msbGDl5SPkHK5lIyJB8Hg8SJKW5eVX6O9XqKqqIzY2Cn8yKw8wcq0Ht7ST3L1FBEIkCJIkYTQWA8XMzFwhKiqKQGSVmQiGwCZMTEyQmZnJdhEIgNVq48sv/mZsbBqPx4N5wozRaGS7iASgu3sFlZBCXx+cOjVHWmoM2dkLGJJ0OJ0Opqa+QpJWSUh4Fa1Wy1YJbGB52cX58+EkJIDFApOT8XzWVsgzh+/S0/MubnceGs11wsJ2o9VqCQWRDfT33yYrKxmPB6xW0OluceLETxQUfMD8/Ot4PF1kZGSiUqkIFQE/FEXh57MCOTkwPQ39GScxvPg448LnHHjtDD5fMwZDFiqVilAS8WNkZJZll54dO2BmBpTBOtqsu3Gk3kBz9EMKbGPUXzZRHllGvjaPlIdSMOgNqNVqtkLEj+6rSxQViSwugtUKK9MZ0JcBjqfo6j1CaroGi32K0X9GOWfr4FvLj0hDYTSq69B5dBxMr2RP+h6CJeJH8/NJmM0WfuuF+flYnE4ZtxvKyxYoLNSjVqvRx+koppgmmnh/5T2sC1bMTjPfmb/HN+EjKyELWZYJhogfsiyTm5tMbi4cqrlN76+LfP2NQHOzF7VazXoajYa05DTSSKMir4LNEgmQXh9LXT3U1Hrxer1sJxH4FHiYAImiiCiKbKf/AK2VWv4PqVi9AAAAAElFTkSuQmCC"
}, {
  "width": 19,
  "height": 13,
  "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAANCAYAAABLjFUnAAAAAklEQVR4AewaftIAAAGcSURBVKXBPWsTYQDA8f89z3MkuctLDZirMW0SM5RCQVEEwZdFKOJah266GPoR/Bg6+wVcuzkpdKlLW5pkiKdCbaBtaEFDzfXaa+6xGQLH0TSCv5+hte4AGf7fZwVkgBxjnJ9rvqy3efR4nrj2fhtTmNScGhdswQTd7h5375VxXRetNSOtvRZbB1uUpkqMKCYIggDLsqhWq7iui9P3aCZ/0dMnLN9ZxjAMRgRX8DwP27YZ8v0/pNQBXzdf462+5enNhxiGQZRijKOjDfr9BkJoOh2DdNrBnipiyzfMHn+DwYA4xSXCMETKPL7/gLm5eaKspVto4xmpTJo4Rczp6Rnd7gmmmaRcvkFcKptlHEVMo+HTauVYWxuwsrJDsfiJROIJhcICkygitNZsb8O+1+X28/f4Z9MUCq9IJCz+hSJid7dHGOZorpt8tJZ4V2/yo/EBKRXl/CwzyRlq0zXGUUSUShkWF48ZurZxnZf3XyCEIAxDDn8fstP7SWVQQUrJZRTQAGwuSCmpVLLU6xAEAUIIhoQQOHkHJ+9whe9/AQOthdJiuqIBAAAAAElFTkSuQmCC"
}, {
  "width": 10,
  "height": 7,
  "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAHCAYAAAAxrNxjAAAAAklEQVR4AewaftIAAAC3SURBVG3BsWrCQBzA4V/uLj0PhzoUF0E6dBBKsS+UF+izuLm5dy04O7n5AE7iIKKLOCSDpxe8/k0ghQz9vkREcsDSyPMLvV6Xmg+eJElwT25iAAt0aIiUnM9X1G9gF058DsZUjKKlKLbEuAPZs/+e8vEyQilFzdDwviQER7//Ru35653UWv4oKiLCzzywWG4oii211FraFJXb7Y7cNbEz5OAD6+MaEaHNADPnUpNlKTG+orXmH6sHF59C07rkqZsAAAAASUVORK5CYII="
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsIm1pcG1hcHMiLCJmb3JFYWNoIiwibWlwbWFwIiwiaW1nIiwiSW1hZ2UiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwib25sb2FkIiwic3JjIiwidXJsIiwiY2FudmFzIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwid2lkdGgiLCJoZWlnaHQiLCJjb250ZXh0IiwiZ2V0Q29udGV4dCIsInVwZGF0ZUNhbnZhcyIsImNvbXBsZXRlIiwibmF0dXJhbFdpZHRoIiwiZHJhd0ltYWdlIl0sInNvdXJjZXMiOlsibGFiTmF2YmFySWNvbl9wbmcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgKi9cclxuaW1wb3J0IGFzeW5jTG9hZGVyIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9hc3luY0xvYWRlci5qcyc7XHJcblxyXG5jb25zdCBtaXBtYXBzID0gW1xyXG4gIHtcclxuICAgIFwid2lkdGhcIjogMTQ4LFxyXG4gICAgXCJoZWlnaHRcIjogMTAxLFxyXG4gICAgXCJ1cmxcIjogXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUpRQUFBQmxDQVlBQUFDcjhzcG9BQUFBQWtsRVFWUjRBZXdhZnRJQUFCZ2VTVVJCVk8zQkQzUmNkWUhvOFc4bWt6KzA1RGNYRkxCMGJBZnJTODJnbXl0eGFWMWRNdmpJeUVLVmtOelYxcXBNd3JxZ1p6WHRRcmZ2SE51bW9laDdKZVdrWFhsMkVlMU1mVUFMVGtLSzRPS2tiaWNLbW5xMnh4dWdpVlpjcGpnVkZJcTNON1M1ZitiZSswejNVRnBzU3kxcE1rM3Y1MVBpZVo0RXlQaDg0eUFJeU1BT2ZMNXhFTURuRzBjQmZMNXhGTURuRzBjQmZMNXhGTURuRzBjQmZMNXhGTUQzbG5JNXlPWHduWUlndnBOYXVoUm16K2F3dlh1aHF3dmZTUVR3blZBMkMvWDFFSXZCdkN1SHFLK0hiSllwU1ZWVlVxa1ViMWNRMzBsSkVteThaeGsvMnA3bXVnV2RYUEVoaGJPWnBtbW9xb3FxcWd6KzVtblUwZDJvaDNiRDNETGtuWE5JSkJLOEhVRjhKeVRMc0d4Wm5oM2IwNHo1d1dQTGtHWCtST0ZzMWRMU1F1K2NIUkNyaEw4dDViK0ZZSS9OVGFIUDhuWUY4SjJRSk1FSEx1OW16TEwvdFlXYWFKU3YzN21Nbm5TYXMxVmJXeHZzTW1GR0tjZjQvaUVTaVFSdlZ3RGZTZldrMDlSRW85eHk2M3dlMkxxRm1taVVmN2w5R1QzcE5HY2JWVlc1Y2NNaWFKZDRzMGJwV2lSSjR1MEs0RHVodmt5R2ZENVBTMnNMWTRRUVBMQjFDelhSS1A5eSt6S1czNzZNczBWdmJ5OVgzMzA5Mm9vQVZBVTRSdGJnaGlzWE1CNEMrRTVvZTZhUE1kZkU0N3hPQ01FRFc3ZlFFSS9UblU2ei9QWmxGTHRVS3NXTm14YWpMZUZZZTJ5NCt3Q1NXa2tpa1dBOEJQQWRsNjdyZEtmVE5Dc0tRZ2lPSm9SZzQ3ZnVwVmxSNkU2bldYNzdNb3BWS3BXaVplOVNhSmM0eGk2THhFOFhrSXpmUTJNd3puZ0o0anV1bm5TYU1VMUtNeWV5ZGwwblk3clRhY2FzWGRkSk1XbHBhU0VWNllVRjB6akdZNGRJNUJwSkpqY3hKcEZJTUY2QytJNHJ0U2xKT0J4bTN2ejVuTXphZFoyTTZVNm5HYk4yWFNmRm9PWExyYVRlL3lqRXBuR014dzdSRldwblNYSUpaMElRMzUvWk9UQkFQcDlueGFxVm5JcTE2em9aMDUxT00rYXJxMVlpaEdBeWFKcEd5NWRiNmIzdVNhaXU1QmgzSHlBWnY0ZEVJc0daRXNUM1ozclMzWXhwVWhSTzFkcDFuWXpwVHFjWkdocmlnYTFiRUVJd2tUUk40K3BQZmd6MWkzbW9MdU5vMG5yb2l0OURJcEhnVEFyZ080YXU2L1JsTWpURTR3Z2grRXVzWGRmSmlsVXJHUjRhWXZIQ1JlaTZ6a1RSTkkycmI0bWozdkVpVkpkeHhJaUx0QjUyM1BZNGlVU0NNeTJBN3hqYk14bDBYYWRKYWVaMEpGcGJ1V3RkSjhORFF5eGV1QWhkMXpuVFZGWGxzbzlYbzM3eHQxQVY0SWdSRjJtNXc0N2JIa2VXWlNaQ0FOOHhrcHVTaE1OaEd1SnhUbGVUb25EWHVrNkdoNFpZdkhBUnVxNXpwcWlxeXRVZGY0ZTJ0aFNxQWh3eDRpSnZmRGUvZU9qbnlMTE1SQW5nTzJKNGFJamhvU0dhRklXM3EwbFJ1R3RkSjhORFF5eGV1QWhkMXhsdnZiMjlYSDMzOVdnckFsQVY0SWc5TnZKZE05bHhiNFpJSk1KRUN1QTdJclVweVpobXBabngwS1FvM0xXdWsrR2hJVDU1M2ZVTUR3MHhYbEtwRkRkdVdveTJoR1B0c1lsdGVUODdIdHlPSkVsTXRBQytJL295R1JyaWNXYUd3NHlYSmtYaHJuV2Q2THJPNG9XTEdCNGE0cTNjK2MrMzhjWDR4OUYxbmVOSnBWSzA3RjBLN1JMSDJHV1IrT2tDZGp6NkgwaVN4R1FJNER1c0o1MUcxM1VhNGcyTXR5WkY0WUd0V3hpemVPRWlob2VHT0pFNy8vazJtci81VGRiKzZFZDhyYWtaWGRjNVdrdExDeTE3bDhLQ2FSempzVU1rZnJhQTVEYzJNWmtDK0E3clRuY2poS0JKVVRnVGFxSlJIdGk2aFRHTEZ5NWllR2lJTjd2enR0dHB1dTgrM3VjNENEeSt1bU1IWDJ0cVJ0ZDF4clI4dVpYVSt4K0ZCZE00eG1PSDZBcTFrMHdtbVd5bHExZXZqZ0FKem1INzhubnV2R01OaXhZdjVxcjZlczZVaXk2NmlLdnE2K2xKZDlPVDd1YXErbm91dXVnaWRGMm44NnRmcGZHNzkxTmpGeWpCWTB5bDV6SXZsK09XZEpvSGZyNkRyUi9iRG5VVkhPUHVBeVRyL3BWYmI3MlZZaERBUjNKVGtqRXRyUzJjYVRYUktBOXMzY0tZeFFzWHNYTmdnRnNYZllaUGRIK2Z1Y0Z5M1BJS3ZHQTVsSmJpQlVweDhmamxTOC9SZTkyVFVGM0cwYVQxOE1pbjdpZVJTRkFzQXZqb1NhZVpOMzgrTThOaEprSk5OTW9EVzdjdzV0YlBmSmJiWHpwQTlYU0JlOTQwdklwSzNQSUt2R0E1V21rcFYvK1BJT3FqRjBOMUdVZU11RWgzdXV5NDdYRWFHeHNwSmtIT2NYMlpETHF1MDZ3ME01Rm1oc05jWGZNQlBqWGk4Rjdid3RVMVhoY0FmdUVVdUNic292M2JoVkFWNElnUkYybTV3NDU3TThpeVRMRUpjbzdyU1hjamhPQ2FlSnlKb3VzNjdmOTBHMThLL3hXU3J1SDg4V1dPOXJSbEVxOHowVlpkQ0ZVQmpoaHhrVy9aejQzbVRDckt5eWxHQWM1aCsvSjUraklaR3VKeGhCQk1CRjNYV2Jsc0phMVhmWnJLU3lNVTNuRUpoUXN1d2dsZGlDTWtIclZNR3VhK2pOWXBRVldBSS9iWXlEZTh6STduSEZidDNVdjNnay9RbDhsUWJJS2N3N3JUM1l4SnRMWXdFWWFIaHVocy96cGZ1dVhybEpjRTJQK2JJWDc5NjJmNCtlNy81R0RaOHh3OC95WGVzL2cxTG5pbWdnTWNaWS9ORFY4NlFOSXNJeFJ3QUljVnp6L1A4czhzWnVUZk50S2tLQlNMSU9ld25uU2FtbWlVbW1pVU0rM3BwNS9tNzV1YWljMTRML2ZlbDZEOG5mL0Z4UmZ2cFg0aGZQWC9nQ1J4aExiVVpQMklDMVVCeUJwOC9pNmI3NVNFQ0FSTndNSURTbkJZdTM4L3kyLzlJbU9hRklWaUVPUWN0WE5nZ0h3K3oxM3JPaGx2dVZ3T1ZWVVpIQnhFMDdLQXl1elpHdmQrRzJLeDUzZ3J0YlhBTGZ2aE05UDU3UHBTdm5YQnBYaWpoM0NCQUZDQ2hRZVU0TEIyLzM1U045OU1EOUNrS0V5MklPZW9ublEzWTY2SngzazdWRlZGVlZVR0J3ZVJKQlZOeXpKN05zZ3l0TGR6V21JeFdMUTZ3bFVQQ3o1WEhjSTlxRE1tQUxoQUFDakJ3Z05LY0Vqb0kvUzB0TkFETkNrS2t5bklPVWpYZGJyVGFab1ZCU0VFcHlxYnphS3FLb09EZzBRaU9UUXRTMjB0eURJa0VweTJiQlp5T1JnY2hNcURIK0NWd1hmeTZmZGZ5bFdWNStFY2VKV2pCUUFYQ0FBbFdIaEFDUTQxbHMyZDMvNE9UWXJDWkFweUR1cEpweG5UcERSelBKcW1vYW9xcXFxeWQrOGdvQ0pKS3JXMTBOZ0lTNVp3MnJKWlVGWElQVk9LOHh1SlNrUG1rc3MveEp5cnJ1UFdCZStoN01VWEtKdWJKL2p5aXhUMi81N2pDUUF1RUFCS3NCZ3FLK05yVjEzRnhvY2ZZcklGT1FlbE5pVUpoOFBNbXo4ZlRkTlFWWlgrL240MFRRVlVKQ2xIYlMwME5rSWt3bW5STkZCVjZPK0hYRTVDa21Ra0tVWnRiUzJOalRJYjgvK1hELzQrdzdYVk14bTllQ2FqcGFXWTA4N0huakdMVXhFQVhPQlh3Vkx1K1hnREcrKzdEeUVFa3kzSUZOVFIwY0hzMmJOSkpCSWNMWmZMOFpNZi81aG5kai9MRlI5NkowdVhYb1lrNWFpdmg3WTJrQ1JPU3k0SHVSejA5NE9tUlFBWlNaS3ByNituclUxR2tpVGViTzI2VHBieko0OW51SlkzbUhNdXg1NHhpMU94cDZTRWJZditubzEzcjZOWUJKbENORTFqNmRJV2JycXBsODJiRTBpU3hPRGdJSnFXQlZSbXo5YVFaZGovUi81RTQzVGtjcUNxTURnSW1pWURNcElVb2I2K25yWTJHVW1TT0ZWcjEzWFNNMzhlVDZ4Y3c3Vzh3Wnh6T2ZhTVdaek1yOXdDanpWOWdoWHJPaWttUWFZSVZWWFpzS0dGdGpZVldRWk5TeUZKS2RyYk9XMnFDcW9LZzRQOGlRekl6SjVkaXl6THRMZkhHQTlOaWtJUDhNVEtOVnpMRzh3NWwyUFBtTVh4WkYvVGVQcjZPQ3M2MTFKc2drd0IyV3lXelp0dnBLdExRNUk0ckxHUnYwZzJDN2tjREE2Q0pNWFFOSm5hMmxwa1dTYVJrRG1UbWhTRkh1Q0psV3U0bGplWWN5N0huakdMb3ozK3UrY1ovc2dWck8xY1N6RUtjcFpidjM0OUJ3NHNKWm5rbEdXem9LcXdkNjhFeUVoU2pOcmFXbVE1UWlJaE14bWFGSVVlNEk0VkhhemlEZWFjeTdGbnpHTE1FOE83ZUs0bXpOcDFuUlNySUdleDN0NWVObTllU25zN2FCcElFc2ZRTkZCVjZPK0hGMTY0a09HaFE3eDcxaWRadEdnUmpZMHlrVWlFWXRLa0tJeTVZMFVIcTNpRE9lZHkvdjIvZGpQOWIrYXl0cldWWWxhNmV2WHFDSkRnTFBTKzk3MlBXMjlkelVzdnhYam9vY3ZZdGcxKytNTWNoZ0h2ZWhmY2VHT0VXT3dSR2h2WDgrdGZCWGpxSjc5bTYwTmJ1ZkxLSzVFa2lXSlVFNDF5OEYwWHMrMkhQK0J2RFFNbzRZZFAvNHgzWFRHVFJZc1hVK3lDVEFHeFdJeFlMQWEwTTZhM3Q1ZU9qbjRpa1J5eFdJd3hQZWswRGZFNE04TmhpbDJUb2xBVGpiSSs4UVhtdlBwN0xtNzdCNW9VaGJOQmtDbW9zYkdSeHNaR1h0ZVRUcVByT2czeEJzNFdOZEVvbjA3ZHgvRFFFRTJLd3RraXlEbWdPOTJORUlJbVJlRnNVaE9OVWhPTmNqWUpNTVh0eStmWk9UQkFrNkxnTy9NQ1RISEpUVW5HdExTMjREdnpBa3h4MnpNWjVzMmZ6OHh3R04rWkYyQUs2OHRreU9mek5Ddk4rQ1pHZ0Ntc0o5Mk5FSUpyNG5GOEV5UEFGTFV2bjZjdms2RWhIa2NJZ1c5aUJKaWl1dFBkakVtMHR1Q2JPQUdLbUs3cjlLVFQ2THJPWDZvbm5hWW1HcVVtR3NVM2NZSVVzZFNtSlBmY1U4UDVhOVp3N2Q4SnJ2N1lQQnJpY2Q3S3pvRUI4dms4ZDYzcnhEZXhnaFN4NzMwdnovU3FOdWE4TjQ1WEFvOC9sdVlIajYvaHNzc0V6VW96TThOaGpxY24zYzJZYStKeGZCTXJTSkhxeTJUWTk3c0daczBHSVVBSXVPSUtoVWdFZnZ0Q25qVjNkQk1veVhOTnd6eWFGSVhYNmJwT2R6cE5zNklnaE1BM3NZSVVxVTNmNmFQeXZFNkVnRkFJaEFBaG9LUUVwazBQODlHcjJuamxGY2owRFpCTXJpRmFvNU5vYldIbndBQmptcFJtZkJNdlNCSGFsODh6TUJEbWtoa2dCQWdCb1JCVVZZRnBnbUdBWVlCcGduVEJmQ2laei9NdjZQempGeks4OG5JM1FnaHFvbEZPUjB0TEM1QUNJa1FpRWQ1TVZTR1pmQVJKa3ZEOXVTQkZLTGtwU1dsWkc2RVFDQUZDZ0JCUVVRR2FCb1lCaGdHbUNhWUpsZ1d1SzVoMnZzS0ZLQng4TFUvZEJ6ZHd6Zi9VYVZJYWFJakhPVldSU0lSUUNKWXN5UUU1anRiYkM2RlFGNUlrNFR1K0lFVkcxM1VlZmdpcXFnUkNRQ2dFUW9BUTREZ3dPZ3FHQWFZSnBnbVdCWllGbGdXMkRZVUNPRzRZQWl0NTdOL2gwZTlubURWckRkZGZEeTJ0TGN3TWgza3pUZFBZc0dFRHVkeDZicnBKSXhianorUnlzRzFiSThua0Vud25GcVRJYk05a0dEbll3S3gzZ2hBZ0JJUkNNSDA2SERvRWhnR0dBWVlCcGdtV0JaWUZ0ZzJGQWhRSzREaFFLSURqZ0dYSEdmcGxuTjFEZWRhdnovRFhmNzJUTDN5aGdXdmljVjU5OVZVMmJPaEEwMUswdDBNa3duRnBHblIweUhSMUpmR2RYSkFpODUxdjcrUzhhUXFoRUFnQlFvQVFVRklDbzZOZ0dHQVlZRmxnV1dCWllOdFFLSUJ0UTZFQWhRSTREcmd1dUM2NExoUUtZUXl6bGI0ZnRiS2ovNXU4NTdLNWZIcmhTN1MzZ3lSeFVoMGRFbTF0U1NSSnduZHlRWXJJem9FQm50MDlqeGt6UVFnSWhVQUlxS29DMHdUREFNTUEwd1RUQk1zQ3l3TGJCdHVHUWdFS0JYQWNjRjF3SEhCZGNGM3dQSERkRkxObWJXYlZxaXlKQkNlVXpjTG16UktSaU1iczJWQmIyNFVzeS9qZVdwQWlrdjVlSDJVVmJZUkNJQVFJQWFFUVZGU0Fwb0ZoZ0dHQWFZSnBnbVdCYllOdGcyMURvUUNPQTQ0RGpnT3VDNDZqWWRzcFB2clJEWHpsS3prYUd6bWhWQXEyYll0d3d3M3RKSk1KbGk1dFFkT2dxeXVCNzlRRUtSSzZydlB3UTNEaFJRSWhJQlFDSVVBSWNCd1lIUVhEQU5NRTB3VExBc3NDMndiYmhrSUJDZ1Z3SEhBY3NPMGNodzV0WnVIQzliUzFhY2d5eDZWcGtFckI0R0NNbTI1cTU1RkhZcnl1dmIwTFNaTHduYm9nUlNLMUtRbUJGb1FBSVVBSUVBS21UNGREaDhBd3dEREFOTUd5d0xMQXRzR3lvRkNBUWdFY0Iwd3poK3QyOExuUHBXaHJnMGlFNDhybFlQTm0wTFFFTjkzVXhwSWxNbThtU1JLK3YweVFJdkh3UTNtbW54OG1GQUloUUFnSWhhQ2tCRVpId1REQU1NQTB3VFRCc3NDeW9GQUEyNFlEQjdKVVZIUnc4ODFaMnRwQWtqZ3VWWVZ2ZkNNQUpGaTVjaVdSU0FUZitBbFNCUG95R2ZiK3RvR1pZUkFDUWlFUUFxcXF3TExBTU1Bd3dEVEJOTUd5d0xMQXRpR2ZUeEVLZGJCaVJZNUVnaFBLWnFHakkwSTIyOGFWZGJ2WitaLzM0UnQvUVlyQXBtLzNVVjdSaVJBZ0JBZ0JRa0JGQldnYUdBWVlCcGdtbUNZTUQ2Y1lQbkEvciszNURjdVg1MmhyQTBuaXVGSXA2T2lRMmJ1M0RVZ1FET2I1NHBjRXZqTWp5Q1RibDgvejVGTmgzbmt4aEVJZ0JBZ0JvUkE0RG95T2dtR0FhWUpwZ21YQkhoN2s1ZThNdzRqTDZsMFhzbnE1amV4WXlPZloxTmU1UkNMUTN3L2YvVzZNdlh2YmdSaGpQQTh1REcyZ1NWbUo3OHdJTXNtU201SVFhRU1JRUFKQ0lSQUNwaytIUTRmQU1NQXd3RFRCc3NDeTRLWFFVNEFFVlFHSVZVS3NFaFZRZ2RRZUcvcHRTblpObzZTOERMeCtQRThEWWdRQ0FUNzNlWUVRQXQrWkVXUVM2YnJPbGkxUVZTVVFBb1FBSVVBSUNBVEFNTUF3d0RUQk5NRTA0UTkvVUtHdW5CT3FMb1BxTXJ3RjRMRWIyQTI3TE5obFV2SmNGYy92L3pEcjE2OUhsbVZpc1JpKzhSVmtFbTNQWkRpZ054QitONFJDSUFRSUFVS0FhY0xvS0JnR0dBYVlKbGdXYUZxT3NxY3FzVWNPUW5VWjFKWHpsdXJLb2E0Y0YramhaL1M4K0NUc3N1RmJKckZMUDRMc1JLbXZyMGVXWlNLUkNMN1RGMlFTM1gxM0h4V1Y5eUlFQ0FHaEVBZ0JGUldnYVdBWVlCaGdtbUNhWUZsdzBVV05YRDNTeVA1c2pwZS9sMlZrWkpEUjZCREdyS2VncmdMbWxzR01VazVxUmluTUtJVllKVm1lSmN1enJOOTFQOXhqSS8xK09yR3FEeU5mOGdIcTYrdUp4V0w0VGwyUVNiSnpZSURuY3cxYzhpNFFBb1FBSVNBVUFzZUIwVkV3RERCTk1FMndMTEFzc0cyd2JTZ3RqU0JFZ3ZKeU1QYUN1UWRHdjUvRnNsUUtGeitKOTk3ZGVOWDdvSzRDNnNwNVMzWGxVRmVPQnZUeU0zcEhub0pkL3dwYmJHU25CdG1KVWw5Zmp5ekx5TEtNNy9pQ1RKTDA5L29vQ2F4RUNBaUZRQWdRQXFaTmc5RlJNQXd3RERCTnNDeXdMTEJ0c0cwb0ZLQlFBTWNCeHdISEFkZUZRQ0JHTUJpRFB5ekJmUW5jSDJ0NDkyVXBMWDJjU1B3cG5ndTlBSFBMb0xvTXFzczRxYW9BeENvaFZvbEtIcFU4cVQyUHd6WWI2ZTVweU5NdUozYnBSNml0clNVV2l5RkpFajRJTWduMjVmTTgrQ0NFTGdBaFFBZ0loVUFJS0MwRnd3RERBTk1FMHdUVEJNc0N5d0xiQnR1R1FnRUtCU2dVd0hYQmRjRjF3WFhCODhEendQTWtQSzhSY2Y1ZXN2ZTJNek1jUmxWVlZGV2xQL1ZqMU5IZHFLWERVRmNCMVVHb0NuQlMxV1ZRWFlZR1pObE5kdVFaMkZPQTVTWVJheWF4OHo5TTdaeS9RcFpsWXJFWWI3WjA2Vks2dXJxWXlvSk1ndTUwTjQ3WGdoQVFDb0VRSUFRSUFhWUpvNk5nR0dBWVlKcGdXV0JaWU50ZzIxQW9nT09BNDREcmd1T0E2NExyZ3VlQjU0SG5jY1NOTityTURJY1pJOHN5c2l5VFNDUVlvMmthcXFyUzM5K1ArdnRueUk3OERPMlNnMUJYRHRWbG5GUlZBT3JLb2E2Y0hEb3BmZ2d2L2dENlRmaVdUZXpTanlBN1VlcnI2eG16L2ljYjBWbzBrc2trVTFXUVNmRGdnenJUcG9VUkFvUUFJVUFJcUtnQVRRUERBTU1BMHdUVEJNc0Myd2JiaGtJQkNnVW9GTUJ4d0hIQWRjRjF3ZlBBODhEek9LTHEvRFNmWGppUEU1RWtpVmdzUml3VzQzVzVYSTVzTnN2Zy9ZT29wVU5rZi9jVTFGWEEzREtZVWNwSnpTaUZCZE5nQVdSNWxpelBzbjdYL2JESGh0VVNxZDg5Qmw5dUpmbU5UVXhGUVNiWXZueWVzdUFRNTFXbU9mLzhPRUlJUWlFUUFod0hSa2ZCTU1BMHdUVEJzc0N5d0xiQnRzRzJvVkFBeHdISEFjY0Ixd1hYQmM4RHorTXd6d1BQZzVxNU8ybUlkL0tYaUVRaUpCSUpqcGJOWmxGVmxmNGZQSWs2dXB0YytUNm9xNEM2Y3Q1U1hUblVsWFBZakZKU1ZZL0JsMXRKZm1NVFUwM3A2dFdySTBDQ0NTS0VvUFZtaFk5ZERTL3VTL0tiNTM2TUpGVlFQVGZNNkNqb091ZzZ2UFlhSER3SUJ3L0M2Q2lNam9KaGdHbUNaWUZ0ZzIxRG9RQ09BNjRMamdPZUI1N0hZY0Znbmp2dTBKRS8rRUhlcmtna3d2ejU4MWw0L2FkWTB2aFBKRDZ3aU5qSWxkVDhKQXhaZzF6Mk9YalY1YkIzbEhKUzd5aEZuZlpMOW41cm1NYnJibUFxQ1RKSmFxSlJ2dmEvbytpNnp2Wk1oZ2Z2WDRicmhxbWUyNHpqaGpGTk1FMndMTEFzc0cyd2JTZ1VvRkNBUWdGY0Yxd1hYQmRjRnp3UFBBODhEendQTGd4dG9FbFp5WmtRaVVTSVJDSTBOamJTem45VFZaVnNOc3ZnVDU5R0hkMk5Xam9NZFJWUUhZU3FBTWVvTGlPMTV4RzBHLy9JSTQ4OHdsUVJaSklKSVdoU0ZKb1VoWDM1UE4zcGJuNnhTOGUwYWdoZG9HQlpZTnRnMjFBb2dPT0E0NERyZ3VPQTY0THJndWVCNTRIbmNWZ2dvUE81end1RUVFd1VXWmFSWlpuWGFacUdxcXAwZEhTUVhmUXNWQWRobDRXa1ZoS3IrakQxMVIrbHNhdVJxU1JJRVprWkR2T1ZKVzJNNmN0azJQRWZheGo4QlZTZTEweWhFS1ZRZ0VJQkhBY2NCMXdYWEJjOER6d1BQSThqcGsvTGNQTS9ORE9aSkVraUZvdXhiZHMydEo4ZklqYjhOOXh3d3czRWJvc3hWUVVwVWczeE9BM3hPTHF1c3oyVDRmOTlOOG1ycjlSUUtDZzRqc0J4d0hYQmRjSHp3UE00elBQQTgrQWpIKzZqSnFwUURMcTZ1amhYQkNseVFnaWFGSVVtUldGNGFJanU5QVllZmhoZWZtVWVwaHZIODhCMXdmUEE4empzdk1vQnZ2Q1BEZmdtWHBDelNFMDB5b3BWVVZhc2dwNTBtaWVlV01PMmJZS1IxNXB4bkRDZUI1NEhNMmYwMGFTc3hEZnhncHlsbWhTRkpnWGFWK2ZweTJUWXVIR1lYLzV5SHFZVjVhWUV2a2tTNUN3M014d20wZHBLb2hWMkRnelFrMDdTMHRxR2IzSUVtVUxtelovUHZQbno4VTJlQUQ3Zk9Bcmc4NDJqQUQ3Zk9Qci8yZHdRWkZDelB1d0FBQUFBU1VWT1JLNUNZSUk9XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwid2lkdGhcIjogNzQsXHJcbiAgICBcImhlaWdodFwiOiA1MSxcclxuICAgIFwidXJsXCI6IFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFFb0FBQUF6Q0FZQUFBQXcvWjU0QUFBQUFrbEVRVlI0QWV3YWZ0SUFBQW5rU1VSQlZPM0JDVlRVZFFMQThhL2pEeGs1Z2tHY1loZ1VZV1I1SUJyR29hQzdJb3FaR0dLSmVXeHVIdDFycFcvWGRldFZhdXUyN2RPMFRiZlN2S3JkeUR6U1VqUHpQaGVSRkFYVUo0Y2lqREk0Rnd6L0dmNHo3Tko3dmxkdEtjcUF3M3QrUHAyYW1wb1dBZkhjZFVNQ2lBZlN1T3VHRk56VklncnVhaEVGSG1iL2Z0aS9INDhqOENBWEwwS3RvWXJLeXJOb05Hbm9kTFNaMnRwYVNzdEtNVXRtOGsvbk0rZnBPZHlJd0lOb05QREtwbi9qY2xiU28wYzlPbDBtYmVYMUphL3o3a01ib0Nzc0NackR6U2p3SUhWMUpueTZubVhOdXI5ejlsd1JuK1htMGhaMjc5L055cVFOMEFXd05KR3FTK1ZtRkhpUUUva255Qm4vR0VJSVpzMmFoZGxzWWRYS0QzR25qZHMza2w0L0VVa0REeFNGOGJ1dEkwbm9uOEROS1BBZzY5YXNJVEVwa1daQ0NHWThPWU5tcTFaK2lEc3MvMlE1ajNSNUZ0UUtNazhrc0RsdEE2c1hyNklsRkhpSWtwSVNrbE1HNHUvdnp3OU5uVDZOWmt1WExFR1daVzZITE1zc1hQMVhudXU1QUFJVlBIcG9NS3V6VjZIVmFta3BCUjdpNElFRERCNDBpSjh6ZGZvMGVvWDNZdkhpeGNpeXpLMm9yNjluWWU1Q1hvNzVCM2gxWW1aK0RtdW1yU0k0T0poYm9jQUQyR3cyOXU3ZVE1KzRPSDdKdzJPeWlJMkpZZkhpeGNpeVRFc1lqVWIrdlA1bFh0TzlCNDFOekwvd0xIOTcvRTE4ZlgyNVZRbzhRSDUrUHBNZi95MDNNeW96azlpWUdGNTk1UlZzTmhzL3BLK3FvcUswbE9zTUJnTlBmdm9VNzhSOUJsSVRTeS9QWlc3T24xQXFsZHdPQlI3Z1h4OS9RbEp5TWkweEtqT1RNZG5aeko4M0Q1dk5Sak45VlJWWHhqK0dLMk1FWmVmT1VYbTVrZ2R6SCtMenBJTmdjckZLdjVDWjQyY2loT0IyQ2U2d2l2SnlJaUlpQ0FvS29xV1NrcE5wTm4vZVBDWk1tSUR6cFZuMCsrNFVDc25HdHRSVS92aTJocUlCTlNocjRGUFhCMlNOZjVqV0V0eGhodzRkWWxqR2NHNVZVbkl5VlpjcXVmYmNIQVpZNm5ENkIvQ2RqNU1aeXp0UkhWNkRzc0xGTHMxR1VnZWs0QTRLN2lDNzNjN21qWnVJaTR2alZwVmVLRVY5eGtDZjJBUWFRM3J3YlhjbGcxYjRVQjB1Q0NscFpOdnpEcm80Wk54RndSMVVVRkRBeE1tVEVVSndLNDRlUFVydSs3bFVkMnVpSUsyQXdybDdxWjU5QWVuZXp2VFBhMlQvTTNhRzFOUVJPbklrdTdadXhSMEVkOURXTDdid3drc3ZjaVBsNWVWY3ZYb0pTVElBKytuU1pRdEJRYVhNZllzZjZWa0pFNTlTTXUrQ21oNStSbHhOWmtJa0cxM0dqZVB3K3ZXa2pCNU5hd2p1RUwxZVR6TzFXazB6V1pZcExTM2wyclVxSEk3THVGeGY0ZU56RExXNmxLUWsvcys1YzFDcjk4RlNNd2lMK1JHVUY4d3NVRjhsdUxFTVovVkZydXZxa0xoYVZBU2pSOU1hZ25haTErc1JRaEFjSEl3a1Nlell2cDJ3SGtIczI3Y2FJVGJqNVhVQXJkWklWQlEvSWtsUVVnSW1VeHgyKzBNb0ZJUHg5bGFoMVlaVGRINEhmWGNjZzZ3K05QNWFnemlUaDkyckM5YzFBSG12dmtubTlPbTBscUFkRkJZV1lMVk9wcXhzTUwxN1gwS2gyRTMyV0ltQUFINmt2aDRLQ3NCdVQ4WmlHVVpnNEJEQWo4akkza1JIZCtPbnhreWJ5cUY3MVlTc1hZdFgxaFFhWWhPNXp1S1VPZi9pMHd5Yk5oVjNFTFN4WGJ1Mm9OT05KeTVPSWlXbGlPdk1aamgrWEluTE5SU2pNUTJWS2g0dnJ5Q2lvcUx3OWZXbHBWSXpNemtFcU5hdVJaazFoWWJZUk13Tk5zNFBqR0xzRTFOd0YwRWJNaHFOdUZ4V0xsOGVpc1d5RFc5dkZYcjlJdDUvTDVmZnozeU4rUGg0bEVvbHJaV2FtY2szZ1BhamRVanAyUmdUd3hpYk1SUjNFclFobFVwRlJzWWtZQkpHbzVIaTRqUEV4Y1VRcERyT3dJRURjYWZobVptY1ZLdXByekV3TkdNRTdpWm9KeXFWaXBTVVFXejc2aXNtVEpwSVcraVhsRVJiVWRET1BscTNqb1NFQkRvYUJlM29kR0VoNmNPRzRlM3RUVWVqb0IzdDNMbVRJVU9HMEJFcGNLT3FxaXBXcnZpYW9qUEYvSlRWYXVYYzJiUG9ldmVtSXhLNDBkNjk1L2xpeXdocWE2K1JuMzhZamNaRmZQOFlnb0tDeVB0UEhqbmpINk9qRXJpSjNXNW4yYnQrOU8wSFViOEtJaUFnaFpJU3lQM3NIQkc5Q2lrOHRZWmx5NWZ5U3c0ZTNJTVFMb1JRMEN3b3FBY1JFWkY0Q29HYkhEbFNnUEJLSURRVXVuVURnd0hNWnY0bmlnTUhvN2lpSDhERG8wL3g5RE1TcWFsaDlBd1BwNWtzeXh3L2ZoUkpXc2l3WWJ0b2R1UklESDUrZS9Ba0FqZjU1R01Ib2FHQ3NEQlFLTUJrQW9zRjZ1dkJaZ1BKN28zK1NpTFBQZ2RPdVpLY2NWOHk5bEViZm41dmtaeWNqMUxKOXlvcWxQajVmWXhhcmNhVENOeWdwT1FjSndxaVNVK0hrQkN3V01Cc2hybzZxSytIaGdhdzI2R3hFV1Q1TWprNVgvUGtVd3RKVGk2bG1jRUErL2FObzZabUlDcFZOMGFOaXNmVENOemdtMi8waElSRW9kV0NyeTlVVklERkFuVjFZTE9CSklIRGNaN25uMS9QdUhFTGlJNldhRlpXQm1mUHprR3JuY0NJRWYyUVpSa2hCSjVJMEVvbWs0a1BWM1pqd0VEUWFzRnVCNU1KTEJhb3F3T0w1Umd6WjY1bCtQQi9FaGJHOTA2ZVZKR2JPNUtwVStmeDRJTTZyaE5DNEtrRXJYVDQwR2tDQWdlaDFVSndNQmdNWURiRHBlbzh0Zytld256VlJTSWlKZXgyT0hnd2duZmVXY0Q2OVJrc1cxYUVUcWVqb3hDMGdpekxMRjh1Q0EwRnJSWVVDakNad0dvRlE5Y3k2bE5Oek9ZZTRCNG9kdEtwV2dsOTgraDB4WWRBbFlUWmJDWWdJSUNPUU5BS0owK2VwcW82bHBoWTBHakFhZ1d6R2F4V2NGMk9vTWNIZjZBbWZnY05nUVhRVTlDa01RSzVNREtYU1E1ZyswelNtK0xKOHNva05pUVdUVGNOMGRIUmVDSkJLM3krdmc2TnhoK3RGbng5b2FJQ0xCYW9xNE11cmdSVXh4Smd4MHRZTEdac2xDRDNyWVhoWDZMU2JLVzJ1d042Qzc2bGtHOHA1SHVYWElUaytUQ2lhUWdqN3gySk5qQVVYUzhkYXJXYU8wMXdteTVkdk1qR1RWclMwa0NyQlljRFRDYXdXS0N1RGhvYXdHNkh4a1p3T2dQQW5relRBVWl3aFhEZzROdFVWMWRUWGxWQjJiVlNOcHUyc0pNalNPR2RxSTZSV01NTzFyQURaT0NBazBSYkpCa01KUzB5amU1KzNTa3VLU1kxSlJXdFZrdDdFZHltazZjdW9PNGVpMVlMd2NGZ01JRFpERllyMkd6UTBBQjJPelEyZ3RNSkxoZmZlK0ZGSTk3ZTNvU0hoeE1lSHM0UWZzTVRQSUVrU1JRWEYzT3Q0UnA3eXZld3hibWRRcDlLQ085TUh1WGtzWXEvc0FxTVRlRFR4QU43ZXJKNTZBYTBvVnJhZytBMlpXYW1FUjE5Z1lJVFp5Z3J2UWU3b3c5V3F6ZjE5V0N6Z1NTQnd3R05qZUIwZ3NzRlBsM0xTRStQNGVjb2xVcmk0K05wbHA2U3podThRVlZWRmVXWHlxazBWckpaL3dWN094K2hPclFCUWhUa2gxeGl6STVIMkpUeE9XRmhZYlExUVN2b2RKSG9kSkhZN1haT25TemlxdDVNYlcwWURRMlJPQnpRMkFoT0o3aGMwTlFFczJkWGN0OTlnMmtwalVhRFJxT2hXUTQ1eUxMTTFxMWJXVnI0TGpONlQwUFhMNUx1M2J2VEhnUnU0TzN0VFdKU1BJbEpjUFhxVlk0Y1BzQ0tGVjRjUFJxTkxBZmlja0huemxheXN2eHBEU0VFMmRuWlpKTk5leE80bVZxdEptdU1tcXd4Y1BLNzAremRlNHBGaXdLSmlibEcvd2VHMEZFSjJsQy8rL3ZRNzM2WU9zMktvY2Fmamt6UUR2ejkvZkgzOTZjakU4QnhRT2F1Ry9vdjdjbmpBZTlmZGQ0QUFBQUFTVVZPUks1Q1lJST1cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJ3aWR0aFwiOiAzNyxcclxuICAgIFwiaGVpZ2h0XCI6IDI2LFxyXG4gICAgXCJ1cmxcIjogXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUNVQUFBQWFDQVlBQUFBd3NwVjdBQUFBQWtsRVFWUjRBZXdhZnRJQUFBUGxTVVJCVk0zQlcweGJCUUNBNGIrSGMxb09reUlNV3FCUUxnUGs1Z2FFZ05sY1FTWkRZZ1lPU0FaeG9zN0xpK3hoK2lieGtxZ1A3bUhxd3hRMUpocjFZWnFZU1RMR2JveWh5R0pJRERJMzdrVUs1ZEt4cHAzUVlsdU80Y0ZrSVV0cG9TVDdQcFdpS0gxQUlnOFFFVWdFakR4QUJFTEE3WWIyZGhzdUYwR3gyKzBNalEyeG5rQUloSVY1bVp1N3lQVytxd1RLNFhUd2RHOE5aMlorWUQyQkVCZ2F1a1ZEZlRWNStYbGN2blNKalN3c0x0RFNmNXlERVUveVV1WXgxaE1JZ2RuWldXSjJ4cURUNlNnb0tPQkNaeWVLb25BL2xua0x6dzI4UUxGUVRPditOMGxLVEdJOWdTMnkyKzNFNi9YOEx6WXVqcExTVWpvNk92RDVmS3h4T2h5c0daNGNwdkd2WnprcU4zSGMxSUlrU2R5UHlCYjlPVERBM24zN3VGZDBkRFFtazRrTG5aM2t4OGNqTnpaeDhlTzNPYVoraDlOUkgxRmJVb00vQWx1d3VycUsxK2REa2lUV2k0eU1KQzAySHJIMUpBUDdsMm5Tdk1FbnRoWnFTMnJZaU1nV2pJNk1rSitmejcxc3RnWGM3am5jN3B2NHBHdDRUdzh3Zk9OZk90dGtIajNYeW5oME5ydXFxL0ZIWkJPV2xwYVFaWm5Cd1FGS0g5dkYxTlF2Q01KTjRDemg0WCtnVWxVUUVWSEZYZnNqekhabVlISWJNTHJhVWVKK3gzZm5EaHNSQ2RMNGVCY3ExVnZJOGlMbFQ0empjaDFDRUV4QUNZclNnQ0RFazVRVXd4cURBVVlkVjFBbVYxbXNiR0RsNVNQa0hLNWxJeUpCOEhnOFNKS1c1ZVZYNk85WHFLcXFJelkyQ244eUt3OHdjcTBIdDdTVDNMMUZCRUlrQ0pJa1lUUVdBOFhNekZ3aEtpcUtRR1NWbVFpR3dDWk1URXlRbVpuSmRoRUlnTlZxNDhzdi9tWnNiQnFQeDRONXdvelJhR1M3aUFTZ3Uzc0ZsWkJDWHgrY09qVkhXbW9NMmRrTEdKSjBPSjBPcHFhK1FwSldTVWg0RmExV3kxWUpiR0I1MmNYNTgrRWtKSURGQXBPVDhYeldWc2d6aCsvUzAvTXVibmNlR3MxMXdzSjJvOVZxQ1FXUkRmVDMzeVlyS3htUEI2eFcwT2x1Y2VMRVR4UVVmTUQ4L090NFBGMWtaR1NpVXFrSUZRRS9GRVhoNTdNQ09Ua3dQUTM5R1NjeHZQZzQ0OExuSEhqdERENWZNd1pERmlxVmlsQVM4V05rWkpabGw1NGRPMkJtQnBUQk90cXN1M0drM2tCejlFTUtiR1BVWHpaUkhsbEd2amFQbElkU01PZ05xTlZxdGtMRWorNnJTeFFWaVN3dWd0VUtLOU1aMEpjQmpxZm82ajFDYXJvR2kzMkswWDlHT1dmcjRGdkxqMGhEWVRTcTY5QjVkQnhNcjJSUCtoNkNKZUpIOC9OSm1NMFdmdXVGK2ZsWW5FNFp0eHZLeXhZb0xOU2pWcXZSeCtrb3BwZ21tbmgvNVQyc0MxYk1UalBmbWIvSE4rRWpLeUVMV1pZSmhvZ2ZzaXlUbTV0TWJpNGNxcmxONzYrTGZQMk5RSE96RjdWYXpYb2FqWWEwNURUU1NLTWlyNExORWdtUVhoOUxYVDNVMUhyeGVyMXNKeEg0RkhpWUFJbWlpQ2lLYktmL0FLMlZXdjRQcVZpOUFBQUFBRWxGVGtTdVFtQ0NcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJ3aWR0aFwiOiAxOSxcclxuICAgIFwiaGVpZ2h0XCI6IDEzLFxyXG4gICAgXCJ1cmxcIjogXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUJNQUFBQU5DQVlBQUFCTGpGVW5BQUFBQWtsRVFWUjRBZXdhZnRJQUFBR2NTVVJCVktYQlBXc1RZUURBOGY4OXozTWt1Y3RMRFppck1XMFNNNVJDUVZFRXdaZEZLT0phaDI2NkdQb1IvQmc2K3dWY3V6a3BkS2xMVzVwa2lLZENiYUJ0YUVGRHpmWGFhKzZ4R1FMSDBUU0N2NStodGU0QUdmN2Zad1ZrZ0J4am5KOXJ2cXkzZWZSNG5yajJmaHRUbU5TY0doZHN3UVRkN2g1Mzc1VnhYUmV0TlNPdHZSWmJCMXVVcGtxTUtDWUlnZ0RMc3FoV3E3aXVpOVAzYUNaLzBkTW5MTjlaeGpBTVJnUlg4RHdQMjdZWjh2MC9wTlFCWHpkZjQ2Mis1ZW5OaHhpR1FaUmlqS09qRGZyOUJrSm9PaDJEZE5yQm5pcGl5emZNSG4rRHdZQTR4U1hDTUVUS1BMNy9nTG01ZWFLc3BWdG80eG1wVEpvNFJjenA2Um5kN2dtbW1hUmN2a0ZjS3B0bEhFVk1vK0hUYXVWWVd4dXdzckpEc2ZpSlJPSUpoY0lDa3lnaXROWnNiOE8rMStYMjgvZjRaOU1VQ3E5SUpDeitoU0ppZDdkSEdPWm9ycHQ4dEpaNFYyL3lvL0VCS1JYbC9Dd3p5UmxxMHpYR1VVU1VTaGtXRjQ4WnVyWnhuWmYzWHlDRUlBeEREbjhmc3RQN1NXVlFRVXJKWlJUUUFHd3VTQ21wVkxMVTZ4QUVBVUlJaG9RUU9Ia0hKKzl3aGU5L0FRT3RoZEppdXFJQkFBQUFBRWxGVGtTdVFtQ0NcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJ3aWR0aFwiOiAxMCxcclxuICAgIFwiaGVpZ2h0XCI6IDcsXHJcbiAgICBcInVybFwiOiBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQW9BQUFBSENBWUFBQUF4ck54akFBQUFBa2xFUVZSNEFld2FmdElBQUFDM1NVUkJWRzNCc1dyQ1FCekE0Vi91TGowUGh6b1VGMEU2ZEJCS3NTK1VGK2l6dUxtNWR5MDRPN241QUU3aUlLS0xPQ1NEcHhlOC9rMGdoUXo5dmtSRWNzRFN5UE1MdlY2WG1nK2VKRWx3VDI1aUFBdDBhSWlVbk05WDFHOWdGMDU4RHNaVWpLS2xLTGJFdUFQWnMvK2U4dkV5UWlsRnpkRHd2aVFFUjcvL1J1MzU2NTNVV3Y0b0tpTEN6enl3V0c0b2lpMjExRnJhRkpYYjdZN2NOYkV6NU9BRDYrTWFFYUhOQURQblVwTmxLVEcrb3JYbUg2c0hGNTlDMDdya3Fac0FBQUFBU1VWT1JLNUNZSUk9XCJcclxuICB9XHJcbl07XHJcbm1pcG1hcHMuZm9yRWFjaCggbWlwbWFwID0+IHtcclxuICBtaXBtYXAuaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgY29uc3QgdW5sb2NrID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggbWlwbWFwLmltZyApO1xyXG4gIG1pcG1hcC5pbWcub25sb2FkID0gdW5sb2NrO1xyXG4gIG1pcG1hcC5pbWcuc3JjID0gbWlwbWFwLnVybDsgLy8gdHJpZ2dlciB0aGUgbG9hZGluZyBvZiB0aGUgaW1hZ2UgZm9yIGl0cyBsZXZlbFxyXG4gIG1pcG1hcC5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4gIG1pcG1hcC5jYW52YXMud2lkdGggPSBtaXBtYXAud2lkdGg7XHJcbiAgbWlwbWFwLmNhbnZhcy5oZWlnaHQgPSBtaXBtYXAuaGVpZ2h0O1xyXG4gIGNvbnN0IGNvbnRleHQgPSBtaXBtYXAuY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcclxuICBtaXBtYXAudXBkYXRlQ2FudmFzID0gKCkgPT4ge1xyXG4gICAgaWYgKCBtaXBtYXAuaW1nLmNvbXBsZXRlICYmICggdHlwZW9mIG1pcG1hcC5pbWcubmF0dXJhbFdpZHRoID09PSAndW5kZWZpbmVkJyB8fCBtaXBtYXAuaW1nLm5hdHVyYWxXaWR0aCA+IDAgKSApIHtcclxuICAgICAgY29udGV4dC5kcmF3SW1hZ2UoIG1pcG1hcC5pbWcsIDAsIDAgKTtcclxuICAgICAgZGVsZXRlIG1pcG1hcC51cGRhdGVDYW52YXM7XHJcbiAgICB9XHJcbiAgfTtcclxufSApO1xyXG5leHBvcnQgZGVmYXVsdCBtaXBtYXBzOyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQSxPQUFPQSxXQUFXLE1BQU0sbUNBQW1DO0FBRTNELE1BQU1DLE9BQU8sR0FBRyxDQUNkO0VBQ0UsT0FBTyxFQUFFLEdBQUc7RUFDWixRQUFRLEVBQUUsR0FBRztFQUNiLEtBQUssRUFBRTtBQUNULENBQUMsRUFDRDtFQUNFLE9BQU8sRUFBRSxFQUFFO0VBQ1gsUUFBUSxFQUFFLEVBQUU7RUFDWixLQUFLLEVBQUU7QUFDVCxDQUFDLEVBQ0Q7RUFDRSxPQUFPLEVBQUUsRUFBRTtFQUNYLFFBQVEsRUFBRSxFQUFFO0VBQ1osS0FBSyxFQUFFO0FBQ1QsQ0FBQyxFQUNEO0VBQ0UsT0FBTyxFQUFFLEVBQUU7RUFDWCxRQUFRLEVBQUUsRUFBRTtFQUNaLEtBQUssRUFBRTtBQUNULENBQUMsRUFDRDtFQUNFLE9BQU8sRUFBRSxFQUFFO0VBQ1gsUUFBUSxFQUFFLENBQUM7RUFDWCxLQUFLLEVBQUU7QUFDVCxDQUFDLENBQ0Y7QUFDREEsT0FBTyxDQUFDQyxPQUFPLENBQUVDLE1BQU0sSUFBSTtFQUN6QkEsTUFBTSxDQUFDQyxHQUFHLEdBQUcsSUFBSUMsS0FBSyxDQUFDLENBQUM7RUFDeEIsTUFBTUMsTUFBTSxHQUFHTixXQUFXLENBQUNPLFVBQVUsQ0FBRUosTUFBTSxDQUFDQyxHQUFJLENBQUM7RUFDbkRELE1BQU0sQ0FBQ0MsR0FBRyxDQUFDSSxNQUFNLEdBQUdGLE1BQU07RUFDMUJILE1BQU0sQ0FBQ0MsR0FBRyxDQUFDSyxHQUFHLEdBQUdOLE1BQU0sQ0FBQ08sR0FBRyxDQUFDLENBQUM7RUFDN0JQLE1BQU0sQ0FBQ1EsTUFBTSxHQUFHQyxRQUFRLENBQUNDLGFBQWEsQ0FBRSxRQUFTLENBQUM7RUFDbERWLE1BQU0sQ0FBQ1EsTUFBTSxDQUFDRyxLQUFLLEdBQUdYLE1BQU0sQ0FBQ1csS0FBSztFQUNsQ1gsTUFBTSxDQUFDUSxNQUFNLENBQUNJLE1BQU0sR0FBR1osTUFBTSxDQUFDWSxNQUFNO0VBQ3BDLE1BQU1DLE9BQU8sR0FBR2IsTUFBTSxDQUFDUSxNQUFNLENBQUNNLFVBQVUsQ0FBRSxJQUFLLENBQUM7RUFDaERkLE1BQU0sQ0FBQ2UsWUFBWSxHQUFHLE1BQU07SUFDMUIsSUFBS2YsTUFBTSxDQUFDQyxHQUFHLENBQUNlLFFBQVEsS0FBTSxPQUFPaEIsTUFBTSxDQUFDQyxHQUFHLENBQUNnQixZQUFZLEtBQUssV0FBVyxJQUFJakIsTUFBTSxDQUFDQyxHQUFHLENBQUNnQixZQUFZLEdBQUcsQ0FBQyxDQUFFLEVBQUc7TUFDOUdKLE9BQU8sQ0FBQ0ssU0FBUyxDQUFFbEIsTUFBTSxDQUFDQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztNQUNyQyxPQUFPRCxNQUFNLENBQUNlLFlBQVk7SUFDNUI7RUFDRixDQUFDO0FBQ0gsQ0FBRSxDQUFDO0FBQ0gsZUFBZWpCLE9BQU8ifQ==