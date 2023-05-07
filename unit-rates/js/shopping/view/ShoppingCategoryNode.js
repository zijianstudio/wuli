// Copyright 2016-2023, University of Colorado Boulder

/**
 * View components that are specific to a category in the 'Shopping' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Node } from '../../../../scenery/js/imports.js';
import URConstants from '../../common/URConstants.js';
import unitRates from '../../unitRates.js';
import ShoppingSceneComboBox from './ShoppingSceneComboBox.js';
import ShoppingSceneNode from './ShoppingSceneNode.js';

export default class ShoppingCategoryNode extends Node {

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
    let shoppingSceneNode = null; // created below
    const shoppingSceneParent = new Node();
    this.addChild( shoppingSceneParent );

    // combo box, for selecting a scene, dispose required
    const comboBox = new ShoppingSceneComboBox( category.shoppingSceneProperty, category.shoppingScenes, this, {
      left: layoutBounds.left + URConstants.SCREEN_X_MARGIN,
      bottom: layoutBounds.bottom - 80
    } );
    this.addChild( comboBox );

    this.mutate( options );

    // Show this category when it's selected.
    const categoryObserver = newCategory => {
      this.visible = ( newCategory === category );
    };
    categoryProperty.link( categoryObserver ); // unlink in dispose

    // When the selected scene changes, replace the UI elements that are item-specific
    const shoppingSceneObserver = shoppingScene => {

      // remove the old scene
      if ( shoppingSceneNode ) {
        shoppingSceneNode.interruptSubtreeInput(); // cancel drags that are in progress
        shoppingSceneParent.removeChild( shoppingSceneNode );
        shoppingSceneNode.dispose();
      }

      // add the new scene
      shoppingSceneNode = new ShoppingSceneNode( shoppingScene, layoutBounds, keypadLayer, viewProperties );
      shoppingSceneParent.addChild( shoppingSceneNode );
    };
    category.shoppingSceneProperty.link( shoppingSceneObserver ); // unlink in dispose

    // @private
    this.disposeShoppingCategoryNode = () => {
      comboBox.dispose();
      categoryProperty.unlink( categoryObserver );
      category.shoppingSceneProperty.unlink( shoppingSceneObserver );
      shoppingSceneNode.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeShoppingCategoryNode();
    super.dispose();
  }
}

unitRates.register( 'ShoppingCategoryNode', ShoppingCategoryNode );