// Copyright 2016-2023, University of Colorado Boulder

/**
 * Radio button group for selecting a category of items in the 'Shopping' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import { Image } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import URColors from '../../common/URColors.js';
import unitRates from '../../unitRates.js';

export default class ShoppingCategoryRadioButtonGroup extends RectangularRadioButtonGroup {

  /**
   * @param {ShoppingCategory[]} categories
   * @param {Property.<ShoppingCategory>} categoryProperty
   * @param {Object} [options]
   */
  constructor( categories, categoryProperty, options ) {

    options = merge( {

      // RectangularRadioButtonGroup options
      orientation: 'horizontal',
      spacing: 12,
      radioButtonOptions: {
        baseColor: URColors.categoryButton,
        xMargin: 5,
        yMargin: 5
      }
    }, options );

    // describe a radio button for each category
    const contentArray = [];
    categories.forEach( category => {
      contentArray.push( {
        value: category,
        createNode: () => new Image( category.image, { scale: 0.5 } )
      } );
    } );

    super( categoryProperty, contentArray, options );
  }
}

unitRates.register( 'ShoppingCategoryRadioButtonGroup', ShoppingCategoryRadioButtonGroup );