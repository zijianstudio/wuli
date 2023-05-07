// Copyright 2017-2023, University of Colorado Boulder

/**
 * Button used to start and stop a race in the 'Racing Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import StopSignNode from '../../../../scenery-phet/js/StopSignNode.js';
import { Image } from '../../../../scenery/js/imports.js';
import BooleanRoundToggleButton from '../../../../sun/js/buttons/BooleanRoundToggleButton.js';
import goButtonIcon_png from '../../../images/goButtonIcon_png.js';
import unitRates from '../../unitRates.js';

export default class StartStopButton extends BooleanRoundToggleButton {

  /**
   * @param {Property.<boolean>} runningProperty
   * @param {Object} [options]
   */
  constructor( runningProperty, options ) {

    options = merge( {
      radius: 45,
      xMargin: 8,
      yMargin: 8
    }, options );

    const goIcon = new Image( goButtonIcon_png, { scale: 0.5 } );
    const stopIcon = new StopSignNode( { fillRadius: 25 } );

    super( runningProperty, stopIcon, goIcon, options );

    // adjust button color based on runningProperty
    // unlink not needed, exists for sim lifetime
    runningProperty.link( running => {
      this.baseColor = ( running ? '#6D6E70' : '#85d4a6' );
    } );
  }
}

unitRates.register( 'StartStopButton', StartStopButton );