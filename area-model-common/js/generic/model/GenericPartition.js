// Copyright 2017-2022, University of Colorado Boulder

/**
 * Partition that has additional options for generic screens (e.g. digit count)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import validate from '../../../../axon/js/validate.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import areaModelCommon from '../../areaModelCommon.js';
import Partition from '../../common/model/Partition.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';

class GenericPartition extends Partition {
  /**
   * @param {Orientation} orientation
   * @param {number} digitCount
   */
  constructor( orientation, digitCount ) {
    validate( orientation, { validValues: Orientation.enumeration.values } );
    assert && assert( typeof digitCount === 'number' );

    super( orientation, AreaModelCommonColors.genericColorProperties.get( orientation ) );

    // @public {number} - How many digits to allow in the editor
    this.digitCount = digitCount;
  }
}

areaModelCommon.register( 'GenericPartition', GenericPartition );

export default GenericPartition;