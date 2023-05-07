/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const mipmaps = [
  {
    "width": 30,
    "height": 312,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAE4CAYAAABMskM9AAAAAklEQVR4AewaftIAAATASURBVMXBvZXbWBaF0e8ejV9or8ciMiiY4wkhMAR1BuWONVQGymDUGVRlwMoAyoAVQUNee3ewljBLEAHWj8T3zt6RmfysiGiADuiBFmiBFtix9pCZe2aRmbxFROyBHtgDO97mj8z8zOQfvFJEHIAPwI6fdwd8ZiJeISIG4D/Ajl9zGxENE/GCiPgA3HI9PRPxsgPX1TERz4iIHthxXR0T8bwPXF/DRDxvz/W9ZyIuiIg9cEMh4rI9hUREJy7rKacRGyKiA3YUJLbtKasV2/aU1YozEdEAtxQm1vZUINZ6KhBrPeU1YiEiWmBHeZ34UU8l4kd7KhE/6qlEzCKiBW6oRHzXU5H4rqci8V1PRWISEQ2woyLxTUdl4pueysQ3PZWJb1oqC6AB/qKuRwEdBgI6DAS0GAjoMBDQYiBgh4EwESbCRJgIeMLgHXAPPAH/BH6njqfITP4vIj4A/6W8R7GQmZ+BP6lArN1TgTiTmfdUILZ9oTCxbaSsUWw7UtYgTMS2kcLEtoHChIkwESZi24nCxIbMPFGYMBEmwkR4nITHSZgIE2EiTISJMBGXfaEgcdlIQcJEmAiDzDwKE2EiTISJMBEmwkSYCBNhIup7ZCIu6yhIXHZDQcJEmAgTYSJMhIkwESaivpGJqG9gIkyEiTARJsJEmAgTYSJMhIkwEfUNTER9IxNhIkzEhojoKUyYCBNhIkyEiTARJqKyzDwyESbCRJgIE2EiTISJMBF1PTET2xrKODET2zoKEybCRJgIE2Ei6hqZiboGZsJEmAgTYSJMhImoa2Am6hqZCRNhIrb1FCZMRF0jM1FRZg7MhIkwESbCRNTzxIKo58SCMBEmwkTUM7Ig6hlYECbCRGx7T2GinoEFUc/IgjARJqKegQVRSWaOLAgTUccTZ0QdJ86IOkbOiDoGzog6Rs6IOgbOCBNRQWYeOSPORERDBWKtowJR3iMbhIkwESaivCMbhIkwESbCRJR3ZIMwESbCRJgIE7HWcV0jG8RawxVl5sAGYSJMhIkwESbCRJgIE1HWVy4QZQ1cIEyEiTARJmKtoQKx1lGBMBEmwkSYCBNhIkyEiTARJsJEmAgTYSJMxFpLBWJtRwXCRJgIE2EiTISJMBEmwkSYCBNhIkyEiSir4wJR1g0XCBNhIkyEiTARJsJEFBYRPRuEiTARJsJElNeyQZTXskGYCBNRXscGUV7DBlFewwZR3i0bxNoTVxYRLWfE2onr6zkj6ug5I+poOSPq6Dgj6rjhjFgbKSAiehbE2kAZDQuino4FUU/LgqinZUGsHSnjPQuioohomIm6OmZi7UQ5LTNxJjNPlNMyE3V1zMS2R8pomIm63jMT2wYKiYiGidg2Uk7HRGwbKKdlIraNlNMyERsy80g5PRNx2RNlNEzEZQNl3DIRlw0UEhGtuOxIOa24IDOPlNOJ5z1QRiOed6SMXjzvnkLEMzLzBDxyXV+BO/GyT1zPV6DPzEG8IDPvgS/8ui9An5kDE/E6d/yaB6DPzIHZu8PhwEsOh8Pp48ePvwH/4m2+Av/OzLvD4fA3C+KVMvMO+JPXewC6zPzEhshM3iIi7oADcMO2B+BTZh55RmQmbxURDbAHWqAHBuAE3GfmiVf4H9DF2DOOjdcPAAAAAElFTkSuQmCC"
  },
  {
    "width": 15,
    "height": 156,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAACcCAYAAACgJPGnAAAAAklEQVR4AewaftIAAAKmSURBVKXBT4tWVQAH4MffO4tXphItteyv6aIUXJRBC9u0yE25i8BFIK2LPkD7oA8RuJLoW9SiVkFTMIvIpARDmQYlaRynqQtz4czLMHXPOc9zwP7exWUcw3E8jbkd13B5yV4f4WOctL9LmMdeH+Kk/7aMt2LRZZw2zeux6H3TnY9FZ003i+IinjHdLIoP1FmO4pRKseMwzqjzWOx4D3N1DsaOdzSIHU9qEMxxRoPgTcw1CC5pFJzWKDikUfCcRsExjaJDsKHRDF/hMF5S594Mv+ILvI0TprsXxXWVovhOnbtR3FBnI4pVlaJDFL+pFMW6StFuK9r9FR2iQyy6r0Is+kOFaLcd7bajQ3SIDtEhFi2bbiUWHVEhOkSH6BDtNqPdanSIDtEhOkSHaLca7TajOKdSdIgO0SHarUSH6BAdos2GQRQvmO6OQRSHVIoO0WbLINqsGUSH6BBtHhpEmw2DKE6oFMVR0/1jEG3+NogO0ea+QbT52SA6RJubBtFmzSCKc6a7axBtbhhEmz8Nos11g6h32yjq3TaKeutGUW/TKIqYZtsoiphmxSg6RL3vjaJD1Fszino3jaJDFEumeWgUxUHTrBpFh+gQHaLOll2izi27RIcoZipF8YRK0SE6RIfoEB2iQ3SI4qhKUcxVig7RITpEh+gQHaLOU3aJOkt2iQ7RIeq9aBT1HjGKDlHvtFHUWzaKei8bRb1TRlHcNs0xoygemOZZo6j3vFEUd02zhPMGUWyY7jWDKDZNd8EgigemO24QxZbplg2iuGO64wZRrJruJOZRrKjzahQ/qnMhiuu4ZbpXYtEvpns8Fv1kukdnFq3himm2Y9HX+MH/28LVmb0O4qL9reMTfDqz1zc4i7P2+hZX8KXBAfv7DG/gCH7HVXxul38B325cXSoIXPEAAAAASUVORK5CYII="
  },
  {
    "width": 8,
    "height": 78,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAABOCAYAAAAdDlf6AAAAAklEQVR4AewaftIAAAGOSURBVIXBv27VZRwH4Od8Ttv0hERM0zLAwADGDTajg4Nx1RtgdfAKvACvhJFwCQzcAoubg5hoDCitqa38SUsPb/Jt0pD39/7O8yxc+Rnf4xb28Qq3tpT7+AkrV27guyg/YqX3ZZQvTNsNVvjMtFXwAz4x7VrwlRnBXTOCm2YEN8wItsxY4g98ix29X4KH+M20syiHpv0f5b2BKGvTLmLe2yjnBqIcmbaOeRexQZQt046j7Jl2FBvEvKOY929sEPNOoyxM+zvKwkDMexPzXsTYhSbKtt6pJkr01poYe62JsbUmylLvXBNlpbfWxNh7TYz9p4mx15oon+q908TYuSbGXmhi7KUmykLvUBNlofdcE2N/aWLsT02Upd6pJkr0/tHEtLVLMe3EpSg7BqJsG4gNYoMo2wairAzEBrFBTNtxKabtuhRje5oYu66JsduaGLuviXKi97kmypneHU2Ut3oHmihnevuaKMd6B9iK8kpvF99EeW7a11GemnYzyiP86mO/4/HSlSPcwxme4AGefQClP0DbGgdsGwAAAABJRU5ErkJggg=="
  },
  {
    "width": 4,
    "height": 39,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAnCAYAAAAoyenmAAAAAklEQVR4AewaftIAAAC1SURBVFXBvy5DcRwH0PP7tFQisRj8iakWm7lP4Tm8lWcwiycwmUw2EYmlCRrVe2li+N57TsMJ7jHH3RTXuPDvNFgou8G5kuDYQPBmILhVNsFK6YNe6YKlgSBKFxwo3zH2E2N90JQ+aMpvEGUdTJRV0JR1sKd0MbYM9pWvGHsJmvIcNOUpmCivUTb4DGb+dbaCZiCYGQimBqLs2IoSHMbYZfChLIKVMg/elbPgQTma4BFXaLj5A+S0I08RiNlyAAAAAElFTkSuQmCC"
  },
  {
    "width": 2,
    "height": 20,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAAUCAYAAACnOeyiAAAAAklEQVR4AewaftIAAABVSURBVCXBMQrCUBAFwNn3g1jZiKew8vIexsorBIQE2USLzBSeuE94YAouqOCFLWj84rAFQQeFPSh0EHQwsAbBJygsQdDBwB4MJA6n4ItrMOM2cMb7D3PlEgW4hjIuAAAAAElFTkSuQmCC"
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