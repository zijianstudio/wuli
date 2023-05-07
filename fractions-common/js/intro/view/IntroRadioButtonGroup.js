// Copyright 2018-2022, University of Colorado Boulder

/**
 * Holds common settings to RadioButtonGroups for the intro-style screens.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import fractionsCommon from '../../fractionsCommon.js';

class IntroRadioButtonGroup extends RectangularRadioButtonGroup {
  /**
   * @param {Property.<*>} property
   * @param {Array.<*>} array
   * @param {Object} [options]
   */
  constructor( property, array, options ) {
    super( property, array, merge( {
      orientation: 'horizontal',
      spacing: 12,
      touchAreaXDilation: 6,
      touchAreaYDilation: 6,
      radioButtonOptions: {
        baseColor: 'white',
        xMargin: 5,
        yMargin: 10
      }
    }, options ) );
  }
}

fractionsCommon.register( 'IntroRadioButtonGroup', IntroRadioButtonGroup );
export default IntroRadioButtonGroup;