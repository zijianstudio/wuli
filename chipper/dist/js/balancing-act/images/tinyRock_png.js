/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
const image = new Image();
const unlock = asyncLoader.createLock(image);
image.onload = unlock;
image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAATCAYAAAAao7T0AAAACXBIWXMAAAewAAAHsAHUgoNiAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2VJREFUeNqcltFP00Acxw9W2nUbYjd5cEDIkAQSEGO2hWB4MUQeiK8KCfHBNxMMYMBofDAxMdE3SYxPEsQYHoxBiOFJ/wqNiVHYiMwYYBtF2lHGep13ba/rbi2bNrn0rtf7/T79/r69tq5YLIJaj8mpO9Mc5z3v9/sjp5qagsfHx2Ge55txjKKmAUmW0x6P5/deNpuSZWkzk07PLy+/+1Jr/LqTYGZm7w2i4DeDoVA/x3E9kUgEcCwLNLRGgxBABKBpEDU0Rn0IoX4m/V+pFNjd3fkuSdLHVwvzk/8FgxUQgqFbHR0dXS3hMEoK0ZOjhEWcRLMSkqS44TgEhj4rigKSiY0sgpp7vbjwuCYYU4nFWDx+LigIenIMgWEwRNEGYwegFaFByVg6OADr6z8SqKRDS0tvfrrCTNyeetLZ2TnZ19fnwxAaSappuh9ISewwbgBl12xA0CztZjKhIF89WFlZnquAwWWJxuLPwuGz+iJDDc3mC62mxG5nq2+C4ba/L4LU1tbz1dX3lpfqZu/ebxcE4VssHuN1NcxS0CWpVoZqAPQa3LLZDNjZ3h5bW/vwFsPUo/YwGo3yUIVARTeoqqq3QkG1+sa4UNanx6QP8RmPbdeMuAXbOqP5/QGA3tIXIyNX2zEMc1oQ+gtogZsvTjKpoy/oebtfoGrGLqlzprk5tJlMvkQswwzLsj3V3oh/9UV5CY2HIzDGnGaCQV3JQCBwZWDg0iCDDkPeKr7ACuH7HBVzAIQOipTgSg3HRKXC808Z5fCwJpiyjY0qi/XW2e6lFaFB9QeDhk+xOuizcpFBW/tnNHHhpM2qDID2UIUKkFKgVBIruQmgkmuGOj7mz764p6ptjgCu3nEth4svHNQgEKW5AmBEUfwqy/LlhoYGPQjxRYVnKgBxALtXjDHpk1hOJSE5yLaAv12KcmjswFPTM5mu7u6Q69PX6Au6VPZyQAJm9tHvB8jn8yaIAjKZNGDwZiOKexOJjY2F1rY2n9seQitSrgB09YW+75AN0bxOAI6OFAtIkg4+WR/K8fEbo16ef9TS0trl9Xpd3ygnc7qVhPiCzOfzR3piuyK5XA6DJFC5hir+Z65dHxv11NcP8z5fL/qd6G1sbPSxLGcBuPnCqSQEzu4LO0QuJ6cQ2Cq6T/9Y/hVgAEkheTsuoEwtAAAAAElFTkSuQmCC';
export default image;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImltYWdlIiwiSW1hZ2UiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwib25sb2FkIiwic3JjIl0sInNvdXJjZXMiOlsidGlueVJvY2tfcG5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlICovXHJcbmltcG9ydCBhc3luY0xvYWRlciBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXN5bmNMb2FkZXIuanMnO1xyXG5cclxuY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuY29uc3QgdW5sb2NrID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggaW1hZ2UgKTtcclxuaW1hZ2Uub25sb2FkID0gdW5sb2NrO1xyXG5pbWFnZS5zcmMgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFDTUFBQUFUQ0FZQUFBQWFvN1QwQUFBQUNYQklXWE1BQUFld0FBQUhzQUhVZ29OaUFBQUFHWFJGV0hSVGIyWjBkMkZ5WlFCQlpHOWlaU0JKYldGblpWSmxZV1I1Y2NsbFBBQUFBMlZKUkVGVWVOcWNsdEZQMDBBY3h3OVcyblViWWpkNWNFRElrQVFTRUdPMmhXQjRNVVFlaUs4S0NmSEJOeE1NWU1Cb2ZEQXhNZEUzU1l4UEVzUVlIb3hCaU9GSi93cU5pVkhZaU13WVlCdEYybEhHZXAxM2JhL3JiaTJiTnJuMHJ0ZjcvVDc5L3I2OXRxNVlMSUphajhtcE85TWM1ejN2OS9zanA1cWFnc2ZIeDJHZTU1dHhqS0ttQVVtVzB4NlA1L2RlTnB1U1pXa3prMDdQTHkrLysxSnIvTHFUWUdabTd3Mmk0RGVEb1ZBL3gzRTlrVWdFY0N3TE5MUkdneEJBQktCcEVEVTBSbjBJb1g0bS9WK3BGTmpkM2ZrdVNkTEhWd3Z6ay84Rmd4VVFncUZiSFIwZFhTM2hNRW9LMFpPamhFV2NSTE1Ta3FTNDRUZ0VoajRyaWdLU2lZMHNncHA3dmJqd3VDWVlVNG5GV0R4K0xpZ0llbklNZ1dFd1JORUdZd2VnRmFGQnlWZzZPQURyNno4U3FLUkRTMHR2ZnJyQ1ROeWVldExaMlRuWjE5Zm53eEFhU2FwcHVoOUlTZXd3YmdCbDEyeEEwQ3p0WmpLaElGODlXRmxabnF1QXdXV0p4dUxQd3VHeitpSkREYzNtQzYybXhHNW5xMitDNGJhL0w0TFUxdGJ6MWRYM2xwZnFadS9lYnhjRTRWc3NIdU4xTmN4UzBDV3BWb1pxQVBRYTNMTFpETmpaM2g1YlcvdndGc1BVby9Zd0dvM3lVSVZBUlRlb3FxcTNRa0cxK3NhNFVOYW54NlFQOFJtUGJkZU11QVhiT3FQNS9RR0EzdElYSXlOWDJ6RU1jMW9RK2d0b2dac3ZUaktwb3kvb2VidGZvR3JHTHFsenByazV0SmxNdmtRc3d3ekxzajNWM29oLzlVVjVDWTJISXpER25HYUNRVjNKUUNCd1pXRGcwaUNERGtQZUtyN0FDdUg3SEJWekFJUU9pcFRnU2czSFJLWEM4MDhaNWZDd0pwaXlqWTBxaS9YVzJlNmxGYUZCOVFlRGhrK3hPdWl6Y3BGQlcvdG5OSEhocE0ycURJRDJVSVVLa0ZLZ1ZCSXJ1UW1na211R09qN216NzY0cDZwdGpnQ3UzbkV0aDRzdkhOUWdFS1c1QW1CRVVmd3F5L0xsaG9ZR1BRanhSWVZuS2dCeEFMdFhqREhwazFoT0pTRTV5TGFBdjEyS2NtanN3RlBUTTVtdTd1NlE2OVBYNkF1NlZQWnlRQUptOXRIdkI4am44eWFJQWpLWk5HRHdaaU9LZXhPSmpZMkYxclkybjlzZVFpdFNyZ0IwOVlXKzc1QU4wYnhPQUk2T0ZBdElrZzQrV1IvSzhmRWJvMTZlZjlUUzB0cmw5WHBkM3lnbmM3cVZoUGlDek9melIzcGl1eUs1WEE2REpGQzVoaXIrWjY1ZEh4djExTmNQOHo1ZkwvcWQ2RzFzYlBTeExHY0J1UG5DcVNRRXp1NExPMFF1SjZjUTJDcTZULzlZL2hWZ0FFa2hlVHN1b0V3dEFBQUFBRWxGVGtTdVFtQ0MnO1xyXG5leHBvcnQgZGVmYXVsdCBpbWFnZTsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0EsT0FBT0EsV0FBVyxNQUFNLG1DQUFtQztBQUUzRCxNQUFNQyxLQUFLLEdBQUcsSUFBSUMsS0FBSyxDQUFDLENBQUM7QUFDekIsTUFBTUMsTUFBTSxHQUFHSCxXQUFXLENBQUNJLFVBQVUsQ0FBRUgsS0FBTSxDQUFDO0FBQzlDQSxLQUFLLENBQUNJLE1BQU0sR0FBR0YsTUFBTTtBQUNyQkYsS0FBSyxDQUFDSyxHQUFHLEdBQUcsd3pDQUF3ekM7QUFDcDBDLGVBQWVMLEtBQUsifQ==