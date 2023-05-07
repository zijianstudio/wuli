// Copyright 2020-2021, University of Colorado Boulder


/**
 * HoldingBag is the area in the model where items that have value can be held.  Vague, I admit, but that's what it is.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import numberLineOperations from '../../numberLineOperations.js';

// constants
const RADIUS = 125;

// stock item acceptance tests
const ACCEPT_EVERYTHING = () => true;
const ACCEPT_ONLY_POSITIVE_VALUES = valueItem => valueItem.value > 0;
const ACCEPT_ONLY_NEGATIVE_VALUES = valueItem => valueItem.value < 0;

class HoldingBag {

  /**
   * @param {Vector2} position - position in model space of the center of the circular storage area
   * @param {Object} [options]
   */
  constructor( position, options ) {

    options = merge( {

      // @function - a predicate that defines what sort of items this can hold
      itemAcceptanceTest: ACCEPT_EVERYTHING,

      // @number - the maximum number of items that this bag can hold
      capacity: 4

    }, options );

    // options validation
    assert && assert( options.capacity >= 4 && options.capacity <= 5, `unsupported capacity: ${options.capacity}` );

    // @public (read-only)
    this.position = position;

    // @public (read-only)
    this.radius = RADIUS;

    // @public (read-only) {ValueItem[]} - value items that are currently in this bag, use methods to access
    this.containedItemList = [];

    // @private
    this.itemAcceptanceTest = options.itemAcceptanceTest;
    this.capacity = options.capacity;

    // @private {Vector2[]} - positions where items can be placed within the bag
    this.possibleItemPositions = [];
    if ( this.capacity === 4 ) {

      // Several of the factors in the position calculation were empirically determined based on the artwork of the
      // items and the bag and can be adjust if needed when things change.
      _.times( this.capacity, index => {
        const xPosition = this.position.x;
        const yPosition = this.position.y - ( this.radius * 0.3 ) + index * this.radius * 0.33;
        this.possibleItemPositions.push( new Vector2( xPosition, yPosition ) );
      } );
    }
    else if ( this.capacity === 5 ) {

      // Several of the factors in the position calculation were empirically determined based on the size of the items
      // that go with this capacity and the artwork for the bag.  These can be adjust if needed when things change.
      _.times( this.capacity, index => {
        let xPosition;
        let yPosition;
        if ( index === 0 ) {
          xPosition = this.position.x;
          yPosition = this.position.y - ( this.radius * 0.35 );
        }
        else {
          xPosition = this.position.x + ( index % 2 ? -1 : 1 ) * this.radius * 0.35;
          yPosition = this.position.y + Math.sign( index - 2.5 ) * this.radius * 0.25 + this.radius * 0.25;
        }
        this.possibleItemPositions.push( new Vector2( xPosition, yPosition ) );
      } );
    }
  }

  /**
   * Test if this bag accepts this type of item.
   * @param {ValueItem }item
   * @public
   */
  acceptsItem( item ) {
    return this.itemAcceptanceTest( item );
  }

  /**
   * Add the provide item to this bag.
   * @param {ValueItem} item
   * @public
   */
  addItem( item ) {
    assert && assert( this.itemAcceptanceTest( item ), 'this bag does not accept this type of item' );
    assert && assert( this.containedItemList.indexOf( item ) === -1, 'item is already in bag' );
    assert && assert( this.containedItemList.length < this.capacity, 'there is insufficient space in bag for this item' );
    this.containedItemList.push( item );
    item.inBagProperty.set( true );
    this.moveNewItemIntoPosition( item );
  }

  /**
   * Remove an item from this bag.
   * @param {ValueItem} item
   * @public
   */
  removeItem( item ) {
    assert && assert( this.containedItemList.indexOf( item ) !== -1, 'item is not in bag' );
    this.containedItemList = _.without( this.containedItemList, item );
    item.inBagProperty.set( false );

    // The design team decided to consolidate the items in the bag when there are 4, but not to do so when there are 5.
    // This was made for purely aesthetic purposes, and can be changed or made configurable if desired.
    if ( this.capacity === 4 ) {
      this.consolidateItems();
    }
  }

  /**
   * @param {ValueItem} item
   * @returns {boolean}
   * @public
   */
  containsItem( item ) {
    return this.containedItemList.indexOf( item ) !== -1;
  }

  /**
   * @returns {number} - total value of the items currently in this bag
   * @public
   */
  getTotalValue() {
    return this.containedItemList.reduce( ( total, item ) => total + item.value, 0 );
  }

  /**
   * Test whether a value item is within the "capture range" of this bag.
   * @param {ValueItem} item
   * @returns {boolean}
   * @public
   */
  isWithinCaptureRange( item ) {
    return item.positionProperty.value.distance( this.position ) <= this.radius;
  }

  /**
   * Move a newly added item into the correct position.  This assumes that the item has already been added to the list
   * of contained items and just needs to be moved into place.
   * @param newItem
   * @private
   */
  moveNewItemIntoPosition( newItem ) {

    const itemIndex = this.containedItemList.indexOf( newItem );
    assert && assert( itemIndex >= 0, 'item is not contained (must be added before calling this method)' );
    assert && assert( this.containedItemList.length <= this.capacity, 'too many items in bag' );
    if ( this.capacity === 4 ) {
      newItem.animateTo( this.possibleItemPositions[ itemIndex ] );
    }
    else if ( this.capacity === 5 ) {

      // Find the first unoccupied position.
      const firstUnoccupiedPosition = this.possibleItemPositions.find( position => {
        return this.containedItemList.find( item => item.positionProperty.value.equals( position ) ) === undefined;
      } );
      newItem.animateTo( firstUnoccupiedPosition );
    }
  }

  /**
   * Adjust the positions of the items in this bag such that the unoccupied positions are all at the end of the position
   * list.
   * @private
   */
  consolidateItems() {

    this.containedItemList.forEach( ( item, index ) => {
      const position = this.possibleItemPositions[ index ];
      if ( !item.positionProperty.value.equals( this.possibleItemPositions[ index ] ) ) {
        item.animateTo( position );
      }
    } );
  }
}

HoldingBag.ACCEPT_ONLY_POSITIVE_VALUES = ACCEPT_ONLY_POSITIVE_VALUES;
HoldingBag.ACCEPT_ONLY_NEGATIVE_VALUES = ACCEPT_ONLY_NEGATIVE_VALUES;

numberLineOperations.register( 'HoldingBag', HoldingBag );
export default HoldingBag;