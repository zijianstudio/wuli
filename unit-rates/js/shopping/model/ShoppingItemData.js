// Copyright 2016-2022, University of Colorado Boulder

/**
 * Data structures that describe item types in the 'Shopping' screen.
 * These data structures are used to instantiate instances of ShoppingItem and its subtypes.
 * Using a data structure like this is an alternative to having a large number of constructor parameters.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import apple_png from '../../../images/apple_png.js';
import appleBag_png from '../../../images/appleBag_png.js';
import blueCandy_png from '../../../images/blueCandy_png.js';
import blueCandyBag_png from '../../../images/blueCandyBag_png.js';
import carrot_png from '../../../images/carrot_png.js';
import carrotBag_png from '../../../images/carrotBag_png.js';
import cucumber_png from '../../../images/cucumber_png.js';
import cucumberBag_png from '../../../images/cucumberBag_png.js';
import greenCandy_png from '../../../images/greenCandy_png.js';
import greenCandyBag_png from '../../../images/greenCandyBag_png.js';
import lemon_png from '../../../images/lemon_png.js';
import lemonBag_png from '../../../images/lemonBag_png.js';
import orange_png from '../../../images/orange_png.js';
import orangeBag_png from '../../../images/orangeBag_png.js';
import pear_png from '../../../images/pear_png.js';
import pearBag_png from '../../../images/pearBag_png.js';
import potato_png from '../../../images/potato_png.js';
import potatoBag_png from '../../../images/potatoBag_png.js';
import purpleCandy_png from '../../../images/purpleCandy_png.js';
import purpleCandyBag_png from '../../../images/purpleCandyBag_png.js';
import redCandy_png from '../../../images/redCandy_png.js';
import redCandyBag_png from '../../../images/redCandyBag_png.js';
import tomato_png from '../../../images/tomato_png.js';
import tomatoBag_png from '../../../images/tomatoBag_png.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';

const ShoppingItemData = {

  // Data structures that describe types of Fruit
  Fruit: {

    // NOTE: This instance is representative of 'item data', see assertIsItemData
    APPLES: {
      unitRate: 0.5, // {number} cost per item, in $
      numberOfBags: 3, // {number} number of bags of the item
      quantityPerBag: 5, // {number} quantity in each bag
      singularName: UnitRatesStrings.apple, // {string} name to use for singular quantities (e.g. '1 Apple')
      pluralName: UnitRatesStrings.apples, // {string} name to use for plural quantities (e.g. '2 Apples')
      itemImage: apple_png, // {HTMLImageElement} image for individual items
      itemRowOverlap: 7, // {number} for tweaking how items overlap when stacked, specific to itemImage
      bagImage: appleBag_png, // {HTMLImageElement} image for a bag of items

      // {number[][]} Number of items (or pounds, for Candy) for each question, grouped into 'question sets'.
      // See 'Unit Rates & Challenge Prompts' table in design document.
      // ShoppingQuestionFactory takes these values and creates ShoppingQuestion instances.
      questionQuantities: [
        [ 10, 6, 8 ],
        [ 10, 14, 13 ],
        [ 15, 9, 7 ],
        [ 15, 4, 9 ]
      ]
    },

    LEMONS: {
      unitRate: 0.25,
      numberOfBags: 3,
      quantityPerBag: 5,
      singularName: UnitRatesStrings.lemon,
      pluralName: UnitRatesStrings.lemons,
      itemImage: lemon_png,
      itemRowOverlap: 5,
      bagImage: lemonBag_png,

      // number of items
      questionQuantities: [
        [ 10, 4, 14 ],
        [ 10, 14, 7 ],
        [ 15, 6, 11 ],
        [ 15, 11, 9 ]
      ]
    },

    ORANGES: {
      unitRate: 0.75,
      numberOfBags: 3,
      quantityPerBag: 5,
      singularName: UnitRatesStrings.orange,
      pluralName: UnitRatesStrings.oranges,
      itemImage: orange_png,
      itemRowOverlap: 5,
      bagImage: orangeBag_png,

      // number of items
      questionQuantities: [
        [ 10, 4, 11 ],
        [ 10, 14, 8 ],
        [ 15, 9, 14 ],
        [ 15, 6, 12 ]
      ]
    },

    PEARS: {
      unitRate: 0.40,
      numberOfBags: 3,
      quantityPerBag: 5,
      singularName: UnitRatesStrings.pear,
      pluralName: UnitRatesStrings.pears,
      itemImage: pear_png,
      itemRowOverlap: 5,
      bagImage: pearBag_png,

      // number of items
      questionQuantities: [
        [ 10, 6, 7 ],
        [ 10, 14, 12 ],
        [ 15, 4, 8 ],
        [ 15, 11, 13 ]
      ]
    }
  },

  // Data structures that describe types of Vegetables
  Vegetable: {

    CARROTS: {
      unitRate: 0.15,
      numberOfBags: 4,
      quantityPerBag: 4,
      singularName: UnitRatesStrings.carrot,
      pluralName: UnitRatesStrings.carrots,
      itemImage: carrot_png,
      itemRowOverlap: 0,
      bagImage: carrotBag_png,

      // number of items
      questionQuantities: [
        [ 9, 19, 21 ],
        [ 15, 25, 23 ],
        [ 6, 21, 36 ],
        [ 14, 18, 28 ]
      ]
    },

    CUCUMBERS: {
      unitRate: 0.22,
      numberOfBags: 4,
      quantityPerBag: 3,
      singularName: UnitRatesStrings.cucumber,
      pluralName: UnitRatesStrings.cucumbers,
      itemImage: cucumber_png,
      itemRowOverlap: 0,
      bagImage: cucumberBag_png,

      // number of items
      questionQuantities: [
        [ 7, 19, 18 ],
        [ 11, 25, 23 ],
        [ 8, 17, 27 ],
        [ 13, 23, 22 ]
      ]
    },

    POTATOES: {
      unitRate: 0.45,
      numberOfBags: 4,
      quantityPerBag: 3,
      singularName: UnitRatesStrings.potato,
      pluralName: UnitRatesStrings.potatoes,
      itemImage: potato_png,
      itemRowOverlap: 0,
      bagImage: potatoBag_png,

      // number of items
      questionQuantities: [
        [ 7, 17, 21 ],
        [ 8, 19, 18 ],
        [ 11, 23, 25 ],
        [ 13, 25, 22 ]
      ]
    },

    TOMATOES: {
      unitRate: 0.3,
      numberOfBags: 4,
      quantityPerBag: 4,
      singularName: UnitRatesStrings.tomato,
      pluralName: UnitRatesStrings.tomatoes,
      itemImage: tomato_png,
      itemRowOverlap: 0,
      bagImage: tomatoBag_png,

      // number of items
      questionQuantities: [
        [ 7, 23, 28 ],
        [ 13, 25, 23 ],
        [ 14, 35, 26 ],
        [ 6, 21, 19 ]
      ]
    }
  },

  // Data structures that describe types of Candy
  Candy: {

    PURPLE_CANDY: {
      unitRate: 5.40,
      numberOfBags: 4,
      quantityPerBag: 0.4,
      singularName: UnitRatesStrings.purpleCandy,
      pluralName: UnitRatesStrings.purpleCandy,
      itemImage: purpleCandy_png,
      itemRowOverlap: 0,
      bagImage: purpleCandyBag_png,

      // pounds
      questionQuantities: [
        [ 0.6, 2.2, 2.4 ],
        [ 1.5, 3.2, 3.1 ],
        [ 0.3, 2.4, 2.3 ],
        [ 1.3, 2.1, 2.5 ]
      ]
    },

    RED_CANDY: {
      unitRate: 3.80,
      numberOfBags: 4,
      quantityPerBag: 0.3,
      singularName: UnitRatesStrings.redCandy,
      pluralName: UnitRatesStrings.redCandy,
      itemImage: redCandy_png,
      itemRowOverlap: 0,
      bagImage: redCandyBag_png,

      // pounds
      questionQuantities: [
        [ 0.4, 2.3, 2 ],
        [ 0.7, 2.1, 2.4 ],
        [ 0.8, 1.7, 1.9 ],
        [ 1.3, 2.4, 2.8 ]
      ]
    },

    GREEN_CANDY: {
      unitRate: 8.20,
      numberOfBags: 4,
      quantityPerBag: 0.3,
      singularName: UnitRatesStrings.greenCandy,
      pluralName: UnitRatesStrings.greenCandy,
      itemImage: greenCandy_png,
      itemRowOverlap: 0,
      bagImage: greenCandyBag_png,

      // pounds
      questionQuantities: [
        [ 0.7, 1.9, 2.2 ],
        [ 1.3, 2.5, 2.4 ],
        [ 0.4, 1.8, 1.9 ],
        [ 1.5, 2.1, 1.8 ]
      ]
    },

    BLUE_CANDY: {
      unitRate: 1.30,
      numberOfBags: 4,
      quantityPerBag: 0.4,
      singularName: UnitRatesStrings.blueCandy,
      pluralName: UnitRatesStrings.blueCandy,
      itemImage: blueCandy_png,
      itemRowOverlap: 0,
      bagImage: blueCandyBag_png,

      // pounds
      questionQuantities: [
        [ 0.3, 1.9, 3.2 ],
        [ 0.7, 2.2, 2.3 ],
        [ 1.3, 2.6, 2.4 ],
        [ 1.4, 2.8, 2.9 ]
      ]
    }
  },

  /**
   * Verifies that an object has all of the properties required to be considered 'item data' (duck typing).
   * Verification occurs only when assertions are enabled. The first missing property causes an assertion failure.
   * @param {*} itemData
   */
  assertIsItemData: itemData => {

    // Instead of keeping a separate list of property names, assume that the APPLES instance is representative.
    const keys = _.keys( ShoppingItemData.Fruit.APPLES );

    keys.forEach( key => assert && assert( _.has( itemData, key ), `missing property: ${key}` ) );
  }
};

unitRates.register( 'ShoppingItemData', ShoppingItemData );

export default ShoppingItemData;