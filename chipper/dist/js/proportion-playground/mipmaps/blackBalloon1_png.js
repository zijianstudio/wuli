/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
const mipmaps = [{
  "width": 193,
  "height": 136,
  "url": "data:image/png;base64,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"
}, {
  "width": 97,
  "height": 68,
  "url": "data:image/png;base64,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"
}, {
  "width": 49,
  "height": 34,
  "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAiCAYAAAD23jEpAAAAAklEQVR4AewaftIAAAU4SURBVM3BW4hc9R0H8O/v9z9zOXvmkjEazG7O7HoQRDFPi7iV4BZ8KE0hRGIRCkIfCqLSCgqteEOE+FBs2lJDIaGhPhQpySKVUsUXJXZthBhJiNcux+6ZxN3ZXWd2zszZmTPn8usERxhC4kzc3cx+PoR1sMziLSD6GSm+DURjAOUA2Q6A8Q0BqApIVWIpSRx9SIK/2iWnjg1EuEZWsXg7WD1BTPcAdCsxJTEoEYhIHcDHEkZ/t535P2ADEAZkmcUfkqZ+DeJ7icnAeolARD6TMDpsO/OvYAATu8wH6p73cELTVkfS6ZfskvMROgh9WGZRJ039GcwPEJGBjSYSSyz/ljB82i45s7iKW3aZD1bc2pGa6+bQsb1Q+CqfzT5qO84/FL6DZRb3UUKbIaXuI6IkNgN1MI2D+f5CPq9XV1ffxWUsszhe97zXqrXVHehqtlpZxWrq5ptuOqJwFdb4xG8ooR0i5jFcB0SkE9F0Ydu2uwvZ3BtVt9ZGh2UWNa/V/OdKpXInLkNM2zIjI/8iXIE1PnGQNPUkEaXQMTIyAtM0MT8/j1arhc0mUfyphOEvAESN5trva677A7/dRq9cJuvr6fSb5ZXl+wmXscYnniFNPU9ESXTs2bMHe/fuha7ruMT3fVQqFZw8eRKnTp3CZpE4rnmNRmpxaSmNDk0pZAxjTVPaF6lU8qNUMvkX23Fm0aGhh1Ucf4g09RQRJdExNTWF/fv3QymFb6VSKQRBgDNnzmAzEXM+k83hxjCEiHyqp/U3kpr2J7vkXMRlNHRZZnEHaeogEWXQMTo6in379kEphV6O4+Dw4cNot9vYdATksrn/2PP/uweo4moYXaTUEWI20XXgwAHouo5ei4uLOHr0KNrtNq4XUtxCH4wOyyz+BIp/hK7JyUlYloVetVoNx44dQ6PRwHW2HX0wOkhTvyKiNLqmp6fRKwxDnDhxAsvLyxiCPPpgyyyOgWgKXZZlYWxsDL1Onz6N8+fPYzhIQx8M5keIOYeuyclJMDO+5bouZmZmMESMPpgU34UeO3fuRK+zZ88iDEMMjwTogwFMoIdhGOg1OzuLIfPRBwNkoMfx48cxOzsL13VRr9dRLpcxZAvoQwMhjR5zc3OYm5vDzMwMdu/ejWGTWL5EHwxBgCsQEZw7dw5DJQJE8TvogwFpY4sSwYJdmn8VfTCABWxVEr+HAbDE8gW2IBHxJIwOYQCMKHodIoItJAgChH77TbvkfIABsF1yXheRz7EFiAg8z0PDdS8ooscwIEaHxPFxiGCYoihCpVKBV280jRHjBbvkLGFACh3V1dV3CoXCT4loB4bA930sLS1B4jjIZTIvX1j46ne4BowuCcJnRcTFdSQicF0XpVIJijnIZbJ/vFhefBbXSKGr6tY+K+TyIZimRUQjImymIAiwsrKCarWKQn5bPZfJHry4uPAcvgeFHtXa6vs35PLNZqt5t+d5aRHBJcwMIsJ6hWEI3/dRq9VQLpehKYUbCoVPckbml/MXLxzF90S4Asss7m8FwUG37t7R8DwwMwzDQCqVgqZpYGYwM5gZRIQriaIIcRwjjmMEQYC1tTU0m01ckkwkkM/lqul0+rUEq8ftkhNiHQjfYXxs16Gm7z/orXmj3toa1itjGNDTellPpd7WlHrRLjlz2ACEPiyzqMeEp1ut1o/DMLrdb/sj9UYDg1BKIWsYSCQSX2ua9omeTr+FWH5rl5wQG4hwDSyzuANEP4/ieDIIw9Eoim4WiVMg0nCJIAYkJOaqYl5OJZL/JeB9u+T8DZvo/1sGMni5ey4ZAAAAAElFTkSuQmCC"
}, {
  "width": 25,
  "height": 17,
  "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAARCAYAAAAougcOAAAAAklEQVR4AewaftIAAAJjSURBVK3BO2gTARgH8P/33SW5tkmbEEotNDS9pVBwcNNFaCGB4qZ2rg4OgqKDdCwFcVJxbkAq6OraTpIsWQRBaKcMadOE1Eeu5hLzuNzjM2KEEvoy9fcjnECfjt8G8xIxzQKIAgjijwZEvonINhw3lS/uZ3EGQh89Hl8i5hUQXSEiBacQkSY82RTbfpIvFQvoiUYiz61O5+aQpr39bhhrCo7Qdf0VMT8l5mkiYpyBiHzENAdWbkXGxqo/qtXPE+Pj9382GqvNVmucgKuxS5PvCD36jP6amO4kEgmOx+MwTRPpdBqVSgXnISJN27LSFcO47nnesE/1FX2qmjk0q3dVdOkzM2vEtJxMJnlxcRFEhFwuB8MwcF5ENOwPaDdGg6GsqqrPSgflLfSwPhWbJeYH0WhUWVhYABGhUCgglUpBRPBPCBgOBT+VDspbOILhU1eIKJpMJqFpGur1OjY2NuC6LgZBQBR9mJivoUvXdfyWzWZhmiYGJQJGHwYwiS7DMGBZFjKZDC6EUEUfFYAPXevr6wiHw7AsCwMTAVzvI/owgBZ6qtUqLkKAg3xh7w36MET28B94ngfP9TZxDBaRLYjgImzbRs00c+Q4j3AMzu/uropgGwMQETSbTRwaRtmvqg/zpWIDx1DQFQmN7rieN++4bpiIQEQ4jYjAtm3UajV02tZOaCR4r/z1ywecgNCjT8Xm6q3my1arPQ+mgN/vh6IoICL85bouHMdBu92G5g+UNS3wfiQw9Dhf2vdwCkKfeCyWaDRby47rXPY8mQBkCACJSIeJDUXhvKZp6YDie5Ev7Xs4h1+69wndUyLRmgAAAABJRU5ErkJggg=="
}, {
  "width": 13,
  "height": 9,
  "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAJCAYAAADpeqZqAAAAAklEQVR4AewaftIAAAEXSURBVHXBvU7CUBgG4Pc7h3CUxAj4O8q5AheGMjt16kBMTPQO3Fy9BBY13gEmJg7cAGF0ce0kSTEBhi4oEKCFnvPp0KEh9nkIKV2r3RGJKxBqAEoAlgA+2djn4GvQrpbLbmJMYzaf3xP+aK1fHcdpTiYT2e/3kcXMsTXmLQzDBgHypHpwLrTWLdd1Lz3Pk0opbCMiJWXhulKpvCxWq7NgPPoRRNSs1+vU6/Xg+z7+RYBSO0ukBIBT3/fR7XaRixkAj5ASAJadTgfMjDyWeRwMBm2kBJjfkYOZEUVRPJtOn5BR4E1yu2ZbNtY6UkqBlDEGSZIMN1H8+D2btpBBSB0fHt3E6/UFs90HsFDF4sfebukhGA0ZW34BuOp8aA0RhegAAAAASUVORK5CYII="
}];
mipmaps.forEach(mipmap => {
  mipmap.img = new Image();
  const unlock = asyncLoader.createLock(mipmap.img);
  mipmap.img.onload = unlock;
  mipmap.img.src = mipmap.url; // trigger the loading of the image for its level
  mipmap.canvas = document.createElement('canvas');
  mipmap.canvas.width = mipmap.width;
  mipmap.canvas.height = mipmap.height;
  const context = mipmap.canvas.getContext('2d');
  mipmap.updateCanvas = () => {
    if (mipmap.img.complete && (typeof mipmap.img.naturalWidth === 'undefined' || mipmap.img.naturalWidth > 0)) {
      context.drawImage(mipmap.img, 0, 0);
      delete mipmap.updateCanvas;
    }
  };
});
export default mipmaps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsIm1pcG1hcHMiLCJmb3JFYWNoIiwibWlwbWFwIiwiaW1nIiwiSW1hZ2UiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwib25sb2FkIiwic3JjIiwidXJsIiwiY2FudmFzIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwid2lkdGgiLCJoZWlnaHQiLCJjb250ZXh0IiwiZ2V0Q29udGV4dCIsInVwZGF0ZUNhbnZhcyIsImNvbXBsZXRlIiwibmF0dXJhbFdpZHRoIiwiZHJhd0ltYWdlIl0sInNvdXJjZXMiOlsiYmxhY2tCYWxsb29uMV9wbmcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgKi9cclxuaW1wb3J0IGFzeW5jTG9hZGVyIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9hc3luY0xvYWRlci5qcyc7XHJcblxyXG5jb25zdCBtaXBtYXBzID0gW1xyXG4gIHtcclxuICAgIFwid2lkdGhcIjogMTkzLFxyXG4gICAgXCJoZWlnaHRcIjogMTM2LFxyXG4gICAgXCJ1cmxcIjogXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQU1FQUFBQ0lDQVlBQUFCZUZZODRBQUFBQWtsRVFWUjRBZXdhZnRJQUFCV0RTVVJCVk8zQlAzQWI1OTNnOGUvdldRQUxnS1M0aG1WSmtXNW1kMlpkWENIUDhRck12SldNVk1wVllicW9DdG5scXNqZDI4bWFTWE5WN0NaWGtxcVF6bFNWWTJYWXpYc1pGb2RNV056TmFDZTdHaUswOVFkY1VDUkJFTUR6SEJUWnNXekxra2dDQkVnK240OWdEVjNvQjNPQXg0L0ZVUkxIV0JORnNONG85SU1LTDFSNDRiOEFIaS9NQVI0dkUwR0VIekhhOEFveEVQTkNIV2dCZFNBRjZsRVNwMWdqSlZqL0ZQcUJCOHdCRmNBSEFtQU84QkJCQkJBQkJBUkVoSDhSNGNpTTRWdEdHLzdKYUl3QmpHRWdCZXBBSGZnclVJK1N1STQxTk1JNUZmckJIRkFCUGdUbWdFQ1VBQUlpaUJMK1NZU3hNZ1pqREJqQUdJeldES1JBRGZnQ3FFVkpYTWM2TXVHY0NQM0FBK2FCRDRGNVJEd1JBUkZFQ1lod2FoaURNUWEwd1JnRHhxVEFDbkFmcUVWSm5HSzlOZUVNQy8zQUF4YUFYd0lWVVFwRUVDVWd3cGxoREVZYmpOWmdEQVBMd1Awb2lWZXcza2c0ZzBJL1dBQitDY3lMVXFBRVVZcHp3UmlNTmhpdHdaZ1VXQVkralpJNHhub2w0WXdJL1NBQWZnY3NJT0tKb3hDbE9OZU13ZlExUm1zR2xvRjdVUkxYc0w1SE9PVkNQNmdBZDRDS0tJVTRDa1N3dnMvME5hYmZaNkFHM0kyU3VJYjFUOElwRmZyQkFuQUhrVUNVUWh5RjlXYW1yekg5UGdNMTRLTW9pZXVjY3FFZnpBRVZ3QVBxUUQxSzRwaTNKSnd5b1I4c0FIY1FDY1JSaUZKWWgyZjZHdFB2TTdBTTNJMlNPT2FVQ2YxZ0h2aERyOWNMZHZmMjBFYVRkL01VOG5rR2FzRGRLSWxydklGd1NvUitVQUdXRUFuRVVZaFNXTWRuZW4yTTFpbndLZkJKbE1RcEV5NzBBdy80UTYvWFczajA5QW50L1gxZXBwVEN1M0NCMlprTEtLVldnTVVvaVZOK2dqRGhRaitZQS80QVZDVGpJRXBoRFpreG1INGZvMDBNZkJRbDhRb1RLdlFERC9oOGQyOXY3dEhUSjJpdCtTbEtLUzY5ZTVHcFlqRUdmaFVsY1oxWEVDWlU2QWNlY0FlNExZNkRPQXBydEl6V21GNmZnUnF3R0NWeHpJUUovZUQvUE52Wm1YdjA5QWx2cStSNXZEUHJwY0RQb3lTdTh3TU9FeWowZzNuZ2MxR3FvaklPb2hUVzZJa0k0amdNQkJpelVQSzh3bFlyclRFaFFqOVk2aHdjL09Mcko0OHh4dkMyMnZ2NzlQcTkvRlN4K051UzV5VmJyYlRPU3h3bVNPZ0hRY256UGtQazN5WGo1TVZ4UUFUclpJbFNpRko1WTB5bE5Pdk5senp2TDF1dDlDdkdLUFNEMjFycmY5L1kvQWRhYXc3cjRPQ0FYci9IVkxFNFgvSzhaS3VWMXZtR3c0UUkvV0FCK0V3YzlaOVZKb09JWUkyUkNPSW9RSzVnekc5TG5pZGJyYlRHR0lSK1VBR3FqYTgyNmZWNkhOWEJ3UUc5Zm8rcFlyRlM4cnpWclZiNkZRTU9ZeGI2Z1ZmeXZDcnc3eXFieVl0U1dKTkRsQ0JLWVl5cGxHYTkrWkxuL1dXcmxYN0ZDUW45d0FQKzQ4bFdNNys3dDhkeEhSd2NvSTNPRnd1Rlg1UTg3OTVXSzkxM0dLUFFEeXJBbjBXcGYxUFpESWhnVFNBUnhGR0FYTUdZWDVjOHI3UFZTdjgzSjZEa2VkWGR2YjI1cDF0TmhxWFQ2ZURtY2w0dW03MnkxVXJ2TzR4SjZBZTNnYW80amljWkIydnlpUkpFcWJ3eDVoZWxXYTlTOHJ6N1c2MTBueEVKL2VCMnI5ZTd2Zm5vYTR3eEROUCtRUWZ2d29XNWt1ZmRjemhob1I5NEpjK3JJbkpiWlRPSVVsaW5pQWppS0RBRUdQUGJrdWY5WmF1VnhneFo2QWNWb1BxUHI3K2kxK3N4YkZwcnNwa01iaTZYT0p5ZzBBOEM0TStpcEtLeUdSREJPcDFFS1JESm84MUN5Zk5rcTVYV0dKTFFEd0xnODBkUG4rVDMybTFHeFhWekZQTDV2emlja05BUDVvRC9FRWNGa3NsZ25YNGlnaWlGTWFaU212VXFKYys3djlWSzl6bUcwQTg4NE0vUGRuYUNyVmJLS0JYeWVRcjUvQmNPSnlEMGd3WGd6NUp4OHVJNFdHZUlDT0lvTUFRWTg5dVM1NjF1dGRLdk9JTFFEenpnODkyOXZibXZuenhtMUM2OWV4R2wxRjJIRVF2OVlBRllrb3lES0lWMU5vbFNJSkpIbTkrV1BDL1phcVYxRGlIMEF3LzR2SE53TVBmVjQwY1lZeGlsUys5ZXBKRFByMFJKL0Q4Y1JpajBnOXZBLzFUWkRLSVUxdGttSW9oU0dLM25TNTRYYkxYUys3eUYwQThDNE0rN2UzdHpYejEraE5hYVVYRnpPWDUyNlRMRlFxRUczTnBxcGZ2Q2lJUitzQVFzcUd3R1JMRE9GOTN0Z1RFMTRGZFJFcWY4aE5BUDVvR2wxdmEyOTJTcnlhaTR1Unl6TXhlWW1aNU9nVStqSlA2WWJ3Z2pFUHJCRXJDZ3Noa1E0U2hLcFJMbGNwbjMzMytmNTVyTkpzMW1rMGFqd2Y3K1BvMUdnM2E3alRXNVRLK1AwYm9PL0R4SzRwU1hoSDVRQWU3MGVyM0tvNmRQYU8vdk0yeEtLV2FtcDVtWm1zYk41VkxnVStDVEtJbFRYaUlNV2VnSEh3TjNWRFlESWh4V29WQmdmbjZlY3JuTTIybzBHdXp2NzlOc05ubnc0QUZSRk5Gc05ySEd6L1Q2R0sxVFlKRVhQZ1RtZTcxZWtEN2Jwclc5elRCbE1obW1pa1ZtcHFaeGN6a0dhc0E5WUNWSzRwUlhFSVlvOUlNRllFbGxNeURDWWIzLy92c3NMaTVTS0JRNHJtYXpTUlJGL08xdmZ5T0tJdHJ0TnRaNG1MN0c5UHRvcldrOTIyWjNiNC9Pd1FIRE1sVXNVbkR6VEJXTFpESVpCbGFBTDRDVktJbGoza0FZa3RBUEZvQWxsYzJBQ0lkVkxwZTVkZXNXby9MNzMvK2Vack9KTlI1R2EweXZqOWFhM2IwOW51M3UwTjdmNXlpVVVrd1ZpMHdWaWhUeWVaUlNNVkFEN2dPMUtJbFREaUhERUlSK1VBR1dWRFlESWh6V3JWdTNLSmZMakVxMVdxWFpiR0tOanlpRjVCVEtHQzVrczh4TVQvTnNaNGRIVDUvd05qS1pERlBGSWpOVDA3aTVIQU0xNEQ1UWk1SzR6akZrT0tiUUQrYUF6eVRqZ0FpSGRldldMY3JsTXFOU3JWWlpXMXZEbWhBaWlDT0lvNWlabWVHNVIwK2Y4Rk5tcHFlWm1acW1rTTh6c0FMY0IxYWlKRTRaa2d6SEVQcUJCeXlKNDNpaUZJZDE0OFlOeXVVeW8xS3RWbGxiVzhPYVRDcWJZV1o2bXRhemJUb0hCM3hMS1lWMzRRS3pNeGRRU3RXQWU4QktsTVFwSTVEaGVENFRwZWJFVVJ4V3VWeG1mbjZlVWFsV3E2eXRyV0ZOTm5FVU0xUFRkQTZhUEZmeVBHWm5McUNVV2didVJra2NNMklaamlqMGc0OFJxVWpHNGJDdVhidkcvUHc4bzFLdFZsbGJXOE02QlVUSTVYSzR1Unp2dlhzUk41ZXJBWXRSRXNlY2tBeEhFUHBCQmJpak1nNkhWU2dVV0Z4Y3BGQW9NQXJWYXBXMXRUV3MwMEZFY0hNNXJsNitnbExxb3lpSlArR0VaVGlrMEE4ODREUEpPQ0RDWWQyNmRZdFNxY1FvVkt0VjF0YldzRTRQWXd4S0tRYithNVRFZGNaQWNYaExvcFFuU25GWTVYS1o2OWV2TXdyVmFwVzF0VFdzMDhYMCtqd1hKWEdkTVZFY1F1Z0g4OEM4WkJ3T3ExUXFNVDgvenlpc3JLeXd0cmFHZGZxSTR6QnVpcmNVK29FSExFbkc0U2h1M2JwRm9WQmcyTmJXMXZqeXl5K3hUaWR4RklnUStrR0ZNVkc4dlNWUnloT2xPS3pyMTY4VGhpSER0cmEyUnJWYXhUcmRSQmdyeFZzSS9hQUN6RXZHNGJBS2hRSzNidDFpMk5iWDE2bFdxMWhuaHNlWUtON09ramdPUjNIanhnMEtoUUxEMUdnMHFGYXJXR2VFQ0FOempJbmlEVUkvdUkxSUlJN2lzRXFsRWpkdjNtU1ltczBtZi96akgybTMyMWhuaFRBd3k1Z29YaVAwQXcrNG96SU9SM0h6NWsyR3FkMXVzN1MwUkx2ZHhqbzdSQWtEYzR5SjR2VnVpeElQRVE2clZDcFJMcGNacG1xMVNxUFJ3RHFUUE1aRThSTkNQL0NBMzRuamNCUTNiOTVrbUZaWFYxbGZYOGM2ZzBRWW1HTk1GRC90dGlqeEVPR3dTcVVTNVhLWllWbGZYMmQxZFJYTEdnWEZLNFIrNEFHL0U4ZmhLRzdldk1td05KdE5xdFVxMWhrblF1Z0hjNHlCNHRYbVJZbUhDSWRWS3BVb2w4c015OUxTRXUxMkcrdHNFK0U1anpGUXZOb2RsT0lveXVVeXc3SzZ1a3FqMGNDeVJrbnhBNkVmVkJBSlJDbU9vbHd1TXd5TlJvUFYxVlVzYTlRVVAvWWJVWXFqdUg3OU9xVlNpV0g0MDUvK2hIV2VDQU56aklIaUphRWZlTUM4S09Fb1B2amdBNFpoZFhXVlJxT0JkWTZJTU9BeEJvcnZtMGZFUTRUREtoUUtsTXRsanF2WmJMSzZ1b3BsblJURjkvMVNsT0lvd2pCa0dGWldWckNzazZUNHZubFJ3bEY4OE1FSEhGY1VSYXl2cjJOWkowbnhqZEFQNWhFQkVZN2krdlhySE5mcTZpcVdkZElVMy9sUWxPSW9ybDI3UnFGUTREaWlLT0xCZ3dkWTFrbFRmS2NpU2ppS3ExZXZjbHhmZlBFRjFqbG1EQU14WTZBWUNQM0FBK1lRNFNpdVhidkdjVFNiVGRiWDE3SE9NOE5BekJnb1hxaUlFbzdxMnJWckhNZVhYMzZKWlkyTDRvVTVSSEZVVjY5ZTVUalcxOWV4ckhGUnZQQWh3cEVWQ2dXT3F0Rm8wR3cyc2M0M293MERNV09nZUNFUUVjWmhiVzBOeTNvdVN1S1lNVkM4RUNEQ09FUlJoSFhPR2NOQXlwaW8wQS9tRUdGY0dvMEdsalZRWjB3VTRJbHdMS3VycTBSUlJMdmQ1akNpS01LeWpEWU1wSXhKQnBnRDRUaFdWMWRaWFYzbHVXdlhybEV1bDdsKy9UcWxVb25YYVRhYldOWTMvc3FZWkFBUEVZYWwwV2pRYURSWVdWbWhYQzV6NDhZTnJsMjd4cXMwbTAwc0M2TVpxRE1tR1Vab2JXMk50YlUxM24vL2ZXN2V2RWtZaHJ5czJXeGlXVVliQm1MR0pNTUplUERnQVE4ZVBLQlVLbkhqeGczSzVUS0ZRb0d0clMyc2M4NFlub3VTdU02WVpBQ2ZFOUpzTmxsWldXRmxaWVhyMTYvVGJEYXh6amRqREFNMXhpZ0RCS0tFazdhK3ZvNWxZUXdEWHpCR0Nzc2FJNk1OQTNYR1NBR3gwUWJMR2d0akdLZ3hSZ3BJc0t3eE1Gb3pVSStTT0dXTUZKWTFMdG93Y0o4eFUxaldtQmhqR0ZoaHpCUVFZd3lXZGFLTUFXUGlLSW5yakprQ1lqQlkxa2t5V2pPd3dnUlFRR29NbG5XaVRGOHpjSThKb0tJa3JtTU1sblZTak5ZTXhGRVMxNWtBaWhkaWpNR3lUb1EyREh6S2hGQzhVRGZHWUZralp3eEdhd2FXbVJDS0YvNktNVmpXcUJsdEdGaU9ramhsUWloZXFHRU1salZxcHQ5bjRGTW1pT0tGdXRFR3l4b2wwOWNNMUtJa3JqTkJGQU5SRXFkQTNXaU5aWTJLMFpxQnUwd1l4WGRxR0lObGpZTHBhekNtRmlWeGpRbWorTTU5b3cyV05RcW0zMmZnTGhOSThZMG9pV3NZazJJTWxqVk1wcThacUVWSlhHTUNLYjV2eFdpRFpRMkQxcHFuVDUvUzczWVorSWdKcGZpKyswWnJMT3U0T3AwT0R4OCtKT2RrVUVwOUVpVnhuUW1sZUVtVXhDc1lrMklNbG5WVXpXYVRodzhma3N0bW1Tb1dVK0F1RTB6eFl5dEdheXpyc0xUV2JHeHM4UFRwVTVSU1hIeW54TUJpbE1RcEUwenhZNSthdnNheURtTm5aNGUvLy8zdnROdHRuaXZOZW1ReW1WcVV4Q3RNT01VUFJFbGNCMnBHYXl6clRiVFdQSDc4bU0zTlRiVFdQRGRWTERKNzRVSUtMSElLS0Y3dG51bHJMT3QxT3AwT0d4c2JwR25LdDVSU1hIcjNJZ09MVVJMSG5BS0tWNGlTZUJsallxTTFsdlVxYVpxeXNiRkJwOVBoWlZmZXU0UlNhamxLNGhWT0NjVlB1NHZXV05iTHROWnNibTd5K1BGanROYTg3T0k3SlFyNWZCMzRpRk5FOFJPaUpGNDIyc1JHYXl6cnVYYTd6Y09IRDluWjJlR0hacWFubWIxd0lRVVdveVJPT1VVVXIzZlg5RFdXMVd3MjJkallvTnZ0OGtOdUxzZkZkMG9NL0NwSzRqcW5qTU5yYkxYU2Vtbldtd2U1SWtxd3pwOXV0MHVqMGVEWnMyZThTaWFUNFQ5ZCtSbEtxY1VvaVZjNGhSUnY5cEhwOThFWXJQTmxaMmVIaHc4ZjB1bDBlQldsRkZmZXU0UlNhamxLNG1WT0tZYzMyR3FsY2NuelBERC9Ka3BoblgxYWF4NDllc1RUcDA4eHh2QXFTaW11WHI2Q204c3RSMG04eUNtbWVEdDNqVGF4Nld1c3M2M1Q2YkN4c2NIMjlqWS9SU25GMWN0WGNITzU1U2lKRnpubEhON0NWaXZkTDNuZVh6Rm1RWlFDRWF5ekowMVROamMzNmZmNy9CU2xGRmN2WDhITjVXcFJFditLTThEaExXMjEwcmprZVdLTXFZaWpzTTRPclRXTlJvTldxOFhyS0tXNGV2a0tiaTYzREN4dXRkSjl6Z0NIUTlocXBiWFNyRmZCRUloU1dLZmZ6czRPR3hzYmRMdGRYa2NweGRYTFYzQnp1ZVVvaVJlM1d1aytaNFRESVpVODd6N0cvQUxraWlqQk9yMGVQMzdNa3lkUE1NYndPbTR1eDdYTFY4aGxzOHRSRWk5eXhqZ2MwbFlyM1M5NTNsOHc1dGVJNUVVRTYzVHBkRHI4NHgvL1lIZDNsemVaS2hhNTh0NGxITWU1R3lYeFI1eEJEa2V3MVVxL0tubmVLdHI4R3BHOGlHQ2REbW1hc3JtNVNiL2Y1MDB1bHQ3bDRqdWxWRVQrZTVURW4zQkdPUnpSVml2OXF1UjUvdzl0Zm8wSUlvSTF1YnJkTHB1Ym03UmFMZDRrbThud3MwdVhtUzRXWStDL1JVbjh2empESEk1aHE1WCszNUxuSldnemp3Z2lRclBacE52dDRyb3UxdmgxdTExYXJSWmZmLzAxM1c2WE41a3FUdkd6eTFmSVpqSTE0T2RSRXNlY2NjSVFoSDVRQVQ2VGpPTWRkTHRzYkd6dzNQVDBORk5UVTB4UFQyT2RySGE3emZiMk50dmIyN3dOcFJTWDMzdVBZcjdBd04wb2lUL21uQkNHSlBTRE9lQnpjWlIzME91eHNiR0IxcHB2VFU5UFV5Z1VtSnFhSXB2TllnMWZ0OXRsZDNlWE5FM3BkcnU4cmFtcEtTNWR2SWhDWW1BeFN1SWE1NGd3UktFZnpBRkxvdFRjUWIvSDV1WW0zVzZYSDhwbXN4UUtCVnpYcFZBbzRMb3UxdEYwT2gxMmQzZloyZG1oMCtsd0dFb3BMbCs2Uk5ITk03QU1mQlFsY2NvNUl3eFo2QWNlc0lUSXZGRkNvOUdnMCtud09rb3BYTmVsV0N5U3krVndYWmRzTm92MVk5MXVsM2E3VGJ2ZFptZG5CNjAxUitITmVyd3pPNHNTaVlIRktJbHJuRlBDaUlSKzhERndSeHlIUjA4ZXM3Mjl6V0VvcFhCZEY5ZDF5V2F6dUs2TDY3b29wVGd2dE5aME9oM2E3VGFkVG9lOXZUMjAxaHhIb1ZEZ1l1bGRjcGtNQTU4QWQ2TWtUam5IaEJFSy9hQUNMSW1TWUhkL242Ky8vaHF0TmNkVktCUndIQWZYZFZGSzRib3VTaWxjMStVMDZuUTZhSzFwdDl2MCszMDZuUTZkVGdldE5jT1N6V2E1OU41NzVITXVHRk1EUG9xU3VJNkZNR0toSDNqQUhlQjIzMmllTkp2czdPd3dTcTdyb3BUQ2NSeGMxK1U1cFJTdTYvS3RUQ1pETnB0bGxOcnROdC9xZERwb3JYbHViMitQNXpxZERscHJSaW1ielZKNjV4MW1wcVl3MnNUQTNTaUpsN0grUlRnaG9SOVVnQ1ZSRXV5Mjkzbnk5QW5kYnBkSm9wVENkVjJPb3QxdU0wbXkyU3lsZDk1aFptb0tvMDBLM0kyUytCT3NIeEZPV09nSEh3Ty8wK0Mxbm0yVHBpbGFhNnpoY0YwWGIzYVdtYWtwakRZcDhDbndTWlRFS2RZckNXTVEra0VBM0FFV2pFQzZ2VTJhcG1pdHNZNW1lbnFhMlFzWHlPZGNNQ1lHN2dHZlJFbWNZcjJXTUVhaEh3VEFIV0RCQU9temJkSTBSV3VOOVdiWmJKYVptUmxtcHFiSk9BNFlVd2MralpKNEdldXRDUk1nOUlNQXVBTXNpRkk4MjkwaGJiWG9kRHBZUDNiaHdnV21pa1dtQ2tXTTFnd3NBL2VpSks1aEhab3dRVUkvQ0lBRjRIZUllQWU5THM5MmR0amQzYVhiN1hLZVRVOVBNMVVzVWl3VVVmeFRESHdLTEVkSm5HSWRtVENoUWo5WUFINERWRVFwZHR0NzdPN3QwVzYzNlhhN25IVktLYWFucHluazgwd1Zpb2dJR0JNREs4QzlLSW5yV0VNaFRMalFEd0pnSHZnTk1DZEswZWtlc0x1M1I3dmRwdDF1YzFZVUNnVUtoUUpUeFNKdU5vZlJtb0VZV0FIdVJVbGN4eG82NFJRSi9TQUE1b0ZmQWhWRUVLVm83Kyt6MzlsbmIyK1BUcWVEMXBwSmw4MW1jVjJYUWo1UExwZWo0T1l4eG9BeERLd0FYd0FyVVJMSFdDTWxuRktoSDNoQUJmZ1FxQUJ6b2dSRTZQWDZkQTRPT09nZTBPbDA2SGE3ZERvZHhrRXBoZXU2WkxOWk1wa01oWHdCTjVkRmljSm96VUFLMUlFdmdGcVV4RFdzRXlXY0VhRWZlTUFjVUFFK0JBSWdFQ1dBZ0FpOVhvOXVyMGV2MTZQWDcvRmNwOU9oMysvem5OYWFUcWZEMjhobXMyUXlHYjdsdWk2TzQ2QkV5T1Zjd0ZESUY4QVl3R0MwWVNBRjZrQWQrQ3RRajVLNGpqVld3aGtXK29FSHpBRnpnQWQ4eUFzVnZpRksrQmNSUUhncnhnQ0dieGx0K0VZSzFIbmhDeUFGNmtBOVN1SVVhK0lJNTFqb0J3RVE4SjBLYnk4RjZueW5IaVZ4aW5YcS9IOGdrWG13aUhhSXFBQUFBQUJKUlU1RXJrSmdnZz09XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwid2lkdGhcIjogOTcsXHJcbiAgICBcImhlaWdodFwiOiA2OCxcclxuICAgIFwidXJsXCI6IFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFHRUFBQUJFQ0FZQUFBQ1JaMXNtQUFBQUFrbEVRVlI0QWV3YWZ0SUFBQXJ5U1VSQlZPM0JmWXdjOVgzQTRjLzNOeSs3ZTd1M0wrZXpjYkF6Y3gyRERRUkNFRlNpcFcxb2paeEdFS1ZxVTZpUUNKYVFLaEdSOUwrcW9tbWlVTFZCU3FLbVNub0lLVzB0MVVDcm1rZ2dEQ1pCTFJFRXBWQW5PTGl1UXZEQ2pBOGI5Zlk4Ty9idTdkN3N6UHg2Ymt6clduZjIybnRuN3UxNWhDVm1pK042d0ZVYXRnS2JSTGhhYTJ6a0ZBeE8wV1JhNjR4VFJBNmo5UVR3aHNEQnc0RmZaNWtSUGtDZTQzNGMrRDBSdVFhUlVWR3lHVmlIQ0NBZzlFOXIwQnF0bVFMcU9rc24wVHdyOE4zRGdYK01KVXk0aER6SHpRT2ZFNUZQb2RSVklySVJKU3dhclVIclJHZjZkYkxzZFExL1ZRLzhReXd4d2lYZ3VlNm5RQjRRUS8yeWlOUVE0UU9SWllsT3MxZTExdCt1Qi80VExCSENJdktjc1MrSmt0OFZwYTVIQ1V0R3B0Rlpka0JuMlNQMXdIK1VSYlRGY1Q4RS9JWVdEdFY5L3czbUlDd0N6M0VmRktWMmlxR3VSSVFsSzlQb05IMVphLzJWZXVDL3dBTHlIRGVmWmRram5XNzNENmE3blh3aGw4ZTI3UU8yWlgyakh2ai93Qm1FQmVRNTdoMmkxSitMb1Q2R0NNdEdsblYxa2o2bDRmNTY0SWNzQU9meVRTOGZqNXEzdE5wdDNpY2lyQjlaMXkyVmlsK3IrLzZYT00xZ0FYaU9XeHVwMW5ZcDAvaUtHTWJsaUxDc2lKaGlHTmNDZDlmS0ZSMUcwWThZd0M5OTJOa2Rub2h1UDlscWNiWjJaOW8wRE9Qakd6ZHMyQkJHMGJQTU1oaVE1N2ozaUZML0tKYjVhNGdvbGpGUnFpS2lmcnRXcnR3MFVxbThHRVpSaXd1MHhYRWZPdEZxUFJCR0VmT1o3blF3bEhIRHhnMGJlbUVVdld3d0FNOXh2NjFNNDh0aUdLT3NGQ0tJb2JZQ242bVZLKzB3aW41TW56ekh2YVhUNlh6enY2WWFCYzVqdXR0UmhYemhZK3ZYcmZ1T3dVWHdITGMyVXEzdFZaWjVGMHFackVDaVZGVkVQbGtkTGw4ZVJ0RmV6c056M0ZvdlNaNTlyekY1dWRhYWZvaklVTEZRK0luQkJmSWM5MFpSNm50aW1UY2l3b29tb2tTcG0ycmx5dTBqbGNvellSUzFtSVBudVBra1RmY2RiNGJYejhReC9Tb09EVkhJNWYvZTRBSjRqbnVMS0xWSFRHT00xVUlFTWRRbU5IZlZ5cFVqWVJRZDRneWU0OWFTTk4zWFBCSGQwbXEzNlZkbHVNeHdzZmo4Tys5T2ZObWdUNTdqZmthVTJpMm1zWkY1dUs3THpUZmZUSzFXUTJ0TnA5TkJhODFLSUVxVlFUNHhVaTVQaDFIMGI4enlIUGYrbVRqZWRid1pYdDlxdHprZkVhRmFybENyVkk1VWhvZi85cDEzSno3TExLRVBudVBlS0VvOUk2YXhrVGtNRHc5enp6MzNjT1dWVjNLMm1aa1pUcHc0d2RUVUZMN3Y4K3FycjNMOCtIR1dyVFJMc2pUOVlic3pQUmJIUFRlTW1weUxaVm1VaXlVczJ3cnpkdTROWmFqdm9ubTBIdmhkVGhQT1k0dmplaWoxQXpHTnpjemhpaXV1NE82Nzc2WldxOUdQTUF4NStPR0hpZU9ZWlV0cmtsNUN1OTFpY21xS3MrVnpPU3JEWlVUa1VDR2YvN21JN0FIMjFBTy95eHhNenNGejNEeEs3UkhUMk13Y05tN2N5TDMzM2t1cFZLSWZZUmd5UGo1T0hNY3NheUtZdGtYRnFuSEs1TlFVSXNKSXRZcHQyUWNMK2Z4KzRGdjF3TjlQSDB6T1JlUUpNWTBibUVPaFVPQysrKzZqVkNyUmp6QU1HUjhmcDlGb3NHSUlGQW9GS3NObGhrdWwxM09XOVplSEEvK2Z1VUFtODlqaXVBK0pZZndPODlpNWN5ZWpvNlAwSXd4RHhzZkhhVFFhckRTV2FURlNyWDdyN1NQQkY3aElpamw0am5zTmh2RUFTcGpMYmJmZHh0YXRXK2xIczlsa2ZIeWNScVBCaXFRMWJ4OEp2c0FBRkhNUWtlK0lvV3JNb1ZxdHNuMzdkdnJSYXJWNDdMSEhhRFFhckZSaUdHeHgzSTh5QU1WWlBNZDlVQXpqVjVqSG5YZmVTVDZmNTN4bVptWjQ0b2tuZU91dHQxalJCRFNNTVFERkdUekh6WXVoL2hBbHpHWGJ0bTFjZmZYVm5FK2Fwano5OU5NY09uU0lGVStFV2RjeEFNWC85eGVpbE1zOGR1ellRVDllZXVrbFhubmxGVmFSanpJQXhXbWU0K2JGVUwrUENIUFp0bTBibnVkeFBtKysrU1pQUGZVVXE0bUlqREFBeGYrU1B4YWxQc3c4dG0vZnp2bEVVY1N1WGJ0WWRRU0RBU2hPRXlWM0lNSmNxdFVxWTJOam5NL2V2WHZwZERxc1BtSXlBTVVzejNGdkZDVTNNSTliYjcwVnk3STRsNE1IRC9MYWE2K3hLb2tVR0lEaUZ6NlBVaWJ6R0JzYjQxeTYzUzVQUHZra2F5Nk9ZcFlvZFJYektCUUtiTjY4bVhNNWNPQUF6V2FUTlJkSGVZNmJGeVhYTWcvUDh6QU1nL24wZWozMjdkdkhxcVoxbXdFb1lBY2lSZWF4ZGV0V3pxVmVyOU5zTmxuZGRNWUFGQ0tmUklUNVZDb1Z6dVhnd1lPc2RqclRDUU5Rd0JVTVlQLysvYXhoZ2dHWUlwTGpIRjU0NFFXaUtHTFRwazA0am9ObFdieHZjbktTVHFmRHFxWTU1YWNNd0VTa3dEbE1URXd3TVRIQkthT2pvK3pZc1lQcnJydU9mRDdQeVpNbldmVjB4cXdYR1lBSldQU3AwV2p3K09PUFk5czIyN2R2UjBSWTdiUW1xZ2YrNnd6QUZLSEdCWXJqbU9lZWU0NDFzN1EreElDVTFvU3N1V2c2eTQ0d0lBWDBXSE54TXMyc3YyTkFDcTNickxrNFd2djF3SCtlQVNtdGRZODFGeVhMc3RkWkFBcXQvNU0xRnk3TEVLMi96Z0pRQXZ2UW1qVVhSbWY2MWNPQi96SUxRR240RjUzcE5tdjZwelU2eTNheFFGUTk4THRvL1FacitxYlQ3RUE5OEI5aGdTaG02U3piejVxK0pIRVBuV1dQc0lBVXZ6Qk9saVdzbVZlYXBqUWFEYklrK1VFOThCOWxBU2xtMVFQL2tNNnlIN05tVHQxdWx5TkhqcEMzN01nMHpjK3h3QlNuYWEwZlIydlcvQit0TmMxbWs0bUpDY3FsRXNWQzRXL3FnWCtJQmFZNHJlNzdmNjJ6N09lcytSOUprdkRlZSsvUmFEUVlLaFFvRlV2Zk94ejRmOG9pVUp4QnAzbzNXclBhdGR0dGdpQ2czVzVqR0FZajFkcGh5ekIyc2tnVVo2Z0g3enlrMCt3L1dLV3lMR05xYW9wang0NlJaUmtpd21XajZ4dTJaZDExT1BDUHNVZ1VaOUZaOWlka1daZFZKbzVqM24zM1hjSXc1QlFSNGJMMUd4cjVYTzcrZXVEdlp4RVpuQ1dNb2plcncrWE5vdFJOaUxBYW5EaHhncU5IajVLbUthZUlDSmV0MzlBWXl1Y2ZyQWYrYmhhWndSekNLTnBiSzFkK1V3dzF4Z3FXcGltVGs1T0VZY2o3RE1QZ3N0SDFqYUY4L3Y1NjRPL21FakNZeDBpbDhqeWEyMFdwVVZhZzZlbHBqaDQ5U3JmYjVYMURoU0UyckJ0OUo1L0wzVnNQL0dlNFJBem1FVVpScTFhdS9DdGFmMXFVS3NkeGpHRVlMSGRKa2hDR0laT1RrMml0ZWQ5SXRVYXRXbjNGTnMxUDFBUC9wMXhDd25sc2NWd1BwZmJPOU9Lckpoc05xdFVxdG0xajJ6WWl3bktndFdabVpvWldxMFd6MmVSTWxtV3hmdDI2YnQ3Tzdhb0gvdjE4QUlRK2JISGNEeUd5TzA2VDN6cDY3QmhwbXFLVW9sZ3NVaXdXTVUwVHk3SXdESU9sSWtrU2VyMGVuVTZIS0lwSTA1U3pyYXVOVUNvV2YyWW85Y1Y2NE8vaEF5SmNBTTl4SDBsMXR2TjRzNWsvZWZJa1p6Tk5rMEtod05EUUVLWnBJaUlZaG9GcG1vZ0lpMEZyVFpJa3BHbEtsbVYwT2gzYTdUWnhIRE9mY3JsTXVWU0tiTlArSjlCL1ZBLzhMaDhnNFFKNWpudUhocTlQZHpyYkpxY2FaRmxHUHd6RHdEUk5iTnZHc2l5VVVsaVdoVktLZmlWSlFwcW14SEZNa2lURWNVeVNKUFNyVkN4U0taZVRmQzczZlozcFA2c0gvbjZXQU9FaWJYSGNiL1RTOUxQVDNjN28xUEhqYUsxWnFpcmxNcVdoWWplZnk3Mml0ZjVxUGZCZllBa1JCdUE1YmczNFdwS21uKzdPZEVlbndwQTBUVmtLY3JrY2xYS1puSjFyV0tiNUlsby9YQS84L1N4QndnTHdITGNtOE1VVXZTT09lOWUycHR1MFdpMnlMT05TeXVWeWxFdkQyTGJWemRuMlQ0RHZvL2xxUGZDN0xHSENBdk1jOTllQnoydjRTQnpIMXlSWnlzbFdpMDZuZzlhYWhXVGJOc1doSVFyNVBJWmhoTFpwdmFHMS9wSEFOdzhIL2pHV0NXRVJlWTc3RVpDN1JQaFZEWnQ2dmQ1WW1tWDVUR3ZpT0thWDlJamptQ3pMNlBWNm5NMnlMRVFFMjdheFRBdmJ0akNVUXBERXNxeTZvZFJScmZYYkFuc09CLzZ6TEZQQ0plUTVibDdnRmcwM2dWd0hlb01vTVJISmdkaWNUZXNPNkVSckVyU2VBSDRtOE84YWZsZ1AvQzRyeEg4RDlkZDBrcXFkTCtRQUFBQUFTVVZPUks1Q1lJST1cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJ3aWR0aFwiOiA0OSxcclxuICAgIFwiaGVpZ2h0XCI6IDM0LFxyXG4gICAgXCJ1cmxcIjogXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURFQUFBQWlDQVlBQUFEMjNqRXBBQUFBQWtsRVFWUjRBZXdhZnRJQUFBVTRTVVJCVk0zQlc0aGM5UjBIOE8vdjl6OXpPWHZta2pFYXpHN083SG9RUkRGUGk3aVY0Qlo4S0UwaFJHSVJDa0lmQ3FMU0NncXRlRU9FK0ZCczJsSkRJYUdoUGhRcHlTS1ZVc1VYSlhadGhCaEppTmN1eCs2WnhOM1pYV2QyenN6Wm1UUG44dXNFUnhoQzRremMzY3grUG9SMXNNemlMU0Q2R1NtK0RVUmpBT1VBMlE2QThRMEJxQXBJVldJcFNSeDlTSUsvMmlXbmpnMUV1RVpXc1hnN1dEMUJUUGNBZENzeEpURW9FWWhJSGNESEVrWi90NTM1UDJBREVBWmttY1Vma3FaK0RlSjdpY25BZW9sQVJENlRNRHBzTy9PdllBQVR1OHdINnA3M2NFTFRWa2ZTNlpmc2t2TVJPZ2g5V0daUkowMzlHY3dQRUpHQmpTWVNTeXovbGpCODJpNDVzN2lLVzNhWkQxYmMycEdhNitiUXNiMVErQ3FmelQ1cU84NC9GTDZEWlJiM1VVS2JJYVh1STZJa05nTjFNSTJEK2Y1Q1BxOVhWMWZmeFdVc3N6aGU5N3pYcXJYVkhlaHF0bHBaeFdycTVwdHVPcUp3RmRiNHhHOG9vUjBpNWpGY0IwU2tFOUYwWWR1MnV3dlozQnRWdDlaR2gyVVdOYS9WL09kS3BYSW5Ma05NMnpJakkvOGlYSUUxUG5HUU5QVWtFYVhRTVRJeUF0TTBNVDgvajFhcmhjMG1VZnlwaE9FdkFFU041dHJ2YTY3N0E3L2RScTljSnV2cjZmU2I1WlhsK3dtWHNjWW5uaUZOUFU5RVNYVHMyYk1IZS9mdWhhN3J1TVQzZlZRcUZadzhlUktuVHAzQ1pwRTRybm1OUm1weGFTbU5EazBwWkF4alRWUGFGNmxVOHFOVU12a1gyM0ZtMGFHaGgxVWNmNGcwOVJRUkpkRXhOVFdGL2Z2M1F5bUZiNlZTS1FSQmdETm56bUF6RVhNK2s4M2h4akNFaUh5cXAvVTNrcHIySjd2a1hNUmxOSFJaWm5FSGFlb2dFV1hRTVRvNmluMzc5a0VwaFY2TzQrRHc0Y05vdDl2WWRBVGtzcm4vMlBQL3V3ZW80bW9ZWGFUVUVXSTIwWFhnd0FIb3VvNWVpNHVMT0hyMEtOcnROcTRYVXR4Q0g0d095eXorQklwL2hLN0p5VWxZbG9WZXRWb054NDRkUTZQUndIVzJIWDB3T2toVHZ5S2lOTHFtcDZmUkt3eERuRGh4QXN2THl4aUNQUHBneXl5T2dXZ0tYWlpsWVd4c0RMMU9uejZOOCtmUFl6aElReDhNNWtlSU9ZZXV5Y2xKTURPKzVib3VabVptTUVTTVBwZ1UzNFVlTzNmdVJLK3paODhpREVNTWp3VG9nd0ZNb0lkaEdPZzFPenVMSWZQUkJ3TmtvTWZ4NDhjeE96c0wxM1ZScjlkUkxwY3haQXZvUXdNaGpSNXpjM09ZbTV2RHpNd01kdS9laldHVFdMNUVId3hCZ0NzUUVadzdkdzVESlFKRThUdm9nd0ZwWTRzU3dZSmRtbjhWZlRDQUJXeFZFcitIQWJERThnVzJJQkh4Skl3T1lRQ01LSG9kSW9JdEpBZ0NoSDc3VGJ2a2ZJQUJzRjF5WGhlUno3RUZpQWc4ejBQRGRTOG9vc2N3SUVhSHhQRnhpR0NZb2loQ3BWS0JWMjgwalJIakJidmtMR0ZBQ2gzVjFkVjNDb1hDVDRsb0I0YkE5MzBzTFMxQjRqaklaVEl2WDFqNDZuZTRCb3d1Q2NKblJjVEZkU1FpY0YwWHBWSUppam5JWmJKL3ZGaGVmQmJYU0tHcjZ0WStLK1R5SVppbVJVUWpJbXltSUFpd3NyS0NhcldLUW41YlBaZkpIcnk0dVBBY3ZnZUZIdFhhNnZzMzVQTE5acXQ1dCtkNWFSSEJKY3dNSXNKNmhXRUkzL2RScTlWUUxwZWhLWVViQ29WUGNrYm1sL01YTHh6RjkwUzRBc3NzN204RndVRzM3dDdSOER3d013ekRRQ3FWZ3FacFlHWXdNNWdaUklRcmlhSUljUndqam1NRVFZQzF0VFUwbTAxY2trd2trTS9scXVsMCtyVUVxOGZ0a2hOaUhRamZZWHhzMTZHbTd6L29yWG1qM3RvYTFpdGpHTkRUZWxsUHBkN1dsSHJSTGpsejJBQ0VQaXl6cU1lRXAxdXQxby9ETUxyZGIvc2o5VVlEZzFCS0lXc1lTQ1FTWDJ1YTlvbWVUcitGV0g1cmw1d1FHNGh3RFN5enVBTkVQNC9pZURJSXc5RW9pbTRXaVZNZzBuQ0pJQVlrSk9hcVlsNU9KWkwvSmVCOXUrVDhEWnZvLzFzR01uaTVleTRaQUFBQUFFbEZUa1N1UW1DQ1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcIndpZHRoXCI6IDI1LFxyXG4gICAgXCJoZWlnaHRcIjogMTcsXHJcbiAgICBcInVybFwiOiBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQmtBQUFBUkNBWUFBQUFvdWdjT0FBQUFBa2xFUVZSNEFld2FmdElBQUFKalNVUkJWSzNCTzJnVEFSZ0g4UC8zM1NXNXRrbWJFRW90TkRTOXBWQndjTk5GYUNHQjRxWjJyZzRPZ3FLRGRDd0ZjVkp4YmtBcTZPcmFUcElzV1FSQmFLY01hZE9FMUVldTVoTHp1TnpqTTJLRUV2b3k5ZmNqbkVDZmp0OEc4eEl4elFLSUFnamlqd1pFdm9uSU5odzNsUy91WjNFR1FoODlIbDhpNWhVUVhTRWlCYWNRa1NZODJSVGJmcEl2RlF2b2lVWWl6NjFPNSthUXByMzliaGhyQ283UWRmMFZNVDhsNW1raVlweUJpSHpFTkFkV2JrWEd4cW8vcXRYUEUrUGo5MzgyR3F2TlZtdWNnS3V4UzVQdkNEMzZqUDZhbU80a0VnbU94K013VFJQcGRCcVZTZ1huSVNKTjI3TFNGY080N25uZXNFLzFGWDJxbWprMHEzZFZkT2t6TTJ2RXRKeE1Kbmx4Y1JGRWhGd3VCOE13Y0Y1RU5Pd1BhRGRHZzZHc3FxclBTZ2ZsTGZTd1BoV2JKZVlIMFdoVVdWaFlBQkdoVUNnZ2xVcEJSUEJQQ0JnT0JUK1ZEc3BiT0lMaFUxZUlLSnBNSnFGcEd1cjFPalkyTnVDNkxnWkJRQlI5bUppdm9VdlhkZnlXeldaaG1pWUdKUUpHSHdZd2lTN0RNR0JaRmpLWkRDNkVVRVVmRllBUFhldnI2d2lIdzdBc0N3TVRBVnp2SS9vd2dCWjZxdFVxTGtLQWczeGg3dzM2TUVUMjhCOTRuZ2ZQOVRaeERCYVJMWWpnSW16YlJzMDBjK1E0ajNBTXp1L3Vyb3BnR3dNUUVUU2JUUndhUnRtdnFnL3pwV0lEeDFEUUZRbU43cmllTisrNGJwaUlRRVE0allqQXRtM1VhalYwMnRaT2FDUjRyL3oxeXdlY2dOQ2pUOFhtNnEzbXkxYXJQUSttZ04vdmg2SW9JQ0w4NWJvdUhNZEJ1OTJHNWcrVU5TM3dmaVF3OURoZjJ2ZHdDa0tmZUN5V2FEUmJ5NDdyWFBZOG1RQmtDQUNKU0llSkRVWGh2S1pwNllEaWU1RXY3WHM0aDErNjl3bmRVeUxSbWdBQUFBQkpSVTVFcmtKZ2dnPT1cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJ3aWR0aFwiOiAxMyxcclxuICAgIFwiaGVpZ2h0XCI6IDksXHJcbiAgICBcInVybFwiOiBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQTBBQUFBSkNBWUFBQURwZXFacUFBQUFBa2xFUVZSNEFld2FmdElBQUFFWFNVUkJWSFhCdlU3Q1VCZ0c0UGM3aDNDVXhBajRPOHE1QWhlR01qdDE2a0JNVFBRTzNGeTlCQlkxM2dFbUpnN2NBR0YwY2Uwa1NURUJoaTRvRUtDRm52UHAwS0VoOW5rSUtWMnIzUkdKS3hCcUFFb0FsZ0ErMmRqbjRHdlFycGJMYm1KTVl6YWYzeFArYUsxZkhjZHBUaVlUMmUvM2tjWE1zVFhtTFF6REJnSHlwSHB3THJUV0xkZDFMejNQazBvcGJDTWlKV1hodWxLcHZDeFdxN05nUFBvUlJOU3MxK3ZVNi9YZyt6NytSWUJTTzB1a0JJQlQzL2ZSN1hhUml4a0FqNUFTQUphZFRnZk1qRHlXZVJ3TUJtMmtCSmpma1lPWkVVVlJQSnRPbjVCUjRFMXl1MlpiTnRZNlVrcUJsREVHU1pJTU4xSDgrRDJidHBCQlNCMGZIdDNFNi9VRnM5MEhzRkRGNHNmZWJ1a2hHQTBaVzM0QnVPcDhhQTBSaGVnQUFBQUFTVVZPUks1Q1lJST1cIlxyXG4gIH1cclxuXTtcclxubWlwbWFwcy5mb3JFYWNoKCBtaXBtYXAgPT4ge1xyXG4gIG1pcG1hcC5pbWcgPSBuZXcgSW1hZ2UoKTtcclxuICBjb25zdCB1bmxvY2sgPSBhc3luY0xvYWRlci5jcmVhdGVMb2NrKCBtaXBtYXAuaW1nICk7XHJcbiAgbWlwbWFwLmltZy5vbmxvYWQgPSB1bmxvY2s7XHJcbiAgbWlwbWFwLmltZy5zcmMgPSBtaXBtYXAudXJsOyAvLyB0cmlnZ2VyIHRoZSBsb2FkaW5nIG9mIHRoZSBpbWFnZSBmb3IgaXRzIGxldmVsXHJcbiAgbWlwbWFwLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XHJcbiAgbWlwbWFwLmNhbnZhcy53aWR0aCA9IG1pcG1hcC53aWR0aDtcclxuICBtaXBtYXAuY2FudmFzLmhlaWdodCA9IG1pcG1hcC5oZWlnaHQ7XHJcbiAgY29uc3QgY29udGV4dCA9IG1pcG1hcC5jYW52YXMuZ2V0Q29udGV4dCggJzJkJyApO1xyXG4gIG1pcG1hcC51cGRhdGVDYW52YXMgPSAoKSA9PiB7XHJcbiAgICBpZiAoIG1pcG1hcC5pbWcuY29tcGxldGUgJiYgKCB0eXBlb2YgbWlwbWFwLmltZy5uYXR1cmFsV2lkdGggPT09ICd1bmRlZmluZWQnIHx8IG1pcG1hcC5pbWcubmF0dXJhbFdpZHRoID4gMCApICkge1xyXG4gICAgICBjb250ZXh0LmRyYXdJbWFnZSggbWlwbWFwLmltZywgMCwgMCApO1xyXG4gICAgICBkZWxldGUgbWlwbWFwLnVwZGF0ZUNhbnZhcztcclxuICAgIH1cclxuICB9O1xyXG59ICk7XHJcbmV4cG9ydCBkZWZhdWx0IG1pcG1hcHM7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLE9BQU9BLFdBQVcsTUFBTSxtQ0FBbUM7QUFFM0QsTUFBTUMsT0FBTyxHQUFHLENBQ2Q7RUFDRSxPQUFPLEVBQUUsR0FBRztFQUNaLFFBQVEsRUFBRSxHQUFHO0VBQ2IsS0FBSyxFQUFFO0FBQ1QsQ0FBQyxFQUNEO0VBQ0UsT0FBTyxFQUFFLEVBQUU7RUFDWCxRQUFRLEVBQUUsRUFBRTtFQUNaLEtBQUssRUFBRTtBQUNULENBQUMsRUFDRDtFQUNFLE9BQU8sRUFBRSxFQUFFO0VBQ1gsUUFBUSxFQUFFLEVBQUU7RUFDWixLQUFLLEVBQUU7QUFDVCxDQUFDLEVBQ0Q7RUFDRSxPQUFPLEVBQUUsRUFBRTtFQUNYLFFBQVEsRUFBRSxFQUFFO0VBQ1osS0FBSyxFQUFFO0FBQ1QsQ0FBQyxFQUNEO0VBQ0UsT0FBTyxFQUFFLEVBQUU7RUFDWCxRQUFRLEVBQUUsQ0FBQztFQUNYLEtBQUssRUFBRTtBQUNULENBQUMsQ0FDRjtBQUNEQSxPQUFPLENBQUNDLE9BQU8sQ0FBRUMsTUFBTSxJQUFJO0VBQ3pCQSxNQUFNLENBQUNDLEdBQUcsR0FBRyxJQUFJQyxLQUFLLENBQUMsQ0FBQztFQUN4QixNQUFNQyxNQUFNLEdBQUdOLFdBQVcsQ0FBQ08sVUFBVSxDQUFFSixNQUFNLENBQUNDLEdBQUksQ0FBQztFQUNuREQsTUFBTSxDQUFDQyxHQUFHLENBQUNJLE1BQU0sR0FBR0YsTUFBTTtFQUMxQkgsTUFBTSxDQUFDQyxHQUFHLENBQUNLLEdBQUcsR0FBR04sTUFBTSxDQUFDTyxHQUFHLENBQUMsQ0FBQztFQUM3QlAsTUFBTSxDQUFDUSxNQUFNLEdBQUdDLFFBQVEsQ0FBQ0MsYUFBYSxDQUFFLFFBQVMsQ0FBQztFQUNsRFYsTUFBTSxDQUFDUSxNQUFNLENBQUNHLEtBQUssR0FBR1gsTUFBTSxDQUFDVyxLQUFLO0VBQ2xDWCxNQUFNLENBQUNRLE1BQU0sQ0FBQ0ksTUFBTSxHQUFHWixNQUFNLENBQUNZLE1BQU07RUFDcEMsTUFBTUMsT0FBTyxHQUFHYixNQUFNLENBQUNRLE1BQU0sQ0FBQ00sVUFBVSxDQUFFLElBQUssQ0FBQztFQUNoRGQsTUFBTSxDQUFDZSxZQUFZLEdBQUcsTUFBTTtJQUMxQixJQUFLZixNQUFNLENBQUNDLEdBQUcsQ0FBQ2UsUUFBUSxLQUFNLE9BQU9oQixNQUFNLENBQUNDLEdBQUcsQ0FBQ2dCLFlBQVksS0FBSyxXQUFXLElBQUlqQixNQUFNLENBQUNDLEdBQUcsQ0FBQ2dCLFlBQVksR0FBRyxDQUFDLENBQUUsRUFBRztNQUM5R0osT0FBTyxDQUFDSyxTQUFTLENBQUVsQixNQUFNLENBQUNDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO01BQ3JDLE9BQU9ELE1BQU0sQ0FBQ2UsWUFBWTtJQUM1QjtFQUNGLENBQUM7QUFDSCxDQUFFLENBQUM7QUFDSCxlQUFlakIsT0FBTyJ9