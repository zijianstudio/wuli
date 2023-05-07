/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
const image = new Image();
const unlock = asyncLoader.createLock(image);
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImltYWdlIiwiSW1hZ2UiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwib25sb2FkIiwic3JjIl0sInNvdXJjZXMiOlsibGVnX3BuZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSAqL1xyXG5pbXBvcnQgYXN5bmNMb2FkZXIgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FzeW5jTG9hZGVyLmpzJztcclxuXHJcbmNvbnN0IGltYWdlID0gbmV3IEltYWdlKCk7XHJcbmNvbnN0IHVubG9jayA9IGFzeW5jTG9hZGVyLmNyZWF0ZUxvY2soIGltYWdlICk7XHJcbmltYWdlLm9ubG9hZCA9IHVubG9jaztcclxuaW1hZ2Uuc3JjID0gJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBSUlBQUFDZENBWUFBQUI0ZzZDekFBQUFCR2RCVFVFQUFLL0lOd1dLNlFBQUFCbDBSVmgwVTI5bWRIZGhjbVVBUVdSdlltVWdTVzFoWjJWU1pXRmtlWEhKWlR3QUFBeWZTVVJCVkhqYTdKMWJiQnhYR2NmUGpCMTc3VHJCb1VrcnA2MjZxMkpLQUFtN0lHaEZJRjRSQ2tqMHNxcTRQSUJpVitLQmEyTVFmWUNIMUNEeHdFdWNWNFFVOXdIRVd4MGtudU1LcElwRzFHNWFLZUtpMnVHaW9qWVEwN2kyRTlzNy9MK1piKzNKWnRjZWo4K1pPV2YzTzlXWDJTUk5NalBudC8vdmNtNWVFQVJLbWpSZlhvRTBBVUdhZ0NCTlFKQW1JRWhyMWpwMS9DVTl2YjBFVkJlc0FPdUQ3WWYxd3ZieHIzZkQxbUJ2d1A2OXNyeDhNNnNIOUR4UGVqbkplMHFiUHFMejZRMGZnRDBJRzRFTnd1NkVIZWJyZmdhdEJzZzZiQUgySjlobDJEOWdiOEhtWWY4RUhHc0Nna01nTUFDSFlKK0JQUUY3R0hZWGR6cjlYc2NPTHFmSzZyQUsreC9zR3V3bDJEbllLd0JpWFVDd0dJUVlBRitBUFEwYllqZlFvZUUrcVBPdndINEord1ZnK0svQVlDRUlnSUI4L1pkZ0oyRWZneDNrYjcvdXRnajdGZXduZ09FdEFjRWlFQUFCZmVOL0FQc3grMzNUYi9WZDJCVHNSNERoSFFIQm52VHhFZGczT1RETTRvM2VBZnM2N1B1QXNGTzZ5QUlRMEJGM3N4cmNsL0Y5RVhUZmdaVkZEWElHZ2VPQ0g4SStxeWtndktVbENFMG9CWDBXOS9FZTZhWjhGZUVFN0NzczFRYnllK1NSb0dFSElENE9lNG96bHBUQUJRMU5XZ0lROE9LcEx2QmQyQkdqa1NyK0l4ZzJxcEZWeVlKYjdBRHNlN0FqMGxVWmd3QUlxQno4RE95WU1qd1dRYXJRNFh1YjVwRjV0OW1IWU4vbzd1bnBrTzdLVmhHT3c4WTRWY3cybDIxc25iQ0s3M252ays3S0NBUWVQQnJoUU0ybVJ1TVpUM2NYZXJxa3k3SlJCSHJSOXl0Tm81SWFHN21ycjhGRlBDSmRsZzBJNzRWOVFOazVUK0VJUW9abnV3bzkzZEp0NWtINEtPeGVpKy8zRTREaHc5SnRCa0ZBZkVCdTRURVZEU2paMnZxUlIxU2dDbEl1TktnSVZOWjlTRVd6aW14dEhWQ0VDcTU3cmpaS2NhazVDTDJXcTBHdFBRQVlqa3ZYbVFPaFU3a3htWlZjMktOSjNVT3RNQ1V0T1FoOWxydUZ6YjZGZlZvWkdBZ1RFS0kyb0tKSnBpNjBJdXdPK2FhYkFlRk9sbDBYR3NVeis1TUVlaElRN2g0RW1sVzg0ZEI5Zjd0Um5DQXh3UjVBNFBIK3QyRTNuTGpwc0xQRE5IS29rUUpJU3duQ3l2Snl3SXBRZGViR1BlOCsyRk5kRFFhaUJJYTl1WWJBSlJBb3NJVXFmQjR3M0N2ZHFCY0VXbE53bFlGdzVkNEhBY1BEMG8wYVFZQ2FVb3p3a2l0eEFqZWFQUFBGYmhtUjFLZ0lubHJDankvQy91UFEvVk9RK3lsa0NROUlWMm9DWVhWNW1WTEhTeXBhdXI3aDBEUGNCZmRBcWlBNW82WVlnZHpEdjNCNVhVV0xVbDFwVkJaL0hLcHdRTHBURXdoQWdkekRSZGl5WSs3aGcxQ0ZJZWxPZllwQTZlT3JuRDI0MUdqQTdIRzRCOWtLU0FjSU4xWlhxQmJ6cG9wMk5uRXBUcUFoOU05QkcrNlJMdFhpR3NKbGFNc01na3R4QXJtSEV1S0VyOG8wTmswZ29FRVcxRjhjaXhPbzBZREpsMzNmT3l6ZHFnR0VtNnNyTndNVi9CRWYvKzZZZTZEMm9LZGtHcHN1UmFDZ2NSYVgzOFBlY2V4NUtHaDhyTkFqRzJ4b0FRR3FzSVJZNGJjcTJ1REtwWUVvaWc5b2JjYmQwclVhUUdCVitFT2cxTzhjVklVQjRQQVI2VnBOSUVBVlZvSnE4R3Q4ZkpsKzZ0QXowVURVOFM2cEtlZ0JJVlFGcGY0S1pUaVBqMjhxZDRhbk8rQWZIc1ZWQnFKMGdRQlZXRU9zOENvSStMTkRkUVdLRTk0UCs1Yk1YZFFFQXJkTDFXcHdCY3F3NXRCejljQ2UzTmRkNkJRWU5JR3dkbVAxT2k0L2h6SmNxN296RjVENi94NXhEM29WZ1dENEd5NmZCQWR6RHNGQXc5UDkwc1VhUUlqTEttQ2dta0laSE15NHdJSVhiUkw3MC9ybmFKd3F5NnhuUHdrRU1SaG9ndXVMYnZpRzhISUNjY0t4SlA5L3UrL0Q2Q2VGd01tSGl4N2taMm4rYkxzQjRkYzZQbTZ0MHZoUmprRVZVbThWMkM0d3BLcStCY3FkbCtORmRZVnlPcERhWngxbEdoQW1uY29lb240c0orbndWbFZHSXlCd3dGaHhob09vUTBja1FkemhQWkVQVEVNLy9PNjdIYjdYNjhKRDBvYmZhQWNaWW1tNllnUnV0RHp1cGh1cW9FUVZkSUpRbDFMOUJwK3V1eEVtaENUSUZEWkRpakNINU1HTmRaS2lDSHBCcUl1bVgwZm1NQjg0a0V2eUhROGhyaWxLbDJ0MkRRaThhSWVWY2NEd2hndXBwTVFKNWx3RHdVQm5QSjhBQjR1MnN5Qnhnam5YVUlOaGdaVEJlZzhoaW1CT0VlS0JZK0FFQjZvb2NZSkJFS0FLY3lyYWc4bUZPT0ZKNlhaemlrQnQycEU0NGFSMHUxa1F6dHVlUGJBaVNCcHBFZ1M0aDJsY0ZteFBKTVU5bUZjRWRnK1dxNEs0aDB4QWVONzZPRUhjZzNrUU9IdVljaVJXRVBjUWZ5ZHA1eU0wYS94Tm02ZXpubTF0eENsZ25RTzR3NEtBR2RkUXF6Uk8ycXdLNGg0eUFJSGJXVWRpQlhFUEprRmdWYkE2bFpUc0lSdEZvRFpqOHppVXVJZnNRSGpla2V6aEdjSEFJQWh3RHpPNFRGc2RORWJ1UWVJRVpmN2sxL0Z3MG9xOUpFakxBZ1FPR2llQ3F0VXVZa0V3eU9Bc2FNQXdHVkFHSVZzUXREY0kzQ2FzakJVQ1VZUk1RWUFxVENsN1ZlR0tZSkNkSW9TcVlPa0UxNVA3dWd2UHdkcDZ2eVh0ZzA3Yk5ienNlZC8zaWpZRjY2UlNRYlJLWjR5VlN4UWhFMVd3ekQvUWQ4Q0xSa3JQQU5RejdWcHB6Rm9SU0g1SkZmcHRTK0Y1YUpvK2xya1lKb3BnTUdpa0tlOW5iWnpPRmlxRHR4a3pGQVVFODIzSzFwb0NsNXhIMmRxcVpYN1NDVlViOFkyajZXeWp2bVg3Rk5IdCtJQ2gyZ0xWTDd6amtRYS9QTmRzMTVpOGpyeWhpU3VqTnRmNk9aNmhRMFdMYk5NOEo5TjJBRWpOVG50MHo5N3RjUkIrZjRHQzl2b01LZE5nc2U2R0wwQVJSbXpidkN3V05LcjR2UVZiVmNnWnZNUXhTeFhnRE1Icmg0dVZkM3krU1R6SHVBMGcwUER2Q3paUGNyM3RKY0txMFFDYVZUVUhLb2lSQ213SFFIMmo1d2hvMTVzb1Mxck1EUVIrZ0huY2ZOR2xMUTM1RzdXQWwxZXlCSUp6Rk53aUpkKzFwNjJHRzUrRWk1ZUg4ejczYU1LbFhWdzMwOHhvZWYycHZHTVkyQ3p1WmJRakJRUmh5aGdwQ01WQ3hieEJtTFo2NGtvekdMWXFrVU01UVVELzdnVjA0cERmd0xVZTdPOFB6Zlk2UWp5VnRMYkF0SDI5SWZvMlVXZGtQVmpGUVNFRjJrT04wdTlTcWFTR2g0ZlY0T0JnOHNBbmJ4QzRUYnFZdG5NbGtpQzRrSEZRU0JEME40cXJEaDg2cEVyRm9scGZYMWVYWG5zdEVRTkJsQW5ONVE0Q3E4S1VpMFVjL2tZT21ZNFhTQVVvc01ZL2R6b01DaHRBVUNnVTFOR2pSME1JWHBtZFZhdmhwbmM3QmI3aE81L0lQV3VJUFNnVmJPWmRTaVZyamZkNUx2SDhUTzBCSWFXRnNGUGJwWWFkblozcUliaUR2cjQrOWZMRmkycHBhU2xwS3J5Wi9WaHhXaXEveEJuWFJDRldtREVCQWRWWlp0SDVwenI4N2VzRHBBUUV3ZVhMbHhOQkVJSVFBVHl4NmVwc1VJUjRFT1JVZ1NtcUtaQnJvOElNblhVVnVybTB1OEN6QWhBQXRCUnZKRW1CaUZ6Q3dNQ0FXcnArWGIxOTlXcnFXb2cxSURoYllJcEYzbFFUd2Vza24vdGNpczUvZ3E2ZXF1MW5hZTUrNFJJSTFISjg3TVEyRUVaeE9lZGlyQkQ3cHRWKzJtekx3ZmdwZWZmRFJrMTNmb09ZWnN5YVFhZHRZSmlsSE5uMWszU0NoTCtZNVhQeStNSXRnMDAyZytCY3JPQktZRXRuY1RYYkpjYTM3WVo1dnVDTXJJelM2N0o0Y0tucElXZStwZmMrVVJVUzlBV0hXNU55RjUwQ1FWUkJiMXpBd2VHMnM2dDhpNS9ockJ6ZXJRV0NxU1NUYUt3TEZ1dnk2MnNTTkpvSkRwMVJCUFpuNGg3U1F4QWUxSnIwei9pV1A5TjUxMll3V1FSQmVUZGpJTGFESUlxUXdoM2c0L0J1cDk1Ykd5UEVZZ1hyVmxCYkRrRTV6YUNYNzhBenpvaDNNQXVCS3lDY2x6VFNMQVRPS0FJdHhKQktvemtJbklnUk9FNG80akxiYk5KbVcwSlF0MUpwcjMrZkM0cFFtOHBXcHRsQUlneWJFRXpyZ3NBWlJZZ3BRN2hlTXBwSzdyWGx4cWtNd1pUdWhiaStTeStCVDVJYkJydFROTjBxZkNtQmFwdWt3aFFFemlsQ0U0V2d1WDRVUTlBeXNHaHZKbTl6elVGTHRIQWhpa0VJbkFlaEFSaTF6UzFhWm9aVGJCN2tyaWJGdGpVSU1TQ0NWZ0NCMDBNS2xDdW1kMnZ4bFRRclZXQWppbjhtVllweGd6U3RzMFhmNVJ4ZW9wTXpvV09qaDJNY0hHZlNXbFVSeGwyclJOTGRzZ3BRNTVleWhLQmxRWEJ0em1NWUVFYXJqOFp4N3hWZFJhSzJEeFk1WUtTVTB1NFRhYmZTd2prT0NCZnl1cGVXRFJiNXBWcTc3d0tyQUVGQWFlRnduaEMwdENMWXJBcFpwb1dTUG02cGdqV0xaZkpJQzBVUnRsVEJpcU1CWW5zcGpHV2RFYlM5SXJBcVJEdTM1WDNrWUVUaG9vMFF0SVVpeEpTQjlpVWN5WE13aXZjbXFJZ2k1TnNxTkswcnozaUJJYlR5TE9xMkFZRmRSQ1hjNlRVbkZuaXhUcitBWUVjV2tjdVV0L2hFVXdIQkRoakNLaDdCa0pXYjBEbmJXRURRQzhNTUxpVWE0Tm1vbWwxZDZRSUViWlUxYkpOTjBQYTVwMDFNbFk4TktaZHNocUJ0RmFGT0hTWTVidENhVWNUM0xiSWRBZ0hoMXJpaFRLVmZMZ0h2R1FLdUlwWmRPQkJNWEVOalYwRXpvOC9SRnZ4cGlrOHVRaUFnTkllQmN2MFg4RlpHdkYwY2srTXFCT0lhbXJzS0doTW9CelRsTGFHcm9QakNWUWhFRVpLcHc1Q0tsdGtWbTdtS1dJcFl5WHVDaVNpQzJVQXlYR2JYS0pDc3F4TXNPUHVnc2duRjdnSkoyTFd1UWlFbzlQUUVYZDJGZ0VZMXN6N2dTMEN3QTRZaWQzN0FoMisyUlB1L0FBTUF5MHduMTJsMXVRb0FBQUFBU1VWT1JLNUNZSUk9JztcclxuZXhwb3J0IGRlZmF1bHQgaW1hZ2U7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLE9BQU9BLFdBQVcsTUFBTSxtQ0FBbUM7QUFFM0QsTUFBTUMsS0FBSyxHQUFHLElBQUlDLEtBQUssQ0FBQyxDQUFDO0FBQ3pCLE1BQU1DLE1BQU0sR0FBR0gsV0FBVyxDQUFDSSxVQUFVLENBQUVILEtBQU0sQ0FBQztBQUM5Q0EsS0FBSyxDQUFDSSxNQUFNLEdBQUdGLE1BQU07QUFDckJGLEtBQUssQ0FBQ0ssR0FBRyxHQUFHLGc0SUFBZzRJO0FBQzU0SSxlQUFlTCxLQUFLIn0=