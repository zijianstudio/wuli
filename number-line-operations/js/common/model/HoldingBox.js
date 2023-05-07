// Copyright 2020-2021, University of Colorado Boulder

/**
 * HoldingBox is the area in the model where items that have value (assets, debts, chips, and such) hang out when not in
 * use. It is basically just a rectangular space that keeps track of where things go within it.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import numberLineOperations from '../../numberLineOperations.js';

class HoldingBox {

  /**
   * @param {Vector2} position - position in model space of the rectangle's upper left corner
   * @param {Dimension2} size
   * @param {ValueItem[]} items
   */
  constructor( position, size, items ) {

    // @public (read-only)
    this.rectangleBounds = new Bounds2(
      position.x,
      position.y,
      position.x + size.width,
      position.y + size.height
    );

    // map of items to storage positions, populated below
    this.mapOfItemsToStoragePositions = new Map();

    // Position each of the items and remember where each one goes when returned.
    const interItemSpacing = size.height / items.length;
    const yPositionOffset = interItemSpacing / 2;
    items.forEach( ( item, index ) => {
      item.teleportTo( new Vector2(
        this.rectangleBounds.centerX,
        this.rectangleBounds.minY + yPositionOffset + index * interItemSpacing
      ) );
      this.mapOfItemsToStoragePositions.set( item, item.positionProperty.value );
    } );
  }

  /**
   * Return the provided item to its original position within this box.
   * @param {ValueItem }item
   * @param {boolean} animate
   * @public
   */
  returnItem( item, animate ) {

    const storagePosition = this.mapOfItemsToStoragePositions.get( item );
    assert && assert( storagePosition, 'the provided item does not go in this box' );
    if ( animate ) {
      item.animateTo( storagePosition );
    }
    else {
      item.teleportTo( storagePosition );
    }
  }

  /**
   * Returns true if this box holds the provided item.
   * @param {ValueItem} item
   * @returns {boolean}
   * @public
   */
  holdsItem( item ) {
    return this.mapOfItemsToStoragePositions.get( item ) !== undefined;
  }
}

numberLineOperations.register( 'HoldingBox', HoldingBox );
export default HoldingBox;