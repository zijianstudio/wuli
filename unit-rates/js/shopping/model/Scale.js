// Copyright 2017-2023, University of Colorado Boulder

/**
 * Model of the scale.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import unitRates from '../../unitRates.js';
import ShoppingContainer from './ShoppingContainer.js';

export default class Scale extends ShoppingContainer {

  /**
   * @param {Property.<number>} unitRateProperty
   * @param {Object} [options]
   */
  constructor( unitRateProperty, options ) {

    options = merge( {

      position: new Vector2( 0, 0 ), // {Vector2} position of the center of the scale's top surface
      quantityUnits: '', // {string} units for quantity

      // ShoppingContainer options
      numberOfBags: 4, // {number} maximum number of bags on the scale
      bagSize: new Dimension2( 100, 100 ), // {number} dimensions of each bag
      quantityPerBag: 5, // {number} quantity in each bag
      bagRowYOffset: 5, // {number} offset of bag row from scale origin
      numberOfItems: 15, // {number} maximum number of items on the shelf
      itemSize: new Dimension2( 25, 25 ), // {number} dimensions of each item
      backRowYOffset: -4, // // {number} offset of items back row from scale origin
      frontRowYOffset: 12 // // {number} offset of items front row from scale origin

    }, options );

    super( options );

    // @public (read-only)
    this.quantityUnits = options.quantityUnits;

    // @public (read-only) description of pseudo-3D shape
    this.width = 350; // {number} diameter of the top platter
    this.height = 60; // {number} height of the front face
    this.depth = 45; // {number} depth, after flattening to 2D
    this.perspectiveXOffset = 30; // {number} offset for parallel perspective, after flattening to 2D

    // @public (read-only) any y value less than this is considered "above the scale"
    // Offset determined empirically, see https://github.com/phetsims/unit-rates/issues/174
    this.yAboveScale = this.position.y + 70;

    // @public
    this.quantityUpdateEnabled = true;

    // @public dispose not required, exists for sim lifetime
    this.quantityProperty = new DerivedProperty(
      [ this.numberOfBagsProperty, this.numberOfItemsProperty ],
      ( numberOfBags, numberOfItems ) => {
        if ( this.quantityUpdateEnabled ) {
          return ( numberOfBags * options.quantityPerBag ) + numberOfItems;
        }
        else {
          return this.quantityProperty.value;
        }
      } );

    // @public dispose not required, exists for sim lifetime
    this.costProperty = new DerivedProperty(
      [ this.quantityProperty, unitRateProperty ],
      ( quantity, unitRate ) => quantity * unitRate
    );
  }
}

unitRates.register( 'Scale', Scale );