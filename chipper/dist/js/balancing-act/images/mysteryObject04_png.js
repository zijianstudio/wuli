/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
const image = new Image();
const unlock = asyncLoader.createLock(image);
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImltYWdlIiwiSW1hZ2UiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwib25sb2FkIiwic3JjIl0sInNvdXJjZXMiOlsibXlzdGVyeU9iamVjdDA0X3BuZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSAqL1xyXG5pbXBvcnQgYXN5bmNMb2FkZXIgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FzeW5jTG9hZGVyLmpzJztcclxuXHJcbmNvbnN0IGltYWdlID0gbmV3IEltYWdlKCk7XHJcbmNvbnN0IHVubG9jayA9IGFzeW5jTG9hZGVyLmNyZWF0ZUxvY2soIGltYWdlICk7XHJcbmltYWdlLm9ubG9hZCA9IHVubG9jaztcclxuaW1hZ2Uuc3JjID0gJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQzRBQUFCVENBWUFBQURnQlRVb0FBQUFDWEJJV1hNQUFBc1RBQUFMRXdFQW1wd1lBQUFBQkdkQlRVRUFBSy9JTndXSzZRQUFBQmwwUlZoMFUyOW1kSGRoY21VQVFXUnZZbVVnU1cxaFoyVlNaV0ZrZVhISlpUd0FBQWd5U1VSQlZIamE3RnQ3YkZObEZEKzk2MTdBV0htWkRhY2JVWEFqd0JveGNmeUJGQW1pRHJSRVZFVE5KbEhBeEFSY3hHaFFHRVNpNGVHV21QQ0tnZUlEUkZFTGloSTBVT0FQOWcvdWtTQVRFdW5HMktZSWRKdXUzYk4rdjl0K2Q3ZTM5M1o5N0k1T2Q1S1RQdTd0UGI5N3Z2UCtiZzBVbXViNFg4Mk1UZjczTHNZMnhpMTBHOG1nK0p6TnVKU3hGVUN6N3g1TE9kbmpKQVpWMVRUUWtlK3FuZjZiaVJWOE91Tml4aGFaWXBUa2dGakdSMElCdnpWMUNwbEdweEZWbkNkNmNsRStyWG50WWJJOE5DWGdKT3N6dXdBZU43Z3hCdEJZemZMMDlGUno2YnBDTXVmZkZYU0N5OVZPanJPWHlYNjBpdXJxYjFiNWI3SmFlZDdxUFIrUzExbnA0NW96NUYzL0JubXpNc2s3Wi9aazc1WGE5N3hlOTA2UnZ6MjAwc3ZPcjR3QmROR2FsVDRaVEZIZS9CbFozbHROMjZYcnEzSFpsaVdRQ1M0SzBQak1mS3I4MmlZdWZ3Q2RPRVcwb29Uc1REUFc4cTFQVS9HTHMzeExsZm9xK1pjM1VuTXAycmFSYkV1ZThIMW9iU1BhdEpYb2NsMFcyYjljSlpta0d0aytQVWN2cmZnRVBtWVcrSmV6QzRKQmczNzlUWHhaM05MaXR1QkgrREVJWnVSZnVrZ29mL215UHRBZ21PVzJUVVNUc3h2SS9PQm1xcXErcXZsaktHM0R1a0lvcTF5SVFPaHBPQkhBRjcreVg3Ujl2eU9uaDNzQjh6U3lyMStyZmd6ZzN5MXhrMlZCbVdqVFd1U1hhNVdBTyt2SnFYWmkxc1NBc0FqSHNPei9yTUlGelREYkYrOCtYQk41YXpYbGhEb0JLNUYzcjVzV1A3dWJIR2N1cVo1ak1vMkFYSktBMjM4a1cwTmo4SW1QekNXNlkzeUFTWWpnWDMvenNBdjJ5RUltanUzckQzWHVaTElXUEtCK0RIWisrQ2pSL0tmSXdhSVpRbU14VmpYY09KNysrSHh5N3RnU0hFL2hQSHNQaU5xcWs5c3IvSVVCTjd0YTNNUjhvTXFmbkRqbCtGbWthWG5rK3Y1QTM3V2hKRGgrelFWeU1xWFovVWxOSHVvUVRkUzFubEZDUnRubmxoOStvdUs5bjVOOStmTUt1MXJGcm5pQjdPZXJ4Y1JVSjljOGk2L2xmaWNWblp1RlNuRTVUZW1wVW15R3piTGxOd0VvdFA1K09ia09maU1DTFpkZGI0NmZjUjByQzVIcTJZaVpFRk9TeTZCbWl5eCsyNVRnc1p6c3B1ajRTYkxYWHBheTJXbFp4c1ZOV1pqOVdSMG5Tb0tkYXUxWHRNOTJrZ1NCbks1VzhmY21QNHNyQTZDNFdaZ2ZFcDZWUlMwb2dCTjh5bGwzZzBvM0g2UHFtb1pTRHJ4SXZxd0FVVENUekhDV3FmZjVXRTVZWm9SSk1HNm8rYm9JaEdvdmtlbjNPaklYdlZDZ0dvODNNcUZCT1I4ckk5TXVTZ3FtMFZEbWpTQmk0OEJQVFY5WWFFbWZtQm5TSVJMYkx0R0V0TCtEdnIvV2xrbUd0RXlxUC84TFRSclJGbFFpeUJQSTZCbXpxRDg1L1JIa1NEWStmVkVoWmMrOFA2b0wzZU4vUGJ2blk3Sk1hS0xTZHhacTJ1ZWRNY2dobVJ5QmhpZ05BeDhHSGlZWkl6blpZaHhOT1VLeUwyejEvTU80UGY2QkwwMGFSM2tKZlFsaFVrSUttYnFNNU9odWpXL2djdENjQ294cHVnSlBZYVhVMHFUeG9wTEV2ckszbTc3by9DditiZHlhTkZZQ0RSb2pHTVViaVFqNGxSNVAwSGV3Y3oxSmJaVUIzbVJJQ0I4NGxxaXkyd2ZVN2UybGM5MXQ1T2pTZDdRQzAxQWpsN2NuZkJ2M3NBYmIzblZUNU1FaVIzY0xMVTRLTE5hZ3NJakQ0V0FUd3Eycm8wY013U2FEa1p5OUhpa0UzMWJnQlFtaktNWEFDdlRlRHBGVmExaU5Zd0hBemN3WkhrMGNRNmtHUVZxVzQxMHVYVUJEMW1OSll5U2ZLZmMwaXVZWWNjclBNQ1NLOXNSQmcyYXhPRzFXOGV5QklDdzlKOGlVZjQ0SWVGNUNxdW9KT1VLS0xzQXIyR29peFBJSTFlenRpaTV6dXJ4YW9hZGJGK0F3QzF2bjlkaXJ3NHM5Ym1ycTdRdzRDRzNvbldSaXJsVkVEWFQ4eVd4NkpHVUlTYUttQVJyQlB1N0xXb0N2NkdITmNFLzRrUUZSU0p5ZGRONmtzME9sa2VDaEUxeGdIS1ZiaFlnK0FKd2lHN3pGbElDYW1VL3c2azB2azBLRnlJdXREQ0dSMVV3M1lnZU93Z3Mrb1dlbG1DSXpDdm43bUlCTFBxRnJvZFVxSlNkNTB4TFhSUmF2VmNvN212NEhYVDY2REc2L3ZwamVIcGZBelQ5dkw2T1V0RFJaalpKTXh4UVJwTC9xcmFXeGllWXREejBYVk1xSmhpQ0hBemNkK21oaHpGcmdPM0toNk8yWDgxVTNZeU9WSTVtSzFtZzRvZ2lnc2VFVWtHMFo2RmhsUWM3dzdIQVkrSDhkdU9TYy9vY0tZcVlONndwREhwKzdvR3hBZ1R1VzdkNWhHWWk5R2FLbWtPY3dPVUY3UU1WSkV3Sm1oTHo3K3NCelRWTk8xS2FDQkFWT0lVUE0yc01JUkQ1dUEyZytsWTA0NVdzUnhoaVltR0w0S0JlaU5kQUpxNjVuSFQ0S0tiNXBFRTZXamxqamp5YWFKTkI4SnNKSHZ3TlJDWUxER1F4RkRGeHBpMzBEblFUZElnaFdXV21XRVpzS2JGR3VjVzR1ZXJWdXVVSXFQWmZzVzFHTVQzWjEvQkdkeGpGbUJ0QkE1N3FsbjdaWm44a3BVMGpTMWppV0E2MlMxa2dNTnJpcm8xblVCQ2F0ZXM5ZUlBK0tnamxlbFBVRVJtV0lnNlB4azNoSHJTUUExYnZYREdqZFBJMUJ5aFNVd1BtME5rK25LVzIwVGJuU0FvVEFPVW5mUWVVY01hNTd6dHBlTiszME5JdTIyenlVZ1BNc0ZzSEdRUHgxK1lOTlNHQVdZN3I0NnFGZWNuUzFoaHoyeHdWd2hPQlZ5UmtCMnpnSURqQmJMZkJ4MFVoZ2ZpTUhMWDF2SEttZnhyRzBpTEVlUlRhTlNPTUdZWEJ0SEpVaWR1WTRYVTJJYmthTzdJc25NWlJhcisxeEQzelBpV1FsQjgycnhHZ0ltUmcxUGM4ZEtPUU9kb1N1OFkyeEFCL28xTTRyUDEyN2ZMMjJFWFVIanVudHhhSHdUSllhb1hyTUZkckZtaGtyY0txN2xlWU5sY3lKK2dZY1Z4cVhkL1I2UFVuUm53eWVKN2dEaHdVOE55RlY2aThSK3ZRQUhrb0dOb0RsVHdnaFhHTDN1MS9ubEdkRGR3eVpNUm9aMExUeXNTYjBuSHduTzZURzBaNTVPbnZGcGRKckgxTkxodGJ6SzN3TVlnd243T2xOYWpLMGFoL2VtTWZ0bUJubExIOWNVRzVLZURJdXJob0pyUmtPbmlTQ0F5TlBvT2ppNDdtNDMxbUc1cHU3ZzVzSjZjOGQ1UHN6YU15RXYzT0Yrbk5IWGYzQVBIRDVyd0FEQU5hcWxyZFhId0hQQUFBQUFFbEZUa1N1UW1DQyc7XHJcbmV4cG9ydCBkZWZhdWx0IGltYWdlOyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQSxPQUFPQSxXQUFXLE1BQU0sbUNBQW1DO0FBRTNELE1BQU1DLEtBQUssR0FBRyxJQUFJQyxLQUFLLENBQUMsQ0FBQztBQUN6QixNQUFNQyxNQUFNLEdBQUdILFdBQVcsQ0FBQ0ksVUFBVSxDQUFFSCxLQUFNLENBQUM7QUFDOUNBLEtBQUssQ0FBQ0ksTUFBTSxHQUFHRixNQUFNO0FBQ3JCRixLQUFLLENBQUNLLEdBQUcsR0FBRyxvN0ZBQW83RjtBQUNoOEYsZUFBZUwsS0FBSyJ9