// Copyright 2016-2023, University of Colorado Boulder

/**
 * View for the 'Shopping' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Node } from '../../../../scenery/js/imports.js';
import URConstants from '../../common/URConstants.js';
import KeypadLayer from '../../common/view/KeypadLayer.js';
import unitRates from '../../unitRates.js';
import ShoppingCategoryNode from './ShoppingCategoryNode.js';
import ShoppingCategoryRadioButtonGroup from './ShoppingCategoryRadioButtonGroup.js';
import ShoppingViewProperties from './ShoppingViewProperties.js';

export default class ShoppingScreenView extends ScreenView {

  /**
   * @param {ShoppingModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    options = merge( {

      /**
       * Creates a Node for a category.
       * @param {ShoppingCategory} category
       * @param {Property.<ShoppingCategory>} categoryProperty
       * @param {Bounds2} layoutBounds
       * @param {KeypadLayer} keypadLayer
       * @param {ShoppingViewProperties} viewProperties
       * @returns {Node}
       */
      createCategoryNode: ( category, categoryProperty, layoutBounds, keypadLayer, viewProperties ) =>
        new ShoppingCategoryNode( category, categoryProperty, layoutBounds, keypadLayer, viewProperties )

    }, options );

    super( options );

    // Properties that are specific to the view
    const viewProperties = new ShoppingViewProperties();

    // parent for everything expect the keypad
    const playAreaLayer = new Node();
    this.addChild( playAreaLayer );

    // separate layer for model keypad
    const keypadLayer = new KeypadLayer();
    this.addChild( keypadLayer );

    // create the view for each category
    model.categories.forEach( category => {
      const categoryNode = options.createCategoryNode( category, model.categoryProperty, this.layoutBounds, keypadLayer, viewProperties );
      playAreaLayer.addChild( categoryNode );
    } );

    // Category radio button group
    const categoryRadioButtonGroup = new ShoppingCategoryRadioButtonGroup( model.categories, model.categoryProperty, {
      left: this.layoutBounds.left + URConstants.SCREEN_X_MARGIN,
      bottom: this.layoutBounds.bottom - ( 2 * URConstants.SCREEN_Y_MARGIN )
    } );
    playAreaLayer.addChild( categoryRadioButtonGroup );

    // Reset All button
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        viewProperties.reset();
      },
      right: this.layoutBounds.maxX - URConstants.SCREEN_X_MARGIN,
      bottom: this.layoutBounds.maxY - URConstants.SCREEN_Y_MARGIN
    } );
    playAreaLayer.addChild( resetAllButton );
  }
}

unitRates.register( 'ShoppingScreenView', ShoppingScreenView );