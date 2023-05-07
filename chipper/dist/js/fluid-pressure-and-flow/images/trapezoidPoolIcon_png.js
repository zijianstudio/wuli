/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
const image = new Image();
const unlock = asyncLoader.createLock(image);
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImltYWdlIiwiSW1hZ2UiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwib25sb2FkIiwic3JjIl0sInNvdXJjZXMiOlsidHJhcGV6b2lkUG9vbEljb25fcG5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlICovXHJcbmltcG9ydCBhc3luY0xvYWRlciBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXN5bmNMb2FkZXIuanMnO1xyXG5cclxuY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuY29uc3QgdW5sb2NrID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggaW1hZ2UgKTtcclxuaW1hZ2Uub25sb2FkID0gdW5sb2NrO1xyXG5pbWFnZS5zcmMgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFIY0FBQUJOQ0FZQUFBQ2MyUHRCQUFBQUJHZEJUVUVBQUxHUEMveGhCUUFBQUFsd1NGbHpBQUF1SWdBQUxpSUJxdUxka2dBQUFCbDBSVmgwVTI5bWRIZGhjbVVBUVdSdlltVWdTVzFoWjJWU1pXRmtlWEhKWlR3QUFBcXpTVVJCVkhoZTdaMzVVeHZKRmNmNVIvSXY1RS9ZL0p6RTdGWTJXMG5WSm5FcVIxVUN4T3NEY1lqREdOdmlGQkk2UnhJM0JnUEdCOElZV0FQRzRoQUlJUW1FYkdNd2Eyd3dsMkI5YkxLT3dldVg3bUVVdytnSmo1Q1FSa2l2NmxNbGVxYmZkTTkzWHZmcm5uRTVTYWc1MTkvMU96ZDJJSUVJV0g4M01MSDg0ODg0YVE1bmsydnZQcURPRTRnR3FoRW5sekFqVDhZbTVpaUJtTmwrd3NrWDJQQ0tDV0tCQTZNWXF4Q0xmS1VmaDY4Wkc4eHN2VWVQSDJlSXdEOXhjbjQweDlxNzk5akpzVVpHb3gxU2F4MlFXdWVDMDZZUmNDRG5ISGNjYXp1ZmM3THVHblpTTkJseUw0QzVzeFBNNXNCMGRKamhXOHNvakxnZXdoM1hHbVJjY2NNcDB5amt0VDJDL1BaWk9IOTFLaTZqbDhMSktzNnN1S3I1T3N3L1dZRDY1aFpZK080cHpCTVdubElXV2I1YlhHU1BkM1YxdytMekphaStPUU0xdHp5UTJXQUhSZmNpcUhxZlFVWEhZeGlZZVliNlArNU1ibXlmWWNYRkRrYWJxdVoyVUNnVm9LeFVCb1FlTHlnc2hIUHBFc2lvc29IRU5BYW5xMGVob1AweEZONllnOElXTnpoWC9vUDZqd2VTSEJ2Ym4ybDFldUNqMGZxWDhkSHA4Zks5WUg2RTFLdlVhRUdwL2pSbDhvcDlIVHFwc2NDcE9pZWNhcGlDY3pWais0N0ZHMG1UR3p1dW50NXZnVTkzVCsvK012N2ZoRjdlM3l5ODgvejhFTkI2UEt4ak5zRTBORGI5UDNIeWZQOGUva1F5NVQ4Yko2RFY0ZlhyY0R6QkRzbHV6d1BSTWVXZWdla1pENDdiQTQvbjVtSDI4Unk0cHFaaGVIaUVUYjZtdkhnbjR4VlczS1VYSzZMaitmSUx0Snl5dkxJS2ErdGU4RzU5RCtzYm0yeHlaYmRQa3VUcURvbmcrTXlPTVZoeHA2ZmRvc05Ob2hPTGFNck1nNGZ3aEdUUFZPRFhiOTdBcTFldjRkblNNdGdtN0hEbFNnUGEwWGlFRmJlbHJjMlBxNjJ0Kzh0YTkvem1hRzI3NWxmR1A4L1BEd0d0eDZPdC9YcEFXcSsxdzgyYnQyQncwRUpFZlFGdmZ2ZzNiRzI5aExrblQrQnVYeis0MXY2TGRqYmVZTVZWcWRWK1ZLcFUrLzVXYS9ZZnAyaTBHcjh5UG53L0ZDSDFLR3FOQnNWM3JLNitIdnFJbUdzYkd5U0NmNENsNVJXd0RBMURmZE5WdExQeEJpdHVkazZPSDFsU0tWcStGMmx1TGxxK0Y4eVBrSHE1K2ZrQjJUMStubDNuTmwxdElZblZQR3k5ZkFXcnErc3dNbW9sMlhNajJ0bDRneFUzSlRYVmozK21wT3d2Uzluem15TTFOYzJ2akgrZW54OENXbzlIR2prbkxlMWZLUFQ0MmZSMEtDb3VnVm9TdlpPVFRsanplbUg1eFNvTWtjejVha3RMWE80cDgySEZGU09POWNESVN1VWd5Y2lFTW5rNTFEYzB3cVREQ2Vza3VWcDh2Z3dXeXpDSjVzU3dUQkd0dUFkUkZFQmNtakVueFAxSVF0eGpURUxjWTB6TWlVc1RwU3hwRHVTZkw0Q1MwbEoyV1ZSZFV3TlhtcHFobVNSU0RVUnN4bWdFMStxUGFQMTRJdWJFN2JXNjRQU1pzM0NoOENKb3RUcTRjYXNEM0I0UHJLeXR3ZXI2T3JzczZ1c2JBSWJSby9YamlaZ1R0K0ZHRnl0dTRhVkxvR2NNY0tlN0J4YWVQb01ON3hac2JHN0J3dUlpRE40Zmd1cnFhclIrUEJGejRrb2tHWkJPS0NvcGdTb3lITis5Mnc5UG55K0JkK3NsYkJJV3lidzdQbTZEYSszWDQzNnRHM1BpMGswTXVzTlZvVkN3MjQ5MEw1bEc3dnFHbDBUdkpqeGJYZ0dIMHdXM3U3ckJ2dlFhOVJFdnhKUzQ5NXl6Y0U0aUFVbG1KdnVaRGQxbUhCZ1kzQldYQ09zbHd6SjlIZmhnZHBZVnZhYXVIdlVUTDhSWTVMNW50eDJwdUZUazlJd005cmNrSzJ2ZkhqYjlUY3N0TXd1SWovZ2g1b1psT284S0Jhc2ZUOFNjdUFtRWt4RDNHSk1ROXhpVEVQY1lreEQzR0JORmNiZVJzc0JnMmJBUU1GL3hRbEp4emhjZ1pvcWt5V0EwR3VHd3B0VnEyZnJCNEhLNnVOcmlOSVBCQUFhZENyMWZleEc5dUZwMUdYUjJtTGx1SGM2b1lQUWh3Znp6TVpscVlINXVqcXNwVHFQOWtXVi91aitpRmpmVXFQVlpiVTBOS0l2UG9kZmdVNUwzTzlEcGRGeE44ZG44L0J5SlhBWnRPeDlSaTZ0VmwwT251WlByVm1obU5KclFhMkRRYzhWcWRFZ1dPZ3FKVnR4d1JhM1A2TnhiZHY0UDZMWDRWTWhTMlBmQllyUHQ3VzB3RW5HeE5tT0lWbHk5UmdFRC9mMWN0MEszNWFVbE1KcXEwV3Z4Q2ZlREZTN1RNd3lVRjV4RTI0d2hTbkZsMmI4K2twdExoelJaMXEvUWEvTFJLaStEMlJ4YUloZE8rL0RoQTN0UHNMWUdRcFRpaGp0cWZXYTFXb252Q3ZTYWZJcXlUN0FQZzFpc3RyWVd0Q29aMnRaQWlFN2NvNHBhbjFIZmdwZEZKTEZ5VDA5ek5hTnJ1KzMrSEcxbklFUW5MbzNhZXdNRFhKZkNiODFOelZCWkxrV3Y3YytYb05mcnVaclJzMG03SFF5TURtbmZ3WWhLM0tPT1dwOEZNM2NaVFZXd3M3UEQxWXlPQlRQYTdFVlU0akphNVpGR3JjL1VhalhJTC80ZGJRTWYrY1cvQVVPeTFHaloyN2R2ZzFyKzdFVTA0a1lxYXFsdGVyM2tXbFZvTy9qUWVTNVM3Y0tNVGd1bGVWK2hiZnNVb2hHWDBhdGhZc0xHZGVub2pkNDAra0JoYmVHamx1ZEIrN1ZyWE0zSUdaME9ncGxDK0loQ1hMcjJqSFIwZUR3ZXdVbEt0RFkxNks2YXVpd1RiWk1RUkNFdW85ZEVOR3A5UmdXVGtmVXMxaVkrUmdNREZvdUZxeGtaQ3lWcUtWRVhsNDFhTWtTYUh6Mk5PTFV0YmFDdXVJQzJpdytkZXcwa3NjTDhIQVVObG5IMm9jZmFJcFNvaTBzN3dJdzRnYkU5akRoNit5d1hIY0kyQitqZXRONHlnZm9LSytNUHdjalFuRURZcUJLSXFJckxSaTJKQnQzNFROU2dOMUVoUzBQYng2ZTg0SS9zK1ppZnNHS2RKcU9FSG0xRE1FUlZYQU9KV3UzZ0JHakdQRkZETyt3azBSdk11MTRqcUd5UFVGL2h3a0NtcVNLQm1meEJSRTFjWDlTcXJETlJoN2FqT09jM2ZtM0VVQmFmQWFhMkR2VVREaW9Kb1NaU1BxSW1MaDEyVlBkc29CeWRqanFhN251Q285ZTNMRktNdWxGZm9hSnJiZ1hGNVJUMDJzRVNGWEY5VVZzK1BBMXlFVURiUVFVVHVxbGgwQ2xCMjlLTytnb0ZYenV3YXg2R3FJaExvN2FpZnd6S2g2WkVnN2JsT21ncmhiMHZaYVBYWUVEOWhFSmwzeWd3R2psNnpjTVFjWEhacURVd1VHcVpFaFVsbHQyb0Vmck8xR2lxQVVYM2ZkVFhZYUdqbVpCUFZvVVNjWEZwMUpiMmpVSHhmWmZvb0Y5ZUtFdlMwWGJ6S2MzNy9XNGlodmc1RkFNVDVONEUvODcySUNJcXJpOXFaWU5PY1hMUElUaXhvdEJ6TDVLSVIzMEZDWDNvdzdIODJVdEV4V1U3Y05jS2w4aE5GQ3QwSzdSVTZDZXdsLzRCVEZVMTZpZFl3cGxJK1lpWXVMNE0rVUwvcEtncHVrMlhSVUxmOWU0dWl3cjZIYWd2b2VpcnFnUi9VeDBNRVJPWHptZUZQVlk0MzJjWFBUUVRwZzhqMWc4K2VsVXhxT3FiVUQ5Q3lDY2NSZFJTSWlLdUxPdVg3RnliZDNlY1lCTTlaVzFtNFovQVNrK3dEOE5oK3lhLzNnVWFaU0hxTzFTU1pOTGtRZXhBT0tGUm0zOW5CSEo2SjJJQ2FlOXVOQW45S0kzK3k4Q1M5aTdVMTBGSWV5YTQ2d1QzeWFwUTJQL0xEenNRTG53WmNuYVBMYWJRMWRTQnFqd1g3Wk1mdWI5bG94ZnpjeEM1dDRmWno0dFFuMkhneU1XbFVadERPcEhaUFI1VFNMcHRRYzJGTkFuTFFQd2NCSDE5U0lkMXpGODQyQlUzTy9rbjdHQ28rS0pXY21jc0pqSHBkU0MvOEZlMGIzektMNXdFQTNrWU1EOFltVjJqYkxSanZzTEJaZWtYWmxaY2F0Z0pvVUtqTnJOekNNNTJXV09TN0Z0a1dVVDZRUHZ4S1JnQ2pmUnZpSENZTHo0bUVyVWx1VitpOXkwY2NMTHUybVZwOGlSMjBtRXB5aVpyUUxLdVBXMjJ3dW5PV0diMEVHQitQdklONGFpV1A1UkM2WWxmY0xKK3RIQU96MGFERWM1MVdPQlU1MGdDSG9yNlpsQ1ZDdHZERHBhaTdCTXZPVG45TFJ3QzB6Y2JkSzVOTTQ4bTRKRktPS3FvSmFQbEZpZGpZQ1BxMjdIS1FxRlJxNnhySkU5b1V3SWV5dHBHMEdzVjZIMExCWmtrK2VlY2ZNSk1scFA4SG5OMEVIUkJMaS84UzRJRENPYzcyeEpwY2hVbkY4K1NrdjRIb21VVkREOXNLWDBBQUFBQVNVVk9SSzVDWUlJPSc7XHJcbmV4cG9ydCBkZWZhdWx0IGltYWdlOyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQSxPQUFPQSxXQUFXLE1BQU0sbUNBQW1DO0FBRTNELE1BQU1DLEtBQUssR0FBRyxJQUFJQyxLQUFLLENBQUMsQ0FBQztBQUN6QixNQUFNQyxNQUFNLEdBQUdILFdBQVcsQ0FBQ0ksVUFBVSxDQUFFSCxLQUFNLENBQUM7QUFDOUNBLEtBQUssQ0FBQ0ksTUFBTSxHQUFHRixNQUFNO0FBQ3JCRixLQUFLLENBQUNLLEdBQUcsR0FBRyw0d0hBQTR3SDtBQUN4eEgsZUFBZUwsS0FBSyJ9