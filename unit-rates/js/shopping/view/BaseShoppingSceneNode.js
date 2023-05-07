// Copyright 2016-2023, University of Colorado Boulder

/**
 * View components that are specific to a scene in both the 'Shopping' and 'Shopping Lab' screens.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import ResetButton from '../../../../scenery-phet/js/buttons/ResetButton.js';
import { Node } from '../../../../scenery/js/imports.js';
import URColors from '../../common/URColors.js';
import URConstants from '../../common/URConstants.js';
import URQueryParameters from '../../common/URQueryParameters.js';
import DoubleNumberLineAccordionBox from '../../common/view/DoubleNumberLineAccordionBox.js';
import unitRates from '../../unitRates.js';
import BagNode from './BagNode.js';
import RowOfMovablesNode from './RowOfMovablesNode.js';
import ScaleNode from './ScaleNode.js';
import ShelfNode from './ShelfNode.js';
import ShoppingItemNode from './ShoppingItemNode.js';

export default class BaseShoppingSceneNode extends Node {
  /**
   * @param {ShoppingScene} shoppingScene
   * @param {Bounds2} layoutBounds
   * @param {KeypadLayer} keypadLayer
   * @param {ShoppingViewProperties} viewProperties
   * @param {Object} [options]
   */
  constructor( shoppingScene, layoutBounds, keypadLayer, viewProperties, options ) {

    options = merge( {
      extraCostDecimalVisible: false // {boolean} does the scale show an extra decimal place for cost?
    }, options );

    // Double number line, dispose required
    const doubleNumberLineAccordionBox = new DoubleNumberLineAccordionBox( shoppingScene.doubleNumberLine, shoppingScene.markerEditor, keypadLayer, {
      axisViewLength: URConstants.SHOPPING_AXIS_LENGTH,
      expandedProperty: viewProperties.doubleNumberLineExpandedProperty,
      left: layoutBounds.minX + URConstants.SCREEN_X_MARGIN,
      top: layoutBounds.minY + URConstants.SCREEN_Y_MARGIN
    } );

    // shelf, dispose required
    const shelfNode = new ShelfNode( shoppingScene.shelf );

    // scale, dispose required
    const scaleNode = new ScaleNode( shoppingScene.scale, {
      costExpandedProperty: viewProperties.scaleCostExpandedProperty,
      extraCostDecimalVisible: options.extraCostDecimalVisible,
      quantityIsDisplayed: shoppingScene.scaleQuantityIsDisplayed
    } );

    // button that resets the shelf to its initial state
    const resetShelfButton = new ResetButton( {
      listener: () => {
        dragLayer.interruptSubtreeInput();
        shoppingScene.resetShelfAndScale();
      },
      baseColor: URColors.resetShelfButton,
      scale: 0.65,
      touchAreaDilation: 5,
      right: scaleNode.left,
      top: scaleNode.bottom + 20
    } );

    // Disable the button when all bags are on the shelf
    const numberOfBagsObserver = numberOfBags => {
      resetShelfButton.enabled = ( numberOfBags !== shoppingScene.numberOfBags );
    };
    shoppingScene.shelf.numberOfBagsProperty.link( numberOfBagsObserver ); // unlink in dispose

    // layers for bags and items
    const dragLayer = new Node(); // all Nodes are in this layer while being dragged
    const bagLayer = new Node();  // the row of bags
    const frontItemLayer = new Node(); // the front row of items
    const backItemLayer = new Node(); // the back row of items

    // bags and items, dispose required
    const bagNodes = [];
    const itemNodes = [];
    let bagsOpen = false;
    shoppingScene.bags.forEach( bag => {

      // create the bag's Node, put it in the bag layer
      const bagNode = new BagNode( bag, shoppingScene.shelf, shoppingScene.scale, bagLayer, dragLayer );
      bagNodes.push( bagNode );
      bagLayer.addChild( bagNode );

      // optional items in the bag
      if ( bag.items ) {
        bagsOpen = true;
        bag.items.forEach( item => {

          // Create the item's Node. Adds itself to the proper layer, so there is no addChild here.
          const itemNode = new ShoppingItemNode( item, shoppingScene.shelf, shoppingScene.scale,
            frontItemLayer, backItemLayer, dragLayer );
          itemNodes.push( itemNode );
        } );
      }
    } );

    assert && assert( !options.children, 'decoration not supported' );
    options.children = [
      doubleNumberLineAccordionBox, scaleNode, shelfNode, resetShelfButton,
      bagLayer, backItemLayer, frontItemLayer, dragLayer
    ];

    super( options );

    // Debug: show the cells that bags and items can occupy on the shelf and scale
    if ( URQueryParameters.showCells ) {

      // cells for bags
      const bagRowOptions = { stroke: 'green' };
      this.addChild( new RowOfMovablesNode( shoppingScene.shelf.bagRow, bagRowOptions ) );
      this.addChild( new RowOfMovablesNode( shoppingScene.scale.bagRow, bagRowOptions ) );

      // cells for items
      if ( bagsOpen ) {
        const itemRowOptions = { stroke: 'blue' };
        this.addChild( new RowOfMovablesNode( shoppingScene.shelf.backItemRow, itemRowOptions ) );
        this.addChild( new RowOfMovablesNode( shoppingScene.shelf.frontItemRow, itemRowOptions ) );
        this.addChild( new RowOfMovablesNode( shoppingScene.scale.backItemRow, itemRowOptions ) );
        this.addChild( new RowOfMovablesNode( shoppingScene.scale.frontItemRow, itemRowOptions ) );
      }
    }

    // @private
    this.disposeBaseShoppingSceneNode = () => {

      shoppingScene.shelf.numberOfBagsProperty.unlink( numberOfBagsObserver );

      doubleNumberLineAccordionBox.dispose();
      shelfNode.dispose();
      scaleNode.dispose();
      bagNodes.forEach( node => node.dispose() );
      itemNodes.forEach( node => node.dispose() );
    };

    // @private
    this.dragLayer = dragLayer;

    // @protected for layout in subtypes
    this.doubleNumberLineAccordionBox = doubleNumberLineAccordionBox;
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeBaseShoppingSceneNode();
    super.dispose();
  }
}

unitRates.register( 'BaseShoppingSceneNode', BaseShoppingSceneNode );