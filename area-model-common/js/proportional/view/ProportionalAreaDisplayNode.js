// Copyright 2018-2023, University of Colorado Boulder

/**
 * View for ProportionalArea.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonStrings from '../../AreaModelCommonStrings.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import AreaDisplayNode from '../../common/view/AreaDisplayNode.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';
import CountingAreaNode from './CountingAreaNode.js';
import ProportionalAreaGridLinesNode from './ProportionalAreaGridLinesNode.js';
import ProportionalDragHandle from './ProportionalDragHandle.js';
import ProportionalPartitionLineNode from './ProportionalPartitionLineNode.js';
import TiledAreaNode from './TiledAreaNode.js';

const areaGridString = AreaModelCommonStrings.a11y.areaGrid;
const areaGridRectanglePatternString = AreaModelCommonStrings.a11y.areaGridRectanglePattern;
const countingNumbersPatternString = AreaModelCommonStrings.a11y.countingNumbersPattern;

class ProportionalAreaDisplayNode extends AreaDisplayNode {
  /**
   * @param {ProportionalAreaDisplay} areaDisplay
   * @param {Property.<PartialProductsChoice>} partialProductsChoiceProperty
   * @param {Object} [options]
   * @param {Object} [nodeOptions]
   */
  constructor( areaDisplay, partialProductsChoiceProperty, options, nodeOptions ) {

    options = merge( {

      // Meant to be overridden
      gridLinesVisibleProperty: new BooleanProperty( false ),
      tilesVisibleProperty: new BooleanProperty( false ),
      countingVisibleProperty: new BooleanProperty( false ),
      useTileLikeBackground: false,
      useLargeArea: false,

      // Specified for supertype
      isProportional: true
    }, options );

    nodeOptions = merge( {

      // pdom
      tagName: 'div',
      labelTagName: 'h3',
      labelContent: areaGridString
    }, nodeOptions );

    super( areaDisplay, partialProductsChoiceProperty, options );

    const countingLabel = new Node( {
      tagName: 'span'
    } );
    this.pdomParagraphNode.insertChild( 0, countingLabel );
    options.countingVisibleProperty.linkAttribute( countingLabel, 'visible' );

    const areaAccessibleLabel = new Node( {
      tagName: 'span'
    } );
    this.pdomParagraphNode.insertChild( 0, areaAccessibleLabel );
    Multilink.multilink( areaDisplay.activeTotalProperties.values, ( width, height ) => {
      areaAccessibleLabel.innerContent = StringUtils.fillIn( areaGridRectanglePatternString, {
        width: width,
        height: height
      } );
      countingLabel.innerContent = StringUtils.fillIn( countingNumbersPatternString, {
        count: Utils.toFixedNumber( width * height, Utils.numberOfDecimalPlaces( width ) + Utils.numberOfDecimalPlaces( height ) )
      } );
    } );

    // Background fill
    this.areaLayer.addChild( this.backgroundNode );

    // Grid lines
    const gridLinesNode = new ProportionalAreaGridLinesNode( areaDisplay.areaProperty, this.modelViewTransformProperty );
    this.areaLayer.addChild( gridLinesNode );
    options.gridLinesVisibleProperty.linkAttribute( gridLinesNode, 'visible' );

    // Active area background
    const activeAreaBackground = new Rectangle( {
      fill: options.useTileLikeBackground
            ? AreaModelCommonColors.semiTransparentSmallTileProperty
            : AreaModelCommonColors.proportionalActiveAreaBackgroundProperty,
      stroke: AreaModelCommonColors.proportionalActiveAreaBorderProperty
    } );
    Multilink.multilink(
      [ areaDisplay.activeTotalProperties.horizontal, this.modelViewTransformProperty ],
      ( totalWidth, modelViewTransform ) => {
        activeAreaBackground.rectWidth = modelViewTransform.modelToViewX( totalWidth );
      } );
    Multilink.multilink(
      [ areaDisplay.activeTotalProperties.vertical, this.modelViewTransformProperty ],
      ( totalHeight, modelViewTransform ) => {
        activeAreaBackground.rectHeight = modelViewTransform.modelToViewY( totalHeight );
      } );
    this.areaLayer.addChild( activeAreaBackground );

    const tilesVisibleProperty = new DerivedProperty(
      [ areaDisplay.tilesAvailableProperty, options.tilesVisibleProperty ],
      ( tilesAvailable, tilesVisible ) => tilesAvailable && tilesVisible );

    // @private {TiledAreaNode|null} - Tiles (optionally enabled)
    this.tiledAreaNode = new TiledAreaNode( areaDisplay, this.modelViewTransformProperty, tilesVisibleProperty );
    this.areaLayer.addChild( this.tiledAreaNode );

    // Background stroke
    this.areaLayer.addChild( this.borderNode );

    // Active area drag handle
    this.areaLayer.addChild( new ProportionalDragHandle(
      areaDisplay.areaProperty,
      areaDisplay.activeTotalProperties,
      this.modelViewTransformProperty
    ) );

    const countingVisibleProperty = new DerivedProperty(
      [ areaDisplay.countingAvailableProperty, options.countingVisibleProperty ],
      ( countingAvailable, countingVisible ) => countingAvailable && countingVisible );

    // @private {CountingAreaNode|null} - Counts of numbers for squares (optionally enabled)
    this.countingAreaNode = new CountingAreaNode(
      areaDisplay.activeTotalProperties,
      this.modelViewTransformProperty,
      countingVisibleProperty
    );
    this.areaLayer.addChild( this.countingAreaNode );

    // Partition lines
    Orientation.enumeration.values.forEach( orientation => {
      this.areaLayer.addChild( new ProportionalPartitionLineNode(
        areaDisplay,
        this.modelViewTransformProperty,
        orientation )
      );
    } );

    // Partition labels
    Orientation.enumeration.values.forEach( orientation => {
      const partitionsProperties = areaDisplay.partitionsProperties.get( orientation );

      // because we will have at most 2
      const labels = [ 0, 1 ].map( index => {
        const partitionProperty = new DerivedProperty( [ partitionsProperties ], partitions => partitions[ index ] );
        const label = this.createPartitionLabel(
          partitionProperty,
          areaDisplay.secondaryPartitionsProperty.get( orientation ),
          index,
          orientation
        );
        this.labelLayer.addChild( label );
        return label;
      } );

      const labelListener = this.positionPartitionLabels.bind( this, orientation, labels );
      partitionsProperties.link( ( partitions, oldPartitions ) => {
        oldPartitions && oldPartitions.forEach( partition => {
          partition.coordinateRangeProperty.unlink( labelListener );
        } );
        partitions.forEach( partition => {
          partition.coordinateRangeProperty.link( labelListener );
        } );
        labelListener();
      } );
      areaDisplay.primaryPartitionsProperty.get( orientation ).link( labelListener );
      areaDisplay.secondaryPartitionsProperty.get( orientation ).link( labelListener );
    } );

    this.mutate( nodeOptions );
  }

  /**
   * Updates expensive-to-update things.
   * @public
   */
  update() {
    super.update();

    this.tiledAreaNode.update();
    this.countingAreaNode.update();
  }

  /**
   * Returns the partial product node at the given horizontal/vertical indices.
   * @private
   *
   * @param {number} horizontalIndex
   * @param {number} verticalIndex
   * @returns {PartialProductLabelNode}
   */
  getProductLabel( horizontalIndex, verticalIndex ) {
    const horizontalPartitions = this.areaDisplay.partitionsProperties.horizontal.value;
    const verticalPartitions = this.areaDisplay.partitionsProperties.vertical.value;

    return _.find( this.productLabels, productLabel => {
      const partitions = productLabel.partitionedAreaProperty.value.partitions;
      return partitions.get( Orientation.HORIZONTAL ) === horizontalPartitions[ horizontalIndex ] &&
             partitions.get( Orientation.VERTICAL ) === verticalPartitions[ verticalIndex ];
    } );
  }

  /**
   * Positions all of the partial products labels.
   * @protected
   * @override
   */
  positionProductLabels() {
    // {OrientationPair.<Array.<Range|null>>} - Current view ranges (if non-null) for each orientation
    const rangesPair = this.areaDisplay.partitionsProperties.map( ( partitionsProperties, orientation ) => partitionsProperties.value.map( partition => {
      const range = partition.coordinateRangeProperty.value;
      if ( range === null ) {
        return null;
      }
      return new Range(
        orientation.modelToView( this.modelViewTransformProperty.value, range.min ),
        orientation.modelToView( this.modelViewTransformProperty.value, range.max )
      );
    } ) );

    // First, center the labels (if they have defined ranges)
    this.productLabels.forEach( productLabel => {
      rangesPair.forEach( ( ranges, orientation ) => {
        const partition = productLabel.partitionedAreaProperty.value.partitions.get( orientation );
        const range = ranges[ _.indexOf( this.areaDisplay.partitionsProperties.get( orientation ).value, partition ) ];
        if ( range ) {
          productLabel[ orientation.coordinate ] = range.getCenter();
        }
      } );
    } );

    // Handle each row separately
    [ 0, 1 ].forEach( verticalIndex => {
      const verticalRange = rangesPair.vertical[ verticalIndex ];

      // Bail if this row isn't shown at all.
      if ( verticalRange === null ) { return; }

      const leftLabel = this.getProductLabel( 0, verticalIndex );
      const rightLabel = this.getProductLabel( 1, verticalIndex );

      // We may not be able to access labels if we are in a partial state (some properties have changed, but others
      // have not).
      if ( leftLabel && rightLabel ) {
        const isRightPartitionVisible = rightLabel.partitionedAreaProperty.value.visibleProperty.value;
        const leftOverlapBump = 22;
        const labelOverlapBump = 10;

        const hasLeftOverlap = rangesPair.vertical[ 1 ] !== null && leftLabel.left < -5;
        const canAvoidLeftOverlap = leftLabel.top - leftOverlapBump >= verticalRange.min - 5;
        const hasLabelOverlap = isRightPartitionVisible && leftLabel.right > rightLabel.left;
        const canAvoidLabelOverlap = leftLabel.top - labelOverlapBump >= verticalRange.min - 3;

        let leftOffset = 0;
        let rightOffset = 0;
        if ( hasLeftOverlap && canAvoidLeftOverlap ) {
          leftOffset = leftOverlapBump;
        }
        if ( hasLabelOverlap && canAvoidLabelOverlap ) {
          const labelOverlapOffset = Math.max( labelOverlapBump, verticalRange.getLength() / 6 );
          leftOffset = Math.max( leftOffset, labelOverlapOffset );
          rightOffset = labelOverlapOffset;
        }

        // Ignore Intellij inspections, we know what we are doing.
        if ( leftOffset ) {
          leftLabel.y -= leftOffset;
        }
        if ( rightOffset && isRightPartitionVisible ) {
          rightLabel.y += rightOffset;
        }
      }
    } );
  }

  /**
   * Position the partition labels (along the top/side).
   * @private
   *
   * @param {Orientation} orientation
   * @param {Node} labels
   */
  positionPartitionLabels( orientation, labels ) {
    const primaryRange = this.areaDisplay.primaryPartitionsProperty.get( orientation ).value.coordinateRangeProperty.value;
    const secondaryRange = this.areaDisplay.secondaryPartitionsProperty.get( orientation ).value.coordinateRangeProperty.value;

    const min = orientation.modelToView( this.modelViewTransformProperty.value, primaryRange.min );
    const middle = orientation.modelToView( this.modelViewTransformProperty.value, primaryRange.max );
    const max = secondaryRange ? orientation.modelToView( this.modelViewTransformProperty.value, secondaryRange.max ) : 0;

    labels[ 0 ][ orientation.coordinate ] = ( min + middle ) / 2;
    labels[ 1 ][ orientation.coordinate ] = ( middle + max ) / 2;

    const pad = orientation === Orientation.HORIZONTAL ? 2 : 0;

    if ( secondaryRange && labels[ 0 ][ orientation.maxSide ] > labels[ 1 ][ orientation.minSide ] - pad * 2 ) {
      const center = ( labels[ 0 ][ orientation.maxSide ] + labels[ 1 ][ orientation.minSide ] ) / 2;

      labels[ 0 ][ orientation.maxSide ] = center - pad;
      labels[ 1 ][ orientation.minSide ] = center + pad;
    }
  }

  /**
   * Creates a partition label for the given orientation.
   * @private
   *
   * @param {Property.<Partition>} partitionProperty
   * @param {Property.<Partition>} secondaryPartitionProperty - The partition that is empty if there is only one
   * @param {number} index - The index of the partition
   * @param {Orientation} orientation
   * @returns {Node}
   */
  createPartitionLabel( partitionProperty, secondaryPartitionProperty, index, orientation ) {
    const text = new Text( '', {
      font: AreaModelCommonConstants.PROPORTIONAL_PARTITION_READOUT_FONT,
      fill: new DynamicProperty( partitionProperty, { derive: 'colorProperty' } )
    } );

    const labelContainer = new Node( {
      children: [ text ]
    } );

    // Text label
    new DynamicProperty( partitionProperty, {
      derive: 'sizeProperty'
    } ).link( size => {
      if ( size === null ) {
        text.string = '';
      }
      else {
        text.string = size.toRichString( false );
        text[ orientation.centerCoordinate ] = 0;
      }
    } );

    // Secondary coordinate
    if ( orientation === Orientation.HORIZONTAL ) {
      labelContainer.top = AreaModelCommonConstants.PROPORTIONAL_RANGE_OFFSET.y + 4;
    }
    else {
      labelContainer.left = AreaModelCommonConstants.PROPORTIONAL_RANGE_OFFSET.x + 6;
    }

    const partitionVisibleProperty = new DynamicProperty( partitionProperty, { derive: 'visibleProperty' } );
    const secondaryPartitionSizeProperty = new DynamicProperty( secondaryPartitionProperty, { derive: 'sizeProperty' } );

    Multilink.multilink(
      [ partitionVisibleProperty, secondaryPartitionSizeProperty ],
      ( visible, secondarySize ) => {
        labelContainer.visible = visible && secondarySize !== null;
      } );

    return labelContainer;
  }
}

areaModelCommon.register( 'ProportionalAreaDisplayNode', ProportionalAreaDisplayNode );

export default ProportionalAreaDisplayNode;