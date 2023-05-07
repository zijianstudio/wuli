// Copyright 2017-2023, University of Colorado Boulder

/**
 * Container for bags and shopping items, used as the base type for Shelf and Scale.
 * Provides 1 row of bags, and 2 rows of shopping items (front and back).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import unitRates from '../../unitRates.js';
import Bag from './Bag.js';
import RowOfMovables from './RowOfMovables.js';
import ShoppingItem from './ShoppingItem.js';

export default class ShoppingContainer {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {

      position: new Vector2( 0, 0 ), // {Vector2} position of the container

      // bags
      numberOfBags: 4, // {number} maximum number of bags on the shelf
      bagSize: new Dimension2( 100, 100 ), // {number} dimensions of each bag
      bagRowYOffset: 0, // {number} offset of bag row from the container's origin

      // items
      itemSize: new Dimension2( 10, 10 ), // {number} dimensions of each item
      itemCellSpacing: 8, // {number} horizontal spacing between cells in each row
      backRowYOffset: 0, // {number} offset of items front row from the container's origin
      frontRowYOffset: 0 // {number} offset of items back row from the container's origin

    }, options );

    // @public (read-only)
    this.position = options.position;

    // @public row of bags, dispose not required, exists for sim lifetime
    this.bagRow = new RowOfMovables( {
      position: new Vector2( options.position.x, options.position.y + options.bagRowYOffset ),
      numberOfCells: options.numberOfBags,
      cellSize: options.bagSize,

      // These values were determined empirically, to look visually pleasing.
      // For fruit, the spacing affects how cells are populated when bags open to reveal items.
      cellSpacing: ( options.numberOfBags < 4 ) ? 25 : 15
    } );

    // Back row has 1 more cell than front row
    const backNumberOfCells = Math.floor( options.numberOfItems / 2 ) + 1;
    const frontNumberOfCells = options.numberOfItems - backNumberOfCells;
    assert && assert( backNumberOfCells + frontNumberOfCells === options.numberOfItems );

    // @public back row of items, dispose not required, exists for sim lifetime
    this.backItemRow = new RowOfMovables( {
      position: new Vector2( options.position.x, options.position.y + options.backRowYOffset ),
      numberOfCells: backNumberOfCells,
      cellSize: options.itemSize,
      cellSpacing: options.itemCellSpacing
    } );

    // @public front row of items, dispose not required, exists for sim lifetime
    this.frontItemRow = new RowOfMovables( {
      position: new Vector2( options.position.x, options.position.y + options.frontRowYOffset ),
      numberOfCells: frontNumberOfCells,
      cellSize: options.itemSize,
      cellSpacing: options.itemCellSpacing
    } );

    // @public dispose not required, exists for sim lifetime
    this.numberOfBagsProperty = new DerivedProperty(
      [ this.bagRow.numberOfMovablesProperty ],
      numberOfMovables => numberOfMovables
    );

    // @public dispose not required, exists for sim lifetime
    this.numberOfItemsProperty = new DerivedProperty(
      [ this.frontItemRow.numberOfMovablesProperty, this.backItemRow.numberOfMovablesProperty ],
      ( frontNumberOfMovables, backNumberOfMovables ) => frontNumberOfMovables + backNumberOfMovables
    );
  }

  // @public
  reset() {
    this.bagRow.reset();
    this.backItemRow.reset();
    this.frontItemRow.reset();
  }

  /**
   * @param {Bag} bag
   * @returns {boolean}
   * @public
   */
  containsBag( bag ) {
    assert && assert( bag instanceof Bag );
    return this.bagRow.contains( bag );
  }

  /**
   * @param {ShoppingItem} item
   * @returns {boolean}
   * @public
   */
  containsItem( item ) {
    assert && assert( item instanceof ShoppingItem );
    return ( this.backItemRow.contains( item ) || this.frontItemRow.contains( item ) );
  }

  /**
   * Removes a bag.
   * @param {Bag} bag
   * @public
   */
  removeBag( bag ) {
    assert && assert( bag instanceof Bag );
    assert && assert( this.containsBag( bag ), 'does not contain bag' );
    this.bagRow.remove( bag );

    // Make the bag move up a few pixels, to make it obvious that it has been removed.
    // See https://github.com/phetsims/unit-rates/issues/187
    bag.moveTo( bag.positionProperty.value.plusXY( 0, -5 ) );
  }

  /**
   * Removes an item.
   * @param {ShoppingItem} item
   * @public
   */
  removeItem( item ) {
    assert && assert( item instanceof ShoppingItem );
    assert && assert( this.containsItem( item ), 'does not contain item' );

    if ( this.backItemRow.contains( item ) ) {
      this.backItemRow.remove( item );
    }
    else {
      this.frontItemRow.remove( item );
    }

    // Make the item move up a few pixels, to make it obvious that it has been removed.
    // See https://github.com/phetsims/unit-rates/issues/187
    item.moveTo( item.positionProperty.value.plusXY( 0, -5 ) );
  }

  /**
   * Is the specific item in the front row?
   * @param {ShoppingItem} item
   * @returns {boolean}
   * @public
   */
  isItemInFrontRow( item ) {
    return this.frontItemRow.contains( item );
  }
}

unitRates.register( 'ShoppingContainer', ShoppingContainer );