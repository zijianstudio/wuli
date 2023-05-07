// Copyright 2017-2022, University of Colorado Boulder

/**
 * View for GenericArea.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import { Line, Node } from '../../../../scenery/js/imports.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import AreaDisplayNode from '../../common/view/AreaDisplayNode.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';
import PoolableLayerNode from '../../common/view/PoolableLayerNode.js';
import GenericPartitionedAreaNode from './GenericPartitionedAreaNode.js';
import PartitionSizeEditNode from './PartitionSizeEditNode.js';
import TermKeypadPanel from './TermKeypadPanel.js';

class GenericAreaDisplayNode extends AreaDisplayNode {
  /**
   * @param {GenericAreaDisplay} areaDisplay
   * @param {boolean} allowExponents - Whether the user is able to add powers of x.
   * @param {Property.<PartialProductsChoice>} partialProductsChoiceProperty
   * @param {Object} [nodeOptions]
   */
  constructor( areaDisplay, allowExponents, partialProductsChoiceProperty, nodeOptions ) {
    assert && assert( typeof allowExponents === 'boolean' );
    assert && assert( partialProductsChoiceProperty instanceof ReadOnlyProperty );

    super( areaDisplay, partialProductsChoiceProperty, {
      allowExponents: allowExponents,
      isProportional: false
    } );

    this.areaLayer.addChild( this.backgroundNode );

    // Sign-colored partition area backgrounds (effectively pooled)
    this.areaLayer.addChild( new PoolableLayerNode( {
      arrayProperty: areaDisplay.partitionedAreasProperty,
      createNode: partitionedArea => new GenericPartitionedAreaNode( new Property( partitionedArea ), this.modelViewTransformProperty ),
      getItemProperty: partitionedAreaNode => partitionedAreaNode.partitionedAreaProperty
    } ) );

    this.areaLayer.addChild( this.borderNode );

    // Partition lines
    this.areaLayer.addChild( GenericAreaDisplayNode.createPartitionLines( areaDisplay.layoutProperty, this.viewSize ) );

    // Edit readouts/buttons
    this.labelLayer.addChild( new PoolableLayerNode( {
      arrayProperty: areaDisplay.allPartitionsProperty,
      createNode: partition => new PartitionSizeEditNode(
        areaDisplay.activePartitionProperty,
        new Property( partition ),
        this.modelViewTransformProperty,
        allowExponents
      ),
      getItemProperty: editNode => editNode.partitionProperty
    } ) );

    // Keypad
    const digitCountProperty = new DerivedProperty( [ areaDisplay.activePartitionProperty ], activePartition => activePartition === null ? 1 : activePartition.digitCount );
    const termKeypadPanel = new TermKeypadPanel( digitCountProperty, allowExponents, true, term => {
      // Update the size of the partition.
      areaDisplay.activePartitionProperty.value.sizeProperty.value = term;

      // Hide the keypad.
      areaDisplay.activePartitionProperty.value = null;
    }, {
      x: this.viewSize + AreaModelCommonConstants.KEYPAD_LEFT_PADDING,
      centerY: this.viewSize / 2
    } );
    this.labelLayer.addChild( termKeypadPanel );

    // If this changes, we clear and switch to it
    areaDisplay.activePartitionProperty.link( newArea => {
      termKeypadPanel.visible = newArea !== null;
      termKeypadPanel.clear();
    } );

    this.mutate( nodeOptions );
  }

  /**
   * Positions all of the partial products labels.
   * @protected
   * @override
   */
  positionProductLabels() {
    this.productLabels.forEach( productLabel => {
      Orientation.enumeration.values.forEach( orientation => {
        const range = productLabel.partitionedAreaProperty.value.partitions.get( orientation ).coordinateRangeProperty.value;
        if ( range !== null ) {
          productLabel[ orientation.coordinate ] = orientation.modelToView( this.modelViewTransformProperty.value, range.getCenter() );
        }
      } );
    } );
  }

  /**
   * Creates a partition line (view only)
   * @private
   *
   * @param {Orientation} orientation
   * @param {number} offset
   * @param {number} viewSize - In view units, the size of the main area
   * @param {Property.<boolean>} visibilityProperty
   */
  static createPartitionLine( orientation, offset, viewSize, visibilityProperty ) {
    const firstPoint = new Vector2( 0, 0 );
    const secondPoint = new Vector2( 0, 0 );

    firstPoint[ orientation.coordinate ] = offset;
    secondPoint[ orientation.coordinate ] = offset;
    firstPoint[ orientation.opposite.coordinate ] = viewSize;
    secondPoint[ orientation.opposite.coordinate ] = 0;

    const line = new Line( {
      p1: firstPoint,
      p2: secondPoint,
      stroke: AreaModelCommonColors.partitionLineStrokeProperty
    } );
    visibilityProperty.linkAttribute( line, 'visible' );
    return line;
  }

  /**
   * Creates a set of generic partition lines.
   * @public
   *
   * @param {Property.<GenericLayout>} layoutProperty
   * @param {number} viewSize
   * @returns {Node}
   */
  static createPartitionLines( layoutProperty, viewSize ) {
    const singleOffset = viewSize * AreaModelCommonConstants.GENERIC_SINGLE_OFFSET;
    const firstOffset = viewSize * AreaModelCommonConstants.GENERIC_FIRST_OFFSET;
    const secondOffset = viewSize * AreaModelCommonConstants.GENERIC_SECOND_OFFSET;

    const resultNode = new Node();

    Orientation.enumeration.values.forEach( orientation => {
      const hasTwoProperty = new DerivedProperty( [ layoutProperty ], layout => layout.getPartitionQuantity( orientation ) === 2 );
      const hasThreeProperty = new DerivedProperty( [ layoutProperty ], layout => layout.getPartitionQuantity( orientation ) === 3 );

      const singleLine = GenericAreaDisplayNode.createPartitionLine( orientation, singleOffset, viewSize, hasTwoProperty );
      const firstLine = GenericAreaDisplayNode.createPartitionLine( orientation, firstOffset, viewSize, hasThreeProperty );
      const secondLine = GenericAreaDisplayNode.createPartitionLine( orientation, secondOffset, viewSize, hasThreeProperty );
      resultNode.addChild( singleLine );
      resultNode.addChild( firstLine );
      resultNode.addChild( secondLine );
    } );

    return resultNode;
  }
}

areaModelCommon.register( 'GenericAreaDisplayNode', GenericAreaDisplayNode );

export default GenericAreaDisplayNode;