// Copyright 2016-2023, University of Colorado Boulder

/**
 * Model for the 'Shopping Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import apple_png from '../../../images/apple_png.js';
import carrot_png from '../../../images/carrot_png.js';
import purpleCandy_png from '../../../images/purpleCandy_png.js';
import Rate from '../../common/model/Rate.js';
import CandyScene from '../../shopping/model/CandyScene.js';
import FruitScene from '../../shopping/model/FruitScene.js';
import ShoppingCategory from '../../shopping/model/ShoppingCategory.js';
import ShoppingItemData from '../../shopping/model/ShoppingItemData.js';
import ShoppingModel from '../../shopping/model/ShoppingModel.js';
import VegetableScene from '../../shopping/model/VegetableScene.js';
import unitRates from '../../unitRates.js';

export default class ShoppingLabModel extends ShoppingModel {

  constructor() {

    super( {

      // unlike the 'Shopping' screen, each category in 'Shopping Lab' has only 1 associated item
      categories: [

        // fruits
        new ShoppingCategory( apple_png, [
          new FruitScene( ShoppingItemData.Fruit.APPLES, {
            rate: new Rate( 1, 1 ),
            denominatorOptions: {
              pickerColor: 'red'
            }
          } )
        ] ),

        // vegetables
        new ShoppingCategory( carrot_png, [
          new VegetableScene( ShoppingItemData.Vegetable.CARROTS, {
            rate: new Rate( 3, 4 ),
            denominatorOptions: {
              pickerColor: 'orange'
            }
          } )
        ] ),

        // candies
        new ShoppingCategory( purpleCandy_png, [
          new CandyScene( ShoppingItemData.Candy.PURPLE_CANDY, {
            rate: new Rate( 3, 2 ),
            denominatorOptions: {
              pickerColor: 'purple'
            }
          } )
        ] )
      ]
    } );
  }
}

unitRates.register( 'ShoppingLabModel', ShoppingLabModel );