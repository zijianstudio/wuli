// Copyright 2017-2022, University of Colorado Boulder

/**
 * Positions an edit button with a readout at the top/side of the partition.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import { Color } from '../../../../scenery/js/imports.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import TermEditNode from './TermEditNode.js';

class PartitionSizeEditNode extends TermEditNode {
  /**
   * @param {Property.<Partition|null>} activePartitionProperty
   * @param {Property.<GenericPartition|null>} partitionProperty
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty
   * @param {boolean} allowExponents - Whether exponents (powers of x) are allowed
   */
  constructor( activePartitionProperty, partitionProperty, modelViewTransformProperty, allowExponents ) {

    const orientationProperty = new DerivedProperty( [ partitionProperty ], partition => partition ? partition.orientation : Orientation.HORIZONTAL );
    const sizeProperty = new DynamicProperty( partitionProperty, { derive: 'sizeProperty' } );
    const colorProperty = new DynamicProperty( partitionProperty, {
      derive: 'colorProperty',
      defaultValue: Color.MAGENTA // Should not see this, but need a valid color
    } );

    super( orientationProperty, sizeProperty, {
      textColorProperty: colorProperty,
      borderColorProperty: colorProperty,
      isActiveProperty: new DerivedProperty(
        [ activePartitionProperty, partitionProperty ],
        ( activePartition, partition ) => activePartition === partition ),
      digitCountProperty: new DerivedProperty( [ partitionProperty ], partition => partition ? partition.digitCount : 1 ),
      allowExponentsProperty: new Property( allowExponents ),
      editCallback: () => {
        if ( activePartitionProperty.value !== partitionProperty.value ) {
          activePartitionProperty.value = partitionProperty.value;
        }
        else {
          // Pressing on the edit button when that keypad is already open will instead close the keypad.
          // See https://github.com/phetsims/area-model-common/issues/127
          activePartitionProperty.value = null;
        }
      }
    } );

    // @public {Property.<Partition|null>} - Exposed so it can be changed after creation in pooling.
    this.partitionProperty = partitionProperty;

    // Primary orientation (position of range center)
    const coordinateRangeProperty = new DynamicProperty( partitionProperty, { derive: 'coordinateRangeProperty' } );
    Multilink.multilink(
      [ partitionProperty, coordinateRangeProperty, modelViewTransformProperty ],
      ( partition, range, modelViewTransform ) => {
        if ( range && partition ) {
          this[ partition.orientation.centerCoordinate ] = partition.orientation.modelToView( modelViewTransform, range.getCenter() );
        }
      } );

    // Secondary (offsets)
    partitionProperty.link( partition => {
      if ( partition ) {
        this[ partition.orientation.opposite.centerCoordinate ] = AreaModelCommonConstants.PARTITION_OFFSET.get( partition.orientation );
      }
    } );

    new DynamicProperty( partitionProperty, {
      derive: 'visibleProperty',
      defaultValue: false
    } ).linkAttribute( this, 'visible' );
  }
}

areaModelCommon.register( 'PartitionSizeEditNode', PartitionSizeEditNode );

export default PartitionSizeEditNode;
