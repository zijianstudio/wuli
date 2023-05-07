/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
const image = new Image();
const unlock = asyncLoader.createLock(image);
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImltYWdlIiwiSW1hZ2UiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwib25sb2FkIiwic3JjIl0sInNvdXJjZXMiOlsic29kYUJvdHRsZV9wbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgKi9cclxuaW1wb3J0IGFzeW5jTG9hZGVyIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9hc3luY0xvYWRlci5qcyc7XHJcblxyXG5jb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG5jb25zdCB1bmxvY2sgPSBhc3luY0xvYWRlci5jcmVhdGVMb2NrKCBpbWFnZSApO1xyXG5pbWFnZS5vbmxvYWQgPSB1bmxvY2s7XHJcbmltYWdlLnNyYyA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUI4QUFBQlpDQVlBQUFER3IvOUlBQUFBQ1hCSVdYTUFBQWgxQUFBSWRRSGVQaGk2QUFBQUdYUkZXSFJUYjJaMGQyRnlaUUJCWkc5aVpTQkpiV0ZuWlZKbFlXUjVjY2xsUEFBQURGQkpSRUZVZU5yc1dnbHdVOGNaL3Q2VDlIUllrbVZaa2kzYnlBZStjTEFKR0dNQ0dGc09oNXRBT29VTUhVOE9PbWxMTXBsTUptM3B0RE9kTkoya2FhWk4yaVJOMm1IU1hKQ2tDWVJKSWNSSkdIQU9uQVNhQUNIWUdITVpnNDE4VzdJT3k1S2VucnI3Yk1rU3NzRTJKSFFtL0RPcjNiZHZkNy9kLzlwLzk0a0poVUtZTE5Xc1dyNHF5QXZQQ3lGQmw2Qld4WFMwOXpsNGhVclJ2dWVEK25tVEhVK0tLUkNuNEc1ZnNGYWRxY3pxSmsrZWk5N0s4T2xUaWltTngrSWEwblh3YTBMTVpMU2RZWmhiYnIxMTFWYWxTc0dxdEFvVko1ZU4yNjduUW4rSWszR3RRMjczdnJvUFByam5hbW03aHVlRDZ1MXZiOGNybTE5SFlVSCt1STJlZXZKSnBybjUrTXlzekJtVHMxKzY4c21tTld2Vzd0KzlwejQwRVZtdDFjSlV4cHVTekZtV01XbzFtZ25mS3hUSzREVlRPSjduSmQ4YWVEQW9HRFVhOVlUdjlYcjl0MmRxL2YwRDZodUtaazM0UGttdko0YkJMTG5xdnAwTW1yWCs3cnREbjcvelhFeTlJVDBYY3RVSU4wcG16MEoyZHM1U1V2enNxb0xYTExjK2w2cDBTeHEvcUp1d2pWZVFJeU10WlFNcC91bXFzYjI4YlA0ZG5GUlNrNlgyWExLZGl2VWhLOTFnWGw1ZHVmR3FnQk4yMytqeisxOWVOa3N1bGNsVjBPck5sMnhmbGlGd3hDRTlTdnRkRWR2SkFMb0Y4MHZyMXl6TzROSXlNcENlTjRmV2dmY1BvK1hnUndqNGh1TDZ5QmdlTmZNTXlpRnZhVDFwTzVNNEU4ZVV3U253bkpMaWxwb0ZGbjNKN0NMb3pWbkV5WXlZc1VRbWgwUXFJK0RqOTAyVURvUDJDd2FEcDhnNGVSTk5ZRUx3eWlXTFBscDRRMnJLb3JJUzZJenBFZUJna0VkN3l5RU1ld1l2eVZLemNnakxGdVFZQmwyZW8rVFJNbW1aMzFSZTlpRlJuTGxsQmVZWVlFRUlpc0Q5WFcyVHNoQ3FvTGRWRmMrb1dXYjliRkxnVkZNdGFjYnFpcGtTVWNaaFlFcTlIYWNuRFJ5bXZFUVBVZzNheFdSQmIxd1NuR29vMWRRbE9heXNZRjRsSkpJeHFmQkV3QjJuamt6TDV5L004TUdVckZ0SFRYWkNjS0pnSDFKTjFhZ1RJRk1rUk9vcHU4ODJIYmlpVFllYXFudkkreUwxbEhIZ1N4WXRmTFNpTkRlRmFpcFZwck9OQitBYmNvckFkTlhPZ2E0ckFxY21XSHR6Z1dMaGd2bDdZOElvYWxaRlJVV2Q5OVZrSzJpam1EMDZJUkZCUGpDdVRVK0h2bWpuL0JlNkhXdnJQOW4zbnJqeVpkYWxQNnN1TDRnRHBrUzVjTFdBS2QyWXpuQUJubjgrWXVmMlFlY3ZsVW9qVG5xMU5MQkNuek1BcjllUFVFeTRGUjkreFlWajRUSXRqVDZZOUVySVpXeWt2MWtCNkxRSktWVDJVdnF6NnJibFprT2hBdWFNSVpBZ0RHcmRJRFRKZmNTaEVGY3FFTWNpSmxJbVFSSlA4bUJVM1ZoNUxBa0NSdnN4Y0hhWVJHQmF6L3NrYU8yVmd1ZWdLSjE3NDROMDVjdktsNWhRc2VKSXBITVk0R3FRT3EwSHdkRFlwSlF6U0VwT0JUK3NXOEd1V0ZsVnFsQit4eWNWanFkU01VcFZLa1ZGdW1Yb093V1hKZ3pCNzBjU2xibml1ejRtU2RRRTNDZGxydVZaalpVS2dxQlJxbnpvT3A4SnQxc09UWkpkMVBUcGtLZkhDUGQ1TlZFbW9seWhzSHhEa0ZuNndGNFVnblYzOWpQU0lNOGJYOS9FSUZHclFFR3VDb2U2cE9pd0tXQktVU08zUklLODB1WkxBcnE3VFRpN1B3SEhqM1ZqNFN3MVN0T0NNQnZHZEtoelNJVzYra1R3TWgzU3JMM0V6L3JGK3B3Q0M2UkNNTVJzZitYRHVFRzdiZlB3ankwRmVHWmJJdGI5WEE5RFZ1eFdPdGcyQTEvdEZwQ3NsS0k2ajhGZFJTbElsZ3hnaHZUTVJXRU5zSnFFZmJzNjUySHIrenJrL0xCblRQYXppL01mMmZadUhqTmdMNGNsUlFhMXBuUEVQa2x1WGRLRW1xVUdiTm1pZzZQTERIMjZCOE11TmZadk02TzdKWWhIS3JxeE52czBObmNzUVoxUWllT2RjcFRxKzZCaTNIR0xLU0RqN1dsTEE2ZFVnOUc2MGRXa0FPc1o4Z2QvODhSNWhOUUM3bnhBalllZnFJWGJsUjdwbEpKMkdDODl1d096c3lUWS9uUUMvdjJVSDdmbisvSFBtNzlCdXJ4N3hKMUs1WGhITXg5dVhRNzZlY09FSWxxYUowTndRQmEvbjg5ZGZCU1AvTDBmS1Rua0tMeCtKZzRkWGgzVDBkWWhJTnVreHR0M0RLSXErZWkwRkRKUDU0NCs4VEp4QVdUeFRZMHc1eGp4K0xNQnJQOXhMVzZ1MkljLy8yMHhFb0krL0dYeG9TdXlMVGR4Nm1IU0dWWGpSNjg2WXg5Kzh1c0V2UG9rVVpTNlV0VGtEUk9sT1h6Rmh0M1FKZ2RtanBpY1VzZUE3ZTdzRy9kTXJWQjVZRWxYb3lCRkZRZnNoUlpIZkdWVEFuWUZ0V2hzZDBLUjJqdkcrcHk4akhIdlQ0N3NtVTFZSFlUZWFNVEdwblhZN2FrUjYybitjRk1ONnJvS3BnVCtWbXNCTElYcXl4OGFITDBHZk5rd2dFMjNkS0E1b0VCOVVqVTJPem5zUHB1SVlhMEYrOU55OFdCbzc2U0JML2hTc09lWUU0VnIzWmNIMy91V0hyOVk2b1JHNGtRdWN4cUpnVG5ZWkNEYVQ4eUpVc1h3U1dpNHdGakl6ZnV3eG5VUTZzRldKSnZpWGZPdmlITVo5Z2RnUDVpR0JETUoxZlFENHg4YTdMMUcrTjErekU5c0VaK2JodU52SXZwWURsOTFxa1RaVTFxZjNZd2Z5UnJ3WU80QkpMT2RNVzBmTzF5RzVWWVRkcit6RHh2dmNhTFVyQVhmYkVidlNVLzh5Zy90U2NXNk9VNngvT2xRTlhhZXo4Q205QlV4Ylk1eldXZzNFYzA5QWR5VmZRS2JXd3ZoVU0zQXVTRXRObHJHM090amg4ckFxR1c0Lzk0M3hlZjgvSHFTZ0R2WEFUdmZyNDFmK2ZrMmoraEUrZ1V6L25OQ0M0YkVITFhPUXlLclIwNktMdHpYdHd2cnUrdkJTUm5zSDhqRW9DWUxyK210NkdMTWFPZG5SbGJNSk1qdzJPKzNqYXNIR2FudStKVTM3RDhHV0NHeTc1bTVPOFM2ay81aXZOWmVncThsR3F4ekhVTnQ2amNvVnpSRStwdzdzUTYxWkNobTBBWTVHZlQrK2prb0xWVkVWanpwOC9uTTdEUmlrd09pc29VcG4ydkU3UmFWdUZkTHZIYVVXeHBpK3Z5eFlKczR3VFpPaHArK3JjUnZIMUtpMnZybTFLOUY4bk5OK0tRbk42N2hITmwva2FsMFlubTJjMXhUZXVGTEdWNzZ6SVBLU2dzU0UzM1R1d3BidUNLSXQ3WjRVWFdMTm1iMWxPNU5xNE1TWTNVblBOblkybUpBbTkySDRtb2VtY2x1dUM0a1lFdWRISC85MXlvU3JUaVFucEVFc29lZ2ZGN3N0ZW5CSStOb3U2WHdOS3dyYjBEdFZpL3V0ZWFpeW5RNk1nbDZhRGpvTHNUWFBScDhmTnlOSkxJNUZDN3lFd0JiSk9iWFpwK0hPaE5JSmVVaUV2OExna2VNMjArSmg0ZVFHRjdSZ3dtTWl2R2RUR0ZGTXpia0czRG1pQkk3UDgySk9SS2x6bERCbE1PanBzb0ZodXVOZ0Y2T1ZPVHdJTVNjYWd3VDM4a2trcDJ0cExvZlJWV1hQaTVkLzhaeUhmdzYrUDgxZU5BbnVYYmczZ0hwOTFubWJwZjNtb0ZMWlRLcCs2Ky95OWJTVGNNN0hFQ0NSaEZ6eDVac1VpRFJJSW5zU0NPZklzZHlBZUhuMkhlUnRxTWJVdWNacjNnM1I4cytlc2NuT0NGMU9UejIxWVVTN1pnVS9MSG5jRjZDUUc5d21tdGpJbmx4dGd3ak41eTBUb0ZkalFIM1pUOXQwWXZnYjRQSW5zNS9mN1ZkT3V3TGhQWmZVQ0ZCeVVIQnNkQnpzV3lXc2NLMFdCOElTVEVZNEdJZEM4L0FaaC9SbjJNdHh6bHBUMitmenBLVkE3MHVnNmcraDhHUWdDQTVuWHE5WGpIMTkvWEJZWGZEUjg1YWdpQ01mbmtZUHcrUzhJWitIS0RrOC9rd1BPd1Y2M2grcEc4Z0VCQy8yWXcrYzFLV1pSdmxIRmVoMXljajFXeUdtU1FLUGpBd0FJZkRnVUdTSEE0N1hDNlhPQUI5UjVOQWMvck04eU4xcEN5TXZ2UDdmUVRjTDA1Z3BPeUxLZE1Ka3JGNGxsUjAwRUhEQTRkSVRrTmRNcWxJb2w4Ukp6UW04azVNVWVWSmlTVVFjSk94Slg0YXlrWW1RRms0Q2g0WmVJcTNwSlMxMFpNUHA3RVBSaUxXQVRZY0VvK3lRc3pEd0JmbjRkVk4yN1RFU1VqQzVYNEszanZrOFl3cWl5RG1iRFJnRkFmaVdFM3Jwc0RxdU1tMHQ1K3Y0NG5TaE5sT1UvU0tvK1YvU1VjYU5hSEx0Ui9GZVpXMmNMUzN0d2Vpd1JrMmR1VXNPNzJWU1NSc2hOVVNpU1RxWTdCQU54QUhTK1I5cEtlbjJ5ZU1tb3E0Y21hTTFleW93b2tyaVdiM0ZjaWQ2TlVReFEzenBwL2FZR1RsVWV3Ymt6a2J6K2FMNVQ5NTRpTytYYWxVZnRMZDNTMmVIa2NjUmpERzFGaVdtUnpyb3lZOXd2TDQrMFc2U0VJSEl1QkU2WjQ1ZGZKRUlNejJrQkNLVVp3STI2ZkZaa21VN0ZuUnhkSTd3Y2psQU9WL1NrcXF6VzRmeURTYVRMRXJwOWRoalVmUjBMQ1BYckRSaTlQa3lpcXJXaTZYeHdHMW5qa0RtNjNEUWMyVmNGT1ZtNXZIeFVXdFh1OGc0ZTRiTVZzcW1kMEQ3KzdjNGFlK1Y3UjFkb1NGUFQwOU9IYXNxYW0zdDhkSVVsWmZYMi9GeHgvdGRWTXVSY3VidE1HNWMyZDMyKzMySktkek1JbUF2Tm5aYVl1OWYzVTVLU2QyeE8zbk5wdnR2Y1JFM2VNdnYvaUMvM2h6czhqcVRwc05aRUxla3lkUHJJNjZJS0JmOEo4K2V2U29uN0tRVHFLMTlRelppUG8vZDd2ZE5WRkFmN0RaTGd5SGR6bTZTVG1kcmo2eW96MFVjOXNRbllxTFMxYXRYUG1EWFdWbDVXMVdhL1V1MGlScnZQK3lwYWVuYjlEcjlZMEdnN0dGNUJ2SGE2UFJhRGNROGJUUlJNVHdLcjFOajM3L1B3RUdBQldoUXF5bEhBclJBQUFBQUVsRlRrU3VRbUNDJztcclxuZXhwb3J0IGRlZmF1bHQgaW1hZ2U7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLE9BQU9BLFdBQVcsTUFBTSxtQ0FBbUM7QUFFM0QsTUFBTUMsS0FBSyxHQUFHLElBQUlDLEtBQUssQ0FBQyxDQUFDO0FBQ3pCLE1BQU1DLE1BQU0sR0FBR0gsV0FBVyxDQUFDSSxVQUFVLENBQUVILEtBQU0sQ0FBQztBQUM5Q0EsS0FBSyxDQUFDSSxNQUFNLEdBQUdGLE1BQU07QUFDckJGLEtBQUssQ0FBQ0ssR0FBRyxHQUFHLDR4SUFBNHhJO0FBQ3h5SSxlQUFlTCxLQUFLIn0=