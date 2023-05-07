// Copyright 2017-2022, University of Colorado Boulder

/**
 * A generic area, split up with up to two partition lines per dimension. The partition lines are the separators between
 * partitions. So if you have 3 partitions, there are 2 lines in-between (one for left-center and one for center-right).
 * GenericLayout is for the number of partitions.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import AreaModelCommonQueryParameters from '../../common/AreaModelCommonQueryParameters.js';
import Area from '../../common/model/Area.js';
import OrientationPair from '../../common/model/OrientationPair.js';
import Term from '../../common/model/Term.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';
import GenericPartition from './GenericPartition.js';

class GenericArea extends Area {
  /**
   * @param {GenericLayout} layout
   * @param {boolean} allowExponents - Whether the user is able to add powers of x.
   */
  constructor( layout, allowExponents ) {
    assert && assert( typeof allowExponents === 'boolean' );

    // If we allow powers of X, we'll only allow 1 digit in front.
    const firstDigitCount = allowExponents ? 1 : 3;
    const secondDigitCount = allowExponents ? 1 : 2;
    const thirdDigitCount = 1;

    const horizontalPartitions = [
      new GenericPartition( Orientation.HORIZONTAL, firstDigitCount ),
      new GenericPartition( Orientation.HORIZONTAL, secondDigitCount ),
      new GenericPartition( Orientation.HORIZONTAL, thirdDigitCount )
    ].slice( 0, layout.size.width );

    const verticalPartitions = [
      new GenericPartition( Orientation.VERTICAL, firstDigitCount ),
      new GenericPartition( Orientation.VERTICAL, secondDigitCount ),
      new GenericPartition( Orientation.VERTICAL, thirdDigitCount )
    ].slice( 0, layout.size.height );

    super(
      new OrientationPair( horizontalPartitions, verticalPartitions ),
      AreaModelCommonColors.genericColorProperties,
      1,
      allowExponents
    );

    if ( AreaModelCommonQueryParameters.maximumCalculationSize ) {
      horizontalPartitions.forEach( ( partition, index ) => {
        partition.sizeProperty.value = new Term( -Math.pow( 10, partition.digitCount ) + 1, allowExponents ? 2 - index : 0 );
      } );
      verticalPartitions.forEach( ( partition, index ) => {
        partition.sizeProperty.value = new Term( -Math.pow( 10, partition.digitCount ) + 1, allowExponents ? 2 - index : 0 );
      } );
    }

    // @public {GenericLayout}
    this.layout = layout;

    // Set up partition coordinate/size
    Orientation.enumeration.values.forEach( orientation => {
      const partitionCount = layout.getPartitionQuantity( orientation );
      const partitions = this.partitions.get( orientation );

      if ( partitionCount === 1 ) {
        partitions[ 0 ].coordinateRangeProperty.value = new Range( 0, 1 );
      }
      else if ( partitionCount === 2 ) {
        partitions[ 0 ].coordinateRangeProperty.value = new Range( 0, AreaModelCommonConstants.GENERIC_SINGLE_OFFSET );
        partitions[ 1 ].coordinateRangeProperty.value = new Range( AreaModelCommonConstants.GENERIC_SINGLE_OFFSET, 1 );
      }
      else if ( partitionCount === 3 ) {
        partitions[ 0 ].coordinateRangeProperty.value = new Range( 0, AreaModelCommonConstants.GENERIC_FIRST_OFFSET );
        partitions[ 1 ].coordinateRangeProperty.value = new Range( AreaModelCommonConstants.GENERIC_FIRST_OFFSET, AreaModelCommonConstants.GENERIC_SECOND_OFFSET );
        partitions[ 2 ].coordinateRangeProperty.value = new Range( AreaModelCommonConstants.GENERIC_SECOND_OFFSET, 1 );
      }
    } );

    // @public {Property.<Partition|null>} - If it exists, the partition being actively edited.
    this.activePartitionProperty = new Property( null );
  }

  /**
   * Resets the area to its initial values.
   * @public
   * @override
   */
  reset() {
    super.reset();

    this.allPartitions.forEach( partition => {
      partition.sizeProperty.reset();
    } );

    this.activePartitionProperty.reset();
  }

  /**
   * Erase the area to a 1x1, see https://github.com/phetsims/area-model-common/issues/77
   * @public
   * @override
   */
  erase() {
    super.erase();

    // Clear all partition values
    this.allPartitions.forEach( partition => {
      partition.sizeProperty.value = null;
    } );

    this.activePartitionProperty.reset();
  }
}

areaModelCommon.register( 'GenericArea', GenericArea );

export default GenericArea;