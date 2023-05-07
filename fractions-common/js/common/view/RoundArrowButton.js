// Copyright 2018-2022, University of Colorado Boulder

/**
 * Shows a round push-button with a directional arrow.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { Path } from '../../../../scenery/js/imports.js';
import RoundPushButton from '../../../../sun/js/buttons/RoundPushButton.js';
import fractionsCommon from '../../fractionsCommon.js';
import FractionsCommonConstants from '../FractionsCommonConstants.js';
import FractionsCommonColors from './FractionsCommonColors.js';

class RoundArrowButton extends RoundPushButton {
  /**
   * @param {Object} [options]
   */
  constructor( options ) {
    options = merge( {
      radius: FractionsCommonConstants.ROUND_BUTTON_RADIUS,
      xMargin: FractionsCommonConstants.ROUND_BUTTON_MARGIN,
      yMargin: FractionsCommonConstants.ROUND_BUTTON_MARGIN,
      fireOnHold: true,
      arrowRotation: 0,
      baseColor: FractionsCommonColors.greenRoundArrowButtonProperty,
      enabledProperty: new BooleanProperty( true )
    }, options );

    // "center" the shape around the origin (where we want it to rotate around)
    const size = options.radius * 0.5;
    const ratio = 0.4;
    const arrowShape = new Shape().moveTo( -size, ratio * size ).lineTo( 0, ( ratio - 1 ) * size ).lineTo( size, ratio * size );
    const arrowPath = new Path( arrowShape, {
      stroke: 'black',
      lineWidth: size * 0.5,
      lineCap: 'round',
      rotation: options.arrowRotation
    } );

    // Provide offsets so that it will place our origin at the actual center
    options.content = arrowPath;
    options.xContentOffset = arrowPath.centerX;
    options.yContentOffset = arrowPath.centerY;

    super( options );
  }
}

fractionsCommon.register( 'RoundArrowButton', RoundArrowButton );
export default RoundArrowButton;