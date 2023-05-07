// Copyright 2018-2022, University of Colorado Boulder

/**
 * Common implementation for the standard radio button groups used.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonColors from './AreaModelCommonColors.js';

class AreaModelCommonRadioButtonGroup extends RectangularRadioButtonGroup {
  /**
   * @param {Property.<*>} property
   * @param {Array.<Object>} items - See RectangularRadioButtonGroup for more info
   * @param {Object} [options]
   */
  constructor( property, items, options ) {
    super( property, items, merge( {
      orientation: 'horizontal',
      touchAreaXDilation: 6,
      touchAreaYDilation: 6,
      radioButtonOptions: {
        baseColor: AreaModelCommonColors.radioBackgroundProperty,
        xMargin: 10,
        yMargin: 10,
        buttonAppearanceStrategyOptions: {
          selectedLineWidth: 2,
          deselectedLineWidth: 1.5,
          selectedStroke: AreaModelCommonColors.radioBorderProperty
        }
      }
    }, options ) );
  }
}

areaModelCommon.register( 'AreaModelCommonRadioButtonGroup', AreaModelCommonRadioButtonGroup );
export default AreaModelCommonRadioButtonGroup;