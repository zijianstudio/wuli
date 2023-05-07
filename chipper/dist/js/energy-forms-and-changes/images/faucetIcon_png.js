/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
const image = new Image();
const unlock = asyncLoader.createLock(image);
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImltYWdlIiwiSW1hZ2UiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwib25sb2FkIiwic3JjIl0sInNvdXJjZXMiOlsiZmF1Y2V0SWNvbl9wbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgKi9cclxuaW1wb3J0IGFzeW5jTG9hZGVyIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9hc3luY0xvYWRlci5qcyc7XHJcblxyXG5jb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG5jb25zdCB1bmxvY2sgPSBhc3luY0xvYWRlci5jcmVhdGVMb2NrKCBpbWFnZSApO1xyXG5pbWFnZS5vbmxvYWQgPSB1bmxvY2s7XHJcbmltYWdlLnNyYyA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUZnQUFBQklDQVlBQUFCeVF6S3ZBQUFBQ1hCSVdYTUFBQXNUQUFBTEV3RUFtcHdZQUFBQUdYUkZXSFJUYjJaMGQyRnlaUUJCWkc5aVpTQkpiV0ZuWlZKbFlXUjVjY2xsUEFBQUNxZEpSRUZVZU5yc25GMW9WT2taeDU4NTg1WDV5cHhvS0hvakl3Z2lMRG91eTdJMzFTaElXYWlOQnFrdHJDWkt1NVNXYW5JakxYNUVzYTJ5SWtsWmFFVXAwYXNXZ2xiWmxKWDFRbTlrOFVJTWRLVmVxSjNGcjlyVU9uNGs4ejNUNS85bW50azNaMmNtRXpWMk9ITWVlSGpQbkhsbmN2STcvL084ei9zMVJJN05xN2tjQkhPM2pTZS9Ncm1JYTZjU24zMzhUc0lCL0pyV2ZlcnY1dFNqcndjTGs4LzZpNWtwS2hhTHlsMGVIN1YxZEE1Zkd1d2VzSDdHY0xBMWJ2bUplME9lVkxJLzB1YWxCUXNXVUVkSEI1bW1TZUdBbjF5VHlmNk52L3ZiaUtQZ1Y3UWYvZkhMcnZURXc4dCtyNWZhMnRySTQvRlFQcCt2ZUtGUW9GS3BSTjcyam9HLzdGNDM3Q2g0am1aa0pudERnUUJGSWhGcWIyK25hRFNxSE1jNEZ3NkhWZG5tS2c3KzVNUmxVejduY2RETmJoLzg3Tk80VVNwdUNnU0RGR1FQaDBMazgza3BtOHRUTHBlamJEYXJTaWlZelN5VmNuMWNEanVBRzdEdjcvdHpuMkVZUTIxK254bG9DMUNJNFVaREFRcjYzSlRLZVNpVjlWS2F3NFVHbUtpUTJTMkFteTRHNzlxMUs4NlBubm40OE9FcjgvVTNMbHk0RU92dTdrN1VxOU0zZk1ua0RHSEU3WFp2aWtZamxFcGxWRGd3STJIcWpQZ281R2ZBMlNKTlpnbzB4WjVpd0dLbEFzT2UrTWZTMy83aWg0bW1VdkRPblR0TGFEeWdrbVBIam4yakNMMVZkcm1xdnRaTDNlVWNxMUNWK0c0dk4xVEhqeCt2Zk1lZHlBZUg1Rzh4MUZWY3hMaCtQTUF4TnhvSlVjQnIwTmVQL3NOaEFXQTlGR256VUpnQmU0eENSYUg0VTk5Y3JaY3l2Z0R5NU9ZQ0RBQ3hXSXhXckZpaC9obllpeGN2Vkl4N0U3WjQ4V0lGRjFrQVVpeXhGNDg2QmhGUEFka3dYT1QzTXNBMkg3VUh2UlRpVUpET1plbkJoSWQ4ZlBNRFBrUEJqUVE4Nm5weFg0cnMrS3l1QnlQVURzRG5td293R3BBbFM1WlFQQjRudjk5UDU4NmRvMmZQbnRHYU5XdFUzdm02TmpFeFFjdVhMMWRwMWZQbnp5dm5WM3I5bEZlVWlOd00yT2N4MkYza2RSdnErSi8vU3FrbkFLLzlyT1lBUXdkNDdtTlF2bENpTEh1dVlKRCt2QldNSnN3aW9BaFJHUHp4NDhlMGZmdDJHaHNiVTJCZTF4QkRjZVB3ZC9Ca2lDME1SNGk1S3JnZWRyZWJRd3BDak1CQ2I4MkY4d3ljUFZDR25PT2Jrc256dWZ6MHpkQkRXclljbnBvS01McWQ2WFNhWHI1OHFWcGx3QjRaR1ZFcXZuZnYzbXQvLzhxVksxVUlRcWZnK3ZYcmxmTlBGd1VKT0FIV1c0Ym9aUVdqOVBDNVZFNUNRRW1GZzRJS0MzeGNMRTJYU3Z5bEdRb3VOV01lbkVxbDZPSERoM1R6NWswVmc1Y3RXMFpuenB4NVl6RVlvZWYyN2R1RXh1dnExYXZxS1lFOVc3cTRISDhOMVVQRCtTRFg4Zk0xZUQxdVZtOVJ2WTh3a3MwWE9Yc29NSHlYeWlMU3VTTG53K3o1MGd3RkEzN1RBWVo2SHp4NG9DNFUveWpLOWV2WDF3d25qV1lTNG5nUzd0eTVRd3NYTHFTVEowOVd2dUREWDc5L1dhbXpXSXlWTXdqMTkzRWprSFdFT085MXU3MlV5eGNZYUVHbFpnZ2hrNW04Z2czSUdYWmR3OG4vUHI3U2RJQzU4ZG5CQ2g1S0pwT21OUjJyQjdNZVZLdGpjSWJEVDFML3pzK1BmTFJPZi8zZFg1NEE2RDYranQzOEpKbWRuUXVvcy9NN3JOUWNRL1hTaTNSZW9VVCtPMW4yVks1UVVYQWhsMFl4cnE3cjRNR0RwV2FDL1BUcFUzcnk1TW44ankwWVJvSWJ2SUZUcDA2ZHIxWG4zWjNINHd4dGhOVWNmL2U5OXlqSW9hTTlFdUZHMFUvQmNrZGppaFdjeXVZcG80V3hRblpxL0pOdDc2OVdnSThlUGRvMGdLVmYvemFONGEwZUhCd2NyL1graWgvL0JnTTNReXRYcis1YkVJMnFRWjF3S01pWmhJZlNIREl5MlcrTlJYQW9TZS80dzAvWG5GYUFUNXc0MFRTQWtUWFVDZzN6MkxDT2N5Z1kyTHQzYjkydStVZWZYaGx5NTdQOXdmS0FENjRWK1RUQWlxdkd6ZVZLL09ubmE1ZFdiaUJpVXJQWW9rV0xLaTM3MnpKdVZPUGN1RjQrY3VUSUZRWTJzSC8vL3FwcUxvUTZmcC81OTcxK3BIZ0FheDBQaHFPLzdBcUdaOHhxdUM1ZXZOZzBDa1llWEczOFlUNXRjbktTV01FcWc0SHo0ejY4YjkrK2dXcDFmL0RKRjBQMDhtay9PaXR1dDF2bDB3SWNwVGU2Y1BqOG51L05CSHp0MnJXbWF1VGVsS0hYSnAwREhZUTgxb2liY0VETlpES3FSQjRPNStOeHJyL3V3SUVEU2V2M2ZuamtpNE9sOU12ZHBYeld6S2VuNStYY29XalNHellQZmY2ckRjUGZ5bnB1M2JwbFM4Q0lrWlZlbGZUQ0dJWU9XTUNpRkxqd3Fha3BsRW11dDY1V0E3ang1RmNxWjhieFp4Ky9Vek4rdSs3ZXZXdEx3TmJHVWlCTEtBSm9BYXlyRjNBMXJ3dTVvZXRJSkJLMkJ5eGc5VklVRFNWYjFZdTRqQkpqSWx3bUdQSnE3aThrWHlrTlJMZlF6b0FCVWorVzExSktnd1czc2lnM3VqSDJ2L0xMZGE5MEhmZnYzeS9aSFhBMTlWb2RJUU1LaG5yaFVDOWNqdm05UTl6b0haenpkWEFlYUV2QVVKOCtSbEVQc3FTSGdDeWhRZUJpM0JqSFhDSWVvOWVYbUZPSXdGMnpveUZUa0xrNFBQN29HS0NzMWxORUhVQ1dFVFJKNitEU1MrTlliZkxyUWE2K1kwNEt2bkhqaGkwVnJIcFdiQkpmQVE5anpFamZKSVhUMVN2SGNHUVhaZFhPY0V3ek1laWxjMUd4UjUrYnNwTkJmYUpnd0FWVUtCR1EwUjFIS2UvcjRRU3Y4UjRhUCttTVNNNk04M3pqNXFSaTE5allXTW11Z0FGTEFBT09nQU5naEFLWm54TVY2eVdnaW1xbEZPY2IxZEZvMm1aYkJVc2FodkFnNnRVWDZZbGlCYktlZWFEVWI0cUVGWEgrbmsxYzdYUkRnUFhaVmJzQmxnWU9rQUFZY0l2bEdXSnJBeWhnNWNhb2FYb0xXRGpxOG52ZERRTzJxNEwxK0N2cUZlWHFvUVBRQUZsUDZhUWUzdGRkYmdiWDZXcTRrYk9yZ3ZYd0FMaWlYRjIxb215VU1zbXFnNWFiSUhDMUhwL0pNVGpPUHQ2eUNoWVlnQ2RaZ29DVm1Lekg1Ykl5WnloWWJwSW9Yajh1ajZTTnQ2eUNSWG1Tcm9tYXk2bldqTTRFM0twK1hjWFZuS1kzd1p4dldRWExFaXhaam1XRktwMEtjVjIxK3F5S0RycmF5czFaQVkrT2p0cHluMFpQVDA5SjRxclZyZU1ST3N6WnBxdzB1T2h3ekRyNDQrelJtR2R6QUR1QUhjQ09PWUFkd0E1Z3h4ekFEbUFIc0dNT1lBZXdZNjBCK0cydmxLOWxicnVCM2JwMWE5K3FWYXR1WUprL1pvNWxpaDZUbXpLdkpndFE1Q2JJMm1ITUpNdHdKbFpjWXF3Y1c3OVFZcFVQRnVtZ0RvWTNNWHk1WWNPRzJLVkxseTdVdmRGMkE3eHQyN2JMRExNTGNOV1BaNVIvaVFUbDlKNjNrRG92cGU3bENVM2xXQWNoeTFqMXBWU3k4bEptcC9rbUxlM3Q3VTNVdWg3Yi9TQUhxd3UvOHpCalZidStVVVZiQ3FYVXJKZW9MOU5DK3FJVDYyZjF3WHVhbmpwcUhjQU1JRjVyazZKMXBhVzFuc3pqNGJWMTFidTI4cjBTS3ZTWjZwWnE1S3l6Rk5aajY5U1BUQWZwWmJVcEl1dVBmRFRTbU5wS3dWdTJiREd0RTVYNmRMdk1LdXZUOE5hMUQvSTVtV211dGpZQ3JzM2p4Vm9HTU1PTjY0QWxubFlEVkcxQlNTM0ErdkpYY1MzY3RBNWd0aTU1akFWdU5mWFdnbHRQd1ZiSUd1QzFyUlNEMStxeDFBclhHaTZxbmJlcXZOcG5MUFc3VHA4K2Jkb2VjRTlQVDB3VVhLL3hxZGRnV2V2TTlscnpUYTJnNEw1R2djNmxUajNRRllpRzBXdDd3QndMZXhzZG82aVd1dFdyTjl1UGd6RGdyck5uejhac0M1akRBN0tIV0wyMVpIcG5ROStUb1MrbjBuOUoxWHBjYlltVkpjNXZzbk1XWVZick1KUzd6cFhkUXVpZFNVOU4zN3NzdXozMURZblNrNU9kbjlwRzhjcUFUMW05QXR5ME0rQ0Vya2pBdEVJV2lBQ0drVFZ4MlNZQXR3S1dQY3o0akQ0MklZcUdZUnlqL0VRa2JUMmF0bm56NWo0R09zU0FUR3VhSld1Q3ErMjNrRzBCa2dPTHdrWHhvbHE1ZVhwWUFWaU0yblYyZGc3djJiTm5vQ1dHSzd1N3UrTVNNdlNHcWxwSFE4NVpGMWZEQmJDRUJIMThRM2FGQXZibzZPZ1ZjdXovWi84VFlBQUFXUjNncFpVVERBQUFBQUJKUlU1RXJrSmdnZz09JztcclxuZXhwb3J0IGRlZmF1bHQgaW1hZ2U7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLE9BQU9BLFdBQVcsTUFBTSxtQ0FBbUM7QUFFM0QsTUFBTUMsS0FBSyxHQUFHLElBQUlDLEtBQUssQ0FBQyxDQUFDO0FBQ3pCLE1BQU1DLE1BQU0sR0FBR0gsV0FBVyxDQUFDSSxVQUFVLENBQUVILEtBQU0sQ0FBQztBQUM5Q0EsS0FBSyxDQUFDSSxNQUFNLEdBQUdGLE1BQU07QUFDckJGLEtBQUssQ0FBQ0ssR0FBRyxHQUFHLHd1SEFBd3VIO0FBQ3B2SCxlQUFlTCxLQUFLIn0=