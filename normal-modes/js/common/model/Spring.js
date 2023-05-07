// Copyright 2020, University of Colorado Boulder

/**
 * This Spring class models a spring that connects two masses and is visible when the left one is visible.
 *
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import normalModes from '../../normalModes.js';

class Spring {

  /**
   * @param {Mass} leftMass
   * @param {Mass} rightMass
   */
  constructor( leftMass, rightMass ) {

    // @private (read-only) Non-property attributes
    this.leftMass = leftMass;
    this.rightMass = rightMass;

    // @public {Property.<boolean>} determines the visibility of the spring
    // dispose is unnecessary because all masses and springs exist for the lifetime of the sim
    this.visibleProperty = new DerivedProperty(
      [ this.leftMass.visibleProperty, this.rightMass.visibleProperty ],
      ( leftVisible, rightVisible ) => {
        return leftVisible;
      } );
  }
}

normalModes.register( 'Spring', Spring );
export default Spring;