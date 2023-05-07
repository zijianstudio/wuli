// Copyright 2017-2023, University of Colorado Boulder

/**
 * View components that are specific to a category in the 'Shopping Lab' screen.
 * Since the Shopping Lab only has 1 scene per category, this is simply a parent node that controls visibility of that scene.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Node } from '../../../../scenery/js/imports.js';
import unitRates from '../../unitRates.js';
import ShoppingLabSceneNode from './ShoppingLabSceneNode.js';

export default class ShoppingLabCategoryNode extends Node {

  /**
   * @param {ShoppingCategory} category
   * @param {Property.<ShoppingCategory>} categoryProperty
   * @param {Bounds2} layoutBounds
   * @param {KeypadLayer} keypadLayer
   * @param {ShoppingViewProperties} viewProperties
   * @param {Object} [options]
   */
  constructor( category, categoryProperty, layoutBounds, keypadLayer, viewProperties, options ) {

    super();

    // parent for stuff that's specific to a scene, to maintain rendering order
    assert && assert( category.shoppingScenes.length === 1, 'Shopping Lab screen supports 1 scene per category' );
    const shoppingSceneNode = new ShoppingLabSceneNode( category.shoppingScenes[ 0 ], layoutBounds, keypadLayer, viewProperties );
    this.addChild( shoppingSceneNode );

    this.mutate( options );

    // Show this category when it's selected.
    const categoryObserver = newCategory => {
      this.visible = ( newCategory === category );
    };
    categoryProperty.link( categoryObserver ); // unlink in dispose

    // @private
    this.disposeShoppingLabCategoryNode = () => {
      categoryProperty.unlink( categoryObserver );
      shoppingSceneNode.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeShoppingLabCategoryNode();
    super.dispose();
  }
}

unitRates.register( 'ShoppingLabCategoryNode', ShoppingLabCategoryNode );