// Copyright 2014-2023, University of Colorado Boulder

/**
 * MoleculesScreenView is the view for the 'Molecules' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import RPALConstants from '../../common/RPALConstants.js';
import RPALSceneNode, { BeforeAfterNodeOptions } from '../../common/view/RPALSceneNode.js';
import MoleculesEquationNode from '../../common/view/MoleculesEquationNode.js';
import RPALScreenView, { CreateSceneNodeFunction } from '../../common/view/RPALScreenView.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import MoleculesModel from '../model/MoleculesModel.js';
import { CreateEquationNodeFunction } from '../../common/view/ReactionBarNode.js';

export default class MoleculesScreenView extends RPALScreenView {

  public constructor( model: MoleculesModel, tandem: Tandem ) {

    // Creates an equation for a specified reaction.
    const createEquationNode: CreateEquationNodeFunction =
      ( reaction, visibleProperty ) => new MoleculesEquationNode( reaction, {
        visibleProperty: visibleProperty
      } );

    // Creates the user interface for a specified reaction.
    const createSceneNode: CreateSceneNodeFunction =
      ( reaction, beforeExpandedProperty, afterExpandedProperty, options ) =>
        new RPALSceneNode( reaction, beforeExpandedProperty, afterExpandedProperty,
          combineOptions<BeforeAfterNodeOptions>( {
            contentSize: RPALConstants.MOLECULES_BEFORE_AFTER_BOX_SIZE,
            minIconSize: new Dimension2( 30, 25 ) // eyeballed
          }, options ) );

    super( model, createEquationNode, createSceneNode, tandem );
  }
}

reactantsProductsAndLeftovers.register( 'MoleculesScreenView', MoleculesScreenView );