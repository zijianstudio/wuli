// Copyright 2014-2023, University of Colorado Boulder

/**
 * StackNode is a vertical stack of Substances, built from the bottom up. The maximum number of Nodes in the stack
 * are created eagerly. The visibility of Nodes is then adjusted to show the correct quantity of the substance.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import { Node, NodeOptions, NodeTranslationOptions } from '../../../../scenery/js/imports.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import SubstanceIcon from './SubstanceIcon.js';
import RPALConstants from '../RPALConstants.js';

type SelfOptions = EmptySelfOptions;

type StackNodeOptions = SelfOptions & NodeTranslationOptions;

export default class StackNode extends Node {

  private readonly disposeStackNode: () => void;

  /**
   * @param height - height of the stack
   * @param iconProperty - the icon to display
   * @param quantityProperty - the number of nodes to display
   * @param startCenterY - the centerY of the bottom node in the stack
   * @param deltaY - the vertical spacing between nodes in the stack
   * @param [providedOptions]
   */
  public constructor( height: number, iconProperty: TReadOnlyProperty<Node>, quantityProperty: TReadOnlyProperty<number>,
                      startCenterY: number, deltaY: number, providedOptions?: StackNodeOptions ) {

    const options = optionize<StackNodeOptions, SelfOptions, NodeOptions>()( {}, providedOptions );

    // Eagerly create the maximum number of Nodes in the stack, positioned from the bottom up.
    const icons: SubstanceIcon[] = [];
    for ( let i = 0; i < RPALConstants.QUANTITY_RANGE.max; i++ ) {
      icons.push( new SubstanceIcon( iconProperty, {
        centerX: 0,
        centerY: startCenterY - ( i * deltaY )
      } ) );
    }

    // Make the proper number of Nodes visible in the stack, from the bottom up.
    const quantityPropertyObserver = ( quantity: number ) => {
      assert && assert( RPALConstants.QUANTITY_RANGE.contains( quantity ) );
      for ( let i = 0; i < icons.length; i++ ) {
        icons[ i ].visible = ( i < quantity );
      }
    };
    quantityProperty.link( quantityPropertyObserver ); // must be unlinked in dispose

    options.children = icons;

    super( options );

    this.disposeStackNode = () => {
      icons.forEach( icon => icon.dispose() );
      icons.length = 0;
      if ( quantityProperty.hasListener( quantityPropertyObserver ) ) {
        quantityProperty.unlink( quantityPropertyObserver );
      }
    };
  }

  public override dispose(): void {
    this.disposeStackNode();
    super.dispose();
  }
}

reactantsProductsAndLeftovers.register( 'StackNode', StackNode );