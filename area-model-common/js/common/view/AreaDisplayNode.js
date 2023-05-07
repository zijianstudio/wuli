// Copyright 2017-2022, University of Colorado Boulder

/**
 * Supertype for view of AreaDisplay objects.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonStrings from '../../AreaModelCommonStrings.js';
import AreaModelCommonConstants from '../AreaModelCommonConstants.js';
import OrientationPair from '../model/OrientationPair.js';
import PartialProductsChoice from '../model/PartialProductsChoice.js';
import AreaModelCommonColors from './AreaModelCommonColors.js';
import PartialProductLabelNode from './PartialProductLabelNode.js';
import PoolableLayerNode from './PoolableLayerNode.js';
import RangeLabelNode from './RangeLabelNode.js';

const eraseString = AreaModelCommonStrings.a11y.erase;
const eraseDescriptionString = AreaModelCommonStrings.a11y.eraseDescription;
const horizontalDimensionCapitalizedString = AreaModelCommonStrings.a11y.horizontalDimensionCapitalized;
const onePartialProductFactorPatternString = AreaModelCommonStrings.a11y.onePartialProductFactorPattern;
const onePartialProductPatternString = AreaModelCommonStrings.a11y.onePartialProductPattern;
const productTimesPatternString = AreaModelCommonStrings.a11y.productTimesPattern;
const threePartitionsSplitPatternString = AreaModelCommonStrings.a11y.threePartitionsSplitPattern;
const twoPartialProductFactorsPatternString = AreaModelCommonStrings.a11y.twoPartialProductFactorsPattern;
const twoPartialProductsPatternString = AreaModelCommonStrings.a11y.twoPartialProductsPattern;
const twoPartitionsSplitPatternString = AreaModelCommonStrings.a11y.twoPartitionsSplitPattern;
const verticalDimensionCapitalizedString = AreaModelCommonStrings.a11y.verticalDimensionCapitalized;

class AreaDisplayNode extends Node {
  /**
   * @param {AreaDisplay} areaDisplay
   * @param {Property.<PartialProductsChoice>} partialProductsChoiceProperty
   * @param {Object} [options]
   */
  constructor( areaDisplay, partialProductsChoiceProperty, options ) {
    options = merge( {

      // These do not change for a given AreaDisplayNode
      allowExponents: false,
      isProportional: false,
      useLargeArea: false
    }, options );

    super();

    // @public {AreaDisplay}
    this.areaDisplay = areaDisplay;

    // @public {Node} - Layers (a11y)
    this.pdomParagraphNode = new Node( {
      tagName: 'p'
    } );
    this.areaLayer = new Node();
    this.labelLayer = new Node();

    this.addChild( this.pdomParagraphNode );
    this.addChild( this.areaLayer );
    this.addChild( this.labelLayer );

    // @public {number}
    this.viewSize = options.useLargeArea ? AreaModelCommonConstants.LARGE_AREA_SIZE : AreaModelCommonConstants.AREA_SIZE;

    // A11y description for the partitions for each orientation
    const accessiblePartitionNodes = OrientationPair.create( orientation => {
      const partitionLabel = new Node( {
        tagName: 'span'
      } );
      Multilink.multilink( [
        areaDisplay.partitionsProperties.get( orientation ),
        areaDisplay.totalProperties.get( orientation )
      ], ( partitions, total ) => {
        partitions = partitions.filter( partition => partition.sizeProperty.value !== null && partition.visibleProperty.value === true );
        if ( partitions.length < 2 || total === null ) {
          partitionLabel.innerContent = '';
        }
        else if ( partitions.length === 2 ) {
          partitionLabel.innerContent = StringUtils.fillIn( twoPartitionsSplitPatternString, {
            partition: orientation === Orientation.HORIZONTAL ? horizontalDimensionCapitalizedString : verticalDimensionCapitalizedString,
            size: total.toRichString(),
            size1: partitions[ 0 ].sizeProperty.value.toRichString( false ),
            size2: partitions[ 1 ].sizeProperty.value.toRichString( false )
          } );
        }
        else if ( partitions.length === 3 ) {
          partitionLabel.innerContent = StringUtils.fillIn( threePartitionsSplitPatternString, {
            partition: orientation === Orientation.HORIZONTAL ? horizontalDimensionCapitalizedString : verticalDimensionCapitalizedString,
            size: total.toRichString(),
            size1: partitions[ 0 ].sizeProperty.value.toRichString( false ),
            size2: partitions[ 1 ].sizeProperty.value.toRichString( false ),
            size3: partitions[ 2 ].sizeProperty.value.toRichString( false )
          } );
        }
        else {
          throw new Error( 'unexpected number of partitions for a11y' );
        }
      } );
      return partitionLabel;
    } );
    this.pdomParagraphNode.addChild( accessiblePartitionNodes.vertical );
    this.pdomParagraphNode.addChild( accessiblePartitionNodes.horizontal );

    // A11y description for the partial products
    const accessiblePartialProductNode = new Node( {
      tagName: 'span'
    } );
    let accessiblePartialMultilink = null;
    areaDisplay.partitionedAreasProperty.link( partitionedAreas => {
      if ( accessiblePartialMultilink ) {
        accessiblePartialMultilink.dispose();
      }
      const properties = [
        partialProductsChoiceProperty
      ].concat( partitionedAreas.map( partitionedArea => partitionedArea.areaProperty ) )
        .concat( partitionedAreas.map( partitionedArea => partitionedArea.visibleProperty ) );
      accessiblePartialMultilink = Multilink.multilink( properties, () => {
        const activePartitionedAreas = areaDisplay.partitionedAreasProperty.value.filter( partitionedArea => partitionedArea.visibleProperty.value &&
                                                                                                             partitionedArea.areaProperty.value !== null &&
                                                                                                             partitionedArea.partitions.vertical.sizeProperty.value !== null &&
                                                                                                             partitionedArea.partitions.horizontal.sizeProperty.value !== null );
        const fillObject = {};
        let fillString;
        if ( activePartitionedAreas.length > 2 ||
             activePartitionedAreas.length === 0 ||
             partialProductsChoiceProperty.value === PartialProductsChoice.HIDDEN ) {
          accessiblePartialProductNode.innerContent = '';
        }
        else if ( partialProductsChoiceProperty.value === PartialProductsChoice.PRODUCTS ) {
          fillString = onePartialProductPatternString;
          fillObject.first = activePartitionedAreas[ 0 ].areaProperty.value.toRichString( false );

          if ( activePartitionedAreas.length === 2 ) {
            fillString = twoPartialProductsPatternString;
            fillObject.second = activePartitionedAreas[ 1 ].areaProperty.value.toRichString( false );
          }

          accessiblePartialProductNode.innerContent = StringUtils.fillIn( fillString, fillObject );
        }
        else if ( partialProductsChoiceProperty.value === PartialProductsChoice.FACTORS ) {
          fillString = onePartialProductFactorPatternString;
          fillObject.first = StringUtils.fillIn( productTimesPatternString, {
            left: activePartitionedAreas[ 0 ].partitions.vertical.sizeProperty.value.toRichString( false ),
            right: activePartitionedAreas[ 0 ].partitions.horizontal.sizeProperty.value.toRichString( false )
          } );

          if ( activePartitionedAreas.length === 2 ) {
            fillString = twoPartialProductFactorsPatternString;
            fillObject.second = StringUtils.fillIn( productTimesPatternString, {
              left: activePartitionedAreas[ 1 ].partitions.vertical.sizeProperty.value.toRichString( false ),
              right: activePartitionedAreas[ 1 ].partitions.horizontal.sizeProperty.value.toRichString( false )
            } );
          }

          accessiblePartialProductNode.innerContent = StringUtils.fillIn( fillString, fillObject );
        }
        else {
          throw new Error( 'unknown situation for a11y partial products' );
        }
      } );
    } );
    this.pdomParagraphNode.addChild( accessiblePartialProductNode );

    const modelBoundsProperty = new DerivedProperty( [ areaDisplay.coordinateRangeMaxProperty ], coordinateRangeMax => new Bounds2( 0, 0, coordinateRangeMax, coordinateRangeMax ) );
    const viewBounds = new Bounds2( 0, 0, this.viewSize, this.viewSize );

    // @protected {Property.<ModelViewTransform2>} - Maps from coordinate range values to view values.
    this.modelViewTransformProperty = new DerivedProperty( [ modelBoundsProperty ], modelBounds => ModelViewTransform2.createRectangleMapping( modelBounds, viewBounds ) );

    // Dimension line views
    Orientation.enumeration.values.forEach( orientation => {
      const colorProperty = this.areaDisplay.colorProperties.get( orientation );
      const termListProperty = this.areaDisplay.displayProperties.get( orientation );
      const tickPositionsProperty = new DerivedProperty(
        [ areaDisplay.partitionBoundariesProperties.get( orientation ) ],
        partitionBoundaries => partitionBoundaries.map( boundary => orientation.modelToView( this.modelViewTransformProperty.value, boundary ) ) );
      this.labelLayer.addChild( new RangeLabelNode(
        termListProperty,
        orientation,
        tickPositionsProperty,
        colorProperty,
        options.isProportional
      ) );
    } );

    // @private {boolean} - Whether we need to update the labels. It's expensive, so we only do it at most once a frame.
    this.productPositionLabelsDirty = true;
    const invalidateProductLabels = () => {
      this.productPositionLabelsDirty = true;
    };

    // @protected {Array.<PartialProductLabelNode>}
    this.productLabels = [];

    // Create pooled partial product labels
    this.labelLayer.addChild( new PoolableLayerNode( {
      usedArray: this.productLabels,
      updatedCallback: invalidateProductLabels,
      arrayProperty: areaDisplay.partitionedAreasProperty,
      createNode: partitionedArea => new PartialProductLabelNode(
        partialProductsChoiceProperty,
        new Property( partitionedArea ),
        options.allowExponents
      ),
      getItemProperty: productLabel => productLabel.partitionedAreaProperty
    } ) );

    // Note this needs to be linked after the product labels are created, so the order dependency works
    areaDisplay.allPartitionsProperty.link( ( newAllPartitions, oldAllPartitions ) => {
      oldAllPartitions && oldAllPartitions.forEach( partition => {
        partition.coordinateRangeProperty.unlink( invalidateProductLabels );
      } );
      newAllPartitions.forEach( partition => {
        partition.coordinateRangeProperty.lazyLink( invalidateProductLabels );
      } );

      invalidateProductLabels();
    } );

    // Also invalidate our label positions when the label type changes.
    // See https://github.com/phetsims/area-model-common/issues/109
    partialProductsChoiceProperty.lazyLink( invalidateProductLabels );

    // Do it once initially for proper layout at the start
    this.positionProductLabels();

    // @public {Node} - Exposed publicly for a11y, and used in subclasses
    this.eraseButton = new EraserButton( {
      listener: () => {
        areaDisplay.areaProperty.value.erase();
      },
      center: options.isProportional
              ? AreaModelCommonConstants.PROPORTIONAL_RANGE_OFFSET
              : AreaModelCommonConstants.GENERIC_RANGE_OFFSET,
      touchAreaXDilation: 8,
      touchAreaYDilation: 8,

      // pdom
      innerContent: eraseString,
      descriptionContent: eraseDescriptionString
    } );

    // @protected {Node}
    this.backgroundNode = new Rectangle( 0, 0, this.viewSize, this.viewSize, {
      fill: AreaModelCommonColors.areaBackgroundProperty
    } );

    // @protected {Node}
    this.borderNode = new Rectangle( 0, 0, this.viewSize, this.viewSize, {
      stroke: AreaModelCommonColors.areaBorderProperty
    } );

    this.labelLayer.addChild( this.eraseButton );
  }

  /**
   * Updates expensive-to-update things only once a frame (for performance).
   * @public
   */
  update() {
    if ( !this.productPositionLabelsDirty ) { return; }
    this.productPositionLabelsDirty = false;

    this.positionProductLabels();
  }

  /**
   * Positions all of the partial products labels.
   * @protected
   */
  positionProductLabels() {
    throw new Error( 'abstract method' );
  }
}

areaModelCommon.register( 'AreaDisplayNode', AreaDisplayNode );

export default AreaDisplayNode;
