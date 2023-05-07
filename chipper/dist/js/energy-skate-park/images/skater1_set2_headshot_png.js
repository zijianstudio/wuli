/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
const image = new Image();
const unlock = asyncLoader.createLock(image);
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImltYWdlIiwiSW1hZ2UiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwib25sb2FkIiwic3JjIl0sInNvdXJjZXMiOlsic2thdGVyMV9zZXQyX2hlYWRzaG90X3BuZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSAqL1xyXG5pbXBvcnQgYXN5bmNMb2FkZXIgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FzeW5jTG9hZGVyLmpzJztcclxuXHJcbmNvbnN0IGltYWdlID0gbmV3IEltYWdlKCk7XHJcbmNvbnN0IHVubG9jayA9IGFzeW5jTG9hZGVyLmNyZWF0ZUxvY2soIGltYWdlICk7XHJcbmltYWdlLm9ubG9hZCA9IHVubG9jaztcclxuaW1hZ2Uuc3JjID0gJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBRVlBQUFCR0NBWUFBQUJ4THVLRUFBQUFDWEJJV1hNQUFBc1NBQUFMRWdIUzNYNzhBQUFLeDBsRVFWUjRuTzFiYTJ4YjVSbCt2bk96SGNleGRaTFVUZHcyeDZtVE5KQkFLQ1dsdElpd1VZcW1EYlVxbTlpb3VBc05JYkZwS21oSUd3elkyS1d3ZFZNMWdTaFRmMEFIVXpVNkJpaE1XcHUwdEtWZEN6UkptMlIxWTZlSkhWSmZrdGlPajQ5dlp6OXlXVzV1N0hPT0hYN2srUlg3TysvenZlZko1L2U4Ny91ZGo4aXlqR1hNQjdYVURueGRzU3hNQml3TGt3SEx3bVRBc2pBWnNDeE1CaXdMa3dITHdtUUFzNVNUT3dTN0FFRElNUHlsMCswYUxaZ3pjMEFLa2ZrNkJQdDJqcVllUzh0eUl3QUxSWWdNQUJRaEhFZFRSUXZaeEpLcENJQmtNaTB6TkNGdVFuQXVua29mY0xwZGJYbDNHSGtXcHI1NjdXNFo4bk02bXVZTkxBMGRUWUVpSkdlZVpGcEdJcDFHTkpHS1M4bFVraUxrZENLZGZ0VHBkcm0xOTNvQ2VSSEdJZGd0TkNFOVJTeHRMZEd4aXNTNEZzUmtDaUVwRVpPQmM0bFVlbGMrQk5KY0dJZGdiNklJT1Y1bTRJcDFESzBwOTF5SXlSUkd4SGlNRUR6ZTA5ZjNqcGJjbWdyakVPd1dscUo2U2cyY2xhVUw4OEJMeXpLR3h5VlJsdVhkdmE2K1AydkZxNm4zREVXT21IUk13VVFCQUlvUVdJMDZBeUhrMWNtbm5EYThXaEhWVjYvZHpWSlVnNUV0ZkFaQUVRSmV6eHBvaXJScXhxa1ZrUXo1T2Q3QXNWcng1UW9kUTRNbXBNb2gyRnUwNE5ORW1QcnF0YnVMV0liWCt1bVRLeXc2Vms5VDVIVXR1RFFSSmlYTEw1aTRKVTJpQWN4YU5VMXF1VlFMVTErOTl0dDZodWJVckpZaW5YYWlXblNzbnFXcGZXcDUxSHRFOE5OaWx1WVd1OHhzNUZEQkcyQTJjakFYYzR1S2tVaW1NVFllbi83c0g0c0JBTWJHRXhnYmp5TXFKUmUwMHpFMDBtTDhGb2RndDZpcHRWUUxJOHR5dzdVU3VUVXJpckZ1alRublZjRXlGTXJNK3VuUE0vOEdnS2lVeEZBZ2lzdmU4RHlSVERxV0c0OG5Id2Z3YWs2VHpvQ3FCRzlkZGZVREJvWisyNktmdjJETVJnN3JhMHBoTmk2Nm1GVGp5dFVJT3Z0R2tFaWxBVXpVVnY2bzFOWGRkN2xSS2FlcUdFTVJjdjlDcThWczVMQ2x3Vm9RVVlDSlZYbjNCdHYwZkF4RklFTmVyWVpUbFRBcFdiN1ZNRWVZSWgyRExRMVdzRXhoZTJBc1E4MzZaMUNFMEE3QmJsSEtwOWo3eVFwYVAvZjc5VFdsQlJkbENpeERZWDFOS1FCQXo5REZBQlEvdHRYY1FkUGs1Tk1vTSt2bkJjbEN3Mnprc0daRjhlSVhMZ0xGd25BMDlUQTNwMWlzNEEycUhkSUNheXROcWprVUM1T1c1UnVZT1VsZG9ZTHRZakFiT1JSeEREaWFlbGdwaDVxZkVsL0k5a0t1c0pyMVlDanFVNlgyYXU1TTFYcjErRU5xekJmRkNyTWVIWmN1N1ZkcXJ6anpwUWpKU2RSZ1dNVDdKN3JoQ1lUQW13eXdsWmJBYzdJYkFOQmN0d3JOZGJhc3VWclBYb0lvSmVFSmhHQXJMWUZCeDRBM0ZhRlJXQUdEVHB2T1I4RktZZ1BIWU1mbWV2QW1kUUZhbEJKd1ZFNDhrbmRzcm9mVEd3UUFkTHFHQVdCYTRDSzl1bHRUVkJJNEJMdkEwdFRsVWoxSHpZd3pXeHFzUy82NG5zSXI3eDZMRDQ5RWRFcnRjNDR4RHNFdUdIVk03NmJhY2twTXB6QW1KWEtlOU9URkFiejBUaHY2aG9JNTI4N0VCNmQ2Y082U2Q4R3hZbU14ZGRPNm1yMUt1WE1XcHN5a2YzdGJrNDI3VWVEeFlJc0R0YllTQUFCTFUxa3RYMUZLNEIrbnVoRU1pM2pqNDdPNWV6eUpvK2RkT0hMZWhiOGQ2NEk0NTUvajlBYXgwc2d3SzB2MFA3cTV2dllCSmZ3NS94QVRxVlNEamYvL3J1cW11aFZBWGZiMm5rQVlVaUlGQUpEbGlhQ3NKTzZjNmZVQUFLUkVDcDVBR0k1S2Zuck02dytocm9LSG82SVVIM1lOUFFrZzV6Mm5uRmNNeDlDYWJVVEZreWtFdzZJaVd5bXhjS01LbUZpVlpTWURyQ1k5RWlsNWxSTCtuSVdKeEpLYXBiY3NROEZXcWl3ZHF1QW43Q2hDWUxoR3Z6a2lKYlBQQTJZZ1oyRlltZ3lGeE53RDdoUWNsVHlLSnh0YjVpSzk0cnhqNTViclFGTVVCS3NGdHJLU1dXTk9ieENySndVdk5YSVJKZnc1eHhpV29WN3ZIaHpkczdHbVhNbDhBSUNmN0x3Tm4zYjFZK3Y2dFlvNWVKTUJyejJ4TGVONDBlUVdWenlaVnBUUTVMeGlBbUZwZjlmQWFHd3FnQ29CYnpMZzNrM3JOTXRTTXlHV1RFRUdBa3BzY3hiRzZYYU5HblhNdnVQZHcwcm1Ld2pFK01SUC9ULzlJMkFvb21nclJWRVJlYXFqK3hsZlNEcngwZWVEOEFTak9IM0poNzdoc0JLcXZLQ0lZekVjanVIY2xaSHdxYTRlUlRzRmlndUt6enE3dHpnRSsvWlFOUDY5bEl5ZEcydkt2eGJOR0k4L0JFWmZqRU5mZVB4aUlyVlZLWStxU3N2cGRoMEdjSGpEOVhWaEFGOFBZUUpoaE1jamIxN282MzlDRFk4bW5TWlpWaGJnbE9DbGQ5cXVPZTd4aHpCd05YaFE3VHlhdEIxWW1ocjBCS05WTTBzRnBUalQ2MEY3aHd1T3lsTFl5a3FteXdWUlN1Qk1yd2VOZ3ZXYTlwZUhncU95TExlcDlVTVRZV1RJaDMyaDJHWXRoR211czZHNXpnYW5Od2lQUHdSbk9EbzlkczhHeDd4a2JpNGlzWGptV2lFSGFDSk1JQ3p0NzNEN2Y5WWs4T1pjN0lKaEVhS1VXUEJtSFpYOHJNSXdHemk5UWVnWXVqTW5vd3pRUkJpbjJ6VzZab1hsY0hzSDk5QWROd2haMlFURElnNmZHMENWb3g0Zkh1bUZqaUdvWFYwT1hpZURRUXEyVXRPOEJORGpEeUVvRWJnR2gzSHZSc2Q4UDd3QmlQSGtJUzN1U2JQVzVvQnY3TWRSS2JIZFVjbWJGMXZ1VTBpQ3dVc3Z2NHltcGlhNDNXNjQzVzYwdGJVQkFQNzVTU3ZTNmRuWnRhTzJEc2ZPSE1mV0c5Y3N5SGVxZXlBZWlrcXFBeStnOGV1c1ZWYkw3UUErZm5qclRjWFo5Rmg4a1FRTy9Mc0xieC84SzFwYVdoYTkvc0NCQS9qRGIzK0pSMXRxNTQwNXZVRzhmK0xpaVVGL2FJc0MxK2RCOHhlZ3E2eVcyMGNqc1g4OWVGZVRQcHNZSVVvSi9LWHR2OWk0K1hZODl0ampDd3JrZHJ1eGQrOWVIUDNrUTN4L2szM0JHdXMzN3gyUGZ6VVNxWk5sMmEzQmJlVG5sWGxDaUdBMjZqNXJxcTZ3M3JQQmtWV3gyT01kdytWZ0F2MURQdkNsWmRQZkQzcThFQ3JMVWJmU2hFYmJ3cjJiZzBjNzBEODgrc1pYSTVFZmFuWVArVHhrc2JyY3ZDZWVURDMxMEYxTmhtempUcTQ0ZUxRREhuOUlzNS9RRlBKK0xJY1FJaGoxck92dTlRNWsrOFRLQnFLVXdLRlBMOFlIZldNbnZocUpmRU16NGtua2ZmTlpsbVczMmFnZjh3UkNlS3YxODNrZGZTVVFwUVQrZVBpeitQQkk1RS81RUFVbzBORS9paEQ1QjNmZWdPWTZHL1ljT2pHOWE2Z0VUbThRdjM3dmVFeVc1WjBEdnJGbk5IUnpGZ3I2MW5LajNRcEhKWS8zVDNhanZkT05lemJVWkozZGlsSUNyV2VkdUhEbGFuOG9LcldNamNmYytmUzFJRWYvVnBlYlIzYmZ0M25XKzNCT2J4RHRIVzZJOFFTYTYxWmwzSkFYcFFUYU85MDRlWEVneGpIMEh0L1krUE41ZHhoTGVGaDBxaFlLaGtXMGQ3alIzdUdDUWNlQ054bkFtd3pvSFF3Z0ZKWFNoR0NBcGVsOW9haTBYNWJsZ2gwZVhmSURBTHpKZ0IyYjY2Yy9lL3doaVBFazdtZ1U4TnJmVHc3NFJzZUZwZkFyNzhJUVFscHVycW5NdWg4eE05K0pwZWhWNWdyQlBYT2NNeFIzQWlRQXlENi82OEpIQUw3TXgwcFNKUXdoUkNpelgvOVVYSXg4TjlNMUpTdXIwT081cXFqdHlaZGI2VzJ2dEZiTi9HN280dWtxQUFqN0JoSG83OTQ5Y1A2WVdDWmM5M21ndjN1WFZ1VUFvREQ0bXNwWFBVQXh6SzhNSnQ2NjdwdjM2NFZidG9JcnlwelpudnI5STJpcGlPZlVYd21HUlJ3NE9ZaHRyeXgrYUczbzRta2NmK3ZuSWtVenp3ZXY5Q28rUHpBVE9RbERDTEdZVndwSHpCWDJodHNlZVlFMWxXZTNYeDcyRGVMWXl6dnc3TTViczU2cjB6V01DMHc5R25lOW1OWDE4V2dJbi96dWlXUXlMdTcxOVhXcHptK3lUdkFJSVpiaU10dmxwdTFQM3JUdDJUZXpGZ1VBVE9XcnNLYjVXMmc5ZXlsckc2YzNDTk82N01zZnJxZ0UzL25GdTR6RjVuamF5RnMveU5vd0E3SVNaa3FVbSs5N21xKzlZNmVpaVJwM3ZZZ3ZQR0xXV2UvNUswRUlHM0xmRnJyenFkZTR5dXMzYlZNcnp2OEFsclBlbVM5UXFiWUFBQUFBU1VWT1JLNUNZSUk9JztcclxuZXhwb3J0IGRlZmF1bHQgaW1hZ2U7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLE9BQU9BLFdBQVcsTUFBTSxtQ0FBbUM7QUFFM0QsTUFBTUMsS0FBSyxHQUFHLElBQUlDLEtBQUssQ0FBQyxDQUFDO0FBQ3pCLE1BQU1DLE1BQU0sR0FBR0gsV0FBVyxDQUFDSSxVQUFVLENBQUVILEtBQU0sQ0FBQztBQUM5Q0EsS0FBSyxDQUFDSSxNQUFNLEdBQUdGLE1BQU07QUFDckJGLEtBQUssQ0FBQ0ssR0FBRyxHQUFHLGd1SEFBZ3VIO0FBQzV1SCxlQUFlTCxLQUFLIn0=