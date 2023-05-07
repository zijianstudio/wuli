// Copyright 2017-2023, University of Colorado Boulder

/**
 * Model of a shopping item.
 * Origin is at the bottom center of the item.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import URMovable from '../../common/model/URMovable.js';
import unitRates from '../../unitRates.js';

export default class ShoppingItem extends URMovable {

  /**
   * @param {string} name - for internal use
   * @param {HTMLImageElement} image - image used by the view to represent this item
   * @param {Object} [options]
   */
  constructor( name, image, options ) {

    options = merge( {
      animationSpeed: 400, // distance/second
      visible: true // {boolean} is the item initially visible?
    }, options );

    super( options );

    // @public (read-only)
    this.name = name;
    this.image = image;

    // @public
    this.visibleProperty = new BooleanProperty( options.visible );
  }

  /**
   * @public
   * @override
   */
  reset() {
    this.visibleProperty.reset();
    super.reset();
  }
}

unitRates.register( 'ShoppingItem', ShoppingItem );