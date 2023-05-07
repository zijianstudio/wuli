// Copyright 2014-2023, University of Colorado Boulder

/**
 * SandwichesScreenView is the view for the 'Sandwiches' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import RPALConstants from '../../common/RPALConstants.js';
import RPALSceneNode, { BeforeAfterNodeOptions } from '../../common/view/RPALSceneNode.js';
import RPALScreenView, { CreateSceneNodeFunction } from '../../common/view/RPALScreenView.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import ReactantsProductsAndLeftoversStrings from '../../ReactantsProductsAndLeftoversStrings.js';
import SandwichesModel from '../model/SandwichesModel.js';
import SandwichesEquationNode from './SandwichesEquationNode.js';
import SandwichNode from './SandwichNode.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { CreateEquationNodeFunction } from '../../common/view/ReactionBarNode.js';
import SandwichRecipe from '../model/SandwichRecipe.js';

export default class SandwichesScreenView extends RPALScreenView<SandwichRecipe> {

  public constructor( model: SandwichesModel, tandem: Tandem ) {

    // compute the size of the largest sandwich, used for view layout
    const maxCoefficient = RPALConstants.SANDWICH_COEFFICIENT_RANGE.max;
    const maxSandwich = new SandwichNode( maxCoefficient, maxCoefficient, maxCoefficient );
    const maxSandwichSize = new Dimension2( maxSandwich.width, maxSandwich.height );

    // Creates an equation for a specified reaction.
    const createEquationNode: CreateEquationNodeFunction<SandwichRecipe> =
      ( reaction, visibleProperty ) => new SandwichesEquationNode( reaction, maxSandwichSize, visibleProperty );

    // Creates the user interface for a specified reaction.
    const createSceneNode: CreateSceneNodeFunction =
      ( reaction, beforeExpandedProperty, afterExpandedProperty, options ) =>
        new RPALSceneNode( reaction, beforeExpandedProperty, afterExpandedProperty,
          combineOptions<BeforeAfterNodeOptions>( {
            contentSize: RPALConstants.SANDWICHES_BEFORE_AFTER_BOX_SIZE,
            showSymbols: false,
            beforeTitleProperty: ReactantsProductsAndLeftoversStrings.beforeSandwichStringProperty,
            afterTitleProperty: ReactantsProductsAndLeftoversStrings.afterSandwichStringProperty,
            minIconSize: maxSandwichSize,
            boxYMargin: 8 // large enough to accommodate the biggest sandwich
          }, options ) );

    super( model, createEquationNode, createSceneNode, tandem );
  }
}

reactantsProductsAndLeftovers.register( 'SandwichesScreenView', SandwichesScreenView );