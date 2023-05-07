// Copyright 2016-2023, University of Colorado Boulder

/**
 * View components that are specific to a scene in the 'Shopping' screen.
 * Adds a Questions accordion box to the base type.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import URConstants from '../../common/URConstants.js';
import unitRates from '../../unitRates.js';
import BaseShoppingSceneNode from './BaseShoppingSceneNode.js';
import ShoppingQuestionsAccordionBox from './ShoppingQuestionsAccordionBox.js';

export default class ShoppingSceneNode extends BaseShoppingSceneNode {

  /**
   * @param {ShoppingScene} shoppingScene
   * @param {Bounds2} layoutBounds
   * @param {KeypadLayer} keypadLayer
   * @param {ShoppingViewProperties} viewProperties
   * @param {Object} [options]
   */
  constructor( shoppingScene, layoutBounds, keypadLayer, viewProperties, options ) {

    super( shoppingScene, layoutBounds, keypadLayer, viewProperties, options );

    // Questions, dispose required
    const questionsAccordionBox = new ShoppingQuestionsAccordionBox( shoppingScene, keypadLayer, {
      expandedProperty: viewProperties.questionsExpandedProperty,
      right: layoutBounds.right - URConstants.SCREEN_X_MARGIN,
      top: this.doubleNumberLineAccordionBox.bottom + 10
    } );
    this.addChild( questionsAccordionBox );
    questionsAccordionBox.moveToBack();

    // @private
    this.disposeShoppingSceneNode = () => {
      questionsAccordionBox.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeShoppingSceneNode();
    super.dispose();
  }
}

unitRates.register( 'ShoppingSceneNode', ShoppingSceneNode );