// Copyright 2016-2023, University of Colorado Boulder

/**
 * The candy scene in the Shopping screen.
 * Candy differs significantly from other item types, as described by the ShoppingScene constructor options.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import URUtils from '../../common/URUtils.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
import ShoppingItemData from './ShoppingItemData.js';
import ShoppingScene from './ShoppingScene.js';

export default class CandyScene extends ShoppingScene {

  /**
   * @param {Object} itemData - data structure that describes a type of candy, see ShoppingItemData
   * @param {Object} [options]
   */
  constructor( itemData, options ) {

    assert && assert( _.includes( _.values( ShoppingItemData.Candy ), itemData ), 'itemData is not a candy' );

    options = merge( {

      // range of denominator, in pounds
      fixedAxisRange: new Range( 0, 1.6 ),

      // Candy quantity is in pounds
      quantitySingularUnits: UnitRatesStrings.pound,
      quantityPluralUnits: UnitRatesStrings.pounds,

      // Candy questions require capitalization of 'Pounds', e.g. 'Pounds for $10.50?'
      // This hack was required by https://github.com/phetsims/unit-rates/issues/20
      amountOfQuestionUnits: UnitRatesStrings.poundsCapitalized,

      // {*|null} nest options for the rate's denominator, defaults provided below
      denominatorOptions: null,

      // Scale displays quantity in 'lbs' for Candy
      scaleQuantityIsDisplayed: true,
      scaleQuantityUnits: UnitRatesStrings.lbs,

      // Major markers have 1 decimal place in the denominator
      isMajorMarker: ( numerator, denominator ) => ( URUtils.decimalPlaces( denominator ) <= 1 )

    }, options );

    options.denominatorOptions = merge( {
      axisLabel: UnitRatesStrings.pounds
    }, options.denominatorOptions );

    super( itemData, options );
  }
}

unitRates.register( 'CandyScene', CandyScene );