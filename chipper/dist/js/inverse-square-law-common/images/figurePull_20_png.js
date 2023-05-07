/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
const image = new Image();
const unlock = asyncLoader.createLock(image);
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImltYWdlIiwiSW1hZ2UiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwib25sb2FkIiwic3JjIl0sInNvdXJjZXMiOlsiZmlndXJlUHVsbF8yMF9wbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgKi9cclxuaW1wb3J0IGFzeW5jTG9hZGVyIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9hc3luY0xvYWRlci5qcyc7XHJcblxyXG5jb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG5jb25zdCB1bmxvY2sgPSBhc3luY0xvYWRlci5jcmVhdGVMb2NrKCBpbWFnZSApO1xyXG5pbWFnZS5vbmxvYWQgPSB1bmxvY2s7XHJcbmltYWdlLnNyYyA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUlZQUFBQ1hDQVlBQUFEUTh5T3ZBQUFBR1hSRldIUlRiMlowZDJGeVpRQkJaRzlpWlNCSmJXRm5aVkpsWVdSNWNjbGxQQUFBR1N4SlJFRlVlTnJzWFF0d1UrZVZQbnBldlIrV0xOdXhEYko1R0ljQUpnRUNlU0dudEhYUzZjWTBteW5iZGhOb3RrMjc3U3pRN2JacE1sdGd0OXYwTlFQZGRxYnRkbmN4M1U2VE5FME5UVUxDbE5hR0pFMmFBRGFZQURaZ1pHempsMlM5MzFmUy91ZmFrbVZia2lYaFlNdjZ2eG5ObGF5cmE5MTdQNTN6bmZPZi8vd0FGQlFVRkJRVUZCUVVGQlFVRkJRVUZCUVVGQlFVRkJRVUZCUVVGQlF6ZzFlZzUyMnFYeUt2cXl1WGFCTC91UCtrdFoxc1dzbkRUb2xST05Cc1dpemI5Zmc2OWM3N3ErUWFsWVNmZEtkam5XNW91ZXBwK3MwWnh6N3kwa3lKc1lDeHFrelMrTm0xNm9PZnVWTTl5VUx3QkFMUWxDOENzVXpPdlE2NG5lQzJEQVByOThPN1BUNzR4bXVEdTgyam9RT0ZTQXpCUWovQkRaV3l2Yzg5YlBqWmc4dmtrbWx2UnFNUThub2h6QWE1NXp5K0FNUlNHZmlkRHFqUWlPRFJWZXFHSGx0SWM5a1NQRWFKc1lCUXFSYnZPdlRweXVlcWRNS1UrMFFqWVFqNWZCd1ovQTQ3dDQyQkVmS2dXaWZlK0Y2dnI4ZnFEYmRUWWl3UWdmbnpyWXVlWDJZUWdvQ2YrMEdLRlVJa2grbmxEdWVMaFNSS0Z5d3h2cmloK09ESGxxbU1VbkgwcG9pQldLUVZTWWJjcktaaklIQ2tVSWpCWDZEblZmZkpXclZwTmcvWXVGSzFuV3lNbEJoNURFS0t4aktsYUZhUHVYR3hGRDVScTl4SmlaSEh1TjBnM2Z4aEhQZGpOZkpHU293OGhsWTZJWjFDNGRrN2JrMHhZeXdVZDhKZjZDZklobWN2aDNkN0NRUExpOFVtU293RlFZelpQUjdSR1pzcE1mSVVObDk0a3NVSVIyYnYyTVJpVUZlU3g4UTRrZmc2eE03cWtGQWRKVWFlNHIvZUc1bVV2dllHWm84WU9wbFFRNG1SdjJodDdYWjlhTzZFRWlOL1llOTFCQThuL3NIajU5TzdUWWtCOE1wRnh4RlhZRUtFK29POFdRMWRLVEh5Rk4yamdhYTN6RzV6NHQrY1hoNldYVkFVTWpFUWh5L1lEeVcrUm92aDh0M2NLVHY4WVVxTWZNZnBmdStCRjgrTlRySWE2RkxzYm43T1luVEl4YlpTWWl3QUVmcnllZnUrUksyQkNMSThHSFVKT0VHYWpXdHgrQ0x3cTlPVHJkQkN4WUt2K2JUNXd1M2VVTVIwbjFGaG5Qb2VKcjY4QVg2Q0tPVUJQOGxQQmZjYmRrYmgreTNXMXBQWFBMc0xnUmlGSXRPTjMyc29iOXV5VkpWVGNtckFGWUlmbkJoc2V0UHMzbEVvNGxOUUlPZHA3M2VHT3U4b2tXN1R5WVFaZndoZFVQTUZPL3pvemFHbWM0TytnaUZGSVJFRExCNzJVdHNOWDgrYU1tbmpUT1Rvc3ZnNVF2enBtaHRrRWdHRWlRNjVaZzM4b3BDSVVYQVpuMXFEcFBHalMxVjdWcFpJSncyRzlUcUNZQ2VoNkxDWEJhbUlEd0hDQmduaHp5S05BQmdCRDRwa2ZMczdFREVIMktqOVQ1YzlSMXF1ZWpDemFxYkVXSURZVUttS0ZpVllEejQvQ2lxR0Irc3J4YkRKS0lVS3RZaWJyU1ppSnVZcWhVTWg4Z2h5TTlYMm43VHVlNmZIdTVjU1k0R2hwbGpXVmxVa3FmT0ZJbEFrNVVGanJSSTJMWmFCUkRxVzVGRG9EU0FuajZuQXFZejJ2dXZnOUVkZzE1R0JwdU9YUFF0T2Z3Z0ttUmhXYjZqVG9CQnUzN1pLQlY5WVZ3VGxLaEdJUkZFUUpGd1ZQbmtoRkRPVGllRjBRTkRyNFdhcTNXdFUxSjNxOWZOSTVOSktMY2JDZ09ZemE3VE51KzRwTmltWmllU0ZSSXJFeUN6cmhkbFRUSlNkNnZQQ1U4MDlWUXRKY3hTcXhkQTh1YTZvNVZ1YlN6YmlyejRSZkhKRkJCbGNGVXlLT2IxOGlFUjRjQnV4TkRaZnVPN0NzSC9CWkVYNWhVcUtyOTluU0ZxaUY4bGdEQVV6b1RZM2Y5SXcvdU4zNmt4a1k2SVdJMC9Sc0V6NTNMOXRLVXM1Y1NnYTVZRklIRTN4M2xqQlQ3SVJXaVdEbDVKblBOM3ZQVVF0UnY3QjlOUUcvYTUwTytETlo1TVVENGZHQjk3UzFZK096NWMxVVl1UlovanFSdjJlaDJ0VWFhdThYWUVJUFAzR01CenQ5TUlyRnozUU1lQ0hLTkVSWjNxRE1PSUpBNDhYc3c2UXltcmdjSC9lejRvWEZoSXhsdWlZR2VlZS91TDlVV0NqZkNnaU43bEl6Z2NkaVZJZVdDS052MzloS0FCbkJyMmNCY0hoK3hLRkNKYnJKeEpneS9YTWRyTEJFVmc3SlVaK3dHalVpTk9PcmtaUVF3VEg5SVhkRzRaUlh3aSsrTEIrMGo0NFRYSDFZalh3U2ZpQ3VZdytSd2hPMzNEQ2lEc0NhMHJsWUtwV1FuVVIwNGlsaFpRWWVVS00yMVRNdEQvNldZQmdHTUJIQ0lIUFk1VmRTQklGc1JwdVZnaXFhQVQ0Q2RJQ203bGhWaFI3ZG1rSk9aWlhPU0hnY3NIYlZ4eHc3SW9IVmhSTEhxSEV5QitZVC9mNThkY01ZaUlGMk1qWXpaK0s5ZVV5K04wRkIrQVlpbGhBM0FVSlNmdUk2TlJLSXFBY2oxYThvMWJ1d1NoVndDaFVJTlBxUVdrb2c0ZktQUENBWlJpV0ZWc2EvV0cySlV5MC9aV1J3SWwrUjNBdmlsS2MzdmlKV3FXUjZCajFYUldTdXNuNUV5RTRDQWtITE00VDdmMStlOHRWVDZ6bmFMWm9mS3l1YVBQSzByRkJRbTh3b25FRnd1YWZ2VDM4NDJ5T1YxQ1p6MmMzMzJhNzM2aWNzVmhueUIyQ3YvWjVJQlNPd3VKaU1keTNSRGxtS1FSUlVEUFJPRUVtcVhpUk9ONFcwdWV3Y2R0Zm4zSEFxYjRnU0FSUit6TWYwYWZzTFlwQWtpRzVCQ0lSc0FFLzJGeCtPTnZqZ0t1RHp2WnozWmJXLy82cjdVVHN4bFpxbVAwNm1jaG85WWJNdmZiQW9TL2ZhOWpwQzBVNS9mUzNhN1NjcGVQRXNCaEhpS01nSXYrMmM4UVBuL3lmbnZwTXlWRlF4UGhjbmY3ZzU5Ym90bWZ6R2VJUzRMbzNDQTIxNmdrelN5NjBYRFJHRVBFTTZYUFVJQytkZGNLVEc3U1FqaGlKK0d0ZkFJU01sQ01KNSs0Y1l6cTJseHlydWNObFY0Z1pEVXZNM1pBckNDSmkxUmp5aFJRU0hqejcwZHZpQkM2VlI3anZtWWhmWGhDMC92dnZMOVpUWWlUSll4eDZ0TG9GSTRsczRDTis1OHlRQjNSS0VkUVJWelBKRjJkSWtwZk9PVUhGOExuUjJ4aEJNTUxwdFllNDUycUpnSnVhZ0ZzVXVCVlZpK0xFaU9IOERTOE1Eb3pBQnowMjhJWWlNT2lNRUV2QVFxVldCRUlCRjNYQnc3VktLRk1rVDk5MlJrdmhvLzl4a2tlSmtTd0p0VUxUOHBXN1M3Sk9Rc2taSHRnRExMelg3MDFLa0JoSnBNUjB5d2hSY011ZmNuVjMvbUVFQW13VWF2UmpOMzlsS2NQVmZDUzlNVlBxUUdLSTFZUEU4Sk8zYk9BTGp4RXRRQWo4dFFlS09LSk9CYnE1TjBjWWVHei91eG5kYzJHaEVlT1ZTL1lkOXk5V1hsdGRLc3ZxYzE0U3RaUVNTL1BJQ2pWWEhQem5TdzZRaVBtd21oQWs1dE5SMExxQ1BPNFJNK240RmhLbTIrb25Ga01BU3JXQVdBMHgxK3d0SGFMaE1CY09wOE9JS3dxQkVCOEN4SzNnWUtCSXdBZEJpdHVPZFNWTkw1M0xPRklxeE5GVis1Q0g1ZDJ6U0drU0M3SXptSmd1RjVNYmdCbk9HcjBFbG1nWjZCenlRN2ZGRDlkdFFlZ2hEeTZhR1hmdTRlaFlWT05uZWREMHZnMjA1RDJNaE5URXBWUVZpWkpPVlpnSlNJWWVLOEFITjZJd1FLVEgyVUVmSVdLRXVLUUEzRit0aER0S3B0L1NkanNEKzE3dE9YRGsxSTF2b1dTaHJpUU5ucnlydU8yeE80cXlib0tpbHZISkx6UDErNmVKcTNFR3dvQmUza0Z1bUl4WWxYNGlHaThQQjBCTzRtUjBKWEpDcmtkdTF4S2k4RUJMQWhrbEVZN2FKQWJNVCtTSGp6eHNuaWpZdkdOYnhIVkhBQ01udTlYTHRoNi82amhMdE1zVHoyN1JHWkYwNkw1UXB3Z2xFamg2ZmhUTzlIb09uT256WTZocXp1WThDN2xRcCs0SEg2OXN5OWFsWUpkaERTRUhMNE1yaHlSNXFybEhXNm9VNzZrcGx1M0NJbU1zSS94Z3lIUDR3V28xbE1oRmpTVDBCSDJLcW5VVW1MMkVCSVJvZGxjZzNFNGVKOTd2ZDV0dk9JT3RTVzYwRWM5cDl3TzZPdFFUMzMvak91WkIyaUhINHFHQ3J2a2twTmk3cDc1OGoxeWNuVTJYRVNFcUUyZDI2ZGI5OUdJc2Q0RFdDWE1vOXZFYkZpZm8rTjlUb1hVdXJrMUIxM3dTYzl4S1FsSFRob3JwMHhmVEFYdUhpa1c4YVZGSE1oQ2gydE5sQ2VETkhSei85UTVPMlNYMjkxU1BPVUhCdDVraFVjcldvMTMyckVkQzNiNUlSaE9pcTR1WU5mbDRYV2ovSVdMYVgrOXk3TUFNWnpiQTBOUWJuSmtaYWtaZ3BNVElVMXkyK2c4LzMyRTk0QWxtMXpRRFIyU0RiSHB5bEt2RmRaUVllWXczemE3ZEwzUllzMTdGeU9XUGN0WWpGY2FuSmhncE1mSVlMNTBmM1VvSWtwWGVRSjNoOEtiV0crUFZYWlFZZVE3emI4K1BacTAzWmlJSGRTVUZyRGZRblN3a2NsQmlwTkFiVFcwanJkbCtEc2xoSitSZ0YwQVhZZ0dsUVhKMFdmeEhsSXhnMjRwaWFWYnRtZEJpK0VOUkxxZk00L0c0eXFtMkFSL1lmZUd6a0VlVjQ1UVlxZUUvMWU4NXNWakRiQ01QU2JZZnh1eW8xUk9HL3p0bmhidU5pcm9pdVhDNzB4L3BKQzdxRWlWRy9tTncwQjNxWEtHWGJ0TktzeXRkd2JyUlgzZFlvVW8vVnBsZUpCTktTbFNpYmNNdTltdytrSU1TWXdhTSt0aEw1NGQ5UFNzTjBzWk15ZkdIU3pZNE8rS0ZDcTE0MHQ5eENKNFI4UnF1V0FMemZuRmZTb3dNNFBDSDJ6TWh4MG16QzE2OWJBZVpWQUJxYWZKTGk1YURXQXpOaUpzOVFvbXhnTW1CWVcxTHR4T2U3N0FCeTR0Q3VVWU13alREcmhZUEN5dUtSWFdOSzVVbUlsUzFabHRvY0Q1YUQ3cE9RL1l3UFhGbmNiT2FFV2pNOWlEME9ZTmdVSXk1REN6ZzBTdVMvOVpjL2pEd2VSRjRxRVkrcWQ3enRZc3UrL2RiTFB2TW82RUQxR0xrTjh3OEhyOGhFQUVqOXYvRWNyMFljSG9qa2lNUldNbzM3QXBDUTQwVVByOWVBMHNxZFNCVnFlT0Z2c3VMR2NtanE5UU5YU01CWS9kbzZBZ2xSaDZEdUpJbVRSS3RnVFdYVWpHZm13U0U2SGNFWWFsT0FNODhxSU9xSWpISWluU2dMcXVJejMzRnhtOUJqNXVyOEs1ZnFxanJzWVUwbHkzQlk1UVllWW9LTldOU3BLaXp3R0Y0c1JCZFJ3aWVYSytDajljb0p2dzJqMDlJb2VBSWdSQXlESGlzRnU0NWtxTmFKOTU0ZGlCd2R0ak56bms0SzZTM09YdTRnMkZ6T25GWnBSUEJuaTNGMDBsRDNJZmxhbWZLNCtJa3BNK3VWUjk4ZXNEZk90ZUNsRnFNWEhJYlh0WlJybWEyaTZiTVMzSDZXZmpjbldwNGdsaUtYTEdxVENJWmNyT2xIUU9CT2RVYmRCQXRON1QyTzdrQzN6aThRUmErdWtrSDl5MlczL1RCRzFlcXRzTWMxM0JRWXVTSUt4YmZibUk1eGlNUEZ2WnRLZVdLY2tLenNGSWpoclAxUytTTmMzbCsxSlhramtHYm4zV1VLb1VOMzM2d2RGTEROa1lFT1UwL1RJVE5GNVcwWHZYTVdXdElLajV2QXQ1ZytQQVgxdXYyVCszaWh3dnlLYVRSQk8wUmdWY3Z1c0ZzWTdubzQ2NXlCa3hMVXMrQTR6NHZGSmxvVkpLL01DWjI3SXZCUjI2c1hBTHhhWXpQdmo0Q1FvRVF5dFJDYmxHY281MCtycUhLVXQzMFdlOUlDbXhGbmFwbEpOVVllUXl1QnRRemRtbVBkYnJCRStTRElxR1JmWkNOY0tUQThCUWJxdUErQ093NmpLU1lENkFXNCtiUWpoT1g3MHJTUkFWN2dPTDZyZ1BPQ0Rlb051b1o2L3lITFNLL3ZGSE5rUUx4MkdvVjUycWViM05DcFZJYTd4bmE3d2kyVTR1UnY3QVB1MFBtVkc4aU9XVEVoV0MvTEd6MDFqVWNoTVlWcWpncFlzRFdTMyszVmdWQ0VRdHZYTFp6aS9UOTVicW5sUklqanpGMW1mQ3B3SWF3NGNqWWdzQjNsSWhoVllrOFpTVTU2bzNIMXl2aDFJQVRqbDl4bnFEaGFoNWp3QlV5RS9PL3k2aGxVdTZ6YVpFY2puVTU0Si91S2VZNjdHR1JzRmlZZXA3QkhhVU1ObkhiOW42ZnoySDNSZDZseE1oVGQyTDFzcnhQMW1wU2hwZElobUs1RUhCWlQzeU82NXpJbU9pMDVpdllrRTJoR3h0aktaTkhJV0U0SHEySG54SWovNnlHbllTWFgxcFZtcnJoR3E2QzlNNTFEOFFzU3pLcndlUHpRVlZhemczUEkyZDRRUzg4Y29lcXpoZUtOcHpxODcxNEs4bEJOY1lzWU10UzFSTVltYlIydTlMdTUwNlkzZWJ4OCtKOXkrTmhiamdNVnZNVnJqTXdkdGxUbFZWd1Z1U1pqK2pyOW4zYzBBWmozWGVveGNnWGZIR0Qvb1gxRlhKSmtFUWVIWU0rU0tVM3lwUWkrT01WVnp3a3hhVXRwRXgwV2hMRTczSUFvMUFDSTFkdzI1RGZDMnRLaEpybHhlSnRyMTEwWXlIUElDWEcvRWZqcy9WbDIxRTc2SW1PVU1qQ3hISjRZSmxPa2xScjRFSTVzY1Z3SWxFZXQ5U1dXSlNjSEh5aGlDTUhsZ0tHZkQ1WW91RkpiaFU1S0RGdUVqdnZOVHhIck1VS2ZDNFJSNkZDSzRCcUhWb0dKL1RaV1JBTEp0TGJtSit3ZXNQdzAzZEd6QS9WcUxtcGp6Z2FpNTBBaFZQdkJDRUhMdnlMV2tNc1Y0SlVyWVZJS0FSVnlraU1IQi9xM0JSS2pKdkUxcFdhbjFjWGpVMWhsRXVpM0EzR2dUSU1PVzh2RllFenlnZWYyZ0MyUUJDY0hqZDBXcnp0djJtemIvS3owWWE3SytXbCtEbE1oS1Vha2NXcUw5UWNqRUlCRW1JNVl1UWdndFQwWVFwU0tqNXZEblVyU3lZbVBTZkxUZHhWVXdvUDFPcmg3a3FHUzJCZHRnU3hNc3YrcXpQVyt0OS9NTllVRGhOZVU1ZnJURVRBNVFUcnRhc2NRVlJsNVZ4elZ4U2tXNWJKOTlPb1pCN2luc1VLRXdwS2hGQVFUZG9VTnJhR1NXeVpySmZPT2cvSDhoL2ZiUm1vUDM3Rm1SRTVzTEc4OWRvVmNBNzBjOHR1SWY2dHdiQ2R1Slh0bEJqekRPc3JaSnNuckVYeWZZVEV5NkJXd0ZEMC9WNmZHU1kzZjIxLytvMythZVFJc2FtcndIQ1JuTmljRkZ5NVlPL0hER2cxakpRWTh3aDZtVENlVnhBS29pbXRCYTZYaG5paHpabHNYQ1VwT2RLdDc1cUkrNnBrbXNmWGFRNVNZc3dmYUF3S1VmeVhLa2h5SlRFNUZZMkV3VThzeHJzOVBuaW54OXVVNGxpVHlNRWx3M3hqdFJtWnRHNzZoa2x2TWhhSmRsRml6QlBobVZpSElVb2lQTkY5dUlZR3VlM2hENXhJQ25PYTQwMGpCMVp6NGVyUTdBd0Z4amhzLzkySFN2Yk1wa3VoeE1nUjQ4dDFwN1FXTWNHSm1nQ3R4Vy9PT1BabGNGZ2t4OXIvL010d1hJZGcybnpVeGVlcXUyNmxTNkhFeUJGbFN2SGlDV0trdC9jWldJdEVtREdVM2YxcWJ4T3VwQlFEanEwZ1FkSlpqOWwwS1pRWU9hSzZTR3ljRUo2cDkzdnJtdGVlb2JWSWhQMU5zM3ZIemxkNmQ3elg2NG03RmlRRmtnUDFSekx0Z1M3bG0vWDZQWlFZY3dnaG54ZDNKYWtXdGNGYXpwKzhOWnIxNmtJeDRHclAvM2prT3VkYU1KMGVBMFlzRnFlQTB5RFQ4aDBSMEt3c2xhSkwwVkJpekFFU3kvdUZLWmJWZkxuRGFTYVJ5TjZiL0Zmb1d0WisvV2pmUGl3OGpndGI4aTh4YWtFTEVoalBleUFSWCsvMFF2MHkxZlpWWmJKbVNveGJEOU55L2NUUWVyTE9TcGpsM0hOc2VNZHMvVU5DaXIxUE5mZXNKU1NaWkQzUXZkeHc4K0dTQldEM0g0YWhkSHo5K3BWbFV0UE5SQ21VR0xOZ01aTGhSNjFXVEgyM3p2Sy9iU2R1aGJNZWlkcmpzc1VQUC9qVE1BaDRRdWkzc2RBN3loS3h5bG14bklsQlIxZHpnMTB2RjMxcGlVRWl3YVZ4MVpMSUpLdEJ4S2I5SjIrUDRscG9IOHJJSjRsV1dsL3JkTHpZUFJva09pUjQ2WVUyV3gydXVZcHJ1Sys5VFFJVkdqNE11WVBRT2NLMVVzaXBDUXR0enBZYmpNdUxaVzNyS21XYXYxbWxnWTBWL0RneDBNOS82dEQxSFYwandhWmI5V1ZXbDhsYW50NWNZc0xLTU5RN1JjcEkvTHVnemlFdWJTdE1IcU9oeEpoTlhiSHpYc1BPTXFYSVJDSVN6VFZiRU5wdStMbUc4cXR2RTBHdFFjU0ZpNGZQdXc2OGR0RzErMVo5cVZxRHBQRmZIeXhyanBVTGFoV1JhVmxZdEdCUEh4MnFnaXdLZXlneE1zQmQ1Yks5LzN4L3laNnBFNWhSQlA3eWZTdGdsd3lEVXNnMVkycytaN3VsMS9TYm0wdGJIbHVsTmNXaW81aTFtSXBGMyttcXowYnpVUEdaZ2FWSVJvcVlBUDNhZlFadTVXVnMyOWp2Q0xYZTZpK25sVTd1eXpGYm9NUklEODIvUEZCeU1Ca3BFdkdWamNYUWNjTnJmNi9IdlhzT3ZtTjg2RC9kN0RaS2pGbkVscVdxUFo5ZVhaUlJ5TmRZcTI3UFZ1RE5qc1VReGpPY2ZENGx4aTF4SVo5ZnA4dDRRT3FsRHR1SnVmN0NnbG04bTVRWU4rRkNZbmp4M0tqNWRMLzN3RUs2QUpRWVNmQndqZnBncGk2a3krS0hINTRjMmdGejNMQTExWGdOQXRQejJYNC9Tb3drTHVUTEc0c3picVg0djZlc0IyRDJVOS9aLzhMVEJNazQ4U2xiL1VPSmtjU0Z4S1lFWk9KQ2psOXg3bHVJRjRJU0k4Y29CSWZBaVF2WkNubXdNcUxWeTlvcE1XNUJGSUlaeisvOGVXRDNYSVNuT2FLZEVpTkhaQk9GZlB1UE41cDZIY0VEQy9sNlVHTEEyRmdJaVVReWNpRlladmVtZVU0eW5PbHZaSm83ZWJyUFR5MUdMb0x6c1ZYYW5abDA0c1U1SDc4Nlk1Mlh1aUpkY2t2SjhCMlVHRmxpVmFsMER4R2RNeGJPWXI3aTZUZjZrUlRtK1hnZUlUYjFlNjlkZEprcE1iS0Q4YXViRERNS1RoU2IzM3k5Zi9kOHlGZmtncTZSSUNWR2x0cGllN0oyejFOSmtROWlNeHhKbnVIQ1dYQTBLc2tTcUMxbTJ1ZUhKNGNPNCtTZitYb09zWmJWT0pVeDJTU2s4UndHeldOa2s3ZTR1MUt1bVNrQ09kcnAyREdmVDBJazRNWGRSREI1WDQyY2NpMEZiVEhTUlNKSUNweERDdk04czJuelRjd3hDWVI0c3hLcUZqb3h6S2Y2dllDWE5acW5wQmdueG9sRVlreDFKeWU3UFdjcE1iS0FRU0hhYytpTURWN29zTUVRRVpoc0hwSUNjZnlLTSs1S2tCUXUzOFF0eGVGMkVwSGtaREVLYVNFYkRZbEFkaEhCdVJrbkpLTWJ1V3dKd0lDRGhhZCsyd05yU1hSeVlkQzdvM3MwY0RoZlNJRWczN2MxY1RFZC8vaXlXNWp3T252RGI4OVZZeFFLTWVxZXFTOXIrZFJLaldaS3VNcHQvMkY5RWZ5dXd3NnZYZ2pZODRrVU1aZDRyTXZSaEtFM3VzVXc1MTc0SUJhdzVIemNUYmtldEJEbWxSaS8xMURlbGtsMkUzOTVCOTRlMm5weDJIODQzNnpocGtXSzVrM1ZTaE8rY0JQWGVIN0FCMzh4dTliU3FDUUY4SmVVMktSMWhuMWg2MHJ0VGZlV21BUFlSMzBSellXQkFPRGoraWdMS2tZRVMvWFNuYmtlY01GUGFzWUp3TStmSFQyQnh0SG1ZNDJ4OXM2cFVHdVFTTHBIZytRUk9KWlA1MW1wWWI2bllBVGN1ZUVhYkhZU3hpb2xQTTNHeFJMdGhhRkFuRURVbGFRd3VZUVlqYmkraUtsYVlVcFZmMEdVZml0MjBNc3pZaHlzTHBKdVYwdDRZS3FTdzZOMXNrbWRmcEFjeHpyZHJmdFBXak1xTUNxME5naCtFdmZqa3BpSFhqNXZQMFMyRGhLaEdNa3ZUWk9ZN0NMV3duejhpdXRRUHAyWW1oRlVQWDZudHVHSk8zV3dSQy9tbHRaS1JMRkNpT3VzR1ROZDFxS1ErMlBZMGMyMGRMdCtURnpORVl1SGxRVENVV094WENqcGQ0YnlqUmgxUDN5NG92bWV4UXJ1QmE2RGdpMnNrOVZvTEM5bUpDVUs0YmJqbHoyL2dEVDlPK2hzOStsb0pEb0Q4aWt5Mlhtdm9mbnYxK3FtVFhuQTlWUGtra2hTZ2p6eGZQL3VscXVlQXdVYmxlU0F3L2tXcmxhcXhVbm53V0N5eStvVWNDdEc0L1BFTmRnK3NreitTTHBqMGlXOEZ3QzZMSUZXakVReXlrL3d4dHBidjNmZG56WkMrWDhCQmdEai9hSHNQbXo5d1FBQUFBQkpSVTVFcmtKZ2dnPT0nO1xyXG5leHBvcnQgZGVmYXVsdCBpbWFnZTsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0EsT0FBT0EsV0FBVyxNQUFNLG1DQUFtQztBQUUzRCxNQUFNQyxLQUFLLEdBQUcsSUFBSUMsS0FBSyxDQUFDLENBQUM7QUFDekIsTUFBTUMsTUFBTSxHQUFHSCxXQUFXLENBQUNJLFVBQVUsQ0FBRUgsS0FBTSxDQUFDO0FBQzlDQSxLQUFLLENBQUNJLE1BQU0sR0FBR0YsTUFBTTtBQUNyQkYsS0FBSyxDQUFDSyxHQUFHLEdBQUcsd2lSQUF3aVI7QUFDcGpSLGVBQWVMLEtBQUsifQ==