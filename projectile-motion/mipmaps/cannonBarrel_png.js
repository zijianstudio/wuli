/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const mipmaps = [
  {
    "width": 326,
    "height": 142,
    "url": "data:image/png;base64,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"
  },
  {
    "width": 163,
    "height": 71,
    "url": "data:image/png;base64,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"
  },
  {
    "width": 82,
    "height": 36,
    "url": "data:image/png;base64,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"
  },
  {
    "width": 41,
    "height": 18,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAASCAYAAADG3feYAAAAAklEQVR4AewaftIAAAQgSURBVLXB22vWdRzA8ffn+/09xx3c5s6HZ9uThDmtLVaBEZI3FauLgq6i8F66kegf6EQ3EUGB0E0Xgt10EUURXRQmiCAGhWupcyenc+7wuOf8+32/n+apbLnZcL5ewt31H+h7+MBIV2awNZHqSgVBU9yYtFeSRrjBq6oVU654V1HVYtm5Qj4Kl5fDysLvuaW5j//47WzJux+AP7lPwh2Gszue+6B/51udifRTLYlkXcwYrlMXgXOod6AKqoCACIgg1kIQIGK4rewilqoVV3Luaj4KL04X8+cPnxs9dWz+8pfABJsg3HJ477Pv72tsebNOqY2XClAqoKUCFPPgQu5NIJGCVBpJ1iCpNJJIITUpTF8AZaWyGHFlqVgthtHU5XLx/PeXpn/9fOLsN2EU/cIGhFWHMv3vvtzQ/HZQLMS8C8kCVpQtYQLM463ERtqJDzYRZGohEjQC7z1XCxVfKIRz11aq07Oz+Ymvvr4wduzYldOHP316pK01vevKfHlSst09j31oEz91Gmnglh4gKcqDIE/EiY90Ex9qIejeBlKDiOE275VcrsLiUpmHsg1Mz6xMBK+b2KEOkQbukAeSPAAGdLRK9eI41cZxzADEn4kR39OJqW0BaUCklsbGJMVSxG3BDjHDIvxLDmhUwYpyTwbMk2AHFZv12HbFNCoSU4iBCIgFYorElP8qA2OgY6Cssiht4OtQV4v6MkFKaGcNDywBzfwPHvwJ8CeEEMsNvWCHFNOn2E7FtiqmWbENHkkoG3PALKiAKnghCKCWu1hUqEeIi7Jpk+AmBYcQcgcBGQK7SzEZxXYoptkTdCom7VmPUbDchQPmAK/ClmkC06OYDsV2KLbNE3QoJu3ZSOAhD2xjjUCgDFwC2lWwomyGDIMdUmy/J+hSbKvHNCpilc1IJiEoKRcRtrGOIjAFtKhQI4qwRgzMfggGPLZPsR0e26qYtGcriEBwRv3xXrW7jLCuCLgExFSoB1JAAjCiUAc6A+FlQ1TPKst61EAkQgSErGpTEoOOxICDlHKd9+AiKJf5W3DUh+88IuaFrEg39xACC/wjUCFYALsAAhhuUkC5yQEOcIAD7ACk93vSux3xdo8XpaRAkRvCEFbyYAIUEFYJq17s6X3tDRv7pEukiQfAZCH9nCe9x5Ho9IhRrgurwsKyVsMqU7kVmTh/Qc99cdSM5nL682cfcbClRXcvLsmkcMvO7szzh2zsvT4xQzWCsAXso5AcVmIdHl+EyjVhYZlqoaiTc7OMfXvanzzj3JHxmelxNiCs8VKm9+CIBK9uF9ldh2yvFRA2zyusACU0V1Jm5lXP/Yg7NerdkfGZ6XE2QdhAtqfnlX0S7B1AMvUiTXGkPoCYARNAPIKqB43ACxRLaClUzc/D4nF1U+PoyQvTU99xn/4CNJbK7fUHWqsAAAAASUVORK5CYII="
  },
  {
    "width": 21,
    "height": 9,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAJCAYAAADdA2d2AAAAAklEQVR4AewaftIAAAHNSURBVI3BzUtUURjA4d97zp3v0dFqGEsb0RyQ6IuKEpyNFG1atejfCDICW7ZuG9SmlVHL+hsiyqIPQnRThJFSZiY6d+6dme45b1JDIbjoeYRtp0fHandqx26UgtSZlEhFnMuj3oB4FWl5ayOFzY53a5s/O0vPvq++uvZ27gGwwS5k+uDIhcv7q/cGhKFCuAVxCCg7iIV8Acn3YIZL2Kl+WiOZKOkzn1p5PiyvhAu3787PXb964lSjkSzK4+Gxp2XDZAE4IPw3c65I+uIg6eN7sH0lEpclihK2ttqzQU44wrYm0FFICzuVwdYVW/PYqmIriq14TC4G1vjNQyB5RPei3hMIFOn6pjAIiPDPGrhHgsPyVxrsJSVdd6QOO2yvByLQGBQChSbQy7ZY4CtQVgiEP4bA1j22ptghJRjw2H0eSSu7yWYhCJXXRWGKrhBoAgWFDJCKwLww8AYU8IATYARSZx2ZcYcpedotyBVQEbBRT/HduLETWaRiBKGrA8RAGENjAxrrEDpITgJ1T+do0mz1+/cbbf9kflEeXpkxNycn+PxlVZ4LXbeqo9OHxJzPCFUDJQMpAePBA20PcaKsx7C0oP7lfdeZ/biy/INd/AKjybMafc2BlAAAAABJRU5ErkJggg=="
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