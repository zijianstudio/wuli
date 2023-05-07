// Copyright 2017-2022, University of Colorado Boulder

/**
 * Colored background area for generic partitioned areas.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import { Rectangle } from '../../../../scenery/js/imports.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';

class GenericPartitionedAreaNode extends Rectangle {
  /**
   * @param {Property.<PartitionedArea>} partitionedAreaProperty
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty
   */
  constructor( partitionedAreaProperty, modelViewTransformProperty ) {

    // We'll set the fill/size/etc. below.
    super( {} );

    // @public {Property.<PartitionedArea>} - Exposed so it can be set later
    this.partitionedAreaProperty = partitionedAreaProperty;

    // Fill
    new DynamicProperty( partitionedAreaProperty, {
      derive: 'areaProperty'
    } ).link( area => {
      if ( area === null || area.coefficient === 0 ) {
        this.fill = null;
      }
      else if ( area.coefficient > 0 ) {
        this.fill = AreaModelCommonColors.genericPositiveBackgroundProperty;
      }
      else {
        this.fill = AreaModelCommonColors.genericNegativeBackgroundProperty;
      }
    } );

    // Visibility
    new DynamicProperty( partitionedAreaProperty, {
      derive: 'visibleProperty',
      defaultValue: false
    } ).linkAttribute( this, 'visible' );

    // Adjust our rectangle dimension/position so that we take up the bounds defined by the partitioned area. Our area
    // can change, so we need to swap out or multilink when the area changes (kept so we can dispose it)
    let rangeMultilinks = null; // {OrientationPair.<Multilink>|null}
    partitionedAreaProperty.link( partitionedArea => {
      // Release any previous references
      rangeMultilinks && rangeMultilinks.forEach( rangeMultilink => {
        rangeMultilink.dispose();
      } );
      rangeMultilinks = null;
      if ( partitionedArea ) {
        rangeMultilinks = partitionedArea.partitions.map( ( partition, orientation ) => Multilink.multilink(
          [ partition.coordinateRangeProperty, modelViewTransformProperty ],
          ( range, modelViewTransform ) => {
            if ( range !== null ) {
              this[ orientation.rectCoordinate ] = modelViewTransform.modelToViewX( range.min );
              this[ orientation.rectSize ] = modelViewTransform.modelToViewX( range.getLength() );
            }
          } ) );
      }
    } );
  }
}

areaModelCommon.register( 'GenericPartitionedAreaNode', GenericPartitionedAreaNode );

export default GenericPartitionedAreaNode;
