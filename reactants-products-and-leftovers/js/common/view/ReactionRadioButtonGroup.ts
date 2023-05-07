// Copyright 2020-2023, University of Colorado Boulder

/**
 * Radio buttons for selecting a reaction.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text, TextOptions } from '../../../../scenery/js/imports.js';
import AquaRadioButtonGroup, { AquaRadioButtonGroupItem } from '../../../../sun/js/AquaRadioButtonGroup.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import Reaction from '../model/Reaction.js';

export default class ReactionRadioButtonGroup<R extends Reaction = Reaction> extends AquaRadioButtonGroup<R> {

  public constructor( reactionProperty: Property<R>, reactions: R[], tandem: Tandem ) {

    const textOptions = {
      font: new PhetFont( 16 ),
      fill: 'white',
      maxWidth: 175 // determined empirically
    };

    // Describe radio buttons, one for each reaction.
    const items: AquaRadioButtonGroupItem<R>[] = reactions.map( reaction => {
      const nameProperty = reaction.nameProperty!;
      assert && assert( nameProperty );
      return {
        createNode: tandem => new Text( nameProperty, combineOptions<TextOptions>( {
          tandem: tandem.createTandem( 'text' )
        }, textOptions ) ),
        value: reaction,
        tandemName: `${reaction.tandem.name}RadioButton`
      };
    } );

    super( reactionProperty, items, {

      // AquaRadioButtonGroupOptions
      orientation: 'vertical',
      align: 'left',
      spacing: 10,
      touchAreaXDilation: 10,
      radioButtonOptions: { radius: 8 },
      tandem: tandem
    } );
  }

  public override dispose(): void {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
    super.dispose();
  }
}

reactantsProductsAndLeftovers.register( 'ReactionRadioButtonGroup', ReactionRadioButtonGroup );