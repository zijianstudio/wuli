// Copyright 2017-2023, University of Colorado Boulder

/**
 * The fruit scene in the Shopping screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import unitRates from '../../unitRates.js';
import ShoppingItemData from './ShoppingItemData.js';
import ShoppingScene from './ShoppingScene.js';

export default class FruitScene extends ShoppingScene {

  /**
   * @param {Object} itemData - data structure that describes a type of vegetable, see ShoppingItemData
   * @param {Object} [options]
   */
  constructor( itemData, options ) {

    assert && assert( _.includes( _.values( ShoppingItemData.Fruit ), itemData ), 'itemData is not a fruit' );

    options = merge( {

      // Fruit bags open when placed on the scale
      bagsOpen: true
    }, options );

    super( itemData, options );
  }
}

unitRates.register( 'FruitScene', FruitScene );