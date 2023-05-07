// Copyright 2017-2023, University of Colorado Boulder

/**
 * View of a shopping item.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Image } from '../../../../scenery/js/imports.js';
import URConstants from '../../common/URConstants.js';
import unitRates from '../../unitRates.js';
import ShoppingItemDragListener from './ShoppingItemDragListener.js';

export default class ShoppingItemNode extends Image {

  /**
   * @param {ShoppingItem} item
   * @param {Shelf} shelf
   * @param {Scale} scale
   * @param {Node} frontItemLayer
   * @param {Node} backItemLayer
   * @param {Node} dragLayer
   */
  constructor( item, shelf, scale, frontItemLayer, backItemLayer, dragLayer ) {

    // This type does not propagate options to the supertype because the model determines position.
    super( item.image, {
      scale: URConstants.SHOPPING_ITEM_IMAGE_SCALE,
      cursor: 'pointer'
    } );

    // origin is at bottom center
    const positionObserver = position => {
      this.centerX = position.x;
      this.bottom = position.y;
    };
    item.positionProperty.link( positionObserver ); // unlink in dispose

    const visibleObserver = visible => {
      this.visible = visible;
      if ( visible ) {
        this.getParent() && this.getParent().removeChild( this );

        // put the Node in the proper layer
        if ( shelf.isItemInFrontRow( item ) || scale.isItemInFrontRow( item ) ) {
          frontItemLayer.addChild( this );
        }
        else {
          backItemLayer.addChild( this );
        }
      }
    };
    item.visibleProperty.link( visibleObserver ); // unlink in dispose

    const dragListener = new ShoppingItemDragListener( this, item, shelf, scale, frontItemLayer, backItemLayer, dragLayer );
    this.addInputListener( dragListener ); // removeInputListener in dispose

    // @private
    this.disposeShoppingItemNode = () => {
      item.positionProperty.unlink( positionObserver );
      item.visibleProperty.unlink( visibleObserver );
      this.removeInputListener( dragListener );
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeShoppingItemNode();
    super.dispose();
  }
}

unitRates.register( 'ShoppingItemNode', ShoppingItemNode );