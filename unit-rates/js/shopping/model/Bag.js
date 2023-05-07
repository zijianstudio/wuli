// Copyright 2017-2023, University of Colorado Boulder

/**
 * Model of a bag that contains shopping items.
 * Origin is at the bottom center of the bag.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import URMovable from '../../common/model/URMovable.js';
import unitRates from '../../unitRates.js';

export default class Bag extends URMovable {

  /**
   * @param {string} name - for internal use
   * @param {HTMLImageElement} image - image used by the view to represent this bag
   * @param {Object} [options]
   */
  constructor( name, image, options ) {

    options = merge( {

      visible: true, // {boolean} is the bag initially visible?

      // {ShoppingItem[]|null} items in the bag, null means the bag does not open when placed on the scale
      items: null,

      // URMovable options
      animationSpeed: 400 // distance/second

    }, options );

    super( options );

    // @public (read-only)
    this.name = name;
    this.image = image;
    this.items = options.items;

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

unitRates.register( 'Bag', Bag );