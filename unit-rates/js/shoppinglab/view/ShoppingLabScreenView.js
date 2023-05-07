// Copyright 2016-2023, University of Colorado Boulder

/**
 * View for the 'Shopping Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import ShoppingScreenView from '../../shopping/view/ShoppingScreenView.js';
import unitRates from '../../unitRates.js';
import ShoppingLabCategoryNode from './ShoppingLabCategoryNode.js';

export default class ShoppingLabScreenView extends ShoppingScreenView {

  /**
   * @param {ShoppingLabModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    options = merge( {

      // Creates a Node for a category. See ShoppingScreenView options.createCategoryNode
      createCategoryNode: ( category, categoryProperty, layoutBounds, keypadLayer, viewProperties ) =>
        new ShoppingLabCategoryNode( category, categoryProperty, layoutBounds, keypadLayer, viewProperties )

    }, options );

    super( model, options );
  }
}

unitRates.register( 'ShoppingLabScreenView', ShoppingLabScreenView );