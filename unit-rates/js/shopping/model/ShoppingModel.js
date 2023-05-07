// Copyright 2016-2023, University of Colorado Boulder

/**
 * Model for the 'Shopping' screen. Also used as the base type for the 'Shopping Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import apple_png from '../../../images/apple_png.js';
import carrot_png from '../../../images/carrot_png.js';
import purpleCandy_png from '../../../images/purpleCandy_png.js';
import unitRates from '../../unitRates.js';
import CandyScene from './CandyScene.js';
import FruitScene from './FruitScene.js';
import ShoppingCategory from './ShoppingCategory.js';
import ShoppingItemData from './ShoppingItemData.js';
import VegetableScene from './VegetableScene.js';

export default class ShoppingModel {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      categoryIndex: 0, // {number} index of the category that is initially selected
      categories: null // {ShoppingCategory[]} categories, populated below if not provided
    }, options );

    // @public (read-only) items are grouped into categories
    this.categories = options.categories || [

      // fruits
      new ShoppingCategory( apple_png, [
        new FruitScene( ShoppingItemData.Fruit.APPLES ),
        new FruitScene( ShoppingItemData.Fruit.LEMONS ),
        new FruitScene( ShoppingItemData.Fruit.ORANGES ),
        new FruitScene( ShoppingItemData.Fruit.PEARS )
      ] ),

      // vegetables
      new ShoppingCategory( carrot_png, [
        new VegetableScene( ShoppingItemData.Vegetable.CARROTS ),
        new VegetableScene( ShoppingItemData.Vegetable.CUCUMBERS ),
        new VegetableScene( ShoppingItemData.Vegetable.POTATOES ),
        new VegetableScene( ShoppingItemData.Vegetable.TOMATOES )
      ] ),

      // candies
      new ShoppingCategory( purpleCandy_png, [
        new CandyScene( ShoppingItemData.Candy.PURPLE_CANDY ),
        new CandyScene( ShoppingItemData.Candy.RED_CANDY ),
        new CandyScene( ShoppingItemData.Candy.GREEN_CANDY ),
        new CandyScene( ShoppingItemData.Candy.BLUE_CANDY )
      ] )
    ];

    // validate options
    assert && assert( options.categoryIndex >= 0 && options.categoryIndex < this.categories.length,
      `invalid categoryIndex: ${options.categoryIndex}` );

    // @public the selected category
    this.categoryProperty = new Property( this.categories[ options.categoryIndex ], {
      validValues: this.categories
    } );
  }

  // @public
  reset() {
    this.categoryProperty.reset();
    this.categories.forEach( category => category.reset() );
  }

  /**
   * Updates time-dependent parts of the model.
   * @param {number} dt - time since the previous step, in seconds
   * @public
   */
  step( dt ) {

    // Cap dt, see https://github.com/phetsims/unit-rates/issues/193
    dt = Math.min( dt, 0.1 );

    // step the selected category
    for ( let i = 0; i < this.categories.length; i++ ) {
      if ( this.categories[ i ] === this.categoryProperty.value ) {
        this.categories[ i ].step( dt );
        break;
      }
    }
  }
}

unitRates.register( 'ShoppingModel', ShoppingModel );