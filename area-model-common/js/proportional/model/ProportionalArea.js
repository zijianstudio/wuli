// Copyright 2017-2022, University of Colorado Boulder

/**
 * A proportional area, split up by up to one horizontal partition line and one vertical partition line.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import areaModelCommon from '../../areaModelCommon.js';
import Area from '../../common/model/Area.js';
import OrientationPair from '../../common/model/OrientationPair.js';
import Partition from '../../common/model/Partition.js';
import Term from '../../common/model/Term.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';
import PartitionLineChoice from './PartitionLineChoice.js';

class ProportionalArea extends Area {
  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      maximumSize: 20, // {number} - Maximum size our area can take up
      minimumSize: 1, // {number} - Minimum size our area can take up
      initialWidth: 1, // {number} - Initial width
      initialHeight: 1, // {number} - Initial height
      eraseWidth: 1, // {number} - The width that will be set with the erase button
      eraseHeight: 1, // {number} - The height that will be set with the erase button
      initialHorizontalSplit: 0, // {number} - Initial position (if any) of a horizontal partition split
      initialVerticalSplit: 0, // {number} - Initial position (if any) of a vertical partition split
      snapSize: 1, // {number} - Smallest unit size (that is snapped to)
      partitionSnapSize: 10, // {number} - Smallest left/top partition size
      gridSpacing: 1, // {number} - Space between grid lines
      smallTileSize: 1, // {number} - Size of the smallest tile available (or for the thin tiles, the shorter length)
      largeTileSize: 10, // {number} - Size of the largest tile available (or for the thin tiles, the longer length)
      tilesAvailable: true, // {boolean} - Whether tiles can be shown on this area
      countingAvailable: false, // {boolean} - Whether numbers can be shown on each grid section
      partitionLineChoice: PartitionLineChoice.BOTH // {PartitionLineChoice} - What partition lines are shown
    }, options );

    const horizontalPartitions = [
      new Partition( Orientation.HORIZONTAL, AreaModelCommonColors.proportionalWidthProperty ),
      new Partition( Orientation.HORIZONTAL, AreaModelCommonColors.proportionalWidthProperty )
    ];

    const verticalPartitions = [
      new Partition( Orientation.VERTICAL, AreaModelCommonColors.proportionalHeightProperty ),
      new Partition( Orientation.VERTICAL, AreaModelCommonColors.proportionalHeightProperty )
    ];

    super(
      new OrientationPair( horizontalPartitions, verticalPartitions ),
      AreaModelCommonColors.proportionalColorProperties,
      options.maximumSize,
      false
    );

    // @public {OrientationPair.<Property.<number>>} - Width/height of the contained area.
    this.activeTotalProperties = new OrientationPair(
      new NumberProperty( options.initialWidth ),
      new NumberProperty( options.initialHeight )
    );

    // @public {Property.<Orientation>} - If PartitionLineChoice.ONE is active, which partition line is active
    this.visiblePartitionOrientationProperty = new Property( Orientation.HORIZONTAL );

    // @public {OrientationPair.<Property.<number>>} - Position of the partition lines
    this.partitionSplitProperties = new OrientationPair(
      new NumberProperty( options.initialHorizontalSplit ),
      new NumberProperty( options.initialVerticalSplit )
    );

    // @public {OrientationPair.<Property.<boolean>>}
    this.partitionSplitUserControlledProperties = new OrientationPair(
      new BooleanProperty( false ),
      new BooleanProperty( false )
    );

    // @public {number}
    this.maximumSize = options.maximumSize;
    this.minimumSize = options.minimumSize;
    this.eraseWidth = options.eraseWidth;
    this.eraseHeight = options.eraseHeight;
    this.snapSize = options.snapSize;
    this.partitionSnapSize = options.partitionSnapSize;
    this.gridSpacing = options.gridSpacing;
    this.smallTileSize = options.smallTileSize;
    this.largeTileSize = options.largeTileSize;

    // @public {boolean}
    this.tilesAvailable = options.tilesAvailable;
    this.countingAvailable = options.countingAvailable;

    // @public {PartitionLineChoice}
    this.partitionLineChoice = options.partitionLineChoice;

    // @public {OrientationPair.<BooleanProperty>} - Whether to display arrows next to each partition line that
    // indicates it is draggable.
    this.hasHintArrows = new OrientationPair( new BooleanProperty( true ), new BooleanProperty( true ) );

    // @public {OrientationPair.<Property.<boolean>>} - Whether the partition line for each orientation is visible
    this.partitionSplitVisibleProperties = OrientationPair.create( orientation => new DerivedProperty(
      [ this.activeTotalProperties.get( orientation ), this.visiblePartitionOrientationProperty ],
      ( totalSize, visibleOrientation ) => {
        if ( options.partitionLineChoice === PartitionLineChoice.NONE ) { return false; }
        if ( options.partitionLineChoice === PartitionLineChoice.ONE && orientation !== visibleOrientation ) { return false; }

        // Given the number of digits in the decimals sim (with potential future changes), 1e-7 should be sufficiently
        // small (but not too small).
        return totalSize >= ( this.partitionSnapSize + this.snapSize ) - 1e-7;
      } ) );

    // @public {OrientationPair.<Property.<number|null>>} - Like partitionSplitProperties, but null if the partition line is not visible
    this.visiblePartitionLineSplitProperties = OrientationPair.create( orientation => new DerivedProperty(
      [ this.partitionSplitProperties.get( orientation ), this.partitionSplitVisibleProperties.get( orientation ) ],
      ( partitionSplit, partitionVisible ) => partitionVisible ? partitionSplit : null ) );

    // @public {OrientationPair.<ProportionalPartition>} - The primary (upper/left) and secondary (lower/right)
    // partitions, separated out for easy access.
    this.primaryPartitions = new OrientationPair( horizontalPartitions[ 0 ], verticalPartitions[ 0 ] );
    this.secondaryPartitions = new OrientationPair( horizontalPartitions[ 1 ], verticalPartitions[ 1 ] );

    // Keep partition sizes up-to-date
    Orientation.enumeration.values.forEach( orientation => {
      Multilink.multilink(
        [ this.activeTotalProperties.get( orientation ), this.visiblePartitionLineSplitProperties.get( orientation ) ],
        ( size, split ) => {
          // Ignore splits at the boundary or outside our active area.
          if ( split <= 0 || split >= size ) {
            split = null;
          }

          const primaryPartition = this.primaryPartitions.get( orientation );
          const secondaryPartition = this.secondaryPartitions.get( orientation );

          secondaryPartition.visibleProperty.value = split !== null;

          if ( split ) {
            primaryPartition.sizeProperty.value = new Term( split );
            secondaryPartition.sizeProperty.value = new Term( size - split );
            primaryPartition.coordinateRangeProperty.value = new Range( 0, split );
            secondaryPartition.coordinateRangeProperty.value = new Range( split, size );
          }
          else {
            primaryPartition.sizeProperty.value = new Term( size );
            secondaryPartition.sizeProperty.value = null;
            primaryPartition.coordinateRangeProperty.value = new Range( 0, size );
            secondaryPartition.coordinateRangeProperty.value = null;
          }
        } );

      // Remove splits that are at or past the current boundary.
      this.activeTotalProperties.get( orientation ).link( total => {
        if ( this.partitionSplitProperties.get( orientation ).value >= total ) {
          this.partitionSplitProperties.get( orientation ).value = this.partitionSplitUserControlledProperties.get( orientation ).value ? total : 0;
        }
      } );
    } );
  }

  /**
   * Returns a string like 10x10 that can be used for the size.
   * @public
   *
   * @returns {string}
   */
  getDimensionString() {
    return `${this.maximumSize}x${this.maximumSize}`;
  }

  /**
   * Resets the area to its initial values.
   * @public
   * @override
   */
  reset() {
    super.reset();

    this.hasHintArrows.reset();
    this.partitionSplitProperties.reset();
    this.visiblePartitionOrientationProperty.reset();
    this.activeTotalProperties.reset();
  }

  /**
   * Erase the area to a 1x1, see https://github.com/phetsims/area-model-common/issues/77
   * @public
   * @override
   */
  erase() {
    super.erase();

    this.activeTotalProperties.horizontal.value = this.eraseWidth;
    this.activeTotalProperties.vertical.value = this.eraseHeight;
  }
}

areaModelCommon.register( 'ProportionalArea', ProportionalArea );

export default ProportionalArea;
