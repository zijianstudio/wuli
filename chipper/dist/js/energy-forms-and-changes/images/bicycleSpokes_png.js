/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
const image = new Image();
const unlock = asyncLoader.createLock(image);
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImltYWdlIiwiSW1hZ2UiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwib25sb2FkIiwic3JjIl0sInNvdXJjZXMiOlsiYmljeWNsZVNwb2tlc19wbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgKi9cclxuaW1wb3J0IGFzeW5jTG9hZGVyIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9hc3luY0xvYWRlci5qcyc7XHJcblxyXG5jb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG5jb25zdCB1bmxvY2sgPSBhc3luY0xvYWRlci5jcmVhdGVMb2NrKCBpbWFnZSApO1xyXG5pbWFnZS5vbmxvYWQgPSB1bmxvY2s7XHJcbmltYWdlLnNyYyA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUlBQUFBQ0NDQVlBQUFDTzlzREFBQUFBQ1hCSVdYTUFBQXNUQUFBTEV3RUFtcHdZQUFBQUdYUkZXSFJUYjJaMGQyRnlaUUJCWkc5aVpTQkpiV0ZuWlZKbFlXUjVjY2xsUEFBQUNwQkpSRUZVZU5yc1hldXQ2ellNSm9vTzRCRTBna2ZRQ080R0dzRWphSU9nRTdnYlpBU2pFMlNFZEFOM2c5TnpBUXRWZVBSK3l4YUIvTG4zSkhFbzZoUDU4U0dBZTh2OC9WcGd5RzNsOWYzNkdtcm9jK2YrV3JnMTRqT204ek5lUTUzOUNUa1g3emdYTWtUWStSbDhxTE5QZVVRdTRIYStmeDZxN0ZPbUV3RkNVVUM4ZDBqSHdzOWR2QVg2RU0vS0NMYU9KVXlEQWwrblgrQnJPS3ppYy8vNi9uMHNZYnl3Z04zOENqQ2FITS84R011WFJ0Nm5RbWtuNGQvbThieERQSGFVQzZRdURldytZYkJERXNydXVLdHE3ejdTZ0FONlNhR25ZdDhPdTY5bStMZENQSXM1eElJQ3JPSHc3d21EZ01vbXN3VUZXdGg5ZzRBcTVHRnpBMEtReWdhNlhYa0Jwc3JmTDV3c1RCRlBqajVDVHVGUWw0QXFjcjRkRFJnQlY2QkFDK0ZmYlFRcXB2amFFQ2NuaW9TeVJmWndxZmhNdFJHb21PSmJzSEpzakxYSmx4UUl0UFFRUHJhRUFqSkYzRUwyTHhTQlp1bjQ2SUpCZkRlQ0FreHlDR3VIZnlJQjVlTWZFU21xRVZRMzdjRUFHTFJEZDc0bEJkWWlYd2o0cFgrbkUwa1B5Vy9vTG5Md3lkQ1ZPSHVQQmpZRWQvemJRM3BtM2tCVUZmV2o5MFlNb0dZRTRKS0FvdEl4SVh5b0xoZGVGZmZXUklHSHBOUmFJWmdwQVVXUWc3ZGZpU2VnRGFEQVcvSkhhckJ3dWdUVWhCeThOMXkwUUdTSGV2UW5RYnRLS0xva3RPSUVGSGJ3RHJnd05TeWpRQTM0WlVqNUc1UnZCcEhUdjB4Q3BLNGR2RjVRQU9mZUNjVDFFb1RJSWFHUTdPQVJ1SkdRU2lpZ3lyMXpLSmNVa2lNUVlRVGRGWUtrZXVEUzhFdEJUVW1YeUZkTWl1aWp5emIwR1Zrdmp6QUlBdkVOblNIaG4rclk0WkF2WDdGS0J2WUZGMGovUHVDVFRoV0wrRHgvN053b0N0aTQ5emVrcFljWHBDZGhnSmRwUHlmbmJ0b1VGdjQrLzUxWnJEMjJvZE1YYlY0T0VVSXNSMEdSZy9jOHY3K0ZBcFRzeDhNSy8xY0J5UWJ4T24vNG9saG9YZ0FGbU9OM0NKU2dnVVpteXRUVkxrQ3BFdTl6dEJ0a2crRG4zNVJ3d2x4Ny8ya0FDa3lTRVpzeWRiZnUvcGxPeTMvQVo0SkQ5aUZ5Rm8zNGxGNzdjQlFNZm1icVRFZlE2UDVWK0E4cWg5TEZmL0NOWEZ4ckVhZ0RSMEVWRHQ2VTRBaTZ0VUU4Rk1nZ081UkxvS1BJd1o5MUZFZkdxakNta0V6ZEdEL2pLRzlKOFNiLzRlSGhxSVgwL21PT0FtZnFYcDZPNHVqKzhmVFdkd1hrNnZ3SEV5RVYwL3UvU1o4ZlU0clZRdjlobHloQUxRN2xaaUdrQ01STjNsalI1L0xBSTJoMC93YUVqejRlczRtUStwS2NMK0x4L1JocFlxS1R5M2YvNUpDWTBqR1prUHJ5SUtTSXdzR2pDVGlLSHJwLzJQbDdsOVpRSUVaeE0vSVJkb1AvZ0ROMVZBSGhXOFR2YUxYN0YwYzFTNHNvd0FMZnJ6cDdYUWdwVlVJcnRLUzlWZm9YcDZlYnJFdVlJMUhBZFBZeTVFQStMWVFVaHpBbUw2VDdwd1RjZDFOL3VBV2lnSzd6bG9LNUZNdVUwUHFTbm1YeWVJWlcwci9ZdVgxQUIvV0htSkJ4Rlp4NkpSRFdVemRIRUZLdHBIOG54Vy92S2lJSktScVJrWU5EdWxLc0hUNlRWOWlobFAySEZvWS9yb2pFNmpJVkhZSUNiN1JRQjZSSnhNaCtpWTJRcWprWEFjTjlLSW5WakhBUEZNQ1Z0Nm5QT2gwaUNVSks1VC9JRlZJNUY2Sjd1RGY5TUZ2cEdJNXBuNWwrdkFzaXJkSXorQkpTTVp1a2U3aDNRWUZOc1NDYlFzazVMZDkyTzRscStDTTkvOTZVMEFyeEZ5ZzZncnFIZXhzS2lNWFZEVTBvUWIycWhrN0pZa3YveW9SVWFJVTFRZWp5aEJ2a0cxYjRtYUtWTTNVTGxLTmVkWWdVTXZ4UitBOHFoMUpWWVkwTm44Sk5oTUxQTE4ya2dPYWxFQ0twWmg5eGlPOTdkQ0drYm5YQkJGR1FNYnNoL0N0MUJqTDRXZXlSSS8zTERFYndpdkFmdWpqM1ZVTVRWTWtaQW5VcWIvR3pwUFJCSmczY214SmFPL2gzYURXNThCejBTUXVtV0d6eGI2VXJieGJwV1ZMU3Z3djhuQjJnMHhVRGM0VVU2OGxCWk9BMk5BRVhqZFNjdTc5TGNCenJnK0Rqem5jNFZBdUVWTENENXpNMGdjSm50dTJBZXBVMzJEa05VUzd1TVBLdFBMWTVsTHVGa1Bxd29LUGdXWUxqV1ovaWhGMHlsdHFWTnp1RXAzOHgzSytaalZWSFNDMWlRWFN4YU1yd0tzWFFCTHp6V0VVRGtFbW95Y1A0WStBK3hSb0loM0pYSVlHdXVGSXV2UTRsZEk1RUZ2K01oTjVVSWtjcnZCTGNaL2QySHhwMGVEanVYancwZ1NkWU5BcjFSNzhDZ25CVG9vZ2xOUDZxeEl6T3NWQ0ZIZGpCUzhsYk00K2RsMHZrN2grdWVSYWNyZXlpSk12bkhGSEZvUytGZzVjYTZqWVU5OVpRcWx5QnJFcGFOVitCbTNvM2NGRFRsamxJQ1FHNWo0b29nRGtJRHVxa0ZZTWJDRDdqSHFCdTJ4SWM5aHhwYkxMM2ZGUkNBY3hCekpDM0txbEpvV0FmbWpCcll0QWprS0hpS1B6alVENUxScEVSNHVLVXkwOEZDUjJhSUhQWW9laUFlLzlyWEZKbGd2dFdMc25JNXZ6RkRFMVE3U1JWaGtzM0lVVFhlTUdoTEN1SUl5RTV0S1ZYUklFUzk5Y1EwQ2MwQkVXdGczdGRvVWJ1RGFCRHZwcmo4Yk00ZURYR20xTU5DU1VpaTBYRERlUkNBVHorOWVIZ0kzUjlRU1NGbi9mWGtFclBRdUJ6ZW9lT29zNXgvbUk5aU8rd3NhRFBYbEdBS0J5OEZraU1HZTErSFRxa09uK0pCdTVkUzlCSVphSXEyc050cmZKMDFld29nUTZ1RkxXckRsUU5GOFRUd0dyY1RwTEUwV2t4aEhFcHZKeEFYMHpwTW1xT2dya2tpM2t1YUUyaTZuTGhwNDlUdFVzTHBVSUhYRGRId0szaEltVDRZK2tROVpMaVczaXA4c0pOSkpSc0dDYUVDQm4rMk5KdDZ0M0tCdjZGbDdaWWZEVVlnWXFpamhuK3VBNFVpSk9Rc2V1NmVVTXF1Si9CVGxHTHpPTWErUnZvV0U3L2NDeDA1OGxUUTFRei9xbUZoSG9aU0NoZnA0N0JHQjhmRmY2dEVjWnpRSGdGTGpGRUZyNVYxSytCQXY3eWpIQ2dDQ0tMUWl0d3FmUitDdm82U1ZzVk5ZV0xYU0pWUWtJNGRRejNzWXdjQnpNSjVWTkZmYWxFVWFud2IvTjhENFo3RG5HTW5PdndSNWNxNnRoaG1MY1NuOTUvWEtRaXc3MXR1b2NMQ2VVTDJ3VDBGUFVCWTV5OFYrZzBXUmJvQWZZaUZSNFlpNmZvL3JWVlVmdmNobks3OEcrM2hGYXVGYmloakZ5TzRZOHpxSWRjZGRuYVhTUDhDMjI0Q0dIa2N0MzlKeHNraDN4VjFOMkhmN01CN2tOcUZYenVDM1pCb1JoUkhVdXBxNmk3RlZ4Mzd3UDNZRGsyWEJlVlpYYldiTWRTaWlycUxnVVRMNm43NjF4NStSSVRTQmk0VTkyQ2hIS3RvdTQrL0h0RG50SzB4UkVGU3QzOUY1SW9JbUN2b3U0V0hYQVJabzRaZ0xaTHFrcmUvZWRxa0M3b2dNUE1ycmdHQ3VWR25sTUx3YU9yUWN3bE1iZW02VWlvWnkvOGdxcS9qaGRVT2pQOEh5bG8vTGVraVBFTkZ6NWhXazZsMTFpTVd5V0tkSEJmK3RKbDFTVlZKUWRRcTNnSG42RlQzUW1CbnhORUNISzh0c3BLcjNuM1g1ZTlCSzdDd1R6eW5GZUNRS3owbW5mL0NZTzhWQzhCQmJjWnVDK29VejR0SzUxQS9hb2RmaFVVd0hCdm1oUlcrOUxGQjN6Ty9xMnAvRXYwRXRqZ0hndUR1aGNpeUVwdm9YQ1RRNmU5QkxNajNPdk9ZZHFBMHI4YTBHT3BvUmZaWWxuZndaQ2x3eitkOFg0MXBIUUdIZllTRVBBbmNVcnk3aWFSMjhWYWdkNWJkQlNWNXQxMThvVFBvczBXVUlEQ0RUcUs5a1lVTG80aDFnZ2lZZjFjRWdWOGUvOXo3N1N0UWVnVk5aRGtpZ2FROHRLbEZCRUE2OWtCNjFGQ2V2OUxIVU9qbWJPZ2w5dkNNZlM2b3dQV1F0eGQyOWt5SFVON0l3aDFhUU9vSGY2WjByOFVSalBuNWNXVy9oMHQzUmNXNG5ET2t5dWp3RzgzTndEaDRmOXQrSnQvdmw5L3dmL1Z0a011R0liYVFqMkJBbVBxNXdYRDBNUFRXUGhRMnozRFVBSVhuUDE3WngvQTVmekh2c0NmNStJUFgrQUNFaktDYnN6K3ZaQ0VoblljeHV6ZlM4Qi82Q0xLS05DOS9EN09mMi81OS92MUI0d3NZZmNSQUI4eFBjQi9BZ3dBS0FXajdvVjlPQVFBQUFBQVNVVk9SSzVDWUlJPSc7XHJcbmV4cG9ydCBkZWZhdWx0IGltYWdlOyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQSxPQUFPQSxXQUFXLE1BQU0sbUNBQW1DO0FBRTNELE1BQU1DLEtBQUssR0FBRyxJQUFJQyxLQUFLLENBQUMsQ0FBQztBQUN6QixNQUFNQyxNQUFNLEdBQUdILFdBQVcsQ0FBQ0ksVUFBVSxDQUFFSCxLQUFNLENBQUM7QUFDOUNBLEtBQUssQ0FBQ0ksTUFBTSxHQUFHRixNQUFNO0FBQ3JCRixLQUFLLENBQUNLLEdBQUcsR0FBRyx3c0hBQXdzSDtBQUNwdEgsZUFBZUwsS0FBSyJ9