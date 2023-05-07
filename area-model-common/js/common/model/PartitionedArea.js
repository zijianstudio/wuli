// Copyright 2017-2023, University of Colorado Boulder

/**
 * A 2-dimensional section of area defined by a horizontal and vertical pair of partitions.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import areaModelCommon from '../../areaModelCommon.js';
import Term from './Term.js';

class PartitionedArea {
  /**
   * @param {OrientationPair.<Partition>} partitions
   */
  constructor( partitions ) {

    // @public {OrientationPair.<Partition>}
    this.partitions = partitions;

    // @public {Property.<Term|null>} - Area may not be defined if the size of a partition is not defined.
    this.areaProperty = new Property( null, {
      valueComparisonStrategy: 'equalsFunction',
      isValidValue: Term.isTermOrNull
    } );

    // @public {Property.<boolean>}
    this.visibleProperty = DerivedProperty.and( [
      partitions.horizontal.visibleProperty,
      partitions.vertical.visibleProperty
    ] );
  }

  /**
   * Cleans up references.
   * @public
   */
  dispose() {
    this.visibleProperty.dispose();
    this.areaProperty.dispose();
  }
}

areaModelCommon.register( 'PartitionedArea', PartitionedArea );

export default PartitionedArea;