// Copyright 2022-2023, University of Colorado Boulder

/**
 * Shows the sky and the ground. Reshapes to the visible bounds.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import centerAndVariability from '../../centerAndVariability.js';
import { LinearGradient, Rectangle } from '../../../../scenery/js/imports.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import CAVColors from '../CAVColors.js';
import Multilink from '../../../../axon/js/Multilink.js';

export default class BackgroundNode extends Rectangle {
  public constructor( bottomY: number, visibleBoundsProperty: Property<Bounds2> ) {
    super( visibleBoundsProperty.value.centerX, visibleBoundsProperty.value.top, visibleBoundsProperty.value.centerX, bottomY );

    Multilink.multilink( [
      CAVColors.skyGradientTopColorProperty,
      CAVColors.skyGradientMiddleColorProperty,
      CAVColors.skyGradientBottomColorProperty,
      CAVColors.groundColorProperty,
      visibleBoundsProperty
    ], ( skyGradientTopColor, skyGradientMiddleColor, skyGradientBottomColor, groundColor, visibleBounds ) => {
      const gradient = new LinearGradient( visibleBounds.centerX, visibleBounds.top, visibleBounds.centerX, bottomY );

      // sky gradient, sampled from a screenshot
      gradient.addColorStop( 0.0, CAVColors.skyGradientTopColorProperty.value );
      gradient.addColorStop( 0.5, CAVColors.skyGradientMiddleColorProperty.value );
      gradient.addColorStop( 0.9999, CAVColors.skyGradientBottomColorProperty.value );

      // The ground
      gradient.addColorStop( 1.0, CAVColors.groundColorProperty.value );

      this.setRect( visibleBounds.left, visibleBounds.top, visibleBounds.width, visibleBounds.height );
      this.fill = gradient;
    } );
  }
}

centerAndVariability.register( 'BackgroundNode', BackgroundNode );