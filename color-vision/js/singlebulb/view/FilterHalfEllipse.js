// Copyright 2014-2022, University of Colorado Boulder

/**
 * FilterHalfEllipse is used to form the actual filter image. It is cut in half so
 * it can be layered with the beam above one half and below the other.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import { Shape } from '../../../../kite/js/imports.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import { Path } from '../../../../scenery/js/imports.js';
import colorVision from '../../colorVision.js';

class FilterHalfEllipse extends Path {

  /**
   * @param {Property.<number>} filterWavelengthProperty
   * @param {Property.<number>} filterVisibleProperty
   * @param {number} centerX
   * @param {number} centerY
   * @param {number} radiusX
   * @param {number} radiusY
   * @param {boolean} left is true to draw the left half of the filter, false to draw the right
   */
  constructor( filterWavelengthProperty, filterVisibleProperty, centerX, centerY, radiusX, radiusY, left ) {

    const shape = new Shape()
      .moveTo( centerX, centerY - radiusY )
      .ellipticalArc( centerX, centerY, radiusX, radiusY, 0, -Math.PI / 2, Math.PI / 2, left )
      .close();

    super( shape );

    filterWavelengthProperty.link( wavelength => {
      this.fill = VisibleColor.wavelengthToColor( wavelength );
    } );

    filterVisibleProperty.linkAttribute( this, 'visible' );
  }
}

colorVision.register( 'FilterHalfEllipse', FilterHalfEllipse );

export default FilterHalfEllipse;