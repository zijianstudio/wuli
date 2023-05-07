/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const mipmaps = [
  {
    "width": 219,
    "height": 166,
    "url": "data:image/png;base64,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"
  },
  {
    "width": 110,
    "height": 83,
    "url": "data:image/png;base64,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"
  },
  {
    "width": 55,
    "height": 42,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADcAAAAqCAYAAAAXk8MDAAAAAklEQVR4AewaftIAAAI/SURBVO3BS0gUcRwH8O/vP7M7mzvp2gYlrrHmg6AHYaIRUmBFCVGB3jp0KbQO3YIupoegOoinIEhIkKAu7SVIxEtPFLKihfBBQrYu5otVV3dn5/Eveh0SRmtjdyf+nw8EQXCWuroDV0KhUDFyEEOavEG9tqe/swU5iCFN9c0Bf/khz358NTkxJSOHENLQ3XOnZMz78AFJvNRb6E4szOj8RuPjMuQIwl+42HGixV9pnTFMY28illRdYEjen8WGBHGDuZ/kVR1svtbROYosI/yB8zcbzvm26ZeS8eQuM7xCSjgFVCjIq/dB6poDx3eaiciia+PV233P7iKLJKzD1OSMlKh8fY88K5eXn88X+Z5qpM4BbsaQ1Ax4avNBA8sA4RuZIV8xU8f2lQVLBscjj5AlEtYwNx2j9lBj78rs0im1Ny75YxIkRviJpQBTMyBNmQDhF0aQXZZeXVMaaNhdXfN26P1IFBkmYQ3ajqGu+PxS0+Z+DV6S8TuJCNJnEyCsQkRwEQ+4lxdO7ynfnno1/mkQGUSwcfLokUZ153Q3LRqq/EbDenDOwTlW0S2emiD1+st34XZkiAwb0eHhVvYiouLfcBuBylJkEIMdzgvgYAw2mKJE4WAMNgzgIxyMwYapKKNwMAYbh4839OkcHA7FYKO1rX1A9hfPw6EYbBQW5FuWaU7DoRhstN26UFVxtqgIDiXDxlhkpGZLcFPsQ8HWBW7oFjd0C+tERBaIG/iBALgUdxSCIAiCIAiCIAiCIPynvgC/rcMc9WdBdgAAAABJRU5ErkJggg=="
  },
  {
    "width": 28,
    "height": 21,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAVCAYAAABVAo5cAAAAAklEQVR4AewaftIAAAEySURBVO3BzyuDYQAH8O/zPO+7t/c1rWVkWpKLi5Nw0BI1h104OSkXucjF2cHFxT8gpVjJUU0SOZCsRDk4aGmHldrbKJm3bZ735+P6Ji3Ndns/HwTSCxMbaCGGBjIHuxF1tLg5vTiUvD4sZNECBL9Y3kqPad1f69KrNUkiLMqOPgUR7K4ihVd3Lm4e8A8MP6xsTy2RD2O/47I6ohYc1dMARfcIo0gorjU3Ppjgt0X9Hk1i8JmdSQ3TcCWjXtV6PO7BdFy4LxZMxwW3HdiOG3ZsOzUQ6+p/Kr+foAkSfPR8fq2cK/WisZDXGUuiSRR+IaWMNqPw0friOQ8QaCMKn+PTs3OiRQ20EYPPW+gxKcXdeeO5bgoqcUFlLqjMBZW5oDIHk+tgcp0oakmv1vYQCAQCf/EN5cdsgKsbJ9IAAAAASUVORK5CYII="
  },
  {
    "width": 14,
    "height": 11,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAALCAYAAABPhbxiAAAAAklEQVR4AewaftIAAACQSURBVGOgCliweDZ72Qr3SQxEAEYGKMhotGjne/UniZGRQZT52p8zPxhZ8vv2njnOgAMwMwCBqYJ8KPOnr91fr37h+/jgK+O7L9+kX3/46nTz7aeJDDgACwMQMHJy/nxy7AYrIwMC/Gfn5WXAA5gYgEA7VOkiu7b4l//MbN//M7N9/8/M9p2BifE7wyggDwAAvmMvYVJanXIAAAAASUVORK5CYII="
  }
];
mipmaps.forEach( mipmap => {
  mipmap.img = new Image();
  const unlock = asyncLoader.createLock( mipmap.img );
  mipmap.img.onload = unlock;
  mipmap.img.src = mipmap.url; // trigger the loading of the image for its level
  mipmap.canvas = document.createElement( 'canvas' );
  mipmap.canvas.width = mipmap.width;
  mipmap.canvas.height = mipmap.height;
  const context = mipmap.canvas.getContext( '2d' );
  mipmap.updateCanvas = () => {
    if ( mipmap.img.complete && ( typeof mipmap.img.naturalWidth === 'undefined' || mipmap.img.naturalWidth > 0 ) ) {
      context.drawImage( mipmap.img, 0, 0 );
      delete mipmap.updateCanvas;
    }
  };
} );
export default mipmaps;