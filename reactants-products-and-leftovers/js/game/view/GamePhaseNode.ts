// Copyright 2023, University of Colorado Boulder

/**
 * GamePhaseNode is the base class for a node that shows the view for one phase of the game.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Node, NodeOptions } from '../../../../scenery/js/imports.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import GamePhase from '../model/GamePhase.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PickOptional from '../../../../phet-core/js/types/PickOptional.js';

type SelfOptions = EmptySelfOptions;

type GamePhaseNodeOptions = SelfOptions & PickOptional<NodeOptions, 'children'> & PickRequired<NodeOptions, 'tandem'>;

export default class GamePhaseNode extends Node {

  protected constructor( gamePhase: GamePhase, gamePhaseProperty: EnumerationProperty<GamePhase>, providedOptions: GamePhaseNodeOptions ) {

    const options = optionize<GamePhaseNodeOptions, SelfOptions, NodeOptions>()( {

      // NodeOptions
      visibleProperty: new DerivedProperty( [ gamePhaseProperty ], value => ( value === gamePhase ), {
        tandem: providedOptions.tandem.createTandem( 'visibleProperty' ),
        phetioValueType: BooleanIO,
        hasListenerOrderDependencies: true // TODO: https://github.com/phetsims/reactants-products-and-leftovers/issues/85
      } )
    }, providedOptions );

    super( options );
  }

  public override dispose(): void {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
    super.dispose();
  }
}

reactantsProductsAndLeftovers.register( 'GamePhaseNode', GamePhaseNode );