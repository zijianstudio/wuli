// Copyright 2014-2023, University of Colorado Boulder

/**
 * ReactionBarNode is the horizontal bar that appears at the top of the screen. It contains radio buttons for selecting
 * a reaction, and displays the selected reaction's equation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { Node, NodeOptions, NodeTranslationOptions, Rectangle } from '../../../../scenery/js/imports.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import Reaction from '../model/Reaction.js';
import RPALColors from '../RPALColors.js';
import ReactionRadioButtonGroup from './ReactionRadioButtonGroup.js';

const X_MARGIN = 20;
const Y_MARGIN = 10;

export type CreateEquationNodeFunction<R extends Reaction = Reaction> =
  ( reaction: R, visibleProperty: TReadOnlyProperty<boolean> ) => Node;

type SelfOptions = {
  layoutBounds: Bounds2;
  visibleBoundsProperty: TReadOnlyProperty<Bounds2>;
};

type ReactionBarNodeOptions = SelfOptions & NodeTranslationOptions & PickRequired<NodeOptions, 'tandem'>;

export default class ReactionBarNode<R extends Reaction = Reaction> extends Node {

  public constructor( reactionProperty: Property<R>, reactions: R[],
                      createEquationNode: CreateEquationNodeFunction<R>, providedOptions: ReactionBarNodeOptions ) {

    const options = optionize<ReactionBarNodeOptions, SelfOptions, NodeOptions>()( {}, providedOptions );

    // radio buttons for choosing a reaction
    const radioButtonGroup = new ReactionRadioButtonGroup( reactionProperty, reactions,
      options.tandem.createTandem( 'radioButtonGroup' ) );

    // The horizontal bar, sized to fit the width of the browser window.
    const barNode = new Rectangle( 0, 0, 0, 1, {
      fill: RPALColors.STATUS_BAR_FILL
    } );
    options.visibleBoundsProperty.link( visibleBounds => {
      barNode.setRect( visibleBounds.left, 0, visibleBounds.width, radioButtonGroup.height + ( 2 * Y_MARGIN ) );
    } );

    // radio buttons at right, vertically centered in the bar
    radioButtonGroup.boundsProperty.link( bounds => {
      radioButtonGroup.right = options.layoutBounds.right - X_MARGIN;
      radioButtonGroup.centerY = barNode.centerY;
    } );

    const reactionEquations = reactions.map( reaction => {

      const visibleProperty = new DerivedProperty( [ reactionProperty ], value => value === reaction );

      const equationNode = createEquationNode( reaction, visibleProperty );

      // center the equation in the space to the left of the radio buttons
      radioButtonGroup.boundsProperty.link( () => {
        const availableWidth = radioButtonGroup.left - X_MARGIN;
        equationNode.centerX = X_MARGIN + ( availableWidth / 2 );
        equationNode.centerY = barNode.centerY;
      } );

      return equationNode;
    } );

    options.children = [ barNode, radioButtonGroup, ...reactionEquations ];

    super( options );
  }

  public override dispose(): void {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
    super.dispose();
  }
}

reactantsProductsAndLeftovers.register( 'ReactionBarNode', ReactionBarNode );