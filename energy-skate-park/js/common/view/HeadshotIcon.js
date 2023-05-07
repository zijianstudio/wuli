// Copyright 2022, University of Colorado Boulder

/**
 * Helps create icons for character sets supported for simulation localization.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import energySkatePark from '../../energySkatePark.js';
import { Image } from '../../../../scenery/js/imports.js';

class HeadshotIcon extends Image {
  constructor( image ) {
    super( image, { scale: 0.35 } );
  }
}

energySkatePark.register( 'HeadshotIcon', HeadshotIcon );
export default HeadshotIcon;
