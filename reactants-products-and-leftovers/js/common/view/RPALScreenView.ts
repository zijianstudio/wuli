// Copyright 2014-2023, University of Colorado Boulder

/**
 * RPALScreenView is the base class for the ScreenView for the 'Sandwiches' and 'Molecules' screens.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { Node } from '../../../../scenery/js/imports.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import RPALBaseModel from '../model/RPALBaseModel.js';
import RPALConstants from '../RPALConstants.js';
import ReactionBarNode, { CreateEquationNodeFunction } from './ReactionBarNode.js';
import Reaction from '../model/Reaction.js';
import Property from '../../../../axon/js/Property.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import { BeforeAfterNodeOptions } from './RPALSceneNode.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';

export type CreateSceneNodeFunction = (
  reaction: Reaction,
  beforeExpandedProperty: Property<boolean>,
  afterExpandedProperty: Property<boolean>,
  providedOptions?: BeforeAfterNodeOptions
) => Node;

export default class RPALScreenView<R extends Reaction = Reaction> extends ScreenView {

  /**
   * @param model
   * @param createEquationNode - creates an equation for a specified reaction
   * @param createSceneNode - creates the Before/After boxes for a specified reaction
   * @param tandem
   */
  protected constructor( model: RPALBaseModel<R>,
                         createEquationNode: CreateEquationNodeFunction<R>,
                         createSceneNode: CreateSceneNodeFunction,
                         tandem: Tandem ) {

    super( {
      layoutBounds: RPALConstants.SCREEN_VIEW_LAYOUT_BOUNDS,
      tandem: tandem
    } );

    // Properties that are specific to the view
    const beforeExpandedProperty = new BooleanProperty( true ); // is the Before box expanded?
    const afterExpandedProperty = new BooleanProperty( true ); // is the After box expanded

    // Equation and reaction radio buttons at top of screen
    const reactionBarNode = new ReactionBarNode( model.reactionProperty, model.reactions, createEquationNode, {
      layoutBounds: this.layoutBounds,
      visibleBoundsProperty: this.visibleBoundsProperty,
      top: this.layoutBounds.top,
      tandem: tandem.createTandem( 'reactionBarNode' )
    } );

    // Create a pair of 'Before' and 'After' boxes for each reaction, visible when the reaction is selected.
    const sceneNodesTandem = tandem.createTandem( 'sceneNodes' );
    const beforeAfterNodes = model.reactions.map( reaction => {
      const beforeAfterNodesTandem = sceneNodesTandem.createTandem( `${reaction.tandem.name}SceneNode` );
      return createSceneNode( reaction, beforeExpandedProperty, afterExpandedProperty, {
        visibleProperty: new DerivedProperty( [ model.reactionProperty ], value => ( value === reaction ), {
          tandem: beforeAfterNodesTandem.createTandem( 'visibleProperty' ),
          phetioValueType: BooleanIO
        } ),
        centerX: this.layoutBounds.centerX,
        top: reactionBarNode.bottom + 12, // below the reaction equation
        tandem: beforeAfterNodesTandem
      } );
    } );

    // Reset All button
    const resetAllButton = new ResetAllButton( {
      scale: RPALConstants.RESET_ALL_BUTTON_SCALE,
      right: this.layoutBounds.right - 10,
      bottom: this.layoutBounds.bottom - 10,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        beforeExpandedProperty.reset();
        afterExpandedProperty.reset();
      },
      tandem: tandem.createTandem( 'resetAllButton' )
    } );

    const screenViewRootNode = new Node( {
      children: [ reactionBarNode, ...beforeAfterNodes, resetAllButton ]
    } );
    this.addChild( screenViewRootNode );
  }

  public override dispose(): void {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
    super.dispose();
  }
}

reactantsProductsAndLeftovers.register( 'RPALScreenView', RPALScreenView );