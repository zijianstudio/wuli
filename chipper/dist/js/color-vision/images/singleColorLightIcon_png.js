/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
const image = new Image();
const unlock = asyncLoader.createLock(image);
image.onload = unlock;
image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAArCAYAAADhXXHAAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gYRFAocdsStzAAAAgBJREFUWMPtmb9uE0EQh789USEhVspJIK5JRxn7CbDfwLRIKLhySajoAn6CxKVpkhdAmCeIeQCk4wm4FIdAuignWXJ7FF6kgITYP7NrLJjSp9n77jczO7Nr2CFTEos0XTEABsABoG88KoFPwCJXdbs12KYrNHAEHAL7Fi4LYJarepkUtumKEXD2i4q2dgpMfZRWHqCvgVeBES2BoSuwcgQ9MaGXsArouwBnjqE/EizufeDCxSFzKKazCLtRz6SVqLInnsVkY8+NGOGwZqFRxL1eA8+klB1FVPWHHUrBPkrQSXs2qZBZVm0K60nA9hLBiiird0nZKhHscpdgWwnYDylAc1WXErCLBLBW7/gjrPniZWTYqeRsMIsIepqr2qourOfZpisuzDlL0pxm2sxh4RcRVH0cZfg2uSsJPLbZAULPYO8ERsbzXNXjFAdGbY4jvjNDmau67+OYuTqYHBvbdJzfdKmhbzgyHyeTa1MP11nIzUzQ9VHTFdeOU1nftaiClfVtxSGgErAuQ05wyw6FdVGq2iqsY1gvt62sS3jLvwH2fSrYW6ELvH1zXN6+06L3vqH3vm7S48El69Vd1itNe3Wf9uoeT5+8rLYOC7BeadYrzZfq4eaHj3EG34wdsv+wsUwiZ8sbk9SAn/9vGErCKumvn8/nn9lc5p1PJpMx/6p9B5X9j9C8BJrtAAAAAElFTkSuQmCC';
export default image;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImltYWdlIiwiSW1hZ2UiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwib25sb2FkIiwic3JjIl0sInNvdXJjZXMiOlsic2luZ2xlQ29sb3JMaWdodEljb25fcG5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlICovXHJcbmltcG9ydCBhc3luY0xvYWRlciBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXN5bmNMb2FkZXIuanMnO1xyXG5cclxuY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuY29uc3QgdW5sb2NrID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggaW1hZ2UgKTtcclxuaW1hZ2Uub25sb2FkID0gdW5sb2NrO1xyXG5pbWFnZS5zcmMgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFDc0FBQUFyQ0FZQUFBRGhYWEhBQUFBQUJtSkxSMFFBL3dEL0FQK2d2YWVUQUFBQUNYQklXWE1BQUFzVEFBQUxFd0VBbXB3WUFBQUFCM1JKVFVVSDNnWVJGQW9jZHNTdHpBQUFBZ0JKUkVGVVdNUHRtYjl1RTBFUWg3ODlVU0VoVnNwSklLNUpSeG43Q2JEZndMUklLTGh5U2Fqb0FuNkN4S1Zwa2hkQW1DZUllUUNrNHdtNEZJZEF1aWduV1hKN0ZGNmtnSVRZUDdOckxKalNwOW43N2pjek83TnIyQ0ZURW9zMFhURUFCc0FCb0c4OEtvRlB3Q0pYZGJzMTJLWXJOSEFFSEFMN0ZpNExZSmFyZXBrVXR1bUtFWEQyaTRxMmRncE1mWlJXSHFDdmdWZUJFUzJCb1N1d2NnUTlNYUdYc0Fyb3V3Qm5qcUUvRWl6dWZlREN4U0Z6S0thekNMdFJ6NlNWcUxJbm5zVmtZOCtOR09Hd1pxRlJ4TDFlQTgra2xCMUZWUFdISFVyQlBrclFTWHMycVpCWlZtMEs2MG5BOWhMQmlpaXJkMG5aS2hIc2NwZGdXd25ZRHlsQWMxV1hFckNMQkxCVzcvZ2pyUG5pWldUWXFlUnNNSXNJZXBxcjJxb3VyT2ZacGlzdXpEbEwwcHhtMnN4aDRSY1JWSDBjWmZnMnVTc0pQTGJaQVVMUFlPOEVSc2J6WE5YakZBZEdiWTRqdmpORG1hdTY3K09ZdVRxWUhCdmJkSnpmZEttaGJ6Z3lIeWVUYTFNUDExbkl6VXpROVZIVEZkZU9VMW5mdGFpQ2xmVnR4U0dnRXJBdVEwNXd5dzZGZFZHcTJpcXNZMWd2dDYyc1Mzakx2d0gyZlNyWVc2RUx2SDF6WE42KzA2TDN2cUgzdm03UzQ4RWw2OVZkMWl0TmUzV2Y5dW9lVDUrOHJMWU9DN0JlYWRZcnpaZnE0ZWFIajNFRzM0d2Rzdit3c1V3aVo4c2JrOVNBbi85dkdFckNLdW12bjgvbm45bGM1cDFQSnBNeC82cDlCNVg5ajlDOEJKcnRBQUFBQUVsRlRrU3VRbUNDJztcclxuZXhwb3J0IGRlZmF1bHQgaW1hZ2U7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLE9BQU9BLFdBQVcsTUFBTSxtQ0FBbUM7QUFFM0QsTUFBTUMsS0FBSyxHQUFHLElBQUlDLEtBQUssQ0FBQyxDQUFDO0FBQ3pCLE1BQU1DLE1BQU0sR0FBR0gsV0FBVyxDQUFDSSxVQUFVLENBQUVILEtBQU0sQ0FBQztBQUM5Q0EsS0FBSyxDQUFDSSxNQUFNLEdBQUdGLE1BQU07QUFDckJGLEtBQUssQ0FBQ0ssR0FBRyxHQUFHLDQxQkFBNDFCO0FBQ3gyQixlQUFlTCxLQUFLIn0=