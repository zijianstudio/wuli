// Copyright 2017-2023, University of Colorado Boulder

/**
 * Button that resets a race in the 'Racing Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import { Image } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import resetRaceButton_png from '../../../images/resetRaceButton_png.js';
import unitRates from '../../unitRates.js';

export default class ResetRaceButton extends RectangularPushButton {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {
    super( merge( {
      content: new Image( resetRaceButton_png, { scale: 0.5 } ),
      xMargin: 12,
      yMargin: 8
    }, options ) );
  }
}

unitRates.register( 'ResetRaceButton', ResetRaceButton );