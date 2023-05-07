/* eslint-disable */
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
const image = new Image();
const unlock = asyncLoader.createLock(image);
image.onload = unlock;
image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH4AAAB6CAYAAAB5sueeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGRDM3RDI1NEQ3ODkxMUU3QjA1RjhCNkJDQzY2ODUwOSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGRDM3RDI1NUQ3ODkxMUU3QjA1RjhCNkJDQzY2ODUwOSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkZEMzdEMjUyRDc4OTExRTdCMDVGOEI2QkNDNjY4NTA5IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkZEMzdEMjUzRDc4OTExRTdCMDVGOEI2QkNDNjY4NTA5Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+oSosrgAAB9VJREFUeNrsnWts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';
export default image;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImltYWdlIiwiSW1hZ2UiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwib25sb2FkIiwic3JjIl0sInNvdXJjZXMiOlsic3Rhcl9wbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgKi9cclxuaW1wb3J0IGFzeW5jTG9hZGVyIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hc3luY0xvYWRlci5qcyc7XHJcblxyXG5jb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG5jb25zdCB1bmxvY2sgPSBhc3luY0xvYWRlci5jcmVhdGVMb2NrKCBpbWFnZSApO1xyXG5pbWFnZS5vbmxvYWQgPSB1bmxvY2s7XHJcbmltYWdlLnNyYyA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUg0QUFBQjZDQVlBQUFCNXN1ZWVBQUFBR1hSRldIUlRiMlowZDJGeVpRQkJaRzlpWlNCSmJXRm5aVkpsWVdSNWNjbGxQQUFBQXlScFZGaDBXRTFNT21OdmJTNWhaRzlpWlM1NGJYQUFBQUFBQUR3L2VIQmhZMnRsZENCaVpXZHBiajBpNzd1L0lpQnBaRDBpVnpWTk1FMXdRMlZvYVVoNmNtVlRlazVVWTNwcll6bGtJajgrSUR4NE9uaHRjRzFsZEdFZ2VHMXNibk02ZUQwaVlXUnZZbVU2Ym5NNmJXVjBZUzhpSUhnNmVHMXdkR3M5SWtGa2IySmxJRmhOVUNCRGIzSmxJRFV1TXkxak1ERXhJRFkyTGpFME5UWTJNU3dnTWpBeE1pOHdNaTh3TmkweE5EbzFOam95TnlBZ0lDQWdJQ0FnSWo0Z1BISmtaanBTUkVZZ2VHMXNibk02Y21SbVBTSm9kSFJ3T2k4dmQzZDNMbmN6TG05eVp5OHhPVGs1THpBeUx6SXlMWEprWmkxemVXNTBZWGd0Ym5NaklqNGdQSEprWmpwRVpYTmpjbWx3ZEdsdmJpQnlaR1k2WVdKdmRYUTlJaUlnZUcxc2JuTTZlRzF3UFNKb2RIUndPaTh2Ym5NdVlXUnZZbVV1WTI5dEwzaGhjQzh4TGpBdklpQjRiV3h1Y3pwNGJYQk5UVDBpYUhSMGNEb3ZMMjV6TG1Ga2IySmxMbU52YlM5NFlYQXZNUzR3TDIxdEx5SWdlRzFzYm5NNmMzUlNaV1k5SW1oMGRIQTZMeTl1Y3k1aFpHOWlaUzVqYjIwdmVHRndMekV1TUM5elZIbHdaUzlTWlhOdmRYSmpaVkpsWmlNaUlIaHRjRHBEY21WaGRHOXlWRzl2YkQwaVFXUnZZbVVnVUdodmRHOXphRzl3SUVOVE5pQW9UV0ZqYVc1MGIzTm9LU0lnZUcxd1RVMDZTVzV6ZEdGdVkyVkpSRDBpZUcxd0xtbHBaRHBHUkRNM1JESTFORVEzT0RreE1VVTNRakExUmpoQ05rSkRRelkyT0RVd09TSWdlRzF3VFUwNlJHOWpkVzFsYm5SSlJEMGllRzF3TG1ScFpEcEdSRE0zUkRJMU5VUTNPRGt4TVVVM1FqQTFSamhDTmtKRFF6WTJPRFV3T1NJK0lEeDRiWEJOVFRwRVpYSnBkbVZrUm5KdmJTQnpkRkpsWmpwcGJuTjBZVzVqWlVsRVBTSjRiWEF1YVdsa09rWkVNemRFTWpVeVJEYzRPVEV4UlRkQ01EVkdPRUkyUWtORE5qWTROVEE1SWlCemRGSmxaanBrYjJOMWJXVnVkRWxFUFNKNGJYQXVaR2xrT2taRU16ZEVNalV6UkRjNE9URXhSVGRDTURWR09FSTJRa05ETmpZNE5UQTVJaTgrSUR3dmNtUm1Pa1JsYzJOeWFYQjBhVzl1UGlBOEwzSmtaanBTUkVZK0lEd3ZlRHA0YlhCdFpYUmhQaUE4UDNod1lXTnJaWFFnWlc1a1BTSnlJajgrb1Nvc3JnQUFCOVZKUkVGVWVOcnNuV3RzVkVVVXgwL0xxMHBBcUMyb3FDMklRRnRCb1JoQVlnQnRKSXFhaWlINGlrR0Y2QWNKQVpxZ0tBOFZRcVNXK3FBZkpEWEVHRitrYXFvMk1Sb01Ja0hGYUF6NHBnS0NKQ0JGRVVYeGllYzRaOE82YkpmZHUvZk8zSms1LytTZmJuZnZZM2QrOTh5ZG1UdVBnaWVHTm9Lbm1vRWVpRjdpNDQ4dkJIOUZ3QmY3K3VOOUJYOFJ1cHhmM3lIZy9kR3FwTmNyQkx3ZnFrQlBTdnEvMU1lbzl4Rjh1dExzTWdIdmZyUlBUdlArR2VnYkJieGYwWjVRdllCM1UrZDNFdTBKRGZBcDZuMEN2ektMYmVvRnZGc2FoSzdOWWp1Sytxa0MzaDAxNUxCdHZZQjNRMlZaUm50eTdqQmV3TnV2V1FIMm1TL2c3VlozOU53QSsxMkhIaTdnN2RWQzlLa0I5NjBYOEhhcUIvcmVQUGFuT24rRmdMZFBDemlyejBlTkF0NiszN1VnaE9OUTFGY0tlSHRVbDhlOVBWVXJCYnc5dnluTUxsVlR1RzR2NEMySTlwNGhIN05Cd01kYkJSQk5COHBhMTZMZU5mQ3pJNGgySjZQZUpmQmQwQTlFZUh5SytzRUNQbjZpRHBOOUlqN0hYUUkrZnJwTnd6bW1DZmg0NlZMMFdBM25PUmZDYVJnUzhDRnB0Y1p6TFVkM0UvRG1OUUU5UW5NaGNwNkFONi9IREp4emtlMXBWK2hBdEY5bzRMelVWbEFuNE0zSlpHZUp4Wnp0QzNqTkdvTysyT0Q1S2VybkNuZy83dTJwdWsvQTY0LzJNVEg0SHRSU09GdkEreFh0Q1QwbzRQV29PaWJSbmh6MWN3UzhueEUyVzhCSHJ5dGkrSjNPWTF1anJqSDlUbWVpaDZLTE9Tc3RRZmRIVDR6cGR5YTlpMjVENzBaM29BK2pENkIzb3I5RC95YmdqOThiaDRHYVpKQWdVOWNtZXZvMUJOVFVKQVdXNVVSMHNjN3M1TE9ENksvNUF2Z0t2UXY5SmI5M3dFWHcxTVg1YkZDelVWVHlhNEpkeHE5N2doODZIVDB1emZ0SDBmdlIzNkRiT2JmNEFyMmRMNDZmNHd5ZUlyTWZSMm9DYWtVUzhMNGc2a3hGbkY3a3kxSStPOHp3OTZBLzU3K2Y4UVd5RC8ySEx2Qzl1QUJURG1va2FUbG4wNFA1L3R0ZE9JYXEzcUFlTjVPbnBIeTJuM09GeEsyRGNvbHYrZGJ4UXhEd1JYeXZHc1JST3pBcGl5NWorQ0x6NnM5T0ZSVWc5M0pPMGM3ZXhoY0lYUmhIa3NFL3dwRDdjTlpjS3VscXJVN2hISmhjay9MWklTNUxmRSszamE1OEw3bEswc3g1VVdCWDgrdG5xUUdIV3NKcUpWMjhFVTBXY1V1aTVhNFZmYldraWZPNkIzaTI3dVFtMjdZMDl3V1JPN29iL1hEaW45UzIrdlVDMzFub1RjbHZwSHRJUS9ESFNsbzVvOXRUb1hjR252UUIrbVpKTSt1MUZMMDIzUWVaSHNzK0I2cjc4cStTZmxacUJtUVlQWHl5NS9FYjBhTUZ2bldpNnZuVG1UYklwaU1HdFFPUEF2V01XV1FIOU5hVGJaUnREeHg2RUZBdDhHT3ZtbXlnNXdLZXRGdmd4eDc2K213M3pyWFBIY0dmSkdrY08xMmZDL1FnNEVtZmdqVHl4RW5VT1BOeXJqc0Y3V1ZMVnhmTlFuRk0wdDJvYUU2ZXBpQTc1dE85ZWhPb0ZqNkJiMGEzb3A4TXVuTysvZXEzZ0JyVmNsUTRhSWYrVEQ0SENHTkF4WWRjMmo4aVBMUm9hcjdRd3dKUG9sNmdFNFJKNUtJRkVWOEo0MEJoRHFINkNEeFpzODJRbHFKZkNPdGdZWStkbzZ1Um1neC9GMDZoaXViV0MzVzYxaWdHVFZLVElYWEozaU84UWhFTkVnMTlzWVNvUnN2dUFQVmdSK0FIMXpHdU1iMFZ4Y0dqSENiZHdmQzNDOE9jOVNlb05wSXRVWjBnNnZIeEJIK2tWUFZ5MXVnb29lc0FEd3lkcW5wL0NjK3NkQU42YTlRbjBUVWpCbFgxcUpGSGV2SmsxblQwaXpwT3BITXFsSzBnM2JneWlhckI2M1NkVFBjY09OS05xM1BvclRwUGFHTHlJK25HOVgvVjZJWnVDandwMFkxcnA4ZkFPeURIN2xJdWdFL0FmOGxqOEsrYWdtNGFQT2tzajhFUE1YbHkwK0RQOFJnOExiRFF6VWZ3UldCbWRZbTRpT1lUR3U0amVKcDNwN2ZuSmZvUnZvTDNYWlVDM2s4Tjh4RjhwWEQzTStLSENmZi9KcEFzOFFuOGFhQW1VL1JkaGFhaTNoVDRDbkJnZlZhYmN6NlQ0RVZLVlFMZVQxWDRCRjVLOUo2Q2w0Zy9McG9TZm9BUDRFdTRHaU15V01BekFmNENzRytoSVIxcDRqejRhdUY4Z2tiN0FGN3U3ekZJRXdFZkQxRnZuQjR1Zys4QzBrYWZUcjFBYzFjczNlQnBrWnhpNFd5K1pGL284byt6VEZVdWc0OVRpOTBHTURDUXdkZUlyNHBCQXU5QzN3bHFhbFlhdWtTTE1MMFhnKzlWNlRMNG9RWVRsaGJhcStOeXhwcWs5MmtScGt0QURVL2VadkQ3VWYrRW5pNkNMekpVbGZzYnZRVFV1cmdOL0g4NjBmRGtFWndiSERUd1BiV21UNkdyVnpTcmhiTlFXbFR4bHl6M1djTlZxMGFYNy9NNndldU1kc3ErYVpMbGFhQldXTTVWdENMelBMNHRQT1ZpR2NnMThPK0FtaDZNQ215YlFqZ2VMY0k3RTlROFBpMFM4Y0UwS3NKanY4NndKMEkwMDROOXdybkhlSFJ6aEw5anBJdmdveGd1Uk1PTUwwZGZ3OWw3MU5xTW5nVnF6TnZ6RVJ5L0REUjF5dEFGdmgrNlBNVGp2YzhSVGhNTHZHMmdFRWFyZE55RUhvZCt6Y2I2dkM3d1lkM2Zmd1Mxa040NFRSR2V6UVY0TFhveXFDbGVyQ2tFNndLZjcxVk1NMlV0UncrQ2t5eWtaMGh2Y3NGc0RucHZuc2NhTHVDVkhnWFYrSEkvK2hERVc0L3pkMTNJdVZQUTlnNW53QWVwcHF6bFJKaUwzZ2YyaUtac1g4RzUwL0lBK3hlN0JMNDB4NUx6bGFDV3YyNEhlM1dJY3lucVk1akxVOEMrTG9Idms4VTJOUFBsZEs0cnZ3SHU2R05RVHdFblpkbkcwRTlIMU9zQVQ5MksrbWY0ZkFmWGpXaytuSFhncmpiQThWYkZ6Um0yNnc0YW5tTHFBRS8zNmFJMDc5TkUvSXRBdFljM2d6OXE0MXlOVm9nOEdHS1pLSGJnMDVYb214bjRNdkIzd2NJbXJnRThCQ2ZPNTEvbEF2aXhTYS9YY1pZK2k3TjQzL1VUZWpGZkFLdlEvL0Q3RTJ3SFg4Q1J2Wkd6dCttZ1lSSitDN1VmUFovVHFvVUxkMFZSbnZCZkFRWUFDYVlnYXp0eUpnRUFBQUFBU1VWT1JLNUNZSUk9JztcclxuZXhwb3J0IGRlZmF1bHQgaW1hZ2U7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLE9BQU9BLFdBQVcsTUFBTSxzQ0FBc0M7QUFFOUQsTUFBTUMsS0FBSyxHQUFHLElBQUlDLEtBQUssQ0FBQyxDQUFDO0FBQ3pCLE1BQU1DLE1BQU0sR0FBR0gsV0FBVyxDQUFDSSxVQUFVLENBQUVILEtBQU0sQ0FBQztBQUM5Q0EsS0FBSyxDQUFDSSxNQUFNLEdBQUdGLE1BQU07QUFDckJGLEtBQUssQ0FBQ0ssR0FBRyxHQUFHLHcwSEFBdzBIO0FBQ3AxSCxlQUFlTCxLQUFLIn0=