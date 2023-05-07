/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
const mipmaps = [{
  "width": 160,
  "height": 312,
  "url": "data:image/png;base64,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"
}, {
  "width": 80,
  "height": 156,
  "url": "data:image/png;base64,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"
}, {
  "width": 40,
  "height": 78,
  "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAABOCAYAAABSU1QqAAAAAklEQVR4AewaftIAAATtSURBVM3Bf4zWdR0A8NfzeY474ThPIAhC4ExZ/BjchM3Nzg0dw2w2TdfcYtPQYvhH0ZZjy7LpVubyj0q3bItcJaVTZ4htsGTWmFu4KCyKcnGTIT/PHAK35DwZ9mzPbXdf3t/n7rkfz1der5KJsxjrsQLz0I7pKKk6hWN4Ed9Wp5LxW4HvYhVa1ecl3KoOZeNzP55AJ5rV71PoxLNGUDZ2T+LraDM2i9CO3xtG2di8gLUoG7sSOtGN/WpIRm8rbjcxpmCTYZSNzhbcIV8/XsM+lDFdfdrxBxyRo6x+j2IDSqIe3Iev4Rk8jqOYidkoq60ZHdgiR1l91uMhTBIdxN14QdZePIm9mIzJaEVZ1IESdrlA2ciuxs9xmeg4vohdajuAZ/EYTqALk2WVsBRPo9cQZSN7HktEp3AvXla/vejFajTJasV0bDNEMryHcZ3oHB7Fb43eT7FZvs+4QFLbImyQbxseMXYbsUc0B/cZIqntB5ghOoC7jd+DeE/0OUMk+VZjjagf30Ov8duB34k6MdmAJN9GTBa9jKdMnAdwRtY0fNmAJLoKN4jexSYTqxv7RKsNSKL70SbahjdMvD2iJQYk0fWik3hAY2wVLcAsFUnWXfik6BUc1Riv4h1ZLbhLRZJ1i+gDbNZY/xWtVJFkdYr+jZ0a67joChXJoGXoEO3WeIdFc1Ukg9aiSdYH2KzxekSzMSMZdLXoTfxV4/1T1IRbk0ELRfsUY698S5Oqj+Ny0SuKsR/vixYkVXeiWdZpPKU4p0XTk6qVooM4qzh9ohlJ1ULRG4p1XtSeVM0V7VGsM6JJCUswW1Y/fqNYfaLWhJtEx9CjWP2iSxLmid5ycWhJWCA66OLwYcKlom4Xh96EqaKXXBx6E6bJOoV9ijdFdCahRdZpH4120fGEJlk9PhotomMJLbLOKF4TPiY6kdAs65TiXYNLRCcS2mS9rXjXy/fnhJKss4o3U74DSXRe8TpE/TiRRJMU7zJRn4okale8OWpIossVr13UpyKJ2hRrAWaJ+lUknJE1R7FuRxK9pyKhT9YMxVoh3zEVCX2ypuKzirNcvm4VCSdFaxRjDRbJt1NFwkHRIsVYj2bR23hORcJrog6N14RV8v3dgISn0S9rPto01ibMkm+7AQlHcFRWK9ZprNvkO44fG5BUHRJ1aZwuLJfvVUMkVf8SLdM496JF1I8nDJFU7RNdhSUaY5V8e7HLEEnV83hfVjO+YuJtxDz5fu0CSdVJHBKtMvG+IN8B/MQFkkH/EC1Fl4nTiZXyvShHMmibqAXfMHG+iSmiE3hQjmTQFvxHdBPuMH5zcaN8O3BWjiRru2gKfoQu4/MwpotO4TtqSLK+hSOiT2ALuozNCnxevp04qoayrHNoww2iabgZ7+J1o/MrLBH9D+vQo4ayaBfWYL5oKm7EcuxGr5F9H3eiJNqBxwyjLN/ruAVtoiYsxZewHD04LFqMzViHJlEvNuCIYZTUtg6Po83wzuEw3kK/qplYiFa1/QL3GEFZbX9DP67DJLUlTEMHrsSVmI1mtR3EzThnBGXD240+fBotJkYfNuEv6lA2st14E9fiUuPzIX6GR9SprD77sR3L0GHsnsM9RqGsfu/gl2jCYrSq33k8g7VGqWz0/oitmI8FmGR4J/FDfNUYlIzPtdiIazAfTarO4xD+hIfQbYz+D6Tn+WIwld2HAAAAAElFTkSuQmCC"
}, {
  "width": 20,
  "height": 39,
  "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAnCAYAAAAPZ2gOAAAAAklEQVR4AewaftIAAAJlSURBVKXBTWiWBRwA8N/7f1ysj23VErXltj5o4SFiSXXyIlZ0EwYdhplWFB2k8GSHCKpDER6ChIIOIZTE7CDCAiEqoSgpiYg+JO0yRx8oM3T2Nrde+A+ezb1z7/v0+9WsbCcex524ER04hyMYcZmaK9uPR9GhuYMYsUBheYcxgsLyhnAeX5pXaO4Atkp1HMQn6EIvalKgF++YV1jqVTyNGup4Gbswjn2YQA23ocA6XIsjGgqLPYg30Ik5vIUXLHYcH2AAw6hhEHs1hMVeQrf0GZ6zvCfxndSH3RpC6QncJ53Bbit7HTPSQxpCaQcK6QC+tbL3cVLaoCGkYdwr/Y49WndCWodNIW1Dp/Q5zmndKSnwcEgbpVl8qD0/K90V0u3SaYxpz1dKfYFNWCP9qH3HcFG6KfAIQjqumn+knsAGaRaHVTMtXR24WfoLR1UzI3UGbpAm/X+zgeukCdWF9HegUzqtumukM4EOaVI1/eiWzgY6pUnVbEZIU4GadEk1dyhdCKW1qulXqgdmpFtUs17pQmBa6lfNoNKvgbPSgPZtx3qpjo8CJ6U+XKU9owjpF3wf+Enqwg6tG8D9Sp9qCHyhtFnrnke3NIW9GgJjOC8Na90WpaM4pSEwjRPSrdhuZaMYkurYZ15I41JgDwZc2TMopK8xbl5IL+I3aQiHsFFzT+EB6RLetkAhzeJfbEGBNdiKQfyAKekxvIIe6Rh2WaBmsTfxLAqlafyBVViLQrqIbRizQGGxcfTiHqySOnA9uhHSHN7Day5TWOpj/Im70WOpORzCqCYKzX2D/ViN1eiSJvAudlrGf06nfLQZ5A2dAAAAAElFTkSuQmCC"
}, {
  "width": 10,
  "height": 20,
  "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAUCAYAAAC07qxWAAAAAklEQVR4AewaftIAAAEHSURBVHXBOyuFYQAA4Oe8XySXlFyKTHIYhAirwWpyKZlkNSiL5BeYTC6FAVlMlPIDKIPF5L4YnDqREInEqU/p1PmeJyXfKOaRRoRDDMqJ/BvDMsrwiCqk8YmjSKwZ2/jBGKaRRS86sBiJraIbs9gVO0XAEF4C6jGAY6zIt4AM+gMmUYkthWXQFNCDLDYU9oDagCbcSvaKioAa3Ej2ieKAclxJVoS3gGJcS1aN54AI35JV4yPgC62S1eE94AltCptCDS4C7tCqsBF8YyfgCi3okq8T3TjDXsAmUlhCg39zKMW2nJTYOiZwjxOUYACX6JATie2jEX1oRxovmMG5nJR8wxgXW8OBP784yTdXWjIKFgAAAABJRU5ErkJggg=="
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsIm1pcG1hcHMiLCJmb3JFYWNoIiwibWlwbWFwIiwiaW1nIiwiSW1hZ2UiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwib25sb2FkIiwic3JjIiwidXJsIiwiY2FudmFzIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwid2lkdGgiLCJoZWlnaHQiLCJjb250ZXh0IiwiZ2V0Q29udGV4dCIsInVwZGF0ZUNhbnZhcyIsImNvbXBsZXRlIiwibmF0dXJhbFdpZHRoIiwiZHJhd0ltYWdlIl0sInNvdXJjZXMiOlsiZGlnaXQwX3BuZy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSAqL1xyXG5pbXBvcnQgYXN5bmNMb2FkZXIgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FzeW5jTG9hZGVyLmpzJztcclxuXHJcbmNvbnN0IG1pcG1hcHMgPSBbXHJcbiAge1xyXG4gICAgXCJ3aWR0aFwiOiAxNjAsXHJcbiAgICBcImhlaWdodFwiOiAzMTIsXHJcbiAgICBcInVybFwiOiBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBS0FBQUFFNENBWUFBQURjamZpM0FBQUFBa2xFUVZSNEFld2FmdElBQUJNaVNVUkJWTzNCTDJNalcyTG00ZDk3K29KaFZtQ1FOR3laS3l4QnJtRmhyWUdMWEJjdHZKcFBjSTgrd1dqUURyc3lDOVJsWVZ0bXkxTCtCQ3V4d0JLYm9IZDcwNTI5M1c3L2tlMXpTaVg1UEk5c1U2UW5xUVltUUFWTWdJclBLdUNDdysyQUxkQURIZEFCcmUyZU15RGJGRzhqcVFZcW9BWm13Q1g1M1FGcllHMjc1MFRKTnNYTFNLcUFHcGdEVnh6WEhsZ0JLOXM5SjBhMktaNG5hUVlzZ0Rrd1pYeDJ3TngyeHdtUmJZckhTV3FBQnJqaU5QeG9lODJKa0cySzcwbHFnQWhNT1QwM3RodE9nR3hUL0VaU0RheUFTMDdiamUyR2taTnRDcEEwQTFiQVI4N0hqZTJHRVFzVVNGb0FIZkNSODNJdGFjMklmWWd4OGw1Sm1peVh5MzhCZmdKK3gzbXFsc3ZsNzJPTUcwWW84RTVKcW9FdDhKSHpkeTFwd1FnRjNpRkpFZmhmd0FYdng1OGxOWXpNaHhnajc0V2t5WEs1L0JmZ2YvQSsvV0c1WFA1cmpQSGZHWW5BT3lGcEJyVEFSOTZ2QzJBamFjSklCTjRCU1JYUUFaY1VVMkROU0FUT25LUUdhSUVMaXYveVVWSmtCQUpuVEZJRC9BSmNVTnozczZTYUl3dWNLVWtOOEF2RlU5YVNKaHhSNEF4SldnRy9VRHhuQ3F3NW9zQ1prYlFHZnFJNDFFZEpOVWNTT0NPUzFzQTF4VXV0T1pMQW1aQzBCcTRwWG1NcUtYSUVnVE1nS1FMWEZHL1JjQVNCRXllcEFYNm1lS3VwcEJrREM1d3dTUTN3QzBVcU5RTUxuQ2hKRGZBTHg3VUhib0VkNTZGaFlEOXdnaVJWd0lyajJBTnJZR1Y3eXhlU0prQU56SUU1Y01IcHVaSlUyMjRaeUErY0dFa1YwQUlYRE84dlFMVGRjNC90SHRnQUd6NlJOQWZtd0RXbkpRSTFBNUZ0VG9Xa0NkQUJVNFoxQnpTMk8xNUkwZ1JZQUEwdzVUVDgwZmFHQWNnMnAwRFNCR2lCUzRaMUF5eHM5N3lScEFaWUFKZU0ydzZvYlBkazlnT25Zd1ZjTXF3ZmJhOUp4UFlhV0V1cWdRaGNNVTVUSUFJTE12c1FZMlRzSkVYZ0o0YXpCLzdKOXIrU1FZeHhHMk5jTDVmTEcrRHZnSXJ4K2NmbGNua2JZOXlTMFljWUkyTW1hUTc4VDRhekIycmJIWm5GR1BzWTQyYTVYUDRGK0EvZ0g0RGZNUjUvV0M2WDZ4amozOGprQjBaTVVnV3NHYzRkVU52dUdaRHRIb2hBbE5RQURYREY4VTJCTlRBbmt3OHhSc1pJMGdUWUFGT0djUWZVdG51T0tNYll4UmpYeStYeUJoRHc5OENFNC9sdnkrVnlIMlA4MzJRZzI0eVJwQTN3a1dIY0FiWHRuaEdTTkFObVFBM01nR3VHdFFjcTIxc1MrNEVSa3JRQVBqS01PNkMyM1ROU3RyZkFGbWo1Uk5JS1dBT1hET01DV0FNMWlRVkdSbElGL0psaDdJSEdkczhKc2QwQk5mQXJ3N21TTkNleHdJaEltZ0FiaHJFSGF0c2RKOGgyYjNzTzNEQ2NGWWtGeG1VTlRCbEdiYnZqeE5sdWdCdUdNWlhVa0ZCZ0pDUXRnSThNNDBmYkhXZkNkZ1BjTVl4SVFvRVJrRlFCa1dFc2JhODVQelZ3UjM1VFNRMkpCTVpoRFZ5UTM0M3R5Qm15M1FNTnNDZS9TQ0tCSTVNVWdVdnl1d01XbkRIYkhkQ1EzMVRTbkFRQ1J5U3BBbjRtdnowd3Q5MXo1bXh2Z0NYNUxVZ2djRnhyaGpHM3ZlV2RzQjJCVy9LNmtqVGpqUUpISWlrQ2wrUzN0TjN5L3N5QlBYbEYzaWh3QkpKbXdNL2tkMnM3OGc3WjdvR0d2T2E4VWVBNDF1UzNCK2E4WTdZM3dBMzVYRWhxZUlQQXdDUTF3Qlg1elczM0ZBdGdSejROYnhBWWtLUUpzQ0svcGUyV0F0czlzQ0NmSzBrelhpa3dyQWhja05lZDdVangvOW5lQUwrU3o1eFhDZ3hFMGd6NGliejJRRVB4a0FiWWswZkRLd1dHc3lhL2FMdWorSTd0SG9qa2NTbHB4aXNFQmlDcEJxN0k2OWIyaXVKUnRsZkFIWGtzZUlYQU1GYmt0UWNhaWtNc3lLUG1GUUtaU1dxQVMvS0t0cmNVejdMZEFqZWtkeWxweGdzRjhvdmtkV2Q3UmZFU2tUem12RkFnSTBrTk1DV3ZodUpGYkcrQkplazF2RkFncjBoZVM5c2R4V3VzZ0QxcFhVcWE4UUtCVENUTmdTbjU3SUFWeGF2WTdvRVY2ZFc4UUNDZkJYa3RiUGNVYjdFQzlxUTE1d1VDR1VpcWdTdnl1Ylc5b1hnVDJ6MndJYTJhRndqa0VjbXJvVWhsUlZvWGttb09GRWhNMGd5NElwKy8yTjVTSkdHN0EzYWtOZWRBZ2ZRaStleUJTSkhhaHJScURoUklTTklFdUNhZmxlMmVJclVOYVYxS21uQ0FRRm9MOHRrQks0cmtiTGZBbnJUbUhDQ1Exb0o4b3UyZUlwZVd0R29PRUVoRVVnTmNrTWZPOXBvaXA1YTBhZzRRU0tjaG4waVJXMHRhVTBrem5oRklRRklGWEpISHp2YWFJaXZiSGJBbnJacG5CTkpZa0Ura0dFcExXalhQQ0tReEo0K2Q3VFhGVURyU3FubEc0STBrTmNBRmVVU0tJYldrTlpVMDRRbUJ0NXVUeHg3WVVBeXBJNzJhSndUZVFOSUUrRWdlSzlzOXhXQnM5OENPdEdxZUVIaWJobnpXRk1mUWtWYkZFd0p2MDVESGplMHR4VEYwcEhYRkV3S3ZKR2tHWEpMSG11SllXaEtUVlBPSXdPdk55V05udTZVNGxpM3BWVHdpOEhwejhsaFJISTN0TGVuVlBDTHdDcEltd0JWNWJDaU83WmEwS2g0UmVKMDVlZnhxZTB0eGJGdlNta3FhOElEQTY5VGtzYUVZZ3kzcFZUd2c4RHB6MHRzREc0b3hhRW12NWdHQkY1SlVBUmVrdDdIZFU0eEJUM29WRHdpODNKdzhOaFNqWUxzanZZb0hCRjZ1SnIyOTdRM0ZtT3hJYThvREFpOGdhUUpja2Q2R1lteTJKQ2FwNXA3QXk5VGtzYUVZbTQ3MEt1NEp2RXhOZW52Ykc0cXg2VWx2eGoyQmw2bEpiME14UmgzcFZkd1RPSkNrQ1hCSmVpM0ZHUFdrZDhVOWdjUFY1TEdoR0tPT0RDVE4rRXJnY0RYcC9XcTdweGdkMnoxNXpQaEs0SEExNmJVVVkzWkhlalZmQ1J6dWt2UTJGR1BXazk2TXJ3UU9JS2ttdlozdExjV1liVWx2eGxjQ2g2bEpiME14ZGx2U3EvaEs0REExNlcwbzNxTUxTUk8rQ0J6bWlzUnN0eFJqMTVKSHhSZUJaMGlxU085WGl2ZHN4aGVCNTlXazExS2NnaTE1elBnaThMeWE5RFlVbzJkN1N4NFZYd1NlVjVIV3p2YVc0ajJiOEVYZ0NaSm13SlMwV29wVGNrZDZGVjhFbmxhUlhrdHhTbnJTdStDTHdOTnEwbXNwM2oxSkZaOEVubGFSMXM3Mmx1S1VkT1F4NFpQQTA2NUlhME54YW5yeXFQZ2s4QWhKTmVtMUZNVm5FejRKUEs0aXZaYmkxR3pKWThZbmdjZlZwTFd6M1ZPY21pMTV6UGdrOExpS3RGcUs0cDdBQXlSTmdDbHB0UlRGYjY3NEpQQ3dtdlJhaWxQVWtWSGdZUlZwN1d4dktVNk83WjVNSk0wQ0Q2dEpxNk1vdmpjTFBPeUt0RnFLNGdHQmV5UlZwTmRTbkxJZGVjd0MzNnRJekhaSGNjcTI1REVMZks4aXJWdUs0aEdCNzFXazFWSVVqd2g4NzRxME9vcmlZVlhnSzVKbXBOZFJGQStiQkw1VmtkYk85cGJpMUhWa0V2aFdSVm9keFRub3lTVHdyUmxwZFJURkV3TGZtcEZXUzFFOGJoTDRWa1ZhSFVYeHVNdkF0eTVJWjJlN3B5aWVFUGhDVWsxYUhVWHhqRUErSFVYeGpNQnZhdEpxS1lwbkJQTFpVaFRQQ1B5bUpwMjk3UzFGOFl4QUhoMUZjWURBYnlyUzZTaUtBd1IrYzBFNkhVWHh2SDNnRTBrVDB0cFNGTS9yQXA5VkpHUzdwU2dPRUVodlIxRWNLUERaakhTMkZNV0JBcC9OU0tlbEtBN1RCdExiVWhRSENueFdrYzZXb2pqTU52RFpoRVJzdHhURlliYUJ0UFlVNTJoR0h0dkFaelBTNkNqTzBZd01iRzhEbjAxSlkwdFJIT2FXVHdKcGJTbUt3Mno1SkpCV1IzR09KcVMzNVpNZ3FTYWRudUljWFpKZXh5ZUJoR3kzRk1WaGVqNEpGTVVUSkUzSXdIYkxKNEYwYmluT1VVVjZlNzRJUUVWUkRLdmppd0JNU0tPbE9FY1Y2ZlY4RVNpS3AwMUlyK09MUURvZHhUbXFTSy9uaTBBNlBjVTVtcEJleHhjQnFFbGpTM0dPcnNnb2tJanRMY1Zaa1RRaEE5c3RYd1NLNG5FVm1RWFN1S000UnhQUzIvR1ZRQm85eFRtcVNHL0xWd0pGOGJnSm1RV2c0dTA2aW5OVWtWN0xWd0p3d2R2MUZPZG9RbWFCb25qY0paa0ZpdUlCa2liazBmS1ZRQm85eGJtcEdFQWdqWTdpM0V3WVFLQW9IbGFSUjhkWEFrVXhJTnM5WHdrVXhjTnFCaEFvaWlNS0ZNWERya2h2eHoyQm9oak9sbnNDUlhHUHBKcUJCTktZVUJTdkVFaWpvamduTlFNSkZNVVJCWXJpZXpVRENhUXhvemduRXdZU1NHTkdjVTR1R1VpZ0tMNGlhY2FBQW1sY1VaeUxHUU1LRk1XM0t2THB1Q2VRaUtRWnhUbVlrRS9QUFlGMFpoVG5vR1pBZ1hSbUZPZGd4b0FDNmN3b3pzR1VmSHJ1Q2FSVFVadzBTVFY1ZGR3VFNHZENjZXBtREN3QWQ2UnhSWEhxS3ZMcXVDY0FQWWxJbWxDY3NvcU1iUGZjRTBpcm9qaGxGZm5zZUVBZ3JSbkZTWkkwQXk3SVo4c0RBbW5OS0U1VlRWNGREd2hBU3pvMXhhbXF5R3ZMQXdKcHpTaE9WVTFlSFE4SXBEV2xPRG1TSnNBbGVYVThJQUFkQ1VtcUtVN05uTHgydG5zZUVJQ2V0Q3FLVTFPVFY4Y2pBdW5OS0U3Tm5MeGFIaEZzdDZSVlVad01TWFBnZ3J4YUhoRkk3NHJpbE16SmEyKzc0eEdCejI1SlNGSkZNWHFTSnNDY3ZGcWVFUGlzSjYySzRoUTB3QVY1dFR3aDhGbEhXaFhGS1ZpUVg4c1RBcCsxcEZWUmpKcWtHcGlTMTg1Mnh4TUNuM1drZFVVeGRnMzV0VHdqOEludEhyZ2pJVWtWeFNoSm1nRFg1TGZoR1lIZnRLUlZVWXhWd3pCYW5oSDRUVXRhRmNWWUxjanZWOXM5endqOHBpV3RtbUowSk5YQWxQdzJIQ0R3aGUwZXVDT2RTNG94YWhqR2hnTUV2dFdTa0tTYVlqUWtUWUJyOHZ2VmRzOEJBdC9xU0t1bUdKT0dZV3c0VU9CYkxXblZGR1BTTUl3TkJ3cDh4ZllXMkpOT1JURUtraXJna3Z4K3RkMXpvTUQzV3RLNWtGUlJqTUdDWWF4NWdjRDNPdEtxS1k1SzBnU1lrOS9lOW9ZWENIeXZKYTJhNHRqbXdBWDVyWG1od0QyMlc5S3FLWTV0d1REV3ZGRGdZWGVrY3lHcG9qZ0tTVFBna3Z6dWJIZThVT0JoSFduVkZNZXlZQmdyWGlId3NKYTBhb3BqYVJqR2hsY0lQS3dqclpwaWNKSWE0SUw4Ym16M3ZFTGdBYlk3MHJxUVZGRU1yV0VZYTE0cDhMaGIwcHBUREViU0RMZ2l2enZiTGE4VWVGeEhXalhGa0JxR3NlSU5Bby9yU090SzBvUmlLQTM1N1lFTmJ4QjRYRWQ2TlVWMmt1YkFsUHcydG52ZUlQQUkyeDNwelNtRzBEQ015QnNGbm5aSFduT0tyQ1JOZ0kva2QydDd5eHNGbnRhUjFvV2tpaUtuaG1Hc1NDRHd0QzNwTlJRNUxjaHZaM3REQW9HbnRhUlhVMlFocVFhbTVMY2lrY0RUT3RLN2xEU2p5S0Vodnoyd0pwSEFFMnozd0k3MDVoUkpTWm9BMStTM3NkMlRTT0I1TGVrMUZLbk5HVVlrb2NEeld0SzdsRFNqU0dsQmZyL2EzcEpRNEhrdGVjd3BrcEEwQXk3SmIwVmlnV2ZZM2dJNzBsdFFwTElndjUzdGxzUUNoMmxKYnlxcG9uZ1RTUk9nSWI5SUJvSER0T1RSVUx6VkhMZ2dyNTN0TlJrRURyTWhqNGJpclJia3R5YVR3QUZzOThBdDZWMUlhaWhlUlZJTlhKTFhIbGlSU2VCd0cvSm9LRjZySWIrTjdaNU1Bb2Zia01lVnBKcmlSU1ROZ0d2eWkyUVVPSkR0TFhCSEhnM0ZTeTNJNzhiMmxvd0NMN01pajJ0Sk00cURTSm9BRGZtdHlDendNaHZ5V1ZFY2FnRmNrTmV0N1k3TUFpOWd1d2R1eU9PanBKcmlFQXZ5aXd3ZzhISnI4bGxMbWxBOFNsSURYSkRYem5iTEFBSXZaTHNGZHVReEJWWVVUNG5rRnhsSTRIVlc1SE10cWFINGpxUUdtSkxYenZhYWdRUmVadzNzeWVjWFNUWEZmWkg4SWdNS3ZJTHRIbGlUMTBaU1JmR2ZKRFhBbEx6MndJWUJCVjV2UlY0WHdFYlNoT0wvaWVTM3N0MHpvTUFyMmQ0Q04rUTFCVnBKRTk0eFNSR1lrdGNlV0RHd3dOdEU4cnNFV2trVDNpRkpFMkJCZm12YlBRTUx2SUh0TFhCRGZwZEFLMm5DKzdNQUxzaHZ4UkVFM200QjdNbnZFbWdsVFhnbkpNMkFuOG52eHZhV0l3aThrZTBlV0RHTVM2Q1ZWUEUrckJoRzVFZ0NhYXlBSGNPNEJGcEpGV2RNVWcxOEpMOGIyMXVPSkpDQTdSNklET2NDK0RkSkRlZHJ6VERXSE5HSEdDTXB4Qmk3NVhMNUIyREdjT2JMNWZMM3krV3lqVEgralRNaEtRSWZ5ZS9XZHVTSUFtazFETzhhYUNWVm5BRkpGZkF6dzRnY1dTQWgyMXRneWZBdWdWYlNnaE1tYVFKc0dNYXQ3WllqQ3lSbU93SjNETzhDK0xPa1Z0S00wN1FDcGd3ak1nS0JQQnFPNXdyNFA1S2lwQWtuUXRJS3VHWVl0N1piUmlDUWdlME8rQlBIOVRQUVNXb1lPVWtyNENlR0V4a0oyU1lYU1J2Z0k4ZTNBNkx0TlNNaWFRS3NnR3VHYzJ1N1ppUUNlVFhBanVPYkFyOUkya3BxR0FGSk5kQUIxd3dyTWlLeVRVNlNLdURmR0pjZHNBYld0cmNNU05JRVdBSFhETy9HZHNPSXlEYTVTV3FBWHhpblcyQU5iR3ozWkNKcEJpeUFCcmpnT0g1dmU4dUl5RFpEa0xRR3JobTNXNkFGV3RzdGJ5UnBBc3lCT2ZDUjQxcmFqb3lNYkRNVVNTMXd4ZW00QlRxZ0IxbytzZDN5QUVrVk1BRXFvQUlxNEpKeDJBR1Y3WjZSK1lGaHpZRVd1T1EwWEFGWGZQWXpuMGppQkVYYlBTTVVHSkR0SHFpQkhjVlFibTJ2R2FuQXdHejN3QnpZVXd5aFljUUNSMkM3QTJwZ1Q1SFQwdmFXRVFzY2llME9xSUU5UlE1M3RpTWpGemdpMngxUUEzdUsxQnBPUU9ESWJIZEFEZXdwVWxuYTdqZ0JnUkd3M1FFMXNLZDRxenZia1JNUkdBbmJIVEFEN2loZWF3L01PU0dCRWJIZEF6VndSL0VhQzl0YlRzaUhHQ05qRW1QOFc0enhyOHZsOHZkQVJYR29HOXVSRXhNWUtkc044Q2VLUTl6WmJqaEJnUkd6dlFMK0FPd3BIck1IYWs1VVlPUnN0MEFGM0ZIY3R3ZHEyejBuNmtPTWtiR0xNZll4eHI4dWw4dS9BLzZSNHIvOGQ5c3RKeXh3UW13dmdEOENlNG9mYlc4NGNZRVRZM3NEVk1BdDc5ZVB0dGVjZ1E4eFJrNU5qTEdQTWE2WHkrVWUrR2ZlbHg5dHJ6a1RnUk5tZXdYOEEzREgrL0NqN1RWbjVFT01rVk1XWS96M0dPTmZsOHZsSHZnbjRIZWNweDl0cnpremdUTmhld1ZVd0MzblpRLzgwZmFhTXlUYm5CdEpjMkFGVERsdE8yQnV1K05NQmM2UTdRMVFBVXRPMXkxUTJlNDRZN0xOT1pNMEExYkFSMDdIbjJ5dmVBZGttL2RBVWcxRTRJcnh1Z01hMngzdmhHenpua2lhQXl0Z3luanNnV2g3eFRzajI3eEhrdWJBQXJqaWVQYkFDbGpaN25tSFpKdjNURklOTk1BY3VHQVllMkFGckd6M3ZHT3lUUUdTSnNBY21BTWZ5ZU5YWUdON1RmR2ZaSnZpVzVJbVFBM1VRQVZjOFRvN29BVmFZR083cC9qRy93V2pSUy84TnE5NkF3QUFBQUJKUlU1RXJrSmdnZz09XCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwid2lkdGhcIjogODAsXHJcbiAgICBcImhlaWdodFwiOiAxNTYsXHJcbiAgICBcInVybFwiOiBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBRkFBQUFDY0NBWUFBQURvT3l4aUFBQUFBa2xFUVZSNEFld2FmdElBQUFtc1NVUkJWTzNCQzVEY2RXRUE0TzkrdTlKTkRwS0pKQ1FYQ0lXWUIwa2dFWTRVSXFRZ3hBd1FLRldnVWpPbUQ4ZEhKVFVDUTZRQkJnU05LWFJxQllPSzRGUkVoa1pNRytTbENRaVZxcG5Nb1FrU2JBSUgxVFNIZ2VacWVpbGJYSnhlNTY1emo5emQvL2ZmMjczYjNidnZxMVA1cHVNQ0xNWlJHSStKYUVEV29mWmhIL2JoQ2Z3dDhzcWtUbVc2Q0IvQ1RNdzFPTC9FbC9BNVpWQ25zdHlJUzNHaTB2c0dWaWl4T3BWaEJWWmpudkxhaUV1VVVNYnd5dUUrWElzcHltOE81bU9ERXNrWVBrdndHQllqR0Rwek1BV1BLSUdNNGJFSzZ6SFY4SGduQ25qR0lHVU12WFc0Q2ZXR1Q4QXBhRUt6UWNnWVd1dHhKWUxoTndhbjRXNFVGQ2xqNkd6QW42b3NFL0c3K0VkRnloZ2EzOGFsS3ROc2JFV3pJZ1RsZHhmZXAzTGxjSVVpQmVXMUhoOVd2QUwyS2I4WmlwUlJQcmRnRllMMDl1RWVMTU10ZUZDSE9reFZla2ZoTld5VFVwM3lXSVYxeUVsdk0vNEVMZnEyQkovRTJhaFhPcnV3QUhrcFpKVGVFdHlPY2RJcDRBNHNSNXYrTmVOK1BJQkphTUJZZzNja0p1TTdVc2dvclFiOEU0Nld6a0hjaW12RmE4VkczSUd4T0FKSEdaeDUrQVYyaUpSUldwdHdpblFPNGpxc1U1d0N2b2N2NFZtTXdYNk13VmpwWk5HSXJ5TXZRa2JwM0k3THBWUEFYK0VMU21NWC9nRmZ3MzA0R2NkTFp6eU93NE1pWkpUR0IzRVRzdEpaaTg4cGp6YmNpL21ZSTUwWmVCd3RFbVFNWGdQdXg1SFMrU3F1VW40YnNCVFR4TXZpYU53dlFUQjRkK0ZZNld6R1J3eWRTL0d5ZE03RlhBa3lCdWVUK0lSMG1yRVVlVU9uRGMvakQvRTc0bVF4QVJzTklDamVCSHhLT2dmd1ViUWFlbHZ3UmVtY0kwRkc4ZTdGYWRLNURmY1lQay9pTEJ3dnp1SDRUMnpWajZBNEYrSzkwbmtZTnhoK0s5RXEzdnNNSUNqT0xjaUs5d3Q4UkdYWWlidkZhOFFFL1FqU3V3cnZGSytBdFdoUk9WYmplWEhxY2FWK0JPbjloWFFleFZkVW5wdkZPMHMvZ25SdXhBenhYc1hIVktZTitMNDRqWmlnRDBFNmwwaG5QVnBVcnJVb1NGYVA5K3RERU8vak9FbThuK0l6S3RzV1BDdk9IK2hERUcrRmVBWGNvRG84TGM1c2ZRamlMTUZwNGoyQmgxV0hMNk1nMlhRMDZpV0ljNDE0ZVZ5bmVqUmpwempMOVJJa2E4RHA0ajJCSnRWbGp6Z242eVZJZGozR2laUEhqYXJQWm5GbTZDVklkb1o0LzR3bTFlY2hjWTdCUE4wRUF6c1RDOFQ3RzlXcEdTM2l2RmMzd2NBK0lkNDJiRmE5WGhibmJOMEVBNXNuM3VPcTIwRnhKdWttNkY4ajVvclRpcytyYmo4U1p4WnlPZ1g5KzNQeHRxRlZkZHNxVGc3bjZCVDBiNEY0OTZsK1B4SHZmSjJDdnVWd2tqaXY0aHVxWHd2MmlUTkhwNkJ2RjJHY09OdlZqbjhYWjd4T1FkOHVFKzhCdGVQWDRzelNLZWpic2VLMDRnRzE0emZpak1OTTdZSytuU2pPYzhpckhUOFhiNGwyd2FFdVFMMDRXOVdXRjhSYnFGMXdxT1hpZlZsdCtUZnhqdFV1T05ReDR1eEFzOXF5Vzd4NjdZSkR6UlNuV2UzWkxkNWs3WUtlVGtLRE9KdlVwcjNpVE5NdTZPbGljZkxZcERhMWlaUEZuS0NuczhYWmpsYTE2WUI0ODRPZUpvblRvbllkRkc5dTBDV0hXZUpzVXJ0K0s5Nk1vTXRTNUNUTFk1UGFWUkJ2VXREbC9lTHNRcXRSL3ljYmRKa3F6ajYxclZtOE1VR1hxZUpzVWR2YXhNc0dIU1pnbGppUEd2WC9qZ3c2TEJhbkJjK3BiUytJbHcwNk5JcnpzdHIzcG5pWm9FT2pPUHVNNm01cTBHR3NPRThiMVVQUTRRaHhIakdxaDZERFpNbjJZN2RSUFFRZEdpUjd5YWplQ2dIVGtaWHNnRkc5dFFRMGlQT2lVWWNJbUM3Tzk0enE3VmNCYzhUNXFWRzlIUXg0dTJUNzBXeGttQ0hlbXdIVEpmdWxrYU5ldkI4RkJNbGFqUnpUeEdzS0NKTDl4c2d4UWJ5ZkJXUWwyMkhreUlxekg4MEJZeVRiYnVTb0YyZXZka0djRjR3Y2s4UnAxUzVnc21RdkdSbHlPRjZjTjdVTGtoMUVxNUhoUlBIK1M3c2cyWDRqeHdMeFh0SXVvTUhBWGpkeUxCQnZ1M1lCV1FON3k4aHhnbmovb1YyUTdBMGp4OXZFMjZOZGtLeGc1RGhjdkYzYUJhTzZteXhlWHJ0Z1ZIZlR4Tm1uVTVDc3pzZ3dYN3ovMFNsSWRyaVJZWUVpQk1uZVptUllxQWhCc3JjYkdVNVFoQ0RaTkNORFRydzNkQXJpekZUN0pvbDNRS2NnemtscTMzSGkvVmFuSU02cGF0c1p5SWwzVUtlQXZaS2RxcmE5V3pvRm5RTGVrdXd3dFcyUmRKcDFDamdvMldTMWJaSjBmcWhUUUp0a3g2bGRPY3lWempNNkJiUkpsc081YXRQbHFCZXZCYzA2QmJ3bHppSzE2WExwN05aTndLL0VPVXZ0eVdHQmRINnVtNEJ0NG94WGU5WmdpblR1MTAzQVErTE1WbnZPazg0ZVBLMmJnR1kwU3pZT3A2a2RaMktoZEhicEplandpampMMUk1cnBQY3R2UVFkL2tXY2Q2a05PYnhMT3EzNGU3MEVIYjRqenRGcXcxV1lLSjN0eU9zbDZMQU5yMGsyQXcycTM4WFMrNlkrQkYxMlM1YkZKYXBiSTA2UnpsN2NyUTlCbHozaW5LKzZmUXBaNmZ4UVA0SXVqNGx6ak9wMmh2VFc2VWZRNWJ2aXpFV0Q2clFLVTZXekRVMzZFWFJwd1M3SnNsaWhPbDBxdlc4YlFORFRYbkdXcWo1emNhcDBYc1VYRENEb2FaODRjMVdmMWNoSjUwbmtEU0RvNlNseHB1QmkxZVZNNmVUeFdRbUNucjRyM25MVjR3TjRoM1Nld1U0SmdwNmFzVWVjK2FySGg2WDNWUkdDUTcwb3ptd3NWdmttWUtGMG5zVUdFWUpEL1VTOHExVyttMUF2bllkRUNnNzFUZkVXcW54THBmTXlQaTFTY0tnbTdCUm5LbGFwWEIvQUNkSjVUQXBCMzU0WGI3bkt0Vkk2citONktRUjkrMnZ4Rm1LRnlyTUVDNld6R2ExU0NQcldoRzNpclVGT1pia0dXZkh5dUY1S1FmOGVGMjgyN2xJNUd2SDcwbmtDelZJSytyY1dlOFg3SUQ2ak1ud2FPZkVLdUZFUmd2N2w4WmgwcnNZcXcyc0p6cFhPRDlDa0NNSEFyc0hyNHVYd1dhd3lmTllnSjUzUEsxTEd3UEtZZ2tYaUhZYkYrRy84Mk5CYWdTdWxzeFdyRlNsSWRoMWVsRTQ5YnNQZkdWcHJwSGU3UWNoSVZzQ2J1RkE2QWFmakRHeEJtL0s2RStkSlp3ZXVNQWdaY1pwd0ttWko3eDI0REcrZ1NYbGNocHVSbGM3TjJHWVFNdUk5aFQvR0VkSWJqd3V4Q0MrZ1JlbGNpSzlndkhSMjRFTUdLU05lRzE3RCtjZ3F6Z3lzd0NMOEsxb016aHFzd3lUcDNZeHRCaWtqblIyWWhOTVZMNHRaV0lIek1BN2JVUkR2SXR5RFA4Tlk2VzNGUjVWQW5lSThnZ3VVemdIOERLL2dTV3pERGwzbTRFeThCN093UVBIeXVBaGJsRUNkNHVUd05INVA5ZmtXL2tpSlpCU25nRWV3REJOVmoxZHhQdkpLSktONGJkaUlaWmlvT3R5QXA1UlF4dUMwWVNPV1lhTEs5akJXS2JHTXdXdkRQVGdIMDFTbVYzQWU4a29zb3pRSytCcG1ZcjdLY2hBcjBhUU1Na3BySTdKb3hHR0dYd0czWXIweXlTaTk3Mk1IRm1HQzRYVW5WaXVqalBMWWhYc3hBM01Oanp1eFVwbGxsRThlRy9CcnpNVjRRK2RPWEdFSVpKVGZqL0YxSEljWnlDcWZQRzdEMVlaSXh0REk0MEZzeFR4TVZYcDdjUzF1TllUcURJK1BZeFZtR2J3Q0hzWEgwR0tJMVJsZUs3RUNKeU1yblFKK2dMWFlZcGpVcVF5TitFdWNnRGtZcDI5NTdNUnp1QU5OaHRuL0FoNU4yZU9CYTRSZ0FBQUFBRWxGVGtTdVFtQ0NcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgXCJ3aWR0aFwiOiA0MCxcclxuICAgIFwiaGVpZ2h0XCI6IDc4LFxyXG4gICAgXCJ1cmxcIjogXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUNnQUFBQk9DQVlBQUFCU1UxUXFBQUFBQWtsRVFWUjRBZXdhZnRJQUFBVHRTVVJCVk0zQmY0eldkUjBBOE5memVZNDc0VGhQSUFoQzRFeFovQmpjaE0zTnpnMGR3MncyVGRmY1l0UFFZdmhIMFpaank3THBWdWJ5ajBxM2JJdGNKYVZUWjRodHNHVFdtRnU0S0N5S2NuR1RJVC9QSEFLMzVEd1o5bXpQYlhkZjN0L243cmtmejFkZXI1S0pzeGpyc1FMejBJN3BLS2s2aFdONEVkOVdwNUx4VzRIdlloVmExZWNsM0tvT1plTnpQNTVBSjVyVjcxUG94TE5HVURaMlQrTHJhRE0yaTlDTzN4dEcyZGk4Z0xVb0c3c1NPdEdOL1dwSVJtOHJiamN4cG1DVFlaU056aGJjSVY4L1hzTStsREZkZmRyeEJ4eVJvNngrajJJRFNxSWUzSWV2NFJrOGpxT1lpZGtvcTYwWkhkZ2lSMWw5MXVNaFRCSWR4TjE0UWRaZVBJbTltSXpKYUVWWjFJRVNkcmxBMmNpdXhzOXhtZWc0dm9oZGFqdUFaL0VZVHFBTGsyV1ZzQlJQbzljUVpTTjdIa3RFcDNBdlhsYS92ZWpGYWpUSmFzVjBiRE5FTXJ5SGNaM29IQjdGYjQzZVQ3Rlp2cys0UUZMYklteVFieHNlTVhZYnNVYzBCL2NaSXFudEI1Z2hPb0M3amQrRGVFLzBPVU1rK1ZaamphZ2YzME92OGR1QjM0azZNZG1BSk45R1RCYTlqS2RNbkFkd1J0WTBmTm1BSkxvS040amV4U1lUcXh2N1JLc05TS0w3MFNiYWhqZE12RDJpSlFZazBmV2lrM2hBWTJ3VkxjQXNGVW5XWGZpazZCVWMxUml2NGgxWkxiaExSWkoxaStnRGJOWlkveFd0VkpGa2RZcitqWjBhNjdqb0NoWEpvR1hvRU8zV2VJZEZjMVVrZzlhaVNkWUgyS3p4ZWtTek1TTVpkTFhvVGZ4VjQvMVQxSVJiazBFTFJmc1VZNjk4UzVPcWorTnkwU3VLc1Ivdml4WWtWWGVpV2RacFBLVTRwMFhUazZxVm9vTTRxemg5b2hsSjFVTFJHNHAxWHRTZVZNMFY3VkdzTTZKSkNVc3dXMVkvZnFOWWZhTFdoSnRFeDlDaldQMmlTeExtaWQ1eWNXaEpXQ0E2Nk9Md1ljS2xvbTRYaDk2RXFhS1hYQng2RTZiSk9vVjlpamRGZENhaFJkWnBINDEyMGZHRUpsazlQaG90b21NSkxiTE9LRjRUUGlZNmtkQXM2NVRpWFlOTFJDY1MybVM5clhqWHkvZm5oSktzczRvM1U3NERTWFJlOFRwRS9UaVJSSk1VN3pKUm40b2thbGU4T1dwSW9zc1ZyMTNVcHlLSjJoUnJBV2FKK2xVa25KRTFSN0Z1UnhLOXB5S2hUOVlNeFZvaDN6RVZDWDJ5cHVLemlyTmN2bTRWQ1NkRmF4UmpEUmJKdDFORndrSFJJc1ZZajJiUjIzaE9SY0pyb2c2TjE0UlY4djNkZ0lTbjBTOXJQdG8wMWliTWttKzdBUWxIY0ZSV0s5WnByTnZrTzQ0Zkc1QlVIUkoxYVp3dUxKZnZWVU1rVmY4U0xkTTQ5NkpGMUk4bkRKRlU3Uk5kaFNVYVk1VjhlN0hMRUVuVjgzaGZWak8rWXVKdHhEejVmdTBDU2RWSkhCS3RNdkcrSU44Qi9NUUZra0gvRUMxRmw0blRpWlh5dlNoSE1taWJxQVhmTUhHK2lTbWlFM2hRam1UUUZ2eEhkQlB1TUg1emNhTjhPM0JXamlScnUyZ0tmb1F1NC9Nd3BvdE80VHRxU0xLK2hTT2lUMkFMdW96TkNueGV2cDA0cW9heXJITm93dzJpYWJnWjcrSjFvL01yTEJIOUQrdlFvNGF5YUJmV1lMNW9LbTdFY3V4R3I1RjlIM2VpSk5xQnh3eWpMTi9ydUFWdG9pWXN4WmV3SEQwNExGcU16VmlISmxFdk51Q0lZWlRVdGc2UG84M3d6dUV3M2tLL3FwbFlpRmExL1FMM0dFRlpiWDlEUDY3REpMVWxURU1IcnNTVm1JMW10UjNFelRobkJHWEQyNDArZkJvdEprWWZOdUV2NmxBMnN0MTRFOWZpVXVQeklYNkdSOVNwckQ3N3NSM0wwR0hzbnNNOVJxR3NmdS9nbDJqQ1lyU3EzM2s4ZzdWR3FXejAvb2l0bUk4Rm1HUjRKL0ZEZk5VWWxJelB0ZGlJYXpBZlRhck80eEQraElmUWJZeitENlRuK1dJd2xkMkhBQUFBQUVsRlRrU3VRbUNDXCJcclxuICB9LFxyXG4gIHtcclxuICAgIFwid2lkdGhcIjogMjAsXHJcbiAgICBcImhlaWdodFwiOiAzOSxcclxuICAgIFwidXJsXCI6IFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFCUUFBQUFuQ0FZQUFBQVBaMmdPQUFBQUFrbEVRVlI0QWV3YWZ0SUFBQUpsU1VSQlZLWEJUV2lXQlJ3QThOLzdmMXlzajIzVkVyWGx0ajVvNFNGaVNYWHlJbFowRXdZZGhwbFdGQjJrOEdTSENLcERFUjZDaElJT0laVEU3Q0RDQWlFcW9TZ3BpWWcrSk8weVJ4OG9NM1QyTnJkZStBK2V6YjF6Ny92MCs5V3NiQ2NleDUyNEVSMDRoeU1ZY1ptYUs5dVBSOUdodVlNWXNVQmhlWWN4Z3NMeWhuQWVYNXBYYU80QXRrcDFITVFuNkVJdmFsS2dGKytZVjFqcVZUeU5HdXA0R2Jzd2puMllRQTIzb2NBNlhJc2pHZ3FMUFlnMzBJazV2SVVYTEhZY0gyQUF3NmhoRUhzMWhNVmVRcmYwR1o2enZDZnhuZFNIM1JwQzZRbmNKNTNCYml0N0hUUFNReHBDYVFjSzZRQyt0YkwzY1ZMYW9DR2tZZHdyL1k0OVduZENXb2ROSVcxRHAvUTV6bW5kS1Nud2NFZ2JwVmw4cUQwL0s5MFYwdTNTYVl4cHoxZEtmWUZOV0NQOXFIM0hjRkc2S2ZBSVFqcXVtbitrbnNBR2FSYUhWVE10WFIyNFdmb0xSMVV6STNVR2JwQW0vWCt6Z2V1a0NkV0Y5SGVnVXpxdHVtdWtNNEVPYVZJMS9laVd6Z1k2cFVuVmJFWklVNEdhZEVrMWR5aGRDS1cxcXVsWHFnZG1wRnRVczE3cFFtQmE2bGZOb05LdmdiUFNnUFp0eDNxcGpvOENKNlUrWEtVOW93anBGM3dmK0VucXdnNnRHOEQ5U3A5cUNIeWh0Rm5ybmtlM05JVzlHZ0pqT0M4TmE5MFdwYU00cFNFd2pSUFNyZGh1WmFNWWt1cllaMTVJNDFKZ0R3WmMyVE1vcEs4eGJsNUlMK0kzYVFpSHNGRnpUK0VCNlJMZXRrQWh6ZUpmYkVHQk5kaUtRZnlBS2VreHZJSWU2UmgyV2FCbXNUZnhMQXFsYWZ5QlZWaUxRcnFJYlJpelFHR3hjZlRpSHF5U09uQTl1aEhTSE43RGF5NVRXT3BqL0ltNzBXT3BPUnpDcUNZS3pYMkQvVmlOMWVpU0p2QXVkbHJHZjA2bmZMUVo1QTJkQUFBQUFFbEZUa1N1UW1DQ1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBcIndpZHRoXCI6IDEwLFxyXG4gICAgXCJoZWlnaHRcIjogMjAsXHJcbiAgICBcInVybFwiOiBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQW9BQUFBVUNBWUFBQUMwN3F4V0FBQUFBa2xFUVZSNEFld2FmdElBQUFFSFNVUkJWSFhCT3l1RllRQUE0T2U4WHlTWGxGeUtUSElZaEFpcndXcHlLWmxrTlNpTDVCZVlUQzZGQVZsTWxQSURLSVBGNUw0WW5EcVJFSW5FcVUvcDFQbWVKeVhmS09hUlJvUkRETXFKL0J2RE1zcndpQ3FrOFltalNLd1oyL2pCR0thUlJTODZzQmlKcmFJYnM5Z1ZPMFhBRUY0QzZqR0FZNnpJdDRBTStnTW1VWWt0aFdYUUZOQ0RMRFlVOW9EYWdDYmNTdmFLaW9BYTNFajJpZUtBY2x4SlZvUzNnR0pjUzFhTjU0QUkzNUpWNHlQZ0M2MlMxZUU5NEFsdENwdENEUzRDN3RDcXNCRjhZeWZnQ2kzb2txOFQzVGpEWHNBbVVsaENnMzl6S01XMm5KVFlPaVp3anhPVVlBQ1g2SkFUaWUyakVYMW9SeG92bU1HNW5KUjh3eGdYVzhPQlA3ODR5VGRYV2pJS0ZnQUFBQUJKUlU1RXJrSmdnZz09XCJcclxuICB9XHJcbl07XHJcbm1pcG1hcHMuZm9yRWFjaCggbWlwbWFwID0+IHtcclxuICBtaXBtYXAuaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgY29uc3QgdW5sb2NrID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggbWlwbWFwLmltZyApO1xyXG4gIG1pcG1hcC5pbWcub25sb2FkID0gdW5sb2NrO1xyXG4gIG1pcG1hcC5pbWcuc3JjID0gbWlwbWFwLnVybDsgLy8gdHJpZ2dlciB0aGUgbG9hZGluZyBvZiB0aGUgaW1hZ2UgZm9yIGl0cyBsZXZlbFxyXG4gIG1pcG1hcC5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4gIG1pcG1hcC5jYW52YXMud2lkdGggPSBtaXBtYXAud2lkdGg7XHJcbiAgbWlwbWFwLmNhbnZhcy5oZWlnaHQgPSBtaXBtYXAuaGVpZ2h0O1xyXG4gIGNvbnN0IGNvbnRleHQgPSBtaXBtYXAuY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcclxuICBtaXBtYXAudXBkYXRlQ2FudmFzID0gKCkgPT4ge1xyXG4gICAgaWYgKCBtaXBtYXAuaW1nLmNvbXBsZXRlICYmICggdHlwZW9mIG1pcG1hcC5pbWcubmF0dXJhbFdpZHRoID09PSAndW5kZWZpbmVkJyB8fCBtaXBtYXAuaW1nLm5hdHVyYWxXaWR0aCA+IDAgKSApIHtcclxuICAgICAgY29udGV4dC5kcmF3SW1hZ2UoIG1pcG1hcC5pbWcsIDAsIDAgKTtcclxuICAgICAgZGVsZXRlIG1pcG1hcC51cGRhdGVDYW52YXM7XHJcbiAgICB9XHJcbiAgfTtcclxufSApO1xyXG5leHBvcnQgZGVmYXVsdCBtaXBtYXBzOyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQSxPQUFPQSxXQUFXLE1BQU0sbUNBQW1DO0FBRTNELE1BQU1DLE9BQU8sR0FBRyxDQUNkO0VBQ0UsT0FBTyxFQUFFLEdBQUc7RUFDWixRQUFRLEVBQUUsR0FBRztFQUNiLEtBQUssRUFBRTtBQUNULENBQUMsRUFDRDtFQUNFLE9BQU8sRUFBRSxFQUFFO0VBQ1gsUUFBUSxFQUFFLEdBQUc7RUFDYixLQUFLLEVBQUU7QUFDVCxDQUFDLEVBQ0Q7RUFDRSxPQUFPLEVBQUUsRUFBRTtFQUNYLFFBQVEsRUFBRSxFQUFFO0VBQ1osS0FBSyxFQUFFO0FBQ1QsQ0FBQyxFQUNEO0VBQ0UsT0FBTyxFQUFFLEVBQUU7RUFDWCxRQUFRLEVBQUUsRUFBRTtFQUNaLEtBQUssRUFBRTtBQUNULENBQUMsRUFDRDtFQUNFLE9BQU8sRUFBRSxFQUFFO0VBQ1gsUUFBUSxFQUFFLEVBQUU7RUFDWixLQUFLLEVBQUU7QUFDVCxDQUFDLENBQ0Y7QUFDREEsT0FBTyxDQUFDQyxPQUFPLENBQUVDLE1BQU0sSUFBSTtFQUN6QkEsTUFBTSxDQUFDQyxHQUFHLEdBQUcsSUFBSUMsS0FBSyxDQUFDLENBQUM7RUFDeEIsTUFBTUMsTUFBTSxHQUFHTixXQUFXLENBQUNPLFVBQVUsQ0FBRUosTUFBTSxDQUFDQyxHQUFJLENBQUM7RUFDbkRELE1BQU0sQ0FBQ0MsR0FBRyxDQUFDSSxNQUFNLEdBQUdGLE1BQU07RUFDMUJILE1BQU0sQ0FBQ0MsR0FBRyxDQUFDSyxHQUFHLEdBQUdOLE1BQU0sQ0FBQ08sR0FBRyxDQUFDLENBQUM7RUFDN0JQLE1BQU0sQ0FBQ1EsTUFBTSxHQUFHQyxRQUFRLENBQUNDLGFBQWEsQ0FBRSxRQUFTLENBQUM7RUFDbERWLE1BQU0sQ0FBQ1EsTUFBTSxDQUFDRyxLQUFLLEdBQUdYLE1BQU0sQ0FBQ1csS0FBSztFQUNsQ1gsTUFBTSxDQUFDUSxNQUFNLENBQUNJLE1BQU0sR0FBR1osTUFBTSxDQUFDWSxNQUFNO0VBQ3BDLE1BQU1DLE9BQU8sR0FBR2IsTUFBTSxDQUFDUSxNQUFNLENBQUNNLFVBQVUsQ0FBRSxJQUFLLENBQUM7RUFDaERkLE1BQU0sQ0FBQ2UsWUFBWSxHQUFHLE1BQU07SUFDMUIsSUFBS2YsTUFBTSxDQUFDQyxHQUFHLENBQUNlLFFBQVEsS0FBTSxPQUFPaEIsTUFBTSxDQUFDQyxHQUFHLENBQUNnQixZQUFZLEtBQUssV0FBVyxJQUFJakIsTUFBTSxDQUFDQyxHQUFHLENBQUNnQixZQUFZLEdBQUcsQ0FBQyxDQUFFLEVBQUc7TUFDOUdKLE9BQU8sQ0FBQ0ssU0FBUyxDQUFFbEIsTUFBTSxDQUFDQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztNQUNyQyxPQUFPRCxNQUFNLENBQUNlLFlBQVk7SUFDNUI7RUFDRixDQUFDO0FBQ0gsQ0FBRSxDQUFDO0FBQ0gsZUFBZWpCLE9BQU8ifQ==